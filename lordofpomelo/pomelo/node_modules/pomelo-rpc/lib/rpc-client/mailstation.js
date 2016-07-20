var util = require('util');
var utils = require('../util/utils');
var constants = require('../util/constants');
var defaultMailboxFactory = require('./mailbox');
var blackhole = require('./mailboxes/blackhole');
var EventEmitter = require('events').EventEmitter;
var logger = require('pomelo-logger').getLogger('pomelo-rpc', __filename);

var STATE_INITED  = 1;    // station has inited
var STATE_STARTED  = 2;   // station has started
var STATE_CLOSED  = 3;    // station has closed

/**
 * Mail station constructor.
 *
 * @param {Object} opts construct parameters
 */
var MailStation = function(opts) {
  EventEmitter.call(this);
  this.opts = opts;
  this.servers = {};    // remote server info map, key: server id, value: info
  this.serversMap = {}; // remote server info map, key: serverType, value: servers array
  this.onlines = {};    // remote server online map, key: server id, value: 0/offline 1/online
  this.mailboxFactory = opts.mailboxFactory || defaultMailboxFactory;

  // filters
  this.befores = [];
  this.afters = [];

  // pending request queues
  this.pendings = {};
  this.pendingSize = opts.pendingSize || constants.DEFAULT_PARAM.DEFAULT_PENDING_SIZE;

  // connecting remote server mailbox map
  this.connecting = {};

  // working mailbox map
  this.mailboxes = {};

  this.state = STATE_INITED;
};
util.inherits(MailStation, EventEmitter);

var pro = MailStation.prototype;

/**
 * Init and start station. Connect all mailbox to remote servers.
 *
 * @param  {Function} cb(err) callback function
 * @return {Void}
 */
pro.start = function(cb) {
  if(this.state > STATE_INITED) {
    utils.invokeCallback(cb, new Error('station has started.'));
    return;
  }

  var self = this;
  process.nextTick(function() {
    self.state = STATE_STARTED;
    utils.invokeCallback(cb);
  });
};

/**
 * Stop station and all its mailboxes
 *
 * @param  {Boolean} force whether stop station forcely
 * @return {Void}
 */
pro.stop = function(force) {
  if(this.state !== STATE_STARTED) {
    logger.warn('[pomelo-rpc] client is not running now.');
    return;
  }
  this.state = STATE_CLOSED;

  var self = this;
  function closeAll() {
    for(var id in self.mailboxes) {
      self.mailboxes[id].close();
    }
  }
  if(force) {
    closeAll();
  } else {
    setTimeout(closeAll, constants.DEFAULT_PARAM.GRACE_TIMEOUT);
  }
};

/**
 * Add a new server info into the mail station and clear
 * the blackhole associated with the server id if any before.
 *
 * @param {Object} serverInfo server info such as {id, host, port}
 */
pro.addServer = function(serverInfo) {
  if(!serverInfo || !serverInfo.id) {
    return;
  }

  var id = serverInfo.id;
  var type = serverInfo.serverType;
  this.servers[id] = serverInfo;
  this.onlines[id] = 1;

  if(!this.serversMap[type]) {
    this.serversMap[type] = [];
  }
  this.serversMap[type].push(id);
  this.emit('addServer', id);
};

/**
 * Batch version for add new server info.
 *
 * @param {Array} serverInfos server info list
 */
pro.addServers = function(serverInfos) {
  if(!serverInfos || !serverInfos.length) {
    return;
  }

  for(var i=0, l=serverInfos.length; i<l; i++) {
    this.addServer(serverInfos[i]);
  }
};

/**
 * Remove a server info from the mail station and remove
 * the mailbox instance associated with the server id.
 *
 * @param  {String|Number} id server id
 */
pro.removeServer = function(id) {
  this.onlines[id] = 0;
  var mailbox = this.mailboxes[id];
  if(mailbox) {
    mailbox.close();
    delete this.mailboxes[id];
  }
  this.emit('removeServer', id);
};

/**
 * Batch version for remove remote servers.
 *
 * @param  {Array} ids server id list
 */
pro.removeServers = function(ids) {
  if(!ids || !ids.length) {
    return;
  }

  for(var i=0, l=ids.length; i<l; i++) {
    this.removeServer(ids[i]);
  }
};

/**
 * Clear station infomation.
 *
 */
pro.clearStation = function() {
  this.onlines = {};
  this.serversMap = {};
}

/**
 * Replace remote servers info.
 *
 * @param {Array} serverInfos server info list
 */
pro.replaceServers = function(serverInfos) {
  this.clearStation();
  if(!serverInfos || !serverInfos.length) {
    return;
  }

  for(var i=0, l=serverInfos.length; i<l; i++) {
    var id = serverInfos[i].id;
    var type = serverInfos[i].serverType;
    this.onlines[id] = 1;
    if(!this.serversMap[type]) {
      this.serversMap[type] = [];
    }
    this.servers[id] = serverInfos[i];
    this.serversMap[type].push(id);
  }
};

/**
 * Dispatch rpc message to the mailbox
 *
 * @param  {Object}   tracer   rpc debug tracer
 * @param  {String}   serverId remote server id
 * @param  {Object}   msg      rpc invoke message
 * @param  {Object}   opts     rpc invoke option args
 * @param  {Function} cb       callback function
 * @return {Void}
 */
pro.dispatch = function(tracer, serverId, msg, opts, cb) {
  tracer.info('client', __filename, 'dispatch', 'dispatch rpc message to the mailbox');
  tracer.cb = cb;
  if(this.state !== STATE_STARTED) {
    tracer.error('client', __filename, 'dispatch', 'client is not running now');
    logger.error('[pomelo-rpc] client is not running now.');
    this.emit('error', constants.RPC_ERROR.SERVER_NOT_STARTED, tracer, serverId, msg, opts);
    return;
  }

  var self = this;
  var mailbox = this.mailboxes[serverId];
  if(!mailbox) {
    tracer.debug('client', __filename, 'dispatch', 'mailbox is not exist');
    // try to connect remote server if mailbox instance not exist yet
    if(!lazyConnect(tracer, this, serverId, this.mailboxFactory, cb)) {
      tracer.error('client', __filename, 'dispatch', 'fail to find remote server:' + serverId);
      logger.error('[pomelo-rpc] fail to find remote server:' + serverId);
      self.emit('error', constants.RPC_ERROR.NO_TRAGET_SERVER, tracer, serverId, msg, opts);
    }
    // push request to the pending queue
    addToPending(tracer, this, serverId, Array.prototype.slice.call(arguments, 0));
    return;
  }

  if(this.connecting[serverId]) {
    tracer.debug('client', __filename, 'dispatch', 'request add to connecting');
    // if the mailbox is connecting to remote server
    addToPending(tracer, this, serverId, Array.prototype.slice.call(arguments, 0));
    return;
  }

  var send = function(tracer, err, serverId, msg, opts) {
    tracer.info('client', __filename, 'send', 'get corresponding mailbox and try to send message');
    var mailbox = self.mailboxes[serverId];
    if(!!err) {
      errorHandler(tracer, self, err, serverId, msg, opts, true, cb);
      return;
    }
    if(!mailbox) {
      tracer.error('client', __filename, 'send', 'can not find mailbox with id:' + serverId);
      logger.error('[pomelo-rpc] could not find mailbox with id:' + serverId);
      self.emit('error', constants.RPC_ERROR.FAIL_FIND_MAILBOX, tracer, serverId, msg, opts);
      return;
    }
    mailbox.send(tracer, msg, opts, function() {
      var tracer_send = arguments[0];
      var send_err = arguments[1];
      if(!!send_err) {
        logger.error('[pomelo-rpc] fail to send message');
        self.emit('error', constants.RPC_ERROR.FAIL_SEND_MESSAGE, tracer, serverId, msg, opts);
        return;
      }
      var args = Array.prototype.slice.call(arguments, 2);
      doFilter(tracer_send, null, serverId, msg, opts, self.afters, 0, 'after', function(tracer, err, serverId, msg, opts) {
        if(!!err) {
          errorHandler(tracer, self, err, serverId, msg, opts, false, cb);
        }
        utils.applyCallback(cb, args);
      });
    });
  };

  doFilter(tracer, null, serverId, msg, opts, this.befores, 0, 'before', send);
};

/**
 * Add a before filter
 *
 * @param  {[type]} filter [description]
 * @return {[type]}        [description]
 */
pro.before = function(filter) {
  if(Array.isArray(filter)) {
    this.befores = this.befores.concat(filter);
    return;
  }
  this.befores.push(filter);
};

/**
 * Add after filter
 *
 * @param  {[type]} filter [description]
 * @return {[type]}        [description]
 */
pro.after = function(filter) {
  if(Array.isArray(filter)) {
    this.afters = this.afters.concat(filter);
    return;
  }
  this.afters.push(filter);
};

/**
 * Add before and after filter
 *
 * @param  {[type]} filter [description]
 * @return {[type]}        [description]
 */
pro.filter = function(filter) {
  this.befores.push(filter);
  this.afters.push(filter);
};

/**
 * Try to connect to remote server
 *
 * @param  {Object}   tracer   rpc debug tracer
 * @return {String}   serverId remote server id
 * @param  {Function}   cb     callback function
 */
pro.connect = function(tracer, serverId, cb) {
  var self = this;
  var mailbox = self.mailboxes[serverId];
  mailbox.connect(tracer, function(err) {
    if(!!err) {
      tracer.error('client', __filename, 'lazyConnect', 'fail to connect to remote server: ' + serverId);
      logger.error('[pomelo-rpc] mailbox fail to connect to remote server: ' + serverId);
      if(!!self.mailboxes[serverId]) {
        delete self.mailboxes[serverId];
      }
      self.emit('error', constants.RPC_ERROR.FAIL_CONNECT_SERVER, tracer, serverId, null, self.opts);
      return;
    }
    mailbox.on('close', function(id) {
      var mbox = self.mailboxes[id];
      if(!!mbox) {
        mbox.close();
        delete self.mailboxes[id];
      }
      self.emit('close', id);
    });
    delete self.connecting[serverId];
    flushPending(tracer, self, serverId);
  });
};

/**
 * Do before or after filter
 */
var doFilter = function(tracer, err, serverId, msg, opts, filters, index, operate, cb) {
  if(index < filters.length) {
    tracer.info('client', __filename, 'doFilter', 'do ' + operate + ' filter ' + filters[index].name);
  }
  if(index  >= filters.length || !!err) {
    utils.invokeCallback(cb, tracer, err, serverId, msg, opts);
    return;
  }
  var self = this;
  var filter = filters[index];
  if(typeof filter === 'function') {
    filter(serverId, msg, opts, function(target, message, options) {
      index++;
      //compatible for pomelo filter next(err) method
      if(utils.getObjectClass(target) === 'Error') {
        doFilter(tracer, target, serverId, msg, opts, filters, index, operate, cb);
      } else {
        doFilter(tracer, null, target || serverId, message || msg, options || opts, filters, index, operate, cb);
      }
    });
    return;
  }
  if(typeof filter[operate] === 'function') {
    filter[operate](serverId, msg, opts, function(target, message, options) {
      index++;
      if(utils.getObjectClass(target) === 'Error') {
        doFilter(tracer, target, serverId, msg, opts, filters, index, operate, cb);
      } else {
        doFilter(tracer, null, target || serverId, message || msg, options || opts, filters, index, operate, cb);
      }
    });
    return;
  }
  index++;
  doFilter(tracer, err, serverId, msg, opts, filters, index, operate, cb);
};

var lazyConnect = function(tracer, station, serverId, factory, cb) {
  tracer.info('client', __filename, 'lazyConnect', 'create mailbox and try to connect to remote server');
  var server = station.servers[serverId];
  var online = station.onlines[serverId];
  if(!server) {
    logger.error('[pomelo-rpc] unknown server: %s', serverId);
    return false;
  }
  if(!online || online !== 1) {
    logger.error('[pomelo-rpc] server is not online: %s', serverId);
  }
  var mailbox = factory.create(server, station.opts);
  station.connecting[serverId] = true;
  station.mailboxes[serverId] = mailbox;
  station.connect(tracer, serverId, cb);
  return true;
};

var addToPending = function(tracer, station, serverId, args) {
  tracer.info('client', __filename, 'addToPending', 'add pending requests to pending queue');
  var pending = station.pendings[serverId];
  if(!pending) {
    pending = station.pendings[serverId] = [];
  }
  if(pending.length > station.pendingSize) {
    tracer.debug('client', __filename, 'addToPending', 'station pending too much for: ' + serverId);
    logger.warn('[pomelo-rpc] station pending too much for: %s',  serverId);
    return;
  }
  pending.push(args);
};

var flushPending = function(tracer, station, serverId, cb) {
  tracer.info('client', __filename, 'flushPending', 'flush pending requests to dispatch method');
  var pending = station.pendings[serverId];
  var mailbox = station.mailboxes[serverId];
  if(!pending || !pending.length) {
    return;
  }
  if(!mailbox) {
    tracer.error('client', __filename, 'flushPending', 'fail to flush pending messages for empty mailbox: ' + serverId);
    logger.error('[pomelo-rpc] fail to flush pending messages for empty mailbox: ' + serverId);
  }
  for(var i=0, l=pending.length; i<l; i++) {
    station.dispatch.apply(station, pending[i]);
  }
  delete station.pendings[serverId];
};

var errorHandler = function(tracer, station, err, serverId, msg, opts, flag, cb) {
  if(!!station.handleError) {
    station.handleError(err, serverId, msg, opts);
  } else {
    logger.error('[pomelo-rpc] rpc filter error with serverId: %s, err: %j', serverId, err.stack);
    station.emit('error', constants.RPC_ERROR.FILTER_ERROR, tracer, serverId, msg, opts);
  }
};

/**
 * Mail station factory function.
 *
 * @param  {Object} opts construct paramters
 *           opts.servers {Object} global server info map. {serverType: [{id, host, port, ...}, ...]}
 *           opts.mailboxFactory {Function} mailbox factory function
 * @return {Object}      mail station instance
 */
module.exports.create = function(opts) {
  return new MailStation(opts || {});
};

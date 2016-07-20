var EventEmitter = require('events').EventEmitter;
var util = require('util');
var utils = require('../../util/utils');
var sio = require('socket.io');
var logger = require('pomelo-logger').getLogger('pomelo-rpc', __filename);
var Tracer = require('../../util/tracer');

var Acceptor = function(opts, cb){
  EventEmitter.call(this);
  this.bufferMsg = opts.bufferMsg;
  this.interval = opts.interval;  // flush interval in ms
  this.rpcDebugLog = opts.rpcDebugLog;
  this.rpcLogger = opts.rpcLogger;
  this.whitelist = opts.whitelist;
  this._interval = null;          // interval object
  this.sockets = {};
  this.msgQueues = {};
  this.cb = cb;
};
util.inherits(Acceptor, EventEmitter);

var pro = Acceptor.prototype;

pro.listen = function(port) {
  //check status
  if(!!this.inited) {
    utils.invokeCallback(this.cb, new Error('already inited.'));
    return;
  }
  this.inited = true;

  var self = this;

  this.server = sio.listen(port);

  this.server.set('log level', 0);

  this.server.server.on('error', function(err) {
    logger.error('rpc server is error: %j', err.stack);
    self.emit('error', err);
  });

  this.server.sockets.on('connection', function(socket) {
    self.sockets[socket.id] = socket;

    self.emit('connection', {id: socket.id, ip: socket.handshake.address.address});

    socket.on('message', function(pkg) {
      try {
        if(pkg instanceof Array) {
          processMsgs(socket, self, pkg);
        } else {
          processMsg(socket, self, pkg);
        }
      } catch(e) {
        // socke.io would broken if uncaugth the exception
        logger.error('rpc server process message error: %j', e.stack);
      }
    });

    socket.on('disconnect', function(reason) {
      delete self.sockets[socket.id];
      delete self.msgQueues[socket.id];
    });
  });

  this.on('connection', ipFilter.bind(this));

  if(this.bufferMsg) {
    this._interval = setInterval(function() {
      flush(self);
    }, this.interval);
  }
};

var ipFilter = function(obj) {
  if(typeof this.whitelist === 'function') {
    var self = this;
    self.whitelist(function(err, tmpList) {
      if(err) {
        logger.error('%j.(RPC whitelist).', err);
        return;
      }
      if(!Array.isArray(tmpList)) {
        logger.error('%j is not an array.(RPC whitelist).', tmpList);
        return;
      }
      if(!!obj && !!obj.ip && !!obj.id) {
        for(var i in tmpList) {
          var exp = new RegExp(tmpList[i]);
          if(exp.test(obj.ip)) {
            return;
          }
        }
        var sock = self.sockets[obj.id];
        if(sock) {
          sock.disconnect('unauthorized');
          logger.warn('%s is rejected(RPC whitelist).', obj.ip);
        }
      }
    });
  }
};

pro.close = function() {
  if(!!this.closed) {
    return;
  }
  this.closed = true;
  if(this._interval) {
    clearInterval(this._interval);
    this._interval = null;
  }
  try {
    this.server.server.close();
  } catch(err) {
    logger.error('rpc server close error: %j', err.stack);
  }
  this.emit('closed');
};

var cloneError = function(origin) {
  // copy the stack infos for Error instance json result is empty
  var res = {
    msg: origin.msg,
    stack: origin.stack
  };
  return res;
};

var processMsg = function(socket, acceptor, pkg) {
  var tracer = new Tracer(acceptor.rpcLogger, acceptor.rpcDebugLog, pkg.remote, pkg.source, pkg.msg, pkg.traceId, pkg.seqId);
  tracer.info('server', __filename, 'processMsg', 'ws-acceptor receive message and try to process message');
  acceptor.cb.call(null, tracer, pkg.msg, function() {
    var args = Array.prototype.slice.call(arguments, 0);
    for(var i=0, l=args.length; i<l; i++) {
      if(args[i] instanceof Error) {
        args[i] = cloneError(args[i]);
      }
    }
    var resp;
    if(tracer.isEnabled) {
      resp = {traceId: tracer.id, seqId: tracer.seq, source: tracer.source, id: pkg.id, resp: Array.prototype.slice.call(args, 0)};
    }
    else {
      resp = {id: pkg.id, resp: Array.prototype.slice.call(args, 0)};
    }
    if(acceptor.bufferMsg) {
      enqueue(socket, acceptor, resp);
    } else {
      socket.emit('message', resp);
    }
  });
};

var processMsgs = function(socket, acceptor, pkgs) {
  for(var i=0, l=pkgs.length; i<l; i++) {
    processMsg(socket, acceptor, pkgs[i]);
  }
};

var enqueue = function(socket, acceptor, msg) {
  var queue = acceptor.msgQueues[socket.id];
  if(!queue) {
    queue = acceptor.msgQueues[socket.id] = [];
  }
  queue.push(msg);
};

var flush = function(acceptor) {
  var sockets = acceptor.sockets, queues = acceptor.msgQueues, queue, socket;
  for(var socketId in queues) {
    socket = sockets[socketId];
    if(!socket) {
      // clear pending messages if the socket not exist any more
      delete queues[socketId];
      continue;
    }
    queue = queues[socketId];
    if(!queue.length) {
      continue;
    }
    socket.emit('message', queue);
    queues[socketId] = [];
  }
};

/**
 * create acceptor
 *
 * @param opts init params
 * @param cb(tracer, msg, cb) callback function that would be invoked when new message arrives
 */
module.exports.create = function(opts, cb) {
  return new Acceptor(opts || {}, cb);
};

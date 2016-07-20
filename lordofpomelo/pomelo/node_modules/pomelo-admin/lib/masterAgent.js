var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sio = require('socket.io');
var utils = require('./util/utils');
var protocol = require('./util/protocol');
var logger = require('pomelo-logger').getLogger('pomelo-admin', __filename);

var ST_INITED = 1;
var ST_STARTED = 2;
var ST_CLOSED = 3;

/**
 * MasterAgent Constructor
 *
 * @class MasterAgent
 * @constructor
 * @param {Object} opts construct parameter
 *                      opts.consoleService {Object} consoleService
 *                      opts.id {String} server id
 *                      opts.type {String} server type, 'master', 'connector', etc.
 *                      opts.socket {Object} socket-io object
 *                      opts.reqId {Number} reqId add by 1
 *                      opts.callbacks {Object} callbacks
 *                      opts.state {Number} MasterAgent state
 * @api public
 */
var MasterAgent = function(consoleService, opts) {
  EventEmitter.call(this);
  this.consoleService = consoleService;
  this.server = null;
  this.idMap = {};
  this.typeMap = {};
  this.slaveMap = {};
  this.clients = {};
  this.reqId = 1;
  this.callbacks = {};
  this.sockets = {};
  this.whitelist = opts.whitelist;
  this.state = ST_INITED;
};

util.inherits(MasterAgent, EventEmitter);

module.exports = MasterAgent;

var TYPE_CLIENT = 'client';
var TYPE_MONITOR = 'monitor';

/**
 * master listen to a port and handle register and request
 *
 * @param {String} port
 * @api public
 */
MasterAgent.prototype.listen = function(port, cb) {
  if (this.state > ST_INITED) {
    logger.error('master agent has started or closed.');
    return;
  }
  this.state = ST_STARTED;
  this.server = sio.listen(port);
  this.server.set('log level', 0);

  var self = this;
  this.server.server.on('error', function(err) {
    self.emit('error', err);
    utils.invokeCallback(cb, err);
  });

  this.server.server.once('listening', function() {
    setImmediate(function() {
      utils.invokeCallback(cb);
    });
  });

  this.server.sockets.on('connection', function(socket) {
    var id, type, info, registered, username;

    self.sockets[socket.id] = socket;
    self.emit('connection', {id: socket.id, ip: socket.handshake.address.address});

    socket.on('register', function(msg) {
      // register a new connection
      if (msg && msg.type) {
        if (msg.type === TYPE_CLIENT) {
          // client connection not join the map
          type = msg.type;
          id = msg.id;
          info = 'client';
          doAuthUser(msg, socket, self, function(err) {
            if (err){
              socket.disconnect();
              return;
            }
            username = msg.username;
            registered = true;
          });
        } // end of if(msg.type === 'client')
        else if (msg.type === TYPE_MONITOR) {
          if (msg.id) {
            // if is a normal server
            id = msg.id;
            type = msg.serverType;
            info = msg.info;
            doAuthServer(msg, socket, self, function(err) {
              if (err){
                socket.disconnect();
                return;
              }
              registered = true;
            });
          }
        } // end of if(msg.type === 'monitor') 
        else {
          socket.emit('register', {
            code: protocol.PRO_FAIL,
            msg: 'unknown auth master type'
          });
          socket.disconnect();
        }
      }
    }); // end of on 'register'

    // message from monitor
    socket.on('monitor', function(msg) {
      if (!registered) {
        // not register yet, ignore any message
        // kick connections
        socket.disconnect();
        return;
      }

      if (type === TYPE_CLIENT) {
        logger.error('invalid message to monitor, but current connect type is client.');
        return;
      }

      msg = protocol.parse(msg);
      if (msg.respId) {
        // a response from monitor
        var cb = self.callbacks[msg.respId];
        if (!cb) {
          logger.warn('unknown resp id:' + msg.respId);
          return;
        }
        delete self.callbacks[msg.respId];
        utils.invokeCallback(cb, msg.error, msg.body);
        return;
      }

      // a request or a notify from monitor
      self.consoleService.execute(msg.moduleId, 'masterHandler', msg.body, function(err, res) {
        if (protocol.isRequest(msg)) {
          var resp = protocol.composeResponse(msg, err, res);
          if (resp) {
            socket.emit('monitor', resp);
          }
        } else {
          //notify should not have a callback
          logger.warn('notify should not have a callback.');
        }
      });
    }); // end of on 'monitor'

    // message from client
    socket.on('client', function(msg) {
      if (!registered) {
        // not register yet, ignore any message
        // kick connections
        socket.disconnect();
        return;
      }
      if (type !== TYPE_CLIENT) {
        logger.error('invalid message to client, but current connect type is ' + type);
        return;
      }
      msg = protocol.parse(msg);

      if (msg.command) {
        // a command from client
        self.consoleService.command(msg.command, msg.moduleId, msg.body, function(err, res) {
          if (protocol.isRequest(msg)) {
            var resp = protocol.composeResponse(msg, err, res);
            if (resp) {
              socket.emit('client', resp);
            }
          } else {
            //notify should not have a callback
            logger.warn('notify should not have a callback.');
          }
        });
      } else {
        // a request or a notify from client
        // and client should not have any response to master for master would not request anything from client
        self.consoleService.execute(msg.moduleId, 'clientHandler', msg.body, function(err, res) {
          if (protocol.isRequest(msg)) {
            var resp = protocol.composeResponse(msg, err, res);
            if (resp) {
              socket.emit('client', resp);
            }
          } else {
            //notify should not have a callback
            logger.warn('notify should not have a callback.');
          }
        });
      }

    }); // end of on 'client'

    socket.on('reconnect', function(msg, pid) {
      // reconnect a new connection
      if (msg && msg.type) {
        if (msg.id) {
          // if is a normal server
          if (self.idMap[msg.id]) {
            // id has been registered
            socket.emit('reconnect_ok', {
              code: protocol.PRO_FAIL,
              msg: 'id has been registered. id:' + msg.id
            });
            return;
          }
          var record = addConnection(self, msg.id, msg.serverType, msg.pid, msg.info, socket);
          id = msg.id;
          type = msg.serverType;
          registered = true;
          msg.info.pid = pid;
          info = msg.info;
          socket.emit('reconnect_ok', {
            code: protocol.PRO_OK,
            msg: 'ok'
          });
          self.emit('reconnect', msg.info);
        }
      }
    });

    socket.on('disconnect', function() {
      delete self.sockets[socket.id];
      if (registered) {
        removeConnection(self, id, type, info);
        self.emit('disconnect', id, type, info);
      }
      if (type === 'client' && registered) {
        logger.info('client user ' + username + ' exit');
      }
      registered = false;
      id = null;
      type = null;
    });

    socket.on('error', function(err) {
      self.emit('error', err);
    });
  }); // end of on 'connection'

  this.on('connection', ipFilter.bind(this));
}; // end of listen

/**
 * ip filter(ip whitelist)
 *
 * @api private
 */
var ipFilter = function(obj) {
  if(typeof this.whitelist === 'function') {
    var self = this;
    self.whitelist(function(err, tmpList) {
      if(err) {
        logger.error('%j.(pomelo-admin whitelist).', err);
        return;
      }
      if(!Array.isArray(tmpList)) {
        logger.error('%j is not an array.(pomelo-admin whitelist).', tmpList);
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
          logger.error('%s is rejected(pomelo-admin whitelist).', obj.ip);
        }
      }
    });
  }
};

/**
 * close master agent
 *
 * @api public
 */
MasterAgent.prototype.close = function() {
  if (this.state > ST_STARTED) {
    return;
  }
  this.state = ST_CLOSED;
  this.server.server.close();
};

/**
 * set module
 *
 * @param {String} moduleId module id/name
 * @param {Object} value module object
 * @api public
 */
MasterAgent.prototype.set = function(moduleId, value) {
  this.consoleService.set(moduleId, value);
};

/**
 * get module
 *
 * @param {String} moduleId module id/name
 * @api public
 */
MasterAgent.prototype.get = function(moduleId) {
  return this.consoleService.get(moduleId);
};

/**
 * getClientById
 *
 * @param {String} clientId
 * @api public
 */
MasterAgent.prototype.getClientById = function(clientId) {
  return this.clients[clientId];
};

/**
 * request monitor{master node} data from monitor
 *
 * @param {String} serverId
 * @param {String} moduleId module id/name
 * @param {Object} msg
 * @param {Function} callback function
 * @api public
 */
MasterAgent.prototype.request = function(serverId, moduleId, msg, cb) {
  if (this.state > ST_STARTED) {
    return;
  }

  var record = this.idMap[serverId];
  if (!record) {
    utils.invokeCallback(cb, new Error('unknown server id:' + serverId));
    return;
  }
  var curId = this.reqId++;
  this.callbacks[curId] = cb;
  sendToMonitor(record.socket, curId, moduleId, msg);
};

/**
 * request server data from monitor by serverInfo{host:port}
 *
 * @param {String} serverId
 * @param {Object} serverInfo
 * @param {String} moduleId module id/name
 * @param {Object} msg
 * @param {Function} callback function
 * @api public
 */
MasterAgent.prototype.requestServer = function(serverId, serverInfo, moduleId, msg, cb) {
  if (this.state > ST_STARTED) {
    return;
  }

  var record = this.idMap[serverId];
  if (!record) {
    utils.invokeCallback(cb, new Error('unknown server id:' + serverId));
    return;
  }

  var curId = this.reqId++;
  this.callbacks[curId] = cb;

  if (utils.compareServer(record, serverInfo)) {
    sendToMonitor(record.socket, curId, moduleId, msg);
  } else {
    var slaves = this.slaveMap[serverId];
    for (var i = 0, l = slaves.length; i < l; i++) {
      if (utils.compareServer(slaves[i], serverInfo)) {
        sendToMonitor(slaves[i].socket, curId, moduleId, msg);
        break;
      }
    }
  }
};

/**
 * notify a monitor{master node} by id without callback
 *
 * @param {String} serverId
 * @param {String} moduleId module id/name
 * @param {Object} msg
 * @api public
 */
MasterAgent.prototype.notifyById = function(serverId, moduleId, msg) {
  if (this.state > ST_STARTED) {
    return;
  }

  var record = this.idMap[serverId];
  if (!record) {
    logger.error('fail to notifyById for unknown server id:' + serverId);
    return false;
  }
  sendToMonitor(record.socket, null, moduleId, msg);
  return true;
};

/**
 * notify a monitor by server{host:port} without callback
 *
 * @param {String} serverId
 * @param {Object} serverInfo{host:port}
 * @param {String} moduleId module id/name
 * @param {Object} msg
 * @api public
 */
MasterAgent.prototype.notifyByServer = function(serverId, serverInfo, moduleId, msg) {
  if (this.state > ST_STARTED) {
    return;
  }

  var record = this.idMap[serverId];
  if (!record) {
    logger.error('fail to notifyByServer for unknown server id:' + serverId);
    return false;
  }

  if (utils.compareServer(record, serverInfo)) {
    sendToMonitor(record.socket, null, moduleId, msg);
  } else {
    var slaves = this.slaveMap[serverId];
    for (var i = 0, l = slaves.length; i < l; i++) {
      if (utils.compareServer(slaves[i], serverInfo)) {
        sendToMonitor(slaves[i].socket, null, moduleId, msg);
        break;
      }
    }
  }
  return true;
};

/**
 * notify slaves by id without callback
 *
 * @param {String} serverId
 * @param {String} moduleId module id/name
 * @param {Object} msg
 * @api public
 */
MasterAgent.prototype.notifySlavesById = function(serverId, moduleId, msg) {
  if (this.state > ST_STARTED) {
    return;
  }

  var slaves = this.slaveMap[serverId];
  if (!slaves || slaves.length === 0) {
    logger.error('fail to notifySlavesById for unknown server id:' + serverId);
    return false;
  }

  broadcastMonitors(slaves, moduleId, msg);
  return true;
};

/**
 * notify monitors by type without callback
 *
 * @param {String} type serverType
 * @param {String} moduleId module id/name
 * @param {Object} msg
 * @api public
 */
MasterAgent.prototype.notifyByType = function(type, moduleId, msg) {
  if (this.state > ST_STARTED) {
    return;
  }

  var list = this.typeMap[type];
  if (!list || list.length === 0) {
    logger.error('fail to notifyByType for unknown server type:' + type);
    return false;
  }
  broadcastMonitors(list, moduleId, msg);
  return true;
};

/**
 * notify all the monitors without callback
 *
 * @param {String} moduleId module id/name
 * @param {Object} msg
 * @api public
 */
MasterAgent.prototype.notifyAll = function(moduleId, msg) {
  if (this.state > ST_STARTED) {
    return;
  }
  broadcastMonitors(this.idMap, moduleId, msg);
  return true;
};

/**
 * notify a client by id without callback
 *
 * @param {String} clientId
 * @param {String} moduleId module id/name
 * @param {Object} msg
 * @api public
 */
MasterAgent.prototype.notifyClient = function(clientId, moduleId, msg) {
  if (this.state > ST_STARTED) {
    return;
  }

  var record = this.clients[clientId];
  if (!record) {
    logger.error('fail to notifyClient for unknown client id:' + clientId);
    return false;
  }
  sendToClient(record.socket, null, moduleId, msg);
};

MasterAgent.prototype.notifyCommand = function(command, moduleId, msg) {
  if (this.state > ST_STARTED) {
    return;
  }
  broadcastCommand(this.idMap, command, moduleId, msg);
  return true;
};

/**
 * add monitor,client to connection -- idMap
 *
 * @param {Object} agent agent object
 * @param {String} id
 * @param {String} type serverType
 * @param {Object} socket socket-io object
 * @api private
 */
var addConnection = function(agent, id, type, pid, info, socket) {
  var record = {
    id: id,
    type: type,
    pid: pid,
    info: info,
    socket: socket
  };
  if (type === 'client') {
    agent.clients[id] = record;
  } else {
    if (!agent.idMap[id]) {
      agent.idMap[id] = record;
      var list = agent.typeMap[type] = agent.typeMap[type] || [];
      list.push(record);
    } else {
      var slaves = agent.slaveMap[id] = agent.slaveMap[id] || [];
      slaves.push(record);
    }
  }
  return record;
};

/**
 * remove monitor,client connection -- idMap
 *
 * @param {Object} agent agent object
 * @param {String} id
 * @param {String} type serverType
 * @api private
 */
var removeConnection = function(agent, id, type, info) {
  if (type === 'client') {
    delete agent.clients[id];
  } else {
    // remove master node in idMap and typeMap
    var record = agent.idMap[id];
    if(!record) {
      return;
    }
    var _info = record['info'];
    if (utils.compareServer(_info, info)) {
      delete agent.idMap[id];
      var list = agent.typeMap[type];
      if (list) {
        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i].id === id) {
            list.splice(i, 1);
            break;
          }
        }
        if (list.length === 0) {
          delete agent.typeMap[type];
        }
      }
    } else {
      // remove slave node in slaveMap
      var slaves = agent.slaveMap[id];
      if (slaves) {
        for (var i = 0, l = slaves.length; i < l; i++) {
          if (utils.compareServer(slaves[i]['info'], info)) {
            slaves.splice(i, 1);
            break;
          }
        }
        if (slaves.length === 0) {
          delete agent.slaveMap[id];
        }
      }
    }
  }
};

/**
 * send msg to monitor
 *
 * @param {Object} socket socket-io object
 * @param {Number} reqId request id
 * @param {String} moduleId module id/name
 * @param {Object} msg message
 * @api private
 */
var sendToMonitor = function(socket, reqId, moduleId, msg) {
  socket.emit('monitor', protocol.composeRequest(reqId, moduleId, msg));
};

/**
 * send msg to client
 *
 * @param {Object} socket socket-io object
 * @param {Number} reqId request id
 * @param {String} moduleId module id/name
 * @param {Object} msg message
 * @api private
 */
var sendToClient = function(socket, reqId, moduleId, msg) {
  socket.emit('client', protocol.composeRequest(reqId, moduleId, msg));
};

/**
 * broadcast msg to monitor
 *
 * @param {Object} record registered modules
 * @param {String} moduleId module id/name
 * @param {Object} msg message
 * @api private
 */
var broadcastMonitors = function(records, moduleId, msg) {
  msg = protocol.composeRequest(null, moduleId, msg);

  if (records instanceof Array) {
    for (var i = 0, l = records.length; i < l; i++) {
      records[i].socket.emit('monitor', msg);
    }
  } else {
    for (var id in records) {
      records[id].socket.emit('monitor', msg);
    }
  }
};

var broadcastCommand = function(records, command, moduleId, msg) {
  msg = protocol.composeCommand(null, command, moduleId, msg);

  if (records instanceof Array) {
    for (var i = 0, l = records.length; i < l; i++) {
      records[i].socket.emit('monitor', msg);
    }
  } else {
    for (var id in records) {
      records[id].socket.emit('monitor', msg);
    }
  }
};

var doAuthUser = function(msg, socket, self, cb) {
  if (!msg.id) {
    // client should has a client id
    cb(new Error('client should has a client id'));
    return;
  }

  var username = msg.username;
  if (!username) {
    // client should auth with username
    socket.emit('register', {
      code: protocol.PRO_FAIL,
      msg: 'client should auth with username'
    });
    cb(new Error('client should auth with username'));
    return;
  }

  var authUser = self.consoleService.authUser;
  var env = self.consoleService.env;
  authUser(msg, env, function(user) {
    if (!user) {
      // client should auth with username
      socket.emit('register', {
        code: protocol.PRO_FAIL,
        msg: 'client auth failed with username or password error'
      });
      cb(new Error('client auth failed with username or password error'));
      return;
    }

    if (self.clients[msg.id]) {
      socket.emit('register', {
        code: protocol.PRO_FAIL,
        msg: 'id has been registered. id:' + msg.id
      });
      cb(new Error('id has been registered. id:' + msg.id));
      return;
    }

    logger.info('client user : ' + username + ' login to master');
    addConnection(self, msg.id, msg.type, null, user, socket);
    socket.emit('register', {
      code: protocol.PRO_OK,
      msg: 'ok'
    });
    cb(null);
  });
};

var doAuthServer = function(msg, socket, self, cb) {
  var authServer = self.consoleService.authServer;
  var env = self.consoleService.env;
  authServer(msg, env, function(status) {
    if (status !== 'ok') {
      socket.emit('register', {
        code: protocol.PRO_FAIL,
        msg: 'server auth failed'
      });
      cb(new Error('server auth failed'));
      return;
    }

    var record = addConnection(self, msg.id, msg.serverType, msg.pid, msg.info, socket);

    socket.emit('register', {
      code: protocol.PRO_OK,
      msg: 'ok'
    });
    msg.info.pid = msg.pid;
    self.emit('register', msg.info);
    cb(null);
  });
};

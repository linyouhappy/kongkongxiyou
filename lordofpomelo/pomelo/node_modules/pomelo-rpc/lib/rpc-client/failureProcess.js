var domain = require('domain');
var utils = require('../util/utils');
var constants = require('../util/constants');
var logger = require('pomelo-logger').getLogger('pomelo-rpc', __filename);

module.exports = function(code, tracer, serverId, msg, opts) {
	var cb = tracer.cb;
  var mode = opts.failMode;
  switch(mode) {
    case constants.FAIL_MODE.FAILOVER:
      method = failover;
    break;
    case constants.FAIL_MODE.FAILBACK:
      method = failback;
    break;
    case constants.FAIL_MODE.FAILFAST:
      method = failfast;
    break;
    case constants.FAIL_MODE.FAILSAFE:
    default:
      method = failfast;
    break;
  }
  method.call(this, code, tracer, serverId, msg, opts, cb);
};



/**
 * Failover rpc failure process. This will try other servers with option retries.
 *
 * @param code {Number} error code number.
 * @param tracer {Object} current rpc tracer.
 * @param serverId {String} rpc remote target server id.
 * @param msg {Object} rpc message.
 * @param opts {Object} rpc client options.
 * @param cb {Function} user rpc callback.
 *
 * @api private
 */
var failover = function(code, tracer, serverId, msg, opts, cb) {
	var servers;
	var self = this;
	var counter = 0;
	var success = true;
	var serverType = msg.serverType;
	if(!tracer.servers)	{
		servers = self.serversMap[serverType];
	}	else {
		servers = tracer.servers;
	}

	var index = servers.indexOf(serverId);
	if(index >= 0) {
			servers.splice(index, 1);
	}
	tracer.servers = servers;

	if(!servers.length)	{
		logger.error('[pomelo-rpc] rpc failed with all this type of servers, with serverType: %s', serverType);
		utils.invokeCallback(cb, new Error('rpc failed with all this type of servers, with serverType: ' + serverType));
		return;
	}
	self.dispatch.call(self, tracer, servers[0], msg, opts, cb);
};

/**
 * Failsafe rpc failure process.
 *
 * @param code {Number} error code number.
 * @param tracer {Object} current rpc tracer.
 * @param serverId {String} rpc remote target server id.
 * @param msg {Object} rpc message.
 * @param opts {Object} rpc client options.
 * @param cb {Function} user rpc callback.
 *
 * @api private
 */
var failsafe = function(code, tracer, serverId, msg, opts, cb) {
	var self = this;
	var retryTimes = opts.retryTimes || constants.DEFAULT_PARAM.FAILSAFE_RETRIES;
	var retryConnectTime = opts.retryConnectTime || constants.DEFAULT_PARAM.FAILSAFE_CONNECT_TIME;

	if(!tracer.retryTimes) {
		tracer.retryTimes = 1;
	} else {
		tracer.retryTimes += 1;
	}
	switch(code) {
		case constants.RPC_ERROR.SERVER_NOT_STARTED:
		case constants.RPC_ERROR.NO_TRAGET_SERVER:
			utils.invokeCallback(cb, new Error('rpc client is not started or cannot find remote server.'));
			break;
		case constants.RPC_ERROR.FAIL_CONNECT_SERVER:
			if(tracer.retryTimes <= retryTimes)	{
				setTimeout(function() {
					self.connect(tracer, serverId, cb);
				}, retryConnectTime * tracer.retryTimes);
			} else {
				utils.invokeCallback(cb, new Error('rpc client failed to connect to remote server: ' + serverId));
			}
			break;
		case constants.RPC_ERROR.FAIL_FIND_MAILBOX:
		case constants.RPC_ERROR.FAIL_SEND_MESSAGE:
			if(tracer.retryTimes <= retryTimes)	{
				setTimeout(function() {
					self.dispatch.call(self, tracer, serverId, msg, opts, cb);
				}, retryConnectTime * tracer.retryTimes);
			} else {
				utils.invokeCallback(cb, new Error('rpc client failed to send message to remote server: ' + serverId));
			}
			break;
		case constants.RPC_ERROR.FILTER_ERROR:
			utils.invokeCallback(cb, new Error('rpc client filter encounters error.'));
			break;
		default:
		  utils.invokeCallback(cb, new Error('rpc client unknown error.'));
	}
};

/**
 * Failback rpc failure process. This will try the same server with sendInterval option and retries option.
 *
 * @param code {Number} error code number.
 * @param tracer {Object} current rpc tracer.
 * @param serverId {String} rpc remote target server id.
 * @param msg {Object} rpc message.
 * @param opts {Object} rpc client options.
 * @param cb {Function} user rpc callback.
 *
 * @api private
 */
var failback = function(code, tracer, serverId, msg, opts, cb) {
	// todo record message in background and send the message at timing
};

/**
 * Failfast rpc failure process. This will ignore error in rpc client.
 *
 * @param code {Number} error code number.
 * @param tracer {Object} current rpc tracer.
 * @param serverId {String} rpc remote target server id.
 * @param msg {Object} rpc message.
 * @param opts {Object} rpc client options.
 * @param cb {Function} user rpc callback.
 *
 * @api private
 */
var failfast = function(code, tracer, serverId, msg, opts, cb) {
	logger.error('rpc failed with error, remote server: %s, msg: %j, error code: %s', serverId, msg, code);
	utils.invokeCallback(cb, new Error('rpc failed with error code: ' + code));
};

var EventEmitter = require('events').EventEmitter;
var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger('pomelo-rpc', __filename);

var exp = module.exports = new EventEmitter();

exp.connect = function(tracer, cb) {
  tracer.info('client', __filename, 'connect', 'connect to blackhole');
  process.nextTick(function() {
    utils.invokeCallback(cb, new Error('fail to connect to remote server and switch to blackhole.'));
  });
};

exp.close = function(cb) {
};

exp.send = function(tracer, msg, opts, cb) {
  tracer.info('client', __filename, 'send', 'send rpc msg to blackhole');
  logger.info('message into blackhole: %j', msg);
  process.nextTick(function() {
    utils.invokeCallback(cb, tracer, new Error('message was forward to blackhole.'));
  });
};

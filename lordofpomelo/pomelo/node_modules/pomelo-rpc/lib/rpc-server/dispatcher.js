var utils = require('../util/utils');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Dispatcher = function(services) {
  EventEmitter.call(this);
  var self = this;
  this.on('reload', function(services) {
    self.services = services;
  });
  this.services = services;
};
util.inherits(Dispatcher, EventEmitter);

module.exports = Dispatcher;

var pro = Dispatcher.prototype;

/**
 * route the msg to appropriate service object
 *
 * @param msg msg package {service:serviceString, method:methodString, args:[]}
 * @param services services object collection, such as {service1: serviceObj1, service2: serviceObj2}
 * @param cb(...) callback function that should be invoked as soon as the rpc finished
 */
pro.route = function(tracer, msg, cb) {
  tracer.info('server', __filename, 'route', 'route messsage to appropriate service object');
  var namespace = this.services[msg.namespace];
  if(!namespace) {
    tracer.error('server', __filename, 'route', 'no such namespace:' + msg.namespace);
    utils.invokeCallback(cb, new Error('no such namespace:' + msg.namespace));
    return;
  }

  var service = namespace[msg.service];
  if(!service) {
    tracer.error('server', __filename, 'route', 'no such service:' + msg.service);
    utils.invokeCallback(cb, new Error('no such service:' + msg.service));
    return;
  }

  var method = service[msg.method];
  if(!method) {
    tracer.error('server', __filename, 'route', 'no such method:' + msg.method);
    utils.invokeCallback(cb, new Error('no such method:' + msg.method));
    return;
  }

  var args = msg.args.slice(0);
  args.push(cb);
  method.apply(service, args);
};

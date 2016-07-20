var uuid = require('node-uuid');

var Tracer = function(logger, enabledRpcLog, source, remote, msg, id, seq) {
	this.logger = logger;
	this.isEnabled = enabledRpcLog;
  this.source = source;
  this.remote = remote;
  this.id = id || uuid.v1();
  this.seq = seq || 1;
  this.msg = msg;
};

module.exports = Tracer;

Tracer.prototype.getLogger = function(role, module, method, des) {
  return {
    traceId: this.id,
    seq: this.seq++,
    role: role,
    source: this.source,
    remote: this.remote,
    module: getModule(module),
    method: method,
    args: this.msg,
    timestamp: Date.now(),
    description:des
  };
};

Tracer.prototype.info = function(role, module, method, des) {
	if(this.isEnabled) {
		this.logger.info(JSON.stringify(this.getLogger(role, module, method, des)));
	}
	return;
};

Tracer.prototype.debug = function(role, module, method, des) {
 if(this.isEnabled) {
    this.logger.debug(JSON.stringify(this.getLogger(role, module, method, des)));
  }
  return;
};

Tracer.prototype.error = function(role, module, method, des) {
 if(this.isEnabled) {
    this.logger.error(JSON.stringify(this.getLogger(role, module, method, des)));
  }
  return;
};

var getModule = function(module) {
  var rs ='';
  var strs = module.split('/');
  var lines = strs.slice(-3);
  for(var i= 0; i<lines.length; i++) {
      rs += '/' + lines[i];
  }
  return rs;
};
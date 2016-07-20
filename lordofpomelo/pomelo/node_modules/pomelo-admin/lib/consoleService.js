var utils = require('./util/utils');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var MasterAgent = require('./masterAgent');
var MonitorAgent = require('./monitorAgent');
var protocol = require('./util/protocol');
var schedule = require('pomelo-scheduler');
var logger = require('pomelo-logger').getLogger('pomelo-admin', __filename);

var MS_OF_SECOND = 1000;

/**
 * ConsoleService Constructor
 *
 * @class ConsoleService
 * @constructor
 * @param {Object} opts construct parameter
 *                      opts.type {String} server type, 'master', 'connector', etc.
 *                      opts.id {String} server id
 *                      opts.host {String} (monitor only) master server host
 *                      opts.port {String | Number} listen port for master or master port for monitor
 *                      opts.master {Boolean} current service is master or monitor
 *                      opts.info {Object} more server info for current server, {id, serverType, host, port}
 * @api public
 */
var ConsoleService = function(opts) {
	EventEmitter.call(this);
	this.port = opts.port;
	this.env = opts.env;
	this.values = {};
	this.master = opts.master;

	this.modules = {};
	this.commands = {
		'list': listCommand,
		'enable': enableCommand,
		'disable': disableCommand
	};

	if (this.master) {
		this.authUser = opts.authUser || utils.defaultAuthUser;
		this.authServer = opts.authServer || utils.defaultAuthServerMaster;
		this.agent = new MasterAgent(this, opts);
	} else {
		this.type = opts.type;
		this.id = opts.id;
		this.host = opts.host;
		this.authServer = opts.authServer || utils.defaultAuthServerMonitor;
		this.agent = new MonitorAgent({
			consoleService: this,
			id: this.id,
			type: this.type,
			info: opts.info
		});
	}
};

util.inherits(ConsoleService, EventEmitter);

/**
 * start master or monitor
 *
 * @param {Function} cb callback function
 * @api public
 */
ConsoleService.prototype.start = function(cb) {
	if (this.master) {
		var self = this;
		this.agent.listen(this.port, function(err) {
			if (!!err) {
				utils.invokeCallback(cb, err);
	        		return;
	      		}
	
	      		exportEvent(self, self.agent, 'register');
	      		exportEvent(self, self.agent, 'disconnect');
	      		exportEvent(self, self.agent, 'reconnect');
	      		process.nextTick(function() {
	        		utils.invokeCallback(cb);
	      		});
		});
	} else {
		logger.info('try to connect master: %j, %j, %j', this.type, this.host, this.port);
		this.agent.connect(this.port, this.host, cb);
		exportEvent(this, this.agent, 'close');
	}

	exportEvent(this, this.agent, 'error');

	for (var mid in this.modules) {
		this.enable(mid);
	}
};

/**
 * stop console modules and stop master server
 *
 * @api public
 */
ConsoleService.prototype.stop = function() {
	for (var mid in this.modules) {
		this.disable(mid);
	}
	this.agent.close();
};

/**
 * register a new adminConsole module
 *
 * @param {String} moduleId adminConsole id/name
 * @param {Object} module module object
 * @api public
 */
ConsoleService.prototype.register = function(moduleId, module) {
	this.modules[moduleId] = registerRecord(this, moduleId, module);
};

/**
 * enable adminConsole module
 *
 * @param {String} moduleId adminConsole id/name
 * @api public
 */
ConsoleService.prototype.enable = function(moduleId) {
	var record = this.modules[moduleId];
	if (record && !record.enable) {
		record.enable = true;
		addToSchedule(this, record);
		return true;
	}
	return false;
};

/**
 * disable adminConsole module
 *
 * @param {String} moduleId adminConsole id/name
 * @api public
 */
ConsoleService.prototype.disable = function(moduleId) {
	var record = this.modules[moduleId];
	if (record && record.enable) {
		record.enable = false;
		if (record.schedule && record.jobId) {
			schedule.cancelJob(record.jobId);
			schedule.jobId = null;
		}
		return true;
	}
	return false;
};

/**
 * call concrete module and handler(monitorHandler,masterHandler,clientHandler)
 *
 * @param {String} moduleId adminConsole id/name
 * @param {String} method handler
 * @param {Object} msg message
 * @param {Function} cb callback function
 * @api public
 */
ConsoleService.prototype.execute = function(moduleId, method, msg, cb) {
	var self = this;
	var m = this.modules[moduleId];
	if (!m) {
		logger.error('unknown module: %j.', moduleId);
		cb('unknown moduleId:' + moduleId);
		return;
	}

	if (!m.enable) {
		logger.error('module %j is disable.', moduleId);
		cb('module ' + moduleId + ' is disable');
		return;
	}

	var module = m.module;
	if (!module || typeof module[method] !== 'function') {
		logger.error('module %j dose not have a method called %j.', moduleId, method);
		cb('module ' + moduleId + ' dose not have a method called ' + method);
		return;
	}

	var log = {
			action: 'execute',
			moduleId: moduleId,
			method: method,
			msg: msg
	}

	var aclMsg = aclControl(self.agent, 'execute', method, moduleId, msg);
	if (aclMsg !== 0 && aclMsg !== 1) {
		log['error'] = aclMsg;
		self.emit('admin-log', log, aclMsg);
		cb(new Error(aclMsg), null);
		return;
	}

	if (method === 'clientHandler') {
		self.emit('admin-log', log);
	}

	module[method](this.agent, msg, cb);
};

ConsoleService.prototype.command = function(command, moduleId, msg, cb) {
	var self = this;
	var fun = this.commands[command];
	if (!fun || typeof fun !== 'function') {
		cb('unknown command:' + command);
		return;
	}

	var log = {
		action: 'command',
		moduleId: moduleId,
		msg: msg
	}

	var aclMsg = aclControl(self.agent, 'command', null, moduleId, msg);
	if (aclMsg !== 0 && aclMsg !== 1) {
		log['error'] = aclMsg;
		self.emit('admin-log', log, aclMsg);
		cb(new Error(aclMsg), null);
		return;
	}

	self.emit('admin-log', log);
	fun(this, moduleId, msg, cb);
}

/**
 * set module data to a map
 *
 * @param {String} moduleId adminConsole id/name
 * @param {Object} value module data
 * @api public
 */

ConsoleService.prototype.set = function(moduleId, value) {
	this.values[moduleId] = value;
};

/**
 * get module data from map
 *
 * @param {String} moduleId adminConsole id/name
 * @api public
 */
ConsoleService.prototype.get = function(moduleId) {
	return this.values[moduleId];
};

/**
 * register a module service
 *
 * @param {Object} service consoleService object
 * @param {String} moduleId adminConsole id/name
 * @param {Object} module module object
 * @api private
 */
var registerRecord = function(service, moduleId, module) {
	var record = {
		moduleId: moduleId,
		module: module,
		enable: false
	};

	if (module.type && module.interval) {
		if (!service.master && record.module.type === 'push' || service.master && record.module.type !== 'push') {
			// push for monitor or pull for master(default)
			record.delay = module.delay || 0;
			record.interval = module.interval || 1;
			// normalize the arguments
			if (record.delay < 0) {
				record.delay = 0;
			}
			if (record.interval < 0) {
				record.interval = 1;
			}
			record.interval = Math.ceil(record.interval);
			record.delay *= MS_OF_SECOND;
			record.interval *= MS_OF_SECOND;
			record.schedule = true;
		}
	}

	return record;
};

/**
 * schedule console module
 *
 * @param {Object} service consoleService object
 * @param {Object} record  module object
 * @api private
 */
var addToSchedule = function(service, record) {
	if (record && record.schedule) {
		record.jobId = schedule.scheduleJob({
				start: Date.now() + record.delay,
				period: record.interval
			},
			doScheduleJob, {
				service: service,
				record: record
			});
	}
};

/**
 * run schedule job
 *
 * @param {Object} args argments
 * @api private
 */
var doScheduleJob = function(args) {
	var service = args.service;
	var record = args.record;
	if (!service || !record || !record.module || !record.enable) {
		return;
	}

	if (service.master) {
		record.module.masterHandler(service.agent, null, function(err) {
			logger.error('interval push should not have a callback.');
		});
	} else {
		record.module.monitorHandler(service.agent, null, function(err) {
			logger.error('interval push should not have a callback.');
		});
	}
};

/**
 * export closure function out
 *
 * @param {Function} outer outer function
 * @param {Function} inner inner function
 * @param {object} event
 * @api private
 */
var exportEvent = function(outer, inner, event) {
	inner.on(event, function() {
		var args = Array.prototype.slice.call(arguments, 0);
		args.unshift(event);
		outer.emit.apply(outer, args);
	});
};

/**
 * List current modules
 */
var listCommand = function(consoleService, moduleId, msg, cb) {
	var modules = consoleService.modules;

	var result = [];
	for (var moduleId in modules) {
		if (/^__\w+__$/.test(moduleId)) {
			continue;
		}

		result.push(moduleId);
	}

	cb(null, {
		modules: result
	});
};

/**
 * enable module in current server
 */
var enableCommand = function(consoleService, moduleId, msg, cb) {
	if (!moduleId) {
		logger.error('fail to enable admin module for ' + moduleId);
		cb('empty moduleId');
		return;
	}

	var modules = consoleService.modules;
	if (!modules[moduleId]) {
		cb(null, protocol.PRO_FAIL);
		return;
	}

	if (consoleService.master) {
		consoleService.enable(moduleId);
		consoleService.agent.notifyCommand("enable", moduleId, msg);
		cb(null, protocol.PRO_OK);
	} else {
		consoleService.enable(moduleId);
		cb(null, protocol.PRO_OK);
	}
};

/**
 * disable module in current server
 */
var disableCommand = function(consoleService, moduleId, msg, cb) {
	if (!moduleId) {
		logger.error('fail to enable admin module for ' + moduleId);
		cb('empty moduleId');
		return;
	}

	var modules = consoleService.modules;
	if (!modules[moduleId]) {
		cb(null, protocol.PRO_FAIL);
		return;
	}

	if (consoleService.master) {
		consoleService.disable(moduleId);
		consoleService.agent.notifyCommand("disable", moduleId, msg);
		cb(null, protocol.PRO_OK);
	} else {
		consoleService.disable(moduleId);
		cb(null, protocol.PRO_OK);
	}
};

var aclControl = function(agent, action, method, moduleId, msg) {
	if (action === 'execute') {
		if (method !== 'clientHandler' || moduleId !== '__console__') {
			return 0;
		}

		var signal = msg.signal;
		if (!signal || !(signal === 'stop' || signal === 'add' || signal === 'kill')) {
			return 0;
		}
	}

	var clientId = msg.clientId;
	if (!clientId) {
		return 'Unknow clientId';
	}

	var _client = agent.getClientById(clientId);
	if (_client && _client.info && _client.info.level) {
		var level = _client.info.level;
		if (level > 1) {
			return 'Command permission denied';
		}
	} else {
		return 'Client info error';
	}
	return 1;
}

/**
 * Create master ConsoleService
 *
 * @param {Object} opts construct parameter
 *                      opts.port {String | Number} listen port for master console
 */
module.exports.createMasterConsole = function(opts) {
	opts = opts || {};
	opts.master = true;
	return new ConsoleService(opts);
};

/**
 * Create monitor ConsoleService
 *
 * @param {Object} opts construct parameter
 *                      opts.type {String} server type, 'master', 'connector', etc.
 *                      opts.id {String} server id
 *                      opts.host {String} master server host
 *                      opts.port {String | Number} master port
 */
module.exports.createMonitorConsole = function(opts) {
	return new ConsoleService(opts);
};

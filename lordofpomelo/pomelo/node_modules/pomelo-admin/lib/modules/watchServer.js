/*!
 * Pomelo -- consoleModule watchServer
 * Copyright(c) 2013 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('pomelo-logger').getLogger('pomelo-admin', __filename);
var countDownLatch = require('../util/countDownLatch');
var monitor = require('pomelo-monitor');
var utils = require('../util/utils');
var util = require('util');
var fs = require('fs');
var vm = require('vm');

module.exports = function(opts) {
	return new Module(opts);
};

module.exports.moduleId = 'watchServer';

var Module = function(opts) {
	opts = opts || {};
	this.app = opts.app;
};

Module.prototype.monitorHandler = function(agent, msg, cb) {
	var comd = msg['comd'];
	var context = msg['context'];
	var param = msg['param'];
	var app = this.app;

	var handle = 'monitor';

	switch (comd) {
		case 'servers':
			showServers(handle, agent, comd, context, cb);
			break;
		case 'connections':
			showConnections(handle, agent, app, comd, context, cb);
			break;
		case 'logins':
			showLogins(handle, agent, app, comd, context, cb);
			break;
		case 'modules':
			showModules(handle, agent, comd, context, cb);
			break;
		case 'status':
			showStatus(handle, agent, comd, context, cb);
			break;
		case 'config':
			showConfig(handle, agent, app, comd, context, param, cb);
			break;
		case 'proxy':
			showProxy(handle, agent, app, comd, context, param, cb);
			break;
		case 'handler':
			showHandler(handle, agent, app, comd, context, param, cb);
			break;
		case 'components':
			showComponents(handle, agent, app, comd, context, param, cb);
			break;
		case 'settings':
			showSettings(handle, agent, app, comd, context, param, cb);
			break;
		case 'cpu':
			dumpCPU(handle, agent, comd, context, param, cb);
			break;
		case 'memory':
			dumpMemory(handle, agent, comd, context, param, cb);
			break;
		case 'get':
			getApp(handle, agent, app, comd, context, param, cb);
			break;
		case 'set':
			setApp(handle, agent, app, comd, context, param, cb);
			break;
		case 'enable':
			enableApp(handle, agent, app, comd, context, param, cb);
			break;
		case 'disable':
			disableApp(handle, agent, app, comd, context, param, cb);
			break;
		case 'run':
			runScript(handle, agent, app, comd, context, param, cb);
			break;
		default:
			showError(handle, agent, comd, context, cb);
	}
};

Module.prototype.clientHandler = function(agent, msg, cb) {
	var comd = msg['comd'];
	var context = msg['context'];
	var param = msg['param'];
	var app = this.app; // master app

	if (!comd || !context) {
		cb('lack of comd or context param');
		return;
	}

	var handle = 'client';
	switch (comd) {
		case 'servers':
			showServers(handle, agent, comd, context, cb);
			break;
		case 'connections':
			showConnections(handle, agent, app, comd, context, cb);
			break;
		case 'logins':
			showLogins(handle, agent, app, comd, context, cb);
			break;
		case 'modules':
			showModules(handle, agent, comd, context, cb);
			break;
		case 'status':
			showStatus(handle, agent, comd, context, cb);
			break;
		case 'config':
			showConfig(handle, agent, app, comd, context, param, cb);
			break;
		case 'proxy':
			showProxy(handle, agent, app, comd, context, param, cb);
			break;
		case 'handler':
			showHandler(handle, agent, app, comd, context, param, cb);
			break;
		case 'components':
			showComponents(handle, agent, app, comd, context, param, cb);
			break;
		case 'settings':
			showSettings(handle, agent, app, comd, context, param, cb);
			break;
		case 'cpu':
			dumpCPU(handle, agent, comd, context, param, cb);
			break;
		case 'memory':
			dumpMemory(handle, agent, comd, context, param, cb);
			break;
		case 'get':
			getApp(handle, agent, app, comd, context, param, cb);
			break;
		case 'set':
			setApp(handle, agent, app, comd, context, param, cb);
			break;
		case 'enable':
			enableApp(handle, agent, app, comd, context, param, cb);
			break;
		case 'disable':
			disableApp(handle, agent, app, comd, context, param, cb);
			break;
		case 'run':
			runScript(handle, agent, app, comd, context, param, cb);
			break;
		default:
			showError(handle, agent, comd, context, cb);
	}
};

function showServers(handle, agent, comd, context, cb) {
	if (handle === 'client') {
		var sid, record;
		var serverInfo = {};
		var count = utils.size(agent.idMap);
		var latch = countDownLatch.createCountDownLatch(count, function() {
			cb(null, {
				msg: serverInfo
			});
		});

		for (sid in agent.idMap) {
			record = agent.idMap[sid];
			agent.request(record.id, module.exports.moduleId, {
				comd: comd,
				context: context
			}, function(msg) {
				serverInfo[msg.serverId] = msg.body;
				latch.done();
			});
		}
	} else if (handle === 'monitor') {
		var serverId = agent.id;
		var serverType = agent.type;
		var info = agent.info;
		var pid = process.pid;
		var heapUsed = (process.memoryUsage().heapUsed / (1000 * 1000)).toFixed(2);
		var uptime = (process.uptime() / 60).toFixed(2);
		cb({
			serverId: serverId,
			body: {
				serverId: serverId,
				serverType: serverType,
				host: info['host'],
				port: info['port'],
				pid: pid,
				heapUsed: heapUsed,
				uptime: uptime
			}
		});
	}

}

function showConnections(handle, agent, app, comd, context, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			var sid, record;
			var serverInfo = {};
			var count = 0;
			for(var key in agent.idMap) {
				if(agent.idMap[key].info.frontend === 'true') {
					count++;
				}
			}
			var latch = countDownLatch.createCountDownLatch(count, function() {
				cb(null, {
					msg: serverInfo
				});
			});

			for (sid in agent.idMap) {
				record = agent.idMap[sid];
				if (record.info.frontend === 'true') {
					agent.request(record.id, module.exports.moduleId, {
						comd: comd,
						context: context
					}, function(msg) {
						serverInfo[msg.serverId] = msg.body;
						latch.done();
					});
				}
			}
		} else {
			var record = agent.idMap[context];
			if (!record) {
				cb("the server " + context + " not exist");
			}
			if (record.info.frontend === 'true') {
				agent.request(record.id, module.exports.moduleId, {
					comd: comd,
					context: context
				}, function(msg) {
					var serverInfo = {};
					serverInfo[msg.serverId] = msg.body;
					cb(null, {
						msg: serverInfo
					});
				});
			} else {
				cb('\nthis command should be applied to frontend server\n');
			}
		}
	} else if (handle === 'monitor') {
		var connection = app.components.__connection__;
		if (!connection) {
			cb({
				serverId: agent.id,
				body: 'error'
			});
			return;
		}

		cb({
			serverId: agent.id,
			body: connection.getStatisticsInfo()
		});
	}
}


function showLogins(handle, agent, app, comd, context, cb) {
	showConnections(handle, agent, app, comd, context, cb);
}

function showModules(handle, agent, comd, context, cb) {
	var modules = agent.consoleService.modules;
	var result = [];
	for (var module in modules) {
		result.push(module);
	}
	cb(null, {
		msg: result
	});
}

function showStatus(handle, agent, comd, context, cb) {
	if (handle === 'client') {
		agent.request(context, module.exports.moduleId, {
			comd: comd,
			context: context
		}, function(err, msg) {
			cb(null, {
				msg: msg
			});
		});
	} else if (handle === 'monitor') {
		var serverId = agent.id;
		var pid = process.pid;
		var params = {
			serverId: serverId,
			pid: pid
		};
		monitor.psmonitor.getPsInfo(params, function(err, data) {
			cb(null, {
				serverId: agent.id,
				body: data
			})
		});
	}
}

function showConfig(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (param === 'master') {
			cb(null, {
				masterConfig: app.get('masterConfig') || 'no config to master in app.js',
				masterInfo: app.get('master')
			});
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		var key = param + 'Config';
		cb(null, clone(param, app.get(key)));
	}
}

function showProxy(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		proxyCb(app, context, cb);
	}
}

function showHandler(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		handlerCb(app, context, cb);
	}
}

function showComponents(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		var _components = app.components;
		var res = {};
		for (var key in _components) {
			var name = getComponentName(key);
			res[name] = clone(name, app.get(name + 'Config'))
		}
		cb(null, res);
	}
}

function showSettings(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		var _settings = app.settings;
		var res = {};
		for (var key in _settings) {
			if (key.match(/^__\w+__$/) || key.match(/\w+Config$/)) {
				continue;
			}
			if (!checkJSON(_settings[key])) {
				res[key] = 'Object';
				continue;
			}
			res[key] = _settings[key];
		}
		cb(null, res);
	}
}

function dumpCPU(handle, agent, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(err, msg);
		});
	} else if (handle === 'monitor') {
		var times = param['times'];
		var filepath = param['filepath'];
		var force = param['force'];
		cb(null, 'cpu dump is unused in 1.0 of pomelo');
		/**
		if (!/\.cpuprofile$/.test(filepath)) {
			filepath = filepath + '.cpuprofile';
		}
		if (!times || !/^[0-9]*[1-9][0-9]*$/.test(times)) {
			cb('no times or times invalid error');
			return;
		}
		checkFilePath(filepath, force, function(err) {
			if (err) {
				cb(err);
				return;
			}
			//ndump.cpu(filepath, times);
			cb(null, filepath + ' cpu dump ok');
		});
		*/

	}
}

function dumpMemory(handle, agent, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(err, msg);
		});
	} else if (handle === 'monitor') {
		var filepath = param['filepath'];
		var force = param['force'];
		if (!/\.heapsnapshot$/.test(filepath)) {
			filepath = filepath + '.heapsnapshot';
		}
		checkFilePath(filepath, force, function(err) {
			if (err) {
				cb(err);
				return;
			}
			var heapdump = require('heapdump');
			heapdump.writeSnapshot(filepath);
			cb(null, filepath + ' memory dump ok')
		});
	}
}

function getApp(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		var res = app.get(param);
		if (!checkJSON(res)) {
			res = 'object';
		}
		cb(null, res || null);
	}
}

function setApp(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		var key = param['key'];
		var value = param['value'];
		app.set(key, value);
		cb(null, 'set ' + key + ':' + value + ' ok');
	}
}

function enableApp(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		app.enable(param);
		cb(null, 'enable ' + param + ' ok');
	}
}

function disableApp(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		app.disable(param);
		cb(null, 'disable ' + param + ' ok');
	}
}

function runScript(handle, agent, app, comd, context, param, cb) {
	if (handle === 'client') {
		if (context === 'all') {
			cb('context error');
			return;
		}

		agent.request(context, module.exports.moduleId, {
			comd: comd,
			param: param,
			context: context
		}, function(err, msg) {
			cb(null, msg);
		});
	} else if (handle === 'monitor') {
		var ctx = {
			app: app,
			result: null
		};
		try {
			vm.runInNewContext('result = ' + param, ctx, 'myApp.vm');
			cb(null, util.inspect(ctx.result));
		} catch(e) {
			cb(null, e.stack);
		}
	}
}

function showError(handle, agent, comd, context, cb) {

}

function clone(param, obj) {
	var result = {};
	var flag = 1;
	for (var key in obj) {
		if (typeof obj[key] === 'function' || typeof obj[key] === 'object') {
			continue;
		}
		flag = 0;
		result[key] = obj[key];
	}
	if (flag) {
		// return 'no ' + param + 'Config info';
	}
	return result;
}

function checkFilePath(filepath, force, cb) {
	if (!force && fs.existsSync(filepath)) {
		cb('filepath file exist');
		return;
	}
	fs.writeFile(filepath, 'test', function(err) {
		if (err) {
			cb('filepath invalid error');
			return;
		}
		fs.unlinkSync(filepath);
		cb(null);
	})
}

function proxyCb(app, context, cb) {
	var msg = {};
	var __proxy__ = app.components.__proxy__;
	if (__proxy__ && __proxy__.client && __proxy__.client.proxies.user) {
		var proxies = __proxy__.client.proxies.user;
		var server = app.getServerById(context);
		if (!server) {
			cb('no server with this id ' + context);
		} else {
			var type = server['serverType'];
			var tmp = proxies[type];
			msg[type] = {};
			for (var _proxy in tmp) {
				var r = tmp[_proxy];
				msg[type][_proxy] = {};
				for (var _rpc in r) {
					if (typeof r[_rpc] === 'function') {
						msg[type][_proxy][_rpc] = 'function';
					}
				}
			}
			cb(null, msg);
		}
	} else {
		cb('no proxy loaded');
	}
}

function handlerCb(app, context, cb) {
	var msg = {};
	var __server__ = app.components.__server__;
	if (__server__ && __server__.server && __server__.server.handlerService.handlers) {
		var handles = __server__.server.handlerService.handlers;
		var server = app.getServerById(context);
		if (!server) {
			cb('no server with this id ' + context);
		} else {
			var type = server['serverType'];
			var tmp = handles;
			msg[type] = {};
			for (var _p in tmp) {
				var r = tmp[_p];
				msg[type][_p] = {};
				for (var _r in r) {
					if (typeof r[_r] === 'function') {
						msg[type][_p][_r] = 'function';
					}
				}
			}
			cb(null, msg);
		}
	} else {
		cb('no handler loaded');
	}
}

function getComponentName(c) {
	var t = c.match(/^__(\w+)__$/);
	if (t) {
		t = t[1];
	}
	return t;
}

function checkJSON(obj) {
	if (!obj) {
		return true;
	}
	try {
		JSON.stringify(obj);
	} catch (e) {
		return false;
	}
	return true;
}

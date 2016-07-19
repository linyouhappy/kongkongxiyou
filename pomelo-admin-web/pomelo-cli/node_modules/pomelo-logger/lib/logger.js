var log4js = require('log4js');
var fs = require('fs');
var util = require('util');


var funcs = {
	'env': doEnv,
	'args': doArgs,
	'opts': doOpts
};

function getLogger(categoryName) {
	var args = arguments;
	var prefix = "";
	for (var i = 1; i < args.length; i++) {
		if (i !== args.length - 1)
			prefix = prefix + args[i] + "] [";
		else
			prefix = prefix + args[i];
	}
	if (typeof categoryName === 'string') {
		// category name is __filename then cut the prefix path
		categoryName = categoryName.replace(process.cwd(), '');
	}
	var logger = log4js.getLogger(categoryName);
	var pLogger = {};
	for (var key in logger) {
		pLogger[key] = logger[key];
	}

	['log', 'debug', 'info', 'warn', 'error', 'trace', 'fatal'].forEach(function(item) {
		pLogger[item] = function() {
			var p = "";
			if (!process.env.RAW_MESSAGE) {
				if (args.length > 1) {
					p = "[" + prefix + "] ";
				}
				if (args.length && process.env.LOGGER_LINE) {
					p = getLine() + ": " + p;
				}
				p = colorize(p, colours[item]);
			}

			if (args.length) {
				arguments[0] = p + arguments[0];
			}
			logger[item].apply(logger, arguments);
		}
	});
	return pLogger;
};

var configState = {};

function initReloadConfiguration(filename, reloadSecs) {
	if (configState.timerId) {
		clearInterval(configState.timerId);
		delete configState.timerId;
	}
	configState.filename = filename;
	configState.lastMTime = getMTime(filename);
	configState.timerId = setInterval(reloadConfiguration, reloadSecs * 1000);
};

function getMTime(filename) {
	var mtime;
	try {
		mtime = fs.statSync(filename).mtime;
	} catch (e) {
		throw new Error("Cannot find file with given path: " + filename);
	}
	return mtime;
};

function loadConfigurationFile(filename) {
	if (filename) {
		return JSON.parse(fs.readFileSync(filename, "utf8"));
	}
	return undefined;
};

function reloadConfiguration() {
	var mtime = getMTime(configState.filename);
	if (!mtime) {
		return;
	}
	if (configState.lastMTime && (mtime.getTime() > configState.lastMTime.getTime())) {
		configureOnceOff(loadConfigurationFile(configState.filename));
	}
	configState.lastMTime = mtime;
};


function configureOnceOff(config) {
	if (config) {
		try {
			configureLevels(config.levels);
			if (config.replaceConsole) {
				log4js.replaceConsole();
			} else {
				log4js.restoreConsole();
			}
		} catch (e) {
			throw new Error(
				"Problem reading log4js config " + util.inspect(config) +
				". Error was \"" + e.message + "\" (" + e.stack + ")"
			);
		}
	}
};

function configureLevels(levels) {
	if (levels) {
		for (var category in levels) {
			if (levels.hasOwnProperty(category)) {
				log4js.getLogger(category).setLevel(levels[category]);
			}
		}
	}
};

/**
 * Configure the logger.
 * Configure file just like log4js.json. And support ${scope:arg-name} format property setting.
 * It can replace the placeholder in runtime.
 * scope can be:
 *     env: environment variables, such as: env:PATH
 *     args: command line arguments, such as: args:1
 *     opts: key/value from opts argument of configure function
 *
 * @param  {String|Object} config configure file name or configure object
 * @param  {Object} opts   options
 * @return {Void}
 */

function configure(config, opts) {
	var filename = config;
	config = config || process.env.LOG4JS_CONFIG;
	opts = opts || {};

	if (typeof config === 'string') {
		config = JSON.parse(fs.readFileSync(config, "utf8"));
	}

	if (config) {
		config = replaceProperties(config, opts);
	}

	if (config && config.lineDebug) {
		process.env.LOGGER_LINE = true;
	}

	if (config && config.rawMessage) {
		process.env.RAW_MESSAGE = true;
	}

	if (filename && config && config.reloadSecs) {
		initReloadConfiguration(filename, config.reloadSecs);
	}

	// config object could not turn on the auto reload configure file in log4js

	log4js.configure(config, opts);
};

function replaceProperties(configObj, opts) {
	if (configObj instanceof Array) {
		for (var i = 0, l = configObj.length; i < l; i++) {
			configObj[i] = replaceProperties(configObj[i], opts);
		}
	} else if (typeof configObj === 'object') {
		var field;
		for (var f in configObj) {
			if (!configObj.hasOwnProperty(f)) {
				continue;
			}

			field = configObj[f];
			if (typeof field === 'string') {
				configObj[f] = doReplace(field, opts);
			} else if (typeof field === 'object') {
				configObj[f] = replaceProperties(field, opts);
			}
		}
	}

	return configObj;
}

function doReplace(src, opts) {
	if (!src) {
		return src;
	}

	var ptn = /\$\{(.*?)\}/g;
	var m, pro, ts, scope, name, defaultValue, func, res = '',
		lastIndex = 0;
	while ((m = ptn.exec(src))) {
		pro = m[1];
		ts = pro.split(':');
		if (ts.length !== 2 && ts.length !== 3) {
			res += pro;
			continue;
		}

		scope = ts[0];
		name = ts[1];
		if (ts.length === 3) {
			defaultValue = ts[2];
		}

		func = funcs[scope];
		if (!func && typeof func !== 'function') {
			res += pro;
			continue;
		}

		res += src.substring(lastIndex, m.index);
		lastIndex = ptn.lastIndex;
		res += (func(name, opts) || defaultValue);
	}

	if (lastIndex < src.length) {
		res += src.substring(lastIndex);
	}

	return res;
}

function doEnv(name) {
	return process.env[name];
}

function doArgs(name) {
	return process.argv[name];
}

function doOpts(name, opts) {
	return opts ? opts[name] : undefined;
}

function getLine() {
	var e = new Error();
	// now magic will happen: get line number from callstack
	var line = e.stack.split('\n')[3].split(':')[1];
	return line;
}

function colorizeStart(style) {
	return style ? '\x1B[' + styles[style][0] + 'm' : '';
}

function colorizeEnd(style) {
	return style ? '\x1B[' + styles[style][1] + 'm' : '';
}
/**
 * Taken from masylum's fork (https://github.com/masylum/log4js-node)
 */
function colorize(str, style) {
	return colorizeStart(style) + str + colorizeEnd(style);
}

var styles = {
	//styles
	'bold': [1, 22],
	'italic': [3, 23],
	'underline': [4, 24],
	'inverse': [7, 27],
	//grayscale
	'white': [37, 39],
	'grey': [90, 39],
	'black': [90, 39],
	//colors
	'blue': [34, 39],
	'cyan': [36, 39],
	'green': [32, 39],
	'magenta': [35, 39],
	'red': [31, 39],
	'yellow': [33, 39]
};

var colours = {
	'all': "grey",
	'trace': "blue",
	'debug': "cyan",
	'info': "green",
	'warn': "yellow",
	'error': "red",
	'fatal': "magenta",
	'off': "grey"
};

module.exports = {
	getLogger: getLogger,
	getDefaultLogger: log4js.getDefaultLogger,

	addAppender: log4js.addAppender,
	loadAppender: log4js.loadAppender,
	clearAppenders: log4js.clearAppenders,
	configure: configure,

	replaceConsole: log4js.replaceConsole,
	restoreConsole: log4js.restoreConsole,

	levels: log4js.levels,
	setGlobalLogLevel: log4js.setGlobalLogLevel,

	layouts: log4js.layouts,
	appenders: log4js.appenders
};
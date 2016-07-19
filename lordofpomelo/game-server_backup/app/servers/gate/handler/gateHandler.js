var Code = require('../../../../../shared/code');
var dispatcher = require('../../../util/dispatcher');
var os = require('os');

/**
 * Gate handler that dispatch user to connectors.
 */
module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;

	var localIps = function() {
		var ifaces = os.networkInterfaces();
		var ips = [];
		var func = function(details) {
			if (details.family === 'IPv4') {
				ips.push(details.address);
			}
		};
		for (var dev in ifaces) {
			ifaces[dev].forEach(func);
		}
		return ips;
	}();

	for (var i = 0; i < localIps.length; i++) {
		if (localIps[i]!=="127.0.0.1") {
			this.serverId=localIps[i];
		}
	}
	if(!this.serverId)
		this.serverId="127.0.0.1";
};

Handler.prototype.queryEntry = function(msg, session, next) {
	console.log("queryEntry msg="+JSON.stringify(msg));
	var uid = msg.uid;
	if(!uid) {
		next(null, {code: Code.FAIL});
		return;
	}

	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		next(null, {code: Code.GATE.FA_NO_SERVER_AVAILABLE});
		return;
	}

	var res = dispatcher.dispatch(uid, connectors);

	//res.host="112.74.89.44";
	res.host=this.serverId;
	next(null, {code: Code.OK, host: res.host, port: res.clientPort});
  // next(null, {code: Code.OK, host: res.pubHost, port: res.clientPort});
};
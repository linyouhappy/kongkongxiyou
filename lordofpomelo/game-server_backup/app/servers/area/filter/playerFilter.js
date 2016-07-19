var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var messageService = require('../../../domain/messageService');
var areaManager;

module.exports = function() {
	return new Filter();
};

var Filter = function() {
};

/**
 * Area filter
 */
Filter.prototype.before = function(msg, session, next){
	if(!areaManager){
		areaManager=pomelo.app.areaManager;
	}
	var area =areaManager.getArea(session.get('instanceId'));
	if (!area) {
		var uid = {
			sid: session.frontendId,
			uid: session.uid
		};
		var areaId = Math.random() > 0.5 ? 1001 : 2001;
		var serverId = pomelo.app.get('areaIdMap')[areaId];
		session.set('serverId', serverId);

		session.set('instanceId', 0);
		session.pushAll();

		messageService.pushMessageToPlayer(uid, 'onChangeArea', {
			target: areaId
		});
		next(new Error('No area exist!'));
		return;
	}
	session.area = area;
	var player = area.getPlayer(session.get('playerId'));
	if(!player){
		var route = msg.__route__;
		//if(route.search(/^area\.resourceHandler/i) == 0 || route.search(/enterScene$/i) >= 0){
		if(route.search(/enterScene$/i) >= 0){	
			next();
			return;
		}else{
			var uid = {sid :session.frontendId, uid :session.uid};
			messageService.pushMessageToPlayer(uid,'onChangeArea',{target:area.areaId});
			next(new Error('No player exist!'));
			return;
		}
	}
	session.player = player;
	next();
};
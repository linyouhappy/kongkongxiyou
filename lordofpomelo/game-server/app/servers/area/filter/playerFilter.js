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
	var playerId=session.get('playerId');
	areaManager.getPlayerWithPlayerIdCb(playerId,function(err,player){
		if (err || !player) {
			next(new Error('ERROR:playerFilter getPlayerWithPlayerIdCb!'));
		}else{
			if (!player.serverId) {
				player.serverId = session.frontendId;
				player.sessionData = {
					uid: player.userId,
					sid: player.serverId
				};
			}
			var area=areaManager.getAreaWithPlayer(player);
			if (!area) {
				next(new Error('No area exist!'));
				return;
			}
			session.area = area;
			// var player = area.getPlayer(playerId);
			if (!area.getPlayer(playerId)) {
				if(msg.__route__.search(/enterScene$/i) >= 0){
					session.player = player;
					next();
					return;
				}else{
					logger.error("player is no in area!fix it===>>playerId=",playerId);
					messageService.pushMessageToPlayer(player.sessionData,'onChangeArea',{target:area.areaId});
					next(new Error('player is no in area!!'));
					// area.enterArea(player);
					// area.addEntity(player);
					// player = area.getPlayer(playerId);
					// if (!player) {
					// 	next(new Error('area canot add player!'));
					// 	return;
					// }
					//var entities = {};
					//entities[player.type] = [player.strip()];
					//messageService.pushMessageToPlayer(player.sessionData, 'onAddEntities', entities);
				}
			}else{
				if (!player.area) {
					logger.error("player can't find area!fix it===>>playerId=",playerId,",areaId=",area.areaId);
					// player.area=area;
				}
			}
			session.player = player;
			next();
		}
	});

	// session.area = area;
	// var player = area.getPlayer(session.get('playerId'));
	// if(!player){
	// 	var route = msg.__route__;
	// 	//if(route.search(/^area\.resourceHandler/i) == 0 || route.search(/enterScene$/i) >= 0){
	// 	if(route.search(/enterScene$/i) >= 0){	
	// 		next();
	// 		return;
	// 	}else{
	// 		var uid = {sid :session.frontendId, uid :session.uid};
	// 		messageService.pushMessageToPlayer(uid,'onChangeArea',{target:area.areaId});
	// 		next(new Error('No player exist!'));
	// 		return;
	// 	}
	// }
	// session.player = player;
	// next();
};

// Filter.prototype.before = function(msg, session, next){
// 	if(!areaManager){
// 		areaManager=pomelo.app.areaManager;
// 	}
// 	var area =areaManager.getArea(session.get('instanceId'));
// 	if (!area) {
// 		var uid = {
// 			sid: session.frontendId,
// 			uid: session.uid
// 		};
// 		var areaId = Math.random() > 0.5 ? 1001 : 2001;
// 		var serverId = pomelo.app.get('areaIdMap')[areaId];
// 		session.set('serverId', serverId);

// 		session.set('instanceId', 0);
// 		session.pushAll();

// 		messageService.pushMessageToPlayer(uid, 'onChangeArea', {
// 			target: areaId
// 		});
// 		next(new Error('No area exist!'));
// 		return;
// 	}
// 	session.area = area;
// 	var player = area.getPlayer(session.get('playerId'));
// 	if(!player){
// 		var route = msg.__route__;
// 		//if(route.search(/^area\.resourceHandler/i) == 0 || route.search(/enterScene$/i) >= 0){
// 		if(route.search(/enterScene$/i) >= 0){	
// 			next();
// 			return;
// 		}else{
// 			var uid = {sid :session.frontendId, uid :session.uid};
// 			messageService.pushMessageToPlayer(uid,'onChangeArea',{target:area.areaId});
// 			next(new Error('No player exist!'));
// 			return;
// 		}
// 	}
// 	session.player = player;
// 	next();
// };
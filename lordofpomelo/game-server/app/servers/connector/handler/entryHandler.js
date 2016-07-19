var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var async = require('async');
var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var dataApi = require('../../../util/dataApi');
var handleRemote = require('../../../consts/handleRemote');

var BlankFunc=function() {};

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;

	if (!this.app)
		logger.error("entryHandler construct "+app);
};

var pro = Handler.prototype;

/**
 * New client entry game server. Check token and bind user info into session.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
pro.entry = function(msg, session, next) {
	var token = msg.token;
	var self = this;
	if (!token) {
		utils.myPrint("entyHandler.entry msg =", JSON.stringify(msg));
		next(new Error('invalid entry request: empty token'), {
			code: 63
		});
		return;
	}

	var uid, players, player, lastKindId;
	async.waterfall([
		function(cb) {
			// utils.myPrint("auth token=====>>");
			self.app.rpc.auth.authRemote.auth(session, token, cb);
		},
		function(code, user, cb) {
			// utils.myPrint("query player info by user id=====>>");
			if (code !== 200) {
				logger.error("entyHandler.entry token no pass", JSON.stringify(msg));
				next(null, {
					code: code
				});
				return;
			}
			if (!user) {
				logger.error("entyHandler.entry user is no exist!");
				next(null, {
					code: 1003
				});
				return;
			}
			user.lastLoginTime = Date.now();
			user.loginCount++;
			userDao.updateUser(user);

			// utils.myPrint("userDao.getPlayersByUid====>>");
			lastKindId = user.lastKindId || 0;
			uid = user.id;
			userDao.getPlayersByUid(user.id, cb);
		},
		function(res, cb) {
			players = res;
			// utils.myPrint("players====>>" + JSON.stringify(players));
			utils.invokeCallback(cb);
		}
	], function(err) {
		if (err) {
			logger.error("entyHandler.entry unkown error!");
			next(err, {
				code: 65
			});
			return;
		}

		if (!players || players.length === 0) {
			next(null, {
				code: 200,
				uid: uid,
				time: Date.now()
			});
			return;
		}

		var playersList = [];
		// var playerIds=[];
		for (var i = 0; i < players.length; i++) {
			player = players[i];
			var playerData = {
				playerId: player.id,
				name: player.name,
				kindId: player.kindId,
				level: player.level
			}
			playersList.push(playerData);
			// playerIds.push(player.id);
		}

		// params.args=[playerIds];
		// var areaIdMap=self.app.get('areaIdMap');
		// for (var key in areaIdMap) {
		// 	var serverId=areaIdMap[key];
		// 	self.app.rpcInvoke(serverId, params, BlankFunc);
		// }

		next(null, {
			code: 200,
			uid: uid,
			time: Date.now(),
			kindId: lastKindId,
			players: playersList
		});
	});
};

pro.entryPlayer = function(msg, session, next) {
	var playerId = msg.playerId;
	var uid = msg.uid;
	var players, player;
	// var self = this;
	var serverId, instanceId;

	var app=this.app;
	var rpc=app.rpc;

	async.waterfall([
		function(cb) {
			app.get('sessionService').kick(uid, cb);
		},
		function(cb) {
			session.bind(uid, cb);
		},
		function(cb) {
			userDao.getPlayersByUid(uid, cb);
		},
		function(res, cb) {
			players = res;
			if (!players || players.length === 0) {
				cb("no player data");
				return;
			}

			for (var i = 0; i < players.length; i++) {
				if (playerId === players[i].id) {
					player = players[i];
					break;
				}
			}
			if (!player) {
				cb("no player");
				return;
			}
			userDao.updateKindId(uid,player.kindId);
	
			// if (rpc.manager) {
			// 	rpc.manager.instanceRemote.isInInstance(session, {
			// 		playerId: playerId
			// 	}, function(err, result) {
			// 		if (err) {
			// 			logger.error('instanceRemote.isInInstance error! %j', err);
			// 		}
			// 		if (result && result.instanceId) {
			// 			serverId = result.serverId;
			// 			instanceId = result.instanceId;
			// 		}
			// 		cb(null);
			// 	});
			// } else {
			// 	cb(null);
			// }
			cb(null);
		},
		function(cb) {
			// if (serverId && instanceId) {
			// 	session.set('serverId', serverId);
			// 	session.set('instanceId', instanceId);

			// 	utils.myPrint("entryPlayer instanceId=", instanceId, ",serverId＝", serverId);
			// } else {
				// if (!player.areaId) {
				// 	player.areaId = 1001;
				// 	userDao.updateAreaId(player);
				// }
				// var areaIdMaps = app.get('areaIdMap');
				// serverId = areaIdMaps[0];
				// if(!serverId){
				// 	serverId = areaIdMaps[player.areaId];
				// }
				// if (!serverId) {
				// 	logger.error('entryPlayer error! %j', new Error('serverId is undefined'));
				// 	player.areaId = 1001;
				// 	userDao.updateAreaId(player);
				// 	serverId = areaIdMaps[player.areaId];
				// }

				// var areaIdMaps = app.get('areaIdMap');
				// serverId = areaIdMaps[0];
				serverId="area-server";
				session.set('serverId', serverId);
				utils.myPrint("entryPlayer entry areaId=", player.areaId, ",serverId＝", serverId);
			// }
			
			session.set('playerName', player.name);
			session.set('level', player.level);
			session.set('kindId', player.kindId);
			session.set('playerId', player.id);
			
			if (player.guildId) {
				session.set('guildId', player.guildId);
			}
			if (player.vip) {
				session.set('vip', player.vip);
			}
			session.on('closed', onUserLeave.bind(null, app));
			session.pushAll(cb);
		}
	], function(err) {
		if (err) {
			logger.error("entryPlayer",new Error("entryPlayer=====>>"));
			next(err, {
				code: 500
			});
			return;
		}
		next(null, {
			code: 200
		});

		// if (rpc.chat) {
		// 	rpc.chat.chatRemote.add(session, player.userId, player.id,channelUtil.getGlobalChannelName(), BlankFunc);
		// }
		handleRemote.chatRemote_add(session, player.userId, player.id,channelUtil.getGlobalChannelName());
		if (rpc.manager) {
			rpc.manager.guildRemote.enterGuild(session, player.userId, player.guildId, player.id, BlankFunc);
		}
	});
};

pro.resetArea = function(msg, session, next) {
	var areaId = Math.random() > 0.5 ? 1001 : 2001;
	var serverId = this.app.get('areaIdMap')[areaId];
	session.set('serverId', serverId);
	session.set('instanceId', 0);
	session.pushAll();
	next();
};

pro.fixLeaveArea=function(msg, session, next){
	var leaveAreaId=msg.areaId;
	var areaData = dataApi.area.findById(leaveAreaId);
	if (areaData) {
		var params = {
			namespace: 'user',
			service: 'playerRemote',
			method: 'fixPlayerLeave',
			args: [session.uid]
		};
		var app=this.app;
		if (areaData.type <= AreaType.SCENE) {
			var serverId = app.get('areaIdMap')[leaveAreaId];
			app.rpcInvoke(serverId, params, function(err) {
				if (!!err) {
					logger.error('entyHandler.fixLeaveArea playerRemote.fixPlayerLeave error!');
				}
			});
		}else{
			var areas = app.get('servers').area;
			for (var id in areas) {
				areaData=areas[id];
				if (areaData.instance) {
					app.rpcInvoke(areaData.id, params, function(err) {
						if (!!err) {
							logger.error('entyHandler.fixLeaveArea playerRemote.fixPlayerLeave error!');
						}
					});
				}
			}

		}
	}
	next();
};

var onUserLeave = function(app, session, reason) {
	if (!session || !session.uid) {
		return;
	}
	var playerId = session.get('playerId');
	// var instanceId = session.get('instanceId');
	var rpc=app.rpc;
	utils.myPrint('=========>>>OnUserLeave is running playerId=', playerId);
	if (rpc.area) {
		rpc.area.playerRemote.playerLeave(session, {
			playerId: playerId,
			// instanceId: instanceId,
			time:Date.now()
		}, function(err) {
			if (!!err) {
				logger.error('user leave error! %j', err);
			}
		});
	}
	if (rpc.manager) {
		var guildId=session.get('guildId');
		rpc.manager.guildRemote.playerLeave(session, session.uid,guildId,playerId, BlankFunc);
		rpc.manager.fightRemote.kick(session, playerId, BlankFunc);
	}
	handleRemote.chatRemote_kick(session, session.uid);
	// if (rpc.chat) {
	// 	rpc.chat.chatRemote.kick(session, session.uid, BlankFunc);
	// }
	if (rpc.trade) {
		rpc.trade.marketRemote.kick(session, playerId, BlankFunc);
	}
};

// var onUserLeave = function(app, session, reason) {
// 	if (!session || !session.uid) {
// 		return;
// 	}
// 	var playerId = session.get('playerId');
// 	var instanceId = session.get('instanceId');
// 	var rpc=app.rpc;
// 	utils.myPrint('=========>>>OnUserLeave is running playerId=', playerId, "instanceId=", instanceId);
// 	if (rpc.area) {
// 		rpc.area.playerRemote.playerLeave(session, {
// 			playerId: playerId,
// 			instanceId: instanceId,
// 			time:Date.now()
// 		}, function(err) {
// 			if (!!err) {
// 				logger.error('user leave error! %j', err);
// 			}
// 		});
// 	}
// 	if (rpc.manager) {
// 		var guildId=session.get('guildId');
// 		rpc.manager.guildRemote.playerLeave(session, session.uid,guildId,playerId, BlankFunc);
// 	}
// 	if (rpc.chat) {
// 		rpc.chat.chatRemote.kick(session, session.uid, BlankFunc);
// 	}
// 	if (rpc.trade) {
// 		rpc.trade.marketRemote.kick(session, playerId, BlankFunc);
// 	}
// 	if (rpc.fight) {
// 		rpc.fight.fightRemote.kick(session, playerId, BlankFunc);
// 	}
// };
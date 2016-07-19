/**
 * Module dependencies
 */
var handler = module.exports;
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var Fightskill = require('../../../util/dataApi').fightskill;
var Code = require('../../../../../shared/code');
var utils = require('../../../util/utils');
var dataApi = require('../../../util/dataApi');
var messageService = require('../../../domain/messageService');
var handleRemote = require('../../../consts/handleRemote');

var ActionType=consts.ActionType;
var AttackResult = consts.AttackResult;
var AreaKinds=consts.AreaKinds;
var EntityType = consts.EntityType;


/**
 * Action of attack.
 * Handle the request from client, and response result to client
 * if error, the code is consts.MESSAGE.ERR. Or the code is consts.MESSAGE.RES
 *
 * @param {Object} msg
 * @param {Object} session
 * @api public
 */

handler.useSkillAttack = function(msg, session, next) {
	var area = session.area;
	var player = session.player;
	if (player.died) {
		next(null, {
			code: 152
		});
		return;
	}
	var skillId = msg.skillId;
	var targetId = msg.targetId;
	var target = area.getEntity(targetId);
	// while (true) {
		if (!target) {
			next(null, {
				code: 153
			});
			return;
			// messageService.pushMessageByAOI(area, 'onRemoveEntities', {
			// 	entities: [targetId]
			// }, player);
			// break;
		}
		if(target.died) {
			next(null, {
				code: 154
			});
			return;
			// target = null;
			// break;
		}
		if (player.entityId === target.entityId) {
			next(null, {
				code: 155
			});
			return;
			// target = null;
			// break;
		}
		if (target.type !== EntityType.PLAYER && target.type !== EntityType.MOB) {
			next(null, {
				code: 156
			});
			return;
			// target = null;
			// break;
		}
	// 	break;
	// }
	// if (!target) {
	// 	next();
	// 	return;
	// }
	player.setIsMoving(false);
	area.timer.abortAction(ActionType.MOVE, player.entityId);
	// if (skillId) {
		var resultConst=player.attack(target, skillId);
		var code=200;
		if (resultConst===AttackResult.NO_ENOUGH_MP) {
			player.onHpMp({
				mp: player.mp,
				hp: player.hp
			});
			code=160;
		}else if (resultConst===AttackResult.NOT_SKILL) {
			code=156;
		}else if (resultConst===AttackResult.NOT_COOLDOWN) {
			code=157;
		}else if (resultConst===AttackResult.NOT_IN_RANGE) {
			code=158;
		}

	next(null, {
		code: code
	});
	// }
	// next();
};

handler.fightPrize = function(msg, session, next) {
	var area = session.area;
	if (area.areaKind === AreaKinds.FIGHT_AREA) {
		var player = session.player;
		var fightLevelData = dataApi.fightlevel.findById(player.fightLevel);
		if (fightLevelData) {
			player.addCaoCoin(fightLevelData.reward, function(err, ret) {
				if (err) {
					messageService.pushLogTipsToPlayer(player, 89);
				} else {
					// area.pushMessage("onDragArea", {areaId:2001});
					area.onDragArea(1001);

					if (player.fightLevel >= 4) {
						var msg = {
							broadId: 140,
							data: []
						};
						msg.data[0] = {
							playerId: player.id,
							name: player.name
						};
						msg.data[1] = fightLevelData.reward;
						handleRemote.chatRemote_pushMarquee(session, msg);
						// pomelo.app.rpc.chat.chatRemote.pushMarquee(session, msg, function() {});
					}
				}
			},true);
			
		} else {
			messageService.pushLogTipsToPlayer(player, 133);
		}
	}
	next();
};




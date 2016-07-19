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
		next();
		return;
	}
	var skillId = msg.skillId;
	var targetId = msg.targetId;
	var target = area.getEntity(targetId);
	while (true) {
		if (!target) {
			messageService.pushMessageByAOI(area, 'onRemoveEntities', {
				entities: [targetId]
			}, player);
			break;
		}
		if(target.died) {
			target = null;
			break;
		}
		if (player.entityId === target.entityId) {
			target = null;
			break;
		}
		if (target.type !== EntityType.PLAYER && target.type !== EntityType.MOB) {
			target = null;
			break;
		}
		break;
	}
	if (!target) {
		next();
		return;
	}
	player.setIsMoving(false);
	area.timer.abortAction(ActionType.MOVE, player.entityId);
	if (skillId) {
		var resultConst=player.attack(target, skillId);
		if (resultConst===AttackResult.NO_ENOUGH_MP) {
			var pushMsg={
				mp:player.mp,
				hp:player.hp
			};
    		player.onHpMp(pushMsg);
		}
	}
	next();
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
					area.onDragArea(2001);

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
						pomelo.app.rpc.chat.chatRemote.pushMarquee(session, msg, function() {});
					}
				}
			},true);
			
		} else {
			messageService.pushLogTipsToPlayer(player, 133);
		}
	}
	next();
};




var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var EntityType = consts.EntityType;
var ActionType = consts.ActionType;

var Action = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(Action, BTNode);

module.exports = Action;

var pro = Action.prototype;

/**
 * Move the character to the target.
 *
 * @return {Number} bt.RES_SUCCESS if the character already next to the target;
 *					bt.RES_WAIT if the character need to move to the target;
 *					bt.RES_FAIL if any fails
 */
pro.doAction = function() {
	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;
	var targetId = blackboard.curTarget;
	var target = blackboard.area.getEntity(targetId);

	if (!target || target.died) {
		// target has disappeared or died
		character.forgetHater(targetId);
		blackboard.curTarget = null;
		return bt.RES_FAIL;
	}

	if (targetId !== character.target) {
		//target has changed
		blackboard.curTarget = null;
		blackboard.distanceLimit = 0;
		blackboard.targetPos = null;
		blackboard.moved = false;
		return bt.RES_FAIL;
	}
	// var distance;
	if (!blackboard.distanceLimit) {
		// var skillId;
		// if (character.type === EntityType.MOB) {
		// 	skillId=character.curSkill;
		// }else{
			// skillId=character.getAvailableSkill();
			// character.curSkill=skillId;
		// }
		var skillId=character.getAvailableSkill();
		if (!skillId) {
			return bt.RES_WAIT;
		}

		character.curSkill=skillId;
		var fightSkill = character.fightSkills[skillId];
		blackboard.distanceLimit=fightSkill.distance;
	}
	
	var distance = blackboard.distanceLimit || 150;
	if (formula.inRange(character, target, distance)) {
		blackboard.area.timer.abortAction(ActionType.MOVE, character.entityId);
		blackboard.distanceLimit = 0;
		blackboard.moved = false;

		if (character.type===EntityType.PLAYER) {
			character.target=null;
			blackboard.curTarget = null;
		}

		return bt.RES_SUCCESS;
	}

	if (character.type === EntityType.MOB) {
		if (Math.abs(character.x - character.spawnX) > 500 ||
			Math.abs(character.y - character.spawnY) > 500) {
			//we move too far and it is time to turn back
			character.forgetHater(targetId);
			blackboard.moved = false;
			character.target = null;
			return bt.RES_FAIL;
		}
	}

	var targetPos = blackboard.targetPos;
	if (!blackboard.moved || !targetPos) {
		character.move(target.x, target.y, true, function(err, result) {
			if (err || result === false) {
				blackboard.moved = false;
				character.target = null;
			} else {
				// if(character.type === consts.EntityType.MOB) {
					character.setIsMoving(true);
				// }
			}
		});

		blackboard.targetPos = {
			x: target.x,
			y: target.y
		};
		blackboard.moved = true;
	} else if (targetPos && (targetPos.x !== target.x || targetPos.y !== target.y)) {
		var dis1 = formula.distance(targetPos.x, targetPos.y, target.x, target.y);
		var dis2 = formula.distance(character.x, character.y, target.x, target.y);

		//target position has changed
		if (((dis1 * 3 > dis2) && (dis1 < distance)) || !blackboard.moved) {
			targetPos.x = target.x;
			targetPos.y = target.y;

			character.move(target.x, target.y, true, function(err, result) {
				if (err || result === false) {
					blackboard.moved = false;
					character.target = null;
				}
			});
		} else {
			// if(character.type === consts.EntityType.MOB){
			if (!character.isMoving)
				blackboard.moved = false;
			// }
		}
	}
	return bt.RES_WAIT;
};

module.exports.create = function() {
	return Action;
};
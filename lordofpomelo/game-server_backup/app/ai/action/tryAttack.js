var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');
// var consts = require('../../consts/consts');
var EntityType = require('../../consts/consts').EntityType;
var AttackResult=require('../../consts/consts').AttackResult;
/**
 * Try attack action.
 *
 * @param opts {Object} {blackboard: blackboard, getSkillId: get skill id cb}
 */
var Action = function(opts) {
	BTNode.call(this, opts.blackboard);
	this.getSkillId = opts.getSkillId;
};
util.inherits(Action, BTNode);

module.exports = Action;

var pro = Action.prototype;

/**
 * Try to invoke the attack skill that returned by getSkillId callback.
 *
 * @return {Number} bt.RES_SUCCESS if success to invoke the skill;
 *					bt.RES_FAIL if any fails and set distanceLimit to blackboard stands for beyond the skill distance.
 */
pro.doAction = function() {
	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;
	var targetId = blackboard.curTarget;
	var target = blackboard.area.getEntity(targetId);

	if(!target || target.died) {
		// target has disappeared or died
		blackboard.curTarget = null;
		if(targetId === character.target) {
			character.forgetHater(targetId);
		}
		return bt.RES_FAIL;
	}

	if(targetId !== character.target) {
		//if target change abort current attack and try next action
		blackboard.curTarget = null;
		return bt.RES_FAIL;
	}

	if(target.type !== EntityType.MOB &&
		target.type !== EntityType.PLAYER){
		return bt.RES_FAIL;
	}
	if(!character.curSkill)
		return bt.RES_FAIL;

	var result = character.attack(target,character.curSkill);
	if(result === AttackResult.SUCCESS
		|| result === AttackResult.MISS 
		) {
		return bt.RES_SUCCESS;
	}

	// if(res.result === AttackResult.NOT_IN_RANGE) {
	// 	this.blackboard.distanceLimit = res.distance;
	// }

	return bt.RES_FAIL;
};

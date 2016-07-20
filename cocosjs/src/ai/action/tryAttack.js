
var TryAttack = function(opts) {
	BTNode.call(this, opts.blackboard);
	this.getSkillId = opts.getSkillId;
};
util.inherits(TryAttack, BTNode);

var pro = TryAttack.prototype;

pro.doAction = function() {
	// cc.log("TryAttack.doAction===========>>");
	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;
	var target = blackboard.curTarget;
	blackboard.moved = false;

	character.attackTime=character.attackTime || 0;
	if (character.attackTime > Date.now()) {
		return bt.RES_WAIT;
	}

	var skillId=character.getAvailableSkill();
	if (!skillId) {
		return bt.RES_WAIT;
	}

	character.curSkill=skillId;
	var fightSkill = character.fightSkills[skillId];
	blackboard.distanceLimit=fightSkill.skillData.distance-20;
	if(formula.inRange(character,target,blackboard.distanceLimit)) {
		if(character.getActionType()===Entity.kMActionIdle){
			character.attackTime = Date.now() + 500;
			character.useSkillAttack(skillId,target);
		}
		return bt.RES_WAIT;
	}
	return bt.RES_FAIL;
	// var target = this.blackboard.area.getEntity(targetId);

	// if(!target || target.died) {
	// 	character.targetId=null;
	// 	character.forgetHater(targetId);
	// 	return bt.RES_FAIL;
	// }

	// if(targetId !== character.targetId) {
	// 	return bt.RES_FAIL;
	// }

	// if(target.type !== EntityType.MOB &&
	// 	target.type !== EntityType.PLAYER){
	// 	return bt.RES_FAIL;
	// }

	// var result = character.aiAttack(target);
	// if(result === AttackResult.SUCCESS ||
	// 	// result === AttackResult.KILLED ||
	// 	// result === AttackResult.MISS ||
	// 	result === AttackResult.NOT_COOLDOWN) {
	// 	return bt.RES_SUCCESS;
	// }

	// if(result === AttackResult.NOT_IN_RANGE) {
	// 	this.blackboard.distanceLimit = character.attackDistance;
	// }

	// return bt.RES_FAIL;
};

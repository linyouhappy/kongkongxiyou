
var ContinueAttack = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(ContinueAttack, BTNode);

var pro = ContinueAttack.prototype;

pro.doAction = function() {
	var character = this.blackboard.curCharacter;
	var targetId = this.blackboard.curTarget;
	var target = this.blackboard.area.getEntity(targetId);

	if(!target || target.died) {
		character.targetId=null;
		this.blackboard.curTarget=null;
		cc.log("ContinueAttack.doAction===========>>目标已死");
		return bt.RES_SUCCESS;
	}

	if(character.getActionType()===Entity.kMActionIdle)
	{
		var skillId=character.getAvailableSkill();
		if(skillId!==null){
			character.useSkillAttack(skillId,target);
			cc.log("ContinueAttack.doAction===========>>发动攻击");

		}else{
			cc.log("ContinueAttack.doAction===========>>无技能可用");
		}
		// this.blackboard.delayTime=Date.now();
		return bt.RES_SUCCESS;
	}
	cc.log("ContinueAttack.doAction===========>>等待攻击");
	return bt.RES_WAIT;
};

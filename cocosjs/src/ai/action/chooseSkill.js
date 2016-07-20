
var ChooseSkill = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(ChooseSkill, BTNode);

var pro = ChooseSkill.prototype;

pro.doAction = function() {
	
	var character = this.blackboard.curCharacter;
	if (character.sprite.getActionType()===Entity.kMActionAttack) {

		return bt.RES_WAIT;
	}

	var skillId=character.getAvailableSkill();
	if(!skillId)
		return bt.RES_WAIT;

	character.curSkill=skillId;
	return bt.RES_SUCCESS;
};

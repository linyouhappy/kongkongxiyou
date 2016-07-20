
var ChooseTarget = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(ChooseTarget, BTNode);

var pro = ChooseTarget.prototype;

pro.doAction = function() {
	cc.log("ChooseTarget.doAction===========>>");
	
	var character = this.blackboard.curCharacter;
	var targetId = character.targetId;
	var target = this.blackboard.area.getEntity(targetId);
	if(!target){

		character.targetId=null;
		character.forgetHater(targetId);
		return bt.RES_FAIL;
	}

	this.blackboard.curTarget = targetId;
	return bt.RES_SUCCESS;
};


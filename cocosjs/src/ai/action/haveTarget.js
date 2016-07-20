
var HaveTarget = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(HaveTarget, BTNode);

var pro = HaveTarget.prototype;

pro.doAction = function() {
	cc.log("HaveTarget.doAction===========>>");
	var character = this.blackboard.curCharacter;
	// var targetId = character.targetId;
	var targetId = this.blackboard.curTarget;
	var target = this.blackboard.area.getEntity(targetId);

	if (!target) {
		character.forgetHater(targetId);
		this.blackboard.curTarget = null;
		return bt.RES_FAIL;
	}

	this.blackboard.curTarget = targetId;
	return bt.RES_SUCCESS;
};



var FindTarget = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(FindTarget, BTNode);

var pro = FindTarget.prototype;

pro.doAction = function() {
	cc.log("FindTarget.doAction===========>>");
	
	var character = this.blackboard.curCharacter;
	var target=character.getSelectTarget();
	if(!target){
		target=character.getMostHater();
		if(!target)
		{
			target=character.area.getNearbyMob(character);
		}
	}

	if(!target)
	{
		character.targetId=null;
		return bt.RES_WAIT;
	}
	this.blackboard.curTarget = target.entityId;
	character.targetId=target.entityId;
	return bt.RES_SUCCESS;
};


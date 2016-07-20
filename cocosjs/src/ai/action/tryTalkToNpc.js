
/**
 * Try pick action.
 * 
 * @param opts {Object} {blackboard: blackboard}
 */
var TryTalkToNpc = function(opts) {
	BTNode.call(this, opts.blackboard);
	this.distanceLimit =100;
};
util.inherits(TryTalkToNpc, BTNode);

var pro = TryTalkToNpc.prototype;

/**
 * Try to invoke the talk to npc action.
 * 
 * @return {Number} bt.RES_SUCCESS if success to talk to npc;
 *					bt.RES_FAIL if any fails and set distanceLimit to blackboard stands for beyond the npc distance.
 */
pro.doAction = function() {
	// cc.log("TryTalkToNpc.doAction=============>>");
	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;
	var target = blackboard.curTarget;

	blackboard.moved=false;
	target.talkTime=target.talkTime || 0;
	var currentTime=Date.now();
	// if (target.talkTime && target.talkTime > Date.now()) {
	// 	blackboard.curTarget = null;
	// 	character.targetAI = null;
	// 	return bt.RES_FAIL;
	// }
	if (target.pickTime-currentTime>0) {
		return bt.RES_WAIT;
	}

	if (formula.inRange(character, target, this.distanceLimit)) {
		character.talkNPC(target.entityId);
		target.talkTime = Date.now() + 2000;
		character.targetAI = null;
		return bt.RES_SUCCESS;
	}
	blackboard.distanceLimit = this.distanceLimit;
	return bt.RES_FAIL;
};



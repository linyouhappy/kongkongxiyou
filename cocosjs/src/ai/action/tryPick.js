/**
 * Try pick action.
 * 
 * @param opts {Object} {blackboard: blackboard}
 */
var TryPick = function(opts) {
	BTNode.call(this, opts.blackboard);
	this.distanceLimit = 80;
};
util.inherits(TryPick, BTNode);

var pro = TryPick.prototype;

/**
 * Try to invoke the pick the item.
 * 
 * @return {Number} bt.RES_SUCCESS if success to pick the item;
 *					bt.RES_FAIL if any fails and set distanceLimit to blackboard stands for beyond the item distance.
 */
pro.doAction = function() {
	// cc.log("TryPick.doAction=============>>");
	var blackboard = this.blackboard;
	var character = blackboard.curCharacter;
	var target = blackboard.curTarget;
	if (character.pickItemId && target.entityId!==character.pickItemId) {
		var item = this.blackboard.area.getEntity(character.pickItemId);
		if (item && item.type=== EntityType.ITEM) {
			character.cancelPick();
		}
		character.pickItemId=0;
	}

	blackboard.moved = false;
	var currentTime=Date.now();
	target.pickTime=target.pickTime || 0;
	// if (target.pickTime > currentTime) {
	// 	cc.log("=================>>>3");
	// 	blackboard.curTarget = null;
	// 	character.targetAI = null;
	// 	return bt.RES_FAIL;
	// }
	if (target.pickTime-currentTime>0) {
		return bt.RES_WAIT;
	}
	if (formula.inRange(character, target, this.distanceLimit)) {
		if(target.type===EntityType.ITEM){
			target.pickTime = currentTime + 5000;
		}else{
			target.pickTime = currentTime + 1500;
		}
		character.pickItem(target);
		character.targetAI = null;
		return bt.RES_SUCCESS;
	}
	blackboard.distanceLimit = this.distanceLimit;
	return bt.RES_FAIL;
};
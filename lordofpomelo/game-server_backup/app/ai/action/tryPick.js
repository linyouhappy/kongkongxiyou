var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');
var consts = require('../../consts/consts');
var EntityType = require('../../consts/consts').EntityType;
var Pick=consts.Pick
/**
 * Try pick action.
 * 
 * @param opts {Object} {blackboard: blackboard}
 */
var Action = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(Action, BTNode);

module.exports = Action;

var pro = Action.prototype;

/**
 * Try to invoke the pick the item.
 * 
 * @return {Number} bt.RES_SUCCESS if success to pick the item;
 *					bt.RES_FAIL if any fails and set distanceLimit to blackboard stands for beyond the item distance.
 */
pro.doAction = function() {
	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;
	var targetId = blackboard.curTarget;
	var area = blackboard.area;

	var target = area.getEntity(targetId);

	if(!target) {
		// target has disappeared
		blackboard.curTarget = null;
		if(targetId === character.target) {
			character.target = null;
		}
		return bt.RES_FAIL;
	}

	if(targetId !== character.target 
		|| (target.type !==EntityType.ITEM 
			&& target.type !==EntityType.EQUIPMENT)) {
		// if target changed or is not pickable
		blackboard.curTarget = null;
		return bt.RES_FAIL;
	}

	var res = character.pickItem(target.entityId);
	if(res === Pick.SUCCESS  
		|| res === Pick.VANISH 
		|| res === Pick.BAG_FULL
		) {
		blackboard.curTarget = null;
		character.target = null;
		return bt.RES_SUCCESS;
	}

	if(res === Pick.NOT_IN_RANGE) {
		blackboard.distanceLimit = 100;
	}
	
	return bt.RES_FAIL;
};

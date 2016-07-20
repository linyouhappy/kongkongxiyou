/**
 * BrainNode action.
 * Try to do a action and return success if the action success.
 * If fail then do the adjustment and try it again when adjust return success.
 *
 * @param opts {Object} 
 *				opts.blackboard {Object} blackboard
 *				opts.adjustAction {BTNode} adjust action
 *				opts.tryAction {BTNode} try action}
 */
var BrainNode = function(opts) {
	BTNode.call(this, opts.blackboard);
	this.actions = opts.actions;
	// var adjustAndTryAgain = new Sequence(opts);
	// adjustAndTryAgain.addChild(opts.adjustAction);
	// adjustAndTryAgain.addChild(opts.tryAction);

	// var tryAndAdjust = new Select(opts);
	// tryAndAdjust.addChild(opts.tryAction);
	// tryAndAdjust.addChild(adjustAndTryAgain);

	// this.action = tryAndAdjust;
};
util.inherits(BrainNode, BTNode);

var pro = BrainNode.prototype;


pro.doAction = function() {
	var blackboard = this.blackboard;
	var character = blackboard.curCharacter;
	var targetId = character.targetAI;
	var area = blackboard.area;
	if (character.isControl()) {
		return bt.RES_FAIL;
	}

	var target;
	if (!targetId) {
		if (character.isEnableAI) {
			target=character.getAITargetEntity();
			if (target) {
				character.targetAI = target.entityId;
			} else {
				character.randomMove();
				return bt.RES_FAIL;
			}
		}
	}
	
	if (!targetId) return bt.RES_FAIL;

	if (!target) {
		target = area.getEntity(targetId);
		if (!target || target.died) {
			character.forgetHater(targetId);
			character.targetAI = null;
			return bt.RES_FAIL;
		}
	}

	blackboard.curTarget = target;
	var entityType = target.type;
	if (entityType === EntityType.ITEM || entityType === EntityType.EQUIPMENT) {
		return this.actions[0].doAction();
	} else if (entityType === EntityType.MOB || entityType === EntityType.PLAYER) {
		character.selectTarget(target);
		return this.actions[1].doAction();

	} else if (entityType === EntityType.NPC) {
		return this.actions[2].doAction();
	}
	return bt.RES_FAIL;
};
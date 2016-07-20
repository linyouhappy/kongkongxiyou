var ContinueMove = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(ContinueMove, BTNode);

var pro = ContinueMove.prototype;

/**
 * Move the character to the target.
 *
 * @return {Number} bt.RES_SUCCESS if the character already next to the target;
 *					bt.RES_WAIT if the character need to move to the target;
 *					bt.RES_FAIL if any fails
 */
pro.doAction = function() {
	var blackboard = this.blackboard;
	var target = blackboard.curTarget;

	if (!target) {
		return bt.RES_FAIL;
	}

	var character = blackboard.curCharacter;
	if (character.getActionType() !== Entity.kMActionIdle)
		return bt.RES_WAIT;

	var distance = blackboard.distanceLimit || 100;
	if (formula.inRange(character, target, distance)) {
		return bt.RES_SUCCESS;
	}
	var targetX = target.x;
	var targetY = target.y;
	var directId = utils.calculateDirection(character.x, character.y, targetX, targetY);
	var directPoint = consts.move_dir[directId];

	if (directPoint.y === 0) {
		if (targetY >= character.y) {
			directPoint.y = 1;
		} else {
			directPoint.y = -1;
		}
	}

	var x = targetX - directPoint.x * (30+10*Math.random());
	var y = targetY - directPoint.y * 40;
	if (!blackboard.area.map.isReachable(x, y)) {
		x = targetX - directPoint.x * 20;
		y = targetY - directPoint.y * 20;
		if (!blackboard.area.map.isReachable(x, y)) {
			x = targetX;
			y = targetY;
		}
	}
	if (character.moveToTarget(x, y)) {
		blackboard.moved = true;
	} else {
		character.targetAI = null;
		return bt.RES_FAIL;
	}
	return bt.RES_WAIT;
};
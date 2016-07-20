
var MoveToTarget = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(MoveToTarget, BTNode);

var pro = MoveToTarget.prototype;

/**
 * Move the character to the target.
 *
 * @return {Number} bt.RES_SUCCESS if the character already next to the target;
 *					bt.RES_WAIT if the character need to move to the target;
 *					bt.RES_FAIL if any fails
 */

 pro.getGoodPoint=function(character,target){
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

	var x = targetX - directPoint.x * 40;
	var y = targetY - directPoint.y * 40;
	if (!blackboard.area.map.isReachable(x, y)) {
		x = targetX - directPoint.x * 20;
		y = targetY - directPoint.y * 20;
		if (!blackboard.area.map.isReachable(x, y)) {
			x = targetX;
			y = targetY;
		}
	}
	return {x:x,y:y};
 };

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
	// if (formula.inRange(character, target, distance)) {
	// 	return bt.RES_SUCCESS;
	// }

	var targetX=target.x;
	var targetY=target.y;
	var dx = targetX-character.x;
  	var dy = targetY-character.y;
  	var sqrtLen=Math.sqrt(dx*dx+dy*dy);
  	if (sqrtLen<distance) {
  		cc.log("完成 distance="+distance+",sqrtLen="+sqrtLen);
  		return bt.RES_SUCCESS;
  	}

  	cc.log("distance="+distance+",sqrtLen="+sqrtLen);
  	// distance+=10;
	if (sqrtLen < 40) {
		// var targetPoint = pro.getGoodPoint(character, target);
		targetX = targetX+(Math.random()>0.5?40:-40);
//		targetY = targetY+(Math.random()>0.5?40:-40);
		if (character.moveToTarget(targetX, targetY)) {
			blackboard.moved = true;
			return bt.RES_WAIT;
		} else {
			character.targetAI = null;
			return bt.RES_FAIL;
		}
	}
  	sqrtLen=distance/sqrtLen;
	targetX = character.x+dx*sqrtLen;
	targetY = character.y+dy*sqrtLen;
	if (!blackboard.area.map.isReachable(targetX, targetY)) {
		var targetPoint= pro.getGoodPoint(character,target);
		targetX=targetPoint.x;
		targetY=targetPoint.y;
		// // var directId = utils.calculateDirection(character.x, character.y, targetX, targetY);
		// // var directPoint = move_dir[directId];
		// // targetX = targetX - directPoint.x * 20;
		// // targetY = targetY - directPoint.y * 20;
		// if (!blackboard.area.map.isReachable(targetX, targetX)) {
		// 	blackboard.curTarget=null;
		// 	return bt.RES_FAIL;
		// }
	}
	if (character.moveToTarget(targetX,targetY)) {
		blackboard.moved = true;
	} else {
		character.targetAI = null;
		return bt.RES_FAIL;
	}
	return bt.RES_WAIT;
};


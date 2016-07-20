
var Patrol = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(Patrol, BTNode);

var pro = Patrol.prototype;

/**
 * Move the current mob into patrol module and remove it from ai module.
 *
 * @return {Number} bt.RES_SUCCESS if everything ok;
 *					bt.RES_FAIL if any error.
 */
pro.doAction = function() {
	var character = this.blackboard.curCharacter;
	var area = this.blackboard.area;

	area.timer.patrol(character.entityId);
	return bt.RES_SUCCESS;
};



var DelayAction = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(DelayAction, BTNode);

var pro = DelayAction.prototype;

pro.doAction = function() {
	var delayTime = this.blackboard.delayTime;
	if (delayTime<Date.now()) {
		return bt.RES_SUCCESS;
	}
	return bt.RES_WAIT;
};


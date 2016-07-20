
/**
 * Try and adjust action.
 * Try to do a action and return success if the action success.
 * If fail then do the adjustment and try it again when adjust return success.
 *
 * @param opts {Object} 
 *				opts.blackboard {Object} blackboard
 *				opts.adjustAction {BTNode} adjust action
 *				opts.tryAction {BTNode} try action}
 */
var TryAndAdjust = function(opts) {
	BTNode.call(this, opts.blackboard);

	var adjustAndTryAgain = new Sequence(opts);
	adjustAndTryAgain.addChild(opts.adjustAction);
	adjustAndTryAgain.addChild(opts.tryAction);

	var tryAndAdjust = new Select(opts);
	tryAndAdjust.addChild(opts.tryAction);
	tryAndAdjust.addChild(adjustAndTryAgain);

	this.action = tryAndAdjust;
};
util.inherits(TryAndAdjust, BTNode);


var pro = TryAndAdjust.prototype;

pro.doAction = function() {
	return this.action.doAction();
};

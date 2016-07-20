
/**
 * If node: invoke the action if the condition is true
 * 
 * @param opts {Object}
 *        opts.blackboard {Object} blackboard
 *        opts.action {BTNode} action that would be invoked if cond return true
 *        opts.cond(blackboard) {Function} condition callback, return true or false.
 */
var If = function(opts) {
  BTNode.call(this, opts.blackboard);

  this.action = new Sequence({
    blackboard: opts.blackboard
  });

  var condition = new Condition({
    blackboard: opts.blackboard, 
    cond: opts.cond
  });

  this.action.addChild(condition);
  this.action.addChild(opts.action);
};
util.inherits(If, BTNode);

var pro = If.prototype;

/**
 * Move the current mob into patrol module and remove it from ai module.
 *
 * @return {Number} ai.RES_SUCCESS if everything ok;
 *                  ai.RES_FAIL if any error.
 */
pro.doAction = function() {
  return this.action.doAction();
};

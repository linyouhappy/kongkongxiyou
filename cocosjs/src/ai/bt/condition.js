
/**
 * Condition node.
 *
 * @param opts {Object} 
 *        opts.blackboard {Object} blackboard object
 *        opts.cond(blackboard) {Function} condition callback. Return true or false to decide the node return success or fail.
 * @return {Number} 
 *          bt.RES_SUCCESS if cond callback return true;
 *          bt.RES_FAIL if cond undefined or return false.
 */
var Condition = function(opts) {
  BTNode.call(this, opts.blackboard);
  this.cond = opts.cond;
};
util.inherits(Condition, BTNode);

var pro = Condition.prototype;

pro.doAction = function() {
  if(this.cond && this.cond.call(null, this.blackboard)) {
    return bt.RES_SUCCESS;
  }

  return bt.RES_FAIL;
};

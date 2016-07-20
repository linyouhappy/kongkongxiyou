
/**
 * Select node: a parent node that would invoke children one by one.
 * Return success and reset state if one child return success.
 * Return fail if all children fail.
 * Return wait and hold state if one child return wait.
 */
var Select = function(opts) {
  Composite.call(this, opts.blackboard);
  this.index = 0;
};
util.inherits(Select, Composite);

var pro = Select.prototype;

/**
 * Do the action
 */
pro.doAction = function() {
  if(!this.children.length) {
    //if no child
    return bt.RES_SUCCESS;
  }

  if(this.index >= this.children.length) {
    this.reset();
  }

  var res;
  for(var l=this.children.length; this.index<l; this.index++) {
    res = this.children[this.index].doAction();
    if(res === bt.RES_SUCCESS) {
      //reset and return if success
      this.reset();
      return res;
    } else if(res === bt.RES_WAIT) {
      //return to parent directly if wait
      return res;
    } else {
      //try next if fail
      continue;
    }
  }
  //we will return success if all children success
  this.reset();
  return bt.RES_FAIL;
};

/**
 * Reset the node state
 */
pro.reset = function() {
  this.index = 0;
};

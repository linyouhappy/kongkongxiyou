
/**
 * Decorator node: parent of nodes that decorate other node. 
 */
var Decorator = function(blackboard, child) {
  BTNode.call(this, blackboard);
  this.child = child;
};
util.inherits(Decorator, BTNode);

var pro = Decorator.prototype;

/**
 * set the child fo the node
 */
pro.setChild = function(node) {
  this.child = node;
};

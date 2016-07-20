
/**
 * Composite node: parent of nodes that have multi-children. 
 */
var Composite = function(blackboard) {
  BTNode.call(this, blackboard);
  this.blackboard = blackboard;
  this.children = [];
};
util.inherits(Composite, BTNode);

var pro = Composite.prototype;

/**
 * Add a child to the node
 */
pro.addChild = function(node) {
  this.children.push(node);
};

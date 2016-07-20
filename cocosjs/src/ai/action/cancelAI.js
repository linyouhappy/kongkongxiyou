
var CancelAI = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(CancelAI, BTNode);

var pro = CancelAI.prototype;

pro.doAction = function(){
	cc.log("CancelAI.doAction===========>>");
	this.blackboard.curCharacter.cancelAI();
	return bt.RES_FAIL;
};


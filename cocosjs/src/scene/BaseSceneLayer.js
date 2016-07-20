var BaseSceneLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
	},
    
	createCCSNode:function(ccbFileName){
		var x = cc.winSize.width/2;
        var y = cc.winSize.height/2;
        var ccsNode = ccs.CSLoader.createNode(ccbFileName);
        ccsNode.setPosition(x,y);
        this.addChild(ccsNode);
        this._ccsNode=ccsNode;
	}

});

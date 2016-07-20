
var LoadingLayer = BaseSceneLayer.extend({
    _ccsNode:null,
    ctor:function () {
        this._super();
        this.createCCSNode("uiccs/LoadingLayer.csb");

        var ccsNode=this._ccsNode;

        this.loadingBar=ccsNode.getChildByName("loadingBar");
        this.loadingText=ccsNode.getChildByName("loadingText");

        cc.log("LoadingLayer =======>>");
    },
    setPercent:function(percent){
        this.loadingBar.setPercent(percent);
    },

    setString:function(loadingTips){
        this.loadingText.setString(loadingTips);
    },


});

var LoadingScene = cc.Scene.extend({
    _loadingLayer:null,
    ctor:function () {
        this._super();
        this._loadingLayer = new LoadingLayer();
        this.addChild(this._loadingLayer);

        this.setTag(16883);

        // this.setVisible(false);
    }
});


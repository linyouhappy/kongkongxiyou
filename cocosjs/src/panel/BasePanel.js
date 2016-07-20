cb.BasePanel = cc.Layer.extend({
    ctor:function () {
        this._super();
	},
	createCCSNode:function(ccbFileName){
		var bgSprite=cc.Scale9Sprite.createWithSpriteFrameName("color_black.png");
		bgSprite.setContentSize(cc.size(cc.winSize.width,cc.winSize.height));
		this.addChild(bgSprite);
		// bgSprite.setPosition(cc.winSize.width/2,cc.winSize.height/2);
		bgSprite.setOpacity(150);

        var ccsNode = ccs.CSLoader.createNode(ccbFileName);
        this.addChild(ccsNode);
        this._ccsNode=ccsNode;

        var closeBtn = ccsNode.getChildByName("closeBtn");
        if(!!closeBtn){
        	closeBtn.addTouchEventListener(this.__touchEvent,this);
        	closeBtn.setPressedActionEnabled(true);
        	closeBtn.setLocalZOrder(1000);
            closeBtn.setPosition(cc.winSize.width/2-50,cc.winSize.height/2-40);

            closeBtn.setSoundEffectFile("sound/ui/button_close.mp3");
        }

        ccsNode.setScale(0.1);
        ccsNode.runAction(cc.ScaleTo.create(0.2,1));
	},

	__touchEvent: function (sender, type) {
        if(type===ccui.Widget.TOUCH_ENDED) {
            this.closePanel();
        }
    },

	closePanel:function(){
		layerManager.closePanel(this);
	},

	updatePanel:function(){
	},

	setPanelData:function(){
	},

	openBgTouch:function(){
		var onTouchBegan = function(touch, event) {
			return true;
		};
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan
		}, this);
	}

});


cb.BasePanelLayer = cc.Layer.extend({
    // ctor: function() {
    //     this._super();
    //     this.setInitData();
    //     this.enableBg();

    //     this.openBgTouch();

    // },

    setInitData:function(){
        var ccsNode = ccs.CSLoader.createNode(this.csbFileName);
        this.ccsNode=ccsNode;
        this.addChild(ccsNode);
        
        var bgImage = ccsNode.getChildByName("bgImage");
        var contentSize = bgImage.getContentSize();

        this.m_width = contentSize.width;
        this.m_height = contentSize.height;
        this.panelInitAction();
    },

    panelInitAction:function(){
        this.ccsNode.setScale(0.1);
        this.ccsNode.runAction(cc.ScaleTo.create(0.2,1));
    },

    setPanelData: function() {
    },

    updatePanelData:function(){

    },

    enableBg: function() {
        if (this.bgSprite) return;

        var bgSprite = cc.Scale9Sprite.createWithSpriteFrameName("color_black.png");
        bgSprite.setContentSize(cc.size(cc.winSize.width * 2, cc.winSize.height * 2));
        this.ccsNode.addChild(bgSprite);
        bgSprite.setLocalZOrder(-1);
        bgSprite.setOpacity(150);
        bgSprite.setVisible(false);
        this.bgSprite = bgSprite;
        bgSprite.runAction(cc.Sequence.create(cc.DelayTime.create(0.2),cc.Show.create()));
    },

    openBgTouch:function(){
        var onTouchBegan = function(touch, event) {
            return true;
        };
        var self = this;
        var onTouchEnded = function(touch, event) {
            var location = self.convertTouchToNodeSpace(touch);
            if (!(location.x > -self.m_width/2 
                && location.x < self.m_width/2 
                && location.y > -self.m_height/2 
                && location.y < self.m_height/2)) {
                self.closeLayer();
            }
        };
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan,
            onTouchEnded: onTouchEnded
        }, this);
    },

    closeLayer:function(){
        this.closePanel();
    },

    closePanel:function(){
        layerManager.closePanel(this);
    }
});
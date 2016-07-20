cb.BaseLayer = cc.Class.extend({
     ctor: function() {
        cc.log("cb.BaseLayer====>");

     },

    setLayer: function() {
        if (!mainPanel || !this.csbFileName){
            cc.log("ERROR:mainPanel===null || csbFileName===null");
            return;
        }

        var ccsNode = ccs.CSLoader.createNode(this.csbFileName);
        var bgImage = ccsNode.getChildByName("bgImage");
        var contentSize = bgImage.getContentSize();

        this.m_width = contentSize.width;
        this.m_height = contentSize.height;
        this.ccsNode = ccsNode;
        
        this.enableBg();
        this.openBgTouch();

        var areaScene = mainPanel;
        ccsNode.setLocalZOrder(500);
        areaScene.addChild(ccsNode);

        ccsNode.setScale(0.1);
        ccsNode.runAction(cc.ScaleTo.create(0.2,1));

        ccsNode.setPosition(cc.winSize.width / 2,cc.winSize.height / 2);
    },

    closeLayer: function() {
        this.ccsNode.removeFromParent();
    },

    openBgTouch: function() {
        var self = this;
        var onTouchBegan = function(touch, event) {
            return true;
        };

        var onTouchEnded = function(touch, event) {
            var location = self.ccsNode.convertTouchToNodeSpace(touch);
            if (!(location.x >= -self.m_width/2
                && location.x <= self.m_width/2
                 && location.y >= -self.m_height/2 
                 && location.y <= self.m_height/2)) {
                self.closeLayer();
            }
        };

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan,
            onTouchEnded: onTouchEnded
        }, this.ccsNode);
    },

    enableBg: function() {
        if (this.bgSprite) return;

        var bgSprite = cc.Scale9Sprite.createWithSpriteFrameName("color_black.png");
        bgSprite.setContentSize(cc.size(cc.winSize.width * 2, cc.winSize.height * 2));
        this.ccsNode.addChild(bgSprite);
        bgSprite.setLocalZOrder(-1);
        bgSprite.setOpacity(150);
        this.bgSprite = bgSprite;
    },

    touchEvent: function(sender, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
            switch (sender.getTag()) {
            }
            this.closeLayer();
        }
    }
});
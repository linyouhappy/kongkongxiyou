cb.ListMenuLayer = cc.Layer.extend({
    ctor: function(listDatas) {
        this._super()
        this.__initView(listDatas);

        var runningScene = cc.director.getRunningScene();
        var nodeContainer = runningScene.getChildByTag(138748);
        if (!!nodeContainer)
            runningScene.removeChildByTag(138748, true);

        runningScene.addChild(this);

        this.setLocalZOrder(1000);
        this.setTag(138748);
    },

    __initView:function(listDatas){
        this.listDatas=listDatas;

        var bgSprite = cc.Scale9Sprite.createWithSpriteFrameName("bg_underframe_2.png");
        bgSprite.setAnchorPoint(cc.p(0,1));
        this.addChild(bgSprite);

        var frameSprite = cc.Scale9Sprite.createWithSpriteFrameName("bg_frame_2.png");
        frameSprite.setAnchorPoint(cc.p(0,1));
        this.addChild(frameSprite);


        var itemCount=formula.getKeysLength(listDatas);
        var itemHeight=60;
        var m_width = 350;
        var m_height = itemHeight*itemCount+80;
        bgSprite.setContentSize(cc.size(m_width, m_height));
        frameSprite.setContentSize(cc.size(m_width, m_height));

        this.setPosition(cc.winSize.width / 2-m_width/2, cc.winSize.height / 2+m_height/2);

        var menu = new cc.Menu();
        menu.setPosition(0, 0);
        this.addChild(menu);

        var yPosition=-40-itemHeight/2;
        var xPosition=m_width/2;
        var labelPosition;
        var id,name,btnLabel,normalSprite,selectedSprite,menuItemSprite;
        var i=0;
        for (var key in listDatas) {
            name=listDatas[key];
            id=Number(key);
            btnLabel = cc.Label.createWithSystemFont(name, "Arial", 26);

            normalSprite = new cc.Sprite("#btn_red_long_glass.png");
            selectedSprite = new cc.Sprite("#btn_gray_long_glass.png");

            menuItemSprite = new cc.MenuItemSprite(normalSprite, selectedSprite, null, this.onMenuCallback, this);
            menuItemSprite.setTag(id);
            menu.addChild(menuItemSprite)
            menuItemSprite.setPosition(xPosition, yPosition - itemHeight * i);
            menuItemSprite.addChild(btnLabel);
            if (!labelPosition) {
                labelPosition=cc.p(normalSprite.getContentSize().width / 2, normalSprite.getContentSize().height / 2);
            }
            btnLabel.setPosition(labelPosition);
            i++;
        }

        // var btnLabel = cc.Label.createWithSystemFont("+", "Arial", 45);
        // this.addChild(btnLabel);

        var onTouchBegan = function(touch, event) {
            return true;
        };

        var self = this;
        var onTouchEnded = function(touch, event) {
            var location = self.convertTouchToNodeSpace(touch);
            if (location.x<0 
                || location.x> m_width 
                || location.y >0 
                || location.y < -m_height) {

                self.removeFromParent();
            }
        };
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan,
            onTouchEnded: onTouchEnded
        }, this);
    },

    onMenuCallback: function(sender) {
        if (this.callback) {
            this.callback(sender.getTag());
        }
        this.removeFromParent();
    }
});

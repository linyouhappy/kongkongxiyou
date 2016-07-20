cb.NewFunctionPanel = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName = "uiccs/NewFunctionLayer.csb";
		this.setInitData();
		// this.enableBg();
		this.openBgTouch();
		this.initView();
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
    },

	initView: function() {
		var ccsNode = this.ccsNode;
		var yesBtn = ccsNode.getChildByName("yesBtn");
		yesBtn.addTouchEventListener(this.touchEvent, this);

		var itemNode = ccsNode.getChildByName("itemNode");

		cc.spriteFrameCache.addSpriteFrames("effect/light_background.plist");
		var selectSprite = new cc.Sprite("#light_background.png");
		selectSprite.setPosition(itemNode.getPosition());
		ccsNode.addChild(selectSprite);
		var onActionCallback = function() {
			var sequence = cc.Sequence.create(
				cc.Spawn.create(
					cc.ScaleTo.create(0.5 + Math.random() * 2, selectSprite.getScale() > 1 ? 0.7 : 1.2),
					cc.RotateBy.create(0.5 + Math.random() * 2, Math.random() > 0.5 ? 360 : -360)
				),
				cc.CallFunc.create(onActionCallback)
			);
			selectSprite.runAction(sequence);
		};
        selectSprite.runAction(cc.CallFunc.create(onActionCallback));
        
        var iconSprite=new cc.Sprite();
        iconSprite.setPosition(itemNode.getPosition());
		ccsNode.addChild(iconSprite);
		iconSprite.setScale(1.3);
		itemNode.removeFromParent();

		this.iconSprite=iconSprite;

		this.touchEffect();
	},

	touchEffect:function(){
        var container=cc.Node.create();

        var touchSprite = new cc.Sprite("update/gesture_touch.png");
        container.addChild(touchSprite);
        var handSprite = new cc.Sprite("update/gesture_hand.png");
        container.addChild(handSprite);
        touchSprite.setPosition(-20, 20);

        var interval = 0.2;
        var interval2 = 0.4;
        var sequence = cc.Sequence.create(cc.MoveTo.create(interval, cc.p(0, 0)), cc.MoveTo.create(interval2, cc.p(15, -15)));
        handSprite.runAction(cc.RepeatForever.create(sequence));

        sequence = cc.Sequence.create(
            cc.ScaleTo.create(interval, 0.01),
            cc.ScaleTo.create(interval2, 1.1),
            cc.ScaleTo.create(0, 0.01)
        );
        touchSprite.runAction(cc.RepeatForever.create(sequence));
        
        container.setPosition(20,-110);
        this.ccsNode.addChild(container);
    },

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName() === "yesBtn") {
				mainPanel.setInvisibleItem(this.functionId);
				mainPanel.fadeInItem(this.functionId);
			}
			var ccsNode=this.ccsNode;
			this.closePanel();
			this.stopAllActions();

			var sequence = cc.Sequence.create(
				cc.ScaleTo.create(0.2, 1.2),
				cc.ScaleTo.create(0.1, 0.1),
				cc.RemoveSelf.create()
			);
			ccsNode.runAction(sequence);

			sequence = cc.Sequence.create(
				cc.DelayTime.create(2),
				cc.RemoveSelf.create()
			);
			this.runAction(sequence);
		}
	},

	setPanelData: function(panelId) {
		this.functionId=panelId;
		var menuToSprite=cb.MenuLayer.menuToSprites[panelId];
		this.iconSprite.setSpriteFrame(menuToSprite.substring(1));
	}

});
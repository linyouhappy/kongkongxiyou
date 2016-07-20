cb.NewEquipmentPanel = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName = "uiccs/NewEquipmentLayer.csb";
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
		var noBtn = ccsNode.getChildByName("noBtn");
		noBtn.addTouchEventListener(this.touchEvent, this);

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
        
		var itemBox = cb.ItemBox.create();
		itemBox.setDefaultSetting();
		itemBox.enableEvent(true);
		itemBox.enableKeepSelect(true);

		ccsNode.addChild(itemBox);
		itemBox.setPosition(itemNode.getPosition());

		itemNode.removeFromParent();

		var self = this;
		var onItemBoxCallback = function(itemBox) {
			if (self.item) {
				var worldPoint = itemBox.convertToWorldSpace(cc.p(0, 0));
				var itemDetailLayer = new cb.ItemDetailLayer(self.item)
				itemDetailLayer.setPosition(worldPoint);
			}
		};
		itemBox.addEventListener(onItemBoxCallback);
		this.itemBox = itemBox;
	},

	closePanel: function() {
		var ccsNode=this.ccsNode;
		layerManager.closePanel(this);
		this.stopAllActions();
		var sequence = cc.Sequence.create(
			cc.ScaleTo.create(0.2, 1.2),
			cc.ScaleTo.create(0.1, 0.1),
			cc.RemoveSelf.create()
		);
		ccsNode.runAction(sequence);
		sequence = cc.Sequence.create(
			cc.DelayTime.create(0.3),
			cc.RemoveSelf.create()
		);
		this.runAction(sequence);
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName() === "yesBtn") {
				// equipHandler.equip(this.item.id);
				this.equipEquipment();
			}
			this.closePanel();
		}
	},

	equipEquipment:function(){
		equipHandler.equip(this.item.id);
	},

	setSingleBtn:function(){
		var ccsNode = this.ccsNode;
		var yesBtn = ccsNode.getChildByName("yesBtn");
		var noBtn = ccsNode.getChildByName("noBtn");
		noBtn.removeFromParent();
		yesBtn.setPosition(0,-77);
	},

	setPanelData: function(item) {
		this.item = item;
		var itemBox = this.itemBox;
		if (itemBox && item && item.itemData) {
			itemBox.setItemId(item.id);
			imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
			itemBox.setIconSprite(imgPath);
			itemBox.adjustIconSprite();
			var itemColorName = "item_color_" + Math.ceil(item.totalStar / 2) + ".png"
			itemBox.setColorSprite(itemColorName);
		} else {
			itemBox.enableIconSprite(false);
			itemBox.enableColorSprite(false);
			itemBox.setItemId(0);
		}
	}
});
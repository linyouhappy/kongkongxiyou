cb.ShopBuyItemPanel = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName = "uiccs/ShopBuyItemLayer.csb";
		this.setInitData();
		this.enableBg();
		this.openBgTouch();
		this.initView();
	},

	initView: function() {
		var ccsNode = this.ccsNode;
		var buyBtn = ccsNode.getChildByName("buyBtn");
		buyBtn.addTouchEventListener(this.touchEvent, this);

		this.coinSprite = ccsNode.getChildByName("coinSprite");
		this.moneyText=ccsNode.getChildByName("moneyText");
		this.priceText=ccsNode.getChildByName("priceText");

		var itemNode = ccsNode.getChildByName("itemNode");

		var itemBox = cb.ItemBox.create();
		itemBox.setDefaultSetting();
		itemBox.enableEvent(true);
		itemBox.enableKeepSelect(true);

		ccsNode.addChild(itemBox);
		itemBox.setPosition(itemNode.getPosition());

		itemNode.removeFromParent();

		var self = this;
		var onItemBoxCallback = function(itemBox) {
			if (self.shopItem) {
				var worldPoint = itemBox.convertToWorldSpace(cc.p(0, 0));
				var itemDetailLayer = new cb.ItemDetailLayer(self.shopItem)
				itemDetailLayer.setPosition(worldPoint);
			}
		};
		itemBox.addEventListener(onItemBoxCallback);
		this.itemBox = itemBox;

		this.countSlider = ccsNode.getChildByName("countSlider");
		this.totalText=ccsNode.getChildByName("totalText");
		this.countSlider.setPercent(0);

		var self=this;
        var sliderEvent=function(sender, type){
            if(type===ccui.Slider.EVENT_PERCENT_CHANGED){
                var percent = sender.getPercent();
                self.setPercent(percent);
            }
        };
        this.countSlider.addEventListener(sliderEvent);

        this.maxCount=0;
        this.buyCount=0;
	},

	setPercent:function(percent){
		this.buyCount=Math.floor(this.maxCount*percent/100);
		var totalCost=this.buyCount*this.shopItem.price;
		this.totalText.setString(totalCost);
		this.itemBox.setRightDownLabelString("x"+this.buyCount);
	},

	closePanel: function() {
		layerManager.closePanel(this);
		this.stopAllActions();
		var sequence = cc.Sequence.create(
			cc.ScaleTo.create(0.2, 1.2),
			cc.ScaleTo.create(0.1, 0.1),
			cc.RemoveSelf.create()
		);
		this.ccsNode.runAction(sequence);
		sequence = cc.Sequence.create(
			cc.DelayTime.create(0.3),
			cc.RemoveSelf.create()
		);
		this.runAction(sequence);
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (this.isNoMoney) {
				this.moneyText.runAction(cc.Blink.create(2,8));
				quickLogManager.pushLog("口袋空空，一个都买不了！",4);
				return;
			}
			if (!this.buyCount) {
				quickLogManager.pushLog("请先指定购买数量！",4);
				this.countSlider.runAction(cc.Blink.create(2,8));
				return;
			}
			shopHandler.shopBuy(this.shopItem.id,this.buyCount);
			this.closePanel();
		}
	},

	setPanelData: function(shopItem) {
		if (!shopItem || !shopItem.itemData){
			quickLogManager.pushLog("购买的物品不存在！",4);
			return;
		} 
		this.totalText.setString(0);
		this.shopItem = shopItem;

		// this.moneyNameText.setString(MoneyNames[shopItem.moneyType]+":");
		this.priceText.setString(shopItem.price+"/个");

		this.itemBox.setIconSprite(formula.skinIdToIconImg(shopItem.itemData.skinId));
		this.itemBox.adjustIconSprite();

		this.itemBox.setRightDownLabelString("x0");

		var curPlayer = app.getCurPlayer();
		if (shopItem.moneyType===MoneyTypes.caoCoin) {
			this.moneyText.setString(curPlayer.caoCoin);
			this.maxCount=Math.floor(curPlayer.caoCoin/shopItem.price);
			if (curPlayer.caoCoin<shopItem.price) {
				this.moneyText.setColor(consts.COLOR_RED);
				this.isNoMoney=true;
			}
		}else{
			this.coinSprite.setSpriteFrame("icon_cristal.png");
			this.moneyText.setString(curPlayer.crystal);
			this.maxCount=Math.floor(curPlayer.crystal/shopItem.price);
			if (curPlayer.crystal<shopItem.price) {
				this.moneyText.setColor(consts.COLOR_RED);
				this.isNoMoney=true;
			}
		}
	}
});


cb.ShopPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/ShopPanel.csb");
		this.__initView();
		this.limitScrollViewEvent();
		this.updateMoney();
		this.openBgTouch();
	},

	limitScrollViewEvent: function() {
		var node = cc.Node.create();
		this.scrollView.addChild(node);

		var self = this;
		var onTouchBegan = function(touch, event) {
			var location = self.scrollView.convertTouchToNodeSpace(touch);
			// cc.log("location.x="+location.x+" location.y="+location.y);
			var contentSize = self.scrollView.getContentSize();
			if (location.x > 0 && location.y > 0 && location.x <= contentSize.width && location.y <= contentSize.height) {
				return false;
			}
			return true;
		};
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan
		}, node);
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var shopNode = ccsNode.getChildByName("shopNode");
		var scrollView = shopNode.getChildByName("scrollView");
		this.scrollView = scrollView;

		var shopItems = dataApi.item_shop.all();
		this.shopItems = shopItems;
		var shopItemCount = 0;
		for (var key in shopItems) {
			shopItemCount++;
		}
		var itemShopCCSFile = "uiccs/ShopItem.csb"
		var rowCount = Math.ceil(shopItemCount / 2);
		var positionY = rowCount * 123;
		var scrollSize = cc.size(720, positionY);
		scrollView.setInnerContainerSize(scrollSize);

		var self = this;
		var onItemBoxCallback = function(itemBox) {
			var itemId = itemBox.getItemId();
			if (itemId <= 0) return;
			var shopItem = self.shopItems[itemId];
			if (!shopItem) return;

			var worldPoint = itemBox.convertToWorldSpace(cc.p(0, 0));
			var itemDetailLayer = new cb.ItemDetailLayer(shopItem)
			itemDetailLayer.setPosition(worldPoint);
		};

		var shopItem, shopItemNode, itemBox, itemNameText, itemData, buyBtn;
		shopItemCount = 0;
		for (var key in shopItems) {
			shopItem = shopItems[key];
			shopItemNode = ccs.CSLoader.createNode(itemShopCCSFile);
			scrollView.addChild(shopItemNode);
			if (shopItemCount % 2 === 0) {
				// shopItemNode.setPosition(0, positionY);
				shopItemNode.runAction(cc.MoveTo.create(0.5,cc.p(0, positionY)));
			} else {
				shopItemNode.runAction(cc.MoveTo.create(0.5,cc.p(380, positionY)));
				// shopItemNode.setPosition(380, positionY);
				positionY -= 123;
			}

			itemBox = cb.ItemBox.create();
			itemBox.setDefaultSetting();
			itemBox.enableEvent(true);

			shopItemNode.addChild(itemBox);
			itemBox.setPosition(62, -62);

			itemData = shopItem.itemData;
			if (!itemData) {
				if (shopItem.type === EntityType.EQUIPMENT) {
					itemData = dataApi.equipment.findById(shopItem.kindId);
				} else if (shopItem.type === EntityType.ITEM) {
					itemData = dataApi.item.findById(shopItem.kindId);
				}
				shopItem.itemData = itemData;
			}
			if (itemData) {
				itemNameText = shopItemNode.getChildByName("itemNameText");
				itemNameText.setString(itemData.name);

				priceText = shopItemNode.getChildByName("priceText");
				priceText.setString("单价："+shopItem.price);

				var contentSize=priceText.getContentSize();
				coinSprite = shopItemNode.getChildByName("coinSprite");
				coinSprite.setPositionX(priceText.getPositionX()+contentSize.width+25);
				if (shopItem.moneyType!==MoneyTypes.caoCoin) {
                	coinSprite.setSpriteFrame("icon_cristal.png");
                }

				buyBtn = shopItemNode.getChildByName("buyBtn");
				buyBtn.setTag(shopItem.id);
				buyBtn.addTouchEventListener(this.touchEvent, this);
				// formula.buttonTipsEffect(buyBtn);

				itemBox.setItemId(shopItem.id);
				itemBox.setIconSprite(formula.skinIdToIconImg(itemData.skinId));
				itemBox.adjustIconSprite();
			}
			itemBox.addEventListener(onItemBoxCallback);
			shopItemCount++;
		}

		var rechargeBtn = ccsNode.getChildByName("rechargeBtn");
		var touchEvent=function(sender, type){
			if (type === ccui.Widget.TOUCH_ENDED) {
				layerManager.openPanel(cb.kMVipPanelId,3);
			}
		};
		rechargeBtn.addTouchEventListener(touchEvent, this);

		this.caoCoinLabel = ccsNode.getChildByName("caoCoinLabel");
		this.crystalLabel = ccsNode.getChildByName("crystalLabel");
	},

	updateMoney:function() {
		var curPlayer = app.getCurPlayer();
		this.caoCoinLabel.setString(curPlayer.caoCoin);
		this.crystalLabel.setString(curPlayer.crystal);
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var itemId = sender.getTag();
			if (itemId <= 0) return;
			var shopItem = this.shopItems[itemId];
			layerManager.pushLayer(cb.kMShopBuyItemPanelId,shopItem);
		}
	}

});

//VipGiftLayer
cb.VipGiftLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/VipGiftLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
		var ccsNode=this._ccsNode;
		var scrollView=ccsNode.getChildByName("scrollView");

		var self = this;
		var onItemBoxCallback = function(itemBox) {
			var itemId = itemBox.getItemId();
			if (itemId <= 0) return;
			var item = self.items[itemId];
			if(!item) return;

			var worldPoint = itemBox.convertToWorldSpace(cc.p(0, 0));
			var itemDetailLayer = new cb.ItemDetailLayer(item)
			itemDetailLayer.setPosition(worldPoint);
		};

		this.items={};
		this.buyBtns={};
		this.itemNodes={};
		this.itemPoints={};
		var itemNode, descText,imgPath, iconNode, itemBox, buyBtn, giftData,item;
		for (var i = 1; i <= 4; i++) {
			itemNode = scrollView.getChildByTag(i+1000);
			if (!itemNode) break;

			this.itemNodes[i]=itemNode;
			this.itemPoints[i]=itemNode.getPosition();

			giftData=dataApi.gift.findById(i);
			descText=itemNode.getChildByName("descText");
			descText.setString(giftData.desc);

			iconNode=itemNode.getChildByName("iconNode");

			itemBox = cb.ItemBox.create();
			itemBox.setDefaultSetting();
			itemBox.enableEvent(true);
			itemBox.addEventListener(onItemBoxCallback);
			itemNode.addChild(itemBox);

			var selectSprite = new cc.Sprite();
			var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/item_box_effect.plist", "item_box_effect_");
			var animate = cc.Animate.create(clickEfectAnim);
			selectSprite.runAction(cc.RepeatForever.create(animate));
			selectSprite.setPosition(iconNode.getPosition());
			itemNode.addChild(selectSprite);

			itemBox.setPosition(iconNode.getPosition());
			iconNode.removeFromParent();

			item={
				type: EntityType.ITEM,
				kindId: giftData.itemId,
				count: 0
			};
			item.itemData=dataApi.item.findById(item.kindId);
			itemBox.setItemId(item.kindId);
			this.items[item.kindId]=item;

			imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
			itemBox.setIconSprite(imgPath);
			itemBox.adjustIconSprite();
			itemBox.setColorSprite("item_color_6.png");

			buyBtn=itemNode.getChildByName("buyBtn");
			buyBtn.setTag(i);
			buyBtn.addTouchEventListener(this.touchEvent, this);

			this.buyBtns[i]=buyBtn;
		}

		shopHandler.getVipInfo();
	},

	setVipInfo:function(vipInfo){
		this.vipInfo=vipInfo;
		var giftMask=vipInfo.giftMask;
		var buyBtn,giftId;
		for (var key in this.buyBtns) {
			giftId=parseInt(key);
			buyBtn=this.buyBtns[key];
			if ((1<<giftId) & giftMask) {
				buyBtn.setEnabled(false);
				buyBtn.setTitleText("已领取");
			}else{
				buyBtn.setEnabled(true);
			}
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (type === ccui.Widget.TOUCH_ENDED) {
				if (!this.vipInfo) {
					shopHandler.getVipInfo();
					quickLogManager.showErrorCode(142);
					return;
				}
				var id = sender.getTag();
				var giftData = dataApi.gift.findById(id);
				if (giftData) {
					if (this.vipInfo.rmb < giftData.rmb) {
						tipsBoxLayer.showTipsBox("条件不足，是否前去购买？");
						tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
							if (isYesOrNo) {
								if (layerManager.isRunPanel(cb.kMVipPanelId)) {
									var curPanel = layerManager.curPanel;
									curPanel.selectTabBtn(3);
								}
							}
						});
						return;
					}
					shopHandler.receive(id);
				} else {
					quickLogManager.pushLog("很抱歉，该礼包不存在。", 2);
				}
			}
		}
	},

	updateLayerData: function() {
		var itemNode,index;
		for (var key in this.itemNodes) {
			itemNode=this.itemNodes[key];

			itemNode.stopAllActions();
			itemNode.setPositionX(1000);

			index=parseInt(key);
			var sequence = cc.Sequence.create(
				cc.DelayTime.create(0.2*index),
				cc.MoveTo.create(0.2,this.itemPoints[key])
			);
			itemNode.runAction(sequence);
		}
	}
});

//VipCoinLayer
cb.VipCoinLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/VipCoinLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
		var ccsNode=this._ccsNode;
		var scrollView=ccsNode.getChildByName("scrollView");
		var itemNode, diamondText, buyBtn, exchangeData;

		cc.spriteFrameCache.addSpriteFrames("effect/light_background.plist");
		var onActionCallback = function(sender) {
			var sequence = cc.Sequence.create(
				cc.Spawn.create(
					cc.ScaleTo.create(0.5 + Math.random() * 2, sender.getScale() > 1 ? 0.7 : 1.2),
					cc.RotateBy.create(0.5 + Math.random() * 2, Math.random() > 0.5 ? 360 : -360)
				),
				cc.CallFunc.create(onActionCallback,sender)
			);
			sender.runAction(sequence);
		};
		this.itemNodes={};
		this.itemPoints={};
		for (var i = 1; i <= 4; i++) {
			itemNode = scrollView.getChildByTag(i+1000);
			if (!itemNode) break;
			this.itemNodes[i]=itemNode;
			this.itemPoints[i]=itemNode.getPosition();

			var selectSprite = new cc.Sprite("#light_background.png");
			selectSprite.setPosition(0,150);
			selectSprite.setLocalZOrder(-1);
			itemNode.addChild(selectSprite);
        	selectSprite.runAction(cc.CallFunc.create(onActionCallback,selectSprite));

        	var bgImage=itemNode.getChildByName("bgImage");
        	bgImage.setLocalZOrder(-2);

			diamondText=itemNode.getChildByName("diamondText");

			exchangeData=dataApi.exchange.findById(i);
			diamondText.setString(exchangeData.caoCoin+"炒币");
			formula.enableOutline(diamondText);

			buyBtn=itemNode.getChildByName("buyBtn");

			buyBtn.setTag(i);
			buyBtn.setTitleText(exchangeData.crystal+"粉钻");
			buyBtn.addTouchEventListener(this.touchEvent, this);
		}
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var id=sender.getTag();
			var exchangeData=dataApi.exchange.findById(id);
			if (exchangeData) {
				var curPlayer = app.getCurPlayer();
				if (curPlayer.crystal<exchangeData.crystal) {
					tipsBoxLayer.showTipsBox("粉钻不足，是否购买？");
	                tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
                        if (isYesOrNo) {
                        	if (layerManager.isRunPanel(cb.kMVipPanelId)) {
					            var curPanel = layerManager.curPanel;
					            curPanel.selectTabBtn(3);
					        }
                        }
	                });
					return;
				}
				shopHandler.exchange(id);
			}else{
				quickLogManager.pushLog("很抱歉，购买项不存在。",2);
			}
		}
	},

	updateLayerData: function() {
		var itemNode,index;
		for (var key in this.itemNodes) {
			itemNode=this.itemNodes[key];

			itemNode.stopAllActions();
			itemNode.setPositionX(1000);

			index=parseInt(key);
			var sequence = cc.Sequence.create(
				cc.DelayTime.create(0.2*index),
				cc.MoveTo.create(0.2,this.itemPoints[key])
			);
			itemNode.runAction(sequence);
		}
	}
});

//VipBuyLayer
cb.VipBuyLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/VipBuyLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		this.__initView();
	},

	__initView:function(){
		var ccsNode = this._ccsNode;
		var scrollView=ccsNode.getChildByName("scrollView");

		cc.spriteFrameCache.addSpriteFrames("effect/light_background.plist");
		var onActionCallback = function(sender) {
			var sequence = cc.Sequence.create(
				cc.Spawn.create(
					cc.ScaleTo.create(0.5 + Math.random() * 2, sender.getScale() > 1 ? 0.7 : 1.2),
					cc.RotateBy.create(0.5 + Math.random() * 2, Math.random() > 0.5 ? 360 : -360)
				),
				cc.CallFunc.create(onActionCallback,sender)
			);
			sender.runAction(sequence);
		};

		var itemNode, rmbText, diamondText, buyBtn, rechargeData;
		this.itemNodes={};
		this.itemPoints={};
		for (var i = 1; i <= 4; i++) {
			itemNode = scrollView.getChildByTag(i+1000);
			if (!itemNode) break;

			this.itemNodes[i]=itemNode;
			this.itemPoints[i]=itemNode.getPosition();

			var selectSprite = new cc.Sprite("#light_background.png");
			selectSprite.setPosition(0,150);
			selectSprite.setLocalZOrder(-1);
			itemNode.addChild(selectSprite);
        	selectSprite.runAction(cc.CallFunc.create(onActionCallback,selectSprite));

        	var bgImage=itemNode.getChildByName("bgImage");
        	bgImage.setLocalZOrder(-2);

			rmbText=itemNode.getChildByName("rmbText");
			diamondText=itemNode.getChildByName("diamondText");

			rechargeData=dataApi.recharge.findById(i);
			// rmbText.setString(rechargeData.rmb+"￥");
			rmbText.setString("广告");

			diamondText.setString(rechargeData.crystal+"个粉钻");
			formula.enableOutline(diamondText);

			buyBtn=itemNode.getChildByName("buyBtn");
			buyBtn.setTitleText("观看赚钻");
			buyBtn.setTag(i);
			buyBtn.addTouchEventListener(this.touchEvent, this);
		}
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var id=sender.getTag();
			var rechargeData=dataApi.recharge.findById(id);
			if (rechargeData) {
				var sdkManager = cb.SDKManager.getInstance();
				sdkManager.addEventListener(function(msgType, payId) {
					//kMSDKStateAdSuccess=3
					// if (msgType === 2) {
						shopHandler.recharge(id);
					// }
				});

				sdkManager.showRewardedAd();

  		// 		sdkManager.addEventListener(function(msgType, payId) {
  		// 			circleLoadLayer.hideCircleLoad();
  		// 			//kMSDKStatePaySuccess=2
				// 	if (msgType === 2) {
				// 		if (payId === id) {
				// 			shopHandler.recharge(id);
				// 		} else {
				// 			quickLogManager.pushLog("订单出错，请联系客服。", 2);
				// 		}
				// 	}
				// });
				// sdkManager.sdkPay(id);

				// circleLoadLayer.showCircleLoad();
			}else{
				quickLogManager.pushLog("很抱歉，购买项不存在。",2);
			}
		}
	},

	updateLayerData: function() {
		var itemNode,index;
		for (var key in this.itemNodes) {
			itemNode=this.itemNodes[key];

			itemNode.stopAllActions();
			itemNode.setPositionX(1000);

			index=parseInt(key);
			var sequence = cc.Sequence.create(
				cc.DelayTime.create(0.2*index),
				cc.MoveTo.create(0.2,this.itemPoints[key])
			);
			itemNode.runAction(sequence);
		}
	}
});


//VipPanel
cb.VipPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/VipPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var menuNode=ccsNode.getChildByName("menuNode");
		var btn;
		this.tabBtns={};
		for (var i = 1; i <=10; i++) {
			btn = menuNode.getChildByTag(i+1000);
			if (!btn) {
				break;
			}
			btn.addTouchEventListener(this.touchEvent, this);
			this.tabBtns[i]=btn;
		}
		this._layers={};
	
		this.crystalLabel=ccsNode.getChildByName("crystalLabel");
		this.crystalSprite=ccsNode.getChildByName("crystalSprite");
		this.caoCoinLabel=ccsNode.getChildByName("caoCoinLabel");
		this.caoCoinSprite=ccsNode.getChildByName("caoCoinSprite");
	},

	updatePosition:function(){
		var contentSize=this.crystalLabel.getContentSize();
		var positionX=this.crystalLabel.getPositionX();

		positionX-=contentSize.width*0.8+10;
		this.crystalSprite.setPositionX(positionX);
		contentSize=this.crystalSprite.getContentSize();

		positionX-=contentSize.width*0.8+35;
		this.caoCoinLabel.setPositionX(positionX);
		contentSize=this.caoCoinLabel.getContentSize();

		positionX-=contentSize.width*0.8+10;
		this.caoCoinSprite.setPositionX(positionX);
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var index = sender.getTag() - 1000;
			this.selectTabBtn(index);
		}
	},

	setPanelData:function(tabIndex){
		if (!tabIndex) {
			this.selectTabBtn(1);
		}else{
			if(typeof tabIndex == 'number'){
				this.selectTabBtn(tabIndex);
			}
		}
		this.updateMoney();
	},

	updatePanelData:function(vipInfo){
		var layer = this._layers[1];
		if (layer) {
			layer.setVipInfo(vipInfo);
		}
	},

	updateMoney:function(moneyType,delta) {
		var curPlayer = app.getCurPlayer();

		var caoCoinLabel=this.caoCoinLabel;
		var crystalLabel=this.crystalLabel;
		caoCoinLabel.setString(curPlayer.caoCoin);
		crystalLabel.setString(curPlayer.crystal);
		this.updatePosition();

		if (moneyType===1) {
			var originCaoCoin=curPlayer.caoCoin-delta;
			var finalCaoCoin=curPlayer.caoCoin;
			var deltaCaoCoin=parseInt((finalCaoCoin-originCaoCoin)/100);

			var onActionCallback = function() {
				if (originCaoCoin>=finalCaoCoin) {
					caoCoinLabel.setString(finalCaoCoin);
					return;
				}
				originCaoCoin+=deltaCaoCoin;
				// originCaoCoin++;
				caoCoinLabel.setString(originCaoCoin);
				var sequence = cc.Sequence.create(
					cc.DelayTime.create(0.01),
					cc.CallFunc.create(onActionCallback)
				);
				caoCoinLabel.runAction(sequence);
			};
			caoCoinLabel.stopAllActions();
			caoCoinLabel.setString(originCaoCoin);
			caoCoinLabel.runAction(cc.CallFunc.create(onActionCallback));
		}else if (moneyType===2) {
			var originCrystal=curPlayer.crystal-delta;
			var finalCrystal=curPlayer.crystal;
			var deltaCrystal=parseInt((finalCrystal-originCrystal)/100);
			var onActionCallback1 = function() {
				if (originCrystal>=finalCrystal) {
					crystalLabel.setString(finalCrystal);
					return;
				}
				// originCrystal++;
				originCrystal+=deltaCrystal;
				crystalLabel.setString(originCrystal);
				var sequence = cc.Sequence.create(
					cc.DelayTime.create(0.01),
					cc.CallFunc.create(onActionCallback1)
				);
				crystalLabel.runAction(sequence);
			};
			crystalLabel.stopAllActions();
			crystalLabel.setString(originCrystal);
			crystalLabel.runAction(cc.CallFunc.create(onActionCallback1));
		}
	},

	selectTabBtn: function(index) {
		if (index === null) return;
		if (this.tabIndex === index)
			return;

		if (this.tabIndex !== null)
			this.unselectTabBtn(this.tabIndex);

		this.tabIndex = index;
		var tabBtn = this.tabBtns[index];
		if(!tabBtn) return;

		var btnSprite=tabBtn.getChildByName("btnSprite");
		var btnText=tabBtn.getChildByName("btnText");

		btnSprite.setSpriteFrame("tabbtn_hselected.png");
		btnText.setTextColor(consts.COLOR_ORANGEGOLD);
		
		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(true);
		}
		if (!layer) {
			if(index===1){
				layer=new cb.VipGiftLayer();
			} else if (index === 2) {
				layer=new cb.VipCoinLayer();
			} else if (index === 3) {
				layer=new cb.VipBuyLayer();
			}
			if (!layer) return;
			this._ccsNode.addChild(layer);
			this._layers[index] = layer;
		}
		layer.updateLayerData();
	},

	unselectTabBtn: function(index) {
		var tabBtn = this.tabBtns[index];
		if(!tabBtn) return;

		var btnSprite=tabBtn.getChildByName("btnSprite");
		var btnText=tabBtn.getChildByName("btnText");
		btnSprite.setSpriteFrame("tabbtn_hnormal.png");
		btnText.setTextColor(consts.COLOR_WHITE);

		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(false);
		}
	}
});
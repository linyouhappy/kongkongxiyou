
//BuildStrenghtLayer
cb.BuildStrenghtLayer = cc.Layer.extend({
	ctor: function() {
		this._super();
		this.__initView();
	},

	__initView:function(){
		var ccsNode = ccs.CSLoader.createNode("uiccs/BuildStrenghtLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		this.setPosition(196,-13);

		this.bullionDatas = {};
		var bullionSprite, label, bullionData;
		for (var i = 1001; i <= 1012; i++) {
			bullionSprite = ccsNode.getChildByTag(i);
			if (bullionSprite) {
				bullionData = {};
				bullionData.sprite = bullionSprite;

				label = cc.Label.createWithSystemFont("", "Arial", 22);
				label.setPosition(67, 29);
				bullionSprite.addChild(label);
				label.setColor(cc.color(255, 249, 86));
				label.setVisible(false);

				bullionData.label = label;
				this.bullionDatas[i - 1000] = bullionData;
			}
		}
		var recycleBtn = ccsNode.getChildByName("recycleBtn");
		recycleBtn.addTouchEventListener(this.touchEvent, this);
		recycleBtn.setSoundEffectFile("");
		this.recycleBtn=recycleBtn;
		this.caoCoinText=ccsNode.getChildByName("caoCoinText");
		this.itemSprite=ccsNode.getChildByName("itemSprite");
		this.itemCountText=ccsNode.getChildByName("itemCountText");

		var stoneNode, iconSprite, checkBtn, countText, itemData, kindId;
		// var stoneItemIds=[8021,8022,8023];
		this.stoneDatas={};
		for (var i = 1; i <= 3; i++) {
			stoneNode=ccsNode.getChildByTag(10000+i);
			iconSprite=stoneNode.getChildByName("iconSprite");
			checkBtn=stoneNode.getChildByName("checkBtn");
			countText=stoneNode.getChildByName("countText");

			kindId=8020+i;

			checkBtn.setTag(kindId);
			checkBtn.addTouchEventListener(this.touchEvent1, this);

			itemData = dataApi.item.findById(kindId);
			iconSprite.setTexture(formula.skinIdToIconImg(itemData.skinId));

			this.stoneDatas[kindId]={
				itemId:kindId,
				checkBtn:checkBtn,
				countText:countText
			};
		}
		this.setSelectStone(8021);
		this.luckyCount=0;
	},

	setSelectStone:function(itemId){
		var stoneData;
		if(this.selectItemId){
			stoneData=this.stoneDatas[this.selectItemId];
			stoneData.checkBtn.setEnabled(true);
		}
		stoneData=this.stoneDatas[itemId];
		if (stoneData) {
			this.selectItemId=itemId;
			stoneData.checkBtn.setEnabled(false);

			var itemData = dataApi.item.findById(itemId);
			this.itemSprite.setTexture(formula.skinIdToIconImg(itemData.skinId));
		}
	},

	buildEquip: function() {
		var curEquipment = this.curEquipment;
		if (!curEquipment) {
			quickLogManager.pushLog("请先选中装备！");
			return;
		}

		var totalStar = curEquipment.totalStar;
		if (totalStar >= 12) {
			quickLogManager.showErrorCode(52);
			return;
		}
		var nextTotalStar = totalStar + 1;
		var strengthData = dataApi.strength.findById(nextTotalStar);
		var curPlayer = app.getCurPlayer();

		if (curPlayer.caoCoin < strengthData.money) {
			quickLogManager.showErrorCode(53);
			this.caoCoinText.runAction(cc.Blink.create(2, 8));
			return;
		}
		var item = bagManager.getItem(this.selectItemId);
		if (!item || item.count < strengthData.stone) {
			quickLogManager.showErrorCode(145);
			this.itemCountText.runAction(cc.Blink.create(2, 8));
			return;
		}

		if (this.luckyCount % 2 === 1) {
			this.luckyCount = 0;
		}
		this.luckyCount++;
		cc.log("start luckyCount=" + this.luckyCount);
		// var luckyCount=this.luckyCount;
		var self = this;
		var position;
		if (this.selectBullionData) {
			position = this.selectBullionData.sprite.getPosition();
		}

		equipHandler.equipOpen(curEquipment.id, this.selectItemId, function(data) {
			curEquipment["star" + data.starIndex] = data.starValue;
			// curEquipment.percent = data.percent;
			// curEquipment.totalStar = data.totalStar;
			item.count -= strengthData.stone;

			var percent = 0;
			var totalStar = 0;
			var subKey;
			for (var i = 1; i <= 12; i++) {
				subKey = "star" + i;
				if (curEquipment[subKey]) {
					percent += curEquipment[subKey];
					totalStar++;
				}
			}
			curEquipment.percent = percent;
			curEquipment.totalStar = totalStar;

			if (layerManager.isRunPanel(cb.kMBuildPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.setEquipment(curEquipment);
			}

			self.luckyCount++;
			cc.log("end 1luckyCount=" + self.luckyCount);
			var luckyCount = self.luckyCount / 2;
			cc.log("end 2luckyCount=" + luckyCount);
			if (luckyCount === 1) {
				quickLogManager.pushLog("手气真不错!");
			} else if (luckyCount === 2) {
				quickLogManager.pushLog("运气太棒了!");
			} else if (luckyCount === 3) {
				quickLogManager.pushLog("这运气可以买彩票!");
			} else if (luckyCount === 4) {
				quickLogManager.pushLog("运气暴涨三个点!");
			} else if (luckyCount === 5) {
				quickLogManager.pushLog("运气暴涨逆天，真发达了!");
			} else {
				quickLogManager.pushLog("这运气秒杀一切!");
			}
			if (position) {
				var selectSprite = new cc.Sprite();
				var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/effects_strength.plist", "effects_strengthr_");
				var animate = cc.Animate.create(clickEfectAnim);
				var sequence = cc.Sequence.create(cc.DelayTime.create(0.5), cc.Show.create(), animate, cc.RemoveSelf.create());
				selectSprite.runAction(sequence);
				selectSprite.setVisible(false);
				self.addChild(selectSprite);
				position.y -= 3;
				selectSprite.setPosition(position);
			}
		});

		if (position) {
			var selectSprite = new cc.Sprite();
			var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/effects_strength.plist", "effects_strength_");
			var animate = cc.Animate.create(clickEfectAnim);
			var sequence = cc.Sequence.create(animate, cc.RemoveSelf.create());
			selectSprite.runAction(sequence);
			this.addChild(selectSprite);
			selectSprite.setPosition(position);
		}
		soundManager.playEffectSound("sound/ui/equip_strength.mp3");
	},

	touchEvent1: function (sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			// var index=sender.getTag();
			this.setSelectStone(sender.getTag());
		}
    },

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			this.buildEquip();
		}
	},

	setEquipment: function(equipment) {
		if (this.curEquipment!==equipment) {
			this.curEquipment = equipment;
			this.luckyCount=0;
		}
		this.setEquipmentDetail(equipment);

		if (equipment) {
			var totalStar = equipment.totalStar;
			if (totalStar === 12) {
				this.caoCoinText.setString("0");
				this.caoCoinText.setTextColor(consts.COLOR_WHITE);
				this.itemCountText.setString("0");
				this.itemCountText.setTextColor(consts.COLOR_WHITE);

				this.recycleBtn.setTitleText("开发完毕");
				this.recycleBtn.setEnabled(false);
			} else {
				var nextTotalStar = totalStar + 1;
				var strengthData = dataApi.strength.findById(nextTotalStar);
				this.caoCoinText.setString(strengthData.money);
				var curPlayer = app.getCurPlayer();
				if (curPlayer.caoCoin < strengthData.money) {
					this.caoCoinText.setTextColor(consts.COLOR_PURE_RED);
				} else {
					this.caoCoinText.setTextColor(consts.COLOR_WHITE);
				}

				this.recycleBtn.setTitleText("开  发");
				this.recycleBtn.setEnabled(true);

				if(this.selectItemId){
					this.itemCountText.setString(strengthData.stone);
					var item=bagManager.getItem(this.selectItemId);
					if (item && item.count>=strengthData.stone) {
						this.itemCountText.setTextColor(consts.COLOR_WHITE);
					}else{
						this.itemCountText.setTextColor(consts.COLOR_PURE_RED);
					}
				}
			}
		}
		var stoneData;
		for (var key in this.stoneDatas) {
			stoneData=this.stoneDatas[key];
			var item=bagManager.getItem(stoneData.itemId);
			if (item) {
				stoneData.countText.setString(item.count);
				stoneData.count=item.count;
			}else{
				stoneData.countText.setString("0");
				stoneData.count=0;
			}
		}
	},

	setEquipmentDetail: function(equipment) {
		if(!equipment) return;
		
		var bullionData, starValue;
		var starText = "star";
		var propertyName = PropertyNames[equipment.itemData.kind];
		this.selectBullionData=null;
		for (var i = 1; i <= 12; i++) {
			starValue = equipment[starText + i];
			bullionData = this.bullionDatas[i];
			// if (bullionData.isLock) {
			// 	bullionData.isLock = false;
			// 	bullionData.lockSprite.setVisible(false);
			// 	bullionData.sprite.setColor(cc.color(255, 255, 255));
			// }
			if (!starValue) {
				bullionData.label.setVisible(false);
				bullionData.starValue = 0;
				bullionData.sprite.setSpriteFrame("bg_property_blank.png");

				if(!this.selectBullionData){
					this.selectBullionData=bullionData;
				}
			} else {
				bullionData.label.setVisible(true);
				bullionData.label.setString(propertyName + "+" + starValue + "%");
				bullionData.starValue = starValue;

				if (starValue <= 4) {
					bullionData.sprite.setSpriteFrame("bg_property_copper.png");
				} else if (starValue <= 7) {
					bullionData.sprite.setSpriteFrame("bg_property_silvery.png");
				} else {
					bullionData.sprite.setSpriteFrame("bg_property_golden.png");
				}
			}
		}
	},

	updateLayerData: function() {

	}
});

//BuildRecycleLayer
cb.BuildRecycleLayer = cc.Layer.extend({
	ctor: function() {
		this._super();
		this.__initView();
		this.openBgTouch();
	},

	__initView:function(){
		var ccsNode = ccs.CSLoader.createNode("uiccs/BuildRecycleLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		this.setPosition(196,-13);

		this.bullionDatas = {};
		var bullionSprite, label, bullionData;
		for (var i = 1001; i <= 1012; i++) {
			bullionSprite = ccsNode.getChildByTag(i);
			if (bullionSprite) {
				bullionData = {};
				bullionData.sprite = bullionSprite;

				label = cc.Label.createWithSystemFont("", "Arial", 22);
				label.setPosition(67, 29);
				bullionSprite.addChild(label);
				label.setColor(cc.color(255, 249, 86));
				label.setVisible(false);

				bullionData.label = label;
				this.bullionDatas[i - 1000] = bullionData;
			}
		}
		var recycleBtn = ccsNode.getChildByName("recycleBtn");
		recycleBtn.addTouchEventListener(this.touchEvent, this);
		this.caoCoinText=ccsNode.getChildByName("caoCoinText");

		this.lockCount=0;
	},

	openBgTouch: function() {
		var self = this;
		var onTouchBegan = function(touch, event) {
			var touchPoint = self._ccsNode.convertTouchToNodeSpace(touch);
			// cc.log("touch.x="+touchPoint.x+",touch.y="+touchPoint.y);
			if (touchPoint.x>-217 && touchPoint.x<214 && touchPoint.y>-58 && touchPoint.y<231) {
				return true;
			}
			return false;
		};
		
		var onTouchEnded = function(touch, event) {
			var touchPoint = self._ccsNode.convertTouchToNodeSpace(touch);
			var bullionSprite, lockSprite, bullionData, spritePosition;
			var childRect = {
				x: 0,
				y: 0,
				width: 134,
				height: 58
			};
			for (var i = 1; i <= 12; i++) {
				bullionData = self.bullionDatas[i];
				bullionSprite = bullionData.sprite;
				spritePosition = bullionSprite.getPosition();
				childRect.x = spritePosition.x - 67;
				childRect.y = spritePosition.y - 29;

				if (cc.rectContainsPoint(childRect, touchPoint)) {
					if (bullionData.starValue) {
						lockSprite = bullionData.lockSprite;
						
						if (bullionData.isLock) {
							bullionData.isLock = false;
							bullionSprite.setColor(cc.color(255, 255, 255));
							if (lockSprite) {
								lockSprite.setVisible(false);
							}
						} else {
							var lockCount = 0;
							for (var i = 1; i <= 12; i++) {
								if (self.bullionDatas[i].isLock) {
									lockCount++;
									if (lockCount >= 6) {
										quickLogManager.pushLog("锁定不能超过6个！");
										return;
									}
								}
							}
							
							bullionData.isLock = true;
							bullionSprite.setColor(cc.color(200, 200, 200));

							if (lockSprite) {
								lockSprite.setVisible(true);
							} else {
								lockSprite = new cc.Sprite("#icon_big_lock.png");
								lockSprite.setPosition(spritePosition.x + 46, spritePosition.y - 8);
								lockSprite.setScale(0.94);
								self._ccsNode.addChild(lockSprite);
								bullionData.lockSprite = lockSprite
							}
							// lockCount++;
						}
						self.setLockCount();
					}
					return;
				}
			}
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchEnded: onTouchEnded
		}, this);
	},

	setEquipment: function(equipment) {
		this.curEquipment = equipment;
		this.setEquipmentDetail(equipment);
	},

	setLockCount: function() {
		var lockCount = 0;
		for (var i = 1; i <= 12; i++) {
			if (this.bullionDatas[i].isLock) {
				lockCount++;
			}
		}

		var recycleData = dataApi.recycle.findById(lockCount);
		if (recycleData) {
			this.caoCoinText.setString(recycleData.money);
			var curPlayer = app.getCurPlayer();
			if (curPlayer.caoCoin < recycleData.money) {
				this.caoCoinText.setTextColor(consts.COLOR_PURE_RED);
			} else {
				this.caoCoinText.setTextColor(consts.COLOR_WHITE);
			}

		}
		this.lockCount=lockCount;
	},

	setEquipmentDetail: function(equipment) {
		if(!equipment) return;
		
		var bullionData, starValue;
		var starText = "star";
		var propertyName = PropertyNames[equipment.itemData.kind];
		var lockCount=0;
		for (var i = 1; i <= 12; i++) {
			starValue = equipment[starText + i];
			bullionData = this.bullionDatas[i];
			if (starValue>=8 && lockCount<6) {
				lockCount++;
				var bullionSprite = bullionData.sprite;
				var spritePosition = bullionSprite.getPosition();
				bullionData.isLock = true;
				bullionSprite.setColor(cc.color(200, 200, 200));
				var lockSprite=bullionData.lockSprite;
				if (lockSprite) {
					lockSprite.setVisible(true);
				} else {
					lockSprite = new cc.Sprite("#icon_big_lock.png");
					lockSprite.setPosition(spritePosition.x + 46, spritePosition.y - 8);
					lockSprite.setScale(0.94);
					this._ccsNode.addChild(lockSprite);
					bullionData.lockSprite = lockSprite
				}
			}else{
				if (bullionData.isLock) {
					bullionData.isLock = false;
					bullionData.lockSprite.setVisible(false);
					bullionData.sprite.setColor(consts.COLOR_WHITE);
				}
			}
			
			if (!starValue) {
				bullionData.label.setVisible(false);
				bullionData.starValue = 0;
				bullionData.sprite.setSpriteFrame("bg_property_blank.png");
			} else {
				bullionData.label.setVisible(true);
				bullionData.label.setString(propertyName + "+" + starValue + "%");
				bullionData.starValue = starValue;

				if (starValue <= 4) {
					bullionData.sprite.setSpriteFrame("bg_property_copper.png");
				} else if (starValue <= 7) {
					bullionData.sprite.setSpriteFrame("bg_property_silvery.png");
				} else {
					bullionData.sprite.setSpriteFrame("bg_property_golden.png");
				}
			}
		}
		this.setLockCount();
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var curEquipment = this.curEquipment;
			if (!curEquipment) {
				quickLogManager.pushLog("请先选中装备！");
				return;
			}

			var stars = [];
			for (var i = 1; i <= 12; i++) {
				if (this.bullionDatas[i].starValue && !this.bullionDatas[i].isLock) {
					stars.push(i);
				}
			}
			if (stars.length === 0) {
				quickLogManager.pushLog("无属性可回收！");
				return;
			}

			var curPlayer = app.getCurPlayer();
			var recycleData = dataApi.recycle.findById(this.lockCount);
			if (curPlayer.caoCoin < recycleData.money) {
				quickLogManager.showErrorCode(146);
				this.caoCoinText.runAction(cc.Blink.create(2, 8));
				return;
			}
	
			equipHandler.equipRecycle(curEquipment.id, stars, function(data) {
				for (var i = 0; i < stars.length; i++) {
					curEquipment["star" + stars[i]] = 0;
				}
				var percent = 0;
				var totalStar = 0;
				var subKey;
				for (var i = 1; i <= 12; i++) {
					subKey = "star" + i;
					if (curEquipment[subKey]) {
						percent += curEquipment[subKey];
						totalStar++;
					}
				}
				curEquipment.percent = percent;
				curEquipment.totalStar = totalStar;

				if (layerManager.isRunPanel(cb.kMBuildPanelId)) {
					var curPanel = layerManager.curPanel;
					curPanel.setEquipment(curEquipment);
				}
			});
		}
	}
});

cb.BuildPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/BuildPanel.csb");
		this.__initBagView();
		// this.__initStrengthView();
		this.openBgTouch();
	},

	__initBagView: function() {
		var ccsNode = this._ccsNode;
		var bagNode = ccsNode.getChildByName("bagNode");
		var container = bagNode.getChildByName("container");
		var contentSize = container.getContentSize();

		var itemBoxLayer = cb.ItemBoxLayer.create();
		itemBoxLayer.setLimitColumn(6);
		itemBoxLayer.setLimitRow(1);
		itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(95, 88));
		itemBoxLayer.enableEvent(true);
		itemBoxLayer.setScrollType(2);
		itemBoxLayer.setPosition(0,5);
		container.addChild(itemBoxLayer);

		itemBoxLayer.setItemCount(6);

		var self = this;
		var onItemBoxLayerCallback = function(position, itemBox) {
			var itemId = itemBox.getItemId();
			if (itemId <= 0) return;
			var equipments = bagManager.equipments
			var equipment = equipments[position];
			self.setEquipment(equipment);
		};
		itemBoxLayer.addEventListener(onItemBoxLayerCallback);
		this.itemBoxLayer = itemBoxLayer;

		this.itemNameText = bagNode.getChildByName("itemNameText");
		this.totalText = bagNode.getChildByName("totalText");
		this.baseText = bagNode.getChildByName("baseText");
		this.activeText = bagNode.getChildByName("activeText");
		this.percentText = bagNode.getChildByName("percentText");
		this.potentialText = bagNode.getChildByName("potentialText");
		// this.costText = bagNode.getChildByName("costText");

		var iconNode = bagNode.getChildByName("iconNode");
		var iconItemBox = cb.ItemBox.create();
		iconItemBox.setDefaultSetting();
		iconItemBox.enableEvent(true);

		bagNode.addChild(iconItemBox);
		iconItemBox.setPosition(iconNode.getPosition());
		iconNode.removeFromParent();

		var self = this;
		var onItemBoxCallback = function(itemBox) {
			if (!self.curEquipment) return;

			var worldPoint = itemBox.convertToWorldSpace(cc.p(0, 0));
			var itemDetailLayer = new cb.ItemDetailLayer(self.curEquipment)
			itemDetailLayer.setPosition(worldPoint);
		};
		iconItemBox.addEventListener(onItemBoxCallback);
		this.iconItemBox=iconItemBox;

		this.starSprites = {};
		var starSprite;
		for (var i = 1; i <= 6; i++) {
			starSprite = bagNode.getChildByTag(1000 + i);
			this.starSprites[i] = starSprite;
		}

		var bagBtn = bagNode.getChildByName("bagBtn");
		var touchEvent=function(sender, type){
			if (type === ccui.Widget.TOUCH_ENDED) {
				var itemSelectLayer=new cb.ItemSelectLayer();
				itemSelectLayer.setPosition(0,36);
				this.addChild(itemSelectLayer);
				var self=this;
				itemSelectLayer.setEquipmentCallback(function(item){
					if (item) {
						// cc.log("item.id="+item.id);
						self.setBagItem(item);
						// guildManager.requestGuildItem(item.id);
					}
				});
			}
		};
		bagBtn.addTouchEventListener(touchEvent, this);

		var btn;
		this.tabBtns={};
		for (var i = 1; i <=4; i++) {
			btn = ccsNode.getChildByTag(i + 1000);
			btn.addTouchEventListener(this.touchEvent, this);
			this.tabBtns[i]=btn;
		}
		this._layers={};
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var tag = sender.getTag();
			this.setTabIndex(tag-1000);
		}
	},

	setTabIndex:function(tabIndex){
		if (this.tabIndex===tabIndex) {
			return;
		}
		var tabText1, tabText2, tabBtn;
		if (this.tabIndex) {
			if (tabIndex !== 1 && tabIndex !== 2) {
				quickLogManager.pushLog("暂时不开放！",1);
				return;
			}

			tabBtn=this.tabBtns[this.tabIndex];
			tabBtn.setHighlighted(false);

			tabText1 = tabBtn.getChildByTag(1001);
			tabText2 = tabBtn.getChildByTag(1002);
			tabText1.setTextColor(consts.COLOR_WHITE);
			tabText2.setTextColor(consts.COLOR_WHITE);

			var layer = this._layers[this.tabIndex];
			if (layer) {
				layer.setVisible(false);
			}
		}
		this.tabIndex=tabIndex;
		tabBtn=this.tabBtns[this.tabIndex];
		if(!tabBtn) return;

		tabBtn.setHighlighted(true);
		
		tabText1 = tabBtn.getChildByTag(1001);
		tabText2 = tabBtn.getChildByTag(1002);
		tabText1.setTextColor(consts.COLOR_ORANGEGOLD);
		tabText2.setTextColor(consts.COLOR_ORANGEGOLD);

		var layer = this._layers[tabIndex];
		if (layer) {
			layer.setVisible(true);
		} else {
			if (tabIndex === 1) {
				layer = new cb.BuildStrenghtLayer();
			} else if (tabIndex === 2) {
				layer = new cb.BuildRecycleLayer();
			} else if (tabIndex === 3) {
			} else if (tabIndex === 4) {
			}
			if (!layer) return;

			this._ccsNode.addChild(layer);
			// layer.setPosition(0, -36);
			this._layers[tabIndex] = layer;
		}
		layer.setEquipment(this.curEquipment);
		// this.setBagData();
	},

	setBagItem:function(bagItem){
		this.itemBoxLayer.cancelSelectEffect();
		var self=this;
		bagManager.getEquipDetail(bagItem.id,function(bagItem){
			self.setEquipment(bagItem);
		});
	},

	setEquipment: function(equipment) {
		if (!equipment) {
			return;
		}
		this.curEquipment = equipment;

		var itemData = equipment.itemData;
		this.itemNameText.setString(itemData.name);

		var activeValue = Math.round(equipment.potential * equipment.percent / 100);
		var totalValue = equipment.baseValue + activeValue;
		var propertyName = PropertyNames[equipment.itemData.kind];
		//总属性
		var showString = propertyName + " +" + totalValue;
		this.totalText.setString(showString);
		//基础属性
		showString = propertyName + " +" + equipment.baseValue;
		this.baseText.setString(showString);
		//激活属性
		showString = propertyName + " +" + activeValue;
		this.activeText.setString(showString);
		//潜能激活
		showString = equipment.percent + "%";
		this.percentText.setString(showString);
		//总潜能
		showString = propertyName + " +" + equipment.potential;
		this.potentialText.setString(showString);

		var level = Math.ceil(equipment.totalStar / 2);
		this.totalText.setTextColor(colorTbl[level]);
		this.baseText.setTextColor(colorTbl[level]);
		this.activeText.setTextColor(colorTbl[level]);
		this.percentText.setTextColor(colorTbl[level]);
		this.potentialText.setTextColor(colorTbl[level]);

		var totalStar = equipment.totalStar;
		var starCount = Math.floor(totalStar / 2);
		var starSprite;
		var ccsNode = this.bagNode;

		for (var i = 1; i <= 6; i++) {
			starSprite = this.starSprites[i];

			if (totalStar === (i - 1) * 2 + 1) {
				starSprite.setSpriteFrame("star_half_gold.png");
			} else if (i <= starCount) {
				starSprite.setSpriteFrame("star_gold.png");
			} else {
				starSprite.setSpriteFrame("star_gray.png");
			}
		}

		var iconItemBox=this.iconItemBox;
		iconItemBox.setItemId(equipment.id);
		iconItemBox.setIconSprite(formula.skinIdToIconImg(equipment.itemData.skinId));
		iconItemBox.adjustIconSprite();
		iconItemBox.setColorSprite(formula.starToColorImg(equipment.totalStar));

		var layer = this._layers[this.tabIndex];
		if (layer) {
			layer.setEquipment(equipment);
		}
		if (equipment.equipKind) {
			this.equip(equipment);
		}
	},

	setEquipmentsData: function() {
		var equipments = bagManager.equipments;
		for (var kind = 1; kind <= 6; kind++) {
			if (equipments[kind]) {
				this.equip(equipments[kind]);
			}
		}
	},

	equip: function(equipItem) {
		var itemBox = this.itemBoxLayer.getItemBoxByPosition(equipItem.equipKind);
		if (itemBox && equipItem && equipItem.itemData) {
			itemBox.setItemId(equipItem.id);
			itemBox.setIconSprite(formula.skinIdToIconImg(equipItem.itemData.skinId));
			itemBox.adjustIconSprite();

			itemBox.setColorSprite(formula.starToColorImg(equipItem.totalStar));
		} else {
			itemBox.enableIconSprite(false);
			itemBox.enableColorSprite(false);
			itemBox.setItemId(0);
		}
	},

	setPanelData: function() {
		bagManager.equipments.requestEquipDetail();
		this.setTabIndex(1);
	},

	setTutorial:function(index){
		this.setTabIndex(1);
		var layer = this._layers[1];
		if (!layer) return;

		if (index===1) {
			var equipments = bagManager.equipments
			var equipment = equipments[EquipmentType.Weapon];
			this.setEquipment(equipment);
		}else if (index===2) {
			layer.setSelectStone(8021);
		}else if (index===3) {
			layer.buildEquip();
		}
    }
});


    
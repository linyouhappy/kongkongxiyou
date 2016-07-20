cb.BagPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/BagPanel.csb");
		this.__initBagView();
		this.__initRoleView();
		this.openBgTouch();
	},
	__initBagView: function() {
		var ccsNode = this._ccsNode;
		var bagNode = ccsNode.getChildByName("bagNode");
		var container = bagNode.getChildByName("container");
		var contentSize = container.getContentSize();

		var itemBoxLayer = cb.ItemBoxLayer.create();
		itemBoxLayer.setLimitColumn(4);
		itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(90, 88));
		// itemBoxLayer.setItemCount(25);
		itemBoxLayer.enableEvent(true);
		container.addChild(itemBoxLayer);

		var self = this;
		var onItemBoxLayerCallback = function(position, itemBox) {
			var item =self.bagItems[position-1];
			if (item) {
				var itemDetailLayer = new cb.ItemDetailLayer(item)
				itemDetailLayer.setBagPosition(true);

				if (item.type === EntityType.ITEM)
					return;

				var itemBox = self.itemBoxs[item.itemData.kind];
				var equipItem = self.itemDatas[itemBox.getItemId()];
				if (equipItem) {
					var itemDetailLayer1 = new cb.ItemDetailLayer(equipItem)
					itemDetailLayer1.setEquipPosition();
					itemDetailLayer1.otherItemDetailLayer = itemDetailLayer;
					itemDetailLayer.otherItemDetailLayer=itemDetailLayer1;
				}
			}
		};
		itemBoxLayer.addEventListener(onItemBoxLayerCallback);
		this.itemBoxLayer = itemBoxLayer;

		var btn;
		this.tabBtns={};
		for (var i = 1; i <=4; i++) {
			btn = bagNode.getChildByTag(i + 1000);
			btn.addTouchEventListener(this.touchEvent, this);
			this.tabBtns[i]=btn;
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var tag = sender.getTag();
			if (tag===1004) {
				// layerManager.openPanel(cb.kMSellPanelId,null,true);
				layerManager.pushLayer(cb.kMSellPanelId);
			}else{
				//this.tabIndex=tag-1001;
				this.setTabIndex(tag-1000);
			}
		}
	},

	setTabIndex:function(tabIndex){
		if (this.tabIndex===tabIndex) {
			return;
		}
		var tabText1, tabText2, tabBtn;

		if (this.tabIndex) {
			tabBtn=this.tabBtns[this.tabIndex];
			tabBtn.setHighlighted(false);

			tabText1 = tabBtn.getChildByTag(1001);
			tabText2 = tabBtn.getChildByTag(1002);
			tabText1.setTextColor(consts.COLOR_WHITE);
			tabText2.setTextColor(consts.COLOR_WHITE);
			
			// this.tabBtns[tabIndex].setTitleColor(consts.COLOR_ORANGEGOLD);
		}
		// this.tabBtns[tabIndex].setTitleColor(consts.COLOR_WHITE);
		this.tabIndex=tabIndex;
		tabBtn=this.tabBtns[this.tabIndex];
		if(!tabBtn) return;

		tabBtn.setHighlighted(true);
		
		tabText1 = tabBtn.getChildByTag(1001);
		tabText2 = tabBtn.getChildByTag(1002);
		tabText1.setTextColor(consts.COLOR_ORANGEGOLD);
		tabText2.setTextColor(consts.COLOR_ORANGEGOLD);

		this.setBagData();
	},

	__initRoleView: function() {
		var ccsNode = this._ccsNode;
		var roleNode = ccsNode.getChildByName("roleNode");

		var child, itemBox;
		this.itemBoxs = {};
		var self = this;
		var onItemBoxCallback = function(itemBox) {
			var itemId = itemBox.getItemId();
			if (itemId <= 0) return;
			var equipItem = self.itemDatas[itemId];

			if (equipItem) {
				// var worldPoint=itemBox.convertToWorldSpace(cc.p(0,0));
				var itemDetailLayer = new cb.ItemDetailLayer(equipItem)
				itemDetailLayer.setEquipPosition(true);
				// itemDetailLayer.setPosition(worldPoint);
			}
		};

		for (var i = 101; i <= 106; i++) {
			child = roleNode.getChildByTag(i);
			itemBox = cb.ItemBox.create();
			itemBox.setDefaultSetting();
			itemBox.enableEvent(true);

			roleNode.addChild(itemBox);
			itemBox.setPosition(child.getPosition());
			child.removeFromParent();

			this.itemBoxs[i - 100] = itemBox;
			itemBox.addEventListener(onItemBoxCallback);
		}

		this.itemDatas = {};
		this.rolePortrait = roleNode.getChildByName("rolePortrait");
	},
	setPanelData: function() {
		var bagItems=bagManager.getBagData();
		if (bagItems) {
			this.setTabIndex(1);
		}
		this.setEquipmentsData();

		var character = app.getCurPlayer();
		var portraitName=formula.portraitName(character.kindId);
		this.rolePortrait.setTexture(portraitName);

		//		var entitySprite=cb.EntitySprite.create(10001);
		//		entitySprite.show(10001,5,Sprite.kMActionIdle);
		//		this.roleContainer.addChild(entitySprite);
	},

	updatePanel:function(data){
		if (!data) {
			this.setBagData();
			this.setEquipmentsData();
		}else if(data===1){
			this.setBagData();
		}else if (data===2) {
			this.setEquipmentsData();
		}
	},
	// removeItem:function(position){
	// 	var itemBox = this.itemBoxLayer.getItemBoxByPosition(position);
	// 	itemBox.clearAllSetting();
	// },
	setBagData:function(){
		// var bagItems = bagManager.bagItems;
		var item,tmpItems, bagItems=[];
		
		if (!this.tabIndex || this.tabIndex===1) {
			this.tabIndex=1;
			tmpItems=bagManager.bagItems;
			for (var key in tmpItems) {
				bagItems.push(tmpItems[key]);
			}
			tmpItems=bagManager.items;
			for (var key in tmpItems) {
				bagItems.push(tmpItems[key]);
			}
		}else if (this.tabIndex===2) {
			tmpItems=bagManager.bagItems;
			for (var key in tmpItems) {
				bagItems.push(tmpItems[key]);
			}
		}else if (this.tabIndex===3) {
			tmpItems=bagManager.items;
			for (var key in tmpItems) {
				bagItems.push(tmpItems[key]);
			}
		}
		// for (var key in bagManager.bagItems) {
		// 	item=bagManager.bagItems[key]
		// 	if (!this.tabIndex) {
		// 		bagItems.push(item);
		// 	}else if (this.tabIndex===1) {
		// 		if (item.type===EntityType.EQUIPMENT) {
		// 			bagItems.push(item);
		// 		}
		// 	}else if (this.tabIndex===2) {
		// 		if (item.type===EntityType.ITEM) {
		// 			bagItems.push(item);
		// 		}
		// 	}
		// }
		this.itemBoxLayer.setItemCount(bagItems.length+10);

		this.bagItems=bagItems;
		var playerLevel=app.getCurPlayer().level;
		var itemBox, imgPath,itemColorName,level;
		for (var i = 0; i < bagItems.length; i++) {
			item = bagItems[i];
			itemBox = this.itemBoxLayer.getItemBoxByPosition(i+1);
			if(!itemBox)
				continue;

			// itemBox.setItemId(item.id);
			if (item.itemData) {
				imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
				itemBox.setIconSprite(imgPath);
				itemBox.adjustIconSprite();
			}
			if (item.type===EntityType.EQUIPMENT) {
				// itemBox.setColorSprite("item_color_1.png");
				level=Math.ceil(item.totalStar / 2);
				itemColorName = "item_color_" + level+ ".png"
				itemBox.setColorSprite(itemColorName);
				itemBox.showJobId(item.jobId);

				// if (this.tabIndex===2) {
				// 	itemBox.setRightDownLabelString(PropertyNames[item.kind]);
				// 	var rightDownLabel=itemBox.getChildByName("rightDownLabel");
				// 	rightDownLabel.setColor(colorTbl[level]);
				// }
				// else if (this.tabIndex===1) {
				// 	itemBox.setRightDownLabelString("Lv."+item.itemData.heroLevel);
				// 	var rightDownLabel=itemBox.getChildByName("rightDownLabel");
				// 	if (playerLevel>=item.itemData.heroLevel) {
				// 		rightDownLabel.setColor(consts.COLOR_WHITE);
				// 	}else{
				// 		rightDownLabel.setColor(consts.COLOR_RED);
				// 	}
				// }
			}else{
				itemBox.setRightDownLabelString(formula.bigNumber2Text(item.count));
			}
		}
	},

	setEquipmentsData:function(){
		var equipments = bagManager.getEquipments();
		if (!equipments) {
			return;
		}
		for (var kind = 1; kind <=6; kind++) {
			this.equip(kind, equipments[kind]);
		}
	},

	equip: function(kind, equipItem) {
		var itemBox = this.itemBoxs[kind];
		if (itemBox && equipItem && equipItem.itemData) {
			itemBox.setItemId(equipItem.id);
			imgPath = "icon/item/item_" + equipItem.itemData.skinId + ".png";
			itemBox.setIconSprite(imgPath);
			itemBox.adjustIconSprite();
			var level=Math.ceil(equipItem.totalStar / 2);
			var itemColorName = "item_color_" + level + ".png"
			itemBox.setColorSprite(itemColorName);
			// itemBox.setColorSprite("item_color_4.png");
			this.itemDatas[equipItem.id] = equipItem;

			// var propertyName = PropertyNames[equipItem.kind];
			// itemBox.setRightDownLabelString(propertyName);
			// var rightDownLabel=itemBox.getChildByName("rightDownLabel");
			// rightDownLabel.setColor(colorTbl[level]);
		}else{
			itemBox.enableIconSprite(false);
			itemBox.enableColorSprite(false);
			itemBox.setItemId(0);
			// itemBox.setRightDownLabelString("");
		}
	}
});
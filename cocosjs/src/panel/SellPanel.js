cb.SellPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/SellPanel.csb");
		this.__initView();
		// this.__initRoleView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var sellNode = ccsNode.getChildByName("sellNode");
		var container = sellNode.getChildByName("container");
		var contentSize = container.getContentSize();
		this.totalPriceText=sellNode.getChildByName("totalPriceText");

		var itemBoxLayer = cb.ItemBoxLayer.create();
		itemBoxLayer.setLimitColumn(8);
		itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(90, 88));
		// itemBoxLayer.setItemCount(25);
		itemBoxLayer.enableEvent(true);
		container.addChild(itemBoxLayer);

		var oneSellBtn=sellNode.getChildByName("oneSellBtn");
		oneSellBtn.addTouchEventListener(this.touchEvent, this);

		var self = this;
		var onItemBoxLayerCallback = function(position, itemBox) {
			var item=self.selectItems[position-1];
			if (!item) {
				return;
			}
			var worldPoint=itemBox.convertToWorldSpace(cc.p(0,0));
			var itemDetailLayer = new cb.ItemDetailLayer(item)
			itemDetailLayer.setPosition(worldPoint);
			
			// items.sellSelect=!items.sellSelect;
			// itemBox.enableKeepSelect(items.sellSelect);

			// self.calculatePrice();
			// var items = bagManager.items;
			// var item = items[position];
			// if (item) {

			// }
		};

		itemBoxLayer.addEventListener(onItemBoxLayerCallback);
		this.itemBoxLayer = itemBoxLayer;

		var checkBox;
		for (var i = 10000; i <=10006; i++) {
			checkBox = sellNode.getChildByTag(i);
			checkBox.setTag(i-10000);
			if (i===10000) {
				checkBox.setSelected(true);
			}else{
				checkBox.setSelected(false);
			}
			checkBox.addEventListener(this.selectedStateEvent, this);
		}
		this.selectMask=[1,0,0,0,0,0,0,0];
	},

	selectedStateEvent: function (sender, type) {
		var index=sender.getTag();
        switch (type) {
            case ccui.CheckBox.EVENT_UNSELECTED:
            	this.selectMask[index]=0;
            	this.updateSelectItems();
                break;
            case ccui.CheckBox.EVENT_SELECTED:
            	this.selectMask[index]=1;
            	this.updateSelectItems();
                break;
        }
    },

	setPanelData: function() {
		var items=bagManager.getBagData();
		if (!items) {
			quickLogManager.pushLog("背包数据读取失败，请重新打开卖出面板！");
			return;
		}

		this.items=[];
		for (var key in items) {
			// if (items[key].type===EntityType.EQUIPMENT){
			this.items.push(items[key]);
			// }
		}
		this.updateSelectItems();
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var item;
			var sellItems=[];
			for (var i = 0; i < this.selectItems.length; i++) {
				item = this.selectItems[i];
				// if (!item.sellSelect) {
					sellItems.push(item.id);
				// }
			}
			if (sellItems.length>0) {
				equipHandler.oneKeySell(sellItems);
			}else{
				tipsBoxLayer.showTipsBox("请先选中需要卖出的物品！");
			}
		}	
	},

	calculatePrice:function(){
		var selectItems=this.selectItems;
		var totalPrice=0;
		var item;
		for (var i = 0; i < selectItems.length; i++) {
			item = selectItems[i];
			// totalPrice+=item.baseValue+Math.floor(item.potential*item.percent/100)+Math.floor(consts.recycleRatio*item.potential*(100-item.percent)/100);
			totalPrice+=formula.calItemPrice(item);
		}
		this.totalPriceText.setString(totalPrice);
	},

	updateSelectItems:function(){
		var selectItems=[];
		var item,itemLv;
		for (var key in this.items) {
			item=this.items[key];
			itemLv=Math.ceil(item.totalStar / 2);
			if (this.selectMask[itemLv]) {
				selectItems.push(item);
			}
		}
		this.selectItems=selectItems;

		this.itemBoxLayer.setItemCount(selectItems.length+5);
		var item, itemBox, imgPath, itemColorName;
		// var totalPrice=0;
		for (var i = 0; i < selectItems.length; i++) {
			item = selectItems[i];

			itemBox = this.itemBoxLayer.getItemBoxByPosition(i+1);
			if(!itemBox)
				continue;

			// itemBox.setItemId(item.id);
			itemBox.enableKeepSelect(false);
			// item.sellSelect=false;

			// totalPrice+=item.baseValue+Math.round(item.potential*item.percent/100);

			if (item.itemData) {
				imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
				itemBox.setIconSprite(imgPath);
				itemBox.adjustIconSprite();
			}
			itemBox.showJobId(item.jobId);
			itemColorName = "item_color_" + Math.ceil(item.totalStar / 2) + ".png"
			itemBox.setColorSprite(itemColorName);
		}
		this.calculatePrice();
		// this.totalPriceText.setString(totalPrice);
	}
});


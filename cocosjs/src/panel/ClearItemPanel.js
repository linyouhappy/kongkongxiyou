cb.ClearItemPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/SellPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var sellNode = ccsNode.getChildByName("sellNode");
		var container = sellNode.getChildByName("container");
		var contentSize = container.getContentSize();
		var totalPriceText=sellNode.getChildByName("totalPriceText");
		totalPriceText.removeFromParent();
		var totalPriceNameText=sellNode.getChildByName("totalPriceNameText");
		totalPriceNameText.removeFromParent();

		var itemBoxLayer = cb.ItemBoxLayer.create();
		itemBoxLayer.setLimitColumn(8);
		itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(90, 88));
		itemBoxLayer.enableEvent(true);
		container.addChild(itemBoxLayer);

		var oneSellBtn=sellNode.getChildByName("oneSellBtn");
		oneSellBtn.addTouchEventListener(this.touchEvent, this);
		oneSellBtn.setTitleText("一键清理");

		var panelNameText=ccsNode.getChildByName("panelNameText");
		panelNameText.setString("一键清理");

		var self = this;
		var onItemBoxLayerCallback = function(position, itemBox) {
			var item=self.selectItems[position-1];
			if (!item) {
				return;
			}
			item.sellSelect=!item.sellSelect;
			itemBox.enableKeepSelect(item.sellSelect);
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

	setPanelData: function(callback) {
		this.callback=callback;
		this.updatePanelData();
	},

	updatePanelData:function(){
		var items=guildManager.getItems();
		if (!items) {
			quickLogManager.pushLog("数据读取失败，请重新打开面板！");
			return;
		}
		this.items=[];
		var item;
		for (var key in items) {
			item=items[key];
			if (!item.id) {
				item.id=item.itemId;
			}
			this.items.push(item);
		}
		this.updateSelectItems();
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var item;
			var sellItems=[];
			for (var i = 0; i < this.selectItems.length; i++) {
				item = this.selectItems[i];
				if (item.sellSelect) {
					sellItems.push(item.id);
				}
			}
			if (sellItems.length>0) {
				if (this.callback) {
					this.callback(sellItems);
				}
			}else{
				tipsBoxLayer.showTipsBox("请先选中需要清理的装备！");
			}
		}	
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
		for (var i = 0; i < selectItems.length; i++) {
			item = selectItems[i];

			itemBox = this.itemBoxLayer.getItemBoxByPosition(i+1);
			if(!itemBox)
				continue;

			itemBox.enableKeepSelect(true);
			item.sellSelect=true;
			if (item.itemData) {
				imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
				itemBox.setIconSprite(imgPath);
				itemBox.adjustIconSprite();
			}
			itemColorName = "item_color_" + Math.ceil(item.totalStar / 2) + ".png"
			itemBox.setColorSprite(itemColorName);
		}
	}
});


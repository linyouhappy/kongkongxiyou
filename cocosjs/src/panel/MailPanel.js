//MailPanel
cb.MailPanel = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName = "uiccs/MailLayer.csb";
		this.setInitData();
		this.enableBg();
		this.openBgTouch();
		this.initView();
	},

	initView: function() {
		var ccsNode = this.ccsNode;
		this.emptyTipsText=ccsNode.getChildByName("emptyTipsText");

		var mailNode = ccsNode.getChildByName("mailNode");
		var container = mailNode.getChildByName("container");
		var scrollView = mailNode.getChildByName("scrollView");
		scrollView.setScrollBarEnabled(false);
		this.mailNode = mailNode;
		this.mailNode.setVisible(false);
		this.emptyTipsText.setVisible(false);
		// this.mailNode.setPosition(0,cc.winSize.height/2);

		var richTextBox = cb.CCRichText.create(620, 0);
		richTextBox.setLineSpace(2);
		richTextBox.setDetailStyle("Arial", 24, cc.color(255, 255, 255, 255));
		richTextBox.setPosition(2, 2);
		richTextBox.setTouchEnabled(false);

		scrollView.addChild(richTextBox);
		this.scrollView=scrollView;
		this.richTextBox = richTextBox;

		var conentSize=scrollView.getContentSize();
		this.scrollViewHeight=conentSize.height;
		this.scrollViewWidth=conentSize.width;

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
			var item=self.bagItems[position-1];
			if (!item) {
				return;
			}
			var worldPoint=itemBox.convertToWorldSpace(cc.p(0,0));
			var itemDetailLayer = new cb.ItemDetailLayer(item)
			itemDetailLayer.setPosition(worldPoint);
		};
		itemBoxLayer.addEventListener(onItemBoxLayerCallback);
		this.itemBoxLayer = itemBoxLayer;

		var manReadBtn = ccsNode.getChildByName("manReadBtn");
		var autoReadBtn = ccsNode.getChildByName("autoReadBtn");
		manReadBtn.addTouchEventListener(this.touchEvent, this);
		this.manReadBtn=manReadBtn;
		autoReadBtn.addTouchEventListener(this.touchEvent, this);
		this.autoReadBtn=autoReadBtn;
	},

	panelInitAction:function(){
        this.ccsNode.setScale(0.1);
        var self = this;
		var onActionCallback = function(sender) {
			self.mailNode.setVisible(true);
			self.loadData();

		};
		var sequence = cc.Sequence.create(
			cc.ScaleTo.create(0.2, 1),
			cc.DelayTime.create(0.5),
			cc.CallFunc.create(onActionCallback)
		);
		this.ccsNode.runAction(sequence);
    },

	showMessage:function(message) {
		var richTextBox = this.richTextBox;
		richTextBox.clearAll();
		var block;
		var blockLists = message.m_blockLists;
		for (var blockIndex = 0; blockIndex < blockLists.length; blockIndex++) {
			block = blockLists[blockIndex];
			if (block.m_blockType === chat.blockTypeLabel) {
				richTextBox.setTextColor(block.m_color);
				richTextBox.appendRichText(block.m_text, chat.kTextStyleNormal, block.m_nodeId, block.m_eventId);
			} else if (block.m_blockType === chat.blockTypeBracketHerfLabel) {
				richTextBox.setTextColor(block.m_color);
				richTextBox.appendRichText(block.m_text, chat.kTextStyleBracketHerf, block.m_nodeId, block.m_eventId);
			} else if (block.m_blockType === chat.blockTypeHerfLabel) {
				richTextBox.setTextColor(block.m_color);
				richTextBox.appendRichText(block.m_text, chat.kTextStyleHerf, block.m_nodeId, block.m_eventId);
			} else if (block.m_blockType === chat.blockTypeSprite) {
				richTextBox.appendRichSprite(block.m_spriteName, block.m_nodeId, block.m_eventId);
			} else if (block.m_blockType === chat.blockTypeAnimate) {
				richTextBox.appendRichAnimate(block.m_spriteName, block.m_nodeId, block.m_eventId);
			}
		}
		richTextBox.layoutChildren();
		var richTextSizeHeight = richTextBox.getContentSize().height;
		if (richTextSizeHeight < this.scrollViewHeight) {
			this.scrollView.setContentSize(cc.size(this.scrollViewWidth, this.scrollViewHeight));
			richTextBox.setPosition(cc.p(10, this.scrollViewHeight - richTextSizeHeight));
		} else {
			this.scrollView.setContentSize(cc.size(this.scrollViewWidth, richTextSizeHeight));
			richTextBox.setPosition(cc.p(10, -25));
		}
	},

	closePanel: function() {
		var self = this;
		var onActionCallback = function(sender) {
			layerManager.clearPanel(self);
		};
		var sequence = cc.Sequence.create(
			cc.ScaleTo.create(0.3, 1.2),
			cc.ScaleTo.create(0.1, 0.1),
			cc.CallFunc.create(onActionCallback)
		);
		this.ccsNode.runAction(sequence);
		mailManager.pushTips();
	},

	showItems:function(items){
		this.itemBoxLayer.setItemCount(6);
		if (!items) {
			return;
		}
		var bagItems = [];
		for (var key in items) {
			bagItems.push(items[key]);
		}
		// this.itemBoxLayer.setItemCount(bagItems.length);
		this.bagItems=bagItems;
		var item, itemBox, imgPath, itemColorName, level;
		for (var i = 0; i < bagItems.length; i++) {
			item = bagItems[i];
			itemBox = this.itemBoxLayer.getItemBoxByPosition(i+1);
			if(!itemBox)
				continue;

			if (item.itemData) {
				imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
				itemBox.setIconSprite(imgPath);
				itemBox.adjustIconSprite();
			}
			if (item.type===EntityType.EQUIPMENT) {
				// itemColorName = formula.starToColorImg(item.totalStar);
				level=Math.ceil(item.totalStar / 2);
				itemColorName = "item_color_" + level+ ".png"
				
				itemBox.setColorSprite(itemColorName);
				itemBox.showJobId(item.jobId);
				// itemBox.setRightDownLabelString(PropertyNames[item.kind]);
				// var rightDownLabel=itemBox.getChildByName("rightDownLabel");
				// rightDownLabel.setColor(colorTbl[level]);
			}else{
				itemBox.setRightDownLabelString(formula.bigNumber2Text(item.count));
			}
		}
	},

	loadData:function(){
		var mailMessage = mailManager.topMail();
		this.mailMessage=mailMessage;
		if (mailMessage) {
			this.showMessage(mailMessage);

			this.showItems(mailMessage.items);
			this.mailNode.setPosition(0, cc.winSize.height / 2);

			var self = this;
			var sequence;
			if (!this.isAutoRead) {
				var onActionCallback = function(sender) {
					self.manReadBtn.setEnabled(true);
					self.autoReadBtn.setEnabled(true);
				};
				sequence = cc.Sequence.create(
					cc.MoveTo.create(0.2, cc.p(0, -140)),
					cc.CallFunc.create(onActionCallback)
				);
			}else{
				var onActionCallback = function(sender) {
					self.shootData();
				};
				sequence = cc.Sequence.create(
					cc.MoveTo.create(0.2, cc.p(0, -140)),
					cc.DelayTime.create(1),
					cc.CallFunc.create(onActionCallback)
				);
			}
			this.mailNode.runAction(sequence);
		} else {
			this.emptyTipsText.setVisible(true);
		}
	},

	unloadData:function(){
		this.manReadBtn.setEnabled(false);
		this.autoReadBtn.setEnabled(false);

		var self = this;
		var onActionCallback = function(sender) {
			self.loadData();
		};
		var sequence = cc.Sequence.create(
			cc.MoveTo.create(0.2,cc.p(0,cc.winSize.height/2)),
			cc.DelayTime.create(0.2),
			cc.CallFunc.create(onActionCallback)
		);
		this.mailNode.runAction(sequence);
	},

	shootData:function(){
		mailManager.requestReadMail(this.mailMessage.mailId);
	},

	// setPanelData: function() {
	// },

	updatePanel: function() {
		this.unloadData();
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName() === "manReadBtn") {
				this.isAutoRead=false;
				this.shootData();
			}else{
				this.isAutoRead=true;
				this.shootData();
			}
			// this.closePanel();
		}
	}
});
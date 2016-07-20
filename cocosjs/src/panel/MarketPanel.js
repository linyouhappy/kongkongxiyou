cb.MarketManager = cc.Class.extend({
	ctor: function() {
		this.tenTrades={};
		this.tradeDetails={};
		this.tradeInterval=3000;
		var marketData = dataApi.market.findById(1);
        this.timePointDelta=marketData.timePointDelta;
        this.timePointCount=marketData.timePointCount;
	},

	requestFiveTrade:function(kindId){
		if (this.requestFiveTradeTime) {
			if (Date.now()<this.requestFiveTradeTime) {
				return;
			}
		}
		this.requestFiveTradeTime=Date.now()+this.tradeInterval;
		var self=this;
		marketHandler.getFiveTrade(kindId,function(data){
			if (layerManager.isRunPanel(cb.kMMarketDetailPanelId)) {
				var curPrice=self.getPriceByKindId(kindId);
				var curPanel = layerManager.curPanel;
				curPanel.setFiveTrade(data,curPrice);
			}
		});
	},

	requestTenTrade:function(kindId){
		if (this.requestTenTradeTime) {
			if (Date.now()<this.requestTenTradeTime) {
				return;
			}
		}
		this.requestTenTradeTime=Date.now()+this.tradeInterval;

		var tenTrade=this.tenTrades[kindId];
		if (!tenTrade) {
			tenTrade={
				tenTrade:[],
				tenTradeId:0
			};
			this.tenTrades[kindId]=tenTrade;
		}

		var tenTradeId=tenTrade.tenTradeId;
		marketHandler.getTenTrade(kindId,tenTradeId,function(data){
			if (data.length>0) {
				var record;
				for (var i = 0; i < data.length; i++) {
					record=data[i];
					if (record.id>tenTradeId) {
						tenTrade.tenTrade.push(record);
					}
				}
				if (record) {
					tenTrade.tenTradeId=record.id;
				}
				while (tenTrade.tenTrade.length > 10) {
			    	tenTrade.tenTrade.shift();
			    }
			}
			if (layerManager.isRunPanel(cb.kMMarketDetailPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.setTenTrade(tenTrade.tenTrade);
			}
		});
	},

	requestTradeDetails:function(kindId){
		if (this.requestTradeDetailTime) {
			if (Date.now()<this.requestTradeDetailTime) {
				return;
			}
		}
		this.requestTradeDetailTime=Date.now()+this.tradeInterval;

		var tradeDetail=this.tradeDetails[kindId];
		if (!tradeDetail) {
			tradeDetail={
				tradeDetail:[],
				tradeDetailId:0
			};
			this.tradeDetails[kindId]=tradeDetail;
		}

		var tradeDetailId=tradeDetail.tradeDetailId;
		var self=this;
		marketHandler.getDetailTrade(kindId,tradeDetailId,function(data){
			if (data.length>0) {
				var detail;
				for (var i = 0; i < data.length; i++) {
					detail=data[i];
					if (detail.id>tradeDetailId) {
						tradeDetail.tradeDetail.push(detail);
					}else if (detail.id===tradeDetailId) {
						var tmpDetail;
						for (var j =tradeDetail.tradeDetail.length-1; j>=0; j--) {
							tmpDetail=tradeDetail.tradeDetail[j];
							if (tmpDetail.id===tradeDetailId) {
								tmpDetail.closePrice=detail.closePrice;
							    tmpDetail.maxPrice=detail.maxPrice;
							    tmpDetail.minPrice=detail.minPrice;
							    tmpDetail.amount=detail.amount;
							    break;
							}
						}
					}
				}

				if (detail) {
					tradeDetail.tradeDetailId=detail.id;
					self.setPriceByKindId(kindId,detail.closePrice);
				}

				function sortNumber(a,b){
					return a.timePoint - b.timePoint;
				}
				tradeDetail.tradeDetail.sort(sortNumber);
				while (tradeDetail.tradeDetail.length > self.timePointCount) {
			      tradeDetail.tradeDetail.shift();
			    }
			}
			if (layerManager.isRunPanel(cb.kMMarketDetailPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.setTradeDetail(tradeDetail.tradeDetail);
			}
			// cc.log("tradeDetail:"+JSON.stringify(tradeDetail));
		});
	},

	requestMarketList: function() {
		var self = this;
		marketHandler.getMarketList(function(data) {
			self.setMarketList(data);
		});
		this.hasRequestMarket = true;
	},

	setPriceByKindId:function(kindId,price){
		var marketData=this.marketList[kindId];
		if (marketData) {
			marketData.curPrice=price;
			marketData.maxPrice = Math.max(marketData.maxPrice, price);
            marketData.minPrice = Math.min(marketData.minPrice, price);
		}
	},

	getPriceByKindId:function(kindId){
		var marketData=this.marketList[kindId];
		if (marketData) {
			return marketData.curPrice;
		}
		return 0;
	},

	setMarketList: function(marketList) {
		this.marketList = {};
		var marketData;
		for (var i = 0; i < marketList.length; i++) {
			marketData = marketList[i];
			marketData.itemData = dataApi.item.findById(marketData.kindId);
			this.marketList[marketData.kindId]=marketData;
		}

		if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updateLayerData();
		}
	},

	getMarketList: function() {
		if (!this.marketList && !this.hasRequestMarket) {
			this.requestMarketList();
			return null;
		}
		return this.marketList;
	},

	requestPlayerBank: function() {
		var self = this;
		marketHandler.getPlayerBank(function(data) {
			self.setPlayerBank(data);
		});
		this.hasRequestPlayerBank = true;
	},

	setPlayerBank: function(playerBank) {
		this.playerBank = playerBank;
		if (playerBank.costRate) {
			this.costRate=playerBank.costRate;
			this.isTradeing=playerBank.isTradeing;
		}

		var marketItems={};
		for (var key in playerBank.marketItems) {
			item=playerBank.marketItems[key];
			item.itemData = dataApi.item.findById(item.kindId);
			marketItems[item.kindId]=item;
		}
		playerBank.marketItems=marketItems;

		var buyItems={};
		for (var key in playerBank.buyItems) {
			item=playerBank.buyItems[key];
			item.type=0;
			item.itemData = dataApi.item.findById(item.kindId);
			if (buyItems[item.id]) {
				cc.log("ERROR:playerBank.buyItems[item.id]!==null");
			}
			buyItems[item.id]=item;
		}
		playerBank.buyItems=buyItems;

		var sellItems={};
		for (var key in playerBank.sellItems) {
			item=playerBank.sellItems[key];
			item.type=1;
			item.itemData = dataApi.item.findById(item.kindId);
			if (sellItems[item.id]) {
				cc.log("ERROR:playerBank.sellItems[item.id]!==null");
			}
			sellItems[item.id]=item;
		}
		playerBank.sellItems=sellItems;

		if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updateLayerData();
		}
	},

	getPlayerBank: function() {
		if (!this.playerBank && !this.hasRequestPlayerBank) {
			this.requestPlayerBank();
			return null;
		}
		return this.playerBank;
	},

	inputCaoCoin:function(caoCoin){
		if (!app.getCurPlayer().checkCaoCoin(caoCoin)) {
			return;
		}
		var self=this;
		marketHandler.inputCaoCoin(caoCoin,function(){
			self.playerBank.caoCoin+=caoCoin;
			var curPlayer = app.getCurPlayer();
			curPlayer.addCaoCoin(-caoCoin);
			if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updateLayerData();
			}
		});
	},
	
	outputCaoCoin:function(caoCoin){
		var self=this;
		marketHandler.outputCaoCoin(caoCoin,function(){
			self.playerBank.caoCoin-=caoCoin;
			var curPlayer = app.getCurPlayer();
			curPlayer.addCaoCoin(caoCoin);
			if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updateLayerData();
			}
		});
	},

	outputItems:function(){
		var self=this;
		marketHandler.outputItems(function(){
			self.playerBank.marketItems={};
			if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updateLayerData();
			}
		});
	},

	buyOrder: function(kindId, price, count) {
		var self=this;
		marketHandler.buyOrder(kindId, price, count,function(id){

			var buyItem = {
				id:id,
				kindId: kindId,
				price: price,
				count: count,
				type: 0
			};
			buyItem.itemData = dataApi.item.findById(kindId);
			self.playerBank.buyItems[id]=buyItem;
			self.playerBank.caoCoin-=price*count;

			if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updateLayerData();
			}
		});
	},

	sellOrder: function(kindId, price, count) {
		var self=this;
		marketHandler.sellOrder(kindId, price, count,function(id){

			var sellItem = {
				id:id,
				kindId: kindId,
				price: price,
				count: count,
				type: 1
			};
			sellItem.itemData = dataApi.item.findById(kindId);
			self.playerBank.sellItems[id]=sellItem;

			bagManager.removeItemCount(kindId,count);

			if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updateLayerData();
			}
		});
	},

	cancelOrder:function(type,ids){
		if (type===0) {
			for (var i = 0; i < ids.length; i++) {
				delete this.playerBank.buyItems[ids[i]];
			}
		}else{
			for (var i = 0; i < ids.length; i++) {
				delete this.playerBank.sellItems[ids[i]];
			}
		}
		
		if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updateLayerData();
		}
	}
});

var marketManager = new cb.MarketManager();

//MarketBuyLayer
// cb.MarketBuyLayer = cc.Layer.extend({
// 	ctor: function() {
// 		this._super();
// 		this.m_width = 750;
// 		this.m_height = 450;

// 		this.openBgTouch();

// 		var bgSprite = cc.Scale9Sprite.createWithSpriteFrameName("color_black.png");
// 		bgSprite.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
// 		this.addChild(bgSprite);
// 		bgSprite.setOpacity(150);

// 		var ccsNode = ccs.CSLoader.createNode("uiccs/MarketBuyLayer.csb");
// 		this.addChild(ccsNode);
// 		this._ccsNode = ccsNode;

// 		var tempTexture = cc.director.getTextureCache().addImage("fonts/atlas_yellow.png");
// 		var caoCoinLabel = cc.Label.createWithCharMap(tempTexture, 32, 40, 37);
// 		caoCoinLabel.setPosition(-307, 195);
// 		caoCoinLabel.setAnchorPoint(cc.p(0, 0.5));
// 		caoCoinLabel.setScaleX(0.4);
// 		caoCoinLabel.setScaleY(0.5);
// 		ccsNode.addChild(caoCoinLabel);
// 		var curPlayer = app.getCurPlayer();
// 		caoCoinLabel.setString(curPlayer.getCaoCoinString());

// 		var priceTextField = ccsNode.getChildByName("priceTextField");
// 		var countTextField = ccsNode.getChildByName("countTextField");
// 		priceTextField.addEventListener(this.textFieldCallback,this);
// 		countTextField.addEventListener(this.textFieldCallback,this);

// 		var buyBtn = ccsNode.getChildByName("buyBtn");
// 		var sellBtn = ccsNode.getChildByName("sellBtn");
// 		buyBtn.addTouchEventListener(this.touchEvent, this);
// 		sellBtn.addTouchEventListener(this.touchEvent, this);
// 	},

// 	touchEvent:function(sender, type) {
// 		if (type === ccui.Widget.TOUCH_ENDED) {
// 			if (sender.getName()==="buyBtn") {
// 				cc.log("buy============>>");
// 			}else{
// 				cc.log("sell============>>");
// 			}
// 		}
// 	},

// 	textFieldCallback:function(sender, type){
// 		if (type === ccui.TextField.EVENT_DETACH_WITH_IME) {
// 			if (sender.getName()==="priceTextField") {
// 				cc.log("price input===========>>>:"+sender.getString());
// 			}else{
// 				cc.log("count input===========>>>:"+sender.getString());
// 			}
// 		}
// 	},

// 	openBgTouch: function() {
// 		var onTouchBegan = function(touch, event) {
// 			return true;
// 		};

// 		var self = this;
// 		var onTouchEnded = function(touch, event) {
// 			var location = self.convertTouchToNodeSpace(touch);
// 			if (location.x > -self.m_width / 2 && location.x < self.m_width / 2 && location.y > -self.m_height / 2 && location.y < self.m_height / 2) {

// 			} else {
// 				self.removeFromParent();
// 			}
// 		};

// 		cc.eventManager.addListener({
// 			event: cc.EventListener.TOUCH_ONE_BY_ONE,
// 			swallowTouches: true,
// 			onTouchBegan: onTouchBegan,
// 			onTouchEnded: onTouchEnded
// 		}, this);
// 	},

// 	setMarketData: function(marketData) {
// 		var ccsNode = this._ccsNode;
// 		var titleText = ccsNode.getChildByName("titleText");
// 		titleText.setString(marketData.itemData.name + "交易");

// 	}
// });

//MarketLayer
cb.MarketLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/MarketLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		var contaner = ccsNode.getChildByName("contaner");

		var tableView = new cc.TableView(this, contaner.getContentSize());
		tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		tableView.setPosition(contaner.getPosition());
		tableView.setDelegate(this);
		tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
		this.addChild(tableView);

		contaner.removeFromParent();
		this.tableView = tableView;
	},

	updateLayerData: function() {
		var marketList = marketManager.getMarketList();
		if (!marketList) {
			return;
		}
		this.marketList=[];
		for (var key in marketList)
			this.marketList.push(marketList[key]);

		this.updateIndex=this.marketList.length;
		this.tableView.reloadData();
	},

	tableCellTouched: function(table, cell) {
		// cc.log("cell touched at index: " + cell.getIdx());
		var idx=cell.getIdx();
		if (this.updateIndex===idx) {
			if (this.lastTime) {
				if (Date.now()>this.lastTime) {
					marketManager.requestMarketList();
					this.lastTime=Date.now()+3000;
				}else{
					quickLogManager.pushLog("刷新太频繁了！",4);
				}
			}else{
				marketManager.requestMarketList();
				this.lastTime=Date.now()+3000;
			}
			
		}
		// else{
		// 	var marketData = this.marketList[idx];
//			if (marketData) {
//				layerManager.openPanel(cb.kMMarketDetailPanelId,marketData);
//			}else{
//				quickLogManager.pushLog("无物品交易数据！",4);
//			}
		// }
	},

	tableCellHighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(true);
	},

	tableCellUnhighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);
	},

	tableCellSizeForIndex: function(table, idx) {
		return cc.size(780, 70);
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var marketData = this.marketList[sender.getTag()];
			if (marketData) {
				layerManager.openPanel(cb.kMMarketDetailPanelId, marketData,true);
			} else {
				quickLogManager.pushLog("无物品交易数据！", 4);
			}
//			var marketBuyLayer = new cb.MarketBuyLayer();
//			marketBuyLayer.setLocalZOrder(300);
//			marketBuyLayer.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
//			marketBuyLayer.setMarketData(marketData);
//			mainPanel.addChild(marketBuyLayer);
		}
	},

	tableCellAtIndex: function(table, idx) {
		var cell = table.dequeueCell();
		var ccsNode;
		var tradeBtn;
		if (!cell) {
			cell = new cc.TableViewCell();
			ccsNode = ccs.CSLoader.createNode("uiccs/MarketItem.csb");
			ccsNode.setTag(123);
			cell.addChild(ccsNode);

			tradeBtn = ccsNode.getChildByName("tradeBtn");
			tradeBtn.addTouchEventListener(this.touchEvent, this);
			tradeBtn.setTag(idx);

		} else {
			ccsNode = cell.getChildByTag(123);
			tradeBtn = ccsNode.getChildByName("tradeBtn");
			tradeBtn.setTag(idx);
		}

		var updateText = ccsNode.getChildByName("updateText");
		var itemNameText = ccsNode.getChildByName("itemNameText");
		var maxPriceText = ccsNode.getChildByName("maxPriceText");
		var minPriceText = ccsNode.getChildByName("minPriceText");
		var curPriceText = ccsNode.getChildByName("curPriceText");
		var iconSprite = ccsNode.getChildByName("iconSprite");
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);

		if (this.updateIndex===idx) {
			cell.setTag(168);
			updateText.setVisible(true);
			itemNameText.setVisible(false);
			maxPriceText.setVisible(false);
			minPriceText.setVisible(false);
			curPriceText.setVisible(false);
			iconSprite.setVisible(false);
			tradeBtn.setVisible(false);
			var bgBoxSprite= ccsNode.getChildByName("bgBoxSprite");
			bgBoxSprite.setVisible(false);
			return cell;
		}else{
			if (cell.getTag()===168) {
				cell.setTag(0);
				updateText.setVisible(false);
				itemNameText.setVisible(true);
				maxPriceText.setVisible(true);
				minPriceText.setVisible(true);
				curPriceText.setVisible(true);
				iconSprite.setVisible(true);
				tradeBtn.setVisible(true);
				var bgBoxSprite= ccsNode.getChildByName("bgBoxSprite");
				bgBoxSprite.setVisible(true);
			}
		}

		var marketData = this.marketList[idx];
		itemNameText.setString(marketData.itemData.name);

		maxPriceText.setString(marketData.maxPrice);
		minPriceText.setString(marketData.minPrice);
		curPriceText.setString(marketData.curPrice);

		imgPath = "icon/item/item_" + marketData.itemData.skinId + ".png";
		iconSprite.setTexture(imgPath);
		iconSprite.setScale(48 / iconSprite.getContentSize().width);
		return cell;
	},

	numberOfCellsInTableView: function(table) {
		if (!this.marketList) {
			return 0;
		}
		return this.marketList.length+1;
	}
});


//MarketMyLayer
cb.MarketMyLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/MarketMyLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		var contaner = ccsNode.getChildByName("contaner");

		var tableView = new cc.TableView(this, contaner.getContentSize());
		tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		tableView.setPosition(contaner.getPosition());
		tableView.setDelegate(this);
		tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
		this.addChild(tableView);

		contaner.removeFromParent();
		this.tableView = tableView;

		this.__initView();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		this.caoCoinText=ccsNode.getChildByName("caoCoinText");
		this.costRateText=ccsNode.getChildByName("costRateText");

		var tempTexture = cc.director.getTextureCache().addImage("fonts/atlas_yellow.png");
        var caoCoinLabel=cc.Label.createWithCharMap(tempTexture,32,40,37);
        caoCoinLabel.setPosition(-258,-95);
        this.addChild(caoCoinLabel);
        caoCoinLabel.setAnchorPoint(cc.p(0,0.5));
        caoCoinLabel.setScale(0.6);
        caoCoinLabel.setVisible(false);
        // caoCoinLabel.setLocalZOrder(10);
        this.caoCoinLabel=caoCoinLabel;

		this.priceTextField = ccsNode.getChildByName("priceTextField");
		this.countTextField = ccsNode.getChildByName("countTextField");
		this.priceTextField.addEventListener(this.textFieldCallback,this);
		this.countTextField.addEventListener(this.textFieldCallback,this);

		var buyBtn = ccsNode.getChildByName("buyBtn");
		var sellBtn = ccsNode.getChildByName("sellBtn");
		var selectBtn=ccsNode.getChildByName("selectBtn");
		buyBtn.addTouchEventListener(this.touchEvent, this);
		sellBtn.addTouchEventListener(this.touchEvent, this);
		selectBtn.addTouchEventListener(this.touchEvent, this);

		selectBtn.setPressedActionEnabled(true);
		this.selectBtn=selectBtn;
		this.iconSprite=selectBtn.getChildByName("iconSprite");
		this.iconSprite.setVisible(false);
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==='selectBtn') {
				var itemSelectLayer=new cb.ItemSelectLayer();
				itemSelectLayer.setPosition(0,36);
				this.addChild(itemSelectLayer);
				var self=this;
				itemSelectLayer.setItemCallback(function(item) {
					self.setSelectItem(item);
				});
				return;
			}

			if (!marketManager.isTradeing) {
				quickLogManager.pushLog("交易所休市中，不能交易");
				return;
			}


			if (this.marketList.length>5) {
				quickLogManager.pushLog("很抱歉，最多只可挂6单！",4);
				return;
			}
			var selectItem=this.selectItem;
			if (!selectItem) {
				quickLogManager.pushLog("请先选择需要交易的物品！",4);
				this.selectBtn.runAction(cc.Blink.create(2,8));
				return;
			}

			var itemData = dataApi.item.findById(selectItem.kindId);
			if (!itemData) {
				quickLogManager.pushLog("未知物品，无法交易！",4);
				this.selectBtn.runAction(cc.Blink.create(2,8));
				return;
			}

			var price=Number(this.priceTextField.getString());
			if (!price) {
				quickLogManager.pushLog("请输入挂单的价格！",4);
				this.priceTextField.runAction(cc.Blink.create(2,8));
				return;
			}
			var count=Number(this.countTextField.getString());
			if (!count) {
				quickLogManager.pushLog("请输入挂单的数量！",4);
				this.countTextField.runAction(cc.Blink.create(2,8));
				return;
			}
			
			if (sender.getName()==="buyBtn") {
				if (!this.playerBank) {
					quickLogManager.pushLog("交易账户信息获取错误！",4);
					return;
				}
				count=100*count;
				var totalCost=count*price;
				if (totalCost>this.playerBank.caoCoin) {
					quickLogManager.pushLog("交易账户余额不足，请转入资金！",4);
					this.priceTextField.runAction(cc.Blink.create(2,8));
					return;
				}

				marketManager.buyOrder(selectItem.kindId,price,count);

			}else if (sender.getName()==="sellBtn") {
				count=100*count;
				if (count>this.selectItem.count) {
					quickLogManager.pushLog("背包该物品数量不足！",4);
					this.countTextField.runAction(cc.Blink.create(2,8));
					return;
				}
				marketManager.sellOrder(selectItem.kindId,price,count);
			}
			this.priceTextField.setString('');
			this.countTextField.setString('');
		}
	},

	setSelectItem:function(item){
		if (!this.selectItem) {
			this.selectBtn.setTitleText("");
			this.iconSprite.setVisible(true);
		}
		this.selectItem=item;
		var imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
		this.iconSprite.setTexture(imgPath);
		var contentSize=this.iconSprite.getContentSize();
		this.iconSprite.setScale(56/contentSize.width);
	},

	textFieldCallback:function(sender, type){
		if (type === ccui.TextField.EVENT_DETACH_WITH_IME) {
			var count=sender.getString();
			var count=Math.floor(Number(count));
			if (!count) {
				sender.setString('');
			}else{
				if (count<=0) {
					count=1;
				}
				sender.setString(count);
			}
		}
	},

	updateLayerData: function() {
		var playerBank = marketManager.getPlayerBank();
		if (!playerBank) {
			return;
		}
		var pricesList = marketManager.getMarketList();
		if (!pricesList) {
			return;
		}
		if (marketManager.costRate){
			this.costRateText.setString((marketManager.costRate/10)+"%");
		}

		this.playerBank=playerBank;
		this.pricesList=pricesList;

		var marketList=[];
		for (var key in playerBank.buyItems)
			marketList.push(playerBank.buyItems[key]);

		for (var key in playerBank.sellItems)
			marketList.push(playerBank.sellItems[key]);

		this.marketList = marketList;
		this.tableView.reloadData();

		this.caoCoinText.setString(playerBank.caoCoin);
		if (this.lastCaoCoin || this.lastCaoCoin===0) {
			cc.log("this.lastCaoCoin="+this.lastCaoCoin+",playerBank.caoCoin="+playerBank.caoCoin);
			var deltaCaoCoin=playerBank.caoCoin-this.lastCaoCoin;
			if (deltaCaoCoin===0) {
				return;
			}else if (deltaCaoCoin>0) {
				deltaCaoCoin="+"+deltaCaoCoin;
			}
			var caoCoinLabel=this.caoCoinLabel;
			caoCoinLabel.setVisible(true);
			caoCoinLabel.setString(deltaCaoCoin);
			caoCoinLabel.setScale(0.4);
			caoCoinLabel.setOpacity(255);
			caoCoinLabel.stopAllActions();

			var sequence = cc.Sequence.create(
                cc.ScaleTo.create(0.2,0.8),
                cc.ScaleTo.create(0.2,0.5),
                cc.DelayTime.create(2),
                cc.FadeOut.create(0.3),
                cc.Hide.create()
            );
            caoCoinLabel.runAction(sequence);
		}
		this.lastCaoCoin=playerBank.caoCoin;
	},

	tableCellTouched: function(table, cell) {
		// var idx=cell.getIdx();
		// var marketData = this.marketList[idx];
		// marketData=this.pricesList[marketData.kindId];
		// if (marketData) {
		// 	layerManager.openPanel(cb.kMMarketDetailPanelId, marketData);
		// } else {
		// 	quickLogManager.pushLog("无物品交易数据！", 4);
		// }
	},

	tableCellHighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(true);
	},

	tableCellUnhighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);
	},

	tableCellSizeForIndex: function(table, idx) {
		return cc.size(780, 70);
	},

	touchEvent1: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var marketData = this.marketList[sender.getTag()];
			sender.setTitleText("等 待");
			marketHandler.cancelOrder(marketData.id,marketData.type);
		}
	},

	tableCellAtIndex: function(table, idx) {
		var cell = table.dequeueCell();
		var ccsNode;
		if (!cell) {
			cell = new cc.TableViewCell();
			ccsNode = ccs.CSLoader.createNode("uiccs/MarketItem.csb");
			ccsNode.setTag(123);
			cell.addChild(ccsNode);

			var tradeBtn = ccsNode.getChildByName("tradeBtn");
			tradeBtn.addTouchEventListener(this.touchEvent1, this);
			tradeBtn.setTag(idx);
			tradeBtn.setTitleText("撤 单");

		} else {
			ccsNode = cell.getChildByTag(123);
			var tradeBtn = ccsNode.getChildByName("tradeBtn");
			tradeBtn.setTag(idx);
			tradeBtn.setTitleText("撤 单");
		}
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);
		var marketData = this.marketList[idx];

		var itemNameText = ccsNode.getChildByName("itemNameText");
		if (marketData.type===0) {
			itemNameText.setString("买单");
			itemNameText.setTextColor(cc.color(144,238,144,255));
		}else{
			itemNameText.setString("卖单");
			itemNameText.setTextColor(cc.color(255,0,0,255));
		}

		var maxPriceText = ccsNode.getChildByName("maxPriceText");
		maxPriceText.setTextColor(cc.color(255,255,255,255));
		maxPriceText.setString(marketData.count/100);

		var minPriceText = ccsNode.getChildByName("minPriceText");
		minPriceText.setString(marketData.price);

		var curPriceText = ccsNode.getChildByName("curPriceText");
		var curPrice;
		if (!this.pricesList[marketData.kindId]) {
			curPrice='?';
		}else{
			curPrice=this.pricesList[marketData.kindId].curPrice || '?';
		}
		// var curPrice=this.pricesList[marketData.kindId].curPrice;
		curPriceText.setString(curPrice);

		if (marketData.price>curPrice) {
			minPriceText.setTextColor(cc.color(255,0,0,255));
		}else if (marketData.price<curPrice) {
			minPriceText.setTextColor(cc.color(144,238,144,255));
		}else{
			minPriceText.setTextColor(cc.color(255,255,255,255));
		}

		var iconSprite = ccsNode.getChildByName("iconSprite");
		imgPath = "icon/item/item_" + marketData.itemData.skinId + ".png";
		iconSprite.setTexture(imgPath);
		iconSprite.setScale(48 / iconSprite.getContentSize().width);
		return cell;
	},

	numberOfCellsInTableView: function(table) {
		if (!this.marketList) {
			return 0;
		}
		return this.marketList.length;
	}
});


//MarketBankLayer
cb.MarketBankLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/MarketBankLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		// var contaner = ccsNode.getChildByName("contaner");

		var buyBtn = ccsNode.getChildByName("buyBtn");
		var sellBtn = ccsNode.getChildByName("sellBtn");
		var outputItemBtn= ccsNode.getChildByName("outputItemBtn");
		buyBtn.addTouchEventListener(this.touchEvent, this);
		sellBtn.addTouchEventListener(this.touchEvent, this);
		outputItemBtn.addTouchEventListener(this.touchEvent, this);

		this.caoCoinText=ccsNode.getChildByName("caoCoinText");
		this.myCaoCoinText=ccsNode.getChildByName("myCaoCoinText");

		this.caoCoinTextField=ccsNode.getChildByName("caoCoinTextField");

		this.__initView();
	},

	__initView:function(){
		var caoCoinSprite=this._ccsNode.getChildByName("caoCoinSprite");
		var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/bar_coin.plist", "bar_coin_");
        var animate = cc.Animate.create(clickEfectAnim)
        var repeatForever = cc.RepeatForever.create(animate);
        caoCoinSprite.runAction(repeatForever);

		var container=this._ccsNode.getChildByName("container");
		var contentSize = container.getContentSize();

		var itemBoxLayer = cb.ItemBoxLayer.create();
		itemBoxLayer.setLimitColumn(8);
		itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(90, 88));
		itemBoxLayer.enableEvent(true);
		container.addChild(itemBoxLayer);

		var self = this;
		var onItemBoxLayerCallback = function(position, itemBox) {
			var itemId = itemBox.getItemId();
			if (itemId <= 0) return;

			var item=self.marketItems[position-1];
			var worldPoint=itemBox.convertToWorldSpace(cc.p(0,0));
			if (item) {
				var itemDetailLayer = new cb.ItemDetailLayer(item)
				itemDetailLayer.setPosition(worldPoint);
			}
		};
		itemBoxLayer.addEventListener(onItemBoxLayerCallback);
		this.itemBoxLayer = itemBoxLayer;

		itemBoxLayer.setItemCount(25);
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="outputItemBtn"){
				if (this.marketItems.length>0) {
					marketManager.outputItems();
				}else{
					quickLogManager.pushLog("交易账户没有物品可转出！",4);
				}
				return;
			}

			var caoCoin=Number(this.caoCoinTextField.getString());
			if (!caoCoin) {
				quickLogManager.pushLog("请输入炒币金额！",4);
				return;
			}
			this.caoCoinTextField.setString('');
			if (sender.getName()==="buyBtn") {
				marketManager.inputCaoCoin(caoCoin);
			}else if (sender.getName()==="sellBtn") {
				marketManager.outputCaoCoin(caoCoin);
			}
		}
	},

	updateLayerData: function() {
		var playerBank = marketManager.getPlayerBank();
		if (!playerBank) {
			return;
		}

		var curPlayer = app.getCurPlayer();
		this.myCaoCoinText.setString(curPlayer.caoCoin);
		this.caoCoinText.setString(playerBank.caoCoin);

		var marketItems=[];
		for (var key in playerBank.marketItems) {
			marketItems.push(playerBank.marketItems[key]);
		}
		this.marketItems=marketItems;

		this.itemBoxLayer.setItemCount(marketItems.length+5);
		var item, itemBox, imgPath, countName;
		var totalPrice=0;
		for (var i = 0; i < marketItems.length; i++) {
			item = marketItems[i];
			itemBox = this.itemBoxLayer.getItemBoxByPosition(i+1);
			if(!itemBox)
				continue;

			itemBox.setItemId(item.kindId);
			if (item.itemData) {
				imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
				itemBox.setIconSprite(imgPath);
				itemBox.adjustIconSprite();
			}
			countName=formula.bigNumber2Text(item.count);
			itemBox.setRightDownLabelString(countName);
		}
	}
});

//MarketPanel
cb.MarketPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/MarketPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		this.tradeText= ccsNode.getChildByName("tradeText");

		var tabBtnNode = ccsNode.getChildByName("tabBtnNode");

		var tabBtn = null;
		this._tabBtns = [];
		this.tabIndex = null;
		for (var i = 0; i <= 3; i++) {
			tabBtn = tabBtnNode.getChildByTag(i + 10000);
			tabBtn.addTouchEventListener(this.touchEvent, this);
			this._tabBtns[i] = tabBtn;
		}

		this._layers = [];
		var marketLayer = new cb.MarketLayer();
		this.addChild(marketLayer);
		marketLayer.setPosition(0, -36);
		this._layers[0] = marketLayer;
		this.marketLayer = marketLayer;

		marketManager.requestPlayerBank();
		// marketManager.requestMarketList();		
	},

	// cycleRequestMarketList:function(){
	// 	this.stopAllActions();
	// 	marketManager.requestMarketList();

	// 	var sequence = cc.Sequence.create(
	// 		cc.DelayTime.create(3),
	// 		cc.CallFunc.create(this.cycleRequestMarketList.bind(this))
	// 	);
	// 	this.runAction(sequence);
	// },

	setPanelData:function(data){
		if (data && cc.isNumber(data)) {
			this.selectTabBtn(data);
		}else{
			this.selectTabBtn(0);
		}

	},

	updateLayerData:function(){
		var layer = this._layers[this.tabIndex];
		if (layer) {
			layer.updateLayerData();
		}
		if (marketManager.costRate) {
			if (marketManager.isTradeing) {
				this.tradeText.setString("（开市）");
			} else {
				this.tradeText.setString("（休市）");
			}
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var index = sender.getTag() - 10000;
			this.selectTabBtn(index);
		}
	},

	selectTabBtn: function(index) {
		if (index === null) return;
		if (this.tabIndex === index)
			return;

		if (index === 3) {
			quickLogManager.pushLog("目前暂时不开放，敬请期待！");
			return;
		}

		if (this.tabIndex !== null)
			this.unselectTabBtn(this.tabIndex);

		this.tabIndex = index;
		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_ORANGEGOLD);
		tabBtn.setHighlighted(true);

		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(true);
		}
		if (!layer) {
			if (index === 0) {
				layer = new cb.MarketLayer();
			} else if(index===1){
				layer = new cb.MarketMyLayer();
			} else if (index === 2) {
				layer = new cb.MarketBankLayer();
			} 
			if (!layer) return;
			this.addChild(layer);
			layer.setPosition(0, -36);
			this._layers[index] = layer;
		}
		if(index===1)
			layer.lastCaoCoin=null;

		// if (index===0) {
		// 	this.cycleRequestMarketList();
		// }else{
		// 	this.stopAllActions();
		// }

		this.updateLayerData();
	},

	unselectTabBtn: function(index) {
		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_WHITE);
		tabBtn.setHighlighted(false);
		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(false);
		}
	}
});
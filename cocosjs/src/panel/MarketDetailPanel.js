cb.MarketDetailPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/MarketDetailPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var marketDetailNode = ccsNode.getChildByName("marketDetailNode");
		this.panelNameText= ccsNode.getChildByName("panelNameText");

		this.maxPriceText = marketDetailNode.getChildByName("maxPriceText");
		this.minPriceText = marketDetailNode.getChildByName("minPriceText");
		this.curPriceText = marketDetailNode.getChildByName("curPriceText");
		this.openText = marketDetailNode.getChildByName("openText");
		this.amountText = marketDetailNode.getChildByName("amountText");

		var openBtn = marketDetailNode.getChildByName("openBtn");
		openBtn.addTouchEventListener(this.touchEvent, this);

		var fiveTradeBtn = marketDetailNode.getChildByName("fiveTradeBtn");
		fiveTradeBtn.addTouchEventListener(this.touchEvent, this);

		var tenTradeBtn = marketDetailNode.getChildByName("tenTradeBtn");
		tenTradeBtn.addTouchEventListener(this.touchEvent, this);

		var fiveTradeNode=marketDetailNode.getChildByName("fiveTradeNode");
		var label,lineLabels;
		this.fiveTradelabels=[];
		var positionY=27;
		var delta=42;
		var labelNames=["卖5","卖4","卖3","卖2","卖1","买1","买2","买3","买4","买5"];
		for (var i = 0; i < 10; i++) {
			lineLabels=[];

			label = cc.Label.createWithSystemFont(labelNames[i], "Arial", 22);
    		fiveTradeNode.addChild(label);
    		label.setPosition(41,positionY+i*delta);
    		lineLabels[0]=label;

    		label = cc.Label.createWithSystemFont("-", "Arial", 22);
    		fiveTradeNode.addChild(label);
    		label.setPosition(120,positionY+i*delta);
    		lineLabels[1]=label;
    		label.setColor(cc.color(0, 255, 0));

    		label = cc.Label.createWithSystemFont("0", "Arial", 22);
    		fiveTradeNode.addChild(label);
    		label.setPosition(195,positionY+i*delta);
    		lineLabels[2]=label;
    		label.setColor(cc.color(30, 144, 255));

    		this.fiveTradelabels[i]=lineLabels;
		}

		var tenTradeNode=marketDetailNode.getChildByName("tenTradeNode");
		this.tenTradelabels=[];
		// var positionY=27;
		// var delta=42;
		for (var i = 0; i < 10; i++) {
			lineLabels=[];

			label = cc.Label.createWithSystemFont("-", "Arial", 22);
    		tenTradeNode.addChild(label);
    		label.setPosition(41,positionY+i*delta);
    		lineLabels[0]=label;

    		label = cc.Label.createWithSystemFont("-", "Arial", 22);
    		tenTradeNode.addChild(label);
    		label.setPosition(120,positionY+i*delta);
    		lineLabels[1]=label;
    		label.setColor(cc.color(0, 255, 0));

    		label = cc.Label.createWithSystemFont("-", "Arial", 22);
    		tenTradeNode.addChild(label);
    		label.setPosition(195,positionY+i*delta);
    		lineLabels[2]=label;
    		label.setColor(cc.color(30, 144, 255));

    		this.tenTradelabels[i]=lineLabels;
		}

		this.tenTradeNode=tenTradeNode;
		this.fiveTradeNode=fiveTradeNode;
		this.fiveTradeBtn=fiveTradeBtn;
		this.tenTradeBtn=tenTradeBtn;

		var graphLayer=cb.GraphLayer.create(540,360);
		graphLayer.enableEvent(true);
		graphLayer.setPosition(-390,-200);
		marketDetailNode.addChild(graphLayer);
		graphLayer.setPointCount(marketManager.timePointCount+1);

		var self=this;
		graphLayer.addEventListener(function(x){
			var detail=self.tradeDetailData[x];
			if (detail) {
				self.showTradeDetail(detail);
			}
		});

		this.graphLayer=graphLayer;
	},

	setBtnType:function(btnType){
		this.btnType=btnType;
		if (!this.btnType) {
			this.tenTradeNode.setVisible(false);
			this.fiveTradeNode.setVisible(true);
			this.fiveTradeBtn.setTitleColor(consts.COLOR_ORANGEGOLD);
			this.fiveTradeBtn.setHighlighted(true);
			this.tenTradeBtn.setTitleColor(consts.COLOR_WHITE);
			this.tenTradeBtn.setHighlighted(false);

			// this.requestFiveTrade();
			marketManager.requestFiveTrade(this.kindId);
		}else{
			this.tenTradeNode.setVisible(true);
			this.fiveTradeNode.setVisible(false);
			this.tenTradeBtn.setTitleColor(consts.COLOR_ORANGEGOLD);
			this.tenTradeBtn.setHighlighted(true);
			this.fiveTradeBtn.setTitleColor(consts.COLOR_WHITE);
			this.fiveTradeBtn.setHighlighted(false);

			// this.requestTenTrade();
			marketManager.requestTenTrade(this.kindId);
		}
		marketManager.requestTradeDetails(this.kindId);
	},

	setTenTrade:function(tenTradeData){
		var lineLabels,labels=this.tenTradelabels;
		var item;
		var items=tenTradeData || [];
		var tradeDate = new Date();
		var count;
		for (var i = 0; i < labels.length; i++) {
			lineLabels = labels[9-i];
			item = items[i];
			if (item) {
				tradeDate.setTime(item.time);
				lineLabels[0].setString(tradeDate.getHours()+":"+tradeDate.getMinutes());
				lineLabels[1].setString(item.price);
				count=item.count/100;
				count=formula.bigNumber2Text(count);
				lineLabels[2].setString(count);
				if (item.kind===2) {
					lineLabels[1].setColor(cc.color(255, 255,255));
				}else if (item.kind===1) {
					lineLabels[1].setColor(cc.color(0, 255,0));
				}else{
					lineLabels[1].setColor(cc.color(255,0,0));
				}
			} else {
				lineLabels[0].setString("-");
				lineLabels[1].setString("-");
				lineLabels[2].setString("-");

				lineLabels[1].setColor(cc.color(255, 255,255));
			}
		}
	},

	setFiveTrade:function(fiveTradeData,curPrice){
		var lineLabels,labels=this.fiveTradelabels;
		var item,count;
		var items=fiveTradeData[0] || [];
		for (var i = 5; i < labels.length; i++) {
			lineLabels = labels[i];
			item = items[i - 5];
			if (item) {
				lineLabels[1].setString(item.price);
				count=item.count/100;
				count=formula.bigNumber2Text(count);
				lineLabels[2].setString(count);

				if (item.price<curPrice) {
					lineLabels[1].setColor(cc.color(0, 255,0));
				}else if (item.price>curPrice) {
					lineLabels[1].setColor(cc.color(255, 0,0));
				}else{
					lineLabels[1].setColor(cc.color(255, 255,255));
				}
			} else {
				lineLabels[1].setString("-");
				lineLabels[2].setString("0");

				lineLabels[1].setColor(cc.color(255, 255,255));
			}
		}
		items = fiveTradeData[1] || [];
		for (var i = 4; i >= 0; i--) {
			lineLabels = labels[i];
			item = items[4-i];
			if (item) {
				lineLabels[1].setString(item.price);
				count=item.count/100;
				count=formula.bigNumber2Text(count);
				lineLabels[2].setString(count);
			} else {
				lineLabels[1].setString("-");
				lineLabels[2].setString("0");
			}
		}
	},
	// {"id":1,"timePoint":1260,"openPrice":10,"closePrice":10,"maxPrice":10,"minPrice":10,"amount":0}
	setTradeDetail:function(tradeDetailData){
		var detail;
		var graphLayer=this.graphLayer;
		graphLayer.clearData();
		this.tradeDetailData={};

		var recordTime = new Date();
		var minTimePoint = recordTime.getHours() * 60 + recordTime.getMinutes();
		var timePointDelta=marketManager.timePointDelta;
		minTimePoint = Math.floor(minTimePoint / timePointDelta) *timePointDelta;

		for (var i = 0; i < tradeDetailData.length; i++) {
			detail=tradeDetailData[i];
			this.graphLayer.addData(
								detail.timePoint,
								detail.openPrice,
								detail.closePrice,
								detail.minPrice,
								detail.maxPrice,
								detail.amount
								);

			this.tradeDetailData[detail.timePoint]=detail;
			if (detail.timePoint<minTimePoint) {
				minTimePoint=detail.timePoint;
			}
		}

		var maxTimePoint=minTimePoint+timePointDelta*marketManager.timePointCount;
		minTimePoint=Math.floor(minTimePoint/60)+":"+(minTimePoint%60);
		maxTimePoint=Math.floor(maxTimePoint/60)+":"+(maxTimePoint%60);

		this.graphLayer.setMinXString(minTimePoint);
     	this.graphLayer.setMaxXString(maxTimePoint);

		// cc.log("minTimePoint:"+minTimePoint+",maxTimePoint:"+maxTimePoint);
		if (detail) {
			this.curPriceText.setString(detail.closePrice);
			this.showTradeDetail(detail);
		}

		// cc.log("tradeDetailData count:"+tradeDetailData.length);
		graphLayer.refreshData();
	},

	showTradeDetail:function(tradeDetail){
		if (!tradeDetail) {
			return;
		}
		this.maxPriceText.setString(tradeDetail.maxPrice);
		this.minPriceText.setString(tradeDetail.minPrice);
		// 
		this.openText.setString(tradeDetail.openPrice);
		var count=tradeDetail.amount/100;
		count=formula.bigNumber2Text(count);
		this.amountText.setString(count);
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="openBtn") {
				layerManager.closePanel(this,1);
			}else if (sender.getName()==="fiveTradeBtn") {
				this.setBtnType(0);
			}else if (sender.getName()==="tenTradeBtn") {
				this.setBtnType(1);
			}
		}
	},

	setPanelData:function(marketData){
		cc.log("MarketDetailPanel setPanelData========>>");
		this.panelNameText.setString(marketData.itemData.name+"实时行情");

		// this.maxPriceText.setString(marketData.maxPrice);
		// this.minPriceText.setString(marketData.minPrice);
		// this.curPriceText.setString(marketData.curPrice);
		this.kindId=marketData.kindId;

		// this.requestFiveTrade();
		this.setBtnType(0);
	}

});
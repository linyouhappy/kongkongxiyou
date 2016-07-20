cb.PlotPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		// this.createCCSNode("uiccs/PlotPanel.csb");
		// this.__initView();
		// this.openBgTouch();
		var self = this;
		var onTouchBegan = function(touch, event) {
			self.hidePlot();
			return true;
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan
		}, this);

		mainPanel.setDisplayTask(false);
	},

	touchEvent: function(sender, type) {
		switch (type) {
			case ccui.Widget.TOUCH_ENDED:
				// if (this.callback) {
				// 	this.callback(sender.getTag());
				// }
				if (sender.getTag()===1) {

				}else if (sender.getTag()===2) {
					layerManager.openPanel(cb.kMTaskPanelId,this.npcTask);
				}

				if (this.isAutoClose) {
					this.hidePlot();
				}
				break;
		}
	},

	setPanelData:function(panelData){
		this.showPlot(panelData);
	},

	showPlot: function(panelData) {
		var plotMsg = panelData.plotMsg;
		var bustId = panelData.bustId;
		var isLeftOrRight = panelData.isLeftOrRight;
		var name = panelData.name + "：";
		// this.callback = panelData.callback;
		this.isAutoClose = panelData.isAutoClose;
		this.npcTask=panelData.npcTask;

		var ccsNode = ccs.CSLoader.createNode("uiccs/PlotPanel.csb");
		this.addChild(ccsNode);
		// ccsNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
		this._ccsNode = ccsNode;

		var downNode = ccsNode.getChildByName("downNode");
		var upImage = ccsNode.getChildByName("upImage");
		var downImage = downNode.getChildByName("downImage");

		var plotText = downNode.getChildByName("plotText");
		var nameText = downNode.getChildByName("nameText");

		plotText.setString(plotMsg);
		nameText.setString(name);
		plotText.setLocalZOrder(1);
		nameText.setLocalZOrder(1);
		formula.enableOutline(nameText);
		upImage.setContentSize(cc.size(cc.winSize.width, 150));
		downImage.setContentSize(cc.size(cc.winSize.width, 242));

		var plotTextPositionY = 150;

		plotText.setContentSize(cc.size(550, 80));
		var certainBtn = downNode.getChildByName("certainBtn");
		certainBtn.addTouchEventListener(this.touchEvent, this);
		certainBtn.setTag(1);

		var taskBtn = downNode.getChildByName("taskBtn");
		if (this.npcTask) {
			taskBtn.addTouchEventListener(this.touchEvent, this);
			taskBtn.setTag(2);
		}else{
			taskBtn.removeFromParent();
		}
		
		downNode.setPosition(0, -cc.winSize.height / 2 - 250);
		upImage.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + 250);

		var moveTo = cc.MoveTo.create(0.2, cc.p(0, -cc.winSize.height / 2 - 5))
		downNode.runAction(moveTo);

		var moveTo = cc.MoveTo.create(0.2, cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 5))
		upImage.runAction(moveTo);

		this.upImage = upImage;
		this.downNode = downNode;

		// var portraitName = "icon/bust/bust_" + bustId + ".png";
		var portraitName=formula.portraitName(bustId);
		var portraitSprite = new cc.Sprite(portraitName);
		downNode.addChild(portraitSprite);

		var positionY = 0;
		if (isLeftOrRight) {
			portraitSprite.setAnchorPoint(cc.p(0, 0));
			portraitSprite.setPosition(-cc.winSize.width / 2, positionY);
			plotText.setPosition(-cc.winSize.width / 2 + 330, plotTextPositionY);
			nameText.setPosition(-cc.winSize.width / 2 + 360, 190);
		} else {
			portraitSprite.setFlippedX(true);
			portraitSprite.setAnchorPoint(cc.p(1, 0));
			portraitSprite.setPosition(cc.winSize.width / 2, positionY);
			plotText.setPosition(-cc.winSize.width / 2 + 80, plotTextPositionY);
			nameText.setPosition(-cc.winSize.width / 2 + 130, 190);
		}
	},

	hidePlot: function() {
		var moveTo = cc.MoveTo.create(0.5, cc.p(0, -cc.winSize.height / 2 - 550));
		this.downNode.runAction(moveTo);

		var self = this;
		var onActionCallback = function(sender) {
			layerManager.clearPanel(self);
		};

		var moveTo = cc.MoveTo.create(0.5, cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 250));
		var sequence = cc.Sequence.create(
			moveTo,
			cc.CallFunc.create(onActionCallback)
		);
		this.upImage.runAction(sequence);

		mainPanel.setDisplayTask(true);
	}
});

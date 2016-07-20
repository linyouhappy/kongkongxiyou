cb.PlotTextPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
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
	},

	touchEvent: function(sender, type) {
		switch (type) {
			case ccui.Widget.TOUCH_ENDED:
				if (this.callback) {
					this.callback(this.kindType);
				}
				if (!this.noAutoClose) {
					this.hidePlot();
				}
				break;
		}
	},

	showPlot: function(plotMsg) {
		var plotMsg = plotMsg;
		var ccsNode = ccs.CSLoader.createNode("uiccs/PlotTextPanel.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		var downNode = ccsNode.getChildByName("downNode");
		var upImage = ccsNode.getChildByName("upImage");
		var downImage = downNode.getChildByName("downImage");

		var plotText = downNode.getChildByName("plotText");
		plotText.setContentSize(cc.size(865,150));
		plotText.setString(plotMsg);
		plotText.setLocalZOrder(1);

		upImage.setContentSize(cc.size(cc.winSize.width, 150));
		downImage.setContentSize(cc.size(cc.winSize.width, 242));

		var certainBtn = downNode.getChildByName("certainBtn");
		certainBtn.addTouchEventListener(this.touchEvent, this);

		downNode.setPosition(0, -cc.winSize.height / 2 - 250);
		upImage.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + 250);

		var moveTo = cc.MoveTo.create(0.2, cc.p(0, -cc.winSize.height / 2 - 5))
		downNode.runAction(moveTo);

		var moveTo = cc.MoveTo.create(0.2, cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 5))
		upImage.runAction(moveTo);

		this.upImage = upImage;
		this.downNode = downNode;
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
	}
});

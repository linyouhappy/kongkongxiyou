cb.PlotsPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/PlotPanel.csb");
		this.addChild(ccsNode);
		var width=cc.winSize.width;
		var height=cc.winSize.height;
		ccsNode.setPosition(width / 2, height / 2);
		this._ccsNode = ccsNode;

		var downNode = ccsNode.getChildByName("downNode");
		var upImage = ccsNode.getChildByName("upImage");
		var downImage = downNode.getChildByName("downImage");

		this.plotText = downNode.getChildByName("plotText");
		this.nameText = downNode.getChildByName("nameText");

		this.plotText.setLocalZOrder(1);
		this.plotText.setVisible(false);

		this.nameText.setLocalZOrder(1);
		this.nameText.setVisible(false);
		formula.enableOutline(this.nameText);

		upImage.setContentSize(cc.size(width, 150));
		downImage.setContentSize(cc.size(width, 242));

		downNode.setPosition(0, -height/ 2 - 250);
		upImage.setPosition(width/ 2, height/ 2 + 250);

		this.upImage = upImage;
		this.downNode = downNode;

		var certainBtn = downNode.getChildByName("certainBtn");
		certainBtn.addTouchEventListener(this.touchEvent, this);
		var taskBtn = downNode.getChildByName("taskBtn");
		taskBtn.removeFromParent();
		certainBtn.setVisible(false);
		this.certainBtn=certainBtn;
		certainBtn.setLocalZOrder(10);

		var self = this;
		var onTouchBegan = function(touch, event) {
			return true;
		};
		var onTouchEnded = function(touch, event) {
			// self.nextData();
			if (self.panelDatas.length===0) {
            	self.hidePlot(true);
            }else{
            	self.nextData();
            }
        };
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchEnded:onTouchEnded
		}, this);

		var menu = new cc.Menu();
        menu.setPosition(0, 0);
        this.addChild(menu);

        var label =cc.Label.createWithSystemFont("点这里快速跳过>>", "Arial",24);
        label.setColor(cc.color(225, 225, 225));
        label.setAnchorPoint(cc.p(1,1));

        var menuItem = new cc.MenuItemLabel(label, function(sender){
            // if (this.panelDatas.length===0) {
            	this.hidePlot(true);
            // }else{
            // 	this.nextData();
            // }
        }, this);
        menuItem.setPosition(cc.winSize.width-110,cc.winSize.height-23);
        menu.addChild(menuItem);
        menu.setLocalZOrder(10);

        mainPanel.setDisplayTask(false);
	},

	touchEvent: function(sender, type) {
		switch (type) {
			case ccui.Widget.TOUCH_ENDED:
				// if (this.callback) {
				// 	this.callback(true);
				// }
				this.hidePlot(true);
				break;
		}
	},

	showData:function(panelData) {
		this.nameText.setString(panelData.name);
		this.plotText.setString(panelData.plotMsg);

		if (!!this.portraitSprite) {
			this.portraitSprite.removeFromParent();
		}

		var portraitName=formula.portraitName(panelData.bustId);
		var portraitSprite = new cc.Sprite(portraitName);
		this.downNode.addChild(portraitSprite);
		this.portraitSprite=portraitSprite;

		var positionY = 0;
		var halfWinSize=cc.winSize.width / 2;
		var portraitWidth=portraitSprite.getContentSize().width;
		var endPoint;
		this.plotText.setContentSize(cc.size(cc.winSize.width-portraitWidth-50,100));
		if (panelData.isLeftOrRight) {
			portraitSprite.setAnchorPoint(cc.p(0, 0));
			portraitSprite.setPosition(-cc.winSize.width, positionY);

			endPoint=cc.p(-halfWinSize, positionY);

			this.plotText.setAnchorPoint(cc.p(0, 1));
			this.nameText.setAnchorPoint(cc.p(0, 1));

			this.nameText.setPosition(-halfWinSize + portraitWidth, 190);
			this.plotText.setPosition(-halfWinSize + portraitWidth, 140);
		} else {
			portraitSprite.setFlippedX(true);
			portraitSprite.setAnchorPoint(cc.p(1, 0));
			portraitSprite.setPosition(cc.winSize.width, positionY);
			endPoint=cc.p(halfWinSize, positionY);
			
			this.plotText.setAnchorPoint(cc.p(1, 1));
			this.nameText.setAnchorPoint(cc.p(1, 1));

			this.nameText.setPosition(halfWinSize-portraitWidth, 190);
			this.plotText.setPosition(halfWinSize-portraitWidth, 140);
		}
		this.plotText.setVisible(false);
		this.nameText.setVisible(false);

		var self=this;
		var onActionCallback = function(sender) {
			var sequence = cc.Sequence.create(
	            cc.DelayTime.create(0.2),
	            cc.Show.create(),
	            cc.FadeIn.create(0.3)
	        );
	        self.plotText.runAction(sequence);
	        self.nameText.setOpacity(255);
	        self.nameText.setVisible(true);
	        // self.nameText.runAction(sequence.clone());
        };

        var sequence = cc.Sequence.create(
            cc.MoveTo.create(0.2, endPoint),
            cc.CallFunc.create(onActionCallback)
        );	
		portraitSprite.runAction(sequence);

		var onActionCallback1 = function(sender) {
			self.nextData();
        };
		sequence = cc.Sequence.create(
            cc.DelayTime.create(5),
            cc.CallFunc.create(onActionCallback1)
        );
        this.runAction(sequence);
	},

	nextData:function() {
		this.stopAllActions();
		if (this.panelDatas.length===0) {
			this.showDatas();
			return;
		}
		if(this.portraitSprite){
			this.portraitSprite.runAction(cc.FadeOut.create(0.3));
            this.plotText.runAction(cc.FadeOut.create(0.3));
            this.nameText.runAction(cc.FadeOut.create(0.3));
		}

		var self=this;
		var onActionCallback1 = function(sender) {
			self.showDatas();
        };
		sequence = cc.Sequence.create(
            cc.DelayTime.create(0.3),
            cc.CallFunc.create(onActionCallback1)
        );
        this.runAction(sequence);
	},

	showDatas:function() {
		if (this.panelDatas.length===0) {
			this.certainBtn.setVisible(true);

			var self=this;
			var onActionCallback1 = function(sender) {
				self.certainBtn.setTitleText("确定("+self.index+")");
				self.certainBtn.setTitleColor(cc.color(255,0,0,255));
				self.index--
	        };

			var sequence = cc.Sequence.create(
	            cc.DelayTime.create(1),
	            cc.CallFunc.create(onActionCallback1)
	        );

			var onActionCallback = function(sender) {
				self.hidePlot(true);
	        };

			sequence = cc.Sequence.create(
	            cc.Repeat.create(sequence,5),
	            cc.CallFunc.create(onActionCallback)
	        );
	        this.stopAllActions();
	        this.runAction(sequence);
			return;
		}
		var panelData = this.panelDatas.shift();
		this.showData(panelData);
	},

	showPlot: function(panelDatas,callback) {
		this.callback =callback;
		this.panelDatas=panelDatas;
		this.index=5;
		// this.noAutoClose = panelData.noAutoClose;
		var self=this;
		var onActionCallback = function(sender) {
			self.showDatas();
        };
        // var moveTo = cc.MoveTo.create(0.2, cc.p(0, -cc.winSize.height / 2 - 5));
        var sequence = cc.Sequence.create(
            cc.MoveTo.create(0.2, cc.p(0, -cc.winSize.height / 2 - 5)),
            cc.CallFunc.create(onActionCallback)
        );	
		this.downNode.runAction(sequence);

		var moveTo = cc.MoveTo.create(0.2, cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 5));
		this.upImage.runAction(moveTo);
	},

	hidePlot: function(isCertian) {
		if (this.isRunClose) {
			return;
		}
		if (this.callback) {
			this.callback(isCertian);
		}

		this.isRunClose=true;
		this.stopAllActions();
		var moveTo = cc.MoveTo.create(0.5, cc.p(0, -cc.winSize.height / 2 - 550));
		this.downNode.runAction(moveTo);

		var self = this;
		var onActionCallback = function(sender) {
			// layerManager.closePanel(self);
			self.removeFromParent();
		};
		var sequence = cc.Sequence.create(
			cc.MoveTo.create(0.5, cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 250)),
			cc.CallFunc.create(onActionCallback)
		);
		this.upImage.runAction(sequence);

		mainPanel.setDisplayTask(true);
	}
});

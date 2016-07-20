var tipsBoxLayer = {
	showTipsBox: function(msg) {
		
		var runningScene = cc.director.getRunningScene();
		if (!runningScene) {
			return;
		}
		var nodeContainer = runningScene.getChildByTag(74138);
		if (!!nodeContainer)
			runningScene.removeChildByTag(74138, true);

		circleLoadLayer.hideCircleLoad();

		this.callback=null;
		var ccsNode = ccs.CSLoader.createNode("uiccs/TipsBoxLayer.csb");
		runningScene.addChild(ccsNode);
		this.ccsNode = ccsNode;

		ccsNode.setLocalZOrder(1000);
		ccsNode.setTag(74138);
		ccsNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);

		var msgText = ccsNode.getChildByName("msgText");
		msgText.setString(msg);
		msgText.setTextAreaSize(cc.size(320,150));

		// var closeTipsBox = function() {
		// 	cc.log("=====================>>12");
		// 	var runningScene = cc.director.getRunningScene();
		// 	if (!runningScene) {
		// 		return;
		// 	}
		// 	runningScene.removeChildByTag(74138);
		// 	cc.log("=====================>>12");
		// };

		var self=this;
		var touchEvent = function(sender, type) {
			
			if (type === ccui.Widget.TOUCH_ENDED) {
				if (tipsBoxLayer.callback) {
					tipsBoxLayer.callback(true);
				}
				self.closeTipsBox();
			}
		};

		var yesBtn = ccsNode.getChildByName("yesBtn");
		yesBtn.addTouchEventListener(touchEvent, ccsNode);
		this.yesBtn=yesBtn;

		var onTouchBegan = function(touch, event) {
			return true;
		};
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan
		}, ccsNode);
	},

	closeTipsBox: function() {
		var runningScene = cc.director.getRunningScene();
		if (!runningScene) {
			return;
		}
		var child=runningScene.getChildByTag(74138);
		if (child) {
			runningScene.removeChild(this.ccsNode);
		}
		// removeAllChildren()
		// runningScene.removeChildByTag(74138);
	},

	enableDoubleBtn: function(callback) {
		this.callback = callback;
		var self=this;
		var touchEvent = function(sender, type) {
			if (type === ccui.Widget.TOUCH_ENDED) {
				if (tipsBoxLayer.callback) {
					tipsBoxLayer.callback(false);
				}
				self.closeTipsBox();
			}
		};
		var noBtn = this.ccsNode.getChildByName("noBtn");
		noBtn.addTouchEventListener(touchEvent, this.ccsNode);
		noBtn.setVisible(true);
		noBtn.setPosition(-85, -48);
		this.yesBtn.setPosition(85, -48);
	},

	showErrorCode: function(errorCode) {
		var result = dataApi.error_code.findById(errorCode);
		if (!result) {
			if (errorCode===201) {
				return;
			}
			result = dataApi.error_code.findById(404);
		}
		var msg = result.msg+"(代号:" + errorCode + ")";
		tipsBoxLayer.showTipsBox(msg);
		cc.log("ERROR:TipsBox:" + msg);
	}
};


var reviveLayer = {
	showTipsBox: function(msg) {
		this.callback=null;
		var runningScene = cc.director.getRunningScene();
		var nodeContainer = runningScene.getChildByTag(74138);
		if (nodeContainer){
			runningScene.removeChildByTag(74138, true);
		}

		var ccsNode = ccs.CSLoader.createNode("uiccs/ReviveLayer.csb");
		runningScene.addChild(ccsNode);
		this.ccsNode = ccsNode;

		ccsNode.setLocalZOrder(90);
		ccsNode.setTag(74138);
		ccsNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);

		var msgText = ccsNode.getChildByName("msgText");
		msgText.setString(msg);
		msgText.setTextAreaSize(cc.size(320,150));
		this.timerText=ccsNode.getChildByName("timerText");

		var closeTipsBox = function() {
			runningScene.removeChildByTag(74138);
		};

		var reviveBtn = ccsNode.getChildByName("reviveBtn");
		var comeBackBtn=ccsNode.getChildByName("comeBackBtn");
		var touchEvent = function(sender, type) {
			if (type === ccui.Widget.TOUCH_ENDED) {
				if (reviveLayer.callback) {
					if (sender.getName()==="reviveBtn") {
						reviveLayer.callback(1);
					}else{
						reviveLayer.callback(0);
					}
				}
				closeTipsBox();
			}
		};
		reviveBtn.addTouchEventListener(touchEvent, ccsNode);
		comeBackBtn.addTouchEventListener(touchEvent, ccsNode);
		// this.reviveBtn=reviveBtn;

		// var onTouchBegan = function(touch, event) {
		// 	return true;
		// };
		// cc.eventManager.addListener({
		// 	event: cc.EventListener.TOUCH_ONE_BY_ONE,
		// 	swallowTouches: true,
		// 	onTouchBegan: onTouchBegan
		// }, ccsNode);

		this.runTimer();
	},

	runTimer:function(){
		var interval=30;
		var timerText=this.timerText;
		var onActionCallback = function() {
			timerText.setString("返回倒计时"+interval+"秒");
			interval--;
        };
		var action=cc.Sequence.create(
			cc.DelayTime.create(1),
			cc.CallFunc.create(onActionCallback)
		)
		action=cc.Repeat.create(action,interval);
		timerText.runAction(action);
	},

	closeTipsBox:function(){
		var runningScene = cc.director.getRunningScene();
		runningScene.removeChildByTag(74138);
	}

	// enableDoubleBtn: function(callback) {
	// 	this.callback = callback;

	// 	var noBtn = this.ccsNode.getChildByName("noBtn");
	// 	var closeTipsBox = function() {
	// 		var runningScene = cc.director.getRunningScene();
	// 		runningScene.removeChildByTag(74138);
	// 	};
	// 	var touchEvent = function(sender, type) {
	// 		if (type === ccui.Widget.TOUCH_ENDED) {
	// 			if (reviveLayer.callback) {
	// 				reviveLayer.callback(false);
	// 			}
	// 			closeTipsBox();
	// 		}
	// 	};
	// 	noBtn.addTouchEventListener(touchEvent, this.ccsNode);
	// 	noBtn.setVisible(true);
	// 	noBtn.setPosition(-85, -48);

	// 	// var yesBtn = this.ccsNode.getChildByName("yesBtn");
	// 	this.yesBtn.setPosition(85, -48);
	// }

};


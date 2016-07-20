var inputBoxLayer = {
	textFieldCallback: function(sender, type) {
		if(cc.sys.os!==cc.sys.OS_IOS) return;

		switch(type){
			case ccui.TextField.EVENT_ATTACH_WITH_IME:
				inputBoxLayer.showInputBox(sender.getString());
			break;
			case ccui.TextField.EVENT_DETACH_WITH_IME:
				inputBoxLayer.hideInputBox();
			break;
			case ccui.TextField.EVENT_INSERT_TEXT:
				inputBoxLayer.inputBox(sender.getString());
			break;
			case ccui.TextField.EVENT_DELETE_BACKWARD:
				inputBoxLayer.inputBox(sender.getString());
			break;
		}
	},

	showInputBox: function(text) {
		var runningScene = cc.director.getRunningScene();
		var nodeContainer = runningScene.getChildByTag(748138);
		if (nodeContainer){
			runningScene.removeChildByTag(748138, true);
		}

		var nodeContainer=cc.Node.create();
		runningScene.addChild(nodeContainer);

		nodeContainer.setLocalZOrder(99999);
		nodeContainer.setTag(748138);
		nodeContainer.setPosition(cc.winSize.width / 2, cc.winSize.height / 2+100);

		var bgSprite=cc.Scale9Sprite.createWithSpriteFrameName("color_black.png");
		bgSprite.setContentSize(cc.size(cc.winSize.width,cc.winSize.height+200));
		nodeContainer.addChild(bgSprite);
		bgSprite.setOpacity(150);

		var frameSprite = cc.Scale9Sprite.createWithSpriteFrameName("bg_input_box.png");
		frameSprite.setContentSize(cc.size(700, 50));
		nodeContainer.addChild(frameSprite);

		var nameLabel = cc.Label.createWithSystemFont(text, "Arial", 24);
    	nodeContainer.addChild(nameLabel);
    	nameLabel.setTag(748138);
	},

	inputBox:function(text){
		var runningScene = cc.director.getRunningScene();
		var nodeContainer = runningScene.getChildByTag(748138);
		if (!nodeContainer){
			inputBoxLayer.showInputBox(text);
			return;
		}
		var nameLabel= nodeContainer.getChildByTag(748138);
		nameLabel.setString(text);
	},

	hideInputBox: function() {
		var runningScene = cc.director.getRunningScene();
		var nodeContainer = runningScene.getChildByTag(748138);
		if (nodeContainer){
			runningScene.removeChildByTag(748138, true);
		}
	}
};


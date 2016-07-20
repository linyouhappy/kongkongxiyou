cb.PlayerPanel = cb.BasePanel.extend({

	ctor: function() {
		this._super();
		this.m_width = 300;
		this.m_height = 440;

		this.__initView();
	},

	__initView: function() {
		this.createCCSNode("uiccs/PlayerLayer.csb");

		var ccsNode = this._ccsNode;
		this.userNameText = ccsNode.getChildByName("nameText");
		this.lvText = ccsNode.getChildByName("lvText");
		this.portraitSprite = ccsNode.getChildByName("portraitSprite");

		var menu = new cc.Menu();
		menu.setPosition(0, 95);
		ccsNode.addChild(menu);
		this.menu = menu;

		var onTouchBegan = function(touch, event) {
			return true;
		};

		var self = this;
		var onTouchEnded = function(touch, event) {
			var location = self.convertTouchToNodeSpace(touch);
			// cc.log("location  x=" + location.x + " y=" + location.y);
			if (!(location.x > -self.m_width / 2 && location.x < self.m_width / 2 && location.y > -self.m_height / 2 && location.y < self.m_height / 2)) {
				layerManager.closePanel(self);
			}
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchEnded: onTouchEnded
		}, this);
	},

	onMenuCallback: function(sender) {
		if (!this.character) return;

		var playerId=this.character.id
		switch (sender.getTag()) {
			//查看信息
			case 0:
				cc.log("查看信息============>>");
				layerManager.pushLayer(cb.kMRolePanelId,playerId);
				break;
				//发起私聊
			case 1:
				cc.log("发起私聊============>>");
				var chatData = {
					dataType:1,
					chatId: playerId,
					chatName: this.character.name
				};
				layerManager.openPanel(cb.kMChatPanelId,chatData);
				this.closePanel();
				break;

				//邀请切磋
			case 2:
				cc.log("邀请切磋============>>");
				break;

				//加盟集团
			case 3:
				cc.log("加盟集团============>>");
				this.closePanel();
				guildManager.requestJoinGuild(playerId,this.character.guildId);
				// guildHandler.inviteGuild(playerId);
				break;

			case 4:
				// cc.log("申请组队============>>");
				this.closePanel();
				var curPlayer = app.getCurPlayer();
				if (this.character.teamId === TeamConsts.TEAM_ID_NONE) {
					if (curPlayer.teamId === TeamConsts.TEAM_ID_NONE) {
						quickLogManager.pushLog("邀请失败，您还没有创建队伍!");
						return;
					}
					if (!curPlayer.isCaptain) {
						quickLogManager.pushLog("邀请失败，您不是队长!");
						return;
					}
					teamHandler.inviteJoinTeam(playerId);
				} else {
					if (curPlayer.teamId !== TeamConsts.TEAM_ID_NONE) {
						quickLogManager.pushLog("邀请失败，对方已经有队伍!");
						return;
					}
					teamHandler.applyJoinTeam(playerId);
				}
				break;
		}
		
	},

	setPanelData:function(character){
		this.setCharacter(character);
	},

	setCharacter: function(character) {
		if (!character) return;

		this.character = character;

		this.lvText.setString("Lv" + character.level);
		this.userNameText.setString(character.name);

		var headIconFile = "icon/head/head_" + character.entityData.headId + ".png";
		if (!jsb.fileUtils.isFileExist(headIconFile)) {
			headIconFile = "icon/head/head_" + 10000 + ".png";
		}
		this.portraitSprite.setTexture(headIconFile);

		var contentSize = this.portraitSprite.getContentSize();
		this.portraitSprite.setScaleX(72 / contentSize.width);
		this.portraitSprite.setScaleY(72 / contentSize.height);

		var imageBg1 = this._ccsNode.getChildByName("imageBg1");
		var imageBg2 = this._ccsNode.getChildByName("imageBg2");
		var bgContentSize = imageBg1.getContentSize();

		var labelName, btnLabel, menuItemSprite, normalSprite, selectedSprite, contentSize;
		var yPosition = -25;
		var count = 0;

		var curPlayer = app.getCurPlayer();

		var labelNames = ["查看信息", "发起私聊", "邀请切磋", "加盟集团", "邀请组队"];
		for (var i = 0; i < 5; i++) {
			if (i === 4) {
				if (character.teamId === TeamConsts.TEAM_ID_NONE) {
					labelName = labelNames[i];
				} else {
					if (curPlayer.teamId !== TeamConsts.TEAM_ID_NONE && curPlayer.isCaptain) {
						labelName = labelNames[i];
					} else {
						labelName = "申请组队";
					}
				}
			} else {
				labelName = labelNames[i];
			}

			btnLabel = cc.Label.createWithSystemFont(labelName, "Arial", 24);

			normalSprite = new cc.Sprite("#btn_red_long_glass.png");
			selectedSprite = new cc.Sprite("#btn_gray_long_glass.png");

			menuItemSprite = new cc.MenuItemSprite(normalSprite, selectedSprite, normalSprite, this.onMenuCallback, this);
			menuItemSprite.setTag(i);
			this.menu.addChild(menuItemSprite)

			menuItemSprite.setPosition(0, yPosition - 60 * i);
			menuItemSprite.addChild(btnLabel);
			contentSize = normalSprite.getContentSize();
			btnLabel.setPosition(contentSize.width / 2, contentSize.height / 2);

			count++;
		}

		bgContentSize.height = 145 + count * 60;
		imageBg1.setContentSize(bgContentSize);
		imageBg2.setContentSize(bgContentSize);

		this.m_width = bgContentSize.width;
		this.m_height = bgContentSize.height;
	}
});
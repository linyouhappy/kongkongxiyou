
//FightManager
cb.FightManager = cc.Class.extend({
	ctor: function() {
		this.fightAfficheIndex = 0;
		this.fightAffiches = [];
		this.fightCount = 0;
	},

	addFightAffiches: function(fightAffiches) {
		if (fightAffiches.length > 0) {
			var record;
			var nativeAffiches = this.fightAffiches;
			for (var i = 0; i < fightAffiches.length; i++) {
				record = fightAffiches[i];
				if (record.id > this.fightAfficheIndex) {
					nativeAffiches.push(record);
				}
			}
			if (record) {
				this.fightAfficheIndex = record.id;
			}
			while (nativeAffiches.length > 7) {
				nativeAffiches.shift();
			}
		}
		if (layerManager.isRunPanel(cb.kMFightPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData(2);
		}
	},

	setFightCount: function(fightCount) {
		this.fightCount = fightCount;
		if (layerManager.isRunPanel(cb.kMFightPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData(1);
		}
	},

	enterFight: function() {
		fightHandler.enterFight(this.fightAfficheIndex, this.fightCount);
	},

	exitFight: function() {
		fightHandler.exitFight();
	},

	readyFight: function(fightLevel) {
		fightHandler.readyFight(fightLevel);
		this.fightLevel=fightLevel;
	},

	changeFight:function(fightLevel) {
		if (this.changeFightTime) {
			if (this.changeFightTime>Date.now()) {
				// quickLogManager.pushLog("等待其他玩家加入！");
				return;
			}
		}
		this.changeFightTime=Date.now()+2000;
		fightHandler.changeFight(fightLevel);
		this.fightLevel=fightLevel;
	},

	cancelFight: function() {
		fightHandler.cancelFight();
	},

	prepareFight:function(){
		if (this.prepareFightTime) {
			if (this.prepareFightTime>Date.now()) {
				return;
			}
		}
		this.prepareFightTime=Date.now()+2000;
		fightHandler.prepareFight();
	}

});

var fightManager = new cb.FightManager();

//FightSelectLayer
cb.FightSelectLayer = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName = "uiccs/FightSelectLayer.csb";
		this.setInitData();
		this.enableBg();
		this.openBgTouch();
		this.initView();
	},

	closeLayer: function() {
		fightManager.cancelFight();
		this.closePanel();
	},

	initView: function() {
		var ccsNode = this.ccsNode;
		this.vsSprite = ccsNode.getChildByName("vsSprite");
		this.loadingText = ccsNode.getChildByName("loadingText");
		this.fightSprite=ccsNode.getChildByName("fightSprite");
		effectManager.useShaderEffect(this.fightSprite, "ShaderGreyScale");
		this.fightSprite.setVisible(false);
		this.loadingText.setPosition(130,18);

		var refreshBtn = ccsNode.getChildByName("refreshBtn");
		refreshBtn.addTouchEventListener(this.touchEvent, this);
		refreshBtn.setPressedActionEnabled(true);
		// refreshBtn.setVisible(false);
		this.refreshBtn=refreshBtn;

		var fightBtn = ccsNode.getChildByName("fightBtn");
		fightBtn.addTouchEventListener(this.touchEvent, this);
		fightBtn.setPressedActionEnabled(true);
		this.fightBtn=fightBtn;

		var character = app.getCurPlayer();
		this.setRoleData(character, 10001);

		this.vsSprite.setVisible(false);
	},

	setPrepareFight:function(playerId){
		if (app.getCurPlayer().id===playerId) {
			this.fightSprite.setVisible(true);
			this.fightBtn.setVisible(false);
			this.refreshBtn.setVisible(false);
		}else{
			this.vsSprite.setVisible(true);
		}
		if (this.fightSprite.isVisible() && this.vsSprite.isVisible()){
			this.loadingText.setString("进入战斗中。。。");
			this.loadingText.setVisible(true);
			this.loadingText.setPosition(-70,18);
		}
	},

	setRoleData: function(roleData, nodeId) {
		var ccsNode = this.ccsNode;
		var roleNode = ccsNode.getChildByTag(nodeId);
		if (!roleNode || !roleData) {
			return;
		}
		roleNode.setVisible(true);

		var nameText = roleNode.getChildByName("nameText");
		var levelText = roleNode.getChildByName("levelText");
		var rolePortrait = roleNode.getChildByName("rolePortrait");

		nameText.setString(roleData.name);
		levelText.setString("Lv." + roleData.level);
		var position = nameText.getPosition();
		var contentSize = nameText.getContentSize();
		levelText.setPosition(position.x + contentSize.width / 2 + 10, position.y);

		var portraitName = formula.portraitName(roleData.kindId);
		rolePortrait.setTexture(portraitName);
	},

	setPanelData: function(fightlevel) {
		// cc.log("fightlevel=" + JSON.stringify(fightlevel));
		this.fightlevel = fightlevel;

		this.showRequest();
		var fightLevel = this.fightlevel.id;
		fightManager.readyFight(fightLevel);
	},

	updatePanelData: function(roleData) {
		this.requesting=false;

		this.roleData = roleData;
		this.loadingText.setVisible(false);
		this.loadingText.stopAllActions();
		if (roleData.kindId) {
			this.refreshBtn.setPosition(332,182);
			this.setRoleData(roleData, 10002);
			if (roleData.prepare) {
				this.vsSprite.setVisible(true);
			}
		} else {
			if (this.roleData.playerId === roleData.playerId) {
				var roleNode = this.ccsNode.getChildByTag(10002);
				roleNode.setVisible(false);

				this.refreshBtn.setPosition(190,0);
				this.refreshBtn.setVisible(true);

				quickLogManager.pushLog("您实力太强大，已吓退对手！");

				this.fightSprite.setVisible(true);
				this.fightBtn.setVisible(false);
				this.vsSprite.setVisible(false);
			}
		}
	},

	showRequest: function() {
		this.requesting=true;

		var roleNode = this.ccsNode.getChildByTag(10002);
		roleNode.setVisible(false);

		var loadingText = this.loadingText;
		loadingText.setVisible(true);
		loadingText.stopAllActions();
		this.refreshBtn.setPosition(332,182);
		this.vsSprite.setVisible(false);

		var index = 0;
		var self = this;
		var onActionCallback = function() {
			if (index === 0) {
				loadingText.setString("匹配中");
				index++;
			} else if (index === 1) {
				loadingText.setString("匹配中。");
				index++;
			} else if (index === 2) {
				loadingText.setString("匹配中。。");
				index++;
			} else {
				loadingText.setString("匹配中。。。");
				index = 0;
			}
			loadingText.runAction(
				cc.Sequence.create(
					cc.DelayTime.create(0.2),
					cc.CallFunc.create(onActionCallback)
				)
			);
		};
		onActionCallback();
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName() === "refreshBtn") {
				if (this.requesting) {
					quickLogManager.pushLog("等待其他玩家加入");
				} else {
					this.showRequest();
					var fightLevel = this.fightlevel.id;
					if (this.fightBtn.isVisible()) {
						fightManager.changeFight(fightLevel,0);
					}else{
						fightManager.changeFight(fightLevel,1);
					}
				}
			} else if (sender.getName() === "fightBtn") {
				fightManager.prepareFight();
			}
		}
	}
});

//FightPanel
cb.FightPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/FightPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	closePanel: function() {
		fightManager.exitFight();
		layerManager.closePanel(this);
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var fightNode = ccsNode.getChildByName("fightNode");
		this.countText = fightNode.getChildByName("countText");

		var buyBtn = fightNode.getChildByName("buyBtn");
		var fightBtn = fightNode.getChildByName("fightBtn");
		buyBtn.addTouchEventListener(this.touchEvent, this);
		fightBtn.addTouchEventListener(this.touchEvent, this);

		this.fightlevelDatas = {};
		var levelNode, fightlevelData, selectImage, costText, rewardText, button;
		for (var i = 1; i <= 4; i++) {
			levelNode = fightNode.getChildByTag(i + 10000);
			fightlevelData = {
				level: i
			};
			fightlevelData.levelNode = levelNode;
			fightlevel = dataApi.fightlevel.findById(i);
			fightlevelData.fightlevel = fightlevel;
			selectImage = levelNode.getChildByName("selectImage");
			selectImage.setVisible(false);
			fightlevelData.selectImage = selectImage;

			costText = levelNode.getChildByName("costText");
			rewardText = levelNode.getChildByName("rewardText");
			costText.setString(fightlevel.cost + "炒币");
			rewardText.setString(fightlevel.reward + "炒币");

			button = levelNode.getChildByName("button");
			button.setTag(i);
			button.addTouchEventListener(this.touchEvent, this);

			this.fightlevelDatas[i] = fightlevelData;
		}

		var scrollView = fightNode.getChildByName("scrollView");
		var richTextBox = cb.CCRichText.create(500, 0);
		richTextBox.setLineSpace(4);
		richTextBox.setDetailStyle("Arial", 20, consts.COLOR_WHITE);
		richTextBox.setPosition(5, -20);
		scrollView.addChild(richTextBox);
		this.richTextBox = richTextBox;

		// var nameLabel = cc.Label.createWithSystemFont("+", "Arial", 32);
		// scrollView.addChild(nameLabel);
	},

	selectLevel: function(level) {
		var curFightLevelData = this.curFightLevelData;
		if (curFightLevelData) {
			if (curFightLevelData.level === level) {
				return;
			} else {
				curFightLevelData.selectImage.setVisible(false);
			}
		}
		curFightLevelData = this.fightlevelDatas[level];
		if (curFightLevelData) {
			curFightLevelData.selectImage.setVisible(true);
			this.curFightLevelData = curFightLevelData;
		}
	},

	setPanelData: function(data) {
		this.selectLevel(1);
		this.updatePanelData();
		fightManager.enterFight();
	},

	updatePanelData: function(data) {
		if (data === 1) {
			this.setFightCount();
		} else if (data === 2) {
			this.setFightAffiches();
		} else {
			this.setFightCount();
			this.setFightAffiches();
		}
	},

	setFightCount: function() {
		var fightCount = fightManager.fightCount || 0
		this.countText.setString(fightCount);
	},

	setFightAffiches: function() {
		var fightAffiches = fightManager.fightAffiches;
		if (!fightAffiches) {
			return;
		}
		var richTextBox = this.richTextBox;
		richTextBox.clearAll();
		if (fightAffiches.length === 0) {
			return;
		}

		var fightAffiche, tmpText, fightlevel;
		var date = new Date();
		var nodeId = 1;
		for (var i = 0; i < fightAffiches.length; i++) {
			fightAffiche = fightAffiches[i];

			date.setTime(fightAffiche.time);
			tmpText = date.getHours() + ":" + date.getMinutes() + " ";

			richTextBox.setTextColor(chat.colorTbl.cyan);
			richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.setTextColor(chat.colorTbl.brown);
			richTextBox.appendRichText(fightAffiche.winner, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.setTextColor(chat.colorTbl.white);
			if (fightAffiche.level===1) {
				tmpText = "战胜";
			}else if (fightAffiche.level===2) {
				tmpText = "打败";
			}else if (fightAffiche.level===3) {
				tmpText = "击败";
			}else{
				tmpText = "秒杀";
			}
			richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.setTextColor(chat.colorTbl.brown);
			richTextBox.appendRichText(fightAffiche.loser, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.setTextColor(chat.colorTbl.white);
			tmpText = "，赢得";
			richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.setTextColor(chat.colorTbl.yellow);
			fightlevel = dataApi.fightlevel.findById(fightAffiche.level);
			if (fightlevel) {
				tmpText = formula.bigNumber2Text(fightlevel.reward);
				richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);
			}

			richTextBox.setTextColor(chat.colorTbl.white);
			tmpText = "大奖";
			richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.appendRichText("\n", chat.kTextStyleNormal, nodeId++, 0);

		}
		richTextBox.layoutChildren();
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var btyName = sender.getName();
			if (btyName === "button") {
				this.selectLevel(sender.getTag());
			} else if (btyName === "buyBtn") {

			} else if (btyName === "fightBtn") {
				if (fightManager.fightCount === 0) {
					quickLogManager.pushLog("挑战次数已用完。");
					return;
				}
				var fightlevel = this.curFightLevelData.fightlevel;
				layerManager.pushLayer(cb.kMFightSelectPanelId, fightlevel);
			}
		}
	}
});
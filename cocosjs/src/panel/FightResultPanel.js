
//FightWinLayer
cb.FightWinLayer = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();

		this.csbFileName = "uiccs/FightWinLayer.csb";
		this.setInitData();
		// this.enableBg();
		this.openBgTouch();
		this.initView();
	},

	closeLayer: function() {
		cc.log("closeLayer=======>>");
		// this.closePanel();
	},

	initView: function() {
		var ccsNode = this.ccsNode;
		this.prizeLabel = ccsNode.getChildByName("prizeLabel");
		this.reasonText = ccsNode.getChildByName("reasonText");
		this.labelNameText = ccsNode.getChildByName("labelNameText");
		var certainBtn = ccsNode.getChildByName("certainBtn");
		certainBtn.addTouchEventListener(this.touchEvent, this);
		certainBtn.setPressedActionEnabled(true);
	},

	setPanelData: function(loser) {
		if(!fightManager) return;

		var fightLevel=fightManager.fightLevel || 1;
		fightLevelData = dataApi.fightlevel.findById(fightLevel);
		this.prizeLabel.setString(fightLevelData.reward);
		var contentSize=this.prizeLabel.getContentSize();
		var position=this.prizeLabel.getPosition();
		this.labelNameText.setPositionX(position.x-contentSize.width/2-10);
		if (loser) {
			this.reasonText.setString("你击败了["+loser.name+"]，赢得奖金!");
		}else{
			this.reasonText.setString("你获得胜利，赢得奖金!");
		}
		// var fightLevel=3;
		var particleFile;
		if (fightLevel===2) {
			particleFile='particle/bigwin_blowout_0.plist';
		}else if (fightLevel===3) {
			particleFile='particle/bigwin_blowout_1.plist';
		}else if (fightLevel===4){
			particleFile='particle/bigwin_blowout_2.plist';
		}
		if (particleFile) {
			var emitter = new cc.ParticleSystem(particleFile);
			emitter.setPosition(0, 0);
			this.addChild(emitter);
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			fightHandler.fightPrize();
			this.closePanel();
		}
	}
});

//FightFailLayer
cb.FightFailLayer = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName = "uiccs/FightFailLayer.csb";
		this.setInitData();
		// this.enableBg();
		this.openBgTouch();
		this.initView();
	},

	closeLayer: function() {
		cc.log("closeLayer=======>>");
		// this.closePanel();
	},

	initView: function() {
		var ccsNode = this.ccsNode;

		this.reasonText = ccsNode.getChildByName("reasonText");
		var certainBtn=ccsNode.getChildByName("certainBtn");

		certainBtn.addTouchEventListener(this.touchEvent, this);
		certainBtn.setPressedActionEnabled(true);
	},

	setPanelData: function(winner) {
		if (winner) {
			this.reasonText.setString("你被["+winner.name+"]击败，无缘奖金!");
		}else{
			this.reasonText.setString("很抱歉，你战败，没有奖金!");
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			npcHandler.changeArea(2001);
			this.closePanel();
		}
	}
});



cb.HpMpLayer = cc.Class.extend({
	ctor: function() {
		var hpMpNode=ccs.CSLoader.createNode("uiccs/HpMpLayer.csb");
		hpMpNode.setPosition(layerPositions.hpMpPositionS);
		this.hpCountText = hpMpNode.getChildByName("hpCountText");
		this.hpSpeedText = hpMpNode.getChildByName("hpSpeedText");

		this.mpCountText = hpMpNode.getChildByName("mpCountText");
		this.mpSpeedText = hpMpNode.getChildByName("mpSpeedText");

		this.hpDecreaseText=hpMpNode.getChildByName("hpDecreaseText");
		this.mpDecreaseText=hpMpNode.getChildByName("mpDecreaseText");
		this.hpDecreaseText.setVisible(false);
		this.mpDecreaseText.setVisible(false);

		var fightModeBtn=hpMpNode.getChildByName("fightModeBtn");
		var refineBtn=hpMpNode.getChildByName("refineBtn");

		fightModeBtn.addTouchEventListener(this.touchEvent, this);
		refineBtn.addTouchEventListener(this.touchEvent, this);
		this.fightModeBtn=fightModeBtn;

		this.hpCount=0;
		this.mpCount=0;
		this.hpMpNode=hpMpNode;
		// hpMpNode.setVisible(false);
	},

	setFightMode:function(player){
		var fightMode=player.fightMode;
		var fightModeName=FightModeName[fightMode];
		if (!fightModeName) {
			fightModeName=FightModeName[FightMode.SAFEMODE]; 
		}
		this.fightModeBtn.setTitleText(fightModeName);
	},

	setHpMp:function(player){
		if (player.hpCount!==this.hpCount) {
			this.hpCountText.setString(player.hpCount);
			this.hpSpeedText.setString("+"+player.hpSpeed+"/3秒");
			if (this.hpMpNode.isVisible() && this.hpCount>0) {
				this.hpDecreaseText.setVisible(true);
				this.hpDecreaseText.setString(player.hpCount - this.hpCount);
				var sequence = cc.Sequence.create(
					cc.DelayTime.create(1),
					cc.Hide.create()
				);
				this.hpDecreaseText.runAction(sequence);
				this.hpDecreaseText.setPosition(125 + this.hpCountText.getContentSize().width, -28);
			}
			this.hpCount = player.hpCount;
		}
		if (player.mpCount !== this.mpCount) {
			this.mpCountText.setString(player.mpCount);
			this.mpSpeedText.setString("+"+player.mpSpeed + "/3秒");
			if (this.hpMpNode.isVisible() && this.mpCount>0) {
				this.mpDecreaseText.setVisible(true);
				this.mpDecreaseText.setString(player.mpCount - this.mpCount);
				var sequence = cc.Sequence.create(
					cc.DelayTime.create(1),
					cc.Hide.create()
				);
				this.mpDecreaseText.runAction(sequence);
				this.mpDecreaseText.setPosition(125 + this.mpCountText.getContentSize().width, -98);
			}
			this.mpCount = player.mpCount;
		}
    },

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==='fightModeBtn') {
				var fightModeNames = {
					"1": "和平模式",
					"2": "善恶模式",
					"3": "全体模式",
					"4": "组队模式",
					"5": "帮派模式"
				};
				var listMenulayer=new cb.ListMenuLayer(fightModeNames);
				listMenulayer.callback=function(fightMode){
					// cc.log("fightMode="+fightMode);
					playerHandler.fightMode(fightMode);
				};
			}else{
				layerManager.openPanel(cb.kMMakeDrugPanelId);
			}
		}
	}

});
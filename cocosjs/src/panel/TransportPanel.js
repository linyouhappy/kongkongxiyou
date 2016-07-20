
//TransportPanel
cb.TransportPanel = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName="uiccs/TransportPanel.csb";
        this.setInitData();
        this.enableBg();
        this.openBgTouch();
        this.initView();
	},

	initView:function(){
		var ccsNode=this.ccsNode;
		this.bustSprite=ccsNode.getChildByName("bustSprite");
		this.plotText=ccsNode.getChildByName("plotText");

		var areaData,areaBtn;
		var curAreaId=app.getCurArea().areaId;

		var self=this;
		function setAreaBtn(areaId){
			areaBtn=ccsNode.getChildByTag(areaId);
			areaData=dataApi.area.findById(areaId);
			if (areaData) {
				if(areaId===3001){
					areaBtn.setTitleText("领域争夺");
				}else{
					areaBtn.setTitleText(areaData.areaName);
				}
			}

			if (curAreaId===areaId) {
				areaBtn.setEnabled(false);
				areaBtn.setHighlighted(true);
			}else{
				areaBtn.addTouchEventListener(self.touchEvent, self);
			}
		}

		setAreaBtn(1001);
		setAreaBtn(2003);
		setAreaBtn(6001);
		setAreaBtn(6002);
		setAreaBtn(6003);
		setAreaBtn(6004);
		setAreaBtn(6005);
		setAreaBtn(3001);
		// for (var areaId = 1001; areaId <=1003; areaId++) {
		// 	setAreaBtn(areaId);
		// }
		// for (var areaId = 2001; areaId <=2002; areaId++) {
		// 	setAreaBtn(areaId);
		// }
	},

	closePanel:function(){
		soundManager.stopEffectSound(this.soundHandle);
        var self = this;
        var onActionCallback = function(sender) {
        	layerManager.clearPanel(self);
        };
        var sequence = cc.Sequence.create(
            cc.ScaleTo.create(0.3,1.2),
            cc.ScaleTo.create(0.1,0.1),
            cc.CallFunc.create(onActionCallback)
        );
        this.ccsNode.runAction(sequence);
    },

	setPanelData:function(data){
		// cc.log("setPanelData  data:"+JSON.stringify(data));
		var saying = formula.charaterSaying(data.id);
		this.plotText.setString(saying);
		var portraitName=formula.portraitName(data.bustId);
		this.bustSprite.setTexture(portraitName);

		if (data.soundId) {
			this.soundHandle=soundManager.playEffectSound("sound/npc/" + data.soundId + ".mp3");
		}
	},

	updatePanelData:function(){
    },

    touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var areaId=sender.getTag();
			if (areaId===3001) {
				npcHandler.changeArea(2003);
			}else{
				npcHandler.changeArea(areaId);
			}
			cc.log("areaId=======>>>::"+areaId);
			// layerManager.closePanel(this);
			this.closePanel();
		}
	}
});


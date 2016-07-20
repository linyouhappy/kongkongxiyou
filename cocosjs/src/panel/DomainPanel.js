
//DomainDetailLayer
cb.DomainDetailLayer = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName = "uiccs/DomainDetailLayer.csb";
		this.setInitData();
		this.enableBg();
		this.openBgTouch();
		this.initView();
	},

	initView: function() {
		var ccsNode = this.ccsNode;

		this.domainIcon = ccsNode.getChildByName("domainIcon");
		this.nameText = ccsNode.getChildByName("nameText");
		this.needLevelText = ccsNode.getChildByName("needLevelText");
		this.itemText = ccsNode.getChildByName("itemText");

		this.guildText = ccsNode.getChildByName("guildText");
		this.levelText=ccsNode.getChildByName("levelText");

		this.groupPrizeText = ccsNode.getChildByName("groupPrizeText");
		this.personPrizeText = ccsNode.getChildByName("personPrizeText");
		this.nGroupPrizeText = ccsNode.getChildByName("nGroupPrizeText");
		this.nPersonPrizeText = ccsNode.getChildByName("nPersonPrizeText");
		
	},

	setPanelData: function(panelData) {
		this.ccsNode.stopAllActions();

		this.setPosition(panelData.worldPoint);
        var moveTo=cc.MoveTo.create(0.2,cc.p(cc.winSize.width / 2,cc.winSize.height / 2));
        this.runAction(moveTo);
        this.ccsNode.setScale(0.0);
        this.ccsNode.runAction(cc.ScaleTo.create(0.2,1));

        var domainData=panelData.domainData;
        this.nameText.setString(domainData.areaData.areaName);
        var guildTownData=domainData.guildTownData;

        // this.landPriceText.setString(guildTownData.worth);
        this.needLevelText.setString("集团"+guildTownData.groupLv+"级");
        var entityData = dataApi.item.findById(guildTownData.itemId);
        this.itemText.setString(entityData.name);

        this.nGroupPrizeText.setString(guildTownData.caoCoin+"金币x天数");
        this.nPersonPrizeText.setString(guildTownData.itemN+entityData.name+"x天数");

        this.domainIcon.setSpriteFrame("domain_"+guildTownData.iconId+".png");

        var domain=domainData.domain;
		if (domain.guildName && domain.guildName.length > 0) {
			this.guildText.setString(domain.guildName);
			this.guildText.setColor(consts.COLOR_ORANGE);
			if (domain.level>0) {
				this.levelText.setString(domain.level);

				this.groupPrizeText.setString((guildTownData.caoCoin*domain.level)+"金币");
        		this.personPrizeText.setString((guildTownData.itemN*domain.level)+entityData.name);
			}
		}
	}
});


//DomainPanel
cb.DomainPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/DomainPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var domainNode = ccsNode.getChildByName("domainNode");

		var myDomainBtn=domainNode.getChildByName("myDomainBtn");
		var mapScrollView=domainNode.getChildByName("mapScrollView");
		var timeText=domainNode.getChildByName("timeText");
		formula.enableOutline(timeText);
		this.timeText=timeText;
		this.mapScrollView=mapScrollView;

		myDomainBtn.addTouchEventListener(this.touchEvent, this);
		this.myDomainBtn=myDomainBtn;

		this.domainDatas=[];
		var domainData,domainBtn,domainText,groupText,guildTownData,areaData;
		for (var i = 1; i <= 5; i++) {
			domainBtn=mapScrollView.getChildByTag(1000+i);
			domainText=mapScrollView.getChildByTag(2000+i);
			groupText=mapScrollView.getChildByTag(3000+i);
			domainBtn.addTouchEventListener(this.touchEvent, this);
			domainBtn.setTag(i);

			domainBtn.setPressedActionEnabled(true);
			formula.enableOutline(domainText);
			formula.enableOutline(groupText);
			domainText.setLocalZOrder(100);

			guildTownData=dataApi.guild_town.findById(i);
			areaData=dataApi.area.findById(guildTownData.areaId);
			domainText.setString(areaData.areaName);
			domainData={
				domainBtn:domainBtn,
				domainText:domainText,
				groupText:groupText,
				areaId:guildTownData.areaId,
				guildTownData:guildTownData,
				areaData:areaData
			};
			this.domainDatas[i]=domainData;
		}

	},

	setPanelData: function(data) {
		this.updatePanelData();
	},

	updatePanelData: function(data) {
		var domains=guildManager.getDomains();
		if (!domains) {
			return;
		}
		var myGuildId=app.getCurPlayer().guildId;

		var domainData, domain, groupText, fightSprite;
		this.isFighting=false;
		for (var i = 1; i <= 5; i++) {
			domainData=this.domainDatas[i];
			domain=domains[domainData.areaId];
			domainData.domain=domain;
			if (domain) {
				groupText=domainData.groupText;
				// domain.state=AreaStates.BATTLE_STATE;
				if (domain.state===AreaStates.DOMAIN_STATE) {
					groupText.setVisible(true);
					if (domain.guildName && domain.guildName.length > 0) {
						groupText.setString(domain.guildName);
						groupText.setTextColor(consts.COLOR_ORANGE);
						domainData.domainText.setTextColor(consts.COLOR_GREEN);
					}else{
						domainData.domainText.setTextColor(consts.COLOR_WHITE);
					}
					if (domainData.fightSprite) {
						domainData.fightSprite.setVisible(false);
					}
				}else{
					this.isFighting=true;
					groupText.setVisible(false);
					if (domainData.fightSprite) {
						domainData.fightSprite.setVisible(true);
					}else{
						fightSprite=new cc.Sprite("#domain_fight_icon.png");
						this.mapScrollView.addChild(fightSprite);
						fightSprite.setPosition(groupText.getPositionX(),groupText.getPositionY()-50);
						// fightSprite.setLocalZOrder(-1);
						domainData.fightSprite=fightSprite;

						var sequence = cc.Sequence.create(
							cc.ScaleTo.create(0.1, 1.05, 0.95),
							cc.ScaleTo.create(0.3, 1, 1.1),
							cc.ScaleTo.create(0.1, 1)
						);
						fightSprite.runAction(cc.RepeatForever.create(sequence));
					}
				}
			}
			if (myGuildId && myGuildId===domain.guildId) {
				this.myDomainData=domainData;
			}
		}
		// if (this.isFighting) {
		// 	this.timeText.setString("土地争夺中");
		// 	this.myDomainBtn.setVisible(false);
		// }else{
		// 	this.myDomainBtn.setVisible(true);
		// 	if (this.myDomainData) {
		// 		this.myDomainBtn.setTitleText("进入领域");
		// 	} else {
		// 		this.myDomainBtn.setTitleText("闯进领域");
		// 	}
		// }
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="myDomainBtn") {
				if (this.myDomainData) {
					npcHandler.changeArea(this.myDomainData.areaId);
				} else {
					var area = app.getCurArea();
					if (area.areaId === 3001) {
						quickLogManager.pushLog("你已在当前场景!", 6);
					} else {
						npcHandler.changeArea(3001);
					}
				}
			}else{
				var domainData = this.domainDatas[sender.getTag()];
				if (this.isFighting) {
					if (app.getCurPlayer().guildId) {
						npcHandler.changeArea(domainData.areaId);
					}else{
						tipsBoxLayer.showTipsBox("各大集团激战中，你还没有集团，不能进入！");
					}
					// npcHandler.changeArea(domainData.areaId);
					return;
				}
				if (domainData.domain.state === AreaStates.BATTLE_STATE) {
					domainData.fightSprite.setScale(1);
					if (app.getCurPlayer().guildId) {
						npcHandler.changeArea(domainData.areaId);
					}else{
						tipsBoxLayer.showTipsBox("各大集团激战中，你还没有集团，不能进入！");
					}
				} else {
					if (domainData && domainData.areaData) {
						var worldPoint = sender.convertToWorldSpace(cc.p(0, 0));
						var panelData = {
							domainData: domainData,
							worldPoint: worldPoint
						};
						layerManager.pushLayer(cb.kMDomainDetailLayerId, panelData);
					}
				}
			}
		} else if (type === ccui.Widget.TOUCH_BEGAN) {
			if (sender.getName() !== "myDomainBtn") {
				var domainData = this.domainDatas[sender.getTag()];
				if (domainData.domain.state === AreaStates.BATTLE_STATE) {
					domainData.fightSprite.setScale(1.1);
				}
			}
		} else if (type === ccui.Widget.TOUCH_CANCELED) {
			if (sender.getName() !== "myDomainBtn") {
				var domainData = this.domainDatas[sender.getTag()];
				if (domainData.domain.state === AreaStates.BATTLE_STATE) {
					domainData.fightSprite.setScale(1);
				}
			}
		}
	}
});
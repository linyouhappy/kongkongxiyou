//FederationManager
cb.FederationManager = cc.Class.extend({
	ctor: function() {
		this.tradeInterval = 5000;

		this.affiches = [];
		this.lastAffichId = 0;

		this.offices=null;
	},

	requestFederation: function() {
		if (this.requestFederationTime) {
			if (Date.now() < this.requestFederationTime) {
				return this.playerFederate;
			}
		}
		this.requestFederationTime = Date.now() + this.tradeInterval;
		federateHandler.getFederation();
	},

	setFederation: function(data) {
		if (!data) return;

		this.playerFederate = data;
		if (layerManager.isRunPanel(cb.kMFederationPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData();
		}
	},

	requestTopDonations: function() {
		if (this.requestTopDonationsTime) {
			if (Date.now() < this.requestTopDonationsTime) {
				return this.topDonations;
			}
		}
		this.requestTopDonationsTime = Date.now() + 10000;
		var self = this;
		federateHandler.topDonations(function(data) {
			self.topDonations = data;

			if (layerManager.isRunPanel(cb.kMFederationPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updatePanelData(11);
			}
		});
	},

	requestDonation: function(caoCoin) {
		federateHandler.donation(caoCoin);
	},

	requestGetAffiches: function(kindId) {
		if (this.requestGetAffichesTime) {
			if (Date.now() < this.requestGetAffichesTime) {
				return this.affiches;
			}
		}
		this.requestGetAffichesTime = Date.now() + this.tradeInterval;

		var lastAffichId = this.lastAffichId;

		var self = this;
		federateHandler.getAffiches(lastAffichId, function(data) {
			if (data.length > 0) {
				var record;
				var affiches = self.affiches;
				for (var i = 0; i < data.length; i++) {
					record = data[i];
					if (record.id > lastAffichId) {
						affiches.push(record);
					}
				}
				if (record) {
					self.lastAffichId = record.id;
				}
				while (affiches.length > 8) {
					affiches.shift();
				}
			}
			if (layerManager.isRunPanel(cb.kMFederationPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updatePanelData(12);
			}
		});
	},

	requestGetOffices: function() {
		if (this.requestGetOfficesTime) {
			if (Date.now() < this.requestGetOfficesTime) {
				return this.offices;
			}
		}
		this.requestGetOfficesTime = Date.now() + 600000;
		// if (this.offices) {
		// 	return this.offices;
		// }
		var self = this;
		federateHandler.getOffices(function(data) {
			self.offices = data;

			if (layerManager.isRunPanel(cb.kMFederationPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updatePanelData(21);
			}
		});
	},

	setOffice:function(office){
		var offices=this.offices;
		for (var key in offices) {
			if (offices[key].id===office.id) {
				offices[key]=office;
				return;
			}
		}
	},

	requestGetCandidate: function(officerId) {
		if (this.requestGetCandidateTime) {
			if (Date.now() < this.requestGetCandidateTime) {
				return this.candidate;
			}
		}
		this.requestGetCandidateTime = Date.now() + this.tradeInterval;

		var self = this;
		federateHandler.getCandidate(officerId,function(data) {
			self.candidate = data;

			if (layerManager.isRunPanel(cb.kMElectionPanelId)) {
				var curPanel = layerManager.curPanel;
				curPanel.updatePanelData();
			}
		});
	},
});

var federationManager = new cb.FederationManager();


//FedElectionLayer
cb.FedElectionLayer = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName="uiccs/FedElectionLayer.csb";
        this.setInitData();
        this.enableBg();
        this.openBgTouch();
        this.initView();
	},

	initView:function(){
		var ccsNode=this.ccsNode;

        this.placeText=ccsNode.getChildByName("placeText");
        this.conditionText=ccsNode.getChildByName("conditionText");
        this.endTimeText=ccsNode.getChildByName("endTimeText");
        this.ticketText=ccsNode.getChildByName("ticketText");

        this.voteTextField=ccsNode.getChildByName("voteTextField");
        this.voteTextField.addEventListener(this.textFieldCallback, this);

        this.officerDatas = [];
		var officerNode, selectBtn,voteBtn,nameLabel,countLabel;
		for (var i = 0; i <4; i++) {
			officerNode = ccsNode.getChildByTag(10001 + i);

			selectBtn = officerNode.getChildByName("selectBtn");
			selectBtn.setTag(i);
			selectBtn.addTouchEventListener(this.touchEvent, this);

			voteBtn= officerNode.getChildByName("voteBtn");
			voteBtn.setTag(i);
			voteBtn.addTouchEventListener(this.touchEvent, this);

			nameLabel = cc.Label.createWithSystemFont("", "Arial", 20);
			officerNode.addChild(nameLabel);
			nameLabel.setColor(cc.color(255, 165, 0));
			nameLabel.setPosition(0, 120);

			countLabel = cc.Label.createWithSystemFont("", "Arial", 20);
			officerNode.addChild(countLabel);
			countLabel.setColor(cc.color(255, 255, 0));
			countLabel.setPosition(0, 145);

			this.officerDatas[i]={
				officerNode:officerNode,
				voteBtn:voteBtn,
				nameLabel:nameLabel,
				countLabel:countLabel
			};
		}
	},

	textFieldCallback: function(sender, type) {
		if (type === ccui.TextField.EVENT_DETACH_WITH_IME) {
			var count = sender.getString();
			count = Math.floor(Number(count));
			if (!count) {
				sender.setString('');
			} else {
				if (count < 0) {
					count = 0;
				} 
				sender.setString(count);
			}
		}
	},

	setPanelData:function(office){
		if (!office || !office.id) return;

		this.office=office;
		this.officerId=office.id;
		var officerData=dataApi.officer.findById(office.id);
		this.placeText.setString(officerData.name);
        this.conditionText.setString("捐款排名前"+officerData.condition+"名");

        if (!office.state) {
        	this.endTimeText.setString("竞选开始");
        }else if (office.state===1) {
        	var date=new Date;
	        date.setTime(office.time);
	        var minutes=date.getMinutes();
			var tmpText = date.getHours() + ":" + (minutes<10?"0"+minutes:minutes);
	        this.endTimeText.setString(tmpText);
        }else{
        	this.endTimeText.setString("竞选结束");
        }

        this.updatePanelData();
	},

	updatePanelData:function(){
		var candidates=federationManager.requestGetCandidate(this.officerId);
		if (!candidates) {
			return;
		}

		var playerFederate = federationManager.playerFederate;
		if (playerFederate) {
			this.ticketText.setString(formula.bigNumber2Text(playerFederate.voteCount)+"张");
		}

		var officerData, candidate,entitySprite;
		for (var i = 0; i < 4; i++) {
			officerData = this.officerDatas[i];
			candidate = candidates[i];
			if (officerData.entitySprite) {
				officerData.entitySprite.removeFromParent();
				officerData.entitySprite=null;
			}
			if (candidate) {
				officerData.nameLabel.setString(candidate.name);
				officerData.countLabel.setString(formula.bigNumber2Text(candidate.voteCount));
				officerData.candidate=candidate;

				entityData = dataApi.character.findById(candidate.kindId);
				if (!entityData) {
					continue;
				}
				entitySprite = cb.EntitySprite.create(entityData.skinId);
				officerData.officerNode.addChild(entitySprite);
				entitySprite.show(entityData.skinId, 5, Entity.kMActionIdle, 0.1);
				entitySprite.setScale(1.2);
				entitySprite.setPosition(0,50);
				officerData.entitySprite=entitySprite;

				officerData.voteBtn.setTitleText("投  票");
			}else{
				officerData.nameLabel.setString("");
				officerData.countLabel.setString("");
				officerData.candidate=null;

				officerData.voteBtn.setTitleText("参  选");
			}
		}
    },

    touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			
			var officerData = this.officerDatas[sender.getTag()];
			var candidate=officerData.candidate;
			if (sender.getName() === "selectBtn") {
				if (candidate) {
					layerManager.openPanel(cb.kMRolePanelId, candidate.playerId);
				}

			}else if (sender.getName() === "voteBtn") {
				if (candidate) {
					// cc.log("投票=======>>");
					var playerFederate = federationManager.playerFederate;
					var voteCount = this.voteTextField.getString();
					voteCount = Math.floor(Number(voteCount));
					if (!voteCount || voteCount<0) {
						this.voteTextField.runAction(cc.Blink.create(2, 8));
						quickLogManager.pushLog("请先输入会票数目，再投票！", 4);
						return;
					}
					if (playerFederate.voteCount<voteCount) {
						quickLogManager.pushLog("会票数目不足，需要购买！", 4);
						return;
					}

					this.voteTextField.setString("");
					federateHandler.voteTicket(this.officerId,voteCount,candidate.playerId,function(){
						playerFederate.voteCount-=voteCount;
					});

				}else{

					if (this.requestTime) {
						if (Date.now() < this.requestTime) {
							quickLogManager.pushLog("操作太频繁，请每隔3秒钟操作！", 4);
							return;
						}
					}
					this.requestTime = Date.now() + 3000;

					var playerFederate = federationManager.playerFederate;
					var officerId=this.officerId;
					var officerData=dataApi.officer.findById(officerId);
					if (!playerFederate.ranking || playerFederate.ranking>officerData.condition) {
						// var msg="只有捐款排名前"+officerData.condition+"名,才可参加竞选！";
						quickLogManager.pushLog("不能参选，捐款排名太低！", 4);
						return;
					}

					tipsBoxLayer.showTipsBox("是否确定参加竞选，捐款金额将清零？");
                    tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
                        if (isYesOrNo) {
                            federateHandler.election(officerId);
                        }
                    });
					// cc.log("参选=======>> officerId:"+officerId);
				}
			}
		}
	}
});

//FedImpeachLayer
cb.FedImpeachLayer = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName="uiccs/FedImpeachLayer.csb";
        this.setInitData();
        this.enableBg();
        this.openBgTouch();
        this.initView();
	},

	initView:function(){
		var ccsNode=this.ccsNode;

		this.nameText=ccsNode.getChildByName("nameText");
        this.placeText=ccsNode.getChildByName("placeText");
        this.powerText=ccsNode.getChildByName("powerText");
        this.salaryText=ccsNode.getChildByName("salaryText");
        this.reelectionText=ccsNode.getChildByName("reelectionText");
        this.labelNameText=ccsNode.getChildByName("labelNameText");

        this.stateText=ccsNode.getChildByName("stateText");
        this.impeachText=ccsNode.getChildByName("impeachText");
        this.opposeText=ccsNode.getChildByName("opposeText");
        this.supportText=ccsNode.getChildByName("supportText");

        var opposeBtn=ccsNode.getChildByName("opposeBtn");
        var supportBtn=ccsNode.getChildByName("supportBtn");
        opposeBtn.addTouchEventListener(this.touchEvent, this);
        supportBtn.addTouchEventListener(this.touchEvent, this);

        this.abdicateBtn=ccsNode.getChildByName("abdicateBtn");
        this.abdicateBtn.addTouchEventListener(this.touchEvent, this);

        this.ticketText=ccsNode.getChildByName("ticketText");
        this.voteTextField=ccsNode.getChildByName("voteTextField");
        this.voteTextField.addEventListener(this.textFieldCallback, this);
	},

	textFieldCallback: function(sender, type) {
		if (type === ccui.TextField.EVENT_DETACH_WITH_IME) {
			var count = sender.getString();
			count = Math.floor(Number(count));
			if (!count) {
				sender.setString('');
			} else {
				if (count < 0) {
					count = 0;
				} 
				sender.setString(count);
			}
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="abdicateBtn") {
				var self=this;
				federateHandler.abdicate(this.officerId,function() {
					layerManager.closePanel(self);
				});
				return;
			}

			var playerFederate = federationManager.playerFederate;
			var voteCount = this.voteTextField.getString();
			voteCount = Math.floor(Number(voteCount));
			if (!voteCount || voteCount < 0) {
				this.voteTextField.runAction(cc.Blink.create(2, 8));
				quickLogManager.pushLog("请先输入会票数目，再投票！", 4);
				return;
			}
			if (playerFederate.voteCount < voteCount) {
				quickLogManager.pushLog("会票数目不足，需要购买！", 4);
				return;
			}

			this.voteTextField.setString("");
			var type=0;
			if (sender.getName()==="supportBtn") {
				type=1;
			}

			federateHandler.impeach(this.officerId, voteCount, type, function() {
				playerFederate.voteCount -= voteCount;
			});
		}
	},

	setPanelData:function(office){
		if (!office || !office.id) return;

		this.office=office;
		this.officerId=office.id;

		var officerData=dataApi.officer.findById(office.id);

		this.nameText.setString(office.name);
        this.placeText.setString(officerData.name);
        this.powerText.setString(officerData.power);
        this.salaryText.setString(officerData.salary);

        if (app.curPlayerId!==office.playerId) {
        	this.abdicateBtn.removeFromParent();
        }

        if (office.state===2) {
        	this.stateText.setString("任职期");
        	this.labelNameText.setString("弹劾开始时间：");
        }else if (office.state===3) {
        	this.stateText.setString("弹劾期");
        	this.labelNameText.setString("弹劾结束时间：");
        }

        this.opposeText.setString(office.oppose);
        this.supportText.setString(office.support);

        var date=new Date;
	    date.setTime(office.time);
	    var minutes=date.getMinutes();
		var tmpText=(date.getMonth()+1)+"月"+date.getDate()+"日 "+date.getHours() + ":" +(minutes<10?"0"+minutes:minutes);
	    this.impeachText.setString(tmpText);

        var dayCount=24 * 60 * 60000+app.getServerTime()-office.startTime;
        dayCount=Math.floor(dayCount/1000/60/60/24);
        this.reelectionText.setString(dayCount+"天");

        var playerFederate = federationManager.playerFederate;
		if (playerFederate) {
			this.ticketText.setString(formula.bigNumber2Text(playerFederate.voteCount)+"张");
		}
	}
	// updatePanelData:function(){
	// 	var playerFederate = federationManager.playerFederate;
	// 	if (playerFederate) {
	// 		this.ticketText.setString(formula.bigNumber2Text(playerFederate.voteCount)+"张");
	// 	}
	// }
});

//FedDonationLayer
cb.FedDonationLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/FedDonationLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;

		this.caoCoinText = ccsNode.getChildByName("caoCoinText");
		this.caoCoinTextField = ccsNode.getChildByName("caoCoinTextField");
		this.logNode = ccsNode.getChildByName("logNode");
		var rankNode = ccsNode.getChildByName("rankNode");
		this.rankNode = rankNode;

		this.rankNodes = [];
		// this.donationLabels=[];
		var rankSprite, container, label, positionX, rankBtn;
		for (var i = 0; i < 5; i++) {
			rankSprite = rankNode.getChildByTag(10000 + i);
			container = cc.Node.create();
			rankNode.addChild(container);
			positionX = rankSprite.getPositionX();
			container.setPosition(positionX, 55);
			// this.rankNodes[i]=rankSprite;
			this.rankNodes[i] = container;

			rankBtn = rankNode.getChildByTag(1000 + i);
			rankBtn.addTouchEventListener(this.touchEvent, this);
		}

		this.myCaoCoinText = ccsNode.getChildByName("myCaoCoinText");
		this.myRankText = ccsNode.getChildByName("myRankText");

		var donationBtn = ccsNode.getChildByName("donationBtn");
		donationBtn.addTouchEventListener(this.touchEvent, this);

		this.caoCoinTextField.addEventListener(this.textFieldCallback, this);

		var richTextBox = cb.CCRichText.create(280, 0);
		richTextBox.setLineSpace(4);
		richTextBox.setDetailStyle("Arial", 20, consts.COLOR_WHITE);
		richTextBox.setPosition(135, -238);

		ccsNode.addChild(richTextBox);
		this.richTextBox = richTextBox;
	},

	textFieldCallback: function(sender, type) {
		if (type === ccui.TextField.EVENT_DETACH_WITH_IME) {
			var count = sender.getString();
			count = Math.floor(Number(count));
			if (!count) {
				sender.setString('');
			} else {
				if (count < 0) {
					count = 0;
				} else {
					var curPlayer = app.getCurPlayer();
					if (count > curPlayer.caoCoin) {
						count = curPlayer.caoCoin;
						this.caoCoinTextField.runAction(cc.Blink.create(2, 8));
					}
				}
				sender.setString(count);
			}
		}
		inputBoxLayer.textFieldCallback(sender, type);
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName() === "donationBtn") {
				var caoCoin = Number(this.caoCoinTextField.getString());
				if (!caoCoin) {
					quickLogManager.pushLog("请输入捐款金额！", 4);
					return;
				}
				if (!app.getCurPlayer().checkCaoCoin(caoCoin)) {
					quickLogManager.pushLog("金额不足，操作失败！", 4);
					return;
				}
				if (caoCoin<=100) {
					quickLogManager.pushLog("亲，太抠门了，不接受捐款！", 4);
					return;
				}
				this.caoCoinTextField.setString('');
				federationManager.requestDonation(caoCoin);
			} else {
				var ranking = sender.getTag() - 1000;
				var donation = this.topDonations[ranking];
				if (donation) {
					layerManager.openPanel(cb.kMRolePanelId, donation.playerId, true);
				}
			}
		}
	},

	setTopDonations: function() {
		topDonations = federationManager.requestTopDonations();
		if (!topDonations) {
			return;
		}

		var rankSprite, donation, entitySprite, skinIdData, entityData;
		var rankNodes = this.rankNodes;

		// var rankNode=this.rankNode;
		// var entitySprites=[];
		for (var i = 0; i < rankNodes.length; i++) {
			rankSprite = rankNodes[i];
			rankSprite.removeAllChildren();

			donation = topDonations[i];
			if (donation) {
				entityData = dataApi.character.findById(donation.kindId);
				if (!entityData) {
					continue;
				}

				entitySprite = cb.EntitySprite.create(entityData.skinId);
				rankSprite.addChild(entitySprite);

				// skinIdData = dataApi.skinId.findById(entityData.skinId);
				// entitySprite.setPosition(0, skinIdData.offsetY);

				entitySprite.show(entityData.skinId, 5, Entity.kMActionIdle, 0.1);
				entitySprite.setScale(1.2);

				label = cc.Label.createWithSystemFont(donation.name, "Arial", 20);
				rankSprite.addChild(label);
				label.setColor(cc.color(255, 165, 0));
				label.setPosition(0, 60);

				label = cc.Label.createWithSystemFont(formula.bigNumber2Text(donation.caoCoin), "Arial", 20);
				rankSprite.addChild(label);
				label.setColor(cc.color(255, 255, 0));
				label.setPosition(0, 85);
			}
		}
		this.topDonations = topDonations;
	},

	setAffiches: function() {
		var affiches = federationManager.requestGetAffiches();
		if (!affiches) {
			return;
		}
		var richTextBox = this.richTextBox;
		richTextBox.clearAll();
		if (affiches.length === 0) {
			return;
		}

		var affiche, tmpText;
		var date = new Date();
		var nodeId = 1;
		for (var i = 0; i < affiches.length; i++) {
			affiche = affiches[i];

			date.setTime(affiche.time);
			tmpText = date.getHours() + ":" + date.getMinutes() + " ";

			richTextBox.setTextColor(chat.colorTbl.cyan);
			richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.setTextColor(chat.colorTbl.brown);
			richTextBox.appendRichText(affiche.name, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.setTextColor(chat.colorTbl.white);
			if (affiche.caoCoin < 10000000) {
				tmpText = "捐款";
			} else if (affiche.caoCoin < 100000000) {
				tmpText = "狂捐";
			} else {
				tmpText = "豪捐";
			}
			richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			richTextBox.setTextColor(chat.colorTbl.yellow);
			richTextBox.appendRichText(formula.bigNumber2Text(affiche.caoCoin), chat.kTextStyleNormal, nodeId++, 0);
			richTextBox.appendRichText("\n", chat.kTextStyleNormal, nodeId++, 0);

		}
		richTextBox.layoutChildren();
	},

	updateLayerData: function(data) {
		if (data === 11) {
			this.setTopDonations();
			return;
		} else if (data === 12) {
			this.setAffiches();
			return;
		} else if (data) {
			return;
		}

		var playerFederate = federationManager.playerFederate;
		if (!playerFederate) {
			return;
		}
		this.setTopDonations();
		this.setAffiches();

		this.caoCoinText.setString(playerFederate.doCaoCoin + "炒币");
		this.myRankText.setString("第" + playerFederate.ranking + "名");
		this.myCaoCoinText.setString(playerFederate.caoCoin + "炒币");
	}
});

//FedHallLayer
cb.FedHallLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/FedHallLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView: function() {
		var ccsNode=this._ccsNode;

		this.officerNodes = {};
		var officerNode, officerBtn;
		for (var i = 1; i <=9; i++) {
			officerNode = ccsNode.getChildByTag(10000 + i);
			this.officerNodes[i] = officerNode;

			officerBtn = officerNode.getChildByName("officerBtn");
			officerBtn.setTag(i);
			officerBtn.addTouchEventListener(this.touchEvent, this);
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName() === "officerBtn") {
				var officerId=sender.getTag();
				var officer=this.offices[officerId];
				if (officer.state>1) {
					// cc.log("officer:"+JSON.stringify(officer));
					// var impeachLayer=new cb.FedImpeachLayer(officer);
					layerManager.openPanel(cb.kMImpeachPanelId,officer,true);
				}else{
					layerManager.openPanel(cb.kMElectionPanelId,officer,true);
					// var electionLayer=new cb.FedElectionLayer(officerId);
				}
			}
		}
	},

	updateLayerData: function(data) {
		if (!data || data===21) {
			this.offices={};
			var offices=federationManager.requestGetOffices();
			if (!offices) {
				return;
			}
			var officerNodes=this.officerNodes;
			for (var key in officerNodes) {
				officerNode=officerNodes[key];
				if (officerNode.getChildByTag(13846)) {
					officerNode.removeChildByTag(13846);
				}
			}

			var office,label;
			for (var i = 0; i < offices.length; i++) {
				office=offices[i];
				this.offices[office.id]=office;

				officerNode=officerNodes[office.id];
				if(!officerNode) continue;

				if (office.state<2) {
					label = cc.Label.createWithSystemFont("竞选中", "Arial", 20);
					officerNode.addChild(label);
					label.setColor(cc.color(255, 255, 0));
					label.setPosition(0, 100);
					continue;
				}

				entityData = dataApi.character.findById(office.kindId);
				if (!entityData) {
					continue;
				}

				entitySprite = cb.EntitySprite.create(entityData.skinId);
				officerNode.addChild(entitySprite);

				entitySprite.show(entityData.skinId, 5, Entity.kMActionIdle, 0.1);
				entitySprite.setScale(1.2);
				entitySprite.setPosition(0,110);

				label = cc.Label.createWithSystemFont(office.name, "Arial", 20);
				officerNode.addChild(label);
				label.setColor(cc.color(255, 165, 0));
				label.setPosition(0, 172);
			}
		}
	}
});

//FedVoteLayer
cb.FedVoteLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/FedVoteLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;

		this.voteYCaoCoinText = ccsNode.getChildByName("voteYCaoCoinText");
		this.voteTCaoCoinText = ccsNode.getChildByName("voteTCaoCoinText");
		this.voteCaoCoinText = ccsNode.getChildByName("voteCaoCoinText");
		this.countTextField = ccsNode.getChildByName("countTextField");
		this.dailyCaoCoinText = ccsNode.getChildByName("dailyCaoCoinText");
		this.voteCountText = ccsNode.getChildByName("voteCountText");
		//priceText

		this.countTextField.addEventListener(this.textFieldCallback, this);

		var buyBtn = ccsNode.getChildByName("buyBtn");
		var receiveBtn = ccsNode.getChildByName("receiveBtn");
		buyBtn.addTouchEventListener(this.touchEvent, this);
		receiveBtn.addTouchEventListener(this.touchEvent, this);
	},

	textFieldCallback: function(sender, type) {
		if (type === ccui.TextField.EVENT_DETACH_WITH_IME) {
			var count = sender.getString();
			var count = Math.floor(Number(count));
			if (!count) {
				sender.setString('');
			} else {
				if (count < 0) {
					count = 0;
				}
				sender.setString(count);
			}
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName() === "buyBtn") {
				var voteCount = Math.floor(Number(this.countTextField.getString()));
				if (!voteCount) {
					quickLogManager.pushLog("请输入选票数量！", 4);
					return;
				}
				var caoCoin=voteCount*100;
				if (!app.getCurPlayer().checkCaoCoin(caoCoin)) {
					quickLogManager.pushLog("金额不足，操作失败！", 4);
					return;
				}
				this.countTextField.setString("");
				federateHandler.buyVote(caoCoin);
			} else if (sender.getName() === "receiveBtn") {
				// var playerFederate = federationManager.playerFederate;
				federateHandler.shareVote();
			}
		}
	},

	updateLayerData: function() {
		var playerFederate = federationManager.playerFederate;
		if (!playerFederate) {
			return;
		}

		this.voteYCaoCoinText.setString(playerFederate.voteYCaoCoin + "炒币");
		this.voteTCaoCoinText.setString(playerFederate.voteTCaoCoin + "炒币");
		this.voteCaoCoinText.setString(playerFederate.voteCaoCoin + "炒币");

		this.dailyCaoCoinText.setString(playerFederate.dailyCaoCoin + "炒币");
		this.voteCountText.setString(playerFederate.voteCount + "张");
		// this.voteTCaoCoinText.setString(playerFederate.voteTCaoCoin+"炒币");
	}
});


cb.FederationPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/FederationPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var tabBtnNode = ccsNode.getChildByName("tabBtnNode");

		var tabBtn = null;
		this._tabBtns = [];
		this.tabIndex = null;
		for (var i = 0; i <= 3; i++) {
			tabBtn = tabBtnNode.getChildByTag(i + 10000);
			tabBtn.addTouchEventListener(this.touchEvent, this);
			this._tabBtns[i] = tabBtn;
		}
		this._layers = [];
	},

	setPanelData: function(data) {
		this.selectTabBtn(0);
		federationManager.requestFederation();
		// federationManager.offices=null;
	},

	updatePanelData: function(data) {
		var layer = this._layers[this.tabIndex];
		if (layer) {
			layer.updateLayerData(data);
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var index = sender.getTag() - 10000;
			this.selectTabBtn(index);
		}
	},

	selectTabBtn: function(index) {
		if (index === null) return;
		if (this.tabIndex === index)
			return;

		if (this.tabIndex !== null)
			this.unselectTabBtn(this.tabIndex);

		this.tabIndex = index;
		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_ORANGEGOLD);
		tabBtn.setHighlighted(true);

		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(true);
		}
		if (!layer) {
			if (index === 0) {
				layer = new cb.FedDonationLayer();
			} else if (index === 1) {
				layer = new cb.FedHallLayer();
			} else if (index === 2) {
				layer = new cb.FedVoteLayer();
			}
			if (!layer) return;
			this.addChild(layer);
			layer.setPosition(0, -36);
			this._layers[index] = layer;

		}
		this.updatePanelData();
	},

	unselectTabBtn: function(index) {
		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_WHITE);
		tabBtn.setHighlighted(false);
		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(false);
		}
	}
});
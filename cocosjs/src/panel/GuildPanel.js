
//GuildUpgradeLayer
cb.GuildUpgradeLayer = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName = "uiccs/GuildUpgradeLayer.csb";
		this.setInitData();
		this.enableBg();
		this.openBgTouch();
		this.initView();
	},

	initView: function() {
		var ccsNode = this.ccsNode;
		this.levelPreText = ccsNode.getChildByName("levelPreText");
		this.memberPreText = ccsNode.getChildByName("memberPreText");
		this.buildPreText = ccsNode.getChildByName("buildPreText");
		this.caoCoinPreText = ccsNode.getChildByName("caoCoinPreText");

		this.levelNextText = ccsNode.getChildByName("levelNextText");
		this.memberNextText = ccsNode.getChildByName("memberNextText");
		this.buildNextText = ccsNode.getChildByName("buildNextText");
		this.caoCoinNextText = ccsNode.getChildByName("caoCoinNextText");

		var upgradeBtn = ccsNode.getChildByName("upgradeBtn");
		upgradeBtn.addTouchEventListener(this.touchEvent, this);
		this.upgradeBtn=upgradeBtn;
	},

	setPanelData: function() {
		var myGuild=guildManager.myGuild;
		this.levelPreText.setString(myGuild.level+"级");
		this.memberPreText.setString(myGuild.count);
		this.buildPreText.setString(myGuild.build);
		this.caoCoinPreText.setString(myGuild.caoCoin);

		var nextLevel=myGuild.level+1;
		var guildData=dataApi.guild.findById(nextLevel);
		if (!guildData) {
			this.upgradeBtn.setEnabled(false);
			this.upgradeBtn.setTitleText("升级完毕");
			guildData=dataApi.guild.findById(myGuild.level);

			this.levelNextText.setString("满级");
			this.memberNextText.setString(guildData.capacity);
			this.buildNextText.setString(guildData.build);
			this.caoCoinNextText.setString(guildData.caoCoin);
			return;
		}
		this.upgradeBtn.setEnabled(true);

		this.guildData=guildData;
		this.levelNextText.setString(nextLevel+"级");
		this.memberNextText.setString(guildData.capacity);
		this.buildNextText.setString(guildData.build);
		this.caoCoinNextText.setString(guildData.caoCoin);

		if (myGuild.count>guildData.capacity) {
			this.memberNextText.setColor(consts.COLOR_RED);
		}
		if (myGuild.build<guildData.build) {
			this.buildNextText.setColor(consts.COLOR_RED);
		}
		if (myGuild.caoCoin<guildData.caoCoin) {
			this.caoCoinNextText.setColor(consts.COLOR_RED);
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			this.upgradeBtn.setEnabled(true);
			guildHandler.upgrade();
		}
	}
});

//GuildMenuLayer
cb.GuildMenuLayer = cc.Layer.extend({
	ctor: function(containLayer) {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/GuildMenuLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		this.__initView();
		this.containLayer=containLayer;
	},

	__initView:function(){
		var ccsNode = this._ccsNode;
		var itemBtn = null;
		// this.itemBtns=[];
		var isGuildCaptain=guildManager.isGuildCaptain();
        for (var i = 101; i <= 105; i++) {
            itemBtn = ccsNode.getChildByTag(i);
            if(!itemBtn)
            	continue;

            if (i>102) {
            	if (!isGuildCaptain) {
            		itemBtn.setEnabled(false);
            		continue;
            	}
            }
            itemBtn.addTouchEventListener(this.touchEvent, this);
        }
        var onTouchBegan = function(touch, event) {
            return true;
        };
        var self = this;
        var onTouchEnded = function(touch, event) {
            self.containLayer.closeGuildMenuLayer();
        };
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan,
            onTouchEnded: onTouchEnded
        }, this);
	},

	setLayerData:function(guildId,member){
		this.guildId=guildId;
		this.member=member;
	},

	touchEvent: function(sender, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
        	var isGuildCaptain=guildManager.isGuildCaptain();
            switch (sender.getTag()) {
            	//查看信息
                case 101:
                	layerManager.pushLayer(cb.kMRolePanelId, this.member.playerId);
                    break;
                case 102:
               		if(isGuildCaptain){
               			quickLogManager.pushLog("很抱歉，功能暂时不开放！",1);
               		}else{
               			quickLogManager.pushLog("赠送失败，你还没有股份！",1);
               		}
                    break;
                //任命职位
                case 103:
                	if(!isGuildCaptain) return;
                	guildHandler.appointGuild(this.member.playerId);
                    break;
                //炒他鱿鱼
                case 104:
                	if(!isGuildCaptain) return;
                	guildHandler.kickGuild(this.member.playerId);
                    break;
                case 105:

                    break;
            }
            this.containLayer.closeGuildMenuLayer();
        }
    }
});

//GuildDetailLayer
cb.GuildDetailLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/GuildDetailLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
		var ccsNode = this._ccsNode;
		this.guildNameText= ccsNode.getChildByName("guildNameText");
		this.captainNameText= ccsNode.getChildByName("captainNameText");
		this.levelText= ccsNode.getChildByName("levelText");
		// this.rankText= ccsNode.getChildByName("rankText");
		this.capacityText= ccsNode.getChildByName("capacityText");
		this.caoCoinText= ccsNode.getChildByName("caoCoinText");
		this.descText=ccsNode.getChildByName("descText");
		this.descText.setTextAreaSize(cc.size(320,235));

		this.areaText= ccsNode.getChildByName("areaText");

		this.descTextField=ccsNode.getChildByName("descTextField");
		this.descBtn=ccsNode.getChildByName("descBtn");
		this.descBtn.addTouchEventListener(this.touchEvent, this);
		this.textFieldImage=ccsNode.getChildByName("textFieldImage");


		this.salaryBtn=ccsNode.getChildByName("salaryBtn");
		this.demissionBtn=ccsNode.getChildByName("demissionBtn");
		this.upgradeBtn=ccsNode.getChildByName("upgradeBtn");
		this.salaryBtn.addTouchEventListener(this.touchEvent, this);
		this.demissionBtn.addTouchEventListener(this.touchEvent, this);
		this.upgradeBtn.addTouchEventListener(this.touchEvent, this);

		this.recruitBtn=ccsNode.getChildByName("recruitBtn");
		this.domainBtn=ccsNode.getChildByName("domainBtn");
		this.recruitBtn.addTouchEventListener(this.touchEvent, this);
		this.domainBtn.addTouchEventListener(this.touchEvent, this);

		var scrollView = ccsNode.getChildByName("scrollView");
		var richTextBox = cb.CCRichText.create(360, 0);
		richTextBox.setLineSpace(4);
		richTextBox.setDetailStyle("Arial", 20, consts.COLOR_WHITE);
		richTextBox.setPosition(5, -20);
		scrollView.addChild(richTextBox);
		this.richTextBox = richTextBox;

		// var nameLabel = cc.Label.createWithSystemFont("+", "Arial", 32);
		// scrollView.addChild(nameLabel);

		guildManager.requestGuildAffiche();
	},

	setGuildAffiches: function() {
		var guildAffiches = guildManager.guildAffiches;
		if (!guildAffiches) {
			return;
		}
		var richTextBox = this.richTextBox;
		richTextBox.clearAll();
		if (guildAffiches.length === 0) {
			return;
		}

		var guildAffiche, tmpText;
		var date = new Date();
		var nodeId = 1;
		for (var i = 0; i < guildAffiches.length; i++) {
			guildAffiche = guildAffiches[i];

			// date.setTime(guildAffiche.time);
			// tmpText = date.getHours() + ":" + date.getMinutes() + " ";

			// richTextBox.setTextColor(chat.colorTbl.cyan);
			// richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			// richTextBox.setTextColor(chat.colorTbl.brown);
			// richTextBox.appendRichText(fightAffiche.winner, chat.kTextStyleNormal, nodeId++, 0);

			// richTextBox.setTextColor(chat.colorTbl.white);
	
			// richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			// richTextBox.setTextColor(chat.colorTbl.brown);
			// richTextBox.appendRichText(fightAffiche.loser, chat.kTextStyleNormal, nodeId++, 0);

			// richTextBox.setTextColor(chat.colorTbl.white);
			// tmpText = "，赢得";
			// richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			// richTextBox.setTextColor(chat.colorTbl.yellow);
			// fightlevel = dataApi.fightlevel.findById(fightAffiche.level);
			// if (fightlevel) {
			// 	tmpText = formula.bigNumber2Text(fightlevel.reward);
			// 	richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);
			// }

			// richTextBox.setTextColor(chat.colorTbl.white);
			// tmpText = "大奖";
			// richTextBox.appendRichText(tmpText, chat.kTextStyleNormal, nodeId++, 0);

			// richTextBox.appendRichText("\n", chat.kTextStyleNormal, nodeId++, 0);

		}
		richTextBox.layoutChildren();
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var btnName=sender.getName();
			switch(btnName){
				case "descBtn":
					if (!this.myGuild) {
						return;
					}
					var descTextField = this.descTextField;
					var desc = descTextField.getString();
					if (!desc || !desc.length) {
						descTextField.runAction(cc.Blink.create(2, 8));
						return;
					}
					descTextField.setString("");
					guildHandler.guildDesc(desc);
					break;
				case "demissionBtn":
					var isGuildCaptain = guildManager.isGuildCaptain();
					if (isGuildCaptain) {
						tipsBoxLayer.showTipsBox("确定要破产注销公司吗？公司资金将按股权分配给所有股东。");
					} else {
						tipsBoxLayer.showTipsBox("确定要辞职吗？今天的工资稍后就发。");
					}
					var self = this;
					tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
						if (isYesOrNo) {
							guildHandler.disbandGuild(self.myGuild.id);
						}
					});
					break;
				case "salaryBtn":
					sender.setEnabled(false);
					guildManager.getSalary();
					break;
				case "upgradeBtn":
					layerManager.pushLayer(cb.kMGuildUpgradePanelId);
					break;
				case "recruitBtn":
					guildHandler.recruit();
					break;
				case "domainBtn":

					break;
			}
		}
	},

	updateLayerData: function(myGuild) {
		if (!myGuild.id) {
			return;
		}
		this.myGuild=myGuild;
		this.curPlayerId=app.getCurPlayer().id;

		var date = new Date;
		var currentDate = date.getDate();
		var currentMonth = date.getMonth();
		date.setTime(myGuild.salaryTime);
		if (date.getDate() !== currentDate 
			|| date.getMonth() !== currentMonth) {
			this.salaryBtn.setEnabled(true);
		}else{
			this.salaryBtn.setEnabled(false);
		}

		this.guildNameText.setString(myGuild.name);
		this.levelText.setString(myGuild.level+"级");
		this.caoCoinText.setString(formula.bigNumber2Text(myGuild.caoCoin) );

		this.captainNameText.setString(myGuild.captainName);
		this.capacityText.setString(myGuild.count+ "/"+myGuild.capacity);
		if (myGuild.areaId) {
			var areaData=dataApi.area.findById(myGuild.areaId);
			if (areaData) {
				this.areaText.setString(areaData.areaName);
			}else{
				this.areaText.setString("无地盘");
			}
		}else{
			this.areaText.setString("无地盘");
		}
		// this.rankText.setString("第"+(myGuild.ranking+1)+"名");
		if (myGuild.desc && myGuild.desc.length>0) {
			this.descText.setString(myGuild.desc);
		}else{
			this.descText.setString("CEO很懒，没填口号~~~");
		}
	},

	showEmployee: function() {
		if(!this.recruitBtn)
			return;

		this.demissionBtn.setTitleText("辞  职");
		this.recruitBtn.removeFromParent();
		this.descBtn.removeFromParent();
		this.descTextField.removeFromParent();
		this.textFieldImage.removeFromParent();
		
		this.recruitBtn=null;
        this.descBtn=null;
        this.descTextField=null;
	}
});

//GuildMemberLayer
cb.GuildMemberLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/GuildMemberLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		this.__initView();
	},

	__initView:function(){
		var ccsNode=this._ccsNode;
		var position=cc.p(-390,-203);
		var contentSize=cc.size(780, 377);

		var tableView = new cc.TableView(this,contentSize);
		tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		tableView.setPosition(position);
		tableView.setDelegate(this);
		tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
		ccsNode.addChild(tableView);

		this.tableView = tableView;
	},

	updateLayerData: function(guildMember) {
		if (!guildMember) return;
		this.guildMember=[];

		var area=app.getCurArea();
        var member, player;
		for (var i = 0; i < guildMember.length; i++) {
			member=guildMember[i];
			player = area.getPlayer(member.playerId);
			if (player) {
				member.loginTime=Date.now();
			}
			this.guildMember.push(member);
		}
		this.curPlayerId=app.getCurPlayer().id;
		this.tableView.reloadData();
	},

	closeGuildMenuLayer:function(){
		if (this.guildMenuLayer) {
			this.guildMenuLayer.removeFromParent();
			this.guildMenuLayer=null;
		}
	},

	tableCellTouched: function(table, cell) {
		var idx=cell.getIdx();
		var member = this.guildMember[idx];
		 if (this.curPlayerId===member.playerId) {
		 	return;
		 }
		// var worldPoint=cell.convertToWorldSpace(cc.p(390,35));
		// worldPoint=this.convertToNodeSpace(worldPoint);
		this.closeGuildMenuLayer();

		var guildMenuLayer=new cb.GuildMenuLayer(this);
		var worldPoint=cc.p(-80,120);
		guildMenuLayer.setPosition(worldPoint);
		this.addChild(guildMenuLayer);
		guildMenuLayer.setLayerData(this.guildId,member);
		this.guildMenuLayer=guildMenuLayer;
	},

	tableCellHighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(true);
	},

	tableCellUnhighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);
	},

	tableCellSizeForIndex: function(table, idx) {
		return cc.size(780, 70);
	},

	tableCellAtIndex: function(table, idx) {
		var ccsNode;
		var cell = table.dequeueCell();
		if (!cell) {
			cell = new cc.TableViewCell();
			ccsNode = ccs.CSLoader.createNode("uiccs/GuildMemberItem.csb");
			ccsNode.setTag(123);
			cell.addChild(ccsNode);
		} else {
			ccsNode = cell.getChildByTag(123);
		}

		var nameText = ccsNode.getChildByName("nameText");
		var levelText = ccsNode.getChildByName("levelText");
		var jobText = ccsNode.getChildByName("jobText");
		var loginTimeText = ccsNode.getChildByName("loginTimeText");
		var profitText = ccsNode.getChildByName("profitText");

		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);

		var member = this.guildMember[idx];

		nameText.setString(member.name);
		levelText.setString(member.level+"级");
		jobText.setString(PlaceNames[member.jobId]);

		var loginTime=app.getServerTime()-member.loginTime;
		loginTime=Math.floor(loginTime/1000);

		var textColor; 
		if (loginTime<3600) {
			if (member.jobId === PlaceTypes.CEO) {
				textColor = consts.COLOR_YELLOW;
			} else if (member.jobId === PlaceTypes.Manager) {
				textColor = consts.COLOR_CYANBLUE;
			} else {
				if (this.curPlayerId===member.playerId) {
					textColor =consts.COLOR_PINK;
				}else{
					textColor = consts.COLOR_WHITE;
				}
			}
		} else {
			textColor = consts.COLOR_GRAY;
		}

		nameText.setTextColor(textColor);
		levelText.setTextColor(textColor);
		jobText.setTextColor(textColor);
		loginTimeText.setTextColor(textColor);
		profitText.setTextColor(textColor);

		loginTime=formula.loginState(loginTime);
		loginTimeText.setString(loginTime);
		profitText.setString(formula.bigNumber2Text(2523453));
		return cell;
	},

	numberOfCellsInTableView: function(table) {
		if (!this.guildMember) return 0;
		return this.guildMember.length;
	}
});

//GuidBagLayer
cb.GuidBagLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/GuidBagLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
		var ccsNode=this._ccsNode;
		this.myValueText=ccsNode.getChildByName("myValueText");
		this.totalValueText=ccsNode.getChildByName("totalValueText");
		var exchangeBtn=ccsNode.getChildByName("exchangeBtn");
		exchangeBtn.addTouchEventListener(this.touchEvent, this);
		var clearBtn=ccsNode.getChildByName("clearBtn");
		clearBtn.addTouchEventListener(this.touchEvent, this);

		var container=ccsNode.getChildByName("container");
        var contentSize = container.getContentSize();

		var itemBoxLayer = cb.ItemBoxLayer.create();
        itemBoxLayer.setLimitColumn(5);
        itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(95, 90));
        itemBoxLayer.enableEvent(true);
        container.addChild(itemBoxLayer);

        var self = this;
        var onItemBoxLayerCallback = function(position, itemBox) {
            var item=self.selectItems[position-1];
			if (!item) {
				return;
			}
			var worldPoint=itemBox.convertToWorldSpace(cc.p(0,0));
			var itemDetailLayer = new cb.ItemDetailLayer(item)
			itemDetailLayer.setGuildPosition(worldPoint);
        };
        itemBoxLayer.addEventListener(onItemBoxLayerCallback);
        this.itemBoxLayer = itemBoxLayer;

		guildManager.requestGetItems();
		guildManager.requestItemAffiche();
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="exchangeBtn"){
				var itemSelectLayer=new cb.ItemSelectLayer();
				itemSelectLayer.setPosition(0,36);
				this.addChild(itemSelectLayer);
				var self=this;
				itemSelectLayer.setEquipmentCallback(function(item){
					if (item) {
						guildManager.requestGuildItem(item.id);
					}
				});
			}else if (sender.getName()==="clearBtn") {
				if (!guildManager.myGuild || !guildManager.myGuild.myJobId) {
					quickLogManager.pushLog("你不是公司的领导，没有权限！",7);
					return;
				}
				var callback=function(itemIds){
					guildManager.clearItems(itemIds);
				};
				layerManager.pushLayer(cb.kMClearItemPanelId,callback);
			}
		}
	},

	updateLayerData: function() {
		var myGuild=guildManager.myGuild;
		if (myGuild) {
			this.myValueText.setString(myGuild.myBuild || 0);
			this.totalValueText.setString(myGuild.build || 0);
		}

		var items=guildManager.getItems();
		if (!items) return;

		var itemBoxLayer=this.itemBoxLayer;

		var selectItems=[];
		for (var key in items) {
			selectItems.push(items[key]);
		}
		this.selectItems=selectItems;

		var itemCount=selectItems.length+5;
		itemCount=Math.max(itemCount,25);
		itemBoxLayer.setItemCount(itemCount);

		var item, itemBox, imgPath, itemColorName;
		for (var i = 0; i < selectItems.length; i++) {
			item = selectItems[i];

			itemBox = itemBoxLayer.getItemBoxByPosition(i+1);
			if(!itemBox)
				continue;
			// itemBox.enableKeepSelect(true);

			if (item.itemData) {
				imgPath=formula.skinIdToIconImg(item.itemData.skinId);
				itemBox.setIconSprite(imgPath);
				itemBox.adjustIconSprite();
			}
			itemColorName = formula.starToColorImg(item.totalStar);
			itemBox.setColorSprite(itemColorName);
		}
	}
});

//GuildShareholderLayer
cb.GuildShareholderLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/GuildShareholderLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
		var ccsNode=this._ccsNode;
		var position=cc.p(-390,-203);
		var contentSize=cc.size(780, 377);

		var tableView = new cc.TableView(this,contentSize);
		tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		tableView.setPosition(position);
		tableView.setDelegate(this);
		tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
		ccsNode.addChild(tableView);
		this.tableView = tableView;

		this.text11=ccsNode.getChildByName("text11");
		this.text12=ccsNode.getChildByName("text12");
		this.text13=ccsNode.getChildByName("text13");
		// this.text14=ccsNode.getChildByName("text14");
		this.text21=ccsNode.getChildByName("text21");
		this.text22=ccsNode.getChildByName("text22");
		this.text23=ccsNode.getChildByName("text23");
		// this.text24=ccsNode.getChildByName("text11");
	},

	updateLayerData: function() {
		var guildId=app.getCurPlayer().guildId || 0;
		var myGuild=guildManager.myGuild;
		if (!myGuild) return;

		this.text11.setString(formula.bigNumber2Text(myGuild.caoCoin));
		this.text21.setString(formula.bigNumber2Text(myGuild.caoCoin));

		this.shareHolders=[];
		var curPlayer=app.getCurPlayer();
		var shareHolder={
			level:curPlayer.level,
			name:curPlayer.name,
			playerId:myGuild.captainId
		};
		shareHolder.stockCount=10000;
		shareHolder.stockOption=100;
		shareHolder.loginTime = Date.now();

		this.shareHolders.push(shareHolder);

		this.curPlayerId=app.getCurPlayer().id;
		this.tableView.reloadData();
	},

	tableCellTouched: function(table, cell) {
		var idx=cell.getIdx();
	},

	tableCellHighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(true);
	},

	tableCellUnhighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);
	},

	tableCellSizeForIndex: function(table, idx) {
		return cc.size(780, 70);
	},

	tableCellAtIndex: function(table, idx) {
		var ccsNode;
		var cell = table.dequeueCell();
		if (!cell) {
			cell = new cc.TableViewCell();
			ccsNode = ccs.CSLoader.createNode("uiccs/GuildMemberItem.csb");
			ccsNode.setTag(123);
			cell.addChild(ccsNode);
		} else {
			ccsNode = cell.getChildByTag(123);
		}

		var nameText = ccsNode.getChildByName("nameText");
		var levelText = ccsNode.getChildByName("levelText");
		var jobText = ccsNode.getChildByName("jobText");
		var loginTimeText = ccsNode.getChildByName("loginTimeText");
		var profitText = ccsNode.getChildByName("profitText");

		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);

		var shareHolder = this.shareHolders[idx];
		nameText.setString(shareHolder.name);
		levelText.setString(shareHolder.level+"级");
		//stock option
		jobText.setString(shareHolder.stockOption);
		profitText.setString(shareHolder.stockCount);

		var loginTime=app.getServerTime()-shareHolder.loginTime;
		loginTime=Math.floor(loginTime/1000);
		var textColor; 
		if (loginTime<3600) {
			// if (member.jobId === PlaceTypes.CEO) {
			// 	textColor = consts.COLOR_YELLOW;
			// } else if (member.jobId === PlaceTypes.Manager) {
			// 	textColor = consts.COLOR_CYANBLUE;
			// } else {
			if (this.curPlayerId===shareHolder.playerId) {
				textColor =consts.COLOR_PINK;
			}else{
				textColor = consts.COLOR_WHITE;
			}
			// }
		} else {
			textColor = consts.COLOR_GRAY;
		}

		nameText.setTextColor(textColor);
		levelText.setTextColor(textColor);
		jobText.setTextColor(textColor);
		loginTimeText.setTextColor(textColor);
		profitText.setTextColor(textColor);

		loginTime=formula.loginState(loginTime);
		loginTimeText.setString(loginTime);
		return cell;
	},

	numberOfCellsInTableView: function(table) {
		if (!this.shareHolders) return 0;
		return this.shareHolders.length;
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
	
		}
	}
});

// //GuildDomainLayer
// cb.GuildDomainLayer = cc.Layer.extend({
// 	ctor: function() {
// 		this._super();

// 		var ccsNode = ccs.CSLoader.createNode("uiccs/GuildDomainLayer.csb");
// 		this.addChild(ccsNode);
// 		this._ccsNode = ccsNode;

// 		this.__initView();
// 	},

// 	__initView:function(){
// 	},

// 	touchEvent:function(sender, type) {
// 		if (type === ccui.Widget.TOUCH_ENDED) {
// 			if (sender.getName()==="outputItemBtn"){
// 			}
// 		}
// 	},

// 	updateLayerData: function() {

// 	}
// });

//GuildHallLayer
cb.GuildHallLayer = cc.Layer.extend({
	ctor: function() {
		this._super();
		var ccsNode = ccs.CSLoader.createNode("uiccs/GuildHallLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		this.__initView();
	},

	__initView:function(){
		var ccsNode=this._ccsNode;
		var createNode = ccsNode.getChildByName("createNode");
		this.createNode=createNode;

		var guildId=app.getCurPlayer().guildId;
		var position,contentSize;
		if(guildId){
			createNode.setVisible(false);
			position=cc.p(-390,-203);
			contentSize=cc.size(780, 377);
		}else{
			var createBtn = createNode.getChildByName("createBtn");
			createBtn.addTouchEventListener(this.touchEvent, this);
			this.nameTextField=createNode.getChildByName("nameTextField");
			this.caoCoinText=createNode.getChildByName("caoCoinText");
			this.goldCoinText=createNode.getChildByName("goldCoinText");
			this.nameTextField.addEventListener(this.textFieldCallback, this);

			position=cc.p(-390,-154);
			contentSize=cc.size(780, 325);
		}

		var tableView = new cc.TableView(this,contentSize);
		tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		tableView.setPosition(position);
		tableView.setDelegate(this);
		tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
		ccsNode.addChild(tableView);

		this.tableView = tableView;
		guildManager.requestGetGuilds(true);
		this.firstRun=true;
	},

	textFieldCallback: function(sender, type) {
		inputBoxLayer.textFieldCallback(sender, type);
		// switch (type) {
		// 	case ccui.TextField.EVENT_ATTACH_WITH_IME:
		// 		layerManager.setPanelPosition(cb.kMGuildPanelId, cc.winSize.width / 2, cc.winSize.height / 2 + 300);
		// 		break;
		// 	case ccui.TextField.EVENT_DETACH_WITH_IME:
		// 		layerManager.resetPanelPosition(cb.kMGuildPanelId);
		// 		break;
		// }
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName() === "createBtn") {
				if (!app.getCurPlayer().checkCaoCoin(100000)) {
					this.caoCoinText.runAction(cc.Blink.create(2, 8));
					return;
				}
				var guildName = this.nameTextField.getString();
				if (!guildName || !guildName.length) {
					this.nameTextField.runAction(cc.Blink.create(2, 8));
					return;
				}
				guildHandler.createGuild(guildName);
			} else if (sender.getName() === "seeBtn") {
				var idx = sender.getTag();
				var guild = this.guilds[idx];
				if (guild.id===app.getCurPlayer().guildId) {
					return;
				}
				layerManager.pushLayer(cb.kMGuildDetailPanelId,guild.id);
			} else if (sender.getName() === "applyBtn") {
				sender.setEnabled(false);
				var idx = sender.getTag();
				var guild = this.guilds[idx];
				if (guild.id===app.getCurPlayer().guildId) {
					return;
				}
				guildHandler.applyGuild(guild.id);
			}
		}
	},

	updateLayerData: function() {
		var guilds=guildManager.getGuilds();
		if (!guilds || guilds.length===0){
			// guildManager.requestGetGuilds();
			return;
		} 

		this.guilds=[];
		for (var i = 0; i < guilds.length; i++) {
			this.guilds.push(guilds[i]);
		}
		this.updateIndex=this.guilds.length;
		this.guildId=app.getCurPlayer().guildId;

		var oldContentSize=this.tableView.getContentSize();
		this.tableView.reloadData();
		if (this.firstRun) {
			this.firstRun=false;
			return;
		}
		if (oldContentSize.height>this.tableView.getViewSize().height) {
			var newContentSize=this.tableView.getContentSize();
			var deltaHeight=newContentSize.height-oldContentSize.height;
			this.tableView.setContentOffset(cc.p(0,-deltaHeight));
		}
	},

	tableCellTouched: function(table, cell) {
		var idx=cell.getIdx();
		if (this.updateIndex===idx) {
			guildManager.requestGetGuilds();
		}
	},

	tableCellHighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(true);
	},

	tableCellUnhighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);
	},

	tableCellSizeForIndex: function(table, idx) {
		return cc.size(780, 70);
	},

	tableCellAtIndex: function(table, idx) {
		var cell = table.dequeueCell();
		var ccsNode,seeBtn,applyBtn;
		var guild = this.guilds[idx];
		if (!cell) {
			cell = new cc.TableViewCell();
			ccsNode = ccs.CSLoader.createNode("uiccs/GuildHallItem.csb");
			ccsNode.setTag(123);
			cell.addChild(ccsNode);

			seeBtn = ccsNode.getChildByName("seeBtn");
			seeBtn.addTouchEventListener(this.touchEvent, this);
			seeBtn.setTag(idx);

			applyBtn = ccsNode.getChildByName("applyBtn");
			applyBtn.addTouchEventListener(this.touchEvent, this);
			
		} else {
			ccsNode = cell.getChildByTag(123);
			seeBtn = ccsNode.getChildByName("seeBtn");
			seeBtn.setTag(idx);

			applyBtn = ccsNode.getChildByName("applyBtn");
		}
		seeBtn.setEnabled(true);

		var updateText = ccsNode.getChildByName("updateText");
		var rankingText = ccsNode.getChildByName("rankingText");
		var nameText = ccsNode.getChildByName("nameText");
		var levelText = ccsNode.getChildByName("levelText");
		var caoCoinText = ccsNode.getChildByName("caoCoinText");
		var capacityText = ccsNode.getChildByName("capacityText");

		if (this.guildId) {
			applyBtn.setVisible(false);
			if (guild && this.guildId===guild.id) {
				seeBtn.setEnabled(false);

				updateText.setColor(consts.COLOR_YELLOW);
				rankingText.setColor(consts.COLOR_YELLOW);
				nameText.setColor(consts.COLOR_YELLOW);
				levelText.setColor(consts.COLOR_YELLOW);
				caoCoinText.setColor(consts.COLOR_YELLOW);
				capacityText.setColor(consts.COLOR_YELLOW);
			}else{
				updateText.setColor(consts.COLOR_WHITE);
				rankingText.setColor(consts.COLOR_WHITE);
				nameText.setColor(consts.COLOR_WHITE);
				levelText.setColor(consts.COLOR_WHITE);
				caoCoinText.setColor(consts.COLOR_WHITE);
				capacityText.setColor(consts.COLOR_WHITE);
			}
		} else {
			applyBtn.setTag(idx);
			applyBtn.setVisible(true);

			if (guild) {
				if (guildManager.chechApplyGuild(guild.id)) {
					applyBtn.setEnabled(false);
				} else {
					applyBtn.setEnabled(true);
				}
			}
		}
		
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);

		if (this.updateIndex===idx) {
			cell.setTag(168);
			updateText.setVisible(true);
			rankingText.setVisible(false);
			levelText.setVisible(false);
			caoCoinText.setVisible(false);
			capacityText.setVisible(false);
			nameText.setVisible(false);

			seeBtn.setVisible(false);
			if (!this.guildId) {
				applyBtn.setVisible(false);
			}
			return cell;
		}else{
			if (cell.getTag() === 168) {
				cell.setTag(0);
				updateText.setVisible(false);
				rankingText.setVisible(true);
				levelText.setVisible(true);
				caoCoinText.setVisible(true);
				capacityText.setVisible(true);
				nameText.setVisible(true);

				seeBtn.setVisible(true);
				if (!this.guildId) {
					applyBtn.setVisible(true);
				}
			}
		}

		rankingText.setString("第"+(guild.ranking+1)+"名");
		nameText.setString(guild.name);
		levelText.setString(guild.level);
		caoCoinText.setString(formula.bigNumber2Text(guild.caoCoin));
		capacityText.setString(guild.count+"/"+guild.capacity);
		return cell;
	},

	numberOfCellsInTableView: function(table) {
		if (!this.guilds) return 0;
		var count=this.guilds.length;
		if (!guildManager.hadGetAllGuilds) {
			return count+1;
		}else{
			return count;
		}
	}
});


//GuildSimpleLayer
cb.GuildSimpleLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/GuildSimpleLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
		var ccsNode = this._ccsNode;
		this.guildNameText= ccsNode.getChildByName("guildNameText");
		this.captainNameText= ccsNode.getChildByName("captainNameText");
		this.levelText= ccsNode.getChildByName("levelText");
		this.rankText= ccsNode.getChildByName("rankText");
		this.capacityText= ccsNode.getChildByName("capacityText");
		this.caoCoinText= ccsNode.getChildByName("caoCoinText");
		this.descText=ccsNode.getChildByName("descText");
		this.descText.setTextAreaSize(cc.size(320,235));

		var applyBtn=ccsNode.getChildByName("applyBtn");
		if (!app.getCurPlayer().guildId){
			applyBtn.addTouchEventListener(this.touchEvent, this);
		}else{
			// applyBtn.setVisible(false);
			applyBtn.removeFromParent();
		}
	},

	updateLayerData: function(myGuild) {
		if (!myGuild.id) {
			return;
		}
		this.guildNameText.setString(myGuild.name);
		this.levelText.setString(myGuild.level+"级");
		this.caoCoinText.setString(formula.bigNumber2Text(myGuild.caoCoin) );

		this.captainNameText.setString(myGuild.captainName);
		this.capacityText.setString(myGuild.count+ "/"+myGuild.capacity);
		this.rankText.setString("第"+(myGuild.ranking+1)+"名");

		if (myGuild.desc && myGuild.desc.length>0) {
			this.descText.setString(myGuild.desc);
		}else{
			this.descText.setString("CEO很懒，没填口号~~~");
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (!app.getCurPlayer().guildId) {
				guildHandler.applyGuild(myGuild.id);
			}else{
				quickLogManager.pushLog("你不能拥有两个集团！");
			}
		}
	}
});

//GuildDetailPanel
cb.GuildDetailPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/GuildDetailPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var tabBtnNode = ccsNode.getChildByName("tabBtnNode");

		var tabBtn = null;
		this._tabBtns = [];
		this.tabIndex = null;
		for (var i = 0; i <= 1; i++) {
			tabBtn = tabBtnNode.getChildByTag(i + 10000);
			tabBtn.addTouchEventListener(this.touchEvent, this);
			this._tabBtns[i] = tabBtn;
		}
		this._layers = [];
	},

	setPanelData:function(guildId){
		this.guildId=guildId;
		this.selectTabBtn(0);
	},

	updatePanelData: function() {
		var layer = this._layers[this.tabIndex];
		if (layer) {
			var guildId=this.guildId;
			if (this.tabIndex === 0) {
				var guildDetail = guildManager.getGuildDetail(guildId);
				if (!guildDetail) {
					// guildHandler.getGuild(guildId);
					return;
				}
				layer.updateLayerData(guildDetail);
			} else if (this.tabIndex === 1) {
				var guildMember=guildManager.getGuildMember(guildId);
				if (!guildMember){
					return;
				}
				layer.guildId=guildId;
				layer.updateLayerData(guildMember);
			}
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
		if (this.tabIndex === index){
			return;
		}
		if (this.tabIndex !== null){
			this.unselectTabBtn(this.tabIndex);
		}

		this.tabIndex = index;
		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_ORANGEGOLD);
		tabBtn.setHighlighted(true);

		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(true);
		}
		if (!layer) {
			var guildId=this.guildId;
			if (index === 0) {
				layer=new cb.GuildSimpleLayer();
				var guildDetail = guildManager.getGuildDetail(guildId);
				if (!guildDetail) {
					guildHandler.getGuild(guildId);
				}
			} else if(index===1){
				layer=new cb.GuildMemberLayer();
				var guildMember=guildManager.getGuildMember(guildId);
				if (!guildMember){
					guildManager.requestGetMembers(guildId);
				}
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


//GuildPanel
cb.GuildPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/GuildPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var tabBtnNode = ccsNode.getChildByName("tabBtnNode");

		var tabBtn = null;
		this._tabBtns = [];
		this.tabIndex = null;
		for (var i = 0; i <= 4; i++) {
			tabBtn = tabBtnNode.getChildByTag(i + 10000);
			tabBtn.addTouchEventListener(this.touchEvent, this);
			this._tabBtns[i] = tabBtn;
		}
		this._layers = [];
		guildManager.requestEnterGuild();
	},

	setPanelData:function(data){
		var tabBtn=this._tabBtns[0];
		if (data) {
			tabBtn.setTitleText("我的集团");
			tabBtn.setEnabled(true);
			for (var i = 1; i <= 4; i++) {
				this._tabBtns[i].setEnabled(true);
				this._tabBtns[i].setVisible(true);
			}
			this.selectTabBtn(0);
		}else{
			tabBtn.setTitleText("集团大厅");
			this.selectTabBtn(4);
			tabBtn.setEnabled(false);
			tabBtn.setHighlighted(true);
			for (var i = 1; i <= 4; i++) {
				this._tabBtns[i].setEnabled(false);
				this._tabBtns[i].setVisible(false);
			}
		}
	},

	updatePanelData:function(showIndex){
		if (cc.isNumber(showIndex) && showIndex!==this.tabIndex) {
			return;
		}
		var layer=this._layers[this.tabIndex];
		if (layer) {
			if (this.tabIndex === 0) {
				var myGuild=guildManager.myGuild;
				if (!myGuild) {
					// guildManager.requestMyGuild();
					return;
				}
				layer.updateLayerData(myGuild);
				if (app.getCurPlayer().id!==myGuild.captainId) {
					layer.showEmployee();
				}
			} else if(this.tabIndex===1){
				var guildId=app.getCurPlayer().guildId || 0;
				var guildMember=guildManager.getGuildMember(guildId,true);
				if (!guildMember){
					return;
				}
				layer.guildId=guildId;
				layer.updateLayerData(guildMember);
			} else {
				layer.updateLayerData();
			} 
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
				layer=new cb.GuildDetailLayer();
				var myGuild=guildManager.myGuild;
				if (!myGuild) {
					guildManager.requestMyGuild();
				}
			} else if(index===1){
				layer=new cb.GuildMemberLayer();
				var guildId=app.getCurPlayer().guildId || 0;
				var guildMember=guildManager.getGuildMember(guildId,true);
				if (!guildMember){
					guildManager.requestGetMembers(guildId,true);
				}
			} else if (index === 2) {
				layer=new cb.GuidBagLayer();
			} else if (index === 3) {
				layer=new cb.GuildShareholderLayer();
			} else if (index === 4) {
				// layer=new cb.GuildDomainLayer();
			// } else if (index === 5) {
				layer=new cb.GuildHallLayer();
			}
			if (!layer) return;
			this._ccsNode.addChild(layer);
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


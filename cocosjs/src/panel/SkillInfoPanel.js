cb.SkillInfoPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		cc.log("1SkillInfoPanel.ctor=======>> ");
		this.createCCSNode("uiccs/SkillInfoPanel.csb");
		this.__initView();
		this.openBgTouch();
		cc.log("2SkillInfoPanel.ctor=======>> ");
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var skillInfoNode = ccsNode.getChildByName("skillInfoNode");

		var nameText = skillInfoNode.getChildByName("nameText");
		var descText = skillInfoNode.getChildByName("descText");
		var levelText=skillInfoNode.getChildByName("levelText");
		formula.enableOutline(nameText);
		formula.enableOutline(descText);
		formula.enableOutline(levelText);
		this.nameText = nameText;
		this.descText = descText;
		this.levelText=levelText;

		var upgradeNode = skillInfoNode.getChildByName("upgradeNode");
		this.playerLvText=upgradeNode.getChildByName("playerLvText");
		this.costText=upgradeNode.getChildByName("costText");
		formula.enableOutline(this.playerLvText);
		formula.enableOutline(this.costText);
		this.upgradeNode=upgradeNode;

		var touchEvent = function(sender, type) {
			if (type === ccui.Widget.TOUCH_ENDED) {
				this.upgradeSkill();
			}
		};
		this.updateBtn = skillInfoNode.getChildByName("updateBtn");
		this.updateBtn.addTouchEventListener(touchEvent, this);
		
		var key, cellData;
		var cellData, skillId, skillBtn, skillData, contentSize, skillSpriteName, skillSprite;
		var controlNode = skillInfoNode.getChildByName("controlNode");
		this.skillControlCellData = {};
		for (var position = 2; position <= 5; position++) {
			skillBtn = controlNode.getChildByTag(position + 99);
			skillBtn.setPressedActionEnabled(true);
			skillBtn.addTouchEventListener(this.controlTouchEvent, this);

			skillBtn.setTag(position);

			cellData = {};
			cellData.skillBtn = skillBtn;

			this.skillControlCellData[position] = cellData;
		}

		var skillEffect;
		this.skillListCellData = {};
		var skillIds=skillManager.getSkillList();
		var skillListNode = skillInfoNode.getChildByName("skillListNode");
		for (var i = 0; i < skillIds.length; i++) {
			skillBtn = skillListNode.getChildByTag(i + 101);
			skillBtn.setPressedActionEnabled(true);
			skillBtn.addTouchEventListener(this.listTouchEvent, this);

			skillId = skillIds[i];
			skillBtn.setTag(skillId);

			cellData = {};
			cellData.skillId = skillId;
			cellData.skillBtn = skillBtn;

			skillData = dataApi.fightskill.findById(skillId);
			skillEffect=dataApi.skill_effect.findById(skillId);

			contentSize = skillBtn.getContentSize();
			skillSpriteName = "icon/skill/skill_icon_" + skillEffect.iconId + ".png";
			skillSprite = new cc.Sprite(skillSpriteName);
			skillSprite.setPosition(cc.p(contentSize.width / 2, contentSize.height / 2));
			skillSprite.setScale(contentSize.width / skillSprite.getContentSize().width);
			// skillSprite.setScaleY(contentSize.height / skillSprite.getContentSize().height);

			cellData.skillData = skillData;
			// cellData.skillEffect=skillEffect;
			cellData.skillSprite = skillSprite;

			effectManager.useShaderEffect(skillSprite, "ShaderGreyScale");

			skillBtn.addChild(skillSprite);
			this.skillListCellData[skillId] = cellData;
		}

		this.updateFightSkills();

		var roleNode = skillInfoNode.getChildByName("roleNode");
		var curPlayer = app.getCurPlayer();

		// var entitySprite = cb.EntitySprite.create(curPlayer.skinId);
		var entitySprite = cb.EntitySpriteManger.getInstance().createEntitySprite(curPlayer.skinId,curPlayer.type);
		roleNode.addChild(entitySprite);

		var skinIdData = dataApi.skinId.findById(curPlayer.skinId);
		entitySprite.setPosition(0, skinIdData.offsetY);

		if (curPlayer.kindId === 10001) {
			entitySprite.setWeaponId(11001);
	      // this.weaponId = 11001;
	    } else if (curPlayer.kindId === 10002) {
	    	entitySprite.setWeaponId(11002);
	      // this.weaponId = 11002;
	    }
		// if (curPlayer.weaponId) {
		// 	entitySprite.setWeaponId(curPlayer.weaponId);
		// }
		entitySprite.addEventListener(function(actionType) {
			switch (actionType) {
				case Entity.kMActionAttack:
				case Entity.kMActionMagic:
					entitySprite.show(curPlayer.skinId,3,Entity.kMActionIdle,0.1);
					break;
			}
		});
  		
  		entitySprite.setScale(1.5);
  		entitySprite.enableSkillEffect(true);
		this._entitySprite = entitySprite;
		this.showSkillId(skillIds[0]);
	},

	upgradeSkill: function() {
		if (!this.selectCellData) {
			quickLogManager.pushLog("请先选择技能，再操作！");
			return;
		}
		var curPlayer = app.getCurPlayer();
		if (curPlayer.caoCoin < this.costCaoCoin) {
			quickLogManager.showErrorCode(93);
			this.costText.runAction(cc.Blink.create(2, 8));
			return;
		}
		if (curPlayer.level < this.needPlayerLevel) {
			quickLogManager.showErrorCode(35);
			this.playerLvText.runAction(cc.Blink.create(2, 8));
			return;
		}
		soundManager.playEffectSound("sound/ui/skill_upgrade.mp3");
		if (this.selectCellData.fightSkill) {
			skillHandler.upgradeSkill(this.selectCellData.skillId);
		} else {
			skillHandler.learnSkill(this.selectCellData.skillId);
		}
	},

	showSkillId: function(skillId) {
		cc.log("showSkillId=======>> skillId="+skillId);
		var cellData = this.skillListCellData[skillId];
		if (!cellData) return;

		var skillData = cellData.skillData;
		this.nameText.setString(skillData.name);
		this.descText.setString(skillData.desc);
		var position=this.levelText.getPosition();
		position.x=this.nameText.getPositionX()+5;
		var contentSize=this.nameText.getContentSize();
		position.x+=contentSize.width/2;
		this.levelText.setPosition(position);

		if (this.selectCellData) {
			this.selectCellData.skillBtn.setHighlighted(false);
		}
		cellData.skillBtn.setHighlighted(true);
		this.selectCellData = cellData;
		var needPlayerLevel=0;
		var costCaoCoin=0;
		this.upgradeNode.setVisible(true);
		if (cellData.fightSkill) {
			this.levelText.setString("Lv."+cellData.fightSkill.level);
			if (cellData.fightSkill.level>=5) {
				this.updateBtn.setTitleText("升级完毕");
				this.updateBtn.setEnabled(false);
				this.upgradeNode.setVisible(false);

				this.showAttack(skillId);
				return;
			}else{
				this.updateBtn.setTitleText("升  级");
			}
			needPlayerLevel=cellData.fightSkill.level+skillData.playerLevel;
			costCaoCoin=skillData.caoCoin+cellData.fightSkill.level*1000;
		} else {
			this.updateBtn.setTitleText("学  习");
			this.levelText.setString("Lv.0");
			needPlayerLevel=skillData.playerLevel;
			costCaoCoin=skillData.caoCoin;
		}
		this.costText.setString(costCaoCoin);
		this.playerLvText.setString(needPlayerLevel+"级");
		this.updateBtn.setEnabled(true);

		var curPlayer = app.getCurPlayer();
		if (curPlayer.caoCoin>=costCaoCoin) {
			this.costText.setTextColor(consts.COLOR_CYANBLUE);
		}else{
			this.costText.setTextColor(consts.COLOR_RED);
		}

		if (curPlayer.level>=needPlayerLevel) {
			this.playerLvText.setTextColor(consts.COLOR_CYANBLUE);
		}else{
			this.playerLvText.setTextColor(consts.COLOR_RED);
		}

		this.costCaoCoin=costCaoCoin;
		this.needPlayerLevel=needPlayerLevel;

		this.showAttack(skillId);
	},

	showAttack:function(skillId) {
		cc.log("showAttack=======>> skillId="+skillId);
		var skillEffect = dataApi.skill_effect.findById(skillId);
		if (skillEffect) {
			var curPlayer = app.getCurPlayer();
			this._entitySprite.show(curPlayer.skinId,3,skillEffect.attackType,skillEffect.delayPerUnit);
			this._entitySprite.showAttackEffect(skillEffect.aEffectId, skillEffect.aDelay, skillEffect.aY,skillEffect.aDelayPerUnit);
			soundManager.playerSkillEffect(skillEffect.soundId);
		}
	},

	updateFightSkills:function(){
		cc.log("1updateFightSkills============>> ");
		var fightSkills = skillManager.getFightSkills();
		if (!fightSkills) 
			return;

		var cellData;
		for (var key in this.skillListCellData) {
			cellData=this.skillListCellData[key];
			if (fightSkills[key]) {
				cellData.fightSkill=fightSkills[key];
				effectManager.useDefaultShaderEffect(cellData.skillSprite);
			} else {
				cellData.fightSkill=null;
				effectManager.useShaderEffect(cellData.skillSprite, "ShaderGreyScale");
			}
		}

		for (var key in fightSkills) {
			this.equipSkill(fightSkills[key]);
		}
		cc.log("2updateFightSkills============>> ");
	},

	addNewSkill: function(skillId) {
		cc.log("1addNewSkill============>> skillId="+skillId);
		var fightSkills = skillManager.getFightSkills();
		if (!fightSkills) 
			return;

		var fightSkill=fightSkills[skillId];
		if (!fightSkill) {
			cc.error("ERROR:skill is unknown,skillId=" + skillId);
			return;
		}
		var cellData = this.skillListCellData[skillId];
		if (!cellData) {
			cc.error("ERROR:skill is unknown,skillId=" + skillId);
			return;
		}

		cellData.fightSkill = fightSkill;
		effectManager.useDefaultShaderEffect(cellData.skillSprite);

		this.showSkillId(skillId);
		cc.log("1addNewSkill============>> skillId="+skillId);
	},

	updateSkill: function(skillId) {
		cc.log("updateSkill============>> skillId="+skillId);
		// var fightSkills = app.curPlayerData.fightSkills;
		// var fs =fightSkills[fightSkill.skillId];
		// fs.level=fightSkill.level;

		this.showSkillId(skillId);
	},

	equipSkill:function(fightSkill,oldPosition){
		cc.log("1equipSkill============>>");
		if (oldPosition===1) {
			return;
		}

		var skillId=fightSkill.skillId;
		var cellData;
		if (oldPosition>1) {
			cellData=this.skillControlCellData[oldPosition];
			if (!!cellData) {
				cellData.skillBtn.removeAllChildren();
				cellData.skillId=null;
			}
		}

		if (fightSkill.position===0) {
			for (var key in this.skillControlCellData) {
				cellData=this.skillControlCellData[key];
				if (cellData.skillId===skillId && skillId) {
					cellData.skillBtn.removeAllChildren();
					cellData.skillId=null;
				}
			}
		}else{
			cellData=this.skillControlCellData[fightSkill.position];
			if (!!cellData) {
				var contentSize = cellData.skillBtn.getContentSize();
				var skillEffect=dataApi.skill_effect.findById(skillId);
				var skillSpriteName = "icon/skill/skill_icon_" + skillEffect.iconId + ".png";
				var skillSprite = new cc.Sprite(skillSpriteName);
				skillSprite.setPosition(contentSize.width / 2, contentSize.height / 2);

				// cellData.skillSprite = skillSprite;
				cellData.skillBtn.removeAllChildren();
				cellData.skillBtn.addChild(skillSprite);
				cellData.skillId=skillId;
			}
		}

		if (!!mainPanel) {
			mainPanel.equipSkill(skillId);
		}
		cc.log("2equipSkill============>>");
	},

	controlTouchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var position = sender.getTag();
			this.settingSkill(position);
		}
	},

	settingSkill: function(position) {
		var cellData = this.skillControlCellData[position];
		if (!this.selectCellData) {
			quickLogManager.pushLog("请先选择技能，再装备！");
			return;
		}
		if (!this.selectCellData.fightSkill) {
			quickLogManager.pushLog("技能未学习，不能装备！");
			return;
		}
		if (cellData.skillId) {
			if (cellData.skillId === this.selectCellData.skillId) {
				skillHandler.equipSkill(this.selectCellData.skillId, 0);
			} else {
				skillHandler.equipSkill(this.selectCellData.skillId, position);
			}
		} else {
			skillHandler.equipSkill(this.selectCellData.skillId, position);
		}
	},

	listTouchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var skillId = sender.getTag();
			this.showSkillId(skillId);
		}
	},

	setTutorial:function(index){
		if (index===1) {
			var skillIds=skillManager.getSkillList();
			this.showSkillId(skillIds[0]);
		}else if (index===2) {
			this.upgradeSkill();
		}else if (index===3) {
			this.settingSkill(2);
		}
    }
});
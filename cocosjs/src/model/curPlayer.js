var CurPlayer = function(opts) {
	this.isCurPlayer = true;
	Player.call(this, opts);

	var experienceData = dataApi.experience.findById(this.level + 1);
	if (experienceData) {
		this.nextLevelExp = experienceData.exp;
	} else {
		this.nextLevelExp = 9999999999;
	}
	this.setExperience(opts.experience);

	this.area = opts.area;
	this.skillCoolTime = {};
	this.teamId = opts.teamId;

	this.caoCoin = opts.caoCoin || 0;
	this.crystal = opts.crystal || 0;

	//fightSkills reference
	this.fightSkills = skillManager.fightSkills;

	this.hpCount = opts.hpCount || 0;
	this.setHpLevel(opts.hpLevel);

	this.mpCount = opts.mpCount || 0;
	this.setMpLevel(opts.mpLevel);
	this.setFightMode(opts.fightMode);
	this.pickItemsQueue=[];
	this.totalSkillCD=0;

	this.lastCLTargetX=0;
	this.lastCLTargetY=0;
};

CurPlayer.prototype = Object.create(Player.prototype);

CurPlayer.prototype.setFightMode=function(fightMode){
	this.fightMode=fightMode || FightMode.SAFEMODE;
	this.area.setFightMode(this.fightMode);
	mainPanel.setFightMode(this);
};

CurPlayer.prototype.updateHpMp = function(data) {
	data.hp=data.hp || this.hp;
	if (data.hp !== this.hp) {
		this.setHp(data.hp);
		this.createAddHpNumberNodes(this.hpSpeed);
		this.hpCount -= this.hpSpeed;
		if (this.hpCount < 0) {
			this.hpCount = 0;
		}
	}
	data.mp=data.mp || this.mp;
	if (data.mp !== this.mp) {
		this.setMp(data.mp);
		this.createAddMpNumberNodes(this.mpSpeed);
		this.mpCount -= this.mpSpeed;
		if (this.mpCount < 0) {
			this.mpCount = 0;
		}
	}
	mainPanel.setHpMp(this);
};

CurPlayer.prototype.setHpLevel=function(level){
	this.hpLevel = level || 0;
	var hpmpData = dataApi.hpmp.findById(this.hpLevel);
	this.hpSpeed = hpmpData.hpSpeed;
	this.hpCapacity = hpmpData.hpCapacity;
};

CurPlayer.prototype.setMpLevel=function(level){
	this.mpLevel = level || 0;
	hpmpData = dataApi.hpmp.findById(this.mpLevel);
	this.mpSpeed = hpmpData.mpSpeed;
	this.mpCapacity = hpmpData.mpCapacity;
};

CurPlayer.prototype.enableAI = function(isEnable) {
	if (!isEnable) {
		this.targetAI=null;
	}
	this.isEnableAI=!!isEnable;
	mainPanel.enableAutoFight(this.isEnableAI);
};

CurPlayer.prototype.setTargetAI=function(entityId){
	if (!entityId) {
		this.enableAI(false);
		return;
	}
	this.targetAI=entityId;
	this.isEnableAI=true;
	mainPanel.enableAutoFight(true);
};

CurPlayer.prototype.checkSkillAvailable = function(skillId) {
	if (this.skillCoolTime[skillId] > Date.now()) {
		return false;
	}
	var fightSkill=this.fightSkills[skillId];
	if (!fightSkill || fightSkill.position<=0) {
		return false;
	}
	var skillData = fightSkill.skillData;
	if (skillData.mp > this.mp) {
		return false;
	}
	return true;
};

CurPlayer.prototype.getAvailableSkill = function() {
	var skillId = this.curSkill;
	if (skillId) {
		if (this.checkSkillAvailable(skillId))
			return skillId;
	}
	var fightSkill = null;
	// var normalSkillId = null;
	for (var key in this.fightSkills) {
		fightSkill = this.fightSkills[key];
		if (fightSkill.position > 0 && fightSkill.skillId !== this.curSkill) {
			skillId = fightSkill.skillId;
			if (this.checkSkillAvailable(skillId))
				return skillId;
		} 
		// else {
			// normalSkillId = fightSkill.skillId;
		// }
	}
	// return normalSkillId;
};

CurPlayer.prototype.showAttack = function(skillId, target) {
	var currentTime=Date.now();
	this.totalSkillCD=currentTime+800;
	this.recordSkillId = null;
	var fightSkill = this.fightSkills[skillId];
	if (!!fightSkill) {
		var skillData = fightSkill.skillData;
		mainPanel.showSkillCD(fightSkill.position, skillData.cooltime);
		this.skillCoolTime[skillId] = currentTime + skillData.cooltime * 1000;

		Character.prototype.showAttack.call(this, skillId, target);
	}
};

CurPlayer.prototype.getSelectTarget = function() {
	if (this.targetId) {
		var selectEntity = this.area.getEntity(this.targetId);
		if (selectEntity && !selectEntity.died) {
			return selectEntity;
		}
		this.targetId = null;
	}
	return null;
};

CurPlayer.prototype.getModeTarget = function() {
	var fightModeFunc = FightMode[this.fightMode];
	if (fightModeFunc) {
		target = fightModeFunc(this);
		// if (target && !target.died) {
		return target;
	}
};

CurPlayer.prototype.getAvailableTarget = function() {
	var target = this.getSelectTarget();
	if (target && !target.died) {
		return target;
	}

	target = this.getMostHater();
	if (target && !target.died) {
		return target;
	}
	var area = this.area;
	switch (area.areaKind) {
		case AreaKinds.FIGHT_AREA:
			target = area.getNearbyPlayer(this);
			if (target && !target.died) {
				return target;
			}
			break;
		case AreaKinds.NORMAL_AREA:
			target = this.getModeTarget();
			if (target) {
				return target;
			}
			break;
		case AreaKinds.DOMAIN_AREA:
			target=FightMode[FightMode.GUILDMODE](this);
			return target;
			break;
	}
	target = area.getNearbyMob(this);
	if (target && !target.died) {
		return target;
	}
};

CurPlayer.prototype.getAITargetEntity = function() {
	var target;
	target = this.getMostHater();
	if (target && !target.died) {
		return target;
	}
	var area = this.area;
	if (area.areaKind === AreaKinds.SAFE_AREA) {
		if (!bagManager.isFull()) {
			target = area.getNearbyItem(this);
			if (target && !target.died) {
				return target;
			}
		}
	}else if (area.areaKind === AreaKinds.NORMAL_AREA) {
		var fightModeFunc = FightMode[this.fightMode];
		if (fightModeFunc) {
			target = fightModeFunc(this);
			if (target && !target.died) {
				return target;
			}
		}
		if (!bagManager.isFull()) {
			target = area.getNearbyItem(this);
			if (target && !target.died) {
				return target;
			}
		}
	} else if(area.areaKind === AreaKinds.DOMAIN_AREA){
		if (!bagManager.isFull()) {
			target = area.getNearbyItem(this);
			if (target && !target.died) {
				return target;
			}
		}
		target = FightMode[FightMode.GUILDMODE](this);
		if (target && !target.died) {
			return target;
		}
	} else if(area.areaKind === AreaKinds.FIGHT_AREA){
		target =area.getNearbyPlayer(this)
		if (target && !target.died) {
			return target;
		}
		return;
	}
	target = area.getNearbyMob(this);
	if (target && !target.died) {
		return target;
	}
};

//250*250=62500
CurPlayer.prototype.buttonFire=function(skillId,position){
//	var area = this.area;
	var area = app.getCurArea();
	if (!area || !area.isRunning || this.died) {
		return;
	}
	if (area.areaKind === AreaKinds.SAFE_AREA) {
		var selectEntity, deltaX, deltaY;
		while (true) {
			if (this.targetId) {
				selectEntity = area.getEntity(this.targetId);
				if (selectEntity && !selectEntity.died) {
					// deltaX = this.x - selectEntity.x;
					// deltaY = this.y - selectEntity.y;
					// if (deltaX * deltaX + deltaY * deltaY < 62500) {
					// 	break;
					// }
					break;
				}
				this.targetId = null;
				this.targetAI = null;
			}
			break;
		}

		if (!this.isControl() && position === 1 && !this.targetId) {
			selectEntity = area.getNpcByDistance(this, 200);
			if (selectEntity) {
				this.targetAI = selectEntity.entityId;
				return;
			}

			if (!bagManager.isFull()) {
				selectEntity = area.getItemByDistance(this, 280);
				if (selectEntity) {
					this.targetAI = selectEntity.entityId;
					return;
				}
			}
		}
	}

	this.useSkill(skillId);
};

CurPlayer.prototype.useSkill = function(skillId, isRecord) {
	// if (!skillId || this._curActionType === Entity.kMActionHurt)
		// return;
	if (!skillId)
		return;

	this.curSkill=skillId;
	var currentTime=Date.now();
	if (currentTime<this.totalSkillCD) {
		return;
	}
	this.map.hideClickEffect();
	var skillCoolTime = this.skillCoolTime[skillId];
	if (!skillCoolTime && skillCoolTime !== 0) {
		skillCoolTime = 0;
		this.skillCoolTime[skillId] = 0;
	}
	if (skillCoolTime > currentTime) {
		cc.log("cd时间未到达============>>");
		return;
	}

	var skillData = this.fightSkills[skillId].skillData;
	if (skillData.mp > this.mp) {
		quickLogManager.pushLog("蓝血不足，技能使用失败！");
		return;
	}

	var target = this.getAvailableTarget();
	if (!target) {
		quickLogManager.pushLog("当前没有目标！");
		return;
	}

	this.multiAreaTarget=null;
	if (isRecord) {
		this.recordSkillId = null;
	} else if (!this.isControl()) {
		// this.recordSkillId = null;
		this.moving = false;
		this._curActionType = Entity.kMActionIdle;
		this.recordSkillId = skillId;
	}

	if (this.isControl()) {
		this.useSkillAttack(skillId,target);
	}else{
		this.targetAI=target.entityId;
	}
};

CurPlayer.prototype.useSkillAttack=function(skillId,target){
	this.selectTarget(target);
	playerHandler.useSkillAttack(skillId, target.entityId);
};

CurPlayer.prototype.checkTransport = function() {
	var transportEntitys = this.area.transportEntitys;
	var transportEntity, deltaX, deltaY;
	for (var key in transportEntitys) {
		transportEntity = transportEntitys[key];
		deltaX = transportEntity.x - this.x;
		deltaY = transportEntity.y - this.y;
		if (deltaX * deltaX + deltaY * deltaY < 8100) {
			cc.log("catch it=======>>"+transportEntity.targetArea);
			npcHandler.changeArea(transportEntity.targetArea,transportEntity.kindId);
			return;
		}
	}
};

CurPlayer.prototype.simpleStopMove = function() {
	this._stopMove();
	this.map.hideClickEffect();
};

CurPlayer.prototype.stopMove = function(isAttack) {
	this._stopMove();
	this.map.hideClickEffect();
	if (layerManager.isRunPanel(cb.kMMapPanelId)) {
		var curPanel = layerManager.curPanel;
		curPanel.stopPlayer(this);
	}

	 if (this.multiAreaTarget) {
	 	if (this.multiAreaTarget.nextAreaId) {
	 		this.checkTransport();
	 	} else {
	 		var deltaX = this.multiAreaTarget.x - this.x;
	 		var deltaY = this.multiAreaTarget.y - this.y;
	 		if (deltaX * deltaX + deltaY * deltaY < 9000) {
	 			setTimeout(function() {
    	 			taskManager.doTask();
    	 		},10);
	 			
	 			this.multiAreaTarget = null;
	 		} else {
	 			if (!this.moveToTarget(this.multiAreaTarget.x, this.multiAreaTarget.y)) {
	 				this.multiAreaTarget = null;
	 				// quickLogManager.pushLog("无法再次移动，寻路失败！");
	 			}
	 		}
	 	}
	 	return;
	 }

	if (!isAttack) {
		if (this.recordSkillId) {
			this.useSkill(this.recordSkillId, true);
			return;
		}
		this.checkTransport();
	}
};

 var areaPaths = [
 	[1001, 2001],
 	[1001, 2002],
 	[2001, 1001],
 	[2002, 1001],
 	[2001, 1001,2002],
 	[2002, 1001,2001],
 ];

CurPlayer.prototype.setMultiAreaMove = function(targetAreaId, targetX, targetY) {
	var curAreaId = this.area.areaId;
	var areaIds = [];
	if (curAreaId === targetAreaId) {
		areaIds.push(targetAreaId);
	} else {
		var areaPath;
		for (var i = 0; i < areaPaths.length; i++) {
			areaPath = areaPaths[i];
			if (areaPath[0] === curAreaId) {
				if (areaPath[areaPath.length - 1] === targetAreaId) {
					for (var j = 0; j < areaPath.length; j++) {
						areaIds.push(areaPath[j]);
					}
					break;
				}
			}
		}
	}
	CurPlayer.multiAreaMoveData = {
		areaIds: areaIds,
		targetX: targetX,
		targetY: targetY
	};
	this.multiAreaTarget = null;
	this.simpleStopMove();
	this.multiAreaMove();
};

CurPlayer.prototype.multiAreaMove = function() {
	if (!CurPlayer.multiAreaMoveData || this.died)
		return;

	var areaIds = CurPlayer.multiAreaMoveData.areaIds;
	if (areaIds.length === 0) {
		CurPlayer.multiAreaMoveData = null;
		return;
	}
	if (this.area.areaId !== areaIds[0]) {
		cc.log("ERROR:trouble error areaId is no equal");
		CurPlayer.multiAreaMoveData = null;
		return;
	}
	var multiAreaTarget;
	if (areaIds.length === 1) {
		multiAreaTarget = {
			x: CurPlayer.multiAreaMoveData.targetX,
			y: CurPlayer.multiAreaMoveData.targetY
		};
	} else {
		var areaId = areaIds.shift();
		var nextAreaId = areaIds[0];
		var transportEntity;
		var transportEntitys = this.area.transportEntitys;
		for (var key in transportEntitys) {
			transportEntity = transportEntitys[key];
			if (transportEntity.targetArea === nextAreaId) {
				multiAreaTarget = {
					nextAreaId: nextAreaId,
					x: transportEntity.x,
					y: transportEntity.y
				};
				break;
			}
		}
	}
	if (multiAreaTarget) {
		if (this.moveToTarget(multiAreaTarget.x, multiAreaTarget.y)) {
			this.multiAreaTarget = multiAreaTarget;
		} else {
			CurPlayer.multiAreaMoveData = null;
		}
	} else {
		CurPlayer.multiAreaMoveData = null;
	}
};

CurPlayer.prototype.clMoveToTarget = function(targetX, targetY) {
	if (!this.area.isRunning || this.died) {
		return;
	}
	this.enableAI(false);
	if (this._curActionType === Entity.kMActionAttack) {
		cc.log("clMoveToTarget  It is attacking,stop move!");
		return;
	}
	this.recordSkillId = null;
	this.multiAreaTarget = null;
	if (this.moveToTarget(targetX, targetY)) {
		this.map.showClickEffect(targetX, targetY);
	} 
	// else {
	// 	quickLogManager.pushLog("遇到障碍，移动失败！");
	// }
};

CurPlayer.prototype.clMovingTo = function(targetX, targetY) {
	// cc.log("clMovingTo start========>>",targetX, targetY);
	if (!this.area.isRunning || this.died) {
		cc.log("clMovingTo !this.area.isRunning || this.died========>>");
		return;
	}
	this.enableAI(false);
	this.recordSkillId = null;
	this.multiAreaTarget = null;
	this.map.hideClickEffect();

	if (Math.abs(this.lastCLTargetX-targetX)<2 && Math.abs(this.lastCLTargetY-targetY)<2) {
		return;
	}
	this.lastCLTargetX=targetX;
	this.lastCLTargetY=targetY;
	this.movingTo(targetX, targetY);
	// cc.log("clMovingTo end========>>",targetX, targetY);
};

CurPlayer.prototype.isControl=function(){
	return mainPanel.isControl();
}

CurPlayer.prototype.clStopMove=function(){
	this.stopMove();
	playerHandler.stop(Math.floor(this.x),Math.floor(this.y));
};

CurPlayer.prototype.moveToTarget = function(targetX, targetY) {
	if (this._curActionType === Entity.kMActionAttack) {
		// cc.log("ERROR:moveToTarget  It is attacking,can't move!");
		return;
	}

	targetX = Math.floor(targetX);
	targetY = Math.floor(targetY);
	var startX = Math.floor(this.x);
	var startY = Math.floor(this.y);

	if (targetX === startX && targetY === startY) {
		// cc.log("ERROR:movingTo the same place!");
		return false;
	}

	if (Math.abs(targetX-startX)<5 && Math.abs(targetY-startY)<5) {
		this._movingTo(targetX, targetY);
		return;
	}

	var paths = this.map.findPath(startX, startY, targetX, targetY);
	if (!paths) {
		// quickLogManager.pushLog("寻路失败，不能移动！");
		// cc.log("ERROR:fail to findPath!");
		return false;
	}

	playerHandler.move(paths);
	this.cancelPick();
	return paths;
};

CurPlayer.prototype.movingTo = function(targetX, targetY) {
	if (this._curActionType === Entity.kMActionAttack) {
		cc.log("ERROR:movingTo  It is attacking,can't move!");
		return;
	}

	if (this._curActionType === Entity.kMActionDead) {
		return;
	}
	if (Math.abs(targetX-this.x)<5 && Math.abs(targetY-this.y)<5) {
		return;
	}
	targetX = Math.floor(targetX);
	targetY = Math.floor(targetY);

	this._movingTo(targetX, targetY);
	var point =[targetX, targetY];
	playerHandler.clMove(point);
	this.cancelPick();
	return true;
};

CurPlayer.prototype.selectTarget = function(entity) {
	if (this.targetId !== entity.entityId) {
		this.unselectTarget();
		this.targetId = entity.entityId;
	}
	entity.showSelectEffect();
	mainPanel.showCharacter(entity, true);

	if (entity.type === EntityType.MOB) {
		entity.randomWord();
	}
};

CurPlayer.prototype.unselectTarget = function() {
	if (this.targetId) {
		var selectEntity = this.area.getEntity(this.targetId);
		if (!!selectEntity) {
			selectEntity.removeSelectEffect();
			mainPanel.showCharacter(selectEntity, false);
		}
	}
	this.targetId = null;
};

CurPlayer.prototype.touchCharacter = function(targetId) {
	if (this.entityId === targetId)
		return;

	var areaId = app.areaId;
	var playerId = app.playerId;
	var area = this.area;
	var entity = area.getEntity(targetId);
	 
	if (entity.type === EntityType.PLAYER) {
		this.selectTarget(entity);
		return;
	} else if (entity.type === EntityType.MOB) {
		if (entity.died) return;
		this.selectTarget(entity);
		return;
	}
	this.unselectTarget();

	if (entity.type === EntityType.NPC) {
		this.targetAI=targetId;

	} else if (entity.type === EntityType.ITEM 
		|| entity.type === EntityType.EQUIPMENT) {

		if(bagManager.isFull()){
			quickLogManager.pushLog("背包已满，不能再拾取！");
			return;
		}
		this.targetAI=targetId;
	}
};

CurPlayer.prototype.talkNPC=function(entityId){
	var area = app.getCurArea();
	var npc = area.getEntity(entityId);
	this.setDirectionByPoint(npc.x, npc.y);
	this.standAction();

	if (npc.kindId>50000) {
		npc.openPanel();
		return;
	}
	npcHandler.npcTalk(entityId);
};

CurPlayer.prototype.pickItem=function(target){
	if (target.type === EntityType.EQUIPMENT) {
		equipHandler.pickItem(target.entityId);
		var worldPoint = target.curNode.convertToWorldSpace(cc.p(0, 0));
		this.pickItemsQueue.push({
			kindId: target.kindId,
			x:worldPoint.x,
			y:worldPoint.y
		});
	} else {
		this.setDirectionByPoint(target.x, target.y);
		if (this.area.areaKind === AreaKinds.DOMAIN_AREA) {
			if (!this.guildId) {
				quickLogManager.pushLog("没有帮派不能拾取。",5);
				return;
			}
			if (this.area.occupyGuildId!==this.guildId) {
				quickLogManager.pushLog("您所在帮派未占领该地盘，不能拾取。",5);
				return;
			}
		}

		equipHandler.pickTarget(target.entityId);
		this.pickItemId=target.entityId;
		target.showPickState();
	}
};

CurPlayer.prototype.cancelPick=function(){
	if (this.pickItemId) {
		var entity = this.area.getEntity(this.pickItemId);
		if (entity) {
			entity.hidePickState();
			equipHandler.cancelPick(this.pickItemId);
		}
	}
};

CurPlayer.prototype.addExperience = function(exp) {
	if (!exp) return;
	quickLogManager.pushScrollLog("经验 +" + exp);
	this.setExperience(this.experience + exp);
};

Character.prototype.setExperience = function(exp) {
	this.experience = exp || 0;
	// var nextLevelExp = this.nextLevelExp || 1;
	// var percent = Math.floor(this.experience * 100 / nextLevelExp);
	mainPanel.setExp(this.experience,this.nextLevelExp || 1);
};

CurPlayer.prototype.upgrade = function(data) {
	this.level=data.level;
	var experienceData = dataApi.experience.findById(this.level + 1);
	if (experienceData) {
		this.nextLevelExp = experienceData.exp;
	} else {
		this.nextLevelExp = 9999999999;
	}
	this.maxHp = data.maxHp || 1;
  	this.maxMp = data.maxMp || 1;
  	this.setHp(data.hp);
	this.setMp(data.mp);
	this.setExperience(data.experience);

    mainPanel.showPlayer(this);
	this.upgradeEffect();
};

CurPlayer.prototype.createNumberNodes = function(damage) {
	if (!damage) return;
	// var contentNode = cb.CommonLib.createMobHurtNumber(damage);
	var contentNode = cb.CommonLib.createNormalHurtNumber(damage);
	this.map.entityNode.addChild(contentNode);
	var x = this.x - 20 + Math.random() * 40;
	var y = this.y - 20 + Math.random() * 40 + 80;
	contentNode.setPosition(x, y);
};

CurPlayer.prototype.addCaoCoin = function(deltaCaoCoin) {
	this.caoCoin += deltaCaoCoin;
	if (mainPanel) {
		mainPanel.updateCaoCoin();
	}
};

CurPlayer.prototype.checkCaoCoin = function(caoCoin) {
	if (this.caoCoin>=caoCoin) {
		return true;
	}
	quickLogManager.pushLog("金额不足，操作失败！", 4);
};

CurPlayer.prototype.setHp = function(hp) {
	if (this.hp===hp) 
		return;

	this.hp = hp || 0;
	var maxHp = this.maxHp || 1;
	var percent = Math.floor(this.hp * 100 / maxHp);
	if (percent < 0)
		percent = 0;

	this.hpBar.stopAllActions();
	this.hpBar.runAction(cc.ProgressTo.create(0.5, percent));
	mainPanel.setHpBar(percent, this.hp, maxHp);
};

CurPlayer.prototype.setMp = function(mp) {
	if (this.mp===mp)
		return;

	this.mp = mp || 0;
	var maxMp = this.maxMp || 1;
	var percent = Math.floor(this.mp * 100 / maxMp);
	if (percent < 0)
		percent = 0;

	mainPanel.setMpBar(percent, this.mp, maxMp);
};

CurPlayer.prototype.setDied = function(attacker) {
	if (this.died) return;

	this.setHp(0);
	this.died = true;
	this.deadAction();

	this.map.setGray(true);

	if (this.area.areaKind <= AreaKinds.NORMAL_AREA
		|| this.area.areaKind === AreaKinds.MY_BOSS_AREA) {
		var showTips = attacker ? "你被【" + attacker.name + "】爆掉菊花！是否立刻复活？" : "你被【未知者】爆掉菊花！是否立刻复活？";
		reviveLayer.showTipsBox(showTips);
		reviveLayer.callback = function(isYesOrNo) {
			playerHandler.revive(isYesOrNo);
		};
	}
};

CurPlayer.prototype.showLowBlood = function(hp) {
	if (this.died) {
		mainPanel.enableLowBlood(false);
	} else if (hp) {
		var percent = (hp || 1) / (this.maxHp || 1);
		if (percent < 0.15) {
			mainPanel.enableLowBlood(true);
		}
	}
};

CurPlayer.prototype.refreshProperty = function() {
  var entityData = this.entityData;
  var ratio=this.level * entityData.upgradeParam + 1;

  this.maxHp = Math.floor(ratio* characterData.hp);
  this.maxMp = Math.floor(ratio * characterData.mp);

  this.dodgeRate = Math.floor(ratio* characterData.dodgeRate);
  this.hitRate = Math.floor(ratio * characterData.hitRate);
  this.critValue = Math.floor(ratio * characterData.critValue);
  this.critResValue = Math.floor(ratio * characterData.critResValue);
  this.attackValue = Math.floor(ratio * characterData.attackValue);
  this.defenceValue = Math.floor(ratio * characterData.defenceValue);
  this.wreckValue = Math.floor(ratio * characterData.wreckValue);
};

CurPlayer.prototype.setTotalAttackAndDefence = function() {
  this.refreshProperty();
  var equipments = this.equipments;
  var propertyValue, equipment;
  for (var i=1;i<=6;i++) {
    equipment = equipments[i];
    if (equipment && equipment.type === EntityType.EQUIPMENT) {
      propertyValue = Math.floor(equipment.baseValue+equipment.potential*equipment.percent/100);
      switch (equipment.kind) {
        case PropertyKind.Attack:
          this.attackValue += propertyValue;
          break;
        case PropertyKind.Defend:
          this.defenceValue += propertyValue;
          break;
        case PropertyKind.Hit:
          this.hitRate += propertyValue;
          break;
        case PropertyKind.Dodge:
          this.dodgeRate += propertyValue;
          break;
        case PropertyKind.Wreck:
          this.wreckValue += propertyValue;
          break;
        case PropertyKind.Crit:
          this.critValue += propertyValue;
          break;
        case PropertyKind.Rescrit:
          this.critResValue += propertyValue;
          break;
        case PropertyKind.Hp:
          this.maxHp += propertyValue;
          break;
        case PropertyKind.Mp:
          this.maxMp += propertyValue;
          break;
      }
    }
  }
};


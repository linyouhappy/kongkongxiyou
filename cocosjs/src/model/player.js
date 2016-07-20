var Player = function(opts) {
	this.type = EntityType.PLAYER;

	if (opts.type !== this.type) {
		cc.error("ERROR:Player opts.kindId=" + opts.kindId);
	}

	this.id = opts.id;
	this.level = opts.level || 1;

	// this.target = null;
	var entityData = dataApi.character.findById(opts.kindId);
	if (!entityData) {
		cc.log("ERROR:entityData==null opts.kindId=" + opts.kindId);
	}
	// opts.skinId=50001;
	if (!!opts.skinId) {
		this.skinId = opts.skinId;
	} else {
		this.skinId = entityData.skinId || 10001;
	}
	this.entityData = entityData;
	this.weaponId = opts.weaponId || 0;

	this.vip = opts.vip || 0;
	// this.vip =1;
	// this.guildId=opts.guildId;
	// this.redPoint=opts.redPoint || 0;

	this.width = 60;
	this.height = 100;
	this.offsetX = -this.width / 2;
	this.offsetY = 0;
	Character.call(this, opts);

	if (this.kindId === 10001) {
    	this.jobId = PlayerJob.MANJOB;
    } else {
    	this.jobId = PlayerJob.WOMANJOB;
    }

	this.maxHp = opts.maxHp || 1;
  	this.maxMp = opts.maxMp || 1;
  	this.hp = opts.hp || 0;
  	
  	this.initNameLabel();
  	this.initHpBar();
	if (this.isCurPlayer) {
		var percent = Math.floor(this.hp * 100 / this.maxHp);
		mainPanel.setHpBar(percent, this.hp, this.maxHp);

		this.mp = -1;
		this.setMp(opts.mp);

		this.setNameLabelColor(consts.COLOR_ORANGEGOLD);
	}
};

Player.prototype = Object.create(Character.prototype);

Player.prototype.initNameLabel = function() {
  if (this.name && !this.nameLabel) {
    // var nameLabel = cc.Label.createWithSystemFont(this.name, "Arial", 22);
    var nameLabel = cc.Label.createWithSystemFont(this.name+" "+this.level+"级", "Arial", 22);
    formula.enableOutline(nameLabel);
    nameLabel.setPosition(0,20);
    this.infoNode.addChild(nameLabel);
    this.nameLabel = nameLabel;

    if (this.vip) {
    	var spriteFrame=cc.spriteFrameCache.getSpriteFrame("general_headvip_"+this.vip+".png");
    	if (spriteFrame) {
    		var vipSprite = new cc.Sprite(spriteFrame);
    		vipSprite.setAnchorPoint(cc.p(1,0.5));
    		var contentSize=nameLabel.getContentSize();
    		vipSprite.setPosition(0,contentSize.height/2);
    		nameLabel.addChild(vipSprite);
    	}else{
    		cc.log("ERROR:vipSprite is no exist vip=",this.vip);
    	}
    }

  }
};

Player.prototype.setGuildId=function(guildId){
	this.guildId = guildId;
	if (guildId) {
		var guildInfo = guildManager.getGuildInfoByGuildId(this.guildId, this.id);
		if (guildInfo && guildInfo.guildId === this.guildId) {
			this.showGuildName(guildInfo.guildName);
		}
	}else{
		this.showGuildName();
	}
};

Player.prototype.setTeamId=function(teamId,isCaptain){
	if (teamId) {
		this.teamId = teamId;
		this.isCaptain = isCaptain;
		var team = teamManager.getTeamByTeamId(this.teamId, this.id);
		if (team && team.teamId === this.teamId) {
			this.showTeamMemberFlag(true, team.teamName);
		}
	}
};

Player.prototype.setWeapon = function(equipment) {
	if (equipment) {
		if (this.kindId === 10001) {
			this.weaponId = 11001;
		} else if (this.kindId === 10002) {
			this.weaponId = 11002;
		}
	} else {
		this.weaponId = 0;
	}
	this._entitySprite.setWeaponId(this.weaponId);
	this._entitySprite.enableSkillEffect(!!this.weaponId);
};

Player.prototype.initDecorate = function() {
  var skinIdData=dataApi.skinId.findById(this.skinId);
  this.infoNode.setPosition(0,skinIdData.infoY);

  // var entitySprite = cb.EntitySprite.create(this.skinId);
  var entitySprite = cb.EntitySpriteManger.getInstance().createEntitySprite(this.skinId,this.type);
  // var entitySprite = cb.EntitySprite.create(50005);
  this.curNode.addChild(entitySprite);
  this._entitySprite = entitySprite;
  entitySprite.setPosition(0, skinIdData.offsetY);

  if (this.weaponId) {
    entitySprite.setWeaponId(this.weaponId);
    entitySprite.enableSkillEffect(true);
  }else{
  	entitySprite.enableSkillEffect(false);
  }
  var self = this;
  entitySprite.addEventListener(function(actionType) {
    switch (actionType) {
      // case Entity.kMActionDead:
        // break;
      case Entity.kMActionAttack:
      case Entity.kMActionMagic:
      case Entity.kMActionHurt:
        self.standAction();
    }
  });
  this.standAction();
};

Player.prototype.getCaoCoinString=function(){
	var caoCoin=this.caoCoin || 0;
    if (caoCoin>1000000000) {
        caoCoin=Math.floor(caoCoin/100000000)+")";
    }else if (caoCoin>1000000) {
        caoCoin=Math.floor(caoCoin/10000)+"(";
    }
    return caoCoin;
};

Player.prototype.upgradeEffect = function() {
	var animate = cb.CommonLib.genarelAnimate("effect/effect_upgrade.plist", "effect_upgrade_");
	var sprite = new cc.Sprite();

	var sequence = cc.Sequence.create(
		animate,
		cc.RemoveSelf.create()
	);
	sprite.runAction(sequence);
	sprite.setPosition(0, 130);
	sprite.setScale(1.2);
	this.curNode.addChild(sprite);

	soundManager.playEffectSound("sound/ui/role_upgrade.mp3");
};

Player.prototype.showChatInfo = function(messages) {
	// cc.log("Player.showChatInfo=======>>>");
	var richTextBox=this.richTextBox;
	richTextBox.clearAll();
	var message,blockLists,block,blockIndex,index;
	for (var msgIndex = 0; msgIndex < messages.length; msgIndex++) {
		message = messages[msgIndex];
		if (message === null)
			return;

		blockLists = message.m_blockLists;
		blockIndex = 0;
		for (index = 0; index < blockLists.length; index++) {
			block = blockLists[index];
//			if (block.m_blockType === chat.blockTypeLabel) {
			if (block.m_text === ":" || block.m_text === "说:") {
				index++;
				blockIndex=1;
				break;
			}
		}
		if (blockIndex>0) {
			blockIndex=index;
		}

		for (; blockIndex < blockLists.length; blockIndex++) {
			block = blockLists[blockIndex];
			if (block.m_blockType === chat.blockTypeLabel) {
				richTextBox.setTextColor(block.m_color);
				richTextBox.appendRichText(block.m_text, chat.kTextStyleNormal, block.m_nodeId, block.m_eventId);
			} else if (block.m_blockType === chat.blockTypeBracketHerfLabel) {
				richTextBox.setTextColor(block.m_color);
				richTextBox.appendRichText(block.m_text, chat.kTextStyleBracketHerf, block.m_nodeId, block.m_eventId);
			} else if (block.m_blockType === chat.blockTypeHerfLabel) {
				richTextBox.setTextColor(block.m_color);
				richTextBox.appendRichText(block.m_text, chat.kTextStyleHerf, block.m_nodeId, block.m_eventId);
			} else if (block.m_blockType === chat.blockTypeSprite) {
				richTextBox.appendRichSprite(block.m_spriteName, block.m_nodeId, block.m_eventId);
			} else if (block.m_blockType === chat.blockTypeAnimate) {
				richTextBox.appendRichAnimate(block.m_spriteName, block.m_nodeId, block.m_eventId);
			}
		}
	}
	richTextBox.layoutChildren();
	var richTextSizeHeight = richTextBox.getContentSize().height+20;
	this.frameSprite.setContentSize(cc.size(220, richTextSizeHeight));

	cc.log("Player.showChatInfo=======<<<");
	var self=this;
	var onActionCallback1 = function(sender) {
		self.richTextBox.setVisible(false);
		self.frameSprite.setVisible(false);
	};
	sequence = cc.Sequence.create(
		cc.DelayTime.create(10),
		cc.CallFunc.create(onActionCallback1)
	);
	// this.frameSprite.stopAllActions();
	this.frameSprite.runAction(sequence);
};

Player.prototype.pushMessage = function(message,isForce) {
	if (!this.richTextBox) {
		this.initEditView();
	}else{
		this.richTextBox.setVisible(true);
		this.frameSprite.setVisible(true);
		this.frameSprite.stopAllActions();
	}
	if (isForce) {
		this.messages=null;
		this.showChatInfo([message]);
		return;
	}

	var curTime=Date.now();
	if (!this.messages) {
		this.messages=[];
	}else{
		while(this.messages.length>0){
			var msg=this.messages[0];
			if (curTime<msg.lastTime) {
				break;
			}
			this.messages.shift();
		}
	}
	while (this.messages.length >3) {
		this.messages.shift();
	}
	message.lastTime=curTime+10000;
	this.messages.push(message);
	this.showChatInfo(this.messages);
};

Player.prototype.isHate = function(entityId) {
	return this.haters && this.haters[entityId];
};

Player.prototype.increaseHateFor = function(entityId, points) {
	points = points || 1;
	if (!this.haters) {
		this.haters={};
		this.haters[entityId] = points;
		return;
	}
	if (this.haters[entityId]) {
		this.haters[entityId] += points;
	} else {
		this.haters[entityId] = points;
	}
};

Player.prototype.getMostHater = function() {
	if (!this.haters) {
		return;
	}
	var entityId = 0,
		hate = 0;
	for (var id in this.haters) {
		if (this.haters[id] > hate) {
			entityId = Number(id);
			hate = this.haters[id];
		}
	}
	if (entityId <= 0) {
		return;
	}
	var haterEntity = this.area.getEntity(entityId);
	if (!haterEntity || haterEntity.died) {
		this.forgetHater(entityId);
		return null;
	}
	return haterEntity;
};

Player.prototype.forgetHater = function(entityId) {
	if (this.haters && this.haters[entityId]) {
		delete this.haters[entityId];
		if (this.targetAI === entityId) {
			this.targetAI = null;
		}
	}
};

Player.prototype.setDied = function(attacker) {
  this.setHp(0);
  this.died = true;
  this.deadAction();
  this.removeSelectEffect();
};

Player.prototype.setRevive = function(reviveData) {
	this.died = false;
	this.setPosition(reviveData.x, reviveData.y);
	this.setHp(reviveData.hp);
	this._entitySprite.reset();
	this.standAction();

	if (this.isCurPlayer) {
		reviveLayer.closeTipsBox();
		this.map.setGray(false);
	}
};

Entity.prototype.setLabelPosition=function(){
	var positionY=45;
	if (this.guildLabel) {
		this.guildLabel.setPosition(0,positionY);
		positionY+=24;
	}
	if (this.teamLabel) {
		this.teamLabel.setPosition(0,positionY);
	}
};

Entity.prototype.showTeamMemberFlag = function(isShow, teamName) {
	if (isShow) {
		if (this.teamLabel) {
			this.showTeamMemberFlag(false);
		}
		var teamLabel = cc.Label.createWithSystemFont(teamName, "Arial", 20);
		formula.enableOutline(teamLabel);
		teamLabel.setColor(consts.COLOR_CYANBLUE);
		this.infoNode.addChild(teamLabel);
		this.teamLabel = teamLabel;
	} else {
		if (this.teamLabel) {
			this.infoNode.removeChild(this.teamLabel);
			this.teamLabel = null;
		}
	}
	this.setLabelPosition();
};

Entity.prototype.showGuildName = function(guildName) {
	if (guildName && guildName.length > 0) {
		if (this.guildLabel) {
			this.guildLabel.setString(guildName);
		} else {
			var guildLabel = cc.Label.createWithSystemFont(guildName, "Arial", 21);
			formula.enableOutline(guildLabel);
			guildLabel.setColor(consts.COLOR_BLUE);
			this.infoNode.addChild(guildLabel);
			this.guildLabel = guildLabel;
		}
	} else {
		if (this.guildLabel) {
			this.infoNode.removeChild(this.guildLabel);
			this.guildLabel = null;
		}
	}
	this.setLabelPosition();
};


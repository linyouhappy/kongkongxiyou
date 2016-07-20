var Character = function(opts) {
  this.name = opts.name || this.entityData.name;
  // Speeds
  this.walkSpeed = this.entityData.walkSpeed
  //status
  this.died = false;
  this.tileW = opts.map.tileW || 20;
  this.tileH = opts.map.tileH || 20;
  // this.weightMap = opts.map.weightMap;
  this.area = opts.area;

  Entity.call(this, opts);
  // this.maxHp = opts.maxHp || 1;
  // this.hp = opts.hp || 0;
  // this.maxMp = opts.maxMp || 1;
  // this.mp = opts.mp || 0;
};

Character.kMStatusNone = 0;
Character.kMStatusIdle = 1;
Character.kMStatusWalk = 2;
Character.kMStatusRun = 3;
Character.kMStatusAttack = 4;
Character.kMStatusDead = 5;

Character.prototype = Object.create(Entity.prototype);
Character.prototype.showAttack = function(skillId, target) {
  this.moving=false;
  this._curActionType = Entity.kMActionIdle;
  // this.stopMove();
  var skillEffect = dataApi.skill_effect.findById(skillId);
  if (!!skillEffect) {
    // if (skillEffect.attackType === SkillType.Attack) {
      this.attackAction(skillEffect.attackType,skillEffect.delayPerUnit);
    // } else if (skillEffect.attackType === SkillType.Magic) {
    //   this.magicAction();
    // }
    this._entitySprite.showAttackEffect(skillEffect.aEffectId, skillEffect.aDelay,skillEffect.aY,skillEffect.aDelayPerUnit);

    if (skillEffect.bulletId && target && this.area) {
      var bullet = new Bullet({
        bulletId: skillEffect.bulletId,
        attacker: this,
        target: target
      });
      this.area.addBullet(bullet);
    }
  }
  if (skillEffect.soundId) {
    soundManager.playerSkillEffect(skillEffect.soundId);
  }
};

Character.prototype.showAttacked = function(skillId) {
  this.moving = false;
  // if (this.type === EntityType.MOB) {
  //   if (this._curActionType === Entity.kMActionAttack) {
  //     return;
  //   }
  // } else if (this.type === EntityType.PLAYER) {
  //   if (this._curActionType !== Entity.kMActionIdle) {
  //     return;
  //   }
  // }

  var skillEffect = dataApi.skill_effect.findById(skillId);
  if (skillEffect) {
    var self = this;
    var onActionCallback = function() {
      // if (self.type === EntityType.MOB) {
      //   self.hurtAction();
      // }-self.infoY+
      if (skillEffect && skillEffect.tEffectId) {
        self._entitySprite.showHitEffect(skillEffect.tEffectId, 0, skillEffect.tY, skillEffect.tDelayPerUnit);
      }
    };
    var sequence = cc.Sequence.create(
      cc.DelayTime.create(skillEffect.tDelay),
      cc.CallFunc.create(onActionCallback)
    );
    this.curNode.runAction(sequence);
  }
  // } else {
    // if (this.type === EntityType.PLAYER) {
    //   this.hurtAction();
    // }
  // }
};

Character.prototype.setDied = function() {
};

Character.prototype.randomMove=function(){
  if (this.getActionType() === Entity.kMActionIdle) {
    this.moveToTarget(
      this.x + (Math.random() > 0.5 ? 150 : -150), 
      this.y + (Math.random() > 0.5 ? 150 : -150)
      );
  }
};

Character.prototype.movePath = function(path) {
  this._movePath(path);
};

Character.prototype.stopMove = function() {
  this._stopMove();
};

Character.prototype.isMove = function() {
  return this.moving;
};

Character.prototype.setPosition = function(x, y) {
  this.x = x;
  this.y = y;
  // cc.log("areaId="+this.area.areaId+",entityId="+this.entityId+",type="+this.type+",kindId="+this.kindId);
  this.curNode.setPosition(x, y);
  this.curNode.setLocalZOrder(-y);
  if (this.shadowSprite) {
    this.shadowSprite.setPosition(x, y);
  }
  if (this.isCurPlayer) {
    this.map.centerTo(x, y);

    if (layerManager.isRunPanel(cb.kMMapPanelId)) {
      var curPanel = layerManager.curPanel;
      curPanel.updatePlayer(this);
    }
  }
  var tileX = Math.floor(x / this.tileW);
  var tileY = Math.floor(y / this.tileH);
  if (this.tileX !== tileX || this.tileY !== tileY) {
    this.tileX = tileX;
    this.tileY = tileY;
    if (this.map.checkOpacityMask(tileX,tileY)) {
      this._entitySprite.setOpacity(128);
      if (this.shadowSprite) {
        this.shadowSprite.setOpacity(128);
      }
    } else {
      this._entitySprite.setOpacity(255);
      if (this.shadowSprite) {
        this.shadowSprite.setOpacity(255);
      }
    }
  }

  if (this.isSelected) {
    this.map.showSelectEffect(this.x,this.y,this.entityId);
  }
}

Character.prototype.initDecorate = function() {
  var skinIdData=dataApi.skinId.findById(this.skinId);
  if (skinIdData.isSimple) {
    this.isSimpleSkin=true;
  }
  this.infoNode.setPosition(0,skinIdData.infoY);
  this.infoY=skinIdData.infoY;

  // var entitySprite = cb.EntitySprite.create(this.skinId);
  var entitySprite = cb.EntitySpriteManger.getInstance().createEntitySprite(this.skinId,this.type);

  this.curNode.addChild(entitySprite);
  this._entitySprite = entitySprite;
  entitySprite.setPosition(0, skinIdData.offsetY);

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

// Entity.kMActionIdle = 1;
// Entity.kMActionWalk = 2;
// Entity.kMActionRun = 3;
// Entity.kMActionAttack = 4;
// Entity.kMActionDead = 5;
// Entity.kMActionHurt = 6;
// Entity.kMActionMagic = 7;

Character.prototype.reduceHp = function(hp,deltaHp, isCrit) {
  if (!deltaHp) {
    cc.log("Hp no change");
    return;
  }
  if (!this.hpBar) {
    this.initNameLabel();
    this.initHpBar();
  }

  var self = this;
  var onActionCallback = function() {
    self.setHp(hp);
    if (isCrit) {
      self.createCritNumberNodes(deltaHp);
    } else {
      self.createNumberNodes(deltaHp);
    }
  };
  var sequence = cc.Sequence.create(
    cc.DelayTime.create(0.5),
    cc.CallFunc.create(onActionCallback)
  );
  this.curNode.runAction(sequence);
  // if (isCrit) {
  //   setTimeout(function() {
  //     self.createCritNumberNodes(deltaHp);
  //   }, 500);
  // } else {
  //   setTimeout(function() {
  //     self.createNumberNodes(deltaHp);
  //   }, 500);
  // }
};

Character.prototype.setHp = function(hp) {
  if (!this.hpBar) {
    this.initNameLabel();
    this.initHpBar();
  }
  if (this.hp===hp)
    return;

  this.hp = hp || 0;
  if (this.hpBar) {
    var maxHp = this.maxHp || 1;
    var percent = Math.floor(this.hp * 100 / maxHp);
    if (percent < 0)
      percent = 0;
    // this.hpBar.setPercentage(percent);
    this.hpBar.stopAllActions();
    this.hpBar.runAction(cc.ProgressTo.create(0.3,percent));
  }
  if (this.isSelected) {
    mainPanel.setCharacterHp(this);
  }
};

Character.prototype.setMaxHp = function(maxHp) {
  this.maxHp = maxHp || 0;
};

Character.prototype.changeMp = function(mp) {
  mp = mp || this.mp;

  // var deltaMp = mp - this.mp;
  // if (deltaMp === 0) {
  //   cc.log("Mp no change");
  //   return;
  // } else if (deltaMp < 0) {
  //   // cc.log("Mp reduce:", deltaMp);
  // } else {
  //   cc.log("Mp increase:", deltaMp);
  // }
  this.setMp(mp);
};

Character.prototype.setMp = function(mp) {
  this.mp = mp || 0;
  if (this.mpBar) {
    var maxMp = this.maxMp || 1;
    var percent = Math.floor(this.mp * 100 / maxMp);
    if (percent < 0)
      percent = 0;
    this.mpBar.setPercentage(percent);
  }
};

Character.prototype.setMaxMp = function(maxMp) {
  this.maxMp = maxMp || 0;
};

Character.prototype.isControl=function(){
};

Character.prototype.movingTo=function(targetX, targetY){
  this._movingTo(targetX, targetY);
};

Character.prototype.updateHp = function(hp,dHp) {
  hp=hp || 0;
  if (hp !== this.hp) {
    this.setHp(hp);
    this.createAddHpNumberNodes(dHp);
  }
};

Character.prototype.initEditView = function() {
  var frameSprite = cc.Scale9Sprite.createWithSpriteFrameName("chat_panel_bg.png");
  frameSprite.setContentSize(cc.size(220, 120));
  frameSprite.setOpacity(130);
  frameSprite.setAnchorPoint(cc.p(0,0));
  frameSprite.setPosition(-110,140);
  this.curNode.addChild(frameSprite);
  this.frameSprite=frameSprite;

  var richTextBox = cb.CCRichText.create(200, 0);
  richTextBox.setLineSpace(2);
  richTextBox.setDetailStyle("Arial", 20, consts.COLOR_WHITE);
  richTextBox.setPosition(-100,150);
  richTextBox.setBlankHeight(0);
  richTextBox.setTouchEnabled(false);

  this.curNode.addChild(richTextBox);
  this.richTextBox = richTextBox;

  frameSprite.setLocalZOrder(200);
  richTextBox.setLocalZOrder(200);
};

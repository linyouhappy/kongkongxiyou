
var Entity = function(opts) {
  this.entityId = opts.entityId;
  this.kindId = opts.kindId;

  this.scene = opts.scene;
  this.map = opts.map;
  this.x = opts.x;
  this.y = opts.y;

  this._init();
};

Entity.kMActionIdle = 1;
Entity.kMActionWalk = 2;
Entity.kMActionRun = 3;
Entity.kMActionAttack = 4;
Entity.kMActionDead = 5;
Entity.kMActionHurt = 6;
Entity.kMActionMagic = 7;

Entity.prototype._init = function() {
  var containerNode = cc.Node.create();
  this.curNode = containerNode;
  this.infoNode=cc.Node.create();
  containerNode.addChild(this.infoNode);
  // var layerColor = cc.LayerColor.create(cc.color(255, 0, 0, 255), this.width, this.height);
  // containerNode.addChild(layerColor);
  // layerColor.setPosition(this.offsetX,this.offsetY);
  
  if (this.type !== EntityType.TRANSPORT) {
    this.createShadow();
  }
  this.initDecorate();
  this.setPosition(this.x, this.y);

  // var label = cc.Label.createWithSystemFont("+", "Arial", 32);
  // label.setColor(cc.color(255, 255, 255));
  // label.setLocalZOrder(100);
  // containerNode.addChild(label);
};

Entity.prototype.initDecorate = function() {
  cc.log("ERROR:initDecorate is not created");
};

Entity.prototype.standAction = function() {
  if (!this._directionId)
    this._directionId = 5;

  this._curActionType = Entity.kMActionIdle;
  this._entitySprite.show(this.skinId, this._directionId, this._curActionType, 0.1);

  if (this.runSoundId) {
    soundManager.stopEffectSound(this.runSoundId);
    this.runSoundId = null;
  }
};

Entity.prototype.walkAction = function() {
  if (!this._directionId)
    this._directionId = 5;

  this._curActionType = Entity.kMActionWalk;
  this._entitySprite.show(this.skinId, this._directionId,this._curActionType,0.1);
};

Entity.prototype.runAction = function() {
  if (!this._directionId)
    this._directionId = 5;

  this._curActionType = Entity.kMActionRun;
  this._entitySprite.show(this.skinId, this._directionId,this._curActionType,0.1);

  if(this.isCurPlayer && !this.runSoundId){
    this.runSoundId=soundManager.playEffectSound("sound/character/10001_run.mp3",true);
  }
};

Entity.prototype.attackAction = function(attackType,delayPerUnit) {
  if (!this._directionId)
    this._directionId = 5;

  this._curActionType = Entity.kMActionAttack;
  this._entitySprite.show(this.skinId, this._directionId,attackType,delayPerUnit);
};

Entity.prototype.deadAction = function() {
  if (!this._directionId)
    this._directionId = 5;

  this._curActionType = Entity.kMActionDead;
  this._entitySprite.show(this.skinId, this._directionId,this._curActionType,0.1);
  this.curNode.setLocalZOrder(-99999);
};

Entity.prototype.hurtAction = function() {
  // if (this._curActionType !== Entity.kMActionIdle) {
  //     return;
  // }
  if (!this._directionId)
    this._directionId = 5;

  this._curActionType = Entity.kMActionHurt;
  this._entitySprite.show(this.skinId, this._directionId,this._curActionType,0.2);
};

// Entity.prototype.magicAction = function(skillId) {
//   if (!this._directionId)
//     this._directionId = 5;

//   this._curActionType = Entity.kMActionMagic;
//   this._entitySprite.show(this.skinId, this._directionId,this._curActionType,0.1);
// };

Entity.prototype.setVisible=function(enableVisible){
  enableVisible=!!enableVisible;
  this.curNode.setVisible(enableVisible);
  if (this.shadowSprite) {
    this.shadowSprite.setVisible(enableVisible);
  }
};

Entity.prototype.initNameLabel = function() {
  if (this.name && !this.nameLabel) {
    var nameLabel = cc.Label.createWithSystemFont(this.name, "Arial", 22);
    formula.enableOutline(nameLabel);
    nameLabel.setPosition(0,20);
    this.infoNode.addChild(nameLabel);
    this.nameLabel = nameLabel;
  }
};

Entity.prototype.setNameLabelColor=function(color){
  if (this.nameLabel) {
    this.nameLabel.setColor(color);
  }
};

Entity.prototype.initHpBar = function() {
  if (!this.hpBar) {
    var hpBarSprite = new cc.Sprite("#bar_entity_hp.png");
    var hpBar = cc.ProgressTimer.create(hpBarSprite);
    hpBar.setType(cc.ProgressTimer.TYPE_BAR);
    hpBar.setBarChangeRate(cc.p(1, 0));
    hpBar.setMidpoint(cc.p(0, 0.5));
    // hpBar.setPosition(cc.p(0, 120));
    this.hpBar = hpBar;

    var maxHp = this.maxHp || 1;
    var percent = Math.floor(this.hp * 100 / maxHp);
    if (percent < 0)
      percent = 0;
    hpBar.setPercentage(percent);

    var hpBarBack = new cc.Sprite("#bar_entity_bg.png");
    // hpBarBack.setPosition(cc.p(0, 120));
    this.infoNode.addChild(hpBarBack);
    this.infoNode.addChild(hpBar);
    this.hpBarBack=hpBarBack;
  }
};

Entity.prototype.initMpBar = function() {
  if (!this.mpBar) {
    var mpBarSprite = new cc.Sprite("#bar_entity_mp.png");
    var mpBar = cc.ProgressTimer.create(mpBarSprite);
    mpBar.setType(cc.ProgressTimer.TYPE_BAR);
    mpBar.setBarChangeRate(cc.p(1, 0));
    mpBar.setMidpoint(cc.p(0, 0.5));
    // mpBar.setPosition(cc.p(0, 120));
    mpBar.setPercentage(0);
    
    this.mpBar = mpBar;
    
    var mpBarBack = new cc.Sprite("#bar_entity_bg.png");
    // mpBarBack.setPosition(cc.p(0, 120));
    this.infoNode.addChild(mpBarBack);
    this.infoNode.addChild(mpBar);
    this.mpBarBack=mpBarBack;
  }
};

Entity.prototype.createShadow=function(){
  if (!this.map) {
    cc.log("ERROR:createShadow this.map is null kindId="+this.kindId);
    return;
  }
  var shadowSprite;
  if (this.isCurPlayer) {
    // shadowSprite = new cc.Sprite("#curplayer_halo.png");
    shadowSprite=new cc.Sprite();
    var animate = cb.CommonLib.genarelAnimate("effect/curplayer_select.plist", "curplayer_select_",0.2,-1);
    shadowSprite.runAction(animate);

  } else{
    shadowSprite = new cc.Sprite("#entity_shadow.png");
  }
  shadowSprite.setLocalZOrder(-999999);
  this.map.entityNode.addChild(shadowSprite);
  this.shadowSprite=shadowSprite;
};

Entity.prototype.getPosition = function() {
  return {
    x: this.x,
    y: this.y
  };
};

Entity.prototype.setPosition = function(x, y) {
  this.x = x;
  this.y = y;
  this.curNode.setPosition(x, y);
  this.curNode.setLocalZOrder(-y);
  if (this.shadowSprite) {
    this.shadowSprite.setPosition(x, y);
  }
};

Entity.prototype._movingTo = function(x, y) {
  if (this.x === x && this.y === y) {
    this.stopMove();
    return;
  }
  // if (this._curActionType === Entity.kMActionDead) {
  //   return;
  // }
  this.targetPosX = x;
  this.targetPosY = y;

  var distanceX = x - this.x;
  var distanceY = y - this.y;
  var maxDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  // var directionId = utils.calculateDirection(this.x, this.y, x, y);
  var directionId=formula.calculateDirection(distanceX, distanceY, maxDistance);
  if (!directionId) {
    return;
  }
  this.setDirectionId(directionId);

  this.runAction();
  this.moving = true;
  this.xMoveDelta = this.walkSpeed * distanceX / maxDistance;
  this.yMoveDelta = this.walkSpeed * distanceY / maxDistance;

  if (Math.abs(distanceX) > Math.abs(distanceY))
    this.move_dir = 0
  else
    this.move_dir = 1
};

Entity.prototype._stopMove = function() {
  this.moving = false;
  this.standAction();
};

Entity.prototype.onUpdate = function(interval) {
  if (!this.moving)
    return;

  var deltaX = this.xMoveDelta * interval;
  var deltaY = this.yMoveDelta * interval;

  var isArrive = false;
  if (this.move_dir == 0) {
    var realDeltaX = this.targetPosX - this.x;
    if (deltaX >= 0) {
      if (deltaX >= realDeltaX)
        isArrive = true;
    } else {
      if (deltaX <= realDeltaX)
        isArrive = true;
    }
  } else {
    var realDeltaY = this.targetPosY - this.y;
    if (deltaY >= 0) {
      if (deltaY >= realDeltaY)
        isArrive = true;
    } else {
      if (deltaY <= realDeltaY)
        isArrive = true;
    }
  }
  if (isArrive) {
    var xPos = this.targetPosX;
    var yPos = this.targetPosY;
    this.setPosition(xPos, yPos);

    if (this.isCurPlayer) {
      if (this.isControl()) {
        var nextPos = mainPanel.controlPanel.getNextMovePos();
        if (nextPos) {
          this.clMovingTo(nextPos.x, nextPos.y);
          return;
        }
      } else if (this.curPath) {
        this.pathIndex++;
        if (this._movePathStep())
          return;
      }
    } else {
      if (this.curPath) {
        this.pathIndex++;
        if (this._movePathStep())
          return;
      }
    }
    this.stopMove();
  } else {
    var xPos = this.x + deltaX;
    var yPos = this.y + deltaY;

    this.setPosition(xPos, yPos);
  }
};

Entity.prototype.setDirectionByPoint = function(targetX, targetY) {
  this.setDirectionId(utils.calculateDirection(this.x, this.y, targetX, targetY));
};

Entity.prototype.getDirectionId = function() {
  return this._directionId;
};

Entity.prototype.setDirectionId = function(directionId) {
  if (this.isSimpleSkin) {
    directionId=consts.simpleDirectIds[directionId];
  }
  directionId=directionId || 5
  this._directionId = directionId;
};

Entity.prototype.getActionType = function() {
  return this._curActionType;
};

Entity.prototype._movePath = function(path) {
  // cc.log("path move====>>");
  if (!this.curNode) {
    return;
  }
  if (!path || path.length <= 1) {
    console.error('Sprite.movePath invalid path: ' + path);
    return;
  }
  this.curPath = path;
  this.pathIndex = 1;
  // this.controlPanel = null;

  if (!this.isCurPlayer) {
    this.setPosition(path[0].x, path[0].y);
  }
  this._movePathStep();
};

Entity.prototype._movePathStep = function() {
  if (!(this.curPath && this.pathIndex < this.curPath.length)) {
    this.curPath = null;
    this.pathIndex = 0;
    // cc.log("path move finish====>>");
    return false;
  }
  if (this.pathIndex === 0) {
    this.pathIndex = 1;
  }

  var end = this.curPath[this.pathIndex];
  this._movingTo(end.x, end.y);
  return true;
};

Entity.prototype.createNumberNodes = function(damage) {
  if (!damage || !this.map) return;
  var contentNode = cb.CommonLib.createMobHurtNumber(damage);
  this.map.entityNode.addChild(contentNode);
  var x = this.x - 20 + Math.random() * 40;
  var y = this.y - 20 + Math.random() * 40 + 80;
  contentNode.setPosition(x, y);
};

Entity.prototype.createCritNumberNodes = function(damage) {
  if (!damage || !this.map) return;
  var contentNode = cb.CommonLib.createCritHurtNumber(damage);
  this.map.entityNode.addChild(contentNode);
  // contentNode.setScale(0.8);
  var x = this.x - 20 + Math.random() * 40;
  var y = this.y - 20 + Math.random() * 40 + 80;
  contentNode.setPosition(x, y);
};

Entity.prototype.createAddHpNumberNodes = function(addValue) {
  if (!addValue || !this.map) return;
  var contentNode = cb.CommonLib.createAddHpNumber(addValue);
  this.map.entityNode.addChild(contentNode);
  var x = this.x - 20 + Math.random() * 40;
  var y = this.y - 20 + Math.random() * 40 + 80;
  contentNode.setPosition(x, y);
};

Entity.prototype.createAddMpNumberNodes = function(addValue) {
  if (!addValue || !this.map) return;
  var contentNode = cb.CommonLib.createAddMpNumber(addValue);
  this.map.entityNode.addChild(contentNode);
  var x = this.x - 20 + Math.random() * 40;
  var y = this.y - 20 + Math.random() * 40 + 80;
  contentNode.setPosition(x, y);
};

Entity.prototype.showDodge = function() {
  var contentNode = cb.CommonLib.createDodge();
  this.map.entityNode.addChild(contentNode);
  var x = this.x - 20 + Math.random() * 40;
  var y = this.y - 20 + Math.random() * 40 + 80;
  contentNode.setPosition(x, y);
};

Entity.prototype.destory = function() {
  if (this.shadowSprite) {
    this.shadowSprite.removeFromParent();
    this.shadowSprite = null;
  }
  if (this._entitySprite) {
    this._entitySprite.reset();
  }
  if(this.runSoundId){
    soundManager.stopEffectSound(this.runSoundId);
    this.runSoundId=null;
  }
};

Entity.prototype.showSelectEffect = function() {
  this.isSelected=true;
  this.map.showSelectEffect(this.x,this.y,this.entityId,true);
  // if (!!this.selectSprite) {
  //   return;
  // }
  // var selectSprite = new cc.Sprite();
  // var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/character_select.plist", "character_select_");
  // var animate = cc.Animate.create(clickEfectAnim);
  // var repeatForever = cc.RepeatForever.create(animate);
  // selectSprite.runAction(repeatForever);
  // selectSprite.setLocalZOrder(-10);

  // this.curNode.addChild(selectSprite);
  // this.selectSprite = selectSprite;
};

Entity.prototype.removeSelectEffect = function() {
  if (this.isSelected) {
    this.map.hideSelectEffect();
  }
  this.isSelected=false;
  // if (!!this.curNode && !!this.selectSprite) {
  //   this.curNode.removeChild(this.selectSprite);
  //   this.selectSprite = null;
  // }
};


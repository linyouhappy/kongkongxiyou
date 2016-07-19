/**
 * Module dependencies
 */
var util = require('util');
var dataApi = require('../../util/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');

var Character = require('./character');
var fightskillDao = require('../../dao/fightskillDao');
var taskDao = require('../../dao/taskDao');
var fightskill = require('./../fightskill');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../../util/utils');
//var underscore = require('underscore');
var equipmentDao = require('../../dao/equipmentDao');
var itemDao = require('../../dao/itemDao');
var messageService = require('./../messageService');
var BagItem = require('./../bagItem');
var userDao = require('../../dao/userDao');
var myBossDao = require('../../dao/myBossDao');
var MyBoss = require('../myBoss');
//var Revive = require('./../action/revive');

var EntityType = consts.EntityType;
var TaskType = consts.TaskType;
var TaskState = consts.TaskState;
var Pick = consts.Pick;
var PropertyKind = consts.PropertyKind;
var EquipmentType=consts.EquipmentType;
var FightMode=consts.FightMode;
var PLAYER=consts.PLAYER;
var PlayerJob=consts.PlayerJob;
//var AreaKinds=consts.AreaKinds;


/**
 * Initialize a new 'Player' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */
var Player = function(opts) {
  Character.call(this, opts);
  this.id = opts.id;
  this.type = EntityType.PLAYER;
  this.userId = opts.userId;
  this.name = opts.name;
  this.skinId = opts.skinId;
  this.redPoint=opts.redPoint;

  this.vip = opts.vip;
  this.guildId = opts.guildId;

  this.caoCoin = opts.caoCoin;
  this.crystal = opts.crystal;

  this.hp = opts.hp;
  this.mp = opts.mp;

  this.jobId=formula.getPlayerJobId(this.kindId);
  this.setFightMode(opts.fightMode);

  formula.refreshProperty(this);

  this.hpCount = opts.hpCount || 0;
  this.setHpLevel(opts.hpLevel);

  this.mpCount = opts.mpCount || 0;
  this.setMpLevel(opts.mpLevel);
  this.experience = opts.experience || 0;

  var _exp = dataApi.experience.findById(this.level + 1);
  if (!!_exp) {
    this.nextLevelExp = dataApi.experience.findById(this.level + 1).exp;
  } else {
    this.nextLevelExp = 9999999999;
  }

  this.teamId = consts.TEAM.TEAM_ID_NONE;
  this.isCaptain = consts.TEAM.NO;
  this.instanceId = 0;

  this.kickTime=Date.now()+consts.KICKTIME;
};

util.inherits(Player, Character);

/**
 * Expose 'Player' constructor.
 */
module.exports = Player;

Player.prototype.setFightMode=function(fightMode){
  if (!(fightMode >= FightMode.SAFEMODE
      && fightMode <= FightMode.GUILDMODE)) {
    this.fightMode = FightMode.SAFEMODE;
  } else {
    this.fightMode = fightMode;
  }
};

Player.prototype.setBag = function(bag) {
  this.bag = bag;
  this.setEquipments(bag.equipments);
};

Player.prototype.setTasks = function(tasks) {
  this.tasks = tasks;
};

Player.prototype.setEquipments = function(equipments) {
  this.equipments = equipments;
  equipments.player=this;
  this.setTotalAttackAndDefence();

  var equipment=equipments.getEquipment(EquipmentType.Weapon);
  this.setWeapon(equipment);
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
};

Player.prototype.setHpLevel = function(hpLevel) {
  this.hpLevel = hpLevel || 0;
  var hpmpData = dataApi.hpmp.findById(this.hpLevel);
  this.hpSpeed = hpmpData.hpSpeed;
  this.hpCapacity = hpmpData.hpCapacity;
};

Player.prototype.setMpLevel = function(mpLevel) {
  this.mpLevel = mpLevel || 0;
  var hpmpData = dataApi.hpmp.findById(this.mpLevel);
  this.mpSpeed = hpmpData.mpSpeed;
  this.mpCapacity = hpmpData.mpCapacity;
};

Player.prototype.update = function() {
  var pushMsg;
  if (this.hp < this.maxHp && this.hpCount > 0) {
    this.hpCount -= this.hpSpeed;
    if (this.hpCount < 0) {
      this.hp += this.hpSpeed + this.hpCount;
      this.hpCount = 0;
    } else {
      this.hp += this.hpSpeed;
    }
    // this.hp=Math.min(this.hp,this.maxHp);
    pushMsg = {
      hp: this.hp
        // hpCount:this.hpCount
    };
  }

  if (this.mp < this.maxMp && this.mpCount > 0) {
    this.mpCount -= this.mpSpeed;
    if (this.mpCount < 0) {
      this.mp += this.mpSpeed + this.mpCount;
      this.mpCount = 0;
    } else {
      this.mp += this.mpSpeed;
    }
    // this.mp=Math.min(this.mp,this.maxMp);
    if (pushMsg) {
      pushMsg.mp = this.mp;
      // pushMsg.mpCount=this.mpCount;
    } else {
      pushMsg = {
        mp: this.mp
          // mpCount:this.mpCount
      };
    }
  }
  if (pushMsg) {
    this.onHpMp(pushMsg);
    if (pushMsg.hp) {
      this.onHp2All(this.hpSpeed);
    }
  }
};

Player.prototype.getMyBoss=function(cb){
  if (this.myBoss) {
    utils.invokeCallback(cb, null, this.myBoss);
  } else {
    var self=this;
    myBossDao.getDataByPlayerId(this.id, function(err, myBossData) {
      if (err || !myBossData) {
        logger.error("guildRemote.getSalary failed ");
        utils.invokeCallback(cb, err);
      } else {
          self.myBoss = new MyBoss(myBossData);
          utils.invokeCallback(cb, null, self.myBoss);
      }
    });
  }
};

//Add experience
Player.prototype.addExperience = function(exp) {
  if (!this.nextLevelExp) {
    this.experience += exp;
    return;
  }
  this.experience += exp;
  if (this.experience >= this.nextLevelExp) {
    this.upgrade();
  }
  this.save();
};

/**
 * Upgrade and update the player's state
 * when it upgrades, the state such as hp, mp, defenceValue etc will be update
 * emit the event 'upgrade'
 *
 * @api public
 */
Player.prototype.upgrade = function() {
  if (!this.nextLevelExp) {
    return;
  }
  while (this.experience >= this.nextLevelExp) {
    //logger.error('player.upgrade ' + this.experience + ' nextLevelExp: ' + this.nextLevelExp);
    this._upgrade();
  }
  var newTasks = this.tasks.getRefreshTasks();
  if (newTasks.length > 0) {
    this.onAddTask(newTasks);
  }
  this.onUpgrade();
};

//Upgrade, update player's state
Player.prototype._upgrade = function() {
  this.level += 1;
  // this.refreshProperty();
  formula.refreshProperty(this);
  this.hp = this.maxHp;
  this.mp = this.maxMp;

  this.experience -= this.nextLevelExp;
  var experienceData = dataApi.experience.findById(this.level + 1);
  if (experienceData) {
    this.nextLevelExp = experienceData.exp;
  } else {
    this.nextLevelExp = 9999999999;
  }
  this.setTotalAttackAndDefence();
};

Player.prototype.setTotalAttackAndDefence = function() {
  var characterData = this.characterData;
  var ratio=(this.level-1) * characterData.upgradeParam + 1;
  this.maxHp = Math.floor(ratio* characterData.hp);
  this.maxMp = Math.floor(ratio * characterData.mp);

  this.totalAttackValue = this.attackValue;
  this.totalHitRate = this.hitRate;

  this.totalDefenceValue = this.defenceValue;
  // this.totalWreckValue = this.wreckValue;

  this.totalDodgeRate = this.dodgeRate;
  this.totalCritResValue = this.critResValue;

  this.totalCritValue = this.critValue;

  var equipments = this.equipments.equipments;
  var propertyValue, equipment;
  for (var key in equipments) {
    equipment = equipments[key];
    if (equipment.type === EntityType.EQUIPMENT) {
      propertyValue = equipment.getPropertyValue();
      switch (equipment.kind) {
        case PropertyKind.Attack:
          this.totalAttackValue += propertyValue;
          break;
        case PropertyKind.Defend:
          this.totalDefenceValue += propertyValue;
          break;
        case PropertyKind.Hit:
          this.totalHitRate += propertyValue;
          break;
        case PropertyKind.Dodge:
          this.totalDodgeRate += propertyValue;
          break;
        // case PropertyKind.Wreck:
          // this.totalWreckValue += propertyValue;
          // break;
        case PropertyKind.Crit:
          this.totalCritValue += propertyValue;
          break;
        case PropertyKind.Rescrit:
          this.totalCritResValue += propertyValue;
          break;
        // case PropertyKind.Hp:
        //   this.maxHp += propertyValue;
        //   break;
        // case PropertyKind.Mp:
        //   this.maxMp += propertyValue;
        //   break;
      }
    }
  }
};

/**
 * Equip equipment.
 *
 * @param {String} kind
 * @param {Number} equipId
 * @api public
 */
Player.prototype.equip = function(bagItem) {
  var oldEquipment = this.equipments.getEquipment(bagItem.equipKind);
  // var id = bagItem.id;
  this.equipments.setEquipment(bagItem);
  bagItem.position = 1;
  bagItem.bind=1;
  bagItem.savePosition();
  // delete this.bag.bagItems[position];
  this.bag.removeItem(bagItem.id);
  if (oldEquipment) {
    // this.bag.bagItems[position] = oldEquipment;
    this.bag.addItem(oldEquipment);
    oldEquipment.position = 0;
    oldEquipment.savePosition();
  }
  this.setTotalAttackAndDefence();
};

/**
 * Unequip equipment by kind.
 *
 * @param {Number} kind
 * @api public
 */
Player.prototype.unEquip = function(equipKind) {
  var bagItem = this.equipments.removeEquipment(equipKind);
  if (bagItem) {
    this.bag.addItem(bagItem);
    bagItem.position = 0;
    bagItem.savePosition();
  }
  this.setTotalAttackAndDefence();
};

/**
 * Use Item and update player's state: hp and mp,
 *
 * @param {Number} index
 * @return {Boolean}
 * @api public
 */
// Player.prototype.useItem = function(position) {
//   var bagItem = this.bag.getItem(position);
//   if (!bagItem || bagItem.type !== EntityType.ITEM) {
//     return false;
//   }
//   if (bagItem.count < 2) {
//     messageService.pushLogTipsToPlayer(this, 49);
//     return false;
//   }
//   bagItem.count = bagItem.count - 2;
//   if (bagItem.count <= 0) {
//     this.bag.removeItem(position);
//   } else {
//     bagItem.saveCount();
//   }
//   return true;
// };

/**
 * Pick item.
 * It exists some results: NOT_IN_RANGE, VANISH, BAG_FULL, SUCCESS
 *
 * @param {Number} entityId
 * @return {Object}
 * @api public
 */
Player.prototype.pickItem = function(entityId) {
  var itemEntity = this.area.getEntity(entityId);
  if (!itemEntity) {
    // utils.myPrint("Player.pickItem target vanish targetId=" + targetId);
    return Pick.VANISH;
  }
  // TODO: remove magic pick distance 200
  if (!formula.inRange(this, itemEntity, 100)) {
    return Pick.NOT_IN_RANGE;
  }
  // var position = this.bag.getCanUsePosition();
  if (this.bag.bagIsFull()) {
    return Pick.BAG_FULL;
  }
  // if (itemEntity.isPickUp) {
  //   return Pick.VANISH;
  // }
  // itemEntity.isPickUp = true;

  messageService.pushMessageByAOI(this.area, 'onRemoveEntities', {
    entities: [entityId]
  }, itemEntity);

  var self = this;
  delete itemEntity["id"];
  // itemEntity.id=null;
  if (itemEntity.type === EntityType.EQUIPMENT) {
    var bagItem = new BagItem(itemEntity);
    bagItem.playerId = this.id;
    // bagItem.entityId=entityId;
    this.bag.addItemWithCb(bagItem, function(err, bagItem) {
      if (err) {
        logger.error("Player.pickItem this.bag.addItemWithCb");
        return;
      }
      self.onPickItem(bagItem);
    });

  } else if (itemEntity.type === EntityType.ITEM) {
    this.bag.addItemCount(itemEntity, function(err, bagItem) {
      if (err) {
        logger.error("Player.pickItem this.bag.addItemWithCb");
        return;
      }
      self.onPickItem(bagItem);
    });
  }
  this.area.removeEntity(entityId);
  return Pick.SUCCESS;
};


Player.prototype.addItem = function(item) {
  var self = this;
  item.id = null;
  if (item.type === EntityType.EQUIPMENT) {
    var bagItem = new BagItem(item);
    bagItem.playerId = this.id;
    this.bag.addItemWithCb(bagItem, function(err, bagItem) {
      if (err) {
        logger.error("Player.pickItem this.bag.addItemWithCb");
        return;
      }
      self.onPickItem(bagItem);
    });

  } else if (item.type === EntityType.ITEM) {
    this.bag.addItemCount(item, function(err, bagItem) {
      if (err) {
        logger.error("Player.pickItem this.bag.addItemWithCb");
        return;
      }

      self.onPickItem(bagItem);
    });
  }
  return true;
};


/**
 * Learn a new skill.
 *
 * @param {Number} skillId
 * @param {Function} callback
 * @return {Blooean}
 * @api public
 */
Player.prototype.learnSkill = function(skillId, callback) {
  var self = this;
  fightskillDao.getSQLAllFightSkillsByPlayerId(this.id, function(err, allSkills) {
    if (!!err) {
      logger.error("Player.prototype.learnSkill getSQLAllFightSkillsByPlayerId playerId=", this.id);
      callback(err);
      return;
    }

    for (var key in allSkills) {
      var skillData = allSkills[key];
      if (skillData.skillId === skillId) {
        logger.error("Player.prototype.learnSkill skill have learn playerId=", this.id);
        callback(new Error('skill have been learned'));
        return;
      }
    }

    var skillData = dataApi.fightskill.findById(skillId);
    // var character = dataApi.character.findById(this.kindId);
    var fightSkill = fightskill.create({
      skillId: skillId,
      level: 1,
      playerId: self.id,
      type: skillData.type
    });
    if (self.normalSkill === skillId) {
      fightSkill.position = 1;
    } else {
      fightSkill.position = 0;
    }

    self.fightSkills[skillId] = fightSkill;
    fightskillDao.add(fightSkill, callback);
  });
};

/**
 * Upgrade the existing skill.
 *
 * @param {Number} skillId
 * @return {Boolean}
 * @api public
 */
Player.prototype.upgradeSkill = function(skillId) {
  var fightSkill = this.fightSkills[skillId];
  // fightSkill.level += 1;
  fightSkill.setLevel(fightSkill.level+1);
  fightskillDao.update(fightSkill);
  // return true;
};

Player.prototype.addFightSkills = function(fightSkills) {
  for (var i = 0; i < fightSkills.length; i++) {
    var skill = fightskill.create(fightSkills[i]);
    this.fightSkills[skill.skillId] = skill;
    if (skill.skillId === this.normalSkill && skill.position !== 1) {
      skill.position = 1;
      fightskillDao.update(skill);
    }
  }
};

// Emit the event 'save'.
Player.prototype.save = function() {
  // this.emit('save');
  pomelo.app.get('sync').exec('playerSync.updatePlayer', this.id, this);
};

//Convert player' state to json and return
Player.prototype.playerStrip = function() {
  return {
    id: this.id,
    entityId: this.entityId,
    kindId: this.kindId,
    skinId: this.skinId,
    weaponId: this.weaponId,
    vip: this.vip,
    x: Math.floor(this.x),
    y: Math.floor(this.y),
    level: this.level,
    guildId: this.guildId,
    hp: this.hp,
    mp: this.mp,
    maxHp: this.maxHp,
    maxMp: this.maxMp,
    hpLevel: this.hpLevel,
    mpLevel: this.mpLevel,
    hpCount: this.hpCount,
    mpCount: this.mpCount,

    name: this.name,
    experience: this.experience,
    caoCoin: this.caoCoin,
    crystal: this.crystal,

    fightMode:this.fightMode,
    // bandGoldCoin:this.bandGoldCoin,

    // attackValue: this.attackValue,
    // defenceValue: this.defenceValue,
    // hitRate: this.hitRate,
    // dodgeRate: this.dodgeRate,
    // critValue: this.critValue,
    // critResValue: this.critResValue,
    // wreckValue: this.wreckValue,

    // areaId: this.areaId,
    // type: this.type,

    teamId: this.teamId,
    isCaptain: this.isCaptain
  };
};

Player.prototype.strip = function() {
  return {
    hp: this.hp,
    level: this.level,
    maxHp: this.maxHp,

    x: Math.floor(this.x),
    y: Math.floor(this.y),

    entityId: this.entityId,

    guildId: this.guildId,
    redPoint:this.redPoint,
    teamId: this.teamId,
    isCaptain: this.isCaptain,

    id: this.id,
    name: this.name,

    kindId: this.kindId,
    skinId: this.skinId,
    weaponId: this.weaponId
  };
};

Player.prototype.upgradeStrip = function() {
  return {
    id: this.id,
    level: this.level,
    hp: this.hp,
    mp: this.mp,
    maxHp: this.maxHp,
    maxMp: this.maxMp,
    experience: this.experience,
    // attackValue: this.attackValue,
    // defenceValue: this.defenceValue,
    // hitRate: this.hitRate,
    // dodgeRate: this.dodgeRate,
    // critValue: this.critValue,
    // critResValue: this.critResValue,
    // wreckValue: this.wreckValue
  };
};

//Check out the haters and judge the entity given is hated or not
Player.prototype.isHate = function(entityId) {
  return !!this.haters[entityId];
};

/**
 * Increase hate points for the entity.
 * @param {Number} entityId
 * @param {Number} points
 * @api public
 */
Player.prototype.increaseHateFor = function(entityId, points) {
  points = points || 1;
  if (!!this.haters[entityId]) {
    this.haters[entityId] += points;
  } else {
    this.haters[entityId] = points;
  }
};

//Get the most hater
Player.prototype.getMostHater = function() {
  var entityId = 0,
    hate = 0;
  for (var id in this.haters) {
    if (this.haters[id] > hate) {
      entityId = id;
      hate = this.haters[id];
    }
  }
  if (entityId <= 0) {
    return null;
  }
  return this.area.getEntity(entityId);
};

// Forget the hater
Player.prototype.forgetHater = function(entityId) {
  if (!!this.haters[entityId]) {
    delete this.haters[entityId];
    if (this.target === entityId) {
      this.target = null;
    }
  }
};

/**
 * Add cb to each hater.
 *
 * @param {Function} cb
 * @api public
 */
Player.prototype.forEachHater = function(cb) {
  for (var id in this.haters) {
    var hater = this.area.getEntity(id);
    if (hater) {
      cb(hater);
    } else {
      this.forgetHater(id);
    }
  }
};

// player joins a team
Player.prototype.joinTeam = function(teamId) {
  if (!teamId || teamId === consts.TEAM.TEAM_ID_NONE) {
    return false;
  }
  this.teamId = teamId;
  return true;
};

// player leaves the team
Player.prototype.leaveTeam = function() {
  if (this.teamId === consts.TEAM.TEAM_ID_NONE) {
    return false;
  }
  this.teamId = consts.TEAM.TEAM_ID_NONE;
  this.teamName = null;
  this.isCaptain = consts.TEAM.NO;
  return true;
};

// check if player in a team
Player.prototype.isInTeam = function() {
  return (this.teamId !== consts.TEAM.TEAM_ID_NONE);
};

// Player.prototype.saveMoney = function(needUpdate, callback) {
//   userDao.updateMoney(this, callback);
//   if (needUpdate) {
//     this.onMoney();
//   }
// };

Player.prototype.addCrystal = function(delta, callback) {
  this.crystal += delta;
  var self=this;
  userDao.updateCrystal(this, function(err, res){
    if(res){
      self.onCrystal(delta);
    }
    callback(err, res);
  });
};

Player.prototype.addCaoCoin = function(delta, callback, noUpdate) {
  this.caoCoin += delta;
  userDao.updateCaoCoin(this, callback);
  if (!noUpdate) {
    this.onCaoCoin(delta);
  }
};

Player.prototype.updateTaskData = function(target) {
  var tasks = this.tasks.tasks;
  for (var kindId in tasks) {
    var task = tasks[kindId];
    if (task.type !== TaskType.KILL_MOB || task.taskState >= TaskState.NOT_DELIVERY) {
      continue;
    }

    if (target.kindId === task.targetId) {
      task.targetCount++;
      task.saveTaskData();

      if (task.targetCount >= task.totalCount) {
        task.taskState = TaskState.NOT_DELIVERY;
        task.saveTaskState();
      }
      this.onUpdateTask(task);
    }
  }
};

Player.prototype.updateCollectTaskData = function(target) {
  var tasks = this.tasks.tasks;
  for (var kindId in tasks) {
    var task = tasks[kindId];
    if (task.type !== TaskType.COLLECT || task.taskState >= TaskState.NOT_DELIVERY) {
      continue;
    }

    if (target.kindId === task.targetId) {
      task.targetCount += target.count;
      task.saveTaskData();
      if (task.targetCount >= task.totalCount) {
        task.taskState = TaskState.NOT_DELIVERY;
        task.saveTaskState();
      }
      this.onUpdateTask(task);
      return true;
    }
  }
};

Player.prototype.addExp = function(exp) {
  this.addExperience(exp);
  this.onExp(exp);
};

// Player.prototype.leaveArea = function() {
//   logger.info("leaveArea ========>> name=",this.name);
//   var area = this.area;
//   if (area.kind===AreaKinds.FIGHT_AREA) {
//   }
//   this.area.removePlayer(this.id);
// };

Player.prototype.setDied = function() {
  this.target = null;
  this.forEachEnemy(function(hater) {
    hater.forgetHater(this.entityId);
  });
  this.clearHaters();
  this.died = true;

  this.area.diedInArea(this);
};

Player.prototype.setRevive = function(isRevive) {
  this.died = false;
  this.hp = this.maxHp / 2;
  this.isRevive=isRevive;
  this.area.reviveInArea(this);
  // this.onRevive();
};

///////////////////////////////////
Player.prototype.onRevive = function() {
  messageService.pushMessageByAOI(this.area, 'onRevive', {
    entityId: this.entityId,
    x: this.x,
    y: this.y,
    hp: this.hp
  }, this);
};

Player.prototype.onExp = function(delta) {
  messageService.pushMessageToPlayer(this.sessionData, 'onExp', {
    exp: this.experience,
    delta: delta
  });
};

Player.prototype.onHpMp = function(pushMsg) {
  messageService.pushMessageToPlayer(this.sessionData, 'onHpMp', pushMsg);
};

Player.prototype.onHp2All = function(dHp) {
  var ignoreList = {};
  ignoreList[this.userId] = true;
  messageService.pushMessageByAOI(this.area, 'onHp2All', {
    entityId: this.entityId,
    hp: this.hp,
    dHp:dHp
  }, this, ignoreList);
};

Player.prototype.onAddTask = function(newTasks) {
  messageService.pushMessageToPlayer(this.sessionData, 'onAddTask', newTasks);
};

Player.prototype.onUpgrade = function() {
  messageService.pushMessageToPlayer(this.sessionData, 'onUpgrade', this.upgradeStrip());
};

Player.prototype.onCrystal = function(delta) {
  messageService.pushMessageToPlayer(this.sessionData, 'onCrystal', {
    crystal: this.crystal,
    delta:delta
  });
};

Player.prototype.onCaoCoin = function(delta) {
  messageService.pushMessageToPlayer(this.sessionData, 'onCaoCoin', {
    caoCoin: this.caoCoin,
    delta: delta
  });
};

Player.prototype.onUpdateTask = function(task) {
  messageService.pushMessageToPlayer(this.sessionData, 'onUpdateTask', task.strip());
};

Player.prototype.onPickItem = function(bagItem) {
  messageService.pushMessageToPlayer(this.sessionData, 'onPickItem', bagItem.strip());
};

Player.prototype.onDragArea = function(areaId,instanceId) {
  messageService.pushMessageToPlayer(this.sessionData, 'onDragArea', {
    areaId: areaId,
    instanceId: instanceId
  });
};

Player.prototype.onMessage = function(route, msg) {
  messageService.pushMessageToPlayer(this.sessionData, route, msg);
};

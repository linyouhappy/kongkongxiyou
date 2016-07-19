/**
 * Module dependencies
 */

var util = require('util');
var formula = require('../../consts/formula');
var EntityType = require('../../consts/consts').EntityType;
var Character = require('./character');
var dataApi = require('../../util/dataApi');
// var Item = require('./item');
// var Equipment = require('./equipment');
var fightSkill = require('./../fightskill');
var logger = require('pomelo-logger').getLogger(__filename);


var levelEquipments={};
/**
 * Initialize a new 'Mob' with the given 'opts'.
 * Mob inherits Character
 *
 * @param {Object} opts
 * @api public
 */

var Mob = function(opts) {
  Character.call(this, opts);
  this.type = EntityType.MOB;
  this.spawnX = opts.x;
  this.spawnX = opts.y;

  this.zoneId = opts.zoneId;

  this.hp = opts.maxHp;
  this.maxHp = this.hp;

  this.attackValue = opts.attackValue;
  this.defenceValue = opts.defenceValue;

  this.hitRate = opts.hitRate;
  this.dodgeRate = opts.dodgeRate;

  this.critValue = opts.critValue;
  this.critResValue = opts.critResValue;

  this.baseExp=this.characterData.baseExp;

  this._initFightSkill();
  this.setTotalAttackAndDefence();
};

util.inherits(Mob, Character);

/**
 * Expose 'Mob' constructor
 */

module.exports = Mob;

/**
 * Init fightSkill.
 *
 * @api private
 */

Mob.prototype._initFightSkill = function() {
  if (!this.fightSkills[this.curSkill]) {
    var skill = fightSkill.create({
      skillId: this.curSkill,
      level: 1
    });
    this.fightSkills[this.curSkill] = skill;
  }
};

Mob.prototype.enterAI=function(){
  this.area.timer.enterAI(this.entityId);
};

/**
 * Destory mob after mob is died.
 *
 * @api public
 */

// Mob.prototype.destroy = function() {
//   this.died = true;
//   this.haters = {};
//   this.clearTarget();
// };
Mob.prototype.setDied = function() {
  this.area.removeEntity(this.entityId);
};
/**
 * Check the haters and judge of the entityId hated
 */

Mob.prototype.isHate = function(entityId) {
  return !!this.haters[entityId];
};


/**
 * Increase hate points for the entity.
 * if need be, change the target and enterAI
 *
 * @param {Number} entityId
 * @param {Number} points
 * @api public
 */

Mob.prototype.increaseHateFor = function(entityId, points) {
  points = points || 1;
  if (this.haters[entityId]) {
    this.haters[entityId] += points;
  } else {
    this.haters[entityId] = points;
  }
  this.target = this.getMostHater();
  this.area.timer.enterAI(this.entityId);
};

//Get the most hater
Mob.prototype.getMostHater = function() {
  var entityId = 0,
    hate = 0;
  for (var id in this.haters) {
    if (this.haters[id] > hate) {
      entityId = id;
      hate = this.haters[id];
    }
  }
  entityId=Number(entityId);
  if (entityId <= 0) {
    return null;
  }
  // key of map is string type
  return entityId;
};

// Forget the hater
Mob.prototype.forgetHater = function(entityId) {
  if (this.haters[entityId]) {
    delete this.haters[entityId];
    this.target = this.getMostHater();
  }
};

/**
 * Add cb to each hater.
 *
 * @param {Function} cb
 * @api public
 */

Mob.prototype.forEachHater = function(cb) {
  for (var id in this.haters) {
    var hater = this.area.getEntity(id);
    if (hater) {
      cb(hater);
    } else {
      this.forgetHater(id);
    }
  }
};

//Increase hate for the player who is coming.
Mob.prototype.onPlayerCome = function(entityId) {
  var player = this.area.getEntity(entityId);
  //Only hit a live person
  if (!!player && !player.died) {
    this.increaseHateFor(entityId, 1);
    player.addEnemy(this.entityId);
  }
};

/**
 * Drop items down.
 * when a mob is killed, it drops equipments and items down to the player
 *
 * @param {Player} player
 * @api public
 */

Mob.prototype.dropItem = function(player) {
  // var dropItems = [];
  if (Math.random() < 0.3) {
    return this._dropEquipment(player);
    // if (!!equipment) {
    //   dropItems.push(equipment);
    // }
  }
  // return dropItems;
};

//Drop Item down
// Mob.prototype._dropItem = function(player) {
//   var pos = this.area.map.genPos(this, 200);
//   if (!pos) {
//     logger.warn('Generate position for drop item error!');
//     return null;
//   }
//   var level = Math.min(this.level, player.level);
//   var itemDatas = dataApi.item.findSmaller('heroLevel', level);
//   var length = itemDatas.length;
//   var index = Math.floor(Math.random() * length);
//   var itemData = itemDatas[index];
//   var count=2;

//   var dropItem = new Item({
//     kindId: itemData.id,
//     x: Math.floor(pos.x),
//     y: Math.floor(pos.y),
//     name: itemData.name,
//     count:count
//     // kindName: itemData.name,
//     // englishName: itemData.englishName,
//     // desc: itemData.desc,
//     // englishDesc: itemData.englishDesc,
//     // kind: itemData.kind,
//     // hp: itemData.hp,
//     // mp: itemData.mp,
//     // price: itemData.price,
//     // playerId: player.id,
//     // imgId: itemData.imgId,
//     // heroLevel: itemData.heroLevel
//   });
//   return dropItem;
// };

//Drop Equipment down
Mob.prototype._dropEquipment = function(player) {
  var pos = this.area.map.genPos(this, 200);
  if (!pos) {
    logger.warn('Generate position for drop equipment error!');
    return;
  }
  var level = formula.dropItemLv(this.level, player.level);
  var equipments = this.getEquipmentsByLevel(level);
  if(equipments.length===0){
    return;
  }

  var index = Math.floor(Math.random() * equipments.length);
  var equipment = equipments[index];
  var baseValue = Math.floor(equipment.baseValue * (Math.random() + 1) * 0.5);
  var potential = Math.floor(equipment.potential * (Math.random() + 1) * 0.5);

  var jobId=formula.randomJobId();
  // var kind = Math.ceil(Math.random() * 8);
  // kind = Math.max(Math.min(kind, 9), 1);

  // var dropEquipment = new Equipment({
  //   kindId: equipment.id,
  //   x: Math.floor(pos.x),
  //   y: Math.floor(pos.y),
  //   baseValue: baseValue,
  //   potential: potential,
  // });
  var dropEquipment = {
    kindId: equipment.id,
    x: pos.x,
    y: pos.y,
    baseValue: baseValue,
    potential: potential,
    jobId:jobId,
    type: EntityType.EQUIPMENT
  };
  return dropEquipment;
};

Mob.prototype.getEquipmentsByLevel = function(level) {
  if (levelEquipments[level]) {
    return levelEquipments[level];
  }
  var equipments;
  while (level > 0) {
    equipments = dataApi.equipment.findBy('heroLevel', level);
    if (equipments.length > 0){
      levelEquipments[level]=equipments;
      return equipments;
    }
    level--;
  }
  equipments=[];
  levelEquipments[level]=equipments;
  return equipments;
}

//Reset position
Mob.prototype.resetPosition = function() {
  this.setPosition(this.spawnX, this.spawnX);
};

/**
 * Go back to the spawning position after 'time' millisecond.
 *
 * @param {Number} time
 * @api public
 */

Mob.prototype.returnToSpawningPosition = function(time) {
  var delay = time || 4000;

  this.clearTarget();

  setTimeout(function() {
    this.resetPosition();
    this.move(this.x, this.y);
  }, delay);
};

//Emit the event 'died'
// Mob.prototype.afterDied = function() {
//   // this.emit('died', this);
// };

//Emit the event 'killed'
// Mob.prototype.afterKillTarget = function(target) {
//   // this.emit('killed', target);
// };

// Mob.prototype.setTotalAttackAndDefence = function() {
//   this.totalAttackValue = this.getAttackValue();
//   this.totalDefenceValue = this.getDefenceValue();
// };

//Get experience after mob killed
Mob.prototype.getKillExp = function(playerLevel) {
  return formula.calMobExp(this.baseExp, playerLevel, this.level);
};

/**
 * Get hit from attacker and increase hate for the attacker.
 *
 * @param {Player} attacker
 * @param {Number} damage
 * @api public
 */

Mob.prototype.hit = function(attacker, damage) {
  Character.prototype.hit.call(this, attacker, damage);
  this.increaseHateFor(attacker.entityId, 5);
};

/**
 * Convert the mob information to json.
 *
 * @return {Object}
 * @api public
 */

// Mob.prototype.toJSON = function() {
//   return {
//     id: this.id,
//     entityId: this.entityId,
//     kindId: this.kindId,
//     kindName: this.kindName,
//     englishName: this.englishName,
//     x: this.x,
//     y: this.y,
//     hp: this.hp,
//     mp: this.mp,
//     maxHp: this.maxHp,
//     maxMp: this.maxMp,
//     type: this.type,
//     level: this.level,
//     zoneId: this.zoneId,
//   };
// };

Mob.prototype.strip = function() {
  var info={
    entityId: this.entityId,
    kindId: this.kindId,
    x: this.x,
    y: this.y,
    hp: this.hp
  };
  if (!this.zoneId) {
    info.level=this.level;
  }
  return info;
};

Mob.prototype.updateTaskData=function(target){

};

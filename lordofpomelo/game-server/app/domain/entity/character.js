/**
 * Module dependencies
 */
var pomelo = require('pomelo');
var util = require('util');
var utils = require('../../util/utils');
var dataApi = require('../../util/dataApi');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var Entity = require('./entity');
var fightskill = require('./../fightskill');
var EntityType = require('../../consts/consts').EntityType;
var logger = require('pomelo-logger').getLogger(__filename);
var AttackResult = consts.AttackResult;
var Move = require('./../action/move');
var messageService = require('./../messageService');


var Character = function(opts) {
  Entity.call(this, opts);

  this.enemies = {};
  this.haters = {};

  this.level = opts.level;

  this.isMoving = false;
  this.died = false;

  var characterData=opts.characterData;
  if (!characterData) {
    characterData = dataApi.character.findById(this.kindId);
  }
  this.walkSpeed = characterData.walkSpeed;
  this.normalSkill = characterData.skillId;
  this.range = characterData.range;

  this.characterData =characterData;

  this.buffs = [];
  this.curSkill = this.normalSkill;
  this.fightSkills = {};
};

util.inherits(Character, Entity);

/**
 * Expose 'Character' constructor.
 */
module.exports = Character;

// Character.prototype.printPro=function(){
//   console.log("totalHitRate=" + this.totalHitRate +
//     ",totalDodgeRate=" + this.totalDodgeRate +
//     ",totalCritValue=" + this.totalCritValue +
//     ",totalCritResValue=" + this.totalCritResValue);

//   console.log("totalAttackValue=" + this.totalAttackValue +
//     ",totalWreckValue=" + this.totalWreckValue +
//     ",totalDefenceValue=" + this.totalDefenceValue);
// };

Character.prototype.enterAI=function(){
  // this.area.timer.enterAI(this.entityId);
};

Character.prototype.setTotalAttackAndDefence = function() {
  this.totalDodgeRate = this.dodgeRate;
  this.totalHitRate = this.hitRate;

  this.totalCritValue = this.critValue;
  this.totalCritResValue = this.critResValue;

  this.totalAttackValue = this.attackValue;
  // this.totalWreckValue = this.wreckValue;
  this.totalDefenceValue = this.defenceValue;
};

Character.prototype.checkSkillAvailable = function(skillId) {
  var fightSkill = this.fightSkills[skillId];
  if (fightSkill.coolDownTime > Date.now()) {
    return false;
  }
  if (fightSkill.mp > this.mp) {
    return false;
  }
  return true;
};

Character.prototype.getAvailableSkill = function(enableMultiAttack) {
  var skillId = this.curSkill;
  if (!!skillId) {
    if (this.checkSkillAvailable(skillId))
      return skillId;
  }

  if (this.type === EntityType.MOB) {
    return null;
  }

  if (this.normalSkill !== skillId) {
    skillId = this.normalSkill;
    if (this.checkSkillAvailable(skillId))
      return skillId;
  }
  return null;
};
 
Character.prototype.genRandomPoint = function() {
  var pos = this.area.map.genPos(this, 200);
  if (pos) {
    return pos;
  }
  return {
    x: this.x,
    y: this.y
  };
};

/**
 * Add skills to the fightSkills.
 *
 * @param {Array} fightSkills
 * @api public
 */
Character.prototype.addFightSkills = function(fightSkills) {
  for (var i = 0; i < fightSkills.length; i++) {
    var skill = fightskill.create(fightSkills[i]);
    this.fightSkills[skill.skillId] = skill;
  }
};

/**
 * Get fight skill data
 *
 * @api public
 */
Character.prototype.getFightSkillDatas = function() {
  var data = [];
  var fightSkill;
  for (var key in this.fightSkills) {
    fightSkill = this.fightSkills[key];
    // var fs = {
    //   skillId: fightSkill.skillId,
    //   position: fightSkill.position,
    //   level: fightSkill.level
    // };
    data.push(fightSkill.strip());
  }
  return data;
};

/**
 * Set target of this Character.
 *
 * @param {Number} targetId entityId of the target
 * @api public
 */
Character.prototype.setTarget = function(targetId) {
  this.target = targetId;
};

/**
 * Check the target.
 *
 * @api public
 */
Character.prototype.hasTarget = function() {
  return !!this.target;
};

/**
 * Clear the target.
 *
 * @api public
 */
Character.prototype.clearTarget = function() {
  this.target = null;
};

/**
 * Reset the hp.
 *
 * @param {Number} maxHp
 * @api public
 */
Character.prototype.resetHp = function(maxHp) {
  this.maxHp = maxHp;
  this.hp = this.maxHp;
  // if (!!this.updateTeamMemberInfo) {
  //   this.updateTeamMemberInfo();
  // }
};

/**
 * Recover the hp.
 *
 * @param {Number} hpValue
 * @api public
 */
Character.prototype.recoverHp = function(hpValue) {
  if (this.hp >= this.maxHp) {
    return;
  }
  var hp = this.hp + hpValue;
  if (hp > this.maxHp) {
    this.hp = this.maxHp;
  } else {
    this.hp = hp;
  }
};

/**
 * Reset the mp.
 *
 * @param {Number} maxMp
 * @api public
 */
Character.prototype.resetMp = function(maxMp) {
  this.maxMp = maxMp;
  this.mp = this.maxMp;
};

/**
 * Recover the mp.
 *
 * @param {Number} mpValue
 * @api public
 */
Character.prototype.recoverMp = function(mpValue) {
  if (this.mp >= this.maxMp) {
    return;
  }

  var mp = this.mp + mpValue;
  if (mp > this.maxMp) {
    this.mp = this.maxMp;
  } else {
    this.mp = mp;
  }
};

/**
 * Move to the destination of (x, y).
 * the map will calculate path by startPosition(startX, startY), endPosition(endX, endY) and cache
 * if the path exist, it will emit the event 'move', or return false and loggerWarn
 *
 * @param {Number} targetX
 * @param {Number} targetY
 * @param {Boolean} useCache
 * @api public
 */

Character.prototype.move = function(targetX, targetY, useCache, cb) {
  var paths = this.area.map.findPath(this.x, this.y, targetX, targetY, useCache);
  if (!!paths) {
    var action = new Move({
      entity: this,
      path: paths,
      speed: this.walkSpeed
    });
    if (this.area.timer.addAction(action)) {
      // console.log("$$$$$$ Character.move===========>onMove");
      messageService.pushMessageByAOI(this.area, 'onMove', {
        entityId: this.entityId,
        path: paths
      }, this);
    }
    utils.invokeCallback(cb, null, true);
  } else {
    logger.warn('No path exist! {x: %j, y: %j} , target: {x: %j, y: %j} ', this.x, this.y, targetX, targetY);
    utils.invokeCallback(cb, 'find path error', false);
  }
};

Character.prototype.stand = function() {
  if (this.isStop) {
    this.isStop = null;
    var ignoreList = {};
    ignoreList[this.userId] = true;
    messageService.pushMessageByAOI(this.area, 'onStand', {
      entityId: this.entityId,
      x: this.x,
      y: this.y
    }, this, ignoreList);
  } else {
    messageService.pushMessageByAOI(this.area, 'onStand', {
      entityId: this.entityId,
      x: this.x,
      y: this.y
    }, this);
  }
};

Character.prototype.setIsMoving=function(isMoving){
  this.isMoving=isMoving;
};

Character.prototype.attack = function(target, skillId) {
  var skill = this.fightSkills[skillId];
  if (!skill) {
    return AttackResult.NOT_SKILL;
  }
  var resultConst = skill.judge(this);
  if (resultConst !== AttackResult.SUCCESS) {
    return resultConst;
  }
  skill.coolDownTime = Date.now() + skill.cooltime * 1000;
  // if (skill.multiAttack) {
  //   return this.area.areaLogic.multiAttack(this, target, skill);
  // }
  return this.area.areaLogic.attack(this, target, skill);
};


/**
 * attack the target.
 *
 * @param {Character} target
 * @param {Number} skillId
 * @return {Object}
 */
// Character.prototype.attack = function(target, skillId) {
//   var skill = this.fightSkills[skillId];
//   if (!skill) {
//     return AttackResult.ERROR;
//   }
//   var resultConst = skill.judge(this);
//   if (resultConst!==AttackResult.SUCCESS) {
//     return resultConst;
//   }
//   skill.coolDownTime = Date.now() + skill.cooltime * 1000;

//   if (skill.multiAttack) {
//     return this.multiAttack(target, skillId);
//   }

//   if (this.entityId === target.entityId){
//     return AttackResult.ERROR;
//   }

//   if (target.died){
//     return AttackResult.KILLED;
//   }

//   this.setTarget(target.entityId);
//   this.addEnemy(target.entityId);

//   resultConst = skill.use(this, target);
//   if (resultConst === AttackResult.MISS
//     || resultConst === AttackResult.SUCCESS) {

//     var msg = {
//       attacker: this.entityId,
//       x: this.x,
//       y: this.y,
//       target: target.entityId,
//       skillId: skillId
//     };
    
//     if (resultConst === AttackResult.SUCCESS) {
//       target.hit(this, skill.damageValue);
//       if (!!target.save) {
//         target.save();
//       }
//       if (target.died) {
//         if (target.type === EntityType.MOB) {
//           this.updateTaskData(target);
//           var exp = target.getKillExp(this.level);
//           this.addExperience(exp);
//           msg.exp = exp;
//           var items = target.dropItems(this);
//           var item,pushItems = [];
//           for (var key in items) {
//             item = items[key];
//             this.area.addEntity(item);
//             pushItems.push(item.strip());
//           }
//           if (pushItems.length > 0) {
//             msg.items = pushItems;
//           }
//         }
//         target.setDied();
//         this.target = null;
//         msg.hp = 0;
//       }else{
//         msg.hp = target.hp;
//       }
//       if (skill.isOccurCrit) {
//         resultConst = AttackResult.CRIT;
//       }
//       msg.damage = skill.damageValue;
//     }

//     msg.result=resultConst;
//     if (target.type === EntityType.MOB && !target.died) {
//       this.area.timer.enterAI(target.entityId);
//     }
//     if (skill.mp) {
//       this.reduceMp(skill.mp);
//       msg.mp = this.mp;
//     }
//     // skill.coolDownTime = Date.now() + skill.cooltime * 1000;
//     if (this.save) {
//       this.save();
//     }
//     this.onAttack(msg);
//     return AttackResult.SUCCESS;
//   }
//   return resultConst;
// };

// Character.prototype.multiAttack = function(target, skillId) {
//   var skill = this.fightSkills[skillId];
//   var types = [EntityType.MOB];
//   var range = Math.ceil(skill.distance / 300);
//   var targetEntitys = this.area.getEntitiesByPos(this, types, range);
//   var resultConst, singleData, type, rewards;
  
//   var msg = {
//     attacker: this.entityId,
//     x: this.x,
//     y: this.y,
//     skillId: skillId,
//     groups: []
//   };
//   var oneData,groups = msg.groups;
//   var exp,item,items,pushItems = [];
//   for (var k in types) {
//     type = types[k];
//     for (var key in targetEntitys[type]) {
//       target = targetEntitys[type][key];
//       resultConst = skill.use(this, target);
//       if (resultConst === AttackResult.MISS 
//         || resultConst === AttackResult.SUCCESS) {

//         this.addEnemy(target.entityId);
//         oneData = {
//           target: target.entityId
//         };

//         if (resultConst === AttackResult.SUCCESS) {
//           target.hit(this, skill.damageValue);
//           if (!!target.save) {
//             target.save();
//           }

//           if (target.died) {
//             if (target.type === EntityType.MOB) {
//               this.updateTaskData(target);
//               exp = target.getKillExp(this.level);
//               this.addExperience(exp);
//               oneData.exp = exp;
//               items = target.dropItems(this);
//               for (var ikey in items) {
//                 pushItems.push(items[ikey]);
//               }
//             }

//             target.setDied();
//             this.target = null;
//             oneData.hp = 0;
//             // resultConst = AttackResult.KILLED;
//           } else {
//             oneData.hp = target.hp;
//           }

//           if (skill.isOccurCrit) {
//             resultConst = AttackResult.CRIT;
//           }
//           // oneData.hp = target.hp;
//           oneData.damage = skill.damageValue;
//           // skill.damageValue = 0;
//         }
        
//         oneData.result=resultConst;
//         groups.push(oneData);
//         if (target.type === EntityType.MOB && !target.died) {
//           this.area.timer.enterAI(target.entityId);
//         }
//       }
//     }
//   }

//   if (skill.mp) {
//     this.reduceMp(skill.mp);
//     msg.mp = this.mp;
//   }

//   if (pushItems.length > 0) {
//     msg.items = [];
//     for (var i = 0; i < pushItems.length; i++) {
//       item = pushItems[i];
//       this.area.addEntity(item);
//       msg.items.push(item.strip());
//     }
//   }

//   if (!!this.save) {
//     this.save();
//   }

//   this.onGAttack(msg);
//   return AttackResult.SUCCESS;
// };

Character.prototype.onAttack = function(msg) {
  messageService.pushMessageByAOI(this.area, 'onAttack', msg, this);
};


Character.prototype.onGAttack = function(msg) {
  messageService.pushMessageByAOI(this.area, 'onGAttack', msg, this);
};


/**
 * Take hit and get damage.
 *
 * @param {Character} attacker
 * @param {Number} damage
 * @api public
 */
Character.prototype.hit = function(attacker, damage) {
  this.increaseHateFor(attacker.entityId);
  this.reduceHp(damage);
};

/**
 * Reduce hp.
 *
 * @param {Number} damageValue
 * @api public
 */
Character.prototype.reduceHp = function(damageValue) {
  this.hp -= damageValue;
  if (this.hp <= 0) {
    this.hp=0;
    this.died = true;
  }
};

/**
 * Reduce mp.
 *
 * @param {Number} mp
 * @api public
 */
Character.prototype.reduceMp = function(mp) {
  this.mp -= mp;
  if (this.mp <= 0) {
    this.mp = 0;
  }
};

/**
 * Get attackValue.
 *
 * @return {Number}
 * @api private
 */
// Character.prototype.getAttackValue = function() {
//   return this.attackValue * this.attackParam;
// };

/**
 * Get defenceValue.
 *
 * @return {Number}
 * @api private
 */
// Character.prototype.getDefenceValue = function() {
//   return this.defenceValue * this.defenceParam;
// };

/**
 * Get total attackValue.
 *
 * @return {Number}
 * @api public
 */
// Character.prototype.getTotalAttack = function() {
//   return this.totalAttackValue;
// };

/**
 * Get total defenceValue.
 *
 * @return {Number}
 * @api public
 */
// Character.prototype.getTotalDefence = function() {
//   return this.totalDefenceValue;
// };

/**
 * Add buff to buffs.
 *
 * @param {Buff} buff
 * @api public
 */
Character.prototype.addBuff = function(buff) {
  this.buffs[buff.type] = buff;
};

/**
 * Remove buff from buffs.
 *
 * @param {Buff} buff
 * @api public
 */
Character.prototype.removeBuff = function(buff) {
  delete this.buffs[buff.type];
};

/**
 * Add callback to each enemy.
 *
 * @param {Function} callback(enemyId)
 * @api public
 */
Character.prototype.forEachEnemy = function(callback) {
  var enemy;
  for (var enemyId in this.enemies) {
    enemy = this.area.getEntity(enemyId);
    if (!enemy) {
      delete this.enemies[enemyId];
      continue;
    }
    callback(enemy);
  }
};

/**
 * Add enemy to enemies.
 *
 * @param {Number} entityId of enemy
 * @api public
 */
Character.prototype.addEnemy = function(enemyId) {
  this.enemies[enemyId] = 1;
};

/**
 * Forget the enemy.
 *
 * @param {Number} entityId
 * @api public
 */
Character.prototype.forgetEnemy = function(entityId) {
  delete this.enemies[entityId];
};

Character.prototype.forgetHater = function() {};

Character.prototype.forEachHater = function() {};

Character.prototype.increaseHateFor = function() {};

Character.prototype.getMostHater = function() {};

Character.prototype.clearHaters = function() {
  this.haters = {};
};

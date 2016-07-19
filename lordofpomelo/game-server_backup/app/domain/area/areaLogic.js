var dataApi = require('../../util/dataApi');
var util = require('util');
var pomelo = require('pomelo');
var patrol = require('../../patrol/patrol');
var consts = require('../../consts/consts');
var utils = require('../../util/utils');
var Timer = require('./timer');
var logger = require('pomelo-logger').getLogger(__filename);
//var channelUtil = require('../../util/channelUtil');
var domainDao = require('../../dao/domainDao');
var Revive = require('./../action/revive');
var Equipment = require('../entity/equipment');
var dataApi = require('../../util/dataApi');
var messageService = require('../messageService');
var formula = require('../../consts/formula');
var Mob = require('./../entity/mob');
var Item = require('./../entity/item');

var EntityType = consts.EntityType;
var AreaKinds = consts.AreaKinds;
var AreaStates = consts.AreaStates;
var PLAYER = consts.PLAYER;
var DomainConst=consts.DomainConst;
var AttackResult = consts.AttackResult;


/////////////////////////////////////////////
//AreaLogic
var AreaLogic = function(area) {
  this.area = area;
  this.areaId = area.areaId;
};

AreaLogic.prototype.finishFight = function() {};

AreaLogic.prototype.enterArea = function() {};

AreaLogic.prototype.exitArea = function() {};

AreaLogic.prototype.diedInArea = function(player) {
  this.area.timer.abortAllAction(player.entityId);
  this.area.timer.addAction(new Revive({
    entityId: player.entityId,
    reviveTime: PLAYER.reviveTime,
    area: this.area
  }));
};

AreaLogic.prototype.reviveInArea = function(player) {
  this.area.timer.abortAllAction(player.entityId);
  if (!player.isRevive) {
    var oldPos = {
      x: player.x,
      y: player.y
    };
    var newPos=this.area.map.getBornPoint();
    var watcher = {
      id: player.entityId,
      type: player.type
    };
    this.area.timer.updateObject(watcher, oldPos, newPos);
    this.area.timer.updateWatcher(watcher, oldPos, newPos,player.range,player.range);
    player.x = newPos.x;
    player.y = newPos.y;
  }
  player.onRevive();
};

AreaLogic.prototype.startBattle = function() {

};

AreaLogic.prototype.stopBattle = function() {

};

AreaLogic.prototype.close = function() {
  for (var key in this) {
    delete this[key];
  }
};

AreaLogic.prototype.startLogic = function() {

};

AreaLogic.prototype.update1 = function() {
  this.area.updateZones();
};

AreaLogic.prototype.update3 = function() {
  this.area.updatePlayers();
};

AreaLogic.prototype.killReward = function(attacker, target, msg, items) {
  if (target.type === EntityType.MOB) {
    if (attacker.type === EntityType.PLAYER) {
      attacker.updateTaskData(target);

      var exp = target.getKillExp(attacker.level);
      attacker.addExperience(exp);
      msg.exp = exp;

      var itemData = target.dropItem(attacker);
      if (itemData) {
        if (itemData.type === EntityType.EQUIPMENT) {
          var equipment = new Equipment(itemData);
          this.area.addEntity(equipment);
          items.push(equipment.strip());
        } else {
          var item = new Item(itemData);
          this.area.addEntity(item);
          items.push(item.strip());
        }
      }
    }
  }
};

AreaLogic.prototype.attack = function(attacker, target, skill) {
  var msg = {
    attacker: attacker.entityId,
    x: attacker.x,
    y: attacker.y,
    skillId: skill.skillId
  };
  if (skill.mp) {
    attacker.reduceMp(skill.mp);
    msg.mp = attacker.mp;
  }

  if (skill.multiAttack) {
    return this.multiAttack(msg,attacker, target, skill);
  }

  msg.target=target.entityId;

  if (attacker.entityId === target.entityId) {
    return AttackResult.ERROR;
  }
  if (target.died) {
    return AttackResult.KILLED;
  }
  if (!skill.inRange(attacker, target)) {
    return AttackResult.NOT_IN_RANGE;
  }

  var resultConst = skill.use(attacker, target);
  if (resultConst === AttackResult.SUCCESS) {
    target.hit(attacker, skill.damageValue);
    if (target.save) {
      target.save();
    }
    if (target.died) {
      msg.hp = 0;

      var items=[];
      this.killReward(attacker, target, msg, items);
      if (items.length>0) {
        msg.items=items;
      }

      target.setDied();
      attacker.target = null;
    } else {
      msg.hp = target.hp;

      attacker.setTarget(target.entityId);
      attacker.addEnemy(target.entityId);
      target.enterAI();
    }
    if (skill.isOccurCrit) {
      resultConst = AttackResult.CRIT;
    }
    msg.damage = skill.damageValue;
  }
  msg.result = resultConst;
  if (attacker.save) {
    attacker.save();
  }
  attacker.onAttack(msg);
  return resultConst;
};

AreaLogic.prototype.multiAttack = function(msg, attacker, target, skill) {
  msg.groups=[];

  var types = [EntityType.MOB];
  var range = Math.ceil(skill.distance / 300);
  var targetEntitys = this.area.getEntitiesByPos(attacker, types, range);

  var resultConst, singleData, type, rewards;
  var oneData,groups = msg.groups;
  var exp,itemData,pushItems = [];
  for (var k in types) {
    type = types[k];
    for (var key in targetEntitys[type]) {
      target = targetEntitys[type][key];
      if (attacker.entityId === target.entityId) {
        continue;
      }
      if (target.died) {
        continue;
      }

      if (!skill.inRange(attacker, target)) {
        continue;
      }
      resultConst = skill.use(attacker, target);
      oneData = {
        target: target.entityId
      };

      if (resultConst === AttackResult.SUCCESS) {
        target.hit(attacker, skill.damageValue);
        if (target.save) {
          target.save();
        }
        if (target.died) {
          oneData.hp = 0;

          this.killReward(attacker, target, oneData, pushItems);

          target.setDied();
          attacker.target = null;
        } else {
          oneData.hp = target.hp;

          attacker.setTarget(target.entityId);
          attacker.addEnemy(target.entityId);
          target.enterAI();
        }
        if (skill.isOccurCrit) {
          resultConst = AttackResult.CRIT;
        }
        oneData.damage = skill.damageValue;
      }
      oneData.result=resultConst;
      groups.push(oneData);
    }
  }

  if (pushItems.length > 0) {
    msg.items = pushItems;
  }

  if (attacker.save) {
    attacker.save();
  }
  attacker.onGAttack(msg);
  return AttackResult.SUCCESS;
};

////////msg
AreaLogic.prototype.onFinishFight = function(winnerId, loserId) {
  if (!this.channel) {
    this.channel = this.area.getChannel();
  }
  this.channel.pushMessage("onFinishFight", {
    winnerId: winnerId,
    loserId: loserId
  });
};

AreaLogic.prototype.onRunArea = function() {
  if (!this.channel) {
    this.channel = this.area.getChannel();
  }
  this.channel.pushMessage("onRunArea", {});
};

AreaLogic.prototype.onDragArea = function(areaId) {
  if (!this.channel) {
    this.channel = this.area.getChannel();
  }
  this.channel.pushMessage("onDragArea", {
    areaId: areaId
  });
};



/////////////////////////////////////////////
//AreaNormalLogic
var AreaNormalLogic = function(opts) {
  AreaLogic.call(this, opts);
};

util.inherits(AreaNormalLogic, AreaLogic);

AreaNormalLogic.prototype.startLogic = function() {
  this.area.start();
};

// AreaNormalLogic.prototype.attack = function(attacker, target, skill) {
//   var msg = {
//     attacker: attacker.entityId,
//     x: attacker.x,
//     y: attacker.y,
//     skillId: skill.skillId
//   };
//   if (skill.mp) {
//     attacker.reduceMp(skill.mp);
//     msg.mp = attacker.mp;
//   }
//   if (skill.multiAttack) {
//     return AttackResult.SUCCESS;
//   }
//   msg.target=target.entityId;
//   return AttackResult.SUCCESS;
// }

/////////////////////////////////////////////
//AreaDomainLogic
var AreaDomainLogic = function(opts) {
  AreaLogic.call(this, opts);

  this.occupyValue = 0;
  this.occupyGuildId = 0;
};

util.inherits(AreaDomainLogic, AreaLogic);

AreaDomainLogic.prototype.startLogic = function() {
  this.initDomainArea();
};

AreaDomainLogic.prototype.pushDomainInfo = function() {
  var msg = {
    areaId: this.areaId,
    areaState: this.areaState,
    guildId: this.guildId,
    level: this.domain.level
  };
  this.onUpdateDomain(msg);
};

AreaDomainLogic.prototype.startBattle = function() {
  if (this.areaState === AreaStates.BATTLE_STATE) {
    return;
  }
  var self = this;
  pomelo.app.rpc.manager.guildRemote.startDomain(null, self.areaId, self.domain.level, function(err, code) {
    if (code === 200) {
      self.areaState = AreaStates.BATTLE_STATE;
      self.occupyValue = 0;
      self.occupyGuildId = 0;
      var area=self.area;
      for (var id in area.items) {
        item = area.entities[id];
        if (item) {
          area.removeEntity(item.entityId);
        }
      }
      self.pushDomainInfo();
      var msg = {
        broadId: 124,
        data: []
      };
      msg.data[0] = self.areaId;
      pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function() {});
    }
  });
};

AreaDomainLogic.prototype.stopBattle = function() {
  if (this.areaState === AreaStates.DOMAIN_STATE) {
    return;
  }
  this.areaState = AreaStates.DOMAIN_STATE;
  var broadId=125;
  var domain=this.domain;
  if (this.occupyGuildId) {
    if (domain.guildId === this.occupyGuildId) {
      domain.level++;
      broadId=128;
    } else {
      domain.guildId = this.occupyGuildId;
      domain.level = 1;
      if (this.occupyValue === 1000) {
        broadId=126;
      } else {
        broadId=127;
      }
    }
  } else {
    domain.guildId = 0;
    domain.level = 0;
  }
  this.guildId=domain.guildId;
  saveDomain(domain);
  this.pushDomainInfo();

  var self = this;
  pomelo.app.rpc.manager.guildRemote.finishDomain(null,this.areaId,domain.guildId,domain.level,function(err, guildName) {
    var msg;
    if (guildName) {
      domain.guildName = guildName;
      if (broadId !== 125) {
        msg = {
          broadId: broadId,
          data: []
        };
        msg.data[0] = {
          guildId: domain.guildId,
          name: guildName
        };
        if (broadId===128) {
          msg.data[1] = domain.level;
          msg.data[2] = self.areaId;
        }else{
          msg.data[1] = self.areaId;
        }
      }
    } else {
      if (broadId === 125) {
        msg = {
          broadId: broadId,
          data: []
        };
        msg.data[0] = self.areaId;
      } else {
        logger.warn("AreaDomainLogic.stopBattle guildName=null areaId=" + self.areaId);
      }
    }
    if (msg) {
      pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function() {});
    }
  });
};

AreaDomainLogic.prototype.update1 = function() {
  if (this.areaState === AreaStates.DOMAIN_STATE) {
    this.area.updateZones();
  }
};

DomainConst.START_HOUR=12;
DomainConst.START_MINUTE=0;
AreaDomainLogic.prototype.update3 = function() {
  this.area.updatePlayers();
  var currdate = new Date;
  if (this.areaState === AreaStates.BATTLE_STATE) {
    if (this.deadlineTime>currdate.getTime()) {
      this.updateDomainBattle();
    }else{
      this.stopBattle();
    }
  }
  if (currdate.getHours() === DomainConst.START_HOUR) {
    if (currdate.getMinutes() >= DomainConst.START_MINUTE) {
      if (this.fightDay !== currdate.getDate() && this.domain) {
        this.fightDay = currdate.getDate();
        // this.deadlineTime=currdate.getTime()+30*60000;
        this.deadlineTime=currdate.getTime()+0.5*60000;
        this.startBattle();
      }
      return;
    }
  }
};

AreaDomainLogic.prototype.reviveInArea = function(player) {
  this.area.timer.abortAllAction(player.entityId);
  if (player.isRevive) {
    player.onRevive();
  }else{
    if (this.guildId && player.guildId === this.guildId) {
      var oldPos = {
        x: player.x,
        y: player.y
      };
      var newPos = this.area.map.getBornPoint();
      var watcher = {
        id: player.entityId,
        type: player.type
      };
      this.area.timer.updateObject(watcher, oldPos, newPos);
      this.area.timer.updateWatcher(watcher, oldPos, newPos, player.range, player.range);
      player.x = newPos.x;
      player.y = newPos.y;
      player.onRevive();
    } else {
      player.died = true;
      player.onDragArea(2001);
    }
  }
};

AreaDomainLogic.prototype.enterArea = function(player) {
  var playerId = player.id;
  var self = this;
  setTimeout(function() {
    var player = self.area.getPlayer(playerId);
    if (player) {
      var msg = {
        areaId: self.areaId,
        areaState: self.areaState,
        guildId: self.guildId,
        level: self.domain.level
      };
      player.onMessage("onUpdateDomain", msg);
    }
  }, 1000);
};

AreaDomainLogic.prototype.initDomainArea = function() {
  this.areaState = AreaStates.DOMAIN_STATE;
  var self = this;
  setTimeout(function() {
    self.area.start();

    domainDao.getDataByAreaId(self.areaId, function(err, data) {
      if (err || !data) {
        logger.error("ERROR:area.initDomainArea domainDao.getDataByAreaId");
        return;
      }
      self.domain = data;
      self.guildId = data.guildId;

      var guildTown = dataApi.guild_town.findById(self.areaId % 1000);
      if (guildTown) {
        var deltaX = 150;
        var deltaY = 80;

        self.domain.guildTown = guildTown;
        self.domain.minX = guildTown.pointX - deltaX;
        self.domain.maxX = guildTown.pointX + deltaX;
        self.domain.minY = guildTown.pointY - deltaY;
        self.domain.maxY = guildTown.pointY + deltaY;
      }
      //just for test
      // self.startBattle();
    });
  }, 3000);
};

// AreaDomainLogic.prototype.stopDomainBattle = function() {
//   if (this.areaState === AreaStates.DOMAIN_STATE) {
//     return;
//   }
// };

AreaDomainLogic.prototype.updateDomainBattle = function() {
  if (!this.domain || !this.domain.guildTown) {
    logger.error("ERROR updateDomainBattle !this.domain areaId=" + this.areaId);
    return;
  }
  var players = this.area.players;
  var entities = this.area.entities;
  var entity, guild;
  var domain = this.domain;
  var guilds = {};
  var maxCountGuildId;
  var maxCount = 0;
  var totalCount = 0;
  for (var key in players) {
    entity = entities[players[key]];
    if (entity && !entity.died) {
      if (entity.x >= domain.minX && entity.x <= domain.maxX && entity.y >= domain.minY && entity.y <= domain.maxY) {
        totalCount++;
        if (entity.guildId) {
          guild = guilds[entity.guildId];
          if (!guild) {
            guild = [];
            guilds[entity.guildId] = guild;
          }
          guild.push(entity);
          if (guild.length > maxCount) {
            maxCountGuildId = entity.guildId;
            maxCount = guild.length;
          }
        }
      }
    }
  }
  if (!totalCount) {
    if (this.occupyGuildId) {
      this.occupyValue = 0;
      this.occupyGuildId = 0;

      this.onDomainBattle(this.occupyGuildId, this.occupyValue);
    }
    return;
  }
  var otherCount = totalCount - maxCount;
  if (this.occupyGuildId) {
    var guild = guilds[this.occupyGuildId];
    if (guild) {
      var currentCount = guild.length;
      otherCount = totalCount - currentCount;
      if (otherCount === 0) {
        currentCount = currentCount + 2;
      } else {
        currentCount = currentCount - otherCount;
      }
      if (currentCount !== 0) {
        this.occupyValue += currentCount*30;
        if (this.occupyValue>1000) {
          this.occupyValue=1000;
        }
        this.onDomainBattle(this.occupyGuildId, this.occupyValue);
        if (this.occupyValue===1000) {
          this.stopBattle();
        }
        return;
      }
      if (this.occupyValue > 0) {
        return;
      }
    }
  }

  this.occupyValue = 0;
  this.occupyGuildId = 0;

  var deltaCount = maxCount - otherCount;
  if (deltaCount > 0) {
    this.occupyGuildId = maxCountGuildId;
    this.occupyValue = 2;
    // if (otherCount === 0) {
    //   this.occupyValue += deltaCount + 2;
    // } else {
    //   this.occupyValue += deltaCount;
    // }
    this.onDomainBattle(this.occupyGuildId, this.occupyValue);
  }
  console.log("continue guildId=" + this.occupyGuildId + ",occupyValue=" + this.occupyValue);
};

AreaDomainLogic.prototype.onUpdateDomain = function(msg) {
  if (!this.channel) {
    this.channel = this.area.getChannel();
  }
  this.channel.pushMessage("onUpdateDomain", msg);
};

AreaDomainLogic.prototype.onDomainBattle = function(guildId, value) {
  if (!this.channel) {
    this.channel = this.area.getChannel();
  }
  this.channel.pushMessage("onDomainBattle", {
    guildId: guildId,
    value: value
  });
};



/////////////////////////////////////////////
//AreaFightLogic
var AreaFightLogic = function(opts) {
  AreaLogic.call(this, opts);
};

util.inherits(AreaFightLogic, AreaLogic);

AreaFightLogic.prototype.enterArea = function(player) {
  if (!this.fightPlayers) {
    this.fightPlayers = [];
  }
  if (this.fightPlayers.length === 0) {
    player.x = 800;
    player.y = 180;
    this.fightPlayers.push(player);
  } else if (this.fightPlayers.length === 1) {
    player.x = 1100;
    player.y = 180;
    this.fightPlayers.push(player);
    var self = this;
    setTimeout(function() {
      self.onRunArea();
    }, 1000);
  } else {
    logger.error("terrible error: more than two player");
  }
};

AreaFightLogic.prototype.exitArea = function(player) {
  // delete this["fightPlayers"];
  this.finishFight(player.id);
};

AreaFightLogic.prototype.diedInArea = function(player) {
  this.finishFight(player.id);
};

// AreaFightLogic.prototype.reviveInArea = function(player) {};

AreaFightLogic.prototype.startLogic = function() {

};

AreaFightLogic.prototype.finishFight = function(loserId) {
  if (this.isFinishFight) {
    return;
  }
  this.isFinishFight = true;

  var winnerId, playerId;
  var players = this.area.players;
  for (var key in players) {
    playerId = Number(key);
    if (playerId !== loserId) {
      winnerId = playerId;
    }
  }

  var self = this;
  pomelo.app.rpc.fight.fightRemote.finishFight(null, winnerId, loserId, function(err, fightLevel) {
    if (fightLevel) {
      var winner = self.area.getPlayer(winnerId);
      winner.fightLevel = fightLevel;
    }
    self.onFinishFight(winnerId, loserId);
  });
};


/////////////////////////////////////////////
//AreaMyBossLogic
var AreaMyBossLogic = function(opts) {
  AreaLogic.call(this, opts);
};

util.inherits(AreaMyBossLogic, AreaLogic);

AreaMyBossLogic.prototype.enterArea = function(player) {
  logger.info("AreaMyBossLogic enterArea=======>>");

  var myBossDatas=dataApi.myboss.all();
  var myBossData;
  for (var key in myBossDatas) {
    if (myBossDatas[key].areaId===this.areaId) {
      myBossData=myBossDatas[key];
    }
  }
  if (!myBossData) {
    messageService.pushLogTipsToPlayer(player,137);
    return;
  }
  this.myBossData=myBossData;

  player.x=myBossData.playerX;
  player.y=myBossData.playerY;

  var mobData=formula.createMob(myBossData.bossId,myBossData.bossLevel);
  mobData.areaId = this.areaId;
  mobData.x=myBossData.bossX;
  mobData.y=myBossData.bossY;
  var mob = new Mob(mobData);
  mob.isActiveAttack=true;
  this.area.map.genPatrolPath(mob,300,250);
  mob.area=this.area;
  this.area.addEntity(mob);
};

AreaMyBossLogic.prototype.exitArea = function(player) {
  logger.info("AreaMyBossLogic exitArea=======>>");
  // var instanceId=this.area.instanceId;
  // process.nextTick(function(){
  //   if (pomelo.app.areaManager.removeInstance) {
  //     pomelo.app.areaManager.removeInstance(instanceId);
  //   }
  // });
};

// AreaMyBossLogic.prototype.diedInArea = function(player) {
//   logger.info("AreaMyBossLogic diedInArea=======>>");
// };

AreaMyBossLogic.prototype.reviveInArea = function(player) {
  logger.info("AreaMyBossLogic reviveInArea=======>>");
  this.area.timer.abortAllAction(player.entityId);
  if (player.isRevive) {
    player.onRevive();
  } else {
    player.died = true;
    player.onDragArea(2001);
  }
};

AreaMyBossLogic.prototype.startLogic = function() {
  logger.info("AreaMyBossLogic startLogic=======>>");
  this.area.start();
};

AreaMyBossLogic.prototype.killReward = function(attacker, target, msg, items) {
  if (target.type === EntityType.MOB) {
    if (this.myBossData.bossId === target.kindId) {
      var taskItems = this.myBossData.items;
      if (taskItems) {
        if (typeof taskItems === 'string') {
          taskItems = JSON.parse(taskItems);
          this.myBossData.items = taskItems;
        }
        var taskItem, itemData, item, kindId, type;
        for (var i = 0; i < taskItems.length; i++) {
          taskItem = taskItems[i];
          itemData = {
            kindId: taskItem[0],
            type: taskItem[1]
          };

          if (itemData.type === EntityType.EQUIPMENT) {
            var configData = dataApi.equipment.findById(itemData.kindId);
            itemData.baseValue = Math.floor(configData.baseValue * (Math.random() + 1) * 0.5);
            itemData.potential = Math.floor(configData.potential * (Math.random() + 1) * 0.5);

            var point=target.genRandomPoint();
            itemData.x=point.x;
            itemData.y=point.y;
            var equipment = new Equipment(itemData);

            this.area.addEntity(equipment);
            items.push(equipment.strip());
          } else {
            itemData.count = taskItem[2];
            var point=target.genRandomPoint();
            itemData.x=point.x;
            itemData.y=point.y;
            item = new Item(itemData);

            this.area.addEntity(item);
            items.push(item.strip());
          }
        }
      }

      var exp = target.getKillExp(attacker.level);
      if (exp) {
        attacker.addExperience(exp);
        msg.exp = exp;
      }
    }
  }
};


var areaLogicsList = {};
areaLogicsList[AreaKinds.SAFE_AREA] = AreaNormalLogic;
areaLogicsList[AreaKinds.NORMAL_AREA] = AreaNormalLogic;
areaLogicsList[AreaKinds.DOMAIN_AREA] = AreaDomainLogic;
areaLogicsList[AreaKinds.FIGHT_AREA] = AreaFightLogic;
areaLogicsList[AreaKinds.MY_BOSS_AREA]=AreaMyBossLogic;
// areaLogicsList[AreaKinds.SAFE_AREA]=AreaNormalLogic;


var createAreaLogic = function(area) {
  return new areaLogicsList[area.areaKind](area);
};

module.exports = createAreaLogic;


function saveDomain(domain) {
  domainDao.update(domain);
}

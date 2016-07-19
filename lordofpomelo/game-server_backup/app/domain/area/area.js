var dataApi = require('../../util/dataApi');
var MobZone = require('./../map/mobzone');
var ItemZone = require('./../map/itemzone');
var NPC = require('./../entity/npc');
var pomelo = require('pomelo');
var ai = require('../../ai/ai');
var patrol = require('../../patrol/patrol');
var ActionManager = require('./../action/actionManager');
var aoiManager = require('pomelo-aoi');
// var eventManager = require('./../event/eventManager');
var aoiEventManager = require('./../aoi/aoiEventManager');
var consts = require('../../consts/consts');
var utils = require('../../util/utils');
var Timer = require('./timer');
var logger = require('pomelo-logger').getLogger(__filename);
var channelUtil = require('../../util/channelUtil');
var domainDao = require('../../dao/domainDao');

var createAreaLogic=require('./areaLogic');

var EntityType = consts.EntityType;
//var AreaKinds = consts.AreaKinds;
//var AreaStates = consts.AreaStates;

/**
 * Init areas
 * @param {Object} opts
 * @api public
 */
var Instance = function(map,instanceId){
  this.map =map;
  this.instanceId = instanceId;
  var opts=map.areaConfigData;
  logger.info("area create  areaId=",opts.id);
  this.areaId = opts.id;
  this.type = opts.type;
  this.areaKind = opts.kind;

  //The map from player to entity
  this.players = {};
  this.users = {};
  this.entities = {};
  this.zones = {};
  this.items = {};
  this.npcs = {};
  this.channel = null;

  this.playerNum = 0;
  this.emptyTime = Date.now();
  //Init AOI
  opts.towerWidth=300;
  opts.towerHeight=300;
  this.aoi = aoiManager.getService(opts);

  this.aiManager = ai.createManager({area:this});
  this.patrolManager = patrol.createManager({area:this});
  this.actionManager = new ActionManager();

  this.timer = new Timer(this);
  this.areaLogic=createAreaLogic(this);
  if(!this.areaLogic){
    logger.error("areaLogic=============>> areaId="+this.areaId);
    return;
  }
  this.areaLogic.startLogic();

};

module.exports = Instance;

Instance.prototype.enterArea = function(player) {
  this.areaLogic.enterArea(player);
};

Instance.prototype.exitArea = function(player) {
  this.areaLogic.exitArea(player);
  this.removePlayer(player.id);
};

Instance.prototype.diedInArea=function(player){
  this.areaLogic.diedInArea(player);
};

Instance.prototype.reviveInArea=function(player){
  this.areaLogic.reviveInArea(player);
};

Instance.prototype.startBattle = function() {
  this.areaLogic.startBattle();
};

Instance.prototype.stopBattle=function(){
  this.areaLogic.stopBattle();
};

Instance.prototype.update3=function(){
  this.areaLogic.update3();
};

Instance.prototype.update1=function(){
  this.areaLogic.update1();
};

Instance.prototype.isAreaState=function(areaState){
  return this.areaLogic.areaState===areaState;
};

Instance.prototype.tick = function() {
  var currentTime = Date.now();
  var item;
  for (var id in this.items) {
    item = this.entities[id];
    // if(!item){
    //   delete this.items[id];
    //   continue;
    // }
    item.update(currentTime);
    if (item.died) {
      this.channel.pushMessage('onRemoveEntities', {
        entities: [item.entityId]
      });
      this.removeEntity(item.entityId);
    }
  }
  //run all the action
  this.actionManager.update(currentTime);
  this.aiManager.update();
  this.patrolManager.update();
};

Instance.prototype.updatePlayers = function() {
  var players = this.players;
  var entities = this.entities;
  var entity;
  var currentTime=Date.now();
  for (var key in players) {
    entity = entities[players[key]];
    if (currentTime>entity.kickTime) {
      logger.error("kickTime  playerId="+key);
      this.exitArea(entity);
    }else{
      if (!entity.died) {
        entity.update();
      }
    }
  }
};

Instance.prototype.updateZones=function(){
  var zones=this.zones;
  for (var key in zones) {
    zones[key].update();
  }
};


// Instance.prototype.onStartBattle=function(){
//   this.getChannel().pushMessage("onStartBattle", {});
// };

// Instance.prototype.onFinishFight = function(winnerId, loserId) {
//   this.getChannel().pushMessage("onFinishFight", {
//     winnerId: winnerId,
//     loserId: loserId
//   });
// };

Instance.prototype.onRunArea = function() {
  this.getChannel().pushMessage("onRunArea", {});
};

Instance.prototype.onDragArea = function(areaId) {
  this.getChannel().pushMessage("onDragArea", {
    areaId: areaId
  });
};

Instance.prototype.onUserLeave = function(playerId) {
  this.getChannel().pushMessage("onUserLeave", {
    playerId: playerId
  });
};

/**
 * @api public
 */
Instance.prototype.start = function() {
  aoiEventManager.addEvent(this, this.aoi.aoi);

  //Init mob zones
  this.initMobZones();
  this.initNPCs();

  this.aiManager.start();
  this.timer.run();
};

Instance.prototype.close = function(){
  utils.myPrint('area.close areaId= ',this.areaId,',instanceId=',this.instanceId);

  this.timer.close();
  this.areaLogic.close();
  
  var self=this;
  setTimeout(function() {
    for (var key in self) {
      delete self[key];
    }
    self=null;
  }, 100);
};

/**
 * Init npcs
 * @api private
 */
Instance.prototype.initNPCs = function() {
  var npcs = this.map.getNPCs();
  if (!npcs) {
    return;
  }
  for(var i = 0; i < npcs.length; i++) {
    var data = npcs[i];
    //data.kindId = data.kindId;
    var npcInfo = dataApi.npc.findById(data.kindId);
    if (!npcInfo) {
      logger.error("npc data not be founded this.areaId="+this.areaId+"npc kindId="+data.kindId);
      continue;
    }
    // data.kindName = npcInfo.name;
    // data.kindType = npcInfo.kindType;
    //data.orientation = data.orientation;
    data.areaId = this.areaId;
    this.addEntity(new NPC(data));
  }
};

Instance.prototype.getChannel = function() {
  if(!this.channel){
    var channelName;
    if (this.instanceId) {
      channelName = channelUtil.getAreaChannelName(this.instanceId);
    }else{
      channelName = channelUtil.getAreaChannelName(this.areaId);
    }
    this.channel = pomelo.app.get('channelService').getChannel(channelName, true);
    utils.myPrint('channelName = ',channelName);
  }
  return this.channel;
};

/**
 * Init all zones in area
 * @api private
 */
Instance.prototype.initMobZones = function() {
  var mobZones=this.map.getMobZones()
  if (!mobZones) {
    return;
  }
  var opts,zone;
  for(var i = 0; i < mobZones.length; i++) {
    opts = mobZones[i];
    opts.area = this;
    if (!opts.level) {
      zone = new ItemZone(opts);
    }else{
      zone = new MobZone(opts);
    }
    this.zones[zone.zoneId] = zone;
  }
};

/**
 * Add entity to area
 * @param {Object} e Entity to add to the area.
 */
Instance.prototype.addEntity = function(e) {
  if(!e || !e.entityId) {
    return false;
  }
  this.entities[e.entityId] = e;
  // eventManager.addEvent(e);
  if(e.type === EntityType.PLAYER) {
    if(!!this.players[e.id]) {
      logger.error('add player twice! player : %j', e);
      return false;
    }

    this.getChannel().add(e.userId, e.serverId);
    // this.aiManager.addCharacters([e]);
    this.aoi.addWatcher({id: e.entityId, type: e.type}, e, e.range);
    this.players[e.id] = e.entityId;
    this.users[e.userId] = e.id;

    this.playerNum++;
  }else if(e.type === EntityType.MOB) {
    this.aiManager.addCharacters([e]);
    this.aoi.addWatcher({id: e.entityId, type: e.type}, e, e.range);
  
  }else if(e.type === EntityType.ITEM) {
    this.items[e.entityId] = e.entityId;
  
  }else if(e.type === EntityType.EQUIPMENT) {
    this.items[e.entityId] = e.entityId;
  
  }else if (e.type === EntityType.NPC) {
    this.npcs[e.kindId] = e;
    e.area = this;
    return true;
  }
  //Set area and areaId
  e.area = this;

  this.aoi.addObject({id:e.entityId, type:e.type},e);
  return true;
};

/**
 * Remove Entity form area
 * @param {Number} entityId The entityId to remove
 * @return {boolean} remove result
 */
Instance.prototype.removeEntity = function(entityId) {
  var entities = this.entities;
  var players = this.players;
  var users = this.users;
  var items = this.items;

  var e = entities[entityId];
  if(!e) return true;

  //If the entity is a player, remove it
  if(e.type === EntityType.PLAYER) {
    this.getChannel().leave(e.userId, e.serverId);

    this.aiManager.removeCharacter(e.entityId);
    this.patrolManager.removeCharacter(e.entityId);
    this.actionManager.abortAllAction(entityId);

    e.forEachEnemy(function(enemy) {
      enemy.forgetHater(e.entityId);
    });

    e.forEachHater(function(hater) {
      hater.forgetEnemy(e.entityId);
    });

    this.aoi.removeWatcher({id:e.entityId, type:e.type}, e, e.range+1);
    delete players[e.id];
    delete users[e.userId];

    this.playerNum--;

    if(this.playerNum === 0){
      this.emptyTime = Date.now();
    }
  }else if(e.type === EntityType.MOB) {
    //If the entity belong to a subzone, remove it
    var zones = this.zones;
    if(!!zones[e.zoneId]) {
      zones[e.zoneId].remove(entityId);
    }

    this.aiManager.removeCharacter(e.entityId);
    this.patrolManager.removeCharacter(e.entityId);
    this.actionManager.abortAllAction(entityId);

    e.forEachEnemy(function(enemy) {
      enemy.forgetHater(e.entityId);
    });

    e.forEachHater(function(hater) {
      hater.forgetEnemy(e.entityId);
    });

    this.aoi.removeWatcher({id:e.entityId, type:e.type}, e, e.range+1);
  }else if(e.type === EntityType.ITEM){
    var zones = this.zones;
    if(!!zones[e.zoneId]) {
      zones[e.zoneId].remove(entityId);
    }
    delete items[entityId];
  }else if(e.type === EntityType.EQUIPMENT) {
    delete items[entityId];
  }

  // this.aoi.removeObject(e, {x: e.x, y: e.y});
  this.aoi.removeObject({id: e.entityId, type: e.type}, e);
  delete entities[entityId];

  for (var key in e) {
    delete e[key];
  }
  return true;
};

/**
 * Get entity from area
 * @param {Number} entityId.
 */
Instance.prototype.getEntity = function(entityId) {
  var entity = this.entities[entityId];
  if (!entity) {
    return null;
  }
  return entity;
};

/**
 * Get entities by given id list
 * @param {Array} The given entities' list.
 * @return {Map} The entities
 */
Instance.prototype.getEntities = function(ids) {
  var result = {};
  result.length = 0;
  for(var i = 0; i < ids.length; i++) {
    var entity = this.entities[ids[i]];
    if(!!entity) {
      if(!result[entity.type]){
        result[entity.type] = [];
      }

      result[entity.type].push(entity);
      result.length++;
    }
  }
  return result;
};

Instance.prototype.getEntitieStrips = function(ids) {
  var result = {};
  result.length = 0;
  var entity;
  for(var i = 0; i < ids.length; i++) {
    entity = this.entities[ids[i]];
    if(!!entity) {
      if(!result[entity.type]){
        result[entity.type] = [];
      }
      result[entity.type].push(entity.strip());
      result.length++;
    }
  }

  for (var key in this.npcs) {
    entity = this.npcs[key];
    if (!result[entity.type]) {
      result[entity.type] = [];
    }
    result[entity.type].push(entity.strip());
    result.length++;
  }
  return result;
};

Instance.prototype.getAllPlayers = function() {
  var players = [];
  for(var id in this.players) {
    players.push(this.entities[this.players[id]]);
  }
  return players;
};

Instance.prototype.getAllEntities = function() {
  return this.entities;
};

Instance.prototype.getPlayer = function(playerId) {
  var entityId = this.players[playerId];
  if(!!entityId) {
    return this.entities[entityId];
  }
  return null;
};

Instance.prototype.removePlayer = function(playerId) {
  var entityId = this.players[playerId];
  if(!!entityId) {
    this.removeEntity(entityId);
  }
};

Instance.prototype.removePlayerByUid = function(uid){
  var users = this.users;
  var playerId = users[uid];

  if(!!playerId){
    delete users[uid];
    this.removePlayer(playerId);
  }
};

/**
 * Get area entities for given postion and range.
 * @param {Object} pos Given position, like {10,20}.
 * @param {Number} range The range of the view, is the circle radius.
 */
Instance.prototype.getAreaInfo = function(pos, range) {
  var ids = this.aoi.getIdsByPos(pos, range);
  return this.getEntities(ids);
};

Instance.prototype.getAreaInfoStrip = function(pos, range) {
  var ids = this.aoi.getIdsByPos(pos, range);
  return this.getEntitieStrips(ids);
};

/**
 * Get entities from area by given pos, types and range.
 * @param {Object} pos Given position, like {10,20}.
 * @param {Array} types The types of the object need to find.
 * @param {Number} range The range of the view, is the circle radius.
 */
Instance.prototype.getEntitiesByPos = function(pos, types, range) {
  var entities = this.entities;
  var idsMap = this.aoi.getIdsByRange(pos, range, types);
  var result = {};
  for(var type in idsMap) {
    if(type === EntityType.NPC || type === EntityType.ITEM) continue;
    if(!result[type]) {
      result[type] = [];
    }
    for(var i = 0; i < idsMap[type].length; i++) {
      var id = idsMap[type][i];
      if(!!entities[id]) {
        result[type].push(entities[id]);
      }else{
        logger.error('AOI data error ! type : %j, id : %j', type, id);
      }
    }
  }
  return result;
};

Instance.prototype.isEmpty = function(){
  return this.playerNum === 0;
};


// Instance.prototype.pushMessage = function(route, msg) {
//   this.getChannel().pushMessage(route, msg);
// };

var messageService = require('./../messageService');
var logger = require('pomelo-logger').getLogger(__filename);
var consts=require('../../consts/consts')
var EntityType = consts.EntityType;
var ActionType = consts.ActionType;
// var AreaKinds=consts.AreaKinds;


var Timer = function(area) {
  this.area = area;
  // this.interval =interval || 100;
};

module.exports = Timer;

Timer.prototype.run = function() {
  // var area=this.area;
  this.interval = setInterval(this.tick.bind(this), 100);
  // this.interval = setInterval(area.tick.bind(area), 100);
  // this.interval1 = setInterval(area.update1.bind(area), 1000);
  // this.interval3 = setInterval(area.update3.bind(area), 3000);
  this.isRunning=true;
  this.timeCount=0;
};

Timer.prototype.tick = function() {
  if (this.area) {
    this.area.tick();
    this.timeCount++;
    if (this.timeCount%10===0) {
      this.area.update1();
    }
    if (this.timeCount>30) {
      this.timeCount=0;
      this.area.update3();
    }
  }
};

Timer.prototype.close = function() {
  clearInterval(this.interval);
  // clearInterval(this.interval1);
  // clearInterval(this.interval3);
  for (var key in this) {
    delete this[key]; 
  }
};

// Timer.prototype.update = function() {
//   var area = this.area;

//   var players = area.players;
//   var entities = area.entities;
//   var entity;
//   for (var key in players) {
//     entity = entities[players[key]];
//     if (entity)
//       entity.update();
//   }
// };

// Timer.prototype.tick = function() {
//   var area = this.area;
//   //Update mob zones
//   // for (var key in area.zones) {
//   //   area.zones[key].update();
//   // }

//   //Update all the items
//   var currentTime = Date.now();
//   var item;
//   for (var id in area.items) {
//     item = area.entities[id];
//     item.update(currentTime);
//     if (item.died) {
//       area.channel.pushMessage('onRemoveEntities', {
//         entities: [id]
//       });
//       area.removeEntity(id);
//     }
//   }

//   //run all the action
//   area.actionManager.update();
//   area.aiManager.update();
//   area.patrolManager.update();
// };

/**
 * Add action for area
 * @param action {Object} The action need to add
 * @return {Boolean}
 */
Timer.prototype.addAction = function(action) {
  if(!this.isRunning) return;

  return this.area.actionManager.addAction(action);
};

/**
 * Abort action for area
 * @param type {Number} The type of the action
 * @param id {Id} The id of the action
 */
Timer.prototype.abortAction = function(type, id) {
  return this.area.actionManager.abortAction(type, id);
};

/**
 * Abort all action for a given id in area
 * @param id {Number}
 */
Timer.prototype.abortAllAction = function(id) {
  this.area.actionManager.abortAllAction(id);
};

/**
 * Enter AI for given entity
 * @param entityId {Number} entityId
 */
Timer.prototype.enterAI = function(entityId) {
  var area = this.area;

  area.patrolManager.removeCharacter(entityId);
  this.abortAction(ActionType.MOVE, entityId);
  if (!!area.entities[entityId]) {
    area.aiManager.addCharacters([area.entities[entityId]]);
  }
};

/**
 * Enter patrol for given entity
 * @param entityId {Number}
 */
Timer.prototype.patrol = function(entityId) {
  var area = this.area;

  area.aiManager.removeCharacter(entityId);

  if (!!area.entities[entityId]) {
    area.patrolManager.addCharacters([{
      character: area.entities[entityId],
      path: area.entities[entityId].path
    }]);
  }
};

/**
 * Update object for aoi
 * @param obj {Object} Given object need to update.
 * @param oldPos {Object} Old position.
 * @param newPos {Object} New position.
 * @return {Boolean} If the update success.
 */
Timer.prototype.updateObject = function(obj, oldPos, newPos) {
  return this.area.aoi.updateObject(obj, oldPos, newPos);
};

/**
 * Get all the watchers in aoi for given position.
 * @param pos {Object} Given position.
 * @param types {Array} The watchers types.
 * @param ignoreList {Array} The ignore watchers' list.
 * @return {Array} The qualified watchers id list.
 */
Timer.prototype.getWatcherUids = function(pos, types, ignoreList) {
  var area = this.area;

  var watchers = area.aoi.getWatchers(pos, types);
  var result = [];
  if (!!watchers && !!watchers[EntityType.PLAYER]) {
    var pWatchers = watchers[EntityType.PLAYER];
    for (var entityId in pWatchers) {
      var player = area.getEntity(entityId);
      if (!!player && !!player.userId && (!ignoreList || !ignoreList[player.userId])) {
        result.push({
          uid: player.userId,
          sid: player.serverId
        });
      }
    }
  }

  return result;
};

/**
 * Get watchers by given position and types, without ignore list.
 * @param pos {Object} Given position.
 * @param types {Array} Given watcher types.
 * @return {Array} Watchers find by given parameters.
 */
Timer.prototype.getWatchers = function(pos, types) {
  return this.area.aoi.getWatchers(pos, types);
};

/**
 * Update given watcher.
 * @param watcher {Object} The watcher need to update.
 * @param oldPos {Object} The old position of the watcher.
 * @param newPos {Ojbect} The new position of the watcher.
 * @param oldRange {Number} The old range of the watcher.
 * @param newRange {Number} The new range of the watcher.
 * @return Boolean If the update is success.
 */
Timer.prototype.updateWatcher = function(watcher, oldPos, newPos, oldRange, newRange) {
  return this.area.aoi.updateWatcher(watcher, oldPos, newPos, oldRange, newRange);
};
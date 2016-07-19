/**
 * Module dependencies
 */
var util = require('util');
var Entity = require('./entity');
var EntityType = require('../../consts/consts').EntityType;
var formula = require('../../consts/formula');

/**
 * Initialize a new 'Item' with the given 'opts'.
 * Item inherits Entity
 *
 * @param {Object} opts
 * @api public
 */
var Item = function(opts) {
  Entity.call(this, opts);
  this.type = EntityType.ITEM;
  // this.name = opts.name;
  this.count=opts.count || 1;
  this.zoneId = opts.zoneId;
  this.level=opts.heroLevel;
  this.baseExp=opts.baseExp;

  this.playerId =0;
  // this.desc = opts.desc;
  // this.englishDesc = opts.englishDesc;
  // this.hp = opts.hp;
  // this.mp = opts.mp;
  // this.price = opts.price;
  // this.heroLevel = opts.heroLevel;
  // this.imgId = opts.imgId;
  // this.time = Date.now();
  // this.playerId = opts.playerId || 0;
  // this.died = false;
  // this.lifetime = 15;
  // this.lastTime=this.lifetime*1000+Date.now();
  this.died = false;
};

util.inherits(Item, Entity);

/**
 * Expose 'Item' constructor.
 */
module.exports = Item;

/**
 * Item refresh every 'lifetime' millisecond
 *
 * @api public
 */
Item.prototype.update = function(currentTime){
  if(this.playerId && currentTime>this.lastTime){
    this.died = true;
    var player = this.area.getPlayer(this.playerId);
    if (player) {
      if (!player.updateCollectTaskData(this)) {
        player.addItem(this);
        var exp = this.getKillExp(player.level);
        player.addExp(exp);
      }
    }
  }
};

Item.prototype.getKillExp = function(playerLevel) {
  return formula.calMobExp(this.baseExp, playerLevel, this.level);
};

// Item.prototype.toJSON = function() {
//   return {
//     entityId: this.entityId,
//     kindId: this.kindId,
//     x: this.x,
//     y: this.y,
//     playerId: this.playerId,
//     type: this.type
//   };
// };

Item.prototype.strip = function() {
  return {
    entityId: this.entityId,
    type:this.type,
    kindId: this.kindId,
    x: this.x,
    y: this.y
    // playerId: this.playerId
  };
};

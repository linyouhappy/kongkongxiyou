/**
 * Module dependencies
 */
var util = require('util');
var Entity = require('./entity');
var EntityType = require('../../consts/consts').EntityType;
var dataApi = require('../../util/dataApi');
var PropertyKind = require('../../consts/consts').PropertyKind;

/**
 * Initialize a new 'Equipment' with the given 'opts'.
 * Equipment inherits Entity
 *
 * @class ChannelService
 * @constructor
 * @param {Object} opts
 * @api public
 */
var Equipment = function(opts) {
  Entity.call(this, opts);
  this.type = EntityType.EQUIPMENT;

  this.playerId = opts.playerId || 0;
  // this.name=opts.name;
  this.position=0;
  // this.kind=opts.kind || PropertyKind.Hp;
  this.jobId=opts.jobId
  this.baseValue=opts.baseValue || 0;
  this.potential=opts.potential || 0;
  this.percent=opts.percent || 0;
  this.totalStar=opts.totalStar || 0;

  this.star1 = opts.star1 || 0;
  this.star2 = opts.star2 || 0;
  this.star3 = opts.star3 || 0;
  this.star4 = opts.star4 || 0;
  this.star5 = opts.star5 || 0;
  this.star6 = opts.star6 || 0;
  this.star7 = opts.star7 || 0;
  this.star8 = opts.star8 || 0;
  this.star9 = opts.star9 || 0;
  this.star10 = opts.star10 || 0;
  this.star11 = opts.star11 || 0;
  this.star12 = opts.star12 || 0;
  // this.starCount = opts.starCount || 0;

  // this.name = opts.name;
  // this.desc = opts.desc;
  // this.englishDesc = opts.englishDesc;
  // this.kind = opts.kind;
  // this.attackValue = opts.attackValue;
  // this.defenceValue = opts.defenceValue;
  // this.price = opts.price;
  // this.color = opts.color;
  // this.heroLevel = opts.heroLevel;
  // this.imgId = opts.imgId;
  // var entityData = dataApi.equipment.findById(opts.kindId);
  this.lifetime=30;
  this.lastTime=this.lifetime*1000+Date.now();
  this.died = false;
};

util.inherits(Equipment, Entity);

/**
 * Expose 'Equipment' constructor.
 */
module.exports = Equipment;

/**
 * Equipment refresh every 'lifetime' millisecond
 *
 * @api public
 */
Equipment.prototype.update = function(currentTime) {
  if(currentTime>this.lastTime){
    this.died = true;
  }
};

// Equipment.prototype.toJSON = function() {
//   return {
//     entityId: this.entityId,
//     kindId: this.kindId,
//     x: this.x,
//     y: this.y,
//     playerId: this.playerId,
//     type: this.type
//   };
// };

Equipment.prototype.strip = function() {
  return {
    entityId: this.entityId,
    kindId: this.kindId,
    type:this.type,
    x: this.x,
    y: this.y,
    playerId: this.playerId
  };
};
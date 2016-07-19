var util = require('util');
var EntityType = require('../consts/consts').EntityType;
var logger = require('pomelo-logger').getLogger(__filename);
var equipmentDao = require('../dao/equipmentDao');
var itemDao = require('../dao/itemDao');

var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');

/**
 * Initialize a new 'Bag' with the given 'opts'
 * Bag inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var BagItem = function(opts) {
  this.id = opts.id;
  this.type = opts.type;
  this.kindId = opts.kindId;
  // this.name = opts.name;
  this.position = opts.position || 0;
  this.playerId = opts.playerId;

  if (this.type === EntityType.EQUIPMENT) {
    var equipmentData = dataApi.equipment.findById(this.kindId);
    this.heroLevel = equipmentData.heroLevel;
    this.equipKind = equipmentData.kind;
    this.jobId=opts.jobId;
    this.bind=opts.bind || 0;
    this.itemId=opts.itemId;

    if (opts.baseValue) {
      this.baseValue = opts.baseValue;
      this.potential = opts.potential;
      this.percent = opts.percent;
      this.totalStar = opts.totalStar;
    }else{
      this.baseValue = opts.baseValue || equipmentData.baseValue;
      this.potential = opts.potential || equipmentData.potential;
      this.percent = opts.percent || 0;
      this.totalStar = opts.totalStar || 0;
    }

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

  } else {
    this.itemData = dataApi.item.findById(this.kindId);
    this.count = opts.count;
  }
};

module.exports = BagItem;

BagItem.prototype.getPropertyValue = function() {
  return Math.floor(this.baseValue+this.potential*this.percent/100);
};

BagItem.prototype.resetValue = function() {
  if (this.type === EntityType.EQUIPMENT) {
    var percent = 0;
    var totalStar = 0;
    var starValue;
    for (var i = 1; i <= 12; i++) {
      starValue=this["star"+i];
      if (starValue) {
        totalStar++;
        percent+=starValue;
      }
    }
    this.percent = percent;
    this.totalStar = totalStar;
  }
};

BagItem.prototype.setStarValue = function(starValue) {
  var starIndex = 0;
  if (this.type === EntityType.EQUIPMENT) {
    for (var i = 1; i <= 12; i++) {
      if (!this["star" + i]) {
        this["star" + i] = starValue;
        starIndex = i;
        break;
      }
    }
  }
  return starIndex;
};

BagItem.prototype.equipStrip = function() {
  return {
    id: this.id,
    kindId: this.kindId,
    bind: this.bind,
    baseValue: this.baseValue,
    potential: this.potential,
    percent: this.percent,
    totalStar: this.totalStar
  };
};

BagItem.prototype.equipDetailStrip = function() {
  return {
    id: this.id,
    kindId: this.kindId,
    star1: this.star1,
    star2: this.star2,
    star3: this.star3,
    star4: this.star4,
    star5: this.star5,
    star6: this.star6,
    star7: this.star7,
    star8: this.star8,
    star9: this.star9,
    star10: this.star10,
    star11: this.star11,
    star12: this.star12,
  };
};

BagItem.prototype.strip = function() {
  if (this.type === EntityType.EQUIPMENT) {
    return {
      id: this.id,
      type: this.type,
      kindId: this.kindId,
      jobId: this.jobId,
      bind: this.bind,
      baseValue: this.baseValue,
      potential: this.potential,
      percent: this.percent,
      totalStar: this.totalStar
    };
  } else {
    return {
      id: this.id,
      type: this.type,
      kindId: this.kindId,
      count: this.count
    };
  }
};

BagItem.prototype.create = function(cb) {
  if (this.type === EntityType.EQUIPMENT) {
    equipmentDao.createEquipment(this,cb);
  } else {
    itemDao.createItem(this,cb);
  }
};

BagItem.prototype.destroy = function(cb) {
  if (this.type === EntityType.EQUIPMENT) {
    equipmentDao.destroy(this.id,cb);
  } else {
    itemDao.destroy(this.id,cb);
  }
};

BagItem.prototype.saveCount = function(cb) {
  if (this.type === EntityType.ITEM) {
    itemDao.updateCount(this,cb);
  }else{
    utils.invokeCallback(cb,null);
  }
};

BagItem.prototype.savePosition = function() {
  if (this.type === EntityType.EQUIPMENT) {
    equipmentDao.updatePosition(this);
  } else {
    // itemDao.updatePosition(this);
  }
};

BagItem.prototype.saveDetail = function() {
  if (this.type === EntityType.EQUIPMENT) {
    equipmentDao.updateDetail(this);
  } 
};


BagItem.prototype.save = function() {
  if (this.type === EntityType.EQUIPMENT) {
    pomelo.app.get('sync').exec('equipmentSync.updateEquipment', this.id, this);
  } else {

  }
};
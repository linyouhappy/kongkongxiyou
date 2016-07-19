var util = require('util');
var Entity = require('./entity/entity');
var EntityType = require('../consts/consts').EntityType;
var Persistent = require('./persistent');
var logger = require('pomelo-logger').getLogger(__filename);
var BagItem = require('./bagItem');
var utils = require('../util/utils');
var dataApi = require('../util/dataApi');
var Equipments = require('./equipments');

/**
 * Initialize a new 'Bag' with the given 'opts'
 * Bag inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var Bag = function(opts) {
  this.playerId = opts.playerId;
  this.capacity = 40;
  this.equipments = new Equipments();
  this.items = {};
  this.bagItems = {};
  this.itemsCount = 0;
};

//util.inherits(Bag, Persistent);

module.exports = Bag;
/**
 * add item
 *
 * @param {obj} item {id: 123, type: 'item'}
 * @return {number}
 * @api public
 */
Bag.prototype.addItem = function(bagItem) {
  if (!bagItem || !bagItem.id) {
    logger.error("ERROR:Bag.addItem bagItem is invalid id:" + bagItem.id);
    return;
  }
  if (this.bagItems[bagItem.id]) {
    logger.error("ERROR:Bag.addItem bagItem is exist id:" + bagItem.id);
    return;
  }
  if (bagItem.type === EntityType.EQUIPMENT) {
    this.itemsCount++;
    this.bagItems[bagItem.id] = bagItem;
  }else{
    logger.error("ERROR:Bag.addItem bagItem is invalid type:" + bagItem.type);
  }
  return bagItem;
};

Bag.prototype.addItemWithCb = function(bagItem, cb) {
  if (!bagItem) {
    logger.error("ERROR:Bag.addItemWithCb bagItem is null");
    utils.invokeCallback(cb, "bagItem is invalid");
    return;
  }
  if (bagItem.type !== EntityType.EQUIPMENT) {
    logger.error("ERROR:Bag.addItemWithCb bagItem is invalid type:" + bagItem.type);
    utils.invokeCallback(cb, "bagItem is invalid");
    return;
  }
  if (bagItem.id) {
    if (this.addItem(bagItem)) {
      utils.invokeCallback(cb, "add bagItem is failed");
    } else {
      utils.invokeCallback(cb, null, bagItem);
    }
  } else {
    bagItem.playerId = this.playerId;
    var self = this;
    bagItem.create(function(err, bagItem) {
      if (err) {
        logger.error("ERROR: bagItem.create is err:" + bagItem.type);
        utils.invokeCallback(cb, err);
      } else {
        self.addItem(bagItem);
        utils.invokeCallback(cb, null, bagItem);
      }
    });
  }
};
/**
 * remove item
 *
 * @param {number} index
 * @return {Boolean}
 * @api public
 */
Bag.prototype.removeItem = function(id) {
  var bagItem = this.bagItems[id];
  if (bagItem) {
    if (bagItem.type === EntityType.EQUIPMENT) {
      delete this.bagItems[id];
      this.itemsCount--;
    }else{
      logger.error("ERROR:Bag.removeItem bagItem is invalid type:" + bagItem.type);
    }
  }
  return bagItem;
};

Bag.prototype.removeItemWithCb = function(id, cb) {
  var bagItem = this.bagItems[id];
  if (bagItem) {
    this.removeItem(id);
    bagItem.destroy(function(err) {
      if (err) {
        utils.invokeCallback(cb, err);
      } else {
        utils.invokeCallback(cb, null, bagItem);
      }
    });
  } else {
    utils.invokeCallback(cb, null);
  }
};

Bag.prototype.getBagItem = function(id) {
  return this.bagItems[id];
};

Bag.prototype.getItem = function(kindId) {
  return this.items[kindId];
};

Bag.prototype.addItemCount = function(item, cb) {
  var bagItem = this.items[item.kindId];
  if (bagItem) {
    bagItem.count += item.count;
    bagItem.saveCount(function(err) {
      if (err) {
        bagItem.count -= item.count;
        utils.invokeCallback(cb, err);
      } else {
        utils.invokeCallback(cb, null, bagItem);
      }
    });
  } else {
    var bagItem = new BagItem(item);
    if (bagItem.id) {
      this.items[bagItem.kindId] = bagItem;
      utils.invokeCallback(cb, null, bagItem);
      return;
    }
    bagItem.playerId = this.playerId;
    var self = this;
    bagItem.create(function(err, res) {
      if (err) {
        logger.error("Bag.addItemCount equipmentDao.createEquipment kindId:" + kindId);
        utils.invokeCallback(cb, err);
      }else{
        bagItem.id = res.id;
        self.items[bagItem.kindId] = bagItem;
        utils.invokeCallback(cb, null, bagItem);
      }
    });
  }
};

Bag.prototype.removeItemCount = function(kindId, count, cb) {
  var bagItem = this.items[kindId];
  if (bagItem) {
    if (bagItem.type !== EntityType.ITEM) {
      logger.error("Bag.removeItemCount bagItem.type!==EntityType.ITEM kindId:" + kindId);
      utils.invokeCallback(cb, "no item");
      return;
    }
    if (bagItem.count < count) {
      utils.invokeCallback(cb, null, 0);
    } else if (bagItem.count === count) {
      var self = this;
      bagItem.destroy(function(err) {
        if (err) {
          utils.invokeCallback(cb, err);
        } else {
          delete self.items[bagItem.kindId];
          utils.invokeCallback(cb, null, count);
        }
      });
    } else {
      bagItem.count -= count;
      bagItem.saveCount(function(err) {
        if (err) {
          bagItem.count += count;
          utils.invokeCallback(cb, err);
        } else {
          utils.invokeCallback(cb, null, count);
        }
      });
    }
  }
};

Bag.prototype.setEquipmentData = function(allEquipmentDatas) {
  var equipmentData, bagItem;
  var equipments = this.equipments.equipments;

  for (var key in allEquipmentDatas) {
    equipmentData = allEquipmentDatas[key];

    equipmentData.type = EntityType.EQUIPMENT;
    bagItem = new BagItem(equipmentData);

    if (bagItem.position > 0) {
      if (!equipments[bagItem.equipKind]) {
        equipments[bagItem.equipKind] = bagItem;
      } else {
        bagItem.position = 0;
        bagItem.savePosition();
        this.addItem(bagItem);
      }
    } else {
      this.addItem(bagItem);
    }
  }
};

Bag.prototype.setItemData = function(allItemData) {
  var itemData, bagItem;
  for (var key in allItemData) {
    itemData = allItemData[key];
    itemData.type = EntityType.ITEM;
    // bagItem = new BagItem(itemData);
    this.addItemCount(itemData);
  }
};

Bag.prototype.cleanUp = function() {
  var bagItems = this.bagItems;
  var bagItem, isPlusOperate;
  for (var i = 1; i <= this.capacity; i++) {
    bagItem = bagItems[i];
    if (!bagItem) {
      for (var j = this.capacity; j > i; j--) {
        if (bagItems[j]) {
          bagItems[i] = bagItems[j];
          delete bagItems[j];
          bagItem = bagItems[i];
          bagItem.position = i;

          bagItem.savePosition();
          break;
        }
      }
      if (!bagItem) {
        break;
      }
    }

    if (bagItem.type === EntityType.ITEM) {
      isPlusOperate = false;
      for (var j = this.capacity; j > i; j--) {
        if (bagItems[j]) {
          if (bagItem.kindId === bagItems[j].kindId) {
            bagItem.count += bagItems[j].count;

            bagItems[j].destroy();
            delete bagItems[j];
            isPlusOperate = true;
          }
        }
      }
      if (isPlusOperate) {
        bagItem.saveCount();
      }
    }
  }
};

Bag.prototype.strip = function() {
  var data = {};
  data.capacity = this.capacity;
  data.items = [];
  var bagItems = this.bagItems;
  var bagItem;
  for (var key in bagItems) {
    bagItem = bagItems[key];
    data.items.push(bagItem.strip());
  }
  bagItems=this.items;
  for (var key in bagItems) {
    bagItem = bagItems[key];
    if (bagItem.count>0) {
      data.items.push(bagItem.strip());
    }
  }
  return data;
};

Bag.prototype.getBagItems = function() {
  return this.bagItems;
};

Bag.prototype.bagIsFull = function() {
  return this.itemsCount >= this.capacity;
};


/**
 * Module dependencies
 */

var dataApi = require('../../../util/dataApi');
var messageService = require('../../../domain/messageService');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var formula = require('../../../consts/formula');
var EntityType = consts.EntityType;
var ItemType=consts.ItemType;

var handler = module.exports;

handler.upgradeHpMp = function(msg, session, next) {
  var player = session.player;
  var kind = msg.kind;
  var hpmpData, valueLevel;
  if (kind === 1) {
    valueLevel = player.hpLevel + 1;
    // hpmpData = dataApi.hpmp.findById(player.hpLevel+1);
  } else {
    valueLevel = player.mpLevel + 1;
    // hpmpData = dataApi.hpmp.findById(player.mpLevel+1);
  }
  hpmpData = dataApi.hpmp.findById(valueLevel);
  if (!hpmpData) {
    next(null, {
      code: 86
    });
    return;
  }
  if (hpmpData.playerLv > player.level) {
    next(null, {
      code: 87
    });
    return;
  }
  if (hpmpData.caoCoin > player.caoCoin) {
    next(null, {
      code: 88
    });
    return;
  }
  player.addCaoCoin(-hpmpData.caoCoin);
  if (kind === 1) {
    player.setHpLevel(valueLevel);
  } else {
    player.setMpLevel(valueLevel);
  }
  player.save();
  next(null, {
    code: 200,
    level: valueLevel
  });
};

handler.refineHpMp = function(msg, session, next) {
  var player = session.player;
  var kind = msg.kind;
  var kindId = msg.kindId;
  var count = msg.count;
  var item = player.bag.getItem(kindId);
  if (!item) {
    next(null, {
      code: 49
    });
    return;
  }
  if (count > item.count) {
    next(null, {
      code: 49
    });
    return;
  }
  var level;
  if (kind === 1) {
    level = player.hpLevel;
  } else {
    level = player.mpLevel;
  }
  hpmpData = dataApi.hpmp.findById(level);
  if (!hpmpData) {
    next(null, {
      code: 86
    });
    return;
  }

  // item.
  player.bag.removeItemCount(kindId, count, function(err, res) {
    if (err) {
      next(null, {
        code: 89
      });
      return;
    } else {
      var itemData = dataApi.item.findById(kindId);
      var valueCount;
      if (kind === 1) {
        if (player.hpCount < 0) {
          player.hpCount = 0;
        }
        player.hpCount += count * itemData.hp;
        player.hpCount = Math.min(player.hpCount, player.hpCapacity);
        valueCount = player.hpCount;
      } else {
        if (player.mpCount < 0) {
          player.mpCount = 0;
        }
        player.mpCount += count * itemData.mp;
        player.mpCount = Math.min(player.mpCount, player.mpCapacity);
        valueCount = player.mpCount;
      }
      player.save();
      next(null, {
        code: 200,
        count: valueCount
      });
    }
  });
};

handler.oneKeySell = function(msg, session, next) {
  var player = session.player;
  var sellItems = msg;
  var bagItem;
  var bag = player.bag;
  var idItems = bag.getBagItems();
  var totalPrice = 0;
  for (var i = 0; i < sellItems.length; i++) {
    bagItem = idItems[sellItems[i]];
    if (bagItem) {
      // totalPrice+=bagItem.baseValue+Math.floor(bagItem.potential*bagItem.percent/100)+Math.floor(consts.recycleRatio*bagItem.potential*(100-bagItem.percent)/100);
      totalPrice += formula.calItemPrice(bagItem);
      bag.removeItemWithCb(bagItem.id);
    }
  }
  player.addCaoCoin(totalPrice);
  next(null, {
    code: 200
  });
};

handler.sellItem = function(msg, session, next) {
  var player = session.player;
  player.bag.removeItemWithCb(msg.id, function(err, bagItem) {
    if (err) {
      next(null, {
        code: 89
      });
      logger.error("handler.equip bagItem position is different");
    } else {
      if (bagItem) {
        // var totalPrice=bagItem.baseValue+Math.floor(bagItem.potential*bagItem.percent/100)+Math.floor(consts.recycleRatio*bagItem.potential*(100-bagItem.percent)/100);
        var totalPrice = formula.calItemPrice(bagItem);
        player.addCaoCoin(totalPrice);
        next(null, {
          code: 200
        });
      } else {
        next(null, {
          code: 90
        });
        messageService.pushMessageToPlayer(player.sessionData, "onBagData", player.bag.strip());
      }
    }
  });
};

handler.getEquipments = function(msg, session, next) {
  var player = session.player;
  // player.equipments.strip();
  next(null, player.equipments.strip());
};

handler.getEquipDetails = function(msg, session, next) {
  var player = session.player;
  next(null, player.equipments.detailStrip());
};

handler.getEquipDetail=function(msg, session, next) {
  var player = session.player;
  var equipment=player.bag.getBagItem(msg.itemId);
  if (!equipment) {
    next(null, {
      code: 51
    });
    return;
  }
  next(null, equipment.equipDetailStrip());
};


handler.equipOpen = function(msg, session, next) {
  var player = session.player;
  var equipmentId = msg.itemId;
  var itemId = msg.kindId;

  var equipment = player.equipments.getEquipmentByEquipmentId(equipmentId);
  if (!equipment) {
    equipment = player.bag.getBagItem(equipmentId);
    if (!equipment) {
      next(null, {
        code: 51
      });
      return;
    }
  }

  equipment.resetValue();
  var totalStar = equipment.totalStar;
  if (totalStar >= 12) {
      next(null, {
        code: 52
      });
      return;
  }

  var nextTotalStar = totalStar + 1;
  var strengthData = dataApi.strength.findById(nextTotalStar);
  if (player.caoCoin < strengthData.money) {
    next(null, {
      code: 53
    });
    return;
  }

  var item = player.bag.getItem(itemId);
  if (!item || item.count<strengthData.stone) {
    next(null, {
      code: 145
    });
    return;
  }

  player.addCaoCoin(-strengthData.money);

  var probability = Math.random() * 100;
  if (probability > strengthData.probability) {
    next(null, {
      code: 54
    });
    return;
  }

  item.count-=strengthData.stone;
  item.saveCount();
  var starValue=item.itemData.hp;
  starValue += Math.floor(Math.random() * (item.itemData.mp - starValue+1))
  var starIndex = equipment.setStarValue(starValue);
  if (starIndex > 0) {
    equipment.resetValue();
  }
  equipment.saveDetail();

  next(null, {
    starIndex: starIndex,
    starValue: starValue,
    code: 200
  });
};

handler.equipRecycle = function(msg, session, next) {
  var player = session.player;
  var equipmentId = msg.itemId;

  var equipment = player.equipments.getEquipmentByEquipmentId(equipmentId);
  if (!equipment) {
    equipment = player.bag.getBagItem(equipmentId);
    if (!equipment) {
      next(null, {
        code: 51
      });
      return;
    }
  }

  var stars = msg.stars;
  var lockCount=equipment.totalStar-stars.length;
  var recycleData = dataApi.recycle.findById(lockCount);
  if (player.caoCoin < recycleData.money) {
    next(null, {
        code: 146
      });
    return;
  }

  player.addCaoCoin(-recycleData.money);

  for (var i = 0; i < stars.length; i++) {
    equipment["star" + stars[i]] = 0;
  }
  equipment.resetValue();
  equipment.saveDetail();
  next(null, {
    code: 200
  });
};


/**
 * Equip equipment, handle client' request
 *
 * @param {Object} msg, message
 * @param {Session} session
 * @api public
 */

handler.equip = function(msg, session, next) {
  var player = session.player;
  var itemId = msg.id;
  var bagItem = player.bag.getBagItem(itemId);
  if (!bagItem) {
    messageService.pushMessageToPlayer(player.sessionData, "onBagData", player.bag.strip());
    next(null, {
      code: 42
    });
    return;
  }
  if (bagItem.id !== itemId) {
    messageService.pushMessageToPlayer(player.sessionData, "onBagData", player.bag.strip());
    next(null, {
      code: 46
    });
    logger.error("handler.equip bagItem position is different");
    return;
  }
  if (bagItem.type !== EntityType.EQUIPMENT) {
    next(null, {
      code: 43
    });
    return;
  }
  if (player.level < bagItem.heroLevel) {
    next(null, {
      code: 44
    });
    return;
  }
  if (!bagItem.jobId){
    bagItem.jobId=player.jobId;
  }
  if(bagItem.jobId!==player.jobId) {
    next(null, {
      code: 147
    });
    return;
  }
  // if (!player.equipments.isCanEquip(bagItem)) {
  //   next(null, {
  //     code: 45
  //   });
  //   return;
  // }
  player.equip(bagItem);
  next(null, {
    code: 200
  });
};

/**
 * Unequip equipment, handle client' request
 *
 * @param {Object} msg
 * @param {Session} session
 * @api public
 */
handler.unEquip = function(msg, session, next) {
  var player = session.player;
  player.unEquip(msg.equipKind);
  next(null, {
    code: 200
  });
};

//drop equipment or item
handler.dropItem = function(msg, session, next) {
  var player = session.player;
  var kindId = msg.kindId;
  var item = player.bag.getItem(kindId);
  if (!item) {
    next(null, {
      code: 200
    });
    return;
  }
  player.bag.removeItemCount(kindId, item.count, function(err, res) {
    if (err) {
      next(null, {
        code: 85
      });
    } else {
      next(null, {
        code: 200
      });
    }
  });
};


//Use item
handler.useItem = function(msg, session, next) {
  var player = session.player;
  var kindId = msg.kindId;
  var bagItem = player.bag.getItem(kindId);
  if (!bagItem || bagItem.type !== EntityType.ITEM) {
    next(null, {
      code: 42
    });
    return;
  }
  var count = bagItem.count;
  if (!count) {
    next(null, {
      code: 148
    });
    return;
  }
  if (bagItem.itemData.kind = ItemType.ItemGift) {
    player.bag.removeItemCount(kindId, count, function(err, result) {
      if (err) {
        next(null, {
          code: 149,
        });
      } else {
        switch (kindId) {
          //首冲礼包
          case 8000:

            break;
            //VIP1礼包
          case 8001:
            break;
            //VIP2礼包
          case 8002:
            break;
            //VIP3礼包
          case 8003:
            break;
            //炒币
          case 8011:
            player.addCaoCoin(count);
            break;
            //粉钻
          case 8012:
            player.addCrystal(count);
            break;
        }
        next(null, {
          code: 200,
        });
      }
    });


  } else if (bagItem.itemData.kind = ItemType.ItemExp) {
    if (kindId === 8031) {
      player.bag.removeItemCount(kindId, count, function(err, result) {
        if (err) {
          next(null, {
            code: 149,
          });
        } else {
          player.addExperience(count);
          next(null, {
            code: 200,
          });
        }
      });
    }
  }
};

/**
 * Player pick up item.
 * Handle the request from client, and set player's target
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.pickItem = function(msg, session, next) {
  var area = session.area;
  var player = session.player;
  var targetId = msg.targetId;

  // utils.myPrint("handler.pickItem targetId=" + targetId);
  var target = area.getEntity(targetId);
  if (!target) {
    // utils.myPrint("handler.pickItem target is not exist. targetId=" + targetId);
    messageService.pushMessageByAOI(area, 'onRemoveEntities', {
      entities: [targetId]
    }, player);
    // messageService.pushLogTipsToPlayer(player, 40);
    next();
    return;
  }
  // if (target.type !== EntityType.ITEM && target.type !== EntityType.EQUIPMENT) {
  if (target.type !== EntityType.EQUIPMENT) {
    messageService.pushLogTipsToPlayer(player, 41);
    next();
    return;
  }
  // Pick.BAG_FULL
  var result = player.pickItem(targetId);
  if (result === consts.Pick.BAG_FULL) {
    messageService.pushMessageToPlayer(player.sessionData, "onBagData", player.bag.strip());
    // player.target = targetId;
  }
  next();
};

handler.pickTarget = function(msg, session, next) {
  var area = session.area;
  var player = session.player;
  var targetId = msg.targetId;

  var item = area.getEntity(targetId);
  if (!item) {
    messageService.pushMessageByAOI(area, 'onRemoveEntities', {
      entities: [targetId]
    }, player);
    // messageService.pushLogTipsToPlayer(player, 40);
  } else {
    if (item.type === EntityType.ITEM) {
      if (item.zoneId) {
        if (!item.playerId) {
          item.playerId = player.id;
          item.lastTime = Date.now() + 5000;

          messageService.pushMessageByAOI(area, 'onPickTarget', {
            entityId: item.entityId,
            playerId: player.id
          }, player);
        }
      }else{
          player.pickItem(targetId);
      }
    } else {
      messageService.pushLogTipsToPlayer(player, 41);
    }
  }
  next();
};

handler.cancelPick = function(msg, session, next) {
  var area = session.area;
  var player = session.player;
  var targetId = msg.targetId;
  var target = area.getEntity(targetId);
  if (target && target.type === EntityType.ITEM) {
    if (!target.died) {
      target.playerId = 0;

      messageService.pushMessageByAOI(area, 'onCancelPick', {
        entityId: target.entityId
      }, player);
    }
  }
  next();
};

// handler.bagCleanUp = function(msg, session, next) {
//   var player = session.player;
//   if (!player.bag) {
//     logger.error("handler.getBag player have no bag playerId=" + player.id);
//     next(null, {});
//     return;
//   }
//   player.bag.cleanUp();
//   messageService.pushMessageToPlayer(player.sessionData, "onBagData", player.bag.strip());

//   next(null, {});
// };

handler.getBag = function(msg, session, next) {
  var player = session.player;
  if (!player.bag) {
    logger.error("handler.getBag player have no bag playerId=" + player.id);
    next(null, {
      code: 201
    });
    return;
  }
  var bagData = player.bag.strip();
  bagData.code = 200;
  next(null, bagData);
};

handler.getBagInfo = function(msg, session, next) {
  var player = session.player;
  if (!player.bag) {
    logger.error("handler.getBagInfo player have no bag playerId=" + player.id);
    next(null, []);
    return;
  }
  var bagData = player.bag.stripInfo();
  next(null, bagData);
};
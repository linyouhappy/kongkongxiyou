/**
 * Module dependencies
 */

var handler = module.exports;
var dataApi = require('../../../util/dataApi');
var messageService = require('../../../domain/messageService');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var EntityType = consts.EntityType;
var MoneyTypes=consts.MoneyTypes;
var utils = require('../../../util/utils');
var pomelo = require('pomelo');

var rechargeInfoDao = require('../../../dao/rechargeInfoDao');
var vipInfoDao = require('../../../dao/vipInfoDao');

var levelTotalWeight;
var fruitSlotDatas;
var levelWeights={
  "1":10000,
  "2":5000,
  "3":2000,
  "4":500,
  "5":200
};

handler.lottery = function(msg, session, next) {
  var player = session.player;
  var times = msg.times;
  var costCrystal = times * 10;

  if (player.crystal < costCrystal) {
    next(null, {
      code: 141
    });
    return;
  }
  player.addCrystal(-costCrystal, function(err, res) {
    if (!res) {
      next(null, {
        code: 89
      });
    } else {
      if (!levelTotalWeight) {
        levelTotalWeight = 0;
        for (var key in levelWeights) {
          levelTotalWeight += levelWeights[key];
        }
        var fruitSlots = dataApi.fruit_slot.all();
        fruitSlotDatas = {};
        for (var key in fruitSlots) {
          var fruitSlot = fruitSlots[key];
          if (!fruitSlotDatas[fruitSlot.level]) {
            fruitSlotDatas[fruitSlot.level] = [];
          }
          fruitSlotDatas[fruitSlot.level].push(fruitSlot);
        }
      }

      var targetExpectation, level, fruitSlotData, index, curExpectation;
      var targetIdTrain = {};
      if (times === 5) {
        times--;
        if (Math.random() < 0.9) {
          targetIdTrain[3] = 3;
        } else {
          targetIdTrain[10] = 10;
        }
      }
      while (times > 0) {
        targetExpectation = Math.random() * levelTotalWeight;
        curExpectation = 0;
        for (var key in levelWeights) {
          curExpectation += levelWeights[key];
          if (curExpectation >= targetExpectation) {
            level = key;
            break;
          }
        }

        fruitSlotData = fruitSlotDatas[level];
        index = Math.floor(Math.random() * fruitSlotData.length);
        var fruitSlot = fruitSlotData[index];
        if (!targetIdTrain[fruitSlot.id]) {
          targetIdTrain[fruitSlot.id] = fruitSlot.id;
          times--;
        }
      }
      var ids = [];
      var item = {
        kindId: 0,
        type: EntityType.ITEM,
        count: 1
      };
      for (var key in targetIdTrain) {
        ids.push(targetIdTrain[key]);
        var fruitSlot = dataApi.fruit_slot.findById(targetIdTrain[key]);
        var item = {
          kindId: fruitSlot.kindId,
          type: EntityType.ITEM,
          count: fruitSlot.count
        };
        player.addItem(item);
      }
      next(null, {
        code: 200,
        ids: ids
      });
    }
  });
};

handler.receive = function(msg, session, next) {
  var player = session.player;
  var vipInfo=player.vipInfo;
  if (!vipInfo) {
    messageService.pushLogTipsToPlayer(player,142);
    next();
    return;
  }
  var giftId = msg.giftId;
  var giftData = dataApi.gift.findById(giftId);
  if (giftData) {
    if ((1 << giftId) & vipInfo.giftMask) {
      messageService.pushLogTipsToPlayer(player,144);
      next();
      return;
    }
    if (vipInfo.rmb < giftData.rmb) {
      messageService.pushLogTipsToPlayer(player,143);
      next();
      return;
    }
    var item = {
      kindId: giftData.itemId,
      type: EntityType.ITEM,
      count: 1
    };
    player.addItem(item);

    vipInfo.giftMask=vipInfo.giftMask | (1 << giftId);
    vipInfoDao.update(vipInfo);
  }
  next();
};

handler.getVipInfo=function(msg, session, next){
  var player = session.player;
  if (player.vipInfo) {
    next(null, {
      rmb: player.vipInfo.rmb,
      giftMask: player.vipInfo.giftMask
    });
    return;
  }
  vipInfoDao.getDataByPlayerId(player.id, function(err, vipInfo) {
    if (err) {
      logger.error("shopHandler.getVipInfo failed ");
      messageService.pushLogTipsToPlayer(player,142);
    } else {
      player.vipInfo = vipInfo;
      next(null, {
        rmb: vipInfo.rmb,
        giftMask: vipInfo.giftMask
      });
      return;
    }
    next(null, {});
  });
};

handler.exchange=function(msg, session, next){
  var player = session.player;
  var buyId=msg.buyId;
  var exchangeData=dataApi.exchange.findById(buyId);
  if (exchangeData) {
    if (player.crystal<exchangeData.crystal) {
      messageService.pushLogTipsToPlayer(player,141);
      next();
      return;
    }
    player.addCrystal(-exchangeData.crystal,function(err,res){
      if (!res) {
        messageService.pushLogTipsToPlayer(player,140);
      }else{
        player.addCaoCoin(exchangeData.caoCoin);
      }
    });
  }else{
    messageService.pushLogTipsToPlayer(player,138);
  }
  next();
};

handler.recharge=function(msg, session, next){
  var player = session.player;
  var buyId=msg.buyId;
  var rechargeData=dataApi.recharge.findById(buyId);
  if (rechargeData) {
    rechargeInfoDao.create(player,buyId,rechargeData.rmb);

    if (player.vipInfo) {
      player.vipInfo.rmb+=rechargeData.rmb;
      vipInfoDao.update(player.vipInfo);
    }

    player.addCrystal(rechargeData.crystal,function(err,res){
      if (!res) {
        messageService.pushLogTipsToPlayer(player,139);
      } 
    });
  }else{
    messageService.pushLogTipsToPlayer(player,138);
  }
  next();
};

handler.shopBuy = function(msg, session, next) {
  var player = session.player;
  var shopId=msg.shopId;
  var buyCount=msg.count;

  var shopItem=dataApi.item_shop.findById(shopId);
  if (!shopItem) {
    messageService.pushLogTipsToPlayer(player,56);
    next();
    return;
  }
  // var position = player.bag.getCanUsePosition();
  // if (player.bag.bagIsFull()) {
  //   messageService.pushLogTipsToPlayer(player,61);
  //   next();
  //   return;
  // }
  var totalCost=buyCount*shopItem.price;
  if (shopItem.moneyType===MoneyTypes.caoCoin) {
    if (player.caoCoin<totalCost) {
      messageService.pushLogTipsToPlayer(player,57);
      next();
      return;
    }
    player.addCaoCoin(-totalCost, function(err, res) {
      if (err || !res) {
        messageService.pushLogTipsToPlayer(player,62);
        return;
      }
      shopItem.count=buyCount;
      player.addItem(shopItem);
    });
  }else if(shopItem.moneyType===MoneyTypes.crystal){
    if (player.crystal<totalCost) {
      messageService.pushLogTipsToPlayer(player,59);
      next();
      return;
    }
    player.addCrystal(-totalCost, function(err, res) {
      if (err || !res) {
        messageService.pushLogTipsToPlayer(player,62);
        return;
      }
      shopItem.count=buyCount;
      player.addItem(shopItem);
    });
  }
  next();
};


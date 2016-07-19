// var Code = require('../../../shared/code');
var utils = require('../util/utils');
var marketBuyItemDao = require('../dao/marketBuyItemDao');
var marketSellItemDao = require('../dao/marketSellItemDao');
var marketItemDao = require('../dao/marketItemDao');
var playerBankDao = require('../dao/playerBankDao');

var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../domain/messageService');
var dataApi = require('../util/dataApi');
var async = require('async');

var playerBankTimeOut = 600000;

//Timer
var Timer = function(opts) {
  this.interval = opts.interval || 10000;
  this.service = opts.service;
};

Timer.prototype.run = function() {
  this.interval = setInterval(this.tick.bind(this), this.interval);
};

Timer.prototype.close = function() {
  clearInterval(this.interval);
};

Timer.prototype.tick = function() {
  this.service.update();
};

//MarketService
var MarketService = function() {
  this.itemTradeDatas = {};
  var itemData, kindId, itemTradeData;
  var itemDatas = dataApi.item.all();
  this.fiveTrades = {};
  this.tradeRecords = {};
  this.tradeDetails = {};

  // var kindIds=[7700,7701,7702,7703,7704,7706,7707,7709,7712];
  var marketData = dataApi.market.findById(1);
  if (typeof marketData.tradeItem == 'string') {
    marketData.tradeItem = JSON.parse(marketData.tradeItem);
  }
  var kindIds = marketData.tradeItem;
  this.kindIdsCount = kindIds.length;
  this.kindIds = kindIds;
  for (var key in kindIds) {
    itemData = itemDatas[kindIds[key]];
    kindId = itemData.id;
    itemTradeData = {
      kindId: kindId,
      curPrice: itemData.price,
      maxPrice: itemData.price,
      minPrice: itemData.price,
      isNeedData: true
    };

    this.itemTradeDatas[kindId] = itemTradeData;
    this.fiveTrades[kindId] = [];
    this.tradeRecords[kindId] = [];
    this.tradeDetails[kindId] = [];
  }

  this.isTradeing=true;

  this.marketTimer = new Timer({
    service: this,
    interval: 1000
  });
  this.marketTimer.run();

  this.playerBanks = {};
  this.removePlayerBanks = [];

  this.secondIndex = 0;

  this.tradeRecordTime = Date.now();
  this.tradeRecordIndex = 1;
  this.tradeDetailIndex = 1;

  this.timePointDelta=marketData.timePointDelta;
  this.timePointCount=marketData.timePointCount;
  this.openTime = marketData.openTime;
  this.closeTime = marketData.closeTime;
  this.costRate = marketData.costRate;
  this.profitRate=1-this.costRate/1000;
};

module.exports = MarketService;

MarketService.prototype.recordTrade = function(kindId, count, price, kind, time) {
  // utils.myPrint("recordTrade kindId="+kindId+",count="+count+",price="+price+",kind="+kind);
  var tradeRecord = this.tradeRecords[kindId];
  if (tradeRecord) {
    tradeRecord.push({
      id: this.tradeRecordIndex++,
      count: count,
      price: price,
      time: time,
      kind: kind
    });
    while (tradeRecord.length > 10) {
      tradeRecord.shift();
    }

  } else {
    logger.error("ERROR:MarketService recordTrade kindId:" + kindId);
  }
};

MarketService.prototype.checkOrder = function(item) {
  var itemTradeData = this.itemTradeDatas[item.kindId];
  if (itemTradeData) {
    itemTradeData.isNeedData = true;
    return true;
  }
};

MarketService.prototype.buyOrder = function(playerBank, buyItem, cb) {
  if (!this.checkOrder(buyItem)) {
    logger.error("MarketService.prototype.buyOrder Unknow kindId:" + buyItem.kindId);
    utils.invokeCallback(cb, "Unknow kindId");
    return;
  }
  if (playerBank.caoCoin >= buyItem.caoCoin) {
    marketBuyItemDao.createItem(buyItem, function(err, res) {
      if (err) {
        utils.invokeCallback(cb, err);
        return;
      }
      playerBank.caoCoin -= buyItem.caoCoin;
      playerBank.isDirty = true;
      playerBank.save();
      buyItem.id = res.id;
      playerBank.buyItems[buyItem.id] = buyItem;

      utils.invokeCallback(cb, null, buyItem);
    });
  } else {
    utils.invokeCallback(cb, null);
  }
};

MarketService.prototype.sellOrder = function(sellItem, cb) {
  if (!this.checkOrder(sellItem)) {
    logger.error("MarketService.prototype.sellOrder Unknow kindId:" + sellItem.kindId);
    utils.invokeCallback(cb, "Unknow kindId");
    return;
  }
  var playerBank = this.playerBanks[sellItem.playerId];
  if (playerBank) {
    // playerBank.visitTime = Date.now() + playerBankTimeOut;
    playerBank.sellItems[sellItem.id] = sellItem;
  }
};

MarketService.prototype.cancelOrder = function(playerBank, removeItem) {
  var item, id = removeItem.id;
  if (removeItem.type === 0) {
    item = playerBank.buyItems[id];
    if (!item) {
      messageService.pushLogTipsToPlayer(playerBank, 92);
      logger.warn("MarketService.cancelOrder buyItems is no exist. id=" + id);
      return;
    }
    if (!this.checkOrder(item)) {
      logger.error("MarketService.prototype.cancelOrder Unknow kindId:" + item.kindId);
      return;
    }

    if (!playerBank.removeBuyItems) {
      playerBank.removeBuyItems = {};
    }
    playerBank.removeBuyItems[id] = id;
  } else {
    item = playerBank.sellItems[id];
    if (!item) {
      messageService.pushLogTipsToPlayer(playerBank, 92);
      logger.warn("MarketService.cancelOrder sellItems is no exist. id=" + id);
      return;
    }
    if (!this.checkOrder(item)) {
      logger.error("MarketService.prototype.cancelOrder Unknow kindId:" + item.kindId);
      return;
    }

    if (!playerBank.removeSellItems) {
      playerBank.removeSellItems = {};
    }
    playerBank.removeSellItems[id] = id;
  }
  this.removePlayerBanks.push(playerBank);
};

MarketService.prototype.recordItemTradeData = function(itemTradeData) {
  // utils.myPrint("recordItemTradeData  itemTradeData="+JSON.stringify(itemTradeData));
  var timePoint = itemTradeData.timePoint;
  var detail,tradeDetail = this.tradeDetails[itemTradeData.kindId];
  detail=tradeDetail[tradeDetail.length-1];
  // utils.myPrint("===>>tradeDetail:"+JSON.stringify(tradeDetail));
  if (!detail || detail.timePoint!==timePoint) {
    // if (detail) {
    //   var minTimePoint=timePoint-this.timePointDelta*2;
    //   for (var i = tradeDetail.length-1; i>=0; i--) {
    //     detail=tradeDetail[i];
    //     if (detail.timePoint===minTimePoint) {
    //       tradeDetail.splice(0,i);
    //       break;
    //     }else if (detail.timePoint<minTimePoint){
    //       detail.timePoint=minTimePoint;
    //       // detail.id=this.tradeDetailIndex++;
    //       tradeDetail.splice(0,i);
    //       break;
    //     }
    //   }
    // }
    tradeDetail.push({
      id: this.tradeDetailIndex++,
      timePoint: timePoint,
      // kindId: itemTradeData.kindId,
      openPrice: itemTradeData.openPrice,
      closePrice: itemTradeData.curPrice,
      maxPrice: itemTradeData.maxPrice,
      minPrice: itemTradeData.minPrice,
      amount: itemTradeData.amount
    });

    while (tradeDetail.length > this.timePointCount) {
      tradeDetail.shift();
    }

  } else {
    // detail=tradeDetail[timePoint];
    detail.closePrice=itemTradeData.curPrice;
    detail.maxPrice=itemTradeData.maxPrice;
    detail.minPrice=itemTradeData.minPrice;
    detail.amount=itemTradeData.amount;
  }
  // utils.myPrint("===<<tradeDetail:"+JSON.stringify(tradeDetail));
};

MarketService.prototype.finishTrade = function() {
  var self=this;
  for (var key in this.itemTradeDatas) {
    (function() {
      var itemTradeData = self.itemTradeDatas[key];
      if (itemTradeData.isFinishTrade) {
        return;
      }
      var kindId = itemTradeData.kindId;
      async.parallel([
          function(callback) {
            marketBuyItemDao.getAllMarketItems(kindId, function(err, buyItems) {
              if (!!err || !buyItems) {
                logger.error('Get user for userDao failed! ' + err.stack);
              }
              callback(err, buyItems);
            });
          },
          function(callback) {
            marketSellItemDao.getAllMarketItems(kindId, function(err, sellItems) {
              if (!!err || !sellItems) {
                logger.error('Get bag for bagDao failed! ' + err.stack);
              }
              callback(err, sellItems);
            });
          }
        ],
        function(err, results) {
          if (!!err) {
            itemTradeData.isFinishTrade=true;
            return;
          }
          var buyItems = results[0];
          var sellItems = results[1];
          if (buyItems.length===0 && sellItems.length===0) {
            itemTradeData.isFinishTrade=true;
            return;
          }
          for (var i = 0; i < buyItems.length; i++) {
            self.clearBuyItem(buyItems[i]);
          }
          
          for (var i = 0; i < sellItems.length; i++) {
            self.clearSellItem(sellItems[i]);
          }
        });

    })();
  }
};

MarketService.prototype.clearBuyItem=function(buyItem){
  this.getPlayerBank(buyItem.playerId, function(err, playerBank) {
    if (!!err || !playerBank || !playerBank.buyItems) {
      return;
    }
    var item=playerBank.buyItems[buyItem.id];
    if(item){
      var marketItem = playerBank.marketItems[buyItem.kindId];
      if (!marketItem) {
        marketItem = {
          playerId: buyItem.playerId,
          kindId: buyItem.kindId,
          count: 0
        };
        playerBank.marketItems[buyItem.kindId] = marketItem;
      }
      marketItem.count += buyItem.getCount;
      playerBank.caoCoin += buyItem.caoCoin;

      playerBank.isDirty = true;
      playerBank.save();

      deleteMarketBuyItem(buyItem);
      delete playerBank.buyItems[buyItem.id];
      saveMarketItem(marketItem);
    }
  });
};

MarketService.prototype.clearSellItem=function(sellItem){
  this.getPlayerBank(sellItem.playerId, function(err, playerBank) {
    if (!!err || !playerBank || !playerBank.sellItems) {
      return;
    }
    var item=playerBank.sellItems[sellItem.id];
    if(item){
      var marketItem = playerBank.marketItems[sellItem.kindId];
      if (!marketItem) {
        marketItem = {
          playerId: sellItem.playerId,
          kindId: sellItem.kindId,
          count: 0
        };
        playerBank.marketItems[sellItem.kindId] = marketItem;
      }
      marketItem.count += sellItem.count;
      playerBank.caoCoin += sellItem.caoCoin;

      playerBank.isDirty = true;
      playerBank.save();

      deleteMarketSellItem(sellItem);
      delete playerBank.sellItems[sellItem.id];
      saveMarketItem(marketItem);
    }
  });
};

MarketService.prototype.update = function() {
  var recordTime = new Date();
  var hours=recordTime.getHours();
  //未开市
  if (hours<this.openTime) {
    if (this.isTradeing) {
      this.isTradeing=null;
    }
    return;
  //闭市
  }else if (hours>=this.closeTime) {
    if (this.isTradeing) {
      this.isTradeing=null;
      this.isFinishTrade=null;
      for (var key in this.itemTradeDatas) {
        var itemTradeData = this.itemTradeDatas[key];
        itemTradeData.isFinishTrade = null;
      }
    }
    if (!this.isFinishTrade) {
      if (this.secondIndex >= 3) {
        this.finishTrade();
        for (var key in this.itemTradeDatas) {
          var itemTradeData = this.itemTradeDatas[key];
          if (!itemTradeData.isFinishTrade) {
            return;
          }
        }
        this.isFinishTrade = true;
      }
      this.secondIndex++;
    }
    return;
  }

  if (!this.isTradeing) {
    this.isTradeing=true;
  }

  if (this.secondIndex >= 3) {
    this.updateTrade(recordTime);
    this.secondIndex = 0;
  } else if (this.secondIndex === 1) {
    if (this.removePlayerBanks.length) {
      this.updateRemove();
    }
  } else if (this.secondIndex === 2) {
    this.updateCheck();
  }
  this.secondIndex++;
};

MarketService.prototype.updateCheck = function() {
  var kindId, itemTradeData, item, items;
  var resItem, resItems, resIndex, fiveTrade, fiveTrades;
  for (var key in this.itemTradeDatas) {
    itemTradeData = this.itemTradeDatas[key];

    if (!itemTradeData.isNeedCheck) {
      //utils.myPrint("MarketService.updateCheck don't need check=======>>kindId:" + itemTradeData.kindId);
      continue;
    }
    itemTradeData.isNeedCheck = null;
    // utils.myPrint("MarketService.updateCheck=======>>kindId:" + itemTradeData.kindId);

    kindId = itemTradeData.kindId;
    items = itemTradeData.buyItems;
    fiveTrade = this.fiveTrades[kindId];
    if (items && items.length > 0) {
      itemTradeData.buyItems = null;
      resItems = {};
      resIndex = 0;
      fiveTrades = [];
      for (var i = 0; i < items.length; i++) {
        item = items[i];
        resItem = resItems[item.price];
        if (!resItem) {
          if (resIndex >= 5) {
            utils.myPrint("buyItems more than 5,break========>>");
            break;
          }
          resItem = {
            count: item.buyCount,
            price: item.price
          };
          resItems[item.price] = resItem;
          fiveTrades.push(resItem);
          resIndex++;
        } else {
          resItem.count += item.buyCount;
        }
      }
      // utils.myPrint("buy fiveTrades:" + JSON.stringify(fiveTrades));
      fiveTrade[0] = fiveTrades;
    } else {
      fiveTrade[0] = null;
    }

    items = itemTradeData.sellItems;
    if (items && items.length > 0) {
      itemTradeData.sellItems = null;
      resItems = {};
      resIndex = 0;
      fiveTrades = [];
      for (var i = 0; i < items.length; i++) {
        item = items[i];
        resItem = resItems[item.price];
        if (!resItem) {
          if (resIndex >= 5) {
            utils.myPrint("sellItems more than 5,break========>>");
            break;
          }
          resItem = {
            count: item.count,
            price: item.price
          };
          resItems[item.price] = resItem;
          fiveTrades.push(resItem);
          resIndex++;
        } else {
          resItem.count += item.count;
        }
      }
      // utils.myPrint("sell fiveTrades:" + JSON.stringify(fiveTrades));
      fiveTrade[1] = fiveTrades;
    } else {
      fiveTrade[1] = null;
    }
  }
};

MarketService.prototype.getPriceByKindId=function(kindId){
    var itemTradeData=this.itemTradeDatas[kindId];
    if (itemTradeData) {
      return itemTradeData.curPrice;
    }
    return 0;
};

MarketService.prototype.updateTrade = function(recordTime) {
  var self = this;
  var timePoint = recordTime.getHours() * 60 + recordTime.getMinutes();
  timePoint=Math.floor(timePoint/self.timePointDelta)*self.timePointDelta;
  recordTime = Date.now();
  for (var key in this.itemTradeDatas) {
    (function() {
      var itemTradeData = self.itemTradeDatas[key];

      var tradePrice = itemTradeData.curPrice;
      if (itemTradeData.timePoint !== timePoint) {
        //if (!itemTradeData.timePoint) {
        //  itemTradeData.timePoint = timePoint;
        //}
        itemTradeData.timePoint = timePoint;

        itemTradeData.openPrice = tradePrice;
        itemTradeData.maxPrice = tradePrice;
        itemTradeData.minPrice = tradePrice;
        itemTradeData.amount = 0;
        self.recordItemTradeData(itemTradeData);
      }

      if (!itemTradeData.isNeedData) {
        return;
      }
      itemTradeData.isNeedData = false;
      var kindId = itemTradeData.kindId;
      // utils.myPrint("MarketService.updateTrade||=======>>kindId:" + itemTradeData.kindId);

      async.parallel([
          function(callback) {
            marketBuyItemDao.getTopMarketItems(0, kindId, function(err, buyItems) {
              if (!!err || !buyItems) {
                logger.error('Get user for userDao failed! ' + err.stack);
              }
              callback(err, buyItems);
            });
          },
          function(callback) {
            marketSellItemDao.getTopMarketItems(0, kindId, function(err, sellItems) {
              if (!!err || !sellItems) {
                logger.error('Get bag for bagDao failed! ' + err.stack);
              }
              callback(err, sellItems);
            });
          }
        ],
        function(err, results) {
          if (!!err) {
            return;
          }
          var buyItems = results[0];
          var sellItems = results[1];
          itemTradeData.buyItems = buyItems;
          itemTradeData.sellItems = sellItems;

          itemTradeData.isNeedCheck = true;
          if (buyItems.length === 0) {
            // utils.myPrint("没有买单，交易结束");
            return;
          }

          if (sellItems.length === 0) {
            // utils.myPrint("没有卖单，交易结束");
            return;
          }

          var buyItem, sellItem, costCaoCoin, tradeCount, tradeKind;
          var saveBuyItems = [];
          var saveSellItems = [];

          while (true) {
            if (!buyItem) {
              buyItem = buyItems.shift();
              if (buyItem && !self.checkBuyItem(buyItem)) {
                buyItem = null;
                // utils.myPrint("checkBuyItem kindId=" + kindId);
                continue;
              }
              if (!buyItem) {
                // utils.myPrint("买单用完，交易结束");
                break;
              }
            }

            if (!sellItem) {
              sellItem = sellItems.shift();
              if (sellItem && !self.checkSellItem(sellItem)) {
                sellItem = null;
                // utils.myPrint("checkSellItem kindId=" + kindId);
                continue;
              }
              if (!sellItem) {
                // utils.myPrint("卖单用完，交易结束");
                break;
              }
            }

            if (buyItem.price < sellItem.price) {
              // utils.myPrint("买单价太低，交易结束");
              break;
            }

            if (tradePrice > buyItem.price && tradePrice > sellItem.price) {
              tradePrice = buyItem.price;
              // utils.myPrint("买盘价=========>>");
              tradeKind = 0;
            } else if (tradePrice < buyItem.price && tradePrice < sellItem.price) {
              tradePrice = sellItem.price;
              // itemTradeData.curPrice = tradePrice;
              // utils.myPrint("卖盘价=========>>");
              tradeKind = 1;
            } else {
              // utils.myPrint("中盘价=========>>");
              tradeKind = 2;
            }

            if (itemTradeData.timePoint !== timePoint) {
              itemTradeData.timePoint = timePoint;
              itemTradeData.openPrice = tradePrice;
              itemTradeData.maxPrice = tradePrice;
              itemTradeData.minPrice = tradePrice;
              itemTradeData.curPrice = tradePrice;
            } else if (itemTradeData.curPrice !== tradePrice) {
              itemTradeData.curPrice = tradePrice;
              itemTradeData.maxPrice = Math.max(itemTradeData.maxPrice, tradePrice);
              itemTradeData.minPrice = Math.min(itemTradeData.minPrice, tradePrice);
            }

            if (buyItem.buyCount >= sellItem.count) {
              tradeCount = sellItem.count;
              sellItem.count = 0;
              buyItem.buyCount -= tradeCount;
              buyItem.getCount += tradeCount;

              costCaoCoin = tradePrice * tradeCount;
              sellItem.caoCoin += costCaoCoin*self.profitRate;
              buyItem.caoCoin -= costCaoCoin;

              //save sell state=1,buy state=2
              sellItem.state = 1;
              buyItem.state = 2;

              // saveSellItems.push(sellItem);
              if (!self.removeSellItem(sellItem)) {
                saveSellItems.push(sellItem);
              }
              sellItem = null;
              if (buyItem.buyCount === 0) {
                buyItem.state = 1;
                if (!self.removeBuyItem(buyItem)) {
                  saveBuyItems.push(buyItem);
                }
                buyItem = null;
              }

            } else {
              tradeCount = buyItem.buyCount;
              buyItem.buyCount = 0;
              sellItem.count -= tradeCount;
              buyItem.getCount += tradeCount;

              costCaoCoin = tradePrice * tradeCount;
              sellItem.caoCoin += costCaoCoin*self.profitRate;
              buyItem.caoCoin -= costCaoCoin;

              //save buy state=1,sell state=2
              buyItem.state = 1;
              sellItem.state = 2;

              if (!self.removeBuyItem(buyItem)) {
                saveBuyItems.push(buyItem);
              }
              buyItem = null;
            }

            itemTradeData.amount += tradeCount;
            self.recordTrade(kindId, tradeCount, tradePrice, tradeKind, recordTime);
            itemTradeData.isNeedData = true;
          }

          if (itemTradeData.isNeedData) {
            self.recordItemTradeData(itemTradeData);
          }

          if (buyItem && buyItem.state === 2) {
            buyItem.state = 0;
            saveBuyItems.push(buyItem);
            buyItems.unshift(buyItem);
          }
          if (sellItem && sellItem.state === 2) {
            sellItem.state = 0;
            saveSellItems.push(sellItem);
            sellItems.unshift(sellItem);
          }

          for (var key in saveBuyItems) {
            buyItem = saveBuyItems[key];
            saveMarketBuyItem(buyItem);
            self.updateBuyItem(buyItem,tradePrice);
          }

          for (var key in saveSellItems) {
            sellItem = saveSellItems[key];
            saveMarketSellItem(sellItem);
            self.updateSellItem(sellItem,tradePrice);
          }

        });

    })();
  }
};

MarketService.prototype.getCurTradeDatas = function() {
  var tradeDatas = [];
  var itemTradeData;
  for (var key in this.itemTradeDatas) {
    itemTradeData = this.itemTradeDatas[key];
    tradeDatas.push({
      kindId: itemTradeData.kindId,
      curPrice: itemTradeData.curPrice,
      maxPrice: itemTradeData.maxPrice,
      minPrice: itemTradeData.minPrice,
    });
  }
  return tradeDatas;
};

MarketService.prototype.updateRemove = function() {
  var isChange, item, playerBank, removeItems, playerBanks = this.removePlayerBanks;
  for (var key in playerBanks) {
    playerBank = playerBanks[key];
    removeItems = playerBank.removeBuyItems;
    for (var id in removeItems) {
      if (removeItems[id]) {
        item = playerBank.buyItems[id];
        if (item) {
          this.removeBuyItemWithBank(playerBank, item)
        } else {
          logger.error("ERROR:MarketService.updateRemove buyItem:" + JSON.stringify(item));
        }
      }
      isChange = true;
    }
    if (isChange) {
      isChange = false;
      playerBank.removeBuyItems = null;
    }
    removeItems = playerBank.removeSellItems;
    for (var id in removeItems) {
      if (removeItems[id]) {
        item = playerBank.sellItems[id];
        if (item) {
          this.removeSellItemWithBank(playerBank, item);
        } else {
          logger.error("ERROR:MarketService.updateRemove sellItem:" + JSON.stringify(item));
        }
      }
      isChange = true;
    }

    if (isChange) {
      isChange = false;
      playerBank.removeSellItems = null;
    }
  }
  this.removePlayerBanks = [];
};

MarketService.prototype.removeBuyItem = function(buyItem) {
  var playerBank = this.playerBanks[buyItem.playerId];
  if (playerBank) {
    if (!this.removeBuyItemWithBank(playerBank, buyItem)) {
      logger.error("ERROR:MarketService.removeBuyItem buyItem:" + JSON.stringify(buyItem));
    }
    return true;
  }
  return false;
};

MarketService.prototype.removeSellItem = function(sellItem) {
  var playerBank = this.playerBanks[sellItem.playerId];
  if (playerBank) {
    if (!this.removeSellItemWithBank(playerBank, sellItem)) {
      logger.error("ERROR:MarketService.removeSellItem sellItem:" + JSON.stringify(sellItem));
    }
    return true;
  }
  return false;
};

MarketService.prototype.removeBuyItemWithBank = function(playerBank, item) {
  if (!playerBank.buyItems[item.id]) {
    return false;
  }

  delete playerBank.buyItems[item.id];
  var msg = {
    type: 0,
    id: item.id
  };
  if (item.caoCoin) {
    playerBank.caoCoin += item.caoCoin;
    playerBank.isDirty = true;
    playerBank.save();
    msg.caoCoin = playerBank.caoCoin;
  }
  if (item.getCount) {
    var marketItem = playerBank.marketItems[item.kindId];
    if (!marketItem) {
      marketItem = {
        playerId: playerBank.playerId,
        kindId: item.kindId,
        count: 0
      };
      playerBank.marketItems[item.kindId] = marketItem;
    }
    marketItem.count += item.getCount;
    saveMarketItem(marketItem);

    msg.kindId = marketItem.kindId;
    msg.count = marketItem.count
  }
  deleteMarketBuyItem(item);
  if (playerBank.uid) {
    messageService.pushMessageToPlayer(playerBank, 'onMarketItem', msg);
  } else {
    logger.error("ERROR:MarketService.removeBuyItemWithBank playerBank.uid=null:" + JSON.stringify(playerBank));
  }
  return true;
};

MarketService.prototype.removeSellItemWithBank = function(playerBank, item) {
  if (!playerBank.sellItems[item.id]) {
    return false;
  }

  delete playerBank.sellItems[item.id];
  var msg = {
    type: 1,
    id: item.id
  };
  if (item.caoCoin) {
    playerBank.caoCoin += item.caoCoin;
    playerBank.isDirty = true;
    playerBank.save();
    msg.caoCoin = playerBank.caoCoin;
  }
  if (item.count) {
    var marketItem = playerBank.marketItems[item.kindId];
    if (!marketItem) {
      marketItem = {
        playerId: playerBank.playerId,
        kindId: item.kindId,
        count: 0
      };
      playerBank.marketItems[item.kindId] = marketItem;
    }
    marketItem.count += item.count;
    saveMarketItem(marketItem);

    msg.kindId = marketItem.kindId;
    msg.count = marketItem.count;
  }
  deleteMarketSellItem(item);
  if (playerBank.uid) {
    messageService.pushMessageToPlayer(playerBank, 'onMarketItem', msg);
  } else {
    logger.error("ERROR:MarketService.removeSellItemWithBank playerBank.uid=null:" + JSON.stringify(playerBank));
  }
  return true;
};

MarketService.prototype.checkBuyItem = function(buyItem) {
  var playerBank = this.playerBanks[buyItem.playerId];
  if (playerBank && playerBank.removeBuyItems) {
    if (playerBank.removeBuyItems[buyItem.id]) {
      this.removeBuyItemWithBank(playerBank, buyItem);
      playerBank.removeBuyItems[buyItem.id] = 0;
      return false;
    }
  }
  return true;
};

MarketService.prototype.checkSellItem = function(sellItem) {
  var playerBank = this.playerBanks[sellItem.playerId];
  if (playerBank && playerBank.removeSellItems) {
    if (playerBank.removeSellItems[sellItem.id]) {
      this.removeSellItemWithBank(playerBank, sellItem);
      playerBank.removeSellItems[sellItem.id] = 0;
      return false;
    }
  }
  return true;
};

MarketService.prototype.updateBuyItem = function(buyItem,tradePrice) {
  var playerBank = this.playerBanks[buyItem.playerId];
  if (playerBank) {
    playerBank.buyItems[buyItem.id] = buyItem;
    if (playerBank.uid) {
      var msg={
        id:buyItem.id,
        type:0,
        price:tradePrice,
        count:buyItem.buyCount
      };
      messageService.pushMessageToPlayer(playerBank, 'updateMarketItem', msg);
    } else {
      logger.error("ERROR:MarketService.updateBuyItem playerBank.uid=null:" + JSON.stringify(playerBank));
    }
  }
};

MarketService.prototype.updateSellItem = function(sellItem,tradePrice) {
  var playerBank = this.playerBanks[sellItem.playerId];
  if (playerBank) {
    playerBank.sellItems[sellItem.id] = sellItem;
    if (playerBank.uid) {
      var msg={
        id:sellItem.id,
        type:1,
        price:tradePrice,
        count:sellItem.count
      };
      messageService.pushMessageToPlayer(playerBank, 'updateMarketItem', msg);
    } else {
      logger.error("ERROR:MarketService.updateSellItem playerBank.uid=null:" + JSON.stringify(playerBank));
    }
  }
};

MarketService.prototype.kick = function(playerId) {
  delete this.playerBanks[playerId];
};

MarketService.prototype.addPlayerBank = function(playerBank) {
  // playerBank.visitTime = Date.now() + playerBankTimeOut;
  if (this.playerBanks[playerBank.playerId]) {
    this.playerBanks[playerBank.playerId] = playerBank;
    logger.warn("addPlayerBank is exist,playerId=" + playerBank.playerId);
  } else {
    this.playerBanks[playerBank.playerId] = playerBank;
  }
};

MarketService.prototype._getPlayerBank = function(playerId, cb) {
  var playerBank = this.playerBanks[playerId];
  if (playerBank) {
    // playerBank.visitTime = Date.now() + playerBankTimeOut;
    utils.invokeCallback(cb, null, playerBank);
    return;
  }

  var self = this;
  playerBankDao.getPlayerBank(playerId, function(err, playerBank) {
    if (err) {
      utils.invokeCallback(cb, err);
    } else {
      self.addPlayerBank(playerBank);
      utils.invokeCallback(cb, null, playerBank);
    }
  });
};

// MarketService.prototype.updatePlayerBank = function() {
//   var currentTime = Date.now();
//   var playerBanks = this.playerBanks;
//   for (var key in playerBanks) {
//     if (playerBanks[key].visitTime < currentTime) {
//       delete playerBanks[key];
//     }
//   }
// };

MarketService.prototype.getPlayerBank = function(playerId, cb) {
  var playerBank = this.playerBanks[playerId];
  if (playerBank && !playerBank.isDirty) {
    // playerBank.visitTime = Date.now() + playerBankTimeOut;
    utils.invokeCallback(cb, null, playerBank);
    return;
  }

  var self = this;
  async.parallel([
      function(callback) {
        playerBankDao.getPlayerBank(playerId, function(err, playerBank) {
          callback(err, playerBank);
        });
      },
      function(callback) {
        marketItemDao.getMarketItemsByPlayerId(playerId, function(err, marketItems) {
          callback(err, marketItems);
        });
      },
      function(callback) {
        marketBuyItemDao.getMarketItemsByPlayerId(playerId, function(err, buyItems) {
          if (!!err || !buyItems) {
            logger.error('getPlayerBank marketBuyItemDao.getMarketItemsByPlayerId failed! ' + err.stack);
          }
          callback(err, buyItems);
        });
      },
      function(callback) {
        marketSellItemDao.getMarketItemsByPlayerId(playerId, function(err, sellItems) {
          if (!!err || !sellItems) {
            logger.error('getPlayerBank marketSellItemDao.getMarketItemsByPlayerId failed! ' + err.stack);
          }
          callback(err, sellItems);
        });
      }
    ],
    function(err, results) {
      if (!!err) {
        utils.invokeCallback(cb, err);
        return;
      }

      var playerBank = results[0];
      if (!playerBank) {
        logger.error("ERROR:playerBank is null");
        utils.invokeCallback(cb, "playerBank is null");
        return;
      }
      self.addPlayerBank(playerBank);

      var marketItem;
      var marketItems = {};
      var tmpMarketItems = results[1];
      for (var i = 0; i < tmpMarketItems.length; i++) {
        marketItem = tmpMarketItems[i];
        marketItems[marketItem.kindId] = marketItem;
      }
      playerBank.marketItems = marketItems;

      var buyItem;
      var buyItems = {};
      var tmpMarketItems = results[2];
      for (var key in tmpMarketItems) {
        buyItem = tmpMarketItems[key];
        if (buyItem.state === 1) {
          marketItem = marketItems[buyItem.kindId];
          if (!marketItem) {
            marketItem = {
              playerId: playerId,
              kindId: buyItem.kindId,
              count: 0
            };
            marketItems[buyItem.kindId] = marketItem;
          }
          marketItem.count += buyItem.getCount;
          playerBank.caoCoin += buyItem.caoCoin;

          marketItem.isDirty = true;
          playerBank.isDirty = true;

          deleteMarketBuyItem(buyItem);
        } else {
          buyItems[buyItem.id] = buyItem;
        }
      }

      var sellItem;
      var sellItems = {};
      var tmpMarketItems = results[3];
      for (var key in tmpMarketItems) {
        sellItem = tmpMarketItems[key];
        if (sellItem.state === 1) {
          playerBank.caoCoin += sellItem.caoCoin;
          playerBank.isDirty = true;

          deleteMarketSellItem(sellItem);
        } else {
          sellItems[sellItem.id] = sellItem;
        }
      }

      playerBank.save();

      for (var key in marketItems) {
        marketItem = marketItems[key];
        if (marketItem.isDirty) {
          marketItem.isDirty = false;
          saveMarketItem(marketItem);
        }
      }

      playerBank.sellItems = sellItems;
      playerBank.buyItems = buyItems;

      utils.invokeCallback(cb, null, playerBank);
    });
};

MarketService.prototype.inputCaoCoin = function(playerId, caoCoin, cb) {
  this._getPlayerBank(playerId, function(err, playerBank) {
    if (err) {
      utils.invokeCallback(cb, err);
      return;
    }
    playerBank.caoCoin += caoCoin;
    playerBank.isDirty = true;
    playerBank.save();
    utils.invokeCallback(cb, null);
  });
};

MarketService.prototype.outputCaoCoin = function(playerId, caoCoin, cb) {
  this._getPlayerBank(playerId, function(err, playerBank) {
    if (err) {
      utils.invokeCallback(cb, err);
      return;
    }
    if (playerBank.caoCoin >= caoCoin) {
      playerBank.caoCoin -= caoCoin;
      playerBank.isDirty = true;
      playerBank.save();
      utils.invokeCallback(cb, null);
    } else {
      utils.invokeCallback(cb, null, true);
    }
  });
};

MarketService.prototype.outputItems = function(playerId) {
  var playerBank = this.playerBanks[playerId];
  if (playerBank) {
    playerBank.marketItems = {};
  }
};


function deleteMarketBuyItem(marketBuyItem) {
  marketBuyItemDao.destroy(marketBuyItem.id);
}

function deleteMarketSellItem(marketSellItem) {
  marketSellItemDao.destroy(marketSellItem.id);
}

function saveMarketItem(marketItem) {
  if (marketItem.id) {
    marketItemDao.update(marketItem);
  } else {
    marketItemDao.create(marketItem);
  }
}

function saveMarketBuyItem(marketBuyItem) {
  marketBuyItemDao.update(marketBuyItem);
}

function saveMarketSellItem(marketSellItem) {
  marketSellItemDao.update(marketSellItem);
}


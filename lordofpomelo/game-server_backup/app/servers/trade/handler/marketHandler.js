/**
 * Module dependencies
 */

var dataApi = require('../../../util/dataApi');
var messageService = require('../../../domain/messageService');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var EntityType = consts.EntityType;
var MoneyTypes = consts.MoneyTypes;
var utils = require('../../../util/utils');
var marketBuyItemDao = require('../../../dao/marketBuyItemDao');
var marketSellItemDao = require('../../../dao/marketSellItemDao');
var async = require('async');
// var marketService = require('../../../services/marketService');

// var handler = module.exports;

module.exports = function(app) {
  return new MarketHandler(app, app.get('marketService'));
};

var MarketHandler = function(app, marketService) {
  this.app = app;
  this.marketService = marketService;
};

MarketHandler.prototype.getMarketList = function(msg, session, next) {
  var tradeDatas = this.marketService.getCurTradeDatas();
  next(null, tradeDatas);
};

MarketHandler.prototype.getFiveTrade = function(msg, session, next) {
  var kindId=msg.kindId;
  var fiveTrades = this.marketService.fiveTrades;
  if (fiveTrades) {
    var fiveTrade=fiveTrades[kindId];
    if (fiveTrade) {
      next(null, fiveTrade);
      return;
    }
  }
  next(null, []);
};

MarketHandler.prototype.getPlayerBank = function(msg, session, next) {
  var playerId = session.get('playerId');
  var self=this;
  this.marketService.getPlayerBank(playerId, function(err, playerBank) {
    if (!!err) {
      next(null, {
        code: 75
      });
      return;
    }
    playerBank.uid=session.uid;
    playerBank.sid=session.frontendId;
    var msg=playerBank.strip();
    msg.costRate=self.marketService.costRate;
    msg.isTradeing= self.marketService.isTradeing?1:0;
    next(null, msg);
  });
};

MarketHandler.prototype.cancelOrder = function(msg, session, next) {
  // this.marketService.cancelOrder({
  //   uid:session.uid,
  //   serverId:session.frontendId,
  //   playerId:session.get('playerId'),
  //   id:msg.id,
  //   type:msg.type
  // });
  var playerId = session.get('playerId');

  var self=this;
  this.marketService.getPlayerBank(playerId, function(err, playerBank) {
    if (!!err || !playerBank) {
      return;
    }
    if (!playerBank.uid) {
      playerBank.uid = session.uid;
      playerBank.sid = session.frontendId;
    } else if (playerBank.uid !== session.uid) {
      return;
    }
    self.marketService.cancelOrder(playerBank, msg);
  });
  next();
};

MarketHandler.prototype.buyOrder = function(msg, session, next) {
  var playerId = session.get('playerId');
  var kindId = msg.kindId;
  var price=msg.price;
  var buyCount=msg.count;

  var self=this;
  this.marketService.getPlayerBank(playerId, function(err, playerBank) {
    if (!!err) {
      next(null, {
        code: 75
      });
      return;
    }

    if (!playerBank.uid) {
      playerBank.uid = session.uid;
      playerBank.sid = session.frontendId;
    } else if (playerBank.uid !== session.uid) {
      next(null, {
        code: 91
      });
      return;
    }
    var costCaoCoin=price * buyCount;
    if (playerBank.caoCoin < costCaoCoin) {
      next(null, {
        code: 81
      });
      return;
    }
    var buyItem = {
      kindId: msg.kindId,
      playerId: session.get('playerId'),
      price: price,
      buyCount: buyCount,
      caoCoin:costCaoCoin
    }
    self.marketService.buyOrder(playerBank, buyItem, function(err, buyItem) {
      if (!!err) {
        next(null, {
          code: 80
        });
        return;
      }
      if (!buyItem) {
        next(null, {
          code: 81
        });
      } else {
        next(null, {
          code: 200,
          id: buyItem.id,
          price:self.marketService.getPriceByKindId(buyItem.kindId)
        });
      }
    });
  });
};

MarketHandler.prototype.getTenTrade = function(msg, session, next) {
  var kindId = msg.kindId;
  var id=msg.id;
  var tradeRecord=this.marketService.tradeRecords[kindId];
  if (!id) {
    if (tradeRecord) {
      next(null,tradeRecord);
    }else{
      next(null,[]);
    }
  }else{
    var record,newTradeRecord=[];
    for (var i=tradeRecord.length-1;i>=0;i--) {
      record=tradeRecord[i];
      if (record.id>id) {
        newTradeRecord.push(record);
      }else{
        break;
      }
    }
    next(null,newTradeRecord);
  }
};

MarketHandler.prototype.getDetailTrade = function(msg, session, next) {
  var kindId = msg.kindId;
  var id=msg.id;
  var tradeDetail=this.marketService.tradeDetails[kindId];
  if (!id) {
    if (tradeDetail) {
      next(null,tradeDetail);
    }else{
      next(null,[]);
    }
  }else{
    var detail,newTradeDetail=[];
    for (var i =tradeDetail.length-1;i>=0;i--) {
      detail=tradeDetail[i];
      if (detail.id>=id) {
        newTradeDetail.push(detail);
      }
    }
    next(null,newTradeDetail);
  }
};


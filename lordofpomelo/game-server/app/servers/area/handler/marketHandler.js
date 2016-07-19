/**
 * Module dependencies
 */

var handler = module.exports;
var dataApi = require('../../../util/dataApi');
var messageService = require('../../../domain/messageService');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var pomelo = require('pomelo');
var EntityType = consts.EntityType;
var marketItemDao = require('../../../dao/marketItemDao');
var marketSellItemDao = require('../../../dao/marketSellItemDao');

handler.inputCaoCoin = function(msg, session, next) {
  var player = session.player;
  var caoCoin = msg.caoCoin;
  if (player.caoCoin < caoCoin) {
    next(null, {
      code: 76
    });
    return;
  }

  pomelo.app.rpc.trade.marketRemote.inputCaoCoin(session, player.id, caoCoin, function(err) {
    if (err) {
      logger.error("handler.inputCaoCoin failed ");
      next(null, {
        code: 78
      });
    } else {
      player.addCaoCoin(-caoCoin);
      next(null, {
        code: 200
      });
    }
  });
};

handler.outputCaoCoin = function(msg, session, next) {
  var player = session.player;
  var caoCoin = msg.caoCoin;
  pomelo.app.rpc.trade.marketRemote.outputCaoCoin(session, player.id, caoCoin, function(err, ret) {
    if (err) {
      logger.error("handler.outputCaoCoin failed ");
      next(null, {
        code: 78
      });
    } else {
      if (ret) {
        next(null, {
          code: 77
        });
      } else {
        player.addCaoCoin(caoCoin);
        next(null, {
          code: 200
        });
      }
    }
  });
};

handler.outputItems = function(msg, session, next) {
  var player = session.player;
  var playerId = player.id;
  marketItemDao.getMarketItemsByPlayerId(playerId, function(err, marketItems) {
    if (err) {
      next(null, {
        code: 79
      });
    } else {
      pomelo.app.rpc.trade.marketRemote.outputItems(session, playerId, function(err, ret) {});
      var marketItem;
      for (var i = 0; i < marketItems.length; i++) {
        marketItem = marketItems[i];
        marketItem.type = EntityType.ITEM;
        marketItemDao.destroy(marketItem.id);
        player.addItem(marketItem);
      }
      next(null, {
        code: 200
      });
    }
  });
};

handler.sellOrder = function(msg, session, next) {
  var player = session.player;
  var count = msg.count;
  var kindId=msg.kindId;
  var bagItem = player.bag.getItem(kindId);
  if (!bagItem) {
    next(null, {
      code: 42
    });
    return;
  }
  if (count > bagItem.count) {
    next(null, {
      code: 82
    });
    return;
  }
  player.bag.removeItemCount(kindId, count, function(err, ret) {
    if (err || !ret) {
      logger.error("handler.sellOrder  player.removeItemCount failed ");
      next(null, {
        code: 84
      });
    } else {
      var sellItem = {
        playerId: player.id,
        kindId: kindId,
        price: msg.price,
        count: count
      }
      marketSellItemDao.createItem(sellItem, function(err, res) {
        if (err) {
          logger.error("handler.sellOrder marketSellItemDao.createItem failed ");
          next(null, {
            code: 84
          });
          return;
        }
        sellItem.id = res.id;
        pomelo.app.rpc.trade.marketRemote.sellOrder(session, sellItem, function(err) {});

        next(null, {
          code: 200,
          id: sellItem.id
        });
      });
    }
  });
};
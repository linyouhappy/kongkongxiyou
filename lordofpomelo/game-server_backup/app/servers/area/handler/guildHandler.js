var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var pomelo = require('pomelo');
var forbid_word = require('../../../../config/data/forbid_word');
var userDao = require('../../../dao/userDao');
var dataApi = require('../../../util/dataApi');
var consts = require('../../../consts/consts');
var EntityType = consts.EntityType;

var handler = module.exports;

handler.getSalary = function(msg, session, next) {
  var player = session.player;
  var guildId = msg.guildId;
  if (guildId !== session.get('guildId')) {
    logger.error("getSalary guildId is error guildId=", guildId, ",sguildId=", session.get('guildId'));
  }
  var playerId = player.id;
  pomelo.app.rpc.manager.guildRemote.getSalary(session, guildId, playerId, function(err, code, salary) {
    if (err) {
      logger.error("guildRemote.getSalary failed ");
      next(null, {
        code: 89
      });
    } else {
      if (code===200 && salary) {
        player.addCaoCoin(salary);
      }
      next(null, {
        code: code
      });
    }
  });
};

handler.playerItem = function(msg, session, next) {
  var player = session.player;
  var guildId = msg.guildId;
  var itemId = msg.itemId;
  if (guildId !== session.get('guildId')) {
    logger.error("playerItem guildId is error guildId=", guildId, ",sguildId=", session.get('guildId'));
  }
  var playerId = player.id;
  pomelo.app.rpc.manager.guildRemote.playerItem(session, guildId, playerId, itemId, function(err,code,item) {
    if (err) {
      logger.error("guildRemote.playerItem failed ");
      next(null, {
        code: 89
      });
    } else {
      if (code===200 && item) {
        item.type = EntityType.EQUIPMENT;
        player.addItem(item);
        next(null, {
          code: 200
        });
      }else{
        next(null, {
          code: code
        });
      }
    }
  });
};

handler.guildItem = function(msg, session, next) {
  var player = session.player;
  var guildId = msg.guildId;
  var itemId = msg.itemId;
  if (guildId !== session.get('guildId')) {
    logger.error("guildItem guildId is error guildId=", guildId, ",sguildId=", session.get('guildId'));
  }
  var bagItem = player.bag.getBagItem(itemId);
  if (!bagItem) {
    messageService.pushMessageToPlayer(player.sessionData, "onBagData", player.bag.strip());
    next(null, {
      code: 90
    });
    return;
  }
  utils.myPrint("guildItem guildId=", guildId, ",bagItem=", JSON.stringify(bagItem));

  var playerId = player.id;
  player.bag.removeItemWithCb(itemId, function(err, bagItem) {
    if (err) {
      logger.error("handler.guildItem bagItem removeItemWithCb error ");
      next(null, {
        code: 89
      });
    } else {
      if (bagItem) {
        delete bagItem["position"];
        delete bagItem["playerId"];
        delete bagItem["heroLevel"];
        delete bagItem["equipKind"];
        pomelo.app.rpc.manager.guildRemote.guildItem(session, guildId, playerId, bagItem, function(err, code) {
          if (err) {
            logger.error("guildRemote.guildItem failed ");
            next(null, {
              code: 89
            });
          } else {
            next(null, {
              code: code
            });
          }
        });
      } else {
        messageService.pushMessageToPlayer(player.sessionData, "onBagData", player.bag.strip());
        next(null, {
          code: 90
        });
      }
    }
  });
};

handler.createGuild = function(msg, session, next) {
  var player = session.player;
  var guildName = msg.guildName;

  if (!guildName || guildName.length === 0) {
    next(null, {
      code: 1
    });
    return;
  }
  var fbword = null;
  var searchIndex = null;
  for (var i = 0; i < forbid_word.length; i++) {
    fbword = forbid_word[i]
    searchIndex = guildName.indexOf(fbword);
    if (searchIndex > 0) {
      next(null, {
        code: 2
      });
      return;
    }
  };

  var guildData=dataApi.guild.findById(0);
  var caoCoin = guildData.caoCoin;
  if (player.caoCoin < caoCoin) {
    next(null, {
      code: 93
    });
    return;
  }
  player.addCaoCoin(-caoCoin, function(err, ret) {
    if (err) {
      next(null, {
        code: 89
      });
    } else {
      pomelo.app.rpc.manager.guildRemote.createGuild(session, guildName, player.name, player.id, function(err, guildId) {
        if (err) {
          logger.error("handler.createGuild failed ");
          next(null, {
            code: 89
          });
        } else {
          if (!guildId) {
            next(null, {
              code: 89
            });
          } else {
            if (!player.guildId || player.guildId !== guildId) {
              session.set('guildId', guildId);
              session.pushAll();
              player.guildId = guildId;
              userDao.updateGuildId(player);

              next(null, {
                code: 200,
                guildId: guildId
              });

              var msg = {
                broadId: 120,
                data: []
              };
              msg.data[0] = {
                playerId: player.id,
                name: player.name
              };
              msg.data[1] = caoCoin;
              // msg.data[2] = guildName;
              msg.data[2] = {
                guildId: guildId,
                name: guildName
              };
              pomelo.app.rpc.chat.chatRemote.pushMarquee(session, msg, function() {});
            } else {
              // messageService.pushLogTipsToPlayer(player, 104);
              next(null, {
                code: 104
              });
            }
          }
        }
      });
    }
  });
};

handler.disbandGuild = function(msg, session, next) {
  var guildId = msg.guildId;
  var player = session.player;
  if (guildId !== player.guildId) {
    logger.error("handler.disbandGuild  guildId!==player.guildId guildId=", guildId);
  }
  if (!guildId) {
    next(null, {
      code: 201
    });
    return;
  }

  pomelo.app.rpc.manager.guildRemote.disbandGuild(session, guildId, player.id, function(err, retId) {
    if (err) {
      logger.error("handler.disbandGuild failed ");
      next(null, {
        code: 89
      });
    } else {
      if (retId === 0) {
        session.set('guildId', 0);
        session.push('guildId');
        player.guildId = 0;
        userDao.updateGuildId(player);
        next(null, {
          code: 200
        });
      } else if (retId === 2) {
        next(null, {
          code: 108
        });
      } else {
        next(null, {
          code: 107
        });
      }
    }
  });
};


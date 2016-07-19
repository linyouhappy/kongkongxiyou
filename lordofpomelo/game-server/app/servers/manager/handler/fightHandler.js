/**
 * Module dependencies
 */

var dataApi = require('../../../util/dataApi');
var messageService = require('../../../domain/messageService');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var fightService = require('../../../services/fightService');
// var playerFederateDao = require('../../../dao/playerFederateDao');

var handler = module.exports;

handler.enterFight = function(msg, session, next) {
  var fightData = {
    playerId: session.get('playerId'),
    sid: session.frontendId,
    uid: session.uid,
    fightCount: msg.count,
    playerLevel: session.get('level')
  };
  fightService.pushFightAffiche(fightData, msg.index || 0);
  fightService.enterFight(fightData, function(err, fightCount) {
    if (err) {
      logger.error("handler.enterFight failed ");
      next(null, {
        code: 89
      });
    } else {
      next(null, {
        code: 200,
        count: fightCount
      });
    }
  });
};

handler.exitFight = function(msg, session, next) {
  var playerId = session.get('playerId');
  fightService.exitFight(playerId);
  next(null);
};

handler.readyFight = function(msg, session, next) {
  var playerId = session.get('playerId');
  if (!fightService.getPlayerFightByPlayerId(playerId)) {
    next(null, {
      code: 201
    });
  } else {
    fightService.readyFight(playerId, msg.level);
    next(null, {
      code: 200
    });
  }
};

handler.cancelFight=function(msg, session, next) {
  var playerId = session.get('playerId');
  fightService.cancelFight(playerId);
  next(null);
};

handler.changeFight=function(msg, session, next) {
  var playerId = session.get('playerId');
  if (!fightService.getPlayerFightByPlayerId(playerId)) {
    next(null, {
      code: 201
    });
  } else {
    fightService.changeFight(playerId, msg.level, msg.prepare);
    next(null, {
      code: 200
    });
  }
};

handler.prepareFight=function(msg, session, next) {
  var playerId = session.get('playerId');
  fightService.prepareFight(playerId);
  next(null);
};

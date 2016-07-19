var dataApi = require('../util/dataApi');
var utils = require('../util/utils');
var pomelo = require('pomelo');
var consts = require('../consts/consts');
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../domain/messageService');

var fightDao = require('../dao/fightDao');

var exp = module.exports;

var recodeUid = 1;
var _fightAffiches;
var _playerFights;

var _waitFighters;

var _instanceId;

exp.init = function() {
  _fightAffiches = [];
  _playerFights = {};

  _waitFighters = [];
  _waitFighters[1] = [];
  _waitFighters[2] = [];
  _waitFighters[3] = [];
  _waitFighters[4] = [];

  _instanceId=0;
};

exp.getPlayerFights = function() {
  return _playerFights;
};

exp.getPlayerFightByPlayerId = function(playerId) {
  return _playerFights[playerId];
};

exp.getAffiches = function() {
  return _fightAffiches;
};

exp.addAffiche = function(winnerName, loserName, level) {
  _fightAffiches.push({
    id: recodeUid++,
    winner: winnerName,
    loser: loserName,
    level: level,
    time: Date.now()
  });

  while (_fightAffiches.length > 7) {
    _fightAffiches.shift();
  }
};

exp.pushFightAffiche = function(player, index) {
  var newAffiches = [];
  for (var i = _fightAffiches.length - 1; i >= 0; i--) {
    if (_fightAffiches[i].id > index) {
      newAffiches.push(_fightAffiches[i]);
    } else {
      break;
    }
  }
  if (newAffiches.length === 0) {
    return;
  }
  newAffiches.reverse();
  messageService.pushMessageToPlayer(player, 'onFightAffiche', newAffiches);
};

exp.getPlayerFight = function(playerId, cb) {
  var playerFight = _playerFights[playerId];
  if (playerFight) {
    utils.invokeCallback(cb, null, playerFight);
    return;
  }
  fightDao.getDataByPlayerId(playerId, function(err, playerFight) {
    if (err) {
      utils.invokeCallback(cb, err);
    } else {
      _playerFights[playerId] = playerFight;
      utils.invokeCallback(cb, null, playerFight);
    }
  });
};

exp.enterFight = function(fightData, cb) {
  // this.addAffiche("winner4","loser",4);
  this.getPlayerFight(fightData.playerId, function(err, playerFight) {
    if (err) {
      messageService.pushLogTipsToPlayer(fightData, 110);
      utils.invokeCallback(cb, err);
    } else {
      playerFight.sid = fightData.sid;
      playerFight.uid = fightData.uid;
      playerFight.playerLevel = fightData.playerLevel;

      var date = new Date;
      if (!playerFight.time) {
        playerFight.time = date.getTime();
        playerFight.count = 8;
        savePlayerFight(playerFight);
      } else {
        var currentDate = date.getDate();
        var currentMonth = date.getMonth();
        date.setTime(playerFight.time);
        if (date.getDate() !== currentDate || date.getMonth() !== currentMonth) {
          playerFight.time = date.getTime();
          playerFight.count = 8;
          savePlayerFight(playerFight);
        }
      }
      utils.invokeCallback(cb, null, playerFight.count);
    }
  });
};

exp.exitFight = function(playerId) {
  // utils.myPrint("exp.exitFight playerId = ", playerId);
  this.cancelFight(playerId);
  delete _playerFights[playerId];
};

exp.kick = function(playerId) {
  this.exitFight(playerId);
};

exp.pushFighter = function(player, fighter) {
  if (!player.uid) {
    return;
  }
  var msg = {
    count: player.count
  };
  messageService.pushMessageToPlayer(player, 'onFight', msg);
};

exp.pushCompetitor = function(player, competitor, isFight) {
  if (!player.uid) {
    return;
  }
  var msg = {
    playerId: competitor.playerId
  };
  if (isFight) {
    msg.level = competitor.playerLevel;
    msg.name = competitor.name;
    msg.kindId = competitor.kindId;
    msg.prepare = competitor.prepareFight;
  } else {
    msg.kindId = 0;
  }
  messageService.pushMessageToPlayer(player, 'onCompetitor', msg);
};

exp.readyFight = function(playerId, fightLevel) {
  // utils.myPrint("exp.readyFight playerId = ", playerId,fightLevel);
  this.cancelFight(playerId);
  var fighters = _waitFighters[fightLevel];
  if (fighters) {
    var playerFight = _playerFights[playerId];
    if (playerFight) {
      playerFight.fightLevel = fightLevel;
      if (fighters.length === 0) {
        fighters.push(playerId);
      } else {
        var index, competitorId, competitorFight;
        var rejectCompetitors = playerFight.rejectCompetitors;
        var validateFights = [];
        for (var index = 0; index < fighters.length; index++) {
          competitorId = fighters[index];
          if (competitorId === playerId) {
            fighters.splice(index, 1);
            index--;
          } else if (_playerFights[competitorId]) {
            if (rejectCompetitors && rejectCompetitors[competitorId]) {
              continue;
            }
            competitorFight = _playerFights[competitorId];
            if (competitorFight.rejectCompetitors && competitorFight.rejectCompetitors[playerId]) {
              competitorFight = null;
              continue;
            }
            if (Math.abs(competitorFight.playerLevel - playerFight.playerLevel) < 2) {
              break;
            } else {
              competitorFight = null;
              validateFights.push(competitorId);
            }
          } else {
            fighters.splice(index, 1);
            index--;
          }
        }
        if (!competitorFight) {
          if (validateFights.length === 0) {
            fighters.push(playerId);
            return;
          }
          var iterationTimes = 0;
          while (true) {
            if (fighters.length === 0) {
              fighters.push(playerId);
              return;
            }

            if (iterationTimes > 5) {
              fighters.push(playerId);
              return;
            }

            index = Math.floor(Math.random() * validateFights.length);
            competitorId = validateFights[index];
            if (rejectCompetitors && rejectCompetitors[competitorId]) {
              continue;
            }

            competitorFight = _playerFights[competitorId]
            if (competitorFight && competitorFight.fightLevel === fightLevel) {
              if (competitorFight.rejectCompetitors && competitorFight.rejectCompetitors[playerId]) {
                competitorFight = null;
                continue;
              }
              break;
            } else {
              competitorFight = null;
            }
          }
        }

        if (competitorFight) {
          if (fighters[index] === competitorFight.playerId) {
            fighters.splice(index, 1);
          }
          playerFight.competitorId = competitorFight.playerId;
          competitorFight.competitorId = playerFight.playerId;

          exp.pushCompetitor(playerFight, competitorFight, true);
          exp.pushCompetitor(competitorFight, playerFight, true);
        }
      }
    }
  }
};

exp.changeFight = function(playerId, fightLevel, prepareFight) {
  // utils.myPrint("exp.changeFight playerId = ", playerId);
  var playerFight = _playerFights[playerId];
  playerFight.prepareFight = prepareFight || 0;
  var competitorId = playerFight.competitorId;
  if (competitorId) {
    var rejectCompetitors = playerFight.rejectCompetitors;
    if (!rejectCompetitors) {
      rejectCompetitors = {};
      playerFight.rejectCompetitors = rejectCompetitors;
    }
    rejectCompetitors[competitorId] = competitorId;
  }
  this.readyFight(playerId, fightLevel);
};

exp.cancelFight = function(playerId) {
  // utils.myPrint("exp.cancelFight playerId = ", playerId);
  var playerFight = _playerFights[playerId];
  if (playerFight) {
    playerFight.prepareFight = 0;
    if (playerFight.fightLevel) {
      var fighters = _waitFighters[playerFight.fightLevel];
      if (fighters) {
        for (var i = 0; i < fighters.length; i++) {
          if (fighters[i] === playerId) {
            fighters.splice(i, 1);
            break;
          }
        }
      }
      playerFight.fightLevel = 0;
      if (playerFight.competitorId) {
        var competitorFight = _playerFights[playerFight.competitorId];
        if (competitorFight && competitorFight.competitorId === playerId) {
          this.pushCompetitor(competitorFight, playerFight);
        }
        playerFight.competitorId = 0;
      }
    }
  }
};

exp.pushPrepareFight = function(player, competitor) {
  if (!player.uid) {
    return;
  }
  var msg = {
    playerId: competitor.playerId
  };
  messageService.pushMessageToPlayer(player, 'onPrepareFight', msg);
};

exp.pushPlayerToArea = function(player,instanceId) {
  if (!player.uid) {
    return;
  }
  var msg = {
    areaId: 4001,
    instanceId:instanceId
  };
  messageService.pushMessageToPlayer(player, 'onDragArea', msg);
};

exp.prepareFight = function(playerId) {
  var playerFight = _playerFights[playerId];
  if (playerFight) {
    playerFight.prepareFight = 1;
    this.pushPrepareFight(playerFight,playerFight);
    if (playerFight.competitorId) {
      var competitorFight = _playerFights[playerFight.competitorId];
      if (competitorFight && competitorFight.competitorId === playerId) {
        this.pushPrepareFight(competitorFight, playerFight);

        if (playerFight.prepareFight && competitorFight.prepareFight) {
            _instanceId++;
          this.pushPlayerToArea(playerFight,_instanceId);
          this.pushPlayerToArea(competitorFight,_instanceId);
        }
      }
    }
  }
};

exp.finishFight = function(winnerId, loserId) {
  var winnerFight = _playerFights[winnerId];
  var loserFight = _playerFights[loserId];
  if (winnerFight) {
    if (loserFight) {
      exp.addAffiche(winnerFight.name, loserFight.name, winnerFight.fightLevel);
    }else{
      exp.addAffiche(winnerFight.name, null, winnerFight.fightLevel);
    }
    return winnerFight.fightLevel;
  }
};

// function deleteCandidate(candidate) {
//   candidateDao.destroy(candidate.id || 0);
// }

function savePlayerFight(playerFight) {
  fightDao.update(playerFight);
}
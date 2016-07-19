var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var pomelo = require('pomelo');
var teamManager = require('../../../services/teamManager');

var handler = module.exports;
var guildService=pomelo.app.get('guildService');

handler.getTeamInfo = function(msg, session, next) {
  var teamObj;
  var teamId = msg.teamId;
  if (!!teamId) {
    teamObj = teamManager.getTeamById(teamId);
    if (teamObj.teamId !== teamId) {
      next(null, {
        code: 201
      });
      return;
    }
  } else if (!!msg.playerId) {
    teamObj = teamManager.getTeamByPlayerId(msg.playerId);
  } else {
    next(null, {
      code: 201
    });
  }

  var data = {
    code: 200
  };
  if (teamObj) {
    data.captainId = teamObj.captainId;
    data.teamId = teamObj.teamId;
    data.teamName = teamObj.teamName;
  }
  next(null, data);
};
/**
 * Module dependencies
 */
var Team = require('../domain/entity/team');
var consts = require('../consts/consts');
var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../domain/messageService');


var exp = module.exports;

// global team container(teamId:teamObj)
var gTeamObjDict = {};
var gPlayerId2Teams = {};
// global team id
var gTeamId = 0;

// create new team, add the player(captain) to the team
exp.createTeam = function(data) {
  var team = gPlayerId2Teams[data.playerId];
  var result = consts.TEAM.IN_OTHER_TEAM;
  if (!team) {
    utils.myPrint('create new team==========>>>');
    var team = new Team(++gTeamId);
    result = team.addPlayer(data, true);
    if (result === consts.TEAM.OK) {
      this.addTeam(team);
    } else {
      logger.error("Team have create,but adding captain is failed");
    }
  } else {
    utils.myPrint('you already have a team==========>>>');
    if (team.captainId === data.playerId) {
      utils.myPrint('you are the captain==========>>>');
      result = team.addPlayer(data, true);
    }
  }
  return {
    result: result,
    teamId: team.teamId
  };
};

// exp.__getTeamByPlayerId=function(captainId){
//  return  gPlayerId2Teams[captainId];
// };

exp.addTeam = function(team) {
  gTeamObjDict[team.teamId] = team;
  for (var key in team.playerDatas) {
    var playerId = team.playerDatas[key].playerId
    gPlayerId2Teams[playerId] = team;
  };
};

exp.removeTeam = function(team) {
  delete gTeamObjDict[team.teamId];
  for (var key in team.playerDatas) {
    var playerId = team.playerDatas[key].playerId
    delete gPlayerId2Teams[playerId];
  };
  delete gTeamObjDict[team.teamId];
};

exp.getTeamById = function(teamId) {
  var teamObj = gTeamObjDict[teamId];
  return teamObj;
};

exp.getTeamByPlayerId = function(playerId) {
  var teamObj = gPlayerId2Teams[playerId];
  return teamObj;
};

exp.leaveTeamById = function(playerId, cb) {
  var teamObj = gPlayerId2Teams[playerId];
  if (!teamObj) {
    utils.invokeCallback(cb, null, {
      result: consts.TEAM.OK
    });
    return;
  }
  delete gPlayerId2Teams[playerId];
  var self = this;
  teamObj.removePlayer(playerId, function(err, ret) {
    if (ret) {
      if (teamObj.isDisband) {
        self.removeTeam(teamObj);
      }
    }
    ret = {
      result: consts.TEAM.OK
    };
    utils.invokeCallback(cb, null, ret);
  });
};

exp.disbandTeamById = function(playerId) {
  var teamObj = gPlayerId2Teams[playerId];
  if (!teamObj || !teamObj.isCaptainById(playerId)) {
    return {
      result: consts.TEAM.FAILED
    };
  }

  var ret = teamObj.disbandTeam();
  if (ret.result) {
    this.removeTeam(teamObj);
  }
  return ret;
};

exp.inviteJoinTeam = function(args) {
  if (!args || !args.teamId) {
    return consts.TEAM.FAILED;
  }
  var teamId = args.teamId;
  var teamObj = gTeamObjDict[teamId];
  if (teamObj) {
    if (!teamObj.isTeamHasPosition()) {
      return consts.TEAM.NO_POSITION;
    }
    if (!teamObj.isCaptainById(args.captainId)) {
      return consts.TEAM.NO_CAPTION;
    }
  }
  return consts.TEAM.OK;
};

exp.acceptInviteJoinTeam = function(args) {
  if (!args || !args.teamId) {
    return consts.TEAM.FAILED;
  }
  var teamId = args.teamId;
  var teamObj = gTeamObjDict[teamId];
  if (teamObj) {
    if (!teamObj.isCaptainById(args.captainId)) {
      return consts.TEAM.NO_CAPTION;
    }
    if (gPlayerId2Teams[args.playerId]) {
      messageService.pushLogTipsToPlayer(args,26);
      return consts.TEAM.FAILED;
    }
    if(teamObj.addPlayer(args)===consts.TEAM.OK){
      gPlayerId2Teams[args.playerId]=teamObj;
    }
  }
  return consts.TEAM.OK;
};

exp.applyJoinTeam = function(args) {
  if (!args || !args.teamId) {
    return consts.TEAM.FAILED;
  }
  var teamId = args.teamId;
  var teamObj = gTeamObjDict[teamId];
  if (teamObj) {
    if (!teamObj.isTeamHasPosition()) {
      return consts.TEAM.NO_POSITION;
    }
    if (teamObj.isPlayerInTeam(args.applicantId)) {
      return consts.TEAM.ALREADY_IN_TEAM;
    }
  }

  var captian=teamObj.getCaptain();
  if (!captian) { 
    return consts.TEAM.FAILED;
  }
  var uid = {sid : captian.serverId, uid : captian.userId};
  var msg={
    playerId:args.applicantId,
    name: args.applicantName,
    teamId: teamId
  };
  // logger.log("applyJoinTeam onApplyJoinTeam msg=%j",msg);
  messageService.pushMessageToPlayer(uid, 'onApplyJoinTeam', msg);

  // teamObj.captainId
  return consts.TEAM.OK;
};

exp.acceptApplicantJoinTeam = function(args) {
  var result = consts.TEAM.FAILED;
  if (!args || !args.teamId) {
    return consts.TEAM.FAILED;
  }
  var teamId = args.teamId;
  var teamObj = gTeamObjDict[teamId];
  if (teamObj) {
    if (!teamObj.isCaptainById(args.captainId)) {
      return consts.TEAM.NO_CAPTION;
    }

    if (gPlayerId2Teams[args.playerId]) {
      messageService.pushLogTipsToPlayer(args,26);
      return consts.TEAM.FAILED;
    }

    result = teamObj.addPlayer(args);
    if(result===consts.TEAM.OK){
      gPlayerId2Teams[args.playerId]=teamObj;
    }
  }
  return result;
};

// check member num when a member leaves the team,
// if there is no member in the team,
// disband the team automatically
exp.try2DisbandTeam = function(teamObj) {
  if (!teamObj.isTeamHasMember()) {
    delete gTeamObjDict[teamObj.teamId];
  }
};

exp.dragMember2gameCopy = function(args, cb) {
  // utils.myPrint('2 ~ DragMember2gameCopy ~ args = ', JSON.stringify(args));
  var teamId = args.teamId;
  if (!teamId) {
    utils.invokeCallback(cb, 'No teamId! %j', args);
    return;
  }
  var teamObj = gTeamObjDict[teamId];
  if (!teamObj) {
    utils.invokeCallback(cb, 'No teamObj! %j', args);
    return;
  }
  teamObj.dragMember2gameCopy(args, cb);
};

exp.updateMemberInfo = function(playerData) {
  var result = consts.TEAM.FAILED;
  if (!playerData || !playerData.teamId) {
    return {
      result: result
    };
  }
  var teamId = playerData.teamId;
  var teamObj = gTeamObjDict[teamId];
  if (teamObj && teamObj.updateMemberInfo(playerData)) {
    result = consts.TEAM.OK;
  }
  return {
    result: result
  };
};

exp.chatInTeam = function(args) {
  var result = consts.TEAM.FAILED;
  if (!args || !args.teamId) {
    return {
      result: result
    };
  }
  var teamId = args.teamId;
  var teamObj = gTeamObjDict[teamId];
  // utils.myPrint('args = ', JSON.stringify(args));
  // utils.myPrint('teamObj = ', teamObj);
  if (teamObj && teamObj.pushChatMsg2All(args.content)) {
    result = consts.TEAM.OK;
  }

  return {
    result: result
  };
};


exp.kickOut = function(args, cb) {
  if (!args || !args.teamId) {
    utils.invokeCallback(cb, null, {
      result: consts.TEAM.FAILED
    });
    return;
  }
  var teamId = args.teamId;
  var teamObj = gTeamObjDict[teamId];
  if (teamObj) {
    if (!teamObj.isCaptainById(args.captainId)) {
      logger.warn('The request(kickOut) is illegal, the captainId is wrong : args = %j.', args);
      utils.invokeCallback(cb, null, {
        result: consts.TEAM.FAILED
      });
      return;
    }
    teamObj.removePlayer(args.kickedId, function(err, ret) {
      delete gPlayerId2Teams[args.kickedId];
      utils.invokeCallback(cb, null, ret);
    });
  }
};
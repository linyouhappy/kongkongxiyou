/**
 * Module dependencies
 */
var consts = require('../../consts/consts');
var pomelo = require('pomelo');
var utils = require('../../util/utils');
var channelUtil = require('../../util/channelUtil');
var Event = require('../../consts/consts').Event;

// max member num in a team
var MAX_MEMBER_NUM = 3;
///////////////////////////////////////////////////////
function Team(teamId) {
  this.teamId = teamId;
  this.captainId = 0;
  this.playerDatas = [];

  var channelName = channelUtil.getTeamChannelName(this.teamId);
  this.channel = pomelo.app.get('channelService').getChannel(channelName, true);
}

Team.prototype.addPlayer2Channel = function(data) {
  if (!this.channel) {
    return false;
  }
  if (data) {
    this.channel.add(data.userId, data.serverId);
    return true;
  }
  return false;
};

Team.prototype.removePlayerFromChannel = function(data) {
  if (!this.channel) {
    return false;
  }
  if (data) {
    this.channel.leave(data.userId, data.serverId);
    return true;
  }
  return false;
};

Team.prototype.addPlayer = function(data, isCaptain) {
  isCaptain = isCaptain || false;

  while (true) {
    if (!data)
      break;

    if (!this.isTeamHasPosition())
      return consts.TEAM.NO_POSITION;

    if (this.isPlayerInTeam(data.playerId))
      return consts.TEAM.ALREADY_IN_TEAM;

    var playerData = {
      playerId: data.playerId,
      areaId: data.areaId,
      userId: data.userId,
      serverId: data.serverId,
      backendServerId: data.backendServerId,
      playerName: data.playerName,
      level: data.level,
      kindId: data.kindId,
      instanceId: data.instanceId
    };

    if (isCaptain) {
      this.setCaptainId(data.playerId);
      playerData.isCaptain = consts.TEAM.YES;
      this.teamName = data.playerName
    }

    this.playerDatas.push(playerData);
    this.addPlayer2Channel(data)
    this.updateTeamInfo();
    return consts.TEAM.OK;
  }
  return consts.TEAM.SYS_ERROR;
};

// remove a player from the team
Team.prototype.removePlayer = function(playerId, cb) {
  var playerData = null;
  var index = 0;
  var playerDatas = this.playerDatas;
  var needDisband = false;
  for (var key in playerDatas) {
    if (playerDatas[key].playerId === playerId) {
      playerData = playerDatas[key];
      index = Number(key);
    }
  }

  if (!playerData) {
    var ret = {
      result: consts.TEAM.FAILED
    };
    utils.invokeCallback(cb, null, ret);
    return false;
  }
  var newCaptainData = null;
  var self = this;
  // async network operation
  this.pushLeaveMsg2All(playerId, function(err, ret) {
    self.removePlayerFromChannel(playerData);
    playerDatas.splice(index, 1);

    if (playerDatas.length > 0) {
      if (self.captainId === playerId) {
        newCaptainData = playerDatas[0];
        self.teamName=newCaptainData.playerName;
        self.setCaptainId(newCaptainData.playerId);
      }
      self.updateTeamInfo();
    } else {
      self.disbandTeam();
    }
    utils.invokeCallback(cb, null, {
      result: consts.TEAM.OK
    });
  });

  // //rpc invoke
  // var params = {
  //   namespace: 'user',
  //   service: 'playerRemote',
  //   method: 'leaveTeam',
  //   args: [{
  //     playerId: playerData.playerId,
  //     instanceId: playerData.instanceId
  //   }]
  // };
  // // utils.myPrint('params = ', JSON.stringify(params));
  // pomelo.app.rpcInvoke(playerData.backendServerId, params, function(err, _) {
  //   if (!!err) {
  //     console.warn(err);
  //   }
  // });
};

// disband the team
Team.prototype.disbandTeam = function() {
  this.isDisband=true;
  var playerIdArray = [];
  for (var key in this.playerDatas) {
    var playerData = this.playerDatas[key];
    playerIdArray.push(playerData.playerId);

    var params = {
      namespace: 'user',
      service: 'playerRemote',
      method: 'leaveTeam',
      args: [{
        playerId: playerData.playerId,
        instanceId: playerData.instanceId
      }]
    };
    pomelo.app.rpcInvoke(playerData.backendServerId, params, function(err, _) {
      if (!!err) {
        console.warn(err);
      }
    });
  }
  if (playerIdArray.length > 0) {
    this.channel.pushMessage('onDisbandTeam', playerIdArray, null);
  }
  return {
    result: consts.TEAM.OK
  };
};

Team.prototype.getCaptain = function() {
  var playerData;
  for (var key in this.playerDatas) {
    playerData = this.playerDatas[key];
    if (playerData.playerId === this.captainId) {
      return playerData;
    }
  }
  return null;
};

// the captain_id is just a player_id
Team.prototype.setCaptainId = function(captainId) {
  this.captainId = captainId;
};

// is the player the captain of the team
Team.prototype.isCaptainById = function(playerId) {
  return !!playerId && playerId === this.captainId;
};

// player num in the team
Team.prototype.getPlayerNum = function() {
  return this.playerDatas.length;
};

// is there a empty position in the team
Team.prototype.isTeamHasPosition = function() {
  return this.getPlayerNum() < MAX_MEMBER_NUM;
};

// is there any member in the team
Team.prototype.isTeamHasMember = function() {
  return this.getPlayerNum() > 0;
};

// the first real player_id in the team
Team.prototype.getFirstPlayerId = function() {
  var playerData = this.playerDatas[0];
  if (playerData) {
    return playerData.playerId;
  }
  return consts.TEAM.PLAYER_ID_NONE;
};

// check if a player in the team
Team.prototype.isPlayerInTeam = function(playerId) {
  for (var key in this.playerDatas) {
    var playerData = this.playerDatas[key];
    if (playerData.playerId === playerId) {
      return true;
    }
  }
  return false;
};

Team.prototype.updateMemberInfo = function(data) {
  if (this.teamId !== data.teamId) {
    return false;
  }
  for (var key in this.playerDatas) {
    var playerData = this.playerDatas[key];
    if (playerData.playerId === data.playerId) {
      if (!!data.backendServerId) {
        playerData.backendServerId = data.backendServerId;
      }
      playerData.areaId = data.areaId;
      if (data.needNotifyElse) {
        this.updateTeamInfo();
      }
      return true;
    }
  };
  return false;
};

// push the team members' info to everyone
Team.prototype.updateTeamInfo = function() {
  var msg = {
    teamId: this.teamId,
    captainId: this.captainId,
    playerDatas: []
  };
  for (var key in this.playerDatas) {
    var playerData = this.playerDatas[key];
    msg.playerDatas.push({
      playerId: playerData.playerId,
      name: playerData.playerName,
      level: playerData.level,
      kindId: playerData.kindId
    });
  }

  if (Object.keys(msg).length > 0) {
    this.channel.pushMessage('onUpdateTeam', msg);
  }
};

// notify the members of the left player
Team.prototype.pushLeaveMsg2All = function(leavePlayerId, cb) {
  var ret = {
    result: consts.TEAM.OK
  };
  if (!this.channel) {
    cb(null, ret);
    return;
  }
  var msg = {
    playerId: leavePlayerId
  };
  this.channel.pushMessage('onTeammateLeaveTeam', msg, function(err, _) {
    cb(null, ret);
  });
};

// push msg to all of the team members 
Team.prototype.pushChatMsg2All = function(content) {
  if (!this.channel) {
    return false;
  }
  var playerId = content.playerId;
  utils.myPrint('1 ~ content = ', JSON.stringify(content));
  if (!this.isPlayerInTeam(playerId)) {
    return false;
  }
  // utils.myPrint('2 ~ content = ', JSON.stringify(content));
  this.channel.pushMessage('onChat', content, null);
  return true;
};

Team.prototype.dragMember2gameCopy = function(args, cb) {
  if (!this.channel) {
    utils.invokeCallback(cb, 'Team without channel! %j', {
      teamId: this.teamId,
      captainId: this.captainId
    });
    return;
  }
  // utils.myPrint('3 ~ DragMember2gameCopy ~ args = ', JSON.stringify(args));
  this.channel.pushMessage('onDragMember2gameCopy', args, null);
  utils.invokeCallback(cb);
};

///////////////////////////////////////////////////////
/**
 * Expose 'Team' constructor.
 */
module.exports = Team;
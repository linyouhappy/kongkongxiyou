/**
 * Module dependencies
 */
var messageService = require('../../../domain/messageService');
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('../../../consts/consts');
var utils = require('../../../util/utils');
var dataApi = require('../../../util/dataApi');


module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * Player create a team, and response the result information : success(1)/failed(0)
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.createTeam = function(msg, session, next) {
  var area = session.area;
  var playerId = session.get('playerId');
  // utils.myPrint('Handler ~ createTeam is running ... ~ playerId = ', playerId);
  var player = session.player;
  // if (!player) {
  //   logger.warn('createTeam is illegal, the player is null : msg = %j.', msg);
  //   next(null, {
  //     code: 14
  //   });
  //   return;
  // }
  // if the player is already in a team, can't create team
  if (player.teamId !== consts.TEAM.TEAM_ID_NONE) {
    logger.warn('createTeam is illegal, the player is already in a team : msg = %j.', msg);
    next(null, {
      code: 15,
      teamId: player.teamId
    });
    return;
  }
  var args = {
    playerId: playerId,
    areaId: area.areaId,
    userId: player.userId,
    serverId: player.serverId,
    backendServerId: this.app.getServerId(),
    // playerInfo: playerInfo
    playerName: player.name,
    level: player.level,
    kindId: player.kindId,
    instanceId: player.instanceId
  };

  var result = consts.TEAM.SYS_ERROR;
  this.app.rpc.manager.teamRemote.createTeam(session, args,
    function(err, ret) {
      result = ret.result;
      var teamId = ret.teamId;
      utils.myPrint("result = ", result, "teamId = ", teamId);
      if (result === consts.TEAM.OK || result === consts.TEAM.ALREADY_IN_TEAM) {
        if (teamId > consts.TEAM.TEAM_ID_NONE) {
          player.joinTeam(teamId)
          player.isCaptain = consts.TEAM.YES;

          ignoreList = {};
          ignoreList[player.userId] = true;

          messageService.pushMessageByAOI(area, 'onTeamChange', {
            playerId: playerId,
            teamId: player.teamId,
            isCaptain: player.isCaptain
          }, {
            x: player.x,
            y: player.y
          }, ignoreList);

          // logger.log("player.teamId = ", player.teamId);
          next(null, {
            code: 200
          });
        } else {
          next(null, {
            code: 16
          });
        }
      } else if (result === consts.TEAM.IN_OTHER_TEAM) {
        next(null, {
          code: 17
        });
      }
    });
};

/**
 * member leave the team voluntarily, and push info to other members
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.leaveTeam = function(msg, session, next) {
  var area = session.area;
  var playerId = session.get('playerId');
  var player = session.player;
  // if (!player) {
  //   logger.warn('leaveTeam is illegal, the player is null: msg = %j.', msg);
  //   messageService.pushLogTipsToPlayer(player,18);
  //   next();
  //   return;
  // }
  // logger.info('playerId=' + playerId + ",teamId = " + player.teamId + ',instanceId = ' + player.instanceId);
  if (player.instanceId) {
    next();
    return;
  }
  var result = consts.TEAM.FAILED;
  if (player.teamId <= consts.TEAM.TEAM_ID_NONE) {
    logger.warn('leaveTeam is illegal, the teamId is wrong: msg = %j.', msg);
    messageService.pushLogTipsToPlayer(player,19);
    next();
    return;
  }

  var args = {
    playerId: playerId,
  };
  this.app.rpc.manager.teamRemote.leaveTeamById(session, args,
    function(err, ret) {

      player.leaveTeam();
      var ignoreList = {};
      ignoreList[player.userId] = true;

      messageService.pushMessageByAOI(area, 'onTeamChange', {
        playerId: playerId,
        teamId: consts.TEAM.TEAM_ID_NONE
      }, {
        x: player.x,
        y: player.y
      }, ignoreList);

    });
  next();
};

/**
 * Captain disband the team, and response the result information : success(1)/failed(0)
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.disbandTeam = function(msg, session, next) {
  var area = session.area;
  var playerId = session.get('playerId');
  var player = session.player;

  // logger.debug('disbandTeam===========>>, player=%j', player);

  // if (!player) {
  //   logger.warn('disbandTeam is illegal, the player is null : msg = %j.', msg);
  //   messageService.pushLogTipsToPlayer(player,18);
  //   next();
  //   return;
  // }
  if (player.teamId <= consts.TEAM.TEAM_ID_NONE) {
    logger.warn('disbandTeam is illegal, the teamId is wrong : msg = %j.', msg);
    messageService.pushLogTipsToPlayer(player,19);
    next();
    return;
  }
  if (player.instanceId) {
    next();
    return;
  }
  if (!player.isCaptain) {
    logger.warn('The request(disbandTeam) is illegal, the player is not the captain : msg = %j.', msg);
    messageService.pushLogTipsToPlayer(player,20);
    next();
    return;
  }
  var result = consts.TEAM.FAILED;
  var args = {
    playerId: playerId,
    teamId: player.teamId
  };
  this.app.rpc.manager.teamRemote.disbandTeamById(session, args,
    function(err, ret) {
      result = ret.result;
      // logger.debug('disbandTeam===========>>, ret=%j', ret);
      if (result === consts.TEAM.OK) {
        if (player.isCaptain) {
          player.isCaptain = consts.TEAM.NO;
          var ignoreList = {};
          messageService.pushMessageByAOI(area, 'onTeamCaptainStatusChange', {
            playerId: playerId,
            teamId: consts.TEAM.TEAM_ID_NONE
              // isCaptain: player.isCaptain,
              // teamName: consts.TEAM.DEFAULT_NAME
          }, {
            x: player.x,
            y: player.y
          }, ignoreList);
        }
      }
    });

  next();
};

/**
 * Notify: Captain invite a player to join the team, and push invitation to the invitee
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.inviteJoinTeam = function(msg, session, next) {
  var area = session.area;
  var captainId = session.get('playerId');
  var captainObj = area.getPlayer(captainId);

  // logger.debug("inviteJoinTeam msg=%j",msg);

  if (!captainObj) {
    logger.warn('inviteJoinTeam is illegal, the player is null : msg = %j.', msg);
    next(null, {
      code: 18
    });
    return;
  }

  var inviteeObj = area.getPlayer(msg.inviteeId);
  if (!inviteeObj) {
    logger.warn('inviteJoinTeam is illegal, the invitee is null : msg = %j.', msg);
    next(null, {
      code: 21
    });
    return;
  }

  if (inviteeObj.teamId !== consts.TEAM.TEAM_ID_NONE) {
    next(null, {
      code: 25
    });
    return;
  }

  var args = {
    captainId: captainId,
    teamId: captainObj.teamId
  };
  this.app.rpc.manager.teamRemote.inviteJoinTeam(session, args, function(err, ret) {
    if (ret.result === consts.TEAM.OK) {
      var captainInfo = {
        playerId: captainObj.id,
        name: captainObj.name,
        teamId: captainObj.teamId
      };
      messageService.pushMessageToPlayer({
          uid: inviteeObj.userId,
          sid: inviteeObj.serverId
        },
        'onInviteJoinTeam', captainInfo);
      next(null, {
        code: 200
      });
    } else if (ret.result === consts.TEAM.NO_POSITION) {
      next(null, {
        code: 22
      });
    } else if (ret.result === consts.TEAM.NO_CAPTION) {
      next(null, {
        code: 20
      });
    } else {
      next(null, {
        code: 201
      });
    }
  });
};

/**
 * Request: invitee reply to join the team's captain, response the result, and push msg to the team members
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.inviteJoinTeamReply = function(msg, session, next) {
  var area = session.area;
  var inviteeId = session.get('playerId');
  var inviteeObj = area.getPlayer(inviteeId);

  if (!inviteeObj) {
    logger.warn('The request(inviteJoinTeamReply) is illegal, the player is null : msg = %j.', msg);
   
    messageService.pushLogTipsToPlayer(player,18);
    next();
    return;
  }

  // var captainObj = area.getPlayer(msg.captainId);
  // if (!captainObj) {
  //   logger.warn('The request(inviteJoinTeamReply) is illegal, the captain is null : msg = %j.', msg);
  //   next(null, {
  //     code: 23
  //   });
  //   return;
  // }
  // if (msg.teamId !== captainObj.teamId) {
  //   logger.warn('The request(inviteJoinTeamReply) is illegal, the teamId is wrong : msg = %j.', msg);
  //   next(null, {
  //     code: 24
  //   });
  //   return;
  // }
  if (msg.reply != consts.TEAM.ACCEPT) {
    // messageService.pushMessageToPlayer({
    //     uid: captainObj.userId,
    //     sid: captainObj.serverId
    //   },
    //   'onInviteJoinTeamReply', {
    //     reply: msg.reply
    //   });
    next();
    return;
  }

  var args = {
    captainId: msg.captainId,
    teamId: msg.teamId,
    playerId: inviteeId,
    areaId: area.areaId,
    userId: inviteeObj.userId,
    serverId: inviteeObj.serverId,
    backendServerId: this.app.getServerId(),
    playerName: inviteeObj.name,
    level: inviteeObj.level,
    kindId: inviteeObj.kindId,
    instanceId: inviteeObj.instanceId
  };

  this.app.rpc.manager.teamRemote.acceptInviteJoinTeam(session, args, function(err, ret) {
    if (!!err) {
      next();
      return;
    }
    if (ret.result === consts.TEAM.OK) {
      inviteeObj.joinTeam(msg.teamId)

      inviteeObj.isCaptain = consts.TEAM.NO;
      var ignoreList = {};
      ignoreList[inviteeObj.userId] = true;

      messageService.pushMessageByAOI(area, 'onTeamChange', {
        playerId: inviteeId,
        teamId: inviteeObj.teamId,
        isCaptain: inviteeObj.isCaptain
      }, {
        x: inviteeObj.x,
        y: inviteeObj.y
      }, ignoreList);

      next();

    } else {
      next();
    }
  });
};

/**
 * Notify: applicant apply to join the team, and push the application to the captain
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.applyJoinTeam = function(msg, session, next) {
  var area = session.area;
  var applicantId = session.get('playerId');
  var applicantObj = area.getPlayer(applicantId);

  if (!applicantObj) {
    logger.warn('The request(applyJoinTeam) is illegal, the player is null : msg = %j.', msg);
    next(null, {
      code: 18
    });
    return;
  }

  if (applicantObj.isInTeam()) {
    next(null, {
      code: 26
    });
    return;
  }
  // logger.log("applyJoinTeam msg=%j",msg);

  var captainObj = area.getPlayer(msg.captainId);
  if (!captainObj) {
    logger.warn('The request(applyJoinTeam) is illegal, the captain is null : msg = %j.', msg);
    next(null, {
      code: 23
    });
    return;
  }

  // if (captainObj.teamId !== msg.teamId) {
  //   logger.warn('The request(applyJoinTeam) is illegal, the teamId is wrong : msg = %j.', msg);
  //   next();
  //   return;
  // }
  // send the application to the captain
  var args = {
    applicantId: applicantId,
    applicantName:applicantObj.name,
    teamId: captainObj.teamId
  };
  this.app.rpc.manager.teamRemote.applyJoinTeam(session, args, function(err, ret) {
    var result = ret.result;

    // logger.log("applyJoinTeam msg=%j",ret);

    if (result === consts.TEAM.OK) {
      next(null, {
        code: 200
      });

    } else if(result===consts.TEAM.NO_POSITION){
      next(null, {
        code: 22
      });
    } else {
      next(null, {
        code: 201
      });
    }
  });

};

/**
 * Notify: captain reply the application, and push msg to the team members(accept) or only the applicant(reject)
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.applyJoinTeamReply = function(msg, session, next) {
  // logger.debug("applyJoinTeamReply msg=%j",msg);

  var area = session.area;
  var playerId = session.get('playerId');
  var player = area.getPlayer(playerId);

  if (!player) {
    logger.warn('applyJoinTeamReply is illegal, the player is null : msg = %j.', msg);
    messageService.pushLogTipsToPlayer(player,18);
    next();
    return;
  }

  if (!player.isCaptain || player.teamId !== msg.teamId) {
    logger.warn('applyJoinTeamReply is illegal, the teamId is wrong : msg = %j.', msg);
    messageService.pushLogTipsToPlayer(player,24);
    next();
    return;
  }

  var applicantObj = area.getPlayer(msg.applicantId);
  if (!applicantObj) {
    logger.warn('The request(applyJoinTeamReply) is illegal, the applicantObj is null : msg = %j.', msg);
    messageService.pushLogTipsToPlayer(player,21);
    next();
    return;
  }

  if (applicantObj.isInTeam()) {
    next();
    return;
  }

  if (msg.reply === consts.TEAM.ACCEPT) {
    var result = consts.TEAM.SYS_ERROR;
    // var applicantInfo = applicantObj.toJSON4TeamMember();
    // var backendServerId = this.app.getServerId();
    var args = {
      captainId: playerId,
      teamId: msg.teamId,
      playerId: msg.applicantId,
      areaId: area.areaId,
      userId: applicantObj.userId,
      serverId: applicantObj.serverId,
      backendServerId: this.app.getServerId(),
      playerName: applicantObj.name,
      level: applicantObj.level,
      kindId: applicantObj.kindId,
      instanceId: applicantObj.instanceId
    };

    // logger.log("applyJoinTeamReply args=%j",args);

    this.app.rpc.manager.teamRemote.acceptApplicantJoinTeam(session, args, function(err, ret) {
      // logger.log("applyJoinTeamReply ret=%j",ret);

      result = ret.result;
      if (result === consts.TEAM.OK) {
        applicantObj.joinTeam(msg.teamId)
        //   result = consts.TEAM.SYS_ERROR;
        //   messageService.pushMessageToPlayer({
        //       uid: applicantObj.userId,
        //       sid: applicantObj.serverId
        //     },
        //     'onApplyJoinTeamReply', {
        //       reply: result
        //     });
        // } else {
          applicantObj.isCaptain = consts.TEAM.NO;
          var ignoreList = {};
          ignoreList[applicantObj.userId]=true;

          messageService.pushMessageByAOI(area, {
            route: 'onTeamChange',
            playerId: msg.applicantId,
            teamId: applicantObj.teamId,
            isCaptain: applicantObj.isCaptain
            // teamName: ret.teamName
          }, {
            x: applicantObj.x,
            y: applicantObj.y
          }, ignoreList);
        }
        // utils.myPrint('applicantObj teamId = ', applicantObj.teamId);
      // } else {
      //   messageService.pushMessageToPlayer({
      //       uid: applicantObj.userId,
      //       sid: applicantObj.serverId
      //     },
      //     'onApplyJoinTeamReply', {
      //       reply: ret.result
      //     });
      // }
    });

  } else {
    // push tmpMsg to the applicant that the captain rejected
    messageService.pushMessageToPlayer({
        uid: applicantObj.userId,
        sid: applicantObj.serverId
      },
      'onApplyJoinTeamReply', {
        reply: consts.TEAM.REJECT
      });
  }

  next();
};

/**
 * Captain kicks a team member, and push info to the kicked member and other members
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.kickOut = function(msg, session, next) {
  var area = session.area;
  var captainId = session.get('playerId');
  var captainObj = area.getPlayer(captainId);

  if (!captainObj) {
    logger.warn('kickOut is illegal, the captainObj is null : msg = %j.', msg);
    messageService.pushLogTipsToPlayer(player,18);
    next();
    return;
  }

  if (captainId === msg.kickedId) {
    logger.warn('kickOut is illegal, the kickedPlayerId is captainId : msg = %j.', msg);
    next();
    return;
  }

  if (captainObj.teamId <= consts.TEAM.TEAM_ID_NONE) {
    logger.warn('kickOut is illegal, the teamId is wrong : msg = %j.', msg);
    messageService.pushLogTipsToPlayer(player,19);
    next();
    return;
  }

  utils.myPrint('captainId, instanceId = ', captainId, captainObj.instanceId);
  if (captainObj.instanceId) {
    next();
    return;
  }

  var args = {
    captainId: captainId,
    teamId: captainObj.teamId,
    kickedId: msg.kickedId
  };
  this.app.rpc.manager.teamRemote.kickOut(session, args,
    function(err, ret) {});

  next();
};
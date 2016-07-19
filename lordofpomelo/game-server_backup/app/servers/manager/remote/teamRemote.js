var utils = require('../../../util/utils');
var teamManager = require('../../../services/teamManager');

module.exports = function(){
  return new TeamRemote();
};

var TeamRemote = function(){
};

// can a player create a game copy
TeamRemote.prototype.canCreateGameCopy = function(args, cb){
  var playerId = args.playerId;
  var teamId = args.teamId;

  var result = false;
  var teamObj = teamManager.getTeamById(teamId);
  if(teamObj) {
    result = teamObj.isCaptainById(playerId);
  }

  utils.invokeCallback(cb, null, result);
};

// create a new team
TeamRemote.prototype.createTeam = function(args, cb) {
  utils.myPrint('playerInfo = ', JSON.stringify(args));
  var ret = teamManager.createTeam(args);
  utils.invokeCallback(cb, null, ret);
};

// leave a team
TeamRemote.prototype.leaveTeamById = function(args, cb){
  var playerId = args.playerId;
  teamManager.leaveTeamById(playerId,cb);
};

// disband a team
TeamRemote.prototype.disbandTeamById = function(args, cb){
  var playerId = args.playerId;
  // var teamId = args.teamId;
  var ret = teamManager.disbandTeamById(playerId);
  utils.invokeCallback(cb, null, ret);
};

// captain invite a player to join the team
TeamRemote.prototype.inviteJoinTeam = function(args, cb){
  var ret = teamManager.inviteJoinTeam(args);
  utils.invokeCallback(cb, null, {result:ret});
};

// accept captain's invitation join team
TeamRemote.prototype.acceptInviteJoinTeam = function(args, cb){
  var ret = teamManager.acceptInviteJoinTeam(args);
  utils.invokeCallback(cb, null, {result:ret});
};

// applicant apply to join the team
TeamRemote.prototype.applyJoinTeam = function(args, cb){
  var ret = teamManager.applyJoinTeam(args);
  utils.invokeCallback(cb, null,{result:ret});
};

// accept applicant join team
TeamRemote.prototype.acceptApplicantJoinTeam = function(args, cb){
  var ret = teamManager.acceptApplicantJoinTeam(args);
  utils.invokeCallback(cb, null, {result:ret});
};

// leave a team
TeamRemote.prototype.kickOut = function(args, cb){
  teamManager.kickOut(args, cb);
};

// drag the team members to the game copy
TeamRemote.prototype.dragMember2gameCopy = function(args, cb) {
  utils.myPrint('TeamRemote.DragMember2gameCopy ~ args = ', JSON.stringify(args));
  teamManager.dragMember2gameCopy(args, cb);
};


// update team member's new info
TeamRemote.prototype.updateMemberInfo = function(args, cb){
  utils.myPrint('UpdateMemberInfo is running ... args = ', JSON.stringify(args));
  var ret = teamManager.updateMemberInfo(args);
  utils.invokeCallback(cb, null, ret);
};

// chat in team
TeamRemote.prototype.chatInTeam = function(args, cb){
  utils.myPrint('ChatInTeam is running ... args = ', JSON.stringify(args));
  var ret = teamManager.chatInTeam(args);
  utils.invokeCallback(cb, null, ret);
};



/**
 * Module dependencies
 */

var dataApi = require('../../../util/dataApi');
var messageService = require('../../../domain/messageService');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var federationService = require('../../../services/federationService');
var playerFederateDao = require('../../../dao/playerFederateDao');

var handler = module.exports;

handler.getFederation = function(msg, session, next) {
  var playerId = session.get('playerId');
  federationService.getPlayerFederate(playerId,function(err, playerFederate){
    if (!!err || !playerFederate) {
      messageService.pushLogTipsToPlayer({
        uid: session.uid,
        sid: session.frontendId
      }, 94);
      return;
    }
    playerFederate.uid=session.uid;
    playerFederate.sid=session.frontendId;
    federationService.pushFederation(playerFederate);
  });
  next();
};

handler.topDonations= function(msg, session, next) {
  var topDonations=federationService.topDonations();
  next(null, topDonations);
};

handler.getAffiches=function(msg, session, next){
  var id=msg.id;
  var affiches=federationService.getAffiches();
  var newAffiches=[];
  for (var i = affiches.length - 1; i >= 0; i--) {
    if (affiches[i].id>id) {
      newAffiches.push(affiches[i]);
    }else{
      break;
    }
  }
  newAffiches.reverse();
  next(null, newAffiches);
};

handler.getOffices = function(msg, session, next) {
  var offices = federationService.getOffices();
  var office,msgs=[];
  for (var key in offices) {
    office=offices[key];
    if (office.playerId) {
      msgs.push(office);
    }else{
      msgs.push({
        id: office.id,
        time:office.time,
        state: office.state
      });
    }
  }
  next(null, msgs);
};

handler.getCandidate = function(msg, session, next) {
  var candidate = federationService.getCandidate(msg.officeId);
  next(null, candidate);
};

handler.election=function(msg, session, next) {
  var playerId = session.get('playerId');
  federationService.election(msg.officeId,playerId);
  next();
};

handler.voteTicket=function(msg, session, next) {
  var playerId = session.get('playerId');
  federationService.voteTicket(playerId,msg.officeId,msg.voteCount,msg.voterId);
  next();
};

handler.impeach=function(msg, session, next) {
  var playerId = session.get('playerId');
  federationService.impeach(playerId,msg.officeId,msg.voteCount,msg.type);
  next();
};

handler.abdicate=function(msg, session, next){
  var playerId = session.get('playerId');
  federationService.abdicate(playerId,msg.officeId);
  next();
}

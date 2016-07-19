var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var EntityType = require('../consts/consts').EntityType;
var dataApi = require('../util/dataApi');

var exp = module.exports;

var channelService=null;

exp.pushMessageByUids = function (uids, route, msg) {
  if(!channelService)
    channelService=pomelo.app.get('channelService');

  channelService.pushMessageByUids(route, msg, uids, errHandler);
};

exp.pushMessageToPlayer = function (uid, route, msg) {
  if(!channelService)
    channelService=pomelo.app.get('channelService');

  channelService.pushMessageByUid(route, msg, uid, errHandler);
  //exp.pushMessageByUid([uid], route, msg);
};

exp.pushMessageToPlayerEntity = function (player, route, msg) {
  if (!player.serverId || !player.userId){
    return;
  } 
  
  var uid = {sid : player.serverId, uid : player.userId};
  this.pushMessageToPlayer(uid,route,msg);
};

exp.pushLogTipsToPlayer= function(player,errorCode){
  var uid;
  if (!player.serverId || !player.userId){
    if (!player.uid || !player.sid) {
      return;
    }else{
      uid =player;
    }
  }else{
    uid = {sid : player.serverId, uid : player.userId};
  }
  
  var msg = {
    code: errorCode
  };
  msg.msg=dataApi.error_code.findById(errorCode);
  logger.debug("pushLogTipsToPlayer:%j",msg);

  this.pushMessageToPlayer(uid,'onLogTips',msg);
};

exp.pushTipsBoxToPlayer= function(player,errorCode){
  var uid;
  if (!player.serverId || !player.userId){
    if (!player.uid || !player.sid) {
      return;
    }else{
      uid = player;
    }
  }else{
    uid = {sid : player.serverId, uid : player.userId};
  }
  
  var msg = {
    code: errorCode
  };
  msg.msg=dataApi.error_code.findById(errorCode);
  logger.debug("pushTipsBoxToPlayer:%j",msg);

  this.pushMessageToPlayer(uid,'onTipsBox',msg);
};

exp.pushMessageByAOI = function (area,route, msg, pos, ignoreList) {
  var uids = area.timer.getWatcherUids(pos, [EntityType.PLAYER], ignoreList);

  if (uids.length > 0) {
    exp.pushMessageByUids(uids,route, msg);
  }
};

function errHandler(err, fails){
	if(!!err){
		logger.error('Push Message error! %j', err.stack);
	}

  //if (typeof fails==="Array") {
    for (var i in fails) {
      pomelo.app.areaManager.removePlayerByUid(fails[i]);
      logger.error('session no exist id=%j', fails[i]);
      logger.error('session no exist:%j',new Error("session no exist"));
    };
  //}
  
}
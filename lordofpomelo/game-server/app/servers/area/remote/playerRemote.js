/**
 * Module dependencies
 */

var utils = require('../../../util/utils');
var userDao = require('../../../dao/userDao');
var bagDao = require('../../../dao/bagDao');
var taskDao = require('../../../dao/taskDao');
var consts = require('../../../consts/consts');
var areaService = require('../../../services/areaService');
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../../../domain/messageService');
// var instancePool = require('../../../domain/area/instancePool');
var AreaType = consts.AreaType;
var Channel=consts.Channel;

var exp = module.exports;

var areaManager;

exp.fixPlayerLeave = function(uid, cb) {
  logger.error("ERROR:playerRemote.fixPlayerLeave uid="+uid);
  if (!areaManager) {
    areaManager = pomelo.app.areaManager;
  }
  areaManager.removePlayerByUid(uid);
  utils.invokeCallback(cb);
};

exp.kickPlayers=function(playerIds,cb){
  if (!areaManager) {
    areaManager = pomelo.app.areaManager;
  }
  // if (!area) {
  //   utils.invokeCallback(cb);
  //   return;
  // }
  var playerId;
  for (var i = 0; i < playerIds.length; i++) {
    playerId=playerIds[i];
    var area = areaManager.getPlayerInArea(0,playerId);
    var player = area.getPlayer(playerId);
    if (player) {
      logger.warn("ERROR:fuck you playerId="+player.id);
      area.exitArea(player);
    }
  }
  utils.invokeCallback(cb);
};

exp.leaveInstance = function(args, cb) {
  var playerId = args.playerId;
  if (!areaManager) {
    areaManager = pomelo.app.areaManager;
  }
  var area = areaManager.getPlayerInArea(args.instanceId,playerId);
  if (!area) {
    logger.info('leaveInstance  area is not exist! %j', args);
    utils.invokeCallback(cb);
    return;
  }
  var player = area.getPlayer(playerId);
  if (player) {
    area.exitArea(player);
  }
  if (area.type > AreaType.SCENE) {
    if (area.isEmpty()) {
      areaManager.removeInstance(args.instanceId);
    }
  }
  utils.invokeCallback(cb);
};

/**
 * Player exits. It will persistent player's state in the database.
 *
 * @param {Object} args
 * @param {Function} cb
 * @api public
 */
exp.playerLeave = function(args, cb) {
  var playerId = args.playerId;
  if (!areaManager) {
    areaManager = pomelo.app.areaManager;
  }
  var area = areaManager.getPlayerInArea(args.instanceId,playerId);
  if (!area) {
    logger.error('playerLeave  area is not exist! %j', args);
    utils.invokeCallback(cb);
    return;
  }
  logger.info('playerRemote.playerLeave areaId = ', area.areaId, 'instanceId = ', args.instanceId);
  if (args.time && area.emptyTime>args.time) {
    logger.error('ERROR::playerLeave delay msg=============>>>');
    return;
  }

  var player = area.getPlayer(playerId);
  if (player) {
    if (player.teamId) {
      var params = {
        playerId: playerId
      };
      pomelo.app.rpc.manager.teamRemote.leaveTeamById(null, params,
        function(err, ret) {});
    }
    if (player.hp === 0) {
      player.hp = Math.floor(player.maxHp / 2);
    }
    //If player is in a instance, move to the scene
    if (area.type > AreaType.SCENE) {
      var pos = areaService.getBornPoint(player.areaId);
      player.x = pos.x;
      player.y = pos.y;
    }

    userDao.updatePlayer(player);
    taskDao.tasksUpdate(player.curTasks);
    area.exitArea(player);

    areaManager.addPlayerCaches(player);
    
    area.onUserLeave(playerId);

  } else {
    logger.warn('playerRemote.playerLeave player is not in the area ! %j', args);
  }

  if (area.instanceId && area.isEmpty()) {
    areaManager.removeInstance(area.instanceId);
    logger.info("playerLeave removeInstance instanceId=", area.instanceId);
  }
  utils.invokeCallback(cb);
};

exp.leaveTeam = function(args, cb) {
  var playerId = args.playerId;
  if (!areaManager) {
    areaManager = pomelo.app.areaManager;
  }
  var area = areaManager.getPlayerInArea(args.instanceId,playerId);
  if (!area) {
    err = 'area is no exist!';
    utils.invokeCallback(cb, err);
    return;
  }
  var player = area.getPlayer(playerId);

  // if (args.captainId) {
  //   var captain = area.getPlayer(args.captainId);
  //   captain.isCaptain=consts.TEAM.YES;
  // }

  // utils.myPrint('LeaveTeam ~ areaId = ', area.areaId);
  // utils.myPrint('LeaveTeam ~ instanceId = ', args.instanceId);
  // utils.myPrint('LeaveTeam ~ args = ', JSON.stringify(args));
  var err = null;
  if (!player) {
    err = 'Player leave team error(no player in area)!';
    utils.invokeCallback(cb, err);
    return;
  }
  // utils.myPrint('1 ~ LeaveTeam ~ playerId, player.teamId = ', playerId, player.teamId);

  if (!player.leaveTeam()) {
    err = 'Player have leave team!';
    utils.invokeCallback(cb, err);
    return;
  }
  // utils.myPrint('2 ~ LeaveTeam ~ playerId, player.teamId = ', playerId, player.teamId);
  messageService.pushMessageByAOI(area, 'onTeamChange', {
    playerId: playerId,
    teamId: consts.TEAM.TEAM_ID_NONE
  }, {
    x: player.x,
    y: player.y
  }, {});

  utils.invokeCallback(cb);
};

exp.getChatItem=function(args,cb){
  if (!areaManager) {
    areaManager = pomelo.app.areaManager;
  }
  var player=areaManager.getCanUsedPlayer(args.playerId);
  if (!player) {
    utils.invokeCallback(cb);
    return;
  }
  var equipment=player.bag.getBagItem(args.itemId);
  if (!equipment) {
    equipment = player.equipments.getEquipmentByEquipmentId(args.itemId);
    if (!equipment) {
      utils.invokeCallback(cb);
      return;
    }
  }
  
  var item = {
    // type: equipment.type,
    // kindId: equipment.kindId,
    jobId: equipment.jobId,
    baseValue: equipment.baseValue,
    potential: equipment.potential,
    percent: equipment.percent,
    totalStar: equipment.totalStar
  }
  utils.invokeCallback(cb,null,item);
};




// exp.chatInArea=function(content,cb){
//   if (!areaManager) {
//     areaManager = pomelo.app.areaManager;
//   }
//   // var area = areaManager.getArea(instanceId);
//   var area = areaManager.getArea();
//   if (!area) {
//     // err = 'area is no exist!';
//     logger.error('area is no exist!');
//     utils.invokeCallback(cb);
//     return;
//   }
//   var player = area.getPlayer(content.playerId);
//   if (!player) {
//     // err = 'area is no exist!';
//     logger.error('player is no exist!');
//     utils.invokeCallback(cb);
//     return;
//   }

//   var channel=area.getChannel();
//   if (channel) {
//     content.vip=player.vip,
//     content.from=player.name,
//     content.channel=Channel.AREA;
//     channel.pushMessage('onChat', content);
//   }
//   utils.invokeCallback(cb);
// };

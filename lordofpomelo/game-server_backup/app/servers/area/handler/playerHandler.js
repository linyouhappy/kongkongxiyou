/**
 * Module dependencies
 */
var messageService = require('../../../domain/messageService');
var areaService = require('../../../services/areaService');

var userDao = require('../../../dao/userDao');
var Move = require('../../../domain/action/move');
var actionManager = require('../../../domain/action/actionManager');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var dataApi = require('../../../util/dataApi');
var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');
var equipmentDao = require('../../../dao/equipmentDao');
var EntityType = consts.EntityType;
var ActionType=consts.ActionType;
var AreaKinds=consts.AreaKinds;
var AreaStates = consts.AreaStates;
var NPC=consts.NPC;

var handler = module.exports;

/**
 * Player enter scene, and response the related information such as
 * playerInfo, areaInfo and mapData to client.
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.enterScene = function(msg, session, next) {
  var area = session.area;
  var playerId = session.get('playerId');
  var instanceId = session.get('instanceId');
  
  utils.myPrint("EnterScene areaId =", area.areaId, ",playerId=", playerId,",instanceId=",instanceId);

  userDao.getPlayerAllInfo(playerId, function(err, player) {
    utils.myPrint("EnterScene==================>>>>> areaId =", area.areaId);
    if (err || !player) {
      logger.error('Get user for userDao failed! ' + err.stack);
      next(new Error('fail to get user from dao'), {
        code: 12
      });
      return;
    }
    if (area.getPlayer(playerId)) {
      logger.error("enterScene player is already exist! playerId=",playerId);
      area.removePlayer(playerId);
    }
    
    if (session.uid!==player.userId) {
      logger.error('handler.enterScene uid is error session.uid='+session.uid);
      next(new Error('fail uid is error'), {
        code: 13
      });
      return;
    }

    var playerLevel=session.get('level');
    if (playerLevel!==player.level) {
      session.set('level', player.level);
      session.push('level');
    }

    player.serverId = session.frontendId;
    player.sessionData = {
      uid: player.userId,
      sid: player.serverId
    };

    var teamId = session.get('teamId');
    if (teamId) {
      player.teamId = teamId;
      player.isCaptain = session.get('isCaptain');
    }else{
      player.teamId = consts.TEAM.TEAM_ID_NONE;
    }
    
    player.instanceId = instanceId;
    if (area.areaKind <= AreaKinds.NORMAL_AREA) {
      pomelo.app.rpc.chat.chatRemote.add(session, session.uid,
        player.id, channelUtil.getAreaChannelName(area.areaId), consts.BLACKHOLEFUNC);
      if (player.hp === 0) {
        player.hp = Math.floor(player.maxHp / 2);
      }
    }

    area.enterArea(player);
    if (!area.map.isReachable(player.x, player.y)) {
      utils.myPrint("enterScene map.isReachable  player.x=", player.x, ",player.y=", player.y);
      var pos = area.map.getBornPoint();
      player.x = pos.x;
      player.y = pos.y;
    }
    var entities = area.getAreaInfoStrip(player, player.range);
    if (!area.addEntity(player)) {
      logger.error("Add player to area faild! areaId : " + player.areaId);
      next(new Error('fail to add user into area'), {
        code: 13
      });
      return;
    }
    delete entities["length"];

    utils.myPrint("EnterScene==================<<<< areaId =", area.areaId);

    var msg = {
      code: 200,
      areaId: area.areaId,
      entities: entities,
      curPlayer: player.playerStrip()
    };
    next(null, msg);
    // if (area.areaKind === AreaKinds.DOMAIN_AREA) {
    //   if (area.isAreaState(AreaStates.BATTLE_STATE)) {
    //     msg.code=201;
    //   }
    //   msg.level=
    //   msg.guildId=area.guildId;
    // }
    // next(null, msg);

    // if (teamId > consts.TEAM.TEAM_ID_NONE) {
    //   var playerData = {
    //     playerId: player.id,
    //     teamId: teamId,
    //     areaId: areaId,
    //     // userId: player.userId,
    //     // serverId: player.serverId,
    //     // backendServerId: this.app.getServerId(),
    //     instanceId:instanceId,
    //     needNotifyElse: true
    //   };
    //   utils.myPrint("inteam playerData=",JSON.stringify(playerData));
    //   pomelo.app.rpc.manager.teamRemote.updateMemberInfo(session, playerData, function(err, ret) {
    //     if (ret.result === consts.TEAM.FAILED) {
    //       logger.warn("update team member infor failed ");
    //     }
    //   });
    // }
  });
};

/**
 * Change player's view.
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.changeView = function(msg, session, next) {
  var timer = session.area.timer;
  var player = session.player;
  var width = msg.width;
  var height = msg.height;
  var radius = width > height ? width : height;
  var range = Math.ceil(radius / 600);
  if (range < 0) {
    next(new Error('invalid range'));
    return;
  }
  if (player.range !== range) {
    timer.updateWatcher({
      id: player.entityId,
      type: player.type
    }, player, player, player.range, range);
    player.range = range;
  }
  next();
};

/**
 * Player moves. Player requests move with the given movePath.
 * Handle the request from client, and response result to client
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.move = function(msg, session, next) {
  var area = session.area;
  var player = session.player;
  if (player.died) {
    next();
    return;
  }
  
  var path = msg;
  // player.target = null;
  player.isStop=null;
  var action = new Move({
    entity: player,
    path: path
  });
  var timer = area.timer;
  player.setIsMoving(true);
  var startPoint = path[0];
  if (timer.addAction(action)) {
    if (player.x !== startPoint.x || player.y !== startPoint.y) {
      var updateMsg = {
        id: player.entityId,
        type: EntityType.PLAYER
      };
      timer.updateObject(updateMsg, player, startPoint);
      timer.updateWatcher(updateMsg, player, startPoint, player.range, player.range);
    }
    // console.log("$$$$$$ handler.move===========>onMove");
    messageService.pushMessageByAOI(area, 'onMove', {
      entityId: player.entityId,
      areaId: area.areaId,
      path: path
    }, startPoint);
  } else {
    player.setIsMoving(false);
  }
  next();
  player.kickTime=Date.now()+consts.KICKTIME;
};

handler.clMove=function(msg, session, next){
  var area = session.area;
  var player = session.player;
  if (player.died) {
    next();
    return;
  }

  var path = [{
   x: player.x,
   y: player.y
  }, {
   x: msg[0],
   y: msg[1]
  }];
  
  // var path = msg;
  // player.target = null;
  player.isStop=null;
  var action = new Move({
    entity: player,
    path: path
  });
  var timer = area.timer;
  player.setIsMoving(true);
  // var startPoint = path[0];
  if (timer.addAction(action)) {
    // if (player.x !== startPoint.x || player.y !== startPoint.y) {
    //   var updateMsg = {
    //     id: player.entityId,
    //     type: EntityType.PLAYER
    //   };
    //   timer.updateObject(updateMsg, player, startPoint);
    //   timer.updateWatcher(updateMsg, player, startPoint, player.range, player.range);
    // }
    // console.log("$$$$$$ handler.clMove===========>onMove");
    var ignoreList = {};
    ignoreList[player.userId] = true;
    messageService.pushMessageByAOI(area, 'onClMove', {
      entityId: player.entityId,
      areaId: area.areaId,
      x: msg[0],
      y: msg[1]
    }, player, ignoreList);
  } else {
    player.setIsMoving(false);
  }
  next();
  player.kickTime=Date.now()+consts.KICKTIME;
};

handler.stop = function(msg, session, next) {
  var area = session.area;
  var player = session.player;
  if (player.died) {
    next();
    return;
  }
  // player.target = null;
  var timer = area.timer;
  player.setIsMoving(true);
  timer.abortAction(ActionType.MOVE, player.entityId);

  player.isStop=true;
  player.stand();
  next();
};

handler.fightMode = function(msg, session, next) {
  var player = session.player;
  player.setFightMode(msg.fightMode);
  next(null, {
    fightMode: player.fightMode
  });
};

handler.revive = function(msg, session, next) {
  var player = session.player;
  var revive=msg.revive;
  if (player.died) {
    // area.timer.abortAction(ActionType.REVIVE, player.entityId);
    player.setRevive(msg.revive);
  }
  next();
};

//Change area
handler.changeArea = function(msg, session, next) {
  var playerId = session.get('playerId');
  var targetId = msg.targetId;
  var player = session.player;
  var area=session.area
  utils.myPrint('changeArea origin areaId=', area.areaId, ',target areaId=', targetId);
  if (area.areaId === targetId) {
    next(null, {
      code: 136
    });
    return;
  }
  utils.myPrint('changeArea is running========>> playerId =',playerId);
  areaService.changeArea(msg, session, function(code,instanceId) {
    if (code) {
      if (code == 200) {
        if (area.instanceId) {
          logger.info("bossHandler.inMyBoss   leaveInstance area.instanceId=",area.instanceId);
          pomelo.app.rpc.manager.instanceRemote.leaveInstance(session, {
            playerId: playerId,
            instanceId:instanceId
          }, consts.BLACKHOLEFUNC);

        } else {
          pomelo.app.rpc.chat.chatRemote.leave(session, session.uid, channelUtil.getAreaChannelName(area.areaId), consts.BLACKHOLEFUNC);
        
        }
        next(null, {
          code: 200
        });
      } else {
        next(null, {
          code: code
        });
      }
    } else {
      next(null, {
        code: 201
      });
    }
  });
};

handler.npcTalk = function(msg, session, next) {
  var area = session.area;
  var player = session.player;
  var npc = area.getEntity(msg.targetId);
  if (!npc) {
    // messageService.pushLogTipsToPlayer(player, 9);
    next(null, {
      code: 9
    });
    return;
  }
  var result=npc.talk(player);
  if (NPC.SUCCESS === result) {
    next(null, {
      code: 200
    });
  } else {
    next(null, {
      code: 201
    });
  }
  // next();
};

handler.getEntity= function(msg, session, next) {
  var area = session.area;
  var player = session.player;
  var entity = area.getEntity(msg.entityId);
  if (entity) {
    var entities = {};
    entities[entity.type] = [entity.strip()];
    messageService.pushMessageToPlayer(player.sessionData, 'onAddEntities', entities);
  }
  next();
};

handler.getProperty = function(msg, session, next) {
  var playerId = parseInt(msg.playerId);
  if (playerId) {
    var area = session.area;
    var entity=area.getPlayer(playerId);
    if (entity) {
      var msg = {
        kindId: entity.kindId,
        level: entity.level,
        // maxHp: entity.maxHp,
        playerId: entity.id,
        name: entity.name,
        skinId: entity.skinId,
      };

      if (entity.equipments) {
        msg.equipments = [];
        var equipment,equipments=entity.equipments.equipments;
        for (var key in equipments) {
          equipment = equipments[key];

          msg.equipments.push({
            id: equipment.id,
            position: equipment.position,
            type: equipment.type,
            kindId: equipment.kindId,
            kind: equipment.kind,
            baseValue: equipment.baseValue,
            potential: equipment.potential,
            percent: equipment.percent,
            totalStar: equipment.totalStar
          });
        }
      }
      msg.code = 200;
      next(null, msg);
      return;
    }

    userDao.getSQLPlayer(playerId, function(err, playerData) {
      if (!!err) {
        next(null, {
          code: 32
        });
        return;
      }
      if (!!playerData) {

        var msg = {
          kindId: playerData.kindId,
          level: playerData.level,
          // maxHp: playerData.maxHp,
          // maxMp: playerData.maxMp,
          playerId: playerData.id,
          name: playerData.name,
          skinId: playerData.skinId,
          // experience: playerData.experience,
        };

        equipmentDao.getEquipEquipmentByPlayerId(playerId, function(err, equipmentDatas) {
          if (!err) {
            msg.equipments = [];
            var equipmentData;
            for (var key in equipmentDatas) {
              equipmentData = equipmentDatas[key];
              if (!equipmentData.position) {
                continue;
              }
              msg.equipments.push({
                id: equipmentData.id,
                position: equipmentData.position,
                type: equipmentData.type,
                kindId: equipmentData.kindId,
                kind: equipmentData.kind,
                baseValue: equipmentData.baseValue,
                potential: equipmentData.potential,
                percent: equipmentData.percent,
                totalStar: equipmentData.totalStar
              });
            }
            msg.code = 200;
            next(null, msg);
          } else {
            next(null, {
              code: 50
            });
          }
        });
      } else {
        next(null, {
          code: 33
        });
      }
    });
  } else {

  }
};

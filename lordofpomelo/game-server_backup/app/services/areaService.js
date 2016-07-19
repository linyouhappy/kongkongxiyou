var dataApi = require('../util/dataApi');
var utils = require('../util/utils');
var pomelo = require('pomelo');
var userDao = require('../dao/userDao');
var taskDao = require('../dao/taskDao');
var Map = require('../domain/map/map');
var consts = require('../consts/consts');
var AreaType = consts.AreaType;
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../domain/messageService');
var AreaKinds=consts.AreaKinds;

var exp = module.exports;
var maps = {};
exp.init = function() {
  var areas = dataApi.area.all();
  //Init areas
  var area;
  for (var key in areas) {
    area = areas[key];
    //area.weightMap = false;
    maps[area.id] = new Map(area);
  }
};

exp.getMap = function(areaId) {
  return maps[areaId];
};

/**
 * Proxy for map, get born point for given map
 * @api public
 */
exp.getBornPoint = function(sceneId) {
    // utils.myPrint("exp.getBornPoint  sceneId= "+sceneId);
  return maps[sceneId].getBornPoint();
};

exp.getInitPoint=function(targetId,curAreaId,transportId){
  var map=maps[targetId];
  if (!transportId) {
    return map.getBornPoint();
  }

  var transport, transports = map.map.transport;
  for (var key in transports) {
    transport = transports[key];
    //reverse
    if (transport.targetArea === curAreaId) {
      return {
        x: transport.x+60,
        y: transport.y-30
      };
    }
  }
  console.log("curAreaId="+curAreaId);
  console.log("getInitPoint transports="+JSON.stringify(transports));
  return map.getBornPoint();
};

exp.gotoScene = function(args, session, targetInfo, cb) {
  if(targetInfo.kind>AreaKinds.NORMAL_AREA){
    utils.invokeCallback(cb, 112);
    logger.error('change area failed! no instance area');
    return;
  }

  var area = session.area;
  var player = session.player;
  var targetId = args.targetId;

  var transportId = args.argId;
  var pos = this.getInitPoint(targetId, area.areaId, transportId);
  player.areaId = targetId;

  var currentX=player.x;
  var currentY=player.y;
  player.x = pos.x;
  player.y = pos.y;

  userDao.updatePlayer(player, function(err, success) {
    if (err || !success) {
      err = err || 'update player failed!';
      logger.error('changeArea error! args : %j, err : %j', args, err);
      utils.invokeCallback(cb, 28);
      return;
    } else {
      session.set('areaId', targetId);
      session.set('serverId', pomelo.app.get('areaIdMap')[targetId]);
      session.set('instanceId', 0);
      session.pushAll(function(err) {
        if (err) {
          logger.error('Change area for session service failed! error is : %j', err.stack);
        }
        player.x = currentX;
        player.y = currentY;
        // delete player["area"];
        utils.myPrint("exp.changeArea normal===============>>>");

        area.exitArea(player);
        utils.invokeCallback(cb, 200);
      });
    }
  });
};

exp.gotoFightInstance = function(args, session,targetInfo,cb) {
};


exp.gotoInstance = function(args, session, targetInfo, cb) {
  var areaKind=targetInfo.kind;
  var instanceId = args.argId;
  var playerId = session.get('playerId');
  var targetId = args.targetId;

  if(areaKind<=AreaKinds.NORMAL_AREA){
    utils.invokeCallback(cb, 112);
    logger.error('change area failed! no instance area');
    return;
  }else if (areaKind===AreaKinds.FIGHT_AREA) {
    instanceId="fight_"+instanceId;
  }else if (areaKind===AreaKinds.MY_BOSS_AREA) {
    if (!args.isMyBoss) {
      utils.invokeCallback(cb, 112);
      logger.error('change area failed! unkown api');
      return;
    }
    instanceId="my_"+playerId+targetId%10;
  }else{
    instanceId="sin_"+playerId;
  }
  var area = session.area;
  var player = session.player;

  console.log("gotoInstance targetId="+targetId+",instanceId=",instanceId);
  var self = this;
  async.series([
      function(cb) {
        userDao.updatePlayer(player, function(err, success) {
          if (err || !success) {
            err = err || 'update player failed!';
            cb(err, 'update');
          } else {
            cb(null);
          }
        });
      },
      function(callback) {
        var params = {
          id: instanceId,
          areaId: targetId,
          playerId: playerId
        };
        pomelo.app.rpc.manager.instanceRemote.create(session, params, function(err, result) {
          if (err) {
            logger.error('exp.gotoInstance get Instance error!');
            callback(err);
          } else {
            instanceId=result.instanceId;
            session.set('instanceId', instanceId);
            session.set('serverId', result.serverId);
            session.pushAll();
            // player.instanceId = result.instanceId;
            utils.myPrint('exp.gotoInstance instanceRemote.create result=', JSON.stringify(result))
            callback(null);
          }
        });
      }
    ],
    function(err, result) {
      if (!!err) {
        logger.error('change area failed! args: %j err:%j', args, err);
        utils.invokeCallback(cb, 112);
      } else {
        utils.myPrint("gotoInstance =================>>instanceId="+instanceId);
        area.exitArea(player);
        utils.invokeCallback(cb, 200,instanceId);
      }
    }
  );
};

exp.gotoTeamInstance = function(args, session, targetInfo, cb) {
  var app = pomelo.app;
  var area = session.area;
  //var uid = session.uid;
  var player = session.player;
  var playerId = session.get('playerId');

  //var transportId = args.transportId;
  var targetId = args.targetId;

  if (player.teamId === consts.TEAM.TEAM_ID_NONE) {
    utils.myPrint("exp.changeArea no in team,teamId = ", player.teamId);
    utils.invokeCallback(cb, 29);
    return;
  }
  var self = this;
  async.series([
      function(cb) {
        if (!player.isCaptain) {
          utils.myPrint("changeArea teamInstance teammate====>>");
          var params = {
            id: "team_" + player.teamId,
            areaId: targetId
          };
          app.rpc.manager.instanceRemote.getInstance(session, params, function(err, result) {
            if (err) {
              logger.error('get Instance error!');
              cb(err, 'getInstance');
            } else {
              if (result.instanceId) {
                cb(null);
              } else {
                messageService.pushLogTipsToPlayer(player, 31);
                var err = "You are not the captain!";
                utils.myPrint("captain have no open the instance");
                cb(err);
              }
            }
          });
        } else {
          utils.myPrint("captain open the instance");
          cb(null);
        }
      },
      function(callback) {
        var params = {
          // id: playerId,
          areaId: targetId,
          playerId: playerId
        };
        params.id = "team_" + player.teamId;
        utils.myPrint('changeArea create instanceId=', params.id, 'playerId = ', player.id, 'teamId=', player.teamId);
        //Get target instance
        app.rpc.manager.instanceRemote.create(session, params, function(err, result) {
          if (err) {
            logger.error('get Instance error!');
            callback(err, 'getInstance');
          } else {
            session.set('instanceId', result.instanceId);
            session.set('serverId', result.serverId);
            session.set('teamId', player.teamId);
            session.set('isCaptain', player.isCaptain);
            session.pushAll();
            player.instanceId = result.instanceId;

            utils.myPrint('changeArea instanceRemote.create result=', JSON.stringify(result))
            if (player.isCaptain) {
              utils.myPrint('DragMember2gameCopy is running ...');
              app.rpc.manager.teamRemote.dragMember2gameCopy(session, {
                  teamId: player.teamId,
                  target: targetId
                },
                function(err, ret) {
                  if (!!err) {
                    logger.error(err, ret);
                  }
                });
            }
            callback(null);
          }
        });
      },
      function(cb) {
        var pos = self.getBornPoint(targetId);
        player.x = pos.x;
        player.y = pos.y;

        utils.myPrint("area.removePlayer  userDao.updatePlayer");
        userDao.updatePlayer(player, function(err, success) {
          if (err || !success) {
            err = err || 'update player failed!';
            cb(err, 'update');
          } else {
            cb(null);
          }
        });
      }
    ],
    function(err, result) {
      if (!!err) {
        utils.invokeCallback(cb, 201);
        logger.warn('change area failed! args: %j err:%j', args, err);
      } else {
        utils.myPrint("exp.changeArea ====>> success");

        area.exitArea(player);
        utils.invokeCallback(cb, 200);
      }
    }
  );
};

/**
 * Change area, will transfer a player from one area to another
 * @param args {Object} The args for transfer area, the content is {playerId, areaId, target, frontendId}
 * @param cb {funciton} Call back funciton
 * @api public
 */
exp.changeArea = function(args, session, cb) {
  var targetId = args.targetId;
  var targetInfo = dataApi.area.findById(targetId);
  if (!targetInfo) {
    utils.invokeCallback(cb, 111);
    return;
  }
  utils.myPrint("areaService.changeArea  targetInfo= ", JSON.stringify(targetInfo));
  var areaType = targetInfo.type;
  if (areaType <= AreaType.SCENE) {
    this.gotoScene(args, session, targetInfo, cb);
  } else if (areaType === AreaType.TEAM_INSTANCE) {
    this.gotoTeamInstance(args, session, targetInfo, cb);
  // } else if (areaType === AreaType.FIGHT_INSTANCE) {
    // this.gotoFightInstance(args, session, targetInfo, cb);
  } else {
    this.gotoInstance(args, session, targetInfo, cb);
  }
};
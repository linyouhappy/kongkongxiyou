var Instance = require('./instance');
var Scene = require('./scene');
var dataApi = require('../../util/dataApi');
var pomelo = require('pomelo');
var userDao = require('../../dao/userDao');
var utils = require('../../util/utils');
var areaService = require('../../services/areaService');
var consts = require('../../consts/consts');

var AreaKinds=consts.AreaKinds;
var AreaType=consts.AreaType;

var logger = require('pomelo-logger').getLogger(__filename);

var AreaManager = function(){
  this.isBigAreaServer=true;

  this.scenes={};
  this.players={};
  this.playerIds=[];

  this.playerCaches={};
  this.playerIdCaches=[];

  this.instances = {};
  this.playerIdToInstanceId = {};

  this.requestList={};
};

module.exports=AreaManager;

AreaManager.prototype.initScenes = function(areaIds) {
  for (var key in areaIds) {
    var areaId=areaIds[key];
    var areaData=dataApi.area.findById(areaId);
    if (areaData) {
      var scene=new Scene(areaData);
      this.scenes[areaId]=scene;
    }else{
      logger.error("AreaManager.initScenes areaData==null areaId="+areaId);
    }
  }
};

AreaManager.prototype.getBossGenTimes=function(){
  var bossGenTimes={};
  for (var areaId = 6001; areaId <=6005; areaId++) {
    var scene=this.scenes[areaId];
    if (scene) {
      bossGenTimes[areaId]=scene.getPlayerInArea().getBossGenTime();
    }
  }
  return bossGenTimes;
};

AreaManager.prototype.setInstancePool = function(instancePool) {
  this.instancePool=instancePool;
};

AreaManager.prototype.getInstanceArea = function(instanceId) {
  return this.instancePool.getPlayerInArea(instanceId);
};

AreaManager.prototype.getPlayerInArea=function(instanceId,playerId){
  var player=this.getCanUsedPlayer(playerId);
  if (player) {
    if (player.instanceId) {
      return this.instancePool.getPlayerInArea(player.instanceId);
    }else{
      var scene=this.scenes[player.areaId];
      if (scene) {
        return scene.getPlayerInArea();
      }
    }
  }
};

AreaManager.prototype.getAreaWithPlayer=function(player){
  if (this.scenes[player.areaId]) {
    return this.scenes[player.areaId].getPlayerInArea();
  }
  if (player.instanceId) {
    return this.instancePool.getPlayerInArea(player.instanceId);
  }
  logger.error("ERROR:AreaManager.getAreaWithPlayer areaId=",player.areaId,"instanceId=",player.instanceId);
  player.areaId=1001;
  if (this.scenes[player.areaId]) {
    return this.scenes[player.areaId].getPlayerInArea();
  }
};

AreaManager.prototype.getPlayerWithPlayerIdCb=function(playerId,cb) {
  if (this.requestList[playerId]) {
    logger.error('getPlayerInfo getting,need waiting!');
    utils.invokeCallback(cb,'waiting');
    return;
  }
  var player=this.getCanUsedPlayer(playerId);
  if (player) {
    utils.invokeCallback(cb,null, player);
    return;
  }
  var self=this;
  utils.myPrint("111AreaManager.getAreaWithCb==================>>>>>");
  this.requestList[playerId]=playerId;
  userDao.getPlayerAllInfo(playerId, function(err, player) {
    delete self.requestList[playerId];
    utils.myPrint("222AreaManager.getAreaWithCb==================>>>>>");
    if (err || !player) {
      logger.error('Get user for userDao failed! ' + err.stack);
      utils.invokeCallback(cb, new Error('fail to get user from dao'));
      return;
    }
    self.addPlayer(player);
    utils.invokeCallback(cb,null, player);
  });
};

AreaManager.prototype.getCanUsedPlayer = function(playerId) {
  if (this.players[playerId]) {
    return this.players[playerId];
  }
  if (this.playerCaches[playerId]) {
    var player=this.playerCaches[playerId];
    this.addPlayer(player);
    delete this.playerCaches[playerId];
    return player;
  }
};

AreaManager.prototype.addPlayer = function(player) {
  var playerId=player.id;
  if (this.players[playerId]) {
    logger.error("AreaManager.addPlayer player is exist! playerId="+playerId);
  }
  this.players[playerId]=player;
  player.recycleTime=Date.now();
  this.playerIds.push(playerId);
};

AreaManager.prototype.removePlayer = function(playerId) {
  var player=this.players[playerId];
  if (player) {
    delete this.players[playerId];
  }
};

AreaManager.prototype.addPlayerCaches = function(player) {
  var playerId=player.id;
  this.removePlayer(playerId);
  if (this.playerCaches[playerId]) {
    logger.error("AreaManager.addPlayerCaches player is exist! playerId="+playerId);
  }
  player.recycleTime=Date.now()+60000;
  this.playerCaches[playerId]=player;
  this.playerIdCaches.push(playerId);

  this.clearPlayerCaches();
};

AreaManager.prototype.clearPlayerCaches = function() {
  var playerIdCaches=this.playerIdCaches;
  while (playerIdCaches.length > 0) {
    var playerId = playerIdCaches.shift();
    var player=this.playerCaches[playerId];

    delete this.playerCaches[playerId];
    if (player) {
      for(var key in player){
        delete player[key];
      }
    }
  }
};

AreaManager.prototype.createInstance = function(instanceId, areaId, playerId) {
  var instance = this.instances[instanceId];
  this.instancePool.create(areaId,instanceId);
  if (!instance) {
    instance = {
      instanceId: instanceId,
      playerIds: {}
    };
    this.instances[instanceId] = instance;
  }
  this.playerIdToInstanceId[playerId] = instanceId;
  instance.playerIds[playerId] = playerId;
};

AreaManager.prototype.removeInstance = function(instanceId) {
  var instance = this.instances[instanceId];
  if (instance) {
    for (var key in instance.playerIds) {
      delete this.playerIdToInstanceId[key];
    };
    delete this.instances[instanceId];
  }
};

AreaManager.prototype.gotoScene = function(args) {
  var targetInfo=args.targetInfo;
  //if(targetInfo.kind>AreaKinds.NORMAL_AREA){
  //  logger.error('change area failed! no instance area');
  //  return 112;
  //}
  var area = args.area;
  var player = args.player;
  var targetId = args.targetId;

  area.exitArea(player);

  var transportId = args.argId;
  var pos = areaService.getInitPoint(targetId, area.areaId, transportId);
  player.areaId = targetId;
  player.instanceId=0;
  player.x = pos.x;
  player.y = pos.y;
  player.save();
  return 200;
};

AreaManager.prototype.gotoInstance = function(args) {
  var targetInfo=args.targetInfo;
  var areaKind=targetInfo.kind;
  var argId = args.argId;
  var area = args.area;
  var player = args.player;
  var targetId = args.targetId;
  var playerId=args.playerId;

  if(areaKind<=AreaKinds.NORMAL_AREA){
    logger.error('change area failed! no instance area');
    return 112;
  }else if (areaKind===AreaKinds.FIGHT_AREA) {
    argId="fight_"+argId;
  }else if (areaKind===AreaKinds.MY_BOSS_AREA) {
    if (!args.isMyBoss) {
      logger.error('change area failed! unkown api');
      return 112;
    }
    argId="my_"+playerId+targetId%10;
  }else if (areaKind===AreaKinds.WORLD_BOSS_AREA) {
    argId="boss";
  }else{
    argId="sin_"+playerId;
  }
  var instanceId = targetId + '_' + argId;
  console.log("gotoInstance targetId="+targetId+",instanceId=",instanceId);
  area.exitArea(player);

  this.createInstance(instanceId, targetId, playerId);

  player.areaId = targetId;
  player.instanceId=instanceId;
  return 200;
};

AreaManager.prototype.changeArea = function(args) {
  var targetInfo = dataApi.area.findById(args.targetId);
  if (!targetInfo) {
    return 111;
  }
  utils.myPrint("AreaManager.changeArea  targetInfo= ", JSON.stringify(targetInfo));
  var areaType = targetInfo.type;
  args.targetInfo=targetInfo;
  if (areaType <= AreaType.SCENE) {
    return this.gotoScene(args);
  } else if (areaType === AreaType.TEAM_INSTANCE) {
    return this.gotoTeamInstance(args);
  // } else if (areaType === AreaType.FIGHT_INSTANCE) {
    // this.gotoFightInstance(args, session, targetInfo, cb);
  } else {
    return this.gotoInstance(args);
  }
};

AreaManager.prototype.removePlayerByUid=function(playerId){
  var player=this.getCanUsedPlayer(playerId);
  if (!player) return;
  if (this.scenes[player.areaId]) {
    this.scenes[player.areaId].removePlayerByUid(playerId);
    return;
  }
  if (player.instanceId) {
    return this.instancePool.removePlayerByUid(playerId);
  }
};

// AreaManager.prototype.printInfo=function(){
//   utils.myPrint("AreaManager.printInfo========>>");
//   var tostring="";
//   for (var key in this.scenes) {
//     tostring=tostring+this.scenes.toString();
//   }
//   utils.myPrint(tostring);
//   utils.myPrint("AreaManager.printInfo instancePool========>>");
//   utils.myPrint(this.instancePool.toString());
// };


// this.scenes={};
// this.players={};
// this.playerCaches={};
// this.instances = {};

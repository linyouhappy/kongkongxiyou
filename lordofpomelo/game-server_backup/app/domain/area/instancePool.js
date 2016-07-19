var Instance = require('./instance');
var dataApi = require('../../util/dataApi');
var Map = require('../map/map');
var pomelo = require('pomelo');
var areaService = require('../../services/areaService');


var logger = require('pomelo-logger').getLogger(__filename);
var exp = module.exports;

var instances;
var intervel;
// var maps = {};

exp.init = function(opts){
  instances = {};
  intervel = opts.intervel||60000;

  setInterval(check, intervel);
};

exp.create = function(params){
  var instanceId = params.instanceId;
  var areaId = params.areaId;

  if(instances[instanceId]) {
    logger.info("instancePool.create instance is exist instanceId=",instanceId);
    return 201;
  } 
  logger.info("instancePool.create instance create instanceId=",instanceId);

  var map=areaService.getMap(areaId);
  if(!map){
    var opts = dataApi.area.findById(areaId);
    map = new Map(opts);
  }
  var instance = new Instance(map,instanceId);
  instances[instanceId] = instance;

  instance.start();
  return 200;
};

exp.remove = function(params){
  var instanceId = params.id;
  if(!instances[instanceId]) return false;

  var instance = instances[instanceId];
  instance.close();
  delete instances[instanceId];

  return true;
};

exp.removePlayerByUid=function(uid){
  logger.info("instancePool.removePlayerByUid uid="+uid);
  for (var key in instances) {
    instances[key].removePlayerByUid(uid);
  }
};

exp.removeInstance = function(instanceId){
  logger.info("instancePool.removePlayerByUid instanceId="+instanceId);
  exp.remove({
    id: instanceId
  });
  pomelo.app.rpc.manager.instanceRemote.remove(null, instanceId,function(err){});
};

exp.getArea = function(instanceId){
  var instance=instances[instanceId];
  if (!instance) {
    return null;
  }
  return instance.area;
};

function check(){
  var app = pomelo.app;
  for(var instanceId in instances){
    var instance = instances[instanceId];

    if(!instance.isAlive()){
      app.rpc.manager.instanceRemote.remove(null, instanceId, onClose);
    }
  }
}

function onClose(err, instanceId){
  if(!err){
    instances[instanceId].close();
    delete instances[instanceId];
    logger.info('remove instance : %j', instanceId);
  }else{
    logger.warn('remove instance error! instanceId : %j, err : %j', instanceId, err);
  }
}


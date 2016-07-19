var Instance = require('./instance');
var dataApi = require('../../util/dataApi');
var Map = require('../map/map');
var pomelo = require('pomelo');
var areaService = require('../../services/areaService');
var logger = require('pomelo-logger').getLogger(__filename);

var exp = module.exports;


var InstancePool = function(){
  this.instances={};
};

module.exports=InstancePool;

InstancePool.prototype.init = function() {
  this.instances = {};
  this.intervalId = setInterval(this.check.bind(this), 60000);
};

InstancePool.prototype.check = function() {
  var app = pomelo.app;
  var instance,instances=this.instances;
  for(var instanceId in instances){
    instance = instances[instanceId];
    if(!instance.isAlive()){
      app.rpc.manager.instanceRemote.remove(null, instanceId, this.onClose.bind(this));
    }
  }
}

InstancePool.prototype.onClose= function(err, instanceId){
  if(!err){
    var instance=this.instances[instanceId];
    if (instance) {
      instance.close();
      delete this.instances[instanceId];
    }else{
      logger.warn('instance is not exist! instanceId : %j', instanceId);
    }
    logger.info('remove instance : %j', instanceId);
  }else{
    logger.warn('remove instance error! instanceId : %j, err : %j', instanceId, err);
  }
}

InstancePool.prototype.create = function(areaId,instanceId){
  if(this.instances[instanceId]) {
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
  this.instances[instanceId] = instance;
  instance.start();
  return 200;
};

InstancePool.prototype.remove = function(params) {
  var instanceId = params.id;
  if (!this.instances[instanceId]) {
    return false;
  }
  var instance = this.instances[instanceId];
  instance.close();
  delete this.instances[instanceId];
  return true;
};

InstancePool.prototype.removePlayerByUid=function(uid){
  logger.info("instancePool.removePlayerByUid uid="+uid);
  var instances=this.instances;
  for (var key in instances) {
    instances[key].removePlayerByUid(uid);
  }
};

InstancePool.prototype.removeInstance = function(instanceId) {
  logger.info("instancePool.removePlayerByUid instanceId=" + instanceId);
  this.remove({
    id: instanceId
  });
  // pomelo.app.rpc.manager.instanceRemote.remove(null, instanceId, function(err) {});
};

InstancePool.prototype.getPlayerInArea = function(instanceId){
  var instance=this.instances[instanceId];
  if (instance) {
    return instance.area;
  }
};

// InstancePool.prototype.toString = function() {
//   var instance, instances = this.instances;
//   var tostring="InstancePool==========>>";
//   for (var instanceId in instances) {
//     instance=instances[instanceId];
//     tostring=tostring+instance.toString();
//   }
//   tostring=tostring+"InstancePool==========<<";
//   return tostring;
// };



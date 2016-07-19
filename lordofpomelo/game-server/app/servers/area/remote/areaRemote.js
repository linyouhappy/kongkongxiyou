var utils = require('../../../util/utils');
var instancePool = require('../../../domain/area/instancePool');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo=require('pomelo');

var exp = module.exports;

exp.create = function(params, cb){
  var start = Date.now();
  var code = instancePool.create(params);
  var end = Date.now();
  logger.info('create instance use time : %j', end - start);

  utils.invokeCallback(cb, null, code);
};

exp.close = function(params, cb){
  var id = params.id;
  var result = instancePool.close(id);

  utils.invokeCallback(cb, null, result);
};

exp.getArea = function(params, cb){
  var instanceId = params.instanceId;
  var area = instancePool.getArea(instanceId);
  if (!area) {
  	utils.invokeCallback(cb, null, {areaId:0});
  	return;
  }
  utils.invokeCallback(cb, null, {areaId:area.areaId});
};

exp.startBattle=function(params, cb){
  // var instanceId = params.instanceId;
  var area = pomelo.app.areaManager.getArea();
  logger.info("domainBattle==========>> area.areaId="+area.areaId);
  if (!area || area.instanceId) {
    utils.invokeCallback(cb, null, {areaId:0});
    return;
  }else{
    area.startBattle();
  }
  utils.invokeCallback(cb, null, {areaId:area.areaId});
};




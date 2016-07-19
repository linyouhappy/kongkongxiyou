var utils = require('../../../util/utils');
var instanceManager = require('../../../services/instanceManager');
var exp = module.exports;

var logger = require('pomelo-logger').getLogger(__filename);

exp.create = function(params, cb) {
  utils.myPrint('instanceRemote.create params=', JSON.stringify(params));

  instanceManager.createInstance(params, function(err, result) {
    if (err) {
      logger.error('create instance error! args : %j, err : %j', params, err);
      utils.invokeCallback(cb, err);
    } else {
      utils.invokeCallback(cb, null, result);
    }
  });
};

exp.remove = function(id, cb) {
  utils.myPrint('instanceRemote.remove id=', JSON.stringify(id));

  instanceManager.remove(id);
  utils.invokeCallback(cb, null, id);
};

exp.getInstance = function(params, cb) {
  utils.myPrint('instanceRemote.getInstance params=', JSON.stringify(params));

  instanceManager.getInstance(params, function(err, result) {
    if (err) {
      logger.error('create instance error! args : %j, err : %j', params, err);
      utils.invokeCallback(cb, err);
    } else {
      utils.invokeCallback(cb, null, result);
    }
  });
};

exp.isInInstance = function(params, cb) {
  utils.myPrint('instanceRemote.isInInstance params=', JSON.stringify(params));

  var playerId=params.playerId;
  instanceManager.isInInstance(playerId, function(err, result) {
    if (err) {
      logger.error('isInInstance error! args : %j, err : %j', playerId, err);
      utils.invokeCallback(cb, err);
    } else {
      utils.invokeCallback(cb, null, result);
    }
  });
}

exp.leaveInstance = function(params, cb) {
  utils.myPrint('instanceRemote.leaveInstance params=', JSON.stringify(params));
  
  var playerId=params.playerId;
  var targetInstanceId=params.instanceId;
  instanceManager.leaveInstance(playerId, targetInstanceId,function(err, result) {
    if (err) {
      logger.error('leaveInstance error! args : %j, err : %j', playerId, err);
      utils.invokeCallback(cb, err);
    } else {
      utils.invokeCallback(cb, null, result);
    }
  });
}

// exp.getAllNormalArea = function(args, cb){
//   return instanceManager.getAllNormalArea();
// };
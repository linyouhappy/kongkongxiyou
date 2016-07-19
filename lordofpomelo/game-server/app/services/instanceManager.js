var pomelo = require('pomelo');
var utils = require('../util/utils');
var dataApi = require('../util/dataApi');
var consts = require('../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
//var INSTANCE_SERVER = 'area';

var instanceServers = [];
var exp = module.exports;

exp.addServers = function(servers) {
  for (var i = 0; i < servers.length; i++) {
    var server = servers[i];
    if (server.serverType === 'area' && server.instance) {
      for (var j = 0; j < instanceServers.length; j++) {
        var instanceServer = instanceServers[j];
        if (instanceServer.id === server.id) {
          instanceServers.splice(j, 1);
          j--;
        }
      }
      instanceServers.push(server);
    }
  }
};

exp.removeServers = function(servers) {
  for (var i = 0; i < servers.length; i++) {
    var serverId = servers[i];
    for (var key in instanceServers) {
      if (instanceServers[key].id === serverId) {
        exp.removeServer(serverId);
        return;
      }
    };
  }
  logger.info('remove servers : %j', servers);
};

exp.removeServer = function(id) {
  for (var i = 0; i < instanceServers.length; i++) {
    if (instanceServers[i].id === id) {
      instanceServers.splice(i, 1);
      i--;

      var instance;
      for (var key in instances) {
        instance = instances[key];
        if (instance.serverId === id) {
          this.remove(instance.instanceId);
        }
      };
    }
  }
};

var instances = {};
var playerId2Instance = {};
// instance = {
//       instanceId: instanceId,
//       serverId: serverId,
//       playerIds: {}
//     };

exp.isInInstance = function(playerId, cb) {
  var instanceId = playerId2Instance[playerId];
  if (!instanceId) {
    utils.myPrint('can not find instanceId,playerId=',playerId);
    utils.invokeCallback(cb, null, {
      instanceId: 0
    });
    return;
  }
  var instance = instances[instanceId];
  if (!instance) {
    utils.myPrint('instance is lost,instanceId=',instanceId);
    delete playerId2Instance[playerId];
    utils.invokeCallback(cb, null, {
      instanceId: 0
    });
    return;
  }

  var params = {
    namespace: 'user',
    service: 'areaRemote',
    method: 'getArea',
    args: [{
      instanceId: instanceId
    }]
  };

  pomelo.app.rpcInvoke(instance.serverId, params, function(err, result) {
    if (!!err) {
      // delete playerId2Instance[playerId];
      // delete instances[instanceId];
      exp.remove(instanceId);
      logger.error('isInInstance getArea occur error!');
      utils.invokeCallback(cb, err);
      return;
    }
    if (result.areaId > 0) {
        utils.myPrint('find instance area,areaId=',result.areaId);

      utils.invokeCallback(cb, null, {
        instanceId: instanceId,
        serverId: instance.serverId
      });
    } else {
      //remove no exist instance!
      utils.myPrint('instance is close,instanceId=',instanceId);
      exp.remove(instanceId);
      utils.invokeCallback(cb, null, {
        instanceId: 0
      });
    }
  });
};

exp.leaveInstance = function(playerId,targetInstanceId, cb) {
  logger.info("instanceManager.leaveInstance  playerId=",playerId,",targetInstanceId=",targetInstanceId);
  var instanceId = playerId2Instance[playerId];
  if (!instanceId) {
    utils.invokeCallback(cb, null, {
      code: 200
    });
    return;
  }
  if (targetInstanceId===instanceId) {
    logger.info("do not leave targetInstance======>>");
    utils.invokeCallback(cb, null, {
      code: 200
    });
    return;
  }
  var instance = instances[instanceId];
  if (!instance) {
    delete playerId2Instance[playerId];
    utils.invokeCallback(cb, null, {
      code: 200
    });
    return;
  }

  delete instance.playerIds[playerId]
  var params = {
    namespace: 'user',
    service: 'playerRemote',
    method: 'leaveInstance',
    args: [{
      playerId:playerId,
      instanceId: instanceId
    }]
  };
  pomelo.app.rpcInvoke(instance.serverId, params, function(err, result) {});
  utils.invokeCallback(cb, null, {
    code: 200
  });

  for (var key in instance.playerIds) {
    return;
  }
  exp.remove(instanceId);
  logger.info("instance is empty,need remove instanceId=",instanceId);
};

exp.getInstance = function(args, cb) {
  var instanceId = args.areaId + '_' + args.id;
  var instance = instances[instanceId];
  if (instance) {
    utils.invokeCallback(cb, null, {
      instanceId: instance.instanceId,
      serverId: instance.serverId
    });
    return;
  }

  utils.invokeCallback(cb, null, {
    instanceId: 0
  });
};

exp.createInstance = function(args, cb) {
  logger.info("instanceManager.createInstance args=",JSON.stringify(args));
  //The key of instance
  var instanceId = args.areaId + '_' + args.id;
  var playerId = args.playerId;
  //If the instance exist, return the instance
  var instance = instances[instanceId];
  var serverId;
  if (instance) {
    serverId=instance.serverId;
  }else{
    serverId = getServerId();
  }
  if (!serverId) {
    logger.error('no server can be used!');
    utils.invokeCallback(cb, new Error('no server can be used!'));
  }
  if (playerId2Instance[playerId] && playerId2Instance[playerId] !== instanceId) {
    logger.info("1find player in another instance playerId=", playerId, "instanceId=", instanceId);
    exp.leaveInstance(playerId,instanceId);
    logger.info("2find player in another instance playerId=", playerId, "instanceId=", instanceId);
  }
  //rpc invoke
  var params = {
    namespace: 'user',
    service: 'areaRemote',
    method: 'create',
    args: [{
      areaId: args.areaId,
      instanceId: instanceId
    }]
  };
  pomelo.app.rpcInvoke(serverId, params, function(err, code) {
    if (!!err) {
      logger.error('create instance error!');
      utils.invokeCallback(cb, err);
      return;
    }
    if (code === 200 || code === 201) {
      logger.info("instanceManager.createInstance instanceId=",instanceId,"code=",code);
      if (!instance) {
        instance = {
          instanceId: instanceId,
          serverId: serverId,
          playerIds: {}
        };
        instances[instanceId] = instance;
      }
      
      playerId2Instance[playerId] = instanceId;
      instance.playerIds[playerId] = playerId;

      utils.invokeCallback(cb, null, {
        instanceId: instanceId,
        serverId: serverId
      });
    } else {
      logger.error('create instance error! code=' + code);
      utils.invokeCallback(cb, "'create instance error");
    }
  });
};

exp.remove = function(instanceId) {
  var instance = instances[instanceId];
  if (instance) {
    for (var key in instance.playerIds) {
      delete playerId2Instance[key];
    };
    delete instances[instanceId];
  }
};

//Get the server to create the instance
var count = 0;
function getServerId() {
  if (count >= instanceServers.length) 
    count = 0;

  var server = instanceServers[count];
  if (!server) {
    return;
  }
  count++;
  return server.id;
}

// function filter(req){
//   var playerId = req.playerId;

//   return true;
// }
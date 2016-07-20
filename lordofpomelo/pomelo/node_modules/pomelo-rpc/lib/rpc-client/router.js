var crc = require('crc');
var utils = require('../util/utils');
var ConsistentHash = require('../util/consistentHash');

/**
 * Calculate route info and return an appropriate server id.
 *
 * @param session {Object} session object for current rpc request
 * @param msg {Object} rpc message. {serverType, service, method, args, opts}
 * @param context {Object} context of client
 * @param cb(err, serverId)
 */
var defRoute = function(session, msg, context, cb) {
  var list = context.getServersByType(msg.serverType);
  if (!list || !list.length) {
    cb(new Error('can not find server info for type:' + msg.serverType));
    return;
  }
  var uid = session ? (session.uid || '') : '';
  var index = Math.abs(crc.crc32(uid.toString())) % list.length;
  utils.invokeCallback(cb, null, list[index].id);
};

/**
 * Random algorithm for calculating server id.
 *
 * @param client {Object} rpc client.
 * @param serverType {String} rpc target serverType.
 * @param msg {Object} rpc message.
 * @param cb {Function} cb(err, serverId).
 */
var rdRoute = function(client, serverType, msg, cb) {
  var servers = client._station.serversMap[serverType];
  if(!servers || !servers.length) {
    utils.invokeCallback(cb, new Error('rpc servers not exist with serverType: ' + serverType));
    return;
  }
  var index = Math.floor(Math.random() * servers.length);
  utils.invokeCallback(cb, null, servers[index]);
};

/**
 * Round-Robin algorithm for calculating server id.
 *
 * @param client {Object} rpc client.
 * @param serverType {String} rpc target serverType.
 * @param msg {Object} rpc message.
 * @param cb {Function} cb(err, serverId).
 */
var rrRoute = function(client, serverType, msg, cb) {
  var servers = client._station.serversMap[serverType];
  if(!servers || !servers.length) {
    utils.invokeCallback(cb, new Error('rpc servers not exist with serverType: ' + serverType));
    return;
  }
  var index;
  if(!client.rrParam) {
    client.rrParam = {};
  }
  if(!!client.rrParam[serverType]) {
    index = client.rrParam[serverType];
  } else {
    index = 0;
  }
  utils.invokeCallback(cb, null, servers[index % servers.length]);
  if(index++ === Number.MAX_VALUE) {
    index = 0;
  }
  client.rrParam[serverType] = index;
};

/**
 * Weight-Round-Robin algorithm for calculating server id.
 *
 * @param client {Object} rpc client.
 * @param serverType {String} rpc target serverType.
 * @param msg {Object} rpc message.
 * @param cb {Function} cb(err, serverId).
 */
var wrrRoute = function(client, serverType, msg, cb) {
  var servers = client._station.serversMap[serverType];
  if(!servers || !servers.length) {
    utils.invokeCallback(cb, new Error('rpc servers not exist with serverType: ' + serverType));
    return;
  }
  var index, weight;
  if(!client.wrrParam) {
    client.wrrParam = {};
  }
  if(!!client.wrrParam[serverType]) {
    index = client.wrrParam[serverType].index;
    weight = client.wrrParam[serverType].weight;
  } else {
    index = -1;
    weight = 0;
  }
  var getMaxWeight = function() {
    var maxWeight = -1;
    for(var i=0; i<servers.length; i++) {
      var server = client._station.servers[servers[i]];
      if(!!server.weight && server.weight > maxWeight) {
        maxWeight = server.weight;
      }
    }
    return maxWeight;
  };
  while(true) {
    index = (index + 1) % servers.length;
    if(index === 0) {
      weight = weight - 1;
      if(weight <= 0) {
        weight = getMaxWeight();
        if(weight <= 0) {
          utils.invokeCallback(cb, new Error('rpc wrr route get invalid weight.'));
          return;
        }
      }
    }
    var server = client._station.servers[servers[index]];
    if(server.weight >= weight) {
      client.wrrParam[serverType] = {index: index, weight: weight};
      utils.invokeCallback(cb, null, server.id);
      return;
    }
  }
};

/**
 * Least-Active algorithm for calculating server id.
 *
 * @param client {Object} rpc client.
 * @param serverType {String} rpc target serverType.
 * @param msg {Object} rpc message.
 * @param cb {Function} cb(err, serverId).
 */
var laRoute = function(client, serverType, msg, cb) {
  var servers = client._station.serversMap[serverType];
  if(!servers || !servers.length) {
    utils.invokeCallback(cb, new Error('rpc servers not exist with serverType: ' + serverType));
    return;
  }
  var actives = [];
  if(!client.laParam) {
    client.laParam = {};
  }
  if(!!client.laParam[serverType]) {
    for(var j=0; j<servers.length; j++) {
      var count = client.laParam[serverType][servers[j]];
      if(!count) {
        client.laParam[servers[j]] = count = 0;
      }
      actives.push(count);
    }
  } else {
    client.laParam[serverType] = {};
    for(var i=0; i<servers.length; i++) {
      client.laParam[serverType][servers[i]] = 0;
      actives.push(0);
    }
  }
  var rs = [];
  var minInvoke = Number.MAX_VALUE;
  for(var k=0; k<actives.length; k++) {
    if(actives[k] < minInvoke) {
      minInvoke = actives[k];
      rs = [];
      rs.push(servers[k]);
    } else if(actives[k] === minInvoke) {
      rs.push(servers[k]);
    }
  }
  var index = Math.floor(Math.random() * rs.length);
  var serverId = rs[index];
  client.laParam[serverType][serverId] += 1;
  utils.invokeCallback(cb, null, serverId);
};

/**
 * Consistent-Hash algorithm for calculating server id.
 *
 * @param client {Object} rpc client.
 * @param serverType {String} rpc target serverType.
 * @param msg {Object} rpc message.
 * @param cb {Function} cb(err, serverId).
 */
var chRoute = function(client, serverType, msg, cb) {
  var servers = client._station.serversMap[serverType];
  if(!servers || !servers.length) {
    utils.invokeCallback(cb, new Error('rpc servers not exist with serverType: ' + serverType));
    return;
  }
  
  var index, con;
  if(!client.chParam) {
    client.chParam = {};
  }
  if(!!client.chParam[serverType]) {
    con = client.chParam[serverType].consistentHash;
  } else {
    client.opts.station = client._station;
    con = new ConsistentHash(servers, client.opts);
  }
  var hashFieldIndex = client.opts.hashFieldIndex;
  var field = msg.args[hashFieldIndex] || JSON.stringify(msg);
  utils.invokeCallback(cb, null, con.getNode(field));
  client.chParam[serverType] = {consistentHash: con};
};

module.exports = {
  rr: rrRoute,
  wrr: wrrRoute,
  la: laRoute,
  ch: chRoute,
  rd: rdRoute,
  df: defRoute
};
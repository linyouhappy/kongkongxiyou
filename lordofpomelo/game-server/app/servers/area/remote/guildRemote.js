var utils = require('../../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var userDao = require('../../../dao/userDao');

var exp = module.exports;

exp.setGuildId = function(params, cb) {
  var guildId = params.guildId;
  var playerId = params.playerId;
  logger.info("guildId="+guildId+",playerId="+playerId);
  var area = pomelo.app.areaManager.getArea();
  if (!area) {
    logger.info('setGuildId  area is not exist! %j', params);
    utils.invokeCallback(cb, null);
    return;
  }
  var player = area.getPlayer(playerId);
  if (player) {
    player.guildId = guildId;
    userDao.updateGuildId(player);
  }
  utils.invokeCallback(cb, null);
};





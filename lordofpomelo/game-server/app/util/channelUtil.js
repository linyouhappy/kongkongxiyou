var ChannelUtil = module.exports;

var GLOBAL_CHANNEL_NAME = 'pomelo';
var AREA_CHANNEL_PREFIX = 'area_';
var TEAM_CHANNEL_PREFIX = 'team_';
var GUILD_CHANNEL_PREFIX = 'guild_';

ChannelUtil.getGlobalChannelName = function() {
  return GLOBAL_CHANNEL_NAME;
};

ChannelUtil.getAreaChannelName = function(areaId) {
  return AREA_CHANNEL_PREFIX + areaId;
};

ChannelUtil.getTeamChannelName = function(teamId) {
  return TEAM_CHANNEL_PREFIX + teamId;
};

ChannelUtil.getGuildChannelName = function(guildId) {
  return GUILD_CHANNEL_PREFIX + guildId;
};
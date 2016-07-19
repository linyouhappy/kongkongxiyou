var utils = require('../../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var messageService = require('../../../domain/messageService');
var formula = require('../../../consts/formula');

var exp = module.exports;
var guildService = pomelo.app.get('guildService');

exp.getSalary = function(guildId, playerId, cb) {
	var guild = guildService.getGuild(guildId);
	if (!guild) {
		utils.invokeCallback(cb,null,108);
		return;
	}
	var member = guild.getMemberByPlayerId(playerId);
	if (!member) {
		utils.invokeCallback(cb,null,126);
		return;
	}
	var date = new Date;
	var currentDate = date.getDate();
	var currentMonth = date.getMonth();
	date.setTime(member.salaryTime);
	if (date.getDate() !== currentDate 
		|| date.getMonth() !== currentMonth) {

		member.salaryTime=Date.now();
		guild.caoCoin-=guild.salary;

		guild.saveMember(member);
		guildService.saveGuild(guild);

		utils.invokeCallback(cb,null,200,guild.salary);
	} else {
		utils.invokeCallback(cb,null,201);
	}
};

exp.createGuild = function(guildName, playerName, playerId, cb) {
	guildService.createGuild(guildName, playerName, playerId, cb);
};

exp.disbandGuild = function(guildId, playerId, cb) {
	guildService.disbandGuild(guildId, playerId, cb);
};

exp.enterGuild = function(userId, guildId, playerId, cb) {
	if (!guildService) {
		guildService = pomelo.app.get('guildService');
	}

	guildService.removeMarkNoGuild(playerId);
	guildService.enterGuild(guildId, playerId, false, function(err, guild, member) {
		if (!!err) {
			utils.invokeCallback(cb, err);
			return;
		}
		if (!member) {
			guildService.markNoGuild(playerId, userId);
			utils.invokeCallback(cb,null, 0);
			return;
		}
		if (guild) {
			if (member.guildId === guild.id) {
				member.loginTime = Date.now();
				guild.saveMember(member);
				guild.enterGuild(member,userId);

				utils.invokeCallback(cb,null, guild.id);
				return;
			}
		}
		member.userId=userId;
		guildService.markNoGuild(playerId, member);
		// guildService.removeMember(member);
		utils.invokeCallback(cb, null, 0);
	});
};

exp.guildItem = function(guildId,playerId,item, cb) {
	var code=guildService.guildItem(guildId,playerId,item);
	utils.invokeCallback(cb,null,code);
};

exp.playerItem = function(guildId, playerId, itemId, cb) {
	var guild = guildService.getGuild(guildId);
	if (!guild) {
		utils.invokeCallback(cb, null, 108);
		return;
	}
	var member = guild.getMemberByPlayerId(playerId);
	if (!member) {
		utils.invokeCallback(cb, null, 126);
		return;
	}
	var item = guild.items[itemId];
	if (!item) {
		utils.invokeCallback(cb, null, 40);
		return;
	}
	var build = formula.calItemBuild(item) * 2;
	if (member.build < build) {
		utils.invokeCallback(cb, null, 131);
		return;
	}
	member.build -= build;
	guild.playerItem(member, item, build);
	
	// guild.saveMember(member);
	// guild.removeItem(item);
	delete item["id"];
	utils.invokeCallback(cb, null, 200, item);
};

exp.playerLeave = function(userId, guildId, playerId, cb) {
	guildService.playerLeave(userId, guildId, playerId);
	utils.invokeCallback(cb);
};

exp.chatInGuild = function(args, cb){
  guildService.chatInGuild(args.guildId,args.content);
  utils.invokeCallback(cb);
};

exp.startDomain=function(areaId,level,cb){
	var code=guildService.startDomain(areaId,level);
	utils.invokeCallback(cb,null,code);
};

exp.finishDomain=function(areaId,guildId,level,cb){
	logger.info("guildRemote.finishDomain====>> areaId="+areaId+",guildId="+guildId+",level="+level);
	var guildName=guildService.finishDomain(areaId,guildId,level);
	utils.invokeCallback(cb,null,guildName);
};

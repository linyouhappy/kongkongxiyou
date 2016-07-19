// var Code = require('../../../shared/code');
var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../domain/messageService');
var dataApi = require('../util/dataApi');
var async = require('async');
var channelUtil=require('../util/channelUtil');
var dispatcher = require('../util/dispatcher');

var pomelo = require('pomelo');

var guildDao = require('../dao/guildDao');
var guildEquipDao = require('../dao/guildEquipDao');
var guildMemberDao = require('../dao/guildMemberDao');
var domainDao = require('../dao/domainDao');


var consts = require('../consts/consts');
var GuildConsts=consts.GuildConsts;
var ChatMaskId=consts.ChatMaskId;
var PlaceTypes=consts.PlaceTypes;
var AreaStates=consts.AreaStates;
// var DomainConst=consts.DomainConst;

var Guilder=require('./Guilder');

var sortNumber=function(a, b) {
	return b.caoCoin-a.caoCoin;
};


//GuildService
var GuildService = function() {
	this.guilds = [];
	this.guildIds = {};
	this.noGuildPlayers={};
	this.applicants={};


	var self = this;
	setTimeout(function() {
		self.initGuilds();
		self.intervalId = setInterval(self.tick.bind(self), 30 * 60000);

		self.initDomains();
		// self.intervalId1 = setInterval(self.update.bind(self), 3000);
	}, 5000);

};

module.exports = GuildService;

GuildService.prototype.initDomains = function() {
	var self=this;
	domainDao.getAllDatas(function(err, data) {
		if (err || !data) {
			logger.error("ERROR:GuildService.initDomains domainDao.getAllDatas");
			return;
		}
		var domain, areaId, guildTown;
		var domains = {};

		for (var i = 0; i < data.length; i++) {
			domain=data[i];
			domain.state=AreaStates.DOMAIN_STATE;
			domains[domain.areaId]=domain;

			guildTown=dataApi.guild_town.findById(domain.areaId%1000);
			if (guildTown) {
				domain.guildTown=guildTown;
			}else{
				logger.error("GuildService.initDomains areaId="+domain.areaId);
			}
		}
		self.domains=domains;

		setTimeout(function() {
			self.initGuildDomains();
		},2000);
		
		// var areaIdMap=pomelo.app.get('areaIdMap');
		// var guildTowns=dataApi.guild_town.all();
		// var guildTown,serverId;
		// for (var key in guildTowns) {
		// 	guildTown = guildTowns[key];
		// 	domain = domains[guildTown.areaId];
		// 	domain.serverId = areaIdMap[guildTown.areaId];
		// 	domain.guildTown = guildTown;
		// }
	});
};

GuildService.prototype.initGuildDomains = function() {
	var self=this;
	for (var key in this.domains) {
		var getGuildNameFunc = function(domain) {
			if (domain.guildId) {
				self.getGuildWithCb(domain.guildId, function(err, guild) {
					if (err) {
						logger.error("initGuildDomains self.getGuildWithCb %j",err);
					} else if (guild) {
						domain.guildName = guild.name;
						guild.areaId=domain.areaId;
					}
				});
			}
		}
		getGuildNameFunc(this.domains[key]);
	}
};

GuildService.prototype.startDomain=function(areaId,level){
	var domain = this.domains[areaId];
	if(!domain){
		return;
	}
	if (domain.level!==level) {
		logger.warn("GuildService.startDomain======>> level="+level);
	}
	logger.info("GuildService.startDomain BATTLE_STATE areaId="+areaId+",level="+level);
	domain.state=AreaStates.BATTLE_STATE;
	if (domain.guildId) {
		var guild = this.guildIds[domain.guildId];
		if (guild) {
			guild.domainStart(domain);
		}
	}
	return 200;
};

GuildService.prototype.finishDomain=function(areaId,guildId,level,cb){
	var domain = this.domains[areaId];
	if(!domain){
		return;
	}
	logger.info("GuildService.finishDomain DOMAIN_STATE areaId="+areaId+",level="+level);
	domain.state=AreaStates.DOMAIN_STATE;
	if (!guildId) {
		domain.guildId=0;
		domain.level=0;
		domain.guildName="";
		return;
	}
	var guild = this.guildIds[guildId];
	if (!guild) {
		return;
	}
	domain.guildId=guildId;
	domain.level=level;
	domain.guildName=guild.name;
	guild.domainSuccess(domain);
	return guild.name;
};

// GuildService.prototype.noticeBattle = function(domain) {
// 	if (!domain.serverId) {
// 		var serverId = pomelo.app.get('areaIdMap')[domain.areaId];
// 		if (!serverId) return;
// 		domain.serverId = serverId;
// 	}
// 	var params = {
// 		namespace: 'user',
// 		service: 'areaRemote',
// 		method: 'startBattle',
// 		args: [{
// 			instanceId: 0
// 		}]
// 	};
// 	pomelo.app.rpcInvoke(domain.serverId, params, function(err, result) {
// 		if (!!err) {
// 			logger.error('GuildService.update areaRemote.startBattle error!');
// 		} else {
// 			logger.info("result======>> areaId" + result.areaId);
// 			if (domain.areaId === result.areaId) {
// 				domain.isRunning=true;
// 				logger.info("success start=============>>");
// 			} else {
// 				logger.info("fail start========>>");
// 			}
// 		}
// 	});
// };

GuildService.prototype.getDomains = function() {
	return this.domains;
};

// GuildService.prototype.update = function() {
// 	if (!this.isInit) {
// 		if (!this.initGuildDomains()) {
// 			return;
// 		}
// 	}
// 	var currdate = new Date;
// 	var currHours = currdate.getHours();
// 	// if (currHours === DomainConst.START_HOUR) {
// 	if (currHours !== DomainConst.START_HOUR) {
// 		if (!this.domainBattleState) {
// 			var currMinutes = currdate.getMinutes();
// 			// if (currMinutes>=DomainConst.START_MINUTE) {
// 			if (currMinutes !== DomainConst.START_MINUTE) {
// 				utils.myPrint('domainBattle start=================>>');
// 				this.domainBattleState = BattleState.BATTLE_START;

// 				var domain, domains = this.domains;
// 				for (var key in domains) {
// 					domain = domains[key];
// 					domain.fireCount = 2;
// 					this.noticeBattle(domain);
// 				}
// 				var msg = {
// 					broadId: 124
// 				};
// 				pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function() {});
// 				pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function() {});
// 			} else {
// 				utils.myPrint('domainBattle is about to start=================>>');
// 			}
// 		}else{
// 			if (this.domainBattleState===BattleState.BATTLE_START) {
// 				var domain,domains=this.domains;
// 				for (var key in domains) {
// 					domain=domains[key];
// 					if (!domain.isRunning && domain.fireCount>0) {
// 						domain.fireCount--;
// 						this.noticeBattle(domain);

// 						this.update();
// 						return;
// 					}
// 				}
// 				this.domainBattleState=BattleState.BATTLE_ALL_START;
// 			}else{
// 				//utils.myPrint('domainBattle all run=================>>');
// 			}
// 		}
// 	}else{
// 		if (this.domainBattleState) {
// 			this.domainBattleState=BattleState.BATTLE_OVER;
// 		}
// 	}
// };

GuildService.prototype.tick = function() {
	var guild, guilds = this.guilds;
	if (guilds.length > 30) {
		var tmpGuild;
		var guildIds=this.guildIds;
		for (var key in guildIds) {
			guild = guildIds[key];
			if (!guild.hasOnlinePlayer() || guild.isTimeOut()) {
				for (var i = 0; i < guilds.length; i++) {
					tmpGuild=guilds[i];
					if (guild.id===tmpGuild.id) {
						guilds.splice(i,1);
						i--;
					}
				}
				delete guildIds[key];
			}
			if (guilds.length <= 30){
				break;
			}
		}
	}

	guilds.sort(sortNumber);
	for (var i = 0; i < guilds.length; i++) {
		guild = guilds[i];
		guild.ranking = i;
	}

	for (var key in this.applicants) {
		if (this.applicants[key].isLeave) {
			delete this.applicants[key];
		}
	}
};

GuildService.prototype.chatInGuild=function(guildId,content){
	var guild=this.guildIds[guildId];
	if (guild) {
		guild.chatInGuild(content);
	}
};

GuildService.prototype.initGuilds = function() {
	var self=this;
	guildDao.getTopDatas(function(err, data) {
		if (err || !data) {
			logger.error("ERROR:GuildService.initGuilds guildDao.getTopDatas");
			return;
		}
		var guild;
		for (var i = 0; i < data.length; i++) {
			guild= new Guilder(data[i]);
			// self.addGuild(guild);
			self.guilds.push(guild);
			self.guildIds[guild.id]=guild;
		}
		self.tick();
	});
};

GuildService.prototype.guildDesc=function(guildId,desc){
	var guild=this.guildIds[guildId];
	if (guild) {
		guild.setGuildDesc(desc);
		return 200;
	}
	return 105;
};

GuildService.prototype.getGuildWithCb = function(guildId,cb) {
	var guild = this.guildIds[guildId];
	if (guild) {
		utils.invokeCallback(cb, null, guild);
	} else {
		var self=this;
		guildDao.getDataById(guildId, function(err, guild) {
			if (err) {
				logger.error("ERROR:GuildService.getGuildWithCb guildDao.getDataById");
				utils.invokeCallback(cb, err);
				return;
			}
			if (guild) {
				guild.count = 0;
				guild.ranking = 0;

				guild = new Guilder(guild);
				self.addGuild(guild);
			} else {
				utils.invokeCallback(cb, null);
			}
		});
	}
};

GuildService.prototype.getGuild = function(guildId) {
	return this.guildIds[guildId];
};

GuildService.prototype.addGuild = function(guild) {
	if (this.guildIds[guild.id]) {
		logger.error("GuildService.addGuild guild is exist",guild.id);
		return;
	}
	this.guilds.push(guild);
	this.guildIds[guild.id]=guild;
	this.tick();
};

GuildService.prototype.removeGuild = function(guildId,isForce) {
	if (!isForce) {
		if (this.guilds.length<100) {
			return;
		}
	}
	var guild,guilds=this.guilds;
	for (var i = 0; i < guilds.length; i++) {
		guild=guilds[i];
		if (guild.id===guildId) {
			guilds.splice(i,1);
			i--;
			guild.destroyGuild();
		}
	}
	delete this.guildIds[guildId];
	this.tick();
};

GuildService.prototype.getGuilds = function(start) {
	var guilds=this.guilds;
	var guild,retGuilds=[];
	for (var i = start; i < guilds.length && i<10+start; i++) {
		guild=guilds[i];
		retGuilds.push({
			id:guild.id,
			name:guild.name,
			level:guild.level,
			count:guild.count,
			caoCoin:guild.caoCoin,
			ranking:guild.ranking
		});
	}
	return retGuilds;
};

GuildService.prototype.getMembers=function(guildId,cb){
	var guild=this.guildIds[guildId];
	if (guild) {
		guild.getGuildMemberWithCb(cb);
	}else{
		utils.invokeCallback(cb, null);
	}
};

GuildService.prototype.removeMember = function(member) {
	if (member.guildId) {
		var guild=this.guildIds[guildId];
		if (guild) {
			guild.removeMember(member);
			return;
		}
	}
};

GuildService.prototype.disbandGuild=function(guildId,playerId,cb){
	var guild=this.guildIds[guildId];
	if (guild) {
		if (guild.captainId!==playerId) {
			guild.leaveGuild(playerId);
			// var member=guild.getMemberByPlayerId(playerId);
			// if (member) {
			// 	guild.removeMemberByPlayerId(playerId);
			// }
		}else{
			guild.disbandGuild();
			deleteGuild(guild);
			this.removeGuild(guildId, true);
		}
		utils.invokeCallback(cb, null, 0);
		return;
	}
	utils.invokeCallback(cb, null, 2);
};

GuildService.prototype.markNoGuild=function(playerId,member){
	this.noGuildPlayers[playerId]=member;
};

GuildService.prototype.removeMarkNoGuild=function(playerId){
	if (this.noGuildPlayers[playerId]) {
		delete this.noGuildPlayers[playerId];
	}
};

GuildService.prototype.playerLeave=function(userId,guildId, playerId){
	delete this.noGuildPlayers[playerId];
	var guild=this.guildIds[guildId];
	if (guild) {
		guild.playerLeave(playerId);
	}
	else{
		var applicant=this.applicants[playerId];
		if (applicant) {
			applicant.isLeave=true;
		}
	}
};

GuildService.prototype.checkHasGuild=function(playerId){
	return !this.noGuildPlayers[playerId]
};

GuildService.prototype.enterGuild = function(guildId, playerId, isAgain, cb) {
	if (!guildId) {
		var applicant=this.applicants[playerId];
		if (applicant) {
			applicant.isLeave=false;
		}
		if (this.noGuildPlayers[playerId]) {
			if (typeof this.noGuildPlayers[playerId] !== 'object') {
				utils.invokeCallback(cb, null, null);
			} else {
				utils.invokeCallback(cb, null, null, this.noGuildPlayers[playerId]);
			}
			return;
		}
	}
	var self = this;
	if (guildId) {
		var guild=this.guildIds[guildId];
		if (guild) {
			if (guild.getGuildMember()) {
				var member=guild.getMemberByPlayerId(playerId);
				if (member) {
					utils.invokeCallback(cb, null, guild, member);
				}else{
					guild.getMemberByPlayerIdWithCb(playerId, function(err, member, guild) {
						if (err) {
							logger.error("ERROR:GuildService.enterGuild guild.getMemberByPlayerIdWithCb");
							utils.invokeCallback(cb, err);
						}else{
							utils.invokeCallback(cb, null, guild, member);
						}
					});
				}
			}else{
				guild.getGuildMemberWithCb(function(err, guildMember) {
					if (err) {
						logger.error("ERROR:getMemberByPlayerIdWithCb Guilder.getGuildMemberWithCb");
						utils.invokeCallback(cb, err);
						return;
					}
					var member = guild.getMemberByPlayerId(playerId);
					utils.invokeCallback(cb, null, guild, member);
				});
			}
		}else{
			guildDao.getDataById(guildId,function(err, guild){
				if (err) {
					logger.error("ERROR:GuildService.enterGuild guildDao.getDataById");
					utils.invokeCallback(cb, err);
					return;
				}
				if (guild) {
					guild.count=0;
					guild.ranking=0;

					guild = new Guilder(guild);
					self.addGuild(guild);

					guild.getMemberByPlayerIdWithCb(playerId, function(err, member, guild) {
						if (err) {
							logger.error("ERROR:GuildService.enterGuild guild.getMemberByPlayerIdWithCb");
							utils.invokeCallback(cb, err);
						}else{
							utils.invokeCallback(cb, null, guild, member);
						}
					});
				}else{
					utils.invokeCallback(cb, null, null);
				}
			});
		}		
	}else{
		guildMemberDao.getDataByPlayerId(playerId, function(err, member) {
			if (err) {
				logger.error("ERROR:GuildService.myGuild guildMemberDao.getDataByGuildId");
				utils.invokeCallback(cb, err);
				return;
			}
			if (member) {
				var guildId = member.guildId;
				if(!guildId){
					utils.invokeCallback(cb, null, null,member);
					return;
				}
				self.enterGuild(guildId,playerId,true,function(err, guild){
					if (err) {
						logger.error("ERROR:GuildService.myGuild self.enterGuild");
						utils.invokeCallback(cb, err);
						return;
					}
					if (guild) {
						utils.invokeCallback(cb, null, guild,member);
					}else{
						utils.invokeCallback(cb, null, null,member);
					}
				});
			} else {
				utils.invokeCallback(cb, null, null);
			}
		});
	}
};



GuildService.prototype.getGuildByPlayerId = function(playerId) {
	var guildIds=this.guildIds;
	for (var key in guildIds) {
		if (guildIds[key].captainId===playerId) {
			return guildIds[key];
		}
	}
};

GuildService.prototype.saveGuild=function(guild){
	saveGuild(guild);
};

GuildService.prototype.createGuild = function(guildName,playerName,playerId,cb) {
	if (!this.noGuildPlayers[playerId]) {
		logger.warn("createGuild: player already have guild. playerId="+playerId);
		utils.invokeCallback(cb, null, 1);
		return;
	}
	delete this.noGuildPlayers[playerId];
	if(this.applicants[playerId]){
		delete this.applicants[playerId];
	}
	guildMemberDao.destroyByPlayerId(playerId);

	var level=0;
	var guildData=dataApi.guild.findById(level);
	var guild={
		name:guildName,
		level:level,
		caoCoin:guildData.caoCoin,
		captainId:playerId,
		captainName:playerName,
		count:0,
		ranking:0,
		build:0,
		desc:""
	};
	var self=this;
	guildDao.create(guild,function(err, data) {
		if (err || !data) {
			logger.error("ERROR:GuildService.createGuild guildDao.create");
			utils.invokeCallback(cb, err);
			return;
		}
		self.removeMarkNoGuild(playerId);

		guild = new Guilder(guild);
		self.addGuild(guild);
		// logger.log("createGuild guild="+JSON.stringify(guild));
		var member = {
			playerId: playerId,
			name: playerName,
			guildId: guild.id,
			jobId: 1,
			caoCoin:0
		};
		guild.createMember(member,function(err, data) {
			if (err || !data) {
				logger.error("ERROR:GuildService.createGuild GuildService.createGuildMember");
				// utils.invokeCallback(cb, err);
				// return;
			}
		});
		utils.invokeCallback(cb, null, guild.id);
	});
};

GuildService.prototype.getApplicant=function(playerId){
	return this.applicants[playerId];
};

GuildService.prototype.applyGuildReply=function(guildId,playerId,reply){
	var guild=this.getGuild(guildId);
	if (!guild) {
  		return;
  	}
  	if (guild.isFull()) {
  		return;
  	}
	var applicantRecord=this.applicants[playerId];
	if (!applicantRecord || !applicantRecord.guilds[guildId]) {
		return;
	}
	guild.removeApplicant(playerId);
  	if (reply===GuildConsts.ACCEPT) {
  		delete this.applicants[playerId];
  		delete this.noGuildPlayers[playerId]
  		var member = {
			playerId: playerId,
			name: applicantRecord.playerName,
			level:applicantRecord.playerLevel,
			guildId: guild.id,
			jobId: 0,
			caoCoin:0
		};
		guild.createMember(member,function(err, data) {
			if (err || !data) {
				logger.error("ERROR:GuildService.applyGuildReply GuildService.createGuildMember");
			}else{
				if (!applicantRecord.isLeave) {
					guild.addMemberToChannel(applicantRecord.playerId,applicantRecord.uid);
				}
				guild.joinGuild(member);
				// var content={
				// 	maskId:ChatMaskId.GUILDMASK,
				// 	broadId: 121,
    //             	data: []
				// };
				// content.data[0]={
				// 	playerId:member.playerId,
				// 	name:member.name
				// };
				// guild.chatInGuild(content);
			}
		});
  	}else{
  		delete applicantRecord.guilds[guildId];
  		applicantRecord.guildCount--;
  	}

  	if (!applicantRecord.isLeave) {
		var msg = {
			guildName: guild.name,
			reply: reply
		};
		messageService.pushMessageToPlayer(applicantRecord,"onApplyGuildReply", msg);
  	}
};

GuildService.prototype.applyGuild = function(session, guildId) {
	var playerId = session.get('playerId');
	if (this.checkHasGuild(playerId)) {
		return 114;
	}
	var guild=this.getGuild(guildId);
  	if (!guild) {
  		return 201;
  	}
  	if (guild.isFull()) {
  		return 116;
  	}
	var applicants=this.applicants;
	var applicantRecord=applicants[playerId];
	if (!applicantRecord) {
		applicantRecord={};
		applicants[playerId]=applicantRecord;
		applicantRecord.guilds={};
		applicantRecord.guildCount=0;
	}
	if (applicantRecord.guilds[guildId]) {
		return 201;
	}
	if (applicantRecord.guildCount>5) {
		return 115;
	}
    if (!applicantRecord.playerId) {
    	applicantRecord.playerId=playerId;
      	applicantRecord.playerName=session.get('playerName');
      	applicantRecord.playerLevel=session.get('level');
      	applicantRecord.uid=session.uid;
      	applicantRecord.sid=session.frontendId;
    }
    applicantRecord.guilds[guildId]=guildId;
    applicantRecord.guildCount++;
    guild.applyGuild(applicantRecord);
    return 200;
};

GuildService.prototype.inviteGuild=function(session,inviteeId){
	var userId=this.noGuildPlayers[inviteeId];
	if (typeof userId === 'object') {
  		userId=userId.userId;
  	}
	if (!userId) {
		return 119;
	}
	var guildId = session.get('guildId');
	var guild=this.getGuild(guildId);
  	if (!guild) {
  		return 117;
  	}
  	if (guild.isFull()) {
  		return 116;
  	}
  	var playerId=session.get('playerId');
  	var member=guild.getMemberByPlayerId(playerId);
  	if (!member) {
  		return 117;
  	}
  	if (member.jobId===0) {
  		return 118;
  	}

  	guild.addInviteeId(inviteeId);

  	var msg = {
  		inviterName:member.name,
		guildName: guild.name,
		guildId:guildId,
	};
	var sid=getSidByUid(userId);
	messageService.pushMessageToPlayer({uid:userId,sid:sid},"onInviteGuild", msg);
	return 200;
};

GuildService.prototype.inviteGuildReply = function(session,guildId) {
	var guild = this.getGuild(guildId);
	if (!guild) {
		return;
	}
	if (guild.isFull()) {
		return;
	}
	var playerId = session.get('playerId');
	if (!guild.checkHasInviteeId(playerId)) {
		messageService.pushLogTipsToPlayer({sid:session.frontendId,uid:session.uid}, 120);
		return;
	}
	delete this.noGuildPlayers[playerId]

	var member = {
		playerId: playerId,
		name: session.get('playerName'),
		level: session.get('level'),
		guildId: guildId,
		jobId: 0,
		caoCoin: 0
	};

	guild.createMember(member, function(err, data) {
		if (err || !data) {
			logger.error("ERROR:GuildService.inviteGuildReply GuildService.createGuildMember");
		} else {
			guild.addMemberToChannel(playerId, session.uid);

			// var content={
			// 	maskId:ChatMaskId.GUILDMASK,
			// 	broadId:121,
   //              data: []
			// };
			// content.data[0]={
			// 	playerId:member.playerId,
			// 	name:member.name
			// };
			// guild.chatInGuild(content);
			guild.joinGuild(member);

			session.set('guildId', member.guildId);
	        session.push('guildId');

	        var serverId = session.get('serverId');
	        var params = {
	          namespace: 'user',
	          service: 'guildRemote',
	          method: 'setGuildId',
	          args: [{
	            playerId: playerId,
	            guildId: member.guildId
	          }]
	        };
	        pomelo.app.rpcInvoke(serverId, params, function(err, result) {});
		}
	});
};

GuildService.prototype.kickGuild=function(session,memberId){
	var playerId = session.get('playerId');
	var guildId=session.get('guildId');
	var guild=this.getGuild(guildId);
  	if (!guild) {
  		return 121;
  	}
  	var member=guild.getMemberByPlayerId(playerId);
  	if (!member) {
  		return 121;
  	}
  	if (member.jobId!==PlaceTypes.CEO) {
  		return 122;
  	}
  	member=guild.getMemberByPlayerId(memberId);
	if (member) {
		guild.kickGuild(memberId);
		return 200;
	}
	return 201;
};

GuildService.prototype.appointGuild=function(session,memberId){
	var playerId = session.get('playerId');
	var guildId=session.get('guildId');
	var guild=this.getGuild(guildId);
  	if (!guild) {
  		return 121;
  	}
  	if (guild.getManagerCount()>4) {
  		return 123;
  	}
  	var member=guild.getMemberByPlayerId(playerId);
  	if (!member) {
  		return 121;
  	}
  	if (member.jobId!==PlaceTypes.CEO) {
  		return 122;
  	}
  	member=guild.getMemberByPlayerId(memberId);
	if (member) {
		guild.appointGuild(memberId);
		return 200;
	}
	return 201;
};

GuildService.prototype.getItems=function(guildId,cb){
	var guild=this.getGuild(guildId);
  	if (guild) {
  		guild.getItemsWithCb(cb);
  	}else{
  		utils.invokeCallback(cb, null);
  	}
};

GuildService.prototype.guildItem = function(guildId, playerId, item) {
	var guild = this.getGuild(guildId);
	if (guild) {
		return guild.guildItem(playerId, item);
	}
	return 108;
};

// GuildService.prototype.playerItem=function(guildId, playerId, itemId){
// 	var guild = this.getGuild(guildId);
// 	if (guild) {
// 		return guild.playerItem(playerId,itemId);
// 	}
// 	return 0;
// };

GuildService.prototype.clearItems=function(guildId,itemIds){
	var guild = this.getGuild(guildId);
	if (guild) {
		return guild.clearItems(itemIds);
	}
	return [];
};

GuildService.prototype.upgrade=function(guildId, playerId){
	var guild = this.getGuild(guildId);
	if (guild) {
		return guild.upgrade(playerId);
	}
	return 108;
};


function saveGuild(guild) {
	guildDao.update(guild);
}

function deleteGuild(guild) {
	guildDao.destroy(guild.id);
}

var getSidByUid = function(uid) {
  var connector = dispatcher.dispatch(uid, pomelo.app.getServersByType('connector'));
  if(connector) {
    return connector.id;
  }
  return null;
};


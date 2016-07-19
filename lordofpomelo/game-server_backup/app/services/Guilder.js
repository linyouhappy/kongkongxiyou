var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../domain/messageService');
var dataApi = require('../util/dataApi');
var formula = require('../consts/formula');
var channelUtil=require('../util/channelUtil');
var dispatcher = require('../util/dispatcher');
var pomelo = require('pomelo');
var consts = require('../consts/consts');
var Channel=consts.Channel;
var ChatMaskId=consts.ChatMaskId;
var PlaceTypes=consts.PlaceTypes;
var GuildAffiche=consts.GuildAffiche;

var guildDao = require('../dao/guildDao');
var guildEquipDao = require('../dao/guildEquipDao');
var guildMemberDao = require('../dao/guildMemberDao');


var guildService;
var _uid=0;

var channelService;

//Guilder
var Guilder = function(guild) {
	this.id=guild.id;
	this.name=guild.name;
	this.level=guild.level;
	this.caoCoin=guild.caoCoin;
	this.salary=guild.salary || 100;
	this.build=guild.build;
	this.captainId=guild.captainId;
	this.captainName=guild.captainName;
	this.salaryTime=guild.salaryTime || 0;
	this.desc=guild.desc;

	this.areaId=guild.areaId;
	this.guildData=dataApi.guild.findById(this.level);

	this.count=guild.count || 0;
	this.ranking=guild.ranking || 0;
	this.managerCount=0;

	this.guildMember = {};
	this.isInitGuildMember=false;
	this.lastMemberTime=Date.now()+60000*60*12;

	this.itemAffiches=[];
	this.guildAffiches=[];

	if (!guildService) {
		guildService = pomelo.app.get('guildService');
	}
};

module.exports = Guilder;

Guilder.prototype.addItemAffiche=function(itemAffiche){
	itemAffiche.id=_uid++;
	itemAffiche.time=Date.now();
	this.itemAffiches.push(itemAffiche);

	while(this.itemAffiches.length>10){
		this.itemAffiches.shift();
	}
};

Guilder.prototype.getItemAffiches=function(){
	return this.itemAffiches;
};

Guilder.prototype.addGuildAffiche=function(guildAffiche){
	guildAffiche.id=_uid++;
	guildAffiche.time=Date.now();
	this.guildAffiches.push(guildAffiche);
	
	while(this.guildAffiches.length>10){
		this.guildAffiches.shift();
	}
};

Guilder.prototype.getGuildAffiches=function(){
	return this.guildAffiches;
};

Guilder.prototype.joinGuild = function(member) {
	var content = {
		maskId: ChatMaskId.GUILDMASK,
		broadId: 121,
		data: []
	};
	content.data[0] = {
		playerId: member.playerId,
		name: member.name
	};
	this.chatInGuild(content);

	this.addGuildAffiche({
		type: GuildAffiche.JOININ,
		player: member.name
	});
};

Guilder.prototype.appointGuild = function(playerId) {
	var member = this.guildMember[playerId];
	if (member) {
		member.jobId = PlaceTypes.Manager;
		saveGuildMember(member);
		this.managerCount++;

		this.addGuildAffiche({
			type:GuildAffiche.APPOINT,
			player:member.name
		});
		// var content={
		// 	maskId:ChatMaskId.GUILDMASK,
		// 	broadId:122,
		//              data: []
		// };
		// content.data[0]={
		// 	playerId:member.playerId,
		// 	name:member.name
		// };
		// this.chatInGuild(content);
	}
};

Guilder.prototype.kickGuild = function(playerId) {
	var member = this.guildMember[playerId];
	if (member) {
		this.removeMemberByPlayerId(playerId);
		if (member.jobId === PlaceTypes.Manager) {
			this.managerCount--;
		}
		var content = {
			maskId: ChatMaskId.GUILDMASK,
			broadId: 122,
			data: []
		};
		content.data[0] = {
			playerId: member.playerId,
			name: member.name
		};
		this.chatInGuild(content);

		this.addGuildAffiche({
			type:GuildAffiche.FIRE,
			player:member.name
		});
	}
};

Guilder.prototype.leaveGuild = function(playerId) {
	var member = this.guildMember[playerId];
	if (member) {
		if (member.jobId === PlaceTypes.Manager) {
			this.managerCount--;
		}
		this.removeMemberByPlayerId(playerId);

		this.addGuildAffiche({
			type:GuildAffiche.LEAVE,
			player:member.name
		});
	}
};

Guilder.prototype.getManagerCount=function(){
	return this.managerCount;
};

Guilder.prototype.isFull=function(){
	if (this.count>=this.guildData.capacity) {
		return true;
	}
};

Guilder.prototype.strip=function(){
	return {
		id:this.id,
		name:this.name,
		level:this.level,
		caoCoin:this.caoCoin,
		captainId:this.captainId,
		captainName:this.captainName,
		desc:this.desc,
		count:this.count,
		build:this.build,
		areaId:this.areaId
	};
};

Guilder.prototype.getChannel = function() {
  if(!this.channel){
    var channelName= channelUtil.getGuildChannelName(this.id);
    if (!channelService) {
    	channelService=pomelo.app.get('channelService');
    }
    this.channel = channelService.getChannel(channelName, true);
  }
  return this.channel;
};

Guilder.prototype.addMemberToChannel = function(playerId,userId){
	if (!playerId || !userId) {
		return;
	}
	if (!this.channelMap) {
		this.channelMap={};
	}
	if (this.channelMap[playerId]) {
		return;
	}
	this.lastMemberTime=Date.now()+60000*60*12;

	var sid=getSidByUid(userId);
	this.channelMap[playerId] = {
		uid: userId,
		sid: sid
	};
	this.getChannel().add(userId, sid);
};

Guilder.prototype.enterGuild=function(member,userId){
	this.addMemberToChannel(member.playerId,userId);
	if (member.jobId>0) {
		var self=this;
		setTimeout(function() {
			self.delayPushMessageToMember(member.playerId);
		}, 3000);
	}
};

Guilder.prototype.playerLeave=function(playerId,noRemoveGuild){
	if (!this.channelMap){
		if(!noRemoveGuild)
			guildService.removeGuild(this.id);
		return;
	}

	if(!this.channelMap[playerId]) {
		return;
	}
	var channelData=this.channelMap[playerId];
	delete this.channelMap[playerId];
	var channel=this.getChannel();
	if (channel) {
		channel.leave(channelData.uid,channelData.sid);
		if (channel.getUserAmount()===0) {
			if (!channelService) {
		    	channelService=pomelo.app.get('channelService');
		    }
			channelService.destroyChannel(channel.name);
			this.channelMap=null;
			if(!noRemoveGuild)
				guildService.removeGuild(this.id);
		}
	}
};

Guilder.prototype.hasOnlinePlayer=function(){
	return !!this.channelMap;
};

Guilder.prototype.isTimeOut=function(){
	return Date.now()>this.lastMemberTime;
};

Guilder.prototype.getOnlinePlayerCount=function(){
	var channel=this.getChannel();
	if (channel) {
		return channel.getUserAmount();
	}
	return 0;
};

Guilder.prototype.chatInGuild=function(content){
	var channel=this.getChannel();
	if (channel) {
		content.channel=Channel.FACTION;
		channel.pushMessage('onChat', content);
	}
};

// Guilder.prototype.sendChatInGuild = function(chatContent) {
// 	var content = {
// 		// channel: Channel.FACTION,
// 		content: chatContent
// 	};
// 	this.chatInGuild(content);
// };

Guilder.prototype.getGuildMemberWithCb= function(cb) {
	if (this.isInitGuildMember) {
		utils.invokeCallback(cb, null, this.guildMember);
		return;
	}
	var self=this;
	guildMemberDao.getDataByGuildId(this.id,function(err, data) {
		if (err || !data) {
			logger.error("ERROR:Guilder.getGuildMemberWithCb guildMemberDao.getDataByGuildId");
			utils.invokeCallback(cb, err);
			return;
		}
		var member;
		var guildMember={};
		self.managerCount=0;
		for (var i = 0; i < data.length; i++) {
			member=data[i];
			guildMember[member.playerId]=member;
			if(member.jobId===PlaceTypes.Manager){
				self.managerCount++;
			}
		}
		self.count=data.length;
		self.guildMember=guildMember;
		self.isInitGuildMember=true;
		utils.invokeCallback(cb, null, guildMember);
	});
};

Guilder.prototype.setGuildDesc=function(desc){
	this.desc=desc;
	saveGuildDesc(this);
};

Guilder.prototype.getGuildMember=function(){
	return this.guildMember;
};

Guilder.prototype.getMemberByPlayerId = function(playerId) {
	return this.guildMember[playerId];
};

Guilder.prototype.getMemberByPlayerIdWithCb = function(playerId, cb) {
	var self=this;
	guildMemberDao.getDataByPlayerId(playerId, function(err, member) {
		if (err) {
			logger.error("ERROR:getMemberByPlayerIdWithCbGuildService.myGuild guildMemberDao.getDataByGuildId");
			utils.invokeCallback(cb, err);
			return;
		}
		if (member) {
			if (self.id === member.guildId) {
				if (self.isInitGuildMember) {
					self.guildMember[member.playerId]=member;
					self.count++;
					utils.invokeCallback(cb, null, member,self);
				}else{
					self.getGuildMemberWithCb(function(err,guildMember){
						if (err) {
							logger.error("ERROR:getMemberByPlayerIdWithCb Guilder.getGuildMemberWithCb");
							utils.invokeCallback(cb, err);
							return;
						}
						utils.invokeCallback(cb, null, member,self);
					});
				}
			}else{
				utils.invokeCallback(cb, null, member);
			}
		} else {
			utils.invokeCallback(cb, null);
		}
	});
};

Guilder.prototype.removeMemberByPlayerId = function(playerId) {
	if (this.guildMember[playerId]) {
		this.count--;
		delete this.guildMember[playerId];
		this.playerLeave(playerId, true);
	}
	deleteGuildMemberByPlayerId(playerId);
};

Guilder.prototype.removeMember = function(member) {
	if (this.guildMember[member.playerId]) {
		this.count--;
		delete this.guildMember[member.playerId];
		this.playerLeave(member.playerId, true);
	}
	deleteGuildMember(member);
};

Guilder.prototype.saveMember = function(member) {
	saveGuildMember(member);
};

Guilder.prototype.disbandGuild = function() {
	var guildMember = this.guildMember;
	if (guildMember) {
		var member;
		for (var key in guildMember) {
			member = guildMember[key];
			member.guildId = 0;
			saveGuildMember(member);
		}
		this.guildMember=null;
	}
};

Guilder.prototype.destroyGuild=function(){
	var guildMember = this.guildMember;
	if (guildMember) {
		var member;
		for (var key in guildMember) {
			member = guildMember[key];
			this.playerLeave(member.playerId,true);
		}
		this.guildMember=null;
	}
	for (var key in this) {
		delete this[key];
	}
};

Guilder.prototype.createMember=function(member,cb){
	var self=this;
	member.loginTime=Date.now();
	member.build=0;
	guildMemberDao.create(member,function(err, member){
		if (err || !member) {
			logger.error("ERROR:Guilder.createGuildMember guildMemberDao.getDataByGuildId");
			utils.invokeCallback(cb, err);
			return;
		}
		if(self.isInitGuildMember){
			self.count++;
			self.guildMember[member.playerId]=member;
		}else{
			self.getGuildMemberWithCb();
		}
		utils.invokeCallback(cb,null, member);
	});
};

Guilder.prototype.delayPushMessageToMember=function(playerId){
	var applicants=this.applicants;
	if (!applicants) {
		return;
	}
	if (!this.guildMember[playerId]) {
		return;
	}
	var channelMap=this.channelMap;
	if (!channelMap || !channelMap[playerId]) {
		return;
	}
	
	var channelData=channelMap[playerId];
	var applicant, msg;
	for (var key in applicants) {
		applicant = guildService.getApplicant(applicants[key]);
		if (applicant) {
			msg = {
				playerId: applicant.playerId,
				playerName: applicant.playerName,
				playerLevel:applicant.playerLevel
			};
			pushMessage(channelData, 'onApplyGuild', msg);
		}else{
			delete applicants[key];
		}
	}
	if (!applicant) {
		this.applicants=null;
	}
};

Guilder.prototype.removeApplicant=function(playerId){
	if (this.applicants) {
		delete this.applicants[playerId]
	}
};

Guilder.prototype.applyGuild=function(applicant){
	if (!this.applicants) {
		this.applicants={};
	}
	this.applicants[applicant.playerId]=applicant.playerId;

	var guildMember = this.guildMember;
	var channelMap=this.channelMap;
	if (channelMap) {
		var member, channelData, msg;
		for (var key in guildMember) {
			member = guildMember[key];
			if (member.jobId>0) {
				channelData=channelMap[member.playerId];
				if (channelData) {
					if (!msg) {
						msg={
							playerId:applicant.playerId,
							playerName:applicant.playerName,
							playerLevel:applicant.playerLevel
						};
					}
					pushMessage(channelData,'onApplyGuild',msg);
				}
			}
		}
	}
};

Guilder.prototype.addInviteeId=function(inviteeId){
	var inviteeIds=this.inviteeIds;
	if (!inviteeIds) {
		inviteeIds={};
		this.inviteeIds=inviteeIds;
	}
	for (var key in inviteeIds) {
		if (guildService.checkHasGuild(inviteeIds[key])) {
			delete inviteeIds[key];
		}
	}
	inviteeIds[inviteeId]=inviteeId;
};

Guilder.prototype.checkHasInviteeId=function(inviteeId){
	if (this.inviteeIds) {
		return !!this.inviteeIds[inviteeId];
	}
};

Guilder.prototype.removeInviteeId=function(inviteeId){
	if (this.inviteeIds) {
		delete this.inviteeIds[inviteeId];
	}
};

Guilder.prototype.getItemsWithCb=function(cb){
	if (this.items) {
		utils.invokeCallback(cb, null, this.items);
		return;
	}
	var self=this;
	guildEquipDao.getDatasByGuildId(this.id,function(err, data) {
		if (err || !data) {
			logger.error("ERROR:Guilder.getItems guildEquipDao.getDatasByGuildId");
			utils.invokeCallback(cb, err);
			return;
		}
		var item;
		var items={};
		for (var i = 0; i < data.length; i++) {
			item=data[i];
			items[item.itemId]=item;
		}
		self.itemCount=data.length;
		self.items=items;
		utils.invokeCallback(cb, null, items);
	});
};

Guilder.prototype.addItem=function(item){
	if (!this.items[item.itemId]) {
		this.itemCount++;
	}
	this.items[item.itemId]=item;
};

Guilder.prototype.removeItem=function(item){
	if (this.items[item.itemId]) {
		this.itemCount--;
		delete this.items[item.itemId];
	}
	if (item.id) {
		deleteGuildEquip(item);
	}
};

Guilder.prototype.guildItem=function(playerId,item){
	var member = this.guildMember[playerId];
	if (!member) {
		return 126;
	}
	if (this.itemCount>42) {
		return 132;
	}
	var build=formula.calItemBuild(item);
	member.build+=build;
	saveGuildMember(member);

	item.guildId=this.id;
	item.itemId=item.id;
	delete item["id"];
	this.addItem(item);

	guildEquipDao.create(item);

	this.addItemAffiche({
		type:GuildAffiche.GETBUILD,
		player:member.name,
		item:item.kindId,
		build:build
	});
	return 200;
};

Guilder.prototype.playerItem=function(member,item,build){
	this.saveMember(member);
	this.removeItem(item);

	this.addItemAffiche({
		type:GuildAffiche.GETEQUIP,
		player:member.name,
		item:item.kindId,
		build:build
	});
};

Guilder.prototype.clearItems=function(itemIds){
	var items=this.items;
	var itemId,item;
	var avaItemIds=[];
	var totalBuild=0;
	for (var i = 0; i < itemIds.length; i++) {
		itemId=itemIds[i];
		item=items[itemId];
		if (item) {
			totalBuild+=formula.calItemBuild(item);
			avaItemIds.push(itemId);
			this.removeItem(item);
		}
	}
	if (totalBuild) {
		this.build+=totalBuild;
		saveGuild(this);
	}
	return avaItemIds;
};

Guilder.prototype.upgrade=function(playerId){
	var member = this.guildMember[playerId];
	if (!member) {
		return 126;
	}
	if(member.jobId!==PlaceTypes.CEO){
		return 122;
	}
	var guildData=dataApi.guild.findById(this.level+1);
	if (!guildData) {
		return 130;
	}
	if (this.count > guildData.capacity) {
		return 127;
	}
	if (this.build < guildData.build) {
		return 128;
	}
	if (this.caoCoin < guildData.caoCoin) {
		return 129;
	}
	this.level++;
	this.build-=guildData.build;
	this.caoCoin-=guildData.caoCoin;
	saveGuild(this);
	return 200;
};

Guilder.prototype.domainSuccess=function(domain){
	utils.myPrint("Guilder.domainSuccess domain =", JSON.stringify(domain));

	this.areaId=domain.areaId;
	var guildTown=domain.guildTown;
	this.caoCoin+=guildTown.caoCoin;

	var content = {
		broadId: 501,
		data: []
	};
	content.data[0] = domain.areaId;

	var member;
	var playerIds=[];
	for (var key in this.guildMember) {
		member=this.guildMember[key];
		playerIds.push(member.playerId);
	}
	utils.myPrint("Guilder.domainSuccess playerIds =", JSON.stringify(playerIds));
	pomelo.app.rpc.chat.chatRemote.sendMail(null, playerIds, content, consts.BLACKHOLEFUNC);
};

Guilder.prototype.domainStart=function(domain){
	this.areaId=0;
};

Guilder.prototype.delaySave = function() {
	pomelo.app.get('sync').exec('guildSync.updateGuild', this.id, this);
};


function pushMessage(channelData,route,msg){
	messageService.pushMessageToPlayer(channelData,route, msg);
}

function saveGuildDesc(guild) {
	guildDao.updateDesc(guild);
}

function saveGuild(guild) {
	guild.delaySave();
	// guildDao.update(guild);
}

function saveGuildMember(guildMember) {
	guildMemberDao.update(guildMember);
}

function deleteGuildMember(guildMember) {
	guildMemberDao.destroy(guildMember.id);
}

function deleteGuildMemberByPlayerId(playerId){
	guildMemberDao.destroyByPlayerId(playerId);
}

function deleteGuildEquip(item) {
	guildEquipDao.destroy(item.id);
}

function deleteGuild(guild) {
	guildDao.destroy(guild.id);
}


/**
 * Get the connector server id assosiated with the uid
 */
var getSidByUid = function(uid) {
  var connector = dispatcher.dispatch(uid, pomelo.app.getServersByType('connector'));
  if(connector) {
    return connector.id;
  }
  return null;
};


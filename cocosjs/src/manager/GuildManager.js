//GuildManager
cb.GuildManager = cc.Class.extend({
	ctor: function() {
		this.guilds=[];
		this.guildIds={};

		this.guildDetails={};
		this.guildMembers={};

		this.requestGetGuildsTime=0;
		this.myGuildMemberTime=0;
		this.requestGetDomainsTime=0;

		this.itemAffiches=[];
		this.guildAffiches=[];

		this.lastItemAffichId=0;
		this.lastGuildAffichId=0;

		this.guildInfos={};
		this.registers={};
	},

	requestItemAffiche:function(){
		guildHandler.itemAffiche(this.lastItemAffichId);
	},

	setItemAffiches: function(data) {
		if (data.length > 0) {
			var record;
			var affiches = this.itemAffiches;
			for (var i = 0; i < data.length; i++) {
				record = data[i];
				if (record.id > this.lastItemAffichId) {
					affiches.push(record);
				}
			}
			if (record) {
				this.lastItemAffichId = record.id;
			}
			while (affiches.length > 8) {
				affiches.shift();
			}
		}
		if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData();
		}
	},

	requestGuildAffiche:function(){
		guildHandler.guildAffiche(this.lastGuildAffichId);
	},

	setGuildAffiches:function(data){
		if (data.length > 0) {
			var record;
			var affiches = this.guildAffiches;
			for (var i = 0; i < data.length; i++) {
				record = data[i];
				if (record.id > this.lastGuildAffichId) {
					affiches.push(record);
				}
			}
			if (record) {
				this.lastGuildAffichId = record.id;
			}
			while (affiches.length > 8) {
				affiches.shift();
			}
		}
		if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData();
		}
	},

	requestJoinGuild:function(playerId,guildId){
		if (!app.getCurPlayer().guildId && guildId) {
			guildHandler.applyGuild(guildId);
		}else{
			guildHandler.inviteGuild(playerId);
		}
	},

	isGuildCaptain:function(){
		if (this.myGuild 
			&& this.myGuild.captainId===app.getCurPlayer().id) {
			return true;
		}
	},

	requestEnterGuild:function(){
		this.myGuild=null;
		guildHandler.enterGuild();
	},

	requestMyGuild:function(){
		this.myGuild=null;
		var guildId=app.getCurPlayer().guildId || 0;
		guildHandler.getGuild(guildId);
	},

	setMyGuild:function(guild){
		var curPlayer=app.getCurPlayer();
		var guildId=0;
		if (guild) {
			var guildData=dataApi.guild.findById(guild.level);
			guild.capacity=guildData.capacity;
			guildId=guild.id;
			if (this.myGuild && this.myGuild.count!==guild.count) {
				delete this.guildMembers[guildId];
			}else{
				var guildMember=this.guildMembers[guildId];
				if (guildMember) {
					for (var i = 0; i < guildMember.length; i++) {
						if (guildMember[i].guildId === guildId) {
							guildMember[i].loginTime = Date.now();
							break;
						}
					}
				}
			}
			this.myGuild=guild;
			// curPlayer.guildId=guildId;
		}else{
			this.myGuild={};
			// curPlayer.guildId=0;
		}
		if (curPlayer.guildId!==guildId) {
			curPlayer.setGuildId(guildId);
		}
		if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.setPanelData(guild);
		}
	},

	setMyGuildDesc:function(desc){
		this.myGuild.desc=desc;
		if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData(0);
		}
	},

	addGuild:function(guild){
		if(!guild || !guild.id) return;
		var oldGuild=this.guildIds[guild.id];
		if (oldGuild) {
			for (var key in guild) {
				oldGuild[key]=guild[key];
			}
			guild=oldGuild;
		}else{
			this.guildIds[guild.id]=guild;
			this.guilds.push(guild);
		}

		var guildData=dataApi.guild.findById(guild.level);
		guild.capacity=guildData.capacity;
	},

	addGuilds: function(data) {
		var originLen=this.guilds.length;
		for (var key in data) {
			this.addGuild(data[key]);
		}
		if (originLen===this.guilds.length) {
			this.hadGetAllGuilds=true;
		}else{
			this.hadGetAllGuilds=false;
		}
		function sortNumber(a, b) {
			return b.caoCoin - a.caoCoin;
		}
		this.guilds.sort(sortNumber);

		if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData();
		}
		this.getGuildsTime=Date.now()+60000*30;
	},

	getGuilds:function(){
		return this.guilds;
	},

	addGuildDetail:function(guildDetail){
		this.guildDetails[guildDetail.id]=guildDetail;
		var guildData=dataApi.guild.findById(guildDetail.level);
		guildDetail.capacity=guildData.capacity;
		var curLayer=layerManager.getRunLayer(cb.kMGuildDetailPanelId);
		if (curLayer) {
			curLayer.updatePanelData();
		}
	},

	getGuildDetail:function(guildId){
		return this.guildDetails[guildId];
	},

	clearGuilds:function(){
		this.guilds=[];
		this.guildIds={};
		this.guildDetails={};
		this.guildMembers={};
		guildManager.requestGetGuilds();
	},

	requestGetGuilds:function(isRefresh){
		var start=0;
		if (isRefresh) {
			if (Date.now()<this.requestGetGuildsTime) {
				return;
			}
			this.requestGetGuildsTime=Date.now()+60000;
			this.guilds=[];
			this.guildIds={};
		}else{
			start=this.guilds.length;
		}
		guildHandler.getGuilds(start);
	},

	getGuildMember:function(guildId,isCurPlayer){
		if (app.getCurPlayer().guildId===guildId) {
			if (Date.now()<this.myGuildMemberTime) {
				return this.guildMembers[guildId];
			}
			this.myGuildMemberTime=Date.now()+60000;
			return;
		}
		return this.guildMembers[guildId];
	},

	requestGetMembers: function(guildId, isCurPlayer) {
		var self=this;
		guildHandler.getMembers(guildId, function(data) {
			data=data || [];
			self.guildMembers[guildId] = data;
			var guild=self.guildIds[guildId];
			if (guild) {
				guild.count=data.length;
			}
			if (isCurPlayer) {
				if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
					var curPanel = layerManager.curPanel;
					curPanel.updatePanelData(1);
				}
			} else {
				var curLayer = layerManager.getRunLayer(cb.kMGuildDetailPanelId);
				if (curLayer) {
					curLayer.updatePanelData();
				}
			}
		});
	},

	addApplyGuild:function(guildId){
		if (!this.applyGuilds) {
			this.applyGuilds={};
		}
		this.applyGuilds[guildId]=guildId;
	},

	chechApplyGuild:function(guildId){
		if (!this.applyGuilds) {
			return false;
		}
		return this.applyGuilds[guildId];
	},

	requestGetItems:function(){
		var itemIds=[];
		var items=this.items;
		for (var key in items) {
			itemIds.push(items[key].itemId);
		}
		guildHandler.getItems(itemIds);
	},

	setItems: function(items) {
		this.items = items;
		if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData();
		}
	},

	addItem:function(item){
		this.items[item.itemId]=item;
		if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData();
		}
	},

	removeItem:function(itemId){
		delete this.items[itemId];
		if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData();
		}
	},

	getItems:function(){
		return this.items;
	},

	requestGuildItem:function(itemId){
		var guildId=app.getCurPlayer().guildId || 0;
		if (!guildId) {
			quickLogManager.pushLog("集团信息出错，请重新进入集团界面!");
			return
		}
		guildHandler.guildItem(guildId, itemId);
	},

	requestPlayerItem:function(item){
		var guildId=app.getCurPlayer().guildId || 0;
		if (!guildId) {
			quickLogManager.pushLog("集团信息出错，请重新进入集团界面!");
			return
		}
		guildHandler.playerItem(guildId, item);
	},

	clearItems:function(itemIds){
		guildHandler.clearItems(itemIds);
	},

	getSalary:function(){
		var guildId=app.getCurPlayer().guildId || 0;
		if (!guildId) {
			quickLogManager.pushLog("集团信息出错，请重新进入集团界面!");
			return
		}
		guildHandler.getSalary(guildId);
	},

	getDomains: function() {
		if (Date.now() < this.requestGetDomainsTime) {
			if (this.domains) {
				return this.domains;
			}
		}
		this.requestGetDomainsTime = Date.now() + 60000;
		guildHandler.getDomains();
	},

	setDomains: function(domains) {
		var domain;
		this.domains = {};
		for (var key in domains) {
			domain=domains[key];
			this.domains[domain.areaId]=domain;
		}
		
		if (layerManager.isRunPanel(cb.kMDomainPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.updatePanelData();
		}
	},

	getGuildInfoByGuildId: function(guildId, playerId) {
		var guildInfos = this.guildInfos;
		if (guildInfos[guildId]) {
			return guildInfos[guildId];
		}
		var registers = this.registers;
		if (!registers[guildId]) {
			registers[guildId] = {};
		}
		registers[guildId][playerId] = playerId;

		guildHandler.getGuildInfo(guildId, function(data) {
			if (data.code === 200) {
				var guildId = data.guildId;
				var guildName = data.name+"集团";
				guildInfos[guildId] = {
					guildId: guildId,
					guildName: guildName
				};
				if (registers[guildId]) {
					var area = app.getCurArea();
					for (var key in registers[guildId]) {
						var playerId = registers[guildId][key];
						var playerEntity = area.getPlayer(playerId);
						playerEntity.showGuildName(guildName);
					}
					delete registers[guildId];
				}
			}
		});
	}
});

var guildManager = new cb.GuildManager();

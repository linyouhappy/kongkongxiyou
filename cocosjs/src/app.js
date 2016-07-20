//require('src/ui/ui.js');

cb.App = cc.Class.extend({
	ctor: function() {
		this._delayTime = 0;

		this.uid = 0;
		this.areaId = 0;
	},

	destroyAllData:function(){
		pomelo.isRuning=false;
		layerManager.clearPanel();
		if (this.area) {
			this.area.destoryAreaData();
			this.area=null;
		}
		soundManager.stopAreaMusic();
		mainPanel=null;

		var entitySpriteMng = cb.EntitySpriteManger.getInstance();
		entitySpriteMng.clearEntitySpriteByType(EntityType.MOB);
	},

	tryEnterScene: function() {
		tipsBoxLayer.showTipsBox("目标场景服务器发生崩溃，需要跳转到其他场景。");
		tipsBoxLayer.yesBtn.setTitleText("默认场景");
		tipsBoxLayer.callback = function() {
			appHandler.loadResource();
			// npcHandler.resetArea();
		};
	},

	init:function(){
		pomelo.isRuning=true;
	},

	setData: function(data) {
		this.areaId = data.areaId;
		var curPlayerData=data.curPlayer;
		delete data["curPlayer"];
		data.curPlayerData=curPlayerData;

		curPlayerData.type=EntityType.PLAYER;
		if (this.curPlayerId!==curPlayerData.id) {
			cc.log("ERROR:playerId is error. curPlayerId="+this.curPlayerId+",id="+curPlayerData.id);
		}

		this.curPlayerData = curPlayerData;
		this.curEntityId=curPlayerData.entityId;

		// var areaData = dataApi.area.findById(this.areaId);
		 this.area = new Area(data);
//		this.area = Area.createArea(data);

		this.area.enterArea();

		if (this.curPlayer) {
			bagManager.getEquipments();
			bagManager.getBagData();
		}
	},

	getCurArea: function() {
		return this.area;
	},

	getCurAreaId:function(){
		return this.areaId;
	},

	getCurPlayer: function() {
		return this.curPlayer;
	},

	isCurPlayer: function(entityId) {
		return entityId === this.curEntityId;
	},

	setServerTime: function(time) {
		if (!time) return;

		this._serverTime = time;
		this._deltaTime = Date.now() - this._serverTime;
	},

	getServerTime: function() {
		return Date.now() - this._deltaTime;
	},

	setDelayTime: function(time) {
		this._delayTime = time;
	},

	getDelayTime: function() {
		return this._delayTime;
	}
});
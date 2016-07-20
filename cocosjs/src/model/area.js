
var Area = function(opts, areaId) {
	this.entities = {};
	
	this.areaId = opts.areaId;
	var areaData = dataApi.area.findById(this.areaId);
	this.areaData = areaData;

	this.areaKind=areaData.kind;
	this.type=areaData.type;
	this.resId=areaData.resId;
	this.areaName=areaData.areaName;
	// this.areaState=opts.areaState;
	// this.guildId=opts.guildId;
	this.playerEntitys = {};
	this.mobEntitys = {};
	this.transportEntitys = {};
	this.itemEntitys = {};
	this.npcEntitys = {};

	this.bullets = {};

	this.isStopped = false;
	this.init(opts);
};

var pro = Area.prototype;


pro.initColorBox = function(){
	this.scene = new AreaScene();
	cc.director.popToRootScene();
	cc.director.replaceScene(this.scene);
};

pro.init = function(opts){
	this.initColorBox();

	this.map = new Map(this,this.scene);
	componentAdder.addClickComponent(this);

	var curPlayerData=opts.curPlayerData;
	if(!curPlayerData) return;

	this.curPlayerId =curPlayerData.id;
	this.curPlayerEntityId=curPlayerData.entityId;
	this.curPlayerData=curPlayerData;

	cc.log("curPlayer====================>>>");
	this.addEntity(curPlayerData);
	cc.log("curPlayer====================>>>");

	var array,entityData;
	for(var key in opts.entities){
		array = opts.entities[key];
		for(var i = 0; i < array.length; i++){
			entityData=array[i];
			entityData.type=Number(key);

			this.addEntity(entityData);
		}
	}
	this.aiManager=new AiManager({area:this});
	this.initTransport();

	var curPlayer=this.curPlayer;
	if(!curPlayer) return;

	this.aiManager.setCharacter(curPlayer);
	this.scene.showPlayer(curPlayer);
};

pro.initTransport = function(){
	try {
		var transports = this.map.mapEntityData.transport;
		var transport, entity, eNode;
		for (var key in transports) {
			transport = transports[key];
			transport.type = EntityType.TRANSPORT;
			entity = new Transport(transport);
			eNode = entity.curNode;
			eNode.setTag(-1);
			this.map.entityNode.addChild(eNode);
			this.transportEntitys[transport.kindId] = entity;
		}
	} catch (err) {
		cc.log("ERROR:pro.init transport:" + err);
		// cc.log("entityData.kindId=" + transport.kindId);
	}
};

pro.enterArea=function(){
	cc.log("enterArea=================>>> areaId=",this.areaId);
	if (this.areaKind === AreaKinds.SAFE_AREA) {
		this.run();
		mainPanel.setQuickChat(false);
	}else if (this.areaKind === AreaKinds.DOMAIN_AREA) {
		this.run();
		// this.occupyValue=0;
  		this.occupyGuildId=0;
  		this.curPlayer.setFightMode(FightMode.GUILDMODE);
	}else if (this.areaKind === AreaKinds.FIGHT_AREA) {
		mainPanel.setQuickChat(false);
		this.setNpcsVisible(false);
		mainPanel.showAreaTips("等待其他玩家进入。。。");
	}else if (this.areaKind === AreaKinds.MY_BOSS_AREA) {
		this.run();
		mainPanel.setQuickChat(false);
	}else if (this.areaKind === AreaKinds.WORLD_BOSS_AREA) {
		this.run();
		mainPanel.setQuickChat(false);
	}
};

pro.run = function(){
	if (this.isRunning) {
		return;
	}
	this.isRunning=true;
	if (this.areaKind === AreaKinds.FIGHT_AREA) {
		mainPanel.showAreaTips(false);
	}

	cc.director.getScheduler().schedule(this.update,this,0, cc.REPEAT_FOREVER, 0, false,"areaScheduler");
	cc.director.getScheduler().schedule(this.updateAI,this,0.1, cc.REPEAT_FOREVER, 0, false,"areaSchedulerAI");
	soundManager.playerAreaMusic(this.areaData.soundId);

	cc.eventManager.setEnabled(true);
};

pro.updateAI=function(delta){
	this.aiManager.update();
}

pro.update=function(delta){
	var key,entity;
	var entitys=this.playerEntitys;
	for (key in entitys) {
		entitys[key].onUpdate(delta);
	}
	entitys=this.mobEntitys;
	for (key in entitys) {
		entitys[key].onUpdate(delta);
	}
	entitys=this.bullets;
	for (key in entitys) {
		entitys[key].onUpdate(delta);
	}
};

pro.addBullet=function(bullet){
	if (!this.bullets[bullet.entityId]) {
		bullet.curNode.setTag(-1);
		this.map.entityNode.addChild(bullet.curNode);
	}
	bullet.area=this;
	this.bullets[bullet.entityId]=bullet;
};

pro.removeBullet=function(bullet){
	this.map.entityNode.removeChild(bullet.curNode);
	delete this.bullets[bullet.entityId];
	for (var key in bullet) {
		delete bullet[key];
	}
};

pro.removeAllItems=function(){
	for (key in this.itemEntitys) {
		var entity=this.itemEntitys[key];
		this.removeEntity(entity.entityId);
	}
};

pro.getEntity = function(entityId){
	return this.entities[entityId];
};

pro.networkErrorRemoveAll=function(){
	var key,entity;
	for (key in this.playerEntitys) {
		entity=this.playerEntitys[key];
		if (this.curPlayerId!==entity.id) {
			this.removeEntity(entity.entityId);
		}
	}
	for (key in this.mobEntitys) {
		entity=this.mobEntitys[key];
		this.removeEntity(entity.entityId);
	}
	for (key in this.itemEntitys) {
		entity=this.itemEntitys[key];
		this.removeEntity(entity.entityId);
	}
};

pro.addEntity = function(entityData) {
	try {
		if (!entityData) return false;
		var entityId = entityData.entityId;
		if (!entityId) return false;

		if (this.entities[entityId]) {
			cc.log("ERROR:entity is exist,entityId=" + entityId);
			return false;
		}
		cc.log("area.addEntity type=" + entityData.type + ",kindId=" + entityData.kindId + ",entityId=" + entityId);

		entityData.scene = this.scene;
		entityData.map = this.map;
		var entity = null;
		switch (entityData.type) {
			case EntityType.PLAYER:
				// this.removePlayer(entityData.id);
				var playerEntity = this.playerEntitys[entityData.id];
				if (playerEntity) {
					var msg = "player in area oldEntityId=" + playerEntity.entityId + ",newEntityId=" + entityData.entityId;
					quickLogManager.pushLog(msg, 4);
					this.removeEntity(playerEntity.entityId);
				}

				if (entityData.id == this.curPlayerId) {
					entityData.area = this;
					entity = new CurPlayer(entityData);
					this.curPlayer = entity;
					app.curPlayer = entity;
				} else {
					entity = new Player(entityData);
					entity.teamId = entityData.teamId;
					this.setFightModeColor(entity);
				}
				entity.setTeamId(entityData.teamId, entityData.isCaptain);
				entity.setGuildId(entityData.guildId);

				this.playerEntitys[entityData.id] = entity;

				break;
			case EntityType.NPC:
				entity = new Npc(entityData);
				this.npcEntitys[entityId] = entity;
				break;
			case EntityType.MOB:
				entityData.area = this;
				if (!entityData.level) {
					var mobZone = this.map.getMobZone(entityData.kindId);
					if (mobZone) {
						entityData.level = mobZone.level || 1;
					} else {
						cc.error("ERROR:area.addEntity opts.kindId=" + entityData.kindId);
						entityData.level = 1;
					}
				}

				entity = new Mob(entityData);
				this.mobEntitys[entityId] = entity;
				if (this.areaKind === AreaKinds.MY_BOSS_AREA) {
					entity.initNameLabel();
					entity.initHpBar();
				}
				break;
			case EntityType.ITEM:
				entity = new Item(entityData);
				this.itemEntitys[entityId] = entity;
				break;
			case EntityType.EQUIPMENT:
				entity = new Equipment(entityData);
				this.itemEntitys[entityId] = entity;
				break;
			default:
				return false;
		}

		entityData.scene = null;
		entityData.map = null;
		entityData.area = null;

		var eNode = entity.curNode;
		eNode.setTag(entityId);
		this.map.entityNode.addChild(eNode);
		this.entities[entityId] = entity;

	} catch (err) {
		cc.log("ERROR:throw error pro.addEntity:" + err);
		cc.log("ERROR:throw error entityData.kindId=" + entityData.kindId);
	}
	return entity;
};

pro.createEntity = function(entityData) {
	try {
		if (!entityData || !entityData.entityId) {
			return false;
		}
		entityData.scene = this.scene;
		entityData.map = this.map;
		// entityData.area=this;
		var entity = null;
		switch (entityData.type) {
			case EntityType.PLAYER:
				entity = new Player(entityData);
				break;
			case EntityType.NPC:
				entity = new Npc(entityData);
				break;
			case EntityType.MOB:
				entity = new Mob(entityData);
				break;
			case EntityType.ITEM:
				entity = new Item(entityData);
				break;
			case EntityType.EQUIPMENT:
				entity = new Equipment(entityData);
				break;
			case EntityType.TRANSPORT:
				entity = new Transport(entityData);
				break;
			default:
				return null;
		}
	} catch (err) {
		cc.log("ERROR:area.createEntity has error" + err);
		// cc.log("entityData=" + JSON.stringify(entityData));
	}
	return entity;
};

pro.removeEntity = function(entityId){
	var entity = this.entities[entityId];
	if(!entity) {
		cc.log("ERROR:removeEntity entity is no exist! entityId="+entityId);
		// this.map.entityNode.removeChild(entity.curNode);
		return true;
	}
	if (entity.type === EntityType.PLAYER) {
		for (var key in this.playerEntitys) {
			if(this.playerEntitys[key].entityId===entityId)
			{
				delete this.playerEntitys[key];
				break;
			}
		}
	} else if (entity.type === EntityType.MOB) {
//		if (entity.died && !this.shadowSprite) {
//			return;
//		}
		delete this.mobEntitys[entityId];
	} else if(entity.type===EntityType.ITEM 
		|| entity.type===EntityType.EQUIPMENT){
		delete this.itemEntitys[entityId];
	} else if (entity.type===EntityType.Npc) {
		delete this.npcEntitys[entityId];
	}
	entity.destory();
	delete this.entities[entityId];
	this.map.entityNode.removeChild(entity.curNode);
	for (var key in entity) {
		delete entity[key];
	}
};

pro.getCurPlayer = function(){
	return this.curPlayer;
};

pro.getPlayer = function(playerId){
	return this.playerEntitys[playerId];
};

pro.removePlayer = function(playerId){
	var playerEntity=this.playerEntitys[playerId];
	if (playerEntity) {
		 this.removeEntity(playerEntity.entityId);
	}
};

pro.destoryObjectsData=function(objects){
	var entity;
	for (var key in objects) {
		entity=objects[key]
		for (var subKey in entity) {
			delete entity[subKey];
		}
	}
};

pro.destoryAreaData=function(){
	// this.aiManager.removeCharacter(character.entityId);
	this.aiManager.setCharacter(null);

	cc.director.getScheduler().unschedule("areaScheduler",this);
	cc.director.getScheduler().unschedule("areaSchedulerAI",this);

	this.destoryObjectsData(this.entities);
	this.destoryObjectsData(this.bullets);
	this.destoryObjectsData(this.transportEntitys);

	for (var key in this.map) {
		delete this.map[key];
	}
	for (var key in this.curPlayer) {
		delete this.curPlayer[key];
	}
	for (var key in this) {
		delete this[key];
	}
};
	
pro.getNearbyItem=function(character){
	var nearDistance=300*300;
	var distance=0;
	var deltaX=0;
	var deltaY=0;
	var entity,nearTarget;
	for (var key in this.itemEntitys) {
		entity=this.itemEntitys[key];
		if(!entity.playerId)
		{
			deltaX=entity.x-character.x;
			deltaY=entity.y-character.y;
			distance=deltaX*deltaX+deltaY*deltaY;
			if(distance<nearDistance)
			{
				nearDistance=distance;
				nearTarget=entity;
			}
		}
	}
	return nearTarget;
};

pro.getNearbyPlayer=function(character){
	var nearDistance = 9999999;
	var entity, nearTarget, deltaX, deltaY, distance;
	for (var key in this.playerEntitys) {
		entity = this.playerEntitys[key];
		if (entity!==character  && !entity.died) {
			deltaX = entity.x - character.x;
			deltaY = entity.y - character.y;
			distance = deltaX * deltaX + deltaY * deltaY;
			if (distance < nearDistance) {
				nearDistance = distance;
				nearTarget = entity;
			}
		}
	}
	return nearTarget;
};

pro.getNearbyMob = function(character) {
	var nearDistance = 9999999;
	var distance = 0;
	var deltaX = 0;
	var deltaY = 0;
	var entity, nearTarget;
	for (var key in this.mobEntitys) {
		entity = this.mobEntitys[key];
		if (!entity.died) {
			deltaX = entity.x - character.x;
			deltaY = entity.y - character.y;
			distance = deltaX * deltaX + deltaY * deltaY;
			if (distance < nearDistance) {
				nearDistance = distance;
				nearTarget = entity;
			}
		}
	}
	return nearTarget;
};

pro.getEntityByDistance=function(entities,target,distance){
	var nearDistance = distance * distance;
	var deltaX = 0;
	var deltaY = 0;
	var entity, nearTarget;
	for (var key in entities) {
		entity = entities[key];
		deltaX = entity.x - target.x;
		deltaY = entity.y - target.y;
		distance = deltaX * deltaX + deltaY * deltaY;
		if (distance < nearDistance) {
			nearDistance = distance;
			nearTarget = entity;
		}
	}
	return nearTarget;
};

pro.setNpcsVisible=function(isVisible){
	for (var key in this.npcEntitys) {
		this.npcEntitys[key].setVisible(isVisible);
	}
};

pro.setTransportVisible=function(isVisible){
	for (var key in this.transportEntitys) {
		this.transportEntitys[key].setVisible(isVisible);
	}
};


pro.getNpcByDistance = function(character, distance) {
	return this.getEntityByDistance(this.npcEntitys,character,distance);
};

pro.getMobByDistance = function(character, distance) {
	return this.getEntityByDistance(this.mobEntitys,character,distance);
};

pro.getItemByDistance = function(character, distance) {
	return this.getEntityByDistance(this.itemEntitys,character,distance);
};
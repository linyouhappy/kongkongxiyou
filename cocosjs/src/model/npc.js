var Npc = function(opts) {
	this.type = EntityType.NPC;
	if (opts.type !== this.type) {
		cc.error("ERROR:Npc opts.kindId=" + opts.kindId);
	}
	var entityData = dataApi.npc.findById(opts.kindId) || {};
	this.entityData = entityData;
	this.skinId = entityData.skinId;

	if (!opts.x) {
		var mapEntityData = opts.map.mapEntityData;
		if (mapEntityData) {
			var npcs = mapEntityData.npc;
			for (var i = 0; i < npcs.length; i++) {
				var npc = npcs[i];
				if (npc.kindId === opts.kindId) {
					opts.x = npc.x;
					opts.y = npc.y;
					break;
				}
			}
		}
	}
	if (!opts.x) {
		opts.x = 0;
		opts.y = 0;
		cc.log("npc no data============>>");
	}

	this.name = entityData.name || "未命名npc";

	this.width = 80;
	this.height = 100;
	this.offsetX = -this.width / 2;
	this.offsetY = 0;

	Entity.call(this, opts);
};

Npc.prototype = Object.create(Entity.prototype);


Npc.prototype.openPanel = function() {
	switch (this.entityData.kindType) {
		case NPCTypes.NORMAL:
			break;
		case NPCTypes.TRANSPORT:

			layerManager.openPanel(cb.kMTransportPanelId, this.entityData);
			return;
		case NPCTypes.FEDERATION:
			layerManager.openPanel(cb.kMFederationPanelId);
			return;
		case NPCTypes.CHALLENGE:
			layerManager.openPanel(cb.kMFightPanelId);
			return;
		case NPCTypes.MARKET:
			layerManager.openPanel(cb.kMMarketPanelId);
			return;
		case NPCTypes.DOMAIN:
			layerManager.openPanel(cb.kMDomainPanelId);
			return;
	}

	var task, tasks = taskManager.tasks;
	var npcTask;
	for (var key in tasks) {
		task = tasks[key];
		if (task.taskState === TaskState.NOT_DELIVERY) {
			if (task.configData.acceptNPC === this.kindId) {
				npcTask = task;
				break;
			}
		} else {
			if (task.configData.finishNPC === this.kindId) {
				npcTask = task;
				break;
			}
		}
	}

	var saying = formula.charaterSaying(this.kindId) || "未配制对白";
	var panelData = {
		plotMsg: saying,
		bustId: this.entityData.bustId,
		isLeftOrRight: true,
		name: this.name,
		npcTask: npcTask,
		isAutoClose: true
	};
	layerManager.openPanel(cb.kMPlotPanelId, panelData);

	if (this.entityData.soundId) {
		soundManager.playEffectSound("sound/npc/"+this.entityData.soundId+".mp3");
	}
};

Npc.prototype.initDecorate = function() {
	this.initNameLabel();

	var shadowSprite = new cc.Sprite("#entity_shadow.png");
	this.curNode.addChild(shadowSprite);

	if (!!this.skinId) {
		// var entitySprite = cb.EntitySprite.create(this.skinId);
		// var entitySprite = cb.EntitySprite.createAnimateSprite(this.skinId,Entity.kMActionAttack, 0.1, 999999);
		var entitySprite = cb.EntitySprite.create(this.skinId);
    // this.curNode.addChild(entitySprite);
		if (entitySprite) {
			entitySprite.singleShow();
			this.curNode.addChild(entitySprite);
			entitySprite.setPosition(0, 50);
			this._entitySprite = entitySprite;
		}else{
			cc.log("ERROR:Npc entitySprite===null this.skinId="+this.skinId);
		}
	}
	if (this.skinId >= 50000) {
		var skinIdData = dataApi.skinId.findById(this.skinId);
		this.infoNode.setPosition(0, skinIdData.infoY);
		this.infoY = skinIdData.infoY;
		entitySprite.setPosition(0, skinIdData.offsetY);
	}else{
		this.infoNode.setPosition(0, 100);
	}
};

// Npc.prototype.setTaskState = function(taskState) {
// 	switch(taskState){
// 		case TaskState.NOT_START:

// 		break;
// 		case TaskState.NOT_COMPLETED:

// 		break;
// 		case TaskState.NOT_DELIVERY:

// 		break;
// 	}
// };
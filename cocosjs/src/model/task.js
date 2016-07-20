

var Task = function(opts) {
	// this.id = opts.id;
	this.kindId = opts.kindId;
	this.targetCount = opts.targetCount;
	var configData = null;
	if (opts.isMainTask) {
		this.taskBranchText = "[主线]";
		this.isMainTask = opts.isMainTask;
		configData = dataApi.task_main.findById(this.kindId);
	} else {
		this.taskBranchText = "[支线]";
		configData = dataApi.task_daily.findById(this.kindId);
	}
	if (!configData) {
		if (this.isMainTask) {
			cc.log("main Task no config data kindId=" + this.kindId);
		} else {
			cc.log("branch Task no config data kindId=" + this.kindId);
		}
		return;
	}
	this.configData = configData;
	this.type = configData.type;
	this.name = configData.name;
	this.setTaskState(opts.taskState);
};

Task.prototype.updateTaskData = function(taskData) {
	this.targetCount = taskData.targetCount;
	if (this.kindId !== taskData.kindId) {
		this.kindId = taskData.kindId;
		var configData = null;
		if (taskData.isMainTask) {
			this.isMainTask = taskData.isMainTask;
			configData = dataApi.task_main.findById(this.kindId);
		} else {
			configData = dataApi.task_daily.findById(this.kindId);
		}
		if (!configData) {
			if (this.isMainTask) {
				cc.log("main Task no config data kindId=" + this.kindId);
			} else {
				cc.log("branch Task no config data kindId=" + this.kindId);
			}
			return;
		}
		this.configData = configData;
		this.name = configData.name;
		this.type = configData.type;

		this.setTaskState(taskData.taskState, true);
	} else {
		this.setTaskState(taskData.taskState);
	}
}

Task.prototype.setTaskState = function(taskState, isForceUpdate) {
	if (!isForceUpdate && this.taskState === taskState) {
		if (taskState === TaskState.NOT_COMPLETED) {
			this.targetCountText = ":" + this.targetCount + "/" + this.configData.targetCount;
		}
		return;
	}
	if (this.isMainTask) {
		if (this.type === TaskType.TALK_NPC
			&& taskState !== TaskState.NOT_START) {
			taskState = TaskState.NOT_DELIVERY;
		}
	}
	this.taskState = taskState;
	delete this["targetCountText"];
	switch (taskState) {
		case TaskState.NOT_START:
			this.stateText = "-未接";
			this.actionText = "      找到：";

			var npcData = dataApi.npc.findById(this.configData.acceptNPC);
			if (npcData) {
				this.targetText = npcData.name;
			} else {
				this.targetText = "未知目标";
			}
			break;

		case TaskState.NOT_COMPLETED:
			this.stateText = "-未完成";
			this.actionText = "      ";
			this.targetText = 0;
			if (this.type === TaskType.KILL_MOB) {
				var mobData = dataApi.character.findById(this.configData.targetId);
				if (mobData) {
					this.targetText = mobData.name;
				}
			} else if (this.type === TaskType.COLLECT) {
				var itemData = dataApi.item.findById(this.configData.targetId);
				if (itemData) {
					this.targetText = itemData.name;
				}
			}

			if (!this.targetText) {
				this.targetText = "未知目标";
			}
			this.targetCountText = ":" + this.targetCount + "/" + this.configData.targetCount;

			break;
		case TaskState.NOT_DELIVERY:
			this.stateText = "-已完成";
			this.actionText = "      领奖：";
			var npcData = dataApi.npc.findById(this.configData.finishNPC);
			if (npcData) {
				this.targetText = npcData.name;
			} else {
				this.targetText = "未知目标";
			}
			break;
	}
};

Task.prototype.getNpcPosition = function(areaId, npcId) {
	var area = dataApi.area.findById(areaId);
	var mapEntity = "mapEntity" + area.pathId;
	if (!config[mapEntity]) {
		require('src/config/' + mapEntity + ".js");
	}
	var mapEntityData = config[mapEntity];
	var npcs = mapEntityData.npc;
	for (var key in npcs) {
		if (npcs[key].kindId === npcId) {
			return npcs[key];
		}
	}
	if (app.areaId === areaId) {
		var npcEntitys = app.getCurArea().npcEntitys;
		for (var key in npcEntitys) {
			if (npcEntitys[key].kindId === npcId) {
				return npcEntitys[key];
			}
		}
		return this.addNPCToArea(npcId);
	}
};

Task.prototype.getMobPosition = function(areaId, mobId) {
	var area = dataApi.area.findById(areaId);
	var mapEntity = "mapEntity" + area.pathId;
	if (!config[mapEntity]) {
		require('src/config/' + mapEntity + ".js");
	}
	var mapEntityData = config[mapEntity];
	var mobs = mapEntityData.mob;
	for (var key in mobs) {
		if (mobs[key].kindId === mobId) {
			return mobs[key];
		}
	}
	return;
};

Task.prototype.resetMoveData = function() {
	this.targetAreaId = 0;
	this.targetX = 0;
	this.targetY = 0;
};

Task.prototype.transferArea=function(areaId){
	this.isRunning=true;
	npcHandler.changeArea(areaId);
};

Task.prototype.continueRunning=function(){
	if (this.isRunning) {
		this.isRunning=false;
		this.moveToTarget();
	}
};

Task.prototype.moveToTarget = function() {
	var targetX = this.targetX;
	var targetY = this.targetY;
	var curPlayer = app.getCurPlayer();
	if (app.areaId !== this.targetAreaId) {
		this.transferArea(this.targetAreaId);
		return;
	}else{
		if (Math.abs(curPlayer.x - targetX) <= 100 && Math.abs(curPlayer.y - targetY) < 100) {
			return true;
		}
	}

	curPlayer.setDirectionByPoint(targetX, targetY);
	var directId = curPlayer.getDirectionId();
	var directPoint = consts.move_dir[directId];

	if (directPoint.y === 0 && directPoint.x === 0) {
		if (targetY >= curPlayer.y) {
			directPoint.y = 1;
		} else {
			directPoint.y = -1;
		}
	}

	var x = targetX - directPoint.x * 40;
	var y = targetY - directPoint.y * 40;

	var map = app.getCurArea().map;
	if (!map.isReachable(x, y)) {
		x = targetX - directPoint.x * 20;
		y = targetY - directPoint.y * 20;
		if (!map.isReachable(x, y)) {
			x = targetX;
			y = targetY
		}
	}
	curPlayer.setMultiAreaMove(this.targetAreaId, x, y);
	mainPanel.showControlPanel();
	return false;
};

Task.prototype.showTask = function(taskState) {
	var taskTalks = "";
	var configData = this.configData;
	var taskTalks;
	if (this.isMainTask) {
		var taskMainTalk = dataApi.task_talkm.findById(this.kindId);
		if (this.taskState===TaskState.NOT_START) {
			taskTalks = taskMainTalk.talks;
			if (!taskTalks) {
				return;
			}
			if (cc.isString(taskTalks)) {
				taskMainTalk.talks = taskTalks.split("||");
				taskTalks = taskMainTalk.talks;
			}
			this.npcData = dataApi.npc.findById(configData.acceptNPC);
		}else{
			taskTalks = taskMainTalk.finishTalks;
			if (!taskTalks) {
				return;
			}
			if (cc.isString(taskTalks)) {
				taskMainTalk.finishTalks = taskTalks.split("||");
				taskTalks = taskMainTalk.finishTalks;
			}
			this.npcData = dataApi.npc.findById(configData.finishNPC);
		}
	}else{
		taskTalks = configData.acceptTalk;
		if (cc.isString(taskTalks)) {
			configData.acceptTalk = taskTalks.split("||");
			taskTalks = configData.acceptTalk;
		}
		this.npcData = dataApi.npc.findById(configData.acceptNPC);
	}

	this.showTalk(taskTalks);

	if (app.areaId === this.targetAreaId) {
		var npcEntitys = app.getCurArea().npcEntitys;
		for (var key in npcEntitys) {
			if (npcEntitys[key].kindId === this.npcData.kindId) {
				var curPlayer = app.getCurPlayer();
				curPlayer.setDirectionByPoint(npcEntitys[key].x, npcEntitys[key].y);
				break;
			}
		}
	}

	if (this.npcData.soundId) {
		soundManager.playEffectSound("sound/npc/"+this.npcData.soundId+".mp3");
	}
	return true;
};

Task.prototype.showTalk = function(taskTalks) {
	if (!taskTalks || taskTalks.length === 0) {
		return;
	}
	var taskTaslk, isLeftOrRight, name, panelData;
	var bustId = 10002;
	var curPlayer = app.getCurPlayer();
	var panelDatas = [];
	for (var i = 0; i < taskTalks.length; i++) {
		taskTaslk = taskTalks[i];

		isLeftOrRight = Number(taskTaslk.substr(0, 1)) === 1;
		taskTaslk = taskTaslk.substr(1);

		if (isLeftOrRight) {
			bustId = curPlayer.entityData.bustId;
			// name = curPlayer.name;
			name = "莓小胖";
		} else {
			bustId = this.npcData.bustId;
			name = this.npcData.name;
		}

		panelData = {
			plotMsg: taskTaslk,
			bustId: bustId,
			isLeftOrRight: isLeftOrRight,
			name: name
		};
		panelDatas.push(panelData);
	};

	var self = this;
	var onPanelCallback = function(isCertain) {
		self.isWorking = false;
		if (isCertain) {
			if (self.taskState===TaskState.NOT_START) {
				self.startTask();
			}else{
				self.showCompleteTask();
			}
		}
	};

	this.isWorking = true;
	var plotsPanel = new cb.PlotsPanel();
	plotsPanel.setLocalZOrder(150);
	mainPanel.addChild(plotsPanel);
	plotsPanel.showPlot(panelDatas, onPanelCallback);
};


Task.prototype.acceptTask = function() {
	if (!this.targetAreaId) {
		var acceptAreaId = this.configData.acceptArea;
		var acceptNPCId = this.configData.acceptNPC;
		var npcData = this.getNpcPosition(acceptAreaId, acceptNPCId);
		if (!npcData) {
			quickLogManager.pushLog("找不到npc数据！" + acceptNPCId);
			return
		}

		this.targetAreaId = acceptAreaId;
		this.targetX = npcData.x;
		this.targetY = npcData.y;
	}
	if (!this.targetAreaId || !this.targetX || !this.targetY)
		return;

	if (this.moveToTarget()) {
		this.askTask();
	}else{
		var taskMainTalk = dataApi.task_talkm.findById(this.kindId);
		if (taskMainTalk.acceptWord && taskMainTalk.acceptWord.length>0) {
			var curPlayer = app.getCurPlayer();
			var taskMessage=new chat.TextMessage();
			taskMessage.parse(taskMainTalk.acceptWord);
			curPlayer.pushMessage(taskMessage,true);
			mainPanel.showControlPanel();

		}
	}
};

Task.prototype.askTask = function() {
	taskHandler.askTask(this);
};

Task.prototype.startTask = function() {
	if (this.type === TaskType.TALK_NPC) {
		this.setTaskState(TaskState.NOT_DELIVERY);
		if (mainPanel) {
			mainPanel.updateTaskDatas();
		}
		this.resetMoveData();
		this.deliverTask();
	} else {
		if (this.configData.targetId) {
			taskHandler.startTask(this);
		}else{
			this.resetMoveData();
			taskManager.updateTaskState(this,TaskState.NOT_DELIVERY);
			this.deliverTask();
		}
	}
};

Task.prototype.workTask = function() {
	if (this.type === TaskType.KILL_MOB || this.type === TaskType.COLLECT) {
		if (!this.targetAreaId) {
			var workAreaId = this.configData.workArea;
			var targetId = this.configData.targetId;
			var mobData = this.getMobPosition(workAreaId, targetId);
			if (!mobData) {
				quickLogManager.pushLog("找不到怪物数据！" + targetId);
				return
			}

			this.targetAreaId = workAreaId;
			this.targetX = mobData.x;
			this.targetY = mobData.y;
		}

		if (!this.targetAreaId || !this.targetX || !this.targetY)
			return;

		if (this.moveToTarget()) {
			this.killMob();
		}else{
			var taskMainTalk = dataApi.task_talkm.findById(this.kindId);
			if (taskMainTalk.gotoWord && taskMainTalk.gotoWord.length>0) {
				var curPlayer = app.getCurPlayer();
				var taskMessage=new chat.TextMessage();
				taskMessage.parse(taskMainTalk.gotoWord);
				curPlayer.pushMessage(taskMessage,true);
				mainPanel.showControlPanel();

			}
		}
	} else {
		cc.log("unknown task============>>");
	}
};

Task.prototype.killMob = function() {
	var curPlayer = app.getCurPlayer();
	curPlayer.enableAI(true);

	var taskMainTalk = dataApi.task_talkm.findById(this.kindId);
	if (taskMainTalk.doWord && taskMainTalk.doWord.length > 0) {
		var curPlayer = app.getCurPlayer();
		var taskMessage = new chat.TextMessage();
		taskMessage.parse(taskMainTalk.doWord);
		curPlayer.pushMessage(taskMessage,true);
		mainPanel.showControlPanel();
	}
};

Task.prototype.deliverTask = function() {
	var curPlayer = app.getCurPlayer();
	curPlayer.enableAI(false);
	if (!this.targetAreaId) {
		var finishAreaId = this.configData.finishArea;
		var finishNPC = this.configData.finishNPC;
		var npcData = this.getNpcPosition(finishAreaId, finishNPC);
		if (!npcData) {
			quickLogManager.pushLog("找不到npc数据！" + finishNPC);
			return
		}

		this.targetAreaId = finishAreaId;
		this.targetX = npcData.x;
		this.targetY = npcData.y;
	}

	if (!this.targetAreaId || !this.targetX || !this.targetY)
		return;

	if (this.moveToTarget()) {
		if(!this.showTask()){
			this.showCompleteTask();
		}
	}else{
		var taskMainTalk = dataApi.task_talkm.findById(this.kindId);
		if (taskMainTalk.deliverWord && taskMainTalk.deliverWord.length > 0) {
			var curPlayer = app.getCurPlayer();
			var taskMessage = new chat.TextMessage();
			taskMessage.parse(taskMainTalk.deliverWord);
			curPlayer.pushMessage(taskMessage, true);
			mainPanel.showControlPanel();
		}
	}
};

Task.prototype.showCompleteTask = function() {
	if (this.kindId === 10) {
		this.completeTask();
		bossHandler.getMyBoss();
		setTimeout(function() {
			var myBossData = dataApi.myboss.findById(1);
			bossHandler.inMyBoss(myBossData.areaId);
		}, 300);
		return;
	}else if (this.kindId===19) {
		this.completeTask();
		bossHandler.getMyBoss();
		setTimeout(function() {
			var myBossData = dataApi.myboss.findById(2);
			bossHandler.inMyBoss(myBossData.areaId);
		}, 300);
	}
	layerManager.openPanel(cb.kMTaskPanelId, this);
};

Task.prototype.completeTask = function() {
	taskHandler.completeTask(this);
};

Task.prototype.doTask = function() {
	this.resetMoveData();
	switch (this.taskState) {
		case TaskState.NOT_START:
			this.acceptTask();
			break;
		case TaskState.NOT_COMPLETED:
			this.workTask();
			break;
		case TaskState.NOT_DELIVERY:
			this.deliverTask();
			break;
//		case TaskState.COMPLETED:
//			this.showCompleteTask();
//			break;
	}
};

Task.prototype.openPanel=function(){
	if (!this.isRunning) {
		layerManager.openPanel(cb.kMTaskPanelId,this);
	}
};

Task.prototype.addNPCToArea = function(npcKindId) {
	var npcEntity = {
		entityId: 99999000+npcKindId,
		kindId: npcKindId,
		type: EntityType.NPC
	};
	if (npcKindId === 50001) {
		npcEntity.x = 500;
		npcEntity.y = 610;
	} else if (npcKindId === 50002) {
		npcEntity.x = 2610;
		npcEntity.y = 2086;
	}else{
		return;
	}
	var area = app.getCurArea();
	return area.addEntity(npcEntity);
};
            
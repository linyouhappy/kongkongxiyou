
var taskHandler={
	getTasks:function(){
		pomelo.request('area.taskHandler.getTasks', {}, function(data) {
			taskManager.setTaskDatas(data);
		});
	},

	askTask:function(task) {
		var msg={};
		if (task.isMainTask) {
			msg.kindId=0;
		}else{
			msg.kindId=task.kindId;
		}
		pomelo.request('area.taskHandler.askTask',msg,function(data) {
			if (data.code === 200) {
				if (data.kindId!==task.kindId) {
					quickLogManager.pushLog("请求的任务id出错！");
					taskManager.destroyData();
					taskManager.getAllTasks();
					return;
				}
				if (data.taskState===TaskState.NOT_START) {
					task.showTask(TaskState.NOT_START);
					return;
				}
				taskManager.updateTaskState(task,data.taskState);
				if (data.taskState===TaskState.COMPLETED){
					quickLogManager.pushLog("任务已完成！");
				}else{
					quickLogManager.pushLog("任务已领取！");
				}
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	startTask:function(task) {
		var msg={};
		if (task.isMainTask)
			msg.kindId=0;
		else
			msg.kindId=task.kindId;

		pomelo.request('area.taskHandler.startTask',msg,function(data) {
			if (data.code === 200) {
				task.resetMoveData();
				taskManager.updateTaskState(task,TaskState.NOT_COMPLETED);
				task.workTask();
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	completeTask:function(task){
		var msg={};
		if (task.isMainTask)
			msg.kindId=0;
		else
			msg.kindId=task.kindId;

		pomelo.request('area.taskHandler.completeTask',msg,function(data) {
			if (data.code === 200) {
				if (task.isMainTask){
					if (!data.kindId) {
						taskManager.removeTask(task.kindId);
					}else{
						var curPlayer=app.getCurPlayer();
						curPlayer.setExperience(curPlayer.experience + task.configData.exp);
        				curPlayer.caoCoin+=task.configData.money;

						data.taskState=TaskState.NOT_START;
						data.targetCount=0;
						data.isMainTask=1;

						if (!data.kindId) {

						}else{
							setTimeout(function() {
								taskManager.setTaskData(data);
							}, 800);
						}

    	 				quickLogManager.expLog(task.configData.exp);
						quickLogManager.getCaoCoinLog(task.configData.money);
						mainPanel.updateCaoCoin();
					}
				}else{
					taskManager.updateTaskState(task,TaskState.COMPLETED);
				}
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	getNewTask:function(params, callback) {
		var playerId = pomelo.playerId;
		pomelo.request('area.taskHandler.getNewTask', {playerId: playerId}, function(result) {
			var tasks = {};
			if (!!result.task) {
				var task = new Task(result.task);
				tasks[task.id] = task;
			}
			callback(tasks);
		});
	}

};





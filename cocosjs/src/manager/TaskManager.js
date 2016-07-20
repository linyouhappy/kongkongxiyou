cb.TaskManager = cc.Class.extend({
	ctor: function() {
		this.tasks={};
	},

	destroyData:function(){
		this.tasks={};
		this.curTask=null;
	},

	getMainTask:function(){
		return this.tasks[0];
	},

	removeMainTask:function(){
		delete this.tasks[0];
	},

	setMainTaskData: function(taskData) {
		var task =this.tasks[0];
		if (task) {
//			cc.log("ERROR:find main task kindId="+task.kindId);
			if (task.kindId !== taskData.kindId) {
//				cc.log("ERROR:big error,find main task kindId is the same");
				cc.log("task.kindId="+task.kindId+"taskData.kindId="+taskData.kindId);
//				cc.log("taskData.kindId="+taskData.kindId);
				task.updateTaskData(taskData);
				this.update(task);
			}else{
				task.updateTaskData(taskData);
			}
		}else{
			task=new Task(taskData);
			this.tasks[0]=task;
			this.update(task);
		}
	},

	setTaskData:function(taskData){
		var kindId=taskData.kindId;
		if (taskData.isMainTask){
			this.setMainTaskData(taskData);
			kindId=0;
		}else{
			var task=this.tasks[kindId];
			if (task) {
				task.updateTaskData(taskData);
			}else{
				this.tasks[kindId]=new Task(taskData);
			}
		}
		if (mainPanel) {
			mainPanel.updateTaskDatas();
		}
		return this.tasks[kindId];
	},

	setTaskDatas:function(taskDatas){
		var tmpTasks=this.tasks;
		var task,taskData;
		for (var key in taskDatas) {
			taskData=taskDatas[key];
			if (taskData.isMainTask) {
				this.setMainTaskData(taskData);
			}else{
				if (tmpTasks[taskData.kindId]) {
					cc.log("ERROR:duplicate kindId,kindId="+taskData.kindId);
				}
				task=new Task(taskData);
				tmpTasks[task.kindId]=task;
			}
		}
		if (mainPanel) {
			mainPanel.updateTaskDatas();
		}
	},

	requestData:function(){
		taskHandler.getTasks();
		this.hasRequest=true;
	},

	getAllTasks:function(){
		// cc.log("taskManager.getAllTasks ==========>>");
		var tasks=[];
		for (var key in this.tasks) {
			tasks.push(this.tasks[key]);
		}
		if (tasks.length===0 && !this.hasRequest) {
			// taskHandler.getTasks();
			this.requestData();
		}
		return tasks;
	},

	setCurTask:function(task){
		this.curTask=task;
	},

	updateTaskState:function(task,taskState){
		if (taskState===TaskState.COMPLETED){
			this.removeTask(task.kindId);
		}else{
			task.setTaskState(taskState);
			if (mainPanel) {
				mainPanel.updateTaskDatas();
			}
		}
	},

	// prepareTask:function(){
	// 	if (!this.curTask) 
	// 		return;
	// 	this.curTask.prepareTask();
	// },

	doTask:function(){
		if (!this.curTask) 
			return;
		this.curTask.doTask();
	},

	continueTask:function(){
		if (!this.curTask) 
			return;

		this.curTask.continueRunning();
	},

	completeTask:function(){
		if (!this.curTask) 
			return;
		this.curTask.completeTask();
	},

	removeTask: function(kindId) {
		for (var key in this.tasks) {
			if(this.tasks[key].kindId===kindId){
				delete this.tasks[key];
				break;
			}
		}
		if (mainPanel) {
			mainPanel.updateTaskDatas();
		}
	},

	keepUpMainTask:function(data){
		if (tutorialManager) {
			tutorialManager.keepUpTutorial(data);
		}
	},

	updateCurTask: function() {
		if (this.curTask && this.curTask.isMainTask) {
			this.update(this.curTask);
		}
	},

	openPanel:function(){
		if (this.curTask && this.curTask.isMainTask) {
			this.curTask.openPanel();
		}
	},

	update: function(mainTask) {
		cc.log("update mainTask:"+JSON.stringify(mainTask));
		var player = app.getCurPlayer();
		if (player.level>18) {
			return;
		}
		// cc.log("taskManager.update runStepKey="+this.runStepKey+" runStepValue="+runStepValue);
		if (mainTask && mainTask.kindId && mainTask.taskState===TaskState.NOT_START) {
			if (!tutorialManager) {
				require('src/ui/TutorialLayer.js');
			}
			tutorialManager.runTutorial(mainTask);
		}
		// if (mainTask.kindId!==1) {
		// 	if (!isShowAds) {
		// 		isShowAds=true;
		// 		var sdkManager = cb.SDKManager.getInstance();
		// 		sdkManager.showAd();
		// 	}
		// }
	}
});

var taskManager = new cb.TaskManager();
var tutorialManager;
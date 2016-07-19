/**
 * Module dependencies
 */

var util = require('util');
var Persistent = require('./../persistent');
var TaskState = require('../../consts/consts').TaskState;
var dataApi = require('../../util/dataApi')
// var taskDao = require('../../dao/taskDao');
var Task = require('./task');

var task_daily = dataApi.task_daily;
//var task_main = dataApi.task_main;

/**
 * Initialize a new 'Task' with the given 'opts'.
 * Task inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */

var Tasks = function(opts) {
	var player = opts.player;
	this.playerId = player.id;
	// this.playerLevel = player.level;
	this.player=player;

	this.taskMain = opts.taskMain;
	this.tasks = {};
	// this.tasks[0]=this.taskMain;
	this.addTask(this.taskMain,0);

	var task;
	var dailyTasks = opts.dailyTasks;
	for (var i = 0; i < dailyTasks.length; i++) {
		task = dailyTasks[i];
		// this.tasks[task.kindId] = task;
		this.addTask(task,task.kindId);
	}
	this.refreshTasks();
};
util.inherits(Tasks, Persistent);

/**
 * Expose 'Tasks' constructor
 */

module.exports = Tasks;

/**
 * Init Tasks information form taskList.
 *
 * @api private
 */
Tasks.prototype.addTask = function(task,kindId) {
	if (!kindId) {
		if (this.taskMain!==task)
			return;
	}
	this.tasks[kindId] = task;
};

Tasks.prototype.refreshTasks = function() {
	var dailyTaskConfigDatas = task_daily.all();
	var configData,task;
	for (var key in dailyTaskConfigDatas) {
		configData = dailyTaskConfigDatas[key];
		if (configData.heroLevel <= this.player.level) {
			if (!this.tasks[configData.id]) {
				task =new Task({
					playerId:this.playerId,
					kindId: configData.id,
					taskState: TaskState.NOT_START
				});
				this.addTask(task,task.kindId);
			}
		}
	}
};

Tasks.prototype.getRefreshTasks = function() {
	var dailyTaskConfigDatas = task_daily.all();
	var configData,task;
	var newTasks=[];
	for (var key in dailyTaskConfigDatas) {
		configData = dailyTaskConfigDatas[key];
		if (configData.heroLevel <= this.player.level) {
			if (!this.tasks[configData.id]) {
				task =new Task({
					playerId:this.playerId,
					kindId: configData.id,
					taskState: TaskState.NOT_START
				});
				this.addTask(task,task.kindId);
				newTasks.push(task.strip());
			}
		}
	}
	return newTasks;
};

Tasks.prototype.strip = function() {
	var taskDatas = [];
	if (this.taskMain && !this.taskMain.finishAll) {
		taskDatas.push(this.taskMain.strip());
	}
	//var todayDate=new Date();
	//var taskDate=new Date();
	var task;
	for (var key in this.tasks) {
		task=this.tasks[key];
		if (task.isMainTask) {
			continue;
		}

		if (task.taskState<TaskState.COMPLETED) {
			taskDatas.push(task.strip());
		}
			// taskDatas.push(task.strip());
		// }else{
		// 	taskDate.setTime(task.startTime);
		// 	if (taskDate.getFullYear()!==todayDate.getFullYear()
		// 		|| taskDate.getMonth()!==todayDate.getMonth()
		// 		|| taskDate.getDate()!==todayDate.getDate()) {

		// 		if (task.taskState<TaskState.COMPLETED) {
		// 			taskDatas.push(task.strip());
		// 		}
		// 	}
		// }
	}
	return taskDatas;
};

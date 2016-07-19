/**
 * Module dependencies
 */

var util = require('util');
var Persistent = require('./../persistent');
var TaskState = require('../../consts/consts').TaskState;
var dataApi = require('../../util/dataApi');
var taskDao = require('../../dao/taskDao');

/**
 * Initialize a new 'Task' with the given 'opts'.
 * Task inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */

var Task = function(opts) {
	this.id = opts.id;
	this.playerId = opts.playerId;
	this.kindId = opts.kindId;
	this.taskState = opts.taskState;
	this.startTime = opts.startTime;
	this.targetCount=opts.targetCount || 0;

	var taskData=dataApi.task_daily.findById(this.kindId);
	this.targetId=taskData.targetId;
	this.totalCount=taskData.targetCount;
	this.type=taskData.type;

	this.checkTime();
};
util.inherits(Task, Persistent);

/**
 * Expose 'Task' constructor
 */

module.exports = Task;

Task.prototype.checkTime = function() {
	if (this.startTime) {
		var todayDate = new Date();
		var taskDate = new Date();
		taskDate.setTime(this.startTime);
		if (taskDate.getFullYear() !== todayDate.getFullYear() 
			|| taskDate.getMonth() !== todayDate.getMonth() 
			|| taskDate.getDate() !== todayDate.getDate()) {

			this.taskState = TaskState.NOT_START;
			this.saveTaskState();
		}
	}
};

// Task.prototype.isComplete = function() {
// 	return true;
// };

/**
 * Init task information form taskList.
 *
 * @api private
 */

Task.prototype.strip = function() {
	return {
		// id: this.id,
		kindId: this.kindId,
		targetCount:this.targetCount,
		taskState: this.taskState
	};
};

Task.prototype.createTask=function(cb){
	taskDao.updateTaskState(this,cb);
};

Task.prototype.saveTaskState = function(cb) {
	taskDao.updateTaskState(this,cb);
};

Task.prototype.saveTaskData = function(cb) {
	taskDao.updateTaskData(this,cb);
};



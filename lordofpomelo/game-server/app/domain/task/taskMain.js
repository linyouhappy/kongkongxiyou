/**
 * Module dependencies
 */

var util = require('util');
var Persistent = require('./../persistent');
var TaskState = require('../../consts/consts').TaskState;
var dataApi = require('../../util/dataApi');
var mainTaskDao = require('../../dao/mainTaskDao');

/**
 * Initialize a new 'TaskMain' with the given 'opts'.
 * Task inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */

var TaskMain = function(opts) {
	this.isMainTask=1;
	this.finishAll=opts.finishAll;
	if (this.finishAll) 
		return;
	
	this.id = opts.id;
	this.playerId = opts.playerId;
	this.kindId = opts.kindId || 1;
	this.taskState = opts.taskState;
	this.startTime = opts.startTime;
	this.targetCount=opts.targetCount || 0;

	var taskMainData=dataApi.task_main.findById(this.kindId);
	this.targetId=taskMainData.targetId;
	this.totalCount=taskMainData.targetCount;
	this.type=taskMainData.type;
};
util.inherits(TaskMain, Persistent);

/**
 * Expose 'TaskMain' constructor
 */

module.exports = TaskMain;

TaskMain.prototype.nextTask = function(cb) {
	var nextKindId=this.kindId+1;

	var timesCount=10;
	var taskMainData;
	while(timesCount>0){
		taskMainData=dataApi.task_main.findById(nextKindId);
		if (taskMainData) {
			break;
		}
		nextKindId=this.kindId+1;
		timesCount--;
	}
	
	if (!taskMainData) {
		this.finishAll=1;
		this.saveFinishMask(cb);
	}else{
		this.kindId = nextKindId;
		this.taskState = TaskState.NOT_START;;
		this.startTime = 0;
		this.targetCount=0;
		this.finishAll=0;
		var taskMainData=dataApi.task_main.findById(this.kindId);
		this.targetId=taskMainData.targetId;
		this.totalCount=taskMainData.targetCount;
		this.type=taskMainData.type;
		
		this.saveTask(cb);
	}
};	

/**
 * Init task information form taskList.
 *
 * @api private
 */

TaskMain.prototype.strip = function() {
	return {
		// id: this.id,
		kindId: this.kindId,
		taskState: this.taskState,
		targetCount:this.targetCount,
		isMainTask: this.isMainTask
	};
};

TaskMain.prototype.saveTask=function(cb){
	mainTaskDao.updateTask(this,cb);
}

TaskMain.prototype.saveFinishMask=function(cb){
	mainTaskDao.updateFinishMask(this,cb);
}

TaskMain.prototype.saveTaskState = function(cb) {
	mainTaskDao.updateTaskState(this,cb);
};

TaskMain.prototype.saveTaskData = function(cb) {
	mainTaskDao.updateTaskData(this,cb);
};


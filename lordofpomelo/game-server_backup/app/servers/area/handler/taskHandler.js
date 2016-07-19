/**
 * Module dependencies
 */

var dataApi = require('../../../util/dataApi');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var taskReward = require('../../../domain/task/taskReward');
var pomelo = require('pomelo');
var underscore = require('underscore');
var TaskState =consts.TaskState;
var EntityType = consts.EntityType;

var taskDao = require('../../../dao/taskDao');
var formula = require('../../../consts/formula');


/**
 * Expose 'Entity' constructor
 */

var handler = module.exports;


handler.getTasks = function(msg, session, next) {
	var player=session.player;
	var tasks=player.tasks.strip();
	next(null, tasks);
};

handler.askTask = function(msg, session, next) {
	var player = session.player;
	var kindId = msg.kindId || 0;
	var tasks = player.tasks;

	var task = tasks.tasks[kindId];
	if (!task) {
		next(null, {
			code: 70
		});
		return;
	}
	next(null, {
		kindId: task.kindId,
		taskState: task.taskState,
		code: 200
	});
};

/**
 * Create and start task.
 * Handle the request from client, and response result to client
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */

handler.startTask = function(msg, session, next) {
	var player=session.player;
	var kindId = msg.kindId;
	var tasks=player.tasks;

	var task = tasks.tasks[kindId];
	if (!task) {
		next(null, {
			code: 70
		});
		return;
	}

	if (!kindId) {
		var taskMain=task;
		if (taskMain.taskState===TaskState.NOT_COMPLETED) {
			next(null, {
				code: 200
			});
			return;
		};

		taskMain.taskState=TaskState.NOT_COMPLETED;
		taskMain.startTime=Date.now();
		taskMain.targetCount=0;
		taskMain.saveTaskState();
		next(null, {
			code: 200
		});

	}else{
		var dailyTask=task;
		if (dailyTask.taskState===TaskState.NOT_COMPLETED) {
			if (dailyTask.id){
				next(null, {
					code: 200
				});
			}
			return;
		};
		dailyTask.taskState=TaskState.NOT_COMPLETED;
		dailyTask.startTime=Date.now();
		if (!dailyTask.id) {
			dailyTask.createTask(function(err,res){
				if (err) {
					next(null, {
						code: 71
					});
				}else{
					dailyTask.id=res.id;
					next(null, {
						code: 200
					});
				}
			});
		}else{
			dailyTask.saveTaskState(function(err,res){
				if (err) {
					next(null, {
						code: 71
					});
				}else{
					dailyTask.id=res.id;
					next(null, {
						code: 200
					});
				}
			});
		}
	}
};

handler.completeTask = function(msg, session, next) {
	var player=session.player;
	var kindId = msg.kindId || 0;
	var tasks=player.tasks;
	var task = tasks.tasks[kindId];
	if (!task) {
		next(null, {
			code: 70
		});
		return;
	}

	if (task.type !==consts.TaskType.TALK_NPC) {
		if (task.taskState < TaskState.NOT_DELIVERY) {
			next(null, {
				code: 73
			});
			return;
		}
	}
	if (task.taskState === TaskState.COMPLETED) {
		next(null, {
			code: 201
		});
		return;
	}

	task.taskState=TaskState.COMPLETED;
	if (task.isMainTask) {
		var taskMainData=dataApi.task_main.findById(task.kindId);
		var taskItems=taskMainData.item;
		if(taskItems) {
			if (typeof taskItems === 'string') {
				taskItems = JSON.parse(taskItems);
				taskMainData.item = taskItems;
			}
			var taskItem, itemData, item;
			for (var i = 0; i < taskItems.length; i++) {
				taskItem = taskItems[i];
				item=formula.taskItemToItem(taskItem,player.jobId);
				// item = {
				// 	kindId: taskItem[0],
				// 	type: taskItem[1]
				// };
				// if (item.type === EntityType.EQUIPMENT) {
				// 	item.percent = 0;
				// 	item.totalStar = 0;
				// 	itemData = dataApi.equipment.findById(item.kindId);

				// 	// item.kind = itemData.kind;
				// 	item.baseValue = itemData.baseValue;
				// 	item.potential = itemData.potential;
				// 	item.count=1;
				// 	item.jobId=player.jobId;
				// } else {
				// 	item.count = taskItem[2];
				// }
				player.addItem(item);
			}
		}

		if (taskMainData.exp) {
			player.addExperience(taskMainData.exp);
		}
		if (taskMainData.money) {
			player.addCaoCoin(taskMainData.money,null,true);
		}

		task.nextTask(function(err,res){
			if (err) {
				next(null, {
					code: 74
				});
			}else{
				var msg={code: 200};
				if (task.finishAll) {
					msg.kindId=0;
				}else{
					msg.kindId=task.kindId;
				}
				next(null, msg);
			}
		})
	}else{
		task.saveTaskState();
		next(null, {
			code: 200
		});
	}
};


/**
 * Handover task and give reward to the player.
 * Handle the request from client, and response result to client
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */

// handler.handoverTask = function(msg, session, next) {
// 	var player = session.player;
// 	var tasks = player.curTasks;
// 	var taskIds = [];
// 	for (var id in tasks) {
// 		var task = tasks[id];
// 		if (task.taskState === TaskState.COMPLETED_NOT_DELIVERY) {
// 			taskIds.push(id);
// 		}
// 	}
// 	taskReward.reward(session.area, player, taskIds);
// 	player.handOverTask(taskIds);
// 	next(null, {
// 		code: consts.MESSAGE.RES,
// 		ids: taskIds
// 	});
// };

/**
 * Get history tasks of the player.
 * Handle the request from client, and response result to client
 *
 * @param {object} msg
 * @param {object} session
 * @param {function} next
 * @api public
 */
// handler.getHistoryTasks = function(msg, session, next) {
// 	var playerId = msg.playerId;
// 	taskDao.getTaskByPlayId(playerId, function(err, tasks) {
// 		if (err) {
// 			logger.error('getHistoryTasks failed!');
// 			next(new Error('fail to get history tasks'));
// 		} else {
// 			var length = tasks.length;
// 			var reTasks = [];
// 			for (var i = 0; i < length; i++) {
// 				var task = tasks[i];
// 				reTasks.push({
// 					acceptTalk: task.acceptTalk,
// 					item: task.item,
// 					name: task.name,
// 					id: task.id,
// 					exp: task.exp,
// 					taskData: task.taskData,
// 					taskState: task.taskState
// 				});
// 			}
// 			next(null, {
// 				code: consts.MESSAGE.RES,
// 				route: 'onGetHistoryTasks',
// 				reTasks: reTasks
// 			});
// 		}
// 	});
// };

/**
 * Get new Task for the player.
 *
 * @param {object} msg
 * @param {object} session
 * @param {function} next
 * @api public
 */

// handler.getNewTask = function(msg, session, next) {
// 	var player = session.area.getPlayer(msg.playerId);
// 	var tasks = player.curTasks;
// 	if (!underscore.isEmpty(tasks)) {
// 		var keysList = underscore.keys(tasks);
// 		keysList = underscore.filter(keysList, function(tmpId) {
// 			var tmpTask = tasks[tmpId];
// 			if (tmpTask.taskState <= consts.TaskState.COMPLETED_NOT_DELIVERY) {
// 				return true;
// 			} else {
// 				return false;
// 			}
// 		});
// 		if (keysList.length > 0) {
// 			var maxId = underscore.max(keysList);
// 			var task = dataApi.task.findById(tasks[maxId].kindId);
// 			if (!task) {
// 				logger.error('getNewTask failed!');
// 				next(new Error('fail to getNewTask!'));
// 			} else {
// 				next(null, {
// 					code: consts.MESSAGE.RES,
// 					task: task
// 				});
// 			}
// 			return;
// 		}
// 	}

// 	var id = 0;
// 	taskDao.getTaskByPlayId(msg.playerId, function(err, tasks) {
// 		if (!!err) {
// 			logger.error('getNewTask failed!');
// 			next(new Error('fail to getNewTask!'));
// 			//do not start task
// 		} else {
// 			var length = tasks.length;
// 			if (length > 0) {
// 				for (var i = 0; i < length; i++) {
// 					if (parseInt(tasks[i].kindId) > id) {
// 						id = parseInt(tasks[i].kindId);
// 					}
// 				}
// 			}
// 			var task = dataApi.task.findById(++id);
// 			next(null, {
// 				code: consts.MESSAGE.RES,
// 				task: task
// 			});
// 		}
// 	});
// };
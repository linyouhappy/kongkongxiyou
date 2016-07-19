/**
 * task Dao, provide many function to operate dataBase
 */
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var mainTaskDao = module.exports;
var Task = require('../domain/task/task');
var consts = require('../consts/consts');
var taskApi = require('../util/dataApi').task;
var utils = require('../util/utils');
var TaskMain=require('../domain/task/taskMain');

mainTaskDao.createMainTaskByPlayId = function(playerId, cb) {
	var sql = 'insert into MainTask (playerId,kindId,finishAll,taskState) values (?,?,?,?)';
	var args = [playerId,1,0,consts.TaskState.NOT_START];
	pomelo.app.get('dbclient').query(sql, args, function(err,res) {
		if (err) {
			logger.error('mainTaskDao.createMainTaskByPlayId for mainTaskDao failed!' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, {
				id: res.insertId
			});
		} 
	});
};

/**
 * get task by playerId 
 * @param {Number} playerId
 * @param {Function} cb
 */
mainTaskDao.getMainTaskByPlayId = function(playerId, cb) {
	var sql = 'select * from MainTask where playerId = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err,res) {
		if (err) {
			logger.error('get tasks by playerId for taskDao failed!' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			if(res.length===0){
				mainTaskDao.createMainTaskByPlayId(playerId,function(err,res){
					if (err) {
						utils.invokeCallback(cb, err);
					}else{
						res.playerId=playerId;
						res.kindId=1;
						res.finishAll=0;
						res.taskState=consts.TaskState.NOT_START;

						var taskMain=new TaskMain(res);
						utils.invokeCallback(cb, null, taskMain);
					}
				});
			}else{
				var taskMain=new TaskMain(res[0]);
				utils.invokeCallback(cb, null,taskMain);
			}
		} 
	});
};


/**
 * update task for id
 * @param {Object} val The update parameters
 * @param {Function} cb
 */
mainTaskDao.updateTaskState = function(taskMain, cb) {
	var sql = 'update MainTask set taskState = ?, startTime = ? where id = ?';
	var args = [taskMain.taskState, taskMain.startTime, taskMain.id];	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (!!err) {
			logger.error('updateTaskState for mainTaskDao failed!' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

mainTaskDao.updateTaskData=function(taskMain,cb){
	var sql = 'update MainTask set targetCount = ? where id = ?';
	var args = [taskMain.targetCount, taskMain.id];	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (!!err) {
			logger.error('updateTaskData for mainTaskDao failed!' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

mainTaskDao.updateFinishMask=function(taskMain,cb){
	var sql = 'update MainTask set finishAll = ? where id = ?';
	var args = [taskMain.finishAll, taskMain.id];	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (!!err) {
			logger.error('updateFinishMask for mainTaskDao failed!' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

mainTaskDao.updateTask=function(taskMain,cb){
	var sql = 'update MainTask set kindId=?,taskState=?,startTime=?,targetCount=?, finishAll = ? where id = ?';
	var args = [taskMain.kindId,taskMain.taskState,taskMain.startTime,taskMain.targetCount,taskMain.finishAll, taskMain.id];	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (!!err) {
			logger.error('updateTask for mainTaskDao failed!' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};


/**
 * destroy task 
 * @param {Number} playerId
 * @param {function} cb
 */
mainTaskDao.destroy = function(playerId, cb) {
	var sql = 'delete from MainTask where playerId = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (!!err) {
			logger.error('destroy MainTask for mainTaskDao failed' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

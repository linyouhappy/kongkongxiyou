var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');
var dataApi = require('../util/dataApi');

var myBossDao = module.exports;

myBossDao.create = function(playerId,cb) {
	var sql = 'insert into MyBoss (playerId) values (?)';
	var args = [playerId];
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('myBossDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, {
				id: res.insertId,
				playerId:playerId
			});
		}
	});
};

myBossDao.getDataByPlayerId=function(playerId,cb){
	var sql = 'select * from MyBoss where playerId = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('myBossDao.getDataByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (!res || res.length===0) {
				myBossDao.create(playerId,function(err, res){
					if (err) {
						logger.error('myBossDao.create failed! ' + err.stack);
						utils.invokeCallback(cb, err, null);
					}else{
						utils.invokeCallback(cb, null, res);
					}
				});
			}else{
				utils.invokeCallback(cb, null, res[0]);
			}
		}
	});
};

myBossDao.update = function(value, cb) {
	var sql = 'update MyBoss set recordTime = ?,times1=?,times2=?,times3=?,times4=?,times5=? where id = ?';
	var args = [value.recordTime, value.times1, value.times2, value.times3, value.times4, value.times5, value.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('myBossDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

// myBossDao.destroy = function(id, cb) {
// 	var sql = 'delete from PlayerBank where id = ?';
// 	var args = [id];
// 	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
// 		if (err) {
// 			logger.error('playerBankDao.destroy failed! ' + err.stack);
// 			utils.invokeCallback(cb, err, null);
// 		} else {
// 			utils.invokeCallback(cb, err, res);
// 		}
// 	});
// };
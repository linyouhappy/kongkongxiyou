var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
// var equipApi = require('../util/dataApi').equipment;
var utils = require('../util/utils');
// var dataApi = require('../util/dataApi');
var userDao = require('./userDao');
var fightDao = module.exports;

fightDao.create = function(playerId, cb) {
	userDao.getKindIdByPlayerId(playerId, function(err, player) {
		if (err) {
			logger.error('fightDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
			return;
		}
		var sql = 'insert into Fight (playerId,kindId,name) values (?,?,?)';
		var args = [playerId,player.kindId,player.name];

		pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
			if (err) {
				logger.error('fightDao.create failed! ' + err.stack);
				utils.invokeCallback(cb, err, null);
			} else {
				utils.invokeCallback(cb, null, {
					id: res.insertId,
					kindId:player.kindId,
					playerId:playerId,
					name:player.name
				});
			}
		});
	});
};

fightDao.getDataByPlayerId=function(playerId,cb){
	var sql = 'select * from Fight where playerId = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('fightDao.getDataByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (!res || res.length===0) {
				fightDao.create(playerId,function(err, res){
					if (err) {
						logger.error('fightDao.getDataByPlayerId failed! ' + err.stack);
						utils.invokeCallback(cb, err, null);
					}else{
  						res.time=0;
						res.count=0;
						utils.invokeCallback(cb, null, res);
					}
				});
			}else{
				utils.invokeCallback(cb, null, res[0]);
			}
		}
	});
};

fightDao.update = function(value, cb) {
	var sql = 'update Fight set time = ?,count=? where id = ?';
	var args = [value.time, value.count, value.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('fightDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};


var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

var rechargeInfoDao = module.exports;


rechargeInfoDao.create = function(player,buyId,rmb, cb) {
	var sql = 'insert into RechargeInfo (userId,playerName,playerId,buyId,rmb,recordTime) values (?,?,?,?,?,?)';
	var args = [player.userId,player.name,player.id,buyId,rmb,Date.now()];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('rechargeInfoDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, {
				id: res.insertId,
			});
		}
	});
};

rechargeInfoDao.getDataByPlayerId=function(playerId,cb){
	var sql = 'select * from VipInfo where playerId = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('rechargeInfoDao.getDataByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (!res || res.length===0) {
				utils.invokeCallback(cb,null);
			}else{
				utils.invokeCallback(cb, null, res[0]);
			}
		}
	});
};



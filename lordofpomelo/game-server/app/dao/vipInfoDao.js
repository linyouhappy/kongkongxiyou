var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

var vipInfoDao = module.exports;

vipInfoDao.create = function(playerId, cb) {
	var sql = 'insert into VipInfo (playerId) values (?)';
	var args = [playerId];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('vipInfoDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, {
				id: res.insertId,
				playerId: playerId,
				giftMask: 0,
				rmb: 0
			});
		}
	});
};

vipInfoDao.getDataByPlayerId=function(playerId,cb){
	var sql = 'select * from VipInfo where playerId = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('vipInfoDao.getDataByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (!res || res.length===0) {
				vipInfoDao.create(playerId,function(err, res){
					if (err) {
						logger.error('vipInfoDao.getDataByPlayerId failed! ' + err.stack);
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

vipInfoDao.update = function(value, cb) {
	var sql = 'update VipInfo set rmb = ?,giftMask=? where id = ?';
	var args = [value.rmb, value.giftMask, value.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('vipInfoDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};


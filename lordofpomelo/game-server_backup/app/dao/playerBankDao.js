var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var equipApi = require('../util/dataApi').equipment;
// var Equipment = require('../domain/entity/equipment');
var utils = require('../util/utils');
// var EntityType = require('../consts/consts').EntityType;
var dataApi = require('../util/dataApi');
var PlayerBank = require('../domain/playerBank');

var playerBankDao = module.exports;

playerBankDao.create = function(playerId,cb) {
	var sql = 'insert into PlayerBank (playerId) values (?)';
	var args = [playerId];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('playerBankDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, {
				id: res.insertId
			});
		}
	});
};

playerBankDao.getPlayerBank=function(playerId,cb){

	var sql = 'select * from PlayerBank where playerId = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerBankDao.getTenMarketItems failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (!res || res.length===0) {
				playerBankDao.create(playerId,function(err, res){
					if (err) {
						logger.error('playerBankDao.create failed! ' + err.stack);
						utils.invokeCallback(cb, err, null);
					}else{
						var playerBank=new PlayerBank(res);
						utils.invokeCallback(cb, null, playerBank);
					}
				});
			}else{
				var playerBank=new PlayerBank(res[0]);
				utils.invokeCallback(cb, null, playerBank);
			}
		}
	});
};

playerBankDao.getMarketItemsByPlayerId=function(playerId,cb){
	var sql = 'select * from PlayerBank where playerId=?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerBankDao.getMarketItemsByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

playerBankDao.update = function(value, cb) {
	var sql = 'update PlayerBank set inCaoCoin = ?,outCaoCoin=?,caoCoin=? where id = ?';
	var args = [value.inCaoCoin, value.outCaoCoin, value.caoCoin, value.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerBankDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

playerBankDao.destroy = function(id, cb) {
	var sql = 'delete from PlayerBank where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerBankDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};
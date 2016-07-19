var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

var utils = require('../util/utils');
var EntityType = require('../consts/consts').EntityType;
var dataApi = require('../util/dataApi');

var marketItemDao = module.exports;

marketItemDao.create = function(marketItem,cb) {
	var sql = 'insert into MarketItem (playerId,kindId,count) values (?,?,?)';
	var args = [marketItem.playerId, marketItem.kindId, marketItem.count];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('marketItemDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			marketItem.id=res.insertId;
			utils.invokeCallback(cb, null, {
				id: res.insertId
			});
		}
	});
};

marketItemDao.getMarketItemsByPlayerId=function(playerId,cb){
	var sql = 'select * from MarketItem where playerId=?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketItemDao.getMarketItemsByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

marketItemDao.update = function(value, cb) {
	var sql = 'update MarketItem set kindId=?,count = ? where id = ?';
	var args = [value.kindId, value.count, value.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerBankDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

marketItemDao.destroy = function(id, cb) {
	var sql = 'delete from MarketItem where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketItemDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

var utils = require('../util/utils');
var EntityType = require('../consts/consts').EntityType;
var dataApi = require('../util/dataApi');

var marketSellItemDao = module.exports;

marketSellItemDao.createItem = function(sellItem, cb) {
	var sql = 'insert into MarketSellItem (playerId,kindId,price,count) values (?,?,?,?)';
	var args = [sellItem.playerId, sellItem.kindId, sellItem.price, sellItem.count];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('marketSellItemDao.createItem failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, {
				id: res.insertId
			});
		}
	});
};

marketSellItemDao.getAllMarketItems=function(kindId,cb){
	var sql = 'select * from MarketSellItem where kindId = ? LIMIT 100';
	var args = [kindId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketSellItemDao.getAllMarketItems failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

marketSellItemDao.getTopMarketItems = function(state, kindId, cb) {
	var sql = 'select * from MarketSellItem where state=? and kindId = ? ORDER BY price ASC LIMIT 100';
	var args = [state, kindId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketSellItemDao.getTenMarketItems failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

marketSellItemDao.getMarketItemsByPlayerId=function(playerId,cb){
	var sql = 'select * from MarketSellItem where playerId=?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketBuyItemDao.getMarketItemsByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

marketSellItemDao.update = function(sellItem, cb) {
	var sql = 'update MarketSellItem set state = ?,count=?,caoCoin=? where id = ?';
	var args = [sellItem.state, sellItem.count, sellItem.caoCoin, sellItem.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketSellItemDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

marketSellItemDao.destroy = function(id, cb) {
	var sql = 'delete from MarketSellItem where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketSellItemDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

var utils = require('../util/utils');
var EntityType = require('../consts/consts').EntityType;
var dataApi = require('../util/dataApi');

var marketBuyItemDao = module.exports;


marketBuyItemDao.createItem = function(buyItem,cb) {
	// if (!item.name) {
	// 	var itemData = dataApi.item.findById(item.kindId);
	// 	if (itemData)
	// 		item.name = itemData.name || "未知名";
	// 	else
	// 		item.name = "未知名";
	// }
	var sql = 'insert into MarketBuyItem (playerId,kindId,price,caoCoin,buyCount) values (?,?,?,?,?)';
	var args = [buyItem.playerId, buyItem.kindId, buyItem.price, buyItem.caoCoin, buyItem.buyCount];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('marketBuyItemDao.createItem failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, {
				id: res.insertId
			});
		}
	});
};

marketBuyItemDao.getAllMarketItems=function(kindId,cb){
	var sql = 'select * from MarketBuyItem where kindId = ? LIMIT 100';
	var args = [kindId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketBuyItemDao.getAllMarketItems failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

marketBuyItemDao.getTopMarketItems=function(state,kindId,cb){
	var sql = 'select * from MarketBuyItem where state=? and kindId = ? ORDER BY price DESC LIMIT 100';
	var args = [state,kindId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketBuyItemDao.getTenMarketItems failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

marketBuyItemDao.getMarketItemsByPlayerId=function(playerId,cb){
	var sql = 'select * from MarketBuyItem where playerId=?';
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

marketBuyItemDao.update = function(buyItem, cb) {
	var sql = 'update MarketBuyItem set state = ?,caoCoin=?,buyCount=?,getCount=? where id = ?';
	var args = [buyItem.state, buyItem.caoCoin, buyItem.buyCount, buyItem.getCount, buyItem.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketBuyItemDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

marketBuyItemDao.destroy = function(id, cb) {
	var sql = 'delete from MarketBuyItem where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('marketBuyItemDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};
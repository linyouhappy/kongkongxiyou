var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var equipApi = require('../util/dataApi').equipment;
// var Equipment = require('../domain/entity/equipment');
var utils = require('../util/utils');
var EntityType = require('../consts/consts').EntityType;
var dataApi = require('../util/dataApi');

var itemDao = module.exports;

/**
 * Create equipment
 *
 * @param {Number} playerId Player id. 
 * @param {function} cb Callback function
 */
itemDao.createItem = function(item, cb) {
	if (item.type !== EntityType.ITEM) {
		var err = "What are you doing? no item!";
		utils.invokeCallback(cb, err, null);
		return;
	}
	// if (!item.name) {
	// 	var itemData = dataApi.item.findById(item.kindId);
	// 	if (itemData)
	// 		item.name = itemData.name || "未知名";
	// 	else
	// 		item.name = "未知名";
	// }
	var sql = 'insert into Item (playerId,kindId,count) values (?,?,?)';
	var args = [item.playerId, item.kindId, item.count];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('itemDao.createItem failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			item.id=res.insertId;
			utils.invokeCallback(cb, null, item);
		}
	});
};

/**
 * Get player's item by playerId
 *
 * @param {Number} playerId 
 * @param {funciton} cb 
 */
itemDao.getAllItemsByPlayerId = function(playerId, cb) {
	var sql = 'select * from Item where playerId = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('itemDao.getAllItemByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Updata item
 * @param {Object} val Update params, in a object.
 * @param {function} cb
 */
itemDao.updatePosition = function(val, cb) {
	var sql = 'update Item set position = ? where id = ?';
	var args = [val.position, val.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('itemDao.updatePosition failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

itemDao.updateCount = function(val, cb) {
	var sql = 'update Item set count = ? where id = ?';
	var args = [val.count, val.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('itemDao.updateCount failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * destroy item
 *
 * @param {number} playerId
 * @param {function} cb
 */
itemDao.destroy = function(id, cb) {
	var sql = 'delete from Item where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('itemDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};
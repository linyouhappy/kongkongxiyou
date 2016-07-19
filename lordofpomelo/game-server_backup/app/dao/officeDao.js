var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
// var equipApi = require('../util/dataApi').equipment;
// var Equipment = require('../domain/entity/equipment');
var utils = require('../util/utils');
// var EntityType = require('../consts/consts').EntityType;
// var dataApi = require('../util/dataApi');

var officeDao = module.exports;

/**
 * Create equipment
 *
 * @param {Number} playerId Player id. 
 * @param {function} cb Callback function
 */
// officeDao.createItem = function(item, cb) {
// 	var sql = 'insert into Item (playerId,kindId,count) values (?,?,?)';
// 	var args = [item.playerId, item.kindId, item.count];

// 	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
// 		if (err) {
// 			logger.error('itemDao.createItem failed! ' + err.stack);
// 			utils.invokeCallback(cb, err, null);
// 		} else {
// 			item.id=res.insertId;
// 			utils.invokeCallback(cb, null, item);
// 		}
// 	});
// };

/**
 * Get player's item by playerId
 *
 * @param {Number} playerId 
 * @param {funciton} cb 
 */
officeDao.getAllOffices = function(cb) {
	var sql = 'select * from Office';
	var args = [];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('officeDao.getAllOffices failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

officeDao.update = function(val, cb) {
	var sql = 'update Office set time = ?,playerId = ?,name = ?,kindId = ?,state=?,support = ?,oppose=?,startTime=? where id = ?';
	var args = [val.time,val.playerId,val.name,val.kindId,val.state,val.support,val.oppose,val.startTime,val.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('officeDao.update failed! ' + err.stack);
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
// officeDao.destroy = function(id, cb) {
// 	var sql = 'delete from Item where id = ?';
// 	var args = [id];
// 	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
// 		if (err) {
// 			logger.error('itemDao.destroy failed! ' + err.stack);
// 			utils.invokeCallback(cb, err, null);
// 		} else {
// 			utils.invokeCallback(cb, err, res);
// 		}
// 	});
// };
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

var domainDao = module.exports;

/**
 * Create Guild
 *
 * @param {Number} playerId Player id. 
 * @param {function} cb Callback function
 */
 
// domainDao.create = function(value, cb) {
// 	var sql = 'insert into Guild (name,level,caoCoin,captainId,captainName) values (?,?,?,?,?)';
// 	var args = [value.name, value.level, value.caoCoin, value.captainId, value.captainName];
// 	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
// 		if (err) {
// 			logger.error('guildDao.create failed! ' + err.stack);
// 			utils.invokeCallback(cb, err, null);
// 		} else {
// 			value.id=res.insertId;
// 			utils.invokeCallback(cb, null, value);
// 		}
// 	});
// };

domainDao.getAllDatas = function(cb) {
	var sql = 'select * from Domain';
	var args = [];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildDao.getAllDatas failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

domainDao.getDataByAreaId = function(areaId,cb) {
	var sql = 'select * from Domain where areaId = ?';
	var args = [areaId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('domainDao.getDataByAreaId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res[0]);
		}
	});
};

domainDao.update = function(value, cb) {
	var sql = 'update Domain set level=?,guildId=? where id = ?';
	var args = [value.level, value.guildId, value.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('domainDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};


/**
 * destroy 
 *
 * @param {function} cb
 */
// domainDao.destroy = function(id, cb) {
// 	var sql = 'delete from Guild where id = ?';
// 	var args = [id];
// 	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
// 		if (err) {
// 			logger.error('guildDao.destroy failed! ' + err.stack);
// 			utils.invokeCallback(cb, err, null);
// 		} else {
// 			utils.invokeCallback(cb, err, res);
// 		}
// 	});
// };

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
// var equipApi = require('../util/dataApi').equipment;
// var Equipment = require('../domain/entity/equipment');
var utils = require('../util/utils');
// var EntityType = require('../consts/consts').EntityType;
// var dataApi = require('../util/dataApi');
var candidateDao = module.exports;

/**
 * Create equipment
 *
 * @param {Number} playerId Player id. 
 * @param {function} cb Callback function
 */
candidateDao.create = function(value, cb) {
	var sql = 'insert into Candidate (playerId,name,kindId,officeId) values (?,?,?,?)';
	var args = [value.playerId,value.name, value.kindId, value.officeId];
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('candidateDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			value.id=res.insertId;
			utils.invokeCallback(cb, null, value);
		}
	});
};

/**
 * Get player's item by playerId
 *
 * @param {Number} playerId 
 * @param {funciton} cb 
 */
candidateDao.getAllDatas = function(cb) {
	var sql = 'select * from Candidate';
	var args = [];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('candidateDao.getAllDatas failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

candidateDao.update = function(val, cb) {
	var sql = 'update Candidate set playerId = ?,name = ?,kindId = ?,voteCount=? where officeId=? and id = ?';
	var args = [val.playerId,val.name,val.kindId,val.voteCount,val.officeId,val.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('candidateDao.update failed! ' + err.stack);
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
candidateDao.destroy = function(id, cb) {
	var sql = 'delete from Candidate where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('candidateDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};
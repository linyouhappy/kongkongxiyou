var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

var guildDao = module.exports;

/**
 * Create Guild
 *
 * @param {Number} playerId Player id. 
 * @param {function} cb Callback function
 */
guildDao.create = function(value, cb) {
	var sql = 'insert into Guild (name,level,caoCoin,captainId,captainName) values (?,?,?,?,?)';
	var args = [value.name, value.level, value.caoCoin, value.captainId, value.captainName];
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('guildDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			value.id=res.insertId;
			utils.invokeCallback(cb, null, value);
		}
	});
};

guildDao.getAllDatas = function(cb) {
	var sql = 'select * from Guild';
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

guildDao.getTopDatas = function(cb) {
	var sql = 'select * from Guild ORDER BY caoCoin DESC LIMIT 100';
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

guildDao.getDataById = function(id,cb) {
	var sql = 'select * from Guild where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildDao.getDataById failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res[0]);
		}
	});
};


guildDao.update = function(value, cb) {
	var sql = 'update Guild set level=?,caoCoin=?,salary=?,build=? where id = ?';
	var args = [value.level, value.caoCoin, value.salary,value.build,value.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

guildDao.updateDesc = function(value, cb) {
	var sql = 'update Guild set `desc`=? where id = ?';
	var args = [value.desc,value.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildDao.updateDesc failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

guildDao.updateAreaId = function(value, cb) {
	var sql = 'update Guild set `areaId`=? where id = ?';
	var args = [value.areaId,value.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildDao.updateAreaId failed! ' + err.stack);
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
guildDao.destroy = function(id, cb) {
	var sql = 'delete from Guild where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

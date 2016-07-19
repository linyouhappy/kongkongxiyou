var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');


var guildMemberDao = module.exports;

/**
 * Create 
 *
 * @param {Number} playerId Player id. 
 * @param {function} cb Callback function
 */
guildMemberDao.create = function(value, cb) {
	guildMemberDao.destroyByPlayerId(value.playerId);
	var sql = 'insert into GuildMember (playerId,name,guildId,jobId,loginTime) values (?,?,?,?,?)';
	var args = [value.playerId, value.name,value.guildId, value.jobId, value.loginTime];
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('guildMemberDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			value.id = res.insertId;
			utils.invokeCallback(cb, null, value);
		}
	});
};

guildMemberDao.getDataByPlayerId= function(playerId, cb) {
	var sql = 'select * from GuildMember where playerId = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildMemberDao.getDataByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res[0]);
		}
	});
};

guildMemberDao.getDataByGuildId= function(guildId, cb) {
	var sql = 'select * from GuildMember where guildId = ?';
	var args = [guildId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildMemberDao.getDataByGuildId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

guildMemberDao.update = function(value, cb) {
	var sql = 'update GuildMember set loginTime=?,jobId=?,level=?,guildId=?,build=?,salaryTime=? where id = ?';
	var args = [value.loginTime, value.jobId, value.level, value.guildId, value.build,value.salaryTime,value.id];
	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildMemberDao.update failed! ' + err.stack);
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
guildMemberDao.destroy = function(id, cb) {
	var sql = 'delete from GuildMember where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildMemberDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

guildMemberDao.destroyByPlayerId = function(playerId, cb) {
	var sql = 'delete from GuildMember where playerId = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildMemberDao.destroyByPlayerId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};
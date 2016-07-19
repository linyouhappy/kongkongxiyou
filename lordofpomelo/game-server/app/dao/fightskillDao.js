var fightskill = require('../domain/fightskill');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

var fightskillDao = module.exports;

/**
 * Add a new fight skill
 *
 * @param {Number} playerId 
 * @param {function} cb 
 */
fightskillDao.add = function(skill, cb) {
	var sql = 'insert into FightSkill (playerId, skillId, level, type,position) values (?, ?, ?, ?, ?)';
	var args = [skill.playerId, skill.skillId, skill.level, skill.type, skill.position];

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error(err.message);
			utils.invokeCallback(cb, err);
		} else {
			skill.id = res.insertId;
			var fightSkill = fightskill.create(skill);
			utils.invokeCallback(cb, null, fightSkill);
		}
	});
};

fightskillDao.getSQLAllFightSkillsByPlayerId = function(playerId, cb) {
	var sql = 'select * from FightSkill where playerId = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Update fight skill
 * @param val {Object} Update params, contains level and skill id
 */
fightskillDao.update = function(val, cb) {
	var sql = 'update FightSkill set level = ?,position=? where id = ?';
	var args = [val.level, val.position, val.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('write mysql failed!　' + sql + ' ' + JSON.stringify(val));
		} else {
			logger.info('write mysql success! flash dbok ' + sql + ' ' + JSON.stringify(val));
		}
		utils.invokeCallback(cb, !!err);
	});
};

/**
 * Find fightskills by playerId
 *
 * @param {Number} playerId 
 * @param {function} cb 
 */
fightskillDao.getFightSkillsByPlayerId = function(playerId, cb) {
	var sql = 'select * from FightSkill where playerId = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			utils.invokeCallback(cb, err);
		} else {
			var fightSkill,fightSkills = [];
			for (var i = 0; i<res.length; i++){
				fightSkill = fightskill.create(res[i]);
				fightSkills.push(fightSkill);
			}
			utils.invokeCallback(cb, null, fightSkills);
		}
	});
};

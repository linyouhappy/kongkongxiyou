var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');


var guildEquipDao = module.exports;

/**
 * Create
 *
 * @param {function} cb Callback function
 */
guildEquipDao.create = function(value, cb) {
	var sql = 'insert into GuildEquip (guildId,itemId,kindId,jobId,baseValue,potential,percent,totalStar,star1,star2,star3,star4,star5,star6,star7,star8,star9,star10,star11,star12) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	var args = [value.guildId,value.itemId,value.kindId,value.jobId,value.baseValue,value.potential,value.percent,value.totalStar,value.star1,value.star2,value.star3,value.star4,value.star5,value.star6,value.star7,value.star8,value.star9,value.star10,value.star11,value.star12];
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('guildEquipDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			value.id=res.insertId;
			utils.invokeCallback(cb, null, value);
		}
	});
};

guildEquipDao.getDataByItemId= function(itemId, cb) {
	var sql = 'select * from GuildEquip where itemId = ?';
	var args = [itemId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildEquipDao.getDataByItemId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res[0]);
		}
	});
};

guildEquipDao.getDatasByGuildId= function(guildId, cb) {
	var sql = 'select * from GuildEquip where guildId = ?';
	var args = [guildId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildEquipDao.getDatasByGuildId failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

// guildEquipDao.update = function(value, cb) {
// 	var sql = 'update GuildEquip set doCaoCoin=?,voteCaoCoin = ?,voteYCaoCoin=?,voteTCaoCoin=?,dailyCaoCoin=?,recordTime=? where id = 1';
// 	var args = [value.doCaoCoin, value.voteCaoCoin, value.voteYCaoCoin,value.voteTCaoCoin,value.dailyCaoCoin,value.recordTime];

// 	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
// 		if (err) {
// 			logger.error('guildEquipDao.update failed! ' + err.stack);
// 			utils.invokeCallback(cb, err, null);
// 		} else {
// 			utils.invokeCallback(cb, err, res);
// 		}
// 	});
// };


/**
 * destroy 
 *
 * @param {function} cb
 */
guildEquipDao.destroy = function(id, cb) {
	var sql = 'delete from GuildEquip where id = ?';
	var args = [id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('guildEquipDao.destroy failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

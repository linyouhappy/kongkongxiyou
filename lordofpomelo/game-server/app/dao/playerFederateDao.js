var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var equipApi = require('../util/dataApi').equipment;
// var Equipment = require('../domain/entity/equipment');
var utils = require('../util/utils');
// var EntityType = require('../consts/consts').EntityType;
var dataApi = require('../util/dataApi');
var userDao = require('./userDao');

var playerFederateDao = module.exports;

playerFederateDao.create = function(playerId, cb) {
	userDao.getKindIdByPlayerId(playerId, function(err, player) {
		if (err) {
			logger.error('playerFederateDao.create failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
			return;
		}
		var sql = 'insert into PlayerFederate (playerId,kindId,name) values (?,?,?)';
		var args = [playerId,player.kindId,player.name];

		pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
			if (err) {
				logger.error('playerFederateDao.create failed! ' + err.stack);
				utils.invokeCallback(cb, err, null);
			} else {
				utils.invokeCallback(cb, null, {
					id: res.insertId,
					playerId:playerId,
					kindId:player.kindId,
					name:player.name
				});
			}
		});
	});
};

playerFederateDao.getPlayerFederate=function(playerId,cb){
	var sql = 'select * from PlayerFederate where playerId = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerFederateDao.getPlayerFederate failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (!res || res.length===0) {
				playerFederateDao.create(playerId,function(err, res){
					if (err) {
						logger.error('playerFederateDao.create failed! ' + err.stack);
						utils.invokeCallback(cb, err, null);
					}else{
						// res.playerId=playerId;
						res.caoCoin=0;
						res.voteCount=0;
						utils.invokeCallback(cb, null, res);
					}
				});
			}else{
				utils.invokeCallback(cb, null, res[0]);
			}
		}
	});
};

playerFederateDao.getTopPlayerFederates = function(cb) {
	var sql = 'select * from PlayerFederate ORDER BY caoCoin DESC LIMIT 20';
	var args = [];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerFederateDao.getPlayerFederate failed! ' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

playerFederateDao.getOfficerFederates = function(cb) {
	var sql = 'select * from PlayerFederate where officer>0 ORDER BY officer ASC';
	var args = [];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerFederateDao.getOfficerFederates failed! ' + err.stack);
			utils.invokeCallback(cb, err);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

playerFederateDao.update = function(value, cb) {
	var sql = 'update PlayerFederate set caoCoin = ?,voteCount=?,receiveTime=? where id = ?';
	var args = [value.caoCoin, value.voteCount,value.receiveTime, value.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerFederateDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

playerFederateDao.getRanking = function(value, cb) {
	var sql = 'select count(*) from (select distinct caoCoin from PlayerFederate where caoCoin>=?) as M';
	var args = [value.caoCoin];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerFederateDao.getRanking failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			var ranking=res[0]["count(*)"];
			utils.invokeCallback(cb,err,ranking);
		}
	});
};

//select count(*) from (select distinct doCaoCoin from PlayerFederate where doCaoCoin>=12 ) as M

// playerFederateDao.destroy = function(id, cb) {
// 	var sql = 'delete from PlayerFederate where id = ?';
// 	var args = [id];
// 	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
// 		if (err) {
// 			logger.error('playerBankDao.destroy failed! ' + err.stack);
// 			utils.invokeCallback(cb, err, null);
// 		} else {
// 			utils.invokeCallback(cb, err, res);
// 		}
// 	});
// };
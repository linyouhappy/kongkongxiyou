var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');

// var EntityType = require('../consts/consts').EntityType;
// var dataApi = require('../util/dataApi');

var federationDao = module.exports;

federationDao.getFederation = function(cb) {
	var sql = 'select * from Federation where id = 1';
	var args = [];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('federationDao.getFederationById failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res[0]);
		}
	});
};


federationDao.update = function(value, cb) {
	var sql = 'update Federation set doCaoCoin=?,voteCaoCoin = ?,voteYCaoCoin=?,voteTCaoCoin=?,dailyCaoCoin=?,recordTime=? where id = 1';
	var args = [value.doCaoCoin, value.voteCaoCoin, value.voteYCaoCoin,value.voteTCaoCoin,value.dailyCaoCoin,value.recordTime];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('playerBankDao.update failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};


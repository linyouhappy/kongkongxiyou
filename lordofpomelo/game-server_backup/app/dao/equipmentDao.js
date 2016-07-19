var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var equipApi = require('../util/dataApi').equipment;
// var Equipment = require('../domain/entity/equipment');
var utils = require('../util/utils');
var EntityType = require('../consts/consts').EntityType;


var equipmentDao = module.exports;

/**
 * Create equipment
 *
 * @param {Number} playerId Player id. 
 * @param {function} cb Callback function
 */
equipmentDao.createEquipment = function (equipment, cb) {
	if (equipment.type!==EntityType.EQUIPMENT) {
		var err="What are you doing? no equipment!";
		utils.invokeCallback(cb, err, null);
		return;
	}
	var sql,args;
	if (equipment.itemId) {
		equipment.id=equipment.itemId;
		sql = 'insert into Equipment (id,playerId,kindId,jobId,baseValue,potential,percent,totalStar,star1,star2,star3,star4,star5,star6,star7,star8,star9,star10,star11,star12) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		args = [equipment.id,equipment.playerId,equipment.kindId,equipment.jobId,equipment.baseValue,equipment.potential,equipment.percent,equipment.totalStar,equipment.star1,equipment.star2,equipment.star3,equipment.star4,equipment.star5,equipment.star6,equipment.star7,equipment.star8,equipment.star9,equipment.star10,equipment.star11,equipment.star12];
	}else{
		sql = 'insert into Equipment (playerId,kindId,jobId,baseValue,potential,percent,totalStar,star1,star2,star3,star4,star5,star6,star7,star8,star9,star10,star11,star12) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		args = [equipment.playerId,equipment.kindId,equipment.jobId,equipment.baseValue,equipment.potential,equipment.percent,equipment.totalStar,equipment.star1,equipment.star2,equipment.star3,equipment.star4,equipment.star5,equipment.star6,equipment.star7,equipment.star8,equipment.star9,equipment.star10,equipment.star11,equipment.star12];
	}

	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err) {
			logger.error('create equipments for equipmentDao failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			// var equip = new Equipments({ id: res.insertId });
			equipment.id=res.insertId;
			utils.invokeCallback(cb, null,equipment);
		}
	});
};

/**
 * Get player's equipment by playerId
 *
 * @param {Number} playerId 
 * @param {funciton} cb 
 */
equipmentDao.getAllEquipmentByPlayerId = function(playerId, cb) {
	var sql = 'select * from Equipment where playerId = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('getAllEquipmentByPlayerId by playerId for equipmentDao failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
			// if (res && res.length === 1) {
			// 	var result = res[0];
			// 	var equips = new Equipments(result);
			// 	utils.invokeCallback(cb, null, equips);
			// } else {
			// 	logger.error('equipment not exist!! ' );
			// 	utils.invokeCallback(cb, new Error('equipment not exist '));
			// }
		}
	});
};

equipmentDao.getEquipEquipmentByPlayerId = function(playerId, cb) {
	var sql = 'select * from Equipment where playerId = ? and position = ?';
	var args = [playerId,0];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('equipmentDao.getEquipEquipmentByPlayerId  failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};


// equipmentDao.getSQLEquipmentsByPlayerId = function(playerId, cb) {
// 	var sql = 'select * from Equipments where playerId = ?';
// 	var args = [playerId];

// 	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
// 		if (err) {
// 			logger.error('get equipments by playerId for equipmentsDao failed! ' + err.stack);
// 			utils.invokeCallback(cb, err, null);
// 		} else {
// 			if (res && res.length === 1) {
// 				utils.invokeCallback(cb, null, res[0]);
// 			} else {
// 				logger.error('equipments not exist!! ' );
// 				utils.invokeCallback(cb, new Error('equipments not exist '));
// 			}
// 		}
// 	});
// };

/**
 * Updata equipment
 * @param {Object} val Update params, in a object.
 * @param {function} cb
 */
// equipmentDao.update = function(val, cb) {
// 	var sql = 'update Equipments set weapon = ?, armor = ?, helmet = ?, necklace = ?, ring = ?, belt = ?, amulet = ?, legguard = ?, shoes = ?	where id = ?';
// 	var args = [val.weapon, val.armor, val.helmet, val.necklace, val.ring, val.belt, val.amulet, val.legguard, val.shoes, val.id];

// 	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
// 		utils.invokeCallback(cb, err, res);
// 	});
// };

equipmentDao.updatePosition = function(val, cb) {
	var sql = 'update Equipment set position = ?,bind=? where id = ?';
	var args = [val.position,val.bind,val.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('equipmentDao.updatePosition failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

equipmentDao.updateDetail = function(val, cb) {
	var sql = 'update Equipment set percent = ?,totalStar = ?,star1 = ?,star2 = ?,star3 = ?,star4 = ?,star5 = ?,star6 = ?,star7 = ?,star8 = ?,star9 = ?,star10 = ?,star11 = ?,star12 = ? where id = ?';
	var args = [val.percent,val.totalStar,val.star1,val.star2,val.star3,val.star4,val.star5,val.star6,val.star7,val.star8,val.star9,val.star10,val.star11,val.star12,val.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('equipmentDao.updatePosition failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, err, res);
		}
	});
};

/**
 * destroy equipment
 *
 * @param {number} playerId
 * @param {function} cb
 */
equipmentDao.destroy = function(id, cb) {
	var sql = 'delete from Equipment where id = ?';
	var args = [id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		utils.invokeCallback(cb, err, res);
	});
};
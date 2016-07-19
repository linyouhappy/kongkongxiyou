var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');
var Player = require('../domain/entity/player');
var User = require('../domain/user');
var consts = require('../consts/consts');
//var bagDao = require('./bagDao');
var fightskillDao = require('./fightskillDao');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../util/utils');
var consts = require('../consts/consts');
var equipmentDao = require('./equipmentDao');
var itemDao = require('./itemDao');

var Bag = require('../domain/bag');
// var Equipments = require('../domain/equipments');
var mainTaskDao = require('./mainTaskDao');
var Tasks = require('../domain/task/tasks');

var userDao = module.exports;

/**
 * Get user data by username.
 * @param {String} username
 * @param {String} passwd
 * @param {function} cb
 */
userDao.getUserInfo = function(username, passwd, cb) {
	var sql = 'select * from User where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			//var userId = 0;
			if (!!res && res.length === 1) {
				var rs = res[0];
				//userId = rs.id;
				rs.uid = rs.id;
				utils.invokeCallback(cb, null, rs);
			} else {
				utils.invokeCallback(cb, null, {
					uid: 0,
					username: username
				});
			}
		}
	});
};

userDao.updateUser = function(user, cb) {
	var sql = 'update User set lastLoginTime = ?,loginCount=?,lastKindId=? where id = ?';
	var args = [user.lastLoginTime, user.loginCount, user.lastKindId, user.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				logger.error('update user failed!');
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
userDao.getUserByName = function(username, cb) {
	var sql = 'select * from User where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.length === 1) {
				var rs = res[0];
				var user = new User({
					id: rs.id,
					name: rs.name,
					password: rs.password
					// from: rs.from
				});
				utils.invokeCallback(cb, null, user);
			} else {
				utils.invokeCallback(cb, ' user not exist ', null);
			}
		}
	});
};

/**
 * get user infomation by userId
 * @param {String} uid UserId
 * @param {function} cb Callback function
 */
userDao.getUserById = function(uid, cb) {
	var sql = 'select * from User where id = ?';
	var args = [uid];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
			return;
		}

		if (!!res && res.length > 0) {
			utils.invokeCallback(cb, null, new User(res[0]));
		} else {
			utils.invokeCallback(cb, ' user not exist ', null);
		}
	});
};

/**
 * delete user by username
 * @param {String} username
 * @param {function} cb Call back function.
 */
userDao.deleteByName = function(username, cb) {
	var sql = 'delete from	User where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createUser = function(userInfo, cb) {
	var sql = 'insert into User (name,password,channel,model,loginCount,lastLoginTime) values(?,?,?,?,?,?)';
	var loginTime = Date.now();
	var args = [userInfo.username, userInfo.password, userInfo.channel,userInfo.model, 1, loginTime];
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, {
				code: err.number,
				msg: err.message
			}, null);
		} else {
			var user = new User({
				id: res.insertId,
				name: userInfo.username,
				password: userInfo.password,
				loginCount: 1,
				lastLoginTime: loginTime
			});
			utils.invokeCallback(cb, null, user);
		}
	});
};

/**
 * Get an user's all players by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
userDao.getPlayersByUid = function(uid, cb) {
	var sql = 'select * from Player where userId = ?';
	var args = [uid];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			utils.invokeCallback(cb, err.message, null);
			return;
		}

		if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, []);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Get an user's all players by userId
 * @param {Number} playerId
 * @param {function} cb Callback function.
 */
userDao.getPlayer = function(playerId, cb) {
	var sql = 'select * from Player where id = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, []);
			return;
		} else {
			utils.invokeCallback(cb, null, new Player(res[0]));
		}
	});
};

userDao.getKindIdByPlayerId = function(playerId, cb) {
	var sql = 'select kindId,name from Player where id = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, null);
			return;
		} else {
			utils.invokeCallback(cb, null, res[0]);
		}
	});
};

userDao.getSQLPlayer = function(playerId, cb) {
	var sql = 'select * from Player where id = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, null);
			return;
		} else {
			utils.invokeCallback(cb, null, res[0]);
		}
	});
};

/**
 * get by Name
 * @param {String} name Player name
 * @param {function} cb Callback function
 */
userDao.getPlayerByName = function(name, cb) {
	var sql = 'select * from Player where name = ?';
	var args = [name];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, null);
		} else {
			utils.invokeCallback(cb, null, new Player(res[0]));
		}
	});
};

userDao.getSQLPlayerByName = function(name, cb) {
	var sql = 'select * from Player where name = ?';
	var args = [name];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, null);
		} else {
			utils.invokeCallback(cb, null, res[0]);
		}
	});
};

/**
 * Get all the information of a player, include equipments, bag, skills, tasks.
 * @param {String} playerId
 * @param {function} cb
 */
userDao.getPlayerAllInfo = function(playerId, cb) {
	async.parallel([
			function(callback) {
				userDao.getPlayer(playerId, function(err, player) {
					if (!!err || !player) {
						logger.error('Get user for userDao failed! ' + err.stack);
					}
					callback(err, player);
				});
			},
			function(callback) {
				itemDao.getAllItemsByPlayerId(playerId, function(err, itemData) {
					if (!!err || !itemData) {
						logger.error('Get bag for bagDao failed! ' + err.stack);
					}
					callback(err, itemData);
				});
			},
			function(callback) {
				equipmentDao.getAllEquipmentByPlayerId(playerId, function(err, equipmentData) {
					if (!!err || !equipmentData) {
						logger.error('Get bag for bagDao failed! ' + err.stack);
					}
					callback(err, equipmentData);
				});
			},
			function(callback) {
				fightskillDao.getFightSkillsByPlayerId(playerId, function(err, fightSkills) {
					if (!!err || !fightSkills) {
						logger.error('Get skills for skillDao failed! ' + err.stack);
					}
					callback(err, fightSkills);
				});
			},
			function(callback) {
				taskDao.getTasksByPlayerId(playerId, function(err, tasks) {
					if (!!err) {
						logger.error('Get task for taskDao failed!');
					}
					callback(err, tasks);
				});
			},
			function(callback) {
				mainTaskDao.getMainTaskByPlayId(playerId, function(err, taskMain) {
					if (!!err) {
						logger.error('Get mainTask for mainTaskDao failed!');
					}
					callback(err, taskMain);
				});
			}
		],
		function(err, results) {
			var player = results[0];
			var itemData = results[1];
			var equipmentData = results[2];
			var fightSkills = results[3];
			var taskDatas = results[4];
			var taskMain=results[5];
			
			//equiped
			var bag = new Bag({
				playerId: player.id
			});
			//all equipment include equiped and unequiped
			bag.setEquipmentData(equipmentData);
			bag.setItemData(itemData);
			player.setBag(bag);
			player.addFightSkills(fightSkills);

			var tasks=new Tasks({
				player:player,
				taskMain:taskMain,
				dailyTasks:taskDatas||{}
			});

			player.setTasks(tasks);

			if (!!err) {
				utils.invokeCallback(cb, err);
			} else {
				utils.invokeCallback(cb, null, player);
			}
		});
};

/**
 * Create a new player
 * @param {String} uid User id.
 * @param {String} name Player's name in the game.
 * @param {Number} kindId Player's kindId, decide which kind of player to create.
 * @param {function} cb Callback function
 */
userDao.createPlayer = function(uid, name, kindId, cb) {
	var sql = 'insert into Player (userId, kindId, skinId, name, level, hp, mp) values(?,?,?,?,?,?,?)';
	// var role = dataApi.role.findById(kindId);
	var character = dataApi.character.findById(kindId);
	if (!character) {
		utils.invokeCallback(cb, TypeError('skinId is not founded'), kindId);
		return;
	}
	// var born = consts.BornPlace;
	// var x = born.x + Math.floor(Math.random() * born.width);
	// var y = born.y + Math.floor(Math.random() * born.height);
	// var areaId = consts.PLAYER.initAreaId;
	// var areaId=0;
	var args = [uid, kindId, character.skinId, name, 1, character.hp, character.mp];
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err !== null) {
			logger.error('create player failed! ' + err.message);
			logger.error(err);
			utils.invokeCallback(cb, err.message, null);
		} else {
			res.id = res.insertId;
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Update a player
 * @param {Object} player The player need to update, all the propties will be update.
 * @param {function} cb Callback function.
 */
userDao.updatePlayer = function(player, cb) {
	player.rank = player.rank || 1;
	var sql = 'update Player set x = ? ,y = ? , hp = ?, mp = ?, level = ?, experience = ?, areaId = ?,hpCount=?,hpLevel=?,mpCount=?,mpLevel=? where id = ?';
	var args = [player.x, player.y, player.hp, player.mp, player.level, player.experience, player.areaId,player.hpCount ,player.hpLevel,player.mpCount,player.mpLevel, player.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				logger.error('update player failed!');
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

userDao.updateAreaId = function(player, cb) {
	var sql = 'update Player set areaId = ? where id = ?';
	var args = [player.areaId, player.id];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('update player failed!%j',err);
			utils.invokeCallback(cb, err);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				logger.error('update player failed!');
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

userDao.updateCrystal = function(player, cb) {
	var sql = 'update Player set crystal = ? where id = ?';
	var args = [player.crystal, player.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('update player failed!%j',err);
			utils.invokeCallback(cb, err);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				logger.error('update player failed!');
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

// userDao.updateMoney = function(player, cb) {
// 	var sql = 'update Player set caoCoin = ?, crystal = ? where id = ?';
// 	var args = [player.caoCoin, player.crystal, player.id];

// 	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
// 		if (err !== null) {
// 			utils.invokeCallback(cb, err.message, null);
// 		} else {
// 			if (!!res && res.affectedRows > 0) {
// 				utils.invokeCallback(cb, null, true);
// 			} else {
// 				logger.error('update player failed!');
// 				utils.invokeCallback(cb, null, false);
// 			}
// 		}
// 	});
// };

userDao.updateCaoCoin = function(player, cb) {
	var sql = 'update Player set caoCoin = ? where id = ?';
	var args = [player.caoCoin, player.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				logger.error('userDao.updateCaoCoin failed!');
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

userDao.updateGuildId = function(player, cb) {
	var sql = 'update Player set guildId = ? where id = ?';
	var args = [player.guildId, player.id];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				logger.error('update player updateGuildId!');
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

/**
 * Delete player
 * @param {Number} playerId
 * @param {function} cb Callback function.
 */
userDao.deletePlayer = function(playerId, cb) {
	var sql = 'delete from	Player where id = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = {
	updatePlayer: function(client, player, cb) {
		if (!player.id) {
			return;
		}
		var sql = 'update Player set x=?,y=?,hp=?,mp=?,fightMode=?,level=?,experience=?,areaId=?,hpCount=?,hpLevel=?,mpCount=?,mpLevel=? where id=?';
		var args = [player.x, player.y, player.hp, player.mp, player.fightMode, player.level, player.experience, player.areaId, player.hpCount, player.hpLevel, player.mpCount,player.mpLevel,player.id];

		client.query(sql, args, function(err, res) {
			if (err !== null) {
				console.error('write mysql failed!　' + sql + ' ' + JSON.stringify(player.strip()) + ' stack:' + err.stack);
			}
			if (!!cb && typeof cb == 'function') {
				cb(!!err);
			}
		});
	}
};
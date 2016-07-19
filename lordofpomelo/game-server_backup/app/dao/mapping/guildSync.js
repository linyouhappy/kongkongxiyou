var logger = require('pomelo-logger').getLogger(__filename);

module.exports = {
	updateGuild: function(client, value, cb) {
		if (!value.id) {
			return;
		}
		var sql = 'update Guild set level=?,caoCoin=?,salary=?,build=? where id = ?';
		var args = [value.level, value.caoCoin, value.salary,value.build,value.id];
		logger.info("guildSync.updateGuild sql:"+sql);
		logger.info("guildSync.updateGuild args:"+args);
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
var Action = require('./action');
var messageService = require('../messageService');
var util = require('util');
var ActionType = require('../../consts/consts').ActionType;


var Revive = function(opts) {
	opts.type = ActionType.REVIVE;
	opts.id = opts.entityId;
	opts.singleton = true;

	Action.call(this, opts);
	this.entityId=opts.entityId;
	this.area = opts.area;
	this.deadline = opts.reviveTime + Date.now();
};

util.inherits(Revive, Action);
module.exports = Revive;
/**
 * Update revive time
 * @api public
 */
Revive.prototype.update = function(currentTime) {
	if (currentTime >= this.deadline) {
		var player=this.area.getEntity(this.entityId);
		if (player) {
			player.setRevive(0);
		}
		this.finished = true;
	}
};
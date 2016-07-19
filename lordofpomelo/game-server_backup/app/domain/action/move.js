var Action = require('./action');
var util = require('util');
var messageService = require('../messageService');
var consts = require('../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var EntityType=consts.EntityType
var ActionType = consts.ActionType;

/**
 * Move action, which is used to preserve and update user position
 */
var Move = function(opts){
	opts.type = ActionType.MOVE;
	opts.id = opts.entity.entityId;
	opts.singleton = true;

	Action.call(this, opts);
	this.entity = opts.entity;
	this.area = this.entity.area;
	this.path = opts.path;
	this.speed = opts.speed || this.entity.walkSpeed;
	this.time = Date.now();
	this.pos = this.path[0];
	this.index = 1;
	this.tickNumber = 0;
};

util.inherits(Move, Action);

Move.prototype.stopMove = function(){
	if(!this.entity.isMoving && this.entity.stand)
		this.entity.stand();
};
/**
 * Update the move action, it will calculate and set the entity's new position, and update AOI module
 */
Move.prototype.update = function(currentTime){
	this.tickNumber++;
	var time =currentTime-this.time;
	var speed = this.speed;
	if(speed > 600) {
		logger.warn('move speed too fast : %j', speed);
	}

	var path = this.path;
	var index = this.index;
	var travelDistance = speed*time/1000;
	var oldPos = {x : this.pos.x, y : this.pos.y};
	var pos = oldPos;
	var dest = path[index];
	var distance = getDis(this.pos, dest);

	var entity=this.entity;
	while(travelDistance > 0){
		if(distance <= travelDistance){
			travelDistance = travelDistance - distance;
			pos = path[index];
			index++;

			//If the index exceed the last point, means the move is finished
			if(index >= path.length){
				this.finished = true;
				entity.setIsMoving(false);
				break;
			}

			dest = path[index];
			distance = getDis(pos, dest);
		}else{
			distance = distance - travelDistance;
			pos = getPos(pos, dest, distance);
			travelDistance = 0;
		}
	}

	this.pos = pos;
	this.index = index;

	entity.x = Math.floor(pos.x);
	entity.y = Math.floor(pos.y);

	//Update the aoi module
	var watcher = {id : entity.entityId, type : entity.type};
  	this.area.timer.updateObject(watcher, oldPos, pos);
  	this.area.timer.updateWatcher(watcher, oldPos, pos, entity.range, entity.range);
	// if(entity.type === EntityType.PLAYER){
	// 	if (this.tickNumber % 20 === 0) {
	// 		entity.save();
	// 	}
		// if (this.tickNumber % 50 === 0) {
		// 	messageService.pushMessageToPlayer(entity.sessionData, 'onPathCheckout', {
		// 		entityId: entity.entityId,
		// 		x: entity.x,
		// 		y: entity.y
		// 	});
		// }
	// }
	this.time = currentTime;
};

function getDis(pos1, pos2) {
	return Math.sqrt(Math.pow((pos1.x-pos2.x), 2) + Math.pow((pos1.y-pos2.y), 2));
}

function getPos(start, end, dis) {
	var length = getDis(start, end);
	var pos = {};

	pos.x = end.x - (end.x-start.x) * (dis/length);
	pos.y = end.y - (end.y-start.y) * (dis/length);

	return pos;
}

module.exports = Move;

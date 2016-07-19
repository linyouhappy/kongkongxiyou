var util = require('util');
var Zone = require('./zone');
var Mob = require('./../entity/mob');
var utils = require('../../util/utils');
var dataApi = require('../../util/dataApi');
var logger = require('pomelo-logger').getLogger(__filename);
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');

var AreaKinds = consts.AreaKinds;

var defaultLimit = 10;

/**
 * The mob zone for generate mobs
 */
var MobZone = function(opts) {
	Zone.call(this, opts);
	this.area = opts.area;
	this.map = opts.area.map;
	this.kindId = opts.kindId;
	this.areaKind=opts.areaKind;

	this.mobData ={};
	this.mobData.zoneId = this.zoneId;
	this.mobData.areaId = this.area.areaId;
	this.mobData.level = opts.level || 1;
	var characterData=characterData=dataApi.character.findById(this.kindId);
	this.mobData.characterData=characterData;
	// this.mobData.range=characterData.range;
	this.mobData.kindId = characterData.id;
	// this.mobData.baseExp=characterData.baseExp;

	this.mobData.x = this.x;
	this.mobData.y = this.y;

	if(characterData.id!==this.kindId){
		logger.error("MobZone characterData.id!==this.kindId");
	}

	//this.refreshProperty();
	formula.refreshProperty(this.mobData);

	this.limit = opts.num||defaultLimit;
	this.count = 0;
	this.mobs = {};

	this.nextGenTime = 0;
	this.genCount = 3;
	this.interval = opts.refreshTime || 5000;
};

util.inherits(MobZone, Zone);

// MobZone.prototype.refreshProperty = function() {
// 	var mobData = this.mobData;
// 	var characterData = mobData.characterData;
// 	// var upgradeParam = characterData.upgradeParam;
// 	var ratio = (mobData.level-1) * characterData.upgradeParam + 1;

// 	mobData.maxHp = Math.floor(ratio * characterData.hp);
// 	mobData.maxMp = Math.floor(ratio * characterData.mp);

// 	mobData.dodgeRate = Math.floor(ratio * characterData.dodgeRate);
// 	mobData.hitRate = Math.floor(ratio * characterData.hitRate);
// 	mobData.critValue = Math.floor(ratio * characterData.critValue);
// 	mobData.critResValue = Math.floor(ratio * characterData.critResValue);
// 	mobData.attackValue = Math.floor(ratio * characterData.attackValue);
// 	mobData.defenceValue = Math.floor(ratio * characterData.defenceValue);
// 	mobData.wreckValue = Math.floor(ratio * characterData.wreckValue);
// };
/**
 * Every tick the update will be called to generate new mobs
 */
MobZone.prototype.update = function() {
	var time = Date.now();
	if (this.nextGenTime>time)
		return;

	this.nextGenTime = time + this.interval;
	if(this.count === this.limit)
		return;

	for(var i = 0; i < this.genCount; i++) {
		if(this.count < this.limit) {
			this.generateMobs();
		}else{
			break;
		}
	}
};

/**
 * The nenerate mob funtion, will generate mob, update aoi and push the message to all interest clients
 */
MobZone.prototype.generateMobs = function() {
	var mobData = this.mobData;
	if(!mobData) {
		logger.error('load mobData failed! kindId : ' + this.kindId);
		return;
	}

	// var count = 0, limit = 20;
	// do{
	// 	// mobData.x = Math.floor(Math.random()*this.width) + this.x;
	// 	// mobData.y = Math.floor(Math.random()*this.height) + this.y;
	// 	mobData.x = Math.floor(this.x+this.width*(Math.random()-0.5));
	// 	mobData.y = Math.floor(this.y+this.height*(Math.random()-0.5));
	// } while(!this.map.isReachable(mobData.x, mobData.y) && count++ < limit);

	// if(count > limit){
	// 	logger.error('generate mob failed! mob data : %j, area : %j, retry %j times', mobData, this.area.id, count);
	// 	//logger.error('generate mob failed! mob data : %j, area : %j, retry %j times', mobData, this.area.id, count);
	// 	return;
	// }
	var point = this.map.generatePoint(this, this.width, this.height);
	if (point) {
		mobData.x = point.x;
		mobData.y = point.y;
	}

	var mob = new Mob(mobData);
	 mob.area=this.area;

	this.map.genPatrolPath(mob,this.width,this.height);
	// this.genPatrolPath(mob);
	this.add(mob);

	this.area.addEntity(mob);
	this.count++;

	if (this.areaKind===AreaKinds.WORLD_BOSS_AREA) {
		if (this.kindId>50000) {
			this.area.nextBossGenTime=this.nextGenTime;
			this.area.bossEntityId=mob.entityId;
		}
	}
};

/**
 * Add a mob to the mobzones
 */
MobZone.prototype.add = function(mob) {
	this.mobs[mob.entityId] = mob;
};

/**
 * Remove a mob from the mob zone
 * @param {Number} id The entity id of the mob to remove.
 */
MobZone.prototype.remove = function(id) {
	if(!!this.mobs[id]) {
		delete this.mobs[id];
		this.count--;
	}
	return true;
};

// var PATH_LENGTH = 3;
// var MAX_PATH_COST = 300;

/**
 * Generate patrol path for mob
 */
// MobZone.prototype.genPatrolPath = function(mob) {
// 	var path = [];
// 	var x = mob.x, y = mob.y, p;
// 	for(var i=0; i<PATH_LENGTH; i++) {
// 		p = this.genPoint(x, y);
// 		if(!p) {
// 			// logger.warn("Find path for mob faild! mobId : %j", mob.entityId);
// 			break;
// 		}
// 		path.push(p);
// 		x = p.x;
// 		y = p.y;
// 	}
// 	path.push({x: mob.x, y: mob.y});
// 	mob.path = path;
// };

// /**
//  * Generate point for given point, the radius is form 100 to 200.
//  * @param originX, originY {Number} The oright point
//  * @param count {Number} The retry count before give up
//  * @api private
//  */
// MobZone.prototype.genPoint = function(originX, originY, count) {
// 	var map = this.map;
// 	count = count || 0;
// 	// var disx = Math.floor(Math.random() * 100) + 100;
// 	// var disy = Math.floor(Math.random() * 100) + 100;
// 	var disx = Math.floor(Math.random()*this.width/2);
// 	var disy = Math.floor(Math.random()*this.height/2);

// 	var x, y;
// 	if(Math.random() > 0.5) {
// 		x = originX - disx;
// 	} else {
// 		x = originX + disx;
// 	}
// 	if(Math.random() > 0.5) {
// 		y = originY - disy;
// 	} else {
// 		y = originY + disy;
// 	}

// 	if(x < 0) {
// 		x = originX + disx;
// 	} else if(x > map.width) {
// 		x = originX - disx;
// 	}
// 	if(y < 0) {
// 		y = originY + disy;
// 	} else if(y > map.height) {
// 		y = originY - disy;
// 	}

// 	if(checkPoint(map, originX, originY, x, y)) {
// 		return {x: x, y: y};
// 	} else {
// 		if(count > 10) {
// 			return;
// 		}
// 		return this.genPoint(originX, originY, count + 1);
// 	}
// };

// /**
//  * Check if the path is valid, there are two limit, 1, Is the path valid? 2, Is the cost exceed the max cost?
//  * @param ox, oy {Number} Start point
//  * @param dx, dy {Number} End point
//  */
// var checkPoint = function(map, ox, oy, dx, dy) {
// 	if(!map.isReachable(dx, dy)) {
// 		return false;
// 	}

// 	var res = map.findPath(ox, oy, dx, dy);
// 	if(!res) {
// 		return false;
// 	}
// 	// if(!res || !res.path || res.cost > MAX_PATH_COST) {
// 	// 	return false;
// 	// }

// 	return true;
// };

module.exports = MobZone;

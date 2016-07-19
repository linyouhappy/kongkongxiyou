var util = require('util');
var Zone = require('./zone');
var Item = require('./../entity/item');
var utils = require('../../util/utils');
var dataApi = require('../../util/dataApi');
var logger = require('pomelo-logger').getLogger(__filename);

var defaultLimit = 4;

/**
 * The item zone for generate mobs
 */
var ItemZone = function(opts) {
	Zone.call(this, opts);
	this.area = opts.area;
	this.map = opts.area.map;
	this.kindId = opts.kindId;
	this.itemData = utils.clone(dataApi.item.findById(this.kindId));

	this.itemData.zoneId = this.zoneId;
	this.itemData.areaId = this.area.areaId;

	this.itemData.kindId = this.itemData.id;
	this.itemData.count=1;
	// this.itemData.kindName = this.itemData.name;

	this.itemData.x = this.x;
	this.itemData.y = this.y;

	this.limit = opts.num || defaultLimit;
	this.count = 0;
	this.items = {};

	this.nextGenTime = 0;
	this.genCount = 3;
	this.interval = opts.refreshTime || 5000;
};

util.inherits(ItemZone, Zone);

/**
 * Every tick the update will be called to generate new mobs
 */
ItemZone.prototype.update = function() {
	var time = Date.now();
	if (this.nextGenTime>time)
		return;

	this.nextGenTime = time + this.interval;
	if(this.count === this.limit)
		return;

	for(var i = 0; i < this.genCount; i++) {
		if(this.count < this.limit) {
			this.generateItems();
		}else{
			break;
		}
	}
};

/**
 * The nenerate mob funtion, will generate mob, update aoi and push the message to all interest clients
 */
ItemZone.prototype.generateItems = function() {
	var itemData = this.itemData;
	if(!itemData) {
		logger.error('load itemData failed! kindId: ' + this.kindId);
		return;
	}

	// var count = 0, limit = 20;
	// do{
	// 	itemData.x = Math.floor(this.x+this.width*(Math.random()-0.5));
	// 	itemData.y = Math.floor(this.y+this.height*(Math.random()-0.5));
	// } while(!this.map.isReachable(itemData.x, itemData.y) && count++ < limit);

	// if(count > limit){
	// 	logger.error('generate mob failed! mob data : %j, area : %j, retry %j times', itemData, this.area.id, count);
	// 	//logger.error('generate mob failed! mob data : %j, area : %j, retry %j times', mobData, this.area.id, count);
	// 	return;
	// }

	var point = this.map.generatePoint(this, this.width, this.height);
	if (point) {
		itemData.x = point.x;
		itemData.y = point.y;
	}

	var item = new Item(itemData);
	item.area=this.area;
	this.add(item);

	this.area.addEntity(item);
	this.count++;
};

  


/**
 * Add a item to the mobzones
 */
ItemZone.prototype.add = function(item) {
	this.items[item.entityId] = item;
};

/**
 * Remove a item from the item zone
 * @param {Number} id The entity id of the item to remove.
 */
ItemZone.prototype.remove = function(id) {
	if(!!this.items[id]) {
		delete this.items[id];
		this.count--;
	}
	return true;
};


module.exports = ItemZone;

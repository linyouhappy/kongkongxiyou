var messageService = require('../messageService');
var EntityType = require('../../consts/consts').EntityType;
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../util/utils');

var exp = module.exports;

//Add event for aoi
exp.addEvent = function(area, aoi) {
	aoi.on('add', function(params) {
		params.area = area;
		switch (params.type) {
			case EntityType.PLAYER:
				onPlayerAdd(params);
				break;
			case EntityType.MOB:
				onMobAdd(params);
				break;
			case EntityType.ITEM:
				onItemAdd(params);
				break;
		}
	});

	aoi.on('remove', function(params) {
		params.area = area;
		switch (params.type) {
			case EntityType.PLAYER:
				onPlayerRemove(params);
				break;
			// case EntityType.MOB:
				// break;
		}
	});

	aoi.on('update', function(params) {
		params.area = area;
		switch (params.type) {
			case EntityType.PLAYER:
				onObjectUpdate(params);
				break;
			case EntityType.MOB:
				onObjectUpdate(params);
				break;
		}
	});

	aoi.on('updateWatcher', function(params) {
		params.area = area;
		switch (params.type) {
			case EntityType.PLAYER:
				onPlayerUpdate(params);
				break;
		}
	});
};

/**
 * Handle player add event
 * @param {Object} params Params for add player, the content is : {watchers, id}
 * @return void
 * @api private
 */
function onPlayerAdd(params) {
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;
	var player = area.getEntity(entityId);

	if (!player) 
		return;

	var id, entityType;
	var uids = [];
	for (var type in watchers) {
		entityType=Number(type);
		switch (entityType) {
			case EntityType.PLAYER:
				var playerWatchers = watchers[type];
				for (id in playerWatchers) {
					var watcher = area.getEntity(playerWatchers[id]);
					if (watcher) {
						if (watcher.entityId !== entityId) {
							uids.push(watcher.sessionData);
						}
					} else {
						// logger.warn("onPlayerAdd playerWatcher is not exist,id:%d", id);
						delete playerWatchers[id];
					}
				}
				if (uids.length > 0) {
					onAddEntity(uids, player);
				}
				break;
			case EntityType.MOB:
				var mobWatchers = watchers[type];
				for (id in mobWatchers) {
					var mob = area.getEntity(mobWatchers[id]);
					if (mob && mob.isActiveAttack) {
						mob.onPlayerCome(entityId);
					} else {
						// logger.warn("onPlayerAdd mobWatchers is not exist,id:%d", id);
						delete mobWatchers[id];
					}
				}
				break;
		}
	}
}

/**
 * Handle mob add event
 * @param {Object} params Params for add mob, the content is : {watchers, id}
 * @return void
 * @api private
 */
function onMobAdd(params) {
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;
	var mob = area.getEntity(entityId);

	if (!mob) {
		return;
	}

	var uids = [];
	var playerWatchers = watchers[EntityType.PLAYER];
	for (var id in playerWatchers) {
		var watcher = area.getEntity(playerWatchers[id]);
		if (watcher) {
			uids.push(watcher.sessionData);
		} else {
			// logger.warn("onMobAdd playerWatcher is not exist,id:%d", id);
			delete playerWatchers[id];
		}
	}

	if (uids.length > 0) {
		onAddEntity(uids, mob);
	}

	//active attack
	if (mob.isActiveAttack) {
		var ids = area.aoi.getIdsByRange(mob,mob.range, [EntityType.PLAYER])[EntityType.PLAYER];
		if (!!ids && ids.length > 0 && !mob.target) {
			for (var key in ids) {
				mob.onPlayerCome(ids[key]);
			}
		}
	}
}

function onItemAdd(params){
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;
	var item = area.getEntity(entityId);

	if (!item) {
		return;
	}
	var uids = [];
	var watcher;
	var playerWatchers = watchers[EntityType.PLAYER];
	for (var id in playerWatchers) {
		watcher = area.getEntity(playerWatchers[id]);
		if (watcher) {
			uids.push(watcher.sessionData);
		} else {
			// logger.warn("onMobAdd playerWatcher is not exist,id:%d", id);
			delete playerWatchers[id];
		}
	}
	if (uids.length > 0) {
		onAddEntity(uids, item);
	}
}

/**
 * Handle player remove event
 * @param {Object} params Params for remove player, the content is : {watchers, id}
 * @return void
 * @api private
 */
function onPlayerRemove(params) {
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;

	var uids = [];
	var entityType;
	var watcher;
	var playerWatchers;
	for (var type in watchers) {
		entityType=Number(type);
		switch (entityType) {
			case EntityType.PLAYER:
				playerWatchers = watchers[type];
				for (var id in playerWatchers) {
					watcher = area.getEntity(playerWatchers[id]);
					if (watcher) {
						if (entityId !== watcher.entityId) {
							uids.push(watcher.sessionData);
						}
					} else {
						// logger.warn("onPlayerRemove playerWatcher is not exist,id:%d", id);
						delete playerWatchers[id];
					}
				}
				onRemoveEntity(uids, entityId);
				break;
		}
	}
}

/**
 * Handle object update event
 * @param {Object} params Params for add object, the content is : {oldWatchers, newWatchers, id}
 * @return void
 * @api private
 */
function onObjectUpdate(params) {
	var area = params.area;
	var entityId = params.id;
	var entity = area.getEntity(entityId);
	if (!entity) {
		return;
	}
	var oldWatchers = params.oldWatchers;
	var newWatchers = params.newWatchers;
	var removeWatchers = {},
		addWatchers = {},
		type, w1, w2, id;
	for (type in oldWatchers) {
		if (!newWatchers[type]) {
			removeWatchers[type] = oldWatchers[type];
			continue;
		}
		w1 = oldWatchers[type];
		w2 = newWatchers[type];
		removeWatchers[type] = {};
		for (id in w1) {
			if (!w2[id]) {
				removeWatchers[type][id] = w1[id];
			}
		}
	}
	for (type in newWatchers) {
		if (!oldWatchers[type]) {
			addWatchers[type] = newWatchers[type];
			continue;
		}
		w1 = oldWatchers[type];
		w2 = newWatchers[type];
		addWatchers[type] = {};
		for (id in w2) {
			if (!w1[id]) {
				addWatchers[type][id] = w2[id];
			}
		}
	}
	switch (params.type) {
		case EntityType.PLAYER:
			onPlayerAdd({
				area: area,
				id: params.id,
				watchers: addWatchers
			});
			onPlayerRemove({
				area: area,
				id: params.id,
				watchers: removeWatchers
			});
			break;
		case EntityType.MOB:
			onMobAdd({
				area: area,
				id: params.id,
				watchers: addWatchers
			});
			onMobRemove({
				area: area,
				id: params.id,
				watchers: removeWatchers
			});
			break;
	}
}

/**
 * Handle player update event
 * @param {Object} params Params for player update, the content is : {watchers, id}
 * @return void
 * @api private
 */
function onPlayerUpdate(params) {
	var area = params.area;
	var player = area.getEntity(params.id);
	if (!player || player.type !== EntityType.PLAYER) {
		return;
	}
	if (params.removeObjs.length > 0) {
		delete params.removeObjs["length"];
		messageService.pushMessageToPlayer(player.sessionData, 'onRemoveEntities', {
			entities: params.removeObjs
		});
	}

	if (params.addObjs.length > 0) {
		var ids = params.addObjs;
		var entities = {};
		// entities.length = 0;
		var entityId,entity;
		var hasEntity=false;
		for (var i = 0; i < ids.length; i++) {
			entityId=ids[i];
			if (player.entityId===entityId) {
				continue;
			}

			entity = area.entities[entityId];
			if (!!entity) {
				if (!entities[entity.type]) {
					entities[entity.type] = [];
				}
				entities[entity.type].push(entity.strip());
				// entities.length++;
				hasEntity=true;
			} else {
				// logger.warn("onPlayerUpdate entity is not exist,id:%d", ids[i]);
				for (var j = 0; j < params.addTowers.length; j++) {
					if (params.addTowers[j].removeById(ids[i])) {
						// logger.warn("onPlayerUpdate success remove object:%d", ids[i]);
						break;
					}
				}
			}
		}
		if (hasEntity) {
			messageService.pushMessageToPlayer(player.sessionData, 'onAddEntities', entities);
		}
	}
}

/**
 * Handle mob remove event
 * @param {Object} params Params for remove mob, the content is : {watchers, id}
 * @return void
 * @api private
 */
function onMobRemove(params) {
	var area = params.area;
	var watchers = params.watchers;
	var entityId = params.id;
	var uids = [];

	var entityType;
	for (var type in watchers) {
		entityType=Number(type);
		switch (entityType) {
			case EntityType.PLAYER:
				var playerWatchers = watchers[type];
				for (var id in playerWatchers) {
					var watcher = area.getEntity(playerWatchers[id]);
					if (watcher) {
						uids.push(watcher.sessionData);
					} else {
						// logger.warn("onMobRemove playerWatcher is not exist,id:%d", id);
						delete playerWatchers[id];
					}
				}
				onRemoveEntity(uids, entityId);
				break;
		}
	}
}

/**
 * Push message for add entities
 * @param {Array} uids The users to notify
 * @param {Number} entityId The entityId to add
 * @api private
 */
function onAddEntity(uids, entity) {
	var entities = {};
	entities[entity.type] = [entity.strip()];
	messageService.pushMessageByUids(uids, 'onAddEntities', entities);
	utils.myPrint('onAddEntity entities = ', JSON.stringify(entities));
}

/**
 * Push message for remove entities
 * @param {Array} uids The users to notify
 * @param {Number} entityId The entityId to remove
 * @api private
 */
function onRemoveEntity(uids, entityId) {
	if (uids.length <= 0) {
		return;
	}
	messageService.pushMessageByUids(uids, 'onRemoveEntities', {
		entities: [entityId]
	}, uids);
}
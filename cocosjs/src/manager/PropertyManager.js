cb.PropertyManager = cc.Class.extend({
	ctor: function() {
		this.propertys = {};
		this.propertyCount = 0;
		// this.curPlayer={};
	},

	setCurPlayer: function(curPlayer) {
		this.curPlayer = curPlayer;
		app.curPlayerId = curPlayer.playerId;
	},

	getCurPlayer:function(){
		return this.curPlayer;
	},

	addProperty: function(property) {
		var propertys = this.propertys;
		if (!propertys[property.playerId]) {
			this.propertyCount++;
		}
		propertys[property.playerId] = property;
		property.lastTime = Date.now() + 60000;
	},

	removeProperty: function(playerId) {
		if (this.propertys[playerId]) {
			delete this.propertys[playerId];
			this.propertyCount--;
		}
	},

	requestProperty: function(playerId, cb) {
		var self = this;
		playerHandler.getProperty(playerId, function(data) {
			if (data.equipments) {
				var oldEquipments = data.equipments;
				data.equipments = {};
				var equipment;
				for (var key in oldEquipments) {
					equipment = oldEquipments[key];
					equipment.type = EntityType.EQUIPMENT;
					equipment.itemData = dataApi.equipment.findById(equipment.kindId);
					data.equipments[equipment.itemData.kind] = equipment;
				}
				self.setTotalAttackAndDefence(data);
			}
			self.addProperty(data);
			if (cb) {
				cb(data);
			}
		});
	},

	getProperty: function(playerId) {
		var property = this.propertys[playerId]
		if (!property) {
			// this.requestProperty(playerId, cb);
			return;
		}

		if (Date.now() > property.lastTime) {
			this.removeProperty(playerId);
			// this.requestProperty(playerId, cb);
			return;
		}
		return property;
		// cb(property);
	},

	refreshProperty: function(character) {
		var entityData = dataApi.character.findById(character.kindId);
		var ratio = (character.level-1)* entityData.upgradeParam + 1;

		character.maxHp = Math.floor(ratio * entityData.hp);
		character.maxMp = Math.floor(ratio * entityData.mp);

		character.dodgeRate = Math.floor(ratio * entityData.dodgeRate);
		character.hitRate = Math.floor(ratio * entityData.hitRate);
		character.critValue = Math.floor(ratio * entityData.critValue);
		character.critResValue = Math.floor(ratio * entityData.critResValue);
		character.attackValue = Math.floor(ratio * entityData.attackValue);
		character.defenceValue = Math.floor(ratio * entityData.defenceValue);
		// character.wreckValue = Math.floor(ratio * entityData.wreckValue);
	},

	setTotalAttackAndDefence: function(character) {
		this.refreshProperty(character);
		var equipments = character.equipments;
		var propertyValue, equipment;
		for (var i = 1; i <= 6; i++) {
			equipment = equipments[i];
			if (equipment && equipment.type === EntityType.EQUIPMENT) {
				propertyValue = Math.floor(equipment.baseValue + equipment.potential * equipment.percent / 100);
				switch (equipment.equipKind) {
					case PropertyKind.Attack:
						character.attackValue += propertyValue;
						break;
					case PropertyKind.Defend:
						character.defenceValue += propertyValue;
						break;
					case PropertyKind.Hit:
						character.hitRate += propertyValue;
						break;
					case PropertyKind.Dodge:
						character.dodgeRate += propertyValue;
						break;
					// case PropertyKind.Wreck:
					// 	character.wreckValue += propertyValue;
					// 	break;
					case PropertyKind.Crit:
						character.critValue += propertyValue;
						break;
					case PropertyKind.Rescrit:
						character.critResValue += propertyValue;
						break;
					case PropertyKind.Hp:
						character.maxHp += propertyValue;
						break;
					case PropertyKind.Mp:
						character.maxMp += propertyValue;
						break;
				}
			}
		}
	}

});

var propertyManager = new cb.PropertyManager();
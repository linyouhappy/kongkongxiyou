/*
* Module dependencies
*/

var util = require('util');
var Entity = require('./entity/entity');
var EquipmentType = require('../consts/consts').EquipmentType;
var Persistent = require('./persistent');
var Underscore = require('underscore');
var logger = require('pomelo-logger').getLogger(__filename);
var consts=require('../consts/consts');

/**
 * Initialize a new 'Equipments' with the given 'opts'.
 * Equipments inherits Persistent 
 *
 * @param {Object} opts
 * @api public
 */
var Equipments = function(opts) {
  // Persistent.call(this, opts);
  // this.playerId = opts.playerId;
  // this.equipmentIds = {};
  this.equipments = {};
};
// var kinds = ['weapon','ring','armor','belt','shoes','necklace'];

module.exports = Equipments;
//util.inherits(Equipments, Persistent);

//Equipments.prototype.isEquipmentById = function(equipmentId) {
//  return !!this.equipmentIds[equipmentId]
//};

Equipments.prototype.setEquipment = function(equipment) {
  this.equipments[equipment.equipKind] = equipment;
  if (equipment.equipKind===EquipmentType.Weapon) {
    this.player.setWeapon(equipment);
  }
};

Equipments.prototype.getEquipment = function(equipKind) {
  return this.equipments[equipKind];
};

Equipments.prototype.getEquipmentByEquipmentId = function(equipmentId) {
  for (var key in this.equipments) {
    if (this.equipments[key].id===equipmentId) {
      return this.equipments[key];
    }
  }
  return null;
};

Equipments.prototype.removeEquipment = function(equipKind) {
  var equipment=this.equipments[equipKind];
  delete this.equipments[equipKind];
  if (equipKind===EquipmentType.Weapon) {
      this.player.setWeapon(null);
  }
  return equipment;
};

// Equipments.prototype.isCanEquip = function(bagItem) {
//   var kindCout = 0;
//   for (var key in this.equipments) {
//     if (this.equipments[key].kind === bagItem.kind) {
//       kindCout++;
//     }
//   }
//   if (kindCout >= 2) {
//     if (this.equipments[bagItem.equipKind] && this.equipments[bagItem.equipKind].kind === bagItem.kind) {
//       return true;
//     }
//     return false;
//   }
//   return true;
// };

Equipments.prototype.strip = function() {
  var data = [];
  var equipments=this.equipments;
  for (var key in equipments) {
    data.push(equipments[key].equipStrip());
  }
  return data;
};

Equipments.prototype.detailStrip = function() {
  var data = [];
  var equipments=this.equipments;
  for (var key in equipments) {
    data.push(equipments[key].equipDetailStrip());
  }
  return data;
};

// var dict = {
//   '武器': 'weapon',
//   '项链': 'necklace',
//   '头盔': 'helmet',
//   '护甲': 'armor' ,
//   '腰带': 'belt',
//   '护腿': 'legguard',
//   '护符': 'amulet',
//   '鞋': 'shoes',
//   '戒指': 'ring'
// };

// var convertType = function (type) {
//   if (/[\u4e00-\u9fa5]/.test(type)) {
//     type = dict[type];
//   } else {
//     type = type.toLowerCase();
//   }

//   return type;
// };

//Get equipment by type
// Equipments.prototype.get = function(type) {
//   return this[convertType(type)];
// };

// //Equip equipment by type and id
// Equipments.prototype.equip = function(type, id) {
//   this[convertType(type)] = id;
//   this.save();
// };

// //Unequip equipment by type
// Equipments.prototype.unEquip = function(type) {
//   this[convertType(type)] = 0;
//   this.save();
// };

// var EquipList = Underscore.values(dict);
// Equipments.prototype.isEquipment = function(strEquip) {
//   return Underscore.contains(EquipList, strEquip);
// };

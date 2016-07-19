var util = require('util');
var logger = require('pomelo-logger').getLogger(__filename);
var federationDao = require('../dao/federationDao');

var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');

/**
 * Initialize a new 'Federation' with the given 'opts'
 * Bag inherits Persistent
 *
 * @param {Object} opts
 * @api public
 */
var Federation = function(opts) {
  this.id = opts.id;
  this.type = opts.type;
  this.kindId = opts.kindId;
  this.name = opts.name;
  this.position = opts.position;
  this.playerId = opts.playerId;

};

module.exports = Federation;

// Federation.prototype.getPropertyValue = function() {
//   return Math.floor(this.baseValue+this.potential*this.percent/100);
// };



// BagItem.prototype.save = function() {
//     pomelo.app.get('sync').exec('equipmentSync.updateEquipment', this.id, this);
// };
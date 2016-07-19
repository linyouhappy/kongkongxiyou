

/**
 * Data model `new Data()`
 *
 * @param {Array}
 *
 */
var Data = function(data) {
  data=require('../../config/data/'+data);

  var fields = {};
  data[1].forEach(function(i, k) {
    fields[i] = k;
  });
  data.splice(0, 2);

  var result = {},
    item;
  data.forEach(function(k) {
    item = mapData(fields, k);
    result[item.id] = item;
  });

  this.data = result;
};

/**
 * map the array data to object
 *
 * @param {Object}
 * @param {Array}
 * @return {Object} result
 * @api private
 */
var mapData = function(fields, item) {
  var obj = {};
  for (var k in fields) {
    obj[k] = item[fields[k]];
  }
  return obj;
};

/**
 * find items by attribute
 *
 * @param {String} attribute name
 * @param {String|Number} the value of the attribute
 * @return {Array} result
 * @api public
 */
Data.prototype.findBy = function(attr, value) {
  var result = [];
  var i, item;
  for (i in this.data) {
    item = this.data[i];
    if (item[attr] == value) {
      result.push(item);
    }
  }
  return result;
};

Data.prototype.findBigger = function(attr, value) {
  var result = [];
  value = Number(value);
  var i, item;
  for (i in this.data) {
    item = this.data[i];
    if (Number(item[attr]) >= value) {
      result.push(item);
    }
  }
  return result;
};

Data.prototype.findSmaller = function(attr, value) {
  var result = [];
  value = Number(value);
  var i, item;
  for (i in this.data) {
    item = this.data[i];
    if (Number(item[attr]) <= value) {
      result.push(item);
    }
  }
  return result;
};

/**
 * find item by id
 *
 * @param id
 * @return {Obj}
 * @api public
 */
Data.prototype.findById = function(id) {
  return this.data[id];
};

/**
 * find all item
 *
 * @return {array}
 * @api public
 */
Data.prototype.all = function() {
  return this.data;
};

module.exports = {
  area: new Data('area'),
  character: new Data('character'),
  equipment: new Data('equipment'),
  experience: new Data('experience'),
  npc: new Data('npc'),
  role: new Data('role'),
  // talk: new Data('talk'),
  item: new Data('item'),
  fightskill: new Data('fightskill'),
  task: new Data('task'),
  team: new Data('team'),
  error_code: new Data('error_code'),
  strength: new Data('strength'),
  item_shop: new Data('item_shop'),
  task_daily: new Data('task_daily'),
  task_main: new Data('task_main'),
  hpmp: new Data('hpmp'),
  market: new Data('market'),
  officer: new Data('officer'),
  guild: new Data('guild'),
  fightlevel: new Data('fightlevel'),
  guild_town: new Data('guild_town'),
  myboss: new Data('myboss'),
  recharge: new Data('recharge'),
  exchange: new Data('exchange'),
  gift: new Data('gift'),
  recycle: new Data('recycle'),
  fruit_slot: new Data('fruit_slot')
};


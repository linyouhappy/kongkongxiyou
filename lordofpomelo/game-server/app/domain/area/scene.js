var Area = require('./area');
// var Map = require('../map/map');
var dataApi = require('../../util/dataApi');
var areaService = require('../../services/areaService');
var logger = require('pomelo-logger').getLogger(__filename);

var Scene = function(opts){
	this.init(opts);
};

Scene.prototype.init = function(opts) {
	if(!opts){
		logger.error("scene.init  opts==null");
		return;
	}
	logger.info("scene.init  opts="+JSON.stringify(opts));
	var map = areaService.getMap(opts.id);
	if (!map) {
		map = new Map(opts);
	}
	this.area = new Area(map);
	this.id = this.area.areaId;
};

Scene.prototype.getPlayerInArea = function(){
  return this.area;
};

Scene.prototype.removePlayerByUid=function(uid){
	logger.error("scene removePlayerByUid uid="+uid);
	this.area.removePlayerByUid(uid);
};

Scene.prototype.toString=function(){
	return "Scene id="+this.id+",playerIds="+JSON.stringify(this.area.players)+"\n";
};

module.exports = Scene;

// var exp = module.exports;

// var area = null;
// exp.init = function(opts) {
// 	if (!area) {
// 		var map = areaService.getMap(opts.id);
// 		if (!map) {
// 			// var opts = dataApi.area.findById(areaId);
// 			map = new Map(opts);
// 		}
// 		area = new Area(map);
// 	}
// };

// exp.getArea = function(){
//   return area;
// };

// exp.removePlayerByUid=function(uid){
// 	logger.error("scene removePlayerByUid uid="+uid);
// 	area.removePlayerByUid(uid);
// };

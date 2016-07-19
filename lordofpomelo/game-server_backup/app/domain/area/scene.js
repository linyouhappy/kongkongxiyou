var Area = require('./area');
// var Map = require('../map/map');
var dataApi = require('../../util/dataApi');
var areaService = require('../../services/areaService');
var logger = require('pomelo-logger').getLogger(__filename);


var exp = module.exports;

var area = null;
exp.init = function(opts) {
	if (!area) {
		var map = areaService.getMap(opts.id);
		if (!map) {
			// var opts = dataApi.area.findById(areaId);
			map = new Map(opts);
		}
		area = new Area(map);
	}
};

exp.getArea = function(){
  return area;
};

exp.removePlayerByUid=function(uid){
	logger.error("scene removePlayerByUid uid="+uid);
	area.removePlayerByUid(uid);
};

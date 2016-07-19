var buildFinder = require('pomelo-pathfinding').buildFinder;
var geometry = require('../../util/geometry');
var PathCache = require('../../util/pathCache');
var utils = require('../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);
var formula = require('../../consts/formula');
var fs = require('fs');

/**
 * The data structure for map in the area
 */
var Map = function(opts) {
	// utils.myPrint("Map===============>>",JSON.stringify(opts));
	// this.mapPath = process.cwd()+"/config/map/mapEntity" + opts.pathId+".json";
	// this.map = null;
	// this.weightMap = null;
	//this.name = opts.name;
	// this.mapPath = process.cwd()+"/config/map/mapEntity" + opts.pathId+".json";
	this.areaConfigData=opts;
	this.init(opts);
};

var pro = Map.prototype;

/**
 * Init game map
 * @param {Object} opts
 * @api private
 */
Map.prototype.init = function(opts) {
	// var weightMap = opts.weightMap || false;
	var mapPath = process.cwd()+"/config/map/mapEntity" + opts.pathId+".json";
	var map = require(mapPath);
	if(!map) {
		logger.error('Load map failed! ');
	} else {
		// this.configMap(map);
		this.map =map;
		this.id = opts.id;
		this.width = opts.width;
		this.height = opts.height;
		this.tileW = opts.tileW;
		this.tileH = opts.tileH;
		this.rectW = Math.ceil(this.width/this.tileW);
		this.rectH = Math.ceil(this.height/this.tileH);

		this.weightMap = this.getWeightMap(map.collisions);
		this.pathCache = new PathCache({limit:1000});
		this.pfinder = buildFinder(this);
	}
};

// Map.prototype.configMap = function(map){
// 	this.map = {};
// 	// var layers = map.layers;
// 	// for(var i = 0; i < layers.length; i++){
// 	// 	var layer = layers[i];
// 	// 	if(layer.type === 'objectgroup'){
// 	// 		this.map[layer.name] = configObjectGroup(layer.objects);
// 	// 	}
// 	// }
// };

// function configProps(obj){
// 	if(!!obj && !!obj.properties){
// 		for(var key in obj.properties){
// 			obj[key] = obj.properties[key];
// 		}

// 		delete obj.properties;
// 	}

// 	return obj;
// }

// function configObjectGroup(objs){
// 	for(var i = 0; i < objs.length; i++){
// 		objs[i] = configProps(objs[i]);
// 	}

// 	return objs;
// }

/**
 * Init weight map, which is used to record the collisions info, used for pathfinding
 * @api private
 */
// Map.prototype.initWeightMap = function() {
// 	var collisions = this.getCollision();
// 	var i, j, x, y, x1, y1, x2, y2, p, l, p1, p2, p3, p4;
// 	this.weightMap =  [];
// 	for(i = 0; i < this.rectW; i++) {
// 		this.weightMap[i] = [];
// 		for(j = 0; j < this.rectH; j++) {
// 			this.weightMap[i][j] = 1;
// 		}
// 	}

// 	//Use all collsions to construct the weight map
// 	for(i = 0; i < collisions.length; i++) {
// 		var collision = collisions[i];
// 		var polygon = [];
// 		var points = collision.polygon;

// 		if(!!points && points.length > 0) {
// 			if(points.length < 3) {
// 				logger.warn('The polygon data is invalid! points: %j', points);
// 				continue;
// 			}

// 			//Get the rect limit for polygonal collision
// 			var minx = Infinity, miny = Infinity, maxx = 0, maxy = 0;

// 			for(j = 0; j < points.length; j++) {
// 				var point = points[j];

// 				x = Number(point.x) + Number(collision.x);
// 				y = Number(point.y) + Number(collision.y);
// 				minx = minx>x?x:minx;
// 				miny = miny>y?y:miny;
// 				maxx = maxx<x?x:maxx;
// 				maxy = maxy<y?y:maxy;
// 				polygon.push({x: x, y: y});
// 			}

// 			//A polygon need at least 3 points
// 			if(polygon.length < 3) {
// 				logger.error('illigle polygon: points : %j, polygon: %j', points, polygon);
// 				continue;
// 			}

// 			x1 = Math.floor(minx/this.tileW);
// 			y1 = Math.floor(miny/this.tileH);
// 			x2 = Math.ceil(maxx/this.tileW);
// 			y2 = Math.ceil(maxy/this.tileH);

// 			//regular the poinit to not exceed the map
// 			x1 = x1<0?0:x1;
// 			y1 = y1<0?0:y1;
// 			x2 = x2>this.rectW?this.rectW:x2;
// 			y2 = y2>this.rectH?this.rectH:y2;

// 			//For all the tile in the polygon's externally rect, check if the tile is in the collision
// 			for(x = x1; x < x2; x++) {
// 				for(y = y1; y < y2; y++) {
// 					p = {x: x*this.tileW + this.tileW/2, y : y*this.tileH + this.tileH/2};
// 					l = this.tileW/4;
// 					p1 = { x: p.x - l, y: p.y - l};
// 					p2 = { x: p.x + l, y: p.y - l};
// 					p3 = { x: p.x - l, y: p.y + l};
// 					p4 = { x: p.x + l, y: p.y + l};
// 					if(geometry.isInPolygon(p1, polygon) ||
// 						 geometry.isInPolygon(p2, polygon) ||
// 						 geometry.isInPolygon(p3, polygon) ||
// 						 geometry.isInPolygon(p4, polygon)) {
// 						this.weightMap[x][y] = Infinity;
// 					}
// 				}
// 			}
// 		} else {
// 			x1 = Math.floor(collision.x/this.tileW);
// 			y1 = Math.floor(collision.y/this.tileH);

// 			x2 = Math.ceil((collision.x+collision.width)/this.tileW);
// 			y2 = Math.ceil((collision.y+collision.height)/this.tileH);

// 			//regular the poinit to not exceed the map
// 			x1 = x1<0?0:x1;
// 			y1 = y1<0?0:y1;
// 			x2 = x2>this.rectW?this.rectW:x2;
// 			y2 = y2>this.rectH?this.rectH:y2;

// 			for(x = x1; x < x2; x++) {
// 				for(y = y1; y < y2; y++) {
// 					this.weightMap[x][y] = Infinity;
// 				}
// 			}
// 		}
// 	}
// };

// Map.prototype.initCollisons = function(){
// 	var map = [];
// 	var flag = false;
// 	var collision;

// 	for(var x = 0; x < this.weightMap.length; x++){
// 		var array = this.weightMap[x];
// 		var length = array.length;
// 		var collisions = [];
// 		for(var y = 0; y < length; y++){
// 			//conllisions start
// 			if(!flag && (array[y] === Infinity)){
// 				collision = {};
// 				collision.start = y;
// 				flag = true;
// 			}

// 			if(flag && array[y] === 1){
// 				flag = false;
// 				collision.length = y - collision.start;
// 				collisions.push(collision);
// 			}else if(flag && (y === length - 1)){
// 				flag = false;
// 				collision.length = y - collision.start + 1;
// 				collisions.push(collision);
// 			}
// 		}

// 		map[x] = {collisions: collisions};
// 	}

// 	this.collisions = map;
// };

Map.prototype.getWeightMap = function(collisions){
	var map = [];
	var x, y;
	for(x = 0; x < this.rectW; x++) {
		var row = [];
		for(y = 0; y < this.rectH; y++) {
			row.push(1);
		}
		map.push(row);
	}

	for (var x in collisions) {
		var columns = collisions[x];
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			for (var j = 0; j < column[1]; j++) {
				var y = column[0] + j;
				map[x][y] = Infinity;
			};
		};
	}

	return map;
};

/**
 * Get all mob zones in the map
 * @return {Array} All mobzones in the map
 * @api public
 */
Map.prototype.getMobZones = function() {
	if(!this.map) {
		logger.error('map not load');
		return null;
	}
	return this.map.mob;
};

/**
 * Get all npcs from map
 * @return {Array} All npcs in the map
 * @api public
 */
Map.prototype.getNPCs = function() {
	return this.map.npc;
};

/**
 * Get all collisions form the map
 * @return {Array} All collisions
 * @api public
 */
Map.prototype.getCollision = function() {
	return this.map.collision;
};

/**
 * Get born place for this map
 * @return {Object} Born place for this map
 * @api public
 */
// temporary code
Map.prototype.getBornPlace = function() {
	var bornPlace = this.map.birth;
	return bornPlace;
};

/**
 * Get born point for this map, the point is random generate in born place
 * @return {Object} A random generated born point for this map.
 * @api public
 */
Map.prototype.getBornPoint = function() {
	var bornPlace = this.map.birth;
	var point=this.generatePoint(bornPlace,bornPlace.width,bornPlace.height);
	if (point) {
		return point;
	}
	return bornPlace;
};

Map.prototype.generatePoint = function(pos, width, height) {
	var x, y, limit = 10;
	for (var i = 0; i < limit; i++) {
		x = pos.x + Math.random() * width - width / 2;
		y = pos.y + Math.random() * height - height / 2;
		if (this.isReachable(x, y)) {
			return {
				x: Math.floor(x),
				y: Math.floor(y)
			};
		}
	}
	return;
};

/**
 * Random generate a position for give pos and range
 * @param pos {Object} The center position
 * @param range {Number} The max distance form the pos
 * @return {Object} A random generate postion in the range of given pos
 * @api public
 */
Map.prototype.genPos = function(pos, range) {
	var point=this.generatePoint(pos,range,range);
	if (point) {
		return point;
	}
	return pos;
};

Map.prototype.genPatrolPath = function(entity,width,height,pathCount) {
	var path = [];
	pathCount=pathCount || 3;
	var x = entity.x, y = entity.y, p;
	for(var i=0; i<pathCount; i++) {
		p = this.genRandomPoint(x, y,width,height);
		if(!p) {
			logger.warn("Find path for entity faild!");
			continue;
		}
		path.push(p);
		x = p.x;
		y = p.y;
	}
	path.push({x: entity.x, y: entity.y});
	entity.path = path;
};

Map.prototype.genRandomPoint = function(originX,originY,width,height,count) {
	count = count || 0;
	// var disx = Math.floor(Math.random() * 100) + 100;
	// var disy = Math.floor(Math.random() * 100) + 100;
	var disx = Math.floor(Math.random()*width/2);
	var disy = Math.floor(Math.random()*height/2);

	var x, y;
	if(Math.random() > 0.5) {
		x = originX - disx;
	} else {
		x = originX + disx;
	}
	if(Math.random() > 0.5) {
		y = originY - disy;
	} else {
		y = originY + disy;
	}

	if(x < 0) {
		x = originX + disx;
	} else if(x > this.width) {
		x = originX - disx;
	}
	if(y < 0) {
		y = originY + disy;
	} else if(y > this.height) {
		y = originY - disy;
	}

	if(this.checkPoint(originX, originY, x, y)) {
		return {x: x, y: y};
	} else {
		if(count > 10) {
			return;
		}
		return this.genRandomPoint(originX, originY,width,height, count + 1);
	}
};


Map.prototype.checkPoint = function(ox, oy, dx, dy) {
	if(!this.isReachable(dx, dy)) {
		return false;
	}
	var res = this.findPath(ox, oy, dx, dy);
	if(!res) {
		return false;
	}
	// if(!res || !res.path || res.cost > MAX_PATH_COST) {
	// 	return false;
	// }
	return true;
};

/**
 * Get all reachable pos for given x and y
 * This interface is used for pathfinding
 * @param x {Number} x position.
 * @param y {Number} y position.
 * @param processReachable {function} Call back function, for all reachable x and y, the function will bu called and use the position as param
 * @api public
 */
Map.prototype.forAllReachable = function(x, y, processReachable) {
	var x1 = x - 1, x2 = x + 1;
	var y1 = y - 1, y2 = y + 1;

	x1 = x1<0?0:x1;
	y1 = y1<0?0:y1;
	x2 = x2>=this.rectW?(this.rectW-1):x2;
	y2 = y2>=this.rectH?(this.rectH-1):y2;

	if(y > 0) {
		processReachable(x, y - 1, this.weightMap[x][y - 1]);
	}
	if((y + 1) < this.rectH) {
		processReachable(x, y + 1, this.weightMap[x][y + 1]);
	}
	if(x > 0) {
		processReachable(x - 1, y, this.weightMap[x - 1][y]);
	}
	if((x + 1) < this.rectW) {
		processReachable(x + 1, y, this.weightMap[x + 1][y]);
	}
};

/**
 * Get weicht for given pos
 */
Map.prototype.getWeight = function(x, y) {
	return this.weightMap[x][y];
};

/**
 * Return is reachable for given pos
 */
Map.prototype.isReachable = function(x, y) {
	if(x < 0 || y < 0 || x >= this.width || y >= this.height) {
		return false;
	}

	try{
		if (!this.weightMap) {
			console.error('Map.isReachable error this.weightMap===null');
			return;
		}
		var x1 = Math.floor(x/this.tileW);
		var y1 = Math.floor(y/this.tileH);

		if(!this.weightMap[x1] || !this.weightMap[x1][y1]) {
			return false;
	  	}
	}catch(e){
		console.error('reachable error : %j', e);
	}

	return this.weightMap[x1][y1] === 1;
};

/**
 * Find path for given pos
 * @param x, y {Number} Start point
 * @param x1, y1 {Number} End point
 * @param useCache {Boolean} If pathfinding cache is used
 * @api public
 */
Map.prototype.findPath = function(x, y, x1, y1, useCache) {
	useCache = useCache || false;
	if( x < 0 || x > this.width || y < 0 || y > this.height || x1 < 0 || x1 > this.width || y1 < 0 || y1 > this.height) {
		logger.warn('The point exceed the map range!');
		return null;
	}

	if(!this.isReachable(x, y)) {
		logger.warn('The start point is not reachable! start :(%j, %j)', x, y);
		return null;
	}

	if(!this.isReachable(x1, y1)) {
		logger.warn('The end point is not reachable! end : (%j, %j)', x1, y1);
		return null;
	}

  if(this._checkLinePath(x, y, x1, y1)) {
    // return {path: [{x: x, y: y}, {x: x1, y: y1}], cost: formula.distance(x, y, x1, y1)};
    return [{x: x, y: y}, {x: x1, y: y1}];
  }

	var tx1 = Math.floor(x/this.tileW);
	var ty1 = Math.floor(y/this.tileH);
	var tx2 = Math.floor(x1/this.tileW);
	var ty2 = Math.floor(y1/this.tileH);

	//Use cache to get path
	var paths = this.pathCache.getPath(tx1, ty1, tx2, ty2);

	if(!paths) {
		paths = this.pfinder(tx1, ty1, tx2, ty2);
		if(!paths) {
			logger.warn('can not find the path, path: %j', paths);
			return null;
		}

		if(useCache) {
			this.pathCache.addPath(tx1, ty1, tx2, ty2, paths);
		}
	}

	// var result = {};
	var resPaths = [];

	for(var i = 0; i < paths.length; i++) {
		resPaths.push(transPos(paths[i], this.tileW, this.tileH));
	}
	resPaths = this.compressPath2(resPaths);
	if(resPaths.length > 2) {
		resPaths = this.compressPath1(resPaths, 3);
		resPaths = this.compressPath2(resPaths);
	}
	return resPaths;
	// result.path = paths;
	// result.cost = computeCost(paths);

	// return result;
};

/**
 * Compute cost for given path
 * @api public
 */
function computeCost(path) {
	var cost = 0;
	for(var i = 1; i < path.length; i++) {
		var start = path[i-1];
		var end = path[i];
		cost += formula.distance(start.x, start.y, end.x, end.y);
	}

	return cost;
}

/**
 * compress path by gradient
 * @param tilePath {Array} Old path, construct by points
 * @param x {Number} start x
 * @param y {Number}	start y
 * @param x1 {Number}	end x
 * @param y1 {Number}	end y
 * @api private
 */
Map.prototype.compressPath2= function(tilePath) {
		var oldPos = tilePath[0];
		var path = [oldPos];

		for(var i = 1; i < (tilePath.length - 1); i++) {
			var pos = tilePath[i];
			var nextPos = tilePath[i + 1];

			if(!isLine(oldPos, pos, nextPos)) {
				path.push(pos);
			}

			oldPos = pos;
			pos = nextPos;
		}

		path.push(tilePath[tilePath.length - 1]);
		return path;
};

/**
 * Compress path to remove unneeded point
 * @param path [Ayyay] The origin path
 * @param loopTime [Number] The times to remove point, the bigger the number, the better the result, it should not exceed log(2, path.length)
 * @return The compressed path
 * @api private
 */
Map.prototype.compressPath1 = function(path, loopTime) {
	var newPath;

	for(var k = 0; k < loopTime; k++) {
		var start;
		var end;
		newPath = [path[0]];

		for(var i = 0, j = 2; j < path.length;) {
			start = path[i];
			end = path[j];
			if(this._checkLinePath(start.x, start.y, end.x, end.y)) {
				newPath.push(end);
				i = j;
				j += 2;
			} else {
				newPath.push(path[i+1]);
				i++;
				j++;
			}

			if(j >= path.length) {
				if((i + 2) === path.length) {
					newPath.push(path[i+1]);
				}
			}
		}
		path = newPath;
	}

	return newPath;
};

/**
 * Veriry if the given path is valid
 * @param path {Array} The given path
 * @return {Boolean} verify result
 * @api public
 */
Map.prototype.verifyPath = function(path) {
	if(path.length < 2) {
		return false;
	}

	var i;
	for(i = 0; i < path.length; i++) {
		if(!this.isReachable(path[i].x, path[i].y)) {
			return false;
		}
	}

	for(i = 1; i < path.length; i++) {
		if(!this._checkLinePath(path[i-1].x, path[i-1].y, path[i].x, path[i].y)) {
			logger.error('illigle path ! i : %j, path[i] : %j, path[i+1] : %j', i, path[i], path[i+1]);
			return false;
		}
	}

	return true;
};

/**
 * Check if the line is valid
 * @param x1 {Number} start x
 * @param y1 {Number}	start y
 * @param x2 {Number}	end x
 * @param y2 {Number}	end y
 */
Map.prototype._checkLinePath = function(x1, y1, x2, y2) {
  var px = x2 - x1;
  var py = y2 - y1;
  var tile = this.tileW/2;
  if(px === 0) {
    while(x1 < x2) {
      x1 += tile;
      if(!this.isReachable(x1, y1)) {
        return false;
      }
    }
    return true;
  }

  if(py === 0) {
    while(y1 < y2) {
      y1 += tile;
      if(!this.isReachable(x1, y1)) {
        return false;
      }
    }
    return true;
  }

  var dis = formula.distance(x1, y1, x2, y2);
  var rx = (x2 - x1) / dis;
  var ry = (y2 - y1) / dis;
  var dx = tile * rx;
  var dy = tile * ry;

  var x0 = x1;
  var y0 = y1;
  x1 += dx;
  y1 += dy;

  while((dx > 0 && x1 < x2) || (dx < 0 && x1 > x2)) {
    if(!this._testLine(x0, y0, x1, y1)) {
      return false;
    }

    x0 = x1;
    y0 = y1;
    x1 += dx;
    y1 += dy;
  }
  return true;
};

Map.prototype._testLine = function(x, y, x1, y1) {
	if(!this.isReachable(x, y) || !this.isReachable(x1, y1)) {
		return false;
	}

	var dx = x1 - x;
	var dy = y1 - y;

	var tileX = Math.floor(x/this.tileW);
	var tileY = Math.floor(y/this.tileW);
	var tileX1 = Math.floor(x1/this.tileW);
	var tileY1 = Math.floor(y1/this.tileW);

	if(tileX === tileX1 || tileY === tileY1) {
		return true;
	}

	var minY = y < y1 ? y : y1;
	var maxTileY = (tileY > tileY1 ? tileY : tileY1) * this.tileW;

	if((maxTileY-minY) === 0) {
		return true;
	}

	var y0 = maxTileY;
	var x0 = x + dx / dy * (y0 - y);

	var maxTileX = (tileX > tileX1 ? tileX : tileX1) * this.tileW;

	var x3 = (x0 + maxTileX) / 2;
	var y3 = y + dy / dx * (x3 - x);

	if(this.isReachable(x3, y3)) {
		return true;
	}
	return false;
};

/**
 * Change pos from tile pos to real position(The center of tile)
 * @param pos {Object} Tile position
 * @param tileW {Number} Tile width
 * @param tileH {Number} Tile height
 * @return {Object} The real position
 * @api public
 */
function transPos(pos, tileW, tileH) {
	var newPos = {};
	newPos.x = pos.x*tileW + tileW/2;
	newPos.y = pos.y*tileH + tileH/2;

	return newPos;
}

/**
 * Test if the given three point is on the same line
 * @param p0 {Object}
 * @param p1 {Object}
 * @param p2 {Object}
 * @return {Boolean}
 * @api public
 */
function isLine(p0, p1, p2) {
	return ((p1.x-p0.x)===(p2.x-p1.x)) && ((p1.y-p0.y) === (p2.y-p1.y));
}

module.exports = Map;

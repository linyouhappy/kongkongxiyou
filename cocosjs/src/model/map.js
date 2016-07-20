
// 
function requireJS(jsFile){
	if (!!cb[jsFile]) return;
	require(jsFile);
	cb[jsFile]=true;
}

var Map = function(area,scene){
	this.areaId=area.areaId;
	this.scene = scene;
	
	this.loadMap(area);
};

var pro = Map.prototype;

pro.checkOpacityMask = function(tileX, tileY) {
	if (this.weightMap[tileX][tileY] === 2) {
		return true;
	}
};

pro.loadMap = function(area){
	var node=cc.Node.create();
	this.scene.addChild(node);
	node.setLocalZOrder(-1);

	this.node = node;
	this.loadMapRes(area);

	this.entityNode=cc.Node.create();
	node.addChild(this.entityNode);
};

pro.loadMapRes= function(area){
	// this.name=area.areaName;
	mainPanel.setMapName(area);
	
	var areaData=area.areaData;
	this.width = areaData.width;
	this.height = areaData.height;
	var width = cc.winSize.width;
	var height = cc.winSize.height;
	this.maxX = this.width - width;
	this.maxY = this.height - height;
	this.winHalfWidth=width/2;
	this.winHalfHeight=height/2;

	this.tileW = areaData.tileW||20;
	this.tileH = areaData.tileH||20;
	this.rectW = Math.ceil(this.width/this.tileW);
	this.rectH = Math.ceil(this.height/this.tileH);

	// var weightMap=cb.mapWeightDatas[this.areaId];
	var mapEntity = "mapEntity" + areaData.pathId;
	cc.log("mapEntity="+mapEntity);
    // require('src/config/' + mapEntity + ".js");
    // requireJS('src/config/' + mapEntity + ".js");
    if (!config[mapEntity]) {
    	// cc.log('path:src/config/' + mapEntity + ".js");
    	require('src/config/' + mapEntity + ".js");
    }
    this.mapEntityData = config[mapEntity];

    var mobZones={};
	var mobZone,mobs=this.mapEntityData.mob;
	for (var key in mobs) {
		mobZone=mobs[key];
		mobZones[mobZone.kindId]=mobZone;
	}
	this.mobZones=mobZones;

	this.weightMap = this.getWeightMap();
	this.pfinder = buildFinder(this);

	mapManager.clearMap(areaData.resId);
	mapManager.loadMap(areaData.resId,areaData.resRow,areaData.resColumn);
	cc.log("areaData.resId="+Math.floor(areaData.resId%1000));
	if (areaData.bgMask) {
		mapManager.loadFarMap(areaData.resId,areaData.resRow,areaData.resColumn);
		this.farMapNode=mapManager.getFarMapNode();
		if (this.farMapNode) {
			this.farMapNode.removeFromParent();
			this.node.addChild(this.farMapNode);
		}
	}
	this.mapNode=mapManager.getMapNode();
	this.mapNode.removeFromParent();
	// this.mapNode.setVisible(false);
	// this.mapNode=cc.Node.create();
	this.node.addChild(this.mapNode);

	

	// var mapSprite=new cc.Sprite("map/6001/1001.png");
	// mapSprite.setAnchorPoint(cc.p(0,0));
	// this.node.addChild(mapSprite);

	// var childNode = null;
	// var children = this.mapNode.getChildren();
	// var childrenCount = this.mapNode.getChildrenCount();
	// for (var i = 0; i < childrenCount; i++) {
	// 	childNode = children[i];
	// 	effectManager.useShaderEffect(childNode, "ShaderGreyScale");
	// }
};

pro.setGray=function(isGray){
	var childNode;
	var childrens = this.mapNode.getChildren();
	var childrenCount = this.mapNode.getChildrenCount();
	for (var i = 0; i < childrenCount; i++) {
		childNode = childrens[i];
		if (isGray) {
			effectManager.useShaderEffect(childNode, "ShaderGreyScale");
		}else{
			effectManager.useDefaultShaderEffect(childNode);
		}
	}
};

pro.getMobZone=function(kindId){
	return this.mobZones[kindId];
};

pro.showSelectEffect=function(x,y,entityId,isSetting){
	if (isSetting) {
		this.selectEntityId=entityId;
	}else{
		if (this.selectEntityId!==entityId) {
			return;
		}
	}

	var selectEffectSprite=this.selectEffectSprite;
	if (!selectEffectSprite) {
		selectEffectSprite=new cc.Sprite();
        this.entityNode.addChild(selectEffectSprite);
        this.selectEffectSprite=selectEffectSprite;
	}else{
		selectEffectSprite.setVisible(true);
	}

	if (selectEffectSprite.getNumberOfRunningActions()===0) {
		var animate = cb.CommonLib.genarelAnimate("effect/character_select.plist", "character_select_",0.2,-1);
    	selectEffectSprite.runAction(animate);
	}
	selectEffectSprite.setPosition(x,y);
	y=y+50;
	selectEffectSprite.setLocalZOrder(-y);
}

pro.hideSelectEffect=function(){
	this.selectEntityId=null;
	if (this.selectEffectSprite) {
		this.selectEffectSprite.setVisible(false);
		this.selectEffectSprite.stopAllActions();
	}
};

pro.showClickEffect=function(x,y){
	var clickEffectSprite=this.clickEffectSprite;
	if (!clickEffectSprite) {
		clickEffectSprite=new cc.Sprite();
        this.entityNode.addChild(clickEffectSprite);
        this.clickEffectSprite=clickEffectSprite;
	}else{
		clickEffectSprite.setVisible(true);
	}

	if (clickEffectSprite.getNumberOfRunningActions()===0) {
		var animate = cb.CommonLib.genarelAnimate("effect/clickEffect.plist", "clickEffect_",0.2,-1);
    	clickEffectSprite.runAction(animate);
	}

	y=y+25;
	clickEffectSprite.setPosition(x,y);
	clickEffectSprite.setLocalZOrder(-y);

	var tileX = Math.floor(x / this.tileW);
  	var tileY = Math.floor(y / this.tileH);
	if (this.weightMap[tileX][tileY] === 2) {
	    clickEffectSprite.setOpacity(128);
	} else {
	    clickEffectSprite.setOpacity(255);
	}
}

pro.hideClickEffect=function(){
	if (this.clickEffectSprite) {
		this.clickEffectSprite.setVisible(false);
		this.clickEffectSprite.stopAllActions();
	}
};

pro.centerTo = function(x, y) {
	if(!this.node) {
		return;
	}

	x = x - this.winHalfWidth;
	y = y - this.winHalfHeight;
	if(x < 0) {
		x = 0;
	} else if(x > this.maxX) {
		x = this.maxX;
	}
	if(y < 0) {
		y = 0;
	} else if(y > this.maxY) {
		y = this.maxY;
	}

	this.node.setPosition(-x, -y);

	if (this.farMapNode) {
		this.farMapNode.setPositionX(0.3*x);
	}
};

pro.getWeight = function(x, y) {
	return this.weightMap[x][y];
};

pro.getWeightMap = function(){
	var map = [];
	var x, y;
	for(x = 0; x < this.rectW; x++) {
		map[x] = [];
		for(y = 0; y < this.rectH; y++) {
			map[x][y] = 1;
		}
	}

	var collisions=this.mapEntityData.collisions
	var columns,column,i,j;
	for (x in collisions) {
		columns = collisions[x];
		for (i = 0; i < columns.length; i++) {
			column = columns[i];
			for (j = 0; j < column[1]; j++) {
				y = column[0] + j;
				map[x][y] = cc.UINT_MAX;
			}
		}
	}

	var marks=this.mapEntityData.marks
	for (x in marks) {
		columns = marks[x];
		for (i = 0; i < columns.length; i++) {
			column = columns[i];
			for (j = 0; j < column[1]; j++) {
				y = column[0] + j;
				map[x][y] =2;
			}
		}
	}
	return map;
};

pro.isReachable = function(x, y) {
	var x1 = Math.floor(x/this.tileW);
	var y1 = Math.floor(y/this.tileH);

	if(x1 < 0 || y1 < 0 || x1 > this.rectW || y1 > this.rectH) {
		return false;
	}
	if(!this.weightMap[x1]) {
		cc.log("pro.isReachable this.weightMap[x1]==null");
		return false;
	}
	if(this.weightMap[x1][y1] < 5){
		return true;
	}else{
		// cc.log("pro.isReachable this.weightMap[x1][y1]!==1");
		return false;
	}
	// return this.weightMap[x1][y1] === 1;
};

pro.isReachableByTile = function(tileX, tileY) {
	if(tileX < 0 || tileY < 0 || tileX > this.rectW || tileY > this.rectH) {
		return false;
	}

	if(!this.weightMap[tileX]) {
		// cc.log("pro.isReachableByTile this.weightMap[x1]==null");
		return false;
	}
	
	if(this.weightMap[tileX][tileY] < 5){
		return true;
	}else{
		// cc.log("pro.isReachableByTile this.weightMap[tileX][tileY]!==1");
		return false;
	}
};

pro.verifyPath = function(path) {
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
			// cc.log('illigle path ! i : %j, path[i] : %j, path[i+1] : %j', i, path[i], path[i+1]);
			return false;
		}
	}
	return true;
};

pro._checkLinePath = function(x1, y1, x2, y2) {
	var px = x2 - x1;
	var py = y2 - y1;
	var tile = this.tileW / 2;
	if(px === 0) {
		while(x1 < x2) {
			x1 += tile;
			if(!this.isReachable(x1, y1)) {
				return false;
			}
		}
		return true;
	}
	else if(py === 0) {
		while(y1 < y2) {
			y1 += tile;
			if(!this.isReachable(x1, y1)) {
				return false;
			}
		}
		return true;
	}

	var dis = utils.distance(x1, y1, x2, y2);
	var rx = (x2 - x1) / dis, ry = (y2 - y1) / dis;
	var dx = tile * rx, dy = tile * ry;
	var x0 = x1, y0 = y1;
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

pro._testLine = function(x, y, x1, y1) {
	if(!this.isReachable(x, y) || !this.isReachable(x1, y1)) {
		return false;
	}

	var dx = x1 - x, dy = y1 - y;
	var tileX = Math.floor(x/this.tileW);
	var tileY = Math.floor(y/this.tileW);
	var tileX1 = Math.floor(x1/this.tileW);
	var tileY1 = Math.floor(y1/this.tileW);

	if(tileX === tileX1 || tileY === tileY1) {
		return true;
	}

	var minY = y < y1 ? y : y1;
	var maxTileY = (tileY > tileY1 ? tileY : tileY1) * this.tileW;

	if((maxTileY - minY) === 0){
		return true;
	}

	var y0 = maxTileY;
	var x0 = x + dx / dy * (y0 - y);
	var maxTileX = (tileX > tileX1 ? tileX : tileX1) * this.tileW;
	var x3 = (x0 + maxTileX) / 2, y3 = y + dy / dx * (x3 - x);

	if(this.isReachable(x3, y3)){
		if(!this._checkLinePath1(x, y, x1, y1)) {
			console.error('check error');
		}
		return true;
	}
	return false;
};

pro._checkLinePath1 = function(x1, y1, x2, y2) {
	var px = x2 - x1;
	var py = y2 - y1;
	var tile = 1;
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

	var dis = utils.distance(x1, y1, x2, y2);
	var rx = (x2 - x1) / dis, ry = (y2 - y1) / dis;
	var dx = tile * rx, dy = tile * ry;

	while((dx > 0 && x1 < x2) || (dx < 0 && x1 > x2)) {
		x1 += dx;
		y1 += dy;
		if(!this.isReachable(x1, y1)) {
			return false;
		}
	}
	return true;
};

pro._findPos = function(x1, y1, x2, y2) {
	var px = x2 - x1, py = y2 - y1;
	var tile = this.tileW / 2;
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

	var dis = utils.distance(x1, y1, x2, y2);
	var rx = (x2 - x1) / dis, ry = (y2 - y1) / dis;
	var dx = tile * rx, dy = tile * ry;

	while((dx > 0 && x1 < x2) || (dx < 0 && x1 > x2)) {
		x1 += dx;
		y1 += dy;
		if(!this.isReachable(x1, y1)) {
			return false;
		}
	}
	return true;
};

function computeCost(path){
	var cost = 0;
	for(var i = 1; i < path.length; i++){
		var start = path[i-1];
		var end = path[i];
		cost += utils.distance(start.x, start.y, end.x, end.y);
	}

	return cost;
}

pro.compressPath2= function(tilePath){
	var oldPos = tilePath[0];
	var path = [oldPos];

	for(var i = 1; i < (tilePath.length - 1); i++){
		var pos = tilePath[i];
		var nextPos = tilePath[i + 1];

		if(!isLine(oldPos, pos, nextPos)){
			path.push(pos);
		}

		oldPos = pos;
		pos = nextPos;
	}

	path.push(tilePath[tilePath.length - 1]);
	return path;
};

function isLine(p0, p1, p2){
	return ((p1.x-p0.x)===(p2.x-p1.x)) && ((p1.y-p0.y) === (p2.y-p1.y));
}

pro.compressPath1 = function(path, loopTime){
	var newPath;

	for(var k = 0; k < loopTime; k++){
		var start;
		var end;
		newPath = [path[0]];

		for(var i = 0, j = 2; j < path.length;){
			start = path[i];
			end = path[j];

			if(this._checkLinePath(start.x, start.y, end.x, end.y)){
				newPath.push(end);
				i = j;
				j += 2;
			}else{
				newPath.push(path[i + 1]);
				i++;
				j++;
			}

			if(j >= path.length){
				if((i + 2) === path.length){
					newPath.push(path[i + 1]);
				}
			}
		}
		path = newPath;
	}

	return newPath;
};

pro.forAllReachable = function(x, y, processReachable) {
	var x1 = x - 1, x2 = x + 1;
	var y1 = y - 1, y2 = y + 1;

	x1 = x1 < 0 ? 0 : x1;
	y1 = y1 < 0 ? 0 : y1;
	x2 = x2 >= this.rectW ? (this.rectW - 1) : x2;
	y2 = y2 >= this.rectH ? (this.rectH - 1) : y2;
	if(y>0) {
		processReachable(x, y - 1, this.weightMap[x][y - 1]);
	}
	if((y+1) < this.rectH) {
		processReachable(x, y + 1, this.weightMap[x][y + 1]);
	}
	if(x>0) {
		processReachable(x - 1, y, this.weightMap[x - 1][y]);
	}
	if((x+1) < this.rectW) {
		processReachable(x + 1, y, this.weightMap[x + 1][y]);
	}
};

function transPos(pos, tileW, tileH){
	var newPos = {};
	newPos.x = pos.x*tileW + tileW/2;
	newPos.y = pos.y*tileH + tileH/2;

	return newPos;
}

pro.findPath = function(x, y, x1, y1){
	if( x < 0 || x > this.width || y < 0 || y > this.height){
		cc.log("start point out boundary");
		return null;
	}

	if(x1 < 0 || x1 > this.width || y1 < 0 || y1 > this.height){
		cc.log("end point out boundary");
		return null;
	}

	if(!this.isReachable(x, y) || !this.isReachable(x1, y1)){
		return null;
	}

	if(this._checkLinePath(x, y, x1, y1)) {
		// return {path: [{x: x, y: y}, {x: x1, y: y1}], cost: utils.distance(x, y, x1, y1)};
		return [{x: x, y: y}, {x: x1, y: y1}];
	}

	var tx1 = Math.floor(x/this.tileW);
	var ty1 = Math.floor(y/this.tileH);
	var tx2 = Math.floor(x1/this.tileW);
	var ty2 = Math.floor(y1/this.tileH);

	var paths = this.pfinder(tx1, ty1, tx2, ty2);
	if(!paths){
		console.error('can not find path');
		return null;
	}

	// var result = {};
	var resPaths = [{x:x, y:y}];

	for(var i = 1; i < paths.length; i++){
		resPaths.push(transPos(paths[i], this.tileW, this.tileH));
	}

	resPaths.push({x: x1, y: y1});

	resPaths = this.compressPath2(resPaths);
	if(resPaths.length > 2){
		resPaths = this.compressPath1(resPaths, 3);
		resPaths = this.compressPath2(resPaths);
		if(!this.check(resPaths)){
			console.log('illegal path!!!');
			return null;
		}
	}

	// result.path = paths;
	// result.cost = computeCost(paths);
	return resPaths;
};

pro.check = function(path){
	for(var i = 1; i < path.length; i++){
		var p0 = path[i-1];
		var p1 = path[i];
		if(!this._checkLinePath(p0.x, p0.y, p1.x, p1.y)){
			//console.log('error ! i, p0, p1', i, p0, p1);
			return false;
		}
	}

	return true;
};



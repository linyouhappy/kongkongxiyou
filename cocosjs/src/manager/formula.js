var formula = {};

formula.bigNumber2Text = function(count) {
	var countName;
	if (count < 10000) {
		countName = count;
	} else if (count < 100000000) {
		if (count < 1000000)
			countName = (count / 10000).toFixed(2) + "万";
		else
			countName = Math.floor(count / 10000) + "万";
	} else {
		if (count < 1000000000)
			countName = (count / 100000000).toFixed(2) + "亿";
		else
			countName = Math.floor(count / 100000000) + "亿";
	}
	return countName;
};

formula.loginState = function(loginTime) {
	if (loginTime < 60) {
		loginTime = "在线";
		// isOnline = true;
	} else if (loginTime < 600) {
		loginTime = Math.floor(loginTime / 60) + "分钟前";
		// isOnline = true;
	} else if (loginTime < 3600) {
		loginTime = Math.floor(loginTime / 60) + "分钟前";
		// isOnline = true;
	} else if (loginTime < 86400) {
		loginTime = Math.floor(loginTime / 3600) + "小时前";
	} else {
		loginTime = Math.floor(loginTime / 86400) + "天前";
	}
	return loginTime;
};

formula.kindIdToItem = function(kindId) {
	var item = {
		kindId: kindId
	};
	if (kindId<8000) {
		item.type = EntityType.EQUIPMENT;
		item.percent = 0;
		item.totalStar = 0;
		itemData = dataApi.equipment.findById(kindId);
		item.baseValue = itemData.baseValue;
		item.potential = itemData.potential;
		item.count = 1;
		
		item.itemData = itemData;
	} else {
		item.type = EntityType.ITEM;
		itemData = dataApi.item.findById(kindId);
		item.itemData = itemData;
	}
	return item;
};

formula.inRange = function(origin, target, range) {
  var dx = origin.x - target.x;
  var dy = origin.y - target.y;
  return dx * dx + dy * dy <= range * range;
};

formula.distance = function(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;

  return Math.sqrt(dx * dx + dy * dy);
};

formula.enableOutline=function(label){
	label.enableOutline(consts.COLOR_BLACK,3);
};

formula.portraitName=function(bustId){
	return "icon/bust/bust_" + bustId + ".png";
};

formula.skinIdToIconImg = function(skinId) {
	return "icon/item/item_" + skinId + ".png";
};


formula.starToColorImg=function(totalStar){
	return "item_color_" + Math.ceil(totalStar / 2) + ".png"
};

formula.iconImgPath =function(skinId){
	return "icon/item/item_" + skinId + ".png";
};

formula.charaterSaying=function(kindId){
	var wordsData = dataApi.words.findById(kindId);
	if (!wordsData) {
		return;
	}
	var sayings=wordsData.saying;
	if (!sayings || sayings.length===0) {
		return;
	}
	if (cc.isString(sayings)) {
		sayings=sayings.split("||");
		wordsData.saying=sayings;
	}
	var index = Math.floor(Math.random() * sayings.length);
  	return sayings[index];
};

formula.buttonTipsEffect = function(button) {
	var sequence = cc.Sequence.create(
		cc.ScaleTo.create(0.1, 1.05),
		cc.ScaleTo.create(0.4, 0.95)
	);
	button.runAction(cc.RepeatForever.create(sequence));
};

formula.getKeysLength = function(map) {
  return Object.keys(map).length;
};

formula.calItemPrice=function(bagItem){
	return bagItem.baseValue+Math.floor(bagItem.potential*bagItem.percent/100)+Math.floor(consts.recycleRatio*bagItem.potential*(100-bagItem.percent)/100);
};

formula.calItemBuild=function(item){
	return item.baseValue+Math.floor(item.potential*item.percent/100)+Math.floor(consts.recycleRatio*item.potential*(100-item.percent)/100);
};

formula.directionToMoveDir=function(directionId){
	var moveDir={
		x:0,
		y:0
	};
	switch(directionId){
		case 1:
			moveDir.y=1;
			break;
		case 2:
			moveDir.x=1;
			moveDir.y=1;
			break;
		case 3:
			moveDir.x=1;
			break;
		case 4:
			moveDir.x=1;
			moveDir.y=-1;
			break;
		case 5:
			moveDir.y=-1;
			break;
		case 6:
			moveDir.x=-1;
			moveDir.y=-1;
			break;
		case 7:
			moveDir.x=-1;
			break;
		case 8:
			moveDir.x=-1;
			moveDir.y=1;
			break;
	}
	return moveDir;
};

formula.calculateDirection = function(deltaX, deltaY, distance) {
	var sinValue = deltaY / distance;
	var directionId = 0;
	if (deltaY >= 0) {
		if (deltaX >= 0) {
			// if (sinValue < 0.3826) {
			if (sinValue < 0.5) {
				directionId = 3;
				// } else if (sinValue < 0.9238) {
			} else if (sinValue < 0.866) {
				directionId = 2;
			} else {
				directionId = 1;
			}
		} else {
			// if (sinValue < 0.3826) {
			if (sinValue < 0.5) {
				directionId = 7;
				// } else if (sinValue < 0.9238) {
			} else if (sinValue < 0.866) {
				directionId = 8;
			} else {
				directionId = 1;
			}
		}
	} else {
		sinValue = Math.abs(sinValue);
		if (deltaX >= 0) {
			// if (sinValue < 0.3826) {
			if (sinValue < 0.5) {
				directionId = 3;
				// } else if (sinValue < 0.9238) {
			} else if (sinValue < 0.866) {
				directionId = 4;
			} else {
				directionId = 5;
			}
		} else {
			// if (sinValue < 0.3826) {
			if (sinValue < 0.5) {
				directionId = 7;
				// } else if (sinValue < 0.9238) {
			} else if (sinValue < 0.866) {
				directionId = 6;
			} else {
				directionId = 5;
			}
		}
	}
	return directionId;
};

var Bag = function() {
	// EventEmitter.call(this);
	this.capacity = 120;
	this.itemCount = 0;
	this.items = {};
	// this.equipItems={};
	this.lastGetBagInfoTime = 0;
};

// Bag.prototype = Object.create(EventEmitter.prototype);
var pro = Bag.prototype;

pro.getBagDataFromServer = function() {
	var self = this;
	playerHandler.getBag(function(bagData) {
		self.setBagData(bagData);
		if (layerManager.isRunPanel(cb.kMBagPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.setBagData();
		}
	});
};

pro.getBagInfoDataFromServer = function() {
	if (this.lastGetBagInfoTime > Date.now())
		return false;

	this.lastGetBagInfoTime = Date.now() + 600000;

	var self = this;
	circleLoadLayer.showCircleLoad();
	playerHandler.getBagInfo(function(bagInfoData) {
		circleLoadLayer.hideCircleLoad();
		if (bagInfoData && bagInfoData.length > 0) {
			var bagInfo;
			for (var i = 0; i < bagInfoData.length; i++) {
				bagInfo = bagInfoData[i];
				if (self.items[bagInfo[0]].id !== bagInfo[1]) {
					cc.log("ERROR:bag data no the same!");
					self.getBagDataFromServer();
					return;
				}
			}
		}
		if (layerManager.isRunPanel(cb.kMBagPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.setBagData();
		}
	});

	return true;
};

pro.setBagData = function(bagData) {
	this.items = {};
	this.itemCount = 0;

	this.capacity = bagData.capacity;
	var items = bagData.items;
	var item, itemData;
	for (var key in items) {
		item = items[key];
		itemData = null;

		if (item.type === EntityType.EQUIPMENT) {
			itemData = dataApi.equipment.findById(item.kindId);
		} else {
			itemData = dataApi.item.findById(item.kindId);
		}
		if (itemData) {
			item.itemData = itemData;
			this.items[item.position] = item;
		} else {
			this.items[item.position] = item;
			cc.log("ERROR:unknown item,no itemData");
		}

		this.itemCount++;
	}

};

pro.addItem = function(item, position) {
	if (position < 1 || !item || !item.id)
		return;

	if (item.type !== EntityType.ITEM && item.type !== EntityType.EQUIPMENT) {
		return;
	}

	if (!this.items[position]) {
		this.itemCount += 1;
	}
	item.position = position;
	this.items[position] = item;

	if (!item.itemData) {
		if (item.type === EntityType.EQUIPMENT) {
			item.itemData = dataApi.equipment.findById(item.kindId);
		} else {
			item.itemData = dataApi.item.findById(item.kindId);
		}
	}
};

pro.removeItem = function(position) {
	if (this.items[position]) {
		var item = this.items[position];
		delete this.items[position];
		this.itemCount -= 1;
		return item;
	}
};

pro.isFull = function() {
	return this.itemCount >= this.capacity;
};
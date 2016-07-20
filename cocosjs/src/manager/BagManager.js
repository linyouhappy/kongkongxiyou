cb.BagManager = cc.Class.extend({
	ctor: function() {
		this.capacity = 40;
		this.itemsCount = 0;
		this.bagItems = {};
		this.items = {};
	},

	getEquipments: function() {
		if (!this.equipments && !this.hasRequestEquip) {
			this.requestEquipments();
			return;
		}
		return this.equipments;
	},

	setEquipments: function(data) {
		this.equipments = new Equipments(data);
		layerManager.updatePanel(cb.kMBagPanelId, 2)
	},

	requestEquipments: function() {
		var self = this;
		equipHandler.getEquipments(function(data) {
			self.setEquipments(data);
		})

		this.hasRequestEquip = true;
	},

	requestBagData: function() {
		var self = this;
		equipHandler.getBag(function(bagData) {
			self.setBagData(bagData);
		})

		this.hasRequestBag = true;
	},

	getBagData: function() {
		if (!this.hasRequestBag) {
			this.requestBagData();
			return;
		}
		return this.bagItems;
	},

	getItem:function(itemId){
		return this.items[itemId];
	},

	setBagData: function(bagData) {
		this.bagItems = {};
		this.items = {};
		this.itemsCount = 0;
		this.capacity = bagData.capacity;

		var items = bagData.items;
		var item;
		for (var key in items) {
			this.addItem(items[key]);
		}
		layerManager.updatePanel(cb.kMBagPanelId, 1)
	},

	addItem: function(item) {
		if (!item || !item.id) {
			cc.log("ERROR:addItem item is invalid. item:" + JSON.stringify(item));
			return 0;
		}
		var count=1;
		if (item.type === EntityType.ITEM) {
			item.itemData = dataApi.item.findById(item.kindId);
			item.kind=item.itemData.kind;
			if (this.items[item.kindId]) {
				count=item.count-this.items[item.kindId].count;
			}else{
				count=item.count;
			}
			this.items[item.kindId] = item;
		} else if (item.type === EntityType.EQUIPMENT) {
			if (this.bagItems[item.id]) {
				cc.log("ERROR:addItem item is exist. item:" + JSON.stringify(item));
			}
			item.itemData = dataApi.equipment.findById(item.kindId);
			item.equipKind = item.itemData.kind;

			this.bagItems[item.id] = item;
			this.itemsCount++;
		} else {
			cc.log("ERROR:addItem item type is invalid. item:" + JSON.stringify(item));
		}
		return count;
	},

	removeItem: function(id) {
		var bagItem = this.bagItems[id]
		if (bagItem) {
			// if (bagItem.type === EntityType.ITEM) {
			// 	delete this.items[bagItem.kindId];
			// } else 
			if (bagItem.type === EntityType.EQUIPMENT) {
				delete this.bagItems[id];
				this.itemsCount--;
			} else {
				cc.log("ERROR:removeItem item type is invalid. item:" + JSON.stringify(item));
			}
		}
		return bagItem;
	},

	addItemCount: function(item) {
		var bagItem = this.items[item.kindId];
		if (bagItem) {
			bagItem.count += item.count;
		} else {
			item.type = EntityType.ITEM;
			item.itemData = dataApi.item.findById(item.kindId);
			item.kind=item.itemData.kind;
			this.items[item.kindId] = item;
		}
	},

	removeItemCount: function(kindId, count) {
		var item = this.items[kindId];
		if (item) {
			if (item.count > count) {
				item.count -= count;
			} else {
				delete this.items[item.kindId];
			}
		}
		return item;
	},

	isFull: function() {
		return this.itemsCount >= this.capacity;
	},

	getEquipDetail: function(itemId,callBack) {
		var bagItem = this.bagItems[itemId];
		if(!bagItem){
			quickLogManager.pushLog("装备信息丢失！");
			return;
		}
		equipHandler.getEquipDetail(itemId,function(equipDetail){
			var itemData = dataApi.equipment.findById(equipDetail.kindId);
			if (bagItem) {
				if (bagItem.kindId === equipDetail.kindId) {
					var percent = 0;
					var totalStar = 0;
					var subKey;

					for (var i=1;i<=12;i++) {
						subKey="star"+i;
						bagItem[subKey] = equipDetail[subKey];
						if (equipDetail[subKey]) {
							percent += equipDetail[subKey];
							totalStar++;
						}
					}
					bagItem.percent = percent;
					bagItem.totalStar = totalStar;
					if(callBack)
						callBack(bagItem);
				} else {
					cc.log("ERROR:Equipments.prototype.requestEquipDetail equipment.kindId!==equipDetail.kindId");
				}
			}

		});
	}

	// getIdItems: function() {
	// 	var data = {};
	// 	var items = this.items;
	// 	var item;
	// 	for (var key in items) {
	// 		item = items[key];
	// 		data[item.id] = item;
	// 	}
	// 	return data;
	// }

});

var bagManager = new cb.BagManager();


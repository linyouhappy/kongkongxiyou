var Equipments = function(opts) {
	var equipment;
	var curPlayer=app.getCurPlayer();
	for (var key in opts) {
		equipment = opts[key];
		equipment.type = EntityType.EQUIPMENT;
		equipment.itemData = dataApi.equipment.findById(equipment.kindId);
		equipment.equipKind=equipment.itemData.kind;
		equipment.jobId=curPlayer.jobId;
		this[equipment.equipKind] = equipment;
	}
};

Equipments.prototype.requestEquipDetail = function() {
	var self = this;
	circleLoadLayer.showCircleLoad();
	equipHandler.getEquipDetails(function(equipDetailData) {
		circleLoadLayer.hideCircleLoad();
		var equipDetail, itemData, equipment;
		for (var key in equipDetailData) {
			equipDetail = equipDetailData[key];
			itemData = dataApi.equipment.findById(equipDetail.kindId);
			equipment = self[itemData.kind];
			if (equipment) {
				if (equipment.kindId === equipDetail.kindId) {
					var percent = 0;
					var totalStar = 0;
					var subKey;

					for (var i=1;i<=12;i++) {
						subKey="star"+i;
						equipment[subKey] = equipDetail[subKey];
						if (equipDetail[subKey]) {
							percent += equipDetail[subKey];
							totalStar++;
						}
					}
					equipment.percent = percent;
					equipment.totalStar = totalStar;
				} else {
					cc.log("ERROR:Equipments.prototype.requestEquipDetail equipment.kindId!==equipDetail.kindId");
				}
			}
		}

		if (layerManager.isRunPanel(cb.kMBuildPanelId)) {
			var curPanel = layerManager.curPanel;
			curPanel.setEquipmentsData();
		}
	});
};

Equipments.prototype.setEquipment = function(equipKind, equipment) {
	var oldEquipment=this[equipKind];
	this[equipKind] = equipment;
	var curPlayer=app.getCurPlayer();
	if(equipment){
		equipment.equipKind=equipKind;
		equipment.jobId=curPlayer.jobId;
	}else{
		delete this[equipKind];
	}

	if (equipKind===EquipmentType.Weapon) {
		curPlayer.setWeapon(equipment);
	}

	if (oldEquipment) {
		var oldTotalValue = oldEquipment.baseValue + Math.floor(oldEquipment.potential * oldEquipment.percent / 100);
		var oldPropertyName = PropertyNames[oldEquipment.equipKind];
		if (equipment) {
			var totalValue = equipment.baseValue + Math.floor(equipment.potential * equipment.percent / 100);
			var propertyName = PropertyNames[equipment.equipKind];
			if (oldEquipment.equipKind===equipment.equipKind) {
				var deltaValue=totalValue-oldTotalValue;
				if (deltaValue<0) {
					// oldPropertyName = oldPropertyName + "减少 -" + (oldTotalValue-totalValue);
					quickLogManager.propertyLog(oldPropertyName,deltaValue);
					// quickLogManager.pushLog(oldPropertyName,2);
				}else if (deltaValue>0){
					quickLogManager.propertyLog(propertyName,deltaValue);
					// propertyName = propertyName + "增加 +" + (totalValue-oldTotalValue);
					// quickLogManager.pushLog(propertyName,5);
				}
				// cb.CommonLib.showFightingChangeEffect(oldTotalValue,totalValue);
			}else{
				// propertyName = propertyName + "增加 +" + totalValue;
				// quickLogManager.pushLog(propertyName,5);
				// oldPropertyName = oldPropertyName + "减少 -" + oldTotalValue;
				// quickLogManager.pushLog(oldPropertyName,2);

				quickLogManager.propertyLog(propertyName,totalValue);
				quickLogManager.propertyLog(oldPropertyName,-oldTotalValue);

				// cb.CommonLib.showFightingChangeEffect(oldTotalValue,totalValue);
			}
		}else{
			// oldPropertyName = oldPropertyName + "减少 -" + oldTotalValue;
			// quickLogManager.pushLog(oldPropertyName,2);
			quickLogManager.propertyLog(oldPropertyName,-oldTotalValue);

			// cb.CommonLib.showFightingChangeEffect(0,-oldTotalValue);
		}
	}else if (equipment) {
		var totalValue = equipment.baseValue + Math.floor(equipment.potential * equipment.percent / 100);
		var propertyName = PropertyNames[equipment.equipKind];

		quickLogManager.propertyLog(propertyName,totalValue);
		// propertyName = propertyName + "增加 +" + totalValue;
		// quickLogManager.pushLog(propertyName,5);

		// cb.CommonLib.showFightingChangeEffect(0,totalValue);
	}

	curPlayer.equipments=bagManager.getEquipments();
	propertyManager.setTotalAttackAndDefence(curPlayer);
	curPlayer.setHp(curPlayer.hp);
	curPlayer.setMp(curPlayer.mp);
};

Equipments.prototype.getEquipment = function(equipKind) {
	return this[equipKind];
};


var equipHandler = {
	upgradeHpMp: function(kind) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.upgradeHpMp", {
			kind: kind
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var curPlayer = app.getCurPlayer();
				if (kind === 1) {
					curPlayer.setHpLevel(data.level);
					quickLogManager.pushLog("红瓶 +1级",4);
				} else {
					curPlayer.setMpLevel(data.level);
					quickLogManager.pushLog("蓝瓶 +1级",2);
				}
				layerManager.updatePanel(cb.kMMakeDrugPanelId, 1);
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	refineHpMp: function(kind, kindId, count) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.refineHpMp", {
			kind: kind,
			kindId: kindId,
			count: count
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var curPlayer = app.getCurPlayer();
				if (kind === 1) {
					curPlayer.hpCount=data.count;
				} else {
					curPlayer.mpCount=data.count;
				}
				bagManager.removeItemCount(kindId, count);
				mainPanel.setHpMp(curPlayer);
				layerManager.updatePanel(cb.kMMakeDrugPanelId, 2);

				quickLogManager.lostItemLogByKindId(kindId, count);
				quickLogManager.getHPMPLog(data.count,(kind === 1));
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	oneKeySell: function(sellItems) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.oneKeySell", sellItems, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				for (var i = 0; i < sellItems.length; i++) {
					bagManager.removeItem(sellItems[i]);
				}

				var curLayer = layerManager.getRunLayer(cb.kMSellPanelId);
				if (curLayer) {
					curLayer.setPanelData();
				}

				if (layerManager.isRunPanel(cb.kMBagPanelId)) {
					var curPanel = layerManager.curPanel;
					curPanel.updatePanel(1);
				}
			}
		});
	},

	sellItem: function(id) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.sellItem", {id:id}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				bagManager.removeItem(id);
				layerManager.updatePanel(cb.kMBagPanelId,1)
			}
		});
	},

	getEquipments: function(callBack) {
		pomelo.request("area.equipHandler.getEquipments", {}, function(data) {
			if (data && callBack) {
				callBack(data);
			}
		});
	},

	getEquipDetail: function(itemId,callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.getEquipDetail", {
			itemId: itemId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data && callBack) {
				callBack(data);
			}
		});
	},

	getEquipDetails:function(callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.getEquipDetails", {}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data && callBack) {
				callBack(data);
			}
		});
	},

	equipOpen: function(equipmentId,itemId, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request('area.equipHandler.equipOpen', {
			itemId: equipmentId,
			kindId:itemId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				if (callBack) {
					callBack(data);
				}
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	equipRecycle: function(equipmentId, stars, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request('area.equipHandler.equipRecycle', {
			itemId: equipmentId,
			stars: stars
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				if (callBack) {
					callBack(data);
				}
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	pickItem: function(targetId) {
		pomelo.notify('area.equipHandler.pickItem', {
			targetId: targetId
		});
	},

	pickTarget: function(targetId) {
		pomelo.notify('area.equipHandler.pickTarget', {
			targetId: targetId
		});
	},

	cancelPick: function(targetId) {
		pomelo.notify('area.equipHandler.cancelPick', {
			targetId: targetId
		});
	},

	dropItem: function(kindId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.dropItem", {
			kindId: kindId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var item = bagManager.items[kindId];
				bagManager.removeItemCount(kindId,item.count);

				layerManager.updatePanel(cb.kMBagPanelId, 1);
			}
		});
	},

	useItem: function(kindId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.useItem", {
			kindId: kindId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				bagManager.removeItemCount(kindId);
				layerManager.updatePanel(cb.kMBagPanelId, 1);
			}
		});
	},

	equip: function(id) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.equip", {
			id: id
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var item = bagManager.removeItem(id);
				if (item) {
					var equipKind = item.itemData.kind;
					var equipment = bagManager.equipments.getEquipment(equipKind);
					item.bind=1;
					bagManager.equipments.setEquipment(equipKind, item);
					if (equipment) {
						bagManager.addItem(equipment);
					}
					layerManager.updatePanel(cb.kMBagPanelId, 0);
				}
			} else if (!!data.code) {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	unEquip: function(equipKind) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.unEquip", {
			equipKind: equipKind
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var equipment = bagManager.equipments.getEquipment(equipKind);
				bagManager.equipments.setEquipment(equipKind, null);
				if (equipment) {
					bagManager.addItem(equipment);
				}
				layerManager.updatePanel(cb.kMBagPanelId, 0);
			} else if (!!data.code) {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	// bagCleanUp:function(){
	// 	circleLoadLayer.showCircleLoad();
	// 	pomelo.request("area.equipHandler.bagCleanUp", {}, function(data) {
	// 		circleLoadLayer.hideCircleLoad();
	// 	});
	// },

	getBag: function(callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.equipHandler.getBag", {}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				if (callBack) {
					callBack(data);
				}
			} else if (!!data.code) {
				quickLogManager.showErrorCode(data.code);
			}
		});
	}

	// getBagInfo: function(callBack) {
	// 	circleLoadLayer.showCircleLoad();
	// 	pomelo.request("area.equipHandler.getBagInfo", {}, function(data) {
	// 		circleLoadLayer.hideCircleLoad();
	// 		if (callBack) {
	// 			callBack(data);
	// 		}
	// 	});
	// }

};
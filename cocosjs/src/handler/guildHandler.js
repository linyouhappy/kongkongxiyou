var guildHandler = {

	itemAffiche: function(id) {
		id=id || 0;
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.itemAffiche", {
			id: id
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			guildManager.setItemAffiches(data);
		});
	},

	guildAffiche: function(id) {
		id=id || 0;
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.guildAffiche", {
			id: id
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			guildManager.setGuildAffiches(data);
		});
	},

	getGuild: function(guildId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.getGuild", {
			guildId: guildId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code) {
				quickLogManager.showErrorCode(data.code);
			} else {
				guildManager.addGuildDetail(data);
			}
		});
	},

	getMembers: function(guildId, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.getMembers", {
			guildId: guildId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack(data);
			}
		});
	},

	createGuild: function(guildName) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.guildHandler.createGuild", {
			guildName: guildName
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				// app.getCurPlayer().guildId = data.guildId;
				app.getCurPlayer().setGuildId(data.guildId);
				guildManager.clearGuilds();
				guildManager.requestEnterGuild();
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	getGuilds: function(start) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.getGuilds", {
			start: start
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			guildManager.addGuilds(data);
		});
	},

	guildDesc: function(desc) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.guildDesc", {
			desc: desc
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code !== 200) {
				quickLogManager.showErrorCode(data.code);
			} else {
				guildManager.setMyGuildDesc(desc);
			}
		});
	},

	enterGuild: function() {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.enterGuild", null, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 201) {
				guildManager.setMyGuild();
			} else if (data.code) {
				quickLogManager.showErrorCode(data.code);
			} else {
				guildManager.setMyGuild(data);
			}
		});
	},

	disbandGuild: function(guildId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.guildHandler.disbandGuild", {
			guildId: guildId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200 || data.code === 108) {
				app.getCurPlayer().setGuildId(0);
				guildManager.clearGuilds();
				guildManager.requestEnterGuild();
			}
			if (data.code !== 200) {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	applyGuild: function(guildId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.applyGuild", {
			guildId: guildId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200 || data.code === 201) {
				guildManager.addApplyGuild(guildId);
				quickLogManager.pushLog("已发送加入申请！");
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	applyGuildReply: function(playerId, reply) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.applyGuildReply", {
			playerId: playerId,
			reply: reply
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
		});
	},

	inviteGuild: function(playerId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.inviteGuild", {
			playerId: playerId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code !== 200) {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	inviteGuildReply: function(guildId) {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("manager.guildHandler.inviteGuildReply", {
			guildId: guildId
		}, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	kickGuild: function(playerId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.kickGuild", {
			playerId: playerId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200 || data.code === 201) {
				var guildId = app.getCurPlayer().guildId || 0;
				guildManager.requestGetMembers(guildId, true);
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	appointGuild: function(playerId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.appointGuild", {
			playerId: playerId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200 || data.code === 201) {
				var guildId = app.getCurPlayer().guildId || 0;
				guildManager.requestGetMembers(guildId, true);
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	getItems: function(itemIds) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.getItems", itemIds, function(data) {
			circleLoadLayer.hideCircleLoad();

			var items = guildManager.getItems() || {};
			var removeIds = data[1];
			for (var key in removeIds) {
				delete items[removeIds[key]];
			}
			var item;
			var addItems = data[0];
			for (var key in addItems) {
				item = addItems[key];
				item.type = EntityType.EQUIPMENT;
				item.itemData = dataApi.equipment.findById(item.kindId);
				items[item.itemId] = item;
			}
			guildManager.setItems(items);
		});
	},

	guildItem: function(guildId, itemId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.guildHandler.guildItem", {
			guildId: guildId,
			itemId: itemId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var bagItem = bagManager.removeItem(itemId);
				bagItem.itemId = bagItem.id;
				delete bagItem["id"];

				var build = formula.calItemBuild(bagItem);
				var myGuild = guildManager.myGuild;
				if (myGuild) {
					myGuild.myBuild += build;
				}
				quickLogManager.pushLog("获得积分 +" + build, 3);
				guildManager.addItem(bagItem);
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	playerItem: function(guildId, item) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.guildHandler.playerItem", {
			guildId: guildId,
			itemId: item.itemId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var build = formula.calItemBuild(item) * 2;
				var myGuild = guildManager.myGuild;
				if (myGuild) {
					myGuild.myBuild -= build;
				}
				quickLogManager.pushLog("消耗积分 -" + build, 2);
				guildManager.removeItem(item.itemId);
			} else {
				if (data.code === 40) {
					guildManager.removeItem(item.itemId);
				}
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	clearItems: function(itemIds) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.clearItems", itemIds, function(data) {
			circleLoadLayer.hideCircleLoad();
			var avaItemIds = data;

			var itemId;
			var totalBuild = 0;
			var items = guildManager.getItems() || {};
			for (var i = 0; i < avaItemIds.length; i++) {
				itemId = avaItemIds[i];
				if (items[itemId]) {
					totalBuild += formula.calItemBuild(items[itemId]);
				}
			}
			var myGuild = guildManager.myGuild;
			myGuild.build += totalBuild;

			quickLogManager.pushLog("集团获得积分 +" + totalBuild, 3);

			for (var i = 0; i < itemIds.length; i++) {
				delete items[itemIds[i]];
			}

			var curLayer = layerManager.getRunLayer(cb.kMClearItemPanelId);
			if (curLayer) {
				curLayer.updatePanelData();
			}
			guildManager.setItems(items);
		});
	},

	upgrade: function() {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.upgrade", null, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var myGuild = guildManager.myGuild;
				var guildData = dataApi.guild.findById(myGuild.level + 1);
				if (guildData) {
					myGuild.level++;
					myGuild.build -= guildData.build;
					myGuild.caoCoin -= guildData.caoCoin;

					var curLayer = layerManager.getRunLayer(cb.kMGuildUpgradePanelId);
					if (curLayer) {
						curLayer.setPanelData();
					}
					if (layerManager.isRunPanel(cb.kMGuildPanelId)) {
						var curPanel = layerManager.curPanel;
						curPanel.updatePanelData();
					}
				}
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	getSalary: function(guildId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.guildHandler.getSalary", {
			guildId: guildId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {

			} else if (data.code === 201) {
				quickLogManager.pushLog("今天的工资已领取！");
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	recruit: function() {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("manager.guildHandler.recruit", null, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	getDomains:function(){
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.guildHandler.getDomains", null, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data && data.length!==0) {
				guildManager.setDomains(data);
			}
		});
	},

	getGuildInfo: function(guildId, callback) {
		pomelo.request("manager.guildHandler.getGuildInfo", {
			guildId: guildId
		}, function(data) {
			if (callback) {
				callback(data);
			}
		});
	}

};
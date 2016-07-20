var marketHandler = {
	getMarketList: function(callBack) {
		circleLoadLayer.showCircleLoad();	
		pomelo.request("trade.marketHandler.getMarketList", {}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack(data);
			}
		});
	},

	getFiveTrade: function(kindId, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("trade.marketHandler.getFiveTrade", {
			kindId: kindId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack && cc.isArray(data)) {
				callBack(data);
			}
		});
	},

	getTenTrade: function(kindId, id,callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("trade.marketHandler.getTenTrade", {
			kindId: kindId,
			id:id
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack && cc.isArray(data)) {
				callBack(data);
			}
		});
	},

	getDetailTrade: function(kindId, id,callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("trade.marketHandler.getDetailTrade", {
			kindId: kindId,
			id:id
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack && cc.isArray(data)) {
				callBack(data);
			}
		});
	},
	
	getPlayerBank:function(callBack){
		circleLoadLayer.showCircleLoad();	
		pomelo.request("trade.marketHandler.getPlayerBank", {}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code) {
				quickLogManager.showErrorCode(data.code);
			} else {
				if (callBack) {
					callBack(data);
				}
			}
		});
	},

	inputCaoCoin: function(caoCoin, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.marketHandler.inputCaoCoin", {
			caoCoin: caoCoin
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

	outputCaoCoin: function(caoCoin, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.marketHandler.outputCaoCoin", {
			caoCoin: caoCoin
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

	outputItems: function(callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.marketHandler.outputItems", {}, function(data) {
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

	cancelOrder: function(id,type) {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("trade.marketHandler.cancelOrder", {id:id,type:type}, function() {
			circleLoadLayer.hideCircleLoad();
			if (type===0) {
				quickLogManager.pushLog("撤单后的金额将转入交易账户！");
			}else{
				quickLogManager.pushLog("撤单后的物品将转入交易账户！");
			}
		});
	},

	buyOrder: function(kindId, price, count, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("trade.marketHandler.buyOrder", {
			kindId:kindId,
			price: price,
			count: count
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				marketManager.setPriceByKindId(kindId,data.price);
				if (callBack) {
					callBack(data.id);
				}
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	sellOrder: function(kindId, price, count, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.marketHandler.sellOrder", {
			kindId:kindId,
			price: price,
			count: count
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				if (callBack) {
					callBack(data.id);
				}
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	}

};
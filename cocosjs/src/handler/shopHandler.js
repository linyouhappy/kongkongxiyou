var shopHandler = {
	lottery:function(times){
		circleLoadLayer.showCircleLoad();
		pomelo.request('area.shopHandler.lottery', {times:times}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code===200) {
				if (layerManager.isRunPanel(cb.kMFruitSlotPanelId)) {
					var curPanel = layerManager.curPanel;
					curPanel.startTrain(data.ids);
				}
			}else{
				quickLogManager.showErrorCode(data.code);
			}
			// quickLogManager.setEnableLog(true);
		});
	},

	shopBuy: function(shopId, count) {
		pomelo.notifyWithLoad('area.shopHandler.shopBuy', {
			shopId: shopId,
			count: count
		});
	},

	recharge:function(buyId){
		pomelo.notifyWithLoad('area.shopHandler.recharge', {
			buyId: buyId
		});
	},

	exchange:function(buyId){
		pomelo.notifyWithLoad('area.shopHandler.exchange', {
			buyId: buyId
		});
	},

	receive:function(giftId){
		pomelo.notifyWithLoad('area.shopHandler.receive', {
			giftId: giftId
		});
	},

	getVipInfo: function() {
		circleLoadLayer.showCircleLoad();
		pomelo.request('area.shopHandler.getVipInfo', {}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.rmb===0 || data.rmb) {
				if (layerManager.isRunPanel(cb.kMVipPanelId)) {
					var curPanel = layerManager.curPanel;
					curPanel.updatePanelData(data);
				}
			}
		});
	}

};
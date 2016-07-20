var chatHandler = {
	send: function(msg) {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("manager.chatHandler.send", msg, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	getChatItem:function(itemId,callback){
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.chatHandler.getChatItem", {
			itemId: itemId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callback) {
				callback(data);
			}
		});
	},

	readMail:function(mailId){
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.chatHandler.readMail", {
			mailId: mailId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code !== 200) {
				quickLogManager.showErrorCode(data.code);
			}
			var mail=mailManager.topMail();
			if (mail.mailId===mailId) {
				mailManager.popMail();
			}
			layerManager.updatePanel(cb.kMMailPanelId);
		});
	}
};

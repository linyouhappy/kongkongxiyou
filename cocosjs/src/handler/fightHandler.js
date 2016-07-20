var fightHandler = {
	enterFight: function(fightAfficheIndex,fightCount) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.fightHandler.enterFight", {
			index: fightAfficheIndex,
			count:fightCount
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				fightManager.setFightCount(data.count);
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	exitFight:function(){
		pomelo.notify("manager.fightHandler.exitFight",null);
	},

	readyFight: function(fightLevel) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.fightHandler.readyFight", {
			level: fightLevel
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code !== 200) {
				fightManager.enterFight();
			}
		});
	},

	cancelFight: function() {
		pomelo.notify("manager.fightHandler.cancelFight", null);
	},

	changeFight:function(fightLevel,prepare){
		prepare=prepare || 0;
		circleLoadLayer.showCircleLoad();
		pomelo.request("manager.fightHandler.changeFight", {
			level: fightLevel,
			prepare:prepare
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code !== 200) {
				fightManager.enterFight();
			} else {
				var layer = layerManager.getRunLayer(cb.kMFightSelectPanelId);
				if (layer) {
					layer.requesting = false;
				}
			}
		});
	},

	prepareFight: function() {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("manager.fightHandler.prepareFight", null, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	fightPrize:function(){
		circleLoadLayer.showCircleLoad();
		pomelo.notify("area.fightHandler.fightPrize", null, function() {
			circleLoadLayer.hideCircleLoad();
		});
	}


};

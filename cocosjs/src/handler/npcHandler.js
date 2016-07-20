var npcHandler = {
	changeArea: function(areaId,argId) {
		if (!areaId || app.areaId === areaId)
			return;

		var curPlayer=app.getCurPlayer();
		var areaData = dataApi.area.findById(areaId);
		if (curPlayer.level<areaData.level) {
			quickLogManager.pushLog("角色需要"+areaData.level+"级方可进入"+areaData.areaName+"。",1);
			return;
		}

		var msg = {
			targetId: areaId
		};
		if (argId) {
			msg.argId=argId;
		}
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.playerHandler.changeArea", msg, function(data) {
			cc.log("onChangeArea==============>>>");
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				appHandler.loadResource();
			} else if (!!data.code) {
				tipsBoxLayer.showErrorCode(data.code);
			}
		});
	},

	// resetArea:function(){
	// 	circleLoadLayer.showCircleLoad();
	// 	pomelo.notify('connector.entryHandler.resetArea',{},function(){
	// 		circleLoadLayer.hideCircleLoad();
	// 		appHandler.loadResource();
	// 	});
	// },

	npcTalk: function(targetId) {
		var msg = {
			targetId: targetId
		}
		circleLoadLayer.showCircleLoad();
		pomelo.request('area.playerHandler.npcTalk',msg,function(data){
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var area = app.getCurArea();
		        var npc = area.getEntity(targetId);
		        if (!npc) {
		            tipsBoxLayer.showTipsBox("npc未找到:" + targetId);
		            return;
		        }
		        var curPlayer = app.getCurPlayer();
		        curPlayer.setDirectionByPoint(npc.x, npc.y);
		        curPlayer.standAction();
		        npc.openPanel();
			} else if (data.code) {
				tipsBoxLayer.showErrorCode(data.code);
			}
		});
	}
};
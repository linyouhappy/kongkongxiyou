var appHandler = {
	enterScene: function() {
		cc.log("appHandler.enterScene==============>>");
		cb.CommonLib.removeRes("uiimg/load_scene.png");
		cb.CommonLib.removeRes("uiimg/load_scene.png");
		app.init();
		app.enterSceneReqId=pomelo.request("area.playerHandler.enterScene",{}, function(data) {
			if (appHandler.resourceLoader) {
				appHandler.resourceLoader.complete();
			}
			if (data.code===200) {
			}else if (data.code === 201) {
				data.areaState=AreaStates.BATTLE_STATE;
			}else{
				tipsBoxLayer.showErrorCode(data.code);
				return;
			}
			setTimeout(function() {
    	 		app.setData(data);
    	 	},10);
			
		});
	},

	loadResource: function() {
		// if (appHandler.resourceLoader) {
		// 	cc.log("ERROR:forbind frequently enterScene");
		// 	return;
		// }

		cc.log("appHandler.loadResource==============>>");
		app.destroyAllData();
		var loadingScene = new LoadingScene();
		var loadingLayer = loadingScene._loadingLayer;
		cc.director.replaceScene(loadingScene);

		var resourceLoader = new ResourceLoader();
		appHandler.resourceLoader=resourceLoader;
		resourceLoader.loadAreaResource(loadingLayer);
	},
};
var bossHandler = {
  getMyBoss: function() {
    circleLoadLayer.showCircleLoad();
    pomelo.request("area.bossHandler.getMyBoss", {}, function(data) {
      circleLoadLayer.hideCircleLoad();
      if (data.times) {
        if (layerManager.isRunPanel(cb.kMBossPanelId)) {
          var curPanel = layerManager.curPanel;
          curPanel.updatePanelData(data);
        }
      }else{
        quickLogManager.showErrorCode(121);
      }
    });
  },

  inMyBoss:function(areaId){
    circleLoadLayer.showCircleLoad();
    pomelo.request("area.bossHandler.inMyBoss", {targetId:areaId}, function(data) {
      circleLoadLayer.hideCircleLoad();
      if (data.code===200) {
        appHandler.loadResource();
      }else{
        quickLogManager.showErrorCode(data.code);
      }
    });
  },

  getWorldBoss: function() {
    circleLoadLayer.showCircleLoad();
    pomelo.request("area.bossHandler.getWorldBoss", {}, function(data) {
      circleLoadLayer.hideCircleLoad();
      if (layerManager.isRunPanel(cb.kMWorldBossPanelId)) {
        var curPanel = layerManager.curPanel;
        curPanel.updatePanelData(data);
      }
    });
  }
};





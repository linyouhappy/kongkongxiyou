cb.kMChatPanelId=1;
cb.kMPlotPanelId=2;
cb.kMPlayerPanelId=3;

cb.kMMapPanelId=4;
cb.kMTeamPanelId=5;
cb.kMSellPanelId=6;
cb.kMMakeDrugPanelId=7;
cb.kMMarketDetailPanelId=8;
cb.kMFederationPanelId=9;
cb.kMFightPanelId=10;
cb.kMGuildDetailPanelId=12;
cb.kMFightSelectPanelId=13;
cb.kMClearItemPanelId=14;
cb.kMDomainPanelId=15;
cb.kMMailPanelId=16;
cb.kMMyBossPanelId=17;
cb.kMWorldBossPanelId=18;
cb.kMBossPanelId=20;

cb.kMRankingPanelId=19;
cb.kMTeamBossPanelId=20;
cb.kMChallengePanelId=21;

cb.kMVipPanelId=22;
cb.kMShopBuyItemPanelId=23;
cb.kMFruitSlotPanelId=24;

cb.kMRolePanelId=101;
cb.kMBagPanelId=102;
cb.kMSkillPanelId=103;
cb.kMBuildPanelId=104;
cb.kMShopPanelId=105;
cb.kMMarketPanelId=106;
cb.kMSettingPanelId=107;
cb.kMGuildPanelId=108;

cb.kMElectionPanelId=201;
cb.kMImpeachPanelId=202;
cb.kMTransportPanelId=203;
cb.kMPlotTextPanelId=204;
cb.kMTaskPanelId=205;
cb.kMNewEquipmentPanelId=206;
cb.kMNewFunctionPanelId=207;
cb.kMGuildUpgradePanelId=208;

cb.kMFightWinPanelId=209;
cb.kMFightFailPanelId=210;

cb.kMDomainDetailLayerId=211;


panelCreateFuns={};



//kMWorldBossPanelId
panelCreateFuns[cb.kMWorldBossPanelId] = function(manager) {
    requireJS('src/panel/WorldBossPanel.js');
    var tmpPanel = new cb.WorldBossPanel();
    return tmpPanel;
};

//kMBossPanelId
panelCreateFuns[cb.kMBossPanelId] = function(manager) {
    requireJS('src/panel/BossPanel.js');
    var tmpPanel = new cb.BossPanel();
    return tmpPanel;
};

//kMFruitSlotPanelId
panelCreateFuns[cb.kMFruitSlotPanelId] = function(manager) {
    requireJS('src/panel/FruitSlotPanel.js');
    var tmpPanel = new cb.FruitSlotPanel();
    return tmpPanel;
};

//kMShopBuyItemPanelId
panelCreateFuns[cb.kMShopBuyItemPanelId] = function(manager) {
    // requireJS('src/panel/ShopBuyItemPanel.js');
    var tmpPanel = new cb.ShopBuyItemPanel();
    return tmpPanel;
};

//kMVipPanelId
panelCreateFuns[cb.kMVipPanelId] = function(manager) {
    requireJS('src/panel/VipPanel.js');
    var tmpPanel = new cb.VipPanel();
    return tmpPanel;
};

//kMMyBossPanelId
panelCreateFuns[cb.kMMyBossPanelId] = function(manager) {
    requireJS('src/panel/MyBossPanel.js');
    var tmpPanel = new cb.MyBossPanel();
    return tmpPanel;
};

//kMMailPanelId
panelCreateFuns[cb.kMMailPanelId] = function(manager) {
    requireJS('src/panel/MailPanel.js');
    var tmpPanel = new cb.MailPanel();
    return tmpPanel;
};

//kMDomainDetailLayerId
panelCreateFuns[cb.kMDomainDetailLayerId] = function(manager) {
    // requireJS('src/panel/FightResultPanel.js');
    var tmpPanel = new cb.DomainDetailLayer();
    return tmpPanel;
};

//kMFightWinPanelId
panelCreateFuns[cb.kMFightWinPanelId] = function(manager) {
    requireJS('src/panel/FightResultPanel.js');
    var tmpPanel = new cb.FightWinLayer();  
    return tmpPanel;
};

//kMFightFailPanelId
panelCreateFuns[cb.kMFightFailPanelId] = function(manager) {
    requireJS('src/panel/FightResultPanel.js');
    var tmpPanel = new cb.FightFailLayer();
    return tmpPanel;
};

//kMDomainPanelId
panelCreateFuns[cb.kMDomainPanelId] = function(manager) {
    requireJS('src/panel/DomainPanel.js');
    var tmpPanel = new cb.DomainPanel();
    return tmpPanel;
};

//kMGuildUpgradePanelId
panelCreateFuns[cb.kMGuildUpgradePanelId] = function(manager) {
    // requireJS('src/panel/GuildUpgradeLayer.js');
    var tmpPanel = new cb.GuildUpgradeLayer();
    return tmpPanel;
};

//kMClearItemPanelId
panelCreateFuns[cb.kMClearItemPanelId] = function(manager) {
    requireJS('src/panel/ClearItemPanel.js');
    var tmpPanel = new cb.ClearItemPanel();
    return tmpPanel;
};

//kMFightSelectPanelId
panelCreateFuns[cb.kMFightSelectPanelId] = function(manager) {
    // requireJS('src/panel/NewFunctionPanel.js');
    var tmpPanel = new cb.FightSelectLayer();
    return tmpPanel;
};

//kMNewFunctionPanelId
panelCreateFuns[cb.kMNewFunctionPanelId] = function(manager) {
    requireJS('src/panel/NewFunctionPanel.js');
    var tmpPanel = new cb.NewFunctionPanel();
    return tmpPanel;
};

//kMSettingPanelId
panelCreateFuns[cb.kMSettingPanelId] = function(manager) {
    requireJS('src/panel/SettingPanel.js');
    var tmpPanel = new cb.SettingPanel();
    return tmpPanel;
};

//kMNewEquipmentPanelId
panelCreateFuns[cb.kMNewEquipmentPanelId] = function(manager) {
    requireJS('src/panel/NewEquipmentPanel.js');
    var tmpPanel = new cb.NewEquipmentPanel();
    return tmpPanel;
};

//kMTaskPanelId
panelCreateFuns[cb.kMTaskPanelId] = function(manager) {
    requireJS('src/panel/TaskPanel.js');
    var tmpPanel = new cb.TaskPanel();
    return tmpPanel;
};

//kMTaskPanelId
panelCreateFuns[cb.kMTaskPanelId] = function(manager) {
    requireJS('src/panel/TaskPanel.js');
    var tmpPanel = new cb.TaskPanel();
    return tmpPanel;
};

//kMPlotTextPanelId
panelCreateFuns[cb.kMPlotTextPanelId] = function(manager) {
    requireJS('src/panel/PlotTextPanel.js');
    var tmpPanel = new cb.PlotTextPanel();
    return tmpPanel;
};

//kMTransportPanelId
panelCreateFuns[cb.kMTransportPanelId] = function(manager) {
    requireJS('src/panel/TransportPanel.js');
    var tmpPanel = new cb.TransportPanel();
    return tmpPanel;
};

//kMGuildDetailPanelId
panelCreateFuns[cb.kMGuildDetailPanelId] = function(manager) {
    requireJS('src/panel/GuildPanel.js');
    var tmpPanel = new cb.GuildDetailPanel();
    return tmpPanel;
};

//kMImpeachPanelId
panelCreateFuns[cb.kMImpeachPanelId] = function(manager) {
    var tmpPanel = new cb.FedImpeachLayer();
    return tmpPanel;
};

//kMElectionPanelId
panelCreateFuns[cb.kMElectionPanelId] = function(manager) {
    var tmpPanel = new cb.FedElectionLayer();
    return tmpPanel;
};

//kMChatPanelId
panelCreateFuns[cb.kMChatPanelId] = function(manager) {
    var tmpPanel = new cb.ChatPanel();
    return tmpPanel;
};

//kMPlotPanelId
panelCreateFuns[cb.kMPlotPanelId] = function(manager) {
    requireJS('src/panel/PlotPanel.js');
    var tmpPanel = new cb.PlotPanel();
    return tmpPanel;
};

//kMPlayerPanelId
panelCreateFuns[cb.kMPlayerPanelId] = function(manager) {
    requireJS('src/panel/PlayerPanel.js');
    var tmpPanel = new cb.PlayerPanel();
    return tmpPanel;
};

//kMRolePanelId
panelCreateFuns[cb.kMRolePanelId] = function(manager) {
    requireJS('src/panel/RolePanel.js');
    var tmpPanel = new cb.RolePanel();
    return tmpPanel;
};

//kMBagPanelId
panelCreateFuns[cb.kMBagPanelId] = function(manager) {
    requireJS('src/panel/BagPanel.js');
    var tmpPanel = new cb.BagPanel();
    return tmpPanel;
};

//kMSkillPanelId
panelCreateFuns[cb.kMSkillPanelId] = function(manager) {
    requireJS('src/panel/SkillInfoPanel.js');
    var tmpPanel = new cb.SkillInfoPanel();
    return tmpPanel;
};

//kMBuildPanelId
panelCreateFuns[cb.kMBuildPanelId] = function(manager) {
    requireJS('src/panel/BuildPanel.js');
    var tmpPanel = new cb.BuildPanel();
    return tmpPanel;
};

//kMShopPanelId
panelCreateFuns[cb.kMShopPanelId] = function(manager) {
    requireJS('src/panel/ShopPanel.js');
    var tmpPanel = new cb.ShopPanel();
    return tmpPanel;
};

//kMMapPanelId
panelCreateFuns[cb.kMMapPanelId] = function(manager) {
    requireJS('src/panel/MapPanel.js');
    var tmpPanel = new cb.MapPanel();
    return tmpPanel;
};

//kMTeamPanelId
panelCreateFuns[cb.kMTeamPanelId] = function(manager) {
    requireJS('src/panel/TeamPanel.js');
    var tmpPanel = new cb.TeamPanel();
    return tmpPanel;
};

//kMSellPanelId
panelCreateFuns[cb.kMSellPanelId] = function(manager) {
    requireJS('src/panel/SellPanel.js');
    var tmpPanel = new cb.SellPanel();
    return tmpPanel;
};

//kMMarketPanelId
panelCreateFuns[cb.kMMarketPanelId] = function(manager) {
    requireJS('src/panel/MarketPanel.js');
    var tmpPanel = new cb.MarketPanel();
    return tmpPanel;
};

//kMMakeDrugPanelId
panelCreateFuns[cb.kMMakeDrugPanelId] = function(manager) {
    requireJS('src/ui/MakeDrugLayer.js');
    var tmpPanel = new cb.MakeDrugLayer();
    return tmpPanel;
};

//kMMarketDetailPanelId
panelCreateFuns[cb.kMMarketDetailPanelId] = function(manager) {
    requireJS('src/panel/MarketDetailPanel.js');
    var tmpPanel = new cb.MarketDetailPanel();
    return tmpPanel;
};

//kMFederationPanelId
panelCreateFuns[cb.kMFederationPanelId] = function(manager) {
    requireJS('src/panel/FederationPanel.js');
    var tmpPanel = new cb.FederationPanel();
    return tmpPanel;
};

//kMFightPanelId
panelCreateFuns[cb.kMFightPanelId] = function(manager) {
    requireJS('src/panel/FightPanel.js');
    var tmpPanel = new cb.FightPanel();
    return tmpPanel;
};

//kMGuildPanelId
panelCreateFuns[cb.kMGuildPanelId] = function(manager) {
    requireJS('src/panel/GuildPanel.js');
    var tmpPanel = new cb.GuildPanel();
    return tmpPanel;
};

cb.LayerManager = cc.Class.extend({
    ctor: function() {
        this.centorX = cc.winSize.width / 2;
        this.centorY = cc.winSize.height / 2;

        this.layersStack=[];
    },

    pushLayer: function(layerId,data) {
        cc.log("openLayer============>>");
        if (!mainPanel)
            return;
        var panelCreateFun=panelCreateFuns[layerId];
        if (!panelCreateFun) {
            return;
        }
        var curLayer=panelCreateFun(this,data);
        if (curLayer) {
            curLayer.setLocalZOrder(250);
            curLayer.setPosition(this.centorX, this.centorY);

            curLayer.setTag(13874);
            curLayer.layerId=layerId;
            mainPanel.addChild(curLayer);

            var closePanel=function(){
                layerManager.popLayer(curLayer);
            };
            curLayer.closePanel=closePanel;
            this.curLayer=curLayer;
            this.layersStack.push(curLayer);

            curLayer.setPanelData(data);
        }
    },

    getRunLayer:function(checkLayerId){
        if(!checkLayerId)
            return;
        var layer;
        for (var i = 0; i < this.layersStack.length; i++) {
            layer=this.layersStack[i];
            if (layer.layerId===checkLayerId) 
                return layer;
        }
        return;
    },

    popLayer:function(layer){
        for (var i = 0; i < this.layersStack.length; i++) {
            if (layer===this.layersStack[i]) {
                var curLayer;
                while(this.layersStack.length>i){
                    curLayer=this.layersStack.pop();

                    var sequence=cc.Sequence.create(
                    cc.ScaleTo.create(0.2,1.2),
                    cc.ScaleTo.create(0.1,0.0));

                    if (curLayer.ccsNode) {
                        curLayer.ccsNode.runAction(sequence);
                    }else{
                        curLayer.runAction(sequence);
                    }
                    
                    sequence=cc.Sequence.create(
                    cc.DelayTime.create(0.3),
                    cc.RemoveSelf.create());
                    curLayer.runAction(sequence);
                }
                break;
            }
        }
    },

    popAllLayer: function() {
        var curLayer;
        while (this.layersStack.length > 0) {
            curLayer = this.layersStack.pop();
            var sequence = cc.Sequence.create(
                cc.ScaleTo.create(0.2, 1.2),
                cc.ScaleTo.create(0.1, 0.0),
                cc.RemoveSelf.create());
            curLayer.runAction(sequence);
        }
    },

    closeLayer:function(layer){
        cc.log("closeLayer============>>");
        if(!layer) return;

        if(this.curLayer!==layer){
            cc.log("ERROR closeLayer this.curLayer!==layer");
            return;
        }
        this.curLayer=null;
        if (!mainPanel) 
            return;
        
        var node=mainPanel.getChildByTag(13874);
        if (!node) {
            cc.log("ERROR node 13874 is no exist!");
            return;
        }
        var sequence=cc.Sequence.create(
                    cc.ScaleTo.create(0.2,1.2),
                    cc.ScaleTo.create(0.1,0.0),
                    cc.RemoveSelf.create());
        node.runAction(sequence);
    },

    openPanel: function(panelId,data,isSave) {
        if (!mainPanel){
            tipsBoxLayer.showTipsBox("没有进入场景，不能打开面板!");
            return;
        }
        var node=mainPanel.getChildByTag(16888);
        if (!!node) {
            if(this._curPanelId===panelId)
            {
                cc.log("ERROR panel had opened panelId="+panelId);
                // tipsBoxLayer.showTipsBox("已经打开该面板!");
                return;
            }
            // tipsBoxLayer.showTipsBox("发现其他的面板已打开!");
        }

        this.popAllLayer();
        
        var savePanelId=this._curPanelId;
        this.savePanelId=null;
        this.closePanel(this.curPanel);

        if (isSave) {
            this.savePanelId=savePanelId;
        }
        this._curPanelData=data;
        this._curPanelId=panelId
        this.delayopenPanel(panelId,data)
    },

    isRunPanel:function(checkPanelId){
        if(!checkPanelId || !this.curPanel)
            return false;
        return this.curPanel.panelId===checkPanelId;
    },

    updatePanel:function(checkPanelId,data){
        if (this.curPanel 
            && this.curPanel.panelId===checkPanelId) {
            this.curPanel.updatePanel(data);
        }
    },

    clearPanel:function(){
        if(!mainPanel)
            return;

        this.popAllLayer();
        if (this._curPanelId) {
            resourceList.removeRes(this._curPanelId);
            this._curPanelId=null;
        }
        this.curPanel=null;
        // this._curPanelId=null;
        this._curPanelData=null;

        var node=mainPanel.getChildByTag(16888);
        if (node) {
            node.removeFromParent();
        }
        this.savePanelId=null;
    },

    isEmptyPanel:function(){
        return !this.curPanel;
    },

    closePanel:function(panel,data){
        cc.log("closePanel===================>>>");
        this.popAllLayer();
        if(!panel)  {
             cc.log("closePanel=======>>> panel=null");
            return;
        }
        if(this.curPanel!==panel){
            cc.log("ERROR closePanel this.curPanel!==panel");
        }
        if (this._curPanelId) {
            resourceList.removeRes(this._curPanelId);
            this._curPanelId=null;
        }
        this.curPanel=null;
        this._curPanelData=null;

        for (var key in panel) {
            delete panel[key];
        }

        if (!mainPanel) 
            return;
        
        var node=mainPanel.getChildByTag(16888);
        if (!node) {
            cc.log("ERROR node 16888 is no exist!");
            return;
        }
        var sequence=cc.Sequence.create(
                    cc.ScaleTo.create(0.2,1.2),
                    cc.ScaleTo.create(0.1,0.2),
                    cc.RemoveSelf.create());
        node.runAction(sequence);

        if (this.savePanelId) {
            var savePanelId=this.savePanelId;
            this.savePanelId=null;
            this.openPanel(savePanelId,data);
        }

        cc.log("closePanel===============<<");
    },

    show:function(){
        this.delayopenPanel(this._curPanelId)
    },

    delayopenPanel: function(panelId,data) {
        if (!mainPanel) 
            return;

        var panelCreateFun=panelCreateFuns[panelId];
        if (!panelCreateFun) {
            return;
        }
        var curPanel=panelCreateFun(this,data);
        if (curPanel) {
            curPanel.setLocalZOrder(200);
            curPanel.setPosition(this.centorX, this.centorY);

            curPanel.setTag(16888);
            curPanel.panelId=panelId;
            mainPanel.addChild(curPanel);

            curPanel.setPanelData(data);
            this.curPanel=curPanel;
        }
    },

    setPanelPosition:function(panelId,pointX,pointY){
        if (this.curPanel.panelId===panelId) {
            this.curPanel.setPosition(pointX,pointY);
        }
    },

    resetPanelPosition:function(panelId){
        if (this.curPanel.panelId===panelId) {
            this.curPanel.setPosition(this.centorX, this.centorY);
        }
    }
});

var layerManager = new cb.LayerManager();




var gameMsgHandler = {
    onMail:function(data){
        mailManager.addMail(data);
    },

    onDomainBattle:function(data){
        var occupyGuildId=data.guildId;
        var area=app.getCurArea();
        if (!occupyGuildId) {
            area.occupyGuildId=0;
            mainPanel.destoryAreaProgress();
            return;
        }
        if (occupyGuildId!==area.occupyGuildId) {
            if(app.getCurPlayer().guildId===occupyGuildId){
                mainPanel.createAreaProgress("我方",true);
            }else{
                mainPanel.createAreaProgress("<"+occupyGuildId+">",false);
            }
            area.occupyGuildId=occupyGuildId;
        }
        mainPanel.showAreaProgress(data.value);
    },

    onUpdateDomain:function(data){
        var area=app.getCurArea();
        var occupyGuildId=data.guildId;
        if (area.areaId===data.areaId) {
            area.occupyGuildId=occupyGuildId;
            
            area.areaState=data.areaState;
            if (area.domainLevel!==data.level) {
                area.domainLevel=data.level;
                area.hideDomainFire();
                area.showDomainFire(area.domainLevel);
            }
            if(area.areaState===AreaStates.BATTLE_STATE){
                if (app.getCurPlayer().guildId === occupyGuildId) {
                    mainPanel.createAreaProgress("我方", true);
                } else {
                    mainPanel.createAreaProgress("<" + data.guildId + ">", false);
                }
                mainPanel.showAreaProgress(data.value);
            }else{
                mainPanel.destoryAreaProgress();
            }
        }else{
            cc.log("ERROR: onUpdateDomain area.areaId="+area.areaId+",data.areaId="+data.areaId);
        }
    },

    onFinishFight: function(data) {
        var curPlayer = app.getCurPlayer();
        curPlayer.enableAI(false);
        var curArea=app.getCurArea();
        if (curPlayer.id === data.winnerId) {
            var fightLevel=fightManager.fightLevel || 1;
            fightLevelData = dataApi.fightlevel.findById(fightLevel);

            curPlayer.caoCoin += fightLevelData.reward;
            if (mainPanel) {
                mainPanel.updateCaoCoin();
            }
            var loser = curArea.getPlayer(data.loserId);
            layerManager.openPanel(cb.kMFightWinPanelId, loser);
        } else if (curPlayer.id === data.loserId) {
            var winner = curArea.getPlayer(data.winnerId);
            layerManager.openPanel(cb.kMFightFailPanelId, winner);
        }
        if (curArea.areaKind === AreaKinds.FIGHT_AREA) {
            curArea.setNpcsVisible(true);
        }
    },

    onRunArea:function(data){
        // app.getCurArea().run();
        mainPanel.runStartTimer();
    },

    onDragArea: function(data) {
        if (!data.areaId) {
            return;
        }
        npcHandler.changeArea(data.areaId,data.instanceId);
    },

    onInviteGuild:function(data){
        var tips = {
            data: {
                isInviteGuild:true,
                guildName: data.guildName,
                inviterName: data.inviterName,
                guildId:data.guildId
            },
            type: TipsType.GUILD
        };
        tipsManager.pushTips(tips);
    },

    onApplyGuildReply:function(data){
        if (data.reply===GuildConsts.ACCEPT) {
            quickLogManager.pushLog("恭喜你，经【"+data.guildName+"】董事会决定，你被录用。",5);
        }else{
            quickLogManager.pushLog("很抱歉，你不符合【"+data.guildName+"】集团的要求，未被录用。",2);
        }
    },

    onApplyGuild:function(data){
        var tips = {
            data: {
                playerId: data.playerId,
                playerName: data.playerName,
                playerLevel:data.playerLevel
            },
            type: TipsType.GUILD
        };
        tipsManager.pushTips(tips);
    },

    onPickTarget:function(data){
        var area=app.getCurArea();
        var player = area.getPlayer(data.playerId);
        var item = area.getEntity(data.entityId);
        if (player && item) {
            player.setDirectionByPoint(item.x, item.y);
            player.standAction();
            item.showPickState();
        }
    },

    onCancelPick:function(data){
        var area=app.getCurArea();
        var item = area.getEntity(data.entityId);
        if (item) {
            item.hidePickState();
        }
    },

    onPrepareFight: function(data) {
        var layer = layerManager.getRunLayer(cb.kMFightSelectPanelId);
        if (layer) {
            layer.setPrepareFight(data.playerId);
        }
    },

    onCompetitor: function(data) {
        var layer = layerManager.getRunLayer(cb.kMFightSelectPanelId);
        if (layer) {
            layer.updatePanelData(data);
        } else {
            if (layerManager.isRunPanel(cb.kMFightPanelId)) {
                fightManager.cancelFight();
            } else {
                fightManager.exitFight();
            }
        }
    },

    onFightAffiche:function(data){
        fightManager.addFightAffiches(data);
    },

    onChangeArea: function(data) {
        appHandler.loadResource();
    },

    onFederation:function(data){
        federationManager.setFederation(data);
    },

    onVote:function(data){
        federationManager.setVote(data);
    },

    onCandidate:function(data){
        federationManager.candidate = data;
        if (layerManager.isRunPanel(cb.kMElectionPanelId)) {
            var curPanel = layerManager.curPanel;
            curPanel.updatePanelData();
        }
    },

    onOffice:function(data){
        federationManager.setOffice(data);
        if (layerManager.isRunPanel(cb.kMElectionPanelId)
            || layerManager.isRunPanel(cb.kMImpeachPanelId)) {
            var curPanel = layerManager.curPanel;
            curPanel.setPanelData(data);
        }
    },

    //market
    onCancelOrder:function(data){
        var type=data.shift();
        marketManager.cancelOrder(type,data);
    },

    onPlayerBank:function(data){
        marketManager.setPlayerBank(data);
    },

    onMarketItem:function(data){
        var playerBank=marketManager.playerBank;
        if (!playerBank) {
            cc.log("ERROR:onMarketItem playerBank===null");
            return;
        }
        if (data.type===0) {
            delete playerBank.buyItems[data.id];
        }else{
            delete playerBank.sellItems[data.id];
        }
        if (data.kindId) {
            playerBank.marketItems[data.kindId] = {
                kindId: data.kindId,
                count: data.count,
                itemData: dataApi.item.findById(data.kindId)
            };
        }
        if (data.caoCoin) {
            playerBank.caoCoin=data.caoCoin;
        }
        if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
            var curPanel = layerManager.curPanel;
            curPanel.updateLayerData();
        }else{
            var tips = {
                type: TipsType.MARKET
            };
            tipsManager.pushTips(tips);
        }
    },

    updateMarketItem:function(data){
        var playerBank=marketManager.playerBank;
        if (!playerBank) {
            cc.log("ERROR:onMarketItem playerBank===null");
            return;
        }
        var item;
        if (data.type===0) {
            item=playerBank.buyItems[data.id];
        }else{
            item=playerBank.sellItems[data.id];
        }
        if (item) {
            // item.price=data.price;
            item.count=data.count;
            marketManager.setPriceByKindId(item.kindId,data.price);
        }
        if (layerManager.isRunPanel(cb.kMMarketPanelId)) {
            var curPanel = layerManager.curPanel;
            curPanel.updateLayerData();
        }
    },

    onBagData: function(data) {
        bagManager.setBagData(data);
    },

    onHp2All:function(data){
        var character = app.getCurArea().getEntity(data.entityId);
        if (character) {
            character.updateHp(data.hp,data.dHp);
        }
    },

    onHpMp:function(data){
        var curPlayer = app.getCurPlayer();
        curPlayer.updateHpMp(data);
    },

    onChat:function(data){
        data.channelId = data.channel;
        chatManager.processUserMsg(data);
    },
 
    onCrystal:function(data) {
        var curPlayer = app.getCurPlayer();
        curPlayer.crystal=data.crystal;

        if (data.delta > 0) {
             quickLogManager.getCrystalLog(data.delta);
        } else if (data.delta < 0) {
            quickLogManager.costCrystalLog(data.delta);
        }

        if (layerManager.isRunPanel(cb.kMShopPanelId)) {
            var curPanel = layerManager.curPanel;
            curPanel.updateMoney(2,data.delta);
        }
        if (layerManager.isRunPanel(cb.kMVipPanelId)) {
            var curPanel = layerManager.curPanel;
            curPanel.updateMoney(2,data.delta);
        }
    },

    onCaoCoin:function(data){
        var curPlayer = app.getCurPlayer();
        curPlayer.caoCoin=data.caoCoin;

        if (mainPanel) {
            mainPanel.updateCaoCoin();
            if (data.delta>0) {
                var bigWinLayer=new cb.BigWinLayer();
                bigWinLayer.showCaoCoin(data.delta);
                mainPanel.addChild(bigWinLayer);
                bigWinLayer.setLocalZOrder(99999);
                bigWinLayer.setPosition(cc.winSize.width/2,cc.winSize.height/2);
            }else if (data.delta<0){
                // quickLogManager.pushLog("消费了"+data.delta+"炒币",2);
                quickLogManager.costCaoCoinLog(data.delta);
            }
        }
        if (layerManager.isRunPanel(cb.kMShopPanelId)) {
            var curPanel = layerManager.curPanel;
            curPanel.updateMoney(1,data.delta);
        }
        if (layerManager.isRunPanel(cb.kMVipPanelId)) {
            var curPanel = layerManager.curPanel;
            curPanel.updateMoney(1,data.delta);
        }
    },

    onLogTips: function(data) {
        if (data.code) {
            quickLogManager.showErrorCode(data.code);
        } else if (data.msg) {
            quickLogManager.pushLog(data.msg);
        }
    },

    onTipsBox: function(data) {
        if (data.code) {
            tipsBoxLayer.showErrorCode(data.code);
        } else if (data.msg) {
            tipsBoxLayer.showTipsBox(data.msg);
        }
    },

    onApplyJoinTeam: function(data) {
        if (!data) {
            return;
        }
        var curPlayer = app.getCurPlayer();
        if (!curPlayer.isCaptain) {
            cc.log("you are no captian ======>>");
            return;
        }
        var tips = {
            id: data.teamId,
            data: {
                inviteJoinTeam: false,
                playerId: data.playerId,
                name: data.name,
                teamId: data.teamId
            },
            type: TipsType.TEAM
        };
        tipsManager.pushTips(tips);
        // data.teamId = curPlayer.teamId;
        // applyJoinTeamPanel.open(data);
    },

    onInviteJoinTeam: function(data) {
        if (!data) return;

        var curPlayer = app.getCurPlayer();
        if (curPlayer.teamId !== TeamConsts.TEAM_ID_NONE) {
            cc.log("already have team======>>");
            return;
        }

        var tips = {
            id: data.teamId,
            data: {
                inviteJoinTeam: true,
                playerId: data.playerId,
                name: data.name,
                teamId: data.teamId
            },
            type: TipsType.TEAM
        };
        tipsManager.pushTips(tips);

    },

    onApplyJoinTeamReply: function(data) {
        if (data.reply === TeamConsts.REJECT) {
            quickLogManager.pushLog("组队请求被拒绝！");
        }
    },

    /////in team msg/////////////////////////////////////////
    onUpdateTeam: function(data) {
        if (!!data.playerDatas) {
            var playerId, playerData, playerEntity;
            var area = app.getCurArea();
            var playerEntitys = [];
            var teamName = "";
            for (var key in data.playerDatas) {
                playerData = data.playerDatas[key];
                playerId = playerData.playerId;
                playerEntity = area.getPlayer(playerId);
                if (!playerEntity) {
                    cc.warn('player is null, playerId = ', playerId);
                    continue;
                }
                playerEntity.teamId = data.teamId;
                if (data.captainId === playerId) {
                    playerEntity.isCaptain = TeamConsts.YES;
                    teamName = playerEntity.name + "的队伍";
                }
                playerEntitys.push(playerEntity);
            }
            for (var i = 0; i < playerEntitys.length; i++) {
                playerEntitys[i].showTeamMemberFlag(true, teamName);
            };

            teamManager.curPlayerTeamInfo = data;

            teamManager.addTeam({
                teamId: data.teamId,
                teamName: teamName
            });
        }
    },

    onDisbandTeam: function(playerIdArray) {
        var area = app.getCurArea();
        for (var i in playerIdArray) {
            var playerId = playerIdArray[i];
            var player = area.getPlayer(playerId);
            if (!player) {
                continue;
            }
            player.showTeamMemberFlag(false);
            player.teamId = TeamConsts.TEAM_ID_NONE;
            player.isCaptain = TeamConsts.NO;
        }
    },

    onTeammateLeaveTeam: function(data) {
        var playerId = data.playerId;
        var area = app.getCurArea();
        var player = area.getPlayer(playerId);
        if (!player) {
            return;
        }
        var curPlayer = app.getCurPlayer();
        if (curPlayer.id === playerId && curPlayer.isCaptain) {
            var teamInfo = teamManager.curPlayerTeamInfo;
            teamManager.removeTeam(curPlayer.teamId);
            for (var key in teamInfo.playerDatas) {
                playerData = teamInfo.playerDatas[key];
                if (playerData.playerId !== playerId) {
                    // cc.log("change captian,get new captian Name====>>>");
                    teamManager.getTeamByTeamId(curPlayer.teamId, playerData.playerId);
                }
            }
        }
        player.showTeamMemberFlag(false);
        player.teamId = TeamConsts.TEAM_ID_NONE;
        player.isCaptain = TeamConsts.NO;
    },

    onDragMember2gameCopy: function(data) {
        if (!data.target) {
            return;
        }
        var curPlayer = app.getCurPlayer();
        if (curPlayer.isCaptain) {
            return;
        }
        npcHandler.changeArea(data.target);
    },

    onTeamChange: function(data) {
        var area = app.getCurArea();
        var player = area.getPlayer(data.playerId);
        if (!!player) {
            if (data.teamId === TeamConsts.TEAM_ID_NONE) {
                player.teamId = TeamConsts.TEAM_ID_NONE;
                player.isCaptain = TeamConsts.NO;
                player.showTeamMemberFlag(false);
            } else {
                player.teamId = data.teamId;
                player.isCaptain = data.isCaptain;
                var team = teamManager.getTeamByTeamId(data.teamId, data.playerId);
                if (team && team.teamId === data.teamId) {
                    player.showTeamMemberFlag(true, team.teamName);
                }
            }
        }
    },

    onAddEntities: function(data) {
        var entities = data;
        var area = app.getCurArea();
        if (!area) {
            cc.warn('entity not exist!');
            return;
        }
        var entity, array, key, i,entityType;
        for (key in entities) {
            array = entities[key];
            if (!array) {
                return;
            }
            entityType=Number(key);
            for (i = 0; i < array.length; i++) {
                if (!array[i]) {
                    return;
                }
                if (!area.getEntity(array[i].entityId)) {
                    entity = array[i];
                    entity.type =entityType;
                    area.addEntity(entity);
                } else {
                    cc.log('ERROR:====>>add exist entity!');
                }
            }
        }
    },

    onRemoveEntities: function(data) {
        var entities = data.entities;
        var area = app.getCurArea();
        var player = app.getCurPlayer();
        for (var i = 0; i < entities.length; i++) {
            if (entities[i] !== player.entityId) {
                area.removeEntity(entities[i]);
            }
        }
    },

    onMove: function(data) {
        if (data.areaId && data.areaId !== app.getCurAreaId()) {
            cc.log("ERROR:big error other area msg come here!");
            playerHandler.fixLeaveArea(data.areaId);
            return;
        }
        var character = app.getCurArea().getEntity(data.entityId);
        if (!character) {
            cc.log('no character exist for move!' + data.entityId);
            playerHandler.getEntity(data.entityId);
            return;
        }
        if (app.isCurPlayer(data.entityId)) {
            if (character.isControl())
                return;
        }
        character.movePath(data.path);
    },

    onClMove:function(data){
        var character = app.getCurArea().getEntity(data.entityId);
        if (!character) {
            cc.log('no character exist for move!' + data.entityId);
            playerHandler.getEntity(data.entityId);
            return;
        }
        if (app.isCurPlayer(data.entityId)) {
            if (character.isControl())
                return;
        }
        character.movingTo(data.x,data.y);
    },

    onStand: function(data) {
        var character = app.getCurArea().getEntity(data.entityId);
        if (!character) {
            cc.log('no character exist for stand!' + data.entityId);
            return;
        }

        if (app.isCurPlayer(data.entityId)) {
            if (character.isControl())
                return;
            if (character.multiAreaTarget) 
                return;
        }
        if (Math.abs(data.x - character.x) <20 && Math.abs(data.y - character.y) < 20) {
            character.stopMove();
        } else {
            var paths = app.getCurArea().map.findPath(character.x, character.y, data.x, data.y);
            if (!paths) {
                character.stopMove();
                return;
            }
            character.movePath(paths);
        }
    },

    // onPathCheckout: function(data) {
    //     var player = app.getCurArea().getEntity(data.entityId);
    //     if (!player) return;

    //     var serverPosition = data.position;

    //     var dx = serverPosition.x - player.x;
    //     var dy = serverPosition.y - player.y;
    //     if (dx * dx + dy * dy > 62500) {
    //         cc.log("本地玩家===>>位置不一致，进行强制校正=========>>");
    //         player.setPosition(serverPosition.x, serverPosition.y);
    //     }
    // },

    onUpgrade: function(playerData) {
        app.getCurPlayer().upgrade(playerData);
    },

    onUpdateTask: function(data) {
        if (!data) {
            return;
        }
        var task=taskManager.setTaskData(data);
        if (!task) {
            cc.log("ERROR:big error,Task can't be founded");
            return;
        }
        if (task.taskState === TaskState.NOT_DELIVERY) {
            task.resetMoveData();

            setTimeout(function() {
                task.deliverTask();
            }, 500);
        }
    },

    onAddTask: function(data) {
        if (!data || !data.length) {
            return;
        }
        taskManager.setTaskDatas(data);
    },

    onPickItem: function(data) {
        if (data) {
            var count = bagManager.addItem(data);
            var curPlayer=app.getCurPlayer();
            if ((layerManager.isEmptyPanel() || curPlayer.level<10)
                && data.type === EntityType.EQUIPMENT 
                && data.jobId===curPlayer.jobId) {

                var equipments = bagManager.getEquipments();
                if (equipments) {
                    var equipment = equipments[data.equipKind];
                    if (curPlayer.level>10) {
                        if(!equipment){
                            layerManager.openPanel(cb.kMNewEquipmentPanelId, data);
                            return;
                        }else if (equipment) {
                            var newTotalValue = data.baseValue + Math.floor(data.potential * data.percent / 100);
                            var oldTotalValue = equipment.baseValue + Math.floor(equipment.potential * equipment.percent / 100);
                            if (newTotalValue > oldTotalValue) {
                                layerManager.openPanel(cb.kMNewEquipmentPanelId, data);
                                // return;
                            }
                        }
                    }else{
                        taskManager.keepUpMainTask(data);
                    }
                }
                if (mainPanel) {
                    var pickItemsQueue=curPlayer.pickItemsQueue;
                    var index=0,position;
                    for (; index < pickItemsQueue.length; index++) {
                        if (pickItemsQueue[index].kindId===data.kindId) {
                            position=cc.p(pickItemsQueue[index].x,pickItemsQueue[index].y);
                            pickItemsQueue.splice(0,index+1);
                            break;
                        }
                    }
                    mainPanel.pushItem(data.itemData.skinId,position);
                }else{
                    quickLogManager.getItemLog(data.itemData.skinId,count);
                }
            } else {
                if (data.itemData) {
                    quickLogManager.getItemLog(data.itemData.skinId,count);
                } else {
                    quickLogManager.pushLog("获得 未知物品", 3);
                }
            }
        }
    },

    onExp:function(data){
        quickLogManager.pushScrollLog("经验 +" + data.delta);
        app.getCurPlayer().setExperience(data.exp);
    },

    // onNPCTalk: function(data) {
    //     var area = app.getCurArea();
    //     var npc = area.getEntity(data.npc);
    //     if (!npc) {
    //         tipsBoxLayer.showTipsBox("npc未找到:" + data.npc);
    //         return;
    //     }
    //     var curPlayer = app.getCurPlayer();
    //     curPlayer.setDirectionByPoint(npc.x, npc.y);
    //     curPlayer.standAction();

    //     npc.openPanel(data);
    // },

    onGAttack: function(data) {
        var area = app.getCurArea();
        var attacker = area.getEntity(data.attacker);
        var skillId = data.skillId;

        if (attacker) {
            if (!!data.mp) {
                attacker.changeMp(data.mp);
            }
            attacker.showAttack(skillId);
        }
        var singleData, resultConst, target;
        for (var key in data.groups) {
            singleData = data.groups[key];
            resultConst = singleData.result;
            var target = area.getEntity(singleData.target);
            if (target) {
                if (resultConst === AttackResult.MISS) {
                    target.showDodge();
                } else if (singleData.hp===0) {
                    target.setDied(attacker);
                }
                if (singleData.damage) {
                    target.reduceHp(singleData.hp, singleData.damage, resultConst === AttackResult.CRIT);
                    if (target.isCurPlayer && attacker) {
                        target.increaseHateFor(attacker.entityId, 5);

                        target.showLowBlood(singleData.hp);
                    }
                }
                if (attacker) {
                    if (singleData.exp && attacker.isCurPlayer) {
                        attacker.addExperience(singleData.exp);
                    }
                    target.setDirectionByPoint(attacker.x, attacker.y);
                }
                target.showAttacked(skillId);
            }
        }
        var items = data.items;
        if (!!items && items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                area.addEntity(items[i]);
            }
        }
    },

    onAttack: function(data) {
        var resultConst = data.result;
        var area = app.getCurArea();
        var attacker = area.getEntity(data.attacker);
        var skillId = data.skillId;
        if (attacker) {
            if (data.mp) 
                attacker.changeMp(data.mp);
            
            if (data.exp && attacker.isCurPlayer) 
                attacker.addExperience(data.exp);
            
            // if (!attacker.isCurPlayer) 
            //     attacker.setPosition(data.x, data.y);
        }
        
        var target = area.getEntity(data.target);
        if (target) {
            if (resultConst === AttackResult.MISS) {
                target.showDodge();
            }else if (data.hp===0) {
                target.setDied(attacker);
            }
            if (data.damage) {
                target.reduceHp(data.hp,data.damage,resultConst === AttackResult.CRIT);

                if (target.isCurPlayer && attacker) {
                    target.increaseHateFor(attacker.entityId, 5);

                    target.showLowBlood(data.hp);
                    // if (target.died) {
                    //     mainPanel.enableLowBlood(false);
                    // } else if (data.hp) {
                    //     var percent = (data.hp || 1) / (target.maxHp || 1);
                    //     mainPanel.enableLowBlood(percent < 0.5);
                    // }
                }
            }
            if (attacker) {
                attacker.setDirectionByPoint(target.x, target.y);
                attacker.showAttack(skillId, target);
                target.setDirectionByPoint(attacker.x, attacker.y);
            }
            target.showAttacked(skillId);
        }
        if (resultConst === AttackResult.MISS) {
            return;
        }
        if (data.items) {
            var items = data.items;
            for (var i = 0; i < items.length; i++) {
                // items[i].type = EntityType.EQUIPMENT
                area.addEntity(items[i]);
            }
        }
    },

    onRevive: function(data) {
        var area = app.getCurArea();
        var player = area.getEntity(data.entityId);
        if (player) {
            player.setRevive(data);
        }
    },

    onKick: function(data) {
        cc.log("=======================>>>onKick");
        cc.log("=======================>>>onKick");
        cc.log("=======================>>>onKick");
        cc.log("=======================>>>onKick");
        cc.log("=======================>>>onKick");
    },

    onUserLeave: function(data) {
        if (data.playerId) {
            var area = app.getCurArea();
            area.removePlayer(data.playerId);
        }
    },

    disconnect: function(data) {
        cc.log("=======================>>>disconnect");
        cc.log("=======================>>>disconnect");
        cc.log("=======================>>>disconnect");
        cc.log("=======================>>>disconnect");
        cc.log("=======================>>>disconnect");
    }
};


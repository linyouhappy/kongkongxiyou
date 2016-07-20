var mainPanel = null;
cb.TipsManager = cc.Class.extend({
    ctor: function() {
        this.tipsMap = {};
    },

    pushTips: function(tips) {
        var tipsType = tips.type;
        var tipsArray = this.tipsMap[tipsType];
        if (TipsType.EMAIL===tipsType) {
            if (tipsArray) {
                return;
            }
        }else{
            tips.timeOut = Date.now() + 180000;
        }
        if (!tipsArray) {
            tipsArray = [];
            this.tipsMap[tipsType] = tipsArray;
        }
        tipsArray.push(tips);
        this.showTips();

        soundManager.playEffectSound("sound/ui/message.mp3");
    },

    showTips: function() {
        if (mainPanel === null)
            return;

        var areaScene = mainPanel;
        if (!areaScene.tipsMenu) {
            areaScene.tipsMenu = new cc.Menu();
            areaScene.tipsMenu.setPosition(cc.winSize.width / 2 + 150, cc.winSize.height / 2 - 60);
            areaScene.addChild(areaScene.tipsMenu);
        } else {
            areaScene.tipsMenu.removeAllChildren();
        }

        var tipsType, menuItemSprite, normalSprite, selectedSprite;

        var index = 0;
        var tipsArray, tips, spriteFrameName, subData, isHaveData;
        var currentTime = Date.now();
        var tipsMap = this.tipsMap;
        for (var key in tipsMap) {
            tipsType = Number(key);
            tipsArray = tipsMap[key];
            if (!tipsArray || tipsArray.length === 0) {
                delete tipsMap[key];
                continue;
            }
            if (TipsType.EMAIL !== tipsType) {
                for (var i = 0; i < tipsArray.length; i++) {
                    tips = tipsArray[i];
                    if (currentTime > tips.timeOut) {
                        tipsArray.splice(i, 1);
                        i--;
                    }
                }
            }
            
            if (tipsArray.length === 0) {
                delete tipsMap[key];
                continue;
            }
            switch (tipsType) {
                case TipsType.TEAM:
                    spriteFrameName = "#icon_tips_team.png";
                    break;
                case TipsType.CHALLENGE:
                    spriteFrameName = "#icon_tips_fight.png";
                    break;
                case TipsType.FRIEND:
                    spriteFrameName = "#icon_tips_friend.png";
                    break;
                case TipsType.EMAIL:
                    spriteFrameName = "#icon_tips_email.png";
                    break;
                case TipsType.MARKET:
                    spriteFrameName = "#icon_tips_market.png";
                    break;
                case TipsType.GUILD:
                    spriteFrameName = "#icon_tips_faction.png";
                    break;
                default:
                    continue;
            }

            normalSprite = new cc.Sprite(spriteFrameName);
            selectedSprite = new cc.Sprite(spriteFrameName);
            effectManager.useShaderEffect(selectedSprite, "ShaderGreyScale");

            menuItemSprite = new cc.MenuItemSprite(normalSprite, selectedSprite, null, this.onMenuCallback, this);
            menuItemSprite.setTag(tipsType);
            areaScene.tipsMenu.addChild(menuItemSprite)

            menuItemSprite.setPosition(index * 50, 0);
            index++;
        };
    },

    getTipsByType: function(tipsType) {
        var tipsArray = this.tipsMap[tipsType];
        if (!tipsArray || tipsArray.length === 0)
            return null;

        var tips = tipsArray.shift();
        return tips;
    },

    onMenuCallback: function(sender) {
        var tipsType = sender.getTag();
        var tips = this.getTipsByType(tipsType);
        this.showTips();
        if (!tips)
            return;

        switch (tipsType) {
            case TipsType.TEAM:
                var teamData = tips.data;
                var msg = null;
                if (teamData.inviteJoinTeam) {
                    msg = '[' + teamData.name + ']邀请您加入他的队伍。';
                } else {
                    msg = '[' + teamData.name + ']申请加入您的队伍。';
                }
                tipsBoxLayer.showTipsBox(msg);
                tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
                    if (teamData.inviteJoinTeam) {
                        if (isYesOrNo) {
                            teamHandler.inviteJoinTeamReply(teamData.teamId, teamData.playerId, TeamConsts.ACCEPT);
                        }
                    } else {
                        if (isYesOrNo) {
                            teamHandler.applyJoinTeamReply(teamData.teamId, teamData.playerId, TeamConsts.ACCEPT);
                        } else {
                            teamHandler.applyJoinTeamReply(teamData.teamId, teamData.playerId, TeamConsts.REJECT);
                        }
                    }
                });

                break;
            case TipsType.CHALLENGE:
                cc.log("challenge===========>>" + tipsData.data.name);
                break;
            case TipsType.FRIEND:
                cc.log("friend===========>>" + tipsData.data.name);
                break;
            case TipsType.EMAIL:
            layerManager.openPanel(cb.kMMailPanelId);
                break;
            case TipsType.MARKET:
                layerManager.openPanel(cb.kMMarketPanelId);
                break;
            case TipsType.GUILD:
                var guildData = tips.data;
                var msg = null;
                if (guildData.isInviteGuild) {
                    msg = '[' + guildData.inviterName + ']邀请您加盟【'+guildData.guildName+'】集团。';
                } else {
                    msg = '[' + guildData.playerName+':' +guildData.playerLevel+ '级]应聘加入集团。';
                }
                tipsBoxLayer.showTipsBox(msg);
                tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
                    if (guildData.isInviteGuild) {
                        if (isYesOrNo) {
                            guildHandler.inviteGuildReply(guildData.guildId);
                        }
                    } else {
                        if (isYesOrNo) {
                            guildHandler.applyGuildReply(guildData.playerId, GuildConsts.ACCEPT);
                        } else {
                            guildHandler.applyGuildReply(guildData.playerId, GuildConsts.REJECT);
                        }
                    }
                });
                break;
        }
    }
});

var tipsManager = new cb.TipsManager();


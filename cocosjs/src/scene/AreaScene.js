
var AreaLayer = BaseSceneLayer.extend({
    _ccsNode: null,
    controlNode: null,
    skillNode: null,
    ctor: function() {
        this._super();

        cc.spriteFrameCache.addSpriteFrames("effect/char_face.plist");

        this.createCCSNode("uiccs/AreaLayer.csb");

        var ccsNode = this._ccsNode;

        this.playerNode = ccsNode.getChildByName("playerNode");
        this.playerLayer = new cb.PlayerLayer(this.playerNode);

        this.characterNode = ccsNode.getChildByName("characterNode");
        this.characterLayer = new cb.CharacterLayer(this.characterNode);

        this.controlNode = ccsNode.getChildByName("controlNode");
        this.controlPanel = new cb.ControlPanel(this.controlNode);

        this.skillNode = ccsNode.getChildByName("skillNode");
        this.skillPanel = new cb.SkillPanel(this.skillNode);

        this.taskNode = ccsNode.getChildByName("taskNode");
        this.taskPanel = new cb.TaskLayer(this.taskNode);

        this.experienceBar = ccsNode.getChildByName("experienceBar");
        this.experienceBar.setPosition(0, -cc.winSize.height / 2 + 7);
        this.experienceBar.setScale(cc.winSize.width / 964);
        this.experienceBar.setLocalZOrder(1);

        this.expText=ccsNode.getChildByName("expText");
        this.expText.setPosition(0, -cc.winSize.height / 2 + 8);
        this.expText.setLocalZOrder(2);
        formula.enableOutline(this.expText);

        this.menuNode = ccsNode.getChildByName("menuNode");
        this.menuLayer = new cb.MenuLayer(this.menuNode);

        this.menuNode.setVisible(false);
        this.experienceBar.setVisible(false);
        this.expText.setVisible(false);

        var mapNode = ccsNode.getChildByName("mapNode");
        mapNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        var autoFightBtn = mapNode.getChildByName("autoFightBtn");
        autoFightBtn.addTouchEventListener(this.touchEvent, this);
        autoFightBtn.setPressedActionEnabled(true);

        var mapBtn = mapNode.getChildByName("mapBtn");
        mapBtn.addTouchEventListener(this.touchEvent, this);
        mapBtn.setPressedActionEnabled(true);

        var mapNamelabel = cc.Label.createWithSystemFont("地图名字", "Arial", 26);
        mapNamelabel.setColor(cc.color(0, 255, 0, 255));
        mapNamelabel.enableOutline(cc.color(0, 0, 0, 255), 3);
        var contentSize = mapBtn.getContentSize();
        mapNamelabel.setPosition(contentSize.width / 2, contentSize.height / 2);
        mapBtn.addChild(mapNamelabel);
        this.mapBtn=mapBtn;

        this.mapNamelabel = mapNamelabel;

        // this.hpMpNode = ccsNode.getChildByName("hpMpNode");
        // this.hpMpLayer = new cb.HpMpLayer(this.hpMpNode);

        this.chatNode=ccsNode.getChildByName("chatNode");
        this.chatNode.setPosition(layerPositions.chatPositionD);
        var smallChatView = new cb.SmallChatView(this.chatNode);
        this.smallChatView=smallChatView;

        var chatBtn=this.chatNode.getChildByName("chatBtn");
        chatBtn.addTouchEventListener(this.touchEvent, this);
        chatBtn.setPressedActionEnabled(true);
        chatBtn.setLocalZOrder(10);

        // this.setOpacity(150);
    },

    touchEvent: function(sender, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
            var name = sender.getName();
            if (name === "autoFightBtn") {
                var curPlayer = app.getCurPlayer();
                curPlayer.enableAI(!curPlayer.isEnableAI);
            } else if (name === "mapBtn") {
                var area = app.getCurArea();
                layerManager.openPanel(cb.kMMapPanelId, area);
            }else if (name==="chatBtn") {
                layerManager.openPanel(cb.kMChatPanelId);
            }
        }
    },

    enableAutoFight: function(isEnableAuto) {
        if (isEnableAuto) {
            if (!this.autoFightSprite) {
                this.autoFightSprite = new cc.Sprite("#img_auto_fight.png");
                this.autoFightSprite.setPosition(cc.winSize.width / 2 - 250, cc.winSize.height / 2 - 100);
                this._ccsNode.addChild(this.autoFightSprite);

                var autoFightPoint, x, sequence;
                var lowY = 6;
                var highY = 24;
                for (var i = 1; i <= 3; i++) {
                    autoFightPoint = new cc.Sprite("#img_auto_fight_point.png");
                    x = 145 + (i - 1) * 12;
                    autoFightPoint.setPosition(x, lowY);
                    this.autoFightSprite.addChild(autoFightPoint);
                    if (i == 1) {
                        sequence = cc.Sequence.create(
                            cc.MoveTo.create(0.16, cc.p(x, highY)),
                            cc.MoveTo.create(0.16, cc.p(x, lowY)),
                            cc.DelayTime.create(0.83)
                        );
                    } else if (i == 2) {
                        sequence = cc.Sequence.create(
                            cc.DelayTime.create(0.32),
                            cc.MoveTo.create(0.16, cc.p(x, highY)),
                            cc.MoveTo.create(0.16, cc.p(x, lowY)),
                            cc.DelayTime.create(0.51)
                        );
                    } else {
                        sequence = cc.Sequence.create(
                            cc.DelayTime.create(0.64),
                            cc.MoveTo.create(0.16, cc.p(x, highY)),
                            cc.MoveTo.create(0.16, cc.p(x, lowY)),
                            cc.DelayTime.create(0.19)
                        );
                    }
                    autoFightPoint.runAction(cc.RepeatForever.create(sequence));
                }
            }
        } else {
            if (!!this.autoFightSprite) {
                this._ccsNode.removeChild(this.autoFightSprite);
                this.autoFightSprite = null;
            }
        }
    }
});

cb.ActivityLayer = cc.Layer.extend({
    ctor: function() {
        this._super();

        var menu = new cc.Menu();
        menu.setPosition(0, 0);
        this.addChild(menu);
        this.menu = menu;

        this.activityItems=[];

        // this.addActivityItem(cb.kMFederationPanelId,"#menu_setting.png");
        this.addActivityItem(cb.kMFightPanelId, "#activity_fight.png");
        this.addActivityItem(cb.kMDomainPanelId, "#activity_domain.png");
        this.addActivityItem(cb.kMBossPanelId, "#activity_myboss.png");
        this.addActivityItem(cb.kMWorldBossPanelId, "#activity_worldboss.png");
        // this.addActivityItem(cb.kMRankingPanelId, "#activity_ranking.png");
        this.addActivityItem(cb.kMTeamBossPanelId, "#activity_teamboss.png");
        // this.addActivityItem(cb.kMChallengePanelId, "#activity_challenge.png");
        this.addActivityItem(cb.kMVipPanelId, "#activity_pay.png");
        this.addActivityItem(cb.kMFruitSlotPanelId, "#activity_lottery.png");
        this.addActivityItem(cb.kMMarketPanelId, "#activity_market.png");
        this.addActivityItem(cb.kMFederationPanelId, "#activity_federation.png");
        

        this.layoutActivityItem();

        // var label = cc.Label.createWithSystemFont("+", "Arial", 32);
        // label.setColor(cc.color(255, 255, 255));
        // this.addChild(label);
    },

    layoutActivityItem:function(){
        var menuItem,x,y, index = 0;
        var spaceLeft=cc.winSize.width-460;
        spaceLeft=Math.floor(spaceLeft/90);
        for (var i = 0; i < this.activityItems.length; i++) {
            menuItem = this.activityItems[i];
            x=-i%spaceLeft * 90;
            y=-Math.floor(i/spaceLeft)*80;
            menuItem.setPosition(x, y);
            index++;
        }
    },

    addActivityItem: function(activityId,spriteFrameName) {
        var normalSprite = new cc.Sprite(spriteFrameName);
        var selectedSprite = new cc.Sprite(spriteFrameName);

        effectManager.useShaderEffect(selectedSprite, "ShaderGreyScale");

        var menuItemSprite = new cc.MenuItemSprite(normalSprite, selectedSprite, normalSprite, this.onMenuCallback, this);
        // menuItemSprite.setAnchorPoint(cc.p(0.5,1));
        menuItemSprite.setTag(activityId);
        this.menu.addChild(menuItemSprite);

        this.activityItems.push(menuItemSprite);
    },

    onMenuCallback: function(sender) {
        var panelId = sender.getTag();
        switch (panelId) {
            case cb.kMVipPanelId:
                layerManager.openPanel(cb.kMVipPanelId);
                break;
            default:
                var player = app.getCurPlayer();
                layerManager.openPanel(panelId, player);
                break;
        }
    }
});

cb.MenuLayer = cc.Class.extend({
    ctor: function(menuNode) {
        menuNode.setPosition(layerPositions.menuPositionD);
        var menu = new cc.Menu();
        menu.setPosition(0, 0);
        menuNode.addChild(menu);
        this.menu = menu;

        this.menuItems = [];

        // this.addMenuItem(cb.kMRolePanelId,"#menu_role.png");
        // this.addMenuItem(cb.kMBagPanelId,"#menu_bag.png");
        // this.addMenuItem(cb.kMSkillPanelId,"#menu_skill.png");
        // this.addMenuItem(cb.kMBuildPanelId,"#menu_strength.png");
        // this.addMenuItem(cb.kMGuildPanelId,"#menu_faction.png");
        // this.addMenuItem(cb.kMShopPanelId,"#menu_shop.png");
        // this.addMenuItem(cb.kMSettingPanelId,"#menu_setting.png");

        this.addMenuItem(cb.kMRolePanelId);
        this.addMenuItem(cb.kMBagPanelId);
        this.addMenuItem(cb.kMSkillPanelId);
        this.addMenuItem(cb.kMBuildPanelId);
        this.addMenuItem(cb.kMGuildPanelId);
        this.addMenuItem(cb.kMShopPanelId);
        this.addMenuItem(cb.kMSettingPanelId);

        this.layoutMenuItem();
    },

    addMenuItem: function(menuId,spriteFrameName) {
        var spriteFrameName=cb.MenuLayer.menuToSprites[menuId]
        var normalSprite = new cc.Sprite(spriteFrameName);
        var selectedSprite = new cc.Sprite(spriteFrameName);

        effectManager.useShaderEffect(selectedSprite, "ShaderGreyScale");

        var menuItemSprite = new cc.MenuItemSprite(normalSprite, selectedSprite, normalSprite, this.onMenuCallback, this);
        menuItemSprite.setTag(menuId);
        this.menu.addChild(menuItemSprite);
        menuItemSprite.setScale(1.3);

        this.menuItems.push(menuItemSprite);
    },

    fadeInItem: function(menuId) {
        soundManager.playEffectSound("sound/ui/function_open.mp3");
        var menuItem;
        for (var i = 0; i < this.menuItems.length; i++) {
            menuItem = this.menuItems[i];
            if (menuItem.getTag() === menuId) {
                menuItem.setVisible(true);
                break;
            }
        }
        this.layoutMenuItem();

        if (menuItem) {
            // menuItem.setVisible(false);
            var savePosition = menuItem.getPosition();
            menuItem.setPosition(cc.winSize.width / 2-80, cc.winSize.height / 2-30);

            cc.eventManager.setEnabled(false);
            var onActionCallback = function() {
                cc.eventManager.setEnabled(true);
                mainPanel.showControlPanel();
                taskManager.keepUpMainTask();
            };
            var sequence = cc.Sequence.create(
                cc.DelayTime.create(1),
                cc.Show.create(),
                cc.DelayTime.create(0.2),
                cc.MoveTo.create(1, savePosition),
                cc.DelayTime.create(0.2),
                cc.CallFunc.create(onActionCallback)
            );
            menuItem.runAction(sequence);

            var selectSprite = new cc.Sprite();
            var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/effect_strength.plist", "effect_strength_");
            sequence = cc.Sequence.create(
                // cc.DelayTime.create(1),
                cc.Animate.create(clickEfectAnim),
                cc.RemoveSelf.create()
            );
            selectSprite.runAction(sequence);
            var contentSize = menuItem.getContentSize();
            selectSprite.setPosition(contentSize.width / 2, contentSize.height / 2);
            menuItem.addChild(selectSprite);
        }
    },

    setInvisibleItem: function(menuId) {
        var menuItem;
        for (var i = 0; i < this.menuItems.length; i++) {
            menuItem = this.menuItems[i];
            if (menuItem.getTag() === menuId) {
                menuItem.setVisible(false);
                break;
            }
        }
    },

    layoutMenuItem: function() {
        var menuItem, index = 0;
        for (var i = 0; i < this.menuItems.length; i++) {
            menuItem = this.menuItems[i];
            if (menuItem.isVisible()) {
                menuItem.setPosition(index * 100, 0);
                index++;
            }
        }
    },

    onMenuCallback: function(sender) {
        var panelId = sender.getTag();
        switch (panelId) {
            case cb.kMRolePanelId:
                var playerId = app.curPlayerId;
                layerManager.openPanel(cb.kMRolePanelId, playerId);
                break;
            default:
                var player = app.getCurPlayer();
                layerManager.openPanel(panelId, player);
                break;
        }
    }
});

cb.MenuLayer.menuToSprites={};
cb.MenuLayer.menuToSprites[cb.kMRolePanelId]="#menu_role.png";
cb.MenuLayer.menuToSprites[cb.kMBagPanelId]="#menu_bag.png";
cb.MenuLayer.menuToSprites[cb.kMSkillPanelId]="#menu_skill.png";
cb.MenuLayer.menuToSprites[cb.kMBuildPanelId]="#menu_strength.png";
cb.MenuLayer.menuToSprites[cb.kMGuildPanelId]="#menu_faction.png";
cb.MenuLayer.menuToSprites[cb.kMShopPanelId]="#menu_shop.png";
cb.MenuLayer.menuToSprites[cb.kMSettingPanelId]="#menu_setting.png";


var layerPositions = {
    controlPositonS: cc.p(155 - cc.winSize.width / 2, 135 - cc.winSize.height / 2),
    skillPositionS: cc.p(cc.winSize.width / 2, -cc.winSize.height / 2),
    menuPositionS: cc.p(80 - cc.winSize.width / 2, -cc.winSize.height / 2 + 60),
    chatPositionS: cc.p(0,-cc.winSize.height / 2+167),
    controlPositonD: cc.p(155 - cc.winSize.width / 2, 35 - cc.winSize.height / 2 - 170),
    skillPositionD: cc.p(cc.winSize.width / 2, -cc.winSize.height / 2 - 270),
    menuPositionD: cc.p(80 - cc.winSize.width / 2, -cc.winSize.height / 2 - 60),
    chatPositionD: cc.p(0, -cc.winSize.height / 2+70),

    hpMpPositionS: cc.p(282 - cc.winSize.width / 2, cc.winSize.height / 2 + 250),
    hpMpPositionD: cc.p(282 - cc.winSize.width / 2, cc.winSize.height / 2 - 6),

    activityPositionS: cc.p(cc.winSize.width/2-200,cc.winSize.height/2+200),
    activityPositionD: cc.p(cc.winSize.width/2-200,cc.winSize.height/2-50)
};

// var isShowAds=false;
// var sdkManager = cb.SDKManager.getInstance();
// sdkManager.showRewardedAd();


var mainPanel = null;
var AreaScene = cc.Scene.extend({
    areaCCSLayer: null,
    ctor: function() {
        this._super();

        mainPanel = this;
        this.setTag(13846);

        var areaLayer = new AreaLayer();
        this.addChild(areaLayer);
        areaLayer.setLocalZOrder(100);
        this.areaCCSLayer = areaLayer;
        // this.hpMpLayer=this.areaCCSLayer.hpMpLayer;

        this.skillPanel = areaLayer.skillPanel;
        this.controlPanel =areaLayer.controlPanel;

        this.playerLayer = areaLayer.playerLayer;
        this.characterLayer = areaLayer.characterLayer;
        this.characterLayer.showCharacter(null, false);

        this.taskPanel = areaLayer.taskPanel;
        this.smallChatView = areaLayer.smallChatView;

        this.isHideControl = false;

        var chestEffectLayer = new cb.ChestEffectLayer();
        this.addChild(chestEffectLayer);
        this.chestEffectLayer = chestEffectLayer;
    },

    setQuickChat:function(isEnable){
        this.smallChatView.setQuickChat(isEnable);
    },

    isControl:function(){
        return this.controlPanel._isInControl;
    },

    onEnter: function() {
        this._super();
        if (!app.getCurPlayer) {
            return;
        }
        tipsManager.showTips();

        if(app.getCurArea().areaKind<=AreaKinds.NORMAL_AREA){
            taskManager.updateCurTask();
            taskManager.continueTask();
        }else{
            this.taskPanel.taskNode.removeFromParent();
            this.taskPanel=null;
        }

        // Task.prototype.addNPCToArea(50001);
        // Task.prototype.addNPCToArea(50002);
        // cb.CommonLib.showResInfo();

        // var colorLogLayer=new cb.ColorLogLayer();
        // colorLogLayer.setPosition(cc.winSize.width/2,cc.winSize.height/2-90);
        // this.addChild(colorLogLayer);
    },

    pushItem: function(kindId, position) {
        this.chestEffectLayer.pushItem(kindId, position);
    },

    fadeInItem: function(menuId) {
        this.areaCCSLayer.menuLayer.fadeInItem(menuId);
        this.hideControlPanel();
    },

    setInvisibleItem: function(menuId, isLayout) {
        this.areaCCSLayer.menuLayer.setInvisibleItem(menuId);
        if (isLayout) {
            this.areaCCSLayer.menuLayer.layoutMenuItem();
        }
    },

    updateCaoCoin: function() {
        this.playerLayer.updateCaoCoin();
    },

    enableAutoFight: function(isEnableAuto) {
        this.areaCCSLayer.enableAutoFight(isEnableAuto);
    },

    notifyReceiveMsg: function() {
        this.smallChatView.notifyReceiveMsg();
        // this.bigChatView.notifyReceiveMsg();
    },

    setExp: function(experience,nextLevelExp) {
        var percent = Math.floor(experience * 100 / nextLevelExp);
        this.areaCCSLayer.experienceBar.setPercent(percent);
        this.areaCCSLayer.expText.setString(experience+"/"+nextLevelExp);
    },

    showSkillCD: function(position, cdTime) {
        this.skillPanel.showSkillCD(position, cdTime);
    },

    equipSkill: function(skillId) {
        this.skillPanel.equipSkill(skillId);
    },

    setHpBar: function(percent, hp, maxHp) {
        var playerLayer=this.playerLayer;
        playerLayer.hpBar.stopAllActions();
        playerLayer.hpBar.runAction(cc.ProgressTo.create(0.5, percent));
        playerLayer.hpText.setString(hp + "/" + maxHp);
    },

    setMpBar: function(percent, mp, maxMp) {
        var playerLayer=this.playerLayer;
        playerLayer.mpBar.stopAllActions();
        playerLayer.mpBar.runAction(cc.ProgressTo.create(0.5, percent));
        playerLayer.mpText.setString(mp + "/" + maxMp);

        this.skillPanel.updateMp(mp);
    },

    setCharacterHp: function(character) {
        this.characterLayer.updateCharacter(character);
    },

    setLevel: function(level) {
        this.playerLayer.lvText.setString("Lv" + level);
    },

    showCharacter: function(character, isVisible) {
        this.characterLayer.showCharacter(character, isVisible);
    },

    showPlayer: function(player) {
        this.playerLayer.setPlayer(player);
        this.skillPanel.updateFightSkills();
        if (this.taskPanel) {
            this.taskPanel.updateTaskDatas();
        }
        // this.setHpMp(player);
        // this.setFightMode(player);
        // this.isHideControl=true;
        // this.showControlPanel();
    },

    setHpMp: function(player) {
        if (this.hpMpLayer) {
            this.hpMpLayer.setHpMp(player);
        }
    },
 
    setFightMode:function(player){
        if (this.hpMpLayer) {
            this.hpMpLayer.setFightMode(player);
        }
    },

    updateFightSkills: function() {
        this.skillPanel.updateFightSkills();
    },

    updateTaskDatas: function() {
        if (this.taskPanel) {
            this.taskPanel.updateTaskDatas();
        }
    },

    updateTaskData: function(taskData) {
        if (this.taskPanel) {
            this.taskPanel.updateTaskData(taskData);
        }
    },

    setDisplayTask:function(enable){
        if (this.taskPanel) {
            this.taskPanel.setDisplayTask(enable);
        }
    },

    setControlVisible: function() {
        if (this.isHideControl) {
            this.showControlPanel();
        } else {
            this.hideControlPanel();
        }
    },

    setMapName: function(area) {
        cc.log("setMapName=============>>");
        var areaCCSLayer = this.areaCCSLayer;
        areaCCSLayer.mapNamelabel.setString(area.areaName);
        if (area.areaKind === AreaKinds.SAFE_AREA) {
            areaCCSLayer.mapNamelabel.setColor(consts.COLOR_GREEN);
        } else {
            areaCCSLayer.mapNamelabel.setColor(consts.COLOR_RED);
        }
        var miniMapFile = "miniMap/" + area.resId + ".jpg";
        if (jsb.fileUtils.isFileExist(miniMapFile)) {
            areaCCSLayer.mapBtn.setEnabled(true);
        } else {
            areaCCSLayer.mapBtn.setEnabled(false);
        }
    },

    setMapNameColor: function(color) {
        this.areaCCSLayer.mapNamelabel.setColor(color);
    },

    hideControlPanel: function() {
        if (this.isHideControl) return;
        var areaCCSLayer=this.areaCCSLayer;
        var sequence = cc.Sequence.create(
            cc.MoveTo.create(0.3, layerPositions.controlPositonD),
            cc.Hide.create()
        );
        areaCCSLayer.controlNode.runAction(sequence);

        var sequence = cc.Sequence.create(
            cc.MoveTo.create(0.3, layerPositions.skillPositionD),
            cc.Hide.create()
        );
        areaCCSLayer.skillNode.runAction(sequence);

        areaCCSLayer.menuNode.setVisible(true);
        var moveTo = cc.MoveTo.create(0.3, layerPositions.menuPositionS);
        areaCCSLayer.menuNode.runAction(moveTo);

        // var moveTo = cc.MoveTo.create(0.3, layerPositions.chatPositionS);
        // areaCCSLayer.chatNode.runAction(moveTo);
        areaCCSLayer.chatNode.setVisible(false);

        areaCCSLayer.experienceBar.setVisible(true);
        areaCCSLayer.expText.setVisible(true);
        this.isHideControl = true;

        if (!this.activityLayer) {
            var activityLayer=new cb.ActivityLayer();
            activityLayer.setPosition(layerPositions.activityPositionS);
            this.areaCCSLayer._ccsNode.addChild(activityLayer);
            var sequence = cc.MoveTo.create(0.3, layerPositions.activityPositionD);
            activityLayer.runAction(sequence);
            this.activityLayer=activityLayer;
        }
    },

    showControlPanel: function() {
        if(this.taskPanel){
            this.taskPanel.closePlayerMenuLayer();
        }

        if (this.hpMpLayer){
            var sequence = cc.Sequence.create(
                cc.MoveTo.create(0.3, layerPositions.hpMpPositionS),
                cc.RemoveSelf.create()
            );
            this.hpMpLayer.hpMpNode.runAction(sequence);
            this.hpMpLayer=null;
        }

        if (this.activityLayer) {
            var sequence = cc.Sequence.create(
                cc.MoveTo.create(0.3, layerPositions.activityPositionS),
                cc.RemoveSelf.create()
            );
            this.activityLayer.runAction(sequence);
            // this.activityLayer.removeFromParent();
            this.activityLayer=null;
        }

        if (!this.isHideControl) return;
        this.isHideControl = false;

        var areaCCSLayer=this.areaCCSLayer;
        var sequence = cc.MoveTo.create(0.3, layerPositions.controlPositonS);
        areaCCSLayer.controlNode.runAction(sequence);
        areaCCSLayer.controlNode.setVisible(true);

        sequence = cc.MoveTo.create(0.3, layerPositions.skillPositionS);
        areaCCSLayer.skillNode.runAction(sequence);
        areaCCSLayer.skillNode.setVisible(true);

        // var moveTo = cc.MoveTo.create(0.3, layerPositions.chatPositionD);
        // areaCCSLayer.chatNode.runAction(moveTo);
        areaCCSLayer.chatNode.setVisible(true);

        sequence = cc.Sequence.create(
            cc.MoveTo.create(0.3, layerPositions.menuPositionD),
            cc.Hide.create()
        );
        areaCCSLayer.menuNode.runAction(sequence);

        areaCCSLayer.experienceBar.setVisible(false);
        areaCCSLayer.expText.setVisible(false);
        
        return true;
    },

    setHpMpVisible: function(isForce) {
        if (isForce) {
            if (this.hpMpLayer){
                return;
            }
        }
        if (this.hpMpLayer){
            var sequence = cc.Sequence.create(
                cc.MoveTo.create(0.3, layerPositions.hpMpPositionS),
                cc.RemoveSelf.create()
            );
            this.hpMpLayer.hpMpNode.runAction(sequence);
            this.hpMpLayer=null;
        }else{
            var hpMpLayer = new cb.HpMpLayer();
            var curPlayer = app.getCurPlayer();
            hpMpLayer.setHpMp(curPlayer);
            this.areaCCSLayer._ccsNode.addChild(hpMpLayer.hpMpNode);
            var sequence = cc.MoveTo.create(0.3, layerPositions.hpMpPositionD);
            hpMpLayer.hpMpNode.runAction(sequence);

            this.hpMpLayer=hpMpLayer;
        }
    },

    runStartTimer: function() {
        cc.spriteFrameCache.addSpriteFrames("uiimg/battle_ui.plist");
        this.showAreaTips(false);

        var timeSec = 3;
        var self=this;
        var onTimerFunc = function() {
            var spriteName;
            if (timeSec === 0) {
                spriteName = "#battle_start_go.png";
            }else if (timeSec<0) {
                app.getCurArea().run();
                return;
            }else {
                spriteName = "#battle_start_" + timeSec + ".png";
            }
            timeSec--;
            var timerSprite = new cc.Sprite(spriteName);
            timerSprite.setScale(8);

            var scaleTo = cc.EaseBounceOut.create(cc.ScaleTo.create(1.0, 2));
            var sequence = cc.Sequence.create(
                    scaleTo,
                    cc.CallFunc.create(onTimerFunc),
                    cc.RemoveSelf.create()
                    );
            timerSprite.runAction(sequence);
            timerSprite.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
            self.addChild(timerSprite, 99);
        };
        onTimerFunc();
    },

    createAreaProgress:function(guildName,isOwn){
        this.destoryAreaProgress();
        if (!this.aresProgressNode) {
            this.aresProgressNode=cc.Node.create();
            this.aresProgressNode.setPosition(cc.winSize.width / 2, cc.winSize.height-150);
            this.addChild(this.aresProgressNode, 99);
            cc.spriteFrameCache.addSpriteFrames("uiimg/update_ui.plist");

            var progressBgSprite=new cc.Sprite("#load_progress_bar_bg.png");
            this.aresProgressNode.addChild(progressBgSprite);
            // var barSprite = new cc.Sprite("#load_progress_bar.png");
            var barSprite;
            if (isOwn) {
                barSprite = new cc.Sprite("#bar_mp_front.png");
            }else{
                barSprite = new cc.Sprite("#bar_hp_front.png");
            }
            // var barSprite = new cc.Sprite("#bar_hp_front.png");
            var progressTimer = cc.ProgressTimer.create(barSprite);
            progressTimer.setType(cc.ProgressTimer.TYPE_BAR);
            progressTimer.setBarChangeRate(cc.p(1, 0));
            progressTimer.setMidpoint(cc.p(0, 0.5));
            progressTimer.setPosition(0,-1);
            progressTimer.setScaleX(2.9);
            progressTimer.setScaleY(1.5);
            this.aresProgressNode.addChild(progressTimer);
            this.aresProgress=progressTimer;

            var label = cc.Label.createWithSystemFont(guildName+"占领进度", "Arial",26);
            label.setColor(cc.color(225, 225, 225));
            formula.enableOutline(label);
            label.setPosition(0,30);
            this.aresProgressNode.addChild(label);
            this.areaProgressTipsLabel=label;

            var label = cc.Label.createWithSystemFont("0/1000", "Arial",24);
            label.setColor(cc.color(225, 225, 225));
            formula.enableOutline(label);
            this.aresProgressNode.addChild(label);
            this.areaProgressLabel=label;
        }
        this.aresProgress.setPercentage(0);
    },

    destoryAreaProgress:function(){
        if (this.aresProgressNode) {
            this.removeChild(this.aresProgressNode);
            this.aresProgressNode=null;
        }
    },

    showAreaProgress: function(value) {
        if (this.aresProgressNode) {
            this.aresProgress.setPercentage(value * 100 / 1000);
            this.areaProgressLabel.setString(value + "/1000");
        }
    },

    enableLowBlood:function(isEnable){
        var bloodSprite = this.getChildByTag(520748);
        if (bloodSprite) {
            this.removeChildByTag(520748, true);
        }
        if (!isEnable) {
            return;
        }

        bloodSprite=new cc.Sprite("effect/blood.png");
        bloodSprite.setPosition(cc.winSize.width/2,cc.winSize.height/2);
        bloodSprite.setScaleX(cc.winSize.width/128);
        bloodSprite.setScaleY(cc.winSize.height/96);
        var sequence=cc.Sequence.create(cc.DelayTime.create(0.8),cc.FadeOut.create(0.3),cc.RemoveSelf.create());
        bloodSprite.runAction(sequence);
        bloodSprite.setTag(520748);
        this.addChild(bloodSprite);
    },

    showAreaTips:function(areaTips){
        if (areaTips) {
            if (this.areaTipsLabel) {
                this.removeChild(this.areaTipsLabel);
            }
            var label = cc.Label.createWithSystemFont(areaTips, "Arial",32);
            label.setColor(cc.color(225, 225, 225));
            label.enableOutline(cc.color(255,0,0,255),3);
            label.setPosition(cc.winSize.width/2,cc.winSize.height/2);
            this.addChild(label);
            this.areaTipsLabel=label;
        }else{
            if (this.areaTipsLabel) {
                this.areaTipsLabel.removeFromParent();
                delete this['areaTipsLabel'];
            }
        }
    }

});

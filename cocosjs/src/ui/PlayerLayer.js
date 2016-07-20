cb.PlayerLayer = cc.Class.extend({
    ctor:function(playerNode){
   		playerNode.setPosition(-cc.winSize.width/2,cc.winSize.height/2);

        this.portraitSprite=playerNode.getChildByName("portraitSprite");
        this.userNameText=playerNode.getChildByName("userNameText");
        // this.hpBar=playerNode.getChildByName("hpBar");
        // this.mpBar=playerNode.getChildByName("mpBar");
        this.lvText=playerNode.getChildByName("lvText");
        this.vipText=playerNode.getChildByName("vipText");

        this.hpText=playerNode.getChildByName("hpText");
        this.mpText=playerNode.getChildByName("mpText");
        this.hpText.setLocalZOrder(1);
        this.mpText.setLocalZOrder(1);

        var hpBarSprite = new cc.Sprite("#bar_hp_front.png");
        var hpBar = cc.ProgressTimer.create(hpBarSprite);
        hpBar.setType(cc.ProgressTimer.TYPE_BAR);
        hpBar.setBarChangeRate(cc.p(1, 0));
        hpBar.setMidpoint(cc.p(0, 0.5));
        hpBar.setPosition(this.hpText.getPosition());
        hpBar.setPercentage(100);
        playerNode.addChild(hpBar);
        this.hpBar=hpBar;

        var mpBarSprite = new cc.Sprite("#bar_mp_front.png");
        var mpBar = cc.ProgressTimer.create(mpBarSprite);
        mpBar.setType(cc.ProgressTimer.TYPE_BAR);
        mpBar.setBarChangeRate(cc.p(1, 0));
        mpBar.setMidpoint(cc.p(0, 0.5));
        mpBar.setPosition(this.mpText.getPosition());
        mpBar.setPercentage(100);
        playerNode.addChild(mpBar);
        this.mpBar=mpBar;

        var panelBtn=playerNode.getChildByName("panelBtn");
        panelBtn.addTouchEventListener(this.touchEvent, this);

        var hpMpBtn=playerNode.getChildByName("hpMpBtn");
        hpMpBtn.addTouchEventListener(this.touchEvent, this);

        var tempTexture = cc.director.getTextureCache().addImage("fonts/atlas_yellow.png");
        var caoCoinLabel=cc.Label.createWithCharMap(tempTexture,32,40,37);
        caoCoinLabel.setPosition(248,-97);
        playerNode.addChild(caoCoinLabel);
        caoCoinLabel.setAnchorPoint(cc.p(1,0.5));
        caoCoinLabel.setScaleX(0.4);
        caoCoinLabel.setScaleY(0.5);
        this.caoCoinLabel=caoCoinLabel;

        this.playerNode=playerNode;

        var caoCoinSprite=playerNode.getChildByName("caoCoinSprite");
        var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/bar_coin.plist", "bar_coin_");
        var animate = cc.Animate.create(clickEfectAnim)
        var repeatForever = cc.RepeatForever.create(animate);
        caoCoinSprite.runAction(repeatForever);
	},

	touchEvent: function(sender, type) {
        if (type===ccui.Widget.TOUCH_ENDED) {
            if (!mainPanel) 
                return;

            if (sender.getName()==="panelBtn") {
                mainPanel.setControlVisible();
            }else{
                mainPanel.setHpMpVisible();
            }
            
        }
    },

    updateCaoCoin:function(){
        var curPlayer = app.getCurPlayer();
        this.caoCoinLabel.setString(curPlayer.getCaoCoinString());
    },

    // increaseCaoCoin:function(delta){
    //     var curPlayer = app.getCurPlayer();
    //     this.caoCoinLabel.setString(curplayer.getCaoCoinString());

    //     var tempTexture = cc.director.getTextureCache().addImage("fonts/atlas_yellow.png");
    //     var caoCoinLabel=cc.Label.createWithCharMap(tempTexture,32,40,37);
    //     caoCoinLabel.setPosition(288,-120);
    //     this.playerNode.addChild(caoCoinLabel);
    //     caoCoinLabel.setString(delta);
    //     caoCoinLabel.setAnchorPoint(cc.p(1,0.5));
    //     caoCoinLabel.setScaleX(0.6);
    //     caoCoinLabel.setScaleY(0.6);
    // },

    // decreaseCaoCoint:function(delta){
    // },

    setPlayer:function(curplayer){
        this.lvText.setString("Lv"+curplayer.level);
        this.userNameText.setString(curplayer.name);
        this.vipText.setString("VIP"+curplayer.vip);
        this.caoCoinLabel.setString(curplayer.getCaoCoinString());
        
//        this.caoCoinLabel.setString(curplayer.caoCoin);
        // var maxHp = curplayer.maxHp || 1;
        // var hp=curplayer.hp || 0;
        // var percent = Math.floor(hp * 100 / maxHp);
        // this.hpBar.setPercent(percent);

        // var maxMp = curplayer.maxMp || 1;
        // var mp=curplayer.mp || 0;
        // percent = Math.floor(mp * 100 / maxMp);
        // this.mpBar.setPercent(percent);

        var headIconFile="icon/head/head_"+curplayer.entityData.headId+".png";
        this.portraitSprite.setTexture(headIconFile);
    }
});


cb.CharacterLayer = cc.Class.extend({
    ctor:function(characterNode){
   		characterNode.setPosition(150,cc.winSize.height/2);

        this.portraitSprite=characterNode.getChildByName("portraitSprite");
        this.userNameText=characterNode.getChildByName("userNameText");
        this.lvText=characterNode.getChildByName("lvText");

        // this.hpBar=characterNode.getChildByName("hpBar");
        this.hpText=characterNode.getChildByName("hpText");
        this.hpText.setLocalZOrder(1);
        this.characterNode=characterNode;

        var hpBarSprite = new cc.Sprite("#bar_hp_front.png");
        var hpBar = cc.ProgressTimer.create(hpBarSprite);
        hpBar.setType(cc.ProgressTimer.TYPE_BAR);
        hpBar.setBarChangeRate(cc.p(1, 0));
        hpBar.setMidpoint(cc.p(0, 0.5));
        hpBar.setPosition(this.hpText.getPosition());
        hpBar.setPercentage(0);
        hpBar.setScale(0.85);
        characterNode.addChild(hpBar);
        this.hpBar=hpBar;
	},

	setCharacter:function(character){
        var isSetValue=this.character!==character;
		if (!character) return;

        this.updateCharacter(character,isSetValue);

        this.lvText.setString("Lv"+character.level);
        this.userNameText.setString(character.name);

        var headIconFile="";
        if (character.type === EntityType.PLAYER) {
            headIconFile="icon/head/head_"+character.entityData.headId+".png";
            var panelBtn=this.characterNode.getChildByName("panelBtn");
            panelBtn.addTouchEventListener(this.touchEvent, this);

            this.character=character;
        }else{
            headIconFile="icon/head/head_"+character.entityData.headId+".png";
            this.character=null;
        }
        this.portraitSprite.setTexture(headIconFile);
        var contentSize=this.portraitSprite.getContentSize();
        this.portraitSprite.setScaleX(60/contentSize.width);
        this.portraitSprite.setScaleY(60/contentSize.height);
		
        var self=this;
        var onActionCallback=function(sender){
            self.showCharacter(null,false);
            app.area.map.hideSelectEffect();
        };

        this.characterNode.stopAllActions();

        var sequence = cc.Sequence.create(
            cc.DelayTime.create(5),
            cc.CallFunc.create(onActionCallback)
        );
        this.characterNode.runAction(sequence);
	},

	touchEvent: function(sender, type) {
        if (type===ccui.Widget.TOUCH_ENDED) {
            if (this.character) {
                layerManager.openPanel(cb.kMPlayerPanelId,this.character);
            }
        }
    },

    updateCharacter:function(character,isSetValue){
        if (character.maxHp) {
            var percent = Math.floor(character.hp * 100 / character.maxHp);
            if (percent < 0)
                percent = 0;

            this.hpBar.stopAllActions();
            if (isSetValue) {
                this.hpBar.setPercentage(percent);
            }else{
                this.hpBar.runAction(cc.ProgressTo.create(0.5, percent));
            }
            // this.hpBar.setPercent(percent);
            this.hpText.setString(character.hp +"/"+ character.maxHp);
        }
    },

	showCharacter:function(character,isVisible){
		if (isVisible) {
			this.setCharacter(character);
			this.characterNode.setVisible(true);
		}else{
			if (!this.character || !character 
                || this.character===character) {
				this.characterNode.setVisible(false);
				this.setCharacter(null);
			}
		}
	}

});


// cb.MonsterLayer = cc.Class.extend({
//     ctor:function(characterNode){
//    		playerNode.setPosition(-cc.winSize.width/2,cc.winSize.height/2);

//         // this.portraitSprite=playerNode.getChildByName("portraitSprite");
//         this.userNameText=playerNode.getChildByName("userNameText");
//         this.hpBar=playerNode.getChildByName("hpBar");
//         this.mpBar=playerNode.getChildByName("mpBar");
//         this.lvText=playerNode.getChildByName("lvText");
//         this.vipText=playerNode.getChildByName("vipText");
// 	}
// });



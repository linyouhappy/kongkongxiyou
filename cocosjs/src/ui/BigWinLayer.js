
cb.BigWinLayer = cc.Layer.extend({
    ctor: function() {
        this._super();
        // this.createCCSNode("uiccs/BigWinLayer.csb");
        var ccsNode = ccs.CSLoader.createNode("uiccs/BigWinLayer.csb");
        this.addChild(ccsNode);
        this._ccsNode=ccsNode;

        this.openBgTouch();
    },

    openBgTouch:function(){
        var onTouchBegan = function(touch, event) {
            return true;
        };

        var self = this;
        var onTouchEnded = function(touch, event) {
            // self.removeFromParent();
        };

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan,
            onTouchEnded: onTouchEnded
        }, this);
    },

    runWord:function(){
        cc.director.getScheduler().schedule(this.onUpdate,this,0.01, cc.REPEAT_FOREVER, 0, false,"BigWinLayer");
    },

    stopWord:function(){
        cc.director.getScheduler().unschedule("BigWinLayer",this);
        // this.runAction(cc.RemoveSelf.create());
        // this.removeFromParent();
        var sequence = cc.Sequence.create(
            cc.DelayTime.create(0.5),
            cc.RemoveSelf.create()
        );
        this.runAction(sequence);
    },

    onUpdate:function(delta){
        this.curCaoCoin+=this.deltaCaoCoin;
        if (this.curCaoCoin>=this.caoCoin) {
            this.caoCoinLabel.setString(this.caoCoin);
            this.stopWord();
        }else{
            this.caoCoinLabel.setString(this.curCaoCoin);
        }
    },

    showCaoCoin:function(caoCoin){
        var ccsNode=this._ccsNode;
        ccsNode.setLocalZOrder(1);
        var bgSprite=ccsNode.getChildByName("bgSprite");
        var bigWinSprite=ccsNode.getChildByName("bigWinSprite");
        var caoCoinLabel=ccsNode.getChildByName("caoCoinLabel");
        bgSprite.setScale(0.3);
        if (caoCoin<1000) {
            bigWinSprite.removeFromParent();
            bigWinSprite=null;
        }else if (caoCoin<10000) {
        }else if (caoCoin<100000) {
            bgSprite.setSpriteFrame("bigwin_score_bg_2.png");
            bigWinSprite.setSpriteFrame("bigwin_score_text_2.png");
        }else{
            bgSprite.setSpriteFrame("bigwin_score_bg_3.png");
            bigWinSprite.setSpriteFrame("bigwin_score_text_3.png");
        }

        if (bigWinSprite) {
            bigWinSprite.setVisible(false);
        }
        caoCoinLabel.setVisible(false);
        caoCoinLabel.setString("0");
        this.caoCoinLabel=caoCoinLabel;
        this.caoCoin=caoCoin;
        this.deltaCaoCoin=parseInt(caoCoin/100);
        this.curCaoCoin=0;

        var self=this;
        var onActionCallback = function(sender) {
            if (bigWinSprite) {
                bigWinSprite.setVisible(true);

                var sequence = cc.Sequence.create(
                    cc.ScaleTo.create(0.1,1.1,1),
                    cc.ScaleTo.create(0.2,1,1),
                    cc.ScaleTo.create(0.1,1,1.1),
                    cc.ScaleTo.create(0.2,1,1)
                );
                bigWinSprite.runAction(cc.RepeatForever.create(sequence));
            }
            caoCoinLabel.setVisible(true);

            var particleFile;
            if (caoCoin<10000){
                particleFile='particle/bigwin_blowout_0.plist';
            }else if (caoCoin>=10000) {
                particleFile='particle/bigwin_blowout_1.plist';
            }else if (caoCoin>=100000) {
                particleFile='particle/bigwin_blowout_2.plist';
            }
            if (particleFile) {
                var emitter = new cc.ParticleSystem(particleFile);
                emitter.setPosition(0,0);
                self.addChild(emitter);
            }
            
            self.runWord();
        };

        var sequence = cc.Sequence.create(
            cc.ScaleTo.create(0.2,1),
            cc.CallFunc.create(onActionCallback)
        );
        bgSprite.runAction(sequence);

        soundManager.playEffectSound("sound/ui/coin_sound.mp3");
        // var bgSprite = new cc.Sprite(bgSpriteName);
        // this.addChild(bgSprite);
        // if (bigWinSpriteName) {
        //     var bigWinSpriteName = new cc.Sprite(bigWinSpriteName);
        //     this.addChild(bigWinSpriteName);
        // }
    }

});
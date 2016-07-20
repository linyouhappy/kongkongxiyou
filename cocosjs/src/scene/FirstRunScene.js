cb.FirstRunLayer = cc.Layer.extend({
    ctor: function() {
        this._super();

        this.welcomeWords = [
            "欢迎进入到《空空西游》",
            "",
            "《空空西游》是首款个人开发者MMORPG手机网游",
            "策划、程序和美术全部一人完成。",
            "",
            "完全依靠国产开源软件技术",
            "客户端使用cocos2d-js引擎",
            "服务端使用pomelo-js分布式引擎",
            "从零开始，使用js语言构建此项目",
            "",
            "首款完全不需要充值的手游，不卖任何道具和收费。",
            "。。。。。。",
            "",
            "策划",
            "林佑",
            "",
            "程序",
            "林佑",
            "",
            "美术",
            "林佑",
            "",
            "最后",
            "感谢您的支持！",
        ];

        this.wordsIndex=0;
        this.positionY = cc.winSize.height/2 - 20;
        this.containerNode=cc.Node.create();
        this.addChild(this.containerNode);

        var menu = new cc.Menu();
        menu.setPosition(0, 0);
        this.addChild(menu);

        var label =cc.Label.createWithSystemFont("点这里快速跳过>>", "Arial",24);
        label.setColor(cc.color(225, 0, 0));
        label.setAnchorPoint(cc.p(1,1));

        var menuItem = new cc.MenuItemLabel(label, function(sender){
            this.finishShow();
        }, this);
        menuItem.setPosition(cc.winSize.width/2-110,cc.winSize.height/2-23);
        menu.addChild(menuItem);
        menu.setLocalZOrder(10);

        this.deltaY=0;
        this.rowHeight=38;

        var words = this.welcomeWords.shift();
        var label = cc.Label.createWithSystemFont(words, "Arial",30);
        label.setColor(cc.color(225, 225, 225));
        label.enableOutline(cc.color(255,0,0,255),3);
        this.containerNode.addChild(label);

        label.setScale(2);

        var self = this;
        var onActionCallback = function(sender) {
            self.runNext();
        };
        var sequence = cc.Sequence.create(
            cc.DelayTime.create(1.5),
            cc.ScaleTo.create(0.3,1),
            cc.DelayTime.create(0.5),
            cc.MoveTo.create(0.5,cc.p(0,this.positionY)),
            cc.CallFunc.create(onActionCallback)
        );
        label.runAction(sequence);

//        var self=this;
//        setTimeout(function() {
//            self.openBgTouch();
//        }, 500);
    },

    // openBgTouch:function(){
    //     var self=this;
    //     var onTouchBegan = function(touch, event) {
    //         self.finishShow();
    //         return true;
    //     };
    //     cc.eventManager.addListener({
    //         event: cc.EventListener.TOUCH_ONE_BY_ONE,
    //         swallowTouches: true,
    //         onTouchBegan: onTouchBegan
    //     }, this);
    // },

    finishShow: function() {
        clearInterval(this.intervalId);
        sys.localStorage.setItem("kRunStepKey", 1);

        var self=this;
        // var onTouchBegan = function(touch, event) {
        //     if (self.callback) {
        //         self.callback();
        //     }
        //     return true;
        // };
        // cc.eventManager.addListener({
        //     event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //     swallowTouches: true,
        //     onTouchBegan: onTouchBegan
        // }, this);

        var onActionCallback = function(sender) {
            if (self.callback) {
                self.callback();
            }
        };
        var sequence = cc.Sequence.create(
            cc.DelayTime.create(0.2),
            cc.CallFunc.create(onActionCallback)
        );
        this.runAction(sequence);
    },

    runNext: function() {
        if (!this.welcomeWords.length) {
            this.finishShow();
            return;
        }

        var words;
        var rowCount=0;
        while(!words || words.length===0){
            words = this.welcomeWords.shift();
            this.wordsIndex++;
            rowCount++;
        }

        var y=this.positionY-this.rowHeight*this.wordsIndex;
        if (y+this.deltaY<-cc.winSize.height/2+80) {
            this.deltaY+=this.rowHeight*rowCount;
            this.containerNode.runAction(cc.MoveTo(0.5,cc.p(0,this.deltaY)));
        }

        var singleWords=[];
        for (var i = 0; i < words.length; i++) {
            singleWords.push(words[i]);
        }
        this.singleWords=singleWords;
        this.curString="";

        var label = cc.Label.createWithSystemFont("", "Arial",30);
        label.setColor(cc.color(225, 225, 225));
        label.enableOutline(cc.color(255,0,0,255),3);
        this.containerNode.addChild(label);
        label.setPosition(0,y);

        this.curLabel=label;
        this.flyWord();
    },

    flyWord:function(){
        if (this.singleWords.length===0) {
            this.runNext();
            return;
        }
        var singleWord=this.singleWords.shift();
        // cc.log("singleWord="+singleWord);
        
        var label = cc.Label.createWithSystemFont(singleWord, "Arial",30);
        label.setColor(cc.color(225, 225, 225));
        label.enableOutline(cc.color(255,0,0,255),3);
        this.containerNode.addChild(label);

        var endPos = this.curLabel.getPosition();
        var labelSize = this.curLabel.getContentSize();
        endPos.x += labelSize.width/2;

        var beginPos=cc.p(Math.floor(cc.winSize.width*Math.random()), cc.winSize.height);        
        // beginPos.x=endPos.x;
        label.setPosition(beginPos);

        // cc.log("beginPos.x="+beginPos.x);

        var  duration = 0.1;
        var  rotateDuration = 0.05;
        var repeatTime = 2; 

        var self=this;
        var onActionCallback = function(sender) {
            label.removeFromParent();
            self.curString+=singleWord;
            self.curLabel.setString(self.curString);

            self.flyWord();
        };
        var sequence = cc.Sequence.create(
            cc.Spawn.create(
                cc.MoveTo.create(duration, endPos),
                cc.Repeat.create(
                    cc.RotateBy.create(rotateDuration, (Math.random() > 0.5) ? 360 : -360),
                    repeatTime)
                // cc.FadeIn.create(duration)
                ),
            cc.CallFunc.create(onActionCallback)
        );
        label.runAction(sequence);
    }

});

cb.FirstRunScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var x = cc.winSize.width / 2;
        var y = cc.winSize.height / 2;
        var bgSprite = new cc.Sprite("uiimg/load_scene.png");
        bgSprite.setPosition(x, y);
        this.addChild(bgSprite, 0);

        var layer = new cb.FirstRunLayer();
        layer.setPosition(x, y);
        this.addChild(layer);
        this.layer = layer;
    },

    addEventListener:function(callback){
        this.layer.callback=callback;
    }
});
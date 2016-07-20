cb.PreludeLayer = cc.Layer.extend({
    ctor: function() {
        this._super();

        this.welcomeWords = [
            "《空空西游》",
            "本剧情纯属虚构 如有雷同纯属巧合。",
            "----林佑著",
            "",
            "本剧情讲述一段离奇的西天取经的故事。",
            "",
            "",
            "有一天，一位大侠奔赴武当会武，",
            "路过一茅厕。",
            "女厕断续传来婴儿的哭啼声，",
            "细听声音，却有几番蹊跷。",
            "大侠决定探个究竟，贼眉鼠眼地溜进女厕。",
            "大吃一惊，一个婴儿被丢弃在地上。",
            "寻人，无果。",
            "细想不能见死不救，于是带着婴儿上路。",
            "",
            "赶了三里路，大侠来到了草莓庄。",
            "遇到一户人家，偷偷把婴儿放在门口,",
            "放点银子，一溜烟就消失在林荫路上。",
            "",
            "莓果长老五十有余，",
            "独自一人，以种草莓为生。",
            "从草莓园归来，在门口遇到婴儿，",
            "不知谁家的婴儿，故收养为徒，",
            "见到小家伙胖嘟嘟的样子，就取名为小胖，",
            "。。。。。。"
        ];

        this.wordsIndex=0;
        this.positionY = cc.winSize.height/2 - 20;
        this.containerNode=cc.Node.create();
        this.addChild(this.containerNode);
        this.deltaY=0;
        this.rowHeight=38;

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

        this.runNext();
        // var self=this;
        // setTimeout(function() {
        //     self.openBgTouch();
        // }, 500);
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
        var self=this;
        var onActionCallback = function(sender) {
            cb.CommonLib.removeRes("uiimg/select_scene.jpg");
            cc.director.popScene();
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
        label.enableOutline(cc.color(0,0,0,255),3);
        this.containerNode.addChild(label);
        label.setAnchorPoint(cc.p(0,0.5));
        label.setPosition(-300,y);

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
        endPos.x += labelSize.width;
        var beginPos=cc.p(endPos.x,cc.winSize.height);
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

cb.PreludeScene = cc.Scene.extend({
    ctor: function() {
        this._super();

        var x = cc.winSize.width / 2;
        var y = cc.winSize.height / 2;
        var bgSprite = new cc.Sprite("uiimg/select_scene.jpg");
        bgSprite.setPosition(x, y);
        this.addChild(bgSprite, 0);

        var layer = new cb.PreludeLayer();
        layer.setPosition(x, y);
        this.addChild(layer);
        this.layer = layer;
    },

    addEventListener:function(callback){
        this.layer.callback=callback;
    }
});
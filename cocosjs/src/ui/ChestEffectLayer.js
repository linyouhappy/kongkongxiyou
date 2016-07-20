cb.ChestEffectLayer = cc.Layer.extend({
    ctor: function() {
        this._super();

        this.items=[];
        this.positions=[];
        this.initView();
        this.isRunning=false;
    },

    initView: function() {
        this.setLocalZOrder(350);

        var chestBoxSprite = new cc.Sprite("#chest_box_close.png");
        this.addChild(chestBoxSprite);
        chestBoxSprite.setScale(0.4);
        chestBoxSprite.setPosition(200, 60);
        this.chestBoxSprite=chestBoxSprite;
        this.setVisible(false);
    },

    pushItem:function(itemId,position) {
        var imgPath = "icon/item/item_" +itemId + ".png";
        if(!jsb.fileUtils.isFileExist(imgPath)){
            return;
        }
        this.items.push(imgPath);
        if (!position) {
            position = {
                x: cc.winSize.width / 2,
                y: cc.winSize.height / 2 + 100
            };
        }
        this.positions.push(position);
        if (!this.isRunning) {
            var childrenCount=this.getChildrenCount();
            if (childrenCount===1) {
                this.chestBoxSprite.setSpriteFrame("chest_box_close.png");
            }else{
                this.chestBoxSprite.setSpriteFrame("chest_box_empty.png");
            }

            this.isRunning=true;
            this.setVisible(true);
            this.popItem();
        }
    },

    popItem:function() {
        var imgPath=this.items.pop();
        var position=this.positions.pop();
        if (imgPath) {
            this.isFinish=false;
            this.setItem(imgPath,position);
        }else{
            this.isFinish=true;
        }
    },

    setItem: function(imgPath,position) {
        var iconSprite = new cc.Sprite(imgPath);
        this.addChild(iconSprite);
        iconSprite.setScale(1.8);

        var x1 = position.x;
        var y1 = position.y;
        iconSprite.setPosition(x1, y1);

        var x2 = this.chestBoxSprite.getPositionX();
        var y2 = this.chestBoxSprite.getPositionY();

        var p = (x2 - x1) * (x2 - x1) / (-2 * (y2 - y1));
        var delta = (x2 - x1) / 10.0;
        var targetX = 0.0;
        var targetY = 0.0;

        var array = [];
        for (var i = 1; i < 10; i++) {
            targetX = x1 + i * delta;
            targetY = (targetX - x1) * (targetX - x1) / (-2 * p) + y1;
            array.push(cc.p(targetX, targetY));
        }
        array.push(cc.p(x2, y2));

        var moveInterval = formula.distance(x1, y1, x2, y2) / 1000.0;
        var cardinalSplineTo = cc.CardinalSplineTo.create(moveInterval, array, 2.0);

        var self=this;
        var onActionCallback = function() {
            iconSprite.removeFromParent();

            var childrenCount=self.getChildrenCount();
            if (childrenCount>2) {
                return;
            }
            if (!self.isFinish) {
                return;
            }
            self.isRunning=false;
            self.chestBoxSprite.setSpriteFrame("chest_box_open.png");
            self.runAction(
                cc.Sequence.create(
                    cc.DelayTime.create(0.3),
                    cc.Hide.create()
                )
            );
        };

        var onActionCallback1 = function() {
            self.chestBoxSprite.setSpriteFrame("chest_box_empty.png");
            self.popItem();
        };
        iconSprite.runAction(
            cc.Sequence.create(
                cc.DelayTime.create(0.2),
                cc.CallFunc.create(onActionCallback1),
                cardinalSplineTo,
                cc.CallFunc.create(onActionCallback)
            )
        );
        this.stopAllActions();
    }
});
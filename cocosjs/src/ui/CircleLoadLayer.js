var circleLoadLayer ={
    showCircleLoad:function(unSetEvent){
        var runningScene=cc.director.getRunningScene();
        if (!runningScene) {
            return;
        }
        circleLoadLayer.hideCircleLoad();

        if (!unSetEvent)
            cc.eventManager.setEnabled(false);

        cc.spriteFrameCache.addSpriteFrames("uiimg/general_ui.plist");

        var nodeContainer=cc.Node.create();
        runningScene.addChild(nodeContainer);

        var circleLoadSprite=new cc.Sprite("#img_circle_load.png");
        circleLoadSprite.setOpacity(200);
        nodeContainer.addChild(circleLoadSprite);

        var label = cc.Label.createWithSystemFont("完美加载中...","Arial", 24);
        label.setColor(cc.color(255,255,255));
        label.setPosition(0,-55);
        nodeContainer.addChild(label);

        nodeContainer.setLocalZOrder(99000);
        nodeContainer.setTag(44138);
        nodeContainer.setPosition(cc.winSize.width/2,cc.winSize.height/2);

        var runTimeInterval=2.5;
        var onActionCallback=function(sender){
            runTimeInterval=runTimeInterval-0.5;
            if (runTimeInterval<1) {
                runTimeInterval=1;
                label.setString("拼命加载中...");

                var onActionCallback1=function(sender){
                    quickLogManager.pushLog("很抱歉，加载失败！",4);
                    circleLoadLayer.hideCircleLoad();
                };
                var sequence = cc.Sequence.create(
                    cc.Repeat.create(cc.RotateBy.create(1.5,360),5),
                    cc.CallFunc.create(onActionCallback1)
                );
                circleLoadSprite.runAction(sequence);
                return;

            } else if (runTimeInterval<2) {
                label.setString("开心加载中...");
            } 

            var sequence = cc.Sequence.create(
                cc.RotateBy.create(runTimeInterval,360),
                cc.CallFunc.create(onActionCallback)
            );
            circleLoadSprite.runAction(sequence);
        };

        var sequence = cc.Sequence.create(
            cc.DelayTime.create(0.5),
            cc.Show.create(),
            cc.CallFunc.create(onActionCallback)
        );
        nodeContainer.runAction(sequence);
        nodeContainer.setVisible(false);
    },

    hideCircleLoad:function(){
        cc.eventManager.setEnabled(true);
        var runningScene=cc.director.getRunningScene();
        if (!runningScene) {
            return;
        }
        var nodeContainer=runningScene.getChildByTag(44138);
        if (!!nodeContainer) {
            runningScene.removeChildByTag(44138,true);
        }
    }
};

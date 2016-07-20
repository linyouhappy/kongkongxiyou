logManager=cb.ColorLogManager.getInstance();

cb.QuickLogManager = cc.Class.extend({
    ctor:function(){
        // this._nativeLogMng=cb.ColorLogManager.getInstance();
        this._nativeScrolLogMng=cb.ScrollLogManager.getInstance();

        // var attackResult = {};

        // attackResult[AttackResult.SUCCESS]="攻击成功！";
        // attackResult[AttackResult.KILLED]="目标已被击杀！";
        // attackResult[AttackResult.MISS]="攻击被闪避！";
        // attackResult[AttackResult.NOT_IN_RANGE]="该目标不在攻击范围！";
        // attackResult[AttackResult.NO_ENOUGH_MP]="蓝血不够，无法使用技能！";
        // attackResult[AttackResult.NOT_COOLDOWN]="该技能未冷却！";
        // attackResult[AttackResult.ATTACKER_CONFUSED]="被迷惑，无法攻击！";
        // attackResult[AttackResult.NO_TARGET]="当前没有可攻击目标！";
        // attackResult[AttackResult.ERROR]="攻击发生错误！";

        // this._attackResult=attackResult;
        this.isEnableLog=true;
    },
    
    pushLog:function(logString,quality){
        if (!!quality)
            logManager.pushLog(logString,quality);
        else
            logManager.pushLog(logString);

        cc.log("LOG:"+logString);
    },

    pushChatLog:function(logString,quality){
        if (!!quality)
            logManager.pushLog(logString,quality);
        else
            logManager.pushLog(logString);

        var msgData={content:logString};
        chatManager.processSystemMsg(msgData);
    },

    pushScrollLog:function(logString,quality){
        if (!!quality)
            this._nativeScrolLogMng.pushLog(logString,quality);
        else
            this._nativeScrolLogMng.pushLog(logString);
    },

    // attackLog:function(attackResult){
    //     var result=this._attackResult[attackResult];
    //     if (!!result) {
    //         this._nativeLogMng.pushLog(result);
    //     }
    // },

    showErrorCode:function(errorCode){
        var result=dataApi.error_code.findById(errorCode);
        if (!result) {
            if (errorCode===201) {
                return;
            }
            result=dataApi.error_code.findById(404);
        }
        logManager.pushLog(result.msg,4);
        cc.log("ERROR:"+result.msg);
    },

    setEnableLog:function(enable){
        this.isEnableLog=enable;
    },

    getItemLog:function(skinId,count){
        if(!this.isEnableLog) return;

        logManager.setFontSize(28);
        logManager.setFontColor(consts.COLOR_WHITE);
        logManager.appendText("获得 ");

        var imgPath=formula.iconImgPath(skinId);
        logManager.appendSpriteFile(imgPath,40);
        logManager.appendText(" x"+count);
        logManager.endRichLog();
    },

    lostItemLogByKindId:function(kindId,count){
        var itemData=dataApi.item.findById(kindId);
        if (itemData) {
            this.lostItemLog(itemData.skinId,count);
        }
    },

    lostItemLog:function(skinId,count){
        logManager.setFontSize(28);
        logManager.setFontColor(consts.COLOR_GREEN);
        logManager.appendText("失去 ");

        var imgPath=formula.iconImgPath(skinId);
        logManager.appendSpriteFile(imgPath,40);
        logManager.appendText(" x"+count);
        logManager.endRichLog();
    },

    getHPMPLog:function(hpmp,isHpOrMp){
        logManager.setFontSize(26);
        logManager.setFontColor(consts.COLOR_GOLD);
        logManager.appendText("获得 ");

        if(isHpOrMp){
            logManager.setFontColor(consts.COLOR_RED);
            logManager.appendText("+"+hpmp+"HP");
        }else{
            logManager.setFontColor(consts.COLOR_BLUE);
            logManager.appendText("+"+hpmp+"MP");
        }

        logManager.endRichLog();
    },

    costCaoCoinLog:function(count){
        logManager.setFontSize(26);
        logManager.appendSpriteFile("icon/item/item_8011.png",0);
        logManager.setFontColor(consts.COLOR_GREEN);
        logManager.appendText(" "+count);
        logManager.endRichLog();
    },

    getCaoCoinLog:function(count){
        logManager.appendSpriteFile("icon/item/item_8011.png",0);
        logManager.setFontSize(26);
        logManager.setFontColor(consts.COLOR_RED);
        logManager.appendText(" +"+count);
        logManager.endRichLog();
    },

    costCrystalLog:function(count){
        logManager.setFontSize(26);
        logManager.appendSpriteFile("icon/item/item_8012.png",0);
        logManager.setFontColor(consts.COLOR_PURE_GREEN);
        logManager.appendText(" "+count);
        logManager.endRichLog();
    },

    getCrystalLog:function(count){
        logManager.setFontSize(26);
        logManager.appendSpriteFile("icon/item/item_8012.png",0);
        logManager.setFontColor(consts.COLOR_PURE_RED);
        logManager.appendText(" +"+count);
        logManager.endRichLog();
    },

    propertyLog:function(propertyName,deltaCount){
        logManager.setFontSize(28);
        logManager.setFontColor(consts.COLOR_WHITE);
        if (deltaCount>0) {
            logManager.appendText(propertyName);
            logManager.setFontColor(consts.COLOR_RED);
            logManager.appendText(" +"+deltaCount);
        }else{
            logManager.appendText(propertyName);
            logManager.setFontColor(consts.COLOR_GREEN);
            logManager.appendText(" "+deltaCount);
        }
        
        logManager.endRichLog();
    },

    expLog:function(deltaExp){
        logManager.setFontSize(28);
        logManager.setFontColor(consts.COLOR_WHITE);
        logManager.appendText("经验");
        logManager.setFontColor(consts.COLOR_RED);
        logManager.appendText(" +"+deltaExp);

        logManager.endRichLog();
    }

});

var quickLogManager=new cb.QuickLogManager();




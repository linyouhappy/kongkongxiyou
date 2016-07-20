
var pomelo = new Pomelo();
// pomelo[0]="PC_EV_USER_DEFINED_PUSH";
// pomelo[1]="PC_EV_CONNECTED";
// pomelo[2]="PC_EV_CONNECT_ERROR";
// pomelo[3]="PC_EV_CONNECT_FAILED";
// pomelo[4]="PC_EV_DISCONNECT";
// pomelo[5]="PC_EV_KICKED_BY_SERVER";
// pomelo[6]="PC_EV_UNEXPECTED_DISCONNECT";
// pomelo[7]="PC_EV_PROTO_ERROR";
// pomelo[8]="PC_EV_COUNT";

pomelo.__onEventCb = function(event) {
    switch (event.type) {
        case this.PC_EV_CONNECTED:
            if (!!this.initCallback) {
                pomelo.initCallback();
                pomelo.initCallback = null;
            }
            cc.log("PC_EV_CONNECTED============>>>");
            break;
        case this.PC_EV_USER_DEFINED_PUSH:
            // this.isRuning &&
            if (app.area && event.route) {
                cc.log("$$$【" + event.route + "】:" + event.msg);
                if (gameMsgHandler[event.route]) {
                    if (event.msg)
                        gameMsgHandler[event.route](JSON.parse(event.msg));
                    else
                        cc.log("ERROR:event.msg=" + event.msg);
                }
            }
            break;
        case this.PC_EV_CONNECT_FAILED:
            tipsBoxLayer.showTipsBox("网络链接失败！");
            break;
        case this.PC_EV_DISCONNECT:
            cc.log("pomelo msg=网络链接已中断！");
            // tipsBoxLayer.showTipsBox("网络链接已中断！");
            break;
        case this.PC_EV_KICKED_BY_SERVER:
            tipsBoxLayer.showTipsBox("您已被服务器踢出，账号在其他地点登陆！");
            break;
        case this.PC_EV_CONNECT_ERROR:
            // tipsBoxLayer.showTipsBox("很抱歉，网络链接已中断，请排查网络故障！");
            // if (app.curPlayerId) {
            //     tipsBoxLayer.yesBtn.setTitleText("重新链接");
            //     tipsBoxLayer.callback = function(isYesOrNo) {
            //         clientManager.loginPlayerAgain();
            //     };

            //     var curPlayer = app.getCurPlayer();
            //     if (curPlayer) {
            //         curPlayer.enableAI(false);
            //     }
            // }
            // break;
        case this.PC_EV_UNEXPECTED_DISCONNECT:
            tipsBoxLayer.showTipsBox("很抱歉，网络发生中断，需要重新链接！！！");
            if (app.curPlayerId) {
                var area = app.getCurArea();
                if (area) {
                    area.networkErrorRemoveAll();
                    layerManager.clearPanel();
                }
                var curPlayer = app.getCurPlayer();
                if (curPlayer) {
                    curPlayer.enableAI(false);
                }
            }
            tipsBoxLayer.yesBtn.setTitleText("重新链接");
            tipsBoxLayer.callback = function() {
                clientManager.loginPlayerAgain();
            };
            break;
        case this.PC_EV_PROTO_ERROR:
            tipsBoxLayer.showTipsBox("协议PROTO出现错误！");
            break;
    }
}

pomelo.__onRequestCb = function(event) {
    if (!!event) {
        if (event.rc == 0) {
            var callback = this.callbacks[event.reqId];
            delete this.callbacks[event.reqId];
            if (typeof callback !== 'function')
                return;

            cc.log("【__onRequestCb】" + event.reqId + ": " + event.resp);
            if (!!event.resp) {
                var msg = JSON.parse(event.resp);
                if (msg.code !== 500){
                    callback(msg);
                }else{
                    cc.log("__onRequestCb ERROR msg.code===500");
                    if (app.enterSceneReqId===event.reqId) {
                        app.tryEnterScene();
                    }
                }
            } else
                callback();
        } else {
            cc.log("ERROR:__onRequestCb rc=" + event.rc);
            if (event.rc === -11)
                cc.log("ERROR:__onRequestCb special ERROR");
        }
    } else {
        cc.log("ERROR:__onRequestCb event=null");
    }
}

pomelo.__onNotifyCb = function(event) {
    if (!!event) {
        if (event.rc == 0) {
            var callback = this.callbacks[event.reqId];
            delete this.callbacks[event.reqId];
            cc.log("【__onNotifyCb】" + event.reqId + ": route=" + event.route);
            if (callback)
                callback();
        } else {
            cc.log("ERROR:__onNotifyCb rc=" + event.rc);
        }
    } else {
        cc.log("ERROR:__onNotifyCb event=null");
    }
}

pomelo.init = function(params, cb) {
    this.initCallback = cb;
    this.callbacks = {}
    return this.__connect(params.host, params.port);
};

pomelo.request = function(route, msg, cb) {
    if (typeof msg === 'object' && msg !== null)
        msg = JSON.stringify(msg);

    var reqId = this.__request(route, msg);
    if (reqId > 0) {
        this.callbacks[reqId] = cb;
        cc.log("request【" + route + "】" + reqId + ":" + msg);
    } else
        cc.log("ERROR[" + reqId + "]:request route=" + route + " msg=" + msg);

    return reqId;
}

pomelo.notify = function(route, msg, cb) {
    if (typeof msg === 'object' && msg !== null)
        msg = JSON.stringify(msg);

    var reqId = this.__notify(route, msg);
    if (reqId > 0) {
        this.callbacks[reqId] = cb;
        cc.log("notify【" + route + "】" + reqId + ":" + msg);
    } else
        cc.log("ERROR[" + reqId + "]:notify route=" + route + " msg=" + msg);
};

pomelo.disconnect = function() {
    this.__disconnect();
};

pomelo.notifyCallback = function() {
    circleLoadLayer.hideCircleLoad();
};
pomelo.notifyWithLoad = function(route, msg) {
    circleLoadLayer.showCircleLoad();
    pomelo.notify(route, msg, pomelo.notifyCallback);
};


// pomelo=null;
// require('src/manager/pomelo-cocos2d-js.js');
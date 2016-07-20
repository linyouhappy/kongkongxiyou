var cb = cb || {};
var app=false;

require('src/app.js');

require('src/manager/consts.js');
require('src/manager/formula.js');

require('src/utils/utils.js');
require('src/utils/dataApi.js');
require('src/utils/resourceLoader.js');
require('src/utils/pathfinding.js');
require('src/utils/componentAdder.js');

require('src/manager/pomelo.js');
require('src/manager/quickLogManager.js');
require('src/manager/chatManager.js');
require('src/manager/LayerManager.js');
require('src/manager/ResourceList.js');
require('src/manager/TeamManager.js');
require('src/manager/TipsManager.js');
require('src/manager/PropertyManager.js');
require('src/manager/TaskManager.js');
require('src/manager/SkillManager.js');
require('src/manager/BagManager.js');
require('src/manager/GuildManager.js');
require('src/manager/SoundManager.js');
require('src/manager/MailManager.js');

require('src/handler/appHandler.js');
require('src/handler/gameMsgHandler.js');
require('src/handler/npcHandler.js');
require('src/handler/playerHandler.js');
require('src/handler/taskHandler.js');
require('src/handler/teamHandler.js');
require('src/handler/skillHandler.js');
require('src/handler/equipHandler.js');
require('src/handler/marketHandler.js');
require('src/handler/federateHandler.js');
require('src/handler/guildHandler.js');
require('src/handler/fightHandler.js');
require('src/handler/chatHandler.js');
require('src/handler/bossHandler.js');
require('src/handler/shopHandler.js');

require('src/model/entity.js');
require('src/model/character.js');
require('src/model/mob.js');
require('src/model/npc.js');
require('src/model/bag.js');
require('src/model/player.js');
require('src/model/curPlayer.js');
require('src/model/transport.js');
require('src/model/bullet.js');
require('src/model/fightMode.js');

require('src/model/area.js');
require('src/model/areaUI.js');
require('src/model/equipment.js');
require('src/model/equipments.js');
require('src/model/item.js');
require('src/model/map.js');
require('src/model/task.js');

require('src/panel/BasePanel.js');
require('src/panel/ChatPanel.js');
require('src/panel/PlotsPanel.js');

require('src/ui/BaseLayer.js');
require('src/ui/BasePanelLayer.js');
require('src/ui/SkillPanel.js');
require('src/ui/ControlPanel.js');
require('src/ui/PlayerLayer.js');
require('src/ui/ItemDetailLayer.js');
require('src/ui/CircleLoadLayer.js');
require('src/ui/TaskLayer.js');
require('src/ui/BigWinLayer.js');
require('src/ui/ItemSelectLayer.js');
require('src/ui/HpMpLayer.js');
require('src/ui/ChestEffectLayer.js');
require('src/ui/ListMenuLayer.js');
require('src/ui/ReviveLayer.js');
require('src/ui/InputBoxLayer.js');

require('src/ai/service/aiManager.js');

require('src/scene/SelectScene.js');
require('src/scene/LoadingScene.js');
require('src/scene/AreaScene.js');

var effectManager=cb.EffectManager.getInstance();
var mapManager=cb.MapManager.getInstance();


cb.ClientManager = cc.Class.extend({
    
    login:function(loginInfo){
        var serverIp = cb.CommonLib.getServerURL();
        var httpHost="http://"+serverIp+":3001/login";
        cc.log("login=====>> username="+loginInfo.username+" password="+loginInfo.password+" httpHost="+httpHost);
        var xhr = cc.loader.getXMLHttpRequest();  
        xhr.open("POST", httpHost,true);
        var self=this;
        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                cc.log("xhr.responseText="+xhr.responseText);
                var data=JSON.parse(xhr.responseText);
                
                if(data.code=== 500) {
                    cc.log('Username or password is invalid!');
                    tipsBoxLayer.showTipsBox("登陆失败，名称或密码是空！");
                    return;
                }
                if(data.code=== 501) {
                    cc.log('User not exist!');
                    tipsBoxLayer.showTipsBox("该名称未注册，是否用它来注册？");
                    tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
                        if (isYesOrNo) {
                            self.register(username,password,self.serverIp);
                        }
                    });
                    return;
                }
                if(data.code=== 502) {
                    cc.log('Username or password is invalid!');
                    tipsBoxLayer.showTipsBox("登陆失败，名称或者密码不对！");
                    return;
                }
                if(data.code!== 200) {
                    cc.log('Username is not exists!');
                    return;
                }
                cc.log("login logining=======>>");
                clientManager.authEntry(data.uid, data.token, function() {
                    // self._loading = false;
                });
            }
        };
        var sendData="username="+loginInfo.username+"&password="+loginInfo.password+"&channel="+loginInfo.channelId+"&model="+loginInfo.deviceModel;
        xhr.send(sendData);
    },

    register:function(username,password){
        var serverIp = cb.CommonLib.getServerURL();
        var httpHost="http://"+serverIp+":3001/register";
        cc.log("register===>>username="+username+" password="+password+" httpHost="+httpHost);
        var xhr = cc.loader.getXMLHttpRequest();  
        xhr.open("POST", httpHost,true);
        // var self=this;
        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                cc.log("xhr.responseText="+xhr.responseText);
                var data=JSON.parse(xhr.responseText);
                if(data.code=== 500) {
                    cc.log('Username or password is invalid!');
                    tipsBoxLayer.showTipsBox("注册失败，名称或密码是空！");
                    return;
                }
                if(data.code!== 200) {
                    cc.log('Username is not exists!');
                    tipsBoxLayer.showTipsBox("注册失败，出现未知错误！");
                    return;
                }
                cc.log("register logining=======>>");
                clientManager.authEntry(data.uid, data.token, function() {
                    // self._loading = false;
                });
            }
        };  
        var sendData="username="+username+"&password="+password;
        xhr.send(sendData);
    },

    authEntry:function(uid, token, callback){
        var serverIp = cb.CommonLib.getServerIP();
        if (!serverIp || serverIp.length === 0) {
            cb.CommonLib.MessageBox("无法连接服务器，IP解析失败!", "错误提示");
            return;
        }

        this._token=token;
        circleLoadLayer.showCircleLoad(true);
        var self=this;
        pomelo.disconnect();
        pomelo.init({host:serverIp, port:3014}, function() {
            pomelo.request('gate.gateHandler.queryEntry', { uid: uid}, function(data) {
                pomelo.disconnect();

                if(data.code === 2001) {
                    tipsBoxLayer.showErrorCode(data.code);
                    self._loading = false;
                    return;
                }
                circleLoadLayer.hideCircleLoad();
                self._host=data.host;
                self._port=data.port;
                cc.log("authEntry ======>> host="+data.host+" port="+data.port);
                self.entry(data.host, data.port, token, callback);
            });
        });
    },

    entry:function(host, port, token, callback) {
        var selectScene=new SelectScene();
        var selectLayer=selectScene._selectLayer;
        cc.director.popToRootScene();
        cc.director.pushScene(selectScene);

        var self=this;
        pomelo.init({host: host, port: port}, function() {
            circleLoadLayer.showCircleLoad(true);
            pomelo.request('connector.entryHandler.entry', {token: token}, function(data) {
                circleLoadLayer.hideCircleLoad();

                if (!!callback) {
                    callback(data.code);
                }
                if (data.code!==200) {
                    tipsBoxLayer.showErrorCode(data.code);
                    return;
                }
                // var player = data.player;
                cc.log("entry =========>>>> connector server");

                if(!app)
                    app=new cb.App();

                cc.log("uid="+data.uid+" kindId="+data.kindId+" serverTime="+data.time+" localTime="+Date.now());

                app.uid=data.uid;
                app.setServerTime(data.time);
                selectLayer.showPlayer(data.players,data.kindId);
            });
        });
    },

    loginPlayer: function(playerInfo) {
        propertyManager.setCurPlayer(playerInfo);
        // cc.log("loginPlayer===>>playerInfo="+JSON.stringify(playerInfo));
        cb.SDKManager.getInstance().submitExtendData(playerInfo.playerId,playerInfo.name,playerInfo.level);

        var playerId=playerInfo.playerId;
        if (!playerId) {
            playerId=app.curPlayerId;
        }
        this.loading = true;
        circleLoadLayer.showCircleLoad();
        var self=this;
        pomelo.request('connector.entryHandler.entryPlayer', {
            uid:app.uid,
            playerId: playerId
        }, function(data) {
            circleLoadLayer.hideCircleLoad();
            if (!data.code || data.code !== 200) {
                self.loading = false;
                tipsBoxLayer.showErrorCode(data.code);
                return;
            }
            // tipsBoxLayer.showTipsBox("登陆角色成功");
            appHandler.loadResource();
        });
    },

    loginPlayerAgain:function(){
        var playerInfo=propertyManager.getCurPlayer();
        this.loginPlayer(playerInfo);
    },

    createPlayer:function(name,kindId){
        cc.log("========>> name="+name+" kindId="+kindId);
        if (!name || name.length===0) {
            tipsBoxLayer.showTipsBox("请取个名字吧！");
            this.loading = false;
        } else if (name.length > 9) {
            tipsBoxLayer.showTipsBox("很抱歉，名字太长！");
            this.loading = false;
        } else {
            this.loading = true;
            circleLoadLayer.showCircleLoad();
            var self=this;
            pomelo.request("connector.roleHandler.createPlayer", {name: name,uid:app.uid, kindId: kindId}, function(data) {
                
                if (!data.code || data.code !== 200) {
                    self.loading = false;
                    circleLoadLayer.hideCircleLoad();

                    tipsBoxLayer.showErrorCode(data.code);
                    return;
                }

                if (!data.playerId) {
                    self.loading = false;
                    circleLoadLayer.hideCircleLoad();
                    tipsBoxLayer.showTipsBox("获取玩家uid失败，请重启");
                    return;
                }

                var playerInfo = {
                    playerId: data.playerId,
                    name: name,
                    kindId: kindId,
                    level: 1
                };
                self.loginPlayer(playerInfo);
            });
        }
    }

});

var clientManager=new cb.ClientManager();



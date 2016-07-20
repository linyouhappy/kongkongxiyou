
var LoginLayer = cc.Layer.extend({
    _ccsNode:null,
    ctor:function () {
        this._super();
        this.createCCSNode("uiccs/LoginLayer.csb");
        var ccsNode=this._ccsNode;

        this._nameTextField=ccsNode.getChildByName("_nameTextField");
        this._psTextField=ccsNode.getChildByName("_psTextField");
        this._ipTextField=ccsNode.getChildByName("_ipTextField");

        function restoreData(key,defaultValue,textField){
            var userName =sys.localStorage.getItem(key);
            if(!!userName && userName.length>0)
            {
                textField.setString(userName);
            }
            else
            {
                sys.localStorage.setItem(key,defaultValue);
                textField.setString(defaultValue);
            }
        }
        restoreData("userName","",this._nameTextField);
        restoreData("password","",this._psTextField);
        restoreData("ip","0.0.0.0",this._ipTextField);

        var _loginButton=ccsNode.getChildByName("_loginButton");
        _loginButton.addTouchEventListener(this.touchEvent,this);
        _loginButton.setPressedActionEnabled(true);

        cc.log("LoginLayer=======>>"+this._nameTextField.getString());
        ///////////////////////////////////////
    },

    createCCSNode:function(ccbFileName){
        var x = cc.winSize.width/2;
        var y = cc.winSize.height/2;
        var ccsNode = ccs.CSLoader.createNode(ccbFileName);
        ccsNode.setPosition(x,y);
        this.addChild(ccsNode);
        this._ccsNode=ccsNode;
    },

    touchEvent: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                this.loginGame();
        }
    },

    loginGame:function(){
        var username=this._nameTextField.getString();
        var password=this._psTextField.getString();

        sys.localStorage.setItem("userName",username);
        sys.localStorage.setItem("password",password);

        var ip=this._ipTextField.getString();
        if (ip!=="0.0.0.0") {
            sys.localStorage.setItem("ip",ip);
            cb.CommonLib.setServerURL(ip);
        }
        
        if (this.callback) {
            this.callback(username,password);
        }
    },

    addEventListener:function(callback){
        this.callback=callback;

        if(cc.sys.os == cc.sys.OS_OSX){
            this.loginGame();
        }
    }
});

var LoginScene = cc.Scene.extend({
    ctor:function () {
        this._super();
        var layer = new LoginLayer();
        this.addChild(layer);
        this.setTag(16881);
        this.layer=layer;
    },

    addEventListener:function(callback){
        this.layer.addEventListener(callback);
    }
});



//SetGameLayer
cb.SetGameLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/SetGameLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="outputItemBtn"){
			}
		}
	},

	updateLayerData: function() {

	}
});

//SetMusicLayer
cb.SetMusicLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/SetMusicLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
		var ccsNode=this._ccsNode;

		var effectCheckBox=ccsNode.getChildByName("effectCheckBox");
		var isEnableEffect=soundManager.isEnableEffectSound();
		effectCheckBox.setSelected(isEnableEffect);

		var bgMusicCheckBox=ccsNode.getChildByName("bgMusicCheckBox");
		var isEnableBg=soundManager.isEnableBgMusic();
		bgMusicCheckBox.setSelected(isEnableBg);

		effectCheckBox.addEventListener(this.selectedStateEvent, this);
		bgMusicCheckBox.addEventListener(this.selectedStateEvent, this);
	},
	selectedStateEvent: function (sender, type) {
		var boxName=sender.getName();
        switch (type) {
            case ccui.CheckBox.EVENT_UNSELECTED:
            	if (boxName==="effectCheckBox") {
            		soundManager.enableEffectSound(false);
            	}else{
            		soundManager.enableBgMusic(false);
            	}
                break;
            case ccui.CheckBox.EVENT_SELECTED:
            	if (boxName==="effectCheckBox") {
            		soundManager.enableEffectSound(true);
            	}else{
            		soundManager.enableBgMusic(true);
            	}
                break;
        }
    },

	updateLayerData: function() {

	}
});

//SetBugLayer
cb.SetBugLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/SetBugLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="outputItemBtn"){
			}
		}
	},

	updateLayerData: function() {

	}
});

//SetAboutLayer
cb.SetAboutLayer = cc.Layer.extend({
	ctor: function() {
		this._super();

		var ccsNode = ccs.CSLoader.createNode("uiccs/SetAboutLayer.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;

		this.__initView();
	},

	__initView:function(){
	},

	touchEvent:function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="outputItemBtn"){
			}
		}
	},

	updateLayerData: function() {

	}
});


//SettingPanel
cb.SettingPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/SettingPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var tabBtnNode = ccsNode.getChildByName("tabBtnNode");

		var tabBtn = null;
		this._tabBtns = [];
		this.tabIndex = null;
		for (var i = 0; i <= 3; i++) {
			tabBtn = tabBtnNode.getChildByTag(i + 10000);
			tabBtn.addTouchEventListener(this.touchEvent, this);
			this._tabBtns[i] = tabBtn;
		}
		this._layers = [];
	},

	setPanelData:function(data){
		this.selectTabBtn(0);
	},

	updatePanelData:function(showIndex){
		if (cc.isNumber(showIndex) && showIndex!==this.tabIndex) {
			return;
		}
		var layer=this._layers[this.tabIndex];
		if (layer) {
			layer.updateLayerData();
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var index = sender.getTag() - 10000;
			this.selectTabBtn(index);
		}
	},

	selectTabBtn: function(index) {
		if (index === null) return;
		if (this.tabIndex === index)
			return;

		if (this.tabIndex !== null)
			this.unselectTabBtn(this.tabIndex);

		this.tabIndex = index;
		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_ORANGEGOLD);
		tabBtn.setHighlighted(true);

		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(true);
		} else {
			if (index === 0) {
				layer = new cb.SetGameLayer();
			} else if (index === 1) {
				layer = new cb.SetMusicLayer();
			} else if (index === 2) {
				layer = new cb.SetBugLayer();
			} else if (index === 3) {
				layer = new cb.SetAboutLayer();
			}
			if (!layer) return;
			this._ccsNode.addChild(layer);
			layer.setPosition(0, -36);
			this._layers[index] = layer;
		}
		this.updatePanelData();
	},

	unselectTabBtn: function(index) {
		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_WHITE);
		tabBtn.setHighlighted(false);
		var layer = this._layers[index];
		if (layer) {
			layer.setVisible(false);
		}
	}
});
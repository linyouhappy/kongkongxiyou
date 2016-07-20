
//FruitSlotPanel
cb.FruitSlotPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/FruitSlotPanel.csb");
		this.__initView();
		this.openBgTouch();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var tileNode, tileData, itembox, itemBox,fruitSlotData;
		this.tileDatas = {};

		var self = this;
		var onItemBoxCallback = function(itemBox) {
			var id = itemBox.getItemId();
			if (id <= 0) return;
			var tileData = self.tileDatas[id];
			if(!tileData) return;

			var worldPoint = itemBox.convertToWorldSpace(cc.p(0, 0));
			var itemDetailLayer = new cb.ItemDetailLayer(tileData)
			itemDetailLayer.setPosition(worldPoint);
		};

		var totalWeight=0;
		for (var i = 1; i <=14; i++) {
			tileNode = ccsNode.getChildByTag(i+10000);
			if (!tileNode) {
				break;
			}

			fruitSlotData=dataApi.fruit_slot.findById(i);
			tileData = {
				id: i,
				type: EntityType.ITEM,
				kindId: fruitSlotData.kindId,
				count: fruitSlotData.count,
				weight: fruitSlotData.weight
			};
			
			totalWeight+=fruitSlotData.weight;

			tileData.selectImage=tileNode.getChildByName("selectImage");
			tileData.selectImage.setVisible(false);

			itembox=tileNode.getChildByName("itembox");

			itemBox = cb.ItemBox.create();
			itemBox.setDefaultSetting();
			itemBox.enableEvent(true);
			itemBox.addEventListener(onItemBoxCallback);
			tileNode.addChild(itemBox);

			itemBox.setPosition(itembox.getPosition());
			
			if (fruitSlotData.level>=4) {
				var selectSprite = new cc.Sprite();
				var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/item_box_effect.plist", "item_box_effect_");
				var animate = cc.Animate.create(clickEfectAnim);
				selectSprite.runAction(cc.RepeatForever.create(animate));
				selectSprite.setPosition(itembox.getPosition());
				tileNode.addChild(selectSprite);
			}
			itembox.removeFromParent();
			
			tileData.itemData=dataApi.item.findById(fruitSlotData.kindId);
			itemBox.setItemId(i);
			itemBox.setIconSprite(formula.skinIdToIconImg(tileData.itemData.skinId));
			itemBox.adjustIconSprite();
			itemBox.setColorSprite("item_color_"+(fruitSlotData.level+1)+".png");
			itemBox.setRightDownLabelString("x"+fruitSlotData.count);
			// itemBox.setRightDownLabelString("x"+i);

			tileData.itemBox=itemBox;

			this.tileDatas[i]=tileData;
		}
		this.totalWeight=totalWeight;
	
		var fiveBtn=ccsNode.getChildByName("fiveBtn");
		var oneBtn=ccsNode.getChildByName("oneBtn");
		fiveBtn.addTouchEventListener(this.touchEvent, this);
		oneBtn.addTouchEventListener(this.touchEvent, this);
		
		var fiveText=ccsNode.getChildByName("fiveText");
		var oneText=ccsNode.getChildByName("oneText");
		oneText.setString("10/次");
		fiveText.setString("50/次");
		this.oneText=oneText;
		this.fiveText=fiveText;

		this.crystalText=ccsNode.getChildByName("crystalText");

		this.tileDataTrain = [];
		this.tileDataTrain.push(this.nextTileData(0));
		this.schedule(this.onTick, 0.3);
	},

	onTick:function(){
		// soundManager.playEffectSound("sound/ui/fruit_slot_run.mp3");
		this.runTrain();
	},

	closePanel:function(){
		this.unscheduleAllCallbacks();
		quickLogManager.setEnableLog(true);
		layerManager.closePanel(this);
	},

	resetTiles: function() {
		this.unscheduleAllCallbacks();
		for (var i = 1; i <= 14; i++) {
			tileData = this.tileDatas[i];
			tileData.selectImage.setVisible(true);
			// tileData.isSelect = false;
			tileData.isTarget = false;
		}
	},

	// singleLottery:function(){
	// 	this.resetTiles();
	// 	quickLogManager.setEnableLog(false);
	// 	shopHandler.lottery(1);
	// },

	lottery:function(times){
		var costCrystal=times*10;
		var curPlayer = app.getCurPlayer();
		// this.crystalText.setString(curPlayer.crystal);
		this.updatePanelData();
		if (curPlayer.crystal<costCrystal) {
			// this.crystalText.runAction(cc.Blink.create(2,8));
			tipsBoxLayer.showTipsBox("粉钻不足，是否购买？");
			tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
				if (isYesOrNo) {
					layerManager.openPanel(cb.kMVipPanelId,3);
				}
			});
			return;
		}

		this.resetTiles();
		quickLogManager.setEnableLog(false);
		shopHandler.lottery(times);
	},

	startTrain:function(targetIdsTrain){
		this.updatePanelData();

		this.tileDataTrain = [];
		this.tileDataTrain.push(this.nextTileData(0));

		this.schedule(this.onStartTick, 0.1);
		this.targetTileDatas=[];
		this.counterIndex=57;
		this.targetIdTrain = targetIdsTrain;
		this.soundHandle=soundManager.playEffectSound("sound/ui/fruit_slot.mp3");
	},

	nextTileData:function(id){
		while (true) {
			id++;
			if (id > 14) id = 1;

			if (!this.tileDatas[id].isTarget) {
				return this.tileDatas[id];
			}
		}
	},

	runTrain:function(){
		var tileData;
		for (var key in this.tileDataTrain) {
			tileData=this.tileDataTrain[key];
			if (!tileData.isTarget) {
				tileData.selectImage.setVisible(false);
			}
			tileData = this.nextTileData(tileData.id);
			tileData.selectImage.setVisible(true);
			this.tileDataTrain[key]=tileData;
		}
	},

	onStartTick:function(){
		this.runTrain();
		this.counterIndex--;
		if (this.counterIndex<50) {
			this.unschedule(this.onStartTick);
			this.schedule(this.onQuickTick, 0.02);
			quickLogManager.setEnableLog(true);
			// soundManager.playEffectSound("sound/ui/fruit_slot.mp3");
		}
	},

	onQuickTick:function(){
		this.runTrain();
		this.counterIndex--;
		if (this.counterIndex<7) {
			this.unschedule(this.onQuickTick);
			this.schedule(this.onTargetTick, 0.15);
		}
	},

	onTargetTick:function(){
		this.runTrain();
		this.counterIndex--;
		if (this.counterIndex<0) {
			var tileData=this.tileDataTrain[0];
			var targetId=this.targetIdTrain[0];
			if (tileData.id===targetId) {
				for (var key in this.tileDataTrain) {
					tileData=this.tileDataTrain[key];
					tileData.isTarget=true;
					tileData.selectImage.setVisible(true);
					this.targetTileDatas.push(tileData);
				}
				this.unschedule(this.onTargetTick);
				this.targetIdTrain.shift();
				if (this.soundHandle) {
					soundManager.stopEffectSound(this.soundHandle);
					this.soundHandle=null;
				}
				soundManager.playEffectSound("sound/ui/fruit_slot_end.mp3");
				if (this.targetIdTrain.length>0) {
					this.counterIndex=50;
					this.schedule(this.onQuickTick, 0.03);
					this.soundHandle=soundManager.playEffectSound("sound/ui/fruit_slot.mp3");
				}else{
					for (var i = 0; i < this.targetTileDatas.length; i++) {
						tileData=this.targetTileDatas[i];
						var position = tileData.itemBox.convertToWorldSpace(cc.p(0,0));
						mainPanel.pushItem(tileData.itemData.skinId,position);
					}
				}
			}
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			if (sender.getName()==="fiveBtn") {
				this.lottery(5);
			}else{
				this.lottery(1);
			}
		}
	},

	setPanelData:function(data){
		this.updatePanelData();
	},

	updatePanelData:function(){
		var curPlayer = app.getCurPlayer();
		this.crystalText.setString(curPlayer.crystal);
		if (curPlayer.crystal<10) {
			this.oneText.setTextColor(consts.COLOR_PURE_RED);
		}else{
			this.oneText.setTextColor(consts.COLOR_WHITE);
		}
		if (curPlayer.crystal<50) {
			this.fiveText.setTextColor(consts.COLOR_PURE_RED);
		}else{
			this.fiveText.setTextColor(consts.COLOR_WHITE);
		}
	}
});


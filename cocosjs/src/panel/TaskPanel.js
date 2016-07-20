
//TaskPanel
cb.TaskPanel = cb.BasePanelLayer.extend({
	ctor: function() {
		this._super();
		this.csbFileName="uiccs/TaskPanel.csb";
        this.setInitData();
        this.enableBg();
        this.initView();
        this.openBgTouch();
        var curPlayer = app.getCurPlayer();
        curPlayer.enableAI(false);
        if (curPlayer._curActionType !== Entity.kMActionIdle) {
        	curPlayer.stopMove();
        }
	},

	initView:function(){
		var ccsNode=this.ccsNode;
		this.descText=ccsNode.getChildByName("descText");
		// this.experienceText=ccsNode.getChildByName("experienceText");
		// this.caoCoinText=ccsNode.getChildByName("caoCoinText");
		this.stateText=ccsNode.getChildByName("stateText");
		this.titleText=ccsNode.getChildByName("titleText");

		var certainBtn=ccsNode.getChildByName("certainBtn");
		certainBtn.addTouchEventListener(this.touchEvent, this);
		this.certainBtn=certainBtn;

		this.descText.setContentSize(cc.size(506, 80));

		var container = ccsNode.getChildByName("container");
		var contentSize = container.getContentSize();

		var itemBoxLayer = cb.ItemBoxLayer.create();
		itemBoxLayer.setLimitColumn(3);
		itemBoxLayer.setLimitRow(1);
		itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(95, 88));
		itemBoxLayer.enableEvent(true);
		itemBoxLayer.setScrollType(2);
		itemBoxLayer.setPosition(0,5);
		itemBoxLayer.setKeepSelectEffect(false);
		container.addChild(itemBoxLayer);

		var self = this;
		var onItemBoxLayerCallback = function(position, itemBox) {
			var item=self.items[position-1];
			if (!item) {
				return;
			}
			var worldPoint=itemBox.convertToWorldSpace(cc.p(0,0));
			var itemDetailLayer = new cb.ItemDetailLayer(item)
			itemDetailLayer.setPosition(worldPoint);
		};
		itemBoxLayer.addEventListener(onItemBoxLayerCallback);
		this.itemBoxLayer = itemBoxLayer;

		this.touchEffect();
	},

	touchEffect:function(){
        var container=cc.Node.create();

        var touchSprite = new cc.Sprite("update/gesture_touch.png");
        container.addChild(touchSprite);
        var handSprite = new cc.Sprite("update/gesture_hand.png");
        container.addChild(handSprite);
        touchSprite.setPosition(-20, 20);

        var interval = 0.2;
        var interval2 = 0.4;
        var sequence = cc.Sequence.create(cc.MoveTo.create(interval, cc.p(0, 0)), cc.MoveTo.create(interval2, cc.p(15, -15)));
        handSprite.runAction(cc.RepeatForever.create(sequence));

        sequence = cc.Sequence.create(
            cc.ScaleTo.create(interval, 0.01),
            cc.ScaleTo.create(interval2, 1.1),
            cc.ScaleTo.create(0, 0.01)
        );
        touchSprite.runAction(cc.RepeatForever.create(sequence));
        container.setPosition(250,-200);
        this.ccsNode.addChild(container);
    },

	closePanel: function() {
		var self = this;
		var onActionCallback = function(sender) {
			layerManager.clearPanel(self);
		};
		var sequence = cc.Sequence.create(
			cc.ScaleTo.create(0.3, 1.2),
			cc.ScaleTo.create(0.1, 0.1),
			cc.CallFunc.create(onActionCallback)
		);
		this.ccsNode.runAction(sequence);
	},

	setPanelData: function(task) {

		var configData=task.configData;
		this.descText.setString(configData.desc);
		// this.experienceText.setString(configData.exp);
		// this.caoCoinText.setString(configData.money);
		this.stateText.setString(task.stateText);
		this.titleText.setString(configData.name);

		var taskItems = configData.item;

		var items = [];
		this.items=items;
		if (taskItems) {
			if (cc.isString(taskItems)) {
				taskItems = JSON.parse(taskItems);
				configData.item = taskItems;

				if (configData.exp) {
					taskItems.push([8031, 5, configData.exp]);
				}
				if (configData.money) {
					taskItems.push([8011, 5, configData.money]);
				}
			}

			this.itemBoxLayer.setItemCount(taskItems.length);
			var taskItem, itemData, item;
			for (var i = 0; i < taskItems.length; i++) {
				taskItem = taskItems[i];
				item=formula.kindIdToItem(taskItem[0])
				if (item.type === EntityType.EQUIPMENT) {
					item.count=1;
				} else {
					item.count = taskItem[2];
				}
				items.push(item);
			}

			var itemBox, item, imgPath;
			for (var i = 0; i < items.length; i++) {
				item = items[i];

				itemBox = this.itemBoxLayer.getItemBoxByPosition(i + 1);
				if (!itemBox)
					continue;
				if (item.itemData) {
					imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
					itemBox.setIconSprite(imgPath);
					itemBox.adjustIconSprite();
				}
				if (item.type !== EntityType.EQUIPMENT) {
					itemBox.setRightDownLabelString(formula.bigNumber2Text(item.count));
				}else{
//					itemBox.showJobId(item.jobId);
				}
			}
		}
		this.task = task;

		if (task.taskState === TaskState.NOT_DELIVERY) {
			this.certainBtn.setTitleText("完成任务");
		}else if(task.taskState===TaskState.NOT_START){
			this.certainBtn.setTitleText("接受任务");
		} else {
			this.certainBtn.setTitleText("继续任务");
		}
	},

	updatePanelData:function(){
    },

    touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			cc.log("this.task.taskState="+this.task.taskState);
			if (this.task.taskState===TaskState.NOT_DELIVERY) {
				taskManager.completeTask();
				soundManager.playEffectSound("sound/ui/task_ok.mp3");
			}else{
				taskManager.setCurTask(this.task);
				taskManager.doTask();
				// soundManager.playEffectSound("sound/ui/task_get.mp3");
			}
			this.closePanel();
		}
	}
});


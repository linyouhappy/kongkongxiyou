cb.MyBossPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/MyBossPanel.csb");
		this.openBgTouch();

		this.__initView();
		bossHandler.getMyBoss();
	},

	__initView: function() {
		var ccsNode = this._ccsNode;
		var myBossNode=ccsNode.getChildByName("myBossNode");
		var contaner = myBossNode.getChildByName("contaner");
		var tableView = new cc.TableView(this, contaner.getContentSize());
		tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		tableView.setPosition(contaner.getPosition());
		tableView.setDelegate(this);
		tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
		myBossNode.addChild(tableView);

		contaner.removeFromParent();
		this.tableView = tableView;
	},

	updateLayerData: function(data) {
		var tableData;
		for (var i = 0; i < this.tableDatas.length; i++) {
			tableData=this.tableDatas[i];
			tableData.count=data["times"+(i+1)];
		}
		this.tableView.reloadData();
	},

	setPanelData:function(){
		var myBossDatas=dataApi.myboss.all();
		var myBossData;
		this.tableDatas=[];
		for (var key in myBossDatas) {
			myBossData=myBossDatas[key];

			this.tableDatas.push({
				// count:2,
				myBossData:myBossData
			});
		}
	},

	tableCellTouched: function(table, cell) {
	},

	tableCellHighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(true);
	},

	tableCellUnhighlight: function(table, cell) {
		var ccsNode = cell.getChildByTag(123);
		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);
	},

	tableCellSizeForIndex: function(table, idx) {
		return cc.size(780, 70);
	},

	touchEvent: function (sender, type) {
        if(type===ccui.Widget.TOUCH_ENDED){
        	sender.setEnabled(false);
        	var idx=sender.getTag();
        	var tableData = this.tableDatas[idx];
        	var myBossData=tableData.myBossData;
        	bossHandler.inMyBoss(myBossData.areaId);
        }
    },

	tableCellAtIndex: function(table, idx) {
		var cell = table.dequeueCell();
		var ccsNode,tradeBtn;
		if (!cell) {
			cell = new cc.TableViewCell();
			ccsNode = ccs.CSLoader.createNode("uiccs/MyBossItem.csb");
			ccsNode.setTag(123);
			cell.addChild(ccsNode);

			tradeBtn = ccsNode.getChildByName("itemBtn");
			tradeBtn.addTouchEventListener(this.touchEvent, this);
			tradeBtn.setTag(idx);
		} else {
			ccsNode = cell.getChildByTag(123);
			tradeBtn = ccsNode.getChildByName("itemBtn");
		}

		var selectImage = ccsNode.getChildByName("selectImage");
		selectImage.setVisible(false);
		var tableData = this.tableDatas[idx];

		var text1 = ccsNode.getChildByName("text1");
		var text2 = ccsNode.getChildByName("text2");
		var text3 = ccsNode.getChildByName("text3");
		var text4 = ccsNode.getChildByName("text4");
		var text5 = ccsNode.getChildByName("text5");
		var text6 = ccsNode.getChildByName("text6");

		var myBossData=tableData.myBossData;
		text1.setString(myBossData.id);

		var entityData = dataApi.character.findById(myBossData.bossId);
		text2.setString(entityData.name);
		text3.setString(myBossData.bossLevel);

		var areaData = dataApi.area.findById(myBossData.areaId);
		text4.setString(areaData.areaName);

		text5.setString(myBossData.needLevel);
		text6.setString(tableData.count+"次");
		if (tableData.count) {
			if (!tradeBtn.isEnabled()) {
				tradeBtn.setEnabled(true);
			}
		}else{
			tradeBtn.setEnabled(false);
		}
		return cell;
	},

	numberOfCellsInTableView: function(table) {
		if (!this.tableDatas) {
			return 0;
		}
		return this.tableDatas.length;
	}

});




cb.MapPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/MapPanel.csb");
		this.openBgTouch();
	},

	updatePlayer:function(curPlayer){
		var x=Math.floor(curPlayer.x);
		var y=Math.floor(curPlayer.y);
		var posText="("+x+","+y+")";
		this.positionText.setString(posText);

		x=Math.floor(x/this.mapWidth*this.miniMapWidth);
		y=Math.floor(y/this.mapHeight*this.miniMapHeight);

		this.playerPoint.setPosition(x,y);

		var direction=(curPlayer.getDirectionId()-1)*45;
		this.playerPoint.setRotation(direction);
	},

	stopPlayer:function(curPlayer){
		this.updatePlayer(curPlayer);
		this.pathDrawNode.clear();
		this.canMoveMiniMap=false;
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			this.showEntityList(sender.getTag());
		}
	},

	touchEvent1: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var entityData=this.curEntityArray[sender.getTag()];
			if (entityData) {
				this.move2Target(app.curPlayer,entityData.x+20,entityData.y-40);
			}
		}
	},

	createList:function(entityArray,contentHeight){
		var btnScrollView=this.btnScrollView;
		var entityCount=entityArray.length;
		var itemBtn,entityData;
		for (var i=0; i < entityCount; i++) {
			entityData = entityArray[i];
			itemBtn = ccui.Button.create("btn_yellow_long_glass.png",
				"btn_gray_long_glass.png",
				"btn_gray_long_glass.png",
				1);
			itemBtn.setTitleText(entityData.name);
			itemBtn.setTitleFontSize(22);
			btnScrollView.addChild(itemBtn);
			itemBtn.setPosition(95,contentHeight);
			itemBtn.setTag(i);
			contentHeight-=55;
			this.itemBtns.push(itemBtn);

			itemBtn.addTouchEventListener(this.touchEvent1, this);
		}
	},

	showEntityList: function(index) {
		var btn=this.entityBtns[index];
		if (btn) {
			if (!!this.selectIndex) {
				if (this.selectIndex === index) {
					this.selectIndex=0;
					index=0;
					btn.setHighlighted(false);
				} else {
					var oldBtn = this.entityBtns[this.selectIndex];
					if (!!oldBtn) {
						oldBtn.setHighlighted(false);
					}
					this.selectIndex=index;
					btn.setHighlighted(true);
				}
			}else{
				this.selectIndex=index;
				btn.setHighlighted(true);
			}
		}

		var entityType;
		if (index === 1) {
			entityType = "npc";
		} else if (index === 2) {
			entityType = "mob";
		} else if (index === 3){
			entityType = "transport";
		}

		if (this.itemBtns) {
			for (var i = 0; i < this.itemBtns.length; i++) {
				this.itemBtns[i].removeFromParent();
			}
		}
		this.itemBtns=[];

		var entityArray=this.mapEntityData[entityType] || [];
		this.curEntityArray=entityArray;

		var entityCount=entityArray.length;
		var contentHeight=entityCount*55+55*3;
		if (contentHeight<410) {
			contentHeight=410;
		}

		var btnScrollView=this.btnScrollView;
		btnScrollView.setInnerContainerSize(cc.size(190,contentHeight+30));

		this.entityBtns[1].setPosition(95,contentHeight);
		contentHeight-=55;
		
		if (index===1) {
			this.createList(entityArray,contentHeight);
			contentHeight=contentHeight-entityCount*55;
		}
		contentHeight=contentHeight-5;
		this.entityBtns[2].setPosition(95,contentHeight);
		contentHeight-=55;
		if (index===2) {
			this.createList(entityArray,contentHeight);
			contentHeight=contentHeight-entityCount*55;
		}
		contentHeight=contentHeight-5;
		this.entityBtns[3].setPosition(95,contentHeight);
		contentHeight-=55;
		if (index===3) {
			this.createList(entityArray,contentHeight);
			contentHeight=contentHeight-entityCount*55;
		}
	},

	placeEntity:function(){
		var mapScrollView=this.mapScrollView;
		var entityArray,entityData,entitySprite;
		var moveX,moveY,nameLabel;
		if (this.mapEntityData.npc) {
			var entityArray = this.mapEntityData.npc;
			for (var i = 0; i < entityArray.length; i++) {
				entityData = entityArray[i];
				moveX=Math.floor(entityData.x/this.mapWidth*this.miniMapWidth);
				moveY=Math.floor(entityData.y/this.mapHeight*this.miniMapHeight);
				entitySprite=new cc.Sprite("#chat_face_btn.png");
				mapScrollView.addChild(entitySprite);
				entitySprite.setPosition(moveX,moveY);
				entitySprite.setScale(0.6);

				nameLabel = cc.Label.createWithSystemFont(entityData.name, "Arial", 22);
				mapScrollView.addChild(nameLabel);
				nameLabel.setPosition(moveX,moveY+25);
				formula.enableOutline(nameLabel);
				nameLabel.setColor(consts.COLOR_GREEN);
			}
		}
		if (this.mapEntityData.mob) {
			var entityArray = this.mapEntityData.mob;
			for (var i = 0; i < entityArray.length; i++) {
				entityData = entityArray[i];
				moveX=Math.floor(entityData.x/this.mapWidth*this.miniMapWidth);
				moveY=Math.floor(entityData.y/this.mapHeight*this.miniMapHeight);

				nameLabel = cc.Label.createWithSystemFont(entityData.name, "Arial", 22);
				mapScrollView.addChild(nameLabel);
				nameLabel.setPosition(moveX,moveY);
				formula.enableOutline(nameLabel);
				nameLabel.setColor(consts.COLOR_RED);
			}
		}
		if (this.mapEntityData.transport) {
			var entityArray = this.mapEntityData.transport;
			for (var i = 0; i < entityArray.length; i++) {
				entityData = entityArray[i];
				moveX=Math.floor(entityData.x/this.mapWidth*this.miniMapWidth);
				moveY=Math.floor(entityData.y/this.mapHeight*this.miniMapHeight);

				nameLabel = cc.Label.createWithSystemFont(entityData.name, "Arial", 22);
				mapScrollView.addChild(nameLabel);
				nameLabel.setPosition(moveX,moveY);
				formula.enableOutline(nameLabel);
			}
		}
	},

	setPanelData:function(area){
		this.setArea(area);
	},

	setArea:function(area){
		if (!area) return;
		this.area=area;

		var mapNode=this._ccsNode.getChildByName("mapNode");

		this.positionText=mapNode.getChildByName("positionText");
		// formula.enableOutline(this.positionText);
		var mapNameText=mapNode.getChildByName("mapNameText");
		var mapScrollView=mapNode.getChildByName("mapScrollView");
		this.mapScrollView=mapScrollView;

		var btnScrollView=mapNode.getChildByName("btnScrollView");
		this.btnScrollView=btnScrollView;

		mapScrollView.setScrollBarEnabled(false);
		btnScrollView.setScrollBarEnabled(false);

		this.mapEntityData=area.map.mapEntityData;
		this.entityBtns={};
		var btn;
		for (var i = 1001; i <= 1003; i++) {
			btn=btnScrollView.getChildByTag(i);
			btn.setTag(i-1000);
			btn.addTouchEventListener(this.touchEvent, this);
			this.entityBtns[i-1000]=btn;
		}

		this.showEntityList(0);

		var areaData=area.areaData;
		mapNameText.setString(areaData.areaName);

		var miniMapFile="miniMap/"+areaData.resId+".jpg";
		var mapSprite=new cc.Sprite(miniMapFile);
		mapSprite.setAnchorPoint(cc.p(0,0));
		mapScrollView.addChild(mapSprite);

		this.pathDrawNode = new cc.DrawNode();
        mapSprite.addChild(this.pathDrawNode);

		this.playerPoint=new cc.Sprite("#icon_player_point.png");
		mapSprite.addChild(this.playerPoint);

		var mapContentSize=mapSprite.getContentSize();
		mapScrollView.setInnerContainerSize(mapContentSize);
		this.miniMapWidth=mapContentSize.width;
		this.miniMapHeight=mapContentSize.height;

		this.mapWidth=area.map.width;
		this.mapHeight=area.map.height;
		this.placeEntity();
		// this.viewContentSize=mapScrollView.getContentSize();
		// this.mapScrollView=mapScrollView;

		// this.winHalfWidth=this.viewContentSize.width/2;
		// this.winHalfHeight=this.viewContentSize.height/2;

		// this.maxX = this.miniMapWidth - this.viewContentSize.width;
		// this.maxY = this.miniMapHeight - this.viewContentSize.height;


		var self=this;
		mapScrollView.addTouchEventListener(function(scrollView,eventType){
			switch(eventType){
				// case ccui.Widget.TOUCH_BEGAN:
				// 	self.isScrolling=false;
				// break;
				case ccui.Widget.TOUCH_ENDED:
					// if(!self.isScrolling){
						var touchBeganPoint=scrollView.getTouchBeganPosition();
						var touchEndPoint=scrollView.getTouchEndPosition();

						var deltaX=touchEndPoint.x-touchBeganPoint.x;
						var deltaY=touchEndPoint.y-touchBeganPoint.y;
						if (deltaX*deltaX+deltaY*deltaY<400) {
							touchEndPoint = mapSprite.convertToNodeSpace(touchEndPoint);
							var moveX=Math.floor(touchEndPoint.x/self.miniMapWidth*self.mapWidth);
							var moveY=Math.floor(touchEndPoint.y/self.miniMapHeight*self.mapHeight);

							self.move2Target(curPlayer,moveX,moveY);
						}
					// }
					// self.isScrolling=false;
				break;
			}
		});

		var curPlayer=app.curPlayer;
		this.updatePlayer(curPlayer);
	},

	move2Target:function(curPlayer,moveX,moveY){
		curPlayer.enableAI(false);
		var path=curPlayer.moveToTarget(moveX,moveY);
		var pathDrawNode=this.pathDrawNode;
		pathDrawNode.clear();

		var miniPath=[];
		var startPoint,moveX,moveY;
		for (var i = 0; i < path.length; i++) {
			startPoint=path[i];
			moveX=Math.floor(startPoint.x/this.mapWidth*this.miniMapWidth);
			moveY=Math.floor(startPoint.y/this.mapHeight*this.miniMapHeight);
			miniPath[i]=cc.p(moveX,moveY);
		}

		var startPoint,nextPoint;
		var penColor=cc.color(255,0,0,255);
		for (var i = 0; i < miniPath.length-1; i++) {
			startPoint=miniPath[i];
			nextPoint=miniPath[i+1];
			pathDrawNode.drawSegment(startPoint,nextPoint,2,cc.color(255,0,0,255));
		}
	},

	closePanel:function(){
		var miniMapFile="miniMap/"+this.area.areaData.resId+".jpg";
		layerManager.closePanel(this);
		cc.director.getTextureCache().removeTextureForKey(miniMapFile);
	}

});
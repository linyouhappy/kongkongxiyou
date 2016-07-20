cb.App = cc.Class.extend({
	ctor: function() {
		this.uid = 0;

		this.data = {
			entities: {}
		};
		this.areaId =5005;

		this.status = 0;
		this.data.areaId=this.areaId;
		var scene=cc.Scene.create();
    	cc.director.runScene(scene);

    	var self=this;
    	setTimeout(function() {
    		self.reloadApp();
    	},200);
	},

	reloadApp: function() {
		cc.log("reloadApp===========>>this.areaId="+this.areaId);
		this.init(this.data);
	},

	showDecorate: function(scene) {
		var node=cc.Node.create();
		node.setPosition(cc.winSize.width/2, cc.winSize.height/2);
		scene.addChild(node);

		var skinId = 40006;
		var skinIdData = dataApi.skinId.findById(skinId);
		if (skinIdData.isSimple) {
			this.isSimpleSkin = true;
		}

		var entitySprite = cb.EntitySprite.create(skinId);
		node.addChild(entitySprite);
		entitySprite.setPosition(0, skinIdData.offsetY);
		entitySprite.show(skinId, 5, Entity.kMActionIdle, 0.1);

		// if (this.weaponId) {
		// 	entitySprite.setWeaponId(this.weaponId);
		// }

		// if (this.isCurPlayer) {
			entitySprite.setShadowSprite("curplayer_halo.png");
			// entitySprite.enableSkillEffect(true);
		// } else {
			// entitySprite.setShadowSprite("entity_shadow.png");
		// }

	},

	init: function(data) {
		this.area = new Area(data,this.areaId);

		var scene = this.area.scene;
		scene.areaCCSLayer.removeFromParent();
//		scene.smallChatView.removeFromParent();

		cc.log("editor app init========>1");
		var map = this.area.map;

		var mapRootNode = map.node;
		cc.eventManager.removeListeners(mapRootNode);

		this.mapImgNode = map.mapNode;
		this.mapEntityNode = map.entityNode;

		this.scene = scene;
		this.selectEntityData = null;

		// this.showDecorate(scene);

		var self = this;

		var onTouchBegan = function(touch, event) {
			var touchPoint = mapRootNode.convertTouchToNodeSpace(touch);
			touchPoint.x=Math.floor(touchPoint.x);
			touchPoint.y=Math.floor(touchPoint.y);
			cc.log("touchPoint x="+touchPoint.x+",y="+touchPoint.y);
			
			if (self.status === 2) {
				var childRect = {
					x: 0,
					y: 0,
					width: 100,
					height: 150
				};
				var selectEntityData = null;
				self.selectBirthData=null;
				var children = map.entityNode.getChildren();
				for (var i = 0; i < map.entityNode.getChildrenCount(); i++) {
					var childNode = children[i];
					var entityId = childNode.getTag();
					var entityData = self.entities[entityId];
					var childPos = childNode.getPosition();
					if (entityData) {
						childRect.width = entityData.width;
						childRect.height = entityData.height;
						childRect.x = childPos.x - childRect.width / 2;
						childRect.y = childPos.y - childRect.height / 2;
						if (cc.rectContainsPoint(childRect, touchPoint)) {
							selectEntityData = entityData;
							break;
						}
					}else if(entityId===100){
						entityData=self.birthData;
						childRect.width = entityData.width;
						childRect.height = entityData.height;
						childRect.x = childPos.x - childRect.width / 2;
						childRect.y = childPos.y - childRect.height / 2;
						if (cc.rectContainsPoint(childRect, touchPoint)) {
							self.selectBirthData = entityData;
							return true;
						}
					}
				}
				self.setSelectEntityData(selectEntityData);
			}
			return true;
		};

		var onTouchMoved = function(touch, event) {
			var touchPoint = mapRootNode.convertTouchToNodeSpace(touch);
			if (self.status === 2) {
				if (self.selectEntityData){
					var eNode = self.selectEntityData.entity.curNode;
					var nodePosition = eNode.getPosition();
					var delta = touch.getDelta();
					nodePosition.x = nodePosition.x + delta.x;
					nodePosition.y = nodePosition.y + delta.y;

					self.selectEntityData.x = Math.floor(nodePosition.x);
					self.selectEntityData.y = Math.floor(nodePosition.y);
					eNode.setPosition(nodePosition);
					self.showEntityData(self.selectEntityData);
					return;
				}
				if (self.selectBirthData) {
					var nodePosition = self.selectBirthData.colorLayer.getPosition();
					var delta = touch.getDelta();
					nodePosition.x = nodePosition.x + delta.x;
					nodePosition.y = nodePosition.y + delta.y;

					self.selectBirthData.x = Math.floor(nodePosition.x);
					self.selectBirthData.y = Math.floor(nodePosition.y);
					self.selectBirthData.colorLayer.setPosition(nodePosition);

					return;
				}
				map.centerTo(touchPoint.x, touchPoint.y);
			} else if (self.status === 3) {
				var tileX = Math.floor(touchPoint.x / self.tileW);
                var tileY = Math.floor(touchPoint.y / self.tileH);
				if (self.editMode === 1) {
					map.centerTo(touchPoint.x, touchPoint.y);
				} else if (self.editMode === 2) {
					if (self.penSize===2) {
						self.chanageCollisionColor(tileX, tileY, true);
						self.chanageCollisionColor(tileX+1,tileY, true);
						self.chanageCollisionColor(tileX-1,tileY, true);
						self.chanageCollisionColor(tileX, tileY+1, true);
						self.chanageCollisionColor(tileX, tileY-1, true);

						self.chanageCollisionColor(tileX+1,tileY+1, true);
                        self.chanageCollisionColor(tileX-1,tileY-1, true);
                        self.chanageCollisionColor(tileX-1, tileY+1, true);
                        self.chanageCollisionColor(tileX+1, tileY-1, true);
					}else{
						self.chanageCollisionColor(tileX,tileY, true);
					}
				} else if (self.editMode === 3) {
					if (self.penSize===2) {
						self.chanageCollisionColor(tileX, tileY, false);
						self.chanageCollisionColor(tileX+1,tileY, false);
						self.chanageCollisionColor(tileX-1,tileY, false);
						self.chanageCollisionColor(tileX, tileY+1, false);
						self.chanageCollisionColor(tileX, tileY-1, false);

						self.chanageCollisionColor(tileX+1,tileY+1, false);
                        self.chanageCollisionColor(tileX-1,tileY-1, false);
                        self.chanageCollisionColor(tileX-1, tileY+1, false);
                        self.chanageCollisionColor(tileX+1, tileY-1, false);
					}else{
						self.chanageCollisionColor(tileX,tileY, false);
					}
				}

			} else {
				map.centerTo(touchPoint.x, touchPoint.y);
			}
		};

		var onTouchEnded = function(touch, event) {
			var touchPoint = mapRootNode.convertTouchToNodeSpace(touch);
			if (self.status === 2) {
				if (!self.selectEntityData) {
					map.centerTo(touchPoint.x, touchPoint.y);
				}
			} else if (self.status === 3) {
				var tileX = Math.floor(touchPoint.x / self.tileW);
				var tileY = Math.floor(touchPoint.y / self.tileH);
				if (self.editMode === 1) {
					map.centerTo(touchPoint.x, touchPoint.y);
				} else if (self.editMode === 2) {
					if (self.penSize===2) {
						self.chanageCollisionColor(tileX, tileY, true);
						self.chanageCollisionColor(tileX+1,tileY, true);
						self.chanageCollisionColor(tileX-1,tileY, true);
						self.chanageCollisionColor(tileX, tileY+1, true);
						self.chanageCollisionColor(tileX, tileY-1, true);

						self.chanageCollisionColor(tileX+1,tileY+1, true);
                        self.chanageCollisionColor(tileX-1,tileY-1, true);
                        self.chanageCollisionColor(tileX-1, tileY+1, true);
                        self.chanageCollisionColor(tileX+1, tileY-1, true);
					}else{
						self.chanageCollisionColor(tileX,tileY, true);
					}
				} else if (self.editMode === 3) {
					if (self.penSize===2) {
						self.chanageCollisionColor(tileX, tileY, false);
						self.chanageCollisionColor(tileX+1,tileY, false);
						self.chanageCollisionColor(tileX-1,tileY, false);
						self.chanageCollisionColor(tileX, tileY+1, false);
						self.chanageCollisionColor(tileX, tileY-1, false);

						self.chanageCollisionColor(tileX+1,tileY+1, false);
                        self.chanageCollisionColor(tileX-1,tileY-1, false);
                        self.chanageCollisionColor(tileX-1, tileY+1, false);
                        self.chanageCollisionColor(tileX+1, tileY-1, false);
					}else{
						self.chanageCollisionColor(tileX,tileY, false);
					}
				}

			} else {
				map.centerTo(touchPoint.x, touchPoint.y);
			}
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchMoved: onTouchMoved,
			onTouchEnded: onTouchEnded,
		}, mapRootNode);

		this.loadBaseAreaData();
	},

	///////////////////////////////////////////////
	saveMapEntity2File:function(){
		var mapEntityData = config[this.mapEntityName];
		var mapEntityData= JSON.stringify(mapEntityData);

		var curAreaData = dataApi.area.findById(this.areaId);
		var mapEntity = "mapEntity" + curAreaData.pathId;
		var filePath='/Users/linyou/Documents/current/lordofpomelo/game-server/config/map/' + mapEntity + ".json";
		cb.CommonLib.saveFile(filePath,mapEntityData,mapEntityData.length);


		mapEntityData="config."+this.mapEntityName+"="+mapEntityData;

		// filePath, const char *fileData,const size_t fileSize
		var curAreaData = dataApi.area.findById(this.areaId);
		var mapEntity = "mapEntity" + curAreaData.pathId;
		var filePath='/Users/linyou/Documents/current/cocosjs/src/config/' + mapEntity + ".js";
		cb.CommonLib.saveFile(filePath,mapEntityData,mapEntityData.length);
	},

	chanageCollisionColor: function(tileX, tileY, isVisible) {
		tileX = Math.max(0, tileX);
		tileX = Math.min(this.rectW - 1, tileX);
		tileY = Math.max(0, tileY);
		tileY = Math.min(this.rectH - 1, tileY);

		var layerColor = this.mapColors[tileX][tileY];
		layerColor.setVisible(!!isVisible);

		if (isVisible) {
			if (this.penColor === 2) {
				layerColor.setColor(cc.color(0, 255, 0, 255));
				layerColor.setTag(2);
			} else {
				layerColor.setColor(cc.color(0, 0, 255, 255));
				layerColor.setTag(1);
			}
		} else {
			layerColor.setTag(0);
		}
	},

	loadCollisionData: function() {

		cc.log("editor app loadCollisionData========>1");

		this.status = 3;

		var collisionNode = ccs.CSLoader.createNode("editor/res/CollisionNode.csb");
		collisionNode.setLocalZOrder(9999);
		collisionNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
		this.scene.addChild(collisionNode);

		cc.log("editor app loadCollisionData========>2");

		this.collisionNode = collisionNode;

		var curAreaData = dataApi.area.findById(this.areaId);
		this.width = curAreaData.width;
		this.height = curAreaData.height;
		this.tileW = curAreaData.tileW || 20;
		this.tileH = curAreaData.tileH || 20;
		this.rectW = Math.ceil(this.width / this.tileW);
		this.rectH = Math.ceil(this.height / this.tileH);

		cc.log("editor app loadCollisionData========>22");

		var mapEntity = "mapEntity" + curAreaData.pathId;
		var configFile='src/config/' + mapEntity + ".js";
		// cc.log("load configFile:"+configFile);
		// require(configFile);
		this.mapEntityName = mapEntity;

		this.mapEntityData = config[mapEntity];
		var mapEntityData = this.mapEntityData;

		cc.log("editor app loadCollisionData========>23");
		mapEntityData = JSON.stringify(mapEntityData)
		mapEntityData = JSON.parse(mapEntityData);

		var collisions = mapEntityData.collisions;
		var marks=mapEntityData.marks;

		cc.log("editor app loadCollisionData========>3");

		var map = [];
		var mapColors = [];
		this.mapColors = mapColors;
		var x, y;
		var layerColor =null;
		for (x = 0; x < this.rectW; x++) {
			map[x] = [];
			mapColors[x] = [];
			for (y = 0; y < this.rectH; y++) {
				map[x][y] = 1;

				var width = this.tileW;
				var height = this.tileH;
				var positionX = x * this.tileW;
				var positionY = y * this.tileH;

				layerColor = cc.LayerColor.create(cc.color(0, 0, 255, 255), width, height);
				layerColor.setPosition(positionX, positionY);
				layerColor.setLocalZOrder(10);
				layerColor.setOpacity(150);
				this.mapEntityNode.addChild(layerColor);

				mapColors[x][y] = layerColor;
				layerColor.setVisible(false);
			}
		}

		for (var x in collisions) {
			var columns = collisions[x];
			for (var i = 0; i < columns.length; i++) {
				var column = columns[i];
				for (var j = 0; j < column[1]; j++) {
					var y = column[0] + j;
					map[x][y] = cc.UINT_MAX;

					layerColor = mapColors[x][y];
					layerColor.setVisible(true);
					layerColor.setColor(cc.color(0, 0,255, 255));
					layerColor.setTag(1);
				};
			};
		}

		for (var x in marks) {
			var columns = marks[x];
			for (var i = 0; i < columns.length; i++) {
				var column = columns[i];
				for (var j = 0; j < column[1]; j++) {
					var y = column[0] + j;
					map[x][y] = cc.UINT_MAX;

					layerColor = mapColors[x][y];
					layerColor.setVisible(true);
					layerColor.setColor(cc.color(0, 255, 0, 255));
					layerColor.setTag(2);
				}
			}
		}


		cc.log("editor app loadCollisionData========>4");

		this.editMode = 2;
		var touchEvent = function(sender, type) {
			if (type === ccui.Widget.TOUCH_ENDED) {
				if (sender.getName() === "scrollBtn") {
					this.editMode = 1;
				} else if (sender.getName() === "showBtn") {
					this.editMode = 2;
				} else if (sender.getName() === "hideBtn") {
					this.editMode = 3;
				} else if (sender.getName() === "saveBtn") {
					this.saveCollision();

				} else if (sender.getName() === "bigBtn") {
					this.penSize = 2;
				} else if (sender.getName() === "smallBtn") {
					this.penSize = 1;
				} else if (sender.getName() === "blueBtn") {
					this.penColor = 1;
				} else if (sender.getName() === "greenBtn") {
					this.penColor =2;
				}
			}
		}
		var scrollBtn = this.collisionNode.getChildByName("scrollBtn");
		scrollBtn.addTouchEventListener(touchEvent, this);

		var showBtn = this.collisionNode.getChildByName("showBtn");
		showBtn.addTouchEventListener(touchEvent, this);
		var hideBtn = this.collisionNode.getChildByName("hideBtn");
		hideBtn.addTouchEventListener(touchEvent, this);

		var saveBtn = this.collisionNode.getChildByName("saveBtn");
		saveBtn.addTouchEventListener(touchEvent, this);

		var bigBtn = this.collisionNode.getChildByName("bigBtn");
		bigBtn.addTouchEventListener(touchEvent, this);
		var smallBtn = this.collisionNode.getChildByName("smallBtn");
		smallBtn.addTouchEventListener(touchEvent, this);

		var blueBtn = this.collisionNode.getChildByName("blueBtn");
		blueBtn.addTouchEventListener(touchEvent, this);
		var greenBtn = this.collisionNode.getChildByName("greenBtn");
		greenBtn.addTouchEventListener(touchEvent, this);


		cc.log("editor app loadCollisionData========>5");
	},

	saveCollision: function() {
		var mapColors = this.mapColors;
		var collisions = {};

		var columns = null;
		var column = null;
		for (var x = 0; x < mapColors.length; x++) {
			var columnMapColors = mapColors[x];
			for (var y = 0; y < columnMapColors.length; y++) {
				var layerColor = columnMapColors[y];
				if (layerColor.isVisible() && layerColor.getTag()===1) {
					if (!columns) {
						columns = [];
					}
					if (!column) {
						column = [y,1];
					} else {
						column[1]++;
					}
				} else {
					if (!!column) {
						columns.push(column);
						column = null;
					}
				}
			}

			if (!!column) {
				columns.push(column);
				column = null;
			}
			if (!!columns) {
				collisions[x] = columns;
				columns = null;
			}
		};


		var marks = {};
		for (var x = 0; x < mapColors.length; x++) {
			var columnMapColors = mapColors[x];
			for (var y = 0; y < columnMapColors.length; y++) {
				var layerColor = columnMapColors[y];
				if (layerColor.isVisible() && layerColor.getTag()===2) {
					if (!columns) {
						columns = [];
					}
					if (!column) {
						column = [y,1];
					} else {
						column[1]++;
					}
				} else {
					if (!!column) {
						columns.push(column);
						column = null;
					}
				}
			}

			if (!!column) {
				columns.push(column);
				column = null;
			}
			if (!!columns) {
				marks[x] = columns;
				columns = null;
			}
		};

		mapEntityData = config[this.mapEntityName];
		mapEntityData.collisions = collisions;
		mapEntityData.marks = marks;

		// cc.log("collisions=" + JSON.stringify(collisions));
		this.saveMapEntity2File();
	},


	////////////////////////////////////////////////
	showEntityData: function(entityData) {
		for (var key in entityData) {
			var value = entityData[key];
			var textField = this.entityNode.getChildByName(key);

			if (textField) {
				textField.setString(value);
				if (entityData.type === EntityType.MOB) {
					textField.setColor(cc.color(255, 255, 255, 255));
				} else {
					textField.setColor(cc.color(255, 0, 0, 255));
				}
			}
		}
	},

	setEntityData: function(entityData) {
		for (var key in entityData) {
			var value = entityData[key];
			var textField = this.entityNode.getChildByName(key);
			if (textField) {
				value = textField.getString();
				if (value) {
					if (Number(value))
						entityData[key] = Number(value);
					else
						entityData[key] = value;
				} else {
					cc.log("key=" + key + " value==null");
				}
			}
		}

		if (entityData.kindId === entityData.entity.kindId) {
			entityData.colorLayer.setContentSize(cc.size(entityData.width, entityData.height));
		} else {
			this.removeEntity(entityData);
			this.createEntity(entityData);
		}

		this.showEntityData(entityData);
	},

	setSelectEntityData: function(entityData) {
		if (entityData) {
			this.selectEntityData = entityData;
			this.showEntityData(entityData);
			this.entityNode.setVisible(true);
		} else {
			this.selectEntityData = null;

			this.entityNode.setVisible(false);
		}
	},

	saveAreaData: function() {
		var mapEntityData = config[this.mapEntityName]

		var entityDataArray = mapEntityData.npc;
		if (entityDataArray) {
			for (var i = 0; i < entityDataArray.length; i++) {
				var tmpEntityData = entityDataArray[i];
				var editEntityData = this.mapEntityDatas[tmpEntityData.id]
				for (var key in tmpEntityData) {
					tmpEntityData[key] = editEntityData[key];
				};
			};

		}

		var entityDataArray = mapEntityData.mob;
		if (entityDataArray) {
			for (var i = 0; i < entityDataArray.length; i++) {
				var tmpEntityData = entityDataArray[i];
				var editEntityData = this.mapEntityDatas[tmpEntityData.id]
				for (var key in tmpEntityData) {
					tmpEntityData[key] = editEntityData[key];
				};
			};
		}

		var entityDataArray = mapEntityData.transport;
		if (entityDataArray) {
			for (var i = 0; i < entityDataArray.length; i++) {
				var tmpEntityData = entityDataArray[i];
				var editEntityData = this.mapEntityDatas[tmpEntityData.id]
				for (var key in tmpEntityData) {
					tmpEntityData[key] = editEntityData[key];
				};
			};
		}

		// var indexId = 1;
		// var entityDataArray = mapEntityData.npc;
		// for (var i = 0; i < entityDataArray.length; i++) {
		// 	var tmpEntityData = entityDataArray[i];
		// 	tmpEntityData.id = indexId++;
		// };

		// var entityDataArray = mapEntityData.mob;
		// for (var i = 0; i < entityDataArray.length; i++) {
		// 	var tmpEntityData = entityDataArray[i];
		// 	tmpEntityData.id = indexId++;
		// };

		for (var key in mapEntityData.birth) {
			mapEntityData.birth[key]=this.birthData[key];
		}

		this.saveMapEntity2File();
	},

	loadAreaData: function() {
		cc.log("loadAreaData=================>>1");
		this.status = 2;

		var entityNode = ccs.CSLoader.createNode("editor/res/EntityNode.csb");
		entityNode.setLocalZOrder(9999);
		entityNode.setPosition(cc.winSize.width / 2+100, cc.winSize.height / 2);
		this.scene.addChild(entityNode);

		cc.log("loadAreaData=================>>2");
		this.entityNode = entityNode;
		this.entityNode.setVisible(false);

		var touchEvent = function(sender, type) {
			if (type === ccui.Widget.TOUCH_ENDED) {
				if (sender.getName() === "refreshButton") {
					if (this.selectEntityData) {
						this.setEntityData(this.selectEntityData);
						var entityDataArray = config[this.mapEntityName][this.selectEntityData.type];
						for (var i = 0; i < entityDataArray.length; i++) {
							var tmpEntityData = entityDataArray[i];
							if (tmpEntityData.id === this.selectEntityData.id) {
								for (var key in tmpEntityData) {
									tmpEntityData[key] = this.selectEntityData[key];
								};
								break;
							}
						};

						cc.log("entityDataArray:" + JSON.stringify(entityDataArray));
					}

				} else if (sender.getName() === "saveButton") {
					this.saveAreaData();
				} else if (sender.getName() === "createButton") {
					
				}
			}
		}
		
		var refreshButton = this.entityNode.getChildByName("refreshButton");
		refreshButton.addTouchEventListener(touchEvent, this);

		var saveButton = this.entityNode.getChildByName("saveButton");
		saveButton.addTouchEventListener(touchEvent, this);

//		var createButton = this.entityNode.getChildByName("createButton");
//		createButton.addTouchEventListener(touchEvent, this);
		

		var curAreaData = dataApi.area.findById(this.areaId);
		var mapEntity = "mapEntity" + curAreaData.pathId;

		// cc.log("loadAreaData=================>>33");
		// require('src/config/' + mapEntity + ".js");
		// cc.log("loadAreaData=================>>44");
		this.mapEntityName = mapEntity;
		this.mapEntityData = config[mapEntity];
		var mapEntityData = this.mapEntityData;

		mapEntityData = JSON.stringify(mapEntityData)
		mapEntityData = JSON.parse(mapEntityData);

		cc.log("loadAreaData=================>>5");
		this.entities = {};
		this.mapEntityDatas={};

		var entityStartId = 100;

		//player birth point 
		var birth = mapEntityData.birth;
		var colorLayer = cc.LayerColor.create(cc.color(0, 255, 0, 255), birth.width, birth.height);
		colorLayer.ignoreAnchorPointForPosition(false);
		colorLayer.setAnchorPoint(cc.p(0.5, 0.5));
		colorLayer.setPosition(birth.x, birth.y);
		colorLayer.setOpacity(100);
		birth.colorLayer = colorLayer;
		var entityId = entityStartId++;
		colorLayer.setTag(entityId);
		birth.type = "birth";
		this.mapEntityNode.addChild(colorLayer);
		this.birthData=birth;

	if(mapEntityData.npc){
		//npc
		for (var i = 0; i < mapEntityData.npc.length; i++) {
			var npcData = mapEntityData.npc[i];
			npcData.entityId = entityStartId++;
			npcData.kindId = npcData.kindId;
			npcData.type = EntityType.NPC;

			var npc = dataApi.npc.findById(npcData.kindId);
			npcData.name=npc.name;

			this.createEntity(npcData);

			this.entities[npcData.entityId] = npcData;
			this.mapEntityDatas[npcData.id]=npcData;
		};
	}

	if(mapEntityData.mob){
		//mob
		for (var i = 0; i < mapEntityData.mob.length; i++) {
			var mobData = mapEntityData.mob[i];
			mobData.entityId = entityStartId++;
			mobData.kindId = mobData.kindId;


			if (!mobData.level) {
				mobData.type = EntityType.ITEM;
				var item = dataApi.item.findById(mobData.kindId);
				mobData.name=item.name;
			}else{
				mobData.type = EntityType.MOB;
				var character = dataApi.character.findById(mobData.kindId);
				mobData.name=character.name;
			}

			this.createEntity(mobData);

			this.entities[mobData.entityId] = mobData;
			this.mapEntityDatas[mobData.id]=mobData;
		};
	}

	if(mapEntityData.transport){
		//transport
		for (var i = 0; i < mapEntityData.transport.length; i++) {
			var transportData = mapEntityData.transport[i];
			transportData.entityId = entityStartId++;
			transportData.kindId = transportData.kindId;
			transportData.type = EntityType.TRANSPORT;

			this.createEntity(transportData);

			this.entities[transportData.entityId] = transportData;
			this.mapEntityDatas[transportData.id]=transportData;
		};
	}
	},

	createEntity: function(entityData) {
		if(!this.area){
			return;
		}
		// var logString="";
		// for (var key in entityData) {
		// 	logString=logString+key+"===>";
		// }
		// cc.log("createEntity entityData="+logString);
		var entity = this.area.createEntity(entityData);
		if(!entity){
            return;
        }
		entityData.name = entity.name;

		var eNode = entity.curNode;
		eNode.setTag(entityData.entityId);
		entityData.entity = entity;

		this.mapEntityNode.addChild(eNode);

		var colorLayer = cc.LayerColor.create(cc.color(255, 0, 0, 255), entityData.width, entityData.height);
		colorLayer.ignoreAnchorPointForPosition(false);
		colorLayer.setAnchorPoint(cc.p(0.5, 0.5));
		colorLayer.setOpacity(150);
		colorLayer.setTag(168);
		eNode.addChild(colorLayer);
		entityData.colorLayer = colorLayer;
	},

	removeEntity: function(entityData) {
		entityData.entity.curNode.removeFromParent();
	},

	////////////////////////////////////////////////////////////////
	loadBaseAreaData: function() {
		this.status = 1;
		var areaNode = ccs.CSLoader.createNode("editor/res/AreaNode.csb");
		areaNode.setLocalZOrder(9999);
		areaNode.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
		this.scene.addChild(areaNode);

		this.areaNode = areaNode;

		var curAreaData = dataApi.area.findById(this.areaId);
		for (var key in curAreaData) {
			var value = curAreaData[key];
			var textField = this.areaNode.getChildByName(key);
			if (textField)
				textField.setString(value);
		}

		var touchEvent = function(sender, type) {
			if (type === ccui.Widget.TOUCH_ENDED) {
				if (sender.getName() === "refreshButton") {
					this.setBaseAreaData();
				} else if (sender.getName() === "entityButton") {
					this.areaNode.removeFromParent();
					this.loadAreaData();
				} else if (sender.getName() === "collisionButton") {
					this.areaNode.removeFromParent();
					this.loadCollisionData();
				}
			}
		}

		var refreshButton = this.areaNode.getChildByName("refreshButton");
		refreshButton.addTouchEventListener(touchEvent, this);

		var entityButton = this.areaNode.getChildByName("entityButton");
		entityButton.addTouchEventListener(touchEvent, this);

		var collisionButton = this.areaNode.getChildByName("collisionButton");
		collisionButton.addTouchEventListener(touchEvent, this);
	},

	setBaseAreaData: function() {
		var curAreaData = dataApi.area.findById(this.areaId);
		for (var key in curAreaData) {
			var value = curAreaData[key];
			var textField = this.areaNode.getChildByName(key);
			if (textField) {
				value = textField.getString();
				if (value) {
					if (Number(value))
						curAreaData[key] = Number(value);
					else
						curAreaData[key] = value;
				} else {
					cc.log("key=" + key + " value==null");
				}
			}
		}

		curAreaData.width=mapManager.getMapWidth();
		curAreaData.height=mapManager.getMapHeight();
		var textField = this.areaNode.getChildByName("width");
		if (textField) {
			textField.setString(curAreaData.width);
		}
		var textField = this.areaNode.getChildByName("height");
		if (textField) {
			textField.setString(curAreaData.height);
		}

		this.reloadApp();
	},

	saveData: function() {
		var areas = dataApi.area.all();

		var keyToPos = null;
		var posToKey = null;
		var index = 0;
		var collectData = [];
		var keyNames = [];

		for (var key in areas) {
			var id = key;
			var area = areas[key];
			var oneRowData = [];
			if (!keyToPos) {
				keyToPos = [];
				posToKey = [];

				index = 0;
				for (var keyName in area) {
					keyToPos[keyName] = index;
					posToKey[index] = keyName;
					keyNames.push(keyName);
					index++;
				};
				collectData.push(keyNames);
			}

			for (var i = 0; i < posToKey.length; i++) {
				var keyName = posToKey[i];
				var value = area[keyName];

				oneRowData.push(value);
			};

			collectData.push(oneRowData);
		};

		cc.log("result:" + JSON.stringify(collectData));
	}

});

if (!app)
	app = new cb.App();
cc.log("congratulation=====>>");
cb.RolePanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/RolePanel.csb");
		this.__initRoleView();
		this.__initRoleInfoView();

		this.openBgTouch();
	},

	__initRoleInfoView: function() {
		var ccsNode = this._ccsNode;
		var roleInfoNode = ccsNode.getChildByName("roleInfoNode");

		this.userNameText = roleInfoNode.getChildByName("userNameText");
		this.caoCoinText = roleInfoNode.getChildByName("caoCoinText");
		// this.goldCoinText = roleInfoNode.getChildByName("goldCoinText");
		this.levelText = roleInfoNode.getChildByName("levelText");
		this.factionText = roleInfoNode.getChildByName("factionText");

		this.attackText = roleInfoNode.getChildByName("attackText");
		this.defendText = roleInfoNode.getChildByName("defendText");
		this.hitText = roleInfoNode.getChildByName("hitText");
		this.dodgeText = roleInfoNode.getChildByName("dodgeText");
		this.critText = roleInfoNode.getChildByName("critText");
		this.critResText = roleInfoNode.getChildByName("critResText");
//		this.wreckText = roleInfoNode.getChildByName("wreckText");
		this.mpText=roleInfoNode.getChildByName("mpText");
		this.hpText = roleInfoNode.getChildByName("hpText");

		this.experienceBar = roleInfoNode.getChildByName("experienceBar");

		// this.mpText = roleInfoNode.getChildByName("mpText");

		// this.critText = roleInfoNode.getChildByName("critText");
		// this.critresText = roleInfoNode.getChildByName("critresText");
		// this.damageText = roleInfoNode.getChildByName("damageText");
		// this.reduceText = roleInfoNode.getChildByName("reduceText");
	},

	__initRoleView: function() {
		var ccsNode = this._ccsNode;
		var roleNode = ccsNode.getChildByName("roleNode");

		var child, itemBox;
		this.itemBoxs = {};

		var self = this;
		var onItemBoxCallback = function(itemBox) {
			var itemId = itemBox.getItemId();
			// cc.log("itemId="+itemId);
			if (itemId <= 0) return;
			var itemData = self.itemDatas[itemId];
			if(!itemData) return;

			var worldPoint = itemBox.convertToWorldSpace(cc.p(0, 0));
			var itemDetailLayer = new cb.ItemDetailLayer(itemData)
			itemDetailLayer.setPosition(worldPoint);
		};

		for (var i = 101; i <= 106; i++) {
			child = roleNode.getChildByTag(i);
			itemBox = cb.ItemBox.create();
			itemBox.setDefaultSetting();
			itemBox.enableEvent(true);

			roleNode.addChild(itemBox);
			itemBox.setPosition(child.getPosition());

			child.removeFromParent();

			this.itemBoxs[i - 100] = itemBox;
			itemBox.addEventListener(onItemBoxCallback);
		};

		this.rolePortrait = roleNode.getChildByName("rolePortrait");
		this.itemDatas = {};
	},

	setPanelData:function(playerId){
		this.setCharacterId(playerId);
	},

	setCharacterId: function(playerId) {
		if (!playerId) return;
		var character = null;
		if (playerId === app.curPlayerId) {
			character = app.getCurPlayer();
			character.equipments=bagManager.getEquipments();
			propertyManager.setTotalAttackAndDefence(character);
		} else {
			var property=propertyManager.getProperty(playerId);
			if (property) {
				this.setCharacter(property);
			} else {
				propertyManager.requestProperty(playerId, function(property) {
					if (layerManager.isRunPanel(cb.kMRolePanelId)) {
						var curPanel = layerManager.curPanel;
						curPanel.setCharacter(property);
						return;
					}
					var layer = layerManager.getRunLayer(cb.kMRolePanelId);
					if (layer) {
						layer.setCharacter(property);
					}
				});
			}
			return;
		}
		this.setCharacter(character);
	},

	setCharacter: function(character) {
		if (!character) return;
		this.character = character;

		if (character.nextLevelExp) {
    		var percent = Math.floor(character.experience * 100 / character.nextLevelExp);
    		this.experienceBar.setPercent(percent);
		}

		this.caoCoinText.setString(formula.bigNumber2Text(character.caoCoin));
//		this.goldCoinText.setString(character.goldCoin);
		this.levelText.setString(character.level);
		this.userNameText.setString(character.name);
		this.hpText.setString(character.maxHp);
		this.mpText.setString(character.maxMp);
		this.setEquipmentsData(character.equipments);

		this.attackText.setString(character.attackValue);
		this.defendText.setString(character.defenceValue);
		this.hitText.setString(character.hitRate);
		this.dodgeText.setString(character.dodgeRate);
		this.critText.setString(character.critValue);
		this.critResText.setString(character.critResValue);
//		this.wreckText.setString(character.wreckValue);

		var portraitName=formula.portraitName(character.kindId);
		this.rolePortrait.setTexture(portraitName);
	},

	setEquipmentsData: function(equipments) {
		if (!equipments) return;
		for (var kind = 1; kind <= 6; kind++) {
			this.equip(kind, equipments[kind]);
		}
	},

	equip: function(kind, equipItem) {
		var itemBox = this.itemBoxs[kind];
		if (!itemBox) return;

		if (equipItem) {
			equipItem.type = EntityType.EQUIPMENT;
			if (!equipItem.itemData) {
				equipItem.itemData = dataApi.equipment.findById(equipItem.kindId);
			}
			if (equipItem.itemData) {
				itemBox.setItemId(equipItem.id);
				imgPath = "icon/item/item_" + equipItem.itemData.skinId + ".png";
				itemBox.setIconSprite(imgPath);
				itemBox.adjustIconSprite();
				// itemBox.setColorSprite("item_color_4.png");
				var itemColorName = "item_color_" + Math.ceil(equipItem.totalStar / 2) + ".png"
				itemBox.setColorSprite(itemColorName);
				this.itemDatas[equipItem.id] = equipItem;
				return;
			}
		}

		itemBox.enableIconSprite(false);
		itemBox.enableColorSprite(false);
		itemBox.setItemId(0);
	}
});


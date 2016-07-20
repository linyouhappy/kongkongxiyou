var Mob = function(opts) {
	this.type = EntityType.MOB;

	if (opts.type !== this.type) {
		cc.error("ERROR:Mob opts.kindId=" + opts.kindId);
	}
	var entityData = dataApi.character.findById(opts.kindId);
	if (!entityData) {
		cc.log("ERROR:entityData==null opts.kindId=" + opts.kindId);
	}
	  // this.level = opts.level || 1;

	this.entityData = entityData;
	// if (opts.level) {
	this.level =opts.level || 1;
	// }else{
	// 	var mobZone = opts.map.getMobZone(opts.kindId);
	// 	if (mobZone) {
	// 		this.level = mobZone.level || 1;
	// 	} else {
	// 		cc.error("ERROR:Mob mobZone=null opts.kindId=" + opts.kindId);
	// 		this.level =1;
	// 	}
	// }
	// this.level =1;
	// var mobZone = opts.map.getMobZone(opts.kindId);
	// if (mobZone) {
	// 	this.level = mobZone.level || 1;
	// } else {
	// 	cc.error("ERROR:Mob mobZone=null opts.kindId=" + opts.kindId);
	// }
	// opts.maxHp = formula.calMobValue(entityData.hp, this.level, entityData.upgradeParam);
	var ratio = this.level * entityData.upgradeParam + 1;
	this.maxHp = Math.floor(ratio * entityData.hp);
	this.hp = opts.hp || 0;

	this.skinId = entityData.skinId || 10001;

	this.width = 90;
	this.height = 90;
	this.offsetX = -this.width / 2;
	this.offsetY = -this.height / 2;

	Character.call(this, opts);

	this.initNameLabel();
};
Mob.wordTime=0;
Mob.prototype = Object.create(Character.prototype);

Mob.prototype.setDied = function() {
	if (this.died) return;

	this.died = true;
	var self = this;
	var entityId=this.entityId;
	var onActionCallback = function(sender) {
		app.getCurArea().removeEntity(entityId);
	};
	if (this.shadowSprite) {
		this.shadowSprite.removeFromParent();
		this.shadowSprite=null;
	}
	
	var onActionCallback1 = function(sender) {
		var entity=app.getCurArea().getEntity(entityId);
		if (!entity) {
			return;
		}
		entity.setHp(0);
		entity.deadAction();
		var curNode = entity.curNode;
		var childrenCount = curNode.getChildrenCount();
		var children = curNode.getChildren();
		var childNode;
		for (var i = 0; i < childrenCount; i++) {
			childNode = children[i];
			if (childNode !== self._entitySprite) {
				curNode.removeChild(childNode);
			}
		}
		var entitySprite=entity._entitySprite.getContentSprite();
		var sequence = cc.Sequence.create(
			// cc.DelayTime.create(1),
			// cc.CallFunc.create(onActionCallback1)
			cc.FadeOut.create(2),
			cc.CallFunc.create(onActionCallback)
		);
		entitySprite.runAction(cc.FadeOut.create(2));
		var sequence = cc.Sequence.create(
			cc.MoveBy.create(2.5,cc.p(0,1000)),
			cc.CallFunc.create(onActionCallback)
		);
		curNode.runAction(sequence);
	};

	var sequence = cc.Sequence.create(
		cc.DelayTime.create(1),
		cc.CallFunc.create(onActionCallback1)
	);
	this.curNode.runAction(sequence);
	if (this.isSelected) {
		this.removeSelectEffect();
		mainPanel.showCharacter(this, false);
	}
};

Mob.prototype.destory = function() {
  if (this.shadowSprite) {
    this.shadowSprite.removeFromParent();
    this.shadowSprite=null;
  }
  if (this.isSelected) {
    this.removeSelectEffect();
    mainPanel.showCharacter(this, false);
  }
};

Mob.prototype.initEditView = function() {
	var frameSprite = cc.Scale9Sprite.createWithSpriteFrameName("chat_panel_bg.png");
	frameSprite.setContentSize(cc.size(220, 120));
	frameSprite.setOpacity(130);
	frameSprite.setAnchorPoint(cc.p(0.5, 0));
	frameSprite.setPosition(0, this.infoY);
	this.curNode.addChild(frameSprite);
	this.frameSprite = frameSprite;

	var richTextBox = cc.Label.createWithSystemFont("", "Arial", 20, cc.size(200, 0));
	richTextBox.setAnchorPoint(cc.p(0.5, 0));
	richTextBox.setPosition(0, this.infoY+10);
	richTextBox.setColor(chat.colorTbl.yellow);
	this.curNode.addChild(richTextBox);
	this.richTextBox = richTextBox;

	frameSprite.setLocalZOrder(200);
	richTextBox.setLocalZOrder(200);
};

Mob.prototype.showChatInfo = function(message) {
	var richTextBox=this.richTextBox;
	richTextBox.setString(message);

	var richTextSizeHeight = richTextBox.getContentSize().height+20;
	this.frameSprite.setContentSize(cc.size(220, richTextSizeHeight));

	var self=this;
	var onActionCallback1 = function(sender) {
		self.richTextBox.setVisible(false);
		self.frameSprite.setVisible(false);
	};
	sequence = cc.Sequence.create(
		cc.DelayTime.create(10),
		cc.CallFunc.create(onActionCallback1)
	);
	this.frameSprite.runAction(sequence);
};

// setDimensions

Mob.prototype.pushMessage = function(message) {
	if (!this.richTextBox) {
		this.initEditView();
	}else{
		this.richTextBox.setVisible(true);
		this.frameSprite.setVisible(true);
		this.frameSprite.stopAllActions();
	}
	this.showChatInfo(message);
};

Mob.prototype.randomWord=function(){
	if (this.isDoRandmoWord) {
		return;
	}
	this.isDoRandmoWord=true;
	if (Date.now() > Mob.wordTime) {
		Mob.wordTime=Date.now()+5000;
		if (Math.random() < 0.4) {
			var saying = formula.charaterSaying(this.kindId);
			if (saying) {
				this.pushMessage(saying);
			}
		}
	}
};

Mob.prototype.initNameLabel = function() {
  if (this.area && this.name && !this.nameLabel) {
    var nameLabel = cc.Label.createWithSystemFont(this.name+" "+this.level+"级", "Arial", 22);
    formula.enableOutline(nameLabel);
    nameLabel.setPosition(0,20);
    this.infoNode.addChild(nameLabel);
    this.nameLabel = nameLabel;
    var playerLevel=this.area.curPlayer.level;
    if (playerLevel<=this.level-2) {
    	nameLabel.setColor(consts.COLOR_PURE_RED);
    }else if (playerLevel>=this.level+2) {
    	nameLabel.setColor(consts.COLOR_PURE_GREEN);
    }
  }
};
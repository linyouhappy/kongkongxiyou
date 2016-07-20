
var Equipment = function (opts) {
	this.type = EntityType.EQUIPMENT;
	if (opts.type!==this.type) {
		cc.error("ERROR:Equipment opts.kindId="+opts.kindId);
	}

	var entityData = dataApi.equipment.findById(opts.kindId);
  	this.entityData=entityData;
  	this.skinId=entityData.skinId;
  	this.name = entityData.name || "未命名character";

	// this.attackValue = opts.attackValue;
	// this.defenceValue = opts.defenceValue;
	// this.price = opts.price;
	// this.color = opts.color;
	// this.heroLevel = opts.heroLevel;
	this.playerId = opts.playerId;

	this.width = 80;
	this.height = 80;
	this.offsetX = -this.width / 2;
	this.offsetY = -this.height / 2;

	Entity.call(this, opts);
};

Equipment.prototype = Object.create(Entity.prototype);

Equipment.prototype.initDecorate=function(){
  var imgPath = 'icon/item/item_' + this.skinId + '.png';

  var spriteNode = new cc.Sprite(imgPath);
  spriteNode.setAnchorPoint(cc.p(0.5, 0));
  spriteNode.setPosition(cc.p(0, -20));
  this.curNode.addChild(spriteNode);

  this.initNameLabel();
  this.infoNode.setPosition(0,20);
  // if (!!this.nameLabel) {
  //   this.nameLabel.setPosition(0,40);
  // }
};


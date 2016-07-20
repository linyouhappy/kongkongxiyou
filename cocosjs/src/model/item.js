var Item = function(opts) {
  this.type = EntityType.ITEM;

  if (opts.type !== this.type) {
    cc.error("ERROR:Item opts.kindId=" + opts.kindId);
  }

  var entityData = dataApi.item.findById(opts.kindId);
  this.entityData = entityData;
  this.skinId = entityData.skinId;
  this.name = entityData.name || "未命名character";

  // this.hp = opts.hp;
  // this.mp = opts.mp;
  // this.price = opts.price;
  // this.heroLevel = opts.heroLevel;
  this.width = 80;
  this.height = 80;
  this.offsetX=-this.width/2;
  this.offsetY=-this.height/2;

  Entity.call(this, opts);

  this.initNameLabel();
};

Item.prototype = Object.create(Entity.prototype);

Item.prototype.showPickState=function(){
  if (this.isShowPickState) {
    return;
  }
  this.isShowPickState=true;
  this.initMpBar();
  this.mpBar.setPercentage(0);
  // this.infoNode.setVisible(true);
  this.mpBar.setVisible(true);
  this.mpBar.runAction(cc.ProgressTo.create(5,100));
  this.mpBarBack.setVisible(true);
};

Item.prototype.hidePickState=function(){
  if (!this.isShowPickState) {
    return;
  }
  this.isShowPickState=false;
  
  if(this.mpBar){
    this.mpBar.stopAllActions();
    this.mpBar.setVisible(false);
    // this.infoNode.setVisible(false);
    this.mpBarBack.setVisible(false);
  }
};

Item.prototype.initDecorate = function() {
  var imgPath =formula.skinIdToIconImg(this.skinId);
  var spriteNode = new cc.Sprite(imgPath);
  spriteNode.setAnchorPoint(cc.p(0.5, 0));
  spriteNode.setPosition(cc.p(0, -20));
  this.curNode.addChild(spriteNode);

  
  this.infoNode.setPosition(0,30);
  // if (!!this.nameLabel) {
  //   this.nameLabel.setPosition(0, 40);
  // }
};
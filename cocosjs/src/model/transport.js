var Transport = function(opts) {
  this.type = EntityType.TRANSPORT;
  if (opts.type !== this.type) {
    cc.error("ERROR:Transport ========>>");
  }
  // this.areaId=opts.areaId || 1;
  // var entityData = dataApi.transport.findById(opts.kindId) || {};
  // this.entityData = entityData;
  // this.skinId = entityData.skinId;
  // this.skinId =opts.kindId;
  this.skinId = 20002;
  this.targetArea=opts.targetArea;
  this.name = opts.name || "未命名";

  this.width = 80;
  this.height = 100;
  this.offsetX = -this.width / 2;
  this.offsetY =-this.height/2;

  Entity.call(this, opts);
};

Transport.prototype = Object.create(Entity.prototype);

Transport.prototype.initDecorate = function() {
  if (!!this.skinId) {
    var entitySprite = cb.EntitySprite.create(this.skinId);
    this.curNode.addChild(entitySprite);
    entitySprite.singleShow();
    entitySprite.setAnchorPoint(cc.p(0.5, 0.5));
    this._entitySprite = entitySprite;
  }
};
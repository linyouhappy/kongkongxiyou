var Bullet = function(opts) {
	var attacker = opts.attacker;
	var target = opts.target;
	this.bulletId = opts.bulletId;
	this.speed = 800;

	Bullet.bulletUid++;
	this.entityId = Bullet.bulletUid;
	this.curNode = cc.Node.create();

	var entitySprite = cb.EntitySprite.createAnimateSprite(this.bulletId,Entity.kMActionAttack, 0.1, 99999);
	if (entitySprite) {
		this.curNode.addChild(entitySprite);
		entitySprite.setPosition(0, 45);
	}else{
		cc.log("ERROR:Bullet entitySprite===null this.bulletId="+this.bulletId);
	}
	

	this.setPosition(attacker.x, attacker.y);

	var deltaX=target.x-this.x;
	var deltaY=target.y-this.y;
	var distance=Math.sqrt(deltaX*deltaX+deltaY*deltaY);
	this.deltaX=deltaX/distance;
	this.deltaY=deltaY/distance;

	this.targetId=target.entityId;
};

Bullet.prototype.setPosition = function(x, y) {
	this.x = x;
	this.y = y;
	this.curNode.setPosition(x, y);
	this.curNode.setLocalZOrder(-y);
};

Bullet.prototype.onUpdate = function(delta) {
	var target=this.area.getEntity(this.targetId);
	if (!target) {
		this.area.removeBullet(this);
		return;
	}
	if (formula.inRange(this, target, 20)) {
		this.area.removeBullet(this);
	} else {
		var moveDistance=this.speed*delta;
		var moveX=this.deltaX*moveDistance+this.x;
		var moveY=this.deltaY*moveDistance+this.y;

		this.setPosition(moveX,moveY);
	}
};

Bullet.bulletUid = 0;


// Player.prototype = Object.create(Character.prototype);
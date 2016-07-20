
cb.ControlPanel = cc.Class.extend({
	ctor: function(controlNode) {
		controlNode.setPosition(layerPositions.controlPositonS);
		this.controlBg = controlNode.getChildByName("controlBg");
		this.controlRocker = controlNode.getChildByName("controlRocker");

		// var label = cc.Label.createWithSystemFont("", "Arial",26);
  //       label.setPosition(-50,30);
  //       controlNode.addChild(label);
  //       this.debugLabel=label;

		var self = this;
		var onTouchBegan = function(touch, event) {
			var touchPoint = controlNode.convertTouchToNodeSpace(touch);

			var distance = Math.sqrt(touchPoint.x * touchPoint.x + touchPoint.y * touchPoint.y);
			if (distance < 100) {
				self.controlBg.setVisible(false);

				self._isInControl = true;
				self.move(touchPoint, distance);

				self.controlRocker.setPosition(touchPoint);
				return true;
			}
			return false;
		};

		var onTouchMoved = function(touch, event) {
			if (self._isInControl) {
				var touchPoint = controlNode.convertTouchToNodeSpace(touch);
				var distance = Math.sqrt(touchPoint.x * touchPoint.x + touchPoint.y * touchPoint.y);
				if (distance > 225) {
					self._isInControl = false;
					self.controlBg.setVisible(true);
					self.controlRocker.setPosition(cc.p(0, 0));
					return;
				}
				self.move(touchPoint, distance);
				self.controlRocker.setPosition(touchPoint);
			}
		};

		var onTouchEnded = function(touch, event) {
			self.resetControl();
		};

		var onTouchCancelled = function(touch, event) {
			self.resetControl();
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchMoved: onTouchMoved,
			onTouchEnded: onTouchEnded,
			onTouchCancelled: onTouchCancelled
		}, controlNode);
	},

	resetControl:function(){
		this._isInControl = false;
		this.controlBg.setVisible(true);
		this.controlRocker.setPosition(cc.p(0, 0));
		this.stopMove();
	},

	stopMove:function(){
		var curPlayer = app.getCurPlayer();
		curPlayer.clStopMove();
	},

	getNextMovePos: function() {
		var map = app.getCurArea().map;
		var curPlayer = app.getCurPlayer();
		var moveDir=formula.directionToMoveDir(this._directionId);
		if (!moveDir) {
			return;
		}
		// this.debugLabel.setString("d:"+this._directionId+",x:"+moveDir.x+",y:"+moveDir.y);
		var targetX = curPlayer.x + moveDir.x * map.tileW;
		var targetY = curPlayer.y + moveDir.y * map.tileH;
		if (!map.isReachable(targetX, targetY)) {
			return;
		}
		var index = 0;
		var tmpX=targetX;
		var tmpY=targetY;
		while(true){
			tmpX += moveDir.x*map.tileW;
			tmpY += moveDir.y*map.tileH;
			if (index<20 && map.isReachable(tmpX,tmpY)) {
				targetX = tmpX;
				targetY = tmpY;
			} else {
				break;
			}
			index++;
		}
		return {
			x: targetX,
			y: targetY
		};
	},

	move: function(touchPoint, distance) {
		var curPlayer = app.getCurPlayer();
		if (!curPlayer) return;
		if (distance < 10){
			return;
		}
		var directionId = formula.calculateDirection(touchPoint.x, touchPoint.y, distance);
		if (directionId < 1 || directionId>8){
			return;
		}
		if (curPlayer.moving && curPlayer.getDirectionId() === directionId){
			return;
		}
		this._directionId = directionId;
		var movePoint=this.getNextMovePos();
		// this.debugLabel.setString("move d:"+directionId);
		if (movePoint) {
			curPlayer.clMovingTo(movePoint.x,movePoint.y);
		}
	}
});
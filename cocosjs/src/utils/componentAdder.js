var componentAdder = {
	addClickComponent: function(area) {
		var mapNode = area.map.node;
		var onTouchBegan = function(touch, event) {
			return true;
		};

		var onTouchEnded = function(touch, event) {
			var location = touch.getLocation();
			// if((location.x<225 && location.y<225) ||
			// (location.x>cc.winSize.width-280 && location.y<280))
			if (location.x < 225 && location.y < 225)
				return;

			var area = app.getCurArea();
			var mapNode = area.map.node;
			var curPlayer = area.getCurPlayer();

			if(area.scene.showControlPanel())
				return;

			var touchPoint = mapNode.convertTouchToNodeSpace(touch);
			touchPoint.x = Math.floor(touchPoint.x);
			touchPoint.y = Math.floor(touchPoint.y);

			var entityNode = area.map.entityNode;
			var children = entityNode.getChildren();
			var childNode = null;
			var childRect = {
				x: 0,
				y: 0,
				width: 100,
				height: 150
			};

			var childrenCount=entityNode.getChildrenCount();
			var entityId,entity;
			for (var i = 0; i < childrenCount; i++) {
				childNode = children[i];
				entityId = childNode.getTag();
				if (entityId > 0) {
					entity = area.getEntity(entityId);
					if (entity) {
						childRect.width = entity.width;
						childRect.height = entity.height;
						childRect.x = childNode.getPositionX() + entity.offsetX;
						childRect.y = childNode.getPositionY() + entity.offsetY;

						if (cc.rectContainsPoint(childRect, touchPoint)) {
							curPlayer.touchCharacter(entityId);
							return;
						}
					}
				}
			}

			if (!curPlayer) return;
			curPlayer.clMoveToTarget(touchPoint.x, touchPoint.y);
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchEnded: onTouchEnded,
		}, mapNode);
	}

};
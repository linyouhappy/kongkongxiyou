var playerHandler = {
	fightMode: function(fightMode) {
		circleLoadLayer.showCircleLoad();
		pomelo.request('area.playerHandler.fightMode', {
			fightMode: fightMode
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			app.getCurPlayer().setFightMode(data.fightMode);
		});
	},

	revive: function(revive) {
		circleLoadLayer.showCircleLoad();
		pomelo.notify('area.playerHandler.revive', {revive:revive}, function(data) {
			circleLoadLayer.hideCircleLoad();
		});
	},

	useSkillAttack: function(skillId, targetId) {
		// var msg = {
		// 	skillId: skillId,
		// 	targetId: targetId
		// }
		// pomelo.notify('area.fightHandler.useSkillAttack', msg);
		// circleLoadLayer.showCircleLoad();
		pomelo.request('area.fightHandler.useSkillAttack', {
			skillId: skillId,
			targetId: targetId
		}, function(data) {
			// circleLoadLayer.hideCircleLoad();
			var code=data.code;
			if (code !== 200) {
				if (code===153) {
        			var player = app.getCurPlayer();
		            if (targetId !== player.entityId) {
		                app.getCurArea().removeEntity(targetId);
		            }
        		}else if(code===154){
        			var target=app.getCurArea().getEntity(targetId);
        			if (target) {
        				target.setDied();
        			}
        		}else if (code===157) {
        			return;
        		}
				quickLogManager.showErrorCode(code);
			}
		});
	},

	move: function(path) {
		pomelo.notify('area.playerHandler.move', path);
	},

	clMove: function(path) {
		pomelo.notify('area.playerHandler.clMove', path);
	},

	stop: function(x, y) {
		pomelo.notify('area.playerHandler.stop', {
			x: x,
			y: y
		});
	},

	getEntity: function(entityId) {
		pomelo.request('area.playerHandler.getEntity', {
			entityId: entityId
		}, function(data) {
			if (data.entityId) {
				var msg={};
				// var curPlayer=app.getCurPlayer();
				// if (curPlayer.id===data.id) {
				// 	for (var key in data) {
				// 		curPlayer[key]=data[key];
				// 	}
				// }
				if (data.kindId<=10002) {
					msg[EntityType.PLAYER]=[data];
				}else{
					msg[EntityType.MOB]=[data];
				}
				gameMsgHandler.onAddEntities(msg);
			}else{
				quickLogManager.pushLog("entity is no exist",4);
			}
		});
	},

	getProperty: function(playerId, callBack) {
		pomelo.request('area.playerHandler.getProperty', {
			playerId: playerId
		}, function(data) {
			if (data.code === 200) {
				delete data["code"];
				if (callBack) {
					callBack(data);
				}
			} else {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	fixLeaveArea:function(leaveAreaId){
		pomelo.notify('connector.entryHandler.fixLeaveArea', {
			areaId: leaveAreaId
		});
	}

};
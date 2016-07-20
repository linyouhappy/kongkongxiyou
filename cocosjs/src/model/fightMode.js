FightMode[FightMode.JUSTICEMODE]=function(player){
	var players=player.area.playerEntitys;
	var target;
	for (var key in players) {
		target=players[key];
		if (target!==player
			&& !target.died 
			&& target.redPoint>=3) {
			return target;
		}
	}
};

FightMode[FightMode.ALLMODE]=function(player){
	var players=player.area.playerEntitys;
	var nearDistance = 999999;
	var entity,distance, nearTarget, deltaX, deltaY;
	for (var key in players) {
		entity=players[key];
		if (entity!==player && !entity.died) {
			deltaX = entity.x - player.x;
			deltaY = entity.y - player.y;
			distance = deltaX * deltaX + deltaY * deltaY;
			if (distance < nearDistance) {
				nearDistance = distance;
				nearTarget = entity;
			}
		}
	}
	return nearTarget;
};

FightMode[FightMode.TEAMMODE]=function(player){
	var players=player.area.playerEntitys;
	var nearDistance = 999999;
	var entity,distance, nearTarget, deltaX, deltaY;
	for (var key in players) {
		entity=players[key];
		if (entity!==player 
			&& !entity.died 
			&& entity.teamId!==player.teamId) {

			deltaX = entity.x - player.x;
			deltaY = entity.y - player.y;
			distance = deltaX * deltaX + deltaY * deltaY;
			if (distance < nearDistance) {
				nearDistance = distance;
				nearTarget = entity;
			}
		}
	}
	return nearTarget;
};

FightMode[FightMode.GUILDMODE]=function(player){
	var players=player.area.playerEntitys;
	var nearDistance = 999999;
	var entity,distance, nearTarget, deltaX, deltaY;
	for (var key in players) {
		entity=players[key];
		if (entity!==player 
			&& !entity.died 
			&& entity.guildId!==player.guildId) {
			
			deltaX = entity.x - player.x;
			deltaY = entity.y - player.y;
			distance = deltaX * deltaX + deltaY * deltaY;
			if (distance < nearDistance) {
				nearDistance = distance;
				nearTarget = entity;
			}
		}
	}
	return nearTarget;
};
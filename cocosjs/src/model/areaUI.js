
var pro = Area.prototype;

pro.setFightMode=function(fightMode){
	this.fightMode=fightMode;

	var player;
	for (var key in this.playerEntitys) {
		player = this.playerEntitys[key];
		this.setFightModeColor(player);
	}
};

pro.setFightModeColor = function(player) {
	// this.curPlayer
	switch (this.fightMode) {
		case FightMode.JUSTICEMODE:
			if (player.redPoint>=3) {
				player.setNameLabelColor(consts.COLOR_RED);
			}else{
				player.setNameLabelColor(consts.COLOR_WHITE);
			}
			break;
		case FightMode.ALLMODE:
			if (this.curPlayer.id!==player.id) {
				player.setNameLabelColor(consts.COLOR_RED);
			}
			break;
		case FightMode.TEAMMODE:
			if (this.curPlayer.teamId && this.curPlayer.teamId !== player.teamId) {
				player.setNameLabelColor(consts.COLOR_RED);
			} else {
				player.setNameLabelColor(consts.COLOR_WHITE);
			}
			break;
		case FightMode.GUILDMODE:
			if (this.curPlayer.guildId && this.curPlayer.guildId !== player.guildId) {
				player.setNameLabelColor(consts.COLOR_RED);
			} else {
				player.setNameLabelColor(consts.COLOR_WHITE);
			}
			break;
		case FightMode.SAFEMODE:
			player.setNameLabelColor(consts.COLOR_WHITE);
			break;
	}
};

pro.setAreaState = function(areaState) {
	this.areaState = areaState;
	if (areaState === AreaStates.BATTLE_STATE) {
		// mainPanel.setQuickChat(false);
		this.showDomainFire(this.domainLevel);
		this.removeAllItems();
		this.setTransportVisible(false);

		// var entity;
		// for (var key in this.playerEntitys) {
		// 	entity = this.playerEntitys[key];
		// 	if (entity.guildId === this.guildId) {
		// 		entity.setNameLabelColor(consts.COLOR_WHITE);
		// 	} else {
		// 		entity.setNameLabelColor(consts.COLOR_RED);
		// 	}
		// }
	} else {
		mainPanel.destoryAreaProgress();
		// mainPanel.setQuickChat(true);
		this.hideDomainFire();
		this.setTransportVisible(true);

		// this.guildId=data.guildId;
		// if (this.guildId) {
		// 	var entity;
		// 	for (var key in this.playerEntitys) {
		// 		entity = this.playerEntitys[key];
		// 		if (entity.guildId===this.guildId) {
		// 			entity.setNameLabelColor(consts.COLOR_WHITE);
		// 		}else{
		// 			entity.setNameLabelColor(consts.COLOR_RED);
		// 		}
		// 	}
		// }
	}
};

pro.hideDomainFire = function() {
	// mainPanel.setQuickChat(true);
	if (!this.fireSprites) return;

	var fireSprite;
	for (var key in this.fireSprites) {
		fireSprite = this.fireSprites[key];
		this.map.entityNode.removeChild(fireSprite);
	}
	this.fireSprites=null;
};

pro.showDomainFire=function(domainLevel){
	// mainPanel.setQuickChat(false);
	if (this.fireSprites) return;

	var guildTownData=dataApi.guild_town.findById(this.areaId%1000);
	if (!guildTownData) {
		return;
	}
	var positionX = guildTownData.pointX;
	var positionY = guildTownData.pointY;
	var points = [];
	var deltaX = 150;
	var deltaY = 80;
	points[0] = cc.p(positionX - deltaX, positionY - deltaY);
	points[1] = cc.p(positionX + deltaX, positionY - deltaY);
	points[2] = cc.p(positionX - deltaX, positionY + deltaY);
	points[3] = cc.p(positionX + deltaX, positionY + deltaY);

	points[4] = cc.p(positionX - deltaX, positionY);
	points[5] = cc.p(positionX + deltaX, positionY);
	points[6] = cc.p(positionX, positionY + deltaY);
	points[7] = cc.p(positionX, positionY - deltaY);

	this.fireSprites=[];
	var fireSprite;
	var spritePlist="effect/hellking.plist";
	var level=(Math.floor(domainLevel) || 0)+1;
	if (level>11) {
		level=11;
	}
	var spriteName="hellking"+level+"_";
	for (var i = 0; i <= 7; i++) {
		fireSprite=new cc.Sprite();
		var animate = cb.CommonLib.genarelAnimate(spritePlist, spriteName, 0.1, -1);
		var repeatForever = cc.RepeatForever.create(animate);
        fireSprite.runAction(repeatForever);
        fireSprite.setPosition(points[i]);
        fireSprite.setLocalZOrder(-points[i].y+15);
        this.map.entityNode.addChild(fireSprite);

        this.fireSprites.push(fireSprite);
	}
};


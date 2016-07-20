cb.TeamPanel = cb.BasePanel.extend({
	ctor: function() {
		this._super();
		this.createCCSNode("uiccs/TeamLayer.csb");
		// this.__initView();
		this.m_width = 490;
		this.m_height = 310;
		var onTouchBegan = function(touch, event) {
			return true;
		};

		var self = this;
		var onTouchEnded = function(touch, event) {
			var location = self.convertTouchToNodeSpace(touch);
			// cc.log("location  x="+location.x+" y="+location.y);
			
			if(! (location.x >-self.m_width/2 
				&& location.x < self.m_width/2 
				&& location.y >-self.m_height/2 
				&& location.y < self.m_height/2)
				) {

				self.closePanel();
			}
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchEnded: onTouchEnded
		}, this);
	},

	touchEvent: function (sender, type) {
        if(type===ccui.Widget.TOUCH_ENDED){
        	var nodeName=sender.getName();
        	if (nodeName==="disbandBtn") {
        		teamHandler.disbandTeam();
        		this.closePanel();
        		
        	}else if (nodeName==="leaveBtn") {
        		teamHandler.leaveTeam();
        		this.closePanel();

        	}else if (nodeName==="kickBtn") {
        		var playerId=sender.getTag();
        		teamHandler.kickOut(playerId);
        	}else if (nodeName==="itemBtn") {
        		var playerId=sender.getTag();

        	}
        }
    },

	setPanelData:function(character){
		if (!character) return;

		var teamInfo=teamManager.curPlayerTeamInfo;
		if (!teamInfo) return;
		this.character=character;

		var ccsNode = this._ccsNode;
		var jobText=ccsNode.getChildByName("jobText");

		var disbandBtn=ccsNode.getChildByName("disbandBtn");
		
		if (character.isCaptain===TeamConsts.NO) {
			jobText.setString("队员");
			disbandBtn.removeFromParent();
		}else{
			disbandBtn.addTouchEventListener(this.touchEvent, this);
		}

		var leaveBtn=ccsNode.getChildByName("leaveBtn");
		leaveBtn.addTouchEventListener(this.touchEvent, this);

		///////////////////////////////////
		var index=101;
		var itemNode,playerData;
		for (var key in teamInfo.playerDatas) {
			playerData = teamInfo.playerDatas[key];
			itemNode=ccsNode.getChildByTag(index);
			if (itemNode) {
				var entityData = dataApi.character.findById(playerData.kindId);
				var iconSprite=itemNode.getChildByName("iconSprite");
				var headIconFile = "icon/small_head/head_" + entityData.headId + ".png";
				iconSprite.setTexture(headIconFile);

				var contentSize = iconSprite.getContentSize();
				iconSprite.setScaleX(50/contentSize.width);
				iconSprite.setScaleY(50/contentSize.height);

				var nameText=itemNode.getChildByName("nameText");
				nameText.setString(playerData.name);

				var lvText=itemNode.getChildByName("lvText");
				lvText.setString("Lv."+playerData.level);
			
				var kickBtn=itemNode.getChildByName("kickBtn");
				var itemBtn=itemNode.getChildByName("itemBtn");
				if (character.id===playerData.playerId) {
					kickBtn.removeFromParent();
					itemBtn.removeFromParent();
					nameText.setColor(cc.color(0,255,0,255));
				}else if(character.isCaptain===TeamConsts.NO) {
					kickBtn.removeFromParent();
					itemBtn.setTag(playerData.playerId);
					itemBtn.addTouchEventListener(this.touchEvent,this);
				}else{
					kickBtn.setTag(playerData.playerId);
					itemBtn.setTag(playerData.playerId);

					kickBtn.addTouchEventListener(this.touchEvent,this);
					itemBtn.addTouchEventListener(this.touchEvent,this);
				}
			}
			index++;
		}
		for (; index <=103; index++) {
			itemNode=ccsNode.getChildByTag(index);
			if (itemNode) {
				itemNode.removeFromParent();
			}
		};
	}
});


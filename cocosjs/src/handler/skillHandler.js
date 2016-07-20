var skillHandler = {
	getAllSkills:function(){
		pomelo.request('area.skillHandler.getAllSkills', {}, function(data) {
			skillManager.setFightSkills(data);
		});
	},

	learnSkill: function(skillId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.skillHandler.learnSkill", {
			skillId: skillId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				// var fightSkills = app.curPlayerData.fightSkills;
				var skillId=data.skillId;
				var skillData=dataApi.fightskill.findById(skillId);

				if (!skillData) {
					quickLogManager.pushLog("学习技能，未能找到技能数据:"+skillId);
					return;
				}
				var fightSkill = {
					skillId:skillId,
					position: 0,
					level: data.level,
					skillData:skillData
				};
				skillManager.addFightSkill(fightSkill);

				if (layerManager.isRunPanel(cb.kMSkillPanelId)) {
					var curPanel = layerManager.curPanel;
					curPanel.addNewSkill(skillId);
				}
				quickLogManager.pushLog("技能学习成功!",5);
			} else if (!!data.code) {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	upgradeSkill: function(skillId) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.skillHandler.upgradeSkill", {
			skillId: skillId
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {

				var fightSkills = skillManager.getFightSkills();
				if (!fightSkills){
					cc.log("ERROR:updateSkill can't find skill data");
					return;
				}

				var fightSkill=fightSkills[data.skillId];
				fightSkill.level=data.level;

				if (layerManager.isRunPanel(cb.kMSkillPanelId)) {
					var curPanel = layerManager.curPanel;
					curPanel.updateSkill(data.skillId);
				}
				quickLogManager.pushLog("技能升级成功!",5);
			} else if (!!data.code) {
				quickLogManager.showErrorCode(data.code);
			}
		});
	},

	equipSkill: function(skillId, position) {
		if (position === 1) return;
		circleLoadLayer.showCircleLoad();
		pomelo.request("area.skillHandler.equipSkill", {
			skillId: skillId,
			position: position
		}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (data.code === 200) {
				var fightSkills = skillManager.getFightSkills();
				if (!fightSkills){
					cc.log("ERROR:equipSkill can't find skill data");
					return;
				}
				var fightSkill;
				if (data.position>0) {
					for (var key in fightSkills) {
						fightSkill=fightSkills[key];
						if (fightSkill.position===data.position) {
							fightSkill.position=0;
							break;
						}
					}
				}

				fightSkill=fightSkills[data.skillId];
				var oldPosition=fightSkill.position;
				fightSkill.position=data.position;
				
				if (layerManager.isRunPanel(cb.kMSkillPanelId)) {
					var curPanel = layerManager.curPanel;
					curPanel.equipSkill(fightSkill,oldPosition);
				}
			} else if (!!data.code) {
				quickLogManager.showErrorCode(data.code);
			}
		});
	}
};
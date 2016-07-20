cb.SkillManager = cc.Class.extend({
    ctor: function() {
    	this.fightSkills={};
    },

    getSkillList:function(){
    	if (this.skillList) {
    		return this.skillList;
    	}

    	var kindId = app.curPlayerData.kindId;
		var roleData = dataApi.role.findById(kindId);
		if (cc.isString(roleData.skillIds)) {
			this.skillList = JSON.parse(roleData.skillIds)
		}else{
			this.skillList = roleData.skillIds
		}
		return this.skillList;
    },

    setFightSkills:function(fightSkills){
		var fightSkill;
		for (var key in fightSkills) {
			fightSkill = fightSkills[key];
			fightSkill.skillData = dataApi.fightskill.findById(fightSkill.skillId);
			this.fightSkills[fightSkill.skillId]=fightSkill;
		}
		if (mainPanel) {
			mainPanel.updateFightSkills();
		}
    },

    requestData:function(){
		skillHandler.getAllSkills();
		this.hasRequest=true;
	},

	getFightSkills: function() {
		for (var fightSkill in this.fightSkills) {
			return this.fightSkills;
		}

		if (!this.hasRequest) {
			this.requestData();
		}
		return null;
	},

	addFightSkill:function(fightSkill){
		this.fightSkills[fightSkill.skillId]=fightSkill;
	}

});

var skillManager = new cb.SkillManager();





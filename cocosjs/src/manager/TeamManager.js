cb.TeamManager = cc.Class.extend({
	ctor: function() {
		this.clearAllTeams();
	},

	clearAllTeams: function() {
		this.teams = {};
		this.teamCount=0;
		this.registers = {};
	},

	addTeam: function(team) {
		if (team && team.teamId) {
			if (!this.teams[team.teamId]) {
				this.teamCount++;
			}
			this.teams[team.teamId] = team;
		}
	},

	removeTeam: function(teamId) {
		if (this.teams[teamId]) {
			delete this.teams[teamId];
			this.teamCount--;
		}
	},

	getTeamByTeamId: function(teamId, playerId) {
		var teams = this.teams;
		if (teams[teamId]) {
			return teams[teamId];
		}
		var registers = this.registers;
		if (!registers[teamId]) {
			registers[teamId] = {};
		}
		registers[teamId][playerId] = playerId;

		teamHandler.getTeamInfo(teamId, function(data) {
			if (data.code === 200) {
				var teamId = data.teamId;
				var teamName = data.teamName + "的队伍";
				teams[teamId] = {
					captainId: data.captainId,
					teamId: teamId,
					teamName: teamName
				};
				if (registers[teamId]) {
					var area = app.getCurArea();
					for (var key in registers[teamId]) {
						var playerId = registers[teamId][key];
						var playerEntity = area.getPlayer(playerId);
						if (playerId === data.captainId) {
							playerEntity.isCaptain = TeamConsts.YES;
						}
						playerEntity.showTeamMemberFlag(true, teamName);
					}
					delete registers[teamId];
				}
			}
		});
	}
});

var teamManager = new cb.TeamManager();


var teamHandler = {
	getTeamInfo: function(teamId, callback) {
		pomelo.request("manager.teamHandler.getTeamInfo", {
			teamId: teamId
		}, function(data) {
			if (callback) {
				callback(data);
			}
		});
	},

	createTeam: function() {
		var curPlayer = app.getCurPlayer();
		if (curPlayer.teamId !== TeamConsts.TEAM_ID_NONE) {
			quickLogManager.showErrorCode(15);
			return;
		}
		pomelo.request("area.teamHandler.createTeam", null, function(data) {

			if (data.code !== 200) {
				if (data.code === 15) {
					teamManager.removeTeam(data.teamId);
					teamManager.getTeamByTeamId(data.teamId, curPlayer.id);
					return;
				}
				quickLogManager.showErrorCode(data.code);
				return;
			}

		});
	},

	leaveTeam: function() {
		// var curPlayer = app.getCurPlayer();
		// if (curPlayer.teamId === TeamConsts.TEAM_ID_NONE) {
		// 	tipsBoxLayer.showErrorCodeTipsBox(19);
		// 	return;
		// }
		pomelo.notify("area.teamHandler.leaveTeam",{});
	},

	disbandTeam: function() {
		// var curPlayer = app.getCurPlayer();
		// if (curPlayer.teamId === TeamConsts.TEAM_ID_NONE) {
		// 	tipsBoxLayer.showErrorCodeTipsBox(19);
		// 	return;
		// }
		pomelo.notify("area.teamHandler.disbandTeam",{});
	},

	// leaveTeam: function() {
	// 	var curPlayer = app.getCurPlayer();
	// 	if (curPlayer.teamId === TeamConsts.TEAM_ID_NONE) {
	// 		tipsBoxLayer.showErrorCodeTipsBox(19);
	// 		return;
	// 	}
	// 	pomelo.request("area.teamHandler.leaveTeam", null, function(data) {
	// 		if (data.code !== 200) {
	// 			tipsBoxLayer.showErrorCodeTipsBox(data.code);
	// 			return;
	// 		}
	// 	});
	// },

	// disbandTeam: function() {
	// 	var curPlayer = app.getCurPlayer();
	// 	if (curPlayer.teamId === TeamConsts.TEAM_ID_NONE) {
	// 		tipsBoxLayer.showErrorCodeTipsBox(19);
	// 		return;
	// 	}
	// 	pomelo.request("area.teamHandler.disbandTeam", null, function(data) {
	// 		if (data.code !== 200) {
	// 			tipsBoxLayer.showErrorCodeTipsBox(data.code);
	// 			return;
	// 		}
	// 	});
	// },

	inviteJoinTeam: function(inviteeId) {
		var curPlayer = app.getCurPlayer();
		if (curPlayer.teamId === TeamConsts.TEAM_ID_NONE) {
			quickLogManager.pushErrorCodeLog(19);
			return;
		}
		if (!curPlayer.isCaptain) {
			quickLogManager.pushErrorCodeLog(20);
			return;
		}
		pomelo.request("area.teamHandler.inviteJoinTeam", {
			inviteeId: inviteeId
		}, function(data) {
			if (data.code !== 200) {
				quickLogManager.showErrorCode(data.code);
				return;
			}else{
				quickLogManager.pushLog("已向对方发送邀请组队！");
			}
		});
	},

	inviteJoinTeamReply: function(teamId, captainId, reply) {
		pomelo.notify("area.teamHandler.inviteJoinTeamReply", {
			teamId: teamId,
			captainId: captainId,
			reply: reply
		});
	},

	applyJoinTeam: function(captainId) {
		pomelo.request("area.teamHandler.applyJoinTeam", {
			captainId: captainId
				// teamId: teamId
		}, function(data) {
			if (data.code !== 200) {
				quickLogManager.showErrorCode(data.code);
				return;
			}else{
				quickLogManager.pushLog("已向对方发送申请组队！");
			}
		});
	},

	applyJoinTeamReply: function(teamId,applicantId,reply) {
		pomelo.notify("area.teamHandler.applyJoinTeamReply", {
			teamId: teamId,
			applicantId:applicantId,
			reply: reply
		});
	},

	kickOut: function(kickedId) {
		pomelo.notify("area.teamHandler.kickOut", {
			kickedId: kickedId
		});
	}
};
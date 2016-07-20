var federateHandler = {
	getFederation: function(callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("trade.federateHandler.getFederation",null, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	donation: function(caoCoin, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("area.federateHandler.donation", {
			caoCoin: caoCoin
		}, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	topDonations: function(callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("trade.federateHandler.topDonations", null, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack(data);
			}
		});
	},

	getAffiches: function(id,callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.request("trade.federateHandler.getAffiches", {id:id}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack(data);
			}
		});
	},

	buyVote: function(caoCoin, callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("area.federateHandler.buyVote", {
			caoCoin: caoCoin
		}, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	shareVote: function(callBack) {
		circleLoadLayer.showCircleLoad();
		pomelo.notify("area.federateHandler.shareVote",null, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	getOffices:function(callBack){
		circleLoadLayer.showCircleLoad();
		pomelo.request("trade.federateHandler.getOffices",null, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack(data);
			}
		});
	},

	getCandidate:function(officeId,callBack){
		circleLoadLayer.showCircleLoad();
		pomelo.request("trade.federateHandler.getCandidate",{officeId:officeId}, function(data) {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack(data);
			}
		});
	},

	election:function(officeId,callBack){
		circleLoadLayer.showCircleLoad();
		pomelo.notify("trade.federateHandler.election",{officeId:officeId}, function() {
			circleLoadLayer.hideCircleLoad();
		});
	},

	voteTicket:function(officeId,voteCount,voterId,callBack){
		circleLoadLayer.showCircleLoad();
		pomelo.notify("trade.federateHandler.voteTicket", {
			officeId: officeId,
			voteCount:voteCount,
			voterId: voterId
		}, function() {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack();
			}
		});
	},

	impeach:function(officeId,voteCount,type,callBack){
		circleLoadLayer.showCircleLoad();
		pomelo.notify("trade.federateHandler.impeach", {
			officeId: officeId,
			voteCount:voteCount,
			type: type
		}, function() {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack();
			}
		});
	},

	abdicate:function(officeId,callBack){
		circleLoadLayer.showCircleLoad();
		pomelo.notify("trade.federateHandler.abdicate", {
			officeId: officeId
		}, function() {
			circleLoadLayer.hideCircleLoad();
			if (callBack) {
				callBack();
			}
		});
	}

};


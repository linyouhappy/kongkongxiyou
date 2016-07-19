/**
 * Module dependencies
 */

var dataApi = require('../../../util/dataApi');
var messageService = require('../../../domain/messageService');
var consts = require('../../../consts/consts');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var pomelo = require('pomelo');

var handler = module.exports;

handler.donation = function(msg, session, next) {
	var player = session.player;
	var caoCoin = msg.caoCoin;
	if (player.caoCoin < caoCoin) {
		messageService.pushLogTipsToPlayer(player,93);
		return;
	}
	player.addCaoCoin(-caoCoin, function(err, ret) {
		if (err) {
			messageService.pushLogTipsToPlayer(player, 89);
		} else {
			pomelo.app.rpc.trade.federateRemote.donation(session, player.id, caoCoin, function(err) {
				if (err) {
					logger.error("handler.donation failed ");
					messageService.pushLogTipsToPlayer(player, 89);
				} else {
					var msg = {
						data: []
					};
					msg.data[0] = {
						playerId: player.id,
						name: player.name
					};
					msg.data[1]=caoCoin;
					if(caoCoin < 10000){
						return;
					}else if (caoCoin < 100000) {
						msg.broadId = 103;
					} else if (caoCoin < 1000000) {
						msg.broadId = 104;
					} else if (caoCoin < 10000000) {
						msg.broadId = 105;
					} else if (caoCoin < 100000000) {
						msg.broadId = 106;
					} else {
						msg.broadId = 107;
					}
					pomelo.app.rpc.chat.chatRemote.pushMarquee(session, msg, function(){});
				}
			});
		}
	});
	next();
};

handler.buyVote = function(msg, session, next) {
	var player = session.player;
	var caoCoin = msg.caoCoin;
	if (player.caoCoin < caoCoin) {
		messageService.pushLogTipsToPlayer(player, 94);
		return;
	}
	player.addCaoCoin(-caoCoin, function(err, ret) {
		if (err) {
			messageService.pushLogTipsToPlayer(player, 89);
		} else {
			pomelo.app.rpc.trade.federateRemote.buyVote(session, player.id, caoCoin, function(err) {
				if (err) {
					logger.error("handler.donation failed ");
					messageService.pushLogTipsToPlayer(player, 89);
				}
			});
		}
	});
	next();
};

handler.shareVote = function(msg, session, next) {
	var player = session.player;
	pomelo.app.rpc.trade.federateRemote.shareVote(session, player.id, function(err,caoCoin) {
		if (err) {
			logger.error("handler.donation failed ");
			messageService.pushLogTipsToPlayer(player, 89);
		}else{
			if (caoCoin) {
				player.addCaoCoin(caoCoin);
			}
		}
	});
	next();
};

var utils = require('../../../util/utils');
var federationService = require('../../../services/federationService');

var exp = module.exports;

exp.donation = function(playerId, caoCoin, cb) {
	federationService.donation(playerId, caoCoin, cb);
};

exp.buyVote=function(playerId, caoCoin, cb) {
	federationService.buyVote(playerId, caoCoin, cb);
};

exp.shareVote=function(playerId, cb) {
	federationService.shareVote(playerId, cb);
};


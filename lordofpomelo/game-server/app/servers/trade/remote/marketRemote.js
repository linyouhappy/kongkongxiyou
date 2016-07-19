var utils = require('../../../util/utils');
var federationService = require('../../../services/federationService');
var pomelo = require('pomelo');

// module.exports = function(app) {
// 	return new MarketRemote(app, app.get('marketService'));
// };

var exp = module.exports;
var marketService=pomelo.app.get('marketService');

// var MarketRemote = function(app, marketService) {
// 	this.app = app;
// 	this.marketService = marketService;
// };

exp.inputCaoCoin = function(playerId, caoCoin, cb) {
	marketService.inputCaoCoin(playerId, caoCoin, cb);
};

exp.outputCaoCoin = function(playerId, caoCoin, cb) {
	marketService.outputCaoCoin(playerId, caoCoin, cb);
};

exp.outputItems = function(playerId, cb) {
	marketService.outputItems(playerId);
	utils.invokeCallback(cb);
};

exp.sellOrder = function(sellItem, cb) {
	marketService.sellOrder(sellItem);
	utils.invokeCallback(cb);
};

exp.kick = function(playerId, cb){
	marketService.kick(playerId);
	federationService.kick(playerId);
	utils.invokeCallback(cb);
};


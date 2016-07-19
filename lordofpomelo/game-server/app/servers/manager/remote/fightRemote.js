var utils = require('../../../util/utils');
var fightService = require('../../../services/fightService');

var exp = module.exports;

exp.kick = function(playerId, cb){
	fightService.kick(playerId);
	utils.invokeCallback(cb);
};

exp.finishFight=function(winnerId,loserId,cb){
	utils.myPrint('fightRemote.finishFight winnerId=',winnerId,',loserId=',loserId);
	var fightLevel=fightService.finishFight(winnerId,loserId);
	utils.invokeCallback(cb,null,fightLevel);
};
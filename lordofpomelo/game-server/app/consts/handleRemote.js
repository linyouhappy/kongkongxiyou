var handleRemote = module.exports;
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('./consts');
var pomelo = require('pomelo');

// var dataApi = require('../util/dataApi');
// var PlayerJob=consts.PlayerJob;

// consts.BLACKHOLEFUNC;

handleRemote.chatRemote_pushMarquee=function (session,msg,cb) {
	pomelo.app.rpc.manager.chatRemote.pushMarquee(session, msg,consts.BLACKHOLEFUNC);
};

handleRemote.chatRemote_readMail=function (session,playerId,mailId,cb) {
	pomelo.app.rpc.manager.chatRemote.readMail(session,playerId,mailId,cb);
};

handleRemote.chatRemote_add = function(session, uid, playerId, channelName) {
	pomelo.app.rpc.manager.chatRemote.add(session, uid, playerId, channelName, consts.BLACKHOLEFUNC);
};

handleRemote.chatRemote_kick = function(session, uid) {
	pomelo.app.rpc.manager.chatRemote.kick(session, uid, consts.BLACKHOLEFUNC);
};

handleRemote.chatRemote_sendMail = function(session, playerIds,content) {
	pomelo.app.rpc.manager.chatRemote.sendMail(session, playerIds, content, consts.BLACKHOLEFUNC);
};

handleRemote.chatRemote_pushWorld = function(session, msg) {
	pomelo.app.rpc.manager.chatRemote.pushWorld(session, msg, consts.BLACKHOLEFUNC);
};

handleRemote.guildRemote_finishDomain = function(session, areaId, guildId, level, cb) {
	pomelo.app.rpc.manager.guildRemote.finishDomain(session, areaId, guildId, level, cb);
};

		

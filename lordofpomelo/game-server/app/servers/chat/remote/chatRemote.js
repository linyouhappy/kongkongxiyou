var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('../../../consts/consts');
var utils = require('../../../util/utils');

var Channel=consts.Channel;

module.exports = function(app) {
	return new ChatRemote(app, app.get('chatService'));
};

var ChatRemote = function(app, chatService) {
	this.app = app;
	this.chatService = chatService;
};

/**
 *	Add player into channel
 */
ChatRemote.prototype.add = function(uid, playerId, channelName, cb) {
	var code = this.chatService.add(uid, playerId, channelName);
	cb(null, code);
};

/**
 * leave Channel
 * uid
 * channelName
 */
ChatRemote.prototype.leave =function(uid, channelName, cb){
    logger.info("ChatRemote.leave====>> uid=",uid);
	this.chatService.leave(uid, channelName);
	utils.invokeCallback(cb);
};

/**
 * kick out user
 *
 */
ChatRemote.prototype.kick = function(uid, cb){
	this.chatService.kick(uid);
	utils.invokeCallback(cb);
};

ChatRemote.prototype.pushMarquee=function(msg,cb){
	var channelName = channelUtil.getGlobalChannelName();;
    var content = {
      channel: Channel.MARQUEE
    };
    if (msg.content) {
    	content.content=msg.content;
    }else{
    	content.broadId=msg.broadId;
    	content.count=msg.count;
    	content.data=msg.data;
    }
    this.chatService.pushByChannel(channelName, content, function(err, res) {
      // if (err) {
      //   logger.error(err.stack);
      // } 
    });
    utils.invokeCallback(cb);
};

ChatRemote.prototype.pushSystem=function(msg,cb){
	var channelName = channelUtil.getGlobalChannelName();;
    var content = {
      channel: Channel.SYSTEM
    };
    if (msg.content) {
    	content.content=msg.content;
    }else{
    	content.broadId=msg.broadId;
    	content.data=msg.data;
    }
    this.chatService.pushByChannel(channelName, content, function(err, res) {
      // if (err) {
      //   logger.error(err.stack);
      // } 
    });
    utils.invokeCallback(cb);
};

ChatRemote.prototype.pushWorld = function(msg, cb) {
    var channelName = channelUtil.getGlobalChannelName();
    var content = {
        channel: Channel.WORLD,
        playerId: msg.playerId,
        vip:msg.vip,
        from: msg.playerName
    };
    if (msg.chatContent) {
        content.content=msg.chatContent;
    }else{
        content.broadId=msg.broadId;
        content.data=msg.data;
    }

    this.chatService.pushByChannel(channelName, content, function(err, res) {
        // if (err) {
        //     logger.error(err.stack);
        // }
    });
    utils.invokeCallback(cb);
};

ChatRemote.prototype.sendMail = function(playerIds, mail, cb) {
    this.chatService.pushMail(playerIds,mail);
    utils.invokeCallback(cb);
};

ChatRemote.prototype.readMail=function(playerId,mailId, cb){
    this.chatService.readMail(playerId,mailId,cb);
};




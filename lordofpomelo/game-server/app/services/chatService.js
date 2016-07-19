var Code = require('../../../shared/code');
var utils = require('../util/utils');
var dispatcher = require('../util/dispatcher');
var Event = require('../consts/consts').Event;
var logger = require('pomelo-logger').getLogger(__filename);
var channelUtil = require('../util/channelUtil');
var pomelo = require('pomelo');

var ChatService = function(app) {
  this.app = app;
  this.uidMap = {};
  this.nameMap = {};
  this.channelMap = {};

  this.mails={};
  this.mailIds=[];
  this.mailPlayerIds={};
  this.playerIdMails={};

  this.chatItems={};
  this.chatItemIds=[];
};

module.exports = ChatService;


/**
 * Add player into the channel
 *
 * @param {String} uid         user id
 * @param {String} playerName  player's role name
 * @param {String} channelName channel name
 * @return {Number} see code.js
 */
ChatService.prototype.add = function(uid, playerId, channelName) {
  var sid = getSidByUid(uid, this.app);
  if(!sid) {
    return 3003;
  }

  if(checkDuplicate(this, uid, channelName)) {
    return 200;
  }

  // utils.myPrint("playerName=",playerName,'channelName = ', channelName);
  var channel = this.app.get('channelService').getChannel(channelName, true);
  if(!channel) {
    return 3001;
  }

  channel.add(uid, sid);
  addRecord(this, uid, playerId, sid, channelName);

  if (channelUtil.getGlobalChannelName() === channelName) {
    this.pushMailToPlayer(playerId);
  }
  return 200;
};


/**
 * User leaves the channel
 *
 * @param  {String} uid         user id
 * @param  {String} channelName channel name
 */
ChatService.prototype.leave = function(uid, channelName) {
  var record = this.uidMap[uid];
  var channel = this.app.get('channelService').getChannel(channelName, true);

  if(channel && record) {
    channel.leave(uid, record.sid);
    if (channel.getUserAmount()===0) {
      this.app.get('channelService').destroyChannel(channel.name);
    }
  }

  removeRecord(this, uid, channelName);
};

/**
 * Kick user from chat service.
 * This operation would remove the user from all channels and
 * clear all the records of the user.
 *
 * @param  {String} uid user id
 */
ChatService.prototype.kick = function(uid) {
  var channelNames = this.channelMap[uid];
  var record = this.uidMap[uid];

  if (channelNames && record) {
    // remove user from channels
    var channel;
    for (var name in channelNames) {
      channel = this.app.get('channelService').getChannel(name);
      if (channel) {
        channel.leave(uid, record.sid);
        if (channel.getUserAmount() === 0) {
          this.app.get('channelService').destroyChannel(channel.name);
        }
      }
    }
  }
  clearRecords(this, uid);
};

/**
 * Push message by the specified channel
 *
 * @param  {String}   channelName channel name
 * @param  {Object}   msg         message json object
 * @param  {Function} cb          callback function
 */
ChatService.prototype.pushByChannel = function(channelName, msg, cb) {
  var channel = this.app.get('channelService').getChannel(channelName);
  if(!channel) {
    logger.warn('channel ' + channelName + ' dose not exist');
    cb();
    // cb(new Error('channel ' + channelName + ' dose not exist'));
    // cb('channel ' + channelName + ' dose not exist');
    return;
  }
  channel.pushMessage(Event.chat, msg, cb);
};

ChatService.prototype.checkOnline=function(playerId){
  return !!this.nameMap[playerId];
};

/**
 * Push message to the specified player
 *
 * @param  {String}   playerName player's role name
 * @param  {Object}   msg        message json object
 * @param  {Function} cb         callback
 */
ChatService.prototype.pushByPlayerId = function(playerId, msg, cb) {
  var record = this.nameMap[playerId];
  if(!record) {
    cb(null, 3004);
    return;
  }
  this.app.get('channelService').pushMessageByUids(Event.chat, msg, [record], cb);
};

ChatService.prototype.pushMessageByPlayerId = function(playerId,rout,msg) {
  var record = this.nameMap[playerId];
  if(!record) {
    return;
  }
  this.app.get('channelService').pushMessageByUids(rout, msg, [record]);
};

var _mailId = 1;
ChatService.prototype.pushMail = function(playerIds, mail) {
  mail.id = _mailId++;

  this.mailIds.push(mail.id);
  this.mails[mail.id]=mail;

  var mailPlayerIds={};
  this.mailPlayerIds[mail.id]=mailPlayerIds;

  var playerId;
  var playerIdMails = this.playerIdMails;
  for (var i = 0; i < playerIds.length; i++) {
    playerId = playerIds[i];
    if (!playerIdMails[playerId]) {
      playerIdMails[playerId] = {};
    }
    playerIdMails[playerId][mail.id]=mail.id;
    mailPlayerIds[playerId]=playerId;

    this.pushMessageByPlayerId(playerId, "onMail", mail);
  }

  while (this.mailIds.length>1000) {
    var mailId=this.mailIds.shift();
    if (mailId) {
      delete this.mails[mailId];
      mailPlayerIds=this.mailPlayerIds[mailId];
      if (mailPlayerIds) {
        for (var key in mailPlayerIds) {
          playerId = mailPlayerIds[key];
          var playerMails=this.playerIdMails[playerId];
          if (playerMails) {
            delete playerMails[mailId];
            if (Object.keys(playerMails).length===0) {
              delete this.playerIdMails[playerId];
            }
          }
        }
        delete this.mailPlayerIds[mailId];
      }
    }
  }
};

ChatService.prototype.pushMailToPlayer = function(playerId) {
  var self=this;
  setTimeout(function() {
    var playerMails = self.playerIdMails[playerId];
    for (var key in playerMails) {
      var mail = self.mails[playerMails[key]];
      self.pushMessageByPlayerId(playerId, "onMail", mail);
    }
  }, 3000);
};

ChatService.prototype.readMail = function(playerId, mailId, cb) {
  var playerMails = this.playerIdMails[playerId];
  if (playerMails && playerMails[mailId]) {
    delete playerMails[mailId];
    var mail = this.mails[mailId];
    if (mail) {
      var mailPlayerIds = this.mailPlayerIds[mailId];
      delete mailPlayerIds[playerId];
      if (Object.keys(mailPlayerIds).length === 0) {
        delete this.mails[mailId];
        delete this.mailPlayerIds[mailId];
      }
      utils.invokeCallback(cb, null, 200, mail.items);
    } else {
      delete this.mailPlayerIds[mailId];
      utils.invokeCallback(cb, null, 134);
    }
  } else {
    utils.invokeCallback(cb, null, 134);
  }
};
ChatService.prototype.getChatItem = function(itemId) {
  return this.chatItems[itemId];
};

ChatService.prototype.addChatItem = function(chatItem) {
  var itemId = chatItem.id;
  if (!itemId) return;

  this.chatItems[itemId] = chatItem;
  this.chatItemIds.push(itemId);
  while (this.chatItemIds.length > 150) {
    var itemId = this.chatItemIds.shift();
    if (itemId) {
      delete this.chatItems[itemId];
    }
  }
};

//<#GkindId|id>
ChatService.prototype.findItem=function(chatContent,session) {
  var searchIndex = 0,closeTagIndex;
  while (true) {
    searchIndex = chatContent.indexOf("<#G", searchIndex);
    if (searchIndex >= 0) {
      closeTagIndex = chatContent.indexOf(">", searchIndex);
      if (closeTagIndex > 0) {
        var itemStr=chatContent.substring(searchIndex + 3, closeTagIndex);
        var infoArray= itemStr.split("|");
        var kindId=Number(infoArray[0]);
        var itemId=Number(infoArray[1]);
        if (kindId && itemId) {
          var serverId = session.get('serverId');
          var params = {
            namespace: 'user',
            service: 'playerRemote',
            method: 'getChatItem',
            args: [{
              playerId: session.get('playerId'),
              // kindId: kindId,
              itemId: itemId
            }]
          };
          var self=this;
          pomelo.app.rpcInvoke(serverId, params, function(err, item) {
            if (item) {
              item.id=itemId;
              item.kindId=kindId;
              self.addChatItem(item);
            } else {
              logger.error("ChatService.findItem  item==null");
            }
          });
        }
        searchIndex = closeTagIndex;
        continue;
      }
    }
    break;
  }
}


/**
 * Cehck whether the user has already in the channel
 */
var checkDuplicate = function(service, uid, channelName) {
  var channel=service.channelMap[uid];
  if (!channel) {
    return false;
  }
  return !!channel[channelName];
  // return !!service.channelMap[uid] && !!service.channelMap[uid][channelName];
};

/**
 * Add records for the specified user
 */
var addRecord = function(service, uid, playerId, sid, channelName) {
  var record = {uid: uid, playerId: playerId, sid: sid};
  service.uidMap[uid] = record;
  service.nameMap[playerId] = record;
  var item = service.channelMap[uid];
  if(!item) {
    item={};
    service.channelMap[uid] =item; 
  }
  item[channelName] = 1;
};

/**
 * Remove records for the specified user and channel pair
 */
var removeRecord = function(service, uid, channelName) {
  delete service.channelMap[uid][channelName];
  if(utils.size(service.channelMap[uid])) {
    return;
  }

  // if user not in any channel then clear his records
  clearRecords(service, uid);
};

/**
 * Clear all records of the user
 */
var clearRecords = function(service, uid) {
  delete service.channelMap[uid];

  var record = service.uidMap[uid];
  if(!record) {
    return;
  }

  delete service.uidMap[uid];
  delete service.nameMap[record.playerId];
};

/**
 * Get the connector server id assosiated with the uid
 */
var getSidByUid = function(uid, app) {
  var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
  if(connector) {
    return connector.id;
  }
  return null;
};

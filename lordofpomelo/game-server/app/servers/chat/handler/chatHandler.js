var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
// var pomelo = require('pomelo');
var forbid_word = require('../../../../config/data/forbid_word');
var consts = require('../../../consts/consts');
var Channel=consts.Channel;


module.exports = function(app) {
  return new ChannelHandler(app, app.get('chatService'));
};

var ChannelHandler = function(app, chatService) {
  this.app = app;
  this.chatService = chatService;
};

// function setContent(str) {
//   str = str.replace(/<\/?[^>]*>/g, '');
//   str = str.replace(/[ | ]*\n/g, '\n');
//   return str.replace(/\n[\s| | ]*\r/g, '\n');
// }
//<#GkindId|id>
function findItem(chatContent,session) {
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
              kindId: kindId,
              itemId: itemId
            }]
          };
          pomelo.app.rpcInvoke(serverId, params, function() {

            
          });
        }
        searchIndex = closeTagIndex;
        continue;
      }
    }
    break;
  }
}

function checkForbid(chatContent) {
  var fbword,searchIndex;
  // var chatContent=msg.content;
  for (var i = 0; i < forbid_word.length; i++) {
    fbword = forbid_word[i][0];
    searchIndex = chatContent.indexOf(fbword);
    if (searchIndex >= 0) {
      chatContent=chatContent.substring(0,searchIndex)+"*"+
            chatContent.substring(searchIndex+fbword.length,chatContent.length);
    }
  }
  return chatContent;
}

ChannelHandler.prototype.send = function(msg, session, next) {
  var content, channelName;
  var playerId = session.get('playerId');
  var playerName=session.get('playerName');
  var vip=session.get("vip");
  channel = msg.channel;

  var chatContent=checkForbid(msg.content);
  findItem(chatContent,session);

  if (channel === Channel.WORLD
      || channel === Channel.AREA
  ) {
    channelName = getChannelName(msg);
    content = {
      channel: channel,
      playerId:playerId,
      vip:vip,
      from: playerName,
      content:chatContent
    };
    this.chatService.pushByChannel(channelName, content, function(err, res) {
      if (err) {
        logger.error(err.stack);
      } 
    });

  // }else if(channel === Channel.AREA){
  //   var instanceId=session.get('instanceId');
  //   if (instanceId) {
  //     next();
  //     return;
  //   }
  //   content = {
  //     // channel: channel,
  //     playerId:playerId,
  //     vip:vip,
  //     from: playerName,
  //     content:chatContent
  //   };
  //   var serverId = session.get('serverId');
  //   var params = {
  //     namespace: 'user',
  //     service: 'playerRemote',
  //     method: 'chatInArea',
  //     args: [content]
  //   };
  //   this.app.rpcInvoke(serverId, params, function(err, result) {
  //     if (!!err) {
  //       console.error('isInInstance getArea error!');
  //     }
  //   });

  } else if (channel === Channel.FACTION) {
    var guildId = session.get('guildId');
    if (guildId) {
      content = {
        // channel: channel,
        playerId: playerId,
        // vip:vip,
        // from: playerName,
        content: chatContent
      };
      var args = {
        guildId: guildId,
        content: content
      };
      this.app.rpc.manager.guildRemote.chatInGuild(session, args, function() {});
    }
  } else if (channel === Channel.TEAM) {
    if (msg.teamId > consts.TEAM.AREA_ID_NONE) {
      content = {
        channel: channel,
        playerId: playerId,
        vip:vip,
        from: playerName,
        content: chatContent
      };
      var args = {
        teamId: msg.teamId,
        content: content
      };
      // utils.myPrint('ByChannel ~ args = ', JSON.stringify(args));
      this.app.rpc.manager.teamRemote.chatInTeam(session, args, function() {});
    } 
  } else if (channel === Channel.PRI) {
    if (this.chatService.checkOnline(msg.toName)) {
      content = {
        channel: channel,
        from: playerName,
        playerId: playerId,
        toName: msg.toName,
        toPlayerId: msg.toPlayerId,
        vip:vip,
        content: chatContent
      };

      this.chatService.pushByPlayerId(playerId, content, function(err, res) {});
      this.chatService.pushByPlayerId(msg.toPlayerId, content, function(err, res) {
        if (err) {
          logger.error(err.stack);
        }
      });
    }else{

    }
  }else if (channel === Channel.MARQUEE) {
    channelName = channelUtil.getGlobalChannelName();
    content = {
      channel: channel,
      playerId:playerId,
      vip:vip,
      from: playerName,
      content:chatContent
    };
    this.chatService.pushByChannel(channelName, content, function(err, res) {
      if (err) {
        logger.error(err.stack);
      } 
    });
  }else if (channel===Channel.SYSTEM) {
    if (chatContent.charAt(0) === "@") {
      // @12|234324
      var searchIndex=chatContent.indexOf("|",1);
      var cmdId,cmdContent;
      if (searchIndex>=0) {
        cmdId=chatContent.substring(1,searchIndex);
        cmdContent = chatContent.substring(searchIndex+1);
      }else{
        cmdId=chatContent.substring(1);
      }
      cmdId=Number(cmdId);
      if (cmdId === 1) {
        var playerIds = [playerId];
        var mail = {
          broadId: 501,
          data: [3001],
          items: [{
            kindId: 7700,
            type: 5,
            count: 100
          }, {
            kindId: 6101,
            type: 4,
            count: 1
          }]
        };
        this.chatService.pushMail(playerIds, mail);
      }
      
    }else{
      logger.error("player send SYSTEM chat.It is forbidden");
    }
  }
  next();
};

var getChannelName = function(msg) {
  if (msg.channel === Channel.AREA) {
    return channelUtil.getAreaChannelName(msg.areaId);
  }
  return channelUtil.getGlobalChannelName();
};
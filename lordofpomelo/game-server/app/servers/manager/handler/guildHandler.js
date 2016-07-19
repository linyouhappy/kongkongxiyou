var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var handleRemote = require('../../../consts/handleRemote');

var PlaceTypes=consts.PlaceTypes;

var handler = module.exports;
var guildService = pomelo.app.get('guildService');

handler.itemAffiche = function(msg, session, next) {
  var guildId = session.get('guildId');
  var id=msg.id || 0;
  var guild = guildService.getGuild(msg.guildId);
  if (guild) {
    var itemAffiches=guild.getItemAffiches();
    var newAffiches=[];
    for (var i = itemAffiches.length - 1; i >= 0; i--) {
      if (itemAffiches[i].id > id) {
        newAffiches.push(itemAffiches[i]);
      } else {
        break;
      }
    }
    newAffiches.reverse();
    next(null,newAffiches);
  } else {
    next(null, []);
  }
};

handler.guildAffiche = function(msg, session, next) {
  var guildId = session.get('guildId');
  var id=msg.id || 0;
  var guild = guildService.getGuild(msg.guildId);
  if (guild) {
    var guildAffiches=guild.getGuildAffiches();
    var newAffiches=[];
    for (var i = guildAffiches.length - 1; i >= 0; i--) {
      if (guildAffiches[i].id > id) {
        newAffiches.push(guildAffiches[i]);
      } else {
        break;
      }
    }
    newAffiches.reverse();
    next(null,newAffiches);
  } else {
    next(null, []);
  }
};

handler.getGuild = function(msg, session, next) {
  var guild = guildService.getGuild(msg.guildId);
  if (guild) {
    next(null, guild.strip());
  } else {
    next(null, {
      code: 201
    });
  }
};

handler.getGuilds = function(msg, session, next) {
  var guilds = guildService.getGuilds(msg.start);
  next(null, guilds);
};

handler.guildDesc = function(msg, session, next) {
  var guildId = session.get('guildId');
  var code = guildService.guildDesc(guildId, msg.desc);
  next(null, {
    code: code
  });
};

handler.getMembers = function(msg, session, next) {
  var guildId = msg.guildId;
  if (!guildId) {
    messageService.pushLogTipsToPlayer({
      uid: session.uid,
      sid: session.frontendId
    }, 113);
    next(null, []);
    return;
  }
  guildService.getMembers(guildId, function(err, guildMember) {
    if (err) {
      messageService.pushLogTipsToPlayer({
        uid: session.uid,
        sid: session.frontendId
      }, 113);
      next(null, []);
    } else {
      if (guildMember) {
        var members = [];
        var member;
        for (var key in guildMember) {
          member=guildMember[key];
          members.push({
            name:member.name,
            playerId:member.playerId,
            level:member.level,
            jobId:member.jobId,
            caoCoin:member.caoCoin
          });
        }
        next(null, members);
      } else {
        next(null, []);
      }
    }
  });
};

handler.enterGuild = function(msg, session, next) {
  if (!guildService) {
    guildService = pomelo.app.get('guildService');
  }
  var playerId = session.get('playerId');
  var guildId = session.get('guildId');
  var playerLevel = session.get('level');
  guildService.enterGuild(guildId, playerId, false, function(err, guild, member) {
    if (!!err) {
      next(null, {
        code: 106
      });
      return;
    }
    if (!member) {
      guildService.markNoGuild(playerId, session.uid);
      next(null, {
        code: 201
      });
      return;
    }
    if (guild) {
      if (!guildId || member.guildId !== guildId) {
        utils.myPrint("member.guildId !== guildId =====>> guildId="+member.guildId);

        session.set('guildId', member.guildId);
        session.push('guildId');

        var serverId = session.get('serverId');
        var params = {
          namespace: 'user',
          service: 'guildRemote',
          method: 'setGuildId',
          args: [{
            playerId: playerId,
            guildId: member.guildId
          }]
        };
        pomelo.app.rpcInvoke(serverId, params, function(){});
      }

      if (member.guildId === guild.id) {
        if (member.level !== playerLevel) {
          member.level = playerLevel;
          guild.saveMember(member);
        }
        guild.enterGuild(member, session.uid);
        var msg=guild.strip();
        msg.myJobId=member.jobId;
        msg.myBuild=member.build;
        msg.salaryTime=member.salaryTime;
        next(null, msg);
        return;
      }

    }
    guildService.markNoGuild(playerId, session.uid);
    guildService.removeMember(member);
    next(null, {
      code: 201
    });
  });
};

handler.applyGuild = function(msg, session, next) {
  var code = guildService.applyGuild(session, msg.guildId);
  next(null, {
    code: code
  });
};

handler.applyGuildReply = function(msg, session, next) {
  var guildId = session.get('guildId');
  guildService.applyGuildReply(guildId, msg.playerId, msg.reply);
  next();
};

handler.inviteGuild = function(msg, session, next) {
  var inviteeId = msg.playerId;
  var code = guildService.inviteGuild(session, inviteeId);
  next(null, {
    code: code
  });
};

handler.inviteGuildReply = function(msg, session, next) {
  var guildId = msg.guildId;
  guildService.inviteGuildReply(session, guildId);
};

handler.kickGuild = function(msg, session, next) {
  var memberId = msg.playerId;
  var code = guildService.kickGuild(session, memberId);
  next(null, {
    code: code
  });
};

handler.appointGuild = function(msg, session, next) {
  var memberId = msg.playerId;
  var code = guildService.appointGuild(session, memberId);
  next(null, {
    code: code
  });
};

handler.getItems = function(msg, session, next) {
  var guildId = session.get('guildId');
  var itemIds = msg;
  guildService.getItems(guildId, function(err, items) {
    if (err) {
      next(null, {
        code: 124
      });
    } else {
      if (items) {
        var removeIds = [];
        var hasIds = {};
        var itemId, item;
        while (itemIds.length > 0) {
          itemId = itemIds.shift();
          if (items[itemId]) {
            hasIds[itemId] = itemId;
          } else {
            removeIds.push(itemId);
          }
        }
        var addItems = [];
        for (var key in items) {
          if (!hasIds[key]) {
            item = items[key];
            addItems.push({
              itemId: item.itemId,
              kindId: item.kindId,
              kind: item.kind,
              baseValue: item.baseValue,
              potential: item.potential,
              percent: item.percent,
              totalStar: item.totalStar
            });
          }
        }
        var msg = {};
        if (addItems.length > 0) {
          msg[0] = addItems;
        }
        if (removeIds.length > 0) {
          msg[1] = removeIds;
        }
        next(null, msg);

      } else {
        next(null, {
          code: 125
        });
      }
    }
  });
};

handler.clearItems = function(msg, session, next) {
  var guildId = session.get('guildId');
  var itemIds = msg;
  itemIds=guildService.clearItems(guildId,itemIds);
  next(null, itemIds);
};

handler.upgrade = function(msg, session, next) {
  var guildId = session.get('guildId');
  var playerId = session.get('playerId');
  var code = guildService.upgrade(guildId, playerId);
  next(null, {
    code: code
  });
};

handler.recruit=function(msg, session, next) {
  var guildId = session.get('guildId');
  var playerId = session.get('playerId');
  var guild = guildService.getGuild(guildId);
  if (!guild) {
    return;
  }
  var member = guild.getMemberByPlayerId(playerId);
  if (!member) {
    return;
  }
  if (member.jobId === PlaceTypes.CEO) {

    var playerName=session.get('playerName');
    var vip=session.get("vip");

    var msg = {
      playerId:playerId,
      playerName:playerName,
      vip:vip,
      broadId: 123,
      data: []
    };
    msg.data[0] = {
      guildId: guild.id,
      name: guild.name
    };

    handleRemote.chatRemote_pushWorld(session, msg);
    // pomelo.app.rpc.chat.chatRemote.pushWorld(session, msg, function() {});
  }
  next();
};

handler.getDomains = function(msg, session, next) {
  var msg = [];
  var domain;
  var domains = guildService.getDomains();
  for (var key in domains) {
    domain = domains[key];
    msg.push({
      state:domain.state,
      level: domain.level,
      areaId: domain.areaId,
      guildId: domain.guildId,
      guildName: domain.guildName
    });
  }
  next(null, msg);
};

handler.getGuildInfo = function(msg, session, next) {
  var guild = guildService.getGuild(msg.guildId);
  if (guild) {
    next(null, {
      code: 200,
      guildId: guild.id,
      name: guild.name
    });
  }else{
    next(null, {
      code: 201
    });
  }
};

var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var pomelo = require('pomelo');

var dataApi = require('../../../util/dataApi');
var consts = require('../../../consts/consts');
var myBossDao = require('../../../dao/myBossDao');
var MyBoss = require('../../../domain/MyBoss');
var areaService = require('../../../services/areaService');
var channelUtil = require('../../../util/channelUtil');

var handler = module.exports;


handler.getMyBoss = function(msg, session, next) {
  var player = session.player;
  if (player.myBoss) {
    player.myBoss.checkDate();
    next(null, player.myBoss.strip());
  }else{
    myBossDao.getDataByPlayerId(player.id,function(err,myBossData){
      if (err) {
        logger.error("guildRemote.getSalary failed ");
      }else{
        if (myBossData) {
          player.myBoss=new MyBoss(myBossData);
          player.myBoss.checkDate();
          next(null, player.myBoss.strip());
          return;
        }
      }
      next(null, {});
    });
  }
};

handler.inMyBoss = function(msg, session, next) {
  var player = session.player;
  var playerId=session.get('playerId');
  var targetId = msg.targetId;
  if (!player.myBoss) {
    next(null, {
      code: 121
    });
    return;
  }
  var timeskey="times"+MyBoss[targetId];
  if (!player.myBoss[timeskey]) {
    next(null, {
      code: 135
    });
    return;
  }
  
  var area=session.area;
  if (area.areaId === targetId) {
    next(null, {
      code: 136
    });
    return;
  }
  player.myBoss[timeskey]--;
  player.myBoss.save();
  msg.isMyBoss=true;
  areaService.changeArea(msg, session, function(code,instanceId) {
    if (code) {
      if (code == 200) {
        if (area.instanceId) {
          logger.info("bossHandler.inMyBoss   leaveInstance area.instanceId=",area.instanceId);
          pomelo.app.rpc.manager.instanceRemote.leaveInstance(null, {
            playerId: playerId,
            instanceId:instanceId
          },consts.BLACKHOLEFUNC);
        }else{
          pomelo.app.rpc.chat.chatRemote.leave(null, 
                session.uid, 
                channelUtil.getAreaChannelName(area.areaId),
                consts.BLACKHOLEFUNC);
        }
        next(null, {
          code: 200
        });
      } else {
        // player.myBoss[timeskey]++;
        // player.myBoss.save();
        next(null, {
          code: code
        });
      }
    } else {
      //player.myBoss[timeskey]++;
      //player.myBoss.save();
      next(null, {
        code: 201
      });
    }
  });
};




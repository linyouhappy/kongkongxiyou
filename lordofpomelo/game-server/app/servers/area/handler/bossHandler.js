var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var pomelo = require('pomelo');

var dataApi = require('../../../util/dataApi');
var consts = require('../../../consts/consts');
// var myBossDao = require('../../../dao/myBossDao');
var MyBoss = require('../../../domain/myBoss');
// var areaService = require('../../../services/areaService');
// var channelUtil = require('../../../util/channelUtil');
var areaManager;

var handler = module.exports;

handler.getMyBoss = function(msg, session, next) {
  var player = session.player;
  player.getMyBoss(function(err,myBoss){
    if (err || !myBoss) {
      next(null, {});
    }else{
      next(null, myBoss.strip());
    }
  });
};

handler.getWorldBoss=function(msg, session, next) {
  if (!areaManager) {
    areaManager = pomelo.app.areaManager;
  }
  var genTimes =areaManager.getBossGenTimes();
  next(null, genTimes);
};

handler.inMyBoss = function(msg, session, next) {
  var player = session.player;
  var playerId = session.get('playerId');
  var targetId = msg.targetId;
  var area = session.area;
  if (area.areaId === targetId) {
    next(null, {
      code: 136
    });
    return;
  }
  player.getMyBoss(function(err, myBoss) {
    if (err || !myBoss) {
      next(null, {
        code: 121
      });
      return;
    } else {
      var myBossId = MyBoss[targetId];
      var myBossData = dataApi.myboss.findById(myBossId);
      if(!myBossData){
        next(null, {
          code: 121
        });
        return;
      }
      if (player.level < myBossData.needLevel) {
        next(null, {
          code: 150
        });
        return;
      }
      var timeskey = "times" + myBossId;
      var currentTime = Math.floor(Date.now() / 1000);
      if (myBoss[timeskey] > currentTime) {
        next(null, {
          code: 151
        });
        return;
      }
      // myBoss[timeskey] = currentTime + 60 * 60;
      // myBoss.save();

      var args = {
        playerId: playerId,
        area: area,
        player: player,
        targetId: targetId,
        isMyBoss: true
      };
      if (!areaManager) {
        areaManager = pomelo.app.areaManager;
      }
      var code = areaManager.changeArea(args);
      next(null, {
        code: code
      });
    }
  });
};

// handler.getMyBoss = function(msg, session, next) {
//   var player = session.player;
//   if (player.myBoss) {
//     player.myBoss.checkDate();
//     next(null, player.myBoss.strip());
//   }else{
//     myBossDao.getDataByPlayerId(player.id,function(err,myBossData){
//       if (err) {
//         logger.error("guildRemote.getSalary failed ");
//       }else{
//         if (myBossData) {
//           player.myBoss=new MyBoss(myBossData);
//           player.myBoss.checkDate();
//           next(null, player.myBoss.strip());
//           return;
//         }
//       }
//       next(null, {});
//     });
//   }
// };

// handler.inMyBoss = function(msg, session, next) {
//   var player = session.player;
//   var playerId=session.get('playerId');
//   var targetId = msg.targetId;
//   if (!player.myBoss) {
//     next(null, {
//       code: 121
//     });
//     return;
//   }
//   var timeskey="times"+MyBoss[targetId];
//   if (!player.myBoss[timeskey]) {
//     next(null, {
//       code: 135
//     });
//     return;
//   }
  
//   var area=session.area;
//   if (area.areaId === targetId) {
//     next(null, {
//       code: 136
//     });
//     return;
//   }
//   player.myBoss[timeskey]--;
//   player.myBoss.save();

//   var args = {
//     playerId: playerId,
//     area: area,
//     player: player,
//     targetId: targetId,
//     isMyBoss: true
//   };
//   if (!areaManager) {
//     areaManager = pomelo.app.areaManager;
//   }
//   var code = areaManager.changeArea(args);
//   next(null, {
//     code: code
//   });
// };

// handler.inMyBoss = function(msg, session, next) {
//   var player = session.player;
//   var playerId=session.get('playerId');
//   var targetId = msg.targetId;
//   if (!player.myBoss) {
//     next(null, {
//       code: 121
//     });
//     return;
//   }
//   var timeskey="times"+MyBoss[targetId];
//   if (!player.myBoss[timeskey]) {
//     next(null, {
//       code: 135
//     });
//     return;
//   }
  
//   var area=session.area;
//   if (area.areaId === targetId) {
//     next(null, {
//       code: 136
//     });
//     return;
//   }
//   player.myBoss[timeskey]--;
//   player.myBoss.save();
//   msg.isMyBoss=true;
//   areaService.changeArea(msg, session, function(code,instanceId) {
//     if (code) {
//       if (code == 200) {
//         if (area.instanceId) {
//           logger.info("bossHandler.inMyBoss   leaveInstance area.instanceId=",area.instanceId);
//           pomelo.app.rpc.manager.instanceRemote.leaveInstance(null, {
//             playerId: playerId,
//             instanceId:instanceId
//           },consts.BLACKHOLEFUNC);
//         }else{
//           pomelo.app.rpc.chat.chatRemote.leave(null, 
//                 session.uid, 
//                 channelUtil.getAreaChannelName(area.areaId),
//                 consts.BLACKHOLEFUNC);
//         }
//         next(null, {
//           code: 200
//         });
//       } else {
//         // player.myBoss[timeskey]++;
//         // player.myBoss.save();
//         next(null, {
//           code: code
//         });
//       }
//     } else {
//       //player.myBoss[timeskey]++;
//       //player.myBoss.save();
//       next(null, {
//         code: 201
//       });
//     }
//   });
// };




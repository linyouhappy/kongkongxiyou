/**
 * Module dependencies
 */
var messageService = require('../../../domain/messageService');
var fightskillDao = require('../../../dao/fightskillDao');

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var dataApi = require('../../../util/dataApi');
var utils = require('../../../util/utils');

var handler = module.exports;

handler.getAllSkills=function(msg,session,next){
  var player = session.player;
  next(null, player.getFightSkillDatas());
};

//Player  learn skill
handler.learnSkill = function(msg, session, next) {
  var player = session.player;
  var skillId = msg.skillId;
  if (!!player.fightSkills[skillId]) {
    messageService.pushLogTipsToPlayer(player, 34);
    next(null, {
      code: 200,
      skillId: skillId,
      level: player.fightSkills[skillId].level
    });
    return;
  }

  var skillData = dataApi.fightskill.findById(skillId);
  if (player.level < skillData.playerLevel) {
    next(null, {
      code: 35
    });
    return;
  }
  var costCaoCoin=skillData.caoCoin;
  if (player.caoCoin < costCaoCoin) {
    next(null, {
      code: 93
    });
    return;
  }
  player.addCaoCoin(-costCaoCoin);

  player.learnSkill(skillId, function(err) {
    if (!!err) {
      logger.error("handler.learnSkill player.learnSkill");
      next(null, {
        code: 89
      });
      return;
    }
    next(null, {
      code: 200,
      skillId: skillId,
      level: player.fightSkills[skillId].level
    });
  });
};

//Player upgrade skill
handler.upgradeSkill = function(msg, session, next) {
  var player = session.player;
  var skillId = msg.skillId;
  var fightSkill = player.fightSkills[skillId];
  if (!fightSkill) {
    next(null, {
      code: 36
    });
    return;
  }
  if (fightSkill.level>=5) {
    next(null, {
      code: 109
    });
  }
  if (player.level < fightSkill.playerLevel + fightSkill.level * 1) {
    next(null, {
      code: 37
    });
    return;
  }
  // var skillData = dataApi.fightskill.findById(skillId);
  // if (!skillData) {
  //   next(null, {
  //     code: 37
  //   });
  //   return;
  // }
  var costCaoCoin=fightSkill.skillData.caoCoin+fightSkill.level*1000;
  if (player.caoCoin < costCaoCoin) {
    next(null, {
      code: 93
    });
    return;
  }
  player.addCaoCoin(-costCaoCoin);
  // if (player.skillPoint <= 0) {
  //   next(null, {
  //     code: 38
  //   });
  //   return;
  // }

  player.upgradeSkill(skillId);

  next(null, {
    code: 200,
    skillId: skillId,
    level: fightSkill.level
  });
};

handler.equipSkill = function(msg, session, next) {
  var player = session.player;
  var skillId = msg.skillId;
  var position = msg.position;
  var fightSkills = player.fightSkills;
  var fightSkill;
  if (position > 0) {
    for (var key in fightSkills) {
      fightSkill = fightSkills[key];
      if (fightSkill.position === position) {
        fightSkill.position = 0;
        fightskillDao.update(fightSkill);
        // break;
      }
    }
    fightSkill = fightSkills[skillId];
    if (!!fightSkill) {
      fightSkill.position = position;
      fightskillDao.update(fightSkill);

      next(null, {
        code: 200,
        skillId: skillId,
        position: position
      });

    } else {
      next(null, {
        code: 39
      });
    }
  } else {
    fightSkill = fightSkills[skillId];
    if (!!fightSkill) {
      fightSkill.position = 0;
      fightskillDao.update(fightSkill);

      next(null, {
        code: 200,
        skillId: skillId,
        position: 0
      });
    } else {
      next(null, {
        code: 39
      });
    }
  }
};


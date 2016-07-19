var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
var EntityType = consts.EntityType;

var handler = module.exports;

handler.readMail = function(msg, session, next) {
  var player = session.player;
  var mailId = msg.mailId;
  pomelo.app.rpc.chat.chatRemote.readMail(session, player.id, mailId, function(err, code,items) {
    if (err) {
      logger.error("chatRemote.readMail failed ");
      next(null, {
        code: 89
      });
    } else {
      if (code===200 && items) {
        var item;
        for (var i = 0; i < items.length; i++) {
          item=items[i];
          item.jobId=player.jobId;
          player.addItem(item);
        }
      }
      next(null, {
        code: code
      });
    }
  });
};


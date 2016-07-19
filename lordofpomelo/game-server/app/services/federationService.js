var dataApi = require('../util/dataApi');
var utils = require('../util/utils');
var pomelo = require('pomelo');
var consts = require('../consts/consts');
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);
var messageService = require('../domain/messageService');
//var Federation = require('../domain/federation');
var federationDao = require('../dao/federationDao');
var playerFederateDao = require('../dao/playerFederateDao');
var officeDao = require('../dao/officeDao');
var candidateDao = require('../dao/candidateDao');
var handleRemote = require('../consts/handleRemote');

var exp = module.exports;

var _federation;
var _playerFederates;
var _topDonations;
var _topFiveDonations;
var _intervalId;
var _affiches;
var _pushMsgQueue;
var recodeUid = 1;
var _offices;
// var _idToOffices;
var _candidates;
var _pushCandidates;

exp.init = function() {
  _playerFederates = {};
  _affiches=[];
  _pushMsgQueue={};

  setTimeout(function(){
    exp.initFederation();
    exp.initOffices();

    exp.produceTopDonations();
    _intervalId = setInterval(exp.tick,30000);
  },3000);
};

exp.initFederation=function(){
  federationDao.getFederation(function(err, data) {
    if (err || !data) {
      logger.error("ERROR:federationService.initFederation  federationDao.getFederation");
      return;
    }
    delete data["id"];
    _federation = data;
  });
};

exp.initOffices = function() {
  _offices = {};
  _candidates={};

  async.parallel([
      function(callback) {
        officeDao.getAllOffices(function(err, offices) {
          if (err || !offices) {
            logger.error("ERROR:federationService.initOffices officeDao.getAllOffices" + err.stack);
          }
          callback(err, offices);
        });
      },
      function(callback) {
        candidateDao.getAllDatas(function(err, candidates) {
          if (!!err || !candidates) {
            logger.error('ERROR:federationService.initOffices candidateDao.getAllDatas failed! ' + err.stack);
          }
          callback(err, candidates);
        });
      }
    ],
    function(err, results) {
      if (!!err) {
        return;
      }
      var offices = results[0];
      var candidateDatas = results[1];

      var candidateData,candidate;
      for (var i = 0; i < candidateDatas.length; i++) {
        candidateData=candidateDatas[i];
        candidate=_candidates[candidateData.officeId];
        if (!candidate) {
          candidate={};
          _candidates[candidateData.officeId]=candidate;
        }
        candidate[candidateData.playerId]=candidateData;
      }
      exp.producePushCandidates();

      var officeData;
      // var currentTime = Date.now()+10000;
      for (var i = 0; i < offices.length; i++) {
        officeData = offices[i];
        if (officeData) {
          //office = {
          //  name: officeData.name,
          //  kindId: officeData.kindId,
          //  playerId: officeData.playerId,
          //  time: officeData.time,
          //  id: officeData.id
          //};
          // officeData.time=currentTime;
          _offices[officeData.id] = officeData;
        }
      }
    });
};

exp.producePushCandidates = function(officeId) {
  var candidate,value;
  if (!officeId) {
    _pushCandidates={};
    for (var key in _candidates) {
      candidate=_candidates[key];
      _pushCandidates[key]=[];
      for (var subKey in candidate) {
        value=candidate[subKey];
        _pushCandidates[key].push({
          name:value.name,
          kindId:value.kindId,
          playerId:value.playerId,
          voteCount:value.voteCount
        });
      }
    }
  }else{
    candidate=_candidates[officeId];
    _pushCandidates[officeId]=[];
    for (var subKey in candidate) {
      value=candidate[subKey];
      _pushCandidates[officeId].push({
        name:value.name,
        kindId:value.kindId,
        playerId:value.playerId,
        voteCount:value.voteCount
      });
    }
  }
};

exp.pushLogTipsToPlayer=function(playerId,errorCode){
  var playerFederate = _playerFederates[playerId];
  if (playerFederate && playerFederate.uid) {
    messageService.pushLogTipsToPlayer(playerFederate, errorCode);
  }
};

exp.pushCandidate = function(playerFederate,officeId) {
  if (!playerFederate.uid) {
    return;
  }
  var candidate=_pushCandidates[officeId];
  messageService.pushMessageToPlayer(playerFederate, 'onCandidate', candidate);
};

exp.pushOffice = function(playerFederate,office) {
  if (!playerFederate.uid) {
    return;
  }
  messageService.pushMessageToPlayer(playerFederate, 'onOffice', office);
};

exp.abdicate=function(playerId,officeId){
  var office = _offices[officeId];
  if (office.state !== 2 && office.state !== 3) {
    return;
  }

  var playerFederate = _playerFederates[playerId];
  if (!playerFederate || !playerFederate.uid) {
    return;
  }
  office.state = 0;
  office.playerId = 0;
  office.name = "";
  office.kindId = 0;
  office.support = 0;
  office.oppose = 0;
  office.startTime = 0;
  office.time=0;
  saveOfficer(office);

  exp.pushOffice(playerFederate,office);
};

exp.impeach=function(playerId,officeId,voteCount,type){
  var office=_offices[officeId];
  if (office.state<=1) {
    exp.pushLogTipsToPlayer(playerId,102); 
    return;
  }

  var playerFederate = _playerFederates[playerId];
  if (!playerFederate || !playerFederate.uid) {
    return;
  }
  if (playerFederate.voteCount<voteCount) {
    exp.pushLogTipsToPlayer(playerId,103);
    return;
  }
  playerFederate.voteCount-=voteCount;
  savePlayerFederate(playerFederate);

  if (!type) {
    office.oppose+=voteCount;
  }else{
    office.support+=voteCount;
  }
  saveOfficer(office);
  exp.pushOffice(playerFederate,office);
};

exp.voteTicket=function(playerId,officeId,voteCount,voterId){
  var office=_offices[officeId];
  if (office.state!==1) {
    exp.pushLogTipsToPlayer(playerId,101); 
    return;
  }

  var playerFederate = _playerFederates[playerId];
  if (!playerFederate || !playerFederate.uid) {
    return;
  }
  if (playerFederate.voteCount<voteCount) {
    exp.pushLogTipsToPlayer(playerId,103); 
    return;
  }
  var candidate=_candidates[officeId];
  if (candidate && candidate[voterId]) {
    var voter=candidate[voterId];
    voter.voteCount+=voteCount;
    saveCandidate(voter);

    playerFederate.voteCount-=voteCount;
    savePlayerFederate(playerFederate);

    exp.producePushCandidates(officeId);
    exp.pushCandidate(playerFederate,officeId);
  }
};

exp.election=function(officeId,playerId){
  var office=_offices[officeId];
  if (office.state>1) {
    exp.pushLogTipsToPlayer(playerId,101); 
    return;
  }

  var playerFederate = _playerFederates[playerId];
  if (!playerFederate || !playerFederate.uid) {
    return;
  }
  var donation=_topDonations[playerId];
  var officerData=dataApi.officer.findById(officeId);
  if (donation && donation.ranking>officerData.condition) {
    exp.pushLogTipsToPlayer(playerId,98);  
    return;
  }

  for (var key in _offices) {
    if (_offices[key].playerId===playerId) {
      exp.pushLogTipsToPlayer(playerId,97);  
      return;
    }
  }

  var candidate;
  for (var key in _candidates) {
    candidate=_candidates[key];
    for (var subKey in candidate) {
      if (candidate[subKey].playerId===playerId) {
        exp.pushLogTipsToPlayer(playerId,100);
        return;
      }
    }
  }

  candidate=_candidates[officeId];
  if (candidate) {
    var count=0;
    for (var key in candidate) {
      count++;
    }
    if (count>=4) {
      exp.pushLogTipsToPlayer(playerId,99);
      exp.pushCandidate(candidate);
      return;
    }
  }else{
    candidate={};
    _candidates[officeId]=candidate;
  }

  playerFederate.caoCoin=0;
  savePlayerFederate(playerFederate);

  // playerFederate.officeId=officeId;
  var data = {
    playerId: playerId,
    name: playerFederate.name,
    kindId: playerFederate.kindId,
    voteCount: 0,
    officeId: officeId
  };

  candidateDao.create(data,function(err,data){
    if (err) {
      logger.error("ERROR:exp.election candidateDao.create" + err.stack);
    }else{
      candidate[playerId]=data;
      exp.producePushCandidates(officeId);
      exp.pushCandidate(playerFederate,officeId);
      exp.produceTopDonations();

      var office=_offices[officeId];
      if (office.state!==1) {
        office.time=Date.now()+2*60*60000;
        office.state=1;
        saveOfficer(office);

        exp.pushOffice(playerFederate,office);
      }
      var msg = {
        broadId: 110,
        count: 2,
        data: []
      };
      msg.data[0] = {
        playerId: playerId,
        name: data.name
      };
      msg.data[1] = officeId;

      handleRemote.chatRemote_pushMarquee(null, msg);
      // pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function(){});
    }
  });
};

exp.getOffices=function(){
  return _offices;
};

exp.getCandidate=function(officeId){
  var candidate=_pushCandidates[officeId];
  return candidate || [];
};

// exp.getPlayerFederates= function(){
//   return _playerFederates;
// };

exp.addPushQueue = function(playerFederate) {
  if (!playerFederate.uid) return;
  _pushMsgQueue[playerFederate.uid]=playerFederate;
};

exp.removePushQueue=function(uid){
  delete _pushMsgQueue[uid];
}

exp.produceTopDonations = function() {
  playerFederateDao.getTopPlayerFederates(function(err, data) {
    if (err || !data) {
      logger.error("ERROR:federationService.init playerFederateDao.getPlayerFederates");
      return;
    }
    _topDonations = {};
    _topFiveDonations = [];
    var playerFederate, donation;
    for (var i = 0; i < data.length; i++) {
      playerFederate = data[i];
      if (playerFederate.caoCoin===0) {
        continue;
      }
      donation = {
        playerId: playerFederate.playerId,
        kindId: playerFederate.kindId,
        name:playerFederate.name,
        caoCoin: playerFederate.caoCoin,
        ranking:i+1
      };
      if (i < 5) {
        _topFiveDonations.push(donation);
      }
      _topDonations[donation.playerId] = donation;
    }
  });
};

exp.tick = function() {
  exp.produceTopDonations();
  exp.timeToVote();
  exp.newDayVoteCaoCoin();
};

exp.timeToVote = function() {
  var office, currentTime = Date.now();
  for (var key in _offices) {
    office = _offices[key];
    if (currentTime >= office.time) {
      //选举期到任职期
      if (office.state === 1) {
        var theVoter,voter;
        var candidate = _candidates[office.id];
        for (var key in candidate) {
          voter= candidate[key];
          if (!theVoter) {
            theVoter =voter;
          } else {
            if (theVoter.voteCount < voter.voteCount) {
              theVoter = voter;
            }
          }
          deleteCandidate(voter);
        }

        office.state = 2;
        // office.time = Date.now() + 24 * 60 * 60000;
        var date = new Date;
        date.setTime(date.getTime() + 2 * 24 * 60 * 60000);
        date.setHours(20);
        date.setMinutes(0);
        date.setSeconds(0);
        office.time = date.getTime();
        office.startTime=currentTime;

        if (theVoter) {
          _candidates[office.id]={};

          office.playerId=theVoter.playerId;
          office.name=theVoter.name;
          office.kindId=theVoter.kindId;
          saveOfficer(office);

          var msg = {
            broadId: 111,
            count: 2,
            data: []
          };
          msg.data[0] = {
            playerId: office.playerId,
            name: office.name
          };
          msg.data[1] = office.id;

          handleRemote.chatRemote_pushMarquee(null, msg);
          // pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function(){});
          
        } else {
          logger.error("ERROR:exp.timeToVote  theVoter=null office:"+JSON.stringify(office));
        }
        //任职期到弹劾期
      }else if (office.state === 2){
        office.state = 3;
        office.time = Date.now() + 2*60 * 60000;
        saveOfficer(office);

        var msg = {
          broadId: 112,
          count: 2,
          data: []
        };
        msg.data[0] = office.id;
        msg.data[1] = {
          playerId: office.playerId,
          name: office.name
        };

        handleRemote.chatRemote_pushMarquee(null, msg);
        // pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function() {});
      }else if (office.state === 3){
        if (!office.oppose || office.support>office.oppose) {
          office.state = 2;
          office.support=0;
          office.oppose=0;

          var date=new Date;
          date.setTime(date.getTime()+2*24 * 60 * 60000);
          date.setHours(20);
          date.setMinutes(0);
          date.setSeconds(0);
          office.time = date.getTime();

          saveOfficer(office);

          var msg = {
            broadId: 113,
            count: 2,
            data: []
          };
          msg.data[0] = {
            playerId: office.playerId,
            name: office.name
          };
          msg.data[1] = office.id;

          handleRemote.chatRemote_pushMarquee(null, msg);
          // pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function(){});
        }else{
          var msg = {
            broadId: 114,
            count: 2,
            data: []
          };
          msg.data[0] = {
            playerId: office.playerId,
            name: office.name
          };
          msg.data[1] = office.id;

          office.state = 0;
          office.playerId=0;
          office.name="";
          office.kindId=0;
          office.support=0;
          office.oppose=0;
          office.startTime=0;
          saveOfficer(office);

          handleRemote.chatRemote_pushMarquee(null, msg);
          // pomelo.app.rpc.chat.chatRemote.pushMarquee(null, msg, function(){});
        }
      }
    }
  }
};

exp.newDayVoteCaoCoin = function() {
  var d = new Date();
  if (_federation.recordTime !== d.getDate()) {
    _federation.recordTime = d.getDate();

    var voteYCaoCoin = _federation.voteYCaoCoin;
    _federation.voteYCaoCoin = _federation.voteTCaoCoin;
    var leftVoteCaoCoin = _federation.voteCaoCoin - _federation.voteTCaoCoin;
    _federation.voteTCaoCoin = 0;
    if (leftVoteCaoCoin > 50000) {
      if (leftVoteCaoCoin > voteYCaoCoin * 10) {
        if (leftVoteCaoCoin > voteYCaoCoin * 100) {
          _federation.dailyCaoCoin = Math.floor(leftVoteCaoCoin / 500);
        } else {
          _federation.dailyCaoCoin = Math.floor(leftVoteCaoCoin / 5000);
        }
      } else {
        _federation.dailyCaoCoin = Math.floor(leftVoteCaoCoin / 50000);
      }
    } else {
      _federation.dailyCaoCoin = 0;
    }
    saveFederation(_federation);
  }
};

exp.topDonations = function() {
  return _topFiveDonations;
};

exp.getFederation = function() {
  return _federation;
};

exp.pushFederation = function(playerFederate) {
  if (!playerFederate.uid) {
    return;
  }
  playerFederateDao.getRanking(playerFederate, function(err, ranking) {
    if (err) {
      messageService.pushLogTipsToPlayer(playerFederate, 94);
    } else {
      if (!playerFederate.caoCoin) {
        ranking=0;
      }
      playerFederate.ranking = ranking;
      //var federation = exp.getFederation();
      var msg = {
        caoCoin: playerFederate.caoCoin,
        ranking: ranking,
        doCaoCoin: _federation.doCaoCoin,

        receiveTime:playerFederate.receiveTime,
        voteCount: playerFederate.voteCount,
        voteCaoCoin: _federation.voteCaoCoin,
        voteYCaoCoin: _federation.voteYCaoCoin,
        voteTCaoCoin: _federation.voteTCaoCoin,
        dailyCaoCoin: _federation.dailyCaoCoin
      };
      messageService.pushMessageToPlayer(playerFederate, 'onFederation', msg);
    }
  });
};

exp.pushVote = function(playerFederate) {
  if (!playerFederate.uid) {
    return;
  }
  var msg = {
    receiveTime: playerFederate.receiveTime,
    voteCount: playerFederate.voteCount,
    voteCaoCoin: _federation.voteCaoCoin,
    voteYCaoCoin: _federation.voteYCaoCoin,
    voteTCaoCoin: _federation.voteTCaoCoin,
    dailyCaoCoin: _federation.dailyCaoCoin
  };
  messageService.pushMessageToPlayer(playerFederate, 'onVote', msg);
};

exp.getPlayerFederate = function(playerId, cb) {
  var playerFederate = _playerFederates[playerId];
  if (playerFederate) {
    utils.invokeCallback(cb, null, playerFederate);
    return;
  }
  playerFederateDao.getPlayerFederate(playerId, function(err, playerFederate) {
    if (err) {
      utils.invokeCallback(cb, err);
    } else {
      exp.addPlayerFederate(playerFederate);
      utils.invokeCallback(cb, null, playerFederate);
    }
  });
};

exp.addPlayerFederate = function(playerFederate) {
  if (_playerFederates[playerFederate.playerId]) {
    _playerFederates[playerFederate.playerId] = playerFederate;
    logger.warn("addPlayerFederate is exist,playerId=" + playerFederate.playerId);
  } else {
    _playerFederates[playerFederate.playerId] = playerFederate;
  }
};

exp.kick= function(playerId){
  delete _playerFederates[playerId];
};

exp.getAffiches = function(){
  return _affiches;
};

exp.pushAffiche = function(name,caoCoin) {
  _affiches.push({
    id:recodeUid++,
    name: name,
    caoCoin: caoCoin,
    time: Date.now()
  });

  while (_affiches.length > 8) {
      _affiches.shift();
  }
};

exp.donation = function(playerId, caoCoin, cb) {
  var playerFederate = _playerFederates[playerId];
  if (playerFederate) {
    _federation.doCaoCoin += caoCoin;
    playerFederate.caoCoin += caoCoin;

    savePlayerFederate(playerFederate);
    saveFederation(_federation);

    exp.pushFederation(playerFederate);
    exp.pushAffiche(playerFederate.name,caoCoin);

    utils.invokeCallback(cb);
  } else {
    logger.error("ERROR:federationService.donation playerFederate==null");
    utils.invokeCallback(cb, true);
  }
};

exp.buyVote=function(playerId, caoCoin, cb) {
  var playerFederate = _playerFederates[playerId];
  if (playerFederate) {
    var voteCount=Math.floor(caoCoin/100);
    playerFederate.voteCount+=voteCount;
    _federation.voteCaoCoin+=caoCoin;
    _federation.voteTCaoCoin+=caoCoin;
    saveFederation(_federation);
    savePlayerFederate(playerFederate);

    exp.pushVote(playerFederate);

    utils.invokeCallback(cb);
  } else {
    logger.error("ERROR:federationService.buyVote playerFederate==null");
    utils.invokeCallback(cb, true);
  }
};

exp.shareVote=function(playerId, cb){
  var playerFederate = _playerFederates[playerId];
  if (playerFederate) {
    var date=new Date;
    var currentDate=date.getDate();
    var currentMonth=date.getMonth();
    date.setTime(playerFederate.receiveTime);
    if (date.getDate()!==currentDate || date.getMonth()!==currentMonth) {
      if(_federation.dailyCaoCoin===0){
        messageService.pushLogTipsToPlayer(playerFederate, 96);
        utils.invokeCallback(cb,null,0);
      }else{
        // if (_federation.voteCaoCoin>_federation.dailyCaoCoin) {
        //   messageService.pushLogTipsToPlayer(playerFederate, 96);
        //   utils.invokeCallback(cb,null,0);
        //   return;
        // }
        playerFederate.receiveTime=Date.now();
        _federation.voteCaoCoin-=_federation.dailyCaoCoin;
        saveFederation(_federation);
        savePlayerFederate(playerFederate);
        exp.pushVote(playerFederate);
        
        utils.invokeCallback(cb,null,_federation.dailyCaoCoin);
      }
      
    }else{
      messageService.pushLogTipsToPlayer(playerFederate, 95);
      utils.invokeCallback(cb,null,0);
    }

  } else {
    logger.error("ERROR:federationService.shareVote playerFederate==null");
    utils.invokeCallback(cb, true);
  }
};

function deleteCandidate(candidate) {
  candidateDao.destroy(candidate.id || 0);
}

function saveCandidate(candidate) {
  candidateDao.update(candidate);
}

function saveOfficer(office) {
  officeDao.update(office);
}

function savePlayerFederate(playerFederate) {
  if (!playerFederate.receiveTime) {
    playerFederate.receiveTime=0;
  }
  playerFederateDao.update(playerFederate);
}

function saveFederation(federation) {
  federationDao.update(federation);
}
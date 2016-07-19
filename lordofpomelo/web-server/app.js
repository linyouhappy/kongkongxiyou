var express = require('express');
var Token = require('../shared/token');
var secret = require('../shared/config/session').secret;
var userDao = require('./lib/dao/userDao');
var app = express.createServer();
var mysql = require('./lib/dao/mysql/mysql');
var everyauth = require('./lib/oauth');
var fs = require('fs');
var publicPath = __dirname + '/public';
var os = require('os');

app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "keyboard cat"
  }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');
  app.set('view options', {
    layout: false
  });
  app.set('basepath', publicPath);
});

app.configure('development', function() {
  app.use(express.static(publicPath));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  var oneYear = 31557600000;
  app.use(express.static(publicPath, {
    maxAge: oneYear
  }));
  app.use(express.errorHandler());
});

app.get('/auth_success', function(req, res) {
  if (req.session.userId) {
    var token = Token.create(req.session.userId, Date.now(), secret);
    res.render('auth', {
      code: 200,
      token: token,
      uid: req.session.userId
    });
  } else {
    res.render('auth', {
      code: 500
    });
  }
});

app.post('/login', function(req, res) {
  var msg = req.body;
  console.log('/login msg:%j', msg);

  var username = msg.username;
  var password = msg.password;
  // var channel=msg.channel;
  // var model=msg.model;
  if (!username || !password) {
    res.send({
      code: 500
    });
    return;
  }

  userDao.getUserByName(username, function(err, user) {
    if (err) {
      console.log('获取玩家数据出错! err:%j', err);
      res.send({
        code: 500
      });
      return;
    }
    if (!user) {
      console.log('username not exist,create user!');
      userDao.createUser(msg, function(err, user) {
        if (err || !user) {
          console.error(err);
          if (err && err.code === 1062) {
            res.send({
              code: 501
            });
          } else {
            res.send({
              code: 500
            });
          }
        } else {
          console.log('A new user was created! --' + msg.name);
          res.send({
            code: 200,
            token: Token.create(user.id, Date.now(), secret),
            uid: user.id
          });
        }
      });
      // res.send({
      //   code: 501
      // });
      return;
    }

    if (password !== user.password) {
      // TODO code
      console.log('password incorrect!');
      res.send({
        code: 502
      });
      return;
    }

    console.log(username + ' login!');
    res.send({
      code: 200,
      token: Token.create(user.id, Date.now(), secret),
      uid: user.id
    });
  });
});

app.post('/register', function(req, res) {
  var msg = req.body;
  console.log('/register msg:%j', msg);
  if (!msg.username || !msg.password) {
    res.send({
      code: 500
    });
    return;
  }

  userDao.createUser(msg.username, msg.password, '', function(err, user) {
    if (err || !user) {
      console.error(err);
      if (err && err.code === 1062) {
        res.send({
          code: 501
        });
      } else {
        res.send({
          code: 500
        });
      }
    } else {
      console.log('A new user was created! --' + msg.name);
      res.send({
        code: 200,
        token: Token.create(user.id, Date.now(), secret),
        uid: user.id
      });
    }
  });
});

var updateJsonPath = publicPath + "/res/update.json";

function getUpdateVersionInfo(appVer, resVer) {
  var updateVersionInfo = {};

  var content = fs.readFileSync(updateJsonPath, 'utf-8');
  var updateVersionInfos = JSON.parse(content);

  updateVersionInfo.ver = updateVersionInfos.appVer;
  if (updateVersionInfos.appVer === appVer) {
    //need update
    if (resVer <= updateVersionInfos.maxResVer) {
      var resVerKey = "res" + resVer;
      var resVerInfo = updateVersionInfos[resVerKey];
      if (!resVerInfo) {
        resVerKey = "res" + updateVersionInfos.minResVer;
        resVerInfo = updateVersionInfos[resVerKey];
      }
      updateVersionInfo.file = resVerInfo;
      updateVersionInfo.file.type = "file";

      updateVersionInfo.force = updateVersionInfos.force;
      // updateVersionInfo.data=updateVersionInfos.data;
      // updateVersionInfo.data.type="data";
      updateVersionInfo.res = updateVersionInfos.maxResVer + 1;
    } else {
      var resVerKey = "res" + updateVersionInfos.maxResVer;
      var resVerInfo = updateVersionInfos[resVerKey];
      if (resVerInfo) {
        updateVersionInfo.file = resVerInfo;
        updateVersionInfo.file.type = "file";
      }
      //do not need update
      updateVersionInfo.res = resVer;
    }
  } else {
    updateVersionInfo.res = -1;
  }
  return updateVersionInfo;
}

var localIps = function() {
  var ifaces = os.networkInterfaces();
  var ips = [];
  var func = function(details) {
    if (details.family === 'IPv4') {
      ips.push(details.address);
    }
  };
  for (var dev in ifaces) {
    ifaces[dev].forEach(func);
  }
  return ips;
}();

for (var i = 0; i < localIps.length; i++) {
  if (localIps[i] !== "127.0.0.1") {
    app.serverId = localIps[i];
  }
}

if (!app.serverId)
  app.serverId = "127.0.0.1";

function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};

app.get('/update', function(req, res) {
  var ver = req.query["ver"];
  var appVer = Math.floor(ver / 100);
  var resVer = ver % 100;

  console.log("");
  console.log("==========>>>");
  console.log("req IP="+getClientIp(req));
  console.log("appVer="+appVer+",resVer="+resVer);

  var os = req.query["os"];
  if (os) {
    var response = '<?xml version="1.0" encoding="utf-8"?>';
    var headString = '<root ver="' + appVer + '" force="-1" res="' + resVer + '" >';
    response+=headString+'</root>';
    res.send(response);
    console.log("response="+response);
    return;
  }

  var updateVersionInfo = getUpdateVersionInfo(appVer, resVer);

  var response = '<?xml version="1.0" encoding="utf-8"?>';
  updateVersionInfo.force = updateVersionInfo.force || 0;
  var headString = '<root ver="' + updateVersionInfo.ver + '" force="' + updateVersionInfo.force + '" url="' + "http://" + app.serverId + ":3001/res" + '" res="' + updateVersionInfo.res + '" >';

  var fileString = "";
  var file = updateVersionInfo.file;
  if (file) {
    fileString = '<f t="' + file.type + '" s="' + file.s + '" m="' + file.m + '" f="' + file.f + '" />';
  }

  var dataString = "";
  // var data=updateVersionInfo.data;
  // if(data){
  //   dataString='<f t="'+data.type+'" s="'+data.s+'" m="'+data.m+'" f="'+data.f+'" />';
  // }

  response = response + headString + fileString + dataString + '</root>';
  res.send(response);
  console.log("response="+response);
  
});


app.post('/payCodeMi', function(req, res) {
  var msg = req.body;
  console.log('payCodeMi post msg:%j', msg);
});

app.get('/payCodeMi', function(req, res) {
  console.log('payCodeMi=========>>get');
  var query = req.query;
  for (var key in query) {
    console.log(key+"="+query[key]);
  }
});

//Init mysql
mysql.init();

app.listen(3001);

// Uncaught exception handler
process.on('uncaughtException', function(err) {
  console.error(' Caught exception: ' + err.stack);
});

console.log("Web server has started.\n Please log on http://127.0.0.1:3001/");
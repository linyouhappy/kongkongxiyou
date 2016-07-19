var mysql = require('./mysql/mysql');
var userDao = module.exports;

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
userDao.getUserByName = function (username, cb){
  var sql = 'select * from  User where name = ?';
  var args = [username];
  mysql.query(sql,args,function(err, res){
    if(err !== null){
      cb(err.message, null);
    } else {
      if (!!res && res.length === 1) {
        var rs = res[0];
        var user = {id: rs.id, name: rs.name, password: rs.password, from: rs.from};
        cb(null, user);
      } else {
        cb(null, null);
      }
    }
  });
};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createUser = function (userInfo, cb){
  var sql = 'insert into User (name,password,channel,model,loginCount,lastLoginTime) values(?,?,?,?,?,?)';
  var loginTime = Date.now();
  var args = [userInfo.username, userInfo.password, userInfo.channel,userInfo.model, 1, loginTime];
  mysql.insert(sql, args, function(err,res){
    if(err !== null){
      cb({code: err.number, msg: err.message}, null);
    } else {
      var userId = res.insertId;
      var user = {id: res.insertId, name: userInfo.username, password: userInfo.username, loginCount: 1, lastLoginTime:loginTime};
      cb(null, user);
    }
  });
};




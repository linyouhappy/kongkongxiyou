module.exports = {
  updateEquipment:function(dbclient, val, cb) {
    var sql = 'update Equipment set playerId=?, kindId=?, name=?, position=?, kind=?, baseValue=?, potential=?, percent=?, totalStar=?, star1=?, star2=?, star3=?, star4=?, star5=?, star6=?, star7=?, star8=?, star9=?, star10=?, star11=?, star12=? where id = ?';
    var args = [val.playerId, val.kindId, val.name, val.position, val.kind, val.baseValue, val.potential, val.percent, val.totalStar, val.star1, val.star2,val.star3,val.star4,val.star5,val.star6,val.star7,val.star8,val.star9,val.star10,val.star11,val.star12, val.id];

    dbclient.query(sql, args, function(err, res) {
      if (err) {
        console.error('write mysql failed!　' + sql + ' ' + JSON.stringify(val));
      }
      if(!!cb && typeof cb == 'function') {
        cb(!!err);
      }
    });
  }

};

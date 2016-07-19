var Area = require('./area');

var Instance = function(map,instanceId){
  this.id = instanceId;
  this.area = new Area(map,instanceId);
  this.lifeTime = 1800000;
};

module.exports = Instance;

Instance.prototype.start = function(){
  this.area.start();
};

Instance.prototype.close = function(){
  this.area.close();
};

Instance.prototype.getArea = function(){
  return this.area;
};

Instance.prototype.removePlayerByUid=function(uid){
  this.area.removePlayerByUid(uid);
};

Instance.prototype.isAlive = function(){
  if(this.area.isEmpty()){
    if((Date.now() - this.area.emptyTime) > this.lifeTime){
      return false;
    }
  }
  return true;
};


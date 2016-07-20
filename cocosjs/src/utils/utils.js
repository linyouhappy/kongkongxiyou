
utils={
    distance:function(sx, sy, ex, ey) {
      var dx = ex - sx;
      var dy = ey - sy;
      return Math.sqrt(dx * dx + dy * dy);
    },

    totalDistance:function(path) {
        if(!path || path.length < 2) {
          return 0;
        }
        var distance = 0;
        for(var i=0, l=path.length-1; i<l; i++) {
          distance += utils.distance(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
        }
        return distance;
    },

    pathAmend:function(sprite, path) {
        var position = sprite.getPosition();
        path[0] = {
            x: position.x,
            y: position.y
        };
        if (path.length > 2) {
            path.splice(1, 1);
        }
        return path;
    },

    getPoolName:function(kindId, name) {
        return kindId + '_' + name;
    },

    invokeCallback:function(cb) {
      if(cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
      }
    },

    calculateDirection:function(x1, y1, x2, y2) {
      var distX = x2 - x1;
      var distY = y2 - y1;
      var distance=Math.sqrt(distX*distX+distY*distY);

      var sinValue=distY/distance;
      var directionId=5;
      if (distY>0) {
        if (distX>=0) {
          if(sinValue<0.3826){
            directionId=3;
          }else if (sinValue<0.9238) {
            directionId=2;
          }else{
            directionId=1;
          }
        }else{
          if(sinValue<0.3826){
            directionId=7;
          }else if (sinValue<0.9238) {
            directionId=8;
          }else{
            directionId=1;
          }
        }
      }else{
        sinValue=Math.abs(sinValue);
        if (distX>=0) {
          if(sinValue<0.3826){
            directionId=3;
          }else if (sinValue<0.9238) {
            directionId=4;
          }else{
            directionId=5;
          }
        }else{
          if(sinValue<0.3826){
            directionId=7;
          }else if (sinValue<0.9238) {
            directionId=6;
          }else{
            directionId=5;
          }
        }
      }
      return directionId;
    },

    clone:function(origin) {
      if(!origin) {
          return;
      }

      var obj = {};
      for(var f in origin) {
          if(origin.hasOwnProperty(f)) {
              obj[f] = origin[f];
          }
      }
      return obj;
    },

    buildEntity:function(type, data){
      var entity = {};

      var index = type;
      if(type === 'mob' || type === 'player'){
        index = 'character';
      }
      if(!!dataApi[index]){
        entity = this.clone(dataApi[index].findById(data.kindId));
      }else{
        return null;
      }

      for(var key in data){
        entity[key] = data[key];
      }

      entity.type = type;
      return entity;
    },

    buildItem:function(type, data){
      var item;
      var api;

      if(type === 'item'){
        item = Utils.clone(dataApi.item.findById(data.kindId));
      }else{
        item = Utils.clone(dataApi.equipment.findById(data.kindId));
      }

      item.x = data.x;
      item.y = data.y;
      item.entityId = data.entityId;
      item.playerId = data.playerId;
      item.type = data.type;

      return item;
    }
};



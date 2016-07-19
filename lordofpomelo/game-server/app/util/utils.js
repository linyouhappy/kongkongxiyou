var utils = module.exports;

// control variable of func "myPrint"
//var isPrintFlag = false;
var isPrintFlag = true;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb) {
  if (!!cb && typeof cb === 'function') {
    cb.apply(null, Array.prototype.slice.call(arguments, 1));
  }
};

/**
 * clone an object
 */
utils.clone = function(origin) {
  if (!origin) {
    return;
  }

  var obj = {};
  for (var f in origin) {
    if (origin.hasOwnProperty(f)) {
      obj[f] = origin[f];
    }
  }
  return obj;
};

utils.size = function(obj) {
  if (!obj) {
    return 0;
  }

  var size = 0;
  for (var f in obj) {
    if (obj.hasOwnProperty(f)) {
      size++;
    }
  }

  return size;
};

utils.calDirection = function(x1, y1, x2, y2) {
  var distX = x2 - x1;
  var distY = y2 - y1;
  var distance = Math.sqrt(distX * distX + distY * distY);

  var sinValue = distY / distance;
  var directionId = 5;
  if (distY > 0) {
    if (distX >= 0) {
      if (sinValue < 0.3826) {
        directionId = 3;
      } else if (sinValue < 0.9238) {
        directionId = 2;
      } else {
        directionId = 1;
      }
    } else {
      if (sinValue < 0.3826) {
        directionId = 7;
      } else if (sinValue < 0.9238) {
        directionId = 8;
      } else {
        directionId = 1;
      }
    }
  } else {
    sinValue = Math.abs(sinValue);
    if (distX >= 0) {
      if (sinValue < 0.3826) {
        directionId = 3;
      } else if (sinValue < 0.9238) {
        directionId = 4;
      } else {
        directionId = 5;
      }
    } else {
      if (sinValue < 0.3826) {
        directionId = 7;
      } else if (sinValue < 0.9238) {
        directionId = 6;
      } else {
        directionId = 5;
      }
    }
  }
  return directionId;
};

// print the file name and the line number ~ begin
function getStack() {
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack) {
    return stack;
  };
  var err = new Error();
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}

function getFileName(stack) {
  return stack[1].getFileName();
}

function getLineNumber(stack) {
  return stack[1].getLineNumber();
}

// utils.convertEntitys2Client = function(entities) {
//   var resEntities = {};
//   resEntities.length = 0;
//   var entity = null;
//   //npc
//   if (!!entities.npc) {
//     resEntities.npc = [];
//     for (var i = 0; i < entities.npc.length; i++) {
//       entity = entities.npc[i].strip();
//       resEntities.npc.push(entity);
//       resEntities.length++;
//     };
//   }
//   //mob
//   if (!!entities.mob) {
//     resEntities.mob = [];
//     for (var i = 0; i < entities.mob.length; i++) {
//       entity = entities.mob[i].strip();
//       resEntities.mob.push(entity);
//       resEntities.length++;
//     };
//   }
//   //item
//   if (!!entities.item) {
//     resEntities.item = [];
//     for (var i = 0; i < entities.item.length; i++) {
//       entity = entities.item[i].strip();
//       resEntities.item.push(entity);
//       resEntities.length++;
//     };
//   }
//   //item
//   if (!!entities.euipment) {
//     resEntities.euipment = [];
//     for (var i = 0; i < entities.euipment.length; i++) {
//       entity = entities.euipment[i].strip();
//       resEntities.euipment.push(entity);
//       resEntities.length++;
//     };
//   }
//   //player
//   if (!!entities.player) {
//     resEntities.player = [];
//     for (var i = 0; i < entities.player.length; i++) {
//       entity = entities.player[i].strip();
//       resEntities.player.push(entity);
//       resEntities.length++;
//     };
//   }
//   return resEntities;
// };

utils.myPrint = function() {
  if (isPrintFlag) {
    var len = arguments.length;
    if (len <= 0) {
      return;
    }
    var stack = getStack();
    var aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
    for (var i = 0; i < len; ++i) {
      aimStr += arguments[i] + ' ';
    }
    console.log('\n' + aimStr);
  }
};
// print the file name and the line number ~ end
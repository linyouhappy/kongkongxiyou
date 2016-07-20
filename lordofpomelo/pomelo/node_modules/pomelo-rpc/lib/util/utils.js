var exp = module.exports;

exp.invokeCallback = function(cb) {
  if(typeof cb === 'function') {
    cb.apply(null, Array.prototype.slice.call(arguments, 1));
  }
};

exp.applyCallback = function(cb, args) {
  if(typeof cb === 'function') {
    cb.apply(null, args);
  }
};

exp.getObjectClass = function (obj) {
	if (obj && obj.constructor && obj.constructor.toString()) {
		if(obj.constructor.name) {
			return obj.constructor.name;
		}
		var str = obj.constructor.toString();
		if(str.charAt(0) == '[') {
			var arr = str.match(/\[\w+\s*(\w+)\]/);
		} else {
			var arr = str.match(/function\s*(\w+)/);
		}
		if (arr && arr.length == 2) {
			return arr[1];
		}
	}
	return undefined;	
};

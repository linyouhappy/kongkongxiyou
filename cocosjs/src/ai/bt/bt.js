var bt={};

bt.RES_SUCCESS = 0;
bt.RES_FAIL = 1;
bt.RES_WAIT = 2;

var util=util || {};
if (typeof Object.create === 'function') {
	// implementation from standard node.js 'util' module
	util.inherits = function (ctor, superCtor) {
		ctor.super_ = superCtor
		ctor.prototype = Object.create(superCtor.prototype, {
			constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	};
} else {
	// old school shim for old browsers
	util.inherits=function(ctor, superCtor) {
		ctor.super_ = superCtor
		var TempCtor = function() {}
		TempCtor.prototype = superCtor.prototype
		ctor.prototype = new TempCtor()
		ctor.prototype.constructor = ctor
	}
}

require('src/ai/bt/node.js');
require('src/ai/bt/condition.js');
require('src/ai/bt/composite.js');
require('src/ai/bt/decorator.js');
require('src/ai/bt/loop.js');
require('src/ai/bt/parallel.js');
require('src/ai/bt/select.js');
require('src/ai/bt/sequence.js');
require('src/ai/bt/if.js');

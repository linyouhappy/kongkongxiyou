var protobuf = require('../lib/protobuf');
var util = require('../lib/util');

var protos = require('protos.json');

protobuf.init({
	encoderProtos: protos,
	decoderProtos: protos
});

describe('encodeTest', function() {
	for (var route in tc) {
		var msg = tc[route];
		var buffer = protobuf.encode(route, msg);

		console.log(msg);
		console.log(buffer.length);
		console.log(buffer)

		var decodeMsg = protobuf.decode(route, buffer);

		console.log(decodeMsg);

		util.equal(msg, decodeMsg).should.equal(true);
	}
});
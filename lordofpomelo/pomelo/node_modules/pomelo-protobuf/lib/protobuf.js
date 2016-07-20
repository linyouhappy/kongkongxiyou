var encoder = require('./encoder');
var decoder = require('./decoder');
var parser = require('./parser');

var Protobuf = module.exports;

/**
 * [encode the given message, return a Buffer represent the message encoded by protobuf]
 * @param  {[type]} key The key to identify the message type.
 * @param  {[type]} msg The message body, a js object.
 * @return {[type]} The binary encode result in a Buffer.
 */
Protobuf.encode = function(key, msg){
	return encoder.encode(key, msg);
};

Protobuf.encode2Bytes = function(key, msg){
	var buffer = this.encode(key, msg);
	if(!buffer || !buffer.length){
		console.warn('encode msg failed! key : %j, msg : %j', key, msg);
		return null;
	}
	var bytes = new Uint8Array(buffer.length);
	for(var offset = 0; offset < buffer.length; offset++){
		bytes[offset] = buffer.readUInt8(offset);
	}

	return bytes;
};

Protobuf.encodeStr = function(key, msg, code){
	code = code || 'base64';
	var buffer = Protobuf.encode(key, msg);
	return !!buffer?buffer.toString(code):buffer;
};

Protobuf.decode = function(key, msg){
	return decoder.decode(key, msg);
};

Protobuf.decodeStr = function(key, str, code){
	code = code || 'base64';
	var buffer = new Buffer(str, code);

	return !!buffer?Protobuf.decode(key, buffer):buffer;
};

Protobuf.parse = function(json){
	return parser.parse(json);
};

Protobuf.setEncoderProtos = function(protos){
	encoder.init(protos);
};

Protobuf.setDecoderProtos = function(protos){
	decoder.init(protos);
};

Protobuf.init = function(opts){
	//On the serverside, use serverProtos to encode messages send to client
	encoder.init(opts.encoderProtos);

	//On the serverside, user clientProtos to decode messages receive from clients
	decoder.init(opts.decoderProtos);

};
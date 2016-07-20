var codec = require('./codec');
var util = require('./util');

var Decoder = module.exports;

var buffer;
var offset = 0;

Decoder.init = function(protos){
	this.protos = protos || {};
};

Decoder.setProtos = function(protos){
	if(!!protos){
		this.protos = protos;
	}
};

Decoder.decode = function(route, buf){
	var protos = this.protos[route];

	buffer = buf;
	offset = 0;

	if(!!protos){
		return decodeMsg({}, protos, buffer.length);
	}

	return null;
};

function decodeMsg(msg, protos, length){
	while(offset<length){
		var head = getHead();
		var type = head.type;
		var tag = head.tag;
		var name = protos.__tags[tag];

		switch(protos[name].option){
			case 'optional' :
			case 'required' :
				msg[name] = decodeProp(protos[name].type, protos);
			break;
			case 'repeated' :
				if(!msg[name]){
					msg[name] = [];
				}
				decodeArray(msg[name], protos[name].type, protos);
			break;
		}
	}

	return msg;
}

/**
 * Test if the given msg is finished
 */
function isFinish(msg, protos){
	return (!protos.__tags[peekHead().tag]);
}
/**
 * Get property head from protobuf
 */
function getHead(){
	var tag = codec.decodeUInt32(getBytes());

	return {
		type : tag&0x7,
		tag	: tag>>3
	};
}

/**
 * Get tag head without move the offset
 */
function peekHead(){
	var tag = codec.decodeUInt32(peekBytes());

	return {
		type : tag&0x7,
		tag	: tag>>3
	};
}

function decodeProp(type, protos){
	switch(type){
		case 'uInt32':
			return codec.decodeUInt32(getBytes());
		case 'int32' :
		case 'sInt32' :
			return codec.decodeSInt32(getBytes());
		case 'float' :
			var float = buffer.readFloatLE(offset);
			offset += 4;
			return float;
		case 'double' :
			var double = buffer.readDoubleLE(offset);
			offset += 8;
			return double;
		case 'string' :
			var length = codec.decodeUInt32(getBytes());

			var str =  buffer.toString('utf8', offset, offset+length);
			offset += length;

			return str;
		default :
			var message = protos && (protos.__messages[type] || Decoder.protos['message ' + type]);
			if(message){
				var length = codec.decodeUInt32(getBytes());
				var msg = {};
				decodeMsg(msg, message, offset+length);
				return msg;
			}
		break;
	}
}

function decodeArray(array, type, protos){
	if(util.isSimpleType(type)){
		var length = codec.decodeUInt32(getBytes());

		for(var i = 0; i < length; i++){
			array.push(decodeProp(type));
		}
	}else{
		array.push(decodeProp(type, protos));
	}
}

function getBytes(flag){
	var bytes = [];
	var pos = offset;
	flag = flag || false;

	var b;
	do{
		var b = buffer.readUInt8(pos);
		bytes.push(b);
		pos++;
	}while(b >= 128);

	if(!flag){
		offset = pos;
	}
	return bytes;
}

function peekBytes(){
	return getBytes(true);
}
(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n ? n : e)
      }, l, l.exports, e, t, n, r)
    }
    return n[o].exports
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s
})({
  1: [function(require, module, exports) {
    var Util = require('util');

    function checkCocos2dJsb() {
      if (typeof cc !== 'undefined' && cc && cc.sys && cc.sys.isNative) {
        return true;
      }

      return false;
    }

    var Root;
    (function() {
      Root = this;
    }());

    if (checkCocos2dJsb()) {
      var console = cc;
      Root.console = console;
      cc.formatStr = Util.format;
    }

    var EventEmitter = require('events').EventEmitter;
    Root.EventEmitter = EventEmitter;
    var protobuf = require('pomelo-protobuf');
    Root.protobuf = protobuf;
    var Protocol = require('pomelo-protocol');
    Root.Protocol = Protocol;
    var pomelo = require('pomelo-jsclient-websocket');
    Root.pomelo = pomelo;
  }, {
    "events": 6,
    "pomelo-jsclient-websocket": 11,
    "pomelo-protobuf": 17,
    "pomelo-protocol": 19,
    "util": 10
  }],
  2: [function(require, module, exports) {
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */

    var base64 = require('base64-js')
    var ieee754 = require('ieee754')
    var isArray = require('is-array')

    exports.Buffer = Buffer
    exports.SlowBuffer = SlowBuffer
    exports.INSPECT_MAX_BYTES = 50
    Buffer.poolSize = 8192 // not used by this implementation

    var kMaxLength = 0x3fffffff
    var rootParent = {}

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Note:
     *
     * - Implementation must support adding new properties to `Uint8Array` instances.
     *   Firefox 4-29 lacked support, fixed in Firefox 30+.
     *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *    incorrect length in some situations.
     *
     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
     * get the Object implementation, which is slower but will work correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = (function() {
      try {
        var buf = new ArrayBuffer(0)
        var arr = new Uint8Array(buf)
        arr.foo = function() {
          return 42
        }
        return arr.foo() === 42 && // typed array instances can be augmented
          typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
          new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
      } catch (e) {
        return false
      }
    })()

    /**
     * Class: Buffer
     * =============
     *
     * The Buffer constructor returns instances of `Uint8Array` that are augmented
     * with function properties for all the node `Buffer` API functions. We use
     * `Uint8Array` so that square bracket notation works as expected -- it returns
     * a single octet.
     *
     * By augmenting the instances, we can avoid modifying the `Uint8Array`
     * prototype.
     */
    function Buffer(subject, encoding) {
      var self = this
      if (!(self instanceof Buffer)) return new Buffer(subject, encoding)

      var type = typeof subject
      var length

      if (type === 'number') {
        length = +subject
      } else if (type === 'string') {
        length = Buffer.byteLength(subject, encoding)
      } else if (type === 'object' && subject !== null) {
        // assume object is array-like
        if (subject.type === 'Buffer' && isArray(subject.data)) subject = subject.data
        length = +subject.length
      } else {
        throw new TypeError('must start with number, buffer, array or string')
      }

      if (length > kMaxLength) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum size: 0x' +
          kMaxLength.toString(16) + ' bytes')
      }

      if (length < 0) length = 0
      else length >>>= 0 // coerce to uint32

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Preferred: Return an augmented `Uint8Array` instance for best performance
        self = Buffer._augment(new Uint8Array(length)) // eslint-disable-line consistent-this
      } else {
        // Fallback: Return THIS instance of Buffer (created by `new`)
        self.length = length
        self._isBuffer = true
      }

      var i
      if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
        // Speed optimization -- use set if we're copying from a typed array
        self._set(subject)
      } else if (isArrayish(subject)) {
        // Treat array-ish objects as a byte array
        if (Buffer.isBuffer(subject)) {
          for (i = 0; i < length; i++) {
            self[i] = subject.readUInt8(i)
          }
        } else {
          for (i = 0; i < length; i++) {
            self[i] = ((subject[i] % 256) + 256) % 256
          }
        }
      } else if (type === 'string') {
        self.write(subject, 0, encoding)
      } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT) {
        for (i = 0; i < length; i++) {
          self[i] = 0
        }
      }

      if (length > 0 && length <= Buffer.poolSize) self.parent = rootParent

      return self
    }

    function SlowBuffer(subject, encoding) {
      if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

      var buf = new Buffer(subject, encoding)
      delete buf.parent
      return buf
    }

    Buffer.isBuffer = function isBuffer(b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.compare = function compare(a, b) {
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length
      var y = b.length
      for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
      if (i !== len) {
        x = a[i]
        y = b[i]
      }
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }

    Buffer.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'binary':
        case 'base64':
        case 'raw':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    }

    Buffer.concat = function concat(list, totalLength) {
      if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

      if (list.length === 0) {
        return new Buffer(0)
      } else if (list.length === 1) {
        return list[0]
      }

      var i
      if (totalLength === undefined) {
        totalLength = 0
        for (i = 0; i < list.length; i++) {
          totalLength += list[i].length
        }
      }

      var buf = new Buffer(totalLength)
      var pos = 0
      for (i = 0; i < list.length; i++) {
        var item = list[i]
        item.copy(buf, pos)
        pos += item.length
      }
      return buf
    }

    Buffer.byteLength = function byteLength(str, encoding) {
      var ret
      str = str + ''
      switch (encoding || 'utf8') {
        case 'ascii':
        case 'binary':
        case 'raw':
          ret = str.length
          break
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          ret = str.length * 2
          break
        case 'hex':
          ret = str.length >>> 1
          break
        case 'utf8':
        case 'utf-8':
          ret = utf8ToBytes(str).length
          break
        case 'base64':
          ret = base64ToBytes(str).length
          break
        default:
          ret = str.length
      }
      return ret
    }

    // pre-set for values that may exist in the future
    Buffer.prototype.length = undefined
    Buffer.prototype.parent = undefined

    // toString(encoding, start=0, end=buffer.length)
    Buffer.prototype.toString = function toString(encoding, start, end) {
      var loweredCase = false

      start = start >>> 0
      end = end === undefined || end === Infinity ? this.length : end >>> 0

      if (!encoding) encoding = 'utf8'
      if (start < 0) start = 0
      if (end > this.length) end = this.length
      if (end <= start) return ''

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'binary':
            return binarySlice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase()
            loweredCase = true
        }
      }
    }

    Buffer.prototype.equals = function equals(b) {
      if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    }

    Buffer.prototype.inspect = function inspect() {
      var str = ''
      var max = exports.INSPECT_MAX_BYTES
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
        if (this.length > max) str += ' ... '
      }
      return '<Buffer ' + str + '>'
    }

    Buffer.prototype.compare = function compare(b) {
      if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return 0
      return Buffer.compare(this, b)
    }

    Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
      if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
      else if (byteOffset < -0x80000000) byteOffset = -0x80000000
      byteOffset >>= 0

      if (this.length === 0) return -1
      if (byteOffset >= this.length) return -1

      // Negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

      if (typeof val === 'string') {
        if (val.length === 0) return -1 // special case: looking for empty string always fails
        return String.prototype.indexOf.call(this, val, byteOffset)
      }
      if (Buffer.isBuffer(val)) {
        return arrayIndexOf(this, val, byteOffset)
      }
      if (typeof val === 'number') {
        if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
          return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
        }
        return arrayIndexOf(this, [val], byteOffset)
      }

      function arrayIndexOf(arr, val, byteOffset) {
        var foundIndex = -1
        for (var i = 0; byteOffset + i < arr.length; i++) {
          if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
            if (foundIndex === -1) foundIndex = i
            if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
          } else {
            foundIndex = -1
          }
        }
        return -1
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    // `get` will be removed in Node 0.13+
    Buffer.prototype.get = function get(offset) {
      console.log('.get() is deprecated. Access using array indexes instead.')
      return this.readUInt8(offset)
    }

    // `set` will be removed in Node 0.13+
    Buffer.prototype.set = function set(v, offset) {
      console.log('.set() is deprecated. Access using array indexes instead.')
      return this.writeUInt8(v, offset)
    }

    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0
      var remaining = buf.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }

      // must be an even number of digits
      var strLen = string.length
      if (strLen % 2 !== 0) throw new Error('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2
      }
      for (var i = 0; i < length; i++) {
        var parsed = parseInt(string.substr(i * 2, 2), 16)
        if (isNaN(parsed)) throw new Error('Invalid hex string')
        buf[offset + i] = parsed
      }
      return i
    }

    function utf8Write(buf, string, offset, length) {
      var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
      return charsWritten
    }

    function asciiWrite(buf, string, offset, length) {
      var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
      return charsWritten
    }

    function binaryWrite(buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write(buf, string, offset, length) {
      var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
      return charsWritten
    }

    function utf16leWrite(buf, string, offset, length) {
      var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
      return charsWritten
    }

    Buffer.prototype.write = function write(string, offset, length, encoding) {
      // Support both (string, offset, length, encoding)
      // and the legacy (string, encoding, offset, length)
      if (isFinite(offset)) {
        if (!isFinite(length)) {
          encoding = length
          length = undefined
        }
      } else { // legacy
        var swap = encoding
        encoding = offset
        offset = length
        length = swap
      }

      offset = Number(offset) || 0

      if (length < 0 || offset < 0 || offset > this.length) {
        throw new RangeError('attempt to write outside buffer bounds')
      }

      var remaining = this.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }
      encoding = String(encoding || 'utf8').toLowerCase()

      var ret
      switch (encoding) {
        case 'hex':
          ret = hexWrite(this, string, offset, length)
          break
        case 'utf8':
        case 'utf-8':
          ret = utf8Write(this, string, offset, length)
          break
        case 'ascii':
          ret = asciiWrite(this, string, offset, length)
          break
        case 'binary':
          ret = binaryWrite(this, string, offset, length)
          break
        case 'base64':
          ret = base64Write(this, string, offset, length)
          break
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          ret = utf16leWrite(this, string, offset, length)
          break
        default:
          throw new TypeError('Unknown encoding: ' + encoding)
      }
      return ret
    }

    Buffer.prototype.toJSON = function toJSON() {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    }

    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf)
      } else {
        return base64.fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice(buf, start, end) {
      var res = ''
      var tmp = ''
      end = Math.min(buf.length, end)

      for (var i = start; i < end; i++) {
        if (buf[i] <= 0x7F) {
          res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
          tmp = ''
        } else {
          tmp += '%' + buf[i].toString(16)
        }
      }

      return res + decodeUtf8Char(tmp)
    }

    function asciiSlice(buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)

      for (var i = start; i < end; i++) {
        ret += String.fromCharCode(buf[i] & 0x7F)
      }
      return ret
    }

    function binarySlice(buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)

      for (var i = start; i < end; i++) {
        ret += String.fromCharCode(buf[i])
      }
      return ret
    }

    function hexSlice(buf, start, end) {
      var len = buf.length

      if (!start || start < 0) start = 0
      if (!end || end < 0 || end > len) end = len

      var out = ''
      for (var i = start; i < end; i++) {
        out += toHex(buf[i])
      }
      return out
    }

    function utf16leSlice(buf, start, end) {
      var bytes = buf.slice(start, end)
      var res = ''
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
      }
      return res
    }

    Buffer.prototype.slice = function slice(start, end) {
      var len = this.length
      start = ~~start
      end = end === undefined ? len : ~~end

      if (start < 0) {
        start += len
        if (start < 0) start = 0
      } else if (start > len) {
        start = len
      }

      if (end < 0) {
        end += len
        if (end < 0) end = 0
      } else if (end > len) {
        end = len
      }

      if (end < start) end = start

      var newBuf
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = Buffer._augment(this.subarray(start, end))
      } else {
        var sliceLen = end - start
        newBuf = new Buffer(sliceLen, undefined)
        for (var i = 0; i < sliceLen; i++) {
          newBuf[i] = this[i + start]
        }
      }

      if (newBuf.length) newBuf.parent = this.parent || this

      return newBuf
    }

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset(offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)

      var val = this[offset]
      var mul = 1
      var i = 0
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul
      }

      return val
    }

    Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length)
      }

      var val = this[offset + --byteLength]
      var mul = 1
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul
      }

      return val
    }

    Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length)
      return this[offset]
    }

    Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length)
      return this[offset] | (this[offset + 1] << 8)
    }

    Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length)
      return (this[offset] << 8) | this[offset + 1]
    }

    Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000)
    }

    Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
          (this[offset + 2] << 8) |
          this[offset + 3])
    }

    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)

      var val = this[offset]
      var mul = 1
      var i = 0
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul
      }
      mul *= 0x80

      if (val >= mul) val -= Math.pow(2, 8 * byteLength)

      return val
    }

    Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)

      var i = byteLength
      var mul = 1
      var val = this[offset + --i]
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul
      }
      mul *= 0x80

      if (val >= mul) val -= Math.pow(2, 8 * byteLength)

      return val
    }

    Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length)
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    }

    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length)
      var val = this[offset] | (this[offset + 1] << 8)
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    }

    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length)
      var val = this[offset + 1] | (this[offset] << 8)
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    }

    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    }

    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    }

    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, true, 23, 4)
    }

    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, false, 23, 4)
    }

    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, true, 52, 8)
    }

    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, false, 52, 8)
    }

    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('value is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('index out of range')
    }

    Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

      var mul = 1
      var i = 0
      this[offset] = value & 0xFF
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) >>> 0 & 0xFF
      }

      return offset + byteLength
    }

    Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

      var i = byteLength - 1
      var mul = 1
      this[offset + i] = value & 0xFF
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) >>> 0 & 0xFF
      }

      return offset + byteLength
    }

    Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
      this[offset] = value
      return offset + 1
    }

    function objectWriteUInt16(buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8
      }
    }

    Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = value
        this[offset + 1] = (value >>> 8)
      } else {
        objectWriteUInt16(this, value, offset, true)
      }
      return offset + 2
    }

    Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8)
        this[offset + 1] = value
      } else {
        objectWriteUInt16(this, value, offset, false)
      }
      return offset + 2
    }

    function objectWriteUInt32(buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
      }
    }

    Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24)
        this[offset + 2] = (value >>> 16)
        this[offset + 1] = (value >>> 8)
        this[offset] = value
      } else {
        objectWriteUInt32(this, value, offset, true)
      }
      return offset + 4
    }

    Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24)
        this[offset + 1] = (value >>> 16)
        this[offset + 2] = (value >>> 8)
        this[offset + 3] = value
      } else {
        objectWriteUInt32(this, value, offset, false)
      }
      return offset + 4
    }

    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkInt(
          this, value, offset, byteLength,
          Math.pow(2, 8 * byteLength - 1) - 1, -Math.pow(2, 8 * byteLength - 1)
        )
      }

      var i = 0
      var mul = 1
      var sub = value < 0 ? 1 : 0
      this[offset] = value & 0xFF
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
      }

      return offset + byteLength
    }

    Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkInt(
          this, value, offset, byteLength,
          Math.pow(2, 8 * byteLength - 1) - 1, -Math.pow(2, 8 * byteLength - 1)
        )
      }

      var i = byteLength - 1
      var mul = 1
      var sub = value < 0 ? 1 : 0
      this[offset + i] = value & 0xFF
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
      }

      return offset + byteLength
    }

    Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
      if (value < 0) value = 0xff + value + 1
      this[offset] = value
      return offset + 1
    }

    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = value
        this[offset + 1] = (value >>> 8)
      } else {
        objectWriteUInt16(this, value, offset, true)
      }
      return offset + 2
    }

    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8)
        this[offset + 1] = value
      } else {
        objectWriteUInt16(this, value, offset, false)
      }
      return offset + 2
    }

    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = value
        this[offset + 1] = (value >>> 8)
        this[offset + 2] = (value >>> 16)
        this[offset + 3] = (value >>> 24)
      } else {
        objectWriteUInt32(this, value, offset, true)
      }
      return offset + 4
    }

    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
      if (value < 0) value = 0xffffffff + value + 1
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24)
        this[offset + 1] = (value >>> 16)
        this[offset + 2] = (value >>> 8)
        this[offset + 3] = value
      } else {
        objectWriteUInt32(this, value, offset, false)
      }
      return offset + 4
    }

    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (value > max || value < min) throw new RangeError('value is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('index out of range')
      if (offset < 0) throw new RangeError('index out of range')
    }

    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4)
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    }

    Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    }

    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8)
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    }

    Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    }

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy(target, target_start, start, end) {
      if (!start) start = 0
      if (!end && end !== 0) end = this.length
      if (target_start >= target.length) target_start = target.length
      if (!target_start) target_start = 0
      if (end > 0 && end < start) end = start

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (target_start < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length
      if (target.length - target_start < end - start) {
        end = target.length - target_start + start
      }

      var len = end - start

      if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < len; i++) {
          target[i + target_start] = this[i + start]
        }
      } else {
        target._set(this.subarray(start, start + len), target_start)
      }

      return len
    }

    // fill(value, start=0, end=buffer.length)
    Buffer.prototype.fill = function fill(value, start, end) {
      if (!value) value = 0
      if (!start) start = 0
      if (!end) end = this.length

      if (end < start) throw new RangeError('end < start')

      // Fill 0 bytes; we're done
      if (end === start) return
      if (this.length === 0) return

      if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
      if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

      var i
      if (typeof value === 'number') {
        for (i = start; i < end; i++) {
          this[i] = value
        }
      } else {
        var bytes = utf8ToBytes(value.toString())
        var len = bytes.length
        for (i = start; i < end; i++) {
          this[i] = bytes[i % len]
        }
      }

      return this
    }

    /**
     * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
     * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
     */
    Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
      if (typeof Uint8Array !== 'undefined') {
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          return (new Buffer(this)).buffer
        } else {
          var buf = new Uint8Array(this.length)
          for (var i = 0, len = buf.length; i < len; i += 1) {
            buf[i] = this[i]
          }
          return buf.buffer
        }
      } else {
        throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
      }
    }

    // HELPER FUNCTIONS
    // ================

    var BP = Buffer.prototype

    /**
     * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
     */
    Buffer._augment = function _augment(arr) {
      arr.constructor = Buffer
      arr._isBuffer = true

      // save reference to original Uint8Array set method before overwriting
      arr._set = arr.set

      // deprecated, will be removed in node 0.13+
      arr.get = BP.get
      arr.set = BP.set

      arr.write = BP.write
      arr.toString = BP.toString
      arr.toLocaleString = BP.toString
      arr.toJSON = BP.toJSON
      arr.equals = BP.equals
      arr.compare = BP.compare
      arr.indexOf = BP.indexOf
      arr.copy = BP.copy
      arr.slice = BP.slice
      arr.readUIntLE = BP.readUIntLE
      arr.readUIntBE = BP.readUIntBE
      arr.readUInt8 = BP.readUInt8
      arr.readUInt16LE = BP.readUInt16LE
      arr.readUInt16BE = BP.readUInt16BE
      arr.readUInt32LE = BP.readUInt32LE
      arr.readUInt32BE = BP.readUInt32BE
      arr.readIntLE = BP.readIntLE
      arr.readIntBE = BP.readIntBE
      arr.readInt8 = BP.readInt8
      arr.readInt16LE = BP.readInt16LE
      arr.readInt16BE = BP.readInt16BE
      arr.readInt32LE = BP.readInt32LE
      arr.readInt32BE = BP.readInt32BE
      arr.readFloatLE = BP.readFloatLE
      arr.readFloatBE = BP.readFloatBE
      arr.readDoubleLE = BP.readDoubleLE
      arr.readDoubleBE = BP.readDoubleBE
      arr.writeUInt8 = BP.writeUInt8
      arr.writeUIntLE = BP.writeUIntLE
      arr.writeUIntBE = BP.writeUIntBE
      arr.writeUInt16LE = BP.writeUInt16LE
      arr.writeUInt16BE = BP.writeUInt16BE
      arr.writeUInt32LE = BP.writeUInt32LE
      arr.writeUInt32BE = BP.writeUInt32BE
      arr.writeIntLE = BP.writeIntLE
      arr.writeIntBE = BP.writeIntBE
      arr.writeInt8 = BP.writeInt8
      arr.writeInt16LE = BP.writeInt16LE
      arr.writeInt16BE = BP.writeInt16BE
      arr.writeInt32LE = BP.writeInt32LE
      arr.writeInt32BE = BP.writeInt32BE
      arr.writeFloatLE = BP.writeFloatLE
      arr.writeFloatBE = BP.writeFloatBE
      arr.writeDoubleLE = BP.writeDoubleLE
      arr.writeDoubleBE = BP.writeDoubleBE
      arr.fill = BP.fill
      arr.inspect = BP.inspect
      arr.toArrayBuffer = BP.toArrayBuffer

      return arr
    }

    var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

    function base64clean(str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '')
        // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '='
      }
      return str
    }

    function stringtrim(str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function isArrayish(subject) {
      return isArray(subject) || Buffer.isBuffer(subject) ||
        subject && typeof subject === 'object' &&
        typeof subject.length === 'number'
    }

    function toHex(n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes(string, units) {
      units = units || Infinity
      var codePoint
      var length = string.length
      var leadSurrogate = null
      var bytes = []
      var i = 0

      for (; i < length; i++) {
        codePoint = string.charCodeAt(i)

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (leadSurrogate) {
            // 2 leads in a row
            if (codePoint < 0xDC00) {
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              leadSurrogate = codePoint
              continue
            } else {
              // valid surrogate pair
              codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
              leadSurrogate = null
            }
          } else {
            // no lead yet

            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              continue
            } else {
              // valid lead
              leadSurrogate = codePoint
              continue
            }
          }
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = null
        }

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint)
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          )
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          )
        } else if (codePoint < 0x200000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          )
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes(str) {
      var byteArray = []
      for (var i = 0; i < str.length; i++) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF)
      }
      return byteArray
    }

    function utf16leToBytes(str, units) {
      var c, hi, lo
      var byteArray = []
      for (var i = 0; i < str.length; i++) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i)
        hi = c >> 8
        lo = c % 256
        byteArray.push(lo)
        byteArray.push(hi)
      }

      return byteArray
    }

    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str))
    }

    function blitBuffer(src, dst, offset, length) {
      for (var i = 0; i < length; i++) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i]
      }
      return i
    }

    function decodeUtf8Char(str) {
      try {
        return decodeURIComponent(str)
      } catch (err) {
        return String.fromCharCode(0xFFFD) // UTF 8 invalid char
      }
    }

  }, {
    "base64-js": 3,
    "ieee754": 4,
    "is-array": 5
  }],
  3: [function(require, module, exports) {
    var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    ;
    (function(exports) {
      'use strict';

      var Arr = (typeof Uint8Array !== 'undefined') ? Uint8Array : Array

      var PLUS = '+'.charCodeAt(0)
      var SLASH = '/'.charCodeAt(0)
      var NUMBER = '0'.charCodeAt(0)
      var LOWER = 'a'.charCodeAt(0)
      var UPPER = 'A'.charCodeAt(0)
      var PLUS_URL_SAFE = '-'.charCodeAt(0)
      var SLASH_URL_SAFE = '_'.charCodeAt(0)

      function decode(elt) {
        var code = elt.charCodeAt(0)
        if (code === PLUS ||
          code === PLUS_URL_SAFE)
          return 62 // '+'
        if (code === SLASH ||
          code === SLASH_URL_SAFE)
          return 63 // '/'
        if (code < NUMBER)
          return -1 //no match
        if (code < NUMBER + 10)
          return code - NUMBER + 26 + 26
        if (code < UPPER + 26)
          return code - UPPER
        if (code < LOWER + 26)
          return code - LOWER + 26
      }

      function b64ToByteArray(b64) {
        var i, j, l, tmp, placeHolders, arr

        if (b64.length % 4 > 0) {
          throw new Error('Invalid string. Length must be a multiple of 4')
        }

        // the number of equal signs (place holders)
        // if there are two placeholders, than the two characters before it
        // represent one byte
        // if there is only one, then the three characters before it represent 2 bytes
        // this is just a cheap hack to not do indexOf twice
        var len = b64.length
        placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

        // base64 is 4/3 + up to two characters of the original data
        arr = new Arr(b64.length * 3 / 4 - placeHolders)

        // if there are placeholders, only get up to the last complete 4 chars
        l = placeHolders > 0 ? b64.length - 4 : b64.length

        var L = 0

        function push(v) {
          arr[L++] = v
        }

        for (i = 0, j = 0; i < l; i += 4, j += 3) {
          tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
          push((tmp & 0xFF0000) >> 16)
          push((tmp & 0xFF00) >> 8)
          push(tmp & 0xFF)
        }

        if (placeHolders === 2) {
          tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
          push(tmp & 0xFF)
        } else if (placeHolders === 1) {
          tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
          push((tmp >> 8) & 0xFF)
          push(tmp & 0xFF)
        }

        return arr
      }

      function uint8ToBase64(uint8) {
        var i,
          extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
          output = "",
          temp, length

        function encode(num) {
          return lookup.charAt(num)
        }

        function tripletToBase64(num) {
          return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
        }

        // go through the array every three bytes, we'll deal with trailing stuff later
        for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
          temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
          output += tripletToBase64(temp)
        }

        // pad the end with zeros, but make sure to not forget the extra bytes
        switch (extraBytes) {
          case 1:
            temp = uint8[uint8.length - 1]
            output += encode(temp >> 2)
            output += encode((temp << 4) & 0x3F)
            output += '=='
            break
          case 2:
            temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
            output += encode(temp >> 10)
            output += encode((temp >> 4) & 0x3F)
            output += encode((temp << 2) & 0x3F)
            output += '='
            break
        }

        return output
      }

      exports.toByteArray = b64ToByteArray
      exports.fromByteArray = uint8ToBase64
    }(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

  }, {}],
  4: [function(require, module, exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m,
        eLen = nBytes * 8 - mLen - 1,
        eMax = (1 << eLen) - 1,
        eBias = eMax >> 1,
        nBits = -7,
        i = isLE ? (nBytes - 1) : 0,
        d = isLE ? -1 : 1,
        s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity);
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };

    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c,
        eLen = nBytes * 8 - mLen - 1,
        eMax = (1 << eLen) - 1,
        eBias = eMax >> 1,
        rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
        i = isLE ? 0 : (nBytes - 1),
        d = isLE ? 1 : -1,
        s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

      buffer[offset + i - d] |= s * 128;
    };

  }, {}],
  5: [function(require, module, exports) {

    /**
     * isArray
     */

    var isArray = Array.isArray;

    /**
     * toString
     */

    var str = Object.prototype.toString;

    /**
     * Whether or not the given `val`
     * is an array.
     *
     * example:
     *
     *        isArray([]);
     *        // > true
     *        isArray(arguments);
     *        // > false
     *        isArray('');
     *        // > false
     *
     * @param {mixed} val
     * @return {bool}
     */

    module.exports = isArray || function(val) {
      return !!val && '[object Array]' == str.call(val);
    };

  }, {}],
  6: [function(require, module, exports) {
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    function EventEmitter() {
      this._events = this._events || {};
      this._maxListeners = this._maxListeners || undefined;
    }
    module.exports = EventEmitter;

    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function(n) {
      if (!isNumber(n) || n < 0 || isNaN(n))
        throw TypeError('n must be a positive number');
      this._maxListeners = n;
      return this;
    };

    EventEmitter.prototype.emit = function(type) {
      var er, handler, len, args, i, listeners;

      if (!this._events)
        this._events = {};

      // If there is no 'error' event listener then throw.
      if (type === 'error') {
        if (!this._events.error ||
          (isObject(this._events.error) && !this._events.error.length)) {
          er = arguments[1];
          if (er instanceof Error) {
            throw er; // Unhandled 'error' event
          }
          throw TypeError('Uncaught, unspecified "error" event.');
        }
      }

      handler = this._events[type];

      if (isUndefined(handler))
        return false;

      if (isFunction(handler)) {
        switch (arguments.length) {
          // fast cases
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
            // slower
          default:
            len = arguments.length;
            args = new Array(len - 1);
            for (i = 1; i < len; i++)
              args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
      } else if (isObject(handler)) {
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];

        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++)
          listeners[i].apply(this, args);
      }

      return true;
    };

    EventEmitter.prototype.addListener = function(type, listener) {
      var m;

      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      if (!this._events)
        this._events = {};

      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (this._events.newListener)
        this.emit('newListener', type,
          isFunction(listener.listener) ?
          listener.listener : listener);

      if (!this._events[type])
      // Optimize the case of one listener. Don't need the extra array object.
        this._events[type] = listener;
      else if (isObject(this._events[type]))
      // If we've already got an array, just append.
        this._events[type].push(listener);
      else
      // Adding the second element, need to change to array.
        this._events[type] = [this._events[type], listener];

      // Check for listener leak
      if (isObject(this._events[type]) && !this._events[type].warned) {
        var m;
        if (!isUndefined(this._maxListeners)) {
          m = this._maxListeners;
        } else {
          m = EventEmitter.defaultMaxListeners;
        }

        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
            'leak detected. %d listeners added. ' +
            'Use emitter.setMaxListeners() to increase limit.',
            this._events[type].length);
          if (typeof console.trace === 'function') {
            // not supported in IE 10
            console.trace();
          }
        }
      }

      return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function(type, listener) {
      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      var fired = false;

      function g() {
        this.removeListener(type, g);

        if (!fired) {
          fired = true;
          listener.apply(this, arguments);
        }
      }

      g.listener = listener;
      this.on(type, g);

      return this;
    };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener = function(type, listener) {
      var list, position, length, i;

      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      if (!this._events || !this._events[type])
        return this;

      list = this._events[type];
      length = list.length;
      position = -1;

      if (list === listener ||
        (isFunction(list.listener) && list.listener === listener)) {
        delete this._events[type];
        if (this._events.removeListener)
          this.emit('removeListener', type, listener);

      } else if (isObject(list)) {
        for (i = length; i-- > 0;) {
          if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (list.length === 1) {
          list.length = 0;
          delete this._events[type];
        } else {
          list.splice(position, 1);
        }

        if (this._events.removeListener)
          this.emit('removeListener', type, listener);
      }

      return this;
    };

    EventEmitter.prototype.removeAllListeners = function(type) {
      var key, listeners;

      if (!this._events)
        return this;

      // not listening for removeListener, no need to emit
      if (!this._events.removeListener) {
        if (arguments.length === 0)
          this._events = {};
        else if (this._events[type])
          delete this._events[type];
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        for (key in this._events) {
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = {};
        return this;
      }

      listeners = this._events[type];

      if (isFunction(listeners)) {
        this.removeListener(type, listeners);
      } else {
        // LIFO order
        while (listeners.length)
          this.removeListener(type, listeners[listeners.length - 1]);
      }
      delete this._events[type];

      return this;
    };

    EventEmitter.prototype.listeners = function(type) {
      var ret;
      if (!this._events || !this._events[type])
        ret = [];
      else if (isFunction(this._events[type]))
        ret = [this._events[type]];
      else
        ret = this._events[type].slice();
      return ret;
    };

    EventEmitter.listenerCount = function(emitter, type) {
      var ret;
      if (!emitter._events || !emitter._events[type])
        ret = 0;
      else if (isFunction(emitter._events[type]))
        ret = 1;
      else
        ret = emitter._events[type].length;
      return ret;
    };

    function isFunction(arg) {
      return typeof arg === 'function';
    }

    function isNumber(arg) {
      return typeof arg === 'number';
    }

    function isObject(arg) {
      return typeof arg === 'object' && arg !== null;
    }

    function isUndefined(arg) {
      return arg === void 0;
    }

  }, {}],
  7: [function(require, module, exports) {
    if (typeof Object.create === 'function') {
      // implementation from standard node.js 'util' module
      module.exports = function inherits(ctor, superCtor) {
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
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        var TempCtor = function() {}
        TempCtor.prototype = superCtor.prototype
        ctor.prototype = new TempCtor()
        ctor.prototype.constructor = ctor
      }
    }

  }, {}],
  8: [function(require, module, exports) {
    // shim for using process in browser

    var process = module.exports = {};
    var queue = [];
    var draining = false;

    function drainQueue() {
      if (draining) {
        return;
      }
      draining = true;
      var currentQueue;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
          currentQueue[i]();
        }
        len = queue.length;
      }
      draining = false;
    }
    process.nextTick = function(fun) {
      queue.push(fun);
      if (!draining) {
        setTimeout(drainQueue, 0);
      }
    };

    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};

    function noop() {}

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;

    process.binding = function(name) {
      throw new Error('process.binding is not supported');
    };

    // TODO(shtylman)
    process.cwd = function() {
      return '/'
    };
    process.chdir = function(dir) {
      throw new Error('process.chdir is not supported');
    };
    process.umask = function() {
      return 0;
    };

  }, {}],
  9: [function(require, module, exports) {
    module.exports = function isBuffer(arg) {
      return arg && typeof arg === 'object' && typeof arg.copy === 'function' && typeof arg.fill === 'function' && typeof arg.readUInt8 === 'function';
    }
  }, {}],
  10: [function(require, module, exports) {
    (function(process, global) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      var formatRegExp = /%[sdj%]/g;
      exports.format = function(f) {
        if (!isString(f)) {
          var objects = [];
          for (var i = 0; i < arguments.length; i++) {
            objects.push(inspect(arguments[i]));
          }
          return objects.join(' ');
        }

        var i = 1;
        var args = arguments;
        var len = args.length;
        var str = String(f).replace(formatRegExp, function(x) {
          if (x === '%%') return '%';
          if (i >= len) return x;
          switch (x) {
            case '%s':
              return String(args[i++]);
            case '%d':
              return Number(args[i++]);
            case '%j':
              try {
                return JSON.stringify(args[i++]);
              } catch (_) {
                return '[Circular]';
              }
            default:
              return x;
          }
        });
        for (var x = args[i]; i < len; x = args[++i]) {
          if (isNull(x) || !isObject(x)) {
            str += ' ' + x;
          } else {
            str += ' ' + inspect(x);
          }
        }
        return str;
      };


      // Mark that a method should not be used.
      // Returns a modified function which warns once by default.
      // If --no-deprecation is set, then it is a no-op.
      exports.deprecate = function(fn, msg) {
        // Allow for deprecating things in the process of starting up.
        if (isUndefined(global.process)) {
          return function() {
            return exports.deprecate(fn, msg).apply(this, arguments);
          };
        }

        if (process.noDeprecation === true) {
          return fn;
        }

        var warned = false;

        function deprecated() {
          if (!warned) {
            if (process.throwDeprecation) {
              throw new Error(msg);
            } else if (process.traceDeprecation) {
              console.trace(msg);
            } else {
              console.error(msg);
            }
            warned = true;
          }
          return fn.apply(this, arguments);
        }

        return deprecated;
      };


      var debugs = {};
      var debugEnviron;
      exports.debuglog = function(set) {
        if (isUndefined(debugEnviron))
          debugEnviron = process.env.NODE_DEBUG || '';
        set = set.toUpperCase();
        if (!debugs[set]) {
          if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
            var pid = process.pid;
            debugs[set] = function() {
              var msg = exports.format.apply(exports, arguments);
              console.error('%s %d: %s', set, pid, msg);
            };
          } else {
            debugs[set] = function() {};
          }
        }
        return debugs[set];
      };


      /**
       * Echos the value of a value. Trys to print the value out
       * in the best way possible given the different types.
       *
       * @param {Object} obj The object to print out.
       * @param {Object} opts Optional options object that alters the output.
       */
      /* legacy: obj, showHidden, depth, colors*/
      function inspect(obj, opts) {
        // default options
        var ctx = {
          seen: [],
          stylize: stylizeNoColor
        };
        // legacy...
        if (arguments.length >= 3) ctx.depth = arguments[2];
        if (arguments.length >= 4) ctx.colors = arguments[3];
        if (isBoolean(opts)) {
          // legacy...
          ctx.showHidden = opts;
        } else if (opts) {
          // got an "options" object
          exports._extend(ctx, opts);
        }
        // set default options
        if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
        if (isUndefined(ctx.depth)) ctx.depth = 2;
        if (isUndefined(ctx.colors)) ctx.colors = false;
        if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
        if (ctx.colors) ctx.stylize = stylizeWithColor;
        return formatValue(ctx, obj, ctx.depth);
      }
      exports.inspect = inspect;


      // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
      inspect.colors = {
        'bold': [1, 22],
        'italic': [3, 23],
        'underline': [4, 24],
        'inverse': [7, 27],
        'white': [37, 39],
        'grey': [90, 39],
        'black': [30, 39],
        'blue': [34, 39],
        'cyan': [36, 39],
        'green': [32, 39],
        'magenta': [35, 39],
        'red': [31, 39],
        'yellow': [33, 39]
      };

      // Don't use 'blue' not visible on cmd.exe
      inspect.styles = {
        'special': 'cyan',
        'number': 'yellow',
        'boolean': 'yellow',
        'undefined': 'grey',
        'null': 'bold',
        'string': 'green',
        'date': 'magenta',
        // "name": intentionally not styling
        'regexp': 'red'
      };


      function stylizeWithColor(str, styleType) {
        var style = inspect.styles[styleType];

        if (style) {
          return '\u001b[' + inspect.colors[style][0] + 'm' + str +
            '\u001b[' + inspect.colors[style][1] + 'm';
        } else {
          return str;
        }
      }


      function stylizeNoColor(str, styleType) {
        return str;
      }


      function arrayToHash(array) {
        var hash = {};

        array.forEach(function(val, idx) {
          hash[val] = true;
        });

        return hash;
      }


      function formatValue(ctx, value, recurseTimes) {
        // Provide a hook for user-specified inspect functions.
        // Check that value is an object with an inspect function on it
        if (ctx.customInspect &&
          value &&
          isFunction(value.inspect) &&
          // Filter out the util module, it's inspect function is special
          value.inspect !== exports.inspect &&
          // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
          var ret = value.inspect(recurseTimes, ctx);
          if (!isString(ret)) {
            ret = formatValue(ctx, ret, recurseTimes);
          }
          return ret;
        }

        // Primitive types cannot have properties
        var primitive = formatPrimitive(ctx, value);
        if (primitive) {
          return primitive;
        }

        // Look up the keys of the object.
        var keys = Object.keys(value);
        var visibleKeys = arrayToHash(keys);

        if (ctx.showHidden) {
          keys = Object.getOwnPropertyNames(value);
        }

        // IE doesn't make error fields non-enumerable
        // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
        if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
          return formatError(value);
        }

        // Some type of object without properties can be shortcutted.
        if (keys.length === 0) {
          if (isFunction(value)) {
            var name = value.name ? ': ' + value.name : '';
            return ctx.stylize('[Function' + name + ']', 'special');
          }
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
          }
          if (isDate(value)) {
            return ctx.stylize(Date.prototype.toString.call(value), 'date');
          }
          if (isError(value)) {
            return formatError(value);
          }
        }

        var base = '',
          array = false,
          braces = ['{', '}'];

        // Make Array say that they are Array
        if (isArray(value)) {
          array = true;
          braces = ['[', ']'];
        }

        // Make functions say that they are functions
        if (isFunction(value)) {
          var n = value.name ? ': ' + value.name : '';
          base = ' [Function' + n + ']';
        }

        // Make RegExps say that they are RegExps
        if (isRegExp(value)) {
          base = ' ' + RegExp.prototype.toString.call(value);
        }

        // Make dates with properties first say the date
        if (isDate(value)) {
          base = ' ' + Date.prototype.toUTCString.call(value);
        }

        // Make error with message first say the error
        if (isError(value)) {
          base = ' ' + formatError(value);
        }

        if (keys.length === 0 && (!array || value.length == 0)) {
          return braces[0] + base + braces[1];
        }

        if (recurseTimes < 0) {
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
          } else {
            return ctx.stylize('[Object]', 'special');
          }
        }

        ctx.seen.push(value);

        var output;
        if (array) {
          output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
        } else {
          output = keys.map(function(key) {
            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
          });
        }

        ctx.seen.pop();

        return reduceToSingleString(output, base, braces);
      }


      function formatPrimitive(ctx, value) {
        if (isUndefined(value))
          return ctx.stylize('undefined', 'undefined');
        if (isString(value)) {
          var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"') + '\'';
          return ctx.stylize(simple, 'string');
        }
        if (isNumber(value))
          return ctx.stylize('' + value, 'number');
        if (isBoolean(value))
          return ctx.stylize('' + value, 'boolean');
        // For some reason typeof null is "object", so special case here.
        if (isNull(value))
          return ctx.stylize('null', 'null');
      }


      function formatError(value) {
        return '[' + Error.prototype.toString.call(value) + ']';
      }


      function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
        var output = [];
        for (var i = 0, l = value.length; i < l; ++i) {
          if (hasOwnProperty(value, String(i))) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              String(i), true));
          } else {
            output.push('');
          }
        }
        keys.forEach(function(key) {
          if (!key.match(/^\d+$/)) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              key, true));
          }
        });
        return output;
      }


      function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
        var name, str, desc;
        desc = Object.getOwnPropertyDescriptor(value, key) || {
          value: value[key]
        };
        if (desc.get) {
          if (desc.set) {
            str = ctx.stylize('[Getter/Setter]', 'special');
          } else {
            str = ctx.stylize('[Getter]', 'special');
          }
        } else {
          if (desc.set) {
            str = ctx.stylize('[Setter]', 'special');
          }
        }
        if (!hasOwnProperty(visibleKeys, key)) {
          name = '[' + key + ']';
        }
        if (!str) {
          if (ctx.seen.indexOf(desc.value) < 0) {
            if (isNull(recurseTimes)) {
              str = formatValue(ctx, desc.value, null);
            } else {
              str = formatValue(ctx, desc.value, recurseTimes - 1);
            }
            if (str.indexOf('\n') > -1) {
              if (array) {
                str = str.split('\n').map(function(line) {
                  return '  ' + line;
                }).join('\n').substr(2);
              } else {
                str = '\n' + str.split('\n').map(function(line) {
                  return '   ' + line;
                }).join('\n');
              }
            }
          } else {
            str = ctx.stylize('[Circular]', 'special');
          }
        }
        if (isUndefined(name)) {
          if (array && key.match(/^\d+$/)) {
            return str;
          }
          name = JSON.stringify('' + key);
          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.substr(1, name.length - 2);
            name = ctx.stylize(name, 'name');
          } else {
            name = name.replace(/'/g, "\\'")
              .replace(/\\"/g, '"')
              .replace(/(^"|"$)/g, "'");
            name = ctx.stylize(name, 'string');
          }
        }

        return name + ': ' + str;
      }


      function reduceToSingleString(output, base, braces) {
        var numLinesEst = 0;
        var length = output.reduce(function(prev, cur) {
          numLinesEst++;
          if (cur.indexOf('\n') >= 0) numLinesEst++;
          return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
        }, 0);

        if (length > 60) {
          return braces[0] +
            (base === '' ? '' : base + '\n ') +
            ' ' +
            output.join(',\n  ') +
            ' ' +
            braces[1];
        }

        return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
      }


      // NOTE: These type checking functions intentionally don't use `instanceof`
      // because it is fragile and can be easily faked with `Object.create()`.
      function isArray(ar) {
        return Array.isArray(ar);
      }
      exports.isArray = isArray;

      function isBoolean(arg) {
        return typeof arg === 'boolean';
      }
      exports.isBoolean = isBoolean;

      function isNull(arg) {
        return arg === null;
      }
      exports.isNull = isNull;

      function isNullOrUndefined(arg) {
        return arg == null;
      }
      exports.isNullOrUndefined = isNullOrUndefined;

      function isNumber(arg) {
        return typeof arg === 'number';
      }
      exports.isNumber = isNumber;

      function isString(arg) {
        return typeof arg === 'string';
      }
      exports.isString = isString;

      function isSymbol(arg) {
        return typeof arg === 'symbol';
      }
      exports.isSymbol = isSymbol;

      function isUndefined(arg) {
        return arg === void 0;
      }
      exports.isUndefined = isUndefined;

      function isRegExp(re) {
        return isObject(re) && objectToString(re) === '[object RegExp]';
      }
      exports.isRegExp = isRegExp;

      function isObject(arg) {
        return typeof arg === 'object' && arg !== null;
      }
      exports.isObject = isObject;

      function isDate(d) {
        return isObject(d) && objectToString(d) === '[object Date]';
      }
      exports.isDate = isDate;

      function isError(e) {
        return isObject(e) &&
          (objectToString(e) === '[object Error]' || e instanceof Error);
      }
      exports.isError = isError;

      function isFunction(arg) {
        return typeof arg === 'function';
      }
      exports.isFunction = isFunction;

      function isPrimitive(arg) {
        return arg === null ||
          typeof arg === 'boolean' ||
          typeof arg === 'number' ||
          typeof arg === 'string' ||
          typeof arg === 'symbol' || // ES6 symbol
          typeof arg === 'undefined';
      }
      exports.isPrimitive = isPrimitive;

      exports.isBuffer = require('./support/isBuffer');

      function objectToString(o) {
        return Object.prototype.toString.call(o);
      }


      function pad(n) {
        return n < 10 ? '0' + n.toString(10) : n.toString(10);
      }


      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec'
      ];

      // 26 Feb 16:19:34
      function timestamp() {
        var d = new Date();
        var time = [pad(d.getHours()),
          pad(d.getMinutes()),
          pad(d.getSeconds())
        ].join(':');
        return [d.getDate(), months[d.getMonth()], time].join(' ');
      }


      // log is just a thin wrapper to console.log that prepends a timestamp
      exports.log = function() {
        console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
      };


      /**
       * Inherit the prototype methods from one constructor into another.
       *
       * The Function.prototype.inherits from lang.js rewritten as a standalone
       * function (not on Function.prototype). NOTE: If this file is to be loaded
       * during bootstrapping this function needs to be rewritten using some native
       * functions as prototype setup using normal JavaScript does not work as
       * expected during bootstrapping (see mirror.js in r114903).
       *
       * @param {function} ctor Constructor function which needs to inherit the
       *     prototype.
       * @param {function} superCtor Constructor function to inherit prototype from.
       */
      exports.inherits = require('inherits');

      exports._extend = function(origin, add) {
        // Don't do anything if add isn't an object
        if (!add || !isObject(add)) return origin;

        var keys = Object.keys(add);
        var i = keys.length;
        while (i--) {
          origin[keys[i]] = add[keys[i]];
        }
        return origin;
      };

      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }

    }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  }, {
    "./support/isBuffer": 9,
    "_process": 8,
    "inherits": 7
  }],
  11: [function(require, module, exports) {
    (function() {
      var JS_WS_CLIENT_TYPE = 'js-websocket';
      var JS_WS_CLIENT_VERSION = '0.0.1';

      var Protocol = window.Protocol;
      var protobuf = window.protobuf;
      var decodeIO_protobuf = window.decodeIO_protobuf;
      var decodeIO_encoder = null;
      var decodeIO_decoder = null;
      var Package = Protocol.Package;
      var Message = Protocol.Message;
      var EventEmitter = window.EventEmitter;
      var rsa = window.rsa;

      if (typeof(window) != "undefined" && typeof(sys) != 'undefined' && sys.localStorage) {
        window.localStorage = sys.localStorage;
      }

      var RES_OK = 200;
      var RES_FAIL = 500;
      var RES_OLD_CLIENT = 501;

      if (typeof Object.create !== 'function') {
        Object.create = function(o) {
          function F() {}
          F.prototype = o;
          return new F();
        };
      }

      var root = window;
      var pomelo = Object.create(EventEmitter.prototype); // object extend from object
      root.pomelo = pomelo;
      var socket = null;
      var reqId = 0;
      var callbacks = {};
      var handlers = {};
      //Map from request id to route
      var routeMap = {};
      var dict = {}; // route string to code
      var abbrs = {}; // code to route string
      var serverProtos = {};
      var clientProtos = {};
      var protoVersion = 0;

      var heartbeatInterval = 0;
      var heartbeatTimeout = 0;
      var nextHeartbeatTimeout = 0;
      var gapThreshold = 100; // heartbeat gap threashold
      var heartbeatId = null;
      var heartbeatTimeoutId = null;
      var handshakeCallback = null;

      var decode = null;
      var encode = null;

      var reconnect = false;
      var reconncetTimer = null;
      var reconnectUrl = null;
      var reconnectAttempts = 0;
      var reconnectionDelay = 5000;
      var DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;

      var useCrypto;

      var handshakeBuffer = {
        'sys': {
          type: JS_WS_CLIENT_TYPE,
          version: JS_WS_CLIENT_VERSION,
          rsa: {}
        },
        'user': {}
      };

      var initCallback = null;

      pomelo.init = function(params, cb) {
        initCallback = cb;
        var host = params.host;
        var port = params.port;

        encode = params.encode || defaultEncode;
        decode = params.decode || defaultDecode;

        var url = 'ws://' + host;
        if (port) {
          url += ':' + port;
        }

        handshakeBuffer.user = params.user;
        if (params.encrypt) {
          useCrypto = true;
          rsa.generate(1024, "10001");
          var data = {
            rsa_n: rsa.n.toString(16),
            rsa_e: rsa.e
          }
          handshakeBuffer.sys.rsa = data;
        }
        handshakeCallback = params.handshakeCallback;
        connect(params, url, cb);
      };

      var defaultDecode = pomelo.decode = function(data) {
        //probuff decode
        var msg = Message.decode(data);

        if (msg.id > 0) {
          msg.route = routeMap[msg.id];
          delete routeMap[msg.id];
          if (!msg.route) {
            return;
          }
        }

        msg.body = deCompose(msg);
        return msg;
      };

      var defaultEncode = pomelo.encode = function(reqId, route, msg) {
        var type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;

        //compress message by protobuf
        if (protobuf && clientProtos[route]) {
          msg = protobuf.encode(route, msg);
        } else if (decodeIO_encoder && decodeIO_encoder.lookup(route)) {
          var Builder = decodeIO_encoder.build(route);
          msg = new Builder(msg).encodeNB();
        } else {
          msg = Protocol.strencode(JSON.stringify(msg));
        }

        var compressRoute = 0;
        if (dict && dict[route]) {
          route = dict[route];
          compressRoute = 1;
        }

        return Message.encode(reqId, type, compressRoute, route, msg);
      };

      var connect = function(params, url, cb) {
        console.log('connect to ' + url);

        var params = params || {};
        var maxReconnectAttempts = params.maxReconnectAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS;
        reconnectUrl = url;
        //Add protobuf version
        if (window.localStorage && window.localStorage.getItem('protos') && protoVersion === 0) {
          var protos = JSON.parse(window.localStorage.getItem('protos'));

          protoVersion = protos.version || 0;
          serverProtos = protos.server || {};
          clientProtos = protos.client || {};

          if (!!protobuf) {
            protobuf.init({
              encoderProtos: clientProtos,
              decoderProtos: serverProtos
            });
          }
          if (!!decodeIO_protobuf) {
            decodeIO_encoder = decodeIO_protobuf.loadJson(clientProtos);
            decodeIO_decoder = decodeIO_protobuf.loadJson(serverProtos);
          }
        }
        //Set protoversion
        handshakeBuffer.sys.protoVersion = protoVersion;

        var onopen = function(event) {
          if (!!reconnect) {
            pomelo.emit('reconnect');
          }
          reset();
          var obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(handshakeBuffer)));
          send(obj);
        };
        var onmessage = function(event) {
          processPackage(Package.decode(event.data), cb);
          // new package arrived, update the heartbeat timeout
          if (heartbeatTimeout) {
            nextHeartbeatTimeout = Date.now() + heartbeatTimeout;
          }
        };
        var onerror = function(event) {
          pomelo.emit('io-error', event);
          console.error('socket error: ', event);
        };
        var onclose = function(event) {
          pomelo.emit('close', event);
          pomelo.emit('disconnect', event);
          console.error('socket close: ', event);
          if (!!params.reconnect && reconnectAttempts < maxReconnectAttempts) {
            reconnect = true;
            reconnectAttempts++;
            reconncetTimer = setTimeout(function() {
              connect(params, reconnectUrl, cb);
            }, reconnectionDelay);
            reconnectionDelay *= 2;
          }
        };
        socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';
        socket.onopen = onopen;
        socket.onmessage = onmessage;
        socket.onerror = onerror;
        socket.onclose = onclose;
      };

      pomelo.disconnect = function() {
        if (socket) {
          if (socket.disconnect) socket.disconnect();
          if (socket.close) socket.close();
          console.log('disconnect');
          socket = null;
        }

        if (heartbeatId) {
          clearTimeout(heartbeatId);
          heartbeatId = null;
        }
        if (heartbeatTimeoutId) {
          clearTimeout(heartbeatTimeoutId);
          heartbeatTimeoutId = null;
        }
      };

      var reset = function() {
        reconnect = false;
        reconnectionDelay = 1000 * 5;
        reconnectAttempts = 0;
        clearTimeout(reconncetTimer);
      };

      pomelo.request = function(route, msg, cb) {
        if (arguments.length === 2 && typeof msg === 'function') {
          cb = msg;
          msg = {};
        } else {
          msg = msg || {};
        }
        route = route || msg.route;
        if (!route) {
          return;
        }

        reqId++;
        sendMessage(reqId, route, msg);
        cc.log("request【"+route+"】"+reqId+":"+JSON.stringify(msg));

        callbacks[reqId] = cb;
        routeMap[reqId] = route;
      };

      pomelo.notify = function(route, msg) {
        msg = msg || {};
        sendMessage(0, route, msg);
        cc.log("notify 【"+route+"】:"+JSON.stringify(msg));
      };

      var sendMessage = function(reqId, route, msg) {
        if (useCrypto) {
          msg = JSON.stringify(msg);
          var sig = rsa.signString(msg, "sha256");
          msg = JSON.parse(msg);
          msg['__crypto__'] = sig;
        }

        if (encode) {
          msg = encode(reqId, route, msg);
        }

        var packet = Package.encode(Package.TYPE_DATA, msg);
        send(packet);
      };

      var send = function(packet) {
        if (socket)
          socket.send(packet.buffer);
      };

      var handler = {};

      var heartbeat = function(data) {
        if (!heartbeatInterval) {
          // no heartbeat
          return;
        }

        var obj = Package.encode(Package.TYPE_HEARTBEAT);
        if (heartbeatTimeoutId) {
          clearTimeout(heartbeatTimeoutId);
          heartbeatTimeoutId = null;
        }

        if (heartbeatId) {
          // already in a heartbeat interval
          return;
        }
        heartbeatId = setTimeout(function() {
          heartbeatId = null;
          send(obj);

          nextHeartbeatTimeout = Date.now() + heartbeatTimeout;
          heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, heartbeatTimeout);
        }, heartbeatInterval);
      };

      var heartbeatTimeoutCb = function() {
        var gap = nextHeartbeatTimeout - Date.now();
        if (gap > gapThreshold) {
          heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, gap);
        } else {
          console.error('server heartbeat timeout');
          pomelo.emit('heartbeat timeout');
          pomelo.disconnect();
        }
      };

      var handshake = function(data) {
        data = JSON.parse(Protocol.strdecode(data));
        if (data.code === RES_OLD_CLIENT) {
          pomelo.emit('error', 'client version not fullfill');
          return;
        }

        if (data.code !== RES_OK) {
          pomelo.emit('error', 'handshake fail');
          return;
        }

        handshakeInit(data);

        var obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
        send(obj);
        if (initCallback) {
          initCallback(socket);
        }
      };

      var onData = function(data) {
        var msg = data;
        if (decode) {
          msg = decode(msg);
        }
        processMessage(pomelo, msg);
      };

      var onKick = function(data) {
        data = JSON.parse(Protocol.strdecode(data));
        pomelo.emit('onKick', data);
      };

      handlers[Package.TYPE_HANDSHAKE] = handshake;
      handlers[Package.TYPE_HEARTBEAT] = heartbeat;
      handlers[Package.TYPE_DATA] = onData;
      handlers[Package.TYPE_KICK] = onKick;

      var processPackage = function(msgs) {
        if (Array.isArray(msgs)) {
          for (var i = 0; i < msgs.length; i++) {
            var msg = msgs[i];
            handlers[msg.type](msg.body);
          }
        } else {
          handlers[msgs.type](msgs.body);
        }
      };

      var processMessage = function(pomelo, msg) {
        if (!msg.id) {
          // server push message
          // pomelo.emit(msg.route, msg.body);
          cc.log("  ");
          cc.log("$$$【"+msg.route+"】:"+JSON.stringify(msg.body));
          cc.log("  ");

          if (gameMsgHandler[msg.route]) {
            if(msg.body)
              gameMsgHandler[msg.route](msg.body);
          }
          return;
        }

        //if have a id then find the callback function with the request
        var cb = callbacks[msg.id];

        delete callbacks[msg.id];
        if (typeof cb !== 'function') {
          return;
        }
        cc.log("【onRequestCb】"+msg.id+":"+JSON.stringify(msg.body));
        cb(msg.body);
        return;
      };

      var processMessageBatch = function(pomelo, msgs) {
        for (var i = 0, l = msgs.length; i < l; i++) {
          processMessage(pomelo, msgs[i]);
        }
      };

      var deCompose = function(msg) {
        var route = msg.route;

        //Decompose route from dict
        if (msg.compressRoute) {
          if (!abbrs[route]) {
            return {};
          }

          route = msg.route = abbrs[route];
        }
        if (protobuf && serverProtos[route]) {
          return protobuf.decodeStr(route, msg.body);
        } else if (decodeIO_decoder && decodeIO_decoder.lookup(route)) {
          return decodeIO_decoder.build(route).decode(msg.body);
        } else {
          return JSON.parse(Protocol.strdecode(msg.body));
        }

        return msg;
      };

      var handshakeInit = function(data) {
        if (data.sys && data.sys.heartbeat) {
          heartbeatInterval = data.sys.heartbeat * 1000; // heartbeat interval
          heartbeatTimeout = heartbeatInterval * 2; // max heartbeat timeout
        } else {
          heartbeatInterval = 0;
          heartbeatTimeout = 0;
        }

        initData(data);

        if (typeof handshakeCallback === 'function') {
          handshakeCallback(data.user);
        }
      };

      //Initilize data used in pomelo client
      var initData = function(data) {
        if (!data || !data.sys) {
          return;
        }
        dict = data.sys.dict;
        var protos = data.sys.protos;

        //Init compress dict
        if (dict) {
          dict = dict;
          abbrs = {};

          for (var route in dict) {
            abbrs[dict[route]] = route;
          }
        }

        //Init protobuf protos
        if (protos) {
          protoVersion = protos.version || 0;
          serverProtos = protos.server || {};
          clientProtos = protos.client || {};

          //Save protobuf protos to localStorage
          window.localStorage.setItem('protos', JSON.stringify(protos));

          if (!!protobuf) {
            protobuf.init({
              encoderProtos: protos.client,
              decoderProtos: protos.server
            });
          }
          if (!!decodeIO_protobuf) {
            decodeIO_encoder = decodeIO_protobuf.loadJson(clientProtos);
            decodeIO_decoder = decodeIO_protobuf.loadJson(serverProtos);
          }
        }
      };

      module.exports = pomelo;
    })();

  }, {}],
  12: [function(require, module, exports) {
    var Encoder = module.exports;

    /**
     * [encode an uInt32, return a array of bytes]
     * @param  {[integer]} num
     * @return {[array]}
     */
    Encoder.encodeUInt32 = function(num) {
      var n = parseInt(num);
      if (isNaN(n) || n < 0) {
        console.log(n);
        return null;
      }

      var result = [];
      do {
        var tmp = n % 128;
        var next = Math.floor(n / 128);

        if (next !== 0) {
          tmp = tmp + 128;
        }
        result.push(tmp);
        n = next;
      } while (n !== 0);

      return result;
    };

    /**
     * [encode a sInt32, return a byte array]
     * @param  {[sInt32]} num  The sInt32 need to encode
     * @return {[array]} A byte array represent the integer
     */
    Encoder.encodeSInt32 = function(num) {
      var n = parseInt(num);
      if (isNaN(n)) {
        return null;
      }
      n = n < 0 ? (Math.abs(n) * 2 - 1) : n * 2;

      return Encoder.encodeUInt32(n);
    };

    Encoder.decodeUInt32 = function(bytes) {
      var n = 0;

      for (var i = 0; i < bytes.length; i++) {
        var m = parseInt(bytes[i]);
        n = n + ((m & 0x7f) * Math.pow(2, (7 * i)));
        if (m < 128) {
          return n;
        }
      }

      return n;
    };


    Encoder.decodeSInt32 = function(bytes) {
      var n = this.decodeUInt32(bytes);
      var flag = ((n % 2) === 1) ? -1 : 1;

      n = ((n % 2 + n) / 2) * flag;

      return n;
    };

  }, {}],
  13: [function(require, module, exports) {
    module.exports = {
      TYPES: {
        uInt32: 0,
        sInt32: 0,
        int32: 0,
        double: 1,
        string: 2,
        message: 2,
        float: 5
      }
    }
  }, {}],
  14: [function(require, module, exports) {
    var codec = require('./codec');
    var util = require('./util');

    var Decoder = module.exports;

    var buffer;
    var offset = 0;

    Decoder.init = function(protos) {
      this.protos = protos || {};
    };

    Decoder.setProtos = function(protos) {
      if (!!protos) {
        this.protos = protos;
      }
    };

    Decoder.decode = function(route, buf) {
      var protos = this.protos[route];

      buffer = buf;
      offset = 0;

      if (!!protos) {
        return decodeMsg({}, protos, buffer.length);
      }

      return null;
    };

    function decodeMsg(msg, protos, length) {
      while (offset < length) {
        var head = getHead();
        var type = head.type;
        var tag = head.tag;
        var name = protos.__tags[tag];

        switch (protos[name].option) {
          case 'optional':
          case 'required':
            msg[name] = decodeProp(protos[name].type, protos);
            break;
          case 'repeated':
            if (!msg[name]) {
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
    function isFinish(msg, protos) {
      return (!protos.__tags[peekHead().tag]);
    }
    /**
     * Get property head from protobuf
     */
    function getHead() {
      var tag = codec.decodeUInt32(getBytes());

      return {
        type: tag & 0x7,
        tag: tag >> 3
      };
    }

    /**
     * Get tag head without move the offset
     */
    function peekHead() {
      var tag = codec.decodeUInt32(peekBytes());

      return {
        type: tag & 0x7,
        tag: tag >> 3
      };
    }

    function decodeProp(type, protos) {
      switch (type) {
        case 'uInt32':
          return codec.decodeUInt32(getBytes());
        case 'int32':
        case 'sInt32':
          return codec.decodeSInt32(getBytes());
        case 'float':
          var float = buffer.readFloatLE(offset);
          offset += 4;
          return float;
        case 'double':
          var double = buffer.readDoubleLE(offset);
          offset += 8;
          return double;
        case 'string':
          var length = codec.decodeUInt32(getBytes());

          var str = buffer.toString('utf8', offset, offset + length);
          offset += length;

          return str;
        default:
          var message = protos && (protos.__messages[type] || Decoder.protos['message ' + type]);
          if (message) {
            var length = codec.decodeUInt32(getBytes());
            var msg = {};
            decodeMsg(msg, message, offset + length);
            return msg;
          }
          break;
      }
    }

    function decodeArray(array, type, protos) {
      if (util.isSimpleType(type)) {
        var length = codec.decodeUInt32(getBytes());

        for (var i = 0; i < length; i++) {
          array.push(decodeProp(type));
        }
      } else {
        array.push(decodeProp(type, protos));
      }
    }

    function getBytes(flag) {
      var bytes = [];
      var pos = offset;
      flag = flag || false;

      var b;
      do {
        var b = buffer.readUInt8(pos);
        bytes.push(b);
        pos++;
      } while (b >= 128);

      if (!flag) {
        offset = pos;
      }
      return bytes;
    }

    function peekBytes() {
      return getBytes(true);
    }
  }, {
    "./codec": 12,
    "./util": 18
  }],
  15: [function(require, module, exports) {
    (function(Buffer) {
      var codec = require('./codec');
      var constant = require('./constant');
      var util = require('./util');

      var Encoder = module.exports;

      Encoder.init = function(protos) {
        this.protos = protos || {};
      };

      Encoder.encode = function(route, msg) {
        if (!route || !msg) {
          console.warn('Route or msg can not be null! route : %j, msg %j', route, msg);
          return null;
        }

        //Get protos from protos map use the route as key
        var protos = this.protos[route];

        //Check msg
        if (!checkMsg(msg, protos)) {
          console.warn('check msg failed! msg : %j, proto : %j', msg, protos);
          return null;
        }

        //Set the length of the buffer 2 times bigger to prevent overflow
        var length = Buffer.byteLength(JSON.stringify(msg)) * 2;

        //Init buffer and offset
        var buffer = new Buffer(length);
        var offset = 0;

        if (!!protos) {
          offset = encodeMsg(buffer, offset, protos, msg);
          if (offset > 0) {
            return buffer.slice(0, offset);
          }
        }

        return null;
      };

      /**
       * Check if the msg follow the defination in the protos
       */
      function checkMsg(msg, protos) {
        if (!protos || !msg) {
          console.warn('no protos or msg exist! msg : %j, protos : %j', msg, protos);
          return false;
        }

        for (var name in protos) {
          var proto = protos[name];

          //All required element must exist
          switch (proto.option) {
            case 'required':
              if (typeof(msg[name]) === 'undefined') {
                console.warn('no property exist for required! name: %j, proto: %j, msg: %j', name, proto, msg);
                return false;
              }
            case 'optional':
              if (typeof(msg[name]) !== 'undefined') {
                var message = protos.__messages[proto.type] || Encoder.protos['message ' + proto.type];
                if (!!message && !checkMsg(msg[name], message)) {
                  console.warn('inner proto error! name: %j, proto: %j, msg: %j', name, proto, msg);
                  return false;
                }
              }
              break;
            case 'repeated':
              //Check nest message in repeated elements
              var message = protos.__messages[proto.type] || Encoder.protos['message ' + proto.type];
              if (!!msg[name] && !!message) {
                for (var i = 0; i < msg[name].length; i++) {
                  if (!checkMsg(msg[name][i], message)) {
                    return false;
                  }
                }
              }
              break;
          }
        }

        return true;
      }

      function encodeMsg(buffer, offset, protos, msg) {
        for (var name in msg) {
          if (!!protos[name]) {
            var proto = protos[name];

            switch (proto.option) {
              case 'required':
              case 'optional':
                offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                offset = encodeProp(msg[name], proto.type, offset, buffer, protos);
                break;
              case 'repeated':
                if (!!msg[name] && msg[name].length > 0) {
                  offset = encodeArray(msg[name], proto, offset, buffer, protos);
                }
                break;
            }
          }
        }

        return offset;
      }

      function encodeProp(value, type, offset, buffer, protos) {
        var length = 0;

        switch (type) {
          case 'uInt32':
            offset = writeBytes(buffer, offset, codec.encodeUInt32(value));
            break;
          case 'int32':
          case 'sInt32':
            offset = writeBytes(buffer, offset, codec.encodeSInt32(value));
            break;
          case 'float':
            buffer.writeFloatLE(value, offset);
            offset += 4;
            break;
          case 'double':
            buffer.writeDoubleLE(value, offset);
            offset += 8;
            break;
          case 'string':
            length = Buffer.byteLength(value);

            //Encode length
            offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
            //write string
            buffer.write(value, offset, length);
            offset += length;
            break;
          default:
            var message = protos.__messages[type] || Encoder.protos['message ' + type];
            if (!!message) {
              //Use a tmp buffer to build an internal msg
              var tmpBuffer = new Buffer(Buffer.byteLength(JSON.stringify(value)) * 2);
              length = 0;

              length = encodeMsg(tmpBuffer, length, message, value);
              //Encode length
              offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
              //contact the object
              tmpBuffer.copy(buffer, offset, 0, length);

              offset += length;
            }
            break;
        }

        return offset;
      }

      /**
       * Encode reapeated properties, simple msg and object are decode differented
       */
      function encodeArray(array, proto, offset, buffer, protos) {
        var i = 0;
        if (util.isSimpleType(proto.type)) {
          offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
          offset = writeBytes(buffer, offset, codec.encodeUInt32(array.length));
          for (i = 0; i < array.length; i++) {
            offset = encodeProp(array[i], proto.type, offset, buffer);
          }
        } else {
          for (i = 0; i < array.length; i++) {
            offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
            offset = encodeProp(array[i], proto.type, offset, buffer, protos);
          }
        }

        return offset;
      }

      function writeBytes(buffer, offset, bytes) {
        for (var i = 0; i < bytes.length; i++) {
          buffer.writeUInt8(bytes[i], offset);
          offset++;
        }

        return offset;
      }

      function encodeTag(type, tag) {
        var value = constant.TYPES[type];

        if (value === undefined) value = 2;

        return codec.encodeUInt32((tag << 3) | value);
      }

    }).call(this, require("buffer").Buffer)
  }, {
    "./codec": 12,
    "./constant": 13,
    "./util": 18,
    "buffer": 2
  }],
  16: [function(require, module, exports) {
    var Parser = module.exports;

    /**
     * [parse the original protos, give the paresed result can be used by protobuf encode/decode.]
     * @param  {[Object]} protos Original protos, in a js map.
     * @return {[Object]} The presed result, a js object represent all the meta data of the given protos.
     */
    Parser.parse = function(protos) {
      var maps = {};
      for (var key in protos) {
        maps[key] = parseObject(protos[key]);
      }

      return maps;
    };

    /**
     * [parse a single protos, return a object represent the result. The method can be invocked recursively.]
     * @param  {[Object]} obj The origin proto need to parse.
     * @return {[Object]} The parsed result, a js object.
     */
    function parseObject(obj) {
      var proto = {};
      var nestProtos = {};
      var tags = {};

      for (var name in obj) {
        var tag = obj[name];
        var params = name.split(' ');

        switch (params[0]) {
          case 'message':
            if (params.length !== 2) {
              continue;
            }
            nestProtos[params[1]] = parseObject(tag);
            continue;
          case 'required':
          case 'optional':
          case 'repeated':
            {
              //params length should be 3 and tag can't be duplicated
              if (params.length !== 3 || !!tags[tag]) {
                continue;
              }
              proto[params[2]] = {
                option: params[0],
                type: params[1],
                tag: tag
              };
              tags[tag] = params[2];
            }
        }
      }

      proto.__messages = nestProtos;
      proto.__tags = tags;
      return proto;
    }
  }, {}],
  17: [function(require, module, exports) {
    (function(Buffer) {
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
      Protobuf.encode = function(key, msg) {
        return encoder.encode(key, msg);
      };

      Protobuf.encode2Bytes = function(key, msg) {
        var buffer = this.encode(key, msg);
        if (!buffer || !buffer.length) {
          console.warn('encode msg failed! key : %j, msg : %j', key, msg);
          return null;
        }
        var bytes = new Uint8Array(buffer.length);
        for (var offset = 0; offset < buffer.length; offset++) {
          bytes[offset] = buffer.readUInt8(offset);
        }

        return bytes;
      };

      Protobuf.encodeStr = function(key, msg, code) {
        code = code || 'base64';
        var buffer = Protobuf.encode(key, msg);
        return !!buffer ? buffer.toString(code) : buffer;
      };

      Protobuf.decode = function(key, msg) {
        return decoder.decode(key, msg);
      };

      Protobuf.decodeStr = function(key, str, code) {
        code = code || 'base64';
        var buffer = new Buffer(str, code);

        return !!buffer ? Protobuf.decode(key, buffer) : buffer;
      };

      Protobuf.parse = function(json) {
        return parser.parse(json);
      };

      Protobuf.setEncoderProtos = function(protos) {
        encoder.init(protos);
      };

      Protobuf.setDecoderProtos = function(protos) {
        decoder.init(protos);
      };

      Protobuf.init = function(opts) {
        //On the serverside, use serverProtos to encode messages send to client
        encoder.init(opts.encoderProtos);

        //On the serverside, user clientProtos to decode messages receive from clients
        decoder.init(opts.decoderProtos);

      };
    }).call(this, require("buffer").Buffer)
  }, {
    "./decoder": 14,
    "./encoder": 15,
    "./parser": 16,
    "buffer": 2
  }],
  18: [function(require, module, exports) {
    var util = module.exports;

    util.isSimpleType = function(type) {
      return (type === 'uInt32' ||
        type === 'sInt32' ||
        type === 'int32' ||
        type === 'uInt64' ||
        type === 'sInt64' ||
        type === 'float' ||
        type === 'double');
    };

    util.equal = function(obj0, obj1) {
      for (var key in obj0) {
        var m = obj0[key];
        var n = obj1[key];

        if (typeof(m) === 'object') {
          if (!util.equal(m, n)) {
            return false;
          }
        } else if (m !== n) {
          return false;
        }
      }

      return true;
    };
  }, {}],
  19: [function(require, module, exports) {
    module.exports = require('./lib/protocol');
  }, {
    "./lib/protocol": 20
  }],
  20: [function(require, module, exports) {
    (function(Buffer) {
      (function(exports, ByteArray, global) {
        var Protocol = exports;

        var PKG_HEAD_BYTES = 4;
        var MSG_FLAG_BYTES = 1;
        var MSG_ROUTE_CODE_BYTES = 2;
        var MSG_ID_MAX_BYTES = 5;
        var MSG_ROUTE_LEN_BYTES = 1;

        var MSG_ROUTE_CODE_MAX = 0xffff;

        var MSG_COMPRESS_ROUTE_MASK = 0x1;
        var MSG_TYPE_MASK = 0x7;

        var Package = Protocol.Package = {};
        var Message = Protocol.Message = {};

        Package.TYPE_HANDSHAKE = 1;
        Package.TYPE_HANDSHAKE_ACK = 2;
        Package.TYPE_HEARTBEAT = 3;
        Package.TYPE_DATA = 4;
        Package.TYPE_KICK = 5;

        Message.TYPE_REQUEST = 0;
        Message.TYPE_NOTIFY = 1;
        Message.TYPE_RESPONSE = 2;
        Message.TYPE_PUSH = 3;

        /**
         * pomele client encode
         * id message id;
         * route message route
         * msg message body
         * socketio current support string
         */
        Protocol.strencode = function(str) {
          if (typeof Buffer !== "undefined" && ByteArray === Buffer) {
            // encoding defaults to 'utf8'
            return (new Buffer(str));
          } else {
            var byteArray = new ByteArray(str.length * 3);
            var offset = 0;
            for (var i = 0; i < str.length; i++) {
              var charCode = str.charCodeAt(i);
              var codes = null;
              if (charCode <= 0x7f) {
                codes = [charCode];
              } else if (charCode <= 0x7ff) {
                codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)];
              } else {
                codes = [0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f)];
              }
              for (var j = 0; j < codes.length; j++) {
                byteArray[offset] = codes[j];
                ++offset;
              }
            }
            var _buffer = new ByteArray(offset);
            copyArray(_buffer, 0, byteArray, 0, offset);
            return _buffer;
          }
        };

        /**
         * client decode
         * msg String data
         * return Message Object
         */
        Protocol.strdecode = function(buffer) {
          if (typeof Buffer !== "undefined" && ByteArray === Buffer) {
            // encoding defaults to 'utf8'
            return buffer.toString();
          } else {
            var bytes = new ByteArray(buffer);
            var array = [];
            var offset = 0;
            var charCode = 0;
            var end = bytes.length;
            while (offset < end) {
              if (bytes[offset] < 128) {
                charCode = bytes[offset];
                offset += 1;
              } else if (bytes[offset] < 224) {
                charCode = ((bytes[offset] & 0x1f) << 6) + (bytes[offset + 1] & 0x3f);
                offset += 2;
              } else {
                charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
                offset += 3;
              }
              array.push(charCode);
            }
            return String.fromCharCode.apply(null, array);
          }
        };

        /**
         * Package protocol encode.
         *
         * Pomelo package format:
         * +------+-------------+------------------+
         * | type | body length |       body       |
         * +------+-------------+------------------+
         *
         * Head: 4bytes
         *   0: package type,
         *      1 - handshake,
         *      2 - handshake ack,
         *      3 - heartbeat,
         *      4 - data
         *      5 - kick
         *   1 - 3: big-endian body length
         * Body: body length bytes
         *
         * @param  {Number}    type   package type
         * @param  {ByteArray} body   body content in bytes
         * @return {ByteArray}        new byte array that contains encode result
         */
        Package.encode = function(type, body) {
          var length = body ? body.length : 0;
          var buffer = new ByteArray(PKG_HEAD_BYTES + length);
          var index = 0;
          buffer[index++] = type & 0xff;
          buffer[index++] = (length >> 16) & 0xff;
          buffer[index++] = (length >> 8) & 0xff;
          buffer[index++] = length & 0xff;
          if (body) {
            copyArray(buffer, index, body, 0, length);
          }
          return buffer;
        };

        /**
         * Package protocol decode.
         * See encode for package format.
         *
         * @param  {ByteArray} buffer byte array containing package content
         * @return {Object}           {type: package type, buffer: body byte array}
         */
        Package.decode = function(buffer) {
          var offset = 0;
          var bytes = new ByteArray(buffer);
          var length = 0;
          var rs = [];
          while (offset < bytes.length) {
            var type = bytes[offset++];
            length = ((bytes[offset++]) << 16 | (bytes[offset++]) << 8 | bytes[offset++]) >>> 0;
            var body = length ? new ByteArray(length) : null;
            if (body) {
              copyArray(body, 0, bytes, offset, length);
            }
            offset += length;
            rs.push({
              'type': type,
              'body': body
            });
          }
          return rs.length === 1 ? rs[0] : rs;
        };

        /**
         * Message protocol encode.
         *
         * @param  {Number} id            message id
         * @param  {Number} type          message type
         * @param  {Number} compressRoute whether compress route
         * @param  {Number|String} route  route code or route string
         * @param  {Buffer} msg           message body bytes
         * @return {Buffer}               encode result
         */
        Message.encode = function(id, type, compressRoute, route, msg) {
          // caculate message max length
          var idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0;
          var msgLen = MSG_FLAG_BYTES + idBytes;

          if (msgHasRoute(type)) {
            if (compressRoute) {
              if (typeof route !== 'number') {
                throw new Error('error flag for number route!');
              }
              msgLen += MSG_ROUTE_CODE_BYTES;
            } else {
              msgLen += MSG_ROUTE_LEN_BYTES;
              if (route) {
                route = Protocol.strencode(route);
                if (route.length > 255) {
                  throw new Error('route maxlength is overflow');
                }
                msgLen += route.length;
              }
            }
          }

          if (msg) {
            msgLen += msg.length;
          }

          var buffer = new ByteArray(msgLen);
          var offset = 0;

          // add flag
          offset = encodeMsgFlag(type, compressRoute, buffer, offset);

          // add message id
          if (msgHasId(type)) {
            offset = encodeMsgId(id, buffer, offset);
          }

          // add route
          if (msgHasRoute(type)) {
            offset = encodeMsgRoute(compressRoute, route, buffer, offset);
          }

          // add body
          if (msg) {
            offset = encodeMsgBody(msg, buffer, offset);
          }

          return buffer;
        };

        /**
         * Message protocol decode.
         *
         * @param  {Buffer|Uint8Array} buffer message bytes
         * @return {Object}            message object
         */
        Message.decode = function(buffer) {
          var bytes = new ByteArray(buffer);
          var bytesLen = bytes.length || bytes.byteLength;
          var offset = 0;
          var id = 0;
          var route = null;

          // parse flag
          var flag = bytes[offset++];
          var compressRoute = flag & MSG_COMPRESS_ROUTE_MASK;
          var type = (flag >> 1) & MSG_TYPE_MASK;

          // parse id
          if (msgHasId(type)) {
            var m = 0;
            var i = 0;
            do {
              m = parseInt(bytes[offset]);
              id += (m & 0x7f) << (7 * i);
              offset++;
              i++;
            } while (m >= 128);
          }

          // parse route
          if (msgHasRoute(type)) {
            if (compressRoute) {
              route = (bytes[offset++]) << 8 | bytes[offset++];
            } else {
              var routeLen = bytes[offset++];
              if (routeLen) {
                route = new ByteArray(routeLen);
                copyArray(route, 0, bytes, offset, routeLen);
                route = Protocol.strdecode(route);
              } else {
                route = '';
              }
              offset += routeLen;
            }
          }

          // parse body
          var bodyLen = bytesLen - offset;
          var body = new ByteArray(bodyLen);

          copyArray(body, 0, bytes, offset, bodyLen);

          return {
            'id': id,
            'type': type,
            'compressRoute': compressRoute,
            'route': route,
            'body': body
          };
        };

        var copyArray = function(dest, doffset, src, soffset, length) {
          if ('function' === typeof src.copy) {
            // Buffer
            src.copy(dest, doffset, soffset, soffset + length);
          } else {
            // Uint8Array
            for (var index = 0; index < length; index++) {
              dest[doffset++] = src[soffset++];
            }
          }
        };

        var msgHasId = function(type) {
          return type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE;
        };

        var msgHasRoute = function(type) {
          return type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY ||
            type === Message.TYPE_PUSH;
        };

        var caculateMsgIdBytes = function(id) {
          var len = 0;
          do {
            len += 1;
            id >>= 7;
          } while (id > 0);
          return len;
        };

        var encodeMsgFlag = function(type, compressRoute, buffer, offset) {
          if (type !== Message.TYPE_REQUEST && type !== Message.TYPE_NOTIFY &&
            type !== Message.TYPE_RESPONSE && type !== Message.TYPE_PUSH) {
            throw new Error('unkonw message type: ' + type);
          }

          buffer[offset] = (type << 1) | (compressRoute ? 1 : 0);

          return offset + MSG_FLAG_BYTES;
        };

        var encodeMsgId = function(id, buffer, offset) {
          do {
            var tmp = id % 128;
            var next = Math.floor(id / 128);

            if (next !== 0) {
              tmp = tmp + 128;
            }
            buffer[offset++] = tmp;

            id = next;
          } while (id !== 0);

          return offset;
        };

        var encodeMsgRoute = function(compressRoute, route, buffer, offset) {
          if (compressRoute) {
            if (route > MSG_ROUTE_CODE_MAX) {
              throw new Error('route number is overflow');
            }

            buffer[offset++] = (route >> 8) & 0xff;
            buffer[offset++] = route & 0xff;
          } else {
            if (route) {
              buffer[offset++] = route.length & 0xff;
              copyArray(buffer, offset, route, 0, route.length);
              offset += route.length;
            } else {
              buffer[offset++] = 0;
            }
          }

          return offset;
        };

        var encodeMsgBody = function(msg, buffer, offset) {
          copyArray(buffer, offset, msg, 0, msg.length);
          return offset + msg.length;
        };

        module.exports = Protocol;
        if (typeof(window) != "undefined") {
          window.Protocol = Protocol;
        }
      })(typeof(window) == "undefined" ? module.exports : (this.Protocol = {}), typeof(window) == "undefined" ? Buffer : Uint8Array, this);

    }).call(this, require("buffer").Buffer)
  }, {
    "buffer": 2
  }]
}, {}, [1]);
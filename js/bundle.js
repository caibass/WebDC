require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],3:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

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

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
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

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
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

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
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

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
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

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
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

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
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

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

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
    } else if (codePoint < 0x110000) {
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

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":2,"buffer":3,"ieee754":5}],4:[function(require,module,exports){
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

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],5:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],6:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

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

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":7}],7:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],8:[function(require,module,exports){
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
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],9:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],10:[function(require,module,exports){
(function (process,global){
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
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
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
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
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
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
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

  var base = '', array = false, braces = ['{', '}'];

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
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
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
         typeof arg === 'symbol' ||  // ES6 symbol
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
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":9,"_process":7,"inherits":8}],11:[function(require,module,exports){
(function (process,__filename){
/**
 * Module dependencies.
 */

var fs = require('fs'),
  path = require('path'),
  fileURLToPath = require('file-uri-to-path'),
  join = path.join,
  dirname = path.dirname,
  exists =
    (fs.accessSync &&
      function(path) {
        try {
          fs.accessSync(path);
        } catch (e) {
          return false;
        }
        return true;
      }) ||
    fs.existsSync ||
    path.existsSync,
  defaults = {
    arrow: process.env.NODE_BINDINGS_ARROW || ' → ',
    compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled',
    platform: process.platform,
    arch: process.arch,
    nodePreGyp:
      'node-v' +
      process.versions.modules +
      '-' +
      process.platform +
      '-' +
      process.arch,
    version: process.versions.node,
    bindings: 'bindings.node',
    try: [
      // node-gyp's linked version in the "build" dir
      ['module_root', 'build', 'bindings'],
      // node-waf and gyp_addon (a.k.a node-gyp)
      ['module_root', 'build', 'Debug', 'bindings'],
      ['module_root', 'build', 'Release', 'bindings'],
      // Debug files, for development (legacy behavior, remove for node v0.9)
      ['module_root', 'out', 'Debug', 'bindings'],
      ['module_root', 'Debug', 'bindings'],
      // Release files, but manually compiled (legacy behavior, remove for node v0.9)
      ['module_root', 'out', 'Release', 'bindings'],
      ['module_root', 'Release', 'bindings'],
      // Legacy from node-waf, node <= 0.4.x
      ['module_root', 'build', 'default', 'bindings'],
      // Production "Release" buildtype binary (meh...)
      ['module_root', 'compiled', 'version', 'platform', 'arch', 'bindings'],
      // node-qbs builds
      ['module_root', 'addon-build', 'release', 'install-root', 'bindings'],
      ['module_root', 'addon-build', 'debug', 'install-root', 'bindings'],
      ['module_root', 'addon-build', 'default', 'install-root', 'bindings'],
      // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
      ['module_root', 'lib', 'binding', 'nodePreGyp', 'bindings']
    ]
  };

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings(opts) {
  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts };
  } else if (!opts) {
    opts = {};
  }

  // maps `defaults` onto `opts` object
  Object.keys(defaults).map(function(i) {
    if (!(i in opts)) opts[i] = defaults[i];
  });

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName());
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node';
  }

  // https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
  var requireFunc =
    typeof __webpack_require__ === 'function'
      ? __non_webpack_require__
      : require;

  var tries = [],
    i = 0,
    l = opts.try.length,
    n,
    b,
    err;

  for (; i < l; i++) {
    n = join.apply(
      null,
      opts.try[i].map(function(p) {
        return opts[p] || p;
      })
    );
    tries.push(n);
    try {
      b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
      if (!opts.path) {
        b.path = n;
      }
      return b;
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND' &&
          e.code !== 'QUALIFIED_PATH_RESOLUTION_FAILED' &&
          !/not find/i.test(e.message)) {
        throw e;
      }
    }
  }

  err = new Error(
    'Could not locate the bindings file. Tried:\n' +
      tries
        .map(function(a) {
          return opts.arrow + a;
        })
        .join('\n')
  );
  err.tries = tries;
  throw err;
}
module.exports = exports = bindings;

/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName(calling_file) {
  var origPST = Error.prepareStackTrace,
    origSTL = Error.stackTraceLimit,
    dummy = {},
    fileName;

  Error.stackTraceLimit = 10;

  Error.prepareStackTrace = function(e, st) {
    for (var i = 0, l = st.length; i < l; i++) {
      fileName = st[i].getFileName();
      if (fileName !== __filename) {
        if (calling_file) {
          if (fileName !== calling_file) {
            return;
          }
        } else {
          return;
        }
      }
    }
  };

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy);
  dummy.stack;

  // cleanup
  Error.prepareStackTrace = origPST;
  Error.stackTraceLimit = origSTL;

  // handle filename that starts with "file://"
  var fileSchema = 'file://';
  if (fileName.indexOf(fileSchema) === 0) {
    fileName = fileURLToPath(fileName);
  }

  return fileName;
};

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot(file) {
  var dir = dirname(file),
    prev;
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd();
    }
    if (
      exists(join(dir, 'package.json')) ||
      exists(join(dir, 'node_modules'))
    ) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir;
    }
    if (prev === dir) {
      // Got to the top
      throw new Error(
        'Could not find module root given file: "' +
          file +
          '". Do you have a `package.json` file? '
      );
    }
    // Try the parent dir next
    prev = dir;
    dir = join(dir, '..');
  }
};

}).call(this,require('_process'),"/bindings/bindings.js")
},{"_process":7,"file-uri-to-path":12,"fs":1,"path":6}],12:[function(require,module,exports){

/**
 * Module dependencies.
 */

var sep = require('path').sep || '/';

/**
 * Module exports.
 */

module.exports = fileUriToPath;

/**
 * File URI to Path function.
 *
 * @param {String} uri
 * @return {String} path
 * @api public
 */

function fileUriToPath (uri) {
  if ('string' != typeof uri ||
      uri.length <= 7 ||
      'file://' != uri.substring(0, 7)) {
    throw new TypeError('must pass in a file:// URI to convert to a file path');
  }

  var rest = decodeURI(uri.substring(7));
  var firstSlash = rest.indexOf('/');
  var host = rest.substring(0, firstSlash);
  var path = rest.substring(firstSlash + 1);

  // 2.  Scheme Definition
  // As a special case, <host> can be the string "localhost" or the empty
  // string; this is interpreted as "the machine from which the URL is
  // being interpreted".
  if ('localhost' == host) host = '';

  if (host) {
    host = sep + sep + host;
  }

  // 3.2  Drives, drive letters, mount points, file system root
  // Drive letters are mapped into the top of a file URI in various ways,
  // depending on the implementation; some applications substitute
  // vertical bar ("|") for the colon after the drive letter, yielding
  // "file:///c|/tmp/test.txt".  In some cases, the colon is left
  // unchanged, as in "file:///c:/tmp/test.txt".  In other cases, the
  // colon is simply omitted, as in "file:///c/tmp/test.txt".
  path = path.replace(/^(.+)\|/, '$1:');

  // for Windows, we need to invert the path separators from what a URI uses
  if (sep == '\\') {
    path = path.replace(/\//g, '\\');
  }

  if (/^.+\:/.test(path)) {
    // has Windows drive at beginning of path
  } else {
    // unix path…
    path = sep + path;
  }

  return host + path;
}

},{"path":6}],13:[function(require,module,exports){
(function (process,Buffer){
var usb = exports = module.exports = require('bindings')('usb_bindings');
var events = require('events')
var util = require('util')

var isBuffer = function(obj) {
	return obj && obj instanceof Uint8Array
}

if (usb.INIT_ERROR) {
	console.warn("Failed to initialize libusb.")
	usb.Device = function () { throw new Error("Device cannot be instantiated directly.") };
	usb.Transfer = function () { throw new Error("Transfer cannot be instantiated directly.") };
	usb.setDebugLevel = function () { };
	usb.getDeviceList = function () { return []; };
	usb._enableHotplugEvents = function () { };
	usb._disableHotplugEvents = function () { };
}

Object.keys(events.EventEmitter.prototype).forEach(function (key) {
	exports[key] = events.EventEmitter.prototype[key];
});

// convenience method for finding a device by vendor and product id
exports.findByIds = function(vid, pid) {
	var devices = usb.getDeviceList()

	for (var i = 0; i < devices.length; i++) {
		var deviceDesc = devices[i].deviceDescriptor
		if ((deviceDesc.idVendor == vid) && (deviceDesc.idProduct == pid)) {
			return devices[i]
		}
	}
}

usb.Device.prototype.timeout = 1000

usb.Device.prototype.open = function(defaultConfig){
	this.__open()
	if (defaultConfig === false) return
	this.interfaces = []
	var len = this.configDescriptor ? this.configDescriptor.interfaces.length : 0
	for (var i=0; i<len; i++){
		this.interfaces[i] = new Interface(this, i)
	}
}

usb.Device.prototype.close = function(){
	this.__close()
	this.interfaces = null
}

Object.defineProperty(usb.Device.prototype, "configDescriptor", {
	get: function() {
		try {
			return this._configDescriptor || (this._configDescriptor = this.__getConfigDescriptor())
		} catch(e) {
			// Check descriptor exists
			if (e.errno == usb.LIBUSB_ERROR_NOT_FOUND) return null;
			throw e;
		}
	}
});

Object.defineProperty(usb.Device.prototype, "allConfigDescriptors", {
	get: function() {
		try {
			return this._allConfigDescriptors || (this._allConfigDescriptors = this.__getAllConfigDescriptors())
		} catch(e) {
			// Check descriptors exist
			if (e.errno == usb.LIBUSB_ERROR_NOT_FOUND) return [];
			throw e;
		}
	}
});

Object.defineProperty(usb.Device.prototype, "parent", {
	get: function() {
		return this._parent || (this._parent = this.__getParent())
	}
});

usb.Device.prototype.interface = function(addr){
	if (!this.interfaces){
		throw new Error("Device must be open before searching for interfaces")
	}
	addr = addr || 0
	for (var i=0; i<this.interfaces.length; i++){
		if (this.interfaces[i].interfaceNumber == addr){
			return this.interfaces[i]
		}
	}
}

var SETUP_SIZE = usb.LIBUSB_CONTROL_SETUP_SIZE

usb.Device.prototype.controlTransfer =
function(bmRequestType, bRequest, wValue, wIndex, data_or_length, callback){
	var self = this
	var isIn = !!(bmRequestType & usb.LIBUSB_ENDPOINT_IN)
	var wLength

	if (isIn){
		if (!(data_or_length >= 0)){
			throw new TypeError("Expected size number for IN transfer (based on bmRequestType)")
		}
		wLength = data_or_length
	}else{
		if (!isBuffer(data_or_length)){
			throw new TypeError("Expected buffer for OUT transfer (based on bmRequestType)")
		}
		wLength = data_or_length.length
	}

	// Buffer for the setup packet
	// http://libusbx.sourceforge.net/api-1.0/structlibusb__control__setup.html
	var buf = Buffer.alloc(wLength + SETUP_SIZE)
	buf.writeUInt8(   bmRequestType, 0)
	buf.writeUInt8(   bRequest,      1)
	buf.writeUInt16LE(wValue,        2)
	buf.writeUInt16LE(wIndex,        4)
	buf.writeUInt16LE(wLength,       6)

	if (!isIn){
		buf.set(data_or_length, SETUP_SIZE)
	}

	var transfer = new usb.Transfer(this, 0, usb.LIBUSB_TRANSFER_TYPE_CONTROL, this.timeout,
		function(error, buf, actual){
			if (callback){
				if (isIn){
					callback.call(self, error, buf.slice(SETUP_SIZE, SETUP_SIZE + actual))
				}else{
					callback.call(self, error)
				}
			}
		}
	)

	try {
		transfer.submit(buf)
	} catch (e) {
		if (callback){
			process.nextTick(function() { callback.call(self, e); });
		}
	}
	return this;
}

usb.Device.prototype.getStringDescriptor = function (desc_index, callback) {
	var langid = 0x0409;
	var length = 255;
	this.controlTransfer(
		usb.LIBUSB_ENDPOINT_IN,
		usb.LIBUSB_REQUEST_GET_DESCRIPTOR,
		((usb.LIBUSB_DT_STRING << 8) | desc_index),
		langid,
		length,
		function (error, buf) {
			if (error) return callback(error);
			callback(undefined, buf.toString('utf16le', 2));
		}
	);
}

usb.Device.prototype.getBosDescriptor = function (callback) {

	if (this._bosDescriptor) {
		// Cached descriptor
		return callback(undefined, this._bosDescriptor);
	}

	if (this.deviceDescriptor.bcdUSB < 0x201) {
		// BOS is only supported from USB 2.0.1
		return callback(undefined, null);
	}

	this.controlTransfer(
		usb.LIBUSB_ENDPOINT_IN,
		usb.LIBUSB_REQUEST_GET_DESCRIPTOR,
		(usb.LIBUSB_DT_BOS << 8),
		0,
		usb.LIBUSB_DT_BOS_SIZE,
		function (error, buffer) {
			if (error) {
				// Check BOS descriptor exists
				if (error.errno == usb.LIBUSB_TRANSFER_STALL) return callback(undefined, null);
				return callback(error, null);
			}

			var totalLength = buffer.readUInt16LE(2);
			this.controlTransfer(
				usb.LIBUSB_ENDPOINT_IN,
				usb.LIBUSB_REQUEST_GET_DESCRIPTOR,
				(usb.LIBUSB_DT_BOS << 8),
				0,
				totalLength,
				function (error, buffer) {
					if (error) {
						// Check BOS descriptor exists
						if (error.errno == usb.LIBUSB_TRANSFER_STALL) return callback(undefined, null);
						return callback(error, null);
					}

					var descriptor = {
						bLength: buffer.readUInt8(0),
						bDescriptorType: buffer.readUInt8(1),
						wTotalLength: buffer.readUInt16LE(2),
						bNumDeviceCaps: buffer.readUInt8(4),
						capabilities: []
					};

					var i = usb.LIBUSB_DT_BOS_SIZE;
					while (i < descriptor.wTotalLength) {
						var capability = {
							bLength: buffer.readUInt8(i + 0),
							bDescriptorType: buffer.readUInt8(i + 1),
							bDevCapabilityType: buffer.readUInt8(i + 2)
						};

						capability.dev_capability_data = buffer.slice(i + 3, i + capability.bLength);
						descriptor.capabilities.push(capability);
						i += capability.bLength;
					}

					// Cache descriptor
					this._bosDescriptor = descriptor;
					callback(undefined, this._bosDescriptor);
				}
			);
		}
	);
}

usb.Device.prototype.getCapabilities = function (callback) {
	var capabilities = [];
	var self = this;

	this.getBosDescriptor(function(error, descriptor) {
		if (error) return callback(error, null);

		var len = descriptor ? descriptor.capabilities.length : 0
		for (var i=0; i<len; i++){
			capabilities.push(new Capability(self, i))
		}

		callback(undefined, capabilities);
	});
}

usb.Device.prototype.setConfiguration = function(desired, cb) {
	var self = this;
	this.__setConfiguration(desired, function(err) {
		if (!err) {
			this.interfaces = []
			var len = this.configDescriptor ? this.configDescriptor.interfaces.length : 0
			for (var i=0; i<len; i++) {
				this.interfaces[i] = new Interface(this, i)
			}
		}
		cb.call(self, err)
	});
}

function Interface(device, id){
	this.device = device
	this.id = id
	this.altSetting = 0;
	this.__refresh()
}

Interface.prototype.__refresh = function(){
	this.descriptor = this.device.configDescriptor.interfaces[this.id][this.altSetting]
	this.interfaceNumber = this.descriptor.bInterfaceNumber
	this.endpoints = []
	var len = this.descriptor.endpoints.length
	for (var i=0; i<len; i++){
		var desc = this.descriptor.endpoints[i]
		var c = (desc.bEndpointAddress&usb.LIBUSB_ENDPOINT_IN)?InEndpoint:OutEndpoint
		this.endpoints[i] = new c(this.device, desc)
	}
}

Interface.prototype.claim = function(){
	this.device.__claimInterface(this.id)
}

Interface.prototype.release = function(closeEndpoints, cb){
	var self = this;
	if (typeof closeEndpoints == 'function') {
		cb = closeEndpoints;
		closeEndpoints = null;
	}

	if (!closeEndpoints || this.endpoints.length == 0) {
		next();
	} else {
		var n = self.endpoints.length;
		self.endpoints.forEach(function (ep, i) {
			if (ep.pollActive) {
				ep.once('end', function () {
					if (--n == 0) next();
				});
				ep.stopPoll();
			} else {
				if (--n == 0) next();
			}
		});
	}

	function next () {
		self.device.__releaseInterface(self.id, function(err){
			if (!err){
				self.altSetting = 0;
				self.__refresh()
			}
			cb.call(self, err)
		})
	}
}

Interface.prototype.isKernelDriverActive = function(){
	return this.device.__isKernelDriverActive(this.id)
}

Interface.prototype.detachKernelDriver = function() {
	return this.device.__detachKernelDriver(this.id)
};

Interface.prototype.attachKernelDriver = function() {
	return this.device.__attachKernelDriver(this.id)
};


Interface.prototype.setAltSetting = function(altSetting, cb){
	var self = this;
	this.device.__setInterface(this.id, altSetting, function(err){
		if (!err){
			self.altSetting = altSetting;
			self.__refresh();
		}
		cb.call(self, err)
	})
}

Interface.prototype.endpoint = function(addr){
	for (var i=0; i<this.endpoints.length; i++){
		if (this.endpoints[i].address == addr){
			return this.endpoints[i]
		}
	}
}

function Capability(device, id){
	this.device = device
	this.id = id
	this.descriptor = this.device._bosDescriptor.capabilities[this.id]
	this.type = this.descriptor.bDevCapabilityType
	this.data = this.descriptor.dev_capability_data
}

function Endpoint(device, descriptor){
	this.device = device
	this.descriptor = descriptor
	this.address = descriptor.bEndpointAddress
	this.transferType = descriptor.bmAttributes&0x03
}
util.inherits(Endpoint, events.EventEmitter)

Endpoint.prototype.timeout = 0

Endpoint.prototype.clearHalt = function(callback){
	return this.device.__clearHalt(this.address, callback);
}

Endpoint.prototype.makeTransfer = function(timeout, callback){
	return new usb.Transfer(this.device, this.address, this.transferType, timeout, callback)
}

Endpoint.prototype.startPoll = function(nTransfers, transferSize, callback){
	if (this.pollTransfers){
		throw new Error("Polling already active")
	}

	nTransfers = nTransfers || 3;
	this.pollTransferSize = transferSize || this.descriptor.wMaxPacketSize;
	this.pollActive = true
	this.pollPending = 0

	var transfers = []
	for (var i=0; i<nTransfers; i++){
		transfers[i] = this.makeTransfer(0, callback)
	}
	return transfers;
}

Endpoint.prototype.stopPoll = function(cb){
	if (!this.pollTransfers) {
		throw new Error('Polling is not active.');
	}
	for (var i=0; i<this.pollTransfers.length; i++){
		try {
			this.pollTransfers[i].cancel()
		} catch (err) {
			this.emit('error', err);
		}
	}
	this.pollActive = false
	if (cb) this.once('end', cb);
}

function InEndpoint(device, descriptor){
	Endpoint.call(this, device, descriptor)
}

exports.InEndpoint = InEndpoint
util.inherits(InEndpoint, Endpoint)
InEndpoint.prototype.direction = "in"

InEndpoint.prototype.transfer = function(length, cb){
	var self = this
	var buffer = Buffer.alloc(length)

	function callback(error, buf, actual){
		cb.call(self, error, buffer.slice(0, actual))
	}

	try {
		this.makeTransfer(this.timeout, callback).submit(buffer)
	} catch (e) {
		process.nextTick(function() { cb.call(self, e); });
	}
	return this;
}

InEndpoint.prototype.startPoll = function(nTransfers, transferSize){
	var self = this
	this.pollTransfers = InEndpoint.super_.prototype.startPoll.call(this, nTransfers, transferSize, transferDone)

	function transferDone(error, buf, actual){
		if (!error){
			self.emit("data", buf.slice(0, actual))
		}else if (error.errno != usb.LIBUSB_TRANSFER_CANCELLED){
			self.emit("error", error)
			self.stopPoll()
		}

		if (self.pollActive){
			startTransfer(this)
		}else{
			self.pollPending--

			if (self.pollPending == 0){
				delete self.pollTransfers;
				self.emit('end')
			}
		}
	}

	function startTransfer(t){
		try {
			t.submit(Buffer.alloc(self.pollTransferSize), transferDone);
		} catch (e) {
			self.emit("error", e);
			self.stopPoll();
		}
	}

	this.pollTransfers.forEach(startTransfer)
	self.pollPending = this.pollTransfers.length
}



function OutEndpoint(device, descriptor){
	Endpoint.call(this, device, descriptor)
}
exports.OutEndpoint = OutEndpoint
util.inherits(OutEndpoint, Endpoint)
OutEndpoint.prototype.direction = "out"

OutEndpoint.prototype.transfer = function(buffer, cb){
	var self = this
	if (!buffer){
		buffer = Buffer.alloc(0)
	}else if (!isBuffer(buffer)){
		buffer = Buffer.from(buffer)
	}

	function callback(error, buf, actual){
		if (cb) cb.call(self, error)
	}

	try {
		this.makeTransfer(this.timeout, callback).submit(buffer);
	} catch (e) {
		process.nextTick(function() { callback(e); });
	}

	return this;
}

OutEndpoint.prototype.transferWithZLP = function (buf, cb) {
	if (buf.length % this.descriptor.wMaxPacketSize == 0) {
		this.transfer(buf);
		this.transfer(Buffer.alloc(0), cb);
	} else {
		this.transfer(buf, cb);
	}
}

var hotplugListeners = 0;
exports.on('newListener', function(name) {
	if (name !== 'attach' && name !== 'detach') return;
	if (++hotplugListeners === 1) {
		usb._enableHotplugEvents();
	}
});

exports.on('removeListener', function(name) {
	if (name !== 'attach' && name !== 'detach') return;
	if (--hotplugListeners === 0) {
		usb._disableHotplugEvents();
	}
});

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":7,"bindings":11,"buffer":3,"events":4,"util":10}],14:[function(require,module,exports){
const KEY = {
  scanning_mode: 'scanning_mode',
  auto_exposure_mode: 'auto_exposure_mode',
  auto_exposure_priority: 'auto_exposure_priority',
  absolute_exposure_time: 'absolute_exposure_time',
  relative_exposure_time: 'relative_exposure_time',
  absolute_focus: 'absolute_focus',
  relative_focus: 'relative_focus',
  absolute_iris: 'absolute_iris',
  relative_iris: 'relative_iris',
  absolute_zoom: 'absolute_zoom',
  relative_zoom: 'relative_zoom',
  absolute_pan_tilt: 'absolute_pan_tilt',
  relative_pan_tilt: 'relative_pan_tilt',
  absolute_roll: 'absolute_roll',
  relative_roll: 'relative_roll',
  auto_focus: 'auto_focus',
  privacy: 'privacy',
  brightness: 'brightness',
  contrast: 'contrast',
  hue: 'hue',
  saturation: 'saturation',
  sharpness: 'sharpness',
  gamma: 'gamma',
  white_balance_temperature: 'white_balance_temperature',
  white_balance_component: 'white_balance_component',
  backlight_compensation: 'backlight_compensation',
  gain: 'gain',
  power_line_frequency: 'power_line_frequency',
  auto_hue: 'auto_hue',
  auto_white_balance_temperature: 'auto_white_balance_temperature',
  auto_white_balance_component: 'auto_white_balance_component',
  digital_multiplier: 'digital_multiplier',
  digital_multiplier_limit: 'digital_multiplier_limit',
  analog_video_standard: 'analog_video_standard',
  analog_lock_status: 'analog_lock_status',
  NONE: 'NONE',
  NTSC_525_60: 'NTSC_525_60',
  PAL_625_50: 'PAL_625_50',
  SECAM_625_50: 'SECAM_625_50',
  NTSC_625_50: 'NTSC_625_50',
  PAL_525_60: 'PAL_525_60',
}

const FIELD_TYPE = {
  BOOLEAN: 'BOOLEAN',
  BITMAP: 'BITMAP',
  NUMBER: 'NUMBER',
}

const BM_REQUEST_TYPE = {
  GET: 0b10100001,
  SET: 0b00100001,
}

const CS = {
  UNDEFINED: 0x20,
  DEVICE: 0x21,
  CONFIGURATION: 0x22,
  STRING: 0x23,
  INTERFACE: 0x24,
  ENDPOINT: 0x25,
}

const REQUEST = {
  RC_UNDEFINED: 0x00,
  SET_CUR: 0x01,
  GET_CUR: 0x81,
  GET_MIN: 0x82,
  GET_MAX: 0x83,
  GET_RES: 0x84,
  GET_LEN: 0x85,
  GET_INFO: 0x86,
  GET_DEF: 0x87,
}

const VS = {
  UNDEFINED: 0x00,
  PROBE_CONTROL: 0x01,
  COMMIT_CONTROL: 0x02,
  STILL_PROBE_CONTROL: 0x03,
  STILL_COMMIT_CONTROL: 0x04,
  STILL_IMAGE_TRIGGER_CONTROL: 0x05,
  STREAM_ERROR_CODE_CONTROL: 0x06,
  GENERATE_KEY_FRAME_CONTROL: 0x07,
  UPDATE_FRAME_SEGMENT_CONTROL: 0x08,
  SYNCH_DELAY_CONTROL: 0x09,
}

// A.6. Video Class-Specific VS Interface Descriptor Subtypes
const VS_DESCRIPTOR_SUBTYPE = {
  UNDEFINED: 0x00,
  INPUT_HEADER: 0x01,
  OUTPUT_HEADER: 0x02,
  STILL_IMAGE_FRAME: 0x03,
  FORMAT_UNCOMPRESSED: 0x04,
  FRAME_UNCOMPRESSED: 0x05,
  FORMAT_MJPEG: 0x06,
  FRAME_MJPEG: 0x07,
  FORMAT_MPEG2TS: 0x0A,
  FORMAT_DV: 0x0C,
  COLORFORMAT: 0x0D,
  FORMAT_FRAME_BASED: 0x10,
  FRAME_FRAME_BASED: 0x11,
  FORMAT_STREAM_BASED: 0x12,
}

const PU = {
  CONTROL_UNDEFINED: 0x00,
  BACKLIGHT_COMPENSATION_CONTROL: 0x01,
  BRIGHTNESS_CONTROL: 0x02,
  CONTRAST_CONTROL: 0x03,
  GAIN_CONTROL: 0x04,
  POWER_LINE_FREQUENCY_CONTROL: 0x05,
  HUE_CONTROL: 0x06,
  SATURATION_CONTROL: 0x07,
  SHARPNESS_CONTROL: 0x08,
  GAMMA_CONTROL: 0x09,
  WHITE_BALANCE_TEMPERATURE_CONTROL: 0x0A,
  WHITE_BALANCE_TEMPERATURE_AUTO_CONTROL: 0x0B,
  WHITE_BALANCE_COMPONENT_CONTROL: 0x0C,
  WHITE_BALANCE_COMPONENT_AUTO_CONTROL: 0x0D,
  DIGITAL_MULTIPLIER_CONTROL: 0x0E,
  DIGITAL_MULTIPLIER_LIMIT_CONTROL: 0x0F,
  HUE_AUTO_CONTROL: 0x10,
  ANALOG_VIDEO_STANDARD_CONTROL: 0x11,
  ANALOG_LOCK_STATUS_CONTROL: 0x12,
}

const CT = {
  CONTROL_UNDEFINED: 0x00,
  SCANNING_MODE_CONTROL: 0x01,
  AE_MODE_CONTROL: 0x02,
  AE_PRIORITY_CONTROL: 0x03,
  EXPOSURE_TIME_ABSOLUTE_CONTROL: 0x04,
  EXPOSURE_TIME_RELATIVE_CONTROL: 0x05,
  FOCUS_ABSOLUTE_CONTROL: 0x06,
  FOCUS_RELATIVE_CONTROL: 0x07,
  FOCUS_AUTO_CONTROL: 0x08,
  IRIS_ABSOLUTE_CONTROL: 0x09,
  IRIS_RELATIVE_CONTROL: 0x0A,
  ZOOM_ABSOLUTE_CONTROL: 0x0B,
  ZOOM_RELATIVE_CONTROL: 0x0C,
  PANTILT_ABSOLUTE_CONTROL: 0x0D,
  PANTILT_RELATIVE_CONTROL: 0x0E,
  ROLL_ABSOLUTE_CONTROL: 0x0F,
  ROLL_RELATIVE_CONTROL: 0x10,
  PRIVACY_CONTROL: 0x11,
}

const VC = {
  DESCRIPTOR_UNDEFINED: 0x00,
  HEADER: 0x01,
  INPUT_TERMINAL: 0x02,
  OUTPUT_TERMINAL: 0x03,
  SELECTOR_UNIT: 0x04,
  PROCESSING_UNIT: 0x05,
  EXTENSION_UNIT: 0x06,
}

const CC = {
  VIDEO: 0x0e,
}

const EP = {
  UNDEFINED: 0x00,
  GENERAL: 0x01,
  ENDPOINT: 0x02,
  INTERRUPT: 0x03,
}

const SC = {
  UNDEFINED: 0x00,
  VIDEOCONTROL: 0x01,
  VIDEOSTREAMING: 0x02,
  VIDEO_INTERFACE_COLLECTION: 0x03,
}

module.exports = {
  EP,
  SC,
  CC,
  VC,
  CT,
  CS,
  PU,
  VS,
  KEY,
  REQUEST,
  BM_REQUEST_TYPE,
  VS_DESCRIPTOR_SUBTYPE,
  FIELD_TYPE,
}

},{}],15:[function(require,module,exports){
// See USB Device Class Definition for Video Devices Revision 1.1
// http://www.usb.org/developers/docs/devclass_docs/

const {
  FIELD_TYPE,
  REQUEST,
  PU,
  CT,
  VS,
  KEY,
} = require('./constants')

const CONTROLS = {

  // still_image_trigger: {
  //   description: `This control notifies the device to begin sending still-image data over the relevant isochronous or bulk pipe. A dedicated still-image bulk pipe is only used for method 3 of still image capture. This control shall only be set while streaming is occurring, and the hardware shall reset it to the "Normal Operation" mode after the still image has been sent. This control is only required if the device supports method 2 or method 3 of still-image retrieval. See section 2.4.2.4 "Still Image Capture". `,
  //   selector: VS.STILL_IMAGE_TRIGGER_CONTROL,
  //   type: 'CT',
  //   // type: 'VS',
  //   wLength: 1,
  //   requests: [
  //     REQUEST.SET_CUR,
  //     REQUEST.GET_CUR,
  //     REQUEST.GET_INFO,
  //   ],
  //   fields: [{
  //     name: 'bTrigger',
  //     description: 'The setting for the Still Image Trigger Control',
  //     offset: 0,
  //     size: 1,
  //     type: FIELD_TYPE.NUMBER,
  //     options: {
  //       NORMAL: 0,
  //       TRANSMIT: 1,
  //       TRANSMIT_BULK: 2,
  //       ABORT: 3,
  //     }
  //   }]
  // },
  // ==============
  // Input Terminal
  // ==============
  [KEY.auto_exposure_mode]: {
    description: `The Auto-Exposure Mode Control determines whether the device will provide automatic adjustment of the Exposure Time and Iris controls. Attempts to programmatically set the autoadjusted controls are then ignored. A GET_RES request issued to this control will return a bitmap of the modes supported by this control. A valid request to this control would have only one bit set (a single mode selected). This control must accept the GET_DEF request and return its default value.`,
    selector: CT.AE_MODE_CONTROL,
    type: 'PU',
    // type: 'CT', ??
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bAutoExposureMode',
      description: 'The setting for the attribute of the addressed Auto-Exposure Mode Control',
      offset: 0,
      size: 1,
      type: FIELD_TYPE.BITMAP,
      options: {
        MANUAL: 0b00000001,
        AUTO: 0b00000010,
        PRIORITY_SHUTTER: 0b00000100,
        PRIORITY_APERTURE: 0b00001000,
      }
    }]
  },
  [KEY.auto_exposure_priority]: {
    description: 'The Auto-Exposure Priority Control is used to specify constraints on the Exposure Time Control when the Auto-Exposure Mode Control is set to Auto Mode or Shutter Priority Mode. A value of zero indicates that the frame rate must remain constant. A value of 1 indicates that the frame rate may be dynamically varied by the device. The default value is zero (0).',
    selector: CT.AE_PRIORITY_CONTROL,
    // type: 'CT',
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bAutoExposurePriority',
      description: 'The setting for the attribute of the addressed AutoExposure Priority control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
    }]
  },
  [KEY.absolute_exposure_time]: {
    description: 'The Exposure Time (Absolute) Control is used to specify the length of exposure. This value is expressed in 100µs units, where 1 is 1/10,000th of a second, 10,000 is 1 second, and 100,000 is 10 seconds. A value of zero (0) is undefined. Note that the manual exposure control is further limited by the frame interval, which always has higher precedence. If the frame interval is changed to a value below the current value of the Exposure Control, the Exposure Control value will automatically be changed. The default Exposure Control value will be the current frame interval until an explicit exposure value is chosen. This control will not accept SET requests when the Auto-Exposure Mode control is in Auto mode or Aperture Priority mode, and the control pipe shall indicate a stall in this case. This control must accept the GET_DEF request and return its default value.',
    selector: CT.EXPOSURE_TIME_ABSOLUTE_CONTROL,
    // type: 'CT',
    type: 'PU',
    wLength: 4,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'dwExposureTimeAbsolute',
      description: 'The setting for the attribute of the addressed Exposure Time (Absolute) Control. 0: Reserved, 1: 0.0001 sec, 100000: 10 sec',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 4,
    }]
  },
  [KEY.absolute_focus]: {
    description: 'The Focus (Absolute) Control is used to specify the distance to the optimally focused target. This value is expressed in millimeters. The default value is implementation-specific. This control must accept the GET_DEF request and return its default value.',
    selector: CT.FOCUS_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wFocusAbsolute',
      description: 'The setting for the attribute of the addressed Focus (Absolute) Control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.absolute_zoom]: {
    description: 'The Zoom (Absolute) Control is used to specify or determine the Objective lens focal length. This control is used in combination with the wObjectiveFocalLengthMin and wObjectiveFocalLengthMax fields in the Camera Terminal descriptor to describe and control the Objective lens focal length of the device(see section 2.4.2.5.1 "Optical Zoom"). The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: CT.ZOOM_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wObjectiveFocalLength',
      description: 'The value of Zcur(see section 2.4.2.5.1 "Optical Zoom".)',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.absolute_pan_tilt]: {
    description: 'The PanTilt (Absolute) Control is used to specify the pan and tilt settings. The dwPanAbsolute is used to specify the pan setting in arc second units. 1 arc second is 1/3600 of a degree. Values range from –180*3600 arc second to +180*3600 arc second, or a subset thereof, with the default set to zero. Positive values are clockwise from the origin (the camera rotates clockwise when viewed from above), and negative values are counterclockwise from the origin. This control must accept the GET_DEF request and return its default value. The dwTiltAbsolute Control is used to specify the tilt setting in arc second units. 1 arc second is 1/3600 of a degree. Values range from –180*3600 arc second to +180*3600 arc second, or a subset thereof, with the default set to zero. Positive values point the imaging plane up, and negative values point the imaging plane down. This control must accept the GET_DEF request and return its default value.',
    selector: CT.PANTILT_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 8,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'dwPanAbsolute',
      description: 'The setting for the attribute of the addressed Pan (Absolute) Control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 4,
    }, {
      name: 'dwTiltAbsolute',
      description: 'The setting for the attribute of the addressed Tilt (Absolute) Control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 4,
      size: 4,
    }],
  },
  [KEY.auto_focus]: {
    description: 'The Focus, Auto Control setting determines whether the device will provide automatic adjustment of the Focus Absolute and/or Relative Controls. A value of 1 indicates that automatic adjustment is enabled. Attempts to programmatically set the related controls are then ignored. This control must accept the GET_DEF request and return its default value.',
    selector: CT.FOCUS_AUTO_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bFocusAuto',
      description: 'The setting for the attribute of the addressed Focus Auto control.',
      type: FIELD_TYPE.BOOLEAN,
      offset: 0,
      size: 1,
    }],
  },

  [KEY.scanning_mode]: {
    description: 'The Scanning Mode Control setting is used to control the scanning mode of the camera sensor. A value of 0 indicates that the interlace mode is enabled, and a value of 1 indicates that the progressive or the non-interlace mode is enabled.',
    selector: CT.SCANNING_MODE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bScanningMode',
      description: 'The setting for the attribute of the addressed Scanning Mode Control',
      type: FIELD_TYPE.BOOLEAN,
      offset: 0,
      size: 1,
      options: {
        INTERLACED: 0,
        PROGRESSIVE: 1,
      }
    }],
  },
  [KEY.relative_exposure_time]: {
    description: 'The Exposure Time (Relative) Control is used to specify the electronic shutter speed. This value is expressed in number of steps of exposure time that is incremented or decremented. A value of one (1) indicates that the exposure time is incremented one step further, and a value 0xFF indicates that the exposure time is decremented one step further. This step is implementation specific. A value of zero (0) indicates that the exposure time is set to the default value for implementation. The default values are implementation specific. This control will not accept SET requests when the Auto-Exposure Mode control is in Auto mode or Aperture Priority mode, and the control pipe shall indicate a stall in this case. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control (see section 2.4.2.2, “Status Interrupt Endpoint”).',
    selector: CT.EXPOSURE_TIME_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bExposureTimeRelative',
      description: 'The setting for the attribute of the addressed Exposure Time (Relative) Control',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 1,
      options: {
        DEFAULT: 0,
        INCREASE: 1,
        DECREASE: 0xFF,
      }
    }],
  },
  [KEY.relative_focus]: {
    description: 'The Focus (Relative) Control is used to move the focus lens group to specify the distance to the optimally focused target. The bFocusRelative field indicates whether the focus lens group is stopped or is moving for near or for infinity direction. A value of 1 indicates that the focus lens group is moved for near direction. A value of 0 indicates that the focus lens group is stopped. And a value of 0xFF indicates that the lens group is moved for infinity direction. The GET_MIN, GET_MAX, GET_RES and GET_DEF requests will return zero for this field. The bSpeed field indicates the speed of the lens group movement. A low number indicates a slow speed and a high number indicates a high speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control, it will return the value 1 in this field for all these requests. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control at the end of the movement (see section 2.4.2.2, “Status Interrupt Endpoint”). The end of movement can be due to physical device limits, or due to an explicit request by the host to stop the movement. If the end of movement is due to physical device limits (such as a limit in range of motion), a Control Change interrupt shall be generated for this Relative Control. If there is no limit in range of motion, a Control Change interrupt is not required.',
    selector: CT.FOCUS_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bFocusRelative',
      description: 'The setting for the attribute of the addressed Focus (Relative) Control',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 1,
      options: {
        STOP: 0,
        DIRECTION_NEAR: 1,
        DIRECTION_INFINITE: 0xFF,
      }
    }, {
      name: 'bSpeed',
      description: 'Speed for the control change',
      type: FIELD_TYPE.NUMBER,
      offset: 1,
      size: 1,
    }],
  },
  [KEY.absolute_iris]: {
    description: `The Iris (Absolute) Control is used to specify the camera's aperture setting. This value is expressed in units of fstop * 100. The default value is implementation-specific. This control will not accept SET requests when the Auto-Exposure Mode control is in Auto mode or Shutter Priority mode, and the control pipe shall indicate a stall in this case. This control must accept the GET_DEF request and return its default value.`,
    selector: CT.IRIS_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wIrisAbsolute',
      description: 'The setting for the attribute of the addressed Iris (Absolute) Control.',
      offset: 0,
      size: 2,
      type: FIELD_TYPE.NUMBER,
    }],
  },
  [KEY.relative_iris]: {
    description: `The Iris (Relative) Control is used to specify the camera's aperture setting. This value is a signed integer and indicates the number of steps to open or close the iris. A value of 1 indicates that the iris is opened 1 step further. A value of 0xFF indicates that the iris is closed 1 step further. This step of iris is implementation specific. A value of zero (0) indicates that the iris is set to the default value for the implementation. The default value is implementation specific. This control will not accept SET requests when the Auto-Exposure Mode control is in Auto mode or Shutter Priority mode, and the control pipe shall indicate a stall in this case. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control (see section 2.4.2.2, “Status Interrupt Endpoint”). Table 4-18 Iris`,
    selector: CT.IRIS_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bIrisRelative',
      description: 'The setting for the attribute of the addressed Iris (Relative) Control',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
      options: {
        DEFAULT: 0,
        INCREASE: 1,
        DECREASE: 0xFF,
      }
    }],
  },
  [KEY.relative_zoom]: {
    description: 'The Zoom (Relative) Control is used to specify the zoom focal length relatively as powered zoom. The bZoom field indicates whether the zoom lens group is stopped or the direction of the zoom lens. A value of 1 indicates that the zoom lens is moved towards the telephoto direction. A value of zero indicates that the zoom lens is stopped, and a value of 0xFF indicates that the zoom lens is moved towards the wide-angle direction. The GET_MIN, GET_MAX, GET_RES and GET_DEF requests will return zero for this field. The bDigitalZoom field specifies whether digital zoom is enabled or disabled. If the device only supports digital zoom, this field would be ignored. The GET_DEF request will return the default value for this field. The GET_MIN, GET_MAX and GET_RES requests will return zero for this field. The bSpeed field indicates the speed of the control change. A low number indicates a slow speed and a high number indicates a higher speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control, it will return the value 1 in this field for all these requests. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control at the end of the movement (see section 2.4.2.2, “Status Interrupt Endpoint”). The end of movement can be due to physical device limits, or due to an explicit request by the host to stop the movement. If the end of movement is due to physical device limits (such as a limit in range of motion), a Control Change interrupt shall be generated for this Relative Control.',
    selector: CT.ZOOM_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 3,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
        name: 'bZoom',
        description: 'The setting for the attribute of the addressed Zoom Control',
        type: FIELD_TYPE.NUMBER, // Signed number
        offset: 0,
        size: 1,
        options: {
          STOP: 0,
          DIRECTION_TELEPHOTO: 1,
          DIRECTION_WIDE_ANGLE: 0xFF,
        }
      },
      {
        name: 'bDigitalZoom',
        offset: 1,
        size: 1,
        type: FIELD_TYPE.BOOLEAN,
        options: {
          OFF: 0,
          ON: 1,
        }
      }, {
        name: 'bSpeed',
        description: 'Speed for the control change',
        type: FIELD_TYPE.NUMBER,
        offset: 2,
        size: 1,
      }
    ],
  },
  [KEY.relative_pan_tilt]: {
    description: 'The PanTilt (Relative) Control is used to specify the pan and tilt direction to move. The bPanRelative field is used to specify the pan direction to move. A value of 0 indicates to stop the pan, a value of 1 indicates to start moving clockwise direction, and a value of 0xFF indicates to start moving counterclockwise direction. The GET_DEF, GET_MIN, GET_MAX and GET_RES requests will return zero for this field. The bPanSpeed field is used to specify the speed of the movement for the Pan direction. A low number indicates a slow speed and a high number indicates a higher speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control for the Pan control, it will return the value 1 in this field for all these requests. The bTiltRelative field is used to specify the tilt direction to move. A value of zero indicates to stop the tilt, a value of 1 indicates that the camera point the imaging plane up, and a value of 0xFF indicates that the camera point the imaging plane down. The GET_DEF, GET_MIN, GET_MAX and GET_RES requests will return zero for this field. The bTiltSpeed field is used to specify the speed of the movement for the Tilt direction. A low number indicates a slow speed and a high number indicates a higher speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control for the Tilt control, it will return the value 1 in this field for all these requests. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control at the end of the movement (see section 2.4.2.2, “Status Interrupt Endpoint”). The end of movement can be due to physical device limits, or due to an explicit request by the host to stop the movement. If the end of movement is due to physical device limits (such as a limit in range of motion), a Control Change interrupt shall be generated for this Relative Control. If there is no limit in range of motion, a Control Change interrupt is not required.',
    selector: CT.PANTILT_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 4,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bPanRelative',
      description: 'The setting for the attribute of the addressed Pan(Relative) Control',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 1,
      options: {
        STOP: 0,
        CLOCKWISE: 1,
        COUNTER_CLOCKWISE: 0xFF,
      }
    }, {
      name: 'bPanSpeed',
      description: 'Speed of the Pan movement',
      type: FIELD_TYPE.NUMBER,
      offset: 1,
      size: 1,
    }, {
      name: 'bTiltRelative',
      description: 'The setting for the attribute of the addressed Tilt(Relative) Control',
      offset: 2,
      size: 1,
      type: FIELD_TYPE.NUMBER, // Signed Number
      options: {
        STOP: 0,
        UP: 1,
        DOWN: 0xFF,
      }
    }, {
      name: 'bTiltSpeed',
      description: 'Speed for the Tilt movement',
      type: FIELD_TYPE.NUMBER,
      offset: 3,
      size: 1,
    }],
  },
  [KEY.absolute_roll]: {
    description: 'The Roll (Absolute) Control is used to specify the roll setting in degrees. Values range from – 180 to +180, or a subset thereof, with the default being set to zero. Positive values cause a clockwise rotation of the camera along the image viewing axis, and negative values cause a counterclockwise rotation of the camera. This control must accept the GET_DEF request and return its default value.',
    selector: CT.ROLL_ABSOLUTE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wRollAbsolute',
      description: 'The setting for the attribute of the addressed Roll (Absolute) Control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 2,
    }],
  },
  [KEY.relative_roll]: {
    description: 'The Roll (Relative) Control is used to specify the roll direction to move. The bRollRelative field is used to specify the roll direction to move. A value of 0 indicates to stop the roll, a value of 1 indicates to start moving in a clockwise rotation of the camera along the image viewing axis, and a value of 0xFF indicates to start moving in a counterclockwise direction. The GET_DEF, GET_MIN, GET_MAX and GET_RES requests will return zero for this field. The bSpeed is used to specify the speed of the roll movement. A low number indicates a slow speed and a high number indicates a higher speed. The GET_MIN, GET_MAX and GET_RES requests are used to retrieve the range and resolution for this field. The GET_DEF request is used to retrieve the default value for this field. If the control does not support speed control, it will return the value 1 in this field for all these requests. If both Relative and Absolute Controls are supported, a SET_CUR to the Relative Control with a value other than 0x00 shall result in a Control Change interrupt for the Absolute Control at the end of the movement (see section 2.4.2.2, “Status Interrupt Endpoint”). The end of movement can be due to physical device limits, or due to an explicit request by the host to stop the movement. If the end of movement is due to physical device limits (such as a limit in range of motion), a Control Change interrupt shall be generated for this Relative Control. If there is no limit in range of motion, a Control Change interrupt is not required.',
    selector: CT.ROLL_RELATIVE_CONTROL,
    type: 'CT',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bRollRelative',
      description: 'The setting for the attribute of the addressed Roll (Relative) Control',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 1,
      options: {
        STOP: 0,
        CLOCKWISE: 1,
        COUNTER_CLOCKWISE: 0xFF,
      }
    }, {
      name: 'bSpeed',
      description: 'Speed for the Roll movement',
      offset: 1,
      size: 1,
      type: FIELD_TYPE.NUMBER,
    }],
  },
  [KEY.privacy]: {
    description: 'The Privacy Control setting is used to prevent video from being acquired by the camera sensor. A value of 0 indicates that the camera sensor is able to capture video images, and a value of 1 indicates that the camera sensor is prevented from capturing video images. This control shall be reported as an AutoUpdate control.',
    selector: CT.PRIVACY_CONTROL,
    type: 'CT',
    wLength: 1,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'bPrivacy',
      description: 'The setting for the attribute of the addressed Privacy Control',
      type: FIELD_TYPE.BOOLEAN,
      offset: 0,
      size: 1,
      options: {
        OPEN: 0,
        CLOSE: 1,
      }
    }],
  },

  // ===============
  // Processing Unit
  // ===============
  [KEY.power_line_frequency]: {
    description: 'This control allows the host software to specify the local power line frequency, in order for the device to properly implement anti-flicker processing, if supported. The default is implementation-specific. This control must accept the GET_DEF request and return its default value.',
    selector: PU.POWER_LINE_FREQUENCY_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bPowerLineFrequency',
      description: 'The setting for the attribute of the addressed Power Line Frequency control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
      options: {
        DISABLED: 0,
        HZ_50: 1,
        HZ_60: 2,
      }
    }],
  },
  [KEY.hue]: {
    description: 'This is used to specify the hue setting. The value of the hue setting is expressed in degrees multiplied by 100. The required range must be a subset of -18000 to 18000 (-180 to +180 degrees). The default value must be zero. This control must accept the GET_DEF request and return its default value.',
    selector: PU.HUE_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wHue',
      description: 'The setting for the attribute of the addressed Hue control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 2,
    }],
  },
  [KEY.white_balance_component]: {
    description: 'This is used to specify the white balance setting as Blue and Red values for video formats. This is offered as an alternative to the White Balance Temperature control. The supported range and default value for white balance components is implementation-dependent. The device shall interpret the controls as blue and red pairs. This control must accept the GET_DEF request and return its default value.',
    selector: PU.WHITE_BALANCE_COMPONENT_CONTROL,
    type: 'PU',
    wLength: 4,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR,
    ],
    fields: [{
      name: 'wWhiteBalanceBlue',
      description: 'The setting for the blue component of the addressed White Balance Component control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }, {
      name: 'wWhiteBalanceRed',
      description: 'The setting for the red component of the addressed White Balance Component control.',
      type: FIELD_TYPE.NUMBER,
      offset: 1,
      size: 2,
    }],
  },
  [KEY.auto_white_balance_component]: {
    description: 'The White Balance Component Auto Control setting determines whether the device will provide automatic adjustment of the related control. A value of 1 indicates that automatic adjustment is enabled. Attempts to programmatically set the related control are then ignored. This control must accept the GET_DEF request and return its default value.',
    selector: PU.WHITE_BALANCE_COMPONENT_AUTO_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bWhiteBalanceComponentAuto',
      description: 'The setting for the attribute of the addressed White Balance Component, Auto control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
    }],
  },
  [KEY.digital_multiplier]: {
    description: 'This is used to specify the amount of Digital Zoom applied to the optical image. This is the position within the range of possible values of multiplier m, allowing the multiplier resolution to be described by the device implementation. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. If the Digital Multiplier Limit Control is supported, the MIN and MAX values shall match the MIN and MAX values of the Digital Multiplier Control. The Digital Multiplier Limit Control allows either the Device or the Host to establish a temporary upper limit for the Z′cur value, thus reducing dynamically the range of the Digital Multiplier Control. If Digital Multiplier Limit is used to decrease the Limit below the current Z′cur value, the Z′cur value will be adjusted to match the new limit and the Digital Multiplier Control shall send a Control Change Event to notify the host of the adjustment.',
    selector: PU.DIGITAL_MULTIPLIER_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wMultiplierStep',
      description: 'The value Z′cur (see section 2.4.2.5.2 "Digital Zoom".)',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.digital_multiplier_limit]: {
    description: 'This is used to specify an upper limit for the amount of Digital Zoom applied to the optical image. This is the maximum position within the range of possible values of multiplier m. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent.',
    selector: PU.DIGITAL_MULTIPLIER_LIMIT_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wMultiplierLimit',
      description: 'A value specifying the upper bound for Z′cur (see section 2.4.2.5.2 "Digital Zoom".)',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.auto_hue]: {
    description: 'The Hue Auto Control setting determines whether the device will provide automatic adjustment of the related control. A value of 1 indicates that automatic adjustment is enabled. Attempts to programmatically set the related control are then ignored. This control must accept the GET_DEF request and return its default value.',
    selector: PU.HUE_AUTO_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bHueAuto',
      description: 'The setting for the attribute of the addressed Hue, Auto control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
    }],
  },
  [KEY.analog_video_standard]: {
    description: 'This is used to report the current Video Standard of the stream captured by the Processing Unit. ',
    selector: PU.ANALOG_VIDEO_STANDARD_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bVideoStandard',
      description: 'The Analog Video Standard of the input video signal.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
      options: {
        NONE: 0,
        NTSC_525_60: 1,
        PAL_625_50: 2,
        SECAM_625_50: 3,
        NTSC_625_50: 4,
        PAL_525_60: 5,
      }
    }],
  },
  [KEY.analog_lock_status]: {
    description: 'This is used to report whether the video decoder has achieved horizontal lock of the analog input signal. If the decoder is locked, it is assumed that a valid video stream is being generated. This control is to be supported only for analog video decoder functionality.',
    selector: PU.ANALOG_LOCK_STATUS_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
    ],
    fields: [{
      name: 'bStatus',
      description: 'Lock status',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 1,
      options: {
        LOCKED: 0,
        UNLOCKED: 1,
      }
    }],
  },
  [KEY.brightness]: {
    description: 'This is used to specify the brightness. This is a relative value where increasing values indicate increasing brightness. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.BRIGHTNESS_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wBrightness',
      description: 'The setting for the attribute of the addressed Brightness control.',
      type: FIELD_TYPE.NUMBER, // Signed Number
      offset: 0,
      size: 2,
    }],
  },
  [KEY.contrast]: {
    description: 'This is used to specify the contrast value. This is a relative value where increasing values indicate increasing contrast. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.CONTRAST_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wContrast',
      description: 'The setting for the attribute of the addressed Contrast control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.gain]: {
    description: 'This is used to specify the gain setting. This is a relative value where increasing values indicate increasing gain. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.GAIN_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wGain',
      description: 'The setting for the attribute of the addressed Gain control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.saturation]: {
    description: 'This is used to specify the saturation setting. This is a relative value where increasing values indicate increasing saturation. A Saturation value of 0 indicates grayscale. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation-dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.SATURATION_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wSaturation',
      description: 'The setting for the attribute of the addressed Saturation control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.sharpness]: {
    description: 'This is used to specify the sharpness setting. This is a relative value where increasing values indicate increasing sharpness, and the MIN value always implies "no sharpness processing", where the device will not process the video image to sharpen edges. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation-dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.SHARPNESS_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wSharpness',
      description: 'The setting for the attribute of the addressed Sharpness control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.white_balance_temperature]: {
    description: 'This is used to specify the white balance setting as a color temperature in degrees Kelvin. This is offered as an alternative to the White Balance Component control. Minimum range should be 2800 (incandescent) to 6500 (daylight) for webcams and dual-mode cameras. The supported range and default value for white balance temperature is implementation-dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.WHITE_BALANCE_TEMPERATURE_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    optional_requests: [
      REQUEST.SET_CUR
    ],
    fields: [{
      name: 'wWhiteBalanceTemperature',
      description: 'The setting for the attribute of the addressed White Balance Temperature control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.backlight_compensation]: {
    description: 'The Backlight Compensation Control is used to specify the backlight compensation. A value of zero indicates that the backlight compensation is disabled. A non-zero value indicates that the backlight compensation is enabled. The device may support a range of values, or simply a binary switch. If a range is supported, a low number indicates the least amount of backlightcompensation. The default value is implementation-specific, but enabling backlight compensation is recommended. This control must accept the GET_DEF request and return its default value.',
    selector: PU.BACKLIGHT_COMPENSATION_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wBacklightCompensation',
      description: 'The setting for the attribute of the addressed Backlight Compensation control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.gain]: {
    description: 'This is used to specify the gain setting. This is a relative value where increasing values indicate increasing gain. The MIN and MAX values are sufficient to imply the resolution, so the RES value must always be 1. The MIN, MAX and default values are implementation dependent. This control must accept the GET_DEF request and return its default value.',
    selector: PU.GAIN_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wGain',
      description: 'The setting for the attribute of the addressed Gain control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
  [KEY.auto_white_balance_temperature]: {
    description: 'The White Balance Temperature Auto Control setting determines whether the device will provide automatic adjustment of the related control. A value of 1 indicates that automatic adjustment is enabled. Attempts to programmatically set the related control are then ignored. This control must accept the GET_DEF request and return its default value.',
    selector: PU.WHITE_BALANCE_TEMPERATURE_AUTO_CONTROL,
    type: 'PU',
    wLength: 1,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'bWhiteBalanceTemperatureAuto',
      description: 'The setting for the attribute of the addressed White Balance Temperature, Auto control.',
      type: FIELD_TYPE.BOOLEAN,
      offset: 0,
      size: 1,
    }],
  },
  [KEY.gamma]: {
    description: 'This is used to specify the gamma setting. The value of the gamma setting is expressed in gamma multiplied by 100. The required range must be a subset of 1 to 500, and the default values are typically 100 (gamma = 1) or 220 (gamma = 2.2). This control must accept the GET_DEF request and return its default value',
    selector: PU.GAMMA_CONTROL,
    type: 'PU',
    wLength: 2,
    requests: [
      REQUEST.SET_CUR,
      REQUEST.GET_CUR,
      REQUEST.GET_MIN,
      REQUEST.GET_MAX,
      REQUEST.GET_RES,
      REQUEST.GET_INFO,
      REQUEST.GET_DEF,
    ],
    fields: [{
      name: 'wGamma',
      description: 'The setting for the attribute of the addressed Gamma control.',
      type: FIELD_TYPE.NUMBER,
      offset: 0,
      size: 2,
    }],
  },
}

Object.entries(CONTROLS).forEach(([key, control]) => control.name = key)

module.exports = CONTROLS

},{"./constants":14}],"uvc-control":[function(require,module,exports){
(function (Buffer){
const usb = require('usb')
const {
  SC,
  CC,
  VC,
  CS,
  // VS,
  // VS_DESCRIPTOR_SUBTYPE,
  BM_REQUEST_TYPE,
  FIELD_TYPE,
  REQUEST,
  KEY,
} = require('./lib/constants')
const controls = require('./lib/controls')
const EventEmitter = require('events').EventEmitter

class UVCControl extends EventEmitter {

  constructor(options = {}) {
    super()
    this.options = options
    this.init()
    if (!this.device) throw Error('No device found, using options:', options)
  }

  init() {

    if (this.options.vid && this.options.pid && this.options.deviceAddress) {

      // find cam with vid / pid / deviceAddress
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device) &&
          device.deviceDescriptor.idVendor === this.options.vid &&
          device.deviceDescriptor.idProduct === this.options.pid &&
          device.deviceAddress === this.options.deviceAddress
      })[0]

    } else if (this.options.vid && this.options.pid) {

      // find a camera that matches the vid / pid
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device) &&
          device.deviceDescriptor.idVendor === this.options.vid &&
          device.deviceDescriptor.idProduct === this.options.pid
      })[0]

    } else if (this.options.vid) {

      // find a camera that matches the vendor id
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device) &&
          device.deviceDescriptor.idVendor === this.options.vid
      })[0]

    } else {

      // no options... use the first camera in the device list
      this.device = usb.getDeviceList().filter((device) => {
        return isWebcam(device)
      })[0]
    }

    if (this.device) {
      this.device.open()
      this.videoControlInterfaceNumber = detectVideoControlInterface(this.device)
    }

    const descriptors = getInterfaceDescriptors(this.device)
    this.ids = {
      processingUnit: descriptors.processingUnit.bUnitID,
      cameraInputTerminal: descriptors.cameraInputTerminal.bTerminalID,
    }

    this.supportedControls = descriptors.cameraInputTerminal.controls.concat(descriptors.processingUnit.controls)
  }

  getControlParams(id) {
    const control = controls[id]
    if (!control) {
      throw Error('UVC Control identifier not recognized: ' + id)
    }

    const controlType = {
      PU: 'processingUnit',
      CT: 'inputTerminal',
      // VS: 'videoStream',
    } [control.type]
    const unit = this.ids[controlType]
    // const unit = this.ids.processingUnit
    const params = {
      wValue: (control.selector << 8) | 0x00,
      wIndex: (unit << 8) | this.videoControlInterfaceNumber,
      wLength: control.wLength
    }
    return params
  }

  /**
   * Close the device
   */
  close() {
    this.device.close()
  }

  /**
   * Get the value of a control
   * @param {string} controlName
   */
  get(id) {
    const control = this.getControl(id)
    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_CUR, params.wValue, params.wIndex, params.wLength, (error, buffer) => {
        if (error) return reject({
          id,
          error
        })
        const fields = {}
        control.fields.forEach(field => {
          // console.log(field.name, field.offset, field.size, buffer.byteLength)
          // sometimes the field doesn't take up the space it has
          const size = Math.min(field.size, buffer.byteLength)
          // sometimes the field isn't there...?
          if (field.offset === field.size) return
          fields[field.name] = buffer.readIntLE(field.offset, size)
        })
        resolve(fields)
      })
    })
  }

  getInfo(id) {
    // check if control can actually make the request
    const control = this.getControl(id)
    if (control.requests.indexOf(REQUEST.GET_INFO) === -1) {
      throw Error(`GET_INFO request is not supported for ${id} on this device.`)
    }

    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_INFO, params.wValue, params.wIndex, params.wLength, (error, buffer) => {
        if (error) return reject({
          id,
          error
        })
        const bm = bitmask(buffer.readIntLE(0, buffer.byteLength))
        const info = {
          // D0 Supports GET value requests Capability
          get: Boolean(bm[0]),
          // D1 Supports SET value requests Capability
          set: Boolean(bm[1]),
          // D2 Disabled due to automatic mode (under device control) State
          disabled: Boolean(bm[2]),
          // D3 Autoupdate Control (see section 2.4.2.2 "Status Interrupt Endpoint")
          autoUpdate: Boolean(bm[3]),
          // D4 Asynchronous Control (see sections 2.4.2.2 "Status Interrupt Endpoint" and 2.4.4, “Control Transfer and Request Processing”)
          async: Boolean(bm[3]),
        }
        resolve(info)
      })
    })
  }

  getDefault(id) {
    // check if control can actually make the request
    const control = this.getControl(id)
    if (control.requests.indexOf(REQUEST.GET_DEF) === -1) {
      throw Error(`GET_DEF request is not supported for ${id} on this device.`)
    }

    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_DEF, params.wValue, params.wIndex, params.wLength, (error, buffer) => {
        if (error) return reject({
          id,
          error
        })

        // parse based on fields offset/size
        const fieldDefaults = {}
        control.fields.forEach(field => {
          // NOTE min fixes out of bounds error, but this approach doesn't account for multiple fields...
          let int = buffer.readIntLE(field.offset, Math.min(buffer.byteLength, field.size))
          let result = int
          if (field.type === FIELD_TYPE.BOOLEAN) {
            result = Boolean(int)
          }
          const results = {
            value: result,
          }
          try {
            // FIXME: what do we do with negative numbers in bitmaps??
            // if (field.options && field.type !== 'Bitmap') {
            results.optionKey = Object.entries(field.options).filter(([key, val]) => {
              return val === result
            })[0][0]
            // }
          } catch (e) {}
          fieldDefaults[field.name] = results
        })

        resolve(fieldDefaults)
      })
    })
  }

  getControl(id) {
    const control = controls[id]
    if (!control) throw Error(`No control named ${id}`)
    return control
  }

  /**
   * Set the value of a control
   * @param {string} controlId
   * @param {number} ...values
   */
  set(id, ...values) {
    return new Promise((resolve, reject) => {
      const control = this.getControl(id)
      const params = this.getControlParams(id)
      const data = Buffer.alloc(params.wLength)
      control.fields.forEach((field, i) => {
        data.writeIntLE(values[i], field.offset, field.size)
      })

      this.device.controlTransfer(BM_REQUEST_TYPE.SET, REQUEST.SET_CUR, params.wValue, params.wIndex, data, (err) => {
        if (err) reject(err)
        else resolve(values)
      })
    })
  }
  /**
   * Get the min and max range of a control
   * @param {string} controlName
   */
  range(id) {
    const control = controls[id]
    if (control.requests.indexOf(REQUEST.GET_MIN) === -1) {
      throw Error('range request not supported for ', id)
    }

    return new Promise((resolve, reject) => {
      const params = this.getControlParams(id)
      const byteLength = 2
      // TODO support controls with multiple fields
      // TODO promise wrapper for controlTransfer so we can do parallel requests
      this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_MIN, params.wValue, params.wIndex, byteLength, (error, min) => {
        if (error) return reject(error)
        this.device.controlTransfer(BM_REQUEST_TYPE.GET, REQUEST.GET_MAX, params.wValue, params.wIndex, byteLength, (error, max) => {
          if (error) return reject(error)
          resolve({
            min: min.readIntLE(0, byteLength),
            max: max.readIntLE(0, byteLength),
          })
        })
      })
    })
  }
}

/*
  Class level stuff
*/

UVCControl.controls = controls
UVCControl.REQUEST = REQUEST

/**
 * Discover uvc devices
 */
UVCControl.discover = () => {
  return new Promise((resolve, reject) => {
    var promises = usb.getDeviceList().map(UVCControl.validate)
    Promise.all(promises).then(results => {
      resolve(results.filter(w => w)) // rm nulls
    }).catch(err => reject(err))
  })
}

/**
 * Check if device is a uvc device
 * @param {object} device
 */
UVCControl.validate = (device) => {
  return new Promise((resolve, reject) => {

    if (device.deviceDescriptor.iProduct) {
      device.open()

      // http://www.usb.org/developers/defined_class/#BaseClass10h
      if (isWebcam(device)) {
        device.getStringDescriptor(device.deviceDescriptor.iProduct, (error, deviceName) => {
          if (error) return reject(error)
          device.close()
          device.name = deviceName
          resolve(device)
        })
      } else resolve(false)
    } else resolve(false)
  })
}

/**
 * Given a USB device, iterate through all of the exposed interfaces looking for the one for VideoControl.
 * @param  {object} device
 * @return {object} interface
 */
function detectVideoControlInterface(device) {
  const {
    interfaces
  } = device
  for (let i = 0; i < interfaces.length; i++) {
    if (interfaces[i].descriptor.bInterfaceClass == CC.VIDEO &&
      interfaces[i].descriptor.bInterfaceSubClass == SC.VIDEOCONTROL
    ) {
      return i
    }
  }
}

/**
 * Check the device descriptor and assert that it is a webcam
 * @param {object} device
 * @return {Boolean}
 */
function isWebcam(device) {
  return device.deviceDescriptor.bDeviceClass === 0xef &&
    device.deviceDescriptor.bDeviceSubClass === 0x02 &&
    device.deviceDescriptor.bDeviceProtocol === 0x01
}

function getInterfaceDescriptors(device) {
  // find the VC interface
  // VC Interface Descriptor is a concatenation of all the descriptors that are used to fully describe
  // the video function, i.e., all Unit Descriptors (UDs) and Terminal Descriptors (TDs)
  const vcInterface = device.interfaces.filter(interface => {
    const {
      descriptor
    } = interface
    return descriptor.bInterfaceClass === CC.VIDEO &&
      descriptor.bInterfaceSubClass === SC.VIDEOCONTROL
  })[0]

  // parse the descriptors in the extra field
  let data = vcInterface.descriptor.extra.toJSON().data
  let descriptorArrays = []
  while (data.length) {
    let bLength = data[0]
    let arr = data.splice(0, bLength)
    descriptorArrays.push(arr)
  }

  // Table 3-6 Camera Terminal Descriptor
  const cameraInputTerminalDescriptor = descriptorArrays.filter(arr => arr[1] === CS.INTERFACE && arr[2] === VC.INPUT_TERMINAL)[0]
  const cITDBuffer = Buffer.from(cameraInputTerminalDescriptor)
  let bControlSize = cITDBuffer.readIntLE(14, 1)
  let bmControls = bitmask(cITDBuffer.readIntLE(15, bControlSize))
  const cameraInputTerminal = {
    bTerminalID: cITDBuffer.readIntLE(3, 1),
    wObjectiveFocalLengthMin: cITDBuffer.readIntLE(8, 2),
    wObjectiveFocalLengthMax: cITDBuffer.readIntLE(10, 2),
    wOcularFocalLength: cITDBuffer.readIntLE(12, 2),
    controls: [
      KEY.scanning_mode,
      KEY.auto_exposure_mode,
      KEY.auto_exposure_priority,
      KEY.absolute_exposure_time,
      KEY.relative_exposure_time,
      KEY.absolute_focus,
      KEY.relative_focus,
      KEY.absolute_iris,
      KEY.relative_iris,
      KEY.absolute_zoom,
      KEY.relative_zoom,
      KEY.absolute_pan_tilt,
      KEY.relative_pan_tilt,
      KEY.absolute_roll,
      KEY.relative_roll,
      undefined,
      undefined,
      KEY.auto_focus,
      KEY.privacy,
    ].filter((name, i) => bmControls[i] && name)
  }

  // Table 3-8 Processing Unit Descriptor
  const processingUnitDescriptor = descriptorArrays.filter(arr => arr[1] === CS.INTERFACE && arr[2] === VC.PROCESSING_UNIT)[0]
  const pUDBuffer = Buffer.from(processingUnitDescriptor)
  bControlSize = pUDBuffer.readIntLE(7, 1)
  bmControls = bitmask(pUDBuffer.readIntLE(8, bControlSize))
  const bmVideoStandards = bitmask(pUDBuffer.readIntLE(8 + bControlSize, 1))
  const processingUnit = {
    bUnitID: pUDBuffer.readIntLE(3, 1),
    wMaxMultiplier: pUDBuffer.readIntLE(3, 1),
    controls: [
      KEY.brightness,
      KEY.contrast,
      KEY.hue,
      KEY.saturation,
      KEY.sharpness,
      KEY.gamma,
      KEY.white_balance_temperature,
      KEY.white_balance_component,
      KEY.backlight_compensation,
      KEY.gain,
      KEY.power_line_frequency,
      KEY.auto_hue,
      KEY.auto_white_balance_temperature,
      KEY.auto_white_balance_component,
      KEY.digital_multiplier,
      KEY.digital_multiplier_limit,
      KEY.analog_video_standard,
      KEY.analog_lock_status,
    ].filter((name, i) => bmControls[i]),
    videoStandards: [
      KEY.NONE,
      KEY.NTSC_525_60,
      KEY.PAL_625_50,
      KEY.SECAM_625_50,
      KEY.NTSC_625_50,
      KEY.PAL_525_60,
    ].filter((name, i) => bmVideoStandards[i])
  }

  // console.log('cameraInputTerminal', cameraInputTerminal)
  // console.log('processingUnit', processingUnit)

  /*
    3.9.2.1 Input Header Descriptor
    The Input Header descriptor is used for VS interfaces that contain an IN endpoint for streaming
    video data. It provides information on the number of different format descriptors that will follow
    it, as well as the total size of all class-specific descriptors in alternate setting zero of this interface.
  */
  // const rawInputHeaderDescriptor = descriptorArrays.filter(arr => arr[1] === CS.INTERFACE && arr[2] === VS_DESCRIPTOR_SUBTYPE.INPUT_HEADER)[0]
  // const inputHeaderDescriptor = {
  //   bEndpointAddress: rawInputHeaderDescriptor[6],
  //   bTerminalLink: rawInputHeaderDescriptor[8],
  //   bStillCaptureMethod: rawInputHeaderDescriptor[9],
  // }

  return {
    processingUnit,
    cameraInputTerminal,
  }
}

const bitmask = (int) => int.toString(2).split('').reverse().map(i => parseInt(i))

module.exports = UVCControl

}).call(this,require("buffer").Buffer)
},{"./lib/constants":14,"./lib/controls":15,"buffer":3,"events":4,"usb":13}]},{},[]);

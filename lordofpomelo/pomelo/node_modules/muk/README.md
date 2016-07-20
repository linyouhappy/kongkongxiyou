# muk [![Build Status](https://secure.travis-ci.org/fent/node-muk.png)](http://travis-ci.org/fent/node-muk)

![muk](https://raw.githubusercontent.com/fent/node-muk/master/muk.gif)


# Usage

Mock dependencies.

**foo.js**
```
var request = require('request');

module.exports = function foo(url) {
  // do something with request
};
```

**test.js**
```js
var mockedRequest = function(url, options, callback) {
  // mock a request here
};

var foo = muk('./foo', {
  request: mockedRequest
});
```

You can also mock modules required with a relative path.

**some/where/else/foo.js**
```js
var bar = require('./bar');

module.exports = function() {
  // do something with bar
};
```

**some/where/else/bar.js**
```js
exports.attack = 'sludge attack!';
```

**test.js**
```js
var foo = muk('./some/where/else/foo', { './bar': 'hey!!' });
```

Comes with object method mocking too.

```js
var fs = require('fs');
var muk = require('muk');

muk(fs, 'readFile', function(path, callback) {
  process.nextTick(callback.bind(null, null, 'file contents here'));
});
```

Restore all mocked methods after tests.

```
muk.restore();

fs.readFile(file, function(err, data) {
  // will actually read from `file`
});
```


# Install

    npm install muk


# Tests
Tests are written with [mocha](http://visionmedia.github.com/mocha/)

```bash
npm test
```

# License
MIT

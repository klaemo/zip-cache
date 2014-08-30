# zip-cache
[![Build Status](https://travis-ci.org/klaemo/zip-cache.svg)](https://travis-ci.org/klaemo/zip-cache)
[![NPM](https://nodei.co/npm/zip-cache.png)](https://nodei.co/npm/zip-cache/)

Cache your async lookups and store them compressed in memory.
This module is just a light wrapper around [isaacs/async-cache](https://github.com/isaacs/async-cache).

## Installation

    npm install zip-cache


## Usage

```js
var Cache = require('zip-cache')

var cache = Cache(function (key, cb) {
  // fetch your stuff asynchronously
  setTimeout(function () { cb(null, { 'my': 'item' }) }, 200)
}, options)

cache.get(key, function (err, item) {
  //-> item === { 'my': 'item' }
})
```

### Arguments

`Cache(fn, options)`

* `fn(key, callback)` This function will be called when the item is not in the cache
* `options` (optional) object of options that will be passed through to the 
  underlying [LRU cache](https://github.com/isaacs/lru-cache) 

## Methods

* `get(key, cb)` If the key is in the cache, then calls `cb(null,
  cached)` on nextTick.  Otherwise, calls the `load` function that was
  supplied in the options object.  If it doesn't return an error, then
  cache the result.  Multiple `get` calls with the same key will only
  ever have a single `load` call at the same time.

* `set(key, val, [cb])` Seed the cache.  This doesn't have to be done, but
  can be convenient if you know that something will be fetched soon.
  Due to the async nature of zlib compression, this method also takes an
  optional callback function.

* `reset()` Drop all the items in the cache.

* `del(key)` Deletes a key out of the cache.

* `has(key)` Check if a key is in the cache, without updating the recent-ness
  or deleting it for being stale.

* `peek(key)` Returns the key value (or `undefined` if not found) without
  updating the "recently used"-ness of the key.

  (If you find yourself using this a lot, you *might* be using the
  wrong sort of data structure, but there are some use cases where
  it's handy.)

## Tests

    npm test


## License

MIT


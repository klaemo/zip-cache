# zip-cache
[![Build Status](https://travis-ci.org/klaemo/zip-cache.svg)](https://travis-ci.org/klaemo/zip-cache)
[![NPM](https://nodei.co/npm/zip-cache.png)](https://nodei.co/npm/zip-cache/)

Cache your async lookups and store them (gzip) compressed in memory.
This module is just a light wrapper around [isaacs/async-cache](https://github.com/isaacs/async-cache),
even this Readme ;-)

## Installation

    npm install zip-cache


## Example

Let's say you have to look up JSON from a database. But you are ok
with only looking up the info once every 10 minutes (since it
doesn't change that often), and you want to limit your cache size to
1000 objects. The objects will be held as gzipped buffers in memory.
This might be silly for some cases, but could save precious memory on cheap VPSs.

__Note:__ Currently zip-cache only handles `JSON.stringify`able objects.

You can do this:

```javascript
var cache = new AsyncCache({
  // options passed directly to the internal lru cache
  max: 1000,
  maxAge: 1000 * 60 * 10,
  // method to load a thing if it's not in the cache.
  // key must be unique in the context of this cache.
  load: function (key, cb) {
    // this method will only be called if it's not already in cache, and will
    // cache the result in the lru.
    getTheJsonFromYourDB(key, cb)
  }
})

// then later..
cache.get('key', function (er, item) {
  // maybe loaded from cache, maybe just fetched
})
```

Except for the `load` method, all the options are passed unmolested to
the internal [lru-cache](http://npm.im/lru-cache).


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


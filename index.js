var Cache = require('async-cache')
var zlib = require('zlib')

module.exports = function (fetch, opts) {
  // options passed directly to the internal lru cache
  opts = opts || {}

  opts.load = function (key, cb) {
    // this method will only be called if it's not already in cache, and will
    // cache the result in the lru.
    fetch(key, function (err, item) {
      if (err) return cb(err)
      
      try {
        item = JSON.stringify(item)
      } catch (err) {
        return cb(err)
      }

      zlib.gzip(item, cb)
    })
  }

  var cache = new Cache(opts)
  var cacheGet = cache.get
  var cacheSet = cache.set

  cache.get = function (key, cb) {
    cacheGet.call(cache, key, function (err, zippedBuf) {
      if (err) return cb(err)
      zlib.gunzip(zippedBuf, function (err, buf) {
        if (err) return cb(err)
        
        var doc
        try {
          doc = JSON.parse(buf.toString())
        } catch (err) {
          return cb(err)
        }
        
        cb(null, doc)
      })
    })
  }
  
  cache.set = function (key, val, cb) {
    try {
      val = JSON.stringify(val)
    } catch (err) {
      if (typeof cb == 'function') cb(err)
      return
    }

    zlib.gzip(val, function (err, buf) {
      if (err) return cb(err)
      cacheSet.call(cache, key, buf)
      if (typeof cb == 'function') cb()
    })
  }

  return cache
}
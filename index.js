var Cache = require('async-cache')
var zlib = require('zlib')

module.exports = function (opts) {
  // options passed directly to the internal lru cache
  opts = opts || {}

  if (!opts.load || typeof opts.load != 'function') {
    throw new Error('need load function')
  }
  
  opts._load = opts.load
  
  opts.load = function (key, cb) {
    // this method will only be called if it's not already in cache, and will
    // cache the result in the lru.
    opts._load(key, function (err, item) {
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
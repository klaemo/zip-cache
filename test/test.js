var Cache = require('../')
var test = require('tape')

var db = { 
  'id-1': { 'foo': 1 }, 
  'id-2': { 'foo': 2 }
}

var cache = Cache(function (key, cb) {
  // fake slow database
  setTimeout(function () { cb(null, db[key]) }, 100)
}, { max: 2 })

test('.get(key, cb)', function (t) {
  t.plan(6)
  
  var start = Date.now()
  cache.get('id-1', function (err, item) {
    t.error(err)

    t.ok(Date.now() - start >= 100, 'first get() should fetch from db')
    t.equal(item.foo, 1, 'should fetch correct item')

    start = Date.now()
    cache.get('id-1', function (err, item) {
      t.error(err)

      t.ok(Date.now() - start < 100, 'subsqeuent get()s should be cached')
      t.equal(item.foo, 1, 'should fetch correct item')
    })
  })
})

test('.set(key, val, [cb])', function (t) {
  t.plan(2)
  cache.set('id-2', db['id-2'], function (err, res) {
    t.error(err)
    t.ok(cache.has('id-2'), 'new item should be in cache')
  })
})

test('.reset()', function (t) {
  t.plan(2)
  t.equal(cache._cache.keys().length, 2)
  cache.reset()
  t.equal(cache._cache.keys().length, 0)
})


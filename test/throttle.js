
/**
 * Module dependencies.
 */

var fs = require('fs');
var assert = require('assert');
var Throttle = require('../');
var inherits = require('util').inherits;
var Readable = require('stream').Readable;

// node v0.8.x compat
if (!Readable) Readable = require('readable-stream');

// Readable stream impl that outputs random data very quickly
function Random (n) {
  Readable.call(this);
  this.remaining = +n;
}
inherits(Random, Readable);
Random.prototype._read = function (n, cb) {
  n = Math.min(this.remaining, n);
  this.remaining -= n;
  if (n > 0) {
    cb(null, new Buffer(n));
  } else {
    cb(null, null); // emit "end"
  }
};


describe('Throttle', function () {

  this.slow(8000);
  this.timeout(10000);

  it('should take ~1 second to read 10,000 bytes at 10000bps', function (done) {
    var r = new Random(10000);
    var t = new Throttle(10000);
    var start = Date.now();
    var bytes = 0;
    t.on('data', function (data) {
      bytes += data.length;
    });
    t.on('end', function () {
      assertTimespan(start, new Date(), 1000);
      assert.equal(10000, bytes);
      done();
    });
    r.pipe(t);
  });

  it('should take ~1 second to read 1,024 bytes at 1024bps', function (done) {
    var r = new Random(1024);
    var t = new Throttle(1024);
    var start = Date.now();
    var bytes = 0;
    t.on('data', function (data) {
      bytes += data.length;
    });
    t.on('end', function () {
      assertTimespan(start, new Date(), 1000);
      assert.equal(1024, bytes);
      done();
    });
    r.pipe(t);
  });

  it('should take ~2 seconds to read 2 megabytes at 1mb/s', function (done) {
    var mb = 1048576;
    var r = new Random(2 * mb);
    var t = new Throttle(1 * mb);
    var start = Date.now();
    var bytes = 0;
    t.on('data', function (data) {
      bytes += data.length;
    });
    t.on('end', function () {
      assertTimespan(start, new Date(), 2000);
      assert.equal(2 * mb, bytes);
      done();
    });
    r.pipe(t);
  });

  it('should take ~3 seconds to read 15 megabytes at 5mb/s', function (done) {
    var mb = 1048576;
    var r = new Random(15 * mb);
    var t = new Throttle(5 * mb);
    var start = Date.now();
    var bytes = 0;
    t.on('data', function (data) {
      bytes += data.length;
    });
    t.on('end', function () {
      assertTimespan(start, new Date(), 3000);
      assert.equal(15 * mb, bytes);
      done();
    });
    r.pipe(t);
  });

  it('should take ~500ms to read 100 bytes at 200 bps', function (done) {
    var r = new Random(100);
    var t = new Throttle(200);
    var start = Date.now();
    var bytes = 0;
    t.on('data', function (data) {
      bytes += data.length;
    });
    t.on('end', function () {
      assertTimespan(start, new Date(), 500);
      assert.equal(100, bytes);
      done();
    });
    r.pipe(t);
  });

  it('should take ~3 seconds to read 3 bytes at 1 bps', function (done) {
    var r = new Random(3);
    var t = new Throttle(1);
    var start = Date.now();
    var bytes = 0;
    t.on('data', function (data) {
      bytes += data.length;
    });
    t.on('end', function () {
      assertTimespan(start, new Date(), 3000);
      assert.equal(3, bytes);
      done();
    });
    r.pipe(t);
  });

});

function assertTimespan (start, end, expected, tolerance) {
  if (null == tolerance) tolerance = 90;
  var diff = end - start;
  var delta = expected - diff;
  assert(Math.abs(delta) < tolerance);
}

node-throttle
=============
### Node.js Transform stream that passes data through at `n` bytes per second
[![Build Status](https://secure.travis-ci.org/TooTallNate/node-throttle.png)](http://travis-ci.org/TooTallNate/node-throttle)

This module offers a `Throttle` passthrough stream class, which allows you to
write data to it and it will be passed through in `n` bytes per second. It can
be useful for throttling HTTP uploads or to simulate reading from a file in
real-time, etc.


Example
-------

Here's an example of throttling stdin at 10 kb/s and outputting the data to
stdout:

``` js
var Throttle = require('throttle');

// create a "Throttle" instance that reads at 10 kb/s
var kb = 1024;
var throttle = new Throttle(10 * kb);

process.stdin.pipe(throttle).pipe(process.stdout);
```

That's it!

Installation
------------

``` bash
$ npm install throttle
```

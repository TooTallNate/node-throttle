module.exports = function thottle(stream, bytes, timeUnit) {
  return typeof bytes === 'number'
    ? initThrottle(stream, bytes, timeUnit)
    : { at: at(stream) };
};

//
// allows byte unit to be chosen
//
function at(stream) {
  return function setUnit(amount) {
    var funcs = {};

    // add bytes option
    var fn = per(stream, amount, 0);
    funcs.bytes = fn;
    funcs.b = fn;
    funcs.B = fn;

    // add rest of reasonable units
    ['kilo', 'mega', 'giga', 'tera'].forEach(function(unit, i) {
      var fn = per(stream, amount, (i + 1) * 10);
      funcs[unit + 'bytes'] = fn;
      funcs[unit[0] + 'b'] = fn;
      funcs[unit[0].toUpperCase() + 'B'] = fn;
    });

    return funcs;
  };
}

var time = {
  second : 1000
, sec    : 1000
, minute : 1000 * 60
, min    : 1000 * 60
, hour   : 1000 * 60 * 60
, day    : 1000 * 60 * 60 * 24
, week   : 1000 * 60 * 60 * 24 * 7
, month  : 1000 * 60 * 60 * 24 * 30
, year   : 1000 * 60 * 60 * 24 * 365
};

//
// allows time unit to be chosen
//
function per(stream, amount, unit) {
  function setPer(n) {
    var setTimeUnit = {};

    for (var key in time) {
      if (!time.hasOwnProperty(key)) continue;
      setTimeUnit.__defineGetter__(key + 's', function() {
        return initThrottle(stream, amount << unit, n * time[key]);
      });
    }

    return setTimeUnit;
  }

  for (var key in time) {
    if (!time.hasOwnProperty(key)) continue;
    setPer.__defineGetter__(key, function() {
      return initThrottle(stream, amount << unit, time[key]);
    });
  }

  return { per: setPer };
}

//
// starts throttling the stream
//
function initThrottle(stream, bytes, timeUnit) {

  timeUnit = timeUnit || 1000;
  var startTime = Date.now();
  var totalBytes = 0;
  var timeoutId;

  stream.on("data", onData);

  function resume() {
    timeoutId = undefined;
    stream.resume();
  }

  function onData(chunk) {
    totalBytes += chunk.length;
    var totalSeconds = (Date.now() - startTime) / timeUnit;
    var expected = totalSeconds * bytes;
    if (totalBytes > expected) {
      // Use this byte count to calculate how many seconds ahead we are.
      var remainder = totalBytes - expected;
      var sleepTime =  remainder / bytes * timeUnit;
      //if (sleepTime > 40) {
        stream.pause();
        timeoutId = setTimeout(resume, sleepTime);
      //}
    }
  }

  // The return value is a Function that, when invoked, will cancel the throttling behavior
  return function unthrottle() {
    if (timeoutId) clearTimeout(timeoutId);
    stream.removeListener('data', onData);
  }
}

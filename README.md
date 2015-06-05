# async-domino (development alpha)

A module to allow time controlled asynchronous functions

## Usage

```
var domino = require('async-domino');

async.waterfall(domino([
    function(callback) {
        callback(null, 'one', 'two');
    },
    function(arg1, arg2, callback) {
      // arg1 now equals 'one' and arg2 now equals 'two'
        callback(null, 'three');
    },
    function(arg1, callback) {
        // arg1 now equals 'three'
        callback(null, 'done');
    }
]), function (err, result) {
    // result now equals 'done'
});
```

## Options

Second parameter of `domino` is options object
- protect:true - sets whether to prevent runtime error in the functions stops execution
- timeout:2000 - sets the maximum time to allow each task
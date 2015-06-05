[![Build Status](https://travis-ci.org/postmanlabs/async-domino.svg?branch=master)](https://travis-ci.org/postmanlabs/async-domino)

# async-domino

A module to allow time controlled synchronous (or asynchronous) functions. The goal is to ensure that the trailing final
callback of `async.waterfall` and related methods to be executed with certainty.

## Background

[async.js](https://www.npmjs.com/package/async) is one fo the popular modules for managed asynchronous flow control in
JavaScript. This module allows one to leverage use-cases where the final stage of the flow is mandatory to be executed.

Using this module, as a wrapper around functions within an array that, when executed, ensures that it always executes 
the callback function passed to them - even when the function had runtime error or if the callback was not called within
a specified time.

though this was primarily designed to work with async.js library, it can be utilised under a number of series or 
parallel control flow that is callback driven where **guarantee of terminal callback is required**.

## Installing async-domino

The easiest way to install `async-domino` is from the NPM registry. Switch to your project directory and run the 
following command.

```terminal
npm install async-domino --save
```

## Usage

```
var async = require('async'),
    domino = require('async-domino');

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
- protect:true - traps uncaught exceptions within the functions and proceeds to the terminal callback.
- timeout:2000 - sets the maximum time to allow each function to complete execution.

## Contributing

Contribution is accepted in form of Pull Requests that passes Travis CI tests. You should install this repository using
`npm install -d` and run `npm test` locally before sending Pull Request.

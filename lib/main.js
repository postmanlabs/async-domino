module.exports = function (tasks, options) {
	// validate the paramaters for basic sanity
	!options && (options = {});

	var /**
		 * Keep a track whether standard async flow was interrupted by time.
		 * @type {boolean}
		 */
		interrupted = false,
		/**
		 * Options for configuring the module.
		 * @type {object}
		 */
		opts = {
			protect: ('protect' in options) ? !!options.protect : true,
			timeout: isNaN(options.timeout) ? 2000 : Number(options.timeout),
			distribution: 'equal'
		};

	// iterate through all tasks and return an array of alternate tasks that can keep track of time.
	return tasks.map(function (task) {
		// instead of the original task, map the array to return wrapper functions.
		return function () {
			var args = Array.prototype.slice.call(arguments), // copy array
                // super ensure no double callback by wrapping the callback
                done = args.length && (function (cb) {
                    var once = false; // track call.
                    return function () {
                        !once && ((once = true), cb.apply(this, arguments));
                    };
                }(args[args.length - 1])),
                // flag to keep track of timer id
                waiting;

			// check whether there is actually a callback function. there should be one, but still edge-case validation
			// is to be done.
			if (done) {
				// if it is marked that the flow has been interrupted, then we exit waterfall with an error. this is
				// unlikely to happen on first run, but may happen subsequently.
				if (interrupted) {
					return done(new Error('async interrupt timeout'));
				}

				// start a timeout and execute callback in it
				waiting = setTimeout(function () {
					waiting = null;
					done(new Error('async interrupt timeout'));
				}, opts.timeout); // @todo: add other time distribution types

				// modify the callback passed to the actual task so that the timeout can be stopped and original
				// callback be called.
				args[args.length - 1] = function () {
					// if upon call of this wrapper callback, the timeout has already passed, then we do not call the
					// actual callback and back off.
					if (!waiting) {
						// mark the interruption
						interrupted = true;
						return;
					}

					// at this point, timeout has not yet reached, hence we clear it and execute the callback while
					// passing on the original arguments.
					waiting = clearTimeout(waiting);
					done.apply(this, arguments);
				};
			}

			// if execution protection is turned on, we execute the task within a try block and then pass on the
			// error. this ensures that no syncronous stack is broken.
			if (opts.protect) {
				try { task.apply(this, args); }
				catch (e) { done(e); }
			}
			else {
				task.apply(this, args);
			}
		};
	});
};

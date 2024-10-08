/**
 * debounce and throttle methods
 * 
 * @see {Underscore.js} 1.9.1
 */
(function()
{

    // Some functions take a variable number of arguments, or a few expected
    // arguments at the beginning and then a variable number of values to operate
    // on. This helper accumulates all remaining arguments past the function’s
    // argument length (or an explicit `startIndex`), into an array that becomes
    // the last argument. Similar to ES6’s "rest parameter".
    var restArguments = function(func, startIndex)
    {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function()
        {
            var length = Math.max(arguments.length - startIndex, 0),
                rest = Array(length),
                index = 0;
            for (; index < length; index++)
            {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex)
            {
                case 0:
                    return func.call(this, rest);
                case 1:
                    return func.call(this, arguments[0], rest);
                case 2:
                    return func.call(this, arguments[0], arguments[1], rest);
            }
            var args = Array(startIndex + 1);
            for (index = 0; index < startIndex; index++)
            {
                args[index] = arguments[index];
            }
            args[startIndex] = rest;
            return func.apply(this, args);
        };
    };

    // A (possibly faster) way to get the current timestamp as an integer.
    var _now = Date.now || function()
    {
        return new Date().getTime();
    };


    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    var _delay = restArguments(function(func, wait, args)
    {
        return setTimeout(function()
        {
            return func.apply(null, args);
        }, wait);
    });


    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    var _throttle = function(func, wait, options)
    {
        var timeout, context, args, result;
        var previous = 0;
        if (!options) options = {};

        var later = function()
        {
            previous = options.leading === false ? 0 : _now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };

        var throttled = function()
        {
            var now = _now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait)
            {
                if (timeout)
                {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
            else if (!timeout && options.trailing !== false)
            {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };

        throttled.cancel = function()
        {
            clearTimeout(timeout);
            previous = 0;
            timeout = context = args = null;
        };

        return throttled;
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    var _debounce = function(func, wait, immediate)
    {
        var timeout, result;

        var later = function(context, args)
        {
            timeout = null;
            if (args) result = func.apply(context, args);
        };

        var debounced = restArguments(function(args)
        {
            if (timeout) clearTimeout(timeout);
            if (immediate)
            {
                var callNow = !timeout;
                timeout = setTimeout(later, wait);
                if (callNow) result = func.apply(this, args);
            }
            else
            {
                timeout = _delay(later, wait, this, args);
            }

            return result;
        });

        debounced.cancel = function()
        {
            clearTimeout(timeout);
            timeout = null;
        };

        return debounced;
    };

    window.throttle = _throttle;

    window.debounce = _debounce;

}());
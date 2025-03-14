/**
 * --------------------------------------------------------------------------
 * Frontbx ESM
 * 
 * @version  {0.0.4}
 * @see      {https://github.com/frontbx/ui}
 * @licensed {https://github.com/frontbx/ui/blob/main/LICENSE}
 * --------------------------------------------------------------------------
 */
/**
 * --------------------------------------------------------------------------
 * Frontbx standalone
 * 
 * @version  {0.0.4}
 * @see      {https://github.com/frontbx/ui}
 * @licensed {https://github.com/frontbx/ui/blob/main/LICENSE}
 * --------------------------------------------------------------------------
 */
// Core
// polyfills
// polyfills
const FBX_ROOT = typeof process === 'object' && typeof global === 'object' ? global : window;

if (typeof window === 'undefined') throw new Error('Frontbx requires a window object to run.');
/**
 * A fix to allow you to use window.location.origin consistently
 *
 * @see {https://tosbourn.com/a-fix-for-window-location-origin-in-internet-explorer/}
 */
if (!FBX_ROOT.location.origin)
{
    FBX_ROOT.location.origin = FBX_ROOT.location.protocol + "//" + FBX_ROOT.location.hostname + (FBX_ROOT.location.port ? ':' + FBX_ROOT.location.port : '');
}
/*
 * Custom events 
 *
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill}
 */
(function()
{
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params)
    {
        params = params ||
        {
            bubbles: false,
            cancelable: false,
            detail: null
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    window.CustomEvent = CustomEvent;

})();
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

    FBX_ROOT.throttle = _throttle;

    FBX_ROOT.debounce = _debounce;

}());


// container
var container;

(function()
{
    const EMPTY_OBJ_KEYS = Object.getOwnPropertyNames(Object.getPrototypeOf({}));

    /**
     * JS IoC Container
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Inverse = function()
    {
        this._store = {};

        this.IMPORT_AS_REF = 100;
    }

    /**
     * Set data key to value
     *
     * @access {public}
     * @param {string} key   The data key
     * @param {mixed}  value The data value
     */
    Inverse.prototype.set = function(key, value, singleton)
    {
        key = this._normalizeKey(key);

        value = this._storeObj(value, singleton);

        this._store[key] = value;

        this._setProto(key);
    }

    /**
     * Stores a globally unique singleton
     *
     * @access {public}
     * @param  {string} key      The value or object name
     * @param  {object} classObj The closure that defines the object
     * @return {this}
     */
    Inverse.prototype.singleton = function(key, classObj, invoke)
    {
        invoke = typeof invoke === 'undefined' ? false : invoke;

        this.set(key, classObj, true);

        if (invoke)
        {
            return this.get(key);
        }
    }

    /**
     * Does this set contain a key?
     *
     * @access {public}
     * @param  {string}  key The data key
     * @return {boolean}
     */
    Inverse.prototype.has = function(key)
    {
        key = this._normalizeKey(key);

        for (var k in this._store)
        {
            if (k === key)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Remove a key/value
     *
     * @access {public}
     * @param {string} key   The data key
     */
    Inverse.prototype.delete = function(key)
    {
        key = this._normalizeKey(key);

        delete this._store[key];

        var _proto = Object.getPrototypeOf(this);

        if (typeof _proto[key] !== 'undefined')
        {
            _proto[key] = undefined;
        }
    }

    /**
     * Get data value with key
     *
     * @access {public}
     * @param  {string} key The data key
     * @param  {mixed}  ... Any additional parameters to pass to the constructor (optional) (default null)
     * @return {mixed}      The data value
     */
    Inverse.prototype.get = function(key)
    {
        key = this._normalizeKey(key);

        let args = Array.prototype.slice.call(arguments).slice(1);

        let storeObj = this._store[key];

        if (storeObj)
        {
            if (args[0] && args[0] === this.IMPORT_AS_REF) return storeObj.value;

            // Singletons
            if (storeObj.singleton)
            {
                if (!storeObj.instance)
                {
                    return storeObj.singleton.apply(this, [key, ...args]);
                }

                return storeObj.instance;
            }
            // Constructorables
            if (storeObj.invokable)
            {
                return this._newInstance(storeObj.value, args);
            }
            // Functions
            if (storeObj.funcn)
            {
                return storeObj.value.apply(this, args);
            }
            // Intances and all other var types
            return storeObj.value;
        }
    }

    /**
     * Get data value with key
     *
     * @access {public}
     * @param  {string} key The data key
     * @param  {mixed}  ... Any additional parameters to pass to the constructor (optional) (default null)
     * @return {mixed}      The data value
     */
    Inverse.prototype.import = function(names)
    {
        const _this   = this;
        const _import = {};

        _import.from = function(module)
        {
            const _rets = [];

            const _context = _this.get(module);

            for (var i = 0; i < names.length; i++)
            {
                const mixedVar = _context[names[i]];

                _rets.push(_this._is_func(mixedVar) ? _this.bind(_context[names[i]], _context) : mixedVar);

            }

            return _rets;
        };

        return _import;
    }

    Inverse.prototype.bind = function(callback, context)
    {
        context = typeof context === 'undefined' ? window : context;

        const bound = function()
        {
            return callback.apply(context, arguments);
        }

        Object.defineProperty(bound, 'name', { value: callback.name });

        bound.__isBound      = true;
        bound.__boundContext = context;
        bound.__origional    = callback;

        return bound;
    }

    /**
     * Sets the key as a prototype method
     *
     * @access {public}
     * @param  {string} key   The data key
     * @return {mixed}
     */
    Inverse.prototype._setProto = function(key)
    {
        var _this = this;

        var _proto = Object.getPrototypeOf(this);

        _proto[key] = function()
        {
            var args = Array.prototype.slice.call(arguments);

            args.unshift(key);

            return _this.get.apply(_this, args);
        };
    }

    /**
     * Stores a globally unique singleton
     *
     * @access {public}
     * @param  {string} key      The value or object name
     * @param  {object} classObj The closure that defines the object
     * @return {this}
     */
    Inverse.prototype._singletonFunc = function(key)
    {
        let storeObj = this._store[key];
        let instance = storeObj.invoked ? storeObj.instance : null;
        let args     = Array.prototype.slice.call(arguments).slice(1);

        if (!instance)
        {
            instance           = this._newInstance(storeObj.value, args);
            storeObj.function  = false;
            storeObj.invokable = false;
            storeObj.invoked   = true;
            storeObj.value     = null;
            storeObj.instance  = instance;
            storeObj.singleton = true;
        }

        return instance;
    }

    Inverse.prototype._isInvokable = function(mixed_var)
    {
        // Not a function
        if (typeof mixed_var !== 'function' || mixed_var === null)
        {
            return false;
        }

        // Strict ES6 class
        if (/^\s*class\s+\w+/.test(mixed_var.toString()))
        {
            return true;
        }

        // Native arrow functions
        if (!mixed_var.prototype || !mixed_var.prototype.constructor)
        {
            return false;
        }

        // Prototype
        let proto = mixed_var.prototype || Object.getPrototypeOf(mixed_var);

        let protokeys = Object.getOwnPropertyNames(proto);

        if (protokeys.filter(x => !EMPTY_OBJ_KEYS.includes(x)).length === 0) return false;

        return true;
    }

    /**
     * Checks if a class object has been invoked
     *
     * @access {private}
     * @param  {mixed} mixedVar The object instance or reference
     * @return {bool}
     */
    Inverse.prototype._isInvoked = function(mixedVar)
    {
        if (typeof mixedVar === 'object' && mixedVar.constructor && typeof mixedVar.constructor === 'function')
        {
            var constr = mixedVar.constructor.toString().trim();
            
            return constr.startsWith('function (') || constr.startsWith('function(') || constr.startsWith('function Object(') || constr.startsWith('class ') ;
        }

        return false;
    }

    /**
     * Invokes and returns a new class instance
     *
     * @access {private}
     * @param  {mixed} classObj The object instance or reference
     * @param  {array} args     Arguements to pass to class constructor (optional) (default null)
     * @return {object}
     */
    Inverse.prototype._newInstance = function(reference, args)
    {
        return new reference(...args);
    }

    /**
     * Invokes and returns a new class instance
     *
     * @access {private}
     * @param  {mixed} classObj The object instance or reference
     * @param  {array} args     Arguements to pass to class constructor (optional) (default null)
     * @return {object}
     */
    Inverse.prototype._storeObj = function(mixedVar, isSingleton)
    {
        isSingleton = typeof isSingleton === 'undefined' ? false : isSingleton;

        let value       = mixedVar;
        let invokable   = this._isInvokable(mixedVar);
        let invoked     = this._isInvoked(mixedVar);
        let instance    = invoked && isSingleton ? mixedVar : null;
        let funcn       = this._is_func(mixedVar) && !invokable && !invoked && !isSingleton;
        let singleton   = isSingleton ? this._singletonFunc : false;

        return { funcn, invokable, invoked, value, instance, singleton };
    }

    /**
     * Normalizes key for prototypes
     *
     * @access {private}
     * @param  {string} key Key to normalize
     * @return {string}
     */
    Inverse.prototype._normalizeKey = function(key)
    {
        return key.replace(/[^\w]+/g, '');
    }

    Inverse.prototype._is_func = function(mixedVar)
    {
        return Object.prototype.toString.call(mixedVar) === '[object Function]';
    }

    /**
     * Loads container into global namespace as "frontbx"
     *
     */
    container = new Inverse;
    
})();

// Utils
// Standard
const NULL_TAG = '[object Null]';
const UNDEF_TAG = '[object Undefined]';
const BOOL_TAG = '[object Boolean]';
const STRING_TAG = '[object String]';
const NUMBER_TAG = '[object Number]';
const FUNC_TAG = '[object Function]';
const ARRAY_TAG = '[object Array]';
const ARGS_TAG = '[object Arguments]';
const NODELST_TAG = '[object NodeList]';
const OBJECT_TAG = '[object Object]';
const DATE_TAG = '[object Date]';
const NODECLT_TAG = '[object HTMLCollection]';

// Unusual
const SET_TAG = '[object Set]';
const MAP_TAG = '[object Map]';
const REGEXP_TAG = '[object RegExp]';
const SYMBOL_TAG = '[object Symbol]';
const CSSDEC_TAG = '[object CSSStyleDeclaration]';

// Array buffer
const ARRAY_BUFFER_TAG = '[object ArrayBuffer]';
const DATAVIEW_TAG = '[object DataView]';
const FLOAT32_TAG = '[object Float32Array]';
const FLOAT64_TAG = '[object Float64Array]';
const INT8_TAG = '[object Int8Array]';
const INT16_TAG = '[object Int16Array]';
const INT32_TAG = '[object Int32Array]';
const UINT8_TAG = '[object Uint8Array]';
const UINT8CLAMPED_TAG = '[object Uint8ClampedArray]';
const UINT16_TAG = '[object Uint16Array]';
const UINT32_TAG = '[object Uint32Array]';

// Non-cloneable
const ERROR_TAG = '[object Error]';
const WEAKMAP_TAG = '[object WeakMap]';

// Arrayish _tags
const ARRAYISH_TAGS = [ARRAY_TAG, ARGS_TAG, NODELST_TAG, NODECLT_TAG];

// Object.prototype.toString
const TO_STR = Object.prototype.toString;

// Array.prototype.slice
const TO_ARR = Array.prototype.slice;

// Regex for HTMLElement types
const HTML_REGXP = /^\[object HTML\w*Element\]$/;
/**
 * List of shorthand properties and their longhand equivalents
 *
 * @var {object}
 */
const SHORTHAND_PROPS =
{
    // CSS 2.1: http://www.w3.org/TR/CSS2/propidx.html
    'list-style': ['-type', '-position', '-image'],
    'margin': ['-top', '-right', '-bottom', '-left'],
    'outline': ['-width', '-style', '-color'],
    'padding': ['-top', '-right', '-bottom', '-left'],

    // CSS Backgrounds and Borders Module Level 3: http://www.w3.org/TR/css3-background/
    'background': ['-image', '-position', '-size', '-repeat', '-origin', '-clip', '-attachment', '-color'],
    'border': ['-width', '-style', '-color'],
    'border-color': ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
    'border-style': ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
    'border-width': ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
    'border-top': ['-width', '-style', '-color'],
    'border-right': ['-width', '-style', '-color'],
    'border-bottom': ['-width', '-style', '-color'],
    'border-left': ['-width', '-style', '-color'],
    'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
    'border-image': ['-source', '-slice', '-width', '-outset', '-repeat'],

    // CSS Fonts Module Level 3: http://www.w3.org/TR/css3-fonts/
    'font': ['-style', '-variant', '-weight', '-stretch', '-size', 'line-height', '-family'],
    'font-variant': ['-ligatures', '-alternates', '-caps', '-numeric', '-east-asian'],

    // CSS Masking Module Level 1: http://www.w3.org/TR/css-masking/
    'mask': ['-image', '-mode', '-position', '-size', '-repeat', '-origin', '-clip'],
    'mask-border': ['-source', '-slice', '-width', '-outset', '-repeat', '-mode'],

    // CSS Multi-column Layout Module: http://www.w3.org/TR/css3-multicol/
    'columns': ['column-width', 'column-count'],
    'column-rule': ['-width', '-style', '-color'],

    // CSS Speech Module: http://www.w3.org/TR/css3-speech/
    'cue': ['-before', '-after'],
    'pause': ['-before', '-after'],
    'rest': ['-before', '-after'],

    // CSS Text Decoration Module Level 3: http://www.w3.org/TR/css-text-decor-3/
    'text-decoration': ['-line', '-style', '-color'],
    'text-emphasis': ['-style', '-color'],

    // CSS Animations (WD): http://www.w3.org/TR/css3-animations
    'animation': ['-name', '-duration', '-timing-function', '-delay', '-iteration-count', '-direction', '-fill-mode', '-play-state'],

    // CSS Transitions (WD): http://www.w3.org/TR/css3-transitions/
    'transition': ['-property', '-duration', '-timing-function', '-delay'],

    // CSS Flexible Box Layout Module Level 1 (WD): http://www.w3.org/TR/css3-flexbox/
    'flex': ['-grow', '-shrink', '-basis'],
};

/**
 * List of shorthand properties and their longhand equivalents
 *
 * @var {object}
 */
const SHORTHAND_DEFAULTS = 
{
    '-width' : '0',
    '-height' : '0',
    '-top' : '0',
    '-left' : '0',
    '-bottom' : '0',
    '-duration' : '0s',
    '-delay' : '0s',
    '-grow' : '1' ,
    '-shrink' : '1' ,
    '-iteration-count' : '1',
    '-timing-function' : 'linear',
    '-transition-property' : 'all',
    '-fill-mode': 'none',
    '-emphasis' : 'none',
    '-color' : 'none',
    '-decoration' : 'none',
    '-direction' : 'normal',
    '-play-state' : 'running',
};

/**
 * CSS Transform value counts
 *
 * @var {object}
 */
const CSS_TRANSFORM_VALUES_COUNT = 
{
    perspective: 1,
    skewY: 1,
    translateY: 1,
    translateZ: 1,
    scaleY: 1,
    scaleZ: 1,
    rotateX: 1,
    rotateY: 1,
    rotateZ: 1,
    translateX: 1,
    skewX: 1,
    scaleX: 1,
    rotate: 1,

    skew: 2,
    translate: 2,
    scale: 2,

    translate3d: 3,
    scale3d: 3,
    rotate3d: 3,

    matrix: 6,
    matrix3d: 16
};

const CSS_3D_TRANSFORM_DEFAULTS =
{
    'translate3d' : ['0','0','0'],
    'scale3d'     : ['1','1','1'],
    'rotate3d'    : ['0','0','1','0'],
    'skew'        : ['0', '0'],
};

const CSS_3D_TRANSFORM_MAP_KEYS =
{
    x: 0,
    y: 1,
    z: 3
};

/* USED FOR css_to_px */
const CSS_PIXELS_PER_INCH = 96;
const CSS_RELATIVE_UNITS  = {
    // Relative to the font-size of the element (2em means 2 times the size of the current font)
    'em' : 16,

    // Relative to the x-height of the current font (rarely used)
    'ex' : 7.15625,

    // Relative to the width of the "0" (zero)
    'ch' : 8,

    // Relative to font-size of the root element
    'rem' : 16,

    // Relative to 1% of the width of the viewport
    'vw' : 1,

    // Relative to 1% of the height of the viewport
    'vh' : 1,

    // Relative to 1% of viewport's* smaller dimension
    // If the viewport height is smaller than the width, 
    // the value of 1vmin will be equal to 1% of the viewport height.
    // Similarly, if the viewport width is smaller than the height, the value of 1vmin will be equal to 1% of the viewport width.
    'vmin' : 765,
    'vmax' : 1200,

    // Relative to the parent element
    '%' : 16
}
const CSS_ABSOLUTE_UNITS =
{
    'in': CSS_PIXELS_PER_INCH,
    'cm': CSS_PIXELS_PER_INCH / 2.54,
    'mm': CSS_PIXELS_PER_INCH / 25.4,
    'pt': CSS_PIXELS_PER_INCH / 72,
    'pc': CSS_PIXELS_PER_INCH / 6,
    'px': 1
}


/**
 * Cached CSS propery cases.
 *
 * @var {object}
 */
const CSS_PROP_TO_HYPHEN_CASES = {};
const CSS_PROP_TO_CAMEL_CASES  = {};
// Empty object
const EMPTY_OBJ_KEYS = Object.getOwnPropertyNames(Object.getPrototypeOf({}));

const FORBIDDEN_OBJ_KEYS = ['length', 'name', 'arguments', 'constructor', 'apply', 'bind', 'call', 'toString', 'caller', 'callee', 'prototype'];
/**
 * Default options.
 * 
 * @var {object}
 */
const ANIMATION_DEFAULT_OPTIONS =
{
    // Options
    //'property', 'from', 'to', 'callback', 'complete', 'start', 'fail'
    easing:               'ease',
    duration:              500,
    fps:                   60, // (16ms)
};

 /**
 * Allowed Options.
 * 
 * @var {array}
 */
const ANIMATION_ALLOWED_OPTIONS = ['property', 'from', 'to', 'duration', 'easing', 'callback'];

/**
 * Allowed Options.
 * 
 * @var {array}
 */
const ANIMATION_FILTER_OPTIONS = [ ...Object.keys(ANIMATION_DEFAULT_OPTIONS), ...ANIMATION_ALLOWED_OPTIONS];

/**
 * Currently animating animations.
 * 
 * @var {array}
 */
const ANIMATING = [];


/**
 * Math Contstansts.
 * 
 * @var {mixed}
 */
const POW  = Math.pow;
const SQRT = Math.sqrt;
const SIN  = Math.sin;
const COS  = Math.cos;
const PI   = Math.PI;
const C1   = 1.70158;
const C2   = C1 * 1.525;
const c3   = C1 + 1;
const C4   = (2 * PI) / 3;
const C5   = (2 * PI) / 4.5;

/**
 * bounceOut function.
 * 
 * @var {function}
 */
const bounceOut = function (x)
{
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1)
    {
        return n1 * x * x;
    }
    else if (x < 2 / d1)
    {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    }
    else if (x < 2.5 / d1)
    {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    }
    else
    {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
};

/**
 * Easing functions.
 * 
 * @var {object}
 */
const ANIMATION_EASING_FUNCTIONS = 
{
    linear: (x) => x,
    ease: function (x)
    {
        return x < 0.5 ? 4 * x * x * x : 1 - POW(-2 * x + 2, 3) / 2;
    },
    easeIn: function (x)
    {
        return 1 - COS((x * PI) / 2);
    },
    easeOut: function (x)
    {
        return SIN((x * PI) / 2);
    },
    easeInOut: function (x)
    {
        return -(COS(PI * x) - 1) / 2;
    },
    easeInQuad: function (x)
    {
        return x * x;
    },
    easeOutQuad: function (x)
    {
        return 1 - (1 - x) * (1 - x);
    },
    easeInOutQuad: function (x)
    {
        return x < 0.5 ? 2 * x * x : 1 - POW(-2 * x + 2, 2) / 2;
    },
    easeInCubic: function (x)
    {
        return x * x * x;
    },
    easeOutCubic: function (x)
    {
        return 1 - POW(1 - x, 3);
    },
    easeInOutCubic: function (x)
    {
        return x < 0.5 ? 4 * x * x * x : 1 - POW(-2 * x + 2, 3) / 2;
    },
    easeInQuart: function (x)
    {
        return x * x * x * x;
    },
    easeOutQuart: function (x)
    {
        return 1 - POW(1 - x, 4);
    },
    easeInOutQuart: function (x)
    {
        return x < 0.5 ? 8 * x * x * x * x : 1 - POW(-2 * x + 2, 4) / 2;
    },
    easeInQuint: function (x)
    {
        return x * x * x * x * x;
    },
    easeOutQuint: function (x)
    {
        return 1 - POW(1 - x, 5);
    },
    easeInOutQuint: function (x)
    {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - POW(-2 * x + 2, 5) / 2;
    },
    easeInSine: function (x)
    {
        return 1 - COS((x * PI) / 2);
    },
    easeOutSine: function (x)
    {
        return SIN((x * PI) / 2);
    },
    easeInOutSine: function (x)
    {
        return -(COS(PI * x) - 1) / 2;
    },
    easeInExpo: function (x)
    {
        return x === 0 ? 0 : POW(2, 10 * x - 10);
    },
    easeOutExpo: function (x)
    {
        return x === 1 ? 1 : 1 - POW(2, -10 * x);
    },
    easeInOutExpo: function (x)
    {
        return x === 0
            ? 0
            : x === 1
            ? 1
            : x < 0.5
            ? POW(2, 20 * x - 10) / 2
            : (2 - POW(2, -20 * x + 10)) / 2;
    },
    easeInCirc: function (x)
    {
        return 1 - SQRT(1 - POW(x, 2));
    },
    easeOutCirc: function (x)
    {
        return SQRT(1 - POW(x - 1, 2));
    },
    easeInOutCirc: function (x)
    {
        return x < 0.5
            ? (1 - SQRT(1 - POW(2 * x, 2))) / 2
            : (SQRT(1 - POW(-2 * x + 2, 2)) + 1) / 2;
    },
    easeInBack: function (x)
    {
        return c3 * x * x * x - C1 * x * x;
    },
    easeOutBack: function (x)
    {
        return 1 + c3 * POW(x - 1, 3) + C1 * POW(x - 1, 2);
    },
    easeInOutBack: function (x)
    {
        return x < 0.5
            ? (POW(2 * x, 2) * ((C2 + 1) * 2 * x - C2)) / 2
            : (POW(2 * x - 2, 2) * ((C2 + 1) * (x * 2 - 2) + C2) + 2) / 2;
    },
    easeInElastic: function (x)
    {
        return x === 0
            ? 0
            : x === 1
            ? 1
            : -POW(2, 10 * x - 10) * SIN((x * 10 - 10.75) * C4);
    },
    easeOutElastic: function (x)
    {
        return x === 0
            ? 0
            : x === 1
            ? 1
            : POW(2, -10 * x) * SIN((x * 10 - 0.75) * C4) + 1;
    },
    easeInOutElastic: function (x)
    {
        return x === 0
            ? 0
            : x === 1
            ? 1
            : x < 0.5
            ? -(POW(2, 20 * x - 10) * SIN((20 * x - 11.125) * C5)) / 2
            : (POW(2, -20 * x + 10) * SIN((20 * x - 11.125) * C5)) / 2 + 1;
    },
    easeInBounce: function (x)
    {
        return 1 - bounceOut(1 - x);
    },
    easeOutBounce: bounceOut,
    easeInOutBounce: function (x)
    {
        return x < 0.5
            ? (1 - bounceOut(1 - 2 * x)) / 2
            : (1 + bounceOut(2 * x - 1)) / 2;
    },
};

const CSS_EASINGS = 
{
    // Defaults
    ease: 'ease',
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // sine
    easeInSine: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
    easeOutSine: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
    easeInOutSine: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',

    // Quad
    easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',

    // Cubic
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',

    // Queart
    easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
    easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',

    // Quint
    easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',

    // Expo
    easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
    easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
    easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',

    // Circ
    easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
    easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',

    // Back
    easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

/**
 * Array of HTML events
 *
 * @var {array}
 */
const DOC_EVENTS = Object.getOwnPropertyNames(document).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(document)))).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(window))).filter(function(i){return !i.indexOf('on')&&(document[i]==null||typeof document[i]=='function');}).filter(function(elem, pos, self){return self.indexOf(elem) == pos;}).map((x) => x.replace('on', '').toLowerCase());
/**
 * Boolean attributes
 *
 * @var {array}
 */
const BOOLEAN_ATTRS = 
[
	'allowfullscreen',
	'async',
	'autofocus',
	'autoplay',
	'checked',
	'controls',
	'default',
	'defer',
	'disabled',
	'formnovalidate',
	'inert',
	'ismap',
	'itemscope',
	'loop',
	'multiple',
	'muted',
	'nomodule',
	'novalidate',
	'open',
	'playsinline',
	'readonly',
	'required',
	'reversed',
	'selected',
	'hidden',
];

/**
 * Property attributes
 *
 * @var {array}
 */
const PROP_ATTRIBUTES = ['href', 'list', 'form', 'tabIndex', 'download'];

(function()
{
    var _THIS = null;

    const _ = function()
    {
        this.version = "1.0.0";

        this.author = "Joe Howard";

        this.browser = false;

        this._events = {};

        this._guid = 1;

        _THIS = this;
    }

    _.prototype._guidgen = function()
    {
        return `__${this._guid++}`;
    }
const AnimateJS = function(DOMElement, options)
{
    this.DOMElement = DOMElement;

    this.options = options;

    this.keyframes = [];

    this.currentKeyframe = 0;

    this.duration = options.duration;

    this.intervalDelay = Math.floor(1000 / options.fps);

    this.keyFrameCount = Math.floor(this.duration / this.intervalDelay) + 1;

    this.easing = options.easing;

    this.CSSProperty = options.property;

    this.isTransform = this.CSSProperty.toLowerCase().includes('transform');

    this.isScroll = this.CSSProperty.toLowerCase().replace('-', '') === 'scrollto' && DOMElement === window;

    this.isColor = options.property.includes('color') || options.to.startsWith('#') || options.to.startsWith('rgb');

    this.clearAnimating(DOMElement);

    this.parseOptions();

    this.generateKeyframes();

    this.stopped = true;

    return this;
}

AnimateJS.prototype.clearAnimating = function(DOMElement)
{
    const CSSprop = this.CSSProperty;

    _THIS.each(ANIMATING, function(i, animation)
    {
        if (animation.CSSProperty === CSSprop && animation.DOMElement === DOMElement)
        {
            animation.stop();

            ANIMATING.splice(i, 1);

            return false;
        }
    });
}

AnimateJS.prototype.start = function()
{
    if (this.keyFrameCount === 0) return this._complete();

    this.stopped = false;

    if (!this.isScroll) this.clearTransitions();

    if (this.options.start) this.options.start(this.DOMElement);

    const loop = () =>
    {        
        if (this.stopped) return;

        this._applyKeyframe(this.keyframes.shift());

        if (this.keyframes.length === 0)
        {            
            return this._complete();
        }

        setTimeout(loop, this.intervalDelay);
    }

    loop();

    this._failTimer = setTimeout(() =>
    {            
        if (this.options.fail) this.options.fail(this.DOMElement);

    }, this.duration + 50 );

    ANIMATING.push(this);

    return this;
}

AnimateJS.prototype._applyKeyframe = function(keyframe)
{
    if (!keyframe) return;

    let prop = Object.keys(keyframe)[0];

    this.isScroll ? window.scrollTo(keyframe[0], keyframe[1]) : _THIS.css(this.DOMElement, prop, keyframe[prop]);
}

AnimateJS.prototype._complete = function()
{
    clearTimeout(this._failTimer);

    _THIS.each(ANIMATING, (i, animation) =>
    {
        if (animation === this)
        {
            ANIMATING.splice(i, 1);

            return false;
        }
    });

    let DOMElement = this.DOMElement;

    if (this.options.complete) this.options.complete(DOMElement);

    if (this.options.callback) this.options.callback(DOMElement);

    if (!this.isScroll) _THIS.css(DOMElement, 'transition', this._pre_transition );
}

AnimateJS.prototype.stop = function()
{
    this.stopped = true;

    clearTimeout(this._failTimer);

    return this;
}

AnimateJS.prototype.parseOptions = function()
{
    if (this.isScroll)
    {
        this.parseScrollOptions();
    }
    else if (this.isTransform)
    {
        this.parseTransformOptions();
    }
    else if (this.isColor)
    {
        this.parseColorOptions();
    }
    else
    {
        this.parseDefaultOptions();
    }
}

AnimateJS.prototype.parseScrollOptions = function()
{
    if (!this.options.to.includes(','))
    {
        throw new Error('Invalid scroll value. Animating scroll should be provided as [Y, X].');
    }

    // We ignore 'from'
    let startY = window.scrollY;
    let startX = window.scrollX;
    let endX   = parseInt(this.options.to.split(',').shift().trim());
    let endY   = parseInt(this.options.to.split(',').pop().trim());
    let distX  = Math.abs(endX < startX ? (startX - endX) : (endX - startX))
    let distY  = Math.abs(endY < startY ? (startY - endY) : (endY - startY))

    this.startValue    = [startX, startY];
    this.endValue      = [endX, endY];
    this.backAnimation = [endX < startX, endY < startY];
    this.distance      = [distX, distY] ;
    this.CSSunits      = '';
}

AnimateJS.prototype.parseDefaultOptions = function()
{
    var startVal = _THIS.is_undefined(this.options.from) ? _THIS.rendered_style(this.DOMElement, this.CSSProperty) : this.options.from;
    var endVal   = this.options.to;

    // We need to set the end value, then remove it and re-apply any inline styles if they
    // existed
    if (endVal === 'auto' || endVal === 'initial' || endVal === 'unset')
    {
        let prevStyle = _THIS.inline_style(this.DOMElement, this.CSSProperty);

        _THIS.css(this.DOMElement, this.CSSProperty, endVal);
        
        endVal = _THIS.rendered_style(this.DOMElement, this.CSSProperty);
        
        _THIS.css(this.DOMElement, this.CSSProperty, prevStyle ? prevStyle : false);
    }

    // From auto
    if (startVal === 'auto' || startVal === 'initial')
    {
        startVal = _THIS.rendered_style(this.DOMElement, this.CSSProperty);
    }

    var startUnit = _THIS.css_value_unit(startVal);
    var endUnit   = _THIS.css_value_unit(endVal);

    if (startUnit !== endUnit && this.CSSProperty !== 'opacity')
    {
        if (startUnit !== 'px')
        {
            startVal  = _THIS.css_to_px(startVal + startUnit, this.DOMElement, this.CSSProperty);
            startUnit = 'px';
        }
        if (endUnit !== 'px')
        {
            endVal  = _THIS.css_to_px(this.options.to, this.DOMElement, this.CSSProperty);
            endUnit = 'px';
        }
    }

    startVal = _THIS.css_unit_value(startVal);
    endVal   = _THIS.css_unit_value(endVal);

    this.startValue    = _THIS.css_unit_value(startVal);
    this.endValue      = _THIS.css_unit_value(endVal);
    this.backAnimation = endVal < startVal;
    this.distance      = Math.abs(endVal < startVal ? (startVal - endVal) : (endVal - startVal));
    this.CSSunits      = endUnit;
}

AnimateJS.prototype.parseTransformOptions = function()
{
    var DOMElement    = this.DOMElement;
    var startValues   = _THIS.css_transform_props(DOMElement, false);
    var endValues     = _THIS.css_transform_props(this.options.to, false);

    // If a start value was specified it gets overwritten as the transform
    // property is singular
    if (this.options.from)
    {
        startValues = _THIS.css_transform_props(this.options.from);
    }

    this.CSSProperty    = [];
    this.startValue     = [];
    this.endValue       = [];
    this.CSSunits       = [];
    this.backAnimation  = [];
    this.distance       = [];
    this.baseTransforms = _THIS.is_empty(startValues) ? '' : _THIS.join_obj(_THIS.map(startValues, (prop, val) => !endValues[prop] ? val : false), '(', ') ', false, false);

    _THIS.each(endValues, function(propAxis, valueStr)
    {
        var startValStr        = !startValues[propAxis] ? (propAxis.includes('scale') ? '1' : '0') : startValues[propAxis];
        var startVal           = _THIS.css_unit_value(startValStr);
        var endVal             = _THIS.css_unit_value(valueStr);
        var startUnit          = _THIS.css_value_unit(startValStr);
        var endUnit            = _THIS.css_value_unit(valueStr);
        var CSSpropertyUnits   = endUnit;

        if (startUnit !== endUnit)
        {
            // 0 no need to convert
            if (_THIS.is_empty(startUnit))
            {
                startUnit = endUnit;
            }
            else
            {
                if (startUnit !== 'px') startVal = _THIS.css_to_px(startVal + startUnit, DOMElement, propAxis.includes('Y') ? 'height' : 'width');
                if (endUnit !== 'px') endVal = _THIS.css_to_px(endVal + endUnit, DOMElement, propAxis.includes('Y') ? 'height' : 'width');
                CSSpropertyUnits = 'px';
            }
        }

        this.CSSProperty.push(propAxis);
        this.CSSunits.push(endUnit);
        this.endValue.push(endVal);
        this.startValue.push(startVal);
        this.backAnimation.push(endVal < startVal);
        this.distance.push(Math.abs(endVal < startVal ? (startVal - endVal) : (endVal - startVal)));

    }, this);
}

AnimateJS.prototype.parseColorOptions = function()
{
    this.startValue = this.sanitizeColor(this.options.from || _THIS.rendered_style(this.DOMElement, this.CSSProperty));
    this.endValue   = this.sanitizeColor(this.options.to);
}

/**
 * Sanitize the start and end colors to RGB arrays.
 * 
 * @param  {string} color  hex or rgb color as as string
 * @return {array}
 */
AnimateJS.prototype.sanitizeColor = function(color)
{
    if (color.startsWith('rgb('))
    {
        return color.split(' ', 3).map((x) => parseInt(x.replaceAll(/[^\d+]/g, '')));
    }
    else if (color.length === 7 )
    {
        let rgb = [];

        color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i).forEach((item) =>
        {
            if (item.length === 2)
            {
                const color = parseInt(item, 16);

                rgb.push(color);
            }
        });

        return rgb;
    }
}

AnimateJS.prototype.generateKeyframes = function()
{    
    if (_THIS.is_equal(this.startValue, this.endValue))
    {
        this.keyFrameCount = 0;

        return;
    }

    if (this.isScroll)
    {
        _THIS.for(this.keyFrameCount, function(index)
        {
            let x = this.generateKeyframe(index, 0);
            let y = this.generateKeyframe(index, 1);

            this.keyframes.push([x, y]);
                            
        }, this);

        // Fallback
        this.keyframes.push([this.endValue[0], this.endValue[1]]);

        return;
    }

    if (this.isTransform)
    {
        _THIS.for(this.endValue, function(transformIndex)
        {
            _THIS.for(this.keyFrameCount, function(index)
            {
                this.keyframes.push(this.generateKeyframe(index, transformIndex));
                
            }, this);
            
        }, this);

        return;
    }

    _THIS.for(this.keyFrameCount, function(index)
    {
        this.keyframes.push(this.generateKeyframe(index));
        
    }, this);

    // Failsafe
    if (this.keyframes[this.keyFrameCount -1][this.CSSProperty] !== `${this.endValue}${this.CSSunits}`)
    {
        this.keyframes.push({[this.CSSProperty]: `${this.endValue}${this.CSSunits}`});
    }
}

AnimateJS.prototype.generateKeyframe = function(index, transformIndex)
{
    if (this.isColor)
    {
        const change = this.tween(this.easing, (index / this.keyFrameCount));
        
        return { [this.CSSProperty]: this.mixColors(this.startValue, this.endValue, change) };
    }
    
    const backAnimation = this.isTransform || this.isScroll ? this.backAnimation[transformIndex] : this.backAnimation;

    const startValue = this.isTransform || this.isScroll ? this.startValue[transformIndex] : this.startValue;

    const distance = this.isTransform || this.isScroll ? this.distance[transformIndex] : this.distance;

    const change = (distance * this.tween(this.easing, (index / this.keyFrameCount)));

    const keyVal = this.roundNumber(backAnimation ? startValue - change : startValue + change, this.CSSProperty === 'opacity' ? 5 : 1);

    var property = this.isTransform ? 'transform' : this.CSSProperty;

    var prefix  = this.isTransform ? `${this.CSSProperty[transformIndex]}(` : '';

    var suffix  = this.isTransform ? `${this.CSSunits[transformIndex]})` : this.CSSunits;
    
    var keyframe = { [property]:  `${prefix}${keyVal}${suffix}` };
    
    if (this.isScroll)
    {
        return keyVal;
    }

    if (this.isTransform && _THIS.is_undefined(this.keyframes[index]))
    {
        keyframe[property] = `${this.baseTransforms} ${keyframe[property]}`.trim();
    }

    return keyframe;
}

/**
 * Mix 2 colors.
 * 
 * @param  {array}  color1 RGB color array
 * @param  {array}  color2 RGB color array
 * @param  {number} blend % between 0 and 1
 * @return {string} 
 */
AnimateJS.prototype.mixColors = function(color1RGB, color2RGB, blend)
{
    function linearInterpolation(y1, y2, x)
    {
        return Math.round(x * (y2 - y1) + y1);
    }
    
    const colorRGB  = [];

    color1RGB.forEach((c1, index) =>
    {
        const mixedColor = linearInterpolation(c1, color2RGB[index], blend);

        colorRGB.push(mixedColor);
    });

    return 'rgb(' + colorRGB + ')';
}

/**
 * Calculate the easing pattern.
 * 
 * @private
 * @link    {https://gist.github.com/gre/1650294}
 * @param   {String} type Easing pattern
 * @param   {Number} time Time animation should take to complete
 * @returns {Number}
 */
AnimateJS.prototype.clearTransitions = function()
{        
    var CSSProperty    = this.isTransform ? 'transform' : this.CSSProperty;
    var transitions    = _THIS.css_transition_props(this.DOMElement);
    var css_transition = _THIS.inline_style(this.DOMElement, 'transition'); 

    if (_THIS.is_empty(transitions) || !transitions[CSSProperty]) return;

    transitions[CSSProperty] = '0s linear 0s';

    _THIS.css(this.DOMElement, 'transition', _THIS.join_obj(transitions, ' ', ', '));

    this._pre_transition = !css_transition ? false : css_transition;
}

AnimateJS.prototype.roundNumber = (n, dp) => 
{
    const h = +('1'.padEnd(dp + 1, '0')) // 10 or 100 or 1000 or etc

    return Math.round(n * h) / h;
}

/**
 * Calculate the easing pattern.
 * 
 * @private
 * @link    {https://gist.github.com/gre/1650294}
 * @param   {String} type Easing pattern
 * @param   {Number} time Time animation should take to complete
 * @returns {Number}
 */
AnimateJS.prototype.tween = function(type, time)
{
    return ANIMATION_EASING_FUNCTIONS[type].call(null, time) || time;
}

_.prototype.__animate_js = function(DOMElement, options)
{
    return (new AnimateJS(DOMElement, options)).start();
}
const AnimateCss = function(DOMElement, options)
{     
    // Domeleement   
    this.DOMElement = DOMElement;

    // Options
    this.options = options;

    // Props to animate
    this.animatedProps = {};

    // Pre animation transitions to restore
    this.preAnimatedTransitions = {};

    // Cache stopvalues
    this.stopValues = {};

    // Fail timer
    this._failTimer = null;
    
    // Max duration
    this.duration  = 0;
    
    // Callbacks
    this._callbackStart    = () => {};
    this._callbackComplete = () => {};
    this._callbackFail     = () => {};
    this._callbackStep     = () => {};

    this.preProcessStartEndValues();

    return this;
};

/**
 * Start animation.
 *
 */
AnimateCss.prototype.start = function()
{
    this._callbackStart(this.DOMElement);

    this.applyStartValues();

    this.applyTransitions();

    _THIS.on(this.DOMElement, 'transitionend', this.transitionEnd, this);

    let _this = this;

    this._failTimer = setTimeout(() =>
    {
        _this._callbackFail(_this.DOMElement);

        _this.stop();

    }, this.duration + 50 );

    this._stepTimer = setInterval(() => this._callbackStep(), 16);

    this.applyEndValues();

    return this;
}

/**
 * Stop animation.
 *
 */
AnimateCss.prototype.stop = function()
{
    clearTimeout(this._failTimer);

    clearInterval(this._stepTimer);

    this.resotoreElement();

    _THIS.css(this.DOMElement, this.stopValues);
}

/**
 * Stop animation and destroy.
 *
 */
AnimateCss.prototype.destory = function()
{
    this.stop();

    this.animatedProps = {};

    this.preAnimatedTransitions = {};
}

/**
 * On transition end.
 * 
 * Note if a multiple animation properties wer supplied
 * we only want to call the callback once when all transitions
 * have completed.
 *
 * @param  {Event} e transitionEnd event
 */
AnimateCss.prototype.resotoreElement = function()
{
    _THIS.css(this.DOMElement, 'transition', this.preAnimatedTransitions);

    _THIS.off(this.DOMElement, 'transitionend', this.transitionEnd, this);
}

/**
 * On transition end.
 * 
 * Note if a multiple animation properties wer supplied
 * we only want to call the callback once when all transitions
 * have completed.
 *
 * @param  {Event} e transitionEnd event
 */
AnimateCss.prototype.transitionEnd = function(e)
{
    e = e || window.event;

    let prop = _THIS.css_prop_to_hyphen_case(e.propertyName);

    // Convert to shorthand if needed
    if (prop.includes('-'))
    {
        let shorthand = prop.split('-').shift();

        if (this.animatedProps[shorthand]) prop = shorthand;
    }

    let endVal = this.animatedProps[prop];

    // Change inline style back to auto
    if (endVal === 'auto' || endVal === 'initial' || endVal === 'unset') _THIS.css(this.DOMElement, prop, endVal);

    delete this.animatedProps[prop];
    
    if (_THIS.is_empty(this.animatedProps))
    {        
        clearTimeout(this._failTimer);

        clearInterval(this._stepTimer);

        this.resotoreElement();

        this._callbackComplete(this.DOMElement);
    }
}

/**
 * Checks for "auto" transtions.
 * 
 */
AnimateCss.prototype.preProcessStartEndValues = function()
{
    var DOMElement = this.DOMElement;
    
    // We need to set the end value explicitly as these values will not
    // transition with CSS
    _THIS.each(this.options, function(i, option)
    {
        // Cache start and fail callbacks
        if (option.start) this._callbackStart = option.start;
        if (option.fail) this._callbackFail = option.fail;
        if (option.step) this._callbackStep = option.step;

        // Keep the longest callback
        if (option.duration >= this.duration && (option.callback || option.complete))
        {
            this._callbackComplete = (option.callback || option.complete);
        }

        // Store the maximum duration
        if (option.duration >= this.duration) this.duration = option.duration;

        let startValue  = option.from;
        let endValue    = option.to;
        let CSSProperty = option.property;
        
        if (startValue === 'auto' || startValue === 'initial' || startValue === 'unset' || !startValue)
        {
            option.from = _THIS.rendered_style(DOMElement, CSSProperty);
        }

        if (endValue === 'auto' || endValue === 'initial' || endValue === 'unset')
        {
            let inlineStyle = _THIS.inline_style(DOMElement, CSSProperty);

            _THIS.css(DOMElement, CSSProperty, endValue);

            option.to = _THIS.rendered_style(DOMElement, CSSProperty);

            _THIS.css(DOMElement, CSSProperty, inlineStyle ? inlineStyle : false);
        }

        this.animatedProps[CSSProperty] = endValue;

        this.stopValues[CSSProperty] = _THIS.inline_style(DOMElement, CSSProperty) || false;

    }, this);
}

/**
 * Apply start values.
 * 
 */
AnimateCss.prototype.applyStartValues = function()
{
    var styles = {};

    _THIS.each(this.options, function(i, option)
    {
        styles[option.property] = option.from;
    });

    if (!_THIS.is_empty(styles)) _THIS.css(this.DOMElement, styles);
}

/**
 * Apply animation transitions.
 * 
 */
AnimateCss.prototype.applyTransitions = function()
{
    let transitions = _THIS.css_transition_props(this.DOMElement);

    this.preAnimatedTransitions  = _THIS.inline_style(this.DOMElement, 'transition') || false;

    _THIS.each(this.options, function(i, option)
    {
        // Setup and convert duration from MS to seconds
        let property = option.property;
        let duration = (option.duration / 1000);
        let easing   = CSS_EASINGS[option.easing] || 'ease';

        // Set the transition for the property
        // in our merged obj
        transitions[property] = `${duration}s ${easing}`;

    }, this);

    _THIS.css(this.DOMElement, 'transition', _THIS.join_obj(transitions, ' ', ', '));
}

/**
 * Apply animation end values.
 * 
 */
AnimateCss.prototype.applyEndValues = function()
{
    let styles = {};

    _THIS.each(this.options, function(i, option)
    {
        styles[option.property] = option.to;

    }, this);

    _THIS.css(this.DOMElement, styles);
}

/**
 * CSS Animation.
 *
 * @access {private}
 * @param  {DOMElement}     DOMElement          Target DOM node
 * @param  {object}   options             Options object
 * @param  {string}   options.property    CSS property
 * @param  {mixed}    options.from        Start value
 * @param  {mixed}    options.to          Ending value
 * @param  {int}      options.duration    Animation duration in MS
 * @param  {string}   options.easing      Easing function in camelCase
 * @param  {function} options.callback    Callback to apply when animation ends (optional)
 * Options can be provided three ways:
 * 
 * 1. Flat object with single property
 *      animate(el, { height: '500px', easing 'easeOut' })
 * 
 * 2. Flat Object with multiple properties 
 *      Note this way you can only animate from the existing rendered element style (you cannot provide a 'from' value)
 *      animate(el, { height: '500px', width: '500px', easing 'easeOut' })
 * 
 * 3. Multi object with different options per property
 *      animate(el, { height:{ from: '100px', to: '500px', easing: 'easeInOutElastic'}, opacity:{ to: 0, easing: 'linear'} } );
 * 
 */
_.prototype.__animate_css = function(DOMElement, options)
{    
    return new AnimateCss(DOMElement, options).start();
}

/**
 * Animate JS
 *
 * @access {public}
 * @param  {DOMElement} DOMElement                  Target DOM node
 * @param  {object}     options             Options object
 * @param  {string}     options.property    CSS property
 * @param  {mixed}      options.from        Start value
 * @param  {mixed}      options.to          Ending value
 * @param  {int}        options.duration    Animation duration in MS
 * @param  {string}     options.easing      Easing function in camelCase
 * @param  {function}   options.callback    Callback to apply when animation ends (optional)
 * @return {array}
 * Options can be provided three ways:
 * 
 * 1. Flat object with single property
 *      animate(el, { height: '500px', easing 'easeOut' })
 * 
 * 2. Flat Object with multiple properties 
 *      Note this way you can only animate from the existing rendered element style (you cannot provide a 'from' value)
 *      animate(el, { height: '500px', width: '500px', easing 'easeOut' })
 * 
 * 3. Multi object with different options per property
 *      animate(el, { height:{ from: '100px', to: '500px', easing: 'easeInOutElastic'}, opacity:{ to: 0, easing: 'linear'} } );
 * 
 */
_.prototype.animate = function(DOMElement, options)
{    
    const animationSet = [];

    const Animation = function()
    {
        return this;
    };

    Animation.prototype.start = function()
    {
        for (var i = 0; i < animationSet.length; i++)
        {
            animationSet[i].start();
        }
    };

    Animation.prototype.stop = function()
    {
        for (var i = 0; i < animationSet.length; i++)
        {
            animationSet[i].stop(true);
        }
    };

    Animation.prototype.destory = function()
    {
        for (var i = 0; i < animationSet.length; i++)
        {
            animationSet[i].destory();
        }

        animationSet = [];
    };

    const factoryOptions = !options.FROM_FACTORY ? this.__animation_factory(DOMElement, options) : options;

    const AnimationInstance = new Animation;

    this.each(factoryOptions, function(i, opts)
    {
        animationSet.push(this.__animate_js(DOMElement, opts));

    }, this);

    return AnimationInstance;
}

/**
 * Animate CSS
 *
 * @access {public}
 * @param  {DOMElement} DOMElement                  Target DOM node
 * @param  {object}     options             Options object
 * @param  {string}     options.property    CSS property
 * @param  {mixed}      options.from        Start value
 * @param  {mixed}      options.to          Ending value
 * @param  {int}        options.duration    Animation duration in MS
 * @param  {string}     options.easing      Easing function in camelCase
 * @param  {function}   options.callback    Callback to apply when animation ends (optional)
 * @return {array}
 * Options can be provided three ways:
 * 
 * 1. Flat object with single property
 *      animate(el, { height: '500px', easing 'easeOut' })
 * 
 * 2. Flat Object with multiple properties 
 *      Note this way you can only animate from the existing rendered element style (you cannot provide a 'from' value)
 *      animate(el, { height: '500px', width: '500px', easing 'easeOut' })
 * 
 * 3. Multi object with different options per property
 *      animate(el, { height:{ from: '100px', to: '500px', easing: 'easeInOutElastic'}, opacity:{ to: 0, easing: 'linear'} } );
 * 
 */
_.prototype.animate_css = function(DOMElement, options)
{
    let cssAnimation;

    const Animation = function()
    {
        return this;
    };

    Animation.prototype.start = function()
    {
        cssAnimation.start();
    };

    Animation.prototype.stop = function()
    {
        cssAnimation.stop(true);
    };

    Animation.prototype.destory = function()
    {
        cssAnimation.destory(true);
    };

    const factoryOptions = !options.FROM_FACTORY ? this.__animation_factory(DOMElement, options) : options;

    cssAnimation = this.__animate_css(DOMElement, factoryOptions);
    
    return new Animation;
}

/**
 * Animation factory.
 *
 * @access {private}
 * @param  {DOMElement} DOMElement                  Target DOM node
 * @param  {object}     options             Options object
 * @param  {string}     options.property    CSS property
 * @param  {mixed}      options.from        Start value
 * @param  {mixed}      options.to          Ending value
 * @param  {int}        options.duration    Animation duration in MS
 * @param  {string}     options.easing      Easing function in camelCase
 * @param  {function}   options.callback    Callback to apply when animation ends (optional)
 * @return {array}
 * Options can be provided three ways:
 * 
 * 1. Flat object with single property
 *      animate(el, { height: '500px', easing 'easeOut' })
 * 
 * 2. Flat Object with multiple properties 
 *      Note this way you can only animate from the existing rendered element style (you cannot provide a 'from' value)
 *      animate(el, { height: '500px', width: '500px', easing 'easeOut' })
 * 
 * 3. Multi object with different options per property
 *      animate(el, { height:{ from: '100px', to: '500px', easing: 'easeInOutElastic'}, opacity:{ to: 0, easing: 'linear'} } );
 * 
 */
_.prototype.__animation_factory = function(DOMElement, opts)
{
    var optionSets = [];

    this.each(opts, function(key, val)
    {
        // animation_factory('foo', { property : 'left', from : '-300px', to: '0',  easing: 'easeInOutElastic', duration: 3000} );
        if (key === 'property')
        {
            var options = { ...ANIMATION_DEFAULT_OPTIONS, ...opts};

            options.FROM_FACTORY = true;
            options.property     = this.css_prop_to_hyphen_case(val);
            options.el           = DOMElement;
            optionSets.push(options);

            // break
            return false;
        }
        else if (!this.in_array(key, ANIMATION_ALLOWED_OPTIONS))
        {
            // Only worth adding if the property is valid
            var camelProp = this.css_prop_to_camel_case(key);
            
            if (!this.is_undefined(document.body.style[camelProp]))
            {
                var isObjSet = this.is_object(val);
                var toMerge  = isObjSet ? val : opts;
                var options  = { ...ANIMATION_DEFAULT_OPTIONS, ...toMerge};
                
                // animation_factory('foo', { height: '100px', opacity: 0 } );
                if (!isObjSet)
                {
                    options.to = val;
                }

                // animation_factory('foo', { height: { from: '100px', to: '500px', easing: 'easeInOutElastic'}, opacity:{ to: 0, easing: 'linear'} } );
                options.FROM_FACTORY = true;
                options.property     = this.css_prop_to_hyphen_case(key);
                options.el           = DOMElement;
                optionSets.push(options);
            }
        }
    }, this);

    // Santize callbacks
    let longest  = 0;
    let longestI = 0;
    let start    = () => {};
    let fail     = () => {};
    let complete = () => {};
    let step     = () => {};

    this.each(optionSets, function(i, options)
    {
        if (options.start)
        {
            start = options.start;

            delete options.start;
        }

        if (options.fail)
        {
            fail = options.fail;

            delete options.fail;
        }

        if (options.step)
        {
            step = options.step;

            delete options.step;
        }

        // Store the maximum duration
        if (options.duration >= longest)
        {
            if ((options.callback || options.complete)) complete = (options.callback || options.complete);

            delete options.callback;

            delete options.complete;

            longest = options.duration;

            longestI = i;
        }

        // Not nessaray, but sanitize out redundant options
        options = this.map(options, function(key, val)
        {
            return this.in_array(key, ANIMATION_FILTER_OPTIONS) ? val : false;

        }, this);

        // Sanitize to/from to strings
        if (this.array_has('to', options)) options.to = options.to + '';
        if (this.array_has('from', options)) options.from = options.from + '';

        if (!ANIMATION_EASING_FUNCTIONS[options.easing]) options.easing = 'ease';

        options.FROM_FACTORY = true;

        optionSets[i] = options;

    }, this);

    if (this.is_empty(optionSets))
    {
        console.error('Animation Error: Either no CSS property(s) was provided or the provided property(s) is unsupported.');
    }

    optionSets[longestI].fail     = fail;
    optionSets[longestI].start    = start;
    optionSets[longestI].complete = complete;
    optionSets[longestI].step     = step;

    return optionSets;
}
/**
 * Recursively delete from array/object.
 *
 * @param   {array}        keys    Keys in search order
 * @param   {object|array} object  Object to get from
 * @returns {mixed}
 */
_.prototype.__array_delete_recursive = function(keys, object)
{
    var key = keys.shift();

    var islast = keys.length === 0;

    if (islast)
    {
        if (TO_STR.call(object) === '[object Array]')
        {
            object.splice(key, 1);
        }
        else
        {
            delete object[key];
        }
    }

    if (!object[key])
    {
        return false;
    }

    return this.__array_delete_recursive(keys, object[key]);
}

/**
 * Recursively search from array/object.
 *
 * @param   {array}        keys    Keys in search order
 * @param   {object|array} object  Object to get from
 * @returns {mixed}
 */
_.prototype.__array_get_recursive = function(keys, object)
{
    var key = keys.shift();
    var islast = keys.length === 0;

    if (islast)
    {
        return object[key];
    }

    if (!object[key])
    {
        return undefined;
    }

    return this.__array_get_recursive(keys, object[key]);
}

/**
 * Recursively set array/object.
 *
 * @param {array}          keys     Keys in search order
 * @param {mixed}          value    Value to set
 * @param {object|array}   object   Object to get from
 * @param {string|number}  nextKey  Next key to set
 */
_.prototype.__array_set_recursive = function(keys, value, object, nextKey)
{
    var key = keys.shift();
    var islast = keys.length === 0;
    var lastObj = object;
    object = !nextKey ? object : object[nextKey];

    // Trying to set a value on nested array that doesn't exist
    if (!['object', 'function'].includes(typeof object))
    {
        throw new Error('Invalid dot notation. Cannot set key "' + key + '" on "' + JSON.stringify(lastObj) + '[' + nextKey + ']"');
    }

    if (!object[key])
    {
        // Trying to put object key into an array
        if (TO_STR.call(object) === '[object Array]' && typeof key === 'string')
        {
            var converted = Object.assign({}, object);

            lastObj[nextKey] = converted;

            object = converted;
        }

        if (keys[0] && typeof keys[0] === 'string')
        {
            object[key] = {};
        }
        else
        {
            object[key] = [];
        }
    }

    if (islast)
    {
        object[key] = value;

        return;
    }

    this.__array_set_recursive(keys, value, object, key);
}

/**
 * Segments an array/object path using from "dot.notation" into an array of keys in order.
 *
 * @param   {string}  path Path to parse
 * @returns {array}
 */
_.prototype.__array_key_segment = function(path)
{
    var result = [];
    var segments = path.split('.');

    for (var i = 0; i < segments.length; i++)
    {
        var segment = segments[i];

        if (!segment.includes('['))
        {
            result.push(segment);

            continue;
        }

        var subSegments = segment.split('[');

        for (var j = 0; j < subSegments.length; j++)
        {
            if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(subSegments[j][0]))
            {
                result.push(parseInt(subSegments[j].replace(']')));
            }
            else if (subSegments[j] !== '')
            {
                result.push(subSegments[j])
            }
        }
    }

    return result;
}

/**
 * Recursively delete from array/object.
 *
 * @param   {array}        keys    Keys in search order
 * @param   {object|array} object  Object to get from
 * @returns {mixed}
 */
_.prototype.__array_delete_recursive = function(keys, object)
{
    var key = keys.shift();

    var islast = keys.length === 0;

    if (islast)
    {
        if (TO_STR.call(object) === '[object Array]')
        {
            object.splice(key, 1);
        }
        else
        {
            delete object[key];
        }
    }

    if (!object[key])
    {
        return false;
    }

    return this.__array_delete_recursive(keys, object[key]);
}
/**
 * Deletes from an array/object using dot/bracket notation.
 *
 * @param   {string}        path   Path to delete
 * @param   {object|array}  object Object to delete from
 * @returns {object|array}
 */
_.prototype.array_delete = function(path, object)
{
    this.__array_delete_recursive(this.__array_key_segment(path), object);

    return object;
}
/**
 * Filters empty array entries and returns new array
 *
 * @param   {object|array}  object Object to delete from
 * @returns {object|array}
 */
_.prototype.array_filter = function(arr)
{
    return this.map(arr, (k,v) => this.is_empty(v) ? false : v );
}
/**
 * Gets an from an array/object using dot/bracket notation.
 *
 * @param   {string}        path    Path to get
 * @param   {object|array}  object  Object to get from
 * @returns {mixed}
 */
_.prototype.array_get = function(path, object)
{
    return this.__array_get_recursive(this.__array_key_segment(path), object);
}


/**
 * Checks if array/object contains path using dot/bracket notation.
 *
 * e.g array_has('foo.bar.baz[0]', obj)
 * 
 * @param   {string}        path   Path to check
 * @param   {object|array}  object Object to check on
 * @returns {boolean}
 */
_.prototype.array_has = function(path, object)
{
    return !this.is_undefined(this.array_get(path, object));
}
/**
 * Set a key using dot/bracket notation on an object or array.
 *
 * @param   {string}       path   Path to set
 * @param   {mixed}        value  Value to set
 * @param   {object|array} object Object to set into
 * @returns {object|array}
 */
_.prototype.array_set = function(path, value, object)
{
    this.__array_set_recursive(this.__array_key_segment(path), value, object);

    return object;
}
/**
 * Removes duplicates and returns new array.
 *
 * @param   {array} arr Array to run
 * @returns {array}
 */
_.prototype.array_unique = function(arr)
{
    return arr.filter((value, index, self) => self.indexOf(value) === index);
}
/**
 * Checks if element is last element in array or object.
 *
 * @access {public}
 * @param  {string} needle    The value to search for
 * @param  {array}  haystack  The target array to index
 * @param  {bool}   strict    Strict comparison (optional) (default false)
 * @return {bool}
 * 
 */
_.prototype.is_array_last = function(needle, haystack, strict)
{
    strict = this.is_undefined(strict) ? false : strict;

    let last = TO_STR.call(haystack) === '[object Array]' ? haystack[haystack.length -1] : haystack[Object.keys(haystack).pop()];
    
    return this.is_equal(needle, last, strict);
}
/**
 * Foreach loop
 * 
 * @access {public}
 * @param  {object}  obj       The target object to loop over
 * @param  {closure} callback  Callback to apply to each iteration
 * @param  {array}   args      Array of params to apply to callback (optional) (default null)
 */
_.prototype.each = function(obj, callback)
{
    if (typeof obj !== 'object' || obj === null) return;

    let isArray = this.is_array(obj);
    let i       = 0;
    let keys    = isArray ? null : Object.keys(obj);
    let len     = isArray ? obj.length : keys.length;
    let args    = TO_ARR.call(arguments).slice(2);
    let ret     = isArray ? [] : {};
    let key;
    let val;
    let clbkVal;

    // Applies the value of "this" to the callback as the array or object provided
    //var thisArg = typeof args !== 'undefined' && TO_STR.call(args) !== '[object Array]' ? args : obj;

    // Applies this arg as first extra arg if provided
    // otherwise falls back to the array or object provided
    // Removes "this" from args to callback
    var thisArg = this.is_empty(args) ? obj : args[0];
    args        = !this.is_empty(args) ? args.slice(1) : null;
    args        = this.is_empty(args) ? null : args;

    if (TO_STR.call(args) === '[object Array]')
    {
        for (; i < len; i++)
        {
            key   = isArray ? i : keys[i];
            val   = isArray ? obj[i] : obj[key];
            clbkVal = callback.apply(thisArg, [...[key, val], ...args]);

            if (clbkVal === false)
            {
                break;
            }
        }

        // A special, fast, case for the most common use of each (no extra args provided)
    }
    else
    {
        for (; i < len; i++)
        {
            key   = isArray ? i : keys[i];
            val   = isArray ? obj[i] : obj[key];
            clbkVal = callback.call(thisArg, key, val);

            if (clbkVal === false)
            {
                break;
            }
        }
    }

    return obj;
}

_.prototype.foreach = function()
{
    return this.each.apply(this, arguments);
}

/**
 * For loop with count
 * 
 * @access {public}
 * @param  {object}  obj       The target object to loop over
 * @param  {closure} callback  Callback to apply to each iteration
 * @param  {array}   args      Array of params to apply to callback (optional) (default null)
 */
_.prototype.for = function(count, callback)
{
    var args = TO_ARR.call(arguments);

    args[0] = Array.from(Array(count).keys());

    return this.each.apply(this, args);
}


/**
 * Checks if an array contains a value
 *
 * @access {public}
 * @param  {string} needle    The value to search for
 * @param  {array}  haystack  The target array to index
 * @param  {bool}   strict    Strict comparison (optional) (default false)
 * @return {bool}
 * 
 */
_.prototype.in_array = function(needle, haystack, strict)
{
    strict = this.is_undefined(strict) ? false : strict;
    
    if (!strict) 
    {
        if (this.is_object(haystack))
        {
            let ret = false;

            this.each(haystack, (k, v) =>
            {
                ret = v === needle;

                if (ret) return false;
            });

            return ret;
        }

        return haystack.includes(needle);
    }

    let ret = false;

    this.each(haystack, function(k, v)
    {
        ret = this.is_equal(needle, v, strict);

        if (ret) return false;

    }, this);

    return ret;
}
/**
 * Map.
 *  
 * return undefined to break loop, true to keep, false to reject
 * 
 * @param   {array|object}  obj
 * @param   {function}      callback
 * @param   {array|mixed}   args      If single arg provided gets apllied as this to callback, otherwise args apllied to callback
 * @returns {array|object}
 */
_.prototype.map = function(obj, callback)
{
    if (typeof obj !== 'object' || obj === null) return;

    let isArray = this.is_array(obj);
    let i       = 0;
    let keys    = isArray ? null : Object.keys(obj);
    let len     = isArray ? obj.length : keys.length;
    let args    = TO_ARR.call(arguments).slice(2);
    let ret     = isArray ? [] : {};
    let key;
    let val;
    let clbkVal;

    // Applies the value of "this" to the callback as the array or object provided
    //var thisArg = typeof args !== 'undefined' && TO_STR.call(args) !== '[object Array]' ? args : obj;

    // Applies this arg as first extra arg if provided
    // otherwise falls back to the array or object provided
    // Removes "this" from args to callback
    var thisArg = this.is_empty(args) ? obj : args[0];
    args        = !this.is_empty(args) ? args.slice(1) : null;
    args        = this.is_empty(args) ? null : args;

    if (TO_STR.call(args) === '[object Array]')
    {
        for (; i < len; i++)
        {
            key   = isArray ? i : keys[i];
            val   = isArray ? obj[i] : obj[key];
            clbkVal = callback.apply(thisArg, [...[key, val], ...args]);

            if (clbkVal === false)
            {
                continue;
            }
            else if (typeof clbkVal === 'undefined')
            {
                break;
            }
            else
            {
                isArray ? ret.push(clbkVal) : ret[key] = clbkVal;
            }
        }

        // A special, fast, case for the most common use of each (no extra args provided)
    }
    else
    {
        for (; i < len; i++)
        {
            key   = isArray ? i : keys[i];
            val   = isArray ? obj[i] : obj[key];
            clbkVal = callback.call(thisArg, key, val);

            if (clbkVal === false)
            {
                continue;
            }
            else if (typeof clbkVal === 'undefined')
            {
                break;
            }
            else
            {
                isArray ? ret.push(clbkVal) : ret[key] = clbkVal;
            }
        }
    }

    return ret;
}
/**
 * Set, get or remove DOM attribute.
 *
 * No third arg returns attribute value, third arg set to null or false removes attribute.
 * 
 * @param {HTMLElement}  DOMElement  Dom node
 * @param {string}       name        Property name
 * @apram {mixed}        value       Property value
 */
_.prototype.attr = function(DOMElement, name, value)
{            
    // Get attribute
    // e.g attr(node, style)
    if ((TO_ARR.call(arguments)).length === 2 && this.is_string(name))
    {
        return this.__get_attribute(DOMElement, name);
    }

    // attr(node, {foo : 'bar', baz: 'bar'})
    if (this.is_object(name))
    {
        this.each(name, (prop, value) => this.attr(DOMElement, prop, value));

        return;
    }

    // Set or remove attibute.
    switch (name)
    {
        // innerHTML
        case 'innerHTML':
            DOMElement.innerHTML = !value ? '' : value;
            break;

        // innerText
        case 'innerText':
            DOMElement.innerText = !value ? '' : value;
            break;

        // Children
        case 'children':

            this.each(DOMElement.children, (node) => this.remove_from_dom(node));

            if (this.is_array(value)) this.each(value, (i, node) => DOMElement.appendChild(node));
            
            break;

        // Class
        case 'class':
        case 'className':

            // Cleanup classname
            value = this.is_string(value) ? this.str_replace(value, ['undefined', 'null', 'false', 'true'], '').replace(/\s\s+/g, ' ').trim() : value;

            if (this.is_empty(value))
            {
                DOMElement.removeAttribute('class');
            }
            else
            {
                DOMElement.className = value;
            }

            break;

        // Style
        case 'style':

            // remove all styles completely
            if (this.is_empty(value))
            {
                DOMElement.removeAttribute('style');
            }

            DOMElement.style = '';

            let style = this.is_string(value) ? this.css_to_object(value) : value;

            this.each(style, (prop, value) => this.css(DOMElement, prop, value));
           
            break;

        // Events / attributes
        default:

            // Events
            if (name[0] === 'o' && name[1] === 'n')
            {
                var evt = name.slice(2).toLowerCase();

                // Remove old listeners
                this.off(DOMElement, evt);

                // Add new listener if one provided
                if (value)
                {
                    this.on(DOMElement, evt, value);
                }
            }
            // All other node attributes
            else
            {
                if (this.is_function(value) || this.is_object(value)) return;

                let isEmpty    = this.is_empty(value);
                let isData     = name.startsWith('data');
                let isAria     = name.startsWith('aria');
                let camelName  = name.includes('-') ? this.to_camel_case(name) : name;
                let hyphenName = name.includes('-') ? name : this.camel_case_to_hyphen(name);
                let isBoolean  = this.in_array(camelName, BOOLEAN_ATTRS);

                if (value === 'false' || value === 'null' || value === 'undefined' || isEmpty) value = isBoolean ? false : (isAria || isData ? 'false' : '');

                // Special data
                if (isData)
                {
                    DOMElement.setAttribute(hyphenName, value);

                    DOMElement.dataset[this.lc_first(camelName.substring(4))] = value;

                    break;
                }
                else if (isEmpty && !isAria && !PROP_ATTRIBUTES.includes(camelName))
                {
                    DOMElement.removeAttribute(hyphenName);
                }
                else
                {
                    DOMElement.setAttribute(hyphenName, value);
                }

                if (camelName !== 'viewBox')
                {
                    try
                    {                        
                        DOMElement[camelName] = value;

                    } catch (e) {}
                }

                
            }

            break;
    }
}

/**
 * Simple get html attribute.
 *
 * No third arg returns attribute value, third arg set to null or false removes attribute.
 * 
 * @access {private}
 * @param  {HTMLElement}      DOMElement  Dom node
 * @param  {string}           name        Property name
 * @return {string|undefined}
 */
_.prototype.__get_attribute = function(DOMElement, name)
{
    let camelName  = name.includes('-') ? this.to_camel_case(name) : name;
    let hyphenName = name.includes('-') ? name : this.camel_case_to_hyphen(name);

    // Data need to check dataset
    if (name.startsWith('data'))
    {
        if (!DOMElement.dataset) return DOMElement.getAttribute(hyphenName);

        return DOMElement.dataset[this.lc_first(camelName.substring(4))];
    }

    // Special booleans
    if (this.in_array(name, BOOLEAN_ATTRS))
    {
        if (DOMElement[name] === '' || DOMElement[name] === 'true' || DOMElement[name] === true) return true;

        return DOMElement[name] === 'false' || !DOMElement[name] ? false : true;
    }

    let retCamel = DOMElement[camelName];
    let retAttr  = DOMElement.getAttribute(hyphenName);

    if (retAttr && retAttr !== '') return retAttr;

    if (retCamel && retCamel !== '') return retCamel;

    return retCamel || retAttr;
}
/**
 * Set, get or remove DOM attribute.
 *
 * No third arg returns attribute value, third arg set to null or false removes attribute.
 * 
 * @param {HTMLElement}  DOMElement  Dom node
 * @param {string}       name        Property name
 * @apram {mixed}        value       Property value
 */
_.prototype.attrs = function(DOMElement)
{
	let ret = {};

	this.each(DOMElement.attributes, (i, attribute) => ret[attribute.nodeName] = this.attr(DOMElement, attribute.nodeName));
	
	return ret;
}
/**
 * Set, get or remove CSS value(s) on element.
 * 
 * Note that this will only return inline styles, use 'rendered_style' for
 * currently displayed styles.
 *
 * @access {public}
 * @param  {DOMElement}   el     Target DOM node
 * @param  {string|object} Assoc array of property->value or string property
 * @example {Helper.css(node,} { display : 'none' });
 * @example {Helper.css(node,} 'display', 'none');
 */
_.prototype.css = function(el, property, value)
{
    // If their is no value and property is an object
    if (this.is_object(property))
    {
        this.each(property, function(prop, val)
        {
            this.css(el, prop, val);

        }, this);
    }
    else
    {
        // Getting not settings
        if (this.is_undefined(value))
        {
            return this.inline_style(el, property);
        }
        // Value is either null or false we remove
        else if (this.is_null(value) || value === false)
        {
            if (el.style.removeProperty)
            {
                el.style.removeProperty(property);
            }
            else
            {
                el.style.removeAttribute(property);
            }
        }
        else
        {
            if (value.includes('important') || property.startsWith('--'))
            {
                let styles = el.getAttribute('style');

                if (styles && styles.includes(property))
                {
                    let re = new RegExp(`${property}\s?:[^;]+;?`, 'g');

                    styles = styles.replace(re, '').trim();
                }
                
                styles = !styles ? `${property}:${value}` : `${this.rtrim(styles, ';')};${property}:${value}`;

                el.setAttribute('style', styles);

                return;
            }
            else
            {
                el.style[property] = value;    
            }
        }
    }
}
/**
 * Converts CSS property to camel case.
 *
 * @access {public}
 * @param  {string} prop Property to convert
 * @retirm {string}
 */
_.prototype.css_prop_to_camel_case = function(prop)
{
    if (!prop.includes('-')) return prop;

    let camelProp = this.to_camel_case(prop);

    if (this.in_array(prop, Object.keys(CSS_PROP_TO_CAMEL_CASES)))
    {
        return CSS_PROP_TO_CAMEL_CASES[prop];
    }

    // First char is always lowercase
    let ret = camelProp.charAt(0).toLowerCase() + camelProp.slice(1);

    CSS_PROP_TO_CAMEL_CASES[prop] = ret;

    return ret;
}
/**
 * Converts CSS property to hyphen case.
 *
 * @access {public}
 * @param  {string} prop Property to convert
 * @retirm {string}
 */
_.prototype.css_prop_to_hyphen_case = function(prop)
{
    if (!/[A-Z]/.test(prop)) return prop;
    
    if (this.in_array(prop, Object.keys(CSS_PROP_TO_HYPHEN_CASES)))
    {
        return CSS_PROP_TO_HYPHEN_CASES[prop];
    }

    var hyphenProp = this.camel_case_to_hyphen(prop);

    if (hyphenProp.startsWith('webkit-') || hyphenProp.startsWith('moz-') || hyphenProp.startsWith('ms-') || hyphenProp.startsWith('o-'))
    {
        hyphenProp = '-' + hyphenProp;
    }

    CSS_PROP_TO_CAMEL_CASES[prop] = hyphenProp;

    return hyphenProp;
}
/**
 * Expand shorthand property to longhand properties 
 *
 * @access {private}
 * @param  {string}  CSS rules
 * @return {object}
 */
_.prototype.css_to_longhand = function(css)
{
    var ret    = {};
    var values = this.css_to_object(css);

    this.each(values, function(prop, value)
    {
        if (SHORTHAND_PROPS.hasOwnProperty(prop))
        {
            var splits  = value.split(' ').map( (x) => x.trim());
            var dfault  = prop === 'margin' || prop === 'padding' ? '0' : 'initial';

            this.each(SHORTHAND_PROPS[prop], function(i, longhand)
            {
                // Object is setup so that if it starts with a '-'
                // then it gets concatenated to the oridional prop
                // e.g 'background' -> '-image'
                longhand = longhand.startsWith('-') ? prop + longhand : longhand;

                // otherwise it gets replaced
                // e.g 'border-color' -> 'border-top-color', 'border-right-color'... etc
                ret[longhand] = this.is_undefined(splits[i]) ? dfault : splits[i];

            }, this);
        }
        else
        {
            ret[prop] = value;
        }

    }, this);

    return ret;
}
/**
 * Concats longhand property to shorthand
 *
 * Note if values are not provide not all browsers will except initial
 * for all properties in shorthand syntax
 * 
 * @access {private}
 * @param  {string}  CSS rules
 * @return {object}
 */
_.prototype.css_to_shorthand = function(css)
{
    const needsFilling = ['margin', 'padding', 'transition', 'animation'];
    var ret            = {};
    var styles         = this.css_to_object(css);

    // 'margin': ['-top', '-right', '-bottom', '-left'],
    this.each(SHORTHAND_PROPS, function(property, longhands)
    {
        var value       = '';
        var matched     = false;
        var needsDefault = this.in_array(property, needsFilling) || property.includes('border');

        this.each(longhands, function(i, longhand)
        {
            longhand = longhand.startsWith('-') ? property + longhand : longhand;

            var suppliedVal = styles[longhand];

            if (!this.is_undefined(suppliedVal))
            {
                matched = true;
                // Colors get flatted
                if (longhand.includes('-color'))
                {
                    value = suppliedVal;
                }
                else
                {
                    value += suppliedVal + ' ';
                }
            }
            else if (needsDefault)
            {
                this.each(SHORTHAND_DEFAULTS, function(matcher, defaltVal)
                {
                    if (longhand.includes(matcher))
                    {
                        value += ` ${defaltVal} `;
                    }
                });
            }
            
        }, this);

        if (!this.is_empty(value) && matched) ret[property] = value.trim();
        
    }, this);

    return ret;
}
/**
 * Converts string styles into an object
 *
 * @param  {string} styles CSS
 * @return {object}
 */
_.prototype.css_to_object = function(styles)
{
    var ret = {};

    const nested_regex = /([^\{]+\{)([\s\S]+?\})(\s*\})/g;

    const css_regex = /([^{]+\s*\{\s*)([^}]+)(\s*\}\s*)/g;

    if (styles.includes('{'))
    {
        var nestedStyles = [...css.matchAll(nested_regex)];
    }

    this.each(styles.split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/g), function(i, rule)
    {
        var style = rule.split(':');

        if (style.length >= 2)
        {
            var prop = style.shift().trim();
            var val  = style.join(':').trim();

            ret[prop] = val;
        }
    }, this);

    return ret;
}
/**
 * Get CSS property.
 * 
 * @param  {string} value CSS value (e.g "12px")
 * @return {Number}
 */
_.prototype.css_unit_value = function(value)
{
    value = value + '';

    if (this.is_numeric(value))
    {
        return parseFloat(value);
    }

    if (this.is_empty(value))
    {
        return 0;
    }

    return parseFloat(value.replaceAll(/[^0-9-.]/g, ''));
}

/**
 * Get CSS property unit.
 * 
 * @param  {string} value CSS value (e.g "12px")
 * @return {string}
 */
_.prototype.css_value_unit = function(value)
{
    value = value + '';

    return value.split(/[0-9]/).pop().replaceAll(/[^a-z%]/g, '').trim();
}

/**
 * Converts CSS units to px.
 * 
 * @param  {String}     value      CSS value (e.g "12rem")
 * @param  {DomElement} DOMElement CSS value (optional) (used to relative units)
 * @param  {String}     property   CSS property (optional) (used for % unit)
 * @return {Number}
 */
_.prototype.css_to_px = function(valueStr, DOMElement, property)
{
    valueStr = valueStr + '';
    
    if (valueStr.includes('calc')) return valueStr;

    var unit  = this.css_value_unit(valueStr);
    var value = this.css_unit_value(valueStr);

    if (valueStr.includes('px')) return value;

    if (!this.is_undefined(CSS_ABSOLUTE_UNITS[unit]))
    {
        return (value * CSS_ABSOLUTE_UNITS[unit]);
    }

    if (!this.is_undefined(CSS_RELATIVE_UNITS[unit]))
    {
        if (unit === 'em' || unit === 'ex' || 'unit' === 'ch')
        {
            if (!DOMElement) return value * CSS_RELATIVE_UNITS[unit];
            let psize = this.css_unit_value(this.rendered_style(DOMElement.parentNode, 'font-size'));
            if (unit === 'em') return value * psize;
            if (unit === 'ex') return value * (psize / 1.8);
            if (unit === 'ch') return value * (psize / 2);
            if (unit === '%')  return value * psize;
        }
        else if (unit === '%')
        {
            if (!DOMElement) return value * CSS_RELATIVE_UNITS[unit];
            if (!property) property = 'height';
            
            let psize = this.css_unit_value(this.rendered_style(DOMElement, property));

            return psize * (value / 100);
        }
        else if (unit === 'rem')
        {
            // font sizes are always returned in px with JS
            return value * this.css_unit_value(this.rendered_style(document.documentElement, 'font-size'));
        }
        else if (unit === 'vw')
        {
            return this.width(window) * (value / 100);
        }
        else if (unit === 'vh')
        {
            return this.height(window) * (value / 100);
        }
        else if (unit === 'vmin' || unit === 'vmax')
        {
            let w = this.width(window);
            let h = this.height(window);
            let m = unit === 'vmin' ? Math.min(w, h) : Math.max(w, h)

            return m * (value / 100);
        }
    }

    return value;
}

/**
 * Get an element's inline style if it exists
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @param  {string} prop CSS property to check
 * @return {string}
 */
_.prototype.inline_style = function(element, prop)
{
    const elementStyle = element.style;

    prop = this.css_prop_to_hyphen_case(prop);

    // Native
    if (!this.is_undefined(elementStyle[prop]) && elementStyle[prop] !== '')
    {
        const val = elementStyle.getPropertyValue(elementStyle[prop]) || elementStyle[prop];
        
        return val === '' ? undefined : val;
    }

    let styles = element.getAttribute('style');

    if (styles && styles.includes(prop))
    {
        let style = styles.match(new RegExp(`${prop}\s?:[^;]+;?`));

        if (style)
        {
            return this.rtrim(style[0].split(':').pop().trim(), ';').trim();
        }
    }
}
/**
 * Remove inline css style
 * 
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @param  {string} prop CSS property to removes
 */
_.prototype.remove_style = function(el, prop)
{
    if (typeof prop === 'undefined')
    {
        DOMElement.removeAttribute('style');

        return;
    }

    this.css(el, prop);
}
/**
 * Get the element's computed style on a property
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @param  {string} prop CSS property to check (in camelCase) (optional)
 * @return {mixed}
 */
_.prototype.rendered_style = function(DOMElement, property)
{
    if (property.includes('ransform'))
    {
        return this.css_transform_props(DOMElement, true);
    }

    return this.__computed_style(DOMElement, property);
}

/**
 * Get the elements computed style.
 *
 * @access {private}
 * @param  {DOMElement}          el   Target element
 * @param  {string}        prop CSS property to check (in camelCase) (optional)
 * @return {string|object}
 */
_.prototype.__computed_style = function(DOMElement, property)
{
    if (window.getComputedStyle)
    {
        let styles = window.getComputedStyle(DOMElement, null);

        if (property && property.startsWith('--')) return styles.getPropertyValue(property);

        return !property ? styles : styles[property];
    }
    else if (DOMElement.currentStyle)
    {
        let styles = DOMElement.currentStyle;

        return !property ? styles : styles[property];
    }

    return '';
}

















/**
 * Returns an object of CSS transitions by transition property as keys.
 *
 * @param  {node|string} DOMElement  Target element or transition value string
 * @return {object}
 */
_.prototype.css_transition_props = function(DOMElement)
{
    if (!DOMElement) return {};
    var transitions   = {};
    var transitionVal = this.is_string(DOMElement) ? DOMElement : this.rendered_style(DOMElement, 'transition');

    // No transition
    if (!transitionVal || transitionVal.startsWith('all 0s ease 0s') || transitionVal === 'none' || transitionVal === 'unset' || transitionVal === 'auto')
    {
        return transitions;
    }

    let transitionSplit = transitionVal.includes('cubic-bezier') ? '' : transitionVal.trim().split(',');

    if (transitionVal.includes('cubic-bezier'))
    {
        let map      = [];
        let inBezier = false;
        let block    = '';
        let char;

        this.for(transitionVal.length, function(i)
        {
            char = transitionVal[i];

            if (char === '(') inBezier = true;
            if (char === ')') inBezier = false;

            if (char === ',' && !inBezier)
            {
                map.push(block.trim());
                block = '';

                // next
                return;
            }

            block += char;

            if (i === transitionVal.length -1) map.push(block.trim());
        });

        transitionSplit = map;
    }

    this.each(transitionSplit, function(i, transition)
    {
        transition = transition.trim();

        // Variants of all
        if (transition[0] === '.' || transition.startsWith('all ') ||  this.is_numeric(transition[0]))
        {
            transitions.all = transition.replace('all ', '');

            return false;
        }

        var prop = transition.split(' ', 4).shift();

        transitions[prop] = transition.replace(prop, '').trim();

    }, this);

    return transitions;
}
/**
 * Returns an object of CSS transforms by property as keys or transforms as string.
 *
 * @param  {node|string} DOMElement     Target element or transition value string
 * @param  {bool}        returnAsString Returns transforms as string (optional) (default true)
 * @return {object}
 */
_.prototype.css_transform_props = function(DOMElement, returnAsString)
{
    if (this.is_string(DOMElement))
    {
        return this.__un_css_matrix(DOMElement, returnAsString);
    }

    returnAsString = this.is_undefined(returnAsString) ? true : returnAsString;

    let styles = this.__computed_style(DOMElement, 'transform');

    // If element is set to "display:none" only inline transforms will show up
    // so we check those first
    let inline   = this.inline_style(DOMElement, 'transform');
    let emptys   = [undefined, '', 'none', 'unset', 'initial', 'inherit'];

    // Has inline styles - inline do not need to converted
    if (!emptys.includes(inline))
    {
        return returnAsString ? inline : this.__un_css_matrix(inline, false);
    }

    // If element is hiddien we need to display it quickly
    // to get the CSS defined transform prop to be renderd
    let inlineDisplay = this.inline_style(DOMElement, 'display');
    let cssDisplay    = this.rendered_style(DOMElement, 'display');
    let isHidden      = cssDisplay === 'none';

    // Re-get transform value
    if (isHidden)
    {
        this.css(DOMElement, 'display', 'unset');

        styles = this.__computed_style(DOMElement, 'transform');
    }

    // Doesn't have stylesheet styles
    if (this.in_array(styles, emptys))
    {
        styles = styles === 'none' || styles === undefined ? '' : styles;
    }

    // Empty return
    if (!styles)
    {
        return returnAsString ? '' : {};
    }

    // revert matrix
    styles = this.__un_css_matrix(DOMElement, returnAsString);
    
    // Revert back origional styles
    if (isHidden)
    {
        this.css(DOMElement, 'display', !inlineDisplay ? false : inlineDisplay);
    }

    return returnAsString ? styles : styles;
}

/**
 * Converts an element's matrix transform value back to component transforms
 *
 * @access {private}
 * @param  {DOMElement}   DOMElement     Target element
 * @param  {bool}   returnAsString Returns string
 * @return {string|object}
 */
_.prototype.__un_css_matrix = function(DOMElement, returnAsString)
{
    if (!this.is_string(DOMElement))
    {
        if (!DOMElement.computedStyleMap)
        {
            return returnAsString ? '' : {};
        }

        var computedTransforms = DOMElement.computedStyleMap().get('transform');

        var transforms = Array.prototype.slice.call(computedTransforms).map( (x) => x.toString() ).sort().reverse();
    }
    else
    {
        var transforms = DOMElement.split(')');
    }

    const axisMap = ['X', 'Y', 'Z'];

    const ret = {};

    this.each(transforms, function(i, transform)
    {
        if (transform.trim() === '') return;

        var split    = transform.split('(');
        var bsName   = split[0].replace('3d', '');
        var prop     = split.shift().trim();
        var value    = split.pop().trim().replace(')', '');
        var values   = value.split(',').map((x) => x.trim());
        var lastChar = prop.slice(-1);

        if (prop === 'perspective')
        {
            ret.perspective = value;

            return;
        }
        
        this.each(values, function(i, val)
        {
            if (i > 2) return false;

            let defltVal = prop.includes('scale') ? 1 : 0;
            let axisProp = !axisMap.includes(lastChar) ? `${bsName}${axisMap[i]}` : bsName;

            if (prop === 'rotate')
            {
                ret.rotateZ = val;
            }
            else if (prop === 'rotate3d')
            {
                if (parseFloat(val) !== defltVal)
                {
                    ret[axisProp] = values[values.length - 1];
                }
            }
            else if (parseFloat(val) === defltVal && ret[axisProp])
            {
                return;
            }
            else
            {
                ret[axisProp] = val;
            }
        });

    }, this);

    if (returnAsString)
    {
        return !this.is_empty(ret) ? this.join_obj(ret, '(', ') ') + ')' : '';
    }
    
    return ret;
}
/**
 * Returns an object of CSS transitions by transition property as keys.
 *
 * @param  {string} transforms A CSS transform value e.g translateY(300px) 
 * @return {object}
 */
_.prototype.css_to_3d_transform = function(transformsStr)
{        
    var transforms = {};

    var _this = this;

    /**
     * Get value number
     * 
     * @private
     */
    var getPropValue = function(value)
    {
        if (_this.is_numeric(value))
        {
            return parseFloat(value);
        }

        if (_this.is_empty(value))
        {
            return 0;
        }

        return parseFloat(value.replaceAll(/[^0-9-.]/g, ''));
    }

    if (transformsStr.includes('matrix'))
    {
        return transformsStr;
    }

    // Split into object
    this.each(transformsStr.trim().split(')'), function(i, transform)
    {
        transform = transform.trim();

        if (transform === '') return;

        transform      = transform.split('(');
        var prop       = transform.shift().trim();
        var value      = transform.pop().trim();
        var values     = value.split(',').map((x) => x.trim());
        var valueCount = CSS_TRANSFORM_VALUES_COUNT[prop];

        if (prop === 'perspective')
        {
            transforms.perspective = values[0];
        }
        else if (valueCount === 1 || valueCount === 2)
        {
            var initialVal = prop === 'scale' ? 1 : 0;
            var name3d     = valueCount === 1 ? `${prop.slice(0,-1)}3d` : `${prop}3d`;
                name3d     = name3d.includes('skew') ? 'skew' : name3d;
                name3d     = name3d === 'rotat3d' ? 'rotate3d' : name3d;
            var key        = CSS_3D_TRANSFORM_MAP_KEYS[prop.slice(-1).toLowerCase()];
            
            if (this.is_empty(transforms[name3d]))
            {
                transforms[name3d] = CSS_3D_TRANSFORM_DEFAULTS[name3d];
            }
            
            if (prop === 'rotate')
            {
                transforms.rotate3d[3] = values[0];
            }
            else
            {
                this.each(values, function(i, value)
                {
                    var compValue = parseFloat(value.replaceAll(/[^0-9]-/g, ''));

                    if (getPropValue(value) !== initialVal)
                    {
                        transforms[name3d][!key ? i : key] = value;
                    }
                });
            }
        }
        else 
        {
            transforms[prop] = values;
        }

    }, this);

    return transforms;
}
/**
 * Add a css class or list of classes
 *
 * @access {public}
 * @param  {DOMElement}         DOMElement Target element
 * @param  {array|string} className  Class name(s) to add
 */
_.prototype.add_class = function(DOMElement, className)
{    
    if (this.is_array(DOMElement))
    {
        this.each(DOMElement, (i, _DOMElement) =>  this.add_class(_DOMElement, className));

        return this;
    }

    if (this.is_array(className))
    {
        this.each(className, (i, _className) =>  this.add_class(DOMElement, _className));
    
        return this;
    }

    if (className.includes(','))
    {
        this.each(this.array_filter(className.split(',')), (i, _className) => this.add_class(DOMElement, _className));
    
        return this;
    }

    if (className.includes('.'))
    {
        this.each(this.array_filter(className.split('.')), (i, _className) => this.add_class(DOMElement, _className));
    
        return this;
    }

    className = className.trim();

    if (className[0] === '.') className = className.slice(1);

    DOMElement.classList.add(className);

    return this;
}
/**
 * Returns element classNames
 *
 * @param   {HTMLElement}  element  Element to check
 * @return  {Array}
 */
_.prototype.class_names = function(element)
{
    if (this.is_htmlElement(element) && element.className && element.className.trim() !== '')
    {
        return element.className.replace( /\s\s+/g, ' ').trim().split(' ');
    }

    return [];
}
/**
 * Closest parent node by type/class or array of either
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @param  {string} type Node type to find
 * @return {node\null}
 */
_.prototype.closest = function(el, type)
{    
    // Match OR split by comma
    if (this.is_string(type) && type.includes(',')) type = type.split(',').filter((x) => x.trim() !== '').map((x) => x.trim());

    // Match OR as an array
    if (this.is_array(type))
    {        
        let ret = false;

        this.each(type, (i , itype) =>
        {
            ret = this.closest(el, itype);

            if (ret) return false;
        });

        return ret;
    }
    
    let isElement = this.is_htmlElement(type);
    let isClass   = !isElement && type.includes('.');
    let isType    = !isElement && !isClass;
    let ret       = false;

    this.traverse_up(el, (parent, pType) =>
    {
        if (isElement && parent === type)
        {
            ret = parent;

            return false;
        }
        else if (isClass && this.has_class(parent, type))
        {
            ret = parent;

            return false;
        }
        else if (isType && type === pType)
        {
            ret = parent;

            return false;
        }
    });

    return ret;
}

/**
 * Closest parent node by class
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @param  {string} clas Node class to find
 * @return {node\null}
 */
_.prototype.closest_class = function(el, classNames)
{    
    let ret = false;

    this.traverse_up(el, (parent) =>
    {
        ret = this.has_class(parent, classNames) ? parent : ret;
        
        if (ret) return false;
    });

    return ret;
}
/**
 * Get an element's absolute coordinates
 *
 * @access {public}
 * @param  {DOMElement}   el Target element
 * @return {object}
 */
_.prototype.coordinates = function(DOMElement)
{
    // If element is hiddien we need to display it quickly
    var inlineDisplay = this.inline_style(DOMElement, 'display');
    var hidden        = this.rendered_style(DOMElement, 'display');
    
    if (hidden === 'none')
    {
        // If the element was 'display:none' with an inline
        // style, remove the inline display so it defaults to
        // whatever styles are set on in through stylesheet
        if (inlineDisplay)
        {
            this.css(DOMElement, 'display', false);
        }
        // Otherwise set it to unset
        else
        {
            this.css(DOMElement, 'display', 'unset');
        }
    }

    var box        = DOMElement.getBoundingClientRect();
    var body       = document.body;
    var docEl      = document.documentElement;
    var scrollTop  = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
    var clientTop  = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;
    var borderL    = parseInt(this.rendered_style(DOMElement, 'border-left-width')) || 0;
    var borderR    = parseInt(this.rendered_style(DOMElement, 'border-right-width')) || 0;
    var borderT    = parseInt(this.rendered_style(DOMElement, 'border-top-width')) || 0;
    var borderB    = parseInt(this.rendered_style(DOMElement, 'border-bottom-width')) || 0;
    var top        = box.top + scrollTop - clientTop - borderT - borderB;
    var left       = box.left + scrollLeft - clientLeft + borderL - borderR;
    var width      = parseFloat(this.rendered_style(DOMElement, 'width'))
    var height     = parseFloat(this.rendered_style(DOMElement, 'height'));

    if (inlineDisplay)
    {
        this.css(DOMElement, 'display', inlineDisplay);
    }
    else
    {
        this.css(DOMElement, 'display', false);
    }
    
    return {
        top: top,
        left: left,
        right: left + width,
        bottom: top + height,
        height: height,
        width: width,
    };
}
/**
 * Get all first level children
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @return {node\null}
 */
_.prototype.first_children = function(el)
{
    return this.find_all('> *', el);
}
/**
 * Get all input elements from a form
 *
 * @access {public}
 * @param  {DOMElement}   form Target element
 * @return {array}
 */
_.prototype.form_inputs = function(form)
{
    return this.find_all('input, textarea, select', form);
}
/**
 * Get an array of name/value objects for all inputs in a form
 *
 * @access {public}
 * @param  {DOMElement}   form Target element
 * @return {array}
 */
_.prototype.form_values = function(form)
{
    var inputs = this.form_inputs(form);
    var ret    = {};
    
    this.each(inputs, (i, input) =>
    {
        let key = this.attr(input, 'name');

        let val = this.input_value(input);

        if (key.endsWith('[]'))
        {
            key = key.slice(0, -2); 

            if (!ret[key] || !this.is_array(ret[key])) ret[key] = [];

            ret[key].push(val);
        }
        else if (input.type !== 'radio')
        {
            ret[key] = val;
        }
        else
        {
            if (val) ret[key] = val;
        }
    });
   
    return ret;
}
/**
 * Check if a node has a class
 *
 * @access {public}
 * @param  {DOMElement}         el         Target element
 * @param  {string|array} className  Class name(s) to check for
 * @return {bool}
 */
_.prototype.has_class = function(DOMElement, className)
{    
    let ret = false;

    if (this.is_array(className))
    {
        this.each(className, (i, _className) => { if (this.has_class(DOMElement, _className)) ret = true; return false; });
        
        return ret;
    }

    if (className.includes(','))
    {
        this.each(this.array_filter(className.split(',')), (i, _className) => { if (this.has_class(DOMElement, _className)) ret = true; return false; });
    
        return ret;
    }

    if (className.includes('.'))
    {
        let count = className.split('.').length;

        if (count >= 3)
        {
            this.each(this.array_filter(className.split('.')), (i, _className) => { ret = this.has_class(DOMElement, _className); if (!ret) return false; });

            return ret;
        }
    }

    className = className.trim();

    if (className[0] === '.') className = className.slice(1);

    if (!DOMElement || !DOMElement.classList) return false;

    return DOMElement.classList.contains(className);
}
/**
 * Check if an element is in current viewport
 *
 * @access {public}
 * @param  {DOMElement}   el Target DOM node
 * @return {bool}
 */
_.prototype.in_viewport = function(el)
{
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or find(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or find(window).width() */
    );
}
/**
 * Replace or append a node's innerHTML
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement  Target element
 * @param  {string} content     Target content
 * @param  {bool}   append      Append innerHTML or replace (optional) (default false)
 */
_.prototype.inner_HTML = function(DOMElement, content, append)
{
    append = this.is_undefined(append) ? false : append;

    if (!append)
    {
        this.clear_event_listeners(DOMElement, true);

        DOMElement.innerHTML = '';
    }

    this._recursive_dom_element(content, DOMElement);

    this.trigger_event(DOMElement, `frontbx:dom:mutate`);

    this.trigger_event(window, `frontbx:dom:mutate`, { DOMElement: DOMElement });
}
/**
 * Gets an input element's value
 *
 * @access {public}
 * @param  {DOMElement}   input Target element
 * @return {mixed}
 */
_.prototype.input_value = function(input)
{
    if (input.type == 'checkbox')
    {
        return this.attr(input, 'checked');
    }
    if (input.type == 'radio')
    {
        return this.attr(input, 'checked') ? this.attr(input, 'value') : undefined;
    }
    if (input.type == 'number' || input.type === 'range')
    {
        return input.value.includes('.') ? parseInt(input.value) : parseFloat(input.value);
    }
    if (input.type == 'file')
    {
        if (input.multiple == true)
        {
            return input.files;
        }

        return input.files[0];
    }

    let ret = input.type == 'select' ? input.options[input.selectedIndex].value : input.value;

    return ret.trim();
}
/**
 * Create and insert a new node
 *
 * @param {object} options
 */
_.prototype.dom_element = function(options, appendTo, innerHTMLOrChildren)
{    
    // dom_element(null, wrappper, content);
    if (!options && appendTo && innerHTMLOrChildren)
    {
        this._recursive_dom_element(innerHTMLOrChildren, appendTo);

        return appendTo;
    }

    if (!options.tag) throw new Error('Element tag not provided.');

    let node = document.createElement(options.tag);

    delete options.tag;

    this.attr(node, options);

    if (innerHTMLOrChildren)
    {
        this._recursive_dom_element(innerHTMLOrChildren, node);
    }

    if (appendTo)
    {
        appendTo.appendChild(node);
    }

    return node;
}

_.prototype._recursive_dom_element = function(mixedVar, parent)
{
    if (this.is_htmlElement(mixedVar))
    {
        parent.appendChild(mixedVar);
    }
    else if (this.is_array(mixedVar))
    {
        this.each(this.array_filter(mixedVar), (i, child) =>
        {
            this._recursive_dom_element(child, parent);
        }); 
    }
    else if (this.is_object(mixedVar))
    {
        this.dom_element(mixedVar, node);
    }
    else
    {
        parent.innerHTML += mixedVar;
    }
}


/**
 * Traverse nextSibling untill type or class or array of either
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @param  {string} type Target node type
 * @return {node\null}
 */
_.prototype.next = function(el, type)
{
    // Match OR split by comma
    if (this.is_string(type) && type.includes(',')) type = type.split(',').filter((x) => x.trim() !== '').map((x) => x.trim());

    // Match OR as an array
    if (this.is_array(type))
    {        
        let ret = false;

        this.each(type, (i , itype) =>
        {
            ret = this.next(el, itype);

            if (ret) return false;
        });

        return ret;
    }
    
    let isElement = this.is_htmlElement(type);
    let isClass   = !isElement && type.includes('.');
    let isType    = !isElement && !isClass;
    let ret       = false;

    this.traverse_next(el, (sibling, sType) =>
    {
        if (isElement && sibling === type)
        {
            ret = sibling;

            return false;
        }
        else if (isClass && this.has_class(sibling, type))
        {
            ret = sibling;

            return false;
        }
        else if (isType && type === sType)
        {
            ret = sibling;

            return false;
        }
    });

    return ret;
}
/**
 * Traverse nextSibling untill class type or class or array of either
 *
 * @access {public}
 * @param  {DOMElement}   el         Target element
 * @param  {string}       classNames Target node classname
 * @return {node\null}
 */
_.prototype.next_class = function(el, classNames)
{
    let ret = false;

    this.traverse_next(el, (sibling) =>
    {
        ret = this.has_class(sibling, classNames) ? sibling : ret;
        
        if (ret) return false;
    });

    return ret;
}
/**
 * Inserts node as first child
 *
 * @access {public}
 * @param  {DOMElement} node     New node to insert
 * @param  {DOMElement} wrapper  Parent to preappend new node into
 * @return {DOMElement}
 */
_.prototype.preapend = function(node, wrapper)
{
    wrapper.insertBefore(node, wrapper.firstChild);

    return node;
}
/**
 * Traverse previousSibling untill type
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @param  {string} type Target node type
 * @return {node\null}
 */
_.prototype.previous = function(el, type)
{
    // Match OR split by comma
    if (this.is_string(type) && type.includes(',')) type = type.split(',').filter((x) => x.trim() !== '').map((x) => x.trim());

    // Match OR as an array
    if (this.is_array(type))
    {        
        let ret = false;

        this.each(type, (i , itype) =>
        {
            ret = this.previous(el, itype);

            if (ret) return false;
        });

        return ret;
    }
    
    let isElement = this.is_htmlElement(type);
    let isClass   = !isElement && type.includes('.');
    let isType    = !isElement && !isClass;
    let ret       = false;

    this.traverse_prev(el, (sibling, pType) =>
    {
        if (isElement && sibling === type)
        {
            ret = sibling;

            return false;
        }
        else if (isClass && this.has_class(sibling, type))
        {
            ret = sibling;

            return false;
        }
        else if (isType && type === pType)
        {
            ret = sibling;

            return false;
        }
    });

    return ret;
}
/**
 * Traverse previousSibling untill class
 *
 * @access {public}
 * @param  {DOMElement}   el        Target element
 * @param  {string} className Target node classname
 * @return {node\null}
 */
_.prototype.previous_class = function(el, classNames)
{
    let ret = false;

    this.traverse_prev(el, (sibling) =>
    {
        ret = this.has_class(sibling, classNames) ? sibling : ret;
        
        if (ret) return false;
    });

    return ret;
}
/**
 * Remove a css class or list of classes
 *
 * @access {public}
 * @param  {DOMElement}         DOMElement Target element
 * @param  {array|string} className  Class name(s) to remove
 */
_.prototype.remove_class = function(DOMElement, className)
{
    if (this.is_array(DOMElement))
    {
        this.each(DOMElement, (i, _DOMElement) =>  this.remove_class(_DOMElement, className));

        return this;
    }

    if (this.is_array(className))
    {
        this.each(className, (i, _className) =>  this.remove_class(DOMElement, _className));
    
        return this;
    }

    if (className.includes(','))
    {
        this.each(this.array_filter(className.split(',')), (i, _className) => this.remove_class(DOMElement, _className));
    
        return this;
    }

    if (className.includes('.'))
    {
        this.each(this.array_filter(className.split('.')), (i, _className) => this.remove_class(DOMElement, _className));
    
        return this;
    }

    className = className.trim();

    if (className[0] === '.') className = className.slice(1);

    DOMElement.classList.remove(className);

    return this;
}
/**
 * Remove an element from the DOM
 *
 * This function also removes all attached event listeners
 * 
 * @access {public}
 * @param  {DOMElement}   el Target element
 */
_.prototype.remove_from_dom = function(el)
{
    if (this.is_array(el))
    {
        return this.each(el, (i, DOMElement) => this.remove_from_dom(DOMElement));
    }

    if (this.in_dom(el))
    {
        el.parentNode.removeChild(el);

        var children = this.find_all('*', el).reverse();

        for (var i = 0, len = children.length; i < len; i++)
        {
            this.off(children[i]);

            this.trigger_event(children[i], `frontbx:dom:remove`);
        }

        this.off(el);

        this.trigger_event(el, `frontbx:dom:remove`);

        this.trigger_event(window, `frontbx:dom:remove`, { DOMElement: el });
    }
}
/**
 * Get the current document scroll position
 *
 * @access {private}
 * @return {obj}
 */
_.prototype.scroll_pos = function(context)
{
    if (context && this.is_htmlElement(context))
    {
        return {
            top: context.scrollTop,
            left: context.scrollLeft
        };
    }

    var doc  = document.documentElement;
    var top  = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    
    return {
        top: top,
        left: left
    };
}
/**
 * Select single node by selector
 *
 * @access {public}
 * @param  {string} selector CSS selector
 * @param  {DOMElement}   context (optional) (default document)
 * @return {DOMElement}
 */
_.prototype.find = function(selector, context, includeContextEl)
{
    selector = selector.trim();

    context = (typeof context === 'undefined' ? document : context);

    includeContextEl = (typeof includeContextEl === 'undefined' ? false : includeContextEl && context !== document);

    let fchild = selector.substring(0, 1) === '>';
    let multi  = selector.includes(',');

    // Fast
    if (!fchild && !multi) return selector[0] === '#' ? context.getElementById(selector.substring(1)) : context.querySelector(selector);

    if (multi) selector = selector.replaceAll(/,\s?>/g, ', :scope >');
    
    if (fchild) selector = `:scope ${selector}`;

    // Fixes IDs that start with a number - rare
    if (/\#\d/.test(selector)) selector = selector.replaceAll(/(\#\d[^ ,]+)/g, '[id="$1"]').replaceAll('[id="#', '[id="');

    return context.querySelector(selector);
}


/**
 * Select and return all nodes by selector
 *
 * @access {public}
 * @param  {string} selector CSS selector
 * @param  {DOMElement}   context (optional) (default document)
 * @return {DOMElement}
 */
_.prototype.find_all = function(selector, context, includeContextEl)
{
    selector = selector.trim();

    context = (typeof context === 'undefined' ? document : context);

    includeContextEl = (typeof includeContextEl === 'undefined' ? false : includeContextEl && context !== document);

    let fchild       = selector.substring(0, 1) === '>';
    let multi        = selector.includes(',');
    let hasParent    = context.parentNode; 
    let deleteParent = false;

    if (includeContextEl)
    {
        if (!hasParent)
        {
            parent = document.createElement('div');
            parent.appendChild(context);
            deleteParent = true;
        }

        context = context.parentNode;
    }

    if (multi)  selector = selector.replaceAll(/,\s?>/g, ', :scope >');
    if (fchild) selector = `:scope ${selector}`;

    // Fixes IDs that start with a number - rare
    if (/\#\d/.test(selector)) selector = selector.replaceAll(/(\#\d[^ ,]+)/g, '[id="$1"]').replaceAll('[id="#', '[id="');

    let ret = TO_ARR.call(context.querySelectorAll(selector));

    if (deleteParent) context.parentNode.removeChild(context);

    return ret;
}
/**
 * Toogle a classname
 *
 * @access {public}
 * @param  {DOMElement}         el         Target element
 * @param  {string}       className  Class name to toggle
 */
_.prototype.toggle_class = function(DOMElement, className)
{    
    if (this.has_class(DOMElement, className))
    {
        this.remove_class(DOMElement, className);
    }
    else
    {
        this.add_class(DOMElement, className);
    }
}
/**
 * Triggers an event on an element
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement   Target element
 * @param  {string}       eventName    Event name
 * @param  {mixed}        data         Extra data to pass to custom events 
 */
_.prototype.trigger_event = function(DOMElement, eventName, data)
{    
    if (this.in_array(eventName.toLowerCase(), DOC_EVENTS))
    {
        if ('createEvent' in document)
        {
            var evt = document.createEvent('HTMLEvents');

            evt.initEvent(eventName, false, true);

            DOMElement.dispatchEvent(evt);
        }
        else
        {
            DOMElement.fireEvent(eventName);
        }
    }
    else
    {
        let detail = { DOMElement: DOMElement, name: eventName };
        
        if (this.is_object(data))
        {
            detail = { ...detail, ...data }
        }
        else
        {
            detail = { ...detail, state: data };
        }

        const event = new CustomEvent(eventName, { detail: detail });

        DOMElement.dispatchEvent(event);

        if (eventName.includes(':'))
        {
            var events = eventName.split(':').slice(0, -1);
            var base   = events.shift();
            var count  = events.length + 1;

            this.for(count, function(i)
            {
                let subevent = i === (count -1) ? base : `${base}:${events.join(':')}`;

                detail.name = eventName;

                const evt = new CustomEvent(subevent, { detail: detail });

                DOMElement.dispatchEvent(evt);

                events.pop();
            });
        }
    }
}
/**
 * Traverse up dom tree.
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement Target element
 * @param  {Function}     callback   callback
 */
_.prototype.traverse_up = function(DOMElement, callback)
{    
    // Stop on document
    if (DOMElement === document || this.is_undefined(DOMElement) || DOMElement === null) return;

    let response = callback(DOMElement, DOMElement.tagName.toLowerCase(), DOMElement.className);

    if (response)
    {
        return DOMElement;
    }
    else if (response === false)
    {
        return;
    }

    return this.traverse_up(DOMElement.parentNode, callback);
}

/**
 * Traverse down dom tree.
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement Target element
 * @param  {Function}     callback   callback
 */
_.prototype.traverse_down = function(DOMElement, callback, includeText)
{
    includeText = typeof includeText === 'undefined' ? false : includeText;

    if (this.is_undefined(DOMElement) || DOMElement === null) return;

    let ret;

    this.each(Array.prototype.slice.call(includeText ? DOMElement.childNodes : DOMElement.children), (i, child) => 
    {
        if (includeText && (child.nodeType !== 1 && child.nodeType !== 3)) return;

        let response = callback(child, child.tagName ? child.tagName.toLowerCase() : null, child.className);

        if (response || response === false)
        {
            ret = response === false ? undefined : child;

            return false;
        }

        response = this.traverse_down(child, callback, includeText);

        if (response || response === false)
        {
            ret = response === false ? undefined : child;

            return false;
        }
    });

    return ret;
}

/**
 * Traverse next siblings.
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement Target element
 * @param  {Function}     callback   callback
 */
_.prototype.traverse_next = function(DOMElement, callback)
{
    allNodes = typeof allNodes === 'undefined' ? false : allNodes;

    // Stop on document
    if (DOMElement === document || this.is_undefined(DOMElement) || DOMElement === null) return;

    let response = callback(DOMElement, DOMElement.tagName.toLowerCase(), DOMElement.className);

    if (response)
    {
        return DOMElement;
    }
    else if (response === false)
    {
        return;
    }

    return this.traverse_next(DOMElement.nextSibling, callback);
}

/**
 * Traverse previous siblings.
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement Target element
 * @param  {Function}     callback   callback
 */
_.prototype.traverse_prev = function(DOMElement, callback)
{
    // Stop on document
    if (DOMElement === document || this.is_undefined(DOMElement) || DOMElement === null) return;

    let response = callback(DOMElement, DOMElement.tagName.toLowerCase(), DOMElement.className);

    if (response)
    {
        return DOMElement;
    }
    else if (response === false)
    {
        return;
    }

    return this.traverse_prev(DOMElement.previousSibling, callback);
}

/**
 * Get an element's actual width in px
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement Target element
 * @return {object}
 */
_.prototype.width = function(DOMElement, borderBox)
{
	if (DOMElement === window || DOMElement === document || DOMElement === document.documentElement ) return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

	if (borderBox)
    {
        let w    = parseInt(this.rendered_style(DOMElement, 'width'));
        let padL = parseInt(this.rendered_style(DOMElement, 'padding-left'));
        let padR = parseInt(this.rendered_style(DOMElement, 'padding-right'));

        return parseInt(w - padL - padR);
    }

    return this.css_unit_value(this.rendered_style(DOMElement, 'width'));
}
/**
 * Get an element's actual height in px
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement Target element
 * @return {object}
 */
_.prototype.height = function(DOMElement)
{
    if (DOMElement === window || DOMElement === document || DOMElement === document.documentElement) return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    return this.css_unit_value(this.rendered_style(DOMElement, 'height'));
}
/**
 * Returns nth child
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @return {node\null}
 */
_.prototype.nth_child = function(el, n)
{
    let children = this.first_children(el);

    if (children[n]) return children[n];
}
/**
 * Returns nth position from siblings
 *
 * @access {public}
 * @param  {DOMElement}   el   Target element
 * @return {node\null}
 */
_.prototype.sibling_index = function(DOMElement)
{
    let children = this.first_children(DOMElement.parentNode);

    for (var i = 0; i < children.length; i++)
    {
        if (children[i] === DOMElement) return i;
    }

    return 0;
}
/**
 * Add an event listener
 *
 * @access {public}
 * @param  {DOMElement}    element    The target DOM node
 * @param  {string}        eventName  Event type
 * @param  {closure}       handler    Callback event
 * @param  {array}         args       Args to pass to handler (first array element gets set to "this")
 * @param  {boolean}       pushfirst  If boolean (true) is provided, pushes callback to first in stack (default false)
 */
_.prototype.on = function(DOMElement, eventName, handler)
{    
    var args = TO_ARR.call(arguments);

    // Multiple elements
    if (this.is_array(DOMElement))
    {
        var baseArgs = args.slice(1);

        this.each(DOMElement, function(i, el)
        {            
            this.on.apply(this, [el, ...baseArgs]);

        }, this);
    }
    else
    {
        // If event has a comma or is an array we're doing multiple events
        if (this.is_array(eventName) || eventName.includes(','))
        {
            let eventsArr = this.is_array(eventName) ? eventName : eventName.split(',').map((x) => x.trim()).filter((x) => x !== '');

            this.each(eventsArr, function(i, event)
            {
                args[1] = event;

                this.on.apply(this, args);
                
            }, this);

            return;
        }

        // If array of arguments is provided, "this" will always be the first
        // argument provided
        // However the first and second argument passed to the callback will always the event object and the element
        // e.g. on(el, 'click', callback, ['baz', 'foo', 'bar']) -> callback(e, el, foo, bar) this = 'baz'

        // Remove element, eventName, handler from args
        let argsNormal = this.__normaliseListenerArgs(DOMElement, args);

        this.__addListener(DOMElement, eventName, handler, argsNormal.thisArg, argsNormal.args, argsNormal.pushFirst);
    }
}

/**
 * Nomralize event listener args
 * 
 * @param  {DOMElement}    DOMElement   The target DOM node
 * @param  {array}         args         Args passed to 'on' or 'off'
 */
_.prototype.__normaliseListenerArgs = function(DOMElement, args)
{
    // Remove DOMElement, eventName, handler
    args = args.slice(3);

    // Default "this" to the dom element
    let thisArg   = DOMElement;
    let pushFirst = false;

    // Push first
    if (!this.is_empty(args))
    {
        thisArg   = args.shift();
        pushFirst = this.bool(args.shift());
    }

    return {args, thisArg, pushFirst};
}

/**
 * Adds a listener to the element
 *
 * @access {private}
 * @param  {DOMElement}    element    The target DOM node
 * @param  {string}  eventName  Event type
 * @param  {closure} handler    Callback event
 * @param  {bool}    data Use capture (optional) (defaul false)
 */
_.prototype.__addListener = function(element, eventName, callback, thisArg, args, pushFirst)
{
    // Apply GUID to element and callback
    element.guid = element.guid || (element.guid = this._guidgen());
    callback.guid    = callback.guid || (callback.guid = this._guidgen());

    let hasHandler = true;
    let guid       = element.guid;

    // Make sure an array for event type exists
    if (!this._events[guid])
    {
        hasHandler = false;

        this._events[guid] = {};
    }

    if (!this._events[guid][eventName])
    {
        hasHandler = false;

        this._events[guid][eventName] = [];
    }

    // Push the details to the events object
    const handlerObj = {callback, thisArg, args, element};
    
    pushFirst ? this._events[guid][eventName].unshift(handlerObj) : this._events[guid][eventName].push(handlerObj);

    if (!hasHandler)
    {
        element.addEventListener(eventName, this.__event_dispatcher);
    }
}

/**
 * Event dispatcher
 *
 * @access {private}
 * @param  {eventObject}  e  
 */
_.prototype.__event_dispatcher = function(e)
{
    e = e || window.event;

    let DOMElement = this;

    let guid = DOMElement.guid;

    if (!guid) return;

    let callbacks =  _THIS._events[guid][e.type] || [];

    _THIS.each(callbacks, (i, handler) =>
    {        
        if (handler)
        {
            let handled = handler.callback.apply(handler.thisArg, [e, DOMElement, ...handler.args]);

            if (handled === false || handled === null)
            {
                e.preventDefault();

                e.stopPropagation();

                if (handled === null) return false;
            }
        }
    });
}

/**
 * Remove an event listener
 *
 * @access {public}
 * @param  {DOMElement}    element    The target DOM node
 * @param  {string}        eventName  Event type
 * @param  {closure}       handler    Callback event
 * @param  {array}         args       Args to pass to handler (first array element gets set to "this")
 * @param  {boolean}       pushfirst  If boolean (true) is provided, pushes callback to first in stack (default false)
 */
_.prototype.off = function(DOMElement, eventName, handler)
{
    var args = TO_ARR.call(arguments);

    if (this.is_array(DOMElement))
    {
        var baseArgs = args.slice(1);

        this.each(DOMElement, function(i, el)
        {            
            this.off.apply(this, [el, ...baseArgs]);
        
        }, this);
    }
    else
    {
        // If the eventName name was not provided - remove all event handlers on element
        if (!eventName)
        {
            return this.__remove_element_listeners(DOMElement);
        }

        // If event has a comma or is an array we're doing multiple events
        if (this.is_array(eventName) || eventName.includes(','))
        {
            let eventsArr = this.is_array(eventName) ? eventName : eventName.split(',').map((x) => x.trim()).filter((x) => x !== '');

            this.each(eventsArr, function(i, event)
            {
                args[1] = event;

                this.off.apply(this, args);
                
            }, this);

            return;
        }

        // If the callback was not provided - remove all events of the type on the element
        if (!handler)
        {
            return this.__remove_element_type_listeners(DOMElement, eventName);
        }
        
        let guid = DOMElement.guid;

        // Nothing to remove
        if (!guid) return;

        let handlers = this.array_get(`${guid}.${eventName}`, this._events);

        // Nothing to remove
        if (!handlers) return;

        // Loop stored events and match node, event name, handler, use capture
        this.each(handlers, function(i, _handler)
        {            
            if (_handler.callback.guid === handler.guid || this.is_equal(_handler.callback, handler))
            {
                this._events[guid][eventName].splice(i, 1);

                if (this.is_empty(this._events[guid][eventName]))
                {
                    delete this._events[guid][eventName];

                    this.__remove_listener(DOMElement, eventName);
                }

                if (this.is_empty(this._events[guid]))
                {
                    delete this._events[guid];
                }
                
                // Break only remove first
                return false;
            } 
        
        }, this);
    }
}

/**
 * Removes all registered event listeners on an element
 *
 * @access {private}
 * @param  {DOMElement} DOMElement Target node element
 */
_.prototype.__remove_element_listeners = function(DOMElement)
{
    let guid = DOMElement.guid;

    if (!guid) return;

    if (this._events[guid])
    {
        this.each(this._events[guid], function(type, callbacks)
        {
            this.__remove_listener(DOMElement, type);
            
        }, this);
    }

    delete this._events[guid];
}

/**
 * Removes all registered event listeners of a specific type on an element
 *
 * @access {private}
 * @param  {DOMElement} DOMElement Target node element
 * @param  {string}     type       Event listener type
 */
_.prototype.__remove_element_type_listeners = function(DOMElement, type)
{
    let guid = DOMElement.guid;

    if (!guid) return;

    // Make sure an array for event type exists
    if (this._events[guid] && this._events[guid][type])
    {
        delete this._events[guid][type];

        this.__remove_listener(DOMElement, type);

        if (this.is_empty(this._events[guid]))
        {
            delete this._events[guid];
        }
    }
}

/**
 * Removes a listener from the element
 *
 * @access {private}
 * @param  {DOMElement} DOMElement The target DOM node
 * @param  {string}     eventType  Event type
 * @param  {closure}    handler    Callback event
 * @param  {bool}       useCapture Use capture (optional) (defaul false)
 */
_.prototype.__remove_listener = function(DOMElement, eventType)
{    
    DOMElement.removeEventListener(eventType, this.__event_dispatcher);
}

/**
 * Removes all event listeners registered by the library
 *
 * @access {public}
 */
_.prototype.clear_event_listeners = function(DOMElement, onlyChildren)
{
    DOMElement = this.is_undefined(DOMElement) ? document : DOMElement;

    onlyChildren = this.is_undefined(onlyChildren) ? false : onlyChildren;

    if (DOMElement !== document)
    {
        let children = this.find_all('*', DOMElement).reverse();

        this.each(children, (i, child) => this.off(child));

        if (!onlyChildren) this.off(DOMElement);
        
        return;
    }

    var events = this._events;

    let _this = this;

    _this.each(this._events, (guid, types) =>
    {
        _this.each(types, (type, callbacks) =>
        {
            let DOMElement = callbacks[0].element;
            
            _this.__remove_listener(DOMElement, type);
        });
    });

    this._events = {};



}
/**
 * Removes all event listeners registered by the library on nodes
 * that are no longer part of the DOM tree
 *
 * @access {public}
 */
_.prototype.collect_garbage = function()
{

    this.each(this._events, (guid, types) =>
    {
        let cleared = false;

        this.each(types, (type, callbacks) =>
        {
            let DOMElement = callbacks[0].element;
            
            if (!this.in_dom(DOMElement))
            {
                cleared = true;

                this.__remove_listener(DOMElement, type);
            }
        });

        if (cleared) delete this._events[guid];
    });
}
/**
 * Removes event listeners on a DOM node
 *
 * If no element given, all attached event listeners are returned.
 * If no event name is given, all attached event listeners are returned on provided element.
 * If single arguement is provided and arg is a string, e.g 'click', all events of that type are returned
 * 
 * @access {public}
 * @param  {mixed}   element    The target DOM node
 * @param  {string}  eventName  Event type
 * @return {array}
 */
_.prototype.event_listeners = function(DOMElement, eventName)
{
    var args = TO_ARR.call(arguments);
    var ret  = [];

    // No args, return all events
    if (args.length === 0)
    {
        this.each(this._events, function(guid, types)
        {
            this.each(types, function(type, callbacks)
            {
                let summary = callbacks.map( (details) => ({ el: details.element, callback: details.callback, type: type }) );

                ret = [...ret, ...summary];
            });

        }, this);

        return ret;
    }
    
    // eventListeners(node) or
    // eventListeners('click')
    else if (args.length === 1)
    {
        // eventListeners('click')
        if (this.is_string(DOMElement))
        {   
            this.each(this._events, function(guid, types)
            {
                this.each(types, function(type, callbacks)
                {
                    if (type === DOMElement)
                    {
                        let summary = callbacks.map( (details) => ({ el: details.element, callback: details.callback, type: type }) );

                        ret = [...ret, ...summary];
                    }
                });

            }, this);

            return ret;
        }
        
        // eventListeners(node)
        let guid = DOMElement.guid;

        if (!guid || !this._events[guid]) return ret;

        this.each(this._events[guid], function(type, callbacks)
        {
            let summary = callbacks.map( (details) => ({ el: details.element, callback: details.callback, type: type }) );

            ret = [...ret, ...summary];

        }, this);

        return ret;
    }

    // eventListeners(node)
    let guid = DOMElement.guid;

    if (!guid || !this._events[guid] || !this._events[guid][eventName]) return ret;

    this.each(this._events[guid][eventName], function(i, details)
    {
        ret.push({ el: details.element, callback: details.callback, type: eventName });

    }, this);

    return ret;
}
/**
 * Is this a mobile user agent?
 *
 * @return {bool}
 */
_.prototype.is_retina = function()
{
    var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
                      (min--moz-device-pixel-ratio: 1.5),\
                      (-o-min-device-pixel-ratio: 3/2),\
                      (min-resolution: 1.5dppx)";

    if (window.devicePixelRatio > 1)
    {
        return true;
    }

    if (window.matchMedia && window.matchMedia(mediaQuery).matches)
    {
        return true;
    }

    return false;
}

/**
 * Parse url
 *
 * @param  {string}    str       The URL to parse. Invalid characters are replaced by _.
 * @return {object}
 */
_.prototype.parse_url = function(str)
{
    var ret = {};
    var url = new URL(str);

    if (url.search)
    {
        var queries = url.search.substring(1).split('&');
        var qret    = {};
        
        this.each(queries, function(i, query)
        {
            if (query.includes('='))
            {
                var set   = query.split('=');
                var key   = decodeURI(set[0].trim());
                var val   = true;

                if (set.length === 2)
                {
                    val = set[1].trim();
                }

                if (key !== '' && val !== '')
                {
                    qret[key] = val;
                }
            }
            else
            {
                qret[query] = true;
            }
        });

        url.query = qret;
    }

    return url;
}
/**
 * Gets url query
 *
 * @access {public}
 * @param  {string}  name String query to get (optional)
 * @return {object|string}
 */
_.prototype.url_query = function(name)
{
    var results = {};

    if (window.location.search !== '')
    {
        var params = window.location.search.substring(1).split('&');

        for (var i = 0; i < params.length; i++)
        {
            if (!params[i].includes('='))
            {
                continue;
            }

            var split = params[i].split('=');

            results[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
        }
    }

    // No param return all url query
    if (typeof name === 'undefined')
    {
        return results;
    }

    name = decodeURIComponent(name);

    if (name in results)
    {
        return results[name];
    }

    return false;
}
/**
 * Normalises a url
 *
 * @access {public}
 * @param  {string}  url The url to normalise
 * @return {string}
 */
_.prototype.normalize_url = function(url)
{
    // Remove www.
    if (url.startsWith('www.') || url.includes('//www.')) url = url.replace('www.', '');

    // Back dirs
    if (url.startsWith('../'))
    {
        let paths = this.parse_url(this.trim(window.location.href, '/')).pathname.split('/');

        if (!this.is_empty(paths))
        {
            // Remove file
            if (paths.slice(-1).includes('.')) paths.pop();

            let backs = url.split('../').length;

            this.for(backs, () => paths.pop());

            url = '/' + this.trim(`${paths.join('/')}/${url.replace(/\.\.\//g, '')}`, '/');
        }
    }

    // Local
    if (url[0] === '/') url = window.location.origin + url;

    // Add protocol
    if (!url.startsWith('https') && !url.startsWith('http')) url = `${window.location.protocol}//${url}`;

    return url;
}
/**
 * Clones any variables
 * 
 * @param   {mixed}  mixed_var
 * @param   {mixed}  context   Context to bind functions
 * @returns {mixed}
 */
_.prototype.clone_deep = function(mixed_var, context)
{
    return this.__clone_var(mixed_var, this.is_undefined(context) ? mixed_var : context);
}

/**
 * Clone's variable with context.
 * 
 * @param   {mixed}  mixed_var  Variable to clone
 * @param   {mixed}  context    Context when cloning recursive objects and arrays.
 * @returns {mixed}
 */
_.prototype.__clone_var = function(mixed_var, context)
{
    let tag = this.var_type(mixed_var);

    switch (tag)
    {
        case OBJECT_TAG:
            return this.__clone_obj(mixed_var, context);

        case ARRAY_TAG:
        case NODELST_TAG:
        case ARGS_TAG:
            return this.__clone_array(mixed_var, context);

        case FUNC_TAG:
            return this.__clone_func(mixed_var);

        case NULL_TAG:
            return null;

        case UNDEF_TAG:
            return;

        case BOOL_TAG:
            return mixed_var === true ? true : false;

        case STRING_TAG:
            return mixed_var.slice();

        case NUMBER_TAG:
            let n = mixed_var;
            return n;

        case REGEXP_TAG:
            return this.__clone_RegExp(mixed_var, context);

        case SYMBOL_TAG:
            return this.__clone_symbol(mixed_var);

        case DATE_TAG:
            return this.__clone_date(mixed_var);

        case SET_TAG:
            return this.__clone_set(mixed_var, context);

        case MAP_TAG:
            return this.__clone_map(mixed_var, context);

        case ARRAY_BUFFER_TAG:
            return this.__clone_array_buffer(mixed_var);

        case DATAVIEW_TAG:
            return this.__clone_data_view(mixed_var);

        case ARRAY_BUFFER_TAG:
            return this.__clone_buffer(mixed_var);

        case FLOAT32_TAG:
        case FLOAT64_TAG:
        case INT8_TAG:
        case INT16_TAG:
        case INT32_TAG:
        case UINT8_TAG:
        case UINT8CLAMPED_TAG:
        case UINT16_TAG:
        case UINT32_TAG:
            return this.__clone_typed_array(object);

        case ERROR_TAG:
        case WEAKMAP_TAG:
            return {};
    }

    return mixed_var;
}

/**
 * Clones an object
 * 
 * @param   {object}  obj
 * @returns {object}
 */
_.prototype.__clone_obj = function(obj, context)
{
    // Shallow keys
    let keys = this.object_props(obj);

    let ret  = {};

    // Empty object
    if (keys.length === 0 || this.is_empty(obj))
    {
        return ret;
    }

    this.each(keys, (i, key) => ret[key] = this.clone_deep(obj[key], context));
    
    // Clone prototypes
    let protos = this.prototypes(obj);

    if (protos.length >= 1)
    {
        let curr = ret;

        while(protos.length > 0)
        {
            let proto        = protos.shift();
            let clone        = this.clone_deep(proto, context);
            clone.constrctor = this.clone_deep(proto.constructor, context);
            
            Object.setPrototypeOf(curr, clone);
            
            curr = clone;
        }
    }

    return ret;
}

/**
 * Clones a function
 * 
 * @param   {function}  function
 * @param   {mixed}     context   Context to bind function
 * @returns {function}
 */
_.prototype.__clone_func = function(func)
{
    let statics = this.object_props(func, true);

    if (!this.is_constructable(func))
    {
        let bound = this.bind(func);

        this.each(statics, (i, method) => bound[method] = func[method] ? this.bind(func[method]) : null);

        return bound;
    }

    let bound = function()
    {
        this.super(...arguments)
    }

    this.each(statics, (i, method) => bound[method] = this.bind(func[method]));

    return this.extend(func, bound);
}

/**
 * Clones an array
 * 
 * @param   {array}  arr
 * @returns {array}
 */
_.prototype.__clone_array = function(arr, context)
{
    let ret = [];

    this.each(arr, (i, val) =>
    {
        ret[i] = this.clone_deep(val, context);
    
    });

    return ret;
}

_.prototype.__clone_date = function(d)
{
    let r = new Date();

    r.setTime(d.getTime());

    return r;
}

_.prototype.__clone_symbol = function(symbol)
{
    return Object(Symbol.prototype.valueOf.call(symbol));
}

_.prototype.__clone_RegExp = function(regexp)
{
    let reFlags = /\w*$/;

    let result = new regexp.constructor(regexp.source, reFlags.exec(regexp));

    result.lastIndex = regexp.lastIndex;

    return result;
}

_.prototype.__clone_map = function(m, context)
{
    const ret = new Map();

    m.this.each((v, k) =>
    {
        ret.set(k, this.clone_deep(v, context));
    
    }, this);

    return ret;
}

_.prototype.__clone_set = function(s, context)
{
    const ret = new Set();

    s.this.each((val, k) =>
    {
        ret.add(k, this.clone_deep(v, context));
    
    });

    return ret;
}

_.prototype.__clone_array_buffer = function(arrayBuffer)
{
    const result = new arrayBuffer.constructor(arrayBuffer.byteLength)

    new Uint8Array(result).set(new Uint8Array(arrayBuffer));

    return result;
}

_.prototype.__clone_data_view = function(dataView)
{
    const buffer = this.__clone_array_buffer(dataView.buffer);

    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `buffer`.
 *
 * @param   {Buffer}   buffer   The buffer to clone.
 * @param   {boolean} [isDeep]  Specify a deep clone.
 * @returns {Buffer}   Returns  the cloned buffer.
 */
_.prototype.__clone_buffer = function(buffer)
{
    const length = buffer.length;

    const result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

    buffer.copy(result);

    return result;
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
_.prototype.__clone_typed_array = function(typedArray)
{
    const buffer = this.__clone_array_buffer(typedArray.buffer);

    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Binds a function so that it can be identified.
 * 
 * @param   {function}  func    Function to bind
 * @param   {mixed}     context Context to bind "this"
 * @returns {function}
 */
_.prototype.bind = function(func, context)
{
    context = typeof context === 'undefined' ? (window || global) : context;

    const bound = function()
    {
        return func.apply(context, arguments);
    }

    Object.defineProperty(bound, 'name', { value: func.name });

    bound.__isBound      = true;
    bound.__boundContext = context;
    bound.__origional    = func;

    return bound;
}
/**
 * Extends a function with prototype inheritance.
 *
 * @param   {function}           superType    Base function to extend
 * @param   {function}           subType  Function to get extended.
 * @param   {undefined|boolean}  callSuper   If true "subType" is treated as a constructor and the superType / any nested prototypes will get instantiated. (default true)
 * @returns {function}
 */
_.prototype.extend = function(base, extension)
{
    const _this = this;

    function proxySuper(superFn, fn)
    {
        return function()
        {
            var tmp = this.super;
            
            this.super = superFn;
            
            var ret = fn.apply(this, arguments);
            
            this.super = tmp;

            return ret;
        }
    }

    function Class() {}

    Class.extend = function(protoProps)
    {
        var parent = this, _super = parent.prototype, child;

        if (protoProps && protoProps.hasOwnProperty('constructor'))
        {
            child = proxySuper(parent, protoProps.constructor);
            
            delete protoProps.constructor; // remove constructor
        }
        else
        {
            child = function()
            {
                parent.apply(this, arguments);
            };
        }

        var prototype = Object.create(parent.prototype,
        {
            constructor:
            {
                value: child,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });

        for (var name in protoProps)
        {
            prototype[name] = _this.is_function(protoProps[name]) && _this.is_function(_super[name]) && /\bsuper\b/.test(protoProps[name])
            ? proxySuper(_super[name], protoProps[name]) : protoProps[name];
        }

        child.prototype = prototype;
        child.extend = Class.extend;

        return child;
    };

    if (this.var_type(base) !== this.var_type(extension)) throw new Error('Extended variables need to be the same type.');

    if (this.is_object(base)) return this.extend_obj(base, extension);

    const baseProto   = base.prototype;
    const extendProto = extension.prototype;

    if (!baseProto.hasOwnProperty('constructor')) baseProto['constructor'] = base;
   
    if (!extendProto.hasOwnProperty('constructor')) extendProto['constructor'] = extension;
    
    var b = Class.extend(baseProto);

    var e = b.extend(extendProto);

    Object.defineProperty(e, 'name', { value: extension.name, writable: false });

    return e;
}

/**
 * Extends a function with prototype inheritance.
 *
 * @param   {function}           superType    Base function to extend
 * @param   {function}           subType  Function to get extended.
 * @param   {undefined|boolean}  callSuper   If true "subType" is treated as a constructor and the superType / any nested prototypes will get instantiated. (default true)
 * @returns {function}
 */
_.prototype.extend_obj = function(base, extension)
{
    const extProto  = this.prototypes(extension);
    const baseProto = this.prototypes(base);

    // Plain objects
    if (this.is_empty(extProto) && this.is_empty(baseProto)) return {...base, ...extension};

    const newProto = new (function() {});
    
    Object.setPrototypeOf(newProto, base);

    this.each(extProto, (i, proto) =>
    {
        this.each(proto, (k, v) =>
        {
            newProto[k] = v;
        })

    }, this);

    Object.defineProperty(newProto, 'name', { value: 'Class', writable: false });

    Object.setPrototypeOf(extension, newProto);

    return extension;
}


/**
 * Joins an object into a string
 * 
 * @param   {Object} obj       Object
 * @param   {string} seperator Seperator Between key & value
 * @param   {string} glue      Glue between value and next key
 * @returns {string} 
 */
_.prototype.join_obj = function(obj, seperator, glue, recursive, trimLast)
{
    seperator = this.is_undefined(seperator) ? '' : seperator;
    glue      = this.is_undefined(glue) ? '' : glue;
    recursive = this.is_undefined(recursive) ? false : recursive;
    trimLast  = this.is_undefined(trimLast)  ? true : trimLast;
    
    var ret = '';

    this.each(obj, function(key, val)
    {
        if (this.is_object(val))
        {
            val = recursive ? '{' + this.join_obj(val, seperator, glue, recursive, trimLast) + '}' : {};
        }
        else if (this.is_array(val))
        {
            val = recursive ? this.join_obj(val, seperator, glue, recursive, trimLast) : val.join(', ').replaceAll('[object Object]', '{}');
        }
        else
        {            
            val = `${val}`;
        }

        ret += `${glue}${key}${seperator}${val}`;

    }, this);

    if (ret === `${glue}${seperator}` || ret.trim() === '') return '';

    return trimLast ? this.rtrim(this.ltrim(ret, glue), seperator) : this.ltrim(ret, glue).trim() + glue;
}
/**
 * Returns object properties and methods as array of keys.
 * 
 * @param   {mixed}    mixed_var    Variable to test
 * @param   {boolean}  withMethods  Return methods and props (optional) (default "true")
 * @returns {array}
 */
_.prototype.object_props = function(mixed_var, deep)
{
    if (!mixed_var) return [];

    deep = typeof deep === 'undefined' ? false : deep;
    
    let keys = deep ?this.array_unique([...Object.keys(mixed_var), ...Object.getOwnPropertyNames(mixed_var)]) : Object.keys(mixed_var);

    if (deep)
    {
        let protos = this.prototypes(mixed_var);

        this.each(protos, (i, proto) => keys = [...keys, ...this.object_props(proto, true)] );
    }
    
    return this.array_unique(keys.filter((key) => !EMPTY_OBJ_KEYS.includes(key) && !FORBIDDEN_OBJ_KEYS.includes(key)));
}

/**
 * Returns an array of prototypes
 * 
 * @param   {mixed}    mixed_var    Variable to test
 * @param   {boolean}  withMethods  Return methods and props (optional) (default "true")
 * @returns {array}
 */
_.prototype.prototypes = function(mixed_var)
{
    let ret = [];

    if (!mixed_var) return ret;

    const _this = this;

    const recursive = function(obj)
    {
        let proto = obj.prototype || Object.getPrototypeOf(obj);

        // No prototype
        if (!proto) return;

        // Prototype is native object
        let protokeys = Object.getOwnPropertyNames(proto);

        if (protokeys.filter(x => !EMPTY_OBJ_KEYS.includes(x)).length === 0) return;

        ret.push(proto);

        recursive(proto);
    }

    recursive(mixed_var);

    return ret;
}


/**
 * Returns object properties and methods as array of keys.
 * 
 * @param   {mixed}    mixed_var    Variable to test
 * @param   {boolean}  withMethods  Return methods and props (optional) (default "true")
 * @returns {array}
 */
_.prototype.flatten_obj = function(obj, deep)
{
    deep = typeof deep === 'undefined' ? false : deep;

    var ret = {};

    this.each(obj, (k,v) => ret[k] = v);
   
    if (deep)
    {
        let proto = mixed_var.prototype || Object.getPrototypeOf(mixed_var);

        ret = {...ret, ...this.flatten_obj(proto, true)};
    }
    
    return ret;
}
_.prototype.camel_case_to_hyphen = function(str)
{
    if (str === str.toLowerCase()) return str;
    
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1-$2$3').toLowerCase();
}
/**
 * Json encode
 * 
 * @param  {mixed} str String JSON
 * @return {object|false}
 */
_.prototype.json_decode = function(str)
{
    var obj;
    try
    {
        obj = JSON.parse(str);
    }
    catch (e)
    {
        return false;
    }
    return obj;
}
/**
 * Json encode
 * 
 * @param  {mixed} str String JSON
 * @return {object|false}
 */
_.prototype.json_encode = function(str)
{
    var obj;
    try
    {
        obj = JSON.stringify(str);
    }
    catch (e)
    {
        return false;
    }
    return obj;
}
/**
 * Left trim string 
 * 
 * @param  {str}           str
 * @return {array|string} charlist (optional)
 */
_.prototype.ltrim = function(str, charlist)
{
    // Special fast cases
    if (!charlist) return str.trimStart();

    if (this.is_string(charlist))
    {
        return str.slice(0, charlist.length) === charlist ? str.replace(charlist, '') : str;
    }

    var ret = str;

    this.each(charlist, function(i, char)
    {
        if (str.slice(0, char.length) === char)
        {
            ret = str.replace(char, '');
            
            // break            
            return false;
        }

    }, this);

    return ret;
}


/**
 * Make a random string
 *
 * @param  {int}    length String length
 * @return {string}
 */
_.prototype.makeid = function(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < length; i++)
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text;
}
/**
 * Left trim string 
 * 
 * @param  {str}           str
 * @return {array|string} charlist (optional)
 */
_.prototype.rtrim = function(str, charlist)
{
    if (!charlist) return str.trimEnd();

    if (this.is_string(charlist))
    {
        let len = charlist.length; 

        return str.slice(-len) === charlist ? str.slice(0, -len) : str;
    }

    var ret = str;

    this.each(charlist, function(i, chars)
    {
        var len = chars.length;

        if (str.slice(-len) === chars)
        {
            ret = str.slice(0, -len);

            return false;
        }

    }, this);

    return ret;
}
_.prototype.to_camel_case = function(str)
{
    str = str.trim();

    // Shouldn't be changed
    if (!str.includes(' ') && !str.includes('-') && /[A-Z]/.test(str))
    {
        return str;
    }

    return str.toLowerCase().replace(/['"]/g, '').replace(/\W+/g, ' ').replace(/ (.)/g, function($1)
    {
        return $1.toUpperCase();
    })
    .replace(/ /g, '');
}
/**
 * Left and right trim string.
 * 
 * @param  {str}           str
 * @return {array|string} charlist (optional)
 */
_.prototype.trim = function(str, charlist)
{
    if (!charlist) return str.trim();

    return this.rtrim(this.ltrim(str, charlist), charlist);
}
/* Capatalize first letter */
_.prototype.uc_first = function(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
/* Capatalize first letter of all words */
_.prototype.ucwords = function(str)
{
    return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1)
    {
        return $1.toUpperCase();
    });
}
_.prototype.lc_first = function(string)
{
    return string.charAt(0).toLowerCase() + string.slice(1);
}
/**
 * String replace
 * 
 * @param  {str}           str
 * @return {array|string} charlist (optional)
 */
_.prototype.str_replace = function(str, charlist, value)
{
    if (this.is_string(charlist) || this.is_regexp(charlist))
    {
        return str.replaceAll(charlist, value)
    }

    this.each(charlist, function(i, char)
    {
        str = str.replaceAll(char, value);

    }, this);

    return str;
}


/**
 * Checks if variable should be considered "true" or "false" using "common sense".
 * 
 * @param   {mixed} mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.bool = function(mixed_var)
{
    mixed_var = (typeof mixed_var === 'undefined' ? false : mixed_var);

    if (this.is_bool(mixed_var))
    {
        return mixed_var;
    }

    if (this.is_number(mixed_var))
    {
        return mixed_var > 0;
    }

    if (this.is_array(mixed_var))
    {
        return mixed_var.length > 0;
    }

    if (this.is_object(mixed_var))
    {
        return Object.keys(mixed_var).length > 0;
    }

    if (this.is_string(mixed_var))
    {
        mixed_var = mixed_var.toLowerCase().trim();

        if (mixed_var === 'false')
        {
            return false;
        }
        if (mixed_var === 'true')
        {
            return true;
        }
        if (mixed_var === 'on')
        {
            return true;
        }
        if (mixed_var === 'off')
        {
            return false;
        }
        if (mixed_var === 'undefined')
        {
            return false;
        }
        if (this.is_numeric(mixed_var))
        {
            return Number(mixed_var) > 0;
        }
        if (mixed_var === '')
        {
            return false;
        }
    }

    return false;
}

/**
 * Returns function / class name
 *
 * @param   {mixed}  mixed_var Variable to evaluate
 * @returns {string}
 */
_.prototype.callable_name = function(mixed_var)
{
    if (this.is_callable(mixed_var))
    {
        return mixed_var.name;
    }
    else if (this.is_object(mixed_var))
    {
        return mixed_var.constructor.name;
    }
}
/**
 * Count
 *
 * @access {public}
 * @param  {mixed}  mixed_var Variable to count
 * @return {int}
 */
_.prototype.count = function(mixed_var)
{
    return this.size(mixed_var);
}
/**
 * Checks if HtmlElement is in current DOM
 *
 * @param   {HTMLElement}  element  Element to check
 * @returns {boolean}
 */
_.prototype.in_dom = function(element)
{
    // Element types
    if (element === window || element === document || element === document.body || element === document.documentElement)
    {
        return true;
    }

    // Not an HTML element
    if (!this.is_htmlElement(element))
    {
        return false;
    }

    // No parent node
    if (!element.parentNode) return false;

    // Matching by selector is faster than traversing up the
    // DOM tree - especially if element is deeply nested.
    let selector = element.tagName.toLowerCase();

    if (element.id && element.id.trim() !== '')
    {
        selector = `#${element.id}`;
    }
    else if (element.className && element.className.trim() !== '')
    {
        let classNames = this.class_names(element);

        selector = classNames.length === 1 ? `.${classNames[0]}` : `.${classNames.join('.')}`;
    }
    else
    {
        let classNames = this.class_names(element.parentNode);

        if (classNames.length >= 1) selector = classNames.length === 1 ? `.${classNames[0]} ${selector}` : `.${classNames.join('.')} ${selector}`;
    }

    let matches = this.find_all(selector);

    // Fast check
    if (matches.length === 1 && matches[0] === element) return true;

    // Loop through
    let ret = false;

    this.each(matches, (i, match) =>
    {
        if (match === element)
        {
            ret = true;

            return false;
        }
    });

    return ret;
}
/**
 * Is args array.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_args = function(mixed_var)
{
    return this.var_type(mixed_var) === ARGS_TAG;
}
/**
 * Is array.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_array = function(mixed_var, strict)
{
    strict = typeof strict === 'undefined' ? false : strict;

    let type = this.var_type(mixed_var);

    return !strict ? ARRAYISH_TAGS.includes(type) : type === ARRAY_TAG;
}
/**
 * Is bool.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_bool = function(mixed_var)
{
    return this.var_type(mixed_var) === BOOL_TAG;
}
/**
 * Is Array buffer.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_buffer = function(mixed_var)
{
    return this.var_type(mixed_var) === ARRAY_BUFFER_TAG;
}
/**
 * Is variable a function / constructor.
 *
 * @param   {mixed}  mixed_var  Variable to check
 * @returns {boolean}
 */
_.prototype.is_callable = function(mixed_var)
{
    return this.is_function(mixed_var);
}
/**
 * Checks if variable is a class declaration or extends a class and/or constructable function.
 *
 * @param   {mixed}                        mixed_var  Variable to evaluate
 * @oaram   {string} | undefined | boolean} classname  Classname or strict if boolean provided
 * @param   {boolean}                      strict     If "true" only returns true on ES6 classes (default "false")
 * @returns {boolean}
 */
_.prototype.is_class = function(mixed_var, classname, strict)
{
    // this.is_class(foo, true)
    if (classname === true || classname === false)
    {
        strict = classname;
        classname = null;
    }
    // this.is_class(foo, 'Bar') || this.is_class(foo, 'Bar', false)
    else
    {
        strict = typeof strict === 'undefined' ? false : strict;
    }

    if (typeof mixed_var !== 'function' || !this.is_constructable(mixed_var))
    {
        return false;
    }

    let isES6 = /^\s*class\s+\w+/.test(mixed_var.toString());

    if (classname)
    {
        if (!isES6 && strict)
        {
            return false;
        }

        if (mixed_var.name === classname || mixed_var.prototype.constructor.name === classname)
        {
            return true;
        }

        let protos = [];
        let proto = mixed_var.prototype || Object.getPrototypeOf(mixed_var);
        let ret = false;

        while (proto && proto.constructor)
        {
            // recursive stopper
            if (protos.includes.proto)
            {
                break;
            }

            protos.push(proto);

            if (proto.constructor.name === classname)
            {
                ret = true;

                break;
            }

            proto = proto.prototype || Object.getPrototypeOf(proto);
        }

        return ret;
    }

    // ES6 class declaration depending on strict

    return strict ? isES6 : this.is_constructable(mixed_var);
}
/**
 * Checks if variable is construable.
 *
 * @param   {mixed}  mixed_var  Variable to evaluate
 * @returns {boolean}
 */
_.prototype.is_constructable = function(mixed_var)
{
    // Not a function
    if (typeof mixed_var !== 'function' || mixed_var === null)
    {
        return false;
    }

    // Strict ES6 class
    if (/^\s*class\s+\w+/.test(mixed_var.toString()))
    {
        return true;
    }

    // Native arrow functions
    if (!mixed_var.prototype || !mixed_var.prototype.constructor)
    {
        return false;
    }

    // If prototype is empty 
    return this.object_props(mixed_var.prototype).length > 0;
}
/**
 * Checks if variable is constructed object function.
 *
 * @param   {mixed}  mixed_var  Variable to evaluate
 * @returns {boolean}
 */
_.prototype.is_constructed = function(mixed_var)
{
    if (typeof mixed_var === 'object' && mixed_var.constructor && typeof mixed_var.constructor === 'function')
    {
        var constr = mixed_var.constructor.toString().trim();
        
        return constr.startsWith('function (') || constr.startsWith('function(') || constr.startsWith('function Object(') || constr.startsWith('class ') ;
    }

    return false;
}
/**
 * Is dataView obj.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_dataview = function(mixed_var)
{
    return this.var_type(mixed_var) === DATAVIEW_TAG;
}
/**
 * Is date object.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_date = function(mixed_var)
{
    return this.var_type(mixed_var) === DATE_TAG;
}
/**
 * Is empty
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_empty = function(mixed_var)
{
    if (mixed_var === false || mixed_var === null || (typeof mixed_var === 'undefined'))
    {
        return true;
    }
    else if (this.is_array(mixed_var))
    {
        return mixed_var.length === null || mixed_var.length <= 0;
    }
    else if (this.is_object(mixed_var))
    {
        if (Object.keys(mixed_var).length > 0) return false;

        if (this.prototypes(mixed_var).length > 0) return false;

        return true;
    }
    else if (this.is_string(mixed_var))
    {
        return mixed_var.trim() === '';
    }
    else if (this.is_number(mixed_var))
    {
        return isNaN(mixed_var);
    }
    else if (this.is_function(mixed_var))
    {
        return false;
    }

    return false;
}
/**
 * Deep check for equal
 * 
 * @param   {mixed}  a
 * @param   {mixed}  b
 * @param   {bool}   strict Strict comparison (optional) (default false)
 * @returns {bool}
 * 
 *  * Note that strict set to true would return false in the following:
 *  is_equal ({ foo : 'bar'}, { foo : 'bar'});
 */
_.prototype.is_equal = function(a, b, strict)
{    
    strict = this.is_undefined(strict) ? false : strict;

    if ((typeof a) !== (typeof b))
    {
        return false;
    }
    else if (this.is_string(a) || this.is_number(a) || this.is_bool(a) || this.is_null(a) || this.is_htmlElement(a))
    {
        return a === b;
    }
    else if (this.is_function(a))
    {        
        return strict ? a === b : this.__is_equal_func(a, b);
    }
    else if (this.is_array(a) || this.is_object(b))
    {
        if (strict)
        {
            if (a !== b || this.is_array(a) && !this.is_array(b))
            {
                return false;
            }
            
            return true;
        }
        
        return this.__is_equal_traverseable(a, b);
    }

    return true;
}

/**
 * Checks if two functions are equal
 * 
 * @param   {function}  a
 * @param   {function}  b
 * @returns {boolean}
 */
_.prototype.__is_equal_func = function(a, b)
{
    // Functions have the same name
    if (a.name === b.name)
    {
        // If the functions were bound or cloned by the library they can technically still be equal
        if (a.__isBound)
        {
            if (!b.__isBound) return false;

            if (!this.is_equal(a.__boundContext, b.__boundContext)) return false;
            
            if (!this.is_equal(a.__origional, b.__origional)) return false;
        }

        // Check string
        if (a.toString() !== b.toString()) return false;

        // Prototypes are different
        if (!this.__is_equal_protos(a, b)) return false;

        return true;
    }

    return false;
}

/**
 * Checks if object prototypes are equal
 * 
 * @param   {array} | object}  a
 * @param   {array} | object}  b
 * @returns {boolean}
 */
_.prototype.__is_equal_protos = function(a, b)
{
    // Check the prototypes
    let aProtos = this.prototypes(a);
    let bProtos = this.prototypes(b);

    if (aProtos.length !== bProtos.length) return false;

    if (aProtos.length === 0 && bProtos.length === 0) return true;

    let ret = true;

    this.each(aProtos, (i, proto) =>
    {                
        if (!this.is_equal(proto, bProtos[i]))
        {
            ret = false;

            return false;
        }

    }, this);

    return ret;
}


/**
 * Checks if traversable's are equal
 * 
 * @param   {array} | object}  a
 * @param   {array} | object}  b
 * @returns {boolean}
 */
_.prototype.__is_equal_traverseable = function(a, b)
{
    if (this.size(a) !== this.size(b))
    {
        return false;
    }

    let ret = true;

    this.each(a, function(i, val)
    {
        if (!this.is_equal(val, b[i]))
        {
            ret = false;

            return false;
        }
    }, this);

    if (!ret) return false;

    if (this.is_object(a)) return this.__is_equal_protos(a, b);

    return ret;
}

/**
 * Is function.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_function = function(mixed_var)
{
    return this.var_type(mixed_var) === FUNC_TAG;
}
/**
 * Checks if variable is HTMLElement.
 *
 * @param   {mixed}  mixed_var  Variable to evaluate
 * @returns {boolean}
 */
_.prototype.is_htmlElement = function(mixed_var)
{
    if (mixed_var && mixed_var.nodeType)
    {
        let type = this.var_type(mixed_var);

        return HTML_REGXP.test(type) || type === '[object HTMLDocument]' || type === '[object Text]' || type === '[object Comment]';
    }

    return false;
}
/**
 * Is valid JSON
 * 
 * @param  {mixed} str String JSON
 * @return {object|false}
 */
_.prototype.is_json = function(str)
{
    var obj;
    try
    {
        obj = JSON.parse(str);
    }
    catch (e)
    {
        return false;
    }
    return obj;
}


/**
 * Is Map.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_map = function(mixed_var)
{
    return this.var_type(mixed_var) === MAP_TAG;
}
/**
 * Is node type.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @param   {string} tag        Tag to compare
 * @returns {boolean}
 */
_.prototype.is_node_type = function(mixed_var, tag)
{
    return mixed_var.tagName.toUpperCase() === tag.toUpperCase();
}

/**
 * Is nodelist.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_nodelist = function(mixed_var)
{
    return this.var_type(mixed_var) === NODELST_TAG;
}
/**
 * Is null.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_null = function(mixed_var)
{
    return this.var_type(mixed_var) === NULL_TAG;
}
/**
 * Is number.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_number = function(mixed_var)
{
    return !isNaN(mixed_var) && this.var_type(mixed_var) === NUMBER_TAG;
}
/**
 * Is string.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_numeric = function(mixed_var)
{
    if (this.is_number(mixed_var))
    {
        return true;
    }
    else if (this.is_string(mixed_var))
    {
        return /^-?(0|[1-9]\d*)(\.\d+)?$/.test(mixed_var.trim());
    }

    return false;
}
/**
 * Checks if variable is an object.
 *
 * @param   {mixed}  mixed_var Variable to evaluate
 * @returns {boolean}
 */
_.prototype.is_object = function(mixed_var)
{
    return mixed_var !== null && this.var_type(mixed_var) === OBJECT_TAG;
}
/**
 * Is regexp.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_regexp = function(mixed_var)
{
    return this.var_type(mixed_var) === REGEXP_TAG;
}
/**
 * Is Set.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_set = function(mixed_var)
{
    return this.var_type(mixed_var) === SET_TAG;
}
/**
 * Is string.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_string = function(mixed_var)
{
    return this.var_type(mixed_var) === STRING_TAG;
}
/**
 * Is Symbol.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_symbol = function(mixed_var)
{
    return this.var_type(mixed_var) === SYMBOL_TAG;
}
/**
 * Is undefined.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {boolean}
 */
_.prototype.is_undefined = function(mixed_var)
{
    return this.var_type(mixed_var) === UNDEF_TAG;
}
/**
 * Returns array/object/string/number size.
 * 
 * @param   {mixed}  mixed_var  Variable to test
 * @returns {number}
 */
_.prototype.size = function(mixed_var)
{
    if (this.is_string(mixed_var) || this.is_array(mixed_var))
    {
        return mixed_var.length;
    }
    else if (this.is_number(mixed_var))
    {
        return mixed_var;
    }
    else if (this.is_bool(mixed_var))
    {
        return mixed_var === true ? 1 : -1;
    }
    else(this.is_object(mixed_var))
    {
        return Object.keys(mixed_var).length;
    }

    return 1;
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @public
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
_.prototype.var_type = function(value)
{
    if (value == null)
    {
        return value === undefined ? '[object Undefined]' : '[object Null]'
    }

    return TO_STR.call(value);
}
// Destructor
_.prototype.destruct = function()
{
    this.clear_event_listeners();
}

container.singleton('_', _);

})();

// frontbx core
(function()
{
    const EXCLUDED_SERVICES = ['services','boot','set','singleton','has','delete','get','import','bind','_setproto','_singletonfunc','_isinvokable','_isinvoked','_newinstance','_storeobj','_normalizekey','_is_func'];

    /**
     * Application core
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Application = function()
    {
        this.version_major = '0';

        this.version_minor = '0';

        this.version_patch = '2';

        this.version = `${this.version_major}.${this.version_minor}.${this.version_patch }`;
    }

    /**
     * Returns registered services.
     *
     * @access {public}
     * @return {Object}
     */
    Application.prototype.services = function()
    {
        let proto = this.prototype || Object.getPrototypeOf(this);

        let ret = {};

        for (let key in proto)
        {
            let val = proto[key];

            if (!EXCLUDED_SERVICES.includes(key.toLowerCase()) && {}.toString.call(val) === '[object Function]')
            {
                ret[key] = val;
            }
        }

        return ret;
    }

    /**
     * Called when the application is first initialized
     *
     * @access {public}
     */
    Application.prototype.boot = function()
    {
        this.dom().boot();

        this._().trigger_event(window, 'frontbx:ready', this);
    }

    /**
     * Get the DOM component
     *
     * @access {public}
     * @return {object}
     */
    Application.prototype.dom = function()
    {
        return this.Dom();
    }

    container._().trigger_event(window, 'frontbx:loading');

    FBX_ROOT.frontbx = container._().extend(container, new Application);

    container = undefined;

})();
(function()
{
    /**
     * Utility functions
     *
     * @var {Function}
     */
    const [each, trigger_event, collect_garbage, is_undefined, is_string, is_htmlElement] = frontbx.import(['each', 'trigger_event', 'collect_garbage', 'is_undefined', 'is_string', 'is_htmlElement']).from('_');

    /**
     * DOM Manager
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Dom = function()
    {
        this._isReady = false;

        this.components = [];
    }

    /**
     * Boot Dom
     *
     * @access {public}
     * @param {string} name   Name of the module
     * @param {object} module Uninvoked module object
     */
    Dom.prototype.boot = function()
    {
        this._dispatchReady();

        this._isReady = true;
    }

    /**
     * Register a DOM component
     *
     * @access {public}
     * @param {string} name   Name of the module
     * @param {object} module Uninvoked module object
     */
    Dom.prototype.register = function(name, component)
    {
        this.components.push(name);

        frontbx.singleton(name, component);

        this._bindComponent(name, document);
    }

    /**
     * Returns a component.
     *
     * @access {public}
     */
    Dom.prototype.component = function(name)
    {
        return frontbx.get(name);
    }

    /**
     * Returns a component.
     *
     * @access {public}
     */
    Dom.prototype.create = function(name, options, appendTo)
    {
        return this.component(name).create(options, appendTo);
    }

    /**
     * Boot Dom
     *
     * @access {public}
     * @param {string} name   Name of the module
     * @param {object} module Uninvoked module object
     */
    Dom.prototype._dispatchReady = function()
    {
        trigger_event(window, 'frontbx:dom:ready', {dom: this});
    }

    /**
     * Boot Dom
     *
     * @access {public}
     * @param {string} name   Name of the module
     * @param {object} module Uninvoked module object
     */
    Dom.prototype._dispatchComponent = function(name, event, component, context)
    {
        trigger_event(window, `frontbx:dom:${event}:${name}`, { component: component, context: context});
    }

    /**
     * Bind a single module
     *
     * @param {string} key Name of module to bind
     * @access {private}
     */
    Dom.prototype._bindComponent = function(name, context, isRefresh)
    {                
        let component = frontbx.get(name);

        if (this._hasMethod(component, 'construct') && isRefresh)
        {
            component.construct(context);
            
            this._dispatchComponent(name, 'refresh', component, context);
        }

        this._dispatchComponent(name, 'bind', component, context);
    }

    /**
     * Unbind a single module
     *
     * @param  {string}  key Name of module to unbind
     * @access {private}
     */
    Dom.prototype._unbindComponent = function(name, context)
    {            
        let component = frontbx.get(name);

        if (this._hasMethod(component, 'destruct'))
        {
            component.destruct(context);
        }

        this._dispatchComponent(name, 'unbind', component, context);
    }

    /**
     * Refresh the DOM modiules or a string module
     *
     * @access {public}
     * @param  {string}               name    Name of the module (optional) (default false)
     * @param  {DOMElement|undefined} context Context to refresh (default document)
     */
    Dom.prototype.refresh = function(component, context)
    {
        let globalRefresh = false;

        // refresh()
        if (arguments.length === 0)
        {
            component = false;

            context = document;

            globalRefresh = true;
        }
        else
        {
            // refresh(DOMElement)
            if (is_htmlElement(component))
            {
                context  = component;
                
                component = false;

                globalRefresh = true;
            }

            // refresh('module')
            // refresh('module', DOMElement)
            else if (is_string(component))
            {
                context = is_undefined(context) ? document : context;
            }
        }

        each(this.components, function(i, name)
        {
            if (!component || component === name)
            {
                this._unbindComponent(name, context);

                this._bindComponent(name, context, true);
            }
        }, this);

        collect_garbage();

        trigger_event(window, `frontbx:dom:refresh`, { context: context});

        if (globalRefresh) this._dispatchReady();
    }

    /**
     * Checks if a class object has a method by name
     *
     * @access {private}
     * @param  {mixed}  classObj The object instance or reference
     * @param  {string} method   The name of the method to check for
     * @return {bool}
     */
    Dom.prototype._hasMethod = function(classObj, method)
    {
        return typeof classObj === 'object' && typeof classObj[method] === 'function';
    }

    // Load into container and invoke
    frontbx.singleton('Dom', Dom);
    
})();
(function()
{
    const [find_all, each, map, traverse_up, is_empty, array_unique] = frontbx.import(['find_all','each','map','traverse_up','is_empty','array_unique']).from('_');

    /**
     * Component base class
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Component = function(selector)
    {
        /**
         * Default props.
         *
         * @var {object}
         */
        this.defaultProps = !this.defaultProps ? {} : this.defaultProps;

        /**
         * Selector.
         *
         * @var {string}
         */
        this._selector = selector;

        /**
         * Dom elements
         *
         * @var {array}
         */
        this._DOMElements = [];

        // Init
        if (!is_empty(this._selector)) this.construct(document);

        return this;
    }

    /**
     * Module constructor
     *
     * @access {public}
     */
    Component.prototype.construct = function(context)
    {
        if (is_empty(this._selector)) return;

        let nodes = map(find_all(this._selector, context, context !== document), (i, node) => !this._DOMElements.includes(node) ? node : false);

        if (!is_empty(nodes))
        {
            this._DOMElements = [...this._DOMElements, ...nodes];

            each(nodes, (i, node) => this.bind(node), this);
        }
    }

    /**
     * Module destructor
     *
     * @access {public}
     */
    Component.prototype.destruct = function(context)
    {
        if (!context || context === document)
        {
            each(this._DOMElements, (i, node) => this.unbind(node), this);
            
            this._DOMElements = [];

            return;
        }

        each(this._DOMElements, (i, DOMElement) =>
        {
            if (DOMElement === context)
            {
                this.unbind(DOMElement);

                this._DOMElements.splice(i, 1);
            }
            else
            {
                traverse_up(DOMElement, (parent) =>
                {                
                    if (parent === context)
                    {
                        this.unbind(DOMElement);

                        this._DOMElements.splice(i, 1);

                        return false;
                    }
                });
            }
        });
    }

    /**
     * Create DOM elements and bind
     * 
     */
    Component.prototype.create = function(props, appendTo)
    {
        props = !props ? {} : props;

        props = {...this.defaultProps, ...props};

        let node = this.render(props);

        if (appendTo) appendTo.appendChild(node);

        frontbx.Dom().refresh(node);

        return node;
    }

    /**
     * Template abstract method
     *
     * @access {public}
     */
    Component.prototype.render = function()
    {
        throw new Error('[render] method must be implemented.');
    }


    /**
     * Bind abstract method
     *
     * @access {public}
     */
    Component.prototype.bind = function(context)
    {
        throw new Error('[bind] method must be implemented.');
    }

    /**
     * Unbind abstract method
     *
     * @access {public}
     */
    Component.prototype.unbind = function(context)
    {
        throw new Error('[unbind] method must be implemented.');
    }

    // Register
    frontbx.set('Component', Component);

})();

// lazyload
/**
 * --------------------------------------------------------------------------
 * Frontbx Lazyload
 * 
 * @version  {0.0.4}
 * @see      {https://github.com/frontbx/ui}
 * @licensed {https://github.com/frontbx/ui/blob/main/LICENSE}
 * --------------------------------------------------------------------------
 */
(function()
{

    var root = typeof FBX_ROOT === 'undefined' ? (typeof process === 'object' && typeof global === 'object' ? global : window) : FBX_ROOT;

    if (!root.LAZY_FALLBACK_IMAGE)
    {
        root.LAZY_FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSI+CiAgPHBhdGggZD0iTTAgNCBMMCAyOCBMMzIgMjggTDMyIDQgeiBNNCAyNCBMMTAgMTAgTDE1IDE4IEwxOCAxNCBMMjQgMjR6IE0yNSA3IEE0IDQgMCAwIDEgMjUgMTUgQTQgNCAwIDAgMSAyNSA3Ij48L3BhdGg+Cjwvc3ZnPg==';
    }

    /**
     * JS Async Queue
     *
     * @see https://medium.com/@griffinmichl/asynchronous-javascript-queue-920828f6327
     */
    var Queue = function(concurrency)
    {
        this.running     = 0;
        this.concurrency = concurrency;
        this.taskQueue   = [];
        
        return this;
    }

    Queue.prototype.add = function(task)
    {
        if (this.running < this.concurrency)
        {
            this._runTask(task);
        }
        else
        {
            this._enqueueTask(task);
        }
    }

    Queue.prototype.next = function()
    {        
        this.running--;

        if (this.taskQueue.length > 0)
        {
            this._runTask(this.taskQueue.shift());
        }
    }

    Queue.prototype._runTask = function(task)
    {       
        this.running++;

        task(this);
    }

    Queue.prototype._enqueueTask = function(task)
    {
        this.taskQueue.push(task);
    }

    /**
     * Module constructor
     *
     * @access public
     * @constructor
     * @return this
     */
    const LazyLoad = function()
    {
        this._DOMElements = [];

        this.construct(document);       

        return this;
    }

    /**
     * Destroy
     *
     * @access public
     */
    LazyLoad.prototype.construct = function(context)
    {               
        this._queue = new Queue(15);

        let nodes = Array.prototype.slice.call(context.querySelectorAll('.js-lazyload'));

        if (nodes.length >= 1)
        {
            for (var i = 0; i < nodes.length; i++)
            {
                this.bind(nodes[i]);
            }

            this._DOMElements = [...this._DOMElements, ...nodes];
        }
    }

    /**
     * Destroy
     *
     * @access public
     */
    LazyLoad.prototype.destruct = function(context)
    {       
        if (!context || context === document)
        {            
            this._DOMElements = [];

            return;
        }

        const [each, closest] = frontbx.import(['each', 'closest']).from('_');

        each(this._DOMElements, function(i, DOMElement)
        {                
            if (closest(DOMElement, context))
            {
                this._DOMElements.splice(i, 1);
            }

        }, this);
    }

    /**
     * Bind and load images
     *
     * @access private
     */
    LazyLoad.prototype.bind = function(node)
    {
        var url = this._getSrc(node);

        if (this._canLoad(node))
        {
            this._loadImage(node, url, this._isImage(node));
        }
    }

    /**
     * Bind and load images
     *
     * @access private
     * @param  node    node    DOM node
     * @param  string  url     The image URL to load
     * @param  bool    isImage Is the node an <img> tag
     */
    LazyLoad.prototype._loadImage = function(node, url, isImage)
    {
        // Placeholder and image are the same
        if (isImage && node.src === url)
        {
            this._markLoaded(node);
        }
        else
        {
            this._queue.add(this._getLoadFunc(node, url, isImage));
        }
    }

    /**
     * Return the image load function
     *
     * @access private
     * @param  node    node       DOM node
     * @param  string  url        The image URL to load
     * @param  bool    isImage    Is the node an <img> tag?
     * @return function
     */
    LazyLoad.prototype._getLoadFunc = function(node, url, isImage)
    {
        const _this = this;

        let _fallback = LAZY_FALLBACK_IMAGE;

        return function loadImage(queue)
        {
            var _image = new Image();

            _image.onload = function()
            {
                if (isImage)
                {
                    node.src = url;
                }
                else
                {
                    node.style.backgroundImage = 'url('+ url +')';
                }

                _this._markLoaded(node);

                _image.onload  = {};
                _image.onerror = {};
                
                queue.next();
            };

            _image.onerror = function()
            {
                if (isImage)
                {
                    node.src = _fallback;
                }
                else
                {
                    node.style.backgroundImage = `url("${_fallback}")`;
                }

                _this._markFailed(node);

                queue.next();

                _image.onload  = {};
                _image.onerror = {};
            };

            _image.classList.add('lazy-loading');

            _image.src = url;
        };
    }

    /**
     * Mark node as loaded
     *
     * @access private
     * @param  node    node Image node element
     * @return string
     */
    LazyLoad.prototype._markFailed = function(node)
    {
        node.classList.add('failed');

        this._markLoaded(node);
    }

    /**
     * Mark node as loaded
     *
     * @access private
     * @param  node    node Image node element
     * @return string
     */
    LazyLoad.prototype._markLoaded = function(node)
    {
        node.classList.add('lazy-loaded');

        node.classList.remove('lazy-loading');
    }

    /**
     * Get an image's src attribute
     *
     * @access private
     * @param  node    node Image node element
     * @return string
     */
    LazyLoad.prototype._getSrc = function(node)
    {
        return node.getAttribute('data-src') || node.dataset.src;
    }

    /**
     * Should we load this image
     *
     * @access private
     * @param  node    node Image node element
     * @return bool
     */
    LazyLoad.prototype._canLoad = function(node)
    {
        return typeof this._getSrc(node) !== 'undefined' && (!node.classList.contains('lazy-loading') || !node.classList.contains('lazy-loaded'));
    }

    /**
     * Is node an image
     *
     * @access private
     * @param  node    node Image node element
     * @return bool
     */
    LazyLoad.prototype._isImage = function(node)
    {
        return node.nodeName.toLowerCase() === 'img';
    }

    if (!root.frontbx)
    {
        window.addEventListener('DOMContentLoaded', () =>
        {
            // Invoke and start loading images
            const lazy = new LazyLoad();

            // Listen for frontbx:ready and register into dom
            // Will not be invoked unless dom().refresh() is called
            frontbx.dom().register('LazyLoad', lazy, false);
        })
    }
    
})();

// vendors
(function()
{
        /* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress * @license MIT */
        var NProgress = {};

        NProgress.version = '0.2.0';

        var Settings = NProgress.settings = {
            minimum: 0.08,
            easing: 'linear',
            positionUsing: '',
            speed: 200,
            trickle: true,
            trickleSpeed: 200,
            showSpinner: true,
            barSelector: '[role="bar"]',
            spinnerSelector: '[role="spinner"]',
            parent: 'body',
            template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
        };

        /**
        * Updates configuration.
        *
        *     NProgress.configure({
        *       minimum: 0.1
        *     });
        */
        NProgress.configure = function(options) {
            var key, value;
            for (key in options) {
                value = options[key];
                if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
            }

            return this;
        };

    /**
    * Last number.
    */

        NProgress.status = null;

    /**
    * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
    *
    *     NProgress.set(0.4);
    *     NProgress.set(1.0);
    */

        NProgress.set = function(n) {
            var started = NProgress.isStarted();

            n = clamp(n, Settings.minimum, 1);
            NProgress.status = (n === 1 ? null : n);

            var progress = NProgress.render(!started),
            bar      = progress.querySelector(Settings.barSelector),
            speed    = Settings.speed,
            ease     = Settings.easing;

    progress.offsetWidth; /* Repaint */

            queue(function(next) {
    // Set positionUsing if it hasn't already been set
                if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

    // Add transition
                css(bar, barPositionCSS(n, speed, ease));

                if (n === 1) {
      // Fade out
                  css(progress, {
                    transition: 'none',
                    opacity: 1
                });
      progress.offsetWidth; /* Repaint */

                  setTimeout(function() {
                    css(progress, {
                      transition: 'all ' + speed + 'ms linear',
                      opacity: 0
                  });
                    setTimeout(function() {
                      NProgress.remove();
                      next();
                  }, speed);
                }, speed);
              } else {
                  setTimeout(next, speed);
              }
          });

            return this;
        };

        NProgress.isStarted = function() {
            return typeof NProgress.status === 'number';
        };

    /**
    * Shows the progress bar.
    * This is the same as setting the status to 0%, except that it doesn't go backwards.
    *
    *     NProgress.start();
    *
    */
        NProgress.start = function() {
            if (!NProgress.status) NProgress.set(0);

            var work = function() {
                setTimeout(function() {
                  if (!NProgress.status) return;
                  NProgress.trickle();
                  work();
              }, Settings.trickleSpeed);
            };

            if (Settings.trickle) work();

            return this;
        };

    /**
    * Hides the progress bar.
    * This is the *sort of* the same as setting the status to 100%, with the
    * difference being `done()` makes some placebo effect of some realistic motion.
    *
    *     NProgress.done();
    *
    * If `true` is passed, it will show the progress bar even if its hidden.
    *
    *     NProgress.done(true);
    */

        NProgress.done = function(force) {
            if (!force && !NProgress.status) return this;

            return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
        };

    /**
    * Increments by a random amount.
    */

        NProgress.inc = function(amount) {
            var n = NProgress.status;

            if (!n) {
                return NProgress.start();
            } else if(n > 1) {
                return;
            } else {
                if (typeof amount !== 'number') {
                  if (n >= 0 && n < 0.2) { amount = 0.1; }
                  else if (n >= 0.2 && n < 0.5) { amount = 0.04; }
                  else if (n >= 0.5 && n < 0.8) { amount = 0.02; }
                  else if (n >= 0.8 && n < 0.99) { amount = 0.005; }
                  else { amount = 0; }
              }

              n = clamp(n + amount, 0, 0.994);
              return NProgress.set(n);
          }
      };

      NProgress.trickle = function() {
        return NProgress.inc();
    };

    /**
    * Waits for all supplied jQuery promises and
    * increases the progress as the promises resolve.
    *
    * @param $promise jQUery Promise
    */
    (function() {
        var initial = 0, current = 0;

        NProgress.promise = function($promise) {
            if (!$promise || $promise.state() === "resolved") {
              return this;
          }

          if (current === 0) {
              NProgress.start();
          }

          initial++;
          current++;

          $promise.always(function() {
              current--;
              if (current === 0) {
                  initial = 0;
                  NProgress.done();
              } else {
                  NProgress.set((initial - current) / initial);
              }
          });

          return this;
      };

    })();

    /**
    * (Internal) renders the progress bar markup based on the `template`
    * setting.
    */

    NProgress.render = function(fromStart) {
        if (NProgress.isRendered()) return document.getElementById('nprogress');

        addClass(document.documentElement, 'nprogress-busy');

        var progress = document.createElement('div');
        progress.id = 'nprogress';
        progress.innerHTML = Settings.template;



        var bar = progress.querySelector(Settings.barSelector),
        perc = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
        parent = isDOM(Settings.parent)
        ? Settings.parent
        : document.querySelector(Settings.parent),
        spinner

        css(bar, {
            transition: 'all 0 linear',
            transform: 'translate3d(' + perc + '%,0,0)'
        });

        if (!Settings.showSpinner) {
            spinner = progress.querySelector(Settings.spinnerSelector);
            spinner && removeElement(spinner);
        }

        if (parent != document.body) {
            addClass(parent, 'nprogress-custom-parent');
        }

        parent.appendChild(progress);
        return progress;
    };

    /**
    * Removes the element. Opposite of render().
    */

    NProgress.remove = function() {
        removeClass(document.documentElement, 'nprogress-busy');
        var parent = isDOM(Settings.parent)
        ? Settings.parent
        : document.querySelector(Settings.parent)
        removeClass(parent, 'nprogress-custom-parent')
        var progress = document.getElementById('nprogress');
        progress && removeElement(progress);
    };

    /**
    * Checks if the progress bar is rendered.
    */

    NProgress.isRendered = function() {
        return !!document.getElementById('nprogress');
    };

    /**
    * Determine which positioning CSS rule to use.
    */

    NProgress.getPositioningCSS = function() {
    // Sniff on document.body.style
        var bodyStyle = document.body.style;

    // Sniff prefixes
        var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
        ('MozTransform' in bodyStyle) ? 'Moz' :
        ('msTransform' in bodyStyle) ? 'ms' :
        ('OTransform' in bodyStyle) ? 'O' : '';

        if (vendorPrefix + 'Perspective' in bodyStyle) {
    // Modern browsers with 3D support, e.g. Webkit, IE10
            return 'translate3d';
        } else if (vendorPrefix + 'Transform' in bodyStyle) {
    // Browsers without 3D support, e.g. IE9
            return 'translate';
        } else {
    // Browsers without translate() support, e.g. IE7-8
            return 'margin';
        }
    };

    /**
    * Helpers
    */

    function isDOM (obj) {
        if (typeof HTMLElement === 'object') {
            return obj instanceof HTMLElement
        }
        return (
            obj &&
            typeof obj === 'object' &&
            obj.nodeType === 1 &&
            typeof obj.nodeName === 'string'
            )
    }

    function clamp(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    }

    /**
    * (Internal) converts a percentage (`0..1`) to a bar translateX
    * percentage (`-100%..0%`).
    */

    function toBarPerc(n) {
        return (-1 + n) * 100;
    }


    /**
    * (Internal) returns the correct CSS for changing the bar's
    * position given an n percentage, and speed and ease from Settings
    */

    function barPositionCSS(n, speed, ease) {
        var barCSS;

        if (Settings.positionUsing === 'translate3d') {
            barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
        } else if (Settings.positionUsing === 'translate') {
            barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
        } else {
            barCSS = { 'margin-left': toBarPerc(n)+'%' };
        }

        barCSS.transition = 'all '+speed+'ms '+ease;

        return barCSS;
    }

    /**
    * (Internal) Queues a function to be executed.
    */

    var queue = (function() {
        var pending = [];

        function next() {
            var fn = pending.shift();
            if (fn) {
              fn(next);
          }
      }

      return function(fn) {
        pending.push(fn);
        if (pending.length == 1) next();
    };
    })();

    /**
    * (Internal) Applies css properties to an element, similar to the jQuery
    * css method.
    *
    * While this helper does assist with vendor prefixed property names, it
    * does not perform any manipulation of values prior to setting styles.
    */

    var css = (function() {
        var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],
        cssProps    = {};

        function camelCase(string) {
            return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {
              return letter.toUpperCase();
          });
        }

        function getVendorProp(name) {
            var style = document.body.style;
            if (name in style) return name;

            var i = cssPrefixes.length,
            capName = name.charAt(0).toUpperCase() + name.slice(1),
            vendorName;
            while (i--) {
              vendorName = cssPrefixes[i] + capName;
              if (vendorName in style) return vendorName;
          }

          return name;
      }

      function getStyleProp(name) {
        name = camelCase(name);
        return cssProps[name] || (cssProps[name] = getVendorProp(name));
    }

    function applyCss(element, prop, value) {
        prop = getStyleProp(prop);
        element.style[prop] = value;
    }

    return function(element, properties) {
        var args = arguments,
        prop,
        value;

        if (args.length == 2) {
          for (prop in properties) {
            value = properties[prop];
            if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
        }
    } else {
      applyCss(element, args[1], args[2]);
    }
    }
    })();

    /**
    * (Internal) Determines if an element or space separated list of class names contains a class name.
    */

    function hasClass(element, name) {
        var list = typeof element == 'string' ? element : classList(element);
        return list.indexOf(' ' + name + ' ') >= 0;
    }

    /**
    * (Internal) Adds a class to an element.
    */

    function addClass(element, name) {
        var oldList = classList(element),
        newList = oldList + name;

        if (hasClass(oldList, name)) return;

    // Trim the opening space.
        element.className = newList.substring(1);
    }

    /**
    * (Internal) Removes a class from an element.
    */

    function removeClass(element, name) {
        var oldList = classList(element),
        newList;

        if (!hasClass(element, name)) return;

    // Replace the class name.
        newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
        element.className = newList.substring(1, newList.length - 1);
    }

    /**
    * (Internal) Gets a space separated list of the class names on the element.
    * The list is wrapped with a single space on each end to facilitate finding
    * matches within the list.
    */

    function classList(element) {
        return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
    }

    /**
    * (Internal) Removes an element from the DOM.
    */

    function removeElement(element) {
        element && element.parentNode && element.parentNode.removeChild(element);
    }

    // Load into container 
    frontbx.singleton('NProgress', NProgress);

})();

// utility
// utility
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [each, is_function, is_object, is_empty, callable_name, array_filter] = frontbx.import(['each','is_function','is_object','is_empty','callable_name', 'array_filter']).from('_');

    /**
     * Named callbacks
     * 
     * @var {array}
     */
    const NAMED_CALLBACKS = ['success', 'error', 'complete', 'abort', 'progress'];

    /**
     * JS Queue
     *
     * @class
     * @see {https://medium.com/@griffinmichl/asynchronous-javascript-queue-920828f6327}
     */
    const Queue = function(concurrency)
    {
        this.running = 0;
        this.concurrency = concurrency;
        this.taskQueue = [];
    };

    Queue.prototype.add = function(task, _this, _args)
    {
        if (this.running < this.concurrency)
        {
            this._runTask(task, _this, _args);
        }
        else
        {
            this._enqueueTask(task, _this, _args);
        }
    }

    Queue.prototype.next = function()
    {
        this.running--;

        if (this.taskQueue.length > 0)
        {
            var task = this.taskQueue.shift();

            this._runTask(task['callback'], task['_this'], task['_args']);
        }
    }

    Queue.prototype._runTask = function(task, _this, _args)
    {
        this.running++;

        task.apply(_this, _args);
    }

    Queue.prototype._enqueueTask = function(task, _this, _args)
    {
        this.taskQueue.push(
        {
            'callback': task,
            '_this': _this,
            '_args': _args
        });
    }

    const AJAX_QUEUE = new Queue(15);

    /**
     * Module constructor
     *
     * @access {public}
     * @class
     */
    const Ajax = function()
    {
        this._settings =
        {
            'url': '',
            'async': true,
            'timeout': 10000,
            'headers':
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accepts': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
        };

        this._complete = () => {};
        this._success  = () => {};
        this._error    = () => {};
        this._abort    = () => {};
        this._progress = () => {};
        this._xhr      = null;
    }

    /**
     * Ajax Methods 
     *
     * @access {public}
     * @param  {string}        url     Destination URL
     * @param  {string|object} data    Data (optional)
     * @param  {function}      success Success callback (optional)
     * @param  {function}      error   Error callback (optional)
     * @param  {function}      abort   Abort callback (optional)
     * @param  {object}        headers Request headers (optional)
     * @return {this}
     */
    Ajax.prototype.post = function(url, data, success, error, complete, abort, headers)
    {
        this._setResponseHandlers('POST', url, data, success, error, complete, abort, headers);

        AJAX_QUEUE.add(this._call, this);

        return this;
    }
    Ajax.prototype.get = function(url, data, success, error, complete, abort, headers)
    {
        this._setResponseHandlers('GET', url, data, success, error, complete, abort, headers);

        AJAX_QUEUE.add(this._call, this);

        return this;
    }
    Ajax.prototype.head = function(url, data, success, error, complete, abort, headers)
    {
        this._setResponseHandlers('HEAD', url, data, success, error, complete, abort, headers);

        AJAX_QUEUE.add(this._call, this);

        return this;
    }
    Ajax.prototype.put = function(url, data, success, error, complete, abort, headers)
    {
        this._setResponseHandlers('PUT', url, data, success, error, complete, abort, headers);

        AJAX_QUEUE.add(this._call, this);

        return this;
    }
    Ajax.prototype.delete = function(url, data, success, error, complete, abort, headers)
    {
        this._setResponseHandlers('DELETE', url, data, success, error, complete, abort, headers);

        AJAX_QUEUE.add(this._call, this);

        return this;
    }
    Ajax.prototype.upload = function(url, data, success, error, complete, abort, progress, headers)
    {
        this._settings.async = true;

        this._setResponseHandlers('UPLOAD', url, data, success, error, complete, abort, headers, progress);

        AJAX_QUEUE.add(this._call, this);

        return this;
    }


    /**
     * Set async
     *
     * @param  {function}  callback Callback function
     * @return {this}
     */
    Ajax.prototype.async = function(bool)
    {
        this._settings.async = bool;

        return this;
    }

    /**
     * Adds headers
     *
     * @param  {object}  headers
     * @return {this}
     */
    Ajax.prototype.headers = function(_headers)
    {
        this._settings.headers = {...this._settings.headers, ..._headers};

        return this;
    }

    /**
     * Adds progress handler
     *
     * @param  {object}  headers
     * @return {this}
     */
    Ajax.prototype.progress = function(callback)
    {
        this._progress = callback;

        return this;
    }

    /**
     * Success function
     *
     * @param  {function}  callback Callback function
     * @return {this}
     */
    Ajax.prototype.success = function(callback)
    {
        this._success = callback;

        return this;
    }

    /**
     * Error function
     *
     * @param  {function}  callback Callback function
     * @return {this}
     */
    Ajax.prototype.error = function(callback)
    {
        this._error = callback;

        return this;
    }

    /**
     * Alias for complete
     *
     * @param  {function}  callback Callback function
     * @return {this}
     */
    Ajax.prototype.then = function(callback)
    {
        return this.complete(callback);
    }

    /**
     * Complete function
     *
     * @param  {function}  callback Callback function
     * @return {this}
     */
    Ajax.prototype.complete = function(callback)
    {
        this._complete = callback;

        return this;
    }

    /**
     * Abort an ajax call
     *
     * @param  {function}  callback Callback function
     * @return {this}
     */
    Ajax.prototype.abort = function(callback)
    {
        let xhr = this._xhr;

        // Called before XHR request
        if (!xhr)
        {
            this._abort = callback;

            return this;
        }

        // Already completed
        if (!xhr.readyState >= 4)
        {
            return this;
        }

        xhr.onreadystatechange = () => {};
        this._complete = null;
        this._success  = null;
        xhr.abort();

        this._makeCallback(this._abort, this, [xhr.responseText, false]);

        this._makeCallback(this._error, this, [xhr.responseText]);
    }

    /**
     * Call callback function
     *
     * @param  {function}  callback Callback function
     * @return {this}
     */
    Ajax.prototype._makeCallback = function(callback, _this, args)
    {
        if (is_function(callback)) callback.apply(_this, args);
    }

    /**
     * Ajax call 
     *
     * @access {private}
     * @param  {string}        method   Request method
     * @param  {string}        url      Destination URL
     * @param  {string|object} data     Data (optional)
     * @param  {function}      success  Success callback (optional)
     * @param  {function}      error    Error callback (optional)
     * @param  {function}      complete Complete callback (optional)
     * @param  {function}      abort    Abort callback (optional)
     * @param  {object}        headers  Request headers (optional)
     * @return {this}
     */
    Ajax.prototype._call = function()
    {
        let [method, url] = [this.method, this.url];

        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

        this._xhr = xhr;

        xhr.requestURL = url;

        xhr.mthod = method === 'UPLOAD' ? 'POST' : method;

        if (method === 'UPLOAD' && is_function(this._progress))
        {
            xhr.upload.addEventListener('progress', this._progress, false);
        }

        if (method === 'UPLOAD')
        {
            if (is_function(this._progress)) xhr.upload.addEventListener('progress', this._progress, false);

            if (is_function(this._complete)) xhr.upload.addEventListener('load', this._complete, false);
        }

        xhr.open(method, url, this._settings.async);

        xhr.timeout = this._settings.timeout;

        this._sendHeaders();

        if (this._settings.async)
        {
            xhr.onreadystatechange = () => { this._ready() };

            xhr.send(this.data || null);
        }
        else
        {
            xhr.send(this.data || null);

            this._ready();
        }

        return this;
    }

    /**
     * Send XHR headers
     *
     * @access {private}
     * @param  {object}    xhr     XHR object
     * @param  {object}    headers Request headers (optional)
     * @return {This}
     */
    Ajax.prototype._sendHeaders = function()
    {
        if (this.method === 'POST') this._settings.headers['REQUESTED-WITH'] = 'XMLHttpRequest';

        each(this._settings.headers, (k,v) => this._xhr.setRequestHeader(k, v));
    }

    /**
     * Normalise arguments from original call function
     *
     * @param  {string}        method   Request method
     * @param  {string}        url      Destination URL
     * @param  {string|object} data     Data (optional)
     * @param  {function}      success  Success callback (optional)
     * @param  {function}      error    Error callback (optional)
     * @param  {function}      complete Complete callback (optional)
     * @param  {function}      error    Abort callback (optional)
     * @param  {object}        headers  Request headers (optional)
     * @return {This}
     */
    Ajax.prototype._setResponseHandlers = function()
    {
        // Cleanup
        let args    = Array.prototype.slice.call(arguments);
        let method  = args.shift();
        let url     = args.shift();
        let data    = is_object(args[0]) ? args.shift() : null;
        let headers = null;
        let argmap  = ['success', 'error', 'complete', 'abort', 'headers', 'progress'];
        
        each(args, (i, arg) =>
        {
            if (is_function(arg))
            {
                let funcname = callable_name(arg).toLowerCase();

                let k = NAMED_CALLBACKS.includes(funcname) ? funcname : argmap[i];

                this[k](arg);
            }
            else if (is_object(arg))
            {
                this.headers(arg);
            }
        });

        // Ajax.get('foo.com?foo=bar&baz')
        if (is_object(data) && !is_empty(data))
        {
            if (method === 'UPLOAD')
            {
                let form = new FormData();

                each(data, (k, v) => form.append(k, v, v.type));

                data = form;
            }
            else if (method !== 'POST')
            {   
                let suffix = url.includes('?') ? '&' : '?';
                let params = this._params(data);
                url  = `${url}${suffix}${params}`;
                data = undefined;
            }
            else
            {
                data = this._params(data);
            }
        }

        this.method = method;
        this.data   = data;
        this.url    = url;
    }

    /**
     * Ready callback
     *
     * @param  {XMLHttpRequest} xhr     XHR Object
     * @param  {function}      success  Success callback (optional)
     * @param  {function}      error    Error callback (optional)
     * @param  {function}      complete Complete callback (optional)
     * @param  {function}      abort    Abort callback (optional)
     */
    Ajax.prototype._ready = function()
    {        
        let xhr = this._xhr;

        if (xhr.readyState == 4)
        {
            let successfull = xhr.status >= 200 && xhr.status < 300 || xhr.status === 304;

            let response = xhr.responseText;

            this._makeCallback(successfull ? this._success : this._error, xhr, [response]);

            this._makeCallback(this._complete, xhr, [response, successfull]);

            // Next queue
            AJAX_QUEUE.next();
        }
    }

    /**
     * Converts parameters to string
     *
     * @param  {Object} obj
     * @return {String}
     */
    Ajax.prototype._params = function(obj)
    {
        let s = [];

        each(obj, (k,v) => s.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)))

        return s.join('&');
    }

    frontbx.set('Ajax', Ajax);
})();
(function()
{
    /**
     * Helper functions.
     * 
     * @var {Function}
     */
    const [on, add_class, remove_class, animate, css, dom_element, each, find, find_all, first_children, height, in_array, in_dom, inline_style, inner_HTML, is_empty, is_string, map, normalize_url, remove_from_dom, rendered_style, scroll_pos, trigger_event, width, is_object, is_htmlElement] = frontbx.import(['on','add_class','remove_class','animate','css','dom_element','each','find','find_all','first_children','height','in_array','in_dom','inline_style','inner_HTML','is_empty','is_string','map','normalize_url','remove_from_dom','rendered_style','scroll_pos','trigger_event','width','is_object','is_htmlElement']).from('_');
    
    /**
     * Are we listening for state changes ?
     * 
     * @var {bool}
     */
    var POP_LISTENING = false;
    
    /**
     * Default options
     * 
     * @var {object}
     */
    const DEFAULT_OPTIONS = 
    {
        element:   'body',
        nocache:    false,
        once:       false,
        scrolltop:  false,
        pushstate:  false,
        urlhash:    false,
        animate:    false,
    };
    
    /**
     * Wrappers that need "position:relative" to hide overflow.
     * 
     * @var {Array}
     */
    const STATIC_POSITIONS = ['static', 'unset', 'initial'];
    
    /**
     * AnimationTimeout
     * 
     * @var {Object}
     */
    const CURRENT_REQUESTS = new Map;
    
    /**
     * AnimationTimeout
     * 
     * @var {Object}
     */
    const TRANSITION_TIMERS = new Map;
    /**
     * Pjax component
     *
     * @class
     * @extends   {Ajax}
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Pjax = function()
    {
        this.completed = false;
        
        if (!POP_LISTENING)
        {
            on(window, 'popstate', this._popStateHandler, this);
    
            POP_LISTENING = true;
        }
    }
    
    /**
     * Normalise provided options.
     *
     * @access {private}
     * @param  {String}  URL     Request url
     * @param  {Object}  options User options
     * @return {Object}
     */
    Pjax.prototype._normalizeOptions = function(url, options)
    {
        // Store URL in options for callbacks
        url = normalize_url(url.trim());
    
        // Merge options with defaults
        return typeof options === 'undefined' ? { ...DEFAULT_OPTIONS, url  } : { ...DEFAULT_OPTIONS, ...options, url };
    }
    
    /**
     * Returns the element from provided options.
     *
     * @access {private}
     * @return {HTMLElement}
     */
    Pjax.prototype._optionsElement = function()
    {
        let element = this.options.element;
    
        if (is_htmlElement(element))
        {
            if (element === document || element === document.documentElement)
            {
               return document.body;
            }
    
            return element;
        }
    
        if (is_string(element)) return find(element);
    
        return element;
    }
    Pjax.prototype.request = function(url, options, success, error, complete, abort, headers)
    {
        // Create ajax instance
        this.ajax = frontbx.Ajax();
    
        // Normalise options
        options = this._normalizeOptions(url, options);
    
        // Cache options
        this.options = options;
    
        // cache headers
        this.headers = !is_object(headers) ? { 'X-PJAX': true } : { 'X-PJAX': true, ...headers };
    
        // If we are already loading a pjax, cancel it and
        this._preAbort();
    
        // Set current request
        CURRENT_REQUESTS.set(options.element, this.ajax);
    
        // Cache user defined callbacks
        this.callbacks = { success, error, complete, abort };
    
        // Cache current state
        this._saveState();
    
        // Fire the start event
        trigger_event(window, 'frontbx:pjax:start', options);
    
        // Start nprogress
        frontbx.NProgress().start();
    
        this._sendAjax();
    }
    
    Pjax.prototype._sendAjax = function()
    {
        let options = this.options;
    
        this.ajax.headers(this.headers)
        
        .success((response) => this._onsuccess(response.trim()))
    
        .error((response) => this._onerror(response))
        
        .abort((response) => this._onabort(response))
        
        .complete((response, successfull) => this._oncomplete(response, successfull))
        
        .get(options.url, options.nocache ? { t: Date.now().toString() } : {});
    }
    /**
     * Insert response.
     *
     * @access {private}
     * @param  {string}  HTML HTML string response from server
     */
    Pjax.prototype._insertResponse = function(HTML)
    {
        // Parse the HTML
        this._parseResponse(HTML);
    
        // Update meta
        this._updateMeta();
    
        // Insert content
        if (this.options.animate)
        {
            this._animateSwap(this._targetElem, this._responseElem);
        }
        else
        {
            inner_HTML(this._targetElem, this._responseElem.innerHTML);
    
            this._appendScripts();
        }
    }
    
    /**
     * Parse response from server.
     *
     * @access {private}
     * @param  {string}  HTML HTML string response from server
     */
    Pjax.prototype._parseResponse = function(HTML)
    {
        let responseDoc = this._parseHTML(HTML);
    
        this._responseTitle = this._findDomTitle(responseDoc);
    
        this._responseDesc = this._findDomDesc(responseDoc);
    
        let currScripts = this._getScripts(document);
    
        let newScripts = this._getScripts(responseDoc);
    
        this._newScripts = this._scriptsDiff(currScripts, newScripts);
    
        this._responseDoc = this._removeScripts(responseDoc);
    
        // Move scripts to head incase we're replacing content
        each(currScripts, (i, script) => script.node.parentNode.nodeName.toLowerCase() !== 'head' ? find('head').appendChild(script.node) : null);
    
        this._findElems();
    }
    
    /**
     * Finds target and response DOM elements.
     *
     * @access {private}
     */
    Pjax.prototype._findElems = function()
    {
        // Default to document bodys
        let targetEl   = this._optionsElement();
        let responseEl = this._responseDoc.body;
        let selector   = this.options.element;
    
        // Html element
        if (is_htmlElement(selector) && selector !== document && selector !== document.documentElement)
        {
            responseEl = find(selector.id, this._responseDoc);
        }
    
        if (is_string(selector) && selector !== 'body')
        {
            targetEl = find(selector);
    
            // Try to find the target element in the response
            let tmpResponseEl = find(selector, this._responseDoc);
    
            if (tmpResponseEl) responseEl = tmpResponseEl;
    
        }
    
        this._targetElem   = targetEl;
        this._responseElem = responseEl;
    }
    
    /**
     * Append new scripts.
     * 
     * Note that appending or replacing content via 'innerHTML' or even
     * native Nodes with scripts inside their 'innerHTML'
     * will not load scripts so we need to compare what scripts have loaded
     * on the current page with any scripts that are in the new DOM tree 
     * and load any that don't already exist
     *
     * @access {private}
     */
    Pjax.prototype._appendScripts = function()
    {
        if (this._newScripts.length > 0)
        {
            return each(scripts, (i, script) =>  this._appendScript(script, i === scripts.length -1));
        }
    
        this._contentComplete();
    }
    
    /**
     * Append individual script or stylsheet.
     *
     * @access {private}
     * @param  {Object}  scriptObj Parse script config
     * @param  {Boolean} isLast    Is this the last script to load
     */
    Pjax.prototype._appendScript = function(scriptObj, isLast)
    {
        let element = document.createElement(scriptObj.type);
    
        element.type = scriptObj.type === 'script' ? 'text/javascript' : 'text/css';
    
        if (scriptObj.type === 'script')
        {
            element.async = false;
    
            if (!scriptObj.inline)
            {
                element.src = scriptObj.src;
    
                if (isLast) element.onload = () => this._contentComplete();
            }
            else
            {
                element.innerHTML = scriptObj.src;
    
                if (isLast) this._contentComplete()
            }
        }
        else
        {
            element.rel = 'stylesheet';
            
            element.href = scriptObj.src;
    
            if (isLast) element.onload = () => this._contentComplete();
        }
    
        find('head').appendChild(element);
    }
    
    /**
     * Filter scripts with unique key/values into an array
     *
     * @access {private}
     * @param  {Document}  doc Document element
     * @return {array}
     */
    Pjax.prototype._getScripts = function(doc)
    {
        var ret     = [];
        var scripts = find_all('script, link[rel=stylesheet]', doc);
    
        each(scripts, function(i, script)
        {
            let type    = script.nodeName.toLowerCase();
            let src     = type === 'link' ? normalize_url(script.getAttribute('href')) : normalize_url(script.getAttribute('src'));
            let inline  = false;
            let content = null;
            let node    = script;
    
            if (!src)
            {
                inline  = true;
                src     = null;
                content = script.innerHTML.trim()
            }
    
            ret.push({type, src, inline, node, content });
        });
    
        return ret;
    }
    
    /**
     * Remove all scripts from a document
     *
     * @access {private}
     * @param  {Document} doc Document element
     * @return {Document}
     */
    Pjax.prototype._removeScripts = function(doc)
    {
        var scripts = find_all('script, link[rel=stylesheet]', doc);
    
        each(scripts, (i, script) => script.parentNode.removeChild(script));
    
        return doc;
    }
    
    /**
     * Try to find the page title in a DOM tree.
     *
     * @access {private}
     * @param  {Document}     doc Document element
     * @return {string|false}
     */
    Pjax.prototype._findDomTitle = function(doc)
    {
        var title = doc.getElementsByTagName('title');
    
        if (title.length)
        {
            return title[0].innerHTML.trim();
        }
    
        return false;
    }
    
    /**
     * Try to find the page meta description.
     *
     * @access {private}
     * @param  {Document}     doc Document element
     * @return {string|false}
     */
    Pjax.prototype._findDomDesc = function(doc)
    {
        var desc = find('meta[name=description]', doc);
    
        if (desc)
        {
            return desc.content.trim();
        }
    
        return false;
    }
    
    /**
     * Parse HTML from string into a document
     *
     * @access {private}
     * @param  {string}    html HTML as a string (with or without full doctype)
     * @return {Document}
     */
    Pjax.prototype._parseHTML = function(html)
    {
        var parser = new DOMParser();
    
        return parser.parseFromString(html, 'text/html');
    }
    
    /**
     * Diff current scripts with new scripts
     *
     * @access {private}
     * @param  {Array}   currScripts Parsed current scripts array
     * @param  {Array}   newScripts  Parsed new scripts array
     * @param  {Array}
     */
    Pjax.prototype._scriptsDiff = function(currScripts, newScripts)
    {
        return map(newScripts, (j, script) =>
        {
            let ret = script;
    
            each(currScripts, (i, cScript) =>
            {   
                // Inline scripts
                if (script.inline && cScript.inline && cScript.content === script.content)
                {
                    currScripts.splice(i, 1);
    
                    ret = false;
    
                    return false;
                }
                if (!script.inline && !cScript.inline && cScript.src === script.src)
                {
                    currScripts.splice(i, 1);
    
                    ret = false;
    
                    return false;
                }
            });
    
            return ret;
        });
    }
    
    /**
     * Updated Meta title and description.
     *
     * @access {private}
     */
    Pjax.prototype._updateMeta = function()
    {
        let descrMeta = find('meta[name=description]');
    
        if (this._responseTitle) document.title = this._responseTitle;
    
        if (this._responseDesc && descrMeta) descrMeta.content = this._responseDesc;
    }
    
    Pjax.prototype._onsuccess = function(response)
    {
        this._insertResponse(response);
    
        trigger_event(window, 'frontbx:pjax:success', this.options);
    
        this.ajax._makeCallback(this.callbacks.success, this._xhr, [response]);
    }
    
    Pjax.prototype._onerror = function(response)
    {
        trigger_event(window, 'frontbx:pjax:abort', this.options);
    
        this.ajax._makeCallback(this.callbacks.error, this._xhr, [response, false]);
    }
    
    Pjax.prototype._onabort = function(response)
    {
        let selector = this.options.element;
        
        let swapTimer = TRANSITION_TIMERS.get(selector);
    
        if (swapTimer) clearTimeout(swapTimer);
    
        CURRENT_REQUESTS.delete(selector);
    
        TRANSITION_TIMERS.delete(selector);
    
        if (this._abortAnimations) this._abortAnimations();
    
        frontbx.NProgress().done();
    
        trigger_event(window, 'frontbx:pjax:abort', this.options);
    
        this.ajax._makeCallback(this.callbacks.abort, this._xhr, [response, false]);
    }
    
    Pjax.prototype._oncomplete = function(response, successfull)
    {
        if (this.options.scrolltop) animate(window, { property : 'scrollTo', to: '0, 0', duration: 150, callback: () => this._pushState() });
    
        trigger_event(window, 'frontbx:pjax:complete', this.options);
    
        this.ajax._makeCallback(this.callbacks.complete, this._xhr, [response, successfull]);
    
        frontbx.NProgress().done();
    }
    
    Pjax.prototype._contentComplete = function()
    {
        if (!this.options.scrolltop) this._pushState(); 
       
        CURRENT_REQUESTS.delete(this.options.element);
    
        TRANSITION_TIMERS.delete(this.options.element);
    
        let _elem = this._optionsElement();
    
        frontbx.dom().refresh(_elem === document.body ? document : _elem);
    
        this.completed = true;
    }
    
    Pjax.prototype._preAbort = function()
    {
        let ajax = CURRENT_REQUESTS.get(this.options.element);
    
        if (ajax) ajax.abort();
    }
    /**
     * Fades / in out content.
     *
     * 
     * @access {private}
     */
    Pjax.prototype._animateSwap = function(target, content)
    {
        // Cache wrapper height and width and so we can transition content without changing layout
        const h           = height(target);
        const w           = width(target);
        const padW        = width(target, true);
        const padH        = height(target, true);
        const padL        = parseInt(rendered_style(target, 'padding-left'));
        const padT        = parseInt(rendered_style(target, 'padding-top'));
        const position    = rendered_style(target, 'position');
        const InlOverflow = inline_style(target, 'overflow') || false;
        const InlPosition = inline_style(target, 'overflow') || false;
        const InlHeight   = inline_style(target, 'height') || false;
        const InlWidth    = inline_style(target, 'width') || false;
        const InlStyles   = { overflow: InlOverflow, position: InlPosition, height: InlHeight, width: InlWidth };
        const newStyles   = { overflow: 'hidden', height: `${h}px`, width: `${w}px` };
        const tmpStyles   = { left: `${padL}px`, top: `${padT}px`, height: `${padH}px`, width: `${padW}px` };
    
        if (STATIC_POSITIONS.includes(position)) newStyles.position = 'relative';
    
        // Cache content for afterwards
        const oldContnet = first_children(target);
        const newContent = first_children(content);
    
        // Prep content for inserting
        let tempWrapper = dom_element({tag: 'div', class: 'pjax-temp-swap-wrapper', style: tmpStyles}, null, newContent);
    
        // Fix dimensions, overflow and positioning while transition.
        css(target, newStyles);
    
        // Add wrapper class to position content swap while transitioning
        add_class(target, 'pjax-swapping-content');
    
        // Transition out
        each(oldContnet, (i, node) => add_class(node, 'pjax-prev-content'));
    
        // Finally append content
        target.appendChild(tempWrapper);
    
        // Offset height for CSS transitions
        tempWrapper.offsetHeight;
    
        // Activate animation
        add_class(target, 'active');
    
        // On complete
        let completedTransition = setTimeout(() =>
        {
            // Remove old content
            each(oldContnet, (i, child) => remove_from_dom(child));
    
            // Move new content to direct child
            each(newContent, (i, child) => target.appendChild(child));
    
            // Remove the temp wrapper
            if (tempWrapper.parentNode) tempWrapper.parentNode.removeChild(tempWrapper);
    
            // Remove pjax swap class on parent
            remove_class(target, ['pjax-swapping-content', 'active']);
    
            // Set inline styles back to original
            css(target, InlStyles);
    
            // Append scripts
            this._appendScripts();
    
        }, 500);
    
        this._abortAnimations = () =>
        {
            if (tempWrapper.parentNode) tempWrapper.parentNode.removeChild(tempWrapper);
    
            remove_class(target, ['pjax-swapping-content', 'active']);
    
            css(target, InlStyles);
        }
    
        // Wait for transition to end
        TRANSITION_TIMERS.set(target, completedTransition);
    }
    /**
     * State change event handler (back/forward clicks)
     *
     * Popstate is treated as another pjax request essentially
     * 
     * @access {private}
     * @param  {e}       event JavaScript 'popstate' event
     */
    Pjax.prototype._popStateHandler = function(e)
    {
        // State obj exists 
        if (e.state && typeof e.state.id !== 'undefined')
        {
            let options = e.state;
    
            this.request(options.id, {...options, nocache: false, pushstate: false });
    
            return false;
        }
    }
    
    /**
     * Push state after complete.
     *
     * @access {private}
     */
    Pjax.prototype._pushState = function()
    {    
        if (this.options.pushstate)
        {            
            let state = { ...this.options, id: this.options.url, scrolltop: false, scroll: scroll_pos() };
    
            window.history.pushState(state, '', state.id);
        }
        // Adjust hash
        else if (this.options.urlhash)
        {
            let url = window.location.href.split('#').shift();
    
            window.history.replaceState({}, '', `${url}#${this._optionsElement().id}`);
        }
    }
    
    /**
     * Save state before requesting.
     *
     * @access {private}
     */
    Pjax.prototype._saveState = function()
    {    
        if (this.options.pushstate)
        {            
            let state = { ...this.options, id: normalize_url(window.location.href), scrolltop: false, scroll: scroll_pos() };
    
            window.history.pushState(state, '', state.id);
        }
        // Adjust hash
        else if (this.options.urlhash)
        {
            window.history.replaceState({}, '', window.location.href);
        }
    }

    frontbx.set('Pjax', Pjax);

})();
(function()
{
    /**
     * 
     * @var {Helper} obj
     */
    const [find, each, _for, is_array, is_object, in_array, is_undefined, is_callable, is_htmlElement, in_dom, is_empty, animate, add_class, remove_class, width, height, inline_style, rendered_style, css, is_array_last, dom_element] = frontbx.import(['find','each','for','is_array', 'is_object', 'in_array','is_undefined','is_callable','is_htmlElement','in_dom','is_empty','animate', 'add_class','remove_class', 'width', 'height', 'inline_style', 'rendered_style', 'css', 'is_array_last','dom_element']).from('_');

    /**
     * Wrappers that need "position:relative" to hide overflow.
     * 
     * @var {array}
     */
    const STATIC_POSITIONS = ['static', 'unset', 'initial'];

    /**
     * Default options.
     * 
     * @var {array}
     */
    const DEFAULT_OPTIONS =
    {
        count: 1,
        lines: 0,
        height: null,
        width: null,
        variant: 'block',
        aspectratio: '',

    };

    /**
     * Class variants.
     * 
     * @var {array}
     */
    const CLASS_VARIANTS = ['block', 'text', 'btn', 'input', 'circle', 'wave', 'rounded', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

    /**
     * Class variants.
     * 
     * @var {array}
     */
    const WRAPPER_VARIANTS = ['text-block', 'block-h1', 'block-h2', 'block-h3', 'block-h4', 'block-h5', 'block-h6'];

    /**
     * Skeleton.
     *
     * @param  {DOMElement}   DOMElement Target node
     * @param  {object|array} options
     * @return {this}
     */
    const Skeleton = function(DOMElement, options)
    {
    this._DOMElement = DOMElement;

    this._nodes = [];

    this._isMulti = is_array(options);

    if (is_empty(options)) return this;

    if (is_array(options))
    {
        each(options, function(i, optionSet)
        {
            optionSet = {...DEFAULT_OPTIONS, ...optionSet};

            this._build(optionSet);

        }, this);
    }
    else
    {
        options = {...DEFAULT_OPTIONS, ...options};

        this._build(options);
    }
    }

    /**
     * Gracefully individual content
     * 
     * @param  {DOMElement|String} content
     * @param  {function|null}     callback
     * @access {public}
     */
    Skeleton.prototype.load = function(content, callback, wrapper)
    {
        if (is_object(content))
        {
            each(content, (selector, node) => 
            {
                let cb = is_array_last(node, content) ? callback : null;

                this.load(node, cb, find(selector, this._DOMElement));

            }, this);

            return;
        }

        wrapper = !wrapper ? this._DOMElement : wrapper;
        const isHTML  = is_htmlElement(content);
        
        // Cache wrapper height and width and so we can transition content without changing layout
        const h           = height(wrapper);
        const w           = width(wrapper);
        const position    = rendered_style(wrapper, 'position');
        const InlOverflow = inline_style(wrapper, 'overflow') || false;
        const InlPosition = inline_style(wrapper, 'overflow') || false;
        const InlHeight   = inline_style(wrapper, 'height') || false;
        const InlWidth    = inline_style(wrapper, 'width') || false;
        const InlStyles   = { overflow: InlOverflow, position: InlPosition, height: InlHeight, width: InlWidth };
        const newStyles   = { overflow: 'hidden', height: `${h}px`, width: `${w}px` };
        if (in_array(position, STATIC_POSITIONS)) newStyles.position = 'relative';

        // Prep content for inserting
        var isFragment = false;
        var oldContnet;

        if (isHTML)
        {
            add_class(content, 'swapping-content-wrapper');
        }
        else
        {
            let div    = dom_element({tag: 'div', class: 'swapping-content-wrapper'}, null, content);
            isFragment = div.children.length > 1;
            if (isFragment) div.className += ' fragment';
            oldContnet = content;
            content    = div;
        }

        const _this = this;

        const complete = function()
        {
            // Make optional user callback
            if (is_callable(callback))
            {
                callback();
            }

            // If we wrapped 'content' we need to remove the outer '.swapping-content-wrapper'
            if (!isHTML)
            {
                if (isFragment)
                {
                    wrapper.innerHTML = '';

                    dom_element(null, wrapper, oldContnet);
                }
                else
                {
                    wrapper.replaceChild(content.children[0], content);
                }
            }
            else
            {
                remove_class(content, 'swapping-content-wrapper');
            }

            // Remove skeletons
            each(_this._nodes, function(i, node)
            {
                if (in_dom(node)) node.parentNode.removeChild(node);                    
            });

            // Set inline styles back to original
            css(wrapper, InlStyles);

            // Remove wrapper classes
            remove_class(wrapper, 'skeleton-swapping-content');
        }

        // Fix dimensions, overflow and positioning while transition.
        css(wrapper, newStyles);

        // Add wrapper class to position content swap while transitioning
        add_class(wrapper, 'skeleton-swapping-content');

        // Finally append content
        wrapper.appendChild(content);

        each(this._nodes, function(i, node)
        {
            animate(node, { property : 'opacity', to : 0, duration: 500 });
        });

        animate(content, { property : 'opacity', from: '0', to : '1', duration: 750, callback: complete});
    }

    /**
     * Remove and destroy
     *
     * @params {function} callback (optional)
     * @params {boolean}  destroy  (optional default true)
     * @access {private}
     */
    Skeleton.prototype.fade_out = function(callback, destroy)
    {
        destroy = is_undefined(destroy) ? true : destroy;
        
        let _this = this;

        const complete = function()
        {
            if (destroy)
            {
                _this.destroy();
            }

            if (is_callable(callback))
            {
                callback();
            }
        }

        let madeCallback = false;

        each(this._nodes, function(i, node)
        {
            let _callback = madeCallback ? undefined : complete;

            animate(node, { property : 'opacity', to : 0, duration: 500, callback: complete});

            madeCallback = true;
        });
    }

    /**
     * Remove and destroy
     *
     * @params {_node} node
     * @access {private}
     */
    Skeleton.prototype.destroy = function()
    {
        each(this._nodes, function(i, node)
        {
            node.parentNode.removeChild(node);
        });

        this._nodes = [];
    }

    /**
     * Remove a notification
     *
     * @params {_node} node
     * @access {private}
     */
    Skeleton.prototype._build = function(options)
    {
        let wrapper    = null;
        let skeleton   = document.createElement('div');
        let variants   = options.variant.split(' ').map((x) => x.trim().toLowerCase()).filter((x) => x !== '');
        let DOMElement = options.selector ? find(options.selector, this._DOMElement) : this._DOMElement;
        let width      = options.width;
        let height     = options.height;
        let classes    = ['skeleton'];

        each(variants, function(i, variant)
        {
            if (in_array(variant, CLASS_VARIANTS))
            {
                classes.push(`skeleton-${variant}`);
            }
            else if (in_array(variant, WRAPPER_VARIANTS))
            {
                classes = ['skeleton'];

                if (!wrapper)
                {
                    wrapper = document.createElement('div');
                    wrapper.className = options.lines > 1 ? 'skeleton-text-block skeleton-lines' : 'skeleton-text-block' ;
                }

                if (variant !== 'text-block')
                {
                    wrapper.className += ` skeleton-text-${variant}`;
                }
            }
        });

        skeleton.className = classes.join(' ');

        let skeletons = [skeleton];

        if (options.count > 1 || options.lines > 1)
        {
            let count = Math.max(options.count, options.lines);

            _for(count -1, (i) => skeletons.push(skeleton.cloneNode(true)));
        }

        each(skeletons, function(i, _skeleton)
        {
            this._setDimensions(_skeleton, width, height, wrapper, options.aspectratio, options.lines > 1);

            if (wrapper)
            {
                wrapper.appendChild(_skeleton);
            }
            else
            {
                DOMElement.appendChild(_skeleton);
            }

        }, this);

        if (wrapper)
        {                
            DOMElement.appendChild(wrapper);

            this._nodes.push(wrapper);
        }
        else
        {
            each(skeletons, (i, skel) => this._nodes.push(skel), this);
        }
    }

    /**
     * Remove and destroy
     *
     * @params {callback} node
     * @access {private}
     */
    Skeleton.prototype._setDimensions = function(skeleton, width, height, wrapper, aspectRatio, isLines)
    {
        // Text blocks get random width;
        if (wrapper)
        {
            let min = isLines ? 70 : 15;
            let max = isLines ? 95 : 85;
            let w   = Math.floor(Math.random() * (max - min + 1) + min);

            skeleton.style.width = `${w}%`;

            return;
        }

        if (aspectRatio !== '')
        {
            skeleton.style.width  = '100%';
            skeleton.style.height = 'auto';
            skeleton.style.aspectRatio = aspectRatio;

            return;
        }

        if (width)
        {
            skeleton.style.width = width;
        }

        if (height)
        {
            skeleton.style.height = height;
        }
    }

    // Add to container
    frontbx.set('Skeleton', Skeleton);

})();
(function()
{
    /**
     * TinyGesture.js
     *
     * This service uses passive listeners, so you can't call event.preventDefault()
     * on any of the events.
     *
     * Adapted from https://gist.github.com/SleepWalker/da5636b1abcbaff48c4d
     * and https://github.com/uxitten/xwiper
     * plus a bunch more of my own code.
     */
    class TinyGesture
    {
        constructor(element, options)
        {
            this.element = element;
            this.touch1 = null;
            this.touch2 = null;
            this.touchStartX = null;
            this.touchStartY = null;
            this.touchEndX = null;
            this.touchEndY = null;
            this.touchMove1 = null;
            this.touchMove2 = null;
            this.touchMoveX = null;
            this.touchMoveY = null;
            this.velocityX = null;
            this.velocityY = null;
            this.longPressTimer = null;
            this.doubleTapTimer = null;
            this.doubleTapWaiting = false;
            this.thresholdX = 0;
            this.thresholdY = 0;
            this.disregardVelocityThresholdX = 0;
            this.disregardVelocityThresholdY = 0;
            this.swipingHorizontal = false;
            this.swipingVertical = false;
            this.swipingDirection = null;
            this.swipedHorizontal = false;
            this.swipedVertical = false;
            this.originalDistance = null;
            this.newDistance = null;
            this.scale = null;
            this.originalAngle = null;
            this.newAngle = null;
            this.rotation = null;
            this.handlers = {
                panstart: [],
                panmove: [],
                panend: [],
                swipeleft: [],
                swiperight: [],
                swipeup: [],
                swipedown: [],
                tap: [],
                doubletap: [],
                longpress: [],
                pinch: [],
                pinchend: [],
                rotate: [],
                rotateend: [],
            };
            this._onTouchStart = this.onTouchStart.bind(this);
            this._onTouchMove = this.onTouchMove.bind(this);
            this._onTouchEnd = this.onTouchEnd.bind(this);
            this.opts = Object.assign({}, TinyGesture.defaults, options);
            this.element.addEventListener('touchstart', this._onTouchStart, passiveIfSupported);
            this.element.addEventListener('touchmove', this._onTouchMove, passiveIfSupported);
            this.element.addEventListener('touchend', this._onTouchEnd, passiveIfSupported);
            if (this.opts.mouseSupport && !('ontouchstart' in window)) {
                this.element.addEventListener('mousedown', this._onTouchStart, passiveIfSupported);
                document.addEventListener('mousemove', this._onTouchMove, passiveIfSupported);
                document.addEventListener('mouseup', this._onTouchEnd, passiveIfSupported);
            }
        }
        destroy() {
            var _a, _b;
            this.element.removeEventListener('touchstart', this._onTouchStart);
            this.element.removeEventListener('touchmove', this._onTouchMove);
            this.element.removeEventListener('touchend', this._onTouchEnd);
            this.element.removeEventListener('mousedown', this._onTouchStart);
            document.removeEventListener('mousemove', this._onTouchMove);
            document.removeEventListener('mouseup', this._onTouchEnd);
            clearTimeout((_a = this.longPressTimer) !== null && _a !== void 0 ? _a : undefined);
            clearTimeout((_b = this.doubleTapTimer) !== null && _b !== void 0 ? _b : undefined);
        }
        on(type, fn) {
            if (this.handlers[type]) {
                this.handlers[type].push(fn);
                return {
                    type,
                    fn,
                    cancel: () => this.off(type, fn),
                };
            }
        }
        off(type, fn) {
            if (this.handlers[type]) {
                const idx = this.handlers[type].indexOf(fn);
                if (idx !== -1) {
                    this.handlers[type].splice(idx, 1);
                }
            }
        }
        fire(type, event) {
            for (let i = 0; i < this.handlers[type].length; i++) {
                this.handlers[type][i](event);
            }
        }
        onTouchStart(event) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
            let didTouch1 = false;
            let didTouch2 = false;
            if (event.type !== 'mousedown') {
                if (!this.touch1) {
                    this.touch1 = event.changedTouches[0];
                    didTouch1 = true;
                }
                if (((didTouch1 && event.changedTouches.length > 1) || !didTouch1) && !this.touch2) {
                    this.touch2 =
                        [...event.changedTouches].find((touch) => { var _a; return touch.identifier !== ((_a = this.touch1) === null || _a === void 0 ? void 0 : _a.identifier); }) ||
                            null;
                    this.originalDistance = Math.sqrt(Math.pow(((_b = (_a = this.touch2) === null || _a === void 0 ? void 0 : _a.screenX) !== null && _b !== void 0 ? _b : 0) - ((_f = (_d = (_c = this.touchMove1) === null || _c === void 0 ? void 0 : _c.screenX) !== null && _d !== void 0 ? _d : (_e = this.touch1) === null || _e === void 0 ? void 0 : _e.screenX) !== null && _f !== void 0 ? _f : 0), 2) +
                        Math.pow(((_h = (_g = this.touch2) === null || _g === void 0 ? void 0 : _g.screenY) !== null && _h !== void 0 ? _h : 0) - ((_m = (_k = (_j = this.touchMove1) === null || _j === void 0 ? void 0 : _j.screenY) !== null && _k !== void 0 ? _k : (_l = this.touch1) === null || _l === void 0 ? void 0 : _l.screenY) !== null && _m !== void 0 ? _m : 0), 2));
                    this.originalAngle =
                        Math.atan2(((_p = (_o = this.touch2) === null || _o === void 0 ? void 0 : _o.screenY) !== null && _p !== void 0 ? _p : 0) - ((_t = (_r = (_q = this.touchMove1) === null || _q === void 0 ? void 0 : _q.screenY) !== null && _r !== void 0 ? _r : (_s = this.touch1) === null || _s === void 0 ? void 0 : _s.screenY) !== null && _t !== void 0 ? _t : 0), ((_v = (_u = this.touch2) === null || _u === void 0 ? void 0 : _u.screenX) !== null && _v !== void 0 ? _v : 0) - ((_z = (_x = (_w = this.touchMove1) === null || _w === void 0 ? void 0 : _w.screenX) !== null && _x !== void 0 ? _x : (_y = this.touch1) === null || _y === void 0 ? void 0 : _y.screenX) !== null && _z !== void 0 ? _z : 0)) /
                            (Math.PI / 180);
                    return;
                }
                if (!didTouch1 && !didTouch2) {
                    return;
                }
            }
            if (didTouch1 || event.type === 'mousedown') {
                this.thresholdX = this.opts.threshold('x', this);
                this.thresholdY = this.opts.threshold('y', this);
                this.disregardVelocityThresholdX = this.opts.disregardVelocityThreshold('x', this);
                this.disregardVelocityThresholdY = this.opts.disregardVelocityThreshold('y', this);
                this.touchStartX = event.type === 'mousedown' ? event.screenX : ((_0 = this.touch1) === null || _0 === void 0 ? void 0 : _0.screenX) || 0;
                this.touchStartY = event.type === 'mousedown' ? event.screenY : ((_1 = this.touch1) === null || _1 === void 0 ? void 0 : _1.screenY) || 0;
                this.touchMoveX = null;
                this.touchMoveY = null;
                this.touchEndX = null;
                this.touchEndY = null;
                this.swipingDirection = null;
                this.longPressTimer = setTimeout(() => this.fire('longpress', event), this.opts.longPressTime);
                this.scale = 1;
                this.rotation = 0;
                this.fire('panstart', event);
            }
        }
        onTouchMove(event) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            if (event.type === 'mousemove' && (!this.touchStartX || this.touchEndX !== null)) {
                return;
            }
            let touch1 = undefined;
            let touch2 = undefined;
            if (event.type !== 'mousemove') {
                touch1 = [...event.changedTouches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch1) === null || _a === void 0 ? void 0 : _a.identifier); });
                this.touchMove1 = touch1 || this.touchMove1;
                touch2 = [...event.changedTouches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch2) === null || _a === void 0 ? void 0 : _a.identifier); });
                this.touchMove2 = touch2 || this.touchMove2;
            }
            if (event.type === 'mousemove' || touch1) {
                const touchMoveX = (event.type === 'mousemove' ? event.screenX : (_a = touch1 === null || touch1 === void 0 ? void 0 : touch1.screenX) !== null && _a !== void 0 ? _a : 0) - ((_b = this.touchStartX) !== null && _b !== void 0 ? _b : 0);
                this.velocityX = touchMoveX - ((_c = this.touchMoveX) !== null && _c !== void 0 ? _c : 0);
                this.touchMoveX = touchMoveX;
                const touchMoveY = (event.type === 'mousemove' ? event.screenY : (_d = touch1 === null || touch1 === void 0 ? void 0 : touch1.screenY) !== null && _d !== void 0 ? _d : 0) - ((_e = this.touchStartY) !== null && _e !== void 0 ? _e : 0);
                this.velocityY = touchMoveY - ((_f = this.touchMoveY) !== null && _f !== void 0 ? _f : 0);
                this.touchMoveY = touchMoveY;
                const absTouchMoveX = Math.abs(this.touchMoveX);
                const absTouchMoveY = Math.abs(this.touchMoveY);
                this.swipingHorizontal = absTouchMoveX > this.thresholdX;
                this.swipingVertical = absTouchMoveY > this.thresholdY;
                this.swipingDirection =
                    absTouchMoveX > absTouchMoveY
                        ? this.swipingHorizontal
                            ? 'horizontal'
                            : 'pre-horizontal'
                        : this.swipingVertical
                            ? 'vertical'
                            : 'pre-vertical';
                if (Math.max(absTouchMoveX, absTouchMoveY) > this.opts.pressThreshold) {
                    clearTimeout((_g = this.longPressTimer) !== null && _g !== void 0 ? _g : undefined);
                }
                this.fire('panmove', event);
            }
            if (event.type !== 'mousemove' && this.touchMove1 != null && this.touchMove2 != null) {
                this.newDistance = Math.sqrt(Math.pow(this.touchMove2.screenX - this.touchMove1.screenX, 2) +
                    Math.pow(this.touchMove2.screenY - this.touchMove1.screenY, 2));
                this.scale = this.newDistance / ((_h = this.originalDistance) !== null && _h !== void 0 ? _h : 0);
                this.fire('pinch', event);
                this.newAngle =
                    Math.atan2(((_j = this.touchMove2.screenY) !== null && _j !== void 0 ? _j : 0) - ((_k = this.touchMove1.screenY) !== null && _k !== void 0 ? _k : 0), ((_l = this.touchMove2.screenX) !== null && _l !== void 0 ? _l : 0) - ((_m = this.touchMove1.screenX) !== null && _m !== void 0 ? _m : 0)) /
                        (Math.PI / 180);
                this.rotation = this.newAngle - ((_o = this.originalAngle) !== null && _o !== void 0 ? _o : 0);
                this.fire('rotate', event);
            }
        }
        onTouchEnd(event) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            let touch1 = undefined;
            if (event.type !== 'mouseup') {
                touch1 = [...event.changedTouches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch1) === null || _a === void 0 ? void 0 : _a.identifier); });
                if (![...event.touches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch1) === null || _a === void 0 ? void 0 : _a.identifier); })) {
                    this.touch1 = null;
                    this.touchMove1 = null;
                }
                if (![...event.touches].find((touch) => { var _a; return touch.identifier === ((_a = this.touch2) === null || _a === void 0 ? void 0 : _a.identifier); })) {
                    this.touch2 = null;
                    this.touchMove2 = null;
                }
            }
            if (event.type === 'mouseup' && (!this.touchStartX || this.touchEndX !== null)) {
                return;
            }
            if (event.type === 'mouseup' || touch1) {
                this.touchEndX = event.type === 'mouseup' ? event.screenX : (_a = touch1 === null || touch1 === void 0 ? void 0 : touch1.screenX) !== null && _a !== void 0 ? _a : 0;
                this.touchEndY = event.type === 'mouseup' ? event.screenY : (_b = touch1 === null || touch1 === void 0 ? void 0 : touch1.screenY) !== null && _b !== void 0 ? _b : 0;
                this.fire('panend', event);
                clearTimeout((_c = this.longPressTimer) !== null && _c !== void 0 ? _c : undefined);
                const x = this.touchEndX - ((_d = this.touchStartX) !== null && _d !== void 0 ? _d : 0);
                const absX = Math.abs(x);
                const y = this.touchEndY - ((_e = this.touchStartY) !== null && _e !== void 0 ? _e : 0);
                const absY = Math.abs(y);
                const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                const absDistance = Math.abs(distance);
                const diagonal = absY / absX;
                if (absX > this.thresholdX ||
                    absY > this.thresholdY ||
                    (this.opts.diagonalSwipes && (absDistance > this.thresholdX || absDistance > this.thresholdY))) {
                    this.swipedHorizontal = absX > this.thresholdX || (this.opts.diagonalSwipes && absDistance > this.thresholdX);
                    this.swipedVertical = absY > this.thresholdY || (this.opts.diagonalSwipes && absDistance > this.thresholdY);
                    if (!this.opts.diagonalSwipes ||
                        diagonal < Math.tan(((45 - this.opts.diagonalLimit) * Math.PI) / 180) ||
                        diagonal > Math.tan(((45 + this.opts.diagonalLimit) * Math.PI) / 180)) {
                        if (absX >= absY) {
                            this.swipedVertical = false;
                        }
                        if (absY > absX) {
                            this.swipedHorizontal = false;
                        }
                    }
                    if (this.swipedHorizontal) {
                        if (x < 0) {
                            if (((_f = this.velocityX) !== null && _f !== void 0 ? _f : 0) < -this.opts.velocityThreshold || distance < -this.disregardVelocityThresholdX) {
                                this.fire('swipeleft', event);
                            }
                        }
                        else {
                            if (((_g = this.velocityX) !== null && _g !== void 0 ? _g : 0) > this.opts.velocityThreshold || distance > this.disregardVelocityThresholdX) {
                                this.fire('swiperight', event);
                            }
                        }
                    }
                    if (this.swipedVertical) {
                        if (y < 0) {
                            if (((_h = this.velocityY) !== null && _h !== void 0 ? _h : 0) < -this.opts.velocityThreshold || distance < -this.disregardVelocityThresholdY) {
                                this.fire('swipeup', event);
                            }
                        }
                        else {
                            if (((_j = this.velocityY) !== null && _j !== void 0 ? _j : 0) > this.opts.velocityThreshold || distance > this.disregardVelocityThresholdY) {
                                this.fire('swipedown', event);
                            }
                        }
                    }
                }
                else if (absX < this.opts.pressThreshold && absY < this.opts.pressThreshold) {
                    if (this.doubleTapWaiting) {
                        this.doubleTapWaiting = false;
                        clearTimeout((_k = this.doubleTapTimer) !== null && _k !== void 0 ? _k : undefined);
                        this.fire('doubletap', event);
                    }
                    else {
                        this.doubleTapWaiting = true;
                        this.doubleTapTimer = setTimeout(() => (this.doubleTapWaiting = false), this.opts.doubleTapTime);
                        this.fire('tap', event);
                    }
                }
            }
            if (!this.touch1 && !this.touch2) {
                this.fire('pinchend', event);
                this.fire('rotateend', event);
                this.originalDistance = null;
                this.newDistance = null;
                this.scale = null;
                this.originalAngle = null;
                this.newAngle = null;
                this.rotation = null;
            }
        }
    }
    TinyGesture.defaults = {
        threshold: (type, _self) => Math.max(25, Math.floor(0.15 *
            (type === 'x'
                ? window.innerWidth || document.body.clientWidth
                : window.innerHeight || document.body.clientHeight))),
        velocityThreshold: 10,
        disregardVelocityThreshold: (type, self) => Math.floor(0.5 * (type === 'x' ? self.element.clientWidth : self.element.clientHeight)),
        pressThreshold: 8,
        diagonalSwipes: false,
        diagonalLimit: 15,
        longPressTime: 500,
        doubleTapTime: 300,
        mouseSupport: true,
    };
    let passiveIfSupported = false;
    try {
        window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
            get: function () {
                passiveIfSupported = { passive: true };
            },
        }));
    }
    catch (err) { }

    frontbx.set('TinyGesture', TinyGesture);

})();
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, find_all, each, dom_element, add_class, toggle_class, on, off, has_class, remove_class, remove_from_dom, css, height, width, preapend, scroll_pos, animate_css, rendered_style] = frontbx.import(['find','find_all','each','dom_element','add_class','toggle_class','on','off','has_class','remove_class','remove_from_dom', 'css', 'height', 'width', 'preapend', 'scroll_pos', 'animate_css', 'rendered_style']).from('_');

    /**
     * Default options
     * 
     * @var {obj}
     */
    var DEFAULT_OPTIONS =
    {
        // Content - can be a node, nodelist, or string of HTML
        content: '',
        
        // Overlay color - dark, light, none,
        overlay: 'dark',

        // Force overlay on persistent drawer
        persistentOverlay: false,

        // When true allows swiping on screen to hide/show
        swipeable: false,

        // When keepEdge is true, the default state to set "expanded"|"collapsed"
        state: 'expanded',

        // Where the drawer comes from - left,right,top,bottom
        direction: 'left',

        // Collapses to icon size
        peekable: false,

        // Adapt body body
        persistent: false,

        // Responsive
        responsive: false,

        // Push body instead of changing width
        pushbody: false,

        // Animiation time
        animationTime: 250,

        // Animation easing
        easing: 'easeOut',

        // HTML initialized
        fromHTML: false,
        
        // Additional classes to apply to wrapper
        classes: '',

        // State callbacks
        callbackBuilt:    () => { },
        callbackRender:   () => { },
        callbackClose:    () => { },
        callbackOpen:     () => { },
        callbackValidate: () => true,
    };

    /**
     * Closing arrow icons.
     * 
     * @var {obj}
     */
    const PUSH_ARROWS =
    {
        left: 'left',
        right: 'right',
        top: 'up',
        bottom: 'down'
    };

    /**
     * Swipe open/close directions.
     * 
     * @var {obj}
     */
    const SWIPE_DIRECTIONS =
    {
        left: ['swiperight', 'swipeleft'],
        right: ['swipeleft', 'swiperight'],
        top:  ['swipedown', 'swipeup'],
        bottom: ['swipeup', 'swipedown'],
    };

    /**
     * Don't double wrap body.
     * 
     * @var {boolean}
     */
    var WRAPPED_BODY = false;

    /**
     * Don't double wrap body.
     * 
     * @var {boolean}
     */
    var WRAPPED_DRAWERS = 0;

    /**
     * Module constructor
     *
     * @class
     * @params {options} obj
     * @access {public}
     */
    const Drawer = function(options)
    { 
        // Merge options
        this._options = {...DEFAULT_OPTIONS, ...options};

        if (!SWIPE_DIRECTIONS[this._options.direction]) throw new Error('Unsupported direction.');

        if (this._options.peekable) this._options.persistent = true;

        if (this._options.pushbody)
        {
            this._options.persistent = true;

            this._options.peekable = false;
        }

        // Save state
        this._state = this._options.state;

        // Animating
        this._animating = false;

        // Already mounted?
        this._mounted = false;

        // Initial mount
        this._animateOnMount = typeof this._options.animateOnMount === 'undefined' ? this._state === 'expanded' && !this._options.fromHTML : this._options.animateOnMount;

        // Do we have an overlay
        this._hasOverlay = !this._options.persistent || (this._options.persistent && this._options.persistentOverlay);

        // Cache resize throttle
        this._resizeThrottle = throttle(() => this.resize(), 100);

        // Build the drawer
        this._build();

        // Render the drawer        
        this._mount();

        // Add listeners
        this._bindListeners();

        return this;
    }

    /**
     * Is drawer open?
     *
     * @access {public}
     * @return {Boolean}
     */
    Drawer.prototype.opened = function()
    {
        return this._state === 'expanded';
    }

    /**
     * Is drawer closed?
     *
     * @access {public}
     * @return {Boolean}
     */
    Drawer.prototype.closed = function()
    {
        return this._state === 'collapsed';
    }

    /**
     * Is drawer open or closed?
     *
     * @access {public}
     * @return {String}
     */
    Drawer.prototype.state = function()
    {
        return this._state;
    }

    /**
     * Returns drawer direction.
     *
     * @access {public}
     * @return {String}
     */
    Drawer.prototype.direction = function()
    {
        return this._options.direction;
    }

    /**
     * Window resize handler
     *
     * @access {public}
     */
    Drawer.prototype.resize = function()
    {
        if (this._animating) return;

        let x = width(window);

        if (x < 768 && this.opened())
        {
            this.close();
        }
        else if (x > 768 && this.closed())
        {
            this.open();
        }
    }

    /**
     * Destroy drawer.
     *
     * @access {public}
     */
    Drawer.prototype.destroy = function()
    {
        // Close
        this.close();

        // Remove gestures
        this._gestures.destroy();

        // Unwrap body
        if (this._options.persistent) this._unwrapBody();

        if (this._options.responsive && this._options.persistent) 
        {
            off(window, 'resize', this._resizeThrottle, this);
        }

        if (WRAPPED_DRAWERS <= 0)
        {
            remove_from_dom(this._containerWrap);
        }
        else
        {
            if (this._hasOverlay) remove_from_dom(this._overlay);

            remove_from_dom(this._drawer);
        }
    }

    /**
     * Close drawer.
     *
     * @access {public}
     */
    Drawer.prototype.open = function()
    {
        // Don't open when animating or not already closed
        if (this._state !== 'collapsed' || this._animating) return;

        this._animating = true;

        remove_class(this._containerWrap, 'closed, closing');

        add_class(this._containerWrap, 'opening');

        remove_class(this._drawer, 'disabled');

        this._animteDrawer();

        if (this._hasOverlay)
        {
            add_class(document.body, 'no-scroll');

            this._animateOverlay();
        }

        if (this._options.pushbody) add_class(document.body, 'no-scroll');

        if (this._options.persistent) this._animateBody();

        if (!this._mounted) this._toggleEnd();
    }

    /**
     * Open drawer.
     *
     * @access {public}
     */
    Drawer.prototype.close = function()
    {
        if (this._state !== 'expanded' || this._animating) return;

        this._animating = true;

        add_class(this._containerWrap, 'closing');

        remove_class(this._containerWrap, 'expanded, opening');

        remove_class(document.body, 'no-scroll');

        this._animteDrawer();

        if (this._hasOverlay) this._animateOverlay();

        if (this._options.persistent) this._animateBody();

        if (!this._mounted) this._toggleEnd();
    }

    /**
     * Wrap body when 'persistent' true.
     *
     * @access {private}
     */
    Drawer.prototype._animteDrawer = function()
    {
        let peekable  = this._options.peekable;
        let state     = this._state;
        let direction = this._options.direction;
        let duration  = this._options.animationTime;
        let easing    = this._options.easing;
        let property  = peekable ? (direction === 'left' || direction === 'right' ? 'width' : 'height') : 'transform';
        let to        = peekable ? (state === 'collapsed' ? this._drawerSize : this._peekableSize) : 'translate3d(0px, 0px, 0px)';
        let from      = peekable ? (state === 'collapsed' ? this._peekableSize : 'auto') : null;

        if (peekable && state === 'collapsed' && (direction === 'top' || direction === 'bottom'))
        {
            to = this._drawerSize;
        }

        if (!peekable)
        {
            let x = (direction === 'left' || direction === 'right') ? (direction === 'left' ? '-100%' : '100%') : '0px';
            let y = (direction === 'top' || direction === 'bottom') ? (direction === 'top' ? '-100%' : '100%') : '0px';
            let tofrom = `translate3d(${x}, ${y}, 0px)`;

            state === 'expanded' ? to = tofrom : from = tofrom;
        }

        (this._mounted || (!this._mounted && this._animateOnMount)) ? animate_css(this._drawer, {property, from, to, duration, easing, callback: () => this._toggleEnd() }) : css(this._drawer, property, to);
    }

    /**
     * Wrap body when 'persistent' true.
     *
     * @access {private}
     */
    Drawer.prototype._animateOverlay = function()
    {
        let duration  = this._options.animationTime;
        let easing    = this._options.easing;
        let property  = 'opacity';
        let to        = this._state === 'collapsed' ? '1' : '0';
        let from      = this._state === 'collapsed' ? '0' : '1';

        (this._mounted || (!this._mounted && this._animateOnMount)) ? animate_css(this._overlay, {property, from, to, duration, easing }) : css(this._overlay, property, to);
    }

    /**
     * Wrap body when 'persistent' true.
     *
     * @access {private}
     */
    Drawer.prototype._animateBody = function()
    {
        if (!this._options.persistent) return;

        let peekable  = this._options.peekable;
        let state     = this._state;
        let direction = this._options.direction;
        let duration  = this._options.animationTime;
        let easing    = this._options.easing;
        let property  = 'margin';
        let n, e, s, w;
        n = e = s = w = '0px';

        if (direction === 'left')   w = state === 'collapsed' ? this._drawerSize  : (peekable ? this._peekableSize : '0px');
        if (direction === 'right')  e = state === 'collapsed' ? this._drawerSize  : (peekable ? this._peekableSize : '0px');
        if (direction === 'top')    n = state === 'collapsed' ? `${height(this._drawer)}px` : (peekable ? this._peekableSize : '0px');

        let to = `${n} ${e} ${s} ${w}`;

        if (this._options.pushbody)
        {
            property = 'transform';
            to = 'translate3d(0px, 0px, 0px)';

            if (state === 'collapsed')
            {
                let x, y;
                x = y = '0px';
                if (e !== '0px') x = `-${e}`;
                if (w !== '0px') x = w;
                if (n !== '0px') y = n;
                to = `translate3d(${x}, ${y}, 0px)`;
            }
        }

        (this._mounted || (!this._mounted && this._animateOnMount)) ? animate_css(this._bodyWrap, {property, to, duration, easing }) : css(this._bodyWrap, property, to);
    }

    /**
     * Completed opening / closing.
     *
     * @access {private}
     */
    Drawer.prototype._toggleEnd = function()
    {        
        // Multiple transitions
        if (!this._animating) return;

        this._state = this._state === 'collapsed' ? 'expanded' : 'collapsed';

        add_class(this._containerWrap, this._state === 'expanded' ? 'expanded' : 'closed');

        remove_class(this._containerWrap, this._state === 'expanded' ? 'opening' : 'closing');

        this._makeCallback(this._state === 'expanded' ? this._options.callbackOpen : this._options.callbackClose);

        this._animating = false;
    }

    /**
     * Build DOM Elements for drawer.
     *
     * @access {private}
     */
    Drawer.prototype._build = function()
    {
        let container = dom_element({tag: 'div', class: `js-drawer-container drawer-container drawer-${this._options.direction} ${this._options.persistent ? 'persistent' : ''} ${this._options.peekable ? 'peekable' : null } overlay-${this._options.overlay} ${this._options.classes}`});
        let overlay   = dom_element({tag: 'div', class: 'js-drawer-overlay drawer-overlay'}, !this._hasOverlay ? null : container);
        let drawer    = dom_element({tag: 'aside', class: 'js-drawer-wrap drawer-wrap'}, container, 
            dom_element({tag: 'div', class: 'drawer-dialog js-drawer-dialog' }, null, this._options.content )
        );

        this._containerWrap = container;
        this._drawer        = drawer;
        this._overlay       = overlay;
        this._dialog        = find('.js-drawer-dialog', this._drawer);

        if (this._options.persistent)
        {
            let header = dom_element({tag: 'div', class: `flex-row-fluid align-cols-center-y drawer-header ${this._options.direction !== 'right' ? 'align-cols-right' : ''}`});
            let closer = dom_element({tag: 'button', type: 'button', class: 'btn btn-pure btn-circle btn-xs close-btn'}, header, dom_element({tag: 'span', class: `fa fa-chevron-${PUSH_ARROWS[this._options.direction]}`}));
            
            this._options.direction === 'top' ? this._dialog.appendChild(header) : preapend(header, this._dialog);

            on(closer, 'click', this._closeValidate, this);
        }

        this._makeCallback(this._options.callbackBuilt);
    }

    /**
     * Mount and render the drawer.
     *
     * @access {private}
     */
    Drawer.prototype._mount = function()
    {
        document.body.appendChild(this._containerWrap);

        this._containerWrap.offsetHeight;

        this._peekableSize = this._options.peekableSize || rendered_style(this._containerWrap, '--fbx-drawer-size-peekable');
        this._drawerSize   = this._options.drawerSize || rendered_style(this._containerWrap, '--fbx-drawer-width');

        if (this._options.persistent) this._wrapBody();

        this._state = this._state === 'expanded' ? 'collapsed' : 'expanded';

        this._state === 'collapsed' ? this.open() : this.close();

        this._mounted = true;

        this._makeCallback(this._options.callbackRender);
    }

    /**
     * Wrap body when 'persistent' true.
     *
     * @access {private}
     */
    Drawer.prototype._wrapBody = function()
    {
        WRAPPED_DRAWERS++;

        // Don't double-wrap body
        if (WRAPPED_BODY)
        {
            // Disable other drawers
            each(find_all('.js-drawer-wrap'), (i, drawer) => add_class(drawer, 'disabled'));

            let classN = this._containerWrap.className;

            if (this._containerWrap.parentNode) this._containerWrap.parentNode.removeChild(this._containerWrap);

            this._containerWrap = find('.js-drawer-container');

            this._bodyWrap = find('.js-drawer-body-wrap');

            this._containerWrap.className = classN;

            this._containerWrap.appendChild(this._drawer);

            return;
        }

        WRAPPED_BODY = true;

        let pos = scroll_pos();

        let content = find_all('body > *');

        this._bodyWrap = dom_element({tag: 'div', class: 'js-drawer-body-wrap drawer-body-wrap'});

        preapend(this._bodyWrap, this._containerWrap);
        
        each(content, (i, node) => node !== this._containerWrap ? this._bodyWrap.appendChild(node) : null);

        this._containerWrap.scrollTo(pos.left, pos.top);
    }

    /**
     * Unwrap body when 'persistent' true.
     *
     * @access {private}
     */
    Drawer.prototype._unwrapBody = function()
    {
        if (!WRAPPED_BODY) return;

        WRAPPED_DRAWERS--;

        // Only unwrap if we're the last drawer using the container.
        if (WRAPPED_DRAWERS <= 0)
        {
            let pos = scroll_pos(this._containerWrap);

            let content = find_all('> *', this._bodyWrap);

            each(content, (i, node) => document.body.appendChild(node));
           
            window.scrollTo(pos.left, pos.top);

            WRAPPED_BODY = false;
        }
    }

    /**
     * Validate closing.
     *
     * @access {private}
     */
    Drawer.prototype._closeValidate = function()
    {
        if (this._makeCallback(this._options.callbackValidate)) this.close();
    }

    /**
     * Bind event listeners for drawer.
     *
     * @access {private}
     */
    Drawer.prototype._bindListeners = function()
    {
        if (!this._options.fromHTML) 
        {            
            frontbx.dom().refresh(this._drawer);
        }

        if (this._options.responsive && this._options.persistent) 
        {
            on(window, 'resize', this._resizeThrottle, this);
        }

        on(this._overlay, 'click', this._closeValidate, this);

        let directions = SWIPE_DIRECTIONS[this._options.direction];

        this._gestures = frontbx.TinyGesture(this._options.swipeable ? window : this._drawer, { mouseSupport: true, velocityThreshold: 3, threshold: (type, self) => this._options.swipeable ? 20 : 3 });

        this._gestures.on(directions[0], () => this.open() );

        this._gestures.on(directions[1], () => this._closeValidate() );
    }

    /**
     * Fire callbacks.
     *
     * @access {private}
     */
    Drawer.prototype._makeCallback = function(callback)
    {
        if (callback) return callback(this._containerWrap, this._drawer, this._overlay, this._bodyWrap);
    }

    // Load into container 
    frontbx.set('Drawer', Drawer);

})();
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [on, find, dom_element, extend] = frontbx.import(['on','find','dom_element','extend']).from('_');

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const Drawer = frontbx.Drawer(frontbx.IMPORT_AS_REF);

    /**
     * @var {obj}
     */
    var DEFAULT_OPTIONS =
    {
        // Content - can be a node, nodelist, or string of HTML
        content: '',

        // Confirm button text or null + confirm button class
        confirmBtn: null,
        confirmClass: '',
        
        // Overlay color - "dark"| "light"
        overlay: 'dark',

        // Allows collapsing,expanding
        peekable: false,

        // When true allows swiping on screen to hide/show
        swipeable: false,

        // When keepEdge is true, the default state to set "expanded"|"collapsed"
        state: 'expanded',

        // Private
        animationTime: 225,
        persistentOverlay: true,
        direction: 'bottom',
        classes: '',
        persistent: false,

        // State callbacks
        callbackBuilt:    () => { },
        callbackRender:   () => { },
        callbackConfirm:  () => { },
        callbackClose:    () => { },
        callbackOpen:     () => { },
        callbackValidate: () => true,
    };

    /**
     * Module constructor
     *
     * @class
     * @params {options} obj
     * @access {public}
     * @return {this}
     */
    const Frontdrop = function(options)
    {
        let classes = options.confirmBtn ? `frontdrop with-confirmation ${options.classes}` : `frontdrop ${options.classes}`;

        options = {...DEFAULT_OPTIONS, ...options, classes};

        let content = this._buildFD(options);

        options = {...options, content};

        this.super(options);

        if (options.confirmBtn) on(find('.js-frontdrop-confirm', content), 'click', this._closeValidate, this);
    }

    /**
     * Build the frontdrop and overlay.
     *
     * @access {private}
     */
    Frontdrop.prototype._buildFD = function(options)
    {
        let footer = options.confirmBtn ? dom_element({tag: 'div', class: 'card-footer'}, null, 
            dom_element({tag: 'div', class: 'card-footer'}, null,
                dom_element({tag: 'div', class: 'card-footer-content'}, null,
                    dom_element({tag: 'div', class: 'container-fluid'}, null,
                        dom_element({tag: 'button', type: 'button', class: `btn btn-block js-frontdrop-confirm ${options.confirmClass}`}, null, options.confirmBtn)
                    )
                )
            )
        ) : null;

        return dom_element({tag: 'div', class: 'card js-frontdrop-inner'}, null,
        [ 
            dom_element({tag: 'div', class: 'card-header'}, null,
                dom_element({tag: 'div', class: 'container-fluid'}, null, 
                    dom_element({tag: 'div', class: 'card-header-content'}, null,
                        dom_element({tag: 'div', class: 'card-title'}, null, options.title)
                    )
                )
            ),
            dom_element({tag: 'div', class: 'card-block'}, null, 
                dom_element({tag: 'div', class: 'container-fluid'}, null, options.content)
            ),
            footer
        ])
    }

    // Load into container 
    frontbx.set('Frontdrop', extend(Drawer, Frontdrop));

})();
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [on, find, dom_element, extend] = frontbx.import(['on','find','dom_element','extend']).from('_');

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const Drawer = frontbx.Drawer(frontbx.IMPORT_AS_REF);

    /**
     * Module constructor
     *
     * @class
     * @params {options} obj
     * @access {public}
     * @return {this}
     */
    const Backdrop = function(options)
    {
        let classes = !options.classes ? 'backdrop' : `backdrop ${options.classes}`;

        let persistent = true;

        options = {...options, classes, persistent };

        this.super(options);
    }

    // Load into container 
    frontbx.set('Backdrop', extend(Drawer, Backdrop));
})();
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, dom_element, add_class, on, off, remove_class, remove_from_dom, attr] = frontbx.import(['find','dom_element','add_class','on','off','remove_class','remove_from_dom','attr']).from('_');

    /**
     * Default options
     * 
     * @var {obj}
     */
    var DEFAULT_OPTIONS =
    {
        // Title
        title: '',

        // Content - can be a node, nodelist, or string of HTML
        content: '',

        // Additional classes to pass to modal
        classes: '',

        // Does not create card
        custom: false,

        // Click anywhere to close
        closeAnywhere: true,

        // Scroll 'content' or 'modal'
        scroll: 'modal',

        // Cancel btn
        cancelBtn: null,
        cancelClass: 'btn-danger btn-pure',

        // Confirm btn
        confirmBtn: null,
        confirmClass: 'btn-pure',
        
        // Overlay color - dark, light, none,
        overlay: 'dark',

        // Default state when created/mounted set "open"|"closed"
        state: 'open',

        // Loaded from HTML DOM
        fromHTML: false,

        // State callbacks
        callbackBuilt:    () => { },
        callbackRender:   () => { },
        callbackClose:    () => { },
        callbackOpen:     () => { },
        callbackValidate: () => true,
    };

    /**
     * Module constructor
     *
     * @class
     * @params {options} obj
     * @access {public}
     */
    const Modal = function(options)
    { 
        // Merge options
        this._options = {...DEFAULT_OPTIONS, ...options};

        // Save state
        this._state = this._options.state;

        // Animating
        this._animating = false;

        // Build the Modal
        this._build();

        // Add listeners
        this._bindListeners();

        // Render the Modal        
        this._mount();

        return this;
    }

    /**
     * Is Modal open?
     *
     * @access {public}
     * @return {Boolean}
     */
    Modal.prototype.opened = function()
    {
        return this._state === 'open';
    }

    /**
     * Is Modal closed?
     *
     * @access {public}
     * @return {Boolean}
     */
    Modal.prototype.closed = function()
    {
        return this._state === 'closed';
    }

    /**
     * Is Modal open or closed?
     *
     * @access {public}
     * @return {String}
     */
    Modal.prototype.state = function()
    {
        return this._state;
    }

    /**
     * Destroy Modal.
     *
     * @access {public}
     */
    Modal.prototype.destroy = function()
    {
        this.close();

        remove_from_dom(this._modal);

        remove_from_dom(this._overlay);
    }

    /**
     * Close Modal.
     *
     * @access {public}
     */
    Modal.prototype.open = function()
    {
        // Don't open when animating or not already closed
        if (this._state !== 'closed' || this._animating) return;

        this._animating = true;

        on(this._dialog, 'transitionend', this._toggleEnd, this);

        remove_class([this._modal, this._overlay], 'closed, closing');

        add_class([this._modal, this._overlay], 'opening');

        if (this._options.overlay !== false) add_class(document.body, 'no-scroll');

        attr(this._modal, 'aria-hidden', 'false');

        attr(this._overlay, 'aria-hidden', 'false');
    }

    /**
     * Open Modal.
     *
     * @access {public}
     */
    Modal.prototype.close = function()
    {
        if (this._state !== 'open' || this._animating) return;

        this._animating = true;

        on(this._dialog, 'transitionend', this._toggleEnd, this);

        remove_class([this._modal, this._overlay], 'opening, opened');

        add_class([this._modal, this._overlay], 'closing');

        remove_class(document.body, 'no-scroll');

        attr(this._modal, 'aria-hidden', 'true');

        attr(this._overlay, 'aria-hidden', 'true');

        this._dialog.blur();
    }

    /**
     * Completed opening / closing.
     *
     * @access {private}
     */
    Modal.prototype._toggleEnd = function()
    {                
        // Multiple transitions
        if (!this._animating) return;

        if (this._state === 'closed') this._dialog.focus();

        this._state = this._state === 'closed' ? 'open' : 'closed';

        remove_class([this._modal, this._overlay], this._state === 'open' ? 'opening' : 'closing');

        add_class([this._modal, this._overlay], this._state === 'open' ? 'opened' : 'closed');

        this._makeCallback(this._state === 'open' ? this._options.callbackOpen : this._options.callbackClose);

        off(this._dialog, 'transitionend', this._toggleEnd, this);

        this._animating = false;
    }

    /**
     * Build DOM Elements for Modal.
     *
     * @access {private}
     */
    Modal.prototype._build = function()
    {
        this._cancelBtn  = this._options.cancelBtn  ? dom_element({tag: 'button', type: 'button', class: `btn ${this._options.cancelClass}`}, null, this._options.cancelBtn) : null; 
        
        this._confirmBtn = this._options.confirmBtn ? dom_element({tag: 'button', type: 'button', class: `btn ${this._options.confirmClass}`}, null, this._options.confirmBtn) : null;
        
        this._overlay = dom_element({tag: 'div', role: 'presentation', class: `modal-overlay closed overlay-${this._options.overlay} ${this._options.overlay === false ? 'disabled' : ''}`});
        
        this._modal    = dom_element({tag: 'div', role: 'presentation', tabindex: '-1', class: `modal-wrap closed scroll-${this._options.scroll} ${this._options.classes}`}, null, 
        dom_element({tag: 'div', class: 'modal-dialog js-modal-dialog'}, null,
            this._options.custom ? this._options.content : dom_element({tag: 'div', class: `card ${this._options.scroll === 'content' ? 'card-scrollable-content' : 'card-scrollable'} `}, null, 
                [
                    dom_element({tag: 'div', class: 'card-header'}, null, 
                        dom_element({tag: 'div', class: 'card-header-content'}, null, 
                            dom_element({tag: 'div', class: 'card-title'}, null, this._options.title)
                        )
                    ),
                    dom_element({tag: 'div', class: 'card-block'}, null, this._options.content),
                    (this._cancelBtn || this._confirmBtn ? 
                        dom_element({tag: 'div', class: 'card-footer'}, null, [ dom_element({tag: 'div', class: 'card-footer-content'}, null, '&nbsp;'),
                            dom_element({tag: 'div', class: 'card-footer-right'}, null, [ this._cancelBtn, this._confirmBtn ])]
                        ) : null)
                ])
            )
        );

        this._dialog = find('.js-modal-dialog', this._modal);

        this._makeCallback(this._options.callbackBuilt);
    }

    /**
     * Mount and render the Modal.
     *
     * @access {private}
     */
    Modal.prototype._mount = function()
    {
        document.body.appendChild(this._overlay);

        document.body.appendChild(this._modal);

        this._modal.offsetHeight;

        this._overlay.offsetHeight;

        if (!this._options.fromHTML) frontbx.dom().refresh(this._modal);

        if (this._state === 'open')
        {
            this._state = 'closed';

            this.open();
        }
    }

    /**
     * Bind event listeners for Modal.
     *
     * @access {private}
     */
    Modal.prototype._bindListeners = function()
    {
        if (this._options.closeAnywhere) on(this._modal, 'click', this._closeClick, this);

        if (this._cancelBtn) on(this._cancelBtn, 'click', this._closeValidate, this);

        if (this._confirmBtn) on(this._confirmBtn, 'click', this._closeValidate, this);
    }

    /**
     * Validate closing.
     *
     * @access {private}
     */
    Modal.prototype._closeClick = function(e, clicked)
    {
        if (e.target === this._modal) this._closeValidate();
    }

    /**
     * Validate closing.
     *
     * @access {private}
     */
    Modal.prototype._closeValidate = function()
    {
        if (this._makeCallback(this._options.callbackValidate)) this.close();
    }

    /**
     * Fire callbacks.
     *
     * @access {private}
     */
    Modal.prototype._makeCallback = function(callback)
    {
        if (callback) return callback(this._modal, this._Modal, this._overlay, this._bodyWrap);
    }

    // Load into container 
    frontbx.set('Modal', Modal);

})();
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, find_all, add_class, on, in_dom, remove_class, remove_from_dom, dom_element] = frontbx.import(['find','find_all','add_class','on','in_dom','remove_class','remove_from_dom','dom_element']).from('_');

    /**
     * Default options
     * 
     * @var {array}
     */
    const DEFAULT_OPTIONS =
    {
        text:             '',
        variant:          '',
        closebtn:         false,
        responsive:       false,
        btn:              false,
        stacked:          false,
        dense:            true,
        icon:             '',
        position:         'bottom',
        timeout:          6000,
        btnVariant:       'primary',
        callbackBuilt:    () => {},
        callbackRender:   () => {},
        callbackDismiss:  () => {},        
        callbackValidate: () => { return true; }
    };

    /**
     * Notification
     *
     * The Notification class is a utility class used to
     * display a notification.
     *
     */
    const Notification = function(options)
    {
        this._options = {...DEFAULT_OPTIONS, ...options };

        this._buildNotificationContainer();

        this._build();

        this._render();

        this._bindListeners();
    }

    /**
     * Returns the notification element.
     *
     * @access {public}
     */
    Notification.prototype.domElement = function()
    {
        return this._notification;
    }

    /**
     * Remove the notification.
     *
     * @access {public}
     */
    Notification.prototype.remove = function()
    {
        clearTimeout(this._timeout);

        const wrappper = this._DOMElementWrapper;

        add_class(this._notification, this._animateOutClass);
        
        remove_class(this._notification, this._animateInClass);

        this._makeCallback(this._options.callbackDismiss);

        setTimeout(() =>
        {
            if (wrappper.children.length === 0) remove_class(wrappper, 'active');

            remove_from_dom(this._notification);

        }, 300);
    }

    /**
     * Build the notification container
     *
     * @access {private}
     */
    Notification.prototype._buildNotificationContainer = function()
    {
        this._wrapperClass = `.js-nofification-wrap.position-${this._options.position}`;

        let wrapper = find(this._wrapperClass);

        if (!wrapper)
        {
            wrapper = dom_element({tag: 'div', class: `notification-wrap position-${this._options.position} js-nofification-wrap`}, document.body);
        }

        this._DOMElementWrapper = wrapper;
    }

    /**
     * Build the notification
     *
     * @access {private}
     */
    Notification.prototype._build = function()
    {        
        let options = this._options;

        this._animateInClass = this._animateIn();

        this._animateOutClass = this._animateOut();

        let notif = dom_element({tag: 'div', class: `msg ${options.closebtn || options.btn ? 'msg-with-btn' : ''} ${options.responsive ? 'msg-responsive' : ''} ${options.stacked ? 'msg-stacked' : ''} ${options.variant ? `msg-${options.variant}` : ''} ${options.dense ? 'msg-dense' : ''} ${this._animateInClass}`} );
        
        if (options.closebtn)
        {
            dom_element({tag: 'button', type: 'button', role: 'button', ariaLabel: 'close', class: 'btn btn-pure btn-xs btn-circle btn-msg-close js-notif-btn' }, notif, dom_element({tag: 'span', class: 'fa fa-xmark' }));
        }

        if (options.icon)
        {
            dom_element({tag: 'div', class: 'msg-icon' }, notif, dom_element({tag: 'span', class: `fa fa-${options.icon}` }));
        }

        dom_element({tag: 'div', class: 'msg-body'}, notif, options.text.trim().startsWith('<') ? options.text : dom_element({tag: 'p', innerHTML: options.text }) );

        if (options.btn)
        {
            this._btn = dom_element({tag: 'div', class: 'msg-btn' }, notif, options.btn.trim().startsWith('<') ? options.btn : dom_element({tag: 'button', class: `btn btn-pure btn-${options.btnVariant} btn-sm js-notif-btn`, innerText: options.btn }));
            
            add_class(find_all('button', this._btn), 'js-notif-btn');
        }

        this._notification = notif;

        this._makeCallback(this._options.callbackBuilt);
    }

    /**
     * Build the notification
     *
     * @access {private}
     */
    Notification.prototype._animateIn = function()
    {
        if (this._options.position.includes('top')) return 'animate-in-down';

        return 'animate-in-up';
    }

     /**
     * Build the notification
     *
     * @access {private}
     */
    Notification.prototype._animateOut = function()
    {
        if (this._options.position.includes('top')) return 'animate-out-up';

        return 'animate-out-down';
    }

    /**
     * Render the notification.
     *
     * @access {private}
     */
    Notification.prototype._render = function()
    {
        add_class(this._DOMElementWrapper, 'active');

        this._DOMElementWrapper.appendChild(this._notification);

        this._notification.offsetHeight;

        this._makeCallback(this._options.callbackRender);

    }

    /**
     * Render the notification.
     *
     * @access {private}
     */
    Notification.prototype._removeValidate = function()
    {
        if (this._makeCallback(this._options.callbackValidate)) this.remove();
    }

    /**
     * Render the notification.
     *
     * @access {private}
     */
    Notification.prototype._bindListeners = function()
    {
        if (this._options.timeout !== false)
        {
            this._timeout = setTimeout(() => this._removeValidate(), this._options.timeout);
        }

        on(this._options.closebtn || this._options.btn ? find_all('.js-notif-btn', this._notification) : this._notification, 'click', this._removeValidate, this);
    }

    /**
     * Fire callbacks.
     *
     * @access {private}
     */
    Notification.prototype._makeCallback = function(callback,)
    {
        if (callback) return callback(this._notification);
    }

    // Add to container
    frontbx.set('Notification', Notification);

})();
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, in_dom, normalize_url, is_string, coordinates, height, animate] = frontbx.import(['find','in_dom','normalize_url','is_string','coordinates','height','animate']).from('_');

    /**
     * Default options
     * 
     * @var {object}
     */
    const DEFAULT_OPTIONS =
    {
        'speed'     : 500,
        'easing'    : 'easeInOutCubic',
        'updateURL' : true,
    };

    /**
     * Smooth scroll to an element or id
     *
     * @access {private}
     */
    function SmoothScroll(nodeOrId, options)
    {
        options = {...DEFAULT_OPTIONS, ...options};

        let DOMElement = is_string(nodeOrId) ? find(nodeOrId) : nodeOrId;

        if (!in_dom(DOMElement)) return;

        let pos = coordinates(DOMElement).top;

        let url = normalize_url(window.location.href);

        let isHashable = is_string(nodeOrId);

        let fixednav = find('.navbar.navbar-fixed');

        if (fixednav)
        {
            let h = height(fixednav);

            if (pos >= h)
            {
                pos = pos - h;
            }
        }

        const complete = function()
        {
            window.history.replaceState({}, "", nodeOrId);
        }

        animate(window, { property : 'scrollTo', to: `0, ${pos}`,  easing: options.easing, duration: options.speed, callback: isHashable && options.updateURL ? complete : null});
    }


    // Load into frontbx DOM core
    frontbx.set('SmoothScroll', SmoothScroll);

})();
(function()
{
    /**
     * JS Helper reference
     * 
     * @var {object}
     */
    const [is_htmlElement, dom_element, remove_class] = frontbx.import(['is_htmlElement', 'dom_element', 'remove_class']).from('_');

    /**
     * Create popover.
     * 
     * @param  {object} options
     * @return {Object}
     */
    function popover(options)
    {
        if (typeof options.content === 'string')
        {
            let contents = [];

            if (options.title)
            {
                contents.push(dom_element({tag: 'h5', class: 'popover-title'}, null, options.title));
            }

            contents.push(dom_element({tag: 'div', class: 'popover-content'}, null, dom_element({tag: 'p'}, null, options.content)));

            options.content = contents;
        }
        else if (is_htmlElement(options.content))
        {
            remove_class(options.content, 'hidden');

            options.content.style = '';
        }

        let handler = frontbx.get('PopHandler', options);

        handler.render();

        return handler;
    }

    // Load into container 
    frontbx.set('Popover', popover);

})();
(function()
{
    /**
     * Cached helper functions.
     * 
     * @var {functions}
     */
    const [on, off, _map, is_regexp] = frontbx.import(['on', 'off', 'map', 'is_regexp']).from('_');

    /**
     * Regex masks
     * 
     * @var {object}
     */
    const MASK_MAP = 
    {
        creditcard: /[0-9]/,
        money: /[0-9.]/,
        numeric: /[0-9]/,
        numericdecimal: /[0-9.]/,
        alphanumeric: /[A-z0-9-]/,
        alphaspace: /[A-z ]/,
        alphadash: /[A-z-]/,
        alphanumericdash: /[A-z0-9-]/,
    };

    /**
     * Credit card formatters.
     * 
     * @var {function}
     */
    const _format_464 = function(cc)
    {
        return [cc.substring(0,4),cc.substring(4,10),cc.substring(10,14)].join(' ').trim()
    };
    const _format_465 = function(cc)
    {
        return [cc.substring(0,4),cc.substring(4,10),cc.substring(10,15)].join(' ').trim()
    };
    const _format_4444 = function(cc)
    {
        return cc?cc.match(/[0-9]{1,4}/g).join(' '):''
    };

    /**
     * Credit card formatting.
     * 
     * @var {object}
     */
    const _CARD_TYPES =
    [
        {'type':'visa','pattern':/^4/, 'format': _format_4444, 'maxlength': 19},
        {'type':'master','pattern':/^((5[12345])|(2[2-7]))/, 'format': _format_4444, 'maxlength': 16},
        {'type':'amex','pattern':/^3[47]/, 'format': _format_465, 'maxlength':15},
        {'type':'jcb','pattern':/^35[2-8]/, 'format': _format_465, 'maxlength':19},
        {'type':'maestro','pattern':/^(5018|5020|5038|5893|6304|6759|676[123])/, 'format': _format_4444, 'maxlength':19},
        {'type':'discover','pattern':/^6[024]/, 'format': _format_4444, 'maxlength':19},
        {'type':'instapayment','pattern':/^63[789]/, 'format': _format_4444, 'maxlength':16},
        {'type':'diners_club','pattern':/^54/, 'format': _format_4444, 'maxlength':16},
        {'type':'diners_club_international','pattern':/^36/, 'format': _format_464, 'maxlength':14},
        {'type':'diners_club_carte_blanche','pattern':/^30[0-5]/, 'format': _format_464, 'maxlength':14}
    ];

    /**
     * Component constructor.
     *
     * @constructor
     * @param       {DOMElement}  element  Input element
     * @param       {string}      mask     Supported mask name or regex filter as string
     * @param       {string}      format   Optional format e.g (xxxx-xxxx-xxxx-xxxx);
     */
    const InputMasker = function(element, mask, format)
    {
        this.DOMElement = element;

        this.maskRegexp = this._getMaskRegexp(mask);

        this.format = !format ? null : this._buildFormatRegexp(format);

        this.maskName = mask;

        this.handler = function(){};

        this._bind();

    }

    /**
     * Disable the mask
     *
     * @access {public}
     */
    InputMasker.prototype.destroy = function()
    {
        off(this.DOMElement, 'input', this.handler);
        off(this.DOMElement, 'paste', this.handler);
    }

    /**
     * Binds input events.
     *
     * @access {private}
     */
    InputMasker.prototype._bind = function()
    {
        var _this      = this;
        var DOMElement = this.DOMElement;
        var maskRegexp = this.maskRegexp;
        var format     = this.format;
        var isCC       = _this.maskName === 'creditcard';

        const _handler = function(e)
        {
            e = e || window.event;

            _this._handle(DOMElement, DOMElement.value, maskRegexp, isCC);
        }

        this.handler = _handler;

        on(this.DOMElement, 'input', _handler);
        on(this.DOMElement, 'paste', _handler);
    }

    /**
     * Get or builds mask regexp.
     *
     * @access {private}
     * @param  {string}  mask
     * @return {RegExp}
     */
    InputMasker.prototype._getMaskRegexp = function(mask)
    {
        if (is_regexp(mask)) return mask;
        
        let regexp = MASK_MAP[mask.replaceAll('-', '').toLowerCase()];

        if (!regexp)
        {
            return new RegExp(mask);
        }

        return regexp;
    }

    /**
     * Builds custom format values.
     *
     * @access {private}
     * @param  {string}  format Formatting string
     * @return {object}
     */
    InputMasker.prototype._buildFormatRegexp = function(format)
    {
        let raw        = format;
        let seperators = format.split('x').filter((x) => x !== '');
        let regexp     = new RegExp(_map(format.split(/[^x]/), (i, x) => x.includes('x') ? `(.{0,${x.length}})` : false ).join(''));
        let prefix     = format.startsWith('x') ? '' : seperators.shift();
        let suffix     = format.endsWith('x') ? '' : seperators.pop();
        let len        = (raw.length -suffix.length);

        return { seperators, regexp, prefix, suffix, raw, len };
    }

    /**
     * Custom format function.
     *
     * @access {private}
     * @param  {string}  str
     * @return {str}
     */
    InputMasker.prototype._formatFilter = function(str)
    {
        // Regex filter
        str = _map(str.split(''), (x, char) => !this.maskRegexp.test(char) ? null : char ).join('');

        // Ignore or no formatting
        if (str === '' || !this.format) return str;

        // Cache seperators
        let { seperators, regexp, prefix, suffix, raw, len } = this.format;

        let splits = _map(str.match(regexp).slice(1), (i, str) => str === '' ? false : str);
        let mapped = _map(splits, function(i, match)
        {
            return i === 0 ? prefix + match : seperators[i-1] + match;
            
        }).join('');

        if (mapped.length === len)
        {
            mapped += suffix;
        }

        return mapped;
    }

    /**
     * Sepcial handler for creditcard
     *
     * @access {private}
     */
    InputMasker.prototype._formatCC = function(cc)
    {           
        cc = cc.replaceAll(/[^0-9]/g, '');

        for(var i in _CARD_TYPES)
        {
            const ct = _CARD_TYPES[i];

            if (cc.match(ct.pattern))
            {
                cc = cc.substring(0, ct.maxlength)
                
                return ct.format(cc);
            }
        }

        cc = cc.substring(0,19);

        return _format_4444(cc);
    }

    /**
     * Handles input event
     *
     * @access {private}
     * @param  {DOMElement} DOMElement
     * @param  {string}     oldval     
     * @param  {RegExp}     maskRegexp 
     * @param  {bool}       isCC 
     */
    InputMasker.prototype._handle = function(DOMElement, oldval, maskRegexp, isCC)
    {
        // Filter
        let newVal = isCC ? this._formatCC(oldval) : this._formatFilter(oldval);

        // Ignore no change
        if (newVal == oldval) return;

        // Set position and format
        var pos          = DOMElement.selectionStart;
        var before_caret = oldval.substring(0, pos);
        before_caret     = isCC ? this._formatCC(oldval) : this._formatFilter(before_caret);
        pos              = before_caret.length;
        
        DOMElement.value = newVal;
        DOMElement.focus();
        DOMElement.setSelectionRange(pos,pos);
    }

    // SET IN IOC
    frontbx.set('InputMasker', InputMasker);

})();
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find_all, add_class, attr, bool, closest, each, form_inputs, form_values, on, off, input_value, is_callable, is_empty, remove_class] = frontbx.import(['find_all','add_class','attr','bool','closest','each','form_inputs','form_values','on','off','input_value','is_callable','is_empty','remove_class']).from('_');

    /**
     * Validator functions
     *
     * @access {private}
     * @return {boolean}
     */
    const VALIDATORS = 
    {
        specialchars: ['!', '"', '`', '#', 'find', '%', '&', '\'', '(', ')', '*', '+', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', ']', '^', '_', '{', '|', '}', '~'],

        email: function(value)
        {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(value);
        },
        name: function(value)
        {
            return /[^A-z'\ -'❜]/.test(value) === false;
        },
        password: function(value)
        {   
            if (!VALIDATORS.minlength(value, 6) || !VALIDATORS.maxlength(value, 40)) return false;

            let chars = `${value}`;
            let valid = false;

            each(VALIDATORS.specialchars, (i, char) =>
            {
                if (value.includes(char))
                {
                    valid = true;

                    return false;
                }
            });

            return valid;
        },
        url: function(value)
        {
            re = /^(www\.|[A-z]|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
            return re.test(value);
        },
        alpha: function(value)
        {
            return /[^A-z]/.test(value) === false;
        },
        alphaspace: function(value)
        {
            return /[^A-z ]/.test(value) === false;
        },
        alphanumeric: function(value)
        {
            return /[^A-z0-9]/.test(value) === false;
        },
        alphadash: function(value)
        {
            return /[^A-z-]/.test(value) === false;
        },
        alphadot: function(value)
        {
            return /[^A-z\.]/.test(value) === false;
        },
        alphadashdot: function(value)
        {
            return /[^A-z\.-]/.test(value) === false;
        },
        alphadashes: function(value)
        {
            return /[^A-z-_]/.test(value) === false;
        },
        alphadashesdot: function(value)
        {
            return /[^A-z-_\.]/.test(value) === false;
        },
        alphanumericdash: function(value)
        {
            return /[^A-z0-9-]/.test(value) === false;
        },
        alphanumericdot: function(value)
        {
            return /[^A-z0-9\.]/.test(value) === false;
        },
        alphanumericdashdot: function(value)
        {
            return /[^A-z0-9\.-]/.test(value) === false;
        },
        alphanumericdashesdot: function(value)
        {
            return /[^A-z0-9\._-]/.test(value) === false;
        },
        numeric: function(value)
        {
            return /[^0-9]/.test(value) === false;
        },
        numericdecimal: function(value)
        {
            return /[^0-9\.]/.test(value) === false;
        },
        list: function(value)
        {
            var re = /^[-\w\s]+(?:,[-\w\s]*)*$/;

            return re.test(value);
        },
        creditcard: function(value)
        {
            /*Amex Card: ^3[47][0-9]{13}$
            BCGlobal: ^(6541|6556)[0-9]{12}$
            Carte Blanche Card: ^389[0-9]{11}$
            Diners Club Card: ^3(?:0[0-5]|[68][0-9])[0-9]{11}$
            Discover Card: ^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$
            Insta Payment Card: ^63[7-9][0-9]{13}$
            JCB Card: ^(?:2131|1800|35\d{3})\d{11}$
            KoreanLocalCard: ^9[0-9]{15}$
            Laser Card: ^(6304|6706|6709|6771)[0-9]{12,15}$
            Maestro Card: ^(5018|5020|5038|6304|6759|6761|6763)[0-9]{8,15}$
            Mastercard: ^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$
            Solo Card: ^(6334|6767)[0-9]{12}|(6334|6767)[0-9]{14}|(6334|6767)[0-9]{15}$
            Switch Card: ^(4903|4905|4911|4936|6333|6759)[0-9]{12}|(4903|4905|4911|4936|6333|6759)[0-9]{14}|(4903|4905|4911|4936|6333|6759)[0-9]{15}|564182[0-9]{10}|564182[0-9]{12}|564182[0-9]{13}|633110[0-9]{10}|633110[0-9]{12}|633110[0-9]{13}$
            Union Pay Card: ^(62[0-9]{14,17})$
            Visa Card: ^4[0-9]{12}(?:[0-9]{3})?$
            Visa Master Card: ^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$*/

            var arr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
            var ccNum = String(value).replace(/[- ]/g, '');

            var
                len = ccNum.length,
                bit = 1,
                sum = 0,
                val;

            while (len)
            {
                val = parseInt(ccNum.charAt(--len), 10);
                sum += (bit ^= 1) ? arr[val] : val;
            }

            return sum && sum % 10 === 0;
        },
        minlength: function(value, min)
        {
            value = `${value}`;

            return value.length >= parseInt(min);
        },
        maxlength: function(value, max)
        {
            value = `${value}`;

            return value.length <= parseInt(max);
        }
    };

    /**
     * FormValidator
     *
     * This class is used to validate a form and 
     * also apply and classes to display form results and input errors.
     *
     */
    const FormValidator = function(form)
    {
        // Save inputs
        this._formEl = form;
        this._inputs = form_inputs(form);

        // Defaults
        this._ruleSets = [];
        this._formObj  = {};
        this._valid    = false;

        // Initialize
        this._buildRuleSets();
    }

    /**
     * Validate the form.
     *
     * @access {public}
     * @return {boolean}
     */
    FormValidator.prototype.validate = function()
    {
        // Remove all listeners
        this._unListen();

        // Clear any invalids
        this._clearForm();

        // Validate inputs
        this._validateRuleSets();

        // Show invalid inputs
        each(this._ruleSets, (i, ruleset) =>
        {
            if (!ruleset.valid) this._devalidateField(ruleset.node, ruleset.failClass);
        });

        // Listen to input changes.
        this._listen();

        return this._valid;
    }

    /**
     * Destroy the validator.
     *
     * @access {public}
     */
    FormValidator.prototype.destroy = function()
    {
        this._unListen();

        this._clearForm();

        each(this._ruleSets, (i, ruleset) =>
        {
            this._validateField(ruleset.node, ruleset.failClass);
        });
    }

    /**
     * Show form result
     *
     * @access {public}
     */
    FormValidator.prototype.showResult = function(result)
    {
        this._clearForm();

        add_class(this._formEl, result);
    }

    /**
     * Append a key/pair and return form obj
     *
     * @access {public}
     * @return {obj}
     */
    FormValidator.prototype.append = function(key, value)
    {
        this._formObj[key] = value;

        let form = this.form();

        return {...form, ...this._formObj};
    };

    /**
     * Get the form object
     *
     * @access {public}
     * @return {obj}
     */
    FormValidator.prototype.form = function()
    {
        return form_values(this._formEl);
    }

    /**
     * Build validation rule sets.
     *
     * @access {private}
     */
    FormValidator.prototype._buildRuleSets = function()
    {
        each(this._inputs, (i, input) =>
        {
            // No name or radio
            if (!input.name) return;

            let node = input;

            let required   = bool(attr(input, 'data-js-required') || attr(input, 'required'));
            let minlength  = attr(input, 'data-js-min-length') || attr(input, 'minlength');
            let maxlength  = attr(input, 'data-js-max-length') || attr(input, 'maxlength');
            let valid      = true;
            let validation = this._validationFunc(attr(input, 'data-js-validation'));
            let failClass  = attr(input, 'data-js-validation-fail') || 'danger'; 

            this._ruleSets.push({node, required, minlength, maxlength, validation, failClass, valid});
        });
    }

    /**
     * Returns the validation callback function by name.
     *
     * @access {private}
     * @param  {String}   name Validation name
     * @return {Function}
     */
    FormValidator.prototype._validationFunc = function(name)
    {
        if (!name) return;

        let key = name.replaceAll('-', '').toLowerCase();

        if (!VALIDATORS[key]) throw new error(`Unsupported input validation [${name}].`)

        return VALIDATORS[key];
    }

    /**
     * Validate all rule sets.
     *
     * @access {private}
     * @return {Boolean}
     */
    FormValidator.prototype._validateRuleSets = function()
    {
        this._valid = true;

        each(this._ruleSets, (i, ruleset) => { this._validateRuleSet(ruleset) });
        
        return this._valid;
    }

    /**
     * Validate an individual ruleset.
     *
     * @access {private}
     * @param  {Object}  ruleset Ruleset to validate
     * @return {Boolean}
     */
    FormValidator.prototype._validateRuleSet = function(ruleset)
    {
        let value = input_value(ruleset.node);

        // Skip radios, they don't have any validation
        if (ruleset.node.type === 'radio') return true;
        
        if (ruleset.required && is_empty(value))
        {
            this._valid = false;
            ruleset.valid = false;
        }
        else if (ruleset.minlength && !VALIDATORS.minlength.call(null, value, ruleset.minlength))
        {
            this._valid = false;
            ruleset.valid = false;
        }
        else if (ruleset.maxlength && !VALIDATORS.maxlength.call(null, value, ruleset.maxlength))
        {
            this._valid = false;
            ruleset.valid = false;
        }
        else if (is_callable(ruleset.validation) && !ruleset.validation.call(null, value))
        {
            this._valid = false;
            ruleset.valid = false;
        }
        else
        {
            ruleset.valid = true;
        }

        return ruleset.valid;
    }

    /**
     * Listen to input
     *
     * @access {private}
     * @param  {HTMLElement} node Input
     */
    FormValidator.prototype._listen = function()
    {
        each(this._ruleSets, (i, ruleset) => 
        {
            on(ruleset.node, 'input, change', this._liveValidate, this);
        });
    }

    /**
     * Listen to inputs.
     *
     * @access {private}
     */
    FormValidator.prototype._unListen = function()
    {
        each(this._ruleSets, (i, ruleset) => 
        {
            off(ruleset.node, 'input, change', this._liveValidate, this);
        });
    }

    /**
     * Live validate an input.
     *
     * @access {private}
     * @param  {Object}      e     Event
     * @param  {HTMLElement} input Input
     */
    FormValidator.prototype._liveValidate = function(e, input)
    {
        each(this._ruleSets, (i, ruleset) => 
        {
            if (ruleset.node === input)
            {
                let valid = this._validateRuleSet(ruleset);

                valid ? this._validateField(input, ruleset.failClass) : this._devalidateField(input, ruleset.failClass);
            }
        });
    }

    /**
     * Show form field as valid.
     *
     * @access {private}
     * @param  {HTMLElement} node Input
     */
    FormValidator.prototype._validateField = function(input, failClass)
    {
        let fieldWrap = closest(input, '.form-field');

        if (fieldWrap) remove_class(fieldWrap, ['info', 'success', 'warning', 'danger', failClass]);
    }

    /**
     * Show form field as invalid.
     *
     * @access {private}
     */
    FormValidator.prototype._devalidateField = function(input, failClass)
    {
        let fieldWrap = closest(input, '.form-field');

        if (fieldWrap) add_class(fieldWrap, failClass);
    }

    /**
     * Clear form results.
     *
     * @access {private}
     */
    FormValidator.prototype._clearForm = function()
    {
        // Remove the form result
        remove_class(this._formEl, ['info', 'success', 'warning', 'danger']);
    }

    // Load into container
    frontbx.set('FormValidator', FormValidator);

})();

// JSX
(function()
{
	/**
	 * Currently rendering Component.
	 *
	 * @var  {Osbject}
	 */
	const CURR_RENDER =
	{
	    current: null
	};
	
	/**
	 * Bindings / variable caching.
	 *
	 * @var  {Osbject}
	 */
	const BINDINGS_CACHE = {};
	
	// Assume a browser environment.
	const RESERVED_WORDS =
	[
	    'break',
	    'do',
	    'in',
	    'typeof',
	    'case',
	    'else',
	    'instanceof',
	    'var',
	    'let',
	    'catch',
	    'export',
	    'new',
	    'void',
	    'class',
	    'extends',
	    'return',
	    'while',
	    'const',
	    'finally',
	    'super',
	    'with',
	    'continue',
	    'for',
	    'switch',
	    'yield',
	    'debugger',
	    'function',
	    'this',
	    'delete',
	    'import',
	    'try',
	    'enum',
	    'implements',
	    'package',
	    'protected',
	    'static',
	    'interface',
	    'private',
	    'public',
	    'eval',
	    'global',
	    'process',
	    'module',
	    'require',
	    'document',
	    'window',
	    'Window',
	    'Function',
	    'JSON',
	    'Object',
	    'Array',
	    'String',
	    'Boolean',
	    'Number',
	    'Date',
	    'RegExp',
	    'Error',
	    'EvalError',
	    'RangeError',
	    'ReferenceError',
	    'SyntaxError',
	    'TypeError',
	    'URIError',
	    'frontbx',
	    'jsx',
	    '__defineGetter__',
	    '__defineSetter__',
	    '__lookupGetter__',
	    '__lookupSetter__',
	    '__proto__',
	    'callee',
	    'caller',
	    'constructor',
	    'hasOwnProperty',
	    'isPrototypeOf',
	    'propertyIsEnumerable',
	    'prototype',
	    'toLocaleString',
	    'toString',
	    'valueOf',
	    'localStorage',
	    'sessionStorage',
	    'cookie',
	];
	
	/**
	 * Fragment.
	 *
	 * @var  {Function}
	 */
	const Fragment = function(props)
	{
	    return props.children;
	}
	
	/**
	 * Local lexer.
	 * 
	 * @var {Function}
	 */
	var lexer;
	
	/**
	 * Local tokenizer.
	 * 
	 * @var {Function}
	 */
	var Tokenizer;
	
	/**
	 * Local parser.
	 * 
	 * @var {Function}
	 */
	var Parser;
	
	/**
	 * Local createElement.
	 * 
	 * @var {Function}
	 */
	var createElement;
	
	/**
	 * Local sanbox.
	 * 
	 * @var {Function}
	 */
	var sandbox;
	
	/**
	 * Local jsx.
	 * 
	 * @var {Function}
	 */
	var jsx;
	
	/**
	 * Local children.
	 * 
	 * @var {Function}
	 */
	var children;
	(function()
	{    
	    /**
	     * Utility Regexes.
	     * 
	     * @var {Regexp}
	     */
	    const SPACE = /[\t\r\n\f ]/;
	    const ALPHA = /[A-z]/;
	    const ALPHA_DASH = /[A-z-]/;
	    const QUOTES = ['"', '\'', '`'];
	
	    /**
	     * Void tags.
	     * 
	     * @var {Array}
	     */
	    const VOID_ELS =
	    [
	        'area',
	        'base',
	        'br',
	        'circle',
	        'col',
	        'ellipse',
	        'embed',
	        'hr',
	        'img',
	        'input',
	        'line',
	        'link',
	        'meta',
	        'param',
	        'polygon',
	        'polyline',
	        'rect',
	        'source',
	        'track',
	        'use',
	        'wbr',
	        'doctype',
	    ];
	
	    /**
	     * Lexer.
	     * 
	     * @param {String}   html
	     * @param {Function} emit
	     */
	    const Lexer = function(html, emit)
	    {
	        this.html = html;
	        this.emit = emit;
	        this.currentTag  = null;
	        this.pos         = 0;
	        this.braceDepth  = 0;
	        this.attrValStack = [];
	    }
	
	    /**
	     * Parse and emit.
	     * 
	     * @access {public}
	     */
	    Lexer.prototype.parse = function()
	    {
	        let scan = 'text';
	
	        while (scan = this[scan](this.peek()));
	
	        if (this.html === '')
	        {
	            scan = null;
	
	            this.complete();
	        }
	    }
	
	    /**
	     * next.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.next = function()
	    {
	        return this.html.charAt(this.pos++);
	    }
	
	    /**
	     * peek next.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.peek = function()
	    {
	        return this.html.charAt(this.pos);
	    }
	
	    /**
	     * peek next.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.peekback = function()
	    {
	        return this.html.charAt(this.pos -1);
	    }
	
	    /**
	     * peek n chars.
	     * 
	     * @access {private}
	     * @param  {Integer} n
	     * @return {String}
	     */
	    Lexer.prototype.peekn = function(n)
	    {            
	        return this.html.slice(this.pos, this.pos + n);
	    }
	
	    /**
	     * Chunk position buffer.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.chunk = function()
	    {
	        let buff = this.html.slice(0, this.pos);
	        
	        this.consume(this.pos);
	
	        return buff;
	    }
	
	    /**
	     * consume n chars.
	     * 
	     * @access {private}
	     * @param  {Integer} n
	     */
	    Lexer.prototype.consume = function(n)
	    {
	        this.html = this.html.substr(n);
	
	        this.pos  = 0;
	    }
	
	    /**
	     * consume whitespace.
	     * 
	     * @access {private}
	     */
	    Lexer.prototype.whitespace = function()
	    {
	        while (SPACE.test(this.peek()) && this.next());
	
	        this.consume(this.pos);
	    }
	
	    /**
	     * Scan until chars
	     * 
	     * @access {private}
	     * @return {Boolean}
	     */
	    Lexer.prototype.scan = function(chars)
	    {
	        let len = chars.length;
	
	        while (this.peekn(len) !== chars)
	        {
	            if (!this.next()) break;
	        }
	
	        return this.html.slice(0, this.pos);
	    }
	
	    /**
	     * JSX spread attribute.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.bufferjsx = function()
	    {
	        let braceDepth = 0;
	
	        // Collect the intial spread
	        let jsx = this.buffer((char) =>
	        {
	            if (char === '{')
	            {
	                braceDepth++;
	            }
	            else if (char === '}')
	            {
	                braceDepth--;
	            }
	
	            if (braceDepth === 0) return true;
	        });
	
	        if (braceDepth > 0) throw new Error('Unclosed JSX bracket found');
	
	        this.next();
	
	        return this.chunk();
	    }
	
	    /**
	     * Buffer until callback on each char
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.buffer = function(validator)
	    {
	        let buff = '';
	
	        while (!validator(this.peek(), buff))
	        {
	            let n = this.peek();
	
	            if (n === '') break;
	
	            buff += n;
	
	            this.next();
	        }
	        
	        return buff;
	    }
	
	    /**
	     * Complete.
	     * 
	     */
	    Lexer.prototype.complete = function()
	    {
	        this.emit('complete');
	    }
	
	    /**
	     * Text default state.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.text = function()
	    {
	        if ('>' == this.peek()) this.consume(1);
	        
	        let next = false;
	
	        let buff = this.buffer((char) => 
	        { 
	            // JSX Func was left open
	            if (
	                    (
	                        this.braceDepth > 0 && (char !== '>' && char !== '<') 
	                    ) 
	                    ||
	                    (
	                        this.peekback() !== '\\' && (char === '{' || char === '}')
	                    )
	                )
	            {
	                next = 'jsx_block';
	
	                return true;
	            }
	
	            if (char === '<' && !SPACE.test(this.peek()))
	            {
	                next = 'tag_open';
	
	                return true;
	            }
	        });
	
	        if (buff && buff !== '<')
	        {
	            this.consume(buff.length);
	
	            this.emit('text', buff);
	        }
	
	        if (next === 'tag_open') this.consume(1);
	
	        return next;
	    }
	
	    /**
	     * Tag open.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.tag_open = function(char)
	    {                
	        // Markup declaration
	        if (char === '!')
	        {
	            this.consume(1);
	
	            return 'markup_declaration_open';
	        }
	
	        // Bogus tag
	        if (char === '?')
	        {
	            this.consume(1);
	
	            return 'bogus_tag';
	        }
	
	        // Close
	        if (char === '/')
	        {
	            this.consume(1);
	
	            return 'tag_close';
	        }
	
	        let tag = this.buffer(char => SPACE.test(char) || char === '>');
	
	        if (tag.length === 0) throw new Error('Empty tag name.');
	
	        this.consume(tag.length);
	
	        this.currentTag = tag;
	
	        this.emit('tag:open', tag);
	
	        return 'attr_key';
	    }
	
	    /**
	     * Tag close self close. Reached after "/" in a tag.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.tag_close_self = function()
	    {
	        // Consume any whitespace
	        this.whitespace();
	
	        // Emit and close the tag.
	        if ('>' === this.peek())
	        {
	            this.currentTag = null;
	
	            this.emit('tag:close:self', '');
	
	            return 'text';
	        }
	
	        // Fallback to error.
	        throw new Error('Invalid self closing tag.');
	    }
	
	    /**
	     * Tag close self close. Reached after ">" in void tag.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.tag_close_void = function()
	    {
	        this.consume(1);
	
	        this.currentTag = null;
	
	        this.emit('tag:close:void');
	
	        return 'text';
	    }
	
	    /**
	     * Tag close.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.tag_close = function()
	    {
	        let tag = this.buffer(char => char === '>');
	        
	        this.consume(tag.length);
	        
	        this.emit('tag:close', tag);
	
	        this.currentTag = null;
	        
	        return 'text';
	    }
	
	    /**
	     * Attribute key.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.attr_key = function()
	    {
	        this.whitespace();
	
	        if ('>' === this.peek())
	        {
	            if (this.currentTag && VOID_ELS.includes(this.currentTag)) return 'tag_close_void';
	
	            this.consume(1);
	
	            return 'text';
	        }
	
	        if ('/' === this.peek())
	        {
	            this.consume(1);
	
	            return 'tag_close_self';
	        }
	
	        if ('{' === this.peek()) return 'attr_jsx_spread';
	        
	        let attr = this.buffer(char => SPACE.test(char) || char === '=' || char === '>');
	
	        this.consume(attr.length);
	        
	        if (attr) this.emit('attr:key', attr);
	
	        let peek = this.peek();
	
	        if (peek === '=')
	        {
	            this.consume(1);
	
	            return 'attr_val';
	        }
	
	        if (peek === '>')
	        {
	            if (this.currentTag && VOID_ELS.includes(this.currentTag)) return 'tag_close_void';
	
	            this.consume(1);
	
	            return 'text';
	        }
	
	        if (SPACE.test(peek))
	        {
	            this.consume(1);
	            
	            return 'attr_key';
	        }
	    }
	
	    /**
	     * Attribute value.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.attr_val = function()
	    {
	        // Clear out whitespace
	        this.whitespace();
	
	        if (this.peek() === '{') return 'attr_val_jsx';
	
	        let end;
	
	        if ('"' == this.peek()) end = '"';
	        
	        if ('\'' == this.peek()) end = '\'';
	
	        if (!end) throw new Error('Unquoted attribute value.');
	
	        // Remove starting quote
	        this.consume(1);
	
	        // Cache end marker
	        this.attrValEnd = end;
	
	        // Buffer untill closed or jsx is found
	        let buff = this.buffer(char => this.peekback() !== '\\' && (char === '{' || char === end ));
	
	        // JSX was found
	        if (this.peek() === '{')
	        {
	            this.consume(buff.length);
	
	            this.attrValStack.push(buff);
	            
	            return 'attr_val_interpolated';
	        }
	        
	        // Remove end quote plus value
	        this.consume(buff.length + 1);
	
	        this.emit('attr:val', buff);
	
	        // Stop
	        if (this.html === '') throw new Error('Unclosed attribute value.');
	
	        return 'attr_key';
	    }
	
	    /**
	     * When reached an opening jsx bracket "{" inside a quoted attribute value.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.attr_val_interpolated = function()
	    {
	        // Buffer untill closed or jsx is found
	        this.buffer(char => this.peekback() !== '\\' && char === '}');
	
	        // Add closing bracket
	        this.next();
	
	        // Consume buff
	        let jsx = this.chunk();
	        
	        // Push attr to stack
	        this.attrValStack.push(`\$${jsx}`);
	
	        // Buffer to an opening jsx bracket or end of attribute vlaue
	        let buff = this.buffer(char => this.peekback() !== '\\' && (char === '{' || char === this.attrValEnd ));
	
	        // JSX was found
	        if (this.peek() === '{')
	        {
	            this.consume(buff.length);
	
	            this.attrValStack.push(buff);
	            
	            return 'attr_val_interpolated';
	        }
	
	        // Consume buff plus ending quote marker
	        this.consume(buff.length + 1);
	
	        // Don't empty quotes
	        if (buff.length >= 1) this.attrValStack.push(buff);
	
	        this.emit('attr:val:interpolated', this.attrValStack.join(''));
	
	        this.attrValStack = [];
	
	        return 'attr_key';
	    }
	
	    /**
	     * JSX atribute value.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.attr_val_jsx = function()
	    {
	        this.emit('attr:val:jsx', this.bufferjsx().trim());
	
	        return 'attr_key';
	    }
	
	    /**
	     * JSX spread attribute.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.attr_jsx_spread = function()
	    {
	        this.emit('attr:jsx:spread', this.bufferjsx().trim());
	
	        return 'attr_key';
	    }
	
	    /**
	     * Bogus tag.
	     * 
	     * @access {private}
	     * @throws
	     */
	    Lexer.prototype.bogus_tag = function()
	    {
	        this.html = '';
	
	        throw new Error('Invalid [<?] tag in html.');
	    }
	
	    /**
	     * Comment open, cdata open or doctype declartion.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.markup_declaration_open = function()
	    {
	        let char = this.peek();
	
	        if (this.peekn(2) === '--')
	        {
	            this.consume(2);
	
	            return 'comment_start';
	        }
	
	        if (this.peek() === '[')
	        {
	            this.consume(1);
	
	            return 'cdata_start';
	        }
	        
	        this.whitespace();
	
	        if (ALPHA.test(this.peek())) return 'doc_type';
	
	        throw new Error('Invalid comment (comments should start with <!--');
	    }
	
	    /**
	     * Doctype declaration.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.doc_type = function()
	    {
	        if (!this.html.startsWith('DOCTYPE ')) throw new Error('Invalid doctype declaration');
	        
	        this.emit('doctype', '<!DOCTYPE');
	
	        this.consume(8);
	
	        let buf = this.buffer(char => char === '>' || SPACE.test(char));
	
	        if (buf.length <= 1) throw new Error('Invalid doctype declaration');
	
	        this.consume(buf.length);
	
	        this.emit('doctype:declaration', buf);
	
	        return 'doc_type_attr';
	    }
	
	    /**
	     * Doctype attribute.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.doc_type_attr = function()
	    {
	        // Consume space
	        this.whitespace();
	
	        // Closed doctype
	        if ('>' == this.peek())
	        {
	            this.currentTag = null;
	
	            this.emit('doctype:close:self', '');
	
	            return 'text';
	        }
	
	        // Doc types don't have "key=value" attributes, only attributes
	        // e.g  PUBLIC
	        // e.g  "-//W3C//DTD HTML 4.01 Transitional//EN"        
	        let end = SPACE;
	        
	        if ('"' == this.peek()) end = /"/;
	        
	        if (end !== SPACE) this.consume(1);
	
	        let buf = this.buffer(char => end.test(char) || char === '>');
	        
	        this.consume(buf.length);
	        
	        if (end !== SPACE) this.consume(1);
	        
	        this.emit('doctype:attr', end !== SPACE ? `"${buf}"` : buf);
	
	        return 'doc_type_attr';       
	    }
	
	    /**
	     * Comment start.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.comment_start = function()
	    {
	        if (this.peek() === '[') return 'conditional_comment_open';
	
	        this.emit('comment:open', '<!--');
	
	        let buff = this.scan('-->');
	
	        this.consume(buff.length);
	
	        this.emit('comment:body', buff);
	
	        this.consume(3);
	
	        this.emit('comment:close', '-->');
	
	        return 'text';
	    }
	
	    /**
	     * Conditional comment open.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.conditional_comment_open = function()
	    {
	        if (this.peekn(4) !== '[if ') throw new Error('Invalid conditional comment');
	
	        let buff = this.scan(']>');
	
	        this.consume(buff.length -1);
	
	        this.emit('comment:open', `<!--${buff}]>`);
	
	        this.consume(3);
	
	        return 'conditional_comment';
	    }
	
	    /**
	     * Conditional comment.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.conditional_comment = function()
	    {
	        let buff = this.scan('<![endif]-->');
	
	        this.consume(buff.length);
	
	        this.emit('comment:body', buff);
	
	        this.consume(12);
	
	        this.emit('comment:close', '<![endif]-->');
	
	        return 'text';
	    }
	
	    /**
	     * cdata start.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.cdata_start = function()
	    {
	        if (!this.html.startsWith('CDATA[')) throw new Error('Invalid doctype declaration');
	        
	        this.consume(6);
	
	        this.emit('cdata:open', '<![CDATA[');
	
	        let buff = this.scan(']]>');
	    
	        this.consume(buff.length);
	
	        this.emit('cdata:body', buff);
	
	        this.consume(3);
	
	        this.emit('cdata:close', ']]>');
	
	        return 'text';
	    }
	
	    /**
	     * JSX.
	     * 
	     * @access {private}
	     * @return {String}
	     */
	    Lexer.prototype.jsx_block = function()
	    {        
	        let blockpeth = 0;
	        let opened = this.braceDepth >= 1;
	
	        this.buffer((char, chunk) =>
	        {
	            if (this.peekback() !== '\\')
	            {
	                if (char === '{')
	                {
	                    this.braceDepth++;
	                    blockpeth++;
	                }
	                else if (char === '}')
	                {
	                   this.braceDepth--;
	                   blockpeth--;
	                }
	
	                if (this.braceDepth === 0 || char === '<')
	                {
	                    if (char === '}') this.next();
	
	                    return true;
	                }
	
	                // JSX inside neseted jsx function
	                if (blockpeth === 0 && chunk[0] === '{')
	                {
	                    this.next();
	
	                    return true;
	                }
	            }
	        });
	
	        let buff = this.chunk();
	
	        let jsx = buff.trim();
	
	        // Open / close
	        if (jsx[0] === '{' && jsx.substr(-1) === '}')
	        {
	            this.emit('jsx', buff);
	        }
	
	        // Close jsx
	        else if ((jsx[0] === ')' || jsx[0] === '}') && opened)
	        {
	            this.emit('jsx:close', buff);
	        }
	
	        // Open
	        else if (jsx.substr(-1) === '(' || jsx.substr(-1) === '{' || this.braceDepth >= 1)
	        {
	            this.emit('jsx:open', buff);
	        }
	
	        // Nested
	        else if (this.braceDepth >= 1)
	        {
	            this.emit('jsx:open', buff);
	        }
	
	        return 'text';  
	    }
	
	    /**
	     * Lexer parse function.
	     * 
	     * @param {String}   html
	     * @param {Function} emit
	     */
	    lexer = function(html, emitter)
	    {
	        let l = new Lexer(html, emitter);
	
	        l.parse();
	    }
	})();
	(function()
	{
	    Tokenizer = function(htmlstr)
	    {
	        this.htmlstr = htmlstr;
	
	        this.stack = { children: [] };
	        
	        this.currAttr = null;
	
	        this.curr = this.stack;
	
	        this.parent = [];
	
	        this.currtoken;
	    }
	
	    Tokenizer.prototype.parse = function()
	    {
	        const delegate = (token, value) => 
	        {
	            this.readtoken(token, value);
	        }
	
	        lexer(this.htmlstr, delegate);
	
	        return this.stack.children;
	    }
	
	    Tokenizer.prototype.pushNode = function(node)
	    {
	        this.curr.children.push(node);
	
	        this.parent.push(this.curr);
	
	        this.curr = node;
	    }
	
	    Tokenizer.prototype.pushValue = function(val)
	    {
	        this.curr.value += val;
	    }
	
	    Tokenizer.prototype.pushChild = function(node)
	    {        
	        this.curr.children.push(node);
	    }
	
	    Tokenizer.prototype.closeNode = function()
	    {
	        this.curr = this.parent.pop();
	    }
	
	    Tokenizer.prototype.pushAttr = function(value)
	    {
	        this.curr.attrs[value] = 'true';
	
	        this.currAttr = value;
	    }
	
	    Tokenizer.prototype.pushAttrSpread = function(value)
	    {
	        this.curr.spreadAttribute = value;
	    }
	
	    Tokenizer.prototype.pushAttrVal = function(value)
	    {
	        this.curr.attrs[this.currAttr] = value;
	
	        this.currAttr = null;
	    }
	
	    Tokenizer.prototype.pushJsx = function(value)
	    {
	        this.pushChild(this.node('#jsx', value));
	    }
	
	    Tokenizer.prototype.openJsx = function(value)
	    {   
	        let node = this.node('#jsx:function');
	
	        node.open = value;
	
	        this.pushNode(node);
	    }
	
	    Tokenizer.prototype.closeJsx = function(value)
	    {    
	        while (this.curr.type !== '#jsx:function')
	        {
	            this.curr = this.parent.pop();
	        }
	
	        this.curr.close = value;
	
	        this.curr = this.parent.pop();
	    }
	
	    Tokenizer.prototype.node = function(type, value, children)
	    {
	        let attrs = {};
	        children  = children || [];
	
	        return { type, value, children, attrs };
	    }
	
	    Tokenizer.prototype.readtoken = function(token, value)
	    {
	        this.currtoken = token;
	
	        switch (token)
	        {
	            case 'text':
	                this.pushChild({type: '#text', value: value});
	                break;
	
	            case 'tag:open':
	                this.pushNode(this.node(value[0].toLowerCase() === value[0] ? '#element' : (value === 'Fragment' ? '#fragment' : '#component'), value));
	                break;
	
	            case 'tag:close:void':
	            case 'tag:close:self':
	            case 'tag:close':
	                this.closeNode();
	                break;
	
	            case 'jsx':
	                this.pushJsx(value);
	                break;
	
	            case 'jsx:open':
	                this.openJsx(value);
	                break;
	
	            case 'jsx:close':
	                this.closeJsx(value);
	                break;
	
	            case 'attr:key':
	                this.pushAttr(value);
	                break;
	
	            case 'attr:jsx:spread':
	                this.pushAttrSpread(value);
	                break;
	
	            case 'attr:val':
	            case 'attr:val:jsx':
	                this.pushAttrVal(value);
	                break;
	
	            case 'attr:val:interpolated':
	                this.pushAttrVal(`\`${value}\``);
	                break;
	
	            case 'comment:open':
	                this.pushNode(this.node('#comment', value));
	                break;
	
	            case 'comment:body':
	                this.pushValue(value);
	                break;
	
	            case 'comment:close':
	                this.pushValue(value);
	                this.closeNode();
	                break;
	
	        }
	
	        this.prev = token;
	    }
	
	})();
	(function()
	{
	    /**
	     * Helpers.
	     *
	     * @var  {Function}
	     */
	    const [is_array, each, map] = frontbx.import(['is_array','each','map']).from('_');
	
	    /**
	     * Cache.
	     *
	     * @var  {object}
	     */
	    const CACHE_STR = {};
	
	    /**
	     * Helper function.
	     *
	     * @param  {String} str
	     * @return {String}
	     */
	    function sanitizeQuotes(str)
	    {
	        return str.replaceAll(/(?<!\\)'/g, '\\\'');
	    }
	
	    /**
	     * Parser. Parses tokenized input into 'createElement' statement. 
	     *
	     * @param  {string}  jsxStr  JSX  string
	     */
	    Parser = function(jsxStr)
	    {
	        this.jsxStr = jsxStr;
	    }
	
	    /**
	     * Parse current string.
	     *
	     * @returns {object}
	     */
	    Parser.prototype.parse = function()
	    {
	        let useCache = this.jsxStr.length < 720;
	
	        if (useCache && CACHE_STR[this.jsxStr]) return CACHE_STR[this.jsxStr];
	
	        // tokenize and create
	        let funcString = this.genChildren((new Tokenizer(this.jsxStr)).parse());
	
	        if (useCache)
	        {
	            return CACHE_STR[this.jsxStr] = funcString;
	        }
	
	        return funcString;
	    }
	
	    /**
	     * Generates 'createElement' string tag
	     *
	     * @param   {object}  el  Token element
	     * @returns {strng}
	     */
	    Parser.prototype.genTag = function(el)
	    {
	        let children = this.genChildren(el.children, el);
	        let props    = this.genProps(el.attrs, el);
	        let tag      = el.type === '#component' || el.type === '#fragment' ? el.value : `'${el.value}'`;
	
	        return `h(${tag},${props},${children})`;
	    }
	
	    /**
	     * Generates props from token
	     *
	     * @param   {object}  props  Prop values
	     * @param   {object}  el     Target token
	     * @returns {strng}
	     */
	    Parser.prototype.genProps = function(props, el)
	    {
	        if (!props && !el.spreadAttribute) return 'null';
	
	        let spread;
	
	        if (el.spreadAttribute)
	        {
	            spread = /^\{\s?\{/.test(el.spreadAttribute) ? el.spreadAttribute.substring(1).trim().slice(0, -1).trim() : el.spreadAttribute; 
	        }
	
	        let attrs = [];
	
	        each(props, (key, prop) => attrs.push(`'${key}':${this.genPropValue(prop)}`));
	
	        if (spread) return `Object.assign({}, ${spread}, {${attrs.join(', ')}})`;
	
	        return `{${attrs.join(', ')}}`;
	    }
	
	    /**
	     * Generates props value.
	     *
	     * @param   {mixed}  val  Prop values
	     * @returns {strng}
	     */
	    Parser.prototype.genPropValue = function(val)
	    {
	        if (val.startsWith('{')) return val.substring(1).trim().slice(0, -1).trim();
	
	        if (val.startsWith('`')) return val;
	
	        return `'${sanitizeQuotes(val)}'`;
	    }
	
	    /**
	     * Generates children for tag.
	     *
	     * @param  {array}  Children  Array of child tokens.
	     * @param  {strng}  parent    Parant token
	     * @param  {string} glue      Optional glue string
	     */
	    Parser.prototype.genChildren = function(children, parent, glue)
	    {
	        if (parent && (!parent.children || !parent.children.length)) return 'null';
	
	        return map(children, (i, child) => 
	        {
	            if (child.type === '#jsx') return child.value.substring(1).trim().slice(0, -1).trim();
	            
	            if (child.type === '#text') return `'${sanitizeQuotes(child.value)}'`;
	
	            if (child.type === '#comment') return `h('comment',{},'${sanitizeQuotes(child.value.substring(4).slice(0, -3))}')`;
	
	            if (child.type === '#jsx:function')
	            {
	                let open  = child.open.trim().substring(1).trim();
	                let close = child.close.trim().slice(0, -1).trim();
	
	                return `${open} ${this.genChildren(child.children, null)} ${close}`;
	            }
	
	            if (child) return this.genTag(child);
	
	            return false;
	
	        }).join(glue || ', ');
	    }
	
	})();
	(function()
	{    
	    /**
	     * Helpers.
	     *
	     * @var  {Function}
	     */
	    const [map, each, object_props, clone_deep] = frontbx.import(['map','each','object_props','clone_deep']).from('_');
	
	    // Produce the code to shadow all globals in the environment
	    // through lexical binding.
	    // See also var `builtins`.
	    const BUILT_INS_STR =
	    [
	        'JSON',
	        'Object',
	        'Function',
	        'Array',
	        'String',
	        'Boolean',
	        'Number',
	        'Date',
	        'RegExp',
	        'Error',
	        'EvalError',
	        'RangeError',
	        'ReferenceError',
	        'SyntaxError',
	        'TypeError',
	        'URIError'
	    ];
	
	    const DISSALOWEDES =
	    {
	        // disallowed
	        global: undefined,
	        process: undefined,
	        module: undefined,
	        require: undefined,
	        document: undefined,
	        window: undefined,
	        Window: undefined,
	        // no evil...
	        eval: undefined,
	        Function: undefined
	    };
	
	    // Variable identifiers
	    const IDENTIFIER = /^[$_a-zA-Z][$_a-zA-Z0-9]*$/;
	
	    // Keep in store all real builtin prototypes to restore them after
	    // a possible alteration during the evaluation.
	    const BUILT_INS  = map(BUILT_INS_STR, (i, name) => (window || global)[name] );
	    const COPIES     = new Array(BUILT_INS.length);
	    const PROTO_KEYS = map(new Array(BUILT_INS.length), (i) => object_props(BUILT_INS[i], true));
	
	    // Sandbox name
	    const SANDBOX_NAME = '$sandbox$';
	
	    const acceptableVariable = function(v)
	    {
	        return !RESERVED_WORDS.includes(v) && IDENTIFIER.test(v);
	    }
	
	    const resetEnv = function()
	    {
	        let resets = map(object_props(window || global, true), (i, v) => acceptableVariable(v) ? v : false);
	
	        return `var ${resets.join(',')}, undefined;`;
	    }
	
	    // Fake all builtins' prototypes.
	    const alienate = function()
	    {
	        each(BUILT_INS_STR, (i) => typeof COPIES[i] === 'undefined' ? COPIES[i] = clone_deep(BUILT_INS[i]) : null);
	    }
	
	    // Restore all builtins' prototypes.
	    const unalienate = function()
	    {
	        let g = window || global;
	
	        each(BUILT_INS_STR, (i, name) =>
	        {
	            // Reset global
	            g[name] = BUILT_INS[i];
	
	            // Delete altered prototypes
	            let realKeys = PROTO_KEYS[i];
	            let currKeys = object_props(BUILT_INS[i], true);
	            let diff     = currKeys.filter(x => !realKeys.includes(x));
	
	            if (diff.length >= 1) each(diff, (i, key) => BUILT_INS[i][key] = undefined);
	        });
	    }
	
	    const genBindings = function(bindings)
	    {
	        // Sanitize bindings
	        bindings = map(bindings, (k, v) => acceptableVariable(k) ? v : false);
	
	        // Add in default built in protos
	        each(BUILT_INS_STR, (i, name) => bindings[name] = COPIES[i]);
	
	        // Merge with GLOBALS and DISSALOWEDES
	        return {...bindings, ...DISSALOWEDES}; 
	    }
	
	    // Evaluate code as a String (`source`) without letting global variables get
	    // used or modified. The `sandbox` is an object containing variables we want
	    // to pass in.
	    sandbox = function(source, bindings, context)
	    {
	        alienate();
	
	        bindings = genBindings(bindings || {});
	
	        context = context || null;
	
	        let func = 'this.constructor.constructor = function () {};\nvar ';
	
	        each(bindings, (key, value) => func += `${key} = ${SANDBOX_NAME}['${key}'],\n`);
	
	        func += `undefined;\n${resetEnv()}\n return ${source};`;
	        
	        let ret;
	
	        ret = Function(SANDBOX_NAME, func).call(context, bindings);
	
	        unalienate();
	
	        return ret;
	    }
	
	})();
	(function()
	{
	    /**
	     * Helpers.
	     *
	     * @var  {Function}
	     */
	    const [array_filter, dom_element, is_empty, each, is_array, is_object, is_bool, is_constructed, is_constructable, is_function, is_htmlElement, is_null, is_number, is_string, is_undefined, map, str_replace] = frontbx.import(['array_filter','dom_element','is_empty','each','is_array','is_object','is_bool','is_constructed','is_constructable','is_function','is_htmlElement','is_null','is_number','is_string','is_undefined','map','str_replace']).from('_');
	
	    /**
	     * JSX create element.
	     *  
	     * @param   {string | function}   tag         Root html element
	     * @param   {object | undefined}  attrs       Tag props / attributes
	     * @param   {array | undefined}  ...children  Tag children (recursive)
	     * @returns {Array|HTMLElement}
	     */
	    createElement = function(tag, attributes)
	    {
	        // Empty
	        if (arguments.length === 0) return document.createTextNode('');
	
	        // Get children
	        let children = arguments.length > 2 ? array_filter([].slice.call(arguments, 2)) : [];
	
	        // Special case for text
	        if (tag === 'text') return document.createTextNode(children.toString());
	
	        // Special case for comments
	        if (tag === 'comment') return document.createComment(children.toString());
	
	        // Normalise children
	        children = _normaliseChildren(children.length === 0 && attributes.children && !is_empty(attributes.children) ? attributes.children : children);
	
	        let node = is_function(tag) || is_constructed(tag) ? _createComponent(tag, {...attributes, children}) : dom_element({...attributes, children, tag});
	
	        //if (is_array(node) || Object.prototype.toString.call(node).toLowerCase() === '[object text]') return node;
	
	        //each(children, (i, child) => node.appendChild(child));
	
	        return node;
	    }
	
	    /**
	     * Create component.
	     *
	     * @access {private}
	     * @param  {HTMLElement} vnode
	     * @param  {HTMLElement} parentDOMElement
	     * @return {Array}
	     */
	    function _createComponent(component, attributes)
	    {        
	        let { render, props } = _comoponentRenderFn(component, attributes);
	
	        BINDINGS_CACHE.props = props;
	
	        let rendered = render(props);
	
	        if (is_htmlElement(rendered))
	        {
	            //if (children.nodeType === 1) frontbx.dom().refresh(children);
	
	            return rendered;
	        }
	        else if (is_array(rendered))
	        {
	            //if (children.nodeType === 1) frontbx.dom().refresh(children);
	
	            return _normaliseChildren(rendered);
	        }
	
	        let toJsx = jsx(rendered);
	
	        //if (children.nodeType === 1) frontbx.dom().refresh(children);
	
	        return toJsx;
	    }
	
	    /**
	     * Get component render function.
	     *
	     * @access {private}
	     * @param  {String}   name
	     * @return {Function}
	     */
	    function _comoponentRenderFn(fn, props)
	    {
	        if (is_constructed(fn))
	        {           
	            if (!fn.render) throw new Error('Object Components must implement the [render] method');
	
	            CURR_RENDER.current = fn;
	
	            if (fn.defaultProps) props = {...fn.defaultProps, ...props };
	
	            return { render: fn.render, props };
	        }
	
	        if (is_constructable(fn))
	        {
	            let component = new fn;
	
	            if (!component.render) throw new Error('Object Components must implement the [render] method');
	
	            CURR_RENDER.current = component;
	
	            if (component.defaultProps) props = {...component.defaultProps, ...props };
	
	            return { render: component.render, props };
	        }
	
	        if (!is_function(fn)) throw new Error(`Invalid Component [${name}]`);
	
	        CURR_RENDER.current = fn;
	
	        if (fn.defaultProps) props = {...fn.defaultProps, ...props };
	
	        return { render: fn, props };
	    }
	
	    /**
	     * Caches and returns a children function.
	     *
	     * @access {private}
	     * @param  {String} key   Cached callback key
	     * @param  {Mixed}  value Children value
	     * @return {Array|HTMLElement|String}
	     */
	    function _normaliseChildren(value)
	    {
	        // Flatten arrays
	        if (is_array(value)) return map(array_filter(_flatten(value)), (i, sub) => _normaliseChild(sub));
	
	        return _flatten([_normaliseChild(value)]);
	    }
	
	    function _normaliseChild(child)
	    {
	        // Already parsed
	        if (is_htmlElement(child)) return child;
	
	        // Functions
	        if (is_function(child)) return jsx(child());
	
	        // Empty strings
	        if (is_string(child) && str_replace(child, ['undefined','null','false','NaN'], '').trim() === '') return document.createTextNode('');
	
	        // Empty values
	        if (is_null(child) || is_undefined(child) || child === false) return document.createTextNode('');
	
	        // Objects
	        if (is_object(child)) throw new Error('Objects cannot be used as children');
	
	        return jsx(`${child}`);
	    }
	
	    /**
	     * Flatten multidimensional children.
	     *
	     * @access {private}
	     * @param  {HTMLElement|Array} DOMElement
	     * @return {HTMLElement|Array}
	     */
	    function _flatten(children)
	    {
	        if (is_array(children))
	        {
	            let ret = [];
	
	            each(children, (i, child) => is_array(child) ? ret = [...ret, ..._flatten(child)] : ret.push(child));
	
	            return ret;
	        }
	
	        return children;
	    }
	    
	})();
	
	(function()
	{
	    /**
	     * Helpers.
	     *
	     * @var  {Function}
	     */
	    const [is_array, is_object, each, object_props] = frontbx.import(['is_array','is_object','each','object_props']).from('_');
	
	    /**
	     * Cache.
	     *
	     * @var  {object}
	     */
	    const CACHE_STR = {};
	
	    /**
	     * Global decencies.
	     *
	     * @var  {object}
	     */
	    const GLOBAL_BINDINGS =
	    {
	        h: createElement,
	        Fragment: Fragment,
	    };
	
	    /**
	     * Parse's JSX tokens
	     *
	     * @param   {string}             jsxStr  JSX  string
	     * @param   {HTMLElement|Object} root or bindings
	     * @returns {object}             bindings  
	     */
	    function _jsx(jsxStr, root, bindings)
	    {        
	        if (is_object(root))
	        {
	            bindings = root;
	
	            root = false;
	        }
	
	        if (is_array(jsxStr))
	        {
	            let ret = createElement(Fragment, {}, jsxStr);
	
	            if (root) each(ret, (i, node) => root.appendChild(node));
	
	            return ret;
	        }
	
	        // Empty
	        else if (jsxStr === null || jsxStr === false || typeof jsxStr === 'undefined' || (typeof jsxStr === 'string' && jsxStr.trim() === ''))
	        {
	            let ret = createElement();
	
	            if (root) root.appendChild(ret);
	
	            return ret;
	        }
	
	        // Clean jsx
	        jsxStr = `${jsxStr}`.replaceAll(/[\r\n\t\f\v]/g, '');
	
	        // No elements
	        if (!jsxStr.includes('<') && !jsxStr.includes('>') && !jsxStr.includes('{'))
	        {
	            let ret = createElement('text', null, jsxStr);
	
	            if (root) root.appendChild(ret);
	
	            return ret;
	        }
	
	        // Parse into function
	        let parser = new Parser(jsxStr);
	
	        let output = parser.parse();
	
	        let ret = sandbox(output, genBindings(bindings), CURR_RENDER.current);
	
	        if (root) is_array(ret) ? each(ret, (i, node) => root.appendChild(node)) : root.appendChild(ret);
	        
	        return ret;
	    }
	
	    /**
	     * Generates object of bindings for JSX parsing.
	     *
	     * @param  {object}  input  bindings
	     * @return {object}
	     */
	    function genBindings(bindings)
	    {
	        // Normalize bindings.
	        bindings = !bindings ? { ...GLOBAL_BINDINGS } : { ...bindings, ...GLOBAL_BINDINGS };
	
	        // Apply temporary bindings cache
	        each(BINDINGS_CACHE, (k,v) =>
	        {
	            bindings[k] = v;
	
	            delete BINDINGS_CACHE[k];
	        });
	        
	        // Apply currently rendering component
	        if (CURR_RENDER.current)
	        {
	            let props = object_props(CURR_RENDER.current, true);
	            
	            each(props, (i, k) => bindings[k] = CURR_RENDER.current[k]);
	        }
	
	        return bindings;
	    }
	
	    jsx = _jsx;
	
	    frontbx.set('jsx', _jsx);
	
	})();
})();

// dom components
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [add_class, animate, attr, css, dom_element, each, find, find_all, _for, is_object, map, sibling_index, off, on, preapend, remove_class, rendered_style, width, remove_from_dom, inline_style] = frontbx.import(['add_class','animate','attr','css','dom_element','each','find','find_all','for','is_object','map','sibling_index','off','on','preapend','remove_class','rendered_style','width','remove_from_dom','inline_style']).from('_');

    /**
     * Default options
     * 
     * @var {Object}
     */
    const DEFAULT_OPTIONS =
    {
        // enable keyboard navigation, pressing left & right keys
        accessibility: true,
        
        // advances to the next cell
        // if true, default is 3 seconds
        // or set time between advances in milliseconds
        // i.e. `autoPlay: 1000` will advance every 1 second
        autoPlay: true,

        // zero-based index of the initial selected cell
        initialIndex: 0,
        
        controls: true,
        // creates and enables buttons to click to previous & next cells

        dots: true,
        // create and enable page dots

        resize: true,
        // listens to window resize events to adjust size & positions

        wrap: true,
        // at end of cells, wraps-around to first for infinite scrolling

        // Group slides
        groupSlides: false,

        pauseOnHover: true,
        // Pauses autoplay on hover

        easing: 'easeOutExpo',
        // Easing pattern

        draggable: true,
        // Draggable

        friction: 0.85,
        // Dragging friction

        mouseSupport: true,
        // Enables dragging with mouse,

        // Minimum swipe distance to be a "swipe"
        threshold: (type, self) => 3,

        // Minimum travel swipe velocity to be considered a "swipe"
        velocityThreshold: 3,
        
    };

    /**
     * Slider.
     *
     * @param {HTMLElement} wrapper Wrapper element
     * @param {Object}      options Options
     */
    const _Slider = function(wrapper, options)
    {
        this.options = is_object(options) ? {...DEFAULT_OPTIONS, ...options } :  {...DEFAULT_OPTIONS };

        this.DOMElementWrapper = wrapper;

        this._animating = false;

        this._playing = 'stopped';

        this._translated = 0;

        this._resizeThrottle = throttle(() => this.resize(), 100);

        this._build();

        this._moveIndexToMiddle();

        this.resize();

        if (this.options.autoPlay) this.play();
    }

    /**
     * Destroy the slider.
     *
     * @access {public}
     */
    _Slider.prototype.destroy = function()
    {
        this.stop();

        if (this._gestures) this._gestures.destroy();

        off(window, 'resize', this._resizeThrottle, this);

        off(this.DOMElementWrapper, 'mouseover', this.pause, this);

        off(this.DOMElementWrapper, 'mouseout', this.unpause, this);

        if (this.options.dots) remove_from_dom(this._dotWrap);

        if (this.options.controls) remove_from_dom([this._righBtn, this._leftBtn]);

        let slides = !this.options.groupSlides ? this._slides : find_all('.slide-group > *', this.DOMElementWrapper);

        each(slides, (i, slide) => this.DOMElementWrapper.appendChild(slide));
    }

    /**
     * Next slide
     *
     * @access {public}
     */
    _Slider.prototype.next = function(animationOrClickEvent)
    {
        // Stop on animating
        if (this._animating || this._dragging) return;

        // Do nothing on non-wrap and at end
        if (!this.options.wrap && this._index === this._slidesIndexs) return;

        // Don't animate
        if (animationOrClickEvent === false) return this._toSlideDirect(this._index +1);

        // Pause autoplay
        this.pause();

        // We're now animating
        this._animating = true;

        // Run animation
        let distance = this._slideWidthWGap;

        if (!this.options.wrap)
        {
            distance += this._translated;
            
            this._translated = distance;
        }

        // Update the index and dots.        
        this._updateIndex(1);
        this._updateDots();

        // Shuffle before animation
        if (this.options.wrap)
        {
            // Adjust pre distance before animation
            let preDistance = this._offset - this._slideWidthWGap;

            this._moved(1);

            css(this._DOMElementViewport, 'left', `-${preDistance}px`);
        }

        animate(this._DOMElementViewport, { transform: `translateX(-${distance}px)`, easing: this.options.easing, duration: 550, complete: () =>
        { 
            if (this.options.wrap)
            {
                css(this._DOMElementViewport, 'left', `-${this._offset}px`);

                css(this._DOMElementViewport, 'transform', `translateX(0px)`);
            }

            if (!this.options.wrap) this._moved(1);

            this._animating = false;

            if (!animationOrClickEvent) this.unpause();
        }});
    }

    /**
     * Previous slide
     *
     * @access {public}
     */
    _Slider.prototype.previous = function(animationOrClickEvent)
    {
        // Stop on animating
        if (this._animating || this._dragging) return;

        // Do nothing on non-wrap and at start
        if (!this.options.wrap && this._index === 0) return;

        // Don't animate
        if (animationOrClickEvent === false) return this._toSlideDirect(this._index +1);

        // Clear timeout
        this.pause();

        // We're now animating
        this._animating = true;

        // Cache distance
        let distance = !this.options.wrap ? (this._translated - this._slideWidthWGap) : this._slideWidthWGap;

        this._translated = distance < 2 ? 0 : distance;

        // Failsafe 
        if (!this.options.wrap) distance = distance < 2 ? 0 : -distance;

        // Update dots and indexes
        this._updateIndex(-1);
        this._updateDots();

        // Shuffle before animation
        if (this.options.wrap)
        {
            // Adjust pre distance before animation
            let preDistance = this._offset + this._slideWidthWGap;

            this._moved(-1);

            css(this._DOMElementViewport, 'left', `-${preDistance}px`);
        }

        // Run animation
        animate(this._DOMElementViewport, { transform: `translateX(${distance}px)`, easing: this.options.easing, duration: 550, complete: () => 
        { 
            if (this.options.wrap)
            {
                css(this._DOMElementViewport, 'left', `-${this._offset}px`);

                css(this._DOMElementViewport, 'transform', `translateX(0px)`);
            }

            this._animating = false;

            if (!animationOrClickEvent) this.unpause();
        } });
    }

    /**
     * Go to slide.
     *
     * @access {public}
     * @param  {integer} slideNum Slide number
     */
    _Slider.prototype.toSlide = function(slideNum, animation, fromClick)
    {
        // Animating
        if (this._animating) return false;

        animation = typeof animation === 'undefined' ? true : animation;

        fromClick = typeof fromClick === 'undefined' ? false : fromClick;

        if (!animation) return this._toSlideDirect(slideNum);

        // convert slide number to index
        let index = slideNum === 1 ? 0 : slideNum-1;

        // Invalid or does nothing
        if (index === this._index || index > this._slidesIndexs || index < 0) return;

        // Go to previous
        if ( (index === (this._index -1) && this._index > 0) || (index === this._slidesIndexs && this._index === 0 && this.options.wrap))
        {
            return this.previous();
        }

        // Go to next
        else if ((index === (this._index + 1) && this._index < this._slidesIndexs) || (index === 0 && this._index === this._slidesIndexs && this.options.wrap))
        {            
            return this.next();
        }

        // We're now animating
        this._animating = true;

        // Clear timeout
        this.pause();

        // Default delta and direction
        let { delta, direction } = this._moveDelta(index);

        // If we're not wrapping we can skip all of this
        if (!this.options.wrap)
        {
            let distance = this._slideWidthWGap * delta;

            distance = direction === -1 ? this._translated - distance : this._translated + distance;
            
            this._translated = distance < 2 ? 0 : distance;

            _for(delta, () => { this._updateIndex(direction) });

            this._updateDots();
            
            animate(this._DOMElementViewport, { transform: `translateX(${distance < 2 ? 0 : -distance}px)`, easing: this.options.easing, duration: 550, complete: () => 
            { 
                this._animating = false;

                if (!fromClick) this.unpause();

            } });

            return;
        }

        // Moving back shifts index forward
        // Moving forwards shifts index back
        let postIndex = direction === -1 ? this._middleIndex + delta : (this._middleIndex - delta) + this._bufferSize;

        // Since we know the new index, we can just calculate how far offset center it is.
        let tmpOffset = (postIndex * this._slideWidthWGap) - (this._viewportWidth / 2) + (this._slideWidth / 2);

        // Run animation
        let distance = this._slideWidthWGap * delta;
        distance  = direction === 1 ? -distance : distance;

        // Shuffle slides
        _for(delta, () => { this._moved(direction); this._updateIndex(direction) }, this);

        // Insert buffer clones
        let clones = this._bufferNodes(direction);

        css(this._DOMElementViewport, 'left', `-${tmpOffset}px`);

        // Run animation
        animate(this._DOMElementViewport, { transform: `translateX(${distance}px)`, easing: this.options.easing, duration: 650, complete: () => 
        { 
            each(clones, (i, clone) =>
            {
                clone.parentNode.removeChild(clone);
            });

            css(this._DOMElementViewport, 'left', `-${this._offset}px`);

            css(this._DOMElementViewport, 'transform', `translateX(0px)`);

            this._animating = false;

            if (!fromClick) this.unpause();

        } });

        this._updateDots();
    }

     /**
     * Go to slide.
     *
     * @access {public}
     * @param  {integer} slideNum Slide number
     */
    _Slider.prototype._toSlideDirect = function(slideNum)
    {
        // convert slide number to index
        let index = slideNum === 1 ? 0 : slideNum-1;

        // Clear timeout
        this.pause();

        // Default delta and direction
        let delta       = index < this._index ? this._index - index : index - this._index;
        let direction   = index < this._index ? -1 : 1;

        // If we're not wrapping we can skip all of this
        if (!this.options.wrap)
        {
            let distance = this._slideWidthWGap * delta;

            distance = direction === -1 ? this._translated - distance : this._translated + distance;
            
            this._translated = distance < 2 ? 0 : distance;

            _for(delta, () => { this._updateIndex(direction) });

            this._updateDots();

            css(this._DOMElementViewport, 'transform',  `translateX(${distance < 2 ? 0 : -distance}px)`);
            
            this.unpause();

            return;
        }

        // Shuffle slides
        _for(delta, () => { this._moved(direction); this._updateIndex(direction) }, this);

        css(this._DOMElementViewport, 'transform', `translateX(0px)`);

        this._updateDots();

        this.unpause();
    }

    /**
     * Window resize handler.
     *
     * @access {private}
     */
    _Slider.prototype.resize = function()
    {
        if (this._slidesCount === 0) return;

        // Is full width, may change with responsive CSS
        this._isFullWidth = parseInt(rendered_style(this._slides[0], 'max-width')) === 100;

        // Viewport width
        this._viewportWidth = Math.round(width(this.DOMElementWrapper));

        // Gap size
        this._gapSize = parseInt(rendered_style(this._DOMElementViewport, 'column-gap'));

        // Slide width
        this._slideWidth = Math.round(width(this._slides[0], this.DOMElementWrapper));

        // Slide width with gap
        this._slideWidthWGap = this._slideWidth + this._gapSize;

        // Offset
        this._offset = Math.round(this.options.wrap ? (this._middleIndex * this._slideWidthWGap) - (this._viewportWidth / 2) + (this._slideWidth / 2) : this._slideWidthWGap - ((this._viewportWidth + this._slideWidth) / 2));

        // Buffer
        if (!this._isFullWidth)
        {
            let percentagWidth  = (100 * this._slideWidth) / this._viewportWidth;
            this._bufferSize    = percentagWidth > 50 ? 3 : Math.round(100 / percentagWidth);            
        }

        // Make offset
        css(this._DOMElementViewport, 'left', `${this._offset === 0 ? 0 : -this._offset}px`);

        // Visible slides
        this._visibleSlides = this._isFullWidth ? 1 : this._viewportWidth / this._slideWidthWGap;

        this._dragBoundryL = this._offset - this._slideWidthWGap;

        this._dragBoundryR = -(this._dragBoundryL);
    }

    /**
     * Start autoplay.
     *
     * @access {public}
     */
    _Slider.prototype.play = function()
    {      
        if (this._playing === 'playing') return;

        // do not play if page is hidden, start playing when page is visible
        let isPageHidden = document.hidden;
        
        if (isPageHidden)
        {
            on(document, 'visibilitychange', this._onVisibilityPlay, this);

            return;
        }

        this._playing = 'playing';

        // listen to visibility change
        on(document, 'visibilitychange', this._onVisibilityChange, this);

        // start ticking
        this._tick();
    }

    /**
     * Stop autoplay.
     *
     * @access {public}
     */
    _Slider.prototype.stop = function()
    {
        this._playing = 'stopped';

        clearTimeout(this._playTimer);
        
        // remove visibility change event
        off(document, 'visibilitychange', this._onVisibilityChange, this);
    }

    /**
     * Pause autoplay.
     *
     * @access {public}
     */
    _Slider.prototype.pause = function()
    {
        if (this._playing === 'playing')
        {
            this._playing = 'paused';
            
            clearTimeout(this._playTimer);
        }
    }

    /**
     * Unpause autoplay.
     *
     * @access {public}
     */
    _Slider.prototype.unpause = function()
    {
        // re-start play if paused
        if (this._playing === 'paused') this.play();
    }

    /**
     * Build the slider.
     *
     * @access {private}
     */
    _Slider.prototype._build = function()
    {
        // Find slides
        this._slides = !this.options.groupSlides ? find_all('> *', this.DOMElementWrapper) : map([...Array(Math.ceil(find_all('> *', this.DOMElementWrapper).length / this.options.groupSlides)).keys()], (i) =>
        {
            // Since we're appending children as we go we're always taking the first n children
            return dom_element({tag: 'div', class: 'slide-group'}, null, find_all('> *', this.DOMElementWrapper).slice(0, this.options.groupSlides));
        });

        // Slides count
        this._slidesCount = this._slides.length;

        // Slide indexes
        this._slidesIndexs = this._slides.length -1;

        // Starting index
        this._index = this.options.initialIndex;

        // Middle index
        this._middleIndex = Math.floor(this._slidesCount / 2);

        // Visible slides
        this._visibleSlides = 1;

        // Buffer size
        this._bufferSize = 0;

        // Create viewport
        this._DOMElementViewport = dom_element({tag: 'div', class: 'slider-viewport js-slider-viewport'}, this.DOMElementWrapper, this._slides);

        // Controls
        if (this.options.controls) this._buildControls();

        // Dots
        this._dots = [];
        if (this.options.dots) this._buildDots();

        // Pause on hover
        if (this.options.autoPlay && this.options.pauseOnHover)
        {
            on(this.DOMElementWrapper, 'mouseover', this.pause, this);

            on(this.DOMElementWrapper, 'mouseout', this.unpause, this);
        }

        // Window resize
        if (this.options.resize)
        {
            on(window, 'resize', this._resizeThrottle, this);
        }

        if (this.options.draggable && this._slidesCount > 1)
        {
            add_class(this.DOMElementWrapper, 'draggable');

            this._bindGestures();
        }

        add_class(this.DOMElementWrapper, 'js-slider');
    }

    /**
     * Start dragging slide.
     *
     * @access {public}
     * @param  {integer} slideNum Slide number
     */
    _Slider.prototype._dragSlide = function(moved)
    {
        let x = this._dragX;

        if (this.options.wrap)
        {
            let nearEnd = (x < 0 && x <= this._dragBoundryR) || (x > 0 && x >= this._dragBoundryL);

            if (nearEnd)
            {
                this._dragCloneSlides();

                return;
            }
        }

        css(this._DOMElementViewport, 'transform', `translateX(${x}px)`);
    }

    /**
     * Go to slide.
     *
     * @access {public}
     * @param  {integer} slideNum Slide number
     */
    _Slider.prototype._dragCloneSlides = function()
    {   
        // No need to clone on non wrapping sliders     
        if (!this.options.wrap) return;

        let distance = this._slideWidthWGap * this._bufferSize;

        // Push out the drag boundaries
        // Drag bondry L remains the same as it is a fixed position from start
        this._dragBoundryR = -((this._slideWidthWGap * (this._bufferSize + this._slidesCount -1)) + (this._slideWidth /2));

        // Adjust the dragging buffer
        this._draggingbuffer = !this._draggingbuffer ? distance : this._draggingbuffer + distance;

        // Resting distance
        distance = this._dragX - distance;

        // Pad sides and clone
        this._bufferDragClones();

        // Adjust drag position
        css(this._DOMElementViewport, 'transform', `translateX(${distance}px)`);
    }

    /**
     * Fake shuffle cloned slides to start or end
     *
     * @access {private}
     */
    _Slider.prototype._bufferDragClones = function()
    {    
        if (!this.options.wrap) return;

        let viewport = this._DOMElementViewport;

        let clones = [];

        _for(this._bufferSize, (i) =>
        {
            let cloneR = find(`> *:nth-child(${this._dragRIndex})`, this._DOMElementViewport).cloneNode(true);
            let cloneL = find(`> *:nth-last-child(${this._dragLIndex})`, this._DOMElementViewport).cloneNode(true);
            add_class([cloneR, cloneL], 'slide-clone');

            this._dragClones.push(cloneR);
            this._dragClones.push(cloneL);

            preapend(cloneL, viewport);

            viewport.appendChild(cloneR);

            this._dragRIndex += 2;

            this._dragLIndex += 2;
        });
    }

    /**
     * Clear drag clones.
     *
     * @access {private}
     */
    _Slider.prototype._clearDragClones = function()
    {
        each(this._dragClones, (i, clone) =>
        {
            this._DOMElementViewport.removeChild(clone);
        });
    }

    _Slider.prototype._restingDragPos = function()
    {
        let ret = { rest: 0, slideIndex: 1 };

        // There would be a smarter way to figure all this out, however have not been able to figure out an easy solution
        let wrapping = this.options.wrap;

        // What distance have we actually moved in total?
        let moved = !wrapping ? Math.abs(this._dragX) - Math.abs(this._offset) : (this._slideWidthWGap * this._middleIndex) + (this._slideWidth / 2)

        if (wrapping) moved = this._dragX < 0 ? moved + Math.abs(this._dragX) : moved - this._dragX;

        // Always first slide
        if (!wrapping && (this._dragX > 0 || moved < 0)) return ret;

        // Get the DOM index of the slide that should be resting
        let index = !wrapping ? Math.ceil(moved / this._slideWidthWGap) : Math.ceil(moved / this._slideWidthWGap) -1;

        // Dragged over the edge on non-wrapping sliders
        if (!wrapping && index > this._slidesIndexs) index = this._slidesIndexs;

        // Get X pos of where target slide starts
        let slideStarts = (index * this._slideWidthWGap) - (this._viewportWidth / 2) + (this._slideWidth / 2);

        // Figure out the resting point
        let rest = this._offset - slideStarts;

        let slideIndex = parseInt(attr(find(`>:nth-child(${index +1})`, this._DOMElementViewport), 'data-index')) +1;

        this._dragMoved = (slideIndex -1) !== this._index;

        if (!wrapping) this._translated = Math.abs(rest);

        return { rest, slideIndex };
    }

    /**
     * Find closest slide on end
     *
     * @access {private}
     */
    _Slider.prototype._onDragEnd = function()
    {
        let { rest, slideIndex } = this._restingDragPos();

        this._dragEndAnim = animate(this._DOMElementViewport, { property: 'transform', from: `translateX(${this._dragX}px)`, to: `translateX(${rest}px)`, duration: 650, easing: this.options.easing, complete: () => 
        {
            if (this._dragClones.length >= 1) this._clearDragClones();

            if (this._dragMoved && this.options.wrap) this.toSlide(slideIndex, false, false);

            if (!this._dragMoved && this.options.wrap) css(this._DOMElementViewport, 'transform', `translateX(0px)`);

            this._index = slideIndex -1;

            this._translated = Math.abs(rest);

            this._updateDots();

            this.unpause();

            this._resetDragVars();
        }} );
    }

    /**
     * Build controls.
     *
     * @access {private}
     */
    _Slider.prototype._resetDragVars = function()
    {
        this._dragClones      = [];
        this._dragRIndex      = 1;
        this._dragLIndex      = 1;
        this._dragging        = false;
        this._dragMoved       = false;
        this._dragStartPointX = { x: 0, y: 0};
        this._dragBoundryL    = this._offset - this._slideWidthWGap;
        this._dragBoundryR    = -(this._dragBoundryL);
        
        delete this._dragX;

        delete this._prevDrag;

        delete this._dragEndAnim;

        delete this._draggingbuffer;
    }

    /**
     * Build controls.
     *
     * @access {private}
     */
    _Slider.prototype._bindGestures = function()
    {
        let wrapper = this.DOMElementWrapper;

        const gestures = frontbx.TinyGesture(this.DOMElementWrapper, { mouseSupport: this.options.mouseSupport, velocityThreshold: this.options.velocityThreshold, threshold: this.options.threshold });

        this._resetDragVars();

        gestures.on('panstart', (event) =>
        {
            // No drag on transitioning
            if (this._animating) return;

            // Clear timeout
            this.pause();

            // Register start point
            this._dragStartPointX = event.pageX;

            // We have a previous unfinished drag
            if (this._dragEndAnim)
            {
                this._dragEndAnim.stop();

                this._prevDrag = parseFloat(inline_style(this._DOMElementViewport, 'transform').replaceAll(/[^0-9-.]/g, ''));

                delete this._dragEndAnim;
            }

            // Add helper class for optional UI
            add_class(wrapper, 'dragging');
        });

        gestures.on('panmove', (event) =>
        {
            // No drag on transitioning
            if (this._animating) return;

            // Base movement
            let moveVectorX = (event.pageX - this._dragStartPointX);

            // No drag
            if ( Math.abs(moveVectorX) < 3 ) return;

            this._dragging = true;

            // Much slower on non-wrapping sliders when at end or start and going in opposite direction
            if (!this.options.wrap && ( (this._index === 0 && moveVectorX > 0) || (this._index === this._slidesIndexs && moveVectorX < 0) ))
            {
                moveVectorX = moveVectorX * (this.options.friction / 3);
            }
            else
            {
                // Slow down further we drag
                moveVectorX = moveVectorX * this.options.friction;
            }

            // Previous drag
            if (this._prevDrag)
            {
                moveVectorX = this._prevDrag + moveVectorX
            }

            // Non wrap + translated
            else if (!this.options.wrap)
            {
                moveVectorX = moveVectorX - this._translated;
            }

            // Calculate travel distance
            this._dragX = !this._draggingbuffer ? moveVectorX : moveVectorX - this._draggingbuffer;

            // Drag the slide
            this._dragSlide();
        });

        gestures.on('panend', (event) =>
        {
            remove_class(wrapper, 'dragging');

            if (!this._dragX) return this.unpause();

            this._onDragEnd();
        });

        gestures.on('swiperight', (event) =>
        {
            // Don't swipe on animating
            if (this._animating) return;

            // Don't swipe on drags
            if (this._dragEndAnim && this._dragMoved) return;

            // Can't go back
            if (!this.options.wrap && this._index === 0) return;

            // Stop dragend if running
            if (this._dragEndAnim) this._dragEndAnim.stop();

            this._resetDragVars();

            this.previous();
        });
        gestures.on('swipeleft', (event) =>
        {
            // Don't swipe on animating
            if (this._animating) return;

            // Don't swipe on drags
            if (this._dragEndAnim && this._dragMoved) return;
            
            // Can't go forward
            if (!this.options.wrap && this._index === this._slidesIndexs) return;

            // Stop dragend if running
            if (this._dragEndAnim) this._dragEndAnim.stop();

            this._resetDragVars();

            this.next();
        });

        this._gestures = gestures;
    }

    /**
     * Build controls.
     *
     * @access {private}
     */
    _Slider.prototype._buildControls = function()
    {
        // Right button
        this._righBtn = dom_element({tag: 'button', type: 'button', class: 'slider-control control-right btn btn-pure'}, this.DOMElementWrapper, 
            dom_element({tag: 'span',class: 'fa fa-caret-right'})
        );

        // Left button
        this._leftBtn = dom_element({tag: 'button', type: 'button', class: 'slider-control control-left btn btn-pure'}, this.DOMElementWrapper, 
            dom_element({tag: 'span',class: 'fa fa-caret-left'})
        );

        // Handlers
        on(this._righBtn, 'click', this.next, this);
        on(this._leftBtn, 'click', this.previous, this);
    }

    /**
     * Build dots.
     *
     * @access {private}
     */
    _Slider.prototype._buildDots = function()
    {
        let index = this._index;

        this._dotWrap = dom_element({tag: 'div', class: 'slider-dots js-slider-dots'}, this.DOMElementWrapper, map(this._slides, (i, slide) =>
        {
            let active = i === index ? 'active' : '';

            let dot = dom_element({tag: 'button', type: 'button', dataIndex: i, class: `slider-dot js-slider-dot btn btn-circle ${active}`});

            on(dot, 'click', this._dotClick, this);

            this._dots.push(dot);

            return dot;
        }));
    }

     /**
     * Moves indexed slide to middle.
     *
     * @access {private}
     */
    _Slider.prototype._moveIndexToMiddle = function()
    {
        each(this._slides, (i) =>
        {
            attr(this._slides[i], 'data-index', i);
        
        }, this);

        if (!this.options.wrap) return;

        let slide = this._slides[this._index];

        _for(this._slidesCount, (i) =>
        {
            if (sibling_index(slide) === this._middleIndex) return false;

            preapend(find('> *:last-child', this._DOMElementViewport), this._DOMElementViewport);
        
        }, this);  
    }

    /**
     * On dot click.
     *
     * @access {private}
     */
    _Slider.prototype._dotClick = function(e, dot)
    {
        if (this._animating || this._dragging) return;

        let index = parseInt(attr(dot, 'data-index')) +1;

        this.toSlide(index, true, true);
    }

    /**
     * Update index from previous / next.
     *
     * @access {private}
     * @param  {Integer} direction -1|1
     */
    _Slider.prototype._updateIndex = function(direction)
    {
        if (direction === 1)
        {
            this._index = this._index === this._slidesIndexs ? 0 : this._index + 1;
        }
        else
        {
            this._index = this._index === 0 ? this._slidesIndexs : this._index - 1;
        }
    }

    /**
     * Returns the move delta
     *
     * @access {private}
     * @param  {Integer} direction -1|1
     */
    _Slider.prototype._moveDelta = function(index)
    {
        // Default delta and direction
        let delta       = index < this._index ? this._index - index : index - this._index;
        let direction   = index < this._index ? -1 : 1;
        
        // We only go shortest path if we're wrapping and there's more than 5 slides
        if (this.options.wrap && this._slidesCount > 4)
        {
            if (index > this._index)
            {
                let backN = (this._slidesCount - index) + this._index;

                if (backN < delta)
                {
                    delta = backN;
                    direction = -1;
                }
            }
            else if (index < this._index)
            {
                let forwdN = (this._slidesCount - this._index) + index;

                if (forwdN < delta)
                {
                    delta = forwdN;
                    direction = 1;
                }
            }
        }

        return { delta, direction };
    }

    /**
     * Create buffers cloned nodes.
     *
     * @access {private}
     * @param  {Integer} direction -1|1
     */
    _Slider.prototype._bufferNodes = function(direction)
    {
        let viewport = this._DOMElementViewport;

        return map([...Array(this._bufferSize).keys()], (i) =>
        {
            let clone = find(`> *:nth${direction === -1 ? '-' : '-last-'}child(${i+1})`, viewport).cloneNode(true);

            direction === -1 ? viewport.appendChild(clone) : preapend(clone, viewport);

            return clone;
        });
    }

    /**
     * pause if page visibility is hidden, unpause if visible
     *
     * @access {private}
     */
    _Slider.prototype._onVisibilityChange = function()
    {
        let isPageHidden = document.hidden;
        
        this[ isPageHidden ? 'pause' : 'unpause' ]();
    }

    /**
     * Start playing on page return.
     *
     * @access {private}
     */
    _Slider.prototype._onVisibilityPlay = function()
    {
        this.play();
        
        off(document, 'visibilitychange', this._onVisibilityPlay, this);
    }

    /**
     * Timeout ticker.
     *
     * @access {private}
     */
    _Slider.prototype._tick = function()
    {
        // do not tick if not playing
        if ( this._playing !== 'playing' ) return;

        // default to 3 seconds
        let time = typeof this.options.autoPlay == 'number' ? this.options.autoPlay : 3000;

        // HACK: reset ticks if stopped and started within interval
        clearTimeout(this._playTimer);

        this._playTimer = setTimeout( () =>
        {
            this.next();
            
            this._tick();

        }, time );
    }

    /**
     * Shuffle slides after moved.
     *
     * @access {private}
     * @param  {Integer} direction -1|1
     */
    _Slider.prototype._moved = function(direction)
    {    
        if (!this.options.wrap) return;

        if (direction === 1)
        {
            this._DOMElementViewport.appendChild(find('> *:first-child', this._DOMElementViewport));
        }
        else
        {
           preapend(find('> *:last-child', this._DOMElementViewport), this._DOMElementViewport);
        }
    }

    /**
     * Update active dot after move.
     *
     * @access {private}
     */
    _Slider.prototype._updateDots = function()
    {
        if (!this.options.dots) return;

        remove_class(find('.js-slider-dots .js-slider-dot.active', this.DOMElementWrapper), 'active');

        add_class(this._dots[this._index], 'active');
    }

    // Load into container
    frontbx.set('_Slider', _Slider);

})();
(function()
{
    /**
     * Component base
     * 
     * @var {Class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [attr, each, map, extend, dom_element, json_decode] = frontbx.import(['attr', 'each', 'map', 'extend', 'dom_element', 'json_decode']).from('_');

    /**
     * Slider instances.
     * 
     * @var {Array}
     */
    const SLIDERS = [];

    /**
     * Dom Slider component.
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Slider = function()
    {
        this.super('.js-slider');
    }

    /**
     * @inheritdoc
     * 
     */
    Slider.prototype.bind = function(node)
    {
        let options = attr(node, 'data-slider-options');

        options = !options ? {} : json_decode(options);

        SLIDERS.push(frontbx._Slider(node, options));
    }

    /**
     * @inheritdoc
     * 
     */
    Slider.prototype.unbind  = function(node)
    {
        each(SLIDERS, (i, slider) =>
        {
            if (slider.DOMElementWrapper === node)
            {
                slider.destroy();

                SLIDERS.splice(i, 1);

                return false;
            }
        });
    }

    /**
     * @inheritdoc
     * 
     */
    Slider.prototype.render = function(props)
    {
        return dom_element({tag: 'div', class: 'slider js-slider'}, null, props.slides);
    }

    // Load into frontbx DOM core
    frontbx.dom().register('Slider', extend(Component, Slider));
})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {function}
     */
    const [find, add_class, on, closest, in_dom, input_value, remove_class, off, extend] = frontbx.import(['find','add_class','on','closest','in_dom','input_value','remove_class','off','extend']).from('_');

    /**
     * Adds classes to inputs
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Inputs = function()
    {
        this.super('.form-field input:not([type="radio"]):not([type="checkbox"]):not([type="range"]), .form-field select, .form-field textarea, .form-field label');

        return this;
    }

    /**
     * Event binder
     *
     * @access {private}
     */
    Inputs.prototype.bind = function(node)
    {
        if (node.tagName.toLowerCase() === 'label')
        {
            on(node, 'click', this._onLabelClick);
        }
        else
        {
            on(node, 'click, focus, blur, change, input', this._eventHandler);

            this._setClasses(node);
        }
    }

    /**
     * Event ubinder
     *
     * @access {private}
     */
    Inputs.prototype.unbind = function(node)
    {
        if (node.tagName.toLowerCase() === 'label')
        {
            off(node, 'click', this._onLabelClick);
        }
        else
        {
            off(node, 'click, focus, blur, change, input', this._eventHandler);
        }
    }

    /**
     * Event handler
     *
     * @access {private}
     * @params {event|null} e Browser click event
     */
    Inputs.prototype._onLabelClick = function(e)
    {
        e = e || window.event;

        var input = find('input', this.parentNode);

        if (in_dom(input))
        {
            input.focus();

            return;
        }

        var input = find('select', this.parentNode);

        if (in_dom(input))
        {
            input.focus();

            return;
        }

        var input = find('textarea', this.parentNode);

        if (in_dom(input))
        {
            input.focus();

            return;
        }
    }

    /**
     * Event handler
     *
     * @access {private}
     * @params {event|null} e Browser click event
     */
    Inputs.prototype._eventHandler = function(e)
    {
        e = e || window.event;

        var wrapper = closest(this, '.form-field');

        if (!wrapper) return;

        if (e.type === 'click')
        {
            this.focus();
        }
        else if (e.type === 'focus')
        {
            add_class(wrapper, 'focus');
        }
        else if (e.type === 'blur')
        {
            remove_class(wrapper, 'focus');
        }

        if (e.type === 'change' || e.type === 'input' || e.type === 'blur')
        {
            var _value = input_value(this);

            if (_value === '')
            {
                remove_class(wrapper, 'not-empty');
                add_class(wrapper, 'empty');
            }
            else
            {
                remove_class(wrapper, 'empty');
                add_class(wrapper, 'not-empty');
            }
        }
    }

    /**
     * Sets initial classes on load.
     *
     * @access {private}
     * @params {DOMElement} input 
     */
    Inputs.prototype._setClasses = function(input)
    {
        var wrapper = closest(input, '.form-field');

        if (!wrapper) return;

        var _value = input_value(input);

        if (_value === '')
        {
            remove_class(wrapper, 'not-empty');
            add_class(wrapper, 'empty');
        }
        else
        {
            remove_class(wrapper, 'empty');
            add_class(wrapper, 'not-empty');
        }
    }

    // Load into frontbx DOM core
    frontbx.dom().register('Inputs', extend(Component, Inputs));
})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {function}
     */
    const [find, first_children, on, off, add_class, remove_class, has_class, each, map, _for, css, attr, is_empty, input_value, dom_element, extend] = frontbx.import(['find', 'first_children', 'on', 'off', 'add_class', 'remove_class', 'has_class', 'each', 'map', 'for', 'css', 'attr','is_empty', 'input_value','dom_element', 'extend']).from('_');

    /**
     * Default values
     * 
     * @var {Object}
     */
    const DEFAULT_OPTIONS =
    {
        min: 0,
        max: 100,
        value: 50,
        step: 1,
        labeled: false,
        indicators: false,
    };

    /**
     * Range input utility
     * 
     * @var {Function}
     */
    const Range = function(wrapper)
    {
        this.wrapperEl = wrapper;

        this.inputEl = find('input[type=range]', wrapper);

        let min     = attr(this.inputEl, 'min');
        let max     = attr(this.inputEl, 'max');
        let step    = attr(this.inputEl, 'step');
        let value   = input_value(this.inputEl);
        let suffix  = attr(this.inputEl, 'data-suffix');
        let prefix  = attr(this.inputEl, 'data-prefix');
        let labeled = has_class(this.wrapperEl, 'range-labeled');
        let indicators = has_class(this.wrapperEl, 'range-indicators');

        min   = is_empty(min)   ? DEFAULT_OPTIONS.min : (min.includes('.') ? parseFloat(min) : parseInt(min));
        max   = is_empty(max)   ? DEFAULT_OPTIONS.max : (max.includes('.') ? parseFloat(max) : parseInt(max));
        step  = is_empty(step)  ? DEFAULT_OPTIONS.step : (step.includes('.') ? parseFloat(step) : parseInt(step));
        value = is_empty(value) ? DEFAULT_OPTIONS.value : value;

        this.props = {min, max, step, value, suffix, prefix, labeled, indicators};

        this._build();

        this._bind();
    }

    /**
     * Destroy slider.
     * 
     * @access {public}
     */
    Range.prototype.destroy = function()
    {
        this._unbind();

        _for(first_children(this.wrapperEl), (i, elem) => elem !== this.inputEl ? this.wrapperEl.removeChild(elem) : null);
    }

    /**
     * Update the slider.
     * 
     * @access {public}
     */
    Range.prototype.update = function(e)
    {
        let value = input_value(this.inputEl); value = is_empty(value) ? 0 : value;

        if (value === this.props.min)
        {
            remove_class(this.wrapperEl, 'range-max');
            add_class(this.wrapperEl, 'range-min');
        }
        else if (value === this.props.max)
        {
            remove_class(this.wrapperEl, 'range-min');
            add_class(this.wrapperEl, 'range-max');
        }
        else 
        {
            remove_class(this.wrapperEl, 'range-min, range-max');
        }

        this.props.value = value;

        this.updateBackground();

        _for(this.props.max.toString().length, (i) => this.updateIndicators(i));
    }

    /**
     * Bind listener.
     * 
     * @access {private}
     */
    Range.prototype._bind = function()
    {
        on(this.inputEl, 'input', this.update, this);
    }

    /**
     * Unbind listener.
     * 
     * @access {private}
     */
    Range.prototype._unbind = function()
    {
        off(this.inputEl, 'input', this.update, this);
    }

    /**
     * Build slider.
     * 
     * @access {private}
     */
    Range.prototype._build = function()
    {
        let length     = this.props.max.toString().length;
        let digitWraps = [];
        this.digitEls  = [];

        _for(length, () => 
        {
            let ul = dom_element({tag: 'ul'}, null, map(Array(10).fill(0), (i) => dom_element({tag: 'li', innerHTML: `${i}`})));

            this.digitEls.push(ul);

            digitWraps.push(dom_element({tag: 'div', class: 'slider-value-number'}, null, ul));
        });

        if (this.props.prefix)
        {
            digitWraps.unshift(dom_element({tag: 'div', class: 'slider-value-number'}, null, dom_element({tag: 'ul'}, null, dom_element({tag: 'li', innerHTML: this.props.prefix}))));
        }

        if (this.props.suffix)
        {
            digitWraps.push(dom_element({tag: 'div', class: 'slider-value-number'}, null, dom_element({tag: 'ul'}, null, dom_element({tag: 'li', innerHTML: this.props.suffix}))));
        }

        // Label style
        if (this.props.indicators)
        {
            let prefix = this.props.prefix || '';
            let suffix = this.props.suffix || '';

            let label = dom_element({tag: 'div', class: this.props.labeled ? 'slider-value label' : 'slider-value'}, null, `${prefix}${this.props.min}${suffix}`);

            let fChild = this.wrapperEl.firstChild;

            if (fChild === this.inputEl)
            {
                this.wrapperEl.insertBefore(label, fChild);
            }
            else
            {
                this.wrapperEl.insertBefore(label, fChild.nextSibling);
            }
        }

        this.digitWrapper = dom_element({tag: 'div', class: `slider-value ${this.props.labeled ? 'label' : ''}`}, this.wrapperEl, digitWraps);

        this.update();
    }

    /**
     * Update the digit indicators.
     * 
     * @access {private}
     * @param  {Integer} index
     */
    Range.prototype.updateIndicators = function(index)
    {
        let elem     = this.digitEls[index];
        let value    = this.props.value.toString();
        let { max }  = this.props;
        let length   = max.toString().length;
        let visible  = index + 1 > length - value.length;
        let position = visible ? "-" + (value[index - (length - value.length)] * 10) + '%' : '10%';

        !visible ? add_class(elem.parentNode, 'digit-hidden') : remove_class(elem.parentNode, 'digit-hidden');

        //!visible ? css(elem.parentNode, 'display', 'none') : css(elem.parentNode, 'display', false);

        css(elem,
        {
            transform: `translateY(${position})`,
            opacity: visible ? '1' : '0'
        });
    }

    /**
     * Update the background of input.
     * 
     * @access {private}
     */
    Range.prototype.updateBackground = function()
    {
        css(this.inputEl, 'background-size', `${this.percent()}% 100%`);
    }

    /**
     * Returns background percentage width.
     * 
     * @access {private}
     * @return {Float}
     */
    Range.prototype.percent = function()
    {
        let { min, max } = this.props;
        
        return (this.props.value - min) * 100 / (max - min)
    }

    /**
     * Ranges.
     * 
     * @var {Map}
     */
    const RANGES = new Map;

    /**
     * RangeSlider Dom Component.
     *
     */
    const RangeSlider = function()
    {
        this.super('.js-range-slider');
    }

    /**
     * @inheritdoc
     * 
     */
    RangeSlider.prototype.bind = function(wrapper)
    {        
        RANGES.set(new Range(wrapper));
    }

    /**
     * @inheritdoc
     * 
     */
    RangeSlider.prototype.unbind = function(wrapper)
    {
        let range = RANGES.get(wrapper);

        if (range)
        {
            range.destroy();

            RANGES.delete(wrapper);
        }
    }

    /**
     * @inheritdoc
     * 
     */
    RangeSlider.prototype.render = function(props)
    {
        let inputProps = { min: props.min, max: props.max, value: props.value, step: props.step };

        if (props.prefix) inputProps.dataPrefix = props.prefix;
        if (props.suffix) inputProps.dataSuffix = props.suffix;

        return dom_element({tag: 'div', class: `range-slider ${props.labeled ? 'range-labeled' : ''} ${props.indicators ? 'range-indicators' : ''} js-range-slider`}, null,
            dom_element({ ...{ tag: 'input', type: 'range'}, ...inputProps})
        );
    }

    // Load into frontbx DOM core
    frontbx.dom().register('RangeSlider', extend(Component, RangeSlider));
})();
(function()
{
    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [height, width, coordinates, dom_element, in_dom] = frontbx.import(['height','width','coordinates','dom_element','in_dom']).from('_');

    /**
     * Default options.
     * 
     * @var {Object}
     */
    const DEFAULT_OPTIONS =
    {
        direction: 'top',
        animation: 'pop',
        variant: 'default',
        state: 'open',
        classes: '',
    };

    /**
     * Popover Handler
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const PopHandler = function(options)
    {
        this.options    = {...DEFAULT_OPTIONS, ...options};
        this.popElement = this._buildPopEl();
        this.state      = this.options.state;
    }

    /**
     * Build the popover
     *
     * @access {private}
     */
    PopHandler.prototype.render = function()
    {
        document.body.appendChild(this.popElement);

        this.position();

        if (this.state === 'open') this.popElement.classList.add(`popover-${this.options.animation}`);

        return this.popElement;
    }

    /**
     * Destroy the popover.
     *
     * @access {public}
     */
    PopHandler.prototype.destroy = function()
    {
        if (in_dom(this.popElement)) this.popElement.parentNode.removeChild(this.popElement);
    }

    /**
     * Destroy the popover.
     *
     * @access {public}
     */
    PopHandler.prototype.hide = function()
    {
        this.popElement.classList.remove(`popover-${this.options.animation}`);

        this.popElement.classList.add(`sr-only`);

        this.state = 'closed';
    }

    /**
     * Destroy the popover.
     *
     * @access {public}
     */
    PopHandler.prototype.show = function()
    {
        this.popElement.classList.remove(`sr-only`);
        
        this.popElement.classList.add(`popover-${this.options.animation}`);

        this.state = 'open';
    }

    /**
     * Build the popover
     *
     * @access {private}
     */
    PopHandler.prototype._buildPopEl = function()
    {
        return dom_element({tag: 'div', class: `popover popover-${this.options.variant} popover-${this.options.direction} ${this.options.classes}`}, null, this.options.content);
    }

    /**
     * Position the popover
     *
     * @access {public}
     */
    PopHandler.prototype.position = function()
    {
        var tarcoordinates = coordinates(this.options.trigger);

        if (this.options.direction.includes('top'))
        {
            this.popElement.style.top = `${ (tarcoordinates.top - height(this.popElement)) - 10}px`;

            if (this.options.direction === 'top') this.popElement.style.left = `${tarcoordinates.left - (width(this.popElement) / 2) + (width(this.options.trigger) / 2)}px`;
        }
        else if (this.options.direction.includes('bottom'))
        {
            this.popElement.style.top = `${(tarcoordinates.top + height(this.options.trigger) + 10)}px`;

            if (this.options.direction === 'bottom') this.popElement.style.left = `${tarcoordinates.left - (width(this.popElement) / 2) + (width(this.options.trigger) / 2)}px`;
        }
        if (this.options.direction.includes('left'))
        {
            this.popElement.style.left = this.options.direction === 'left' ? `${tarcoordinates.left - width(this.popElement) - 10}px` : `${tarcoordinates.left}px`;

            if (this.options.direction === 'left') this.popElement.style.top = `${(tarcoordinates.top - (height(this.popElement) / 2 ))}px`;
        }
        else if (this.options.direction.includes('right'))
        {
            this.popElement.style.left =  this.options.direction === 'right' ? `${tarcoordinates.left + width(this.options.trigger) + 10 }px` : `${tarcoordinates.left + width(this.options.trigger) - width(this.popElement)}px`;

            if (this.options.direction === 'right') this.popElement.style.top = `${(tarcoordinates.top - (height(this.popElement) / 2 ))}px`;
        }
    }

    // Set into container for private use
    frontbx.set('PopHandler', PopHandler);

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * JS Helper reference
     * 
     * @var {object}
     */
    const [attr, is_undefined, is_htmlElement, to_camel_case, dom_element, find, find_all, add_class, on, closest, has_class, is_empty, remove_class, off, each, map, extend] = frontbx.import(['attr','is_undefined','is_htmlElement','to_camel_case','dom_element','find','find_all','add_class','on','closest','has_class','is_empty','remove_class','off','each','map','extend']).from('_');

    /**
     * Timer for mouse in-out.
     * 
     * @var {Timeout}
     */
    var HOVER_TIMER;

    /**
     * Handlers.
     * 
     * @var {Map}
     */
    var POP_HANDLERS = new Map;

    /**
     * Available attributes.
     * 
     * @var {Array}
     */
    const DATA_ATTRIBUTES = ['variant','direction','title','content','event','animation','state','trigger'];

    /**
     * Popover
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Popovers = function()
    {
        this.super('.js-popover');

        this._windowClick = false;
    }

    /**
     * Initialize the handlers on a trigger
     *
     * @access {private}
     * @param  {DOMElement} trigger Click/hover trigger
     */
    Popovers.prototype.bind = function(trigger)
    {
        if (!this._windowClick)
        {
            on(window, 'click', this._windowClickHandler, this);

            this._windowClick = true;
        }

        let options = { trigger };

        each(DATA_ATTRIBUTES, (i, attribute) =>
        {
            let value = attr(trigger, `data-popover-${attribute}`);

            if (!is_undefined(value))
            {
                if (value === 'true' || value === 'false') value = value === 'true' ? true : false;

                if (attribute === 'content' && value[0] === '#')
                {
                    value = find(value);
                }

                options[to_camel_case(attribute)] = value;
            }
        });

        let popHandler = frontbx.get('PopHandler', this._build(options));

        if (options.event === 'click')
        {
            on(trigger, 'click', this._clickHandler, this);
            on(window, 'resize', this._windowResize, this);
        }
        else
        {                
            on(trigger, 'mouseenter', this._hoverEnter, this);
        }

        POP_HANDLERS.set(trigger, popHandler);
    }

    /**
     * Builds the popover if necessary.
     *
     * @access {private}
     * @param  {Object} options
     * @return {Object}
     */
    Popovers.prototype._build = function(options)
    {
        if (typeof options.content === 'string')
        {
            let contents = [];

            if (options.event && options.event === 'click')
            {
                contents.push(dom_element({tag: 'button', type: 'button', role: 'button', ariaLabel: 'close', class: 'btn btn-sm btn-pure btn-circle js-remove-pop close-btn'}, null, 
                    dom_element({tag: 'span', class: 'fa fa-xmark'})
                ));
            }

            if (options.title)
            {
                contents.push(dom_element({tag: 'h5', class: 'popover-title'}, null, options.title));
            }

            contents.push(dom_element({tag: 'div', class: 'popover-content'}, null, dom_element({tag: 'p'}, null, options.content)));

            options.content = contents;
        }
        else if (is_htmlElement(options.content))
        {
            remove_class(options.content, 'hidden');

            options.content.style = '';
        }

        return options;
    }

    /**
     * Unbind event listeners on a trigger
     *
     * @param {trigger} node
     * @access {private}
     */
    Popovers.prototype.unbind = function(trigger)
    {
        if (this._windowClick)
        {
            off(window, 'click', this._windowClickHandler, this);

            this._windowClick = false;
        }

        let content = attr(trigger, 'data-content');

        if (content[0] === '#')
        {
            elem = find(content);
            
            if (elem)
            {
                elem.style.display = 'none';

                document.body.appendChild(elem);
            }
        }

        var evnt = attr(trigger, 'data-popover-event');

        if (evnt === 'click')
        {
            off(trigger, 'click', this._clickHandler, this);
            off(window, 'resize', this._windowResize, this);
        }
        else
        {
            off(trigger, 'mouseenter', this._hoverEnter, this);
            off(trigger, 'mouseleave', this._hoverLeave, this);

            this._killPop(trigger);

            POP_HANDLERS.delete(trigger);
        }
    }

    /**
     * Hover over event handler
     *
     * @access {private}
     */
    Popovers.prototype._hoverEnter = function(e, trigger)
    {
        if (has_class(trigger, 'popped')) return;

        let handler = POP_HANDLERS.get(trigger);
        
        let pop = handler.render();

        on(pop, 'mouseenter', this._hoverPop, this);

        on(trigger, 'mouseleave', this._hoverLeave, this);
        
        add_class(trigger, 'popped');
    }

    /**
     * Hover leave event handler
     *
     * @access {private}
     */
    Popovers.prototype._hoverLeave = function(e, trigger)
    {
        clearTimeout(HOVER_TIMER);

        // Mouse leaving pop not trigger
        if (!has_class(trigger, '.js-popover'))
        {
            for (let [_trigger, handler] of POP_HANDLERS)
            {
                if (handler.popElement === trigger) trigger = handler.options.trigger;
            }
        }

        HOVER_TIMER = setTimeout(() => 
        {
            this._killPop(trigger);

            off(trigger, 'mouseleave', this._hoverLeave, this);

        }, 300);
    }

    /**
     * Hover leave event handler
     *
     * @access {private}
     */
    Popovers.prototype._hoverPop = function(e, pop)
    {
        clearTimeout(HOVER_TIMER);

        on(pop, 'mouseleave', this._hoverLeave, this);
    }

    /**
     * Window resize event handler
     *
     * @access {private}
     */
    Popovers.prototype._windowResize = function()
    {
        for (let [trigger, handler] of POP_HANDLERS)
        {
            if (handler.state === 'active') handler.position();
        }
    }

    /**
     * Click event handler
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    Popovers.prototype._killPop = function(trigger)
    {            
        let handler = POP_HANDLERS.get(trigger);

        handler.destroy();
        
        remove_class(trigger, 'popped');
    }

    /**
     * Click event handler
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    Popovers.prototype._clickHandler = function(e, trigger)
    {
        e = e || window.event;

        e.preventDefault();
        
        var popHandler = POP_HANDLERS.get(trigger);

        if (has_class(trigger, 'popped'))
        {
            this._removeAll(trigger);
            
            popHandler.destroy();
            
            remove_class(trigger, 'popped');
        }
        else
        {
            this._removeAll(trigger);
            
            popHandler.render();
            
            add_class(trigger, 'popped');
        }
    }

    /**
     * Remove all popovers when anything is clicked
     *
     * @access {private}
     */
    Popovers.prototype._windowClickHandler = function(e)
    {        
        let clicked = e.target;

        // Clicked the close button
        if (has_class(clicked, 'js-remove-pop') || closest(clicked, '.js-remove-pop'))
        {
            this._removeAll();

            return;
        }

        // Clicked inside the popover
        if (has_class(clicked, 'popover') || closest(clicked, '.popover'))
        {
            return;
        }

        // Clicked a popover trigger
        if (has_class(clicked, 'js-popover') || closest(clicked, '.js-popover'))
        {
            return;
        }

        this._removeAll();
    }

    /**
     * Remove all the popovers currently being displayed
     *
     * @access {private}
     */
    Popovers.prototype._removeAll = function(exception)
    {        
        for (let [trigger, handler] of POP_HANDLERS)
        {
            if (!exception || (exception && trigger !== exception))
            {
                handler.destroy();

                remove_class(trigger, 'popped');
            }
        }
    }

    // Load into frontbx DOM core
    frontbx.dom().register('DOM_Popovers', extend(Component, Popovers));

}());

(function()
{
    /**
     * Creates a chip
     *
     */
    function createChip(options)
    {
        let chip = document.createElement(options.removeable || options.input ? 'SPAN' : 'BUTTON');

        if (options.removeable || options.input) chip.type = 'button';

        chip.className = options.variant ? `btn btn-chip ${options.variant}` : 'btn btn-chip';
        chip.innerText = options.posticon || options.removeable ? `${options.text} ` : options.text;

        if (options.preicon)
        {
            let icon1 = document.createElement('SPAN');
            icon1.className = `fa fa-${options.preicon}`;
            chip.appendChild(icon1);
        }

        if (options.removeable)
        {
            let removeBtn = document.createElement('BUTTON');
            removeBtn.className = 'remove-btn btn-unstyled js-remove-btn';
            removeBtn.ariaLabel = 'remove';
            removeBtn.type = 'button';

            let x = document.createElement('SPAN');
            x.className = 'fa fa-xmark';
            removeBtn.appendChild(x);

            chip.appendChild(removeBtn);
        }
        else if (options.posticon)
        {
            let icon2 = document.createElement('SPAN');
            icon2.className = `fa fa-${options.posticon}`;
            chip.appendChild(icon2);
        }
        
        if (options.input)
        {
            let input = document.createElement('INPUT');
            input.hidden = true;
            input.name   = options.input;
            input.value  = options.text;
            input.setAttribute('value', options.text);

            chip.appendChild(input);
        }

        return chip;
    }

    // Load into frontbx DOM core
    frontbx.set('Chip', createChip);

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, find_all, on, closest, first_children, in_array, input_value, is_empty, off, remove_from_dom, extend] = frontbx.import(['find','find_all','on','closest','first_children','in_array','input_value','is_empty','off','remove_from_dom','extend']).from('_');

    /**
     * Chip inputs
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const ChipInputs = function()
    {
        this.super('.js-chips-input');
    }

    /**
     * Init a chips input
     *
     * @access {private}
     * @param  {DOMElement}    _wrapper
     */
    ChipInputs.prototype.bind = function(_wrapper)
    {
        let _input = find('.js-chip-input', _wrapper);

        on(find_all('.js-remove-btn', _wrapper), 'click', this._removeChip);

        on(_input, 'keyup', this._onKeyUp, this);

        if (closest(_input, 'form'))
        {
            on(_input, 'keydown', this._preventSubmit, this);
        }
    }

    /**
     * Destroy chip listeners
     *
     * @access {private}
     * @param  {DOMElement}    _wrapper
     */
    ChipInputs.prototype.unbind = function(_wrapper)
    {
        var _removeBtns = find_all('.btn-chip .js-remove-btn', _wrapper);
        var _input = find('.js-chip-input', _wrapper);

        off(_removeBtns, 'click', this._removeChip);

        off(_input, 'keyup', this._onKeyUp, this);

        if (closest(_input, 'form'))
        {
            off(_input, 'keydown', this._preventSubmit, this);
        }
    }

    /**
     * Prevent the form from submitting if it's part of a form
     *
     * @access {private}
     * @param  {event|null} e
     */
    ChipInputs.prototype._preventSubmit = function(e, input)
    {
        e = e || window.event;

        var _key = e.code || e.key || e.keyCode || e.charCode;

        if (_key == 'Enter' || _key === 13)
        {
            e.preventDefault();

            return false;
        }
        // Backspace
        else if (_key == 'Delete' || _key == 'Backspace' || _key == 8 || _key == 46)
        {
            if (input.value === '')
            {
                var _wrapper = closest(input, '.js-chips-input');

                this._removeLastChip(_wrapper);
            }
        }
    }

    /**
     * Handle pressing enter to insert the chip
     *
     * @access {private}
     * @param  {event|null} e
     */
    ChipInputs.prototype._onKeyUp = function(e, input)
    {
        e = e || window.event;

        var _key = e.code || e.key || e.keyCode || e.charCode;

        // Enter
        if (_key == 'Enter' || _key === 13)
        {
            var _wrapper = closest(input, '.js-chips-input');

            var _value = input_value(input).trim();

            if (!in_array(_value, this._getChipsValues(_wrapper)) && _value !== '')
            {
                this.addChip(_value, _wrapper);

                input.value = '';
            }
        }
    }

    /**
     * Remove last chip
     *
     * @access {private}
     * @param  {DOMElement}    _wrapper
     */
    ChipInputs.prototype._removeLastChip = function(_wrapper)
    {
        var _chips = find_all('.btn-chip', _wrapper);

        if (!is_empty(_chips))
        {
            remove_from_dom(_chips.pop());
        }
    }

    /**
     * Insert new chip
     *
     * @access {public}
     * @param  {string}      _value
     * @param  {DOMElement}        _wrapper
     * @param  {string|bool} _icon
     */
    ChipInputs.prototype.addChip = function(_value, _wrapper, _icon)
    {
        let chip = frontbx.Chip({
            text       : _value.trim(),
            removeable : true,
            input      : _wrapper.dataset.inputName,
            variant    : _wrapper.dataset.chipClass,
        });

        _wrapper.insertBefore(chip, first_children(_wrapper).pop());

        on(find('.js-remove-btn', chip), 'click', this._removeChip);

        frontbx.dom().refresh('Ripple', _wrapper);
    }

    /**
     * Remove an existing chip
     *
     * @access {private}
     * @param  {event|null} e
     */
    ChipInputs.prototype._removeChip = function(e)
    {
        e = e || window.event;

        e.preventDefault();

        remove_from_dom(closest(this, '.btn-chip'));
    }

    /**
     * Get all values from chip input
     *
     * @access {private}
     * @param  {DOMElement}    _wrapper
     * @return {array}
     */
    ChipInputs.prototype._getChipsValues = function(_wrapper)
    {
        var _result = [];

        var _chips = find_all('.btn-chip input', _wrapper);

        for (var i = 0; i < _chips.length; i++)
        {
            _result.push(input_value(_chips[i]));
        }

        return _result;
    }

    // Load into frontbx DOM core
    frontbx.dom().register('ChipInputs', extend(Component, ChipInputs));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, add_class, on, closest, has_class, remove_class, off, attr, css, dom_element, map, trigger_event, extend] = frontbx.import(['find','add_class','on','closest','has_class','remove_class','off','attr','css','dom_element','map','trigger_event','extend']).from('_');

    /**
     * Dropdown Buttons
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Menu = function()
    {
        this.super('.js-select-menu > *:not(.menu-divider):not(.menu-header), .js-check-menu > *:not(.menu-divider):not(.menu-header), .js-active-menu > *:not(.menu-divider):not(.menu-header)');
    }

    /**
     * @inheritdoc
     * 
     */
    Menu.prototype.bind = function(node)
    {
        on(node, 'click', this._clickHandler, this);
    }

     /**
     * @inheritdoc
     * 
     */
    Menu.prototype.unbind = function(node)
    {
        off(node, 'click', this._clickHandler, this);
    }

    /**
     * Click event handler
     *
     * @param  {event|null} e JavaScript Click event
     * @access {private}
     */
    Menu.prototype._clickHandler = function(e, item)
    {
        // Nothing to do
        if (has_class(item, 'selected') || has_class(item, 'active') || has_class(item, 'checked')) return;

        // Menu and class
        let menu        = closest(item, '.js-select-menu') || closest(item, '.js-check-menu') || closest(item, '.js-active-menu');
        let activeClass = has_class(menu, 'js-select-menu') ? 'selected' : (has_class(menu, 'js-check-menu') ? 'checked' : 'active');
        let selected    = find(`> .${activeClass}`, menu);
        let isCheck     = activeClass === 'checked';
        let content     = item.innerText.trim();
            
        if (selected) remove_class(selected, activeClass);
        
        add_class(item, activeClass);

        if (isCheck)
        {
            if (selected)
            {
                let selectedCheck = find('.item-right .fa.fa-check', selected);

                if (selectedCheck) css(selectedCheck.parentNode, 'display', 'none');
            }
            
            let check = find('.item-right .fa', item);

            if (!check)
            {
                let itemContent = find('.item-body', item);

                if (!itemContent)
                {
                    item.innerText = '';

                    dom_element({tag: 'span', class: 'item-body'}, item, content);
                }

                dom_element({tag: 'span', class: 'item-right'}, item, dom_element({tag: 'span', class: 'fa fa-check'}));
            }
            else
            {
                attr(check.parentNode, 'style', false);
            }
        }

        trigger_event(menu, 'frontbx:menu:selected', {item: item});
    }

    /**
     * @inheritdoc
     * 
     */
    Menu.prototype.render = function(props)
    {
        return dom_element({tag: 'ul', class: `menu ${props.classes ? props.classes : ''} ${props.dense ? 'menu-dense' : ''} ${props.ellipsis ? 'menu-ellipsis' : ''} ${ props.selectable ? `js-select-menu` : '' }`}, null, map(props.items, (i, item) =>
            {
                return dom_element({tag: 'li', class: `${item.state} ${props.selected && (props.selected === item.value || props.selected === item.text) ? 'selected' : null}`}, null,
                [
                    item.left ? dom_element({tag: 'span', class: 'item-left', innerHTML: item.left}) : null,
                    dom_element({tag: 'span', class: 'item-body', innerText: item.body || item.text || item }),
                    item.right ? dom_element({tag: 'span', class: 'item-right', innerHTML: item.right}) : null,
                ])
            })
        );
    }

    // Load into frontbx DOM core
    frontbx.dom().register('Menu', extend(Component, Menu));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, on, attr, closest, has_class, in_dom, off, remove_from_dom, trigger_event, is_empty, extend] = frontbx.import(['find','on','attr','closest','has_class','in_dom','off','remove_from_dom','trigger_event','is_empty','extend']).from('_');

    /**
     * Chip suggestions.
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const ChipSuggestions = function()
    {
        this.super('.js-chip-suggestions .btn-chip');
    }

    /**
     * Bind DOM listeners
     *
     * @access {private}
     */
    ChipSuggestions.prototype.bind = function(node)
    {
        on(node, 'click', this._clickHandler);
    }

    /**
     * Unbind DOM listeners
     *
     * @access {private}
     */
    ChipSuggestions.prototype.unbind = function()
    {
        off(node, 'click', this._clickHandler);
    }

    /**
     * Chip click handler
     *
     * @access {private}
     * @param  {event|null} e
     */
    ChipSuggestions.prototype._clickHandler = function(e)
    {
        e = e || window.event;


        var _wrapper = closest(this, '.js-chip-suggestions');
        var _input   = find('#' + _wrapper.dataset.inputTarget);
        var _text    = this.innerText.trim();

        if (!_input || !in_dom(_input))
        {
            throw new Error('Target node does not exist.');

            return false;
        }

        // Chips input
        if (has_class(_input, '.js-chips-input'))
        {
            frontbx.dom().component('ChipInputs').addChip(_text, _input);

            remove_from_dom(this);

            return false;
        }

        let val = attr(_input, 'value');

        attr(_input, 'value', is_empty(val) ? _text : `${val} ${_text}`);

        trigger_event(_input, 'change');

        remove_from_dom(this);

        return false;
    }

    // Load into frontbx DOM core
    frontbx.dom().register('ChipSuggestions', extend(Component, ChipSuggestions));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, add_class, on, closest, has_class, remove_class, off, trigger_event, extend] = frontbx.import(['find','add_class','on','closest','has_class','remove_class','off','trigger_event','extend']).from('_');

    /**
     * Choice chips
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const ChoiceChips = function()
    {
        this.super('.js-choice-chips .btn-chip');
    }

    /**
     * Bind DOM listeners
     *
     * @access {private}
     */
    ChoiceChips.prototype.bind = function(node)
    {
        on(node, 'click', this._clickHandler);
    }

    /**
     * Unbind DOM listeners
     *
     * @access {private}
     */
    ChoiceChips.prototype.unbind = function(node)
    {
        off(node, 'click', this._clickHandler);
    }

    /**
     * Handle click event on chip
     *
     * @access {private}
     * @param  {event|null} e
     */
    ChoiceChips.prototype._clickHandler = function(e)
    {
        e = e || window.event;

        var _wrapper = closest(this, '.js-choice-chips');

        var _input = find('.js-choice-input', _wrapper);

        if (!has_class(this, 'selected'))
        {                
            remove_class(find('.btn-chip.selected', _wrapper), 'selected');

            add_class(this, 'selected');

            if (_input)
            {
                _input.value = this.dataset.value || this.innerText.trim();

                trigger_event(_input, 'input');
                trigger_event(_input, 'change');
            }
        }
    }

    // Load into frontbx DOM core
    frontbx.dom().register('ChoiceChips', extend(Component, ChoiceChips));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [on, off, toggle_class, extend] = frontbx.import(['on','off','toggle_class', 'extend']).from('_');

    /**
     * Filter chips
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const FilterChips = function()
    {
        this.super('.js-filter-chips .btn-chip');
    }

    /**
     * Bind DOM listeners
     *
     * @access {private}
     */
    FilterChips.prototype.bind = function(node)
    {
        on(node, 'click', this._clickHandler);
    }

    /**
     * Unbind DOM listeners
     *
     * @access {private}
     */
    FilterChips.prototype.unbind = function(node)
    {
        off(node, 'click', this._clickHandler);
    }

    /**
     * Handle click event on chip
     *
     * @access {private}
     * @param  {event|null} e
     */
    FilterChips.prototype._clickHandler = function(e)
    {
        e = e || window.event;

        e.preventDefault();

        toggle_class(this, 'checked');
    }

    // Load into frontbx DOM core
    frontbx.dom().register('FilterChips', extend(Component, FilterChips));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, each, is_undefined, attr, on, off, to_camel_case, extend] = frontbx.import(['find','each','is_undefined','attr','on','off','to_camel_case','extend']).from('_');

    /**
     * Available data attributes.
     * 
     * @var {Array}
     */
    const DATA_ATTRIBUTES = ['title','content','classes','custom','close-anywhere','scroll','cancel-btn','cancel-class','confirm-btn','confirm-class','overlay','state'];

    /**
     * Toggle active on lists
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Modal = function()
    { 
        this.modals = new Map;

        this.super('.js-modal-trigger');
    }

    /**
     * @inheritdoc
     * 
     */
    Modal.prototype.bind = function(node)
    {            
        let options = { fromHTML: true, state: 'closed' };

        let elem;

        each(DATA_ATTRIBUTES, (i, attribute) =>
        {
            let value = attr(node, `data-${attribute}`);

            if (!is_undefined(value))
            {
                if (value === 'true' || value === 'false')value = value === 'true' ? true : false;

                if (attribute === 'content' && value[0] === '#')
                {
                    elem = find(value);

                    value = elem;
                }

                options[to_camel_case(attribute)] = value;
            }
        });

        let modal = frontbx.Modal(options);

        this.modals.set(node, modal);

        on(node, 'click', this._toggle, this);

        if (elem) elem.style = '';
    }

    /**
     * @inheritdoc
     * 
     */
    Modal.prototype.unbind = function(node)
    {
        let modal   = this.modals.get(node);
        let content = attr(node, 'data-content');

        if (content[0] === '#')
        {
            content = find(content);

            if (content)
            {
                content.style.display = 'none';

                document.body.appendChild(content);
            }
        }

        modal.destroy();

        this.modals.delete(node);

        off(node, 'click', this._toggle, this);
    }

    /**
     * Toggle modal.
     * 
     * @access {private}
     */
    Modal.prototype._toggle = function(e, trigger)
    { 
        let modal = this.modals.get(trigger);

        modal.closed() ? modal.open() : modal.close();
    }

    // Load into frontbx DOM core
    frontbx.dom().register('DOM_Modals', extend(Component, Modal));
})();
(function()
{
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, each, is_undefined, attr, on, off, to_camel_case, add_class, remove_class, extend] = frontbx.import(['find','each','is_undefined','attr','on','off','to_camel_case','add_class','remove_class','extend']).from('_');

    /**
     * Available data attributes.
     * 
     * @var {Array}
     */
    const DATA_ATTRIBUTES = ['content','direction','overlay','persistent','pushbody','peekable','swipeable','classes','state','easing','animation-time','responsive'];

    /**
     * Drawer
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Drawer = function()
    { 
        this.drawers = new Map;

        this.super('.js-drawer-trigger');
    }

    /**
     * @inheritdoc
     * 
     */
    Drawer.prototype.bind = function(node)
    {            
        let options = 
        { 
            fromHTML: true,
            state: 'collapsed',
            callbackClose: () => remove_class(node, 'active'),
            callbackOpen: () => add_class(node, 'active'),
        };

        let elem;

        each(DATA_ATTRIBUTES, (i, attribute) =>
        {
            let value = attr(node, `data-${attribute}`);

            if (!is_undefined(value))
            {
                if (value === 'true' || value === 'false') value = value === 'true' ? true : false;

                if (attribute === 'content' && value[0] === '#')
                {
                    elem = find(value);

                    value = elem;
                }

                options[to_camel_case(attribute)] = value;
            }
        });

        let drawer = frontbx.Drawer(options);

        this.drawers.set(node, drawer);

        on(node, 'click', this._toggle, this);

        if (elem) elem.style = '';
    }

    /**
     * @inheritdoc
     * 
     */
    Drawer.prototype.unbind = function(node)
    {
        let drawer = this.drawers.get(node);

        let content = attr(node, 'data-content');

        if (content[0] === '#')
        {
            content = find(content);
            
            if (content)
            {
                content.style.display = 'none';

                document.body.appendChild(content);
            }
        }

        drawer.destroy();

        this.drawers.delete(node);

        off(node, 'click', this._toggle, this);
    }

    /**
     * Toggle drawer.
     * 
     * @access {private}
     */
    Drawer.prototype._toggle = function(e, trigger)
    { 
        let drawer = this.drawers.get(trigger);

        drawer.closed() ? drawer.open() : drawer.close();
    }

    // Load into frontbx DOM core
    frontbx.dom().register('DOM_Drawers', extend(Component, Drawer));
    
})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, each, is_undefined, attr, on, off, to_camel_case, add_class, remove_class, extend] = frontbx.import(['find','each','is_undefined','attr','on','off','to_camel_case','add_class','remove_class','extend']).from('_');

    /**
     * Available data attributes.
     * 
     * @var {Array}
     */
    const DATA_ATTRIBUTES = ['content','overlay','persistent','peekable','swipeable','classes','state','easing','animation-time'];

    /**
     * Toggle active on lists
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Frontdrop = function()
    { 
        this.drawers = new Map;

        this.super('.js-frontdrop-trigger');
    }

    /**
     * @inheritdoc
     * 
     */
    Frontdrop.prototype.bind = function(node)
    {            
        let options = 
        { 
            fromHTML: true,
            state: 'collapsed',
            callbackClose: () => remove_class(node, 'active'),
            callbackOpen: () => add_class(node, 'active'),
        };

        let elem;

        each(DATA_ATTRIBUTES, (i, attribute) =>
        {
            let value = attr(node, `data-${attribute}`);

            if (!is_undefined(value))
            {
                if (value === 'true' || value === 'false') value = value === 'true' ? true : false;

                if (attribute === 'content' && value[0] === '#')
                {
                    elem = find(value);

                    value = elem;
                }

                options[to_camel_case(attribute)] = value;
            }
        });

        let frontdrop = frontbx.Frontdrop(options);

        this.drawers.set(node, frontdrop);

        on(node, 'click', this._toggle, this);

        if (elem) elem.style = '';
    }

    /**
     * @inheritdoc
     * 
     */
    Frontdrop.prototype.unbind = function(node)
    {
        let frontdrop = this.drawers.get(node);

        let content = attr(node, 'data-content');

        if (content[0] === '#')
        {
            content = find(content);

            if (content)
            {
                content.style.display = 'none';

                document.body.appendChild(content);
            }
        }

        frontdrop.destroy();

        this.drawers.delete(node);

        off(node, 'click', this._toggle, this);
    }

    /**
     * Toggle Frontdrop.
     * 
     * @access {private}
     */
    Frontdrop.prototype._toggle = function(e, trigger)
    { 
        let frontdrop = this.drawers.get(trigger);

        frontdrop.closed() ? frontdrop.open() : frontdrop.close();
    }

    // Load into frontbx DOM core
    frontbx.dom().register('DOM_Frontdrops', extend(Component, Frontdrop));
    
})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

     /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, each, is_undefined, attr, on, off, to_camel_case, add_class, remove_class, extend] = frontbx.import(['find','each','is_undefined','attr','on','off','to_camel_case','add_class','remove_class','extend']).from('_');

    /**
     * Available data attributes.
     * 
     * @var {Array}
     */
    const DATA_ATTRIBUTES = ['title','content','direction','classes','pushbody','swipeable','state','easing','animation-time','responsive'];

    /**
     * Toggle active on lists
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Backdrop = function()
    { 
        this.drawers = new Map;

        this.super('.js-backdrop-trigger');
    }

    /**
     * @inheritdoc
     * 
     */
    Backdrop.prototype.bind = function(node)
    {            
        let options = 
        { 
            fromHTML: true,
            state: 'collapsed',
            callbackClose: () => remove_class(node, 'active'),
            callbackOpen: () => add_class(node, 'active'),
        };

        let elem;

        each(DATA_ATTRIBUTES, (i, attribute) =>
        {
            let value = attr(node, `data-${attribute}`);

            if (!is_undefined(value))
            {
                if (value === 'true' || value === 'false') value = value === 'true' ? true : false;

                if (attribute === 'content' && value[0] === '#')
                {
                    elem = find(value);

                    value = elem;
                }

                options[to_camel_case(attribute)] = value;
            }
        });

        let backdrop = frontbx.Backdrop(options);

        this.drawers.set(node, backdrop);

        on(node, 'click', this._toggle, this);

        if (elem) elem.style = '';
    }

    /**
     * @inheritdoc
     * 
     */
    Backdrop.prototype.unbind = function(node)
    {
        let backdrop = this.drawers.get(node);
        let content = attr(node, 'data-content');

        if (content[0] === '#')
        {
            content = find(content);

            if (content)
            {
                content.style.display = 'none';

                document.body.appendChild(content);
            }
        }

        backdrop.destroy();

        this.drawers.delete(node);

        off(node, 'click', this._toggle, this);
    }

    /**
     * Toggle Backdrop.
     * 
     * @access {private}
     */
    Backdrop.prototype._toggle = function(e, trigger)
    { 
        let backdrop = this.drawers.get(trigger);
        
        backdrop.closed() ? backdrop.open() : backdrop.close();
    }

    // Load into frontbx DOM core
    frontbx.dom().register('DOM_Backdrops', extend(Component, Backdrop));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, each, is_undefined, attr, on, off, to_camel_case, extend] = frontbx.import(['find','each','is_undefined','attr','on','off','to_camel_case','extend']).from('_');

    /**
     * Available data attributes.
     * 
     * @var {Array}
     */
    const DATA_ATTRIBUTES = ['text','timeout','icon','btn','variant','btnVariant'];

    /**
     * Toggle active on lists
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Notification = function()
    {
        this.super('.js-notification-trigger');
    }

    /**
     * @inheritdoc
     * 
     */
    Notification.prototype.bind = function(node)
    {            
        on(node, 'click', this._show, this);
    }

    /**
     * @inheritdoc
     * 
     */
    Notification.prototype.unbind = function(node)
    {

        off(node, 'click', this._show, this);
    }

    /**
     * Toggle notification.
     * 
     * @access {private}
     */
    Notification.prototype._show = function(e, trigger)
    { 
        let options = { fromHTML: true };

        each(DATA_ATTRIBUTES, (i, attribute) =>
        {
            let value = attr(trigger, `data-${attribute}`);

            if (!is_undefined(value))
            {
                if (value === 'true' || value === 'false') value = value === 'true' ? true : false;

                if (attribute === 'timeout') value = parseInt(value);

                options[to_camel_case(attribute)] = value;
            }
        });

        frontbx.Notification(options);
    }

    // Load into frontbx DOM core
    frontbx.dom().register('DOM_Notifications', extend(Component, Notification));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [on, off, each, is_undefined, attr, bool, to_camel_case, extend, normalize_url]  = frontbx.import(['on','off','each','is_undefined','attr','bool','to_camel_case','extend','normalize_url']).from('_');

    /**
     * Available data attributes.
     * 
     * @var {Array}
     */
    const DATA_ATTRIBUTES = ['element','url','once','nocache','urlhash','pushstate','scrolltop','animate'];

    /**
     * Available data attributes.
     * 
     * @var {Array}
     */
    const BOOL_ATTRS = ['once','nocache','urlhash','pushstate','scrolltop','animate'];

    /**
     * URLS Requested
     * 
     * @var {object}
     */
    const REQUESTED = [];

    /**
     * Pjax Links Module
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const PjaxLinks = function()
    {
        this.super('.js-pjax-link');
    }

    /**
     * @inheritdoc
     * 
     */
    PjaxLinks.prototype.bind = function(node)
    {        
        on(node, 'click', this._requestHandler, this);
    }

    /**
     * @inheritdoc
     * 
     */
    PjaxLinks.prototype.unbind = function(node)
    {
        off(node, 'click', this._requestHandler, this);
    }

    /**
     * Event handler
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    PjaxLinks.prototype._requestHandler = function(e, trigger)
    {
        let options = { };

        each(DATA_ATTRIBUTES, (i, attribute) =>
        {
            let value = attr(trigger, `data-pjax-${attribute}`);

            if (!is_undefined(value))
            {
                if (BOOL_ATTRS.includes(attribute))
                {
                    value = bool(value);
                }
                else if (value === 'element')
                {
                    value = value[0] !== '#' ? `#${value}` : value;
                }

                options[to_camel_case(attribute)] = value;
            }
        });

        let url = trigger.href || options.url;

        // Only request once
        if (REQUESTED.includes(url) && options.once) return false;

        // No change
        if (normalize_url(url) === normalize_url(window.location.href)) return false;

        REQUESTED.push(url);

        frontbx.Pjax().request(url, options);

        return false;
    }

    // Load into frontbx DOM core
    frontbx.dom().register('PjaxLinks', extend(Component, PjaxLinks));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, on, animate, bool, has_class, is_node_type, off, toggle_class, trigger_event, extend] = frontbx.import(['find','on','animate','bool','has_class','is_node_type','off','toggle_class','trigger_event','extend']).from('_');

    /**
     * Toggle height on click
     *
     * @class
     * @extends {Component}
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Collapse = function()
    {        
        this.super('.js-collapse');
    }

    /**
     * Event binder - Binds all events on button click
     *
     * @access {private}
     */
    Collapse.prototype.bind = function(node)
    {
        on(node, 'click', this._eventHandler);
    }

    /**
     * Event unbinder - Removes all events on button click
     *
     * @access {private}
     */
    Collapse.prototype.unbind = function(node)
    {
        off(node, 'click', this._eventHandler);
    }

    /**
     * Handle the click event
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    Collapse.prototype._eventHandler = function(e)
    {
        e = e || window.event;

        if (is_node_type(this, 'a'))
        {
            e.preventDefault();
        }

        var clicked  = this;
        var targetEl = find('#' + clicked.dataset.collapseTarget);
        var duration = parseInt(clicked.dataset.collapseSpeed) || 225;
        var easing   = clicked.dataset.collapseEasing || 'easeOutExpo';
        var opacity  = bool(clicked.dataset.withOpacity);
        var closing  = has_class(clicked, 'active');

        trigger_event(targetEl, 'frontbx:collapse:toggle', closing ? 'close' : 'open');

        var options  = 
        {
            property: 'height',
            to: closing ? '0px' : 'auto',
            from: closing ? 'auto' : '0px',
            duration: duration, 
            easing: easing,
            callback: () => { trigger_event(targetEl, 'frontbx:collapse:toggled', closing ? 'close' : 'open'); }
        };

        animate(targetEl, options);
        toggle_class(clicked, 'active');
    }

    // Load into frontbx DOM core
    frontbx.dom().register('Collapse', extend(Component, Collapse));
})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, on, off, has_class, add_class, remove_class, closest, trigger_event, dom_element, map, extend] = frontbx.import(['find','on','off','has_class','add_class','remove_class','closest','trigger_event','dom_element', 'map','extend']).from('_');

    /**
     * Toggle active on lists
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const List = function()
    { 
        this.super('.js-select-list .list-item');
    }

    /**
     * @inheritdoc
     * 
     */
    List.prototype.bind = function(node)
    {            
        on(node, 'click', this._eventHandler);
    }

    /**
     * @inheritdoc
     * 
     */
    List.prototype.unbind = function(node)
    {
        off(node, 'click', this._eventHandler);
    }

    /**
     * Handle the click event
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    List.prototype._eventHandler = function(e)
    {
        e = e || window.event;
        
        if (has_class(this, 'selected')) return;

        var list = closest(this, '.js-select-list');

        remove_class(find('li.selected', list), 'selected');
        
        add_class(this, 'selected');

        trigger_event(list, 'frontbx:list:selected', {item: this});
    }

    /**
     * @inheritdoc
     * 
     */
    List.prototype.render = function(props)
    {
        return `
            <ul class="list {props.classes ? props.classes : ''} {props.dense ? 'list-dense' : ''} {props.ellipsis ? 'list-ellipsis' : ''} { props.selectable ? 'js-select-list' : '' }">
                {map(props.items, (i, item) =>
                (
                    <li class="list-item {item.state} {props.selected && (props.selected === item.value || props.selected === item.text) ? 'selected' : ''}">
                        {[
                            item.left ? <span class="item-left">{item.left}</span> : null,
                            <span class="item-body">{item.body || item.text || item}</span>,
                            item.right ? <span class="item-right">{item.right}</span> : null,
                        ]}
                    </li>
                ))}
            </ul>
        `;

        return dom_element({tag: 'ul', class: `list ${props.classes ? props.classes : ''} ${props.dense ? 'list-dense' : ''} ${props.ellipsis ? 'list-ellipsis' : ''} ${ props.selectable ? `js-select-list` : '' }`}, null, map(props.items, (i, item) =>
            {
                return dom_element({tag: 'li', class: `list-item ${item.state} ${props.selected && (props.selected === item.value || props.selected === item.text) ? 'selected' : null}`}, null,
                [
                    item.left ? dom_element({tag: 'span', class: 'item-left', innerHTML: item.left}) : null,
                    dom_element({tag: 'span', class: 'item-body', innerText: item.body || item.text || item }),
                    item.right ? dom_element({tag: 'span', class: 'item-right', innerHTML: item.right}) : null,
                ])
            })
        );
    }

    // Load into frontbx DOM core
    frontbx.dom().register('List', extend(Component, List));
})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, find_all, map, add_class, on, closest, has_class, is_string, remove_class, off, attr, css, dom_element, extend] = frontbx.import(['find','find_all','map','add_class','on','closest','has_class','is_string','remove_class','off','attr','css','dom_element','extend']).from('_');

    /**
     * Dropdown Buttons
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Dropdown = function()
    {
        this.super('.js-drop-trigger, .drop-container .js-select-menu > *:not(.menu-divider):not(.menu-header), .drop-container .js-check-menu > *:not(.menu-divider):not(.menu-header), .drop-container .js-active-menu > *:not(.menu-divider):not(.menu-header)');

        this.defaultProps =
        {
            checkable:    false,
            selectable:   false,
            caret:        false,
            ellipsis:     false,
            dense:        false,
            position:     'sw',
            anchorText:   '',
            anchorTag:    'button', 
            items:        [],
        };

        this.boundWindow  = false;
    }

    /**
     * @inheritdoc
     * 
     */
    Dropdown.prototype.bind = function(node)
    {
        if (has_class(node, 'js-drop-trigger'))
        {
            on(node, 'click', this._clickHandler, this);
        }
        else
        {
            on(node, 'click', this._selectHandler, this);
        }

        if (!this.boundWindow)
        {
            on(window, 'click', this._windowClick, this);

            this.boundWindow = true;
        }
    }

     /**
     * @inheritdoc
     * 
     */
    Dropdown.prototype.unbind = function(node)
    {
        if (has_class(node, 'js-drop-trigger'))
        {
            off(node, 'click', this._clickHandler, this);
        }
        else
        {
            off(node, 'click', this._selectHandler, this);
        }

        if (this.boundWindow)
        {
            off(window, 'click', this._windowClick, this);

            this.boundWindow = false;
        }
    }

    /**
     * Click event handler
     *
     * @param  {event|null} e JavaScript Click event
     * @access {private}
     */
    Dropdown.prototype._clickHandler = function(e, button)
    {
        var active = find('.js-drop-trigger.drop-active');

        if (active) this._hideDrop(active);

        // Remove active and return
        if (active !== button)
        {
            this._showDrop(button);
        }
    }

    /**
     * Click event handler
     *
     * @param  {event|null} e JavaScript Click event
     * @access {private}
     */
    Dropdown.prototype._hideDrop = function(button)
    {
        var drop = find('.js-drop-menu', button.parentNode);
        
        remove_class(button, ['active', 'drop-active']);
        
        attr(button, 'aria-pressed', 'false');
        
        attr(drop, 'aria-hidden', 'true');
        
        drop.blur();
    }

    /**
     * Click event handler
     *
     * @param  {event|null} e JavaScript Click event
     * @access {private}
     */
    Dropdown.prototype._showDrop = function(button)
    {
        var drop = find('.js-drop-menu', button.parentNode);
        
        add_class(button, ['active', 'drop-active']);
        
        attr(button, 'aria-pressed', 'true');
        
        attr(drop, 'aria-hidden', 'false');
        
        drop.focus();
    }

    /**
     * Window click event
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    Dropdown.prototype._windowClick = function(e)
    {
        if (closest(e.target, '.js-drop-trigger'))
        {
            return;
        }

        var active = find('.js-drop-trigger.drop-active');

        if (active) this._hideDrop(active);
    }

    /**
     * Click item on select handler
     *
     * @param  {event|null} e JavaScript Click event
     * @access {private}
     */
    Dropdown.prototype._selectHandler = function(e, item)
    {
        let wrapper    = closest(item, '.drop-container');
        let menu       = find('.js-select-menu, .js-check-menu, .js-active-menu', wrapper);
        let trigger    = find('.js-drop-trigger', wrapper);
        let selectable = has_class(trigger, 'js-drop-selectable');
        let content    = item.innerText.trim();
        let value      = attr(item, 'data-value') || content;
        let input      = find('> input', wrapper);

        if (input) attr(input, 'value', value);

        if (selectable) trigger.innerText = content;
    }

    /**
     * @inheritdoc
     * 
     */
    Dropdown.prototype.render = function(props)
    {
        return dom_element({tag: 'div', class: 'drop-container'}, null,
        [
            // Input
            props.checkable ? dom_element({tag: 'input', type: 'hidden', name: props.input, value: props.selected || ''}) : null,

            // button / anchor
            dom_element({tag: props.anchorTag, type: props.anchorTag === 'button' ? 'button' : null, role: props.anchorTag === 'button' ? 'button' : null, class: `${props.anchorTag === 'button' ? 'btn btn-dropdown' : 'btn-dropdown'} js-drop-trigger ${props.anchorClass} ${props.selectable ? 'js-select-menu' : '' }`}, null,
                [
                    props.anchorText,
                    props.caret ? dom_element({tag: 'span', class: `caret-${props.caret}`}) : null,
                ]
            ),

            // Dropdown
            dom_element({tag: 'div', class: `drop-menu ${ props.position ? `drop-${props.position}` : '' } js-drop-menu`}, null, 
                dom_element({tag: 'ul', class: `menu ${props.dense ? 'menu-dense' : ''} ${props.ellipsis ? 'menu-ellipsis' : ''} ${ props.checkable ? 'js-menu-check' : '' }`}, null, 
                    map(props.items, (i, item) =>
                    {
                        return dom_element({tag: 'li', class: `${item.state} ${props.selected && (props.selected === item.value || props.selected === item.text) ? 'selected' : null}`, dataValue: item.value || item.text || item}, null,
                        [
                            item.left ? dom_element({tag: 'span', class: 'item-left', innerHTML: item.left}) : null,
                            dom_element({tag: 'span', class: 'item-body', innerText: item.body || item.text || item }),
                            item.right ? dom_element({tag: 'span', class: 'item-right', innerHTML: item.right}) : null,
                        ])
                    })
                )
            )
        ]);
    }

    // Load into frontbx DOM core
    frontbx.dom().register('Dropdown', extend(Component, Dropdown));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, attr, add_class, on, closest, has_class, is_empty, remove_class, off, extend] = frontbx.import(['find','attr','add_class','on','closest','has_class','is_empty','remove_class','off','extend']).from('_');

    /**
     * Tab Nav
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const TabNav = function()
    {
        this.super('.js-tab-nav > li > *, .js-tab-nav > *:not(li)');
    }

    /**
     * @inheritdoc
     * 
     */
    TabNav.prototype.bind = function(node)
    {            
        on(node, 'click', this._eventHandler);
    }

    /**
     * Unbind click events on all <a> tags in a .js-tab-nav
     *
     * @params {navWrap} node
     * @access {private}
     */
    TabNav.prototype.unbind = function(node)
    {            
        off(node, 'click', this._eventHandler, this);
    }

    /**
     * Click event handler
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    TabNav.prototype._eventHandler = function(e, clicked)
    {
        let nav         = closest(clicked, '.js-tab-nav');
        let activeClass = attr(nav, 'data-active-class') || 'active';
        let panel       = find(`[data-tab-panel=${attr(clicked, 'data-tab')}]`);
        let panels      = closest(panel, '.js-tab-panels');

        if (has_class(clicked, activeClass)) return false;

        remove_class(find(`.${activeClass}[data-tab]`, nav), activeClass);
        add_class(clicked, activeClass);

        remove_class(find('.active[data-tab-panel]', panels), 'active');
        add_class(panel, 'active');

        return false;
    }   

    // Load into frontbx DOM core
    frontbx.dom().register('TabNav', extend(Component, TabNav));
})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * JS Helper reference
     * 
     * @var {object}
     */
    const [attr, extend] = frontbx.import(['attr','extend']).from('_');

    /**
     * Masks.
     * 
     * @var {Map}
     */
    const MASK_HANDLERS = new Map;

    /**
     * Input masker
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const InputMasks = function()
    {

        this.super('.js-mask');
    }

    /**
     * Event binder - Binds all events on button click
     *
     * @access {private}
     */
    InputMasks.prototype.bind = function(node)
    {
        let mask = attr(node, 'data-mask');

        let format = attr(node, 'data-format');

        if (mask && mask.startsWith('regex(')) mask = mask.trim().replace('regex(', '').slice(0, -1);

        if (mask)
        {
            MASK_HANDLERS.set(node, frontbx.InputMasker(node, mask, format));
        }
    }

    /**
     * Event unbinder - Removes all events on button click
     *
     * @access {private}
     */
    InputMasks.prototype.unbind = function(node)
    {
        let handler = MASK_HANDLERS.get(node);

        if (handler) handler.destroy();

        MASK_HANDLERS.delete(node);
    }

    // Load into frontbx DOM core
    frontbx.dom().register('InputMasks', extend(Component, InputMasks));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {function}
     */
    const [on, animate_css, closest, has_class, remove_from_dom, off, trigger_event, extend] = frontbx.import(['on','animate_css','closest','has_class','remove_from_dom','off','trigger_event','extend']).from('_');

    /**
     * Message closers
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const MessageClosers = function()
    {
        this.super('.js-close-msg');
    }

    /**
     * @inheritdoc
     * 
     */
    MessageClosers.prototype.bind = function(node)
    {
        on(node, 'click', this._eventHandler);
    }

    /**
     * @inheritdoc
     * 
     */
    MessageClosers.prototype.unbind = function(node)
    {
        off(node, 'click', this._eventHandler);
    }

    /**
     * Event handler - handles removing the message
     *
     * @param  {event}   e JavaScript click event
     * @access {private}
     */
    MessageClosers.prototype._eventHandler = function(e)
    {
        e = e || window.event;

        e.preventDefault();

        let msg      = closest(this, '.msg');
        let toRemove = msg;

        trigger_event(msg, 'frontbx:message:close');

        if (has_class(this, 'js-rmv-parent'))
        {
            toRemove = toRemove.parentNode;
        }

        animate_css(toRemove, { opacity: 0, duration: 500, easing: 'easeInOutCubic', callback: function()
        {
            trigger_event(msg, 'frontbx:message:closed');

            remove_from_dom(toRemove);
        }});
    }

    // Load into frontbx DOM core
    frontbx.dom().register('MessageClosers', extend(Component, MessageClosers));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, on, off, has_class, in_dom, parse_url, extend]  = frontbx.import(['find','on','off','has_class','in_dom','parse_url','extend']).from('_');

    /**
     * Has the page loaded?
     * 
     * @var {object}
     */
    var pageLoaded = false;

    /**
     * Waypoints
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const WayPoints = function()
    {        
        this.super('.js-waypoint-trigger');

        // Invoke pageload
        if (!pageLoaded)
        {
            this._invokePageLoad();
        }

        pageLoaded = true;
    }

    /**
     * @inheritdoc
     * 
     */
    WayPoints.prototype.bind = function(node)
    {
        on(node, 'click', this._eventHandler);
    }

    /**
     * @inheritdoc
     * 
     */
    WayPoints.prototype.unbind = function(node)
    {
        off(node, 'click', this._eventHandler);
    }

    /**
     * Event handler
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    WayPoints.prototype._eventHandler = function(e)
    {
        let trigger   = this;
        let id        = trigger.dataset.waypointTarget || trigger.href.split('#').pop();
        let speed     = parseInt(trigger.dataset.waypointSpeed) || 500;
        let easing    = trigger.dataset.waypointEasing || 'easeInOutCubic';
        let updateUrl = trigger.dataset.updateUrl === 'false' ? false : true;

        if (id && id[0] !== '#') id = `#${id}`;

        frontbx.SmoothScroll(id, { easing: easing, speed: speed, updateUrl: updateUrl });

        return false;
    }

    /**
     * Scroll to a element with id when the page loads
     *
     * @access {private}
     */
    WayPoints.prototype._invokePageLoad = function()
    {
        var url = parse_url(window.location.href);

        let targetEl = url.hash && url.hash !== '' ? find(url.hash) : false;

        if (!in_dom(targetEl) || !has_class(targetEl, '.js-waypoint')) return;
       
        let speed  = parseInt(targetEl.dataset.waypointSpeed) || 500;
        let easing = targetEl.dataset.waypointEasing || 'easeInOutCubic';

        const scroll = function()
        {
            frontbx.SmoothScroll(url.hash, { easing: easing, speed: speed, updateUrl: false });

            off(window, 'frontbx:ready', scroll);
        }

        window.scrollTo(0, 0);

        on(window, 'frontbx:ready', scroll);
    }

    // Load into frontbx DOM core
    frontbx.dom().register('WayPoints', extend(Component, WayPoints));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, add_class, on, animate_css, closest, coordinates, css, has_class, height, in_array, in_dom, inline_style, preapend, remove_class, off, rendered_style, traverse_up, trigger_event, width, extend] = frontbx.import(['find','add_class','on','animate_css','closest','coordinates','css','has_class','height','in_array','in_dom','inline_style','preapend','remove_class','off','rendered_style','traverse_up','trigger_event','width','extend']).from('_');

    /**
     * Wrappers that need "position:relative" to hide overflow.
     * 
     * @var {array}
     */
    const STATIC_POSITIONS = ['static', 'unset', 'initial'];

    /**
     * Original inline styles
     * 
     * @var {Map}
     */
    const INLINESTYLES = new Map();

    /**
     * Currently rippling
     * 
     * @var {Map}
     */
    const RIPPLING = new Map();

    /**
     * Currently clicking
     * 
     * @var {Map}
     */
    var CLICKING;

    /**
     * Selectors
     * 
     * @var {Map}
     */
    const SELECTORS =
    [
        '.btn',
        '.list > li',
        '.pagination li a',
        '.tab-nav li a',
        '.card.primary-action',
        '.card .primary-action',
        '.card-media',
        '.js-ripple'
    ];

    /**
     * Ripple click animation
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Ripple = function()
    {
        this.super(SELECTORS.join(','));
    }

    /**
     * @inheritdoc
     * 
     */
    Ripple.prototype.bind = function(node)
    {                
        // No ripples inside primary actions
        if (!has_class(node, 'primary-action') && closest(node, '.primary-action') && !has_class(node, 'card'))
        {
            return;
        }

        // No ripples inside elements with badges or status
        if (find('> .badge', node) || find('> .status', node))
        {
            return;
        }

        // No ripples inside list buttons
        if (has_class(node, 'btn') && closest(node, '.list'))
        {
            return;
        }

        // No ripples on list items with checkbox controls
        if (closest(node, '.list') && (find('> .item-right .checkbox', node) || find('> .item-right .radio', node)  || find('> .item-right .switch', node))) return;

        // Cache 'overflow' and 'position' inline styles
        // to revert back to after complete
        // If these are empty they will be removed
        if (!INLINESTYLES.has(node))
        {
            let CSSoverflow = inline_style(node, 'overflow') || false;
            
            let CSSposition = inline_style(node, 'position') || false;

            INLINESTYLES.set(node, [CSSoverflow, CSSposition]);
        }

        on(node, 'mousedown, touchstart', this._startRipple, this);
    }

    /**
     * @inheritdoc
     * 
     */
    Ripple.prototype.unbind  = function(node)
    {
        off(node, 'mousedown, touchstart', this._startRipple, this);
    }

    /**
     * Ripple handler
     *
     * @access {private}
     * @param  {event|null} e
     */
    Ripple.prototype._restore  = function(wrapper)
    {
        if (in_dom(wrapper))
        {
            wrapper.offsetHeight;

            wrapper.removeAttribute('data-event');
        
            remove_class(wrapper, 'ripple-down');

            let styles = INLINESTYLES.get(wrapper);

            css(wrapper, 'overflow', styles[0]);

            css(wrapper, 'position', styles[1]);
        }
    }

    /**
     * Ripple handler
     *
     * @access {private}
     * @param  {event|null} e
     */
    Ripple.prototype._startRipple  = function(e, wrapper)
    {
        const _this = this;

        // Ignore disabled
        if (wrapper.disabled || has_class(wrapper, 'disabled')) return;

        // Single finger "clicks" only
        if (e.touches && e.touches.length > 1) return;

        // Left click only on mouse
        if ('button' in e && e.button !== 0) return;

        // Store the event used to generate this ripple on the holder: don't allow
        // further events of different types until we're done.
        // Prevents double-ripples from mousedown/touchstart.
        var prev = wrapper.getAttribute('data-event');
        if (prev && prev !== e.type) return;

        // Clear restorer
        clearTimeout(RIPPLING.get(wrapper));

        // Add the data-attribute to identify ripple event type
        wrapper.setAttribute('data-event', e.type);

        // Add class to parent do identify mousedown/touchstart
        add_class(wrapper, 'ripple-down');

        // Figure out release event type
        var releaseEvent = (e.type === 'mousedown' ? 'mouseup' : 'touchend');

        // Cached timer for release
        var releaseTimer;
        var released = false;

        // Animation started
        const t0 = performance.now();

        // Create ripple and append immediately
        var ripple = document.createElement('SPAN');
        ripple.className = 'ripple';

        // Release event
        const release = function(ev)
        {
            // Clear timer
            clearTimeout(releaseTimer);

            // Remove release listener
            document.removeEventListener(releaseEvent, release);

            add_class(ripple, 'complete');

            setTimeout(() => wrapper.removeChild(ripple), 400);

            let restoreTimer = setTimeout(() => _this._restore(wrapper), 500);

            RIPPLING.set(wrapper, restoreTimer);
        };  

        // Figure out where to place ripple inside parent
        var c = coordinates(wrapper);
        var s = Math.max(height(wrapper), width(wrapper));
        var x = (e.pageX - c.left) - (s / 2);
        var y = (e.pageY - c.top) - (s / 2);

        // Apply styles to ripple
        css(ripple, 
        {
            width:  `${s}px`,
            height: `${s}px`,
            left:   `${x}px`,
            top:    `${y}px`
        });

        // Issue here is that if ripple is clicked multiple times in quick succession
        // the original inline overflow and position styles are overwritten by the next
        // click

        // Ensure parent hides overflow
        css(wrapper, 'overflow', 'hidden !important');

        // Ensure position relative if needed
        if (in_array(rendered_style(wrapper, 'position'), STATIC_POSITIONS))
        {
            css(wrapper, 'position', 'relative');
        }

        // Release listener
        document.addEventListener(releaseEvent, release);
            
        preapend(ripple, wrapper);
    }

    // Load into frontbx DOM core
    frontbx.dom().register('Ripple', extend(Component, Ripple));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, on, off, has_class, add_class, remove_class, closest, trigger_event, dom_element, map, is_object, extend] = frontbx.import(['find','on','off','has_class','add_class','remove_class','closest','trigger_event','dom_element','map','is_object','extend']).from('_');

    /**
     * Toggle active on tables
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Table = function()
    { 
        this.super('.js-select-table > tbody > tr');
    }

    /**
     * @inheritdoc
     * 
     */
    Table.prototype.bind = function(node)
    {            
        on(node, 'click', this._eventHandler, this);
    }

    /**
     * @inheritdoc
     * 
     */
    Table.prototype.unbind = function(node)
    {
        off(node, 'click', this._eventHandler, this);
    }

    /**
     * Handle the click event
     *
     * @param {event|null} e JavaScript click event
     * @access {private}
     */
    Table.prototype._eventHandler = function(e, row)
    {
        e = e || window.event;
        
        if (has_class(row, 'selected')) return;

        var table = closest(row, 'table');

        let selected = find('tr.selected', table);

        if (selected) remove_class(selected, 'selected');

        add_class(row, 'selected');

        trigger_event(table, 'frontbx:table:selected', { item: row });
    }

    /**
     * @inheritdoc
     * 
     */
    Table.prototype.render = function(props)
    {
        let head = dom_element({tag: 'thead'}, null, dom_element({tag: 'tr'}, null, map(props.head, (i, cell) =>
        {   
            return is_object(cell) ? dom_element({tag: 'th', ...cell}) : dom_element({tag: 'th'}, null, cell);                    
        })));

        let body = dom_element({tag: 'tbody'}, null, map(props.rows, (i, item) =>
        {
            return dom_element({tag: 'tr', class: `${props.selected && (props.selected === i) ? 'selected' : null}`}, null, map(item, (j, cell) =>
            {
                return is_object(cell) ? dom_element({tag: 'th', ...cell}) : dom_element({tag: 'th'}, null, cell);
            }));
        }));

        return dom_element({tag: 'table', class: `table ${props.classes ? props.classes : ''} ${props.dense ? 'table-dense' : ''} ${ props.selectable ? `js-select-table` : '' }`}, null, [head, body]);
    }

    // Load into frontbx DOM core
    frontbx.dom().register('Table', extend(Component, Table));

})();
(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [is_undefined, map, dom_element, extend] = frontbx.import(['is_undefined','map','dom_element','extend']).from('_');

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const AVAILABLE_OPTIONS = ['background', 'lazy', 'ratio', 'placeholder', 'src', 'grayscale'];

    /**
     * Toggle active on lists
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Image = function()
    { 
        this.super();
    }

    /**
     * @inheritdoc
     * 
     */
    Image.prototype.render = function(props)
    {
        let attrs        = map({...props}, (k, v) => !AVAILABLE_OPTIONS.includes(k) ? v : false );
        let isBackground = props.background;
        let isRatio      = !is_undefined(props.ratio);
        let isLazy       = is_undefined(props.lazy) ? false : props.lazy;
        let src          = isLazy ? (props.placeholder || window.LAZY_FALLBACK_IMAGE) : props.src;
        let dataSrc      = isLazy ? props.src : false;
        
        if (!attrs.style) attrs.style = '';
        if (!attrs.class) attrs.class = '';

        if (isLazy)
        {
            attrs.class  += ` lazyload js-lazyload ${props.grayscale ? 'grayscale' : ''}`;
            attrs.dataSrc = dataSrc;
        }

        // Background image
        if (isBackground)
        {
            attrs.class += ' bg-image';
            attrs.style += `;background-image: url(${src})`;
            
            if (isRatio) attrs.class += ` ratio-${props.ratio}`;

            return dom_element({...attrs, tag: 'div'});
        }

        attrs.src = src;

        let image = dom_element({...attrs, src: src, dataSrc: dataSrc, tag: 'img'})

        // Ratio image
        if (isRatio)
        {
            return dom_element({tag: 'div', class: `ratio-img ratio-${props.ratio}`}, null, image);
        }

        return image;
    }

    // Load into frontbx DOM core
    frontbx.dom().register('Image', extend(Component, Image));
    
})();

// boot frontbx
/**
 * Boot and initialize frontbx core
 *
 * @author    {Joe J. Howard}
 * @copyright {Joe J. Howard}
 * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
 */
(function()
{
	frontbx.boot();
		
})();

export default frontbx;

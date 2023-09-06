'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pure = require('@stream-pay/streampay-js/pure');

function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
        var _s,
            _e,
            _x,
            _r,
            _arr = [],
            _n = !0,
            _d = !1;
        try {
            if (_x = (_i = _i.call(arr)).next, 0 === i) {
                if (Object(_i) !== _i) return;
                _n = !1;
            } else
                for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
        } catch (err) {
            _d = !0, _e = err;
        } finally {
            try {
                if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }
}

function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
}

function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var ONRAMP_URL = 'https://crypto-js.streampayments.app/crypto-onramp-outer.js';
var findScript = function findScript() {
    var scripts = document.querySelectorAll("script[src^=\"".concat(ONRAMP_URL, "\"]"));
    for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (ONRAMP_URL !== script.src) {
            continue;
        }
        return script;
    }
    return null;
};
var injectScript = function injectScript() {
    var script = document.createElement('script');
    script.src = ONRAMP_URL;
    var headOrBody = document.head || document.body;
    if (!headOrBody) {
        throw new Error('Expected document.body not to be null. StreamPay Crypto requires a <body> element.');
    }
    headOrBody.appendChild(script);
    return script;
};
var registerWrapper = function registerWrapper(streampay, startTime) {
    // TODO(forestfang): we do not have a mechanism to track metrics here yet
    if (!streampay || !streampay._registerWrapper) {
        return;
    }
    streampay._registerWrapper({
        name: 'crypto-js',
        version: "0.0.4",
        startTime: startTime
    });
};
var streampayPromise = null;
var loadScript = function loadScript() {
    // Ensure that we only attempt to load StreamPay.js at most once
    if (streampayPromise !== null) {
        return streampayPromise;
    }
    streampayPromise = new Promise(function(resolve, reject) {
        if (typeof window === 'undefined') {
            // Resolve to null when imported server side. This makes the module
            // safe to import in an isomorphic code base.
            resolve(null);
            return;
        }
        if (window.StreamPayOnramp) {
            resolve(window.StreamPayOnramp);
            return;
        }
        try {
            var script = findScript();
            if (!script) {
                script = injectScript();
            }
            script.addEventListener('load', function() {
                if (window.StreamPayOnramp) {
                    resolve(window.StreamPayOnramp);
                } else {
                    reject(new Error('StreamPayOnramp not available'));
                }
            });
            script.addEventListener('error', function() {
                reject(new Error('Failed to load StreamPayOnramp'));
            });
        } catch (error) {
            reject(error);
            return;
        }
    });
    return streampayPromise;
};
var initStreamPayOnramp = function initStreamPayOnramp(maybeStreamPayOnramp, args, startTime) {
    if (maybeStreamPayOnramp === null) {
        return null;
    }
    var streampayOnramp = maybeStreamPayOnramp.apply(undefined, args);
    registerWrapper(streampayOnramp, startTime);
    return streampayOnramp;
};

var loadStreamPayOnramp = function loadStreamPayOnramp() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }
    var startTime = Date.now();
    return Promise.all([pure.loadStreamPay.apply(void 0, args), loadScript()]).then(function(_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            maybeStreamPayOnramp = _ref2[1];
        return initStreamPayOnramp(maybeStreamPayOnramp, args, startTime);
    });
};

exports.loadStreamPayOnramp = loadStreamPayOnramp;
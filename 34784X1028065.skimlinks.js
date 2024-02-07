/**
 * @preserve (c) Skimlinks 2009-2024
 * Build time: Thu, 25 Jan 2024 13:34:09 GMT
 * Version: __PLACEHOLDER__JS_VERSION__
 */
(function () {
    function isFunction(obj) {
      /*
       * Safari 9 has a bug that returns typeof `object` for a function.
       * Using `Object#toString` and retrieve to object class avoids that issue
       * https://github.com/lodash/lodash/blob/master/isFunction.js
       * There are several issues raised for this in the "old" underscore lib,
       * one of them is this one https://github.com/jashkenas/underscore/issues/1929
       */
      return Object.prototype.toString.call(obj) === "[object Function]";
    }

    function reduce(array, iteratee, accumulator) {
      var index = 0;
      var length = array === null ? 0 : array.length;

      while (index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
        index += 1;
      }

      return accumulator;
    }

    var console$1 = {
      log: getLogFn("log"),
      info: getLogFn("info"),
      warn: getLogFn("warn"),
      error: getLogFn("error")
    };
    /**
     * @param {("log"|"info"|"warn"|"error")} level
     * @return {Function}
     */

    function getLogFn(level) {
      var hasLogMethod = "console" in window && isFunction(window.console[level]);

      return hasLogMethod ? window.console[level] : function () {};
    }

    /** @type {Boolean} */

    var supportsAllBrowserFeatures = supportsAllBrowserFeatures$1();
    /**
     * Test if browser has necessary native features.
     * Current browser support is IE11+
     *
     * @return {Boolean}
     */

    function supportsAllBrowserFeatures$1() {
      var result = true;

      try {
        var tests = [supportsJson(), supportsAjaxCORS(), hasAllMethods(document, ["querySelector", "querySelectorAll"]), hasAllMethods(Object, ["keys"]), hasAllMethods([], ["indexOf"]), hasAllMethods("", ["indexOf"])];
        result = reduce(tests, function (acc, result) {
          return acc && result;
        }, true);
      } catch (err) {
        // Safety net in case the code used in the browser feature checks is unsupported.
        result = false;
      }

      if (result === false) {
        console$1.info("[Skimlinks] Your browser doesn't support the base features necessary to run our javascript.");
      }

      return result;
    }

    function hasAllMethods(object, methods) {
      var reduceFn = function reduceFn(acc, method) {
        return acc && isFunction(object[method]);
      };

      return reduce(methods, reduceFn, true);
    }

    function supportsJson() {
      try {
        var json = JSON.stringify({
          a: 1
        });
        return JSON.parse(json).a === 1;
      } catch (err) {
        return false;
      }
    }

    function supportsAjaxCORS() {
      // Inspired by jQuery https://github.com/jquery/jquery/blob/1.12-stable/src/ajax/xhr.js#L59
      return Boolean(window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest());
    }

    /**
     * Source:
     *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
     */
    function CustomError(name, message) {
      var instance = new Error(message);
      instance.name = name;
      setPrototypeOf(instance, getPrototypeOf(this));

      if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, CustomError);
      }

      return instance;
    }
    CustomError.prototype = Object.create(Error.prototype, {
      constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    setPrototypeOf(CustomError, Error);

    function getPrototypeOf(object) {
      return "getPrototypeOf" in Object ? Object.getPrototypeOf(object) : object.__proto__;
    }

    function setPrototypeOf(ctor, superCtor) {
      if ("setPrototypeOf" in Object) {
        Object.setPrototypeOf(ctor, superCtor);
      } else {
        ctor.__proto__ = superCtor;
      }
    }

    var DocumentBodyNotFound = CustomError.bind(null, "DocumentBodyNotFound");
    var PixelDropFailed = CustomError.bind(null, "PixelDropFailed");
    var ScriptDropFailed = CustomError.bind(null, "ScriptDropFailed");
    var XhrError = CustomError.bind(null, "XhrError");
    var XhrError4xx = CustomError.bind(null, "XhrError4xx");
    var XhrError5xx = CustomError.bind(null, "XhrError5xx");
    var XhrErrorZero = CustomError.bind(null, "XhrErrorZero");
    var SentryLoggerError = CustomError.bind(null, "SentryLoggerError");
    var SendBeaconFailedError = CustomError.bind(null, "SendBeaconFailedError");
    var ResolveSslCertificateError = CustomError.bind(null, "ResolveSslCertificateError");
    var DisclosureReadyStateTimeout = CustomError.bind(null, "DisclosureReadyStateTimeout");

    function isNil(value) {
      return typeof value === "undefined" || value === null;
    }

    function isArray(arg) {
      if (Array.isArray) {
        return Array.isArray(arg);
      } // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Polyfill


      return Object.prototype.toString.call(arg) === "[object Array]";
    }

    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    function forEach(iteratee, callback) {
      if (isArray(iteratee)) {
        arrayForEach(iteratee, callback);
      } else {
        objectForEach(iteratee, callback);
      }
    }

    function arrayForEach(array, callback) {
      for (var i = 0; i < array.length; i++) {
        callback(array[i], i, array);
      }
    }

    function objectForEach(object, callback) {
      // eslint-disable-next-line no-restricted-syntax
      for (var key in object) {
        if (hasOwnProperty(object, key)) {
          callback(object[key], key, object);
        }
      }
    }

    function assign() {
      var destinationObject = arguments[0];
      var sourceObjectList = Array.prototype.slice.call(arguments, 1);

      if (isNil(destinationObject)) {
        destinationObject = {};
      }

      forEach(sourceObjectList, function (sourceObject) {
        if (isNil(sourceObject)) {
          sourceObject = {};
        }

        forEach(Object.keys(sourceObject), function (propName) {
          destinationObject[propName] = sourceObject[propName];
        });
      });
      return destinationObject;
    }

    function filter(array, callback) {
      var res = [];

      forEach(array, function (item, i) {
        if (callback(item, i, array)) {
          res.push(item);
        }
      });

      return res;
    }

    function compact(arr) {
      if (arr === void 0) {
        arr = [];
      }

      return filter(arr, function (item) {
        return Boolean(item);
      });
    }

    /**
     * Array mapping. Does not support objects.
     * @param {Array} array
     * @param {Function} iteratee
     * @return {Array}
     */

    function map(array, iteratee) {
      if (!array) {
        return [];
      }

      if (!iteratee) {
        return [].concat(array);
      }

      var res = [];

      forEach(array, function (item, index) {
        res.push(iteratee(item, index, array));
      });

      return res;
    }

    /**
     * Removes normal and non-breakable spaces sitting
     * at the beginning or the end of a string.
     */

    function trim(str) {
      if (isNil(str)) {
        return "";
      }

      return str.toString().replace(/^[\s\xA0]+|[\s\xA0]+$/g, "");
    }

    function isBoolean(obj) {
      return typeof obj === "boolean";
    }

    /**
     * Returns 4 "random" characters
     *
     * Source:
     * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     *
     * @return {String}
     */
    var randomChars = function randomChars() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    /**
     * Returns 32 "random" characters
     *
     * @return {String}
     */


    var generateUuid = function generateUuid() {
      var str = "";

      for (var i = 0; i < 8; i++) {
        str += randomChars();
      }

      return str;
    };

    /**
     * Use this instead of using ES6 default argument as
     * babel adds extra checks that increase the bundle size.
     * Returns the default value if the value is undefined.
     * @param {*} value
     * @param {*} defaultValue
     */
    function defaultValue(value, defaultValue) {
      if (typeof value === "undefined") {
        return defaultValue;
      }

      return value;
    }

    /**
     * Checks if a string starts with another string.
     *
     * Source:
     * https://github.com/Financial-Times/polyfill-service/blob/master/polyfills/String/prototype/startsWith/polyfill.js
     *
     * @param {string} string
     * @param {string} searchString
     * @param {number} [position=0]
     * @return {boolean}
     */

    function startsWith(string, searchString, position) {
      string = defaultValue(string, "");
      searchString = defaultValue(searchString, "");
      position = defaultValue(position, 0);
      return string.slice(position).indexOf(searchString) === 0;
    }

    /**
     * Checks if a string ends with another string.
     *
     * Source:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
     *
     * @param {string} string
     * @param {string} searchString
     * @param {number} [position=0]
     * @return {boolean}
     */

    function endsWith(string, searchStr, position) {
      string = defaultValue(string, "");
      searchStr = defaultValue(searchStr, "");
      position = defaultValue(position, 0); // This works much better than >= because
      // it compensates for NaN:

      if (!(position < string.length)) {
        position = string.length;
      } else {
        // round position
        position |= 0; // eslint-disable-line no-bitwise
      }

      return string.substr(position - searchStr.length, searchStr.length) === searchStr;
    }

    /**
     * Checks if obj is an object, i.e. its properties can be set at will.
     * This is different from checking whether obj is a plain JS object since
     * arrays will also pass this test.
     *
     * Implementation is the same has lodash's original #isObject method. Refer to
     * #isPlainObject if you're after an actual JS object check.
     *
     * @param {*} obj
     * @returns {boolean}
     */
    function isObject(obj) {
      var type = typeof obj;
      return obj !== null && (type === "object" || type === "function");
    }

    function capitalize(string) {
      if (!string) {
        return "";
      }

      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Attempts to read the pre-swap original property or default to the current prop value.
     *
     * @param {Element} anchor
     * @param {string} propName
     * @returns {*}
     */

    function getPreSwapProp(anchor, propName) {
      return anchor["skimlinksOriginal" + capitalize(propName)] || anchor[propName];
    }

    /**
     * RFC-3986 compliant version of native encodeURIComponent
     * which reserves !, ', (, ), and * even though these characters
     * have no formalized URI delimiting uses.
     * cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
     *
     * Can be safely used in place of native encodeURIComponent.
     *
     * Note: the ~ (tilde) character has been added to the list of characters to escape. No idea why???
     *
     * @param {string} str
     */

    function encodeURIComponentRFC3986(str) {
      return encodeURIComponent(str).replace(/[!'()*~]/g, function (c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    /**
     * @param {String} url
     * @param {Boolean} considerNoProtocolAsRelative - Default true. In the browser having a link without
     *   protocol will be treated as a relative link E.g: <a href="www.google.com">... is the same as <a href="/www.google.com">.
     *   This function will therefore return the current domain instead of "google.com".
     *   Set 'considerNoProtocolAsRelative' flag to false if you don't want the browser behaviour and don't want to consider this type of url as
     *   relative. (Relative urls starting with a "/" will still be treated as relative)
     * @return {String} - the domain without protocol and without "www.""
     */

    function getDomainFromUrl(url, considerNoProtocolAsRelative) {
      if (considerNoProtocolAsRelative === void 0) {
        considerNoProtocolAsRelative = true;
      }

      // Gets the domain/hostname from a url by creating a tmp "a" object
      var a = document.createElement("a"); // a.hostname will return the hostname of the current page if no protocol is present in the url.

      a.href = considerNoProtocolAsRelative ? url : addProtocolIfMissing(url);

      try {
        // Some invalid urls like "http://javascript:void(0)" would make a.hostname crash on IE and Edge.
        return stripWww(a.hostname);
      } catch (error) {
        return "";
      }
    }
    /**
     * Add http:// at the begining of the url if it doesn't have any protocol information.
     * If the url is protocol relative url it will be added the default protocol.
     * If the url is a root relative url it will not be prefixed with any protocol.
     * Note: Inspired by https://github.com/skimhub/helium/blob/ef0b3da094cf55f9ec84e5c6f4aac213a7dbd187/v2/utils/url.js#L35
     * @param {String} url
     * @param {String} defaultProtocol - "http" by default but could be "https"
     * @return {String} - A new string with a protocol attached when possible.
     */

    function addProtocolIfMissing(url, defaultProtocol) {
      if (defaultProtocol === void 0) {
        defaultProtocol = "http";
      }

      var urlPrefix = ""; // Relative url which starts with one slash e.g: "/mypage" should not receive the prefix.

      if (!hasExplicitProtocol(url) && !isRootRelativeUrl(url)) {
        urlPrefix = hasProtocolRelativeUrl(url) ? defaultProtocol + ":" : defaultProtocol + "://";
      }

      return "" + urlPrefix + url;
    }
    /**
     * Returns true if the url starts with http or https.
     * @param {String} url
     * @return {Boolean}
     */

    function hasExplicitProtocol(url) {
      return /^https?:\/\//.test(url);
    }
    /**
     * Returns true if the url starts with "//".
     * E.g: "//mydomain.com" => true
     * @param {String} url
     * @return {Boolean}
     */

    function hasProtocolRelativeUrl(url) {
      return /^\/\//.test(url);
    }
    /**
     * Returns true if the url starts with one slash.
     * E.g:
     *  - "/page.html" => true
     *  - "//page.com" => false
     * @param {String} url
     * @return {Boolean}
     */

    function isRootRelativeUrl(url) {
      return /^\/[^/]+/.test(url);
    }
    /**
     * Remove "www." from url.
     * @param {String} url
     */

    var stripWww = function stripWww(url) {
      return url ? url.replace(/^www\./i, "") : "";
    };
    /**
     * Remove protocol ("//", "http://", "https://") from url
     * @param {String} url
     */

    var stripProtocol = function stripProtocol(url) {
      return url.replace(/^\/\/|^https?:\/\//, "");
    };
    var extractParamsFromUrl = function extractParamsFromUrl(url) {
      var a = document.createElement("a");
      var params = {};
      a.href = url; // If there's queryParams, the first char will always be `?`

      var paramString = a.search.substring(1);

      if (paramString) {
        var queryParams = paramString.replace(/&amp;/g, "&").split("&");

        for (var i = 0; i < queryParams.length; i++) {
          var _queryParams$i$split = queryParams[i].split("="),
              key = _queryParams$i$split[0],
              value = _queryParams$i$split[1];

          params[key] = value ? decodeURIComponent(value) : null;
        }
      }

      return params;
    };
    /**
     * Anchor can have different data based on the parent context.
     *  f.e. 
     *   - HTML Anchor -> href value "http://www.google.com"
     *   - SVG Anchor -> href value { baseVal: "http://www.google.com", animVal: "http://www.google.com" }
     * This function will extract and sanitize the href attribute
     * @param {HTMLAnchort} anchor 
     */

    var extractHrefFromAnchor = function extractHrefFromAnchor(anchor) {
      try {
        // Some malformed urls or different object structure may cause href crash.
        var anchorRef = getPreSwapProp(anchor, "href");

        var href = trim(isObject(anchorRef) ? anchorRef.baseVal : anchorRef);

        return href;
      } catch (error) {
        console.error("Unexpected href format");
        console.error(error);
        return "";
      }
    };
    /**
     * Compare two domain names and return true if the first one is a sub domain of the second one.
     * E.g: isSubDomain("sport.telegraph.co.uk", "telegraph.co.uk") => true
     * @param {String} potentialSubDomain
     * @param {String} domainRef
     * @return {Boolean}
     */

    function isSubDomain(potentialSubDomain, mainDomain) {
      return endsWith(potentialSubDomain, "." + mainDomain);
    }
    /**
     * Check if a url is an outbound link or not.
     * (i.e: a url with a different domain that the current location hostname).
     *
     * Note: Sub-domains should be considered as internal domains.
     * E.g:
     *  - Link from "sports.telegraph.co.uk" to "telegraph.co.uk" => internal
     *  - Link from "telegraph.co.uk" to "sports.telegraph.co.uk" => internal
     *  - Link from "sports.telegraph.co.uk" to "garden.telegraph.co.uk" => Should be considered as internal but
     *    considered as external for technical reasons. (It's hard to detect if two sub-domains come from the same main domain)
     * @param {String} url - The url we want to check
     * @param {Boolean} considerNoProtocolAsInternal - Default true. In the browser having a link without
     *   protocol will be treated as a relative link E.g: <a href="www.google.com">... is the same as <a href="/www.google.com">.
     *   This function will therefore consider any url without protocol as internal.
     *   Set 'considerNoProtocolAsInternal' flag to false if you don't want the browser behaviour and don't want to consider this type of url as
     *   relative. (Relative urls starting with a "/" will still be treated as internal)
     * @return {Boolean}
     */

    function isExternalUrl(currentDomain, url, considerNoProtocolAsInternal) {
      considerNoProtocolAsInternal = defaultValue(considerNoProtocolAsInternal, true);
      var urlDomain = getDomainFromUrl(url, considerNoProtocolAsInternal); // Consider sub-domains as internal.

      var haveSameMainDomain = isSubDomain(urlDomain, currentDomain) || isSubDomain(currentDomain, urlDomain);
      return urlDomain !== currentDomain && !haveSameMainDomain;
    }
    /**
     * ```js
     * removeQueryParamsFromUrl("http://example.com/foo?bar=1", "bar")
     * // "http://example.com/foo"
     * ```
     *
     * TODO: Refactor to use queryStringToObject and objectToQueryString utils
     *
     * @param {string} url
     * @param {string} queryParam
     * @return {string}
     */

    function removeQueryParamsFromUrl(url, queryParam) {
      var urlBase;
      var queryString;
      var prefix;
      var pars;
      var urlParts = url.split("?");

      if (urlParts.length >= 2) {
        urlBase = urlParts.shift(); // get first part, and remove from array

        queryString = urlParts.join("?"); // join it back up
        // Using the native encodeURIComponent since the input URL is not ours.

        prefix = encodeURIComponent(queryParam) + "=";
        pars = queryString.split(/[&;]/gi); // Reverse iteration as may be destructive

        for (var i = pars.length - 1; i >= 0; i--) {
          if (startsWith(pars[i], prefix)) {
            pars.splice(i, 1);
          }
        }

        url = urlBase + "?" + pars.join("&");
      }

      return url;
    }
    /**
     * Cleanup the url by removing commonly used query params considered as junk.
     */


    function removeJunkQueryParamsFromUrl(url) {

      var junkQueryParams = ["aspsession-id", "aspsessionid", "cftoken", "j-sessionid", "jsessid", "jsession_id", "jsessionid", "phpsessid", "phpsession-id", "phpsessionid", "seskey", "sessid", "session-id", "session-key", "session_id", "sessionid", "sessionkey", "uniqueid", "utm_campaign", "utm_medium", "utm_source", "utm_term"];

      for (var i = 0; i < junkQueryParams.length; i++) {
        url = removeQueryParamsFromUrl(url, junkQueryParams[i]);
      }

      if (url[url.length - 1] === "?") {
        url = url.substr(0, url.length - 1);
      }

      return url;
    }
    function buildQueryString(queryParams, encodeFunction) {
      var params = [];
      encodeFunction = encodeFunction || encodeURIComponentRFC3986;

      forEach(queryParams, function (value, key) {
        params.push(key + "=" + encodeFunction(value));
      });

      return params.join("&");
    }

    /**
     * This is the "lower-level" util used by `./request.js`.
     *
     * You should use the `./request.js` util unless you don't want the embedded
     * catchAndLog behaviour (e.g. sending request to Sentry).
     *
     * @param {string} url
     * @param {object} [queryParams]
     * @param {function} [callback]
     * @param {object} [options]
     * @return {XMLHttpRequest}
     */

    function sendXhrRequest(url, queryParams, callback, options) {
      queryParams = queryParams || {};
      options = options || {};
      var data = options.data;
      var headers = options.headers || {};
      var method = options.method || "GET";
      var withCredentials = options.withCredentials || false;
      var req = new XMLHttpRequest();

      if (withCredentials) {
        req.withCredentials = true;
      }

      var queryString = buildQueryString(queryParams);

      if (queryString.length) {
        url = url + "?" + queryString;
      }

      req.open(method, url); // Set headers

      forEach(headers, function (value, key) {
        req.setRequestHeader(key, value);
      });

      var onError = function onError() {
        if (!isFunction(options.onError)) {
          return;
        }

        var isZero = req.status === 0;
        var is4xx = req.status >= 400 && req.status < 500;
        var is5xx = req.status >= 500 && req.status < 600;
        var ErrorClass;

        if (isZero) {
          ErrorClass = XhrErrorZero;
        } else if (is4xx) {
          ErrorClass = XhrError4xx;
        } else if (is5xx) {
          ErrorClass = XhrError5xx;
        } else {
          ErrorClass = XhrError;
        }

        options.onError(new ErrorClass(method + " " + url + " " + req.status));
      };

      var onLoad = function onLoad() {
        if (!isFunction(callback)) {
          return;
        }

        var is2xx = req.status >= 200 && req.status < 300;

        if (is2xx) {
          var parsedResponse;

          try {
            parsedResponse = JSON.parse(req.responseText);
          } catch (err) {
            parsedResponse = req.responseText;
          }

          callback(parsedResponse);
        } else {
          onError();
        }
      };

      req.onload = onLoad;
      req.onerror = onError;
      req.send(data);
      return req;
    }

    function get(obj, crumbs, defaultValue) {
      if (!obj || !crumbs || !crumbs.length) {
        return defaultValue;
      }

      var crumbsLen = crumbs.length;

      for (var i = 0; i < crumbsLen; i++) {
        var crumb = crumbs[i];

        if (obj && crumb in obj) {
          obj = obj[crumb];
        } else {
          return defaultValue;
        }
      }

      return obj;
    }

    var merchantUrlExtractionRules = {
      "t.umblr.com": {
        name: "z"
      }
    };

    var JS_VERSION = "51706d8f";
    var CONSENT_STORAGE_KEY = "skimCONSENT";
    var GLOBAL_NAMESPACE = "__SKIM_JS_GLOBAL__";
    var SKIMLINKS_API_NAMESPACE = "skimlinksAPI"; // Delay for neutering the click handlers after one gets triggered.
    // Human-made clicks tend to be 100-300ms long (possibly more for slow users)

    var USER_CLICKS_THROTTLING = 200; // ms
    // Default restoration delay is 300ms (cf. options.yml). This shorter delay is useful for
    // the right-click handler in mobile scenarii where the `touchstart` event gets triggered very
    // early on and we want the anchor's href to be reverted to its original value by the time the
    // left-click handler for affiliation is invoked (on `click` or `mouseup` events)

    var MOBILE_HREF_RESTORATION_DELAY = 200; // ms
    var BEACON_API_URL = "https://r.skimresources.com/api/";
    var MERCHANT_URL_EXTRACTION_RULES = merchantUrlExtractionRules;
    var DOMAIN_KEY = "296X1634315"; // For e.g. "123X234"

    var PUBLISHER_ID = 296;
    var DOMAIN_ID = 1634315;
    var TRACKING_API_URL = "https://t.skimresources.com/api/v2";
    var TABOOLA_BO_PUBLISHER_ID = "skimlinks-purewow";
    var TABOOLA_BO_AB_PERCENTAGE = 100; // Taboola widget specific configuration

    var taboolaWidgetConfiguration = {
      mode: "add",
      maxLinksPerCard: 3,
      cardSelector: "div.article__content ul li",
      buttonSelector: "a[aria-label*=\"buy here\"]",
      template: "<div style=\"display:inline\">&nbsp;&nbsp;|&nbsp;&nbsp;<a href=\"{{url}}\" target=\"_blank\" rel=\"nofollow sponsored noreferrer noopener\">Buy on {{merchantName}}</a>"
    };
    var taboolaWidgetCustomStyles = ".product-card__affiliate-price { min-width: 200px !important; }";
    var WAYPOINT_DOMAIN = "go.skimresources.com"; // After mid-2018, go.skimresources.com should be prefered to go.redirectingat.com. However, since the internet
    // will contain links to go.redirectingat.com for eternity we still need to support them.

    var WAYPOINT_LEGACY_DOMAIN = "go.redirectingat.com"; // Sentry API

    var SENTRY_URL = "";
    var SENTRY_PUBLIC_KEY = null;
    /**
     * PLUGINS LIFECYCLE EVENTS
     */
    // Sent from main.js to start initialising plugins global variables and event listeners.

    var EVENTS__SKIM_JS_INIT = "skim_js_init"; // Sent from main.js once all the plugins have initialized. This is the start signal for plugins to start running.

    var EVENTS__SKIM_JS_START = "skim_js_start";

    /** @type {function(): [Boolean]} */

    var isAdblockUser = function isAdblockUser() {
      return get(getDebugInfo(), ["runTimeInfo", "isAdblockUser"]);
    };
    /** @type {function(): [String]} */

    var userCountry = function userCountry() {
      return get(getDebugInfo(), ["runTimeInfo", "country"]);
    };
    /** @type {function(): [Boolean]} */

    var beaconConsent = function beaconConsent() {
      return get(getDebugInfo(), ["runTimeInfo", "consent"]);
    };
    /** @type {function(): [Boolean]} */

    var iabConsent = function iabConsent() {
      return get(getDebugInfo(), ["runTimeInfo", "consentState", "skimlinks_consent"]);
    };
    /**
     * Intentionally not using `utils/getDebugInfo` here as we try to keep this module independent from
     * the core state, making those selectors portable in any external module.
     *
     * @return {Object}
     */

    function getDebugInfo() {
      if (window[GLOBAL_NAMESPACE] && isFunction(window[GLOBAL_NAMESPACE].getDebugInfo)) {
        return window[GLOBAL_NAMESPACE].getDebugInfo();
      }

      return {};
    }

    // Repo: https://github.com/getsentry/sentry-javascript/tree/master/packages/raven-js

    var SENTRY_CLIENT = "raven-js/3.26.4";
    var SENTRY_VERSION = "7";
    var LOGGER_NAME = "javascript";
    var PROJECT_ID = "46";
    var SAMPLING_RATE = 1000; // i.e. one in $SAMPLING_RATE errors logged
    // Basic sampling to avoid hammering the Sentry API. Done only once per
    // page to make sure all errors are logged for a given visit.

    var diceRoll = SAMPLING_RATE * Math.random();
    var diceSayYes = diceRoll < 1; // Name of the property used to attach extra data to an Error.

    var EXTRA_DATA_PROP = "__sentryExtraData__";
    var sentryLogger = {
      /**
       * @param {Error} err
       * @param {boolean} ensureDelivery - bypass error sampling if true
       */
      sendError: function sendError(err, ensureDelivery) {
        // Pass through the error when this logger isn't configured properly.
        {
          throw err;
        }

        if (!shouldLogError(err, ensureDelivery)) {
          return;
        }

        var endpointUrl = SENTRY_URL + "/api/" + PROJECT_ID + "/store/";
        var queryParams = {
          sentry_version: SENTRY_VERSION,
          sentry_client: SENTRY_CLIENT,
          sentry_key: SENTRY_PUBLIC_KEY
        };
        var payload = getPayload(err, {
          country: userCountry(),
          beacon_consent: beaconConsent(),
          iab_consent: iabConsent(),
          is_adblock_user: isAdblockUser(),
          is_top_frame: window.top === window
        });
        sendXhrRequest(endpointUrl, queryParams, null, {
          method: "POST",
          data: JSON.stringify(payload)
        });
      }
    };
    /**
     *
     * @param {Error} err
     * @param {boolean} ensureDelivery - bypass error sampling if true
     *   - false =>  one chance out of SAMPLING_RATE to send it. (default)
     *   - true => Always send the error (to be used with caution
     *    to not overload sentry)
     */

    function shouldLogError(err, ensureDelivery) {
      // Default to false if not specified.
      ensureDelivery = isBoolean(ensureDelivery) ? ensureDelivery : false;

      if (!ensureDelivery && !diceSayYes) {
        return false;
      } // Do not log PixelDropFailed errors for adblock users since we're
      // kinda expecting those and they would clutter the Sentry logs.


      if (err instanceof PixelDropFailed && isAdblockUser()) {
        return false;
      }

      return true;
    }
    /**
     * Parses one line of an error stack trace and convert it to the format expected by Sentry API.
     *
     * Sentry's SDK uses csnover/TraceKit for that purpose (3kB minified + gzipped).
     * This is basically a simpler version of it...
     *
     * @param {string} line
     * @return {{
     *   filename: string,
     *   function: string,
     *   lineno: ?number,
     *   colno: ?number,
     *   in_app: boolean
     * }}
     */


    function parseStackLine(line) {
      var LINE_COL_REGEX = /(?::(\d+))?:(\d+)$/;
      var FUNCTION_REGEX = /^([^ ]+)\s\((.*)\)$/; // Initialise output with default values

      var parsedLine = {
        filename: line,
        "function": "?",
        lineno: null,
        colno: null,
        in_app: true
      }; // For lines in the format: `<functionName> (<filename>)`

      if (FUNCTION_REGEX.test(line)) {
        var _line$match$slice = line.match(FUNCTION_REGEX).slice(1),
            functionName = _line$match$slice[0],
            filename = _line$match$slice[1];

        parsedLine["function"] = functionName;
        parsedLine.filename = filename;
      } // If the filename contains line and/or column indexes


      if (LINE_COL_REGEX.test(parsedLine.filename)) {
        var _parsedLine$filename$ = parsedLine.filename.match(LINE_COL_REGEX).slice(1),
            lineIdx = _parsedLine$filename$[0],
            colIdx = _parsedLine$filename$[1];

        if (lineIdx && colIdx) {
          parsedLine.lineno = parseInt(lineIdx, 10);
          parsedLine.colno = parseInt(colIdx, 10);
        } else if (!lineIdx && colIdx) {
          parsedLine.lineno = parseInt(colIdx, 10);
        } // Cleanup the filename to remove line/column indexes


        parsedLine.filename = parsedLine.filename.replace(LINE_COL_REGEX, "");
      }

      return parsedLine;
    }
    /**
     * Extract relevant lines from stack trace and format it for
     * POST request to Sentry API.
     *
     * @param {Error} err
     * @return {Array<Object>}
     */


    function getStackFrames(err) {
      var cleanStack = err.stack.replace(err.toString(), "") // Remove title
      .replace(/^\s+at\s+/gm, ""); // Remove "at" prefixes

      var stackLines = cleanStack.split("\n");
      stackLines = map(stackLines, function (s) {
        return trim(s);
      });
      stackLines = compact(stackLines);
      stackLines.reverse(); // Frames order is reversed compared to trace's lines

      return map(stackLines, parseStackLine);
    }

    function getExceptionProp(err) {
      return {
        values: [{
          type: err.name,
          value: err.message,
          stacktrace: {
            frames: getStackFrames(err)
          }
        }]
      };
    }

    function getRequestProp() {
      return {
        headers: {
          "User-Agent": navigator.userAgent
        },
        url: location.href
      };
    }

    function getPayload(err, extra) {
      return {
        event_id: generateUuid(),
        project: PROJECT_ID,
        platform: "javascript",
        logger: LOGGER_NAME,
        release: JS_VERSION,
        exception: getExceptionProp(err),
        request: getRequestProp(),
        extra: assign({
          original_stacktrace: err.stack
        }, // Special prop we created to send extra information when throwing an error.
        err[EXTRA_DATA_PROP], extra)
      };
    } // Attach data to an Error object so it will automatically be
    // sent to sentry as "additional data" when sending the error.
    // Use this function if you want to send information custom to one
    // specific error to sentry.

    function attachSentryDataToError(err, extraData) {
      err[EXTRA_DATA_PROP] = extraData;
    }

    /* eslint-disable no-console */
    var loggedErrors = [];
    /**
     * Logs the error argument to:
     *   - Skimlinks' Sentry API in production
     *   - the console otherwise
     *
     * This function should be called every time an error
     * is thrown somewhere within SkimJS.
     *
     * @param {Error} err
     * @param {boolean} ensureDelivery - bypass error sampling if true
     *   - false =>  one chance out of SAMPLING_RATE to send it. (default)
     *   - true => Always send the error (to be used with caution
     *    to not overload sentry)
     */

    function logError(err, ensureDelivery) {
      // outside the core init code (where the check is already made).


      if (!err || !supportsAllBrowserFeatures) {
        return;
      } // Always stash the error for debug purposes


      loggedErrors.push(err);

      try {
        sentryLogger.sendError(err, ensureDelivery);
      } catch (err_) {
        if (err_ === err) {
          // Fallback to the console when the logger isn't
          // configured properly, i.e. in a dev environment.
          console$1.error(err);
        } else {
          // The logger was properly configured but for some reasons
          // an error happened while trying to log the error to sentry.
          var error = new SentryLoggerError(); // Attach information about the initial error which happened in sentryLogger.sendError.

          attachSentryDataToError(error, {
            logger_error_message: err_.message,
            logger_error_stack: err_.stack,
            initial_error_message: err.message,
            intial_error_stack: err.stack
          }); // re-throw the error so it can be caught by potential catchAndLog wrapper.
          // (see how "logError(new PixelDropFailed(url))" is wrapped in a catchAndLog
          // in img.onerror callback inside createPixel.js)

          throw error;
        }
      }
    }

    /**
     * Wraps the function argument into a try/catch and calls.
     *
     * Note: Pre-bind the function argument if you
     *       need a different context.
     *
     * @param {Function} [fn]
     * @return {Function}
     */

    function catchAndLog(fn) {
      // catchAndLog is usually used for callback
      // arguments that can sometimes be optional.
      if (!isFunction(fn)) {
        return fn;
      }

      return function safeFn() {
        try {
          fn.apply(this, arguments);
        } catch (err) {
          logError(err);
        }
      };
    }

    function getBrowserInfo() {
      var ua = navigator.userAgent.toLowerCase();
      var match = /(webkit)[ /]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ /]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
      return {
        browser: match[1] || "",
        version: parseFloat(match[2]) || 0
      };
    }

    function once(fn) {
      var hasRun = false;
      var output;
      return function onceClosure() {
        if (hasRun) {
          return output;
        }

        output = fn.apply(this, arguments);
        hasRun = true;
        return output;
      };
    }

    var getTimezoneOffset = once(function () {
      var now = new Date();
      return now.getTimezoneOffset();
    });

    var skimlinks_context_window = window.skimlinks_context_window || null; // Change global window context to be a different global var.
    // One use case is this["top"] to point at the top level window
    // Always use the "WINDOW" object of this module instead of the global "window".

    var WINDOW = skimlinks_context_window ? window[skimlinks_context_window] : window;
    var DOCUMENT = WINDOW.document;
    /**
     * Historically, settings for the JS were located directly under the WINDOW object.
     * We don't want to spread this behaviour further and now recommend placing all those
     * page setting variables under WINDOW[SETTINGS_NAMESPACE] in the public documentation.
     */

    var SETTINGS_NAMESPACE = "skimlinks_settings";
    /**
     * Get the value of variable(s) stored in the global context.
     *
     * Because the value we expect to retrieve comes from the publisher, this value
     * could potentially be incorrectly set. For that reason, we can pass an
     * optional parsing function.
     *
     * For e.g. it can be used to cast a certain type or validate the publisher's value.
     *
     * @param {string|Array<string>} varName - Variable(s) to read from the global context
     * @param {*} [defaultValue]
     * @param {function} [parseFn]
     */

    var getContextVar = function getContextVar(varName, defaultValue, parseFn) {

      if (isArray(varName)) {
        return getContextVarMulti(varName, defaultValue, parseFn);
      }

      return getContextVarSimple(varName, defaultValue, parseFn);
    };
    /**
     * Return the value of the variable "varName" in the global context.
     *
     * @param {string} varName
     * @param {*} [defaultValue] - Value returned if the variable is undefined
     * @param {function} [parseFn]
     */

    var getContextVarSimple = function getContextVarSimple(varName, defaultValue, parseFn) {
      // Still falling back to WINDOW[varName] for legacy reasons
      var varValue = get(WINDOW, [SETTINGS_NAMESPACE, varName], WINDOW[varName]); // Check if the variable exists even if value is falsy.


      if (!isNil(varValue)) {
        if (isFunction(parseFn)) {
          return parseFn(varValue, defaultValue);
        }

        return varValue;
      }

      return defaultValue;
    };
    /**
     * Return the first variable found in the context based on the varNameList.
     *
     * @param {Array<string>} varNameList - List of variable name to read from the global context, ordered by priority.
     * @param {*} [defaultValue] - Value returned if all variables are undefined.
     * @param {function} [parseFn]
     */


    var getContextVarMulti = function getContextVarMulti(varNameList, defaultValue, parseFn) {
      if (varNameList === void 0) {
        varNameList = [];
      }

      for (var i = 0; i < varNameList.length; i++) {
        var value = getContextVarSimple(varNameList[i]);

        if (!isNil(value)) {
          if (isFunction(parseFn)) {
            return parseFn(value, defaultValue);
          }

          return value;
        }
      }

      return defaultValue;
    };

    function getItem(storageKey) {
      try {
        return JSON.parse(localStorage.getItem(storageKey));
      } catch (err) {
        return null;
      }
    }

    function setItem(storageKey, value) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch (err) {// Do nothing...
      }
    }

    var localStorage$1 = {
      getItem: getItem,
      setItem: setItem
    };

    /**
     * @param {*} value
     * @param {*} defaultValue
     * @returns {number}
     */

    function toBit(value) {
      var isZero = !value || value === "0" || value === "false";
      return isZero ? 0 : 1;
    }
    /**
     *
     * @param {*} value
     * @param {number} defaultValue
     * @returns {number}
     */

    function toNumber(value, defaultValue) {
      var number = parseFloat(value);

      if (isNaN(number)) {
        return defaultValue;
      }

      return number;
    }
    /**
     *
     * @param {*} value
     * @param {boolean} defaultValue
     * @returns {boolean}
     */

    function toBoolean(value, defaultValue) {
      if (!isBoolean(value)) {
        return defaultValue;
      }

      return value;
    }
    /**
     * This options is a bit of a mess as it can be a boolean or string. Boolean should be converted to string.
     * @param {Boolean|String} value  - The value on the page. (Can be a boolean or a string)
     * @param {Boolean} defaultValue - The value in the DB (Forced to boolean)
     * @return {String} - The google action name or empty string if we don't want to send google tracking.
     */

    function toGoogleActionName(value, defaultValue) {
      var booleanValueToActionName = function booleanValueToActionName(isTrackingOn) {
        return isTrackingOn ? "skimout" : "";
      };

      if (!value) {
        // No value on the page, defaultValue is always a boolean.
        return booleanValueToActionName(defaultValue);
      }

      if (isBoolean(value)) {
        return booleanValueToActionName(value);
      } // Value is not a boolean and will be used as the google tracking action name.


      return trim(value);
    }
    /**
     * Make sure the option is an array.
     * @param {*} value
     * @param {*} defaultValue
     */

    function toArray(value, defaultValue) {
      if (!isArray(value)) {
        return defaultValue;
      }

      return value;
    }

    var NO_SKIM = getContextVar("noskim", false);
    var NO_SKIMLINKS = getContextVar("noskimlinks", false);
    var NO_SKIMWORDS = getContextVar("noskimwords", true);
    var NO_UNLINKED = getContextVar("nounlinked", true);
    /* Skimwords flavours */
    // Normal skimwords turns merchant names, brands, product references and special keywords into links.

    var SW_STANDARD = getContextVar("skimwords_standard", false); // Use skimwords standard minus products reference words.

    var SW_LITE = getContextVar("skimwords_lite", false); // Use skimwords standard + DIY (custom list of words from the publisher) words.

    var SW_DIY = getContextVar("skimwords_diy", false); // Use skimwords DIY words only.

    var SW_DIY_FILTER = getContextVar("skimwords_diy_filter", false);
    var HAS_SKIMLINKS = !NO_SKIM && !NO_SKIMLINKS; // No skimwords can be overwritten by other SW variables... needs refactor on the db side.

    var HAS_SKIMWORDS = !NO_SKIM && !NO_SKIMWORDS;
    var HAS_UNLINKED = !NO_SKIM && !NO_UNLINKED; // Number used as a boolean

    var DO_NOT_TRACK = getContextVar("skimlinks_dnt", 0, toBit);
    var NO_COOKIE = getContextVar("skimlinks_nocookie", false);
    /**
     * Still supported but deprecated, publishers should use
     * CUSTOM_EXCLUDED_SELECTORS when possible
     */

    var SL_EXCLUDED_CLASSES = getContextVar("skimlinks_excluded_classes", []); // Array of CSS selectors to exclude links or entire html blocks.

    var CUSTOM_EXCLUDED_SELECTORS = getContextVar("custom_excluded_selectors", [], toArray); // Array of CSS selectors to include links or entire html blocks,
    // those selectors will be ignored

    var CUSTOM_INCLUDED_SELECTORS = getContextVar("custom_included_selectors", [], toArray);
    var SL_EXCLUDED_DOMAINS = getContextVar("skimlinks_exclude", ["profilepensions.co.uk", "hl.co.uk", "premium.telegraph.co.uk", "store.thetimes.co.uk", "thetimes.co.uk", "mailexperiences.co.uk", "mailcottages.co.uk", "mailshop.co.uk", "sundaytimeswineclub.co.uk", "store.nytimes.com", "nytstore.com", "offers.spectator.co.uk", "booking.com", "mcafee.com", "home.mcafee.com", "waggel.co.uk", "bank.marksandspencer.com", "argospetinsurance.co.uk", "money.asda.com", "sainsburysbank.co.uk", "tescobank.com", "morethan.com", "directline.com"]);
    var SL_INCLUDED_DOMAINS = getContextVar("skimlinks_include", []);
    var SL_IGNORE_HIDDEN_LINKS = getContextVar("skimlinks_ignore_hidden_links", false); // List of css selectors to exclude links contained in some part of the page from impression tracking.

    var SL_IMPRESSION_EXCLUDED_SELECTORS = getContextVar("skimlinks_link_impression_exclude_selector", []); // Options that allow us to support link customization through the rel attribute.

    var SL_ADD_NOFOLLOW = getContextVar("skimlinks_add_nofollow", false);
    var SL_CUSTOM_REL = getContextVar("skimlinks_custom_rel", ""); // Bind skimlinks click handler on 'mouseup' instead of 'click'

    var SL_BEFORE_CLICK_HANDLER = getContextVar("skimlinks_before_click_handler", false, toBoolean);
    var SL_FIRST_PARTY_NA = getContextVar("skimlinks_first_party_na", false);
    var SL_TRACK_IMPRESSION = !getContextVar("noimpressions", false);
    var WITH_NA_LINK_IMPRESSIONS = false;
    var SL_REPLACE_TIMEOUT = getContextVar("skimlinks_replace_timeout", 300, toNumber); // Use by skimwords to re-evaludate the page

    var SL_AFFILIATE_UNKNOWN_LINKS = getContextVar("skimlinks_affiliate_unknown_links", true);
    var SL_TARGET = getContextVar("skimlinks_target", null);
    var AJAX_SUPPORT = getContextVar("skimlinks_ajax_rerun", false);
    var UNLINKED_EXCLUDES = []; // DEPRECATED. TODO: Remove related code.
    // (xrf) Basically a skimlinks dry-run where we consider all affiliated links as n-a links.

    var SL_FORECAST = getContextVar("skimlinks_revenue_forecast", false);
    var NO_RIGHT_CLICK = getContextVar("skimlinks_noright", false);
    /*
     When getting links href take into consideration that some engines have
     already rewritten merchant urls into http://jump.com?url=merchant.com
     We maintain some rules to extract them
    */

    var USE_MERCHANT_URL_EXTRACTION_RULES = getContextVar("skimlinks_url_extraction_rules", false) || false; // A list of extra url params that will be added to the query string for waypoint redirect

    var EXTRA_REDIR_PARAMS = getContextVar("skimlinks_extra_redir_params", []).join("&"); // We need to check 2 global variables
    // (This is XCUST param value)

    var CUSTOM_TRACKING_VAR = getContextVar(["affiliate_tracking", "skimlinks_tracking"], false);
    var FORCE_LOCATION = getContextVar("force_location"); // Used mostly for wordpress

    var SITE_NAME = getContextVar(["skimlinks_site", "skimlinks_sitename"], false);
    var CUSTOM_WAYPOINT_DOMAIN = getContextVar("skimlinks_domain", ""); // String representing the google tracking action name. Empty string means not tracking.
    // Note: In the db and on the page 'skimlinks_google' can be a boolean or a string. See toGoogleActionName for more details.

    var GOOGLE_TRACKING_ACTION_NAME = getContextVar("skimlinks_google", false, toGoogleActionName);
    var NO_SKIM_DOMAINS = getContextVar("noskim_domains", []);
    var SW_HORIZONTAL_DISTANCE = getContextVar("skimwords_horizontal_distance", 80);
    var SW_VERTICAL_DISTANCE = getContextVar("skimwords_vertical_distance", 80);
    var SL_PROFILING = false; // getContextVar("skimlinks_profiling", false)

    var TRACK_COOKIE_SYNCS = false; // LINK STYLES OPTIONS

    var SW_LINK_COLOR = getContextVar("skimwords_color", null);
    var SW_LINK_WEIGHT = getContextVar("skimwords_weight", null);
    var SW_LINK_DECORATION = getContextVar("skimwords_decoration", null);
    var SW_LINK_STYLE = getContextVar("skimwords_style", null);
    var SW_LINK_TITLE = getContextVar("skimwords_title", null); // Some publishers like the telegraph are deactivating skim-js on some pages based on if some elements are on the page or not.
    // If the page contains at least one element matching the selector, skimwords, unlinked, skimlinks will be disabled.

    var NO_SKIM_SELECTOR = getContextVar("no_skim_selector", "");
    var SL_CONSENT = false; // Only used by optout.skimlinks.com to be able to display a preview of our consent.

    var FORCE_CONSENT = getContextVar("skimlinks_force_consent", false);
    var M101_TRACKING_ID = null;
    var M101_CUSTOM_DOM_DETECTION = false;
    var AE_CLICK_TRACKING = false;
    var INCENTIVE_ENABLED = false; // Force monetizing clicks that have another click handler calling .preventDefault()

    var FORCE_PREVENTED_CLICKS_MONETIZATION = true; // Special option for publishers that want to have the smallest bundle as possible by
    // removing some secondary functionalities.

    var IS_MINIMALISTIC_JS = false;
    var LINK_SWAPPING_404 = false && getContextVar("link_swapping_404", true);
    var LINK_SWAPPING_OUT_OF_STOCK = false && getContextVar("link_swapping_out_of_stock", true);
    var LINK_SWAPPING_PRODUCT_MATCH = false && getContextVar("link_swapping_product_match", true);
    var LINK_SWAPPING = ( LINK_SWAPPING_PRODUCT_MATCH) && getContextVar("link_swapping", true); // When true, prevents swapping the link if the original merchant name is detected on the page.

    var LINK_SWAPPING_MERCHANT_NAME_DETECTION = true; // Enabled taboola tracking as a JavaScript setting

    var HAS_TABOOLA_TRACKING = false && getContextVar("taboola_tracking", false); // Enabled taboola widget as a JavaScript setting

    var IS_TABOOLA_WIDGET_ENABLED = getContextVar("taboola_bo_active", true, toBoolean); // Enabled beacon retry as a JavaScript setting - contains timer to retrigger request

    var BEACON_RETRY_TIMER = -1;

    var skimOptions = ({
        SW_STANDARD: SW_STANDARD,
        SW_LITE: SW_LITE,
        SW_DIY: SW_DIY,
        SW_DIY_FILTER: SW_DIY_FILTER,
        HAS_SKIMLINKS: HAS_SKIMLINKS,
        HAS_SKIMWORDS: HAS_SKIMWORDS,
        HAS_UNLINKED: HAS_UNLINKED,
        DO_NOT_TRACK: DO_NOT_TRACK,
        NO_COOKIE: NO_COOKIE,
        SL_EXCLUDED_CLASSES: SL_EXCLUDED_CLASSES,
        CUSTOM_EXCLUDED_SELECTORS: CUSTOM_EXCLUDED_SELECTORS,
        CUSTOM_INCLUDED_SELECTORS: CUSTOM_INCLUDED_SELECTORS,
        SL_EXCLUDED_DOMAINS: SL_EXCLUDED_DOMAINS,
        SL_INCLUDED_DOMAINS: SL_INCLUDED_DOMAINS,
        SL_IGNORE_HIDDEN_LINKS: SL_IGNORE_HIDDEN_LINKS,
        SL_IMPRESSION_EXCLUDED_SELECTORS: SL_IMPRESSION_EXCLUDED_SELECTORS,
        SL_ADD_NOFOLLOW: SL_ADD_NOFOLLOW,
        SL_CUSTOM_REL: SL_CUSTOM_REL,
        SL_BEFORE_CLICK_HANDLER: SL_BEFORE_CLICK_HANDLER,
        SL_FIRST_PARTY_NA: SL_FIRST_PARTY_NA,
        SL_TRACK_IMPRESSION: SL_TRACK_IMPRESSION,
        WITH_NA_LINK_IMPRESSIONS: WITH_NA_LINK_IMPRESSIONS,
        SL_REPLACE_TIMEOUT: SL_REPLACE_TIMEOUT,
        SL_AFFILIATE_UNKNOWN_LINKS: SL_AFFILIATE_UNKNOWN_LINKS,
        SL_TARGET: SL_TARGET,
        AJAX_SUPPORT: AJAX_SUPPORT,
        UNLINKED_EXCLUDES: UNLINKED_EXCLUDES,
        SL_FORECAST: SL_FORECAST,
        NO_RIGHT_CLICK: NO_RIGHT_CLICK,
        USE_MERCHANT_URL_EXTRACTION_RULES: USE_MERCHANT_URL_EXTRACTION_RULES,
        EXTRA_REDIR_PARAMS: EXTRA_REDIR_PARAMS,
        CUSTOM_TRACKING_VAR: CUSTOM_TRACKING_VAR,
        FORCE_LOCATION: FORCE_LOCATION,
        SITE_NAME: SITE_NAME,
        CUSTOM_WAYPOINT_DOMAIN: CUSTOM_WAYPOINT_DOMAIN,
        GOOGLE_TRACKING_ACTION_NAME: GOOGLE_TRACKING_ACTION_NAME,
        NO_SKIM_DOMAINS: NO_SKIM_DOMAINS,
        SW_HORIZONTAL_DISTANCE: SW_HORIZONTAL_DISTANCE,
        SW_VERTICAL_DISTANCE: SW_VERTICAL_DISTANCE,
        SL_PROFILING: SL_PROFILING,
        TRACK_COOKIE_SYNCS: TRACK_COOKIE_SYNCS,
        SW_LINK_COLOR: SW_LINK_COLOR,
        SW_LINK_WEIGHT: SW_LINK_WEIGHT,
        SW_LINK_DECORATION: SW_LINK_DECORATION,
        SW_LINK_STYLE: SW_LINK_STYLE,
        SW_LINK_TITLE: SW_LINK_TITLE,
        NO_SKIM_SELECTOR: NO_SKIM_SELECTOR,
        SL_CONSENT: SL_CONSENT,
        FORCE_CONSENT: FORCE_CONSENT,
        M101_TRACKING_ID: M101_TRACKING_ID,
        M101_CUSTOM_DOM_DETECTION: M101_CUSTOM_DOM_DETECTION,
        AE_CLICK_TRACKING: AE_CLICK_TRACKING,
        INCENTIVE_ENABLED: INCENTIVE_ENABLED,
        FORCE_PREVENTED_CLICKS_MONETIZATION: FORCE_PREVENTED_CLICKS_MONETIZATION,
        IS_MINIMALISTIC_JS: IS_MINIMALISTIC_JS,
        LINK_SWAPPING_404: LINK_SWAPPING_404,
        LINK_SWAPPING_OUT_OF_STOCK: LINK_SWAPPING_OUT_OF_STOCK,
        LINK_SWAPPING_PRODUCT_MATCH: LINK_SWAPPING_PRODUCT_MATCH,
        LINK_SWAPPING: LINK_SWAPPING,
        LINK_SWAPPING_MERCHANT_NAME_DETECTION: LINK_SWAPPING_MERCHANT_NAME_DETECTION,
        HAS_TABOOLA_TRACKING: HAS_TABOOLA_TRACKING,
        IS_TABOOLA_WIDGET_ENABLED: IS_TABOOLA_WIDGET_ENABLED,
        BEACON_RETRY_TIMER: BEACON_RETRY_TIMER
    });

    function initSkimlinksState() {
      var htmlRoot = document.getElementsByTagName("html") ? document.getElementsByTagName("html")[0] : null; // getDomainFromUrl second argument to false because we can not guarantee that the publisher will set a protocol when
      // using FORCE_LOCATION skimOption.

      var hostname = FORCE_LOCATION ? getDomainFromUrl(FORCE_LOCATION, false) : WINDOW.location.hostname;
      return {
        aff_domains: {},
        beacon: [],
        domain_data: {
          domains: []
        },
        exclude: SL_EXCLUDED_DOMAINS,
        exclude_lookup: null,
        excluded_classes: ["noskimlinks", "noskim"].concat(SL_EXCLUDED_CLASSES),
        has_been_called: false,
        hostname: hostname,
        html_root: htmlRoot,
        include: SL_INCLUDED_DOMAINS,
        include_lookup: null,
        links: [],
        links_tracked: false,
        target: null,
        // !!! Custom domains (CNAME) don't support HTTPS !!!
        // They point to Waypoint whose SSL cert is setup for *.skimresources.com and *.goredirectingat.com only
        waypointDomain: CUSTOM_WAYPOINT_DOMAIN ? "http://" + CUSTOM_WAYPOINT_DOMAIN : "https://" + WAYPOINT_DOMAIN
      };
    }

    function initSkimwordsState() {
      {
        return {};
      }

      return {
        branded_merchant: false,
        branded_merchant_url: false,
        data: undefined,
        // becomes an object, initialized after an AJAX call
        debug: 0,
        force_country: false,
        force_domain_check: false,
        force_tree: false,
        handler_attached_hook: false,
        handlers: 0,
        hover_name: "dark",
        link_all: false,
        lite: false,
        maxproducts: 3,
        merchant_excludes: false,
        merchant_includes: false,
        no_limit: false,
        noVisual: false,
        original_request: undefined,
        prio_threshold: 0,
        request_counter: 0,
        settings: null,
        send_in_progress: false,
        x_min_visual_distance: 80,
        y_min_visual_distance: 80
      };
    }

    function initCommonState() {
      var referrer = DOCUMENT.referrer || document.referrer || "";
      var pageLocation = removeJunkQueryParamsFromUrl(FORCE_LOCATION || WINDOW.location.href);
      return {
        // read from beacon
        cookieSyncString: "",
        lastBeaconTimestamp: null,
        cookie: "",
        country: "",
        locale: "",
        consent: localStorage$1.getItem(CONSENT_STORAGE_KEY),
        detect: getBrowserInfo(),
        isAdblockUser: false,
        pageLocation: pageLocation,
        referrer: referrer,
        timezone: getTimezoneOffset(),
        uuid: generateUuid(),
        skimwordsEnabled: HAS_SKIMWORDS,
        skimlinksEnabled: HAS_SKIMLINKS,
        unlinkedEnabled: HAS_UNLINKED
      };
    }


    var commonState = initCommonState();
    var skimlinksState = initSkimlinksState();
    var skimwordsState = initSkimwordsState();
    /**
     * Mutate the common state from a unique function
     * so it's easier to trace who is updating the state.
     * @param {object} newPartialState
     */

    function mutateCommonData(newPartialState) {
      assign(commonState, newPartialState);
    }

    // TODO: http://caniuse.com/#search=getAttribute both getAttribute and setAttribute
    // are supported IE6+
    function attr(a, name, val) {
      if (arguments.length >= 3) {
        if (typeof a.setAttribute !== "undefined") {
          a.setAttribute(name, val);
        } else {
          a[name] = val;
        }
      }

      try {
        var ret = a[name];

        if (!ret) {
          ret = a.getAttribute(name);
        }

        return ret;
      } catch (err) {
        return null;
      }
    }

    /**
     * Checks if an object is of type String.
     *
     * @param {string} str
     * @returns {boolean}
     */
    function isString(str) {
      return typeof str === "string";
    }

    /**
     * @param {Function} fn
     * @param {number} delay
     */

    function setTimeout$1(fn, delay) {
      var fnArgs = Array.prototype.slice.call(arguments, 2);
      var safeFn = catchAndLog(fn);
      return window.setTimeout.apply(window, [safeFn, delay].concat(fnArgs));
    }

    function setHref(a, newUrl) {
      var initialLinkText = null;
      var isLinkWithText = a.childNodes.length && a.childNodes[0].nodeType === 3; // IE <= 8 as an interesting issue where in certain scenarios updating the href will also update the
      // inner html... https://stackoverflow.com/questions/12391144/setting-href-attribute-in-ie-without-changing-link-appearance-without-setting-in

      if (commonState.detect.browser === "msie" && isLinkWithText) {
        initialLinkText = a.innerHTML;
      }

      if (typeof a.href === "object") {
        // SVG link href conforms to an object with two property values, baseVal and animVal
        a.href.baseVal = newUrl;
        a.href.animVal = newUrl;
      } else {
        a.href = newUrl;
      } // Reverting link inner html to previous value because of IE issue mentioned above.


      if (initialLinkText && initialLinkText !== a.innerHTML) {
        a.innerHTML = initialLinkText;
      }
    }

    function scheduleHrefRestoration(anchor, restoreDelay) {
      restoreDelay = restoreDelay || SL_REPLACE_TIMEOUT;

      var restoreFunc = function restoreFunc() {
        if (typeof anchor.skimlinksOriginalHref === "object") {
          // SVG link href conforms to an object with two property values, baseVal and animVal
          anchor.href.baseVal = anchor.skimlinksOriginalHref.baseVal;
          anchor.href.animVal = anchor.skimlinksOriginalHref.animVal;
        } else {
          anchor.href = anchor.skimlinksOriginalHref;
        }

        delete anchor.skimlinksOriginalHostname;
        delete anchor.skimlinksOriginalHref;
        delete anchor.skimlinksRestoreSwappedLink;
      };

      var hrefRestorationTimeout = setTimeout$1(restoreFunc, restoreDelay); // Store reference to original properties

      anchor.skimlinksOriginalHostname = anchor.hostname;

      if (typeof anchor.href === "object") {
        // SVG link href conforms to an object with two property values, baseVal and animVal
        anchor.skimlinksOriginalHref = {
          animVal: anchor.href.animVal,
          baseVal: anchor.href.baseVal
        };
      } else {
        anchor.skimlinksOriginalHref = anchor.href;
      } // anchorClickInterceptorService may need to restore the original link
      // because of "touchstart" & "click" events conflict on mobile.


      anchor.skimlinksRestoreSwappedLink = function () {
        clearTimeout(hrefRestorationTimeout);
        restoreFunc();
      };
    }

    function swapHrefTemporarily(a, newUrl, restoreDelay) {
      if (!a) {
        return;
      } // Avoid scheduling multiple timeouts


      if (!isHrefBeingSwapped(a)) {
        scheduleHrefRestoration(a, restoreDelay);
      }

      setHref(a, newUrl);
    }
    function isHrefBeingSwapped(anchor) {
      return isString(anchor.skimlinksOriginalHref);
    }

    var _try_n_times;
    /**
     * Makes sure the xguid in the pre-affiliated URL matches the one of the user.
     *
     * @param {Element} a
     * @return {string}
     */

    function fixPreAffiliatedWaypointUrl(a) {
      var newUrl = stripXguid(a.href); // Inject additional query parameters whenever Taboola widget is on

      if (IS_TABOOLA_WIDGET_ENABLED) {
        var creative = attr(a, "data-skim-creative"); // Replace XCREO to allow us to inject the URL

        if (creative) {
          extendedUrl = new URL(newUrl);
          extendedUrl.searchParams.append('xcreo', creative);
          newUrl = extendedUrl.toString();
        }
      }

      if (newUrl !== a.href) {
        swapHrefTemporarily(a, newUrl);
      }

      return newUrl;
    }
    /**
     * TODO:
     * - Merge two regex in one
     * - fix when xguid is first param.
     * - Allow new guid of 16 chars? (TBC)
     */

    function stripXguid(url) {
      // strip potential pre-existing xguid
      if (commonState.cookie) {
        return url.replace(/([&?])xguid=([a-fA-F0-9]{32})/, "$1xguid=" + commonState.cookie);
      } // Looks like this is not working properly when xguid is the first param:
      // - http://go.redirectingat.com/test?xguid=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&hello=world"
      // => http://go.redirectingat.com/test&hello=world"
      // Should be http://go.redirectingat.com/test?hello=world"


      return url.replace(/([&?]xguid=[a-fA-F0-9]{32})/, "");
    }

    _try_n_times = function try_n_times(func, limit, default_retval) {
      if (limit === 0) {
        return default_retval;
      }

      try {
        return func();
      } catch (error) {
        return _try_n_times(func, limit - 1, default_retval);
      }
    };

    get_real_link = function get_real_link(element) {
      if (element == null) {
        return null;
      }

      while (element.nodeName.toUpperCase() !== "A") {
        element = _try_n_times(function () {
          return element.parentNode;
        }, 3, null);

        if (element == null) {
          return null;
        }
      }

      return element;
    }; // There for some publisher's demand. Tamas asked not to remove it.


    function strip_attributes(a) {
      var current_value, key, new_value, strip_attribute_obj, to_remove;
      strip_attribute_obj = getContextVar("skimlinks_strip_attribute", false);

      if (!strip_attribute_obj) {
        return false;
      }

      for (key in strip_attribute_obj) {
        if (!hasOwnProperty(strip_attribute_obj, key)) {
          continue;
        }

        to_remove = strip_attribute_obj[key];
        current_value = attr(a, key);

        if (current_value && current_value.indexOf(to_remove) === 0) {
          new_value = current_value.substr(to_remove.length);
          attr(a, key, new_value);
        }
      }

      return true;
    }

    /**
     * @param {Element} node
     * @return {void}
     */
    function hideElement(node) {
      node.width = 0;
      node.height = 0;
      node.style.display = "none";
    }

    /**
     * Safer method of retrieving the document's body in
     * case a publisher has multiple body tags on his page...
     *
     * Warning: quite slower than just accessing `document.body`
     * cf. https://jsperf.com/document-body-vs-document-getelementsbytagname-body-0
     *
     * @param {Element} [doc]
     * @return {Element}
     */

    function getBody(doc) {
      doc = doc || document;
      var body = doc.body || doc.getElementsByTagName("body")[0];

      if (!body) {
        throw new DocumentBodyNotFound();
      }

      return body;
    }

    /** @type {Element} */

    var iframe;
    /**
     * Create a 1x1px IMG tag and injects it inside a "singleton" iframe.
     *
     * @param {string} url
     * @param {function} [onSuccess]
     * @param {function} [onError]
     * @return {void}
     */

    function createPixel(url, onSuccess, onError) {
      if (!iframe) {
        // Creating content inside this iframe will protect the referred header.
        // Important: px has to be created with iframe document, not website document.
        iframe = document.createElement("iframe");
        iframe.id = "skimlinks-pixels-iframe";

        try {
          getBody().appendChild(iframe);
        } catch (err) {
          if (err instanceof DocumentBodyNotFound) {
            // The page has no body, just drop the iframe at the top of the document.
            document.documentElement.appendChild(iframe);
          }
        }

        hideElement(iframe);
      } // Accessing content document via window is for older IE (below 8)


      var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      var iframeBody = getBody(iframeDocument); // IE8/9 doesn't create a body inside the iframe
      // https://stackoverflow.com/a/15169369

      if (!iframeBody) {
        iframeBody = document.createElement("body");
        iframeDocument.appendChild(iframeBody);
      }

      var img = iframeDocument.createElement("img");
      img.src = url;
      img.width = 1;
      img.height = 1;

      if (isFunction(onSuccess)) {
        img.onload = catchAndLog(onSuccess);
      }

      if (isFunction(onError)) {
        img.onerror = catchAndLog(onError);
      }

      iframeBody.appendChild(img);
    }

    function getDoNotTrackFlags() {
      var doNotTrackFlags = {};

      if (DO_NOT_TRACK) {
        doNotTrackFlags.dnt = DO_NOT_TRACK;
      }

      if (NO_COOKIE) {
        doNotTrackFlags.fdnt = 1;
      }

      return doNotTrackFlags;
    }

    var requests = {
      get: function get(url, queryParams, callback, options) {
        var finalOptions = assign({
          onError: logError
        }, options, {
          method: "GET"
        });

        sendXhrRequest(url, queryParams, catchAndLog(callback), finalOptions);
      },
      post: function post(url, queryParams, callback, options) {
        var finalOptions = assign({
          onError: logError
        }, options, {
          method: "POST"
        });

        sendXhrRequest(url, queryParams, catchAndLog(callback), finalOptions);
      }
    };

    /**
     * Send a request to the tracking API.
     * @param {string} endpoint - Name of the API endpoint (e.g: "/page")
     * @param {object} data - Post request data
     * @param {object} queryParams - query string params
     * @param {object} options
     *  {
     *    // usePixel will use a GET request if navigator.sendBeacon not available
     *    // WARNING: make sure your endpoint supports GET ("/generic_tracking/..." doesn't)
     *    usePixel: true/false,
     *    useSendBeacon: true/false
     *    callback: callbackFunction
     *  }
     */

    function sendTrackingRequest(endpoint, data, queryParams, options) {
      var trackingOptions = options || {};
      var usePixel = trackingOptions.usePixel || false;
      var useSendBeacon = trackingOptions.useSendBeacon || false;

      var callback = trackingOptions.callback || function () {};

      var trackingQueryParams = assign({// Uncomment the following line to ask for tracking API response.
        // test: true,
      }, queryParams, getDoNotTrackFlags());

      if (useSendBeacon) {
        // Note: Be careful when using navigator.sendBeacon
        // We have tried to use navigator.sendBeacon in production
        // but this resulted in a big drop of tracking requests.
        // Even though the browser support is supposed to be good on iOS devices,
        // we have measure that ~34% of the requests sent from an iOS device
        // were missing when using sendBeacon. It seems that there is an issue
        // for chrome/safari and webviews on ios. At the time of writing
        // Safari 13.0 seems to have been fixed, chrome 75.0 on iOS still has the issue.
        // Note Update: As a potential fix, we are sending a __skimjs_preflight__please_ignore__ request
        // as soon as possible (see skimcore.js) but sendBeacon method should not be used
        // for critical tracking data (page/link impressions, na-click) for now. Use the pixel method
        // for critical data.
        sendTrackingWithSendBeacon(endpoint, data, trackingQueryParams, callback);
      } else if (usePixel) {
        // WARNING: usePixel this should only be true if your request supports GET method.
        sendTrackingWithPixel(endpoint, data, trackingQueryParams, callback);
      } else {
        sendTrackingWithXHR(endpoint, data, trackingQueryParams, callback);
      }
    }
    /**
     * navigator.sendBeacon sends the request in an asynchronous way, in the background,
     * even if the browser has already navigated away from the page.
     * PROS:
     *  - Request will not be canceled.
     *  - Recommended way to send analytics request in modern browsers.
     * CONS:
     *  - Doesn't support all browsers and therefore needs fallback.
     *  - There is no way to check if the request as completed or failed
     *  since the browser handle the request in the background.
     *  - DOESN'T WORK properly on iOS
     */

    function sendTrackingWithSendBeacon(endpoint, data, trackingQueryParams, callback) {
      var jsonData = JSON.stringify(data); // navigator.sendBeacon is not available for some browser
      // (IE all versions, Edge < 14, Safari < 11.1)
      // https://caniuse.com/#feat=beacon

      if (navigator.sendBeacon) {
        var url = getTrackingUrl(endpoint, trackingQueryParams);
        var hasBeenQueued = navigator.sendBeacon(url, jsonData); // navigator.sendBeacon sends the request in an async way.
        // navigator.sendBeacon tells us if the request will be sent or not.
        // false seems to happen more than we thought for unknown reasons.
        // More info: https://www.w3.org/TR/beacon/#sec-sendBeacon-method

        if (hasBeenQueued) {
          // sendBeacon doesn't have any callback but it guarantees the delivery
          // of the request, even if the browser has navigated away.
          callback && callback();
          return true;
        } // else => request not queued for unknown reasons, will try to send through fallback .

      }

      return false;
    }
    /**
     * This method is some kind of polyfill for the navigator.sendBeacon. By inserting
     * a pixel in the page, the browser will wait for the resource to load before navigating away.
     * PROS:
     *  - Request will not be canceled
     * CONS:
     *  - Only supports GET method. Your endpoint needs to support GET.
     *  - It's a hack.
     */


    function sendTrackingWithPixel(endpoint, data, trackingQueryParams, callback) {
      var queryParams = assign({}, trackingQueryParams); // Send equivalent of sendBeacon through GET request.


      queryParams.rnd = Math.random();

      if (data) {
        queryParams.data = JSON.stringify(data);
      }

      createPixel(getTrackingUrl(endpoint, queryParams), callback, callback);
    }
    /**
     * Send tracking through a regular ajax request.
     * PROS:
     *  - Best browser support, allows POST requests.
     * CONS:
     *  - Request can be canceled. If the browser is navigating
     *    away and the request is not sent on time, the request could be canceled
     *    before it reaches the API.
     */

    function sendTrackingWithXHR(endpoint, data, trackingQueryParams, callback) {
      var jsonData = JSON.stringify(data); // Normal XHR request fallback

      requests.post(getTrackingUrl(endpoint, trackingQueryParams), {}, callback, {
        headers: {
          "Content-type": "text/plain"
        },
        data: jsonData,
        // Allow to read/set cookies from tracking api
        withCredentials: true
      });
    }
    /**
     * Build the final absolute URL
     * @param {string} endpoint - Relative endpoint path (e.g "/page")
     * @param {object} queryParams - query string parameters.
     */


    function getTrackingUrl(endpoint, queryParams) {
      var queryString = buildQueryString(queryParams);
      var url = "" + TRACKING_API_URL + endpoint;

      if (queryString) {
        return url + "?" + queryString;
      }

      return url;
    }
    /**
     * Send the same request in two different way.
     * The goal is too evaluate if in some environment,
     * one method is more reliable than others.
     */


    function runTrackingMethodExperiment() {
      // Abort experiment on IE11
      if (!navigator.sendBeacon) {
        return;
      }

      var SAMPLING_RATE = 10000; // i.e. one in $SAMPLING_RATE errors logged
      // Basic sampling to avoid hammering the tracking API.

      var diceRoll = SAMPLING_RATE * Math.random();
      var diceSayYes = diceRoll < 1;

      if (!diceSayYes) {
        return;
      }

      var runExperiment = function runExperiment() {
        var genericInfo = {
          domain_id: DOMAIN_ID,
          publisher_id: PUBLISHER_ID,
          page_url: WINDOW.location.href,
          impression_id: commonState.uuid,
          jv: JS_VERSION
        };
        var endpoint = "/generic_tracking/trackingMethodExperiment"; // First send with sendBeacon method.
        // Note: Without the "__skimjs_preflight__please_ignore__" request made in startSkimcore
        // sendBeacon would miss a lot of requests on some versions of Safari.

        var sendBeaconSuccess = sendTrackingWithSendBeacon(endpoint, assign({
          trackingMethod: "sendBeacon"
        }, genericInfo)); // Then send with XHR method

        sendTrackingWithXHR(endpoint, assign({
          trackingMethod: "xhr"
        }, genericInfo)); // Special case if the sendBeacon request fail
        // so we can see in the data how many requests
        // are missing even though sendBeacon succeeded.

        if (!sendBeaconSuccess) {
          sendTrackingWithXHR(endpoint, assign({
            trackingMethod: "sendBeaconFailed"
          }, genericInfo));
        }
      };

      runExperiment();
    }

    function trackNonAffiliatedClick(a) {
      var url = a.href;
      var data = {
        publisher_id: PUBLISHER_ID,
        publisher_domain_id: DOMAIN_ID,
        referrer: WINDOW.location.toString(),
        pref: commonState.referrer,
        // Default value of site_name is false we want to make it as a string
        site: "" + SITE_NAME,
        url: url,
        custom: attr(a, "data-skimlinks-tracking") || CUSTOM_TRACKING_VAR || "",
        xtz: commonState.timezone,
        uuid: commonState.uuid,
        product: "1"
      };

      if (SL_FORECAST) {
        data.xrf = 1;
      }

      sendTrackingRequest("/naclicks", data, null, {
        usePixel: true
      });
    }

    /**
     * Simple check to assess the validity of the href attribute of a DOM node.
     *
     * @param {string} href
     * @return {Boolean}
     */
    function isValidHref(href) {
      if (!href) {
        return false;
      }

      return /^https?:\/\//.test(href) || /^\/\//.test(href);
    }

    /**
     * Checks whether a DOM node is rendered or not.
     *
     * @param {Element} el
     * @return {Boolean}
     */

    function isHidden(el) {
      // display: none;
      if (el.offsetParent === null) {
        return true;
      } // visibility: hidden;


      var getComputedStyle = WINDOW.getComputedStyle;

      if (isFunction(getComputedStyle)) {
        return getComputedStyle(el).visibility === "hidden";
      }

      return false;
    }

    function includes(obj, value) {
      if (!isFunction(obj.indexOf)) {
        return false;
      }

      return obj.indexOf(value) > -1;
    }

    /**
     * Function to determine if given domain is one of the waypoint domain.
     * Tests are sorted from most used to least for performance reasons.
     *
     * @param domain - The domain to look up
     *
     * TODO: We should probably check startWith() instead of includes().
     */

    function isWaypointDomain(domain) {
      // The tested domain usually comes with its version without "www.",
      // so we need to compare the customWaypointDomain without www. in case it
      // has it.
      var customWaypointDomain = stripWww(CUSTOM_WAYPOINT_DOMAIN);
      return includes(domain, WAYPOINT_DOMAIN) || includes(domain, WAYPOINT_LEGACY_DOMAIN) || Boolean(customWaypointDomain) && includes(domain, customWaypointDomain);
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function _inheritsLoose(subClass, superClass) {
      subClass.prototype = Object.create(superClass.prototype);
      subClass.prototype.constructor = subClass;
      subClass.__proto__ = superClass;
    }

    /**
     *
     * Returns true if element matches selector.
     *
     * Polyfills of Element.closest() and Element.matches() as modules.
     * Inspired from https://github.com/jonathantneal/closest/blob/master/element-closest.js
     *
     * @param {HTMLElement} node
     * @param {string} cssSelector
     * @return {boolean}
     */

    function matchSelector(el, selector) {
      if (!el) {
        throw new Error("[matchSelector] First argument needs to be an html element.");
      }

      var elementProto = window.Element.prototype;
      var matchesFn = elementProto.matches || elementProto.msMatchesSelector || elementProto.mozMatchesSelector || elementProto.webkitMatchesSelector;

      if (isFunction(matchesFn)) {
        // Could fail because node is not an "Element" (TextNode for example)
        try {
          return matchesFn.call(el, selector);
        } catch (err) {
          return false;
        }
      }

      var doc = el.document || el.ownerDocument;
      var elements = doc.querySelectorAll(selector);
      var index = 0;

      while (elements[index] && elements[index] !== el) {
        index += 1;
      }

      return Boolean(elements[index]);
    }

    /**
     * Returns true if one of the selectors matches
     * the node itself or a parent of the node.
     *
     * Note: selectors = [".taboola", "a.no-skimimpression"]
     * will call matchSelector(..) with
     * => ".taboola *,a.no-skimimpression *, ".taboola", "a.no-skimimpression")
     *
     * @param {Node} node
     * @param {Array<string>} selectors
     */

    function nodeOrParentIsMatchingAnySelectors(node, selectors) {
      var el = findClosestElement(node);

      if (!el || !isArray(selectors) || selectors.length === 0) {
        return false;
      } // Create new selectors selecting anything inside a container
      // matching the initial selector.


      var containerSelectors = selectors.map(function (selector) {
        return selector + " *";
      });
      var superSelector = containerSelectors.concat(selectors).join(",");
      return matchSelector(el, superSelector);
    }
    /**
     * MatchSelector only supports Element.
     * if node is a TextNode, we will run matchSelector
     * on it's closest parent of type "Element".
     * @param {Node} node
     * @return {Element}
     */

    function findClosestElement(node) {
      var el = node;

      while (el && el.nodeType !== Node.ELEMENT_NODE) {
        el = el.parentNode;
      }

      return el;
    }

    function find(array, testFn) {
      for (var i = 0; i < array.length; i++) {
        if (testFn(array[i])) {
          return array[i];
        }
      }

      return undefined;
    }

    /** NOTE:
     * This code was copied from https://github.com/lodash/lodash/blob/master/memoize.js
     * which correspond to version 5.x.x. As 5.x.x is not released yet and that memoize version 4.x.x
     * comes with a lot more code, we are copying this here.
     *
     * TODO: This util should simply export lodash/memoize once version 5.x.x is available.
     */

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * const object = { 'a': 1, 'b': 2 }
     * const other = { 'c': 3, 'd': 4 }
     *
     * const values = memoize(values)
     * values(object)
     * // => [1, 2]
     *
     * values(other)
     * // => [3, 4]
     *
     * object.a = 2
     * values(object)
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b'])
     * values(object)
     * // => ['a', 'b']
     *
     * // Replace `memoize.Cache`.
     * memoize.Cache = WeakMap
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
        throw new TypeError('Expected a function');
      }

      if (!memoize.Cache) {
        // (IE <11) Do not memoize
        return func;
      }

      var memoized = function memoized() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var key = resolver ? resolver.apply(this, args) : args[0];
        var cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }

        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };

      memoized.cache = new memoize.Cache();
      return memoized;
    }

    if (typeof window.Map !== "undefined") {
      memoize.Cache = Map;
    }

    var DEFAULT_EXCLUDED_RELS = ["noskim", "norewrite"]; // Prevent skim-js from affiliating Taboola links by excluding
    // their ads containers completely.

    var TABOOLA_EXCLUDED_CLASSES = ["taboola", "advert--taboola", "trc_rbox", "trc_related_container"];
    var DEFAULT_EXCLUDED_CLASSES = ["noskimlinks", "noskim"].concat(TABOOLA_EXCLUDED_CLASSES);
    var DEFAULT_EXCLUDED_DOMAINS = ["*.criteo.com", "*.g.doubleclick.net", "*mjxads.internet.com", "*overture.com", "*pgpartner.co.uk", "*pgpartner.com", "*pricegrabber.co.uk", "*pricegrabber.com", "*youtube.com", "m.skimresources.com", "paid.outbrain.com", "track.celtra.com", "traffic.outbrain.com", "trc.taboola.com", "zergnet.com", "ad.doubleclick.net"];
    var ITUNES_URLS = ["itunes.apple.com", "itunes.com", "phobos.apple.com"];

    /**
     * This module uses memoized getters which could in theory be replaced
     * by new constants (calculated through IIFEs for example) since the "sub constants" the getters are using
     * never change after the script has initialised. However, if we do that,
     * stubbing the "sub constants" while testing the code would have no effect
     * since the new constants would have already been calculated when importing the module.
     * Using memoized getters function instead makes the code easier to test.
    */

    /**
     * Get the final list of all excluded domains including:
     * - default excluded domain
     * - custom publisher exclusion
     * - Site name if option is used.
     */

    var getExcludedDomains = memoize(function () {
      var excludedDomains = [].concat(SL_EXCLUDED_DOMAINS, DEFAULT_EXCLUDED_DOMAINS);

      if (SITE_NAME) {
        excludedDomains.push(SITE_NAME);
      }

      return excludedDomains;
    });
    /**
     * Build a list of selectors selecting excluded classes.
     * @return {Array<string>} - List of css selectors.
     */

    var getClassBlockingSelectors = memoize(function () {
      var excludedClasses = DEFAULT_EXCLUDED_CLASSES.concat(SL_EXCLUDED_CLASSES);
      return excludedClasses.map(function (className) {
        return "." + className;
      });
    });
    /**
     * Create list of CSS selectors selecting anchor element with a rel
     * matching one of the excluded rels.
     * The publisher has some options to prevent the affiliation of links
     * by setting specific values to the "rel" attribute of the link.
     * @return {Array<string>}
     */

    var getRelBlockingSelectors = memoize(function () {
      // "~=" means contain a word equal to
      return DEFAULT_EXCLUDED_RELS.map(function (rel) {
        return "a[rel~='" + rel + "']";
      });
    });

    /**
     * Is link blocked by some "DOM rules" set by the publisher:
     * Possible rules are:
     *   - Exclude links with class X
     *   - Exclude links with rel X
     *   - Exclude links inside a parent container (direct or not) with class X
     *   - Exclude links matching selectors [X,Y,Z]
     *   - Only include links in selectors [X,Y,Z]
     * @param {HTMLElement} a - anchor element
     */

    function isAnchorBlockedByDomBlockingRules(a) {
      var blockingSelectors = getBlockingSuperSelector();

      if (blockingSelectors.length) {
        // Returns true if one of the selectors matches
        // the node itself or a parent of the node.
        if (nodeOrParentIsMatchingAnySelectors(a, blockingSelectors)) {
          return true;
        }
      }
      /**
       * If CUSTOM_INCLUDED_SELECTORS, block everything that
       * is not matching the selectors.
       */


      if (CUSTOM_INCLUDED_SELECTORS.length) {
        var isMatching = nodeOrParentIsMatchingAnySelectors(a, CUSTOM_INCLUDED_SELECTORS);
        return !isMatching;
      }

      return false;
    }
    /**
     * Build a list of CSS selectors that could
     * be blocking the links. We will then check if
     * the link receiving the click matches any of those
     * selectors.
     * @return {string} - CSS selector (concatenation of css selectors separated by comma.
     * E.g :
     *      "a[rel~='noskim'],a[rel~='norewrite'],.noskimlinks a, a.noskimlinks,.noskim a, a.noskim,.ads a, a.ads"
     */

    function getBlockingSuperSelector() {
      var blockingSelectors = [];
      return blockingSelectors.concat(getRelBlockingSelectors(), getClassBlockingSelectors(), CUSTOM_EXCLUDED_SELECTORS);
    }

    function isUrlBlockedByDomainRules(url) {
      var linkDomain = getDomainFromUrl(url); // Block everything except what's in the included domain list

      if (SL_INCLUDED_DOMAINS.length) {
        var isIncluded = isDomainMatchingAnyDomainRules(linkDomain, SL_INCLUDED_DOMAINS); // All domains outside of the included list are blocked

        return !isIncluded;
      }

      return isDomainMatchingAnyDomainRules(linkDomain, getExcludedDomains());
    }

    function isDomainMatchingAnyDomainRules(domain, listOfRules) {
      var matchingRule = find(listOfRules, function (domainRule) {
        return domainMatchesRule(domain, domainRule);
      });

      return Boolean(matchingRule);
    }
    /**
     * Returns if a domain match one of the domain exclude/include rules.
     * We handle 4 formats of rules:
     *  - *.ebay.* => contains string X
     *  - *.ebay.com => ends with string X
     *  - shop.ebay.* => starts with string X
     *  - shop.ebay.com => is equal to string X
     * @param {string} domain
     * @param {string} rule
     * @return {boolean}
     */


    function domainMatchesRule(domain, rule) {
      var startsWithStar = startsWith("*");

      var endsWithStar = endsWith("*"); // Remove all the "*" in the rule


      var ruleWithoutStars = rule.replace(/\*/g, "");

      if (startsWithStar && endsWithStar) {
        // In format *.ebay.* => anything including
        // ".ebay." is a match.
        return includes(domain, ruleWithoutStars);
      }

      if (startsWithStar) {
        // In format *.ebay.com => anything ending in
        // ".ebay.com" is a match.
        return endsWith(domain, ruleWithoutStars);
      }

      if (endsWithStar) {
        // In format shop.ebay.* => anything starting in
        // "shop.ebay." is a match.
        return startsWith(domain, ruleWithoutStars);
      } // In format shop.ebay.com => full match


      return domain === rule;
    }

    /**
     * A curried version of #isExternalUrl with the contextual hostname.
     *
     * @param {string} url
     * @param {Boolean} [considerNoProtocolAsInternal]
     * @return {Boolean}
     */

    function isExternalDomain(url, considerNoProtocolAsInternal) {
      return isExternalUrl(skimlinksState.hostname, url, considerNoProtocolAsInternal);
    }

    function some(array, testFn) {
      if (!array || !array.length || !testFn) {
        return false;
      }

      var item = find(array, testFn);

      return typeof item !== "undefined";
    }

    /**
     * Return true if skim-js should ignoree the link
     * because itunes autolink maker has priority to affiliate it.
     * skim-js gives way when:
     * - Itunes Autolink maker is loaded in the page.
     * - Link is an Itune link
     *
     * Note: Itunes autolink maker is a script created by Skimlinks
     * for Itunes. Itunes distribute the script to its affiliate
     * clients but the script is basically an old custom version
     * of skim-js and the click will go through us anyway.
     * @param {string} url
     * @return {boolean}
     */

    function shouldGiveWayToItunesLinkMaker(url) {
      // We are checking _merchantSettings for every clicks as auto link maker could be loaded at any time.
      var hasItuneAutoLinkMaker = getContextVar("_merchantSettings");

      if (!hasItuneAutoLinkMaker) {
        return false;
      } // If the url contains any itunes domain


      var isItuneLink = some(ITUNES_URLS, function (itunesUrl) {
        return includes(url, itunesUrl);
      });

      return isItuneLink;
    }

    /**
     * Check if affiliation needs to be blocked because
     * the publishers has set some rules to not affiliate
     * this type of links.
     * The affiliation is blocked if:
     *  - URL is not external
     *  - domain is blocked
     *  - anchor is blocked by the DOM context.
     * @param {HTMLElement}
     * @param {boolean}
     */

    function shouldIgnoreLink(anchor) {
      if (!anchor || !anchor.href) {
        return true;
      }

      var href = extractHrefFromAnchor(anchor);
      return !isValidExternalUrl(href) || isAnchorBlockedByDomBlockingRules(anchor);
    }
    /**
     * Url should be considered as a potential affiliate URL.
     * Url is considered as a potential affiliate if:
     *  - domain is external.
     *  - domain is not blocked.
     * @param {string} url
     * @return {boolean}
     */

    function isValidExternalUrl(url) {
      if (!url || shouldGiveWayToItunesLinkMaker(url)) {
        return false;
      }

      return isExternalDomain(url) && !isUrlBlockedByDomainRules(url);
    }
    function isLinkExcludedFromImpressionTracking(anchor) {
      if (!anchor || !isArray(SL_IMPRESSION_EXCLUDED_SELECTORS) || SL_IMPRESSION_EXCLUDED_SELECTORS.length === 0) {
        return false;
      }

      return nodeOrParentIsMatchingAnySelectors(anchor, SL_IMPRESSION_EXCLUDED_SELECTORS);
    }

    var AFFILIATION_TYPES;
    /**
     * @param a - The A or AREA dom element that was clicked on
     */

    (function (AFFILIATION_TYPES) {
      AFFILIATION_TYPES["AFFILIATE"] = "AFFILIATE";
      AFFILIATION_TYPES["PRE_AFFILIATED"] = "PRE_AFFILIATED";
      AFFILIATION_TYPES["UNKNOWN"] = "UNKNOWN";
      AFFILIATION_TYPES["TRACK"] = "TRACK";
      AFFILIATION_TYPES["IGNORE"] = "IGNORE";
    })(AFFILIATION_TYPES || (AFFILIATION_TYPES = {}));

    function isAffiliatable(a) {
      /**
       * In theory a hidden link can not receive a click event but a fake click can be triggered from
       * javascript. This is a specific edge case for Hearst which is using an advertisement script appending
       * a new hidden link to the body when clicking on the ad. The ad script then triggers an fake click on the new link.
       * Because the hidden link is outside of the ad `no-skim` container we end-up affiliating it when we shouldn't.
       */
      if (SL_IGNORE_HIDDEN_LINKS && isHidden(a)) {
        return AFFILIATION_TYPES.IGNORE;
      }

      var href = extractHrefFromAnchor(a);
      var domain = stripWww(getDomainFromUrl(href));

      if (isValidHref(href) && !shouldIgnoreLink(a)) {
        // Turns everything into a NA click.
        if (SL_FORECAST) {
          return AFFILIATION_TYPES.TRACK;
        }

        if (isMerchantDomain(domain) || maybeMerchantRedirection(domain)) {
          return AFFILIATION_TYPES.AFFILIATE;
        }

        if (isWaypointDomain(domain)) {
          return AFFILIATION_TYPES.PRE_AFFILIATED;
        }

        if (SL_AFFILIATE_UNKNOWN_LINKS && isUnknownDomain(domain)) {
          return AFFILIATION_TYPES.UNKNOWN;
        } // Try to get a first party cookie by sending the user to waypoint
        // even though this is an NA click.


        if (commonState.cookie === "" && SL_FIRST_PARTY_NA) {
          return AFFILIATION_TYPES.AFFILIATE;
        }

        return AFFILIATION_TYPES.TRACK;
      }

      return AFFILIATION_TYPES.IGNORE;
    }
    function shouldAffiliate(affiliationType) {
      return affiliationType === AFFILIATION_TYPES.AFFILIATE || affiliationType === AFFILIATION_TYPES.UNKNOWN;
    }
    /**
     * Domains used for redirection which may contains a redirection to a merchant
     * This will send the click through waypoint but will not actually extract the
     * the target url unless you have the flag USE_MERCHANT_URL_EXTRACTION_RULES set to true.
     */

    function maybeMerchantRedirection(domain) {
      return hasOwnProperty(MERCHANT_URL_EXTRACTION_RULES, domain);
    }
    /**
     * Return true if the domain is a Skimlinks merchant
     * that can be affiliated.
     * @param domain
     */


    function isMerchantDomain(domain) {
      return skimlinksState.aff_domains[domain] === true;
    }
    /**
     * Return true if the we don't know if the domain is a skimlinks
     * merchant or not. This can happen when a link is added after the
     * beacon calls.
     * @param domain
     */


    function isUnknownDomain(domain) {
      return (// Link was added dynamically and never requested to beacon.
        !hasOwnProperty(skimlinksState.aff_domains, domain) // Links was requested to beacon we haven't received and answer yet
        // or the request has failed.
        || isNil(skimlinksState.aff_domains[domain])
      );
    }

    var getRealTarget = function getRealTarget(target) {
      while (target.parentNode) {
        target = target.parentNode;
        var nodeName = target.nodeName.toUpperCase();

        if (nodeName === "A" || nodeName === "AREA") {
          return target;
        }
      }

      return null;
    };

    function getClassList(node) {
      if (!node || !node.className) {
        return [];
      }

      return trim(node.className).split(/\s+/);
    }

    /**
     * @param {Element} node
     * @param {String} className
     */

    function hasClass(node, className) {
      if (!node || !node.className || !className) {
        return false;
      }

      return includes(getClassList(node), className);
    }

    function set(obj, crumbs, value) {
      if (!obj || !crumbs || !crumbs.length) {
        return obj;
      }

      var crumbsLen = crumbs.length;
      var previousObj = obj;
      var previousCrumb = null;

      for (var i = 0; i < crumbsLen; i++) {
        var crumb = crumbs[i];
        var isLastCrumb = i === crumbsLen - 1;

        if (isLastCrumb) {
          try {
            obj[crumb] = value;
          } catch (err) {
            previousObj[previousCrumb] = {};
            previousObj[previousCrumb][crumb] = value;
          }

          break;
        }
        /**
         * Warning: _isObject has the same behaviour as the lodash one, i.e. an Array, a RegExp, an HTMLElement,
         * a CSSStyleDeclaration... are all objects. This is the correct behaviour as we don't want to overwrite
         * one of those with a plain object when they can have the desired property just set directly.
         *
         * For e.g. overwriting a CSSStyleDeclaration with a plain object in Chrome will not actually do the set
         * but re-initialise the style properties of the HTMLElement. Hence, calling _set on a DOM node multiple times
         * would have kept re-initialising the style properties and would only have set the last one.
         *
         * See https://github.com/skimhub/skim-js/issues/983 for more information.
         */


        if (!(crumb in obj) || !isObject(obj[crumb])) {
          obj[crumb] = {};
        }

        previousObj = obj;
        previousCrumb = crumb;
        obj = obj[crumb];
      }

      return obj;
    }

    /**
     * If the link of the anchor has already been replaced,
     * we want to update the actual waypoint link with the new
     * value of icust and sourceApp.
     *
     * TODO: This is a bit of a hack, a proper solution would
     * be to refactor the click handler to be able to control
     * the order of replacement of the link through a priority
     * system.
     * @param {HTMLElement} anchor
     * @returns {Boolean} True if has updated, false otherwise.
     */

    function updateHrefIfAlreadySwapped(anchor) {
      if (!isHrefBeingSwapped(anchor)) {
        return false;
      }

      var anchorMetaData = getAnchorMetaData(anchor);
      var newUrl = updateWaypointUrl(anchor.href, anchorMetaData);
      anchor.href = newUrl;
      return true;
    }
    /**
     * @param {string} url - The original URL.
     * @param {*} anchorMetaData - The metaData of the anchor to read the new icust and sourceApp values.
     */

    function updateWaypointUrl(url, anchorMetaData) {
      var queryParams = extractParamsFromUrl(url);

      if (anchorMetaData.icust && anchorMetaData.icust !== queryParams.xjsf) {
        queryParams.xjsf = anchorMetaData.icust;
      }

      if (anchorMetaData.sourceApp && anchorMetaData.sourceApp !== queryParams.xs) {
        queryParams.xs = anchorMetaData.sourceApp;
      }

      var newQueryString = buildQueryString(queryParams);
      return skimlinksState.waypointDomain + "?" + newQueryString;
    }

    /**
     * This util allows to attach information to an anchor.
     * The information can then be used when building the waypoint url.
     * Ex: source app, icust...
     */

    /**
     * All the metadata data will be store in an object available through
     */

    var SKIMLINKS_METADATA_KEY = "__skimlinks__";
    /**
     * Read the metadata we stored on the anchor element.
     * @param {*} a - Anchor HTML element.
     */

    function getAnchorMetaData(a) {
      if (!a) {
        throw new Error("getAnchorMetaData takes an anchor HTML element as an argument");
      }

      var metaData = get(a, [SKIMLINKS_METADATA_KEY]);

      if (!metaData) {
        // Set default metadata object.
        metaData = {
          // Internal custom tracking.
          icust: null,
          sourceApp: null
        };

        set(a, [SKIMLINKS_METADATA_KEY], metaData);
      }

      return metaData;
    }
    /**
     * Set an internal custom value (icust).
     * A good practice is to always prefix your actual data by an understandable name
     * so we know what this data represent.
     * iia_imp_314134134. (iia impression id)
     * @param {*} a - Anchor HTML element.
     * @param {*} icustValue (max 32 chars)
     */

    function setIcust(a, icustValue) {
      if (String(icustValue).length > 32) {
        throw new Error(icustValue + " is not a valid icust value. The value should be less than 33 chars");
      }

      var metaData = getAnchorMetaData(a);
      metaData.icust = icustValue;
      updateHrefIfAlreadySwapped(a);
    }
    /**
     * Setup up custom source app for the anchor.
     * When the user clicks on the anchor,
     * the default source app will be overwritten to use the
     * one specified instead.
     * @param {*} a - Anchor HTML element.
     * @param {*} sourceApp - The new source app.
     */

    function setAnchorSourceApp(a, sourceApp) {
      var metaData = getAnchorMetaData(a);
      metaData.sourceApp = sourceApp;
      updateHrefIfAlreadySwapped(a);
    }
    /**
     * Attach the client click id to the anchor, so it can later be read
     * by getAffiliatedUrl.
     * TODO: Remove this hacky way of passing the click id, by passing the
     * AnchorClickEvent object directly to getAffiliatedUrl.
     * @param {HTMLAnchorElement} anchor
     * @param {string} clientClickId
     */

    function setClientClickId(anchor, clientClickId) {
      var metaData = getAnchorMetaData(anchor);
      metaData.clientClickId = clientClickId;
      updateHrefIfAlreadySwapped(anchor);
    }
    /**
     * Remove client click id as it should be used only once.
     * @param {HTMLAnchorElement} anchor
     */

    function unsetClientClickId(anchor) {
      var metaData = getAnchorMetaData(anchor);
      delete metaData.clientClickId;
    }
    function setLinkSwappingMatchId(anchor, matchId) {
      var metaData = getAnchorMetaData(anchor);
      metaData.linkSwappingMatchId = matchId;
      updateHrefIfAlreadySwapped(anchor);
    }

    /**
     * Build the waypoint URL.
     * @param {HTMLElement} a
     * @param {String} url - merchant URL
     */

    function getAffiliatedUrl(a, url) {
      var isSkimwordsLink = hasClass(a, "skimwords-link");
      var creative = attr(a, "data-skim-creative");
      var trackingId = attr(a, "data-skimlinks-tracking") || CUSTOM_TRACKING_VAR;
      var extraRedirectionParams = EXTRA_REDIR_PARAMS ? "&" + EXTRA_REDIR_PARAMS : "";

      var queryParams = assign(getDoNotTrackFlags(), {
        id: DOMAIN_KEY,
        isjs: 1,
        jv: JS_VERSION,
        // JS version
        sref: WINDOW.location,
        url: url,
        // We track everything, including query string and hash
        xs: 1,
        // Skimlinks link
        xtz: getTimezoneOffset(),
        xuuid: commonState.uuid
      });

      if (creative) {
        queryParams.xcreo = creative;
      }

      if (commonState.isAdblockUser) {
        queryParams.abp = 1;
      }

      if (commonState.cookie) {
        queryParams.xguid = commonState.cookie;
      }

      if (SITE_NAME) {
        queryParams.site = SITE_NAME;
      }

      if (trackingId) {
        queryParams.xcust = trackingId;
      }

      if (isSkimwordsLink) {
        queryParams.xs = 2;
        queryParams.xword = attr(a, "data-skimwords-word") || ""; // Proxy Skimwords version to waypoint if it's available

        if (skimwordsState.version) {
          queryParams.sv = skimwordsState.version;
        }
      } // Check the metadata skimlinks may have added


      var anchorMetaData = getAnchorMetaData(a); // icust is the equivalent of xcust but
      // internaly (only for skimlinks)

      if (anchorMetaData.icust) {
        // xjsf is also called js_finger.
        queryParams.xjsf = anchorMetaData.icust;
      } // Has custom source app? (like incentive)


      if (anchorMetaData.sourceApp) {
        queryParams.xs = anchorMetaData.sourceApp;
      }

      if (anchorMetaData.clientClickId) {
        queryParams.cci = anchorMetaData.clientClickId; // Should be used once and then removed

        unsetClientClickId(a);
      }

      if (anchorMetaData.linkSwappingMatchId) {
        queryParams.ls = anchorMetaData.linkSwappingMatchId;
      }

      return skimlinksState.waypointDomain + "/?" + buildQueryString(queryParams) + extraRedirectionParams;
    }

    var get_href;
    var replace_href = function replace_href(a, restoreDelay) {
      var new_domain, new_url, url;

      if (a && a.nodeName && a.nodeName.toUpperCase() !== "A" && a.nodeName.toUpperCase() !== "AREA") {
        a = getRealTarget(a);
      }

      if (a) {
        url = get_href(a);
        new_domain = skimlinksState.waypointDomain; // This might be easy to simplify. I would guess it would only need the second check

        if (url.length >= new_domain.length && url.substr(0, new_domain.length) === new_domain) {
          // If it's a waypoint domain do not do link replacement.
          // It's testing if the url starts with `//go.redirectingat.com` or `//go.skimresources.com`
          // The url can start with `//go.redirectingat.com` in two scenarios:
          // - Publisher has pasted a waypoint url starting with "//" (Probably not the intention)
          // - Skim Js has already replaced the link which seems to be the intention here.
          return true;
        } // Following the comment above, this is probably the case where the publisher
        // has pasted a waypoint url which starts with http:// or https:// instead of //
        // (The protocol is the reason why we didn't go in if test above)


        if (url.indexOf(new_domain) !== -1) {
          new_url = url;
        } else {
          new_url = getAffiliatedUrl(a, url);
        }

        swapHrefTemporarily(a, new_url, restoreDelay);
      }

      return true;
    };

    get_href = function get_href(a) {
      var domain, extract_regexp, re_source, ref;
      var href = extractHrefFromAnchor(a);

      if (USE_MERCHANT_URL_EXTRACTION_RULES) {
        domain = getDomainFromUrl(href);

        if (domain in MERCHANT_URL_EXTRACTION_RULES) {
          // Constructs a regular expression extracting url as a named param, for example
          // z=http://www.yahoo.com
          re_source = "[&?]" + MERCHANT_URL_EXTRACTION_RULES[domain].name + "=(http[^&]+)";
          extract_regexp = new RegExp(re_source); // Always return last matched group, pp
          // makes it more flexible with regards to captured groups

          return decodeURIComponent((ref = href) != null ? ref.match(extract_regexp).pop() : void 0) || href;
        }
      }

      return href;
    };

    /**
     * Tries to detect if a node has click listeners that will call .preventDefault.
     * the onclick attribute and props are both checked.
     *
     * `return false` in an onclick attribute will prevent the default browser behaviour.
     * We use that util to ensure affiliated links that are affected will still be monetised.
     *
     * @param {Element} node
     * @return {boolean}
     */

    function willPreventDefaultViaAttrOrProp(node) {

      var onClickAttr = attr(node, "onclick");

      if (onClickAttr && includes(onClickAttr.toString(), "return false")) {
        return true;
      }

      var onClickProp = node.onclick;

      if (onClickProp && isFunction(onClickProp) && includes(onClickProp.toString(), ".preventDefault()")) {
        return true;
      }

      return false;
    }

    /**
     * Send a generic event and an optional
     * payload to the `/generic_tracking` end-point of Tracking API.
     */
    function trackEvent(type, payload, forceSendBeacon) {
      // Always send those information as part of the event.
      var generic_info = {
        domain_id: DOMAIN_ID,
        publisher_id: PUBLISHER_ID,
        page_url: WINDOW.location.href,
        impression_id: commonState.uuid,
        jv: JS_VERSION
      };

      var data = assign({}, payload, generic_info);

      var options = {};

      if (navigator.sendBeacon) {
        options.useSendBeacon = Boolean(forceSendBeacon);
      } else {
        // Hacky equivalent of sendBeacon
        options.usePixel = Boolean(forceSendBeacon);
      }

      sendTrackingRequest("/generic_tracking/" + type, data, {}, options);
    }

    var INCENTIVE_LOAD_STATUSES;

    (function (INCENTIVE_LOAD_STATUSES) {
      INCENTIVE_LOAD_STATUSES["STARTING"] = "STARTING";
      INCENTIVE_LOAD_STATUSES["CANCELLED"] = "CANCELLED";
      INCENTIVE_LOAD_STATUSES["PENDING_API"] = "PENDING_API";
      INCENTIVE_LOAD_STATUSES["API_ERROR"] = "API_ERROR";
      INCENTIVE_LOAD_STATUSES["NO_OFFERS"] = "NO_OFFERS";
      INCENTIVE_LOAD_STATUSES["PENDING_MODULE"] = "PENDING_MODULE";
      INCENTIVE_LOAD_STATUSES["READY"] = "READY";
    })(INCENTIVE_LOAD_STATUSES || (INCENTIVE_LOAD_STATUSES = {}));

    var incentiveLoadStatus = INCENTIVE_LOAD_STATUSES.STARTING;

    /**
     * Extract event target node in a cross-browser fashion.
     *
     * @param {Event} event
     * @return {Element}
     */
    function getEventTarget(event) {
      return event.target || event.srcElement || event.originalTarget;
    }

    function getLinkFromEvent(evt) {
      var clickTarget = getEventTarget(evt);

      if (!clickTarget) {
        return null;
      }

      if (!isLinkElement(clickTarget)) {
        // Return the first parent that is a link
        return getRealTarget(clickTarget);
      }

      return clickTarget;
    }

    function isLinkElement(node) {
      var nodeName = (node.nodeName || "").toLowerCase();
      return includes(["a", "area"], nodeName);
    }

    /**
     * @return {void}
     */

    function trackKeywee() {
      var pixelUrl = getContextVar("skimlinks_keywee_pixel", null);

      var isKeyweeCampaign = includes(WINDOW.location.href, "utm_campaign=fbkw");

      if (pixelUrl && isKeyweeCampaign) {
        createPixel(pixelUrl);
      }
    }

    // is sometimes used as an event handler.
    // We're optionally passing the anchor node as an argument to avoid the potentially
    // expensive call to getLinkFromEvent().

    var send_through_waypoint_with_link_replacement = function send_through_waypoint_with_link_replacement(evt, a) {
      var e;
      a = a || getLinkFromEvent(evt);

      if (!a) {
        return true;
      }

      replace_href(a);
      trackKeywee();

      if (getContextVar("vglnk") && hasClass(a, "skimwords-link")) {
        if (evt && evt.stopPropagation) {
          evt.stopPropagation();
        } else {
          e = WINDOW.event;
          e.cancelBubble = true;
        }
      }

      return true;
    };
    var send_through_waypoint_in_new_window = function send_through_waypoint_in_new_window(a, evt) {
      var popwin; // We still replace the href of the link for some reasons. Reasons I can think of are:
      // - We want the publisher to be able to read the waypoint url in the onclick handler
      //   (for their own tracking maybe?)
      // - Lazyness: Just so we can read the waypoint a.href. (most likely the reason)

      send_through_waypoint_with_link_replacement(evt, a);

      if (SL_TARGET) {
        popwin = WINDOW.open(a.href, SL_TARGET);
      } else {
        popwin = WINDOW.open(a.href, "_blank");
      }

      return popwin.focus();
    };

    /**
     * Execute a function without interrupting the
     * stack if an error is thrown. Use this to executing
     * 3rd party functions without taking the risk of breaking
     * our code.
     * @param {function} fn
     */
    function executeSafely(fn) {
      try {
        return fn();
      } catch (err) {}
    }

    var trackGoogleAnalyticsClick = function trackGoogleAnalyticsClick(url) {
      if (getContextVar("gtag")) {
        sendWithGtagDotJs(url);
      } else if (getContextVar("ga")) {
        sendWithAnalyticsDotJs(url);
      } else if (getContextVar("_gaq")) {
        sendWithGaDotJsLegacy(url);
      } else if (getContextVar("pageTracker")) {
        sendWithGaDotJsTraditional(url);
      }
    };
    /**
     * Google analytics "gtag.js"
     * Version distributed by GA as of 2019.
     * https://developers.google.com/analytics/devguides/collection/gtagjs/
     * @param {string} url
     */

    function sendWithGtagDotJs(url) {
      var gtag = getContextVar("gtag"); // Wrap in try/catch to not break the affiliation in case
      // something goes wrong with the 3rd party script.

      executeSafely(function () {
        gtag("event", GOOGLE_TRACKING_ACTION_NAME, {
          'event_category': "click",
          'event_label': url
        });
      });
    }
    /**
     * Google analytics "analytics.js"
     * Version distributed by GA before gtag.js
     * https://developers.google.com/analytics/devguides/collection/analyticsjs/
     * @param {string} url
     */


    function sendWithAnalyticsDotJs(url) {
      var ga = getContextVar("ga"); // Wrap in try/catch to not break the affiliation in case
      // something goes wrong with the 3rd party script.

      executeSafely(function () {
        ga("send", "event", "click", GOOGLE_TRACKING_ACTION_NAME, url);
      });
    }
    /**
     * ga.js legacy
     * https://developers.google.com/analytics/devguides/collection/gajs/
     * @param {string} url
     */


    function sendWithGaDotJsLegacy(url) {
      var gaq = getContextVar("_gaq"); // Wrap in try/catch to not break the affiliation in case
      // something goes wrong with the 3rd party script.

      executeSafely(function () {
        gaq.push(["_trackEvent", "click", GOOGLE_TRACKING_ACTION_NAME, url]);
      });
    }
    /**
     * This is almost oldest version of GA
     * ga.js traditional
     * https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingOverview
     * @param {string} url
     */


    function sendWithGaDotJsTraditional(url) {
      var pt = getContextVar("pageTracker");

      if (pt._trackPageview) {
        // Wrap in try/catch to not break the affiliation in case
        // something goes wrong with the 3rd party script.
        executeSafely(function () {
          pt._trackPageview("/" + GOOGLE_TRACKING_ACTION_NAME + "/" + url);
        });
      }
    }

    /**
     * Make the click go through waypoint.
     * @param anchorClickEvent
     */

    function redirectLeftClickToWaypoint(anchorClickEvent) {
      var anchor = anchorClickEvent.anchor,
          nativeEvent = anchorClickEvent.nativeEvent,
          clientClickId = anchorClickEvent.clientClickId;
      strip_attributes(anchor);

      if (SL_TARGET) {
        attr(anchor, "target", SL_TARGET);
      }

      trackPotentiallyMissedIncentiveClicks(anchorClickEvent);
      setClientClickId(anchor, clientClickId);

      if (GOOGLE_TRACKING_ACTION_NAME) {
        trackGoogleAnalyticsClick(anchor.href);
      }

      if (willPreventDefaultViaAttrOrProp(anchor)) {
        return send_through_waypoint_in_new_window(anchor, nativeEvent);
      }

      return send_through_waypoint_with_link_replacement(nativeEvent, anchor);
    }
    /**
     * For publishers with incentive, we want to track (through icust) the potential
     * reasons why a click was not incentive. This will help understanding, when
     * we see in BQ a click on an incentive enabled domain that didn't go through incentive,
     * if this is an issue or one of the following valid scenario.
     */

    function trackPotentiallyMissedIncentiveClicks(anchorClickEvent) {
      var anchor = anchorClickEvent.anchor,
          affiliationType = anchorClickEvent.affiliationType;
      var anchorMetaData = getAnchorMetaData(anchor);
    }

    function isMatch(sourceObj, filterObj) {
      var reduceFilterObject = function reduceFilterObject(acc, filterKey) {
        var matchesFilterObjKey = sourceObj[filterKey] === filterObj[filterKey];
        return acc && matchesFilterObjKey;
      };

      return reduce(Object.keys(filterObj), reduceFilterObject, true);
    }

    var pubSub = {
      topics: {},

      /**
       * Sets up a listener for `eventName` and executes `callback` when one of those events gets found.
       * `filterObj` allows running the callback only when all shallow properties of it
       * match the event payload properties.
       *
       * @param {string} eventName
       * @param {function} callback
       * @param {object} [filterObj]
       */
      on: function on(eventName, callback, filterObj) {
        if (!isArray(this.topics[eventName])) {
          this.topics[eventName] = [];
        }

        var filteredCallback;

        if (filterObj) {
          filteredCallback = function filteredCallback(payload) {
            if (isMatch(payload, filterObj)) {
              callback(payload);
            }
          };
        }

        this.topics[eventName].push(filteredCallback || callback);
      },
      publish: function publish(eventName, payload) {
        forEach(this.topics[eventName] || [], function (callback) {
          if (isFunction(callback)) {
            callback(payload);
          }
        });
      }
    };

    /**
     * Turns any iterable structure (NodeList for e.g.) into an array.
     *
     * @return {Array}
     */

    function toArray$1(iterable) {
      return reduce(iterable, function (acc, value) {
        return acc.concat(value);
      }, []);
    }

    function getLinks(className, includeArea) {
      if (includeArea === void 0) {
        includeArea = true;
      }

      var classSelector = className ? "." + className : "";
      var linksSelector = includeArea ? "a[href]" + classSelector + ", area[href]" + classSelector : "a[href]" + classSelector;
      return toArray$1(DOCUMENT.querySelectorAll(linksSelector));
    }

    /**
    * Make XHR call to beacon endpoint.
    * @param domains
    * @param beaconCallType
    * @param onBeaconResponse
    */
    function requestBeaconAPI(domains, beaconCallType, onBeaconResponse) {
      var dataValue = JSON.stringify({
        pubcode: DOMAIN_KEY,
        page: WINDOW.location.href,
        domains: domains,
        link_swapping: LINK_SWAPPING
      });
      var requestOptions = {
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        // application/x-www-form-urlencoded expect data in query string format.
        data: buildQueryString({
          data: dataValue
        }),
        // Enable cookies in POST request
        withCredentials: true
      };
      var queryParams = getDoNotTrackFlags();

      {
        // Param so we can identify the request in the proxy during our tests.
        // "_" is a query params reserved by beacon and doesn't do anything on
        // the server side.
        queryParams._ = beaconCallType;
      }

      requests.post("" + BEACON_API_URL, queryParams, onBeaconResponse, requestOptions);
    }

    function beaconRequestHandler(beaconResponse) {
      // Store the latest information from beacon in our application state.
      extractAndSaveBeaconData(beaconResponse);
      var requestedDomains = beaconResponse.requestedDomains,
          merchant_domains = beaconResponse.merchant_domains; // Todo: check if this was breaking before because of beaconData = beaconData || {}?

      updateRequestedDomainStatus(requestedDomains, merchant_domains);
    }
    /**
     * Our Beacon API returns various information about the context of the page or the user.
     * This function reads the response of beacon and store the relevant information
     * in our application state.
     * TODO: Refactor this messy commonState object, the idea would be that this
     * function place the different data returned by beacon API to the relevant state.
     * @param beaconResponse
     */

    function extractAndSaveBeaconData(beaconResponse) {
      var extractedData = {};

      if (beaconResponse.country) {
        extractedData.country = beaconResponse.country.toUpperCase();
      }

      if (beaconResponse.country_state) {
        extractedData.countryState = beaconResponse.country_state;
      }

      if (beaconResponse.guid && commonState.cookie === "") {
        extractedData.cookie = beaconResponse.guid;
      }

      if (isBoolean(beaconResponse.consent)) {
        extractedData.consent = beaconResponse.consent;
      }

      if (beaconResponse.csp) {
        extractedData.cookieSyncString = beaconResponse.csp;
      }

      if (beaconResponse.ts) {
        extractedData.lastBeaconTimestamp = beaconResponse.ts;
      }

      mutateCommonData(extractedData);
    }
    /**
     * Update the status of domains we sent to beacon based on the API response.
     * @param requestedDomains - List of domains we sent to the beacon API.
     * @param merchantDomains - List of domains in beacon API response (i.e merchant domains)
     */


    function updateRequestedDomainStatus(requestedDomains, merchantDomains) {
      // Iterate over the domains with the requestedDomains and
      // update them based on the response
      forEach(requestedDomains, function (domain) {
        var isMerchantDomain = includes(merchantDomains, domain) && !isWaypointDomain(domain);
        skimlinksState.aff_domains[domain] = isMerchantDomain;
      });
    }

    /**
     * Returns true if the test function returns true for all the element of the array.
     * @param array
     * @param testFn
     */

    function every(array, testFn) {
      // Check if the test function returns false for any element
      // in the list.
      var hasAnyFailedTest = some(array, function (el) {
        return !testFn(el);
      }); // If not all are true then false


      return !hasAnyFailedTest;
    }

    /**
     * This module is an alternative solution to Promises which are not available in
     * skim-js for browser compatibility reasons. The idea is to hold the execution of the registered
     * callbacks until the state of the ReadyState instance is marked as "ready".
     *
     * When using readyState, you don't need to know if the state is already ready or not,
     * you can register your callback which will be executed as soon as possible:
     *  - When the state changes to "ready" the already registered callbacks are
     *    automatically executed asynchronously.
     *  - Any callback registered after the state is set to "ready"  will be executed without
     *    waiting, in a synchronous way.
     */

    /**
     * State to keep track of if something is ready or not and
     * automatically execute registered callbacks once
     * the state becomes ready.
     *
     * You can register a callback using .whenReady(cb)
     * You can mark the state as ready by calling .setReady()
     * E.g.:
     * const beaconReadyState = new ReadyState()
     * beaconReadyState.whenReady(callback1)
     * ...
     * beaconReadyState.whenReady(callback2)
     * ...
     * beaconReadyState.setReady() // "callback1" and "callback2" are executed asynchronously
     *
     * You can also use `myReadyStateInstance.waitFor([...])` to make your
     * ready status dependent of other sub-ReadyState. sub-ReadyState can be added
     * at any point in time and therefore change the ready status across time. This can
     * be useful if your sub-ReadyState are dynamically created after responding to events.
     * E.g.: See BeaconService whenNoRequestsPending
     */

    var ReadyState =
    /*#__PURE__*/
    function () {
      /**
       * Mark the current readyState has ready.
       * If the readyState has some subReadyState, the "ready"
       * property will be ignored. Use isReady() to abstract this
       * difference of behaviour between ReadyState with and without
       * sub ReadyStates.
       */

      /**
       * List of ReadyState dependencies, the
       * state is considered ready when all the
       * subReadyStates are also ready.
       */
      function ReadyState() {
        var _this = this;

        _defineProperty(this, "ready", void 0);

        _defineProperty(this, "pendingCallbacks", void 0);

        _defineProperty(this, "subReadyStateList", void 0);

        _defineProperty(this, "isReady", function () {
          if (_this.dependsOnSubReadyState()) {
            return every(_this.subReadyStateList, function (readyState) {
              return readyState.isReady();
            });
          }

          return _this.ready;
        });

        _defineProperty(this, "setReady", function () {
          if (_this.dependsOnSubReadyState() || _this.ready) {
            // If this.ready is true, pendingCallbacks will always be an empty array
            // since:
            // - pendingCallbacks is reset to [] after calling the callbacks
            // - We only push to pending pendingCallbacks if this.ready is false
            // So we don't really need to do an early return if this.ready is true
            // but it avoids executed code for nothing.
            return;
          }

          _this.ready = true;

          _this.callPendingCallbacks();
        });

        _defineProperty(this, "waitFor", function (readyStateList) {
          /**
           * Remove potential falsy value added when listing conditional readyStates
           * e.g.:
           *  combineReadyStates(
           *      beaconFullyReadyState,
           *      hasUnlinked() && unlinkedReadyState
           *  )
           */
          var readyStatesFiltered = filter(readyStateList, function (readyState) {
            return Boolean(readyState);
          });

          _this.subReadyStateList = _this.subReadyStateList.concat(readyStatesFiltered);

          if (_this.isReady()) {
            // Added sub ready-states are already ready,
            // no need to wait for anything.
            _this.callPendingCallbacks();
          } else {
            readyStatesFiltered.forEach(function (subReadyState) {
              subReadyState.whenReady(_this.whenSubReadyStateIsReady);
            });
          }
        });

        _defineProperty(this, "whenSubReadyStateIsReady", function () {
          if (_this.isReady()) {
            _this.callPendingCallbacks();
          }
        });

        this.ready = false;
        this.pendingCallbacks = [];
        this.subReadyStateList = [];
      }
      /**
       * Postpone the execution of your callback to when
       * the state is marked as ready.
       * @param cb
       */


      var _proto = ReadyState.prototype;

      _proto.whenReady = function whenReady(cb) {
        if (this.isReady()) {
          cb();
        } else {
          this.pendingCallbacks.push(cb);
        }
      }
      /**
       * Check if the ReadyState is ready or not.
       * If the ReadyState has at least one sub ReadyState
       * (added with .waitFor()), the main ReadyState will
       * be considered as ready if all the sub ReadyState are
       * ready.
       */
      ;

      /**
       * Return true if the current state is waiting
       * for some sub ReadyState.
       */
      _proto.dependsOnSubReadyState = function dependsOnSubReadyState() {
        return this.subReadyStateList.length !== 0;
      };

      _proto.callPendingCallbacks = function callPendingCallbacks() {
        this.pendingCallbacks.forEach(function (cb) {
          setTimeout(cb, 0);
        });
        this.pendingCallbacks = [];
      };

      return ReadyState;
    }();
    /**
     * Allows to combine multiple ReadyState into one. The returned
     * readyState will be ready when all the sub-ReadyStates passed
     * in arguments are ready.
     *
     * E.g:
     * const subState1 = new ReadyState()
     * const subState2 = new ReadyState()
     * ...
     * const finalState = combineReadyStates(subState1, subState2, ...)
     * finalState.whenReady(cb)
     *
     * In the example above, "cb" will not be called until subState1.setReady() and
     * subState2.setReady() have both been called.
     */

    function combineReadyStates() {
      var finalReadyState = new ReadyState();

      for (var _len = arguments.length, subReadyStates = new Array(_len), _key = 0; _key < _len; _key++) {
        subReadyStates[_key] = arguments[_key];
      }

      finalReadyState.waitFor(subReadyStates);
      return finalReadyState;
    }

    var BeaconCallTypes;
    /**
     * This is the shape of the actual json API
     * response.
     */

    (function (BeaconCallTypes) {
      BeaconCallTypes["PRE_PAGE_LOAD"] = "PRE_PAGE_LOAD";
      BeaconCallTypes["POST_PAGE_LOAD"] = "POST_PAGE_LOAD";
      BeaconCallTypes["AUX"] = "AUX";
    })(BeaconCallTypes || (BeaconCallTypes = {}));

    var EVENTS__BEACON__REQUEST_COMPLETED = "EVENTS__BEACON__REQUEST_COMPLETED";

    var BeaconService =
    /*#__PURE__*/
    function () {
      // Function making the API request
      // Ready when beacon API has been called at least once.

      /**
       * requestBeaconAPI & beaconRequestHandler functions are passed
       * through constructor arguments so the class is easier to unit test.
       */
      function BeaconService(requestBeaconAPI, beaconRequestHandler) {
        var _this = this;

        _defineProperty(this, "requestBeaconAPI", void 0);

        _defineProperty(this, "beaconRequestHandler", void 0);

        _defineProperty(this, "requestsHistory", void 0);

        _defineProperty(this, "noRequestPendingReadyState", void 0);

        _defineProperty(this, "beaconApiResponseReadyState", void 0);

        _defineProperty(this, "postPageLoadCallReadyState", void 0);

        _defineProperty(this, "beaconFullyReadyState", void 0);

        _defineProperty(this, "whenNoRequestsPending", function (callback) {
          _this.noRequestPendingReadyState.whenReady(callback);
        });

        _defineProperty(this, "whenBeaconApiRequestCompleted", function (callback) {
          _this.beaconApiResponseReadyState.whenReady(callback);
        });

        _defineProperty(this, "whenPostPageLoadBeaconCallCompleted", function (callback) {
          _this.postPageLoadCallReadyState.whenReady(callback);
        });

        _defineProperty(this, "whenBeaconFullyReady", function (callback) {
          _this.beaconFullyReadyState.whenReady(callback);
        });

        _defineProperty(this, "sendBeaconRequest", function (domains, beaconCallType) {
          var noDomainsFound = domains.length === 0;
          var beaconRequest = {
            readyState: new ReadyState(),
            requestedDomains: domains,
            response: null,
            beaconCallType: beaconCallType
          }; // Check if we need to make the API request?

          if (_this.hasFetchedAtLeastOnce() && noDomainsFound) {
            _this.requestsHistory.push(beaconRequest); // Synchronously set the state as ready since we don't
            // need to make the request.


            beaconRequest.readyState.setReady();
          } else {
            /**
             * Wrapper function injecting the list of requestedDomains in the response
             * so we can later compare the list of domain we sent
             * vs the list of merchant domains we received from the API.
             * This will help us to know which domains can have their status updated.
             */
            var _onBeaconResponse = function _onBeaconResponse(jsonData) {
              var responseData = assign({
                requestedDomains: domains
              }, jsonData);

              _this.beaconRequestHandler(responseData);

              beaconRequest.response = responseData;
              beaconRequest.readyState.setReady();
            };

            _this.requestBeaconAPI(domains, beaconCallType, _onBeaconResponse);
          }

          _this.updateRequestsHistory(beaconRequest);

          beaconRequest.readyState.whenReady(function () {
            // Only publish if it was a real API request.
            if (beaconRequest.response) {
              pubSub.publish(EVENTS__BEACON__REQUEST_COMPLETED, beaconRequest);
            }

            _this.resolveReadyStatesOnRequestCompleted(beaconRequest);
          });
          return beaconRequest;
        });

        this.requestBeaconAPI = requestBeaconAPI;
        this.beaconRequestHandler = beaconRequestHandler;
        this.requestsHistory = [];
        this.noRequestPendingReadyState = new ReadyState(); // Set to ready since no requests are pending

        this.noRequestPendingReadyState.setReady();
        this.beaconApiResponseReadyState = new ReadyState();
        this.postPageLoadCallReadyState = new ReadyState();
        this.beaconFullyReadyState = combineReadyStates(this.beaconApiResponseReadyState, this.postPageLoadCallReadyState);
      }
      /**
       * Becomes ready when no beacon requests are pending.
       * Note: When a new beacon request is added, the callback will be
       * automatically postponed until all the old and newly
       * added requests have completed.
       */


      var _proto = BeaconService.prototype;

      /**
       * Add beaconRequest to the request history list and
       * update noRequestPendingReadyState to wait for this new request
       * to complete.
       * @param beaconRequest
       */
      _proto.updateRequestsHistory = function updateRequestsHistory(beaconRequest) {
        this.requestsHistory.push(beaconRequest); // Postpone the noRequestPendingReadyState until old and new requests
        // are all ready.

        this.noRequestPendingReadyState.waitFor([beaconRequest.readyState]);
      }
      /**
       * Called after each request has completed, we need to check if we
       * can update any readyState so other modules which are waiting for
       * a specific beacon request can execute.
       * @param requestData
       * @param beaconCallType
       */
      ;

      _proto.resolveReadyStatesOnRequestCompleted = function resolveReadyStatesOnRequestCompleted(beaconRequest) {
        var requestData = beaconRequest.response;
        var wasAnActualApiCall = Boolean(requestData);

        if (wasAnActualApiCall && !this.beaconApiResponseReadyState.isReady()) {
          this.beaconApiResponseReadyState.setReady();
        }

        if (beaconRequest.beaconCallType === BeaconCallTypes.POST_PAGE_LOAD) {
          this.postPageLoadCallReadyState.setReady();
        }
      }
      /**
       * Beacon gives us information about the domains on the page
       * but also other information like country or guid.
       * Each page load should make at least one XHR request
       * to the beacon API.
       */
      ;

      _proto.hasFetchedAtLeastOnce = function hasFetchedAtLeastOnce() {
        return this.requestsHistory.length !== 0;
      };

      return BeaconService;
    }();
    var beaconService = new BeaconService(requestBeaconAPI, beaconRequestHandler);

    /**
     * Inspiration:
     * https://jsperf.com/reduce-for-distinct
     *
     * @param {Array} array
     * @returns {Array}
     */

    function uniq(array) {
      function reduceFn(acc, value) {
        if (includes(acc, value)) {
          return acc;
        }

        return acc.concat(value);
      }

      return reduce(array, reduceFn, []);
    }

    var SERVICES;
    /**
     * Simple module to register and access global services instantiated
     * at runtime.
     */

    (function (SERVICES) {
      SERVICES["ANCHOR_CLICK_INTERCEPTOR"] = "ANCHOR_CLICK_INTERCEPTOR";
    })(SERVICES || (SERVICES = {}));

    var services = {};
    function getService(serviceName) {
      var service = services[serviceName];

      if (!service) {
        throw new Error("Unknown service " + serviceName);
      }

      return service;
    }
    function registerService(serviceName, service) {
      services[serviceName] = service;
    }

    /**
     * Internal type we use to simplify all the native click types.
     */
    var INTERNAL_CLICK_TYPES;

    (function (INTERNAL_CLICK_TYPES) {
      INTERNAL_CLICK_TYPES["LEFT_CLICK"] = "LEFT_CLICK";
      INTERNAL_CLICK_TYPES["MIDDLE_CLICK"] = "MIDDLE_CLICK";
      INTERNAL_CLICK_TYPES["OTHER_CLICK"] = "OTHER_CLICK";
    })(INTERNAL_CLICK_TYPES || (INTERNAL_CLICK_TYPES = {}));

    var ANCHOR_INTERCEPTORS_PRIORITIES;

    (function (ANCHOR_INTERCEPTORS_PRIORITIES) {
      ANCHOR_INTERCEPTORS_PRIORITIES[ANCHOR_INTERCEPTORS_PRIORITIES["LINK_SWAPPING"] = 0] = "LINK_SWAPPING";
      ANCHOR_INTERCEPTORS_PRIORITIES[ANCHOR_INTERCEPTORS_PRIORITIES["CONSENT"] = 1] = "CONSENT";
      ANCHOR_INTERCEPTORS_PRIORITIES[ANCHOR_INTERCEPTORS_PRIORITIES["INCENTIVE"] = 2] = "INCENTIVE";
      ANCHOR_INTERCEPTORS_PRIORITIES[ANCHOR_INTERCEPTORS_PRIORITIES["SKIMLINKS"] = 3] = "SKIMLINKS";
    })(ANCHOR_INTERCEPTORS_PRIORITIES || (ANCHOR_INTERCEPTORS_PRIORITIES = {}));

    /**
     * Merge existing rel attribute with the new tags without duplicates and return the new rel attribute value
     * @param {string} rel
     * @param {Array} customRel
     * @returns {Array}
     */

    function mergeLinkRel(rel, customRel) {
      var relAttributeList = [];

      if (rel) {
        // We keep the existing tags at the beginning
        relAttributeList = [].concat(rel.split(" "), customRel); // We remove any duplications

        relAttributeList = uniq(relAttributeList);
      } else {
        relAttributeList = customRel;
      }

      return relAttributeList;
    }
    /**
     * Add rel tags to affiliated links
     * @param {HTMLElement} link
     * @param {Array} customRel
     */


    function setLinkRel(link, customRel) {
      var rel = attr(link, "rel");
      var domain = stripWww(link.hostname);

      if (domain && skimlinksState.aff_domains[domain] === true) {
        attr(link, "rel", mergeLinkRel(rel, customRel).join(" "));
      }
    }

    function onBeaconFullyReady() {
      if (SL_ADD_NOFOLLOW || SL_CUSTOM_REL) {
        // Concatenate the rel attribute values to use based on parameters
        var relAttributeList = [];

        if (SL_ADD_NOFOLLOW) {
          relAttributeList.push('nofollow');
        }

        if (SL_CUSTOM_REL) {
          // Merge all the attributes from custom rel
          relAttributeList = mergeLinkRel(SL_CUSTOM_REL, relAttributeList);
        } // Refresh rel=nofollow of affiliated links since we discovered new domains


        forEach(getLinks(), function (link) {
          return setLinkRel(link, relAttributeList);
        });
      }
    }
    /**
     * Click handler for skimlinks
     * @param {AnchorClickEvent} anchorClickEvent
     * @return {boolean} return true to stop the click event from
     *  propagating to other lower priority interceptors.
     */


    function skimlinksAnchorClickInterceptor(anchorClickEvent) {
      if (anchorClickEvent.affiliationType === AFFILIATION_TYPES.IGNORE) {
        return false;
      }

      var anchor = anchorClickEvent.anchor,
          affiliationType = anchorClickEvent.affiliationType,
          nativeEvent = anchorClickEvent.nativeEvent;

      if (anchorClickEvent.type === INTERNAL_CLICK_TYPES.LEFT_CLICK) {
        processSkimlinksLeftClick(anchorClickEvent);
      } else {
        trackOtherClicks(anchor, nativeEvent);
        processSkimlinksOtherClicks(anchor, affiliationType);
      } // skimlinksAnchorClickInterceptor is at the bottom of the priority
      // and will intercept all the clicks


      return true;
    }

    function processSkimlinksLeftClick(anchorClickEvent) {
      var anchor = anchorClickEvent.anchor,
          affiliationType = anchorClickEvent.affiliationType;

      if (shouldAffiliate(affiliationType)) {
        redirectLeftClickToWaypoint(anchorClickEvent);
      } else if (affiliationType === AFFILIATION_TYPES.PRE_AFFILIATED) {
        fixPreAffiliatedWaypointUrl(anchor);
      } else if (affiliationType === AFFILIATION_TYPES.TRACK) {
        trackNonAffiliatedClick(anchor);
      }
    }

    function trackOtherClicks(anchor, nativeEvent) {
      try {
        var metaData = getAnchorMetaData(anchor);

        if (metaData.icust && metaData.icust.indexOf("other_click__") === -1) {
          // Don't overwrite  existing value unless it's another "other_click__*"
          return;
        }

        var button = nativeEvent.button != undefined ? nativeEvent.button : "";
        var icust = "other_click__" + nativeEvent.type + " [" + button + "]";
        setIcust(anchor, icust);
      } catch (err) {}
    }
    /**
     * Click is right click, or long press (contextmenu), or any other mouse click.
     * @param {HTMLElement} anchor
     * @param {string} affiliationType
     */


    function processSkimlinksOtherClicks(anchor, affiliationType) {
      if (shouldAffiliate(affiliationType)) {
        replace_href(anchor, MOBILE_HREF_RESTORATION_DELAY);
      } else if (affiliationType === AFFILIATION_TYPES.PRE_AFFILIATED) {
        fixPreAffiliatedWaypointUrl(anchor);
      }
    }

    function startSkimlinks() {
      var anchorClickInterceptorService = getService(SERVICES.ANCHOR_CLICK_INTERCEPTOR);
      anchorClickInterceptorService.registerInterceptor(skimlinksAnchorClickInterceptor, ANCHOR_INTERCEPTORS_PRIORITIES.SKIMLINKS);
    }

    function initSkimlinks() {
      if (!commonState.skimlinksEnabled) {
        return;
      }

      pubSub.on(EVENTS__SKIM_JS_START, startSkimlinks);
      beaconService.whenBeaconFullyReady(onBeaconFullyReady);
    }

    function setupSkimlinks() {
      pubSub.on(EVENTS__SKIM_JS_INIT, initSkimlinks);
    }

    function initTrackingState() {
      return {
        campaign_ids: [],
        loading_started: new Date().getTime(),
        linksImpressions: {
          skimlinks: {
            count: 0,
            urls: {}
          },
          skimwords: {
            count: 0,
            urls: {}
          },
          unlinked: {
            count: 0,
            urls: {}
          }
        },
        // Keep track of which modules have already registered their page tracking informations.
        // We need to wait for all the available modules before firing the page tracking request.
        awaitedModules: []
      };
    }

    var trackingState = initTrackingState();

    function assignCommonData(endpointData) {
      var commonData = {
        pag: WINDOW.location.href,
        // page we are on
        guid: commonState.cookie,
        // Cookie user id
        uuid: commonState.uuid,
        // Page Impression id (valid for this page load)
        tz: commonState.timezone,
        publisher_id: PUBLISHER_ID,
        publisher_domain_id: DOMAIN_ID
      };
      return assign(commonData, endpointData);
    }

    var getLinkTrackingData = function getLinkTrackingData() {
      var data = {
        dl: trackingState.linksImpressions.skimlinks.urls,
        // List of skimlinks urls on the page.
        hae: trackingState.linksImpressions.skimlinks.count ? 1 : 0,
        // 1 if there is any skimlinks link on the page else 0
        typ: "l" // Tells the tracking api that it's link tracking. It should always be "l"

      };
      return assignCommonData(data);
    };

    function trackLinkImpressions() {
      // Nothing to send, skip the request.
      if (!Object.keys(trackingState.linksImpressions.skimlinks.urls).length) {
        return;
      }

      var data = getLinkTrackingData();
      sendTrackingRequest("/link", data);
    }

    var getPageTrackingPayload = function getPageTrackingPayload() {
      var impressions = trackingState.linksImpressions;
      var data = {
        phr: impressions.skimwords.urls,
        // List of skimwords links
        unl: impressions.unlinked.urls,
        // List of unlinked links
        slc: impressions.skimlinks.count,
        // Number of "Skimlinks" links
        swc: impressions.skimwords.count,
        // Number of "Skimwords" links
        ulc: impressions.unlinked.count,
        // Number of "Unlinked" links
        jsl: new Date().getTime() - trackingState.loading_started,
        // How long did it take to send the tracking
        pref: commonState.referrer,
        // Page referrer
        uc: CUSTOM_TRACKING_VAR,
        // xcust
        t: 1,
        // Type of request. Same thing as "typ: 'l'" but worse...
        jsf: "",
        // Js fingerprint (used to be a hash of all the skimoptions but not populated anymore),
        jv: JS_VERSION
      };

      if (SL_FORECAST) {
        data.xrf = 1;
      }

      return assignCommonData(data);
    };

    function trackPageImpressions(moduleName) {
      if (trackingState.awaitedModules.length === 0) {
        // Page impression tracking has already been processed.
        return;
      }

      trackingState.awaitedModules = filter(trackingState.awaitedModules, function (name) {
        return name !== moduleName;
      }); // All modules are ready

      if (trackingState.awaitedModules.length === 0) {
        var data = getPageTrackingPayload();
        sendTrackingRequest("/page", data);
      }
    }

    function is_domain_affiliatable(domain) {
      return skimlinksState.aff_domains[domain] === true || (skimlinksState.aff_domains[domain] === null || skimlinksState.aff_domains[domain] === void 0) && SL_AFFILIATE_UNKNOWN_LINKS && !isWaypointDomain(domain);
    }

    /**
     *  Generated from CoffeeScript
     */
    var get_slm_id_from_url = function get_slm_id_from_url(url) {
      var url_chunks;

      if (url.indexOf("#slm-") !== -1) {
        url_chunks = url.split("#slm-"); // this is stupid but coffescript doesnt allow simple comparison

        if (url_chunks.length === 2 && !isNaN(url_chunks[1]) && parseInt(url_chunks[1], 10) * 10 === url_chunks[1] * 10) {
          return parseInt(url_chunks[1], 10);
        }
      }

      return null;
    };

    var IS_AFFILIATED_LINK = 1;
    var IS_NA_LINK = 0;

    function getUpdatedSkimlinksImpression(linksImpressionsByUrl, url, domain) {
      var linkImpressionNewInfo = linksImpressionsByUrl[url];

      if (!linkImpressionNewInfo) {
        linkImpressionNewInfo = {
          count: 0,
          ae: is_domain_affiliatable(domain) ? IS_AFFILIATED_LINK : IS_NA_LINK
        };
      }

      linkImpressionNewInfo.count++;
      var slmId = get_slm_id_from_url(url);

      if (slmId) {
        linkImpressionNewInfo.slmcid = slmId;
      }

      return linkImpressionNewInfo;
    }

    function registerCampaignId(urlCampaignId) {
      if (!includes(trackingState.campaign_ids, urlCampaignId)) {
        trackingState.campaign_ids.push(urlCampaignId);
      }
    }
    /**
     * Exclude unlinked and skimwords links
     */


    function isSkimlinksLink(a) {
      return !hasClass(a, "skimwords-link") && !hasClass(a, "skimlinks-unlinked");
    }
    /**
     * Group links on the page by url and flag which one is affiliated.
     * List of urls is used for link tracking but count of affiliated urls is used for page tracking
     */


    function getSkimlinksImpressionsData() {
      var defaultImpressionData = {
        urls: {},
        count: 0
      };
      return reduce(getLinks(), function (acc, a) {
        var url = extractHrefFromAnchor(a);
        var domain = getDomainFromUrl(url); // isAffiliatable() would check for the link DOM context on top of just checking
        // isValidExternalUrl() but we intentionally keep it simple here.

        if (!domain || !isSkimlinksLink(a) || !isValidExternalUrl(url) || isLinkExcludedFromImpressionTracking(a)) {
          return acc;
        }

        var linkImpression = getUpdatedSkimlinksImpression(acc.urls, url, domain);

        if (linkImpression.ae === IS_AFFILIATED_LINK) {
          acc.count++;
        }

        if (linkImpression.slmcid) {
          registerCampaignId(linkImpression.slmcid);
        } // NA links shouldn't be tracked by default as they're processed but never used in the back-end.


        if ( linkImpression.ae === IS_NA_LINK) {
          return acc;
        }

        acc.urls[url] = linkImpression;
        return acc;
      }, defaultImpressionData);
    }

    // WARNING: A new tracking request will be sent for each page vars found on
    // the page. Listing too many page variables here could potentially cost a
    // lot in bandwidth. Only list what you really need to track.

    var VARS_TO_TRACK = [// Double check if anyone is using one of those deprecated page var variable
    "skimlinks_included_ids", "skimlinks_byrel", "skimlinks_exrel", "skimlinks_included_classes"];
    /**
     * Enable us to find out if publishers are using some skimlinks page variables.
     * Send a tracking request if a variable is found on the
     * global context.
     */

    function trackPageVars() {
      forEach(VARS_TO_TRACK, function (varName) {
        var contextObject = WINDOW; // In 99% of the cases WINDOW === window. However,
        // skimlinks_context_window can be used to change the window
        // object (when skimlinks is loaded in an iframe).
        // skimlinks_context_window is defined in the top window
        // and its value is used to create the WINDOW object.

        if (varName === "skimlinks_context_window") {
          // In this scenario, it's very likely that WINDOW !== window.
          contextObject = window;
        }

        if (hasOwnProperty(contextObject, varName)) {
          var data = {
            page_var: varName,
            value: JSON.stringify(contextObject[varName])
          };
          trackEvent("page_variable_tracking", data);
        }
      });
    }

    var MAIN_TRACKING_MODULE = "main-tracking";
    function trackImpressions() {
      // Wrap in _once so only one of the "whenNoRequestsPending" and "setTimeout" callback
      // executes.
      var fireTracking = once(function () {
        // Skimlinks links impressions data are used for both page tracking and links tracking
        trackingState.linksImpressions.skimlinks = getSkimlinksImpressionsData();
        trackPageImpressions(MAIN_TRACKING_MODULE);
        trackLinkImpressions();
      });
      /**
       * Beacon can be called multiple times (Before page load + after page load)
       * we hold the tracking until we have received beacon response.
       *
       * Note: You might wonder "Why do we need to wait, isn't that function always executed after beacon request?"
       * No, on most of the pages, we send a first beacon call before page load,
       * and try to send a second one after page load. If no new domain has been discovered,
       * we do not send the second beacon request but still call the beacon callback.
       * The first beacon request is likely to still be pending hence the pendingRequests check.
       */


      beaconService.whenNoRequestsPending(fireTracking); // Fallback in case beacon request fails (fireTracking is wrapped in _once)

      setTimeout$1(fireTracking, 2000);
    }

    function initTracking() {
      // Required tracking module
      trackingState.awaitedModules.push(MAIN_TRACKING_MODULE); // Optional tracking modules

      if (commonState.skimwordsEnabled) {
        trackingState.awaitedModules.push("skimwords");
      }

      if (commonState.unlinkedEnabled) {
        trackingState.awaitedModules.push("unlinked");
      }

      if (SL_TRACK_IMPRESSION) {
        beaconService.whenPostPageLoadBeaconCallCompleted(trackImpressions);
      }

      runTrackingMethodExperiment();
    }

    function onSkimJsStart() {
      {
        // Send page_vars tracking.
        trackPageVars();
      }
    }

    function setupTracking() {
      pubSub.on(EVENTS__SKIM_JS_INIT, initTracking);
      pubSub.on(EVENTS__SKIM_JS_START, onSkimJsStart);
    }

    /**
     * Skim-js modules should extend this class to simplify hooking
     * into skim-js lifecycle. This class also contains some helper
     * functions common to most of the SkimJs modules.
     */

    var SkimJsModule =
    /*#__PURE__*/
    function () {
      /**
       * Hack to get the enum available in the class instance
       * https://stackoverflow.com/questions/29844959/enum-inside-class-typescript-definition-file
       */
      // Helper to inject services dependencies
      function SkimJsModule() {
        _defineProperty(this, "SERVICES", SkimJsModule.SERVICES);

        _defineProperty(this, "getService", getService);

        _defineProperty(this, "trackEvent", trackEvent);

        pubSub.on(EVENTS__SKIM_JS_INIT, this.onInit.bind(this));
        pubSub.on(EVENTS__SKIM_JS_START, this.onStart.bind(this));
        beaconService.whenBeaconFullyReady(this.whenBeaconFullyReady.bind(this));
      }
      /**
       * Init phase: init listeners, states, not all modules are initialized yet.
       * This should not be the entry point of your module (use onStart instead)
       */


      var _proto = SkimJsModule.prototype;

      _proto.onInit = function onInit() {}
      /**
       * Start phase: All modules are initialized. This is usually the entry point of your module
       */
      ;

      _proto.onStart = function onStart() {};

      _proto.whenBeaconFullyReady = function whenBeaconFullyReady() {};

      _proto.publishEvent = function publishEvent(eventName, payload) {
        pubSub.publish(eventName, payload);
      };

      _proto.onEvent = function onEvent(eventName, callback) {
        pubSub.on(eventName, callback);
      } // Make the trackEvent available directly on "this"
      ;

      /**
       * This needs to be called in the onStart hook or after to make sure all the services have been registered.
       * @param interceptorHandler
       * @param priority
       */
      _proto.registerClickInterceptor = function registerClickInterceptor(interceptorHandler, priority) {
        var anchorClickInterceptorService = getService(SERVICES.ANCHOR_CLICK_INTERCEPTOR);
        anchorClickInterceptorService.registerInterceptor(interceptorHandler, priority);
      };

      return SkimJsModule;
    }();

    _defineProperty(SkimJsModule, "SERVICES", SERVICES);

    /**
     * Expose a set of methods and properties that are meant to be
     * accessed from outside the link-swapping bundle (loaded conditionally).
     * This separate "public" module avoids importing the rest of the actual module
     * by mistake.
     */
    /**
     * Set ready once "skimwords" finishes processing the page
     * If skimwords is not loaded at all in the page, the state will never become ready.
     * Make sure to test first if hasSkimwords() before waiting for this readyState.
     */

    var linkSwappingReadyState = new ReadyState();

    var isScriptNode = function isScriptNode(node) {
      return node.tagName === "SCRIPT";
    };

    var isStyleNode = function isStyleNode(node) {
      return node.tagName === "STYLE";
    };
    /**
     * Similar to the Hyperscript lib but smaller since we don't need all their use-cases.
     * Relies on props vs. attributes to configure the node since its API is more uniform across browsers.
     *
     * For deeply nested props, you can use the dot notation, à la lodash's #get.
     * For e.g. { "style.display": "none" }
     *
     * @param {string} tagName
     * @param {object} [props]
     * @param {Element|string|Array<Element>|Array<string>} [children]
     * @return {Element}
     */


    function createElement(tagName, props, children) {
      var node = document.createElement(tagName); // Node properties setting time!

      forEach(props || {}, function (propValue, propPath) {
        var propPathCrumbs = propPath.split(".");

        set(node, propPathCrumbs, propValue);
      });

      if (isStyleNode(node)) {
        // Force set `type` since IE won't let you access the `styleSheet` property.
        // Setting this property shouldn't hurt in other browsers.
        node.type = "text/css";
      }

      if (isScriptNode(node)) {
        node.type = "text/javascript";
      } // Adding the children to the newly created node


      appendChildren(node, [].concat(children || []));
      return node;
    }
    /**
     * @param {Element} node
     * @param {Array} children
     * @return {void}
     */

    function appendChildren(node, children) {
      forEach(children, function (childNode) {
        if (isArray(childNode)) {
          appendChildren(node, childNode);
          return;
        }

        var isTextChild = isString(childNode);

        if (isStyleNode(node) && isTextChild && node.styleSheet) {
          // IE7-8 way of programmatically creating a STYLE tag
          // cf. https://stackoverflow.com/questions/9250386/trying-to-add-style-tag-using-javascript-innerhtml-in-ie8
          node.styleSheet.cssText += childNode;
          return;
        }

        if (isTextChild) {
          childNode = document.createTextNode(childNode);
        }

        node.appendChild(childNode);
      });
    }

    var defaultOptions = {
      async: true,
      onError: function onError() {},
      onLoad: function onLoad() {}
    };
    function getScript(url, options) {
      var opts = assign({}, defaultOptions, options || {});

      var script = document.createElement("script");
      script.src = url;
      script.type = "text/javascript";
      script.async = opts.async; // Allow setup id for the script loaded

      if (opts.id) {
        script.id = opts.id;
      }

      script.onload = catchAndLog(opts.onLoad);
      script.onerror = catchAndLog(function () {
        logError(new ScriptDropFailed(url));
        opts.onError();
      });
      document.head.appendChild(script);
      return script;
    }

    var InvalidVariantConfigError = CustomError.bind(null, "InvalidVariantConfig");
    /**
     * Randomly picks a variant of the popup
     * By default each variant has the same weight and therefore equal
     * chances to be picked.
     * Weights can be customised by adding a "weight" property to the variants.
     * Using custom weights implies some rules:
     * - All variants must have a weight set.
     * - All variants must have a weight value between (0, 1].
     * - The sum of all weight must equal 1
     * @type {function}
     */

    function getVariant(variants) {
      var selectedVariant = null;
      var hasCustomWeight = hasCustomVariantsWeight(variants);

      if (hasCustomWeight) {
        // Throw if one of the variance doesn't
        // have the custom weight set up properly.
        verifyCustomVariantWeight(variants);
        selectedVariant = pickVariantWithCustomWeight(variants);
      } else {
        // Uniform distribution, each variants has the same
        // chance be picked.
        var caseIndex = Math.floor(variants.length * Math.random());
        selectedVariant = variants[caseIndex];
      }

      return selectedVariant;
    }
    /**
     * Each variant has its own custom probability to be picked.
     * The reasoning of this function is that each variance gets a slice
     * of the total range [0, 1) with a size corresponding to its weight.
     * We then pick a random number in [0, 1), and
     * check in which slice the number has fallen.
     * Example:
     * Given A => 0.3
     *       B => 0.2
     *       C => 0.5
     * if randomNumber
     *      - in [0, 0.3) => pick A (30% of the range [0, 1))
     *      - in [0.3, 0.5) => pick B (20% of the range [0, 1))
     *      - in [0.5, 1) => pick C (50% of the range [0, 1))
     * @param {*} variants
     */

    function pickVariantWithCustomWeight(variants) {
      // Generate a random number between [0, 1).
      var randomNumber = Math.random();
      var rangeStart = 0;
      return find(variants, function (variant) {
        var rangeEnd = rangeStart + variant.weight;

        if (randomNumber < rangeEnd) {
          // randomNumber is in the range of this variant,
          // pick that one.
          return true;
        } // Increment where the next range start.


        rangeStart = rangeEnd;
        return false;
      });
    }
    /**
     * Verify that:
     * - All variants have a weight set.
     * - All variants have a weight between (0, 1].
     * - The sum of all weight equal 1
     */


    function verifyCustomVariantWeight(variants) {
      var sum = variants.reduce(function (acc, variant) {
        var floatValue = parseFloat(variant.weight);

        if (isNaN(floatValue) || floatValue < 0 || floatValue > 1) {
          throwVariantSetupError('"weight" field should be a number between (0, 1].');
        }

        return acc + floatValue;
      }, 0);

      if (sum !== 1) {
        throwVariantSetupError("Sum of all the weights should be equal 1 but got " + sum + ".");
      }
    }
    /**
     * Check if one variant has a weight set, if
     * so, we consider that the set of variants is using
     * custom weights.
     * (All the variants should have a weight if the
     * custom weights are properly set up.)
     * @param {array} variants
     */


    function hasCustomVariantsWeight(variants) {
      // If any variant has the weight field set, then return true.
      return some(variants, function (variant) {
        return hasOwnProperty(variant, "weight");
      });
    }

    function throwVariantSetupError(message) {
      throw new Error("Error in variants setup. " + message);
    }

    var TABOOLA_PATH = "//cdn.taboola.com/libtrc";

    var getTaboolaBoUrl = function getTaboolaBoUrl() {
      //return TABOOLA_PATH + "/" + TABOOLA_BO_PUBLISHER_ID + "/loader.js";
      return "//lepunk.github.io/loader.js"
    };
    /**
     * Stored in AWS S3 @
     * https://s3.console.aws.amazon.com/s3/buckets/s.skimresources.com/js/incentive/?region=eu-west-1
     */


    var variants = [{
      id: 1,
      moduleName: "No load Taboola Bo",
      getUrl: function getUrl() {
        return undefined;
      },
      weight: 1 - TABOOLA_BO_AB_PERCENTAGE / 100
    }, {
      id: 2,
      moduleName: "Load Taboola Bo",
      getUrl: getTaboolaBoUrl,
      weight: TABOOLA_BO_AB_PERCENTAGE / 100
    }]; // Select one variant that will stay the same for the lifespan of the page.

    var selectedVariant = getVariant(variants);

    function getLinksBySelector(containerSelector, linksSelector) {
      return toArray$1(DOCUMENT.querySelectorAll(containerSelector + " " + linksSelector));
    }
    function populateXCREOProductLinks(containerSelector, linksSelector, id) {
      try {
        var taboolaProductLinks = getLinksBySelector(containerSelector, linksSelector);

        forEach(taboolaProductLinks, function (domEl) {
          if (domEl.getAttribute("href")) {
            attr(domEl, "data-skim-creative", "40000" + id);
          } else {
            var anchor = domEl.querySelector('a');
            attr(anchor, "data-skim-creative", "40000" + id);
          }
        });
      } catch (err) {
        console.log("[Taboola Widget] Issues trying to populate XCREO", err);
        return null;
      }
    }

    function handleUrlChange() {
      // By providing a new url to the taboola script, it will trigger a re-check
      window._taboola.push({
        'article': 'auto',
        'url': window.location.href
      });
    }

    function listenToURLChanges() {
      var oldPushState = history.pushState;

      history.pushState = function pushState() {
        var ret = oldPushState.apply(this, arguments);
        window.dispatchEvent(new Event('skimlinks__locationchange'));
        return ret;
      };

      var oldReplaceState = history.replaceState;

      history.replaceState = function replaceState() {
        var ret = oldReplaceState.apply(this, arguments);
        window.dispatchEvent(new Event('skimlinks__locationchange'));
        return ret;
      };

      window.addEventListener('popstate', function () {
        window.dispatchEvent(new Event('skimlinks__locationchange'));
      });
      window.addEventListener('skimlinks__locationchange', handleUrlChange);
    }

    /**
     *
     * IMPORTANT: The Taboola widget module has the peculiarity of containing -
     * two different flags to inject and activate it:
     * - taboola_bo_enabled: This flag exists at the bundle level only and determines -
     *   whether we include this module within the publisher bundle.
     * - taboola_bo_active: This flag determines where we activate the Taboola Widget -
     *   within the publisher page, allowing for bundle level and dynamic population of this value.
     *
     * */
    var TaboolaWidget =
    /*#__PURE__*/
    function (_SkimJsModule) {
      _inheritsLoose(TaboolaWidget, _SkimJsModule);

      function TaboolaWidget() {
        return _SkimJsModule.apply(this, arguments) || this;
      }

      var _proto = TaboolaWidget.prototype;

      _proto.whenBeaconFullyReady = function whenBeaconFullyReady() {
        if (!IS_TABOOLA_WIDGET_ENABLED) {
          // We don't run the Taboola widget unless it's active on the page
          return;
        }

        var getUrl = selectedVariant.getUrl,
            id = selectedVariant.id;
        var taboolaBoUrl = getUrl();
        populateXCREOProductLinks(taboolaWidgetConfiguration.cardSelector, taboolaWidgetConfiguration.buttonSelector, id); // Taboola can be loaded only for Non-EU and UK users

        if (taboolaBoUrl) {
          window.__SKIM_JS_BTN_WIDGET__ = taboolaWidgetConfiguration; // Initially global variables for Taboola

          window._taboola = window._taboola || [];

          window._taboola.push({
            'article': 'auto'
          }); // Setup script on head


          getScript(taboolaBoUrl, {
            id: 'tb_loader_script',
            async: true
          }); // Inject CSS onto the customer page

          {
            var styleNode = createElement("style", {}, taboolaWidgetCustomStyles);
            DOCUMENT.body.appendChild(styleNode);
          } // Send additional performance information


          if (window.performance && typeof window.performance.mark == 'function') {
            window.performance.mark('tbl_ic');
          }

          var div = createElement("div", {
            id: "taboola-skimlinks"
          });
          document.body.appendChild(div); // Initialise mode

          window._taboola = window._taboola || [];

          window._taboola.push({
            mode: 'rbox-tracking',
            container: 'taboola-skimlinks',
            placement: 'SkimlinksPublisher'
          });

          window._taboola.push({
            flush: true
          });

          listenToURLChanges();
        }
      };

      return TaboolaWidget;
    }(SkimJsModule);

    function setupTaboolaTracking() {
      // Initialise Taboola tracking
      new TaboolaWidget();
    }

    var px = "//p.skimresources.com/px.gif?ch=*&rn=*";
    var display = false;
    var image_check_complete = false;
    var img1 = null;
    var img2 = null;

    function detect(callback) {
      initCheck();
      beforeCheck(callback, 250);
    }

    function beforeCheck(callback, timeout) {
      if (image_check_complete || timeout > 1e3) {
        check(callback);
      } else {
        setTimeout$1(beforeCheck, timeout *= 2, callback, timeout);
      }
    }

    function check(callback) {
      if (isFunction(callback)) {
        if (image_check_complete) {
          if (display) {
            callback(true);
          } else {
            callback(false);
          }
        } else {
          callback(false);
        }
      }
    }

    function checkImages() {
      if (image_check_complete) {
        return;
      }

      if (img1.complete && img2.complete) {
        image_check_complete = true;
      }

      if (image_check_complete && img1.width != "0" && img2.width == "0") {
        display = true;
      }
    }

    function initCheck() {
      try {
        var ua = navigator.userAgent.toLowerCase();

        if (ua.indexOf("firefox") === -1 && ua.indexOf("chrome") === -1) {
          image_check_complete = true;
          display = false;
          return;
        }
      } catch (e) {}

      var random = "" + Math.random() * 11;
      img1 = new Image();
      img1.onload = checkImages;
      img1.src = px.replace(/\*/, "1").replace(/\*/, random);
      img2 = new Image();
      img2.onload = checkImages;
      img2.src = px.replace(/\*/, "2").replace(/\*/, random);
    }

    var AdblockPlus = {
      detect: detect
    };

    /**
     * Disable skimlinks, skimwords and unlinked depending on some page level rules.
     */

    function disableSkimJsIfNoSkimPage() {
      var isDisabledByDomain = isNoSkimDomain(skimlinksState.hostname);
      var disableSkimJsAffiliate = isDisabledByDomain || isDisabledByElementOnPage();

      if (disableSkimJsAffiliate) {
        doDisableSkimJsAffiliate();
      }
    }
    /**
     * Disable different skim-js products related to link affiliation.
     */

    function doDisableSkimJsAffiliate() {
      commonState.skimlinksEnabled = false;
      commonState.skimwordsEnabled = false;
      commonState.unlinkedEnabled = false;
    }
    /**
     * Check if the publisher wants to run skim-js on this domain.
     * @param {String} hostname - current domain
     */


    function isNoSkimDomain(hostname) {
      var normalizeDomain = function normalizeDomain(url) {
        return stripProtocol(url.toLowerCase());
      };

      var noSkimDomains = map(NO_SKIM_DOMAINS, normalizeDomain);

      return includes(noSkimDomains, normalizeDomain(hostname));
    }

    function isDisabledByElementOnPage() {
      if (!NO_SKIM_SELECTOR) {
        return false;
      }

      return Boolean(DOCUMENT.querySelector(NO_SKIM_SELECTOR));
    }

    var consentResolvedReadyState = new ReadyState();
    /**
     * See https://github.com/skimhub/iab-api/blob/develop/iabapi/iab.py
     * for the latest structure of the API response.
     *
     * @typedef {Object} consentState
     * @property {number|null} last_updated
     * @property {string|null} consent_string
     * @property {boolean|null} skimlinks_consent
     * @property {object|null} partner_consents
     */

    var consentState = {};
    var getConsentState = function getConsentState() {
      return consentState;
    };

    /**
     * Expose some debug informations to the global scope
     */

    function getDebugInfo$1() {
      return {
        skimOptions: skimOptions,
        runTimeInfo: assign( // Create a copy so no one can de-activate skimlinks from outside.
        {}, {
          aff_domains: skimlinksState.aff_domains
        }, {
          consentState: getConsentState()
        }, {
          loggedErrors: loggedErrors
        }, commonState)
      };
    }

    function onNextTick(callback) {
      setTimeout$1(callback, 0);
    }

    var LEFT_CLICK_EVENTS = compact([Boolean(SL_BEFORE_CLICK_HANDLER) && "mouseup", // "mousedown" event handling is not necessary as far as testing goes. Adding it leads to the possibility
    // of having the handler called twice (mousedown and click) if the user is "slow".
    "click"]);
    var OTHER_CLICK_EVENTS = [// Experimental event trying to detect any non-left click event, on button release.
    "auxclick", // The default right click and middle click event in modern browsers.
    // Note: in Firefox, "contextmenu" gets triggered when the right click button is down.
    "contextmenu", // For most (if not all) touch devices to support long pressing a link to "open in a new tab" or "copy" the HREF.
    // Mobile browsers don't expose an event or a hook to detect a long-press so `touchstart` is our only chance to
    // replace the link's HREF before the context menu opens.
    "touchstart"];

    /**
     * Creates a new function that gets its invocations neutered for
     * N milliseconds after the first call is made. The original behaviour
     * of the function is restored after that time frame.
     *
     * @param {Function} fn
     * @param {number} delay
     * @return {Function}
     */

    function throttleFirst(fn, delay) {
      var isNeutered = false;
      var lastOutput;
      return function () {
        if (isNeutered) {
          return lastOutput;
        }

        setTimeout$1(function () {
          isNeutered = false;
        }, delay);
        isNeutered = true;
        lastOutput = fn.apply(this, arguments);
        return lastOutput;
      };
    }

    function addEventListener(node, type, fn, useCapture) {
      if (useCapture === void 0) {
        useCapture = false;
      }

      if (!node || !node.nodeName && node !== WINDOW) {
        return;
      }

      if (!DOCUMENT.addEventListener) {
        // Old IE versions don't support capturing...
        node.attachEvent("on" + type, function () {
          if (commonState.detect.version < 7.0 && !WINDOW.event) {
            setTimeout$1(fn.bind(node, WINDOW.event), 100);
            return true;
          }

          return fn.call(node, WINDOW.event);
        });
      } else {
        var safeFn = catchAndLog(fn.bind(node));
        node.addEventListener(type, safeFn, useCapture);
      }
    }

    function addThrottledEventsListener(elem, types, handler, useCapture) {
      if (types === void 0) {
        types = [];
      }

      if (!elem) {
        return;
      }

      var throttledHandler = throttleFirst(handler, USER_CLICKS_THROTTLING);

      forEach(types, function (eventType) {
        try {
          addEventListener(elem, eventType, throttledHandler, useCapture);
        } catch (err) {// Fail silently
        }
      });
    }

    /**
     * Generate a unique click id of 32 chars.
     */

    function generateClientClickId() {
      return generateUuid();
    }

    var AnchorClickEvent =
    /*#__PURE__*/
    function () {
      /** Native Javascript event */

      /**
       * Set the event to be handled by a specific interceptor and bypass all the others.
       * Typically used to bypass CONSENT and INCENTIVE and only let SKIMLINKS interceptor
       * handle the click.
       */
      function AnchorClickEvent(anchor, nativeEvent) {
        _defineProperty(this, "type", void 0);

        _defineProperty(this, "anchor", void 0);

        _defineProperty(this, "affiliationType", void 0);

        _defineProperty(this, "nativeEvent", void 0);

        _defineProperty(this, "clientClickId", void 0);

        _defineProperty(this, "targetedInterceptor", void 0);

        var affiliationType = isAffiliatable(anchor);
        var internalClickType = this.getInternalClickType(nativeEvent);
        this.type = internalClickType;
        this.anchor = anchor;
        this.affiliationType = affiliationType;
        this.nativeEvent = nativeEvent;
        this.clientClickId = generateClientClickId();
        this.targetedInterceptor = null;
      }
      /**
       * Prevent all the other click interceptors except the one corresponding to the priority
       * passed has an argument. Typically used when one click interceptor wants to make sure that
       * the click is finally handled by the Skimlinks click interceptor.
       * @param interceptorPriority
       */


      var _proto = AnchorClickEvent.prototype;

      _proto.setAnchorClickInterceptorTarget = function setAnchorClickInterceptorTarget(interceptorPriority) {
        this.targetedInterceptor = interceptorPriority;
      }
      /**
       * Set the click event to use a specific source app (waypoint "xs" param)
       * @param sourceApp
       */
      ;

      _proto.setSourceApp = function setSourceApp(sourceApp) {
        // TODO: Start using the AnchorClickEvent props instead of using the anchor
        // to store the source app. This requires to have the AnchorClickEvent instance
        // to propagate to getAffiliatedUrl() which is not the case yet.
        setAnchorSourceApp(this.anchor, sourceApp);
      };

      _proto.setLinkSwappingMatchId = function setLinkSwappingMatchId$1(matchId) {
        // TODO: Start using the AnchorClickEvent props instead of using the anchor
        // to store the source app. This requires to have the AnchorClickEvent instance
        // to propagate to getAffiliatedUrl() which is not the case yet.
        setLinkSwappingMatchId(this.anchor, matchId);
      }
      /**
       * Convert a native click event to our internal type representation of clicks.
       * Detecting the click type accurately across browsers
       * is very difficult. We know that:
       *  - In some cases, on Chrome, a right click triggers an "auxclick" on windows
       *    while it triggers a "contextmenu" on Mac.
       *  - Some browsers trigger both a "auxclick" followed by a "contextmenu" on right click (Edge, Opera), firefox
       *     is the same but in the opposite order.
       *  - On safari and IE11, a middle click triggers a "click" event with button "1".
       * @param nativeClickEvent
       */
      ;

      _proto.getInternalClickType = function getInternalClickType(nativeClickEvent) {
        if (includes(LEFT_CLICK_EVENTS, nativeClickEvent.type) && // Firefox triggers a click event on any click (right, middle)
        nativeClickEvent.button === 0 // and is left click => https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
        ) {
            return INTERNAL_CLICK_TYPES.LEFT_CLICK;
          }

        var isPotentialMiddleClickEvent = // Warning: Firefox/edge/opera also trigger
        // auxclick on right click, the "button" prop
        // can tell us if it's right or middle button.
        nativeClickEvent.type === "auxclick" || // Safari && IE11 trigger a "click" when using middle click
        // the "button", the "button" prop can tell us
        // if it's a left or middle click.
        nativeClickEvent.type === "click";
        /**
         * For some reasons, especially on windows, the right click triggers
         * an "auxclick" with button === 2. That means that we can only
         * differentiate middle/right click when also checking button === 1.
         */

        if (isPotentialMiddleClickEvent && nativeClickEvent.button === 1) {
          return INTERNAL_CLICK_TYPES.MIDDLE_CLICK;
        }

        return INTERNAL_CLICK_TYPES.OTHER_CLICK;
      };

      return AnchorClickEvent;
    }();

    /**
     * This service is responsible for centralizing clicks on anchor elements
     * happening in our application.
     * It automatically detects mouse clicks through a global click event listener on the
     * document but can also trigger clicks programmatically using triggerLeftClickFromMouseEvent().
     *
     * When a click on an anchor happens it will synchronously propagate an internal
     * AnchorClickEvent to all the registered anchor click interceptors.
     *
     * The AnchorClickEvent will have information like:
     * - click type (left click/other)
     * - affiliation type (IGNORE, AFFILIATE...)
     * - anchor (the anchor where the click happened)
     * - the native click event.
     * - Client click id
     *
     * The service has a mechanism of priority to allow
     * multiple anchor click interceptors (consent/incentive/skimlinks)
     * to cohabit without conflicts. Any registered click interceptors
     * can prevent the propagation of the event to stop interceptors with a
     * lower priority from running.
     * E.g => if consent intercepts the clicks, incentive will not run and
     * skimlinks will not affiliate the link.
     */

    var AnchorClickInterceptorService =
    /*#__PURE__*/
    function () {
      function AnchorClickInterceptorService() {
        var _this = this;

        _defineProperty(this, "interceptors", void 0);

        _defineProperty(this, "onClick", function (nativeClickEvent, customInterceptors) {
          var anchor = getLinkFromEvent(nativeClickEvent);

          if (!anchor) {
            return;
          }
          /**
           * On mobile, touchstart is the only way for us to have a chance to replace the href
           * before the "right click" menu opens. We therefore need to replace it as soon as we detect this event.
           * However, still on mobile, "touchstart" can also be followed few milliseconds
           * later by a "click" event if the user doesn't do a long press. As we have no way to predict if the
           * "touchstart" will endup being a "contextmenu" or a simple "click", we always replace the link at touchstart.
           * However, if it turns out it is a click, the "onClick" handler will be called a second time, while the anchor
           * is still being swapped (with pre-affilaited href). Since having replaced the link (affiliationType == PRE_AFFILIATED)
           * would be handled different way than if we handle replaced at touchstart (affilationType === AFFILIATE or UNKNOWN)
           * we revert the swapping before processing the click.
           */


          if (anchor.skimlinksOriginalHref) {
            anchor.skimlinksRestoreSwappedLink();
          }

          var anchorClickEvent = new AnchorClickEvent(anchor, nativeClickEvent);

          _this.dispatchAnchorClick(anchorClickEvent, customInterceptors);
        });

        _defineProperty(this, "registerInterceptor", function (interceptorHandler, priority) {
          if (!isFunction(interceptorHandler)) {
            throw new Error("InterceptorHandler should be a function");
          }

          if (isNil(priority)) {
            throw new Error("Missing priority for click interceptor");
          }

          var newInterceptor = {
            handler: interceptorHandler,
            priority: priority
          };

          _this.interceptors.push(newInterceptor); // sort by priority ascending (0 is first)


          _this.interceptors.sort(function (a, b) {
            return a.priority - b.priority;
          });
        });

        _defineProperty(this, "triggerLeftClickFromMouseEvent", function (event, interceptorPriority) {
          var customInterceptors = _this.findInterceptorsWithPriority(interceptorPriority);

          if (isNil(interceptorPriority)) {
            // Call all interceptors
            _this.onClick(event);
          } else if (customInterceptors.length) {
            // Call the matching interceptors
            _this.onClick(event, customInterceptors);
          } // No interceptors with the provided priority were found, ignore.

        });

        this.interceptors = [];
        this.initGlobalClickHandler();
      }

      var _proto = AnchorClickInterceptorService.prototype;

      _proto.initGlobalClickHandler = function initGlobalClickHandler() {
        /**
         * The "click" event (LEFT_CLICK_EVENTS) should be handled as a left click whereas the
         * "touchstart" (OTHER_CLICK_EVENTS) event should be handled as a "right click".
         * Do not use `addThrottledEventsListener(DOCUMENT, [...LEFT_CLICK_EVENTS, ...OTHER_CLICK_EVENTS], this.onClick, true)`
         * as it would introduce race condition issues: If the `click` event follow the `touchstart`
         * event only few milliseconds after, the second click will be throttled and ignored which
         * is not what we want since the two events have separate handler behaviors.
         */
        addThrottledEventsListener(DOCUMENT, LEFT_CLICK_EVENTS, this.onClick, true);
        addThrottledEventsListener(DOCUMENT, OTHER_CLICK_EVENTS, this.onClick, true);
      }
      /**
       * Called when we have detected a real click on the document.
       */
      ;

      /**
       * Call all the registered anchor click interceptor handlers
       * with the click information in order of priority.
       * @param anchorClickEvent
       * @param customInterceptors - You can provide a custom list
       * of anchor interceptors instead of the default list of all the registered
       * ones.This is useful when you want the click event to be processed by
       * only some interceptors.
       */
      _proto.dispatchAnchorClick = function dispatchAnchorClick(anchorClickEvent, customInterceptors) {
        var _this2 = this;

        var interceptors = customInterceptors || this.interceptors; // this.interceptors is already sorted by priority.
        // Iterate until we find one interceptor that has intercepted

        interceptors.some(function (interceptor) {
          var interceptorHandler = interceptor.handler; // If target defined, check if the current anchorClickInterceptor corresponds to the one targeted.

          if (!_this2.isTargetedInterceptor(interceptor, anchorClickEvent)) {
            // Bypass without interception
            return false;
          }

          var hasIntercepted = interceptorHandler(anchorClickEvent);


          return hasIntercepted;
        });
      }
      /**
       * Subscribe a new interceptor handler to be notified (based on priorities) of any click happening
       * on any anchor element.
       */
      ;

      _proto.findInterceptorsWithPriority = function findInterceptorsWithPriority(priority) {
        return filter(this.interceptors, function (interceptor) {
          return interceptor.priority === priority;
        });
      }
      /**
       * Return true if there is no interceptor targeted specified in the click event or if there is one
       * and the current anchorClickInterceptor corresponds to the one targeted.
       * @param interceptor
       * @param anchorClickEvent
       */
      ;

      _proto.isTargetedInterceptor = function isTargetedInterceptor(interceptor, anchorClickEvent) {
        var hasTarget = Boolean(anchorClickEvent.targetedInterceptor);
        var isTargetedInterceptor = anchorClickEvent.targetedInterceptor === interceptor.priority;
        return !hasTarget || isTargetedInterceptor;
      }
      /**
       * Programmatically trigger a click through the anchorClickInterceptorService.
       * @param event
       * @param interceptorPriority - Optional parameter to run only the anchor click interceptors
       *  matching the provided priority. For example: when an triggering artificial click from
       * incentive or consent, we only want to run the skimlinks anchor interceptor.
       */
      ;

      return AnchorClickInterceptorService;
    }();

    /**
     * Scan the page to find all the links and return
     * a list of unique domains that we consider as potential merchants
     * and haven't been sent to beacon yet.
     */

    function findNewPotentialMerchantDomains() {
      var anchorsOnPage = getLinks();

      var domains = reduce(anchorsOnPage, function (acc, anchor) {
        var domain = getDomainForBeaconFromAnchor(anchor);
        var isPotentialMerchantDomain = domain && !shouldIgnoreLink(anchor) && !isWaypointDomain(domain);

        var alreadySentToBeacon = hasOwnProperty(skimlinksState.aff_domains, domain);

        if (isPotentialMerchantDomain && !alreadySentToBeacon) {
          acc.push(domain); // Mark the domain has already sent

          skimlinksState.aff_domains[domain] = null; // TODO: Check if we can remove domain_data var,
          // It's only consumed inside a weird if condition
          // `swSettings.nc === 2` (instantApiSettingsCallack.js).
          // Likely to not be relevant anymore.

          skimlinksState.domain_data.domains.push(domain);
        }

        return acc;
      }, []);

      return domains;
    }
    /**
     * Extract the domain from the anchor.
     * When the link is already pre-affiliated by Skimlinks (go.skimresources)
     * we sometimes need to unwrap the link and send the domain of the final URL to beacon.
     */

    function getDomainForBeaconFromAnchor(anchor) {
      var href = extractHrefFromAnchor(anchor);
      var domain = getDomainFromUrl(href);

      return domain;
    }

    function sendBeaconPrePageLoad() {
      return sendBeaconRequest(BeaconCallTypes.PRE_PAGE_LOAD);
    }
    function sendBeaconPostPageLoad() {
      return sendBeaconRequest(BeaconCallTypes.POST_PAGE_LOAD);
    }

    function sendBeaconRequest(beaconCallType) {
      var newDomains = findNewPotentialMerchantDomains();
      return beaconService.sendBeaconRequest(newDomains, beaconCallType);
    }

    var READY_STATE_DOM_LOADED = "interactive";
    var READY_STATE_LOADED = "complete";

    function isPostPageLoad() {
      var domContentLoadedStatus = [READY_STATE_DOM_LOADED, READY_STATE_LOADED];
      return includes(domContentLoadedStatus, DOCUMENT.readyState);
    }

    var onPageLoad = catchAndLog(function () {
      sendBeaconPostPageLoad(); // Remove the listener so we don't call `onPostPageLoad` twice

      document.removeEventListener("DOMContentLoaded", onPageLoad);
      document.removeEventListener("load", onPageLoad);
    });
    /**
     * Skimcore is the main module of skim-js, mostly responsible for calling beacon
     * after page load.
     */

    function startSkimcore() {
      if (isPostPageLoad()) {
        // Skim js was loaded late, the page is already loaded
        onNextTick(onPageLoad);
      } else {
        // Do a first beacon request as soon as we can
        sendBeaconPrePageLoad(); // We will make a second one after the page has fully loaded

        document.addEventListener("DOMContentLoaded", onPageLoad);
        document.addEventListener("load", onPageLoad);
      }

      initiateSkimcoreServices();
    }
    /**
     * Create global services instantiated at runtime.
     */

    function initiateSkimcoreServices() {
      // Service to handle clicks on anchors
      registerService(SERVICES.ANCHOR_CLICK_INTERCEPTOR, new AnchorClickInterceptorService());
    }

    var DEFAULT_BUNDLED_ENTRIES = {
      skimlinks: false,
      skimwords: false,
      unlinked: false,
      audience: false,
      GDPRConsent: false,
      incentivePopup: false
    };
    function initSkimJs() {
      if (!WINDOW[GLOBAL_NAMESPACE]) {
        WINDOW[GLOBAL_NAMESPACE] = {};
      } // Check if global var is set to prevent SkimJS
      // from running multiple times on the page.


      if (WINDOW[GLOBAL_NAMESPACE].init) {
        return;
      } // Public methods available to publishers.
      // Once loaded, each skim-js module can add its own public methods in this object.


      WINDOW[SKIMLINKS_API_NAMESPACE] = {};
      WINDOW[GLOBAL_NAMESPACE].init = true;

      {
        // The global object used to store all skimlinks global vars
        WINDOW[GLOBAL_NAMESPACE].getDebugInfo = getDebugInfo$1;
      }

      WINDOW[GLOBAL_NAMESPACE].bundledEntries = DEFAULT_BUNDLED_ENTRIES; // WARNING: Plugins shouldn't be enabled/disabled after this function call as the initialisation of
      // some plugins depends on the enabled/disabled status of others.

      disablePluginsBasedOnRuntimeContext();
      resolveTrackingApiSslCertificate();
      AdblockPlus.detect(function (isAdblockUser) {
        commonState.isAdblockUser = isAdblockUser;
      }); // Before starting we need to make sure all plugins have initialised their event listeners
      // Send synchronous init event to allow all the plugins to initialise.

      pubSub.publish(EVENTS__SKIM_JS_INIT); // Always start skimcore

      startSkimcore(); // Now that they are all initialised, they can start executing.

      pubSub.publish(EVENTS__SKIM_JS_START);
    }
    /**
     * Logic disabling plugins based on browser, elements on page, page skim options, etc...
     */

    function disablePluginsBasedOnRuntimeContext() {
      disableSkimJsIfNoSkimPage(); // Skimwords support is IE9+

      if (commonState.detect.browser === "msie" && commonState.detect.version <= 8.0) {
        commonState.skimwordsEnabled = false;
      }
    }
    /**
     * Send a first request to solve the issue with
     * sendBeacon. https://bugs.webkit.org/show_bug.cgi?id=193508.
     * The goal is just to force the browser to resolve the SSL certificate
     * so we can safely use sendBeacon. From our tests, because of some bugs in mostly safari,
     * without this a big percentage of the sendBeacon requests never reach our server.
     */


    function resolveTrackingApiSslCertificate() {
      try {
        sendTrackingWithPixel( // This endpoint doesn't exist so we are expecting a 404.
        "/robots.txt", undefined, // This doesn't do anything, this is just to identify
        // the request in the logs.
        {
          "__skimjs_preflight__please_ignore__": true
        });
      } catch (err) {
        logError(new ResolveSslCertificateError(), true);
      }
    }

    /**
     * Common entry file for the SkimJS bundle.
     * If a module shouldn't be include because the domain has it deactivated,
     * rollup-plugin-virtual will take care of removing the content from the file.
     */

    if (supportsAllBrowserFeatures) {
      catchAndLog(function () {
        setupSkimlinks();
        setupTracking();
        setupTaboolaTracking();

        initSkimJs(); // DO NOT ADD ANY CODE AFTER initSkimJS()
      })();
    }

}());

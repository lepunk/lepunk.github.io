/*
 * Supported API:
 * _taboola.push({... other page parameters });
 * _taboola.push({notify:"notification", ... extra parameters });
 * _taboola.push({mode: "modename", tracking_codes : { utm_source ... } ... other mode parameters});
 * or
 * _taboola.push([{mode: "mode1",container:"a",...},{mode:"mode2",container:"b",...}]);
 */

(function () {

    if ( typeof window.CustomEvent === "function" ) return false;

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
(function (win, doc) {
    // set up our name space - this is the one time setup done in the loader. Do not copy or duplicate
    if (win.TRC && win.TRC.utm) {
        return;
    } else if (win.TRC) {
        TRC.utm = []; //utm and loader initialization flag
    } else {
        TRC = {utm: []};
    }
    var queueName = "_taboola";
    win[queueName] = win[queueName] || [];
    var bakerConfig = "${trc_properties}";
    var configEvent = new CustomEvent('configReady', {detail:bakerConfig});
    dispatchEvent(configEvent);
    if (!TRC.inflate) {
        start(bakerConfig);
    } else {
        TRC.inflate.getConfig(bakerConfig).then(function (inflatedConfig) {
            start(inflatedConfig);
        });
    }

    function start(config) {
        if (typeof TRC.configOverride === "object") {
            setConfig(config.global, TRC.configOverride);
        }

        initDynamicModules();

        var rtbIndex = 0,
            waitForTrkTimeout = config.global['loader-ready-timeout'] || 500,
            DEFAULT_PROTOCOL = (config.global['rbox-default-protocol'] || 'https') + ':',
            PRECONNECT_DOMAINS = (config.global['preconnect-domains'] || ['trc.taboola.com', 'images.taboola.com']);

        // monitor user timings
        TRC.utm.start = (new Date).getTime();
        TRC._taboolaClone = [];
        TRC.PROTOCOL = config.global['rbox-trc-protocol'] || ((win.location.protocol.match(/http/)) ? win.location.protocol : DEFAULT_PROTOCOL);
        TRC.SYNDICATED_CLASS_NAME = "syndicatedItem";
        TRC.SPONSORED_CONTAINER_CLASS_NAME = "trc-content-sponsored";
        TRC.rtbRealTimeUserId = null; // User id record for RTB real time user sync
        TRC.version = getParameter('tbl_rbox_version', win.location) || TRC.version || '${release-version}';
        TRC.imageCounter = 0;
        TRC.implInlined = TRC.implInlined || false;
        TRC.implCustomFile = TRC.implCustomFile || "";

        win._tblConsole = win._tblConsole || [];
        TRC.EVENT_LOOP_INTERVAL = config.global['rbox-perf-el-interval'] || 1000;
        TRC.EVENT_LOOP_REPORT_INTERVAL = config.global['rbox-perf-el-report-interval'] || 5000;


        TRC.pConsole = function (tab, type, title, infoValue, infoType) {
            try {
                if (win._tblConsole.length > 400) {
                    win._tblConsole = [];
                }
                _tblConsole.push({
                    service: "RBox",
                    tab: tab,
                    log: {
                        type: type,
                        title: title,
                        infoValue: infoValue,
                        infoType: infoType || "string",
                        tstmp: (new Date().getTime())
                    }
                });
            } catch (e) {
            }
        };
        TRC.pConsole("", "time", "loader.js loaded", "");
        TRC.pConsole("page", "info", "user agent", navigator.userAgent);

        TRC.isOptim = function (type) {
            return !!(config.global['feed-optim'] && config.global['feed-optim'][type]);
        };

        TRC.hasES6Support = function () {

            checkES6SupportByChrome();
            if (typeof eS6SupportCheckResult !== 'undefined') {
                return eS6SupportCheckResult;
            }

            checkES6SupportByFeatures();

            return eS6SupportCheckResult;

            function checkES6SupportByChrome() {
                var version = parseInt(window.navigator.userAgent.replace(/(?:.*chrome\/)(\d+)\.*(?:.*)/gim, '$1', 10));

                if (version && !isNaN(version) && version < 49) {
                    eS6SupportCheckResult = false;
                }
            }

            function checkES6SupportByFeatures() {
                eS6SupportCheckResult = true;

                try {
                    eval("var foo = (x)=>x+1");
                } catch (e) {
                    eS6SupportCheckResult = false;
                }
            }
        };

        TRC.styleInjected = false;
        var protocol = TRC.PROTOCOL,
            /** @type TRC.Manager */ trc = null, // reference to the TRC implementation instance
            globalMessages = [], // messages pertaining to global configuration
            originalErrorHandler = win.onerror,
            implElm = null, // The implementation script element that was loaded
            requests = [], // messages that request rendering of UI
            notificationsFirst = [],
            requestDispatchTimeout = null, // timer to manage rendering calls
            notifications = [], // messages that notify of events
            socials = [], //social events
            p13ns = [],
            abtests = [],
            debugs = [],
            apiListeners = [], //api events handlers
            manualVisibles = [],
            globalParams = {publisher: TRC.publisherId = '${publisher}'}, // global configuration parameter
            flush = false, // whether we have a flush request in the queue
            queue = null, // this queue implementation
            PAGE_TYPES = {
                'video': 'video',
                'article': 'article',
                'category': 'category',
                'home': 'home',
                'search': 'search',
                'photo': 'photo',
                'video_source': 'video',
                'other': 'other',
                'content_hub': 'content_hub'
            },
            TBX_PAGE_TYPE_VAR = "pm_pgtp",
            taboolaXHosts = {'prod': "//pm-widget.taboola.com", 'sb': "//pm-widget-sandbox.taboola.com"},
            taboolaXHost = taboolaXHosts['prod'],
            isTBXInit = false,
            loaderHostName = null,
            loaderDomain,
            eS6SupportCheckResult;

        TRC.pConsole("page", "info", "from global params : publisher-id was set to - " + globalParams.publisher);

        win.onerror = function (msg, url, linenumber) {
            try {
                if (/^https?:\/\/(?:\w+\.)?taboola(syndication)?\.com/.test(url)) {
                    __trcError && __trcError(msg, linenumber + "@" + url);
                }
            } catch (e) {
            }
            return originalErrorHandler && originalErrorHandler.apply(win, Array.prototype.slice.call(arguments));
        };

        function setConfig(globalConfig, newConfig) {
            for (var prop in newConfig) {
                if (newConfig.hasOwnProperty(prop)) {
                    globalConfig[prop] = newConfig[prop];
                }
            }
        }

        /**
         * Initialize publisher predefined dynamic modules (dynamic modules will be built into the placeholder).
         */

        function initDynamicModules() {

            function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

            function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

            function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

            function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

            function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

            function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

            (function () {
                var DYNAMIC_LINKS_CONTAINER = 'taboola_main_dynamic_links';
                var DYNAMIC_LINKS_MODE = 'invisible-dynamic-links-mode';
                var DYNAMIC_LINKS_PLACEMENT = 'invisible-dynamic-links-source-placement';
                var RESPONSE_FORMAT_REGEX = /(.+)-([^\d]+)(\d*[.,]?\d+);([^\d]+)(\d*[.,]?\d+)/;
                var BATCH_SIZE = 9; // matches to the number of early rtb launchers for publisher

                var cardByProductUrl = {};
                var locale = navigator && navigator.language || 'en-US';
                var skimlinksConfig = window.__SKIM_JS_BTN_WIDGET__;

                function handleDynamicLinks() {
                    var pageNavigation = false;

                    if (TRCImpl.getItemId) {
                        pageNavigation = TRC.DynamicLinksLoader.currentItemId && TRCImpl.getItemId() !== TRC.DynamicLinksLoader.currentItemId;
                        TRC.DynamicLinksLoader.currentItemId = TRCImpl.getItemId();
                    }

                    if (TRC.dynamicLinksStarted && !pageNavigation) {
                        return;
                    }

                    TRC.dynamicLinksStarted = true;

                    function mapCardToProductUrl(productUrl, cardDiv) {
                        if (!cardByProductUrl[productUrl]) {
                            cardByProductUrl[productUrl] = [cardDiv];
                        } else {
                            cardByProductUrl[productUrl].push(cardDiv);
                        }
                    }

                    function collectAllProducts() {
                        var products = {};
                        cardByProductUrl = {};
                        var selector = "".concat(skimlinksConfig.cardSelector, ":not([data-tbl-dl-fetched])");
                        Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (cardDiv) {
                            var buttons = cardDiv.querySelectorAll(skimlinksConfig.buttonSelector);

                            if (buttons.length >= skimlinksConfig.maxLinksPerCard) {
                                return;
                            }

                            var productUrl = getButtonUrl(buttons[0]);

                            if (!productUrl) {
                                return;
                            }

                            mapCardToProductUrl(productUrl, cardDiv);
                            var product = {
                                url: productUrl,
                                links: skimlinksConfig.maxLinksPerCard
                            };

                            if (!products[productUrl]) {
                                products[productUrl] = product;
                            }

                            cardDiv.dataset.tblDlFetched = 'true';
                        });
                        return Object.values(products);
                    }

                    function createContainer(container) {
                        if (!document.getElementById(container)) {
                            var element = document.createElement('div');
                            element.id = container;
                            element.style.display = 'none';
                            document.body.appendChild(element);
                        }
                    }

                    function flush() {
                        window._taboola.push({
                                                 flush: true
                                             });
                    }

                    function sendBatchAndFlush(products, batchNumber) {
                        window._taboola.push({
                                                 mode: DYNAMIC_LINKS_MODE,
                                                 container: DYNAMIC_LINKS_CONTAINER,
                                                 placement: "".concat(DYNAMIC_LINKS_PLACEMENT, "-").concat(batchNumber),
                                                 target_type: 'mix',
                                                 should_render: function should_render() {
                                                     return false;
                                                 },
                                                 skip_dom_render: true
                                             });

                        window._taboola.push({
                                                 additional_data: {
                                                     dlp: products
                                                 }
                                             });

                        flush();
                    }

                    function sendBatchRequest() {
                        window._taboola = window._taboola || [];
                        var products = collectAllProducts();

                        if (products.length === 0) {
                            return;
                        }

                        flush(); // send dynamic links request separately from other requests

                        var batchSize = TRC.DynamicLinksLoader.globalConfig['dynamic-links-request-batch-size'] || BATCH_SIZE;
                        var currentBatch = 0;
                        var currentIndex = 0;

                        while (currentBatch * batchSize < products.length) {
                            var productsBatch = products.slice(currentIndex, currentIndex + batchSize);
                            sendBatchAndFlush(productsBatch, currentBatch);
                            currentBatch++;
                            currentIndex += batchSize;
                        }
                    }

                    function handleTrcResponse(data) {
                        if (!data || !data.mybox || !data.mybox.trcResponse) {
                            return;
                        }

                        var mybox = data.mybox;
                        var recommendation = mybox.trcResponse;

                        if (!recommendation.uuip || !recommendation.uuip.startsWith(DYNAMIC_LINKS_PLACEMENT)) {
                            return;
                        }

                        var items = getRtbItems(recommendation);

                        if (items.length === 0) {
                            // no alternative products
                            return;
                        }

                        var dlurl = recommendation.dlurl;
                        var cardDivs = cardByProductUrl[dlurl];
                        Array.prototype.slice.call(cardDivs).forEach(function (card) {
                            optimizeRelevantCard(card, dlurl, items, mybox);
                        });
                    }

                    function getButtonUrl(button) {
                        return button.getAttribute('href') || button.querySelector('a').getAttribute('href');
                    }

                    function optimizeRelevantCard(card, dlurl, items, rboxObj) {
                        var buttons = card.querySelectorAll(skimlinksConfig.buttonSelector);

                        switch (skimlinksConfig.mode) {
                            case 'replace':
                                replaceButtons(buttons, dlurl, items, rboxObj);
                                break;

                            case 'add':
                                addButtons(card, buttons, dlurl, items, rboxObj);
                                break;

                            default:
                                console.error("Unknown mode ".concat(skimlinksConfig.mode));
                        }

                        handleVisible(rboxObj);
                        return true;
                    }

                    function replaceButtons(buttons, dlurl, items, rboxObj) {
                        for (var i = 0; i < buttons.length; i++) {
                            var button = buttons[i];
                            var recommendation = items[i];
                            var productDetails = getProductDetailsFromResponse(recommendation); // source 1 - optimizing existing button option only

                            var newButton = createAndConfigureNewButton(recommendation, productDetails, rboxObj, dlurl, i + 1, '1', getButtonUrl(button));
                            button.replaceWith(newButton);
                        }
                    }

                    function addButtons(card, buttons, dlurl, items, rboxObj) {
                        var existingUrls = Array.prototype.slice.call(buttons).map(function (button) {
                            return getButtonUrl(button);
                        });
                        var buttonsCount = buttons.length;
                        var alternatives = items;

                        while (buttonsCount < skimlinksConfig.maxLinksPerCard && alternatives.length > 0) {
                            var isAdded = tryAddNewButton(dlurl, card, existingUrls, rboxObj, alternatives, buttonsCount);

                            if (isAdded) {
                                buttonsCount++;
                            }
                        }
                    }

                    function checkIfUrlExist(existingUrls, url) {
                        var affiliateUrl = new URL(url);
                        var urlParam = affiliateUrl.searchParams.get('url');
                        var urlProduct = decodeURIComponent(urlParam);
                        var parseUrlProduct = new URL(urlProduct);
                        var merchantDomain = parseUrlProduct.hostname;
                        return existingUrls.some(function (existingUrl) {
                            return existingUrl.includes(merchantDomain);
                        });
                    }

                    function tryAddNewButton(dlurl, buttonsContainer, existingUrls, rboxObj, alternatives, buttonsCount) {
                        var recommendation = alternatives.shift();

                        if (!recommendation) {
                            return false;
                        }

                        var productDetails = getProductDetailsFromResponse(recommendation); // Assuming the product alternatives from the server are always unique,
                        // so no need to add them to the existingUrls after adding them to the page

                        if (checkIfUrlExist(existingUrls, recommendation.url)) {
                            tryAddNewButton(dlurl, buttonsContainer, existingUrls, rboxObj, alternatives, buttonsCount);
                        } else {
                            addNewButton(dlurl, buttonsContainer, rboxObj, recommendation, productDetails, buttonsCount + 1);
                            return true;
                        }
                    }

                    function appendXcreoParameter(url, buttonIndex, source) {
                        // The last digit is option active - 1.
                        var xcreoParameter = "400".concat(buttonIndex).concat(source, 1);
                        var uri = new URL(url);

                        if (uri.search.length > 0) {
                            uri.searchParams.set('xcreo', "".concat(xcreoParameter));
                        } else {
                            // If &xcreo doesn't exist, add &xcreo=<xcreoParameter>
                            uri.search = "xcreo=".concat(xcreoParameter);
                        }

                        return uri.toString();
                    }

                    function createButton(recommendation, productDetails, buttonIndex, source) {
                        var url = appendXcreoParameter(recommendation.url, buttonIndex, source);
                        var newButtonStr = skimlinksConfig.template.replaceAll('{{url}}', url).replaceAll('{{merchantName}}', productDetails.merchantName).replaceAll('{{originalPrice}}', productDetails.originalPrice).replaceAll('{{currentPrice}}', productDetails.currentPrice).replaceAll('{{currency}}', productDetails.currencySymbol).replaceAll('{{priceWithoutCurrency}}', productDetails.originalAmount);
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(newButtonStr, 'text/html');
                        return doc.body.firstChild;
                    }

                    function createAndConfigureNewButton(recommendation, productDetails, rboxObj, dlurl, buttonIndex, source, originalButtonLink) {
                        var newButton = createButton(recommendation, productDetails, buttonIndex, source);
                        setOptimizedElementData(newButton, recommendation, rboxObj);
                        sendOptimizeEvent(dlurl, recommendation.url, originalButtonLink, buttonIndex);
                        addClickEvent(newButton, recommendation, rboxObj);
                        return newButton;
                    }

                    function addNewButton(dlurl, buttonsContainer, rboxObj, recommendation, productDetails, buttonIndex) {
                        // source 2 - alternative buttons option only
                        var newButton = createAndConfigureNewButton(recommendation, productDetails, rboxObj, dlurl, buttonIndex, '2');
                        buttonsContainer.appendChild(newButton);
                    }

                    function setOptimizedElementData(productData, recommendation, rboxObj) {
                        productData['item-id'] = recommendation['item-id'];
                        productData.video_data = recommendation;
                        rboxObj.boxes.push(productData);
                    }

                    function handleVisible(rboxObj) {
                        rboxObj.visibilityReporter = new TRC.WidgetVisibilityReporter(rboxObj);
                    }

                    function getCurrencySymbol(currencyCode, locale) {
                        try {
                            return 0 .toLocaleString(locale, {
                                style: 'currency',
                                currency: currencyCode,
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).replace(/\d/g, '').trim();
                        } catch (_error) {
                            return currencyCode;
                        }
                    }

                    function formatPrices(productDetails) {
                        var priceFormatter = Intl.NumberFormat(locale, {
                            style: 'currency',
                            currency: productDetails.currencyCode || 'USD'
                        });
                        productDetails.originalPrice = priceFormatter.format(productDetails.originalAmount);
                        productDetails.currentPrice = priceFormatter.format(productDetails.currentAmount);
                    }

                    function getProductDetailsFromResponse(recommendation) {
                        var brandingTextResponse = recommendation['branding-text'];
                        var brandingText = brandingTextResponse.match(RESPONSE_FORMAT_REGEX);
                        var productDetails = {};

                        var _brandingText$map = brandingText.map(function (item) {
                            return item.trim();
                        });

                        var _brandingText$map2 = _slicedToArray(_brandingText$map, 6);

                        productDetails.merchantName = _brandingText$map2[1];
                        productDetails.currencyCode = _brandingText$map2[2];
                        productDetails.originalAmount = _brandingText$map2[3];
                        productDetails.currentAmount = _brandingText$map2[5];
                        productDetails.currencySymbol = getCurrencySymbol(productDetails.currencyCode, locale);
                        formatPrices(productDetails);
                        return productDetails;
                    }

                    function getRtbItems(recommendation) {
                        return recommendation.v.filter(function (item) {
                            return item['is-rtb'] === 'true';
                        });
                    }

                    function addClickEvent(elem, recommendation, rboxObj) {
                        if (isFeatureFlagOn('dynamic-links-add-taboola-click-event', false)) {
                            elem.onmousedown = itemClicked.bind(null, elem, recommendation, rboxObj);
                        }
                    }

                    function itemClicked(elem, recommendation, rboxObj) {
                        var target = elem.href ? elem : elem.querySelector('a');
                        var originalUrl = target.href;
                        var url = getClickUrl(rboxObj, recommendation, originalUrl);
                        target.href = url.replace('&url', '&redir');
                        setTimeout(function () {
                            target.href = originalUrl;
                        }, 300);
                    }

                    function getClickUrl(rboxObj, recommendation, url) {
                        var listContainer = rboxObj.listContainer;
                        rboxObj.listContainer = {
                            id: 'rbox-t2m'
                        };
                        var clickUrl = rboxObj.createVideoBoxClickUrl(recommendation, url);
                        rboxObj.listContainer = listContainer;
                        return clickUrl;
                    }

                    function isFeatureFlagOn(key, defaultValue) {
                        var config = TRC.DynamicLinksLoader.globalConfig[key];
                        return config !== undefined ? config : defaultValue;
                    }

                    function sendOptimizeEvent(dlurl, recommendationUrl, originalUrl, buttonIndex) {
                        if (!isFeatureFlagOn('dynamic-links-send-optimize-event', true)) {
                            return;
                        }

                        var data = {
                            pUrl: dlurl,
                            mode: skimlinksConfig.mode,
                            originalLink: originalUrl,
                            newLink: recommendationUrl,
                            index: buttonIndex
                        };
                        var requestData = {
                            data: JSON.stringify(data),
                            type: 'dynamicLinksOptimize'
                        };
                        setTimeout(function () {
                            TRCImpl.sendEvent('pubs-generic', {
                                d: JSON.stringify(requestData)
                            }, {});
                        }, 0);
                    }

                    createContainer(DYNAMIC_LINKS_CONTAINER);
                    TRC.listen('preBoxRender', handleTrcResponse);
                    sendBatchRequest();
                }

                var initDynamicLinks = function initDynamicLinks(config) {
                    try {
                        if (!config) {
                            __trcDebug("dynamic-links globals missing on pub init");

                            return;
                        }

                        var configPublisherKey = "send-dynamic-links-request-".concat(TRC.publisherId);

                        // if (!config[configPublisherKey]) {
                        //     return;
                        // }

                        TRC.DynamicLinksLoader.globalConfig = config;

                        if (window.TRCImpl) {
                            handleDynamicLinks();
                        } else {
                            TRC.EventsAPI.listen('trcImplAvailable', function () {
                                return handleDynamicLinks();
                            });
                        }
                    } catch (e) {
                        __trcError("Error in dynamic buttons module initialization: ".concat(e.message));
                    }
                };

                TRC.DynamicLinksLoader = {
                    initDynamicLinks: initDynamicLinks
                };
            })();

            TRC.DynamicModulesHooks = TRC.DynamicModulesHooks || [];
            TRC.DynamicModulesHooks.push({
                                             type: 'publisher-start',
                                             callback: TRC.DynamicLinksLoader.initDynamicLinks
                                         });



        }

        /**
         * Execute notification commands (API only)
         */
        function doNotifications() {
            // don't do anything yet
        }

        function doNotificationsFirst() {
            while (msg = notificationsFirst.shift()) {
                switch (msg.notify) {
                    case 'newPageLoad':
                        TRC.reset();
                        break;
                }
            }
        }

        /**
         * Locate the SCRIPT node that loaded loader.js and extract the base domain
         * @param {NodeList} scripts node list host object from the DOM. An array would also work
         */
        function findScriptBaseDomain(scripts) {
            var m,
                reFindScript = /^(.*\/libtrc\/.+\/)loader\.js(?:\?(.*))?$/;

            for (var i = 0; i < scripts.length; i++) { // traverse the scripts provided by my caller
                if (!scripts[i].src || !(m = scripts[i].src.match(reFindScript))) {   // find myself
                    continue;
                }

                // preload the base domain for the TRC (support CDN chaining)
                TRC.baseDomain = m[1];
                TRC.pConsole("page", "info", "base domain set to : " + TRC.baseDomain);

            }
        }

        /**
         * Execute notification commands (actual implementation)
         */
        function realDoNotifications() {
            var msg;
            while (msg = notifications.shift()) {
                switch (msg.notify) {
                    case 'videoPlay':
                        TRC.RBoxUsage.logUsage('realDoNotifications', {position: 'videoPlay'});
                        if (!this.preloadRequestLoader)
                            trc.playVideo(msg);
                        else {
                            // otherwise we should wait until the loadRBox response arrives
                            (function (e) {
                                // function indirection is used here to prevent the clobbering of the 'msg' scoped variable
                                // by the iterator
                                TRC.aspect.after(trc, 'handleLoadResponse', function () {
                                    trc.playVideo(e);
                                }, true);
                            })(msg);
                        }
                        break;
                    case 'videoDone':
                        TRC.RBoxUsage.logUsage('realDoNotifications', {position: 'videoDone'});

                        try {
                            TRC.dispatch('videoDone', msg);
                        } catch (e) {
                            trc.error("Problem in videoDone", e);
                        }
                }
            }
        }

        /**
         * !! see our text module !!
         * A utility split method to augment String.split by limiting the number of elements in the output
         * @param text String to split
         * @param delimiter Text string to split on. This can't be a regular expression!
         * @param limit maximum number of elements to return in the array - the last element will
         * contain all the remaining text after the n-1 delimiter, including any extra delimiters not removed
         */
        function lsplit(text, delimiter, limit) {
            var t = text.split(delimiter);
            return t.slice(0, limit - 1).concat(t.length >= limit ? t.slice(limit - 1).join(delimiter) : []);
        }

        /**
         * return the extracted host name
         * 1. without protocol
         * 2. wotks on absolute url's only
         * @param url
         * @return {String}
         */
        function getHostName(url) {
            var splits = [{key: '?', index: 0}, {key: '://', index: 1}, {key: '//', index: 1}, {
                    key: '/',
                    index: 0
                }, {key: ':', index: 0}],
                i = 0,
                len = splits.length,
                host = url,
                split;
            for (i; i < len; i++) {
                split = lsplit(host, splits[i].key, 2);
                host = (split.length > 1) ? split[splits[i].index] : split[0];
            }
            return host;
        }

        function fetchUserAgentData(highEntropyValuesArguments) {
            if (TRC.isGetHighEntropyValuesCalled) {
                return;
            }
            try {
                TRC.isGetHighEntropyValuesCalled = true;
                if (navigator && navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
                    TRC.userAgentDataObject = {};
                    navigator.userAgentData.getHighEntropyValues(highEntropyValuesArguments ? highEntropyValuesArguments : ['platformVersion']).then(function(uad) {
                        if (uad) {
                            TRC.userAgentDataObject = {
                                mobile: uad.mobile,
                                model: uad.model,
                                platform: uad.platform,
                                platformVersion: uad.platformVersion,
                                uaFullVersion: uad.uaFullVersion
                            };
                        }
                    });
                }
            } catch (e) {
                __trcWarn('error on user agent data, ', e);
            }
        }

        /**
         * Calls the libtrc loadRBox or drawRBox API, when we have mode rendering commands
         */
        function sendLoadRBox() {
            requestDispatchTimeout = null; // the timeout has fired
            trc.loadRBox.apply(trc, requests);
            requests = []; // clear all requests that were sent
            (doNotifications = realDoNotifications)();
        }

        function detectBots() {
            var reg;
            if (config.global['enable-detect-bots']) {
                reg = new RegExp(config.global['detect-bots-regex'] || 'bot|google|baidu|bing|msn|duckduckgo|teoma|slurp|yandex', 'i');
            } else {
                return;
            }
            TRC.botDetected = reg.test(navigator.userAgent);
        }

        /**
         * Execute mode rendering commands (API only)
         */
        function doRequests() {
            // don't do anything yet
        }

        /**
         * Execute mode rendering commands (actual implementation)
         */
        function realDoRequests() {
            if (!requests.length)
                return flush = false; // nothing to do.
            // we turn off flush if it happens to be on (so the next push will not be flushed by mistake)
            if (flush) {
                flush = false;
                sendLoadRBox();
                return;
            }
            if (requestDispatchTimeout != null)
                TRC.Timeout.clear(requestDispatchTimeout);
            requestDispatchTimeout = TRC.Timeout.set(sendLoadRBox, trc.trcRequestDelay);
        }

        function registerAPIEvents() {
            var deferredPush;

            apiListeners.push = function (push) {
                TRC.EventsAPI.listen(push.listenTo, push.handler);
            };

            while (apiListeners.length) {
                deferredPush = apiListeners.shift();
                TRC.EventsAPI.listen(deferredPush.listenTo, deferredPush.handler);
            }
        }

        /**
         * Execute socials events
         */
        function doSocials() {
            // don't do anything yet
        }

        /**
         * Execute socials events
         */
        function realDoSocials() {
            //this event subscription will ensure social events are fired after we hold a response(thus holding an user id)
            TRC.eventDelegator.subscribe("user_id_ready", handleSocials);
        }

        function handleSocials() {
            try {
                sendSocials.call(null, socials);
            } catch (e) {
                TRC.pConsole("errors", "error", "error in handleSocials", e.message);
            }

        }

        /**
         * send socials events to trc server
         * @param socials
         */
        function sendSocials(socials) {
            var msg;
            while (msg = socials.shift()) {
                //the  'unescape-#' prefix signals the event logger not to escape the parameter name and value
                trc.sendEvent("social", {
                    'st': msg.name,
                    'unescape-d': encodeURIComponent(__trcJSONify({"data": msg.val}))
                }, null, false, null, null);
            }
        }


        /**
         * Checks whether the mode passes visibility constraints according to specified property.
         * e.g., if property "visibility-constraints" has value {maxWidth: 480}, and the current browser width
         * is 500, the mode should not be displayed and this method should return false.
         *
         * @param config - mode configuration
         * @param mode - mode name
         * @returns {boolean} - true/false if passed the constraints test
         */
        function checkModeVisibilityConstraints(config, mode) {
            var passed = true,
                windowWidth,
                widthDisplayRule;

            try {
                if (config.modes[mode]) {
                    widthDisplayRule = config.modes[mode]['visibility-constraints'];
                    if (widthDisplayRule && typeof widthDisplayRule == "object") {
                        windowWidth = window.innerWidth || document.body.clientWidth;
                        if ((widthDisplayRule.minWidth && windowWidth < widthDisplayRule.minWidth)
                            || (widthDisplayRule.maxWidth && windowWidth > widthDisplayRule.maxWidth)) {
                            passed = false;
                            TRC.pConsole("page", "info", "Mode '" + mode + "' will not be displayed due to visibility constraints", widthDisplayRule, "object");
                        }
                    }
                }
            } catch (e) {
                TRC.pConsole("page", "error", "Error while evaluating visibility constraints of mode '" + mode + "': " + e.message);
            }

            return passed;
        }

        TRC.reset = function () {
            TRC.pConsole("page", "debug", "reset RBox");
            requests = []; // messages that request rendering of UI
            requestDispatchTimeout = null; // timer to manage rendering calls
            isTBXInit = false;
            win.taboola_view_id = null; // reset current view id
            TRC._taboolaClone = [];
            TRC.pushedRboxTracking = false;
            notifications = []; // messages that notify of events
            globalParams = {publisher: TRC.publisherId = '${publisher}'}; // global configuration parameter
            flush = false; // whether we have a flush request in the queue
            doNotifications = function () {
            };
            doRequests = function () {
            };

            try {
                TRC.pageTemplate = undefined;
                TRC.Timeout.reset();
                TRC.Interval.reset();
                if (trc && win.TRCImpl) {
                    trc.reset();
                    win.TRCImpl = trc = null;
                }
                if (TRC.eventDelegator) {
                    TRC.eventDelegator.resetEvents();
                }
            } catch (e) {
                TRC.pConsole("errors", "error", "error in TRC.reset", e.message);
            }
        };
        /**
         * callback to be notified when libtrc has loaded
         * @param {Object} defaults Object property list of pre-coded configuration
         * @return {TRC.Manager} the TRC singleton
         * @type TRC.Manager
         */
        TRC.ready = function (defaults) {
            config.defaults = defaults;
            config.version = TRC.version;

            if (config.global["enable-events-api"]) {
                registerAPIEvents();
            }

            setPush(manualVisibles, doVisibles);
            TRC.pConsole("page", "info", "configuration version +  : " + config.version);
            TRC.publisherId = globalParams.publisher;

            /* In most cases, We would not want to reinstantiate the TRC.Manager if it already exists and there was
             no reset prior. This flag enables this reinstantiation when it is needed, see Bloomberg autoscroll example. */

            if (config.global["force-reset-on-ready"]) {
                win.TRCImpl = trc = new TRC.Manager(config, globalParams); // cross register us and TRCImpl
            } else {
                win.TRCImpl = trc = trc || new TRC.Manager(config, globalParams); // cross register us and TRCImpl
            }

            // dispatch trcImplAvailable event after TRCImpl is made available
            if (!TRC.trcImplAvailableDispatched) {
                TRC.EventsAPI.dispatchTrcImplAvailable();
                TRC.trcImplAvailableDispatched = true;
            }

            // send publisher url before init
            __trcInfo(window.location.href);

            if (TRC.Rtus && shouldInjectRtus()) {
                new TRC.Rtus(TRC).applyRtus();
            }

            // its now safe to send render commands, so plug in the doRequests operation and invoke it
            (doRequests = realDoRequests)();

            if (config.global["enable-social-events"]) {
                (doSocials = realDoSocials)();
            }

            return trc;
        };

        function setLoaderDomains() {
            loaderHostName = (config.global['use-loader-host'] || config.global['enable-shift-cdn-domains']) ? getHostName(TRC.baseDomain) : null;
            loaderDomain = (loaderHostName) ? lsplit(loaderHostName, '.', 2).pop() : null;
        }

        TRC.shiftDomain = function (url) {
            if (!config.global['enable-shift-cdn-domains']) return url;
            var _url = url, urlDomain, blackListDomains = config.global['exclude-subd-shift'] || [],
                hostName = getHostName(url);
            if (loaderDomain && url) {
                urlDomain = lsplit(hostName, '.', 2)[1];
                if (blackListDomains.indexOf(hostName) < 0 && urlDomain.indexOf('taboola.com') > -1) {
                    _url = url.replace(urlDomain, loaderDomain)
                }
            }
            return _url;
        }

        /**
         * load script under taboola cdn
         * @param fileName
         * @param async
         * @param callbacks
         * @param errCallbacks
         */
        TRC.loadTaboolaScript = function (fileName, async, callbacks, errCallbacks) {
            var hostName = loaderHostName || "lepunk.github.io",
                scriptElms = doc.getElementsByTagName('script'),
                script;

            script = doc.createElement('script');
            TRC.addAnonymousCrossOrigin(script);
            if (scriptElms.length) {
                scriptElms[0].parentNode.insertBefore(script, scriptElms[0]);
            }
            script.charset = "UTF-8";
            script.type = "text/javascript";

            if (async) {
                script.setAttribute('async', 'async');
            }

            var callback = chainEventCallbacks(callbacks);
            if (callback) {
                script.addEventListener('load', callback, false);
            }

            var errCallback = chainEventCallbacks(errCallbacks);
            if (errCallbacks) {
                script.addEventListener('error', errCallback, false);
            }

            script.src = TRC.shiftDomain(protocol + '//' + hostName + '/libtrc/' + fileName);

            return script;
        };

        TRC.addAnonymousCrossOrigin = function (script) {
            var featureFlag = config.global['enable-crossorigin-anonymous-attribute'];
            var isCrossOriginAnonymousEnabled = featureFlag === true || featureFlag === "true" || featureFlag === 1 || featureFlag === "1";
            if( isCrossOriginAnonymousEnabled ){
                script.setAttribute('crossorigin', 'anonymous');
            }
        }

        function chainEventCallbacks(callbacks) {
            if (!callbacks) {
                return;
            }

            if (Array.isArray(callbacks)) { // honor onload handlers
                return function (e) {
                    callbacks.forEach(function (cb) {
                        cb(e);
                    });
                };
            } else if (typeof callbacks === 'function') {
                return callbacks;
            }
        }

        function vvReady() {
            TRC.adManager = new TRC.AdServerManager(config.global['vv-config'], TRC.version);
            TRC.adManager.startVV().then(function () {
                TRC.adManager.run();
            });
        }

        /**
         * Load a new javascript implementation file.
         * @param {String} file the file name to load from the libtrc CDN directory
         */
        function loadImplementation(file) {

            if (!!TRC.implInlined) {
                TRC.trcReady && TRC.trcReady();
                return;
            }
            if (TRC.implLoaded) {
                TRC.trcReady();
                return;
            }
            if (implElm) {
                return; // implementation file already loaded
            }

            implElm = TRC.loadTaboolaScript(file);
            (TRC.performance && TRC.performance.mark("3.0"));
            // monitor user timings
            TRC.utm.push((new Date).getTime() - TRC.utm.start);
            TRC.pConsole("page", "debug", "loading impl file : '" + file + "'");
        }

        /**
         * load visit value(vv.js) file
         */
        function loadVV() {
            if (TRC.AdServerManager) {
                return;
            }
            TRC.VVReady = vvReady;
            TRC.loadTaboolaScript('vv.' + TRC.version + '.js');
        }

        /**
         * Load a new javascript asset file
         * @param {String} file- the asset file name to load from the libtrc CDN directory
         */
        function loadAssetFile(file, config) {
            if (TRC.botDetected) {
                return;
            }
            var scriptElms = doc.getElementsByTagName('script'),
                headElms = doc.getElementsByTagName('head'),
                assetScript = doc.createElement('script');
            if (config && config.async) {
                assetScript.setAttribute('async', '');
            } else {
                assetScript.setAttribute('defer', ''); // this is our default for all our async scripts
            }

        if (config && config.crossorigin) {
            assetScript.setAttribute('crossorigin', config.crossorigin);
        }

            if (config && config.id) {
                assetScript.id = config.id;
            }

            assetScript.src = TRC.shiftDomain(file);

            if (config && config.forceInHead && scriptElms[0].parentNode.nodeName.toLocaleLowerCase() !== "head") {
                headElms[0].appendChild(assetScript);
            } else {
                scriptElms[0].parentNode.insertBefore(assetScript, scriptElms[0]);
            }

            TRC.pConsole("page", "debug", "loading : " + assetScript.src);
        }

        /**
         * Execute global properties commands, and load the implementation
         */
        function doGlobals() {
            if (!globalMessages.length)
                return; // no messages to check
            var msg, implFileFromParam, implFile;
            var implFileExtension = TRC.hasES6Support() ? '.js' : '.es5.js';

            while (msg = globalMessages.shift()) {
                for (var prop in msg) {
                    if (prop == 'onclick')
                        queue.onclick = msg[prop];
                    else
                        globalParams[prop] = msg[prop];
                }
            }

            if (TRC.implCustomFile) {
                implFile = TRC.implCustomFile + implFileExtension;
            } else {
                // Accepts parameters in the form of ?taboola_impl_file=impl, if doesn't exist or not in whitelist returns null
                implFileFromParam = getParameterOfWhitelist("taboola_impl_file", ['impl', 'impl.thin']);
                // Actually construct impl file name based on url param with fallback to baked default.
                implFile = implFileFromParam ? implFileFromParam + '.' + TRC.version + implFileExtension : '"${impl_file}".' + TRC.version + implFileExtension;
            }

            loadImplementation(implFile);
        }

        /**
         * Go over the messages in the queue and see what we can run with
         */
        function executeMessages() {
            doNotificationsFirst();
            doGlobals();
            doRequests();
            doNotifications();
            doSocials();
        }

        /**
         * register to AMP observeIntersection -  we need to cache rect data (the size of the AMP iframe)
         * to use it after the widget is rendered.
         */
        function registerToAMP_API() {
            //report page as amp
            var ampVersion = (window.AMP_MODE && window.AMP_MODE.version) ? window.AMP_MODE.version : "1";
            TRC.isAMP = true;
            window._taboola.push({
                additional_data: {
                    sdkd: {
                        "os": "AMP",
                        "osv": ampVersion,
                        "sdkt": "Taboola AMP Driver",
                        "sdkv": "1"
                    }
                }
            });
            window._taboola.push({
                listenTo: 'nocontent',
                handler: function (eventObj) {
                    var c = document.querySelector('.trc_rbox_container .trc_rbox_div');
                    if (c && c.offsetHeight > 10 || eventObj.detail.isFeedCard) return;
                    window.context.noContentAvailable();
                }
            });
            window.context.observeIntersection(function (changes) {
                changes.forEach(function (c) {
                    window._taboola.push({
                        intersection: true,
                        rects: c,
                        placement: window.context.data.placement
                    });
                    if (TRC.lastVisibleRects) { //cache last AMP rect data - http://rawgit.com/slightlyoff/IntersectionObserver/master/index.html#intersectionobserverentry
                        if (c.time > TRC.lastVisibleRects.time) {
                            TRC.lastVisibleRects = c;
                        }
                    } else {
                        TRC.lastVisibleRects = c;
                    }

                });
            });
        }

        /**
         * detect message type and dispatch accordingly
         */
        function dispatchMessage(msg) {
            if (typeof msg.overrideConfig === "object" && msg.overrideConfig != null) {
                TRC.overrideGlobalConfig = msg.overrideConfig.global;
                mergeObject(config, msg.overrideConfig, 0);
                return;
            }

            var socialType,
                taboolaxp;

            extractSubscription(msg);
            updateAmpMessageURL(msg);

            // Those checks are separated because we want to take it also from inside any message.
            if (msg.cex && config.global['cex-enable'] !== false) {
                TRC.cexConsentData = msg.cex;
            }
            if (msg.cdns && config.global['ccpa-cdns-enable'] !== false) {
                TRC.ccpaCdns = msg.cdns;
            }
            if (msg.ccpaPs && config.global['ccpa-ps-enable'] !== false) {
                TRC.ccpaPs = msg.ccpaPs;
            }

            //we check that excluded publisher are existing and not empty
            if (!!msg.exp) {
                TRC.exp = msg.exp;
            }

            // send geo data that provided b y the publisher (coordinates) to TRC
            if (!!msg.geo) {
                TRC.geo = msg.geo;
            }

            // disable organic personalization (HPP)
            if (!!msg.opDisabled) {
                TRC.opDisabled = true;
            }

            // add custom segment
            if (!!msg.cseg) {
                TRC.cseg = msg.cseg;
            }

            if(!!msg.pubExperiment) {
                TRC.pubExperiment = msg.pubExperiment;
            }

            if (!!msg.mode) {
                TRC.pConsole("page", "info", "push to '_taboola' - mode : " + msg.mode, msg, "object");
                if (!!msg.framework) {
                    globalMessages.push({framework: msg.framework}); //hack for AMP
                    if (msg.framework === 'amp') {
                        registerToAMP_API();
                    }
                } else if (config.global["enable-cls-plc-optim"]) { // CWV - reducing CLS by seting min-height on container before rendering
                    containerExpand(msg.placement, msg.container);
                }
                if (checkModeVisibilityConstraints(config, msg.mode)) {
                    requests.push(msg);
                }
            } else if (!!msg.listenTo) {
                if (msg.handler && typeof msg.handler === 'function') {
                    apiListeners.push(msg);
                } else {
                    TRC.pConsole("page", "warn", "events API listening to event without a handler.");
                }
            } else if (!!msg.notify) {
                if (msg.notify == 'newPageLoad') {
                    TRC.pConsole("page", "info", "push to '_taboola' - notification : newPageLoad");
                    resetAllMessages();
                    notificationsFirst.push(msg);
                } else {
                    notifications.push(msg);
                }
            } else if (msg.topics_sdk) {
                TRC.topics_sdk = msg.topics_sdk;
            } else if (msg.name && msg.name.indexOf('p13n-') !== -1) {
                p13ns.push(msg);
            } else if (msg.name && msg.name.indexOf('abtests') !== -1) {
                abtests.push(msg);
            } else if (msg.clsfilter) {
                TRC.CLSEvents = TRC.CLSEvents || [];
                if (Array.isArray(msg.clsfilter)) {
                    msg.clsfilter.forEach(function (e) {
                        TRC.CLSEvents.push(e);
                    });
                } else {
                    TRC.CLSEvents.push(msg.clsfilter);
                }
            } else if (socialType = getSocialEvent(msg)) {
                socials.push({name: socialType, val: msg[socialType]});
            } else if (msg.debug) {
                debugs.push(msg.debug);
            } else if ((msg.intersection || msg.visible) && msg.placement) {
                manualVisibles.push({event: 'visible::' + msg.placement, rects: msg.rects}); // AMP notifies a placement is visible
            } else {
                taboolaxp = getParameter("taboolax-load", win.location);
                if ((config.global['inject-taboolax'] || taboolaxp) && !isTBXInit && setTBXPageType(msg)) {
                    taboolaXHost = (taboolaxp) ? taboolaXHosts[taboolaxp] : taboolaXHost;
                    isTBXInit = true;
                    injectTaboolaX(taboolaXHost);
                }
                if (!!msg.template && TRC.pageTemplate === undefined) {
                    TRC.pageTemplate = msg.template;// allow only one template push
                }
                globalMessages.push(msg);
            }
            if (!!msg.flush) flush = true;
        }

        /**
         * dispatch external(e.g. AMP) visible events
         * @param event
         */
        function doVisibles(data) {
            TRC.dispatch(data.event, data.rects);
        }

        /**
         * register new overloaded push method on array an parse past native pushes
         * @param arr
         * @param func
         */
        function setPush(arr, func) {
            var msg;
            arr.push = func;
            while (msg = arr.shift()) {
                func(msg);
            }
        }

        /**
         *  extract social events
         *  {Object} msg
         *  return {String} - social event name
         */
        function getSocialEvent(msg) {
            try {
                for (var i in msg) {
                    if (i.indexOf('social-') == 0 && msg.hasOwnProperty(i)) {
                        return i;
                    }
                }
            } catch (e) {
            }
            return null;
        }

        function extractSubscription(msg) {
            var subscribe;
            try {
                if (!msg.onrender) {
                    return
                }
                if (TRC.eventDelegator) {
                    subscribe = TRC.eventDelegator.subscribe;
                } else {
                    TRC.subscriptionRegister = [];
                    subscribe = function (event, handler, mode, container) {
                        TRC.subscriptionRegister.push({"event": event, "handler": handler, "container": container});
                    };
                }
                subscribe("onrender", msg.onrender, (msg.container) ? getContainerId(msg.container) : null);
            } catch (e) {
                __trcError && __trcError("extractSubscription", e);
            }
        }

        function updateAmpMessageURL(msg) {
            // We are doing the change of URL here because the actual URL arrive from AMP plugin is not correct
            // and is directing to the publisher AMP page type and not the standard page.
            // This causing Taboola Feed to link to article as AMP and we appear inside an iFrame and not on the window.top.
            // The reason I do it for all instances is the default URL the AMP pass is AMP and not non-AMP.
            // In addition, we need to have all Query Params as the URL.

            var isAmpUrlMessage = TRC.isAMP && msg.hasOwnProperty("url") && !!window.context;
            if (config.global['disable-amp-url-override'] || !isAmpUrlMessage) {
                return;
            }

            msg.url = window.context.canonicalUrl + window.context.location.search;
        }

        /**
         * get parameters values in page location query string (a.k. as search string)
         * @param name
         * @param url
         * @returns {*}
         */
        function getParameter(name, locationObj) {
            var kv, i,
                params = locationObj.search.substr(1).split(/&/);
            for (i = 0; i < params.length; i++) {
                kv = params[i].split(new RegExp("="), 2);
                if (kv[0] == name)
                    return kv[1];
            }
            return null;
        }

        function getParameterOfWhitelist(name, whitelist) {
            var param = getParameter(name, win.location);
            for (var i = 0; i < whitelist.length; i++) {
                if (whitelist[i] === param) {
                    return param;
                }
            }
            return null;
        }

        /**
         *
         * @param container
         * @returns {*}
         */
        function getContainerId(container) {
            if (typeof container === "string") {
                return container;
            } else {
                return msg.container.id || "trc_cont_ " + parseInt(Math.random() * 10000);
            }
        }

        /**
         *  set the global page type for taboola-X
         * @param types {Array}
         * @param global {String}
         * @return  {String}
         */
        function setTBXPageType(msg) {
            var i;
            for (i in msg) {
                if (PAGE_TYPES.hasOwnProperty(i)) {
                    win[TBX_PAGE_TYPE_VAR] = PAGE_TYPES[i];
                    return PAGE_TYPES[i];
                }
            }
            return null;
        }

        /**
         * reset all messages
         */
        function resetAllMessages() {
            requests = [];
            globalMessages = [];
            notifications = [];
            notificationsFirst = [];
            socials = [];
        }

        /**
         * entry point into the message queue.
         * @param arg a single property list or an array of property lists.
         */
        function pushMessage(arg) {
            if (!arg) {
                return;
            }

            if (arg.placement) {
                (TRC.performance && TRC.performance.mark('tbl_push_start', null, arg.placement.replace(/ /g, '_'), 0, 'tblPush', TRC.PerfEvenType.START));
                (TRC.performance && TRC.performance.mark('tbl_push_stop', null, arg.placement.replace(/ /g, '_'), 0, 'tblPush', TRC.PerfEvenType.STOP));
            }

            if (TRC._taboolaClone.length > 50) {
                TRC._taboolaClone = [];
            }
            TRC._taboolaClone.push(arg);
            for (var i = 0; i < arguments.length; i++) {
                arg = arguments[i];
                TRC.pConsole("page", "debug", "push to '_taboola'", arg, "object");
                if (arg instanceof Array) {// got a list of messages
                    for (var j = 0; j < arg.length; j++) {
                        dispatchMessage(arg[j]);
                    }
                } else {
                    dispatchMessage(arg);
                }
            }
            executeMessages();
            return arguments.length;
        }

        /**
         * We must make this Device ID injection before the _taboola.push messages are process so this message will be used before the "flush:true"
         */
        function injectDeviceId() {
            if (config.global['rbox-detect-device-id'] === false) {
                return;
            }

            // This function exist here and in global.js as Util because we might have different versions and I can't
            // make sure both will load in the same time.
            var extractUrlParams = (function () {
                var elementA = document.createElement("a");
                return function (url) {
                    if (!url) {
                        return {};
                    }
                    elementA.href = url;
                    var searchItem;
                    var search = elementA.search;
                    var regexPattern = /\??&?([^=]+)=([^&]+)/gi;
                    var result = {};
                    while (searchItem = regexPattern.exec(search)) {
                        result[searchItem[1]] = searchItem[2];
                    }
                    return result;
                }
            }());

            function extractDeviceId(url) {
                var referrerUrlResult = extractUrlParams(url);
                var redirUrlResult = referrerUrlResult.redir ? extractUrlParams(decodeURIComponent(referrerUrlResult.redir)) : {};
                var dc_data = referrerUrlResult["dc_data"] || redirUrlResult["dc_data"];
                if (dc_data && !!referrerUrlResult["ui"]) {
                    return {
                        deviceId: referrerUrlResult['ui'],
                        dc_data: dc_data
                    };
                }
                return null;
            }

            // Check if we are in AMP before all _taboola.push messages were processed
            var checkIsAmp = function (msg) {
                if (msg instanceof Array) {
                    return msg.filter(checkIsAmp).length > 0;
                }
                return !!msg.mode && msg.framework === 'amp';
            };
            var isAMP = _taboola.filter(checkIsAmp).length > 0;

            var result = (isAMP && window.context && extractDeviceId(window.context.referrer)) || extractDeviceId(window.__tbMockReferrer || document.referrer);
            if (result) {
                _taboola.unshift({
                    device: result.deviceId,
                });
                TRC.taboolaNews = TRC.taboolaNews || {};
                TRC.taboolaNews.timeOn = result;
            }
        }

        function setGloablFlags() {
            TRC.useStorageDetection = (config.global && config.global['use-storage-detection'] === true) ? true : false;
        }

        function injectTaboolaX(host) {
            loadAssetFile(host + "/" + TRC.publisherId + "/load.js", {"async": true});
            TRC.pConsole("page", "info", "injected taboola-x with publisher id : " + TRC.publisherId);
        }

        function activatePerf(enabled, config, force) {
            if (TRC.perfConfOverride) {
                config = TRC.perfConfOverride;
            }

            if (force || (enabled && config && config.traffic)) {
                if (force || (config.traffic > (Math.random() * 100))) {
                    TRC.performance = new TRC.Performance(config);
                }
            }
        }

        function preconnectTo(url) {
            var hint = document.createElement("link");
            hint.rel = "preconnect";
            hint.href = url;
            if (document.head) {
                document.head.appendChild(hint);
            }
        }

        function setResourceHints() {
            if (config.global['enable-resource-hints']) {
                for (var i = 0; i < PRECONNECT_DOMAINS.length; i++) {
                    preconnectTo(TRC.PROTOCOL + '//' + PRECONNECT_DOMAINS[i]);
                }
            }
        }

        // TODO: remove when generic GDPR('enable-consent') is enabled for all publishers
        function getConsentData() {
            var CMP_INTEGRATED = 0,
                CMP_INTEGRATED_NO_RESULT = 1,
                CMP_INTEGRATED_ERROR_ON_RESULT = 2,
                NO_CMP_INTEGRATION = 3;

            TRC.consentData = {};

            if (typeof __cmp === 'function') {
                TRC.consentData.cmpStatus = CMP_INTEGRATED_NO_RESULT;

                try {
                    __cmp('getConsentData', null, function (result) {
                        TRC.consentData.cmpStatus = CMP_INTEGRATED;
                        TRC.consentData.gdprApplies = result.gdprApplies;
                        TRC.consentData.consentDaisyBit = result.consentData;
                    });
                } catch (e) {
                    TRC.consentData.cmpStatus = CMP_INTEGRATED_ERROR_ON_RESULT;

                    TRC.pConsole("page", "error", 'getConsentData: Error calling __cmp api for user consent', e.message);
                }
            } else {
                TRC.consentData.cmpStatus = NO_CMP_INTEGRATION;
            }
        }

        detectBots();

        if (config.global['enable-shift-cdn-domains']) {
            findScriptBaseDomain(doc.getElementsByTagName('script'));
            setLoaderDomains();
        }

        if (TRC.Performance) {
            activatePerf(config.global["enable-analytics"], config.global["config-analytics"], getParameter("taboola-force-perf", win.location));
            (TRC.performance && TRC.performance.mark("2.0"));
        }

        var smartEllipsisUrlParam = getParameter("taboola-smart-ellipsis", win.location);
        if (smartEllipsisUrlParam) {
            config.global["smart-ellipsis"] = smartEllipsisUrlParam === "yes";
        }

        var ellipsisPerfUrlParam = getParameter("taboola-ellipsis-perf", win.location);
        if (ellipsisPerfUrlParam) {
            TRC.ellipsisPerf = ellipsisPerfUrlParam === "yes";
        }

        // If trk.js is loaded to the page - wait for it 'waitForTrkTimeout' milliseconds
        if (TRC.hasTrk && ((TRC.trk.hasRequestEnded && !TRC.trk.hasRequestEnded(TRC.publisherId)) || TRC.trkRequestStatus === undefined)) {
            win.setTimeout(doInitialization, waitForTrkTimeout);
        } else {
            setResourceHints();
            doInitialization();
        }

        function containerExpand(placemenName, containerId) {
            var vhMulti, cont, minHeightConf = config.global["cls-plc-optim-config"];
            if (minHeightConf && minHeightConf[placemenName]) {
                vhMulti = minHeightConf[placemenName]["vhMulti"] || 1;
                cont = document.getElementById(containerId);
                if (cont) {
                    cont.style.minHeight = vhMulti * 100 + "vh";
                }
            }
        }

        function mergeObject(dest, src, depth) {
            if (depth > 10) {
                return;
            }

            for (var o in src) {
                if (src.hasOwnProperty(o)) {
                    var source = src[o];

                    if (typeof source === "object" && (!Array.isArray(source) || config.global['disable-push-array-convert'])) {
                        if (typeof dest[o] === "undefined") {
                            dest[o] = {};
                        }

                        if (typeof dest[o] === "object") {
                            mergeObject(dest[o], source, ++depth);
                        }
                    } else if (o === "experimentID" && dest[o]) {
                        dest[o] = dest[o] + "," + source;
                    } else {
                        dest[o] = source;
                    }
                }
            }
        }


        function doInitialization() {
            setGloablFlags();
            injectDeviceId();
            TRC.loaderUtils.addOriginTrialMetaTag(config.global['yield-token']);
            if (!config.global['enable-shift-cdn-domains']) {
                findScriptBaseDomain(doc.getElementsByTagName('script'));
                setLoaderDomains();
            }
            // hook into the taboola message queue
            queue = win[queueName];
            if (queue.registered) // everything is already active, get out of here
                return;
            queue.push = pushMessage;
            queue.registered = true;
            while (queue.length) {
                pushMessage(queue.shift());
            }

            if (config.global["load-user-agent-data"]) {
                fetchUserAgentData(config.global['high-entropy-values-arguments']);
            }

            // TODO: remove when generic GDPR('enable-consent') is enabled for all publishers
            if (!config.global['enable-consent']) {
                getConsentData();
            }

            if (config.global['enable-visit-value'] && !config.global['load-vv-early']) {
                loadVV();
            }
        }

        function shouldInjectRtus() {
            try {
                if (config.global['enable-real-time-user-sync-for-all-browsers']) {
                    return config.global['enable-real-time-user-sync'];
                }
                return config.global['enable-real-time-user-sync'] &&
                    (/^((?!chrome|android).)*safari/i.test(navigator.userAgent.toLowerCase()) ||
                        navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ||
                        navigator.userAgent.indexOf('Edg') > -1);
            } catch (e) {
                return false;
            }
        }


    }

})(window, document);

/*global apex*/
/*!
 util.js
 Copyright (c) 2012, 2015 Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex}.util namespace is used to store all utility functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.util = {};

(function( util, $, undefined ) {
    "use strict";

    /**
     * Function that returns an array based on the value passed in pValue.
     *
     * @param {String|*} pValue If this is a string, then the string will be split into an array using the pSeparator parameter.
     *                          If it's not a string, then we try to convert the value with apex.jQuery.makeArray to an array.
     * @param {String} [pSeparator=":"] Separator used to split a string passed in pValue, defaults to colon if not specified.
     * @return {Array}
     *
     * @example
     * lProducts = apex.util.toArray( "Bags:Shoes:Shirts" );
     * lProducts = apex.util.toArray( "Bags,Shoes,Shirts", "," );
     * lTextFields = apex.util.toArray( jQuery("input[type=text]") );
     *
     * @function toArray
     * @memberOf apex.util
     **/
    util.toArray = function( pValue, pSeparator ) {
        var lSeparator,
            lReturn = [];

        // If pValue is a string, we have to split the string with the separator
        if ( typeof pValue === "string" ) {

            // Default separator to a colon, if not supplied
            if ( pSeparator === undefined ) {
                lSeparator = ":";
            } else {
                lSeparator = pSeparator;
            }

            // Split into an array, using the defined separator
            lReturn = pValue.split( lSeparator );

            // If it's not a string, we try to convert pValue to an array and return it
        } else {
            lReturn = $.makeArray( pValue );
        }
        return lReturn;
    }; // toArray

    /**
     * Function that returns a string where all special HTML characters (&<>"'/) are escaped to prevent XSS attacks.
     * It provides the same functionality as sys.htf.escape_sc in PL/SQL.
     *
     * Note: This function should always be used when emitting untrusted data!
     *
     * @param {String} pValue   String which should be escaped.
     * @return {String} The escaped string.
     *
     * @example
     * jQuery("#show_user).append(apex.util.escapeHTML( $v("P1_UNTRUSTED_NAME") ));
     *
     * @function escapeHTML
     * @memberOf apex.util
     **/
    util.escapeHTML = function(pValue) {
        return pValue.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;");
    }; // escapeHTML

    /**
     * Function that returns a string where Regular Expression special characters (\.^$*+-?()[]{}|) are escaped which can
     * change the context in a regular expression. It has to be used to secure user input.
     *
     * @param {String} pValue   String which should be escaped.
     * @return {String} The escaped string, or an empty string if pValue is null or undefined
     *
     * @example
     * searchValue = new RegExp( "^[-!]?" + apex.util.escapeRegExp( pInputText ) + "$" );
     *
     * @function escapeRegExp
     * @memberOf apex.util
     **/
    util.escapeRegExp = function( pValue ) {
        var lReturn = "";
        if ( pValue ) {
            return pValue.replace(/([\.\$\*\+\-\?\(\)\{\}\|\^\[\]\\])/g,'\\$1');
        }
        return lReturn;
    }; // escapeRegExp

    /**
     * Function that returns a string where CSS meta-characters are escaped. This gets around
     * the problem where jQuery has issues with ID selectors that may contain one of these characters. In this case,
     * these characters will be double escaped and treated literally, rather than as CSS notation.
     *
     * @param {String} pValue   String which should be escaped.
     * @return {String} The escaped string, or an empty string if pValue is null or undefined
     *
     * @example
     * jQuery("#" + apex.util.escapeCSS( "my.id" ) );
     *
     * @function escapeCSS
     * @memberOf apex.util
     **/
    // CSS meta-characters (based on list at http://api.jquery.com/category/selectors/)
    // Define a closure to just do the escaping once
    var CSS_META_CHARS_REGEXP = new RegExp( "([" + util.escapeRegExp( " !#$%&'()*+,./:;<=>?@[\\]^`{|}~" + '"' ) + "])", "g" );

    util.escapeCSS = function( pValue ) {
        var lReturn = "";
        if ( pValue ) {
            // Escape any meta-characters (based on list at http://api.jquery.com/category/selectors/)
            return pValue.replace( CSS_META_CHARS_REGEXP, "\\$1" );
        }
        return lReturn;
    }; // escapeCSS

    util.escapeHTMLContent = util.escapeHTMLAttr = function(s) {
        s = "" + s; // make sure s is a string
        return util.escapeHTML(s);
    };

    /*
     * todo consider add documentation
     * todo think should this be smarter about numeric attribute values?
     * todo consider an attrs method that takes a plain object
     */
    var htmlBuilderPrototype = {
        markup: function(t) {
            this.html += t;
            return this;
        },
        attr: function(name, value) {
            if (arguments.length === 1) { // name is optional
                value = name;
                name = null;
            }
            if (name) {
                this.html += " ";
                this.html += name;
                this.html += "='";
            }
            this.html += util.escapeHTMLAttr(value);
            if (name) {
                this.html += "'";
            }
            return this;
        },
        optionalAttr: function(name, value) {
            if (value && typeof value !== "object") {
                this.html += " ";
                this.html += name;
                this.html += "='";
                this.html += util.escapeHTMLAttr(value);
                this.html += "'";
            }
            return this;
        },
        optionalBoolAttr: function(name, value) {
            // must be boolean and must be true - not just truthy
            if (value === true) {
                this.html += " ";
                this.html += name;
            }
            return this;
        },
        content: function(t) {
            this.html += util.escapeHTMLContent(t);
            return this;
        },
        clear: function() {
            this.html = "";
        },
        toString: function() {
            return this.html;
        }
    };

    util.htmlBuilder = function() {
        var that = Object.create( htmlBuilderPrototype );
        that.clear();
        return that;
    };

    /**
     * Creates a URL to an APEX application page from properties given in pArgs and information on the current page
     * pArgs is an object containing any of the following optional properties
     * - appId the application id (flow id). If undefined or falsey the value is taken from the current page
     * - pageId the page id (flow step id). If undefined or falsey the value is taken from the current page
     * - session the session (instance). If undefined or falsey the value is taken from the current page
     * - request a request string used for button processing. If undefined or falsey the value is taken from the current page
     * - debug YES, NO, LEVEL<n> sets the debug level. If undefined or falsey the value is taken from the current page
     * - clearCache a comma separated list of pages RP, APP, SESSION. The default is empty string
     * - itemNames an array of item names to set in session state
     * - itemValues an array of values corresponding to each item name in the itemNames array.
     * - todo consider a map alternative for items
     * - printerFriendly Yes or empty string. Default is empty string.
     *
     * @param pArgs
     * @return {String}
     */
    util.makeApplicationUrl = function ( pArgs ) {
        var i,
            lUrl = "f?p=";

        lUrl += pArgs.appId || $v( "pFlowId" );
        lUrl += ":";
        lUrl += pArgs.pageId || $v( "pFlowStepId" );
        lUrl += ":";
        lUrl += pArgs.session || $v( "pInstance" );
        lUrl += ":";
        lUrl += pArgs.request || $v( "pRequest" );
        lUrl += ":";
        lUrl += pArgs.debug || $v( "pdebug" ) || "";
        lUrl += ":";
        lUrl += pArgs.clearCache || "";
        lUrl += ":";
        if ( pArgs.itemNames ) {
            lUrl += pArgs.itemNames.join( "," );
        }
        lUrl += ":";
        if (pArgs.itemValues) {
            for ( i = 0; i < pArgs.itemValues.length; i++ ) {
                if ( i > 0 ) {
                    lUrl += ",";
                }
                lUrl += encodeURIComponent( pArgs.itemValues[ i ] );
            }
        }
        lUrl += ":";
        lUrl += pArgs.printerFriendly || "";

        return lUrl;
    };

    /**
     * Function that renders a spinning ARIA alert to show the user some processing is taking place.
     *
     * @param {Object}  [pContainer=$("body")]  Optional jQuery selector, jQuery- or DOM object identifying the
     *                                          container within which you want to center the spinner. If not passed,
     *                                          the spinner will be centered on the whole page.
     * @param {Object}  [pOptions]              Optional object with the following options:
     *                                            - "alert"   Alert text visually hidden, but available to Assistive
     *                                                        Technologies. Defaults to "Processing".
     *
     * @return {Object} jQuery object for the spinner
     *
     * @example
     * // To show the spinner
     * var lSpinner$ = util.showSpinner( $( "#container_id" ) );
     *
     * // Then to remove the spinner
     * lSpinner$.remove();
     *
     * @function showSpinner
     * @memberOf apex.util
     **/
    util.showSpinner = function( pContainer, pOptions ) {
        var lSpinner$, lTop, lBottom, lYPosition, lYOffset,
            out         = util.htmlBuilder(),
            lContainer$ = ( pContainer ) ? $( pContainer ) : $( "body" ),
            lWindow$    = $( window ),
            lContainer  = lContainer$.offset(),
            lOptions    = $.extend ({
                alert:   apex.lang.getMessage( "APEX.PROCESSING" )
            }, pOptions ),
            lViewport   = {
                top:  lWindow$.scrollTop(),
                left: lWindow$.scrollLeft()
            };

        // Calculate viewport bottom and right
        lViewport.bottom = lViewport.top + lWindow$.height();
        lViewport.right = lViewport.left + lWindow$.width();

        // Calculate container bottom and right
        lContainer.bottom = lContainer.top + lContainer$.outerHeight();
        lContainer.right = lContainer.left + lContainer$.outerWidth();

        // If top of container is visible, use that as the top, otherwise use viewport top
        if ( lContainer.top > lViewport.top ) {
            lTop = lContainer.top;
        } else {
            lTop = lViewport.top;
        }

        // If bottom of container is visible, use that as the bottom, otherwise use viewport bottom
        if ( lContainer.bottom < lViewport.bottom ) {
            lBottom = lContainer.bottom;
        } else {
            lBottom = lViewport.bottom;
        }
        lYPosition = ( lBottom - lTop ) / 2;

        // If top of container is not visible, Y position needs to add an offset equal hidden container height,
        // this is required because we are positioning in the container element
        lYOffset = lViewport.top - lContainer.top;
        if ( lYOffset > 0 ) {
            lYPosition = lYPosition + lYOffset;
        }

        // Now the markup
        out.markup( "<span" )
            .attr( "class", "u-Processing" )
            .attr( "role", "alert" )
            .markup( ">" )
            .markup( "<span" )
            .attr( "class", "u-Processing-spinner" )
            .markup( ">" )
            .markup( "</span>" )
            .markup( "<span" )
            .attr( "class", "u-VisuallyHidden" )
            .markup( ">" )
            .content( lOptions.alert )
            .markup( "</span>" )
            .markup( "</span>" );

        // And render and position the spinner and overlay
        lSpinner$ = $( out.toString() );
        lSpinner$.appendTo( lContainer$ );
        lSpinner$.position({
            my:         "center",
            at:         "left+50% top+" + lYPosition + "px",
            of:         lContainer$,
            collision:  "fit"
        });

        return lSpinner$;
    };

    /**
     * The delayLinger singleton solves the problem of flashing progress indicators (spinners etc.)
     * For processes such as an ajax request (and subsequent UI update) that may take a while it is important
     * to let the user know that something is happening.
     * The problem is that if an async process is quick there is no need for a progress indicator. The user
     * experiences the UI update as instantaneous. Showing and hiding a progress indicator around an async
     * process that lasts a very short time causes a flash of content that the user may not have time to fully perceive.
     * At best it is a distraction and at worse the user wonders if something is wrong or if they missed something
     * important. Simply delaying the progress indicator doesn't solve the problem because the process
     * could finish a short time after the indicator is shown. The indicator must be shown for at least a short but
     * perceivable amount of time even if the request is already finished. Thus the solution; delay and linger.
     *
     * @example
     * var lSpinner$, lPromise;
     * lPromise = doLongProcess();
     * util.delayLinger.start( "main", function() {
     *     lSpinner$ = util.showSpinner( $( "#container_id" ) );
     * } );
     * lPromise.always( function() {
     *     util.delayLinger.finish( "main", function() {
     *         lSpinner$.remove();
     *     } );
     * } );
     *
     */
    util.delayLinger = (function() {
        var scopes = {},
            busyDelay = 200,
            busyLinger = 1000; // visible for min 800ms

        function getScope( scopeName ) {
            var s = scopes[scopeName];
            if ( !s ) {
                s = {
                    count: 0,
                    timer: null
                };
                scopes[scopeName] = s;
            }
            return s;
        }

        function removeScope( scopeName ) {
            delete scopes[scopeName];
        }

        return {
            /**
             * Call when a potentially long running async process starts. For each call to start with
             * a given pScopeName a corresponding call to finish with the same pScopeName must be made.
             * Calls with different pScopeName arguments will not interfere with each other.
             * Multiple calls to start for the same pScopeName before any calls to finish is allowed but
             * only the pAction from the first call is called at most once.
             *
             * @param pScopeName {string} use a unique name for each unique progress indicator
             * @param pAction a function to call to display the progress indicator
             *
             * @function start
             * @memberOf apex.util.delayLinger
             */
            start: function( pScopeName, pAction ) {
                var s = getScope( pScopeName );
                s.count += 1;
                if ( s.count === 1 && s.timer === null ) {
                    s.start = (new Date()).getTime();
                    s.timer = setTimeout( function() {
                        s.timer = null;
                        pAction();
                    }, busyDelay );
                }
            },

            /**
             * Call when the potentially long running async process finishes. For each call to start with
             * a given pScopeName a corresponding call to finish with the same pScopeName must be made.
             * The pAction is called exactly once if and only if the corresponding start pAction was called
             * If there are multiple calls to finish the pAction from the last one is called
             *
             * @param pScopeName {string} use a unique name for each unique progress indicator
             * @param pAction a function to call to hide and/or remove the progress indicator
             *
             * @function finish
             * @memberOf apex.util.delayLinger
             */
            finish: function( pScopeName, pAction ) {
                var elapsed,
                    s = getScope( pScopeName );

                if ( s.count === 0 ) {
                    throw "delayLinger.finish called before start for scope " + pScopeName;
                }
                elapsed = (new Date()).getTime() - s.start;
                s.count -= 1;

                if ( s.count === 0 ) {
                    if ( s.timer === null) {
                        // the indicator is showing so don't flash it
                        if ( elapsed < busyLinger ) {
                            setTimeout(function() {
                                pAction();
                                removeScope( pScopeName );
                            }, busyLinger - elapsed);
                        } else {
                            pAction();
                            removeScope( pScopeName );
                        }
                    } else {
                        // the request(s) went quick no need for spinner
                        clearTimeout( s.timer );
                        s.timer = null;
                        removeScope( pScopeName );
                    }
                }
            }
        };
    })();

    util.setOuterHeight = function ( $e, h ) {
        $.each( ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function( i, p ) {
            var v = parseInt( $e.css( p ), 10 );
            if ( !isNaN( v ) ) {
                h -= v;
            }
        });
        $e.height( h );
    };

    util.setOuterWidth = function ( $e, w ) {
        $.each( ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight", "marginLeft", "marginRight"], function( i, p ) {
            var v = parseInt( $e.css( p ), 10 );
            if ( !isNaN( v ) ) {
                w -= v;
            }
        });
        $e.width( w );
    };

    /**
     * Get a JavaScript Date object corresponding to the input date string which must be in simplified ISO 8601 format.
     * In the future Date.parse could be used but currently there are browsers we support that don't yet support the ISO 8601 format.
     * This implementation is a little stricter about what parts of the date and time can be defaulted. The year, month, and day are
     * always required. The whole time including the T can be omitted but if there is a time it must contain at least the hours
     * and minutes. The only supported time zone is "Z".
     *
     * This function is useful for turning the date strings returned by the APEX_JSON.STRINGIFY and APEX_JSON.WRITE
     * procedures that take a DATE value into Date objects that the client can use.
     *
     * @param pDateStr String representation of a date in simplified ISO 8601 format
     * @return {Date}
     * @function
     * @memberOf apex.util
     */
    util.getDateFromISO8601String = function( pDateStr ) {
        var date, year, month, day,
            hr = 0,
            min = 0,
            sec = 0,
            ms = 0,
            m = /^(\d\d\d\d)-(\d\d)-(\d\d)(T(\d\d):(\d\d)(:(\d\d)(.(\d\d\d))?)?Z?)?$/.exec( pDateStr );

        if ( !m ) {
            throw "Invalid date format";
        }

        year = parseInt( m[1], 10 );
        month = parseInt( m[2], 10 ) - 1;
        day = parseInt( m[3], 10 );
        if ( m[5] ) {
            hr = parseInt( m[5], 10 );
            min = parseInt( m[6], 10 );
            if ( m[8] ) {
                sec = parseInt( m[8], 10 );
                if ( m[10] ) {
                    ms = parseInt( m[10], 10 );
                }
            }
        }
        date = new Date( Date.UTC( year, month, day, hr, min, sec, ms ) );
        return date;
    };

    /*
     * Cache the top most APEX object. The top most APEX object is
     * the one in the window object closest to the top that we have access to.
     */
    var gTopApex = null;

    /*
     * Return the apex object from the top most APEX window.
     * This is only needed in rare special cases involving iframes
     * Not for public use
     */
    util.getTopApex = function() {
        var curWindow, lastApex;

        function get(w) {
            var a;
            try {
                a = w.apex || null;
            } catch( ex ) {
                a = null;
            }
            return a;
        }

        // return cached answer if any
        if ( gTopApex !== null ) {
            return gTopApex;
        }

        // try for the very top
        gTopApex = get( top );
        if ( gTopApex !== null ) {
            return gTopApex;
        }

        // stat at the current window and go up the parent chain until there is no apex that we can access
        curWindow = window;
        for (;;) {
            lastApex = get( curWindow );
            if ( lastApex === null || !curWindow.parent || curWindow.parent === curWindow ) {
                break;
            }
            gTopApex = lastApex;
            curWindow = curWindow.parent;
        }
        return gTopApex;
    }

})( apex.util, apex.jQuery );

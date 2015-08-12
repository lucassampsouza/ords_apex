/*global apex,console*/
/*!
 debug.js
 Copyright (c) 2012, 2014, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * The {@link apex}.debug namespace is used to store all debug functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.debug = {};

/* API for compatibility. Use apex.debug.log instead */
apex.debug = function() {
    "use strict";

    apex.debug.log.apply( this, arguments );
}; // debug


(function( debug, $, undefined ) {
    "use strict";

    function noop() {
    }

    // ie7 doesn't support the apply method on console methods such as log so we have this lame version of logging
    function ie7log(a,b,c) {
        if ( c !== undefined ) {
            console.log(a,b,c);
        } else if ( b !== undefined ) {
            console.log(a,b);
        } else {
            console.log(a);
        }
    }

    var gDebugLogLevel = -1,
        log = noop,
        error = noop,
        warn = noop,
        info = noop;

    if ( window.console && console.log ) {
        if ( typeof console.log.apply === "undefined" ) {
            log = ie7log;
            error = ie7log;
            warn = ie7log;
            info = ie7log;
        } else {
            log = console.log;
            if ( console.error ) {
                error = console.error;
            } else {
                error = console.log;
            }
            if ( console.warn ) {
                warn = console.warn;
            } else {
                warn = console.log;
            }
            if ( console.info ) {
                info = console.info;
            } else {
                info = console.log;
            }
        }
    }

    /*
     * Log level constants
     */
    debug.LOG_LEVEL = {
        OFF: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 4,
        APP_TRACE: 6,
        ENGINE_TRACE: 9
    };

    /**
     * Method that returns the debug log level.
     * The debug log level is synchronized with hidden item "#pdebug"
     *
     * @returns logging level as an integer 1 to 9 or 0 to indicated debug logging is turned off
     *
     * @example
     * apex.debug.log("Level=", apex.debug.getLevel());
     *
     * @memberOf apex.debug
     */
    debug.getLevel = function() {
        var lDebugValue;

        if ( gDebugLogLevel < 0 ) {
            lDebugValue = $( "#pdebug", apex.gPageContext$ ).val();

            if ( lDebugValue === "YES" ) {
                gDebugLogLevel = debug.LOG_LEVEL.INFO;
            } else {
                if ( /^LEVEL[0-9]$/.test( lDebugValue ) ) {
                    gDebugLogLevel = parseInt( lDebugValue.substr( 5 ), 10 );
                } else {
                    gDebugLogLevel = debug.LOG_LEVEL.OFF;
                }
            }
        }
        return gDebugLogLevel;
    }; // getLevel

    /**
     * Sets the debug log level.
     * Log messages at or below the specified level are written to the console log.
     *
     * @param {Number} pLevel A number from 1 to 9 where level 1 is most important and level 9 is
     * least important. Can be one of the LOG_LEVEL constants. Any other value such as 0 will turn off debug logging.
     */
    debug.setLevel = function( pLevel ) {
        var lLevel, lPdebug$,
            lOldLevel = gDebugLogLevel;

        gDebugLogLevel = typeof pLevel === "number" ? pLevel : debug.LOG_LEVEL.OFF;
        if ( gDebugLogLevel < 0 || gDebugLogLevel > 9 ) {
            gDebugLogLevel = debug.LOG_LEVEL.OFF;
        }
        if ( gDebugLogLevel !== lOldLevel ) {
            lLevel = "LEVEL" + gDebugLogLevel;
            lPdebug$ = $( "#pdebug", apex.gPageContext$ );
            if ( lPdebug$.length === 0 ) {
                lPdebug$ = $( "<input id='pdebug' type='hidden' name='p_debug'>" ).prependTo( $( "#wwvFlowForm", apex.gPageContext$ ) );
            }
            lPdebug$.val( lLevel );
        }
    }; // setLevel

    /**
     * Log a message at the given debug log level. The log level set from the server or with apex.debug.setLevel
     * controls if the message is actually written. If the set log level is >= pLevel then the message is written.
     * Messages are written using the browsers built-in console logging if available. Older browsers may not support
     * the console object or all of its features.
     *
     * @param {Number} pLevel the log level of the message 1 to 9
     * @param {...*} arguments Any number of parameters which will be logged to the console
     *
     * @example
     * apex.debug.message( 7, "Testing" );
     *
     * @memberOf apex.debug
     **/
    debug.message = function( pLevel ) {
        var fn = log;
        // don't have trace and the other methods call this one because of the extra function call and arguments processing overhead
        // Only log message if running in APEX 'Debug Mode' and level is pLevel or more
        if ( debug.getLevel() >= pLevel && pLevel > 0) {
            if ( pLevel === debug.LOG_LEVEL.ERROR ) {
                fn = error;
            } else if ( pLevel <= debug.LOG_LEVEL.WARN ) {
                fn = warn;
            } else if ( pLevel <= debug.LOG_LEVEL.INFO ) {
                fn = info;
            }
            fn.apply( console, Array.prototype.slice.call( arguments, 1 ) );
        }
    }; // message

    /**
     * Log an error message. The error function always writes the error regardless of the log level from the server
     * or set with apex.debug.setLevel.
     * Messages are written using the browsers built-in console logging if available. If supported console.trace is called.
     * Older browsers may not support the console object or all of its features.
     *
     * @param {...*} arguments Any number of parameters which will be logged to the console
     *
     * @example
     * apex.debug.error( "Update Failed" );
     * apex.debug.error( "Exception: ", ex );
     *
     * @memberOf apex.debug
     **/
    debug.error = function() {
        // always log errors
        error.apply( console, arguments );
        // some console implementations include a trace in the error output but for those that don't...
        if ( console.trace ) {
            console.trace();
        }
        // todo consider adding a stack trace for browsers that don't support trace
    };  // error

    /**
     * Log a warning message. Similar to apex.debug.message with the level set to WARN.
     *
     * @param {...*} arguments Any number of parameters which will be logged to the console
     *
     * @memberOf apex.debug
     **/
    debug.warn = function() {
        // Only log message if running in APEX 'Debug Mode' and level is WARN or more
        if ( debug.getLevel() >= debug.LOG_LEVEL.WARN ) {
            warn.apply( console, arguments );
        }
    }; // warn

    /**
     * Log an informational message. Similar to apex.debug.message with the level set to INFO.
     *
     * @param {...*} arguments Any number of parameters which will be logged to the console
     *
     * @memberOf apex.debug
     **/
    debug.info = function() {
        // Only log message if running in APEX 'Debug Mode' and level is INFO or more
        if ( debug.getLevel() >= debug.LOG_LEVEL.INFO ) {
            info.apply( console, arguments );
        }
    }; // info

    /**
     * Log a trace message. Similar to apex.debug.message with the level set to APP_TRACE.
     *
     * @param {...*} arguments Any number of parameters which will be logged to the console
     *
     * @memberOf apex.debug
     **/
    debug.trace = function() {
        // Only log message if running in APEX 'Debug Mode' and level is APP_TRACE or more
        if ( debug.getLevel() >= debug.LOG_LEVEL.APP_TRACE ) {
            log.apply( console, arguments );
        }
    };  // trace

    /**
     * Log a message. Similar to apex.debug.message with the level set to the highest level.
     *
     * @param {...*} arguments Any number of parameters which will be logged to the console
     *
     * @memberOf apex.debug
     **/
    debug.log = function() {
        // Only log message if running in APEX 'Debug Mode'
        if ( debug.getLevel() > debug.LOG_LEVEL.OFF ) {
            log.apply( console, arguments );
        }
    }; // log

    /*
     * For internal use only
     */
    debug.deprecated = function( message ) {
        debug.warn( "DEPRECATED: " + message );
    };

})( apex.debug, apex.jQuery );

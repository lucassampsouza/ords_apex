/*global apex*/
/*!
 lang.js
 Copyright (c) 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex}.lang namespace is used for localization related functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.lang = {};

( function( lang, util, debug, $, undefined ) {
    "use strict";

    /*
     * Localized text and message formatting support
     */
    var gMessages = {}; // mapping from message key to localized text

    /**
     * Add messages for use by getMessage and the format functions. Can be called multiple times. Additional
     * messages are merged.
     *
     * @param  {Object} pMessages   An object whose properties are message keys and the values are localized message text.
     *
     * @function addMessages
     * @memberOf apex.lang
     **/
    lang.addMessages = function( pMessages ) {
        $.extend( gMessages, pMessages );
    };

    /**
     * Remove all messages.
     *
     * @function clearMessages
     * @memberOf apex.lang
     **/
    lang.clearMessages = function( ) {
        gMessages = {};
    };

    /**
     * Return the message associated with the given key. The key is looked up in the messages added with addMessages.
     *
     * @param  {String} pKey   The message key
     * @return {String}  The localized message text. If the key is not found then the key is returned.
     *
     * @function getMessage
     * @memberOf apex.lang
     **/
    lang.getMessage = function( pKey ) {
        var msg;

        msg = gMessages[ pKey ];
        return ( msg === null || msg === undefined ) ? pKey : msg;
    };

    // unsafe means that the arguments need to be escaped
    // set unsafe to false when the arguments are already escaped or the
    // resulting string will be escaped
    function formatMessage( pUnsafe, pPattern ) {
        var re = /%([0-9,%])/g;
        var args;
        if ( $.isArray( arguments[ 2 ])) {
            args = arguments[ 2 ];
        } else {
            args = Array.prototype.slice.call( arguments, 2 );
        }
        var count = 0;
        var result = pPattern.replace( re, function( m, p1 ) {
            var n;

            if ( p1 === "%" ) {
                return "%";
            }
            n = parseInt( p1, 10 );
            count++;
            if ( n >= args.length ) {
                throw "format(" + pPattern + "): too few arguments";
            }
            return pUnsafe ? util.escapeHTML( args[n] + "" ) : args[ n ];
        });
        if ( count < args.length ) {
            debug.error( "Format(" + pPattern + "): too many arguments. Expecting " + count + ", got " + args.length );
        }
        return result;
    }

    /**
     * Format a message. Parameters in the message %0 to %9 are replaced with the corresponding function argument.
     * Use %% to include a single %. The replacement arguments are HTML escaped.
     *
     * @param  {String} pKey   The message key. The key is used to lookup the localized message text as if with getMessage.
     * @param  {String...} optional replacement values one for each message parameter %0 to %9
     * @return {String}  The localized and formatted message text. If the key is not found then the key is returned.
     *
     * @function formatMessage
     * @memberOf apex.lang
     **/
    lang.formatMessage = function( pKey ) {
        var pattern = lang.getMessage( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    };

    /**
     * Same as formatMessage except the message pattern is given directly (already localized or isn't supposed to be)
     * It is not a key.
     */
    lang.format = function( pPattern ) {
        var args = Array.prototype.slice.call( arguments, 1 );
        return formatMessage( true, pPattern, args );
    };

    /**
     * Same as formatMessage except the replacement arguments are not HTML escaped. They must be known to be safe or
     * will be used in a context that is safe.
     */
    lang.formatMessageNoEscape = function(  pKey ) {
        var pattern = lang.getMessage( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.formatNoEscape.apply( this, args );
    };

    /**
     * Same as format. Also the replacement arguments are not HTML escaped. They must be known to be safe or
     * will be used in a context that is safe.
     */
    lang.formatNoEscape = function( pPattern ) {
        var args = Array.prototype.slice.call( arguments, 1 );
        return formatMessage( false, pPattern, args );
    };

})( apex.lang, apex.util, apex.debug, apex.jQuery );

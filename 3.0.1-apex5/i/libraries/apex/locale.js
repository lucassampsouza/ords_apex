/*global apex*/
/*!
 locale.js
 Copyright (c) 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex}.locale namespace is used for locale related functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.locale = {};

( function( locale ) {
    "use strict";

    var gOptions  = {   // locale depending settings
            separators: {
                group:   ",",
                decimal: "."
            }
        };

    /**
     * init is used to set the language and territory depending settings like the used separator for numbers.
     * It is generally not necessary to call this function, because it is automatically called by APEX.
     *
     * @param  {Object} pOptions   An object whose properties are used as language/territory depending settings.
     *
     * @function init
     * @memberOf apex.locale
     */
    locale.init = function( pOptions ) {
        gOptions = pOptions;
    };


    /**
     * Return the territory specific group separator for numeric values.
     *
     * @return {String}  The group separator. For example "," (US) or "." (Germany).
     *
     * @function getGroupSeparator
     * @memberOf apex.locale
     */
    locale.getGroupSeparator = function() {
        return gOptions.separators.group;
    };

    /**
     * Return the territory specific decimal separator for numeric values.
     *
     * @return {String}  The decimal separator. For example "." (US) or "," (Germany).
     *
     * @function getDecimalSeparator
     * @memberOf apex.locale
     */
    locale.getDecimalSeparator = function() {
        return gOptions.separators.decimal;
    };

})( apex.locale );

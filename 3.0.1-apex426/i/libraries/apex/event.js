/*global apex*/

/**
 * @fileOverview
 * The {@link apex}.event namespace is used to store all event related functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.event = {};

(function( event, $ ) {
    "use strict";

event.gCancelFlag = false;

/**
 * Function used to trigger custom events, return value defines if the event should be cancelled.
 *
 * @param {apex.jQuery} pSelector jQuery object for which the event will be triggered.
 * @param {String} pEvent The name of the event
 * @param {String|Array} [pData] Optional additional parameters to pass along to the event handler
 *
 * return {boolean}
 *
 * @example
 * lCancelEvent = apex.event.trigger('#myLink', 'click');
 * lCancelEvent = apex.event.trigger('#myLink', 'click', 'apples');
 * lCancelEvent = apex.event.trigger('#myLink', 'click', ['apples','pears']);
 *
 * @function trigger
 * @memberOf apex.event
 **/
event.trigger = function( pSelector, pEvent, pData ) {

        // Default to false, event cancelling should only be done if an event handler says so
        // (by setting this flag to true).
        event.gCancelFlag = false;

        // Trigger event
        $( pSelector, apex.gPageContext$ ).trigger( pEvent, pData );

        // Return the value of gCancelFlag
        return event.gCancelFlag;
    };
})( apex.event, apex.jQuery);

/*!
 Tooltip Manager
 Copyright (c) 2014, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * A utility for managing multiple jQuery UI tooltip widgets.
 * One issue with the jQuery UI tooltip widget is that it is possible for more than one tooltip to be open at once.
 * This is undesirable because they compete for the users attention. It happens when one tooltip is shown because
 * the element has focus and another tooltip is show because of mouse hover.
 * Simply including this module will solve the multiple tooltip open issue.
 * The apex.tooltipManager has a few utility functions for working with tooltips as well.
 */

/*global apex*/

(function ( apex, $, undefined ) {
   "use strict";

    var lastToolTipEvent = null;

    function closeLastTooltip() {
        var prevTipWidget, fakeEvent;
        if ( lastToolTipEvent ) {
            prevTipWidget = lastToolTipEvent.target;
            fakeEvent = $.Event( lastToolTipEvent );
            fakeEvent.target = fakeEvent.currentTarget = lastToolTipEvent.originalEvent.target;
            $( prevTipWidget ).tooltip( "close", fakeEvent );
        }
    }

    apex.tooltipManager = {
        /**
         * Close the currently open tooltip if any.
         */
        closeTooltip: closeLastTooltip,

        /**
         * Disable all tooltips on the page
         */
        disableTooltips: function() {
            this.closeTooltip();
            $(document.body).find( ":data(ui-tooltip)" ).tooltip( "disable" );
        },

        /**
         * Enable all tooltips on the page
         */
        enableTooltips: function() {
            $(document.body).find( ":data(ui-tooltip)" ).tooltip( "enable" );
        },

        /**
         * Return the default show option object with preferred delay and duration to show the tooltip.
         * Pass the return from this method as the value of the show option in a call to create a tooltip.
         * @return {Object}
         */
        defaultShowOption: function() {
            return {
                delay: 1000,
                effect: "show",
                duration: 500
            };
        }
    };

    $( document ).ready(function() {

        $( document.body ).on( "tooltipopen", function( event, ui ) {
            closeLastTooltip();
            lastToolTipEvent = event;
        } ).on( "tooltipclose", function( event, ui ) {
            if ( lastToolTipEvent && event.originalEvent && lastToolTipEvent.originalEvent.target === event.originalEvent.target ) {
                lastToolTipEvent = null;
            }
        } );

    });

})( apex, apex.jQuery );

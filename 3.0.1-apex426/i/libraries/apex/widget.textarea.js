/**
 * @fileOverview
 * The {@link apex.widget}.textarea is used for the text area widget of Oracle Application Express.
 **/
/*global apex*/
(function( widget, $, undefined ) {

/**
 * @param {String} pId jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function textarea
 * @memberOf apex.widget
 * */
widget.textarea = function( pId, pOptions ) {

    var gTextarea = $( "#" + pId, apex.gPageContext$ ),
        gOptions  = $.extend( {
                        isResizable:    false,
                        hasCharCounter: false,
                        maxChar:        null
                        }, pOptions );

    // exit if the id didn't exist
    if ( gTextarea.length===0 ) {
        return;
    }

    /**
     * Adds the necessary events to an object with appended size-bar to make it resizeable
     * */
    function resizable() {
        // static closure variables used by startResize and performResize
        var gMinWidth, gMinHeight,
            gOffsetX = null,
            gOffsetY = null;

        // In the past a resizable textarea could not be made smaller than it's original size
        // but then when we switched to using native resizable text areas which are supported by most browsers
        // that behavior changed textareas can be made smaller than their original size.
        // So be consistent with other browser behavior.
        gMinWidth = parseInt( gTextarea.css("min-width"), 10) || 20;
        gMinHeight = parseInt( gTextarea.css("min-height"), 10) || 20;

        // Add the grid handler
        gTextarea.after( '<div class="apex_size_bar"><div class="apex_size_grip"></div></div>' );

        // Add the mouse events to the size bar divs
        $( "div.apex_size_bar, div.apex_size_grip", gTextarea.parent()).mousedown( startResize );

        // The textarea will have a width based on cols. Need to have the size bar div under it
        // have the same width as the textarea. Copying the outerWidth of the textarea to the
        // parent would work but not if the textarea is not visible (for example if it were in a hide/show region)
        // By forcing the parent to be display: inline-block it will take whatever size its children have.
        gTextarea.parent().css("display:inline-block");

        /**
         * Function called when the mouse button has been pressed in the size-bar div
         * */
        function startResize( pEvent ) {
            gOffsetX = gTextarea.width()  - pEvent.pageX;
            gOffsetY = gTextarea.height() - pEvent.pageY;
            gTextarea.css( "opacity", 0.25);
            $( document )
                .bind( "mousemove.apex_startResize", function( pE ){ return performResize(pE, ( $(pEvent.currentTarget).css( "cursor" ) === "se-resize" ));})
                .bind( "mouseup.apex_startResize", endResize );
            return false;
        } // startResize

        /**
         * Function called when the mouse is moved while the button is pressed in
         * the size bar div
         * Parameter pSetWidth should only be set if the size bar has been selected
         * in the right corner of the size bar
         * */
        function performResize( pEvent, pSetWidth ) {
            var lWidth;
            gTextarea.height( Math.max(gMinHeight, gOffsetY + pEvent.pageY) + "px" );
            if ( pSetWidth ) {
                lWidth = Math.max( gMinWidth, gOffsetX + pEvent.pageX );
                gTextarea.width( lWidth );
            }
            return false;
        } // performResize

        /**
         * Function called when the mouse button is released in the size bar div
        * this will de-register the events and restore the opacity of the textarea.
        * */
        function endResize( pEvent ) {
            $( document )
                .unbind( "mousemove.apex_startResize" )
                .unbind( "mouseup.apex_startResize" );
            gTextarea.css( "opacity", 1);
        } // endResize
    } // resizable

    /**
     * Function called when textarea gets focus or a character is typed to update
     * the character counter attached to the textarea.
     * */
    function charCount() {

        // Always count line breaks as two characters, because independent of the OS it will always be transmitted as CR LF
        // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1 (bug #18273866)
        var lLength  = gTextarea.val().replace(/\n/g, "xx").length,
            lPctFull = lLength / gOptions.maxChar * 100;

        // remove characters which are above the limit and highlight the field
        if ( lLength >= gOptions.maxChar ) {
            gTextarea.val( gTextarea.val().substr( 0, gOptions.maxChar ));
            gTextarea.css( "color", "red" );
            gCounter.html( gOptions.maxChar );
        } else {
            gTextarea.css( "color", "black" );
            gCounter.html( lLength );
        }
        // only show the counter area if something has been entered
        if ( lLength > 0 ) {
            gCountDiv.show();
        } else {
            gCountDiv.hide();
        }
        // show a color indicator for counter area
        if ( lPctFull > 95 ) {
            gCountDiv.css( "color", "red" );
        } else if ( lPctFull >= 90 ) {
            gCountDiv.css( "color", "#EAA914" );
        } else {
            gCountDiv.css( "color", "black" );
        }
    } // charCount

    // make textarea resizable
    if ( gOptions.isResizable ) {
        // Use the browser native resize, but fallback to our own resize if the browser doesn't support it
        if ( typeof document.documentElement.style.resize === "string" ) {
            gTextarea.css("resize", "both");
        } else {
            resizable();
        }
    }
    // add character counter
    if ( gOptions.hasCharCounter ) {
        var gCountDiv = $( "#" + pId + "_CHAR_COUNT", apex.gPageContext$ ),
            gCounter  = $( "#" + pId + "_CHAR_COUNTER", apex.gPageContext$ );
        gTextarea
            .change( charCount )
            .keyup( charCount )
            .focus( charCount );
        // Always recalculate count to avoid wrong value in FF (bug# 10011941)
        charCount();
    }

    // Let's hide/show the fieldset so that the resizebar is covered as well
    /* NOTE these show/hide functions only get called if the item is not contained in an element with ID
     *    '#' + _self.node.id + '_CONTAINER'
     * If there is a container element then the base item functionality take over completely
     */
    apex.widget.initPageItem( pId, {
        show: function() {
            gTextarea.closest( "fieldset" ).show();
        },
        hide: function() {
            gTextarea.closest( "fieldset" ).hide();
        }
        });

}; // textarea

})( apex.widget, apex.jQuery );

/*global apex,$x,$v*/
/**
 * @fileOverview
 * This file holds {@link apex.widget} namespace.
 * Copyright (c) 2012, 2014, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @namespace
 */
apex.widget = {

  /**
   * Shows a wait popup. A wait popup consists of an overlay div that keeps the user from clicking on any part of the page
   * along with a visual "spinner" animation of some kind.
   *
   * This is intended to be used just prior to submitting the page such that the page (and hence this popup) will soon be
   * replaced with a new page. If you do need to close the popup, use the "remove" function of the returned object. 
   * See showSpinner and delayLinger in the util namespace for a low level solution more suitable for ajax requests or
   * other long running processes.
   *
   * @param {String} [pContent] HTML code for a wait indicator. If it is not provided, the default CSS animation
   *                            wait indicator will be displayed.
   * @return {Object} Object with a function "remove" that closes the popup.
   **/
  waitPopup: function( pContent ) {
    var lWaitPopup$,   // DOM for popup and wait overlay
        lPopup$,       // popup only
        lSpinner;      // spinner within wait overlay

    if ( pContent ) {
        lWaitPopup$ = apex.jQuery( '<div id="apex_wait_popup" class="apex_wait_popup"></div><div id="apex_wait_overlay" class="apex_wait_overlay"></div>' ).prependTo( 'body' );
        lPopup$     = lWaitPopup$.first();
        if ( pContent.indexOf( "<img" ) >= 0 ) {
            lPopup$.hide();
        }
        // Typically if content is supplied then it will include an animated gif image. When the page is submitted right
        // after an image is inserted the browser may not actually bother to load it (why should it - the page is going away).
        // So we insert the content from a timer so that images will get loaded.
        window.setTimeout( function() {
            lPopup$.html( pContent ).find( "img" ).hide()
                .on( "load", function() {
                    $( this ).show();
                    lPopup$.show();
                });
        }, 10 );
    } else {
        lWaitPopup$ = apex.jQuery( '<div id="apex_wait_overlay" class="apex_wait_overlay"></div>' ).prependTo( "body" );
        window.setTimeout( function() {
            // do this from a timer because in the fallback case where an image is used it needs to be done
            // separate from the submit in order for the image to be shown
            if ( lWaitPopup$ !== undefined ) {
                lSpinner = apex.util.showSpinner();
            }
        }, 10 );

        // it is probably already visible but just to make sure
        lWaitPopup$.css( "visibility", "visible" );
    }
    return {
        remove: function() {
            if ( lSpinner !== undefined ) {
                lSpinner.remove();
            }
            lWaitPopup$.remove();
            lWaitPopup$ = undefined;
        }
    };
  } // waitPopup

}; // apex.widget

/**
 * Given a page item name different options can be registered for a page item with the
 * Application Express JavaScript framework. This is necessary to seamlessly integrate
 * a plug-in item type with the built-in page item related JavaScript functions of
 * Application Express.
 *
 * @param {DOM node | String} pName    APEX page item identified by its name/DOM ID or the entire DOM node.
 * @param {Object}            pOptions Object of options to specify callbacks for specific events and the nullValue. Supported
 *                                     callbacks: getValue, setValue, enable, disable, show, hide, afterModify.
 *
 * @example
 *
 * apex.widget.initPageItem(
 *   "P100_COMPANY_NAME",
 *   { getValue: function(){},
 *     setValue: function(){},
 *     nullValue: "%null%"
 *   }
 * );
 *
 */
apex.widget.initPageItem = function (pName, pOptions) {
    apex.item(pName, pOptions);
};

/**
 * Allows to upload the content of a textarea as CLOB
 * @namespace
 * */
apex.widget.textareaClob = {
  upload: function(pItemName, pRequest) {
    var lClob = new apex.ajax.clob(function(){
                                     if      (p.readyState === 1){}
                                     else if (p.readyState === 2){}
                                     else if (p.readyState === 3){}
                                     else if (p.readyState === 4){
                                       $s(pItemName, "");
                                       apex.submit(pRequest);
                                     } else {
                                       return false;
                                     }
                                   });
    lClob._set($v(pItemName));
  }
};

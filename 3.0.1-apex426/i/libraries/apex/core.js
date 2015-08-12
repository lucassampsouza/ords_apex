/**
@license

Oracle Database Application Express, Release 5.0

Copyright (c) 1999, 2014, Oracle and/or its affiliates. All rights reserved.

The Programs (which include both the software and documentation) contain proprietary information; they are provided under a license agreement containing restrictions on use and disclosure and are also protected by copyright, patent, and other intellectual and industrial property laws. Reverse engineering, disassembly, or decompilation of the Programs, except to the extent required to obtain interoperability with other independently created software or as specified by law, is prohibited.
The information contained in this document is subject to change without notice. If you find any problems in the documentation, please report them to us in writing. This document is not warranted to be error-free. Except as may be expressly permitted in your license agreement for these Programs, no part of these Programs may be reproduced or transmitted in any form or by any means, electronic or mechanical, for any purpose.
If the Programs are delivered to the United States Government or anyone licensing or using the Programs on behalf of the United States Government, the following notice is applicable:
U.S. GOVERNMENT RIGHTS Programs, software, databases, and related documentation and technical data delivered to U.S. Government customers are "commercial computer software" or "commercial technical data" pursuant to the applicable Federal Acquisition Regulation and agency-specific supplemental regulations. As such, use, duplication, disclosure, modification, and adaptation of the Programs, including documentation and technical data, shall be subject to the licensing restrictions set forth in the applicable Oracle license agreement, and, to the extent applicable, the additional rights set forth in FAR 52.227-19, Commercial Computer Software--Restricted Rights (June 1987). Oracle USA, Inc., 500 Oracle Parkway, Redwood City, CA 94065.
The Programs are not intended for use in any nuclear, aviation, mass transit, medical, or other inherently dangerous applications. It shall be the licensee's responsibility to take all appropriate fail-safe, backup, redundancy and other measures to ensure the safe use of such applications if the Programs are used for such purposes, and we disclaim liability for any damages caused by such use of the Programs.
Oracle, JD Edwards, PeopleSoft, and Siebel are registered trademarks of Oracle Corporation and/or its affiliates. Other names may be trademarks of their respective owners.
The Programs may provide links to Web sites and access to content, products, and services from third parties. Oracle is not responsible for the availability of, or any content provided on, third-party Web sites. You bear all risks associated with the use of such content. If you choose to purchase any products or services from a third party, the relationship is directly between you and the third party. Oracle is not responsible for: (a) the quality of third-party products or services; or (b) fulfilling any of the terms of the agreement with the third party, including delivery of products or services and warranty obligations related to purchased products or services. Oracle is not responsible for any loss or damage of any sort that you may incur from dealing with any third party.
*/

/**
 * @fileOverview
 * This file holds the main Application Express namespace and settings for jQuery.
 **/

/*
 * Backfill for old browsers
 */
if (typeof Object.create !== 'function') {
    Object.create = (function() {
        function F() {}
        return (function (o) {
            if (arguments.length !== 1) {
                throw new Error('This Object.create implementation only accepts one parameter.');
            }
            F.prototype = o;
            return new F();
        });
    })();
}

/**
 * Main namespace for Oracle Application Express.
 *
 * @namespace
 */
var apex = {};

/**
 * Create our own jQuery namespace to allow different versions of jQuery on a page.
 * {@link apex.jQuery} will always point to the version which gets shipped with Oracle Application Express
 * and has to be used for all jQuery references in our libraries.
 *
 * @namespace
 */
apex.jQuery = jQuery;

(function( $, undefined ) {
    "use strict";

// Used to restrict jQuery selectors to the currently active desktop/jQM page
apex.gPageContext$ = $( document );
apex.gParentPageContext$ = apex.gPageContext$;

$( document ).on( "pagebeforecreate pageshow", function(pEvent) {

    var lNewPageContext$ = $( pEvent.target );

    if ( lNewPageContext$.data( "role" ) === "dialog" ) {

        // Don't change our page context if it's the dialog box of a selectlist, because that causes troubles when a
        // value is picked (bug# 16527183)
        if ( lNewPageContext$.has( "[role='listbox']" ).length === 1 ) {
            apex.gPageContext$ = apex.gParentPageContext$;
        } else {
            apex.gPageContext$ = $( pEvent.target );
        }
    } else {
        apex.gPageContext$ = $( pEvent.target );
        apex.gParentPageContext$ = apex.gPageContext$;
    }
});

$( document ).on( "pageshow", function(pEvent) {

    var lData = $( pEvent.target ).data();

    // if our optional data attributes data-apex-page-transition and data-apex-popup-transition are set for the page DIV,
    // use it to set the default transitions for the current jQM page
    if ( lData.apexPageTransition ) {
        $.mobile.defaultPageTransition = lData.apexPageTransition;
    }
    if ( lData.apexPopupTransition ) {
        $.mobile.defaultDialogTransition = lData.apexPopupTransition;
    }
} );

    var resizeTimerId;
    var lastStoredHeight = 0;
    var lastStoredWidth = 0;

    // A simple debouncer for page resize events.
    $( window ).resize(function() {
        // Certain plugins (Flotchart) and browsers (IE 8 and below) sometimes spam window resize events when the window
        // is not actually resizing. This guard prevents such spam events from triggering
        // an apexwindowresized event, by checking to see if the window height and width has changed since the
        // event was last fired.
        if ($( window ).height() == lastStoredHeight && $( window ).width() == lastStoredWidth) {
            return;
        }
        lastStoredHeight = $( window ).height();
        lastStoredWidth = $( window ).width();
        if ( resizeTimerId ) {
            clearTimeout( resizeTimerId );
        }
        resizeTimerId = setTimeout( function() {
            $( window ).trigger( "apexwindowresized" );
            resizeTimerId = null;
        }, 200);
    });


    //IE Detection code borrowed from CodeMirror 4.4
    // ie_uptoN means Internet Explorer version N or lower
    var ie_upto10 = /MSIE \d/.test(navigator.userAgent);
    var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
    var ie = ie_upto10 || ie_11up;
    var ie_version = ie && (ie_upto10 ? document.documentMode || 7 : ie_11up[1]);

    // Specifically designed for older themes that do not have the proper IE conditionals necessary for styling the body.
    if ( ie_version === 7 ) {
        $( "html" ).addClass( "ie7 lt-ie8 lt-ie9 lte-ie9 lte-ie10" );
    } else if ( ie_version === 8 ) {
        $( "html" ).addClass( "ie8 lt-ie9 lte-ie9 lte-ie10" );
    } else if ( ie_version === 9 ) {
        $( "html" ).addClass( "ie9 lte-ie9 lte-ie10" );
    } else if ( ie_version === 10 ) {
        $( "html" ).addClass( "ie10 lte-ie10" );
    }

})( apex.jQuery );

/*global apex*/
/**
 @license
 Oracle Database Application Express, Release 5.0
 Copyright © 2014, Oracle. All rights reserved.
 */
/**
 * @fileOverview
 * Search results functionality for navigating to the source of the search result items.
 **/

(function( $, nav, undefined ) {
    "use strict";

    var BUILDER_WINDOW_NAME = "APEX_BUILDER";

    function isOpenerApexBuilder() {
        try {
            // builder urls are in the 4000s
            if ( window.opener && !window.opener.closed && window.opener.apex &&
                window.opener.apex.jQuery &&
                ( window.opener.location.href.match(/f?p=4\d\d\d:/) || window.opener.document.getElementById("pFlowId") ) ) {
                return true;
            }
        } catch ( ex ) {
            return false; // window must contain a page from another domain
        }
        return false;
    }

    function getBuilderInstance() {
        return $( "#pInstance" ).val();
    }

    function navigateInPageDesigner( appId, pageId, typeId, componentId, errorFn ) {
        if ( isOpenerApexBuilder() && window.opener.pageDesigner ) {
            window.opener.pageDesigner.setPageSelection( appId, pageId, typeId, componentId, function( result ) {
                if ( result !== "OK" ) {
                    errorFn();
                }
            });
            // Focus the builder window now while still handling the click event even though controlling the page designer may still fail
            nav.openInNewWindow( "", BUILDER_WINDOW_NAME, { altSuffix: getBuilderInstance() } );
        } else {
            errorFn();
        }
    }

    function navigateInBuilderWindow( url ) {
        var instance = getBuilderInstance();

        nav.openInNewWindow( url, BUILDER_WINDOW_NAME, { altSuffix: instance } );
    }
    // expose these for use by DAs
    window.navigateInBuilderWindow = navigateInBuilderWindow;
    window.doSearch = function() {
        $("#search_results").hide();
        apex.submit({showWait: true});
    };

    function openDialog( url, options, classes, btn ) {
        // Caution! this code makes many assumptions about how the builder opens modal dialog pages
        options = options.replace(/([\-_a-zA-Z]*):/g, function(m, a) { return '"' + a + '":';} );
        options = options.replace(/\'/g, "\"");
        options = options.replace(/\\u(\d\d\d\d)/, function(m,n) { return String.fromCharCode(parseInt(n, 16)); } );
        url = url.replace(/\\u(\d\d\d\d)/, function(m,n) { return String.fromCharCode(parseInt(n, 16)); } );
        nav.dialog( url, JSON.parse(options), classes, btn );
    }

    $( document ).ready( function() {

        $( "button.edit-button" ).click( function( event ) {
            var appId, pageId, componentId, url, match,
                btn$ = $( this ),
                instance = getBuilderInstance(),
                typeId = btn$.attr( "data-typeid" );

            if ( typeId ) {
                appId = btn$.attr( "data-appid" );
                pageId = btn$.attr( "data-pageid" );
                componentId = btn$.attr( "data-componentid" );
                navigateInPageDesigner( appId, pageId, typeId, componentId, function() {
                    var url = "f?p=4000:4500:" + instance +
                        "::NO:1,4150:FB_FLOW_ID,FB_FLOW_PAGE_ID,F4000_P1_FLOW,F4000_P4150_GOTO_PAGE,F4000_P1_PAGE:" + appId +
                        "," + pageId +
                        "," + appId +
                        "," + pageId +
                        "," + pageId +
                        "#" + typeId + ":" + componentId;
                    navigateInBuilderWindow( url );
                } );
            } else {
                url = btn$.attr( "data-link" );
                // in the case of a URL that opens a dialog we can't just eval that code
                // Caution! this code makes many assumptions about how the builder opens modal dialog pages
                match = /'(f\?p.*p_dialog_cs[^']*)',(\{.*\}),'([^']*)'/.exec( url );
                if ( match ) {
                    openDialog( match[1], match[2], match[3], btn$ );
                } else {
                    navigateInBuilderWindow( url );
                }
            }
            event.preventDefault();
        } );
    });

})( apex.jQuery, apex.navigation );

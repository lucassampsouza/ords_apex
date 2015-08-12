/**
 * @fileOverview
 * This plugin enhances the JQM List View widget with Oracle Application Express features.
 **/

(function( $, widget, undefined ) {
    "use strict";

/**
 * APEX specific options which are supported for the UL tag of the JQM list view.
 *
 * @param {String}  apexRegionId         Static Region Id or Region Id which identifies the region which is of type jQM List View.
 * @param {String}  apexAjaxIdentifier   AJAX identifier used to call the server part of the component.
 * @param {String}  [apexPageItems]      jQuery selector which contains the page items to be submitted with the AJAX call.
 * @param {Boolean} [apexFilter]         True if server side filtering should be used.
 **/
$.mobile.listview.prototype.options.apexRegionId = "";
$.mobile.listview.prototype.options.apexAjaxIdentifier = "";
$.mobile.listview.prototype.options.apexPageItems = "";
$.mobile.listview.prototype.options.apexFilter = "";

// Check if the script has already been loaded, because we want to avoid
// that an AJAX based page transition loads and binds the listviewcreate event
// a second time, which would cause that the enhancement is done twice!
if ( widget.jqmListView ) {
    return;
} else {
    widget.jqmListView = true;
}

$( document ).on( "listviewcreate", "ul, ol", function() {

    var lListView$ = $( this ),
        lOptions   = lListView$.data( "mobile-listview" ),
        lRegion$;

    // Don't continue if the required attributes region id and ajax identifier are not set. It's very likely that it's
    // not an AJAX enhanced list.
    if ( !lOptions.options.apexRegionId || !lOptions.options.apexAjaxIdentifier ) {
        return;
    }

    // Get the containing APEX region
    lRegion$ = lListView$.parents( "#" + lOptions.options.apexRegionId );

    // register the refresh event on the region. It's triggered by a manual refresh (eg. dynamic action "Refresh")
    lRegion$.on( "apexrefresh", _refresh );

    // register the "Load more" list entry handling for the list view
    lListView$.on( "vclick", "li.apex-load-more", _loadMore );

    // Is server side filtering used?
    if ( lOptions.options.apexFilter ) {
        _initServerSearch();
    }

    // AJAX callback to get more data for the list view
    function _ajax( pFirstRow ) {

        apex.server.plugin( lOptions.options.apexAjaxIdentifier,
            {
                pageItems: lOptions.options.apexPageItems,
                x01:       "FETCH",
                x04:       lListView$.jqmData( "apex-last-search" ),
                x05:       pFirstRow
            }, {
                dataType:         "html",
                loadingIndicator: function() {
                                      $.mobile.loading( "show" );
                                      return function() { $.mobile.loading( "hide" ); };
                                  },
                refreshObject:    lListView$,
                clear:            ( pFirstRow === 1 ? _clear : undefined ),
                success:          _addResult
            });

    } // _call

    // Load additional list entries
    function _loadMore() {

        // Get the next list entries, count number of existing LI's which are not dividers
        _ajax( $( "li[data-role!='list-divider']", lListView$ ).length );

    } // _loadMore

    // Clears the list view entries and is called before the AJAX call
    function _clear() {

        lListView$.empty();
        // let JQM know about our updates
        lListView$.listview( "refresh" );

    } // _clear

    // This function adds the result of the AJAX call to the list view and ist called by the AJAX success callback
    function _addResult( pData ) {

        var lData$             = $( pData ),
            lFirstListDivider$ = lData$.filter( "li[data-role='list-divider']:first" ),
            lLastListDivider$  = $( "li[data-role='list-divider']:last", lListView$ );

        // remove the "Load more" entry first
        $( "li.apex-load-more", lListView$ ).remove();

        // add the new result to the existing list
        lListView$.append( lData$ );

        // If the first list divider returned by the AJAX call is the same what we already have in the list, don't show it
        if ( lFirstListDivider$.text() === lLastListDivider$.text() ) {
            lFirstListDivider$.remove();
        }

        // let JQM know about our updates
        lListView$.listview( "refresh" );
    } // _addResult

    // Executes an AJAX call to get new entries starting with the first record
    function _refresh() {

        _ajax( 1 ); // Get the first record

    } // _refresh

    // Initializes the server based search field with all it's callbacks
    function _initServerSearch() {

        // Add a search field which calls our AJAX function when the user leaves the field or clicks "Search/Submit".
        // Use a similar code as in jquery.mobile.listview.filter.js

        var lWrapper$ = $( "<form>", {
                            "class": "ui-listview-filter ui-bar-" + lOptions.options.filterTheme,
                            "role": "search"
                        }),
            lSearch$  = $( "<input>", {
                            placeholder: lOptions.options.filterPlaceholder
                        })
                        .attr( "data-" + $.mobile.ns + "type", "search" )
                        // We only search if the user leaves the field or clicks "Search/Submit" in a mobile environment,
                        // That's much better for the bandwidth!
                        .bind( "change", function() {

                            var lSearch = $( this ).val();
                            lListView$.jqmData( "apex-last-search", lSearch );
                            _ajax( 1 );
                        });

        // to avoid a JS hint warning, execute it as extra statements
        lSearch$
            .appendTo( lWrapper$ )
            .textinput();

        if ( lOptions.options.inset ) {
            lWrapper$.addClass( "ui-listview-filter-inset" );
        }

        lWrapper$.bind( "submit", function() {
            return false;
        })
        .insertBefore( lListView$ );

    } // _initServerSearch

});

})( apex.jQuery, apex.widget );
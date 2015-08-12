/**
 * @fileOverview
 * The {@link apex.widget}.selectList is used for the select list widget of Oracle Application Express.
 **/

(function( widget, $ ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function selectList
 * @memberOf apex.widget
 * */
widget.selectList = function( pSelector, pOptions ) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gOptions     = $.extend({
                           optionAttributes: null,
                           nullValue:        ""
                           }, pOptions ),
        gSelectList$ = $( pSelector, apex.gPageContext$ );

    // Register apex.item callbacks
    gSelectList$.each( function() {
        if ( $.mobile ) {
            widget.initPageItem( this.id, {
                setValue:    _setValue,
                enable:      function() {
                                 gSelectList$.selectmenu( "enable" );
                             },
                disable:     function() {
                                 gSelectList$.selectmenu( "disable" );
                             },
                afterModify: function() {
                                 gSelectList$.selectmenu( "refresh" );
                             },
                nullValue:   gOptions.nullValue });
        } else {
            widget.initPageItem( this.id, {
                setValue:    _setValue,
                nullValue:   gOptions.nullValue });
        }
    });

    // Sets an existing option
    function _setValue( pValue ) {
        gSelectList$.val( pValue );
        // If we haven't selected any entry then we will pick the first list entry as most browsers
        // will automatically do for drop down select lists - except of IE9 (bug# 14837012)
        // Note: We don't do this if it's a select list where the entries are always visible
        // Note: version 1.8.3 of jQuery let the browser handle default behavior, version 1.10.2 of jQuery
        // "normalizes" behavior so all browsers select nothing! Either way we want the first option selected
        if ( gSelectList$[0].selectedIndex === -1 && parseInt( $nvl( gSelectList$.attr( "size" ), "1" ), 10 ) === 1 ) {
            gSelectList$.children( "option" ).first().prop( "selected", true );
        }
    } // _setValue

    // Clears the existing options
    function _clearList() {
        // remove everything except of the null value. If no null value is defined,
        // all options will be removed (bug #14738837)
        if ( "nullValue" in pOptions ) {
            $( 'option[value!="' + apex.util.escapeCSS( gOptions.nullValue ) + '"]', gSelectList$ ).remove();
        } else {
            $( 'option', gSelectList$ ).remove();
        }

        if( $.mobile ) {
            gSelectList$.selectmenu('refresh', true);
        }
    } // _clearList

    // Called by the AJAX success callback and adds the entries stored in the
    // JSON structure: {"values":[{"r":"10","d":"SALES"},...], "default":"xxx"}
    function _addResult( pData ) {
        var lHtml = "";
        // create an HTML string first and append it, that's faster.
        // this.r and this.d are HTML escaped on the server
        $.each( pData.values, function() {
            lHtml = lHtml + '<option value="' + this.r + '" ' + gOptions.optionAttributes + '>' + this.d + '</option>';
        });
        gSelectList$.append( lHtml );

        if( $.mobile ) {
            gSelectList$.selectmenu('refresh', true);
        }

        // Set the default value of the page item.
        // The change event is also needed by cascading LOVs so that they are refreshed with the
        // current selected value as well (bug# 9907473)
        $s( gSelectList$[0], pData[ "default" ] );
    } // _addResult

    // Clears the existing options and executes an AJAX call to get new values based
    // on the depending on fields
    function refresh() {

        widget.util.cascadingLov(
            gSelectList$,
            gOptions.ajaxIdentifier,
            {
                pageItems: $( gOptions.pageItemsToSubmit, apex.gPageContext$ )
            },
            {
                optimizeRefresh: gOptions.optimizeRefresh,
                dependingOn:     $( gOptions.dependingOnSelector, apex.gPageContext$ ),
                success:         _addResult,
                clear:           _clearList
            });

    } // refresh

    // if it's a cascading select list we have to register apexbeforerefresh and change events for our masters
    if ( gOptions.dependingOnSelector ) {
        $( gOptions.dependingOnSelector, apex.gPageContext$ )
            .bind( "apexbeforerefresh", _clearList )
            .change( refresh );
    }
    // register the refresh event which is triggered by a manual refresh
    gSelectList$.bind( "apexrefresh", refresh );

}; // selectList

})( apex.widget, apex.jQuery );

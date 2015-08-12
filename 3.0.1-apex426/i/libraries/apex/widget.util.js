/*global apex,$v */
/**
 @license
 Oracle Database Application Express
 Copyright (c) 2012, 2015, Oracle. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex.widget.util} namespace is used to store all widget utility functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.widget.util = {};

(function( util, $ ) {

/**
 * Function that implements cascading LOV functionality for an item type plug-in. This function is a wrapper of the
 * apex.server.plugin function but provides additional features.
 *
 * @param {jQuerySelector | jQuery | DOM} Identifies the page item of the item type plug-in.
 * @param {String} pAjaxIdentifier        Use the value returned by the PL/SQL package apex_plugin.get_ajax_identifier to identify your item type plug-in.
 * @param {Object} [pData]                Object which can optionally be used to set additional values which are send with the
 *                                        AJAX request. For example pData can be used to set the scalar parameters x01 - x10 and the
 *                                        arrays f01 - f20
 * @param {Object} [pOptions]             Object which can optionally be used to set additional options for the AJAX call. See apex.server.plugin
 *                                        for standard attributes. In addition pOptions supports the attributes:
 *                                          - "optimizeRefresh" Boolean to specify if the AJAX call should not be performed if one off the page items
 *                                                              specified in dependingOn is empty.
 *                                          - "dependingOn"     jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                              of which the current page item is depending on.
 * @return {jqXHR}
 *
 * @example
 *
 * apex.widget.util.cascadingLov ( pItem, pAjaxIdentifier, {
 *     x01: "test"
 *     }, {
 *     optimizeRefresh:   true,
 *     dependingOn:       "#P1_DEPTNO",
 *     pageItemsToSubmit: "#P1_LOCATION",
 *     clear:   function() { ... do something here ... },
 *     success: function( pData ) { ... do something here ... }
 *     } );
 *
 * @memberOf apex.widget.util
 **/
util.cascadingLov = function( pList, pAjaxIdentifier, pData, pOptions ) {

    var lList$     = $( pList, apex.gPageContext$ ),
        lQueueName = lList$[0] ? lList$[0].id : "lov",
        lOptions   = $.extend( {
                        optimizeRefresh: true,
                        queue: { name: lQueueName, action: "replace" }
                     }, pOptions ),
        lNullFound = false;

    // Always fire the before and after refresh event and show a load indicator next to the list
    if ( !lOptions.refreshObject ) {
        lOptions.refreshObject    = lList$;
    }
    if ( !lOptions.loadingIndicator ) {
        lOptions.loadingIndicator = lList$;
    }

    // We only have to refresh if all our depending values are not null
    if ( lOptions.optimizeRefresh ) {

        $( lOptions.dependingOn, apex.gPageContext$ ).each( function() {
            if ( apex.item( this ).isEmpty() ) {
                lNullFound = true;
                return false; // stop execution of the loop
            }
        });

        // All depending values are NULL, let's take a shortcut and not perform the AJAX call
        // because the result will always be an empty list
        if ( lNullFound ) {
            // trigger the before refresh event if defined
            lOptions.refreshObject.trigger( 'apexbeforerefresh' );

            // Call clear callback if the attribute has been specified and if it's a function
            if ( $.isFunction( lOptions.clear ) ) {
                lOptions.clear();
            }

            // Trigger the change event for the list because the current value might have changed.
            // The change event is also needed by cascading LOVs so that they are refreshed with the
            // current selected value as well (bug# 9907473)
            // If the select list actually reads data, the change event is fired in the _addResult as soon as
            // a new value has been set (in case the LOV doesn't contain a null display entry)
            lList$.change();

            // trigger the after refresh event if defined
            lOptions.refreshObject.trigger( 'apexafterrefresh' );
            return; // we are done, exit cascadingLov
        }
    }

    // Include dependingOn page items into the pageItems list
    pData.pageItems = $( pData.pageItems, apex.gPageContext$ ).add( lOptions.dependingOn );

    return apex.server.plugin( pAjaxIdentifier, pData, lOptions );

}; // cascadingLov


/**
 * Function that implements cascading LOV functionality for an item type plug-in. This function is a wrapper of the
 * apex.server.plugin function but provides additional features.
 *
 * @param {String} pAjaxIdentifier        Use the value returned by the PL/SQL package apex_plugin.get_ajax_identifier to identify your item type plug-in.
 * @param {Object} [pData]                Object which can optionally be used to set additional values which are send with the
 *                                        AJAX request. For example pData can be used to set the scalar parameters x01 - x10 and the
 *                                        arrays f01 - f20.
 *                                        NOTE: x02 is already in use by this function!
 * @param {Object} [pOptions]             Object which can optionally be used to set additional options for the popup call.
 *                                          - "filterOutput"     Boolean to specify if parameter "filterObject" should be used.
 *                                          - "filterValue"      String which is used to restrict the popup LOV output.
 *                                          - "windowParameters" xxx
 *
 * @example
 *
 * apex.widget.util.cascadingLov ( pItem, pAjaxIdentifier, {
 *     x01: "test"
 *     }, {
 *     optimizeRefresh:   true,
 *     dependingOn:       "#P1_DEPTNO",
 *     pageItemsToSubmit: "#P1_LOCATION",
 *     clear:   function() { ... do something here ... },
 *     success: function( pData ) { ... do something here ... }
 *     } );
 *
 * @memberOf apex.widget.util
 **/

util.callPopupLov = function( pAjaxIdentifier, pData, pOptions ) {

    var lData = pData || {},
        lOptions = pOptions || {},
        lUrl,
        lWindow;

    // add filter with the current value if popup lov is configured for that
    if ( lOptions.filterOutput ) {
        lData.x02 = lOptions.filterValue;
    }

    // get the URL to call the popup
    lUrl = apex.server.pluginUrl( pAjaxIdentifier, lData );

    // Would be nice to use navigation.popup but that would mean changing the windowParameters option value
    // or parsing it.
    lWindow = window.open( lUrl, "winLovList_" + $v( "pInstance" ), lOptions.windowParameters );
    if ( lWindow.opener === null ) {
        lWindow.opener = self;
    }
    lWindow.focus();

    return false;
}; // callPopupLov

/**
 * Utility function to enable any icons descendant of $pContainer
 * If passing pClickHandler to rebind the icon's click handler, the
 * $pContainer must be the same as the element you wish to bind the
 * handler to (eg the icon's wrapping anchor).
 *
 * @param {jQuery}   $pContainer
 * @param {String}   pHref
 * @param {Function} [pClickHandler]
 *
 * @todo add example
 *
 * @memberOf apex.widget.util
 **/

util.enableIcon = function( $pContainer, pHref, pClickHandler ) {
    $pContainer
        .find( "img" )           // locate any images descendant of $pContainer
        .css({ "opacity" : 1,
               "cursor"  : "" }) // set their opacity and remove cursor
        .parent( "a" )           // go to parent, which should be an anchor
        .attr( "href", pHref );  // add the href
    // check if pClickHandler is passed, if so, bind it
    if ( pClickHandler ) {
        $pContainer.click( pClickHandler ); // rebind the click handler
    }
}; // enableIcon

/**
 * Utility function to disable any icons descendant of $pContainer
 *
 * @param {jQuery} $pContainer
 *
 * @todo add example
 *
 * @memberOf apex.widget.util
 **/
util.disableIcon = function( $pContainer ) {
    $pContainer
        .find( "img" )
        .css({ "opacity" : 0.5,
               "cursor"  : "default" })
        .parent( "a" )
        .removeAttr( "href" )
        .unbind( "click" );
}; // disableIcon

})( apex.widget.util, apex.jQuery );

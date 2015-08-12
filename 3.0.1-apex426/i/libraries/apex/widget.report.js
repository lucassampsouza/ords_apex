/**
 * @fileOverview
 * The report namespace is used to store functions used by reports and tabular forms in Oracle Application Express.
 **/

/**
 * @namespace apex.widget.report
 **/
apex.widget.report = {};


( function( report, server, $ ) {
    "use strict";

    // Initialise global arrays used to store report information. Arrays are used to support > 1 report per page.
    report.gRowActive           = [];
    report.gStyleMouseOver      = [];
    report.gStyleChecked        = [];
    report.gPageItemsToSubmit   = [];

    /**
     * FOR INTERNAL USE ONLY!!!
     *
     * Function to handle initialisation of classic report regions. Also called by tabular form initialisation
     *
     * @param {String} pRegionId        The main region ID (either Static ID or 'R' + Internal region ID if no Static)
     * @param {Object} pOptions         Following options are supported:
     *                                  - "internalRegionId"    Internal ID for the region.
     *                                  - "styleMouseOver"      Background color applied for current row (Optional).
     *                                  - "styleChecked"        Background color applied for checked row. Defaults to
     *                                                          #dddddd in engine if null in report template.
     *                                  - "pageItems"           To set page item values in session state, during an Ajax
     *                                                          call (Optional).
     *
     * @TODO add example
     *
     *
     * @private
     * @memberOf apex.widget.report
     */
    report.init = function( pRegionId, pOptions ) {
        var lInternalRegionId;

        // Internal region ID used frequently and as the index to the global arrays for a particular report
        lInternalRegionId = pOptions.internalRegionId;

        // Initialise namespace globals
        if ( pOptions.pageItems !== undefined ) {
            report.gPageItemsToSubmit[ lInternalRegionId ] = pOptions.pageItems;
        }

        /* Get all descendants of report region, with a class of "highlight-row",
         * and set their corresponding gRowActive array value to N.
         */
        report.gRowActive[ lInternalRegionId ]      = [];
        report.gStyleChecked[ lInternalRegionId ]   = pOptions.styleChecked;
        $( "#report_" + pRegionId + " .highlight-row", apex.gPageContext$ ).each( function ( i ) {
            report.gRowActive[ lInternalRegionId ][ i ] = 'N';
        });

        // If we have a mouse over style, register the event handling hover code.
        if ( pOptions.styleMouseOver !== undefined ) {
            report.gStyleMouseOver[ lInternalRegionId ] = pOptions.styleMouseOver;

            // Register hover event code to deal with row highlighting
            $( "#" + pRegionId, apex.gPageContext$ ).on( "hover", "#report_" + pRegionId + " .highlight-row", function ( pEvent ) {
                if ( pEvent.type === "mouseenter" ) {
                    $( this )
                        .closest( "tr" )
                        .children( "td" )
                        .css( "background-color", report.gStyleMouseOver[ lInternalRegionId ]);
                } else if (pEvent.type === "mouseleave" ) {

                    // This check will only ever evaluate to true for tabular forms with a checked row
                    if ( report.gRowActive[ lInternalRegionId ][ $( "#report_" + pRegionId + " .highlight-row", apex.gPageContext$ ).index( this ) ] === "Y" ) {
                        $( this )
                            .closest( "tr" )
                            .children( "td" )
                            .css( "background-color", report.gStyleChecked[ lInternalRegionId ] );
                    } else {
                        $( this )
                            .closest( "tr" )
                            .children( "td" )
                            .css( "background-color", "" );
                    }
                }
            });
        }

        // Register 'Refresh' event for current report, ready to be triggered
        // by a 'Refresh' dynamic action, or manually in JS via the apexrefresh event.
        // Also add WAI-ARIA 'aria-live' attribute, to signal the region as a 'live' region,
        // such that screen reader users will be informed when PPR takes place (sort, paginate,
        // refresh).
        $( "#" + pRegionId, apex.gPageContext$ )
            .attr( "aria-live", "polite" )
            .bind( "apexrefresh", function() {
                report.reset( lInternalRegionId );
            });
    };


    /**
     * FOR INTERNAL USE ONLY!!!
     *
     * Function that resets a classic report via Ajax
     *
     * @example
     *
     * report.reset ( "region_id" );
     *
     * @private
     * @memberOf apex.widget.report
     */

    report.reset = function ( pId ) {
        var lData = {};

        // Set reset specific data attributes
        lData.p_widget_action   = "reset";

        _refresh( pId, lData );
    };


    /**
     * FOR INTERNAL USE ONLY!!!
     *
     * Function to handle classic report sorting, via Ajax
     *
     * @param {String} pId              The region ID
     * @param {String} pSortData        Simple sorting value eg "fsp_sort_1" or "fsp_sort_1_desc"
     *
     * @example
     *
     * report.sort ( "region_id", "fsp_sort_1" );
     *
     * @private
     * @memberOf apex.widget.report
     */

    report.sort = function ( pId, pSortData ) {
        var lData = {};

        // Set additional data attributes for the widget action and sort data
        lData.p_widget_action       = "sort";
        lData.p_widget_action_mod   = pSortData;
        lData.p_clear_cache         = "RP";
        lData.p_fsp_region_id       = pId;

        _refresh( pId, lData );
    };


    /**
     * FOR INTERNAL USE ONLY!!!
     *
     * Function to handle classic report pagination, via Ajax.
     *
     * @param {String} pId              The region ID
     * @param {Object} pPaginationData  Object used to set pagination attributes, supports the following:
     *                                  - "min"         First row to display
     *                                  - "max"         Rows per page
     *                                  - "fetched"     Rows fetched
     *                                  Note: Also accepts an object in the above format, but as a string. This is
     *                                  required by pagination schemes that use a select list, where the pagination data
     *                                  is stored as the select list option value.
     *
     * @example
     *
     * report.paginate ( "region_id", {
     *     min   : 1,
     *     max   : 5,
     *     fetch : 5
     *     }
     * );
     *
     * @private
     * @memberOf apex.widget.report
     */

    report.paginate = function ( pId, pPaginationData ) {
        var lData = pPaginationData;

        // First deal with when the pagination data has come from a select list based pagination scheme
        if ( typeof lData === "string" ) {

            /* In case the "current" displayed paginated set is somehow selected, we just exit the function,
             * otherwise we evaluate to get a JavaScript object in the format {min:x,max:x,fetched:x}. */
            if ( lData !== "current" ) {
                lData = apex.jQuery.parseJSON( lData );
            } else {
                return;
            }
        }

        // Set additional data attributes for the widget action and pagination data
        lData.p_widget_action   = "paginate";
        lData.p_pg_min_row      = lData.min;
        lData.p_pg_max_rows     = lData.max;
        lData.p_pg_rows_fetched = lData.fetched;

        // Remove data that doesn't need to transmitted
        delete lData.min;
        delete lData.max;
        delete lData.fetched;

        _refresh( pId, lData );
    };

    /**
     * @TODO add documentation
     */
    function _refresh ( pId, pData ) {
        var lData       = pData || {},
            lOptions    = {};

        // register callback for success
        function _success( pResponse ) {

            // This looks a little bit complicated and it is! To avoid screen flicker
            // when the HTML code is inserted into the DOM and JavaScript code modifies the
            // code afterwards (which takes some time), we are injecting the HTML code in
            // a temporary hidden area and do all our modifications and after that we
            // are replacing the existing report_xxx_catch with the new version.
            var lTemp = $u_js_temp_drop();
            $( "#report_" + pId + "_catch", apex.gPageContext$ ).attr( "id", "report_" + pId + "_catch_old" );
            $( lTemp ).html( pResponse );
            $( "#report_" + pId + "_catch_old", apex.gPageContext$ ).replaceWith( $( "#report_" + pId + "_catch", apex.gPageContext$ ) );
            $( lTemp ).empty();

            // Note: No need to trigger after refresh event here, handled by base server.widget call.

        }

        // Pass region ID via x01 parameter
        lData.x01 = pId;

        // Set the components page items to submit, if they are defined
        if ( report.gPageItemsToSubmit[ pId ] !== undefined ) {
            lData.pageItems = report.gPageItemsToSubmit[ pId ];
        }

        // Register success callback
        lOptions.success = _success;

        // TODO Add support for an appropriate loading indicator

        // Set HTML data type, that's what we want here
        lOptions.dataType = "html";

        // Set the refreshObject so that server.widget triggers the before and after refresh events
        // refreshObject is set to the table element with the ID equal to "report_" + pID + "_catch".
        // This element is not exposed in any templates and output by our engine, so is safe to
        // use.
        // Event handlers can be bound to this element in conjunction with the jQuery "live"
        // bind type, or can be bound to higher element (such as the main region ID) and use
        // the regular bind type. The latter works because the event bubbles and is how this
        // is handled within the dynamic action framework.
        lOptions.refreshObject = "#report_" + apex.util.escapeCSS( pId ) + "_catch";

        // Set refresh data to region ID, for convenience
        lOptions.refreshObjectData = pId;

        server.widget ( "classic_report", lData, lOptions );

    }

})( apex.widget.report, apex.server, apex.jQuery);

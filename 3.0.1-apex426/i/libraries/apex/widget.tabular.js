/**
 * @fileOverview
 * The tabular namespace is used to store functions specific to tabular forms in Oracle Application Express.
 **/

/**
 * @namespace apex.widget.tabular
 **/
apex.widget.tabular = {};

( function( tabular, report, $, undefined ) {
    //"use strict";

    tabular.gNewRowDatePicker = [];

    /**
     * FOR INTERNAL USE ONLY!!!
     *
     * Function to handle initialisation of tabular form regions
     *
     * @param {String} pRegionId        The main region ID (either Static ID or "R" + Internal region ID if no Static)
     * @param {Object} pOptions         Following options are supported:
     *                                  - "beforeRow"           Before row HTML from report template
     *                                  - "afterRow"            After row HTML from report template
     *                                  - "errorItems"          Array of items that currently have errors associated with
     *                                                          them.
     *                                  - "unsavedMsg"          Confirmation message to display to the user when they try
     *                                                          and navigate away from the tabular form without saving
     *                                                          their changes.
     *                                  - "ajaxEnabled"         Is the tabular form Ajax enabled?
     *                                  - "internalRegionId"    Internal ID for the region.
     *                                  - "initialPageLoad"     Is this being called on initial page load?
     *
     * @example
     * apex.widget.tabular.init ( "R34519200074928462", {
     *     "beforeRow"          : "\u003ctr class=\u0022highlight-row\u0022\u003e",
     *     "afterRow"           : "\u003c\/tr\u003e",
     *     errorItems           : vErrItems,
     *     "unsavedMsg"         : "This form contains unsaved changes. Press \u0022Ok\u0022 to proceed without saving your changes.",
     *     "ajaxEnabled"        : true,
     *     "internalRegionId"   :"34519200074928462",
     *     "initialPageLoad"    :true
     *     } );
     *
     * @private
     * @memberOf apex.widget.tabular
     */

    tabular.init = function ( pRegionId, pOptions ) {
        var lOptions, lItems, lItemsCount;

        // Set defaults
        lOptions = $.extend( {
                        beforeRow       : null,
                        afterRow        : null
                        }, pOptions);

        // Set Namespace Globals
        tabular.gTabFormData      = [];
        tabular.gErrItems         = pOptions.errorItems;
        tabular.gChangedItems     = [];
        tabular.gNewRows          = 0;
        tabular.gTabFormRegionID  = pRegionId;
        tabular.gTabFormReportID  = "report_" + pRegionId;
        tabular.gTabForm          = $( "#init_row_" + pRegionId, apex.gPageContext$ ).parent();
        tabular.gTabFormDefaultBG = $( "#init_row_" + pRegionId, apex.gPageContext$ ).children( "td" ).css( "background-color" );
        tabular.gTabFormInitRow   = pOptions.beforeRow + $( "#init_row_" + pRegionId, apex.gPageContext$ ).html() + pOptions.afterRow;

        // This function is called on initial page load, and after an Ajax call. Some things only need
        // doing on initial page load.
        if ( pOptions.initialPageLoad ) {
            tabular.gInternalRegionId   = pOptions.internalRegionId;
            tabular.gUnsavedMsg         = pOptions.unsavedMsg;
            tabular.gAjaxEnabled        = pOptions.ajaxEnabled;

            // Bind "before page submit" handler
            $( apex.gPageContext$ ).on( "apexbeforepagesubmit", function() {

                // Disable all inputs that have a name ending in "NOSUBMIT"
                $( "input[name$=NOSUBMIT]", $( "#" + tabular.gTabFormRegionID, apex.gPageContext$ )[ 0 ] ).each( function() {
                    $x_disableItem( this, true );
                });
                $( "#init_row_" + pRegionId, apex.gPageContext$ ).remove();
            });
        }

        $( "#init_row_" + pRegionId, apex.gPageContext$ ).remove();

        // Set original tabular form data (used in check for modified values) and set autocomplete to off.
        lItems      = $x_FormItems( $x( tabular.gTabFormReportID ) );
        lItemsCount = lItems.length;
        for ( var i = 0; i < lItemsCount; i++ ) {
            $( lItems[ i ]).attr( "autocomplete", "off" );
            if( lItems[ i ].name !== "X01" ) {
                tabular.gTabFormData[ i ] = lItems[ i ].value;
            } else {
                tabular.gTabFormData[ i ] = "0";
            }
        }

        // Bind click handler for row selectors checkboxes
        $( "#" + tabular.gTabFormRegionID, apex.gPageContext$ ).on( "click", "input.row-selector", function() {
            _highlightCheckedRow( tabular.gInternalRegionId, this, $( ".row-selector", apex.gPageContext$ ).index( this ));
        });

    }; // init


    /**
     * FOR INTERNAL USE ONLY!!!
     *
     * Function to handle highlighting a checked row
     *
     * @param {string} pInternalRegionId    The internal region ID.
     * @param {Object} pRowSelect           DOM element that controls whether the rows are highglighted as checked, or not checked
     * @param {number} pCurrentRowNum       Number indicating the current row being checked
     *
     * @private
     * @memberOf apex.widget.tabular
     * */
    function _highlightCheckedRow( pInternalRegionId, pRowSelect, pCurrentRowNum ) {
        if ( pRowSelect.checked ) {
            if ( report.gStyleChecked[ pInternalRegionId ] ) {
                $( pRowSelect, apex.gPageContext$ )
                    .closest( "tr" )
                    .children( "td" )
                    .css( "background-color" , report.gStyleChecked[ pInternalRegionId ] );
            }
            report.gRowActive[ pInternalRegionId ][ pCurrentRowNum ] = "Y";
        } else  {
            if ( report.gStyleChecked[ pInternalRegionId ] ) {
                $( pRowSelect, apex.gPageContext$ )
                    .closest( "tr" )
                    .children( "td" )
                    .css( "background-color", "" );
            }
            report.gRowActive[ pInternalRegionId ][ pCurrentRowNum ] = "N";
            $( "#check-all-rows", apex.gPageContext$ ).prop( "checked", false);
        }
    }


    /**
     * Checks or unchecks f01 column, based on the value of the column header checkbox
     *
     * @ignore
     * */
    tabular.checkAll = function ( pMasterCheckbox ) {

        // Iterate over all f01 inputs in the current tabular form
        $( "input[name=f01]", $( "#" + tabular.gTabFormRegionID, apex.gPageContext$) ).each( function( i ) {
            $( this ).prop( "checked", pMasterCheckbox.checked );

            // Highlight or unhighlight the row
            _highlightCheckedRow( tabular.gInternalRegionId, this, i );
        });
    };


    /**
     * Padding a string with a leading "0"
     *
     * @ignore
     * */
    tabular.pad = function ( pNumber, pLength) {
        var lStr = "" + pNumber;
        while ( lStr.length < pLength ) {
            lStr = "0" + lStr;
        }
        return lStr;
    };

    /**
     * Checks if a cell has been modified and if so, sets a highlight class and returns true, otherwise returns false
     *
     * @ignore
     * */
    function _setModified ( pRegionId ) {
        var lModified           = false,
            lItems              = $x_FormItems( $x( "report_" + pRegionId )),
            lItemCount          = lItems.length,
            lChangedItemCount   = tabular.gChangedItems.length;

        // Iterate over items and check against original values. Also exclude pagination select list (X01) from check.
        // Set highlight and modified flag.
        for ( var i = 0; i < lItemCount; i++ ) {
            if ( ( tabular.gTabFormData[ i ] !== lItems[ i ].value ) && ( lItems[ i ].name !== "X01" ) ) {
                $( lItems[ i ] ).addClass( "apex-tabular-highlight" );
                lModified = true;
            }
        }

        // Iterate over previously changed items (built on add row), and set highlight and modified flag.
        for ( var j = 0; j < lChangedItemCount; j++ ) {
            $( tabular.gChangedItems[ j ] ).addClass( "apex-tabular-highlight" );
            lModified = true;
        }
        return lModified;
    }

    /**
     * FOR INTERNAL USE ONLY!!!
     *
     * Function to handle tabular form pagination (both Ajax and full page)
     *
     * @param {String} pRegionId        The main region ID (either Static ID or "R" + Internal region ID if no Static)
     * @param {Object} pPaginationData  For Ajax enabled tabular forms, this will be an object used to set pagination
     *                                  attributes, in the following format:
     *                                  - "min"         First row to display
     *                                  - "max"         Rows per page
     *                                  - "fetched"     Rows fetched
     *                                  For non-Ajax based tabular forms, this will just be a "f?p=" link.
     *
     * @example
     *
     * tabular.paginate ( "region_id", {
     *     min   : 1,
     *     max   : 5,
     *     fetch : 5
     *     }
     * );
     *
     * @private
     * @memberOf apex.widget.tabular
     */
    tabular.paginate = function ( pRegionId, pPaginationData ) {

        function _paginate() {
            if ( tabular.gAjaxEnabled ) {
                report.paginate( tabular.gInternalRegionId, pPaginationData );
            } else {
                apex.navigation.redirect( pPaginationData );
            }
        }

        if ( _setModified( pRegionId ) ) {
            if ( confirm( tabular.gUnsavedMsg ) ) {
                _paginate();
            }
        } else {
            _paginate();
        }
    };


    /**
     * FOR INTERNAL USE ONLY!!!
     *
     * Function to handle tabular form sorting (both Ajax and full page)
     *
     * @param {String} pRegionId        The main region ID (either Static ID or "R" + Internal region ID if no Static)
     * @param {Object} pSortData        For Ajax enabled tabular forms, this will be a simple sorting value eg
     *                                  "fsp_sort_1" or "fsp_sort_1_desc".
     *                                  For non-Ajax based tabular forms, this will just be a "f?p=" link.
     *
     * @example
     *
     * tabular.sort ( "region_id", "fsp_sort_1" );
     *
     * @private
     * @memberOf apex.widget.tabular
     */
    tabular.sort = function ( pRegionId, pSortData ) {

        function _sort() {
            if ( tabular.gAjaxEnabled ) {
                report.sort( tabular.gInternalRegionId, pSortData );
            } else {
                apex.navigation.redirect( pSortData );
            }
        }

        if ( _setModified( pRegionId ) ) {
            if ( confirm( tabular.gUnsavedMsg ) ) {
                _sort();
            }
        } else {
            _sort();
        }
    };

    /**
     * Function to handle adding a new row to the tabular form.
     *
     * @param {} pNewRowVals    ?
     * @param {} pNewRowMap     ?
     * @param {} pDispTypeMap   ?
     *
     * @memberOf apex.widget.tabular
     * */
    tabular.addRow = function (pNewRowVals, pNewRowMap, pDispTypeMap) {
        var i, lRow, lItem,
            lNewRowIndex,
            lItemsIterator,
            lNewRowIdentifier,
            lItems              = $x_FormItems( $x( tabular.gTabFormReportID ) ),
            lItemsCount         = lItems.length,
            lNewRow             = tabular.gTabFormInitRow,
            lNewRowDatePicker   = tabular.gNewRowDatePicker,
            lErrorItemsCount    = tabular.gErrItems.length;

        // Increment new rows count
        tabular.gNewRows    = tabular.gNewRows + 1;

        // build list of previously modified items (used in _setModified).
        for ( lItemsIterator = 0; lItemsIterator < lItemsCount; lItemsIterator++ ) {
            if ( ( tabular.gTabFormData[ lItemsIterator ] !== lItems[ lItemsIterator ].value ) && ( lItems[ lItemsIterator ].name !== "X01" ) ) {
                tabular.gChangedItems.push( lItems[ lItemsIterator ] );
            }
        }

        // Build and append new row
        lNewRow = lNewRow.replace(/_0000/g,'_' + tabular.pad( ( tabular.gNumRows + tabular.gNewRows ), 4 ) );
        lNewRow = lNewRow.replace('p_element_index=" +  escape (\'0\')','p_element_index=" +  escape (\'' + ( tabular.gNumRows + tabular.gNewRows )+'\')');
        lNewRow = lNewRow.replace(/\$_row/g,( tabular.gNumRows + tabular.gNewRows ) );
        $( tabular.gTabForm ).append( lNewRow );


        $( "#" + tabular.gTabFormRegionID, apex.gPageContext$ ).contents().find( ".nodatafound" ).hide();

        // If there are one or more datepickers in the new row, initialise them
        if ( lNewRowDatePicker.length > 0 ) {
            lRow = tabular.pad( ( tabular.gNumRows + tabular.gNewRows ),4 );
            for (i = 0; i < lNewRowDatePicker.length; i++ ) {
                lNewRowDatePicker[i]( lRow );
            }
        }

        // Register change handler on new row form fields, change "fcud_*" hidden element to C if a change occurs
        lNewRowIndex = tabular.pad( ( tabular.gNumRows + tabular.gNewRows ), 4 );
        $( ":input[id^=f][id$=_" + lNewRowIndex + "]", apex.gPageContext$ ).change( function() {
            $( "#fcud_" + lNewRowIndex, apex.gPageContext$).val( "C" );
        });

        // Set error items class.
        for ( var lErrorItemIterator = 0; lErrorItemIterator < lErrorItemsCount; lErrorItemIterator++ ) {
            if ( tabular.gErrItems[ lErrorItemIterator ].length > 0 ) {
                $( "#" + tabular.gErrItems[ lErrorItemIterator ], apex.gPageContext$ ).addClass( "apex-tabular-form-error" );
            }
        }

        if ( pNewRowMap ) {
            for ( var i = 0; i < pNewRowMap.length; i++ ) {

                lNewRowIdentifier = tabular.pad( ( tabular.gNumRows + tabular.gNewRows ), 4 );

                $( "#fcud_" + lNewRowIndex, apex.gPageContext$ ).val( "C" );
                $( "#" + pNewRowMap[ i ] + "_" + lNewRowIdentifier, apex.gPageContext$ ).val( pNewRowVals[ i ][ ( tabular.gNewRows - 1 ) ] );

                // For RADIO
                if ( pDispTypeMap[ i ].indexOf( "RADIO" ) >= 0 ) {
                    $( "[name=" + pNewRowMap[ i ] + "_" + lNewRowIdentifier + "_NOSUBMIT" + "]", apex.gPageContext$ ).each( function() {
                        if( $( this ).val() === pNewRowVals[ i ][ ( tabular.gNewRows - 1 ) ] ) {
                            $( this ).prop( "checked", true );
                        }
                    });
                }

                // For SIMPLE CHECKBOX
                if ( pDispTypeMap[ i ].indexOf( "SIMPLE_CHECKBOX" ) >= 0 ) {
                    $( "#" + pNewRowMap[ i ] + "_" + lNewRowIdentifier + "_01", apex.gPageContext$ ).each( function() {
                        lItem = $x( pNewRowMap[ i ] + "_" + lNewRowIdentifier + "_01" );
                        if ( lItem.value === pNewRowVals[ i ][ ( tabular.gNewRows - 1 ) ] ) {
                            $( this ).prop( "checked", true );
                        }
                    });
                }
            }
        }

        // build new list of all items values, incl items of new row
        lItems      = $x_FormItems( $x( tabular.gTabFormReportID ) );
        lItemsCount = lItems.length;
        for ( lItemsIterator = 0; lItemsIterator < lItemsCount; lItemsIterator++ ) {
            if( lItems[ lItemsIterator ].name !== "X01" ) {
                tabular.gTabFormData[ lItemsIterator ] = lItems[ lItemsIterator ].value;
            } else {
                tabular.gTabFormData[ lItemsIterator ] = "0";
            }
        }
    };

})( apex.widget.tabular, apex.widget.report, apex.jQuery);

/* For backward compatibility */
apex.widget.report.tabular = apex.widget.tabular;


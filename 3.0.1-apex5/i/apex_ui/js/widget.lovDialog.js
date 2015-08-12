/*!
 LOV Dialog - A jQuery UI based widget for displaying an enhanced List of Values style dialog
 Copyright (c) 2014, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * Turns a standard DIV element into an LOV dialog:
 *   apex.jQuery( "#myDiv" ).lovDialog();
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.button.js
 *    jquery.ui.mouse.js
 *    jquery.ui.draggable.js
 *    jquery.ui.position.js
 *    jquery.ui.resizable.js
 *    jquery.ui.dialog.js
 *    apex/util.js
 *    apex/debug.js
 *    apex/lang.js
 */

(function ( $, util, debug, lang, undefined ) {
    "use strict";

    var POPUP_LOV =                             "a-PopupLOV",
        POPUP_LOV_SEARCH =                      POPUP_LOV + "-search",
        POPUP_LOV_FILTERS =                     POPUP_LOV + "-filters",
        POPUP_LOV_FILTER_GROUP =                POPUP_LOV + "-filterGroup",
        POPUP_LOV_FILTER_GROUP_LINE_FILTER =    POPUP_LOV_FILTER_GROUP + "--lineFilter",
        POPUP_LOV_FILTER_LABEL =                POPUP_LOV + "-filterLabel",
        POPUP_LOV_FILTER_ITEM =                 POPUP_LOV + "-filterItem",
        POPUP_LOV_FILTER_ITEM_LABEL =           POPUP_LOV_FILTER_ITEM + "-label",
        POPUP_LOV_FILTER_ITEM_SELECT =          POPUP_LOV_FILTER_ITEM + "-select",
        POPUP_LOV_FILTER_ITEM_TEXT =            POPUP_LOV_FILTER_ITEM + "-text",
        POPUP_LOV_FILTER_BUTTON =               POPUP_LOV + "-filterButton",
        POPUP_LOV_RESULTS =                     POPUP_LOV + "-results",
        POPUP_LOV_RESULTS_SET =                 POPUP_LOV + "-resultsSet",
        POPUP_LOV_RESULTS_SET_LINK =            POPUP_LOV_RESULTS_SET + "-link",
        POPUP_LOV_FOOTER =                      POPUP_LOV + "-footer",
        // search
        SEARCH_BOX =                            "a-SearchBox",
        SEARCH_BOX_FIELD =                      SEARCH_BOX + "-field",
        SEARCH_BOX_ICON =                       SEARCH_BOX + "-icon",
        SEARCH_BOX_INPUT =                      SEARCH_BOX + "-input",
        // icons
        ICON =                                  "a-Icon",
        ICON_SEARCH =                           "icon-search",
        ICON_RIGHT_CHEVRON =                    "icon-right-chevron",
        // button
        BUTTON =                                "a-Button",
        BUTTON_NO_LABEL =                       BUTTON + "--noLabel",
        BUTTON_WITH_ICON =                      BUTTON + "--withIcon",
        BUTTON_SLIM =                           BUTTON + "--slim",
        BUTTON_PILL_END =                       BUTTON + "--pillEnd",
        BUTTON_PRIMARY =                        BUTTON + "--primary",
        // general form
        FORM_LABEL =                            "a-Form-label",
        FORM_FIELD =                            "a-Form-field",
        FORM_SELECT =                           "a-Form-select",
        // other utility
        VISUALLY_HIDDEN =                       "visuallyhidden",
        TEXT_RIGHT =                            "u-textRight",
        TEXT_LEFT =                             "u-textLeft",
        TEXT_CENTER =                           "u-textCenter",
        UI_BUTTON_CONTAINER =                   "ui-button-container";

    function msg( pKey ) {
        return lang.getMessage( "LOV_DIALOG." + pKey );
    }

    $.widget( "apex.lovDialog", $.ui.dialog, {
        version: "5.0",
        widgetEventPrefix:      "lovdialog",
        baseId:                 null,               // Used to generate ids for DOM elements
        filterHasSubFilter:     [],                 // IDs of filters that contain sub-filters, needs change handler
        filterIsButtonSet:      [],                 // IDs of button set type filters, sets up special event handlers
        filterIsSearch:         [],                 // IDs of search types filters, sets up special event handlers
        filterFiltersOnChange:  [],                 // IDs of filters that execute a filter on change
        currentFilters:         {},                 // Current active filters
        // Default options
        options: {
            filterLov:          null,
            idPrefix:           null,               // ID prefix
            multiValue:         false,              // Defines if the LOV returns single, or multiple values
            filters:            [],                 // Optional filters that can be defined for the LOV
            columnDefinitions:  []                  // Required column definitions, for the LOV options list
        },

        /*
         * Lifecycle methods
         */
        _create: function() {
            var lSuper,
                o = this.options;

            if ( !$.isFunction( o.filterLov ) ) {
                throw "Missing required 'filterLov' option.";
            }
            if ( o.columnDefinitions.length === 0 ) {
                throw "Missing required 'columnDefinitions' option.";
            }
            this.baseId = ( o.idPrefix || this.element[0].id || "lovDialog" ) + "_";
            this.element.addClass( POPUP_LOV );

            for ( var i = 0; i < this.options.columnDefinitions.length; i++ ) {
                this.options.columnDefinitions[ i ] = $.extend( {
                    alignment:  "left",
                    escape:     true
                }, this.options.columnDefinitions[ i ] );
            }

            // reset widget variables
            this.filterHasSubFilter = [];
            this.filterIsButtonSet = [];
            this.filterIsSearch = [];
            this.filterFiltersOnChange = [];
            this.currentFilters = {};

            this.options.closeText = lang.getMessage( "APEX.DIALOG.CLOSE" );

            // Call base dialog _create, this creates the dialog
            lSuper = this._super();

            // Add the LOV Dialog specific code and handlers
            this._renderLovDialog();

            return lSuper;
        },

        /*
         * Private functions
         */
        _renderLovDialog: function( ) {
            var i, j, k, m, n, lColumnTextAlignment, lTitle,
                that = this,
                out = util.htmlBuilder();

            out.markup( "<div" )
                .attr( "class", POPUP_LOV )
                .markup( ">" );

            this._renderFilters( out, this.options.filters );

            // render dialog results
            out.markup( "<div" )
                .attr( "class", POPUP_LOV_RESULTS )
                .markup( ">" );
            out.markup( "<table" )
                .attr( "class", POPUP_LOV_RESULTS_SET )
                .attr( "id", that.baseId + "lovEntries" )
                .markup( ">" )
                .markup( "<caption" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LOV_ENTRIES" ) )
                .markup( "</caption>" );
            out.markup( "<tr>" );
            // loop over all columns and create headers
            if ( this.options.multiValue ) {
                out.markup( "<th>" )
                    .content( msg( "SELECT" ) )
                    .markup( "</th>" );
            }
            for ( i = 0; i < this.options.columnDefinitions.length; i++ ) {
                lTitle = this.options.columnDefinitions[ i ].title;

                if ( this.options.columnDefinitions[ i ].alignment === "left" ) {
                    lColumnTextAlignment = TEXT_LEFT;
                } else {
                    lColumnTextAlignment = TEXT_CENTER;
                }
                out.markup( "<th" )
                    .attr( "class",  lColumnTextAlignment )
                    .optionalAttr( "width", this.options.columnDefinitions[ i ].width )
                    .markup( ">" );

                if ( this.options.columnDefinitions[ i ].escape ) {
                    out.content( lTitle );
                } else {
                    out.markup( lTitle );
                }
                out.markup( "</th>" );
            }
            out.markup( "</tr>" );
            out.markup( "</table>" );
            out.markup( "</div>" );         // close POPUP_LOV_RESULTS

            // Add HTML to the page
            this.element
                .empty()
                .append( out.toString() );

            // cache common jquery objects
            this._lovEntries$ = $( "#" + this.baseId + "lovEntries" );

            // render the results, based on the current filters and lov entries
            this._filterLov( this.options.filters );


            // widget event handlers
            // todo fix multiple handler issue when no selector is defined
            this._on({
                click: this._resultsLinkClick
            });

            // search filter type event handlers
            for ( k = 0; k < this.filterIsSearch.length; k++ ) {
                this._on( "#" + this.filterIsSearch[ k ] + "_button", {
                    click: this._doSearch
                });
                this._on( "#" + this.filterIsSearch[ k ], {
                    keypress: function ( pEvent ) {
                        if ( pEvent.which === 13 ) {
                            that._doSearch( pEvent );
                            pEvent.preventDefault();
                        }
                    }
                });
            }

            // filters that execute a filter on change
            for ( n = 0; n < this.filterFiltersOnChange.length; n++ ) {
                this._on( "#" + this.filterFiltersOnChange[ n ], {
                    change: this._doSearch
                });
                //todo clear all other filters?
            }

            // button set filter type event handlers
            for ( j = 0; j < this.filterIsButtonSet.length; j++ ) {
                $( "#" + this.filterIsButtonSet[ j ] ).buttonset();
            }

            // if filter has sub filters, then we need a change handler to show / hide the sub filters
            for ( m = 0; m < this.filterHasSubFilter.length; m++ ) {
                this._on( "#" + this.filterHasSubFilter[ m ], {
                    change: this._filterHasSubFilterChange
                });
            }

            /* todo Better multi-value support
            if ( this.options.multiValue ) {
                this._on( "#" + this.baseId + "passMultiValue", {
                    click: function( pEvent ){
                        var lSelectedRows = [];
                        $( "#lovDialog_lovEntries :checkbox:checked" ).each( function( index ) {
                            lSelectedRows.push({
                                selectedRow: that.lovEntries[ $( this ).data( "lovRow" ) ]      //why do I have to change to camel case????
                            });
                        })
                        // perhaps we should simplify what we return here, so just the row values! (and the other place also)
                        that._trigger( "valueSelected", {}, { selectedRows: lSelectedRows } );       // should we use a different event? then we know it's an array, or we could just always use array
                        that.close();
                    }
                });
            }
            */

        },

        _resultsLinkClick: function( pEvent ) {
            var lSelectedLovEntry, i, j, lValueFormatting,
                lTarget$ = $( pEvent.target),
                lFilterFound = false;

            if ( lTarget$.hasClass( POPUP_LOV_RESULTS_SET_LINK ) ) {

                lSelectedLovEntry = this.lovEntries[ lTarget$.data( "lov-entry-idx" ) ];

                for ( var lFilterName in this.currentFilters ) {

                    // we need to find the filter entry for the current filter, in order to check if any valueFormatting applies
                    for ( i = 0; i < this.options.filters.length; i++ ){

                        if ( this.options.filters[ i ].name === lFilterName ) {

                            lFilterFound = true;

                            // Now that we have the right filter, check the lov entries to find the current filter value,
                            // as that is where valueFormatting can be defined.
                            if ( this.options.filters[ i ].lov ) {

                                for ( j = 0; j < this.options.filters[ i ].lov.length; j++ ) {

                                    if ( this.options.filters[ i ].lov[ j ].value === this.currentFilters[ lFilterName ] ) {

                                        // and now that we have that, check if it has any custom value formatting
                                        if ( this.options.filters[ i ].lov[ j ].valueFormatting ) {
                                            lValueFormatting = this.options.filters[ i ].lov[ j ].valueFormatting;
                                        }
                                        break;
                                    }
                                }

                            }
                            break;
                        }
                    }
                    if ( lFilterFound ) {
                        break;
                    }
                }

                // If there is custom value formatting, let's extend the return object with the formatting function
                if ( lValueFormatting ) {
                    $.extend( lSelectedLovEntry, {
                        valueFormatting: lValueFormatting
                    });
                }

                this._trigger( "valueSelected", {}, lSelectedLovEntry );

                if ( this.options.multiValue === false ) {
                    this.close();
                }
            }
            //todo prevent default browser to top behaviour
        },
        _doSearch: function( pEvent ) {
            this._filterLov( this.options.filters );
        },
        _filterHasSubFilterChange: function ( pEvent ) {
            var lHtml = util.htmlBuilder(),
                lFilters = this.options.filters,
                lTarget$ = $( pEvent.target ),
                lFilterName = lTarget$.data( "filter-name" );

            // loop through current filters passed to get the matching filter definition for the current filter
            for ( var j = 0; j < lFilters.length; j++ ) {
                if ( lFilters[ j ].name === lFilterName ) {

                    // for the filter found, we need to loop through and identify and sub-filters
                    for ( var k = 0; k < lFilters[ j ].lov.length; k++ ) {
                        if ( lFilters[ j ].lov[ k ].filters ) {
                            // if we know there are sub-filters, what we do depends on whether the new value matches
                            // the lov option value that contains the sub-filters
                            if ( lTarget$.val() === lFilters[ j ].lov[ k ].value ) {

                                // if they match, render those sub-filters
                                this._renderFilters( lHtml, lFilters[ j ].lov[ k ].filters, true );

                                // and insert after the current filter
                                lTarget$
                                    .closest( "div." + POPUP_LOV_FILTER_GROUP )
                                    .after( lHtml.toString() );

                            } else {
                                // if the do not match, remove those sub-filters
                                for ( var m = 0; m < lFilters[ j ].lov[ k ].filters.length; m++ ) {
                                    this.element
                                        .find( "[data-filter-name=" + lFilters[ j ].lov[ k ].filters[ m ].name + "]" )
                                        .closest( "div." + POPUP_LOV_FILTER_GROUP )
                                        .remove();
                                }
                            }
                        }
                    }
                }
            }
        },
        _filterLovEntries: function ( pSearch ) {
            var k, m, lSearch, lColumnValue,
                lFilteredLovEntries = [];
            if ( pSearch !== "" ) {
                if ( pSearch instanceof RegExp ) {
                    lSearch = pSearch;
                } else {
                    lSearch = new RegExp( pSearch, "i" );
                }
                for ( k = 0; k < this.lovEntries.length; k++ ){
                    for ( m = 0; m < this.options.columnDefinitions.length; m++ ) {
                        lColumnValue = this.lovEntries[ k ][ this.options.columnDefinitions[ m ].name ] + "";

                        // Use match instead of test, because the regular expression could contain the global modifier.
                        // See http://stackoverflow.com/questions/1520800/why-regexp-with-global-flag-in-javascript-give-wrong-results
                        if ( !!lColumnValue.match( lSearch ) ) {
                            lFilteredLovEntries.push( this.lovEntries[ k ] );
                            break;
                        }
                    }
                }
                this.lovEntries = lFilteredLovEntries;
            }
        },

        // Render function for the LOV dialog options
        _renderLovEntries: function( pLovEntries, pSearch ) {
            var i, j, lColumnTextAlignment, lValue, lCellFormatting,
                out = util.htmlBuilder(),
                that = this;

            // store lov entries
            this.lovEntries = pLovEntries.slice();
            if ( pSearch ) {
                this._filterLovEntries( pSearch );
            }

            for ( i = 0; i < this.lovEntries.length; i++ ) {
                out.markup( "<tr>" );
                if ( this.options.multiValue ) {
                    out.markup( "<td>" )
                        .markup( "<input" )
                        .attr( "type", "checkbox" )
                        .attr( "title", msg( "SELECT" ) )
                        .attr( "data-lov-row", i )
                        .markup( " />" )
                        .markup( "</td>" );
                }
                // loop over columns
                for ( j = 0; j < this.options.columnDefinitions.length; j++ ) {

                    if ( this.options.columnDefinitions[ j ].cellFormatting ) {
                        lCellFormatting = function( pValue ) {
                            out.markup( that.options.columnDefinitions[ j ].cellFormatting( pValue ) );
                        };
                    } else if ( this.options.columnDefinitions[ j ].escape ) {
                        lCellFormatting = function( pValue ) {
                            out.content( pValue );
                        };
                    } else {
                        lCellFormatting = function( pValue ) {
                            out.markup( pValue );
                        };
                    }

                    lValue = this.lovEntries[ i ][ this.options.columnDefinitions[ j ].name ];
                    // We need to bypass the lValue || "" logic for when lValue is 0, so it's not evaluated as falsey
                    lValue = ( lValue !== 0 ) ? lValue || "" : lValue;

                    if ( this.options.columnDefinitions[ j ].alignment === "left" ) {
                        lColumnTextAlignment = TEXT_LEFT;
                    } else if ( this.options.columnDefinitions[ j ].alignment === "right" ) {
                        lColumnTextAlignment = TEXT_RIGHT;
                    } else if ( this.options.columnDefinitions[ j ].alignment === "center" ) {
                        lColumnTextAlignment = TEXT_CENTER;
                    }

                    out.markup( "<td" )
                        .attr( "class", lColumnTextAlignment )
                        .markup( ">");

                    // render first column as link only
                    if ( j === 0 ) {
                        out.markup( "<a" )
                            .attr( "class", POPUP_LOV_RESULTS_SET_LINK )
                            .attr( "href", "#" )
                            .attr( "data-lov-entry-idx", i )    //use as index to global lovEntries
                            .markup( ">" );
                        lCellFormatting( lValue );
                        out.markup( "</a>" )
                    } else {
                        lCellFormatting( lValue );
                    }
                    out.markup( "</td>" );
                }
                out.markup( "</tr>" );
            }

            this._lovEntries$.find( "tr" ).after( out.toString() );
        },

        /* Loops through current filters (including sub-filters) and updates their current value
         * in this.currentFilters
         *
         */
        _updateCurrentFilters: function( pFilters ) {
            var i, lFilterName, lElement$, lNewValue;

            for ( i = 0; i < pFilters.length; i++ ) {
                lFilterName = pFilters[ i ].name;

                // check if there is a dom element associated with the current filter
                if ( $( "#" + this.baseId + lFilterName ).length > 0 ) {
                    lElement$ = $( "#" + this.baseId + pFilters[ i ].name );

                    // calculate value, based on current filter type
                    if ( $.inArray( pFilters[ i ].type, [ "text", "select", "search" ] ) > -1 ) {
                        lNewValue = lElement$.val();
                    } else if ( pFilters[ i ].type === "buttonset" ) {
                        lNewValue = lElement$.find( "input:checked" ).val();
                    }

                    // Update new filter value in this.currentFilters
                    this.currentFilters[ lFilterName ] = lNewValue;

                    // check if there are any sub-filters for this filter
                    if ( pFilters[ i ].lov ) {
                        for ( var j = 0; j < pFilters[ i ].lov.length; j++ ) {
                            if ( pFilters[ i ].lov[ j ].value === lNewValue && pFilters[ i ].lov[ j ].filters ) {
                                this._updateCurrentFilters( pFilters[ i ].lov[ j ].filters );
                            }
                        }
                    }
                }
            }
        },

        /* Builds up a filter object of current filters,
         * calls filterLov, passing current filters, and the function to render the LOV Entries
         *
         * todo should also check if required filters are pass, if the required one is empty, show error message.
         */
        _filterLov: function( pFilters ) {
            var that = this;

            // clear out current results first
            this._lovEntries$.find( "tr" ).not( ":first" ).remove();

            this._updateCurrentFilters( pFilters );

            // Pass filters to filterLov callback function
            this.options.filterLov( this.currentFilters, function( pLovEntries, pSearch ) {
                that._renderLovEntries ( pLovEntries, pSearch );
            });
        },

        _renderSearch: function( out, pFilter ) {
            out.markup( "<div" )
                .attr( "class", POPUP_LOV_SEARCH )
                .markup( ">" );
            out.markup( "<div" )
                .attr( "class", SEARCH_BOX )
                .markup( ">" );
            out.markup( "<div" )
                .attr( "class", SEARCH_BOX_FIELD )
                .markup( ">" );
            out.markup( "<span" )
                .attr( "class", SEARCH_BOX_ICON )
                .markup( ">" );
            out.markup( "<span" )
                .attr( "class", ICON + " " + ICON_SEARCH )
                .markup( ">" )
                .markup( "</span>" );
            out.markup( "</span>" );    // close SEARCH_BOX_ICON
            out.markup( "<input" )
                .attr( "id", this.baseId + pFilter.name )
                .attr( "data-filter-name", pFilter.name )
                .attr( "type", "text" )
                .attr( "class", SEARCH_BOX_INPUT )
                .attr( "title", pFilter.title )
                .attr( "placeholder", pFilter.title )
                .attr( "aria-controls", this.baseId + "lovEntries" )    // controls the results table
                .attr( "value", ( pFilter.defaultValue ) ? pFilter.defaultValue : "" )
                .optionalBoolAttr( "aria-required", pFilter.isRequired )
                .markup( " />" );
            out.markup( "</div>" );     // close SEARCH_BOX_FIELD
            out.markup( "<button" )
                .attr( "class", BUTTON + " " + BUTTON_NO_LABEL + " " + BUTTON_WITH_ICON + " " + BUTTON_SLIM + " " + BUTTON_PILL_END + " " + BUTTON_PRIMARY )
                .attr( "value", msg( "GO" ) )
                .attr( "type", "button" )
                .attr( "id", this.baseId + pFilter.name + "_button" )
                .attr( "title", msg( "GO" ) )
                .markup( ">" );
            out.markup( "<span" )
                .attr( "class", ICON + " " + ICON_RIGHT_CHEVRON )
                .markup( ">" )
                .markup( "</span>" );
            out.markup( "<span" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( "Go" )
                .markup( "</span>" );
            out.markup( "</button>" );
            out.markup( "</div>" );     // close SEARCH_BOX
            out.markup( "</div>" );     // close POPUP_LOV_SEARCH

            this.filterIsSearch.push( this.baseId + pFilter.name );
        },
        _renderText: function( out, pFilter ) {
            out.markup( "<div" )
                .attr( "class", POPUP_LOV_FILTER_GROUP + " " + POPUP_LOV_FILTER_GROUP_LINE_FILTER )
                .markup( ">" );
            out.markup( "<span" )
                .attr( "class", POPUP_LOV_FILTER_LABEL )
                .markup( ">" );
            out.markup( "<label" )
                .attr( "for", this.baseId + pFilter.name )
                .attr( "class", FORM_LABEL + " " + POPUP_LOV_FILTER_ITEM_LABEL )
                .markup( ">" )
                .content( pFilter.title )
                .markup( "</label>" );
            out.markup( "</span>" );     // close POPUP_LOV_FILTER_LABEL
            out.markup( "<span" )
                .attr( "class", POPUP_LOV_FILTER_ITEM )
                .markup( ">" );
            out.markup( "<input" )
                .attr( "id", this.baseId + pFilter.name )
                .attr( "data-filter-name", pFilter.name )
                .attr( "type", "text" )
                .attr( "class", FORM_FIELD + " " + POPUP_LOV_FILTER_ITEM_TEXT )
                .attr( "value", ( pFilter.defaultValue ) ? pFilter.defaultValue : "" )
                .optionalBoolAttr( "aria-required", pFilter.isRequired )
                .markup( " />" );
            out.markup( "</span>" );    // close POPUP_LOV_FILTER_ITEM
            out.markup( "</div>" );     // close POPUP_LOV_FILTER_GROUP
        },
        _renderSelect: function( out, pFilter ) {
            var j,
                lShowSubFilters = [];

            function _renderSelectOption( pLovEntry ) {

                var lMatchDefaultValue = ( pFilter.defaultValue === pLovEntry.value );

                out.markup( "<option")
                    .attr( "value", pLovEntry.value )
                    .optionalAttr( "selected", lMatchDefaultValue )
                    .markup( ">" )
                    .content( pLovEntry.display )
                    .markup( "</option>" );

                // check if filter lov value has sub-filter associated, if so check if the filter default value
                // matches the filter lov value, and if that's true, render the sub-filter
                if ( pLovEntry.filters ) {
                    this.filterHasSubFilter.push( this.baseId + pFilter.name );
                    if ( lMatchDefaultValue ) {
                        lShowSubFilters = pLovEntry.filters;
                    }
                }
            } // _renderSelectOption

            this.filterFiltersOnChange.push( this.baseId + pFilter.name );

            out.markup( "<div" )
                .attr( "class", POPUP_LOV_FILTER_GROUP + " " + POPUP_LOV_FILTER_GROUP_LINE_FILTER )
                .markup( ">" );
            out.markup( "<span" )
                .attr( "class", POPUP_LOV_FILTER_LABEL )
                .markup( ">" );
            out.markup( "<label" )
                .attr( "for", this.baseId + pFilter.name )
                .attr( "class", FORM_LABEL + " " + POPUP_LOV_FILTER_ITEM_LABEL )
                .markup( ">" )
                .content( pFilter.title )
                .markup( "</label>" );
            out.markup( "</span>" );     // close POPUP_LOV_FILTER_LABEL
            out.markup( "<span" )
                .attr( "class", POPUP_LOV_FILTER_ITEM )
                .markup( ">" );
            out.markup( "<select" )
                .attr( "id", this.baseId + pFilter.name )
                .attr( "data-filter-name", pFilter.name )
                .attr( "size", "1" )
                .attr( "class", FORM_FIELD + " " + FORM_SELECT + " " + POPUP_LOV_FILTER_ITEM_SELECT )
                .attr( "aria-controls", this.baseId + "lovEntries" )    // controls the results table
                .optionalBoolAttr( "aria-required", pFilter.isRequired )
                .markup( ">" );

            if ( !pFilter.isRequired ) {
                _renderSelectOption({
                    display: msg( "SELECT_VALUE" ),
                    value:   ""
                });
            }
            for ( j = 0; j < pFilter.lov.length; j++ ) {
                _renderSelectOption( pFilter.lov[ j ] );
            }
            out.markup( "</select>" );
            out.markup( "</span>" );    // close POPUP_LOV_FILTER_ITEM
            out.markup( "</div>" );     // close POPUP_LOV_FILTER_GROUP

            return lShowSubFilters;
        },
        _renderButtonSet: function( out, pFilter ) {
            var j, lMatchDefaultValue,
                lShowSubFilters = [];

            this.filterIsButtonSet.push( this.baseId + pFilter.name );
            this.filterFiltersOnChange.push( this.baseId + pFilter.name );

            out.markup( "<div" )
                .attr( "class", POPUP_LOV_FILTER_GROUP + " " + POPUP_LOV_FILTER_GROUP_LINE_FILTER )
                .markup( ">" );
            out.markup( "<span" )
                .attr( "class", POPUP_LOV_FILTER_ITEM )
                .markup( ">" );
            out.markup( "<span" )
                .attr( "id", this.baseId + pFilter.name )
                .attr( "class", "" )                    //todo class?
                .attr( "role", "group" )
                .attr( "aria-label", pFilter.title )    //todo test this is sufficient
                // todo aria-controls here, or on each radio?
                .markup( ">" );

            for ( j = 0; j < pFilter.lov.length; j++ ) {
                lMatchDefaultValue = ( pFilter.defaultValue === pFilter.lov[ j ].value );
                out.markup( "<div" )
                    .attr( "class", UI_BUTTON_CONTAINER )
                    .markup( ">" );
                out.markup( "<input" )
                    .attr( "class", "" )
                    .attr( "id", this.baseId + pFilter.name + "_" + pFilter.lov[ j ].value )
                    .attr( "type", "radio" )
                    .optionalAttr( "checked", lMatchDefaultValue )
                    .attr( "value", pFilter.lov[ j ].value )
                    .attr( "name", this.baseId + pFilter.name )
                    .attr( "data-filter-name", pFilter.name )
                    .markup( " />" );
                out.markup( "<label" )
                    .attr( "for", this.baseId + pFilter.name + "_" + pFilter.lov[ j ].value )
                    .attr( "class", "" )
                    .markup( ">" )
                    .content( pFilter.lov[ j ].display )
                    .markup( "</label>" );
                out.markup( "</div>" );

                // check if filter lov value has sub-filter associated, if so check if the filter default value
                // matches the filter lov value, and if that's true, render the sub-filter
                if ( pFilter.lov[ j ].filters ) {
                    this.filterHasSubFilter.push( this.baseId + pFilter.name );
                    if ( lMatchDefaultValue ) {
                        lShowSubFilters = pFilter.lov[ j ].filters;
                    }
                }
            }
            out.markup( "</span>" );    // close class?
            out.markup( "</span>" );    // close POPUP_LOV_FILTER_ITEM
            out.markup( "</div>" );     // close POPUP_LOV_FILTER_GROUP

            return lShowSubFilters;
        },
        _renderFilters: function( out, pFilters, pSubFilterMode ) {
            var i,
                lShowSubFilters = [];

            if ( pFilters.length > 0 && !pSubFilterMode ) {
                out.markup( "<div" )
                    .attr( "class", POPUP_LOV_FILTERS )
                    .markup( ">" );
            }

            for ( i = 0; i < pFilters.length; i++ ) {

                lShowSubFilters = [];

                switch ( pFilters[ i ].type ) {
                    case "search":
                        this._renderSearch( out, pFilters[ i ] );
                        break;
                    case "text":
                        this._renderText( out, pFilters[ i ] );
                        break;
                    case "select":
                        lShowSubFilters = this._renderSelect( out, pFilters[ i ] );
                        break;
                    case "buttonset":
                        lShowSubFilters = this._renderButtonSet( out, pFilters[ i ] );
                        break;
                }

                // now render new sub filters, for this filter
                if ( lShowSubFilters.length > 0 ) {
                    this._renderFilters( out, lShowSubFilters, true );
                }
            }

            if ( pFilters.length > 0 && !pSubFilterMode ) {
                out.markup( "</div>" );     // close POPUP_LOV_FILTERS
            }
        },

        /*
         * Public functions
         */
        close: function() {
            this.element.removeClass( POPUP_LOV ).empty();
            return this._super();
        }
    });

})( apex.jQuery, apex.util, apex.debug, apex.lang );
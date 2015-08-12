/*global apex*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright © 2013, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * todo documentation
 **/

/**
 * @namespace
 **/
( function( model, $, debug, util, locale, lang, server, undefined ) {
    "use strict";

    var ITEM_TYPE = {
        SELECT_LIST:      "NATIVE_SELECT_LIST",
        RICH_TEXT_EDITOR: "NATIVE_RICH_TEXT_EDITOR",
        TEXTAREA:         "NATIVE_TEXTAREA",
        SHUTTLE:          "NATIVE_SHUTTLE",
        FILE:             "NATIVE_FILE"
    }


    function msg( pKey ) {
        return lang.getMessage( "MODEL.CALLBACKS." + pKey );
    };

    function format( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    };

    function _removeChildren( pComponent, pTypeId ) {

        var lChildComponents = pComponent.getChilds( pTypeId );

        for ( var i = 0; i < lChildComponents.length; i++ ) {
            lChildComponents[ i ].remove();
        }
    } // _removeChildren


    function initCapColumnName( pColumnName ) {

        // initcap column name and replace underscores with spaces
        // Escape column name to avoid issues if the column name contains html meta characters, because the column heading is normally not escaped
        return util.escapeHTML( ( pColumnName.substr( 0, 1 ).toUpperCase() + pColumnName.substr( 1 ).toLowerCase() ).replace( /_/g, " " ));
    } // initCapColumnName


    function getDmlProcesses() {

        return model.getComponents( model.COMP_TYPE.PAGE_PROCESS, {
            properties: [{
                id:    model.PROP.PAGE_PROCESS_TYPE,
                value: new RegExp( "^(NATIVE_FORM_FETCH|NATIVE_FORM_PROCESS)$" )
            }]
        });

    } // getDmlProcesses


    function manageColumns( pRegion, pColumnsParent, pColumnComponentTypeId, pOptions ) {

        function getSqlColumns( pSqlColumns, pSetSqlColumn ) {

            var i,
                lColumns = [];

            for ( i = 0; i < pSqlColumns.length; i++ ) {
                lColumns.push({
                    name:         pSqlColumns[ i ].name,
                    type:         pSqlColumns[ i ].type,
                    no:           i + 1,
                    regionColumn: null
                });

                if ( pSetSqlColumn ) {
                    pSetSqlColumn( lColumns[ i ]);
                }
            }
            return lColumns;
        } // getSqlColumns

        function removeUnusedColumns( pSqlColumns, pParent, pComponentTypeId, pOptions ) {

            var lRegionColumns = pParent.getChilds( pComponentTypeId ),
                i, j,
                lFound,
                lColumnName;

            // Remove all columns which don't exist anymore or where the type has changed
            for ( i = 0; i < lRegionColumns.length; i++ ) {
                lFound      = false;
                lColumnName = lRegionColumns[ i ].getProperty( model.PROP.COLUMN_NAME ).getValue();
                for ( j = 0; j < pSqlColumns.length; j++ ) {
                    if ( pSqlColumns[ j ].name === lColumnName && ( !pOptions.compareCheck || pOptions.compareCheck( pSqlColumns[ j ], lRegionColumns[ i ] ))) {
                        pSqlColumns[ j ].regionColumn = lRegionColumns[ i ];
                        lFound = true;
                        break;
                    }
                }

                if ( !lFound && ( !pOptions.removeCheck || pOptions.removeCheck( lRegionColumns[ i ]))) {
                    lRegionColumns[ i ].remove();
                }
            }
        } // removeUnusedColumns


        function addUpdateColumns( pSqlColumns, pParent, pComponentTypeId, pOptions ) {

            var lRegionColumns = pParent.getChilds( pComponentTypeId ),
                i,
                lPreviousComponent,
                lValues;

            // New columns should be added after the existing columns
            if ( lRegionColumns.length > 0 ) {
                lPreviousComponent = lRegionColumns[ lRegionColumns.length - 1 ];
            }

            // Add all columns where we don't have a region/report column yet or update where something has changed
            for ( i = 0; i < pSqlColumns.length; i++ ) {

                // If the SQL statement contains a new column, add it.
                if ( !pSqlColumns[ i ].regionColumn ) {

                    lValues = [];
                    lValues.push({ id: model.PROP.COLUMN_NAME, value: pSqlColumns[ i ].name });
                    pOptions.add( lValues, pSqlColumns[ i ]);

                    lPreviousComponent = new model.Component({
                        previousComponent: lPreviousComponent,
                        typeId:            pComponentTypeId,
                        parentId:          pParent.id,
                        values:            lValues
                    });

                } else {
                    pOptions.update( pSqlColumns[ i ].regionColumn, pSqlColumns[ i ]);
                }
            }
        }


        var lSqlColumns;

        if ( pRegion.getProperty( model.PROP.REGION_SQL ) ) {
            lSqlColumns = pRegion.getProperty( model.PROP.REGION_SQL ).getColumns();
        } else {
            lSqlColumns = pRegion.getProperty( model.PROP.REGION_FUNCTION_RETURNING_SQL ).getColumns();
        };

        // Only if we have a valid SQL which has returned columns, we try to add/modify the report columns
        if ( lSqlColumns.length > 0 ) {

            lSqlColumns = getSqlColumns( lSqlColumns, pOptions.setSqlColumn );

            // Remove all columns which don't exist anymore
            removeUnusedColumns( lSqlColumns, pColumnsParent, pColumnComponentTypeId, {
                compareCheck: pOptions.compareCheck,
                removeCheck:  pOptions.removeCheck
            });

            addUpdateColumns( lSqlColumns, pColumnsParent, pColumnComponentTypeId, {
                add:    pOptions.add,
                update: pOptions.update
            });
        }
    }


    function reSequenceColumns( pRegion, pTypeId ) {

        var lColumns;

        function updateColumns( pPropertyId ) {
            var i,
                lProperty;

            // Re-sequence the property without any gaps
            for ( i = 0; i < lColumns.length; i++ ) {
                lProperty = lColumns[ i ].getProperty( pPropertyId );
                if ( parseInt( lProperty.getValue(), 10 ) !== i + 1 ) {
                    lProperty.setValue( i + 1 );
                }
            }
        }

        // Get all the columns of the region and sort it by display sequence
        lColumns = pRegion.getChilds( pTypeId );
        updateColumns( model.PROP.DISPLAY_SEQUENCE );

        // Sort the columns by query column id
        lColumns = lColumns.sort( function( a, b ) {

            var aIsVirtual = ( a.getProperty( model.PROP.DERIVED_COLUMN ).getValue() === "Y" ),
                bIsVirtual = ( b.getProperty( model.PROP.DERIVED_COLUMN ).getValue() === "Y" );

            // Virtual columns should always be ordered last, and within them based on query column id
            if ( aIsVirtual && !bIsVirtual ) {
                return 1;
            } else if ( !aIsVirtual && bIsVirtual ) {
                return -1;
            } else {
                return parseInt( a.getProperty( model.PROP.QUERY_COLUMN_ID ).getValue(), 10 ) - parseInt( b.getProperty( model.PROP.QUERY_COLUMN_ID ).getValue(), 10 );
            }
        });
        updateColumns( model.PROP.QUERY_COLUMN_ID );

    } // reSequenceColumns


    function setChartXML( pChartAttr, pProperty ) {
        if ( pProperty.getValue() === "Y" ) {
            server.process( "getChartXML", {
                x01: pChartAttr.parentId
            },{
                dataType: "text",
                async: false, // Has to be sync because the setValue has to be executed as part of the current transaction
                success: function( pData ) {
                    var lCustomXML = pChartAttr.getProperty( model.PROP.CUSTOM_XML );
                    lCustomXML.setValue( pData );
                }
            });
        }
    }


    function hasOrderBy( pRegion ) {

        // Check region SQL statement if it contains an ORDER BY clause
        if ( pRegion.getProperty( model.PROP.REGION_SQL )) {
            return pRegion.getProperty( model.PROP.REGION_SQL ).hasOrderBy();
        } else {
            return pRegion.getProperty( model.PROP.REGION_FUNCTION_RETURNING_SQL ).hasOrderBy();
        }

    };


    function classicRptTabularFormPlugin( pAction, pProperty, pRegion, pComponentTypeId, pColumnComponentTypeId ) {

        function removeAll( pRegion ) {

            // Remove the report attributes and columns if that hasn't already been done (i.e if the region is removed)
            _removeChildren( pRegion, pComponentTypeId );
            _removeChildren( pRegion, pColumnComponentTypeId );

        } // removeAll

        var lColumns,
            lSourceProperty;


        if (  pAction === model.CALLBACK_ACTION.CREATED
           || ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, [ model.PROP.REGION_SQL, model.PROP.REGION_FUNCTION_RETURNING_SQL ] ) !== -1 ))
        {
            if ( pAction === model.CALLBACK_ACTION.CREATED ) {

                new model.Component({
                    typeId:   pComponentTypeId,
                    parentId: pRegion.id
                });
            }

            manageColumns( pRegion, pRegion, pColumnComponentTypeId, {
                removeCheck: function( pReportColumn ) {
                    // Remove the existing report column if it isn't contained in the SQL anymore,
                    // but don't remove it if it's one of our "virtual" columns
                    return ( pReportColumn.getProperty( model.PROP.DERIVED_COLUMN ).getValue() === "N" );
                },
                add: function( pValues, pSqlColumn ) {

                    pValues.push({ id: model.PROP.QUERY_COLUMN_ID, value: pSqlColumn.no });
                    if ( pSqlColumn.type === "BLOB" ) {
                        pValues.push({ id: model.PROP.CLASSIC_REPORT_COLUMN_TYPE, value: "IMAGE" });
                    }
                    pValues.push({ id: model.PROP.COLUMN_HEADING, value: initCapColumnName( pSqlColumn.name )});

                },
                update: function( pReportColumn, pSqlColumn ) {

                    // Check if the query column id has changed
                    var lProperty = pReportColumn.getProperty( model.PROP.QUERY_COLUMN_ID );
                    if ( parseInt( lProperty.getValue(), 10 ) !== pSqlColumn.no ) {
                        lProperty.setValue( pSqlColumn.no );
                    }
                }
            });
            reSequenceColumns( pRegion, pColumnComponentTypeId );

            // No column heading sorting is allowed if the report query contains an order by.
            // Reset all existing sort properties
            if ( hasOrderBy( pRegion ) ) {
                lColumns = pRegion.getChilds( pColumnComponentTypeId, {
                    filterFunction: function() {
                        var lColumnSortSequence = this.getProperty( model.PROP.COLUMN_SORT_SEQUENCE ),
                            lDisableSortColumn  = this.getProperty( model.PROP.DISABLE_SORT_COLUMN );

                        return (  ( lColumnSortSequence && lColumnSortSequence.getValue() !== "" )
                               || ( lDisableSortColumn  && lDisableSortColumn.getValue() === "N" )
                               );
                    }
                } );
                for ( var i = 0; i < lColumns.length; i++ ) {
                    lColumns[ i ].getProperty( model.PROP.COLUMN_SORT_SEQUENCE ).setValue( "" );
                    lColumns[ i ].getProperty( model.PROP.DISABLE_SORT_COLUMN  ).setValue( "Y" );
                }
            }

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, [ model.PROP.HAS_GENERIC_COLUMNS, model.PROP.GENERIC_COLUMN_COUNT ]) !== -1 ) {

            lSourceProperty = pProperty.component.getProperty( model.PROP.REGION_SQL );
            if ( !lSourceProperty ) {
                lSourceProperty = pProperty.component.getProperty( model.PROP.REGION_FUNCTION_RETURNING_SQL );
            }

            // Trigger a re-validation of the source property which will also set the _columns attribute.
            lSourceProperty.setValue( lSourceProperty.getValue(), true );

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            removeAll( pRegion );

        }
    } // classicRptTabularFormPlugin


    function classicRptTabularFormAttr( pAction, pProperty, pOldValue ) {

        var lPrintComponentTypeId;

        if ( this.typeId === model.COMP_TYPE.CLASSIC_REPORT ) {
            lPrintComponentTypeId = model.COMP_TYPE.CLASSIC_RPT_PRINT;
        } else {
            lPrintComponentTypeId = model.COMP_TYPE.TAB_FORM_PRINT;
        }

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            if ( this.getProperty( model.PROP.ENABLE_PRINTING ).getValue() === "Y" ) {
                new model.Component({
                    typeId:   lPrintComponentTypeId,
                    parentId: this.id
                });
            }
        } else if (  pAction === model.CALLBACK_ACTION.CHANGED
                  && pProperty.id === model.PROP.ENABLE_PRINTING
                  && pProperty.getValue() !== pOldValue )
        {
            if ( pProperty.getValue() === "Y" ) {
                new model.Component({
                    typeId:   lPrintComponentTypeId,
                    parentId: this.id
                });
            } else {
                _removeChildren( this, lPrintComponentTypeId );
            }
        }
    } // classicRptTabularFormAttr


    function interactiveReportPlugin( pAction, pProperty ) {

        var lIrAttributes,
            lDefaultIrTemplate;

        if (  pAction === model.CALLBACK_ACTION.CREATED
           || ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.REGION_SQL ))
        {
            if ( pAction === model.CALLBACK_ACTION.CREATED ) {

                lIrAttributes = new model.Component({
                    typeId:   model.COMP_TYPE.IR_ATTRIBUTES,
                    parentId: this.id
                });

                lDefaultIrTemplate = model.getTheme().defaultTemplates.ir;

                if ( lDefaultIrTemplate ) {
                    this.getProperty( model.PROP.REGION_TEMPLATE ).setValue( lDefaultIrTemplate );
                }

            } else {
                lIrAttributes = this.getChilds( model.COMP_TYPE.IR_ATTRIBUTES )[ 0 ];
            }

            manageColumns( this, lIrAttributes, model.COMP_TYPE.IR_COLUMN, {
                setSqlColumn: function( pSqlColumn ) {

                    // Normalize data types to just a few
                    pSqlColumn.isTzDependent = "N";
                    if ( pSqlColumn.type === "VARCHAR2" ) {
                        pSqlColumn.type = "STRING";
                    } else if ( pSqlColumn.type === "TIMESTAMP" || pSqlColumn.type === "TIMESTAMP_TZ" ) { // todo is TIMESTAMP_TZ really not TZ dependent?
                        pSqlColumn.type = "DATE";
                    } else if ( pSqlColumn.type === "TIMESTAMP_LTZ" ) {
                        pSqlColumn.type          = "DATE";
                        pSqlColumn.isTzDependent = "Y";
                    } else if ( pSqlColumn.type !== "NUMBER" && pSqlColumn.type !== "DATE" && pSqlColumn.type !== "CLOB" ) {
                        pSqlColumn.type = "OTHER";
                    }

                },
                compareCheck: function( pSqlColumn, pReportColumn ) {

                    return ( pSqlColumn.type === pReportColumn.getProperty( model.PROP.COLUMN_TYPE ).getValue());

                },
                add: function( pValues, pSqlColumn ) {

                    var lColumnFilterType = "D";

                    pValues.push({ id: model.PROP.COLUMN_TYPE, value: pSqlColumn.type });

                    if ( pSqlColumn.type === "DATE" ) {
                        pValues.push({ id: model.PROP.TZ_DEPENDENT, value: pSqlColumn.isTzDependent });
                        pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "CENTER" });

                    } else if ( pSqlColumn.type === "NUMBER" ) {
                        pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "RIGHT" });

                    } else if ( pSqlColumn.type === "CLOB" || pSqlColumn.type === "OTHER" ) {
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_SORT,          value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_CONTROL_BREAK, value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_AGGREGATE,     value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_COMPUTE,       value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_CHART,         value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_GROUP_BY,      value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_PIVOT,         value: "N" });
                        lColumnFilterType = "N";

                        if ( pSqlColumn.type === "OTHER" ) {
                            pValues.push({ id: model.PROP.ALLOW_USERS_TO_FILTER,    value: "N" });
                            pValues.push({ id: model.PROP.ALLOW_USERS_TO_HIGHLIGHT, value: "N" });
                        }
                    }

                    pValues.push({ id: model.PROP.IR_COLUMN_FILTER_TYPE, value: lColumnFilterType });
                    pValues.push({ id: model.PROP.COLUMN_HEADING, value: initCapColumnName( pSqlColumn.name )});

                },
                update: function( pReportColumn, pSqlColumn ) {

                    var lProperty;

                    // Check if the TZ has changed, in that case we just update that flag
                    if ( pSqlColumn.type === "DATE" ) {
                        lProperty = pReportColumn.getProperty( model.PROP.TZ_DEPENDENT );
                        if ( pSqlColumn.isTzDependent !== lProperty.getValue()) {
                            lProperty.setValue( pSqlColumn.isTzDependent );
                        }
                    }
                }
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the IR attributes if that hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.IR_ATTRIBUTES );

        }
    } // interactiveReportPlugin


    function interactiveReportAttr( pAction, pProperty, pOldValue ) {

        function hasPrintAttributes( pShowDownloadProperty, pDownloadFormatsProperty ) {
            var lIsShowDownload = pShowDownloadProperty.getValue() === "Y",
                lDownloadFormats = ( lIsShowDownload ) ? pDownloadFormatsProperty.getValue().split( ":" ) : [];

            return ( lIsShowDownload &&
                   (  $.inArray( "XLS", lDownloadFormats ) !== -1
                   || $.inArray( "PDF", lDownloadFormats ) !== -1
                   || $.inArray( "RTF", lDownloadFormats ) !== -1 ) );
        }


        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            if ( hasPrintAttributes( this.getProperty( model.PROP.SHOW_DOWNLOAD ),
                                     this.getProperty( model.PROP.DOWNLOAD_FORMATS ) ) ) {
                new model.Component({
                    typeId:   model.COMP_TYPE.IR_PRINT_ATTR,
                    parentId: this.id
                });
            }

        } else if (  pAction === model.CALLBACK_ACTION.CHANGED
                  && ( pProperty.id === model.PROP.DOWNLOAD_FORMATS ||
                       pProperty.id === model.PROP.SHOW_DOWNLOAD )
                  && pProperty.getValue() !== pOldValue )
        {
            if ( hasPrintAttributes( this.getProperty( model.PROP.SHOW_DOWNLOAD ),
                                     this.getProperty( model.PROP.DOWNLOAD_FORMATS ) ) ) {

                // Only create the print component if it doesn't exist yet
                if ( model.getComponents( model.COMP_TYPE.IR_PRINT_ATTR, { parentId: this.id }).length === 0 ) {
                    new model.Component({
                        typeId:   model.COMP_TYPE.IR_PRINT_ATTR,
                        parentId: this.id
                    });
                }
            } else {
                _removeChildren( this, model.COMP_TYPE.IR_PRINT_ATTR );
            }
        }
    } // interactiveReportAttr


    function classicReportPlugin( pAction, pProperty ) {

        classicRptTabularFormPlugin( pAction, pProperty, this, model.COMP_TYPE.CLASSIC_REPORT, model.COMP_TYPE.CLASSIC_RPT_COLUMN );

    } // classicReportPlugin


    function tabularFormPlugin( pAction, pProperty ) {

        var lSelf = this,
            lTabForms;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            alert( format( "TABFORM.WARNING" ));

        } else if ( pAction === model.CALLBACK_ACTION.VALIDATE && pProperty.id === model.PROP.REGION_TYPE ) {

            // Raise an error if there is already a tabular form on the page
            lTabForms = model.getComponents( model.COMP_TYPE.REGION, {
                properties: [{
                    id: model.PROP.REGION_TYPE,
                    value: "NATIVE_TABFORM" }
                ],
                filterFunction: function() {
                    return ( this.id !== lSelf.id );
                }
            });

            if ( lTabForms.length > 0 ) {
                return { error: format( "TABFORM.ONLY_ONE_PER_PAGE" ) };
            }
        }
        classicRptTabularFormPlugin( pAction, pProperty, this, model.COMP_TYPE.TABULAR_FORM, model.COMP_TYPE.TAB_FORM_COLUMN );

    } // tabularFormPlugin


    function classicRptTabularFormColumn( pColumn, pComponentTypeId, pAction, pProperty, pValue ) {

        var lRegion = pColumn.getParent();

        // No sorting is allowed if the report query contains an order by
        if (  pAction === model.CALLBACK_ACTION.VALIDATE
           && (  ( pProperty.id === model.PROP.DISABLE_SORT_COLUMN  && pValue === "N" )
              || ( pProperty.id === model.PROP.COLUMN_SORT_SEQUENCE && pValue !== "" )
              )
           && hasOrderBy( lRegion )
           )
        {
            return { error: format( "CLASSIC_RPT_TABFORM_COLUMN.NO_SORTING" ) };

        } else if (  pAction === model.CALLBACK_ACTION.CHANGED
                  && pProperty.id === model.PROP.COLUMN_SORT_SEQUENCE
                  && pProperty.getValue() === ""
                  && hasOrderBy( lRegion )
                  && pColumn.getProperty( model.PROP.DISABLE_SORT_COLUMN ).getValue() === "N"
                  )
        {
            pColumn.getProperty( model.PROP.DISABLE_SORT_COLUMN ).setValue( "Y" );
        } else if ( lRegion && pAction === model.CALLBACK_ACTION.REMOVED ) {
            reSequenceColumns( lRegion, pComponentTypeId );
        }

    } // classicRptTabularFormColumn


    function classicReportColumn( pAction, pProperty, pValue ) {

        return classicRptTabularFormColumn( this, model.COMP_TYPE.CLASSIC_RPT_COLUMN, pAction, pProperty, pValue );

    } // classicReportColumn


    function tabularFormColumn( pAction, pProperty, pValue ) {

        return classicRptTabularFormColumn( this, model.COMP_TYPE.TAB_FORM_COLUMN, pAction, pProperty, pValue );

    } // tabularFormColumn


    function regionPluginWithColumns( pAction, pProperty ) {

        var PLUGIN               = model.getComponentType( model.COMP_TYPE.REGION ).pluginType.plugins [ this.getProperty( model.PROP.REGION_TYPE ).getValue() ],
            HAS_COLUMN_ALIGNMENT = ( $.inArray( "VALUE_ALIGNMENT", PLUGIN.stdAttributes ) !== -1 );

        if (  pAction === model.CALLBACK_ACTION.CREATED
           || ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.REGION_SQL ))
        {
            //
            // Note: Keep this code in sync with wwv_flow_wizard_api.create_region_columns!
            //
            manageColumns( this, this, model.COMP_TYPE.REGION_COLUMN, {
                add: function( pValues, pSqlColumn ) {

                    pValues.push({ id: model.PROP.HIDDEN_REGION_TYPE, value: PLUGIN.name });
                    pValues.push({ id: model.PROP.COLUMN_TYPE,        value: pSqlColumn.type });

                    if ( pSqlColumn.type === "ROWID" ) {
                        pValues.push({ id: model.PROP.IS_VISIBLE, value: "N" });
                    } else if ( $.inArray( "COLUMN_HEADING", PLUGIN.stdAttributes ) !== -1 ) {
                        pValues.push({ id: model.PROP.COLUMN_HEADING, value: initCapColumnName( pSqlColumn.name )});
                    }

                    if ( HAS_COLUMN_ALIGNMENT ) {

                        if ( $.inArray( pSqlColumn.type, [ "DATE", "TIMESTAMP", "TIMESTAMP_TZ", "TIMESTAMP_LTZ" ]) !== -1 ) {
                            pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "CENTER" });

                        } else if ( pSqlColumn.type === "NUMBER" ) {
                            pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "RIGHT" });

                        }
                    }

                },
                update: function( pRegionColumn, pSqlColumn ) {

                    var lProperty = pRegionColumn.getProperty( model.PROP.COLUMN_TYPE );

                    // Update the column type property if it has changed
                    // We intentionally don't set IS_VISIBLE or COLUMN_ALIGNMENT, because that might have already
                    // been changed by the developer
                    if ( lProperty.getValue() !== pSqlColumn.type ) {
                        lProperty.setValue( pSqlColumn.type );
                    }
                }
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove all region columns if that hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.REGION_COLUMN );

        }
    } // regionPluginWithColumns


    function mapChartPlugin( pAction, pProperty ) {

        var lMapChart;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // Create the map chartPlugin and the first series
            lMapChart = new model.Component({
                typeId:   model.COMP_TYPE.MAP_CHART,
                parentId: this.id,
                values:   [{
                    id:    model.PROP.CHART_TITLE,
                    value: this.getDisplayTitle()
                }]
            });
            new model.Component({
                typeId:   model.COMP_TYPE.MAP_CHART_SERIES,
                parentId: lMapChart.id
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the map chartPlugin if it hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.MAP_CHART );

        }
    } // mapChartPlugin


    function chartPlugin( pAction, pProperty ) {

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // Create the chartPlugin attributes
            new model.Component({
                typeId:   model.COMP_TYPE.CHART,
                parentId: this.id,
                values:   [{
                    id:    model.PROP.CHART_TITLE,
                    value: this.getDisplayTitle()
                }]
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the chartPlugin attributes if it hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.CHART );

        }
    } // chartPlugin


    function chartAttributes( pAction, pProperty ) {

        var SOURCE_TYPES = [
                model.PROP.PROJECT_GANTT_SERIES_SOURCE_TYPE,
                model.PROP.RESOURCE_GANTT_SERIES_SOURCE_TYPE,
                model.PROP.PIE_DOUGHNUT_SERIES_SOURCE_TYPE,
                model.PROP.DIAL_SERIES_SOURCE_TYPE,
                model.PROP.SCATTER_SERIES_SOURCE_TYPE,
                model.PROP.RANGE_SERIES_SOURCE_TYPE,
                model.PROP.CANDLESTICK_SERIES_SOURCE_TYPE,
                model.PROP.LINE_COL_BAR_STK_SERIES_SOURCE_TYPE ],
            SOURCE_QUERIES = [
                model.PROP.PROJECT_GANTT_SOURCE_QUERY,
                model.PROP.RESOURCE_GANTT_SOURCE_QUERY,
                model.PROP.PIE_DOUGHNUT_SOURCE_QUERY,
                model.PROP.DIAL_SOURCE_QUERY,
                model.PROP.SCATTER_SOURCE_QUERY,
                model.PROP.RANGE_SOURCE_QUERY,
                model.PROP.CANDLESTICK_SOURCE_QUERY,
                model.PROP.LINE_COL_BAR_STK_SOURCE_QUERY ],
            SOURCE_FUNCTIONS = [
                model.PROP.PROJECT_GANTT_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.RESOURCE_GANTT_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.PIE_DOUGHNUT_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.DIAL_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.SCATTER_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.RANGE_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.CANDLESTICK_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.LINE_COL_BAR_STK_SOURCE_FUNC_RETURNING_SQL ];

        var lChartType = this.getProperty( model.PROP.CHART_TYPE ).getValue(),
            lSeries,
            lSourceType,
            lSourceQuery,
            lSourceFunction;

        function getValue( pComponent, pProperties ) {
            var lProperty;
            for ( var i = 0; i < pProperties.length; i++ ) {
                lProperty = pComponent.getProperty( pProperties[ i ]);
                if ( lProperty !== undefined ) {
                    return lProperty.getValue();
                }
            }
        }

        function setValue( pComponent, pProperties, pValue ) {
            var lProperty;
            for ( var i = 0; i < pProperties.length; i++ ) {
                lProperty = pComponent.getProperty( pProperties[ i ]);
                if ( lProperty !== undefined ) {
                    lProperty.setValue( pValue );
                    return;
                }
            }
        }

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // Create the first series
            new model.Component({
                typeId:   model.COMP_TYPE.CHART_SERIES,
                parentId: this.id,
                values: [{
                    id:    model.PROP.SERIES_CHART_TYPE,
                    value: lChartType
                }]
            });

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            if ( pProperty.id === model.PROP.CHART_TYPE ) {
                lSeries = this.getChilds( model.COMP_TYPE.CHART_SERIES );

                // synchronize the current chartPlugin type to all series
                for ( var i = 0; i < lSeries.length; i++ ) {
                    // The Source Type property is depending on the SERIES_CHART_TYPE property,
                    // because of the different requirements for the SQL statement (number of columns, ...)
                    // If the chartPlugin type gets changed, the developer would loose it's existing SQL statement.
                    // That's why we preserve it and restore it, knowing that it will syntactically be invalid,
                    // but it will be a lot easier for a developer to change it than typing it in again.
                    lSourceType     = getValue( lSeries[ i ], SOURCE_TYPES );
                    lSourceQuery    = getValue( lSeries[ i ], SOURCE_QUERIES );
                    lSourceFunction = getValue( lSeries[ i ], SOURCE_FUNCTIONS );

                    lSeries[ i ].getProperty( model.PROP.SERIES_CHART_TYPE ).setValue( lChartType );

                    setValue( lSeries[ i ], SOURCE_TYPES,     lSourceType );
                    setValue( lSeries[ i ], SOURCE_QUERIES,   lSourceQuery );
                    setValue( lSeries[ i ], SOURCE_FUNCTIONS, lSourceFunction );
                }

                // Some chartPlugin types only support one series, remove all the others
                if ( $.inArray( lChartType, [ "COLUMN", "STACKED_COLUMN", "STACKED_COLUMN_PCT", "BAR", "STACKED_BAR", "STACKED_BAR_PCT", "LINE" ]) === -1 ) {
                    for ( var i = 1; i < lSeries.length; i++ ) {
                        lSeries[ i ].remove();
                    }
                }

                // For line charts we want to default the series type to Line.
                if ( lChartType === "LINE" && lSeries.length === 1 ) {
                    lSeries[ 0 ].getProperty( model.PROP.SERIES_TYPE ).setValue( "Line" );
                }

            } else if ( pProperty.id === model.PROP.USE_CUSTOM_XML ) {

                setChartXML( this, pProperty );

            }
        }
    } // chartAttributes


    function legacyCalendarPlugin( pAction, pProperty ) {

        var lSelf = this,
            lCalendars;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            new model.Component({
                typeId:   model.COMP_TYPE.CLASSIC_CALENDAR,
                parentId: this.id
            });
            alert( format( "LEGACY_CALENDAR.WARNING" ));

        } else if ( pAction === model.CALLBACK_ACTION.VALIDATE && pProperty.id === model.PROP.REGION_TYPE ) {

            // Raise an error if there is already a legacy calendar on the page
            lCalendars = model.getComponents( model.COMP_TYPE.REGION, {
                properties: [{
                    id: model.PROP.REGION_TYPE,
                    value: "NATIVE_CALENDAR" }
                ],
                filterFunction: function() {
                    return ( this.id !== lSelf.id );
                }
            });

            if ( lCalendars.length > 0 ) {
                return { error: format( "LEGACY_CALENDAR.ONLY_ONE_PER_PAGE" ) };
            }

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the calendar attributes if it hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.CLASSIC_CALENDAR );

        }
    } // legacyCalendarPlugin


    function setValuePlugin( pAction, pProperty ) {

        var SET_TYPE_ID     = model.getPluginProperty( model.COMP_TYPE.DA_ACTION, "NATIVE_SET_VALUE", 1 ).id,
            lFireOnPageLoad = this.getProperty( model.PROP.FIRE_ON_PAGE_LOAD );

        // By default, a set value operation of type "Dialog Return Item" should not fire during page load, because
        // it only works in a "Dialog Closed" event.
        if (  pAction === model.CALLBACK_ACTION.CHANGED
           && pProperty.id === SET_TYPE_ID
           && pProperty.getValue() === "DIALOG_RETURN_ITEM"
           && lFireOnPageLoad.getValue() === "Y" )
        {
            lFireOnPageLoad.setValue( "N" );
        }

    } // setValuePlugin


    function webServicePlugin( pAction, pProperty, pOldValue ) {

        var PLUGIN_NAME              = this.getProperty( model.PROP.PAGE_PROCESS_TYPE ).getValue(),
            WS_OPER_PROPERTY_ID      = model.getPluginProperty( model.COMP_TYPE.PAGE_PROCESS, PLUGIN_NAME, 1 ).id,
            STORE_RESULT_PROPERTY_ID = model.getPluginProperty( model.COMP_TYPE.PAGE_PROCESS, PLUGIN_NAME, 2 ).id;

        var that           = this,
            lWsOperationId,
            lStoreResultIn;

        function removeAllParams() {
            _removeChildren( that, model.COMP_TYPE.PAGE_PROC_WS_P_I );
            _removeChildren( that, model.COMP_TYPE.PAGE_PROC_WS_P_O );
            _removeChildren( that, model.COMP_TYPE.PAGE_PROC_WS_P_A );
        }

        function addParams( pWsOperationId, pComponentTypeId, pNewComponentTypeId ) {

            // Get all parameters of that web service operation and attach them to the process
            var lParameters = model.getComponents( pComponentTypeId, { parentId: pWsOperationId });

            for ( var i = 0; i < lParameters.length; i++ ) {
                new model.Component({
                    typeId:   pNewComponentTypeId,
                    parentId: that.id,
                    values: [
                        {
                            id:    model.PROP.PARAMETER_ID,
                            value: lParameters[ i ].id
                        },
                        {
                            id:    model.PROP.NAME,
                            value: lParameters[ i ].getProperty( model.PROP.NAME ).getValue()
                        }
                    ]
                });
            }
        } // addParams


        if ( pAction === model.CALLBACK_ACTION.CREATED || pAction === model.CALLBACK_ACTION.CHANGED ) {
            lWsOperationId = this.getProperty( WS_OPER_PROPERTY_ID ).getValue();
            lStoreResultIn = this.getProperty( STORE_RESULT_PROPERTY_ID ).getValue();
        }

        if (  ( pAction === model.CALLBACK_ACTION.CREATED && lWsOperationId !== "" )
           || ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === WS_OPER_PROPERTY_ID && lWsOperationId !== pOldValue ))
        {
            // If the selected web service operation has been changed, remove all existing parameters
            if ( pAction === model.CALLBACK_ACTION.CHANGED ) {
                removeAllParams();
            }

            // Initialize the process specific in/out/auth parameters based on the web service operation parameters
            if ( lWsOperationId !== "" ) {
                addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_I, model.COMP_TYPE.PAGE_PROC_WS_P_I );
                addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_H, model.COMP_TYPE.PAGE_PROC_WS_P_I );
                if ( lStoreResultIn === "ITEMS" ) {
                    addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_O, model.COMP_TYPE.PAGE_PROC_WS_P_O );
                }
                addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_A, model.COMP_TYPE.PAGE_PROC_WS_P_A );
            }

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === STORE_RESULT_PROPERTY_ID && lStoreResultIn !== pOldValue ) {

            _removeChildren( that, model.COMP_TYPE.PAGE_PROC_WS_P_O );

            // Only initialize the output parameters if the result should be stored in items
            if ( lStoreResultIn === "ITEMS" ) {
                addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_O, model.COMP_TYPE.PAGE_PROC_WS_P_O );
            }

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove all parameters if that hasn't already been done (i.e if the region is removed)
            removeAllParams();

        }
    } // webServicePlugin


    function nativeItemPlugins( pAction, pProperty ) {

        var lItemType = this.getProperty( model.PROP.ITEM_TYPE ).getValue(),
            lAllowMultiSelection,
            lHeight;

        if ( lItemType === ITEM_TYPE.SELECT_LIST && ( pAction === model.CALLBACK_ACTION.CREATED || pAction === model.CALLBACK_ACTION.CHANGED )) {

            lAllowMultiSelection = this.getProperty( model.getPluginProperty( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.SELECT_LIST, 2 ).id );

            // Only if the item type or the allow multi selection property has changed, we will change the height
            if ( lAllowMultiSelection && ( pAction === model.CALLBACK_ACTION.CREATED || pProperty.id === lAllowMultiSelection.id )) {
                if ( lAllowMultiSelection.getValue() === "Y" ) {
                    lHeight = 5;
                } else {
                    lHeight = 1;
                }
                this.getProperty( model.PROP.ELEMENT_HEIGHT ).setValue( lHeight );
            }

        } else if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // For some item types we automatically set the height to 5 because they are designed to be multi line
            if ( $.inArray( lItemType, [ ITEM_TYPE.RICH_TEXT_EDITOR, ITEM_TYPE.TEXTAREA, ITEM_TYPE.SHUTTLE ]) !== -1 ) {

                this.getProperty( model.PROP.ELEMENT_HEIGHT ).setValue( 5 );

            } else if ( lItemType === ITEM_TYPE.FILE && getDmlProcesses().length === 0 ) {

                // Don't use "BLOB column specified..." storage type if page doesn't have a Fetch/DML process
                this.getProperty( model.getPluginProperty( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.FILE, 1 ).id ).setValue( "APEX_APPLICATION_TEMP_FILES" );

            }

        }

    } // nativeItemPlugins


    function pageItem( pAction, pProperty, pOldValue ) {

        var PAGE_PREFIX = /^(P\d+_)/;

        var lOldDbColumnName,
            lNewDbColumnName,
            lItemLabel,
            lDbSourceColumn,
            lSourceType,
            lSourceUsed,
            lValueRequired,
            lMaxCharacters,
            lDmlProcesses,
            lColumns;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // We only want to create a page item with source type default to "DB Column" if the
            // current page contains a fetch/DML process. Otherwise it's up to the developer to populate it
            lSourceType = this.getProperty( model.PROP.SOURCE_TYPE );
            if ( lSourceType && lSourceType.getValue() === "DB_COLUMN" ) {

                if ( getDmlProcesses().length === 0 ) {
                    lSourceType.setValue( "ALWAYS_NULL" );
                }
            }

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            if ( pProperty.id === model.PROP.ITEM_NAME ) {
                // Has the item name changed?

                lOldDbColumnName = pOldValue.replace( PAGE_PREFIX, "" );
                lNewDbColumnName = pProperty.getValue().replace( PAGE_PREFIX, "" );

                // Keep the "Label" property in sync if the label is empty or equal to the old page item name
                lItemLabel = this.getProperty( model.PROP.ITEM_LABEL );
                if (  lItemLabel
                   && ( initCapColumnName( lOldDbColumnName ) === lItemLabel.getValue() || lItemLabel.getValue() === "" ))
                {
                    lItemLabel.setValue( initCapColumnName( lNewDbColumnName ));
                }

                // Keep the db column name in sync if the DB Column is empty or equal to the old page item name
                lDbSourceColumn = this.getProperty( model.PROP.SOURCE_DB_COLUMN );
                if (  lDbSourceColumn
                   && ( pOldValue.replace( PAGE_PREFIX, "" ) === lDbSourceColumn.getValue() || lDbSourceColumn.getValue() === "" ))
                {
                   lDbSourceColumn.setValue( pProperty.getValue().replace( PAGE_PREFIX, "" ));
                }

            } else if ( pProperty.id === model.PROP.SOURCE_TYPE ) {
                // Always default "Used" to "Always, replacing any existing value in session state" if page item is based on a DB column
                lSourceUsed = this.getProperty( model.PROP.SOURCE_USED );
                if ( lSourceUsed && pProperty.getValue() === "DB_COLUMN" ) {
                    lSourceUsed.setValue( "NO" );
                } else {
                    lSourceUsed.setValue( "YES" );
                }

            } else if ( pProperty.id === model.PROP.SOURCE_DB_COLUMN ) {
                // Has the "DB column" property changed?

                lNewDbColumnName = pProperty.getValue();

                // Try to find the column definition based on the Fetch or DML process specified for the current page
                lDmlProcesses = getDmlProcesses();

                if ( lDmlProcesses.length > 0 ) {
                    if ( lDmlProcesses[ 0 ].getProperty( model.PROP.PAGE_PROCESS_TYPE ).getValue() === "NATIVE_FORM_FETCH" ) {
                        lColumns = lDmlProcesses[ 0 ].getProperty( model.PROP.FORM_FETCH_TABLE_NAME ).getColumns();
                    } else {
                        lColumns = lDmlProcesses[ 0 ].getProperty( model.PROP.FORM_PROCESS_TABLE_NAME ).getColumns();
                    }
                    // Try to lookup the entered DB column name and set the "Value Required" and "Maximum Characters" property based
                    // on the column specification.
                    for ( var i = 0; i < lColumns.length; i++ ) {
                        if ( lColumns[ i ].name === lNewDbColumnName ) {

                            // Set "Value Required" property if the page item has one
                            lValueRequired = this.getProperty( model.PROP.VALUE_REQUIRED );
                            if ( lValueRequired ) {
                                lValueRequired.setValue( lColumns[ i ].isRequired ? "Y" : "N" );
                            }

                            // Set "Maximum Characters" property if the page item has one
                            lMaxCharacters = this.getProperty( model.PROP.ELEMENT_MAX_CHARACTERS );
                            if ( lMaxCharacters ) {
                                lMaxCharacters.setValue( lColumns[ i ].hasOwnProperty( "maxLen" ) ? lColumns[ i ].maxLen + "" : "" );
                            }
                        }
                    }
                }
            }
        }
    } // pageItem


    function button( pAction, pProperty, pOldValue ) {

        var lLabel       = this.getProperty( model.PROP.BUTTON_LABEL ),
            lNameInitCap = initCapColumnName( this.getProperty( model.PROP.BUTTON_NAME ).getValue() );

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            lLabel.setValue( lNameInitCap );

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            if ( pProperty.id === model.PROP.BUTTON_NAME ) {
                // Keep the "Label" property in sync if the label is empty or equal to the old button name
                lLabel = this.getProperty( model.PROP.BUTTON_LABEL );
                if ( initCapColumnName( pOldValue ) === lLabel.getValue() || lLabel.getValue() === "" ) {
                    lLabel.setValue( lNameInitCap );
                }
            }
        }
    } // button


    function region( pAction, pProperty, pOldValue ) {

        // Don't show sub regions in a "Region Display Selector"
        if (  this.getProperty( model.PROP.PARENT_REGION ).getValue() !== ""
           && (  pAction === model.CALLBACK_ACTION.CREATED
              || ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.PARENT_REGION && pOldValue === "" )
              )
           )
        {
            this.getProperty( model.PROP.REGION_DISPLAY_SELECTOR ).setValue( "N" );
        }
    } // region


    function mapChartAttributes ( pAction, pProperty ) {
        if ( pAction === model.CALLBACK_ACTION.CHANGED ) {
            if ( pProperty.id === model.PROP.USE_CUSTOM_XML ) {
                setChartXML( this, pProperty );
            }
        }
    }


    function printAttributes( pAction, pProperty, pOldValue ) {

        var DECIMAL_SEP = locale.getDecimalSeparator(),
            PAGE_SIZES = {
                "LETTER": {
                    units:  "INCHES",
                    width:  "8" + DECIMAL_SEP + "5",
                    height: "11"
                },
                "LEGAL": {
                    units:  "INCHES",
                    width:  "8" + DECIMAL_SEP + "5",
                    height: "14"
                },
                "TABLOID": {
                    units:  "INCHES",
                    width:  "8.5",
                    height: "17"
                },
                "A4": {
                    units:  "MILLIMETERS",
                    width:  "210",
                    height: "297"
                },
                "A3": {
                    units:  "MILLIMETERS",
                    width:  "297",
                    height: "420"
                }
            };

        var lPageSize,
            lWidth,
            lHeight;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            if ( $.inArray( model.getPrimaryLanguage(), [ "en", "en-us", "en-ca", "fr-ca" ]) !== -1 ) {
                lPageSize = "LETTER";
            } else {
                lPageSize = "A4";
            }
            this.getProperty( model.PROP.PRINT_PAGE_SIZE ).setValue( lPageSize );
            this.getProperty( model.PROP.PRINT_UNITS  ).setValue( PAGE_SIZES[ lPageSize ].units );
            this.getProperty( model.PROP.PRINT_WIDTH  ).setValue( PAGE_SIZES[ lPageSize ].width );
            this.getProperty( model.PROP.PRINT_HEIGHT ).setValue( PAGE_SIZES[ lPageSize ].height );

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            if ( pProperty.id === model.PROP.PRINT_PAGE_SIZE && pProperty.getValue() !== "CUSTOM" ) {
                // Has the page size been changed changed?

                lPageSize = PAGE_SIZES[ pProperty.getValue() ];

                this.getProperty( model.PROP.PRINT_UNITS ).setValue( lPageSize.units );
                if ( this.getProperty( model.PROP.PRINT_ORIENTATION ).getValue() === "VERTICAL" ) {
                    this.getProperty( model.PROP.PRINT_WIDTH  ).setValue( lPageSize.width );
                    this.getProperty( model.PROP.PRINT_HEIGHT ).setValue( lPageSize.height );
                } else {
                    this.getProperty( model.PROP.PRINT_WIDTH  ).setValue( lPageSize.height );
                    this.getProperty( model.PROP.PRINT_HEIGHT ).setValue( lPageSize.width );
                }

            } else if ( pProperty.id === model.PROP.PRINT_ORIENTATION ) {

                // Swap existing width and height values
                lWidth  = this.getProperty( model.PROP.PRINT_WIDTH  ).getValue();
                lHeight = this.getProperty( model.PROP.PRINT_HEIGHT ).getValue();

                this.getProperty( model.PROP.PRINT_WIDTH  ).setValue( lHeight );
                this.getProperty( model.PROP.PRINT_HEIGHT ).setValue( lWidth );

            }
        }
    } // printAttributes


    function dynamicActionEvent( pAction, pProperty ) {

        var lWhenButton,
            lButtonAction;

        // If the dynamic action event is associated to a button, make sure that the button action is set to "Defined by Dynamic Action".
        if (  pAction === model.CALLBACK_ACTION.CREATED
           || ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.WHEN_BUTTON ))
        {
            lWhenButton = this.getProperty( model.PROP.WHEN_BUTTON );
            if (  !/^apex/.test( this.getProperty( model.PROP.EVENT ).getValue() ) // apex events are listening event, no need to change the button execution
               && lWhenButton
               && !lWhenButton.getMetaData().isReadOnly
               && lWhenButton.getValue() !== "" )
            {
                lButtonAction = model.getComponents( model.COMP_TYPE.BUTTON, { id: lWhenButton.getValue() })[ 0 ].getProperty( model.PROP.BUTTON_ACTION );

                if ( lButtonAction.getValue() !== "DEFINED_BY_DA" ) {
                    lButtonAction.setValue( "DEFINED_BY_DA" );
                }
            }
        }
    } // dynamicActionEvent


    $( document ).on( "modelConfigLoaded", function() {

        var REGION_PLUGINS = model.getComponentType( model.COMP_TYPE.REGION ).pluginType.plugins;

        // Some component types have to execute additional code if they are created/modified/deleted
        model.setComponentTypeCallback( model.COMP_TYPE.PAGE_ITEM,          pageItem );
        model.setComponentTypeCallback( model.COMP_TYPE.BUTTON,             button );
        model.setComponentTypeCallback( model.COMP_TYPE.REGION,             region );
        model.setComponentTypeCallback( model.COMP_TYPE.DA_EVENT,           dynamicActionEvent );
        model.setComponentTypeCallback( model.COMP_TYPE.CHART,              chartAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.CLASSIC_REPORT,     classicRptTabularFormAttr );
        model.setComponentTypeCallback( model.COMP_TYPE.CLASSIC_RPT_COLUMN, classicReportColumn );
        model.setComponentTypeCallback( model.COMP_TYPE.TABULAR_FORM,       classicRptTabularFormAttr );
        model.setComponentTypeCallback( model.COMP_TYPE.TAB_FORM_COLUMN,    tabularFormColumn );
        model.setComponentTypeCallback( model.COMP_TYPE.IR_ATTRIBUTES,      interactiveReportAttr );
        model.setComponentTypeCallback( model.COMP_TYPE.IR_PRINT_ATTR,      printAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.CLASSIC_RPT_PRINT,  printAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.TAB_FORM_PRINT,     printAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.MAP_CHART,          mapChartAttributes );

        // Register a default handling for region types which use columns
        for ( var lName in REGION_PLUGINS ) {
            if ( REGION_PLUGINS.hasOwnProperty( lName ) && $.inArray( "COLUMNS", REGION_PLUGINS[ lName ].stdAttributes ) !== -1 ) {
                model.setPluginCallback( model.COMP_TYPE.REGION, lName, regionPluginWithColumns );
            }
        }

        // Some plug-ins need extra handling if the region type or source property gets changed
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_IR",           interactiveReportPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_SQL_REPORT",   classicReportPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_FNC_REPORT",   classicReportPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_TABFORM",      tabularFormPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_FLASH_MAP",    mapChartPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_FLASH_CHART5", chartPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_CALENDAR",     legacyCalendarPlugin );
        model.setPluginCallback( model.COMP_TYPE.DA_ACTION, "NATIVE_SET_VALUE", setValuePlugin );

        // Some plug-ins need extra handling if the item type gets changed
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.RICH_TEXT_EDITOR, nativeItemPlugins );
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.TEXTAREA,         nativeItemPlugins );
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.SHUTTLE,          nativeItemPlugins );
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.SELECT_LIST,      nativeItemPlugins );
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.FILE,             nativeItemPlugins );

        // Some plug-ins need extra handling if the process type gets changed
        model.setPluginCallback( model.COMP_TYPE.PAGE_PROCESS, "NATIVE_WEB_SERVICE",        webServicePlugin );
        model.setPluginCallback( model.COMP_TYPE.PAGE_PROCESS, "NATIVE_WEB_SERVICE_LEGACY", webServicePlugin );

    });

})( pe, apex.jQuery, apex.debug, apex.util, apex.locale, apex.lang, apex.server );

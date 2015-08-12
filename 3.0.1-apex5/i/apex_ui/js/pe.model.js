/*global apex*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright © 2013, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * todo documentation
 *
 * todo The properties GRID_COLUMN and GRID_COLUMN_SPAN should show a warning if the currently used grid column isn't available anymore
 * todo The properties REGION_POSITION and BUTTON_POSITION should show a warning if the currently position isn't available
 **/

/**
 * @namespace
 **/
pe = (function( $, util, locale, lang, server, debug, undefined ) {
    "use strict";

    // Constants for component types and properties we use in our code
    // Note: Keep them in sync with apex_install_pe.sql!
    var COMP_TYPE = {
            APPLICATION:      "1000",

            THEME:            "2000",

            PAGE_TEMPLATE:       "2510",
            FIELD_TEMPLATE:      "2520",
            BUTTON_TEMPLATE:     "2530",
            REGION_TEMPLATE:     "2540",
            LIST_TEMPLATE:       "2550",
            BREADCRUMB_TEMPLATE: "2560",
            CALENDAR_TEMPLATE:   "2570",
            REPORT_TEMPLATE:     "2580",

            APP_ITEM:         "3010",
            APP_COMPUTATION:  "3020",
            APP_PROCESS:      "3030",
            BUILD_OPTION:     "3040",
            AUTHENTICATION:   "3050",
            AUTHORIZATION:    "3060",

            BREADCRUMB:       "3510",
            LIST:             "3520",
            LOV:              "3530",
            WS_REF:           "3540",
            WS_REF_OPER:      "3541",
            WS_REF_OPER_P_I:  "3545",
            WS_REF_OPER_P_O:  "3546",
            WS_REF_OPER_P_A:  "3547",
            WS_REF_OPER_P_H:  "3548",
            DATA_LOAD_TABLE:  "3550",
            TAB_SET:          "3560",
//            PLUGIN:           "1", // todo to be changed to real number

            PAGE:             "5000",
            REGION:           "5110",
            PAGE_ITEM:        "5120",
            BUTTON:           "5130",
            DA_EVENT:         "5140",
            DA_ACTION:        "5150",
            VALIDATION:       "5510",
            PAGE_COMPUTATION: "5520",
            PAGE_PROCESS:     "5530",
            BRANCH:           "5540",

            REGION_PLUGIN_ATTR: "7000",

            IR_ATTRIBUTES:    "7010",
            IR_SAVED_REPORT:  "7020",
            IR_COLUMN_GROUP:  "7030",
            IR_COLUMN:        "7040",
            IR_PRINT_ATTR:    "7050",

            PAGE_PROC_WS_P_I:   "7110",
            PAGE_PROC_WS_P_O:   "7120",
            PAGE_PROC_WS_P_A:   "7130",

            MAP_CHART:          "7210",
            MAP_CHART_SERIES:   "7220",

            CLASSIC_REPORT:     "7310",
            CLASSIC_RPT_COLUMN: "7320",
            CLASSIC_RPT_PRINT:  "7330",

            TABULAR_FORM:       "7410",
            TAB_FORM_COLUMN:    "7420",
            TAB_FORM_PRINT:     "7430",

            CHART:              "7510",
            CHART_SERIES:       "7520",

            CLASSIC_CALENDAR:   "7610",

            REGION_COLUMN:      "7710"
        },
        PROP = {
            NAME:                   "1",
            ERROR_MESSAGE:          "6",
            PAGE_GROUP:             "9",
            PAGE_MODE:             "10",
            PAGE_TEMPLATE:         "11",
            STANDARD_TAB_SET:      "12",
            TITLE:                 "13",
            AUTHORIZATION_SCHEME:  "24",
            BUILD_OPTION:          "38",
            COMPUTATION_ITEM_NAME: "51",
            COMPUTATION_TYPE:      "52",
            COMPUTATION_STATIC_VALUE:        "53",
            COMPUTATION_SQL_STATEMENT:       "54",
            COMPUTATION_SQL_EXPRESSION:      "55",
            COMPUTATION_PLSQL_EXPRESSION:    "56",
            COMPUTATION_PLSQL_FUNCTION_BODY: "57",
            COMPUTATION_ITEM_VALUE:          "58",
            COMPUTATION_PREFERENCE_VALUE:    "59",
            EXECUTION_SEQUENCE:    "60",
            COMPUTATION_POINT:     "61",
            EVENT:                 "62",
            CUSTOM_EVENT:          "63",
            WHEN_TYPE:             "64",
            WHEN_REGION:           "65",
            WHEN_BUTTON:           "66",
            WHEN_ITEMS:            "67",
            WHEN_DOM_OBJECT:       "68",
            WHEN_JQUERY_SELECTOR:  "69",
            DA_ACTION_TYPE:        "82",
            FIRE_WHEN_EVENT_RESULT_IS: "83",
            FIRE_ON_PAGE_LOAD:         "84",
            AFFECTED_TYPE:             "85",
            AFFECTED_REGION:           "86",
            AFFECTED_BUTTON:           "87",
            AFFECTED_ITEMS:            "88",
            AFFECTED_DOM_OBJECT:       "89",
            AFFECTED_JQUERY_SELECTOR:  "90",
            ITEM_TYPE:             "93",
            REGION_TYPE:           "94",
            PAGE_PROCESS_TYPE:     "95",
            ITEM_NAME:             "96",
            DISPLAY_SEQUENCE:      "97",
            REGION:                "98",
            ITEM_LABEL:            "99",
            LABEL_ALIGNMENT:       "100",
            FIELD_TEMPLATE:        "101",
            VALUE_REQUIRED:        "103",
            GRID_NEW_GRID:         "104",
            GRID_NEW_ROW:          "105",
            GRID_COLUMN:           "106",
            GRID_NEW_COLUMN:       "107",
            GRID_COLUMN_SPAN:      "108",
            GRID_ROW_SPAN:         "109",
            GRID_COLUMN_ATTRIBUTES:"110",
            FORMAT_MASK:           "111",
            LOV_SQL:               "122",
            ELEMENT_FIELD_ALIGNMENT:   "123",
            ELEMENT_MAX_CHARACTERS:    "125",
            ELEMENT_HEIGHT:            "126",
            SOURCE_USED:               "133",
            SOURCE_TYPE:               "134",
            SOURCE_DB_COLUMN:          "141",
            READ_ONLY_HTML_ATTRIBUTES: "171",
            BUTTON_NAME:               "176",
            BUTTON_LABEL:              "177",
            BUTTON_POSITION:           "178",
            ALIGNMENT:                 "179",
            BUTTON_TEMPLATE:           "182",
            BUTTON_IS_HOT:             "183",
            BUTTON_TARGET:             "187",
            PARENT_REGION:             "190",
            REGION_POSITION:           "191",
            PROCESS_POINT:             "192",
            REGION_SQL:                "193",
            REGION_PLUGIN_PLAIN:       "194",
            REGION_TEMPLATE:           "217",
            ITEM_DISPLAY_POSITION:     "218",
            REGION_DISPLAY_SELECTOR:   "219",
            REGION_FUNCTION_RETURNING_SQL: "225",
            BRANCH_TYPE:            "226",
            BRANCH_POINT:           "227",
            TARGET:                 "228",
            BRANCH_PAGE_NUMBER:     "229",
            BRANCH_ITEM:            "230",
            WHEN_BUTTON_PRESSED:    "234",
            ALWAYS_EXECUTE:         "245",
            ASSOCIATED_ITEM:        "247",
            ASSOCIATED_COLUMN:      "248",
            EXECUTE_CONDITION:      "250",
            VALIDATION_REGION:      "251",
            BUTTON_ACTION:          "252",
            USER_INTERFACE:         "253",
            DIALOG_TEMPLATE:        "254",
            OVERWRITE_NAVIGATION_LIST: "255",
            NAVIGATION_LIST:           "256",
            NAVIGATION_LIST_TEMPLATE:  "257",
            COLUMN_NAME:            "267",
            COLUMN_TYPE:            "268",
            IR_COLUMN_DISPLAY_TYPE: "271",
            COLUMN_HEADING:         "272",
            HEADING_ALIGNMENT:      "275",
            COLUMN_ALIGNMENT:       "276",
            ALLOW_USERS_TO_HIDE:           "277",
            ALLOW_USERS_TO_SORT:           "278",
            ALLOW_USERS_TO_FILTER:         "279",
            ALLOW_USERS_TO_HIGHLIGHT:      "280",
            ALLOW_USERS_TO_CONTROL_BREAK:  "281",
            ALLOW_USERS_TO_AGGREGATE:      "282",
            ALLOW_USERS_TO_COMPUTE:        "283",
            ALLOW_USERS_TO_CHART:          "284",
            ALLOW_USERS_TO_GROUP_BY:       "285",
            IR_COLUMN_FILTER_TYPE:         "286",
            HTML_EXPRESSION:               "289",
            LINK_TEXT:                     "290",
            WHEN_NO_DATA_FOUND_MESSAGE:    "297",
            DOWNLOAD_FORMATS:              "308",
            LINK_ICON:                     "319",
            SHOW_DOWNLOAD:                 "352",
            PROCESS_REGION:                "370",
            DA_EVENT:                      "371",
            TZ_DEPENDENT:                  "375",
            CHART_TITLE:                   "380",
            ALLOW_USERS_TO_PIVOT:          "383",
            HAS_GENERIC_COLUMNS:           "390",
            GENERIC_COLUMN_COUNT:          "391",
            CLASSIC_REPORT_COLUMN_TYPE:    "398",
            COLUMN_SORT_SEQUENCE:          "406",
            DISABLE_SORT_COLUMN:           "408",
            HEADINGS_TYPE:                 "427",
            HEADING_TYPE_PLSQL_FUNCTION_BODY: "428",
            NUMBER_OF_ROWS_TYPE:           "433",
            NUMBER_OF_ROWS:                "434",
            NUMBER_OF_ROWS_ITEM:           "435",
            TAB_FORM_COLUMN_TYPE:          "452",
            BRANCH_ACCEPT_REQUEST:         "465",
            QUERY_COLUMN_ID:               "466",
            DERIVED_COLUMN:                "467",
            MAP_SERIES_SOURCE_TYPE:        "469",
            MAP_SOURCE_QUERY:              "470",
            MAP_SOURCE_FUNC_RETURNING_SQL: "471",
            CHART_TYPE:                    "473",
            SERIES_CHART_TYPE:             "474",
            PROJECT_GANTT_SERIES_SOURCE_TYPE:           "475",
            PROJECT_GANTT_SOURCE_QUERY:                 "476",
            PROJECT_GANTT_SOURCE_FUNC_RETURNING_SQL:    "477",
            RESOURCE_GANTT_SERIES_SOURCE_TYPE:          "478",
            RESOURCE_GANTT_SOURCE_QUERY:                "479",
            RESOURCE_GANTT_SOURCE_FUNC_RETURNING_SQL:   "480",
            PIE_DOUGHNUT_SERIES_SOURCE_TYPE:            "481",
            PIE_DOUGHNUT_SOURCE_QUERY:                  "482",
            PIE_DOUGHNUT_SOURCE_FUNC_RETURNING_SQL:     "483",
            DIAL_SERIES_SOURCE_TYPE:                    "484",
            DIAL_SOURCE_QUERY:                          "485",
            DIAL_SOURCE_FUNC_RETURNING_SQL:             "486",
            SCATTER_SERIES_SOURCE_TYPE:                 "487",
            SCATTER_SOURCE_QUERY:                       "488",
            SCATTER_SOURCE_FUNC_RETURNING_SQL:          "489",
            RANGE_SERIES_SOURCE_TYPE:                   "490",
            RANGE_SOURCE_QUERY:                         "491",
            RANGE_SOURCE_FUNC_RETURNING_SQL:            "492",
            CANDLESTICK_SERIES_SOURCE_TYPE:             "493",
            CANDLESTICK_SOURCE_QUERY:                   "494",
            CANDLESTICK_SOURCE_FUNC_RETURNING_SQL:      "495",
            LINE_COL_BAR_STK_SERIES_SOURCE_TYPE:        "496",
            LINE_COL_BAR_STK_SOURCE_QUERY:              "497",
            LINE_COL_BAR_STK_SOURCE_FUNC_RETURNING_SQL: "498",
            SERIES_TYPE:                    "499",
            USE_CUSTOM_XML:                 "534",
            CUSTOM_XML:                     "535",
            PRINT_PAGE_SIZE:                "700",
            PRINT_ORIENTATION:              "701",
            PRINT_UNITS:                    "702",
            PRINT_WIDTH:                    "703",
            PRINT_HEIGHT:                   "704",
            ENABLE_PRINTING:                "729",
            PLUGIN_ATTR_REGION_TYPE:        "737",
            HIDDEN_REGION_TYPE:             "737",
            IS_VISIBLE:                     "738",
            COMPUTATION_SQL_COLON:          "744",
            PARAMETER_ID:                   "753",
            PAGE_NAVIGATION_TYPE:           "754",
            AFFECTED_JAVASCRIPT_EXPRESSION: "755",
            WHEN_JAVASCRIPT_EXPRESSION:     "756",
            NAVIGATION_LIST_POSITION:       "757",
            GRID_LABEL_COLUMN_SPAN:         "760",
            GRID_COLUMN_CSS_CLASSES:        "763",
            //
            VALIDATION_TYPE:                  "4960",
            VAL_SQL_STATEMENT:                "4961",
            VAL_SQL_EXPRESSION:               "4962",
            VAL_PLSQL_EXPRESSION:             "4963",
            VAL_PLSQL_FUNCTION_BODY_BOOLEAN:  "4964",
            VAL_PLSQL_FUNCTION_BODY_VARCHAR2: "4965",
            VAL_PLSQL:                        "4966",
            VAL_ITEM:                         "4967",
            VAL_VALUE:                        "4968",
            VAL_REGULAR_EXPRESSION:           "4969",
            //
            REGION_VALIDATION_TYPE:                  "4980",
            REGION_VAL_SQL_STATEMENT:                "4981",
            REGION_VAL_SQL_EXPRESSION:               "4982",
            REGION_VAL_PLSQL_EXPRESSION:             "4983",
            REGION_VAL_PLSQL_FUNCTION_BODY_BOOLEAN:  "4984",
            REGION_VAL_PLSQL_FUNCTION_BODY_VARCHAR2: "4985",
            REGION_VAL_PLSQL:                        "4986",
            REGION_VAL_COLUMN:                       "4987",
            REGION_VAL_VALUE:                        "4988",
            REGION_VAL_REGULAR_EXPRESSION:           "4989",
            //
            CONDITION_TYPE:                "5100",
            CONDITION_SQL_STATEMENT:       "5101",
            CONDITION_SQL_EXPRESSION:      "5102",
            CONDITION_PLSQL_EXPRESSION:    "5103",
            CONDITION_PLSQL_FUNCTION_BODY: "5104",
            CONDITION_VALUE1:              "5105",
            CONDITION_ITEM1:               "5106",
            CONDITION_LIST:                "5107",
            CONDITION_PREFERENCE:          "5108",
            CONDITION_PAGE:                "5109",
            CONDITION_PAGES:               "5110",
            CONDITION_TEXT:                "5111",
            CONDITION_VALUE2:              "5112",
            CONDITION_ITEM2:               "5113",
            CONDITION_TEXT2:               "5114",

            // Plug-in Attributes
            FORM_FETCH_TABLE_NAME:         "361800327927635543",
            FORM_PROCESS_TABLE_NAME:       "723641536018615468"
    };

    // Observer events
    var EVENT = {
            CREATE:        "create",
            CHANGE:        "change",
            DELETE:        "delete",
            ERRORS:        "errors",
            NO_ERRORS:     "no_errors",
            WARNINGS:      "warnings",
            NO_WARNINGS:   "no_warnings",
            ADD_PROP:      "add_property",
            REMOVE_PROP:   "remove_property",
            META_DATA:     "meta_data",
            GRID:          "grid",
            DISPLAY_TITLE: "display_title"
        };

    var CALLBACK_ACTION = {
            CREATED:  "created",
            CHANGED:  "changed",
            REMOVED:  "removed",
            VALIDATE: "validate"
        };

    // Used for the status of a component in our gComponents array
    var STATUS = {
            CREATED:   "c",
            UPDATED:   "u",
            DELETED:   "d",
            UNCHANGED: ""
        };

    var UI_TYPE = {
            DESKTOP:        "DESKTOP",
            JQM_SMARTPHONE: "JQM_SMARTPHONE"
        };

    var PROP_TYPE = {
            COMPONENT:          "COMPONENT",
            COMBOBOX:           "COMBOBOX",
            COLOR:              "COLOR",
            CHECKBOXES:         "CHECKBOXES",
            CSS:                "CSS",
            JAVASCRIPT:         "JAVASCRIPT",
            HTML:               "HTML",
            ICON:               "ICON",
            INTEGER:            "INTEGER",
            LINK:               "LINK",
            NUMBER:             "NUMBER",
            ITEM:               "ITEM",
            PAGE:               "PAGE",
            PLSQL:              "PLSQL",
            PLSQL_EXPR_VARCHAR: "PLSQL EXPRESSION VARCHAR2",
            PLSQL_EXPR_BOOLEAN: "PLSQL EXPRESSION BOOLEAN",
            PLSQL_FUNC_VARCHAR: "PLSQL FUNCTION BODY VARCHAR2",
            PLSQL_FUNC_BOOLEAN: "PLSQL FUNCTION BODY BOOLEAN",
            SELECT_LIST:        "SELECT LIST",
            SQL:                "SQL",
            SQL_EXPR:           "SQL EXPRESSION",
            SUBSCRIPTION:       "SUBSCRIPTION",
            TEXT:               "TEXT",
            TEXTAREA:           "TEXTAREA",
            TEXT_EDITOR:        "TEXT EDITOR",
            SUPPORTED_UI:       "SUPPORTED UI",
            YES_NO:             "YES NO",
            OWNER:              "OWNER",
            TABLE:              "TABLE",
            COLUMN:             "COLUMN",
            TEMPLATE_OPTIONS:   "TEMPLATE OPTIONS"
        };

    var MESSAGE_ACTION = {
            CHANGE:     "CHANGE_ATTRIBUTE",
            CREATE:     "CREATE",
            DELETE:     "DELETE",
            DUPLICATE:  "DUPLICATE",
            MOVE:       "MOVE"
        };

    var RELEASE_NOTES_DEPRECATED_FEATURES = "1.1";

    var gDisplayGroups,
        gProperties,
        gTypes,
        gPluginCategories,
        gEvents,
        gFormatMasks,
        gSharedComponents,
        gComponents = {},
        gBaseComponents = {},
        gObservers = [];

    var gOptions = {
            isInternal: false,
            isReadOnly: false
        },
        gCurrentAppId,
        gCurrentPageId,
        gCurrentUserInterface;

    var  gIsPageReadOnly = true;


    function format( pKey ) {
        var pattern = lang.getMessage( "MODEL." + pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    }

    function formatNoEscape( pKey ) {
        var pattern = lang.getMessage( "MODEL." + pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.formatNoEscape.apply( this, args );
    }

    function formatPostfix( pKey, pValue, pResult ) {
        if ( pResult ) {
            return formatNoEscape( pKey, pValue );
        } else {
            return pValue;
        }
    }

    function forEachAttribute( pObject, pFunction ) {
        for ( var lKey in pObject ) {
            if ( pObject.hasOwnProperty( lKey )) {
                pFunction( lKey, pObject[ lKey ]);
            }
        }
    }

    function simpleExtend( pObject, pExtendWith ) {
        for ( var i in pExtendWith ) {
            if ( pExtendWith.hasOwnProperty( i ) && !pObject.hasOwnProperty( i )) {
                pObject[ i ] = pExtendWith[ i ];
            }
        }
        for ( var i in pObject ) {
            if ( pObject.hasOwnProperty( i ) && pObject[ i ] === undefined ) {
                delete pObject[ i ];
            }
        }
    }

    function padId( pId ) {
        var lId = pId;
        while ( lId.length < 36 ) {
            lId = "0" + lId;
        }
        return lId;
    }

    function enquoteIdentifier( pName ){
        // Only enquote the name if it's case sensitive or contains special characters
        if ( /^[ABCDEFGHIJKLMNOPQRSTUVWXYZ]+[ABCDEFGHIJKLMNOPQRSTUVWXYZ0-9_$]*$/.test( pName )) {
            return pName;
        } else {
            return '"' + pName + '"';
        }
    }

    /**
     * Method to merge plug-in meta data into the global properties and component type properties meta data.
     */
    function mergePlugins ( pPlugins, pTitlePostfix ) {

        function merge( pPlugins, pTitlePostfix, pTypeId ) {

            var lType       = gTypes[ pTypeId ],
                lPluginType = lType.pluginType,
                lFeature,
                lPropertyId,
                lAttribute;

            // initialize types if it hasn't been done so far
            lPluginType.plugins = lPluginType.plugins || {};

            if ( pPlugins === undefined ) {
                return;
            }

            for ( var i = 0; i < pPlugins.length; i++ ) {

                // Add the plug-in to the list of available types for that component type. It will be used for
                // SUPPORTED UI property type
                lPluginType.plugins[ pPlugins[ i ].name ] = {
                    name:          pPlugins[ i ].name,
                    title:         lang.formatNoEscape( pTitlePostfix, pPlugins[ i ].title ),
                    category:      pPlugins[ i ].category,
                    uiTypes:       pPlugins[ i ].uiTypes,
                    attributes:    pPlugins[ i ].attributes,
                    stdAttributes: pPlugins[ i ].stdAttributes,
                    sqlMinColumns: pPlugins[ i ].sqlMinColumns,
                    sqlMaxColumns: pPlugins[ i ].sqlMaxColumns,
                    sqlExamples:   pPlugins[ i ].sqlExamples,
                    aboutUrl:      pPlugins[ i ].aboutUrl,
                    helpText:      pPlugins[ i ].helpText || format( "HELP.NO_TEXT" ),
                    isQuickPick:   ( pPlugins[ i ].isQuickPick === true ),
                    isLegacy:      ( pPlugins[ i ].isLegacy === true ),
                    isRequired:    (  $.inArray( "SOURCE_REQUIRED", pPlugins[ i ].stdAttributes ) !== -1 // regions
                                   || $.inArray( "LOV_REQUIRED",    pPlugins[ i ].stdAttributes ) !== -1 // items
                                   || $.inArray( "REQUIRED",        pPlugins[ i ].stdAttributes ) !== -1 // da actions
                                   || $.inArray( "REGION_REQUIRED", pPlugins[ i ].stdAttributes ) !== -1 // process
                                   )
                };

                // Add dependencies for all standard attributes
                if ( pPlugins[ i ].hasOwnProperty( "stdAttributes" )) {

                    for ( var j = 0; j < pPlugins[ i ].stdAttributes.length; j++ ) {
                        lFeature = pPlugins[ i ].stdAttributes[ j ];

                        if ( lPluginType.stdAttributes.hasOwnProperty( lFeature )) { // $$$ todo remove that if
                            for ( var k = 0; k < lPluginType.stdAttributes[ lFeature ].length; k++ ) {
                                lPropertyId = lPluginType.stdAttributes[ lFeature ][ k ];
                                lType.properties[ lPropertyId ].dependingOn[ 0 ].values.push( pPlugins[ i ].name );
                            }
                        }
                    }

                    // Special case for item type plug-ins. If the item type doesn't have a special format mask (date or number)
                    // we will show the standard format mask instead.
                    if (  pTypeId === COMP_TYPE.PAGE_ITEM
                       && $.inArray( "FORMAT_MASK_DATE",   pPlugins[ i ].stdAttributes ) === -1
                       && $.inArray( "FORMAT_MASK_NUMBER", pPlugins[ i ].stdAttributes ) === -1 ) {
                       lType.properties[ PROP.FORMAT_MASK ].dependingOn[ 0 ].values.push( pPlugins[ i ].name );
                    }
                }

                // Region type plug-ins are used by component types REGION, REGION PLUGIN ATTRIBUTES and REGION COLUMN, but
                // attributes should only show up in the dedicated REGION PLUGIN ATTRIBUTES and REGION COLUMN component types
                if ( pTypeId !== COMP_TYPE.REGION ) {

                    for ( var j = 0; j < pPlugins[ i ].attributes.length; j++ ) {

                        simpleExtend( pPlugins[ i ].attributes[ j ], {
                            scope:        "COMPONENT",
                            defaultValue: "",
                            helpText:     ""
                        });
                        lAttribute = pPlugins[ i ].attributes[ j ];

                        if (  ( pTypeId !== COMP_TYPE.REGION_COLUMN && lAttribute.scope === "COMPONENT" )
                           || ( pTypeId === COMP_TYPE.REGION_COLUMN && lAttribute.scope === "COLUMN" ))
                        {
                            gProperties[ lAttribute.id ] = {
                                id:                  lAttribute.id,
                                name:                pTypeId + "_" + pPlugins[ i ].name + "_" + lAttribute.mappingNo,
                                prompt:              lAttribute.prompt,
                                type:                lAttribute.type,
                                multiValueDelimiter: lAttribute.multiValueDelimiter,
                                displayLen:          lAttribute.displayLen,
                                maxLen:              lAttribute.maxLen,
                                textCase:            lAttribute.textCase,
                                unit:                lAttribute.unit,
                                hasPlSqlCheck:       false,
                                sqlMinColumns:       lAttribute.sqlMinColumns,
                                sqlMaxColumns:       lAttribute.sqlMaxColumns,
                                dataTypes:           lAttribute.dataTypes || {},
                                displayGroupId:      lAttribute.displayGroupId,
                                lovType:             lAttribute.lovType,
                                lovComponentTypeId:  lAttribute.lovComponentTypeId,
                                lovComponentScope:   lAttribute.lovComponentScope,
                                lovValues:           lAttribute.lovValues,
                                isSearchable:        lAttribute.isSearchable,
                                legacyValues:        lAttribute.legacyValues,
                                examples:            lAttribute.examples,
                                helpText:            lAttribute.helpText,
                                isCustomPluginAttribute: ( /^PLUGIN/.test( pPlugins[ i ].name ) )
                            };

                            if ( lAttribute.hasOwnProperty( "uiTypes" )) {
                                gProperties[ lAttribute.id ].uiTypes = lAttribute.uiTypes;
                            }

                            if ( gProperties[ lAttribute.id ].type === PROP_TYPE.YES_NO ) {
                                gProperties[ lAttribute.id ].yesValue = "Y";
                                gProperties[ lAttribute.id ].noValue  = "N";
                            }

                            lType.properties[ lAttribute.id ] = {
                                propertyId:           lAttribute.id,
                                displaySeq:           lPluginType.attributesSeqOffset + lAttribute.displaySeq,
                                isRequired:           lAttribute.isRequired,
                                isReadOnly:           false,
                                isCommon:             lAttribute.isCommon,
                                nullText:             lAttribute.nullText,
                                referenceOnDelete:    lAttribute.referenceOnDelete,
                                referenceScope:       lAttribute.referenceScope,
                                supportsSubstitution: lAttribute.supportsSubstitution,
                                defaultValue:         lAttribute.defaultValue,
                                dependingOn:  [{
                                    id:         lPluginType.typePropertyId,
                                    type:       "EQUALS",
                                    expression: pPlugins[ i ].name }
                                ]
                            };

                            if ( lAttribute.parentAttribute ) {
                                lType.properties[ lAttribute.id ].parentProperty = lAttribute.parentAttribute;
                            }

                            // If the plug-in has additional dependencies, add them to our array
                            if ( lAttribute.dependingOn ) {
                                lType.properties[ lAttribute.id ].dependingOn.push( lAttribute.dependingOn );
                            }
                        }
                    }

                    // Region type plug-in events are already added by REGION PLUGIN ATTRIBUTES
                    if ( pTypeId !== COMP_TYPE.REGION_COLUMN ) {
                        for ( var j = 0; j < pPlugins[ i ].events.length; j++ ) {
                            gEvents.component.push({
                                r:       pPlugins[ i ].events[ j ].r,
                                d:       pPlugins[ i ].events[ j ].d + " [" + pPlugins[ i ].title + "]",
                                uiTypes: pPlugins[ i ].uiTypes
                            });
                        }
                    }
                }
            }
        } // merge

        for ( var lTypeId in pPlugins ) {
            if ( pPlugins.hasOwnProperty( lTypeId )) {
                merge( pPlugins[ lTypeId ], pTitlePostfix, lTypeId );
                // Region type plug-ins are used for component types REGION, REGION PLUGIN ATTRIBUTES and REGION COLUMN,
                // but we only transmit them once
                if ( lTypeId === COMP_TYPE.REGION ) {
                    merge( pPlugins[ lTypeId ], pTitlePostfix, COMP_TYPE.REGION_PLUGIN_ATTR );
                    merge( pPlugins[ lTypeId ], pTitlePostfix, COMP_TYPE.REGION_COLUMN );
                }
            }
        }

    } // mergePlugins


    /*
     * todo documentation
     */
    function initializeArrays() {

        function generateDisplayPointsMap ( pTemplates ) {

            forEachAttribute( pTemplates, function( lId, pTemplate ) {

                pTemplate.displayPointsMap = {};
                for ( var i = 0; i < pTemplate.displayPoints.length; i++ ) {
                    pTemplate.displayPointsMap[ pTemplate.displayPoints[ i ].id ] = pTemplate.displayPoints[ i ];
                }

            });

        }; // generateDisplayPointsMap

        // Initialize attributes which might not be initialized because they are missing in the communication
        for ( var i in gTypes ) {
            if ( gTypes.hasOwnProperty( i )) {

                gTypes[ i ].id = i;
                simpleExtend( gTypes[ i ], {
                    parentId:            null,
                    isOneToOneRelation:  false,
                    isPageComponent:     false,
                    isSharedComponent:   false,
                    refByProperties:     [],
                    childComponentTypes: []
                });
                gComponents[ i ] = {};

                for ( var j in gTypes[ i ].properties ) {
                    if ( gTypes[ i ].properties.hasOwnProperty( j )) {

                        gTypes[ i ].properties[ j ].propertyId = j;
                        simpleExtend( gTypes[ i ].properties[ j ], {
                            defaultValue:     "",
                            helpText:         "",
                            dependingOn:      [],
                            refByChilds:      [],
                            refByDependingOn: []
                        });
                    }
                }
            }
        }

        for ( var i in gProperties ) {
            if ( gProperties.hasOwnProperty( i )) {

                gProperties[ i ].id = i;
                simpleExtend( gProperties[ i ], {
                    helpText:            "",
                    hasPlSqlCheck:       false,
                    isQueryOnly:         false,
                    isInternal:          false,
                    isSearchable:        true,
                    dataTypes:           {},
                    refByComponentTypes: []
                });

                // keep in sync with IF in wwv_flow_property_dev.emit_static_data and emit_plugins
                if ( !gProperties[ i ].hasOwnProperty( "uiTypes" )) {
                    gProperties[ i ].uiTypes = [ UI_TYPE.DESKTOP, UI_TYPE.JQM_SMARTPHONE ];
                }

                // Create a lookup map for our static LOVs
                if ( gProperties[ i ].hasOwnProperty( "lovValues" )) {
                    gProperties[ i ].lovValuesMap = {};
                    for ( var j = 0; j < gProperties[ i ].lovValues.length; j++ ) {
                        gProperties[ i ].lovValuesMap[ gProperties[ i ].lovValues[ j ].r ] = j;
                    }
                }

            }
        }

        // Generate a lookup map for our events
        forEachAttribute( gEvents, function( pAttr, pEvent ) {

            if ( pAttr !== "lookupMap" ) {
                for ( var i = 0; i < pEvent.length; i++ ) {
                    gEvents.lookupMap[ pEvent[ i ].r ] = pEvent[ i ];
                }
            }

        });

        // Generate a lookup map for our template display points
        forEachAttribute( gSharedComponents.themes, function( pThemeId, pTheme ) {

            generateDisplayPointsMap ( pTheme.templates[ COMP_TYPE.PAGE_TEMPLATE ]);
            generateDisplayPointsMap ( pTheme.templates[ COMP_TYPE.REGION_TEMPLATE ]);

        });

    } // initializeArrays


    /**
     * Method which adds gross references between component types and properties to make it easier and faster to navigate
     * between those to arrays.
     */
    function generateCrossReferences() {

        var lTypePropertyDef;

        // Store the dependency that a component type is used as LOV for a property in the component type as
        // well so that when we create/update/delete a component we immediately know which properties we have to check
        for ( var i in gProperties ) {
            if ( gProperties.hasOwnProperty( i )) {
                if ( gProperties[ i ].lovType === "COMPONENT" ) {
                    gTypes[ gProperties[ i ].lovComponentTypeId ].refByProperties.push( i );
                } else if ( gProperties[ i ].type === "ITEM" ) {
                    gTypes[ COMP_TYPE.PAGE_ITEM ].refByProperties.push( i );
                }
            }
        }

        for ( var lId in gTypes ) {
            if ( gTypes.hasOwnProperty( lId )) {

                // Store which child component types the current component has
                if ( gTypes[ lId ].parentId !== null ) {
                    gTypes[ gTypes[ lId ].parentId ].childComponentTypes.push( lId );
                }

                // Store the dependency that a property is used by
                //
                // 1) a component type
                // 2) has child properties
                // 3) is depending on
                //
                // in the property as well, this will allow a faster lookup if we have to scan all component types which use a specific property.
                for ( var lPropertyId in gTypes[ lId ].properties ) {
                    if ( gTypes[ lId ].properties.hasOwnProperty( lPropertyId )) {
                        lTypePropertyDef = gTypes[ lId ].properties[ lPropertyId ];

                        // Property is used by a component type
                        gProperties[ lPropertyId ].refByComponentTypes.push( lId );

                        // Property is a child of a parent property
                        if ( lTypePropertyDef.parentProperty && lTypePropertyDef.parentProperty.id ) {
                            gTypes[ lTypePropertyDef.parentProperty.typeId ].properties[ lTypePropertyDef.parentProperty.id ].refByChilds.push({
                                typeId: lId,
                                id:     lPropertyId
                            });
                        }

                        // Property is depending on another property
                        for ( var i = 0; i < lTypePropertyDef.dependingOn.length; i++ ) {
                            gTypes[ lId ].properties[ lTypePropertyDef.dependingOn[ i ].id ].refByDependingOn.push( lPropertyId );
                        }
                    }
                }
            }
        }

    } // generateCrossReferences


    /*
     * todo
     */
    function getNewComponentId() {

        var LOCAL_STORAGE_ID = "ORA_WWV_apex.builder.pageDesigner.model.componentIds";

        var lIds,
            lNewComponentId;

        // We use local storage as a pool of new component ids. Using local storage has the advantage that we will not
        // waste those ids, event if we navigate away from the current page.
        lIds = localStorage[ LOCAL_STORAGE_ID ];
        if ( lIds === undefined ) {
            lIds = [];
        } else {
            lIds = lIds.split( "," );
        }

        // Do we need to fetch new ids?
        if ( lIds.length === 0 ) {
            server.process (
                "getNewComponentId", {
                    x01: 50
                }, {
                    success: function( pData ) {
                        lIds = pData;
                    },
                    async: false // this is by intention, because we need the result within the current transaction
                });
        }

        // Get the next id and write the remaining ids back into our store
        lNewComponentId = lIds[ 0 ];
        lIds = lIds.slice( 1 );
        if ( lIds.length === 0 ) {
            delete localStorage[ LOCAL_STORAGE_ID ];
        } else {
            localStorage[ LOCAL_STORAGE_ID ] = lIds.join( "," );
        }

        return lNewComponentId;

    } // getNewComponentId


    /*
     * todo
     */
    function getTheme() {

        return gSharedComponents.themes[ gCurrentUserInterface.themeId ];

    } // getTheme


    /**
     * Function returns the page template of the current page.
     *
     * @return {Object}
     *
     * @function getPageTemplate
     * @memberOf pe
     **/
    function getPageTemplate() {

        var lPage = gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ],
            lTheme,
            lTemplateId;

        // Get the used page/dialog template of the current page. If no template is defined on page level,
        // we have to get theme default
        lTheme = getTheme();

        if ( isGlobalPage() ) {
            lTemplateId = lTheme.defaultTemplates.page;
        } else {
            if ( lPage.getProperty( PROP.PAGE_MODE ).getValue() === "NORMAL" ) {
                lTemplateId = ( lPage.getProperty( PROP.PAGE_TEMPLATE ).getValue() || lTheme.defaultTemplates.page );
            } else {
                lTemplateId = ( lPage.getProperty( PROP.DIALOG_TEMPLATE ).getValue() || lTheme.defaultTemplates.dialog );
            }
        }

        return lTheme.templates[ COMP_TYPE.PAGE_TEMPLATE ][ lTemplateId ];

    } // getPageTemplate


    /**
     * Function returns the region template of the passed in region.
     *
     * @return {Object}
     *
     * @function getRegionTemplate
     **/
    function getRegionTemplate( pRegionId ) {

        var lTemplateId = gComponents[ COMP_TYPE.REGION ][ pRegionId ].getProperty( PROP.REGION_TEMPLATE ).getValue(),
            lTemplates  = getTheme().templates[ COMP_TYPE.REGION_TEMPLATE ];

        if ( lTemplates.hasOwnProperty( lTemplateId )) {
            return lTemplates[ lTemplateId ];
        } else {
            // Return the "No Template" template if the template id doesn't exist
            return lTemplates[ "" ];
        }

    } // getRegionTemplate


    /**
     * Function returns the field template of the passed in field template id.
     *
     * @return {Object}
     *
     * @function getFieldTemplate
     **/
    function getFieldTemplate( pId ) {

        var lTemplates = getTheme().templates[ COMP_TYPE.FIELD_TEMPLATE ];

        if ( lTemplates.hasOwnProperty( pId )) {
            return lTemplates[ pId ];
        } else {
            // Return the "No Template" template if the template id doesn't exist
            return lTemplates[ "" ];
        }

    } // getFieldTemplate


    /**
     * Function returns the template options for the current property.
     *
     * @return {Object}
     *
     * @function getTemplateOptions
     **/
    function getTemplateOptions( pProperty ) {

        var TYPE_ID       = pProperty.component.typeId,
            THEME_OPTIONS = getTheme().options || [];

        var lTemplateProperty,
            lTemplate,
            lTemplateType,
            lOptions = [],
            lOptionsMap = {};

        if ( TYPE_ID === COMP_TYPE.PAGE ) {
            lTemplateType = "PAGE";
            lTemplate     = getPageTemplate();
        } else {
            lTemplateProperty = pProperty.component.getProperty( gTypes[ pProperty.component.typeId ].properties[ pProperty.id ].parentProperty.id );

            if ( lTemplateProperty && lTemplateProperty.getValue() !== "" ) {
                lTemplate = getTheme().templates[ gProperties[ lTemplateProperty.id ].lovComponentTypeId ][ lTemplateProperty.getValue() ];

                switch ( gProperties[ lTemplateProperty.id ].lovComponentTypeId ) {
                    case COMP_TYPE.REGION_TEMPLATE:     lTemplateType = "REGION"; break;
                    case COMP_TYPE.REPORT_TEMPLATE:     lTemplateType = "REPORT"; break;
                    case COMP_TYPE.BREADCRUMB_TEMPLATE: lTemplateType = "BREADCRUMB"; break;
                    case COMP_TYPE.LIST_TEMPLATE:       lTemplateType = "LIST"; break;
                    case COMP_TYPE.FIELD_TEMPLATE:      lTemplateType = "FIELD"; break;
                    case COMP_TYPE.BUTTON_TEMPLATE:     lTemplateType = "BUTTON"; break;
                }
            }

        }

        // Return no template options if the component references a non existing template
        if ( lTemplate === undefined ) {

            return {
                values:        [],
                valuesMap:     {},
                defaultValues: [],
                presetValues:  [],
                groups:        {}
            };

        } else {

            // Add template specific options
            if ( lTemplate && lTemplate.hasOwnProperty( "options" )) {

                lOptions = lOptions.concat( lTemplate.options );
            }

            // Add global template options
            for ( var i = 0; i < THEME_OPTIONS.length; i++ ) {
                if ( $.inArray( lTemplateType, THEME_OPTIONS[ i ].types ) !== -1 ) {
                    lOptions.push( THEME_OPTIONS[ i ] );
                }
            }

            // Add the "Default" entry at the beginning of the array
            lOptions.unshift({
                r: "#DEFAULT#",
                d: format( "LOV.TEMPLATE_OPTIONS.DEFAULT" ),
                description: format( "LOV.TEMPLATE_OPTIONS.DEFAULT.DESC" )
            });

            // create a lookup map
            for ( var i = 0; i < lOptions.length; i++ ) {
                lOptionsMap[ lOptions[ i ].r ] = lOptions[ i ];
            }

            return {
                values:        lOptions,
                valuesMap:     lOptionsMap,
                defaultValues: lTemplate.defaultOptions || [],
                presetValues:  lTemplate.presetOptions  || [],
                groups:        getTheme().optionGroups  || []
            };
        }

    } // getTemplateOptions


    function isMatchingDataType( pColumnType, pValidTypes ) {

        // Because we automatically add ROWID, we will only support that column if the valid data types really require that type
        if ( pColumnType === "ROWID" && $.inArray( pColumnType, pValidTypes ) === -1 ) {
            return false;
        }

        // Are all data types allowed?
        return (  pValidTypes.length === 0
               // Data type not available
               || pColumnType === undefined
               // if VARCHAR2 is allowed, the column can be of any data type except BLOB or BFILE
               || (  $.inArray( "VARCHAR2", pValidTypes ) >= 0
                  && $.inArray( pColumnType, [ "BLOB", "BFILE" ]) === -1
                  )
               // If DATE is allowed, the column can be a DATE or any TIMESTAMP data type
               || (  $.inArray( "DATE", pValidTypes ) >= 0
                  && $.inArray( pColumnType, [ "DATE", "TIMESTAMP", "TIMESTAMP_TZ", "TIMESTAMP_LTZ" ]) >= 0
                  )
               // Is the column of the allowed data types?
               || $.inArray( pColumnType, pValidTypes ) >= 0 );
    } // isMatchingDataType


    function isUiSupported( pUiType, pSupportedUiTypes ) {
        return ( $.inArray( pUiType, pSupportedUiTypes ) !== -1 );
    } // isUiSupported


    function isGlobalPage() {

        return ( gCurrentPageId === gCurrentUserInterface.globalPageId );

    } // isGlobalPage


    function replaceDefaultPlaceholders( pProperty, pDefaultValue ) {

        var lValue = pDefaultValue;

        function replacePlaceholder( pPlaceholder, pFunction ) {

            if ( lValue.indexOf( pPlaceholder ) !== -1 ) {
                lValue = lValue.replace( pPlaceholder, pFunction() );
            }
        }

        // Replace placeholder values
        if ( lValue.indexOf( "#" ) !== -1 ) {
            // Wrapping the value into a function will make sure that it's only evaluated if the placeholder exists
            replacePlaceholder( "#PAGE_ID#",                     function(){ return gCurrentPageId; });
            replacePlaceholder( "#PLEASE_CHANGE#",               function(){ return format( "PLACEHOLDER.PLEASE_CHANGE" ); });
            replacePlaceholder( "#PRINT_LINK_TEXT#",             function(){ return format( "PLACEHOLDER.PRINT_LINK_TEXT" ); });
            replacePlaceholder( "#DEFAULT_REGION_TEMPLATE#",     function(){ return getTheme().defaultTemplates.region; });
            replacePlaceholder( "#DEFAULT_FIELD_TEMPLATE#",      function(){ return getTheme().defaultTemplates.field; });
            replacePlaceholder( "#DEFAULT_BUTTON_TEMPLATE#",     function(){ return getTheme().defaultTemplates.button; });
            replacePlaceholder( "#DEFAULT_REPORT_TEMPLATE#",     function(){ return getTheme().defaultTemplates.report; });
            replacePlaceholder( "#DEFAULT_LIST_TEMPLATE#",       function(){ return getTheme().defaultTemplates.list; });
            replacePlaceholder( "#DEFAULT_NAV_LIST_TEMPLATE#",   function(){ return gCurrentUserInterface.navList.templateId || ""; });
            replacePlaceholder( "#DEFAULT_BREADCRUMB_TEMPLATE#", function(){ return getTheme().defaultTemplates.breadcrumb; });
            replacePlaceholder( "#DEFAULT_CALENDAR_TEMPLATE#",   function(){ return getTheme().defaultTemplates.calendar; });
            replacePlaceholder( "#DEFAULT_NAV_LIST_POSITION#",   function(){ return gCurrentUserInterface.navList.position || ""; });
            replacePlaceholder( "#PRESET_TEMPLATE_OPTIONS#",     function(){
                var lPresetValues = getTemplateOptions( pProperty ).presetValues;
                if ( lPresetValues.length > 0 ) {
                    return ":" + lPresetValues.join( ":" );
                } else {
                    return "";
                }
            });
        }

        return lValue;

    } // replaceDefaultPlaceholders


    function convertComponentsToLovValues( pComponents, pDisplayPropertyId, pReturnPropertyId ) {

        var lDisplayProperty,
            lLovValues = [];

        for ( var i = 0; i < pComponents.length; i++ ) {
            lDisplayProperty = pComponents[ i ].getProperty( pDisplayPropertyId );
            lLovValues.push( {
                name:  pComponents[ i ].getProperty( pReturnPropertyId ).getValue(),
                label: ( lDisplayProperty ) ? lDisplayProperty.getValue() : "" // does not exist for hidden items/columns
            });
        }

        return lLovValues;

    } // convertComponentsToLovValues


    function getSqlColumnLovValues( pComponent, pPropertyIds ) {

        var i, lProperty,
            lLovValues = [];

        // Go through the array of provided properties to find the first the one which is supported for the current component
        for ( i = 0; i < pPropertyIds.length; i++ ) {

            lProperty = pComponent.getProperty( pPropertyIds[ i ]);
            if ( lProperty ) {
                lLovValues = lProperty.getColumns();
                break;
            }

        }

        return lLovValues;

    } // getSqlColumnLovValues


    function getRegionColumns( pRegionId ) {

        var TYPE_MAP = {
            "NATIVE_TABFORM":    COMP_TYPE.TAB_FORM_COLUMN,
            "NATIVE_SQL_REPORT": COMP_TYPE.CLASSIC_RPT_COLUMN,
            "NATIVE_FNC_REPORT": COMP_TYPE.CLASSIC_RPT_COLUMN,
            "NATIVE_IR":         COMP_TYPE.IR_COLUMN
        };

        var lComponents,
            lRegion,
            lType,
            lParentId,
            lLovValues = [];

        lComponents = getComponents( COMP_TYPE.REGION, { id: pRegionId });

        if ( lComponents.length > 0 ) {

            lRegion = lComponents[ 0 ];
            lType   = lRegion._properties[ PROP.REGION_TYPE ]._value;

            if ( TYPE_MAP.hasOwnProperty( lType )) {

                if ( lType === "NATIVE_IR" ) {
                    lParentId = lRegion.getChilds( COMP_TYPE.IR_ATTRIBUTES )[ 0 ].id;
                } else {
                    lParentId = lRegion.id;
                }
                lComponents = getComponents( TYPE_MAP[ lType ], { parentId: lParentId });
                lLovValues  = convertComponentsToLovValues( lComponents, PROP.COLUMN_HEADING, PROP.COLUMN_NAME );

              // Are we dealing with a region type plug-in with 'Region Columns'?
            } else if ( $.inArray( "COLUMNS", gTypes[ COMP_TYPE.REGION ].pluginType.plugins[ lType ].stdAttributes ) !== -1 ) {

                lComponents = getComponents( COMP_TYPE.REGION_COLUMN, { parentId: lRegion.id });
                lLovValues  = convertComponentsToLovValues( lComponents, PROP.COLUMN_HEADING, PROP.COLUMN_NAME );

            } else {

                lLovValues = getSqlColumnLovValues( lRegion, [ PROP.REGION_SQL, PROP.REGION_FUNCTION_RETURNING_SQL ]);

            }
        }

        return lLovValues;


    } // getRegionColumns


    /*
     * todo documentation
     */
    function Property( pOptions ) {

        var lPropertyId      = pOptions.propertyId,
            lPropertyDef     = gProperties[ lPropertyId ],
            lTypePropertyDef = gTypes[ pOptions.component.typeId ].properties[ lPropertyId ],
            lNewProperty     = lPropertyId;

        this.component = pOptions.component;

        if ( lNewProperty instanceof Property ) {

            //
            // Duplicate existing property
            //
            lNewProperty = $.extend( true, {}, lNewProperty );

            for ( var i in lNewProperty ) {
                if ( lNewProperty.hasOwnProperty( i ) && i !== "component" ) {
                    this[ i ] = lNewProperty[ i ];
                }
            }
        } else {

            //
            // New property
            //
            this.id          = lPropertyId;
            this._isRequired = lTypePropertyDef.isRequired;
            this._isReadOnly = lTypePropertyDef.isReadOnly;
            if ( lPropertyDef.type === PROP_TYPE.SQL ) {
                this._sqlMinColumns = lPropertyDef.sqlMinColumns;
                this._sqlMaxColumns = lPropertyDef.sqlMaxColumns;
            }

            // Some of the meta data attributes are depending on the plug-in definition
            this._setDynamicProperties();

            //
            this.hasChanged  = false;
            this.errors      = [];
            this.warnings    = [];
            this._columns    = [];
            this._hasOrderBy = false;

            if ( pOptions.hasOwnProperty( "server" )) {
                if ( $.type( pOptions.server ) === "object" ) {
                    this._value      = pOptions.server.value;
                    this._columns    = pOptions.server.columns || [];
                    this._hasOrderBy = pOptions.server.hasOrderBy;
                } else {
                    this._value = pOptions.server;
                }
            } else {
                this.hasChanged  = true;
                this._value      = replaceDefaultPlaceholders( this, pOptions.defaultValue || lTypePropertyDef.defaultValue );
                this._columns    = pOptions.columns || [];
                this._hasOrderBy = pOptions.hasOrderBy;

                // Set text case
                if ( lPropertyDef.textCase === "UPPER" ) {
                    this._value = this._value.toUpperCase();
                } else if ( lPropertyDef.textCase === "LOWER" ) {
                    this._value = this._value.toLowerCase();
                }

                // Some plug-in types allow to set a default value based on the configuration
                this._setDynamicDefaultValue();

                // Set the property and component to invalid if it's a required property and no value has been specified
                if ( this._isRequired && this._value === "" ) {
                    this.errors.push( format( "VAL.IS_REQUIRED" ));
                }
            }
        }

    } // Property


    /*
     * todo
     */
    Property.prototype._setDynamicProperties = function() {

        var lPluginType = gTypes[ this.component.typeId ].pluginType,
            lPlugin;

        // For some properties the plug-in defines if it should be required or not
        if ( lPluginType && this.component._properties.hasOwnProperty( lPluginType.typePropertyId )) {
            lPlugin = lPluginType.plugins[ this.component._properties[ lPluginType.typePropertyId ]._value ];
            if ( lPlugin ) {
                if ( $.inArray( this.id, lPluginType.requiredProperties ) !== -1 ) {
                    this._isRequired = lPlugin.isRequired;
                }
                if ( this.id === PROP.REGION_SQL || this.id === PROP.LOV_SQL ) {
                    this._sqlMinColumns = lPlugin.sqlMinColumns;
                    this._sqlMaxColumns = lPlugin.sqlMaxColumns;
                    this._sqlExamples   = lPlugin.sqlExamples;
                }
            }
        }
    }; // _setDynamicProperties


    /*
     * todo
     */
    Property.prototype._setDynamicDefaultValue = function() {

        var lPluginType = gTypes[ this.component.typeId ].pluginType,
            lPlugin;

        // For some properties the plug-in defines the value
        if ( lPluginType && this.component._properties.hasOwnProperty( lPluginType.typePropertyId )) {
            lPlugin = lPluginType.plugins[ this.component._properties[ lPluginType.typePropertyId ]._value ];
            if ( lPlugin && this.component.typeId === COMP_TYPE.DA_ACTION ) {
                if ( this.id === PROP.AFFECTED_TYPE ) {

                    // Check that the current affected type it's still a valid value for the current plug-in
                    if ( this._value !== "" && $.inArray( this._value, lPlugin.stdAttributes ) === -1 ) {
                        this._value = "";
                    }

                } else if ( this.id === PROP.FIRE_ON_PAGE_LOAD ) {

                    // Default the property "Fire on Page Load" based on the plug-in configuration
                    if ( $.inArray( "ONLOAD", lPlugin.stdAttributes ) !== -1 ) {
                        this._value = "Y";
                    } else {
                        this._value = "N";
                    }
                }
            }
        }
    }; // _setDynamicDefaultValue


    /*
     * todo
     */
    Property.prototype._isVisible = function() {

        var lPropertyDef = gProperties[ this.id ],
            lComponent   = this.component,
            lTypePropDef = gTypes[ lComponent.typeId ].properties[ this.id ],
            lIsVisible,
            lDependingOn,
            lDependingOnValue,
            lDependingOnValues,
            i;

        // 1) If the property is just there because of legacy issues,
        //    remove it if the current value isn't one of the legacy values where the property should still be displayed.
        // 2) Does it match to the current UI type of the component?
        // 3) Is it an internal attribute only used for workspace 10 apps?
        if (  (  lPropertyDef.hasOwnProperty( "legacyValues" )
              && lPropertyDef.legacyValues[ 0 ] !== "$NOT_NULL$"
              && $.inArray( this._value, lPropertyDef.legacyValues ) === -1
              )
           || $.inArray( lComponent._uiType, lPropertyDef.uiTypes ) === -1
           || ( lPropertyDef.isInternal && !gOptions.isInternal )
           )
        {
            lIsVisible = false;
        } else if (  lPropertyDef.hasOwnProperty( "legacyValues" )
                  && lPropertyDef.legacyValues[ 0 ] === "$NOT_NULL$"
                  && this._value === ""
                  )
        {
            lIsVisible = false;
        } else {

            if ( lTypePropDef.dependingOn.length === 0 ) {

                lIsVisible = true;

            } else {

                for ( i = 0; i < lTypePropDef.dependingOn.length; i ++ ) {

                    lDependingOn = lTypePropDef.dependingOn[ i ];

                    // Does the depending on property exist in our value array? If not, the depending on check can never be true
                    // that's why we can immediately set it to FALSE
                    if ( !lComponent._properties.hasOwnProperty( lDependingOn.id )) {

                        lIsVisible = false;

                    } else {

                        lDependingOnValue = lComponent._properties[ lDependingOn.id ]._value;

                        if ( gProperties[ lDependingOn.id ].type === "CHECKBOXES" ) {
                            // Checkboxes can store multiple values separated by colons, that's why we have to
                            // compare all values against the expression

                            lDependingOnValues = ( lDependingOnValue === "" ? [] : lDependingOnValue.split( ":" ));

                            switch( lDependingOn.type ) {
                                case "EQUALS":      lIsVisible = ( $.inArray( lDependingOn.expression, lDependingOnValues ) !== -1 ); break;
                                case "NOT_EQUALS":  lIsVisible = ( $.inArray( lDependingOn.expression, lDependingOnValues ) === -1 ); break;
                                case "NULL":        lIsVisible = ( lDependingOnValues.length === 0 ); break;
                                case "NOT_NULL":    lIsVisible = ( lDependingOnValues.length > 0 ); break;
                                case 'IN_LIST':
                                    lIsVisible = false;
                                    // Check if any of the values in the value array equals any of
                                    // the values in the depending on expression array
                                    $.each( lDependingOnValues, function( pIndex, pValue ) {
                                        lIsVisible = ( $.inArray( pValue, lDependingOn.values ) !== -1 );
                                        // If result is true, then exit iterator.
                                        if ( lIsVisible ) { return false; }
                                    });
                                    break;
                                case 'NOT_IN_LIST':
                                    lIsVisible = true;
                                    // Check if any of the values in the value array do not
                                    // equal any the values in the depending on expression array.
                                    $.each( lDependingOnValues, function( pIndex, pValue ) {
                                        lIsVisible = ( $.inArray( pValue, lDependingOn.values ) === -1 );
                                        if ( !lIsVisible ) { return false; }
                                    });
                                    break;
                            }

                        } else {

                            if ( lDependingOn.type === "IN_LIST_LIKE" ) {

                                lIsVisible = false;
                                // Check if any of the expression values matches the depending on value
                                $.each( lDependingOn.values, function( pIndex, pValue ) {
                                    lIsVisible = ( lDependingOnValue.search( pValue ) === 0 );
                                    // If result is true, then exit iterator.
                                    if ( lIsVisible ) { return false; }
                                });

                            } else if ( lDependingOn.type === "NOT_IN_LIST_LIKE" ) {

                                lIsVisible = true;
                                // Check if all of the expression values do NOT match the depending on value
                                $.each( lDependingOn.values, function( pIndex, pValue ) {
                                    lIsVisible = ( lDependingOnValue.search( pValue ) === -1 );
                                    if ( !lIsVisible ) { return false; }
                                });

                            } else {

                                switch( lDependingOn.type ) {
                                    case "EQUALS":      lIsVisible = ( lDependingOnValue === lDependingOn.expression ); break;
                                    case "NOT_EQUALS":  lIsVisible = ( lDependingOnValue !== lDependingOn.expression ); break;
                                    case "NULL":        lIsVisible = ( lDependingOnValue === "" ); break;
                                    case "NOT_NULL":    lIsVisible = ( lDependingOnValue !== "" ); break;
                                    case "IN_LIST":     lIsVisible = ( $.inArray( lDependingOnValue, lDependingOn.values ) !==-1 ); break;
                                    case "NOT_IN_LIST": lIsVisible = ( $.inArray( lDependingOnValue, lDependingOn.values ) ===-1 ); break;
                                }
                            }
                        }

                    }

                    // As soon as one of the dependency checks evaluates to false, we are done and don't have to check
                    // the other dependencies
                    if ( !lIsVisible ) {
                        break;
                    }
                }
            }
        }

        return lIsVisible;

    }; // _isVisible


    /*
     * todo
     */
    Property.prototype.getValue = function() {

        return this._value;

    }; // getValue


    /*
     * todo
     */
    Property.prototype.getDisplayValue = function() {

        var lPropertyDef     = gProperties[ this.id ],
            lTypePropertyDef = gTypes[ this.component.typeId ].properties[ this.id ],
            lDisplayPointsMap,
            lTemplateOptionsMap,
            lValue = this._value,
            lValues,
            lDisplayValues = [];

        if ( lValue !== "" ) {

            if ( lPropertyDef.type === PROP_TYPE.YES_NO ) {

                return ( lValue === lPropertyDef.yesValue ) ? format( "LOV.YES" ) : format( "LOV.NO" );

            } else if ( lPropertyDef.type === PROP_TYPE.SUPPORTED_UI ) {

                if ( lPropertyDef.lovType === "PLUGINS" ) {

                    if ( gTypes[ this.component.typeId ].pluginType.plugins.hasOwnProperty( lValue )) {
                        return formatPostfix(
                                   "POSTFIX.UNSUPPORTED",
                                   gTypes[ this.component.typeId ].pluginType.plugins[ lValue ].title,
                                   !isUiSupported( this.component._uiType, gTypes[ this.component.typeId ].pluginType.plugins[ lValue ].uiTypes ));
                    }

                } else if ( lPropertyDef.lovType === "EVENTS" ) {

                    if ( gEvents.lookupMap.hasOwnProperty( lValue )) {
                        return formatPostfix(
                                   "POSTFIX.UNSUPPORTED",
                                   gEvents.lookupMap[ lValue ].d,
                                   !isUiSupported( this.component._uiType, gEvents.lookupMap[ lValue ].uiTypes ));
                    }
                }

            } else if ( lPropertyDef.lovType === "COMPONENT" ) {

                // For Build Options and Authorizations, check for "NOT"
                if (  lPropertyDef.lovComponentTypeId === COMP_TYPE.BUILD_OPTION
                   || lPropertyDef.lovComponentTypeId === COMP_TYPE.AUTHORIZATION )
                {
                    if ( lValue === "MUST_NOT_BE_PUBLIC_USER" ) {
                        return format( "LOV.MUST_NOT_BE_PUBLIC_USER" );
                    // Check if our ID starts with ! or - to negate it
                    } else if ( /^(!|-)/.test( lValue )) {
                        lValue = lValue.substr( 1 );
                        if ( gComponents [ lPropertyDef.lovComponentTypeId ].hasOwnProperty( lValue )) {
                            return formatNoEscape( "LOV.NOT_W_ARGUMENT", gComponents [ lPropertyDef.lovComponentTypeId ][ lValue ].getDisplayTitle());
                        }
                    }
                }

                if ( gComponents [ lPropertyDef.lovComponentTypeId ].hasOwnProperty( lValue )) {
                    return gComponents [ lPropertyDef.lovComponentTypeId ][ lValue ].getDisplayTitle();
                }

            } else if ( lPropertyDef.lovType === "STATIC" ) {

                if ( lPropertyDef.lovValuesMap.hasOwnProperty( lValue )) {
                    return lPropertyDef.lovValues[ lPropertyDef.lovValuesMap[ lValue ]].d;
                }

            } else if ( lPropertyDef.lovType === "REGION_POSITIONS" || lPropertyDef.lovType === "BUTTON_POSITIONS" ) {

                if ( lPropertyDef.lovType === "REGION_POSITIONS" ) {
                    lDisplayPointsMap = getPageTemplate().displayPointsMap;
                } else {
                    lDisplayPointsMap = getRegionTemplate( this.component.getProperty( PROP.REGION ).getValue()).displayPointsMap;
                }

                if ( lDisplayPointsMap.hasOwnProperty( lValue )) {
                    return lDisplayPointsMap[ lValue ].name;
                } else {
                    return formatNoEscape( "LOV.UNKNOWN_LOOKUP", lValue );
                }

            } else if ( lPropertyDef.lovType === "TEMPLATE_OPTIONS" ) {

                lTemplateOptionsMap = getTemplateOptions( this ).valuesMap;
                lValues = lValue.split( ":" );
                for ( var i = 0; i < lValues.length; i++ ) {
                    if ( lTemplateOptionsMap.hasOwnProperty( lValues[ i ] )) {
                        lDisplayValues.push( lTemplateOptionsMap[ lValues[ i ] ].d );
                    } else {
                        lDisplayValues.push( formatNoEscape( "LOV.UNKNOWN_LOOKUP", lValues[ i ] ));
                    }
                }
                return lDisplayValues.join( ", " );

            } else {
                return lValue;
            }

            return formatNoEscape( "LOV.UNKNOWN_LOOKUP", lValue );

        } else {

            if ( lTypePropertyDef.nullText ) {
                return ( lTypePropertyDef.nullText );
            } else {
                return lValue;
            }
        }

    }; // getDisplayValue


    /*
     * todo
     */
    Property.prototype.getMetaData = function() {

        function isRowScope( pTypeId, pPropertyId ) {
            var lProperty;
            if ( lSelf.component.typeId === pTypeId ) {
                lProperty = lSelf.component.getProperty( pPropertyId );
                if ( lProperty && lProperty.getValue() !== "" ) {
                    // We also have to check the 'Execute Condition' property if the current property
                    // is a condition property
                    return !(  lTypePropertyDef.dependingOn.length > 0
                            && lTypePropertyDef.dependingOn[ 0 ].id === PROP.CONDITION_TYPE
                            && lSelf.component.getProperty( PROP.EXECUTE_CONDITION ).getValue() === "N" );
                }
            }
            return false;
        } // isRowScope

        var lSelf            = this,
            lPropertyDef     = gProperties[ this.id ],
            lType            = gTypes[ this.component.typeId ],
            lTypePropertyDef = lType.properties[ this.id ],
            lReferenceScope  = lTypePropertyDef.referenceScope,
            lIsReadOnly      = ( this.component.isReadOnly() || this._isReadOnly );

        // If the reference scope is depending on the value of another property, check to see if it's actually ROW based
        if ( lReferenceScope === "DEPENDS" ) {
            if (  isRowScope( COMP_TYPE.VALIDATION,   PROP.VALIDATION_REGION )
               || isRowScope( COMP_TYPE.PAGE_PROCESS, PROP.PROCESS_REGION )
               )
            {
                lReferenceScope = "ROW";
            } else {
                lReferenceScope = "COMPONENT";
            }
        }

        // -) For the Display Sequence of Classic Report and Tabular Form columns we simulate that the property is read only
        //    because the sequence doesn't allow gaps and has to be unique. But we still want to change it with drag & drop.
        // -) Page Mode should also be read-only if no dialog page templates are available.
        if (( this.component.typeId === COMP_TYPE.CLASSIC_RPT_COLUMN || this.component.typeId === COMP_TYPE.TAB_FORM_COLUMN ) && this.id === PROP.DISPLAY_SEQUENCE ) {
            lIsReadOnly = true;
        } else if ( this.id === PROP.PAGE_MODE && getTheme().defaultTemplates.dialog === "" ) {
            lIsReadOnly = true;
        }

        return {
            type:                 lPropertyDef.type,
            multiValueDelimiter:  lPropertyDef.multiValueDelimiter,
            prompt:               lPropertyDef.prompt,
            unit:                 lPropertyDef.unit,
            displayLen:           lPropertyDef.displayLen,
            maxLen:               lPropertyDef.maxLen,
            textCase:             lPropertyDef.textCase,
            displayGroupId:       lPropertyDef.displayGroupId,
            yesValue:             lPropertyDef.yesValue,
            noValue:              lPropertyDef.noValue,
            isLegacy:             lPropertyDef.hasOwnProperty( "legacyValues" ),
            lovComponentScope:    lPropertyDef.lovComponentScope,
            lovComponentTypeId:   lPropertyDef.lovComponentTypeId,
            // not everybody needs the help text, that's why we defer the generation
            helpText:             function(){ return lSelf._getHelpText(); },
            //
            displaySeq:           lTypePropertyDef.displaySeq,
            isCommon:             lTypePropertyDef.isCommon,
            isUnique:             lTypePropertyDef.hasOwnProperty( "checkUniqueness" ),
            referenceScope:       lReferenceScope,
            defaultValue:         lTypePropertyDef.defaultValue,
            supportsSubstitution: lTypePropertyDef.supportsSubstitution,
            //
            isReadOnly:           lIsReadOnly,
            isRequired:           this._isRequired,
            // not everybody needs the lov and quickpick values, that's why we defer the generation
            lovValues:            function( pCallback, pFilters ) { return lSelf._getLovValues( pCallback, pFilters ); },
            quickPicks:          function() { return lSelf._getQuickPicks( lReferenceScope ); },
            nullText:             lTypePropertyDef.nullText,
            //
            parentProperty:       lTypePropertyDef.parentProperty,
            isCustomPluginAttribute: lPropertyDef.isCustomPluginAttribute
        };

    }; // getMetaData


    Property.prototype._getLovValues = function( pCallback, pFilters ) {

        var lSelf            = this,
            lPropertyDef     = gProperties[ this.id ],
            lType            = gTypes[ this.component.typeId ],
            lTypePropertyDef = lType.properties[ this.id ],
            lFilter      = {},
            lComponents,
            lDisplayPoints,
            lDisplayPointType,
            lStdAttributes,
            lColumns,
            lIsSupported,
            lGridColumnNo,
            lGridColumnSpan,
            lMinGridColumns = 1,
            lMaxGridColumns,
            lLovValue,
            lRegionId,
            lIsDialog,
            lPageTemplates,
            lCategoryMap      = {},
            lLovValues        = [],
            lWrongDataTypeLov = [];

        function addNotEntries( pComponents, pPrefix ) {
            for ( var i = 0; i < pComponents.length; i++ ) {
                lLovValues.push({
                    r: pPrefix + pComponents[ i ].id,
                    d: formatNoEscape( "LOV.NOT_W_ARGUMENT", pComponents[ i ].getDisplayTitle())
                });
            }
        }

        function getSupportedUiLovValues( pLovValues ) {

            var lIsSupported,
                lResultLovValues = [];

            for ( var i = 0; i < pLovValues.length; i++ ) {
                lIsSupported = isUiSupported( lSelf.component._uiType, pLovValues[ i ].uiTypes );
                lResultLovValues.push({
                    r:           pLovValues[ i ].r,
                    d:           formatPostfix( "POSTFIX.UNSUPPORTED", pLovValues[ i ].d, !lIsSupported ),
                    isQuickPick: ( lIsSupported ? pLovValues[ i ].isQuickPick : false ),
                    isSupported: lIsSupported
                });
            }
            return lResultLovValues;
        }

        function getRegionLovValues( pComponents ) {

            function addLovValues( pLovValues, pRegions, pPrefix ) {

                // Sort the regions by display title
                pRegions.sort( function( a, b ) {
                    return a.d.localeCompare( b.d );
                });

                for ( var i = 0; i < pRegions.length; i++ ) {
                    pLovValues.push({
                        r: pRegions[ i ].r,
                        d: pPrefix + pRegions[ i ].d
                    });

                    // Do we have regions which are referencing that region? Add them as sub regions
                    if ( lParentRegionMap.hasOwnProperty( pRegions[ i ].r ) ) {
                        addLovValues( pLovValues, lParentRegionMap[ pRegions[ i ].r ], pPrefix + ".." );
                    }
                }
            }

            var lParentId,
                lMapKey,
                lRegionMap = {},
                lParentRegionMap = { "": [] },
                lLovValues = [];

            for ( var i = 0; i < pComponents.length; i++ ) {
                if (!( pComponents[ i ].typeId === lSelf.component.typeId && pComponents[ i ].id === lSelf.component.id )) {

                    lParentId = pComponents[ i ].getProperty( PROP.PARENT_REGION ).getValue();

                    if ( pComponents[ i ].isOnGlobalPage() && lParentId === "" ) {
                        lMapKey = "global";
                    } else {
                        lMapKey = lParentId;
                    }
                    if ( !lParentRegionMap.hasOwnProperty( lMapKey )) {
                        lParentRegionMap[ lMapKey ] = [];
                    }
                    lParentRegionMap[ lMapKey ].push({
                        r: pComponents[ i ].id,
                        d: pComponents[ i ].getDisplayTitle()
                    });
                    lRegionMap[ pComponents[ i ].id ] = true;
                }
            }

            // Check if all our parent regions do actually have a parent region themselves, if not re-map them to the root
            // This can happen if a tabular form region is a sub region and we only query tabular forms (bug #20715402)
            for ( lMapKey in lParentRegionMap ) {
                if ( lParentRegionMap.hasOwnProperty( lMapKey ) && lMapKey !== "" && !lRegionMap.hasOwnProperty( lMapKey )) {
                    lParentRegionMap[ "" ] = lParentRegionMap[ "" ].concat( lParentRegionMap[ lMapKey ]);
                }
            }

            addLovValues( lLovValues, lParentRegionMap[ "" ], "" );

            // Add global regions
            if ( lParentRegionMap.hasOwnProperty( "global" ) ) {
                addLovValues( lLovValues, lParentRegionMap[ "global" ], "" );
            }

            return lLovValues;
        } // getRegionLovValues


        if ( lPropertyDef.type === PROP_TYPE.SUPPORTED_UI ) {

            if ( lPropertyDef.lovType === "PLUGINS" ) {

                forEachAttribute( lType.pluginType.plugins, function( pPluginName, pPlugin ) {

                    // Only show a legacy plug-in if it's currently in use
                    if (  !pPlugin.isLegacy || lSelf._value === pPluginName ) {
                        lIsSupported = isUiSupported( lSelf.component._uiType, pPlugin.uiTypes );
                        lLovValue    = {
                            r:           pPluginName,
                            d:           formatPostfix( "POSTFIX.UNSUPPORTED", pPlugin.title, !lIsSupported ),
                            isSupported: lIsSupported
                        };

                        if ( pPlugin.category !== undefined ) {
                            if ( !lCategoryMap.hasOwnProperty( pPlugin.category )) {
                                lCategoryMap[ pPlugin.category ] = lLovValues.length;
                                lLovValues.push({
                                    group:  gPluginCategories[ pPlugin.category ],
                                    values: []
                                });
                            }
                            lLovValues[ lCategoryMap[ pPlugin.category ]].values.push( lLovValue );
                        } else {
                            lLovValues.push( lLovValue );
                        }
                    }

                });

                // Sort the values of all category groups
                forEachAttribute( lCategoryMap, function( i, pCategory ) {
                    // Sort the types of the component by title
                    lLovValues[ pCategory ].values.sort( function( a, b ) {
                        return a.d.localeCompare( b.d );
                    });
                });

                // Sort the main list
                lLovValues.sort( function( a, b ) {
                    var lAttr1 = ( a.hasOwnProperty( "d" )) ? "d" : "group",
                        lAttr2 = ( b.hasOwnProperty( "d" )) ? "d" : "group";
                    return a[ lAttr1 ].localeCompare( b[ lAttr2 ]);
                });

            } else if ( lPropertyDef.lovType === "EVENTS" ) {

                lLovValues.push({
                    group:  format( "LOV.BROWSER_EVENTS" ),
                    values: getSupportedUiLovValues( gEvents.browser )
                });
                lLovValues.push({
                    group:  format( "LOV.APEX_EVENTS" ),
                    values: getSupportedUiLovValues( gEvents.apex )
                });
                if ( gEvents.component.length > 0 ) {
                    lLovValues.push({
                        group:  format( "LOV.COMPONENT_EVENTS" ),
                        values: getSupportedUiLovValues( gEvents.component )
                    });
                }
                lLovValues.push({
                    group:  format( "LOV.CUSTOM_EVENT" ),
                    values: getSupportedUiLovValues( gEvents.custom )
                });
            }

        } else if ( lPropertyDef.type === PROP_TYPE.OWNER ) {

            lLovValues = gSharedComponents.schemas;

        } else if ( lPropertyDef.type === PROP_TYPE.TABLE ) {

            server.process (
                "getDbObjects", {
                    x01: pFilters.type,
                    x02: lSelf.component._properties[ lTypePropertyDef.parentProperty.id ]._value, // table owner property
                    x03: "N" // include public synonyms
                }, {
                    success: pCallback
                }
            );

        } else if ( lPropertyDef.type === PROP_TYPE.COLUMN ) {

            lColumns = this._getAvailableColumns( true );

            // First show all columns which have a valid data type and then all the other columns in it's own group
            // Display the columns in the order of the SQL statement
            for ( var i = 0; i < lColumns.length; i++ ) {
                if ( isMatchingDataType( lColumns[ i ].type, lPropertyDef.dataTypes )) {

                    lLovValues.push({
                        r: lColumns[ i ].name,
                        d: lColumns[ i ].name
                    });

                  // Don't include our auto added ROWID if ROWID's are not supported for this property
                } else if ( lColumns[ i ].name !== "ROWID" && lColumns[ i ].type ) {

                    lWrongDataTypeLov.push({
                        r: lColumns[ i ].name,
                        d: lColumns[ i ].name + " (" + lColumns[ i ].type.toLowerCase() + ")"
                    });
                }
            }
            if ( lWrongDataTypeLov.length > 0 ) {
                lLovValues.push({
                    group:  format( "LOV.COLUMN_WRONG_DATA_TYPE" ),
                    values: lWrongDataTypeLov
                });
            }

        } else if ( lPropertyDef.type === PROP_TYPE.ITEM ) {

            getItemsLov( pFilters, pCallback );
            return; // callback called by above function

        } else if ( lPropertyDef.type === PROP_TYPE.PAGE ) {

            getPagesLov( pFilters, pCallback );
            return; // callback called by above function

        } else if ( lPropertyDef.lovType ) {
            if ( lPropertyDef.lovType === "COMPONENT" ) {

                if ( lPropertyDef.lovComponentScope === "PARENT" ) {
                    lFilter = { parentId: lSelf.component.parentId, excludeGlobalPage: true };
                } else if ( lPropertyDef.lovComponentScope === "PAGE" ) {
                    lFilter = { excludeGlobalPage: true };
                } else if ( lPropertyDef.lovComponentScope === "PAGE_AND_GLOBAL" ) {
                    lFilter = {};
                } else if ( lPropertyDef.lovComponentScope === "THEME" ) {
                    lFilter = { parentId: getTheme().id };

                    // Do we have to restrict the page templates?
                    if (  ( lPropertyDef.id === PROP.PAGE_TEMPLATE || lPropertyDef.id === PROP.DIALOG_TEMPLATE )
                       && lTypePropertyDef.parentProperty
                       && lTypePropertyDef.parentProperty.id === PROP.PAGE_MODE )
                    {
                        lIsDialog      = ( $.inArray( lSelf.component._properties[ PROP.PAGE_MODE ]._value, [ "MODAL", "NON_MODAL"] ) !== -1 );
                        lPageTemplates = getTheme().templates[ COMP_TYPE.PAGE_TEMPLATE ];

                        // Only include those page templates which can be used for the current page mode
                        lFilter.filterFunction = function() {
                            return ( lPageTemplates[ this.id ].isDialog === lIsDialog );
                        };
                    }

                }

                // Restrict the tabular form attribute used for Validations and Page Processes to just return regions of
                // type "Tabular Form"
                if ( lPropertyDef.id === PROP.VALIDATION_REGION || lPropertyDef.id === PROP.PROCESS_REGION ) {
                    lFilter.properties = [{
                        id:    PROP.REGION_TYPE,
                        value: "NATIVE_TABFORM"
                    }];
                }

                // Get all components of that type and add it to our lov list,
                // but don't include ourselves to avoid recursions (for example: Parent Region)
                lComponents = getComponents( lPropertyDef.lovComponentTypeId, lFilter, false );
                if ( lPropertyDef.lovComponentTypeId === COMP_TYPE.REGION ) {

                    // For regions we build a hierarchy
                    lLovValues = getRegionLovValues( lComponents );

                } else {

                    for ( var i = 0; i < lComponents.length; i++ ) {
                        if (!( lComponents[ i ].typeId === this.component.typeId && lComponents[ i ].id === this.component.id )) {
                            lLovValues.push({
                                r: lComponents[ i ].id,
                                d: lComponents[ i ].getDisplayTitle()
                            });
                        }
                    }

                    // Sort the components by display title
                    lLovValues.sort( function( a, b ) {
                        return a.d.localeCompare( b.d );
                    });

                    // For Build Options add "NOT" entries after the existing entries
                    if ( lPropertyDef.lovComponentTypeId === COMP_TYPE.BUILD_OPTION ) {
                        addNotEntries( lComponents, "-" );

                        // For Authorizations, add "Must not be public user" and "NOT" entries
                    } else if ( lPropertyDef.lovComponentTypeId === COMP_TYPE.AUTHORIZATION ) {
                        lLovValues.push({
                            r: "MUST_NOT_BE_PUBLIC_USER",
                            d: format( "LOV.MUST_NOT_BE_PUBLIC_USER" )
                        });
                        addNotEntries( lComponents, "!" );
                    }

                }

            } else if ( lPropertyDef.lovType === "STATIC" ) {

                // Restrict the static LOV for "Affected Element Type" to just those defined by the plug-in
                if ( lSelf.id === PROP.AFFECTED_TYPE ) {

                    lStdAttributes = lType.pluginType.plugins[ lSelf.component.getProperty( PROP.DA_ACTION_TYPE ).getValue()].stdAttributes;
                    // For backward compatibility where DOM Object is still used
                    if ( lSelf._value === "DOM_OBJECT" ) {
                        lStdAttributes.push( "DOM_OBJECT" );
                    }
                    for ( var i = 0; i < lPropertyDef.lovValues.length; i++ ) {
                        if ( $.inArray( lPropertyDef.lovValues[ i ].r, lStdAttributes ) !== -1 ) {
                            lLovValues.push( lPropertyDef.lovValues[ i ]);
                        }
                    }

                } else {

                    for ( var i = 0; i < lPropertyDef.lovValues.length; i++ ) {
                        if (  ( !lPropertyDef.lovValues[ i ].isLegacy || lSelf._value === lPropertyDef.lovValues[ i ].r )
                           && !( lPropertyDef.lovValues[ i ].isInternal && !gOptions.isInternal )
                           )
                        {
                            lLovValues.push( lPropertyDef.lovValues[ i ] );
                        }
                    }

                }

            } else if ( lPropertyDef.lovType === "REGION_POSITIONS" || lPropertyDef.lovType === "BUTTON_POSITIONS" ) {

                if ( lPropertyDef.lovType === "REGION_POSITIONS" ) {
                    lDisplayPoints    = getPageTemplate().displayPoints;
                    lDisplayPointType = "REGION";
                } else {
                    lRegionId         = this.component.getProperty( PROP.REGION ).getValue();
                    lDisplayPointType = "BUTTON";
                    if ( lRegionId !== "" ) {
                        lDisplayPoints = getRegionTemplate( lRegionId ).displayPoints;
                    } else {
                        lDisplayPoints = [];
                    }
                }

                for ( var i = 0; i < lDisplayPoints.length; i++ ) {
                    // Don't include the "Right of IR Search Bar" button position, if the region isn't an IR region
                    if ( $.inArray( lDisplayPointType, lDisplayPoints[ i ].types ) !== -1
                       && !(  lDisplayPoints[ i ].types[ 0 ] === "BUTTON"
                           && lDisplayPoints[ i ].id         === "RIGHT_OF_IR_SEARCH_BAR"
                           && lRegionId !== ""
                           && getComponents( COMP_TYPE.REGION, { id: lRegionId })[ 0 ].getProperty( PROP.REGION_TYPE ).getValue() !== "NATIVE_IR"
                           )
                       )
                    {
                        lLovValues.push({
                            r:        lDisplayPoints[ i ].id,
                            d:        lDisplayPoints[ i ].name,
                            isLegacy: lDisplayPoints[ i ].isLegacy
                        });
                    }
                }

            } else if ( lPropertyDef.lovType === "GRID_COLUMNS" ) {

                lMaxGridColumns = lSelf.component._grid.maxColumns;
                if ( lSelf.id === PROP.GRID_COLUMN_SPAN || lSelf.id === PROP.GRID_LABEL_COLUMN_SPAN ) {

                    lGridColumnNo = parseInt( lSelf.component._properties[ PROP.GRID_COLUMN ].getValue(), 10 );
                    if ( lGridColumnNo > 0 ) {
                        lMaxGridColumns -= ( lGridColumnNo - 1 );
                    }

                    if ( lSelf.id === PROP.GRID_LABEL_COLUMN_SPAN ) {
                        // The label column span can't use more columns than the overall span of the page item minus 1
                        lGridColumnSpan = parseInt( lSelf.component._properties[ PROP.GRID_COLUMN_SPAN ].getValue(), 10 );
                        if ( lGridColumnSpan > 0 ) {
                            lMaxGridColumns = lGridColumnSpan;
                        }
                        lMinGridColumns = 0;
                        lMaxGridColumns -= 1;
                    }
                }

                for ( var i = lMinGridColumns; i <= lMaxGridColumns; i++ ) {
                    lLovValues.push({
                        r: i + "",
                        d: i + ""
                    });
                }

            } else if ( lPropertyDef.lovType.indexOf( "FORMAT_MASKS" ) !== -1 ) {

                if ( lPropertyDef.lovType === "DATE_FORMAT_MASKS" ) {
                    lLovValues = gFormatMasks.dates;
                } else if ( lPropertyDef.lovType === "NUMBER_FORMAT_MASKS" ) {
                    lLovValues = gFormatMasks.numbers;
                } else if ( lPropertyDef.lovType === "CHART_FORMAT_MASKS" ) {
                    lLovValues = gFormatMasks.chart;
                } else {
                    lLovValues = gFormatMasks.dates.concat( gFormatMasks.numbers );
                    /* Combobox doesn't support groups yet
                    lLovValues.push({
                        group:  format( "LOV.DATE_FORMAT_MASKS" ),
                        values: gFormatMasks.dates
                    });
                    lLovValues.push({
                        group:  format( "LOV.NUMBER_FORMAT_MASKS" ),
                        values: gFormatMasks.numbers
                    });
                    */
                }

            } else if ( lPropertyDef.lovType === "DISTINCT" ) {

                server.process (
                    "getDistinctValues", {
                        x01: this.component.typeId,
                        x02: this.id
                    }, {
                        success: function( pData ) {

                            var lComponents     = getComponents( lSelf.component.typeId, {}),
                                lDistinctValues = {};

                            function addDistinctValue( pValue ) {
                                var lValues;

                                if ( pValue !== "" ) {
                                    // If the property supports multiple values, we actually want to have the single values and
                                    // not the combined value for our list of values
                                    if ( gProperties[ lSelf.id ].multiValueDelimiter ) {
                                        lValues = pValue.split( gProperties[ lSelf.id ].multiValueDelimiter );
                                        for ( var i = 0; i < lValues.length; i++ ) {
                                            lDistinctValues[ lValues[ i ]] = "";
                                        }
                                    } else {
                                        lDistinctValues[ pValue ] = "";
                                    }
                                }
                            } // addDistinctValue


                            // Get distinct values for current page
                            for ( var i = 0; i < lComponents.length; i++ ) {
                                if ( lComponents[ i ]._properties.hasOwnProperty( lSelf.id )) {
                                    addDistinctValue( lComponents[ i ]._properties[ lSelf.id ]._value );
                                }
                            }

                            // Add all distinct server values
                            for ( var i = 0; i < pData.length; i++ ) {
                                addDistinctValue( pData[ i ]);
                            }

                            // Build the final lov values array
                            for ( var lValue in lDistinctValues ) {
                                if ( lDistinctValues.hasOwnProperty( lValue )) {
                                    lLovValues.push({
                                        d: lValue,
                                        r: lValue
                                    });
                                }
                            }
                            lLovValues.sort( function( a, b ) {
                                return a.d.localeCompare( b.d );
                            });

                            pCallback( lLovValues );
                        }
                    }
                );

            } else if ( lPropertyDef.lovType === "MAP_REGIONS" ) {

                server.process (
                    "getMapRegions", {
                        x01: lSelf.component._properties[ lTypePropertyDef.parentProperty.id ]._value, // map location property
                        x02: pFilters.id
                    }, {
                        success: pCallback
                    }
                );

            } else if ( lPropertyDef.lovType === "TEMPLATE_OPTIONS" ) {

                lLovValues = getTemplateOptions( lSelf ).values;

            }
        }

        if ( $.isFunction( pCallback )) {
            pCallback( lLovValues );
        } else {
            return lLovValues;
        }

    }; // _getLovValues


    Property.prototype._getQuickPicks = function( pReferenceScope ) {

        var lSelf            = this,
            lPropertyDef     = gProperties[ this.id ],
            lType            = gTypes[ this.component.typeId ],
            lTypePropertyDef = lType.properties[ this.id ],
            lDisplayPoints,
            lDisplayPointType,
            lRegionId,
            lColumns,
            lSubstitution,
            lQuickPicks = [];

        function addQuickPick( pValue ) {

            var lReturnValue;

            if ( pValue.i ) {
                if ( pValue.isLegacy ) {
                    lReturnValue = '<img src="#IMAGE_PREFIX#' + ( pValue.dir || "" ) + pValue.i + '.gif" alt="">';
                } else {
                    lReturnValue = '<img src="#IMAGE_PREFIX#app_ui/img/icons/' + pValue.i + '.png" class="' + pValue.i + '" alt="">';
                }

                lQuickPicks.push({
                    r: lReturnValue,
                    d: pValue.i + ( pValue.isLegacy ? ".gif" : ".png" ),
                    icon: "icon-link-" + pValue.i
                });
            } else {
                lQuickPicks.push({
                    r: pValue.r,
                    d: pValue.d || pValue.r
                });
            }
        }

        function addEvents( pLovValues ) {
            for ( var i = 0; i < pLovValues.length; i++ ) {
                if ( pLovValues[ i ].isQuickPick && isUiSupported( lSelf.component._uiType, pLovValues[ i ].uiTypes )) {
                    addQuickPick( pLovValues[ i ] );
                }
            }
        }


        if ( lPropertyDef.type === PROP_TYPE.SUPPORTED_UI ) {

            if ( lPropertyDef.lovType === "PLUGINS" ) {

                forEachAttribute( lType.pluginType.plugins, function( pPluginName, pPlugin ) {

                    if ( pPlugin.isQuickPick && isUiSupported( lSelf.component._uiType, pPlugin.uiTypes ) && !pPlugin.isLegacy ) {
                        addQuickPick({
                            r: pPluginName,
                            d: pPlugin.title
                        });
                    }

                });

                lQuickPicks.sort( function( a, b ) {
                    return a.d.localeCompare( b.d );
                });

            } else if ( lPropertyDef.lovType === "EVENTS" ) {

                addEvents( gEvents.browser );
                addEvents( gEvents.apex );
                addEvents( gEvents.component );

            }

        } else if ( lPropertyDef.lovType ) {

            if ( lPropertyDef.lovType === "STATIC" ) {

                // Restrict the static LOV for "Affected Element Type" to just those defined by the plug-in
                if ( lSelf.id === PROP.AFFECTED_TYPE ) {

                    // todo no quick picks for affected type for now

                } else {
                    for ( var i = 0; i < lPropertyDef.lovValues.length; i++ ) {
                        if ( lPropertyDef.lovValues[ i ].isQuickPick && !lPropertyDef.lovValues[ i ].isLegacy ) {
                            addQuickPick( lPropertyDef.lovValues[ i ] );
                        }
                    }
                }

            } else if ( lPropertyDef.lovType === "REGION_POSITIONS" || lPropertyDef.lovType === "BUTTON_POSITIONS" ) {

                if ( lPropertyDef.lovType === "REGION_POSITIONS" ) {
                    lDisplayPoints    = getPageTemplate().displayPoints;
                    lDisplayPointType = "REGION";
                } else {
                    lRegionId         = this.component.getProperty( PROP.REGION ).getValue();
                    lDisplayPointType = "BUTTON";
                    if ( lRegionId !== "" ) {
                        lDisplayPoints = getRegionTemplate( lRegionId ).displayPoints;
                    } else {
                        lDisplayPoints = [];
                    }
                }

                for ( var i = 0; i < lDisplayPoints.length; i++ ) {
                    if ( $.inArray( lDisplayPointType, lDisplayPoints[ i ].types ) !== -1 && lDisplayPoints[ i ].isQuickPick ) {
                        addQuickPick({
                            r: lDisplayPoints[ i ].id,
                            d: lDisplayPoints[ i ].name
                        });
                    }
                }

            } else if ( lPropertyDef.lovType.indexOf( "FORMAT_MASKS" ) !== -1 ) {

                // todo no quickpicks for format masks for now

            }

        } else {

            if ( $.inArray( lType.id, [ COMP_TYPE.IR_ATTRIBUTES,
                                        COMP_TYPE.IR_COLUMN,
                                        COMP_TYPE.CLASSIC_RPT_COLUMN,
                                        COMP_TYPE.TAB_FORM_COLUMN,
                                        COMP_TYPE.VALIDATION,
                                        COMP_TYPE.PAGE_PROCESS,
                                        COMP_TYPE.REGION_PLUGIN_ATTR,
                                        COMP_TYPE.REGION_COLUMN ]) !== -1 )
            {

                if ( lPropertyDef.id === PROP.LINK_TEXT ) {
                    addQuickPick({ r: "#" + lSelf.component.getProperty( PROP.COLUMN_NAME ).getValue() + "#" });
                }

                if ( lPropertyDef.id === PROP.LINK_ICON || lPropertyDef.id === PROP.LINK_TEXT ) {

                    addQuickPick({ i: "apex-edit-pencil" });
                    addQuickPick({ i: "apex-edit-pencil-alt" });
                    addQuickPick({ i: "apex-edit-page" });
                    addQuickPick({ i: "apex-edit-view" });
                    // Legacy images
                    addQuickPick({ i: "pencil16x16", dir: "menu/", isLegacy: true });
                    addQuickPick({ i: "e2", isLegacy: true });
                    addQuickPick({ i: "small_page", dir: "ws/", isLegacy: true });
                    addQuickPick({ i: "magnifying_glass_white_bg", isLegacy: true });
                } else {

                    // Should we show the region columns as quick pick?
                    if (  lTypePropertyDef.supportsSubstitution
                       && pReferenceScope === "ROW"
                       && $.inArray( lPropertyDef.type, [ PROP_TYPE.TEXT, PROP_TYPE.TEXTAREA, PROP_TYPE.HTML ]) !== -1 )
                    {
                        lColumns  = getItemsLov( { type: "columns", component: lSelf.component });
                        if ( $.inArray( lType.id, [ COMP_TYPE.IR_ATTRIBUTES, COMP_TYPE.IR_COLUMN, COMP_TYPE.CLASSIC_RPT_COLUMN, COMP_TYPE.TAB_FORM_COLUMN ]) !== -1 ) {
                            lSubstitution = {
                                prefix:  "#",
                                postfix: "#",
                                enquote: false };
                        } else {
                            lSubstitution = {
                                prefix:  "&",
                                postfix: ".",
                                enquote: true };
                        }

                        for ( var i = 0; i < lColumns.length; i++ ) {
                            addQuickPick({
                                r: lSubstitution.prefix + ( lSubstitution.enquote ? enquoteIdentifier( lColumns[ i ].name ) : lColumns[ i ].name ) + lSubstitution.postfix,
                                d: lColumns[ i ].name
                            });
                        }
                    }
                }
            }

        }

        return lQuickPicks;

    }; // _getQuickPicks


    Property.prototype._getHelpText = function() {

        var lSelf             = this,
            lPropertyDef      = gProperties[ this.id ],
            lType             = gTypes[ this.component.typeId ],
            lTypePropertyDef  = lType.properties[ this.id ],
            lHelpText;

        function getPluginsHelpText( pType ) {
            var lPlugins,
                lHtml = "<dl>";

            lPlugins = $.map( lType.pluginType.plugins, function( pPluginDef, pPluginName ) {
                if (  pPluginName.indexOf( pType ) === 0
                    && isUiSupported( lSelf.component._uiType, pPluginDef.uiTypes )
                    && !pPluginDef.isLegacy ) {
                    return pPluginDef;
                }
            }).sort( function( a, b ) {
                    return a.title.localeCompare( b.title );
                });

            for ( var i = 0; i < lPlugins.length; i++ ) {
                // We do a safe whitelist escaping of lPlugins[ i ].helpText on the server side
                lHtml += "<dt>" + util.escapeHTML( lPlugins[ i ].title ) + "</dt>";
                lHtml += "<dd>" + lPlugins[ i ].helpText;
                if ( lPlugins[ i ].aboutUrl ) {
                    lHtml += " " + format( "HELP.ABOUT_PLUGIN", lPlugins[ i ].aboutUrl );
                }
                lHtml += "</dd>";
            }
            lHtml += "</dl>";

            return lHtml;
        } // getPluginsHelpText

        function getLovHelpText() {
            var lLovValues = lSelf.getMetaData().lovValues(),
                lHtml;

            lHtml = "<p>" + format( "HELP.AVAILABLE_OPTIONS" ) + "</p><dl>";

            if ( lTypePropertyDef.nullText ) {
                lHtml += "<dt>" + lTypePropertyDef.nullText + "</dt>";
                if ( lTypePropertyDef.nullHelpText ) {
                    lHtml += "<dd>" + lTypePropertyDef.nullHelpText + "</dd>";
                }
            }

            for ( var i = 0; i < lLovValues.length; i++ ) {
                // We do a safe whitelist escaping of lLovValues[ i ].helpText on the server side
                lHtml += "<dt>" + util.escapeHTML( lLovValues[ i ].d ) + "</dt>";
                if ( lLovValues[ i ].helpText || lLovValues[ i ].isLegacy ) {
                    lHtml += "<dd>";
                    if ( lLovValues[ i ].helpText ) {
                        lHtml += lLovValues[ i ].helpText;
                    }
                    if ( lLovValues[ i ].isLegacy ) {
                        lHtml += "<p><em>" + format( "HELP.DEPRECATED.LOV_VALUE", RELEASE_NOTES_DEPRECATED_FEATURES ) + "</em></p>";
                    }
                    lHtml += "</dd>";
                }
            }
            lHtml += "</dl>";

            return lHtml;
        } // getLovHelpText

        function getTemplateOptionsHelpText() {

            function emitLovValues( pLovValues ) {
                for ( var i = 0; i < pLovValues.length; i++ ) {
                    lHtml += "<dt>" + util.escapeHTML( pLovValues[ i ].name ) + "</dt>";
                    if ( pLovValues[ i ].helpText ) {
                        lHtml += "<dd>" + pLovValues[ i ].helpText + "</dd>"; // whitelist escaping done on server
                    }
                }
            } // emitLovValues

            var lTemplateOptions = getTemplateOptions( lSelf ),
                lGroupId,
                lGroupIdx,
                lGroups           = [],
                lGroupsMap        = {},
                lGeneralLovValues = [],
                lHtml,
                i;

            // Build a list of "general" template options and one for each group
            for ( i = 0; i < lTemplateOptions.values.length; i++ ) {

                if ( lTemplateOptions.values[ i ].groupId ) {
                    lGroupId = lTemplateOptions.values[ i ].groupId;
                    if ( !lGroupsMap.hasOwnProperty( lGroupId )) {
                        lGroups.push({
                            title:     lTemplateOptions.groups[ lGroupId ].title,
                            seq:       lTemplateOptions.groups[ lGroupId ].seq,
                            helpText:  lTemplateOptions.groups[ lGroupId ].helpText,
                            lovValues: []
                        });
                        lGroupIdx = lGroups.length - 1;
                        lGroupsMap[ lGroupId ] = lGroupIdx;
                    } else {
                        lGroupIdx = lGroupsMap[ lGroupId ];
                    }
                    lGroups[ lGroupIdx ].lovValues.push({
                        name:     lTemplateOptions.values[ i ].d,
                        helpText: lTemplateOptions.values[ i ].helpText
                    });

                } else {

                    lGeneralLovValues.push({
                        name:     lTemplateOptions.values[ i ].d,
                        helpText: lTemplateOptions.values[ i ].helpText
                    });

                }
            }

            // Sort result based on sequence and if they are equal, use title as second sort option
            lGroups.sort( function( a, b ) {
                if ( a.seq === b.seq ) {
                    return a.title.localeCompare( b.title );
                } else {
                    return a.seq - b.seq;
                }
            });

            lHtml = "<p>" + format( "HELP.AVAILABLE_OPTIONS" ) + "</p><dl>";

            emitLovValues( lGeneralLovValues );

            for ( i = 0; i < lGroups.length; i++ ) {
                lHtml += "<dt>" + util.escapeHTML( lGroups[ i ].title ) + "</dt><dd>";
                if ( lGroups[ i ].helpText ) {
                    lHtml += "<p>" + lGroups[ i ].helpText + "</p>"; // whitelist escaping done on server
                }
                lHtml += "<dl>";
                emitLovValues( lGroups[ i ].lovValues );
                lHtml += "</dl></dd>";
            }

            lHtml += "</dl>";

            return lHtml;

        } // getTemplateOptionsHelpText


        // Generate the help text
        lHelpText = "<p>" + ( lTypePropertyDef.helpText || lPropertyDef.helpText ) + "</p>";

        //
        if ( lType.pluginType && this.id === lType.pluginType.typePropertyId ) {
            lHelpText = lHelpText
                .replace( /#NATIVE_PLUGINS#/, getPluginsHelpText( "NATIVE" ))
                .replace( /#CUSTOM_PLUGINS#/, getPluginsHelpText( "PLUGIN" ));
        }

        // Add a warning if the attribute is deprecated
        if ( lPropertyDef.legacyValues ) {
            lHelpText = "<p><em>" + format( "HELP.DEPRECATED.ATTRIBUTE", RELEASE_NOTES_DEPRECATED_FEATURES ) + "</em></p>";
        }

        // Add available lov options to help text
        if ( lPropertyDef.lovType === "STATIC" ) {
            if ( /#LOV_VALUES#/.test( lHelpText )) {
                lHelpText = lHelpText.replace( /#LOV_VALUES#/, getLovHelpText());
            } else {
                lHelpText += getLovHelpText();
            }
        } else if ( lPropertyDef.lovType === "TEMPLATE_OPTIONS" ) {
            lHelpText += getTemplateOptionsHelpText();
        }

        if ( this._sqlExamples !== undefined || lPropertyDef.examples !== undefined ) {
            // We do a safe whitelist escaping of sqlExamples on the server side
            lHelpText += "<h4>" + format( "HELP.EXAMPLES" ) + "</h4><p>" + ( this._sqlExamples || lPropertyDef.examples ) + "</p>";
        }

        // Don't show the extended information for all property types, for select list type properties it doesn't add value
        if ( $.inArray( lPropertyDef.type, [ PROP_TYPE.CHECKBOXES, PROP_TYPE.LINK, PROP_TYPE.COMPONENT,
                                             PROP_TYPE.SELECT_LIST, PROP_TYPE.SUPPORTED_UI,
                                             PROP_TYPE.SUBSCRIPTION, PROP_TYPE.YES_NO,
                                             PROP_TYPE.OWNER, PROP_TYPE.TABLE, PROP_TYPE.COLUMN,
                                             PROP_TYPE.TEMPLATE_OPTIONS ]) === -1 )
        {
            lHelpText += "<h4>" + format( "HELP.ADDITIONAL_INFO" ) +"</h4>";
            lHelpText += "<ul><li>" + format( "HELP.TYPE" ) + ": " + format( "HELP.PROP_TYPE." + lPropertyDef.type );
            if ( lPropertyDef.multiValueDelimiter ) {
                lHelpText += " (" + format( "HELP.MULTIPLE.TEXT", format( "HELP.MULTIPLE." + lPropertyDef.multiValueDelimiter )) + ")";
            }
            lHelpText += "</li>";

            if ( lPropertyDef.type.substr( 0, 3 ) === "SQL" || lPropertyDef.type.substr( 0, 5 ) === "PLSQL" ) {
                lHelpText += "<li>" + format( "HELP.BIND_VARIABLES" ) + ": " + format( "HELP.REF_SCOPE." + lSelf.getMetaData().referenceScope ) + "</li>";
            }

            if ( lTypePropertyDef.supportsSubstitution ) {
                lHelpText += "<li>" + format( "HELP.SUBSTITUTIONS" ) + ": " + format( "HELP.REF_SCOPE." + lSelf.getMetaData().referenceScope ) + "</li>";
            }

            if ( lPropertyDef.type === PROP_TYPE.SQL ) {

                lHelpText += "<li>" + format( "HELP.MIN_COLUMNS" ) + ": " + this._sqlMinColumns + "</li>";
                if ( this._sqlMaxColumns > 0 && this._sqlMaxColumns < 999 ) {
                    lHelpText += "<li>" + format( "HELP.MAX_COLUMNS" ) + ": " + this._sqlMaxColumns + "</li>";
                }

            } else if ( lPropertyDef.type === PROP_TYPE.INTEGER || lPropertyDef.type === PROP_TYPE.NUMBER ) {

                if ( lPropertyDef.minValue !== undefined ) {
                    lHelpText += "<li>" + format( "HELP.MIN_VALUE" ) + ": " + lPropertyDef.minValue + "</li>";
                }
                if ( lPropertyDef.maxValue !== undefined ) {
                    lHelpText += "<li>" + format( "HELP.MAX_VALUE" ) + ": " + lPropertyDef.maxValue + "</li>";
                }
            }

            if ( lPropertyDef.restrictedChars !== undefined ) {
                lHelpText += "<li>" + format( "HELP.RESTRICTED_CHARS_LABEL" ) + ": " + format( "HELP.RESTRICTED_CHARS." + lPropertyDef.restrictedChars ) + "</li>";
            }
            lHelpText += "</ul>";
        }

        return lHelpText;

    }; // _getHelpText


    Property.prototype.getColumns = function( pIncludeAutoRowid ) {

        var lColumns = [];

        if ( this.errors.length === 0 && this.warnings.length === 0 ) {

            if ( pIncludeAutoRowid ) {
                lColumns = this._columns;
            } else {
                // Don't add the column of the SQL statement if it's the ROWID column (first column) which we
                // have automatically add to the SQL statement.
                // todo how can we distinguish if the developer has added that column or if it was done by the engine?
                for ( var i = 0; i < this._columns.length; i++ ) {
                    if ( !( this._columns[ i ].name === "ROWID" && i === 0 )) {
                        lColumns.push( this._columns[ i ] );
                    }
                }
            }
        }
        return lColumns;

    }; // getColumns


    Property.prototype.hasOrderBy = function() {

        return ( this.errors.length === 0 && this._hasOrderBy );

    }; // hasOrderBy


    Property.prototype._getAvailableColumns = function( pIncludeAutoRowid ) {

        var lTypePropertyDef = gTypes[ this.component.typeId ].properties[ this.id ],
            lParentProperty  = lTypePropertyDef.parentProperty,
            lComponent       = this.component,
            lColumns         = [];

        if ( lTypePropertyDef.hasOwnProperty( "parentProperty" )) {
            // Get columns from the specified component/property
            while ( lComponent !== undefined ) {
                if ( lComponent.typeId === lParentProperty.typeId ) {
                    // If the parent is a region, we have to get the columns from the specified region
                    if ( gProperties[ lParentProperty.id ].lovComponentTypeId === COMP_TYPE.REGION ) {
                        lColumns = getRegionColumns( this.component._properties[ lParentProperty.id ]._value );
                        break;
                    } else {
                        lColumns = lComponent._properties[ lParentProperty.id ].getColumns( pIncludeAutoRowid );
                        break;
                    }
                } else {
                    lComponent = lComponent.getParent();
                }
            }
        }

        return lColumns;

    }; // _getAvailableColumns


    /*
     * todo
     */
    Property.prototype._checkColumn = function( pColumnName ) {

        // Get the columns of the parent property
        var lColumns = this._getAvailableColumns( true );

        for ( var i = 0; i < lColumns.length; i++ ) {
            if ( lColumns[ i ].name === pColumnName ) {
                if ( isMatchingDataType( lColumns[ i ].type, gProperties[ this.id ].dataTypes )) {
                    return "";
                } else {
                    return format( "VAL.COLUMN_HAS_WRONG_DATA_TYPE" );
                }
            }
        }
        return format( "VAL.COLUMN_NOT_FOUND" );
    }; // _checkColumn


    /*
     * Validates the passed property value based on the property configuration
     */
    Property.prototype.validate = function( pValue ) {

        // Regular Expression Patterns &ABC. or &"ABC".
        // ABC can also be multi byte but no linefeed, additional quotes or ampersands are allowed.
        // Spaces are allowed in the name because the reference could also be a tabular form column alias.
        var SUBSTITUTION_SYNTAX = /^&((\w+)|("[^\n\r"&]+"))\.$/,
            // Keep the regular expressions in sync with htmldb_util.has_restricted_chars
            RESTRICTED_CHARS = {
                "US_ONLY":                     /[^a-zA-Z0-9 ]/,
                "US_ONLY_NO_SPACE":            /[^a-zA-Z0-9]/,
                "US_ONLY_UNDERSCORE_NO_SPACE": /[^a-zA-Z0-9_]/,
                "WEB_SAFE":                    /[<>"]/,
                "NO_SPECIAL_CHAR":             /[&<>"\/;,*|=%]|(--)/,
                "NO_SPECIAL_CHAR_NL":          /[&<>"\/;,*|=%\n\r]|(--)/,
                "SAFE_COMPONENT_NAME":         /[ :&,.+?^'"\n\r]/
            },
            SEPARATORS = {
                decimal: locale.getDecimalSeparator(),
                group:   locale.getGroupSeparator()
            };

        var lValue           = pValue,
            lSelf            = this,
            lType            = gTypes[ this.component.typeId ],
            lTypeProperties  = lType.properties,
            lTypePropertyDef = lTypeProperties[ this.id ],
            lPropertyDef     = gProperties[ this.id ],
            lNumericValue,
            lGenericColumnCount,
            lError,
            lFilter,
            lComponents,
            lTableOwner,
            lResult = {
                errors:     [],
                warnings:   [],
                columns:    this._columns,
                hasOrderBy: this._hasOrderBy
            };

        function addWarningError( pValidationResult ) {
            if ( pValidationResult.error ) {
                lResult.errors.push( pValidationResult.error );
            }
            if ( pValidationResult.warning ) {
                lResult.warnings.push( pValidationResult.warning );
            }
        }; // addWarningError


        // 1) If the property is required, does it have a value?
        if ( this._isRequired && $.trim( lValue ) === "" ) {
            // todo we should not allow to set a required and unique column to null -> or if it's the display column
            lResult.errors.push( format( "VAL.IS_REQUIRED" ));
        } else {

            // No validation necessary if no value has been provided
            if ( $.trim( lValue ) !== "" ) {

                // 2) If restricted characters have been defined, does the value contain one of those?
                if ( lPropertyDef.restrictedChars && RESTRICTED_CHARS[ lPropertyDef.restrictedChars ].test( lValue )) {

                    lResult.errors.push( format( "VAL.HAS_RESTRICTED_CHAR", lValue.match( RESTRICTED_CHARS[ lPropertyDef.restrictedChars ] )));

                } else {

                    // 3) Check if substitution syntax was used for a number or integer property
                    if (  ( lPropertyDef.type === PROP_TYPE.NUMBER || lPropertyDef.type === PROP_TYPE.INTEGER )
                       && ( lTypePropertyDef.supportsSubstitution && SUBSTITUTION_SYNTAX.test( lValue ))
                       )
                    {

                    // 4) Check maximum length
                    } else if ( lValue.length > lPropertyDef.maxLen ) {

                        lResult.errors.push( format( "VAL.VALUE_TOO_LONG", ( lValue.length - lPropertyDef.maxLen )));

                    } else {

                        // 5) Check all other property types
                        if ( lPropertyDef.type === PROP_TYPE.NUMBER || lPropertyDef.type === PROP_TYPE.INTEGER ) {

                            if ( lPropertyDef.type === PROP_TYPE.NUMBER ) {
                                // Number only understands a dot as decimal separator, that's why we have convert the
                                // current value first
                                if ( SEPARATORS.decimal !== "." ) {
                                    lValue = lValue.replace( new RegExp( util.escapeRegExp( SEPARATORS.group   ), "g" ), "!" ); /* don't allow group separators */
                                    lValue = lValue.replace( new RegExp( util.escapeRegExp( SEPARATORS.decimal ), "g" ), "." );
                                }
                                lNumericValue = Number( lValue );
                                lError        = format( "VAL.MUST_BE_NUMERIC" );
                            } else {
                                lNumericValue = parseInt( lValue, 10 );
                                lError        = format( "VAL.MUST_BE_INTEGER" );
                            }

                            if ( isNaN( lNumericValue) || lNumericValue != lValue ) {

                                lResult.errors.push( lError );

                            } else if ( lPropertyDef.minValue !== undefined || lPropertyDef.maxValue !== undefined ) {

                                if ( lNumericValue < lPropertyDef.minValue ) {
                                    lResult.errors.push( format( "VAL.VALUE_LESS_MIN_VALUE", lPropertyDef.minValue ));
                                } else if ( lNumericValue > lPropertyDef.maxValue ) {
                                    lResult.errors.push( format( "VAL.VALUE_GREATER_MAX_VALUE", lPropertyDef.maxValue ));
                                }
                            }

                        } else if (  $.inArray ( lSelf.id, [ PROP.REGION_SQL, PROP.REGION_FUNCTION_RETURNING_SQL ]) !== -1
                                  && lSelf.component.getProperty( PROP.GENERIC_COLUMN_COUNT ))
                        {

                            lGenericColumnCount = lSelf.component.getProperty( PROP.GENERIC_COLUMN_COUNT ).getValue();
                            lResult.columns     = [];
                            lResult.hasOrderBy  = false;

                            for ( var i = 1; i <= lGenericColumnCount; i++ ) {
                                lResult.columns.push({
                                    name:       "COL" + ( i < 10 ? "0" : "" ) + i,
                                    type:       "VARCHAR2",
                                    isRequired: false,
                                    maxLen:     4000
                                });
                            }

                        } else if (  $.inArray( lPropertyDef.type, [ PROP_TYPE.TABLE, PROP_TYPE.SQL, PROP_TYPE.SQL_EXPR, PROP_TYPE.PLSQL, PROP_TYPE.PLSQL_EXPR_VARCHAR, PROP_TYPE.PLSQL_EXPR_BOOLEAN, PROP_TYPE.PLSQL_FUNC_VARCHAR, PROP_TYPE.PLSQL_FUNC_BOOLEAN ]) !== -1
                                  || lPropertyDef.hasPlSqlCheck ) {

                            // todo we should also check uniqueness for types APPLICATION, WORKSPACE and INSTANCE


                            // If it's a "table" property type, we also have to get the "table owner" property from our parent
                            if ( lPropertyDef.type === PROP_TYPE.TABLE ) {
                                lTableOwner = this.component._properties[ lTypePropertyDef.parentProperty.id ]._value;
                            }

                            // Do the validation on the server, because we have to check SQL, PLSQL and table names and also have to get the available columns
                            // of the SQL statement/table
                            server.process (
                                "validateProperty", {
                                    x01: this.id,
                                    x02: lPropertyDef.type,
                                    x03: this._sqlMinColumns,
                                    x04: this._sqlMaxColumns,
                                    x05: lValue,
                                    x06: lTableOwner
                                }, {
                                    success: function( pData ) {
                                        lResult.columns    = pData.columns || [];
                                        lResult.hasOrderBy = pData.hasOrderBy;

                                        if ( pData.result !== "OK" ) {
                                            // By default we show everything as a warning, but if it's a SQL or TABLE property
                                            // which is used by other properties (i.e. column properties) we have to show it as
                                            // an error, because we will not be able to populate those properties
                                            if (  (  $.inArray( lPropertyDef.type, [ PROP_TYPE.SQL, PROP_TYPE.TABLE ]) >= 0
                                                  && lTypePropertyDef.refByChilds.length > 0 )
                                               || lSelf.id === PROP.REGION_FUNCTION_RETURNING_SQL )
                                            {
                                                lResult.errors.push( pData.result );
                                            } else {
                                                lResult.warnings.push( pData.result );
                                            }
                                        }
                                    },
                                    async: false // this is by intention, because we need the result within the current transaction
                                });

                        } else if ( lPropertyDef.type === PROP_TYPE.COLUMN ) {

                            // Check if it's a valid column and if the column data type matches with our configuration
                            lError = this._checkColumn( lValue );
                            if ( lError !== "" ) {
                                lResult.errors.push( lError );
                            }
                        }

                        // Check uniqueness of property
                        if ( lTypePropertyDef.checkUniqueness ) { // todo
                            lFilter = { properties: [{ id: this.id, value: lValue }]};

                            // Restrict our component query based on the scope of uniqueness. APPLICATION, WORKSPACE and INSTANCE will just be
                            // checked on the server
                            if ( lTypePropertyDef.checkUniqueness === "PARENT" ) {
                                lFilter.parentId = this.component.parentId;
                                // todo do we have to have a dependency on the parent property? I think this is needed to revalidate unique properties if a component is moved to a different parent
                            } else if ( lTypePropertyDef.checkUniqueness === "PAGE" ) {
                                lFilter.pageId = gCurrentPageId;
                            }

                            lComponents = getComponents( this.component.typeId, lFilter );
                            if ( getComponents( this.component.typeId, lFilter ).length > 0 && lComponents[ 0 ].id !== this.component.id ) {
                                lResult.errors.push( format( "VAL.MUST_BE_UNIQUE" ));
                            }
                        }

                        // Let a plug-in/component type know about changed property values, this will allow to perform custom validations
                        if ( lResult.errors.length === 0 ) {
                            addWarningError( this.component._callPluginCallback({ action: CALLBACK_ACTION.VALIDATE, property: this, value: lValue }) );
                        }
                        if ( lResult.errors.length === 0 ) {
                            addWarningError( this.component._callComponentTypeCallback({ action: CALLBACK_ACTION.VALIDATE, property: this, value: lValue }) );
                        }
                    }
                }
            }
        }

        return lResult;

    }; // validate


    /*
     * todo documentation
     */
    Property.prototype._setValue = function( pValue, pOptions ) {

        var lSelf            = this,
            lComponent       = this.component,
            lValue           = pValue + "", // Let's make sure that we always get a string
            lOldValue        = this._value,
            lOptions,
            lType            = gTypes[ lComponent.typeId ],
            lPluginType      = lType.pluginType,
            lTypeProperties  = lType.properties,
            lTypePropertyDef = lTypeProperties[ this.id ],
            lPropertyDef     = gProperties[ lSelf.id ],
            lValidationResult,
            lSeq             = undefined,
            lParentId        = undefined;

        /*
         * Auto corrects the property value based on the property configuration
         */
        function autoCorrect() {

            // 1) Auto trim value
            if ( $.inArray( lPropertyDef.type, [ PROP_TYPE.NUMBER, PROP_TYPE.INTEGER, PROP_TYPE.LINK, PROP_TYPE.ITEM, PROP_TYPE.PAGE, PROP_TYPE.TABLE ]) !== -1 ) {
                lValue = $.trim( lValue );
            }

            // 2) Set text case
            if ( lPropertyDef.textCase === "UPPER" ) {
                lValue = lValue.toUpperCase();
            } else if ( lPropertyDef.textCase === "LOWER" ) {
                lValue = lValue.toLowerCase();
            }

        } // autoCorrect


        /*
         * This method checks if the children properties should be added or removed based on the current property value.
         */
        function addOrRemoveChildren( pPropertyId ) {

            var lPropertyId;

            /*
             * Removes the the passed in property and all it's children and grand children, ...
             */
            function removeProperty( pPropertyId ) {

                delete lComponent._properties[ pPropertyId ];

                // Remove all children as well
                for ( var i = 0; i < lTypeProperties[ pPropertyId ].refByDependingOn.length; i++ ) {

                    removeProperty( lTypeProperties[ pPropertyId ].refByDependingOn[ i ]);
                }
            } // removeProperty


            for ( var i = 0; i < lTypeProperties[ pPropertyId ].refByDependingOn.length; i++ ) {

                lPropertyId = lTypeProperties[ pPropertyId ].refByDependingOn[ i ];

                if ( lComponent._properties.hasOwnProperty( lPropertyId )) {
                    // If the property already exists, recreate it with the current value
                    lComponent._properties[ lPropertyId ] = new Property({
                        component:    lComponent,
                        propertyId:   lPropertyId,
                        defaultValue: lComponent._properties[ lPropertyId ]._value,
                        columns:      lComponent._properties[ lPropertyId ]._columns,
                        hasOrderBy:   lComponent._properties[ lPropertyId ]._hasOrderBy
                    });
                } else {
                    // If the child property doesn't exist yet, create it
                    if ( lPropertyId === PROP.GRID_LABEL_COLUMN_SPAN || lPropertyId === PROP.READ_ONLY_HTML_ATTRIBUTES ) {
                        // Grid properties do have additional checks, use the grid API to create it
                        // No need to include PROP.LABEL_ALIGNMENT and PROP.ELEMENT_FIELD_ALIGNMENT because they are taken care of by the
                        // dependency to ITEM_TYPE which will trigger a resetGridProperties
                        lComponent._setGridProperties( true );
                    } else {
                        lComponent._properties[ lPropertyId ] = new Property({
                            component:  lComponent,
                            propertyId: lPropertyId
                        });
                    }
                }

                // Check if the child property should be visible, if yes do the same check for it's children.
                // Otherwise remove the property and all it's children.
                // Note: we have to do this additional check if the property exists, because grid properties might
                //       not have been created
                if ( lComponent._properties.hasOwnProperty( lPropertyId ) && lComponent._properties[ lPropertyId ]._isVisible()) {
                    addOrRemoveChildren( lPropertyId );
                } else {
                    removeProperty( lPropertyId );
                }
            }
        } // addOrRemoveChildren


        /*
         * Reset all child properties.
         * For properties of type "Column" we check if the referenced column isn't valid anymore after changing the
         * parent property containing a SQL statement or table name.
         * For all other properties we just reset the value.
         */
        function resetChildProperties() {

            function resetChildProperty( pComponent, pChildPropertyId ) {

                var lProperty,
                    lSetFunction;

                // Check if the child property is really in use for that component
                if ( pComponent._properties.hasOwnProperty( pChildPropertyId )) {

                    lProperty = pComponent._properties[ pChildPropertyId ];

                    if ( pComponent === lComponent ) {
                        // If we update the current component, we don't want to trigger a new transaction update, because
                        // we already did that
                        lSetFunction = "_setValue";
                    } else {
                        // It's a child component we update, write a transaction record
                        lSetFunction = "setValue";
                    }

                    if ( gProperties[ pChildPropertyId ].type === PROP_TYPE.COLUMN && lSelf._value !== "" && lProperty._value !== "" ) {
                        // Verify it the specified column is still valid, if not clear it
                        if ( lProperty._checkColumn( lProperty._value ) === format( "VAL.COLUMN_NOT_FOUND" )) {
                            lProperty[ lSetFunction ]( "", lOptions );
                        } else {
                            // Trigger a validation for that column to show for example a wrong data type message
                            lProperty[ lSetFunction ]( lProperty._value, lOptions );
                        }
                    } else {
                        // For all other property types, just reset the value with the default
                        lProperty[ lSetFunction ]( replaceDefaultPlaceholders( lProperty, gTypes[ pComponent.typeId ].properties[ pChildPropertyId ].defaultValue ), lOptions );
                    }
                }
            }


            var lChilds;

            // As long as the parent property has an error or warnings, don't clear the children. We want to avoid that
            // if an invalid SQL statement has been entered, all children are immediately cleared.
            // The exception of this rule is in the case of an "Is Required" error. Because it would look odd if someone
            // changes the table owner, the table name is cleared but the column names would still be displayed because
            // there is a "is required" error on the table name.
            if (  ( lSelf.errors.length === 0 && lSelf.warnings.length === 0 )
               || ( lSelf.errors.length === 1 && lSelf.errors[ 0 ] === format( "VAL.IS_REQUIRED" ))
               )
            {
                for ( var i = 0; i < lTypePropertyDef.refByChilds.length; i++ ) {
                    if ( lTypePropertyDef.refByChilds[ i ].typeId === lComponent.typeId ) {

                        // Reset property within the same component
                        resetChildProperty( lComponent, lTypePropertyDef.refByChilds[ i ].id );

                    } else {

                        // Reset property in a child component
                        lChilds = lComponent.getChildrenUntil( lTypePropertyDef.refByChilds[ i ].typeId );
                        for ( var j = 0; j < lChilds.length; j++ ) {
                            resetChildProperty( lChilds[ j ], lTypePropertyDef.refByChilds[ i ].id );
                        }
                    }
                }
            }

        } // resetChildProperties


        function resetGridProperties() {

            if (  $.inArray( lSelf.id, [ PROP.GRID_NEW_GRID, PROP.GRID_NEW_ROW, PROP.GRID_COLUMN, PROP.GRID_NEW_COLUMN, PROP.GRID_COLUMN_SPAN ]) !== -1
               || ( lComponent.typeId === COMP_TYPE.REGION    && $.inArray( lSelf.id, [ PROP.REGION_POSITION, PROP.PARENT_REGION, PROP.REGION_TEMPLATE ]) !== -1 )
               || ( lComponent.typeId === COMP_TYPE.BUTTON    && $.inArray( lSelf.id, [ PROP.BUTTON_POSITION, PROP.REGION ]) !== -1 )
               || ( lComponent.typeId === COMP_TYPE.PAGE_ITEM && $.inArray( lSelf.id, [ PROP.REGION, PROP.ITEM_TYPE, PROP.FIELD_TEMPLATE ]) !== -1 )
               )
            {

                lComponent._setGridProperties();

            } else if ( lComponent.typeId === COMP_TYPE.PAGE && $.inArray( lSelf.id, [ PROP.PAGE_TEMPLATE, PROP.DIALOG_TEMPLATE ]) !== -1 ) {

                setPageGridProperties();

            }

        } // resetGridProperties

        function renamePageItemReferences( pOldName, pNewName ) {

            var SEARCH_VALUE_ESCAPED = util.escapeRegExp( pOldName );

            var lRefPropertyDef,
                lTypePropertyDef,
                lSearchRegExp,
                lFilter,
                lRefComponents = [],
                lRefProperty,
                i, j, k;

            // Get all properties which are referencing page items with a weak property type = ITEM
            for ( i = 0; i < gTypes[ COMP_TYPE.PAGE_ITEM ].refByProperties.length; i++ ) {
                lRefPropertyDef = gProperties[ gTypes[ COMP_TYPE.PAGE_ITEM ].refByProperties[ i ]];

                if ( lRefPropertyDef.type === "ITEM" ) {
                    if ( lRefPropertyDef.multiValueDelimiter ) {
                        lSearchRegExp = new RegExp( "(^|" + lRefPropertyDef.multiValueDelimiter + "|\\s)" + SEARCH_VALUE_ESCAPED + "($|" + lRefPropertyDef.multiValueDelimiter + "|\\s)", "i" );
                        lFilter = { properties: [{ id: lRefPropertyDef.id, value: lSearchRegExp }]};
                    } else {
                        lSearchRegExp = new RegExp( "^" + SEARCH_VALUE_ESCAPED + "$", "i" );
                        lFilter = { properties: [{ id: lRefPropertyDef.id, value: lSearchRegExp }]};
                    }

                    for ( j = 0; j < lRefPropertyDef.refByComponentTypes.length; j++ ) {

                        lTypePropertyDef = gTypes[ lRefPropertyDef.refByComponentTypes[ j ]].properties[ lRefPropertyDef.id ];
                        lRefComponents = getComponents( lRefPropertyDef.refByComponentTypes[ j ], lFilter, false );
                        for ( k = 0; k < lRefComponents.length; k++ ) {
                            lRefProperty = lRefComponents[ k ].getProperty( lRefPropertyDef.id );
                            if ( lRefPropertyDef.multiValueDelimiter ) {
                                lRefProperty.setValue( lRefProperty.getValue().replace( lSearchRegExp, "$1" + pNewName + "$2" ));
                            } else {
                                lRefProperty.setValue( pNewName );
                            }
                        }
                    }
                }
            }
        } // renamePageItemReferences


        pOptions = $.extend({
            checkReadOnly: true
        }, pOptions );
        lOptions = $.extend({}, {}, pOptions );

        // Perform several integrity checks before we do anything
        if ( pOptions.checkReadOnly ) {
            if ( gIsPageReadOnly ) {
                throw "Page is read only!";
            } else if ( lComponent.isReadOnly()) {
                throw "Component is read only!";
            } else if ( lSelf._isReadOnly ) {
                throw "Property '" + lSelf.getMetaData().prompt + "' (" + lSelf.id + ") is read only for this component!";
            }
        }

        // Don't change the value/validate the value if it hasn't changed and we haven't had errors/warnings before
        if ( lValue === lSelf._value && lSelf.errors.length === 0 && lSelf.warnings.length === 0 && !pOptions.forceSetValue ) {
            return;
        }

        // Let's auto correct and validate the property value
        autoCorrect();
        lValidationResult = this.validate( lValue );

        // If a different plug-in has been selected, call the remove callback of the old plug-in.
        // This will allow the plug-in to remove child components from the model
        if ( lPluginType && lSelf.id === lPluginType.typePropertyId && lValue !== lOldValue ) {
            this.component._callPluginCallback({ action: CALLBACK_ACTION.REMOVED });
        }

        // Update property
        lSelf._value      = lValue;
        lSelf.hasChanged  = true;
        lSelf.errors      = lValidationResult.errors;
        lSelf.warnings    = lValidationResult.warnings;
        lSelf._columns    = lValidationResult.columns;
        lSelf._hasOrderBy = lValidationResult.hasOrderBy;

        // Replicate the sequence into our dedicated "seq" attribute for faster sort operations, but only
        // if that property doesn't have an error. Otherwise we say with the value we currently have.
        if ( lSelf.errors.length === 0 && lSelf.id === lType.seqPropertyId ) {
            lSeq = parseInt( lValue, 10);
        }

        // Replicate the parent property value into our dedicated "parentId" attribute for standardized access
        if ( lSelf.id === lType.parentPropertyId ) {
            lParentId = lValue;
        }

        lComponent._setHasChanged({
            seq:      lSeq,
            parentId: lParentId
        });

        // Add/Remove child properties
        addOrRemoveChildren( lSelf.id );

        // Reset child properties. For example in the case if the region SQL has been changed or a parent table property.
        resetChildProperties();

        // Rename all references of the changed item name
        if ( lSelf.id === PROP.ITEM_NAME ) {
            renamePageItemReferences( lOldValue, lValue );
        }

        // Check if we have to reset some of the grid properties
        resetGridProperties();

        // Update error/warnings. Do it as last step of _setValue, because on of the reset/addOrRemove function might
        // have changed other properties of the component as well
        lComponent._setHasChanged();

    }; // _setValue


    Property.prototype.setValue = function( pValue, pForceSetValue ) {

        var lOldValue;

        // Perform several integrity checks before we do anything
        if ( this.component._status === STATUS.DELETED ) {
            throw "Component has been deleted!";
        }

        // Remember current state of component which is going to be modified so that we are able to undo our operation
        addToTransaction( this.component, OPERATION.CHANGE );

        lOldValue = this._value;

        // Now it's time to set the property values the developer has specified
        this._setValue( pValue, { checkReadOnly: true, forceSetValue: pForceSetValue });

        // Let a plug-in/component type know about changed property values, this will allow to refresh child components
        // For example if the SQL statement changes, update the report columns
        this.component._callPluginCallback({ property: this, oldValue: lOldValue });
        this.component._callComponentTypeCallback({ property: this, oldValue: lOldValue });

        return this;
    }; // setValue


    /*
     * todo
     */
    Property.prototype._setUniqueValue = function() {

        var lCheckUniqueness = gTypes[ this.component.typeId ].properties[ this.id ].checkUniqueness,
            lFilter          = { properties: [{ id: this.id, value: "" }]},
            lValue           = this.getValue();

        // Restrict our component query based on the scope of uniqueness. APPLICATION, WORKSPACE and INSTANCE will just be
        // checked on the server
        if ( lCheckUniqueness === "PARENT" ) {
            lFilter.parentId = this.component.parentId;
        } else if ( lCheckUniqueness === "PAGE" ) {
            lFilter.pageId = gCurrentPageId;
        }

        // Check if the current value is already in use, if yes try to find a unique value by adding a sequence starting with 2
        lFilter.properties[ 0 ].value = lValue;
        for ( var i = 1; i < 10000; i++ ) {
            if ( getComponents( this.component.typeId, lFilter, false ).length === 0 ) {
                // Found a unique value, update our property with that value
                this._value = lFilter.properties[ 0 ].value;
                return;
            }
            lFilter.properties[ 0 ].value = lValue + "_" + i;
        }
        throw "Unable to generate a unique value for property '" + this.getMetaData().prompt + "' (" + this.id + ")!";
    }; // _setUniqueValue


    /*
     * todo documentation
     */
    function Component( pOptions ) {

        /*
        {
            component: <Component>,
            previousComponent: <Component>,
            isDetached: true/false, -- don't add component instance to component array. This is only used for history.
            typeId: <xxx>,
            parentId: <xxx>,
            values: <xxx>
        }
         */

        var lType,
            lNewComponent;

        //
        // Duplicate existing component
        //
        if ( pOptions.component instanceof Component ) {

            // Duplicate our existing component
            lNewComponent = $.extend( true, {}, pOptions.component );

            // Copy all the attributes of the new component to the this object
            for ( var i in lNewComponent ) {
                if ( lNewComponent.hasOwnProperty( i )) {
                    if ( i === "_properties" ) {
                        // Duplicate the properties and get new instances of them
                        this._properties = {};
                        for ( var lPropertyId in lNewComponent._properties ) {
                            if ( lNewComponent._properties.hasOwnProperty( lPropertyId )) {
                                this._properties[ lPropertyId ] = new Property({
                                    component:  this,
                                    propertyId: lNewComponent._properties[ lPropertyId ]
                                });
                            }
                        }
                    } else {
                        // Just copy the component attribute
                        this[ i ] = lNewComponent[ i ];
                    }
                }
            }

            if ( pOptions.isDetached ) {
                return;
            }

            lType = gTypes[ this.typeId ];

            if ( lType.isOneToOneRelation ) {
                this.id = pOptions.parentId;
            } else {
                this.id = getNewComponentId();
            }
            this._status     = STATUS.CREATED;
            this.seq         = 0;
            this._isReadOnly = false;

        } else {

            lType = gTypes[ pOptions.typeId ];

            this.id          = "";
            this.parentId    = "";
            this._status     = STATUS.UNCHANGED;
            this._uiType     = UI_TYPE.DESKTOP;
            this.typeId      = pOptions.typeId;
            this.seq         = 0;
            this._isReadOnly = false;
            this._properties = {};

            //
            // If we call Component with the data from the server, we just want to get a Component instance.
            //
            if ( $.isPlainObject( pOptions.component )) {

                this.id       = pOptions.component.id;
                this.parentId = pOptions.component.parentId;
                this.pageId   = pOptions.component.pageId;
                this._uiType  = pOptions.component.uiType || this._uiType;
                this._lock    = pOptions.component.lock || false;

                // Initialize properties set on server
                for ( var lPropertyId in pOptions.component.properties ) {
                    if ( pOptions.component.properties.hasOwnProperty( lPropertyId )) {
                        this._properties[ lPropertyId ] = new Property({
                            component:  this,
                            propertyId: lPropertyId,
                            server:     pOptions.component.properties[ lPropertyId ]
                        });

                        // Replicate the sequence into our dedicated "seq" attribute for faster sort operations
                        if ( lPropertyId === lType.seqPropertyId ) {
                            this.seq = parseInt( pOptions.component.properties[ lPropertyId ], 10 ); // todo do sequences contain decimal digits?
                        }
                    }
                }

                // Initialize all properties of that component type which are not included in the server communication because they where empty
                for ( var lPropertyId in lType.properties ) {
                    if ( lType.properties.hasOwnProperty( lPropertyId ) && !this._properties.hasOwnProperty( lPropertyId )) {
                        this._properties[ lPropertyId ] = new Property({
                            component:  this,
                            propertyId: lPropertyId,
                            server:     ""
                        });
                    }
                }

                // Some properties are depending on each other, remove all properties which are not valid in the current context
                this._cleanProperties();

                if ( pOptions.isDetached ) {
                    return;
                }

            } else {

                //
                // Create new component from scratch
                //
                if ( lType.isOneToOneRelation ) {
                    this.id = pOptions.parentId;
                } else {
                    this.id = getNewComponentId();
                }
                this._status = STATUS.CREATED;

                // Get the UI type from the current page
                if ( gCurrentPageId ) {
                    this._uiType = gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ]._uiType;
                }

                // Register the new component as component of the current page
                if ( lType.isPageComponent ) {
                    this.pageId = gCurrentPageId;
                }

                // Initialize all properties of that component type with their default values
                for ( var lPropertyId in lType.properties ) {
                    if ( lType.properties.hasOwnProperty( lPropertyId )) {
                        this._properties[ lPropertyId ] = new Property({
                            component:  this,
                            propertyId: lPropertyId
                        });
                    }
                }

                // Some properties are depending on each other, remove all properties which are not valid in the current context
                this._cleanProperties();
            }
        }

        // For new components which do not come from the server, perform some post processing
        if ( this._status === STATUS.CREATED ) {

            lType = gTypes[ this.typeId ];

            // Set parent if it has been specified
            if ( pOptions.parentId ) {
                this.parentId = pOptions.parentId;
                if ( lType.parentPropertyId ) {
                    this._properties[ lType.parentPropertyId ]._setValue( this.parentId, { checkReadOnly: false });
                }
            } else {
                // Default it to the current page/application
                if ( lType.parentId === COMP_TYPE.PAGE ) {
                    this.parentId = gCurrentPageId;
                } else if ( lType.parentId === COMP_TYPE.APPLICATION ) {
                    this.parentId = gCurrentAppId;
                }
            }

            // Mark all properties as changed. In addition
            // check unique properties and generate a new unique value by adding a postfix
            for ( var lPropertyId in this._properties ) {
                if ( this._properties.hasOwnProperty( lPropertyId )) {
                    this._properties[ lPropertyId ].hasChanged = true;

                    // Is the property the unique identifier? In that case we have to generate a unique value
                    if ( lType.properties[ lPropertyId ].hasOwnProperty( "checkUniqueness" )) {
                        this._properties[ lPropertyId ]._setUniqueValue();
                    }
                }
            }

            // Initialize the grid properties for this new component
            this._setGridProperties();

            // Now it's time to set the property values the developer has specified
            this._setProperties( pOptions.values, { checkReadOnly: false });

            // if the sequence hasn't been set by the caller, calculate it based on the previous component and the hierarchy
            // we are in
            if ( this.seq === 0 && lType.seqPropertyId ) {
                this._move( pOptions.previousComponent );
            }

            // Remember newly created component so that we are able to undo our operation
            addToTransaction( this, OPERATION.CREATE );

            // Call the "created" callback of the used plug-in and component type, but only for components created from
            // scratch (not duplicated). This will allow a plug-in/component type to create child components in the model
            // For duplicated components we just call the "changed" callback
            if ( !pOptions.hasOwnProperty( "component" )) {
                this._callPluginCallback({ action: CALLBACK_ACTION.CREATED });
                this._callComponentTypeCallback({ action: CALLBACK_ACTION.CREATED });
            } else {
                this._callPluginCallback({ properties: pOptions.values });
                this._callComponentTypeCallback({ properties: pOptions.values });
            }
        }

        // Store the new component in our component store
        gComponents[ this.typeId ][ this.id ] = this;

    } // Component


    /*
     * todo
     */
    Component.prototype._callPluginCallback = function( pOptions ) {

        var lType       = gTypes[ this.typeId ],
            lPluginType = lType.pluginType,
            lAction     = pOptions.action,
            lPlugin,
            lPluginDef,
            lComponents,
            lResult;

        if ( lPluginType ) {
            // If it's a validation callback, the plug-in type property isn't stored yet, used the passed value
            if ( pOptions.action === CALLBACK_ACTION.VALIDATE && pOptions.property.id === lPluginType.typePropertyId ) {
                lPlugin = lPluginType.plugins[ pOptions.value ];
            } else {
                lPlugin = lPluginType.plugins[ this._properties[ lPluginType.typePropertyId ]._value ];
            }

            if ( lPlugin ) {

                // if no action has been defined, find out if it's a CREATED or CHANGED action by looking at the
                // changed property/properties
                if ( lAction === undefined ) {
                    if ( pOptions.property && pOptions.property.id === lPluginType.typePropertyId ) {

                        lAction = CALLBACK_ACTION.CREATED;

                    } else if ( pOptions.properties ) {

                        for ( var i = 0; i < pOptions.properties.length; i++ ) {
                            if ( pOptions.properties[ i ].id === lPluginType.typePropertyId ) {
                                lAction = CALLBACK_ACTION.CREATED;
                                break;
                            }
                        }
                    }
                    // If action is still undefined, it has to be a changed callback
                    if ( lAction === undefined ) {
                        lAction = CALLBACK_ACTION.CHANGED;
                    }
                }

                // Always remove and re-create the region plug-in attributes if a region type plug-in changes
                if ( lType.id === COMP_TYPE.REGION && ( lAction === CALLBACK_ACTION.CREATED || lAction === CALLBACK_ACTION.REMOVED )) {

                    // Don't create the plug-in attributes for Classic Reports and Tabular Forms. They do have there own "Attributes" component
                    if ( lAction === CALLBACK_ACTION.CREATED && $.inArray( lPlugin.name, [ "NATIVE_SQL_REPORT", "NATIVE_FNC_REPORT", "NATIVE_TABFORM" ]) === -1 ) {

                        // Only add the "Attributes" node if the plug-in has custom or standard attributes or if it's a breadcrumb or
                        // list which do have dedicated attributes in REGION PLUGIN ATTRIBUTES
                        lPluginDef = gTypes[ COMP_TYPE.REGION_PLUGIN_ATTR ].pluginType.plugins[ lPlugin.name ];

                        if (  lPluginDef.attributes.length > 0
                           || $.inArray( "FETCHED_ROWS",          lPluginDef.stdAttributes ) !== -1
                           || $.inArray( "NO_DATA_FOUND_MESSAGE", lPluginDef.stdAttributes ) !== -1
                           || $.inArray( "COLUMN_HEADING",        lPluginDef.stdAttributes ) !== -1
                           || lPlugin.name === "NATIVE_BREADCRUMB"
                           || lPlugin.name === "NATIVE_LIST"
                           )
                        {
                            new Component({
                                typeId:   COMP_TYPE.REGION_PLUGIN_ATTR,
                                parentId: this.id,
                                values:   [{
                                    id:    PROP.HIDDEN_REGION_TYPE,
                                    value: lPlugin.name
                                }]
                            });
                        }

                    } else if ( lAction === CALLBACK_ACTION.REMOVED ) {

                        lComponents = this.getChilds( COMP_TYPE.REGION_PLUGIN_ATTR );
                        if ( lComponents.length === 1 ) {
                            lComponents[ 0 ].remove();
                        }

                    }
                }

                // Call the plug-in specific callback if one is defined
                if ( $.isFunction( lPlugin.callback )) {

                    if ( lAction === CALLBACK_ACTION.VALIDATE ) {
                        lResult = lPlugin.callback.apply( this, [ lAction, pOptions.property, pOptions.value ]);
                    } else if ( lAction === CALLBACK_ACTION.CREATED || lAction === CALLBACK_ACTION.REMOVED ) {
                        lPlugin.callback.apply( this, [ lAction ]);
                    } else if ( lAction === CALLBACK_ACTION.CHANGED && pOptions.property ) {
                        lPlugin.callback.apply( this, [ lAction, pOptions.property ]);
                    }

                    // If multiple properties have been changed, fire a "changed" callback for all non-plugin type properties
                    if ( pOptions.properties ) {
                        for ( var i = 0; i < pOptions.properties.length; i++ ) {
                            if ( pOptions.properties[ i ].id !== lPluginType.typePropertyId ) {
                                lPlugin.callback.apply( this, [
                                    CALLBACK_ACTION.CHANGED,
                                    this.getProperty( pOptions.properties[ i ].id ),
                                    pOptions.properties[ i ].oldValue
                                ]);
                            }
                        }
                    }
                }

            }
        }

        return lResult || {};

    }; // _callPluginCallback


    /*
     * todo
     */
    Component.prototype._callComponentTypeCallback = function( pOptions ) {

        var lResult;

        var lType = gTypes[ this.typeId ];

        if ( $.isFunction( lType.callback )) {
            if ( pOptions.action === CALLBACK_ACTION.VALIDATE ) {
                lResult = lType.callback.apply( this, [ pOptions.action, pOptions.property, pOptions.value ]);
            } else if ( pOptions.action ) {
                lType.callback.apply( this, [ pOptions.action ]);
            } else if ( pOptions.property ) {
                lType.callback.apply( this, [ CALLBACK_ACTION.CHANGED, pOptions.property, pOptions.oldValue ]);
            } else if ( $.isArray( pOptions.properties )) {
                for ( var i = 0; i < pOptions.properties.length; i++ ) {
                    lType.callback.apply( this, [
                        CALLBACK_ACTION.CHANGED,
                        this.getProperty( pOptions.properties[ i ].id ),
                        pOptions.properties[ i ].oldValue
                    ]);
                }
            }
        }

        return lResult || {};

    }; // _callComponentTypeCallback


    /*
     * todo
     */
    Component.prototype.isOnGlobalPage = function() {

        return ( this.pageId === gCurrentUserInterface.globalPageId && this.pageId !== gCurrentPageId );

    }; // isOnGlobalPage


    /*
     * todo
     */
    Component.prototype.isReadOnly = function() {

        // Components of the global page are always read only if we are editing a different page
        return ( gIsPageReadOnly || this._isReadOnly || this.isOnGlobalPage() || gTypes[ this.typeId ].isSharedComponent );

    }; // isReadOnly


    /*
     * todo
     */
    Component.prototype.hasChanged = function() {

        return ( this._status !== STATUS.UNCHANGED );

    }; // hasChanged


    /*
     * todo
     */
    Component.prototype.hasErrors = function() {

        for ( var lPropertyId in this._properties ) {
            if ( this._properties.hasOwnProperty( lPropertyId )) {
                if ( this._properties[ lPropertyId ].errors.length > 0 ) {
                    return true;
                }
            }
        }
        return false;

    }; // hasErrors


    /*
     * todo
     */
    Component.prototype.hasWarnings = function() {

        for ( var lPropertyId in this._properties ) {
            if ( this._properties.hasOwnProperty( lPropertyId )) {
                if ( this._properties[ lPropertyId ].warnings.length > 0 ) {
                    return true;
                }
            }
        }
        return false;

    }; // hasWarnings


    /*
     * todo
     */
    Component.prototype._setHasChanged = function( pOptions ) {

        var lSelf = this;

        pOptions = pOptions || {};

        // Update component
        if ( pOptions.status === STATUS.DELETED ) {
            lSelf._status = STATUS.DELETED;
        } else if ( lSelf._status === STATUS.UNCHANGED ) {
            lSelf._status = STATUS.UPDATED;
        }
        if ( pOptions.seq !== undefined ) {
            lSelf.seq = pOptions.seq;
        }
        if ( pOptions.parentId !== undefined ) {
            lSelf.parentId = pOptions.parentId;
        }

    }; // _setHasChanged


    /*
     * todo documentation
     */
    Component.prototype._deleteProperty = function( pPropertyId ) {

        var lTypePropertyDef = gTypes[ this.typeId ].properties[ pPropertyId ];

        delete this._properties[ pPropertyId ];

        for ( var i = 0; i < lTypePropertyDef.refByDependingOn.length; i++ ) {
            this._deleteProperty( lTypePropertyDef.refByDependingOn[ i ] );
        }

    }; // _deleteProperty


    /*
     * todo documentation
     */
    Component.prototype._cleanProperties = function() {

        for ( var lKey in this._properties ) {
            if ( this._properties.hasOwnProperty( lKey )) {
                if ( !this._properties[ lKey ]._isVisible()) {
                    this._deleteProperty( lKey );
                }
            }
        }

    }; // _cleanProperties


    Component.prototype._getGridParams = function( pOptions ) {

        var lPageTemplate  = getPageTemplate(),
            lRegionId,
            lRegionGridParams,
            lDisplayPointName,
            lDisplayPoint,
            lResult = {};

        function getRegionGridParams( lRegionId ) {

            var lRegion             = getComponents( COMP_TYPE.REGION, { id: lRegionId })[ 0 ],
                lRegionGridParams   = $.extend( {}, lRegion._grid ),
                lColumnNo,
                lColumnSpanProperty,
                lColumnSpan;

            if ( lRegionGridParams.hasGridSupport && !lPageTemplate.alwaysUseMaxColumns ) {

                lColumnNo           = lRegion._properties[ PROP.GRID_COLUMN ].getValue();
                lColumnSpanProperty = lRegion._properties[ PROP.GRID_COLUMN_SPAN ];

                if ( lPageTemplate.grid.hasColumnSpan && lColumnSpanProperty ) {
                    lColumnSpan = lColumnSpanProperty.getValue();
                }

                if ( lColumnSpan > 0 ) {
                    // If the region has a column span then the child components can never use more columns than it's parent
                    lRegionGridParams.maxColumns = parseInt( lColumnSpan, 10 );
                    debug.trace( "_getGridParams: Region %O uses column span, reduce max columns to %i", lRegion, lRegionGridParams.maxColumns );
                } else if ( lColumnNo > 0 ) {
                    // If the region has an absolutely positioned column it will reduce the available grid columns for child components
                    lRegionGridParams.maxColumns -= ( parseInt( lColumnNo, 10 ) - 1 );
                    debug.trace( "_getGridParams: Region %O uses column positioning, reduce max columns to %i", lRegion, lRegionGridParams.maxColumns );
                }
            }

            return lRegionGridParams;
        }; // getRegionGridParams


        if ( this.typeId === COMP_TYPE.REGION ) {

            if ( this._properties[ PROP.PARENT_REGION ]._value === "" ) {

                lDisplayPointName = this._properties[ PROP.REGION_POSITION ]._value;

            } else {

                // Get SUB_REGIONS display point of the region template of parent region
                lRegionId         = this._properties[ PROP.PARENT_REGION ]._value;
                lDisplayPointName = "SUB_REGIONS";
            }

        } else if ( this.typeId === COMP_TYPE.PAGE_ITEM ) {

            // Get BODY display point of the region template of parent region
            if ( this.parentId ) {
                lRegionId         = this.parentId;
                lDisplayPointName = "BODY";
            }

        } else if ( this.typeId === COMP_TYPE.BUTTON ) {

            // Get button position display point of the region template of parent region
            if ( this.parentId ) {
                lRegionId         = this.parentId;
                lDisplayPointName = this._properties[ PROP.BUTTON_POSITION ]._value;
            }
        }

        if ( lRegionId === undefined ) {
            lDisplayPoint = lPageTemplate.displayPointsMap[ lDisplayPointName ];
        } else {
            lDisplayPoint = getRegionTemplate( lRegionId ).displayPointsMap[ lDisplayPointName ];
        }

        // We haven't found a display point because the page template has been switched, assume it's a display point
        // with grid support and maximum available columns. This default is necessary to not clear any existing grid settings
        if ( lDisplayPoint === undefined ) {

            lDisplayPoint = {
                hasGridSupport:      true,
                maxFixedGridColumns: lPageTemplate.grid.maxColumns,
                isUnknown:           true
            };

            debug.warn( "_getGridParams: Component %O uses unknown display point %s! Fallback to default values", this, lDisplayPointName );

        } else if ( lPageTemplate.grid.alwaysUseMaxColumns || lDisplayPoint.maxFixedGridColumns === undefined ) {

            lDisplayPoint.maxFixedGridColumns = lPageTemplate.grid.maxColumns;

        }

        if ( lDisplayPoint.isUnknown ) {
            lResult.isUnknown = true;
        }

        if ( lRegionId !== undefined ) {

            lRegionGridParams = getRegionGridParams( lRegionId );

            // If the top level page display point defines that there is no grid support, that will always overwrite any display point setting
            lResult.pageDisplayPointhasGridSupport = lRegionGridParams.pageDisplayPointhasGridSupport;
            lResult.hasGridSupport = ( lRegionGridParams.pageDisplayPointhasGridSupport ) ? lDisplayPoint.hasGridSupport : false;

            // The maximum columns for fixed grids is defined by the display point or the
            // parent container. But only if the grid template setting alwaysUseMaxColumns = false.
            //
            // When will alwaysUseMaxColumns = true be used for a fixed grid?
            // For example the Fluid Twitter Bootstrap needs that, because each grid container has 12 grid columns.
            // Not like normal fixed grids where we only have 12 grid columns for the whole page.
            if ( lPageTemplate.grid.type === "FIXED" && !lPageTemplate.grid.alwaysUseMaxColumns ) {

                // The defined maxColumns can be a positive absolute value or a negative value.
                // If it's negative it's used to reduce the number of fixed grid columns by the available columns in
                // the parent container but don't get below 0.
                // If it's positive absolute value we use the smaller value.
                if ( lDisplayPoint.maxFixedGridColumns < 0 ) {
                    lResult.maxColumns = Math.max( lRegionGridParams.maxColumns + lDisplayPoint.maxFixedGridColumns, 0 );
                } else if ( lDisplayPoint.maxFixedGridColumns > 0 ) {
                    lResult.maxColumns = Math.min( lDisplayPoint.maxFixedGridColumns, lRegionGridParams.maxColumns );
                } else {
                    lResult.maxColumns = lRegionGridParams.maxColumns;
                }

                // Do we have at least two columns to be able to use a grid?
                if ( lResult.maxColumns < 2 ) {
                    lResult.hasGridSupport = false;
                    debug.warn( "_getGridParams: Component %O, disable grid support because there are no more grid columns available!", this );
                }

            } else {
                lResult.maxColumns = lPageTemplate.grid.maxColumns;
            }

        } else {

            lResult.hasGridSupport                 = lDisplayPoint.hasGridSupport;
            lResult.pageDisplayPointhasGridSupport = lDisplayPoint.hasGridSupport;

            if ( lResult.hasGridSupport ) {
                lResult.maxColumns = lDisplayPoint.maxFixedGridColumns;
            }
        }

        debug.trace( "_getGridParams: Component %O returned grid params %O", this, lResult );

        return lResult;

    }

    /*
     * todo documentation
     */
    Component.prototype._setGridProperties = function( pNoTransaction ) {

        var lSelf          = this,
            lPageTemplate  = getPageTemplate(),
            lFieldTemplate,
            lIsNewColumn   = false,
            lShowItemProps = false;

        function createDeleteProperty( pPropertyId, pCreateOrDelete ) {

            if ( pCreateOrDelete ) {
                if ( !lSelf._properties.hasOwnProperty( pPropertyId )) {
                    lSelf._properties[ pPropertyId ] = new Property({
                        component:  lSelf,
                        propertyId: pPropertyId
                    });
                }

                // Page Item grid properties do have a plug-in dependency if they should be visible at all
                if ( !lSelf._properties[ pPropertyId ]._isVisible()) {
                    lSelf._deleteProperty( pPropertyId );
                }

            } else {
                lSelf._deleteProperty( pPropertyId );
            }
        }

        function getValue( pPropertyId ) {
            var lProperty = lSelf._properties[ pPropertyId ];
            if ( lProperty ) {
                return lProperty.getValue();
            } else {
                return "";
            }
        }

        function setChildComponents( pTypeId, pPropertyId ) {
            var lComponents = getComponents( pTypeId, { properties: [{ id: pPropertyId, value: lSelf.id }]});
            for ( var i = 0; i < lComponents.length; i++ ) {

                // Because we are touching a different component, we have to add it to our transaction
                if ( pNoTransaction === undefined && !lComponents[ i ].isOnGlobalPage()) {
                    addToTransaction( lComponents[ i ], OPERATION.CHANGE );
                    lComponents[ i ]._setHasChanged();
                }
                lComponents[ i ]._setGridProperties( pNoTransaction );
            }
        }

        if ( $.inArray( this.typeId, [ COMP_TYPE.REGION, COMP_TYPE.PAGE_ITEM, COMP_TYPE.BUTTON ]) !== -1 ) {

            this._grid = this._getGridParams();

            if ( this._grid.hasGridSupport ) {

                createDeleteProperty( PROP.GRID_NEW_GRID,   lPageTemplate.grid.hasNewGrid );
                createDeleteProperty( PROP.GRID_NEW_ROW,    ( !lPageTemplate.grid.hasNewGrid || getValue( PROP.GRID_NEW_GRID ) === "N" ));
                createDeleteProperty( PROP.GRID_COLUMN,     true );
                createDeleteProperty( PROP.GRID_NEW_COLUMN, ( getValue( PROP.GRID_COLUMN ) === "" && getValue( PROP.GRID_NEW_ROW ) === "N" ));

                lIsNewColumn =
                    (  getValue( PROP.GRID_NEW_GRID   ) === "Y"
                    || getValue( PROP.GRID_NEW_ROW    ) === "Y"
                    || getValue( PROP.GRID_COLUMN     ) !== ""
                    || getValue( PROP.GRID_NEW_COLUMN ) === "Y"
                    );

                createDeleteProperty( PROP.GRID_COLUMN_SPAN,        ( lIsNewColumn && lPageTemplate.grid.hasColumnSpan ));
                createDeleteProperty( PROP.GRID_COLUMN_CSS_CLASSES, ( lIsNewColumn && lPageTemplate.grid.hasColumnCssClasses ));
                createDeleteProperty( PROP.GRID_COLUMN_ATTRIBUTES,  ( lIsNewColumn && lPageTemplate.grid.hasColumnAttributes ));

            } else {

                this._deleteProperty( PROP.GRID_NEW_GRID );
                this._deleteProperty( PROP.GRID_NEW_ROW );
                this._deleteProperty( PROP.GRID_COLUMN );
                this._deleteProperty( PROP.GRID_NEW_COLUMN );
                this._deleteProperty( PROP.GRID_COLUMN_SPAN );
                this._deleteProperty( PROP.GRID_COLUMN_CSS_CLASSES );
                this._deleteProperty( PROP.GRID_COLUMN_ATTRIBUTES );

            }

            // Handle page item and button specific grid properties
            if ( this.typeId === COMP_TYPE.PAGE_ITEM || this.typeId === COMP_TYPE.BUTTON ) {
                lShowItemProps = ( this._grid.hasGridSupport && lIsNewColumn && lPageTemplate.grid.type === "TABLE" );
                createDeleteProperty( PROP.GRID_ROW_SPAN,           lShowItemProps );
                createDeleteProperty( PROP.ELEMENT_FIELD_ALIGNMENT, lShowItemProps );

                if ( this.typeId === COMP_TYPE.PAGE_ITEM ) {
                    createDeleteProperty( PROP.LABEL_ALIGNMENT,           lShowItemProps );
                    createDeleteProperty( PROP.READ_ONLY_HTML_ATTRIBUTES, ( lShowItemProps && lPageTemplate.grid.hasColumnAttributes ));

                    lFieldTemplate = getFieldTemplate( getValue( PROP.FIELD_TEMPLATE ));
                    createDeleteProperty( PROP.GRID_LABEL_COLUMN_SPAN, ( this._grid.hasGridSupport && lIsNewColumn && lFieldTemplate.hasLabelColumnSpan ));

                }
            }

            // Update all child regions, page items and buttons
            if ( this.typeId === COMP_TYPE.REGION ) {
                setChildComponents( COMP_TYPE.REGION,    PROP.PARENT_REGION );
                setChildComponents( COMP_TYPE.PAGE_ITEM, PROP.REGION );
                setChildComponents( COMP_TYPE.BUTTON,    PROP.REGION );
            }
        }

    }; // _setGridProperties


    Component.prototype._setProperties = function( pValues, pOptions ) {

        var lProperty;

        pValues = pValues || [];

        // Set all property values in the order they have been specified
        // Note: The sequential processing is important in the case of dependencies!
        for ( var i = 0; i < pValues.length; i++ ) {

            // Perform several integrity checks before we do anything
            if ( !gProperties.hasOwnProperty( pValues[ i ].id )) {
                throw "Property " + pValues[ i ].id + " doesn't exist!";
            } else if ( !this._properties.hasOwnProperty( pValues[ i ].id )) {
                throw "Property '" + gProperties[ pValues[ i ].id ].prompt + "' (" + pValues[ i ].id + ") not available for this component!";
            } else

            lProperty = this._properties[ pValues[ i ].id ];

            pValues[ i ].oldValue = lProperty._value;
            lProperty._setValue( pValues[ i ].value, pOptions );
        }
    }; // _setProperties;


    Component.prototype.getProperty = function( pId ) {

        return this._properties[ pId ];

    }; // getProperty


    Component.prototype.getProperties = function() {

        var lProperties = [];

        forEachAttribute( this._properties, function( i, pProperty ) {
            lProperties.push( pProperty );
        });

        return lProperties;

    }; // getProperties


    Component.prototype.duplicate = function( pValues ) {

        // Perform several integrity checks before we do anything
        if ( this._status === STATUS.DELETED ) {
            throw "Component has been deleted!";
        }

        return this._duplicate( pValues );

    }; // duplicate


    Component.prototype._duplicate = function( pValues, pParentId ) {

        var lType            = gTypes[ this.typeId ],
            lChildComponents = [],
            lNewComponent;

        // Duplicate the existing component
        lNewComponent = new Component({
            component:         this,
            previousComponent: this,
            values:            pValues,
            parentId:          ( pParentId || this.parentId )
        });

        // Duplicate all child components
        for ( var i = 0; i < lType.childComponentTypes.length; i++ ) {
            // Don't copy saved IR, because they are considered user data (bug #20108980)
            if ( lType.childComponentTypes[ i ] !== COMP_TYPE.IR_SAVED_REPORT ) {
                lChildComponents = getComponents( lType.childComponentTypes[ i ], { parentId: this.id }, false );
                for ( var j = 0; j < lChildComponents.length; j++ ) {
                    lChildComponents[ j ]._duplicate( undefined, lNewComponent.id );
                }
            }
        }

        return lNewComponent;

    }; // _duplicate


    Component.prototype.remove = function() {

        this._remove( false );

    }; // remove


    Component.prototype._remove = function( pChildDelete ) {

        var lType            = gTypes[ this.typeId ],
            lSelf            = this,
            lChildComponents = [],
            lRefComponents   = [],
            lPropertyDef,
            lTypePropertyDef,
            lFilter,
            lSearchValue,
            lItemNameEscaped,
            lRefProperty;

        function removePageItem( pItemNameEscaped, pValue, pMultiValueDelimiter ) {
            var lPageItems = pValue.split( pMultiValueDelimiter ),
                lRegExp    = new RegExp( "^\\s*" + pItemNameEscaped + "\\s*$", "i" ), // ignore white spaces! (use double escaping for \s because of JS escaping)
                i;

            for ( i = 0; i < lPageItems.length; i++ ) {
                if ( lRegExp.test( lPageItems[ i ] )) {
                    lPageItems.splice( i, 1 );
                    break;
                }
            }
            return lPageItems.join( pMultiValueDelimiter );
        } // removePageItem

        // Perform several integrity checks before we do anything
        if ( this._status === STATUS.DELETED ) {
            return; // it has already been delete, no need to do it again
        } else if ( gIsPageReadOnly ) {
            throw "Page is read only!";
        } else if ( this.isReadOnly()) {
            throw "Component is read only!";
        }

        // Remember current state of component which is going to be modified so that we are able to undo our operation
        addToTransaction( this, OPERATION.DELETE );

        // Delete all child components
        for ( var i = 0; i < lType.childComponentTypes.length; i++ ) {
            lChildComponents = getComponents( lType.childComponentTypes[ i ], { parentId: this.id }, false );
            for ( var j = 0; j < lChildComponents.length; j++ ) {
                lChildComponents[ j ]._remove( true );
            }
        }

        // Check all components which do reference the deleted component and process them based on their LOV delete configuration
        //   NULL    = set the relationship to NULL
        //   CASCADE = delete the component
        //   <null>  = raise an error

        // Build Options and Authorization use ! or - to negate it, we have to find those references as well
        if ( this.typeId === COMP_TYPE.BUILD_OPTION || this.typeId === COMP_TYPE.AUTHORIZATION ) {
            lSearchValue = new RegExp( "^[-!]?" + util.escapeRegExp( this.id ) + "$" );
        } else {
            lSearchValue = this.id;
        }
        if ( this.typeId === COMP_TYPE.PAGE_ITEM ) {
            lItemNameEscaped = util.escapeRegExp( this.getProperty( PROP.ITEM_NAME ).getValue());
        }

        for ( var i = 0; i < lType.refByProperties.length; i++ ) {
            lPropertyDef = gProperties[ lType.refByProperties[ i ]];

            if ( lPropertyDef.lovType === "COMPONENT" ) {
                lFilter = { properties: [{ id: lPropertyDef.id, value: lSearchValue }]};
            } else if ( lPropertyDef.type === "ITEM" ) {
                if ( lPropertyDef.multiValueDelimiter ) {
                    lFilter = { properties: [{ id: lPropertyDef.id, value: new RegExp( "(^|" + lPropertyDef.multiValueDelimiter + "|\\s)" + lItemNameEscaped + "($|" + lPropertyDef.multiValueDelimiter + "|\\s)", "i" ) }]};
                } else {
                    lFilter = { properties: [{ id: lPropertyDef.id, value: new RegExp( "^" + lItemNameEscaped + "$", "i" ) }]};
                }
            }

            for ( var j = 0; j < lPropertyDef.refByComponentTypes.length; j++ ) {

                // Only check the component type if it wasn't already checked as part of the child component types
                if ( gTypes[ lPropertyDef.refByComponentTypes[ j ]].parentId !== this.typeId ) {

                    lTypePropertyDef = gTypes[ lPropertyDef.refByComponentTypes[ j ]].properties[ lPropertyDef.id ];
                    lRefComponents = getComponents( lPropertyDef.refByComponentTypes[ j ], lFilter, false );
                    for ( var k = 0; k < lRefComponents.length; k++ ) {
                        if ( lTypePropertyDef.referenceOnDelete === "WEAK_NULL" || lTypePropertyDef.referenceOnDelete === "DB_NULL" ) {

                            lRefProperty = lRefComponents[ k ].getProperty( lPropertyDef.id );
                            if ( lPropertyDef.type === "ITEM" && lPropertyDef.multiValueDelimiter ) {
                                lRefProperty.setValue( removePageItem( lItemNameEscaped, lRefProperty.getValue(), lPropertyDef.multiValueDelimiter ));
                            } else {
                                lRefProperty.setValue( "" );
                            }

                        } else if ( lTypePropertyDef.referenceOnDelete === "WEAK_CASCADE" || lTypePropertyDef.referenceOnDelete === "DB_CASCADE" ) {

                            if ( lPropertyDef.type === "ITEM" && lPropertyDef.multiValueDelimiter ) {

                                // Remove our page item from the list, if nothing remains remove the component
                                lRefProperty = lRefComponents[ k ].getProperty( lPropertyDef.id );
                                lRefProperty.setValue( removePageItem( lItemNameEscaped, lRefProperty.getValue(), lPropertyDef.multiValueDelimiter ));
                                if ( lRefProperty.getValue() === "" ) {
                                    lRefComponents[ k ]._remove( true );
                                }

                            } else {
                                lRefComponents[ k ]._remove( true );
                            }

                        } else {
                            throw formatNoEscape( "DEL.REFERENCE_EXISTS", lRefComponents[ k ].getDisplayTitle());
                        }
                    }
                }
            }
        }

        // 1) If the component did just exist in the client side model, we will immediately delete it as it would have never existed.
        // 2) If it's a cascading delete of children, we just remove it from the client side model, because the server side logic
        //    will automatically take care of it, no need to send deletes for children.
        // 3) If the deleted component was queried from the database and is not a children, we have to mark it for deletion
        //    to synchronize it back to the server.
        if ( this._status === STATUS.CREATED || pChildDelete ) {
            delete gComponents[ this.typeId ][ this.id ];
        } else {
            this._setHasChanged({ status: STATUS.DELETED });
        }

        // Call the "removed" callback of the used plug-in.
        // This will allow a plug-in to remove child components in the model.
        lSelf._callPluginCallback({ action: CALLBACK_ACTION.REMOVED });

        // Call the "remove" callback of the component type.
        lSelf._callComponentTypeCallback({ action: CALLBACK_ACTION.REMOVED });

    }; // _remove


    Component.prototype.move = function( pPreviousComponent, pValues ) {

        // Perform several integrity checks before we do anything
        if ( this._status === STATUS.DELETED ) {
            throw "Component has already been deleted!";
        } else if ( gIsPageReadOnly ) {
            throw "Page is read only!";
        } else if ( this.isReadOnly()) {
            throw "Component is read only!";
        }

        // Remember current state of component which is going to be modified so that we are able to undo our operation
        addToTransaction( this, OPERATION.CHANGE );

        // update the parent/hierarchy properties first and then move the component to the new position
        this._setProperties( pValues );
        this._move( pPreviousComponent );

        // Let a plug-in know about changed property values, this will allow to refresh child components
        // For example if the SQL statement changes, update the report columns
        this._callPluginCallback({ properties: pValues });
        this._callComponentTypeCallback({ properties: pValues });

    }; // move


    Component.prototype._move = function( pPreviousComponent ) {

        var INCREMENT_BY = ( this.typeId === COMP_TYPE.CLASSIC_RPT_COLUMN || this.typeId === COMP_TYPE.TAB_FORM_COLUMN ) ? 1 : 10;

        var lSeqPropertyId     = gTypes[ this.typeId ].seqPropertyId,
            lPreviousComponent = pPreviousComponent,
            lSiblings,
            lLastSeq,
            lUpdate = true,
            i;

        // Get all siblings and include our own component
        // Note: If _move is called from Component, the new component will not be returned by
        //       getSiblings, because it's not yet in our component store
        lSiblings = this.getSiblings( true );

        if ( lSiblings.length > 0 && lPreviousComponent ) {

            // If we have a previous component, let's first check if it's really a sibling
            if ( lPreviousComponent instanceof Component ) {

                // Let's find our starting sequence based on our previous component
                for ( i = 0; i < lSiblings.length; i++ ) {
                    if ( lSiblings[ i ].id === lPreviousComponent.id && lSiblings[ i ].typeId === lPreviousComponent.typeId ) {
                        this.seq = lPreviousComponent.seq + INCREMENT_BY;
                        lUpdate  = false;
                        break;
                    }
                }

            }

            // If previous component is "last" we want to move our component to the end,
            // we also fallback to the last component if a non existing previous component has been passed
            if ( lPreviousComponent === "last" || lUpdate ) {
                if ( lSiblings[ lSiblings.length - 1 ].id !== this.id ) {
                    lPreviousComponent = lSiblings[ lSiblings.length - 1 ];
                    this.seq = lPreviousComponent.seq + INCREMENT_BY;
                    lUpdate  = false;
                }
            }

        }

        // No previous component found or it was undefined, let's move the current component to the beginning
        if ( lUpdate ) {
            lPreviousComponent = undefined;
            this.seq           = INCREMENT_BY;
        }

        // Let's first update our current component
        lLastSeq = this.seq;
        this._properties[ lSeqPropertyId ]._setValue( this.seq, { checkReadOnly: false });

        // And then adjust the sequence of all siblings
        for ( i = 0; i < lSiblings.length; i++ ) {
            if ( lUpdate ) {
                // If it's a read-only component (i.e. from global page), we have to reset our sequence to start from that value
                if ( lSiblings[ i ].isReadOnly()) {
                    lLastSeq = lSiblings[ i ].seq;
                } else if ( lSiblings[ i ].id !== this.id ) {
                    lLastSeq += INCREMENT_BY;
                    lSiblings[ i ].getProperty( lSeqPropertyId ).setValue( lLastSeq );
                }
            } else if ( lSiblings[ i ].id === lPreviousComponent.id ) {
                lUpdate = true;
            }
        }

    }; // _move


    Component.prototype.getSiblings = function( pIncludeSelf ) {

        var lFilters = [],
            lSiblingsFilter,
            lFilterPropertyId,
            lSiblings;

        // Components which are displayed in a display point, have to fetch all components for that display point, not
        // just the component of the current type!
        if ( $.inArray( this.typeId, [ COMP_TYPE.REGION, COMP_TYPE.PAGE_ITEM, COMP_TYPE.BUTTON ]) !== -1 ) {

            // Note: as soon as we implement display points which do support regions, page items and buttons in the same
            //       display position (currently that's only supported for page items and buttons in the BODY dp), add
            //       the commented out code
            if ( this.typeId === COMP_TYPE.REGION ) {
                // todo add && !this._properties.hasOwnProperty( PROP.REGION_POSITION ) to the above statement

                lFilters[ 0 ] = {
                    typeId: COMP_TYPE.REGION,
                    filter: {
                        properties: []
                    }
                };

                if ( this._properties.hasOwnProperty( PROP.REGION_POSITION )) {
                    lFilters[ 0 ].filter.properties.push({
                        id:    PROP.REGION_POSITION,
                        value: this._properties[ PROP.REGION_POSITION ]._value
                    });
                }
                lFilters[ 0 ].filter.properties.push({
                    id:    PROP.PARENT_REGION,
                    value: this._properties[ PROP.PARENT_REGION ]._value
                });

            } else {

                // Page Item or Button displayed next to page items
                if (  this.typeId === COMP_TYPE.PAGE_ITEM
                   || ( this.typeId === COMP_TYPE.BUTTON && this._properties[ PROP.BUTTON_POSITION ]._value === "BODY" )
                   )
                {

                    lFilters.push({
                        typeId: COMP_TYPE.PAGE_ITEM,
                        filter: {
                            parentId: this.parentId
                        }
                    });
                    lFilters.push({
                        typeId: COMP_TYPE.BUTTON,
                        filter: {
                            parentId: this.parentId,
                            properties: [{
                                id:    PROP.BUTTON_POSITION,
                                value: "BODY"
                            }]
                        }
                    });

                // Must be a region button
                } else if ( this.typeId === COMP_TYPE.BUTTON ) {

                    lFilters.push({
                        typeId: COMP_TYPE.BUTTON,
                        filter: {
                            parentId:       this.parentId,
                            filterFunction: function() {
                                return ( this.getProperty( PROP.BUTTON_POSITION ).getValue !== "BODY" )
                            }
                        }
                    });


 /* todo
                } else if ( this.typeId === COMP_TYPE.REGION ) {
                    lDisplayPosition = this._properties[ PROP.REGION_POSITION ]._value;
*/
                }

                /*
                 lFilters.push({
                 typeId: COMP_TYPE.REGION,
                 filter: {
                 properties: [
                 {
                 id:    PROP.PARENT_REGION,
                 value: xxx
                 },
                 {
                 id:    PROP.REGION_POSITION,
                 value: lDisplayPosition
                 }
                 ]
                 }
                 });

                 */

            }

            // Recalculate the sequence of the siblings which are located after the new component
            lSiblings = getComponentsAdvanced( lFilters );

        } else {

            // All components which are not displayed in a display point
            lSiblingsFilter = {
                parentId:   this.parentId,
                properties: []
            };

            if ( this.typeId === COMP_TYPE.PAGE_COMPUTATION || this.typeId === COMP_TYPE.APP_COMPUTATION ) {
                lFilterPropertyId = PROP.COMPUTATION_POINT;
            } else if ( this.typeId === COMP_TYPE.PAGE_PROCESS || this.typeId === COMP_TYPE.APP_PROCESS ) {
                lFilterPropertyId = PROP.PROCESS_POINT;
            } else if ( this.typeId === COMP_TYPE.BRANCH ) {
                lFilterPropertyId = PROP.BRANCH_POINT;
            } else if ( this.typeId === COMP_TYPE.DA_ACTION ) {
                lFilterPropertyId = PROP.FIRE_WHEN_EVENT_RESULT_IS;
            }

            if ( lFilterPropertyId ) {
                lSiblingsFilter.properties.push({
                    id:    lFilterPropertyId,
                    value: this._properties[ lFilterPropertyId ]._value
                });
            }

            // Recalculate the sequence of the siblings which are located after the new component
            lSiblings = getComponents( this.typeId, lSiblingsFilter );

        }

        if ( !pIncludeSelf ) {
            for ( var i = 0; i < lSiblings.length; i++ ) {
                if ( lSiblings[ i ].id === this.id ) {
                    lSiblings.splice( i, 1 );
                    break;
                }
            }
        }

        return lSiblings;

    }; // getSiblings


    Component.prototype.getParent = function() {

        if ( this.parentId ) {
            return getComponents( gTypes[ this.typeId ].parentId, { id: this.parentId }, false )[ 0 ];
        } else {
            return undefined;
        }

    }; // getParent


    Component.prototype.getChilds = function( pTypeId, pFilter, pSort ) {

        var lFilter = $.extend( true, {}, pFilter );

        // Return all child components of the specified type
        lFilter.parentId = this.id;
        return getComponents( pTypeId, lFilter, pSort );

    }; // getChilds


    Component.prototype.getChildrenUntil = function( pTypeId, pFilter, pSort ) {

        var lSelf   = this,
            lFilter = $.extend( true, {}, pFilter ),
            lComponents,
            lAllComponents = [];

        function getNextChildTypeId ( pTypeId ) {
            if ( gTypes[ pTypeId ].parentId === undefined ) {
                throw "Component Type Id " + pTypeId + " is not a child type of component type id " + lSelf.typeId;
            } else if ( gTypes[ pTypeId ].parentId === lSelf.typeId ) {
                return pTypeId;
            } else {
                return getNextChildTypeId( gTypes[ pTypeId ].parentId );
            }
        }

        // Return all child components of the specified type
        lFilter.parentId = lSelf.id;

        // Is the requested type a direct child of the parent?
        if ( gTypes[ pTypeId ].parentId === lSelf.typeId ) {

            return getComponents( pTypeId, lFilter, pSort );

        } else {

            // If not, get the children which get us closer to that type
            lComponents = getComponents( getNextChildTypeId( gTypes[ pTypeId ]), lFilter, pSort );
            for ( var i = 0; j < lComponents.length; i++ ) {
                lAllComponents = lAllComponents.concat( lComponents[ i ].getChildrenUntil( pTypeId, lFilter, pSort ));
            }
            return lAllComponents;
        }

    }; // getChildrenUntil


    Component.prototype.getDisplayTitle = function() {

        if ( gTypes[ this.typeId ].displayPropertyId ) {
            return formatPostfix( "POSTFIX.GLOBAL_PAGE", this.getProperty( gTypes[ this.typeId ].displayPropertyId ).getDisplayValue(), this.isOnGlobalPage());
        } else {
            return "";
        }

    }; // getDisplayTitle


    Component.prototype.setDisplayTitle = function( pTitle ) {

        return this.getProperty( gTypes[ this.typeId ].displayPropertyId ).setValue( pTitle );

    }; // getDisplayTitle


    Component.prototype._copyToGlobal = function() {

        var lSelf = this,
            lComponent = gComponents[ this.typeId ][ this.id ];

        // Note: Because someone (ie. Property Editor) could store a reference to the component
        //       we should restore just the attributes of it, otherwise it would be a new object
        //       and everybody who holds a reference would point to a different object.
        forEachAttribute( lSelf, function( pAttributeName, pAttribute ) {
            if ( pAttributeName === "_properties" ) {
                // Duplicate the properties and get new instances of them
                lComponent._properties = {};
                forEachAttribute( lSelf._properties, function( pPropertyId, pProperty ) {
                    lComponent._properties[ pPropertyId ] = new Property({
                        component:  lComponent,
                        propertyId: pProperty
                    });
                });
            } else {
                // Just copy the component attribute
                lComponent[ pAttributeName ] = lSelf[ pAttributeName ];
            }
        });
    };

    function setPageGridProperties( pNoTransaction ) {

        function setGridProperties( pTypeId, pPropertyId ) {

            var lComponents = getComponents( pTypeId, { properties: [{ id: pPropertyId, value: "" }]}, false );
            for ( var i = 0; i < lComponents.length; i++ ) {

                // Because we are touching a different component, we have to add it to our transaction
                if ( pNoTransaction === undefined && !lComponents[ i ].isOnGlobalPage()) {
                    addToTransaction( lComponents[ i ], OPERATION.CHANGE );
                }
                lComponents[ i ]._setGridProperties( pNoTransaction );
            }
        }

        // Get all regions which are not sub regions
        setGridProperties( COMP_TYPE.REGION, PROP.PARENT_REGION );

        // Get all page items which are not associated to a region
        setGridProperties( COMP_TYPE.PAGE_ITEM, PROP.REGION );

        // Get all buttons which are not associated to a region
        setGridProperties( COMP_TYPE.BUTTON, PROP.REGION );
    }; // setPageGridProperties


    /*
     * todo documentation
     */
    function getComponents( pTypeId, pFilter, pSort ) {

        var lIsPageComponent = gTypes[ pTypeId ].isPageComponent,
            lComponents = [],
            lComponent,
            lFound;
        pFilter = pFilter || {};

        for ( var lId in gComponents[ pTypeId ]) {
            if ( gComponents[ pTypeId ].hasOwnProperty( lId )) {

                lComponent = gComponents[ pTypeId ][ lId ];

                // Don't include deleted components
                if ( lComponent._status === STATUS.DELETED ) {
                    continue;
                }

                // If an id has been specified, check if it matches with the component id
                // Note: Make sure that pFilter.id is a string!
                if ( pFilter.hasOwnProperty( "id" ) && pFilter.id !== undefined && lId !== pFilter.id + "" ) {
                    continue;
                }

                // If a parent has been specified, check if it matches with the components parent
                // Note: Make sure that pFilter.parentId is a string!
                if ( pFilter.hasOwnProperty( "parentId" ) && pFilter.parentId !== undefined && lComponent.parentId !== pFilter.parentId + "" ) {
                    continue;
                }

                if ( pFilter.hasOwnProperty( "pageId" ) && pFilter.pageId !== undefined ) {
                    if ( lComponent.pageId !== pFilter.pageId ) {
                        continue;
                    }
                } else {
                    if ( lIsPageComponent && lComponent.pageId !== gCurrentPageId && !( !pFilter.excludeGlobalPage && lComponent.isOnGlobalPage())) {
                        continue;
                    }
                }
                if ( pFilter.hasOwnProperty( "hasChanged" ) && pFilter.hasChanged !== undefined && lComponent.hasChanged() !== pFilter.hasChanged ) {
                    continue;
                }

                if ( pFilter.hasOwnProperty( "hasErrors" ) && pFilter.hasErrors !== undefined && lComponent.hasErrors() !== pFilter.hasErrors ) {
                    continue;
                }

                if ( pFilter.hasOwnProperty( "hasWarnings" ) && pFilter.hasWarnings !== undefined && lComponent.hasWarnings() !== pFilter.hasWarnings ) {
                    continue;
                }

                // If we are still in the game, compare all filters with the property values of the currently processed component
                if ( pFilter.properties && pFilter.properties.length > 0 ) {
                    lFound = false;
                    for ( var i = 0; i < pFilter.properties.length; i++ ) {
                        // Check if all filters match for the current component, if not we are done with this component and don't have to check
                        // other filter values
                        lFound = false;
                        if ( lComponent._properties.hasOwnProperty( pFilter.properties[ i ].id )) {
                            if ( pFilter.properties[ i ].value instanceof RegExp ) {
                                // Use match instead of test, because the regular expression could contain the global modifier.
                                // See http://stackoverflow.com/questions/1520800/why-regexp-with-global-flag-in-javascript-give-wrong-results
                                lFound = !!lComponent._properties[ pFilter.properties[ i ].id ]._value.match( pFilter.properties[ i ].value );
                            } else {
                                lFound = ( lComponent._properties[ pFilter.properties[ i ].id ]._value == pFilter.properties[ i ].value );
                            }
                        }
                        if ( !lFound ) {
                            break;
                        }
                    }
                    if ( !lFound ) {
                        continue;
                    }
                }

                // Filter components with a filter function which gets the currently processed component as "this"
                if ( $.isFunction( pFilter.filterFunction )) {
                    if ( !pFilter.filterFunction.apply( lComponent )) {
                        continue;
                    }
                }

                // Add the component to our result set if all checks passed
                lComponents.push( lComponent );
            }
        }

        if ( pSort === true || pSort === undefined ) {

            if ( gTypes[ pTypeId ].seqPropertyId ) {
                // Sort result based on sequence and if they are equal, use id as second sort option
                lComponents.sort( function( a, b ) {
                    if ( a.seq === b.seq ) {
                        return ( padId( a.id ) > padId( b.id )) ? 1 : -1;
                    } else {
                        return a.seq - b.seq;
                    }
                });
            } else {
                // No sequence available, order by display title of the component
                lComponents.sort( function( a, b ) {
                    return a.getDisplayTitle().localeCompare( b.getDisplayTitle() );
                });
            }
        } else if ( $.isFunction( pSort )) {
            lComponents.sort( pSort );
        }

        return lComponents;

    } // getComponents


    function getComponentsAdvanced( pFilters, pSort ) {

        var lComponents = [];

        for ( var i = 0; i < pFilters.length; i++ ) {
            lComponents = lComponents.concat( getComponents( pFilters[ i ].typeId, pFilters[ i ].filter, false ));
        }

        if ( pSort === true || pSort === undefined ) {

            lComponents.sort( function( a, b ) {

                if ( gTypes[ a.typeId ].seqPropertyId && gTypes[ b.typeId ].seqPropertyId ) {
                    // Sort result based on sequence and if they are equal, use id as second sort option
                    if ( a.seq === b.seq ) {
                        return ( padId( a.id ) > padId( b.id )) ? 1 : -1;
                    } else {
                        return a.seq - b.seq;
                    }
                } else {
                    // No sequence available, order by display title of the component
                    return a.getDisplayTitle().localeCompare( b.getDisplayTitle() );
                }
            });
        } else if ( $.isFunction( pSort )) {
            lComponents.sort( pSort );
        }

        return lComponents;

    } // getComponentsAdvanced


    /*
     * todo documentation
     */
    function fullTextSearch( pText, pSource ) {

        var lProperty,
            lText,
            lHits = [];

        // If it's not already a regular expression, create a case insensitive regular expression with the passed text
        if ( pText instanceof RegExp ) {
            lText = pText;
        } else if ( pText !== "" && pText !== undefined ) {
            lText = new RegExp( util.escapeRegExp( pText ), "i" );
        } else {
            return [];
        }


        if ( pSource.hasOwnProperty( "typeId" )) {

            forEachAttribute( gComponents[ pSource.typeId ], function( pId, pComponent ) {

                // todo Do we only want to include components of the current page or from the global page as well

                // Don't include deleted components
                if ( pComponent._status !== STATUS.DELETED ) {
                    // Check if one of the properties of the current component contains the search string and if yes,
                    // add that property to our result
                    forEachAttribute( pComponent._properties, function( pPropertyId, pProperty ) {
                        if ( gProperties[ pPropertyId ].isSearchable ) {
                            // Use match instead of test, because the regular expression could contain the global modifier.
                            // See http://stackoverflow.com/questions/1520800/why-regexp-with-global-flag-in-javascript-give-wrong-results
                            if ( !!pProperty._value.match( lText )) {
                                lHits.push( pProperty );
                            }
                        }
                    });
                }
            });

        } else if ( pSource.hasOwnProperty( "properties" )) {

            // Check if one of the properties of the passed properties contains the search string and if yes,
            // add that property to our result
            for ( var i = 0; i < pSource.properties.length; i++ ) {
                lProperty = pSource.properties[ i ];
                if ( gProperties[ lProperty.id ].isSearchable ) {
                    // Use match instead of test, because the regular expression could contain the global modifier.
                    // See http://stackoverflow.com/questions/1520800/why-regexp-with-global-flag-in-javascript-give-wrong-results
                    if ( !!lProperty._value.match( lText )) {
                        lHits.push( lProperty );
                    }
                }
            }

        }


        // Sort result by component title and property display sequence
        lHits.sort( function( a, b ) {

            var aTitle = a.component.getDisplayTitle(),
                bTitle = b.component.getDisplayTitle();

            if ( aTitle === bTitle ) {
                return gTypes[ a.component.typeId ].properties[ a.id ].displaySeq - gTypes[ b.component.typeId ].properties[ b.id ].displaySeq;
            } else {
                return aTitle.localeCompare( bTitle );
            }

        });

        return lHits;

    } // fullTextSearch


    function getItemsLov( pFilters, pCallback ) {


        var lComponent,
            lComponents,
            lLovValues = [];

        if ( pFilters.type === "application" ) {

            lComponents = getComponents( COMP_TYPE.APP_ITEM );
            for ( var i = 0; i < lComponents.length; i++ ) {
                lLovValues.push( {
                    name: lComponents[ i ].getProperty( PROP.ITEM_NAME ).getValue()
                });
            }

        } else if ( pFilters.type === "page" ) {

            if ( pFilters.pageId === gCurrentPageId || pFilters.pageId === gCurrentUserInterface.globalPageId ) {

                lComponents = getComponents( COMP_TYPE.PAGE_ITEM, { pageId: pFilters.pageId });
                lLovValues  = convertComponentsToLovValues( lComponents, PROP.ITEM_LABEL, PROP.ITEM_NAME );

            } else {

                server.process (
                    "getPageItems", {
                        x01: pFilters.pageId
                    }, {
                        success: function( pData ) {

                            for ( var lItemName in pData ) {
                                lLovValues.push({
                                    name:  lItemName,
                                    label: pData[ lItemName ]
                                });
                            }
                            lLovValues.sort( function( a, b ) {
                                return a.name.localeCompare( b.name );
                            });

                            pCallback( lLovValues );
                        }
                    }
                );
                return;
            }
        } else if ( pFilters.type === "columns" ) {

            lComponent = pFilters.component;

            if ( $.inArray( lComponent.typeId, [ COMP_TYPE.REGION_PLUGIN_ATTR,
                                                 COMP_TYPE.REGION_COLUMN,
                                                 COMP_TYPE.IR_ATTRIBUTES,
                                                 COMP_TYPE.CLASSIC_REPORT,
                                                 COMP_TYPE.CLASSIC_RPT_COLUMN,
                                                 COMP_TYPE.TABULAR_FORM,
                                                 COMP_TYPE.TAB_FORM_COLUMN ]) !== -1 )
            {

                lLovValues = getRegionColumns( lComponent.parentId );

            } else if ( lComponent.typeId === COMP_TYPE.IR_COLUMN ) {

                lLovValues = getRegionColumns( lComponent.getParent().parentId );

            } else if ( lComponent.typeId === COMP_TYPE.VALIDATION ) {

                lLovValues = getRegionColumns( lComponent.getProperty( PROP.VALIDATION_REGION ).getValue() );

            } else if ( lComponent.typeId === COMP_TYPE.PAGE_PROCESS ) {

                lLovValues = getRegionColumns( lComponent.getProperty( PROP.PROCESS_REGION ).getValue() );

            } else if ( lComponent.typeId === COMP_TYPE.CHART_SERIES ) {

                lLovValues = getSqlColumnLovValues( lComponent, [ PROP.PROJECT_GANTT_SOURCE_QUERY,
                                                                  PROP.RESOURCE_GANTT_SOURCE_QUERY,
                                                                  PROP.PIE_DOUGHNUT_SOURCE_QUERY,
                                                                  PROP.DIAL_SOURCE_QUERY,
                                                                  PROP.SCATTER_SOURCE_QUERY,
                                                                  PROP.RANGE_SOURCE_QUERY,
                                                                  PROP.CANDLESTICK_SOURCE_QUERY,
                                                                  PROP.LINE_COL_BAR_STK_SOURCE_QUERY ]);

            } else if ( lComponent.typeId === COMP_TYPE.MAP_CHART_SERIES ) {

                lLovValues = getSqlColumnLovValues( lComponent, [ PROP.MAP_SOURCE_QUERY ]);

            }

        }

        if ( pCallback ) {
            pCallback( lLovValues );
        } else {
            return lLovValues;
        }

    } // getItemsLov


    function getPagesLov( pFilters, pCallback, pIncludeGlobal ) {

        server.process (
            "getPages", {
                x01: ( pIncludeGlobal ) ? "Y" : "N",
                x02: ( pFilters.show ? pFilters.show : "" ),
                x03: ( pFilters.id ? pFilters.id : "" )
            }, {
                success: pCallback
            }
        );

    } // getPagesLov


    /*
     * Transaction handling
     * todo documentation
     */
    var OPERATION = {
        CREATE: "create",
        DELETE: "delete",
        CHANGE: "change"
    };
    var gCurrentTransaction = null; // holds current transaction or null if none

    function checkPending() {
        if ( !gCurrentTransaction ) {
            throw "Start a Transaction first!";
        }
    }

    function checkFinished() {
        if ( gCurrentTransaction ) {
            throw "Finish pending Transaction first!";
        }
    }

    /**
     * Adds the given component to the transaction log.
     * @param {pComponent} Component to be stored.
     * @param {pOperation} Operation which is performed for the specified component
     */
    function addToTransaction( pComponent, pOperation ) {

        var lComponents;

        checkPending();

        lComponents = gCurrentTransaction.components;

        // Store old component in our transaction history, but only if it isn't already stored
        if ( lComponents.hasOwnProperty( pComponent.typeId ) && lComponents[ pComponent.typeId ].hasOwnProperty( pComponent.id )) {
            // Component is already in history buffer
            if ( pOperation === OPERATION.DELETE ) {
                // If the component is deleted and it has been created in the same transaction,
                // remove it from our transaction, because we don't want to restore it in an undo
                if ( lComponents[ pComponent.typeId ][ pComponent.id ].operation === OPERATION.CREATE ) {
                    delete lComponents[ pComponent.typeId ][ pComponent.id ];
                } else {
                    // If we have done a modification in the same transaction and do now delete the component,
                    // that's the operation we actually want to remember for an undo
                    lComponents[ pComponent.typeId ][ pComponent.id ].operation = pOperation;
                }
            }
        } else {
            if ( !lComponents.hasOwnProperty( pComponent.typeId )) {
                lComponents[ pComponent.typeId ] = {};
            }
            lComponents[ pComponent.typeId ][ pComponent.id ] = {
                oldComponent: null,
                newComponent: null,
                operation:    pOperation
            };
            if ( pOperation !== OPERATION.CREATE ) {
                lComponents[ pComponent.typeId ][ pComponent.id ].oldComponent = new Component({
                    component:  pComponent,
                    isDetached: true
                });
            }
        }
    }

    var transaction = (function () {

        var transaction = {

            /**
             * Iterates over the modified components and calls a function for each entry
             */
            _forEach: function( pFunction ) {

                for ( var lTypeId in this.components ) {
                    if ( this.components.hasOwnProperty( lTypeId )) {
                        for ( var lId in this.components[ lTypeId ]) {
                            if ( this.components[ lTypeId ].hasOwnProperty( lId )) {
                                pFunction.call( this.components[ lTypeId ][ lId ], lTypeId, lId );
                            }
                        }
                    }
                }
            },


            /**
             * Performs the operation specified as pOperation
             */
            _restore: function( pTypeId, pId, pOperation, pNewComponent ) {

                var lOldComponent = null;

                // Needed to compare it later in getNotification
                if ( gComponents[ pTypeId ].hasOwnProperty( pId )) {
                    lOldComponent = new Component({
                        component:  gComponents[ pTypeId ][ pId ],
                        isDetached: true
                    });
                }

                if ( pOperation === OPERATION.CREATE ) {

                    if ( pNewComponent._status === STATUS.CREATED || !gComponents[ pTypeId ].hasOwnProperty( pId )) {

                        // Add the component back to our component store, but create a copy, otherwise
                        // any future changes would affect the component stored in the history!
                        gComponents[ pTypeId ][ pId ] = new Component({
                            component:  pNewComponent,
                            isDetached: true
                        });

                    } else {

                        // Just restore the original status of the component
                        gComponents[ pTypeId ][ pId ]._status = pNewComponent._status;
                    }

                } else if ( pOperation === OPERATION.DELETE ) {

                    if ( lOldComponent._status === STATUS.CREATED ) {

                        // Remove the newly created component from our component store
                        delete gComponents[ pTypeId ][ pId ];

                    } else {

                        // Just mark it as deleted
                        gComponents[ pTypeId ][ pId ]._status = STATUS.DELETED;
                    }

                } else {

                    // Update the component back to our component store, but create a copy, otherwise
                    // any future changes would affect the component stored in the history!
                    pNewComponent._copyToGlobal();
                }

                return getNotification( lOldComponent, gComponents[ pTypeId ][ pId ] || null );

            },

            /**
             * Undo this transaction.
             */
            _undo: function () {

                var that = this,
                    lNotifications = [];

                // Restore created/updated/deleted components
                this._forEach( function( pTypeId, pId ) {

                    var lUndoOperation;

                    // Revert operation for undo
                    switch ( this.operation ) {
                        case OPERATION.CREATE: lUndoOperation = OPERATION.DELETE; break;
                        case OPERATION.DELETE: lUndoOperation = OPERATION.CREATE; break;
                        case OPERATION.CHANGE: lUndoOperation = OPERATION.CHANGE; break;
                    }

                    lNotifications.push( that._restore( pTypeId, pId, lUndoOperation, this.oldComponent ));
                });

                return lNotifications;
            },

            /**
             * Finishes a transaction and fires all the pending notifications
             * @throws {string} error message if there is no pending transaction
             */
            execute: function() {

                var lNotifications = [];

                checkPending();

                // todo provide default label

                // Generate notifications for all created/deleted or changed components
                this._forEach( function( pTypeId, pId ) {

                    // After all modifications have been performed, remember the new state of the component
                    // which is later used by undo/redo
                    if ( this.operation !== OPERATION.DELETE ) {
                        this.newComponent = new Component({
                            component:  gComponents[ pTypeId ][ pId ],
                            isDetached: true
                        });
                    }
                    lNotifications.push( getNotification( this.oldComponent, this.newComponent ));
                });

                sendNotifications( lNotifications );

                // Remove the pending transaction
                gCurrentTransaction = null;
            },

            /**
             * Undo this transaction.
             * @throws {string} error message if there is a pending transaction
             */
            undo: function () {

                checkFinished();
                sendNotifications( this._undo());
            },

            /**
             * Redo this transaction.
             * @throws {string} error message if there is a pending transaction
             */
            redo: function () {

                var that = this,
                    lNotifications = [];

                checkFinished();

                // Redo the transaction again
                this._forEach( function( pTypeId, pId ) {
                    lNotifications.push( that._restore( pTypeId, pId, this.operation, this.newComponent ));
                });

                sendNotifications( lNotifications );
            },

            /**
             * Cancels a pending transaction and rollbacks (undoes) all changes done so far
             * @throws {string} error message if there is no pending transaction
             */
            cancel: function() {

                checkPending();
                this._undo();

                // Remove the pending transaction
                gCurrentTransaction = null;
            }, // cancel

            /**
             * Return the label for this transaction
             * @return {String}
             */
            label: function () {
                return this._label;
            }

        };

        /*
         * PUBLIC APIs
         */
        return {

            /**
             * Starts and returns a new transaction.
             * @param {pWidget}
             * @param {pLabel}
             * @throws {string} error message if there is a pending transaction
             */
            start: function( pWidget, pLabel ) {
                var that;

                if ( gIsPageReadOnly ) {
                    throw "Page is read only!";
                }

                checkFinished();

                that = Object.create( transaction );
                that._label = pLabel || ""; // todo add code to create a default label probably in execute
                that.widget = pWidget; // todo currently not used but it may be useful to not send notifications to the source of the change???
                that.components = {};
                gCurrentTransaction = that;
                return that;
            }, // start

            /**
             * Builds the transaction message for the current action, component(s) and property affected
             *
             * @param  {Object} pOptions    Containing the following properties:
             *                              action :    The current action (eg CHANGE, CREATE, DELETE, DUPLICATE, MOVE )
             *                              component:  The current component, could also be the component type ID, if component is not yet known
             *                              property:   The current property
             *                              count:      The count of components affected
             * @return {String}             The localized and formatted message text.
             *
             * @function message
             **/
            message: function ( pOptions ) {

                var MULTIPLE_SUFFIX = ".MULTIPLE";

                var lComponentTxt,
                    lTypeId,
                    lMessage,
                    lOptions = $.extend( {
                        action:     "",
                        component:  null,
                        property:   null,
                        count:      1
                    }, pOptions ),
                    lKey = "TRANSACTION." + lOptions.action;

                switch( lOptions.action ) {
                    case MESSAGE_ACTION.CHANGE:
                        if ( lOptions.count === 1 ) {
                            lComponentTxt = lOptions.component.getDisplayTitle();
                        } else {
                            lComponentTxt = formatNoEscape( "MULTIPLE_COMPONENTS" );
                        }
                        lMessage = formatNoEscape( lKey, lComponentTxt, lOptions.property.getMetaData().prompt );
                        break;

                    case MESSAGE_ACTION.CREATE:
                        if ( lOptions.count === 1 ) {

                            // lOptions.component can be the typeId, in cases where the full component is not yet available
                            if ( typeof lOptions.component === "string" ) {
                                lTypeId = lOptions.component;
                            } else {
                                lTypeId = lOptions.component.typeId;
                            }
                            lComponentTxt = gTypes[ lTypeId ].title.singular;
                        } else {
                            lComponentTxt = formatNoEscape( "MULTIPLE_COMPONENTS" );    //todo improve to use component plural, if all components are the same
                        }
                        lMessage = formatNoEscape( lKey, lComponentTxt );
                        break;

                    // default applies to 'DELETE', 'DUPLICATE' and 'MOVE'
                    default:
                        if ( lOptions.count === 1 ) {
                            lComponentTxt = lOptions.component.getDisplayTitle();
                        } else {
                            lKey += MULTIPLE_SUFFIX;
                            lComponentTxt = lOptions.count;
                        }
                        lMessage = formatNoEscape( lKey, lComponentTxt );
                        break;

                }

                return lMessage;

            } // message
        };
    })();


    function getNotification( pOldComponent, pNewComponent ) {

        var lTypeDef,
            lNewProperty,
            lChildPropertyId,
            lNotification,
            lPropertyEvents;

        function addPropertyNotification( pPropertyId, pEvent ) {
            if ( pNewComponent._properties.hasOwnProperty( pPropertyId ) || pEvent === EVENT.REMOVE_PROP ) {
                // Add property to our property notification if we haven't done it so far
                if ( !lNotification.properties.hasOwnProperty( pPropertyId )) {
                    lNotification.properties[ pPropertyId ] = [];
                }
                lNotification.properties[ pPropertyId ].push( pEvent );
            }
        }

        function addNewErrorsOrWarnings( pEvent, pComponentAttr, pPropertyAttr ) {

            if ( pNewComponent[ pComponentAttr ]()) {
                lNotification.events.push( pEvent );

                // Check which properties have an error/warning for the new component
                for ( var lPropertyId in pNewComponent._properties ) {
                    if ( pNewComponent._properties.hasOwnProperty( lPropertyId )) {
                        if ( pNewComponent._properties[ lPropertyId ][ pPropertyAttr ].length > 0 ) {
                            addPropertyNotification( lPropertyId, pEvent );
                        }
                    }
                }
            }
        }

        function addPropertyErrorsOrWarnings( pEventTrue, pEventFalse, pPropertyAttr ) {
            // Have the errors/warnings changed?
            if ( pNewComponent._properties[ lPropertyId ][ pPropertyAttr ].join() !== pOldComponent._properties[ lPropertyId ][ pPropertyAttr ].join()) {
                if ( pNewComponent._properties[ lPropertyId ][ pPropertyAttr ].length === 0 ) {
                    lPropertyEvents.push( pEventFalse );
                } else {
                    lPropertyEvents.push( pEventTrue );
                }
            }
        }

        function addComponentErrorsOrWarnings( pEventTrue, pEventFalse, pComponentAttr ) {
            // Check if the component has changed it's error/warning state
            if ( pNewComponent[ pComponentAttr ]() !== pOldComponent[ pComponentAttr ]()) {
                if ( pNewComponent[ pComponentAttr ]()) {
                    lNotification.events.push( pEventTrue );
                } else {
                    lNotification.events.push( pEventFalse );
                }
            }
        }


        lNotification = {
            component:  {},
            events:     [],
            properties: {}
        };

        if ( pOldComponent === null || pOldComponent._status === STATUS.DELETED ) {

            lNotification.component = pNewComponent;
            lNotification.events.push( EVENT.CREATE );

            addNewErrorsOrWarnings( EVENT.ERRORS,   "hasErrors",   "errors" );
            addNewErrorsOrWarnings( EVENT.WARNINGS, "hasWarnings", "warnings" );

        } else if ( pNewComponent === null || pNewComponent._status === STATUS.DELETED ) {

            lNotification.component = pOldComponent;
            lNotification.events.push( EVENT.DELETE );

        } else {

            lNotification.component = pNewComponent;
            lNotification.events.push( EVENT.CHANGE );

            lTypeDef = gTypes[ pNewComponent.typeId ];

            // Does the changed component have properties which haven't been displayed before?
            // Has one of the property values changed?
            // Is one of the properties invalid?
            for ( var lPropertyId in pNewComponent._properties ) {
                if ( pNewComponent._properties.hasOwnProperty( lPropertyId )) {

                    lNewProperty    = pNewComponent._properties[ lPropertyId ];
                    lPropertyEvents = lNotification.properties[ lPropertyId ] || [];

                    // Does the old component have that property?
                    if ( !pOldComponent._properties.hasOwnProperty( lPropertyId )) {
                        lPropertyEvents.push( EVENT.ADD_PROP );

                        if ( lNewProperty.errors.length > 0 ) {
                            lPropertyEvents.push( EVENT.ERRORS );
                        }

                        if ( lNewProperty.warnings.length > 0 ) {
                            lPropertyEvents.push( EVENT.WARNINGS );
                        }

                        // If it's a property which has an impact on the GLV, send the GRID event
                        if ( pNewComponent.typeId === COMP_TYPE.PAGE && ( lPropertyId === PROP.PAGE_TEMPLATE || lPropertyId === PROP.DIALOG_TEMPLATE )) {
                            lNotification.events.push( EVENT.GRID );
                        }

                    } else {
                        // Has the value changed or have errors/warnings been added/removed?

                        if ( lNewProperty._value !== pOldComponent._properties[ lPropertyId ]._value ) {
                            lPropertyEvents.push( EVENT.CHANGE );

                            // If the property which is used as display property of the component has been changed,
                            // we have to raise the extra DISPLAY_TITLE event
                            if ( lPropertyId === lTypeDef.displayPropertyId ) {

                                lNotification.events.push( EVENT.DISPLAY_TITLE );

                                // If it's a property which has an impact on the GLV, send the GRID event
                            } else if (  ( pNewComponent.typeId === COMP_TYPE.PAGE && ( lPropertyId === PROP.PAGE_TEMPLATE || lPropertyId === PROP.DIALOG_TEMPLATE ))
                                      || ( pNewComponent.typeId === COMP_TYPE.REGION && ( lPropertyId === PROP.REGION_TEMPLATE || lPropertyId === PROP.REGION_TYPE ))
                                      )
                            {
                                lNotification.events.push( EVENT.GRID );
                            }

                            // If a different plug-in has been picked, send the meta data changed event for
                            // all properties which do depend on the plug-in configuration
                            if ( lTypeDef.pluginType && lPropertyId === lTypeDef.pluginType.typePropertyId ) {
                                for ( var i = 0; i < lTypeDef.pluginType.requiredProperties.length; i++ ) {
                                    addPropertyNotification( lTypeDef.pluginType.requiredProperties[ i ], EVENT.META_DATA );
                                }
                                addPropertyNotification( PROP.LOV_SQL, EVENT.META_DATA );
                            }


                            // If the current property is one of the relevant grid properties which has an impact on the number
                            // of displayed grid columns, we have to send the meta data changed notification, because the LOVs of
                            // "Grid Column" and "Grid Span" have to be updated
                            if (   $.inArray( pNewComponent.typeId, [ COMP_TYPE.REGION, COMP_TYPE.PAGE_ITEM, COMP_TYPE.BUTTON ]) !== -1
                                && $.inArray( lPropertyId, [ PROP.PARENT_REGION, PROP.REGION, PROP.REGION_POSITION, PROP.BUTTON_POSITION, PROP.GRID_COLUMN, PROP.GRID_COLUMN_SPAN ]) !== -1
                                )
                            {
                                addPropertyNotification( PROP.GRID_COLUMN,            EVENT.META_DATA );
                                addPropertyNotification( PROP.GRID_COLUMN_SPAN,       EVENT.META_DATA );
                                addPropertyNotification( PROP.GRID_LABEL_COLUMN_SPAN, EVENT.META_DATA );
                            }
                        }

                        // Have the errors/warnings changed?
                        addPropertyErrorsOrWarnings ( EVENT.ERRORS,   EVENT.NO_ERRORS,   "errors" );
                        addPropertyErrorsOrWarnings ( EVENT.WARNINGS, EVENT.NO_WARNINGS, "warnings" );

                        // If the current property has child properties (i.e. in case of property types OWNER, TABLE, COLUMN)
                        // we have to send the meta data changed notification, because the LOVs of those child properties have changed
                        //
                        // Note: This is done outside of the "value has changed" statement, because a property
                        //       might just be re-validated after an error -> _columns is now populated
                        if (   lTypeDef.properties[ lPropertyId ].refByChilds.length > 0
                            && (  lNewProperty._value !== pOldComponent._properties[ lPropertyId ]._value
                            || lNewProperty._columns.length > 0
                            )
                            )
                        {
                            for ( var i = 0; i < lTypeDef.properties[ lPropertyId ].refByChilds.length; i++ ) {
                                if ( lTypeDef.properties[ lPropertyId ].refByChilds[ i ].typeId === pNewComponent.typeId ) {
                                    lChildPropertyId = lTypeDef.properties[ lPropertyId ].refByChilds[ i ].id;
                                    addPropertyNotification( lChildPropertyId, EVENT.META_DATA );
                                } else {
                                    // todo: Shortcut as long as we don't have multiple property editor instances (region and IR attributes)
                                    // it is not necessary to send a meta data change if we change the sql of a region
                                }
                            }
                        }
                    }

                    // Add property to our change notification if something has changed (add_prop, remove_prop, change, ...)
                    if ( lPropertyEvents.length > 0 ) {
                        lNotification.properties[ lPropertyId ] = lPropertyEvents;
                    }
                }
            }

            // Does the old component have properties which are not visible anymore in the new component?
            for ( var lPropertyId in pOldComponent._properties ) {
                if ( pOldComponent._properties.hasOwnProperty( lPropertyId )) {
                    if ( !pNewComponent._properties.hasOwnProperty( lPropertyId )) {
                        addPropertyNotification( lPropertyId, EVENT.REMOVE_PROP );
                    }
                }
            }

            // Check if the component has changed it's error/warning state
            addComponentErrorsOrWarnings( EVENT.ERRORS,   EVENT.NO_ERRORS,   "hasErrors" );
            addComponentErrorsOrWarnings( EVENT.WARNINGS, EVENT.NO_WARNINGS, "hasWarnings" );

        }

        return lNotification;

    }; // getNotification


    function sendNotifications( pNotifications ) {

        function send() {

            var lObservers = gObservers.slice(),// create an independent copy, because some of the callbacks could modify the observer array
                i, j, k,
                lSend,
                lNotification,
                lFilter;

            for ( i = 0; i < pNotifications.length; i++ ) {
                lNotification = pNotifications[ i ];

                for ( j = 0; j < lObservers.length; j++ ) {

                    lFilter = lObservers[ j ].filter;
                    lSend   = false;

                    // Filter by component(s) or by component type
                    if ( lFilter.component ) {
                        if ( lFilter.component instanceof Component ) {
                            if (  lFilter.component.typeId === lNotification.component.typeId
                               && lFilter.component.id     === lNotification.component.id ) {
                                lSend = true;
                            }
                        } else if ( lFilter.component.typeId === lNotification.component.typeId ) {
                            lSend = true;
                        } else if ( $.inArray( lNotification.component.typeId, lFilter.component.typeIds ) !== -1 ) { // todo should be removed in favor of the array
                            lSend = true;
                        }
                    } else if ( lFilter.components ) {
                        for ( k = 0; k < lFilter.components.length; k++ ) {
                            if ( lFilter.components[ k ] instanceof Component ) {
                                if (  lFilter.components[ k ].typeId === lNotification.component.typeId
                                   && lFilter.components[ k ].id     === lNotification.component.id ) {
                                    lSend = true;
                                    break;
                                }
                            } else if ( lFilter.components[ k ].typeId === lNotification.component.typeId ) {
                                lSend = true;
                                break;
                            }
                        }
                    } else {
                        lSend = true;
                    }

                    // Is one of the specified properties in our notification?
                    if ( lSend && lFilter.properties.length > 0 ) {
                        lSend = false;
                        for ( k = 0; k < lFilter.properties.length; k++ ) {
                            if ( lNotification.properties.hasOwnProperty( lFilter.properties[ k ])) {
                                lSend = true;
                                break;
                            }
                        }
                    }

                    // Is one of the specified events in our notification?
                    if ( lSend && lFilter.events.length > 0 ) {
                        lSend = false;
                        for ( k = 0; k < lFilter.events.length; k++ ) {
                            // Check component level first
                            if ( $.inArray( lFilter.events[ k ], lNotification.events ) !== -1 ) {
                                lSend = true;
                                break;
                            }
                            // Check the events of each property
                            for ( var lPropertyId in lNotification.properties ) {
                                if ( lNotification.properties.hasOwnProperty( lPropertyId )) {
                                    if ( $.inArray( lFilter.events[ k ], lNotification.properties[ lPropertyId ] ) !== -1 ) {
                                        lSend = true;
                                        break;
                                    }
                                }
                            }
                            if ( lSend ) {
                                break;
                            }
                        }
                    }

                    // If the observer filter criteria matched to our notification,
                    // queue notification or call the callback and pass the notification as first parameter
                    if ( lSend ) {
                        if ( lObservers[ j ].sendInBulk ) {
                            lObservers[ j ].pendingNotifications.push( lNotification );
                        } else {
                            lObservers[ j ].callback.call( this, lNotification );
                        }
                    }
                }
            }

            // Send bulk notification for all observers requesting bulk notification
            for ( var i = 0; i < lObservers.length; i++ ) {
                if ( lObservers[ i ].sendInBulk && lObservers[ i ].pendingNotifications.length > 0 ) {
                    lObservers[ i ].callback.call( this, lObservers[ i ].pendingNotifications );
                    lObservers[ i ].pendingNotifications = [];
                }
            }

        } // send

        function removeObsoletes() {
            // If a component has been deleted we also want to delete it from our observer list so that the component
            // can be garbage collected
            for ( var i = 0; i < gObservers.length; i++ ) {
                if ( gObservers[ i ].filter.component instanceof Component && gObservers[ i ].filter.component._status === STATUS.DELETED ) {
                    gObservers.splice( i, 1 );
                    i--;
                }
            }
        } // removeObsoletes

        send();
        removeObsoletes();
    }; // sendNotifications


    /**
     * Returns true if the model has a pending change.
     *
     * @return {boolean}
     *
     * @function hasChanged
     * @memberOf pe
     **/
    function hasChanged() {

        for ( var lTypeId in gTypes ) {
            if ( gTypes.hasOwnProperty( lTypeId )) {
                // If the model has loaded a page, just check page components
                // If we have loaded shared components then ignore page components
                if (  (  gTypes[ lTypeId ].isPageComponent && gCurrentPageId !== undefined )
                   || (  lTypeId === COMP_TYPE.PAGE        && gCurrentPageId !== undefined )
                   || ( !gTypes[ lTypeId ].isPageComponent && gCurrentPageId === undefined )
                   )
                {
                    // todo We could optimize this check by setting a hasChanged flag on type/global level
                    for ( var lId in gComponents[ lTypeId ]) {
                        if ( gComponents[ lTypeId ].hasOwnProperty( lId ) && gComponents[ lTypeId ][ lId ].hasChanged()) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;

    }; // hasChanged


    /**
     * todo
     *
     * @return {boolean}
     *
     * @function saveChanges
     * @memberOf pe
     **/
    function saveChanges( pCallback ) {

        var lChangedComponents = {}, // index by typeId
            lHasChanged = false,
            lChangedComponent,
            lComponent;

        function addGridProperties( pChangedComponent, pComponentProperties, pAttribute ) {

            var GRID_PROPERTIES = [ PROP.GRID_NEW_GRID, PROP.GRID_NEW_ROW, PROP.GRID_COLUMN, PROP.GRID_NEW_COLUMN, PROP.GRID_COLUMN_SPAN, PROP.GRID_ROW_SPAN, PROP.GRID_COLUMN_CSS_CLASSES, PROP.GRID_COLUMN_ATTRIBUTES, PROP.GRID_LABEL_COLUMN_SPAN, PROP.LABEL_ALIGNMENT, PROP.ELEMENT_FIELD_ALIGNMENT, PROP.READ_ONLY_HTML_ATTRIBUTES ];

            if ( lComponent.hasOwnProperty( "_grid" )) {

                lChangedComponent[ pAttribute ] = [];

                for ( var i = 0; i < GRID_PROPERTIES.length; i++ ) {
                    if ( pComponentProperties.hasOwnProperty( GRID_PROPERTIES[ i ] ) ) {
                        pChangedComponent[ pAttribute ].push( GRID_PROPERTIES[ i ] );
                    }
                }
            }
        }


        for ( var lTypeId in gTypes ) {
            if ( gTypes.hasOwnProperty( lTypeId )) {
                // If the model has loaded a page, just check page components
                // If we have loaded shared components then ignore page components
                if (  (  gTypes[ lTypeId ].isPageComponent && gCurrentPageId !== undefined )
                   || (  lTypeId === COMP_TYPE.PAGE        && gCurrentPageId !== undefined )
                   || ( !gTypes[ lTypeId ].isPageComponent && gCurrentPageId === undefined )
                   )
                {
                    for ( var lId in gComponents[ lTypeId ]) {
                        if ( gComponents[ lTypeId ].hasOwnProperty( lId ) && gComponents[ lTypeId ][ lId ].hasChanged()) {

                            lComponent = gComponents[ lTypeId ][ lId ];

                            if ( lComponent.hasErrors() && lComponent._status !== STATUS.DELETED ) {
                                pCallback({
                                    error: format( "SAVE.FIX_ERRORS" )
                                });
                                return;
                            }

                            if ( !lChangedComponents.hasOwnProperty( lTypeId )) {
                                lChangedComponents[ lTypeId ] = {
                                    c: [],
                                    u: [],
                                    d: []
                                };
                            }

                            lChangedComponent = {
                                id:       lComponent.id,
                                parentId: lComponent.parentId,
                                pageId:   lComponent.pageId
                            };

                            if ( debug.getLevel() !== debug.LOG_LEVEL.OFF ) {
                                lChangedComponent.displayTitle = lComponent.getDisplayTitle();
                            }

                            // Handling of grid properties is complex and doesn't follow a simple depending-on logic, that's
                            // why it's hard for the server to automatically clear those properties. We have to provide
                            // the grid properties to the server, because the property change record just
                            // contains new or changed properties, but not removed properties.
                            addGridProperties( lChangedComponent, lComponent._properties, "gridProperties" );

                            if ( lComponent._status === STATUS.CREATED ) {

                                lChangedComponent.properties = {};
                                for ( var lPropertyId in lComponent._properties ) {
                                    if ( lComponent._properties.hasOwnProperty( lPropertyId )) {
                                        lChangedComponent.properties[ lPropertyId ] = lComponent._properties[ lPropertyId ]._value;
                                    }
                                }

                            } else if ( lComponent._status === STATUS.UPDATED ) {

                                addGridProperties( lChangedComponent, gBaseComponents[ lTypeId ][ lId ], "oldGridProperties" );

                                lChangedComponent.properties = {};
                                for ( var lPropertyId in lComponent._properties ) {
                                    if ( lComponent._properties.hasOwnProperty( lPropertyId )) {

                                        if ( !gBaseComponents[ lTypeId ][ lId ].hasOwnProperty( lPropertyId )) {
                                            // New property which didn't exist before
                                            lChangedComponent.properties[ lPropertyId ] = lComponent._properties[ lPropertyId ]._value;

                                        } else if ( gBaseComponents[ lTypeId ][ lId ][ lPropertyId ] !== lComponent._properties[ lPropertyId ]._value ) {
                                            // Changed property value
                                            lChangedComponent.properties[ lPropertyId ] = {
                                                oldValue: gBaseComponents[ lTypeId ][ lId ][ lPropertyId ],
                                                newValue: lComponent._properties[ lPropertyId ]._value
                                            };
                                        }
                                    }
                                }
                                // todo only transmit components where properties.length > 0 or grid properties have changed!
                            }

                            lChangedComponents[ lTypeId ][ lComponent._status ].push( lChangedComponent );
                            lHasChanged = true;
                        }
                    }
                }
            }
        }

        if ( lHasChanged ) {

            debug.trace( "saveChanges: modified components %0", lChangedComponents );

            server.process (
                "writePageData", {
                    x01: gCurrentAppId,
                    x02: gCurrentPageId,
                    f01: JSON.stringify( lChangedComponents )
                }, {
                    success: function( pData ) {
                        saveChangesResponse( pData, lChangedComponents, pCallback );
                    },
                    error: function( pjqXHR, pTextStatus, pError ) {
                        pCallback({
                            error: pError
                        });
                    }
                });

        } else {
            pCallback({
                error: "NO_CHANGES"
            });
        }

    }; // saveChanges


    function saveChangesResponse( pData, pChangedComponents, pCallback ) {

        var lNotifications = [];

        function errors( pComponent ) {

            var lOldComponent,
                lPropertyId,
                lErrors;

            lErrors = {};
            lOldComponent = new Component({
                component:  gComponents[ pComponent.typeId ][ pComponent.id ],
                isDetached: true
            });

            // Get a list of error messages for each property of the current component
            for ( var i = 0; i < pComponent.errors.length; i++ ) {
                if ( pComponent.errors[ i ].hasOwnProperty( "propertyId" )) {
                    lPropertyId = pComponent.errors[ i ].propertyId;
                } else {
                    // Error messages on component level should be added to the identifying property of the component
                    lPropertyId = gTypes[ pComponent.typeId ].displayPropertyId;
                }
                if ( !lErrors.hasOwnProperty( lPropertyId )) {
                    lErrors[ lPropertyId ] = [];
                }
                lErrors[ lPropertyId ].push( pComponent.errors[ i ].message );
            }

            // Add all property error messages to our global component array
            forEachAttribute( lErrors, function( pPropertyId, pError ) {
                if ( gComponents[ pComponent.typeId ][ pComponent.id ]._properties.hasOwnProperty( pPropertyId )) {
                    gComponents[ pComponent.typeId ][ pComponent.id ]._properties[ pPropertyId ].errors = pError;
                } else {
                    throw "Error reported for property id " + pPropertyId + " which doesn't exist for current component!";
                }
            });

            // Restore a deleted component if it has errors, otherwise we wouldn't be able to display the error message
            if ( gComponents[ pComponent.typeId ][ pComponent.id ]._status === STATUS.DELETED ) {
                gComponents[ pComponent.typeId ][ pComponent.id ]._status = STATUS.UNCHANGED;
            }

            lNotifications.push( getNotification( lOldComponent, gComponents[ pComponent.typeId ][ pComponent.id ]));
        }; // errors


        function refreshComponent( pTypeId, pComponents ) {

            var lComponent,
                lOldComponent,
                lNewComponent;

            for ( var i = 0; i < pComponents.length; i++ ) {
                lComponent = pComponents[ i ];

                lOldComponent = new Component({
                    component:  gComponents[ pTypeId ][ lComponent.id ],
                    isDetached: true
                });

                lNewComponent = new Component({
                    typeId:     pTypeId,
                    component:  lComponent,
                    isDetached: true
                });
                lNewComponent._setGridProperties( true );

                // Update the component list with the newest server values
                lNewComponent._copyToGlobal();

                // Store the new baseline for the component property values
                saveBaseComponent( gComponents[ pTypeId ][ lComponent.id ]);

                // Let everybody know about changed server side property values
                lNotifications.push( getNotification( lOldComponent, gComponents[ pTypeId ][ lComponent.id ]));
            }
        };


        function deleteComponents( pTypeId, pComponents ) {

            for ( var i = 0; i < pComponents.length; i++ ) {
                // If we have successfully deleted the component from the server, it's time to remove it from the client as well
                if ( gComponents[ pTypeId ][ pComponents[ i ].id ]._status === STATUS.DELETED ) {

                    delete gComponents[ pTypeId ][ pComponents[ i ].id ];
                    // todo remove baseComponents entry
                }
            }

        };

        if ( pData.errors ) {

            errors( pData );

        } else {

            // refresh all created/updated components with the server side properties
            forEachAttribute( pData, refreshComponent );

            // remove all deleted components from our internal arrays
            forEachAttribute( pChangedComponents, function( pTypeId, pData ) {
                if ( pData.hasOwnProperty( STATUS.DELETED )) {
                    deleteComponents( pTypeId, pData[ STATUS.DELETED ] );
                }
            });

        }
        sendNotifications( lNotifications );

        if ( pData.errors ) {
            pCallback({
                error: format( "SAVE.FAILED" )
            });
        } else {
            pCallback({});
        }

    }; // saveChangesResponse


    function saveBaseComponent( pComponent ) {

        function savePropertyValue( pPropertyId, pProperty ) {
            gBaseComponents[ pComponent.typeId ][ pComponent.id ][ pPropertyId ] = pProperty._value;
        };

        gBaseComponents[ pComponent.typeId ][ pComponent.id ] = {};

        // Copy all property values
        forEachAttribute( gComponents[ pComponent.typeId ][ pComponent.id ]._properties, savePropertyValue );

    }; // saveBaseComponent

    function saveBaseComponents() {

        function saveComponent( pId, pComponent ) {
            saveBaseComponent( pComponent );
        };

        // Remember the base line of all component types and components
        forEachAttribute( gComponents, function( pTypeId, pComponents ) {
            gBaseComponents[ pTypeId ] = {};
            forEachAttribute( pComponents, saveComponent );
        });

    }; // saveBaseComponents


    /*
     * Attempt to lock the current page on behalf of the current user with the given comment.
     * The page must not currently be locked by anyone.
     * Returns a deferred. If the page is successfully locked the deferred is resolved with no arguments.
     * If the page cannot be locked the deferred is rejected with the reason as parameter.
     */
    function lockPage( pComment ) {

        var lDeferred = $.Deferred();

        server.process (
            "lockPage", {
                x01: gCurrentAppId,
                x02: gCurrentPageId,
                x03: pComment
            }, {
                success: function( pData ) {
                    gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ]._lock = pData;

                    if ( pData.isLockedByCurrentUser ) {
                        gIsPageReadOnly = false;
                        lDeferred.resolve( pData );
                    } else {
                        // If the user has already started to modify the page, we have to continue to allow that.
                        // The user wouldn't be happy if we discard all his changes, because he could also ask the other
                        // user to unlock the page and they try a save again.
                        gIsPageReadOnly = !hasChanged();
                        lDeferred.reject( format( "LOCKED.BY_OTHER_USER", pData.owner ));
                    }
                }
            });

        return lDeferred.promise();

    }; // lockPage


    /*
     * Attempt to unlock the current page on behalf of the current user.
     * The current user must have the lock on the current page.
     * Returns a deferred. If the page is successfully unlocked the deferred is resolved with no arguments.
     * If the page cannot be unlocked the deferred is rejected with the reason as parameter.
     */
    function unlockPage() {

        var lDeferred = $.Deferred(),
            lLockState = getPageLockState();

        if ( !lLockState ) {

            lDeferred.reject( "Page is already unlocked!" ); // todo NLS do we really have to translate this? -> Implementation error

        } else if ( !lLockState.isLockedByCurrentUser ) {

            lDeferred.reject( "Page not locked by current user!" ); // todo NLS do we really have to translate this? -> Implementation error

        } else {

            server.process (
                "unlockPage", {
                    x01: gCurrentAppId,
                    x02: gCurrentPageId
                }, {
                    success: function( pData ) {
                        if ( pData.status === "OK" ) {
                            gIsPageReadOnly = false;
                            gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ]._lock = false;
                            lDeferred.resolve();
                        } else {
                            // If the user has already started to modify the page, we have to continue to allow that.
                            gIsPageReadOnly = !hasChanged();
                            lDeferred.reject( pData.reason );
                        }
                    }
                }
            );

        }

        return lDeferred.promise();

    }; // unlockPage


    function getPageLockState() {

        return gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ]._lock;

    }; // getPageLockState


    /*
     * PUBLIC APIs
     */
    return {
        COMP_TYPE:        COMP_TYPE,
        PROP:             PROP,
        PROP_TYPE:        PROP_TYPE,
        EVENT:            EVENT,
        CALLBACK_ACTION:  CALLBACK_ACTION,
        MESSAGE_ACTION:   MESSAGE_ACTION,
        Component:        Component,
        getComponents:    getComponents,
        getComponentsAdvanced: getComponentsAdvanced,
        fullTextSearch:   fullTextSearch,
        getItemsLov:      getItemsLov,
        getPagesLov:      getPagesLov,
        transaction:      transaction,
        hasChanged:       hasChanged,
        saveChanges:      saveChanges,
        getPageLockState: getPageLockState,
        lockPage:         lockPage,
        unlockPage:       unlockPage,
        getTemplateOptions: getTemplateOptions,
        getTheme:           getTheme,
        getRegionTemplate:  getRegionTemplate,
        enquoteIdentifier:  enquoteIdentifier,

        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function setStaticData
         * @memberOf pe
         **/
        setStaticData: function( pData ) {

            pData = $.extend( true, {
                displayGroups:    {},
                properties:       {},
                componentTypes:   {},
                plugins:          {},
                pluginCategories: {},
                events: {
                    browser:   [],
                    apex:      [],
                    component: [],
                    custom:    [],
                    lookupMap: {}
                },
                text: {},
                formatMasks: {
                    numbers: [],
                    dates:   []
                }
            }, pData );

            gDisplayGroups    = pData.displayGroups;
            gProperties       = pData.properties;
            gTypes            = pData.componentTypes;
            gPluginCategories = pData.pluginCategories;
            gEvents           = pData.events;
            gFormatMasks      = pData.formatMasks;

            // Merge the native plug-ins into our property configuration
            mergePlugins( pData.plugins, "%0" );

        }, // setStaticData

        /**
         * todo documentation
         * Note: setSharedComponentData has to be called first.
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function setSharedComponentData
         * @memberOf pe
         **/
        setSharedComponentData: function( pData ) {

            $.extend( true, { plugins: {}}, pData );

            gSharedComponents = pData;

            // Set the session specific create/edit/copyUrls (because of checksums) for component types
            for ( var i in gSharedComponents.componentTypes ) {
                if ( gSharedComponents.componentTypes.hasOwnProperty( i )) {
                    gTypes[ i ].createUrl = gSharedComponents.componentTypes[ i ].createUrl;
                    gTypes[ i ].editUrl   = gSharedComponents.componentTypes[ i ].editUrl;
                    gTypes[ i ].copyUrl   = gSharedComponents.componentTypes[ i ].copyUrl;
                }
            }

            // Initialize some of the possible null values
            for ( var i in gSharedComponents.userInterfaces ) {
                if ( gSharedComponents.userInterfaces.hasOwnProperty( i )) {

                    gSharedComponents.userInterfaces[ i ].id = i;
                    simpleExtend( gSharedComponents.userInterfaces[ i ], {
                        globalPageId: ""
                    });
                }
            }

            // Merge the application plug-ins into our property configuration
            mergePlugins( pData.plugins, lang.getMessage( "MODEL.POSTFIX.PLUGIN" ));

            // Region and Field templates contain a default "No Template" template. But because JSON doesn't support an
            // empty object attribute name we have to map it on the server to "0", but we actually want to store it under "".
            for ( var i in gSharedComponents.themes ) {
                if ( gSharedComponents.themes.hasOwnProperty( i )) {

                    gSharedComponents.themes[ i ].templates[ COMP_TYPE.REGION_TEMPLATE ][ "" ] = gSharedComponents.themes[ i ].templates[ COMP_TYPE.REGION_TEMPLATE ][ "0" ];
                    delete gSharedComponents.themes[ i ].templates[ COMP_TYPE.REGION_TEMPLATE ][ "0" ];

                    gSharedComponents.themes[ i ].templates[ COMP_TYPE.FIELD_TEMPLATE ][ "" ] = gSharedComponents.themes[ i ].templates[ COMP_TYPE.FIELD_TEMPLATE ][ "0" ];
                    delete gSharedComponents.themes[ i ].templates[ COMP_TYPE.FIELD_TEMPLATE ][ "0" ];

                    // Make sure that we always have a default value, this will simplify the code using those defaults.
                    simpleExtend( gSharedComponents.themes[ i ].defaultTemplates, {
                        page:       "",
                        dialog:     "",
                        region:     "",
                        field:      "",
                        button:     "",
                        report:     "",
                        ir:         "",
                        list:       "",
                        breadcrumb: "",
                        calendar:   ""
                    });
                }
            }

            // After the static and shared component data has been loaded, generate additional lookup arrays
            initializeArrays();
            generateCrossReferences();

            $( document ).trigger( "modelConfigLoaded" )

            // Add all shared components to our model
            for ( var lTypeId in pData.components ) {
                if ( pData.components.hasOwnProperty( lTypeId )) {

                    // Copy all components
                    for ( var i = 0; i < pData.components[ lTypeId ].length; i++ ) {

                        // Add the final component to our component store
                        new Component({
                            typeId:    lTypeId,
                            component: pData.components[ lTypeId ][ i ]
                        });
                    }
                }
            }

        }, // setSharedComponentData


        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function setComponentData
         * @memberOf pe
         **/
        setComponentData: function( pData ) {

            var lComponents,
                lProperty;

            for ( var lTypeId in pData ) {
                if ( pData.hasOwnProperty( lTypeId )) {

                    // Copy all components
                    for ( var i = 0; i < pData[ lTypeId ].length; i++ ) {

                        // Add the final component to our component store
                        new Component({
                            typeId:    lTypeId,
                            component: pData[ lTypeId ][ i ]
                        });
                    }
                }
            }

        }, // setComponentData


        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function setComponentTypeCallback
         * @memberOf pe
         **/
        setComponentTypeCallback: function( pComponentTypeId, pCallback ) {

            gTypes[ pComponentTypeId ].callback = pCallback;

        }, // setComponentTypeCallback

        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function setPluginCallback
         * @memberOf pe
         **/
        setPluginCallback: function( pComponentTypeId, pPluginName, pCallback ) {

            gTypes[ pComponentTypeId ].pluginType.plugins[ pPluginName ].callback = pCallback;

        }, // setPluginCallback

        /**
         * Function returns the page template of the current page.
         *
         * @return {Object}
         *
         * @function getPageTemplate
         * @memberOf pe
         **/
        getPageTemplate: getPageTemplate,


        /**
         * Function returns the navigation list template id of the current page.
         *
         * @return {Object}
         *
         * @function getNavListTemplateId
         * @memberOf pe
         **/
        getNavListTemplateId: function() {

            var lPage = gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ],
                lTemplateId = "";

            if ( !isGlobalPage() && lPage.getProperty( PROP.PAGE_NAVIGATION_TYPE ).getValue() === "L" ) {

                // Get the used navigation list template of the current page. If no template is defined on page level,
                // we have to get it from the user interface
                if ( lPage.getProperty( PROP.NAVIGATION_LIST_TEMPLATE ) ) {
                    lTemplateId = lPage.getProperty( PROP.NAVIGATION_LIST_TEMPLATE ).getValue();
                } else if ( gCurrentUserInterface.navList ) {
                    lTemplateId = gCurrentUserInterface.navList.templateId || "";
                }
            }
            return lTemplateId;

        }, // getNavListTemplateId,


        /**
         * Function returns the navigation list id of the current page.
         *
         * @return {Object}
         *
         * @function getNavListId
         * @memberOf pe
         **/
        getNavListId: function() {

            var lPage = gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ],
                lId = "";

            if ( !isGlobalPage() && lPage.getProperty( PROP.PAGE_NAVIGATION_TYPE ).getValue() === "L" ) {

                // Get the used navigation list of the current page. If no list is defined on page level,
                // we have to get it from the user interface
                if ( lPage.getProperty( PROP.NAVIGATION_LIST ) ) {
                    lId = lPage.getProperty( PROP.NAVIGATION_LIST ).getValue();
                } else if ( gCurrentUserInterface.navList ) {
                    lId = gCurrentUserInterface.navList.listId || "";
                }
            }
            return lId;

        }, // getNavListId,


        /**
         * Function returns the tab set id of the current page.
         *
         * @return {Object}
         *
         * @function getTabSetId
         * @memberOf pe
         **/
        getTabSetId: function() {

            var lPage = gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ],
                lId = "";

            if ( !isGlobalPage() && lPage.getProperty( PROP.PAGE_NAVIGATION_TYPE ).getValue() === "T" ) {

                lId = lPage.getProperty( PROP.STANDARD_TAB_SET ).getValue();

            }
            return lId;

        }, // getTabSetId,


        /**
         * Function returns all region templates of the current theme.
         *
         * @return {Object}
         *
         * @function getRegionTemplates
         * @memberOf pe
         **/
        getRegionTemplates: function() {

            return getTheme().templates[ COMP_TYPE.REGION_TEMPLATE ];

        }, // getRegionTemplates


        /**
         * Function returns all button templates of the current theme.
         *
         * @return {Object}
         *
         * @function getButtonTemplates
         * @memberOf pe
         **/
        getButtonTemplates: function() {

            return getTheme().templates[ COMP_TYPE.BUTTON_TEMPLATE ];

        }, // getButtonTemplates


        /**
         * Function returns the icon configuration of the current theme.
         *
         * @return {Object}
         *
         * @function getThemeIcons
         * @memberOf pe
         **/
        getThemeIcons: function() {

            return getTheme().icons || {};

        }, // getThemeIcons

        /**
         * Function returns the parsing schema of the current application.
         *
         * @return {String}
         *
         * @function getParsingSchema
         * @memberOf pe
         **/
        getParsingSchema: function() {

            return gSharedComponents.parsingSchema;

        }, // getParsingSchema

        /**
         * Function returns the primary language of the current application.
         *
         * @return {String}
         *
         * @function getPrimaryLanguage
         * @memberOf pe
         **/
        getPrimaryLanguage: function() {

            return gSharedComponents.primaryLanguage;

        }, // getPrimaryLanguage

        /**
         * Function returns the display group identified by pId.
         *
         * @param {Number} pId Id of the display group which should be returned
         *
         * @return {Object}
         *
         * { name: <name of display group>,
         *   title: <title of display group> },
         *
         * @function getDisplayGroup
         * @memberOf pe
         **/
        getDisplayGroup: function( pId ) {

            return gDisplayGroups[ pId ];

        }, // getDisplayGroup


        /**
         * Function returns the component type identified by pTypeId.
         *
         * @param {Number} pTypeId Id of the component type which should be returned
         *
         * @return {Object}
         *
         * { name: <name of component type>,
         *   title: {
         *     singular: <singular title>,
         *     plural:   <plural title>
         *   }
         * },
         *
         * @function getComponentType
         * @memberOf pe
         **/
        getComponentType: function( pTypeId ) {

            return gTypes[ pTypeId ];

        }, // getComponentType


        /**
         * Function returns the property identified by pPropertyId.
         *
         * @param {Number} pPropertyId Id of the property id which should be returned
         *
         * @return {Object}
         *
         * @function getProperty
         * @memberOf pe
         **/
        getProperty: function( pPropertyId ) {

            return gProperties[ pPropertyId ];

        }, // getProperty


        /**
         * Function returns the plug-in property identified by Plugin Name and Attribute No.
         *
         * @param {String} pComponentTypeId Component Type Id of the plug-in. For example COMP_TYPE.REGION, ...
         * @param {String} pName Name of the plug-in
         * @param {Number} pAttributeNo Number of the plug-in Custom Attribute
         *
         * @return {Object}
         *
         * @function getPluginProperty
         * @memberOf pe
         **/
        getPluginProperty: function( pComponentTypeId, pPlugin, pAttributeNo ) {

            // Region type plug-ins have stored their properties in the region plugin attributes type.
            var NAME = ( pComponentTypeId === COMP_TYPE.REGION ? COMP_TYPE.REGION_PLUGIN_ATTR : pComponentTypeId ) + "_" + pPlugin + "_" + pAttributeNo;

            // todo should be optimized to have a lookup map
            for ( var lPropertyId in gProperties ) {
                if ( gProperties.hasOwnProperty( lPropertyId )) {
                    if ( gProperties[ lPropertyId ].name === NAME ) {
                        return gProperties[ lPropertyId ];
                    }
                }
            }
            return undefined;

        }, // getPluginProperty


        /**
         * Function returns the LOV display title of a LOV identified by component type, property and LOV value.
         *
         * @param {Number} pComponentTypeId Id of the component type
         * @param {Number} pPropertyId Id of the property
         * @param {Number} pLovValue LOV return value which is used to lookup the display title
         *
         * @return {String}
         *
         * @function getLovTitle
         * @memberOf pe
         **/
        getLovTitle: function( pComponentTypeId, pPropertyId, pLovValue ) {

            var lTitle       = gTypes[ pComponentTypeId ].properties[ pPropertyId ].nullText || "",
                lPropertyDef = gProperties[ pPropertyId ],
                i;

            if ( lPropertyDef.lovType === "STATIC" ) {

                if ( lPropertyDef.lovValuesMap.hasOwnProperty( pLovValue )) {
                    lTitle = lPropertyDef.lovValues[ lPropertyDef.lovValuesMap[ pLovValue ]].d;
                }

            } else if ( lPropertyDef.lovType === "EVENTS" ) {

                if ( gEvents.lookupMap.hasOwnProperty( pLovValue )) {
                    lTitle = gEvents.lookupMap[ pLovValue ].d;
                }

            }

            return lTitle;

        }, // getLovTitle


        /**
         * Function returns the components which have an attribute which has an error. todo
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function getInvalidComponents
         * @memberOf pe
         **/
        getErrorComponents: function() {

            var lResults = {},
                lComponents;

            // Check each component type if it contains invalid components
            for ( var i in gTypes ) {
                if ( gTypes.hasOwnProperty( i )) {
                    lComponents = getComponents( i, { hasErrors: true });

                    // Only add the component type if we have a hit for that type
                    if ( lComponents.length > 0 ) {
                        lResults[ i ] = lComponents;
                    }
                }
            }

            return lResults;

        }, // getErrorComponents


        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function observer
         * @memberOf pe
         **/
        observer: function( pWidget, pFilter, pCallback, pSendInBulk ) {

            gObservers.push({
                widget:               pWidget,
                filter:               $.extend({}, { properties: [], events: []}, pFilter ),
                callback:             pCallback,
                sendInBulk:           pSendInBulk,
                pendingNotifications: []
            });

        }, // observer


        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function unobserver
         * @memberOf pe
         **/
        unobserver: function( pWidget, pFilter, pCallback ) {

            var lFilter,
                lRemove;

            for ( var i = 0; i < gObservers.length; i++ ) {
                if ( gObservers[ i ].widget === pWidget ) {

                    lFilter = gObservers[ i ].filter;

                    // Filter by component or by component type
                    if ( pFilter.hasOwnProperty( "component" )) {
                        if ( pFilter.component instanceof Component && lFilter.component instanceof Component ) {
                            if (  pFilter.component.typeId === lFilter.component.typeId
                               && pFilter.component.id     === lFilter.component.id ) {
                                lRemove = true;
                            }
                        } else if ( pFilter.component.typeId === lFilter.component.typeId ) {
                            lRemove = true;
                        }
                    } else {
                        lRemove = true;
                    }

                    // If properties have been specified we check them, otherwise we remove the observer independent of the set properties
                    if ( lRemove && pFilter.hasOwnProperty( "properties" )) {
                        lRemove = ( lFilter.properties.join( "," ) === pFilter.properties.join( "," ));
                    }

                    // If events have been specified we check them, otherwise we remove the observer independent of the set events
                    if ( lRemove && pFilter.hasOwnProperty( "events" )) {
                        lRemove = ( lFilter.events.join( "," ) === pFilter.events.join( "," ));
                    }

                    // If a callback function has been specified, we can check that as well
                    if ( lRemove && pCallback ) {
                        lRemove = ( gObservers[ i ].callback === pCallback );
                    }

                    if ( lRemove ) {
                        gObservers.splice( i, 1 );
                        i--;
                    }
                }
            }
        }, // unobserver


        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function setCurrentPageId
         * @memberOf pe
         **/
        setCurrentAppId: function( pAppId ) {

            gCurrentAppId = pAppId;

        }, // setCurrentAppId


        /**
         * todo documentation
         *
         * @return {String}
         *
         * { ... },
         *
         * @function getCurrentAppId
         * @memberOf pe
         **/
        getCurrentAppId: function() {

            return gCurrentAppId;

        }, // getCurrentAppId


        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function setCurrentPageId
         * @memberOf pe
         **/
        setCurrentPageId: function( pPageId ) {

            var lPageLock = gComponents[ COMP_TYPE.PAGE ][ pPageId ]._lock;

            gCurrentPageId        = pPageId + "";
            gCurrentUserInterface = gSharedComponents.userInterfaces[ gComponents[ COMP_TYPE.PAGE ][ gCurrentPageId ].getProperty( PROP.USER_INTERFACE ).getValue()];
            if ( !gOptions.isReadOnly && ( lPageLock === false || lPageLock.isLockedByCurrentUser )) {
                gIsPageReadOnly = false;
            } else {
                gIsPageReadOnly = true;
            }

            setPageGridProperties( true );

            // todo should that be really here?
            saveBaseComponents();

        }, // setCurrentPageId


        /**
         * todo documentation
         *
         * @return {String}
         *
         * { ... },
         *
         * @function getCurrentPageId
         * @memberOf pe
         **/
        getCurrentPageId: function() {

            return gCurrentPageId;

        }, // getCurrentPageId


        /**
         * todo documentation
         *
         * @return {String}
         *
         * { ... },
         *
         * @function getGlobalPageId
         * @memberOf pe
         **/
        getGlobalPageId: function() {

            return gCurrentUserInterface.globalPageId;

        }, // getGlobalPageId


        /**
         * Returns true if the currently is a global page.
         *
         * @return {boolean}
         *
         * @function isGlobalPage
         * @memberOf pe
         **/
        isGlobalPage: isGlobalPage,


        /**
         * Returns true if the current page is read only. This could be because somebody else locked it or because
         * we don't have the necessary privileges.
         *
         * @return {boolean}
         *
         * @function isPageReadOnly
         * @memberOf pe
         **/
        isPageReadOnly: function() {

            return gIsPageReadOnly;

        }, // isPageReadOnly


        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function clear
         * @memberOf pe
         **/
        clear: function() {

            gDisplayGroups    = undefined;
            gProperties       = undefined;
            gTypes            = undefined;
            gPluginCategories = undefined;
            gEvents           = undefined;
            gFormatMasks      = undefined;
            gSharedComponents = undefined;
            gComponents       = {};
            gBaseComponents   = {};
            gCurrentAppId     = undefined;
            gCurrentPageId    = undefined;
            gCurrentUserInterface = undefined;
            gIsPageReadOnly       = true;

            // Remove all observers which listen for specific components
            for ( var i = 0; i < gObservers.length; i++ ) {
                if ( gObservers[ i ].filter.component instanceof Component ) {
                    gObservers.splice( i, 1 );
                    i--;
                }
            }

        }, // clear


        /**
         * todo documentation
         *
         * @return {Object}
         *
         * { ... },
         *
         * @function init
         * @memberOf pe
         **/
        init: function( pOptions ) {

            gOptions = pOptions;

        }, // init


        /**
         * todo To be removed, just for debugging purpose
         **/
        getAll: function() {

            return { displayGroups:    gDisplayGroups,
                     properties:       gProperties,
                     componentTypes:   gTypes,
                     pluginCategories: gPluginCategories,
                     sharedComponents: gSharedComponents,
                     components:       gComponents,
                     baseComponents:   gBaseComponents,
                     observers:        gObservers
            };

        }
    };

})( apex.jQuery, apex.util, apex.locale, apex.lang, apex.server, apex.debug );

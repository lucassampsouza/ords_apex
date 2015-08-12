/*global apex,pe,gPreferences*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * This module is part of the page designer and contains the controller logic for the Property Editor.
 **/

(function( model, $, debug, lang, util, pd, nav, server, undefined ) {
    "use strict";

    // General globals
    var pe$, gShowing, gShowAll$, gShowCommon$, gFontAwesome$,
        gLastComponents = null;

    // General constants
    var PE_WIDGET_NAME = "property_editor",
        SHOW_ALL = "A",
        SHOW_COMMON = "C";

    // CSS class constants
    var PROPERTY =                              "a-Property",
        PROPERTY_FIELD =                        PROPERTY + "-field",
        PROPERTY_FIELD_TEXT =                   PROPERTY_FIELD + "--text",
        PROPERTY_FIELD_CONTAINER =              PROPERTY + "-fieldContainer",
        PROPERTY_SET_ITEMS_HEADER_HEADER =      PROPERTY + "-setItemsHeader-header",
        PROPERTY_SET_ITEMS_TABLE =              PROPERTY + "-setItemsTable",
        PROPERTY_SET_ITEMS_TABLE_REMOVE_COL =   PROPERTY_SET_ITEMS_TABLE + "-removeCol",
        IS_ACTIVE =                             "is-active",
        BUTTON =                                "a-Button",
        BUTTON_PROPERTY =                       "a-Property-button",
        BUTTON_HOT =                            BUTTON + "--hot",
        BUTTON_FORCE_WRAP =                     BUTTON + "--forceWrap",
        LINK_DIALOG_ITEM_NAME =                 "linkDlgItemName",
        LINK_DIALOG_ITEM_VALUE =                "linkDlgItemValue",
        LINK_DIALOG_SET_ITEMS_ROW_DATA =        "linkDlgSetItemsRowData",
    // icons
        ICON =                                  "a-Icon",
        ICON_REMOVE =                           ICON + " icon-remove",
        ICON_LOV =                              ICON + " icon-popup-lov",
        ICON_GO_TO_COMPONENT =                  ICON + " icon-go-to-component",
    // utility classes
        VISUALLY_HIDDEN =                       "u-VisuallyHidden",
        DIALOG_FLUSH_BODY =                     "ui-dialog-flushBody";

    // Property type constants
    var PROP_TYPE = {
        // xxx APEX specific many are based on the above basic ones with perhaps some extra validation
        // consider separating validation from rendering
        CSS: "CSS",
        JAVASCRIPT: "JAVASCRIPT",
        HTML: "HTML",
        COMPONENT: "COMPONENT",
        LINK: "LINK",
        ITEM: "ITEM",
        PAGE: "PAGE",
        PLSQL: "PLSQL",
        PLSQL_EXPR_VARCHAR: "PLSQL EXPRESSION VARCHAR2",
        PLSQL_EXPR_BOOLEAN: "PLSQL EXPRESSION BOOLEAN",
        PLSQL_FUNC_VARCHAR: "PLSQL FUNCTION BODY VARCHAR2",
        PLSQL_FUNC_BOOLEAN: "PLSQL FUNCTION BODY BOOLEAN",
        SQL: "SQL",
        SQL_EXPR: "SQL EXPRESSION",
        SUBSCRIPTION: "SUBSCRIPTION",
        SUPPORTED_UI: "SUPPORTED UI",
        OWNER:  "OWNER",
        TABLE:  "TABLE",
        COLUMN: "COLUMN",
        ICON:   "ICON",
        LINK_SET_ITEMS: "LINK SET ITEMS",
        TEXT_EDITOR: "TEXT EDITOR",
        HIDDEN: "HIDDEN",
        XML: "XML",
        TEMPLATE_OPTIONS: "TEMPLATE OPTIONS",
        TEMPLATE_OPTIONS_GENERAL: "TEMPLATE OPTIONS GENERAL",
        // also need constants for base widget property types where they are excluded from multi-edit
        CHECKBOXES:     "CHECKBOXES",
        POPUP_LOV:      "POPUP LOV",
        RADIOS:         "RADIOS",
        // and constants for base widget property types that need to be checked for possible different lov values in multi-edit
        SELECT_LIST:    "SELECT LIST"
    };
    var TYPES_EXCLUDED_FROM_MULTI_EDIT = [
        PROP_TYPE.CHECKBOXES,
        PROP_TYPE.COLUMN,
        PROP_TYPE.CSS,
        PROP_TYPE.JAVASCRIPT,
        PROP_TYPE.HIDDEN,
        PROP_TYPE.HTML,
        PROP_TYPE.LINK,
        PROP_TYPE.OWNER,
        PROP_TYPE.PLSQL,
        PROP_TYPE.PLSQL_EXPR_VARCHAR,
        PROP_TYPE.PLSQL_EXPR_BOOLEAN,
        PROP_TYPE.PLSQL_FUNC_VARCHAR,
        PROP_TYPE.PLSQL_FUNC_BOOLEAN,
        PROP_TYPE.POPUP_LOV,
        PROP_TYPE.RADIOS,
        PROP_TYPE.SQL,
        PROP_TYPE.SQL_EXPR,
        PROP_TYPE.TABLE,
        PROP_TYPE.TEMPLATE_OPTIONS,
        PROP_TYPE.TEMPLATE_OPTIONS_GENERAL,
        PROP_TYPE.TEXT_EDITOR,
        PROP_TYPE.XML,
        PROP_TYPE.HTML
    ];

    var DATA_PROPERTY_ID = "data-property-id";

    // Specific constants used by property types
    var LINK = {
        PROP: {
            TYPE:               "linkType",
            APPLICATION:        "linkApp",
            PAGE:               "linkPage",
            URL:                "linkUrl",
            SET_ITEMS:          "linkSetItems",
            CLEAR_CACHE:        "linkClearCache",
            RESET_PAGINATION:   "linkResetPagination",
            REQUEST:            "linkRequest",
            SUCCESS_MESSAGE:    "linkSuccessMessage"
        },
        DISPLAY_GROUP: {
            TARGET:             "TARGET",
            SET_ITEMS:          "SET_ITEMS",
            CLEAR_SESSION:      "CLEAR_SESSION_STATE",
            ADVANCED:           "ADVANCED"
        },
        TYPES: {
            PAGE_IN_THIS_APP:   "PAGE_IN_THIS_APP",
            PAGE_IN_DIFF_APP:   "PAGE_IN_DIFF_APP",
            URL:                "URL"
        }
    };

    var PREF_KEEP_LABELS_ABOVE  = "PE_KEEP_LABELS_ABOVE",
        PREF_SHOW_ALL           = "PE_SHOW_ALL",
        PREF_CODE_EDITOR_DLG_W  = "PE_CODE_EDITOR_DLG_W",
        PREF_CODE_EDITOR_DLG_H  = "PE_CODE_EDITOR_DLG_H";

    var gCurrentCollapsedGroups = {}; // xxx todo persist this

    function msg( pKey ) {
        return lang.getMessage( "PD.PE." + pKey );
    }

    function format( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    }

    function formatNoEscape( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.formatNoEscape.apply( this, args );
    }


    // Splits APEX URL into constituent parts
    function splitApexUrl ( pUrl ) {
        var lSuccessMsgPos, lUrl,
            lURLObject = {
                appId:              "",
                pageId:             "",
                session:            "&SESSION.",
                request:            "",
                debug:              "&DEBUG.",
                clearCache:         "",
                resetPagination:    "Y",
                itemNames:          "",
                itemValues:         "",
                printerFriendly:    "NO",
                url:                "",
                successMessage:     "Y"
                // wwv_flow_builder.split_url also defines:
                // report_column
            },
            lRE =/f\?p=([^:]*):?([^:]*)?:?([^:]*)?:?([^:]*)?:?([^:]*)?:?([^:]*)?:?([^:]*)?:?([^:]*)?/i;

        if ( pUrl ) {
            if ( pUrl.toLowerCase().indexOf( "f?p=" ) === 0 ) {

                // first lets see if the link sets the success message, as this is just tagged on to the end of the url
                // irrespective of colons, so needs to be done before we split by colon
                lSuccessMsgPos = pUrl.toLowerCase().indexOf("&success_msg=#success_msg#");
                if ( lSuccessMsgPos > -1 ) {
                    lUrl = pUrl.substr( 0, lSuccessMsgPos );
                    lURLObject.successMessage = "Y";
                } else {
                    lUrl = pUrl;
                    lURLObject.successMessage = "N";
                }

                if ( lRE.test( lUrl ) ) {
                    if ( RegExp.$1 ) {
                        lURLObject.appId = RegExp.$1;
                    }
                    if ( RegExp.$2 ) {
                        lURLObject.pageId = RegExp.$2;
                    }
                    if ( RegExp.$3 ) {
                        lURLObject.session = RegExp.$3;
                    }
                    if ( RegExp.$4 ) {
                        lURLObject.request = RegExp.$4;
                    }
                    if ( RegExp.$5 ) {
                        lURLObject.debug = RegExp.$5;
                    }
                    if ( RegExp.$6 ) {
                        lURLObject.clearCache = RegExp.$6;
                    }
                    if ( RegExp.$7 ) {
                        lURLObject.itemNames = RegExp.$7;
                    }
                    if ( RegExp.$8 ) {
                        lURLObject.itemValues = RegExp.$8;
                    }
                    if ( RegExp.$9 ) {
                        lURLObject.printerFriendly = RegExp.$9;
                    }
                }
                // todo what about if a named anchor is appended to the URL?

                if ( lURLObject.clearCache ) {
                    if ( lURLObject.clearCache.indexOf( "RP" ) > -1 ) {
                        lURLObject.resetPagination = "Y";

                        // remove RP and trim "," from the beginning if it is a comma (may not be, where no page cache is
                        // being cleared).
                        lURLObject.clearCache = lURLObject.clearCache.replace( "RP", "" );
                        if ( lURLObject.clearCache.charAt( 0 ) === "," ) {
                            lURLObject.clearCache = lURLObject.clearCache.substr( 1 );
                        }
                    } else {
                        lURLObject.resetPagination = "N";
                    }
                } else {
                    lURLObject.resetPagination = "N";
                }
                if ( lURLObject.itemNames ) {
                    lURLObject.itemNames = lURLObject.itemNames.split( "," );
                }
                if ( lURLObject.itemValues ) {
                    lURLObject.itemValues = lURLObject.itemValues.split( "," );
                }
            } else {
                lURLObject.url = pUrl;
            }
        }
        return lURLObject;
    }



    /*
     * Controller specific APEX property types
     */
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SUPPORTED_UI, {
        init: function( pElement$, prop ) {

            var lSavedOptions;

            // call base select init
            this[ "super" ]( "init", pElement$, prop );

            lSavedOptions = pElement$.html();

            // Hide all unsupported components, but not if it's the current selection
            pElement$.find( "[data-is-supported=false]:not([value='" + util.escapeCSS( pElement$.val()) + "'])" ).remove(); // xxx try to avoid escapeCSS

            // Append the "Show Unsupported" option
            pElement$.append(
                $( "<option>" )
                    .attr( "value", "$UNSUPPORTED$" )
                    .text( msg( "SHOW_UNSUPPORTED" ) )
            );

            // Register a change event to show "unsupported" components if the user wants to see them
            pElement$.change( function() {
                if ( pElement$.val() === "$UNSUPPORTED$" ) {
                    // Restore the original options with all the components
                    pElement$
                        .empty()
                        .append( lSavedOptions );
                }
            });
            
        }
    }, $.apex.propertyEditor.PROP_TYPE.SELECT_LIST );

    /*
     * Controller specific APEX property types
     */
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.COMPONENT, {

        render: function( out, id, prop ) {

            // Shared Components which are displayed in the "Page Shared Components" tree
            var SHARED_COMPONENT_TYPES = [
                    model.COMP_TYPE.LOV,
                    model.COMP_TYPE.LIST,
                    model.COMP_TYPE.BREADCRUMB,
                    model.COMP_TYPE.PAGE_TEMPLATE,
                    model.COMP_TYPE.FIELD_TEMPLATE,
                    model.COMP_TYPE.BUTTON_TEMPLATE,
                    model.COMP_TYPE.REGION_TEMPLATE,
                    model.COMP_TYPE.LIST_TEMPLATE,
                    model.COMP_TYPE.BREADCRUMB_TEMPLATE,
                    model.COMP_TYPE.CALENDAR_TEMPLATE,
                    model.COMP_TYPE.REPORT_TEMPLATE,
                    model.COMP_TYPE.AUTHORIZATION,
                    model.COMP_TYPE.BUILD_OPTION,
                    model.COMP_TYPE.DATA_LOAD_TABLE,
                    model.COMP_TYPE.WS_REF ];

            var lComponentType = model.getComponentType( prop.metaData.lovComponentTypeId ),
                lButton;

            // If the component is visible in Page Designer then add the "Go to xxx" button
            if ( lComponentType.isPageComponent || $.inArray( prop.metaData.lovComponentTypeId, SHARED_COMPONENT_TYPES ) !== -1 ) {
                lButton = {
                    icon: ICON_GO_TO_COMPONENT,
                    text: formatNoEscape( "GO_TO_COMPONENT", lComponentType.title.singular )
                };
            }

            this[ "super" ]( "render", out, id, prop, lButton );
        },

        init: function( pElement$, prop ) {

            var lButton$ = $( "#" + pElement$.attr( "id" ) + "_btn" );

            function _setButtonState() {

                // Disable the button if we don't have a value or it's not a numeric component id
                // For example some authorization schemes are hardcoded and no real components
                if ( pElement$.val() !== "" && /^[-!]?[0-9]*$/.test( pElement$.val() )) {
                    lButton$.attr( "disabled", false );
                } else {
                    lButton$.attr( "disabled", true );
                }

            } // _setButtonState


            this[ "super" ]( "init", pElement$, prop );

            if ( lButton$.length > 0 ) {

                // Register a change event to enable/disable the button
                pElement$.change( _setButtonState );
                _setButtonState();

                lButton$.on( "click", function() {

                    var lComponentId = prop.value,
                        lComponent;

                    if ( lComponentId !== "" ) {

                        // Build Options and Authorization use ! or - to negate it, we have to remove that prefix
                        if (  ( prop.metaData.lovComponentTypeId === model.COMP_TYPE.BUILD_OPTION || prop.metaData.lovComponentTypeId === model.COMP_TYPE.AUTHORIZATION )
                           && /^[-!]/.test( lComponentId ))
                        {
                            lComponentId = lComponentId.substr( 1 );
                        }

                        lComponent = model.getComponents( prop.metaData.lovComponentTypeId, { id: lComponentId })[ 0 ];
                        pd.goToComponent( lComponent.typeId, lComponent.id );
                    }

                });

            }

        }

    }, $.apex.propertyEditor.PROP_TYPE.SELECT_LIST );

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.LINK, {

        /* Internal helper functions */
        _getLinkType: function ( pLinkObject ) {
            var lLinkType;

            if ( pLinkObject.url ) {
                lLinkType = LINK.TYPES.URL;
            } else {
                if ( pLinkObject.appId ) {
                    if ( ( pLinkObject.appId.toLowerCase().indexOf( "&flow_id." ) === 0 ) ||
                         ( pLinkObject.appId.toLowerCase().indexOf( "&app_id." ) === 0 ) ||
                         ( pLinkObject.appId.toLowerCase().indexOf( "#app_id#" ) === 0 ) )
                    {
                        lLinkType = LINK.TYPES.PAGE_IN_THIS_APP;
                    } else if ( pLinkObject.appId ) {
                        lLinkType = LINK.TYPES.PAGE_IN_DIFF_APP;
                    }
                } else {
                    // if appId is equal to null, default to page link
                    lLinkType = LINK.TYPES.PAGE_IN_THIS_APP;
                }
            }
            return lLinkType;
        },
        _getButtonText: function( pUrl ) {

            function shortUrl( pUrl ) {
                var lTruncatedUrl = pUrl;

                // remove "http://"
                if ( lTruncatedUrl.indexOf( "http://" ) === 0 ) {
                    lTruncatedUrl = lTruncatedUrl.substr( 7 );
                }
                // remove "www."
                if ( lTruncatedUrl.indexOf( "www." ) === 0 ) {
                    lTruncatedUrl = lTruncatedUrl.substr( 4 );
                }
                return lTruncatedUrl;
            }

            var lLinkObject,
                lLinkType,
                lButtonText = msg( "LINK.NO_LINK_DEFINED" );
            if ( pUrl ) {
                // if multi-edit, check if values vary, if so, return empty string
                if ( pUrl !== pe$.propertyEditor( "getValueVariesConstant" ) ) {
                    lLinkObject = splitApexUrl( pUrl );
                    lLinkType = this._getLinkType( lLinkObject );
                    switch( lLinkType ) {
                        case LINK.TYPES.PAGE_IN_THIS_APP:
                            lButtonText = formatNoEscape( "LINK.PAGE_N", lLinkObject.pageId );
                            break;
                        case LINK.TYPES.PAGE_IN_DIFF_APP:
                            lButtonText = formatNoEscape( "LINK.APPLICATION_N", lLinkObject.appId, lLinkObject.pageId );
                            break;
                        case LINK.TYPES.URL:
                            lButtonText = shortUrl( lLinkObject.url );
                            break;
                    }
                } else {
                    lButtonText = "";
                }

            }
            return lButtonText;
        },

        /* Internal functions, storing the widget's metadata */
        _getDisplayGroupTarget: function ( pProperties ) {
            return {
                displayGroupId:     LINK.DISPLAY_GROUP.TARGET,
                displayGroupTitle:  msg( "LINK.DG.TARGET" ),
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getDisplayGroupSetItems: function ( pProperties ) {
            return {
                displayGroupId:     LINK.DISPLAY_GROUP.SET_ITEMS,
                displayGroupTitle:  msg( "LINK.DG.SET_ITEMS" ),
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getDisplayGroupClearSessionState: function ( pProperties ) {
            return {
                displayGroupId:     LINK.DISPLAY_GROUP.CLEAR_SESSION,
                displayGroupTitle:  msg( "LINK.DG.CLEAR_SESSION" ),
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getDisplayGroupAdvanced: function ( pProperties ) {
            return {
                displayGroupId:     LINK.DISPLAY_GROUP.ADVANCED,
                displayGroupTitle:  msg( "LINK.DG.ADVANCED" ),
                collapsed:          true,
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getPropertyLinkType: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.TYPE,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.SELECT_LIST,
                    prompt:         msg( "TYPE" ),
                    isRequired:     true,
                    lovValues: [
                        { d: msg( "LINK.TYPE.PAGE_IN_THIS_APP" ),   r: LINK.TYPES.PAGE_IN_THIS_APP },
                        { d: msg( "LINK.TYPE.PAGE_IN_DIFF_APP" ),   r: LINK.TYPES.PAGE_IN_DIFF_APP },
                        { d: msg( "LINK.URL" ),                     r: LINK.TYPES.URL     }
                    ],
                    displayGroupId: LINK.DISPLAY_GROUP.TARGET
                },
                errors:             [], // array of strings xxx so far we only care about the count > 0
                warnings:           []  // array of strings xxx so far we only care about the count > 0
            }, pProperty );

        },
        _getPropertyLinkApp: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.APPLICATION,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.TEXT,
                    prompt:         msg( "APPLICATION" ),
                    isRequired:     true,
                    displayGroupId: LINK.DISPLAY_GROUP.TARGET
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkPage: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.PAGE,
                value:              "",
                metaData: {
                    type:           PROP_TYPE.PAGE,
                    prompt:         msg( "LINK.PAGE" ),
                    isRequired:     true,
                    displayGroupId: LINK.DISPLAY_GROUP.TARGET
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkUrl: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.URL,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.TEXT,
                    prompt:         msg( "LINK.URL" ),
                    isRequired:     true,
                    displayGroupId: LINK.DISPLAY_GROUP.TARGET
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkSetItems: function ( pProperty, pOriginalProperty ) {
            return $.extend( true, {
                propertyName:           LINK.PROP.SET_ITEMS,
                value:                  { names: [], values: [] },
                metaData: {
                    type:               PROP_TYPE.LINK_SET_ITEMS,
                    prompt:             msg( "LINK.DG.SET_ITEMS" ),
                    displayGroupId:     LINK.DISPLAY_GROUP.SET_ITEMS,
                    originalProperty:   pOriginalProperty
                },
                errors:                 [],
                warnings:               []
            }, pProperty );
        },
        _getPropertyLinkClearCache: function ( pProperty ) {
            return $.extend( true, {
                propertyName:               LINK.PROP.CLEAR_CACHE,
                value:                      "",
                metaData: {
                    prompt:                 msg( "LINK.CLEAR_CACHE" ),
                    type:                   PROP_TYPE.PAGE,
                    multiValueDelimiter:    ",",
                    displayGroupId:         LINK.DISPLAY_GROUP.CLEAR_SESSION
                },
                errors:                     [],
                warnings:                   []
            }, pProperty );
        },
        _getPropertyLinkResetPagination: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.RESET_PAGINATION,
                value:              "Y",
                metaData: {
                    prompt:         msg( "LINK.RESET_PAGINATION" ),
                    type:           $.apex.propertyEditor.PROP_TYPE.YES_NO,
                    noValue:        "N",
                    yesValue:       "Y",
                    displayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION,
                    isRequired:     true
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkRequest: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.REQUEST,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.TEXT,
                    prompt:         msg( "LINK.REQUEST" ),
                    displayGroupId: LINK.DISPLAY_GROUP.ADVANCED
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkSuccessMessage: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.SUCCESS_MESSAGE,
                value:              "Y",
                metaData: {
                    prompt:         msg( "LINK.SUCCESS_MESSAGE" ),
                    type:           $.apex.propertyEditor.PROP_TYPE.YES_NO,
                    noValue:        "N",
                    yesValue:       "Y",
                    displayGroupId: LINK.DISPLAY_GROUP.ADVANCED,
                    isRequired:     true
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },

        /* Property type properties and callbacks */
        noLabel: true,
        render: function( out, id, prop ) {
            var lLabelId = id + "_label";

            this.renderDivOpen( out, { "class": PROPERTY_FIELD_CONTAINER } );
            out.markup( "<button" )
                .attr( "type", "button" )
                .attr( "id", id )
                .attr( "aria-describedby", lLabelId )
                .attr( "class", BUTTON + " " + BUTTON_PROPERTY + " " + BUTTON_FORCE_WRAP )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                .attr( "value", prop.value )
                .markup( ">" )
                .content( this._getButtonText( prop.value ) )
                .markup( "</button>" );
            this.renderDivClose( out );
        },
        setValue: function( pElement$, prop, pValue ) {
            var lDisplayValue;

            this[ "super" ]( "setValue", pElement$, prop, pValue );

            // update the button text accordingly
            lDisplayValue = this._getButtonText( pValue );
            pElement$
                .html( lDisplayValue )
                .attr( "title", lDisplayValue );

        },
        init: function( pElement$, prop ) {
            var that = this;

            this.addLabelClickHandler( pElement$, prop );
            this.addTooltipsForErrors( pElement$, prop );

            // the main click handler that launches the link dialog
            pElement$.closest( "div." + PROPERTY ).on( "click", "#" + pElement$.attr( "id" ), function() {
                var lLinkDlg$,
                    lTypeValue,
                    out = util.htmlBuilder(),
                    lLinkObject = splitApexUrl( pElement$.val() ),
                    lPropertySet = [],
                    lBranchMode = false,
                    lButtonMode = false,
                    lLinkRequired = prop.metaData.isRequired,
                    lLinkReadOnly = prop.metaData.isReadOnly;

                // Link property types do not support multi-edit, so we can just look at the first selected to determine
                // the current component type.
                switch ( model.getComponentType( gLastComponents[ 0 ].typeId ).id ) {
                    case model.COMP_TYPE.BRANCH:
                        lBranchMode = true;
                        break;
                    case model.COMP_TYPE.BUTTON:
                        lButtonMode = true;
                        break;
                }

                if ( lButtonMode ) {
                    switch ( pe$.propertyEditor( "getPropertyValue", model.PROP.BUTTON_ACTION ) ) {
                        case "REDIRECT_URL":
                            lTypeValue = LINK.TYPES.URL;
                            break;
                        case "REDIRECT_PAGE":
                            lTypeValue = LINK.TYPES.PAGE_IN_THIS_APP;
                            break;
                        case "REDIRECT_APP":
                            lTypeValue = LINK.TYPES.PAGE_IN_DIFF_APP;
                            break;
                    }
                } else {
                    lTypeValue = that._getLinkType( lLinkObject );
                }

                function _getProperty ( pPropertyName ) {
                    var i, j, lProperty;
                    for ( i = 0; i < lPropertySet.length; i++ ) {
                        for ( j = 0; j < lPropertySet[ i ].properties.length; j++ ) {
                            if ( lPropertySet[ i ].properties[ j ].propertyName === pPropertyName ) {
                                lProperty = lPropertySet[ i ].properties[ j ];
                                break;
                            }
                        }
                    }
                    return lProperty;
                }

                lPropertySet.push (
                    that._getDisplayGroupTarget( [
                        that._getPropertyLinkType({
                            value:          lTypeValue,
                            metaData: {
                                isReadOnly: lLinkReadOnly || lButtonMode,
                                isRequired: lLinkRequired
                            }
                        }),
                        that._getPropertyLinkApp({
                            value:          ( lTypeValue === LINK.TYPES.PAGE_IN_DIFF_APP ) ?  lLinkObject.appId : "",
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        }),
                        that._getPropertyLinkPage({
                            value:          lLinkObject.pageId,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        }),
                        that._getPropertyLinkUrl({
                            value:          lLinkObject.url,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        })
                    ])
                );
                lPropertySet.push (
                    that._getDisplayGroupSetItems( [
                        that._getPropertyLinkSetItems({
                            value: {
                                names:  lLinkObject.itemNames,
                                values: lLinkObject.itemValues
                            },
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        },
                        prop )
                    ])
                );
                lPropertySet.push (
                    that._getDisplayGroupClearSessionState( [
                        that._getPropertyLinkClearCache({
                            value:          lLinkObject.clearCache,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        }),
                        that._getPropertyLinkResetPagination({
                            value:          lLinkObject.resetPagination,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        })
                    ])
                );
                var lDisplayGroupAdvancedProps = [];
                lDisplayGroupAdvancedProps.push( that._getPropertyLinkRequest({
                    value:          lLinkObject.request,
                    metaData: {
                        isReadOnly: prop.metaData.isReadOnly
                    }
                }) );
                if ( lBranchMode ) {
                    lDisplayGroupAdvancedProps.push( that._getPropertyLinkSuccessMessage({
                        value:          lLinkObject.successMessage,
                        metaData: {
                            isReadOnly: prop.metaData.isReadOnly
                        }
                    }) );
                }
                lPropertySet.push ( that._getDisplayGroupAdvanced( lDisplayGroupAdvancedProps ) );

                // create dialog div
                out.markup( "<div" )
                    .attr( "id", "linkDlg" )
                    .attr( "title", formatNoEscape( "LINK.TITLE", prop.metaData.prompt ) ) // escaping done by jQueryUI dialog
                    .markup( ">" )
                    .markup( "<div" )
                    .attr( "id", "linkDlgPE" )
                    .markup( ">" )
                    .markup( "</div>" )
                    .markup( "</div>" );

                lLinkDlg$ = $( out.toString() ).dialog( {
                    modal:          true,
                    closeText:      lang.getMessage( "APEX.DIALOG.CLOSE" ),
                    minWidth:       400,
                    width:          520,
                    dialogClass:    DIALOG_FLUSH_BODY,
                    close: function() {
                        $( "#linkDlgPE" ).propertyEditor( "destroy" );
                        lLinkDlg$.dialog( "destroy" );
                    },
                    open: function() {
                        function _showProperties( pLinkType ) {
                            var lProperty = {
                                metaData: {
                                    isReadOnly: prop.metaData.isReadOnly
                                }
                            };

                            switch ( pLinkType ) {
                                case LINK.TYPES.PAGE_IN_THIS_APP:
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.URL );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.APPLICATION );
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkPage( lProperty ),
                                        prevPropertyName:   LINK.PROP.TYPE,
                                        displayGroup:       that._getDisplayGroupTarget()
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkSetItems( lProperty, prop ),
                                        displayGroup:       that._getDisplayGroupSetItems(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.TARGET
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkClearCache( lProperty ),
                                        displayGroup:       that._getDisplayGroupClearSessionState(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.SET_ITEMS
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkResetPagination( lProperty ),
                                        prevPropertyName:   LINK.PROP.CLEAR_CACHE,
                                        displayGroup:       that._getDisplayGroupClearSessionState(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.SET_ITEMS
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkRequest( lProperty ),
                                        displayGroup:       that._getDisplayGroupAdvanced(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                    });

                                    if ( lBranchMode ) {
                                        lLinkDlgPE$.propertyEditor( "addProperty", {
                                            property:           that._getPropertyLinkSuccessMessage( lProperty ),
                                            prevPropertyName:   LINK.PROP.RESET_PAGINATION,
                                            displayGroup:       that._getDisplayGroupAdvanced(),
                                            prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                        });
                                    }
                                    break;
                                case LINK.TYPES.PAGE_IN_DIFF_APP:
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.URL );
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkApp( lProperty ),
                                        prevPropertyName:   LINK.PROP.TYPE,
                                        displayGroup:       that._getDisplayGroupTarget()
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkPage( lProperty ),
                                        prevPropertyName:   LINK.PROP.APPLICATION,
                                        displayGroup:       that._getDisplayGroupTarget()
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkSetItems( lProperty, prop ),
                                        displayGroup:       that._getDisplayGroupSetItems(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.TARGET
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkClearCache( lProperty ),
                                        displayGroup:       that._getDisplayGroupClearSessionState(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.SET_ITEMS
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkResetPagination( lProperty ),
                                        prevPropertyName:   LINK.PROP.CLEAR_CACHE,
                                        displayGroup:       that._getDisplayGroupClearSessionState(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.SET_ITEMS
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkRequest( lProperty ),
                                        displayGroup:       that._getDisplayGroupAdvanced(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                    });
                                    if ( lBranchMode ) {
                                        lLinkDlgPE$.propertyEditor( "addProperty", {
                                            property:           that._getPropertyLinkSuccessMessage( lProperty ),
                                            prevPropertyName:   LINK.PROP.RESET_PAGINATION,
                                            displayGroup:       that._getDisplayGroupAdvanced(),
                                            prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                        });
                                    }
                                    break;
                                case LINK.TYPES.URL:
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.APPLICATION );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.PAGE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.SET_ITEMS );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.REQUEST );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.CLEAR_CACHE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.RESET_PAGINATION );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.SUCCESS_MESSAGE );
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkUrl( lProperty ),
                                        prevPropertyName:   LINK.PROP.TYPE,
                                        displayGroup:       that._getDisplayGroupTarget()
                                    });
                                    break;
                                default:
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.APPLICATION );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.PAGE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.SET_ITEMS );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.REQUEST );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.CLEAR_CACHE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.RESET_PAGINATION );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.SUCCESS_MESSAGE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.URL );
                                    break;
                            }
                        }
                        var lLinkDlgPE$ = $( "#linkDlgPE" );
                        lLinkDlgPE$.propertyEditor( {
                            focusPropertyName: LINK.PROP.TYPE,
                            data: {
                                propertySet:    lPropertySet,
                                multiEdit:      false
                            },
                            change: function( pEvent, pData ) {
                                if ( pData.propertyName === LINK.PROP.TYPE ) {
                                    _showProperties( _getProperty( LINK.PROP.TYPE ).value );
                                }

                                // fixes issue where new properties added have stale values in lPropertySet
                                _getProperty( pData.propertyName ).value = pData.property.value;
                            }
                        });
                        _showProperties( _getProperty( LINK.PROP.TYPE ).value );

                        $( "#linkDlg" ).dialog({
                            position: { 'my': 'center', 'at': 'center' }
                        });
                    },
                    buttons: [
                        {
                            text:       msg( "CANCEL" ),
                            click:      function() {
                                lLinkDlg$.dialog( "close" );
                            }
                        },
                        {
                            text:       msg( "CLEAR" ),
                            disabled:   lLinkRequired || lLinkReadOnly,
                            click:      function() {
                                $( "#linkDlgPE" ).propertyEditor( "updatePropertyValue", LINK.PROP.TYPE, "" );
                                that.setValue( pElement$, prop, "" );
                                pElement$.trigger( "change" );
                                that.setFocus( pElement$ );
                                lLinkDlg$.dialog( "close" );
                            }
                        },
                        {
                            text:       msg( "OK" ),
                            "class":      BUTTON_HOT,
                            disabled:   lLinkReadOnly,
                            click:      function() {
                                var lType, lReturnLink,
                                    lErrorProps = [];

                                // Compute clear cache value, reset pagination is stored as "RP" in clear cache
                                function _getClearCache( pResetPagination, pClearCache ) {
                                    var lClearCache = "";
                                    if ( pResetPagination === "Y" ) {
                                        if ( pClearCache === "" ) {
                                            lClearCache = "RP";
                                        } else {
                                            lClearCache = "RP," + pClearCache;
                                        }
                                    } else {
                                        lClearCache = pClearCache;
                                    }
                                    return lClearCache;
                                }
                                function _addError( pPropertyName, pErrorMsg ) {
                                    var lErrorProp = _getProperty( pPropertyName );
                                    lErrorProp.errors.push( pErrorMsg );
                                    return lErrorProp;
                                }

                                lType = _getProperty( LINK.PROP.TYPE ).value;
                                if ( lType === LINK.TYPES.PAGE_IN_THIS_APP || lType === LINK.TYPES.PAGE_IN_DIFF_APP ) {

                                    if ( lType === LINK.TYPES.PAGE_IN_DIFF_APP && _getProperty( LINK.PROP.APPLICATION ).value === "" ) {
                                        lErrorProps.push( _addError( LINK.PROP.APPLICATION, msg( "IS_REQUIRED" ) ) );
                                    }
                                    // todo look at using validate callback for property type instead
                                    if ( _getProperty( LINK.PROP.PAGE ).value === "" ) {
                                        lErrorProps.push( _addError( LINK.PROP.PAGE, msg( "IS_REQUIRED" ) ) );
                                    }
                                    if ( lErrorProps.length === 0 ) {

                                        lReturnLink =
                                            "f?p=" +
                                            (( lType === LINK.TYPES.PAGE_IN_THIS_APP ) ? "&APP_ID." : _getProperty( LINK.PROP.APPLICATION ).value ) +
                                            ":" + _getProperty( LINK.PROP.PAGE ).value +
                                            ":" + "&SESSION." +
                                            ":" + _getProperty( LINK.PROP.REQUEST ).value +
                                            ":" + "&DEBUG." +
                                            ":" + _getClearCache(
                                                      _getProperty( LINK.PROP.RESET_PAGINATION ).value,
                                                      _getProperty( LINK.PROP.CLEAR_CACHE ).value ) +
                                            ":" + ( _getProperty( LINK.PROP.SET_ITEMS ).value.names  || [] ).join( "," ) +
                                            ":" + ( _getProperty( LINK.PROP.SET_ITEMS ).value.values || [] ).join( "," );
                                        if ( lBranchMode && _getProperty( LINK.PROP.SUCCESS_MESSAGE ).value === "Y" ) {
                                            lReturnLink += "&success_msg=#SUCCESS_MSG#";
                                        }

                                    }
                                } else if ( lType === LINK.TYPES.URL ) {

                                    if ( _getProperty( LINK.PROP.URL ).value === "" ) {
                                        lErrorProps.push( _addError( LINK.PROP.URL, msg( "IS_REQUIRED" ) ) );
                                    }
                                    if ( lErrorProps.length === 0 ) {
                                        lReturnLink = _getProperty( LINK.PROP.URL ).value;
                                    }
                                }

                                if ( lErrorProps.length === 0 ) {
                                    that.setValue( pElement$, prop, lReturnLink );
                                    pElement$.trigger( "change" );
                                    that.setFocus( pElement$ );
                                    lLinkDlg$.dialog( "close" );
                                } else {
                                    for ( var i = 0; i < lErrorProps.length; i++ ) {
                                        $( "#linkDlgPE" ).propertyEditor( "updateProperty", lErrorProps[ i ] );
                                    }
                                    // set focus to first
                                    // error tooltip sufficient?
                                }
                            }
                        }
                    ]
                });
            });
        }
    } );

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.LINK_SET_ITEMS, {
        stacked:        true,
        noLabel:        true,
        labelVisible:   false,
        minHeight:      85,
        maxHeight:      122,
        render: function( out, id, prop ) {
            var lLabelId    = id + "_label";
            out.markup( "<div" )
                .attr( "id", id )
                .attr( "class", PROPERTY_FIELD_CONTAINER )
                .attr( "aria-labelledby", lLabelId )
                .attr( "role", "group" )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                .markup( ">" );

            out.markup( "<table" )
                .attr( "class", PROPERTY_SET_ITEMS_TABLE )
                .markup( ">" )
                .markup( "<caption" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LINK.DG.SET_ITEMS" ) )
                .markup( "</caption>" )
                .markup( "<tr>" )
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", PROPERTY_SET_ITEMS_HEADER_HEADER )
                .markup( ">" )
                .content( msg( "NAME" ) )
                .markup( "</th>")
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LINK.NAME_LIST_OF_VALUES" ) )
                .markup( ">" )
                .markup( "</th>" )
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", PROPERTY_SET_ITEMS_HEADER_HEADER )
                .markup( ">" )
                .content( msg( "LINK.VALUE" ) )
                .markup( "</th>")
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LINK.VALUE_LIST_OF_VALUES" ) )
                .markup( ">" )
                .markup( "</th>" )
                .markup( "<th" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LINK.REMOVE" ) )
                .markup( "</th>" )
                .markup( "</tr>" );

            for ( var i = 0; i < prop.value.names.length; i++ ) {
                this._renderLinkItemsRow( out, {
                    rowId:      i + 1,
                    idPrefix:   id,
                    name:       prop.value.names[ i ],
                    value:      prop.value.values[ i ],
                    readOnly:   prop.metaData.isReadOnly
                });
            }

            // If the property is currently editable, render an additional row for new items
            if ( !prop.metaData.isReadOnly ) {
                this._renderLinkItemsRow( out, {
                    rowId:      prop.value.names.length + 1,
                    idPrefix:   id
                });
            }
            out.markup( "</table>" );

            this.renderDivClose( out );
        },
        init: function( pElement$, prop ) {
            var lOptions = {
                columnDefinitions: [
                    {
                        name:      "name",
                        title:     msg( "NAME" ),
                        alignment: "left"
                    },
                    {
                        name:      "label",
                        title:     msg( "LABEL" ),
                        alignment: "left"
                    }
                ],
                filterLov: function ( pFilters, pRenderLovEntries ) {
                    var lType = "page",
                        lPageId;

                    switch ( pFilters.scope ) {
                        case "application":
                            lType   = "application";
                            lPageId = "";
                            break;
                        case "current_page":
                            lPageId = model.getCurrentPageId();
                            break;
                        case "global_page":
                            lPageId = model.getGlobalPageId();
                            break;
                        case "target_page":
                            lPageId = $( "#linkDlg" ).find( "[data-property-id=" + LINK.PROP.PAGE + "]" ).val();
                            break;
                        case "custom_page":
                            lPageId = pFilters.customPageNumber;
                            break;
                        case "columns":
                            lType   = "columns";
                            break;

                    }

                    // Link property types do not support multi-edit, so we can just look at the first selected to determine
                    // the current component type.
                    model.getItemsLov( {
                        type:       lType,
                        component:  gLastComponents[ 0 ],
                        pageId:     lPageId
                    },
                    function( pLovEntries ){
                        pRenderLovEntries( pLovEntries, pFilters.search );
                    });
                },
                multiValue: false,
                dialogTitle: formatNoEscape( "PICK", prop.metaData.prompt ) // escaping done by jQueryUI dialog
            };


            function openLovDialog( pReturnElement ) {
                var lLovDialog$,
                    out = util.htmlBuilder(),
                    lFilters = lOptions.filters;

                out.markup( "<div" )
                    .attr( "id", "lovDlg" )
                    .attr( "title", lOptions.dialogTitle )
                    .markup( ">" )
                    .markup( "</div>" );

                lLovDialog$ = $( out.toString() ).lovDialog({
                    modal:             true,
                    minWidth:          520,
                    height:            500,
                    filters:           lFilters,
                    columnDefinitions: lOptions.columnDefinitions,
                    filterLov:         lOptions.filterLov,
                    dialogClass:       DIALOG_FLUSH_BODY,
                    resizable:         false,
                    multiValue:        lOptions.multiValue,
                    valueSelected: function( pEvent, pData ) {

                        var lValue = pData[ lOptions.columnDefinitions[ 0 ].name ],
                            lReturnElement$ = $( "#" + pReturnElement );

                        if ( pData.valueFormatting && $.isFunction( pData.valueFormatting ) ) {
                            lValue = pData.valueFormatting( lValue );
                        }

                        lReturnElement$
                            .val( lValue )
                            .trigger( "change" );
                    }
                });
            }


            var that = this,
                lProperty$ = pElement$.closest( "div." + PROPERTY ),
                lId = pElement$.attr( "id" );

            // Only add interactivity if property is editable
            if ( !prop.metaData.isReadOnly ) {
                lProperty$
                    .on( "change", "input." + LINK_DIALOG_ITEM_NAME + ":last", function() {
                        var lNewRow = util.htmlBuilder(),
                            lDeleteButton = util.htmlBuilder(),
                            lLastNameInput$ = $( this );

                        if ( lLastNameInput$.val() ) {
                            var lCurrentRow = $( "input." + LINK_DIALOG_ITEM_NAME ).length;
                            that._renderLinkItemsRow( lNewRow, {
                                rowId:      lCurrentRow + 1,
                                idPrefix:   lId
                            });
                            that.renderIconButton( lDeleteButton, {
                                id:     lId + "_rowRemove_" + lCurrentRow,
                                icon:   ICON_REMOVE,
                                text:   format( "LINK.REMOVE_ITEM_N", lCurrentRow )
                            });
                            lLastNameInput$
                                .closest( "tr" )
                                .find( "td:last" )
                                .html( lDeleteButton.toString())
                                .end()
                                .after( lNewRow.toString());
                        }
                    })
                    .on( "click", "button[id^=" + lId + "_rowRemove_]", function() {
                        var lNewInput$ = $( this )
                            .closest( "tr" )
                            .next( "tr" )
                            .find( ":input:first" );

                        $( this )
                            .closest( "tr" )
                            .remove();
                        lNewInput$
                            .trigger( "change" )
                            .focus();
                    })
                    .on( "click", "button[id^=" + lId + "_nameLovBtn_]", function() {

                        lOptions.filters = [
                            {
                                name:         "scope",
                                title:        msg( "ITEM_SCOPE" ),
                                type:         "buttonset",
                                defaultValue: "target_page",
                                lov: [
                                    {
                                        display: msg( "TARGET_PAGE" ),
                                        value:   "target_page"
                                    },
                                    {
                                        display: msg( "CURRENT_PAGE" ),
                                        value:   "current_page"
                                    },
                                    {
                                        display: msg( "CUSTOM_PAGE" ),
                                        value:   "custom_page",
                                        filters: [
                                            {
                                                name:       "customPageNumber",
                                                title:      msg( "PAGE_NUMBER" ),
                                                type:       "text",
                                                isRequired: true
                                            }
                                        ]
                                    },
                                    {
                                        display: msg( "GLOBAL_PAGE" ),
                                        value:   "global_page"
                                    },
                                    {
                                        display: msg( "APPLICATION" ),
                                        value:   "application"
                                    }
                                ]
                            },
                            {
                                name:  "search",
                                title: msg( "SEARCH" ),
                                type:  "search"
                            }
                        ];

                        openLovDialog( $( this ).data( "for" ) );
                    })
                    .on( "click", "button[id^=" + lId + "_valueLovBtn_]", function() {

                        var i, j, lFilter,
                            lOriginalProperty = prop.metaData.originalProperty;

                        function ampersandPeriodEnquote( pValue ) {
                            return "&" + model.enquoteIdentifier( pValue ) + ".";
                            //return "&" + pValue + ".";
                        }

                        lOptions.filters = [
                            {
                                name:           "scope",
                                title:          msg( "ITEM_SCOPE" ),
                                type:           "buttonset",
                                defaultValue:   "current_page",
                                lov: [
                                    {
                                        display: msg( "TARGET_PAGE" ),
                                        value:   "target_page",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        }
                                    },
                                    {
                                        display: msg( "CURRENT_PAGE" ),
                                        value:   "current_page",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        }
                                    },
                                    {
                                        display: msg( "CUSTOM_PAGE" ),
                                        value:   "custom_page",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        },
                                        filters: [
                                            {
                                                name:       "customPageNumber",
                                                title:      msg( "PAGE_NUMBER" ),
                                                type:       "text",
                                                isRequired: true
                                            }
                                        ]
                                    },
                                    {
                                        display: msg( "GLOBAL_PAGE" ),
                                        value:   "global_page",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        }
                                    },
                                    {
                                        display: msg( "APPLICATION" ),
                                        value:   "application",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        }
                                    }
                                ]
                            },
                            {
                                name:  "search",
                                title: msg( "SEARCH" ),
                                type:  "search"
                            }
                        ];

                        for ( i = 0; i < lOptions.filters.length; i++ ) {

                            lFilter = lOptions.filters[ i ];

                            if ( lFilter.name === "scope" ) {

                                // If property being edited has reference scope of 'row', replace 'target_page' filter with 'columns' filter
                                if ( lOriginalProperty.metaData.referenceScope === "ROW" ) {

                                    lFilter.defaultValue = "columns";

                                    for ( j = 0; j < lFilter.lov.length; j++ ) {

                                        if ( lFilter.lov[ j ].value === "target_page" ) {
                                            lFilter.lov[ j ] = {
                                                display:            msg( "COLUMNS" ),
                                                value:              "columns",
                                                valueFormatting:    function( pValue ){
                                                    var lFormat, lComponentTypeId,
                                                        HASH_SYNTAX_COMP_TYPES = [  model.COMP_TYPE.IR_ATTRIBUTES,
                                                                                    model.COMP_TYPE.IR_COLUMN,
                                                                                    model.COMP_TYPE.CLASSIC_RPT_COLUMN,
                                                                                    model.COMP_TYPE.TAB_FORM_COLUMN,
                                                                                    model.COMP_TYPE.CHART_SERIES,
                                                                                    model.COMP_TYPE.MAP_CHART_SERIES ];

                                                    // Note: Link doesn't support multi-edit currently, so we can just get the first gLastComponents
                                                    lComponentTypeId = model.getComponentType( gLastComponents[ 0 ].typeId ).id;

                                                    if ( $.inArray( lComponentTypeId, HASH_SYNTAX_COMP_TYPES ) !== -1 ) {
                                                        lFormat = "#" + pValue + "#";
                                                    } else {
                                                        lFormat = ampersandPeriodEnquote( pValue );
                                                    }
                                                    return lFormat;
                                                }
                                            };

                                            break;

                                        }

                                    }
                                }
                            }
                        }

                        openLovDialog( $( this ).data( "for" ) );

                    });
            }

            this.addLabelClickHandler( pElement$, prop );
        },
        setFocus: function( pElement$ ) {
            pElement$.find( ":input:first" ).focus();
        },
        getValue: function ( pProperty$ ) {
            var lName$, lValue$,
                lNames = [],
                lValues = [];
            pProperty$.find( "tr." + LINK_DIALOG_SET_ITEMS_ROW_DATA ).each( function() {
                lName$ = $( this ).find( ":input." + LINK_DIALOG_ITEM_NAME );
                lValue$ = $( this ).find( ":input." + LINK_DIALOG_ITEM_VALUE );
                if ( lName$.val() !== "" ) {
                    lNames.push( lName$.val());
                    lValues.push( lValue$.val());
                }
            });
            return {
                names: lNames,
                values: lValues
            };
        },
        _renderLinkItemsRow: function ( out, pOptions ) {
            var lItemNameId, lItemValueId,
                lOptions = $.extend( {
                    rowId:      "",
                    idPrefix:   "",
                    name:       "",
                    value:      "",
                    readOnly:   false
                }, pOptions );

            lItemNameId = lOptions.idPrefix + "_name_" + lOptions.rowId;
            lItemValueId = lOptions.idPrefix + "_value_" + lOptions.rowId;

            out.markup( "<tr" )
                .attr( "class", LINK_DIALOG_SET_ITEMS_ROW_DATA )
                .markup( ">" );
            out.markup( "<td>" );
            this.renderBaseInput( out, {
                id:         lItemNameId,
                value:      lOptions.name,
                inputClass: [ LINK_DIALOG_ITEM_NAME, PROPERTY_FIELD, PROPERTY_FIELD_TEXT ],
                readonly:   lOptions.readOnly,
                attributes: {
                    "aria-label": format( "LINK.ITEM_N_NAME", lOptions.rowId )
                }
            });
            out.markup( "</td>" );
            out.markup( "<td>" );
            this.renderIconButton( out, {
                id:         lOptions.idPrefix + "_nameLovBtn_" + lOptions.rowId,
                icon:       ICON_LOV,
                text:       format( "LINK.ITEM_N_NAME_LOV", lOptions.rowId ),
                dataFor:    lItemNameId,
                disabled:   lOptions.readOnly
            });
            out.markup( "</td>" );

            out.markup( "<td>" );
            this.renderBaseInput( out, {
                id:         lItemValueId,
                value:      lOptions.value,
                inputClass: [ LINK_DIALOG_ITEM_VALUE, PROPERTY_FIELD, PROPERTY_FIELD_TEXT ],
                readonly:   lOptions.readOnly,
                attributes: {
                    "aria-label": format( "LINK.ITEM_N_VALUE", lOptions.rowId )
                }
            });
            out.markup( "</td>" );
            out.markup( "<td>" );
            this.renderIconButton( out, {
                id:         lOptions.idPrefix + "_valueLovBtn_" + lOptions.rowId,
                icon:       ICON_LOV,
                text:       format( "LINK.ITEM_N_VALUE_LOV", lOptions.rowId ),
                dataFor:    lItemValueId,
                disabled:   lOptions.readOnly
            });
            out.markup( "</td>" );
            out.markup( "<td" )
                .attr( "class", PROPERTY_SET_ITEMS_TABLE_REMOVE_COL )
                .markup( ">" );

            // If we have an item name, then we also want to render the remove icon for that row
            if ( lOptions.name ) {
                this.renderIconButton( out, {
                    id:         lOptions.idPrefix + "_rowRemove_" + lOptions.rowId,
                    icon:       ICON_REMOVE,
                    text:       format( "LINK.REMOVE_ITEM_N", lOptions.rowId ),
                    disabled:   lOptions.readOnly
                });
            }
            out.markup( "</td>" );
            out.markup( "</tr>" );
        }
    });

    /*
     * Enhanced text area adds external editing of text in a a code mirror based editor
     */
    var DLG_MARGIN = 40,
        CODE_EDITOR_PREF_NAME = "CODE_EDITOR_SETTINGS";

    var gChangeGeneration = -1;

    var gEditorDlgWidth, gEditorDlgHeight, gEditorSettings;

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.TEXT_EDITOR, {

        render: function( out, id, prop ) {
            this[ "super" ]( "render", out, id, prop, true );
        },

        init: function( pElement$, prop ) {
            var lProperty$,
                that = this,
                lModalButton$ = $( "#" + pElement$.attr( "id" ) + "_modalBtn" );

            // xxx todo I think opening in text editor should only be allowed when editing a single component
            // (gLastComponents.length === 1 perhaps the same is true for editing in a dialog. The text editor
            // does NOT support multi edit!
            // for now just edit the first component

            // call base textarea init
            this[ "super" ]( "init", pElement$, prop );

            lModalButton$.on( "click", function openDialog() {
                var lEditorDlg$, lEditor$, lDlgHeight, lDlgWidth,
                    lValidateFunction, lQueryBuilderFunction, // must be undefined
                    lMode = "text",
                    lSettingsChanged = false,
                    lButtons = [],
                    lProperty = gLastComponents[ 0 ].getProperty( prop.propertyName ), // todo If multiple components are selected should we show errors at all?
                    out = util.htmlBuilder();

                function updateChangeGeneration() {
                    gChangeGeneration = lEditor$.codeEditor( "changeGeneration" );
                    debug.trace( "Editor: update change generation: " + gChangeGeneration );
                }

                function hasChanged() {
                    return !lEditor$.codeEditor( "isClean", gChangeGeneration );
                }

                switch ( prop.metaData.type ) {
                    case model.PROP_TYPE.CSS:
                        lMode = "css";
                        break;
                    case model.PROP_TYPE.HTML:
                        lMode = "html";
                        break;
                    case model.PROP_TYPE.JAVASCRIPT:
                        lMode = "javascript";
                        break;
                    case model.PROP_TYPE.XML:
                        lMode = "xml";
                        break;
                    case model.PROP_TYPE.SQL:
                    case model.PROP_TYPE.SQL_EXPR:
                    case model.PROP_TYPE.PLSQL:
                    case model.PROP_TYPE.PLSQL_EXPR_VARCHAR:
                    case model.PROP_TYPE.PLSQL_EXPR_BOOLEAN:
                    case model.PROP_TYPE.PLSQL_FUNC_VARCHAR:
                    case model.PROP_TYPE.PLSQL_FUNC_BOOLEAN:
                        lMode = "x-plsql";
                        break;

                }

                // Add buttons depending on the property type
                lButtons.push({
                    text:  msg( "CANCEL" ),
                    click: function() {
                        lEditorDlg$.dialog( "close" );
                    }
                });

                if ( prop.metaData.type === model.PROP_TYPE.SQL ) {
                    lQueryBuilderFunction = function( editor, code ) {
                        nav.popup({
                            url: util.makeApplicationUrl({
                                    appId:      4500,
                                    pageId:     1002,
                                    clearCache: 1002,
                                    itemNames:  [ "P1002_RETURN_INTO", "P1002_POPUP", "P1002_SCHEMA" ],
                                    itemValues: [ editor.baseId, "1", model.getParsingSchema() ]
                                 }),
                            width:  950,
                            height: 720
                        });
                    };
                }

                if ( lMode === "x-plsql" && !prop.metaData.isReadOnly ) {
                    lValidateFunction = function( code, callback ) {
                        var lResult = lProperty.validate( code ); // xxx todo this should be async
                        callback( lResult );
                    };
                }
                lButtons.push({
                    text:  msg( "OK" ),
                    "class": BUTTON_HOT,
                    click: function() {
                        that[ "super" ]( "setValue", pElement$, prop, lEditor$.codeEditor( "getValue" ));
                        pElement$.trigger( "change" );
                        updateChangeGeneration();
                        // Set focus after change, so that we don't incorrectly trigger the error tooltip display
                        // in the case where an error has been resolved as a result of this change
                        that[ "super" ]( "setFocus", pElement$ );
                        lEditorDlg$.dialog( "close" );
                    }
                });

                // open and setup a simple wrapper dialog
                out.markup( "<div" )
                    .attr( "id", "editorDlg" )
                    .attr( "title", formatNoEscape( "CODE_EDITOR.TITLE", prop.metaData.prompt )) // escaping done by jQueryUI dialog
                    .markup( ">" )
                    .markup( "<div" )
                    .attr( "id", "editorDlg-codeEditor" )
                    .markup( "class='resize'>" )
                    .markup( "</div>" )
                    .markup( "</div>" );

                // xxx maximize option?
                // xxx sometimes the property tooltip shows up on top of the dialog
                lDlgWidth = gEditorDlgWidth;
                lDlgHeight = gEditorDlgHeight;
                if ( lDlgWidth > $(window ).width() - DLG_MARGIN ) {
                    lDlgWidth = $(window ).width() - DLG_MARGIN;
                }
                if ( lDlgHeight > $(window ).height() - DLG_MARGIN ) {
                    lDlgHeight = $(window ).height() - DLG_MARGIN;
                }
                lEditorDlg$ = $( out.toString()).dialog({
                    modal:      true,
                    closeText:  lang.getMessage( "APEX.DIALOG.CLOSE" ),
                    width:      lDlgWidth,
                    height:     lDlgHeight,
                    minWidth:   680,
                    minHeight:  400,
                    beforeClose: function( pEvent ) {
                        var ok = true;
                        if ( hasChanged() ) {
                            ok = confirm( msg( "EDITOR.UNSAVED_CHANGES" ) );
                        }
                        if ( !ok ) {
                            pEvent.preventDefault();
                        }
                    },
                    close: function() {
                        var dlg$ = lEditorDlg$.closest( ".ui-dialog" );
                        if ( lSettingsChanged ) {
                            gEditorSettings = lEditor$.codeEditor( "getSettingsString" );
                            // persist settings
                            // Can't use savePreference because code editor doesn't use the same prefix as the rest of PE/PD
                            window.gPreferences[ CODE_EDITOR_PREF_NAME ] = gEditorSettings;

                            server.process (
                                "setPreference", {
                                    x01: CODE_EDITOR_PREF_NAME,
                                    x02: gEditorSettings
                                }, {
                                    dataType: "" // don't expect any data back
                                }
                            );
                        }
                        // remember last dialog size for next time
                        if ( gEditorDlgWidth !== dlg$.outerWidth() ) {
                            gEditorDlgWidth = dlg$.outerWidth();
                            pd.savePreference( PREF_CODE_EDITOR_DLG_W, gEditorDlgWidth );
                        }
                        if ( gEditorDlgHeight !== dlg$.outerHeight() ) {
                            gEditorDlgHeight = dlg$.outerHeight();
                            pd.savePreference( PREF_CODE_EDITOR_DLG_H, gEditorDlgHeight );
                        }
                        lEditorDlg$.dialog( "destroy" ).remove(); // remove causes code editor go get destroyed as well
                    },
                    open: function() {

                        lEditor$ = $( "#editorDlg-codeEditor" ).codeEditor( $.extend( {
                            mode: "text/" + lMode,
                            autofocus: true,
                            readOnly: prop.metaData.isReadOnly,
                            errors:   lProperty.errors,
                            warnings: lProperty.warnings,
                            value:    that[ "super" ]( "getValue", lProperty$ ), // todo Why do we have to pass in lProperty$ and not pElement$ ?
                            // callbacks
                            codeComplete: function( pOptions, pCallback ) {

                                // todo improve this to cache result and use model.getComponents to read local page items
                                server.process ( "getCodeCompleteList", {
                                    p_widget_name: pOptions.type,
                                    x01: pOptions.search,
                                    x02: pOptions.parent,
                                    x03: pOptions.grantParent
                                }, {
                                    success: pCallback
                                });

                            },
                            validateCode: lValidateFunction,
                            queryBuilder: lQueryBuilderFunction,
                            settingsChanged: function() {
                                lSettingsChanged = true;
                            }
                        }, $.apex.codeEditor.optionsFromSettingsString( gEditorSettings ) ) );
                        // set initial size to match dialog
                        lEditor$.height( $( this ).height() )
                            .width( $( this ).closest( ".ui-dialog" ).width() - 2 )
                            .trigger( "resize" );
                        updateChangeGeneration();
                    },
                    resizeStop: function( event, ui ) {
                        // when dialog resizes so must the editor widget
                        lEditor$.height( lEditorDlg$.height() )
                            .width( ui.size.width - 2 )
                            .trigger( "resize" );
                    },
                    buttons: lButtons
                });
            }); // openDialog

            lProperty$ = pElement$.closest( "div." + PROPERTY );

        }
    }, $.apex.propertyEditor.PROP_TYPE.TEXTAREA );

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.ITEM, {
        init: function( pElement$, prop ) {
            var i, j, lOptionsFilters, lOptionsFiltersLov,
                lOptions = {
                    columnDefinitions: [
                        {
                            name:      "name",
                            title:     msg( "NAME" ),
                            alignment: "left"
                        },
                        {
                            name:      "label",
                            title:     msg( "LABEL" ),
                            alignment: "left"
                        }
                    ],
                    filters: [
                        {
                            name:         "scope",
                            title:        msg( "ITEM_SCOPE" ),
                            type:         "buttonset",
                            defaultValue: "current_page",
                            lov: [
                                {
                                    display: msg( "CURRENT_PAGE" ),
                                    value:   "current_page"
                                },
                                {
                                    display: msg( "CUSTOM_PAGE" ),
                                    value:   "custom_page",
                                    filters: [
                                        {
                                            name:       "customPageNumber",
                                            title:      msg( "PAGE_NUMBER" ),
                                            type:       "text",
                                            isRequired: true
                                        }
                                    ]
                                },
                                {
                                    display: msg( "GLOBAL_PAGE" ),
                                    value:   "global_page"
                                },
                                {
                                    display: msg( "APPLICATION" ),
                                    value:   "application"
                                }
                            ]
                        },
                        {
                            name:  "search",
                            title: msg( "SEARCH" ),
                            type:  "search"
                        }
                    ],
                    filterLov: function ( pFilters, pRenderLovEntries ) {
                        var lType = "page",
                            lPageId;

                        switch ( pFilters.scope ) {
                            case "application":
                                lType   = "application";
                                lPageId = "";
                                break;
                            case "current_page":
                                lPageId = model.getCurrentPageId();
                                break;
                            case "global_page":
                                lPageId = model.getGlobalPageId();
                                break;
                            case "custom_page":
                                lPageId = pFilters.customPageNumber;
                                break;
                        }

                        model.getItemsLov( {
                            type:   lType,
                            pageId: lPageId
                        }, function( pLovEntries ){
                            pRenderLovEntries( pLovEntries, pFilters.search );
                        });
                    }
                };

            // For lov component scope PAGE and GLOBAL, remove 'application' and 'custom_page' filters
            if ( prop.metaData.lovComponentScope === "PAGE_AND_GLOBAL" ) {
                lOptionsFilters = lOptions.filters;
                for ( i = 0; i < lOptionsFilters.length; i++ ) {
                    if ( lOptionsFilters[ i ].name === "scope" ) {
                        lOptionsFiltersLov = lOptionsFilters[ i ].lov;
                        for ( j = 0; j < lOptionsFiltersLov.length; j++ ) {
                            if ( $.inArray( lOptionsFiltersLov[ j ].value, [ "application", "custom_page" ] ) > -1 ) {
                                lOptionsFiltersLov.splice( j, 1 );
                                j -= 1;
                            }
                        }
                    }
                }
            }

            // For lov component scope PAGE, remove 'application', 'custom_page' and 'global' filters
            if ( prop.metaData.lovComponentScope === "PAGE" ) {
                lOptionsFilters = lOptions.filters;
                for ( i = 0; i < lOptionsFilters.length; i++ ) {
                    if ( lOptionsFilters[ i ].name === "scope" ) {
                        lOptionsFiltersLov = lOptionsFilters[ i ].lov;
                        for ( j = 0; j < lOptionsFiltersLov.length; j++ ) {
                            if ( $.inArray( lOptionsFiltersLov[ j ].value, [ "application", "custom_page", "global_page" ] ) > -1 ) {
                                lOptionsFiltersLov.splice( j, 1 );
                                j -= 1;
                            }
                        }
                    }
                }
            }

            this[ "super" ]( "init", pElement$, prop, lOptions );
        }
    }, $.apex.propertyEditor.PROP_TYPE.COMBOBOX );

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PAGE, {
        init: function( pElement$, prop ) {
            var lOptions = {
                columnDefinitions: [
                    {
                        name:       "id",
                        title:      msg( "PAGE_NUMBER" ),
                        alignment:  "left"
                    },
                    {
                        name:       "name",
                        title:      msg( "PAGE_NAME" ),
                        alignment:  "left"
                    },
                    {
                        name:       "userInterface",
                        title:      msg( "USER_INTERFACE" ),
                        alignment:  "left"
                    }
                ],
                filters: [
                    {
                        name:         "userInterfaceId",
                        title:        msg( "USER_INTERFACE" ),
                        type:         "buttonset",
                        defaultValue: "current_ui",
                        lov: [
                            {
                                display: msg( "CURRENT_UI" ),
                                value:   "current_ui"
                            },
                            {
                                display: msg( "ALL_PAGES" ),
                                value:   "all"
                            }
                        ]
                    },
                    {
                        name:   "search",
                        title:  msg( "SEARCH" ),
                        type:   "search"
                    }
                ],
                filterLov: function( pFilters, pRenderLovEntries ) {
                    model.getPagesLov( pFilters, function( pLovValues ) {
                        var j, lUserInterfaceId,
                            lLovEntriesByUserInterface = [];

                        // Now deal with the exposed filter for User Interface
                        if ( pFilters.userInterfaceId === "all" ) {
                            pRenderLovEntries( pLovValues, pFilters.search );
                        } else {
                            lUserInterfaceId = model.getComponents( model.COMP_TYPE.PAGE, { id: model.getCurrentPageId() })[ 0 ].getProperty( model.PROP.USER_INTERFACE ).getValue();
                            for ( j = 0; j < pLovValues.length; j++ ) {
                                if ( pLovValues[ j ].userInterfaceId === lUserInterfaceId ) {
                                    lLovEntriesByUserInterface.push( pLovValues[ j ] );
                                }
                            }
                            pRenderLovEntries( lLovEntriesByUserInterface, pFilters.search );
                        }
                    });
                }
            };
            this[ "super" ]( "init", pElement$, prop, lOptions );
        }
    }, $.apex.propertyEditor.PROP_TYPE.COMBOBOX );


    $.apex.propertyEditor.addPropertyType( PROP_TYPE.TABLE, {
        init: function( pElement$, prop ) {
            var lOptions = {
                columnDefinitions: [
                    {
                        name:       "name",
                        title:      msg( "NAME" ),
                        alignment:  "left"
                    },
                    {
                        name:       "comment",
                        title:      msg( "COMMENT" ),
                        alignment:  "left"
                    }
                ],
                filters: [
                    {
                        name:         "type",
                        title:        msg( "TYPE" ),
                        type:         "buttonset",
                        defaultValue: "TABLE",
                        lov: [
                            {
                                display: msg( "TABLES" ),
                                value:   "TABLE"
                            },
                            {
                                display: msg( "VIEWS" ),
                                value:   "VIEW"
                            }
                        ]
                    },
                    {
                        name:  "search",
                        title: msg( "SEARCH" ),
                        type:  "search"
                    }
                ],
                filterLov: function( pFilters, pRenderLovEntries ) {
                    prop.metaData.lovValues( function( pLovEntries ){
                        pRenderLovEntries( pLovEntries, pFilters.search );
                    }, pFilters );
                }
            };
            this[ "super" ]( "init", pElement$, prop, lOptions );
        }
    }, $.apex.propertyEditor.PROP_TYPE.COMBOBOX );


    $.apex.propertyEditor.addPropertyType( PROP_TYPE.ICON, {
        init: function( pElement$, prop ) {

            var THEME_ICONS = model.getThemeIcons(),
                FA_ICONS = { /* Note: Fontawesome 4.2.0 icon css classes */
                    WEB_APPLICATION: "fa-adjust,fa-anchor,fa-archive,fa-area-chart,fa-arrows,fa-arrows-h,fa-arrows-v,fa-asterisk,fa-at,fa-automobile,fa-ban,fa-bank,fa-bar-chart,fa-bar-chart-o,fa-barcode,fa-bars,fa-beer,fa-bell,fa-bell-o,fa-bell-slash,fa-bell-slash-o,fa-bicycle,fa-binoculars,fa-birthday-cake,fa-bolt,fa-bomb,fa-book,fa-bookmark,fa-bookmark-o,fa-briefcase,fa-bug,fa-building,fa-building-o,fa-bullhorn,fa-bullseye,fa-bus,fa-cab,fa-calculator,fa-calendar,fa-calendar-o,fa-camera,fa-camera-retro,fa-car,fa-caret-square-o-down,fa-caret-square-o-left,fa-caret-square-o-right,fa-caret-square-o-up,fa-cc,fa-certificate,fa-check,fa-check-circle,fa-check-circle-o,fa-check-square,fa-check-square-o,fa-child,fa-circle,fa-circle-o,fa-circle-o-notch,fa-circle-thin,fa-clock-o,fa-close,fa-cloud,fa-cloud-download,fa-cloud-upload,fa-code,fa-code-fork,fa-coffee,fa-cog,fa-cogs,fa-comment,fa-comment-o,fa-comments,fa-comments-o,fa-compass,fa-copyright,fa-credit-card,fa-crop,fa-crosshairs,fa-cube,fa-cubes,fa-cutlery,fa-dashboard,fa-database,fa-desktop,fa-dot-circle-o,fa-download,fa-edit,fa-ellipsis-h,fa-ellipsis-v,fa-envelope,fa-envelope-o,fa-envelope-square,fa-eraser,fa-exchange,fa-exclamation,fa-exclamation-circle,fa-exclamation-triangle,fa-external-link,fa-external-link-square,fa-eye,fa-eye-slash,fa-eyedropper,fa-fax,fa-female,fa-fighter-jet,fa-file-archive-o,fa-file-audio-o,fa-file-code-o,fa-file-excel-o,fa-file-image-o,fa-file-movie-o,fa-file-pdf-o,fa-file-photo-o,fa-file-picture-o,fa-file-powerpoint-o,fa-file-sound-o,fa-file-video-o,fa-file-word-o,fa-file-zip-o,fa-film,fa-filter,fa-fire,fa-fire-extinguisher,fa-flag,fa-flag-checkered,fa-flag-o,fa-flash,fa-flask,fa-folder,fa-folder-o,fa-folder-open,fa-folder-open-o,fa-frown-o,fa-futbol-o,fa-gamepad,fa-gavel,fa-gear,fa-gears,fa-gift,fa-glass,fa-globe,fa-graduation-cap,fa-group,fa-hdd-o,fa-headphones,fa-heart,fa-heart-o,fa-history,fa-home,fa-image,fa-inbox,fa-info,fa-info-circle,fa-institution,fa-key,fa-keyboard-o,fa-language,fa-laptop,fa-leaf,fa-legal,fa-lemon-o,fa-level-down,fa-level-up,fa-life-bouy,fa-life-buoy,fa-life-ring,fa-life-saver,fa-lightbulb-o,fa-line-chart,fa-location-arrow,fa-lock,fa-magic,fa-magnet,fa-mail-forward,fa-mail-reply,fa-mail-reply-all,fa-male,fa-map-marker,fa-meh-o,fa-microphone,fa-microphone-slash,fa-minus,fa-minus-circle,fa-minus-square,fa-minus-square-o,fa-mobile,fa-mobile-phone,fa-money,fa-moon-o,fa-mortar-board,fa-music,fa-navicon,fa-newspaper-o,fa-paint-brush,fa-paper-plane,fa-paper-plane-o,fa-paw,fa-pencil,fa-pencil-square,fa-pencil-square-o,fa-phone,fa-phone-square,fa-photo,fa-picture-o,fa-pie-chart,fa-plane,fa-plug,fa-plus,fa-plus-circle,fa-plus-square,fa-plus-square-o,fa-power-off,fa-print,fa-puzzle-piece,fa-qrcode,fa-question,fa-question-circle,fa-quote-left,fa-quote-right,fa-random,fa-recycle,fa-refresh,fa-remove,fa-reorder,fa-reply,fa-reply-all,fa-retweet,fa-road,fa-rocket,fa-rss,fa-rss-square,fa-search,fa-search-minus,fa-search-plus,fa-send,fa-send-o,fa-share,fa-share-alt,fa-share-alt-square,fa-share-square,fa-share-square-o,fa-shield,fa-shopping-cart,fa-sign-in,fa-sign-out,fa-signal,fa-sitemap,fa-sliders,fa-smile-o,fa-soccer-ball-o,fa-sort,fa-sort-alpha-asc,fa-sort-alpha-desc,fa-sort-amount-asc,fa-sort-amount-desc,fa-sort-asc,fa-sort-desc,fa-sort-down,fa-sort-numeric-asc,fa-sort-numeric-desc,fa-sort-up,fa-space-shuttle,fa-spinner,fa-spoon,fa-square,fa-square-o,fa-star,fa-star-half,fa-star-half-empty,fa-star-half-full,fa-star-half-o,fa-star-o,fa-suitcase,fa-sun-o,fa-support,fa-tablet,fa-tachometer,fa-tag,fa-tags,fa-tasks,fa-taxi,fa-terminal,fa-thumb-tack,fa-thumbs-down,fa-thumbs-o-down,fa-thumbs-o-up,fa-thumbs-up,fa-ticket,fa-times,fa-times-circle,fa-times-circle-o,fa-tint,fa-toggle-down,fa-toggle-left,fa-toggle-off,fa-toggle-on,fa-toggle-right,fa-toggle-up,fa-trash,fa-trash-o,fa-tree,fa-trophy,fa-truck,fa-tty,fa-umbrella,fa-university,fa-unlock,fa-unlock-alt,fa-unsorted,fa-upload,fa-user,fa-users,fa-video-camera,fa-volume-down,fa-volume-off,fa-volume-up,fa-warning,fa-wheelchair,fa-wifi,fa-wrench".split( "," ),
                    FILE_TYPE:       "fa-file,fa-file-archive-o,fa-file-audio-o,fa-file-code-o,fa-file-excel-o,fa-file-image-o,fa-file-movie-o,fa-file-o,fa-file-pdf-o,fa-file-photo-o,fa-file-picture-o,fa-file-powerpoint-o,fa-file-sound-o,fa-file-text,fa-file-text-o,fa-file-video-o,fa-file-word-o,fa-file-zip-o".split( "," ),
                    SPINNER:         "fa-circle-o-notch,fa-cog,fa-gear,fa-refresh,fa-spinner".split( "," ),
                    FORM_CONTROL:    "fa-check-square,fa-check-square-o,fa-circle,fa-circle-o,fa-dot-circle-o,fa-minus-square,fa-minus-square-o,fa-plus-square,fa-plus-square-o,fa-square,fa-square-o".split( "," ),
                    PAYMENT:         "fa-cc-amex,fa-cc-discover,fa-cc-mastercard,fa-cc-paypal,fa-cc-stripe,fa-cc-visa,fa-credit-card,fa-google-wallet,fa-paypal".split( "," ),
                    CHART:           "fa-area-chart,fa-bar-chart,fa-bar-chart-o,fa-line-chart,fa-pie-chart".split( "," ),
                    CURRENCY:        "fa-bitcoin,fa-btc,fa-cny,fa-dollar,fa-eur,fa-euro,fa-gbp,fa-ils,fa-inr,fa-jpy,fa-krw,fa-money,fa-rmb,fa-rouble,fa-rub,fa-ruble,fa-rupee,fa-shekel,fa-sheqel,fa-try,fa-turkish-lira,fa-usd,fa-won,fa-yen".split( "," ),
                    TEXT_EDITOR:     "fa-align-center,fa-align-justify,fa-align-left,fa-align-right,fa-bold,fa-chain,fa-chain-broken,fa-clipboard,fa-columns,fa-copy,fa-cut,fa-dedent,fa-eraser,fa-file,fa-file-o,fa-file-text,fa-file-text-o,fa-files-o,fa-floppy-o,fa-font,fa-header,fa-indent,fa-italic,fa-link,fa-list,fa-list-alt,fa-list-ol,fa-list-ul,fa-outdent,fa-paperclip,fa-paragraph,fa-paste,fa-repeat,fa-rotate-left,fa-rotate-right,fa-save,fa-scissors,fa-strikethrough,fa-subscript,fa-superscript,fa-table,fa-text-height,fa-text-width,fa-th,fa-th-large,fa-th-list,fa-underline,fa-undo,fa-unlink".split( "," ),
                    DIRECTIONAL:     "fa-angle-double-down,fa-angle-double-left,fa-angle-double-right,fa-angle-double-up,fa-angle-down,fa-angle-left,fa-angle-right,fa-angle-up,fa-arrow-circle-down,fa-arrow-circle-left,fa-arrow-circle-o-down,fa-arrow-circle-o-left,fa-arrow-circle-o-right,fa-arrow-circle-o-up,fa-arrow-circle-right,fa-arrow-circle-up,fa-arrow-down,fa-arrow-left,fa-arrow-right,fa-arrow-up,fa-arrows,fa-arrows-alt,fa-arrows-h,fa-arrows-v,fa-caret-down,fa-caret-left,fa-caret-right,fa-caret-square-o-down,fa-caret-square-o-left,fa-caret-square-o-right,fa-caret-square-o-up,fa-caret-up,fa-chevron-circle-down,fa-chevron-circle-left,fa-chevron-circle-right,fa-chevron-circle-up,fa-chevron-down,fa-chevron-left,fa-chevron-right,fa-chevron-up,fa-hand-o-down,fa-hand-o-left,fa-hand-o-right,fa-hand-o-up,fa-long-arrow-down,fa-long-arrow-left,fa-long-arrow-right,fa-long-arrow-up,fa-toggle-down,fa-toggle-left,fa-toggle-right,fa-toggle-up".split( "," ),
                    VIDEO_PLAYER:    "fa-arrows-alt,fa-backward,fa-compress,fa-eject,fa-expand,fa-fast-backward,fa-fast-forward,fa-forward,fa-pause,fa-play,fa-play-circle,fa-play-circle-o,fa-step-backward,fa-step-forward,fa-stop,fa-youtube-play".split( "," ),
                    BRAND:           "fa-warning,fa-adn,fa-android,fa-angellist,fa-apple,fa-behance,fa-behance-square,fa-bitbucket,fa-bitbucket-square,fa-bitcoin,fa-btc,fa-cc-amex,fa-cc-discover,fa-cc-mastercard,fa-cc-paypal,fa-cc-stripe,fa-cc-visa,fa-codepen,fa-css3,fa-delicious,fa-deviantart,fa-digg,fa-dribbble,fa-dropbox,fa-drupal,fa-empire,fa-facebook,fa-facebook-square,fa-flickr,fa-foursquare,fa-ge,fa-git,fa-git-square,fa-github,fa-github-alt,fa-github-square,fa-gittip,fa-google,fa-google-plus,fa-google-plus-square,fa-google-wallet,fa-hacker-news,fa-html5,fa-instagram,fa-ioxhost,fa-joomla,fa-jsfiddle,fa-lastfm,fa-lastfm-square,fa-linkedin,fa-linkedin-square,fa-linux,fa-maxcdn,fa-meanpath,fa-openid,fa-pagelines,fa-paypal,fa-pied-piper,fa-pied-piper-alt,fa-pinterest,fa-pinterest-square,fa-qq,fa-ra,fa-rebel,fa-reddit,fa-reddit-square,fa-renren,fa-share-alt,fa-share-alt-square,fa-skype,fa-slack,fa-slideshare,fa-soundcloud,fa-spotify,fa-stack-exchange,fa-stack-overflow,fa-steam,fa-steam-square,fa-stumbleupon,fa-stumbleupon-circle,fa-tencent-weibo,fa-trello,fa-tumblr,fa-tumblr-square,fa-twitch,fa-twitter,fa-twitter-square,fa-vimeo-square,fa-vine,fa-vk,fa-wechat,fa-weibo,fa-weixin,fa-windows,fa-wordpress,fa-xing,fa-xing-square,fa-yahoo,fa-yelp,fa-youtube,fa-youtube-play,fa-youtube-square".split( "," ),
                    MEDICAL:         "fa-ambulance,fa-h-square,fa-hospital-o,fa-medkit,fa-plus-square,fa-stethoscope,fa-user-md,fa-wheelchair".split( "," )
                },
                CUSTOM_ICONS = ( THEME_ICONS.custom ? THEME_ICONS.custom.split( "," ) : [] );

            var lOptions = {
                    columnDefinitions: [
                        {
                            name:      "d",
                            title:     msg( "NAME" ),
                            alignment: "left"
                        }
                    ],
                    filters: [
                        {
                            name:  "search",
                            title: msg( "SEARCH" ),
                            type:  "search"
                        }
                    ],
                    filterLov: function( pFilters, pRenderLovEntries ) {

                        var lLovEntries = [];

                        function addLovEntry( pClasses ) {
                            lLovEntries.push({
                                r:       pClasses,
                                d:       pClasses,
                                preview: '<span class="fa ' + util.escapeHTMLAttr( pClasses ) + ' fa-lg"></span>'
                            });
                        }

                        function addIcons( pIcons, pIsSpinner ) {

                            for ( var i = 0; i < pIcons.length; i++ ) {
                                addLovEntry( pIcons[ i ] );
                                if ( pIsSpinner ) {
                                    addLovEntry( pIcons[ i ] + " fa-spin" );
                                }
                            }
                        }

                        if ( pFilters.type === "FONTAWESOME" ) {

                            if ( pFilters.category === "" ) {
                                for ( var lCategory in FA_ICONS ) {
                                    if ( FA_ICONS.hasOwnProperty( lCategory )) {
                                        addIcons( FA_ICONS[ lCategory ], ( lCategory === "SPINNER" ));
                                    }
                                }
                            } else {
                                addIcons( FA_ICONS[ pFilters.category ], ( pFilters.category === "SPINNER" ));
                            }

                            pRenderLovEntries( lLovEntries, pFilters.search );

                        } else if ( pFilters.type === "CUSTOM" ) {

                            addIcons( CUSTOM_ICONS, false );

                            pRenderLovEntries( lLovEntries, pFilters.search );

                        } else if ( !pFilters.type || pFilters.type === "UTILIZED" ) {

                            prop.metaData.lovValues( function( pLovEntries ){

                                for ( var i = 0; i < pLovEntries.length; i++ ) {
                                    addLovEntry( pLovEntries[ i ].r );
                                }

                                pRenderLovEntries( lLovEntries, pFilters.search );
                            }, pFilters );

                        }
                    }
                },
                lTypeFilter = {
                    name:         "type",
                    title:        msg( "TYPE" ),
                    type:         "buttonset",
                    defaultValue: "",
                    lov:          []
                },
                lCategoryFilter;


            //
            // Initialize the available icon selection based on the theme icon configuration
            //

            // The theme does have a custom list of icon css classes
            if ( CUSTOM_ICONS.length > 0 ) {

                // Add "Custom" as new selection of the "type" buttonset
                lTypeFilter.lov.push({
                    display: msg( "CUSTOM" ),
                    value:   "CUSTOM"
                });
                lTypeFilter.defaultValue = "CUSTOM";
            }

            // The theme uses the fontawesome icon library
            if ( THEME_ICONS.library === "FONTAWESOME" ) {

                // Fontawesome icons are safe, we can preview them in the dialog
                lOptions.columnDefinitions.push({
                    name:      "preview",
                    title:     msg( "PREVIEW" ),
                    alignment: "center",
                    width:     "20%",
                    escape:    false
                });

                // Add all FA categories to the fontawesome/category select list
                lCategoryFilter = {
                    name:         "category",
                    title:        msg( "CATEGORY" ),
                    type:         "select",
                    defaultValue: "WEB_APPLICATION",
                    lov:          []
                };

                for ( var lCategory in FA_ICONS ) {
                    if ( FA_ICONS.hasOwnProperty( lCategory )) {
                        lCategoryFilter.lov.push({
                            display: msg( "FA." + lCategory ),
                            value:   lCategory
                        });
                    }
                }

                // Add "Font Awesome" as new selection of the "type" buttonset
                lTypeFilter.lov.unshift({
                    display: "Font Awesome",
                    value:   "FONTAWESOME",
                    filters: [ lCategoryFilter ]
                });
                lTypeFilter.defaultValue = "FONTAWESOME";

                // Dynamically load Fontawesome CSS file if it hasn't been loaded yet so that we are able to preview the icons
                if ( !gFontAwesome$ ) {
                    gFontAwesome$ = $( '<link rel="stylesheet" type="text/css" href="' + apex_img_dir + 'libraries/font-awesome/4.2.0/css/font-awesome.min.css" />' ).appendTo( "head" );
                }

            }

            // If we have at least one type entry, we add a "Utilized" selection and add the "type" buttonset
            // to the search filters. We want to avoid that we only have the "Utilized" selection if fontawesome
            // and custom icons are not used.
            if ( lTypeFilter.lov.length > 0 ) {
                lTypeFilter.lov.push({
                    display: msg( "UTILIZED" ),
                    value:   "UTILIZED"
                });
                lOptions.filters.unshift( lTypeFilter );
            }


            this[ "super" ]( "init", pElement$, prop, lOptions );
        }
    }, $.apex.propertyEditor.PROP_TYPE.COMBOBOX );


    $.apex.propertyEditor.addPropertyType( PROP_TYPE.CSS,                   null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.JAVASCRIPT,            null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.HTML,                  null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL,                 null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_EXPR_VARCHAR,    null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_EXPR_BOOLEAN,    null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_FUNC_VARCHAR,    null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_FUNC_BOOLEAN,    null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SQL,                   null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SQL_EXPR,              null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.XML,                   null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.TEMPLATE_OPTIONS_GENERAL, {

        init: function( pElement$, prop ) {

            var lDefaultCheckboxes$ = $();

            function _setDefaultOptions( ) {

                var lChecked = $( this ).prop( "checked" );

                if ( lChecked ) {
                    lDefaultCheckboxes$.prop( "checked", true );
                }

                lDefaultCheckboxes$.prop( "disabled", lChecked );

            } // _setDefaultOptions


            // call base checkboxes
            this[ "super" ]( "init", pElement$, prop );

            this.checkboxes$      = pElement$.find( "input[type=checkbox]" );
            this.defaultCheckbox$ = this.checkboxes$.filter( "[value='#DEFAULT#']" );

            // Get all default template options checkboxes
            for ( var i = 0; i < prop.metaData.defaultTemplateOptions.length; i++ ) {
                lDefaultCheckboxes$ =
                    lDefaultCheckboxes$.add( this.checkboxes$.filter( "[value='" + util.escapeCSS( prop.metaData.defaultTemplateOptions[ i ]) + "']" ));
            }

            this.defaultCheckbox$
                .on( "click setdefaultcheckboxes", _setDefaultOptions )
                .trigger( "setdefaultcheckboxes" );
        },
        getValue: function( pProperty$ ) {
            var lValues = [];

            // ignore default options
            this.checkboxes$.filter( ":checked:not(:disabled)" ).each( function() {
                lValues.push( this.value );
            });
            return lValues.join( ":" );
        },
        setValue: function( pElement$, prop, value ) {
            this[ "super" ]( "setValue", pElement$, prop, value );
            this.defaultCheckbox$.trigger( "setdefaultcheckboxes" );
        }

    }, $.apex.propertyEditor.PROP_TYPE.CHECKBOXES );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.TEMPLATE_OPTIONS, {

        _getProperties: function( pProperty$, prop ) {

            var lValues           = this.getValue( pProperty$ ).split( ":" ),
                i,
                lGroupId,
                lGroupIdx,
                lDisplayGroupId,
                lGroups           = [],
                lGroupsMap        = {},
                lGeneralValues    = [],
                lGeneralLovValues = [],
                lProperties       = {
                    common:   [],
                    advanced: []
                };

            // Build a list of "general" template options and one for each group
            for ( i = 0; i < this.templateOptions.values.length; i++ ) {

                if ( this.templateOptions.values[ i ].groupId ) {
                    lGroupId = this.templateOptions.values[ i ].groupId;
                    if ( !lGroupsMap.hasOwnProperty( lGroupId )) {
                        lGroups.push({
                            title:      this.templateOptions.groups[ lGroupId ].title,
                            seq:        this.templateOptions.groups[ lGroupId ].seq,
                            nullText:   this.templateOptions.groups[ lGroupId ].nullText,
                            isAdvanced: this.templateOptions.groups[ lGroupId ].isAdvanced,
                            isRequired: false,
                            lovValues:  [],
                            value:      ""
                        });
                        lGroupIdx = lGroups.length - 1;
                        lGroupsMap[ lGroupId ] = lGroupIdx;
                    } else {
                        lGroupIdx = lGroupsMap[ lGroupId ];
                    }
                    // If a preset is set for one of the list of values entries of the group, we expect that the
                    // group has to be required
                    if ( $.inArray( this.templateOptions.values[ i ].r, this.templateOptions.presetValues ) !== -1 ) {
                        lGroups[ lGroupIdx ].isRequired = true;
                        if ( lGroups[ lGroupIdx ].value === "" ) {
                            lGroups[ lGroupIdx ].value = this.templateOptions.values[ i ].r;
                        }
                    }
                    // Set the current selection for that group
                    if ( $.inArray( this.templateOptions.values[ i ].r, lValues ) !== -1 ) {
                        lGroups[ lGroupIdx ].value = this.templateOptions.values[ i ].r;
                    }
                    lGroups[ lGroupIdx ].lovValues.push({
                        r: this.templateOptions.values[ i ].r,
                        d: this.templateOptions.values[ i ].d
                    });

                } else {

                    lGeneralLovValues.push( this.templateOptions.values[ i ] );

                    // Is the LOV value one of our selected values?
                    if ( $.inArray( this.templateOptions.values[ i ].r, lValues ) !== -1 ) {
                        lGeneralValues.push( this.templateOptions.values[ i ].r );
                    }

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

            // There is always a "General" property, because we will at least have a #DEFAULT# entry
            lProperties.common[ 0 ] = {
                propertyName: "general",
                value:        lGeneralValues.join( ":" ),
                metaData: {
                    type:           PROP_TYPE.TEMPLATE_OPTIONS_GENERAL,
                    prompt:         msg( "TEMPLATE_OPTIONS.GENERAL" ),
                    isReadOnly:     prop.metaData.isReadOnly,
                    isRequired:     false,
                    lovValues:      lGeneralLovValues,
                    displayGroupId: "common",
                    defaultTemplateOptions: this.templateOptions.defaultValues
                },
                errors:   [],
                warnings: []
            };

            // Add a select list for each template options group
            for ( i = 0; i < lGroups.length; i++ ) {

                if ( lGroups[ i ].isAdvanced ) {
                    lDisplayGroupId = "advanced";
                } else {
                    lDisplayGroupId = "common";
                }
                lProperties[ lDisplayGroupId ].push({
                    propertyName: "grp" + i,
                    value:        lGroups[ i ].value,
                    metaData: {
                        type:       $.apex.propertyEditor.PROP_TYPE.SELECT_LIST,
                        prompt:     lGroups[ i ].title,
                        isReadOnly: prop.metaData.isReadOnly,
                        isRequired: lGroups[ i ].isRequired,
                        nullText:   lGroups[ i ].nullText,
                        lovValues:  lGroups[ i ].lovValues,
                        displayGroupId: lDisplayGroupId
                    },
                    errors:   [],
                    warnings: []
                });
            }

            return lProperties;

        }, // _getProperties

        _getDisplayValue: function( prop ) {
            var lValuesMap,
                lDisplayValues = [],
                lValue = prop.value,
                lValues = lValue.split( ":" );

            this.templateOptions = model.getTemplateOptions( gLastComponents[ 0 ].getProperty( prop.propertyName ) );   // todo If multiple components are selected

            if ( lValue === "" ) {

                return msg( "TEMPLATE_OPTIONS.NONE_SELECTED" );

            } else {

                lValuesMap = this.templateOptions.valuesMap;

                for ( var i = 0; i < lValues.length; i++ ) {
                    if ( lValuesMap.hasOwnProperty( lValues[ i ] )) {
                        lDisplayValues.push( lValuesMap[ lValues[ i ] ].d );
                    } else {
                        lDisplayValues.push( formatNoEscape( "LOV.UNKNOWN_LOOKUP", lValues[ i ] ));
                    }
                }

                return lDisplayValues.join( ", " );
            }

        }, // _getDisplayValue

        /* Property type properties and callbacks */
        noLabel: true,
        render: function( out, id, prop ) {
            var lLabelId = id + "_label",
                lIsDisabled,
                lDisplayValue = this._getDisplayValue( prop );

            // If the template options just contain the #DEFAULT# entry then there is no need to open the dialog. This will
            // give developers a immediate feedback if options are available
            lIsDisabled = ( this.templateOptions.values.length < 2 );

            this.renderDivOpen( out, { "class": PROPERTY_FIELD_CONTAINER } );
            out.markup( "<button" )
                .attr( "type", "button" )
                .attr( "id", id )
                .attr( "aria-describedby", lLabelId )
                .attr( "class", BUTTON + " " + BUTTON_PROPERTY )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                .attr( "value", prop.value )
                .optionalAttr( "disabled", lIsDisabled )
                .markup( ">" )
                .content( lDisplayValue )
                .markup( "</button>" );
            this.renderDivClose( out );
        },
        init: function( pElement$, prop ) {
            var that = this;

            that.addLabelClickHandler( pElement$, prop );
            that.addTooltipsForErrors( pElement$, prop );

            // the main click handler that launches the link dialog
            pElement$.closest( "div." + PROPERTY ).on( "click", "#" + pElement$.attr( "id" ), function() {

                var lDialog$,
                    lProperties = that._getProperties( pElement$.closest( "div." + PROPERTY ), prop ), //todo change to use lElement$
                    out         = util.htmlBuilder();

                // create dialog div
                out.markup( "<div" )
                    .attr( "id", "templateOptionsDlg" )
                    .attr( "title", prop.metaData.prompt ) // escaping done by jQueryUI dialog
                    .markup( ">" )
                    .markup( "<div" )
                    .attr( "id", "templateOptionsDlgPE" )
                    .markup( ">" )
                    .markup( "</div>" )
                    .markup( "</div>" );

                lDialog$ = $( out.toString() ).dialog({
                    modal:       true,
                    closeText:   lang.getMessage( "APEX.DIALOG.CLOSE" ),
                    minWidth:    400,
                    width:       520,
                    dialogClass: DIALOG_FLUSH_BODY,
                    close: function() {
                        $( "#templateOptionsDlgPE" ).propertyEditor( "destroy" );
                        lDialog$.dialog( "destroy" );
                    },
                    open: function() {
                        var lDialogPE$ = $( "#templateOptionsDlgPE" );
                        lDialogPE$.propertyEditor( {
                            focusPropertyName: "general",
                            hideDisplayGroups: ( lProperties.advanced.length === 0 ),
                            data: {
                                propertySet: [{
                                    displayGroupId:    "common",
                                    displayGroupTitle: msg( "TEMPLATE_OPTIONS.COMMON" ),
                                    properties:        lProperties.common
                                },
                                {
                                    displayGroupId:    "advanced",
                                    displayGroupTitle: msg( "TEMPLATE_OPTIONS.ADVANCED" ),
                                    properties:        lProperties.advanced
                                }]
                            },
                            change: function( pEvent, pData ) {
                            }
                        });

                        $( "#templateOptionsDlg" ).dialog({
                            position: { 'my': 'center', 'at': 'center' }
                        });
                    },
                    buttons: [
                        {
                            text:  msg( "CANCEL" ),
                            click: function() {
                                lDialog$.dialog( "close" );
                            }
                        },
                        {
                            text:     msg( "OK" ),
                            "class":    BUTTON_HOT,
                            disabled: prop.metaData.isReadOnly,
                            click:    function() {

                                var lDialogPE$ = $( "#templateOptionsDlgPE" ),
                                    lValue,
                                    lValues = [];

                                function addValues( pProperties ) {
                                    for ( var i = 0; i < pProperties.length; i++ ) {
                                        lValue = lDialogPE$.propertyEditor( "getPropertyValue", pProperties[ i ].propertyName );
                                        if ( lValue !== "" ) {
                                            lValues.push( lValue );
                                        }
                                    }
                                }

                                // Get selected template options from all our properties
                                addValues( lProperties.common );
                                addValues( lProperties.advanced );

                                // and store the concatenated result in our "Template Options" property
                                that.setValue( pElement$, prop, lValues.join( ":" ));
                                pElement$.trigger( "change" );
                                that.setFocus( pElement$ );
                                lDialog$.dialog( "close" );
                            }
                        }
                    ]
                });
            });
        },
        setValue: function( pElement$, prop, pValue ) {

            var lDisplayValue;

            this[ "super" ]( "setValue", pElement$, prop, pValue );

            // update the button text accordingly
            lDisplayValue = this._getDisplayValue( prop );
            pElement$
                .html( lDisplayValue )
                .attr( "title", lDisplayValue );
        }
    });
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SUBSCRIPTION, null, $.apex.propertyEditor.PROP_TYPE.TEXT );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.OWNER,        null, $.apex.propertyEditor.PROP_TYPE.SELECT_LIST );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.COLUMN,       null, $.apex.propertyEditor.PROP_TYPE.SELECT_LIST );


    /*
     * Returns the value for a property
     * If multiple components and the values vary, then return the PE widget constant VALUE_VARIES.
     */
    function _getPropertyValue( pComponents, pPropertyId ) {
        var i, lPropertyValue;
        for ( i = 0; i < pComponents.length; i++ ) {
            if ( i === 0 ) {
                lPropertyValue = pComponents[ i ].getProperty( pPropertyId ).getValue();
            } else {
                if ( lPropertyValue !== pComponents[ i ].getProperty( pPropertyId ).getValue() ) {
                    lPropertyValue = pe$.propertyEditor( "getValueVariesConstant" );

                    // As soon as we have a value that varies, stop checking further components
                    break;
                }
            }
        }
        return lPropertyValue;
    }

    // Look through notification properties, and return an array of properties that are relevant based on
    // events passed in pEvents
    function _getEventSpecificProperties ( pProperties, pEvents ) {
        var lKey, i,
            lEvents = [],
            lReturnProperties = [];
        for ( lKey in pProperties ) {
            if ( pProperties.hasOwnProperty( lKey ) ) {
                lEvents = pProperties[ lKey ];
                for ( i = 0; i < lEvents.length; i++ ) {

                    // Store property if it's event matches, and if it hasn't already been added
                    if ( ( $.inArray( lEvents[ i ], pEvents ) > -1 ) && $.inArray( lKey, lReturnProperties ) === -1 ) {
                        lReturnProperties.push( lKey );
                    }
                }
            }
        }
        return lReturnProperties;
    }

    // transforms a property from the client data model into a Property Editor format property
    function _toPEProperty ( pProperty, pComponents ) {

        var i, j, k, lLovValues,
            lMasterLovValues = [],
            lAllLovValues = [],
            lPropertyMetaData = pProperty.getMetaData(),
            TYPES_TO_CHECK_LOV_VALUES = [ PROP_TYPE.SELECT_LIST, PROP_TYPE.COMPONENT, PROP_TYPE.SUPPORTED_UI ];

        if ( pComponents.length > 1 ) {

            if ( $.inArray( lPropertyMetaData.type, TYPES_TO_CHECK_LOV_VALUES ) !== -1 ) {

                // loop through all components selected, and build array of all lov value arrays
                for ( i = 0; i < pComponents.length; i++ ) {
                    lLovValues = {
                        values: pComponents[ i ].getProperty( pProperty.id ).getMetaData().lovValues(),
                        map:    {}
                    };
                    // build a lookup map for a quicker check if a lov value exists
                    for ( j = 0; j < lLovValues.values.length; j++ ) {
                        lLovValues.map[ lLovValues.values[ j ].r ] = true;
                    }
                    lAllLovValues.push( lLovValues );
                }

                // Sort arrays to get the shortest array at the beginning. The first array is used as the master, so
                // by sorting we reduce the number of comparisons we have to make.
                lAllLovValues.sort(function(a, b) {
                    return a.values.length - b.values.length;
                });

                // Store first array (which is also now the shortest), which will be used as the master list
                lMasterLovValues = lAllLovValues[ 0 ].values;

                // Now let's go through each subsequent array, and remove items from the master array if they are not found
                for ( j = 1; j < lAllLovValues.length; j++ ) {

                    for ( k = 0; k < lMasterLovValues.length; k++ ) {

                        // If we don't find a match, remove from the master array
                        if ( !lAllLovValues[ j ].map.hasOwnProperty( lMasterLovValues[ k ].r )) {
                            lMasterLovValues.splice(k, 1);
                            k -= 1; // k stays the same for next iteration
                        }

                    }
                }

                // Update the metadata with the new master lov values array
                lPropertyMetaData.lovValues = lMasterLovValues;

            }
        }

        return {
            metaData:     lPropertyMetaData,
            propertyName: pProperty.id,
            errors:       pProperty.errors,
            warnings:     pProperty.warnings,
            value:        _getPropertyValue( pComponents, pProperty.id ),
            oldValue:     _getPropertyValue( pComponents, pProperty.id )
        };
    }

    function _setPropertyEditorTitle( pComponentTypeTitle, pComponentTypeId ) {
        var lTabs$,
            lPETitle = "";

        // Tab layout in PE
        if ( pComponentTypeTitle ) {
            lPETitle = pComponentTypeTitle;
        } else {
            lPETitle = formatNoEscape( "TITLE" );
        }
        lTabs$ = $( "#right_col" ).find( ".ui-tabs-anchor" );
        lTabs$.eq( 0 ).text( lPETitle );

        // Always hide "Second Tab", gives constant 50% width for first tab
        lTabs$.eq( 1 ).hide();

    }

    function _clearPropertyEditor() {

        gLastComponents = null;

        pe$.propertyEditor("option", {
            data: {
                propertySet: [],
                propertyValues: []
            }
        });

        pd.clearHelpText();

        _setPropertyEditorTitle();

        // disable all PE toolbar buttons
        $( "#peToolbar" ).find( "button" ).each(function() {
            $( this ).prop( "disabled", true );
        });

        model.unobserver( PE_WIDGET_NAME, {} );
    }

    // Render property editor for selected component(s)
    function _selectionChanged( pComponents, pPropertyId ) {
        var i, lComponentTypeId,
            lComponentTypeTitle = "";

        if ( pComponents.length > 0 ) {

            for ( i = 0; i < pComponents.length; i++ ) {
                if ( i === 0 ) {
                    lComponentTypeTitle = model.getComponentType( pComponents[ i ].typeId ).title.singular;
                    lComponentTypeId = pComponents[ i ].typeId;
                } else {
                    if ( pComponents[ i ].typeId === pComponents[ i - 1 ].typeId ) {
                        lComponentTypeTitle = model.getComponentType( pComponents[ i ].typeId ).title.plural;
                        lComponentTypeId = pComponents[ i ].typeId;
                    } else {
                        lComponentTypeTitle = msg( "MULTIPLE_TYPES" );

                        // as soon as we know we have different component types, exit out
                        break;
                    }
                }
            }

            gLastComponents = pComponents;
            selectComponents( pComponents, pPropertyId );
            _setPropertyEditorTitle( lComponentTypeTitle, lComponentTypeId );


            // enable all PE toolbar buttons
            $( "#peToolbar" ).find( "button" ).each(function() {
                $( this ).prop( "disabled", false );
            });

        } else {
            _clearPropertyEditor();
        }

    }


    function selectComponents( pComponents, pPropertyId ) {

        var i, j, k,
            lPropertyId,
            lPropertyValue,
            lProperty,
            lGroupId,
            lComponent,
            lExclude,
            lProperties,
            lComponentType,
            lComponentTypeEditFunction,
            lPropertyMetaData  = {},
            lGroups    = [],
            lGroupsMap = {},
            peGoToGroupMenu,
            peGoToGroup$,
            peGoToGroupMenuItems = [];

        lComponentType = model.getComponentType( pComponents[ 0 ].typeId );

        // For Shared Components we only want to show the "Name" property
        if ( lComponentType.isSharedComponent ) {
            lProperties = [ pComponents[ 0 ].getProperty( lComponentType.displayPropertyId ) ];
        } else {
            lProperties = pComponents[ 0 ].getProperties();
        }

        // create array of property metadata, indexed by property ID
        for ( i = 0; i < lProperties.length; i++ ) {
            lPropertyMetaData[ lProperties[ i ].id ] = lProperties[ i ].getMetaData();
        }

        // then sorting our properties, by referencing the meta data display sequence, using the property ID as the index
        lProperties.sort( function( a, b ) {
            return ( lPropertyMetaData[ a.id ].displaySeq - lPropertyMetaData[ b.id ].displaySeq );
        });

        // Multi-edit specifics; only keep common properties
        if ( pComponents.length > 1 ) {

            for ( i = 0; i < lProperties.length; i++ ) {
                lProperty = lProperties[ i ];
                lExclude = false;

                // first if this property is unique, or its type is not eligible for multi-edit, set the exclude flag
                if ( lPropertyMetaData[ lProperty.id ].isUnique || $.inArray( lPropertyMetaData[ lProperty.id ].type, TYPES_EXCLUDED_FROM_MULTI_EDIT ) > -1 ) {
                    lExclude = true;
                }

                // if the exclude flag is not yet set, check if any of the current components do not have this property
                if ( !lExclude ) {
                    for ( j = 1; j < pComponents.length; j++ ) {
                        lComponent = pComponents[ j ];
                        // if component doesn't have property then exclude this property and no need to look at any other components
                        if ( !lComponent.getProperty( lProperty.id )) {
                            lExclude = true;
                            break;
                        }
                    }
                }

                if ( lExclude ) {
                    // remove property and the metadata
                    delete lPropertyMetaData[ lProperty.id ];
                    lProperties.splice(i, 1);
                    i -= 1; // i stays the same for next iteration
                }
            }

        }

        // Build a list of display groups and properties in the order of the property sequence.
        // The first reference of a display group by a property defines it's overall display order.
        for ( i = 0; i < lProperties.length; i++ ) {
            lProperty   = lProperties[ i ];
            lPropertyId = lProperty.id;
            lPropertyValue = _getPropertyValue( pComponents, lPropertyId );
            lGroupId    = lPropertyMetaData[ lPropertyId ].displayGroupId;

            // Exclude HIDDEN property types, these should not be passed to the property editor
            if ( lPropertyMetaData[ lPropertyId ].type !== PROP_TYPE.HIDDEN ) {

                // If it's a new group which we haven't stored yet, add it in sequence to our group array
                if ( !lGroupsMap.hasOwnProperty( lGroupId )) {

                    lGroups.push({
                        displayGroupId:    lGroupId,
                        displayGroupTitle: model.getDisplayGroup( lGroupId ).title,
                        collapsed:         !!gCurrentCollapsedGroups[lGroupId],
                        properties:        []
                    });
                    lGroupsMap[ lGroupId ] = lGroups.length - 1;
                }

                // Add the property as next displayed property to it's group
                lGroups[ lGroupsMap[ lGroupId ]].properties.push( _toPEProperty ( lProperty, pComponents ));
            }
        }

        // go to group
        for ( k = 0; k < lGroups.length; k++ ) {
            peGoToGroupMenuItems.push({
                type: "action",
                label: lGroups[ k ].displayGroupTitle,
                value: lGroups[ k ].displayGroupId,
                action: function () {
                    showAll();
                    pe$.propertyEditor( "goToGroup", this.value );

                    // return true so the menu doesn't handle focus
                    return true;
                }
            });
        }
        peGoToGroupMenu = { items: peGoToGroupMenuItems };
        peGoToGroup$ = $( "#pe_goto_group_menu" );
        peGoToGroup$.menu( peGoToGroupMenu );

        // Edit Component logic, for component edits external to the PE (components from global page, shared components)
        if ( pComponents.length === 1 ) {
            lComponent = pComponents[ 0 ];
            if ( lComponentType.isSharedComponent ) {
                lComponentTypeEditFunction = function() {
                    nav.redirect( lComponentType.editUrl
                        .replace( /%session%/g, $v( "pInstance" ) )
                        .replace( /%pk_value%/g, lComponent.id )
                        .replace( /%application_id%/g, model.getCurrentAppId() )
                        .replace( /%page_id%/g, model.getCurrentPageId() ) );
                };
            }
            if ( lComponent.isOnGlobalPage() ) {
                lComponentTypeEditFunction = function() {
                    pd.setPageSelection( model.getCurrentAppId(), lComponent.pageId, lComponent.typeId, lComponent.id, function() {} );
                };
            }
        }

        // Set widget options for newly selected component
        pe$.propertyEditor( "option", {
            focusPropertyName:  pPropertyId,
            externalEdit:       lComponentTypeEditFunction,
            // set general options prior to setting the data (because that does the refresh)
            data: {
                propertySet:    lGroups,
                componentCount: pComponents.length
            }
        });

        // Add observers for all the displayed components
        model.unobserver( PE_WIDGET_NAME, {});
        model.observer(
            PE_WIDGET_NAME, {
                components: pComponents,
                events: [
                    model.EVENT.CHANGE ]
            },
            function( pNotifications ) {

                var i, lPropertyId,
                    lProperties = {},
                    lComponents = [];

                debug.trace( "%s: CHANGE component notification received", PE_WIDGET_NAME, pNotifications );

                // first we have to loop through the notifications, to build up a complete list of components changed.
                for ( i = 0; i < pNotifications.length; i++ ) {
                    lComponents.push( pNotifications[ i ].component );

                    for ( lPropertyId in pNotifications[ i ].properties ) {
                        if ( pNotifications[ i ].properties.hasOwnProperty( lPropertyId ) && $.inArray( model.EVENT.CHANGE, pNotifications[ i ].properties[ lPropertyId ]) !== -1 ) {
                            lProperties[ lPropertyId ] = true;
                        }
                    }
                }
                for ( lPropertyId in lProperties ) {
                    if ( lProperties.hasOwnProperty( lPropertyId ) ) {
                        pe$.propertyEditor( "updatePropertyValue", lPropertyId, _getPropertyValue( lComponents, lPropertyId ), true );
                    }
                }
            },
            true
        );
        model.observer(
            PE_WIDGET_NAME, {
                components: pComponents,
                events: [
                    model.EVENT.ADD_PROP,
                    model.EVENT.REMOVE_PROP ]
            },
            function( pNotifications ) {

                var lComponentType, lProperties, lProperty, lExclude, lComponent, i, j, k, m, n, lPropertyToAdd,
                    lPropertiesToAdd, lPropertiesToRemove, lDisplayGroupId, lPropertyId,
                    lPropertyMetaData = {},
                    lComponents = [],
                    lDisplayGroupArray = [];

                debug.trace( "%s: ADD_PROP/REMOVE_PROP notification received", PE_WIDGET_NAME, pNotifications );

                // first we have to loop through the notifications, to build up a complete list of components changed.
                for ( i = 0; i < pNotifications.length; i++ ) {
                    lComponents.push( pNotifications[ i ].component );
                }

                lPropertiesToAdd = _getEventSpecificProperties( pNotifications[ 0 ].properties, [ model.EVENT.ADD_PROP ] );

                lComponentType = model.getComponentType( pComponents[ 0 ].typeId );

                // For Shared Components we only want to show the "Name" property
                if ( lComponentType.isSharedComponent ) {
                    lProperties = [ pComponents[ 0 ].getProperty( lComponentType.displayPropertyId ) ];
                } else {
                    lProperties = pComponents[ 0 ].getProperties();
                }
                // create array of property metadata, indexed by property ID
                for ( j = 0; j < lProperties.length; j++ ) {
                    lPropertyMetaData[ lProperties[ j ].id ] = lProperties[ j ].getMetaData();
                }

                // then sorting our properties, by referencing the meta data display sequence, using the property ID as the index
                lProperties.sort( function( a, b ) {
                    return ( lPropertyMetaData[ a.id ].displaySeq - lPropertyMetaData[ b.id ].displaySeq );
                });

                if ( pComponents.length > 1 ) {
                    // go through all components and only keep the properties in common
                    for ( k = 0; k < lProperties.length; k++ ) {
                        lProperty = lProperties[ k ];

                        lExclude = false;

                        // first if this property is unique, or its type is not eligible for multi-edit, set the exclude flag
                        if ( lPropertyMetaData[ lProperty.id ].isUnique || $.inArray( lPropertyMetaData[ lProperty.id ].type, TYPES_EXCLUDED_FROM_MULTI_EDIT ) > -1 ) {
                            lExclude = true;
                        }

                        // if the exclude flag is not yet set, check if any of the current components do not have this property
                        if ( !lExclude ) {
                            for ( m = 1; m < pComponents.length; m++ ) {
                                lComponent = pComponents[ m ];
                                // if component doesn't have property then exclude this property and no need to look at any other components
                                if ( !lComponent.getProperty( lProperty.id )) {
                                    lExclude = true;
                                    break;
                                }
                            }
                        }

                        if ( lExclude ) {
                            // remove property and the metadata
                            delete lPropertyMetaData[ lProperty.id ];
                            lProperties.splice(k, 1);
                            k -= 1; // k stays the same for next iteration
                        }
                    }
                }

                // now that we know all the properties that should be displayed from the model, look for our
                // new property in the lProperties array, then use that
                // to get the previous property, display group and previous display group
                for ( n = 0; n < lProperties.length; n++ ) {
                    lPropertyId = lProperties[ n ].id;

                    // exclude HIDDEN properties
                    if ( lPropertyMetaData[ lPropertyId ].type !== PROP_TYPE.HIDDEN ) {

                        lDisplayGroupId = lPropertyMetaData[ lPropertyId ].displayGroupId;

                        // build array of unique display groups to get easy access to previous display group
                        if ( n === 0 ) {
                            lDisplayGroupArray.push( lDisplayGroupId );
                        } else {
                            // if this isn't the first iteration, check the previous group, if it's different, add to array
                            if ( lDisplayGroupId !== lPropertyMetaData[ lProperties[ n - 1 ].id ].displayGroupId ) {
                                lDisplayGroupArray.push( lDisplayGroupId );
                            }
                        }

                        // loop over properties to add and check if this property is to be added
                        for ( i = 0; i < lPropertiesToAdd.length; i++ ) {
                            if ( lPropertyId === lPropertiesToAdd[ i ] ) {

                                // store property to add
                                lPropertyToAdd = pNotifications[ 0 ].component.getProperty( lPropertiesToAdd[ i ] );

                                pe$.propertyEditor( "addProperty", {
                                    property:           _toPEProperty( lPropertyToAdd, lComponents ),
                                    prevPropertyName:   lProperties[ n - 1 ].id,
                                    displayGroup:       {
                                        displayGroupId:     lPropertyMetaData[ lProperties[ n ].id ].displayGroupId,
                                        displayGroupTitle:  model.getDisplayGroup( lDisplayGroupId ).title,
                                        properties:         []
                                    },
                                    prevDisplayGroupId: lDisplayGroupArray[ lDisplayGroupArray.length - 2 ]
                                });

                                // exit loop, we have found our new property
                                break;
                            }
                        }
                    }
                }


                // properties to remove
                lPropertiesToRemove = _getEventSpecificProperties( pNotifications[ 0 ].properties, [ model.EVENT.REMOVE_PROP ] );
                for ( i = 0; i < lPropertiesToRemove.length; i++ ) {
                    pe$.propertyEditor( "removeProperty", lPropertiesToRemove[ i ] );
                }

            },
            true
        );
        model.observer(
            PE_WIDGET_NAME, {
                components: pComponents,
                events: [
                    model.EVENT.ERRORS,
                    model.EVENT.NO_ERRORS,
                    model.EVENT.WARNINGS,
                    model.EVENT.NO_WARNINGS,
                    model.EVENT.META_DATA ]
            },
            function( pNotifications ) {

                var i, j, lAffectedProperties, lProperty, lPEProperty,
                    lComponents = [];

                debug.trace( "%s: ERRORS/NO_ERRORS/WARNINGS/NO_WARNINGS/META_DATA notification received", PE_WIDGET_NAME, pNotifications );

                // first we have to loop through the notifications, to build up a complete list of components changed.
                for ( i = 0; i < pNotifications.length; i++ ) {
                    lComponents.push( pNotifications[ i ].component );
                }

                lAffectedProperties = _getEventSpecificProperties( pNotifications[ 0 ].properties, [ model.EVENT.ERRORS, model.EVENT.NO_ERRORS, model.EVENT.WARNINGS, model.EVENT.NO_WARNINGS, model.EVENT.META_DATA ] );
                for ( j = 0; j < lAffectedProperties.length; j++ ) {
                    lProperty = pNotifications[ 0 ].component.getProperty( lAffectedProperties[ j ] );

                    lPEProperty = _toPEProperty( lProperty, lComponents );

                    pe$.propertyEditor( "updateProperty", lPEProperty );
                }

            },
            true
        );

        model.observer(
            PE_WIDGET_NAME,
            {
                components: pComponents,
                events:     [ model.EVENT.DELETE ]
            },
            function( pNotifications ) {

                var i, j;

                debug.trace( "%s: DELETE component notification received", PE_WIDGET_NAME, pNotifications );

                // loop through current selected components
                for ( j = 0; j < gLastComponents.length; j++ ) {

                    // check if it has been deleted by looping through deleted components
                    for ( i = 0; i < pNotifications.length; i++ ) {
                        if ( pNotifications[ i ].component.typeId === gLastComponents[ j ].typeId ) {
                            gLastComponents.splice( j, 1 );
                            j -= 1;
                            break;
                        }
                    }
                }

                _selectionChanged( gLastComponents );

            },
            true
        );
    }

    function showCommon() {
        pe$.propertyEditor( "option", "showAll", false );
        gShowCommon$.addClass( IS_ACTIVE );
        gShowAll$.removeClass( IS_ACTIVE );
        gShowing = SHOW_COMMON;
        pd.saveBoolPref( PREF_SHOW_ALL, false );
    }

    function showAll() {
        pe$.propertyEditor( "option", "showAll", true );
        gShowAll$.addClass( IS_ACTIVE );
        gShowCommon$.removeClass( IS_ACTIVE );
        gShowing = SHOW_ALL;
        pd.saveBoolPref( PREF_SHOW_ALL, true );
    }

    $( document ).ready( function() {
        var lPEMenu, lPEMenu$,
            lKeepLabelsAbove = ( pd.getBoolPref( PREF_KEEP_LABELS_ABOVE, false ) ),
            lExpandAll$ = $( "#pe_expand_all" ),
            lCollapseAll$ = $( "#pe_collapse_all" );

        // Default to Show all, bug #20723422
        gShowing = ( ( pd.getBoolPref( PREF_SHOW_ALL, true ) ) ? SHOW_ALL : SHOW_COMMON );
        gShowAll$ = $( "#pe_show_all" );
        gShowCommon$ = $( "#pe_show_common" );

        gEditorDlgWidth = parseInt( pd.getPreference( PREF_CODE_EDITOR_DLG_W ), 10 );
        if ( isNaN( gEditorDlgWidth ) ) {
            gEditorDlgWidth = 900;
        }
        gEditorDlgHeight = parseInt( pd.getPreference( PREF_CODE_EDITOR_DLG_H ), 10 );
        if ( isNaN( gEditorDlgHeight ) ) {
            gEditorDlgHeight = 600;
        }
        // Note: gPreference is a global emitted directly from page 4500 during rendering
        // Can't use getPreference because code editor doesn't use the same prefix as the rest of PE/PD
        gEditorSettings = window.gPreferences[CODE_EDITOR_PREF_NAME] || "";  // empty string will use code editor widget defaults

        // Show All / Show Common
        gShowCommon$.click( function() {
            showCommon();
        });
        gShowAll$.click( function() {
            showAll();
        });
        if ( gShowing === SHOW_ALL ) {
            gShowAll$.addClass( IS_ACTIVE );
        } else {
            gShowCommon$.addClass( IS_ACTIVE );
        }

        // Expand all / collapse all
        lExpandAll$.click( function() {
            pe$.propertyEditor( "expandAll" );
        });
        lCollapseAll$.click( function() {
            pe$.propertyEditor( "collapseAll" );
        });

        lPEMenu = {
            menubar: false,
            items: [
                { type: "radioGroup", set: function ( v ) {
                    if ( v === SHOW_COMMON ) {
                        showCommon();
                    } else {
                        showAll();
                    }
                }, get: function () {
                    return gShowing;
                }, choices: [
                    { label: msg( "SHOW_COMMON" ), value: SHOW_COMMON },
                    { label: msg( "SHOW_ALL" ), value: SHOW_ALL  }
                ] },
                /*
                 { type: "action", label: msg( "EXPAND_ALL" ), action: function () {
                 pe$.propertyEditor( "expandAll" );
                 } },
                 { type: "action", label: msg( "COLLAPSE_ALL" ), action: function () {
                 pe$.propertyEditor( "collapseAll" );
                 } },
                 { type: "separator" },
                 */
                { type: "toggle", label: msg( "KEEP_LABELS_ABOVE" ), get: function() {
                    return lKeepLabelsAbove;
                }, set: function ( v ) {
                    pe$.propertyEditor( "option", "labelsAlwaysAbove", v );
                    pd.saveBoolPref( PREF_KEEP_LABELS_ABOVE, v );

                    lKeepLabelsAbove = v;
                } }
            ]
        };
        //lPEMenu$ = $("#pe_menu");
        //lPEMenu$.menu( lPEMenu );

        pe$ = $( "#pe" );
        pe$.propertyEditor({
            showAll:            gShowing === SHOW_ALL,
            //labelsAlwaysAbove:  lKeepLabelsAbove,
            expand: function( pEvent, pData ) {
                delete gCurrentCollapsedGroups[ pData.displayGroupId ];
            },
            collapse: function( pEvent, pData ) {
                gCurrentCollapsedGroups[ pData.displayGroupId ] = true;
            },
            change: function( pEvent, pData ) {
                var i,
                    lMessage = model.transaction.message( {
                        action:     model.MESSAGE_ACTION.CHANGE,
                        component:  gLastComponents[ 0 ],
                        property:   gLastComponents[ 0 ].getProperty( pData.propertyName ),
                        count:      gLastComponents.length
                    }),
                    lTransaction = model.transaction.start( PE_WIDGET_NAME, lMessage );

                for ( i = 0; i < gLastComponents.length; i++ ) {
                    gLastComponents[ i ].getProperty( pData.propertyName ).setValue( pData.property.value );
                }

                apex.commandHistory.execute( lTransaction );

            }
        });

        // Property help
        pe$.on( "propertyeditoractivate", function( pEvent, pProperty ) {
            var out = apex.util.htmlBuilder(),
                helpText = pProperty.metaData.helpText;

            if ( $.isFunction( helpText )) {
                helpText = helpText();
            }

            out.markup( "<h3>" ).content( pProperty.metaData.prompt ).markup( "</h3>" );
            if ( helpText.charAt(0) !== "<" ) {
                helpText = "<p>" + helpText + "</p>";
            }
            out.markup( helpText );
            if ( !pProperty.metaData.isCustomPluginAttribute ) {
                pd.setHelpText( out.toString(), "P1_COMPONENT_TYPE_ID,P1_PROPERTY_ID,P1_APEX_VERSION:" + gLastComponents[ 0 ].typeId + "," + pProperty.propertyName + "," + gApexVersion );
            } else {
                pd.setHelpText( out.toString() );
            }
        }).on( "propertyeditordeactivate", function() {
                pd.clearHelpText();
        });


        $( document ).on( "selectionChanged", function( pEvent, pWidget, pComponents, pPropertyId ) {
            _selectionChanged( pComponents, pPropertyId );
        });

        $( document ).on( "modelCleared", function() {
            _clearPropertyEditor();
        });
    });


})( pe, apex.jQuery, apex.debug, apex.lang, apex.util, window.pageDesigner, apex.navigation, apex.server );
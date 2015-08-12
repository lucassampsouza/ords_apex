/*global apex,$v*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * The {@link apex}.server namespace is used to store all AJAX functions to communicate with the server part
 * of Oracle Application Express.
 **/

(function( model, pd, util, debug, lang, $, undefined ) {
    "use strict";

    var CSS = {
            IS_HEADER:         "is-header",
            IS_COMPONENT_VIEW: "is-component-view",
            IS_EVENT_VIEW:     "is-event-view",
            IS_NOT_IMPORTANT:  "is-not-important",
            IS_POPULATED:      "is-populated"
        },
        ROW_SELECTOR_COLUMN_NAME = "CHECK$01",
        IS_ACTIVE = "is-active",
        MAX_DA_ACTION_PLUGIN_ATTRIBUTES = 15,
        SHARED_COMP_TYPES = [
            {
                typeId: model.COMP_TYPE.LOV,
                type:   "lov"
            }, {
                typeId: model.COMP_TYPE.LIST,
                type:   "list"
            }, {
                typeId: model.COMP_TYPE.AUTHORIZATION,
                type:   "authorization"
            /*
            }, {
                typeId: model.COMP_TYPE.PLUGIN,
                type:   "plugin"
            */
            }, {
                typeId: model.COMP_TYPE.BUILD_OPTION,
                type:   "build_option"
            }, {
                typeId: model.COMP_TYPE.DATA_LOAD_TABLE,
                type:   "data_load_table"
            }, {
                typeId: model.COMP_TYPE.WS_REF,
                type:   "web_service"
            }, {
                typeId: model.COMP_TYPE.BREADCRUMB,
                type:   "breadcrumb"
            }, {
                title:  msg( "NAVIGATION_MENU_LIST" ),
                typeId: model.COMP_TYPE.LIST,
                type:   "navigation_list"
            }, {
                title:  msg( "TAB_SET" ),
                typeId: model.COMP_TYPE.TAB_SET,
                type:   "tab_set"
            }, {
                title: msg( "TEMPLATES" ),
                type:  "template",
                children: [
                    {
                        titleTypeId: model.COMP_TYPE.PAGE,
                        typeId:      model.COMP_TYPE.PAGE_TEMPLATE,
                        type:        "page_template"
                    }, {
                        titleTypeId: model.COMP_TYPE.PAGE_ITEM,
                        typeId:      model.COMP_TYPE.FIELD_TEMPLATE,
                        type:        "field_template"
                    }, {
                        titleTypeId: model.COMP_TYPE.BUTTON,
                        typeId:      model.COMP_TYPE.BUTTON_TEMPLATE,
                        type:        "button_template"
                    }, {
                        titleTypeId: model.COMP_TYPE.REGION,
                        typeId:      model.COMP_TYPE.REGION_TEMPLATE,
                        type:        "region_template"
                    }, {
                        titleTypeId: model.COMP_TYPE.LIST,
                        typeId:      model.COMP_TYPE.LIST_TEMPLATE,
                        type:        "list_template"
                    }, {
                        title:       msg( "CLASSIC_REPORT" ),
                        typeId:      model.COMP_TYPE.REPORT_TEMPLATE,
                        type:        "report_template"
                    }, {
                        title:       msg( "NAVIGATION_MENU_LIST" ),
                        typeId:      model.COMP_TYPE.LIST_TEMPLATE,
                        type:        "nav_list_template"
                    }, {
                        titleTypeId: model.COMP_TYPE.BREADCRUMB,
                        typeId:      model.COMP_TYPE.BREADCRUMB_TEMPLATE,
                        type:        "breadcrumb_template"
                    }, {
                        title:       msg( "LEGACY_CALENDAR" ),
                        typeId:      model.COMP_TYPE.CALENDAR_TEMPLATE,
                        type:        "calendar_template"
                    }
                ]
            }
        ];

    function msg( pKey ) {
        return lang.getMessage( "PD.TREE." + pKey );
    }

    function formatNoEscape( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.formatNoEscape.apply( this, args );
    }

    /*
     * Adds a child tree node to a parent node which can itself contain child nodes.
     *
     * @param {Object} pParentNode Parent tree node where we add a new child
     * @param {Object} pOptions    $$$
     *
     * @return {Object} new tree node
     */
    function addNode( pParentNode, pOptions ) {

        var lNode = addLeafNode( pParentNode, $.extend({ isHeader: true }, pOptions ));

        lNode.children = [];
        lNode.state    = {};

        if ( pOptions.isOpen ) {
            lNode.state = {
                opened: true
            };
        }

        if ( pOptions.omitIfEmpty ) {
            lNode.commands.omitIfEmpty = true;
        }

        if ( pOptions.showHasComponents ) {
            lNode.commands.showHasComponents = true;
        }

        return lNode;
    }

    /*
     * Adds a leaf tree node to a parent node.
     *
     * @param {Object} pParentNode Parent tree node where we add a new child
     * @param {Object} pOptions    $$$
     *
     * @return {Object} new tree node
     */
    function addLeafNode( pParentNode, pOptions ) {

        var lNode = {
                type:     pOptions.type,
                label:    pOptions.title,
                classes:  "",
                data:     {},
                commands: {}
            };

        if ( pOptions.component instanceof model.Component) {
            lNode.data = {
                typeId:      pOptions.component.typeId,
                componentId: pOptions.component.id,
                isPlain:     pOptions.isPlain
            };
            if ( pd.isConditional( pOptions.component ) && !pOptions.isPlain ) {
                lNode.classes = pd.CSS.IS_CONDITIONAL;
            }
            if ( pOptions.component.hasErrors() && !pOptions.isPlain ) {
                lNode.classes += " " + pd.CSS.IS_ERROR;
                lNode.commands.openAllParents = true; // always show node if it has an error
            }
            if ( pOptions.component.hasWarnings() && !pOptions.isPlain ) {
                lNode.classes += " " + pd.CSS.IS_WARNING;
            }
            if ( !pOptions.title ) {
                lNode.label = pOptions.component.getDisplayTitle();
            }
        } else {

            if ( pOptions.hasWarnings ) {
                lNode.classes += " " + pd.CSS.IS_WARNING;
            }

            if ( pOptions.hasErrors ) {
                lNode.classes += " " + pd.CSS.IS_ERROR;
                lNode.commands.openAllParents = true; // always show node if it has an error
            }
        }

        if ( pOptions.isNotImportant ) {
            lNode.classes += " " + CSS.IS_NOT_IMPORTANT;
        }

        // If it's not a unique ID we will add a prefix with the ID of the parent node
        if ( pOptions.hasOwnProperty( "id" )) {
            lNode.id = pOptions.id;
        } else {
            if ( pOptions.component instanceof model.Component) {
                lNode.id = lNode.type + "_" + pOptions.component.typeId + "_" + pOptions.component.id;
                // Only a few component types can appear multiple times in the tree, for those we have to
                // include the parent id to make them unique
                if ( lNode.type.indexOf( "inline_" ) === 0 || lNode.type.indexOf( "page_load_da_" ) === 0 ) {
                    lNode.id = pParentNode.id + "_" + lNode.id;
                }
            } else {
                lNode.id = pOptions.type;
                if ( pOptions.idPostfix ) {
                    lNode.id += pOptions.idPostfix;
                }
                if ( pParentNode ) {
                    lNode.id = pParentNode.id + "_" + lNode.id;
                }
            }
        }

        if ( pOptions.tooltip ) {
            lNode.tooltip = pOptions.tooltip;
        }

        if ( pOptions.hasOwnProperty( "icon" )) {
            if ( pOptions.icon === false ) {
                lNode.icon = null;
            } else {
                lNode.icon = pOptions.icon;
            }
        }

        if ( pOptions.openAllParents ) {
            lNode.commands.openAllParents = true;
        }

        if ( pParentNode ) {
            pParentNode.children.push( lNode );
        }

        return lNode;
    }


    function addHeaderNode( pParentNode, pOptions ) {

        var lNode, i;

        pOptions = $.extend({
            component:         {},
            hasWarnings:       false,
            hasErrors:         false,
            isOpen:            false,
            isPlain:           false,
            openAllParents:    false,
            omitIfEmpty:       false,
            showHasComponents: false
        }, pOptions );

        pOptions.isHeader       = true;
        pOptions.isNotImportant = true;

        lNode = addNode( pParentNode, pOptions );

        if ( pOptions.filter ) {
            if ( pOptions.filter.setFilter === "parent" ) {
                for ( i = 0; i < pOptions.filter.properties.length; i++ ) {
                    pParentNode.data[ pOptions.filter.properties[ i ].id ] = pOptions.filter.properties[ i ].value;
                }
            } else if ( pOptions.filter.properties ) {
                for ( i = 0; i < pOptions.filter.properties.length; i++ ) {
                    lNode.data[ pOptions.filter.properties[ i ].id ] = pOptions.filter.properties[ i ].value;
                }
            }
        }
        if ( pOptions.data ) {
            for ( var lKey in pOptions.data ) {
                if ( pOptions.data.hasOwnProperty( lKey )) {
                    lNode.data[ lKey ] = pOptions.data[ lKey ];
                }
            }
        }

        return lNode;
    }


    function postProcessNodes( pNode ) {

        // Can the node contain sub nodes or is it the leaf node?
        if ( pNode.children ) {

            // Recursively loop through all sub nodes to find out if the current node should be cleaned up or if
            // it should automatically be opened
            for ( var i = 0; i < pNode.children.length; ) {
                if ( postProcessNodes( pNode.children[ i ])) {
                    pNode.children.splice( i, 1 );
                } else {
                    if ( pNode.children[ i ].commands.openAllParents ) {
                        if ( !pNode.state.opened ) {
                            pNode.state.opened = true;
                        }
                        if ( !pNode.commands.openAllParents ) {
                            pNode.commands.openAllParents = true;
                        }
                    }
                    // In a second step, check if a parent node with showHasComponents = true should be highlighted if one of the
                    // sub nodes is a node of type component
                    if (  ( pNode.children[ i ].state && pNode.children[ i ].state.hasComponents )
                       || (  pNode.children[ i ].data.hasOwnProperty( "componentId" )
                          && !model.getComponents( pNode.children[ i ].data.typeId, { id: pNode.children[ i ].data.componentId })[ 0 ].isOnGlobalPage()
                          )
                        )
                    {
                        if ( !pNode.state.hasComponents ) {
                            pNode.state.hasComponents = true;
                            if ( pNode.commands.showHasComponents ) {
                                pNode.classes += " " + CSS.IS_POPULATED;
                            }
                        }
                    }
                    i++;
                }
            }

            // If the node doesn't contain any children, make it a leaf node
            if ( pNode.children.length === 0 ) {
//                delete pNode[ "children" ];
                delete pNode[ "state" ];
            }

            return ( pNode.commands.omitIfEmpty && (( pNode.children && pNode.children.length === 0 ) || !pNode.children ));
        } else {
            delete pNode[ "state" ];
            return false;
        }
    }


    function addComponents( pParentNode, pOptions ) {

        var lSetFilter = pOptions.setFilter,
            lHeaderTitle,
            lComponents,
            lFilters   = [],
            lConfigMap = {},
            lHeaderFilter,
            lHeaderNode,
            lNode,
            i;

        if ( lSetFilter === undefined ) {
            lSetFilter = (( pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) ? "header" : "parent" );
        }

        if ( pOptions.header === false ) {
            lHeaderNode = pParentNode;

            if ( lSetFilter === "parent" ) {
                for ( i = 0; i < pOptions.component.filter.properties.length; i++ ) {
                    pParentNode.data[ pOptions.component.filter.properties[ i ].id ] = pOptions.component.filter.properties[ i ].value;
                }
            }
        } else {
            if ( pOptions.header.component instanceof model.Component ) {
                lHeaderTitle = pOptions.header.component.getDisplayTitle();
            } else if ( pOptions.header.title ) {
                lHeaderTitle = pOptions.header.title;
            } else {
                lHeaderTitle = model.getComponentType( pOptions.component.typeId ).title.plural;
            }

            if ( lSetFilter ) {

                lHeaderFilter = {
                    setFilter:  lSetFilter,
                    properties: []
                };

                if ( $.isArray( pOptions.component )) {
                    for ( i = 0; i < pOptions.component.length; i++ ) {
                        lHeaderFilter.properties = lHeaderFilter.properties.concat( pOptions.component[ i ].filter.properties );
                    }
                } else if ( pOptions.component.filter.properties ) {
                    lHeaderFilter.properties = pOptions.component.filter.properties;
                }
            }

            lHeaderNode = addHeaderNode( pParentNode, {
                title:          lHeaderTitle,
                type:           pOptions.header.type,
                id:             pOptions.header.id,
                idPostfix:      pOptions.header.idPostfix,
                isPlain:        pOptions.header.isPlain,
                hasWarnings:    pOptions.header.hasWarnings,
                hasErrors:      pOptions.header.hasErrors,
                isOpen:         pOptions.header.isOpen,
                openAllParents: pOptions.header.openAllParents,
                omitIfEmpty:    pOptions.header.omitIfEmpty,
                component:      pOptions.header.component,
                filter:         lHeaderFilter
            });
        }

        if ( $.isArray( pOptions.component )) {

            for ( i = 0; i < pOptions.component.length; i++ ) {
                lFilters[ i ] = {
                    typeId: pOptions.component[ i ].typeId,
                    filter: pOptions.component[ i ].filter
                };
                lConfigMap[ pOptions.component[ i ].typeId ] = pOptions.component[ i ];
            }

        } else {

            lFilters[ 0 ] = {
                typeId: pOptions.component.typeId,
                filter: pOptions.component.filter
            };
            lConfigMap[ pOptions.component.typeId ] = pOptions.component;

        }

        // Get and emit all components specified by the filter
        lComponents = model.getComponentsAdvanced( lFilters );

        for ( i = 0; i < lComponents.length; i++ ) {
            if ( pd.isDisplayed( lComponents[ i ] )) {
                if ( lConfigMap[ lComponents[ i ].typeId ].addSubComponents ) {
                    lNode = addNode( lHeaderNode, {
                        title:          lComponents[ i ].getDisplayTitle(),
                        type:           lConfigMap[ lComponents[ i ].typeId ].type,
                        component:      lComponents[ i ],
                        isHeader:       false,
                        isPlain:        lConfigMap[ lComponents[ i ].typeId ].isPlain,
                        isOpen:         lConfigMap[ lComponents[ i ].typeId ].isOpen,
                        openAllParents: ( lComponents[ i ].isOnGlobalPage()) ? false : lConfigMap[ lComponents[ i ].typeId ].openAllParents,
                        omitIfEmpty:    lConfigMap[ lComponents[ i ].typeId ].omitIfEmpty
                    });

                    lConfigMap[ lComponents[ i ].typeId ].addSubComponents( lNode, lComponents[ i ]);

                } else {
                    addLeafNode( lHeaderNode, {
                        title:          lComponents[ i ].getDisplayTitle(),
                        type:           lConfigMap[ lComponents[ i ].typeId ].type,
                        isPlain:        lConfigMap[ lComponents[ i ].typeId ].isPlain,
                        component:      lComponents[ i ],
                        openAllParents: ( lComponents[ i ].isOnGlobalPage()) ? false : lConfigMap[ lComponents[ i ].typeId ].openAllParents
                    });
                }
            }
        }

    } // addComponents


    function getPointTitle( pComponentTypeId, pPoint ) {

        var lPropertyId;

        if ( pComponentTypeId === model.COMP_TYPE.BRANCH ) {
            lPropertyId = model.PROP.BRANCH_POINT;
        } else if ( pComponentTypeId === model.COMP_TYPE.PAGE_COMPUTATION ) {
            lPropertyId = model.PROP.COMPUTATION_POINT;
        } else if ( pComponentTypeId === model.COMP_TYPE.PAGE_PROCESS ) {
            lPropertyId = model.PROP.PROCESS_POINT;
        }

        return model.getLovTitle( pComponentTypeId, lPropertyId, pPoint )

    } // getPointTitle


    function addBranches( pParentNode, pFilter, pOmitIfEmpty ) {

        var lHeader = {
            type:        "branches",
            isOpen:      true,
            omitIfEmpty: pOmitIfEmpty
        };

        if ( pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) {
            lHeader.title = getPointTitle( model.COMP_TYPE.BRANCH, pFilter.point );
        }

        // Create the Header Node and for each branch a node
        addComponents( pParentNode, {
            header:    lHeader,
            component: {
                type:   "branch",
                typeId: model.COMP_TYPE.BRANCH,
                filter: {
                    properties: [{
                        id:    model.PROP.BRANCH_POINT,
                        value: pFilter.point
                    }]
                },
                openAllParents: true
            }
        });

    }


    function addValidations( pParentNode, pFilter, pOmitIfEmpty ) {

        var lPrefix           = "inline_",
            lFilterProperties = [],
            lFilterFunction,
            lItemName,
            lColumnName,
            lHeader = {
                isOpen:      true,
                omitIfEmpty: pOmitIfEmpty
            };

        if ( pFilter.hasOwnProperty( "regionColumn" )) {
            // Only show validations of that region column
            lColumnName = pFilter.regionColumn.getProperty( model.PROP.COLUMN_NAME ).getValue();
            lFilterFunction = function(){
                var lProperty;

                if ( this.getProperty( model.PROP.VALIDATION_REGION ).getValue() !== pFilter.region.id ) {
                    return false;
                }

                // If the column name is used as "Validation Item" or in the "Associated Column", we show
                // that validation below that region column.
                lProperty = this.getProperty( model.PROP.REGION_VAL_COLUMN );
                return (  lProperty && lProperty.getValue() === lColumnName
                       || this.getProperty( model.PROP.ASSOCIATED_COLUMN ).getValue() === lColumnName
                       );
            };

        } else if ( pFilter.hasOwnProperty( "region" )) {

            lHeader.isOpen = false;

            // Only show validations of that region
            lFilterFunction = function() {

                // Don't show the validation if it belongs to a different region
                // Or has a value in the "Associated Column" property
                // Or has the "Validate Column" property
                return !(  this.getProperty( model.PROP.VALIDATION_REGION ).getValue() !== pFilter.region.id
                        || this.getProperty( model.PROP.ASSOCIATED_COLUMN ).getValue() !== ""
                        || this.getProperty( model.PROP.REGION_VAL_COLUMN )
                        );

            };

        } else if ( pFilter.hasOwnProperty( "pageItem" )) {
            // Only show validations of the current page item which use it for comparison or as associated item
            lItemName = pFilter.pageItem.getProperty( model.PROP.ITEM_NAME ).getValue();

            lFilterFunction = function() {
                var lProperty;

                if ( this.getProperty( model.PROP.VALIDATION_REGION ).getValue() !== "" ) {
                    return false;
                }

                // Show the validation if the page items is used in the
                // a) "Associated Item" property or
                // b) "Validation Item" property
                lProperty = this.getProperty( model.PROP.VAL_ITEM );
                return (  this.getProperty( model.PROP.ASSOCIATED_ITEM ).getValue() === pFilter.pageItem.id
                       || ( lProperty && lProperty.getValue() === lItemName )
                       );
            };

        } else {
            // Show all validations

            lPrefix = "";
            lHeader.isOpen = true;
            lHeader.openAllParents = true;

        }

        lHeader.type = lPrefix + "validations";

        addComponents( pParentNode, {
            header:    lHeader,
            setFilter: false,
            component: {
                type:   lPrefix + "validation",
                typeId: model.COMP_TYPE.VALIDATION,
                filter: {
                    properties:     lFilterProperties,
                    filterFunction: lFilterFunction
                }
            }
        });
    }


    function addComputations( pParentNode, pFilter, pOmitIfEmpty, pOpenAllParents ) {

        var lFilterProperty,
            lPrefix = ( pFilter.hasOwnProperty( "pageItem" )) ? "inline_" : "",
            lHeader = {
                type:        lPrefix + "computations",
                isOpen:      true,
                omitIfEmpty: pOmitIfEmpty
            };

        // Do we have to show all computations of a computation point?
        if ( pFilter.hasOwnProperty( "point" )) {

            if ( pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) {
                lHeader.title = getPointTitle( model.COMP_TYPE.PAGE_COMPUTATION, pFilter.point );
            }

            lFilterProperty = {
                id:    model.PROP.COMPUTATION_POINT,
                value: pFilter.point
            };

        // Or all computations for a page item?
        } else if ( pFilter.hasOwnProperty( "pageItem" )) {

            lFilterProperty = {
                id:    model.PROP.COMPUTATION_ITEM_NAME,
                value: pFilter.pageItem.getProperty( model.PROP.ITEM_NAME ).getValue()
            };
        }

        // Create the Header Node and for each computation a node
        addComponents( pParentNode, {
            header:    lHeader,
            component: {
                type:   lPrefix + "computation",
                typeId: model.COMP_TYPE.PAGE_COMPUTATION,
                filter: {
                    properties: [ lFilterProperty ]
                },
                openAllParents: pOpenAllParents
            }
        });
    }


    function addProcesses( pParentNode, pFilter, pOmitIfEmpty, pOpenAllParents ) {

        function addChildren( pProcessNode, pProcess ) {

            var lProcessType = pProcess.getProperty( model.PROP.PAGE_PROCESS_TYPE ).getValue();

            if ( $.inArray( lProcessType, [ "NATIVE_WEB_SERVICE", "NATIVE_WEB_SERVICE_LEGACY" ]) !== -1 ) {

                addComponents( pProcessNode, {
                    header: {
                        type:        "ws_params",
                        isOpen:      true,
                        omitIfEmpty: true
                    },
                    setFilter: false,
                    component: {
                        type:   "ws_param",
                        typeId: model.COMP_TYPE.PAGE_PROC_WS_P_I,
                        filter: {
                            parentId: pProcess.id
                        }
                    }
                });

                if ( pProcess.getProperty( model.getPluginProperty( model.COMP_TYPE.PAGE_PROCESS, lProcessType, 2 ).id ).getValue() === "ITEMS" ) { // Store Result In

                    addComponents( pProcessNode, {
                        header: {
                            type:        "ws_params",
                            isOpen:      true,
                            omitIfEmpty: true
                        },
                        setFilter: false,
                        component: {
                            type:   "ws_param",
                            typeId: model.COMP_TYPE.PAGE_PROC_WS_P_O,
                            filter: {
                                parentId: pProcess.id
                            }
                        }
                    });
                }

                addComponents( pProcessNode, {
                    header: {
                        type:        "ws_params",
                        isOpen:      true,
                        omitIfEmpty: true
                    },
                    setFilter: false,
                    component: {
                        type:   "ws_param",
                        typeId: model.COMP_TYPE.PAGE_PROC_WS_P_A,
                        filter: {
                            parentId: pProcess.id
                        }
                    }
                });

            }
        }

        var lPrefix       = ( pFilter.hasOwnProperty( "region" )) ? "inline_" : "",
            lFilterProperty,
            lHeader;

        if ( pFilter.point === "ON_DEMAND" && !pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) {
            lHeader = false;
        } else {
            lHeader = {
                type:        lPrefix + "processes",
                isOpen:      true,
                omitIfEmpty: pOmitIfEmpty
            };
        }

        // Do we have to show all processes of a process point?
        if ( pFilter.hasOwnProperty( "point" )) {

            if ( pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) {
                lHeader.title = getPointTitle( model.COMP_TYPE.PAGE_PROCESS, pFilter.point );
            }

            lFilterProperty = {
                id:    model.PROP.PROCESS_POINT,
                value: pFilter.point
            };

        } else if ( pFilter.hasOwnProperty( "region" )) {
            // Or all process for a region
            lFilterProperty = {
                id:    model.PROP.PROCESS_REGION,
                value: pFilter.region.id
            };
            lHeader.isOpen = false;
        }

        // Create the Header Node and for each process a node
        addComponents( pParentNode, {
            header:    lHeader,
            component: {
                type:   lPrefix + "process",
                typeId: model.COMP_TYPE.PAGE_PROCESS,
                filter: {
                    properties: [ lFilterProperty ]
                },
                addSubComponents: addChildren,
                openAllParents:   pOpenAllParents
            }
        });
    }


    function addDynamicActions( pParentNode, pFilter ) {

        function addActions( pDaEventNode, pDaEvent, pResult, pTitle ) {

            // Create the Header Node and for each action a node
            addComponents( pDaEventNode, {
                header: {
                    title:       pTitle,
                    type:        "da_actions_" + pResult,
                    isOpen:      true,
                    omitIfEmpty: false
                },
                setFilter: "header",
                component: {
                    type:   "da_action",
                    typeId: model.COMP_TYPE.DA_ACTION,
                    filter: {
                        parentId: pDaEvent.id,
                        properties: [{
                            id:    model.PROP.FIRE_WHEN_EVENT_RESULT_IS,
                            value: pResult.toUpperCase()
                        }]
                    }
                }
            });
        }

        function addChildren( pDaEventNode, pDaEvent ) {
            addActions( pDaEventNode, pDaEvent, "true",  msg( "TRUE" ));
            addActions( pDaEventNode, pDaEvent, "false", msg( "FALSE" ));
        }

        var lPrefix,
            lSetFilter = false,
            lFilterProperties = [],
            lHeader = {
                title:       msg( "DYNAMIC_ACTIONS" ),
                isOpen:      true,
                omitIfEmpty: true
            };

        lPrefix = "inline_";
        if ( pFilter.hasOwnProperty( "regionColumn" )) {
            // Only show actions of that region column
            lFilterProperties.push({
                id:    model.PROP.WHEN_REGION,
                value: pFilter.region.id
            });
/* todo Not yet supported by dynamic actions
            lFilterProperties.push({
                id:    model.PROP.WHEN_COLUMN,
                value: new RegExp( "(^|,|\\s)" + util.escapeRegExp( pFilter.regionColumn.getProperty( model.PROP.XXX ).getValue()) + "($|,|\\s)" )
            });
*/

        } else if ( pFilter.hasOwnProperty( "region" )) {
            // Only show actions of that region
            lFilterProperties.push({
                id:    model.PROP.WHEN_REGION,
                value: pFilter.region.id
            });
            lHeader.isOpen = false;

        } else if ( pFilter.hasOwnProperty( "pageItem" )) {
            // Only show actions of the current page item
            lFilterProperties.push({
                id:    model.PROP.WHEN_ITEMS,
                value: new RegExp( "(^|,|\\s)" + util.escapeRegExp( pFilter.pageItem.getProperty( model.PROP.ITEM_NAME ).getValue()) + "($|,|\\s)" )
            });

        } else if ( pFilter.hasOwnProperty( "button" )) {
            // Only show actions for current button
            lFilterProperties.push({
                id:    model.PROP.WHEN_BUTTON,
                value: pFilter.button.id
            });

        } else if ( pFilter.hasOwnProperty( "event" )) {
            // Only show actions for the specified event
            lFilterProperties.push({
                id:    model.PROP.EVENT,
                value: pFilter.event
            });
            lPrefix    = "";
            lSetFilter = "header";
            if ( pFilter.event === "" ) {
                lHeader.title = msg( "UNDEFINED_EVENT" );
            } else {
                lHeader.title = model.getLovTitle( model.COMP_TYPE.DA_EVENT, model.PROP.EVENT, pFilter.event );
            }
            lHeader.idPostfix   = "_" + pFilter.event;
            lHeader.omitIfEmpty = false;

        }

        lHeader.type = lPrefix + "da_events";

        addComponents( pParentNode, {
            header:    lHeader,
            setFilter: lSetFilter,
            component: {
                type:   lPrefix + "da_event",
                typeId: model.COMP_TYPE.DA_EVENT,
                filter: {
                    properties: lFilterProperties
                },
                addSubComponents: addChildren
            }
        });
    }


    function addRegions( pParentNode, pFilter ) {

        function addChildren( pRegionNode, pRegion ) {

            var REGION_FUNCTIONS = {
                "NATIVE_IR":           addInteractiveReport,
                "NATIVE_SQL_REPORT":   addClassicReport,
                "NATIVE_FNC_REPORT":   addClassicReport,
                "NATIVE_TABFORM":      addTabularForm,
                "NATIVE_FLASH_MAP":    addMapChart,
                "NATIVE_FLASH_CHART5": addChart,
                "NATIVE_CALENDAR":     addClassicCalendar
            };

            var lRegionType = pRegion.getProperty( model.PROP.REGION_TYPE ).getValue();

            if ( !pRegion.isOnGlobalPage()) {
                if ( REGION_FUNCTIONS.hasOwnProperty( lRegionType )) {
                    REGION_FUNCTIONS[ lRegionType ]( pRegionNode, pRegion );
                } else {
                    addRegionPluginAttributes( pRegionNode, pRegion );
                }
            }

            if ( pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) {
                addRegions       ( pRegionNode, { region: pRegion });
            } else {
                addPageItems     ( pRegionNode, pRegion );
                addRegionButtons ( pRegionNode, pRegion );
                addValidations   ( pRegionNode, { region: pRegion }, true );
                // todo addProcesses( pRegionNode, { region: pRegion }, true );
                addDynamicActions( pRegionNode, { region: pRegion });
                addRegions       ( pRegionNode, { region: pRegion });
            }
        }

        var lFilter = {},
            lHeader = {
                isOpen:      false,
                omitIfEmpty: true
            },
            lSubRegion;

        if ( pFilter.hasOwnProperty( "region" )) {

            lSubRegion = model.getRegionTemplate( pFilter.region.id ).displayPointsMap[ "SUB_REGIONS" ];
            lHeader.title = ( lSubRegion ) ? lSubRegion.name : msg( "SUB_REGIONS" );
            lHeader.type  = "sub_regions";

            lFilter.properties = [{
                id:    model.PROP.PARENT_REGION,
                value: pFilter.region.id
            }];

        } else if ( pFilter.hasOwnProperty( "point" )) {

            lHeader.title       = pFilter.point.name;
            lHeader.type        = "regions";
            lHeader.id          = "rdp_" + pFilter.point.id;
            lHeader.omitIfEmpty = ( !pFilter.point.isQuickPick );

            lFilter.properties = [];
            lFilter.properties.push({
                id:    model.PROP.PARENT_REGION,
                value: ""
            });
            lFilter.properties.push({
                id:    model.PROP.REGION_POSITION,
                value: pFilter.point.id
            });
        } else if ( pFilter.hasOwnProperty( "validPointsMap" )) {

            lHeader.title       = msg( "INVALID_POSITION" );
            lHeader.type        = "regions";
            lHeader.id          = "invalid_region_dp";
            lHeader.hasWarnings = true;

            // Find all regions which reference a non-existing region display point
            lFilter.filterFunction = function() {

                var lRegionPosition = this.getProperty( model.PROP.REGION_POSITION );

                if ( lRegionPosition ) {
                    return ( !pFilter.validPointsMap.hasOwnProperty( lRegionPosition.getValue()));
                } else {
                    return false;
                }
            };

        }

        addComponents( pParentNode, {
            header:    lHeader,
            setFilter: "header",
            component: {
                type:   "region",
                typeId: model.COMP_TYPE.REGION,
                filter: lFilter,
                addSubComponents: addChildren,
                isOpen:           true,
                openAllParents:   true,
                omitIfEmpty:      false
            }
        });

    }


    function addInteractiveReport( pParentNode, pRegion ) {

        var lIrAttributesNode,
            lComponent = model.getComponents( model.COMP_TYPE.IR_ATTRIBUTES, { parentId: pRegion.id })[ 0 ],
            lShowDownload,
            lDownloadFormats;

        addComponents( pParentNode, {
            header: {
                title:       msg( "REPORT_COLUMNS" ),
                type:        "region_columns",
                isOpen:      false,
                omitIfEmpty: false
            },
            setFilter: false,
            component: {
                type:   "ir_report_column",
                typeId: model.COMP_TYPE.IR_COLUMN,
                filter: {
                    parentId: lComponent.id
                }
            }
        });

        lIrAttributesNode = addNode( pParentNode, {
            type:        "ir_attributes",
            title:       model.getComponentType( lComponent.typeId ).title.singular,
            component:   lComponent,
            isHeader:    false,
            isOpen:      false,
            omitIfEmpty: false
        });

        addComponents( lIrAttributesNode, {
            header: {
                type:        "ir_column_groups",
                isOpen:      true,
                omitIfEmpty: false
            },
            setFilter: false,
            component: {
                type:   "ir_column_group",
                typeId: model.COMP_TYPE.IR_COLUMN_GROUP,
                filter: {
                    parentId: lComponent.id
                }
            }
        });

        addComponents( lIrAttributesNode, {
            header: {
                type:        "ir_saved_reports",
                isOpen:      true,
                omitIfEmpty: false
            },
            setFilter: false,
            component: {
                type:   "ir_saved_report",
                typeId: model.COMP_TYPE.IR_SAVED_REPORT,
                filter: {
                    parentId: lComponent.id
                }
            }
        });

        lShowDownload = lComponent.getProperty( model.PROP.SHOW_DOWNLOAD );
        if ( lShowDownload && lShowDownload.getValue() === "Y" ) {

            lDownloadFormats = lComponent.getProperty( model.PROP.DOWNLOAD_FORMATS ).getValue().split( ":" );

            if (  $.inArray( "XLS", lDownloadFormats ) !== -1
                || $.inArray( "PDF", lDownloadFormats ) !== -1
                || $.inArray( "RTF", lDownloadFormats ) !== -1 )
            {
                addNode( lIrAttributesNode, {
                    type:        "ir_print",
                    title:       model.getComponentType( model.COMP_TYPE.IR_PRINT_ATTR ).title.singular,
                    component:   model.getComponents( model.COMP_TYPE.IR_PRINT_ATTR, { parentId: lComponent.id })[ 0 ],
                    isHeader:    false,
                    isOpen:      false,
                    omitIfEmpty: false
                });
            }
        }
    }


    function addClassicReport( pParentNode, pRegion ) {

        var lAttributes,
            lAttributesNode;

        addComponents( pParentNode, {
            header: {
                title:       msg( "REPORT_COLUMNS" ),
                type:        "region_columns",
                isOpen:      false,
                omitIfEmpty: false
            },
            setFilter: false,
            component: {
                type:   "classic_report_column",
                typeId: model.COMP_TYPE.CLASSIC_RPT_COLUMN,
                isOpen: false,
                filter: {
                    parentId: pRegion.id
                }
            }
        });

        lAttributes = model.getComponents( model.COMP_TYPE.CLASSIC_REPORT, { parentId: pRegion.id })[ 0 ];

        lAttributesNode = addNode( pParentNode, {
            type:        "classic_report_attributes",
            title:       model.getComponentType( lAttributes.typeId ).title.singular,
            component:   lAttributes,
            isHeader:    false,
            isOpen:      false,
            omitIfEmpty: false
        });

        if ( lAttributes.getProperty( model.PROP.ENABLE_PRINTING ).getValue() === "Y" ) {
            addNode( lAttributesNode, {
                type:        "classic_report_print",
                title:       model.getComponentType( model.COMP_TYPE.CLASSIC_RPT_PRINT ).title.singular,
                component:   model.getComponents( model.COMP_TYPE.CLASSIC_RPT_PRINT, { parentId: lAttributes.id })[ 0 ],
                isHeader:    false,
                isOpen:      false,
                omitIfEmpty: false
            });
        }
    }


    function addTabularForm( pParentNode, pRegion ) {

        function addChildren( pRegionColumnNode, pColumn ) {

            addValidations( pRegionColumnNode, { region: pRegion, regionColumn: pColumn }, true );
        }

        var lAttributes,
            lAttributesNode;

        addComponents( pParentNode, {
            header: {
                title:       msg( "REPORT_COLUMNS" ),
                type:        "region_columns",
                isOpen:      false,
                omitIfEmpty: false
            },
            setFilter: false,
            component: {
                type:   "tabform_column",
                typeId: model.COMP_TYPE.TAB_FORM_COLUMN,
                isOpen: false,
                filter: {
                    parentId: pRegion.id
                },
                addSubComponents: addChildren
            }
        });

        lAttributes = model.getComponents( model.COMP_TYPE.TABULAR_FORM, { parentId: pRegion.id })[ 0 ];

        lAttributesNode = addNode( pParentNode, {
            type:        "tabform_attributes",
            title:       model.getComponentType( lAttributes.typeId ).title.singular,
            component:   lAttributes,
            isHeader:    false,
            isOpen:      false,
            omitIfEmpty: false
        });

        if ( lAttributes.getProperty( model.PROP.ENABLE_PRINTING ).getValue() === "Y" ) {
            addNode( lAttributesNode, {
                type:        "tabform_print",
                title:       model.getComponentType( model.COMP_TYPE.TAB_FORM_PRINT ).title.singular,
                component:   model.getComponents( model.COMP_TYPE.TAB_FORM_PRINT, { parentId: lAttributes.id })[ 0 ],
                isHeader:    false,
                isOpen:      false,
                omitIfEmpty: false
            });
        }

    }


    function addMapChart( pParentNode, pRegion ) {

        var lMapNode,
            lComponent = model.getComponents( model.COMP_TYPE.MAP_CHART, { parentId: pRegion.id })[ 0 ];

        lMapNode = addNode( pParentNode, {
            type:        "map_chart",
            title:       model.getComponentType( lComponent.typeId ).title.singular,
            component:   lComponent,
            isHeader:    false,
            isOpen:      true,
            omitIfEmpty: false
        });

        addComponents( lMapNode, {
            header: {
                type:        "map_chart_series",
                isOpen:      true,
                omitIfEmpty: false
            },
            setFilter: false,
            component: {
                type:   "map_chart_serie",
                typeId: model.COMP_TYPE.MAP_CHART_SERIES,
                filter: {
                    parentId: lComponent.id
                }
            }
        });

    }


    function addChart( pParentNode, pRegion ) {

        var lChartNode,
            lComponent = model.getComponents( model.COMP_TYPE.CHART, { parentId: pRegion.id })[ 0 ];

        lChartNode = addNode( pParentNode, {
            type:        "chart_attributes",
            title:       model.getComponentType( lComponent.typeId ).title.singular,
            component:   lComponent,
            isHeader:    false,
            isOpen:      true,
            omitIfEmpty: false
        });

        addComponents( lChartNode, {
            header: {
                type:        "chart_series",
                isOpen:      true,
                omitIfEmpty: false
            },
            setFilter: false,
            component: {
                type:   "chart_serie",
                typeId: model.COMP_TYPE.CHART_SERIES,
                filter: {
                    parentId: lComponent.id
                }
            }
        });
    }


    function addClassicCalendar( pParentNode, pRegion ) {

        var lComponent = model.getComponents( model.COMP_TYPE.CLASSIC_CALENDAR, { parentId: pRegion.id })[ 0 ];

        addNode( pParentNode, {
            type:        "classic_calendar",
            title:       model.getComponentType( lComponent.typeId ).title.singular,
            component:   lComponent,
            isHeader:    false,
            isOpen:      false,
            omitIfEmpty: false
        });
    }


    function addRegionPluginAttributes( pParentNode, pRegion ) {

        var PLUGINS = model.getComponentType( model.COMP_TYPE.REGION_PLUGIN_ATTR ).pluginType.plugins;
        var lAttributes,
            lRegionType;

        lRegionType = pRegion.getProperty( model.PROP.REGION_TYPE ).getValue();
        lAttributes = model.getComponents( model.COMP_TYPE.REGION_PLUGIN_ATTR, { parentId: pRegion.id });

        // If the plug-in does store columns, show them
        if ( $.inArray( "COLUMNS", PLUGINS[ lRegionType ].stdAttributes ) !== -1 ) {
            addComponents( pParentNode, {
                header: {
                    title:       msg( "REPORT_COLUMNS" ),
                    type:        "region_columns",
                    isOpen:      false,
                    omitIfEmpty: false
                },
                setFilter: false,
                component: {
                    type:   "region_column",
                    typeId: model.COMP_TYPE.REGION_COLUMN,
                    filter: {
                        parentId: pRegion.id
                    }
                }
            });
        }

        // Only show the "Attributes" node if we have one
        if ( lAttributes.length > 0 ) {
            addNode( pParentNode, {
                type:        "region_plugin_attributes",
                title:       model.getComponentType( model.COMP_TYPE.REGION_PLUGIN_ATTR ).title.singular,
                component:   lAttributes[ 0 ],
                isHeader:    false,
                isOpen:      false,
                omitIfEmpty: false
            });
        }
    }


    function addPageItems( pParentNode, pRegion ) {

        var lHeader = {
            type:        "page_items",
            isOpen:      false,
            omitIfEmpty: true
        };

        function addPageItemChildren( pPageItemNode, pPageItem ) {

            addValidations   ( pPageItemNode, { pageItem: pPageItem }, true );
            addDynamicActions( pPageItemNode, { pageItem: pPageItem });
            addComputations  ( pPageItemNode, { pageItem: pPageItem }, true );
        }

        function addButtonChildren( pButtonNode, pButton ) {

            addDynamicActions( pButtonNode, { button: pButton });
        }

        if ( pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) {
            if ( pRegion instanceof model.Component ) {
                lHeader.component = pRegion;
            } else {
                lHeader.title       = msg( "NO_REGION" );
                lHeader.type        = "no_region";
                lHeader.hasWarnings = true;
            }
        } else {
            lHeader.title = msg( "ITEMS" );
        }

        // Create the Header Node and for each item a node
        addComponents( pParentNode, {
            header:    lHeader,
            setFilter: "header",
            component: [
                {
                    type:   "page_item",
                    typeId: model.COMP_TYPE.PAGE_ITEM,
                    isOpen: false,
                    openAllParents: true,
                    filter: {
                        properties: [{
                            id:    model.PROP.REGION,
                            value: ( pRegion instanceof model.Component ) ? pRegion.id : ""
                        }]
                    },
                    addSubComponents: addPageItemChildren
                }, {
                    type:   "form_button",
                    typeId: model.COMP_TYPE.BUTTON,
                    isOpen: false,
                    openAllParents: true,
                    filter: {
                        properties: [
                            {
                                id:    model.PROP.REGION,
                                value: ( pRegion instanceof model.Component ) ? pRegion.id : ""
                            }, {
                                id:    model.PROP.BUTTON_POSITION,
                                value: "BODY"
                            }
                        ]
                    },
                    addSubComponents: addButtonChildren
                }
            ]
        });

    }


    function addRegionButtons( pParentNode, pRegion ) {

        var lHeader = {
                type:        "region_buttons",
                isOpen:      false,
                omitIfEmpty: true
            },
            REGION_ID = ( pRegion instanceof model.Component ) ? pRegion.id : "";

        function addChildren( pButtonNode, pButton ) {

            addDynamicActions( pButtonNode, { button: pButton });
        }

        if ( pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) {
            if ( pRegion instanceof model.Component ) {
                lHeader.component = pRegion;
            } else {
                lHeader.title       = msg( "NO_REGION" );
                lHeader.type        = "no_region";
                lHeader.hasWarnings = true;
            }
        } else {
            lHeader.title = msg( "REGION_BUTTONS" );
        }

        // Create the Header Node and for each button a node
        addComponents( pParentNode, {
            header:    lHeader,
            component: {
                type:   "region_button",
                typeId: model.COMP_TYPE.BUTTON,
                isOpen: false,
                openAllParents: true,
                filter: {
                    filterFunction: function() {
                        var lRegionId = this.getProperty( model.PROP.REGION ).getValue();

                        return (  ( lRegionId === REGION_ID || ( lRegionId === "" && lHeader.type === "no_region" ))
                               && this.getProperty( model.PROP.BUTTON_POSITION ).getValue() !== "BODY" // don't show buttons displayed next to items
                               );
                    }
                },
                addSubComponents: addChildren
            }
        });

    }


    function getRenderingData() {

        var lTreeData,
            lPage;

        lPage = model.getComponents( model.COMP_TYPE.PAGE );

        // Emit Root Page Node
        lTreeData = addNode( undefined, {
            component: lPage[ 0 ],
            type:      "page",
            title:     formatNoEscape( "PAGE_TITLE", lPage[ 0 ].id, lPage[ 0 ].getDisplayTitle()),
            isHeader:  false,
            isOpen:    true
        });

        // Set defaults for "Create" menu
        lTreeData.data[ model.PROP.COMPUTATION_POINT ] = "BEFORE_BOX_BODY";
        lTreeData.data[ model.PROP.PROCESS_POINT ]     = "AFTER_HEADER";
        lTreeData.data[ model.PROP.BRANCH_POINT ]      = "BEFORE_HEADER";
        lTreeData.data[ model.PROP.REGION_POSITION ]   = "BODY";
        lTreeData.data[ model.PROP.BUTTON_POSITION ]   = "BELOW_BOX";

        if ( pd.getPreference( "GROUP_BY_COMPONENT_TYPE" ) === "Y" ) {
            getRenderingComponentView( lTreeData );
        } else {
            getRenderingEventView( lTreeData );
        }

        postProcessNodes( lTreeData );

        return lTreeData;

    }


    function getRenderingEventView( pTreeData ) {

        var lPreRenderingNode,
            lPostRenderingNode,
            lNode,
            lPageTemplate,
            lIsGlobalPage = model.isGlobalPage();

        lPageTemplate = model.getPageTemplate();

        //
        // Emit "Before Regions"
        //
        lPreRenderingNode = addHeaderNode( pTreeData, {
            title:             msg( "PRE_RENDERING" ),
            type:              "pre_rendering",
            showHasComponents: true,
            omitIfEmpty:       true
        });

        if ( !lIsGlobalPage ) {
            //
            // Emit "On New Instance"
            //
            // Note: Only included for legacy pages if such a computation or process exists
            //
            lNode = addHeaderNode( lPreRenderingNode, {
                title:       getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "ON_NEW_INSTANCE" ),
                type:        "on_new_instance",
                isOpen:      true,
                omitIfEmpty: true
            });
            addComputations( lNode, { point: "ON_NEW_INSTANCE" }, true );
            addProcesses   ( lNode, { point: "ON_NEW_INSTANCE" }, true );

            //
            // Emit "Before Header"
            //
            lNode = addHeaderNode( lPreRenderingNode, {
                title:  getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "BEFORE_HEADER" ),
                type:   "before_header",
                isOpen: true
            });

            addBranches    ( lNode, { point: "BEFORE_HEADER" }, true );
            addComputations( lNode, { point: "BEFORE_HEADER" }, true );
            addProcesses   ( lNode, { point: "BEFORE_HEADER" }, true );
        }

        //
        // Emit "After Header"
        //
        lNode = addHeaderNode( lPreRenderingNode, {
            title:       getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "AFTER_HEADER" ),
            type:        "after_header",
            isOpen:      true,
            omitIfEmpty: lIsGlobalPage
        });

        if ( !lIsGlobalPage ) {
            addComputations( lNode, { point: "AFTER_HEADER" }, true );
            addProcesses   ( lNode, { point: "AFTER_HEADER" }, true );
        }
        addRegions( lNode, { point: { id: "AFTER_HEADER" }});

        //
        // Emit "Before Regions"
        //
        if ( !lIsGlobalPage ) {
            lNode = addHeaderNode( lPreRenderingNode, {
                title:  getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "BEFORE_BOX_BODY" ),
                type:   "before_regions",
                isOpen: true
            });

            addComputations( lNode, { point: "BEFORE_BOX_BODY" }, true );
            addProcesses   ( lNode, { point: "BEFORE_BOX_BODY" }, true );
        }

        //
        // Emit "Regions"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  model.getComponentType( model.COMP_TYPE.REGION ).title.plural,
            type:   "main_regions",
            icon:   "icon-tree-region",
            isOpen: true
        });

        // Emit valid display points
        for ( var i = 0; i < lPageTemplate.displayPoints.length; i++ ) {
            // After Header and Before Footer regions are displayed somewhere else in the tree
            if ( $.inArray( lPageTemplate.displayPoints[ i ].id, [ "AFTER_HEADER", "BEFORE_FOOTER" ]) === -1 ) {
                addRegions( lNode, { point: lPageTemplate.displayPoints[ i ]});
            }
        }

        // Emit "Invalid Region Position"
        addRegions( lNode, { validPointsMap: lPageTemplate.displayPointsMap });

        //
        // Emit "Page Items and Buttons which are not assigned to a region"
        //
        lNode = addHeaderNode( pTreeData, {
            title:       msg( "NO_REGION" ),
            type:        "no_region",
            hasWarnings: true,
            isOpen:      true,
            omitIfEmpty: true
        });
        addPageItems    ( lNode, null );
        addRegionButtons( lNode, null );

        //
        // Emit "After Regions"
        //
        lPostRenderingNode = addHeaderNode( pTreeData, {
            title:             msg( "POST_RENDERING" ),
            type:              "post_rendering",
            showHasComponents: true
        });

        //
        // Emit "After Regions"
        //
        if ( !lIsGlobalPage ) {
            lNode = addHeaderNode( lPostRenderingNode, {
                title:  getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "AFTER_BOX_BODY" ),
                type:   "after_regions",
                isOpen: true
            });

            addComputations( lNode, { point: "AFTER_BOX_BODY" }, true );
            addProcesses   ( lNode, { point: "AFTER_BOX_BODY" }, true );
        }

        //
        // Emit "Before Footer"
        //
        lNode = addHeaderNode( lPostRenderingNode, {
            title:  getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "BEFORE_FOOTER" ),
            type:   "before_footer",
            isOpen: true
        });

        if ( !lIsGlobalPage ) {
            addComputations( lNode, { point: "BEFORE_FOOTER" }, true );
            addProcesses   ( lNode, { point: "BEFORE_FOOTER" }, true );
        }
        addRegions( lNode, { point: { id: "BEFORE_FOOTER", name: model.getComponentType( model.COMP_TYPE.REGION ).title.plural }});

        //
        // Emit "After Footer"
        //
        if ( !lIsGlobalPage ) {
            lNode = addHeaderNode( lPostRenderingNode, {
                title:  getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "AFTER_FOOTER" ),
                type:   "after_footer",
                isOpen: true
            });

            addComputations( lNode, { point: "AFTER_FOOTER" }, true );
            addProcesses   ( lNode, { point: "AFTER_FOOTER" }, true );
        }
    }


    function getRenderingComponentView( pTreeData ) {

        var lNode,
            lPageTemplate,
            lIsGlobalPage = model.isGlobalPage(),
            lPoints,
            lRegions,
            i;

        lPageTemplate = model.getPageTemplate();

        //
        // Emit "Regions"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  model.getComponentType( model.COMP_TYPE.REGION ).title.plural,
            type:   "main_regions",
            isOpen: true
        });

        // Emit "Invalid Region Position"
        addRegions( lNode, { validPointsMap: lPageTemplate.displayPointsMap });

        // Emit valid display points
        for ( i = 0; i < lPageTemplate.displayPoints.length; i++ ) {
            addRegions( lNode, { point: lPageTemplate.displayPoints[ i ]});
        }

        // Get all regions
        lRegions = model.getComponents( model.COMP_TYPE.REGION, {});


        //
        // Emit "Buttons"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  model.getComponentType( model.COMP_TYPE.BUTTON ).title.plural,
            type:   "main_buttons",
            isOpen: true
        });

        // Emit all region buttons which are not associated with a region
        addRegionButtons( lNode, null );

        // Emit associated buttons for each region
        for ( i = 0; i < lRegions.length; i++ ) {
            addRegionButtons( lNode, lRegions[ i ]);
        }

        //
        // Emit "Items"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  model.getComponentType( model.COMP_TYPE.PAGE_ITEM ).title.plural,
            type:   "main_page_items",
            isOpen: true
        });

        // Emit "Page Items which are not assigned to a region"
        addPageItems( lNode, null );

        // Emit associated page items for each region
        for ( i = 0; i < lRegions.length; i++ ) {
            addPageItems( lNode, lRegions[ i ]);
        }


        if ( !lIsGlobalPage ) {
            // Emit "Computations"
            lNode = addHeaderNode( pTreeData, {
                title:  model.getComponentType( model.COMP_TYPE.PAGE_COMPUTATION ).title.plural,
                type:   "main_computations",
                isOpen: true
            });

            lPoints = [ "ON_NEW_INSTANCE", "BEFORE_HEADER", "AFTER_HEADER", "BEFORE_BOX_BODY", "AFTER_BOX_BODY", "BEFORE_FOOTER", "AFTER_FOOTER" ];
            for ( i = 0; i < lPoints.length; i ++ ) {
                addComputations( lNode, { point: lPoints[ i ]}, true, true );
            }


            // Emit "Processes"
            lNode = addHeaderNode( pTreeData, {
                title:  model.getComponentType( model.COMP_TYPE.PAGE_PROCESS ).title.plural,
                type:   "main_processes",
                isOpen: true
            });

            lPoints = [ "ON_NEW_INSTANCE", "BEFORE_HEADER", "AFTER_HEADER", "BEFORE_BOX_BODY", "AFTER_BOX_BODY", "BEFORE_FOOTER", "AFTER_FOOTER" ];
            for ( i = 0; i < lPoints.length; i ++ ) {
                addProcesses( lNode, { point: lPoints[ i ]}, true, true );
            }


            // Emit "Branches"
            lNode = addHeaderNode( pTreeData, {
                title:  model.getComponentType( model.COMP_TYPE.BRANCH ).title.plural,
                type:   "main_branches",
                isOpen: true
            });

            addBranches( lNode, { point: "BEFORE_HEADER" }, true );
        }
    }


    function getDynamicActionData() {

        var lTreeData = {
                id:       "da",
                children: [],
                state:    {},
                commands: {
                    omitIfEmpty: false
                }
            },
            lNode,
            lComponents,
            lUsedEventsMap = { // the following events should always be visible
                "ready":  true,
                "change": true,
                "click":  true,
                "apexafterclosedialog": true
            };

        function addActions( pDaEventNode, pDaEvent, pResult, pTitle ) {

            var lFilterProperties = [{
                    id:    model.PROP.FIRE_WHEN_EVENT_RESULT_IS,
                    value: pResult.toUpperCase()
                }];

            if ( pDaEvent.getProperty( model.PROP.EVENT ).getValue() !== "ready" ) {
                lFilterProperties.push({
                    id:    model.PROP.FIRE_ON_PAGE_LOAD,
                    value: "Y"
                });
            }

            // Create the Header Node and for each action a node
            addComponents( pDaEventNode, {
                header: {
                    title:       pTitle,
                    type:        "page_load_da_actions_" + pResult,
                    isOpen:      true,
                    omitIfEmpty: true
                },
                setFilter: "header",
                component: {
                    type:    "page_load_da_action",
                    typeId:  model.COMP_TYPE.DA_ACTION,
                    isPlain: true,
                    filter: {
                        parentId:   pDaEvent.id,
                        properties: lFilterProperties
                    }
                }
            });
        } // addActions


        // Emit all dynamic actions which are fired during page load
        addComponents( lTreeData, {
            header:    {
                title:       msg( "FIRED_ON_PAGE_LOAD" ),
                type:        "page_load_da_events",
                isOpen:      false,
                omitIfEmpty: true
            },
            setFilter: false,
            component: {
                type:    "page_load_da_event",
                typeId:  model.COMP_TYPE.DA_EVENT,
                isPlain: true,
                filter:  {
                    filterFunction: function() {

                        var lResult = true;

                        // If the dynamic action isn't bound to the "Page Load" event we have to check if it contains
                        // actions where the "Fire on Page Load" flag is set
                        if ( this.getProperty( model.PROP.EVENT ).getValue() !== "ready" ) {
                            lResult = (
                                this.getChilds( model.COMP_TYPE.DA_ACTION, {
                                    properties: [{
                                        id:    model.PROP.FIRE_ON_PAGE_LOAD,
                                        value: "Y"
                                    }]
                                }, false ).length > 0 );
                        }

                        return lResult;
                    }
                },
                addSubComponents: function( pDaEventNode, pDaEvent ) {
                    addActions( pDaEventNode, pDaEvent, "true",  msg( "TRUE" ));
                    addActions( pDaEventNode, pDaEvent, "false", msg( "FALSE" ));
                }
            }
        });

        // Emit "Events"
        lNode = addHeaderNode( lTreeData, {
            title:  msg( "EVENTS" ),
            type:   "da_events",
            isOpen: true,
            filter: {
                properties: [{ id: model.PROP.EVENT, value: "" }]
            }
        });

        // Find all events which are used by the dynamic action on the current page
        lComponents = model.getComponents( model.COMP_TYPE.DA_EVENT, {});
        for ( var i = 0; i < lComponents.length; i++ ) {
            lUsedEventsMap[ lComponents[ i ].getProperty( model.PROP.EVENT ).getValue() ] = true;
        }

        // Emit all dynamic actions grouped by events
        for ( var lEvent in lUsedEventsMap ) {
            if ( lUsedEventsMap.hasOwnProperty( lEvent )) {
                addDynamicActions( lNode, { event: lEvent });
            }
        }

        postProcessNodes( lTreeData );

        return lTreeData;

    }


    function getProcessingData() {

        var lTreeData = {
                id:       "rd",
                children: [],
                state:    {},
                commands: {
                    omitIfEmpty: false
                }
            };

        if ( pd.getPreference( "GROUP_BY_COMPONENT_TYPE" ) === "Y" ) {
            getProcessingComponentView( lTreeData );
        } else {
            getProcessingEventView( lTreeData );
        }

        postProcessNodes( lTreeData );

        return lTreeData;

    }


    function getProcessingEventView( pTreeData ) {

        var lNode,
            lIsGlobalPage = model.isGlobalPage();

        // Don't show processing for global page
        if ( lIsGlobalPage ) {
            return;
        }

        //
        // Emit "After Submit"
        //
        lNode = addHeaderNode( pTreeData, {
            title: getPointTitle( model.COMP_TYPE.PAGE_COMPUTATION, "AFTER_SUBMIT" ),
            type:  "after_submit"
        });

        addProcesses   ( lNode, { point: "ON_SUBMIT_BEFORE_COMPUTATION" }, true, true );
        addBranches    ( lNode, { point: "BEFORE_COMPUTATION" }, true );
        addComputations( lNode, { point: "AFTER_SUBMIT" }, true, true );

        //
        // Emit "Validating"
        //
        lNode = addHeaderNode( pTreeData, {
            title: getPointTitle( model.COMP_TYPE.BRANCH, "BEFORE_VALIDATION" ),
            type:  "validating"
        });

        addBranches   ( lNode, { point: "BEFORE_VALIDATION" }, true );
        addValidations( lNode, {}, true );

        //
        // Emit "Processing"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "AFTER_SUBMIT" ),
            type:   "processing",
            isOpen: true
        });

        addBranches ( lNode, { point: "BEFORE_PROCESSING" }, true );
        addProcesses( lNode, { point: "AFTER_SUBMIT" }, true, true );

        //
        // Emit "After Processing"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  getPointTitle( model.COMP_TYPE.BRANCH, "AFTER_PROCESSING" ),
            type:   "after_processing",
            isOpen: true
        });

        addBranches( lNode, { point: "AFTER_PROCESSING" }, true );

        //
        // Emit "AJAX Callbacks"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  getPointTitle( model.COMP_TYPE.PAGE_PROCESS, "ON_DEMAND" ),
            id:     "ajax_callbacks",
            type:   "processes",
            isOpen: true
        });

        addProcesses( lNode, { point: "ON_DEMAND" }, false, true );

    } // getProcessingEventView


    function getProcessingComponentView( pTreeData ) {

        var lNode,
            lPoints,
            lIsGlobalPage = model.isGlobalPage(),
            i;

        // Don't show processing for global page
        if ( lIsGlobalPage ) {
            return;
        }

        //
        // Emit "Computations"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  model.getComponentType( model.COMP_TYPE.PAGE_COMPUTATION ).title.plural,
            type:   "main_computations",
            isOpen: true,
            filter: {
                properties: [{ id: model.PROP.COMPUTATION_POINT, value: "AFTER_SUBMIT" }]
            }
        });

        addComputations( lNode, { point: "AFTER_SUBMIT" }, true, true );


        //
        // Emit "Validations"
        //
        addValidations( pTreeData, {}, false );


        //
        // Emit "Processes"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  model.getComponentType( model.COMP_TYPE.PAGE_PROCESS ).title.plural,
            type:   "main_processes",
            isOpen: true,
            filter: {
                properties: [{ id: model.PROP.PROCESS_POINT, value: "AFTER_SUBMIT" }]
            }
        });

        lPoints = [ "ON_SUBMIT_BEFORE_COMPUTATION", "AFTER_SUBMIT", "ON_DEMAND" ];
        for ( i = 0; i < lPoints.length; i ++ ) {
            addProcesses( lNode, { point: lPoints[ i ]}, true, true );
        }


        //
        // Emit "Branches"
        //
        lNode = addHeaderNode( pTreeData, {
            title:  model.getComponentType( model.COMP_TYPE.BRANCH ).title.plural,
            type:   "main_branches",
            isOpen: true,
            filter: {
                properties: [{ id: model.PROP.BRANCH_POINT, value: "AFTER_PROCESSING" }]
            }
        });

        lPoints = [ "BEFORE_COMPUTATION", "BEFORE_VALIDATION", "BEFORE_PROCESSING", "AFTER_PROCESSING" ];
        for ( i = 0; i < lPoints.length; i ++ ) {
            addBranches( lNode, { point: lPoints[ i ]}, true );
        }

    } // getProcessingComponentView


    function getSharedData() {

        function addSharedComponents( pParentNode, pComponentType, pOmitIfEmpty ) {

            var lType = model.getComponentType( pComponentType.typeId ),
                lRefByCompProps,
                lComponents,
                lProperty,
                lValue,
                lAddSharedComponent,
                lUsedSharedComponents,
                lHeaderNode;

            lHeaderNode = addHeaderNode( pParentNode, {
                title:       pComponentType.title || ( pComponentType.titleTypeId ? model.getComponentType( pComponentType.titleTypeId ).title.singular : lType.title.plural ),
                type:        pComponentType.type + "s",
                isOpen:      false,
                omitIfEmpty: pOmitIfEmpty,
                data:        {
                    typeId: pComponentType.typeId
                }
            });

            // Find all properties which are using the current component type as LOV
            lRefByCompProps = getRefByCompProps( pComponentType.typeId );
            lUsedSharedComponents = {};
            for ( var i = 0; i < lRefByCompProps.length; i++ ) {

                // Find all shared components which are used by one of the page level components
                lComponents = model.getComponents( lRefByCompProps[ i ].typeId, {});
                for ( var j = 0; j < lComponents.length; j++ ) {

                    lAddSharedComponent = false;

                    if (  lRefByCompProps[ i ].typeId === model.COMP_TYPE.PAGE
                       && $.inArray( lRefByCompProps[ i ].propertyId, [ model.PROP.PAGE_TEMPLATE, model.PROP.DIALOG_TEMPLATE, model.PROP.NAVIGATION_LIST, model.PROP.TAB_SET ] ) !== -1 )
                    {

                        if ( lComponents[ j ].getProperty( lRefByCompProps[ i ].propertyId ) && ( lRefByCompProps[ i ].propertyId === model.PROP.PAGE_TEMPLATE || lRefByCompProps[ i ].propertyId === model.PROP.DIALOG_TEMPLATE )) {

                            lAddSharedComponent = true;
                            lValue = model.getPageTemplate().id;

                        }
                        /* Ignore NAVIGATION_LIST and TAB_SET references, they are handled in the caller */

                    } else {

                        // Does the property exists for the current component?
                        lProperty = lComponents[ j ].getProperty( lRefByCompProps[ i ].propertyId );
                        if ( lProperty ) {
                            lValue = lProperty.getValue();
                            if ( lValue !== "" ) {

                                // Build Options and Authorization use ! or - to negate it, we have to remove that prefix
                                if (  ( pComponentType.typeId === model.COMP_TYPE.BUILD_OPTION || pComponentType.typeId === model.COMP_TYPE.AUTHORIZATION )
                                    && /^[-!]/.test( lValue ))
                                {
                                    lValue = lValue.substr( 1 );
                                }

                                lAddSharedComponent = true;

                            }
                        }

                    }

                    if ( lAddSharedComponent && lValue !== "" ) {
                        if ( !lUsedSharedComponents.hasOwnProperty( lValue )) {
                            lUsedSharedComponents[ lValue ] = {};
                        }
                        if ( !lUsedSharedComponents[ lValue ].hasOwnProperty( lRefByCompProps[ i ].typeId )) {
                            lUsedSharedComponents[ lValue ][ lRefByCompProps[ i ].typeId ] = [];
                        }
                        lUsedSharedComponents[ lValue ][ lRefByCompProps[ i ].typeId ].push( lComponents[ j ]);
                    }
                }
            }

            // Emit all the found shared components and show the referencing page level components as well
            // Todo this should be ordered by name
            for ( var lId in lUsedSharedComponents ) {
                if ( lUsedSharedComponents.hasOwnProperty( lId )) {

                    addComponents( lHeaderNode, {
                        header: false,
                        component: {
                            type:   pComponentType.type,
                            typeId: pComponentType.typeId,
                            isOpen: false,
                            filter: {
                                id: lId,
                                properties: []
                            },
                            addSubComponents: function( pComponentNode ) {

                                var lRefByType,
                                    lHeaderNode;

                                for ( var lTypeId in lUsedSharedComponents[ lId ]) {
                                    if ( lUsedSharedComponents[ lId ].hasOwnProperty( lTypeId )) {

                                        lRefByType = model.getComponentType( lTypeId );

                                        lHeaderNode = addHeaderNode( pComponentNode, {
                                            title:       formatNoEscape( "REFERENCED_BY", ( lUsedSharedComponents[ lId ][ lRefByType.id ].length === 1 ) ? lRefByType.title.singular : lRefByType.title.plural ),
                                            type:        "references",
                                            isOpen:      true,
                                            omitIfEmpty: false
                                        });

                                        for ( var k = 0; k < lUsedSharedComponents[ lId ][ lRefByType.id ].length; k++ ) {
                                            addComponents( lHeaderNode, {
                                                header: false,
                                                component: {
                                                    type:    "referenced_by",
                                                    typeId:  lRefByType.id,
                                                    isPlain: true,
                                                    filter: {
                                                        id: lUsedSharedComponents[ lId ][ lRefByType.id ][ k ].id,
                                                        properties: []
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            } // addSubComponents
                        }
                    });
                }
            }

            return lHeaderNode;

        } // addSharedComponents


        function addSharedCompTypes( pParentNode, pSharedCompTypes, pOmitIfEmpty ) {

            var lHeaderNode, lId;

            for ( var i = 0; i < pSharedCompTypes.length; i++ ) {

                // Special handling for global navigation lists which are "special" lists which should appear with there
                // own entries in the Shared Components
                if ( $.inArray( pSharedCompTypes[ i ].type, [ "navigation_list", "nav_list_template", "tab_set" ]) !== -1 ) {

                    if ( pSharedCompTypes[ i ].type === "navigation_list" ) {

                        lId = model.getNavListId();

                    } else if ( pSharedCompTypes[ i ].type === "nav_list_template" ) {

                        lId = model.getNavListTemplateId();

                    } else if ( pSharedCompTypes[ i ].type === "tab_set" ) {

                        lId = model.getTabSetId();

                    }

                    if ( lId ) {
                        addComponents( pParentNode, {
                            header: {
                                title:       pSharedCompTypes[ i ].title,
                                type:        pSharedCompTypes[ i ].type + "s",
                                isOpen:      false,
                                omitIfEmpty: true,
                                data:        {
                                    typeId: pSharedCompTypes[ i ].typeId
                                }
                            },
                            component: {
                                type:   pSharedCompTypes[ i ].type,
                                typeId: pSharedCompTypes[ i ].typeId,
                                isOpen: false,
                                filter: {
                                    id: lId,
                                    properties: []
                                }
                            }
                        });
                    }

                } else if ( pSharedCompTypes[ i ].hasOwnProperty( "typeId" )) {

                    lHeaderNode = addSharedComponents( pParentNode, pSharedCompTypes[ i ], pOmitIfEmpty );

                } else {

                    lHeaderNode = addHeaderNode( pParentNode, {
                        title:       pSharedCompTypes[ i ].title,
                        type:        pSharedCompTypes[ i ].type + "s",
                        isOpen:      true,
                        omitIfEmpty: pOmitIfEmpty
                    });

                }

                if ( pSharedCompTypes[ i ].children ) {
                    addSharedCompTypes( lHeaderNode, pSharedCompTypes[ i ].children, true );
                }
            }
        } // addSharedCompTypes


        var lTreeData = {
                id:       "sd",
                children: [],
                state:    {},
                commands: {
                    omitIfEmpty: false
                }
            };


        addSharedCompTypes( lTreeData, SHARED_COMP_TYPES, false );

        postProcessNodes( lTreeData );

        return lTreeData;

    }


    function getRefByCompProps( pComponentTypeId ) {

        var lType = model.getComponentType( pComponentTypeId ),
            lRefProperty,
            lRefType,
            lResult = [];

        // Find all properties which are using the current component type as LOV
        for ( var i = 0; i < lType.refByProperties.length; i++ ) {

            // Find all the component types which are using that property
            lRefProperty = model.getProperty( lType.refByProperties[ i ]);
            for ( var j = 0; j < lRefProperty.refByComponentTypes.length; j++ ) {

                // Only scan page level component types
                lRefType = model.getComponentType( lRefProperty.refByComponentTypes[ j ] );
                if ( lRefType.isPageComponent || lRefType.id === model.COMP_TYPE.PAGE ) {
                    lResult.push({
                        typeId:     lRefType.id,
                        propertyId: lRefProperty.id
                    });
                }
            }
        }
        return lResult;
    } // getRefByCompProps


    // todo tabform_column check has to be integrated into new drag & drop
    function checkMove( pNode, pRefNode, pType, pTree ) {
        var lNodeType      = pTree.get_type( pNode ),
            lParentNode    = pTree.parent( pNode ),
            lParentRefNode = pTree.parent( pRefNode );

        // only some node types can be dropped everywhere, but all other node types
        // have to stay within the same parent (like report columns, ...)
        if ( $.inArray( lNodeType, [ "region", "computation", "process", "branch",
                                     "page_item", "form_button", "region_button", "page_load_da_event", "da_action"]) !== -1 ) {
            return true;
        } else if ( $.inArray( lNodeType, [ "ir_report_column", "ir_column_group", "classic_report_column", "tabform_column" ]) !== -1 ) {
            // report columns have to stay within the same report region
            if ( lParentNode.attr( "id" ) === lParentRefNode.attr( "id" )) {
                // Don't move anything before the row selector, it has to be the first column (bug# 13018546)
                if ( lNodeType === "tabform_column" ) {
                    return ( !( pType === "before" && /^CHECK\$/.test( pTree.get_node( pRefNode ).attr( "column_alias" )))); // todo check not yet complete
                } else {
                    return true;
                }
            } else {
                return false;
            }
        } else {
            return ( lParentNode.attr( "id" ) === lParentRefNode.attr( "id" ));
        }
    }


    function getComponentHierarchyValues( pNode ) {

        // sets the specified attribute value from the parent or grand parent node
        function addValue( pOptions ) {

            var lComponent;

            if ( pOptions.hasOwnProperty( "value" )) {
                // Add static value
                lValues.push({
                    id:    pOptions.id,
                    value: pOptions.value
                });

            } else if ( pOptions.typeId ) {
                // Add nearest component with that type
                lComponent = getNearestComponent( pOptions.typeId, pNode._parent );

                lValues.push({
                    id:    pOptions.id,
                    value: ( lComponent ) ? lComponent.id : ""
                });

            } else if ( pOptions.id ) {
                // Add nearest property value
                lValues.push({
                    id:    pOptions.id,
                    value: getNearestValue( pOptions.id, pNode._parent ) + ""
                });

            }
        }

        var lValues = [];

        switch ( pNode.type ) {
            case "region":
                if ( pNode._parent.type === "regions" ) {
                    addValue({ id: model.PROP.PARENT_REGION, value: "" });
                    addValue({ id: model.PROP.REGION_POSITION });
                } else {
                    // It's a sub region
                    addValue({ id: model.PROP.PARENT_REGION, typeId: model.COMP_TYPE.REGION });
                }
                break;
            case "page_item":
                addValue({ id: model.PROP.REGION, typeId: model.COMP_TYPE.REGION });
                break;
            case "form_button":
                addValue({ id: model.PROP.REGION, typeId: model.COMP_TYPE.REGION });
                addValue({ id: model.PROP.BUTTON_POSITION });
                break;
            case "region_button":
                addValue({ id: model.PROP.REGION, typeId: model.COMP_TYPE.REGION });
                addValue({ id: model.PROP.BUTTON_POSITION });
                break;
            case "da_action":
                addValue({ id: model.PROP.DA_EVENT, typeId: model.COMP_TYPE.DA_EVENT });
                addValue({ id: model.PROP.FIRE_WHEN_EVENT_RESULT_IS });
                break;
            case "computation":
                addValue({ id: model.PROP.COMPUTATION_POINT });
                break;
            case "process":
                addValue({ id: model.PROP.PROCESS_POINT });
                break;
            case "branch":
                addValue({ id: model.PROP.BRANCH_POINT });
                break;
        }

        return lValues;
    }


    function nodesMoved( pChange, pTree$ ) {

        var lComponents = [],
            lPrevComponent,
            lMessage,
            lTransaction;

        if ( pChange.items.length > 0 ) {

            lMessage = model.transaction.message( {
                action:     model.MESSAGE_ACTION.MOVE,
                component:  getComponent( pChange.items[ 0 ].toNode ),
                count:      pChange.items.length
            });

            lTransaction = model.transaction.start( "", lMessage );

            for ( var i = 0; i < pChange.items.length; i++ ) {

                lComponents[ i ] = getComponent( pChange.items[ i ].toNode );
                if ( pChange.items[ i ].toIndex === 0 ) {
                    lPrevComponent = null;
                } else {
                    lPrevComponent = getComponent( pChange.parentNode.children[ pChange.items[ i ].toIndex - 1 ]);
                    // If we don't find a component it's very likely that we have dragged the component onto the parent component
                    // and they treeView just doesn't know yet into which of the children nodes it should actually be put into
                    if ( !lPrevComponent ) {
                        lPrevComponent = "last";
                    }
                }

                lComponents[ i ].move( lPrevComponent, getComponentHierarchyValues( pChange.items[ i ].toNode ));
            }

            apex.commandHistory.execute( lTransaction );

        }
    }


    function nodesCopied( pChange, pTree$ ) {

        var lComponent,
            lPrevComponent,
            lNewComponents = [],
            lMessage,
            lTransaction;

        if ( pChange.items.length > 0 ) {

            lMessage = model.transaction.message( {
                action:     model.MESSAGE_ACTION.DUPLICATE,
                component:  getComponent( pChange.items[ 0 ].toNode ),
                count:      pChange.items.length
            });

            lTransaction = model.transaction.start( "", lMessage );

            for ( var i = 0; i < pChange.items.length; i++ ) {

                lComponent = getComponent( pChange.items[ i ].toNode );
                if ( pChange.items[ i ].toIndex === 0 ) {
                    lPrevComponent = null;
                } else {
                    lPrevComponent = getComponent( pChange.parentNode.children[ pChange.items[ i ].toIndex - 1 ]);
                    // If we don't find a component it's very likely that we have dragged the component onto the parent component
                    // and they treeView just doesn't know yet into which of the children nodes it should actually be put into
                    if ( !lPrevComponent ) {
                        lPrevComponent = "last";
                    }
                }

                lNewComponents[ i ] = lComponent.duplicate();
                lNewComponents[ i ].move( lPrevComponent, getComponentHierarchyValues( pChange.items[ i ].toNode ));
            }

            apex.commandHistory.execute( lTransaction );

            // Select the moved components
            setSelectedComponents( lNewComponents, pTree$, pChange.items[ 0 ].toNode._parent.id, true );
        }
    }


    function nodesDeleted( pChange, pTree$ ) {

        var lComponent,
            lMessage,
            lTransaction;

        if ( pChange.items.length > 0 ) {

            lMessage = model.transaction.message( {
                action:     model.MESSAGE_ACTION.DELETE,
                component:  getComponent( pChange.items[ 0 ].node ),
                count:      pChange.items.length
            });

            lTransaction = model.transaction.start( "", lMessage );

            for ( var i = 0; i < pChange.items.length; i++ ) {
                lComponent = getComponent( pChange.items[ i ].node );
                if ( lComponent ) {
                    lComponent.remove();
                }
            }
        }
        apex.commandHistory.execute( lTransaction );
    }


    function duplicateNodes( pNodes, pTree$ ) {

        var lMessage,
            lTransaction,
            lNewComponents = [];

        if ( pNodes.length > 0 ) {

            lMessage = model.transaction.message( {
                action:     model.MESSAGE_ACTION.DUPLICATE,
                component:  getComponent( pNodes[ 0 ] ),
                count:      pNodes.length
            });

            lTransaction = model.transaction.start( "", lMessage );

            for ( var i = 0; i < pNodes.length; i++ ) {
                lNewComponents.push( getComponent( pNodes[ i ] ).duplicate() );
            }

            apex.commandHistory.execute( lTransaction );

            // Select the moved components
            setSelectedComponents( lNewComponents, pTree$, pNodes[ 0 ]._parent.id, true );
        }
    }


    function deleteNodes( pNodes, pTree$ ) {

        var lMessage,
            lTransaction;

        if ( pNodes.length > 0 ) {

            lMessage = model.transaction.message( {
                action:     model.MESSAGE_ACTION.DELETE,
                component:  getComponent( pNodes[ 0 ] ),
                count:      pNodes.length
            });

            lTransaction = model.transaction.start( "", lMessage );

            for ( var i = 0; i < pNodes.length; i++ ) {
                getComponent( pNodes[ i ] ).remove();
            }

            apex.commandHistory.execute( lTransaction );

            // todo select next component

        }
    }


    function setSelectedComponents( pComponents, pTree$, pParentId, pNotify ) {

        var lComponentNodes  = [],
            lComponentNodes$ = $(),
            lParentId = pParentId,
            lNode,
            i;

        // For the dynamic action tree we always want to select the dynamic actions displayed below "Events"
        if ( !pParentId && pTree$[ 0 ].id === "PDdynamicActionTree" ) {
            lParentId = "da_da_events";
        }

        // select all component nodes passed in
        if ( pNotify ) {

            for ( i = 0; i < pComponents.length; i++ ) {
                lComponentNodes$ = lComponentNodes$.add( getComponentDomNodes$( pComponents[ i ], pTree$, lParentId ));
            }

            pTree$.treeView( "setSelection", lComponentNodes$ );

        } else {

            for ( i = 0; i < pComponents.length; i++ ) {
                lNode = getComponentNode( pComponents[ i ], pTree$, lParentId );
                if ( lNode ) {
                    lComponentNodes.push( lNode );
                }
            }

            pTree$.treeView( "setSelectedNodes", lComponentNodes );

        }

    } // setSelectedComponents



    function createOppositeDynamicAction( pNodes, pTree$ ) {

        var OPPOSITE_MAP = {
                "NATIVE_SHOW":         "NATIVE_HIDE",
                "NATIVE_HIDE":         "NATIVE_SHOW",
                "NATIVE_ENABLE":       "NATIVE_DISABLE",
                "NATIVE_DISABLE":      "NATIVE_ENABLE",
                "NATIVE_ADD_CLASS":    "NATIVE_REMOVE_CLASS",
                "NATIVE_REMOVE_CLASS": "NATIVE_ADD_CLASS"
            };

        var lComponent,
            lValues = [],
            lType,
            lPluginAttributeNo,
            lPluginProperty,
            lResultIs,
            lMessage,
            lTransaction,
            lNewComponents = [];

        lMessage = model.transaction.message( {
            action:     model.MESSAGE_ACTION.CREATE,
            component:  getComponent( pNodes[ 0 ] ),
            count:      pNodes.length
        });

        lTransaction = model.transaction.start( "", lMessage );

        for ( var i = 0; i < pNodes.length; i++ ) {

            lComponent = getComponent( pNodes[ i ] );

            // Set the opposite action type, if non was found we use the current type
            lType = lComponent.getProperty( model.PROP.DA_ACTION_TYPE ).getValue();
            if ( OPPOSITE_MAP.hasOwnProperty( lType )) {
                lValues.push({
                    id:    model.PROP.DA_ACTION_TYPE,
                    value: OPPOSITE_MAP[ lType ]
                });
                // Copy all plug-in attributes from the old plug-in to the new plug-in
                lPluginAttributeNo = 1;
                lPluginProperty    = model.getPluginProperty( model.COMP_TYPE.DA_ACTION, lType, lPluginAttributeNo );
                while ( lPluginProperty && lPluginAttributeNo <= MAX_DA_ACTION_PLUGIN_ATTRIBUTES ) {
                    lValues.push({
                        id:    model.getPluginProperty( model.COMP_TYPE.DA_ACTION, OPPOSITE_MAP[ lType ], lPluginAttributeNo ).id,
                        value: lComponent.getProperty( lPluginProperty.id ).getValue()
                    });
                    lPluginAttributeNo++;
                    lPluginProperty = model.getPluginProperty( model.COMP_TYPE.DA_ACTION, lType, lPluginAttributeNo );
                }
                // This is necessary, because changing the type will trigger that "Fire on page load" will be set to a
                // default specified by the type, but we actually want to use what has already been defined.
                lValues.push({
                    id:    model.PROP.FIRE_ON_PAGE_LOAD,
                    value: lComponent.getProperty( model.PROP.FIRE_ON_PAGE_LOAD ).getValue()
                });
            }

            // Set the opposite result
            if ( lComponent.getProperty( model.PROP.FIRE_WHEN_EVENT_RESULT_IS ).getValue() === "TRUE" ) {
                lResultIs = "FALSE";
            } else {
                lResultIs = "TRUE";
            }
            lValues.push({ id: model.PROP.FIRE_WHEN_EVENT_RESULT_IS, value: lResultIs });
            lNewComponents.push( lComponent.duplicate( lValues ) );

            // Always move the new action after all the existing actions
            lNewComponents[ lNewComponents.length - 1 ].move( "last" );

        }
        apex.commandHistory.execute( lTransaction );

        // Select the newly created component
        setSelectedComponents( lNewComponents, pTree$, pNodes[ 0 ]._parent._parent.id, true );
    }


    function createComponent( pNode, pTree$, pComponentTypeId, pSecondaryType ) {

        var lNodeComponent = getComponent( pNode ),
            lValues        = [],
            lParentId,
            lParentComponent,
            lColumnName,
            lComponents,
            lStartNodeId,
            lTransaction,
            lNewComponent,
            lPrevComponent,
            lNewDomNode$,
            lMessage;

        function addValue( pOptions ) {

            var lComponent;

            if ( pOptions.hasOwnProperty( "value" )) {
                // Add static value
                lValues.push({
                    id:    pOptions.id,
                    value: pOptions.value
                });

            } else if ( pOptions.typeId ) {
                // Add nearest component with that type
                lComponent = getNearestComponent( pOptions.typeId, pNode );

                lValues.push({
                    id:    pOptions.id,
                    value: ( lComponent ) ? lComponent.id : ""
                });

            } else if ( pOptions.id ) {
                // Add nearest property value
                lValues.push({
                    id:    pOptions.id,
                    value: getNearestValue( pOptions.id, pNode ) + ""
                });

            }
        }

        if ( pComponentTypeId === model.COMP_TYPE.REGION ) {

            // Do we want to create a sub region?
            if ( pSecondaryType === "SUB_REGION" ) {
                addValue({ id: model.PROP.PARENT_REGION, typeId: model.COMP_TYPE.REGION });
            // We also want to create a sub region if someone calls "Create Region" on an existing sub region
            } else if ( lNodeComponent && lNodeComponent.getProperty( model.PROP.PARENT_REGION ).getValue() !== "" ) {
                addValue({ id: model.PROP.PARENT_REGION });
            } else {
                addValue({ id: model.PROP.REGION_POSITION });
            }

        } else if ( pComponentTypeId === model.COMP_TYPE.PAGE_ITEM ) {

            addValue({ id: model.PROP.REGION, typeId: model.COMP_TYPE.REGION });

        } else if ( pComponentTypeId === model.COMP_TYPE.BUTTON ) {

            addValue({ id: model.PROP.REGION, typeId: model.COMP_TYPE.REGION });
            addValue({ id: model.PROP.BUTTON_POSITION });

        } else if ( pComponentTypeId === model.COMP_TYPE.PAGE_COMPUTATION ) {

            lParentComponent = getNearestComponent( model.COMP_TYPE.PAGE_ITEM, pNode );

            // If the computation was created on or below a page item, then we will automatically assign it to this page item
            if ( lParentComponent ) {
                addValue({ id: model.PROP.COMPUTATION_ITEM_NAME, value: lParentComponent.getProperty( model.PROP.ITEM_NAME ).getValue()});
                addValue({ id: model.PROP.COMPUTATION_POINT, value: "BEFORE_BOX_BODY" });
            } else {
                addValue({ id: model.PROP.COMPUTATION_POINT });
            }

        } else if ( pComponentTypeId === model.COMP_TYPE.PAGE_PROCESS ) {

            addValue({ id: model.PROP.PROCESS_POINT });

        } else if ( pComponentTypeId === model.COMP_TYPE.VALIDATION ) {

            lParentComponent = getNearestComponent(
                [ model.COMP_TYPE.PAGE_ITEM,
                  model.COMP_TYPE.REGION,
                  model.COMP_TYPE.TAB_FORM_COLUMN
                ],
                pNode );

            // Was the validation created on or below a component? If yes, default to that component.
            if ( lParentComponent ) {
                switch ( lParentComponent.typeId ) {
                    case model.COMP_TYPE.PAGE_ITEM:

                        addValue({ id: model.PROP.ASSOCIATED_ITEM, value: lParentComponent.id });
                        break;

                    case model.COMP_TYPE.REGION:

                        addValue({ id: model.PROP.VALIDATION_REGION, value: lParentComponent.id });
                        break;

                    case model.COMP_TYPE.TAB_FORM_COLUMN:

                        lColumnName = lParentComponent.getProperty( model.PROP.COLUMN_NAME ).getValue();
                        addValue({ id: model.PROP.VALIDATION_REGION,      value: lParentComponent.parentId });
                        addValue({ id: model.PROP.ASSOCIATED_COLUMN,      value: lColumnName });
                        addValue({ id: model.PROP.REGION_VALIDATION_TYPE, value: "ITEM_NOT_NULL" });
                        addValue({ id: model.PROP.REGION_VAL_COLUMN,      value: lColumnName });
                        addValue({ id: model.PROP.ERROR_MESSAGE,          value: "#COLUMN_HEADER# must have a value." }); // todo NLS
                        break;
                }
            }

        } else if ( pComponentTypeId === model.COMP_TYPE.BRANCH ) {

            addValue({ id: model.PROP.BRANCH_POINT });

        } else if ( pComponentTypeId === model.COMP_TYPE.DA_EVENT ) {

            lParentComponent = getNearestComponent(
                [ model.COMP_TYPE.PAGE_ITEM,
                  model.COMP_TYPE.BUTTON,
                  model.COMP_TYPE.REGION,
                  model.COMP_TYPE.PAGE ],
                pNode );

            // Was the dynamic action created on or below a component? If yes, default to that component.
            if ( lParentComponent ) {
                switch ( lParentComponent.typeId ) {
                    case model.COMP_TYPE.PAGE_ITEM:

                        addValue({ id: model.PROP.EVENT, value: "change" });
                        addValue ({ id: model.PROP.WHEN_TYPE,  value: "ITEM" });
                        addValue ({ id: model.PROP.WHEN_ITEMS, value: lParentComponent.getProperty( model.PROP.ITEM_NAME ).getValue()});
                        break;

                    case model.COMP_TYPE.BUTTON:

                        if ( $.inArray( lParentComponent.getProperty( model.PROP.BUTTON_ACTION ).getValue(), [ "REDIRECT_PAGE", "REDIRECT_APP" ]) !== -1 ) {
                            addValue({ id: model.PROP.EVENT, value: "apexafterclosedialog" });
                        } else {
                            addValue({ id: model.PROP.EVENT, value: "click" });
                        }
                        addValue ({ id: model.PROP.WHEN_TYPE,   value: "BUTTON" });
                        addValue ({ id: model.PROP.WHEN_BUTTON, value: lParentComponent.id });
                        break;

                    case model.COMP_TYPE.REGION:

                        addValue({ id: model.PROP.EVENT, value: "apexafterrefresh" });
                        addValue ({ id: model.PROP.WHEN_TYPE,   value: "REGION" });
                        addValue ({ id: model.PROP.WHEN_REGION, value: lParentComponent.id });
                        break;

                    case model.COMP_TYPE.PAGE:

                        addValue({ id: model.PROP.EVENT, value: "ready" });
                        break;
                }
            } else {
                addValue({ id: model.PROP.EVENT });
            }

        } else if ( pComponentTypeId === model.COMP_TYPE.DA_ACTION ) {

            addValue({ id: model.PROP.DA_EVENT, typeId: model.COMP_TYPE.DA_EVENT });

            if ( pSecondaryType !== undefined ) {
                addValue({ id: model.PROP.FIRE_WHEN_EVENT_RESULT_IS, value: pSecondaryType });
            } else {
                addValue({ id: model.PROP.FIRE_WHEN_EVENT_RESULT_IS });
            }

        } else if ( pComponentTypeId === model.COMP_TYPE.TAB_FORM_COLUMN || pComponentTypeId === model.COMP_TYPE.CLASSIC_RPT_COLUMN ) {

            lParentComponent = getNearestComponent( model.COMP_TYPE.REGION, pNode );
            lParentId        = lParentComponent.id;
            lComponents      = lParentComponent.getChilds( pComponentTypeId );
            addValue({ id: model.PROP.QUERY_COLUMN_ID,     value: lComponents.length + 1 });
            addValue({ id: model.PROP.DERIVED_COLUMN,      value: "Y" });
            addValue({ id: model.PROP.DISABLE_SORT_COLUMN, value: "Y" });

            if ( pSecondaryType === "ROW_SELECTOR" ) {

                addValue({ id: model.PROP.COLUMN_NAME,          value: ROW_SELECTOR_COLUMN_NAME });
                addValue({ id: model.PROP.TAB_FORM_COLUMN_TYPE, value: "ROW_SELECTOR" });
                addValue({ id: model.PROP.COLUMN_HEADING,       value: "&nbsp;" });

            } else if ( pSecondaryType === "VIRTUAL" ) {

                // Get all existing virtual columns and order them by column name to get the last used derived column
                lComponents = lParentComponent.getChilds( pComponentTypeId, {
                    properties: [{ id: model.PROP.DERIVED_COLUMN, value: "Y" }]
                }, function( a, b ) {
                    return ( a.getProperty( model.PROP.COLUMN_NAME ).getValue() > b.getProperty( model.PROP.COLUMN_NAME ).getValue()) ? 1 : -1;
                });

                addValue({
                    id:    model.PROP.COLUMN_NAME,
                    value: "DERIVED$" + (( lComponents.length < 8 ) ? "0" : "" ) + ( lComponents.length + 1 )
                });
                addValue({
                    id:    ( pComponentTypeId === model.COMP_TYPE.TAB_FORM_COLUMN ) ? model.PROP.TAB_FORM_COLUMN_TYPE : model.PROP.CLASSIC_REPORT_COLUMN_TYPE,
                    value: "LINK"
                });
                addValue({
                    id:    model.PROP.COLUMN_HEADING,
                    value: "&nbsp;"
                });
            }

        } else if ( pComponentTypeId === model.COMP_TYPE.IR_COLUMN_GROUP ) {

            lParentId = getNearestComponent( model.COMP_TYPE.IR_ATTRIBUTES, pNode ).id;

        } else if ( pComponentTypeId === model.COMP_TYPE.CHART_SERIES ) {

            lParentComponent = getNearestComponent( model.COMP_TYPE.CHART, pNode );
            lParentId = lParentComponent.id;
            addValue({ id: model.PROP.SERIES_CHART_TYPE, value: lParentComponent.getProperty( model.PROP.CHART_TYPE ).getValue()});

        } else if ( pComponentTypeId === model.COMP_TYPE.MAP_CHART_SERIES ) {

            lParentComponent = getNearestComponent( model.COMP_TYPE.MAP_CHART, pNode );
            lParentId = lParentComponent.id;

        }

        // Get the start tree node where we have to look for the newly created component. It's necessary to restrict
        // the search, because a component can appear multiple times in the tree (ie. computations), but we do want to
        // select the tree node where we have created the component
        if ( lNodeComponent ) {
            lStartNodeId = pNode._parent.id;
        }

        // The "Row Selector" of a tabular form should always be added as first column
        if ( pComponentTypeId === model.COMP_TYPE.TAB_FORM_COLUMN && pSecondaryType === "ROW_SELECTOR" ) {
            lPrevComponent = undefined;
        } else if ( pComponentTypeId === model.COMP_TYPE.DA_EVENT ) {
            // If it's a dynamic action event, we always want to add it to the end of all dynamic actions to keep the
            // existing sequence of dynamic action fired turing page load
            lPrevComponent = "last";
        } else if ( lNodeComponent ) {
            lPrevComponent = lNodeComponent;
        } else {
            // Append the new component as last component
            lPrevComponent = "last";
        }

        lMessage = model.transaction.message( {
            action:     model.MESSAGE_ACTION.CREATE,
            component:  pComponentTypeId
        });

        lTransaction = model.transaction.start( "", lMessage );

        lNewComponent = new model.Component({
            previousComponent: lPrevComponent,
            typeId:            pComponentTypeId,
            parentId:          lParentId,
            values:            lValues
        });

        // For dynamic action events we automatically create an action to get started
        if ( pComponentTypeId === model.COMP_TYPE.DA_EVENT ) {

            if ( lNewComponent.getProperty( model.PROP.EVENT ).getValue() === "apexafterclosedialog" ) {

                new model.Component({
                    typeId:   model.COMP_TYPE.DA_ACTION,
                    parentId: lNewComponent.id,
                    values:   [
                        { id: model.PROP.DA_ACTION_TYPE,  value: "NATIVE_REFRESH" },
                        { id: model.PROP.AFFECTED_TYPE,   value: "REGION" },
                        { id: model.PROP.AFFECTED_REGION, value: ( lParentComponent ? lParentComponent.getProperty( model.PROP.REGION ).getValue() : "" ) }
                    ]
                });

            } else {

                new model.Component({
                    typeId:   model.COMP_TYPE.DA_ACTION,
                    parentId: lNewComponent.id,
                    values:   [
                        { id: model.PROP.DA_ACTION_TYPE, value: "NATIVE_SHOW" },
                        { id: model.PROP.AFFECTED_TYPE,  value: "ITEM" }
                    ]
                });

            }
        }

        apex.commandHistory.execute( lTransaction );

        // Select the newly created component
        setSelectedComponents( [ lNewComponent ], pTree$, lStartNodeId, true );

    }


    //
    // Helper functions to make treeView handling easier
    //
    function getNodes( pTreeNodes$, pTree$ ) {

        return pTree$.treeView( "getNodes", pTreeNodes$ );

    } // getNodes


    function getSelectedComponents( pTree$ ) {

        var lNodes  = pTree$.treeView( "getSelectedNodes" ),
            lResult = [];

        // Get components of selected nodes
        for ( var i = 0; i < lNodes.length; i++ ) {
            if ( lNodes[ i ].data && lNodes[ i ].data.hasOwnProperty( "componentId" )) {
                lResult.push( model.getComponents( lNodes[ i ].data.typeId, { id: lNodes[ i ].data.componentId })[ 0 ]);
            }
        }

        return lResult;

    } // getSelectedComponents


    function getComponentDomNodes$( pComponent, pTree$, pParentId ) {

        var lParent$;

        // todo that's a slow! Can we search by ID?
        if ( pParentId ) {
            lParent$ = pTree$.treeView( "find", {
                depth: -1,
                match: function( pNode ) {
                    return ( pNode.id === pParentId );
                }
            });
        }

        return pTree$.treeView( "find", {
            parentNodeContent$: lParent$,
            depth:   -1,
            findAll: true,
            match: function( pNode ) {
                return ( pNode.data.typeId === pComponent.typeId && pNode.data.componentId === pComponent.id );
            }
        });

    } // getComponentDomNodes$


    function getComponentNode( pComponent, pTree$, pParentId ) {

        return pTree$.treeView( "getNodes", getComponentDomNodes$( pComponent, pTree$, pParentId ))[ 0 ];

    } // getComponentNode


    function getComponent( pNode$, pTree$ ) {

        var lNode,
            lComponents = [];

        if ( pNode$ instanceof jQuery ) {
            lNode = pTree$.treeView( "getNodes", pNode$ )[ 0 ];
        } else {
            lNode = pNode$;
        }

        if ( lNode.data && lNode.data.typeId && lNode.data.componentId ) {
            lComponents = model.getComponents( lNode.data.typeId, { id: lNode.data.componentId });
        }

        if ( lComponents.length === 1 ) {
            return lComponents[ 0 ];
        } else {
            return undefined;
        }

    } // getComponent


    function getNearestComponent( pComponentTypeId, pNode ) {

        var lComponentTypes = ( $.isArray( pComponentTypeId )) ? pComponentTypeId : [ pComponentTypeId ],
            lComponent;

        if ( pNode ) {
            lComponent = getComponent( pNode );

            // Search as long as the current node is a component and it matches to the specified component type
            if ( lComponent === undefined || ( lComponent && $.inArray( lComponent.typeId, lComponentTypes ) === -1 )) {
                lComponent = getNearestComponent( lComponentTypes, pNode._parent );
            }
        }
        return lComponent;
    }


    function getNearestValue( pPropertyId, pNode ) {

        var lValue;

        if ( pNode ) {
            if ( pNode.data.hasOwnProperty( pPropertyId )) {
                lValue = pNode.data[ pPropertyId ];
            } else {
                // Search as long as we have found the specified property
                lValue = getNearestValue( pPropertyId, pNode._parent );
            }
        } else {
            lValue = "";
        }
        return lValue;
    }


    function updateComponentNode( pComponent, pTree$, pFunction ) {

        getComponentDomNodes$( pComponent, pTree$ ).each( function() {
            var lDomNode$ = $( this );
            pFunction.call( getNodes( lDomNode$, pTree$ )[ 0 ] );
            pTree$.treeView( "update", lDomNode$ );
        });

    } // updateComponentNode


    function addComponentClass( pComponent, pClass, pTree$ ) {

        updateComponentNode( pComponent, pTree$, function(){
            if ( !( this.data && this.data.isPlain ) ) {
                this.classes += " " + pClass;
            }
        });

    } // addComponentClass


    function removeComponentClass( pComponent, pClass, pTree$ ) {

        updateComponentNode( pComponent, pTree$, function(){
            this.classes =
                $.grep( this.classes.split( " " ), function( pValue ) {
                    return ( pValue !== pClass );
                }).join( " " );
        });

    } // removeComponentClass


    function getTreeRules() {

        function canDeleteClassicRptColumn( pNode ) {
            // Only the row selector or derived columns of a tabular form / classic report can be deleted
            return ( getComponent( pNode ).getProperty( model.PROP.DERIVED_COLUMN ).getValue() === "Y" );
        }

        function canDragClassicRptColumn( pNode ) {
            // Row Selector is not draggable, it has to be the first column (bug# 13018546)
            return ( getComponent( pNode ).getProperty( model.PROP.COLUMN_NAME ).getValue() !== ROW_SELECTOR_COLUMN_NAME );
        }

        function canAddChartSeries( pNode ) {
            // Only one chart series allowed for the specified chart types
            return ( $.inArray(
                getNearestComponent( model.COMP_TYPE.CHART, pNode ).getProperty( model.PROP.CHART_TYPE ).getValue(),
                [ "DOUGHNUT", "PIE", "DIAL", "CANDLESTICK", "PROJECT_GANTT", "RESOURCE_GANTT" ]) === -1
                );
        }

        function canDeleteChartSeries( pNode ) {
            // At least one chart series does have to exist
            return ( model.getComponents( model.COMP_TYPE.CHART_SERIES, { parentId: getComponent( pNode ).parentId }).length > 1 );
        }

        function canDuplicateChartSeries( pNode ) {
            // Only one chart series allowed for the specified chart types
            return ( $.inArray(
                         getComponent( pNode ).getParent().getProperty( model.PROP.CHART_TYPE ).getValue(),
                         [ "DOUGHNUT", "PIE", "DIAL", "CANDLESTICK", "PROJECT_GANTT", "RESOURCE_GANTT" ]) === -1
                   );
        }

        function canDeleteMapChartSeries( pNode ) {
            // At least one map chart series does have to exist
            return ( model.getComponents( model.COMP_TYPE.MAP_CHART_SERIES, { parentId: getComponent( pNode ).parentId }).length > 1 );
        }

        return {
            "default": {
                operations: {
                    canAdd:       false,
                    canDuplicate: false,
                    canDelete:    false,
                    canRename:    false,
                    canDrag:      false,
                    canSearch:    false,
                    canExtCreate: false,
                    canExtEdit:   false,
                    canExtCopy:   false
                }
            },
            "page": {
                icon: "icon-tree-page"
            },
            "validations":{
                operations: {
                    canAdd: true
                },
                icon: "icon-tree-folder",
                validChildren: [ "validation" ]
            },
            "validation": {
                icon: "icon-tree-validation",
                operations: {
                    canDuplicate: true,
                    canRename:    true,
                    canDelete:    true,
                    canDrag:      true,
                    canExtCopy:   true
                }
            },
            "inline_validations": {
                icon: "icon-tree-folder",
                validChildren: [ "inline_validation" ]
            },
            "inline_validation": {
                icon: "icon-tree-validation",
                operations: {
                    canDuplicate: true,
                    canRename:    true,
                    canDelete:    true,
                    canExtCopy:   true
                }
            },
            "pre_rendering": {
                icon: "icon-tree-folder"
            },
            "post_rendering": {
                icon: "icon-tree-folder"
            },
            "main_computations": {
                icon: "icon-tree-folder",
                validChildren: [ "computations" ]
            },
            "computations": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "computation" ]
            },
            "computation": {
                icon: "icon-tree-computation",
                operations: {
                    canDuplicate: true,
                    canDrag:      true,
                    canDelete:    true,
                    canExtCopy:   true,
                    canSearch:    true
                }
            },
            "inline_computations": {
                icon: "icon-tree-folder",
                validChildren: [ "inline_computation" ]
            },
            "inline_computation": {
                icon: "icon-tree-computation",
                operations: {
                    canDuplicate: true,
                    canDelete:    true,
                    canExtCopy:   true,
                    canSearch:    true
                }
            },
            "main_processes": {
                icon: "icon-tree-folder",
                validChildren: [ "processes" ]
            },
            "processes": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "process" ]
            },
            "process": {
                icon: "icon-tree-process",
                operations: {
                    canDuplicate: true,
                    canDrag:      true,
                    canRename:    true,
                    canDelete:    true,
                    canExtCopy:   true
                }
            },
            "after_submit": {
                icon: "icon-tree-folder"
            },
            "processing": {
                icon: "icon-tree-folder"
            },
            "after_processing": {
                icon: "icon-tree-folder"
            },
            "validating": {
                icon: "icon-tree-folder"
            },
            "after_header": {
                icon: "icon-tree-folder"
            },
            "before_header": {
                icon: "icon-tree-folder"
            },
            "before_regions": {
                icon: "icon-tree-folder"
            },
            "after_regions": {
                icon: "icon-tree-folder"
            },
            "before_footer": {
                icon: "icon-tree-folder"
            },
            "after_footer": {
                icon: "icon-tree-folder"
            },
            "main_branches": {
                icon: "icon-tree-folder",
                validChildren: [ "branches" ]
            },
            "branches": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "branch" ]
            },
            "branch":{
                icon: "icon-tree-branch",
                operations: {
                    canDuplicate: true,
                    canDrag:      true,
                    canRename:    true,
                    canDelete:    true,
                    canExtCopy:   true
                }
            },
            "main_regions": {
                icon: "icon-tree-folder",
                validChildren: [ "regions" ]
            },
            "regions": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "region" ]
            },
            "sub_regions": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "region" ]
            },
            "region": {
                icon: "icon-tree-region",
                operations: {
                    canAdd:       true, // needed for children like region, page_item and region_button
                    canDuplicate: true,
                    canDrag:      true,
                    canRename:    true,
                    canDelete:    true,
                    canExtCopy:   true
                },
                validChildren: [
                    "page_items", "region_buttons", "inline_da_events",
                    "region_columns", "ir_attributes", "classic_report_attributes", "classic_report_print", "tabform_attributes", "tabform_print",
                    "chart_series", "map_chart_series", "svg_chart_series",
                    // the following types are added for easier drag & drop when the region doesn't contain a page itemS, region buttonS, ... node
                    "region", "page_item", "region_button" ]
            },
            "main_page_items": {
                icon: "icon-tree-folder",
                validChildren: [ "page_items" ]
            },
            "page_items": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "page_item", "region_button", "form_button" ]
            },
            "page_item": {
                icon: "icon-tree-item",
                operations: {
                    canAdd:       true, // needed for computation
                    canDuplicate: true,
                    canDrag:      true,
                    canRename:    false, // todo isRenameable,
                    canDelete:    true,
                    canExtCopy:   true,
                    canSearch:    true
                },
                validChildren: [
                    "computations", "inline_validations", "inline_da_events",
                    // the following types are added for easier drag & drop when the page item doesn't contain a computationS, ...
                    "computation"
                ]
            },
            "form_button": { // the only reason to keep form_button is because we only want to show "Create Page Item" for a form button
                icon: "icon-tree-button",
                operations: {
                    canDuplicate: true,
                    canDrag:      true,
                    canRename:    false, // todo isRenameable,
                    canDelete:    true,
                    canExtCopy:   true
                }
            },
            "region_columns": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true // Adapter extraCheck will only allow move within same region
                },
                validChildren: [ "classic_report_column", "ir_report_column", "tabform_column", "region_column" ]
            },
            "classic_report_column": {
                icon: "icon-tree-report-column",
                operations: {
                    canRename:    false, // todo isRenameable,
                    canDuplicate: false,
                    canDelete:    canDeleteClassicRptColumn,
                    canDrag:      canDragClassicRptColumn,
                    drag: {
                        normal: "move"
                    }
                }
            },
            "classic_report_attributes": {
                icon: "icon-tree-attributes"
            },
            "tabform_attributes": {
                icon: "icon-tree-attributes"
            },
            "region_plugin_attributes": {
                icon: "icon-tree-attributes"
            },
            "ir_attributes": {
                icon: "icon-tree-folder",
                validChildren: [ "ir_column_groups", "ir_saved_reports" ]
            },
            "ir_column_groups": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true // Adapter extraCheck will only allow move within same region
                },
                validChildren: [ "ir_column_group" ]
            },
            "ir_column_group": {
                icon: "icon-tree-col-group",
                operations: {
                    canDuplicate: true,
                    canDrag:      true,
                    canRename:    true,
                    canDelete:    true
                }
            },
            "ir_saved_reports": {
                icon: "icon-tree-folder",
                validChildren: [ "ir_saved_report" ]
            },
            "ir_saved_report": {
                icon: "icon-tree-saved-report"
            },
            "ir_report_column": {
                icon: "icon-tree-report-column",
                operations: {
                    canRename: false, // todo isRenameable,
                    canDrag:   true
                }
            },
            "tabform_column": {
                icon: "icon-tree-item",
                operations: {
                    canRename: false, // todo isRenameable,
                    canDrag:   canDragClassicRptColumn,
                    canDelete: canDeleteClassicRptColumn
                }
            },
            "tabform_processes":{
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "tabform_process" ]
            },
            "tabform_process": {
                icon: "icon-tree-process",
                operations: {
                    canDuplicate: true,
                    canRename:    true,
                    canDelete:    true
                }
            },
            "region_column": {
                icon: "icon-tree-report-column",
                operations: {
                    canRename: false, // todo isRenameable,
                    canDrag:   true
                }
            },
            "chart_attributes": {
                icon: "icon-tree-folder",
                validChildren: [ "chart_series" ]
            },
            "chart_series": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: canAddChartSeries  // Adapter extraCheck will only allow move within same region
                },
                validChildren: [ "chart_serie" ]
            },
            "chart_serie": {
                icon: "icon-tree-chart-series",
                operations: {
                    canAdd:       canAddChartSeries,
                    canDuplicate: canDuplicateChartSeries,
                    canDelete:    canDeleteChartSeries,
                    canRename:    true,
                    canDrag:      true,
                    drag: {
                        normal: "move"
                    }
                }
            },
            "map_chart_attributes": {
                icon: "icon-tree-folder",
                validChildren: [ "map_chart_series" ]
            },
            "map_chart_series": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true // Adapter extraCheck will only allow move within same region
                },
                validChildren: [ "map_chart_serie" ]
            },
            "map_chart_serie": {
                icon: "icon-tree-map-series",
                operations: {
                    canDuplicate: true,
                    canDelete:    canDeleteMapChartSeries,
                    canRename:    true,
                    canDrag:      true,
                    drag: {
                        normal: "move"
                    }
                }
            },
            "main_buttons": {
                icon: "icon-tree-folder",
                validChildren: [ "region_buttons" ]
            },
            "region_buttons": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "region_button", "form_button" ]
            },
            "region_button": {
                icon: "icon-tree-button",
                operations: {
                    canDuplicate: true,
                    canDrag:      true,
                    canRename:    true,
                    canDelete:    true,
                    canExtCopy:   true
                }
            },
            "main_da_events": {
                icon: "icon-tree-folder",
                validChildren: [ "da_events" ]
            },
            "da_events": {
                icon: "icon-tree-folder",
                validChildren: [ "da_event" ]
            },
            "da_event": {
                icon: "icon-tree-da-event",
                operations: {
                    canDuplicate: true,
                    canRename:    true,
                    canDelete:    true,
                    canExtCopy:   true
                },
                validChildren: [ "da_actions_true", "da_actions_false" ]
            },
            "da_actions_true": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "da_action" ]
            },
            "da_actions_false": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "da_action" ]
            },
            "da_action": {
                icon: "icon-tree-da-action",
                operations: {
                    canDuplicate: true,
                    canDrag:      true,
                    canDelete:    true
                }
            },
            "inline_da_events": {
                icon: "icon-tree-folder",
                validChildren: [ "inline_da_event" ]
            },
            "inline_da_event": {
                icon: "icon-tree-da-event",
                operations: {
                    canDuplicate: true,
                    canRename:    true,
                    canDelete:    true,
                    canExtCopy:   true
                },
                validChildren: [ "da_actions_true", "da_actions_false" ]
            },
            "page_load_da_events": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: true
                },
                validChildren: [ "page_load_da_event" ]
            },
            "page_load_da_event": {
                icon: "icon-tree-da-event",
                operations: {
                    canDrag: true,
                    drag: {
                        normal: "move"
                    }
                }
            },
            //
            // Shared Components
            //
            "tab_sets": {
                icon: "icon-tree-folder"
            },
            "tab_set": {
                icon: "icon-tree-tabs",
                operations: {
                    canExtEdit:   true
                }
            },
            "lovs": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "lov": {
                icon: "icon-tree-lov",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "breadcrumbs": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "breadcrumb": {
                icon: "icon-tree-breadcrumb",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true
                }
            },
            "lists": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "list": {
                icon: "icon-tree-list",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "navigation_lists": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "navigation_list": {
                icon: "icon-tree-list",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "templates": {
                icon: "icon-tree-folder"
            },
            "page_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "page_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "field_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "field_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "button_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "button_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "region_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "region_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "list_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "list_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "nav_list_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "nav_list_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "breadcrumb_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "breadcrumb_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "calendar_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "calendar_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "report_templates": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "report_template": {
                icon: "icon-tree-templates",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "authorizations": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "authorization": {
                icon: "icon-tree-authorization",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true,
                    canExtCopy:   true
                }
            },
            "plugins": {
                icon: "icon-tree-folder"
            },
            "plugin": {
                icon: "icon-tree-plugin"
            },
            "build_options": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "build_option": {
                icon: "icon-tree-build-option",
                operations: {
                    canExtCreate: true,
                    canExtEdit:   true
                }
            },
            "data_load_tables": {
                icon: "icon-tree-folder"
            },
            "data_load_table": {
                icon: "icon-tree-data-load-table",
                operations: {
                    canExtEdit: true
                }
            },
            "web_services": {
                icon: "icon-tree-folder",
                operations: {
                    canExtCreate: true
                }
            },
            "web_service": {
                icon: "icon-tree-web-service",
                operations: {
                    canExtCreate: true
                }
            },
            "references": {
                icon: "icon-tree-folder"
            },
            "referenced_by": {
                // xxx would like the icon to be that of the referenced component
                operations: {
                    canRename: true
                }
            }
        };

    } // getTreeRules

    function getTreeNodeAdapter( pDataFunction, pExpandedState ) {

        function getInitialExpandedNodeIds( pData ) {

            var lNodeIds = [];

            function isExpanded( pData ) {
                // if user had previously expanded a node then it stays expanded
                if ( pExpandedState && pExpandedState[pData.id] === true ) {
                    return true;
                }
                // otherwise if the metadata determines that the node should be expanded it becomes expanded
                //    unless the user has previously collapsed it
                if ( ( pData.state && pData.state.opened ) && (!pExpandedState || pExpandedState[pData.id] !== false) ) {
                    return true;
                }
                return false;
            }

            function add( pNodes ) {
                for ( var i = 0; i < pNodes.length; i++ ) {
                    if ( isExpanded( pNodes[ i ] ) ) {
                        lNodeIds.push( pNodes[ i ].id );
                    }
                    if ( pNodes[ i ].children ) {
                        add( pNodes[ i ].children );
                    }
                }
            }

            if ( isExpanded( pData ) ) {
                lNodeIds.push( pData.id );
            }
            add( pData.children );

            return lNodeIds;
        }

        var lData        = pDataFunction(),
            lNodeAdapter = $.apex.treeView.makeDefaultNodeAdapter( lData, getTreeRules(), true, getInitialExpandedNodeIds( lData ));

        lNodeAdapter.sortCompare = null;

        lNodeAdapter.defaultGetIcon = lNodeAdapter.getIcon;
        lNodeAdapter.getIcon = function( n ) {
            if ( n.data ) {
                if ( n.data.typeId === model.COMP_TYPE.REGION ) {
                    return pd.getComponentIconClass( "region", getComponent( n ).getProperty( model.PROP.REGION_TYPE ).getValue() );
                } else if ( n.data.typeId === model.COMP_TYPE.PAGE_ITEM ) {
                    return pd.getComponentIconClass( "item", getComponent( n ).getProperty( model.PROP.ITEM_TYPE ).getValue() );
                } else if ( n.data.typeId === model.COMP_TYPE.BUTTON ) {
                    return pd.getComponentIconClass( "button", getComponent( n ).getProperty( model.PROP.BUTTON_IS_HOT ).getValue() === "Y" ? "hot" : "normal" );
                }
            }
            return this.defaultGetIcon( n );
        };

        lNodeAdapter.extraCheck = function( pResult, pRule, pNode, pOperation, pChildren ) {

            var lComponent,
                i;

            if ( pResult ) {

                if ( $.inArray( pRule, [ "canDelete", "canRename", "canDrag", "canDuplicate" ]) !== -1 ) {

                    lComponent = getComponent( pNode );
                    return ( lComponent && !lComponent.isReadOnly() && !model.isPageReadOnly());

                } else if ( pRule === "canAdd" && model.isPageReadOnly()) {
                    return false;

                    // Make sure children can only be moved within parent
                } else if (  pRule === "canAdd"
                          && pOperation === "move"
                          && $.inArray( pNode.type, [ "region_columns", "ir_column_groups", "chart_series", "map_chart_series" ]) !== -1
                          && pChildren
                          )
                {
                    for ( i = 0; i < pChildren.length; i++ ) {
                        if ( pChildren[ i ]._parent && pChildren[ i ]._parent !== pNode ) {
                            return false;
                        }
                    }
                }
            }
            return pResult;
        };

        // custom render function to include status icon
        lNodeAdapter.renderNodeContent = function( node, out, options, state ) {
            var icon, c, statusIcon;

            icon = this.getIcon( node );
            if ( icon !== null ) {
                out.markup( "<span" ).attr( "class", "a-Icon " + icon ).markup( "></span>" );
            }
            c = this.getClasses( node );
            if ( c ) {
                if ( c.indexOf( pd.CSS.IS_ERROR ) >= 0 ) {
                    statusIcon = "icon-error";
                } else if ( c.indexOf( pd.CSS.IS_WARNING ) >= 0 ) {
                    statusIcon = "icon-warning";
                }
                // TODO ACC consider including status indication in visually hidden label text
            }
            out.markup( "<span role='treeitem' class='a-TreeView-label' tabIndex='-1'" )
                .attr( "aria-level", state.level )
                .optionalAttr( "aria-selected", state.selected ? "true" : "false" )
                .optionalAttr( "aria-disabled", state.disabled ? "true" : null )
                .optionalAttr( "aria-expanded", state.hasChildren === false ? null : state.expanded ? "true" : "false" )
                .markup(">");

            if ( statusIcon ) {
                out.markup( "<span class='a-Icon " )
                    .attr( statusIcon )
                    .markup( "'></span>");
            }
            out.content( this.getLabel( node ) )
                .markup( "</span>" );
        };

        return function() {
            return lNodeAdapter;
        };
    } // getTreeNodeAdapter


    function initTree( pTree$, pDataFunction, pShowRoot ) {

        pTree$.treeView({
            getNodeAdapter:  getTreeNodeAdapter( pDataFunction ),
            showRoot:        pShowRoot,
            collapsibleRoot: false,
            expandRoot:      false,
            contextMenu:     getContextMenu( pTree$ ),
            contextMenuId:   pTree$[0].id + "Menu",
            multiple:        true,
            doubleClick:     "toggle",
            clickToRename:   false,
            keyboardRename:  false,
            keyboardAdd:     false, // todo can we add insert support?
            keyboardDelete:  true,
            //
            tooltip: {
                show:    apex.tooltipManager.defaultShowOption(),
                content: function( pCallback, pNode ) {
                    var lComponent = getComponent( pNode );
                    if ( lComponent ) {
                        return pd.tooltipContentForComponent( lComponent );
                    }
                }
            },
            // drag and drop
            dragAndDrop:       true,
            dragMultiple:      true,
            dragReorder:       true,
            delay:             10,
            distance:          5,
            // todo dragExpandDelay: -1, // to test no expand on hover during drag
            dragAppendTo:      document.body,
            dragCursor:        "move",
            dragOpacity:       0.6,
            dragCursorAt:      { left: 10, bottom: 10 },
            dragAnimate:       false,
            dragContainment:   "document",

            // events
            selectionChange: function() {

                var WIDGET = this.id,
                    lComponents;

                lComponents = getSelectedComponents( $( this ));

                // Notify other widgets on the page that a component has been selected
                debug.trace( "%s: trigger event selectionChanged", WIDGET, lComponents );
                $( document ).trigger( "selectionChanged", [ WIDGET, lComponents ]);

            },
            added: function(event, change) {
//xxx                console.log("TREEVIEW: added event.", change ); // todo
                // xxx rename in place?
            },
            moved: function( pEvent, pChange ) {
                nodesMoved( pChange, pTree$ );
            },
            copied: function(event, pChange) {
                nodesCopied( pChange, pTree$ );
            },
            deleted: function( pEvent, pChange ) {
                nodesDeleted( pChange, pTree$ );
            }
        });

        pTree$.on( "refresh", function() {
            var lExpandedState = pTree$.treeView( "getExpandedState" );

            debug.trace( "%s: refresh tree", pTree$[ 0 ].id );
            pTree$.treeView( "option", "getNodeAdapter", getTreeNodeAdapter( pDataFunction, lExpandedState ));

        });

        registerEvents( pTree$, pDataFunction );

    } // initTree


    function destroyTree( pTree$ ) {

        var WIDGET = pTree$[ 0 ].id;

        model.unobserver( WIDGET, {});
        $( document ).off( "selectionChanged." + WIDGET );

        pTree$.off( "refresh" );
        pTree$.treeView( "destroy" );

    }


    function registerEvents( pTree$ ) {

        var WIDGET            = pTree$[ 0 ].id,
            lComponentsFilter = null,
            lPropertiesFilter = [],
            lSelectionTypes;

        function addSharedCompTypes( pSharedCompTypes ) {

            var lRefByCompProps;

            for ( var i = 0; i < pSharedCompTypes.length; i++ ) {

                if ( pSharedCompTypes[ i ].hasOwnProperty( "typeId" )) {

                    lSelectionTypes[ pSharedCompTypes[ i ].typeId ] = true;

                    // Find all properties which are using the current component type as LOV
                    lRefByCompProps = getRefByCompProps( pSharedCompTypes[ i ].typeId );
                    for ( var j = 0; j < lRefByCompProps.length; j++ ) {
                        lComponentsFilter.push({ typeId: lRefByCompProps[ j ].typeId });
                        lPropertiesFilter.push( lRefByCompProps[ j ].propertyId );
                    }
                }
                if ( pSharedCompTypes[ i ].children ) {
                    addSharedCompTypes( pSharedCompTypes[ i ].children );
                }
            }
        } // addSharedCompTypes

        // We don't have to listen for all component types, that depends on the tree.
        if ( WIDGET === "PDrenderingTree" ) {
            lComponentsFilter = null;
            lSelectionTypes   = null;
        } else if ( WIDGET === "PDdynamicActionTree" ) {
            lComponentsFilter = [
                { typeId: model.COMP_TYPE.DA_EVENT },
                { typeId: model.COMP_TYPE.DA_ACTION }
            ];
        } else if ( WIDGET === "PDprocessingTree" ) {
            lComponentsFilter = [
                { typeId: model.COMP_TYPE.BRANCH },
                { typeId: model.COMP_TYPE.PAGE_COMPUTATION },
                { typeId: model.COMP_TYPE.PAGE_PROCESS },
                { typeId: model.COMP_TYPE.VALIDATION },
                { typeId: model.COMP_TYPE.PAGE_PROC_WS_P_I },
                { typeId: model.COMP_TYPE.PAGE_PROC_WS_P_O },
                { typeId: model.COMP_TYPE.PAGE_PROC_WS_P_A }
            ];
        } else if ( WIDGET === "PDsharedCompTree" ) {

            lComponentsFilter = [];
            lSelectionTypes   = {};
            // Flatten the shared component types
            addSharedCompTypes( SHARED_COMP_TYPES );

        }

        // Set all component types the selectionChanged event should listen for
        if ( lSelectionTypes === undefined ) {
            lSelectionTypes = {};
            for ( var i = 0; i < lComponentsFilter.length; i++ ) {
                lSelectionTypes[ lComponentsFilter[ i ].typeId ] = true;
            }
        }

        // Register observers to find out if a component has changed it's display title
        model.observer(
            WIDGET,
            {
                components: lComponentsFilter,
                events:     [ model.EVENT.DISPLAY_TITLE ]
            },
            function( pNotification ) {

                debug.trace( "%s: DISPLAY_TITLE component notification received", WIDGET, pNotification );

                updateComponentNode( pNotification.component, pTree$, function(){
                    this.label = pNotification.component.getDisplayTitle();
                });

            });
        // Register observers to find out if a component has been created or deleted
        model.observer(
            WIDGET,
            {
                components: lComponentsFilter,
                events:     [ model.EVENT.CREATE, model.EVENT.DELETE ]
            },
            function( pNotifications ) {

                debug.trace( "%s: CREATE/DELETE component notification received", WIDGET, pNotifications );
                // For now lets to a brute force refresh of the tree
                pTree$.trigger( "refresh" );
            },
            true );

        if ( WIDGET === "PDsharedCompTree" ) {

            // Register observers to find out if display relevant properties have changed
            model.observer(
                WIDGET,
                {
                    components: lComponentsFilter,
                    events:     [ model.EVENT.CHANGE, model.EVENT.ADD_PROP, model.EVENT.REMOVE_PROP ],
                    properties: lPropertiesFilter
                },
                function( pNotifications ) {

                    debug.trace( "%s: CHANGE/ADD_PROP/REMOVE_PROP component notification received for shared component reference properties", WIDGET, pNotifications );

                    // For now lets to a brute force refresh of the tree
                    pTree$.trigger( "refresh" );
                },
                true );

        } else {

            // Register observers to find out if display relevant properties have changed
            model.observer(
                WIDGET,
                {
                    components: lComponentsFilter,
                    events:     [ model.EVENT.CHANGE, model.EVENT.ADD_PROP, model.EVENT.REMOVE_PROP ],
                    properties: [
                        model.PROP.PAGE_TEMPLATE,
                        model.PROP.DIALOG_TEMPLATE,
                        model.PROP.EXECUTION_SEQUENCE,
                        model.PROP.DISPLAY_SEQUENCE,
                        model.PROP.BRANCH_POINT,
                        model.PROP.PROCESS_POINT,
                        model.PROP.COMPUTATION_POINT,
                        model.PROP.BUTTON_POSITION,
                        model.PROP.REGION_POSITION,
                        model.PROP.PARENT_REGION,
                        model.PROP.REGION,
                        model.PROP.VALIDATION_REGION,
                        model.PROP.VAL_ITEM,
                        model.PROP.REGION_VAL_COLUMN,
                        model.PROP.REGION_TYPE, // needed to refresh the "Attributes" sub node
                        model.ASSOCIATED_ITEM,
                        model.ASSOCIATED_COLUMN,
                        model.PROP.COMPUTATION_ITEM_NAME,
                        model.PROP.EVENT,
                        model.PROP.DA_EVENT,
                        model.PROP.DA_ACTION_TYPE,
                        model.PROP.FIRE_WHEN_EVENT_RESULT_IS,
                        model.PROP.FIRE_ON_PAGE_LOAD,
                        model.PROP.WHEN_REGION,
                        model.PROP.WHEN_ITEMS,
                        model.PROP.WHEN_BUTTON
                    ]
                },
                function( pNotifications ) {

                    debug.trace( "%s: CHANGE/ADD_PROP/REMOVE_PROP component notification received for display relevant properties", WIDGET, pNotifications );

                    // For now lets to a brute force refresh of the tree
                    pTree$.trigger( "refresh" );
                },
                true );
            // Register observers to find out if a component has errors or warnings
            model.observer(
                WIDGET,
                {
                    components: lComponentsFilter,
                    events:     [ model.EVENT.ERRORS, model.EVENT.NO_ERRORS ]
                },
                function( pNotification ) {
                    if ( pNotification.component.hasErrors()) {
                        addComponentClass( pNotification.component, pd.CSS.IS_ERROR, pTree$ );
                    } else {
                        removeComponentClass( pNotification.component, pd.CSS.IS_ERROR, pTree$ );
                    }
                });
            model.observer(
                WIDGET,
                {
                    components: lComponentsFilter,
                    events:     [ model.EVENT.WARNINGS, model.EVENT.NO_WARNINGS ]
                },
                function( pNotification ) {
                    if ( pNotification.component.hasWarnings()) {
                        addComponentClass( pNotification.component, pd.CSS.IS_WARNING, pTree$ );
                    } else {
                        removeComponentClass( pNotification.component, pd.CSS.IS_WARNING, pTree$ );
                    }
                });
            pd.observerIsConditional( WIDGET, lComponentsFilter,
                function( pNotification ) {
                    if ( pd.isConditional( pNotification.component )) {
                        addComponentClass( pNotification.component, pd.CSS.IS_CONDITIONAL, pTree$ );
                    } else {
                        removeComponentClass( pNotification.component, pd.CSS.IS_CONDITIONAL, pTree$ );
                    }
                });

        }

        // Register event handlers if other widgets on the page select components
        $( document ).on( "selectionChanged." + WIDGET, function( pEvent, pWidget, pComponents ) {

            if ( pWidget !== WIDGET ) {
                debug.trace( "%s: selectionChanged event received from %s", WIDGET, pWidget, pComponents );

                if ( pComponents.length === 0 || lSelectionTypes === null || lSelectionTypes.hasOwnProperty( pComponents[ 0 ].typeId ) ) {
                    setSelectedComponents( pComponents, pTree$, null, false );
                }
            }
        });

    } // registerEvents


    function getContextMenu( pTree$ ) {

        var lItems = [],
            lId    = 0;

        function getCreateTitle( pTypeId ) {
            return formatNoEscape( "CREATE", model.getComponentType( pTypeId ).title.singular )
        }

        function execute( pFunction ){
            return pFunction.call( pTree$.treeView( "getSelectedNodes" ));
        }

        // Returns true if the type of the node is contained within pValidTypes and the current page can be modified.
        function isCreatable( pNodes, pValidTypes ) {

            // Note: We don't support "Create" operations if more than one nodes are selected
            return (  pNodes.length === 1
                   && $.inArray( pNodes[ 0 ].type, pValidTypes ) !== -1
                   && !model.isPageReadOnly()
                   );
        }

        function isNotGlobal( pNodes, pValidTypes ) {
            if ( model.isGlobalPage()) {
                return false;
            } else {
                return isCreatable( pNodes, pValidTypes );
            }
        }

        function isRegionType( pNode, pRegionTypes ) {
            var lRegion = getNearestComponent( model.COMP_TYPE.REGION, pNode );
            return ( $.inArray( lRegion.getProperty( model.PROP.REGION_TYPE ).getValue(), pRegionTypes ) !== -1 );
        }

        function goToUrl( pUrl, pPkValue ) {

            apex.navigation.redirect(
                pUrl.replace( /\\u002525/g,        '%' )
                    .replace( /%25/g,              '%' )
                    .replace( /%session%/g,        $v( "pInstance" ))
                    .replace( /%pk_value%/g,       pPkValue )
                    .replace( /%application_id%/g, model.getCurrentAppId() )
                    .replace( /%page_id%/g,        model.getCurrentPageId() )
            );
        }

        function editExternal( pNode, pTree$ ) {
            var lComponent = getComponent( pNode, pTree$ );

            goToUrl( model.getComponentType( lComponent.typeId ).editUrl, lComponent.id );
        }

        function copyExternal( pNode, pTree$ ) {
            var lComponent = getComponent( pNode, pTree$ );

            goToUrl( model.getComponentType( lComponent.typeId ).copyUrl, lComponent.id );
        }

        function createExternal( pNode, pTree$ ) {
            var lTypeId;

            if ( getComponent( pNode, pTree$ )) {
                lTypeId = getComponent( pNode, pTree$ ).typeId;
            } else {
                lTypeId = pNode.data.typeId;
            }

            goToUrl( model.getComponentType( lTypeId ).createUrl );
        }

        function getTargetPage( pNode, pTree$ ) {

            var lComponent  = getComponent( pNode, pTree$ ),
                lBranchType = lComponent.getProperty( model.PROP.BRANCH_TYPE ).getValue(),
                lTargetUrl,
                lAppId,
                lPageId = null;

            if ( lBranchType === "REDIRECT_URL" ) {
                lTargetUrl = lComponent.getProperty( model.PROP.TARGET ).getValue();
                if ( /f\?p=([^:]*):([^:]*)/i.test( lTargetUrl )) {
                    lAppId  = RegExp.$1;
                    if ( lAppId === "&FLOW_ID." || lAppId === "&APP_ID." || lAppId === model.getCurrentAppId() ) {
                        lPageId = RegExp.$2;
                    }
                }
            } else if ( $.inArray( lBranchType, [ "BRANCH_TO_STEP", "BRANCH_TO_PAGE_ACCEPT" ]) !== -1 ) {
                lPageId = lComponent.getProperty( model.PROP.BRANCH_PAGE_NUMBER ).getValue();
            }
            return lPageId;
        }

        function addItem( pItem ) {

            var lItem = {
                    label:       pItem.label,
                    accelerator: pItem.accelerator,
                    type:        pItem.type
                },
                lAction,
                lVisible;

            lId++;
            lItem.id = pTree$[ 0 ].id + "_ctx_" + lId;

            if ( !lItem.type ) {
                lItem.type = "action";
                lAction    = pItem.action;
            }

            if ( pItem.typeId ) {
                if ( !pItem.label ) {
                    lItem.label = getCreateTitle( pItem.typeId );
                }

                if ( !lAction ) {
                    lAction = function(){
                        createComponent( this[ 0 ], pTree$, pItem.typeId );
                    };
                }
            }

            lItem.action = function() {
                return execute( lAction );
            };

            if ( pItem.visible ) {

                if ( $.isFunction( pItem.visible )) {
                    lVisible = pItem.visible;
                } else if ( $.isArray( pItem.visible )) {
                    lVisible = function(){
                        return isCreatable( this, pItem.visible );
                    };
                } else if ( pItem.visible.global === false ) {
                    lVisible = function(){
                        return isNotGlobal( this, pItem.visible.types );
                    };
                } else {
                    lVisible = function(){
                        return isCreatable( this, pItem.visible.types );
                    };
                }

                lItem.hide = function() {
                    return !execute( lVisible );
                };
            }

            if ( pItem.disabled ) {
                lItem.disabled = function() {
                    return execute( pItem.disabled );
                };
            }

            lItems.push( lItem );
        }

        //
        // Create Menu entries
        //
        addItem({
            typeId:  model.COMP_TYPE.REGION,
            visible: [ "main_regions", "regions", "region", "before_footer" ]
        });

        addItem({
            label:  formatNoEscape( "CREATE", msg( "SUB_REGION" )),
            action: function() {
                createComponent( this[ 0 ], pTree$, model.COMP_TYPE.REGION, "SUB_REGION" );
            },
            visible: function() {
                var lComponent = getComponent( this[ 0 ], pTree$ );
                if ( !lComponent || ( lComponent && !lComponent.isOnGlobalPage())) {
                    return isCreatable( this, [ "region", "sub_regions" ]);
                } else {
                    return false;
                }
            }
        });

        addItem({
            typeId:  model.COMP_TYPE.PAGE_ITEM,
            visible: [ "main_page_items", "page_items", "page_item", "form_button", "region" ]
        });

        addItem({
            typeId:  model.COMP_TYPE.BUTTON,
            visible: [ "main_buttons", "region_buttons", "region_button", "region", "page_items", "page_item", "form_button" ]
        });

        addItem({
            typeId:  model.COMP_TYPE.BRANCH,
            visible: {
                global: false,
                types: [ "main_branches", "branches", "branch", "before_header", "after_submit", "validating", "processing", "after_processing" ]
            }
        });

        addItem({
            typeId:  model.COMP_TYPE.PAGE_COMPUTATION,
            visible: {
                global: false,
                types: [
                    "main_computations", "computations", "computation", "inline_computations", "inline_computation",
                    "on_new_instance", "before_header", "after_header", "before_regions", "after_regions", "before_footer",
                    "after_footer", "after_submit", "page_item" ]
            }
        });

        addItem({
            typeId:  model.COMP_TYPE.PAGE_PROCESS,
            visible: {
                global: false,
                types: [
                    "main_processes", "processes", "process", "on_new_instance", "before_header", "after_header",
                    "before_regions", "after_regions", "before_footer", "after_footer", "after_submit", "processing" ]
            }
        });

        addItem({
            typeId:  model.COMP_TYPE.VALIDATION,
            visible: function(){
                if ( isNotGlobal( this, [ "validation", "validations", "validating", "inline_validations", "inline_validation", "page_item" ])) {
                    return true;
                } else {
                    return (  isNotGlobal( this, [ "region", "tabform_column" ] )
                           && isRegionType( this[ 0 ], [ "NATIVE_TABFORM" ] ));
                }
            }
        });

        addItem({
            typeId:  model.COMP_TYPE.DA_EVENT,
            visible: [
                "main_da_events", "da_events", "da_event", "inline_da_events", "inline_da_event",
                "region", "page_item", "region_button", "form_button" ]
        });

        addItem({
            typeId:  model.COMP_TYPE.DA_ACTION,
            visible: [ "da_action" ]
        });

        addItem({
            label:  formatNoEscape( "CREATE", msg( "TRUE_ACTION" )),
            typeId: model.COMP_TYPE.DA_ACTION,
            action: function() {
                createComponent( this[ 0 ], pTree$, model.COMP_TYPE.DA_ACTION, "TRUE" );
            },
            visible: [ "da_actions_true", "da_event", "inline_da_event" ]
        });

        addItem({
            label:  formatNoEscape( "CREATE", msg( "FALSE_ACTION" )),
            typeId: model.COMP_TYPE.DA_ACTION,
            action: function() {
                createComponent( this[ 0 ], pTree$, model.COMP_TYPE.DA_ACTION, "FALSE" );
            },
            visible: [ "da_actions_false", "da_event", "inline_da_event" ]
        });

        addItem({
            label:  formatNoEscape( "CREATE", msg( "OPPOSITE_DYNAMIC_ACTION" )),
            typeId: model.COMP_TYPE.DA_ACTION,
            action: function() {
                createOppositeDynamicAction( this, pTree$ );
            },
            visible: function(){
                for ( var i = 0; i < this.length; i++ ) {
                    if ( this[ i ].type !== "da_action" || !( pTree$.treeView( "getNodeAdapter" ).check( "canDuplicate", this[ i ]))) {
                        return false;
                    }
                }
                return true;
            }
        });

        addItem({
            label:  formatNoEscape( "CREATE", msg( "VIRTUAL_COLUMN" )),
            action: function() {
                if ( isRegionType( this[ 0 ], [ "NATIVE_TABFORM" ])) {
                    createComponent( this[ 0 ], pTree$, model.COMP_TYPE.TAB_FORM_COLUMN, "VIRTUAL" );
                } else {
                    createComponent( this[ 0 ], pTree$, model.COMP_TYPE.CLASSIC_RPT_COLUMN, "VIRTUAL" );
                }
            },
            visible: function() {
                return (  isCreatable( this, [ "region_columns", "classic_report_column", "tabform_column" ] )
                       && isRegionType( this[ 0 ], [ "NATIVE_SQL_REPORT", "NATIVE_FNC_REPORT", "NATIVE_TABFORM" ] ));
            }
        });

        addItem({
            label:  formatNoEscape( "CREATE", msg( "ROW_SELECTOR" )),
            action: function() {
                createComponent( this[ 0 ], pTree$, model.COMP_TYPE.TAB_FORM_COLUMN, "ROW_SELECTOR" );
            },
            visible: function() {
                var lRegion;

                if ( isCreatable( this, [ "region_columns", "tabform_column" ])) {
                    lRegion = getNearestComponent( model.COMP_TYPE.REGION, this[ 0 ], pTree$ );
                    if ( lRegion.getProperty( model.PROP.REGION_TYPE ).getValue() === "NATIVE_TABFORM" ) {
                        // Check if the region selector already exists for that tabular form
                        return ( lRegion.getChilds( model.COMP_TYPE.TAB_FORM_COLUMN, { properties: [{ id: model.PROP.COLUMN_NAME, value: ROW_SELECTOR_COLUMN_NAME }]}).length === 0 );
                    }
                }
                return false;
            }
        });

        addItem({
            typeId:  model.COMP_TYPE.CHART_SERIES,
            visible: function(){
                if ( isCreatable( this, [ "chart_series", "chart_serie" ])) {
                    return pTree$.treeView( "getNodeAdapter" ).check( "canAdd", this[ 0 ]);
                }
                return false;
            }
        });

        addItem({
            typeId:  model.COMP_TYPE.MAP_CHART_SERIES,
            visible: [ "map_chart", "map_chart_series", "map_chart_serie" ]
        });

        addItem({
            typeId:  model.COMP_TYPE.IR_COLUMN_GROUP,
            visible: [ "ir_attributes", "ir_column_groups", "ir_column_group" ]
        });

        addItem({
            label:   msg( "DUPLICATE" ),
            action: function() {
                duplicateNodes( this, pTree$ );
            },
            visible: function() {
                for ( var i = 0; i < this.length; i++ ) {
                    if ( !pTree$.treeView( "getNodeAdapter" ).check( "canDuplicate", this[ i ])) {
                        return false;
                    }
                }
                return true;
            }
        });

        addItem({
            type: "separator"
        });

        //
        // Delete menu entry
        //
        addItem({
            label:       msg( "DELETE" ),
            accelerator: "Del",
            action: function() {
                deleteNodes( this, pTree$ );
                return true; // focus is set after delete so no need for menu to do it
            },
            visible: function() {
                for ( var i = 0; i < this.length; i++ ) {
                    if ( !pTree$.treeView( "getNodeAdapter" ).allowDelete( this[ i ])) {
                        return false;
                    }
                }
                return true;
            }
        });

        addItem({
            type: "separator"
        });

        //
        // Misc menu entries
        //
        addItem({
            label:  msg( "COPY_TO_PAGE" ),
            action: function() {
                copyExternal( this[ 0 ] );
            },
            visible: function() {
                return (  this.length === 1
                       && pTree$.treeView( "getNodeAdapter" ).check( "canExtCopy", this[ 0 ])
                       && model.getComponentType( getComponent( this[ 0 ]).typeId ).isPageComponent
                       && !getComponent( this[ 0 ] ).isOnGlobalPage()
                       );
            }
        });

        addItem({
            label:  msg( "EDIT_SHARED_COMPONENT" ),
            action: function() {
                editExternal( this[ 0 ] );
            },
            visible: function() {
                return (  this.length === 1
                       && pTree$.treeView( "getNodeAdapter" ).check( "canExtEdit", this[ 0 ])
                       && !model.getComponentType( getComponent( this[ 0 ], pTree$ ).typeId ).isPageComponent
                       );
            }
        });

        addItem({
            label:  msg( "COPY_SHARED_COMPONENT" ),
            action: function() {
                copyExternal( this[ 0 ] );
            },
            visible: function() {
                return (  this.length === 1
                       && pTree$.treeView( "getNodeAdapter" ).check( "canExtCopy", this[ 0 ])
                       && !model.getComponentType( getComponent( this[ 0 ], pTree$ ).typeId ).isPageComponent
                       );
            }
        });

        addItem({
            label:  msg( "CREATE_SHARED_COMPONENT" ),
            action: function() {
                createExternal( this[ 0 ] );
            },
            visible: function() {
                return (  this.length === 1
                       && pTree$.treeView( "getNodeAdapter" ).check( "canExtCreate", this[ 0 ])
                       );
            }
        });

        addItem({
            label:  msg( "PAGE_SEARCH" ),
            action: function() {
                $( document ).trigger( "pageSearch", [ getComponent( this[ 0 ], pTree$ ).getDisplayTitle() ]);
            },
            visible: function() {
                return ( this.length === 1 && pTree$.treeView( "getNodeAdapter" ).check( "canSearch", this[ 0 ]));
            }
        });

        addItem({
            label:  msg( "GOTO_TARGET_PAGE" ),
            action: function() {
                pd.goToPage( getTargetPage( this[ 0 ], pTree$ ) );
            },
            visible: function(){
                return ( this.length === 1 && this[ 0 ].type === "branch" );
            },
            disabled: function() {
                return ( getTargetPage( this[ 0 ], pTree$ ) === null );
            }
        });

        addItem({
            type: "separator"
        });

        //
        // Expand/Collapse menu entries
        //
        addItem({
            label:  msg( "EXPAND_ALL_BELOW" ),
            action: function() {
                pTree$.treeView( "expandAll", pTree$.treeView( "getSelection" ));
            }
        });

        addItem({
            label:  msg( "COLLAPSE_ALL_BELOW" ),
            action: function() {
                pTree$.treeView( "collapseAll", pTree$.treeView( "getSelection" ));
            }
        });

        return { items: lItems };

    } // getContextMenu

    $( document ).ready( function(){

        var lTrees$ = $( "#trees" ),
            lRenderingTree$      = $( "#PDrenderingTree" ),
            lDynamicActionTree$  = $( "#PDdynamicActionTree" ),
            lProcessingTree$     = $( "#PDprocessingTree" ),
            lSharedCompTree$     = $( "#PDsharedCompTree" ),
            lEventViewBtns$ = $( "#r_event_view, #p_event_view" ),
            lCompViewBtns$   = $( "#r_comp_view, #p_comp_view" );

        lEventViewBtns$.click( function() {
            pd.saveBoolPref( "GROUP_BY_COMPONENT_TYPE", false );
            $( document ).trigger( "settingsStateChanged", [ "view" ]);
        });
        lCompViewBtns$.click( function() {
            pd.saveBoolPref( "GROUP_BY_COMPONENT_TYPE", true );
            $( document ).trigger( "settingsStateChanged", [ "view" ]);
        });

        function setViewClass() {
            if ( !pd.getBoolPref( "GROUP_BY_COMPONENT_TYPE", false ) ) {
                lTrees$.removeClass( CSS.IS_COMPONENT_VIEW );
                lTrees$.addClass( CSS.IS_EVENT_VIEW );
                lEventViewBtns$.addClass( IS_ACTIVE );
                lCompViewBtns$.removeClass( IS_ACTIVE );
            } else {
                lTrees$.removeClass( CSS.IS_EVENT_VIEW );
                lTrees$.addClass( CSS.IS_COMPONENT_VIEW );
                lEventViewBtns$.removeClass( IS_ACTIVE );
                lCompViewBtns$.addClass( IS_ACTIVE );
            }
        }

        setViewClass();

        lTrees$.on( "tabsactivate", function( event, ui ) {

            var lTree$ = ui.newPanel.find( ".a-TreeView" ),
                lComponents;

            if ( lTree$.length > 0 ) {
                // Notify other widgets on the page that the displayed tree has changed and other selected components
                // have to be displayed. But there is no need to do this if the current tree hasn't selected anything.
                // For example on the previous tab we had selected a page item and we switch to dynamic actions, we
                // still want to see the properties of the page item in the property editor and keep it selected in GLV.
                lComponents = getSelectedComponents( lTree$ );
                if ( lComponents.length > 0 ) {
                    debug.trace( "%s: trigger event selectionChanged", lTree$.id, lComponents );
                    $( document ).trigger( "selectionChanged", [ lTree$.id, lComponents ]);
                }
            }
        });

        $( document ).on( "settingsStateChanged", function( pEvent, pAttribute ){

            if ( pAttribute === "view" ) {

                setViewClass();
                lRenderingTree$.trigger( "refresh" );
                lProcessingTree$.trigger( "refresh" );

            } else if ( pAttribute === "componentTitle" ) {

                alert( "Not yet implemented!" ); // todo switch component title

            }
        });

        // Load the trees as soon as the model has loaded the data
        $( document ).on( "modelReady", function() {

            initTree( lRenderingTree$,     getRenderingData,     true );
            initTree( lDynamicActionTree$, getDynamicActionData, false );
            initTree( lProcessingTree$,    getProcessingData,    false );
            initTree( lSharedCompTree$,    getSharedData,        false );

            // Clear trees if the model gets cleared
            $( document ).one( "modelCleared", function() {

                destroyTree( lRenderingTree$ );
                destroyTree( lDynamicActionTree$ );
                destroyTree( lProcessingTree$ );
                destroyTree( lSharedCompTree$ );

            });

        });
    });

})( pe, window.pageDesigner, apex.util, apex.debug, apex.lang, apex.jQuery );
/*global pe,apex*/
/*!
 Page Designer Component Gallery
 Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * This module is part of the page designer and contains the controller logic for the component library.
 */

window.componentGallery = {};

(function( gallery, model, $, util, lang, undefined ) {
    "use strict";

    // keep in sync with componentTypeClassMap in gridlayout widget code
    var T_REGION = "region",
        T_ITEM = "item",
        T_BUTTON = "button";

    var PREF_SHOW_UNSUP = "GAL_SHOW_UNSUP",
        PREF_CUR_TAB = "GAL_CUR_TAB";

    var gUserInterfaceType = null, // used to determine if components are supported or not based on if they are for the same user interface
        gUserInterfaceName = "", // display name of user interface
        gShowUnsupported = false, // option to show unsupported components or not

        // map from a component type to the gComponents collection property name that holds components of that type
        gTypeToCollectionMap = { region: "regions", item: "items", button: "buttons" },

        // Metadata about all the components in the gallery
        // Each item in the arrays is an object with these properties
        //     type: ""  // match what the gridlayout uses. See componentTypeClassMap in gridlayout widget code.
        //     iconClass: "" // a css class that specifies the icon for the component
        //     title: "" // the title or label text to display
        //     tooltip: "" // tooltip content. can include markup
        //     isSupported: boolean
        //     values: [ { id: "", value: "" }, ... ] // component values to set when created
        gComponents = {
            regions: [ ],
            items: [ ],
            buttons: [ ]
        },

        gTypeToClassMap = {
            "region": "a-Gallery-region",
            "item": "a-Gallery-pageItem",
            "button": "a-Gallery-button"
        };

    function getComponentData( key ) {
        var data,
            parts = key.split(":" ),
            collection = gComponents[gTypeToCollectionMap[parts[0]]];

        if ( collection ) {
            data = collection[parts[1]];
        }
        if ( !data ) {
            throw "Invalid component data key";
        }
        return data;
    }

    //
    // external interface
    //
    gallery.getComponentData = getComponentData;

    function renderLibComponent( out, index, item ) {
        var className,
            isPageReadOnly = model.isPageReadOnly();

        className = gTypeToClassMap[item.type];
        if ( !isPageReadOnly ) {
            className += " is-draggable";
        }
        out.markup( "<li" )
            .attr( "class", className )
            .optionalAttr( "aria-grabbed", isPageReadOnly ? null : "false" )
            .attr( "data-component", item.type + ":" + index )
            .markup( "><span class='a-Icon " ).attr( item.iconClass ).markup( "'></span><span class='a-Gallery-componentName'>" ).content( item.title )
            .markup( "</span></li>" );
    }

    function tooltipContent( title, description, supported ) {
        var out = util.htmlBuilder();

        description = description || "";

        if ( !/^\s</.test(description) ) {
            description = "<p>" + description + "</p>";
        }
        out.markup( "<span class='tt-title'>" )
            .content( title )
            .markup( "</span>" )
            .markup( description );
        if ( !supported ) {
            out.markup( "<p>" )
                .content( lang.formatMessageNoEscape( "PD.GAL.NOT_SUPPORTED", gUserInterfaceName ) )
                .markup( "</p>" );
        }
        return out.toString();
    }

    function initRegions() {
        var key, plugin, region, supported, template,
            plugins = model.getComponentType( model.COMP_TYPE.REGION ).pluginType.plugins;

        for ( key in plugins ) {
            if ( plugins.hasOwnProperty( key )) {
                plugin = plugins[key];

                // legacy regions and the "Data Upload Column Mapping" region don't belong in the gallery
                if ( plugin.isLegacy || plugin.name === "NATIVE_DATA_UPLOAD_COLUMN_MAPPING" ) {
                    continue;
                }

                supported = $.inArray( gUserInterfaceType, plugin.uiTypes ) !== -1;

                // When a component is created without any template specified the model figures out and assigns the
                // default template. However grid layout prefers to know the template as the drop/add happens so that it
                // has the display points already configured. So figure out the default template here.
                template = model.getTheme().defaultTemplates[ key === "NATIVE_IR" ? "ir" : "region" ];

                region = {
                    type: T_REGION,
                    iconClass: window.pageDesigner.getComponentIconClass( T_REGION, key ),
                    title: supported ? plugin.title : lang.formatMessage( "PD.UNSUPPORTED", plugin.title ),
                    isSupported: supported,
                    tooltip: tooltipContent( plugin.title, plugin.helpText, supported ),
                    values: [
                        { id: model.PROP.REGION_TYPE, value: key },
                        { id: model.PROP.REGION_TEMPLATE, value: template }
                    ]
                };
                gComponents.regions.push( region );
            }
        }
    }

    function initItems() {
        var key, plugin, item, supported,
            plugins = model.getComponentType( model.COMP_TYPE.PAGE_ITEM ).pluginType.plugins;

        for ( key in plugins ) {
            if ( plugins.hasOwnProperty( key ) ) {
                plugin = plugins[key];

                // legacy items don't belong in the gallery
                if ( plugin.isLegacy ) {
                    continue;
                }

                supported = $.inArray( gUserInterfaceType, plugin.uiTypes ) !== -1;

                item = {
                    type: T_ITEM,
                    iconClass: window.pageDesigner.getComponentIconClass( T_ITEM, key ),
                    title: supported ? plugin.title : lang.formatMessage( "PD.UNSUPPORTED", plugin.title ),
                    isSupported: supported,
                    tooltip: tooltipContent( plugin.title, plugin.helpText, supported ),
                    values: [
                        { id: model.PROP.ITEM_TYPE, value: key }
                    ]
                };
                gComponents.items.push( item );
            }
        }
    }

    function initButtons() {
        var key, buttonTemplate, button,
            buttonTemplates = model.getButtonTemplates();

        function addButton( name, template, hot ) {

            button = {
                type: T_BUTTON,
                iconClass: window.pageDesigner.getComponentIconClass( T_BUTTON, hot === "Y" ? "hot" : "normal" ),
                title: name,
                isSupported: true,
                tooltip: tooltipContent( name, "", true ), // button templates don't have a description
                values: [
                    { id: model.PROP.BUTTON_TEMPLATE, value: template },
                    { id: model.PROP.BUTTON_IS_HOT, value: hot }
                ]
            };
            gComponents.buttons.push( button );
        }

        for ( key in buttonTemplates ) {
            if ( buttonTemplates.hasOwnProperty( key ) ) {
                buttonTemplate = buttonTemplates[ key ];

                addButton( buttonTemplate.name, key, "N" );
                if ( buttonTemplate.hasHotTemplate ) {
                    addButton( lang.formatMessage( "PD.GAL.HOT_BTN", buttonTemplate.name ), key, "Y" );
                }
            }
        }
    }

    function initComponentGallery( ) {
        var pageComp = model.getComponents( model.COMP_TYPE.PAGE )[0];

        gUserInterfaceType = pageComp._uiType; // todo don't use internal model data need public interface
        gUserInterfaceName = pageComp.getProperty( model.PROP.USER_INTERFACE ).getDisplayValue();

        // initialize component gallery items from the model
        initRegions();
        initItems();
        initButtons();

        // sort on title
        $.each( ["regions", "items", "buttons"], function( index, value ) {
            gComponents[ value ].sort(function(a, b) {
                return a.title.localeCompare( b.title );
            });
        } );

        updateComponentGallery();
    }

    function updateComponentGallery() {
        var glv$ = $( "#glv" ),
            isPageReadOnly = model.isPageReadOnly(),
            out = util.htmlBuilder();

        $.each( ["regions", "items", "buttons"], function ( index, value ) {
            var i, item,
                components = gComponents[ value ],
                list$ = $( "#cg-" + value + " ul" ).first();

            out.clear();
            for ( i = 0; i < components.length; i++ ) {
                item = components[i];
                if ( item.isSupported || gShowUnsupported ) {
                    renderLibComponent( out, i, item );
                }
            }
            list$.html( out.toString() )
                .iconList( "refresh" );

            // make component icons draggable but only if the page is not readonly
            if ( !isPageReadOnly ) {
                $( "#cg-" + value + " li" ).draggable( {
                    addClasses: false,
                    appendTo: "#glv-viewport", // append here for proper scrolling
                    cursor2: "default",
                    cursorAt: { left: 2, top: 2 },
                    delay: 10,
                    distance: 5,
                    opacity: 0.9,
                    revert: false,
                    helper: function () {
                        var comp$ = $( this ),
                            key = comp$.attr( "data-component" ),
                            comp = getComponentData( key );

                        return  glv$.gridlayout( "makeHelper",
                            comp.type, comp.iconClass, comp.title, key );
                    },
                    connectToGridlayout: "#glv",
                    containment: "document",
                    zIndex: 1000,
                    start: function ( event, ui ) {
                        // Note: the gallery and glv are always together so this no longer applies but leaving note
                        // and code in place in case that ever changes.
                        // todo there are issue with starting a drag while the GLV is not visible (not the current tab)
                        // the drag is happening but because the helper is appended to the glv viewport it can't be seen.
                        // returning false to stop the drag messes up the draggable plugins.
                        if ( $( "#editor_tabs" ).tabs( "option", "active" ) !== 0 ) {
                            // this helps but the helper offset is messed up because it was calculated while the region was not visible
                            $( "#editor_tabs" ).tabs( "option", "active", 0 );
                        }
                        apex.tooltipManager.disableTooltips();
                    },
                    stop: function ( event, ui ) {
                        apex.tooltipManager.enableTooltips();
                    }
                } );
            }
        } );

    }

    function clearGallery() {

        $.each( ["regions", "items", "buttons"], function ( index, value ) {
            var list$ = $( "#cg-" + value + " ul" ).first();
            gComponents[value] = [];

            list$.empty()
                .iconList( "refresh" );
        } );
    }

    $( document ).ready( function() {
        var curTab, ignoreTabChange = false;

        gShowUnsupported = window.pageDesigner.getPreference( PREF_SHOW_UNSUP ) === "Y";

        var contextMenu = {
            menubar: false,
            items: [
                { id: "addTo", type: "subMenu", disabled: true, labelKey: "PD.GAL.MI.ADD2", menu: { items: [ ]}
                },
                { type: "toggle", labelKey: "PD.GAL.MI.SHOW_UNSUP", get: function () {
                    return gShowUnsupported;
                }, set: function ( v ) {
                    gShowUnsupported = v;
                    updateComponentGallery();
                    window.pageDesigner.savePreference( PREF_SHOW_UNSUP, gShowUnsupported ? "Y" : "N" );
                } }
            ],
            beforeOpen: function( event, ui ) {
                var component$, component, action, key,
                    glv$ = $( "#glv" ),
                    addTo = ui.menuElement.menu( "find", "addTo" ),
                    selection$ = ui.selection;

                if ( selection$.length === 1 && !model.isPageReadOnly() ) {
                    component$ = selection$.eq(0);
                    key = component$.attr( "data-component" );
                    component = getComponentData( key );
                    action = function() {
                        window.pageDesigner.glvMenuAddAction.call( this, key );
                    };
                    addTo.menu.items = window.pageDesigner.glvMakeTargetMenu( glv$.gridlayout( "getDropTargets", component.type, "add" ), action );
                } else {
                    addTo.menu.items = [];
                }
                addTo.disabled = addTo.menu.items.length === 0;
            }
        };

        $( "#cg-regions ul, #cg-items ul, #cg-buttons ul" ).addClass("a-Gallery" ).each( function() {
            $( this ).iconList({
                multiple: false,
                contextMenu: contextMenu,
                contextMenuId: "galleryMenu-" + $( this ).parent().parent()[0].id
            });
        }).tooltip({
            items: "li",
            show: apex.tooltipManager.defaultShowOption(),
            position: { my: "left-20 top-20", at: "right bottom", collision: "flipfit" },
            content: function() {
                var component = getComponentData( $( this ).attr( "data-component" ) );
                return component.tooltip;
            }
        });

        // one menu button handles all three iconlist menus so switch the menu id when the tabs change
        $( "#gallery-tabs" ).on( "tabsactivate", function( event, ui ) {
            $( "#galleryMenuBtn" ).attr( "data-menu", "galleryMenu-" + ui.newPanel[0].id );
            if ( !ignoreTabChange ) {
                window.pageDesigner.savePreference( PREF_CUR_TAB, ui.newTab.parent().children().index(ui.newTab[0]) );
            }
            ignoreTabChange = false;
        } );
        $( "#galleryMenuBtn" ).attr( "data-menu", "galleryMenu-cg-regions" );

        curTab = parseInt( window.pageDesigner.getPreference( PREF_CUR_TAB ), 10 );
        if ( !isNaN( curTab ) && curTab > 0 ) { // this test is OK because 0 is the default tab
            // the tabs are still not created yet so delay this
            setTimeout( function() {
                ignoreTabChange = true;
                $( "#gallery-tabs" ).tabs( "option", "active", curTab );
            }, 10 );
        }

        // todo can this be made automatic - handled by the widget?
        $( "#gallery-tabs .u-ScrollingViewport.resize" ).resize( function() {
            $( this ).children(".a-IconList" ).resize(); // fire resize event without actually changing the size of the list.
        });
    });

    $( document ).on( "modelReady", function(){
        initComponentGallery();
    });

    $( document ).on( "modelCleared", function(){
        clearGallery();
    });

})( window.componentGallery, pe, apex.jQuery, apex.util, apex.lang );

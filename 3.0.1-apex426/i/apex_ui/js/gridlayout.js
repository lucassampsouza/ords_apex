/*global apex*/
/*!
 Grid Layout - a jQuery UI based widget for APEX page and region layout
 Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * Similar to a set of Sortables but extended to handle APEX grids
 * Borrows some methods and logic from jQuery UI Sortable.
 * There is also a draggable plugin so that dragables can drop on gridlayout.
 *
 * xxx todo
 * **readonly support
 * rework event handlers to use the new way
 *
 * start/stop table item (and hidden items?)
 * calc max columns, deal with too many columns - how???
 * handle row span
 * component resize to set span, row span and column xxx use context menu?
 * option to select which conditional components to display
 *
 * Depends on these strings being defined in the apex.lang message facility
 *     GL.BTN_POS_L, GL.BTN_POS_R, GL.REGION_CONTENT, GL.DRAG_COPY
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.mouse.js
 *    jquery.ui.widget.js
 *    jquery.ui.draggable.js
 *    apex/util.js
 *    apex/debug.js
 *    apex/lang.js
 */
(function ( $, util, debug, lang, undefined ) {
    "use strict";

    var C_GLV = "a-GridLayout",
        C_PAGE = "a-GridLayout-page",
        SEL_PAGE = ".a-GridLayout-page",
        C_PAGE_ITEM = "a-GridLayout-pageItem",
        C_REGION = "a-GridLayout-region",
        C_BUTTON = "a-GridLayout-button",
        C_REGION_CONT = "a-GridLayout-regionContainer",
        SEL_REGION_CONT = ".a-GridLayout-regionContainer",
        C_ITEM_CONT = "a-GridLayout-itemContainer",
        SEL_ITEM_CONT = ".a-GridLayout-itemContainer",
        C_BUTTON_CONT = "a-GridLayout-buttonContainer",
        SEL_BUTTON_CONT = ".a-GridLayout-buttonContainer",
        C_REGION_CONTENT = "a-GridLayout-regionContent",
        C_BTN_GROUP = "a-GridLayout-buttonGroup",
        SEL_BUTTON_GROUP = ".a-GridLayout-buttonGroup,.a-GridLayout-regionContent",
        C_BTN_ROW = "a-GridLayout-buttonRow",
        SEL_BTN_ROW = ".a-GridLayout-buttonRow",
        C_CONDITIONAL = "a-GridLayout--conditional",
        C_LEGACY = "a-GridLayout--legacy",
        SEL_LEGACY = ".a-GridLayout--legacy",
        C_ITEMS = "a-GridLayout-items",
        C_REGIONS = "a-GridLayout-regions",
        C_BUTTONS = "a-GridLayout-buttons",
        C_GRID = "a-GridLayout-grid",
        SEL_GRID = ".a-GridLayout-grid",
        C_STACK = "a-GridLayout-stack",
        C_FLOW = "a-GridLayout-flow",
        C_LABEL = "a-GridLayout-label",
        SEL_LABEL = ".a-GridLayout-label",
        C_DRAG_ACTION = "a-GridLayout-dragAction",
        SEL_DRAG_ACTION = ".a-GridLayout-dragAction",
        SEL_COMPONENT = ".a-GridLayout-pageItem, .a-GridLayout-region, .a-GridLayout-button",
        SEL_COMPONENT_OR_PAGE = ".a-GridLayout-page, .a-GridLayout-pageItem, .a-GridLayout-region, .a-GridLayout-button",
        SEL_CONTAINER = ".a-GridLayout-regionContainer, .a-GridLayout-itemContainer, .a-GridLayout-buttonContainer",
        SEL_LAYOUT = ".a-GridLayout-grid, .a-GridLayout-stack, .a-GridLayout-flow",
        C_TEMPLATE_GRID = "a-GridLayout-templateGrid",
        C_DISABLED = "is-disabled",
        C_FOCUSED = "is-focused",
        SEL_SELECTED = ".is-selected",
        C_SELECTED = "is-selected",
        C_ACTIVE = "is-active",
        C_HELPER = "a-GridLayout-helper",
        C_PLACEHOLDER = "a-GridLayout-placeholder",
        C_DEFAULT_ICON_TYPE= "a-GIcon",
        C_DRAGGABLE = "is-draggable",
        SEL_DRAGGABLE = ".is-draggable",
        ARIA_SELECTED = "aria-selected";

    var NEW_GRID = -1,
        NEW_ROW = -2,
        NEW_COLUMN = -3;

    // map from display point type to container class [0] and container item class [1]
    var containerTypeClassMap = {
        "regionContainer": [ C_REGION_CONT, C_REGIONS ],
        "itemContainer": [ C_ITEM_CONT, C_ITEMS ],
        "buttonContainer": [ C_BUTTON_CONT, C_BUTTONS ]
    };
    // map from component type to class for that type
    var componentTypeClassMap = {
        "region": C_REGION,
        "item": C_PAGE_ITEM,
        "button": C_BUTTON
    };

    var zoomSizes = [ 50, 75, 100, 125, 150, 175, 200 ];

    function isOverAxis( x, reference, size ) {
        return ( x > reference ) && ( x < ( reference + size ) );
    }

    function domIndex( el$ ) {
        return el$.parent().children( ":visible" ).index( el$ );
    }

    function insertAt( parent$, sel, el$, index ) {
        var children$, curIndex;

        if ( typeof sel !== "string" ) {
            index = el$;
            el$ = sel;
            sel = "*";
        }
        children$ = parent$.children( sel );
        curIndex = children$.index( el$ ); // is el$ a sibling before index?
        if ( curIndex >= 0 && curIndex < index ) {
            index += 1;
        }
        if ( index >= children$.length ) {
            parent$.append( el$ );
        } else {
            children$.eq( index ).before( el$ );
        }
    }

    function keyFromId( id ) {
        var i,
            key = id || "";
        i = key.indexOf( "_" );
        if ( i < 0 ) {
            return; // undefined
        }
        return key.substring( i + 1 );
    }

    // until array.indexOf is supported on all the browsers we target
    function indexOf( a, match ) {
        var i;
        for ( i = 0; i < a.length; i++ ) {
            if ( a[i] === match ) {
                return i;
            }
        }
        return -1;
    }

    function findColumnInRow( td$ ) {
        var col = 0,
            tr$ = td$.parent();

        tr$.children().each( function() {
            if ( this === td$[0] ) {
                return false; // break
            }
            col += this.colSpan || 1;
        } );
        return col;
    }

    function setProp( changes, obj, property, value ) {
        var old = obj[property];
        if ( old !== value ) {
            changes.propertyChanges.push( {component: obj, property: property, oldValue: old, newValue: value} );
            obj[property] = value;
        }
    }

    function calculateSpans( columns, start, availColumns, colCount ) {
        var i, col, span;

        if ( availColumns < 0 ) {
            availColumns = 0;
        }
        if ( colCount > 0 ) {
            span = Math.floor( availColumns / colCount );
            if ( span === 0 ) {
                span = 1;
            }
            for ( i = start; i < columns.length; i++ ) {
                col = columns[i];
                if ( col.span === -1 ) {
                    col.span = span;
                    availColumns -= span;
                    if ( availColumns > 0 && availColumns < span ) {
                        col.span += availColumns;
                    }
                }
            }
        }
    }

    function setColumnSpansForRow( curRow, maxColumns ) {
        var c, availCols, curColumn,
            totalAvailCols = maxColumns,
            start = 0,
            usedCols = 0,
            colCount = 0,
            maxFixedCol = 1;

        // for each column: keep track of the number of columns use and the number of columns
        // explicitly used because a span is given. Each time there is a fixed column or
        // at the end of the row, divide the available column space among the previous columns
        for ( c = 0; c < curRow.columns.length; c++ ) {
            curColumn = curRow.columns[c];
            if ( curColumn.col > 1 ) {
                availCols = curColumn.col - maxFixedCol;
                calculateSpans( curRow.columns, start, availCols - usedCols, colCount );
                totalAvailCols -= availCols;
                start = c;
                usedCols = 0;
                colCount = 0;
                maxFixedCol = curColumn.col;
            }

            if ( curColumn.span > 0 ) {
                usedCols += curColumn.span;
            } else {
                colCount += 1;
            }

        }
        calculateSpans( curRow.columns, start, totalAvailCols - usedCols, colCount );
    }

    function addStateClasses( classes, component, stateClassMap ) {
        var k;

        for ( k in stateClassMap ) {
            if ( stateClassMap.hasOwnProperty( k ) ) {
                if ( component[k] ) {
                    classes += " " + stateClassMap[ k ];
                }
            }
        }
        return classes;
    }

    function getStateIcon( component, stateIconMap ) {
        var k;

        for ( k in stateIconMap ) {
            if ( stateIconMap.hasOwnProperty( k ) ) {
                if ( component[k] ) {
                    return stateIconMap[ k ];
                }
            }
        }
        return null;
    }

    function displayPointHoldsType( displayPoint, type ) {
        return displayPoint.types.indexOf( type ) >= 0;
    }

    function classesForTypes( types, which ) {
        var i,
            containerClass = "";

        for ( i = 0; i < types.length; i++ ) {
            if ( i > 0 ) {
                containerClass += " ";
            }
            containerClass += containerTypeClassMap[types[i]][which];
        }
        return containerClass;
    }

    function getComponentSelectorForContainer( container$ ) {
        var sel = "";

        if ( container$.hasClass( C_REGIONS ) ) {
            sel += ",." + C_REGION;
        }
        if ( container$.hasClass( C_ITEMS ) ) {
            sel += ",." + C_PAGE_ITEM;
        }
        if ( container$.hasClass( C_BUTTONS ) ) {
            sel += ",." + C_BUTTON;
        }
        return sel.substr(1);
    }

    function getTargetClassesForContainer( container$ ) {
        var classes = "",
            dp$ = container$.closest( SEL_CONTAINER );

        if ( dp$.hasClass( C_REGION_CONT ) ) {
            classes += " " + C_REGIONS;
        }
        if ( dp$.hasClass( C_ITEM_CONT ) ) {
            classes += " "+ C_ITEMS;
        }
        if ( dp$.hasClass( C_BUTTON_CONT ) ) {
            classes += " " + C_BUTTONS;
        }
        return classes.substr(1);
    }

    $.widget( "apex.gridlayout", $.ui.mouse, {
        version: "5.0",
        widgetEventPrefix: "gridlayout",
        dragging: false, // true only while dragging
        animating: false, // true during animation after drop
        nodeMap: {}, // id -> page node object
        nextId: 1, // used to generate ids for DOM elements
        dragComponent: null, // jQuery element being dragged
        helper: null, // jQuery element shown while dragging - must come from makeHelper even if a draggable. Never the original - its disposable. also used by draggable plugin
        fromOutside: false, // for coordination with draggable. false or draggable instance
        isOver: false, // used by draggable plugin to tell when dragging over this gridlayout
        lastZoom: "", // the current/last zoom level class
        pageRoot: null, // the current page data for the widget - returned from options.getPageRoot()
        // Instance members that don't need to be initialized here:
        // containerCache: bounds of this gridlayout used to coordinate with draggable plugin
        // baseId: used in generating ids for elements along with nextId
        // lastFocused: the last element in the gridlayout that had/has focus
        // Instance members used during dragging that don't need to be initialized:
        // targetClass:  container class that dragComponent can be dropped on
        // itemClass: indicates if dragComponent is an item, region, or button
        // position: helper position during drag, value of event UI arg position property
        // positionAbs: helper absolute position during drag, value of event UI arg offset property
        // lastPositionAbs: (previous positionAbs) used to determine drag direction
        // margins: cached margins of original dragComponent
        // offset: dragComponent offset with adjustments and additions during dragging
        // storedStylesheet: used to restore cursor after drag
        // storedCursor: used to restore cursor after drag
        // scrollParent: scroll parent of helper
        // overflowOffset offset of scrollParent used in scroll calculations
        // prevCopy: used during drag to track if it is a copy or move operation

        options: {
            getPageRoot: null, // a no argument function that returns the root page structure it is called on create
                               // and when pageDataChanged method is called.
            getIconForComponent: function( component ) {
                var icon = "",
                    type = component.type;
                if ( type === "region" ) {
                    icon = "region";
                } else if ( type === "item" ) {
                    icon = "page-item";
                } else if ( type === "button" ) {
                    icon = "button";
                } else if ( type === "page" ) {
                    icon = "page";
                }
                return icon;
            },
            makeComponent: null, // function(type, [template]) to create a new component
            updateComponentCopy: null, // function(component, oldComponent) modify newly copied component for example to generate unique id
            deleteKeyAction: null, // function( event )
            contextMenuAction: null, // function( event )
            stateClassMap: {},  // mapping from boolean component property names to css class names to add to component when property is true
            stateIconMap: {},  // mapping from boolean component property names to icon css class names to add to component header when property is true
            displayFrom: null, // string id of region or region object in page to display from
            hideLegacyDisplayPoints: false,
            hideEmptyDisplayPoints: false,
            hideButtons: false,
            hideItems: false,
            zoom: 100, // one of the zoomSizes values
            iconType: C_DEFAULT_ICON_TYPE,

            // xxx what should disabled do?
            appendTo: "parent",
            containment: false,
            cursor: "auto",
            cursorAt: false,
            gridTolerance: 10,
            idPrefix: null,
            multiple: true,
            opacity: false,
            animate: true,
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            tolerance: "intersect", // the default, intersect, is the only value tested
            zIndex: 1000,

            // callbacks
            // These events/callbacks work as described for sortable: function(event, ui)
            // The first 4 only apply when a draggable is being dragged
            activate: null,
            deactivate: null,
            out: null,
            over: null,
            start: null,
            beforeStop: null,
            stop: null,
            // This event is fired when the selection changes and has no additional data
            selectionChange: null, // selectionChange(event)
            /*
             * These events receive a changes object in addition to the event: function(event, changes)
             * For a moved or copied event changes contains these properties as appropriate:
             *   newComponent$
             *   container$
             *   prevContainer$
             *   newParentContainer
             *   component
             *   newGrid
             *   newRow
             *   newColumn
             *   newIndex
             *   newGridInserted
             *   newRowInserted
             *   newColumnInserted
             *   newComponentIndex
             *   newAlignment
             *   prevParentContainer
             *   prevComponentIndex
             *   prevGrid
             *   prevRow
             *   prevColumn
             *   prevIndex
             *   prevAlignment
             *   prevGridRemoved
             *   prevRowRemoved
             *   prevColumnRemoved
             * Note: the column indexes are to the component in the grids -> rows -> columns array and due to
             * column spans and explicit starting columns may not correspond to the actual layout column.
             * For a copied event changes contains these additional properties:
             *   originalComponent
             * For a removed event changes contains these properties as appropriate:
             *   component$
             *   component
             *   prevParentContainer
             *   prevComponentIndex
             *   prevGrid
             *   prevRow
             *   prevColumn
             *   prevIndex
             *   prevGridRemoved
             *   prevRowRemoved
             *   prevColumnRemoved
             * For a added event, changes contains these properties as appropriate:
             *   newComponent$
             *   container$
             *   newParentContainer
             *   component
             *   newGrid
             *   newRow
             *   newColumn
             *   newIndex
             *   newGridInserted
             *   newRowInserted
             *   newColumnInserted
             *   newComponentIndex
             *   newAlignment
             * All four of these events contain these properties
             *   propertyChanges: [{ component:, property:, oldValue:, newValue: }]
             *   lastChange
             */
            added: null,
            removed: null,
            moved: null,
            copied: null
        },

        /*
         * Lifecycle methods
         */

        _create: function () {
            var o = this.options,
                self = this;

            if ( !o.makeComponent || !o.updateComponentCopy || !o.getPageRoot ) {
                throw "Missing required options.";
            }
            this.pageRoot = o.getPageRoot();
            this.containerCache = {};

            this.element.addClass( C_GLV );
            this.baseId = ( o.idPrefix || this.element[0].id || "glv" ) + "_";

            // layout, render, etc.
            this.refresh( false );
            this._setZoom();

            // Let's determine the parent's offset
            this.offset = this.element.offset();

            // Initialize mouse events for interaction
            this._mouseInit();
            this.element.on( "keydown.glv",function ( event ) {
                var keys = $.ui.keyCode,
                    kc = event.which;

                if ( event.altKey ) {
                    return;
                }

                if ( kc === keys.HOME ) {
                    self._select( $( SEL_PAGE + ":first" ), event, true, true );
                    event.preventDefault();
                } else if ( kc === keys.END ) {
                    self._select( self.element.find( SEL_COMPONENT_OR_PAGE ).last(), event, true, true );
                    event.preventDefault();
                } else if ( kc === keys.DOWN ) {
                    self._traverseDown( event );
                    event.preventDefault();
                } else if ( kc === keys.UP ) {
                    self._traverseUp( event );
                    event.preventDefault();
                    event.stopPropagation(); // Don't let a containing tab or accordion act on Ctrl+Up
                } else if ( kc === keys.LEFT ) {
                    self._traverseLeft( event );
                    event.preventDefault();
                } else if ( kc === keys.RIGHT ) {
                    self._traverseRight( event );
                    event.preventDefault();
                } else if ( kc === keys.SPACE ) {
                    if ( self.lastFocused ) {
                        self._select( $( self.lastFocused ), event, true, true );
                    }
                    event.preventDefault();
                } else if ( o.deleteKeyAction && kc === keys.DELETE ) {
                    if ( self.lastFocused ) {
                        o.deleteKeyAction( event );
                    }
                    event.preventDefault();
                } else if ( o.contextMenuAction && (event.shiftKey && kc === 121) ) { // shift F10
                    // if target component not selected then select it
                    if ( self.lastFocused && !$( self.lastFocused ).is( SEL_SELECTED ) ) {
                        self._select( $( self.lastFocused ), {}, false, true ); // empty event so that selection will be set
                    }
                    o.contextMenuAction( event );
                    event.preventDefault();
                }
            } ).on( "focusin",function ( event ) {
                var component$ = $( event.target ).closest( SEL_COMPONENT_OR_PAGE );
                if ( component$.length === 0 ) {
                    return;
                }
                component$.addClass( C_FOCUSED );
                self._setFocusable( component$[0] );
            } ).on( "focusout", function ( event ) {
                var component$ = $( event.target ).closest( SEL_COMPONENT_OR_PAGE );
                component$.removeClass( C_FOCUSED );
            } ).on( "contextmenu", function( event ) {
                var component$;

                if ( o.contextMenuAction ) {
                    // if target component not selected then select it
                    component$ = $( event.target).closest( SEL_COMPONENT_OR_PAGE ).not( SEL_SELECTED );
                    if ( component$.length ) {
                        self._select( component$, {}, false, false ); // force set selection
                    }
                    o.contextMenuAction( event );
                    event.preventDefault();
                }
            } );

        },

        _destroy: function () {
            this.element
                .removeClass( C_GLV )
                .empty();
            this._mouseDestroy();

            return this;
        },

        _setOption: function ( key, value ) {
            if ( key === "disabled" ) {
                // Don't call widget base _setOption for disable as it adds ui-state-disabled class
                this.options[ key ] = value;

                this.widget().toggleClass( C_DISABLED, !!value );
            } else {
                $.Widget.prototype._setOption.apply( this, arguments );
            }
            if ( key === "displayFrom" ) {
                this.refresh( false );
            } else if ( key === "hideLegacyDisplayPoints" || key === "hideButtons" || key === "hideItems" || key === "hideEmptyDisplayPoints" ) {
                this._showOrHideDisplayPoints();
            } else if ( key === "zoom" ) {
                this._setZoom();
            }
        },

        /*
         * Public methods
         */

        pageDataChanged: function () {
            var o = this.options;

            this.pageRoot = this.options.getPageRoot();
            if ( o.displayFrom ) {
                if ( !this._find( o.displayFrom, true ) ) {
                    o.displayFrom = null;
                }
            }
            this.refresh( false );
        },

        getPageData: function() {
            return this.pageRoot;
        },

        refresh: function ( focus ) {
            var i, region, page$, components, sel, gridSupport, p,
                o = this.options,
                out = util.htmlBuilder();

            debug.info( "Gridlayout refresh" );
            if ( !focus ) {
                sel = [];
                components = this.getSelectedComponents(); // try to preserve the selection
                for ( i = 0; i < components.length; i++ ) {
                    sel.push( components[i].id );
                }
            }
            this._layoutPage();
            this.nodeMap = {}; // clear out node map but don't reuse ids (don't reset nextId)
            if ( o.displayFrom ) {
                region = this._find( o.displayFrom, true ); // only look at region containers
                if ( !region ) {
                    throw "No such region in displayFrom option: " + o.displayFrom;
                }
                gridSupport = true;
                p = region._parent;
                while ( p ) {
                    // if it is a container that is not a grid
                    if ( p.components && !p.isGrid) {
                        gridSupport = false;
                        break;
                    }
                    p = p._parent;
                }
                this._renderRegion( out, region, gridSupport, true );
            } else {
                this._renderPage( out, this.pageRoot );
            }
            this.element.html( out.toString() );
            this._showOrHideDisplayPoints();
            page$ = this.element.children().eq( 0 );
            if ( focus ) {
                this._select( page$, focus );
                this._trigger( "selectionChange" );
            } else {
                this._setFocusable( page$[0] );
                // setting the selection when the whole control is not visible will have no effect and cause misleading notifications
                if ( sel.length > 0 && this.element.is(":visible")) {
                    // try to restore what was selected
                    this.setSelectedComponents( sel, false );
                    if ( sel.length !== this.getSelection().length ) {
                        this._trigger( "selectionChange" );
                    }
                }
            }
            return this;
        },

        /*
         * Logs the internal page structure as a string for debugging purposes
         */
        dump: function () {
            debug.log( "Page: \r\n" + JSON.stringify( this.pageRoot, function ( k, v ) {
                if ( k === "_parent" ) {
                    return "-> " + (this._parent.id || this._parent.title);
                } else if ( k === "_modelComponent" ) {
                    return "[id=" + v.id + "]";
                } else if ( k === "_parentGrid" ) {
                    return "-> " + indexOf( this._parentGrid._parent._grids, this._parentGrid );
                } else if ( k === "_parentRow" ) {
                    return "-> " + indexOf( this._parentRow._parentGrid.rows, this._parentRow );
                } else if ( k === "_parentColumn" ) {
                    return "-> " + indexOf( this._parentColumn._parentRow.columns, this._parentColumn );
                }
                return v;
            }, 2 ) );
        },

        findById: function( componentId ) {
            var component = this._find( componentId );
            if ( component ) {
                return this._getElement( component );
            }
            return $();
        },

        findComponentById: function( componentId ) {
            return this._find( componentId );
        },

        getContainer: function( component$ ) {
            return component$.closest( SEL_CONTAINER );
        },

        findContainer: function( regionId, name ) {
            var i, container, dp,
                page = this.pageRoot;

            if ( page.id === regionId ) {
                container = page;
            } else {
                container = this._find( regionId, true );
            }
            if ( container ) {
                for ( i = 0; i < container.displayPoints.length; i++ ) {
                    dp = container.displayPoints[i];
                    if ( dp.id === name ) {
                        return dp;
                    }
                }
            }
            return null;
        },

        getComponents: function( components$ ) {
            var self = this,
                components = [];
            components$.each( function () {
                components.push( self._getNode( this ) );
            } );
            return components;
        },

        getSelection: function() {
            return this.element.find( SEL_SELECTED );
        },

        getSelectedComponents: function() {
            return this.getComponents( this.getSelection() );
        },

        setSelection: function ( components$, focus ) {
            focus = !!focus;
            this._select( components$, null, focus, false, true );
        },

        setSelectedComponents: function ( components, focus ) {
            var i, component, el$,
                elements = [];

            focus = !!focus;
            for ( i = 0; i < components.length; i++ ) {
                component = this._find( components[i] );
                // only add if component is found and exists in the DOM
                if ( component ) {
                    el$ = this._getElement( component );
                    if ( el$.length > 0 ) {
                        elements.push( el$[0] );
                    }
                }
            }
            this._select( $(elements), null, focus, false, true );
        },

        /**
         * focus
         * Set focus to the component that last had focus.
         */
        focus: function() {
            if ( this.lastFocused ) {
                this.lastFocused.focus();
            }
        },

        makeHelper: function ( type, icon, title, componentTypeId ) {
            var component, typeClass,
                getIcon = this.options.getIconForComponent,
                out = new util.htmlBuilder();

            if ( !type ) {
                // get info from dragComponent
                component = this._getNode( this.dragComponent[0] );
                type = component.type;
                icon = getIcon( component );
                title = component.title;
            }
            typeClass = componentTypeClassMap[type] + " " + C_HELPER;
            out.markup( "<div" ).attr( "class", typeClass ).optionalAttr( "data-type-id", componentTypeId ).markup( ">" );
            this._renderHeader( out, icon, title, true ); // dragging
            out.markup( "<div" ).attr( "class", C_DRAG_ACTION ).markup( "></div></div>" );
            return $( out.toString() );
        },

        /*
         * Return all the places where component$ can be moved or copied to (i.e. dropped if dragging).
         * xxx support multiple grids
         * @param {string} action one of "move", "copy", "add". Default is "move".
         */
        getDropTargets: function( component$, action ) {
            var c, curRow, curCol, targetSel, itemSel, targets$, componentSkipped, isMove, componentType,
                result = [];

            function eachColumn( col ) {
                curCol = col;
                $( this ).children().eq( 0 ).children( itemSel ).each( function ( index ) {
                    if ( isMove && this === component$[0] ) {
                        componentSkipped = true;
                        return;
                    }
                    c.items.push( {
                        element: $( this ),
                        row: curRow,
                        col: curCol,
                        index: index,
                        name: $( this ).children( "h3" ).text()
                    } );
                } );
            }

            function eachRow( row ) {
                curRow = row;
                $( this ).children( "td" ).each( eachColumn );
            }

            action = action || "move";
            isMove = action === "move";
            if ( action === "add" && typeof component$ === "string" ) {
                componentType = component$;
            }

            if ( componentType === "item" || !componentType && component$.hasClass( C_PAGE_ITEM ) ) {
                targetSel = C_ITEMS;
            } else if ( componentType === "region" || !componentType && component$.hasClass( C_REGION ) ) {
                targetSel = C_REGIONS;
            } else if ( componentType === "button" || !componentType && component$.hasClass( C_BUTTON ) ) {
                targetSel = C_BUTTONS;
            } else {
                throw "Invalid component or component type";
            }
            targetSel = "." + targetSel;
            itemSel = "." + itemSel;
            targets$ = $( targetSel, this.element ).filter(":visible");

            targets$.each( function () {
                var ci, type, name, region, label,
                    el$ = $( this ),
                    alignment = null;

                itemSel = getComponentSelectorForContainer( el$ );
                if ( el$.hasClass( C_GRID ) ) {
                    type = "grid";
                } else if ( el$.hasClass( C_STACK ) ) {
                    type = "stack";
                } else if ( el$.hasClass( C_FLOW ) ) {
                    type = "flow";
                }
                if ( type === "stack" && el$.parent()[0].nodeName === "TD" ) {
                    return; // continue - don't include the stacks in grid cells, the items they contain will be included in the grid
                }
                if ( isMove && el$.parents().filter( component$[0] ).length !== 0 ) {
                    return; // don't include descendents of the component - don't let a component to be moved below itself
                }
                // if it is a region or items and has parent region include parent region in name
                region = el$.parent().closest(".a-GridLayout-region").find(".a-GridLayout-label").eq(0).text();
                label = "";
                if ( region !== "" ) {
                    label = region + " > ";
                }
                if ( type === "flow" && el$.parent()[0].nodeName === "TD" ) {
                    name = el$.closest( SEL_BTN_ROW ).prev().text();
                    if ( el$.parent().next().length > 0 ) {
                        name = lang.formatMessageNoEscape("GL.BTN_POS_L", name);
                        alignment = "left";
                    } else {
                        name = lang.formatMessageNoEscape("GL.BTN_POS_R", name);
                        alignment = "right";
                    }
                } else {
                    name = el$.prev().text();
                }
                label += name;
                c = {
                    element: el$.closest( SEL_CONTAINER ),
                    type: type,
                    region: region,
                    name: name,
                    label: label
                };
                componentSkipped = false;

                if ( type === "grid" ) {
                    // a grid doesn't directly contain any items - each cell has a container of items (components)
                    c.items = [];
                    el$.children( "tbody" ).children( "tr" ).each( eachRow );
                } else {
                    // gather info about each item in the container
                    c.items = [];
                    if ( alignment ) {
                        c.alignment = alignment;
                    }
                    el$.children( itemSel ).each( function ( index ) {
                        if ( isMove && this === component$[0] ) {
                            componentSkipped = true;
                            return;
                        }
                        ci = {
                            element: $( this ),
                            index: index,
                            name: $( this ).children( "h3" ).text()
                        };
                        if ( alignment ) {
                            ci.alignment = alignment;
                        }
                        c.items.push( ci );
                    } );
                }
                // weed out container when the only component in it is component$
                if ( !(componentSkipped && c.items.length === 0) ) {
                    result.push( c );
                }

            } );

            return result;
        },

        // xxx getConditionalComponents

        /*
         * Updates a component
         * component is the component id of the component that changed
         */
        update: function ( component, layoutChange, childrenOnly ) {
            var k, out, component$, newComponent$, selectedComponents, statusIcon,
                o = this.options,
                gridSupport = false;

            if ( typeof component === "string" ) {
                component = this._find( component );
            }
            if ( !component ) {
                throw "Nothing to update";
            }

            if ( debug.getLevel() >= debug.LOG_LEVEL.INFO ) {
                debug.info( "Gridlayout update component: " + component.title + ", layoutChange: " + layoutChange  + ", childrenOnly: " + childrenOnly);
            }

            if ( layoutChange ) {
                // need to relayout from parent component
                if ( !childrenOnly || component._parent ) {
                    // a component's parent is a container so the container must have a parent which is the parent region or page
                    component = component._parent._parent;
                }
                if ( component.type === "page" ) {
                    gridSupport = true;
                } else {
                    gridSupport = $.isArray( component._parent._grids );
                }
                this._layoutDisplayPoints(component.displayPoints, component, gridSupport, 12); // xxx 12
            }

            // replace DOM element
            component$ = this._getElement( component );
            if ( component$.length ) {
                if ( ! layoutChange ) {
                    // update the title (this wipes out the status icon too)
                    component$.find( SEL_LABEL ).first().html( util.escapeHTML( component.title ) );
                    // update any state classes
                    component$.toggleClass( C_CONDITIONAL, !!component.isConditional );
                    for ( k in o.stateClassMap ) {
                        if ( o.stateClassMap.hasOwnProperty( k ) ) {
                            component$.toggleClass( o.stateClassMap[k], !!component[k] );
                        }
                    }
                    // update the icon
                    component$.find( "." + o.iconType )[0].className = o.iconType + " " + o.getIconForComponent( component );
                    // update the status icon
                    statusIcon = getStateIcon( component, o.stateIconMap );
                    if ( statusIcon ) {
                        component$.find( SEL_LABEL ).first().prepend( "<span class='a-Icon " + statusIcon + "'></span>");
                    }
                } else {
                    // maintain selection around update
                    selectedComponents = this.getSelectedComponents();
                    out = util.htmlBuilder();
                    if ( component.type === "page" ) {
                        this._renderPage( out, component );
                    } else {
                        this._renderComponent( out, component, gridSupport );
                    }
                    newComponent$ = $( out.toString() );
                    if ( component$.hasClass( C_SELECTED ) ) {
                        newComponent$.addClass( C_SELECTED );
                    }
                    newComponent$[0].tabIndex = component$[0].tabIndex;
                    component$.replaceWith( newComponent$ );
                    this._showOrHideDisplayPoints( newComponent$ );
                    this.setSelectedComponents( selectedComponents ); // xxx don't focus !???
                }
            }
            // else the updated component may not be visible right now which is fine - nothing to update

        },

        /*
         * Add a new component
         * The component to add is identified by componentTypeId which is passed
         * to the callback option function "makeComponent".
         * The place to add the component is given by container$, grid, row, column and
         * index (position within the cell/container)
         * If the container is not a grid then grid, row and column are ignored.
         * If the container is not a button container that has alignment then alignment is ignored.
         * If the container is a grid and if index is NEW_GRID (-1) then insert a new grid,
         * if index is NEW_ROW (-2) then insert a new row,
         * and if index is NEW_COLUMN (-3) then insert a new column
         * component$ is used to undo a remove
         */
        add: function ( event, component, container$, grid, row, column, index, alignment, component$ ) {
            var changes, componentTypeId, newComponent$;

            if ( typeof component === "string" || typeof component === "number" ) {
                componentTypeId = component;
                component = this.options.makeComponent( componentTypeId );
            }
            container$ = this._getContainerElement( container$ );
            if ( !container$ || !container$.is( SEL_CONTAINER ) ) {
                throw "Invalid add destination";
            }

            if ( debug.getLevel() >= debug.LOG_LEVEL.INFO ) {
                debug.info( "Gridlayout add component: " + component.title + " to: " + container$[0].id + ", g/r/c/i: " + grid + "/" + row + "/" + column + "/" + index );
            }

            changes = this._add( component, container$, grid, row, column, index, alignment, component$ );
            newComponent$ = changes.newComponent$; // don't trust handlers to not mess with changes
            changes.lastChange = true;
            this._trigger( "added", event, changes );
            this._select( newComponent$, event, true );
            return this;
        },

        /*
         * Remove components$ (or current selection if null)
         * components$ can also be an array of components which is converted to a jQuery collection.
         */
        remove: function ( event, components$ ) {
            var i, changes, nextSelection$, elements, component, el$,
                changesList = [],
                focus = $( this.lastFocused ).hasClass( C_FOCUSED ),
                self = this;

            if ( debug.getLevel() >= debug.LOG_LEVEL.INFO ) {
                debug.info( "Gridlayout remove " + ( components$ ? components$.length + " component(s)." : "selection" ) );
            }

            components$ = components$ || this.getSelection();
            if ( $.isArray( components$ ) ) {
                // components$ is not a jQuery collection
                elements = [];

                for ( i = 0; i < components$.length; i++ ) {
                    el$ = this.findById( components$[i] );
                    // only add if component is found and exists in the DOM
                    if ( el$.length > 0 ) {
                        elements.push( el$[0] );
                    }
                }
                components$ = $(elements);
            }
            if ( !components$ || components$.filter( SEL_COMPONENT ).length === 0 ) {
                throw "Nothing to remove";
            }

            nextSelection$ = components$.filter( SEL_SELECTED ).eq( 0 );
            while ( nextSelection$ && nextSelection$.length && nextSelection$.hasClass( C_SELECTED ) && !nextSelection$.is( SEL_PAGE ) ) {
                nextSelection$ = $( this._traverseUp( event, true ) );
                if ( nextSelection$ ) {
                    this.lastFocused = nextSelection$[0];
                }
            }

            // only remove components
            components$.filter( SEL_COMPONENT ).each( function () {
                var component;
                // it is possible that the component is already removed because an ancestor was removed don't do it twice
                component = self._getNode( this );
                if ( component ) {
                    debug.info( "Gridlayout remove component: " + component.title );
                    changes = self._remove( $( this ) );
                    changesList.push(changes);
                }
            } );
            for ( i = 0; i < changesList.length; i++ ) {
                changesList[i].lastChange = i >= ( changesList.length - 1 );
                self._trigger( "removed", event, changesList[i] );
            }

            // update selection/focus
            if ( nextSelection$ && nextSelection$.length ) {
                this._select( nextSelection$, event, focus );
            }
            return this;
        },

        /*
         * Move component$ (or last focused if null) to the specified
         * container$, grid, row, column and index (position within the cell/container), and for button containers with alignment, alignment of left or right
         * If component$ or container$ are the component or container the corresponding jQuery objects are looked up
         * If the container is not a grid then grid, row and column are ignored.
         * If the container is not a button container that has alignment then alignment is ignored.
         * If the container is a grid and if index is NEW_GRID (-1) then insert a new grid,
         * if index is NEW_ROW (-2) then insert a new row,
         * and if index is NEW_COLUMN (-3) then insert a new column
         */
        move: function ( event, component$, container$, grid, row, column, index, alignment ) {
            var changes, newComponent$;
            component$ = component$ || $( this.lastFocused );

            component$ = this._getComponentElement( component$ );
            if ( !component$ || !component$.is( SEL_COMPONENT ) ) {
                throw "Nothing to move";
            }
            container$ = this._getContainerElement( container$ );
            if ( !container$ || !container$.is( SEL_CONTAINER ) ) {
                throw "Invalid move destination";
            }

            if ( debug.getLevel() >= debug.LOG_LEVEL.INFO ) {
                debug.info( "Gridlayout move component: " + this._getNode( component$[0] ).title + " to: " + container$[0].id + ", g/r/c/i: " + grid + "/" + row + "/" + column + "/" + index );
            }
            changes = this._moveOrCopy( component$, container$, grid, row, column, index, alignment, false );
            newComponent$ = changes.newComponent$; // don't trust handlers to not mess with changes
            changes.lastChange = true;
            this._trigger( "moved", event, changes );
            this._select( newComponent$, event, true );
            return this;
        },

        /*
         * Copy component$ (or last focused if null) to the specified
         * container$, grid, row, column and index (position within the cell/container), and for button containers with alignment, alignment of left or right
         * If component$ or container$ are the component or container the corresponding jQuery objects are looked up
         * If the container is not a grid then grid, row and column are ignored.
         * If the container is not a button container that has alignment then alignment is ignored.
         * If the container is a grid and if index is NEW_GRID (-1) then insert a new grid,
         * if index is NEW_ROW (-2) then insert a new row,
         * and if index is NEW_COLUMN (-3) then insert a new column
         */
        copy: function ( event, component$, container$, grid, row, column, index, alignment ) {
            var changes, newComponent$;
            component$ = component$ || $( this.lastFocused );

            component$ = this._getComponentElement( component$ );
            if ( !component$ || !component$.is( SEL_COMPONENT ) ) {
                throw "Nothing to copy";
            }
            container$ = this._getContainerElement( container$ );
            if ( !container$ || !container$.is( SEL_CONTAINER ) ) {
                throw "Invalid copy destination";
            }

            if ( debug.getLevel() >= debug.LOG_LEVEL.INFO ) {
                debug.info( "Gridlayout copy component: " + this._getNode( component$[0] ).title + " to: " + container$[0].id  + ", g/r/c/i: " + grid + "/" + row + "/" + column + "/" + index );
            }
            changes = this._moveOrCopy( component$, container$, grid, row, column, index, alignment, true );
            newComponent$ = changes.newComponent$; // don't trust handlers to not mess with changes
            changes.lastChange = true;
            this._trigger( "copied", event, changes );
            this._select( newComponent$, event, true );
            return this;
        },

        /*
         * Layout methods
         */
        /*
         * Take the components of a display point and return an array of grids
         * Components is an array of component objects ordered by sequence, id
         * with grid layout related properties
         *   newGrid - Boolean only if supported by page grid
         *   newRow - Boolean ignored if newGrid is true
         *   col - integer >= 1 and < max or -1 for auto layout
         *   newCol - Boolean ignored if newGrid or newRow is true or col != -1
         *   span - integer >= 1 or -1 for auto layout only if supported by page grid
         *   rowSpan - integer >= 1 or -1 for auto layout only if supported by page grid
         *
         * xxx what to do with hidden items, old start/stop table, how to handle errors in input?
         *
         * NOTE: This code must be kept in sync with the server side layout logic.
         *
         * Returns an array of grids. Each grid contains rows and each row contains
         * columns. Each column has:
         *   col
         *   span (optional)
         *   rowSpan (optional)
         *   components an array of components from the input components
         */
        _layoutGrid: function ( components, parent, gridSupport, maxColumns ) {
            var g, r, c, ci, comp, j, moveTo,
                pageInfo = this.pageRoot,
                grids = null, // xxx was []
                fixedColumns = {}, // map from column number to column index in current row
                maxFixedCol = 0,
                curGrid = null,
                curRow = null,
                curColumn = null,
                colIndex = 0;

            function moveComponent( from, to ) {
                var cm = curRow.columns.splice( from, 1 );
                curRow.columns.splice( to, 0, cm[0] );
            }

            //console.log( "xxx layout grid: grid support=" + gridSupport + ", max columns=" + maxColumns );

            // Pass 1: create grids
            if ( gridSupport ) {
                grids = [];
                //console.log( "xxx    Pass 1: create grids" );
                for ( ci = 0; ci < components.length; ci++ ) {
                    comp = components[ci];

                    // Check for start new grid
                    if ( !curGrid || (gridSupport && pageInfo.gridType !== "fixed" && comp.newGrid) ) {   // xxx hidden, start/stop table,
                        curGrid = { _parent: parent, rows: [] };
                        curRow = null;
                        grids.push( curGrid );
                    }

                    // Check for start new row
                    if ( !curRow || (gridSupport && comp.newRow) ) {
                        curRow = { _parentGrid: curGrid, columns: [] };
                        curColumn = null;
                        curGrid.rows.push( curRow );
                        fixedColumns = {};
                    }

                    // Put components into columns
                    if ( gridSupport && comp.col > 0 ) { // xxx and ! hidden
                        // Fixed column (newCol ignored)
                        // Is the column still free?
                        if ( !fixedColumns.hasOwnProperty( comp.col ) ) {
                            // Yes, so add a new column
                            curColumn = {
                                _parentRow: curRow,
                                col: comp.col,
                                span: pageInfo.hasColumnSpan ? (comp.span || -1) : 1,
                                rowSpan: comp.rowSpan,
                                components: [comp]
                            };
                            comp._parentColumn = curColumn;
                            curRow.columns.push( curColumn );
                            colIndex = curRow.columns.length - 1;
                            // Make sure fixed column components are in the right order
                            if ( comp.col < maxFixedCol ) {
                                moveTo = colIndex;
                                for ( j = comp.col + 1; j <= maxFixedCol; j++ ) {
                                    if ( fixedColumns.hasOwnProperty( j ) ) {
                                        if ( fixedColumns[j] < moveTo ) {
                                            moveTo = fixedColumns[j];
                                        }
                                        fixedColumns[j] += 1; // adjust affected indexes
                                    }
                                }
                                if ( moveTo !== colIndex ) {
                                    moveComponent( colIndex, moveTo );
                                }
                                fixedColumns[comp.col] = moveTo;
                            } else {
                                maxFixedCol = comp.col;
                                fixedColumns[comp.col] = colIndex;
                            }
                        } else {
                            curRow.columns[fixedColumns[comp.col]].components.push( comp );
                            comp._parentColumn = curRow.columns[fixedColumns[comp.col]];
                        }
                    } else {
                        // Automatic column
                        if ( !curColumn || (gridSupport && comp.newCol) ) {
                            curColumn = {
                                _parentRow: curRow,
                                col: -1,
                                span: pageInfo.hasColumnSpan ? (comp.span || -1) : 1,
                                rowSpan: comp.rowSpan,
                                components: []
                            };
                            curRow.columns.push( curColumn );
                        }
                        curColumn.components.push( comp );
                        comp._parentColumn = curColumn;
                    }
                }
                // todo remove columns, rows, grids when empty because of components not displayed
            }

            // Pass 2: for fixed width column span only, calculate column span
            if ( gridSupport && pageInfo.gridType === "fixed" && pageInfo.hasColumnSpan ) {
                //console.log( "xxx    Pass 2: for fixed with column span only, calculate column span" );
                // for each grid
                for ( g = 0; g < grids.length; g++ ) {
                    curGrid = grids[g];
                    // for each row
                    for ( r = 0; r < curGrid.rows.length; r++ ) {
                        curRow = curGrid.rows[r];
                        setColumnSpansForRow( curRow, maxColumns );
                    }
                }
            }

            //console.log( "xxx    Pass 3: xxx calc max columns" );
            // for each grid
            if ( grids ) {
                for ( g = 0; g < grids.length; g++ ) {
                    curGrid = grids[g];
                    // for each row
                    for ( r = 0; r < curGrid.rows.length; r++ ) {
                        curRow = curGrid.rows[r];
                        // for each column
                        for ( c = 0; c < curRow.columns.length; c++ ) {
                            curColumn = curRow.columns[c];
                        }
                    }
                }
            }

            //console.log( "xxx    Pass 4: layout children" );
            for ( ci = 0; ci < components.length; ci++ ) {
                comp = components[ci];
                comp._parent = parent;
                if ( comp.displayPoints ) {
                    // xxx adjust max columns?
                    this._layoutDisplayPoints( comp.displayPoints, comp, gridSupport, maxColumns );
                }
            }

            return grids;
        },

        _layoutDisplayPoints: function ( displayPoints, parent, gridSupport, maxColumns ) {
            var di, dp,
                pageInfo = this.pageRoot,
                usedColumns = 0;

            // console.log( "xxx layout display points " + parent.title + ", " + maxColumns + ", " + gridSupport );
            for ( di = 0; di < displayPoints.length; di++ ) {
                dp = displayPoints[di];
                dp._parent = parent;

                // Having span or newColumn properties means that the display points will
                // be arranged in a template grid (a simpler read only grid layout)
                if ( dp.hasOwnProperty( "span" ) || dp.hasOwnProperty( "newColumn" ) ) {
                    // a few consistency checks
                    if ( dp.newGrid === true ) {
                        delete dp.newRow; // new grid implies a new row
                        delete dp.newColumn; // and new column
                    }
                    if ( dp.newRow === true ) {
                        delete dp.newColumn; // new row implies a new new column
                    }
                    if ( dp.newRow === true || dp.newGrid === true ) {
                        usedColumns = 0;
                    }
                    // keep in mind that span affects how the template grid is laid out and maxColumns
                    // applies is the number of columns the contents of the display point have available
                    dp.span = dp.span || 1;
                    if ( dp.newColumn !== false ) {
                        usedColumns += dp.span;
                    }
                    if ( pageInfo.gridType === "fixed" && usedColumns > maxColumns ) {
                        throw "Fixed layout template grid exceeded max columns. Display point: " + dp.title;
                    }
                    if ( gridSupport && dp.isGrid && !dp.maxColumns ) {
                        if ( pageInfo.gridType === "fixed" && !pageInfo.alwaysUseMaxColumns ) {
                            dp.maxColumns = dp.span;
                        } else {
                            dp.maxColumns = maxColumns;
                        }
                    }
                    if ( dp.isGrid && pageInfo.gridType === "fixed" && !pageInfo.alwaysUseMaxColumns && dp.span !== dp.maxColumns ) {
                        throw "Fixed layout span and maxColumns must be the same. Display point: " + dp.title;
                    }
                } else {
                    usedColumns = 0;
                    if ( gridSupport && dp.isGrid && !dp.maxColumns ) {
                        dp.maxColumns = maxColumns;
                    }
                }

                if ( dp.hasRowSpan && !pageInfo.hasRowSpan ) {
                    throw "Row span not allowed for display point when page doesn't support row span. Display point: " + dp.title;
                }

                // console.log( "xxx layout display point type: " + dp.type + ", name: " + dp.title );
                dp._grids = this._layoutGrid( dp.components, dp, gridSupport && dp.isGrid, dp.maxColumns || maxColumns );

            }
        },

        _layoutPage: function () {
            var page = this.pageRoot;

            this._layoutDisplayPoints( page.displayPoints, page, true, page.maxColumns );
        },

        _showOrHideDisplayPoints: function ( el$ ) {
            var show,
                o = this.options,
                self = this;

            el$ = el$ || this.element;
            // all the legacy region display points
            el$.find( SEL_REGION_CONT ).each( function() {
                var container = self._getNode( this );
                if ( !o.hideEmptyDisplayPoints && $( this ).is( SEL_LEGACY ) ) {
                    // only hide if the display point is empty
                    $( this ).toggle( !o.hideLegacyDisplayPoints || container.components.length !== 0 );
                } else {
                    // only hide if hide empty and the display point is empty
                    $( this ).toggle( !o.hideEmptyDisplayPoints || container.components.length !== 0 );
                }
            });
            el$.find( SEL_BUTTON_CONT ).each( function() {
                var container = self._getNode( this );
                // if hide buttons or (hide empty and empty) then don't show
                // otherwise show button unless button is also legacy and hide legacy says to hide and not empty
                show = !( o.hideButtons || ( o.hideEmptyDisplayPoints && container.components.length === 0 ) );
                if ( show && container.isLegacy ) {
                    show = !o.hideLegacyDisplayPoints || container.components.length !== 0;
                }
                $( this ).toggle( show );
            });
            el$.find( SEL_ITEM_CONT ).each( function() {
                var container = self._getNode( this );
                // if hide items then don't show
                // otherwise show item unless item is also legacy and hide legacy says to hide and not empty
                show = !( o.hideItems || ( o.hideEmptyDisplayPoints && container.components.length === 0 ) );
                if ( show && container.isLegacy ) {
                    show = !o.hideLegacyDisplayPoints || container.components.length !== 0;
                }
                $( this ).toggle( show );
            });
            if ( o.hideEmptyDisplayPoints ) { //xxx

            }
        },

        /*
         * Rendering methods
         */

        _find: function ( component, regionsOnly ) {
            var page = this.pageRoot;

            function searchDisplayPoints( dps ) {
                var i, j, dp, c,
                    foundRegion = null;
                for ( i = 0; i < dps.length; i++ ) {
                    dp = dps[i];
                    if ( !regionsOnly || displayPointHoldsType( dp, "regionContainer") ) {
                        for ( j = 0; j < dp.components.length; j++ ) {
                            c = dp.components[j];
                            if ( c === component || c.id === component ) {
                                return c;
                            }
                            if ( c.displayPoints ) {
                                foundRegion = searchDisplayPoints( c.displayPoints );
                                if ( foundRegion ) {
                                    return foundRegion;
                                }
                            }
                        }
                    }
                }
                return foundRegion;
            }

            if ( !regionsOnly && page === component || page.id === component ) {
                return page;
            }
            return searchDisplayPoints( page.displayPoints );
        },

        /*
         * Get the component element. The input component could be
         * - a component object from the internal model
         * - the string id of a component
         * - the jQuery object for the component
         * returns a jQuery object
         */
        _getComponentElement: function( component ) {
            if ( typeof component === "string" ) {
                // it must be a string id
                return this.findById( component );
            } else if ( component._elementId ) {
                // it must be a component that is currently in the gridlayout model
                return this._getElement( component );
            }
            // it must already be a jQuery object
            return component;
        },

        /*
         * Get the container element. The input container could be
         * - a display point object from the internal model
         * - an array containing the pair region id, display point name/id
         * - the jQuery object for the container
         * returns a jQuery object
         */
        _getContainerElement: function( container ) {
            var c;
            if ( $.isArray( container ) ) {
                // it must be a region id, container name pair
                c = this.findContainer( container[0], container[1] );
                if ( c ) {
                    return this._getElement( c );
                } else {
                    return null;
                }
            } else if ( container._elementId ) {
                // it must be a container that is currently in the gridlayout model
                return this._getElement( container );
            }
            // it must already be a jQuery object
            return container;
        },

        _addNode: function ( node ) {
            var key = this.nextId;
            this.nodeMap[this.nextId] = node;
            node._elementId = this.nextId;
            this.nextId += 1;
            return this.baseId + key;
        },

        _setNode: function ( node ) {
            if ( node._elementId ) {
                this.nodeMap[node._elementId] = node;
            } else {
                throw "Failed to add node to nodeMap - no id";
            }
        },

        _getNode: function ( element ) {
            var key = keyFromId( element.id );
            return this.nodeMap[key];
        },

        _getElement: function ( node ) {
            var key = this.baseId + node._elementId;
            return $( "#" + key );
        },

        /*
         * grabbed can be
         *   null - not draggable
         *   false - not currently being dragged
         *   true - currently begin dragged
         */
        _renderHeader: function ( out, icon, title, grabbed, statusIcon ) {
            out.markup( "<h3" )
                .optionalAttr( "class", grabbed !== null ? C_DRAGGABLE : null )
                .optionalAttr("aria-grabbed", grabbed !== null ? "" + grabbed : null )
                .markup( "><span" ).attr( "class", this.options.iconType + " " + icon ).markup( "></span><span" )
                .attr( "class", C_LABEL ).markup( ">" );
            if ( statusIcon ) {
                out.markup( "<span class='a-Icon " ).attr( statusIcon ).markup( "'></span>" );
            }
            out.content( title ).markup( "</span></h3>" );
        },

        _renderRegion: function ( out, region, gridSupport, top ) {
            var statusIcon,
                regionClass = C_REGION;

            if ( region.isConditional ) {
                regionClass += " " + C_CONDITIONAL;
            }
            regionClass = addStateClasses( regionClass, region, this.options.stateClassMap );
            statusIcon = getStateIcon( region, this.options.stateIconMap );
            out.markup( "<div" ).attr( "class", regionClass ).attr( "id", this._addNode( region ) ).markup( " tabindex='-1'>" );
            this._renderHeader( out, this.options.getIconForComponent( region ), region.title, top || region.isReadOnly ? null : false, statusIcon );
            this._renderDisplayPoints( out, region.displayPoints, gridSupport, region.itemsAboveContent );
            out.markup( "</div>" );
        },

        _renderItem: function ( out, item ) {
            var statusIcon,
                itemClass = C_PAGE_ITEM;

            if ( item.isConditional ) {
                itemClass += " " + C_CONDITIONAL;
            }
            itemClass = addStateClasses( itemClass, item, this.options.stateClassMap );
            statusIcon = getStateIcon( item, this.options.stateIconMap );
            out.markup( "<div" ).attr( "class", itemClass ).attr( "id", this._addNode( item ) ).markup( " tabindex='-1'>" );
            this._renderHeader( out, this.options.getIconForComponent( item ), item.title, item.isReadOnly ? null : false, statusIcon );
            out.markup( "</div>" );
        },

        _renderButton: function ( out, button ) {
            var statusIcon,
                buttonClass = C_BUTTON;

            if ( button.isConditional ) {
                buttonClass += " " + C_CONDITIONAL;
            }
            buttonClass = addStateClasses( buttonClass, button, this.options.stateClassMap );
            statusIcon = getStateIcon( button, this.options.stateIconMap );
            out.markup( "<div" ).attr( "class", buttonClass ).attr( "id", this._addNode( button ) ).markup( " tabindex='-1'>" );
            this._renderHeader( out, this.options.getIconForComponent( button ), button.title, button.isReadOnly ? null : false, statusIcon );
            out.markup( "</div>" );
        },

        _renderComponentsInGrid: function ( out, dp, listClass, grids ) {
            var i, g, r, c, ci, comp, curCol,
                grid, row, column,
                gridType = this.pageRoot.gridType;

            function fixedHeader() {
                out.markup( "<thead><tr>" );
                for ( i = 0; i < dp.maxColumns ; i++ ) {
                    out.markup("<td></td>");
                }
                out.markup( "</tr></thead>" );
            }

            if ( grids.length > 0 ) {
                // for each grid
                for ( g = 0; g < grids.length; g++ ) {
                    grid = grids[g];
                    out.markup( "<table" ).attr( "class", C_GRID + " " + listClass + ( g === 0 ? " first" : "" ) ).markup( ">" );
                    if ( gridType === "fixed" ) {
                        fixedHeader();
                    }
                    out.markup( "<tbody>" );
                    // for each row
                    for ( r = 0; r < grid.rows.length; r++ ) {
                        row = grid.rows[r];
                        out.markup( "<tr>" );
                        curCol = 1;
                        // for each column
                        for ( c = 0; c < row.columns.length; c++ ) {
                            column = row.columns[c];
                            if ( column.col > curCol ) {
                                // render a spacer column if needed
                                out.markup( "<td" ).attr( "colspan", column.col - curCol )
                                    .markup( "><div" ).attr( "class", C_STACK + " " + listClass ).markup( "></div></td>" );
                                curCol = column.col;
                            }
                            curCol += column.span > 0 ? column.span : 1;
                            out.markup( "<td" )
                                .optionalAttr( "colspan", column.span )
                                .optionalAttr( "rowspan", column.rowSpan )
                                .markup( "><div" ).attr( "class", C_STACK + " " + listClass ).markup( ">" );
                            // for each component in column
                            for ( ci = 0; ci < column.components.length; ci++ ) {
                                comp = column.components[ci];
                                this._renderComponent( out, comp, true );
                            }
                            out.markup( "</div></td>" );
                        }
                        out.markup( "</tr>" );
                    }
                    out.markup( "</tbody></table>" );
                }
            } else {
                out.markup( "<table" ).attr( "class", C_GRID + " first " + listClass ).markup( ">");
                if ( gridType === "fixed" ) {
                    fixedHeader();
                }
                out.markup( "<tbody><tr><td><div" )
                    .attr( "class", C_STACK + " " + listClass ).markup( "></div></td></tr></tbody></table>" );
            }
        },

        _renderComponent: function ( out, component, gridSupport ) {
            if ( component.type === "region" ) {
                this._renderRegion( out, component, gridSupport );
            } else if ( component.type === "item" ) {
                this._renderItem( out, component );
            } else if ( component.type === "button" ) {
                this._renderButton( out, component );
            } else {
                throw "Unknown component type";
            }
        },

        _renderComponents: function ( out, layout, components, alignment ) {
            var i, comp;

            out.markup( "<div" ).attr( "class", layout ).markup( ">" );
            if ( components && components.length > 0 ) {
                for ( i = 0; i < components.length; i++ ) {
                    comp = components[i];
                    if ( !alignment || comp.alignment === alignment ) {
                        this._renderComponent( out, comp, false );
                    }
                }
            }
            out.markup( "</div>" );
        },

        _renderDisplayPoints: function ( out, displayPoints, gridSupport, itemsAboveContent ) {
            var i, dp, containerClass, listClass, contentTitle,
                self = this,
                irSearchBarBtnDp = null,
                btnGrpOpen = false,
                gridOpen = false,
                colOpen = false;

            /*
             * Special handling for Region content assumes there is exactly one item container
             * display point with id BODY and that if there is a RIGHT_OF_IR_SEARCH_BAR button container
             * it comes before BODY.
             */
            function renderRegionContent() {
                var dptype;
                contentTitle = lang.getMessage("GL.REGION_CONTENT");
                out.markup( "<div" ).attr( "class", C_REGION_CONTENT ).markup( "><h3>" ).content( contentTitle ).markup( "</h3>" );
                if ( irSearchBarBtnDp ) {
                    dptype = irSearchBarBtnDp.types[0];
                    out.markup( "<div" ).attr( "class", containerTypeClassMap[dptype][0] ).attr( "id", self._addNode( irSearchBarBtnDp ) ).markup( ">" );
                    out.markup( "<h3>" ).content( irSearchBarBtnDp.title ).markup( "</h3>" );
                    self._renderComponents( out, C_FLOW + " " + containerTypeClassMap[dptype][1], irSearchBarBtnDp.components );
                    out.markup( "</div>" );
                }
                out.markup( "</div>" );
            }

            for ( i = 0; i < displayPoints.length; i++ ) {
                dp = displayPoints[i];
                // first see if the display point is in a grid within the template
                if ( dp.hasOwnProperty( "span" ) || dp.hasOwnProperty( "newColumn" ) ) {
                    // close previous column if needed
                    if ( colOpen && dp.newColumn !== false ) {
                        out.markup( "</td>" );
                        colOpen = false;
                    }
                    if ( !gridOpen ) {
                        out.markup( "<table" ).attr( "class", C_TEMPLATE_GRID ).markup( "><tbody><tr>" );
                        gridOpen = true;
                        dp.newColumn = true; // force creating the first column
                    } else {
                        if ( dp.newGrid === true ) {
                            // close prev grid and start a new one
                            out.markup( "</tr></tbody></table><table" )
                                .attr( "class", C_TEMPLATE_GRID ).markup( "><tbody><tr>" );
                        }
                    }
                    // Check for start new row
                    if ( dp.newRow === true ) {
                        out.markup( "</tr><tr>" );
                    }
                    if ( dp.newColumn !== false ) {
                        out.markup( "<td colspan='" + dp.span + "'>" );
                        colOpen = true;
                    }
                } else {
                    if ( gridOpen ) {
                        out.markup( "</tr></tbody></table>" );
                        gridOpen = false;
                    }
                }

                if (  dp.types.length > 1 || displayPointHoldsType( dp, "regionContainer" ) || displayPointHoldsType( dp, "itemContainer" ) ) {
                    if ( btnGrpOpen ) {
                        out.markup( "</div>" );
                        btnGrpOpen = false;
                    }
                } else if ( dp.types[0] === "buttonContainer" ) {
                    if ( dp.id === "RIGHT_OF_IR_SEARCH_BAR" ) {
                        irSearchBarBtnDp = dp;
                        continue;
                    } else {
                        if ( btnGrpOpen ) {
                            if ( dp.hasAlignment ) {
                                out.markup( "</div>" );
                                btnGrpOpen = false;
                            }
                        } else {
                            if ( !dp.hasAlignment ) {
                                out.markup( "<div" ).attr( "class", C_BTN_GROUP ).markup( ">" );
                                btnGrpOpen = true;
                            }
                        }
                    }
                }

                if ( displayPointHoldsType( dp, "itemContainer" ) && dp.id === "BODY" && !itemsAboveContent ) {
                    renderRegionContent();
                }

                containerClass = classesForTypes( dp.types, 0 );
                if ( dp.isLegacy ) {
                    containerClass += " " + C_LEGACY;
                }
                listClass = classesForTypes( dp.types, 1 );
                out.markup( "<div" ).attr( "class", containerClass ).attr( "id", this._addNode( dp ) ).markup( ">" );
                // xxx need to also keep track of remaining columns under some cases
                out.markup( "<h3>" ).content( dp.title ).markup( "</h3>" );
                if ( dp.types.length > 1 || displayPointHoldsType( dp, "regionContainer" ) || displayPointHoldsType( dp, "itemContainer" ) ) {
                    if ( dp.isGrid && gridSupport ) {
                        this._renderComponentsInGrid( out, dp, listClass, dp._grids );
                    } else {
                        this._renderComponents( out, C_STACK + " " + listClass, dp.components );
                    }
                } else if ( dp.types[0] === "buttonContainer" ) {

                    if ( dp.hasAlignment ) {
                        out.markup( "<table" ).attr( "class", C_BTN_ROW ).markup( "><tbody><tr><td>" );
                        this._renderComponents( out, C_FLOW + " " + listClass, dp.components, "left" );
                        out.markup( "</td><td>" );
                        this._renderComponents( out, C_FLOW + " " + listClass, dp.components, "right" );
                        out.markup( "</td></tr></tbody></table>" );
                    } else {
                        this._renderComponents( out, C_FLOW + " " + listClass, dp.components );
                    }
                } else {
                    throw "Unknown display point type: " + dp.types[0];
                }
                out.markup( "</div>" );

                if ( displayPointHoldsType( dp, "itemContainer" ) && dp.id === "BODY" && itemsAboveContent ) {
                    renderRegionContent();
                }
            }
            if ( btnGrpOpen ) {
                out.markup( "</div>" );
            }
            if ( gridOpen ) {
                out.markup( "</tr></tbody></table>" );
            }
        },

        _renderPage: function ( out, page ) {
            var statusIcon,
                pageClass = C_PAGE;

            if ( page.isConditional ) {
                pageClass += " " + C_CONDITIONAL;
            }
            pageClass = addStateClasses( pageClass, page, this.options.stateClassMap );
            statusIcon = getStateIcon( page, this.options.stateIconMap );
            out.markup( "<div" ).attr( "class", pageClass ).attr( "id", this._addNode( page ) ).markup( " tabindex='-1'>" );
            this._renderHeader( out, this.options.getIconForComponent( page ), page.title, null, statusIcon ); // never draggable
            this._renderDisplayPoints( out, page.displayPoints, true );
            out.markup( "</div>" );
        },

        /*
         * Selection, focus, and navigation
         */

        _setFocusable: function ( el ) {
            if ( this.lastFocused && this.lastFocused !== el ) {
                this.lastFocused.tabIndex = -1;
            }
            el.tabIndex = 0;
            this.lastFocused = el;
        },

        _select: function ( components$, event, focus, delayTrigger, noNotify ) {
            var $prevSel, prevSelected, offset, sp, spOffset, glOffset,
                action = "set",
                self = this;

            // can't select something that isn't visible
            components$ = components$.filter( ":visible" );

            //console.log("xxx in select " + components$.length);
            if ( event && this.options.multiple ) {
                if ( event.type === "mousedown" ) {
                    // control+click for Windows and command+click for Mac
                    if ( event.ctrlKey || event.metaKey ) {
                        action = "toggle";
                    } else if ( event.shiftKey ) {
                        action = "add"; // really should be select range
                    }
                } else if ( event.type === "keydown" ) {
                    // Mac has no concept of toggle with the keyboard
                    if ( event.keyCode === $.ui.keyCode.SPACE ) {
                        action = "toggle";
                    } else if ( event.ctrlKey ) {
                        action = "none";
                    } else if ( event.shiftKey ) {
                        action = "add"; // really should be select range
                    }
                }
            }
            $prevSel = this.element.find( SEL_SELECTED );
            if ( action === "set" ) {
                $prevSel.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED );
            }
            prevSelected = components$.hasClass( C_SELECTED );
            if ( action === "set" || action === "add" || (action === "toggle" && !prevSelected) ) {
                components$.addClass( C_SELECTED ).attr( ARIA_SELECTED, true );
            } else if ( action === "toggle" && prevSelected ) {
                components$.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED );
            }

            if ( components$.length > 0 ) {
                if ( focus ) {
                    components$[0].tabIndex = 0;
                    components$[0].focus();
                } else {
                    this._setFocusable( components$[0] );
                }
                // scroll into view if needed
                sp = this.element.scrollParent();
                spOffset = sp.offset();
                if ( spOffset ) {
                    glOffset = this.element.offset();
                    offset = components$.first().offset();
                    // Don't use scrollIntoView because it applies to all potentially scrollable ancestors, we only
                    // want to scroll within the immediate scroll parent.
                    // Chrome scrolls parents other than the immediate scroll parent even though it seems that it shouldn't
                    if ( ( offset.top < spOffset.top ) || ( offset.top > spOffset.top + sp[0].offsetHeight ) ) {
                        sp[0].scrollTop = offset.top - glOffset.top;
                    }
                    if ( ( offset.left + components$[0].offsetWidth < spOffset.left ) || ( offset.left > spOffset.left + sp[0].offsetWidth ) )  {
                        sp[0].scrollLeft = offset.left - glOffset.left;
                    }
                }
            }

            if ( noNotify ) {
                return;
            }
            if ( action === "toggle" || (action === "add" && !prevSelected) || (action === "set" && ($prevSel[0] !== components$[0] || $prevSel.length !== components$.length)) ) {
                // use a timer to make sure the focus happens first and also throttle
                // rapid changes from keyboard navigation.
                if ( self.triggerTimerId ) {
                    clearTimeout( self.triggerTimerId );
                    self.triggerTimerId = null;
                }
                self.triggerTimerId = setTimeout( function () {
                    self.triggerTimerId = null;
                    self._trigger( "selectionChange", event );
                }, delayTrigger ? 350 : 1 );
            }
        },

        _traverseRight: function ( event ) {
            var next$, td$,
                target$ = null;

            if ( !this.lastFocused ) {
                return;
            }
            next$ = $( this.lastFocused );
            // if in a flow container treat right as down
            if ( next$.parent().hasClass( C_FLOW ) ) {
                this._traverseDown( event );
                return;
            }
            td$ = next$.closest( "td" );
            while ( td$.length ) {
                next$ = td$.next().find( SEL_COMPONENT ).first();
                if ( next$.length ) {
                    target$ = next$;
                    break;
                }
                td$ = td$.parent().closest( "td" );
            }
            if ( target$ && target$.length > 0 ) {
                this._select( target$.eq( 0 ), event, true, true );
            }
        },

        _traverseLeft: function ( event ) {
            var prev$, td$,
                target$ = null;

            if ( !this.lastFocused ) {
                return;
            }
            prev$ = $( this.lastFocused );
            // if in a flow container treat left as UP
            if ( prev$.parent().hasClass( C_FLOW ) ) {
                // treat like up
                this._traverseUp( event );
                return;
            }
            td$ = prev$.closest( "td" );
            while ( td$.length ) {
                prev$ = td$.prev().find( SEL_COMPONENT ).first();
                if ( prev$.length ) {
                    target$ = prev$;
                    break;
                }
                td$ = td$.parent().closest( "td" );
            }
            if ( target$ && target$.length > 0 ) {
                this._select( target$.eq( 0 ), event, true, true );
            }
        },

        _traverseDown: function ( event ) {
            var prevCol, nextCol, target$, next$, nextRow$, thisRow, btnGroup$;

            if ( !this.lastFocused ) {
                return;
            }
            target$ = $( this.lastFocused );
            if ( event.which !== $.ui.keyCode.RIGHT ) {
                // special case for button groups except when really handling right
                btnGroup$ = target$.closest( SEL_BUTTON_GROUP );
                if ( btnGroup$.length === 0 ) {
                    btnGroup$ = target$.closest( "." + C_BUTTON_CONT); // not really a group but gets to the right place
                }
                if ( btnGroup$.length > 0) {
                    target$ = btnGroup$.find( SEL_COMPONENT ).last();
                }
            }
            // First look for descendent components
            next$ = target$.find( SEL_COMPONENT ).filter( ":visible" ).first();
            if ( next$.length > 0 ) {
                target$ = next$;
            } else {
                // Then look for next sibling
                next$ = target$.nextAll(":visible" ).first();
                if ( next$.length > 0 ) {
                    target$ = next$;
                } else {
                    // If in a button row check next column (alignment right) if any
                    if ( target$.closest( SEL_BTN_ROW ).length > 0 ) {
                        next$ = target$.closest( "td" ).next().find( SEL_COMPONENT ).filter( ":visible" ).first();
                    }
                    if ( next$.length > 0 ) {
                        target$ = next$;
                    } else {
                        // Try the first component of the next container
                        while ( target$.length > 0 ) {
                            next$ = target$.nextAll( SEL_COMPONENT ).filter( ":visible" ).first();
                            if ( next$.length > 0 ) {
                                target$ = next$;
                                break;
                            }
                            next$ = target$.nextAll( ":visible" ).find( SEL_COMPONENT ).filter( ":visible" ).first();
                            if ( next$.length > 0 ) {
                                target$ = next$;
                                break;
                            }
                            // Try the first component of the next row stay in the same column if possible
                            nextRow$ = target$.parent().parent().parent( "tr" ).first().next().first();
                            if ( nextRow$.length > 0 ) {
                                thisRow = nextRow$.prev()[0];
                                prevCol = findColumnInRow( target$.parents( "td" ).filter(function() {
                                    return this.parentNode === thisRow;
                                }) );
                                nextCol = 0;
                                nextRow$.children().each( function(){
                                    nextCol += this.colSpan || 1;
                                    if ( nextCol > prevCol ) {
                                        next$ = $( this ).find( SEL_COMPONENT ).first();
                                        return false; // break
                                    }
                                } );
                                if ( next$.length === 0 ) {
                                    next$ = nextRow$.children().last().find( SEL_COMPONENT ).first();
                                }
                            }
                            if ( next$.length > 0 ) {
                                target$ = next$;
                                break;
                            }
                            target$ = target$.parent().closest( SEL_COMPONENT + "," + SEL_CONTAINER + "," + SEL_BUTTON_GROUP );
                        }
                    }
                }
            }
            if ( target$ && target$.length > 0 ) {
                this._select( target$, event, true, true );
            }
        },

        // noSelect is optional. When true this method
        // returns the target element rather than select it.
        // It is used for finding something to select after a remove.
        _traverseUp: function ( event, noSelect ) {
            var prevCol, nextCol, target$, prev$, prevRow$, container$, btnGroup$;

            if ( !this.lastFocused ) {
                return;
            }
            target$ = $( this.lastFocused );
            if ( event.which !== $.ui.keyCode.LEFT ) {
                // special case for button groups and rows except when really handling left
                btnGroup$ = target$.closest( SEL_BUTTON_GROUP );
                if ( btnGroup$.length === 0 ) {
                    btnGroup$ = target$.closest( "." + C_BUTTON_CONT); // not really a group but gets to the right place
                }
                if ( btnGroup$.length > 0) {
                    target$ = btnGroup$.find( SEL_COMPONENT ).first();
                }
            }
            // First try last component of previous sibling
            prev$ = target$.prevAll( ":visible" ).first();
            if ( prev$.length > 0 ) {
                target$ = prev$.find( SEL_COMPONENT ).filter( ":visible" ).last();
                // Then try previous sibling
                if ( target$.length === 0 ) {
                    target$ = prev$;
                }
            } else {
                // Try the last component of the previous row stay in the same column if possible
                prevRow$ = target$.closest( "tr" ).prev();
                if ( prevRow$.length > 0 ) {
                    prevCol = findColumnInRow( target$.closest( "td" ) );
                    nextCol = 0;
                    prevRow$.children().each( function(){
                        nextCol += this.colSpan || 1;
                        if ( nextCol > prevCol ) {
                            prev$ = $( this ).find( SEL_COMPONENT ).filter( ":visible" ).last();
                            return false; // break
                        }
                    } );
                    if ( prev$.length === 0 ) {
                        prev$ = prevRow$.children().last().find( SEL_COMPONENT ).filter( ":visible" ).last();
                    }
                }
                if ( prev$.length > 0 ) {
                    target$ = prev$;
                } else {
                    // If in a button row check previous column (alignment left) if any
                    if ( target$.closest( SEL_BTN_ROW ).length > 0 ) {
                        prev$ = target$.closest( "td" ).prev().find( SEL_COMPONENT ).filter( ":visible" ).last();
                    }
                    // Try the last component of the previous container
                    if ( prev$.length === 0 ) {
                        if ( btnGroup$ && btnGroup$.length > 0 ) {
                            container$ = btnGroup$;
                        } else {
                            container$ = target$.parent().closest( SEL_CONTAINER );
                        }
                        prev$ = container$.prevAll( ":visible" ).find( SEL_COMPONENT ).filter( ":visible" ).last();
                        // check if in a button container
                        if ( prev$.length === 0 && container$.parent().is( SEL_BUTTON_GROUP )) {
                            container$ = container$.parent();
                            prev$ = container$.prevAll( ":visible" ).find( SEL_COMPONENT ).filter( ":visible" ).last();
                        }
                    }
                    if ( prev$.length === 0 ) {
                        // Last try the parent component
                        target$ = target$.parent().closest( SEL_COMPONENT_OR_PAGE );
                    } else {
                        target$ = prev$;
                    }
                }
            }
            if ( target$ && target$.length > 0 ) {
                if ( noSelect ) {
                    return target$[0];
                } else {
                    this._select( target$, event, true, true );
                }
            }
        },

        _setZoom: function() {
            var i, zoomClass,
                zoom = this.options.zoom * 1;

            for ( i = 0; i < zoomSizes.length; i++ ) {
                if ( zoom <= zoomSizes[i] ) {
                    zoom = zoomSizes[i];
                    break;
                }
            }
            if ( i >= zoomSizes.length ) {
                zoom = zoomSizes[zoomSizes.length - 1];
            }
            zoomClass = C_GLV + "--z" + zoom;
            this.element.removeClass( this.lastZoom ).addClass( zoomClass );
            this.lastZoom = zoomClass;
        },

        /*
         * Drag and Drop methods
         */

        _mouseCapture: function ( event, noSelect ) { // noSelect given from draggable
            var handle$,
                component$ = null,
                self = this;

            if ( this.animating || this.options.disabled ) {
                return false;
            }

            if ( event.target.nodeName === "H3" ) {
                handle$ = $( event.target );
            } else if ( event.target.parentNode.nodeName === "H3" ) {
                handle$ = $( event.target.parentNode );
            }
            if ( handle$ && handle$.length ) {
                component$ = handle$.parent( SEL_COMPONENT_OR_PAGE );
            }
            // handle selection on mouse down
            if ( component$ && component$.length && !noSelect ) {
                self._select( component$, event, true, false ); // xxx actually not a real select until mouse up ignore ctrl key multi select issue also don't want to scroll into view it messes up the cursor offset
            }

            // todo: future check for resize handle

            // Is the target draggable
            // It must be a single component (not a page or multiple components) and must not be the top level component
            if ( handle$ && handle$.length ) {
                component$ = handle$.parent( SEL_COMPONENT );
            }
            if ( !handle$ || !handle$.is( SEL_DRAGGABLE ) || !component$ || component$.length !== 1 || component$.parent().hasClass( C_GLV ) ) {
                return false;
            } // else
            this.dragComponent = component$;
            this._initDragTargets( this.dragComponent );
            return true;
        },

        _mouseStart: function ( downEvent, event, noActivation ) { // noactivation given from draggable
            var body, dcHeight, positionShiftY,
                o = this.options,
                self = this;

            if ( !noActivation ) {
                // install handler for ESCAPE key to cancel drag
                $( "body" ).on( "keydown.glv", function ( event ) {
                    if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
                        self._cancel( event );
                        return;
                    }
                    self._dragCopyOrMove( event.ctrlKey );
                } );
                $( "body" ).on( "keyup.glv", function ( event ) {
                    self._dragCopyOrMove( event.ctrlKey );
                } );
            }

            // Create and append the visible helper
            // if a draggable is connected to this control then it will create the helper
            if ( !this.helper ) {
                this.helper = this._createHelper();
            }

            // xxx cache helper size???

            // Cache the margins of the original element
            this.margins = {
                left: (parseInt( this.dragComponent.css( "marginLeft" ), 10 ) || 0),
                top: (parseInt( this.dragComponent.css( "marginTop" ), 10 ) || 0)
            };

            // Get the next scrolling parent
            this.scrollParent = this.helper.scrollParent();

            // The element's absolute position on the page minus margins
            this.offset = this.dragComponent.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };

            $.extend( this.offset, {
                click: { //Where the click happened, relative to the element
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset()
            } );

            // Only after we got the offset, we can change the helper's position to absolute
            this.helper.css( "position", "absolute" );

            // Cache the helper size
            this._cacheHelperProportions();

            // Keep the original position for events
            this.originalPosition = this._generatePosition( event );

            // Adjust the mouse offset relative to the helper if "cursorAt" is supplied
            if ( o.cursorAt ) {
                this._adjustOffsetFromHelper( o.cursorAt );
            }

            this.dragging = true;

            dcHeight = this.dragComponent.children( "h3" ).outerHeight(); // get the height before hiding
            this.dragComponent.hide(); // assume move for now

            this._createPlaceholder( dcHeight );

            positionShiftY = this.placeholder.offset().top;
            this._initTargetContainers(); // activate targets
            positionShiftY = this.placeholder.offset().top - positionShiftY;
            if ( positionShiftY > 0 ) {
                // once the targets have been activated they expand which shifts the position of the original drag
                // component/placeholder under the mouse. Adjust the scroll so that the component stays under the mouse
                this.scrollParent[0].scrollTop = this.scrollParent[0].scrollTop + positionShiftY;
            }
            this._refreshPositions();

            // Set a containment if given in the options
            if ( o.containment ) {
                this._setContainment();
            }

            // if draggable it is responsible for the cursor
            if ( !noActivation ) {
                if ( o.cursor && o.cursor !== "auto" ) { // cursor option
                    body = $( "body" );

                    // support: IE
                    this.storedCursor = body.css( "cursor" );
                    body.css( "cursor", o.cursor );

                    this.storedStylesheet = $( "<style>*{ cursor: " + o.cursor + " !important; }</style>" ).appendTo( body );
                }
            }

            if ( o.opacity ) { // opacity option
                this.helper.css( "opacity", o.opacity );
            }

            if ( o.zIndex ) { // zIndex option
                this.helper.css( "zIndex", o.zIndex );
            }

            // Prepare scrolling
            if ( this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML" ) {
                this.overflowOffset = this.scrollParent.offset();
            }

            // Call callbacks
            this._trigger( "start", event, this._uiHashDnD() );

            this._mouseDrag( event ); // Execute the drag once - this causes the helper not to be visible before getting its correct position
            return true;
        },

        _mouseDrag: function ( event ) {
            var i, j, container, item, itemElement, intersection, wRatio,
                r, row, c, col, x, y, containerType,
                deltaX = 0,
                deltaY = 0,
                o = this.options,
                moved = false,
                scrolled = false;

            this.position = this._generatePosition( event );
            this.positionAbs = this._adjustPositionForScroll();

//      console.log("xxx mouse drag     " + this.position.top + ", " + this.position.left);

            if ( !this.lastPositionAbs ) {
                this.lastPositionAbs = this.positionAbs;
            }

            // Do scrolling
            if ( this.options.scroll ) {
                if ( this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML" ) {

                    if ( (this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity ) {
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
                    } else if ( event.pageY - this.overflowOffset.top < o.scrollSensitivity ) {
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
                    }
                    deltaY = this.scrollParent[0].scrollTop - this.dropPositionsOrigin.y;

                    if ( (this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity ) {
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
                    } else if ( event.pageX - this.overflowOffset.left < o.scrollSensitivity ) {
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
                    }
                    deltaX = this.scrollParent[0].scrollLeft - this.dropPositionsOrigin.x;

                } else {
                    // xxx this branch is not tested and not used by PD consider removing it
                    if ( event.pageY - $( document ).scrollTop() < o.scrollSensitivity ) {
                        scrolled = $( document ).scrollTop( $( document ).scrollTop() - o.scrollSpeed );
                    } else if ( $( window ).height() - (event.pageY - $( document ).scrollTop()) < o.scrollSensitivity ) {
                        scrolled = $( document ).scrollTop( $( document ).scrollTop() + o.scrollSpeed );
                    }
                    deltaY = $( document ).scrollTop() - this.dropPositionsOrigin.y; //xxx

                    if ( event.pageX - $( document ).scrollLeft() < o.scrollSensitivity ) {
                        scrolled = $( document ).scrollLeft( $( document ).scrollLeft() - o.scrollSpeed );
                    } else if ( $( window ).width() - (event.pageX - $( document ).scrollLeft()) < o.scrollSensitivity ) {
                        scrolled = $( document ).scrollLeft( $( document ).scrollLeft() + o.scrollSpeed );
                    }
                    deltaX = $( document ).scrollLeft() - this.dropPositionsOrigin.x; //xxx

                }

            }
            // xxx recalc the position??? only if scroll?
            this.positionAbs = this._adjustPositionForScroll();
//      console.log("xxx mouse drag after scroll     " + (this.position.top - this.positionAbs.top) + ", " + (this.position.left - this.positionAbs.left));
//      console.log("xxx mouse drag after scroll top " + this.position.top + ", pagey " + event.pageY);

            // move the helper
            this.helper[0].style.left = this.position.left + "px";
            this.helper[0].style.top = this.position.top + "px";
            this._dragCopyOrMove( event.ctrlKey );

            for ( i = 0; i < this.containers.length; i++ ) {
                container = this.containers[i];
                // first find out which container
                // xxx considers width of helper so it may not actually find what the pointer is over.
                // for example drag region one over right sidebar. Perhaps use intersects with. Adjust width to match current container
                intersection = this._intersectsWithPointer( container, null, deltaX, deltaY );
                if ( !intersection ) {
                    continue;
                }
                containerType = container.type;
                // console.log("xxx over container: " + container.name + ", type: " + containerType);

                /* xxx adjust width of helper if needed
                 if (container !== this.curContainer && this.helperProportions.width > container.width) {
                 // make helper less wide and keep mouse pointer in same relative position
                 wRatio = this.offset.click.left / this.helperProportions.width;
                 this.helper.width(container.width);
                 this.offset.click.left = wRatio * container.width;
                 this._cacheHelperProportions();
                 if(o.containment) {
                 this._setContainment(); // this is based on helper width so update
                 }
                 this.position = this._generatePosition(event);
                 this.positionAbs = this._adjustPositionForScroll();
                 this.helper[0].style.left = this.position.left + "px";
                 this.helper[0].style.top = this.position.top + "px";
                 } */

                // Check if around grid boundaries
                // xxx want to check the grid of the parent as well but no easy way to get from this component to its parent
                if ( containerType === "grid" ) {
                    y = this.positionAbs.top + this.offset.click.top + deltaY;
                    x = this.positionAbs.left + this.offset.click.left + deltaX;
                    for ( r = 0; r < container.rows.length; r++ ) {
                        row = container.rows[r];
                        // if over row edge
                        if ( isOverAxis( y, row.y - o.gridTolerance, o.gridTolerance * 2 ) ) {
                            moved = this._movePlaceholder( container, null, "row", r );
                            break;
                        }
                        // if over row check columns
                        if ( r < container.rows.length - 1 && isOverAxis( y, row.y, container.rows[r + 1].y - row.y ) ) {
                            for ( c = 0; c < row.columns.length; c++ ) {
                                col = row.columns[c];
                                // if over column edge
                                if ( isOverAxis( x, col - o.gridTolerance, o.gridTolerance * 2 ) ) {
                                    moved = this._movePlaceholder( container, null, "column", r, c );
                                    break;
                                }

                            }
                        }
                    }
                }
                if ( moved ) {
                    break;
                }

                // Check which component it is over
                if ( container.items ) {
                    for ( j = 0; j < container.items.length; j++ ) {
                        item = container.items[j];
                        intersection = this._intersectsWithPointer( item, containerType, deltaX, deltaY );
                        if ( !intersection ) {
                            continue;
                        }
                        itemElement = item.element[0];

                        if ( itemElement !== this.dragComponent[0] &&
                            this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement ) {

                            if ( this.options.tolerance === "pointer" || this._intersectsWithSides( item, containerType ) ) {
                                moved = this._movePlaceholder( container, item, intersection === 1 ? "before" : "after" );
                            }
                        }

                        break;
                    }
                }
                if ( moved ) {
                    break;
                }
                if ( container.type !== "grid" ) {
                    moved = this._movePlaceholder( container );
                }
                if ( moved ) {
                    break;
                }
                // the placeholder is fine where it is but may need to update the current container
                if ( container !== this.curContainer ) {
                    this.curContainer = container;
                }
                break;
            }

            this.lastPositionAbs = this.positionAbs;
            return false;

        },

        _mouseStop: function ( event, noPropagation ) { // noPropagation given from draggable
            // remove handler for ESCAPE key to cancel drag
            if ( !noPropagation ) {
                $( "body" ).off( ".glv" );
            }
            this._deactivate();

            if ( this.storedCursor ) {
                $( "body" ).css( "cursor", this.storedCursor );
                this.storedStylesheet.remove();
            }

            if ( !event.target ) {
                this.fromOutside = false;
                this.dragging = false;
                return; // the drag was canceled
            }

            if ( this.options.animate ) {
                var self = this,
                    cur = this.placeholder.offset(),
                    animation = {};

                animation.left = cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollLeft);
                animation.top = cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollTop);
                this.animating = true;
                $( this.helper ).animate( animation, parseInt( this.options.animate, 10 ) || 500, function () {
                    self._finishDrag( event );
                } );
            } else {
                this._finishDrag( event );
            }

            return false;

        },

        // item$ is either the helper or the component so only look at the class
        _initDragTargets: function( item$ ) {
            if ( item$.hasClass( C_PAGE_ITEM ) ) {
                this.targetClass = C_ITEMS;
                this.itemClass = C_PAGE_ITEM;
            } else if ( item$.hasClass( C_REGION ) ) {
                this.targetClass = C_REGIONS;
                this.itemClass = C_REGION;
            } else if ( item$.hasClass( C_BUTTON ) ) {
                this.targetClass = C_BUTTONS;
                this.itemClass = C_BUTTON;
            }
        },

        _dragCopyOrMove: function ( copy ) {
            // Copy doesn't apply when its a draggable being dragged (isOver)
            if ( !this.isOver && this.prevCopy !== copy ) {
                if ( copy ) {
                    this.dragComponent.show();
                    this.helper.find( SEL_DRAG_ACTION ).text( lang.getMessage("GL.DRAG_COPY") );
                } else {
                    this.dragComponent.hide();
                    this.helper.find( SEL_DRAG_ACTION ).text( "" );
                }
                this.prevCopy = copy;
            }
        },

        _cancel: function ( event ) {
            // when cancel from draggable plugin dragging should be false by now
            if ( this.dragging ) {
                this._mouseUp( { target: null } );
                this.dragComponent.show();
                this._select( this.dragComponent, null, true );
            }

            if ( this.placeholder ) {
                // $(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
                if ( this.placeholder[0].parentNode ) {
                    this.placeholder[0].parentNode.removeChild( this.placeholder[0] );
                }
                if ( this.helper && this.helper[0].parentNode ) {
                    this.helper.remove();
                }

                this.helper = null;
                this.dragging = false;
                this.animating = false;
            }
            this._trigger( "stop", event, this._uiHashDnD() );
        },

        /* Be careful with the following core functions */
        _intersectsWith: function ( item ) {
            var x1 = this.positionAbs.left,
                y1 = this.positionAbs.top,
                l = item.left,
                r = l + item.width,
                t = item.top,
                b = t + item.height,
                dyClick = this.offset.click.top,
                dxClick = this.offset.click.left,
                isOverElementHeight = ( this.options.axis === "x" ) || ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
                isOverElementWidth = ( this.options.axis === "y" ) || ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r );

            return isOverElementHeight && isOverElementWidth;
        },

        _intersectsWithPointer: function ( item, type, deltaX, deltaY ) {
            var isOverElementHeight = isOverAxis( this.positionAbs.top + this.offset.click.top + deltaY, item.top, item.height ),
                isOverElementWidth = isOverAxis( this.positionAbs.left + this.offset.click.left + deltaX, item.left, item.width ),
                isOverElement = isOverElementHeight && isOverElementWidth,
                verticalDirection = this._getDragVerticalDirection(),
                horizontalDirection = this._getDragHorizontalDirection();

            if ( !isOverElement ) {
                return false;
            }

            if ( type === "flow" && horizontalDirection ) {
                return ( horizontalDirection === "right" || verticalDirection === "down" ) ? 2 : 1;
            }
            // else
            return ( verticalDirection && verticalDirection === "down" ) ? 2 : 1;
        },

        _intersectsWithSides: function ( item, type ) {

            var isOverBottomHalf = isOverAxis( this.positionAbs.top + this.offset.click.top, item.top + (item.height / 2), item.height ),
                isOverRightHalf = isOverAxis( this.positionAbs.left + this.offset.click.left, item.left + (item.width / 2), item.width ),
                verticalDirection = this._getDragVerticalDirection(),
                horizontalDirection = this._getDragHorizontalDirection();

            if ( type === "flow" && horizontalDirection ) {
                return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
            }
            // else
            return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));

        },

        _getDragVerticalDirection: function () {
            var delta = this.positionAbs.top - this.lastPositionAbs.top;
            return delta !== 0 && (delta > 0 ? "down" : "up");
        },

        _getDragHorizontalDirection: function () {
            var delta = this.positionAbs.left - this.lastPositionAbs.left;
            return delta !== 0 && (delta > 0 ? "right" : "left");
        },

        _initTargetContainers: function () {
            var c,
                self = this,
                targetSel = "." + this.targetClass,
                targets = $( targetSel, this.element ),
                curContainerEl = null;

            if ( this.helper ) {
                targets = targets.not( this.helper.find( targetSel ) );
            }
            if ( this.dragComponent ) {
                targets = targets.not( this.dragComponent.find( targetSel ) );
                curContainerEl = this.dragComponent.closest( targetSel )[0];
            }

            // Mark targets active
            targets.addClass( C_ACTIVE );

            this.containers = [];
            this.curContainer = null;

            targets.each( function () {
                var type, el, itemSel;
                el = $( this );
                if ( el.hasClass( C_GRID ) ) {
                    type = "grid";
                } else if ( el.hasClass( C_STACK ) ) {
                    type = "stack";
                } else if ( el.hasClass( C_FLOW ) ) {
                    type = "flow";
                }
                c = {
                    element: el,
                    type: type,
                    name: $( this ).prev().text(), // xxx debug only
                    width: 0,
                    height: 0,
                    left: 0,
                    top: 0
                };
                self.containers.unshift( c );
                if ( this === curContainerEl ) {
                    self.curContainer = c;
                }
                //
                if ( type === "grid" ) {
                    // a grid doesn't directly contain any items - each cell has a container of items (components)
                    c.rows = [];
                } else {
                    // gather info about each item in the container
                    c.items = [];
                    itemSel = getComponentSelectorForContainer( el );
                    el.children( itemSel ).each( function () {
                        c.items.push( {
                            element: $( this ),
                            name: $( this ).children( "h3" ).text(), // xxx debug only
                            width: 0,
                            height: 0,
                            left: 0,
                            top: 0
                        } );
                    } );
                }
            } );

        },

        _deactivate: function () {
            $( "." + this.targetClass ).removeClass( C_ACTIVE );
        },

        _refreshPositions: function () {
            var i, j, c, ce, p, item, row, row$, col$, sp$;

            function eachColumn() {
                col$ = $( this );
                p = col$.offset();
                row.columns.push( p.left );
            }

            function eachRow() {
                row$ = $( this );
                p = row$.offset();
                row = {y: p.top, columns: []};
                c.rows.push( row );
                row$.children( "td" ).each( eachColumn );
                row.columns.push( p.left + col$.outerWidth() );
            }

            row$ = $();
            for ( i = 0; i < this.containers.length; i++ ) {
                c = this.containers[i];
                ce = c.element;

                c.width = ce.outerWidth();
                c.height = ce.outerHeight();
                p = ce.offset();
                c.left = p.left;
                c.top = p.top;
                if ( c.type === 'grid' ) {
                    // a grid doesn't directly contain any items - each cell has a container of items (components)
                    // mark the edges of rows and columns within each row
                    c.rows = [];
                    ce.children( "tbody" ).children( "tr" ).each( eachRow );
                    c.rows.push( { y: p.top + row$.outerHeight() } );
                } else {
                    // stack or flow container get the position/dimensions of each item
                    for ( j = 0; j < c.items.length; j++ ) {
                        item = c.items[j];
                        ce = item.element;
                        item.width = ce.outerWidth();
                        item.height = ce.outerHeight();
                        p = ce.offset();
                        item.left = p.left;
                        item.top = p.top;
                    }
                }
            }

            // store the position and dimensions of this widget for integration with draggables
            // also store the initial scroll offsets for correct checking during drag
            this.dropPositionsOrigin = { x: 0, y: 0 };
            sp$ = this.element.scrollParent();
            if ( sp$[0] === document ) {
                sp$ = this.element;
            } else {
                this.dropPositionsOrigin = { x: sp$[0].scrollLeft, y: sp$[0].scrollTop };
            }
            p = sp$.offset();
            this.containerCache.left = p.left;
            this.containerCache.top = p.top;
            this.containerCache.width = sp$.outerWidth();
            this.containerCache.height = sp$.outerHeight();

        },

        _createPlaceholder: function ( height ) {
            this.placeholder = $( "<div class='" + C_PLACEHOLDER + "'>&nbsp;</div>" );
            this.dragComponent.after( this.placeholder );
            if ( height ) {
                this.placeholder.height( height );
            }
        },

        _createHelper: function () {
            var o = this.options,
                helper = this.makeHelper();

            // Add the helper to the DOM if that didn't happen already
            if ( !helper.parents( "body" ).length ) {
                $( o.appendTo !== "parent" ? o.appendTo : this.element[0].parentNode )[0].appendChild( helper[0] );
            }

            if ( !helper[0].style.width ) {
//xxx        helper.width(this.dragComponent.width());
            }
            if ( !helper[0].style.height ) {
//xxx        helper.height(this.dragComponent.height());
            }

            return helper;
        },

        _adjustOffsetFromHelper: function ( obj ) {
            if ( "left" in obj ) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ( "right" in obj ) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ( "top" in obj ) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ( "bottom" in obj ) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },

        _getParentOffset: function () {
            //Get the offsetParent and cache its position
            this.offsetParent = this.helper.offsetParent();
            var po = this.offsetParent.offset();

            // This is a special case where we need to modify a offset calculated on start, since the following happened:
            // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
            // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
            //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
            if ( this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] ) ) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }

            // This needs to be actually done for all browsers, since pageX/pageY includes this information
            // with an ugly IE fix
            if ( this.offsetParent[0] === document.body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie) ) {
                po = { top: 0, left: 0 };
            }

            return {
                top: po.top + (parseInt( this.offsetParent.css( "borderTopWidth" ), 10 ) || 0),
                left: po.left + (parseInt( this.offsetParent.css( "borderLeftWidth" ), 10 ) || 0)
            };

        },

        _cacheHelperProportions: function () {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },

        _setContainment: function () {

            var ce, co, over,
                o = this.options;
            if ( o.containment === "parent" ) {
                o.containment = this.helper[0].parentNode;
            }
            if ( o.containment === "document" || o.containment === "window" ) {
                this.containment = [
                    0 - this.offset.parent.left,
                    0 - this.offset.parent.top,
                    $( o.containment === "document" ? document : window ).width() - this.helperProportions.width - this.margins.left,
                    ($( o.containment === "document" ? document : window ).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
                ];
            }

            if ( !(/^(document|window|parent)$/).test( o.containment ) ) {
                ce = $( o.containment )[0];
                co = $( o.containment ).offset();
                over = ($( ce ).css( "overflow" ) !== "hidden");

                this.containment = [
                    co.left + (parseInt( $( ce ).css( "borderLeftWidth" ), 10 ) || 0) + (parseInt( $( ce ).css( "paddingLeft" ), 10 ) || 0) - this.margins.left,
                    co.top + (parseInt( $( ce ).css( "borderTopWidth" ), 10 ) || 0) + (parseInt( $( ce ).css( "paddingTop" ), 10 ) || 0) - this.margins.top,
                    co.left + (over ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth) - (parseInt( $( ce ).css( "borderLeftWidth" ), 10 ) || 0) - (parseInt( $( ce ).css( "paddingRight" ), 10 ) || 0) - this.helperProportions.width - this.margins.left,
                    co.top + (over ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight) - (parseInt( $( ce ).css( "borderTopWidth" ), 10 ) || 0) - (parseInt( $( ce ).css( "paddingBottom" ), 10 ) || 0) - this.helperProportions.height - this.margins.top
                ];
            }

        },

        _generatePosition: function ( event ) {
            var pageX = event.pageX,
                pageY = event.pageY,
                scroll = !(this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] )) ?
                    this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test( scroll[0].tagName );

            /*
             * - Position constraining -
             * Constrain the position to a mix of grid, containment.
             */

            if ( this.originalPosition ) { //If we are not dragging yet, we won't check for options

                if ( this.containment ) {
                    if ( event.pageX - this.offset.click.left < this.containment[0] ) {
                        pageX = this.containment[0] + this.offset.click.left;
                    }
                    if ( event.pageY - this.offset.click.top < this.containment[1] ) {
                        pageY = this.containment[1] + this.offset.click.top;
                    }
                    if ( event.pageX - this.offset.click.left > this.containment[2] ) {
                        pageX = this.containment[2] + this.offset.click.left;
                    }
                    if ( event.pageY - this.offset.click.top > this.containment[3] ) {
                        pageY = this.containment[3] + this.offset.click.top;
                    }
                }

            }

            return {
                top: (
                    pageY - // The absolute mouse position
                        this.offset.click.top - // Click offset (relative to the element)
                        this.offset.parent.top - // The offsetParent's offset without borders (offset + border) // xxx was +
                        ( scrollIsRootNode ? 0 : scroll.scrollTop() )
                    ),
                left: (
                    pageX - // The absolute mouse position
                        this.offset.click.left - // Click offset (relative to the element)
                        this.offset.parent.left - // The offsetParent's offset without borders (offset + border) // xxx was +
                        ( scrollIsRootNode ? 0 : scroll.scrollLeft() )
                    )
            };

        },

        _adjustPositionForScroll: function () {
            var pos = this.position,
                scroll = !(this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] )) ? this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test( scroll[0].tagName );

            return {
                top: (
                    pos.top + // The absolute mouse position
                        this.offset.parent.top - // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollTop() )
                    ),
                left: (
                    pos.left + // The absolute mouse position
                        this.offset.parent.left - // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollLeft() )
                    )
            };

        },

        _makeTempDragComponent: function () {
            var component$, appendTo$,
                out = util.htmlBuilder();

            out.markup( "<div" ).attr( "class", this.itemClass ).markup( "><h3 class='is-draggable'><span>&nbsp;</span></h3></div>" );
            component$ = $( out.toString() );
            appendTo$ = this.element.find( "." + this.targetClass ).not( SEL_GRID ).filter( ":visible" ).first();
            if ( appendTo$.length ) {
                appendTo$.append( component$ );
                this.dragComponent = component$;
                return true;
            }
            return false;
        },

        _movePlaceholder: function ( container, item, place, rowIndex, colIndex ) {
            var td, el, rows$, row$, cols$, count, itemSel, containerClasses,
                tempRow$ = null,
                tempCol$ = null,
                moved = false;

            if ( item ) {
                // moving placeholder next to another item
                el = item.element[0];
//                console.log( "xxx move placeholder to item " + place + ", " + el.id );
                el.parentNode.insertBefore( this.placeholder[0], place === "before" ? el : el.nextSibling );
                moved = true;
            } else {
                itemSel = getComponentSelectorForContainer( container.element );
                containerClasses = getTargetClassesForContainer( container.element );
                if ( container.type === "grid" ) {
                    rows$ = container.element.children( "tbody" ).children( "tr" );
                    if ( place === "row" ) {
                        // Check that adjacent row is not empty
                        if ( rowIndex >= rows$.length ) {
                            count = rows$.last().find( itemSel ).filter( ":visible" ).length;
                        } else {
                            count = rows$.eq( rowIndex ).find( itemSel ).filter( ":visible" ).length;
                            if ( count > 0 && rowIndex > 0 ) {
                                count = rows$.eq( rowIndex - 1 ).find( itemSel ).filter( ":visible" ).length;
                            }
                        }
                        if ( count === 0 ) {
                            return false; // don't add a row next to an empty row
                        }

                        // xxx colspan on td only for fixed grids, set to max xxx where to get max and
                        // what about explicit span on component?
                        tempRow$ = $( "<tr><td><div class='" + C_STACK + " " + containerClasses + "'></div></td></tr>" );
                        if ( rowIndex >= rows$.length ) {
                            rows$.last().after( tempRow$ );
                        } else {
                            rows$.eq( rowIndex ).before( tempRow$ );
                        }
                        tempRow$.find( "div" ).append( this.placeholder[0] );
                        this.containers.unshift( {
                            element: tempRow$.find( "div" ),
                            type: "stack",
                            name: "temp", // xxx debug only
                            items: [],
                            width: 0,
                            height: 0,
                            left: 0,
                            top: 0
                        } );

                        moved = true;
                    } else if ( place === "column" ) {
                        row$ = rows$.eq( rowIndex );
                        cols$ = row$.children( "td" );
                        // Check that adjacent column is not empty
                        if ( colIndex >= cols$.length ) {
                            count = cols$.last().find( itemSel ).filter( ":visible" ).length;
                        } else {
                            count = cols$.eq( colIndex ).find( itemSel ).filter( ":visible" ).length;
                            if ( count > 0 && colIndex > 0 ) {
                                count = cols$.eq( colIndex - 1 ).find( itemSel ).filter( ":visible" ).length;
                            }
                        }
                        if ( count === 0 ) {
                            return false; // don't add a column next to an empty column
                        }

                        // xxx need to redistribute column spans???
                        tempCol$ = $( "<td><div class='" + C_STACK + " " + containerClasses + "'></div></td>" );
                        if ( colIndex >= cols$.length ) {
                            cols$.last().after( tempCol$ );
                        } else {
                            cols$.eq( colIndex ).before( tempCol$ );
                        }
                        tempCol$.find( "div" ).append( this.placeholder[0] );
                        this.containers.unshift( {
                            element: tempCol$.find( "div" ),
                            type: "stack",
                            name: "temp", // xxx debug only
                            items: [],
                            width: 0,
                            height: 0,
                            left: 0,
                            top: 0
                        } );

                        moved = true;
                    }
                } else if ( !container.items || container.items.length === 0 || (container.items.length === 1 && container.items[0].element[0] === this.dragComponent[0]) ) {
                    // move placeholder to an empty stack or flow container
//                    console.log( "xxx move placeholder to empty stack or flow container" );
                    container.element.append( this.placeholder[0] );
                    moved = true;
                }
            }

            if ( container !== this.curContainer ) {
                this.curContainer = container;
            }

            if ( moved ) {
                // cleanup previous rows or columns created just to hold a placeholder
                if ( this.tempGridRow && this.placeholder.closest( this.tempGridRow ).length === 0 ) {
                    this.tempGridRow.remove();
                    this.tempGridRow = null;
                }
                if ( tempRow$ ) {
                    this.tempGridRow = tempRow$;
                }
                if ( this.tempGridColumn && this.placeholder.closest( this.tempGridColumn ).length === 0 ) {
                    this.tempGridColumn.remove();
                    this.tempGridColumn = null;
                }
                if ( tempCol$ ) {
                    this.tempGridColumn = tempCol$;
                }
            }

            if ( moved ) {
                this._refreshPositions(); // recompute after each DOM insertion, NOT on mousemove
            }
            return moved;
        },

        _copyComponent: function ( obj, parent ) {
            var i, a, name, copy,
                newObj = {};

            for ( name in obj ) {
                copy = obj[name];
                if ( name === "displayPoints" ) {
                    a = newObj.displayPoints = [];
                    for ( i = 0; i < obj.displayPoints.length; i++ ) {
                        a.push( this._copyComponent( obj.displayPoints[i], newObj ) );
                    }
                } else if ( name === "components" ) {
                    a = newObj.components = [];
                    for ( i = 0; i < obj.components.length; i++ ) {
                        a.push( this._copyComponent( obj.components[i], newObj ) );
                    }
                } else if ( name === "_parent" ) {
                    newObj._parent = parent;
                } else if ( name.substring( 0, 1 ) !== "_" ) {
                    // skip other internal members (start with underscore) but copy the rest
                    // xxx this doesn't handle any other properties that are objects or arrays - xxx just log warning for now?
                    newObj[name] = copy;
                }
            }
            this.options.updateComponentCopy( newObj, obj );
            return newObj;
        },

        // used by _add and _moveOrCopy
        _insert: function ( changes, newGridSupport, grid, row, column, index, alignment ) {
            var pg, pr, pc, i, nextComp, compIndex,
                pageInfo = this.pageRoot,
                component = changes.component,
                newParentContainer = changes.newParentContainer;

            if ( component.type === "button" ) {
                setProp( changes, component, "alignment", alignment );
                if ( alignment ) {
                    changes.newAlignment = alignment;
                }
            }
            if ( newGridSupport ) {
                // update grid
                if ( index === NEW_GRID || newParentContainer._grids.length === 0 ) {
                    pg = { _parent: newParentContainer, rows: []};
                    newParentContainer._grids.splice( grid, 0, pg );
                    setProp( changes, component, "newGrid", true );
                    changes.newGridInserted = true;
                    index = NEW_ROW;
                } else {
                    setProp( changes, component, "newGrid", false );
                    pg = newParentContainer._grids[grid];
                }
                if ( index === NEW_ROW || row >= pg.rows.length ) {
                    pr = { _parentGrid: pg, columns: [] };
                    pg.rows.splice( row, 0, pr );
                    changes.newRowInserted = true;
                    index = NEW_COLUMN;
                    setProp( changes, component, "newRow", true );
                } else {
                    setProp( changes, component, "newRow", false );
                    pr = pg.rows[row];
                }
                if ( index === NEW_COLUMN ) {
                    // span and col for the column (pc) get adjusted below
                    pc = { _parentRow: pr, span: -1, col: -1, components: [] };
                    pr.columns.splice( column, 0, pc );
                    changes.newColumnInserted = true;
                    index = 0;
                    setProp( changes, component, "newCol", true );
                    if ( column === 0 && !changes.newRowInserted ) {
                        setProp( changes, component, "newRow", true );
                    }
                } else {
                    pc = pr.columns[column];
                    nextComp = pc.components[index];
                    if ( index === 0 ) {
                        setProp( changes, component, "newCol", true );
                        if ( nextComp ) {
                            // if this component is now the first in the cell then move grid settings from previous first to this one
                            setProp( changes, component, "newRow", nextComp.newRow );
                            setProp( changes, component, "newGrid", nextComp.newGrid );
                            setProp( changes, component, "col", nextComp.col );
                            setProp( changes, component, "span", nextComp.span );
                            if ( nextComp.rowSpan !== undefined ) {
                                setProp( changes, component, "rowSpan", nextComp.rowSpan );
                            }
                            setProp( changes, nextComp, "newCol", false );
                            setProp( changes, nextComp, "newRow", false );
                            setProp( changes, nextComp, "newGrid", false );
                            setProp( changes, nextComp, "col", -1 );
                            setProp( changes, nextComp, "span", -1 );
                            if ( nextComp.rowSpan !== undefined ) {
                                setProp( changes, nextComp, "rowSpan", -1 );
                            }
                        }
                    } else {
                        setProp( changes, component, "newCol", false );
                    }
                }
                // if component didn't previously have grid settings add them
                // also if had explicit column set go back to automatic (unless it was set from next component
                // or forced due to a move undo)
                if ( component.col === undefined || ( component.col >= 0 && !( index === 0 && nextComp ) && !component.forceColumn ) ) {
                    setProp( changes, component, "col", -1 );
                }
                delete component.forceColumn; // cleanup hack used to keep existing column on undo move
                if ( component.span === undefined ) {
                    setProp( changes, component, "span", -1 );
                }
                component._parentColumn = pc;
                // index >= 0
                changes.newGrid = grid;
                changes.newRow = row;
                changes.newColumn = column;
                changes.newIndex = index;

                if ( !nextComp && column + 1 < pr.columns.length ) {
                    nextComp = pr.columns[column + 1].components[0];
                    if ( changes.newColumnInserted && column === 0 ) {
                        setProp( changes, nextComp, "newRow", false );
                    }
                }
                if ( !nextComp && row + 1 < pg.rows.length ) {
                    nextComp = pg.rows[row + 1].columns[0].components[0];
                }
                if ( !nextComp && grid + 1 < newParentContainer._grids.length ) {
                    nextComp = newParentContainer._grids[grid + 1].rows[0].columns[0].components[0];
                }
                if ( nextComp ) {
                    compIndex = indexOf( newParentContainer.components, nextComp );
                } else {
                    compIndex = newParentContainer.components.length;
                }
                changes.newComponentIndex = compIndex;
                pc.components.splice( index, 0, component );
                newParentContainer.components.splice( compIndex, 0, component );
                // if there is a next comp that is not in the same column fix up newRow, newCol if needed
                if ( nextComp && nextComp._parentColumn !== component._parentColumn ) {
                    if ( column === 0 && component.newCol ) {
                        setProp( changes, nextComp, "newCol", true ); // just in case because newCol is optional for first column
                    }
                }

                // update grid col spans
                for ( i = 0; i < pr.columns.length; i++ ) {
                    pc = pr.columns[i];
                    pc.col = pc.components[0].col;
                    pc.span = pc.components[0].span || -1;
                }
                if ( pageInfo.gridType === "fixed" && pageInfo.hasColumnSpan ) {
                    setColumnSpansForRow( pr, newParentContainer.maxColumns );
                }
            } else {
                // not a grid
                changes.newIndex = index;
                newParentContainer.components.splice( index, 0, component ); // insert into new container
            }
            component._parent = newParentContainer;
            return index;
        },

        _getTableColumnFromColumn: function( parentContainer, grid, row, column ) {
            var c, curColumn,
                curColIndex = 1,
                tdIndex = 0,
                columns = parentContainer._grids[grid].rows[row].columns;

            // for each column
            for ( c = 0; c <= column && c < columns.length; c++ ) {
                curColumn = columns[c];
                if ( curColumn.col > curColIndex ) {
                    // this is where the grid rendering code would add an extra spacer td
                    tdIndex += 1;
                    curColIndex = curColumn.col;
                }
                curColIndex += curColumn.span > 0 ? curColumn.span : 1;
                tdIndex += 1;
            }
            return tdIndex - 1;
        },

        // used by _add and _moveOrCopy
        _insertInDom: function ( component$, container$, newParentContainer, grid, row, column, index, isNew, alignment ) {
            var i, cell, curCol, newParent$, grid$, row$, col$, columns, targetClasses, domIndex, domColumn,
                pageInfo = this.pageRoot;

            // if component is a button being inserted into a container that has alignment (a button row)
            if ( component$.hasClass( C_BUTTON ) && container$.children( SEL_BTN_ROW ).length ) {
                // use alignment to choose which column to add to
                newParent$ = container$.find( SEL_BTN_ROW ).find( "td" ).eq( alignment === "left" ? 0 : 1 ).children( SEL_LAYOUT );
            } else {
                newParent$ = container$.children( SEL_LAYOUT );
            }
            // if there is a placeholder
            if ( this.placeholder ) {
                // It is much easier to do this because the placeholder is already in the right place
                // and container$, row, column, and index were set correctly from the placeholder
                this.placeholder.before( component$ );
            } else {
                // place the component$ according to the container$, row, column, index
                if ( newParent$.is( SEL_GRID ) ) {
                    targetClasses = getTargetClassesForContainer( container$ );
                    domIndex = index;
                    if ( domIndex < 0 ) {
                        domIndex = 0;
                    }
                    // if new grid and not using the placeholder table
                    if ( index === NEW_GRID && newParentContainer._grids.length > 1 ) {
                        grid$ = $( "<table><tbody></tbody></table>" );
                        insertAt( newParent$.parent(), "table", grid$, grid );
                        index = NEW_ROW;
                        domIndex = 0;
                    } else {
                        grid$ = newParent$.parent().children( "table" ).eq( grid );
                    }
                    // if new row and not using the placeholder row
                    if ( index === NEW_ROW && grid === 0 && newParentContainer._grids[grid].rows.length > 1 ) {
                        cell = "<td><div class='" + C_STACK + " " + targetClasses + "'></div></td>";
                        if ( newParentContainer._grids[grid].rows[row].columns[0].col >= 0 ) {
                            // there needs to be a spacer cell
                            cell = cell + cell;
                        }
                        row$ = $( "<tr>" + cell + "</tr>" );
                        insertAt( grid$.children( "tbody" ), row$, row );
                        domIndex = 0;
                    } else {
                        row$ = grid$.children( "tbody" ).children( "tr" ).eq( row );
                    }
                    // adjust column to be the index of the td.
                    domColumn = this._getTableColumnFromColumn( newParentContainer, grid, row, column );
                    if ( index === NEW_COLUMN ) {
                        if ( newParentContainer._grids[grid].rows[row].columns[column].col >= 0 ) {
                            // there needs to be a spacer cell
                            col$ = $( "<td><div class='" + C_STACK + " " + targetClasses + "'></div></td>" );
                            insertAt( row$, col$, domColumn - 1 );
                        }
                        col$ = $( "<td><div class='" + C_STACK + " " + targetClasses + "'></div></td>" );
                        insertAt( row$, col$, domColumn );
                        domIndex = 0;
                    } else {
                        col$ = row$.children().eq( domColumn );
                    }
                    insertAt( col$.children().eq( 0 ), component$, domIndex );
                } else {
                    insertAt( newParent$, component$, index );
                }
            }

            // adjust colspan if new location is a grid and if needed
            if ( pageInfo.gridType === "fixed" && pageInfo.hasColumnSpan ) {
                if ( newParent$.is( SEL_GRID ) ) {
                    grid$ = newParent$.parent().children( "table" ).eq( grid );
                    row$ = grid$.children( "tbody" ).children( "tr" ).eq( row );
                    columns = newParentContainer._grids[grid].rows[row].columns;
                    i = 0;
                    curCol = 1;
                    row$.children( "td" ).each(function() {
                        if ( columns[i].col > curCol ) {
                            // this must be a spacer cell
                            this.colSpan = columns[i].col - curCol;
                            curCol = columns[i].col;
                        }
                        curCol +=  columns[i].span > 0 ? columns[i].span : 1;
                        if ( $( this ).find( SEL_COMPONENT ).length > 0 ) {
                            this.colSpan = columns[i].span;
                            i += 1;
                        }
                    });
                }
            }
            if ( isNew ) {
                this._showOrHideDisplayPoints( component$ );
            }
        },

        // Internal add method.
        // Returns changes object used in event notification
        _add: function ( component, container$, grid, row, column, index, alignment, component$ ) {
            var newParentContainer, maxColumns, gridSupport,
                isNew = false,
                out = util.htmlBuilder(),
                changes = { container$: container$, propertyChanges: [] };

            changes.newParentContainer = newParentContainer = this._getNode( container$[0] );
            gridSupport = $.isArray( newParentContainer._grids );

            if ( component.displayPoints ) {
                maxColumns = 12; // xxx
                this._layoutDisplayPoints( component.displayPoints, component, gridSupport, maxColumns );
            }

            if ( !component$ ) {
                // make DOM element
                this._renderComponent( out, component, gridSupport );
                component$ = $( out.toString() );
                isNew = true;
            } else {
                this._setNode( component );
                // when reusing saved component need to update its ID to match what the component is now using.
                component$[0].id = this.baseId + component._elementId;
            }
            changes.newComponent$ = component$;
            changes.component = component;

            this._insert( changes, gridSupport, grid, row, column, index, alignment );

            // Move the component in the DOM
            this._insertInDom( changes.newComponent$, container$, newParentContainer, grid, row, column, index, isNew, alignment );

            return changes;

        },

        // Internal remove method.
        // Used to remove a component or cleanup after a move
        // if changes and prevParent$ are given it means a move is being done so just cleanup internal model
        // Returns changes object used in event notification
        _remove: function ( component$, changes, prevParent$ ) {
            var i, tr$, component, pc, pr, pg, nextComp, columns, prevTd$,
                prevParentContainer, prevIndex, prevCompIndex, prevGrid, prevRow, prevColumn, prevIsGrid,
                pageInfo = this.pageRoot,
                self = this,
                fromMove = !!prevParent$;

            changes = changes || { propertyChanges: [] };

            component = this._getNode( component$[0] );
            prevParent$ = prevParent$ || component$.parent();

            if ( !fromMove ) {
                changes.component$ = component$;
                changes.component = component;
                changes.prevContainer$ = component$.closest( SEL_CONTAINER );
                // remove from node map
                delete this.nodeMap[keyFromId( component$[0].id )];
                // including all the children
                component$.find( SEL_COMPONENT ).each( function () {
                    delete self.nodeMap[keyFromId( this.id )];
                } );
                component$.remove();
            } else {
                // when dragging the component is hidden but not when moved method is used
                // so make sure component is hidden so empty cell clean up works
                component$.hide();
            }

            prevIsGrid = prevParent$[0].parentNode.nodeName === "TD" && prevParent$.closest( "table" ).is( SEL_GRID );
            changes.prevParentContainer = prevParentContainer = component._parent;
            changes.prevComponentIndex = prevCompIndex = indexOf( prevParentContainer.components, component );
            changes.prevIndex = changes.prevComponentIndex;

            if ( component.type === "button" ) {
                if ( component.alignment ) {
                    changes.prevAlignment = component.alignment;
                }
            }

            // Cleanup any empty cells, or rows left behind after moving the component but leave one empty cell as drop target
            if ( prevIsGrid && prevParent$.children(":visible").length === 0 ) {
                tr$ = prevParent$.parent().parent();
                if ( tr$.parent().children( "tr" ).length > 1 && tr$.find( SEL_COMPONENT ).filter( ":visible" ).length === 0 ) {
                    tr$.remove();
                } else if ( tr$.children( "td" ).length > 1 ) {
                    prevTd$ = prevParent$.parent().prev().eq(0);
                    prevParent$.parent().remove();
                    // see if there is a spacer cell that needs to be cleaned up
                    if ( prevTd$.find( SEL_COMPONENT ).filter( ":visible" ).length === 0 ) {
                        prevTd$.remove();
                    }
                }
                // xxx what about empty grid. need to remove it even if there is a single placeholder column unless it is the first/only grid
            }

            if ( prevIsGrid ) {
                // previous container was a grid remove from grid cell
                pc = component._parentColumn;
                prevIndex = indexOf( pc.components, component );
                prevGrid = 0; // xxx
                prevRow = indexOf( pc._parentRow._parentGrid.rows, pc._parentRow );
                prevColumn = indexOf( pc._parentRow.columns, pc );
                changes.prevGrid = prevGrid;
                changes.prevRow = prevRow;
                changes.prevColumn = prevColumn;
                changes.prevIndex = prevIndex;

                if ( prevIndex === 0 && pc.components.length > 1 ) {
                    // when removing the first component in a cell move the grid settings to the next one
                    nextComp = pc.components[1];
                    setProp( changes, nextComp, "newGrid", component.newGrid );
                    setProp( changes, nextComp, "newRow", component.newRow );
                    setProp( changes, nextComp, "newCol", component.newCol );
                    setProp( changes, nextComp, "col", component.col );
                    setProp( changes, nextComp, "span", component.span );
                    if ( component.rowSpan ) {
                        setProp( changes, nextComp, "rowSpan", component.rowSpan );
                    }
                }

                pg = prevParentContainer._grids[prevGrid];
                pr = pg.rows[prevRow];
                pc = pr.columns[prevColumn];
                pc.components.splice( prevIndex, 1 );
                if ( pc.components.length === 0 ) {
                    pr.columns.splice( prevColumn, 1 );
                    if ( prevColumn === 0 && pr.columns.length > 0 ) {
                        // when removing the first column move the newRow setting to the next component
                        nextComp = pr.columns[prevColumn].components[0];
                        setProp( changes, nextComp, "newRow", true );
                    }
                    changes.prevColumnRemoved = true;
                    // may need to adjust col span of remaining columns
                    if ( pr.columns.length > 0 ) {
                        if ( pageInfo.gridType === "fixed" && pageInfo.hasColumnSpan ) {
                            // update grid col spans
                            for ( i = 0; i < pr.columns.length; i++ ) {
                                pc = pr.columns[i];
                                pc.col = pc.components[0].col;
                                pc.span = pc.components[0].span || -1;
                            }
                            setColumnSpansForRow( pr, prevParentContainer.maxColumns );
                        }
                        // adjust colspan
                        columns = pr.columns;
                        i = 0;
                        tr$.children( "td" ).each(function() {
                            if ( $( this ).find( SEL_COMPONENT ).length > 0 ) {
                                if ( columns[i].span > 0 ) {
                                    this.colSpan = columns[i].span; // IE does not like colSpan being set to -1
                                }
                                i += 1;
                            }
                        });
                    }
                }
                if ( pr.columns.length === 0 ) {
                    pg.rows.splice( prevRow, 1 );
                    changes.prevRowRemoved = true;
                }
                if ( pg.rows.length === 0 ) {
                    prevParentContainer._grids.splice( prevGrid, 1 );
                    changes.prevGridRemoved = true;
                }
            }
            if ( fromMove ) {
                // if previously hidden show it now
                component$.show();
            }
            prevParentContainer.components.splice( prevCompIndex, 1 ); // remove from prev container
            delete component._parent;
            return changes;
        },

        // Returns changes object used in event notification
        _moveOrCopy: function ( component$, container$, grid, row, column, index, alignment, copy ) {
            var component, prevParent$, newGridSupport,
                newParentContainer, maxColumns,
                isNew = false,
                prevGridSupport = false,
                out = util.htmlBuilder(),
                changes = { container$: container$, propertyChanges: [] };

            component = this._getNode( component$[0] );
            changes.newParentContainer = newParentContainer = this._getNode( container$[0] );
            newGridSupport = $.isArray( newParentContainer._grids );
            changes.prevContainer$ = component$.closest( SEL_CONTAINER );

            if ( copy ) {
                changes.originalComponent = component;
                component = this._copyComponent( component );
                maxColumns = 12; //xxx
                if ( component.displayPoints ) {
                    this._layoutDisplayPoints( component.displayPoints, component, newGridSupport, maxColumns );
                }
                this._renderComponent( out, component, newGridSupport );
                changes.newComponent$ = $( out.toString() ); // can't use component$.clone() because changes are possible
                isNew = true;
            } else {
                prevParent$ = component$.parent();
                prevGridSupport = prevParent$[0].parentNode.nodeName === "TD";
                changes.newComponent$ = component$;
                // when component is a region and prev and new grid support differ then need to relayout and reRender
                if ( component.displayPoints && newGridSupport !== prevGridSupport ) {
                    maxColumns = 12; //xxx
                    this._layoutDisplayPoints( component.displayPoints, component, newGridSupport, maxColumns );
                    this._renderComponent( out, component, newGridSupport );
                    changes.newComponent$ = $( out.toString() ); // can't use component$.clone() because changes are possible
                    isNew = true;
                    component$.remove();
                    // remove from node map
                    delete this.nodeMap[keyFromId( component$[0].id )];
                }

            }
            changes.component = component;

            if ( !copy ) {
                // remove from old position
                this._remove( changes.newComponent$, changes, prevParent$ );
                if ( prevGridSupport && changes.prevParentContainer === changes.newParentContainer ) {
                    // if any columns, rows, or grids were removed update appropriate index
                    if ( changes.prevColumnRemoved && changes.prevColumn < column && row === changes.prevRow ) {
                        column -= 1;
                    }
                    if ( changes.prevRowRemoved && changes.prevRow < row && grid === changes.prevGrid ) {
                        row -= 1;
                    }
                    if ( changes.prevGridRemoved && changes.prevGrid < grid ) {
                        grid -= 1;
                    }
                }
            }
            this._insert( changes, newGridSupport, grid, row, column, index, alignment );

            // Move the component in the DOM
            this._insertInDom( changes.newComponent$, container$, newParentContainer, grid, row, column, index, isNew, alignment );

            return changes;
        },

        _finishDrag: function ( event ) {
            var i, td$, tr$, component, newGrid, newRow, newColumn, newContainer$, newComponent$, newIndex,
                changes, newComponentTypeId,
                alignment, // undefined by default
                copy = event.ctrlKey,
                delayedTriggers = [];

            // Delay all events that have to be triggered to after the point where the placeholder has been removed and
            // everything else normalized again
            this.animating = false;

            if ( this.dragComponent.next()[0] !== this.placeholder[0] || copy || this.fromOutside ) {
                // Only do move if there is an actual change
                newContainer$ = this.placeholder.closest( SEL_CONTAINER );
                newIndex = domIndex( this.placeholder );
                newGrid = null;
                newRow = null;
                newColumn = null;
                if ( newContainer$.children( "table.a-GridLayout-grid" ).length > 0 ) {
                    td$ = this.placeholder.closest( "td" );
                    newColumn = 0;
                    td$.parent().children( "td" ).each( function() {
                        if ( this === td$[0] ) {
                            return false;
                        }
                        if ( $( this ).children( "." + C_STACK ).children().length > 0 ) {
                            newColumn += 1; // only count non empty cells
                        }
                    });
                    tr$ = td$.parent();
                    newRow = domIndex( tr$ );
                    newGrid = newContainer$.children( "table" ).index( tr$.parent().parent() );
                    if ( newIndex === 0 && this.placeholder.parent().children( ":visible" ).length === 1 ) {
                        if ( tr$.parent().children().length === 1 && tr$.children().length === 1 ) {
                            newIndex = NEW_GRID;
                        } else if ( tr$.children().length === 1 ) {
                            newIndex = NEW_ROW;
                        } else {
                            newIndex = NEW_COLUMN;
                        }
                    }
                } else if ( newContainer$.children( "table.a-GridLayout-buttonRow" ).length > 0 ) {
                    td$ = this.placeholder.closest( "td" );
                    if ( domIndex( td$ ) === 0 ) {
                        alignment = "left";
                    } else {
                        alignment = "right";
                    }
                }

                if ( this.fromOutside ) {
                    // get info for new component from helper
                    newComponentTypeId = this.helper.attr( "data-type-id" );
                    component = this.options.makeComponent( newComponentTypeId );
                    this.dragComponent.remove(); // get rid of the temporary drag component
                    changes = this._add( component, newContainer$, newGrid, newRow, newColumn, newIndex, alignment );
                    delayedTriggers.push( function ( event ) {
                        this._trigger( "added", event, changes );
                    } );
                } else {
                    changes = this._moveOrCopy( this.dragComponent,
                        newContainer$, newGrid, newRow, newColumn, newIndex, alignment, copy );
                    delayedTriggers.push( function ( event ) {
                        this._trigger( copy ? "copied" : "moved", event, changes );
                    } );
                }
            }

            if ( changes ) {
                // don't trust the event handlers to leave chanegs alone
                newComponent$ = changes.newComponent$;
            }

            if ( this.fromOutside ) {
                delayedTriggers.push( function ( event ) {
                    this._trigger( "deactivate", event, this._uiHashDnD( this ) );
                } );
            }

            this.dragComponent.show();

            this.dragging = false;
            this.tempGridRow = null;
            this.tempGridColumn = null;

            this._trigger( "beforeStop", event, this._uiHashDnD() );

            //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
            this.placeholder[0].parentNode.removeChild( this.placeholder[0] );
            this.placeholder = null;
            this.helper.remove();
            this.helper = null;

            for ( i = 0; i < delayedTriggers.length; i++ ) {
                delayedTriggers[i].call( this, event );
            } //Trigger all delayed events
            this._trigger( "stop", event, this._uiHashDnD() );

            if ( changes ) {
//                console.log("xxx selection after drop " + newComponent$.length);
                this._select( newComponent$, event, true );
            }

            this.fromOutside = false;
            return true;

        },

        /*
         * General internal methods
         */

        _trigger: function () {
            if ( $.Widget.prototype._trigger.apply( this, arguments ) === false ) {
                this.cancel();
            }
        },

        _uiHashDnD: function ( _inst ) {
            var inst = _inst || this;
            return {
                helper: inst.helper,
                placeholder: inst.placeholder || $( [] ),
                position: inst.position,
                originalPosition: inst.originalPosition,
                offset: inst.positionAbs,
                item: inst.dragComponent,
                sender: _inst ? _inst.element : null
            };
        }

    } );

    $.apex.gridlayout.INDEX = {
        NEW_GRID: NEW_GRID,
        NEW_ROW: NEW_ROW,
        NEW_COLUMN: NEW_COLUMN
    };

    /*
     * Draggable plugin so draggable can work with gridlayout
     */
    $.ui.plugin.add( "draggable", "connectToGridlayout", {
        start: function ( event, ui ) {
            var inst = $( this ).data( "ui-draggable" ),
                o = inst.options,
                uiObj = $.extend( {}, ui, { item: inst.element } );

            // this could be its own plugin but for now combine
            // install handler for ESCAPE key to cancel drag
            $( "body" ).on( "keydown.glvplug", function ( event ) {
                if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
                    inst.dropped = false; // allow revert to happen
                    inst.cancel();
                }
            } );

            inst.grids = [];
            $( o.connectToGridlayout ).each( function () {
                var gridlayout = $.data( this, "apex-gridlayout" );
                if ( gridlayout && !gridlayout.options.disabled ) {
                    inst.grids.push( {
                        instance: gridlayout
                    } );
                    // before a gridlayout can be activated it needs to know what kind of thing is being dragged
                    gridlayout._initDragTargets( ui.helper );
                    gridlayout._initTargetContainers();
                    gridlayout._refreshPositions(); // make sure gridlayout drop information is up to date
                    gridlayout._trigger( "activate", event, uiObj );
                }
            } );

        },
        // If we are still over the gridlayout, we fake the stop event of the gridlayout, but also remove helper
        stop: function ( event, ui ) {
            var uiObj,
                inst = $( this ).data( "ui-draggable" );

            // remove handler for ESCAPE key to cancel drag
            $( "body" ).off( ".glvplug" );

            $.each( inst.grids, function () {
                if ( this.instance.isOver && !this.invalid ) {

                    this.instance.isOver = false;

                    inst.cancelHelperRemoval = true; // Don't remove the helper in the draggable instance

                    if ( !event.target ) {
                        // the drag has been canceled
                        // cancel already faked a mouse up and can't do that twice so call gridlayout stop explicitly
                        this.instance._mouseStop( event, true );
                        // remove the temp drag component before cancel
                        this.instance.dragComponent.remove();
                        this.instance._cancel( event );
                    } else {
                        // Trigger stop on the gridlayout
                        this.instance._mouseStop( event, true );
                    }

                } else {
                    this.instance._deactivate();
                    uiObj = $.extend( {}, ui, { item: inst.element } );
                    this.instance._trigger( "deactivate", event, uiObj );
                }

            } );

        },
        drag: function ( event, ui ) {
            var inst = $( this ).data( "ui-draggable" );

            $.each( inst.grids, function () {
                var intersecting = false;

                if ( this.invalid ) {
                    return;
                }

                // Copy over some variables to allow calling the gridlayout's native _intersectsWith
                this.instance.positionAbs = inst.positionAbs;
                this.instance.helperProportions = inst.helperProportions;
                this.instance.offset.click = inst.offset.click;

                if ( this.instance._intersectsWith( this.instance.containerCache ) ) {
                    intersecting = true;
                }

                if ( intersecting ) {
                    // If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
                    if ( !this.instance.isOver ) {

                        this.instance.isOver = true;
                        // Now we fake the start of dragging for the gridlayout instance, by making a temporary drag component
                        // Also set the helper so it doesn't create a new one
                        if ( !this.instance._makeTempDragComponent() ) {
                            // if it is not possible to create a temp drag component then it is possible to add/drop
                            this.instance.isOver = false;
                            this.invalid = true;
                            return;
                        }

                        this.instance.helper = ui.helper;
                        this.instance.helper.css( "position", "relative" ); // for proper scrollParent detection, it will get put back to absolute by _mouseStart

                        event.target = this.instance.dragComponent.children( "h3" )[0];
                        if ( !this.instance._mouseCapture( event, true ) ) {
                            this.instance.isOver = false;
                            this.invalid = true;
                            return;
                        }

                        this.instance._trigger( "over", event, this.instance._uiHashDnD( this.instance ) );
                        this.instance._mouseStart( event, event, true );

                        // Because the browser event is way off the temp drag component, we modify a couple of variables to reflect the changes
                        this.instance.offset.click.top = inst.offset.click.top;
                        this.instance.offset.click.left = inst.offset.click.left;
                        this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
                        this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

                        inst.dropped = this.instance.element; //draggable revert needs that
                        //hack so receive/update callbacks work (mostly)
                        inst.currentItem = inst.element;
                        this.instance.fromOutside = inst;

                    }

                    // Provided we did all the previous steps, we can fire the drag event of the gridlayout on every draggable drag
                    if ( this.instance.dragComponent ) {
                        this.instance._mouseDrag( event );
                    }

                } else {

                    // If it doesn't intersect with the gridlayout, and it intersected before,
                    // we fake the drag stop of the gridlayout, but make sure it doesn't remove the helper by making it look like a canceled drag
                    if ( this.instance.isOver ) {

                        this.instance.isOver = false;

                        // The out event needs to be triggered independently
                        this.instance._trigger( "out", event, this.instance._uiHashDnD( this.instance ) );

                        event.target = null; // from the perspective of the gridlayout the drag was canceled
                        this.instance._mouseStop( event, true );

                        // cleanup the temp drag component that was created when first dragged over the gridlayout
                        // and any placeholder that may have been created
                        this.instance.dragComponent.remove();
                        if ( this.instance.placeholder ) {
                            this.instance.placeholder.remove();
                        }

                        inst.dropped = false; //draggable revert needs that
                    }

                }

            } );

        }
    } );

})( apex.jQuery, apex.util, apex.debug, apex.lang );

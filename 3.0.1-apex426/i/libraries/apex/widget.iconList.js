/*!
 IconList - a jQuery UI based widget for selecting items (typically icons) arranged in a grid.
 Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * IconList is a ListBox where the items (options) in the list are arranged in a grid; across then down.
 * All the items in the list must be the same size. It follows the WAI-ARIA design patter for a list box with these
 * differences:
 * - Arrow key movement is naturally extended to two dimensions
 * - Ctrl-A is not supported
 *
 * The expected markup (for best accessibility) is a UL (or OL) containing LI elements, however it only depends on a
 * single parent element where all the children are the items. The initially selected item(s) can be indicated by
 * giving the item(s) a class of "is-selected". The contents of the item is mostly of no concern to this widget but
 * typically include an icon and a label. The contents should not overflow (spill outside of) the item. The item
 * content cannot have interactive elements such as inputs. It supports single or multiple selection. It supports
 * context menus and item activation.
 *
 * It also has a navigation mode where the list items are essentially links. A single click on the
 * item will activate it. If the item is or contains an anchor the default behavior for activation is to navigate
 * to the href value. (only one anchor per item is allowed.) When used for navigation the widget should be wrapped in
 * an element with role navigation.
 * For example:
 *     <h2 id="mainNav">Main Site Navigation</h2>
 *     <div role="navigation">
 *       <div id="navList" aria-labelledby="mainNav">
 *           <a href=...>...</a>...
 *       </div>
 *     </div>
 * In this example #navList is element that becomes the iconList widget.
 *
 * For accessibility the iconList should be labeled by using the aria-labelledby attribute to point to an element that
 * contains the label. The widget will append text for screen readers only that indicates the number of rows and columns.
 * For best accessibility when used for navigation the markup should be a div with anchor children as shown in the
 * example above.
 *
 * For accessibility make sure that any images or icons used in the items have a text alternative if appropriate.
 *
 * Like options in a select element the option items can have a value using the data-value attribute.
 *
 * This widget requires some functional CSS.
 *
 * Context Menus:
 * The contextMenuAction option allows you to respond to mouse or keyboard interactions that typically result in a
 * context menu. Specifically Right Mouse click (via contextmenu event), Shift-F10 key (via keydown event) and the
 * Windows context menu key (via contextmenu event). The original event is passed to the contextMenuAction function.
 * The event object can be used to position the menu. If you implement your own menu it is best if you put focus
 * back on the iconList using the iconList focus method when the menu closes (unless the menu action directs focus
 * elsewhere). A simpler alternative that uses the APEX menu widget is to pass in a menu widget options object as the
 * contextMenu option. When the contextMenu option is used the beforeOpen menu callback ui argument has these
 * additional properties:
 *  - menuElement the menu jQuery object
 *  - iconList this iconList jQuery object
 *  - selection a jQuery object with the selected items at the time the menu was opened
 * Also the afterClose callback will automatically focus the iconList if the menu action didn't take the focus and
 * the ui argument has these additional properties:
 *  - menuElement the menu jQuery object
 *  - iconList this iconList jQuery object
 * Only one of contextMenuAction and contextMenu should be specified. The contextMenu option can only be set when the
 * iconList is initialized and it can't be changed. The contextMenuAction cannot be set if the contextMenu option was
 * given when the iconList was created.
 * If using contextMenu option the contextMenuId option can be used to give the menu element an ID. This is useful
 * if other code must refer to the menu element or widget.
 * Note: If using contextMenu option make sure necessary menu and jQuery UI css and js resources are loaded on the page.
 *
 * Other use cases currently out of scope are:
 * - draggable items. This can be accomplished external to this widget
 * - tooltips. This can be accomplished external to this widget.
 * - add/remove/rename item functionality
 * - sortable items
 * - hidden or disabled items
 * - rubber band selection
 * - items with interactive content such as a input field
 *
 * Future:
 *  Consider above use cases
 *  Consider option to get/set number of columns
 *  Consider select by row, column. Consider get row, column for item
 *  Consider getValue(item$) method
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    apex/lang.js
 *    apex/debug.js
 *    apex/navigation.js (for navigation support)
 *    (the following are for context menu integration)
 *    jquery.ui.position.js
 *    apex/widget.menu.js
 */
/*global apex*/
(function ( debug, $, undefined ) {
    "use strict";

    var C_ICON_LIST = "a-IconList",
        C_LIST_ITEM = "a-IconList-item",
        SEL_LIST_ITEM = "." + C_LIST_ITEM,
        C_SELECTED = "is-selected",
        SEL_SELECTED = "." + C_SELECTED,
        C_FOCUSED = "is-focused",
        C_DISABLED = "is-disabled",
        ARIA_SELECTED = "aria-selected",
        ARIA_MULTI = "aria-multiselectable",
        ARIA_LABELLEDBY = "aria-labelledby",
        C_RTL = "u-RTL";

    var keys = $.ui.keyCode,
        gIdCounter = 0;

    function domIndex( el$ ) {
        return el$.parent().children().index( el$ );
    }

    function getItemFocusable( item$ ) {
        var a$ = item$.find("a");
        if ( a$.length ) {
            return a$[0];
        }
        return item$[0];
    }

    $.widget( "apex.iconList", {
        version: "5.0",
        widgetEventPrefix: "iconlist",
        options: {
            multiple: false, // when true multiple items can be selected. Must be false when navigation is true.
            label: true, // selector for finding the label text of an item or true to use the text of the item and false to disable type to search
            navigation: false, // when true changes mode of widget to navigation otherwise the mode is selection. This option can't be changed after create
            contextMenuAction: null, // optional. function( event ) called when a context menu should be displayed
            contextMenu: null, // optional. A menu options object suitable for the APEX menu widget. Only specify one of contextMenu and contextMenuAction.
            contextMenuId: null, // optional. Element id to give the internal context menu. Only applies if contextMenu is given.

            // events:
            // This event is fired when the selection changes. It has no additional data
            selectionChange: null, // function( event )
            // This event is fired when item(s) are activated with enter or double click (single click in navigation mode),
            activate: null // function( event, { values: [] } )
        },
        columns: 0,
        rows: 0,
        forwardKey: keys.RIGHT,
        backwardKey: keys.LEFT,
        searchString: "",
        searchTimerId: null,

        _create: function () {
            var id, label$,
                self = this,
                o = this.options,
                ctrl$ = this.element;

            if ( o.navigation ) {
                o.multiple = false;
            }

            ctrl$.addClass( C_ICON_LIST )
                .attr( "role", "listbox" );

            if ( o.multiple ) {
                ctrl$.attr( ARIA_MULTI, "true" );
            }
            if ( ctrl$.css("direction") === "rtl" ) {
                ctrl$.addClass( C_RTL );
                this.forwardKey = keys.LEFT;
                this.backwardKey = keys.RIGHT;
            }

            if ( !ctrl$.attr( ARIA_LABELLEDBY ) ) {
                this.infoId = ( ctrl$.attr( "id" ) || "il" + (gIdCounter++) ) + "_info";
                ctrl$.before("<span id='" + this.infoId + "' class='u-VisuallyHidden'></span>");
                ctrl$.attr( ARIA_LABELLEDBY, this.infoId );
                this.addedLabel = true;
            } else {
                label$ = $("#" + ctrl$.attr( ARIA_LABELLEDBY ).split( " " ).join( ",#" ) ).last();
                this.infoId = label$.attr( "id" ) + "_info";
                label$.append("<span id='" + this.infoId + "' class='u-VisuallyHidden'></span>");
            }

            if ( o.contextMenu ) {
                if ( $.apex.menu ) {
                    if ( o.contextMenu.menubar ) {
                        throw "IconList contextMenu must not be a menubar";
                    }
                    // augment the menu
                    o.contextMenu._originalBeforeOpen = o.contextMenu.beforeOpen;
                    o.contextMenu.beforeOpen = function( event, ui ) {
                        if ( o.contextMenu._originalBeforeOpen ) {
                            ui.menuElement = self.contextMenu$;
                            ui.iconList = ctrl$;
                            ui.selection = self.getSelection();
                            o.contextMenu._originalBeforeOpen( event, ui );
                        }
                    };
                    o.contextMenu._originalAfterClose = o.contextMenu.afterClose;
                    o.contextMenu.afterClose = function( event, ui ) {
                        if ( o.contextMenu._originalAfterClose ) {
                            ui.menuElement = self.contextMenu$;
                            ui.iconList = ctrl$;
                            o.contextMenu._originalAfterClose( event, ui );
                        }
                        if ( !ui.actionTookFocus ) {
                            self.focus();
                        }
                    };
                    this.contextMenu$ = $( "<div style='display:none'></div>" ).appendTo( "body" );
                    if ( o.contextMenuId ) {
                        this.contextMenu$[0].id = o.contextMenuId;
                    }
                    this.contextMenu$.menu( o.contextMenu );
                    if ( o.contextMenuAction ) {
                        debug.warn("IconList contextMenuAction option ignored when contextMenu option present");
                    }
                    o.contextMenuAction = function( event ) {
                        var target$, pos;

                        if ( event.type === "contextmenu" ) {
                            self.contextMenu$.menu( "toggle", event.pageX, event.pageY );
                        } else {
                            target$ = $( event.target );
                            pos = target$.offset();
                            self.contextMenu$.menu( "toggle", pos.left, pos.top + target$.closest( "a-IconList-item" ).outerHeight() );
                        }
                    };
                } else {
                    debug.warn("IconList contextMenu option ignored because menu widget not preset");
                }
            }

            this._on( this._eventHandlers );

            this.refresh();
            if ( o.disabled ) {
                this._setOption( "disabled", o.disabled );
            }
        },

        _eventHandlers: {
            resize: function( event ) {
                if (event.target !== this.element[0]) {
                    return;
                }
                this._dim();
                event.stopPropagation();
            },
            click: function ( event ) {
                var item$;

                // in navigation mode ignore shift and ctrl click on anchors to let the browser do its thing
                if ( this.options.navigation && $( event.target ).closest( "a" ).length > 0 && (event.shiftKey || event.ctrlKey) ) {
                    return;
                }

                item$ = $( event.target ).closest( SEL_LIST_ITEM );
                if ( item$.length ) {
                    this._select( item$, event, true, false );
                    if ( this.options.navigation ) {
                        this._activate( event );
                    }
                    event.preventDefault();
                }
            },
            dblclick: function ( event ) {
                var item$;
                if ( !this.options.navigation ) {
                    item$ = $( event.target ).closest( SEL_LIST_ITEM );
                    if ( item$.length ) {
                        this._activate( event );
                    }
                }
            },
            mousedown: function ( event ) {
                event.preventDefault(); // this prevents text selection
            },
            keydown: function ( event ) {
                var pos, items$, index,
                    ctrl$ = this.element,
                    next$ = null,
                    kc = event.which;

                if ( kc === keys.HOME ) {
                    next$ = ctrl$.children().first();
                } else if ( kc === keys.END ) {
                    next$ = ctrl$.children().last();
                } else if ( kc === keys.DOWN ) {
                    if ( this.lastFocused ) {
                        pos = this._index2RowCol( domIndex( $( this.lastFocused ).closest( SEL_LIST_ITEM ) ));
                        items$ = ctrl$.children();
                        if ( pos.row < Math.floor( ( items$.length - 1 ) / this.columns ) ) {
                            index = this._rowCol2Index( pos.row + 1, pos.column );
                            if ( index >= items$.length ) {
                                index = items$.length - 1;
                            }
                            next$ = items$.eq( index );
                        }
                    }
                } else if ( kc === keys.UP ) {
                    if ( this.lastFocused ) {
                        pos = this._index2RowCol( domIndex( $( this.lastFocused ).closest( SEL_LIST_ITEM ) ));
                        items$ = ctrl$.children();
                        index = this._rowCol2Index( pos.row - 1, pos.column );
                        if ( index >= 0 ) {
                            next$ = items$.eq( index );
                        }
                        event.stopPropagation(); // Don't let a containing tab or accordion act on Ctrl+Up
                    }
                } else if ( kc === this.backwardKey ) {
                    if ( this.lastFocused ) {
                        next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM ).prev();
                        if ( next$.length === 0 ) {
                            next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM );
                        }
                    }
                } else if ( kc === this.forwardKey ) {
                    if ( this.lastFocused ) {
                        next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM ).next();
                        if ( next$.length === 0 ) {
                            next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM );
                        }
                    }
                } else if ( kc === keys.SPACE ) {
                    if ( this.lastFocused && !this.searchTimerId ) {
                        next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM );
                    }
                } else if ( kc === keys.ENTER ) {
                    // for anchors wait for click event
                    if (  event.target.nodeName !== "A" ) {
                        this._activate( event );
                    }
                } else if ( this.options.contextMenuAction && (event.shiftKey && kc === 121) ) { // shift F10
                    // if target component not selected then select it
                    if ( this.lastFocused && !$( this.lastFocused ).closest( SEL_LIST_ITEM ).hasClass( C_SELECTED ) ) {
                        this._select( $( this.lastFocused ).closest( SEL_LIST_ITEM ), {}, true, false ); // empty event so that selection will be set
                    }
                    this.options.contextMenuAction( event );
                    event.preventDefault();
                }
                if ( next$ ) {
                    this._select( next$, event, true, true );
                    event.preventDefault();
                }
            },
            keypress: function ( event ) {
                var ch, next$,
                    self = this;

                if ( event.which === 0 || !this.options.label ) {
                    return;
                }

                ch = String.fromCharCode( event.which ).toLowerCase();
                if ( this.searchTimerId ) {
                    // a character was typed recently
                    // if it is the same character just look for the next item that starts with the letter
                    if ( ch !== this.searchString ) {
                        // otherwise add to the search string
                        this.searchString += ch;
                    }
                    clearTimeout( this.searchTimerId );
                    this.searchTimerId = null;
                } else {
                    // a character hasn't been typed in a while so search from the beginning
                    if ( ch === " " ) {
                        return;
                    }
                    this.searchString = ch;
                }
                this.searchTimerId = setTimeout( function () {
                    self.searchTimerId = null;
                }, 500 );

                next$ = this._findItem( this.searchString );
                if ( next$ ) {
                    this._select( next$, {}, true, true );
                }
            },
            focusin: function ( event ) {
                var item$ = $( event.target ).closest( SEL_LIST_ITEM );
                if ( item$.length === 0 ) {
                    return;
                }
                item$.addClass( C_FOCUSED );
                this._setFocusable( event.target );
            },
            focusout: function ( event ) {
                var item$ = $( event.target ).closest( SEL_LIST_ITEM );
                item$.removeClass( C_FOCUSED );
            },
            contextmenu: function( event ) {
                var item$,
                    action = this.options.contextMenuAction;

                if ( action ) {
                    // if target component not selected then select it
                    item$ = $( event.target).closest( SEL_LIST_ITEM ).not( SEL_SELECTED );
                    if ( item$.length ) {
                        this._select( item$, {}, true, false ); // force set selection
                    }
                    action( event );
                    event.preventDefault();
                }
            }
        },

        _destroy: function() {
            this.element.removeClass( C_ICON_LIST + " " + C_DISABLED + " " + C_RTL )
                .removeAttr( "role" )
                .removeAttr( ARIA_MULTI )
                .children().removeClass( C_LIST_ITEM )
                    .removeAttr( "role" )
                    .removeAttr( ARIA_SELECTED )
                    .removeAttr( "tabindex");

            this.element.find("a").removeAttr( "tabindex" ).removeAttr( "role" );

            if ( this.contextMenu$ ) {
                this.contextMenu$.remove();
            }
            $( "#" + this.infoId ).remove();
            if ( this.addedLabel ) {
                this.element.removeAttr( ARIA_LABELLEDBY );
            }
        },

        _setOption: function ( key, value ) {
            var o = this.options;

            if ( key === "multiple" ) {
                if ( o.navigation ) {
                    value = false;
                }
            } else if ( key === "contextMenu" || key === "contextMenuId" ) {
                throw "IconList " + key + " cannot be set";
            } else if ( key === "contextMenuAction" && this.options.contextMenu ) {
                throw "IconList contextMenuAction cannot be set when the contextMenu option is used";
            } else if ( key === "navigation" ) {
                throw "IconList navigation option cannot be set";
            }
            this._super( key, value );

            if ( key === "disabled" ) {
                this.element.toggleClass( C_DISABLED, value );
                if ( this.lastFocused ) {
                    if ( value ) {
                        this.lastFocused.tabIndex = -1;
                    } else {
                        this._setFocusable( this.lastFocused );
                    }
                }
                if ( value ) {
                    // when enabling make sure it has the correct dimensions in case it was resized while disabled
                    this._dim();
                }
            } else if ( key === "multiple" ) {
                if ( value ) {
                    this.element.attr( ARIA_MULTI, "true" );
                } else {
                    this.element.removeAttr( ARIA_MULTI );
                }
            }

        },

        /**
         * Call refresh if the contents of the list changes or if the size of the container changes
         */
        refresh: function() {
            var sel$,
                o = this.options,
                ctrl$ = this.element;

            // the focusable items (the options) are either the child items themselves or an anchor if the item has an anchor
            ctrl$.find( "a" ).attr( "tabindex", -1 ).attr( "role", "option" );

            ctrl$.children()
                .addClass( C_LIST_ITEM )
                // if the item has no anchor child then make it focusable and add the option role
                .filter( function() { return $( this ).find( "a" ).length === 0; } )
                    .attr( "role", "option" )
                    .attr( "tabindex", -1 );

            this._dim();

            sel$ = ctrl$.find( SEL_SELECTED + SEL_LIST_ITEM );
            if ( sel$.length > 0 ) {
                this.setSelection(sel$, false);
            } else {
                if ( !this.lastFocused || !$( this.lastFocused ).is(":visible") ) {
                    this.lastFocused = getItemFocusable(ctrl$.children().first());
                }
                this.selectAnchor = this.lastFocused;
                if ( this.lastFocused && !o.disabled ) {
                    this._setFocusable( this.lastFocused );
                }
            }
        },

        focus: function() {
            if ( this.lastFocused ) {
                this.lastFocused.focus();
            }
        },

        getSelection: function() {
            return this.element.find( SEL_SELECTED );
        },

        getSelectionValues: function() {
            var values = [];

            this.element.find( SEL_SELECTED ).each( function() {
                values.push( $( this ).attr( "data-value" ) );
            });
            return values;
        },

        setSelection: function( items$, focus ) {
            focus = !!focus;
            this._select( items$, null, focus, false, true );
        },

        _rowCol2Index: function( row, column ) {
            return row * this.columns + column;
        },

        _index2RowCol: function( index ) {
            var row = Math.floor( index / this.columns );
            return { row: Math.floor( index / this.columns ), column: index - ( row * this.columns ) };
        },

        _dim: function() {
            var y, label,
                self = this,
                ctrl$ = this.element,
                length = ctrl$.children().length;

            if ( length ) {
                y = ctrl$.children().first().position().top;
            }

            self.columns = length;
            ctrl$.children().each( function( index ) {
                var top = $( this ).position().top;
                if ( top > y ) {
                    y = top;
                    self.columns = index;
                    return false;
                }
            });
            if ( length > 0 ) {
                self.rows = Math.floor( ( length + self.columns - 1 ) / self.columns ) ;
            } else {
                self.rows = 0;
            }
            label = apex.lang.formatMessage("APEX.ICON_LIST.GRID_DIM", self.columns, self.rows);
            $( "#" + this.infoId ).text( label );
        },

        _findItem: function( search ) {
            var text, next$, start$,
                slen = search.length,
                labelSelector = this.options.label;

            next$ = start$ = $( this.lastFocused ).closest( SEL_LIST_ITEM );
            if ( slen === 1 ) {
                next$ = next$.next();
            }
            if ( next$.length === 0 ) {
                next$ = this.element.children().first();
            }
            while ( next$.length > 0 ) {
                if ( labelSelector === true ) {
                    text = next$.text();
                } else {
                    text = next$.find( labelSelector ).text();
                }
                if ( text.substring(0, slen).toLowerCase() === search ) {
                    return next$;
                }
                next$ = next$.next();
                if ( next$.length === 0 ) {
                    next$ = this.element.children().first();
                }
                if ( next$[0] === start$[0] ) {
                    break;
                }
            }
            return null;
        },

        _setFocusable: function ( el ) {
            if ( this.lastFocused && this.lastFocused !== el ) {
                this.lastFocused.tabIndex = -1;
            }
            el.tabIndex = 0;
            this.lastFocused = el;
        },

        _activate: function ( event ) {
            var sel$, href;

            this._trigger( "activate", event, { values: this.getSelectionValues() } );
            if ( this.options.navigation && !event.isDefaultPrevented() ) {

                sel$ = this.getSelection();
                href = sel$.attr( "href" ) || sel$.find( "a" ).attr( "href" );
                if ( href ) {
                    event.preventDefault();
                    apex.navigation.redirect( href );
                }
            }
        },

        _select: function ( items$, event, focus, delayTrigger, noNotify ) {
            var prevSelected, offset, sp, spOffset, glOffset, start, end, temp, toFocus,
                action = "set",
                self = this,
                prevSel$ = this.element.find( SEL_SELECTED );

            // can't select something that isn't visible
            items$ = items$.filter( ":visible" );

            if ( event && this.options.multiple ) {
                if ( event.type === "click" ) {
                    // control+click for Windows and command+click for Mac
                    if ( event.ctrlKey || event.metaKey ) {
                        action = "toggle";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                } else if ( event.type === "keydown" ) {
                    // Mac has no concept of toggle with the keyboard
                    if ( event.keyCode === $.ui.keyCode.SPACE ) {
                        if ( event.ctrlKey ) {
                            action = "toggle";
                        } else if ( event.shiftKey ) {
                            action = "range";
                        } else {
                            action = "add";
                        }
                    } else if ( event.ctrlKey ) {
                        action = "none";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                }
            }

            if ( action === "range" && !this.selectAnchor ) {
                action = "set"; // when there is no anchor turn range selection into set
            }

            // clear out previous selection if needed
            if ( action === "set" || action === "range" ) {
                prevSel$.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED );
            }

            // perform selection action
            prevSelected = items$.hasClass( C_SELECTED );
            if ( action === "set" ||  action === "add" || (action === "toggle" && !prevSelected) ) {
                items$.addClass( C_SELECTED ).attr( ARIA_SELECTED, true );
                this.selectAnchor = items$[0];
            } else if ( action === "range" ) {
                this.element.children().removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED );
                start = domIndex( $( this.selectAnchor));
                end = domIndex( items$.last() );
                if ( start > end ) {
                    temp = end;
                    end = start;
                    start = temp;
                }
                this.element.children().filter(function(index) {
                    return index >= start && index <= end;
                } ).addClass( C_SELECTED ).attr( ARIA_SELECTED, true );
            } else if ( action === "toggle" && prevSelected ) {
                items$.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED );
                this.selectAnchor = items$[0];
            }

            // focus if needed
            if ( items$.length > 0 ) {
                toFocus = getItemFocusable( items$.first() );
                if ( focus ) {
                    toFocus.tabIndex = 0;
                    toFocus.focus();
                } else {
                    this._setFocusable( toFocus );
                }
                // scroll into view if needed
                sp = this.element.scrollParent();
                spOffset = sp.offset();
                if ( spOffset ) {
                    glOffset = this.element.offset();
                    offset = items$.first().offset();
                    // Don't use scrollIntoView because it applies to all potentially scrollable ancestors, we only
                    // want to scroll within the immediate scroll parent.
                    // Chrome scrolls parents other than the immediate scroll parent even though it seems that it shouldn't
                    if ( ( offset.top < spOffset.top ) || ( offset.top > spOffset.top + sp[0].offsetHeight ) ) {
                        sp[0].scrollTop = offset.top - glOffset.top;
                    }
                    if ( ( offset.left + items$[0].offsetWidth < spOffset.left ) || ( offset.left > spOffset.left + sp[0].offsetWidth ) )  {
                        sp[0].scrollLeft = offset.left - glOffset.left;
                    }
                }
            }

            // don't fire selection change for click events when in navigation mode
            if ( noNotify || ( this.options.navigation && event.type === "click" ) ) {
                return;
            }

            // notify if needed
            if ( action === "toggle" ||
                (action === "range" && !prevSelected) ||
                (action === "add" && !prevSelected) ||
                (action === "set" && (prevSel$[0] !== items$[0] || prevSel$.length !== items$.length)) ) {
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
        }

    });

})( apex.debug, apex.jQuery );

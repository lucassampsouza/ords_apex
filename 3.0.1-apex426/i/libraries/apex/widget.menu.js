/*!
 UI widget for menus including menu bars, popup menus and menu items.
 Copyright (c) 2009, 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * A jQuery UI widget that implements either a popup menu or menu bar. The menu bar and menu implementation
 * roughly follows the Oracle RCUX guidelines as well as the WAI-ARIA menu and menu bar design pattern.
 * A popup menu is typically opened in response to a contextmenu key/click or right click or a button press event
 * external to this widget.
 *
 * Notable differences follow:
 * - Does not support access keys for menu bar menu items.
 * - Does not support tear-off/floating sub menus.
 * - Menu items do not support tooltips.
 * - Extension to allow split menu bar items. A split item has a label and a drop down icon. Clicking on
 *   the label will navigate or perform an action. Clicking on the icon will open the menu.
 *   This is to accommodate existing APEX builder menu behavior.
 * - Extension to allow a menu bar item to be styled as current. This allows the menu bar to act similar to
 *   a tab set. It is useful when the menu bar is primarily used for navigation. This is to accommodate existing
 *   APEX builder menu behavior. Note the menu is still a menu and not a tab control for the purpose of UI interaction
 *   and accessibility.
 *
 * The menu widget options object is a recursive menu structure.
 *
 * The options object has these properties:
 *   menubar: <bool> If true the widget is a menu bar otherwise the widget is a single popup menu
 *   menubarShowSubMenuIcon: <bool> Ignored unless this is a menubar. If true menu sub menu items will have a down arrow
 *       icon added. The default is false unless the menubar has a mix of action and sub menu items. This does not
 *       affect split menu items which always show a down arrow with a divider
 *   menubarOverflow: <bool> If true the menubar will respond to window size changes by moving menu bar items that
 *       don't fit on to an overflow menu. This only applies if menubar is true.
 *   iconType: <css-name> default icon type for all items. The default is "a-Icon".
 *   behaveLikeTabs: <bool> If true menu bar items can have a current property to indicate the item is
 *     associated with the current "page".
 *   tabBehavior: <string> One of NONE, NEXT, EXIT (default is EXIT)
 *      EXIT: tab or shift tab exit (and close) the menu and focus moves to the next (previous) tab stop relative to
 *          the item that launched the menu. Not valid for popup menus because they don't have an launch element
 *          This follows the DHTML Style guide recommendation
 *      NEXT: tab and shift tab work like the Down and Up keys
 *      NONE: the tab key does nothing. This is most like normal desktop menus
 *   useLinks: <bool> If true action menu items with href property are rendered with an anchor element.
 *      This allows some non-menu behavior that is expected of links (middle or right mouse click, and shift and ctrl key modifiers on click or Enter)
 *      The default is true. Set to false if menu is mainly for functions and you want a more desktop experience.
 *   items: [<menuItem>...] An array of menuItem objects.
 *      Only action and subMenu item types are allowed at the menu bar level
 *   slide: <bool> If true menus will slide down when opened otherwise they are shown all at once
 *   firstItemIsDefault: For popup/context menus only. If true the first menu item gets an extra class to indicate it is
 *      the default choice. The menu widget is not responsible for implementing any default behavior.
 *   customContent: Only for popup/context menus or sub menus of a menu bar. This is true, false or an element id. See
 *      below for details about custom content.
 *      If false it is a normal menu with items (or menu markup); there is no custom content. The default is false.
 *      If true the content of the menu element is the custom markup.
 *      If the value is a string then it is the id of an element that contains the custom content. The custom content
 *      element is moved to be the only child of the menu (or sub menu) element. This is useful for menu bar sub menus
 *      where true would not work.
 *
 * The menuItem object is one of the following forms (discriminated by the type property):
 *   { type: "separator" }
 *   { type: "subMenu", label: <text>, iconType: <css-name>, icon: <css-name>, menu: <menu>, disabled: <bool-or-fn> }
 *   { type: "toggle", label: <text>, accelerator: <text>, set: <fn>, get: <fn>, onLabel: <text>, offLabel: <text>, disabled: <bool-or-fn> }
 *   { type: "action", label: <text>, accelerator: <text>, href: <url>, action: <fn>, iconType: <css-name>, icon: <name>, disabled: <bool-or-fn> }
 *   { type: "radioGroup", set: <fn>, get: <fn>, choices: [
 *     { label: <text>, value: <string>, disabled: <bool-or-fn> },...
 *   ] }
 *
 * All menu items can have an id property. The id is only used to find the item by id.
 * All menu items can have a hide property. The value is true or false or a function returning true or false. If true the item is ignored.
 * The value for iconType and icon are css class names. There needs to be corresponding css rules to select a particular icon.
 * The iconType on action and subMenu items overrides the iconType set in the options object.
 * For toggle menu items only one of label or (onLabel and offLabel) is used. If both are present label is used.
 * As an alternative to label (or onLabel, offLabel) you can specify labelKey (or onLabelKey, offLabelKey) and
 * the apex.lang.getMessage function will be used each time the menu is rendered to lookup the label text. The localized
 * label text is stored in the normal label/onLabel/offLabel property.
 * For action menu items only one of href or action is used. If both are present action is used.
 * The action function is called in the context of the menuItem. The widget options object is passed as the first
 * argument. The second argument is the element that focus would normally return to when the menu closes (or null if none).
 * The action should return true if it will take responsibility for setting the focus.
 * The set functions receive a single argument which is the value of the checkbox (true/false) or radio button.
 * The get functions must return the value of the checkbox (true/false) or radio button.
 * The disabled property can either be true or false or a function that return true or false. The function
 * is called in the context of the menuItem. The widget options object is passed as the first argument.
 * When menubar is true and only for menu bar menu items the subMenu item can have action or href properties.
 * In this case it is a split menu item - it can either drop down the sub menu or perform the action/navigation
 * depending on where it is clicked or what key is entered.
 * When menubar is true and behaveLikeTabs is true a current property is allowed.
 * If a sub menu item has current true the "current" state bubbles up to the parent menubar item.
 * If current is true the menu item can be styled in a special way to indicate that the menu item is "current".
 * The menu widget is only responsible for showing the accelerator text in the menu item. It does not implement
 * the keyboard handling. See below for apex.actions integration.
 * The menu object contains these properties:
 *   items: [<menuItem>...] An array of menuItem objects.
 *
 * There is also an item type: "display" that is used internally for custom markup menus. It is similar to an action
 * that has no action which makes it similar to disabled but the intention is different and so should be the visual presentation.
 *
 * Rules for custom menu content:
 * - The custom menus are flat - they have no sub menus
 * - Toggle and radio items are not supported
 * - An element with class 'a-Menu-content' should be the top level element or near the top.
 *   It is added if needed.
 * - Any elements matching this selector "a, button, .a-Menu-label" will be a menu item and can receive focus.
 *   The class 'a-Menu-item' is added if the element or one of its ancestors doesn't already have the
 *   menu item class. The element is given a tabindex=-1 if needed. The class 'a-Menu-label' is added if
 *   the focusable element doesn't already have that class or contain an element with that class.
 *   Note: for best accessibility all perceivable information should be a menu item.
 * - Menu item label elements (these are the elements that receive focus) are given the role 'menuitem'
 * - The menu item element is given an id.
 * - The menu item element can have attribute data-id just like menus from markup
 *
 * Menu Button "widget":
 * There is also support for easily associating a menu with a button such that clicking the button toggles the specified
 * menu. To associate a button with a menu given it a class of js-menuButton and a data attribute, data-menu, with the
 * menu id to open as the value. When the menu is open the button will have the is-active class added and it will be removed
 * when the menu closes. Example:
 *     <button type="button" data-menu="myMenu" class="js-menuButton">Menu</button>
 * Note: If the button is dynamically added after the page loads you need to include button attributes
 * aria-haspopup="true" and aria-expanded="false" for property accessibility.
 *
 * Integration with apex.actions
 * For menu items of type action or toggle, if the action property is a string it is the name of an action (Note: in
 * this case only, the toggle type supports the action property). Values for label, icon, iconType, disabled, and
 * accelerator are taken from the action (accelerator is taken from the action shortcut property).
 * It is possible to override action values such as label and icon by specifying them in the menu item.
 * See apex.actions for more details.
 *
 * Menus from markup:
 * A simple menu or menubar can be created from markup. Expected markup:
 * An element with a ul child. The ul has one or more li elements each one representing an action.
 * The li element can have either an "a" or span element.
 * Menu item property   Comes from
 * id                   li[data-id]
 * label                a or span content
 * href                 a[href] If href value is "separator" then the type is separator and the href and label are ignored
 * hide                 true iff li[data-hide=true]
 * disabled             true iff li[data-disabled=true]
 * current              true iff li[data-current=true]
 * icon                 li[data-icon] if the value has a space the icon is the word after the space otherwise it is the whole value
 * iconType             li[data-icon] if the value has a space the type is the word before the space
 *
 * The type is "action" unless there is no "a" or span child (no label) or href = "separator" or if the item is a sub menu.
 * The type is sub menu if the li has a ul child. The sub menu is processed recursively. If the type is action and there
 * is an id and the apex.actions object exists and there is an action with the name equal to the id value then the menu
 * item is associated with the action. The attribute data-custom="true" can be used with a menubar item to create a
 * custom markup menu. The custom markup gos under the list element (li) and must start with an element that has class
 * 'a-Menu-content'.
 *
 * Note the markup is removed once the element is turned into a menu and is not restored even if the widget is destroyed.
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.position.js
 *    apex/util.js
 *    apex/debug.js
 *    apex/lang.js
 *    apex/navigation.js
 *    apex/actions.js (optional)
 *    apex/tooltipManager.js (optional)
 *    Strings:
 *      APEX.MENU.OVERFLOW_LABEL
 *      APEX.PROCESSING TODO change this to APEX.MENU.PROCESSING
 *      TODO add APEX.MENU.CURRENT_MENU
 */
/*global window,apex,menuManager,placeMenu */
(function ( util, debug, lang, $, undefined ) {
    "use strict";

    var currentMenu = null,
        currentMenuBar = null,
        currentIsRtl = false,
        menuLauncher = null,
        actionTookFocus = false,
        actionTaken = false,
        menuStack = [],
        menuLayoutDone = [],
        isTracking = false,
        keepTracking = false,
        originalX = null,
        originalY = null,
        lastMouseX = 0,
        lastMouseY = 0,
        lastTrackingMouseX = 0,
        lastTrackingMouseY = 0,
        subMenuDelayID = null,
        subMenuCloseDelayID = null,
        closeDelayMenu = null,
        lastMenu = null,
        lastItem = null;

    var C_MENUBAR = "a-MenuBar",
        SEL_MENUBAR = ".a-MenuBar",
        C_MENUBAR_TABS = "a-MenuBar--tabs",
        C_MENU = "a-Menu",
        SEL_MENU = ".a-Menu",
        C_MENU_TOP = "a-Menu--top",
        C_MENU_CONTENT = "a-Menu-content",
        SEL_MENU_CONTENT = "." + C_MENU_CONTENT,
        C_MENU_SCROLL = "a-Menu-scroll",
        SEL_MENU_SCROLL = ".a-Menu-scroll",
        C_MENU_SCROLL_BTN = "a-Menu-scrollBtn",
        SEL_MENU_SCROLL_BTN = ".a-Menu-scrollBtn",
        C_MENU_SCROLLABLE = "a-Menu--scrollable",
        C_UP = "a-Menu-scrollBtn--up",
        C_DOWN = "a-Menu-scrollBtn--down",
        C_ICON_SCROLL_UP = "icon-menu-scroll-up",
        C_ICON_SCROLL_DOWN = "icon-menu-scroll-down",
        C_ITEM = "a-Menu-item",
        SEL_MENU_ITEM = "." + C_ITEM,
        SEL_ITEM = ".a-Menu-item, .a-MenuBar-item",
        SEL_ITEM_INNER = ".a-Menu-inner",
        SEL_ITEM_IN_MENU = ".a-Menu-item, .a-MenuBar-item, .a-Menu-content", // a-Menu-content is there to keep from selecting something in parent menu when using parents or closest
        SEL_ITEM_OR_BTN = SEL_ITEM_IN_MENU + ", " + SEL_MENU_SCROLL_BTN,
        C_ITEM_DEFAULT = "a-Menu-item--default",
        C_BAR_ITEM = "a-MenuBar-item",
        C_BAR_OVERFLOW = "a-MenuBar-item--overflow",
        C_OVERFLOW = "a-MenuBar--overflow",
        C_STATUS_COL = "a-Menu-statusCol",
        C_LABEL = "a-Menu-label",
        C_ACCEL = "a-Menu-accel",
        C_BAR_LABEL = "a-MenuBar-label",
        SEL_LABEL = ".a-Menu-label",
        SEL_MENUITEM_LABEL = ".a-Menu-label,.a-MenuBar-label",
        C_SUBMENU_COL = "a-Menu-subMenuCol",
        SEL_SUBMENU_COL = ".a-Menu-subMenuCol",
        C_SPLIT_MENU = "a-Menu--split",
        C_CURRENT_MENU = "a-Menu--current",
        C_HSEP = "a-Menu-hSeparator",
        C_ITEM_SEP = "a-Menu-itemSep",
        SEL_ITEM_SEP = ".a-Menu-itemSep",
        C_DISABLED = "is-disabled",
        C_FOCUSED = "is-focused",
        C_ACTIVE = "is-active",
        SEL_FOCUSED = ".is-focused",
        SEL_FOCUSABLE = "a, button, .a-Menu-label, .a-MenuBar-label",
        C_EXPANDED = "is-expanded",
        SEL_EXPANDED = ".is-expanded",
        C_DEFAULT_ICON_TYPE= "a-Icon",
        SEL_MENUBUTTON = "button.js-menuButton",
        C_RTL = "u-RTL",
        A_EXPANDED = "aria-expanded",
        A_DISABLED = "aria-disabled",
        A_HASPOPUP = "aria-haspopup",
        A_CHECKED = "aria-checked",
        A_OWNS = "aria-owns";

    var keys = $.ui.keyCode;

    function renderIcon( out, iconType, iconName ) {
        out.markup( "<span" ).attr( "class", iconType + " " + iconName ).markup( "></span>" );
    }

    function menuResize() {
        var i, $menu, $item, x, y;

        if ( menuLauncher ) {
            x = $( menuLauncher );
            y = null;
        } else {
            x = originalX;
            y = originalY;
        }
        placeMenu( { $menu: menuStack[0], subMenu: false, x: x, y: y, slide: false } );
        for ( i = 1; i < menuStack.length; i++ ) {
            $menu = menuStack[i];
            $item = $menu.parents( SEL_ITEM ).eq( 0 );
            placeMenu( { $menu: $menu, subMenu: true, x: $item, slide: false } );
        }
    }

    function menubarResize() {
        $( SEL_MENUBAR ).each( function() {
            $( this ).menu("resize");
        } );
    }

    $( document ).ready( function() {
        // this fires after the user is done (or at least paused) resizing the window
        $( window ).on( "apexwindowresized", function () {
            menubarResize();
            if ( isTracking ) {
                menuResize();
            }
        } );
    });

    function startTrackingMenus() {
        if ( isTracking ) {
            return;
        }
        isTracking = true;
        $( window ).on( "blur.menuTracking", function() {
            menuManager.closeAll( true );
        } );
        $( "html" ).on( "mousedown.menuTracking", function( e ) {
            var $target = $( e.target );
            if ( $target.closest( SEL_MENU ).length === 0 && ( !menuLauncher || $target.closest( menuLauncher ).length === 0 )) {
                menuManager.closeAll( true);
            }
        } ).on( "mousemove.menuTracking", function( e ) {
            var $target, menu;

            if ( lastTrackingMouseX === e.pageX && lastTrackingMouseY === e.pageY ) {
                return;
            }
            lastTrackingMouseX = e.pageX;
            lastTrackingMouseY = e.pageY;
            $target = $( e.target );

            menu = $target.parents( SEL_MENU )[0];
            if ( !menu && currentMenuBar ) {
                menu = $target.parent( SEL_MENUBAR )[0];
            }
            if ( !menu && lastMenu && lastMenu !== menu ) {
                $( lastMenu ).focus();
            }
            lastMenu = menu;
        } );

        if ( apex.tooltipManager ) {
            apex.tooltipManager.disableTooltips();
        }
    }

    function stopTrackingMenus() {
        $( window ).off( ".menuTracking" );
        $( "html" ).off( ".menuTracking" );
        isTracking = false;
        if ( apex.tooltipManager ) {
            apex.tooltipManager.enableTooltips();
        }
    }

    function getMenuScrollParent( $menu ) {
        return $menu.children().children( SEL_MENU_SCROLL );
    }

    /**
     * @param o Options object with properties:
     * $menu - the menu to position, layout, and show
     * subMenu - optional true if menu is a sub menu
     * x - page x to display menu at or element to place menu under
     * y - optional page y to display menu at
     * slide - optional if true menu will slide down
     * focus - optional if true set focus to menu
     * minWidth - minWidth for the menu
     */
    function placeMenu( o ) {
        var out, menuh, maxMenuHeight, scale, itemHeight,
            $menu = o.$menu,
            posInfo = {},
            isVisible = $menu.css( "display" ) !== "none";

        if ( !isVisible ) {
            $menu.css( {
                display: "block",
                position: "absolute",
                top: -99999,
                left: 0
            } );
        }
        if ( o.minWidth ) {
            $menu.css( "min-width", o.minWidth );
        }

        // Don't scroll a custom menu
        if ( $menu.attr( "data-custom" ) !== "true" ) {
            itemHeight = $menu.find( "li" ).first().outerHeight();
            maxMenuHeight = $( window ).height();
            if ( maxMenuHeight > 1000 ) {
                scale = 0.60;
            } else if ( maxMenuHeight > 500 ) {
                scale = 0.75;
            } else {
                scale = 0.90;
            }
            maxMenuHeight = Math.floor( maxMenuHeight * scale / itemHeight ) * itemHeight - itemHeight;

            menuh = $menu.height();

            if ( menuh > maxMenuHeight ) {
                if ( getMenuScrollParent( $menu ).length === 0 ) {
                    out = util.htmlBuilder();
                    out.markup("<div" ).attr( "class", C_MENU_SCROLL_BTN + "  " + C_UP ).markup( ">" );
                    renderIcon( out, C_DEFAULT_ICON_TYPE, C_ICON_SCROLL_UP );
                    out.markup("</div>");
                    $menu.children().first().addClass( C_MENU_SCROLLABLE )
                        .prepend( out.toString() )
                        .append( out.toString().replace( C_ICON_SCROLL_UP, C_ICON_SCROLL_DOWN ).replace( C_UP, C_DOWN ) )
                        .children( "ul" ).first().wrap("<div class='" + C_MENU_SCROLL + "'></div>");
                }
                getMenuScrollParent( $menu ).height( maxMenuHeight )[0].scrollTop = 0;
                $menu.find( SEL_MENU_SCROLL_BTN + "." + C_UP ).addClass( C_DISABLED );
            } else {
                if ( getMenuScrollParent( $menu ).length > 0 ) {
                    $menu.children().first().removeClass( C_MENU_SCROLLABLE ).children( SEL_MENU_SCROLL_BTN ).remove();
                    $menu.find( "ul" ).first().unwrap();
                }
            }
        }

        if ( typeof o.x === "number" && typeof o.y === "number" ) {
            originalX = o.x;
            originalY = o.y;
            posInfo.of = $.Event("click", {pageX: originalX, pageY: originalY});
        } else {
            originalX = originalY = null;
            posInfo.of = o.x;
        }

        if ( !currentIsRtl ) {
            if ( o.subMenu ) {
                // default to right top aligned
                posInfo.my = "left top";
                posInfo.at = "right top";
            } else {
                // default to under start aligned
                posInfo.my = "left top";
                posInfo.at = "left bottom";
            }
        } else {
            if ( o.subMenu ) {
                posInfo.my = "right top";
                posInfo.at = "left top";
            } else {
                posInfo.my = "right top";
                posInfo.at = "right bottom";
            }
        }
        posInfo.collision = "flipfit flipfit";
        $menu.position( posInfo );
        $menu.css( "display", isVisible ? "block" : "none");

        if ( !isVisible ) {
            if ( o.slide ) {
                $menu.slideDown( 200 );
            } else {
                $menu.show();
            }
            if ( o.focus ) {
                $menu.focus();
            }
        }
    }

    var menuManager = {
        openMenu: function ( $menu, $menuBar, x, y, slide, focus ) {
            var minWidth = 0;

            this.closeAll();
            currentMenu = $menu[0];
            currentMenuBar = $menuBar ? $menuBar[0] : null;
            currentIsRtl = $( currentMenuBar || currentMenu ).hasClass( C_RTL );

            if ( typeof x === "object" && x.get ) {
                menuLauncher = x[0];
            } else {
                menuLauncher = null;
            }
            actionTookFocus = false;
            actionTaken = false;

            keepTracking = true;
            if ( menuStack.length === 0 ) {
                startTrackingMenus();
            }
            menuStack.push( $menu );
            keepTracking = false;
            menuLayoutDone = [];
            if ( $menuBar ) {
                // x is the menu bar item parent of this menu
                x.addClass( C_EXPANDED )
                    .children( SEL_MENUITEM_LABEL ).attr( A_EXPANDED, "true" );
                minWidth = x.outerWidth();
            }
            placeMenu( { $menu: $menu, subMenu: false, x: x, y: y, slide: slide, focus: focus, minWidth: minWidth } );
        },

        isCurrentMenu: function ( menu ) {
            return currentMenu && currentMenu === menu;
        },

        isCurrentMenuBar: function ( menubar ) {
            return currentMenuBar && currentMenuBar === menubar;
        },

        openSubMenu: function ( $item, $menu, menuBarItem, slide, focus ) {
            this.closeOpenSiblings( $item, menuBarItem );
            menuStack.push( $menu );
            placeMenu( { $menu: $menu, subMenu: true, x: $item, slide: slide, focus: focus } );
            $item.addClass( C_EXPANDED ).children( SEL_ITEM_INNER )
                .find( SEL_MENUITEM_LABEL ).attr( A_EXPANDED, "true" );
        },

        closeOpenSiblings: function ( $item, menuBarItem ) {
            var $openSubMenu = $item.parent().find( SEL_EXPANDED );
            if ( menuBarItem ) {
                keepTracking = true;
            }
            while ( $openSubMenu.length > 0 ) {
                this.closeLast( false );
                $openSubMenu = $item.parent().find( SEL_EXPANDED );
            }
            keepTracking = false;
        },

        closeLast: function ( focus ) {
            var $menu, $item, $label, $menuLauncher;
            if ( menuStack.length > 0 ) {
                $menu = menuStack.pop();

                $item = $menu.parents( SEL_ITEM ).eq( 0 );
                if ( $item.length > 0 ) {
                    $label = getItemLabel( $item );
                    $item.removeClass( C_EXPANDED ).children( SEL_ITEM_INNER );
                    $label.attr( A_EXPANDED, "false" );
                    if ( focus ) {
                        $item.find( SEL_FOCUSABLE ).eq( 0 ).focus();
                    }
                }
                $menu.hide();
                if ( menuStack.length === 0 ) {
                    // return focus to where it was before menu was opened
                    if ( menuLauncher && !actionTookFocus && !keepTracking ) {
                        setTimeout( function() {
                            $menuLauncher = $( menuLauncher );
                            if ( $menuLauncher.is( SEL_ITEM ) ) {
                                $menuLauncher.find( SEL_FOCUSABLE ).focus();
                            } else {
                                $menuLauncher.focus();
                            }
                        }, 10);
                    }
                    if ( currentMenuBar ) {
                        $label = getItemLabel( $( currentMenu ).find( SEL_EXPANDED ) );
                        $( currentMenu ).find( SEL_EXPANDED ).removeClass( C_EXPANDED );
                        $label.attr( A_EXPANDED, "false" );
                    }
                    if ( currentMenuBar || currentMenu ) {
                        $( currentMenuBar || currentMenu ).data( "apex-menu" )._trigger( "afterClose", {}, {
                            actionTookFocus: actionTookFocus,
                            actionTaken: actionTaken,
                            launcher: menuLauncher
                        } );
                    }
                    currentMenu = null;
                    if ( !keepTracking ) {
                        currentMenuBar = null;
                        stopTrackingMenus();
                    }
                }
            } else {
                currentMenu = null;
                currentMenuBar = null;
                stopTrackingMenus();
            }
        },

        closeAll: function ( force ) {
            while ( menuStack.length > 0 ) {
                this.closeLast( false );
            }
            if ( force ) {
                currentMenu = null;
                currentMenuBar = null;
                stopTrackingMenus();
            }
        }
    };

    function itemIsMenuBarItem( $item ) {
        return $item.parent().parent().hasClass( C_MENUBAR );
    }

    function findItemById( menu, id ) {
        var theItem = null;
        $.each( menu.items, function ( i, item ) {
            if ( item.id === id ) {
                theItem = item;
                return false;
            }
            if ( item.type === "subMenu" ) {
                theItem = findItemById( item.menu, id );
                if ( theItem !== null ) {
                    return false;
                }
            }
        } );
        return theItem;
    }

    function getChoiceFromId( id ) {
        var choice = null,
            index = id.search( /_c[0-9]+$/ );

        if ( index >= 0 ) {
            choice = id.substring( index + 2 ) * 1;
        }
        return choice;
    }

    // delay is optional and only applies for type action. See comment before invokeItem in keydown space key handeling
    function invokeItem( item, choice, menuOptions, typeOverride, delay ) {
        var value,
            isAction = false,
            type = typeOverride || item.type;

        function doAction() {
            if ( typeof item.action === "string" && apex.actions ) {
                debug.info("Invoke action menu item '" + ( item.label || apex.actions.lookup( item.action ).label ) + "'");
                actionTookFocus = apex.actions.invoke( item.action, {}, menuLauncher ) || false;
            } else {
                debug.info("Invoke action menu item '" + item.label + "'");
                if ( item.action ) {
                    actionTookFocus = item.action( menuOptions, menuLauncher ) || false;
                } else if ( item.href ) {
                    apex.navigation.redirect( item.href );
                    actionTookFocus = true;
                }
            }
        }

        try {
            if ( type === "toggle" ) {
                if ( typeof item.action === "string" && apex.actions ) {
                    item = apex.actions.lookup( item.action );
                    isAction = true;
                }
                value = !item.get();
                debug.info("Invoke toggle menu item '" + ( item.label || (value ? item.onLabel : item.offLabel )) + "' value now " + value);
                item.set( value );
                if ( isAction ) {
                    apex.actions.update( item.name );
                }
                actionTaken = true;
            } else if ( type === "radioGroup" ) {
                value = item.choices[choice].value;
                debug.info("Invoke choice menu item '" + item.choices[choice].label + "' value now " + value);
                item.set( value );
                actionTaken = true;
            } else if ( type === "action" ) {
                if ( delay ) {
                    setTimeout(function() {
                        doAction();
                    }, 210 );
                } else {
                    doAction();
                }
                actionTaken = true;
            } else if ( type === "subMenu" ) {
                return false;
            }
        } catch ( ex ) {
            // ignore error so menu closes
            debug.error("Error in menu action.", ex );
        }
        return true;
    }

    function descendentIsCurrent( item, clear ) {
        var i, curItem;

        if ( item.menu && item.menu.items ) {
            for ( i = 0; i < item.menu.items.length; i++ ) {
                curItem = item.menu.items[i];
                if ( curItem.current || descendentIsCurrent( curItem, clear ) ) {
                    if ( clear && curItem.current ) {
                        delete curItem.current;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    function getLabelFromMessage( item ) {
        if ( item.labelKey ) {
            item.label = lang.getMessage( item.labelKey );
        }
        if ( item.onLabelKey ) {
            item.onLabel = lang.getMessage( item.onLabelKey );
        }
        if ( item.offLabelKey ) {
            item.offLabel = lang.getMessage( item.offLabelKey );
        }
    }

    function setItemFocus( item$ ) {
        if ( item$.is( SEL_FOCUSABLE ) ) {
            // for a custom menu the item itself could be focusable
            item$.focus();
        } else {
            item$.find( SEL_FOCUSABLE ).first().focus();
        }
    }

    function getItemsForMenu( menu$ ) {
        var parentItem, items$;

        parentItem = menu$.closest( SEL_MENU_ITEM )[0];
        items$ = menu$.find( SEL_MENU_ITEM ).not(function(index, element) {
            var p = $( element ).parent().closest( SEL_MENU_ITEM )[0];
            // exclude items from sub menus
            return p !== parentItem;
        });
        return items$;
    }

    function getItemLabel( item$ ) {
        var label$ = item$.children( SEL_MENUITEM_LABEL );
        if ( label$.length === 0 ) {
            label$ = item$.children( SEL_ITEM_INNER ).find( SEL_MENUITEM_LABEL );
        }
        return label$;
    }

    $.widget( "apex.menu", {
        version: "5.0",
        widgetEventPrefix: "menu",
        options: {
            menubar: false,
            menubarShowSubMenuIcon: null, // default is true if menubar has mix of actions and sub menus and false otherwise
            menubarOverflow: false, // if true create overflow list for menubar items that don't fit
            iconType: C_DEFAULT_ICON_TYPE,
            behaveLikeTabs: false,
            tabBehavior: "EXIT", // one of NONE, NEXT, EXIT. NONE ignores tabs, EXIT will exit the menu providing menuLauncher is defined, NEXT works like Up/Down but doesn't wrap
            useLinks: true,
            slide: false,
            firstItemIsDefault: false,
            items: null,
            idPrefix: null,
            customContent: false,
            asyncFetchMenu: null, // function( menu, callback(bool). This function starts the async process to
                                  // fetch the menu items and when done assigns the menu.items array and calls callback.
                                  // The callback takes an optional bool input parameter that is false
                                  // to indicate that the menu items could not be fetched.
            // callbacks/events
            beforeOpen: null, // beforeOpen: function( event, { menu: menuBeingOpened }) event is always {}
            afterClose: null  // afterClose: function( event, { actionTookFocus: bool, actionTaken: bool, launcher: el }) event is always {}
                              // In all cases the menu has been closed. In all most all cases the action has already taken place.
                              // There is an exception for anchor menu items invoked with the space key where actionTaken is reporting on the future
                              // and actionTookFocus is false when the action may take focus when it happens.
        },
        isActive: false,
        scrollTimerId: null,
        forwardKey: keys.RIGHT,
        backwardKey: keys.LEFT,

        _create: function () {
            var i, wheelEvent,
                o = this.options,
                $ctrl = this.element;

            if ( o.menubar && o.customContent ) {
                throw "Menubar cannot have custom content";
            }
            // the test for true is necessary because customContent can also be a string id which is also truthy
            if ( !o.items && o.customContent !== true ) {
                o.items = this._parseMenuMarkup( $ctrl, o.menubar ).items;
            }
            // A menubar must have items in order to be rendered
            // For a popup menu the items may not be known at this time but still must have at least one.
            // It can be a dummy item as long as there are real items by the time the menu is opened
            if ( ( o.menubar || ( !o.customContent && !o.asyncFetchMenu ) ) && (!o.items || o.items.length === 0 ) ) {
                debug.error( "Menu has no menu items" );
            }

            if ( $ctrl.css("direction") === "rtl" ) {
                $ctrl.addClass( C_RTL );
                if ( !o.menubar ) {
                    // make sure menu has desired direction even when moved to end of body
                    $ctrl.attr( "dir", "rtl" );
                }
                this.forwardKey = keys.LEFT;
                this.backwardKey = keys.RIGHT;
            }

            $ctrl.attr( "tabindex", -1 )
                .attr( "role", o.menubar ? "menubar" : "menu" )
                .addClass( o.menubar ? C_MENUBAR : C_MENU );
            if ( o.menubar ) {
                if ( o.menubarOverflow ) {
                    $ctrl.addClass( C_OVERFLOW );
                }
                if ( o.menubarShowSubMenuIcon === null ) {
                    // figure out the default
                    o.menubarShowSubMenuIcon = false; // assume all menubar items are menus
                    for ( i = 0; i < o.items.length; i++ ) {
                        if ( o.items[i].type !== "subMenu" ) {
                            o.menubarShowSubMenuIcon = true; // at least one item is an action
                            break;
                        }
                    }
                }
                this.refresh();
                if ( o.behaveLikeTabs ) {
                    $ctrl.addClass( C_MENUBAR_TABS );
                }
                if ( o.firstItemIsDefault ) {
                    debug.warn( "Invalid options for menu bar ignored" );
                }
            } else {
                // Move menu to end of body to avoid being cut off by some parent with overflow hidden
                $( "body" ).append( $ctrl );
                $ctrl.hide();
                if ( o.menubarOverflow || o.menubarShowSubMenuIcon || o.behaveLikeTabs ) {
                    debug.warn( "Invalid options for popup menu ignored" );
                }
            }

            // Modern browsers support "wheel", check wheel because only need to do this once for all instances
            if ( !("onwheel" in $ctrl[0]) && this._eventHandlers.wheel) {
                if ( document.onmousewheel !== undefined ) {
                    wheelEvent = "mousewheel"; // Webkit and IE support at least "mousewheel"
                } else {
                    wheelEvent = "DOMMouseScroll"; // otherwise assume that remaining browsers are older Firefox
                }
                // move the event handler
                this._eventHandlers[wheelEvent] = this._eventHandlers.wheel;
                delete this._eventHandlers.wheel;
            }

            this._on( this._eventHandlers );

        },

        _eventHandlers: {
            mousedown: function ( e ) {
                var item, id, onDropDown, $target;

                // ignore middle and right mouse button down and also shift and ctrl
                if ( e.which !== 1 || e.shiftKey || e.ctrlKey ) { // using which is the jQuery way
                    return;
                }

                $target = $( e.target ).closest( SEL_ITEM_OR_BTN  );
                e.preventDefault();
                // if there is a target that is not disabled and is a menubar item
                if ( $target.length > 0 && !$target.hasClass( C_MENU_CONTENT ) && !$target.hasClass( C_DISABLED ) ) {
                    if ( $target.is( SEL_MENU_SCROLL_BTN ) ) {
                        $target.addClass( C_ACTIVE );
                        this._startScrolling( $target.closest( SEL_MENU ), $target.hasClass( C_UP ) );
                    } else if ( itemIsMenuBarItem( $target ) ) {
                        id = $target[0].id;
                        item = this._getMenuItemFromId( id );
                        if ( item.type === "subMenu" ) {
                            onDropDown = $( e.target ).closest( SEL_SUBMENU_COL ).length !== 0;
                            if (onDropDown || !(item.action || item.href)) {
                                this.toggle( $target );
                            }
                        }
                    }
                }
            },

            mouseup: function ( e ) {
                var item, choice, id, isMenuBarItem, type, onDropDown, $target;

                // ignore middle and right mouse button up and also shift and ctrl
                if ( e.which !== 1 || e.shiftKey || e.ctrlKey ) { // using which is the jQuery way
                    return;
                }

                $target = $( e.target ).closest( SEL_ITEM_IN_MENU );
                e.preventDefault();
                if ( $target.length > 0 && !$target.hasClass( C_MENU_CONTENT ) ) {
                    id = $target[0].id;
                    item = this._getMenuItemFromId( id );
                    type = item.type;
                    isMenuBarItem = itemIsMenuBarItem( $target );
                    if ( type === "subMenu" && isMenuBarItem ) {
                        onDropDown = $( e.target ).closest( SEL_SUBMENU_COL ).length !== 0;
                        if (!onDropDown && (item.action || item.href)) {
                            type = "action";
                            menuManager.closeOpenSiblings( $target, isMenuBarItem );
                        }
                    }
                    if ( !(type === "subMenu" && isMenuBarItem) && $target.is( SEL_ITEM ) &&
                         !$target.hasClass( C_DISABLED ) && type !== "display" ) {
                        choice = getChoiceFromId( id );
                        if ( invokeItem( item, choice, this.options, type ) ) {
                            menuManager.closeAll();
                        }
                    }
                }
            },

            click: function ( e ) {
                var $target, id, item, choice;

                // ignore shift and ctrl click on anchors to let the browser do its thing
                if ( e.target.nodeName === "A" && (e.which !== 1 || e.shiftKey || e.ctrlKey) ) {
                    this.keyboardActivate = false;
                    return;
                }

                /*
                 * Generally all behavior is done on mouseup and not click however it is important
                 * to handle invoking menu items from the keyboard on click and not mouse down because:
                 * - there are some browser specific issues such as on chrome if the action is an alert and it is invoked with space then the alert is dismissed
                 *   or in Firefox space on toggle items reopens the menu
                 * - if the action opens a popup window, doing the open from keydown triggers popup blockers
                 */
                e.preventDefault(); // skip click because mouseup does all the work
                if ( this.keyboardActivate ) {
                    this.keyboardActivate = false;
                    $target = $( e.target ).closest( SEL_ITEM_IN_MENU );
                    if ( $target.length > 0 && !$target.hasClass( C_MENU_CONTENT ) ) {
                        id = $target[0].id;
                        item = this._getMenuItemFromId( id );
                        // already know this is something to invoke
                        if ( $target.is( SEL_ITEM ) && !$target.hasClass( C_DISABLED ) ) {
                            choice = getChoiceFromId( id );
                            if ( invokeItem( item, choice, this.options, item.type === "subMenu" ? "action" : item.type ) ) {
                                menuManager.closeAll();
                            }
                        }
                    }

                }
            },

            mousemove: function ( e ) {
                var isMenuBarItem, $target, $item, $menu,
                    self = this;

                function checkDelayClose() {
                    var $expanded = $item.parent().find( SEL_EXPANDED );

                    if ( $expanded.length > 0 && !subMenuCloseDelayID ) {
                        $expanded.removeClass( C_EXPANDED ); // remove it now so that it doesn't look like two items are focused
                        closeDelayMenu = $expanded.find( SEL_MENU )[0];
                        subMenuCloseDelayID = setTimeout( function() {
                            $expanded.addClass( C_EXPANDED ); // restore expanded state for proper close function
                            subMenuCloseDelayID = null;
                            closeDelayMenu = null;
                            menuManager.closeOpenSiblings( $item, isMenuBarItem );
                        }, 250 );
                    }
                }

                if ( lastMouseX === e.pageX && lastMouseY === e.pageY ) {
                    return;
                }

                lastMouseX = e.pageX;
                lastMouseY = e.pageY;
                $target = $( e.target );

                if ( subMenuCloseDelayID && $target.closest( SEL_MENU )[0] === closeDelayMenu ) {
                    $( closeDelayMenu ).parent().addClass( C_EXPANDED ); // restore expanded state
                    closeDelayMenu = null;
                    clearTimeout( subMenuCloseDelayID );
                    subMenuCloseDelayID = null;
                }

                $item = $target.closest( SEL_ITEM_SEP );
                if ( $item.length > 0 && $item[0] !== lastItem ) {
                    if ( subMenuDelayID ) {
                        clearTimeout( subMenuDelayID );
                        subMenuDelayID = null;
                    }
                    isMenuBarItem = itemIsMenuBarItem( $item );
                    checkDelayClose();
                    lastItem = $item[0];

                    $menu = $target.closest( SEL_MENU ).eq( 0 );
                    if ( $menu.length > 0 && !$menu.hasClass( C_FOCUSED ) ) {
                        $menu.focus();
                    }
                    return;
                }

                $item = $target.closest( SEL_ITEM );
                if ( $item.length > 0 ) {
                    if ( !$item.hasClass( C_FOCUSED ) && getItemLabel( $item ).attr( A_EXPANDED ) !== "true" ) {
                        if ( subMenuDelayID ) {
                            clearTimeout( subMenuDelayID );
                            subMenuDelayID = null;
                        }
                        isMenuBarItem = itemIsMenuBarItem( $item );
                        if ( isMenuBarItem && isTracking ) {
                            clearTimeout( subMenuCloseDelayID );
                            subMenuCloseDelayID = null;
                            menuManager.closeOpenSiblings( $item, isMenuBarItem );
                        } else {
                            checkDelayClose();
                        }
                        if ( this.options.menubar && !menuManager.isCurrentMenuBar( this.element[0] ) && !this.isActive ) {
                            // if not tracking menubar don't set focus just make it look like it
                            this.element.find( SEL_FOCUSED ).removeClass( C_FOCUSED );
                            $item.addClass( C_FOCUSED );
                            return;
                        } else {
                            setItemFocus( $item );
                        }
                        if ( !$item.hasClass( C_DISABLED ) && $item.find( SEL_MENU ).length > 0 && getItemLabel( $item ).attr( A_EXPANDED ) !== "true" ) {
                            if ( isMenuBarItem ) {
                                if ( menuManager.isCurrentMenuBar( this.element[0] ) ) {
                                    this.open( $item );
                                }
                            } else {
                                subMenuDelayID = setTimeout( function () {
                                    subMenuDelayID = null;
                                    menuManager.openSubMenu( $item, $item.children( SEL_MENU ).first(), isMenuBarItem, self.options.slide, true );
                                }, 300 );
                            }
                        }
                    }
                    lastItem = $item[0];
                } else {
                    // if not over an item or separator it could be empty space of a custom content menu
                    // remove the focus from previous item
                    $target.closest( SEL_MENU ).first().focus();
                }
            },

            mouseleave: function( e ) {
                if ( subMenuDelayID ) {
                    clearTimeout( subMenuDelayID );
                    subMenuDelayID = null;
                }

                if ( this.options.menubar ) {
                    // if a menu bar menu is not open and the menu bar doesn't have focus (active)
                    if ( !menuManager.isCurrentMenuBar( this.element[0] ) && !this.isActive ) {
                        // remove the fake focused
                        this.element.find( SEL_FOCUSED ).removeClass( C_FOCUSED );
                    }
                }
            },

            wheel: function( e ) {
                var sp,
                    $menu = $( e.target ).closest( SEL_MENU ),
                    deltaY = e.originalEvent.deltaY || e.originalEvent.detail || ( - 1/40 * e.originalEvent.wheelDelta);

                if ( $menu.length ) {
                    e.preventDefault();
                    sp = getMenuScrollParent( $menu )[0];
                    if ( !sp ) {
                        return;
                    }

                    if ( e.originalEvent.deltaMode === undefined || e.originalEvent.deltaMode === 1 ) {
                        deltaY = deltaY * 30;
                    }
                    sp.scrollTop += deltaY;
                    this._checkScrollBounds( $menu, sp );
                }
            },

            keydown: function ( e ) {
                var cur$, items$, menu$, next$, $ctrl, isMenuBarItem, sp, thisMenu$, index, tabbable$,
                    id, item, type, choice, tabBehavior,
                    self = this,
                    kc = e.which;

                function moveNext( noWrap ) {
                    var i;

                    if ( cur$.hasClass( C_MENU ) ) {
                        next$ = cur$.find( SEL_MENU_CONTENT ).first().find( SEL_ITEM ).first();
                    } else {
                        i = items$.index( cur$ );
                        i += 1;
                        if ( i >= items$.length ) {
                            if ( noWrap ) {
                                return false;
                            }
                            i = 0;
                        }
                        next$ = items$.eq( i );
                    }
                    setItemFocus( next$ );
                    cur$ = next$;
                    if ( sp ) {
                        self._checkScrollBounds( thisMenu$, sp );
                    }
                    return true;
                }

                function movePrev( noWrap ) {
                    var i;

                    if ( cur$.hasClass( C_MENU ) ) {
                        next$ = cur$.find( SEL_MENU_CONTENT ).first().find( SEL_ITEM ).last();
                    } else {
                        i = items$.index( cur$ );
                        i -= 1;
                        if ( i < 0 ) {
                            if ( noWrap ) {
                                return false;
                            }
                            i = items$.length - 1;
                        }
                        next$ = items$.eq( i );
                    }
                    setItemFocus( next$ );
                    cur$ = next$;
                    if ( sp ) {
                        self._checkScrollBounds( thisMenu$, sp );
                    }
                    return true;
                }

                function openMenu() {
                    self.toggle( cur$ );
                    if ( cur$.hasClass( C_SPLIT_MENU ) ) {
                        cur$.find( SEL_FOCUSABLE ).eq( 0 ).focus();
                    } else {
                        next$ = cur$.find( SEL_MENU_CONTENT ).first().find( SEL_ITEM ).first();
                        setItemFocus( next$ );
                    }
                }

                if ( e.altKey ) {
                    return;
                }
                $ctrl = this.element;
                this.keyboardActivate = false;

                if ( $ctrl.hasClass( C_FOCUSED ) ) {
                    cur$ = $ctrl;
                    $ctrl.find( SEL_EXPANDED ).first().each(function() {
                        cur$ = $( this );
                    });
                } else {
                    cur$ = $ctrl.find( SEL_FOCUSED );
                }
                thisMenu$ = cur$.closest( SEL_MENU + "," + SEL_MENUBAR );
                sp = getMenuScrollParent( thisMenu$ )[0];
                isMenuBarItem = cur$.is( SEL_MENUBAR ) || itemIsMenuBarItem( cur$ );
                if ( isMenuBarItem ) {
                    items$ = $ctrl.find( "." + C_BAR_ITEM );
                } else {
                    items$ = getItemsForMenu( thisMenu$ );
                }

                if ( kc === keys.UP || kc === keys.DOWN) {
                    if ( isMenuBarItem ) {
                        if ( cur$.children( SEL_MENU ).length > 0 && !cur$.hasClass( C_DISABLED) ) {
                            if ( cur$.hasClass( C_SPLIT_MENU ) && menuManager.isCurrentMenu( cur$.children( SEL_MENU)[0] ) ) {
                                // special case for split menu buttons because they leave focus on the menu item
                                next$ = cur$.find( "ul" ).first().children( SEL_ITEM ).first();
                                next$.find( SEL_FOCUSABLE ).focus();
                            } else {
                                openMenu();
                            }
                        }
                    } else {
                        if ( kc === keys.UP ) {
                            movePrev();
                        } else {
                            moveNext();
                        }
                    }
                    e.preventDefault();
                } else if ( kc === this.forwardKey ) {
                    if ( isMenuBarItem ) {
                        moveNext();
                        menuManager.closeOpenSiblings( cur$, true );
                        if ( menuManager.isCurrentMenuBar( $ctrl[0] ) &&
                            cur$.children( SEL_MENU ).length > 0 && !cur$.hasClass( C_DISABLED ) ) {
                            openMenu();
                        }
                    } else {
                        next$ = cur$.children( SEL_MENU );
                        if ( next$.length > 0 && !cur$.hasClass( C_DISABLED )) {
                            menuManager.openSubMenu( cur$, next$, false, this.options.slide, false );
                            next$ = next$.find( "ul" ).first().children( SEL_ITEM ).first();
                            setItemFocus( next$ );
                        } else if ( this.options.menubar ) {
                            cur$ = $ctrl.find ( SEL_EXPANDED ).eq( 0 );
                            items$ = $ctrl.find( "." + C_BAR_ITEM );
                            moveNext();
                            menuManager.closeOpenSiblings( cur$, itemIsMenuBarItem( cur$ ) );
                            if ( cur$.children( SEL_MENU ).length > 0 && !cur$.hasClass( C_DISABLED ) ) {
                                openMenu();
                            }
                        }
                    }
                    e.preventDefault();
                } else if ( kc === self.backwardKey ) {
                    if ( isMenuBarItem ) {
                        movePrev();
                        menuManager.closeOpenSiblings( cur$, true );
                        if ( menuManager.isCurrentMenuBar( self.element[0] ) &&
                            cur$.children( SEL_MENU ).length > 0 && !cur$.hasClass( C_DISABLED )) {
                            openMenu();
                        }
                    } else {
                        next$ = cur$.parents( SEL_ITEM ).eq( 0 );
                        if ( next$.length > 0 && !itemIsMenuBarItem( next$ ) ) {
                            menuManager.closeLast( true );
                        } else if ( this.options.menubar ) {
                            cur$ = $ctrl.find ( SEL_EXPANDED ).eq( 0 );
                            items$ = $ctrl.find( "." + C_BAR_ITEM );
                            movePrev();
                            menuManager.closeOpenSiblings( cur$, itemIsMenuBarItem( cur$ ) );
                            if ( cur$.children( SEL_MENU ).length > 0 && !cur$.hasClass( C_DISABLED ) ) {
                                openMenu();
                            }
                        }
                    }
                    e.preventDefault();
                } else if ( kc === keys.TAB  ) {
                    if ( !isMenuBarItem ) {
                        tabBehavior = this.options.tabBehavior;
                        if ( tabBehavior === "NEXT" ) {
                            if ( e.shiftKey ) {
                                if (! movePrev( true ) ) { // don't wrap - exit
                                    tabBehavior = "EXIT";
                                }
                            } else {
                                if (! moveNext( true ) ) { // don't wrap - exit
                                    tabBehavior = "EXIT";
                                }
                            }
                        }
                        if ( tabBehavior === "EXIT" && menuLauncher ) {
                            actionTookFocus = true; // lie about this so that closing the menus doesn't set the focus back to the button
                            menuManager.closeAll();
                            tabbable$ = $(":tabbable");
                            if ( this.options.menubar ) {
                                // the menu item that launches the menu is not necessarily in the tab order so
                                // find the one that is
                                index = tabbable$.index( $( menuLauncher ).find( ":tabbable" ) );
                                if ( index < 0 ) {
                                    index = tabbable$.index( this.element.find( ":tabbable" ) );
                                }
                            } else {
                                index = tabbable$.index( menuLauncher );
                            }
                            if ( index > 0 && index < tabbable$.length ) {
                                index += e.shiftKey ? -1 : 1;
                            } else if ( tabbable$.length > 0) {
                                index =  0;
                            }
                            if ( index >= 0 ) {
                                tabbable$[index].focus();
                            }
                        } // else tabBehavior is NONE
                        e.preventDefault();
                    } else {
                        // for menubar items make sure menu is closed if tab behavior is exit
                        if ( this.options.tabBehavior === "EXIT" || e.shiftKey ) {
                            actionTookFocus = true; // lie about this so that closing the menus doesn't set the focus back to the button
                            menuManager.closeAll();
                        }
                        // else let default tab happen
                    }
                } else if ( kc === keys.ESCAPE ) {
                    menuManager.closeLast( true );
                    e.preventDefault();
                } else if ( kc === keys.ENTER || kc === keys.SPACE ) {
                    if ( $ctrl.hasClass( C_FOCUSED ) ) {
                        cur$ = $ctrl;
                    } else {
                        cur$ = $ctrl.find( SEL_FOCUSED );
                    }
                    if ( cur$.hasClass( C_DISABLED ) || !cur$.is( SEL_ITEM ) ) {
                        e.preventDefault();
                        return;
                    }
                    id = cur$[0].id;
                    item = this._getMenuItemFromId( id );
                    type = item.type;

                    isMenuBarItem = itemIsMenuBarItem( cur$ );
                    if ( type === "subMenu" && isMenuBarItem ) {
                        if ( item.action || item.href ) {
                            type = "action"; // on space/enter a split menu bar item behaves like an action menu item
                            menuManager.closeOpenSiblings( cur$, isMenuBarItem );
                        }
                    }
                    if ( type === "subMenu" ) {
                        if ( isMenuBarItem ) {
                            self.toggle( cur$ );
                            next$ = cur$.find( SEL_MENU_CONTENT ).first().find( SEL_ITEM ).first();
                            setItemFocus( next$ );
                        } else {
                            menu$ = cur$.children( SEL_MENU );
                            if ( menu$.length > 0 ) {
                                menuManager.openSubMenu( cur$, menu$, false, this.options.slide, false );
                                next$ = menu$.find( "ul" ).first().children( SEL_ITEM ).first();
                                setItemFocus( next$ );
                            }
                        }
                    } else if ( !(e.target.nodeName === "A" && kc === keys.SPACE ) && ( type === "action" || ( kc === keys.SPACE && e.target.nodeName === "BUTTON" ) ) ) {
                        // for actions (except for A with space key) and radio or toggle items with the space key
                        // let the click handler do the invoke
                        this.keyboardActivate = true;
                        return;
                    } else if ( type !== "display" ) {
                        // must be toggle or radio activated with Enter or an anchor was activated with Space key
                        choice = getChoiceFromId( id );
                        /* Strange behavior of space key
                         * Normal events when space key is pressed and released on a button are:
                         *   keydown, keypress, keyup, click
                         * Note that click happens after keyup. On other elements there is no click event.
                         * Now if you change the focus during keydown to another button within about 150ms to 200ms
                         * the keyup event happens on the other button. If you delay setting focus a little longer then
                         * that the keyup event happens on the original button. Exactly how long a delay varies and depends
                         * on the browser (tested on Chrome, FF, and IE10). IE and Chrome seem to do something so that the
                         * keyup on the other button doesn't lead to a click but Firefox generates a click event on
                         * the newly focused button if it receives the keyup even if the original keydown was not on
                         * a button.
                         * The solution is to delay the action invocation but still dismiss the menu right away.
                         * This has ramifications on the afterClose event but in practice shouldn't be too bad.
                         * THINK how robust would it be to track the keydown and keyup events at the body and
                         * prevent default for keyup if the targets don't match.
                         */
                        if ( invokeItem( item, choice, this.options, type, kc === keys.SPACE ) ) { // delay if space key
                            // lie about this so that focus isn't set because it would cause FF to activate the launching button again
                            actionTookFocus = true;
                            menuManager.closeAll();
                        }
                    }
                    e.preventDefault();
                }
            },

            keypress: function( e ) {
                var ch, sp, next$, cur$, ctrl$, thisMenu$, items$, label$,
                    index = -1;

                if ( e.which === 0 ) {
                    return;
                }

                ctrl$ = this.element;
                if ( ctrl$.hasClass( C_FOCUSED ) ) {
                    cur$ = ctrl$.find( SEL_MENU_CONTENT ).first().find( SEL_ITEM ).first();
                    index = 0;
                } else {
                    cur$ = ctrl$.find( SEL_FOCUSED );
                }
                thisMenu$ = cur$.closest( SEL_MENU );
                if ( thisMenu$.length === 0 ) {
                    return;
                }
                items$ = getItemsForMenu( thisMenu$ );
                if ( index < 0 ) {
                    index = items$.index( cur$ ) + 1;
                    if ( index >= items$.length ) {
                        index = 0;
                    }
                }
                next$ = items$.eq( index );

                ch = String.fromCharCode( e.which ).toLowerCase();
                while ( true ) {
                    label$ = next$.filter( ".a-Menu-label" );
                    if ( label$.length === 0 ) {
                        label$ = next$.find( ".a-Menu-label" );
                    }
                    if ( label$.text().charAt( 0 ).toLowerCase() === ch ) {
                        setItemFocus( next$ );

                        sp = getMenuScrollParent( thisMenu$ )[0];
                        if ( sp ) {
                            this._checkScrollBounds( thisMenu$, sp );
                        }
                        break;
                    }
                    index += 1;
                    if ( index >= items$.length ) {
                        index = 0;
                    }
                    next$ = items$.eq( index );
                    if ( next$[0] === cur$[0] ) {
                        break;
                    }
                }
            },

            focusin: function ( e ) {
                var $target = $( e.target );
                if ( !this.isActive ) {
                    this.element.find( SEL_FOCUSED ).removeClass( C_FOCUSED );
                }
                if ( $target.is( SEL_MENU ) ) {
                    $target.addClass( C_FOCUSED );
                } else {
                    $target.closest( SEL_ITEM ).addClass( C_FOCUSED );
                }
                this.isActive = true;
            }, focusout: function ( e ) {
                var $target = $( e.target );
                if ( $target.is( SEL_MENU ) ) {
                    $target.removeClass( C_FOCUSED );
                } else {
                    $target.closest( SEL_ITEM ).removeClass( C_FOCUSED );
                }
                this.isActive = false;
            },
            focus: function ( ) {
                this.element.addClass( C_FOCUSED );
            },
            blur: function ( ) {
                this.element.removeClass( C_FOCUSED );
            }
        },

        _destroy: function () {
            var o = this.options,
                $ctrl = this.element;

            // don't call while tracking menus
            if ( isTracking ) {
                debug.warn( "Menu destroyed while still tracking menus." );
                menuManager.closeAll(true);
            }
            $ctrl.empty().removeClass( (o.menubar ? C_MENUBAR + " " + C_MENUBAR_TABS : C_MENU) + " " + C_RTL + " " + C_OVERFLOW )
                .removeAttr( "role" );
        },

        _setOption: function ( key, value ) {
            var overflowItem, items, item, overflowList,
                o = this.options;

            if ( key === "menubar" ) {
                throw "The menubar option cannot be set";
            }
            if ( !o.menubar ) {
                if ( key === "menubarOverflow" || key === "menubarShowSubMenuIcon" || key === "behaveLikeTabs" ) {
                    debug.warn( "Option " + key + " ignored when menubar is false" );
                }
            } else {
                if ( key === "customContent" || key === "firstItemIsDefault" ) {
                    debug.warn( "Option " + key + " ignored when menubar is true" );
                }
            }

            this._super( key, value );

            if ( key === "menubarOverflow" && o.menubar ) {
                this.element.toggleClass( C_OVERFLOW, value );

                if ( !value ) {
                    items = o.items;
                    overflowItem = items[ items.length - 1 ];
                    if ( overflowItem && overflowItem._overflow ) {
                        // move all overflow items back to the menubar
                        overflowList = overflowItem.menu.items;
                        while ( overflowList.length > 0 ) {
                            item = overflowList.shift();
                            // if this is a split menu remove the action item that was added
                            if ( item.type === "subMenu" && ( item.action || item.href ) ) {
                                item.menu.items.shift();
                            }
                            items.splice( items.length - 1, 0, item );
                        }
                        items.pop(); // get rid of overflow menubar item
                    }
                }
            }
        },

        /**
         * Call to refresh the menubar if any of the menu bar items change or settings that affect the menubar change.
         * No need to call for popup menus or for changes in any of the menus or sub menus of a menubar.
         * @return this
         */
        refresh: function () {
            var owns,
                $ctrl = this.element,
                o = this.options,
                idprefix = o.idPrefix || $ctrl[0].id || "menu",
                out = util.htmlBuilder();

            if ( o.menubar ) {
                /*
                 * JAWS understands menubars much better if the menuitems are direct children of the menubar.
                 * Our menu markup needs much more structure so use aria-owns to establish the menubar > menuitem relationship.
                 */
                owns = this._renderMenubar( out, idprefix, o );
                $ctrl.html( out.toString() );
// TODO consider using aria-owns
// According to the spec aria-owns should be used to specify the menu item - menu - menu items relationship
// when it is not represented by DOM parent child relationships. Doing so seems to provide no benefit and
// causes an issue (JAWS 16, Firefox 35) where the first level sub menu in a popup menu is not read as a sub menu.
//                    .attr( A_OWNS, owns );
                this._processMenuCustomMarkup();
                this.resize();
            }
            return this;
        },

        /**
         * Call to resize the menubar if the width of the menubar container changes.
         * This is only needed for menu bars that have menubarOverflow: true.
         * Window resize is automatically handled so that if the width automatically changes due
         * to window resize there is no need to call resize.
         * @return this
         */
        resize: function() {
            var owns,
                $ctrl = this.element,
                o = this.options,
                idprefix = o.idPrefix || $ctrl[0].id || "menu",
                out = util.htmlBuilder();

            if ( o.menubar && o.menubarOverflow ) {
                if ( this._adjustMenubarForSize( idprefix, o ) ) {
                    owns = this._renderMenubar( out, idprefix, o );
                    $ctrl.html( out.toString() );
// see above comment about aria-owns
//                        .attr( A_OWNS, owns );
                    this._processMenuCustomMarkup();
                }
            }
            return this;
        },

        /**
         * When not a menubar
         *   toggle( x, y )
         *   toggle( $launchItem )
         *   toggle( $launchItem, false ) // for use by menu buttons to not give the menu focus
         * When a menubar
         *   toggle( $menubarItem )
         *   toggle( menuIndex )
         * @param x
         * @param y
         * @return this
         */
        toggle: function ( x, y ) {
            var $menu = this.element;
            if ( this.options.menubar ) {
                $menu = null;
                if ( typeof x === "number" ) {
                    x = this.element.children( "ul" ).children( "li" ).eq( x );
                    if ( x.length > 0) {
                        $menu = x.children( SEL_MENU );
                    }
                } else if ( x.is( SEL_ITEM ) ) {
                    $menu = x.children( SEL_MENU );
                }
                if ( !$menu || $menu.length !== 1) {
                    throw "Invalid menu bar menu";
                }
            }
            if ( menuManager.isCurrentMenu( $menu[0] ) ) {
                menuManager.closeAll();
            } else {
                this.open( x, y );
            }
            return this;
        },

        /**
         * When not a menubar
         *   open( x, y )
         *   open( $launchItem )
         *   open( $launchItem, false ) // for use by menu buttons to not give the menu focus
         * When a menubar
         *   open( $menubarItem )
         *   open( menuIndex )
         * @param x
         * @param y
         * @return this
         */
        open: function ( x, y ) {
            var i, menu, $menu, $menubar, idprefix, menuArg, isPopup,
                isAsync = false,
                self = this,
                o = this.options,
                out = util.htmlBuilder();

            function finish() {
                var owns;
                self._trigger( "beforeOpen", {}, menuArg );
                if ( menu.customContent ) {
                    if ( typeof menu.customContent === "string" ) {
                        // it is an element id, move the element under this element
                        $menu.empty().append($( "#" + util.escapeCSS( menu.customContent )).show() );
                        menu.customContent = true;
                    }
                    // else the menu element content is the menu
                    self._parseCustomMarkup( $menu, idprefix, menu );
                } else {
                    out.clear();
                    owns = self._renderMenu( out, idprefix, menu, isPopup );
                    $menu.html( out.toString() );
// see above comment about aria-owns
//                        .attr( A_OWNS, owns);
                }
            }

            if ( o.menubar ) {
                $menubar = this.element;
                $menu = null;
                if ( typeof x === "number" ) {
                    x = this.element.children( "ul" ).children( "li" ).eq( x );
                    if ( x.length > 0) {
                        $menu = x.children( SEL_MENU );
                    }
                } else if ( x.is( SEL_ITEM )) {
                    $menu = x.children( SEL_MENU );
                }
                if ( !$menu || $menu.length !== 1) {
                    throw "Invalid menu bar menu";
                }
                idprefix = x[0].id;
                menu = this._getMenuItemFromId ( idprefix );
                if ( !menu || menu.type !== "subMenu" || !menu.menu ) {
                    throw "Can't open menu " + x;
                }
                menuArg = menu;
                menu = menu.menu;
                isPopup = false;
            } else {
                $menubar = null;
                menu = o;
                menuArg = { menu: menu };
                $menu = this.element;
                idprefix =  o.idPrefix || this.element[0].id || "menu";
                isPopup = true;
            }

            if ( $.isFunction( o.asyncFetchMenu ) ) {
                if ( !isTracking && o.menubar ) {
                    // only do an asyncFetchMenu once per initial menubar open. start by marking them all not fetched
                    for (i = 0; i < o.items.length; i++ ) {
                        o.items[i]._fetched = false;
                    }
                }
                if ( o.menubar && menuArg._fetched === true ) {
                    finish(); // this menu bar menu has already been fetched
                } else {
                    // Render a placeholder menu item while the real content is being fetched
                    // This way there is something to show for immediate feedback and to receive focus.
                    self._renderMenu( out, idprefix, {
                            items: [ { type: "action", disabled: true, label: apex.lang.getMessage( "APEX.PROCESSING" ) }]
                        }, isPopup );
                    $menu.html( out.toString() );
                    isAsync = true;
                    o.asyncFetchMenu( menu, function( status ) {
                        var focusItem$;
                        // once the menu has been updated re-render the menu content and adjust for size changes
                        // but only if this menu is still open
                        if ( menuManager.isCurrentMenu( $menu[0] ) ) {
                            if ( status === false ) {
                                menuManager.closeAll( true );
                                return;
                            }
                            focusItem$ = $menu.find( SEL_FOCUSED ).first();
                            finish();
                            menuResize();
                            if ( focusItem$.length ) {
                                setItemFocus( $menu.find( SEL_ITEM ).first() );
                            } else {
                                $menu.focus();
                            }
                        }
                    });
                    if ( o.menubar ) {
                        menuArg._fetched = true;
                    }
                }
            } else {
                finish();
            }
            if ( !isAsync && menu.items.length === 0 ) {
                debug.error("Menu has no items");
                // respond as if it were opened and then closed so there is a matching event
                self._trigger( "afterClose", {}, {
                    actionTookFocus: false,
                    actionTaken: false,
                    launcher: null
                } );
            } else {
                menuManager.openMenu( $menu, $menubar, x, y, o.slide, o.menubar || y !== false );
            }
            return this;
        },

        find: function ( id ) {
            var o = this.options;
            return findItemById( o, id );
        },

        /**
         * Set the current menu bar item. Any previous current property is deleted.
         * @param item the menu item or id of menu item to make current
         */
        setCurrentMenuItem: function ( item ) {
            var i = 0, curItem, prevItem,
                menuItems = this.options.items;

            if ( !this.options.menubar || !this.options.behaveLikeTabs ) {
                debug.warn( "setCurrentMenuItem ignored");
                return;
            }
            if ( typeof item === "string" ) {
                item = this.find( item );
            }
            if ( item ) {
                // first clear out any previous current menu
                for ( i = 0; i < menuItems.length; i++ ) {
                    curItem = menuItems[i];
                    if ( curItem.current ) {
                        prevItem = curItem;
                        delete curItem.current;
                    }
                    descendentIsCurrent( curItem, true ); // clear current from any descendents
                }
                item.current = true;
                // now find the top level menubar item ancestor of item
                for ( i = 0; i < menuItems.length; i++ ) {
                    curItem = menuItems[i];
                    if ( descendentIsCurrent( curItem ) ) {
                        curItem.current = true;
                        getLabelFromMessage( prevItem );
                        this.element.find( "." + C_CURRENT_MENU ).removeClass( C_CURRENT_MENU )
                            .find( ".a-MenuBar-label" ).text( prevItem.label );
                        this.element.children( "ul" ).children( "li" ).eq( i ).addClass( C_CURRENT_MENU )
                            .find( ".a-MenuBar-label" ).append( " <span class='u-VisuallyHidden'>current</span>" ); // TODO i18n need localized text for current menu item
                        break;
                    }
                }
            }
        },

        /*
         * Turns simple nested lists into menu object structure used by menu widget.
         * The markup expected by this method overlaps with what the actions facility expects. Keep this code in sync with actions.
         */
        _parseMenuMarkup: function ( $el, isMenubar ) {
            var self = this,
                menu = { items: [] };

            $el.children( "ul" ).children( "li" ).each(function( i ) {
                var item, icon, index, id, customId, customContent$,
                    $item = $( this ),
                    $a = $item.children( "a" ).eq( 0 ),
                    $span = $item.children( "span" ).eq( 0 );

                item = { type: "action" };
                if ( $a.length > 0 ) {
                    item.label = $a.text();
                    item.href = $a.attr("href");
                } else if ( $span.length > 0 ) {
                    item.label = $span.text();
                } else {
                    item.type = "separator";
                }
                if ( item.href === "separator" ) {
                    item.type = "separator";
                    delete item.href;
                    delete item.label;
                }
                id = $item.attr( "data-id" );
                if ( id ) {
                    item.id = id;
                }
                if ( $item.attr( "data-hide" ) === "true" ) {
                    item.hide = true;
                }
                if ( $item.attr( "data-disabled" ) === "true" ) {
                    item.disabled = true;
                }
                if ( $item.attr( "data-current" ) === "true" ) {
                    item.current = true;
                }
                icon = $item.attr( "data-icon" );
                if ( icon ) {
                    index = icon.indexOf( " " );
                    if ( index >= 0 ) {
                        item.iconType = icon.substring( 0, index );
                        item.icon = icon.substring( index + 1 );
                    } else {
                        item.icon = icon;
                    }
                }
                if ( item.type !== "separator" && ($item.children( "ul" ).length > 0 || $item.attr("data-custom") === "true") ) {
                    item.type = "subMenu";
                    if ( $item.attr("data-custom") !== "true" ) {
                        item.menu = self._parseMenuMarkup( $item, false );
                    } else if ( isMenubar ) {
                        customContent$ = $item.children( SEL_MENU_CONTENT ).eq(0);
                        customId = customContent$[0].id;
                        if ( !customId ) {
                            customId = customContent$[0].id = (self.options.idPrefix || self.element[0].id || "menu") + "_cm_" + i;
                        }
                        $( document.body ).append( customContent$ );
                        customContent$.hide();
                        item.menu = { customContent: customId };
                    } else {
                        throw "Attribute data-custom only allowed at menubar level";
                    }
                }
                if ( item.type === "action" && id && apex.actions && apex.actions.lookup( id ) ) {
                    // treat this item as an action
                    item.action = id;
                    delete item.href;
                    delete item.label;
                    delete item.disabled;
                    delete item.icon;
                    delete item.iconType;
                }
                menu.items.push(item);
            });
            return menu;
        },

        /*
         * This will add the necessary extra classes and ids to the markup to make it function as a menu.
         * It will also create or update the internal menu items data structure based on the markup
         * Custom menus are flat - they have no sub menus and don't support toggle or radio menu items.
         */
        _parseCustomMarkup: function( $menu, idprefix, menu ) {

            // if the menu has no items add a place for them
            if ( !menu.items ) {
                menu.items = [];
            }
            $menu.attr("data-custom", "true");
            // make sure there is an element with menu content class
            if ( $menu.find( SEL_MENU_CONTENT ).length === 0 ) {
                $menu.children().first().addClass( C_MENU_CONTENT );
            }
            $menu.find( SEL_FOCUSABLE ).each( function(index) {
                var menuId,  item, item$, f$;
                f$ = $( this );
                item$ = f$.closest( SEL_MENU_ITEM );
                // make it a menuitem
                f$.attr( "role", "menuitem" );
                // make sure each item has a menu item class
                if ( item$.length === 0 ) {
                    item$ = $( this );
                    item$.addClass( C_ITEM );
                }
                // make sure each item has a label class
                if ( !item$.hasClass( C_LABEL) && item$.find( SEL_LABEL ).length === 0 ) {
                    f$.addClass( C_LABEL );
                }
                item$[0].id = idprefix + "_" + index;
                if ( this.nodeName === "A" && this.href ) {
                    item = { type: "action", label: f$.text(), href: this.href };
                    menu.items[index] = item;
                } else if ( this.nodeName === "BUTTON" ) {
                    // The button should already have a click event associated with it so no action is needed
                    item = { type: "action", label: f$.text(), action: function() {} };
                    menu.items[index] = item;
                } else {
                    // make sure it can be tabbed to
                    f$.attr("tabindex", "-1");
                    // there may already be a menu item defined
                    if ( !menu.items[index] ) {
                        // if not assume it is just for display
                        item = { type: "display", label: f$.text(), disabled: true };
                        menu.items[index] = item;
                    }
                }
                // support actions with data-id
                menuId = item$.attr( "data-id" );
                if ( menuId ) {
                    item.id = menuId;
                    if ( item.type === "action" && menuId && apex.actions && apex.actions.lookup( menuId ) ) {
                        // treat this item as an action
                        item.action = menuId;
                        delete item.href;
                        delete item.label;
                        delete item.disabled;
                        delete item.icon;
                        delete item.iconType;
                    }
                }
            });
        },

        _processMenuCustomMarkup: function() {
            var self = this;

            this.element.find( "." + C_BAR_ITEM ).each( function() {
                var menu$ = $( this ).children( SEL_MENU ),
                    idprefix = this.id,
                    menu = self._getMenuItemFromId ( idprefix ).menu;

                if ( menu && menu.customContent ) {
                    if ( typeof menu.customContent === "string" ) {
                        // it is an element id, move the element under this element
                        menu$.empty().append($( "#" + util.escapeCSS( menu.customContent )).show());
                        menu.customContent = true;
                    }
                    self._parseCustomMarkup( menu$, idprefix, menu );
                }
            } );
        },

        _getMenuItemFromId: function ( id ) {
            var i, mi,
                o = this.options,
                idParts = id.split( "_" ),
                path = [],
                item = null;

            i = idParts.length - 1;
            if ( idParts[i].match( /^c[0-9]+$/ ) ) {
                i -= 1;
            }
            for ( ; i > 0; i-- ) {
                if ( idParts[i].match( /^[0-9]+$/ ) ) {
                    path.unshift( idParts[i] * 1 );
                } else {
                    break;
                }
            }
            mi = o.items;
            for ( i = 0; i < path.length; i++ ) {
                item = mi[path[i]];
                if ( !item || (i < path.length - 1 && !item.menu) ) {
                    return null;
                }
                if ( item.menu ) {
                    mi = item.menu.items;
                }
            }
            return item;
        },

        _itemIsHidden: function( item ) {
            var hide = item.hide,
                o = this.options;

            if ( $.isFunction( hide )) {
                hide = item.hide( o );
            }

            return hide;
        },

        _itemIsDisabled: function( item ) {
            var disabled = item.disabled,
                o = this.options;

            if ( $.isFunction( disabled )) {
                disabled = item.disabled( o );
            }

            return disabled;
        },

        _renderMenubar: function ( out, idprefix, menubar ) {
            var owns = "",
                self = this,
                focusItem = 0,
                o = this.options,
                tabAll = o.tabBehavior === "NEXT";

                if ( o.behaveLikeTabs ) {
                // if current is true for any descendents make it bubble up to the menubar item level
                $.each( menubar.items, function( i, item ) {
                    if ( descendentIsCurrent( item ) ) {
                        item.current = true;
                    }
                    if ( item.current ) {
                        focusItem = i;
                        return false; // only expect one to be current so end early
                    }
                });
            }

            // first save any custom rendered sub menus
            this.element.find( "." + C_MENU_TOP ).filter( "[data-custom]" ).each( function() {
                var save$ = $( this ).children().eq( 0 ),
                    item = self._getMenuItemFromId( save$.closest( SEL_ITEM )[0].id );
                item.menu.customContent = save$[0].id;
                $( document.body ).append( save$ );
            } );

            out.markup( "<ul>" );
            $.each( menubar.items, function( i, item ) {
                var label, itemClass, disabled, action,
                    type = item.type,
                    id = idprefix + "_" + i;

                if ( item.type === "action" && typeof item.action === "string"  ) {
                    if ( !apex.actions ) {
                        throw "Action name requires apex.actions";
                    }
                    // fill in menu item properties from action
                    action = apex.actions.lookup( item.action );
                    if ( action ) {
                        item.hide = false;

                        if ( action.label && !item.label ) {
                            item.label = action.label;
                        }
                        if ( action.disabled !== undefined ) {
                            item.disabled = action.disabled;
                        }
                    } else {
                        debug.warn( "Unknown action name " + item.action + " (item hidden).");
                        item.hide = true;
                    }
                }

                if ( self._itemIsHidden( item ) ) {
                    return;
                }

                itemClass = C_BAR_ITEM;
                disabled = self._itemIsDisabled( item );
                if ( disabled ) {
                    itemClass += " " + C_DISABLED;
                }
                if ( item.type === "subMenu" && ( item.action || item.href )) {
                    itemClass += " " + C_SPLIT_MENU;
                }
                if ( o.behaveLikeTabs && item.current ) {
                    itemClass += " " + C_CURRENT_MENU;
                }
                if ( item._overflow ) {
                    itemClass += " " + C_BAR_OVERFLOW;
                }

                if ( type === "action" || type === "subMenu" ) {
                    out.markup( "<li" ).attr( "id", id ).attr( "class", itemClass )
                        .markup( ">" );
                    owns += " " + id + "i";
                    // label
                    getLabelFromMessage( item );
                    label = item.label;
                    if ( item.icon || item.iconType ) {
                        debug.warn( "Menu bar items cannot have icons." );
                    }
                    if ( item.accelerator ) {
                        debug.warn( "Menu bar items cannot have accelerators." );
                    }
                    if ( disabled ) {
                        out.markup( "<span role='menuitem'").attr( "class", C_BAR_LABEL ).attr( "tabindex", ( tabAll || i === focusItem ) ? "0" : "-1" )
                            .attr( "id", id + "i" )
                            .optionalAttr( A_DISABLED, disabled ? "true" : null )
                            .optionalAttr( A_HASPOPUP, type === "subMenu" ? "true" : null )
                            .markup(">" ).content( label )
                            .markup( "</span>" );
                    } else {
                        /*
                         * We use button rather than <a> or anything else because it has the desired default keyboard handling.
                         * Pressing Enter or Space when focus is on a button will generate a click event. For <a> only
                         * Enter generates a click event.
                         * However when a menu is used mainly for site navigation a user may have the expectation that normal
                         * browser link behavior is possible and so we have the option to use anchors.
                         */
                        if ( item.href && o.useLinks ) {
                            out.markup( "<a role='menuitem'" ).attr( "class", C_BAR_LABEL )
                                .attr( "id", id + "i" )
                                .attr( "href", item.href )
// see above comment about aria-owns
//                                .optionalAttr( A_OWNS, type === "subMenu" ? id + "m" : null )
                                .optionalAttr( "tabindex", ( tabAll || i === focusItem ) ? null : "-1" )
                                .optionalAttr( A_HASPOPUP, type === "subMenu" ? "true" : null )
                                .markup( ">" ).content( label );
                            // Standard menubars have no concept of a current menu item. This is an APEX extension.
                            // This seems like a reasonable way to let screen reader users know the menu is current.
                            if ( o.behaveLikeTabs && item.current ) {
                                // TODO i18n need localized text for current menu item
                                // It is important that there is a space before the visually hidden span otherwise
                                // JAWS/IE will run the text together into one word
                                out.markup( " <span class='u-VisuallyHidden'>current</span>" );
                            }
                            out.markup( "</a>" );
                        } else {
                            out.markup( "<button type='button' role='menuitem'" ).attr( "class", C_BAR_LABEL )
                                .attr( "id", id + "i" )
// see above comment about aria-owns
//                                .optionalAttr( A_OWNS, type === "subMenu" ? id + "m" : null )
                                .optionalAttr( "tabindex", ( tabAll || i === focusItem ) ? null : "-1" )
                                .optionalAttr( A_HASPOPUP, type === "subMenu" ? "true" : null );
                            if ( item._overflow ) {
                                out.attr( "title", label )
                                    .markup( "><span class='a-Icon icon-down-chevron'></span>" );
                            } else {
                                out.markup( ">" ).content( label );
                                if ( o.behaveLikeTabs && item.current ) {
                                    // TODO i18n need localized text for current menu item
                                    // It is important that there is a space before the visually hidden span otherwise
                                    // JAWS/IE will run the text together into one word
                                    out.markup( " <span class='u-VisuallyHidden'>current</span>" );
                                }
                            }
                            out.markup( "</button>" );
                        }
                    }
                    if ( type === "subMenu" ) {
                        // show drop down icon only for split menus or when menubarShowSubMenuIcon option is true
                        if ( ( item.action || item.href || o.menubarShowSubMenuIcon ) && !item._overflow ) {
                            out.markup( "<span class='" + C_SUBMENU_COL + "'>" );
                            renderIcon( out, C_DEFAULT_ICON_TYPE, o.menubarShowSubMenuIcon && !(item.action || item.href) ? "icon-menu-drop-down" : "icon-menu-split-drop-down" );
                            out.markup( "</span>" );
                        }
                        out.markup( "<div")
                            .attr( "id", id + "m" )
                            .markup(" class='" + C_MENU + " " + C_MENU_TOP + "' role='menu' tabindex='-1' style='display:none;'></div>" );
                    }
                    out.markup( "</li>" );
                } else {
                    throw "Menu item type not supported in menubar: " + type;
                }
            } );
            out.markup( "</ul>" );
            return $.trim(owns);
        },

        _renderMenu: function ( out, idprefix, menu, isPopup ) {
            var owns = "",
                o = this.options,
                self = this,
                isRtl = this.element.hasClass( C_RTL ),
                delayAddSeparator = false, // delay adding a separator item until just before next item is rendered to
                                           // avoid having a trailing separator due to last item being hidden or two together
                itemCount = 0,
                subMenuIcon = "icon-menu-sub";

            function separator() {
                delayAddSeparator = false;
                if ( itemCount > 0 ) {
                    out.markup( "<li class='" )
                        .markup( C_ITEM_SEP )
                        .markup( "' role='separator'><div class='a-Menu-inner'><span class='a-Menu-labelContainer'><span class='" )
                        .markup( C_STATUS_COL )
                        .markup( "'></span><span class='" )
                        .markup( C_HSEP )
                        .markup( "'></span></span><span class='a-Menu-accelContainer'></span></div></li>" );
                    itemCount += 1;
                } // don't warn about skipping initial separators because it could be due to a hidden item
            }

            function statusColumn( type, icon ) {
                out.markup( "<span class='" + C_STATUS_COL + "'>" );
                if ( icon || icon === "" ) {
                    renderIcon( out,  type, icon );
                }
                out.markup( "</span>" );
            }

            function labelAccel( accelerator) {
                out.markup( "<span" ).attr( "class", C_ACCEL ).markup( "> " ).content( accelerator ).markup( "</span>" );
            }

            function labelColumn( id, disabled, label, accelerator, href, role, checked, submenu ) {
                var closeTag;
                if ( disabled ) {
                    out.markup( "<span tabindex='-1'" ).optionalAttr( A_DISABLED, disabled ? "true" : null );
                    closeTag = "</span>";
                } else if ( href && o.useLinks ) {
                    /*
                     * We use button rather than <a> or anything else because it has the desired default keyboard handling.
                     * Pressing Enter or Space when focus is on a button will generate a click event. For <a> only
                     * Enter generates a click event.
                     * However when a menu is used mainly for site navigation a user may have the expectation that normal
                     * browser link behavior is possible and so we have the option to use anchors.
                     */
                    out.markup( "<a" ).attr( "href", href );
                    closeTag = "</a>";
                } else {
                    out.markup( "<button type='button'" );
                    closeTag = "</button>";
                }

                out.attr( "id", id )
                    .attr( "role", role )
                    .attr( "class", C_LABEL )
                    .optionalAttr( A_HASPOPUP, submenu ? "true" : null )
                    // Firefox reads when a radio or checkbox is not checked and IE 10 never does even if explicitly set to false
                    // there should be no need for explicit false setting
                    .optionalAttr( A_CHECKED, checked !== null && checked ? "true" : null )
// see above comment about aria-owns
//                    .optionalAttr( A_OWNS, submenu ? ( id + "m" ) : null )
                    .markup( ">" );

                out.content( label );
                if ( accelerator ) {
                    // screen readers will only read what is in the focused element so add the accelerator text
                    // here but visually hidden.
                    out.markup( " <span class='u-VisuallyHidden'>" ).content ( accelerator ).markup( "</span>" );
                }
                out.markup( closeTag )
                    .markup( "</span><span class='a-Menu-accelContainer'>" );

                if ( accelerator ) {
                    labelAccel( accelerator );
                }
            }

            function noSubMenu() {
                out.markup( "<span class='" + C_SUBMENU_COL + "'></span>" );
            }

            if ( isRtl ) {
                subMenuIcon = "icon-menu-sub-rtl";
            }
            out.markup( "<div class='" + C_MENU_CONTENT + "'><ul>" );
            $.each( menu.items, function ( i, item ) {
                var state, label, itemClass, icon, iconType, disabled, role, accelerator, labelId, subOut, subOwns,
                    action = null,
                    type = item.type,
                    id = idprefix + "_" + i;

                getLabelFromMessage( item );
                icon = item.icon;
                iconType = item.iconType;
                label = item.label;
                accelerator = item.accelerator;
                if ( ( item.type === "action" || item.type === "toggle" ) && typeof item.action === "string"  ) {
                    if ( !apex.actions ) {
                        throw "Action name requires apex.actions";
                    }
                    // fill in menu item properties from action
                    action = apex.actions.lookup( item.action );
                    if ( action ) {
                        item.hide = false;

                        if ( action.icon && !item.icon ) {
                            icon = action.icon;
                        }
                        if ( action.iconType && !item.iconType ) {
                            iconType = action.iconType;
                        }
                        if ( action.label && !item.label ) {
                            label = action.label;
                        }
                        if ( action.shortcut && !item.accelerator ) {
                            accelerator = action.shortcut;
                        }
                        if ( action.disabled !== undefined ) {
                            item.disabled = action.disabled;
                        }
                    } else {
                        debug.warn( "Unknown action name " + item.action + " (item hidden).");
                        item.hide = true;
                    }
                }

                if ( self._itemIsHidden( item ) ) {
                    return;
                }

                itemClass = type === "separator" ? C_ITEM_SEP : C_ITEM;
                disabled = self._itemIsDisabled( item );

                if ( disabled ) {
                    itemClass += " " + C_DISABLED;
                }
                if ( i === 0 && isPopup && o.firstItemIsDefault ) {
                    itemClass += " " + C_ITEM_DEFAULT;
                }

                if ( type === "radioGroup" ) {
                    // add separator before
                    delayAddSeparator = true;
                    state = item.get(); // state is current selected choice
                    $.each( item.choices, function ( j, choice ) {
                        var rid = id + "_c" + j,
                            checked = state === choice.value;

                        itemClass = C_ITEM;
                        disabled = choice.disabled;
                        if ( $.isFunction( disabled )) {
                            disabled = choice.disabled( o );
                        }
                        if ( disabled ) {
                            itemClass += " " + C_DISABLED;
                        }

                        if ( choice.icon ) {
                            debug.warn( "Radio menu items cannot have icons." );
                        }

                        if ( delayAddSeparator ) {
                            separator();
                        }
                        out.markup( "<li" ).attr( "id", rid ).attr("class", itemClass )
                            .markup( "><div class='a-Menu-inner'><span class='a-Menu-labelContainer'>" );

                        statusColumn( C_DEFAULT_ICON_TYPE, checked ? "icon-menu-radio" : "" );

                        getLabelFromMessage( choice );
                        labelId = rid + "i";
                        owns += " " + labelId;
                        labelColumn( labelId, disabled, choice.label, null, null, "menuitemradio", checked );

                        noSubMenu();

                        out.markup( "</span></div></li>" );
                        itemCount += 1;
                    } );
                    // add separator after if not last menu item.
                    delayAddSeparator = true;
                } else if ( type === "separator" ) {
                    delayAddSeparator = true;
                } else {
                    role = type === "toggle" ? "menuitemcheckbox" : "menuitem";
                    if ( delayAddSeparator ) {
                        separator();
                    }
                    labelId = id + "i";
                    out.markup( "<li id='" ).attr( id ).markup( "' class='" ).attr( itemClass )
                        .markup( "'><div class='a-Menu-inner'><span class='a-Menu-labelContainer'>" );
                    if ( type === "action" || type === "display" ) {
                        statusColumn( iconType || o.iconType, icon );

                        labelColumn( labelId, disabled, label, accelerator, item.href || "", role, null );

                        noSubMenu();
                        out.markup( "</span></div>" );
                    } else if ( type === "toggle" ) {
                        if ( action ) {
                            item = action;
                        }
                        state = item.get();

                        if ( item.icon && (!action) ) {
                            debug.warn( "Toggle menu items cannot have icons." );
                        }
                        if ( item.label && ( item.onLabel || item.offLabel ) ) {
                            debug.warn( "Toggle menu items should not have both label and on/offLabel properties." );
                        }
                        label = item.label;
                        icon = state ? "icon-menu-check" : "";
                        if ( !label ) {
                            // don't treat dynamic antonyms like a checkbox menu item
                            icon = null;
                            label = state ? item.onLabel : item.offLabel;
                            role = "menuitem";
                            state = null; // once the correct label is selected no need for the state
                        }
                        statusColumn( C_DEFAULT_ICON_TYPE, icon );

                        labelColumn( labelId, disabled, label, accelerator, null, role, state );

                        noSubMenu();
                        out.markup( "</span></div>" );
                    } else if ( type === "subMenu" ) {
                        statusColumn( item.iconType || o.iconType, item.icon );

                        labelColumn( labelId, disabled, item.label, null, "", role, null, true );
                        if ( item.accelerator ) {
                            debug.warn( "Sub menu items cannot have accelerators." );
                        }
                        // sub menu
                        out.markup( "<span class='" + C_SUBMENU_COL + "'>" );
                        renderIcon( out, C_DEFAULT_ICON_TYPE, subMenuIcon );
                        out.markup( "</span></span></div>");
                        // need the list of owned menu items before the items are rendered so use a separate htmlBuilder
                        subOut = util.htmlBuilder();
                        subOwns = self._renderMenu( subOut, id, item.menu, false );
                        out.markup("<div class='" + C_MENU + "' role='menu' tabindex='-1'" )
                            .attr( "id", labelId + "m" )
// see above comment about aria-owns
//                            .optionalAttr( A_OWNS, subOwns )
                            .markup( ">" + subOut.toString() );
                        out.markup( "</div>" );
                    }
                    owns += " " + labelId;
                    out.markup( "</li>" );
                    itemCount += 1;
                }
            } );
            out.markup( "</ul></div>" );
            return $.trim( owns );
        },

        _checkScrollBounds: function( $menu, sp ) {
            $menu.find( SEL_MENU_SCROLL_BTN ).removeClass( C_DISABLED );
            if ( sp.scrollTop <= 0 ) {
                $menu.find( SEL_MENU_SCROLL_BTN + "." + C_UP ).addClass( C_DISABLED );
                sp.scrollTop = 0;
                return true;
            } else if ( sp.scrollTop >= sp.scrollHeight - sp.clientHeight ) {
                $menu.find( SEL_MENU_SCROLL_BTN + "." + C_DOWN ).addClass( C_DISABLED );
                sp.scrollTop = sp.scrollHeight - sp.clientHeight;
                return true;
            }
            return false;
        },

        _startScrolling: function( $menu, up ) {
            var self = this,
                timeIndex = 0,
                times = [ 100, 99, 96, 91, 84, 75, 64, 51, 36, 19 ],
                sp = getMenuScrollParent( $menu )[0];

            function scroll() {
                sp.scrollTop += up ? -10 : 10;
                if ( self._checkScrollBounds( $menu, sp ) ) {
                    self._stopScrolling();
                    return;
                }
                self.scrollTimerId = setTimeout( function() {
                    scroll();
                }, times[timeIndex] );
                if ( timeIndex < times.length - 1 ) {
                    timeIndex += 1;
                }
            }
            if ( this.scrollTimerId ) {
                this._stopScrolling();
            }

            $( document ).on( "mouseup.menuScrolling", function() {
                self._stopScrolling();
            }).on( "mousemove.menuScrolling", function( event ) {
                if ( $( event.target ).closest( SEL_MENU_SCROLL_BTN ).length === 0 ) {
                    self._stopScrolling();
                }
            } );

            scroll();
        },

        _stopScrolling: function( ) {
            clearTimeout( this.scrollTimerId );
            this.scrollTimerId = null;
            this.element.find( SEL_MENU_SCROLL_BTN ).removeClass( C_ACTIVE );
            $( document ).off( ".menuScrolling" );
        },

        _adjustMenubarForSize: function( idprefix, menubar ) {
            var i, overflowList, item, count, overflowItem, save$, item$,
                adjusted = false,
                itemsWidth = 0,
                barWidth = this.element.width() - 2,
                items = menubar.items;

            overflowItem = items[ items.length - 1 ];
            if ( !overflowItem || !overflowItem._overflow ) {
                overflowItem = null;
            }

            for ( i = 0; i < items.length; i++ ) {
                item = items[i];
                if ( item.hide ) {
                    item._width = 0;
                } else {
                    item._width = $("#" + util.escapeCSS( idprefix + "_" + i )).outerWidth(true);
                }
                itemsWidth += item._width;
            }

            if ( itemsWidth > barWidth ) {
                // move menu items to an overflow submenu
                if ( !overflowItem ) {
                    overflowItem = { type: "subMenu", _overflow: true, label: lang.getMessage( "APEX.MENU.OVERFLOW_LABEL" ), menu: { items:[]}};
                    items.push( overflowItem );
                }
                overflowList = overflowItem.menu.items;

                // TODO consider if you should be able to prioritize which go to overflow list or if some must never go
                i = items.length - 2; // start at the end but before the overflow item
                while ( i >= 0 && itemsWidth > barWidth ) {
                    item = items[i];
                    items.splice( i, 1 );
                    // if this is a split menu add the menu action as the first sub menu item
                    if ( item.type === "subMenu" && ( item.action || item.href ) ) {
                        item.menu.items.unshift( {
                            type: "action",
                            label: item.label,
                            labelKey: item.labelKey,
                            href: item.href,
                            action: item.action,
                            disabled: item.disabled
                        });
                    }
                    if ( item.type === "subMenu" && item.menu.customContent ) {
                        item$ = $("#" + util.escapeCSS( idprefix + "_" + i ));
                        save$ = item$.children( SEL_MENU ).children().eq( 0 );
                        save$.hide();
                        item.menu.customContent = save$[0].id;
                        $( document.body ).append( save$ );
                        item$.children( SEL_MENU ).attr( "data-custom", null );
                    }
                    overflowList.unshift(item);
                    itemsWidth -= item._width !== undefined ? item._width : 0;
                    adjusted = true;
                    i -= 1;
                }
            } else if ( overflowItem ) {
                // See if items from the overflow list can move back to the menubar
                overflowList = overflowItem.menu.items;

                // count non-hidden items on the overflow list
                count = 0;
                for ( i = 0; i < overflowList.length && count < 3; i++ ) {
                    if ( overflowList[i]._width > 0 ) {
                        count += 1;
                    }
                }
                if ( count === 1 ) {
                    // proceed as if the overflow item wasn't there
                    itemsWidth -= this.element.find( "." + C_BAR_OVERFLOW ).outerWidth(true);
                }
                delete overflowItem.current; // it will be added back if needed when rendered
                while ( overflowList.length > 0 ) {
                    item = overflowList[0];
                    itemsWidth += item._width !== undefined ? item._width : 0;

                    if ( itemsWidth > barWidth) {
                        break;
                    }
                    overflowList.shift();
                    // if this is a split menu remove the action item that was added
                    if ( item.type === "subMenu" && ( item.action || item.href ) ) {
                        item.menu.items.shift();
                    }
                    items.splice( items.length - 1, 0, item );
                    adjusted = true;
                }
                if ( overflowList.length === 0 ) {
                    items.pop(); // get rid of overflow menubar item
                }
            }

            return adjusted;
        }
    } );

    /*
     * Allow menus to work in jQuery UI dialogs
     */
    if ( $.ui.dialog ) {
        $.widget( "ui.dialog", $.ui.dialog, {
            _allowInteraction: function( event ) {
                return $( event.target ).closest( SEL_MENU ).length > 0 || this._super( event );
            }
        });
    }

    /*
     * MenuButton "widget"
     */
    $( document ).ready( function() {

        function toggleMenu( btn$, focus, openOnly ) {
            var $menu,
                menuId = btn$.attr( "data-menu" );

            if ( menuId ) {
                btn$.addClass( C_ACTIVE )
                    .attr( A_EXPANDED, "true" );

                $menu = $( "#" + util.escapeCSS( menuId ));
                if ( !( openOnly && menuManager.isCurrentMenu( $menu[0] ) ) ) {
                    $menu.menu( "toggle", btn$, false ).on( "menuafterclose.menubutton", function( event, result ) {
                        $( this ).off( ".menubutton" );
                        btn$.removeClass( C_ACTIVE )
                            .attr( A_EXPANDED, "false" );
                    } );
                }
                if ( focus ) {
                    setItemFocus( $menu.find( SEL_ITEM ).first() );
                }
            }
        }

        /*
         * Both the WAI-ARIA authoring practices design patterns and DHTML Style Guide recommend
         * for menu buttons that on click (i.e. Space or Enter) that the menu open but focus remain on the button
         * Normally when a menu opens it takes focus (without selecting an item) so that it can start
         * handling keyboard events. One disadvantage of this compared to say Windows menu button behavior
         * is that Up arrow and first letter selection don't work until you first enter the menu with Down arrow.
         * Still we would follow DHTML Style Guide except that presently at least one popular screen reader
         * does not recognize that a menu is open until a menu item within it is focused.
         */
        $( "body" ).on( "click", SEL_MENUBUTTON, function( e ) {
            // Second parameter should be false but is true so that screen readers recognize that the menu is open
            toggleMenu( $(this), true, false );
        } ).on ( "keydown", SEL_MENUBUTTON, function( e ) {
            if ( e.which === keys.DOWN ) {
                e.preventDefault();
                toggleMenu( $( this ), true, true );
            } else if ( e.which === keys.TAB ) {
                actionTookFocus = true; // lie about this so that closing the menus doesn't set the focus back to the button
                menuManager.closeAll();
            }
        });
        $( SEL_MENUBUTTON ).attr( A_HASPOPUP, "true" ).attr( A_EXPANDED, "false" );

        // if apex refreshes a region then fix up any new menu buttons
        $( "body" ).on( "apexafterrefresh", function( event ) {
            $( event.target ).find( SEL_MENUBUTTON ).attr( A_HASPOPUP, "true" ).attr( A_EXPANDED, "false" );
        } );

    });

})( apex.util, apex.debug, apex.lang, apex.jQuery );

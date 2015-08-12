/*global apex*/
/*!
 Actions - encapsulate action identity and state for use in keyboard shortcuts, buttons, and menus
 Copyright (c) 2014, 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * An Action encapsulates the identity and enabled state and behavior of a named operation or procedure that the user
 * initiates directly. Actions are most useful when an operation can be initiated in multiple ways such as with a button
 * or toolbar button, menu, or keyboard shortcut. The operation should be labeled consistently and if it can be
 * enabled and disabled that state must be kept consistent. By using an Action and then associating a button and/or
 * menu item with that action all aspects of the action are centralized and kept in sync. This avoids duplicating
 * labels, icons etc.
 *
 * An action object has these properties:
 * {
 *     name: <string>,     // (required) a unique name for the action
 *     label: <string>,    // translatable label for action used in buttons, menus etc.
 *     icon: <string>,     // icon for action may be used in buttons and menus
 *     iconType: <string>, // icon type. defaults to a-Icon. Updates to the iconType
 *                         // may not be supported by all control types that can be associated with actions
 *     disabled: <bool>,   // true if the action is disabled and false if it is enabled. Default is enabled
 *     title: <string>,    // used as the title attribute when appropriate
 *     shortcut: <string>, // keyboard shortcut to invoke action
 *     // these are for action actions
 *     href: <string>,     // for actions that navigate set href to the URL and don't set an action function
 *     action: <function>, // function(event, focusElement) return true if focus set
 *     // the following are for toggle actions only
 *     get: <function>,    //
 *     set: <function>,    //
 *     onLabel: <string>,
 *     offLabel: <string>
 * }
 *
 * The apex.actions singleton manages all the actions. Use it to add, remove, and lookup actions.
 * Additional state can be stored in the action if desired.
 * If any of the Action properties change then apex.actions.update must be called.
 *
 * Actions are associated with other controls that invoke the action. It is also possible to invoke
 * the action explicitly with the apex.actions.invoke method. The following describes how to associate
 * actions with various controls.
 *
 * Buttons:
 * To associate a button element with an action give it a class of js-actionButton and a data-action
 * attribute with the name of the action as its value. The button icon, label text, title, aria-label and disabled state
 * are all updated automatically. For this automatic updating to work buttons should use the following classes:
 *   t-Button-label if a button has a text label this class should be on an element that wraps the text.
 *       This is usefull when the button also has an icon or other non text label content. This class does not
 *       go on the button element. If this class is not used then the content of the button element will be the
 *       label text.
 *   t-Button--icon if a button has an icon this class should be on the button element. If the action has an
 *       icon and the button has this class then any elements with the icon type class will be updated with
 *       the icon. Any classes on the icon element that are not the icon, the icon type or start with "t-"
 *       will get removed.
 *   t-Button--noLabel if a button has no visible label this class should be on the button element. A button with
 *       no visible label text will have the button's aria-label attribute set to the button label. Also if there
 *       is no title the label will be used as the title.
 * If the action label or title are null they will be initialized with the text and title attribute value respectively
 * from the first button (in document order) associated with the action. This is useful if the server has
 * already rendered a localized button for the action. The title comes from the button title attribute. The label comes
 * from the first found of; aria-label attribute, title attribute if button has class t-Button--noLabel,
 * content of the descendent element with class t-Button-label, and finally the button element content.
 *
 * Example:
 * <button class="js-actionButton" data-action="undo">Undo</button>
 *
 * Menu items:
 * For menu items of type action or toggle simply specify the action name as the value of the action property.
 * Values for label, icon, iconType, disabled, and accelerator are taken from the action (accelerator is taken from
 * the action shortcut property). It is possible to override action values such as label and icon by specifying them
 * in the menu item.
 * Examples:
 *   { type: "action", action: "undo" },
 *   { type: "toggle", action: "myToggleAction" }
 *
 * Shortcuts:
 * Shortcuts are not an actual widget. The keyboard event handler for invoking actions in response to shortcut keys
 * is in this module and is registered on the body element. The shortcut name must be given in the following format:
 *   [Ctrl+][Alt+][Meta+][Shift+]<key>
 * Order and case is important. See mapKeyToName for a list of keys. Key names and modifiers are not localized.
 * The primary shortcut for an action is specified in the shortcut property of the action object. This is so that
 * it can be shown in associated menu items. Additional shortcuts can be added with addShortcut.
 *
 * To integrate actions with other controls:
 * - devise a way to specify the action name
 * - register an observer call back to get notified when the action is added, removed, or updated
 * - call the invoke method when it is time to invoke the action
 *
 * todo:
 * - for shortcuts is there a need to ignore the key when target matches a given selector?
 * - consider if there is any need to scope keyboard handling to a div
 * - menubar support for action menu items in menu bar
 *
 * Future:
 *  - Consider support for labelKey like in menu widget
 *  - Support radio group action
 *
 * Depends on these strings being defined in the apex.lang message facility
 *     APEX.ACTIONS.TOGGLE
 *
 * Depends:
 *      debug.js
 *      lang.js
 *      navigation.js
 */
(function ( apex, debug, lang, $, undefined ) {
    "use strict";

    var SEL_ACTION_BUTTON = "button.js-actionButton",
        A_LABEL = "aria-label";

    var mapKeyToName = {
        6: "Help",
        8: "Backspace",
        9: "Tab",
        13: "Enter",
        27: "Escape",
        32: "Space",
        33: "Page Up",
        34: "Page Down",
        35: "End",
        36: "Home",
        37: "Left",
        38: "Up",
        39: "Right",
        40: "Down",
        45: "Insert",
        46: "Delete",
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        65: "A",
        66: "B",
        67: "C",
        68: "D",
        69: "E",
        70: "F",
        71: "G",
        72: "H",
        73: "I",
        74: "J",
        75: "K",
        76: "L",
        77: "M",
        78: "N",
        79: "O",
        80: "P",
        81: "Q",
        82: "R",
        83: "S",
        84: "T",
        85: "U",
        86: "V",
        87: "W",
        88: "X",
        89: "Y",
        90: "Z",
        96: "Keypad 0",
        97: "Keypad 1",
        98: "Keypad 2",
        99: "Keypad 3",
        100: "Keypad 4",
        101: "Keypad 5",
        102: "Keypad 6",
        103: "Keypad 7",
        104: "Keypad 8",
        105: "Keypad 9",
        106: "Keypad *",
        107: "Keypad +",
        109: "Keypad -",
        110: "Keypad .",
        111: "Keypad /",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        188: "Comma",
        190: "Period",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]"
    };

    var isMac = navigator.appVersion.indexOf("Mac") >= 0;

    function makeKeyName(event) {
        var name = "",
            k = mapKeyToName[event.which];

        // keys that produce a character require at least one modifier other than shift
        if ( k && ((event.which >= 112 && event.which <= 123) || ( event.which >= 33 && event.which <= 46 ) || (event.ctrlKey || event.altKey || event.metaKey)) ) {
            if ( event.ctrlKey ) {
                name += "Ctrl+";
            }
            if ( event.altKey ) {
                name += "Alt+";
            }
            if ( event.metaKey ) {
                name += "Meta+";
            }
            if ( event.shiftKey ) {
                name += "Shift+";
            }
            name += k;
            return name;
        }
        return null;
    }

    function getActionLabel( action ) {
        var label = action.label;
        if ( !label && action.onLabel && action.offLabel ) {
            label = action.onLabel + "/" + action.offLabel;
        } else if ( action.set && action.get ) {
            label = lang.formatMessage( "APEX.ACTIONS.TOGGLE", label );
        }
        return label;
    }

    var actions = ( function() {
        var actionMap = {},
            actionShortcut = {},
            shortcutMap = {},
            observers = [],
            shortcutsDisabled = false;

        function notifyObservers( action, operation ) {
            var i, callback;

            for ( i = 0; i < observers.length; i++ ) {
                callback = observers[i];
                callback( action, operation );
            }
        }

        return {

            add: function( actions ) {
                var i, a, status = true;

                if ( !$.isArray( actions ) ) {
                    actions = [actions];
                }
                for ( i = 0; i < actions.length; i++ ) {
                    a = actions[i];
                    if ( a.name ) {
                        if ( !actionMap[a.name] ) {
                            actionMap[a.name] = a;
                            if ( a.shortcut ) {
                                if ( !this.isValidShortcut( a.shortcut )) {
                                    debug.warn( "Invalid shortcut '" + a.shortcut + "' for action '" + a.name + "' ignored.");
                                    a.shortcut = null;
                                    status = false;
                                } else if ( !shortcutMap[a.shortcut] ) {
                                    actionShortcut[a.name] = a.shortcut;
                                    shortcutMap[a.shortcut] = a.name;
                                } else {
                                    debug.warn( "Duplicate shortcut '" + a.shortcut + "' for action '" + a.name + "' ignored.");
                                    a.shortcut = null;
                                    status = false;
                                }
                            }
                            notifyObservers( a, "add" );
                        } else {
                            debug.warn( "Duplicate action '" + a.name + "' ignored.");
                            status = false;
                        }
                    }
                }
                return status;
            },

            /**
             * The markup expected by this method overlaps with what a menu expects. Keep this code in sync with menu widget.
             *
             * Expected markup:
             * An element with a ul child. The ul has one or more li elements each one representing an action.
             * The li element can have either an "a" or span element.
             * Action property      Comes from
             * name                 li[data-id]
             * label                a or span content
             * title                a[title] or span[title]
             * href                 a[href]
             * disabled             true iff li[data-disabled=true]
             * shortcut             li[data-shortcut]
             * icon                 li[data-icon] if the value has a space the icon is the word after the space otherwise it is the whole value
             * iconType             li[data-icon] if the value has a space the type is the word before the space
             *
             * If there is no name or label or the value of href equals "separator" or if attribute data-hide equals true
             * then no action is created for that li.
             *
             * If the li has a ul child the ul is processed recursively.
             *
             * @param el$
             */
            addFromMarkup: function ( el$ ) {
                var self = this;

                el$.children( "ul" ).children( "li" ).each(function() {
                    var action, icon, index,
                        title = null,
                        $item = $( this ),
                        a$ = $item.children( "a" ).eq( 0 ),
                        span$ = $item.children( "span" ).eq( 0 );

                    action = { };
                    if ( a$.length > 0 ) {
                        action.label = a$.text();
                        action.href = a$.attr("href");
                        title = a$.attr("title");
                    } else if ( span$.length > 0 ) {
                        action.label = span$.text();
                        title = span$.attr("title");
                    }
                    if ( title ) {
                        action.title = title;
                    }
                    action.name = $item.attr( "data-id" );
                    if ( $item.attr("data-hide") === "true" ) {
                        // don't define the action if it is hidden
                        return;
                    }
                    if ( $item.attr("data-disabled") === "true" ) {
                        action.disabled = true;
                    }
                    action.shortcut = $item.attr("data-shortcut") || null;

                    icon = $item.attr("data-icon");
                    if ( icon ) {
                        index = icon.indexOf( " " );
                        if ( index >= 0 ) {
                            action.iconType = icon.substring( 0, index );
                            action.icon = icon.substring( index + 1 );
                        } else {
                            action.icon = icon;
                        }
                    }
                    // without a name or a label there is no action also separators are not actions
                    if ( action.name && action.label && action.href !== "separator" ) {
                        self.add( action );
                    }
                    if ( $item.children( "ul" ).length > 0 ) {
                        self.addFromMarkup( $item );
                    }
                });
            },

            remove: function( actions ) {
                var i, a, name, shortcut;

                if ( !$.isArray( actions ) ) {
                    actions = [actions];
                }
                for ( i = 0; i < actions.length; i++ ) {
                    a = actions[i];
                    name = typeof a === "string" ? a : a.name;
                    if ( name && actionMap[name] ) {
                        a = actionMap[name];
                        shortcut = actionMap[name].shortcut;
                        if ( shortcut ) {
                            delete shortcutMap[shortcut];
                        }
                        delete actionMap[name];
                        delete actionShortcut[name];
                        notifyObservers( a, "remove" );
                    }
                }
            },

            clear: function() {
                var name, a;

                // unfiltered loop OK because actionMap is private
                for ( name in actionMap ) {
                    a = actionMap[name];
                    notifyObservers( a, "remove" );
                }
                actionMap = {};
                actionShortcut = {};
                shortcutMap = {};
            },

            lookup: function( actionName ) {
                return actionMap[actionName];
            },

            list: function() {
                var actionName, action, label,
                    actions = [];

                // unfiltered loop OK because actionMap is private
                for ( actionName in actionMap ) {
                    action = actionMap[actionName];
                    label = getActionLabel( action );
                    actions.push({
                        name: actionName,
                        label: label
                    });
                }
                return actions;
            },

            update: function( actionName ) {
                var a = actionMap[actionName],
                    oldShortcut = actionShortcut[actionName],
                    status = true;

                if ( a.shortcut !== oldShortcut ) {
                    delete shortcutMap[oldShortcut];
                    if ( !a.shortcut ) {
                        // remove shortcut
                        delete actionShortcut[actionName];
                    } else {
                        if ( !this.isValidShortcut( a.shortcut )) {
                            debug.warn( "Invalid shortcut '" + a.shortcut + "' for action '" + a.name + "' ignored.");
                            a.shortcut = null;
                            status = false;
                        } else if ( !shortcutMap[a.shortcut] ) {
                            actionShortcut[actionName] = a.shortcut;
                            shortcutMap[a.shortcut] = actionName;
                        } else {
                            debug.warn( "Duplicate shortcut '" + a.shortcut + "' for action '" + actionName + "' ignored.");
                            a.shortcut = null;
                            status = false;
                        }
                    }
                }
                notifyObservers( a, "update" );
                return status;
            },

            // convenience method to enable without having to do lookup and update
            enable: function( actionName ) {
                var a = actionMap[actionName];
                a.disabled = false;
                // the shortcut didn't change so no need to call update
                notifyObservers( a, "update" );
            },

            // convenience method to disable without having to do lookup and update
            disable: function( actionName ) {
                var a = actionMap[actionName];
                a.disabled = true;
                // the shortcut didn't change so no need to call update
                notifyObservers( a, "update" );
            },

            /**
             * Invoke the named action.
             *
             * @param actionName
             * @param event
             * @param focusElement
             * @return {*} false if there is no such action or action has no action method, true if action set the focus
             * all other cases should return undefined
             */
            invoke: function( actionName, event, focusElement ) {
                var a = actionMap[actionName];

                if ( a && ( a.action || a.href ) ) {
                    if ( !a.disabled ) {
                        if ( a.action ) {
                            return a.action( event, focusElement );
                        } else {
                            // it must be href
                            apex.navigation.redirect( a.href );
                            return true;
                        }
                    }
                } else {
                    debug.error( "No such action '" + actionName + "' or action can't be invoked." );
                    return false;
                }
            },

            /**
             * Toggle the named action.
             *
             * @param actionName
             * @return {Boolean} false if there is no such action or action doesn't have get/set methods
             * all other cases should return undefined
             */
            toggle: function( actionName ) {
                var value,
                    a = actionMap[actionName];

                if ( a && a.get && a.set ) {
                    if ( !a.disabled ) {
                        value = !a.get();
                        a.set( value );
                        actions.update( actionName );
                    }
                } else {
                    debug.error( "No such action '" + actionName + "' or action cannot be toggled." );
                    return false;
                }
            },

            lookupShortcutAction: function( shortcutName )  {
                if ( shortcutsDisabled ) {
                    return; // undefined
                }
                return shortcutMap[shortcutName];
            },

            addShortcut: function( shortcutName, actionName ) {
                if ( !actionMap[actionName] ) {
                    debug.warn( "No such action '" + actionName + "'.");
                    return false;
                }
                if ( !shortcutMap[shortcutName] ) {
                    shortcutMap[shortcutName] = actionName;
                } else {
                    debug.warn( "Duplicate shortcut '" + shortcutName + "' for action '" + actionName + "' ignored.");
                    return false;
                }
                return true;
            },

            removeShortcut: function( shortcutName ) {
                var actionName;

                actionName = shortcutMap[shortcutName];
                if (actionShortcut[actionName] === shortcutName ) {
                    debug.warn( "Can't delete primary for action.");
                    return false;
                }
                delete shortcutMap[shortcutName];
                return true;
            },

            listShortcuts: function() {
                var shortcutName, actionName, action, label,
                    shortcuts = [];

                // unfiltered loop OK because shortcutMap is private
                for (shortcutName in shortcutMap) {
                    actionName = shortcutMap[shortcutName];
                    action = actionMap[actionName];
                    label = getActionLabel( action );

                    shortcuts.push({
                        shortcut: shortcutName,
                        shortcutDisplay: this.shortcutDisplay( shortcutName ),
                        actionName: actionName,
                        actionLabel: label
                    });
                }
                return shortcuts;
            },

            shortcutDisplay: function( shortcut ) {
                var i,
                    display = "",
                    parts = shortcut.split("+");

                for ( i = 0; i < parts.length; i++ ) {
                    if ( i > 0 ) {
                        display += "+";
                    }
                    if ( isMac ) {
                        if ( parts[i] === "Alt" ) {
                            display += "Option";
                        } else if ( parts[i] === "Meta" ) {
                            display += "\u2318";
                        } else {
                            display += parts[i];
                        }
                    } else {
                        display += parts[i];
                    }
                }
                return display;
            },

            enableShortcuts: function() {
                shortcutsDisabled = false;
            },

            disableShortcuts: function() {
                shortcutsDisabled = true;
            },

            observe: function( callback ) {
                observers.push( callback );
            },

            unobserve: function( callback ) {
                var i;

                for ( i = 0; i < observers.length; i++ ) {
                    if ( observers[i] === callback ) {
                        observers.splice(i, 1);
                        break;
                    }
                }
            },

            // This is used by UI that allows entering a shortcut name by typing that key combination
            getShortcutFromEvent: function( event ) {
                var keyName = makeKeyName( event );
                if ( keyName ) {
                    return {
                        shortcut: keyName,
                        shortcutDisplay: this.shortcutDisplay( keyName )
                    };
                }
                return null;
            },

            isValidShortcut: function( shortcutName, checkIfUsed ) {
                var i, part, nextPos, key,
                    pos = 0,
                    valid = true,
                    parts = shortcutName.split("+");

                // check all the modifiers
                for ( i = 0; i < parts.length - 1; i++ ) {
                    part = parts[i];
                    if ( part === "Ctrl" ) {
                        nextPos = 1;
                    } else if ( part === "Alt" ) {
                        nextPos = 2;
                    } else if ( part === "Meta" ) {
                        nextPos = 3;
                    } else if ( part === "Shift" ) {
                        nextPos = 4;
                    } else {
                        valid = false;
                        break;
                    }
                    if ( nextPos <= pos ) {
                        valid = false;
                        break;
                    }
                    pos = nextPos;
                }
                if ( valid ) {
                    part = parts[i]; // the key name
                    // now assume not valid
                    valid = false;
                    // find keyname in map
                    for ( key in mapKeyToName ) {
                        if ( mapKeyToName[key] === part) {
                            valid = true;
                            break;
                        }
                    }
                    // make sure keys that require a modifier have one
                    // todo this test could be a little more correct
                    if ( valid && pos === 0 && part.length === 1) {
                        valid = false;
                    }
                    if ( valid && checkIfUsed && shortcutMap[shortcutName] ) {
                        valid = false;
                    }
                }
                return valid;
            }
        };
    } )();
    apex.actions = actions;

    // todo allow customizing these selectors
    var buttonLabelSelector = ".a-Button-label, .t-Button-label", // how to find where to update the label text
        buttonHasIconSelector = ".a-Button--withIcon, .t-Button--icon", // how to tell if a button has an icon
        buttonNoLabelSelector = ".a-Button--noLabel, .t-Button--noLabel"; // how to tell if a button has no label text

    actions.observe(function( action, op ){
        var name = action.name,
            button$ = $("[data-action="+ name +"]");

        if ( op !== "remove") {
            // update button
            button$.each( function() {
                var iconType, label, value, title, labelWrapper$,
                    isToggle = false,
                    b$ = $(this);

                b$.show();

                if ( action.get ) {
                    isToggle = true;
                    value = action.get();
                }

                if ( op === "add" ) {
                    // initialize action text from button
                    // the label of a toggle button can't come from the button markup
                    if ( action.label === null && !isToggle ) {
                        if ( b$.attr( A_LABEL ) ) {
                            // if there is a label for AT use that as the label
                            action.label = b$.attr( A_LABEL );
                        } else if ( b$.is( buttonNoLabelSelector )) {
                            // if there is no button label text use the title
                            action.label = b$.attr( "title" );
                        } else {
                            // if the label is in a .t/.a-Button-label span use that otherwise its the whole text content of the button
                            action.label = b$.find( buttonLabelSelector ).first().text() || b$.text();
                        }
                    }
                    if ( action.title === null ) {
                        action.title = b$.attr( "title" );
                        // The above code should handle most cases of finding the label but just in case fall back to the title
                        if ( !action.label && action.title ) {
                            action.label = action.title;
                        }
                    }
                    // there is no reliable way to get the icon from the markup
                }

                label = action.label;
                title = action.title;
                if ( !label && isToggle ) {
                    label = value ? action.onLabel : action.offLabel;
                }

                // update label, title, icon, disabled
                if ( b$.is( buttonNoLabelSelector ) ) {
                    b$.attr( A_LABEL, label );
                    // on a button with no label and no title force the title to be the label
                    if ( !title ) {
                        title = label;
                    }
                } else {
                    labelWrapper$ = b$.find( buttonLabelSelector ).first();
                    if ( labelWrapper$.length ) {
                        labelWrapper$.text( label );
                    } else {
                        b$.text( label );
                    }
                }

                if ( title ) {
                    b$.attr( "title", title );
                } else {
                    b$.removeAttr( "title" );
                }

                if ( action.icon && ( b$.is( buttonHasIconSelector ) ) ) {
                    iconType = action.iconType || "a-Icon";
                    // icons don't typically have classes besides the one for icon type and icon but if they do
                    // assume they all start with "t-".
                    // todo consider if the prefix or set of classes to keep should be customizable
                    // todo this doesn't handle the case where a button has more than one icon
                    b$.find( "." + iconType ).each( function() {
                        var icon$ = $( this ),
                            newClasses = [],
                            classes = icon$.attr( "class" );

                        $.each( classes.split( " " ), function( i, c ) {
                            if ( /^t-/.test( c ) ) {
                                newClasses.push( c );
                            }
                        } );
                        newClasses.push(iconType);
                        newClasses.push(action.icon);
                        icon$.attr( "class", newClasses.join( " " ) );
                    });
                }

                if ( isToggle && !action.onLabel ) {
                    b$.toggleClass( "is-active", value );
                }

                this.disabled = !!action.disabled;
            } );
        } else {
            button$.hide();
        }
    });

    /*
     * Handle actions buttons and keyboard shortcuts
     */
    $( document ).ready( function() {

        function doAction( actionName, event, logPrefix ) {
            var action, result, value;

            try {
                action = actions.lookup( actionName );
                if ( !action ) {
                    debug.error( "No such action '" + actionName + "'." );
                    return;
                }

                if ( action.disabled ) {
                    return;
                }

                if ( action.action || action.href ) {
                    debug.info( logPrefix + " invoke action '" + actionName + "'");
                    result = actions.invoke( actionName, event, event.target );
                    if ( result === false ) {
                        return;
                    }
                } else if ( action.get && action.set ) {
                    value = !action.get();
                    debug.info( logPrefix + " invoke toggle action '" + actionName + "' value now " + value);
                    action.set( value );
                    actions.update( actionName );
                } else {
                    debug.error("Error action '" + actionName + "' has no action, get, or set methods." );
                }
            } catch ( ex ) {
                // ignore error so focus can be set
                debug.error("Error in action for '" + actionName + "'.", ex );
            }

            if ( result !== true ) {
                event.target.focus();
            }
        }

        $( "body" ).on( "click", SEL_ACTION_BUTTON, function( event ) {
            var actionName = $( this ).attr( "data-action" );

            doAction( actionName, event, "Button click" );

        } ).on( "keydown", function ( event ) {
            var actionName,
                keyName = makeKeyName( event );

            if ( keyName ) {
                if ( event.target.nodeName === "TEXTAREA" || event.target.nodeName === "INPUT" && event.target.type.toLowerCase() === "text" ) {
                    // ignore keys that are handled by the browser
                    if ( ["Ctrl+C", "Ctrl+X", "Ctrl+V", "Ctrl+A", "Ctrl+Z", "Ctrl+Y"].indexOf( keyName ) >= 0 ) {
                        return;
                    }
                }
                actionName = actions.lookupShortcutAction( keyName );
                if ( actionName ) {
                    doAction( actionName, event, "Shortcut key" );
                }
            }
        } ).on( "dialogopen menubeforeopen", function( event ) {
            actions.disableShortcuts();
        } ).on( "dialogclose menuafterclose", function( event ) {
            actions.enableShortcuts();
        } );
    });

})( apex, apex.debug, apex.lang, apex.jQuery );

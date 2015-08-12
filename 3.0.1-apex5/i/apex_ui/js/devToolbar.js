/*global apex,alert,Modernizr,self,window,$v*/
/**
 @license
 Oracle Database Application Express, Release 5.0
 Copyright (c) 2013, 2015, Oracle. All rights reserved.
 */
/**
 * @fileOverview
 * Developer Toolbar controller
 *
 * depends on:
 *   util
 *   navigation
 *   storage
 *   widget.menu
 * Optional integration with ui.dialog
 **/
(function( $, util, nav, storage ) {
    "use strict";

    var BUILDER_WINDOW_NAME = "APEX_BUILDER", // keep in sync with builder.js
        DEV_TOOLBAR_KEY = "ORA_WWV_apex.builder.devToolbar",
        THEMEROLLER_KEY = "ORA_WWV_apex.builder.themeRoller", // keep in sync with utr.js
        QUICK_EDIT_CURSOR = "crosshair",
        THEMEROLLER_BASE = window.apex_img_dir + "apex_ui/theme_roller/",
        CODEMIRROR_BASE = window.apex_img_dir + "libraries/codemirror/4.4/",
        COLORPICKER_BASE = window.apex_img_dir + "libraries/d3.oracle.colorpicker/0.1/",
        PALETTE_BASE = window.apex_img_dir + "libraries/d3.oracle.palette/0.1/",
        D3_BASE = window.apex_img_dir + "libraries/d3/3.3.11/";

    var gDevToolbarSessionStore = storage.getScopedSessionStorage( { prefix: DEV_TOOLBAR_KEY, useAppId: false } ),
        gDevToolbarLocalStore =  storage.getScopedLocalStorage( { prefix: DEV_TOOLBAR_KEY, useAppId: false } ),
        gThemeRollerSessionStore =  storage.getScopedSessionStorage( { prefix: THEMEROLLER_KEY, useAppId: true } );

    /*
     * If jQuery dialog is available make it dev toolbar aware
     * This allows the dev toolbar to be used while a dialog is open
     */
    if ( $.ui.dialog ) {
        $.widget( "ui.dialog", $.ui.dialog, {
            _allowInteraction: function(event) {
                // todo is overlay class needed?
                return $( event.target ).closest(".a-DevToolbar, #apexDevToolbarMenu, .u-Overlay--quickEdit").length > 0 || this._super(event);
            }
        });
    }

    //
    // Begin private dev toolbar code
    //
    var gContextStack = [],
        // For quick edit component locator
        boxes = null,
        overlay = null,
        outline = null,
        started = false,
        storedStylesheet = null,
        storedCursor = null;

    function getThemeRollerInit(themeId, builderSessionId, callback) {
        var maxc = 5;
        var c = 0;
        var f = (function() {
            if ($.universalThemeRoller) {
                $.universalThemeRoller({
                    filePaths : {
                        utrScript: THEMEROLLER_BASE + "utr.js",
                        utrStylesheet: THEMEROLLER_BASE + "utr.css",
                        lessCompilerScript: THEMEROLLER_BASE + "less.js",
                        jQueryUiComponentsScript: THEMEROLLER_BASE + "jquery-ui.utr.js",
                        //colorPickerStylesheet: COLORPICKER_BASE + "css/colorpicker.css",
                        //colorPickerScript: COLORPICKER_BASE + "js/colorpicker.js",
                        codeMirrorScript: CODEMIRROR_BASE + "lib/codemirror.js",
                        codeMirrorCSSModeScript: CODEMIRROR_BASE + "mode/css/css.js",
                        codeMirrorStylesheet: CODEMIRROR_BASE + "lib/codemirror.css",
                        codeMirrorThemeStylesheet: CODEMIRROR_BASE + "theme/mbo.css",
                        d3Script: D3_BASE + "d3.min.js",
                        d3ColorPickerScript: COLORPICKER_BASE + "d3.oracle.colorpicker.js",
                        d3ColorPickerStylesheet: COLORPICKER_BASE + "d3.oracle.colorpicker.css",
                        d3PaletteScript: PALETTE_BASE + "d3.oracle.palette.js",
                        d3PaletteStylesheet: PALETTE_BASE + "d3.oracle.palette.css"
                    },
                    config : {
                        themeId: themeId,
                        builderSessionId: builderSessionId
                    }
                });
                if (callback && (typeof callback === 'function') ) {
                    callback();
                }
            } else if (c < maxc) {
                setTimeout( f, 100 );
                c++;
            }
        });
        return f;
    }

    function getUrl( button$ ) {
        return button$.attr("data-link");
    }

    // Return the opener window that is the apex builder window.
    function getApexBuilderFromOpenerChain( wnd ) {
        // if *this* is the builder window then don't care what the opener is
        // a builder opening the builder can result in a stale instance without this check
        if ( isBuilderWindow( wnd ) ) {
            return null;
        }
        try {
            if ( wnd.opener && !wnd.opener.closed && wnd.opener.apex && wnd.opener.apex.jQuery ) {
                // builder urls are in the 4000s
                if ( wnd.opener.location.href.match(/f?p=4\d\d\d:/) ||
                        wnd.opener.document.getElementById( "pFlowId" ).value.match(/^4\d\d\d$/) ) {
                    return wnd.opener;
                } else {
                    // Follow the opener chain to support non-modal (popup window) apex pages
                    return getApexBuilderFromOpenerChain( wnd.opener );
                }
            }
        } catch ( ex ) {
            return null; // window must contain a page from another domain
        }
        return null;
    }

    function isBuilderWindow(wnd) {
        return wnd.name && wnd.name.match( "^" + BUILDER_WINDOW_NAME );
    }

    function getBuilderInstance() {
        var builderWindow = getApexBuilderFromOpenerChain( window );
        if ( builderWindow ) {
            return builderWindow.document.getElementById( "pInstance" ).value;
        }
        return null;
    }

    function getBuilderUrl( url ) {
        var instance, parts;

        instance = getBuilderInstance();
        if ( instance ) {
            parts = url.split(":");
            parts[2] = instance;
            url = parts.join(":");
        }
        return url;
    }

    var contextPrototype = {
        navigateInPageDesigner: function( appId, pageId, typeId, componentId, errorFn ) {
            var builderWindow = getApexBuilderFromOpenerChain( window );

            if ( builderWindow && builderWindow.pageDesigner ) {
                builderWindow.pageDesigner.setPageSelection( appId, pageId, typeId, componentId, function( result ) {
                    if ( result !== "OK" && result !== "PAGE_CHANGE_ABORTED" ) {
                        errorFn();
                    }
                });
                // Focus the builder window now while still handling the click event even though controlling the page designer may still fail
                nav.openInNewWindow( "", BUILDER_WINDOW_NAME, { altSuffix: getBuilderInstance() } );
            } else {
                errorFn();
            }
        },
        builderWindow: function( action ) {
            this.builderWindowUrl( getBuilderUrl( this.actions[action] ) );
        },

        builderWindowUrl: function( url ) {
            var instance = getBuilderInstance();

            // if this is the builder window then don't try to manage another window just navigate
            if ( isBuilderWindow( window ) || this.windowMgmtMode === "NONE" ) {
                nav.redirect( url );
            } else {
                if ( !instance ) {
                    alert( this.text.noBuilderMessage );
                    // just open the builder url in this window; turning this widow into a/the builder window
                    window.name = ""; // let the builder take over this window
                    nav.redirect( url );
                } else {
                    nav.openInNewWindow( url, BUILDER_WINDOW_NAME, { altSuffix: instance } );
                }
            }
        },

        popup: function( action ) {
            nav.popup( {
                url:    getBuilderUrl( this.actions[action] ),
                name:   "view_debug",
                width:  1024,
                height: 768
            });
        },

        sameWindow: function( action ) {
            var match,
                url = this.actions[action];

            if (this.window === window) {
                nav.redirect( url );
            } else {
                // navigate in the nested iframe
                // we don't want to open or close and open the dialog again we just want to refresh the page
                match = /apex.navigation.dialog\(['"]([^'"]*)['"]/.exec(url);
                if ( match ) {
                    url = match[1];
                    // decode escaped characters
                    url = url.replace(/\\u(\d\d\d\d)/g, function(val, ch) {
                        return String.fromCharCode(parseInt(ch, 16));
                    });
                }
                this.window.location.href = url;
            }
        },

        // DOM locate code
        initLocateBoxes: function() {
            var i, comp$, pos, comp;

            boxes = [];
            for ( i = this.components.length - 1; i >= 0; i-- ) {
                comp = this.components[i];
                comp$ = $( "#" + util.escapeCSS( comp.domId ), this.document ).filter( ":visible" );
                if ( !comp$.length ) {
                    continue;
                }
                pos = comp$.offset();

                boxes.push({
                    node: comp$[0],
                    pageId: comp.pageId,
                    typeId: comp.typeId,
                    componentId: comp.id,
                    top: pos.top,
                    bottom: pos.top + comp$.outerHeight(),
                    left: pos.left,
                    right: pos.left + comp$.outerWidth()
                });
            }
        },

        endDomLocate: function() {
            $( this.document ).off( ".locate" );
            $( document ).off( ".locate" );
            $( window ).off( ".locate" );
            $( this.document.body ).css( "cursor", storedCursor );
            storedStylesheet.remove();
            overlay.remove();
            outline.remove();
            started = false;
        },

        beginDomLocate: function( action ) {
            var self = this,
                lastBox = null,
                body$ = $( this.document.body );

            this.initLocateBoxes();
            lastBox = null;
            // if locating in the top level document (the same one the toolbar is in) then the delegated click handler
            // added to the document will be hit ending the locating before we even begin so in that case delay start until after the click
            started = this.document !== document;
            overlay = $( "<div class='u-Overlay u-Overlay--quickEdit'></div>" ).appendTo( body$ );
            outline = $( "<div id='foo' class='a-DevToolbar-uiSelector'></div>" ).appendTo( body$ );
            storedCursor = body$.css( "cursor" );
            storedStylesheet = $( "<style>*{ cursor: " + QUICK_EDIT_CURSOR + " !important; }</style>" ).appendTo( body$ );
            body$.css( "cursor", QUICK_EDIT_CURSOR );

            function inBox(x, y, box) {
                return ( y > box.top && y < box.bottom && x > box.left && x < box.right );
            }

            $( this.document ).on( "mousemove.locate", function( event ) {
                var i, box, pos, h, w, foundBox, node$,
                    x = event.pageX,
                    y = event.pageY;

                if ( !started ) {
                    started = true;
                }
                foundBox = null;
                for ( i = 0; i < boxes.length; i++ ) {
                    box = boxes[i];
                    if ( inBox( x, y, box ) ) {
                        foundBox = box;
                        break;
                    }
                }
                if ( lastBox !== foundBox ) {
                    lastBox = foundBox;
                    if ( lastBox === null ) {
                        outline.hide();
                    } else {
                        outline.show();
                        node$ = $( box.node );
                        pos = node$.offset();
                        h = node$.outerHeight();
                        w = node$.outerWidth();
                        outline.css({top: pos.top + "px", left: pos.left + "px"});
                        outline.height(h);
                        outline.width(w);
                    }
                }
            } ).on("click.locate", function( event ) {
                if ( started ) {
                    self.endDomLocate();
                    if ( lastBox ) {
                        action( lastBox );
                    }
                    return false;
                } else {
                    started = true;
                }
            } );
            $( document ).on("keydown.locate", function( event ) {
                if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
                    self.endDomLocate();
                }
            } );
        },

        quickEdit: function() {
            var self = this;

            if ( started ) {
                this.endDomLocate();
            } else {
                this.beginDomLocate( function( el ) {
                    var parts, urlParts,
                        url = getBuilderUrl( self.actions.quickEdit );

                    self.navigateInPageDesigner( self.currentApp, el.pageId, el.typeId, el.componentId, function() {
                        // if that fails navigate to correct place
                        if ( el.pageId !== self.currentPage ) {
                            urlParts = url.split( ":" );
                            parts = urlParts[ urlParts.length - 1 ].split( "," );
                            parts[1] = parts[3] = parts[4] = el.pageId;
                            urlParts[ urlParts.length - 1 ] = parts.join( "," );
                            url = urlParts.join(":");
                        }
                        url += "#" + el.typeId + ":" + el.componentId;
                        self.builderWindowUrl( url );
                    } );

                });
            }
        },

        themeRoller: function() {
            var self = this;
            apex.debug.info( "ThemeId: %s, BuilderSessionId: %s", self.themeId, self.builderSessionId );

            var toggle = function() {
                if ( apex.utr && apex.utr.opened ) {
                    $.universalThemeRoller("close");
                } else {
                    $.universalThemeRoller("open");
                }
            };

            if ( $.universalThemeRoller ) {
                toggle();
            } else {
                var onThemeRollerLoad = getThemeRollerInit( self.themeId, self.builderSessionId, toggle );
                // No need to load utr-base.js, it should have already been loaded by now.
                $.getScript( THEMEROLLER_BASE + 'jquery.universalThemeRoller.js', onThemeRollerLoad );
            }
        }
    };

    function fixToolbarWidth() {
        var tbWidth, windowWidth,
            dtb$ = $( "#apexDevToolbar" );

        if ( dtb$.is(".a-DevToolbar--top, .a-DevToolbar--bottom") ) {
            windowWidth = $( window ).width();
            dtb$.css( {"width": "", "white-space": "nowrap"} ); // clear element width to get desired width of ul content
            tbWidth = dtb$.children( "ul" ).first().outerWidth( true ) + 4; // IE wants just a little extra to keep the buttons from wrapping
            if ( tbWidth > windowWidth ) {
                tbWidth = windowWidth;
            }
            dtb$.css( { "left": (windowWidth - tbWidth) / 2, "white-space": "normal" });
            dtb$.width( tbWidth );
        } else {
            dtb$.css( "left", "" );
            dtb$.css( "width", "" );
        }
    }

    function updateButtons( ctx ) {
        $( "#apexDevToolbarApp" ).attr("title", ctx.appTitle ).find(".a-DevToolbar-buttonLabel" ).text( ctx.appTitle );
        $( "#apexDevToolbarPage" ).attr("title", ctx.pageTitle ).find(".a-DevToolbar-buttonLabel" ).text( ctx.pageTitle );
        $( "#apexDevToolbarDebug" ).attr("title", ctx.debugTitle ).find(".a-DevToolbar-buttonLabel" ).text( ctx.debugTitle );
        fixToolbarWidth();
    }

    function pushContext() {
        gContextStack.push( {} );
    }

    function setContext( toolbar$, wnd, components, windowMgmtMode, text, themeId ) {
        var that = Object.create( contextPrototype ),
            url = getBuilderUrl( getUrl( toolbar$.find( "#apexDevToolbarPage" ) ) ),
            parts = url.split( ":" )[7].split( "," );

        that.currentApp = parts[0];
        that.currentPage = parts[1];
        that.builderSessionId = url.split( ":" )[2];
        that.document = toolbar$[0].ownerDocument;
        that.window = wnd;
        that.actions = {
            home: getUrl( toolbar$.find( "#apexDevToolbarHome" ) ),
            app: getUrl( toolbar$.find( "#apexDevToolbarApp" ) ),
            page: getUrl( toolbar$.find( "#apexDevToolbarPage" ) ),
            session: getUrl( toolbar$.find( "#apexDevToolbarSession" ) ),
            viewDebug: getUrl( toolbar$.find( "#apexDevToolbarViewDebug" ) ),
            debug: getUrl( toolbar$.find( "#apexDevToolbarDebug" ) ),
            quickEdit: getUrl( toolbar$.find( "#apexDevToolbarQuickEdit" ) )
        };
        that.components = components;
        that.windowMgmtMode = windowMgmtMode;
        that.themeId = themeId;
        that.text = text;
        that.appTitle = toolbar$.find( "#apexDevToolbarApp" ).attr( "title" );
        that.pageTitle = toolbar$.find( "#apexDevToolbarPage" ).attr( "title" );
        that.debugTitle = toolbar$.find( "#apexDevToolbarDebug" ).attr( "title" );

        gContextStack[gContextStack.length - 1] = that;
        updateButtons( getContext() );
    }

    function popContext() {
        gContextStack.pop();
        updateButtons( getContext() );
    }

    function getContext() {
        var i;
        for ( i = gContextStack.length - 1; i >= 0; i-- ) {
            if ( gContextStack[i].currentApp !== undefined ) {
                return gContextStack[i];
            }
        }
        return null; // don't expect to get here
    }

    apex.initNestedDevToolbar = function( toolbar$, wnd, components, windowMgmtMode, text, themeId ) {
        setContext( toolbar$, wnd, components, windowMgmtMode, text, themeId );
    };

    /*
     * Must be called from document ready handler
     */
    apex.initDevToolbar = function( components, windowMgmtMode, text, themeId ) {
        var focused = false,
            menuOpen = false,
            // this menu is hooked up to the Options menu button by id
            optionsMenu$ = $( "<div id='apexDevToolbarMenu'></div>" ).appendTo( "body" ),
            hideTimer = null,
            // These options are persisted in local storage
            autoHide = false,
            iconsOnly = false,
            displayPosition = "bottom";

        function saveOptions() {
            if ( storage.hasLocalStorageSupport() ) {
                // Would love to use JSON.stringify but need to support IE7 (sure there are libraries
                // that provide a back-fill for JSON but we have no other need)
                gDevToolbarLocalStore.setItem( "options", '{"autoHide":' + autoHide + ',"iconsOnly":' + iconsOnly + ',"displayPosition":"' + displayPosition + '"}' );
            }
        }

        function loadOptions() {
            var options;

            options = gDevToolbarLocalStore.getItem( "options" );
            if ( options ) {
                try {
                    options = $.parseJSON( options );
                    autoHide = options.autoHide ? options.autoHide : autoHide;
                    iconsOnly = options.iconsOnly ? options.iconsOnly : iconsOnly;
                    displayPosition = /^(top|left|right|bottom)$/.test(options.displayPosition) ? options.displayPosition : displayPosition;
                } catch ( ex ) {
                    // Ignore any exception. If someone has messed with the options no worries the next saveOptions will set things right
                }
            }
        }

        function updateGrid( show ) {
            var state = show ? "on" : "off";

            $( "#grid_debug_on" ).parent().toggle( !show );
            $( "#grid_debug_off" ).parent().toggle( show );
            $( document ).trigger( "apex-devbar-grid-debug-" + state );
            gDevToolbarSessionStore.setItem( "grid", state );
            fixToolbarWidth();
        }
        updateGrid( gDevToolbarSessionStore.getItem( "grid" ) === "on" );

        // if this page is in an iframe (or frame) don't show the toolbar but do let the toolbar on the top window handle this page
        if ( self.apex !== util.getTopApex() ) {
            if ( util.getTopApex().initNestedDevToolbar ) {
                util.getTopApex().initNestedDevToolbar( $( "#apexDevToolbar" ), window, components, windowMgmtMode, text, themeId );
            }
            // If TR exists on the parent window, register this TR instance as a child
            // This TR instance Will receive instructions to modify the style of the 
            // document appropriately.
            if ( util.getTopApex().utr ) {
                window.apex.utr = {
                    nested: true
                };
                var onUTRLoad = function() {
                    if ( window.apex.utr.nest ) {
                        util.getTopApex().utr.nest && util.getTopApex().utr.nest( window.apex.utr );
                    } else {
                        setTimeout( onUTRLoad, 100 );
                    }
                };
                $.getScript( THEMEROLLER_BASE + "utr-base.js", onUTRLoad );
            }

            return;
        }

        var onThemeRollerLoad = getThemeRollerInit( themeId, getBuilderInstance(), function() { $.universalThemeRoller('open'); } );

        // utr-base must ALWAYS be loaded for proper iframe (read: modal) support.
        $.getScript( THEMEROLLER_BASE + 'utr-base.js', function(){
            // Load ThemeRoller scripts if it was already open.
            if ( gThemeRollerSessionStore.getItem( 'OPENED' ) === 'true' ) {
                $.getScript( THEMEROLLER_BASE + 'jquery.universalThemeRoller.js', onThemeRollerLoad );
            }
        });

        $( "#apexDevToolbarHome" ).click( function() {
            getContext().builderWindow( "home" );
        });

        $( "#apexDevToolbarApp" ).click( function() {
            getContext().builderWindow( "app" );
        });

        $( "#apexDevToolbarPage" ).click( function() {
            var ctx = getContext();

            // first try to tell the page designer what app and page
            ctx.navigateInPageDesigner( ctx.currentApp, ctx.currentPage, null, null, function() {
                // if that fails navigate to correct place
                ctx.builderWindow( "page" );
            } );
        });

        $( "#apexDevToolbarSession" ).click( function() {
            getContext().popup( "session" );
        });

        $( "#apexDevToolbarViewDebug" ).click( function() {
            getContext().popup( "viewDebug" );
        });

        $( "#apexDevToolbarDebug" ).click( function() {
            getContext().sameWindow( "debug" );
        });

        $( "#grid_debug_on" ).click( function() {
            updateGrid(true);
        });

        $( "#grid_debug_off" ).click( function() {
            updateGrid(false);
        } );

        $( "#apexDevToolbarQuickEdit" ).off( "click" ).click( function() {
            getContext().quickEdit();
        });

        $( "#apexDevToolbarThemeRoller" ).off( "click" ).click( function() {
            getContext().themeRoller();
        });

        optionsMenu$.menu({
            items: [
                { type: "toggle", label: text.autoHide, get: function () {
                    return autoHide;
                }, set: function ( v ) {
                    autoHide = v;
                    saveOptions();
                    $( "#apexDevToolbar" ).toggleClass( "a-DevToolbar--autoHide", autoHide );
                } },
                { type: "toggle", label: text.iconsOnly, get: function () {
                    return iconsOnly;
                }, set: function ( v ) {
                    iconsOnly = v;
                    saveOptions();
                    $( "#apexDevToolbar" ).toggleClass( "a-DevToolbar--iconsOnly", iconsOnly );
                    fixToolbarWidth();
                } },
                { type: "subMenu", label: text.display, menu: { items: [
                    {
                        type: "radioGroup",
                        get: function () {
                            return displayPosition;
                        },
                        set: function ( pValue ) {
                            displayPosition = pValue;
                            saveOptions();
                            $( "#apexDevToolbar" ).removeClass( "a-DevToolbar--top a-DevToolbar--left a-DevToolbar--bottom a-DevToolbar--right" );
                            $( "#apexDevToolbar" ).addClass( "a-DevToolbar--" + displayPosition );
                            fixToolbarWidth();
                        },
                        choices: [
                            { label: text.displayTop, value: "top" },
                            { label: text.displayLeft, value: "left" },
                            { label: text.displayBottom,  value: "bottom" },
                            { label: text.displayRight,  value: "right" }
                        ]
                    }
                ]}
                }
            ],
            beforeOpen: function() {
                menuOpen = true;
            }
        });

        loadOptions();

        $( "#apexDevToolbar" )
            .toggleClass( "a-DevToolbar--iconsOnly", iconsOnly )
            .toggleClass( "a-DevToolbar--autoHide", autoHide )
            .removeClass( "a-DevToolbar--top a-DevToolbar--left a-DevToolbar--bottom a-DevToolbar--right" )
            .addClass( "a-DevToolbar--" + displayPosition )
            .on( "focusin", function() {
                focused = true;
                menuOpen = false;
                $( this ).addClass( "is-active" );
            }).on( "focusout", function() {
                focused = false;
                if ( !menuOpen ) {
                    $( this ).removeClass( "is-active" );
                }
            }).on( "mouseenter", function() {
                if ( hideTimer !== null ) {
                    clearTimeout( hideTimer );
                    hideTimer = null;
                }
                $( this ).addClass( "is-active" );
            }).on( "mouseleave", function() {
                var self = this;
                hideTimer = setTimeout( function() {
                    hideTimer = null;
                    if ( !focused && !menuOpen ) {
                        $( self ).removeClass( "is-active" );
                    }
                }, 1000 );
            }).show();

        pushContext();
        setContext( $( "#apexDevToolbar" ), window, components, windowMgmtMode, text, themeId );

        $( window ).on( "apexwindowresized", function() {
            fixToolbarWidth();
        });

        $( document.body ).on( "dialogopen", function( event ) {
            pushContext(); // it may or may not be an APEX page, won't know till it loads but push a new context anyway
        } ).on( "dialogclose", function( event ) {
            popContext();
        } );

    };

})( apex.jQuery, apex.util, apex.navigation, apex.storage );

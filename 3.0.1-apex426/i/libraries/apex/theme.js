/*global apex,$x,$v*/
/**
 @license
 Oracle Database Application Express
 Copyright (c) 2012, 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex.theme} namespace is used to store functions used by all themes of Oracle Application Express.
 **/

/**
 * The {@link apex.theme} namespace is used to store functions used by all themes of Oracle Application Express.
 * The UI behaviors in this namespace, while available to all themes, do not come automatically. Various theme
 * templates must follow rules in order to leverage the functionality.
 *
 * @namespace
 **/
apex.theme = {};

(function( theme, navigation, $, lang, util, undefined ) {
    "use strict";

    var C_HELP_DLG = "apex_popup_field_help",
        SEL_HELP_DLG = "#" + C_HELP_DLG,
        C_HELP_AREA = "apex_popup_help_area",
        SEL_HELP_AREA = "#" + C_HELP_AREA;

    var gFieldHelpReturnFocusTo = null;

    /**
     * Display item help in a "classic" popup window.
     * This is typically no longer used directly. It is used by popupFieldHelp if in screen reader mode.
     *
     * Theme requirements for the label Help Template:
     * It is best to follow the requirements for popupFieldHelp.
     * - A click handler or javascript href can invoke this function directly. For example:
     *     <button ... onclick="apex.theme.popupFieldHelpClasic('#CURRENT_ITEM_ID#','&SESSION.');" ...>Help</button>
     *
     * @param pItemId item id to display help for
     * @param pSessionId current session id
     * @param pUrl optional override to specify the URL to use to fetch the help content. It should not include
     *          the p_output_format param. This is an advanced parameter that is normally not needed.
     * @memberOf apex.theme
     */
    theme.popupFieldHelpClassic = function ( pItemId, pSessionId, pUrl ) {
        var url;

        if ( pUrl ) {
            url = pUrl;
        } else {
            url = "wwv_flow_item_help.show_help?p_item_id=" + pItemId + "&p_session=" + pSessionId;
        }

        navigation.popup ({
            url:    url + "&p_output_format=HTML",
            name:   "Help",
            width:  500,
            height: 350
        });
    }; //popupFieldHelpClassic

    /**
     * Display a standard item help dialog.
     * This will use screen reader mode to determine if a dialog or popup window is used.
     *
     * Theme requirements for the label Help Template:
     * - A click handler or javascript href can invoke this function directly. For example:
     *     <button ... onclick="apex.theme.popupFieldHelp('#CURRENT_ITEM_ID#','&SESSION.');" ...>Help</button>
     * - The preferred way it to use the built-in delegated click event handler. For this give the
     *   clickable help element a class of js-itemHelp and add a data-itemhelp attribute with the current
     *   item id.
     *   For example:
     *     <button class="... js-itemHelp" data-itemhelp="#CURRENT_ITEM_ID#" ...>Help</button>
     *
     * The second method is preferred because you get Alt-F1 keyboard accessibility. For Alt+F1 to work the
     * label template Before Label and Item template attribute must include:
     *      id="#CURRENT_ITEM_CONTAINER_ID#"
     * With the first method you could add your own inline keydown handler.
     *
     * @param pItemId item id to display help for
     * @param pSessionId current session id
     * @param pUrl optional override to specify the URL to use to fetch the help content. It should not include
     *          the p_output_format param. This is an advanced parameter that is normally not needed.
     * @memberOf apex.theme
     */
    theme.popupFieldHelp = function ( pItemId, pSessionId, pUrl ) {
        var url;

        gFieldHelpReturnFocusTo = document.activeElement || null;

        function cleanTitle( title ) {
            var result, t$ = $("<span></span>");
            result = title.replace( /&#?\w+;/g, function(m) {
                t$.html( m );
                return t$.text();
            } );
            return result;
        }

        if ( pUrl ) {
            url = pUrl;
        } else {
            url = "wwv_flow_item_help.show_help?p_item_id=" + pItemId + "&p_session=" + pSessionId;
        }
        /* Show jQuery div based dialog if not running in screen reader mode, if we are using screen reader mode, use
         old new window popup.*/
        if ( !$x( "pScreenReaderMode" ) ) {
            $.getJSON(
                url + "&p_output_format=JSON",
                function( pData ) {
                    var lDialog$ = util.getTopApex().jQuery( SEL_HELP_DLG ), // see below for why top is used here
                        lDialogArea$ = util.getTopApex().jQuery( SEL_HELP_AREA );

                    if ( lDialog$.length === 0 ) {

                        if ( lDialogArea$.length === 0 ) {
                            // There is a bad interaction between dialogs and iframes. Dialogs move to the end
                            // of their container for proper stacking. Iframes reload when moved in the DOM
                            // APEX modal pages (and some other cases) use iframes in dialogs. Therefore
                            // we put the help non-modal dialog in its own container and use z-index to
                            // put it on top of other dialogs so that it is always on top and never disturbs the
                            // DOM order of other dialogs.
                            util.getTopApex().jQuery( "#wwvFlowForm" ).after( "<div id='" + C_HELP_AREA + "'></div>" );
                        }
                        // Add a new div with the retrieved page
                        // Always create help dialogs in the context of the top level window. This is necessary because
                        // of APEX modal pages which use an iframe. If this was not done the item help dialog would
                        // be constrained to the iframe.
                        lDialog$ = util.getTopApex().jQuery( "<div id='" + C_HELP_DLG + "' tabindex='0'>" + pData.helpText + "</div>" );

                        // open created div as a dialog
                        lDialog$.dialog( {
                            title:       cleanTitle( pData.title ),
                            appendTo:    SEL_HELP_AREA,
                            dialogClass: "ui-dialog--helpDialog",
                            width:       500,
                            height:      350,
                            create: function( ) {
                                // don't scroll the dialog with the page
                                lDialog$.closest( ".ui-dialog" ).css( "position", "fixed" );
                            },
                            resize: function( ) {
                                // resize sets position it to absolute so fix what resizable broke
                                lDialog$.closest( ".ui-dialog" ).css( "position", "fixed" );
                            },
                            close: function() {
                                // normally a dialog does a fine job restoring focus on close but because this dialog
                                // may have been open in a different browsing context from the actual item a little help is needed
                                if ( gFieldHelpReturnFocusTo ) {
                                    $( gFieldHelpReturnFocusTo ).focus();
                                }
                            }
                        } ).keydown(function(event) {
                            // let Alt+F6 return to the item but leave the help dialog open
                            if ( event.which === 117 && event.altKey ) {
                                if ( gFieldHelpReturnFocusTo ) {
                                    $( gFieldHelpReturnFocusTo ).focus();
                                }
                            }
                        } );
                    } else {

                        // replace the existing dialog and open it again
                        lDialog$
                            .html( pData.helpText )
                            .dialog( "option", "title", cleanTitle ( pData.title ) )
                            .dialog( "open" );
                    }
                    // todo this doesn't work when the help item is in a modal page
                    lDialog$.focus();
                }
            );
        } else {
            theme.popupFieldHelpClassic( pItemId, pSessionId, pUrl );
        }
    }; //popupFieldHelp

    $( document ).ready(function() {
        /*
         * Support item help. See comments for popupFieldHelp
         */
        $( document.body ).on( "click", ".js-itemHelp", function( /*event*/ ) {
            var itemId = $( this ).attr( "data-itemhelp" );
            if ( itemId ) {
                theme.popupFieldHelp( itemId, $v( "pInstance" ) );
            }
        } ).on( "keydown", function( event ) {
            // if Alt+F1 pressed show item help if on an item
            if ( event.which === 112 && event.altKey ) {
                // look for associated item help
                // There is no direct association between anything related to an item that takes focus
                // and the help button which gives the item id
                // Rely on the label template Before Label and Item template attribute to include id="#CURRENT_ITEM_CONTAINER_ID#"
                // so we can rely on a parent having an id that ends in "_CONTAINER"
                // from the container simply find the .js-itemHelp element
                // Also check for TD element to handle table based layouts.
                $( event.target ).parents().each(function() {
                    var helpElement$, itemId;

                    if ( ( this.id && /_CONTAINER$/.test( this.id ) ) || this.nodeName === "TD" ) {
                        helpElement$ = $( this ).find( ".js-itemHelp" );
                        if ( helpElement$.length ) {
                            itemId = helpElement$.attr( "data-itemhelp" );
                            if ( itemId ) {
                                theme.popupFieldHelp( itemId, $v( "pInstance" ) );
                                return false;
                            }
                        }
                        if ( this.nodeName !== "TD" ) {
                            return false;
                        }
                        // otherwise keep looking
                    }
                });
            }
        });

        /*
         * When modal dialogs open or close, close item help
         */
        $( document.body ).on( "dialogopen dialogclose", function( event ) {
            var dlg$ = $( event.target );
            if ( !dlg$.is( SEL_HELP_DLG ) && dlg$.dialog(  "option", "modal" ) ) {
                $( SEL_HELP_DLG ).dialog( "close" );
            }
        } );

        /*
         * Label click handling, to handle focusing non-standard form elements
         */
        $( document.body ).on( "click", "label", function( pEvent ) {

            var lLabelFor = $( this ).attr( "for"),
                lItem$ = $( "#" + util.escapeCSS( lLabelFor ) );

            // if the label is for an input, textarea or select do nothing, browser handles focus here
            // if the label is for something that is disabled or not visible again do nothing
            // also if the label contains an anchor do nothing - putting a link in a label is a bad practice but people do it
            if ( !( lItem$.is( "input,textarea,select" ) &&
                 !lItem$.prop( "disabled" ) &&
                 lItem$.is( ":visible" )) && $( this ).find( "a" ).length === 0 ) {

                apex.item( lLabelFor ).setFocus();
                pEvent.preventDefault();

            }

        });

        /*
         * Initialize Region Dialogs
         *
         * Region Dialogs are APEX regions where the outer template element should be something very much like the following
         * <div id="#REGION_STATIC_ID#"  class="js-regionDialog ... #REGION_CSS_CLASSES#" #REGION_ATTRIBUTES# style="display:none" title="#TITLE#">
         * </div>
         * The important parts are that class includes js-regionDialog and the title contains the region title.
         *
         * The dialog region gets turned into a jQuery UI dialog widget when the page loads. To open the dialog use a DA
         * with JavaScript action containing:
         *   $("#<region_static_id>").dialog("open");
         * To close the dialog use a DA with JavaScript action containing:
         *   $("#<region_static_id>").dialog("close");
         *
         * The following template option classes are supported
         *   js-resizable: will make the dialog resizable
         *   js-draggable: will make the dialog draggable
         *   js-modal: will make the dialog modal
         *   js-dialog-sizeWWWxHHH: will set the dialog width to WWW and height to HHH
         *
         * The following data attributes can be added using region Custom Attributes to give more control over
         * the dialog size and other jQuery UI dialog options
         *   data-width, data-height, data-minwidth, data-minheight, data-maxwidth, data-maxheight, data-dialogClass, data-appendTo
         *
         * More advanced settings can be made with a DA that runs on page load to set dialog options such as hide, show, and position
         *
         * A note about non-modal dialogs: Non modal dialogs can have a negative impact on dialogs that contain an iframe
         * The issue is that iframes get reloaded when they move in the DOM and jQuery UI dialogs will move in order to be
         * on top. This is not specific to APEX but APEX does use iframes as part of modal dialog pages and rich text
         * editor items. The solution is to put non-modal dialogs in their own container DIV and set the z-index thus
         * creating a "layer" so that other dialogs will not move in the DOM. To do this add a custom attribute
         * data-appendTo="#myDialogLayer". The myDialogLayer div will get created if needed or you could add it to your
         * page template. Then add a CSS rule (for example on the Page CSS Inline)
         *     #myDialogLayer .ui-dialog {
         *         z-index: 890;
         *     }
         */
        $( ".js-regionDialog" ).each( function() {
            var inst$ = $(this),
                size = /js-dialog-size(\d+)x(\d+)/.exec( this.className ),
                options = {
                    autoOpen: false,
                    closeText: apex.lang.getMessage( "APEX.DIALOG.CLOSE" ),
                    modal: inst$.hasClass( "js-modal" ),
                    resizable: inst$.hasClass( "js-resizable" ),
                    draggable: inst$.hasClass( "js-draggable" ),
                    create: function() {
                        // don't scroll the dialog with the page
                        $( this ).closest( ".ui-dialog" ).css( "position", "fixed" );
                    }
                },
                placeholder$ = $("<div style='display:none'></div>");

            if ( size ) {
                options.width = size[1];
                options.height = size[2];
            }
            $.each(["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"], function( i, prop ) {
                var attrValue = parseInt(inst$.attr( "data-" + prop.toLowerCase() ), 10);
                if ( !isNaN( attrValue ) ) {
                    options[prop] = attrValue;
                }
            });
            $.each(["appendTo", "dialogClass"], function( i, prop ) {
                var attrValue = inst$.attr( "data-" + prop.toLowerCase() );
                if ( attrValue ) {
                    options[prop] = attrValue;
                }
            });
            if ( options.appendTo && options.appendTo.substring(0,1) === "#" &&  $( options.appendTo ).length === 0 ) {
                $("#wwvFlowForm").after( '<div id="' + util.escapeHTML( options.appendTo.substring( 1 ) ) + '"></div>' );
            }
            inst$.before( placeholder$ );
            inst$.dialog( options )
                .on( "dialogopen", function( ) {
                    if ( options.modal ) {
                        apex.navigation.beginFreezeScroll();
                    }
                })
                .on( "dialogresize", function( ) {
                    // resize sets position to absolute so fix what resizable broke
                    $(this).closest( ".ui-dialog" ).css( "position", "fixed" );
                })
                .on( "dialogclose", function( ) {
                    if ( options.modal ) {
                        apex.navigation.endFreezeScroll();
                    }
                });
            /*
             * For proper display and nesting of modal dialogs jQuery UI moves the dialog to the end of the
             * specified container. However APEX requires that the DOM order of page items (form fields)
             * not change. So before the page is submitted put the dialog regions back where they were.
             */
            $( apex.gPageContext$ ).on ( "apexpagesubmit", function() {
                inst$.dialog( "close" ).css( "display", "none" );
                placeholder$.replaceWith( inst$ );
            } );
        });

    });

    /**
     * Experimental capability to make a page fit to the size of the browser window and resize as the
     * window is resized.
     * TODO doc
     */
    theme.pageResizeInit = function() {
        $( "#wwvFlowForm" ).addClass( "resize" );
        $( "body > link" ).hide(); // for some reason these are taking up space on Firefox
        $( "body" ).css( "overflow", "hidden" ); // This keeps scroll bars from messing up the size calculation

        // The page resize logic doesn't play well with flex box layout. Just in case the page or region templates
        // use flex box layout override that here.
        $( ".resize" ).each( function() {
            if ( $( this ).css( "display" ) === "flex" ) {
                $( this ).css ( "display", "block" );
            }
        } );

        /*
         * Default resize handler.
         * This only handles sharing the height with non-resized siblings.
         * A more specific handler should stop propagation.
         * Any element with a resize class expects to be sized to fill as much space as it can and then
         * be notified with a resize event that its size has changed so that it can resize its contents if needed
         */
        $( "body" ).on( "resize", function( event ) {
            var h, w, resize$, pos,
                parent$ = $( event.target );

            if ( event.target.nodeName === "BODY" ) {
                h = document.documentElement.clientHeight;
                w =  document.documentElement.clientWidth;
            } else {
                h = parent$.height();
                w = parent$.width();
            }
            resize$ = parent$.children( ".resize" ).filter( ":visible" );
            if ( resize$.length > 0 ) {
                parent$.children( ":not(.resize)" ).filter( ":visible" ).each( function() {
                    pos = $( this ).css( "position" );
                    if ( pos !== "fixed" && pos !== "absolute" ) {
                        h -= $( this ).outerHeight( true );
                    }
                });
                h = Math.floor( h / resize$.length );
                resize$.each( function() {
                    var el$ = $(this);
                    util.setOuterHeight( el$, h );
                    util.setOuterWidth( el$, w );
                    el$.filter( ":visible" ).trigger( "resize" );
                });
            }
            event.stopPropagation();
        });

        $( ".ui-accordion.resize" ).on( "resize", function( event ) {
            if ( event.target !== this ) {
                return;
            }
            // accordion widget doesn't handle when its size changes automatically
            $( this ).accordion( "refresh" );
            // TODO THINK need a way to resize items. currently rely on accordion default behavior resize stops at this point!
            event.stopPropagation();
        });

        $( ".ui-tabs.resize" ).on( "resize", function( event ) {
            if ( event.target !== this ) {
                return;
            }
            // tabs widget doesn't handle when its size changes automatically
            $( this ).tabs( "refresh" )
                .children( ".ui-tabs-panel.resize" ).trigger( "resize" );
            event.stopPropagation();
        });

        $( window ).on( "apexwindowresized", function() {
            $( "body" ).trigger( "resize" );
        });
        $( "body" ).trigger( "resize" );

    };

    /**
     * Override this variable via apex.theme with a callback specifiying what the page's default sticking position
     * should be.
     * @type {function}
     */
    theme.defaultStickyTop = function() {
        return 0;
    };

    /*
     * Adds state information to wizard progress list template
     */
    theme.initWizardProgressBar = function( pBaseClass ) {
        var lBaseClass = ( pBaseClass ) ? pBaseClass : "t-WizardSteps",
            lBaseClassSelector = "." + lBaseClass;

        $( lBaseClassSelector )
            .find( lBaseClassSelector + "-step.is-active" )
            .find( "span" + lBaseClassSelector + "-labelState" ).text( lang.getMessage( "APEX.ACTIVE_STATE" ) )
            .end()
            .prevAll( lBaseClassSelector + "-step" )
            .addClass( "is-complete" )
            .find( "span" + lBaseClassSelector + "-labelState" ).text( lang.getMessage( "APEX.COMPLETED_STATE" ) );
    };

    /**
     * Forces all jQueryUI dialogs to be responsive.
     * This make it so that on dialog creation and on window resize:
     * 1) The dialog is always completely visible.
     * 2) The height of the dialog and the width do not exceed the bounds of the page. Unless a min-width or height
     *      is specified.
     */
    theme.initResponsiveDialogs = function() {
        $( "body" ).on( 'dialogopen' , ".ui-dialog-content", function() {
            var uiDialogContent$ = $( this );
            var uiDialog$ = uiDialogContent$.closest( ".ui-dialog" );
            //Don't try to make non responsive dialogs responsive. More checks can be added here in the future if need be.
            if (uiDialog$.find(".utr-container").length > 0) {
                return;
            }
            uiDialog$.css("maxWidth", "100%");
            var uiButtonPane$ = uiDialog$.find( ".ui-dialog-buttonpane" ); // Region dialogs need this div to be at the bottom
                                                                          // of the form.
            var uiButtonPaneHeight = 0;
            if (uiButtonPane$.length > 0) {
                uiButtonPaneHeight = uiButtonPane$.outerHeight() + 20; // Right now, 20 appears to be the extra offset that's needed if a uiButtonPane is in the region dialog.
            }
            var initialHeight =  parseInt(uiDialogContent$.dialog( "option", "height" ), 10); //The value must be supplied as a decimal.
            if ( !initialHeight || initialHeight <= 0 ) {
                initialHeight = uiDialogContent$.outerHeight();
            }
            var minHeight = parseInt(uiDialogContent$.dialog( "option", "minHeight" ), 10); //The value must be supplied as a decimal.
            if ( !minHeight ) {
                minHeight = 0;
            }
            var onPageResize = function() {
                var offset = uiDialog$.offset();
                var window$ = $( window );
                offset.top -= window$.scrollTop(); //Get the offset relative to the view port/the window!
                offset.left -= window$.scrollLeft();
                var windowWidth = window$.width();
                var dialogWidth = uiDialog$.outerWidth();
                if (offset.left + dialogWidth  > windowWidth) {
                    uiDialog$.css("left", windowWidth - dialogWidth);
                }
                var windowHeight = $( window ).height();
                var dialogHeight = uiDialog$.height();
                if (windowHeight < initialHeight + uiButtonPaneHeight) {
                    var newHeight = windowHeight - uiDialog$.find( ".ui-dialog-titlebar" ).outerHeight() - uiButtonPaneHeight;
                    uiDialogContent$.height( Math.max(newHeight, minHeight) );
                    dialogHeight = uiDialog$.height();
                } else if (initialHeight + uiButtonPaneHeight < windowHeight) {
                    uiDialogContent$.height(initialHeight);
                }
                if (offset.top + dialogHeight  > windowHeight) {
                    var scrollOffset = 0;
                    if (uiDialog$.css("position") === "absolute") {
                        scrollOffset = window$.scrollTop();
                    }
                    uiDialog$.css( "top" , Math.max(windowHeight - dialogHeight + scrollOffset, 0));
                }
            };
            $( window ).on( "apexwindowresized", onPageResize);
            setTimeout(function() {
                onPageResize();
            }, 250);
            uiDialogContent$.on( 'dialogclose', function() {
                $( window ).off( "apexwindowresized", onPageResize);
            });
        });
    };

})( apex.theme, apex.navigation, apex.jQuery, apex.lang, apex.util );

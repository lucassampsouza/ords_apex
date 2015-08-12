/*global apex,$v,window*/
/**
 @license
 Oracle Database Application Express
 Copyright (c) 2012, 2015, Oracle. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex}.navigation namespace is used to store popup and redirect related functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.navigation = {};

(function( navigation, util, $, undefined ) {
    "use strict";

    var DIALOG_DIV_ID        = 'apex_dialog_',
        INTERNAL_CLOSE_EVENT = "apexclosedialoginternal";

    /**
     * Opens the specified page (pWhere) in the current window.
     * For mobile UI when the pWhere URL specifies a page in the same application the
     * page is loaded using ajax by default.
     *
     * @param {String} pWhere URL of the page to open.
     *
     * @function redirect
     * @memberOf apex.navigation
     */
    navigation.redirect = function ( pWhere ) {

        // if this is a mobile app and the URL is to a page in this application and ajax is not explicitly not to be used
        if ( $.mobile && pWhere.substring( 0, pWhere.indexOf( ":" )) === "f?p=" + $v( "pFlowId" )) {
            $( ":mobile-pagecontainer" ).pagecontainer( "change", pWhere, { reload: true });
        } else {
            location.href = pWhere;
        }
    };


    /**
     * Opens the given url in a new typically named popup window. If a window with that name already exists it is reused.
     * If no name is given or the name is "_blank" then a new unnamed popup window is opened. The names _self, _parent
     * and _top should not be used. The window name is made unique so that it cannot be shared with other apps.
     *
     * Every effort is made to focus the window. The intention is that the window will be a popup window
     * and not a tab. The default window features are such that most browsers should open a new window.
     *
     * To avoid being suppressed by a popup blocker call this from a click event handler on a link or button.
     *
     * @param pOptions {Object} an object with the following optional properties:
     *   url: the page url to open in the window. The default is "about:blank"
     *   name: the name of the window. The default is "_blank", which opens a new unnamed window.
     *   height: height of window content area in pixels. Default 600
     *   width: width of window content area in pixels. Default 600
     *   scroll: "yes" or "no" Default is "yes"
     *   resizeable: "yes" or "no" Default is "yes"
     *   toolbar:  "yes" or "no" Default is "no"
     *   location: "yes" or "no" Default is "no"
     *   statusbar: "yes" or "no" Default is "no" This controls the status feature
     *   menubar: "yes" or "no" Default is "no"
     *
     * It is best to supply the url, name and possibly the height and width and leave the omit the other
     * properties.
     *
     * @function popup
     * @memberOf apex.navigation
     */
    navigation.popup = function ( pOptions ) {
        var // Initialize default parameter values
            lOptions = $.extend({
                            url:       "about:blank",
                            name:      "_blank",
                            width:     600,        //min value 100
                            height:    600,        //min value 100
                            scroll:    "yes",
                            resizable: "yes",
                            toolbar:   "no",
                            location:  "no",
                            statusbar: "no",
                            menubar:   "no" },
                            pOptions ),
            // Open the new window with those parameters
            lWindow = window.open(
                lOptions.url,
                // force name to be a string in case some misguided callers pass in a number
                ( lOptions.name + "" ).toLowerCase() === "_blank" ? lOptions.name : lOptions.name + "_" + $v( "pInstance" ),
                "toolbar="      + lOptions.toolbar      + "," +
                "scrollbars="   + lOptions.scroll       + "," +
                "location="     + lOptions.location     + "," +
                "status="       + lOptions.statusbar    + "," +
                "menubar="      + lOptions.menubar      + "," +
                "resizable="    + lOptions.resizable    + "," +
                "width="        + lOptions.width        + "," +
                "height="       + lOptions.height
            );

        if ( lWindow ) {
            if ( lWindow.opener === null ) {
                lWindow.opener = window.self;
            }
            lWindow.focus();
        }
        return lWindow;
    }; //popup


    /**
     * Opens the given url in a new named window or tab (the browser / browser user preference settings may control
     * if a window or tab is used). If a window with that name already exists it is reused. The names _self, _parent
     * and _top should not be used. The window name is made unique so that it cannot be shared with other apps.
     * Every effort is made to then focus the window.
     *
     * Unlike a popup the new window is intended to be fully functional. This is intended to be as close
     * as you can get to normal anchor with a target (<a target="name" href="...">...) behavior from JavaScript
     * but with the feature of focusing the window in all browsers by default.
     *
     * If favorTabbedBrowsing is true: For IE and Firefox, the the user will need to manually focus the
     * tab (assuming the browser is configured to open pages in tabs).
     *
     * If favorTabbedBrowsing is not true (the default): For IE and Firefox the page will be opened in a new browser window
     * even if the browser preferences is to open new pages in tabs. But it will very likely be able to focus
     * the new page.
     *
     * Once the named window is open the favorTabbedBrowsing setting doesn't apply to that window.
     *
     * Note: Firefox and IE will not focus a tab if that tab isn't the currently active tab in its browser window.
     *
     * Note for Opera the Advanced/content > JavaScript  Options: “Allow raising of windows” must be checked in order for
     * focus to work.
     *
     * To avoid being suppressed by a popup blocker call this from a click event handler on a link or button.
     *
     * @param {string} pURL the url of the page to load.
     * @param {string} pWindowName the name of the window (optional) The default is "_blank"
     * @param {Object} pOptions optional object with these properties
     *     altSuffix: {string} an Alternative suffix to append to pWindowName to make it unique.
     *     favorTabbedBrowsing {Boolean} if true don't try to force a new window for the benefit of being able to focus it
     *
     * @return window object of named window or null if window was not opened
     *
     * @function openInNewWindow
     * @memberOf apex.navigation
     */
    navigation.openInNewWindow = function( pURL, pWindowName, pOptions ) {
        var other, features,
            altSuffix = pOptions ? pOptions.altSuffix || null : null;

        if ( pWindowName === undefined ) {
            pWindowName = "_blank";
        }
        if ( pWindowName.toLowerCase() !== "_blank" ) {
            if ( altSuffix === null ) {
                altSuffix = $v( "pInstance" );
            }
            if ( altSuffix ) {
                pWindowName += "_" + altSuffix;
            }
        }

        /*
         * For many browsers omitting the feature string results in the desired behavior (creation if needed, navigation, and focus).
         * This is because they allow a tab in the same window or a different window to receive focus.
         * Note for Opera the Advanced/content > JavaScript  Options: “Allow raising of windows” must be checked.
         * But for Firefox and IE the focusing only works when the named window is in a different browser window.
         * For Firefox if you give all the chrome features but without geometry you get a new normal window.
         * For IE if you take away any of the chrome features such as status you get a new normal window but without that feature.
         * But if you give all the chrome features then it follows the user preference and may create a tab in the same window.
         * So Firefox and IE are at odds. For Firefox we want to use all chrome features but this doesn't work for IE.
         * For IE we want to take away status (strictly speaking this then isn't a "normal" window but it is close enough)
         * but this causes Firefox to create a popup window (read-only URL).
         */
        if ( !pOptions || pOptions.favorTabbedBrowsing !== true ) {
            if ( /(msie) ([\w.]+)/.exec(navigator.userAgent.toLowerCase() ) ) {
                // if IE
                features = "personalbar,menubar,titlebar,toolbar,location,resizable,scrollbars";
            } else {
                features = "personalbar,menubar,titlebar,toolbar,location,status,resizable,scrollbars";
            }
        }
        // IE can tell the difference between passing undefined for features and not passing it at all so open must be called this way
        if ( features ) {
            other = window.open( pURL, pWindowName, features );
        } else {
            other = window.open( pURL, pWindowName );
        }
        if ( other ) {
            other.focus();
        }
        return other;
    };

    /**
     * Opens the given url in a popup window.
     * This is a simplified version of apex.navigation.popup where all the options are fixed.
     * The window name is "winLov" and the height is 600 and width is 800. All other options are defaulted.
     * Due to hard-coded name property value, subsequent new popups launched with this API will replace
     * existing popups, not stack. Use this function when it is appropriate to share the same window
     * as other LOV popups.
     *
     * @param pURL {String} the url to open in a popup window
     *
     * @function popup.url
     * @memberOf apex.navigation
     */
    navigation.popup.url = function ( pURL ) {
        navigation.popup( {
            url:    pURL,
            name:   "winLov",
            width:  800,
            height: 600
        });
    }; //popup.url


    /**
     * Sets the value of the item in the parent window (pThat), with (pValue) and then closes the popup window.
     *
     * uses $x_Value, not $s. $x_Value supports passing an array of DOM nodes, $s does not.
     * Old doc. didn't state that it supported an array.
     *
     * @param {String} pValue
     * @param {DOM node | string ID} pItem
     *
     * @function popup.close
     * @memberOf apex.navigation
     * */
     navigation.popup.close = function ( pItem, pValue ) {
        window.opener.$x_Value( pItem, pValue );
        window.close();
    }; // popup.close

    // the dialog id count needs to be kept in just the top window context
    if ( !util.getTopApex().navigation._gNextDialogId ) {
        util.getTopApex().navigation._gNextDialogId = 1;
    }

    /**
     * Opens the specified page (pUrl) in a dialog.
     * For mobile UI, the page is loaded using a role 'dialog' in a mobile.changePage call.
     * For desktop UI, a modal page is loaded in an iframe using jQuery UI dialog widget.
     * For desktop UI, a non-modal page is loaded in a new window using the navigation.popup() function.
     *
     * @param {String} pUrl.
     * @param {Object} pOptions to identify the attributes of the dialog, such as height, width, maxWidth, title, modal
     * @param {String} pCssClasses to identify the CSS classes, if any, to be applied to the dialog, and appended on to the dialogClass attribute
     * @param {String} pTriggeringElement jQuery selector to identify APEX page element opening the dialog.
     *
     * @function dialog
     * @memberOf apex.navigation
     */
    navigation.dialog = function ( pUrl, pOptions, pCssClasses, pTriggeringElement ) {

        var lTriggeringElement$, lDialog$, lDialogId, lPopupWindow, lWindowName,
            // Initialize default parameter values
            lDefaults = { width:       500,
                          maxWidth:    1500,
                          height:      500,
                          closeText:   apex.lang.getMessage( "APEX.DIALOG.CLOSE" ),
                          modal:       true,
                          resizable:   false,
                          scroll:      "auto",
                          closeOnEscape: true,
                          close:       function() {
                              util.getTopApex().jQuery( this ).dialog( "destroy" ).remove(); },
                          dialog:      null, // for internal use
                          dialogClass: 'ui-dialog--apex' },
            lOptions  = $.extend( lDefaults, pOptions );

        // Ensure default APEX CSS Class is always used
        if ( pOptions.dialogClass ){
			lOptions.dialogClass = 'ui-dialog--apex ' + pOptions.dialogClass;
		}

        if ( pCssClasses ){
			lOptions.dialogClass += ' ' + pCssClasses;
		}

        if ( !$.mobile ) {
            //
            // Desktop Dialogs
            //
            lTriggeringElement$ = $( pTriggeringElement, apex.gPageContext$ );

            if ( lOptions.modal ) {
                // Modal Dialog

                // A new modal dialog launches a new jQuery UI Dialog.
                if ( lOptions.dialog === null ) {

                    // Always create dialogs in the context of the top level window. This is necessary because APEX
                    // modal pages use an iframe. If this was not done any nested dialog would be constrained to the iframe.
                    lDialogId = DIALOG_DIV_ID + util.getTopApex().navigation._gNextDialogId;
                    util.getTopApex().navigation._gNextDialogId += 1;
                    lDialog$ = util.getTopApex().jQuery(
                        '<div id="' + lDialogId + '">' +
                        '<iframe src="' + util.escapeHTMLAttr( pUrl ) + '"' +
                        'title="' + util.escapeHTMLAttr( lOptions.title ) + '" width="100%" height="100%" style="min-width: 95%;height:100%;" scrolling="'+ util.escapeHTMLAttr( lOptions.scroll)+'"></iframe></div>' );

                    lDialog$.on( "dialogcreate", function() {
                            // force position to fixed so that dialog doesn't jump when moved
                            $( this ).closest( ".ui-dialog" ).css( "position", "fixed" );
                        }).on( "dialogopen", function() {
                            if ( lOptions.modal ) {
                                // Stop parent page from scrolling while dialog is open
                                util.getTopApex().navigation.beginFreezeScroll();
                            }

                            lDialog$.children( "iframe" ).on("load", function() {
                                // let ESCAPE key typed in nested page close this dialog
                                // don't allow tabbing out of the dialog
                                $(this.contentDocument.body).on("keydown", function(event) {
                                    if ( event.which === $.ui.keyCode.ESCAPE ) {
                                        lDialog$.dialog("close");
                                    } else if ( event.which === $.ui.keyCode.TAB ) {
                                        var pageLast = $( this ).find( ":tabbable" ).last(),
                                            first = lDialog$.closest( ".ui-dialog" ).find( ":tabbable" ).first();

                                        // only have to worry about tab forward on last page tab stop; reverse tab works automatically
                                        if ( ( event.target === pageLast[0] ) && !event.shiftKey ) {
                                            first.focus( 1 );
                                            event.preventDefault();
                                        }
                                    }
                                });
                            });
                        } ).on( "dialogclose", function( ) {
                            if ( lOptions.modal ) {
                                // restore normal page scroll behavior once dialog is gone
                                util.getTopApex().navigation.endFreezeScroll();
                            }
                        } ).on( "dialogresize", function( ) {
                            var h = lDialog$.height(),
                                w = lDialog$.width();
                            // we use css to position the dialog fixed but resize sets it to absolute
                            // so fix what resizable broke
                            lDialog$.closest( ".ui-dialog" ).css( "position", "fixed" );
                            // resize iframe so that apex dialog page gets window resize event
                            // use width and height of dialog content rather than ui.size so that dialog title is taken in to consideration
                            lDialog$.children( "iframe" ).width( w ).height( h );
                        } );

                    // Launch modal dialog
                    lDialog$.dialog( lOptions ); // it is destroyed and removed on close

                    // enhance normal dialog tab handling to make it iframe aware
                    lDialog$.closest( ".ui-dialog" ).on( "keydown", function( event ) {
                        if ( event.keyCode !== $.ui.keyCode.TAB ) {
                            return;
                        }
                        var pageTabbables = $( lDialog$.children( "iframe" )[0].contentDocument.body ).find( ":tabbable" ),
                            pageFirst = pageTabbables.filter( ":first" ),
                            pageLast  = pageTabbables.filter( ":last" ),
                            tabbables = $( this ).find( ":tabbable" ),
                            first = tabbables.filter( ":first" ),
                            last  = tabbables.filter( ":last" );

                        if ( ( event.target === last[0] || event.target === lDialog$[0] ) && !event.shiftKey ) {
                            pageFirst.focus( 1 );
                            event.preventDefault();
                        } else if ( ( event.target === first[0] || event.target === lDialog$[0] ) && event.shiftKey ) {
                            pageLast.focus( 1 );
                            event.preventDefault();
                        }
                    });

                    navigation.dialog.registerCloseHandler({
                        handler$:           lDialog$,
                        dialog:             lDialog$,
                        triggeringElement$: lTriggeringElement$,
                        closeFunction:      function(){ lDialog$.dialog("close"); }
                    });

                } else {

                    // A chained dialog will reuse the existing jQuery UI dialog with attributes of new dialog
                    // Note that this call will be made in the context of the iframe but the dialog widget is in the
                    // parent context. So don't use $ here, use the dialog itself.
                    lOptions.dialog.dialog( "option", "title", lOptions.title )
                        .children( "iframe" ).attr( "src", pUrl );
                }

            } else {

                // Non-Modal Dialog
                // A new non-modal dialog opens a new popup window using the url, width and height defined.
                if ( lOptions.dialog === null ) {

					if ( lTriggeringElement$.id === undefined || lTriggeringElement$[ 0 ].id === undefined || lTriggeringElement$[ 0 ].id === "" || !lTriggeringElement$ ){
                        lWindowName = "winDialog";
					} else {
						lWindowName = lTriggeringElement$[ 0 ].id;
					}

                    // Launch new non-modal dialog
                    lPopupWindow = navigation.popup({
                        url:    pUrl,
                        name:   lWindowName, // The window name is the only persistent attribute in the popup
                                             // during navigation. We use it to trigger the closeapexdialogpage event from the popup
                        width:  lOptions.width,
                        height: lOptions.height
                    });

                    navigation.dialog.registerCloseHandler({
                        handler$:           lTriggeringElement$,
                        dialog:             lPopupWindow,
                        triggeringElement$: lTriggeringElement$,
                        closeFunction:      function(){ lPopupWindow.close(); }
                    });

                } else {
                    // A chained non-modal dialog will reuse an existing popup window, and resize to width and height with new dialog attributes.
                    lOptions.dialog.location.href = pUrl;
                    lOptions.dialog.resizeTo( lOptions.width, lOptions.height );
                }
            }
        } else {

            if ( lOptions.dialog === null ) {

				lTriggeringElement$ = $( pTriggeringElement, apex.gPageContext$ );

                if ( $.mobile && pUrl.substring( 0, pUrl.indexOf( ":" )) === "f?p=" + $v("pFlowId")) {

                    // Open Mobile Dialog Page
                    navigation.redirect(pUrl);

                    navigation.dialog.registerCloseHandler({
                        handler$:           lTriggeringElement$,
                        dialog:             $('.ui-dialog')	,
                        triggeringElement$: lTriggeringElement$,
                        closeFunction:      function() { navigation.redirect(pTriggeringElement.context.URL);}
                    });

               }
            } else {

                // A chained non-modal dialog will reuse an existing popup window, and resize to width and height with new dialog attributes.
                $(window.parent.location).attr('href',pUrl);

            }
        }

    }; // navigation.dialog


    /**
     *
     * @param {String, Function, Object} pAction can be
     *                                  -) a URL which will trigger a redirect in the parent page
     *                                  -) a function to redirect to a different dialog page
     *                                  -) false to cancel the dialog
     *                                  -) an object of page items and values which will be exposed in the apexafterclosedialog event
     *                                  -) an array of page item names, the values will be gathered from the page items to create
     *                                     an object of page item values to be exposed in the apexafterclosedialog event
     * @param {Boolean} pIsModal
     *
     * @function dialog.close
     * @memberOf apex.navigation
     */
    navigation.dialog.close = function ( pIsModal, pAction ) {
        var lTriggeringId;

        function apexCheck() {
            try {
                if ( window.opener.apex && window.opener.apex.jQuery ) {
                    return true;
                }
            } catch ( ex ) {
                return false; // window must contain a page from another domain
            }
            return false;
        }

        function getValuesForItems( pItemNames ) {
            var i, val, name,
                lItems = {};

            for ( i = 0; i < pItemNames.length; i++ ) {
                name = pItemNames[i];
                val = $v( name );
                lItems[ name ] = val;
            }
            return lItems;
        }

        if ( $.isArray( pAction ) ) {
            pAction = getValuesForItems( pAction );
        }

        if ( !$.mobile ) {

            if ( pIsModal )  {

                // We hand back the control of dialog so that the caller can fire the necessary events, go to a new page, ...
                // The dialog to close must be the last one in the DOM - its the one on top.
                navigation.dialog.fireCloseHandler( util.getTopApex().jQuery( ".ui-dialog--apex" ).last().children( ".ui-dialog-content" ), pAction );

            } else {

                if ( window.opener && !window.opener.closed && apexCheck() ) {

                    // As long as the parent window still exists, we hand back the control of dialog so that the parent
                    // can fire the necessary events, go to a new page, ...
                    lTriggeringId = window.name;

                    if ( lTriggeringId.lastIndexOf( "_" ) > 0 ) {
                        lTriggeringId = lTriggeringId.substring( 0, lTriggeringId.lastIndexOf( "_" ) );
                    }

					if ( lTriggeringId === undefined ) {
                        // Close Dialog Page Launched Via Component with no designated ID e.g. navigation bar entry
						window.close();
					} else {

						if (lTriggeringId === "winDialog") {
							if ( $.isFunction( pAction )) {
								pAction.call( this, window );
							}  else {
                                window.close();
                            }
						} else {
                            navigation.dialog.fireCloseHandler( window.opener.apex.jQuery( "#" + lTriggeringId ), pAction );
                        }
                    }

                } else {

                    // But if the parent doesn't exist anymore, the non-modal dialog has to take control and at least
                    // navigate to the new page or close the popup
                    if ( $.isFunction( pAction )) {
                        pAction.call( this, window );
                    } else {
                        window.close();
                    }
                }
            }

        } else {

            if ( $.isFunction( pAction )) {
                pAction.call( this, window );
            } else {
                 navigation.redirect(apex.jQuery.ajaxSettings.url);
            }
        }

    }; //dialog.close


    /**
     *
     * @function dialog.cancel
     * @memberOf apex.navigation
     */
    navigation.dialog.cancel = function ( pIsModal ) {

        navigation.dialog.close( pIsModal, false );

    }; //dialog.cancel


    /**
     * Registers the internal "close" event of a dialog. The event will be triggered by fireCloseEvent and depending on
     * the passed in pAction will
     *
     * a) Re-use the existing dialog and navigate to a different dialog page
     * b) Navigate to a different page in the caller
     * c) Cancel the dialog
     * d) Close the dialog and trigger the "apexafterclosedialog" event
     *
     * @param {Object} pOptions has to contain the following attributes
     *                          - "handler$"      jQuery object where the event will be registered for.
     *                          - "dialog"        DOM/jQuery/... object of the current dialog instance which will be passed
     *                                            into the open dialog call if the existing dialog should be re-used.
     *                          - "closeFunction" Function which is used to close the dialog.
     *
     * @function registerCloseHandler
     * @memberOf apex.navigation.dialog
     */
    navigation.dialog.registerCloseHandler = function( pOptions ) {

        pOptions.handler$
            .off( INTERNAL_CLOSE_EVENT )
            .on( INTERNAL_CLOSE_EVENT, function( pEvent, pAction ){

                if ( $.isFunction( pAction )) {
                    // Navigate to new dialog page
                    pAction.call( this, pOptions.dialog );
                } else if ( $.type( pAction ) === "string" ) {
                    // Close dialog and navigate to new page in the parent
                    navigation.redirect( pAction );
                    pOptions.closeFunction.call();
                } else if ( pAction === false ) {
                    // Cancel dialog
                    pOptions.closeFunction.call();
                } else {
                    // Close dialog
                    pOptions.closeFunction.call();
                    pOptions.triggeringElement$.trigger( "apexafterclosedialog", [ pAction ]);
                }
            });
    }; // registerCloseHandler

    /**
     * Fires the internal "close" event of a dialog which was registered with the registerCloseHandler when the dialog
     * was opened.
     *
     * @param {jQuery} pHandler$ is a jQuery object which has been used in the call to registerCloseHandler.
     * @param {Object} pAction is the value which is passed in into the dialog.close function.
     *
     *
     * @function fireCloseHandler
     * @memberOf apex.navigation.dialog
     */
    navigation.dialog.fireCloseHandler = function( pHandler$, pAction ) {

        pHandler$.trigger( INTERNAL_CLOSE_EVENT, pAction );

    }; // fireCloseHandler

    var gFreezeDepth = 0;
    var gDefaultBodyWidth;

    // When the window is resized during the scroll freeze, or if the scroll is unfrozen,
    // the body's width should be reset to its normal value.
    var allowNormalWidth = function() {
        $( document.body ).css( "width", gDefaultBodyWidth );
        $( window ).off( "apexwindowresized" , allowNormalWidth);
    };

    // call when a modal dialog is opened
    navigation.beginFreezeScroll = function( ) {
        if ( gFreezeDepth === 0 ) {
            $( window ).on( "apexwindowresized" , allowNormalWidth);
            gDefaultBodyWidth = document.body.style.width;
            $( document.body ).width( $( document.body ).width() ).addClass( "apex-no-scroll" );
        }
        gFreezeDepth += 1;
    };

    // call when a modal dialog is closed
    // for every call to beginFreezeScroll there must be a corresponding call to endFreezeScroll
    navigation.endFreezeScroll = function( ) {
        gFreezeDepth -= 1;
        if ( gFreezeDepth <= 0 ) {
            allowNormalWidth();
            $( document.body).removeClass( "apex-no-scroll" );
            gFreezeDepth = 0;
        }
    };

})( apex.navigation, apex.util, apex.jQuery );

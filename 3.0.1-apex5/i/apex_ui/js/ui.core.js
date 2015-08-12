/*global apex,$v*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * This file contains initializations for several core UI components used within internal applications
 **/


(function( $, builder, util, lang, navigation, undefined ) {
    "use strict";

    var BUILDER_WINDOW_NAME = "APEX_BUILDER",
        APP_WINDOW_NAME_PREFIX = "APEX_AUT_",
        SEL_HS_REGION = ".a-Region--hideShow";

    builder.getAppUnderTestWindowName = function( pAppId ) {
        var share = $v("P0_WINDOW_MGMT_SHARE_WINDOW" ) === "Y",
            name = APP_WINDOW_NAME_PREFIX;
        if ( !share ) {
            name += pAppId;
        }
        return name;
    };

    builder.nameBuilderWindow = function() {
        // Give this builder window a name (if it doesn't have one) so that the apex developer toolbar can effect this window
        if ( !window.name || window.name.indexOf( BUILDER_WINDOW_NAME ) === 0 ) {
            window.name = BUILDER_WINDOW_NAME + "_" + $v( "pInstance" );
        }
    };

    builder.initWizardModal = function() {
        function _initDialog() {
            var headerheight = $('.a-Dialog-wizardSteps').height(),
                footerheight = $('.a-Dialog-footer').height();
            $('.a-Dialog-body').css({
                'top':headerheight,
                'bottom':footerheight
            });
        }
        $(window).bind('apexwindowresized', function() {
            _initDialog();
        });
        _initDialog();
    };

    builder.initStickyHeader = function(pHeader) {
        var lHeader       = $('#'+pHeader),
            lHeaderHeight = lHeader.outerHeight(),
            lParent       = lHeader.parent(),
            lOffset       = lHeader.offset().top;
        $(window).scroll(function(){
          if ($(window).scrollTop() > lOffset){
            lHeader.addClass('is-fixed');
            lParent.css('margin-top',lHeaderHeight);
          } else {
            lHeader.removeClass('is-fixed');
            lParent.css('margin-top','0');
          }
        });
    };

    builder.initWizardProgressBar = function() {
        apex.theme.initWizardProgressBar( "a-WizardSteps" );
    };

    // builder.setEqualHeights = function(pSelector) {
    //     var lObjects   = $(pSelector),
    //         lMaxHeight = 0;

    //     lMaxHeight = Math.max.apply(
    //     Math, lObjects.map(function() {
    //         return $(this).height();
    //     }).get());
    //     lObjects.height(lMaxHeight);
    // };

    $( document ).ready( function () {

        // Add ie10 class when using IE10
        if ( document.documentMode === 10 ) {
            document.documentElement.className += " ie10";
        }

        function getAppIdFromURL( url ) {
            var i, parts, params, values,
                appId = null;

            i = url.indexOf( "?p=" );
            if ( i >= 0 ) {
                parts = url.substring( i + 3 ).split( ":" );
                if ( parts.length >= 8 && parts[3] === "BRANCH_TO_PAGE_ACCEPT" ) {
                    params = parts[6].split( "," );
                    values = parts[7].split( "," );
                    for ( i = 0; i < params.length && i < values.length; i++ ) {
                        if ( params[i] === "FB_FLOW_ID" ) {
                            appId = values[i];
                            break;
                        }
                    }
                } else {
                    appId = parts[0];
                }
            }
            return appId;
        }

        // Main Navigation List
        $( ".a-Header-tabsContainer" ).menu( {
            menubar: true,
            behaveLikeTabs: true
        } ).show();

        addNavigationListClasses('a_Header_menu');

        // Open Menu Link in New Window
        function launchNewWindow() {
            // called in the context of a menu item, so this is the menu item
            apex.navigation.openInNewWindow(this.href, "_blank", {favorTabbedBrowsing:true});
        }

        // Help Menu
        $( '#helpMenu_menu' ).on("menucreate", function() {
            var helpMenu = this;
            // Menu items from markup don't support opening in a new window.
            // But specific help menu items do need to open in a new window so look them up by id and give them a special action
            $.each( ["helpLinkNewWindow", "helpLinkForum", "helpLinkOTN"], function( i, id ) {
                var item = $( helpMenu ).menu( "find", id );
                if ( item ) {
                    item.action = launchNewWindow;
                }
            } );
        });

        // Initialize Hide Show Regions
        initHideShowRegions();

        // Initialize Wizards
        // _initWizardProgressBar();

        // Dev Toolbar integration: Handle buttons that launch the app under test
        // so that it runs in a named window so it can communicate back to the builder via window.opener
        $( "body" ).on( "click", "button.launch-aut", function ( pEvent ) {
            var url = $( this ).attr( "data-link" ),
                appId = getAppIdFromURL( url ),
                options = {},
                runMode = $v( "P0_WINDOW_MGMT_MODE" ) || "FOCUS"; // values NONE, BROWSER, FOCUS

            if ( appId ) {
                if ( runMode === "NONE" || /^4\d\d\d$/.test( appId ) ) {
                    apex.navigation.redirect( url );
                } else {
                    if ( runMode === "BROWSER" ) {
                        options.favorTabbedBrowsing = true;
                    } // else assume FOCUS
                    apex.navigation.openInNewWindow( url, builder.getAppUnderTestWindowName( appId ), options );
                }
            }
        } );

        // the toolbar run page button is a normal apex button except we don't want it to simply navigate
        // but we do need the URL, so grab it from the onclick attribute, which gets removed and add data-link
        // so above handler will work
        $( "button.launch-aut" ).each( function() {
            var match, btn$ = $(this ),
                url = btn$.attr( "data-link" );

            if ( !url )  {
                match = /['"]((ws|f)\?p=.*)['"]/.exec( btn$.attr( "onclick" ) );
                if ( match && match.length > 1 ) {
                    url = match[1];
                    btn$.removeAttr( "onclick" );
                    btn$.attr( "data-link", url );
                }
            }
        });

        // Initialize Builder Search Widget
        builderSearch( $v('pFlowId'), $v('pFlowStepId'), $v('pInstance') );

        // Initialize the header account mega menu widget
        $( "#accountMenu_menu" ).menu({
            customContent: true,
            tabBehavior: "NEXT"
        });

        // Handle resizing of dialogs
        function resizeDialog( dialog$ ) {
            var footerheight = dialog$.find( ".a-DialogRegion-buttons" ).height();
            dialog$.find(".a-DialogRegion-body").css( "bottom",  footerheight );
        }

        $( document.body )
            .on( "dialogopen dialogresizestop", ".a-DialogRegion", function() {
                resizeDialog($(this));
            });

    } );

    function initHideShowRegions() {
        $( SEL_HS_REGION ).each( function() {
            $( this ).collapsible({
                content: $( this ).find( ".a-Region-body" ).first()
            });
        });
    }

    function openSearchWindow( pUrl ) {
        var other = navigation.popup( {
            url: pUrl,
            name: "SEARCH_RESULTS",
            width: 1000,
            height: 800
        } );
    }

    function builderSearch( pFlowId, pFlowStepId, pSession ) {
        var url, lArray,
            lAppPagePattern   = /^(\d+)(?::|-)(\d+)$/, // supports either colon or hyphen separated numeric values
            lAppSharedPattern = /^(\d+)(?::|-)[Ss]$/;  // 123:s  =>  go to shared components of app 123

        if ( pFlowId === "4000" || pFlowId === "4400" ) {
            // Application Builder
            search( "P0_SEARCH", function( pValue ) {
                if ( lAppPagePattern.test( pValue )) {
                    lArray = pValue.match( lAppPagePattern );
                    navigation.redirect( "f?p=4000:4150:" + pSession + "::NO::FB_FLOW_ID,FB_FLOW_PAGE_ID:" + lArray[ 1 ] + "," + lArray[ 2 ] );
                } else if ( lAppSharedPattern.test( pValue )) {
                    lArray = pValue.match(lAppSharedPattern);
                    navigation.redirect( "f?p=4000:9:" + pSession + "::NO::FB_FLOW_ID:" + lArray[ 1 ] );
                } else if ( isNaN( pValue ) ) {
                    url = "f?p=4000~8000~" + pSession + "~~~~";
                    if ( pFlowStepId === "1500" ) {
                        url += "FB_FLOW_ID,FB_FLOW_PAGE_ID,P8000_START_SEARCH,P8000_SEARCH~,,1,";
                    } else {
                        url += "P8000_START_SEARCH,P8000_SEARCH~1,";
                    }
                    openSearchWindow( url + encodeURIComponent( pValue ) + "&p_sep=~" );
                } else {
                    navigation.redirect( "f?p=4000:4150:" + pSession + "::NO::FB_FLOW_PAGE_ID:" + parseFloat( pValue ));
                }
            } );
        } else if ( pFlowId === '4500' ) {
            // SQL Workshop
            search( "P0_SEARCH", function( pValue ) {
                if ( lAppPagePattern.test( pValue ) ) {
                    lArray = pValue.match( lAppPagePattern );
                    navigation.redirect( "f?p=4000:4150:" + pSession + "::NO::FB_FLOW_ID,FB_FLOW_PAGE_ID:" + lArray[1] + "," + lArray[2] );
                } else if ( lAppSharedPattern.test( pValue )) {
                    lArray = pValue.match(lAppSharedPattern);
                    navigation.redirect( "f?p=4000:9:" + pSession + "::NO::FB_FLOW_ID:" + lArray[ 1 ] );
                } else {
                    navigation.redirect( "f?p=4500:8000:" + pSession + ":::RIR:IR_ROWFILTER:" + encodeURIComponent(pValue) );
                }
            } );
        } else if ( pFlowId === '4800' ) {
            // Team Development
            search( "P0_SEARCH", "f?p=4800:8800:" + pSession + ":::RIR:IR_ROWFILTER:" );
        } else if ( pFlowId === '4350' ) {
            // Administration
            search( "P0_SEARCH", "f?p=4350:8000:" + pSession + ":::RIR:IR_ROWFILTER:" );
        }
    }

    function search( pSearchField, pTarget ) {
        var searchField$ = $( "#" + pSearchField );

        function searchValue( pValue ) {
            pValue = $.trim( pValue );
            if ( pValue === "" ) {
                return;
            }
            if ( $.isFunction( pTarget ) ) {
                pTarget( pValue );
            } else {
                navigation.redirect( pTarget + encodeURIComponent( pValue ) );
            }
        } // searchValue

        searchField$.keypress( function( pEvent ) {
             // has ENTER been pressed and does the search field contain a value?
             if ( pEvent.which === 13 ) {
                 searchValue( searchField$.val() );
                 pEvent.preventDefault();
             }
         } );
    }

    // Function to add Navigation List Classes
    function addNavigationListClasses(menuId) {
        var i, c, items$, items,
            menu$ = $( "#" + menuId );

        if ( menu$.length ) {
            items$ = menu$.children( "ul" ).children( "li" );
            items = menu$.menu( "option" ).items;

            for (i = 0; i < items.length; i++) {
                c = items[i].id;
                if (c) {
                    items$.eq(i).addClass(c);
                }
            }
        }
    }

})( apex.jQuery, apex.builder, apex.util, apex.lang, apex.navigation );

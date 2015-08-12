/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright © 2014, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * The {@link apex.widget}.regionDisplaySelector is used for the region display selector widget of Oracle Application Express.
 *
 **/

(function( widget, $ ) {
    "use strict";
    // Remember these constants.
    var SHOW_ALL = "#SHOW_ALL";
    var A_SELECTED = "aria-selected";
    var A_CONTROLS = "aria-controls";
    var A_HIDDEN = "aria-hidden";
    var HINT_CLASS = "apex-rds-item--hint";
    var AFTER_CLASS = "apex-rds-after";
    var BEFORE_CLASS = "apex-rds-before";
    var SELECTED_CLASS = "apex-rds-selected";
    var MIN_TAB_WIDTH = 100;
    var FILL_CLASS = "apex-rds--fill";
    var RTL_CLASS = "u-RTL";

    var keys = $.ui.keyCode;

    /**
     *  Region Display selector requires only the first attribute; if jumpMode is not supplied, the selector will default to its normal behavior.
     *
     *  Do not re-initialize regionDisplaySelector during the run time of the app.
     *
     * @param pRegionDisplaySelectorRegion , Container for the tab buttons. Typically a "ul" in which each childa "li"
     *                                       contains a tab link "a". Note that these anchor tags need to
     *                                       have a href attribute that links to a unique element id on the page.
     *                                       Additionally, the ordering of the tabs here MUST match the ordering of their
     *                                       linked elements.

     * @param pOptions
     */
    widget.regionDisplaySelector = function (pRegionDisplaySelectorRegion, pOptions) {

        var tabs = {};
        var isAnimating = false;
        var activeTab = null;
        var firstVisibleTab = null;
        var tabsContainer$;
        var moveNext, movePrevious;
        var sessionStorage = apex.storage.getScopedSessionStorage(
            {
                usePageId: true,
                useAppId: true,
                regionId: pRegionDisplaySelectorRegion
            }
        );
        /**
         * @param pJumpMode                      Flag to indicate you wish to use the new JumpNav behavior. NOT recommended
         *                                       for IE 8 and below.
         *                                       obscuring the rest of the content. If undefined, this function will be set
         *                                       to return 0.
         *                                       Called only if pJumpNode is true.
         * @param pShowHints
         */
        pOptions = jQuery.extend( {},
            {
                mode: "standard", //standard or jump.
                showHints: false,
                useSlider: true,
                useLocationHash: false,
                useSessionStorage: true,
                addMoveNextPrevious: false,
                hidePreviousTab: true,
                onRegionChange: function (mode, activeTab) {
                    var regionChangeListener = tabsContainer$.data("onRegionChange");
                    if (regionChangeListener) {
                        regionChangeListener(mode, activeTab);
                    }
                }
            },
            pOptions
        );

        var pJumpMode = pOptions.mode === "jump";
        var pUseSlider = pOptions.useSlider;
        var pUseLocationHash = pOptions.useLocationHash;
        var pUseSessionStorage = pOptions.useSessionStorage;
        var onRegionChange = pOptions.onRegionChange;

        /**
         * Go through the linked list of tabs in one direction, indicating whether or not the tab and its linked tab element
         * come before or after the existing node. This is especially useful for doing animations that require
         * the animation to know explicity, which elements come before and after the current page.
         * @param tab             the "tab" object literal as constructed in buildTabs().
         * @param pMoveToPrevious   true if moving to the previous node, false if moving forward.
         * @param pShowAll          true if the active
         * tab is "SHOW ALL", false if not.
         */
        var iterateThroughAndClear = function(tab, pMoveToPrevious, pShowAll) {
            var distance = 0;
            while (tab != null) {
                tab.link$.parent().removeClass(SELECTED_CLASS);
                tab.el$.removeClass("apex-rds-element-selected");
                if (pJumpMode) {
                    tab.el$.attr(A_HIDDEN, 'false');
                } else  {
                    // Hide all other page elements if the active tab is SHOW_ALL, show if otherwise.
                    if ( !pShowAll ) {
                        if (pOptions.hidePreviousTab) tab.el$.hide();
                        tab.el$.attr(A_HIDDEN, 'true');
                    } else if ( !tab.hidden ) {
                        tab.el$.attr(A_HIDDEN, 'false');
                        tab.el$.show();
                    }
                }
                tab.parent$.removeClass( HINT_CLASS ).attr(A_SELECTED, false);
                tab.link$.attr("tabIndex", "-1");
                if (pMoveToPrevious) {
                    tab.el$.removeClass( AFTER_CLASS ).addClass( BEFORE_CLASS );
                    tab.link$.parent().removeClass( AFTER_CLASS ).addClass( BEFORE_CLASS );
                    tab = tab.previous;
                } else {
                    tab.el$.addClass( AFTER_CLASS ).removeClass( BEFORE_CLASS );
                    tab.link$.parent().addClass( AFTER_CLASS ).removeClass( BEFORE_CLASS );
                    tab = tab.next;
                }
            }
        };

        /**
         * Does tabs container currently have the FILL_CLASS?
         * Unlike UserWantsFillMode, this checks to see what class is on the body.
         * @returns {*}
         */
        var inFillMode = function () {
            return tabsContainer$.hasClass( FILL_CLASS );
        };

        var fillMode = null;
        var userWantsFillMode = function() {
            // If the tab container ever had the FILL_CLASS on it, that means the user desires a dynamic fill mode.
            if (fillMode == null) {
                fillMode = inFillMode();
            }
            return fillMode;
        };


        var displayIsTable = function() {
            return tabsContainer$.css("display") === "table";
        };

        var slider$ = null;

        var initializeSlider = function() {
            // Never use the slider if the FILL_CLASS is on tabContainer or if the user has not explicitly indicated they want it!
            if (inFillMode() || displayIsTable() || !pUseSlider || slider$ != null) return;
            var leftHoverNode$ = $('<div class="apex-rds-hover left"><a> <span class="a-Icon icon-left-chevron"></span> </a></div>');
            var rightHoverNode$ = $('<div class="apex-rds-hover right" ><a> <span class="a-Icon icon-right-chevron"></span> </a></div>');
            slider$ = $( "<div class='apex-rds-slider'>" );
            slider$.append( leftHoverNode$ ).append( rightHoverNode$ );
            tabsContainer$.parent().prepend( slider$ );
            var hoverNode = function ( hover$, right ) {
                var showing = true;
                // Code borrowed and modified from http://stackoverflow.com/questions/10219649/continuous-scroll-on-hover-performance
                // Loop continuously on hover until the user mouses away!
                var loop = function () {
                    var offset = right ? "+=20px" : "-=20px";
                    tabsContainer$.stop().animate({scrollLeft: offset}, 100, 'linear', loop);
                    checkState();
                };

                // called when the user mouses away from the hover object
                var stop = function () {
                    tabsContainer$.stop();
                };

                hover$.click(function () {
                    var offset = right ? "+=200px" : "-=200px";
                    tabsContainer$.stop(false, false).animate({scrollLeft: offset}, 100);
                });

                // Public function used to assess whether or not the current node needs to be hidden or displayed.
                var checkState = function () {
                    var padding = parseInt(tabsContainer$.css('paddingRight')) + parseInt(tabsContainer$.css('paddingLeft'));
                    var scrollWidth = tabsContainer$[0].scrollWidth - padding;
                    var width = tabsContainer$.width();
                    //We know that the scrollWidth minus the viewable width of the container is equal to the max
                    // scroll left of the container.
                    var maxScrollLeft = scrollWidth - width;
                    var minScrollLeft = 0;
                    var scrollLeft = tabsContainer$.scrollLeft();
                    var hasHitBounds;
                    //If right, its bound is the maxScrollLeft. If left, the bound is the minScrollLeft
                    if ( right ) {
                        hasHitBounds = scrollLeft >= maxScrollLeft;
                    } else {
                        hasHitBounds = scrollLeft === minScrollLeft;
                    }
                    // If it showing and its bound has been hit, hide!
                    if (hasHitBounds) {
                        hover$.hide();
//                        hover$.css( "paddingRight" , 0 ).css( "paddingLeft" , 0 );
                        return false;
                    } else if (!hasHitBounds) {  // Otherwise, if it is not showing and no longer touching the bounds, show it.
                        hover$.show();
//                        tabsContainer$.css( "paddingRight" , 45 ).css( "paddingLeft" , 45 );
                    }
                    return true;
                };
                hover$.hover(loop, stop);
                return {
                    "checkState": checkState
                }
            };

            var hoverRight = hoverNode( rightHoverNode$ , true);
            var hoverLeft = hoverNode( leftHoverNode$ , false);
            var checkState = function() {
                hoverLeft.checkState();
                hoverRight.checkState();
            };
            var scrollDebouncer;
            tabsContainer$.scroll(function() {
                clearTimeout(scrollDebouncer);
                scrollDebouncer = setTimeout(checkState, 200);
            });
            $( window ).on("apexwindowresized", checkState);
            //Check the state of the hover nodes on hover, scroll, and resize and change their display if necessary.
//            tabsContainer$.scroll(checkState);
            checkState();

        };





        /**
         * Constructor for regionDisplaySelector
         */
        var buildTabs = function () {
            var realNumberOfTabs = 0;
            var rtlMode = false;
            tabsContainer$ = $("#" + pRegionDisplaySelectorRegion + "_RDS");
            tabsContainer$.attr("role", "tablist");
            if ( tabsContainer$.css("direction") === "rtl" ) {
                tabsContainer$.addClass(RTL_CLASS);
                rtlMode = true;
            }

            // When the link is clicked, first make the tab active, then focus the link so that keyboard controls
            // can kick in!
            var onClick = function ( currentTab, e ) {
                currentTab.makeActive( true );
                if ( e == undefined || !e.doNotFocus ) {
                    currentTab.link$.focus();
                }
            };

            movePrevious = function (tab, options) {
                moveToRegion( tab, "getPreviousVisible", "getNextVisible", options);
            };

            moveNext = function (tab, options) {
                moveToRegion( tab, "getNextVisible", "getPreviousVisible", options);
            };

            var moveToRegion = function (tab, key, backwardKey, event) {
                var forward = tab[key]();
                if (forward  != null) {
                    onClick(forward, event)
                } else {
                    var tab1 = tab;
                    var backward = tab1[backwardKey]();
                    while (backward != null) {
                        tab1 = backward;
                        backward = backward[backwardKey]();
                    }
                    onClick(tab1, event);
                    firstVisibleTab.el$.addClass("apex-rds-swap");
                    lastVisibleTab.el$.addClass("apex-rds-swap");
                }
            };

            var tabShouldBeHidden = function() {
                return !pJumpMode && pOptions.hidePreviousTab;
            };

            
            var getFirstUnhiddenTab = function( tab, direction ) {
                if ( !tab ) {
                    return null;
                }
                if ( !tab.hidden )  {
                    return tab;
                }
                while ( tab[  direction ] ) {
                    tab = tab[ direction ];
                    if ( !tab.hidden ) {
                        return tab;
                    }
                }
                return null;
            };
            
            /**
             * For future reference, never alter the relations between objects in a data structure if you intend
             * on referencing those very same relations in the future.
             *
             * @param tab
             */
            var showTabInList = function ( tab ) {
                tab.hidden = false;
                var nextVisible = tab.getNextVisible();
                if (nextVisible === null) {
                    lastVisibleTab = tab;
                }
                var previousVisible = tab.getPreviousVisible();
                if (previousVisible === null) {
                    lastVisibleTab = tab;
                }

                tab.parent$.show();
                if ( activeTab.href !== SHOW_ALL && tabShouldBeHidden() && tab !== activeTab ) {
                    tab.el$.hide();
                } else if ( !pOptions.hidePreviousTab ) {
                    tab.el$.css("display", ""); // The tab should not be made visible because it's not meant to have the css class "display: block"
                }
            };

            var hideTabInList = function( tab ) {
                if ( activeTab === tab ) {
                    if ( tab.previous ) {
                        tab.previous.makeActive( true );
                    } else if ( tab.next ) {
                        tab.next.makeActive( true );
                    }
                }
                tab.hidden = true;
                if ( tab === firstVisibleTab ) {
                    firstVisibleTab = tab.getNextVisible();
                }
                if ( tab === lastVisibleTab ) {
                    lastVisibleTab = tab.getPreviousVisible();
                }
                tab.parent$.hide();
            };


            if (pOptions.addMoveNextPrevious) {
                var movePrevious$ =
                    $('<button type="button" class="apex-rds-previous-region apex-rds-button" title="Previous" aria-label="Previous">' +
                        '<span class="a-Icon icon-left-chevron" aria-hidden="true"></span>' +
                      '</button>');
                var moveNext$ =
                    $('<button type="button" class="apex-rds-next-region apex-rds-button" title="Next" aria-label="Next">' +
                        '<span class="a-Icon icon-right-chevron" aria-hidden="true"></span>' +
                       '</button>');
                tabsContainer$.parent()
                    .prepend(movePrevious$)
                    .append(moveNext$);
                movePrevious$.click(function () {
                    movePrevious(activeTab);
                });
                moveNext$.click(function () {
                    moveNext(activeTab);
                });
            }

            if (pJumpMode) {
                tabsContainer$.addClass("apex-rds-container--jumpNav");
            }
            tabsContainer$.css({ // Make sure that the tab container does not wrap elements around.
                "white-space": "nowrap",
                "overflow-x": "hidden"
            });
            //Get the links inside the tabsContainer.
            var links$ = $("a", tabsContainer$);
            var previousTab = null;
            var timeoutLocationHash;

            var lastVisibleTab = null;
            if (links$.length <= 2 && links$.eq(0).attr("href") == SHOW_ALL) { // Don't initialize the RDS if this is a legacy RDS with only two tabs!
                tabsContainer$.remove();
                return;
            }
            // If the tabs container is in Right-to-left mode, the links order must be reversed to ensure the resulting linked list
            // (next, previous) are in the appropriate order.
            if ( rtlMode ) {
                links$ = $( links$.get().reverse() );
            }
            // Construct a hashed doubly linked list in order to minimize the amount of other elements we need to check.
            // when the user scrolls.
            links$.each(function (index) {
                var link$ = $( this );
                var href = link$.attr("href");
                // As stated previously, the href supplied MUST link to tab element on the page.
                var tabEl$ = $( href );
                tabEl$.attr( "role" , "tabpanel");
//                    .attr("aria-labelledby", "id of tab");
                if (href == SHOW_ALL && pJumpMode) {
                    // DO NOT show the "show_all" tab
                    link$.parent().css("display", "none");
                    return;
                }
                link$.attr( "role", "presentation"); // Ensure that JAWS or other screen readers don't speak the links!
                var scrollToTab = function (pTab) {
                    if (inFillMode() || !pUseSlider || displayIsTable()) return;
                    var leftAdjust = -tabsContainer$.width() / 2;
                    var left = pTab.getLeft() / 2;
                    var previous = pTab;
                    while (previous.previous != null) {
                        previous = previous.previous;
                        left += previous.parent$.outerWidth();
                    }
                    // Make sure that the activeTab is visible on the user's screen.
                    tabsContainer$.stop(true, true).animate({
                        scrollLeft: left + leftAdjust
                    }, function () {

                    });
                };

                // Don't check if the current tab is active, just make it active.
                var forceActive = function ( scrollToActive ) {
                    if ( this.hidden ) {
                        return;
                    }
                    iterateThroughAndClear(this.previous, true, href == SHOW_ALL);
                    iterateThroughAndClear(this.next, false, href == SHOW_ALL);
                    firstVisibleTab.el$.removeClass( "apex-rds-swap" );
                    lastVisibleTab.el$.removeClass( "apex-rds-swap" );
                    if ( timeoutLocationHash != undefined ) {
                        clearTimeout( timeoutLocationHash );
                    }
                    // We need to "debounce" changing the location hash, since changing the location hash
                    // hijacks the page's scrolling.
                    if (pUseLocationHash) {
                        timeoutLocationHash = setTimeout(function () {
                            if ("history" in window && window.history && window.history.pushState) {
                                history.pushState(null, null, href);
                            } else {
                                var noJumpScroll = $(window).scrollTop();
                                location.hash = href;
                                $(window).scrollTop( noJumpScroll );
                            }
                        }, 10);
                    }
                    if ( tabShouldBeHidden() ) {
                        tabEl$.show();
                    }
                    activeTab = this;
                    activeTab.el$.attr( A_HIDDEN, false );
                    activeTab.el$.addClass( "apex-rds-element-selected" );
                    activeTab.parent$.attr( A_SELECTED, true );
                    activeTab.link$.removeAttr( "tabindex" );
                    scrollToTab( this );
                    link$.parent().removeClass(HINT_CLASS).addClass(SELECTED_CLASS);
                    // Store the user's page preference here.
                    if ( pUseSessionStorage ) {
                        sessionStorage.setItem("activeTab", href);
                    }
                    onRegionChange( pOptions.mode, activeTab );
                    if ( scrollToActive ) {
                        var offset = 0;
                        // If in JumpMode, the body needs to scroll into position.
                        if (pJumpMode) {
                            var top = currentTab.getTop();
                            offset = apex.theme.defaultStickyTop();
                            isAnimating = true;
                            $('html,body').stop(true, true).animate({scrollTop: top - offset}, {
                                duration: 'slow',
                                step: function (position, tween) {
                                    var end = currentTab.getTop() - offset;
                                    if (end != tween.end) {
                                        tween.end = end;
                                    }
                                },
                                complete: function () {
                                    isAnimating = false;
                                    if (pUseLocationHash) location.hash = href;
                                }
                            });
                        } else {
                            offset = tabsContainer$.data("showAllScrollOffset")();
                            if (offset !== false) {
                                window.scrollTo(0, offset);
                            }
                        }
                    }
                };
                // Each tab object literal is composed of its element, its link (which should have a button as its parent)
                var currentTab = tabs[href] = {
                    "href": href,
                    "el$": tabEl$,
                    "link$": link$,
                    "parent$": link$.parent(),
                    "forceActive": forceActive,
                    "makeActive": function ( userWantsScroll ) {
                        //Anything that could prevent a tab from becoming active should be written here (guards, if you
                        // will) should be written here.
                        if (activeTab === this) {
                            return;
                        }
                        forceActive.call(this, userWantsScroll);
                    },
                    "getNextVisible": function() {
                        return getFirstUnhiddenTab( currentTab.next , "next" );
                    },
                    "getPreviousVisible": function() {
                        return getFirstUnhiddenTab( currentTab.previous , "previous")
                    },
                    "getTop": function () {
                        return tabEl$.offset().top;
                    },
                    "getLeft": function () {
                        return this.parent$.offset().left;
                    },
                    "showHint": function () {
                        var previous = this.previous, next = this.next;
                        while (previous != null) {
                            previous.parent$.removeClass( HINT_CLASS );
                            previous = previous.previous;
                        }
                        while (next != null) {
                            next.parent$.removeClass( HINT_CLASS );
                            next = next.next;
                        }
                        this.parent$.addClass( HINT_CLASS );
                    },
                    "previous": previousTab,
                    "next": null
                };
                currentTab.parent$.attr(A_CONTROLS, href.substring(1)).attr("role", "tab");

                // Does the current tab link href match the user's location hash?
                // If yes, we know that this must be the page the user wants to navigate to.
                if (location.hash == href && pUseLocationHash) {
                    activeTab = currentTab;
                }
                // Keep track of the head of the list; it will be needed in case an activeTab could not be found.
                if (firstVisibleTab == null) {
                    firstVisibleTab = currentTab;
                }
                // We know implicitly that the "next" tab of the "previous" tab is the current tab.
                if (previousTab != null) {
                    previousTab["next"] = currentTab;
                }
                previousTab = currentTab;
                link$.click(function (e) {
                    onClick(currentTab, e);
                    return false;
                });
                // When the link has focus, process these following key down events according to APEX's master key list.
                link$.on("keydown", function (event) {
                    var kc = event.which;
                    //Moving next for down and up is useful when jumpNav is active.
                    if (kc === keys.UP) {
                        moveNext(currentTab);
                    } else if (kc === keys.DOWN) {
                        movePrevious(currentTab);
                    } else if (kc === keys.PAGE_DOWN) {
//                        event.preventDefault()
                    } else if (kc === keys.PAGE_UP) {
//                        event.preventDefault();
                    } else if (kc === keys.RIGHT) {
                        moveNext(currentTab);
                    } else if (kc === keys.LEFT) {
                        movePrevious(currentTab);
                    } else if (kc === keys.HOME) {
                        firstVisibleTab.link$.click();
                    } else if (kc === keys.END) {
                        lastVisibleTab.link$.click();
                    } else if (kc == keys.SPACE) {
                        currentTab.link$.click();
                    }  else {
                        return;
                    }
                    event.preventDefault();
                });
                currentTab.el$.on("apexaftershow", function( e ) {
                    if (e.target === currentTab.el$[0]) {
                        showTabInList( currentTab );
                    }
                });
                currentTab.el$.on("apexafterhide", function( e ) {
                    if (e.target === currentTab.el$[0]) {
                        hideTabInList( currentTab );
                    }
                });

                realNumberOfTabs++;

            });


//            Tried doing Ctrl + Up.
//            var ctrlPressed = false;
//            var upPressed = false;
//            $( ".container").on("keyup", "t-Region", function (event) {
//                var kc = event.which;
//                if (kc === keys.UP) {
//                    upPressed = false;
//                } else if (kc == keys.CTRL) {
//                    ctrlPressed = false;
//                }
//            }).on("keydown", function (event) {
//                var kc = event.which;
//                if (kc === keys.UP) {
//
//                    upPressed = true;
//                } else if (kc == keys.CTRL) {
//                    ctrlPressed = true;
//                }
//
//                if (upPressed && ctrlPressed) {
//                    activeTab.link$.focus();
//                    upPressed = false;
//                    ctrlPressed = false;
//                }
//            });

            // If the user has ever indicated a desire for a "fill" style tabs,
            // then we must dynamically add and remove it to the page.
            var handleFillModeResize = function () {
                if (userWantsFillMode() && pUseSlider) {
                    var fixedTabWidth = tabsContainer$.width() / realNumberOfTabs;
                    // If the page is too small, switch to the normal mode.
                    if (fixedTabWidth < MIN_TAB_WIDTH) {
                        if (slider$ == null) {
                            tabsContainer$.removeClass( FILL_CLASS );
                            initializeSlider();
                        }
                    } else {
                        // If the page is normal size, and if the slider is active, switch it off and resume fill mode.
                        if (slider$ != null) {
                            tabsContainer$.addClass( FILL_CLASS );
                            slider$.hide();
//                            tabsContainer$.off( "scroll" ).off( "hover" );
//                            slider$ = null;
                        }
                    }
                }
            };
            initializeSlider();
            handleFillModeResize();
            lastVisibleTab = previousTab;
            if (activeTab == null) {
                // The user cannot override a hash with their preference if the link they supplied already set the active Tab.
                if (pUseSessionStorage) {
                    var href = sessionStorage.getItem( "activeTab" );
                    for (var key in tabs) {
                        if (tabs[key].href == href) {
                            activeTab = tabs[key];
                            if (pUseLocationHash) location.hash = href;
                            break;
                        }
                    }
                }
                if (activeTab == null) activeTab = firstVisibleTab;
            }
            tabsContainer$.click(function () {
                firstVisibleTab.link$.focus();
            });
            $( window ).on("apexwindowresized", handleFillModeResize);
            if (pJumpMode) {
                // To ensure that the jumpnav can jump fully to the last tab content, that tab content
                // must have a height of at least 70vh. Note that we use a class here as opposed to just 70vh
                // in order to inform future developers who come across this wrapped div, about its purpose.
                lastVisibleTab.el$.wrap("<div class='apex-rds-last-item-spacer'></div>");
            }
            tabsContainer$.data("showAllScrollOffset", function () {
                return 0
            });


            /**
             * This is to ensure that previous assumptions premised on RDS do not break as a result of changes made here.
             */
            if ( SHOW_ALL == firstVisibleTab.href && activeTab != firstVisibleTab) {
                var deferredTab = activeTab;
                firstVisibleTab.forceActive();
                setTimeout(function() {
                    deferredTab.forceActive( true );
                }, 250);
            } else {
                activeTab.forceActive( true );
            }
        };

        var getScrollOffset = function() {
            var scrollTop = $( window ).scrollTop();
            var lookMargin = 60;
            return tabsContainer$.offset().top + tabsContainer$.outerHeight() + lookMargin;
        };

        /**
         *
         * @param tab
         * @returns {*}
         */
        var getNextActiveTabFromSiblings = function( tab ) {
            var currentScrollPosition = getScrollOffset();
            // Using the doubly linked list, check if the active tab's siblings are within the page's scrollTop
            // and the defined offset.
            var next = tab.getNextVisible();
            if (next != null) {
                if (next.getTop() < currentScrollPosition) {
                    return next;
                }
            }
            var previous = tab.getPreviousVisible();
            if (previous != null) {
                if (currentScrollPosition < tab.getTop()) {
                    return previous;
                }
            }
            return null;
        };


        var initializeStandardTabs = function () {
            buildTabs();
            var hintedTab = null;
            // Always show the hints when in standard mode and when the active tab is "SHOW ALL"
            $( window ).on( "scroll" , function () {
                if ( !activeTab || activeTab.href != SHOW_ALL )  return;
                var offset = getScrollOffset();
                if (hintedTab == null) {
                    //Manually get the hinted tab from traversing the entire list.
                    var tab = firstVisibleTab;
                    while ( tab ) {
                        if (!tab.hidden && tab.href != SHOW_ALL && tab.getTop() < offset) {
                            hintedTab = tab;
                            hintedTab.showHint();
                        }
                        tab = tab.next;
                    }
                } else {
                    var nextHintedTab = getNextActiveTabFromSiblings( hintedTab );
                    if (nextHintedTab != null) {
                        hintedTab = nextHintedTab;
                        nextHintedTab.showHint();
                    }
                }
            });
        };

        // JumpNav requires a scroll listener and a resizeEnd listener.
        var initializeJumpNav = function () {
            buildTabs();
            // Attach the scrol listeners here;
            var resizeHeight = $(window).height() / 3; // PROTIP:
            // Hoisting places all these var statements at the beginning of the  defined scope!
            //  In other words, declaring it here is only important in deciding which var statement to
            // execute/resolve first.
            var checkTabs = function () {
//              // Do not execute the main scroll listener block while the user is getting scrolled to his or her content
                // i.e. isAnimating.
                if (!isAnimating) {
                    var tabToMakeActive = getNextActiveTabFromSiblings( activeTab );
                    if (tabToMakeActive != null) {
                        tabToMakeActive.makeActive();
                    }
                }
            };

            $(window).on("scroll", checkTabs);

            $(window).on("apexwindowresized", function () {
                resizeHeight = $(window).height() / 3;
                checkTabs();
            });

        };

        if (pJumpMode) {
            initializeJumpNav();
        } else {
            initializeStandardTabs();
        }
        return {
            "tabs": tabs,
            "moveNext": moveNext,
            "movePrevious": movePrevious,
            "getActiveTab": function() {
                return activeTab;
            }
        }
    };
})( apex.widget, apex.jQuery );
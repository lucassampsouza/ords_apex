/**
 * @fileOverview
 * The apex.theme42 namespace is used to store all JavaScript functions used by theme 43
 **/
/*global apex, window, Modernizr, ToggleCore*/
apex.theme42 = {};
(function( theme42, $, undefined ) {
    "use strict";

    /**
     * Library constants
     * @type {string}
     */

    var TREE_NAV                = "#t_TreeNav",
        RIGHT_CONTROL_BUTTON    = "#t_Button_rightControlButton",
        PAGE_BODY               = "#t_PageBody",
        PAGE_TITLE              = "#t_Body_title",
        HEADER                  = "#t_Header",
        SIDE_COL                = "#t_Body_side",
        BODY_CONTENT            = "#t_Body_content",
        ACTIONS_COL             = "#t_Body_actions",
        SEL_HS_REGION           = ".t-Region--hideShow",
        A_CONTROLS = "aria-controls",
        A_EXPANDED = "aria-expanded",
        A_HIDDEN = "aria-hidden";

    /**
     * Global elements that may or may not be present on the page (this will require getElementAndForceCheckExistence
     * to be certain.
     */
    var treeNav$;
    var pageBody$;
    var bodyContent$;
    var tbodyTitle$;
    var mainBody$;
    var sideCol$;
    var header$;
    var actionsCol$;
    var TREE_NAV_WIDGET_KEY = "nav";
    var RIGHT_WIDGET_KEY = "right";
    var MENU_NAV_WIDGET_KEY = "menuNav";

    var initializeWizard = function() {
        // $(".t-WizardSteps").find(".t-WizardSteps-step.is-active").prevAll('.t-WizardSteps-step').addClass('is-complete');
    };

    var initializeTabsRegion = function() {
        if ( !$(".t-Region--carousel").carousel ) {
            return;
        }
        $(".t-Region--carousel").carousel({containerBodySelect: ".t-Region-carouselRegions", html:true});
        $(".t-TabsRegion").carousel({
            containerBodySelect: ".t-TabsRegion-items",
            html: true,
            onRegionChange: function( mode,  activeTab ) {
                if (!activeTab) return;
                var previous = activeTab.previous;
                var next = activeTab.next;
                while (previous) {
                    previous.parent$.removeClass("is-active");
                    previous = previous.previous;
                }
                while (next) {
                    next.parent$.removeClass("is-active");
                    next = next.next;
                }
                activeTab.parent$.addClass("is-active");
                activeTab.el$.find(".js-stickyWidget-toggle").trigger("forceresize");
            }
        });
        $(".t-TabsRegion").each(function() {
            var myRe = /t-TabsRegion-mod--([^\s]*)/;
            var classes = this.className.split(/\s+/);
            var tabClasses = [];
            for (var i = 0; i < classes.length; i++) {
                var match = classes[i].match(myRe);
                if (match != null && match.length > 0) {
                    tabClasses.push("t-Tabs--" + match[1]);
                }
            }
            var tabsRegion$ = $(this);
            var tabsRegionItems$ = tabsRegion$.find(".t-TabsRegion-items").first();
            if (tabClasses.length > 0) {
                var controls$ = tabsRegionItems$.find("> .a-Region-carouselControl").first();
                controls$.after(tabsRegionItems$.find("> .a-Region-carouselItems").first());
                var minTabHeight = parseInt(tabsRegionItems$.css("min-height").replace(/[^-\d\.]/g, ''));
                tabsRegionItems$.css("minHeight", minTabHeight + controls$.height());
                var tabs$ = controls$.find("> .a-Region-carouselNav").first().addClass("t-Tabs");
                for (var n = 0; n < tabClasses.length; n++) {
                    tabs$.addClass(tabClasses[n]);
                }
                tabs$.find("> li").each(function() {
                    $(this).addClass("t-Tabs-item").find("> a").each(function() {
                        $(this).addClass("t-Tabs-link").find("span").each(function() {
                            $(this).addClass("t-Tabs-label");
                        });
                    });
                });
            };
        });
    };

    var screenIsSmall = function () {
        var pageHasTreeView =  !!treeNav$ && treeNav$.length > 0;
        var pageHasLeftAndIsTooSmall = pageHasTreeView && pageBody$.hasClass( 't-PageBody--showLeft' ) && Modernizr.mq( 'only screen and (max-width: 992px)' );
        var pageIsSimplyTooSmall = Modernizr.mq( 'only screen and (max-width: 640px)' );
        return  pageHasLeftAndIsTooSmall || pageIsSimplyTooSmall;
    };

    var getTitleHeight = function() {
        return  $( PAGE_TITLE ).outerHeight();
    };



    var scrollTitleHandler = function() {
        tbodyTitle$ = $(".t-Body-title");
        if ($(".t-BreadcrumbRegion").length <= 0 || tbodyTitle$.length <= 0 || !$.trim(tbodyTitle$.html())) return;
        var shadowCore = ToggleCore({
            content: tbodyTitle$,
            contentClassExpanded: "has-shadow",
            contentClassCollapsed: "",
            useSessionStorage: false,
            defaultExpandedPreference: true
        });
        var expandedHeight = $( PAGE_TITLE ).outerHeight();
        var storedTitleHeight = getTitleHeight;
        var debounceTitleChange;
        var recal =
            function() {
                getTitleHeight = function () {
                    if ( !shrinkCore.isExpanded() ) {
                        return 48;
                    } else {
                        var realPageTitleHeight =  $( PAGE_TITLE ).outerHeight();
                        if (expandedHeight < realPageTitleHeight) expandedHeight = realPageTitleHeight;
                        return expandedHeight;
                    }
                };
                $( ".js-stickyWidget-toggle" ).stickyWidget( "redoTop" );
                clearTimeout( debounceTitleChange );
                resetHeaderOffset();
                debounceTitleChange = setTimeout(function() {

                    getTitleHeight = storedTitleHeight;
                    resetHeaderOffset();
                    $( ".js-stickyWidget-toggle" ).stickyWidget( "redoTop" );
                }, 500);

            };
        var shrinkCore = ToggleCore({
            content: tbodyTitle$,
            contentClassExpanded: "",
            contentClassCollapsed: "t-Body-title-shrink",
            useSessionStorage: false,
            defaultExpandedPreference: true,
            onExpand: recal,
            onCollapse: recal
        });
        shrinkCore.initialize();
        shadowCore.initialize(); // TODO: Make ToggleCore initialize by default
        var shrinkThreshold = function() {
            // The threshold for shrinkage, if expanded, is the tBodyInfo height or 400 pixels, if the height is less than 100.
            if (shrinkCore.isExpanded()) {
                var tBodyInfoHeight = $(".t-Body-info").outerHeight() - 100;
                if (tBodyInfoHeight > 100) return tBodyInfoHeight;
                return 400;
            } else {
                return 0;
            }
        };
        var addTop = function() {
            var scrollTop = $( this ).scrollTop();
            if (scrollTop == 0) {
                shadowCore.collapse();
            } else if (scrollTop > 0) {
                shadowCore.expand();
            }
            var top = shrinkThreshold();
            if ( scrollTop <= top ) {
                shrinkCore.expand();
            } else if ( scrollTop > top ) {
                shrinkCore.collapse();
            }
        };
        $(window).scroll(addTop);
        addTop.call(window);

    };

    var rds$ = $( ".t-Body-info .apex-rds-container" );

    var getFixedHeight = function() {
        var headerHeight = $( "header" ).outerHeight();
        var rdsHeight = 0;
        if (rds$.length > 0) {
            rdsHeight += rds$.outerHeight();
        }
        if (screenIsSmall()) {
            if (pageBody$.hasClass("js-HeaderContracted")) {
                return rdsHeight;
            }
            return headerHeight + rdsHeight;
        }
        return getTitleHeight() + headerHeight + rdsHeight - 1;
    };

    apex.theme.defaultStickyTop = getFixedHeight;


    var sticky = theme42.sticky = function( selector) {
        $( selector ).stickyWidget(
            {
                zIndexStart: 200,
                toggleWidth: true,
                stickToBottom: true
            }
        );
    };



    var stickClassicReports = theme42.stickClassicReports = function () {
        $(".t-Body-contentInner .t-Report-tableWrap").setTableHeadersAsFixed();
        sticky( ".js-stickyTableHeader" );
    };

    var pages = {
        "masterDetail": {
            "ontheme42ready": function() {
                $( ".apex-rds" ).data( "onRegionChange" , function ( mode ) {
                    if (mode !== 'jump') {
                        $(".t-StatusList-blockHeader,.js-stickyTableHeader").trigger( "forceresize" );
                    }
                });
                sticky( ".t-Body-contentInner .t-StatusList .t-StatusList-blockHeader" );
                stickClassicReports();
                $(".apex-rds" ).eq(0).data( "showAllScrollOffset" , function() {
                    var tHeight = $( "#t_Body_info" ).height() - 50;
                    if ($(window).scrollTop() > tHeight) {
                        return tHeight;
                    }
                    return false;
                });
            }
        },
        "leftSideCol": {},
        "rightSideCol" : {},
        "noSideCol": {},
        "appLogin": {},
        "wizardPage": {
            "onready": initializeWizard
        },
        "wizardModal": {
            "onready": function() {
                initializeWizard();
                function initDialog() {
                    var headerheight = $('.t-Wizard-steps').height(),
                        footerheight = $('.t-Wizard-footer').height();
                    $('.t-Wizard-body').css({
                        'top': headerheight,
                        'bottom': footerheight
                    });
                }
                $(window).bind('apexwindowresized', function() {
                    initDialog();
                });
                initDialog();
            }
        },
        "bothSideCols": {},
        "popUp": {},
        "modalDialog": {
            "onready": function() {
                initializeWizard();
                function initDialog() {
                    var headerheight = $('.t-Dialog-header').height(),
                        footerheight = $('.t-Dialog-footer').height();
                    $('.t-Dialog-body').css({
                        'top': headerheight,
                        'bottom': footerheight
                    });
                }
                $(window).bind('apexwindowresized', function() {
                    initDialog();
                });
                initDialog();
            }
        }
    };

    theme42.initializePage = function() {
        var wrapFunc = function( onReady, onTheme42Ready ) {
            return function() {
                if (onReady != undefined) onReady();
                if (onTheme42Ready != undefined) {
                    $(window).on("theme42ready", function() {
                        onTheme42Ready();
                    });
                }
            }
        };
        var returnPages = {};
        for (var key in pages) {
            returnPages[key] = wrapFunc(pages[key]["onready"], pages[key]["ontheme42ready"]);
        }
        return returnPages;
    }();

    var initializeTree = function() {
        treeNav$ = $( TREE_NAV );

        var ignoreActivateTreeStart = true;
        treeNav$.treeView({
            showRoot: false,
            iconType: "fa",
            useLinks: true,
            navigation: true,
            autoCollapse: true
        });
        treeNav$.treeView( "getSelection" ).parents().children(".a-TreeView-content").addClass("is-current");
        treeNav$.treeView("getSelection").parents(".a-TreeView-node--topLevel").children(".a-TreeView-content, .a-TreeView-row").removeClass("is-current").addClass("is-current--top");

        $(".t-TreeNav .a-TreeView-node--topLevel > .a-TreeView-content").each(function() {
            if ($(this).find(".fa").length <= 0) {
                $(this).prepend('<span class="fa fa-file-o"></span>');
            }
        });

        // Code to add badge list to tree view label.
        $(".a-TreeView-label").each(function() {
            var label = this.innerHTML;
            var match = /.*\[(.*)\].*/.exec( label );
            if (match != null && match.length > 1) {
                label = label.replace(/\[.*\]/, "") + "<span class='a-TreeView-badge'>" + match[1] + "</span>";
                this.innerHTML = label;
            }
        });
    };

    var getElementAndForceCheckExistence = function( selector ) {
        var element = $( selector );
        apex.debug.log( $( element) );
        if(!element.length) {
            // You're not getting away that easy...
            var error = "Invalid HTML, " + selector + " could not be found!";
//            apex.debug.error( "Invalid HTML, " + selector + " could not be found!" );
            throw error;
        }
        return element;
    };

    var resetHeaderOffset = function() {
        var pageTitle$ = $( PAGE_TITLE );
        var pageTitleHeight = getTitleHeight();
        var headerHeight    = header$.outerHeight();
        if (Modernizr.mq('only screen and (min-width: 641px)')) {
            sideCol$.css({
                "top": pageTitleHeight + headerHeight
            });
            bodyContent$.css({
                "margin-top": pageTitleHeight + headerHeight - 3
            });
            mainBody$.css({
                "margin-top": 0
            });
            if (treeNav$ == null) {
                 pageTitle$.css({
                     "top": headerHeight
                 });
            }
        } else {
            sideCol$.css({
                "top": '0'
            });
            bodyContent$.css({
                "margin-top": '0'
            });
            var marginTop = headerHeight;
            if ( !treeNav$ ) {
//                marginTop -= $(".t-Header-branding").outerHeight();
            }
            mainBody$.css({
                "margin-top": marginTop
            });

        }
        actionsCol$.css({
            "top": headerHeight
        });
    };


    var debounceResize;
    /**
     * A special theme42 resize event  invoked whenever a page layout is expected to be different than the
     * current 400ms from now.  Typically this is for when a left side nav column or a right actions column
     * expands or collapses.
     */
    var theme42resize = function() {
        clearTimeout( debounceResize );
        debounceResize = function() {
            //TODO: Use John's protocol in the future.
            $(".js-stickyWidget-toggle").each(function() {
                $( this ).trigger( "forceresize" );
            });
            $(".js-stickyTableHeader").each(function() {
                $( this ).trigger("forceresize" );
            });
            $( ".a-MenuBar" ).menu( "resize" );
        };
        setTimeout(debounceResize, 400);
    };

    var toggleWidgetManager = function() {
        var pushModal;
        var toggleWidgets = {};
        var resetActionsColumn = function() {
            if (pageBody$.hasClass('t-PageBody--showLeft') && Modernizr.mq('only screen and (max-width: 992px)')) {
                expandWidget(RIGHT_WIDGET_KEY);
            } else if (Modernizr.mq('only screen and (max-width: 640px)')) {
                collapseWidget(RIGHT_WIDGET_KEY);
            }
        };

        /**
         * Checks if the toggleWidget specified by key has been built, if it has then call its collapse event.
         * @param key
         */
        var collapseWidget = function (pKey, pSaveUserPreference) {
            if (pKey in toggleWidgets) {
                toggleWidgets[pKey].collapse(pSaveUserPreference);
            }
        };

        /**
         * Checks if the toggleWidget specified by key has been built, if it has then call its expand event.
         * @param key
         */
        var expandWidget = function (pKey, pSaveUserPreference) {
            if (pKey in toggleWidgets) {
                toggleWidgets[pKey].expand(pSaveUserPreference);
            }
        };

        /**
         * To recognize that a toggle widget exists and to initialize so that it works in the context of the current page
         * i.e. "build" it, pass in an object literal to buildToggleWidgets with the following key/values.
         *      "key",                  allows this widget to be expanded or collapsed during run time
         *                              from any other function using collapseWidget(YOUR_KEY) or expandWidget(YOUR_KEY)
         *      "checkForElement",      the element id, class (or arbitrary jquery selector)
         *                              which must exist for this toggleWidget to be initialized.
         *
         *                              All other attributes are used for ToggleCore.
         *
         * NOTE: Right now buildToggleWidget assumes that none of these key/values will be null or undefined!
         *
         * @param pOptions
         * @returns {boolean} true if the element to check for exists on the page and the toggle widget has been built, false if otherwise.
         */
        var buildToggleWidget = function (pOptions) {
            var checkForElement = pOptions.checkForElement,
                key             = pOptions["key"],
                button$          = $(pOptions.buttonId),
                widget,
                expandOriginal = pOptions["onExpand"],
                collapseOriginal = pOptions["onCollapse"];
            var element$ = $(checkForElement);
            if ( !element$ || element$.length <= 0 ) {
                return false;
            }
            pOptions["controllingElement"] = button$;
            button$.attr( A_CONTROLS, element$.attr("id") );

            pOptions["content"] = pageBody$;
            pOptions["contentClassExpanded"] = "js-" + key + "Expanded";
            pOptions["contentClassCollapsed"] = "js-" + key + "Collapsed";
            pOptions["onExpand"] = function() {
                expandOriginal();
                button$.addClass("is-active").attr(A_EXPANDED, "true");
                pushModal.notify();
            };
            pOptions["onCollapse"] = function() {
                collapseOriginal();
                button$.removeClass("is-active").attr(A_EXPANDED, "false");
                pushModal.notify();
            };

            widget = ToggleCore(pOptions);
            toggleWidgets[key] = widget;
            return true;
        };

        var initialize = function() {
            try {
                //TODO: Unchecked exception handling for normal program control flow
                //(in this case handling the known issue where certain elements don't exist on the page)
                // is an antipattern. Refactor this immediately.
                pageBody$ = getElementAndForceCheckExistence(PAGE_BODY);
                mainBody$ = getElementAndForceCheckExistence(".t-Body-main");
                header$ = getElementAndForceCheckExistence(HEADER);
                bodyContent$ = getElementAndForceCheckExistence(BODY_CONTENT);
            } catch (err) {
                return;
            }
            $('body').append("<div id='pushModal' style='width: 100%; display:none; height: 100%;' class='u-DisplayNone u-Overlay--glass'></div>");
            // Temporarily disabled pushModal to fix some integration issues. TODO:Fix this immediately.
            $(window).bind('apexwindowresized', function() {
                for (var key in toggleWidgets) {
                    toggleWidgets[key].resize();
                }
                pushModal.notify();
            });
            pushModal = {
                el$: getElementAndForceCheckExistence("#pushModal"),
                "collapse": function() {
//                    apex.debug.log("conditions for contract:" + this.expanded);
                },
                "expand": function() {
//                    apex.debug.log("conditions for expand:" + !this.expanded  + " " + this.shouldShow());
                },
                "shouldShow": screenIsSmall,
                "notify": function() {
                }
            };

            var  NAV_CONTROL_BUTTON      = "#t_Button_treeNavControl";
            if ( $( "#t_Button_navControl" ).length > 0 ) {
                if ($(".t-Header-nav-list.a-MenuBar").length <= 0) {
                    NAV_CONTROL_BUTTON = "#t_Button_navControl";
                }
            }
            var treeShouldBeHidden = function() {
                return Modernizr.mq('only screen and (max-width: 480px)');
            };
            var treeIsHidden = function() {
                return treeNav$.css("visibility") === "hidden";
            };
            var showTree = function() {
                treeNav$.css("visibility", "inherit").attr(A_HIDDEN, "false");
            };
            var treeIsHiding = false;
            var handleTreeVisibility = function() {
                var screenIsTooSmallForTheTree = treeShouldBeHidden();
                if (screenIsTooSmallForTheTree  && !treeIsHidden() && !treeIsHiding ) {
                    treeIsHiding = true;
                    setTimeout(function() {
                        treeIsHiding = false;
                        if ( !toggleWidgets[TREE_NAV_WIDGET_KEY].isExpanded() ) {
                            treeNav$.css("visibility", "hidden").attr( A_HIDDEN , "true");
                        }
                    }, 400);
                } else if ( !screenIsTooSmallForTheTree ) {
                    showTree();
                }
            };
            var hasTree = buildToggleWidget({
                key: TREE_NAV_WIDGET_KEY,
                checkForElement: TREE_NAV,
                buttonId: NAV_CONTROL_BUTTON,
                defaultExpandedPreference: true,
                onClick: function() {
                    if (Modernizr.mq('only screen and (max-width: 992px)') &&
                        RIGHT_WIDGET_KEY in toggleWidgets &&
                        toggleWidgets[RIGHT_WIDGET_KEY].isExpanded()) {
                        toggleWidgets[RIGHT_WIDGET_KEY].toggle();
                    }
                },
                onExpand: function() {
                    if (Modernizr.mq('only screen and (max-width: 992px)')) {
                        collapseWidget(RIGHT_WIDGET_KEY);
                    }
                    treeNav$.treeView("expand", treeNav$.treeView("getSelection"));
                    showTree();
                    theme42resize();
                },
                onCollapse: function() {
                    treeNav$.treeView("collapseAll");
                    theme42resize();
                    handleTreeVisibility();
                },
                onResize: function() {
                    var usingTreeNav = pageBody$.hasClass('t-PageBody--leftNav');
                    if (usingTreeNav) {
                        if (Modernizr.mq('only screen and (max-width: 992px)')) {
                            this.collapse();
                        } else {
                            if (this.doesUserPreferExpanded()) {
                                this.expand();
                            }
                        }
                    }
                    handleTreeVisibility();
                    resetHeaderOffset();
                    resetActionsColumn();
                },
                onInitialize: function() {
                    this.expand();
                    if (Modernizr.mq('only screen and (min-width: 480px)')) {
                        if (this.doesUserPreferExpanded()) {
                            this.expand();
                        } else {
                            this.collapse();
                        }
                    } else {
                        //Always stay collapsed with the starting width of the screen is less than 480px!
                        this.collapse();
                    }
                }
            });

            // If the tree widget does not exist, the page MUST be using a MENU_NAV_WIDGET_KEY.
            if (!hasTree) {
                var lastScrollTop = 0;
                var core;
                var recal = function() {
                    $( ".js-stickyWidget-toggle" ).stickyWidget( "redoTop" );
                };
                core = ToggleCore({
                    content: pageBody$,
                    contentClassExpanded: "js-HeaderExpanded",
                    contentClassCollapsed: "js-HeaderContracted",
                    useSessionStorage: false,
                    defaultExpandedPreference: true,
                    onCollapse: recal,
                    onExpand: recal
                });
                core.initialize();
                $( window ).scroll(function() {
                    var scrollTop = $( this ).scrollTop();
                    if (lastScrollTop > scrollTop || scrollTop < 100) {
                        core.expand();
                    } else {
                        core.collapse();
                    }
                    lastScrollTop = scrollTop;
                });
                $( document.body ).addClass( 't-PageBody--topNav' );
                $( window).on("apexwindowresized", resetHeaderOffset)
            } else {
                initializeTree();
                treeNav$.on("treeviewexpansionstatechange", function(jqueryEvent, treeViewEvent) {
                    if (treeViewEvent.expanded) {
                        toggleWidgets[TREE_NAV_WIDGET_KEY].expand();
                    }
                });
            }
            var rightShouldBeOpenOnStart = Modernizr.mq('only screen and (min-width: 992px)');
            var actionsContent$ = $( ".t-Body-actionsContent" );
            buildToggleWidget({
                key: RIGHT_WIDGET_KEY,
                checkForElement: ".t-Body-actionsContent",
                buttonId: RIGHT_CONTROL_BUTTON,
                defaultExpandedPreference: rightShouldBeOpenOnStart,
                onClick: function() {
                    if (Modernizr.mq('only screen and (max-width: 992px)') &&
                        TREE_NAV_WIDGET_KEY in toggleWidgets &&
                         toggleWidgets[TREE_NAV_WIDGET_KEY].isExpanded()) {
                        toggleWidgets[TREE_NAV_WIDGET_KEY].toggle();
                    }

                },
                onExpand: function() {
                    if (Modernizr.mq('only screen and (max-width: 992px)')) {
                        if (pageBody$.hasClass('js-navExpanded')) {
                            collapseWidget(TREE_NAV_WIDGET_KEY);
                        }
                    }
                    actionsContent$.css("visibility", "inherit").attr(A_HIDDEN, "false");
                    theme42resize();
                },
                onCollapse: function() {
                    theme42resize();
                    actionsContent$.attr(A_HIDDEN, "true");
                    setTimeout( function() {
                        if ( !toggleWidgets[RIGHT_WIDGET_KEY].isExpanded() ) {
                            actionsContent$.css("visibility", "hidden");
                        }
                    }, 400);
                },
                onResize: function() {
//                    if (Modernizr.mq('only screen and (min-width: 992px)')) {
                    if (this.doesUserPreferExpanded() && !Modernizr.mq('only screen and (max-width: 640px)')) {
                        this.expand();
                    } else {
                        this.collapse();
                    }
                },
                onInitialize: function() {
                    if (TREE_NAV_WIDGET_KEY in toggleWidgets &&
                        toggleWidgets[TREE_NAV_WIDGET_KEY].isExpanded() &&
                        Modernizr.mq('only screen and (max-width: 992px)')) {
                       this.forceCollapse();
                    } else {
                        if (this.doesUserPreferExpanded()) {
                            this.forceExpand();
                        } else {
                            this.forceCollapse();
                        }
                    }
                }
            });
            if (pageBody$.hasClass('t-PageBody--topNav') && Modernizr.mq('only screen and (max-width: 640px)')) {
                pageBody$.addClass('js-menuNavCollapsed');
            }
            resetActionsColumn();
            for (var key in toggleWidgets) {
                toggleWidgets[key].initialize();
            };
            setTimeout(function() {
                resetHeaderOffset();
            }, 15);
        };

        return {
            "initialize": initialize,
            "expandWidget": expandWidget,
            "collapseWidget": collapseWidget,
            "setPreference": function (key, value) {
                if (key in toggleWidgets){
                    toggleWidgets[key].setUserPreference(value);
                }
            },
            "isExpanded": function (key) {
                if (key in toggleWidgets) {
                    return toggleWidgets[key].isExpanded();
                }
            }
        }
    }();

    var initToggleWidgets = theme42.initializeToggleWidgets = toggleWidgetManager.initialize;

    var bindTapToClick = function() {
        setTimeout(function() {
            if (Modernizr.touch) {
                $("a, button").each(function() {
                    var el$ = $(this);
                    // Apply the "fast click" approach if any of the three conditions are met.
                    // - Hammer JS library exists.
                    // - The given element is NOT inside of a treeView widget.
                    // - The given element is NOT inside of a menuBar widget.
                    if (!Hammer || el$.parents(".a-TreeView").length > 0 || el$.parents(".a-MenuBar").length > 0)  {
                        //TODO: Develop a better check for whether or not to use fastClick here.
                        return;
                    }
                    var hammertime = new Hammer(this);
                    var hammerMe = this;
                    var lastTime = 0;
                    hammertime.on('tap', function (ev) {
                        lastTime = Date.now();
                        if (hammerMe.tagName.toLowerCase() !== "a" || hammerMe.href.indexOf("#") !== -1) {
                            ev.preventDefault();
                            $(hammerMe).click();
                        }
                    });
                });
            }
       }, 500);
    };

    var appendGoBackToTop = function() {
        var resize = function() {
            var windowHeight = $(window).outerHeight();
            var bodyHeight = bodyContent$.outerHeight();
            if (bodyHeight > windowHeight + 100) {
                backToTop$.css("display", "block");
            } else {
                backToTop$.css("display", "none");
            }
        };
        var backToTop$ = $("<a href='#' class='t-Body-topButton'><span class=' a-Icon icon-up-chevron'></span></a>");
        bodyContent$.append(backToTop$);
        backToTop$.click(function() {
            $("html,body").animate({scrollTop: 0}, 500);
            return false;
        });
        resize();
        $(window).on("apexwindowresized", resize);
    };


    var initAlert = function () {
        var closeAlert$ =  $( ".t-Alert .t-Button--closeAlert" );
        var parent$ = closeAlert$.closest( ".t-Alert" );
        parent$.addClass( "is-visible" );
        var closeClick;
        if (parent$.hasClass( "t-Alert--success" ) && Modernizr.mq( "only screen and (min-width: 769px)" )) {
            var close = function (e) {
                apex.debug.log(e);
                $( document ).off("focusin", close).off("click", close);
                $( window ).off("scroll", close).off("mousemove", close);
                clearTimeout(closeClick);
                closeClick = setTimeout(function () {
                    var time = 5000;
                    if ( !parent$.hasClass( "is-fading" ) ) {
//                        parent$.addClass( "is-fading" );
                    } else {
                        time = 0;
                    }
                    closeClick = setTimeout(function () {
//                        closeAlert$.click();
                    }, time);
                }, 3000);
            };
            var reset = function () {
                // parent$.removeClass("is-fading");
                clearTimeout( closeClick );
            };

            $( window ).mousemove(close).on("scroll", close);
            $( document ).on("focusin", close).on("click", close);
            parent$.hover(function () {
                reset();
            }, function () {
                close();
            });
        }

        closeAlert$.click(function() {
            clearTimeout(closeClick);
            parent$.removeClass("is-fading");
            parent$.addClass( "is-hidden").removeClass( "is-visible" );
            closeAlert$.addClass("is-disabled").attr( "disabled", true );
            theme42resize();
        });
    };

    var initHideShowRegions = function() {
        $( SEL_HS_REGION ).each( function() {
            var collapsible$ = $(this);
            if (!collapsible$.hasClass("is-expanded") && !collapsible$.hasClass("is-collapsed")) {
                collapsible$.addClass("is-expanded");
            }
            collapsible$.collapsible({
                content: $( this ).find( ".t-Region-body" ).first(),
                collapsed: collapsible$.hasClass("is-collapsed")
            });
        });
    };

    var initApexDebug = function() {
        apex.jQuery(document)
            .on("apex-devbar-grid-debug-on", function(){
                apex.jQuery("body").addClass("grid-debug-on");
            })
            .on("apex-devbar-grid-debug-off", function(){
                apex.jQuery("body").removeClass("grid-debug-on");
            });
    };


    var initResizeDialog = function() {
        // Handle resizing of dialogs
        function resizeDialog( dialog$ ) {
            var footerheight = dialog$.find( ".t-DialogRegion-buttons" ).height();
            dialog$.find(".t-DialogRegion-body").css( "bottom",  footerheight );
        }

        $( document.body )
            .on( "dialogopen dialogresizestop", ".t-DialogRegion", function() {
                resizeDialog($(this));
            });
    };

    var initializeStickiedRegionDisplaySelectors = function() {
        // RDS is in t-Body-info (typically master detail)
        if (rds$.length > 0) {
            rds$.stickyWidget(
                {
                    toggleWidth: true,
                    top: function () {
                        return getFixedHeight() - rds$.outerHeight();
                    }
                }
            );
        } else {
//            rds$ = $( ".t-Body-title .apex-rds-container" );
//            // Check if RDS is in t-Body-title
//            if (rds$.length > 0) {
//                rds$.stickyWidget(
//                    {
//                        toggleWidth: true,
//                        top: function () {
//                            if (Modernizr.mq('only screen and (min-width: 641px)')) {
//                                return getFixedHeight() - tbodyTitle$.outerHeight() - rds$.outerHeight();
//                            } else {
//                                return getFixedHeight() - tbodyTitle$.outerHeight();
//                            }
//                        }
//                    }
//                );
//            }
        }
    };

    var applyJqueryUiFocusableFix = function () {
        var focusable = function(element, isTabIndexNotNaN) {
            var nodeName = element.nodeName.toLowerCase();
            return ( /^(input|select|textarea|button|object)$/.test( nodeName ) ?
                !element.disabled :
                    "a" === nodeName ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN) && $.expr.filters.visible( element );
        };
        jQuery.extend(jQuery.expr[':'], {
            // jQuery UI core focusable and tabbable are broken. They return false on elements that have a parent which has
            // a "visibility: hidden" style applied on it. This is not true in any of the browsers we support:
            // a child element that has a "visibility: visible" style will still be shown even if one of its parents
            // has a "visibility: hidden" style.
            focusable: focusable,
            tabbable: function( element ) {
                var tabIndex = $.attr( element, "tabindex" ), isTabIndexNaN = isNaN( tabIndex );
                return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
            }
        });
    };

    var initMaximizeButtons = function() {
        var maximizeKey = 0;
        var current;
        var maximizableRegions$ =  $( ".js-showMaximizeButton" );
        var hideAllExceptChildren = function( content$ ) {
            maximizableRegions$.css( "visibility", "hidden" );
            content$
                .css( "visibility", "visible" )
                .find (".js-showMaximizeButton" )
                .css( "visibility" , "visible" );
        };
        var makeCurrent = function( core, content$, top ) {
            var buildCurrent = function() {
                var tabbable$ = content$.find(":tabbable");
                return {
                    "core": core,
                    "content$": content$,
                    "top": top,
                    "first": tabbable$.first()[0],
                    "last": tabbable$.last()[0]
                };
            };
            if ( !current ) {
                current = buildCurrent();
                pageBody$.addClass( "js-regionIsMaximized" );
            } else {
                var old = current;
                current.next = buildCurrent();
                current = current.next;
                current.previous = old;
            }
            apex.theme.defaultStickyTop = top;
            hideAllExceptChildren( current.content$ );
        };
        if ( maximizableRegions$.length > 0) {
            applyJqueryUiFocusableFix();
        }
        maximizableRegions$.each(function() {
            var content$ = $(this);
            var isIRR = content$.hasClass( "t-IRR-region" );
            var fthOnResize;
            var injectButtonSelector = ".js-maximizeButtonContainer";
            if (isIRR) {
                injectButtonSelector = ".a-IRR-buttons";
                if ( content$.find( injectButtonSelector ).length <= 0 ) {
                    content$.find( ".a-IRR-toolbar" ).append( "<div class='a-IRR-buttons'></div>" );
                }
            }
            var maximize$ = content$.find( injectButtonSelector ).first();
            var regionId = content$.attr( "id" );
            var maximizeButton$ =
                $('<button ' +
                    'class="t-Button t-Button--noLabel t-Button--icon t-Button--iconOnly t-Button--noUI" ' +
                    'aria-expanded="false"' +
                    'aria-controls="' + regionId + '" type="button">' +
                    '<span class="t-Icon a-Icon" aria-hidden="true"></span>' +
                  '</button>');
            maximize$.append( maximizeButton$ );

            var switchToPrevious = function() {
                if (current) {
                    if ( current.previous ) {
                        current.previous.next = null;
                        content$
                            .find(".js-stickyWidget-toggle")
                            .stickyWidget("forceScrollParent", content$.parents(".t-Region-bodyWrap").first())
                        hideAllExceptChildren( current.previous.content$ );
                        apex.theme.defaultStickyTop = current.previous.top;
                    } else {
                        apex.theme.defaultStickyTop = getFixedHeight;
                        $(".js-stickyWidget-toggle").stickyWidget( "forceScrollParent" , null);
                        pageBody$.removeClass( "js-regionIsMaximized" );
                        maximizableRegions$.css("visibility", "visible");
                    }
                    $( window ).trigger( "apexwindowresized" );
                    current = current.previous;
                }
            };
            var getCollapsible = function() {
                return content$.find( ".a-IRR-controlsContainer.a-Collapsible").first();
            };
            var resetIRRHeight = function( fthBody$ ) {
                content$.css("overflow", "auto");
                fthBody$.css("height", "auto");
            };
            var fthOnResizeDebouncer;
            var forceIRRHeight = function() {
                fthOnResize = function() {
                   clearTimeout(fthOnResizeDebouncer); // Need to debounce this b
                    setTimeout(function() {
                        var fthBody$ = content$.find( ".t-fht-tbody" ); // Only used when fixed table headers is active on an IRR!!!
                        if (fthBody$.length > 0) {
                            var head$ = content$.find(".t-fht-thead");
                            var pagWrap$ = content$.find(".a-IRR-paginationWrap");
                            var irrToolBar$ = content$.find(".a-IRR-toolbar");
                            var controlsContainer$ = content$.find(".a-IRR-controlsContainer");
                            if (Modernizr.mq('only screen and (min-width: 769px)')) {
                                var height = $(window).height();
                                fthBody$.css("height", height - irrToolBar$.outerHeight() - controlsContainer$.outerHeight() - pagWrap$.outerHeight() - head$.outerHeight() - 2);
                            } else {
                                resetIRRHeight(fthBody$);
                            }
                        }
                    }, 200);
                };
                getCollapsible().on( "collapsibleexpand", fthOnResize ).on( "collapsiblecollapse", fthOnResize );
                $( window ).on( "apexwindowresized", fthOnResize );
            };
            var disableForcedIrrHeight = function() {
                if (current && isIRR && content$) {
                    resetIRRHeight( content$.find(".t-fht-tbody") );
                    $( window ).off("apexwindowresized", fthOnResize);
                    getCollapsible().off( "collapsibleexpand", fthOnResize ).off( "collapsiblecollapse", fthOnResize );
                }
            };
            var forceResize = function() {
                $( window ).trigger("apexwindowresized")
                            .trigger("resize"); // For plugins that are not hooked into the apexwindowresized debouncer.
            };
            var header$ = content$.find(".t-Region-header");
            var maximizeCore = ToggleCore({
                key: "maximize_" + ++maximizeKey,
                content: content$,
                contentClassExpanded: "is-maximized",
                useSessionStorage: false,
                defaultExpandedPreference: false,
                controllingElement: maximizeButton$,
                onExpand: function() {
                    apex.navigation.beginFreezeScroll();
                    maximizeButton$
                        .attr("title", apex.lang.getMessage("RESTORE"))
                        .attr("aria-label", apex.lang.getMessage("RESTORE"))
                        .attr("aria-expanded", true)
                        .find(".t-Icon").removeClass("icon-maximize").addClass("icon-restore");
                    var top = function() {
                        var height = header$.outerHeight();
                        if ( !height ) {
                            return 0;
                        }
                        return height;
                    };
                    var scrollParent$;
                    if ( isIRR ) {
                        scrollParent$ = content$;
                        forceIRRHeight();
                        content$.find(".container").first().hide();
                    } else {
                        scrollParent$ = content$.find(".t-Region-bodyWrap").first();
                    }
                    content$
                        .find(".js-stickyWidget-toggle")
                        .stickyWidget("forceScrollParent", scrollParent$);
                    forceResize();
                    makeCurrent( maximizeCore, content$, top );
                },
                onCollapse: function() {
                    // This presumes that any collapse is always the active one!
                    // We can get away with this because the maximized regions are structured to overlay on top of each other
                    // completely.
                    apex.navigation.endFreezeScroll();
                    maximizeButton$
                        .attr("title", apex.lang.getMessage("MAXIMIZE"))
                        .attr("aria-label", apex.lang.getMessage("MAXIMIZE"))
                        .attr("aria-expanded", false)
                        .find(".t-Icon").addClass("icon-maximize").removeClass("icon-restore");
                    disableForcedIrrHeight();
                    if ( isIRR ) {
                        content$.find(".container").first().show();
                    }
                    forceResize();
                    switchToPrevious();

                }
            });
            maximizeCore.initialize();
        });
        $( document ).on("keydown", function(event) {
            if ( current) {
                if ( event.which === $.ui.keyCode.ESCAPE ) {
                    current.core.collapse();
                    event.preventDefault();
                    return false;
                } else if ( event.which === $.ui.keyCode.TAB ) {
                    if ( event.shiftKey && event.target === current.first ) {
                        event.preventDefault();
                        current.first.focus();
                    } else if ( !event.shiftKey ) {
                        if (current.last === event.target) {
                            event.preventDefault();
                            current.last.focus();
                        }
                    }
                }
            }
        });
    };

    window.openModal = function(pDialogId, pDialogTriggerId, pSetFocusId, pClear ) {
        $("#" + pDialogId).dialog("open");
    };


    window.closeModal = function closeModal() {
        $(".ui-dialog-content").dialog("close");
    };



    $( document ).ready( function() {
        pageBody$       = $( PAGE_BODY );
        mainBody$       = $( ".t-Body-main" );
        header$         = $( HEADER );
        sideCol$        = $( SIDE_COL );
        bodyContent$    = $( BODY_CONTENT );
        actionsCol$     = $( ACTIONS_COL );
        if ( $( "body" ).hasClass("t-PageBody--noNav" ) ) {
            $( "body").removeClass("apex-side-nav");
//            $( ".t-Button--header").hide();
        }

        apex.jQuery(".t-NavigationBar-menu", apex.gPageContext$).menu();
        actionsCol$.show();
        resetHeaderOffset();
        setTimeout(function() {
            $( window ).trigger("theme42ready");
            $( 'body' ).removeClass( 'no-anim' );
            resetHeaderOffset();
            appendGoBackToTop();
            initAlert();
            $(".a-MenuBar").menu("resize");
            initializeTabsRegion();
            initializeStickiedRegionDisplaySelectors();
        }, 50);
        bindTapToClick();
        initHideShowRegions();
        initApexDebug();
        initResizeDialog();
        scrollTitleHandler();
        initMaximizeButtons();
        apex.theme.initResponsiveDialogs();
        initToggleWidgets();
    });

})( apex.theme42, apex.jQuery);

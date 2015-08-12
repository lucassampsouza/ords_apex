
 /*!
    Copyright (c) 2014, Oracle and/or its affiliates. All rights reserved.
 */
 /*global apex, window, clearTimeout, setTimeout*/
 (function(){
     var NO_CYCLE = -1;
     var TAB_CONTENTS    = '#TAB_CONTENTS#';
     var TAB_CONTENT     = '#TAB_CONTENT#';
     var TAB_LABEL       = '#TAB_LABEL#';
     var TAB_ID          = '#TAB_ID#';
     var TABS            = '#TABS#';
     var CAROUSEL_ID     = '#CAROUSEL_ID#';
     var TAB_CONTENT_TEMPLATE =
         '<div class="a-Region-carouselItem" id="CR_' + TAB_ID + '" role="tabpanel" aria-hidden="false">' +
             TAB_CONTENT +
         '</div>';
     var TAB_TEMPLATE =
         '<li class="a-Region-carouselNavItem" aria-controls="CR_' + TAB_ID + '" role="tab">' +
         '<a href="#CR_' + TAB_ID + '" class="a-Region-carouselLink" tabindex="-1">' +
         '<span class="a-Region-carouselLabel">' + TAB_LABEL + '</span>' +
         '</a>' +
         '</li>';

     /**
      * Simple template function.
      * @param TEMPLATE, a predefined template string
      * @param toReplace, an object literal of keys to replace with values.
      * @returns {*}, the formatted template with all substitins replaced if they exist in the string or removed if they don't.
      */
     var tpl = function (TEMPLATE, toReplace) {
         if (toReplace) {
             for (var key in toReplace) {
                 TEMPLATE = TEMPLATE.split("#" + key + "#").join(toReplace[key]);
             }
         }
         return TEMPLATE.replace(/#[^\s]+#/g, "");
     };

     jQuery.fn.carousel = function(options) {
         options = jQuery.extend({},
             {
                 onRegionChange: function () {},
                 time: NO_CYCLE,// Set a time for how long it should stay on one region. If no time is supplied, there will be no cycling.

                 data: null,    // You can either initialize a carousel with data or HTML
                                // Data requires an array of object literals that are supplied like so:
                                //      {
                                //          "id": "id of the element (will be prefixed by CR_",
                                //          "label": "html or text that the tab show",
                                //          "content": "html of the tab content",
                                //      }
                                // Example Usage:
                                //      [
                                //      { "id": "meow",
                                //          "label": "Hong",
                                //          "content": "<b>HELLO WORLD</b>"},
                                //      {   "id": "meow1",
                                //          "label": "Kong",
                                //          "content": "<em>Shak</em>"}
                                //      ]
                                //

                 html: null,    // HTML requires a parent container that already has div elements precreated.
                                // It can either be an array of ids or DOM Elements (anywhere on the page), or a single element.
                                // If it is not an array, then CarouselWidget will assume that the children of the element
                                // supplied are the carousel/tabs.

                 hidePrevious: false,  // True, if you want to use jQuery Hide/Show for old carousel content.

                 containerBodySelect: null // The selector within the carousel region which should be used as the body.
             },
             options
         );
         this.each(function() {
             var carouselContainer$ = $(this); // BUG FIXES
             var HTML_TEMPLATE =
                 '<div class="a-Region-carouselItems">' + TAB_CONTENTS + '</div>' +
                 '<div class="a-Region-carouselControl">' +
                 '<ul class="a-Region-carouselNav" role="tablist" id="' + CAROUSEL_ID +  '_RDS">' +
                 TABS +
                 '</ul>' +
                 '</div>';
             HTML_TEMPLATE = tpl(HTML_TEMPLATE, {CAROUSEL_ID: carouselContainer$.attr("id")});
             var body$ = options.containerBodySelect == null
                 ? carouselContainer$ : carouselContainer$.find(options.containerBodySelect).first();
             if (options.data) {
                 (function () {
                     var tabs = "";
                     var tabContents = "";
                     for (var i = 0, size = options.data.length; i < size; i++) {
                         var item = options.data[i];
                         tabContents += tpl(TAB_CONTENT_TEMPLATE, {TAB_ID: item.id, TAB_CONTENT: item["content"]});
                         tabs += tpl(TAB_TEMPLATE, {TAB_ID: item.id, TAB_LABEL: item.label});
                     }
                     body$.html(tpl(HTML_TEMPLATE, {TAB_CONTENTS: tabContents, TABS: tabs}));
                 })();
             } else if (options.html) {
                 (function () {
                     var children$ = body$.children();
                     body$.append(tpl(HTML_TEMPLATE));
                     var items = carouselContainer$.find(".a-Region-carouselItems").last();
                     var nav = carouselContainer$.find(".a-Region-carouselNav").last();
                     var buildTab = function (element) {
                         var id = element.attr("id");
                         var tabContent$ = $(tpl(TAB_CONTENT_TEMPLATE, {TAB_ID: id}));
                         var tab$ = $(tpl(TAB_TEMPLATE, {TAB_ID: id, TAB_LABEL: element.attr("data-label")}));
                         tabContent$.append(element);
                         nav.append(tab$);
                         items.append(tabContent$);
                     };
                     if (!(options.html instanceof Array)) {
                         children$.each(function () {
                             buildTab($(this))
                         });
                     } else {
                         for (var n = 0, size = options.html.length; n < size; n++) {
                             var element = $(options.html[n]);
                             buildTab(element);
                         }
                     }
                 })();
             }
             var useLocalStorage = carouselContainer$.hasClass("js-useLocalStorage");

             var id = carouselContainer$.find(".a-Region-carouselNav").last().attr("id").replace("_RDS", ""); //TODO: Get rid of the Suffix requirement for RDS. It's starting to get ugly.
             var items$ = carouselContainer$.find(".a-Region-carouselItems").last();
             var height = 0;
             var hidden$ = false;
//             if (items$.is(":hidden")) {
//                hidden$ = items$.parents(":hidden:first").css("display", "block")
//             }
             items$.find("> .a-Region-carouselItem").each(function () {
                 var regionheight = $(this).outerHeight();
                 if (regionheight > height) {
                     height = regionheight;
                 }
             });
//             if (hidden$) {
//                 hidden$.css("display", "none");
//             }
             var altHeight = parseInt(items$.parent().css("min-height").replace(/[^-\d\.]/g, ''));
             if (height <= 0) height = altHeight;
             items$.parent().css("min-height", height);
             var time = options.time;
             if (time == NO_CYCLE) {
                 var myRe = /js-cycle([0-9]+)s/;
                 var match = carouselContainer$[0].className.match(myRe);
                 if (match != null && match.length > 0) {
                     time = match[1] * 1000;
                 }
             }
             var cycleTimeout;
             var autoCycle = function () {
                 clearTimeout(cycleTimeout);
                 if (time == NO_CYCLE) return;
                 cycleTimeout = setTimeout(function () {
                     var activeTab = carousel.getActiveTab();
                     carousel.moveNext(activeTab, {doNotFocus: true});
                 }, time);
             };
             // So that when onRegionChange is called before the regionDisplaySelector is finished initializing, carousel is not undefined.
             if ( !apex.widget.regionDisplaySelector ) return;
             var carousel = apex.widget.regionDisplaySelector(id,
                 {
                     mode: "standard",
                     useSlider: false,
                     useLocationHash: false,
                     useSessionStorage: useLocalStorage, //TODO: Consider passing in useLocalStorage as an optoin.
                     addMoveNextPrevious: true,
                     onRegionChange: function( mode , activeTab ) {
                         autoCycle();
                         options.onRegionChange( mode, activeTab );
                     },
                     hidePreviousTab: options.hidePrevious
                 }
             );
             $("#" + id + "_RDS").data("showAllScrollOffset", function () { return false}); //Hacky,  figure out a better way to do this.
             autoCycle();

         });
     }
 })();


/**
 * WIP Plugin to allow any table of your choosing to have a fixed table header
 * (which can then combined with sticky widget )
 *
 * TODO: Consider changing this into a proper jquery UI plugin.
 */
/*global apex, window, document */
(function(){
    var NO_MAX = -1;
    var appendedStylesToDocument = false;




    $.fn.setTableHeadersAsFixed = function( options ){
        // IE test borrowed from codemirror
        var IE_UP_TO_10 = /MSIE \d/.test(navigator.userAgent);
        var IE_11_AND_UP = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
        var IS_IE = IE_UP_TO_10 || IE_11_AND_UP;

        if ( !appendedStylesToDocument ) { //TODO: Remove this and place it in APP_UI.
             $("head").append('<style type="text/css">' +
                 '.t-fht-cell { height: 1px; overflow: hidden; } ' +
                 '.t-fht-wrapper { width: 100%; overflow: hidden; position: relative; } ' +
                 '.t-fht-thead { overflow: hidden; position: relative; } ' +
                 '.t-fht-tbody { overflow: auto; } ' +
                 '</style>');
            appendedStylesToDocument = true;
        }

        //IE7 and IE8 does not have window.getComputedStyle so widget adds this function to the page as a workaround.
        if ( !window.getComputedStyle ) {
            window.getComputedStyle = function(el, pseudo) {
                this.el = el;
                this.getPropertyValue = function(prop) {
                    var re = /(\-([a-z]){1})/g;
                    if (prop == 'float') prop = 'styleFloat';
                    if (re.test(prop)) {
                        prop = prop.replace(re, function () {
                            return arguments[2].toUpperCase();
                        });
                    }
                    return el.currentStyle[prop] ? el.currentStyle[prop] : null;
                }
                return this;
            }
        }

        var tables$ = this;
        if  ( !tables$.is( "table" ) ) {
             tables$ = this.find( "table" );
        }
        if ( tables$.length > 0 ) {
            options = $.extend( {},
                {
                    maxHeight: NO_MAX   // The default option is no_max height;
                                        // i.e. just seperate the headers from the table.
                },
                options
            );
            var getComputedStylePropertyValue = function( element, propertyName ){
                var result = undefined;
                if(element.length >= 1) {
                    result = window.getComputedStyle( element.get( 0 ) ).getPropertyValue( propertyName );
                }
                return result;
            };
            // To figure out how wide a scroll bar is, we need to create a fake element and then measure the difference
            // between its offset width and the clientwidth.
            var scrollbarMeasure = $( document.createElement( "div" ) ).css({
                "width": "100px",
                "height": "100px",
                "overflow": "scroll",
                "position": "absolute",
                "top": "-9999px"
            }).appendTo("body");

            var scrollbarWidth = scrollbarMeasure.get( 0 ).offsetWidth - scrollbarMeasure.get( 0 ).clientWidth;
            scrollbarMeasure.remove();
            tables$.each(function( index, Element ){
                //Each table needs to store these variables in their own closure.
                // They should not be brought outside this loop!
                var originalTable$;
                var originalTableHead$;
                var originalTableHeadHeight;

                var fixedHeadersTable$;
                var fixedHeadersTableHead$;
                var fixedHeadersTableHeadLastElement$;
                var fixedHeadersTableBody$;
                var fixedHeadersTableBodyNeedsScrolling;
                var fixedHeadersTableHeadId = 0;
                fixedHeadersTableHeadId++;
                originalTable$ = $( Element );
                //Do not redor the stickyTableHeader on a table that is already wrapped!
//                if ( originalTable$.parent().hasClass("t-fht-tbody") || originalTable$.parent().hasClass("t-fht-thead") ) {
//                    return;
//                }
                var maxHeight = options.maxHeight;
                if (maxHeight == NO_MAX) {
                    if ( originalTable$.hasClass( "mxh480" ) ) {
                        maxHeight = 480;
                    } else if ( originalTable$.hasClass( "mxh320" ) ) {
                        maxHeight = 320;
                    } else if ( originalTable$.hasClass( "mxh480" ) ) {
                        maxHeight = 640;
                    }
                }
                originalTableHead$ = originalTable$.find( "tr" ).first();
                originalTableHead$.find( "th" ).each(function(){
                    var jqueryElement$ = $(this);
                    //var width = jqueryElement$.width();
                    jqueryElement$.append($(document.createElement( "div" )).addClass( "t-fht-cell" ));
                });
                var computedOriginalTableHeadHeight = parseInt( getComputedStylePropertyValue(originalTableHead$, "height") );
                if ( !computedOriginalTableHeadHeight ) {
                    // IE 7 and IE 8 will supply a non-integer when calling computedStylePropertyValue.
                    // In this case, the jquery defined height will work just as well.
                    computedOriginalTableHeadHeight = originalTableHead$.height();
                }
                //TODO: Refactor this block code to be more intelligible.
                var border = getComputedStylePropertyValue( originalTable$, "border-collapse" ) === "collapse" ? 1 : 0;
                originalTableHeadHeight = computedOriginalTableHeadHeight + border;
                fixedHeadersTableBodyNeedsScrolling = maxHeight !== NO_MAX && originalTable$.height() - originalTableHeadHeight > maxHeight;

                fixedHeadersTable$ = $( document.createElement("div") ).addClass("t-fht-wrapper");
                fixedHeadersTableHead$ = $( document.createElement("div") ).addClass("t-fht-thead");
                fixedHeadersTableHead$.attr("id", "stickyTableHeader_" + ++fixedHeadersTableHeadId);
                fixedHeadersTableHead$.addClass( "js-stickyTableHeader" );
                fixedHeadersTableBody$ = originalTable$.wrap( $( document.createElement( "div" ) ).addClass( "t-fht-tbody" )) .parent();

                fixedHeadersTableHead$.append(originalTable$.clone().empty().append( originalTableHead$.clone( true ) ).attr( "role", "presentation" ));
                fixedHeadersTableHeadLastElement$ = fixedHeadersTableHead$.find( "table th:last-child" ).first();

                fixedHeadersTableBody$.before( fixedHeadersTableHead$ );

                fixedHeadersTable$ = fixedHeadersTableHead$.add( fixedHeadersTableBody$ ).wrapAll( fixedHeadersTable$ ).parent();

                if(fixedHeadersTableBodyNeedsScrolling){
                    var th = $(document.createElement( "th" ));
                    fixedHeadersTableHeadLastElement$.after(th);
                    th.css({
                        "width":scrollbarWidth,
                        "min-width":scrollbarWidth,
                        "max-width":scrollbarWidth,
                        "margin":"0px",
                        "padding":"0px"
                    });
                    fixedHeadersTableBody$.height(maxHeight);
                }
                //When either the fixed table body or the fixed table headers
                fixedHeadersTableBody$.scroll(function(){
                    fixedHeadersTableHead$.find( "table" ).css("margin-left", -this.scrollLeft);
                });
                fixedHeadersTableHead$.scroll(function(){
                    fixedHeadersTableBody$.find( "table" ).css("margin-left", -this.scrollLeft);//TODO: Figure out how to handle nested scroll bars
                });
                var fixedColumns$ = fixedHeadersTableHead$.find( "tr" ).first().find( "th" );
                var firstRow$ = originalTable$.find( "tr" ).first();
                var originalColumns$ = firstRow$.find( "td" );
                if (originalColumns$.length < 1) originalColumns$ = firstRow$.find( "th" );
                // For accessibility purposes, set the original column headers to have a visibility of hidden.
                originalColumns$.each(function() {
                    $( this ).removeAttr( "id").css("visibility", "hidden");
                });
                // Whenever there is a resize event such that the table dimensions change, the table headers
                // that were fixed, need to be synchronized with the table they originally belonged to.
                var resize = function () {
                    originalColumns$.each(function ( i ) {
                        var originalColumn$ = $( this );
                        var width = originalColumn$.width();
                        if ( IS_IE ) {
                            if ( (i + 1) % 6 === 0) { // This is a workaround for internet explorer's cryptic way of handling the width of tab elements.
                                                      // It's not strictly speaking "Aligned" but the difference is small enough to be considered negligible.

                                width -= 1;
                            }
                        }
                        var fixedColumn$ = fixedColumns$.eq( i );
                        // TH and TD elements don't respect the width property, so we must use the child div to "force" its parent (the TH or the TD) to be correct.
                        fixedColumn$.find( ".t-fht-cell" ).width( width );
                        i++;
                    });
                    originalTable$.css( "margin-top", -originalTable$.find( "tr" ).first().height());
                };
                $(window).on( "apexwindowresized" , resize);
                fixedHeadersTableHead$.on( "forceresize" , resize);
//                setTimeout(function() {
                    resize();
//                }, 500);

            });
            return this;
        }
    };
})();

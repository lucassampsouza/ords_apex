/*
 * This JQuery Plugin shows a slide and tooltip option for a certain HTML markup
 * 
 * options:
 * {
 *      st: "slide" | "tooltip"
 * 
 * }
 * 
 * Default option: "slide"
 * 
 */
/*global window*/
(function ( $ ) {
    $.fn.slideTooltip = function( options ) {
        var settings = $.extend({
            st: "slide"
        }, options );
        var counts = settings.countArray;
        var list = $( this );

        /*
         * TAB KEY => Select the complete container
         * ENTER KEY => Go to link in current item
         * RIGHT ARROW => Go to next item in the container
         * LEFT ARROW => Go to previous item in the container
         * UP ARROW => Slide back content of current item
         * DOWN ARROW => Slide down content of current item
         *
         */
        var defaultKeyHandler = function (e, activeElement$) {
            if(e.keyCode == 13 && activeElement$.is("li")){ //ENTER
                window.location.href = activeElement$.find(".a-DetailedContentList-header").attr('href');
            }
            if(e.keyCode == 40){ //DOWN ARROW
                e.preventDefault();
                if(activeElement$.is("ul")){
                    activeElement$.children().first().focus();
                }else if(activeElement$.is("li")){
                    if(activeElement$.next().length === 0)
                        activeElement$.parent().children().first().focus();
                    else
                        activeElement$.next().focus();
                }
            }
            if(e.keyCode == 38){ //UP ARROW
                e.preventDefault();
                if(activeElement$.is("ul")){
                    activeElement$.children().last().focus();
                }else if(activeElement$.is("li")){
                    if(activeElement$.prev().length === 0)
                        activeElement$.parent().children().last().focus();
                    else
                        activeElement$.prev().focus();
                }
            }
        };

        var applyKeyBindings = function (otherKeyHandler) {
            list.attr('tabindex', 0).on("keydown", function(e){
                var activeElement = $( document.activeElement );
                defaultKeyHandler(e, activeElement);
                if (otherKeyHandler) otherKeyHandler(e, activeElement);
            });
        };



        if( settings.st == "slide" ){
            //Slide effect on click
            list.addClass("a-DetailedContentList--slide");
            list.find(".a-DetailedContentList-body").hide();
            list.find(".a-DetailedContentList-trigger").click(function(eventObject){
                var contentListItem = $(this).parents(".a-DetailedContentList-item");
                if(contentListItem.find(".a-DetailedContentList-body").css("display") == "none"){
                    contentListItem.addClass("is-expanded");
                    // contentListItem.find(".a-DetailedContentList-trigger").removeClass("fa-caret-down").addClass("fa-caret-up");
                }
                // else {
                //     contentListItem.find(".a-DetailedContentList-trigger").removeClass("fa-caret-up").addClass("fa-caret-down");
                // }

                contentListItem.find(".a-DetailedContentList-body").slideToggle(100, function(){
                    if(contentListItem.find(".a-DetailedContentList-body").css("display") == "none"){
                        contentListItem.removeClass("is-expanded");
                    }
                });
            });
            
            //Slide effect for keyboard navigation
            $(".a-DetailedContentList-item, .a-DetailedContentList-header, .a-DetailedContentList-trigger").attr('tabindex',-1);

            applyKeyBindings(function(e, activeElement) {
                if(e.keyCode == 37){ //LEFT ARROW
                    //.... This is going to need to get refactored.
                    if(activeElement.find(".a-DetailedContentList-body").css("display") == "block"){
                        // activeElement.find(".a-DetailedContentList-trigger").removeClass("fa-caret-up").addClass("fa-caret-down");
                        activeElement.find(".a-DetailedContentList-body").slideUp(100, function(){
                            if(activeElement.find(".a-DetailedContentList-body").css("display") == "none"){
                                activeElement.removeClass("is-expanded");
                            }
                        });
                    }
                }
                if(e.keyCode == 39){ //RIGHT ARROW
                    if( activeElement.is("li" )){
                        if(activeElement.find(".a-DetailedContentList-body").css("display") == "none"){
                            activeElement.addClass("is-expanded");
                            // activeElement.find(".a-DetailedContentList-trigger").removeClass("fa-caret-down").addClass("fa-caret-up");
                            activeElement.find(".a-DetailedContentList-body").slideToggle(100, function(){
                                if(activeElement.find(".a-DetailedContentList-body").css("display") == "none"){
                                    activeElement.removeClass("is-expanded");
                                }
                            });
                        }
                    }
                }
            });
            list.find(".a-DetailedContentList-trigger").on("click", function(e){              
                $( this ).parent().focus();
            });
        }else if( settings.st == "tooltip" ){
            var elementAttachedToTooltip;
            //Make sure that the last element does not have focus and also is moused out (guaranteed to remove the tooltip)
            var clearOutToolTips = function (newElement) {
                if (elementAttachedToTooltip && newElement != elementAttachedToTooltip) {
                    elementAttachedToTooltip.blur();
                    $(elementAttachedToTooltip).mouseout();
                }
                elementAttachedToTooltip = newElement;
            };


            list.addClass("a-DetailedContentList--tooltip");
            list.tooltip({
                show: false,
                hide: false,
                //Items and content take the element from the DOM that is going to be displayed in the tooltip
                items: ".a-DetailedContentList-item" ,
                content: function() {
                  var element = $( this );
                    if( element.is(".a-DetailedContentList-item") ){
                        var itemContent = $(this).find(".a-DetailedContentList-body").clone();
                        itemContent.find(".a-DetailedContentList-body-header").remove();
                        //Returns the content to be displayed in the div
                        return itemContent;
                    }
                },
                //Assign a class to the tooltip
                tooltipClass: "content-tooltip",
                //Catch open and closing events and execute actions when this happens.
                 open: function( event, ui ) {
//                     $(ui.tooltip).hide();

                    var itemWidth = parseInt($(this).css("width"));
                    var percentageOfWidth = .98;
                    var newWidth = itemWidth * percentageOfWidth;
                    
                    /*
                     * Catch element that triggered the tooltip which could be the "a-DetailedContentList-item" or anything inside of it
                     * If the element is one of the elements inside get the parent element
                     */

                     // Need to get the tooltip target; srcElement does not work in Chrome.
                     // Solution borrowed from: http://stackoverflow.com/questions/16138869/get-reference-to-hovered-element-in-jquery-ui-tooltip
                     var widget = $(this).data("ui-tooltip");
                     var el = widget.tooltips[ui.tooltip[0].id][0];
                     var ofElement = el.className == "a-DetailedContentList-item" ? el : el.offsetParent;

                     clearOutToolTips(ofElement);

                    //Get left and right offset values of the list container to the window
                    var leftOffset = $(this).offset().left;
                    var rightOffset = ($(window).width() - (leftOffset + $(this).outerWidth()));
                    
                    /*
                     * Display the tooltip according to the offsets given
                     * If the offset is big enough to contain the tooltip it will contain it 
                     * If none of the offsets can contain the tooltip display it in the center
                     */

                     var appendArrow = function(element, arrowClass) {
                         var outerArrow = $( "<div>" ).addClass( "arrow" ).addClass( arrowClass);
                         var eTop = $(ofElement).offset().top; //get the offset top of the element
                         if (eTop - $(window).scrollTop() + $(element).outerHeight() > $(window).height() + 10) {
                             outerArrow.addClass("bottom");
                         }
                         outerArrow.appendTo(element);
                     };

                    if( leftOffset >= parseInt(ui.tooltip.css("width")) ){
                        ui.tooltip.position({
                            my: "right-12 top-1", 
                            at: "left top",
                            of: ofElement,
                            using: function( position, feedback ) {
                                $( this ).css( position );
                                appendArrow(this, "right");
                            }
                        });
                     }else if( rightOffset >= parseInt(ui.tooltip.css("width")) ){
                        ui.tooltip.position({
                            my: "left+12 top-1", 
                            at: "right top",
                            of: ofElement,
                            using: function( position, feedback ) {
                                $( this ).css( position );
                                appendArrow(this, "left");
                            }
                        });
                    }else{
                        ui.tooltip.position({
                            my: "left top-1", 
                            at: "left bottom",
                            of: ofElement,
                            using: function( position, feedback ) {
                                $( this ).css( position );
                                appendArrow(this, feedback.vertical);
                            }
                        });
//                        var left = ((itemWidth * (1 - percentageOfWidth)) / 2) + parseInt(ui.tooltip.css("left")) + "px";
                        var width = Math.min(newWidth, 350);
                        ui.tooltip.css({
                         "width": width,
                         "max-width": 350,
                         "left": "50%",
                         "margin-left": -width/2
                        });
                        //Check sublist item count array for the element that is being selected to display arrow of certain color
                        if( counts[ui.tooltip.find(".a-DetailedContentList-body").attr( "itemnum" )] % 2 == 0 ) {
                            ui.tooltip.find(".arrow.bottom").addClass("light");
                        }

                    }
                }
            });
            //Slide effect for keyboard navigation
            $(".a-DetailedContentList-item, .a-DetailedContentList-header, .a-DetailedContentList-trigger").attr('tabindex',-1);

            applyKeyBindings();

        }
        return this;
    };
}( jQuery ))

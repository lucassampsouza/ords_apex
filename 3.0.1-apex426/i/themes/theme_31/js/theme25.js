/**
 * @fileOverview
 * The apex.theme25 namespace is used to store all JavaScript functions used by theme 25
 **/

/**
 * @namespace
 **/
apex.theme25 = {};

(function( theme25, $, undefined ) {
    "use strict";
    
    // Automatically Fade Success Messages
    theme25.autoFadeSuccess = function() {
        setTimeout(function(){
    	    $("#uSuccessMessage").animate({
    	        height: 0, opacity: 0
    	    }, 1250, function(){
    	        $(this).remove();
    	    });
    	},4000);
    };
    
    // Fade notification messages when close button is clicked
    theme25.fadeMessages = function() {
        $(".uCloseMessage").removeAttr('onclick').click(function(){
            $(this).parents("section.uMessageRegion").fadeOut();
        });
    };
    
    // Initiate Show / Hide regions
    theme25.loadHideShowRegions = function() {
        apex.jQuery("a.uRegionControl").click(function(){
    	    var link = jQuery(this)
    	    content = link.parents("div.uRegionHeading").next();
    	    link.toggleClass("uRegionCollapsed");
    	    if (content.css("display") == "block") {
    	        content.slideUp("fast","swing");
    	    } else {
    	        content.slideDown("fast","swing");
    	    }
    	});
    };
    
    theme25.detailedStatusListToolTip = function() {
         this.xOffset = 0; // x distance from mouse
         this.yOffset = 10; // y distance from mouse     
         
         jQuery("ul.detailedStatusList > li[class!=detailedStatusListLegend]").hover(    
           function(e) {
             var insideText = apex.jQuery("section.detailedListTooltip",this).html()
             this.top = (e.pageY + yOffset); this.left = (e.pageX + xOffset);
             $('body').append('<div id="detailedStatusListToolTip">' + insideText + '</div>' );
                   
             $('div#detailedStatusListToolTip').css("top", this.top+"px").css("left", this.left+"px").delay(500).fadeIn("fast");
             
           },
           function() {
             jQuery("div#detailedStatusListToolTip").fadeOut("false").remove();
           }
         ).mousemove(
           function(e) {
             this.top = (e.pageY + yOffset);
             this.left = (e.pageX + xOffset);
             jQuery("div#detailedStatusListToolTip").css("top", this.top+"px").css("left", this.left+"px");
           }
         );
    }
    
    
     /*
     theme25.helloWorld = function ( pMessage ) {
          alert( pMessage );
     };
     */

})( apex.theme25, apex.jQuery);
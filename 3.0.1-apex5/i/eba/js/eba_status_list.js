function ttip() {
 this.xOffset = 0; // x distance from mouse
 this.yOffset = 15; // y distance from mouse     
 
 jQuery(".ebaStatusList a").unbind().hover(    
   function(e) {
     var insideText = jQuery("span.ebaToolTip",this).html()
      // this.t = this.title;
      // this.title = ''; 
     this.top = (e.pageY + yOffset); this.left = (e.pageX + xOffset);
     
     $('body').append( '<div id="ttip"">' + insideText + '</div>' );
           
     // $('p#ttip #ttipArrow').attr("src", 'images/ttip_arrow.png');
     $('div#ttip').css("top", this.top+"px").css("left", this.left+"px").delay(500).fadeIn("fast");
     
   },
   function() {
      // this.title = this.t;
     jQuery("div#ttip").fadeOut("false").remove();
   }
 ).mousemove(
   function(e) {
     this.top = (e.pageY + yOffset);
     this.left = (e.pageX + xOffset);
            
     jQuery("div#ttip").css("top", this.top+"px").css("left", this.left+"px");
   }
 );        
 
};

jQuery(document).ready(function($){
  ttip();
}) 
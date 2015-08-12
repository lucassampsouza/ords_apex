jQuery(document).ready(function(){
  apex.jQuery("span.ebaClearSearch").click(function(){
    apex.jQuery("#P1_SEARCH").val("").focus();
  })
  
	jQuery(".ebaLaunchPad a").hover(function(e){
		var eba_icon = jQuery(this)
		var eba_icon_desc = eba_icon.find("span.ebaAppDesc").text()
		var eba_icon_pos = eba_icon.position()
		if (eba_icon_desc.length > 0) {
  		$("body").append("<div class=\"tsToolTip\"> "+eba_icon_desc+"</div>");
  		heightTip = $(".tsToolTip").height()+5;
  		$("div.tsToolTip")
  			.css("top",eba_icon_pos.top-heightTip+"px")
  			.css("left",eba_icon_pos.left-38+"px")
  			.delay(1000)
  			.fadeIn(200)
		}
	},function(){
			$("div.tsToolTip").remove()
		})
})
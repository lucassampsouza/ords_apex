(function(){
    var scrollbarWidth;
    
    jQuery.getScrollbarWidth = function(forceRecalculation){
        var result = scrollbarWidth || undefined;
        
        // Scollbar width calculation is cached and only calculated when there's nothing on the cache or the recalculation is forced. This means it is safe to call the function over and over again without forcing the recalculation.
        if(!!forceRecalculation || !result){
            var scrollbarMeter = jQuery(document.createElement("div"))
                .css({
                    "width":"100px",
                    "height":"100px",
                    "overflow":"scroll",
                    "position":"absolute",
                    "top":"-9999px"
                })
                .appendTo("body");

            result = scrollbarWidth = scrollbarMeter.get(0).offsetWidth - scrollbarMeter.get(0).clientWidth;

            scrollbarMeter.remove();
            delete(scrollbarMeter);
        }
        
        return result;
    }
})();
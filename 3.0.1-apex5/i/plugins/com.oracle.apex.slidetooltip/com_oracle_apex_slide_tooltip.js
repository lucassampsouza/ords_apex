/*
 * Script that handles AJAX request from APEX
 * 
 */
function com_oracle_apex_slide_tooltip(pRegionId, pOptions){
    var gOptions = pOptions;
    var gRegion$ = jQuery('#' + apex.util.escapeCSS(pRegionId), apex.gPageContext$);
    var gListContainer$ = jQuery('#' + apex.util.escapeCSS(pRegionId + '_slideTooltip'), apex.gPageContext$);
    
     function _clear(){
        gListContainer$.empty();
    }

    function _markup(pData) {
        var obj = pData;
        var list = jQuery("<ul>")
                .addClass("a-DetailedContentList");
        if( jQuery( "html" ).hasClass( "touch" ) ) {
            gOptions.slideTooltipOpt = "slide";
        }
        if (gOptions.slideTooltipOpt === "slide") {
            list.attr("role", "tablist");
        }
        var counts = [];
        jQuery.each(obj, function(key, value) {
            var sublist = jQuery("<div>")
                        .addClass("a-DetailedContentList-body-layout");
            counts.push(value.content.length);
            jQuery.each(value.content, function(keyC, valueC) {
                jQuery("<div>")
                .addClass("a-DetailedContentList-body-row")
                .append(
                    jQuery("<div>")
                    .addClass("a-DetailedContentList-body-row-label")
                    .html(valueC.label)
                )
                .append(
                    jQuery("<div>")
                    .addClass("a-DetailedContentList-body-row-content")
                    .html(valueC.content)
                ).appendTo(sublist)       
            });
            var itemId = pRegionId + "_a-DetailedContentList-item_0"+key;
            var title$ = jQuery("<span>")
                            .addClass("a-DetailedContentList-title")
                            .attr("id", itemId)
                            .html(value.title);
            if ( gOptions.slideTooltipOpt === "slide" ) {
                title$.attr("role", "tab")
            }
            jQuery("<li>")
                .addClass("a-DetailedContentList-item")
                .append(
                    jQuery("<a>")
                    .addClass("a-DetailedContentList-header")
                    .attr("href", value.link)
                    .append(
                        jQuery("<div>")
                        .addClass("a-DetailedContentList-icon")
                        .addClass("fa")
                        .addClass(value.icon)
                    )
                    .append(
                        title$
                    )
                    .append(
                        jQuery("<span>")
                        .addClass("a-DetailedContentList-badge")
                        .html(value.badge)
                    )
                    .append( jQuery("<span>")
                            .addClass("a-DetailedContentList-triggerOuter")
                            .append(
                                jQuery("<a>")
                                    .addClass("a-DetailedContentList-trigger")
                                    .addClass("fa")
                                    .addClass("fa-caret-down")
                                    .attr("href", "#item1_details")
                            )
                    )
                )
                .append(
                    jQuery("<div>")
                    .addClass("a-DetailedContentList-body")
                    .attr( "itemNum", key )
                    .attr("aria-labeledby", itemId)
                    .append(
                        sublist
                    )
                )
                .appendTo(list);
        });
        gListContainer$.append(list);
        list.slideTooltip({
            st: gOptions.slideTooltipOpt,
            countArray: counts
        });
    }

    function _init() {
        apex.server.plugin(
            gOptions.ajaxIdentifier,
            {
                pageItems: gOptions.pageItems
            },
            {
                dataType: "json",
                accept: "application/json",
                refreshObject: gRegion$,
                clear: _clear,
                success: _markup
            }
        );
    }
    
    _init();
    
    gRegion$.on("apexrefresh", _init);
}



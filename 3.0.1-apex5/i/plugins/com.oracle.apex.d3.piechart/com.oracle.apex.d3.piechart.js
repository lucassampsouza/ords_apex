(function(util, server, $, undefined) {
    com_oracle_apex_d3_pie = function(pRegionId, pOptions) {
        // Default our options and store them with the "global" prefix, because it's
        // used by the different functions as closure
        var gOptions,
            gPieChart,
            gPieChartLabels,
            gRegion$,
            gChart$,
            gChartD3,
            gTooltipGenerator,
            gTooltip$,
            gTooltipD3,
            gData,
            gColorMapping,
            gValueFormatter,
            gAry,
            gLegend$,
            gLegendD3,
            gClassScale,
            gColorScale;
            
        _init(pRegionId, pOptions);
        
        function _init(pRegionId, pOptions) {
            gOptions = pOptions;
            
            // Find our region and chart DIV containers
            gRegion$ = $("#" + util.escapeCSS(pRegionId), apex.gPageContext$);
            gChart$ = $("#" + util.escapeCSS(gOptions.chartRegionId), apex.gPageContext$)
                .css({
                    height: gOptions.outerRadius * 2
                });
            
            gChartD3 = d3.select(gChart$.get(0));
            
            if(gOptions.colors){
                gColorScale = d3.scale.ordinal()
                    .range(gOptions.colors.split(':'));
            }
            
            if(gOptions.valueTemplate && (gOptions.valueTemplate.toLowerCase() === 'friendly')){
                gValueFormatter = d3.oracle.fnf();
            } else if(gOptions.valueTemplate && gOptions.valueTemplate.length > 0){
                var fixedRegex = /(^"[^"]*")/;
                var formatPrefix = '';
                var formatSuffix = '';

                if (fixedRegex.test(gOptions.valueTemplate)) {
                    formatPrefix = fixedRegex.exec(gOptions.valueTemplate)[0];
                    formatPrefix = formatPrefix.substr(1, formatPrefix.length - 2);
                    gOptions.valueTemplate = gOptions.valueTemplate.replace(fixedRegex, '');
                } 
                fixedRegex = /("[^"]*"$)/;
                if (fixedRegex.test(gOptions.valueTemplate)) {
                    formatSuffix = fixedRegex.exec(gOptions.valueTemplate)[0];
                    formatSuffix = formatSuffix.substr(1, formatSuffix.length - 2);
                    gOptions.valueTemplate = gOptions.valueTemplate.replace(fixedRegex, '');
                }
                var d3formatting = d3.format(gOptions.valueTemplate);
                gValueFormatter = function() {
                    return formatPrefix + d3formatting.apply(this, arguments) + formatSuffix;
                };
            } else {
                gValueFormatter = function(_x) { return _x; };
            }
            
            // Maxes at 30
            gClassScale = d3.scale.ordinal()
                .range(d3.range(1, 31));
            
            // Initialize chart generator
            gPieChart = d3.oracle.piechart()
                .innerRadius(gOptions.innerRadius)
                .outerRadius(gOptions.outerRadius)
                //.padAngle(gOptions.padAngle)
                .transitions("enable", gOptions.transitions)
                .showPercentages(gOptions.showPercentages)
                .accessors("color", function(d){
                    // If the color scheme is static, use D3 color scale. Otherwise, see if there's a mapping for the series. 
                    // Failing that, it will fall back to CSS.
                    var label = gPieChart.accessors("label").apply(this, arguments);
                    // Data can carry a color field for static things
                    return d.color || (gColorScale ? gColorScale(label) : (gColorMapping[label] || null));
                })
                .formatters("value", gValueFormatter)
                .linkOpenMode("_self");
            
            var resizeTimeout;
            var resizeHandler = function() {
                if(gData){
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(
                        function(){
                            _draw(gData);
                        }, 
                        gOptions.transitions ? 10 : 7
                    );
                }
            };
            // Setup resize logic for responsive chart
            //gChart$.parent().resize(resizeHandler);
            $(window).resize(resizeHandler);
            
            if(gOptions.showLabels){
                gPieChartLabels = d3.oracle.piechart.labels()
                    .piechart(gPieChart)
                    .symbol("circle");
            }
            if(gOptions.showTooltip){
                gTooltipGenerator = d3.oracle.tooltip()
                    .transitions("enable", false)
                    .symbol("circle")
                    .accessors("color", gPieChart.accessors("color"));
            
                gTooltip$ = $(document.createElement("div"))
                    .addClass("a-D3PieChart-tooltip a-D3Tooltip")
                    .appendTo(gChart$)
                    .hide();
                gTooltipD3 = d3.select(gTooltip$.get(0));
                
                gPieChart
                    .pieceoverHandler(function(d){
                        gTooltip$.position({
                            my: "left+20 top",
                            of: d3.event,
                            at: "left top"
                        });
                    });
            }
            if( gOptions.legendPosition != null ){
                gChart$
                    .css({
                        "box-sizing": "content-box",
                        padding: 12
                    });
                
                gAry = d3.oracle.ary()
                    .borders({})
                    .minimumColumnWidth(300)
                    .background(false)
                    .hideTitle(true)
                    .showValue(true)
                    .showValueOnHover(true)
                    .leftColor(true)
                    .symbol("circle")
                    .numberOfColumns(3)
                    .linkOpenMode("_self")
                    .accessors({
                        color: gPieChart.accessors("color"),
                        label: gPieChart.accessors("label"),
                        value: gPieChart.accessors("value")
                    })
                    .formatters("value", gValueFormatter);
            
                gLegend$ = $(document.createElement("div"))
                    .addClass("a-D3ChartLegend");
                gLegendD3 = d3.select(gLegend$.get(0));
                
                if (gOptions.legendPosition === "TOP") {
                    gChart$.before(gLegend$);
                } else {
                    gChart$.after(gLegend$);
                }
            }
            
            /* Bind event handler to the apexrefresh event for the main region element.
             * Dynamic actions can then refresh the chart via the 'Refresh' action.
             *
             * We immediately trigger the event it to load the initial chart data.
             */
            gRegion$
                .on("apexrefresh", _refresh)
                .trigger("apexrefresh");
        }
        
        // Renders the chart with the data provided in pData
        function _draw(pData) {
            gData = pData;
            
            if(gData && gData.length > 0){
                gColorMapping = gData.colors || {};

                gPieChart
                    .on("pieceenter", function(d){
                        if(((gOptions.showLabels && gOptions.showTooltip) && (gData.shownLabels && !gData.shownLabels[d.data.label])) || (!gOptions.showLabels && gOptions.showTooltip)){
                            gTooltipD3
                                .datum(d.data)
                                .call(gTooltipGenerator);
                            
                            gTooltipD3
                                .select(".a-D3Tooltip-marker")
                                .classed("u-Color-" + gClassScale(gPieChart.accessors("label").call(this, d.data)) + "-BG--bg", true);
                            
                            gTooltip$.stop().fadeIn(50);
                        }

                        gPieChart.setters("active").call(this, d.data, true);

                        if(gOptions.legendPosition != null){
                            gLegendD3
                                .selectAll(".a-D3ChartLegend-item")
                                .classed("a-D3ChartLegend-item--active", function(){
                                    return gPieChart.accessors("label").call(this, d.data) === gAry.accessors("label").apply(this, arguments);
                                });
                        }
                    })
                    .on("pieceout", function(d){
                        if(((gOptions.showLabels && gOptions.showTooltip) && (gData.shownLabels && !gData.shownLabels[d.data.label])) || (!gOptions.showLabels && gOptions.showTooltip)){
                            gTooltip$.stop().fadeOut(50);
                        }

                        gPieChart.setters("active").call(this, d.data, false);

                        if(gOptions.legendPosition != null){
                            gLegendD3
                                .selectAll(".a-D3ChartLegend-item")
                                .classed("a-D3ChartLegend-item--active", false);
                        }
                    });


                gChartD3
                    .datum(gData)
                    .call(gPieChart)
                    .selectAll(".a-D3PieChart-piece")
                        .each(function(d){
                            d3.select(this)
                                .classed("u-Color-" + gClassScale(gPieChart.accessors("label").call(this, d.data)) + "-BG--fill", true);
                        });
                    
                gChart$
                    .css({
                        height: gPieChart.responsiveOuterRadius() * 2
                    });

                if(gOptions.showLabels){
                    gChartD3
                        .call(gPieChartLabels)
                        .selectAll(".a-D3Tooltip-marker")
                        .each(function(){
                            var d = d3.select(this.parentNode).datum();
                            
                            d3.select(this)
                                .classed("u-Color-" + gClassScale(gPieChart.accessors("label").call(this, d.data || d)) + "-BG--bg", true);
                        });
                }
                if(gOptions.legendPosition != null){
                    gAry
                        .on("itemover", function(d){
                            gPieChart.setters("active")(d, true);
                            gChartD3.call(gPieChart);

                            gData.shownLabels && gPieChartLabels.overHandler().call(this, d);
                        })
                        .on("itemout", function(d){
                            gPieChart.setters("active")(d, false);
                            gChartD3.call(gPieChart);

                            gData.shownLabels && gPieChartLabels.outHandler().call(this, d);
                        });

                    gLegendD3
                        .datum(gData)
                        .call(gAry)
                        .selectAll(".a-D3ChartLegend-item-color")
                            .each(function(){
                                var d = d3.select(this.parentNode).datum();
                                
                                d3.select(this)
                                    .classed("u-Color-" + gClassScale(gPieChart.accessors("label").call(this, d)) + "-BG--bg", true);
                            });
                }
            } else {
                gChart$
                    .empty()
                    .hide()
                    .fadeIn()
                    .append(
                        $(document.createElement("div"))
                            .addClass("a-D3PieChart-noDataFound-container")
                            .css({
                                width: gOptions.outerRadius * 2,
                                height: gOptions.outerRadius * 2
                            })
                            .append(
                                $(document.createElement("div"))
                                    .addClass("a-D3PieChart-noDataFound")
                                    .css({
                                        width: gOptions.outerRadius * 2,
                                        height: gOptions.outerRadius * 2
                                    })
                                    .text(gOptions.noDataFoundMessage)
                            )
                    );
            }
        }
        // Removes everything inside the chart DIV
        function _clear() {}
        function _debug(errorString) {
            console.log(errorString);
            debugger;
        }
        
        // Called by the APEX refresh event to get new chart data
        function _refresh() {
            server.plugin(
                gOptions.ajaxIdentifier,
                {
                    pageItems: gOptions.pageItems
                },
                {
                    refreshObject: gRegion$,
                    clear: _clear,
                    success: _draw,
                    error: _debug,
                    loadingIndicator: gChart$,
                    loadingIndicatorPosition: "append"
                }
            );
        }
    };
})(apex.util, apex.server, apex.jQuery);
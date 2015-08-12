/*
 * D3 Bar Chart Plug-in v1.0 - http://apex.oracle.com/plugins
 *
 * Based on D3 http://www.d3js.org/
 *
 */
 
(function( util, server, $, d3 ) {

window.com_oracle_apex_d3_barchart = function( pRegionId, pOptions, pRegionName ) {

    function _nvl() {
        for (var i = 0; i < arguments.length; i++) {
            if ( arguments[i] !== undefined && arguments[i] !== null ) {
                return arguments[i];
            }
        };
    }

    var chart = d3.oracle.barchart.apex()
        .apx({
            regionId : pRegionId,
            pageItems : pOptions.pageItems,
            ajaxIdentifier : pOptions.ajaxIdentifier,
            chartRegionId : pOptions.chartRegionId
        })
        .xAxis({
            title : pOptions.xAxisTitle || '',
            grid : !!pOptions.xGrid
        })
        .yAxis({
            title : pOptions.yAxisTitle || '',
            grid : !!pOptions.yGrid
        })
        .tooltips({
            enable : !!pOptions.showTooltip,
            include : {
                series : pOptions.tooltipSeries,
                x : pOptions.tooltipX,
                y : pOptions.tooltipY,
                custom : pOptions.tooltipCustom
            }
        })
        .spacing({
            inner : pOptions.innerSpacing,
            outer : pOptions.spacing
        })
        .mode({
            horizontal : !!pOptions.horizontal,
            display : pOptions.display,
            height : pOptions.heightMode
        })
        .colors({
            multiple : !!pOptions.multipleColors,
            list : ( pOptions.colors || '' ).split( ':' )
        })
        .transitions({
            enable : !!pOptions.transitions,
            duration : 500
        })
        .legend({
            show : !!pOptions.showLegend,
            position : pOptions.legendPosition
        })
        .dimensions({
            minHeight : _nvl( pOptions.minHeight, 100 ),
            maxHeight : _nvl( pOptions.maxHeight, 500 ),
            minAR : _nvl( pOptions.minAR, 1.333 ),
            maxAR : _nvl( pOptions.maxAR, 3 )
        })
        .responsive({
            enable : !!pOptions.responsive,
            threshold : pOptions.threshold,
            of : pOptions.thresholdOf
        })
        .formatters({
            y : pOptions.valueTemplate
        })
        .messages({
            noDataFound : pOptions.noDataFoundMessage
        })
        .accessibility({
            label : pRegionName
        });

    chart();

}; // com_oracle_apex_d3_barchart

})( apex.util, apex.server, apex.jQuery, d3 );
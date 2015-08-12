/*global apex,AnyChart,AnyGantt,anychart*/
/*!
 Chart Widget
 Copyright (c) 2012, 2014, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex.widget}.chart is used to store all chart related functions of Oracle Application Express.
 **/

( function( widget, $, util ) {

/**
 * @param {String} pRegionId
 * @param {Object} [pOptions]
 *
 * @function chart
 * @memberOf apex.widget
 * */
widget.chart = function( pRegionId, pOptions ) {

    var lRegion$ = $( '#' + util.escapeCSS( pRegionId ), apex.gPageContext$ ),
        lChart$  = $( "#" + util.escapeCSS( pRegionId + "_chart" ), apex.gPageContext$),
        lOptions = pOptions || {},
        lChart;

    if ( pOptions.swfFile && pOptions.swfFile.match( /anygantt.*/ )) {
        lChart = new AnyGantt( pOptions.swfFile, pOptions.preloaderFile );
    } else {
        AnyChart.useBrowserResize = true;

        if ( pOptions.type === "FLASH_PREFERRED" ) {
            AnyChart.renderingType = anychart.RenderingType.FLASH_PREFERRED;
            lChart = new AnyChart( pOptions.swfFile, pOptions.preloaderFile );
        } else {
            AnyChart.renderingType = anychart.RenderingType.SVG_ONLY;
            lChart = new AnyChart();
        }
    }
    lChart.wMode  = "transparent";

    if (pOptions.height === "99%") {
        lChart.height = $( window ).height() - 100;
    } else {
        lChart.height = pOptions.height;
    }
    if (pOptions.width === "100%") {
        lChart.width = 1;
    } else {
        lChart.width = pOptions.width;
    }
    
    lChart.write( lChart$[ 0 ] );

    // if there is no region container, add one on the fly. It's necessary for our refresh mechanism
    if( lRegion$.length === 0 ) {
        lRegion$ = lChart$.wrap( '<div id="' + pRegionId + '"></div>' );
    }

    /* Bind event handler to the apexrefresh event for the main region element. Dynamic actions can then
     * refresh the chart via the 'Refresh' action.
     * Immediately execute the refresh to load the chart data.
     */
    lRegion$.on( "apexrefresh", function() {
        _refresh();
    }).trigger( "apexrefresh" );

    // If we use dynamic scaling, we have to do it again if the browser is resized
    if ( pOptions.width === "100%" || pOptions.height === "99%" ) {
        $( window ).on( "apexwindowresized", function() {
            var lWidth,
                lHeight;

            if (pOptions.height === "99%") {
                lHeight = $( window ).height() - 100;
            } else {
                lHeight = lChart.height;
            }
            if ( pOptions.width === "100%" ) {
                lWidth = lChart$.width();
            } else {
                lWidth = lChart.width;
            }

            lChart.resize( lWidth, lHeight );
        });
    }

    // Uses AJAX to get the newest chart data
    function _refresh() {
        
        apex.server.widget( "chart5",
            {
                pageItems: lOptions.pageItems,
                x01:       lOptions.regionId
            }, {
                dataType:      "text",
                refreshObject: lRegion$,
                success:       _showResult
            });

    } // _call

    // AJAX success callback to set the chart data
    function _showResult( pData ) {

        // Change the chart size, because at the time of the initial rendering, lChart$.width() doesn't return
        // the correct value
        if (pOptions.width === "100%") {
            lChart.resize( lChart$.width(), lChart.height );
        }

        lChart.setData( pData );
        
        // if the chart should automatically be refreshed, setup a new timer
        if ( lOptions.refreshInterval > 0 ) {
            setTimeout( function() {
                lRegion$.trigger( "apexrefresh" );
            }, lOptions.refreshInterval * 1000 );
        }
    } // _showResult
    
    

};

})( apex.widget, apex.jQuery, apex.util );
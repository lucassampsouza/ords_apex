/*
 * Flot Line Chart Plug-in v2.0 - http://apex.oracle.com/plugins
 *
 * Based on Flot http://www.flotcharts.org/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function( util, server, $, undefined ) {

com_oracle_apex_flot_line = function( pRegionId, pOptions ) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gOptions,
        gChartOptions,
        gRegion$,
        gChart$,
        gTooltip$,
        gNoData$,
        gData,
        gPlot,
        gHighlight,
        gLabelTemplate;

    _init( pRegionId, pOptions );

    function _create(tag) {
        return $(document.createElement(tag));
    }

    function _init( pRegionId, pOptions ) {
        // Build the Flot configuration object
        gChartOptions = {
            series : {
                lines : {
                    show : true,
                    interpolation : pOptions.interpolation,
                    fill : pOptions.fill
                }
            },
            legend : {
                show : pOptions.showLegend
            },
            xaxis : {
                show : true,
                mode : (pOptions.isTimeData ? 'time' : null),
                axisLabel : pOptions.xAxisTitle
            },
            yaxis : {
                axisLabel : pOptions.yAxisTitle,
                tickFormatter : _tickFormatter
            },
            grid : {
                hoverable : true,
                clickable : true,
                borderColor : '#d3d3d3',
                borderWidth : 1
            },
            shadowSize : 0
        };
        if ( pOptions.showDataPoints ) {
            gChartOptions.points = {
                show : pOptions.interpolation != 'STEP',
                symbol : (pOptions.dataPoints ? pOptions.dataPoints.toLowerCase() : 'circle'),
                radius : 3
            };
        }
        if ( pOptions.colors )
        {
            gChartOptions.colors = pOptions.colors.split(',');
        }
        gOptions = pOptions;

        // Find our region and chart DIV containers
        gRegion$ = $( '#' + util.escapeCSS( pRegionId ), apex.gPageContext$ );
        gChart$ = $( '#' + util.escapeCSS( pOptions.chartRegionId ), apex.gPageContext$ );

        // Register resize event. We trigger it to set the initial height
        gChart$.on( 'resize', _onResize )
            .trigger( 'resize' );

        // Plot an empty chart
        gPlot = $.plot(gChart$, [], gChartOptions);

        // This will ensure the resize plugin doesn't interfere with the legend fixing
        gChart$.on( 'resize', _fixLegend );

        // Create "No Data" container
        gNoData$ = _create('div')
            .addClass('a-FlotLine-message')
            .append(
                _create('div')
                    .addClass('a-FlotLine-messageIcon')
                    .append(
                        _create('span')
                            .addClass('a-Icon icon-plugin-nodata')
                    )
            )
            .append(
                _create('span')
                    .addClass('a-FlotLine-messageText')
                    .text(gOptions.noDataFoundMessage)
            )
            .hide();

        gChart$.after(gNoData$);

        // Create tooltip container, if needed.
        if ( gOptions.showTooltip ) {
            gLabelTemplate = '<div class="a-FlotLine-tooltip"><div>#inner#</div></div>';
            gTooltip$ = $( '<div id="' + util.escapeCSS( pRegionId ) + '_tooltip" class="a-FlotLine-tooltip-container"></div>' ).appendTo( gChart$ );
            gChart$.on( "mousemove", _regionHover );
        }

        // Register hover and click events
        gChart$.on('plothover', _hover);
        gChart$.on('plotclick', _click);

        /* Bind event handler to the apexrefresh event for the main region element.
         * Dynamic actions can then refresh the chart via the 'Refresh' action.
         *
         * We immediately trigger the event it to load the initial chart data.
         */
        gRegion$
            .on( "apexrefresh", _refresh )
            .trigger( "apexrefresh" );
    } // _init

    function _onResize() {
        gChart$.css('height', _recommendedHeight() + 'px');
    }

    function _recommendedHeight() {
        var minAR = gOptions.minAR;
        var maxAR = gOptions.maxAR;
        var w = gChart$.width();
        var h = (gChart$.height() === 0) ? (w/maxAR) : gChart$.height();
        var ar = w/h;
        if (ar < minAR) {
            h = w/maxAR + 1;
        } else if (ar > maxAR) {
            h = w/minAR - 1;
        }
        return Math.max(gOptions.minHeight, Math.min(gOptions.maxHeight, h));
    }

    // Click callback which navigates to the specified URL
    function _click( pEvent, pPos, pObj ) {
        if(pObj) {
            var trueIndex = gOptions.interpolation == 'STEP' ? Math.ceil(pObj.dataIndex / 2) : pObj.dataIndex;
            var dataPoint = gData[pObj.seriesIndex].data[trueIndex];
            if (dataPoint[3]) {
                window.location.assign(dataPoint[3]);
            }
        }
    } // _click

    function _formatX(x) {
        if(gOptions.isTimeData)
        {
            return (new Date(x)).toUTCString();
        }
        return x.toString();
    } //_formatX

    function _formatY(x) {
        return (gOptions.valueTemplate || '#VALUE#').replace('#VALUE#', x);
    } //_formatY

    function _tickFormatter(val, axis) {
        return _formatY(val.toFixed(axis.tickDecimals));
    } //_tickFormatter

    function _renderTemplate( pObj ) {
        var result = '';
        // Step interpolation adds more data points to the series, so we have to account for it.
        var trueIndex = gOptions.interpolation == 'STEP' ? Math.ceil(pObj.dataIndex / 2) : pObj.dataIndex;
        var dataPoint = gData[pObj.seriesIndex].data[trueIndex];
        if ( gOptions.tooltipSeries ) {
            result += '<span><strong>' + pObj.series.label + '</strong></span>';
        }
        if ( gOptions.tooltipX || gOptions.tooltipY ) {
            result += '<span>';
            if ( gOptions.tooltipX ) {
                result += util.escapeHTML(_formatX(dataPoint[0]));
            }
            if ( gOptions.tooltipX && gOptions.tooltipY ) {
                result += '<strong>&nbsp;&#124;&nbsp;</strong>';
            }
            if( gOptions.tooltipY ) {
                result += util.escapeHTML(_formatY(dataPoint[1]));
            }
            result += '</span>';
        }
        if ( gOptions.tooltipCustom && dataPoint[2]) {
            result += '<span>' + util.escapeHTML(dataPoint[2]) + '</span>';
        }
        return result;
    } // _renderTemplate


    var hEvent;
    function _regionHover(e) {
        hEvent = e.originalEvent;
    }

    // Hover callback which is used to display the tooltip
    function _hover( pEvent, pPos, pObj ) {
        if(gHighlight)
        {
            document.body.style.cursor = 'default';
            gPlot.unhighlight(gHighlight.series, gHighlight.datapoint);
            gHighlight = null;
            if( gOptions.showTooltip )
            {
                gTooltip$.hide();
            }
        }
        if (pObj){
            if ((gOptions.interpolation == 'STEP') && (pObj.dataIndex % 2 == 1))
            {
                gPlot.unhighlight(pObj.series, pObj.datapoint);
                pObj = {
                    dataIndex : pObj.dataIndex + 1,
                    series : pObj.series,
                    seriesIndex : pObj.seriesIndex,
                    datapoint : pObj.series.data[(pObj.dataIndex + 1)/2]
                };
            }
            var trueIndex = gOptions.interpolation == 'STEP' ? Math.ceil(pObj.dataIndex / 2) : pObj.dataIndex;
            var dataPoint = gData[pObj.seriesIndex].data[trueIndex];
            if (dataPoint[3]) {
                document.body.style.cursor = 'pointer';
            }
            gPlot.highlight(pObj.series, pObj.datapoint);
            if(gOptions.showTooltip)
            {
                gTooltip$.show()
                    .position({
                        my : 'left+20 center',
                        at : 'right center',
                        of : hEvent,
                        within : gRegion$
                    })
                    .css({
                        'border-color' : pObj.series.color
                    });
                if (gHighlight !== pObj)
                {
                    gTooltip$.html( gLabelTemplate.replace( /#inner#/, _renderTemplate( pObj ) ) );
                }
            }
            gHighlight = pObj;
        }
    } // _hover


    // Renders the chart with the data provided in pData
    function _draw( pData ) {
        var dataArray = pData.data;
        var series = {};
        if (dataArray.length >= 1)
        {
            gChart$.show();
            gNoData$.hide();
            for (var i in dataArray)
            {
                if(!series[dataArray[i].series])
                {
                    series[dataArray[i].series] = [];
                }
                series[dataArray[i].series].push([dataArray[i].x, dataArray[i].y, dataArray[i].tooltip, dataArray[i].link]);
            }
            var colorArray = pData.colors
            var colors = {};
            for (var i in colorArray)
            {
                if(!colors[colorArray[i].series])
                {
                    colors[colorArray[i].series] = colorArray[i].color;
                }
            }
            var formattedSeries = [];
            var currentSeries;
            for (var k in series)
            {
                currentSeries = {
                    label : k,
                    data : series[k]
                };
                if(colors[k])
                {
                    currentSeries.color = colors[k];
                }
                formattedSeries.push(currentSeries);
            }
            gData = formattedSeries;
            gPlot.setData(formattedSeries);
            gPlot.setupGrid();
            gPlot.draw();
            _fixLegend();
        } else {
            gChart$.hide();
            gNoData$.show();
        }
    } // _draw

    function _fixLegend() {
        // Remove inline styles from the legend, if available
        if ( gOptions.showLegend )
        {
            // Remove unnecessary background div
            $('.legend>div', gChart$).remove();

            // Remove non-positioning inline styles in order to style them with CSS
            var table = $('.legend>table', gChart$);
            table.removeAttr('style');
            $('.legendColorBox', table).each(
                function(i, element){
                    var color = $('div>div', element).css('border-color');
                    $(element).empty()
                        .append( $('<div></div>').css('background-color', color) );
                }
            );

            // Handle hovering over the legend
            $('.legend', gChart$).hover(
                // Hover in
                function(event) {
                    $('table', $(this)).css('visibility', 'hidden');
                },
                // Hover out
                function(event) {
                    $('table', $(this)).css('visibility', 'visible');
                }
            );
        }
    }

    // Removes everything inside the chart DIV
    function _clear() {
        // console.log('Clear!');
    } // _clear

    function _debug( something) {
        debugger;
    }

    // Called by the APEX refresh event to get new chart data
    function _refresh() {

            server.plugin( gOptions.ajaxIdentifier,
            {
                pageItems: gOptions.pageItems
            }, {
                refreshObject: gRegion$,
                clear:         _clear,
                success:       _draw,
                error:         _debug,
                loadingIndicator:         gChart$,
                loadingIndicatorPosition: "append"
            });

    } // _refresh

}; // com_oracle_apex_flot_line

})( apex.util, apex.server, apex.jQuery );
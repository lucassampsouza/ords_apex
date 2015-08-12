/*
 * Flot Pie Chart Plug-in v2.0 - http://apex.oracle.com/plugins
 *
 * Based on Flot http://www.flotcharts.org/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function( util, server, $, undefined ) {

com_oracle_apex_flot_pie = function( pRegionId, pOptions ) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gOptions,
        gRegion$,
        gChart$,
        gNoData$,
        gChartOptions,
        gPlot,
        gTooltip$,
        gLabelTemplate,
        gData,
        gHighlight;

    _init( pRegionId, pOptions );

    function _create(tag) {
        return $(document.createElement(tag));
    }

    function _init( pRegionId, pOptions ) {

        // Set default options if not specified
        gOptions = $.extend({
            type:             "STANDARD",
            innerRadius:      0.5,
            minAR:            1,
            maxAR:            1.333,
            minHeight:        100,
            maxHeight:        500,
            showLabel:        false,
            showLegend:       false,
            showTooltip:      false,
            showValue:        false,
            combineSlices:    false,
            combineThreshold: 10,
            combineLabel:     "Others",
            combineUrl:       "",
            combineColor:     "#999",
            pageItems:        ""
        }, pOptions );

        gChartOptions = {
            series: {
                pie: {
                    show: true,
                    radius: 1/1,
                    stroke: {
                        width: 1
                    },
                    label: {
                        show: false
                    }
                }
            },
            legend: {
                show: false
            },
            grid: {
                hoverable: gOptions.showTooltip,
                clickable: true
            }
        };

        // Find our region and chart DIV containers
        gRegion$ = $( '#' + util.escapeCSS( pRegionId ), apex.gPageContext$ );
        gChart$  = $( "#" + util.escapeCSS( pRegionId + "_chart" ), apex.gPageContext$);

        // if there is no region container, add one on the fly. It's necessary for our refresh mechanism
        if ( gRegion$.length === 0 ) {
            gRegion$ = gChart$.wrap( '<div id="' + pRegionId + '"></div>' );
        }

        // Set pie options based on chart type
        if ( gOptions.type === "DONUT" ) {
            gChartOptions.series.pie.innerRadius = gOptions.innerRadius;
            gChartOptions.series.pie.donutWidth = true;
        } else if ( gOptions.type === "TILTED" ) {
            gChartOptions.series.pie.tilt = 0.5;
        } else if ( gOptions.type === "RECT" ) {
            gChartOptions.series.pie.radius = 800;
        }

        if (gOptions.colors) {
            gChartOptions.colors = gOptions.colors.split(',');
        }

        // Do we have to display the label?
        if ( gOptions.showLabel ) {
            gChartOptions.series.pie.label = {
                show:      true,
                radius:    120,
                radiusForcePct: true,
                formatter: _labelFormatter
            };
        }

        if ( gOptions.showLabel || gOptions.showTooltip ) {
            gLabelTemplate = '<div class="flotPieLabelBackground"><div class="flotPieLabelContainer"><span class="flotPieLabelColor" style="background-color: #color#"></span>#label# #percent#%';
            if ( gOptions.showValue ) {
                gLabelTemplate += "   (#value#)";
            }
            gLabelTemplate += "</div></div>";
        }

        // Should we combine slices below a specified threshold?
        if ( gOptions.combineSlices ) {
            gChartOptions.series.pie.combine = {
                threshold: gOptions.combineThreshold / 100,
                color:     gOptions.combineColor,
                label:     gOptions.combineLabel
            };
        }

        // Do we have to display the legend?
        gChartOptions.legend.show = gOptions.showLegend;

        // We need this for the automatic aspect ratio preservation
        gChart$.on( 'resize', _onResize )
            .trigger( 'resize' );

        // Time to draw (an empty) chart!
        gData = [];
        gPlot = $.plot( gChart$, gData, gChartOptions );

        gChart$.on( 'resize', _fixLegend );

        // We do always register the click event and click function determines if something has to be done
        gChart$.on( "plotclick", _click );

        // No Data Found container
        
        // Create "No Data" container
        gNoData$ = _create('div')
            .addClass('a-FlotPie-message')
            .append(
                _create('div')
                    .addClass('a-FlotPie-messageIcon')
                    .append(
                        _create('span')
                            .addClass('a-Icon icon-plugin-nodata')
                    )
            )
            .append(
                _create('span')
                    .addClass('a-FlotPie-messageText')
                    .text(gOptions.noDataFoundMessage)
            )
            .hide();

        gChart$.after(gNoData$);

        // Do we have to show tooltips?
        if ( gOptions.showTooltip ) {
            gTooltip$ = $( '<div id="' + util.escapeCSS( pRegionId ) + '_tooltip" class="flotPieHoverContainer"></div>' ).appendTo( gChart$ );
            gChart$.on( "plothover", _hover );
            gChart$.on( "mousemove", _regionHover );
        }

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

    function _formatY(x) {
        return (gOptions.valueTemplate || '#VALUE#').replace('#VALUE#', x);
    } //_formatY

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
        }
    } // _fixLegend

    // Label/Tooltip Formatter
    function _getLabel( pLabel, pSeries ) {

        return gLabelTemplate
                   .replace( /#color#/,   pSeries.color )
                   .replace( /#label#/,   pLabel )
                   .replace( /#percent#/, Math.round(pSeries.percent) )
                   .replace( /#value#/,   _formatY(pSeries.data[0][1]) );

    } // _getLabel


    // Label Formatter callback
    function _labelFormatter( pLabel, pSeries ) {

        var lLabel = pLabel,
            lFound = false,
            lUrl;

        // Unfortunately we don't have a pObj parameter which we could use
        // to directly locate the stored URL for the currently processed pie slice.
        // We have to loop through our gData array and match it with the label
        for ( var i = 0, l = gData.length; i < l; i++ ) {
            if ( gData[ i ].label === pLabel ) {
                lFound = true;
                lUrl   = gData[ i ].url;
                break;
            }
        }
        // Not found? Check if it's the "CombineLabel"
        if ( !lFound && gOptions.combineSlices && pLabel === gOptions.combineLabel ) {
            lUrl = gOptions.combineUrl;
        }
        // Only if a URL has been provided, create a link
        if ( lUrl ) {
            lLabel = '<a href="' + lUrl + '">' + pLabel + '</a>';
        }

        return _getLabel( lLabel, pSeries );

    } // _labelFormatter


    // Click callback which navigates to the specified URL
    function _click( pEvent, pPos, pObj ) {

        var lUrl;

        if ( pObj ){

            lUrl = gData[ pObj.seriesIndex ].url;

            if ( gOptions.combineSlices ) {
                if ( pObj.series.label === gOptions.combineLabel ) {
                    lUrl = gOptions.combineUrl;
                }
            }

            if ( lUrl ) {
                location.href = lUrl;
            }
        }
    } // _click

    var hEvent;
    function _regionHover(e) {
        hEvent = e.originalEvent;
    }

    // Hover callback which is used to display the tooltip
    function _hover( pEvent, pPos, pObj ) {
        if( !pObj ) {
            gHighlight && gHighlight.series.labelContainer && gHighlight.series.labelContainer.show();
            gTooltip$.hide();
            document.body.style.cursor = 'default';
        } else {
            gHighlight && gHighlight.series.labelContainer && gHighlight.series.labelContainer.show();
            gHighlight = pObj;
            pObj.series.labelContainer && pObj.series.labelContainer.hide();
            gTooltip$.html( _getLabel( pObj.series.label, pObj.series ));
            /*gTooltip$.css({
                "top":  (pPos.pageY - gChart$.position().top) + "px",
                "left": ( pPos.pageX - gChart$.position().left + 12 ) + "px"
            });*/
            gTooltip$.show();
            gTooltip$.position({
                my : 'left+20 center',
                at : 'right center',
                of : hEvent,
                within : gRegion$
            });

            var lUrl = gData[ pObj.seriesIndex ].url;

            if ( gOptions.combineSlices ) {
                if ( pObj.series.label === gOptions.combineLabel ) {
                    lUrl = gOptions.combineUrl;
                }
            }

            if ( lUrl ) {
                document.body.style.cursor = 'pointer';
            }
            else {
                document.body.style.cursor = 'default';
            }
        }
    } // _hover


    // Renders the chart with the data provided in pData
    function _draw( pData ) {

        gData = pData;
        if (pData.length >= 1) {
            gNoData$.hide();
            gChart$.show();
            gPlot.setData(gData);
            gPlot.setupGrid();
            gPlot.draw();
            _fixLegend();
        } else {
            gNoData$.show();
            gChart$.hide();
        }

    } // _draw


    // Removes everything inside the chart DIV
    function _clear() {
    } // _clear


    // Called by the APEX refresh event to get new chart data
    function _refresh() {

            server.plugin( gOptions.ajaxIdentifier,
            {
                pageItems: gOptions.pageItems
            }, {
                refreshObject: gRegion$,
                clear:         _clear,
                success:       _draw,
                loadingIndicator:         gChart$,
                loadingIndicatorPosition: "append"
            });

    } // _refresh

}; // com_oracle_apex_flot_pie

})( apex.util, apex.server, apex.jQuery );
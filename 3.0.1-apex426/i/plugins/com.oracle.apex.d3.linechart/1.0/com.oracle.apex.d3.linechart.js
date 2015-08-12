/*
 * D3 Line Chart Plug-in v1.0 - http://apex.oracle.com/plugins
 *
 * Based on D3 http://www.d3js.org/
 *
 */
(function( util, server, $, d3 ) {

    var LEGEND_COLUMN_WIDTH = 200,
    CIRCLE_EXPANSION_FACTOR = 2,
    POINT_TRANSITION_DURATION = 200,
    CHART_LINE_CLASS = 'a-D3LineChart-line',
    CHART_AREA_CLASS = 'a-D3LineChart-area',
    CHART_POINT_CONTAINER_CLASS = 'a-D3LineChart-pointContainer',
    IE_UP_TO_10 = /MSIE \d/.test(navigator.userAgent),
    IE_11_AND_UP = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
    
    var IS_IE = IE_UP_TO_10 || IE_11_AND_UP;

    /**
     * Initialization function
     * @param {String} pRegionId
     * @param {Object} pOptions
     *
     */
    com_oracle_apex_d3_linechart = function( pRegionId, pOptions ) {

        //'g' prefix to show that this variables correspond to a global context inside the plugin
        var gRegion$,
            gChart$,
            gTooltip$,
            gLegend$,
            gOptions,
            gLineChart,
            gData,
            gColorMapping,
            gXValueFormatter,
            gYValueFormatter,
            gHasHookedEvents = false,
            gFocusedPoint,
            gHoveredPoint,
            gAry,
            gClassScale,
            gIsKeyDownTriggered,
            gCurrentSeries,
            gSeries,
            gSeriesSelection,
            gObjectIndex,
            gTickIntervalFunction,
            gTooltipColor,
            gTooltipGenerator;

        /*
         * Gets proper function to format numeric values
         * @param {String} valueTemplate Contains the string that is being used as regular expression or the 'friendly' option
         * @return {Function} Function to format numeric value
         *
         */
        function _numericFormat( valueTemplate ){
            if ( valueTemplate && ( valueTemplate.toLowerCase() === 'friendly') ) {
                return d3.oracle.fnf();
            } else if ( valueTemplate && valueTemplate.length > 0 ) {
                var fixedRegex = /(^"[^"]*")/;
                var formatPrefix = '';
                var formatSuffix = '';

                if ( fixedRegex.test( valueTemplate ) ) {
                    formatPrefix = fixedRegex.exec( valueTemplate )[0];
                    formatPrefix = formatPrefix.substr( 1, formatPrefix.length - 2 );
                    valueTemplate = valueTemplate.replace( fixedRegex, '' );
                }
                fixedRegex = /("[^"]*"$)/;
                if ( fixedRegex.test( valueTemplate ) ) {
                    formatSuffix = fixedRegex.exec( valueTemplate )[0];
                    formatSuffix = formatSuffix.substr( 1, formatSuffix.length - 2 );
                    valueTemplate = valueTemplate.replace( fixedRegex, '' );
                }
                var d3formatting = d3.format( valueTemplate );
                return function() {
                    return formatPrefix + d3formatting.apply(this, arguments) + formatSuffix;
                };
            } else {
                return function(_x) { return _x; }
            }
        }

        /*
         * Gets proper function to format date values
         * @param {String} valueTemplate Contains the string that is being used as regular expression or the 'friendly' option
         * @return {D3 Function} Function to format date value
         *
         */
        function _dateFormat( valueTemplate ){
            if ( valueTemplate && ( valueTemplate.toLowerCase() === 'friendly') ) {
                if ( gTickIntervalFunction === d3.time.second ){
                    return d3.format('%H:%M:%S');
                }else if( gTickIntervalFunction === d3.time.minute ){
                    return d3.format('%H:%M:%S');
                }else if( gTickIntervalFunction === d3.time.hour ){
                    return d3.format('%H:%M:%S');
                }else if( gTickIntervalFunction === d3.time.month ){
                    return d3.format('%b %Y');
                }else if( gTickIntervalFunction === d3.time.year ){
                    return d3.format('%Y');
                }else {
                    //Days and weeks intervals
                    return d3.time.format('%b %d %Y');
                }
            }else {
                return d3.time.format(valueTemplate);
            }
        }

        /*
         * Initializes tooltip with some attributes 
         *
         */
        function _initializeTooltip(){
            gTooltipGenerator = d3.oracle.tooltip()
                    .accessors({
                        label : (pOptions.tooltipX || pOptions.tooltipSeries) ?
                                    function( d ) {
                                        if ( pOptions.tooltipX && !pOptions.tooltipSeries) {
                                            return pOptions.xDataType.toLowerCase() === 'number' ? gXValueFormatter(d.x) : gXValueFormatter(new Date(d.x));
                                        } else if ( !pOptions.tooltipX && pOptions.tooltipSeries) {
                                            return d.series;
                                        } else {
                                            var formattedXValue = pOptions.xDataType.toLowerCase() === 'number' ? gXValueFormatter(d.x) : gXValueFormatter(new Date(d.x));
                                            return d.series + ' (' + formattedXValue + ')';
                                        }
                                    } : null,
                        value : pOptions.tooltipY ? function( d ) { return d.y; } : null,
                        color : function() { return gTooltipColor },
                        content : function( d ) {
                            return d.tooltip;
                        }
                    })
                    .formatters({
                        value : gYValueFormatter
                    })
                    .transitions({
                       enable : false
                    })   
                    .symbol( 'circle' );
        }

        /*
         * Initializes Legend with some attributes and position the legend on top or bottom
         * according to attribute sent by user
         *
         */
        function _initializeLegend(){
            // TODO Invoke d3.oracle.ary()
            gAry = d3.oracle.ary()
                .hideTitle( true )
                .showValue( false )
                .leftColor( true )
                .numberOfColumns( 3 )
                .accessors({
                    color: gLineChart.accessors( 'color' ),
                    label: gLineChart.accessors( 'series' )
                });

            gLegend$ = $( '<div>' );

            if ( pOptions.legendPosition ==='TOP' ) {
                gChart$.before( gLegend$ );
            } else {
                gChart$.after( gLegend$ );
            }
        }

        /*
         * IE Manipulation of BBox
         * @param {Object} object DOM element
         * @param {Object} tooltipSelection D3 element
         * @param {Object} d D3 element
         */
        function _detach( bbox ) {
            return {
                x : bbox.x,
                y : bbox.y,
                width : bbox.width,
                height : bbox.height
            };
        }

        /*
         * Shows the tooltip
         * @param {Object} object DOM element
         * @param {Object} tooltipSelection D3 element
         * @param {Object} d D3 element
         */
        function _showTooltip( object, tooltipSelection, d ){
            //Make gIsKeyDownTriggered false to make sure that this code is being executed and avoid conflicts for other events that show the tooltip too
            gIsKeyDownTriggered = false;
            gTooltipColor = window.getComputedStyle( object ).getPropertyValue( 'fill' );

            //Tooltip initialization
            tooltipSelection
                .datum( d )
                .call( gTooltipGenerator );
            gTooltip$.stop().fadeIn( pOptions.transitions ? 100 : 0 );

            //Get offset of current point and position the current tooltip
            var off = $( object ).offset();

            var rOff = $( object ).offset();
            var cOff = gChart$.offset();
            var rBox = _detach( object.getBBox() );
            gTooltip$.position({
                my: 'center bottom-5',
                of: gChart$,
                at: 'left+' +
                    Math.round( rOff.left - cOff.left + rBox.width / 2 ) +
                    ' top+' +
                    ( rOff.top - cOff.top ),
                within: gRegion$,
                collision: 'fit fit'
            });
        }

        /*
         * Filters the data object sent from server to get the groupings of series
         * @return {Object} Filtered data
         */
        function _getSeriesData(data){
            return oracle.jql()
                .select( [function(rows){ return gLineChart.accessors('color')(rows[0]); }, 'color'] )
                .from( data )
                .group_by( [function(row){ return row.series; }, 'series'] )();
        }

        /*
         * Assign theme roller classes to chart elements (Dots, Lines and Areas)
         * @param {Object} chart D3 element
         * 
         */
        function _assignThemeRollerClasses( chart ){
            chart.selectAll( '.' + CHART_POINT_CONTAINER_CLASS + '-dot' )
                .each(function () {
                    d3.select( this )
                        .classed( 'u-Color-' + gClassScale( gLineChart.accessors( 'series' ).apply( this, arguments ) ) + '-BG--fill', true )
                        .classed( 'u-Color-' + gClassScale( gLineChart.accessors( 'series' ).apply( this, arguments ) ) + '-BG--br', true )
                })
                .classed( '.' + CHART_POINT_CONTAINER_CLASS + '-dot', function ( d ) { return ( d.link && d.link.length > 1 ); } );

            chart.selectAll( '.' + CHART_AREA_CLASS )
                .each(function () {
                    d3.select( this )
                        .classed( 'u-Color-' + gClassScale( gLineChart.accessors( 'series' ).apply( this, arguments ) ) + '-BG--fill', true )
                })

            chart.selectAll( '.'+ CHART_LINE_CLASS )
                .each(function () {
                    d3.select( this )
                        .classed( 'u-Color-' + gClassScale( gLineChart.accessors( 'series' ).apply( this, arguments ) ) + '-BG--br', true )
                })
        }

        /*
         * When the left key is pressed change the focus point to the previous point in a series,
         * if the focus is on the first point in the series and the left arrow is pressed, the focus goes to the last point in the series
         * When the right key is pressed change the focus point to the next point in a series,
         * if the focus is on the last point in the series and the right arrow is pressed, the focus goes to the first point in the series
         * @param {Object} chartPointDotClass D3 element
         * @param {Object} object DOM element
         * @param {Number} key Key code of left(37) and right(39) keys
         * 
         */
        function _leftRightArrowKeyAction( chartPointDotClass, object, key ){
            gIsKeyDownTriggered = true;
            //If the left key was pressed go the previous point
            if( key === 37 ){
                if ( !gFocusedPoint ) {
                    gFocusedPoint = $(object.querySelectorAll(chartPointDotClass)).last().focus();
                    //gFocusedPoint = $(object).find(chartPointDotClass).last().focus();
                    //gFocusedPoint = $( chartPointDotClass, gChart$ ).last().focus();      
                } else if ( gFocusedPoint.prev().length > 0 ) {
                    gFocusedPoint.blur();
                    gFocusedPoint = gFocusedPoint.prev().focus();
                } else {
                    gFocusedPoint.blur();
                    gFocusedPoint = $(gFocusedPoint.parent().get( 0 ).querySelectorAll(chartPointDotClass)).last().focus();
                    //gFocusedPoint = gFocusedPoint.parent().find(chartPointDotClass).last().focus();
                    //gFocusedPoint = $( chartPointDotClass, gFocusedPoint.parent() ).last().focus();
                }
            //If the right key was pressed go the next point
            }else if( key === 39 ){
                if ( !gFocusedPoint ) {
                    gFocusedPoint = $(object.querySelectorAll(chartPointDotClass)).first().focus();
                    //gFocusedPoint = $(object).find( chartPointDotClass ).first().focus();
                    //gFocusedPoint = $( chartPointDotClass, gChart$ ).first().focus();   
                } else if ( gFocusedPoint.next().length > 0 ) {
                    gFocusedPoint.blur();
                    gFocusedPoint = gFocusedPoint.next().focus();
                } else {
                    gFocusedPoint.blur();
                    gFocusedPoint = $(gFocusedPoint.parent().get( 0 ).querySelectorAll(chartPointDotClass)).first().focus();
                    //gFocusedPoint = gFocusedPoint.parent().find( chartPointDotClass ).first().focus();
                    //gFocusedPoint = $( chartPointDotClass, gFocusedPoint.parent() ).first().focus();
                }
            }
        }

        /*
         * When the up key is pressed change the focus point to the point that has the same X value in the previous series,
         * if the focus is on the last series and the up arrow is pressed, the focus goes to the first series
         * When the down key is pressed change the focus point to the point that has the same X value in the next series,
         * if the focus is on the first series and the down arrow is pressed, the focus goes to the last series
         * @param {Object} tooltipSelection D3 element
         * @param {Object} d D3 element
         * @param {Number} key Key code of up(38) and down(40) keys
         *
         */
        function _upDownArrowKeyAction( chartPointDotClass, object, key ){
            gIsKeyDownTriggered = true;

            //If there are no focused points, focus on the first point of the first series
            //If there is already a focused point check which one is the one to get the focus
            if ( !gFocusedPoint ){
                gFocusedPoint.blur();
                gFocusedPoint = $(object.querySelectorAll(chartPointDotClass)).first().focus();
            }else{
                //Get the proper index to be focused
                //If the up arrow was pressed reduce the index
                if( key === 38 ){
                    if ( gObjectIndex === 0 ){//gObjectIndex has the index value of the element in one series that has the focus eg.(If the second data point in a series is focus--> gObjectIndex = 1)
                        gObjectIndex = gSeries.length - 1;
                    }else{
                        gObjectIndex--;
                    }
                //If the udown arrow was pressed increase the index
                }else if( key === 40 ){
                    if ( gObjectIndex === gSeries.length - 1 ){
                       gObjectIndex = 0; 
                    }else{
                        gObjectIndex++;
                    }
                }
                //To get the same point in the previous series we assume that between series all the points share an X value
                //First we select the x value of the focused point
                var xValueOfdotToBeSelected =  d3.select( gFocusedPoint.get(0) ).datum().x;
                //Get all the point in the series that is going to have the focus
                var dotsSelection = gSeriesSelection
                                    .filter(function (d) { return d.series === gSeries[gObjectIndex].series; })
                                    .selectAll(chartPointDotClass);

                //Select the point that has the same X value, the result is an object that needs to be accessed to get the x value,
                //that is --> [0][0]
                var dotSelected = dotsSelection
                                    .filter(function (d) { return d.x === xValueOfdotToBeSelected; })[0][0];

                //If we found a match focus that point, if not focus on the first point of the series
                if( dotSelected ){
                    gFocusedPoint.blur();
                    gFocusedPoint = $( dotSelected ).focus();
                }else{
                    gFocusedPoint.blur();
                    gFocusedPoint = $( dotsSelection[0][0] ).first().focus();
                }            
            }
        }

        function _addKeyBoardSupport(){
            var chartPointDotClass = '.' + CHART_POINT_CONTAINER_CLASS + '-dot'; 
            var isFocused = false;
            var svg = $( 'svg', gChart$ ).first()
                .attr( 'tabindex', 0 )
                .on( 'focusin', function() {
                    isFocused = true;
                })
                .on( 'keydown', function (e) {
                    switch ( e.which ) {
                        case 37:
                            //LEFT ARROW PRESSED
                            _leftRightArrowKeyAction(chartPointDotClass, this, e.which);
                            break;
                        case 38:
                            //UP ARROW PRESSED
                            _upDownArrowKeyAction(chartPointDotClass, this, e.which);
                            break;
                        case 39:
                            //RIGHT ARROW PRESSED
                            _leftRightArrowKeyAction(chartPointDotClass, this, e.which);
                            break;
                        case 40:
                            //DOWN ARROW PRESSED
                            _upDownArrowKeyAction(chartPointDotClass, this, e.which);
                            break;
                    }
                })
                .on( 'focusout', function (e) {
                    if ( $( 'circle:focus, svg:focus', gChart$ ).length === 0 ) {
                        isFocused = false;
                        var self = this;
                        d3.select( gChart$.get(0) )
                            .selectAll( chartPointDotClass )
                            .attr( 'opacity', 1 );
                        if ( IS_IE ) {
                            var chartSelection =  d3.select( gChart$.get(0) );
                            var focusClass = pOptions.display.toLowerCase() === 'stacked' ? '--fade-stacked' : '--fade';
                            chartSelection
                                .selectAll( '.'+CHART_LINE_CLASS )
                                .classed( CHART_LINE_CLASS + focusClass, false);

                            chartSelection
                                .selectAll( '.'+CHART_AREA_CLASS )
                                .classed( CHART_AREA_CLASS + focusClass, false);

                            chartSelection
                                .selectAll( '.'+CHART_POINT_CONTAINER_CLASS )
                                .classed( CHART_POINT_CONTAINER_CLASS + focusClass, false);

                            d3.select( gFocusedPoint.get(0) )
                                .transition().duration( POINT_TRANSITION_DURATION )
                                .attr("r", function(d){ return d.$radius; });
                            gFocusedPoint = null;
                            gTooltip$.hide();
                        }

                    }
                });
                
            $( document ).on( 'keydown', function (e) {
                if ( isFocused && e.which >= 37 && e.which <= 40 ) {
                    e.preventDefault();
                }
            });
            gHasHookedEvents = true;
        }

        /*
         * Initialization function for the plugin
         * @param {String} pRegionId Contains the id of the region that will contain the plugin
         * @param {Object} pOptions Object that have the attributes values of the plugin
         *
         */
        function _init( pRegionId, pOptions ) {
            gOptions = pOptions;

            // Find our region and chart DIV containers
            gRegion$ = $( '#' + util.escapeCSS( pRegionId ), apex.gPageContext$ );
            gChart$ = $( '#' + util.escapeCSS( pOptions.chartRegionId ), apex.gPageContext$ );

            //If user sends custom color string define a scale
            var colorScale = pOptions.colors ?  d3.scale.ordinal().range( pOptions.colors.split( ':' ) ) : undefined;

            /*
             * The X Axis can be either a numeric or datetime value
             * If the user picks the number value assign the formatter with a numeric template
             * If the user picks a datetime value assign the formatter with the proper template
             */
            if( pOptions.xDataType.toLowerCase() === 'number' ){
                gXValueFormatter = _numericFormat(pOptions.xValueTemplate);
            }else{
                gXValueFormatter = _dateFormat(pOptions.xValueTemplate);
            }

            //Define Scale to pick numbers when assigning theme roller classes
            gClassScale = d3.scale.ordinal()
                .range( d3.range( 1, 16 ) );

            //Define function to format Y Axis
            gYValueFormatter = _numericFormat(pOptions.yValueTemplate);

            //Pick X Axis interval
            switch (pOptions.xTickInterval){
                case 'SECOND':
                    gTickIntervalFunction = d3.time.second;
                break;
                case 'MINUTE':
                    gTickIntervalFunction = d3.time.minute;
                break;
                case 'HOUR':
                    gTickIntervalFunction = d3.time.hour;
                break;
                case 'DAY':
                    gTickIntervalFunction = d3.time.day;
                break;
                case 'WEEK':
                    gTickIntervalFunction = d3.time.week;
                break;
                case 'SUNDAY':
                    gTickIntervalFunction = d3.time.sunday;
                break;
                case 'MONDAY':
                    gTickIntervalFunction = d3.time.monday;
                break;
                case 'TUESDAY':
                    gTickIntervalFunction = d3.time.tuesday;
                break;
                case 'WEDNESDAY':
                    gTickIntervalFunction = d3.time.wednesday;
                break;
                case 'THURSDAY':
                    gTickIntervalFunction = d3.time.thursday;
                break;
                case 'FRIDAY':
                    gTickIntervalFunction = d3.time.friday;
                break;
                case 'SATURDAY':
                    gTickIntervalFunction = d3.time.saturday;
                break;
                case 'MONTH':
                    gTickIntervalFunction = d3.time.month;
                break;
                case 'YEAR':
                    gTickIntervalFunction = d3.time.year;
                break;
                default:
                    gTickIntervalFunction = 'auto';
            }

            // Initialize chart generator with plugin variables
            gLineChart = d3.oracle.linechart()
                .margin( 'left', 'auto' )
                .margin( 'right', 'auto' )
                .margin( 'bottom', 'auto' )
                //Set time data according to the type set in the attributes
                .timeData( pOptions.xDataType.toLowerCase() === 'date' || pOptions.xDataType.toLowerCase() === 'timestamp' || pOptions.xDataType.toLowerCase() === 'timestamp_tz' || pOptions.xDataType.toLowerCase() === 'timestamp_ltz')
                .accessors( 'color', function( d ) {
                    // If the color scheme is static, use D3 color scale. Otherwise, see if there's a mapping for the series.
                    // Failing that, it will fall back to CSS.
                    var s = gLineChart.accessors( 'series' ).apply( this, arguments );
                    return colorScale ? colorScale( s ) : ( gColorMapping[ s ] || null );
                })
                .heightMode( ( pOptions.heightMode || 'chart' ).toLowerCase() )
                .xFormatter(gXValueFormatter)
                .lineInterpolation(pOptions.interpolation)
                .transitions( 'enable', !!pOptions.transitions )
                .dotRadius('max', 2.5)
                .dotRadius('min', 1)
                .dotRadius('size', 'auto')
                .dotRadius('spacing', 0.6)
                .accessors( 'key', function( d ) {
                    return ( typeof d.series ) + ':' + d.series + '||' + ( typeof d.x ) + ':' + d.x;
                })
                .xAxis({
                    title: pOptions.xAxisTitle || '',
                    formatter: gXValueFormatter,
                    grid: pOptions.xGrid,
                    ticksInterval: gTickIntervalFunction,
                    ticksIntervalStep: 1
                })
                .yAxis({
                    title : pOptions.yAxisTitle || '',
                    formatter : gYValueFormatter
                })

            //Window resize handler
            $(window).on("apexwindowresized", function() {
              _draw(gData);
            });

            if ( pOptions.showLegend ) {
                _initializeLegend();
            }

            // Create tooltip container and bind necessary events
            if ( pOptions.showTooltip ) {
                _initializeTooltip();
                
                //Create DOM element that contains the tooltip
                gTooltip$ = $( '<div>' )
                    .addClass( 'a-D3LineChart-tooltip a-D3Tooltip' )
                    .appendTo( gChart$ )
                    .hide();

                //Declare the proper class according to chart type of display
                var focusClass = pOptions.display.toLowerCase() === 'stacked' ? '--fade-stacked' : '--fade';

                //Selectors for elements
                var chartSelection =  d3.select( gChart$.get(0) );
                var tooltipSelection = d3.select( gTooltip$.get(0) );


                /*
                 * Assign on enter effect to point in chart
                 * @param {Object} object DOM element
                 *
                 */
                function _pointEnterEvent( object ){
                    //On mouse hover on a point, hide the tooltip and assign this element as the current hovered point
                    gTooltip$.stop().fadeIn( pOptions.transitions ? 100 : 0 );
                    gHoveredPoint = object;
                }

                /*
                 * Assign on focus effect to point in chart
                 * @param {Object} object DOM element
                 * @param {Object} d D3 element
                 * @param {Object} chartSelection D3 element
                 * @param {String} focusClass Class to assign on focus
                 */
                function _pointFocusEvent( object, d, focusClass ){
                    //On point focus, assign this element as the current focused point
                    //gFocusedPoint = $( object );

                    //Increment circle radius
                    d3.select( object )
                        .transition().duration( POINT_TRANSITION_DURATION )
                        .attr("r", d.$radius * CIRCLE_EXPANSION_FACTOR);

                    //Assign this series as the current series
                    gCurrentSeries = d.series;

                    //Assign the focus class to the line, area and point container to the current series
                    chartSelection
                        .selectAll( '.' + CHART_LINE_CLASS )
                        .sort(function (d) {
                            if (d.series !== gCurrentSeries) return -1;
                            else return 1;
                        })
                        .classed( CHART_LINE_CLASS + focusClass, function(d) {
                            return d.series !== gCurrentSeries;
                        });

                    chartSelection
                        .selectAll( '.' + CHART_AREA_CLASS )
                        .classed( CHART_AREA_CLASS + focusClass, function(d) {
                            return d.series !== gCurrentSeries;
                        });

                    chartSelection
                        .selectAll( '.' + CHART_POINT_CONTAINER_CLASS )
                        .sort(function (d) {
                            if (d.series !== gCurrentSeries) return -1;
                            else return 1;
                        })
                        .classed( CHART_POINT_CONTAINER_CLASS + focusClass, function(d) {
                            return d.series !== gCurrentSeries;
                        });
                }

                /*
                 * Assign on hover effect to point in chart
                 * @param {Object} object DOM element
                 * @param {Object} d D3 element
                 * @param {Object} tooltipSelection D3 element
                 * @param {String} focusClass Class to assign on focus
                 *
                 */
                function _pointOverEvent( object, d, focusClass ){
                    //Remove focus effect if there is a focused point
                    if( gFocusedPoint ){
                        gFocusedPoint.blur();
                    }

                    d3.select( object )
                        .transition().duration( POINT_TRANSITION_DURATION )
                        .attr("r", d.$radius * CIRCLE_EXPANSION_FACTOR);

                    gHoveredPoint = object;
                    gTooltipColor = window.getComputedStyle( object ).getPropertyValue( 'fill' );

                    tooltipSelection
                        .datum( d )
                        .call( gTooltipGenerator );

                    if ( !gTooltip$.is(':visible') ) {
                        gTooltip$.fadeIn();
                    }

                    gTooltip$.position({
                        my: 'left+20 center',
                        of: d3.event,
                        at: 'right center',
                        within: gRegion$,
                        collision: 'flip fit'
                    });
                }

                /*
                 * Assign leave effect on point in chart, hide tooltip and get radius back to its original size
                 * @param {Object} object DOM element
                 * @param {Object} d D3 element
                 *
                 */
                function _pointLeaveEvent( object, d ){
                    gHoveredPoint = null;
                    gTooltip$.stop().fadeOut( pOptions.transitions ? 100 : 0 );

                    d3.select( object )
                        .transition().duration( POINT_TRANSITION_DURATION )
                        .attr("r", d.$radius);
                }

                /*
                 * Assign on blur effect to point in chart, remove focus classes, hide tooltip and redefine global variables
                 * @param {Object} object DOM element
                 * @param {Object} d D3 object
                 * @param {Object} chartSelection D3 element
                 * @param {String} focusClass Class to assign on focus
                 * 
                 */
                function _pointBlurEvent( object, d, focusClass ){
                    //gFocusedPoint = null;
                    if ( !gHoveredPoint ) {
                        gTooltip$.stop().fadeOut( pOptions.transitions ? 100 : 0 );
                    }

                    chartSelection
                        .selectAll( '.'+CHART_LINE_CLASS )
                        .classed( CHART_LINE_CLASS + focusClass, false);

                    chartSelection
                        .selectAll( '.'+CHART_AREA_CLASS )
                        .classed( CHART_AREA_CLASS + focusClass, false);

                    chartSelection
                        .selectAll( '.'+CHART_POINT_CONTAINER_CLASS )
                        .classed( CHART_POINT_CONTAINER_CLASS + focusClass, false);

                    d3.select( object )
                        .transition().duration( POINT_TRANSITION_DURATION )
                        .attr("r", d.$radius);
                }

                //Bind event effects to the points in the graph
                gLineChart
                    .on( 'pointenter', function( d ) {
                        _pointEnterEvent(this);
                    })
                    .on( 'pointfocus', function( d ) {
                        _pointFocusEvent(this, d, focusClass);

                        /*
                         * Check if the current hovered point is different than the object that triggered this pointfocus event 
                         * or if the key down event was triggered, show the tooltip
                         */
                        if( this !== gHoveredPoint || gIsKeyDownTriggered ){
                            _showTooltip(this, tooltipSelection, d);
                        }
                    })
                    .on( 'pointover', function( d ) {
                        _pointOverEvent(this, d, focusClass);
                    })
                    .on( 'pointleave', function( d ) {
                        _pointLeaveEvent(this, d);
                    })
                    .on( 'pointblur', function( d ) {
                        _pointBlurEvent(this, d, focusClass);
                    });
            }

            /* 
             * Bind event handler to the apexrefresh event for the main region element.
             * Dynamic actions can then refresh the chart via the 'Refresh' action.
             *
             * We immediately trigger the event it to load the initial chart data.
             */
            gRegion$
                .on( "apexrefresh", _refresh )
                .trigger( "apexrefresh" );
        }

        /**
         * Calculates recommended height to preserve aspect ration
         * @return {Number} Recommended height 
         */
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

        /**
         * Render chart once everything is initialized in _init
         * 
         */
        function _draw( pData ) {
            /*
             * Renders the legend calculating the number of columns to show with the width that is being passed
             * @param {Number} width
             * 
             */
            function _renderLegend( width ){
                gAry.numberOfColumns( Math.max( Math.floor( width / LEGEND_COLUMN_WIDTH ), 1 ) );

                d3.select( gLegend$.get(0) )
                    .datum( gSeries )
                    .call( gAry )
                    .selectAll( '.a-D3ChartLegend-item' )
                    .each(function (d, i) {
                        d3.select( this )
                            .selectAll( '.a-D3ChartLegend-item-color' )
                            .each(function() {
                                var self = d3.select( this );
                                var colorClass = self.attr( 'class' ).match(/u-Color-\d+-BG--bg/g) || [];
                                for (var i = colorClass.length - 1; i >= 0; i--) {
                                    self.classed( colorClass[i], false );
                                };
                                self.classed( 'u-Color-' + gClassScale( d.series ) + '-BG--bg', true );
                            })
                    });
            }


            //Create reference copy of pData
            gData = pData;

            //Create color mapping object if the data sent have colors information
            gColorMapping = {};
            if( gData ){
                if ( gData.colors ) {
                    for (var i = gData.colors.length - 1; i >= 0; i--) {
                        gColorMapping[ gData.colors[i].series ] = gData.colors[i].color;
                    };
                }
            }

            //Determine width and threshold of the char according to the window width
            var w = gChart$.width();
            var thresholdW = ( pOptions.thresholdOf === 'WINDOW' ) ? $( window ).width() : gChart$.width();
            
            gLineChart.width( w )
                        .display( pOptions.display.toLowerCase() );

            var thresholdDefault = pOptions.threshold || 480;

            //Set automatic ticks for the Y Axis of the chart 
            //if the threshold set by the attribute sent is bigger than the threshold that the window can hold and the
            //responsive behavior is set from the responsive attribute
            if ( thresholdW < thresholdDefault && pOptions.responsive ) {
                gLineChart.yAxis({
                    ticks: 'auto'
                });
            }

            //Assign a proper height to the line chart that corresponds to a certain aspect ratio
            gLineChart
                .height( _recommendedHeight() );

            //Filter data to get array of the series that gData has
            gSeries = _getSeriesData(gData.data);

            //Create and render chart
            var chart = d3.select( gChart$.get(0) )
                .datum( gData.data )
                .call( gLineChart );

            //Assign theme roller classes to chart
            _assignThemeRollerClasses(chart);

            if ( pOptions.showLegend ) {
                _renderLegend(w);
            }

            gSeriesSelection = d3.select( gChart$.get(0) )
                                .selectAll( '.' + CHART_POINT_CONTAINER_CLASS );
            gObjectIndex = 0;

            if ( !gHasHookedEvents ) {
                _addKeyBoardSupport();
                //If current browser is Internet Explorer
                if ( IS_IE ) {
                    $( 'circle', gChart$ )
                        .on( 'focus', function(){
                            gLineChart.on( 'pointfocus' ).call( this, d3.select( this ).datum() );
                        })
                        .on( 'blur', function(){
                            console.log('blur');
                            gLineChart.on( 'pointblur' ).call( this, d3.select( this ).datum() );
                        });
                }
            }
        }

        /**
          * Executes apex server plugin functionalities
          * 
          */
        function _refresh() {
                server.plugin( gOptions.ajaxIdentifier,
                {
                    pageItems: gOptions.pageItems
                }, {
                    refreshObject: gRegion$,
                    success:       _draw,
                    loadingIndicator:         gChart$,
                    loadingIndicatorPosition: "append"
                });

        }
        _init( pRegionId, pOptions );
    };

})( apex.util, apex.server, apex.jQuery, d3 );
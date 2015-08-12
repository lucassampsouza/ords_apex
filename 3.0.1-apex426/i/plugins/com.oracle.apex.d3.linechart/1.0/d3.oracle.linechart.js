(function(d3){
	!d3.oracle && (d3.oracle = {});
	//Component constants
	var TICK_FACTOR_X = 1;
	var TICK_FACTOR_Y = 1.1;
	var X_TICK_SPACING = 10;
	var Y_TICK_SPACING = 25;
	var MAX_TIME_DIFFERENCE = 200;
	var CSS_CLASS_PREFIX = 'a-D3LineChart';

    function transitionEndSignaler() {
        var queued = 0;
        var callback;
        return {
            callback : function( cb ) {
                callback = cb;
            },
            add : function() {
                queued++;
            },
            remove : function(){
                if ( --queued === 0 && callback ) {
                    callback();
                }
            }
        };
    }

	d3.oracle.linechart = function() {
		var dispatch = d3.dispatch( 'pointenter', 'pointover', 'pointleave', 'pointclick', 'pointfocus', 'pointblur', 'chartfocus', 'chartblur', 'transitionend' ),
			margin = { top: 10, left: 'auto', right: 20, bottom: 'auto' },
			width = 1000,
			height = 400,

			// Variable declarations and default values settings
			xAxis = {
				display: true,
				title: 'Interest',
				formatter: function(v) { return v; },
				ticksInterval: 'auto',
				ticksIntervalDefault: d3.time.day,
				ticksIntervalStep: 3,
                ticks : null,
                domain: null
			},
			yAxis = {
				display: true,
				title: 'Money',
				formatter: d3.oracle.fnf(),
                ticks: null,
                domain: null
			},

			// Display attrs
			display = 'overlap',
			stackLayout = d3.layout.stack(),

			xScaleCopy,
            xScaleOld,
            yScaleOld,

			dotRadius = {
				max: 3.5,
				min: 1,
				size: 3.5,
				spacing: 0.6
			},

            chart = {
                mode: 'normal' // normal|stream
            },

			formattedData,

			changeXScale = false,

			xFormatter = null,

			heightMode = 'chart',
			
			lineInterpolation = 'linear',

			timeData = false,
			
			showXTicks = true,
			
			showYTicks = true,

			xScale = timeData ? d3.time.scale() : d3.scale.linear(),
			yScale = d3.scale.linear(),

			accessors = {
				x : function (d) {
					return timeData ? new Date(d.x) : parseFloat(d.x);
				},
				y : function (d) {
					return d.y;
				},
				series : function (d) {
					return d.series;
				},
				color : function (d) {
					return d.color;
				},
				key : null
			},

			sortPoints = {
				sortX: timeData
			},

			showAxis = {
				showXAxis: true,
				showYAxis: true
			},

			setters = {
				y : function (d, y) {
					d.y = y;
				}
			},

			transitions = {
				enable: true,
				smoothing: 'cubic-in-out',
				duration: 1000
			};

		//Handle IE
		function _detach( bbox ) {
            return {
                x : bbox.x,
                y : bbox.y,
                width : bbox.width,
                height : bbox.height
            };
        }

		//Function that adds spacing to axes
		function _transformDomain(d, axis){
			if( axis == 'x' ){
				return [d[0], d[1]];
			}else{
				if( d[0] < 0 && d[1] < 0 )
					return[ d[0] * TICK_FACTOR_Y, 0 ];
				else if ( d[0] > 0 && d[1] > 0 )
					return[ 0, d[1] * TICK_FACTOR_Y ];
				else
					return [d[0] * TICK_FACTOR_Y, d[1] * TICK_FACTOR_Y];
			}	
		}

		//Recursive function to find the corresponding function to divide the data as well as the time difference between each data point
		function _getMinimumTimeScaleDifference(timeDifference, divideBy, initialDate, finalDate){
			if( timeDifference <= MAX_TIME_DIFFERENCE ){
				return {'function': divideBy, 'difference': Math.round(timeDifference)};
			}
			switch( divideBy ){
				case d3.time.minute:
					return _getMinimumTimeScaleDifference(timeDifference / 60, d3.time.hour, initialDate, finalDate);
				break;
				case d3.time.hour:
					return _getMinimumTimeScaleDifference(timeDifference / 60, d3.time.day, initialDate, finalDate);
				break;
				case d3.time.day:
					return _getMinimumTimeScaleDifference(timeDifference / 24, d3.time.week, initialDate, finalDate);
				break;
				case d3.time.week:
					return _getMinimumTimeScaleDifference(timeDifference / 7, d3.time.month, initialDate, finalDate);
				break;
				case d3.time.month:
					var monthDifference;
				    monthDifference = (finalDate.getFullYear() - initialDate.getFullYear()) * 12;
				    monthDifference -= initialDate.getMonth() + 1;
				    monthDifference += finalDate.getMonth();
				    return _getMinimumTimeScaleDifference(monthDifference <= 0 ? 0 : monthDifference, d3.time.year, initialDate, finalDate);
				break;
				case d3.time.year:
					return _getMinimumTimeScaleDifference(finalDate.getFullYear() - initialDate.getFullYear(), d3.time.year, initialDate, finalDate);
				break;
				default:
					return {'function': divideBy, 'difference': Math.round(finalDate.getFullYear() - initialDate.getFullYear())};
			}
		}

		//Function to order the X numeric values of the data set
		function _sortX(element) {
			element.points.sort(function(a,b) { return parseFloat(a.x) - parseFloat(b.x) });
		}

		//Function to order the X date values of the data set
		function _sortXDates(element) {
			element.points.sort(function(a,b) { return parseFloat(accessors.x(a).getTime()) - parseFloat(accessors.x(b).getTime()); });
		}

		function _stackAccessorScale(d){
			return yScale(d.y0);
		}

		function _stackAccessor(d){
			return d.y0;
		}

		//Function that returns the X value depending on the scale set for X
		function _x (d, i, j) {
			return changeXScale ? xScaleCopy( accessors.x(d) ) : xScale( accessors.x(d) );	
		}

        function _xGetter ( scale ) {
            return function () {
                return scale( accessors.x.apply( this, arguments ) );
            };
        }
        function _yGetter ( scale ) {
            return function () {
                return scale( accessors.y.apply( this, arguments ) + ( display === 'stacked' ? _stackAccessor.apply( this, arguments ) : 0 ) );
            };
        }

        function _stackGetter ( scale ) {
            return function () {
                return scale( _stackAccessor.apply( this, arguments ) );
            };
        }

		//Function that returns the Y value depending on the scale set for Y
		function _y (d, i, j) {
			if ( display == 'stacked'){
				return yScale( accessors.y(d) + _stackAccessor(d) );
			}else{
				return yScale( accessors.y(d) );
			}
		}

		function _errorLog(e){
			throw "Insufficient data to handle.";
		}

		//Function that renders the chart components
		function exports ( _selection ) {
			_selection.each(function( data ) {
				//Depending on the data that the X Axis handles assign a scale
				xScale = timeData ? d3.time.scale() : d3.scale.linear();
				var self = d3.select( this );
                var ts = transitionEndSignaler();
                ts.callback(function(){
                    dispatch.transitionend.apply( self[0][0] );
                });
                function tsAdd() {
                    ts.add.apply( this, arguments );
                };
                function tsRem() {
                    ts.remove.apply( this, arguments );
                };

				var chartW;
				var chartH;

				var actualMargin = {};
				for ( var k in margin ) {
					if ( margin[k] == 'auto' ) {
						actualMargin[k] = 10;
					} else {
						actualMargin[k] = margin[k];
					}
				}

				var iHeight = height;
                var jql = oracle.jql()
                    .select( [function(rows){ return rows; }, 'points'] )
                    .from(data)
                    .group_by( [accessors.series], 'series' );
				formattedData = jql();

				//Copy of data for future usage
				var formattedDataLine = jql();

				var seriesLength = formattedData.length;
                var yDomain;
                var xDomain;
				if ( display == 'stacked' ){
			    	stackLayout
						.values( function(d) { return d.points; } )
						.x( accessors.x )
						.y( accessors.y );
					
					try {
					   	stackLayout(formattedData);
						stackLayout(formattedDataLine);
					}
					catch (e) {
					   _errorLog(e);
					}

					var maxY = d3.max( formattedData, 
						function(s) { 
							return d3.max(s.points, 
								function(d) { 
									return accessors.y(d) + (_stackAccessor(d) || 0); 
								}
							); 
						}
					);
					var minY = d3.min( formattedData, 
						function(s) { 
							return d3.min(s.points, 
								function(d) { 
									return accessors.y(d) + (_stackAccessor(d) || 0); 
								}
							); 
						}
					);

                    yDomain = yAxis.domain || _transformDomain([minY, maxY], 'y');
			    } else {
                    yDomain = yAxis.domain || _transformDomain(d3.extent( data, accessors.y ), 'y');
                }

				
				xDomain = xAxis.domain || ( timeData ? d3.extent( data, accessors.x ): _transformDomain( d3.extent( data, accessors.x ), 'x' ) );

				xScale.domain( xDomain );
				yScale.domain( yDomain );

				var svg = self.select( '.' + CSS_CLASS_PREFIX + '-svg' );
				if ( svg.empty() ) {
					svg = self.append( 'svg' )
						.classed( '' + CSS_CLASS_PREFIX + '-svg', true )
						.on( 'focus', function (d) { dispatch.chartfocus.apply( this, arguments ); } )
						.on( 'blur',  function (d) { dispatch.chartblur.apply( this, arguments ); } )
						.attr({
							width: width,
							height: height
						});
				}

				//Store old data for future usage to handle transitions
				var oldData = svg.selectAll( '.' + CSS_CLASS_PREFIX + '-line' ).data();
				
				// For proper transition handling:
				// Complete the dataset with less elements to match the length of the dataset with more elements by adding copies of the last element in the dataset with less elements
				if( oldData.length > 0 ){
					formattedDataLine.forEach(function (element, index, array){
						if( index <= oldData.length - 1 ){
							var elementLength = element.points.length;
							var oldDataLength = oldData[index].points.length;
							if( elementLength > oldDataLength ){
								for( i = oldDataLength; i < elementLength; i++ )
									oldData[index].points.push( oldData[index].points[ oldDataLength - 1 ] );
							}else{
								for( i = elementLength; i < oldDataLength; i++ )
									formattedDataLine[index].points.push( formattedDataLine[index].points[ elementLength - 1 ] );
							}
						}
					});
				}

				function _rescale () {
					chartW = width - actualMargin.left - actualMargin.right;
					if ( heightMode === 'chart' ) {
						chartH = iHeight - actualMargin.top - actualMargin.bottom;
					} else {
						// The "height" setting will be used for the chartH. The height of the svg container will be that, plus the margins
						chartH = height;
						iHeight = height + actualMargin.top + actualMargin.bottom;
					}
					
					//A flag is used to handle the scales for proper transition effects, if changeXScale is true set the range that uses the copy of the xScale
					changeXScale ? xScaleCopy.range( [0, chartW] ) : null; 
					
					xScale.range( [0, chartW] );
					yScale.range( [chartH, 0] );	
				};
				_rescale();

				if ( margin.left == 'auto' && yAxis.display ) {
					// Must compute required width for axis ticks + axis title
					_drawVAxis( true );
					var maxTickWidth = 0;
					vAxisArea.selectAll( '.tick text' )
						.each(function() {
							maxTickWidth = Math.max( maxTickWidth, _detach(this.getBBox()).width );
						});
					var titleHeight = 0;
					var hTitle = vAxisArea.select( '.' + CSS_CLASS_PREFIX + '-axis-title' );
					if ( !hTitle.empty() ) {
						titleHeight = _detach(hTitle[0][0].getBBox()).height;
					}
					actualMargin.left = ( maxTickWidth + 15 ) + ( titleHeight > 0 ? ( titleHeight + 10 ) : 0 );
					_rescale();
					vAxisArea.remove();
				} 

				var mustRotateH = false;
				var mustRotateDegrees = -45;
				if ( margin.bottom == 'auto' && xAxis.display ) {
					// Must compute required width for axis ticks + axis title
					_drawHAxis( true );
					var maxTickHeight = 0;
					var bboxes = [];
					hAxisArea.selectAll( '.tick text' )
						.each(function() {
							maxTickHeight = Math.max( maxTickHeight, _detach(this.getBBox()).height );
						});
					maxTickHeight += 5;

					hAxisArea.selectAll( '.tick' )
						.each(function( d ) {
							var box = _detach(this.getBBox());
							var innerBox = _detach(d3.select(this).select('text')[0][0].getBBox());
							box.height = innerBox.height;
							box.width = innerBox.width;
							box.x = ( xScale )( d ) - box.width / 2;
							bboxes.push( box );
						});

					for ( var i = 1; i < bboxes.length; i++ ) {
						if ( ( bboxes[i - 1].x + bboxes[i - 1].width + 5) > bboxes[i].x ) {
							// Collision on labels, must rotate 45 degrees
							hAxisArea.remove();
							_drawHAxis( true, mustRotateH = true );
							maxTickHeight = d3.max( bboxes, function (d) { return d.width; } ) || 0;
							maxTickHeight = (maxTickHeight + bboxes[i].height) * Math.sin( Math.PI / 4 ) + 5;
							
							// Check for rotated collision
							for (var i = 0; i < bboxes.length; i++) {
								// Now x refers to the position of the top right corner of the bbox.
								bboxes[i].x = bboxes[i].x + bboxes[i].width / 2;
								if ( i > 0 ) {
									// Check collision
									if ( bboxes[i - 1].x + bboxes[i - 1].height * Math.sqrt(2) > bboxes[i].x ) {
										// Collision on labels, again. Must rotate 90 degrees
										hAxisArea.remove();
										_drawHAxis( true, mustRotateH = true, mustRotateDegrees = -90 );
										maxTickHeight = (d3.max( bboxes, function (d) { return d.width; } ) || 0) + 10;

										break;
									}
								}
							};

							break;
						}
					};
					var titleHeight = 0;
					var hTitle = hAxisArea.select( '.' + CSS_CLASS_PREFIX + '-axis-title' );
					if ( !hTitle.empty() ) {
						titleHeight = _detach(hTitle[0][0].getBBox()).height;
					}
					actualMargin.bottom = ( maxTickHeight ) + ( titleHeight > 0 ? ( titleHeight + 2.5 ) : 0 ) + 10;
					_rescale();
					hAxisArea.remove();
				} 
				
				// Now scaling is OK, we should draw the axes properly
				_drawVAxis( false );
				_drawHAxis( false, mustRotateH, mustRotateDegrees );

				( transitions.enable ? svg.transition().duration( transitions.duration )
                    .ease( transitions.smoothing).each( tsAdd).each( 'end.ts', tsRem ) : svg ).attr({
					width: width,
					height: iHeight
				});

				// Draw horizontal axis
				var hAxisArea;
				var hAxisLine;
				var hAxisGenerator;
				function _drawHAxis( staged, rotate, rotateDeg ) {
					( rotateDeg === undefined ) && ( rotateDeg = -45 );
					hAxisArea = svg.select( '.' + CSS_CLASS_PREFIX + '-axis--h' );
					
					if ( xAxis.display ) {
						if ( hAxisArea.empty()  || staged ) {
							hAxisArea = svg.append( 'g' )
								.classed( CSS_CLASS_PREFIX + '-axis', true )
								.classed( CSS_CLASS_PREFIX + '-axis--h', true )
								.attr({
									transform: 'translate(' + actualMargin.left + ',' + (actualMargin.top + chartH) + ')',
									width: chartW,
									height: actualMargin.bottom
								});
						}
						hAxisArea
							.classed( CSS_CLASS_PREFIX + '-axis--staging', staged );

						var hAxisAreaT = hAxisArea;
						if ( transitions.enable && !staged ) {
							hAxisAreaT = hAxisArea
								.transition()
								.duration( transitions.duration )
                                .ease( transitions.smoothing )
                                .each( tsAdd).each( 'end.ts', tsRem);
						}

						if ( showXTicks ){
							hAxisGenerator = d3.svg.axis()
								.orient('bottom')
								.scale( xScale )
								.tickFormat( d3.functor(xAxis.formatter) )
								.tickSize( showXTicks ? -chartH : 0 );

							if ( timeData && !xAxis.ticks ) {
								var timeDifferenceSeconds = Math.round(Math.abs(xDomain[1].getTime() - xDomain[0].getTime()) / 1000);
								
								if ( xAxis.ticksInterval == 'auto' ) {
									var minimumTimeDifference = _getMinimumTimeScaleDifference(timeDifferenceSeconds, d3.time.minute, xDomain[0], xDomain[1]);
									var tickSeparation = Math.round( minimumTimeDifference.difference / Math.floor( chartW / X_TICK_SPACING ));
									tickSeparation <= 0 ? tickSeparation = 1 : null;
									hAxisGenerator.tickValues(minimumTimeDifference.function.range(xDomain[0], xDomain[1]).filter(function(d, i) { return !(i % tickSeparation); }));
								} else if( xAxis.ticksInterval != 'auto' ){
									hAxisGenerator.ticks( xAxis.ticksInterval, xAxis.ticksIntervalStep );
								}
							} else if ( xAxis.ticks ) {
                                hAxisGenerator.ticks.apply( hAxisGenerator, xAxis.ticks );
                            }

							hAxisAreaT
								.attr({
									transform: 'translate(' + actualMargin.left + ',' + (actualMargin.top + chartH) + ')',
									width: chartW,
									height: actualMargin.bottom
								})
								.call(
									hAxisGenerator
								);
						}

						if ( rotate ) {
							hAxisAreaT.selectAll( '.tick text' )
								.style( 'text-anchor', 'end' )
								.attr( 'transform', function() {
									return ( rotateDeg == -45 ) ? 'translate(' + ( -_detach(this.getBBox()).height * 0.6 ) + ',8.5) rotate(' + rotateDeg + ')' : 'translate(' + ( -_detach(this.getBBox()).height * 0.75 ) + ',8) rotate(' + rotateDeg + ')';
								} )
						} else {
							hAxisAreaT.selectAll( '.tick text' )
								.style( 'text-anchor', 'middle' )
								.attr( 'transform', 'translate(0, 8.5) rotate(0)' )
						}

						var hAxisTitle = hAxisArea.select( '.' + CSS_CLASS_PREFIX + '-axis-title' );
						if ( xAxis.title ) {
							if ( hAxisTitle.empty() ) {
								hAxisTitle = hAxisArea.append( 'text' )
									.style({
										'text-anchor' : 'middle'
									})
									.attr({
										'transform' : 'translate(' + (chartW / 2) + ',' + (actualMargin.bottom - 5) + ')',
										'opacity' : 0
									})
									.classed( CSS_CLASS_PREFIX + '-axis-title', true );
							}
							hAxisTitle
								.text( xAxis.title );
							
							var hAxisTitleT = hAxisTitle;
							if ( transitions.enable && !staged ) {
								hAxisTitleT = hAxisTitle.transition()
									.duration( transitions.duration )
                                    .ease( transitions.smoothing )
                                    .each( tsAdd).each( 'end.ts', tsRem);
							}
							hAxisTitleT.attr({
								'transform' : 'translate(' + (chartW / 2) + ',' + (actualMargin.bottom - 5) + ')',
								'opacity' : staged ? 0 : 1
							});
						} else {
							if ( transitions.enable && !staged ) {
								hAxisTitle.transition()
									.duration( transitions.duration )
                                    .ease( transitions.smoothing )
									.attr({
										'opacity' : 0
									})
									.each( 'end', function() {
										d3.select( this ).remove();
									})
                                    .each( tsAdd).each( 'end.ts', tsRem);
							} else {
								hAxisTitle.remove();
							}
						}
					} else {
						if ( transitions.enable  && !staged ) {
							hAxisArea
								.transition()
                                .ease( transitions.smoothing )
								.duration( transitions.duration )
								.attr({
									'opacity' : 0
								})
								.each( 'end', function() {
									hAxisArea
										.attr({
											'opacity' : 1
										})
										.html('');
								})
                                .each( tsAdd).each( 'end.ts', tsRem);
						} else {
							hAxisArea.html('');
						}
					}
				}

				// Draw vertical axis 
				var vAxisArea;
				function _drawVAxis( staged ) {
					vAxisArea = svg.select( '.' + CSS_CLASS_PREFIX + '-axis--v' );
					if ( yAxis.display ) {
						if ( vAxisArea.empty() || staged ) {
							vAxisArea = svg.append( 'g' )
								.classed( CSS_CLASS_PREFIX + '-axis', true )
								.classed( CSS_CLASS_PREFIX + '-axis--v', true )
								.attr({
									width: actualMargin.left,
									height: chartH,
									transform: 'translate(' + actualMargin.left +',' + actualMargin.top + ')'
								});
						}
						vAxisArea
							.classed( CSS_CLASS_PREFIX + '-axis--staging', staged );
						if ( showYTicks ){
							var vAxisAreaT = vAxisArea;
							if ( transitions.enable && !staged ) {
								vAxisAreaT = vAxisArea
									.transition()
                                    .ease( transitions.smoothing )
									.duration( transitions.duration )
                                    .each( tsAdd).each( 'end.ts', tsRem);
							}
							vAxisAreaT
								.attr({
									width: actualMargin.left,
									height: chartH,
									transform: 'translate(' + actualMargin.left +',' + actualMargin.top + ')'
								});

                            var yAxisGenerator = d3.svg.axis()
                                .orient( 'left' )
                                .scale( yScale );

							if( yAxis.ticks === 'auto' ) {
                                yAxisGenerator
                                    .tickFormat( d3.functor(yAxis.formatter) )
                                    .tickSize( showYTicks ? -chartW : 0 )
                                    .ticks(Math.floor( chartH / Y_TICK_SPACING ))
							} else if ( yAxis.ticks ) {
                                yAxisGenerator.ticks.apply( yAxisGenerator, yAxis.ticks )
                            } else {
                                yAxisGenerator
                                    .tickFormat( d3.functor(yAxis.formatter) )
                                    .tickSize( showYTicks ? -chartW : 0 );
							}

                            vAxisAreaT.call( yAxisGenerator );
								
						}
						
						var vAxisTitle = vAxisArea.select( '.' + CSS_CLASS_PREFIX + '-axis-title' );
						if ( yAxis.title ) {
							if ( vAxisTitle.empty() ) {
								vAxisTitle = vAxisArea.append( 'text' )
									.style({
										'text-anchor' : 'middle'
									})
									.attr({
										'opacity' : 0,
										'transform' : 'translate(' + ( -1 * (actualMargin.left - 20)) + ',' + (chartH / 2) + ') rotate(-90)'
									})
									.classed( CSS_CLASS_PREFIX + '-axis-title', true );
							}
							vAxisTitle
								.text( yAxis.title );

							vAxisArea.selectAll( '.tick text' )
								.attr( 'transform', function() {
									return 'translate(' + ( -_detach(this.getBBox()).width * 0.2 ) + ', 0)'
								})
							
							var vAxisTitleT = vAxisTitle;
							if ( transitions.enable && !staged ) {
								vAxisTitleT = vAxisTitle.transition()
                                    .ease( transitions.smoothing )
									.duration( transitions.duration )
                                    .each( tsAdd).each( 'end.ts', tsRem);
							}
							vAxisTitleT.attr({
								'transform' : 'translate(' + ( -1 * (actualMargin.left - 20)) + ',' + (chartH / 2) + ') rotate(-90)',
								'opacity' : staged ? 0 : 1
							});
						} else {
							if ( transitions.enable && !staged ) {
								vAxisTitle.transition()
                                    .ease( transitions.smoothing )
									.duration( transitions.duration )
									.attr({
										'opacity' : 0
									})
									.each( 'end', function() {
										d3.select( this ).remove();
									})
                                    .each( tsAdd).each( 'end.ts', tsRem);
							} else {
								vAxisTitle.remove();
							}
						}
					} else {
						if ( transitions.enable && !staged ) {
							vAxisArea
								.transition()
                                .ease( transitions.smoothing )
								.duration( transitions.duration )
								.attr({
									'opacity' : 0
								})
								.each( 'end', function() {
									vAxisArea
										.attr({
											'opacity' : 1
										})
										.html('');
								} )
                                .each( tsAdd).each( 'end.ts', tsRem);
						} else {
							vAxisArea.html('');
						}
					}
				}

				var chartArea = svg.select( '.' + CSS_CLASS_PREFIX + '-chartArea' );
				if ( chartArea.empty() ) {
					chartArea = svg.append( 'g' )
						.classed( CSS_CLASS_PREFIX + '-chartArea', true )
						.attr({
							width: chartW,
							height: chartH,
							transform: 'translate(' + actualMargin.left + ',' + actualMargin.top + ')'
						});
				}

				( transitions.enable ? chartArea.transition().duration( transitions.duration )
                    .ease( transitions.smoothing ).each( tsAdd).each( 'end.ts', tsRem) : chartArea ).attr({
					width: chartW,
					height: chartH,
					transform: 'translate(' + actualMargin.left + ',' + actualMargin.top + ')'
				});

                function _draw( dataSet, scales, doTransitions, offset) {
                    scales = scales || {};
                    scales.x = scales.x || xScale;
                    scales.y = scales.y || yScale;
                    offset = offset || {};
                    offset.x = offset.x || 0;
                    offset.y = offset.y || 0;

                    // Create the container for all areas
                    var areaContainerAll = chartArea.select('.' + CSS_CLASS_PREFIX + '-areaContainerAll');
                    if ( areaContainerAll.empty() ) {
                        areaContainerAll = chartArea
                            .append( 'svg' )
                            .classed( CSS_CLASS_PREFIX + '-areaContainerAll', true )
                            .attr({
                                width: chartW,
                                height: chartH
                            });
                    }
                    ( doTransitions ? areaContainerAll.transition().duration( transitions.duration )
                        .ease( transitions.smoothing ).each( tsAdd).each( 'end.ts', tsRem) : areaContainerAll ).attr({
                        width: chartW,
                        height: chartH
                    });

                    // Create the container for all lines
                    var lineContainerAll = chartArea.select('.' + CSS_CLASS_PREFIX + '-lineContainerAll');
                    if ( lineContainerAll.empty() ) {
                        lineContainerAll = chartArea
                            .append( 'svg' )
                            .classed( CSS_CLASS_PREFIX + '-lineContainerAll', true )
                            .attr({
                                width: chartW,
                                height: chartH
                            });
                    }
                    ( doTransitions ? lineContainerAll.transition().duration( transitions.duration )
                        .ease( transitions.smoothing ).each( tsAdd).each( 'end.ts', tsRem) : lineContainerAll ).attr({
                        width: chartW,
                        height: chartH
                    });

                    // Create the container for all points
                    var pointContainerAll = chartArea.select('.' + CSS_CLASS_PREFIX + '-pointContainerAll');
                    if ( pointContainerAll.empty() ) {
                        pointContainerAll = chartArea
                            .append( 'svg' )
                            .classed( CSS_CLASS_PREFIX + '-pointContainerAll', true );
                    }
                    ( doTransitions ? pointContainerAll.transition().duration( transitions.duration )
                        .ease( transitions.smoothing ).each( tsAdd).each( 'end.ts', tsRem) : pointContainerAll ).attr({
                        width: chartW,
                        height: chartH
                    });

                    // Perform the data joins for areas, point containers and lines. One of each per data series.
                    var areas = areaContainerAll.selectAll( '.' + CSS_CLASS_PREFIX + '-area' )
                        .data( dataSet, function(d){ return d.series; } );
                    var pointContainers = pointContainerAll.selectAll( '.' + CSS_CLASS_PREFIX + '-pointContainer' )
                        .data( dataSet, function(d){ return d.series; } );
                    var lines = lineContainerAll.selectAll( '.' + CSS_CLASS_PREFIX + '-line' )
                        .data( dataSet, function(d){ return d.series; } );

                    // Create x and y accessors using the specified scales
                    var xGet = _xGetter( scales.x );
                    var yGet = _yGetter( scales.y );

                    // Create the line generators. Entering generator is different to appropriately transition from the x axis.
                    var lineGenerator = d3.svg.line()
                        .x( xGet )
                        .y( yGet )
                        .interpolate( lineInterpolation );
                    var lineEnterGenerator = d3.svg.line()
                        .x( xGet )
                        .y( scales.y( 0 ) )
                        .interpolate( lineInterpolation );

                    // Newly-created areas
                    areas.enter()
                        .append( 'path' )
                        .classed( CSS_CLASS_PREFIX + '-area', true )
                        .attr({
                            'd' : display === 'stacked' ?
                                function(d) {
                                    return lineEnterGenerator( d.points );
                                } :
                                function(d) {
                                    var path = lineEnterGenerator( d.points );
                                    return 'M' + xGet( d.points[ d.points.length - 1 ] ) + ' ' + scales.y( 0 ) +
                                        'L' + xGet( d.points[ 0 ] ) + ' ' + scales.y( 0 ) +
                                        path.replace( 'M', 'L' ) + 'Z';
                                },
                            'fill-opacity' : 0
                        })
                        .style({
                            fill: accessors.color
                        });

                    // Newly-created lines
                    lines.enter()
                        .append( 'path' )
                        .classed( CSS_CLASS_PREFIX + '-line', true )
                        .attr({
                            'd': function( d ) {
                                return lineEnterGenerator( d.points );
                            },
                            'fill': 'none',
                            'stroke-width': 1,
                            'opacity': 0
                        })
                        .style({
                            stroke: accessors.color
                        });

                    // Newly-created point containers
                    pointContainers.enter()
                        .append( 'g' )
                        .classed( CSS_CLASS_PREFIX + '-pointContainer', true )
                        .attr( 'data-series', accessors.series );

                    // Create the data join for the actual points within each point container
                    var points = pointContainers.selectAll( '.' + CSS_CLASS_PREFIX + '-pointContainer-dot' )
                        .data( function(d) { return d.points; }, accessors.key || undefined );

                    // Create the missing points and bind the needed events
                    points.enter()
                        .append( 'circle' )
                        .classed( CSS_CLASS_PREFIX + '-pointContainer-dot', true)
                        .attr({
                            'r': 0,
                            'cx': xGet,
                            'cy': scales.y( 0 ),
                            'stroke-width': 0,
                            'fill-opacity': 0,
                            'tabindex': -1
                        })
                        .style({
                            fill: accessors.color,
                            stroke: accessors.color
                        })
                        .on( 'mouseenter', function () { dispatch.pointenter.apply( this, arguments ); } )
                        .on( 'focus', function () { dispatch.pointfocus.apply( this, arguments ); } )
                        .on( 'mousemove', function () { dispatch.pointover.apply( this, arguments ); } )
                        .on( 'mouseleave', function () { dispatch.pointleave.apply( this, arguments ); } )
                        .on( 'blur', function () { dispatch.pointblur.apply( this, arguments ); } )
                        .on( 'click', function () { dispatch.pointclick.apply( this, arguments ); } );

                    var dotRadiusCurrent;
                    if ( dotRadius.size == 'auto' ) {
                        dotRadiusCurrent = ( chartW / ( d3.max( dataSet, function(d) { return d.points.length; } ) || 0 ) ) || 0 * dotRadius.spacing;
                        dotRadiusCurrent > dotRadius.max ? dotRadiusCurrent = dotRadius.max : dotRadiusCurrent < dotRadius.min ? dotRadiusCurrent = dotRadius.min : null;
                    } else {
                        dotRadiusCurrent = dotRadius.size;
                    }
                    points.each(function( d ) {
                        d.$radius = dotRadiusCurrent;
                    });

                    // Set the T variables to either their normal values or the transition configurators.
                    var linesT = lines;
                    var areasT = areas;
                    var pointsT = points;
                    if ( doTransitions ) {
                        linesT = lines.transition().duration( transitions.duration )
                            .ease( transitions.smoothing ).each( tsAdd).each( 'end.ts', tsRem);
                        areasT = areas.transition().duration( transitions.duration )
                            .ease( transitions.smoothing ).each( tsAdd).each( 'end.ts', tsRem);
                        pointsT = points.transition().duration( transitions.duration )
                            .ease( transitions.smoothing ).each( tsAdd).each( 'end.ts', tsRem);
                    }

                    if ( display == 'stacked' ) {
                        var stackGet = _stackGetter( scales.y );
                        var areaGenerator = d3.svg.area()
                            .x( xGet )
                            .y0( stackGet )
                            .y1( yGet )
                            .interpolate( lineInterpolation );
                        areasT
                            .attr({
                                'd':
                                    function( d ) {
                                        var path = areaGenerator( d.points );
                                        return path;
                                    },
                                'fill-opacity': 0.3,
                                'transform' : 'translate(' + offset.x + ',' + offset.y + ')'
                            })
                            .style({
                                fill: accessors.color
                            });
                    } else {
                        areasT
                            .attr({
                                'd':
                                    function( d ) {
                                        var path = lineGenerator( d.points );
                                        //Return path's string to show an area that covers from the Y=0 value to the first Y value
                                        //and from the Y=0 value to the last Y value
                                        return 'M' + xGet( d.points[ d.points.length - 1 ] ) + ' ' + scales.y( 0 ) +
                                            'L' + xGet( d.points[ 0 ] ) + ' ' + scales.y( 0 ) +
                                            path.replace( 'M', 'L' ) + 'Z';
                                    },
                                'fill-opacity': 0.3,
                                'transform' : 'translate(' + offset.x + ',' + offset.y + ')'
                            })
                            .style({
                                fill: accessors.color
                            });
                    }


                    linesT
                        .attr({
                            'd': function( d ) {
                                return lineGenerator( d.points );
                            },
                            'stroke-width': 1,
                            'fill': 'none',
                            'opacity': 1,
                            'transform' : 'translate(' + offset.x + ',' + offset.y + ')'
                        })
                        .style({
                            stroke: accessors.color
                        });

                    pointsT
                        .attr({
                            'r': dotRadiusCurrent,
                            'cx': xGet,
                            'cy': yGet,
                            'stroke-width': 2,
                            'fill-opacity': 1,
                            'transform' : 'translate(' + offset.x + ',' + offset.y + ')'
                        })
                        .style({
                            fill: accessors.color,
                            stroke: accessors.color
                        });

                    if ( doTransitions ) {
                        lines.exit()
                            .transition()
                            .duration( transitions.duration )
                            .ease( transitions.smoothing )
                            .attr({
                                opacity : 0
                            })
                            .each( 'end', function(){ d3.select(this).remove(); } )
                            .each( tsAdd).each( 'end.ts', tsRem);
                        areas.exit()
                            .transition()
                            .duration( transitions.duration )
                            .ease( transitions.smoothing )
                            .attr({
                                'fill-opacity': 0
                            })
                            .each( 'end', function(){ d3.select(this).remove(); } )
                            .each( tsAdd).each( 'end.ts', tsRem);
                        pointContainers.exit()
                            .transition()
                            .duration( transitions.duration )
                            .ease( transitions.smoothing )
                            .attr({
                                opacity : 0
                            })
                            .each( 'end', function(){ d3.select(this).remove(); } )
                            .each( tsAdd).each( 'end.ts', tsRem);
                        points.exit()
                            .transition()
                            .duration( transitions.duration )
                            .ease( transitions.smoothing )
                            .attr({
                                opacity : 0
                            })
                            .each( 'end', function(){ d3.select(this).remove(); } )
                            .each( tsAdd).each( 'end.ts', tsRem);
                    } else {
                        lines.exit().remove();
                        areas.exit().remove();
                        pointContainers.exit().remove();
                        points.exit().remove();
                    }
                }

				function _drawCompleteLine( dataSet, oldData, transitionEnable ){

					//Add containers for elements
					var areaContainerAll = chartArea.select('.' + CSS_CLASS_PREFIX + '-areaContainerAll');
					if ( areaContainerAll.empty() ) {
						areaContainerAll = chartArea
							    	.append( 'svg' )
									.classed( CSS_CLASS_PREFIX + '-areaContainerAll', true )
									.attr({
										width: chartW,
										height: chartH
									});
					}

					( transitions.enable ? areaContainerAll.transition().ease( transitions.smoothing ).duration( transitions.duration ).each( tsAdd).each( 'end.ts', tsRem) : areaContainerAll ).attr({
						width: chartW,
						height: chartH
					});

					var lineContainerAll = chartArea.select('.' + CSS_CLASS_PREFIX + '-lineContainerAll');
					if ( lineContainerAll.empty() ) {
						lineContainerAll = chartArea
							    	.append( 'svg' )
									.classed( CSS_CLASS_PREFIX + '-lineContainerAll', true )
									.attr({
										width: chartW,
										height: chartH
									});
					}

					( transitions.enable ? lineContainerAll.transition().ease( transitions.smoothing ).duration( transitions.duration ).each( tsAdd).each( 'end.ts', tsRem) : lineContainerAll ).attr({
						width: chartW,
						height: chartH
					});

					var pointContainerAll = chartArea.select('.' + CSS_CLASS_PREFIX + '-pointContainerAll');
					if ( pointContainerAll.empty() ) {
						pointContainerAll = chartArea
							    	.append( 'g' )
									.classed( CSS_CLASS_PREFIX + '-pointContainerAll', true );
					}

					( transitions.enable ? pointContainerAll.transition().ease( transitions.smoothing ).duration( transitions.duration ).each( tsAdd).each( 'end.ts', tsRem) : pointContainerAll ).attr({
						width: chartW,
						height: chartH
					});

					var area = areaContainerAll.selectAll( '.' + CSS_CLASS_PREFIX + '-area' )
						.data( oldData ? dataSet : formattedDataLine, function(d){ return d.series; } );

					var pointContainer = pointContainerAll.selectAll('.' + CSS_CLASS_PREFIX + '-pointContainer')
						.data( dataSet, function(d){ return d.series; } );

					var lines = lineContainerAll.selectAll( '.' + CSS_CLASS_PREFIX + '-line' )
						.data( oldData ? dataSet : formattedDataLine, function(d){ return d.series; } );

					var line = d3.svg.line()
				    				.x( _x )
				    				.y( _y )
				    				.interpolate(lineInterpolation);
				    var lineEnter = d3.svg.line()
				    				.x( _x )
				    				.y(  yScale( 0 ) )
				    				.interpolate(lineInterpolation);
					
					//Add elements to containers		
					if( display == 'stacked' ){
						area.enter()
						.append( 'path' )
						.classed( CSS_CLASS_PREFIX + '-area', true )
						.attr({
							'd': function(d) {
								return lineEnter(d.points);
							},
							'fill-opacity': 0
						})
						.style({
							fill: accessors.color
						});
					}else{
						area.enter()
						.append( 'path' )
						.classed( CSS_CLASS_PREFIX + '-area', true )
						.attr({
							'd': function(d) {
								var path = lineEnter(d.points);
									return 'M' + _x(d.points[d.points.length-1]) + ' ' + yScale(0) +
										'L' + _x(d.points[0]) + ' ' + yScale(0) +  
										path.replace('M', 'L') + 'Z';
							},
							'fill-opacity': 0
						})
						.style({
							fill: accessors.color
						});
					}
					
						//hacer caso de que si es stacked que el area en el attr d regrese solo el path con la funcion lineEnter

					lines.enter()
						.append( 'path' )
						.classed( CSS_CLASS_PREFIX + '-line', true )
						.attr({
							'd': function(d) {
								return lineEnter(d.points);  
							},
							'fill': 'none',
							'stroke-width': 1,
							'opacity': 0
						})
						.style({
							stroke: accessors.color
						});

					pointContainer.enter()
						.append('g')
						.classed( CSS_CLASS_PREFIX + '-pointContainer', true)
						.attr('data-series', accessors.series);
					
					var points = pointContainer.selectAll('.' + CSS_CLASS_PREFIX + '-pointContainer-dot')
	        		.data( function(d) { return d.points; }, accessors.key || undefined );
	        		
	        		//Bind events to data points
	        		points.enter()
	        			.append("circle")
	        			.classed( CSS_CLASS_PREFIX + '-pointContainer-dot', true)
	        			.attr({
							'r': 0,
							'cx': _x,
							'cy': yScale( 0 ),
							'stroke-width': 0,
							'fill-opacity': 0,
							'tabindex': -1
						})
						.style({
							fill: accessors.color,
							stroke: accessors.color
						})
	        			.on( 'mouseenter', function (d) { dispatch.pointenter.apply( this, arguments ); } )
						.on( 'focus', function (d) { dispatch.pointfocus.apply( this, arguments ); } )

						.on( 'mousemove', function (d) { dispatch.pointover.apply( this, arguments ); } )

						.on( 'mouseleave', function (d) { dispatch.pointleave.apply( this, arguments ); } )
						.on( 'blur', function (d) { dispatch.pointblur.apply( this, arguments ); } )

						.on( 'click', function (d) { dispatch.pointclick.apply( this, arguments ); } );

					if ( dotRadius.size == 'auto' ){
						var dotRadiusCurrent = ( chartW / ( d3.max(dataSet, function(d) { return d.points.length;} ) || 0 ) ) || 0 * dotRadius.spacing;
						dotRadiusCurrent > dotRadius.max ? dotRadiusCurrent = dotRadius.max : dotRadiusCurrent < dotRadius.min ? dotRadiusCurrent = dotRadius.min : null;
						points.each(function(d){
							d.$radius = dotRadiusCurrent;
						});
					}else{
						var dotRadiusCurrent = dotRadius.size;
						points.each(function(d){
							d.$radius = dotRadiusCurrent;
						});
					}

					var linesT = lines;
					var areaT = area;
					var pointsT = points;
					if ( transitions.enable && transitionEnable ) {
						linesT = lines.transition()
                            .ease( transitions.smoothing )
							.duration( transitions.duration )
                            .each( tsAdd).each( 'end.ts', tsRem);
						areaT = area.transition()
                            .ease( transitions.smoothing )
							.duration( transitions.duration )
                            .each( tsAdd).each( 'end.ts', tsRem);
						pointsT = points.transition()
                            .ease( transitions.smoothing )
							.duration( transitions.duration )
                            .each( tsAdd).each( 'end.ts', tsRem);
					}

					if ( display == 'stacked' ){
						var d3area = d3.svg.area()
				          .interpolate(lineInterpolation)
				          .x( _x )
				          .y0(function (d) { return _stackAccessorScale(d); })
				          .y1( _y );
						areaT.attr({
							'd': 
							function(d) {
									var path = d3area(d.points);
									return path;
								},
							'fill-opacity': 0.3
						})
						.style({
							fill: accessors.color
						});
					}else{
						areaT.attr({
							'd': 
							function(d) {
									var path = line(d.points);
									//Return path's string to show an area that covers from the Y=0 value to the first Y value 
									//and from the Y=0 value to the last Y value
									return 'M' + _x(d.points[d.points.length-1]) + ' ' + yScale(0) +
										'L' + _x(d.points[0]) + ' ' + yScale(0) +  
										path.replace('M', 'L') + 'Z';
								},
							'fill-opacity': 0.3
						})
						.style({
							fill: accessors.color
						});
					}
					

					linesT.attr({
						'd': function(d) {
							return line(d.points); 
						},
						'stroke-width': 1,
						'fill': 'none',
						'opacity': 1
					})
					.style({
						stroke: accessors.color
					});

					pointsT.attr({
						'r': dotRadiusCurrent,
						'cx': _x,
						'cy': _y,
						'stroke-width': 2,
						'fill-opacity': 1
					})
					.style({
						fill: accessors.color,
						stroke: accessors.color
					});

					if ( transitions.enable ) {
						lines.exit()
							.transition()
                            .ease( transitions.smoothing )
							.duration( transitions.duration )
							.attr({
								opacity : 0
							})
							.each( 'end', function(){ d3.select(this).remove(); } )
                            .each( tsAdd).each( 'end.ts', tsRem);
						area.exit()
							.transition()
                            .ease( transitions.smoothing )
							.duration( transitions.duration )
							.attr({
								'fill-opacity': 0
							})
							.each( 'end', function(){ d3.select(this).remove(); } )
                            .each( tsAdd).each( 'end.ts', tsRem);
						pointContainer.exit()
							.transition()
                            .ease( transitions.smoothing )
							.duration( transitions.duration )
							.attr({
								opacity : 0
							})
							.each( 'end', function(){ d3.select(this).remove(); } )
                            .each( tsAdd).each( 'end.ts', tsRem);
						points.exit()
							.transition()
                            .ease( transitions.smoothing )
							.duration( transitions.duration )
							.attr({
								opacity : 0
							})
							.each( 'end', function(){ d3.select(this).remove(); } )
                            .each( tsAdd).each( 'end.ts', tsRem);
					} else {
						lines.exit().remove();
						area.exit().remove();
						pointContainer.exit().remove();
						points.exit().remove();
						//lineAxisX.exit().remove();
						//lineAxisY.exit().remove();
					}
            	}

                if ( timeData ) {
                    oldData.forEach( _sortXDates );
                    formattedData.forEach( _sortXDates );
                    formattedDataLine.forEach( _sortXDates );
                }

                if ( chart.mode === 'stream' ) {
                    xScaleOld = xScaleOld || xScale;
                    yScaleOld = yScaleOld || yScale;

                    // Draw the new data using the old scale with zero offsets and no transitions
                    _draw( formattedData, {x: xScaleOld, y: yScaleOld}, false );

                    // Draw the new data using the old scale with a new offset and conditional transitions
                    _draw( formattedData, {x: xScale, y: yScale}, transitions.enable );

                    xScaleOld = xScale.copy();
                    yScaleOld = yScale.copy();
                } else {
                    //To handle proper line transitions, first draw the line with the previous scale, the current data set again, and no transitions
                    _drawCompleteLine( oldData, true, false );
                    //Then draw the line with the new scale, the new data set(with formattedDataLine for the lines and areas) and with transitions
                    changeXScale = false;
                    _drawCompleteLine( formattedData, false, true );

                    //Create a copy of the new scale to be used and set the flag to use the new Scale to true
                    xScaleCopy = xScale.copy();
                    changeXScale = true;
                }
			});
		};

		function _getObjectSetterGetter ( obj ) {
			return (function ( prop, x ) {
				if ( x === undefined && prop === undefined) {
					return obj;
				} else if ( x === undefined && (typeof prop == 'string') ) {
					return obj[prop];
				} else if ( typeof prop == 'object' ) {
					for ( var k in prop ) {
						obj[k] = prop[k];
					}
				} else {
					obj[prop] = x;
				}
				return exports;
			});
		};

		exports.margin = _getObjectSetterGetter(margin);
		exports.dotRadius = _getObjectSetterGetter(dotRadius);
		exports.accessors = _getObjectSetterGetter(accessors);
		exports.sortPoints = _getObjectSetterGetter(sortPoints);
		exports.showAxis = _getObjectSetterGetter(showAxis);
		exports.transitions = _getObjectSetterGetter(transitions);
		exports.xAxis = _getObjectSetterGetter(xAxis);
        exports.yAxis = _getObjectSetterGetter(yAxis);
        exports.chart = _getObjectSetterGetter(chart);

		exports.width = function (x) {
			if ( x === undefined ) {
				return width;
			}
			width = x;
			return exports;
		};

		exports.height = function (x) {
			if ( x === undefined ) {
				return height;
			}
			height = x;
			return exports;
		};

		exports.timeData = function (x) {
			if ( x === undefined ) {
				return timeData;
			}
			timeData = x;
			return exports;
		};

		exports.xFormatter = function (x) {
			if ( x === undefined ) {
				return xFormatter;
			}
			xFormatter = d3.functor(x);
			return exports;
		};

		exports.lineInterpolation = function (x) {
			if ( x === undefined ) {
				return lineInterpolation;
			}
			lineInterpolation = x;
			return exports;
		};

		exports.heightMode = function (x) {
			if ( x === undefined ) {
				return heightMode;
			}
			heightMode = x;
			return exports;
		};

		exports.showXTicks = function (x) {
			if ( x === undefined ) {
				return showXTicks;
			}
			showXTicks = x;
			return exports;
		};

		exports.showYTicks = function (x) {
			if ( x === undefined ) {
				return showYTicks;
			}
			showYTicks = x;
			return exports;
		};

		exports.display = function (x) {
			if ( x === undefined ) {
				return display;
			}
			display = x;
			return exports;
		};

		d3.rebind(exports, dispatch, 'on');
		
		return exports;

	};
})(window.d3);
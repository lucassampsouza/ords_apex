/*
 * D3 Barchart Plugin
 * andlozan
 * 
 * This plugin is meant to replace the old Flot barchart plugin. For APEX, this is meant to be called from the APEX javascript wrapper 
 * in order to enable responsiveness, keyboard support and tooltips.
 * 
 */

(function(d3){
	!d3.oracle && (d3.oracle = {});
	// Component Constants
	var CSS_CLASS_PREFIX = 'a-D3BarChart';
	var HORIZONTAL_TICK_SPACING = 75;
	var VERTICAL_TICK_SPACING = 35;


    // IE doesn't let us manipulate a bounding box, so we have to detach it from the unmodifiable object.
    function _detach( bbox ) {
        return {
            x : bbox.x,
            y : bbox.y,
            width : bbox.width,
            height : bbox.height
        };
    }

	d3.oracle.barchart = function() {
		var dispatch = d3.dispatch( 'barenter', 'barover', 'barleave', 'barclick', 'barfocus', 'barblur', 'chartfocus', 'chartblur' ),
			margin = { top: 10, left: 100, right: 10, bottom: 35 },
			width = 500,
			height = 300,

			heightMode = 'chart', // or 'bars'
			
			orientation = 'vertical',
			
			// Display attrs
			display = 'side-by-side',
			stackLayout = d3.layout.stack(),

			// Axes
			xAxis = {
				display: true,
				title: '',
				formatter: function(v) { return v; },
				grid: true
			},
			yAxis = {
				display: true,
				title: '',
				formatter: d3.oracle.fnf(),
				grid: true,
				ticks: 'auto'
			},

			xScale = d3.scale.ordinal(),
			yScale = d3.scale.linear(),

			stackAttr = 'y0',
			series,

			accessors = {
				x : function (d) {
					return d.x;
				},
				y : function (d) {
					return Math.max(0, d.y);
				},
				series : function (d) {
					return d.series;
				},
				color : function (d) {
					return d.color;
				},
				key : null
			},
			setters = {
				y : function (d, y) {
					d.y = y;
				}
			},

			barSpacing = {
				inner: 0.5,
				outer: 0.1
			},

			transitions = {
				enable: true,
				smoothing: 'ease-in-out',
				duration: 1000
			};


		function realYAccesor (d) {
			return d.y;
		}

		function _stackAccessor ( d ) {
			return d[stackAttr];
		}

		function _x ( d, i ) {
			var j = series.indexOf( accessors.series.apply( this, arguments ) );
			if ( orientation === 'vertical' ) {
				switch ( display ) {
					case 'side-by-side':
						return xScale( accessors.x( d ) ) + ( xScale.rangeBand() / series.length ) * ( j + barSpacing.inner / 2 );
					default:
						// stacked and overlay
						return xScale( accessors.x( d ) );
				}
			} else if ( display === 'stacked' ) {
				// _stackAccessor should return y0;
				return yScale( _stackAccessor(  d) );
			}
			return 0;
		}

		function _y ( d, i ) {
			var j = series.indexOf( accessors.series.apply( this, arguments ) );
			if ( orientation === 'vertical' ) {
				switch (display) {
					case 'stacked':
						return yScale( accessors.y(d) + _stackAccessor(d) );
					default:
						// side-by-side and overlay
						return yScale( accessors.y(d) );
				}
			} else {
				switch (display) {
					case 'side-by-side':
						return xScale( accessors.x(d) ) + ( xScale.rangeBand() / series.length ) * ( j + barSpacing.inner / 2 );
					default:
						// stacked and overlay
						return xScale( accessors.x(d) );
				}
			}
		}

		function _width ( d ) {
			if (orientation === 'vertical') {
				switch (display) {
					case 'side-by-side':
						return xScale.rangeBand() / series.length * ( 1 - barSpacing.inner );
					default:
						// stacked and overlay
						return xScale.rangeBand();
				}
			} 
			return yScale( accessors.y(d) );
		}

		function _height ( d ) {
			if (orientation === 'vertical') {
				return yScale.range()[0] - yScale( accessors.y(d) );
			} 
			switch (display) {
				case 'side-by-side':
					return xScale.rangeBand() / series.length * ( 1 - barSpacing.inner );
				default:
					// stacked and overlay
					return xScale.rangeBand();
			}
		}

		function exports ( _selection ) {
			_selection.each(function( data ) {
				var self = d3.select( this );

				var actualMargin = {};
				for ( var k in margin ) {
					if ( margin[k] === 'auto' ) {
						actualMargin[k] = 10;
					} else {
						actualMargin[k] = margin[k];
					}
				}

				var iHeight = height;

				var chartW;
				var chartH;

				var isVertical = orientation === 'vertical';
				var xDomain = [];
				var currentX;
				for (var i = 0; i < data.length; i++) {
					currentX = accessors.x(data[i]);
					if ( xDomain.indexOf(currentX) < 0 ) {
						xDomain.push(currentX);
					}
				}

				var formattedData = oracle.jql()
					.select( [function(rows){ return rows; }, 'points'] )
					.from( data )
					.group_by( [accessors.series, 'series'] )();

				//series.length = formattedData.length;

				if ( display === 'stacked' ) {
					var stackCt = 1;
					while ( data[0][stackAttr] !== undefined ) {
						stackAttr = 'y' + (stackCt++);
					}

					var sl = null;
					for (var i = 0; i < formattedData.length; i++) {
						if ( sl === null ) {
							sl = formattedData[i].points.length;
						}
						if ( sl !== formattedData[i].points.length ) {
							throw 'Invalid data for stack';
						}
					}


					var categories = oracle.jql()
						.select( [function(){ return 1; }, 'dum'] )
						.from( data )
						.group_by( [accessors.x, 'x'] )();

					var categoriesMap = {};
					for (var i = categories.length - 1; i >= 0; i--) {
						categoriesMap[categories[i].x] = i;
					}

					for (var i = formattedData.length - 1; i >= 0; i--) {
						formattedData[i].points.sort( function ( d1, d2 ) { 
							return d3.ascending( categoriesMap[accessors.x( d1 )], categoriesMap[accessors.x( d2 )] );
						});
					}

					stackLayout
						.values( function(d) { return d.points; } )
						.x( accessors.x )
						.y( accessors.y )
						.out( function(d, y0, y) {
							d[stackAttr] = y0;
							setters.y( d, y );
						} );

					formattedData = stackLayout( formattedData );
				} 

				series = formattedData.map( function(d) { return d.series; } );

				xScale.domain( xDomain );
				yScale.domain( [0, 1.1 * d3.max( 
					formattedData, 
					function(s) { 
						return d3.max(s.points, function(d) { 
							return accessors.y(d) + (_stackAccessor(d) || 0); 
						}) 
					}
				)] );

				var svg = self.select( '.' + CSS_CLASS_PREFIX + '-svg' );
				if ( svg.empty() ) {
					svg = self.append( 'svg' )
						.classed( '' + CSS_CLASS_PREFIX + '-svg', true )
						.on( 'focus', function (d) { dispatch.chartfocus.apply( this, arguments ); } )
						.on( 'blur',  function (d) { dispatch.chartblur.apply( this, arguments ); } );
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
					if ( isVertical ) {
						xScale.rangeBands( [0, chartW], barSpacing.outer, barSpacing.outer );
						yScale.range( [chartH, 0] );
					} else {
						xScale.rangeBands( [0, chartH], barSpacing.outer, barSpacing.outer );
						yScale.range( [0, chartW] );
					}	
				}
				_rescale();


				if ( margin.left === 'auto' && ( isVertical ? yAxis.display : xAxis.display ) ) {
					// Must compute required width for axis ticks + axis title
					_drawVAxis( true );
					var maxTickWidth = 0;
					vAxisArea.selectAll( '.tick text' )
						.each(function() {
							maxTickWidth = Math.max( maxTickWidth, this.getBBox().width );
						});
					var titleHeight = 0;
					var hTitle = vAxisArea.select( '.' + CSS_CLASS_PREFIX + '-axis-title' );
					if ( !hTitle.empty() ) {
						titleHeight = hTitle[0][0].getBBox().height;
					}
					actualMargin.left = ( maxTickWidth + 15 ) + ( titleHeight > 0 ? ( titleHeight + 10 ) : 0 );
					_rescale();
					vAxisArea.remove();
				} 

				var mustRotateH = false;
				var mustRotateDegrees = -45;
				if ( margin.bottom === 'auto' && ( isVertical ? xAxis.display : yAxis.display ) ) {
					// Must compute required width for axis ticks + axis title
					_drawHAxis( true );
					var maxTickHeight = 0;
					var bboxes = [];
					hAxisArea.selectAll( '.tick text' )
						.each(function() {
							maxTickHeight = Math.max( maxTickHeight, this.getBBox().height );
						});
					maxTickHeight += 5;

					hAxisArea.selectAll( '.tick' )
						.each(function( d ) {
							var box = _detach( this.getBBox() );
							box.x = ( isVertical ? xScale : yScale )( d ) - box.width / 2;
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
							}

							break;
						}
					}
					var titleHeight = 0;
					var hTitle = hAxisArea.select( '.' + CSS_CLASS_PREFIX + '-axis-title' );
					if ( !hTitle.empty() ) {
						titleHeight = hTitle[0][0].getBBox().height;
					}
					actualMargin.bottom = ( maxTickHeight ) + ( titleHeight > 0 ? ( titleHeight + 2.5 ) : 0 );
					_rescale();
					hAxisArea.remove();
				} 
				// Now scaling is OK, we should draw the axes properly
				_drawVAxis( false );
				_drawHAxis( false, mustRotateH, mustRotateDegrees );

				_drawVGrid();
				_drawHGrid();

				( transitions.enable ? svg.transition().duration( transitions.duration ) : svg ).attr({
					width: width,
					height: iHeight
				});

				// Draw horizontal axis
				var hAxisArea;
				var hAxisGenerator;
				function _drawHAxis( staged, rotate, rotateDeg ) {
					( rotateDeg === undefined ) && ( rotateDeg = -45 );
					hAxisArea = svg.select( '.' + CSS_CLASS_PREFIX + '-axis--h' );
					if ( isVertical ? xAxis.display : yAxis.display ) {
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
								.duration( transitions.duration );
						}
						hAxisGenerator = d3.svg.axis()
							.orient('bottom')
							.scale( isVertical ? xScale : yScale )
							.tickFormat( isVertical ? xAxis.formatter : yAxis.formatter );

						if ( !isVertical && yAxis.ticks ) {
							if ( yAxis.ticks === 'auto' ) {
								hAxisGenerator.ticks( Math.max( Math.floor( chartW / HORIZONTAL_TICK_SPACING ), 2 ) );
							} else {
								hAxisGenerator.ticks( yAxis.ticks );
							}
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

						if ( rotate ) {
							hAxisAreaT.selectAll( '.tick text' )
								.style( 'text-anchor', 'end' )
								.attr( 'transform', function() {
                                    var tickHeight = this.getBBox().height;
									return ( rotateDeg === -45 ) ? 
                                        'translate(' + ( -tickHeight * 0.6 ) + ',2.5) rotate(' + rotateDeg + ')' :
                                        'translate(' + ( -tickHeight * 0.75 ) + ',8) rotate(' + rotateDeg + ')';
								} );
						} else {
							hAxisAreaT.selectAll( '.tick text' )
								.style( 'text-anchor', 'middle' )
								.attr( 'transform', 'translate(0,0) rotate(0)' );
						}

						var hAxisTitle = hAxisArea.select( '.' + CSS_CLASS_PREFIX + '-axis-title' );
						if ( isVertical ? xAxis.title : yAxis.title ) {
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
								.text( isVertical ? xAxis.title : yAxis.title );
							
							var hAxisTitleT = hAxisTitle;
							if ( transitions.enable && !staged ) {
								hAxisTitleT = hAxisTitle.transition()
									.duration( transitions.duration );
							}
							hAxisTitleT.attr({
								'transform' : 'translate(' + (chartW / 2) + ',' + (actualMargin.bottom - 5) + ')',
								'opacity' : staged ? 0 : 1
							});
						} else {
							if ( transitions.enable && !staged ) {
								hAxisTitle.transition()
									.duration( transitions.duration )
									.attr({
										'opacity' : 0
									})
									.each( 'end', function() {
										d3.select( this ).remove();
									});
							} else {
								hAxisTitle.remove();
							}
						}
					} else {
						if ( transitions.enable  && !staged ) {
							hAxisArea
								.transition()
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
								});
						} else {
							hAxisArea.html('');
						}
					}
				}
				var hGridArea;
				function _drawHGrid() {
					hGridArea = svg.select( '.' + CSS_CLASS_PREFIX + '-grid--h' );
					if ( hGridArea.empty()  ) {
						hGridArea = svg.append( 'g' )
							.classed( CSS_CLASS_PREFIX + '-grid', true )
							.classed( CSS_CLASS_PREFIX + '-grid--h', true )
							.attr({
								transform: 'translate(' + actualMargin.left + ',' + (actualMargin.top + chartH) + ')',
								width: chartW,
								height: actualMargin.bottom
							});
					}						
					if ( isVertical ? ( xAxis.display && xAxis.grid ) : ( yAxis.display && yAxis.grid ) ) {
						var hGridAreaT = hGridArea;
						if ( transitions.enable ) {
							hGridAreaT = hGridArea
								.transition()
								.duration( transitions.duration );
						}
						hGridAreaT
							.attr({
								transform: 'translate(' + actualMargin.left + ',' + ( actualMargin.top + chartH ) + ')',
								width: chartW,
								height: actualMargin.bottom
							});
						
						function categoryLines(points) {
							var lines = hGridArea.selectAll( '.' + CSS_CLASS_PREFIX + '-grid-line' )
								.data( points );

							lines.enter()
								.append( 'line' )
									.classed( CSS_CLASS_PREFIX + '-grid-line', true )
									.attr({
										x1: function( d ) { return d; },
										y1: 0,
										x2: function( d ) { return d; },
										y2: -chartH,
										opacity: 0
									});

							var linesT = lines;
							if ( transitions.enable ) {
								linesT = linesT.transition()
									.duration( transitions.duration );
							} 

							linesT.attr({
								x1: function( d ) { return d; },
								y1: 0,
								x2: function( d ) { return d; },
								y2: -chartH,
								opacity: 1
							});

							if ( transitions.enable ) {
								lines.exit()
									.transition()
									.duration( transitions.duration )
									.attr({
										opacity: 0
									})
									.each( 'end', function() { d3.select( this ).remove(); } );
							} else {
								lines.exit().remove();
							}
						}
						var points = [];
						if ( isVertical ) {
							points = xScale
								.range()
								.map( function( d ) {
									return d + ( xScale.rangeBand() / 2 );
								});
							points = d3.pairs( points ).map( function ( d ) {
								return ( d[0] + d[1] ) / 2;
							});	

							var grid = hGridArea.selectAll('.tick');

							if ( transitions.enable ) {
								grid
									.attr( 'opacity', 1 )
									.transition()
									.duration( transitions.duration )
									.attr( 'opacity', 0 )
									.each( 'end', function() { d3.select( this ).remove(); } );
							} else {
								grid.remove();
							}

						} else {
							hGridAreaT.call(
								hAxisGenerator
									.tickSize( -chartH, 0 )
									.tickFormat( function() { return ''; } )
							);
						}
						categoryLines(points);
					} else {
						if ( transitions.enable ) {
							hGridArea
								.transition()
								.duration( transitions.duration )
								.attr({
									'opacity' : 0
								})
								.each( 'end', function() {
									hGridArea
										.attr({
											'opacity' : 1
										})
										.html('');
								});
						} else {
							hGridArea.html('');
						}
					}
				}

				// Draw vertical axis 
				var vAxisArea;
				var vAxisGenerator;
				function _drawVAxis( staged ) {
					vAxisArea = svg.select( '.' + CSS_CLASS_PREFIX + '-axis--v' );
					if ( isVertical ? yAxis.display : xAxis.display ) {
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
						var vAxisAreaT = vAxisArea;
						if ( transitions.enable && !staged ) {
							vAxisAreaT = vAxisArea
								.transition()
								.duration( transitions.duration );
						}

						vAxisGenerator = d3.svg.axis()
							.orient( 'left' )
							.scale( isVertical ? yScale : xScale )
							.tickFormat( isVertical ? yAxis.formatter : xAxis.formatter );
						if ( isVertical && yAxis.ticks ) {
							if ( yAxis.ticks === 'auto' ) {
								vAxisGenerator.ticks( Math.max( Math.floor( chartH / VERTICAL_TICK_SPACING ), 2 ) );
							} else {
								vAxisGenerator.ticks( yAxis.ticks );
							}
						}

						vAxisAreaT
							.attr({
								width: actualMargin.left,
								height: chartH,
								transform: 'translate(' + actualMargin.left +',' + actualMargin.top + ')'
							})
							.call( vAxisGenerator );

						var vAxisTitle = vAxisArea.select( '.' + CSS_CLASS_PREFIX + '-axis-title' );
						if ( isVertical ? yAxis.title : xAxis.title ) {
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
								.text( isVertical ? yAxis.title : xAxis.title );
							
							var vAxisTitleT = vAxisTitle;
							if ( transitions.enable && !staged ) {
								vAxisTitleT = vAxisTitle.transition()
									.duration( transitions.duration );
							}
							vAxisTitleT.attr({
								'transform' : 'translate(' + ( -1 * (actualMargin.left - 20)) + ',' + (chartH / 2) + ') rotate(-90)',
								'opacity' : staged ? 0 : 1
							});
						} else {
							if ( transitions.enable && !staged ) {
								vAxisTitle.transition()
									.duration( transitions.duration )
									.attr({
										'opacity' : 0
									})
									.each( 'end', function() {
										d3.select( this ).remove();
									});
							} else {
								vAxisTitle.remove();
							}
						}
					} else {
						if ( transitions.enable && !staged ) {
							vAxisArea
								.transition()
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
								});
						} else {
							vAxisArea.html('');
						}
					}
				}
				var vGridArea;
				function _drawVGrid() {
					vGridArea = svg.select( '.' + CSS_CLASS_PREFIX + '-grid--v' );
					if ( vGridArea.empty()  ) {
						vGridArea = svg.append( 'g' )
							.classed( CSS_CLASS_PREFIX + '-grid', true )
							.classed( CSS_CLASS_PREFIX + '-grid--v', true )
							.attr({
								width: actualMargin.left,
								height: chartH,
								transform: 'translate(' + actualMargin.left +',' + actualMargin.top + ')'
							});
					}						
					if ( isVertical ? ( yAxis.display && yAxis.grid ) : ( xAxis.display && xAxis.grid ) ) {
						var vGridAreaT = vGridArea;
						if ( transitions.enable ) {
							vGridAreaT = vGridArea
								.transition()
								.duration( transitions.duration );
						}
						vGridAreaT
							.attr({
								width: actualMargin.left,
								height: chartH,
								transform: 'translate(' + actualMargin.left +',' + actualMargin.top + ')'
							});

						function categoryLines(points) {
							var lines = vGridArea.selectAll( '.' + CSS_CLASS_PREFIX + '-grid-line' )
								.data( points );

							lines.enter()
								.append( 'line' )
									.classed( CSS_CLASS_PREFIX + '-grid-line', true )
									.attr({
										x1: 0,
										y1: function( d ) { return d; },
										x2: chartW,
										y2: function( d ) { return d; },
										opacity: 0
									});

							var linesT = lines;
							if ( transitions.enable ) {
								linesT = linesT.transition()
									.duration( transitions.duration );
							} 

							linesT.attr({
								x1: 0,
								y1: function( d ) { return d; },
								x2: chartW,
								y2: function( d ) { return d; },
								opacity: 1
							});

							if ( transitions.enable ) {
								lines.exit()
									.transition()
									.duration( transitions.duration )
									.attr({
										opacity: 0
									})
									.each( 'end', function() { d3.select( this ).remove(); } );
							} else {
								lines.exit().remove();
							}
						}

						var points = [];
						if ( !isVertical ) {
							points = xScale
								.range()
								.map( function( d ) {
									return d + ( xScale.rangeBand() / 2 );
								});
							points = d3.pairs( points ).map( function ( d ) {
								return ( d[0] + d[1] ) / 2;
							});

							var grid = vGridArea.selectAll('.tick');

							if ( transitions.enable ) {
								grid
									.attr( 'opacity', 1 )
									.transition()
									.duration( transitions.duration )
									.attr( 'opacity', 0 )
									.each( 'end', function() { d3.select( this ).remove(); } );
							} else {
								grid.remove();
							}

						} else {
							vGridAreaT.call(
								vAxisGenerator
									.tickSize( -chartW, 0 )
									.tickFormat( function() { return ''; } )
							);
						}
						categoryLines( points );
					} else {
						if ( transitions.enable ) {
							vGridArea
								.transition()
								.duration( transitions.duration )
								.attr({
									'opacity' : 0
								})
								.each( 'end', function() {
									vGridArea
										.attr({
											'opacity' : 1
										})
										.html('');
								});
						} else {
							vGridArea.html('');
						}
					}
				}


				// Draw main chart
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

				( transitions.enable ? chartArea.transition().duration( transitions.duration ) : chartArea ).attr({
					width: chartW,
					height: chartH,
					transform: 'translate(' + actualMargin.left + ',' + actualMargin.top + ')'
				});


				/*var series = chartArea.selectAll( '.' + CSS_CLASS_PREFIX + '-series' )
					.data( formattedData, function( d ) { return d.series; } );

				if ( transitions.enable ) {
					series.exit()
						.transition()
						.duration( transitions.duration )
						.attr({
							'opacity' : 0
						})
						.each( 'end', function() { d3.select( this ).remove(); } );
				} else {
					series.exit().remove();
				}

				series.enter()
						.append( 'g' )
							.classed( CSS_CLASS_PREFIX + '-series', true )
							.attr({'opacity':1});*/

				/*var bars = series.selectAll( '.' + CSS_CLASS_PREFIX + '-bar' )
					.data( function(d) { return d.points; }, accessors.key || undefined );*/

				var bars = chartArea.selectAll( '.' + CSS_CLASS_PREFIX + '-bar' )
					.data( d3.merge( formattedData.map( function(d) { return d.points; } ) ) , accessors.key || undefined );


				if ( transitions.enable ) {
					bars.exit()
						.classed( 'a-D3BarChart-bar--in', false )
						.transition()
						.duration( transitions.duration )
						.attr({
							opacity: 0
						})
						.each( 'end', function() { d3.select( this ).remove(); } );
				} else {
					bars.exit().remove();
				}

				var barsEnter = bars.enter()
					.append( 'rect' )
						.classed( CSS_CLASS_PREFIX + '-bar', true )
						.attr({
							x: isVertical ? _x : 0,
							y: isVertical ? chartH : _y,
							width: isVertical ? _width : 0,
							height: isVertical ? 0 : _height,
							opacity: 0,
							tabindex: -1
						})
						.style({
							fill: accessors.color
						})
						.on( 'mouseenter', function (d) { dispatch.barenter.apply( this, arguments ); } )
						.on( 'focus', function (d) { dispatch.barfocus.apply( this, arguments ); } )

						.on( 'mousemove', function (d) { dispatch.barover.apply( this, arguments ); } )

						.on( 'mouseleave', function (d) { dispatch.barleave.apply( this, arguments ); } )
						.on( 'blur', function (d) { dispatch.barblur.apply( this, arguments ); } )

						.on( 'click', function (d) { dispatch.barclick.apply( this, arguments ); } )
						.on( 'keyup', function (d) { ( d3.event.keyCode === 13 ) && dispatch.barclick.apply( this, arguments ); } );

				// Add desc tag for accessibility
				barsEnter.append( 'desc' )
					.text( function (d) {
						var all = [];
						var x = accessors.x.apply( this, arguments );
						( x !== undefined ) && ( x !== null ) && ( all.push( x ) );
						var s = accessors.series.apply( this, arguments );
						( s !== undefined ) && ( s !== null ) && ( all.push( s ) );
						var y = yAxis.formatter( realYAccesor.apply( this, arguments ) );
						( y !== undefined ) && ( y !== null ) && ( all.push( y ) );
						return all.join( ', ' );
					});

				var barsT = bars;

				function sortBars() {
					var focused = bars.filter( '*:focus' );
					bars.sort( function( d1, d2 ) {
						// This makes the chart not support more than 1000 series. This is an arbitrary number, but it is large
						// because it limits the number of series that can be used while ensuring the correct document
						// order of the bars.
						return d3.ascending( 
							xScale( accessors.x( d1 ) ) * 1000 + series.length + ( isVertical && ( display === 'stacked' ) ? -1 : 1 ) * series.indexOf( accessors.series( d1 ) ), 
							xScale( accessors.x( d2 ) ) * 1000 + series.length + ( isVertical && ( display === 'stacked' ) ? -1 : 1 ) * series.indexOf( accessors.series( d2 ) ) 
						);
					});
					( !focused.empty() ) && focused[0][0].focus();
				}

				if ( transitions.enable ) {
					barsT = barsT
						.transition()
						.duration( transitions.duration )
						.each( 'end', function ( d, i) {
							if ( i === 0 ) {
								sortBars();
							}
							d3.select( this ).classed( 'a-D3BarChart-bar--in', true );
						});
				} else {
					sortBars();
					barsT.classed( 'a-D3BarChart-bar--in', true );
				}

				barsT
					.attr({
						x : _x,
						y : _y,
						width : _width,
						height : _height,
						opacity : 1
					})
					.style({
						fill : accessors.color
					});

			});
		}



		function _getObjectSetterGetter ( obj ) {
			return (function ( prop, x ) {
				if ( x === undefined && prop === undefined ) {
					return obj;
				} else if ( x === undefined && (typeof prop === 'string') ) {
					return obj[prop];
				} else if ( typeof prop === 'object' ) {
					for ( var k in prop ) {
						obj[k] = prop[k];
					}
				} else {
					obj[prop] = x;
				}
				return exports;
			});
		}

		exports.margin = _getObjectSetterGetter(margin);
		exports.setters = _getObjectSetterGetter(setters);
		exports.xAxis = _getObjectSetterGetter(xAxis);
		exports.yAxis = _getObjectSetterGetter(yAxis);
		exports.transitions = _getObjectSetterGetter(transitions);
		exports.barSpacing = _getObjectSetterGetter(barSpacing);

		exports.accessors = function(prop, x) {
			if ( x === undefined && prop === undefined ) {
				return accessors;
			} else if ( x === undefined && (typeof prop === 'string') ) {
				return accessors[prop];
			} else if ( typeof prop === 'object' ) {
				for ( var k in prop ) {
					if (k === 'y') {
						accessors[k] = function() {
							return Math.max( 0, prop[k].apply(this, arguments) );
						};
						realYAccesor = prop[k];
					} else {
						accessors[k] = prop[k];
					}
				}
			} else {
				if (prop === 'y') {
					accessors[prop] = function() {
						return Math.max( 0, x.apply(this, arguments) );
					};
					realYAccesor = x;
				} else {
					accessors[prop] = x;
				}
			}
			return exports;
		};

		exports.orientation = function (x) {
			if ( x === undefined ) {
				return orientation;
			}
			orientation = x;
			return exports;
		};
		exports.display = function (x) {
			if ( x === undefined ) {
				return display;
			}
			display = x;
			return exports;
		};
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
		exports.heightMode = function (x) {
			if ( x === undefined ) {
				return heightMode;
			}
			heightMode = x;
			return exports;
		};

		d3.rebind(exports, dispatch, 'on');

		return exports;

	};
})(window.d3);
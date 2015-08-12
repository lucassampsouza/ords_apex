/*
 * Application Express D3 Bar Chart wrapper
 *
 * Based on D3 http://www.d3js.org/
 * This D3 module extends the core d3.oracle.barchart plugin to add tooltip support,
 * keyboard navigation, region refreshes and ThemeRoller compatibility.
 */

(function( apex, util, server, $, d3 ){
    var IE_UP_TO_10 = /MSIE \d/.test(navigator.userAgent);
    var IE_11_AND_UP = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
    var IS_IE = IE_UP_TO_10 || IE_11_AND_UP;

	if ( !d3 || !d3.oracle || !d3.oracle.barchart ) {
		throw 'This plugin requires the d3.oracle.barchart plugin to be imported first.';
	}

	function _once ( fn ) {
		var executed = false;
		return (function(){
			if ( !executed ) {
				executed = true;
				return fn.apply( this, arguments );
			}
		});
	}

	function _echo ( e ) {
		return e;
	}

    // IE doesn't let us manipulate a bounding box, so we have to detach it from the unmodifiable object.
    function _detach( bbox ) {
        return {
            x : bbox.x,
            y : bbox.y,
            width : bbox.width,
            height : bbox.height
        };
    }

	function _$( tag ) {
		return $( document.createElement( tag ) );
	}

	var PIXELS_PER_CATEGORY = 50;
	var LEGEND_COLUMN_WIDTH = 150;

	d3.oracle.barchart.apex = function() {
		var dispatch = d3.dispatch( 'chartcreated', 'dataloaded', 'chartrendering', 'chartrendered', 'legendover', 'legendout', 'barover', 'barout' ),
			// These properties should be set so the plugin knows how to correctly 
			// refresh the apex region
			apx = {
				regionId: undefined,
				pageItems: undefined,
				ajaxIdentifier: undefined,
				chartRegionId: undefined
			},
			xAxis = {
				title : undefined,
				grid : true
			},
			yAxis = {
				title : undefined,
				grid : true
			},
			tooltips = {
				enable : true,
				include : {
					series : true,
					x : true,
					y : true,
					custom : false
				}
			},
			spacing = {
				inner : 10,
				outer : 20
			},
			mode = {
				horizontal : false,
				display : 'SIDE-BY-SIDE',
				height : 'BARS'
			},
			colors = {
				multiple : false,
				list : [ '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#34AADC', '#007AFF', '#5856D6', '#FF2D55', '#8E8E93', '#C7C7CC' ],
				mapping : {}
			},
			transitions = {
				enable : true,
				duration : 500
			},
			legend = {
				show : true,
				position : 'TOP'
			},
			dimensions = {
				minHeight : 100,
				maxHeight : 500,
				minAR : 1.333,
				maxAR : 3
			},
			responsive = {
				enable : true,
				threshold : 480,
				of : 'WINDOW'
			},
			formatters = {
				y : 'FRIENDLY'
			},
            messages = {
                noDataFound : 'No data found.'
            },
            accessibility = {
                label : 'D3 Bar Chart'
            };

		var _data,
			_region$,
			_chart$,
			_legend$,
			_tooltip$,
			_chartGenerator,
			_legendGenerator,
			_tooltipGenerator,
			_classScale,
			_colorScale,
			_valueFormatter;

		// This is used to get a correct color accessor for the bars. Since
		// the configuration isn't trivial, we need to build the accessor like
		// this. It guarantees to use the same d3 scale internally, so only generate
		// a new accessor if necessary.
		function _makeColorScale() {
			var colorScale,
				colorMapping;
			if ( colors.list && colors.list.length > 0 ) {
				colorScale = d3.scale.ordinal()
					.range( colors.list );
			} else if ( colors.mapping ) {
				colorMapping = $.extend( {}, colors.mapping );
			}
			// Caller decides whether to send only x values or series values
			return (function( x ) {
				if ( colorScale ) {
					return colorScale( x );
				} else if ( colorMapping ) {
					return colorMapping[ x ];
				}
				return null;
			});
		}
		function _makeColorAccessor( property, scale ) {
			return (function( d ){
				return scale( d[ property ] );
			});
		}

		function _makeTooltipLabelAccessor( includeX, includeS ) {
			if ( includeX || includeS ) {
				return (function( d ){
					if ( includeX && !includeS ) {
						return d.x;
					} else if ( !includeX && includeS ) {
						return d.series;
					} else {
						return d.x + ' (' + d.series + ')'
					}
				});
			} else {
				return null;
			}
		}
		function _makeTooltipValueAccessor( includeY ) {
			if ( includeY ) {
				return (function( d ) {
					return d.y;
				});
			} else {
				return null;
			}
		}

		// Generates a value formatter according to the 'format' string.
		// This string can be either "FRIENDLY", which will return the 
		// d3.oracle.fnf formatter with its default values. Otherwise
		// the string will be parsed according to the d3.format function,
		// with the addition that leading or trailing double-quoted strings
		// will be extracted and their contents will be used as prefixes or 
		// suffixes, respectively.
		function _makeValueFormatter( format ) {
			if ( format === 'FRIENDLY' ) {
				return d3.oracle.fnf();
			} else if ( format.length > 0 ) {
				var fixedRegex = /(^"[^"]*")/;
				var formatPrefix = '';
				var formatSuffix = '';

				if ( fixedRegex.test( format ) ) {
					formatPrefix = fixedRegex.exec( format )[0];
					formatPrefix = formatPrefix.substr( 1, formatPrefix.length - 2 );
					format = format.replace( fixedRegex, '' );
				} 
				fixedRegex = /("[^"]*"$)/;
				if ( fixedRegex.test( format ) ) {
					formatSuffix = fixedRegex.exec( format )[0];
					formatSuffix = formatSuffix.substr( 1, formatSuffix.length - 2 );
					format = format.replace( fixedRegex, '' );
				}
				var formatter = d3.format( format );
				return (function() {
					return formatPrefix + formatter.apply(this, arguments) + formatSuffix;
				});
			} else {
				return _echo;
			}
		}

		function _recommendedHeight() {
            var minAR = dimensions.minAR;
            var maxAR = dimensions.maxAR;
            var minH = dimensions.minHeight;
            var maxH = dimensions.maxHeight;
            var w = _chart$.width();
            var h = ( _chart$.height() === 0 ) ? ( w / maxAR ) : _chart$.height();
            var ar = w / h;
			if ( ar < minAR ) {
				h = w / maxAR + 1;
			} else if ( ar > maxAR ) {
				h = w / minAR - 1;
			}
			return Math.max( minH, Math.min( h, maxH ) );
		}

		// These functions and variables handle resizing and debouncing
		var _lastRenderedWidth,
			_resizeTimeout;
		function _resizeHandler() {
			if ( _data ) {
				clearTimeout ( _resizeTimeout );
				_resizeTimeout = setTimeout( _resized, transitions.enable ? 500 : 1 );
			}
		}
		function _resized() {
			var w = _chart$.width();
			if ( !$.getScrollbarWidth || 
				!_lastRenderedWidth || 
				( Math.abs( w - _lastRenderedWidth ) > $.getScrollbarWidth() ) ) {
				_lastRenderedWidth = w;
				_draw( _data );
			}
		}

		var _tooltipColor,
			_focused,
            _keydownTriggered;
		function _hookTooltipEvents( duration ) {
			var hovered = null;

			_chartGenerator
				.on( 'barenter', function() {
					hovered = this;
					_tooltip$.stop().fadeIn( duration );
				})
				.on( 'barfocus', function( d ) {
					_focused = this;
					d3.select( _chart$.get( 0 ) )
						.selectAll( '.a-D3BarChart-bar' )
						.classed( 'a-D3BarChart-bar--fade', function() {
							return this !== _focused;
						});

					if ( _focused !== hovered || _keydownTriggered ) {
						_keydownTriggered = false;
						_tooltipColor = window.getComputedStyle( _focused ).getPropertyValue( 'fill' );

						d3.select( _tooltip$.get( 0 ) )
							.datum( d )
							.call( _tooltipGenerator );

						_tooltip$.stop().fadeIn( duration );

						var rOff = $( _focused ).offset();
						var cOff = _chart$.offset();
						var rBox = _detach( _focused.getBBox() );
						_tooltip$.position({
							my : 'center bottom-5',
							of : _chart$,
							at : 'left+' +
								Math.round( rOff.left - cOff.left + rBox.width / 2 ) +
								' top+' +
								( rOff.top - cOff.top ),
							within : _region$,
							collision : 'fit fit'
						});
					}
				})
				.on( 'barover', function( d ) {
					hovered = this;
					_tooltipColor = window.getComputedStyle( hovered ).getPropertyValue( 'fill' );

					d3.select( _tooltip$.get( 0 ) )
						.datum( d )
						.call( _tooltipGenerator );

					if ( !_tooltip$.is( ':visible' ) ) {
						_tooltip$.fadeIn( duration );
					}

					_tooltip$.position({
						my : 'left+20 center',
						of : d3.event,
						at : 'right center',
						within : _region$,
						collision : 'flip fit'
					});
				})
				.on( 'barleave', function() {
					hovered = null;
					_tooltip$.stop().fadeOut( duration );
				})
				.on( 'barblur', function() {
					_focused = null;
					if ( !hovered ) {
						_tooltip$.stop().fadeOut( duration );
					}
					d3.select( _chart$.get( 0 ) )
						.selectAll( '.a-D3BarChart-bar' )
						.classed( 'a-D3BarChart-bar--fade', false );
				});
		}
		var _hookKeyboardEvents = _once( function() {
			var isFocused = false,
				focused$,
				svg = $( 'svg', _chart$ )
					.first()
                    .attr( 'tabindex', 0 )
					.on( 'focusin', function() {
						isFocused = true;
					})
					.on( 'keydown', function( e ) {
						focused$ = $( _focused );
						switch ( e.which ) {
							case 37:
							case 38:
								_keydownTriggered = true;
								if ( !_focused || focused$.prev().length === 0) {
									_focused = $( '.a-D3BarChart-bar', _chart$ )
										.last()
										.focus()
										.get( 0 );
								} else if ( focused$.prev().length > 0 ) {
									_focused = focused$
										.prev()
										.focus()
										.get( 0 );
								}
								break;
							case 39:
							case 40:
								_keydownTriggered = true;
								if ( !_focused || focused$.next().length === 0) {
									_focused = $( '.a-D3BarChart-bar', _chart$ )
										.first()
										.focus()
										.get( 0 );
								} else if ( focused$.next().length > 0 ) {
									_focused = focused$
										.next()
										.focus()
										.get( 0 );
								} 
								break;
						}
					})
					.on( 'focusout', function() {
						if ( $( 'rect:focus, svg:focus', _chart$ ).length === 0 ) {
							isFocused = false;
							_focused = null;
                            if ( IS_IE ) {
                                _chartGenerator.on( 'barblur' ).call( $( 'rect', _chart$).get( 0 ) );
                            }
						}
					});

			svg.on( 'keydown', function( e ) {
				if ( isFocused && e.which >= 37 && e.which <= 40 ) {
					e.preventDefault && e.preventDefault();
					e.stopPropagation && e.stopPropagation();
					e.stopImmediatePropagation && e.stopImmediatePropagation();
					return false;
				}
			});	
		});

		function _refresh() {
			server.plugin( apx.ajaxIdentifier, { pageItems : apx.pageItems }, {
				refreshObject : _region$,
				clear : _clear,
				success : _draw,
				error : _debug,
				loadingIndicator : _chart$,
				loadingIndicatorPosition : 'append'
			});
		}
		function _clear() {}
		function _debug() { debugger; }
		function _draw( data ) {
			_data = data;
			if ( _data.colors ) {
				colors.mapping = {};
				colors.list = null;
				for (var i = _data.colors.length - 1; i >= 0; i--) {
					colors.mapping[ _data.colors[i].series ] = _data.colors[i].color;
				}
				_colorScale = _makeColorScale();
				_chartGenerator.accessors( 'color', _makeColorAccessor( colors.multiple ? 'x' : 'series', _colorScale ) );
			}
			var w = _chart$.width();
			var thresholdW = ( responsive.of === 'WINDOW' ) ? $( window ).width() : _chart$.width();
			_chartGenerator.width( w );

			var series = oracle.jql()
				.select( [ function( rows ) {
					return _chartGenerator.accessors( 'color' )( rows[0] );
				}, 'color' ] )
				.from( _data.data )
				.group_by( [ function( row ) {
					return colors.multiple ? row.x : row.series;
				}, 'series' ] )();

			if ( thresholdW < responsive.threshold && responsive.enable ) {
				// On responsive mode, some user settings are overridden.
				var categoriesCount = d3.set(
						_data.data.map(function( d ) {
							return d.x;
						})
					)
					.values()
					.length;

				_chartGenerator
					.orientation( 'horizontal' )
					.height( PIXELS_PER_CATEGORY * categoriesCount );
			} else {
				_chartGenerator
					.orientation( mode.horizontal ? 'horizontal' : 'vertical' )
					.height( _recommendedHeight() );
			}

			d3.select( _chart$.get( 0 ) )
				.datum( _data.data )
				.call( _chartGenerator )
				.selectAll( '.a-D3BarChart-bar' )
				.each(function( d ) {
					// ThemeRoller bars compatibiity
					var self = d3.select( this );
					var colorClasses = self.attr( 'class' )
						.match( /u-Color-\d+-BG--bg/g ) || [];
					for (var i = colorClasses.length - 1; i >= 0; i--) {
						self.classed( colorClasses[i], false );
					}
					if ( colors.list[0] === "" && colors.list.length == 1 ){
						self.classed( 'u-Color-' + _classScale( colors.multiple ? d.x : d.series ) + '-BG--fill', true );
					}
				})
				.classed( 'a-D3BarChart-bar--clickable', function( d ) {
					return ( d.link && d.link.length > 0 );
				});

            $( 'svg', _chart$).attr( 'aria-label', accessibility.label );

			if ( legend.show ) {
				_legendGenerator.numberOfColumns( Math.max( Math.floor( w / LEGEND_COLUMN_WIDTH ) , 1 ) );
				d3.select( _legend$.get( 0 ) )
					.datum( series )
					.call( _legendGenerator )
					.selectAll( '.a-D3ChartLegend-item' )
					.each(function( d ) {
						// ThemeRoller legend compatibility
						var self = d3.select( this )
							.select( '.a-D3ChartLegend-item-color' );
						var colorClasses = self.attr( 'class' )
							.match( /u-Color-\d+-BG--bg/g ) || [];
						for (var i = colorClasses.length - 1; i >= 0; i--) {
							self.classed( colorClasses[i], false );
						}
						self.classed( 'u-Color-' + _classScale( d.series ) + '-BG--bg', true );
					});
			}

			_hookKeyboardEvents();

            // If IE, we need to manually trigger the D3 focus events
            if ( IS_IE ) {
                $( 'rect', _chart$ )
                    .on( 'focus', function(){
                        _chartGenerator.on( 'barfocus' ).call( this, d3.select( this ).datum() );
                    })
                    .on( 'blur', function(){
                        _chartGenerator.on( 'barblur' ).call( this, d3.select( this ).datum() );
                    });
            }
		}

		function exports () {
			// Save the references to the main containers
			_region$ = $( '#' + util.escapeCSS( apx.regionId ), apex.gPageContext$ );
			_chart$ = $( '#' + util.escapeCSS( apx.chartRegionId ), apex.gPageContext$ );
			
			// This d3 scale will be used to assign class names to elements (for 
			// TR compatibility)
			_classScale = d3.scale.ordinal()
				.range( d3.range( 1, 31 ) );

			// This is used to create a color scale that transforms x or series values
			// into colors. Used by both the barchart and the legend.
			_colorScale = _makeColorScale();

			// This formatter transforms the numbers in the chart to their specified format
			_valueFormatter = _makeValueFormatter( formatters.y );

			// Initialize the barchart generator and set only the "fixed" settings
			// (i.e. the ones that can be defined at render time)
			_chartGenerator = d3.oracle.barchart()
				.margin( 'left', 'auto' )
				.margin( 'bottom', 'auto' )
				.transitions({
					enable : transitions.enable,
					duration : transitions.duration
				})
				.accessors({
					color : _makeColorAccessor( colors.multiple ? 'x' : 'series', _colorScale ),
					key : function( d ) {
						return ( typeof d.series ) + ':' + d.series + '||' + ( typeof d.x ) + ':' + d.x;
					}
				})
				.xAxis({
					title: xAxis.title || '',
					grid: xAxis.grid
				})
				.yAxis({
					title : yAxis.title || '',
					grid : yAxis.grid,
					formatter : _valueFormatter
				})
				.heightMode( mode.height.toLowerCase() )
				.orientation( mode.horizontal ? 'horizontal' : 'vertical' )
				.display( mode.display.toLowerCase() )
				.barSpacing({
					inner : spacing.inner / 100,
					outer : spacing.outer / 100
				})
				.on( 'barclick', function( d ) {
                    if ( IS_IE ) {
                        $( this ).focus();
                    }
					if ( d.link && d.link.length > 1 ) {
						window.location.assign( d.link );
					}
				});

			// Window resizing should always be handled, even if the chart isn't 
			// configured as responsive.
            $( window ).on( 'apexwindowresized', _resizeHandler );
			// Ideally, we should listen to the resizing of _chart$ too, but we
			// need a jQuery plugin for that.

			// Prepare the legend generator and container. Nothing will be rendered
			// until _draw is invoked.
			if ( legend.show ) {
				_legendGenerator = d3.oracle.ary()
					.hideTitle( true )
					.showValue( false )
					.leftColor( true )
					.symbol( 'circle' )
					.numberOfColumns( 3 )
					.accessors({
						color : _makeColorAccessor( 'series', _colorScale ),
						label : _chartGenerator.accessors( 'series' )
					});
				_legend$ = _$( 'div' );
				if ( legend.position === 'TOP' ) {
					_chart$.before( _legend$ );
				} else {
					_chart$.after( _legend$ );
				}
			}

			if ( tooltips.enable ) {
				_tooltipGenerator = d3.oracle.tooltip()
					.accessors({
						label : _makeTooltipLabelAccessor(
							tooltips.include.x,
							tooltips.include.series
						),
						value : _makeTooltipValueAccessor( tooltips.include.y ),
						color : function() {
							return _tooltipColor;
						},
						content : function( d ) {
							return d.tooltip;
						}
					})
					.formatters({
						value : _valueFormatter
					})
					.transitions({
						enable : false
					})
					.symbol( 'circle' );
				_tooltip$ = _$( 'div' )
					.addClass( 'a-D3BarChart-tooltip a-D3Tooltip' )
					.appendTo( _chart$ )
					.hide();

				_hookTooltipEvents( transitions.enable ? transitions.duration / 5 : 0 );
			}

			// Bind to the apexrefresh so the region responds to 'Refresh' events from 
			// dynamic actions. Trigger it immediately to get inital data.
			_region$
				.on( 'apexrefresh', _refresh )
				.trigger( 'apexrefresh' );

			return exports;
		}

		// Shortcut for building the getters and setters
		function _ogs ( obj ) {
			return (function ( prop, x ) {
				if ( x === undefined && prop === undefined ) {
					return obj;
				} else if ( x === undefined && (typeof prop === 'string') ) {
					return obj[prop];
				} else if ( typeof prop === 'object' ) {
					for ( var k in prop ) {
                        if ( prop.hasOwnProperty( k ) ) {
                            obj[k] = prop[k];
                        }
					}
				} else {
					obj[prop] = x;
				}
				return exports;
			});
		}

		exports.apx = _ogs( apx );
		exports.xAxis = _ogs( xAxis );
		exports.yAxis = _ogs( yAxis );
		exports.tooltips = _ogs( tooltips );
		exports.spacing = _ogs( spacing );
		exports.mode = _ogs( mode );
		exports.colors = _ogs( colors );
		exports.transitions = _ogs( transitions );
		exports.legend = _ogs( legend );
		exports.dimensions = _ogs( dimensions );
		exports.responsive = _ogs( responsive );
		exports.formatters = _ogs( formatters );
        exports.messages = _ogs( messages );
        exports.accessibility = _ogs( accessibility );


		d3.rebind( exports, dispatch, 'on' );
		return exports;
	}
})( apex, apex.util, apex.server, apex.jQuery, d3 );


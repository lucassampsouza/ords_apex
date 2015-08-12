(function( d3, navigator ){
	if ( !d3 ) {
		throw 'This plugin requires D3';
	}

	( !d3.oracle ) && ( d3.oracle = {} );

	var IS_IE9 = /MSIE 9/.test( navigator.userAgent );

    function _debounce ( delay, func, self, args ) {
        var t;
        return function() {
            clearInterval( t );
            t = setInterval( _proxy( func, self || this, args || arguments ), delay );
        };
    }

    function _proxy ( func, self, args ) {
        return function() {
            return func.apply( self, args );
        };
    }

	function slider() {
		var orientation = 'horizontal',
			width = 150,
			height = 10,
            margin = 20,
			markerWidth = Math.min( width, height ) / 1.5,
			scale = d3.scale.linear()
				.domain( [0, 100] )
				.range( [0, width] ),
			dispatch = d3.dispatch( 'slidedrag', 'slideend', 'slidestart' );

		function exports ( _selection ) {
			_selection.each( function ( _data ) {
				var self = d3.select( this );
				var isHorizontal = orientation === 'horizontal';

				scale.range( [markerWidth / 2, ( isHorizontal ? width : height ) - markerWidth / 2] )
					.clamp( true );

				var svg = self.select( '.a-D3ColorPicker-slider' );
				var mark = svg.select( '.a-D3ColorPicker-sliderMark' );
				var drag = d3.behavior.drag()
					.on( 'drag', function( d ) {
						d = scale.invert( isHorizontal ? d3.event.x : d3.event.y );
						_data = d;
						self.datum( _data );
						_updateMark();
						dispatch.slidedrag.apply( this, arguments );
					})
					.on( 'dragstart', function( d ) {
						d = scale.invert( isHorizontal ? d3.event.sourceEvent.offsetX : d3.event.sourceEvent.offsetY );
						_data = d;
						self.datum( _data );
						_updateMark();
						dispatch.slidedrag.apply( this, arguments );
					})
					.on( 'dragend', dispatch.slideend );
				if ( svg.empty() ) {
					svg = self.append( 'svg' )
						.classed( 'a-D3ColorPicker-slider', true )
						.attr({
							width : width + (isHorizontal ? 0 : margin),
							height : height + (isHorizontal ? margin : 0)
						});
					mark = svg.append( 'g' )
                        .attr( 'transform', 'translate(' + ( isHorizontal ? '0,' + margin : margin + ',0' ) + ')' )
                        .append( 'path' )
                            .classed( 'a-D3ColorPicker-sliderMark', true )
                            .attr({
                                d : function() {
                                    return isHorizontal ?
                                        'M0 0 L' + (-markerWidth / 2) + ' ' + (height * 0.4) + 
                                        ' L' + (-markerWidth / 2) + ' ' + (height) + 
                                        ' L' + (markerWidth / 2) + ' ' + (height) + 
                                        ' L' + (markerWidth / 2) + ' ' + (height * 0.4) + 
                                        ' Z' : 
                                        'M0 0 L' + (width * 0.4) + ' ' + (-markerWidth / 2) + 
                                        ' L' + (width) + ' ' + (-markerWidth / 2) + 
                                        ' L' + (width) + ' ' + (markerWidth / 2) + 
                                        ' L' + (width * 0.4) + ' ' + (markerWidth / 2) + 
                                        'Z';
                                },
                                fill: '#101010'
                            })
                            .on( 'mousedown.slider', function() {
                                d3.event.stopPropagation();
                                d3.event.preventDefault();
                                d3.event.cancelBubble = true;
                                d3.event.returnValue = false;
                            });
				}
				function _updateMark() {
					mark.attr({
						transform : function() {
							return isHorizontal ?
								'translate(' + scale( _data ) + ',0)' : 
								'translate(0,' + scale( _data ) + ')';
						}
					});
				}
                
                svg.call( drag );

				_updateMark();
			});
		}

		exports.orientation = function( _x ) {
			if ( _x === undefined ) {
				return orientation;
			}
			orientation = _x;
			return exports;
		};
		exports.width = function( _x ) {
			if ( _x === undefined ) {
				return width;
			}
			width = _x;
			return exports;
		};
		exports.height = function( _x ) {
			if ( _x === undefined ) {
				return height;
			}
			height = _x;
			return exports;
		};
		exports.markerWidth = function( _x ) {
			if ( _x === undefined ) {
				return markerWidth;
			}
			markerWidth = _x;
			return exports;
		};
		exports.scale = function( _x ) {
			if ( _x === undefined ) {
				return scale;
			}
			scale = _x;
			return exports;
		};

		d3.rebind( exports, dispatch, 'on' );
		return exports;
	}

	window._RGBToHSB = function ( rgb ) {
		if ( typeof rgb === 'string' ) {
			rgb = d3.rgb( rgb );
		}
		var hsb = {
			h: 0,
			s: 0,
			b: 0
		};
		var min = Math.min(rgb.r, rgb.g, rgb.b);
		var max = Math.max(rgb.r, rgb.g, rgb.b);
		var delta = max - min;
		hsb.b = max;
		hsb.s = max !== 0 ? 255 * delta / max : 0;
		if (hsb.s !== 0) {
			if (rgb.r === max) {
				hsb.h = (rgb.g - rgb.b) / delta;
			} else if (rgb.g === max) {
				hsb.h = 2 + (rgb.b - rgb.r) / delta;
			} else {
				hsb.h = 4 + (rgb.r - rgb.g) / delta;
			}
		} else {
			hsb.h = -1;
		}
		hsb.h *= 60;
		if (hsb.h < 0) {
			hsb.h += 360;
		}
		hsb.s *= 100/255;
		hsb.b *= 100/255;
		return hsb;
	};
	window._HSBToRGB = function ( hsb ) {
		var rgb = {};
		var h = Math.round(hsb.h);
		var s = Math.round(hsb.s*255/100);
		var v = Math.round(hsb.b*255/100);
		if(s === 0) {
			rgb.r = rgb.g = rgb.b = v;
		} else {
			var t1 = v;
			var t2 = (255-s)*v/255;
			var t3 = (t1-t2)*(h%60)/60;
			if(h===360) h = 0;
			if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3;}
			else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3;}
			else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3;}
			else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3;}
			else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3;}
			else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3;}
			else {rgb.r=0; rgb.g=0;	rgb.b=0;}
		}
		return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
	};

	function _rgba( rgb, format ) {
		if ( format === 'Hex8' ) {
			// Alpha is part of the hex string
			var alphaHex = Math.floor( rgb.a * 255 ).toString( 16 );
			if ( alphaHex.length === 1 ) {
				alphaHex = '0' + alphaHex;
			}
			return '#' + alphaHex + rgb.toString().substr( 1 );
		}
		return ( rgb.a >= 1 ) ? rgb.toString() : 'rgba(' + [rgb.r, rgb.g, rgb.b, rgb.a].join(',') + ')';
	}

	function _getAlpha( color ) {
		var a;
		if ( color.indexOf( 'rgba' ) === 0 && color.split( ',' ).length === 4 ) {
			a = color.substr( color.lastIndexOf( ',' ) + 1, color.lastIndexOf( ')' ) ).trim();
			if ( a.match( /\d+%/gi ) ) {
				return parseFloat( a ) / 100;
			} else {
				return parseFloat( a );
			}
		} else {
			return 1;
		}
	}

	function _stripAlpha( color ) {
		if ( color.indexOf( 'rgba' ) === 0 && color.split( ',' ).length === 4 ) {
			return color.replace( /rgba\(([^,]+,[^,]+,[^,]+)(,[^\)]+)\)/g, 'rgb($1)' );
		} else {
			return color;
		}
	}

	d3.hsb = function () {

		var exports = {
			rgb : function () {
				var rgb = _HSBToRGB( exports );
				return d3.rgb( rgb.r, rgb.g, rgb.b );
			},
			toString : function () {
				return exports.rgb().toString();
			},
			toRGBAString : function () {
				var rgb = exports.rgb();
				rgb.a = exports.a;
				return _rgba( rgb );
			}
		};

		switch ( typeof arguments[0] ) {
			case 'number' :
				exports.h = arguments[0];
				exports.s = arguments[1];
				exports.b = arguments[2];
				break;
			case 'object' : 
				exports.h = arguments[0].h || 0;
				exports.s = arguments[0].s || 0;
				exports.b = arguments[0].b || 0;
				break;
			case 'string' :
				var hsb = _RGBToHSB( d3.rgb( _stripAlpha(arguments[0]) ) );
				exports.h = hsb.h;
				exports.s = hsb.s;
				exports.b = hsb.b;
				exports.a = _getAlpha(arguments[0]);
				break;
			default: 
				exports.h = 0;
				exports.s = 0;
				exports.b = 0;
				break;
		}

		return exports;
	};

	d3.oracle.colorpicker = function() {
		var dispatch = d3.dispatch( 'colordrag', 'colorchange' ),
			show = {
				alpha: true,
				hsbControls: true,
				rgbControls: true
			},
			bScale = d3.scale.linear()
				.domain( [0, 100] )
				.range( [150, 0] )
				.clamp( true ),
			sScale = d3.scale.linear()
				.domain( [0, 100] )
				.range( [0, 150] )
				.clamp( true );

		function exports ( _selection ) {
			_selection.each( function ( _data ) {
				var self = d3.select( this );
				if ( !_data ) {
					_data = d3.hsb( 0, 0, 0 ); 
				} else {
					_data = d3.hsb( _data.toString() );
				}
				_data.a = ( typeof _data.a === 'undefined' ) ? 1 : _data.a;
				self.datum( _data );

				var hueSliderGenerator = slider()
					.orientation( 'vertical' )
					.height( 158 )
					.width( 10 )
					.markerWidth( 8 )
					.scale( d3.scale.linear().domain( [0, 360] ) )
					.on( 'slidedrag', function( d ) {
						_data.h = d;
						_updateHueOverlay( d );
						_updateRGBControls();
						_updateRGBControl();
						_updateAlphaOverlay();
                        _setColorOutput();
					})
                    .on( 'slideend', function() {
						_dispatchChange.apply( this, [ _data ] );
                    });
				var alphaSliderGenerator = slider()
					.orientation( 'horizontal' )
					.width( 158 )
					.height( 10 )
					.scale( d3.scale.linear().domain( [0, 1] ) )
					.markerWidth( 8 )
					.on( 'slidedrag', function( d ) {
						_data.a = parseFloat( d.toFixed( 2 ) );
						_updateRGBControl();
						_updateAlphaControl();
                        _setColorOutput();
						//_dispatchChange.apply( this, [ _data ] );
					})
                    .on( 'slideend', function() {
						_dispatchChange.apply( this, [ _data ] );
                    });
				
				var picker = self.select( '.a-D3ColorPicker' );
				if ( picker.empty() ) {
					picker = self.append( 'div' )
						.classed( 'a-D3ColorPicker', true );
				}

				function _updateHueOverlay( h ) {
					hueOverlay.style( 'background-color', 'hsl(' + ( h || _data.h ) + ',100%,50%)' );
				}
				function _updateAlphaOverlay() {
					var rgb0 = _data.rgb();
					var rgb1 = _data.rgb();
					rgb0.a = 0;
					rgb1.a = 1;
					try {
						// This line will throw an exception on IE9
						alphaOverlay.style( 'background', 'linear-gradient(to right,' + _rgba( rgb0 ) + ' 0%,' + _rgba( rgb1 ) + ' 100%)' );
					} catch ( e ) {
						if ( IS_IE9 ) {
							alphaOverlay.style( 'filter', 'progid:DXImageTransform.Microsoft.gradient(GradientType=1,startColorstr=\'' + _rgba( rgb0, 'Hex8' ) + '\', endColorstr=\'' + _rgba( rgb1, 'Hex8' ) + '\');' );
						}
					}
				}
				function _updateAlphaSlider() {
					alphaSlider
						.datum( _data.a )
						.call( alphaSliderGenerator );
				}

				var sbColumn = picker.select( '.a-D3ColorPicker-sbColumn' );
				var hueOverlay = sbColumn.select( '.a-D3ColorPicker-overlay--h' );
				if ( sbColumn.empty() ) {
					sbColumn = picker.append( 'div' )
						.classed( 'a-D3ColorPicker-sbColumn', true )
						.classed( 'a-D3ColorPicker-column', true );
					hueOverlay = sbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-overlay', true )
						.classed( 'a-D3ColorPicker-overlay--h', true );
					sbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-overlay', true )
						.classed( 'a-D3ColorPicker-overlay--s', true );
					sbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-overlay', true )
						.classed( 'a-D3ColorPicker-overlay--b', true );
				}

				_updateHueOverlay();

				var sbArea = sbColumn.select( '.a-D3ColorPicker-sbArea' );
				if ( sbArea.empty() ) {
					sbArea = sbColumn
						//.append( 'div' )
						//.classed( 'a-D3ColorPicker-svgWrapper', true )
						.append( 'svg' )
							.classed( 'a-D3ColorPicker-sbArea', true )
							.classed( 'a-D3ColorPicker-overlay', true );

					var rg = sbArea.append( 'defs' )
						.append( 'radialGradient' )
							.attr( 'id', 'a-D3ColorPicker-radialGradient' );

					rg.append( 'stop' )
						.attr( 'offset', '0%' );
					rg.append( 'stop' )
						.attr( 'offset', '65%' );
					rg.append( 'stop' )
						.attr( 'offset', '65%' );
					rg.append( 'stop' )
						.attr( 'offset', '100%' );
				}

				function _updateCursor () {
					sbCursor.attr({
						cx: sScale( _data.s ),
						cy: bScale( _data.b )
					});
				}

				var sbCursor = sbArea.select( '.a-D3ColorPicker-sbCursor' );
                var cursorDrag = d3.behavior.drag()
                    //.origin( function( d ) { return { x: sScale( d.s ), y: bScale( d.b ) }; } )
                    .on("drag", function( d ) {
                        d.s = sScale.invert( d3.event.x );
                        d.b = bScale.invert( d3.event.y );
                        sbCursor.attr({
                            cx: sScale( d.s ),
                            cy: bScale( d.b )
                        });
                        _updateAlphaOverlay();
                        _updateRGBControls();
                        _updateRGBControl();
                        _setColorOutput();
                        //_dispatchChange.apply( this, arguments );
                    })
                    .on("dragstart", function( d ) {
                        d.s = sScale.invert( d3.event.sourceEvent.offsetX );
                        d.b = bScale.invert( d3.event.sourceEvent.offsetY );
                        sbCursor.attr({
                            cx: sScale( d.s ),
                            cy: bScale( d.b )
                        });
                        _updateAlphaOverlay();
                        _updateRGBControls();
                        _updateRGBControl();
                        _setColorOutput();
                        //_dispatchChange.apply( this, arguments );
                    })
                    .on( 'dragend', function() {
						_dispatchChange.apply( this, [ _data ] );
                    });
				if ( sbCursor.empty() ) {

					sbCursor = sbArea.append( 'circle' )
						.classed( 'a-D3ColorPicker-sbCursor', true )
						.attr({
							r: 7
						});
				}
                
                sbArea.call( cursorDrag );
				_updateCursor();

				var alphaContainer = sbColumn.select( '.a-D3ColorPicker-alpha' );
				var alphaOverlay = alphaContainer.select( '.a-D3ColorPicker-alpha-overlay' );
				var alphaSlider = alphaContainer.select( '.a-D3ColorPicker-alpha-slider' );
				if ( alphaContainer.empty() ) {
					alphaContainer = sbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-alpha', true );

					alphaContainer.append( 'div' )
						.classed( 'a-D3ColorPicker-alpha-bg', true );

					alphaOverlay = alphaContainer.append( 'div' )
						.classed( 'a-D3ColorPicker-alpha-overlay', true );

					alphaSlider = alphaContainer.append( 'div' )
						.classed( 'a-D3ColorPicker-alpha-slider', true )
						.datum( _data.a )
						.call( alphaSliderGenerator );
				}

				_updateAlphaOverlay();
				_updateAlphaSlider();

				function _updateHueMark() {
					hueMark
						.datum( _data.h )
						.call( hueSliderGenerator );
				}

				var hueColumn = picker.select( '.a-D3ColorPicker-hueColumn' );
				var hueBar = hueColumn.select( '.a-D3ColorPicker-hueBar' );
				var hueMark = hueColumn.select( '.a-D3ColorPicker-hueMark' );
				if ( hueColumn.empty() ) {
					hueColumn = picker.append( 'div' )
						.classed( 'a-D3ColorPicker-hueColumn', true )
						.classed( 'a-D3ColorPicker-column', true );
					hueBar = hueColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-hueBar', true )
						.classed( 'a-D3ColorPicker-hueBar--ie9', IS_IE9 );
					hueMark = hueColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-hueMark', true )
						.datum( _data.h )
						.call( hueSliderGenerator );
				}

				_updateHueMark();

				function _dispatchChange () {
					var out = _data.toRGBAString();
                    var dat = rgbControl.datum();
					_setColorOutput( out );
					if ( out !== dat.last ) {
						dat.last = out;
						arguments[0] = out;
						dispatch.colorchange.apply( this, arguments );
					}
				}

				function _updateRGBControls () {
					var rgb = _data.rgb();
					rControl.node().value = rgb.r;
					gControl.node().value = rgb.g;
					bControl.node().value = rgb.b;
				}

				function _updateAlphaControl () {
					aControl.node().value = _data.a;
				}

				function _setColorOutput ( color ) {
                    color = color || _data.toRGBAString();
					colorOutput.style( 'background-color', color );
				}
				function _updateRGBControl () {
					rgbControl.node().value = _data.toRGBAString();
				}


				var rgbColumn = picker.select( '.a-D3ColorPicker-rgbColumn' );
				var colorOutput = rgbColumn.select( '.a-D3ColorPicker-colorOutput' );
				var rControl = rgbColumn.select( '.a-D3ColorPicker-control--r' );
				var gControl = rgbColumn.select( '.a-D3ColorPicker-control--g' );
				var bControl = rgbColumn.select( '.a-D3ColorPicker-control--b' );
				var aControl = rgbColumn.select( '.a-D3ColorPicker-control--a' );
				var rgbControl = rgbColumn.select( '.a-D3ColorPicker-control--rgb' );
				if ( rgbColumn.empty() ) {
					rgbColumn = picker.append( 'div' )
						.classed( 'a-D3ColorPicker-rgbColumn', true )
						.classed( 'a-D3ColorPicker-column', true );
					
					rgbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-colorOutput-bg', true );
					colorOutput = rgbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-colorOutput', true );

					function _componentChangeHandler ( comp ) {
						return function ( d ) {
							var i = parseInt( this.value ) || 0;
							i = Math.max( 0, Math.min( 255, i ) );
							this.value = i;

							var rgb = _data.rgb();
							rgb = d3.rgb( comp === 'r' ? i : rgb.r, comp === 'g' ? i : rgb.g, comp === 'b' ? i : rgb.b );

							var hsb = d3.hsb( rgb.toString() );
							_data.h = hsb.h;
							_data.s = hsb.s;
							_data.b = hsb.b;

							_updateHueMark();
							_updateHueOverlay();
							_updateAlphaOverlay();
							_updateCursor();
							_updateRGBControl();
							_dispatchChange.apply( this, arguments );
						};
					}
					
                    
                    var rHandler = _componentChangeHandler( 'r' );
                    var rDebouncer = _debounce( 250, rHandler );
                    rgbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-controlLabel', true )
						.html('R:');
					rControl = rgbColumn.append( 'input' )
						.classed( 'a-D3ColorPicker-control', true )
						.classed( 'a-D3ColorPicker-control--r', true )
						.attr({
							type : 'number',
							min : 0,
							max : 255,
							step : 1
						})
						.on( 'keyup.colorpicker', rDebouncer )
						.on( 'change.colorpicker', rHandler );
                
                    
                    var gHandler = _componentChangeHandler( 'g' );
                    var gDebouncer = _debounce( 250, gHandler );
					rgbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-controlLabel', true )
						.html('G:');
					gControl = rgbColumn.append( 'input' )
						.classed( 'a-D3ColorPicker-control', true )
						.classed( 'a-D3ColorPicker-control--g', true )
						.attr({
							type : 'number',
							min : 0,
							max : 255,
							step : 1
						})
						.on( 'keyup.colorpicker', gDebouncer )
						.on( 'change.colorpicker', gHandler );
                
                    var bHandler = _componentChangeHandler( 'b' );
                    var bDebouncer = _debounce( 250, bHandler );
					rgbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-controlLabel', true )
						.html('B:');
					bControl = rgbColumn.append( 'input' )
						.classed( 'a-D3ColorPicker-control', true )
						.classed( 'a-D3ColorPicker-control--b', true )
						.attr({
							type : 'number',
							min : 0,
							max : 255,
							step : 1
						})
						.on( 'keyup.colorpicker', bDebouncer )
						.on( 'change.colorpicker', bHandler );
					
                    var aHandler = function () {
                        if ( ( this.value || '' ).length === 0 ) {
                            _data.a = this.value = 1;
                        } else if ( this.value.indexOf( '%' ) !== -1 ) {
                            _data.a = parseFloat( this.value ) / 100;
                        } else {
                            _data.a = parseFloat( this.value );
                        }

                        _updateRGBControl();
                        _updateAlphaSlider();
                        _dispatchChange.apply( this, arguments );
                    };
                    var aDebouncer = _debounce( 250, aHandler );
                    rgbColumn.append( 'div' )
						.classed( 'a-D3ColorPicker-controlLabel', true )
						.html('A:');
					aControl = rgbColumn.append( 'input' )
						.classed( 'a-D3ColorPicker-control', true )
						.classed( 'a-D3ColorPicker-control--a', true )
						.attr({
							type : 'number',
							min : 0,
							max : 1,
							step : 0.05
						})
						.on( 'keyup.colorpicker', aDebouncer)
						.on( 'change.colorpicker', aHandler );
                        
                    var rgbControlHandler = function(){
                        var v = (this.value || '').toString().toLowerCase().trim();
                        var a = _getAlpha( v );
                        var vStrippedAlpha = _stripAlpha( v );
                        var rgb = d3.rgb( vStrippedAlpha );
                        if ( rgb.toString() === '#000000' &&
                            ['#000','#000000','black','rgb(0,0,0)'].indexOf( vStrippedAlpha ) === -1) {
                            return;
                        }

                        rControl.node().value = rgb.r;
                        gControl.node().value = rgb.g;
                        bControl.node().value = rgb.b;

                        var hsb = d3.hsb( _RGBToHSB( rgb ) );

                        _data.h = hsb.h;
                        _data.s = hsb.s;
                        _data.b = hsb.b;
                        _data.a = a;

                        _updateCursor();
                        _updateAlphaOverlay();
                        _updateHueMark();
                        _updateHueOverlay();
                        _updateAlphaSlider();
                        _updateAlphaControl();

                        _dispatchChange.apply( this, arguments );
                    };
                    var rgbControlDebouncer = _debounce( 100, rgbControlHandler );
					rgbControl = rgbColumn.append( 'input' )
						.classed( 'a-D3ColorPicker-control', true )
						.classed( 'a-D3ColorPicker-control--rgb', true )
						.on( 'keyup.colorpicker', rgbControlDebouncer)
						.on( 'change.colorpicker', rgbControlHandler)
						.on( 'focus.colorpicker', function(){
							this.focus();
							this.select();
						});
				}

				_updateRGBControl();
                
                rgbControl.datum({
                    last : _data.toRGBAString()
                });
                
				_setColorOutput( _data.toRGBAString() );
				_updateAlphaControl();
				_updateRGBControls();

			});
		};


		d3.rebind(exports, dispatch, 'on');
		return exports;
	};
})( window.d3, window.navigator );
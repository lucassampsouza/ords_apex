/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function( d3 ) {
    if ( !d3 ) {
        throw 'D3 is required for this plugin';
    }

    if ( !d3.oracle ) {
        d3.oracle = {};
    }

    var cssns = function() {
        var prefix = 'a',
            join = '-';

        function exports ( _s ) {

            if ( !_s || _s === '' ) {
                return prefix;
            } else if ( _s.indexOf( '.' ) === 0 ) {
                if ( _s.length > 1 ) {
                    return '.' + prefix + join + _s.substr( 1 );
                } else {
                    return '.' + prefix;
                }
            } else {
                return prefix + join + _s;
            }
        }

        exports.prefix = function ( _x ) {
            if ( _x === undefined ) {
                return prefix;
            }
            prefix = _x;
            return exports;
        };
        exports.join = function ( _x ) {
            if ( _x === undefined ) {
                return join;
            }
            join = _x;
            return exports;
        };

        return exports;
    };

    function shadePicker () {
        var _ = cssns()
            .prefix( 'a-D3Palette-shadePicker' )
            .join( '-' );

        var dispatch = d3.dispatch( 'shadechange' ),
            margin = {
                top : 10,
                left : 10,
                right : 10,
                bottom : 10
            },
            width = 100,
            shades = 1,//TODO: look into adding more shade values later!!
            markerRadius = 20,
            accessors = {
                primary :       function( d ) { return d.primary; },
                rotation :      function( d ) { return d.rotation; },
                separation :    function( d ) { return d.separation; }
            },
            setters = {
                primary :       function( d, primary ) { d.primary = primary; },
                rotation :      function( d, rotation ) { d.rotation = rotation; },
                separation :    function( d, separation ) { d.separation = separation; },
                output :        function( d, output ) { d.output = output; }
            };

        function _clamp ( val, min, max ) {
            return Math.max( Math.min( val, max ), min );
        }
        function _circleClamp ( _coordinates, _radius ) {
            if ( Math.pow( _coordinates.x, 2 ) + Math.pow( _coordinates.y, 2 ) > Math.pow( _radius, 2 ) ) {
                // Clamping is required
                var angle = Math.atan2( _coordinates.y, _coordinates.x );
                _coordinates = {
                    x : Math.cos( angle ) * _radius,
                    y : Math.sin( angle ) * _radius
                };
            }
            return _coordinates;
        }

        function _exports ( _selection ) {
            _selection.each( function( _d ) {
                /*
                 * {
                 *  primary: d3 color instance
                 *  rotation: angle, in degrees [0, 360]
                 *  separation: in hsb space distance [0, 100] 
                 * }
                 */

                var self = d3.select( this );
                var svg = self.select( _('.svg') );

                if ( svg.empty() ) {
                    svg = self.append( 'svg' )
                        .classed( _('svg'), true );
                }
                svg.attr({
                    width : width + margin.left + margin.right,
                    height : width + margin.top + margin.bottom
                });

                var g = svg.select( _('.g') );
                if ( g.empty() ) {
                    g = svg.append( 'g' )
                        .classed( _('g'), true );
                }
                g.attr({
                    transform : 'translate(' + ( width / 2 + margin.left ) + ',' + ( width / 2 + margin.top ) + ')'
                });

                function _getCoordinatesFromSB( _sb, _radius ) {
                    var pX = _sb.b / 50 - 1;
                    var pY = _sb.s / 50 - 1;
                    var pTh = Math.atan2( pY, pX );
                    var xSlice = Math.abs( Math.cos( pTh ) * _radius );
                    var ySlice = Math.abs( Math.sin( pTh ) * _radius );
                    var xScale = d3.scale.linear()
                        .domain( [-1, 1] )
                        .range( [-xSlice, xSlice]);
                    var yScale = d3.scale.linear()
                        .domain( [-1, 1] )
                        .range( [-ySlice, ySlice]);
                    return {
                        x : xScale( pX ),
                        y : yScale( pY )
                    };
                }

                function _getMarkerCoordinates( _mType, _i ) {
                    var primaryX = parseFloat( primaryMarker.attr('cx') );
                    var primaryY = -parseFloat( primaryMarker.attr('cy') );
                    var deltaX = Math.cos( accessors.rotation.call( this, _d ) * Math.PI / 360 ) * accessors.separation.call( this, _d );
                    var deltaY = Math.sin( accessors.rotation.call( this, _d ) * Math.PI / 360 ) * accessors.separation.call( this, _d );
                    var markerCoordinates = {};
                    switch ( _mType ) {
                        case 'primary':
                            var primaryHSB = d3.hsb( accessors.primary.call( this, _d ) );
                            var primaryCoordinates = _getCoordinatesFromSB( primaryHSB, width / 2 );
                            markerCoordinates.x = primaryCoordinates.x;
                            markerCoordinates.y = primaryCoordinates.y;
                            break;
                        /*default:
                         var factor = ( _mType.indexOf( '-l') > -1 ? -1 : 1 ) / ( markersData.length - 1 - Math.floor( ( _i - 1 ) / 2 ) );
                         markerCoordinates.x = primaryX - deltaX * factor;
                         markerCoordinates.y = primaryY - deltaY * factor;
                         break;*/
                        case 'mid-l':
                            markerCoordinates.x = primaryX - deltaX / 2;
                            markerCoordinates.y = primaryY - deltaY / 2;
                            break;
                        case 'mid-r':
                            markerCoordinates.x = primaryX + deltaX / 2;
                            markerCoordinates.y = primaryY + deltaY / 2;
                            break;
                        case 'far-l':
                            markerCoordinates.x = primaryX - deltaX;
                            markerCoordinates.y = primaryY - deltaY;
                            break;
                        case 'far-r':
                            markerCoordinates.x = primaryX + deltaX;
                            markerCoordinates.y = primaryY + deltaY;
                            break;
                    }
                    markerCoordinates = _circleClamp( markerCoordinates, width / 2 );
                    return markerCoordinates;
                }

                function _getSBFromCoordinates( _coordinates, _radius ) {
                    var pTh = Math.atan2( _coordinates.y, _coordinates.x );
                    var pR = Math.sqrt( Math.pow( _coordinates.x, 2 ) + Math.pow( _coordinates.y, 2 ) );
                    var xSlice = Math.sqrt( Math.abs( Math.pow( _radius, 2 ) - Math.pow( pR * Math.cos( pTh ), 2 ) ) );
                    var ySlice = Math.sqrt( Math.abs( Math.pow( _radius, 2 ) - Math.pow( pR * Math.sin( pTh ), 2 ) ) );
                    var sScale = d3.scale.linear()
                        .domain( [-ySlice, ySlice] )
                        .range( [1, 100] )
                        .clamp( true );
                    var bScale = d3.scale.linear()
                        .domain( [-xSlice, xSlice] )
                        .range( [1, 100] )
                        .clamp( true );
                    return {
                        s : sScale( _coordinates.y ),
                        b : bScale( _coordinates.x )
                    };
                }

                function reshade() {
                    var h = d3.hsl( _d.primary ).h;
                    var output = [];
                    markers.each( function() {
                        var self = d3.select( this );
                        var coordinates = {};
                        coordinates.x = parseFloat( self.attr( 'cx' ) );
                        coordinates.y = parseFloat( self.attr( 'cy' ) );
                        var hsb = _getSBFromCoordinates( coordinates, width / 2 );
                        hsb.h = h;
                        output.push( d3.hsb( hsb ).toString() );
                    });
                    setters.output.call( this, _d, output );
                }

                function _outputShades() {
                    _d.reshade = reshade;
                    reshade();
                    dispatch.shadechange.call( self, _d );
                }

                var markersData;
                switch ( shades ) {
                    case 5 :
                        markersData = [ 'primary', 'mid-l', 'mid-r', 'far-l', 'far-r' ];
                        break;
                    case 3:
                        markersData = [ 'primary', 'far-l', 'far-r' ];
                        break;
                    default:
                        markersData = [ 'primary' ];
                }
                var markersDrag = d3.behavior.drag()
                    .on( 'drag', function( _mType, _i ) {
                        var newX = d3.event.x;
                        var newY = -d3.event.y;
                        if ( _mType === 'primary' ) {
                            var primaryHSB = d3.hsl( _d.primary  );
                            var newCoordinates = _circleClamp( { x: newX, y: newY }, width / 2 );
                            var newPrimarySB = _getSBFromCoordinates( newCoordinates, width / 2 );
                            primaryHSB.s = newPrimarySB.s;
                            primaryHSB.b = newPrimarySB.b;
                            var rgb = d3.rgb( primaryHSB );
                            _d.primary = rgb.toString();
                            primaryMarker.attr({
                                cx : newCoordinates.x,
                                cy : -newCoordinates.y
                            });
                        } else {

                            var primaryCoordinates = {
                                x : parseFloat( primaryMarker.attr( 'cx' ) ),
                                y : parseFloat( -primaryMarker.attr( 'cy' ) )
                            };
                            if ( _mType.indexOf( '-l' ) > -1 ) {
                                setters.rotation.call( self.node(), _d, ( 2 * ( Math.atan2( newY - primaryCoordinates.y, newX - primaryCoordinates.x ) * 180 / Math.PI + 1080 - 180 ) ) % 360 );
                            } else if ( _mType.indexOf( '-r' ) > -1 ) {
                                setters.rotation.call( self.node(), _d, ( 2 * ( Math.atan2( newY - primaryCoordinates.y, newX - primaryCoordinates.x ) * 180 / Math.PI + 1080 ) ) % 360 );
                            }
                            var npp = Math.floor( ( markersData.length - 1 ) / 2 );
                            var pair = Math.floor( ( _i + 1 ) / 2 );
                            var factor = npp / pair;
                            setters.separation.call( self.node(), _d, factor * Math.sqrt( Math.pow( newX - primaryCoordinates.x, 2 ) + Math.pow( newY - primaryCoordinates.y, 2 ) ) );
                        }

                        _updateMarkers( false );
                        _outputShades( self.node() );

                    });

                var markers = g.selectAll( _('.marker') )
                    .data( markersData );

                var primaryMarker;
                markers.exit().remove();
                markers.enter()
                    .append( 'circle' )
                    .classed( _('marker'), true );

                primaryMarker = d3.select( markers[0][0] );
                markers.call( markersDrag )
                    .each( function( _mType ) {
                        var self = d3.select( this );
                        for ( var i in markersData ) {
                            self.classed( _( 'marker-' + markersData[i] ), markersData[i] === _mType );
                        }
                    })
                    .attr({
                        r : markerRadius
                    });

                function _updateMarkers( _updatePrimary ) {
                    var outs = [];
                    markers.each( function( _mType, _i ) {
                        var self = d3.select( this );
                        var markerCoordinates = _getMarkerCoordinates.call( this, _mType, _i );
                        markerCoordinates = _circleClamp( markerCoordinates, width / 2 );
                        outs.push( _getSBFromCoordinates( markerCoordinates, width / 2 ) );
                        if ( !_updatePrimary && _mType === 'primary' ) return;
                        self.attr({
                            cx : markerCoordinates.x,
                            cy : -markerCoordinates.y
                        });
                    });
                }

                _updateMarkers( true );
                dispatch.shadechange.call( self, _d );
            });
        }

        function _getBasicGetterSetter ( prop ) {
            return eval('(function(_x){ if (_x === undefined){ return ' + prop + '; } ' + prop + '=_x; return _exports; })');
        };

        function _getObjectGetterSetter ( _obj ) {
            return function ( _prop, _x ) {
                if ( _x === undefined && _prop !== undefined ) {
                    return _obj[ _prop ];
                } else if ( _x !== undefined && _prop !== undefined ) {
                    _obj[ _prop ] = d3.functor( _x );
                    return _exports;
                } else {
                    return _obj;
                }
            };
        };

        _exports.width =            _getBasicGetterSetter( 'width' );
        _exports.height =           _getBasicGetterSetter( 'height' );
        _exports.markerRadius =     _getBasicGetterSetter( 'markerRadius' );
        _exports.shades =           function( _x ) {
            var r = _getBasicGetterSetter( 'shades' ).apply( this, arguments );
            if ( _x !== undefined ) {
                shades = parseInt( shades );
                shades = _clamp( shades % 2 ? shades : shades + 1, 1, 5 );
                return _exports;
            }
            return r;
        };
        _exports.margin =           function(_x){
            if (_x === undefined) {
                return margin;
            }
            margin = _x;
            return _exports;
        };
        _exports.accessors =        _getObjectGetterSetter( accessors );
        _exports.setters =          _getObjectGetterSetter( setters );

        d3.rebind( _exports, dispatch, 'on' );
        return _exports;
    };

    d3.oracle.shadePicker = shadePicker;

    d3.oracle.palette = function() {

        var dispatch = d3.dispatch( 'palettechange' ),
            width = 300,
            radius = 5,
            mode = 'triad',
        //  use monochrome, triad, or tetrad
            complimentary = true,
            accessors = {
                primary :       function( d ) { return d.primary; },
//                shades:         function( d ) { return d.shades; },
                separation :    function( d ) { return d.separation; },
                offset :        function( d ) { return d.offset || 1.8; },
                shades : {
                    rotation :  function( d ) { return d.shades.rotation; },
                    separation :  function( d ) { return d.shades.separation; }
                }
            },
            setters = {
                primary :       function( d, primary ) { d.primary = primary; },
                separation :    function( d, separation ) { d.separation = separation; },
                offset :        function( d, offset ) { d.offset = offset; },
                output :        function( d, output ) { d.output = output; },
                shades : {
                    rotation :  function( d, rotation ) { d.shades.rotation = rotation; },
                    separation: function( d, separation ) { d.shades.separation = separation; }
                }
            };

        function _clamp ( val, min, max ) {
            return Math.max( Math.min( val, max ), min );
        }

        function _exports ( _selection ) {
            _selection.each( function( _d ) {
                /*
                 * {
                 *  primary: d3 color instance
                 *  separation: angle, in degrees
                 *  offset: integer, as a percentage (+ or -)
                 * }
                 */

                var self = d3.select( this );
                var svg = self.select( '.a-D3Palette' );
                var g = svg.select( '.a-D3Palette-group' );
                var shadeHue = g.select( '.a-D3Palette-shade' );
                var shadePickerContainer = g.select( '.a-D3Palette-shadePickerContainer' );
                var shadePickerGenerator = d3.oracle.shadePicker()
                    .markerRadius( radius )
                    .margin({
                        top: radius / 2,
                        left: radius / 2,
                        right: radius / 2,
                        bottom: radius / 2
                    })
                    .width( width - 8 * radius );
                if ( svg.empty() ) {
                    svg = self.append( 'svg' )
                        .attr({
                            width : width,
                            height : width
                        })
                        .classed( 'a-D3Palette', true );
                    g = svg.append( 'g' )
                        .attr({
                            transform : 'translate(' + (width/2) + ','+ (width/2) + ')'
                        })
                        .classed( 'a-D3Palette-group', true );

                    var arc = d3.svg.arc()
                        .startAngle(function(d,i){ return Math.PI/2+ i / arcData.length * 2 * Math.PI; })
                        .endAngle(function(d,i){ return Math.PI/2+ (i+1) / arcData.length * 2 * Math.PI; })
                        .innerRadius( width / 2 - 4 * radius )
                        .outerRadius( width / 2 );

                    var arcData = d3.range( 200 );
                    g.selectAll( '.a-D3Palette-arc' )
                        .data(arcData)
                        .enter()
                        .append('path')
                        .classed( 'a-D3Palette-arc', true )
                        .attr({
                            d: arc,
                            fill: function(d,i){
                                return d3.hsl((i+1) / arcData.length * 360, 1, 0.5).toString();
                            }
                        });


                    shadeHue = g.append( 'circle' )
                        .classed( 'a-D3Palette-shade', true )
                        .attr({
                            'r': width / 2 - 4 * radius,
                            'cx':  0,
                            'cy':  0,
                            'fill': d3.rgb( accessors.primary( _d ).hsl() )
                        });

                    g.append( 'svg:image' )
                        .attr({
                            'xlink:href': window.apex_img_dir + 'libraries/d3.oracle.palette/0.1/shade-circle.png',
                            'width': 2 * (width / 2 - 4 * radius),
                            'height': 2 * (width / 2 - 4 * radius),
                            'x':  (width / 2 - 4 * radius)*(-1),
                            'y':  (width / 2 - 4 * radius)*(-1),
//                            'transform': "scale(1,-1)"
                        });
                    shadePickerContainer = g.append( 'g' )
                        .classed( 'a-D3Palette-shadePickerContainer', true )
                        .attr( 'transform', 'translate(' + (-(width - 8 * radius + radius)/2) + ',' + (-(width - 8 * radius + radius)/2) + ')');

                    g.append( 'circle' )
                        .classed( 'a-D3Palette-arc-border', true )
                        .attr( 'r', width / 2 - 4 * radius );
                    g.append( 'circle' )
                        .classed( 'a-D3Palette-arc-border', true )
                        .attr( 'r', width / 2 );
                }

                var hsb = d3.hsb( accessors.primary( _d ).toString() );
//                hsb.s=50;
//                hsb.b=50;
                if (_d.shading) {
                    _d.shading = d3.rgb(_d.shading.r, _d.shading.g, _d.shading.b);
                    var hsb = d3.hsb(_d.shading.toString());
                    hsb.s = 100 - hsb.s;
                }
                shadePickerContainer.datum({
                    primary: hsb.toString(),
                    separation: accessors.separation( _d ),
                    rotation: 30
                }).call(shadePickerGenerator);


                var circles = [ 'primary' ];
                if ( mode !== 'tetrad' ) {
                    if ( complimentary ) {
                        circles.push( 'complimentary' );
                    }
                    if ( mode === 'triad' ) {
                        circles.push( 'cleft' );
                        circles.push( 'cright' );
                    } else if ( mode === 'dual' ) {
                        circles.push( 'both' );
                    }
                } else {
                    circles.push( 'complimentary' );
                    circles.push( 'cleft' );
                    circles.push( 'pleft' );
                }

                var hueMarkers = g.selectAll( '.a-D3Palette-hue-marker' )
                    .data( circles );

                hueMarkers.exit().remove();

                function _getHueMarkerX ( markerType ) {
                    return ( width / 2 - 2 * radius ) * Math.cos( _getHueMarkerAngle( markerType ) * Math.PI / 180 );
                }
                function _getHueMarkerY ( markerType ) {
                    return ( width / 2 - 2 * radius ) * Math.sin( _getHueMarkerAngle( markerType ) * Math.PI / 180 );
                }

                function _getHueMarkerAngle ( markerType ) {
                    var pHue = accessors.primary( _d ).hsl().h + 360;
                    var pSeparation = accessors.separation( _d );
                    var cHue;
                    switch ( markerType ) {
                        case 'primary' :
                            cHue = pHue;
                            break;
                        case 'complimentary' :
                            cHue = (pHue + 180) % 360;
                            break;
                        case 'cleft' :
                            cHue = (pHue + 180 + pSeparation) % 360;
                            break;
                        case 'pleft' :
                            cHue = (pHue + pSeparation) % 360;
                            break;
                        case 'cright' :
                            cHue = (pHue + 180 - pSeparation) % 360;
                            break;
                        case 'both' :
                            cHue = (pHue + 180 - pSeparation) % 360;
                            break;
                    }
                    return cHue;
                }

                hueMarkers.enter()
                    .append( 'circle' )
                    .classed( 'a-D3Palette-hue-marker', true );

                var hueMarkerDrag = d3.behavior.drag()
                    .on( 'drag', function( markerType ) {
                        var newX = d3.event.x;
                        var newY = -d3.event.y;
                        var oldX = _getHueMarkerX(markerType);
                        var oldY = -_getHueMarkerY(markerType);

                        var newTh = (Math.atan2( newY, newX ) * 180 / Math.PI + 1080) % 360;
                        var oldTh = (Math.atan2( oldY, oldX ) * 180 / Math.PI + 1080) % 360;
                        if ( Math.abs(newTh - oldTh) > 180 ) {
                            if (newTh > oldTh) {
                                newTh = newTh - 360;
                            }else {
                                oldTh = oldTh - 360;
                            }
                        }


                        var deltaTh = newTh - oldTh;

                        var primaryHSL = accessors.primary( _d ).hsl();
                        var separation = accessors.separation( _d );
                        if ( [ 'primary', 'complimentary' ].indexOf( markerType ) > -1 ) {
                            primaryHSL.h = ( primaryHSL.h - ( deltaTh ) ) % 360;
                            setters.primary( _d, primaryHSL.rgb() );
                        } else if ( [ 'cleft', 'pleft' ].indexOf( markerType ) > -1 ) {
                            separation = _clamp( separation - ( deltaTh ), 10, 170 );
                            setters.separation( _d, separation );
                        } else if ( markerType === 'cright' ) {
                            separation = _clamp( separation + ( deltaTh ), 10, 170 );
                            setters.separation( _d, separation );
                        } else if ( markerType === 'both' ) {
                            separation = _clamp( separation + ( deltaTh ), -170, 170 );
                            setters.separation( _d, separation );
                        }

                        _refreshHueMarkers();
                        _refreshShadePalette();
                        if ( shade ) {
                            shade.reshade();
                            _d.shading = d3.rgb(shade.output[0]);
                        }
                        _outputPalette();
                        dispatch.palettechange.call( self, _d );
                    });
                var shade = null;
                shadePickerGenerator.on("shadechange", function( d ) {
                    shade = d;
                    _d.shading = d3.rgb(shade.output[0]);
                    _outputPalette();
                    dispatch.palettechange.call( self, _d );
                });

                function _refreshHueMarkers() {
                    hueMarkers
                        .attr({
                            cx : _getHueMarkerX,
                            cy : _getHueMarkerY
                        });
                };

                function _outputPalette() {
                    var shadedColor =  _d.shading;
                    var output = [];
                    var currentGroup;
                    var currentType;
                    var currentHue;
                    var currentColor;
                    for ( var i = 0; i < circles.length; i++ ) {
                        currentGroup = [];
                        currentType = circles[ i ];
                        for ( var j = 0; j < 5; j++ ) {
                            currentHue = _getHueMarkerAngle( currentType );
                            currentColor = !shadedColor || j === 0 ? d3.hsl( currentHue, 1, 0.5 ) : shadedColor;
                            if (j < 2) {
                                currentColor = currentColor.brighter( (2 - j) / accessors.offset.call( self, _d ) );
                            } else if ( j > 2 ) {
                                currentColor = currentColor.darker( (j - 2) / accessors.offset.call( self, _d ) );
                            }
                            currentGroup.push( currentColor.toString() );
                        }
                        output.push( currentGroup );
                    }
                    setters.output( _d, output );
                };

                function _refreshShadePalette() {
                    shadeHue.attr('fill', d3.rgb(accessors.primary( _d ).hsl()));
                    if (shade) {
                        shade.primary = accessors.primary( _d );
                    }
                };

                hueMarkers
                    .attr({
                        r : radius
                    })
                    .classed( 'a-D3Palette-hue-marker--primary', function( type ){ return type === 'primary'; })
                    .classed( 'a-D3Palette-hue-marker--complimentary', function( type ){ return type === 'complimentary'; })
                    .call( hueMarkerDrag );

                _refreshHueMarkers();
                _outputPalette();
                _refreshShadePalette();
            });
        };

        function _getBasicGetterSetter ( prop ) {
            return eval('(function(_x){ if (_x === undefined){ return ' + prop + '; } ' + prop + '=_x; return _exports; })');
        };

        function _getObjectGetterSetter ( _obj ) {
            return function ( _prop, _x ) {
                if ( _x === undefined && _prop !== undefined ) {
                    return _obj[ _prop ];
                } else if ( _x !== undefined && _prop !== undefined ) {
                    _obj[ _prop ] = d3.functor( _x );
                    return _exports;
                } else {
                    return _obj;
                }
            };
        };

        _exports.width =            _getBasicGetterSetter( 'width' );
        _exports.mode =             _getBasicGetterSetter( 'mode' );
        _exports.complimentary =    _getBasicGetterSetter( 'complimentary' );
        _exports.radius =           _getBasicGetterSetter( 'radius' );
        _exports.accessors =        _getObjectGetterSetter( accessors );
        _exports.setters =          _getObjectGetterSetter( setters );

        d3.rebind( _exports, dispatch, 'on' );
        return _exports;
    };

})( window.d3 );
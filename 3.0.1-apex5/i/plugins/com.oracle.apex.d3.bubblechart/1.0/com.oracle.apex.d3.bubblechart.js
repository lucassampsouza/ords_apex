/*
 * D3 Bubble Chart Plug-in v1.0 - http://apex.oracle.com/plugins
 *
 * Based on D3 http://www.d3js.org/
 *
 */
(function( util, server, $, d3 ) {

  var LEGEND_COLUMN_WIDTH = 200,
      IE_UP_TO_10 = /MSIE \d/.test(navigator.userAgent),
      IE_11_AND_UP = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
    
  var IS_IE = IE_UP_TO_10 || IE_11_AND_UP;

  /**
   * Initialization function
   * @param {String} pRegionId 
   * @param {Number} pAjaxId
   * @param {String} pColors Colors hexadecimal number separated by ':'
   * @param {String} pMinAr Minimum numeric value to preserve aspect ratio
   * @param {Number} pMaxAr Maximum numeric value to preserve aspect ratio
   * @param {Number} pMinHeight Minimum height for chart
   * @param {Number} pMaxHeight Maximum height for chart
   * @param {String} pPageItemsSubmit
   * @param {Boolean} pShowTooltip
   * @param {Boolean} pTooltipSeries
   * @param {Boolean} pTooltipCustom
   * @param {Boolean} pShowLegend
   * @param {String} pLegendPosition It can be 'TOP' or 'BOTTOM'
   * @param {String} pSorting It can be 'D3ASCENDING', 'D3DESCENDING', 'ASCENDING' or 'DESCENDING'
   */
  com_oracle_apex_d3_bubble_start = function(
    pRegionId,
    pAjaxId,
    pColors,
    pColorsFg,
    pConfig,
    pMinAR,
    pMaxAR,
    pMinHeight,
    pMaxHeight,
    pPageItemsSubmit,
    pShowTooltip,
    pTooltipSeries,
    pTooltipCustom,
    pTooltipValue,
    pShowLegend,
    pSorting,
    pLegendPosition
  ){
    //'g' prefix to show that this variables correspond to a global context inside the plugin
    var gRegion$,
        gChart$,
        gTooltip$,
        gLegend$,
        gContainer,
        gPack,
        gTooltipColor,
        gData,
        gColorScale,
        gColorScaleForeground,
        gAry;

    var gClassScale = d3.scale.ordinal()
              .range( d3.range( 1, 16 ) ),
        gTooltipGenerator = d3.oracle.tooltip()
                            .accessors({
                                label : function( d ) {
                                          if(pTooltipSeries){
                                            return d.COLORVALUE;
                                          }else{
                                            null;
                                          }
                                        },
                                value : null,
                                color : function() { return gTooltipColor },
                                content : function( d ) {
                                      var string = "";
                                      if(pTooltipCustom){
                                        string += d.TOOLTIP+" \n";
                                      }

                                      if(pTooltipValue){
                                        string += d.SIZEVALUE;
                                      }
                                      return string;
                                    }
                            })
                            .symbol( 'circle' );
    //If user sends custom color string define a scale
    gColorScale = pColors ? d3.scale.ordinal()
            .range( pColors.split( ':' ) ) : undefined;
    //If user sends custom color string define a scale for foreground
    gColorScaleForeground = pColorsFg ? d3.scale.ordinal()
                .range( pColorsFg.split( ':' ) ) : undefined;

    //Accesors of information
    var colorAccessor = function(d) { return gColorScale ? gColorScale(d.COLORVALUE) : null; };
    var fgColorAccessor = function(d) { return gColorScaleForeground ? gColorScaleForeground(d.COLORVALUE) : null; };

    //Configuration object
    var config = {
          "trdur":                       500,
          "bubble_padding":              2.5,
          "opacity_normal":              "0.8",
          "opacity_highlight":           "1.0",
          "label_fontsize":              "11pt",
          "label_fontfamily":            "Sans-Serif",
          "label_fontsize_highlight":    "13pt",
          "circle_highlight_radiusplus": 5
        };

    var dConfig = "";

    try {
      dConfig = JSON.parse(pConfig);
    } catch (e) {
      dConfig = {};
    }

    for (var attrname in dConfig) { config[attrname] = dConfig[attrname]; }

    //Include moveToFront function
    if (!d3.selection.prototype.moveToFront) {
      d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
      };
    }

    /**
     * Fire apex event
     * @param {String} e Event to fire 
     * @param {Object} d Element that fires the event
     */
    function _fireApexEvent( e, d ) {
      apex.event.trigger(
        $x(pRegionId),
        "com_oracle_apex_d3_" + e, 
        d
      );
    }

    /**
     * Sort data sent from server go get groupings or categories based on the COLORVALUE attribute of the objects and assign a color
     * @param {Object} data
     * @return {Object} 
     */
    function _sortDataToGetGroupings( data ){
      return  oracle.jql()
              .select( [function(rows){ return colorAccessor(rows[0]) }, 'color'] )
              .from( gPack.nodes(data).filter(function(d) {return !d.row; }) )
              .group_by( [function(row){ return row.COLORVALUE; }, 'classifications'] )();
    }

    /**
     * Assigns the corresponding theme roller class to an object
     * @param {Object} object DOM element to assign a class
     * @param {Object} arguments Properties of that object
     */
    function _assignThemeRollerClassesToObject( object, arguments ){
        d3.select( object )
        .classed( 'u-Color-' + gClassScale( arguments[0].COLORVALUE ) + '-BG--fill', true);
    }

    /**
     * Assigns the corresponding theme roller class to an object
     * @param {Object} d D3 properties corresponding to a DOM element
     * @return {String} 
     */
    function _assignFillThemeRollerClass( d ){
      return 'u-Color-' + gClassScale( d.COLORVALUE ) + '-FG--fill';
    }

    /**
     * Determine if width of text fits bubble, if it is not remove characters and concatenate "..."
     * @param {Object} object D3 properties corresponding to a DOM element
     * @param {Object} d D3 properties corresponding to a DOM element
     * @return {String} Truncated Text
     */
    function _textEllipsis( object, d ) {
      var self = d3.select(object);
          self.text(d.LABEL);
      var textLength = self.node().getComputedTextLength(),
          text = self.text();
      while (textLength > ((d.r * 2) - 2 * 15) && text.length > 0) { //Check if bubble diameter (d.r * 2) fits the width of the text, if not slice string
          text = text.slice(0, -1);
          self.text(text);
          textLength = self.node().getComputedTextLength();
      }
      if( text.length < d.LABEL.length && text.length > 0 )
        return text + '...';
      else
        return text;
    }
    
    /**
     * Returns a set of properties for the text that shows inside the bubbles
     * @param {Object} node D3 element corresponding to a bubble
     * @return {Object} Text element
     */
    function _textInsideBubbles( node ){
      var changedNode = node.append("text")
                  .attr("dy", ".3em")
                  .attr("font-size", config.label_fontsize)
                  .attr("font-family", config.label_fontfamily)
                  .attr("fill", fgColorAccessor)
                  .style("text-anchor", "middle")
                  .text(function(d) {
                    return _textEllipsis(this, d);
                  });
      if( !gColorScaleForeground ){
        changedNode.attr("class", _assignFillThemeRollerClass );
      }
      return changedNode;
    }

    /**
     * Initialize Legend with new data and width of the chart area
     * @param {Object} node D3 element corresponding to a bubble
     */
    function _initializeLegend( data, width ){
      gAry = d3.oracle.ary()
          .hideTitle( true )
          .showValue( false )
          .leftColor( true )
          .numberOfColumns( Math.max( Math.floor( width / LEGEND_COLUMN_WIDTH ), 1 ) )
          .accessors({
              color: function(d) { return d.color; },
              label: function(d) { return d.classifications; }
          })
          .symbol('circle');
      d3.select( gLegend$.get(0) )
        .datum(data)
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
                    self.classed( 'u-Color-' + gClassScale( d.classifications ) + '-BG--bg', true );
                })
        });
    }

    /**
     * If tootltip attribute was sent show it on mouse over event
     * @param {Object} object D3 element corresponding to a bubble
     * @param {Object} d Properties of D3 element
     */
    function _mouseOverTooltip( object, d ){
      if ( pShowTooltip ) {
        gTooltipColor = window.getComputedStyle( object.getElementsByTagName('circle')[0] ).getPropertyValue( 'fill' );
        d3.select( gTooltip$.get(0) )
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
    }

    /**
     * Show mouse over effect on bubble
     * @param {Object} node D3 element corresponding to a bubble
     * @param {Object} d Properties of D3 element
     */
    function _mouseOverEffect( node, d ){
      var hlnode = node.filter(function(d1) {return d1.ID == d.ID;});
        
        hlnode
           .call(function (d) {_bringToFront(d);})
           .style({"opacity": config.opacity_highlight});
        hlnode
            .select("circle")
            .transition().duration(config.trdur / 2)
            .attr("r", function (d) {return d.r + config.circle_highlight_radiusplus;});
        hlnode
            .select("text")
            .transition().duration(config.trdur / 2)
            .attr("font-size", config.label_fontsize_highlight);
        _fireApexEvent("mouseover", d);
    }

    /**
     * Show mouse over effect on bubble
     * @param {Object} node D3 element corresponding to a bubble
     * @param {Object} d Properties of D3 element
     */
    function _mouseMoveEffect( node, d ){
        _mouseOverEffect( node, d );
        _fireApexEvent("mousemove", d);
    }

    /**
     * Show mouse out effect on bubble
     * @param {Object} node D3 element corresponding to a bubble
     * @param {Object} d Properties of D3 element
     */
    function _mouseOutEffect( node, d ){
      var hlnode = node.filter(function(d1) {return d1.ID == d.ID;});
        hlnode
           .style({"opacity": config.opacity_normal})
           .call(function (d) {_bringToFront(d);});
        hlnode
            .select("circle")
            .transition().duration(config.trdur / 2)
            .attr("r", function (d) {return d.r;});
        hlnode
            .select("text")
            .transition().duration(config.trdur / 2)
            .attr("font-size", config.label_fontsize);
      _fireApexEvent("mouseout", d);
    }

    /**
     * Hide Tooltip DOM Element
     */
    function _hideTooltip(){
      if ( pShowTooltip ) {
        gTooltip$.stop().fadeOut( 100 );
      }
    }

    /**
     * Bind click event to show link if it was sended
     * @param {Object} d Properties of D3 element
     */
    function _linkEvent( d ){
      if (d.LINK) {
          var win = apex.navigation.redirect(d.LINK);
          win.focus();
        }
        _fireApexEvent("click", d);
    }

    /**
     * Bind mouseover, mousemove, mouseout and click events
     * @param {Object} node D3 element corresponding to a bubble
     */
    function _bindEvents( node ){
      node.on("mouseover", function(d) {
        _mouseOverTooltip( this, d );
        _mouseOverEffect( node, d );
      });

      node.on("mousemove", function(d) {
        _mouseOverTooltip( this, d );
        _mouseMoveEffect( node, d );
      }); 

      node.on("mouseout", function(d) {
        _hideTooltip();
        _mouseOutEffect( node, d );
      });
      node.on("click", function(d) {
        _linkEvent( d );
      });
    }

    /**
     * Move bubble to front for IE
     * @param {Object} d Properties of D3 element
     */
    function _moveToFrontIE( d ) {
      gContainer.selectAll('.com_oracle_apex_d3bubblenode').sort(function(a, b) {
        if (a.ID === d.ID) {
          return 1;
        } else {
          if (b.ID === d.ID) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    }

    /**
     * Move bubble to front
     * @param {Object} d Properties of D3 element
     */
    function _bringToFront( d ) {
      if (config.circle_highlight_radiusplus > config.bubble_padding) {
        if (IS_IE) {
          d.each(function(d) {_moveToFrontIE(d);});
        } else {
          d.moveToFront();
        }
      }
    }

     /**
     * Calculates recommended height to preserve aspect ration
     * @return {Number} Recommended height 
     */
    function _recommendedHeight() {
      //Calculate the recommended height to preserve aspect ratio
      var minAR = pMinAR;
      var maxAR = pMaxAR;
      var w = gChart$.width();
      var h = (gChart$.height() === 0) ? (w/maxAR) : gChart$.height();
      var ar = w/h;
      if (ar < minAR) {
          h = w/maxAR + 1;
      } else if (ar > maxAR) {
          h = w/minAR - 1;
      }
      return Math.max(pMinHeight, Math.min(pMaxHeight, h));
    }

    /**
     * Resizes chart when window event is triggered
     */
    function _resizeFunction() {
      //On resize event change the chart configuration
      var height = _recommendedHeight();
      gContainer.attr("height", height);
      var width = gChart$.width();
      gContainer.attr("width",  width);
      
      var node = gContainer.selectAll(".com_oracle_apex_d3bubblenode");

      //Redefine gPack and nodes to fit new size
      gPack
        .size([width - config.circle_highlight_radiusplus, height - config.circle_highlight_radiusplus]);

      gPack.nodes(gData);

      node.transition()
        .duration(config.trdur)
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      node
        .selectAll("circle")
        .transition()
        .duration(config.trdur)
        .attr("r", function(d) { return d.r;}) ;

      var classifications = _sortDataToGetGroupings( gData );

      var textInsideBubble = node
        .selectAll("text")
        .transition()
        .duration(config.trdur)
        .text(function(d) { 
            return _textEllipsis(this, d);
        });

      if ( pShowLegend  && pLegendPosition )
          _initializeLegend( classifications, width );
    }

    /**
     * Adds or removes information from chart if apex refresh event was triggered
     * @param {Object} d3json Contains the information sent from the server
     */
    function _refreshData( d3json ) {
      //Keep a copy of d3json
      gData = d3json;

      //Define chart measurements
      var width = gChart$.width();
      var height = _recommendedHeight();

      //Add rownumber to d3json
      for ( var i = 0; i < d3json.row.length; i++ ) {
        d3json.row[i].rownum = i;
      } 

      //Filter classifications from the query results for future use on chart grouping and legends
      var classifications = _sortDataToGetGroupings(d3json);

      //Bubble chart definitions
      var node = gContainer.selectAll(".com_oracle_apex_d3bubblenode")
        .data(
           gPack.nodes(d3json).filter(function(d) {return !d.row; }),
           function(d) {return d.ID;}
        )
      ;

      //Define new bubbles that will enter the chart
      var nodeEnter = node.enter()
                          .append("g")
                          .attr("class",     "com_oracle_apex_d3bubblenode" )
                          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                          .attr("style",     "opacity: " + config.opacity_normal);

      //Append new bubbles with past definition
      nodeEnter.append("circle")
        .attr("r", "0")
        .style({
          "fill": colorAccessor,
        })
        .transition().duration(config.trdur)
        .attr("r", function(d) { return d.r; })

      if( !gColorScale ){
        nodeEnter.each(function (d) {
          _assignThemeRollerClassesToObject( this, arguments );
        });
      }

      //Define and assign new text inside new bubbles
      var textInsideBubbleEnter = _textInsideBubbles( nodeEnter );

      //Tooltip initialization
      if( pShowTooltip ){
        gTooltip$.hide();
      } 

      //Bind events to new bubbles
      _bindEvents( nodeEnter );

      //Update current bubbles
      node.select("circle")
          .transition().duration(config.trdur * 2)
          .attr("r", function (d) { return d.r; })
          .style({
            "fill": colorAccessor,
          });

      //If the bubble's position changes assign a transition
      node.transition().duration(config.trdur * 2)
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      //If link attribute is sent bind click link redirection to bubble
      node.on("click", function(d) {
        _linkEvent( d );
      });

      //Update bubble's text
      var textInsideBubble = node.select("text")
          .transition().duration(config.trdur * 2)
          .text(function(d) { 
            return _textEllipsis(this, d);
          })
      if ( !gColorScaleForeground ) {
        textInsideBubble
          .attr("class", _assignFillThemeRollerClass );
      };
      
      textInsideBubble.each(function (d) {
          d3.select( this )
            .text( function(d){ return _textEllipsis(this, d); } );
        });

      //Remove unnecesary bubbles
      node.exit()
        .select("text")
        .remove();
      node.exit()
        .select("circle")
        .transition().duration(config.trdur)
        .attr("r", "0");
      node.exit()
        .transition().duration(config.trdur)
        .remove();

      if ( pShowLegend && pLegendPosition ){
        _initializeLegend( classifications, width );
      }
    }
    
    /**
     * Initializes chart with the first set of data
     * @param {Object} d3json Contains the information sent from the server
     */ 
    function _draw( d3json ) {
      gRegion$ = $( "#" + pRegionId + "_region" );
      gChart$ = $( "#" + pRegionId + "_chart" ); 

      var width = gChart$.width();
      var height = _recommendedHeight();
      var sortingFunction;
      if( pSorting == 'D3ASCENDING' ){
        sortingFunction = d3.ascending;
      }else if( pSorting == 'D3DESCENDING' ){
        sortingFunction = d3.descending;
      }else if( pSorting == 'ASCENDING' ){
        sortingFunction = function(a, b) {
                              return -(a.value - b.value);
                          };
      }else if( pSorting == 'DESCENDING' ){
        sortingFunction = function(a, b) {
                              return a.value - b.value;
                          };
      }
      //Define gPack for bubbles
      gPack = d3.layout.pack()
            .size([width - config.circle_highlight_radiusplus, height - config.circle_highlight_radiusplus])  
            .sort(sortingFunction)   
            .value(function(d) { return d.SIZEVALUE; })
            .children(function(d) {return d.row;})
            .padding(config.bubble_padding);

      //Filter classifications from the query results for future use on chart grouping and legends
      var classifications = _sortDataToGetGroupings(d3json);

      //Define svg containing the bubble chart
      gContainer = d3.select( gChart$.get(0) ).append("svg")
        .attr("height", height);

      gContainer.attr("width",  width);
      gData = d3json;

      for (var i = 0; i < d3json.row.length; i++) {
        d3json.row[i].rownum = i;
      }

      //Define nodes for bubble
      var node = gContainer.selectAll(".com_oracle_apex_d3bubblenode")
        .data(gPack.nodes(d3json).filter(function(d) {return !d.row; }))
        .enter()
        .append("g")
        .attr("class",     "com_oracle_apex_d3bubblenode")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("style",     "opacity: 0.0");

      //Define node transition
      node.transition()
        .attr("style", "opacity: "+ config.opacity_normal)
        .duration(config.trdur);

      //Append svg circle element to node
      node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style({
          "fill": colorAccessor
        });

      if( !gColorScale ){
        node.each(function (d) {
          _assignThemeRollerClassesToObject( this, arguments );
        });
      }
      

      //Define and assign text inside bubbles
      var textInsideBubble = _textInsideBubbles( node );
        
        textInsideBubble.each(function (d) {
          d3.select( this )
            .text( function(d){ return _textEllipsis(this, d); } );
        });

      //Tooltip initialization
      if( pShowTooltip ){
        gTooltip$ = $( document.createElement( 'div' ) )
                .addClass( 'a-D3Tooltip a-D3BubbleChart-tooltip' )
                .appendTo( gChart$ )
                .hide();
      }

      //Bind events to bubbles
      _bindEvents( node ); 

      $(window).on("apexwindowresized", _resizeFunction);

      if ( pShowLegend && pLegendPosition ) {
        gLegend$ = $( document.createElement( 'div' ) );
        if ( pLegendPosition == 'TOP' ) {
            gChart$.before( gLegend$ );
        } else {
            gChart$.after( gLegend$ );
        }
        _initializeLegend( classifications, width );
      }

      //Hook refresh event to _refreshData function
      apex.jQuery("#"+pRegionId).bind(
        "apexrefresh", 
        function() { _getData(_refreshData); }
      );

      apex.event.trigger(
        $x(pRegionId),
        "com_oracle_apex_d3_initialized"
      );
    }

    /**
     * Executes apex server plugin functionalities
     * @param {Function} f function to execute if an event occurs
     */
    function _getData(f) {
      apex.server.plugin(
        pAjaxId,
        {
          pageItems: pPageItemsSubmit
        },   
        {
          success: f,
          dataType: "json"
        }
      );
    }

    //Initialize plugin
    _getData(_draw);
  }
})( apex.util, apex.server, apex.jQuery, d3 );
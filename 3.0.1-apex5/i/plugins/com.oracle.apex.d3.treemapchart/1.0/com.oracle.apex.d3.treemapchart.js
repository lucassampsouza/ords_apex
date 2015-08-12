/*
 * D3 Tree map Chart Plug-in v1.0 - http://apex.oracle.com/plugins
 *
 * Based on D3 http://www.d3js.org/
 *
 */
(function( util, server, $, d3 ) {

    var LEGEND_COLUMN_WIDTH = 200;

    /**
     * Initialization function
     * @param {String} pRegionId
     * @param {Number} pAjaxId
     * @param {String} pColors Colors hexadecimal number separated by ':'
     * @param {String} pColorsFg Colors hexadecimal number separated by ':'
     * @param {String} pConfig Configuration json
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
     */
    com_oracle_apex_d3_treemap_start = function (
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
                                  label : function(d){
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
        "opacity_normal":              "0.8",
        "opacity_highlight":           "1.0",
      }

      var dConfig = "";

      try {
        dConfig = JSON.parse(pConfig);
      } catch (e) {
        dConfig = {};
      }

      for (var attrname in dConfig) { config[attrname] = dConfig[attrname]; }

      /**
       * Fire apex event
       * @param {String} e Event to fire
       * @param {Object} d Element that fires the event
       */
      function _fireApexEvent(e, d) {
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
        return oracle.jql()
                .select( [function(rows){ return colorAccessor(rows[0]) }, 'color'] )
                .from( gPack.nodes(data).filter(function(d) { return d.COLORVALUE != ''; }) )
                .group_by( [function(row){ return row.COLORVALUE; }, 'classifications'] )();
      }

      /**
       * Assigns the corresponding theme roller class to an object
       * @param {Object} object DOM element to assign a class
       * @param {Object} arguments Properties of that object
       */
      function _assignThemeRollerClassesToObject( object, arguments ){
        d3.select( object )
          .classed( 'u-Color-' + gClassScale( arguments[0].COLORVALUE ) + '-BG--bg' +
            ' u-Color-' + gClassScale( arguments[0].COLORVALUE ) + '-FG--txt', true );
      }

      /**
       * Create object with hierachy from the parent id attribute of the information from the query
       * @param {Object} pData object that contains information from server
       * @return {Object} modified pData object with hierarchy
       */
      function _buildHierarchy( pData ) {

        var arrayOfIdsAndSequence = [];
        var arrayOfParentsAndTheirChilds = [];
        var rootnodes = [];

        var rootId = "com_oracle_apex_d3_treemap_node_id_"+pRegionId;
        var parentIdOfRoot = "parent_com_oracle_apex_d3_treemap_node_id_"+pRegionId;

        //Create a root parent node
        var newRoot = {
          "PARENT_ID":  parentIdOfRoot,
          "ID":         rootId,
          "SIZEVALUE":  1,
          "COLORVALUE": "",
          "DEPTH":      0,
          "LABEL":      "ROOT"
        };

        //Store pData IDs in arrayOfIdsAndSequence[ as keys and the sequence number as their value (eg. arrayOfIdsAndSequence[LO34]=2)
        for ( var i = 0; i < pData.row.length; i++ ) {
          arrayOfIdsAndSequence[pData.row[i].ID] = i;
        }

        //Assign the PARENT_ID of the new root to root nodes
        for ( var i = 0;i < pData.row.length; i++ ) {
          if (!(pData.row[i].PARENT_ID in arrayOfIdsAndSequence) || (pData.row[i].ID == pData.row[i].PARENT_ID)) {
            pData.row[i].PARENT_ID =  rootId;
          }
        }

        //Insert the parent node for the treemap hierarchy
        pData.row.push(newRoot);

        //Insert element in arrayOfIdsAndSequence containing the new root
        arrayOfIdsAndSequence[rootId] = pData.row.length - 1;

        /**
          * Create arrayOfParentsAndTheirChilds that contains all the PARENT_IDs found in pData
          * and their corresponding childs in an array
          * eg. arrayOfParentsAndTheirChilds[LO01]=[1,2,3,4]
          *     arrayOfParentsAndTheirChilds[LO02]=[5,6,7]
          */
        for ( var i = 0; i < pData.row.length; i++ ) {
          //If array for a node with certain PARENT_ID has not been created create it
          if (!(pData.row[i].PARENT_ID in arrayOfParentsAndTheirChilds)) {
            arrayOfParentsAndTheirChilds[pData.row[i].PARENT_ID] = [];
          }
          //Store in array the child node ID that corresponds to a certain PARENT_ID
          arrayOfParentsAndTheirChilds[pData.row[i].PARENT_ID].push(pData.row[i].ID);
        }

      /**
       * State hierarchy once the data was prepared
       * @param {Object} pData object that contains information from server
       * @param {String} pRootParentId string with the parent id
       * @param {Number} pDepth how deep is the hierarchy
       */
      function _buildHierarchy_core(pData, pRootParentId, pDepth) {
        var target = [];
        var lrow, ix;
          if (pRootParentId in arrayOfParentsAndTheirChilds) {
            for ( var i = 0; i < arrayOfParentsAndTheirChilds[pRootParentId].length; i++ ) {
              lrow = {};
              ix = arrayOfIdsAndSequence[arrayOfParentsAndTheirChilds[pRootParentId][i]];
              lrow.ID         = pData.row[ix].ID;
              lrow.SIZEVALUE  = pData.row[ix].SIZEVALUE;
              lrow.DEPTH      = pDepth,
              lrow.COLORVALUE = pData.row[ix].COLORVALUE;
              lrow.LABEL      = pData.row[ix].LABEL;
              lrow.TOOLTIP    = pData.row[ix].TOOLTIP;
              lrow.LINK       = pData.row[ix].LINK;
              lrow.ROWNUM     = ix;
              lrow.children = _buildHierarchy_core(pData, pData.row[ix].ID, pDepth + 1);
              target.push(lrow);
            }
          }
          return target;
        }

        //Create the actual pData hierarchy
        return _buildHierarchy_core(pData, parentIdOfRoot, 0);
      }

      /**
       * Get the actual width of the text from an object
       * @param {Object} object D3 properties corresponding to a DOM element
       * @return {Number} width of text in pixels
       */
      function _getTextWidth( object ){
        var prevText = object.text();
        object.text("");
        var appendedObject = object.append("span")
              .text(prevText);
        var width = $(object.node()).find('span:first').width();
        appendedObject.remove();
        return width;
      }

      /**
       * Determine if width of text fits the corresponding rectangular node's width, if it is not remove characters and concatenate "..."
       * @param {Object} object D3 properties corresponding to a DOM element
       * @param {Object} d D3 properties corresponding to a DOM element
       * @return {String} Truncated Text
       */
      function _textEllipsis( object, d ) {
        var self = d3.select(object);
          self.text(d.LABEL);
        var textLength = _getTextWidth(self),
            text = d.LABEL;
        while (textLength > (d.dx  - 2 * 6) && text.length > 0) { //Check if node width fits the width of the text, if not slice string
            text = text.slice(0, -1);
            self.text(text);
            textLength = _getTextWidth(self);
        }
        if( text.length < d.LABEL.length && text.length > 0 ){
          return text + '...';
        }else{
          return text;
        }
      }

      /**
       * Initialize Legend with new data and width of the chart area
       * @param {Object} node D3 element corresponding to a node
       */
      function _initializeLegend( data, width ){
        //Define legend plugin attributes
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
       * @param {Object} object D3 element corresponding to a node
       * @param {Object} d Properties of D3 element
       */
      function _mouseOverTooltip( object, d ){
        if ( pShowTooltip ) {
          gTooltipColor = window.getComputedStyle( object ).getPropertyValue( 'background-color' );

          d3.select( gTooltip$.get(0) )
              .datum( d )
              .call( gTooltipGenerator );
          gTooltip$.stop().fadeIn( 100 );

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
       * Show mouse over effect on node
       * @param {Object} node D3 element corresponding to a node
       * @param {Object} d Properties of D3 element
       */
      function _mouseOverEffect( node, d ){
        var hlnode = node.filter(function(d1) {return d1.ID == d.ID;});

        hlnode
          .style({"opacity": config.opacity_highlight});
         _fireApexEvent("mouseover", d);
      }

      /**
       * Show mouse over effect on node
       * @param {Object} node D3 element corresponding to a node
       * @param {Object} d Properties of D3 element
       */
      function _mouseMoveEffect( node, d ){
        _mouseOverEffect( node, d );
        _fireApexEvent("mouseover", d);
      }

      /**
       * Show mouse out effect on nodes
       * @param {Object} node D3 element corresponding to a node
       * @param {Object} d Properties of D3 element
       */
      function _mouseOutEffect( node, d ){
        var hlnode = node.filter(function(d1) {return d1.ID == d.ID;});

        hlnode
          .style({"opacity": config.opacity_normal});
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
        //If link attribute is sent bind click link redirection to node
        node.on("click", function(d) {
          _linkEvent( d );
        });
      }

      /**
       * Calculates recommended height to preserve aspect ration
       * @return {Number} Recommended height
       */
      function _recommendedHeight() {
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
        gContainer.style({"width": "", "height": ""});
        var height = _recommendedHeight();
        var width = gChart$.width();

        gContainer.style({"width": width + "px", "height": height + "px"});

        var node = gContainer.selectAll(".com_oracle_apex_d3_treemap_node");

        gPack.size([width, height]);
        gPack.nodes(gData);
        node
          .transition()
          .duration(config.trdur)
          .style("left", function(d) { return d.x + "px"; })
          .style("top", function(d) { return d.y + "px"; })
          .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
          .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; })
          .text(function(d) { return d.children ? "" : _textEllipsis(this, d); });

        var classifications = _sortDataToGetGroupings(gData);

        if ( pShowLegend && pLegendPosition ){
          _initializeLegend( classifications, width );
        }
      }

      /**
       * Adds or removes information from chart if apex refresh event was triggered
       * @param {Object} d3json Contains the information sent from the server
       */
      function _refreshData(d3json) {
        //Define chart measurements
        var width = gChart$.width();
        var height = _recommendedHeight();

        //Create hierarchy
        gData = _buildHierarchy(d3json)[0];

        //Filter classifications from the query results for future use on chart grouping and legends
        var classifications = _sortDataToGetGroupings(gData);

        //Define nodes
        var node = gContainer.selectAll(".com_oracle_apex_d3_treemap_node")
          .data(
             gPack.nodes(gData).filter(function(d) {return d.DEPTH != 0; }),
             function(d) {return d.ID;}
          );

        //Define and append new nodes that will enter the chart
        var nodeEnter = node.enter()
                            .append("div")
                            .attr("class",     "com_oracle_apex_d3_treemap_node")
                            .text(function(d) { return d.children ? "" : _textEllipsis(this, d); })
                            .style({"background-color": colorAccessor,
                                   "color": fgColorAccessor,
                                   "opacity": config.opacity_normal,
                                   "position": "absolute",
                                   "overflow": "hidden",
                                   "z-index": function(d) { return d.DEPTH; },
                                   "left": function(d) { return d.x + "px"; },
                                   "top":  function(d) { return d.y + "px"; },
                                   "width": "0px",
                                   "height": "0px"});

        //Define transitions for new nodes
        nodeEnter
          .transition()
          .duration(config.trdur)
          .style({"width": function(d) { return Math.max(0, d.dx - 1) + "px"; },
                 "height": function(d) { return Math.max(0, d.dy - 1) + "px"; }});

        //If link attribute is sent bind click link redirection to node
        nodeEnter.filter(function(d) {return !d.children;}).on("click", function(d) {
          _linkEvent( d );
        });

        //Tooltip initialization
        if( pShowTooltip ){
          gTooltip$.hide();
        }

        var nodeFilter = nodeEnter.filter(function(d) {return !d.children;});

        //Bind events to new nodes
        _bindEvents( nodeFilter );

        if(!gColorScale){
          nodeFilter.each(function (d) {
            _assignThemeRollerClassesToObject( this, arguments );
          });
        }

        //Update current nodes
        node
            .transition().duration(config.trdur * 2)
            .text(function(d) { return d.children ? "" : _textEllipsis(this, d); })
            .style({"background-color": colorAccessor,
                   "color": fgColorAccessor,
                   "position": "absolute",
                   "z-index": function(d) { return d.DEPTH; },
                   "left": function(d) { return d.x + "px"; },
                   "top":  function(d) { return d.y + "px"; },
                   "width": function(d) { return Math.max(0, d.dx - 1) + "px"; },
                   "height": function(d) { return Math.max(0, d.dy - 1) + "px"; }});

        //If link attribute is sent bind click link redirection to node
        node.filter(function(d) {return !d.children;}).on("click", function(d) {
          _linkEvent( d );
        });

        //Remove unnecesary nodes
        node.exit()
          .transition()
          .duration(config.trdur)
          .style({"width": "0px", "height": "0px"})
          .remove();

        if ( pShowLegend && pLegendPosition ){
            _initializeLegend( classifications, width );
        }
      }

      /**
       * Initializes chart with the first set of data
       * @param {Object} d3json Contains the information sent from the server
       */
      function _draw(d3json) {
        gRegion$ = $( "#" + pRegionId + "_region" );
        gChart$ = $( "#" + pRegionId + "_chart" ); 

        gChart$.css("overflow", "hidden");

        //Define chart measurements
        var width = gChart$.width();
        var height = _recommendedHeight();

        //Define gPack for treemap
        gPack = d3.layout.treemap()
          .size([width, height])
          .sort(function (a,b) {return b.rownum - a.rownum;})
          .value(function(d) { return d.SIZEVALUE; })
          .children(function(d) {return d.children;})
          .padding(0);

        //Define container div of chart
        gContainer = d3.select( gChart$.get(0) ).append("div")
          .style({"position": "relative",
                  "left": "0px",
                  "right": "0px",
                  "width": width + "px",
                  "height": height + "px"});

        //Create hierarchy
        gData = _buildHierarchy(d3json)[0];

        //Filter classifications from the query results for future use on chart grouping and legends
        var classifications = _sortDataToGetGroupings(gData);

        //Define nodes
        var node = gContainer.selectAll(".com_oracle_apex_d3_treemap_node")
          .data(gPack.nodes(gData))
          .enter()
          .append("div")
          .attr("class", "com_oracle_apex_d3_treemap_node")
          .text(function(d) { return d.children ? "" : _textEllipsis(this, d); })
          .style({"background-color": colorAccessor,
                 "color": fgColorAccessor,
                 "opacity": 0,
                 "overflow": "hidden",
                 "z-index": function(d) { return d.DEPTH; },
                 "position": "absolute",
                 "left": function(d) { return d.x + "px"; },
                 "top":  function(d) { return d.y + "px"; },
                 "width": function(d) { return Math.max(0, d.dx - 1) + "px"; },
                 "height": function(d) { return Math.max(0, d.dy - 1) + "px"; }});

          if(!gColorScale){
            node.each(function (d) {
              _assignThemeRollerClassesToObject( this, arguments );
            });
          }

        var nodeFilter = node.filter(function(d) {return !d.children;})

        nodeFilter.transition()
          .style("opacity", config.opacity_normal)
          .duration(config.trdur);

        //Tooltip initialization
        if( pShowTooltip ){
          gTooltip$ = $( '<div>' )
                  .addClass( 'a-D3Tooltip a-D3TreeMapChart-tooltip' )
                  .appendTo( gChart$ )
                  .hide();
        }

        //Bind events to nodes
        _bindEvents( nodeFilter );

        $(window).on("apexwindowresized", _resizeFunction);

        if ( pShowLegend && pLegendPosition ) {
          gLegend$ = $( '<div>' );

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
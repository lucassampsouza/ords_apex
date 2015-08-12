/*
 * JustGage Plug-in v1.0 - http://apex.oracle.com/plugins
 *
 * Based on JustGage http://www.justgage/
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */
 
(function( util, server, $, undefined ) {

com_oracle_apex_raphael_justgage = function( pRegionId, pOptions ) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gGaugeOptions,
        gOptions,
        gData,
        gGauge,
        gGauge$,
        gDescription$,
        gHeading$,
        gRegion$;

    _init( pRegionId, pOptions );

    function _init( pRegionId, pOptions ) {
        
        gOptions = pOptions;

        gGaugeOptions = {
            id : gOptions.regionId,
            relativeGaugeSize : true,
            title : gOptions.title || '',
            donut : gOptions.gaugeMode == 'DONUT',
            showMinMax : gOptions.showMinMax,
            label : gOptions.units || '',
            hideInnerShadow : !gOptions.showShadow,
            shadowOpacity : gOptions.shadowOpacity,
            shadowVerticalOffset : gOptions.shadowOffset,
            gaugeWidthScale : gOptions.gaugeWidth,
            levelColors : gOptions.gaugeColors.split(','),
            levelColorsGradient : true,
            gaugeColor : gOptions.gaugeBgColor,
            textRenderer : function(value)
            {
                return (gOptions.valuePrefix || '') + value + (gOptions.valueSuffix || '');
            }
        };
        
        gGauge$ = $( "#" + util.escapeCSS( gGaugeOptions.id ), apex.gPageContext$);
        gDescription$ = $( '#' + util.escapeCSS( pRegionId ) + ' .a-BadgeChart-desc', apex.gPageContext$ );
        gHeading$ = $( '#' + util.escapeCSS( pRegionId ) + ' .a-BadgeChart-label', apex.gPageContext$ );
        gRegion$ = $( '#' + util.escapeCSS( pRegionId ), apex.gPageContext$ );
        
        // Time to draw (an empty) chart!
        _render();

        /* Bind event handler to the apexrefresh event for the main region element.
         * Dynamic actions can then refresh the chart via the 'Refresh' action.
         *
         * We immediately trigger the event it to load the initial chart data.
         */
        gRegion$
            .on( "apexrefresh", _refresh )
            .trigger( "apexrefresh" );

    } // _init

    // Perform initial setup of the data
    function _render() {
        gGauge = new JustGage(gGaugeOptions);
        //TODO: Investigate why gGauge needs to be refreshed immediately after initializiation to get rid of
        // its default "undefined" value.
        gGauge.refresh(0, 100, 0);
    } // _render

    // Refreshes the chart with the data provided in pData
    function _draw( pData ) {
        gData = pData;
        gGauge.refresh(gData[0].value, gData[0].max, gData[0].min);
        if(gOptions.heading){
            if(gData[0].headingLink){
                gHeading$.empty().append($(document.createElement("a")).attr("href", gData[0].headingLink).text(gOptions.heading));
            } else {
                gHeading$.text(gOptions.heading);
            }

        }
        if(gOptions.description){
            var descriptionText = gOptions.description
                .replace(':MIN:', gData[0].min)
                .replace(':MAX:', gData[0].max)
                .replace(':VALUE:', gData[0].value);
            if(gData[0].descriptionLink){
                gDescription$.empty().append($(document.createElement("a")).attr("href", gData[0].descriptionLink).text(descriptionText));
            } else {
                gDescription$.text(descriptionText);
            }
        }
    } // _draw


    // Removes everything inside the chart DIV
    function _clear() {
        //gGauge$.empty();
    } // _clear

    function _debug(something) {
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
                loadingIndicator:         gGauge$,
                loadingIndicatorPosition: "append"
            });

    } // _refresh

}; // com_oracle_apex_raphael_justgage

})( apex.util, apex.server, apex.jQuery );
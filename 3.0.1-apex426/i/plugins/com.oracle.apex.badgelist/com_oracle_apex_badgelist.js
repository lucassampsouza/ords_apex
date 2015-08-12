function com_oracle_apex_badgelist( pRegionId, pOptions ) {
    var gOptions = jQuery.extend(
        {
            ajaxIdentifier: null,
            pageItems: null
        },
        pOptions
    );
    var gRegion$ = jQuery( '#' + apex.util.escapeCSS( pRegionId ), apex.gPageContext$);
    var gRegionBody$ = gRegion$.find(".t-Region-body");

    function _draw( pData ) {
        gRegionBody$.html("");
        var out = apex.util.htmlBuilder();
        var classes = "t-BadgeList";
        var append = function ( className ) {
            classes += " " + className + " ";
        };
        if (pData.colored === 'Y') {
           append( "t-BadgeList--coloredBG" );
        }
        if (pData.chart_type === 'BOX') {
            append( "t-BadgeList--dash" );
        } else {
            append( "t-BadgeList--circular" );
            if (pData.chart_size === 'S') {
                append( "t-BadgeList--small" )
            } else if ( pData.chart_size === 'M' ) {
                append( "t-BadgeList--medium" )
            } else if ( pData.chart_size === 'L' ) {
                append( "t-BadgeList--large" )
            } else if ( pData.chart_size === 'B' ) {
                append( "t-BadgeList--xlarge" )
            } else if ( pData.chart_size === 'XXL' ) {
                append( "t-BadgeList--xxlarge" )
            }
        }
        if (pData.layout === '0') {
            append( "t-BadgeList--fixed" );
        } else if (pData.layout === '1') {
            append( "t-BadgeList--stacked" );
        } else if (pData.layout === 'W') {
            append( "t-BadgeList--flex" )
        } else if (pData.layout === 'F') {
            append( "t-BadgeList--float" )
        } else {
            append('t-BadgeList--cols t-BadgeList--' + apex.util.escapeHTMLContent( pData.layout ) + 'cols');
        }
        out.markup('<ul class="' + apex.util.escapeHTMLContent( classes ) + '"></ul>');
        var badgeRegion$ = $( out.toString() );
        gRegionBody$.html(badgeRegion$);
        var renderBadge = function( badge ) {
            var out = apex.util.htmlBuilder();
            var url = badge.url;
            if ( !url || url === "" ) url = "javascript:void(0)";
            out.markup( "<li class='t-BadgeList-item'>" )
                .markup('<a')
                .attr( "href", url )
                .markup( 'class="t-BadgeList-wrap">' )
                .markup('<span class="t-BadgeList-value">')
                    .content(badge.value)
                .markup('</span>')
                .markup('<span class="t-BadgeList-label">')
                    .content(badge.label)
                .markup("</span>");
            if (badge.percent) {
                // It is unclear how to use attr with style elements, so, for now, the escapeHTMLContent function will just called directly.
                out.markup('<span class="t-BadgeList-fill" style="width:' +  apex.util.escapeHTMLContent( badge.percent ) + '%"></span>');
            }
            out.markup("</li>");
            return out.toString();
        };
        for (var i = 0, size = pData.data.length; i < size; i++) {
            badgeRegion$.append( renderBadge( pData.data[i] ) );
        }
    }

    function _debug( i ) {
        apex.debug.log( i );
    }

    function _refresh() {
        apex.server.plugin(
            gOptions.ajaxIdentifier,
            {
                pageItems: gOptions.pageItems
            },
            {
                dataType: "json",
                accept: "application/json",
                refreshObject: gRegion$,
                success: _draw,
                error:  _debug
            }
        );
    }


    gRegion$
        .on( "apexrefresh", _refresh )
        .trigger( "apexrefresh" );
}
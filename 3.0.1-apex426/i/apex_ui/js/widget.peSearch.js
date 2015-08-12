/*global apex,$,$v,$x*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright © 2013, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * Turns a standard DIV element into a search result for a property editor page:
 *   apex.jQuery( "#myList" ).peSearch();
 *   apex.jQuery( "#myList" ).peSearch( "search", "myText"/<regular expression> );
 */

(function( model, $, util, undefined ) {
    "use strict";

    var WIDGET_NAME = "search_",
        CSS = {
            WARNING: "warning"
        },
        ICON = {
            SEARCH:  "a-Icon icon-search",
            WARNING: "icon-warning-sign"
        };

    // Stores the last search regular expression
    var gLastSearchExpr = null;

    function getHitMarkup( pProperty, pSearchExpr ) {

        var HIT_HTML =
            '<li class="a-AlertMessages-item" data-typeid="#TYPEID#" data-componentid="#COMPONENTID#" data-propertyid="#PROPERTYID#">' +
                '  <a href="#" class="a-MediaBlock a-AlertMessages-message">' +
                '    <div class="a-MediaBlock-graphic">' +
                '      <span class="#ICON_CLASS#"></span>' +
                '    </div>' +
                '    <div class="a-MediaBlock-content">' +
                '      <h5 class="a-AlertMessages-propertyTitle">#COMPONENT_TYPE# &rarr; #COMPONENT# &rarr; #DISPLAY_GROUP# &rarr; #PROPERTY#</h5>' +
                '      <p class="a-AlertMessages-messageDescription"><pre>#VALUE#</pre></p>' +
                '    </div>' +
                '  </a>' +
                '</li>';

        var lComponent   = pProperty.component,
            lPropertyDef = pProperty.getMetaData(),
            lValue       = pProperty.getDisplayValue();

        // 1) wrap all hits with a placeholder
        // 2) escape the value to make sure that we are not vulnerable for XSS
        // 3) after escaping, replace our secure placeholder with actual HTML to highlight the search term
        lValue = util.escapeHTML( lValue.replace( pSearchExpr, "~~peSearchHitBegin~~$&~~peSearchHitEnd~~" ));
        lValue = lValue
                     .replace( /~~peSearchHitBegin~~/g, '<span class="a-Search-term">' )
                     .replace( /~~peSearchHitEnd~~/g,   "</span>" ); // todo only show snippet

        return HIT_HTML
                .replace( /#CSS_CLASS#/g,     CSS.WARNING )
                .replace( /#ICON_CLASS#/g,    ICON.SEARCH )
                .replace( "#TYPEID#",         lComponent.typeId )
                .replace( "#COMPONENTID#",    lComponent.id )
                .replace( "#PROPERTYID#",     pProperty.id )
                .replace( "#COMPONENT_TYPE#", util.escapeHTML( model.getComponentType( lComponent.typeId ).title.singular ))
                .replace( "#COMPONENT#",      util.escapeHTML( lComponent.getDisplayTitle()))
                .replace( "#DISPLAY_GROUP#",  util.escapeHTML( model.getDisplayGroup( lPropertyDef.displayGroupId ).title ))
                .replace( "#PROPERTY#",       util.escapeHTML( lPropertyDef.prompt ))
                .replace( "#VALUE#",          lValue );

    }; // getHitMarkup


    $.widget( "apex.peSearch", {
        options: {},
        /*
         * Lifecycle methods
         */
        _create: function() {

            var lSelf = this,
                lHits$;

            this.element.empty();

            lHits$           = $( "<div>", { "class": "a-AlertMessages" }).appendTo( this.element );
            this._container$ = $( "<ul></ul>", { "class": "a-AlertMessages-list" })
                .appendTo( lHits$ )
                .on( "click", "a", this._goToComponent );

            $( document ).on( "modelReady", function() {

                // Listen for all events which have an impact on the displayed search result
                model.observer(
                    WIDGET_NAME + this.uuid, {
                        events: [
                            model.EVENT.CHANGE,
                            model.EVENT.DELETE,
                            model.EVENT.REMOVE_PROP ]
                    },
                    function( pNotifications ) {
                        lSelf._update( pNotifications );
                    });

                // Clear result if the model gets cleared
                $( document ).one( "modelCleared", function() {
                    lSelf._container$.empty();
                    gLastSearchExpr = null;
                });

            });
        },
        _init: function() {
        },
        _destroy: function() {
            this.element.empty();

            $( document ).off( "modelReady" );
            $( document ).off( "modelCleared" );
            model.unobserver( WIDGET_NAME + this.uuid );
        },
        search: function( pText ) {

            function searchComponentType( pTypeId, pSearchExpr ) {

                var lHtml = "",
                    lProperties,
                    lType,
                    i, len;

                lProperties = model.fullTextSearch( pSearchExpr, { typeId: pTypeId });

                // Add a clickable entry for each property we have found
                for ( i = 0, len = lProperties.length; i < len; i++ ) {
                    lHtml += getHitMarkup( lProperties[ i ], pSearchExpr );
                }

                // Check all child component types
                lType = model.getComponentType( pTypeId );
                for ( i = 0, len = lType.childComponentTypes.length; i < len; i++ ) {
                    lHtml += searchComponentType( lType.childComponentTypes[ i ], pSearchExpr );
                }

                return lHtml;

            } // searchComponentType

            if ( pText instanceof RegExp ) {
                gLastSearchExpr = pText;
            } else if ( pText !== "" && pText !== undefined ) {
                gLastSearchExpr = new RegExp( util.escapeRegExp( pText ), "gi" );
            } else {
                gLastSearchExpr = null;
            }

            // Add search result to our hits view
            this._container$.empty();

            if ( gLastSearchExpr !== null ) {
                this._container$.append( searchComponentType( model.COMP_TYPE.PAGE, gLastSearchExpr ));
            }

        },
        clear: function() {

            gLastSearchExpr = null;
            this._container$.empty();

        },
        /*
         * Private functions
         */
        /*
         * todo
         */
        _update: function( pNotification ) {

            var lSearchExpr = gLastSearchExpr,
                lComponent  = pNotification.component,
                lSelector   = "li" +
                              "[data-typeid='" + lComponent.typeId + "']" +
                              "[data-componentid='" + lComponent.id + "']",
                lHit$,
                lProperties;

            if ( lSearchExpr !== null ) {

                // If the component got deleted, remove all properties of that component
                if ( $.inArray( model.EVENT.DELETE, pNotification.events ) >= 0 ) {

                    this._container$.find( lSelector ).remove();

                } else {
                    // Component has been changed or a property has been removed
                    for ( var lPropertyId in pNotification.properties ) {
                        if ( pNotification.properties.hasOwnProperty( lPropertyId )) {

                            lHit$ = this._container$.find( lSelector + "[data-propertyid='" + lPropertyId + "']" );

                            // Does the property still exist for the component? If not, remove it
                            if ( $.inArray( model.EVENT.REMOVE_PROP, pNotification.properties[ lPropertyId ]) >= 0 ) {

                                lHit$.remove();

                            } else if (  $.inArray( model.EVENT.CHANGE, pNotification.properties[ lPropertyId ]) >= 0 ) {

                                // If the property is displayed and the property value has changed,
                                // let's check if it still contains the search expression
                                if ( lHit$.length > 0 ) {
                                    lProperties = [ pNotification.component.getProperty( lPropertyId )];
                                    lProperties = model.fullTextSearch( lSearchExpr, { properties: lProperties });

                                    if ( lProperties.length > 0 ) {
                                        lHit$.replaceWith( getHitMarkup( lProperties[ 0 ], lSearchExpr ));
                                    } else {
                                        lHit$.remove();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        /*
         * Triggers the "selectComponent" event for the clicked error/warning message so that other widgets
         * can display that component to view/edit it.
         */
        _goToComponent: function ( pEvent ) {

            var lLi$ = $( this ).closest( "li" ),
                lComponent = model.getComponents( lLi$.data( "typeid" ), { id: lLi$.data( "componentid" )})[ 0 ];

            // todo Change the file to a f4000_p4500 file or the controller should provide a new event "goToComponent" which makes
            // sure that the visual focus is changed
            window.pageDesigner.goToComponent( lComponent.typeId, lComponent.id, lLi$.data( "propertyid" ) );

        }
    });

})( pe, apex.jQuery, apex.util );
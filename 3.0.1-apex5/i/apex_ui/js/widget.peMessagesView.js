/*global apex,$,$v,$x*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright © 2013, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * Turns a standard DIV element into an error/warning list for a property editor page:
 *   apex.jQuery( "#myList" ).peMessagesView({ badge: "#messageBadge" });
 */

(function( model, $, util, undefined ) {
    "use strict";

    var WIDGET_NAME = "messages_",
        CSS = {
            ERROR:   "error",
            WARNING: "warning"
        },
        ICON = {
            ERROR:   "icon-remove-sign",
            WARNING: "icon-warning-sign"
        };

    $.widget( "apex.peMessagesView", {
        options: {},
        /*
         * Lifecycle methods
         */
        _create: function() {

            var lSelf = this,
                lMessages$;

            this.element.empty();

            lMessages$       = $( "<div>", { "class": "a-AlertMessages" }).appendTo( this.element );
            this._container$ = $( "<ul></ul>", { "class": "a-AlertMessages-list" })
                .appendTo( lMessages$ )
                .on( "click", "a", this._goToComponent );

            $( document ).on( "modelReady", function() {

                // Listen for all events which have an impact on displayed error or warning messages
                model.observer(
                    WIDGET_NAME + this.uuid, {
                        events: [
                            model.EVENT.ERRORS,
                            model.EVENT.NO_ERRORS,
                            model.EVENT.WARNINGS,
                            model.EVENT.NO_WARNINGS,
                            model.EVENT.DELETE,
                            model.EVENT.REMOVE_PROP ]
                    },
                    function( pNotifications ) {
                        lSelf._update( pNotifications );
                    });

                // Clear all messages and the badge if the model gets cleared
                $( document ).one( "modelCleared", function() {
                    lSelf._container$.empty();
                    if ( $.isFunction( lSelf.options.badge )) {
                        lSelf.options.badge( "" );
                    } else {
                        $( lSelf.options.badge ).text( "" );
                    }
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
        /*
         * Private functions
         */
        _update: function( pNotification ) {

            /*
             * Creates a clickable list entry for each error/warning defined in pMessages
             */
            function addEntries( pComponent, pProperty, pMessages, pCssClass, pIconClass ){

                var MESSAGE_ENTRY_HTML =
                        '<li class="a-AlertMessages-item" data-typeid="#TYPEID#" data-componentid="#COMPONENTID#" data-propertyid="#PROPERTYID#">' +
                        '  <a href="#" class="a-MediaBlock a-AlertMessages-message is-#CSS_CLASS#">' +
                        '    <div class="a-MediaBlock-graphic">' +
                        '      <span class="a-FAIcon a-FAIcon--medium a-FAIcon--#CSS_CLASS# #ICON_CLASS#"></span>' +
                        '    </div>' +
                        '    <div class="a-MediaBlock-content">' +
                        '      <h5 class="a-AlertMessages-propertyTitle">#COMPONENT_TYPE# &rarr; #COMPONENT# &rarr; #DISPLAY_GROUP# &rarr; #PROPERTY#</h5>' +
                        '      <p class="a-AlertMessages-messageDescription">#MESSAGE#</p>' +
                        '    </div>' +
                        '  </a>' +
                        '</li>',
                    lHtml = "";

                for ( var i = 0; i < pMessages.length; i++ ) {

                    lHtml += MESSAGE_ENTRY_HTML
                                 .replace( /#CSS_CLASS#/g,     pCssClass )
                                 .replace( /#ICON_CLASS#/g,    pIconClass )
                                 .replace( "#TYPEID#",         pComponent.typeId )
                                 .replace( "#COMPONENTID#",    pComponent.id )
                                 .replace( "#PROPERTYID#",     pProperty.id )
                                 .replace( "#COMPONENT_TYPE#", util.escapeHTML( model.getComponentType( pComponent.typeId ).title.singular ))
                                 .replace( "#COMPONENT#",      util.escapeHTML( pComponent.getDisplayTitle()))
                                 .replace( "#DISPLAY_GROUP#",  util.escapeHTML( model.getDisplayGroup( pProperty.getMetaData().displayGroupId ).title ))
                                 .replace( "#PROPERTY#",       util.escapeHTML( pProperty.getMetaData().prompt ))
                                 .replace( "#MESSAGE#",        pMessages[ i ]); // Message is already HTML escaped on the server
                }

                // Add HTML to our message view
                this._container$.append( lHtml );

            }; // addEntries

            var lComponent = pNotification.component,
                lSelector  = "li" +
                             "[data-typeid='" + lComponent.typeId + "']" +
                             "[data-componentid='" + lComponent.id + "']",
                lBadge     = this.options.badge,
                lProperty,
                lCount;

            // If the component got deleted, remove all messages for this component
            if ( $.inArray( model.EVENT.DELETE, pNotification.events ) >= 0 ) {

                this._container$.find( lSelector ).remove();

            } else {
                // Component has been validated/invalidated or a property has been removed

                for ( var lPropertyId in pNotification.properties ) {
                    if ( pNotification.properties.hasOwnProperty( lPropertyId )) {

                        // Remove any existing messages for the current property which has been validated/invalidated
                        this._container$.find( lSelector + "[data-propertyid='" + lPropertyId + "']" ).remove();

                        // Does the property still exist for the component?
                        if ( $.inArray( model.EVENT.REMOVE_PROP, pNotification.properties[ lPropertyId ]) === -1 ) {

                            // If the property is still available, add all current error or warning messages to our message view
                            lProperty = lComponent.getProperty( lPropertyId );
                            addEntries.call( this, lComponent, lProperty, lProperty.errors,   CSS.ERROR,   ICON.ERROR);
                            addEntries.call( this, lComponent, lProperty, lProperty.warnings, CSS.WARNING, ICON.WARNING);
                        }
                    }
                }
            }

            lCount = this._container$.find( "li" ).length;
            // Update the badge which displays the number of messages
            if ( $.isFunction( lBadge )) {
                lBadge( lCount );
            } else {
                $( lBadge ).text(( lCount > 0 ) ? lCount : "" );
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
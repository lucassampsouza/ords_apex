/*global pe,apex*/
/*!
 Dump diagnostic data about the current component for debugging
 Copyright (c) 2013, 2014, Oracle and/or its affiliates. All rights reserved.
 */
(function( model, $, util, debug, undefined ) {
    "use strict";

    var WIDGET_NAME = "dump";

    var gDumpContent$  = $( "#dumpContent" ),
        gDumpEnabled   = true;

    function getComponentHtml( pComponent ) {

        var lHtml = "",
            lProperties,
            lPropertyId,
            lColumns;

        lHtml += "<table class='u-Report'><tr><th>Property</th><th>Value</th></tr>";
        lHtml += "<tr><td>id</td><td>" + pComponent.id + "</td></tr>";
        lHtml += "<tr><td>title</td><td>" + util.escapeHTML( pComponent.getDisplayTitle()) + "</td></tr>";
        lHtml += "<tr><td>parentId</td><td>" + pComponent.parentId + "</td></tr>";
        lHtml += "<tr><td>pageId</td><td>" + pComponent.pageId + "</td></tr>";
        lHtml += "<tr><td>seq</td><td>" + pComponent.seq + "</td></tr>";
        lHtml += "<tr><td>hasChanged()</td><td>" + pComponent.hasChanged() + "</td></tr>";
        lHtml += "<tr><td>hasErrors()</td><td>" + pComponent.hasErrors() + "</td></tr>";
        lHtml += "<tr><td>hasWarnings()</td><td>" + pComponent.hasWarnings() + "</td></tr>";
        lHtml += "<tr><td>isReadOnly()</td><td>" + pComponent.isReadOnly() + "</td></tr>";
        lHtml += "<tr><td>_status</td><td>" + pComponent._status + "</td></tr>";
        if ( pComponent._grid ) {
            lHtml += "<tr><td>_grid</td><td>" +
                     "hasGridSupport: " + pComponent._grid.hasGridSupport + "<br>" +
                     "maxColumns: " + pComponent._grid.maxColumns + "<br>" +
                     (( pComponent._grid.isUnknown ) ? "isUnknown: true" : "" ) +
                     "</td></tr>";
        }
        if ( pComponent.typeId === model.COMP_TYPE.PAGE ) {
            lHtml += "<tr><td>_lock</td><td>";
            if ( pComponent._lock ) {
                lHtml += "isLockedByCurrentUser: " + (( pComponent._lock.isLockedByCurrentUser ) ? "true": "false" ) + "<br>" +
                         "owner: " + pComponent._lock.owner + "<br>" +
                         "on: " + pComponent._lock.on + "<br>" +
                         "comment: " + pComponent._lock.comment;
            }
            lHtml += "</td></tr>";
        }
        lHtml += "</table>";

        lProperties = pComponent.getProperties();
        lProperties.sort( function( a, b ) {
            return ( a.getMetaData().displaySeq - b.getMetaData().displaySeq );
        });

        lHtml += "<table class='u-Report'i><tr><th>Property</th><th>Value</th><th>has Changed</th><th>Errors</th><th>Warnings</th><th>_isRequired</th><th>Columns</th></tr>";
        for ( var j = 0; j < lProperties.length; j++ ) {
            lPropertyId = lProperties[ j ].id;
            lHtml += "<tr><td>";
            lHtml += lProperties[ j ].getMetaData().prompt + " (" + lPropertyId + ")";
            lHtml += "</td><td>";
            lHtml += util.escapeHTML( lProperties[ j ].getDisplayValue());
            if ( lProperties[ j ].getDisplayValue() !== lProperties[ j ].getValue()) {
                lHtml += "<br>[" + util.escapeHTML( lProperties[ j ].getValue()) + "]";
            }
            lHtml += "</td><td>";
            lHtml += ( lProperties[ j ].hasChanged ? "true" : "" );
            lHtml += "</td><td>";
            lHtml += lProperties[ j ].errors.join( "<br>" );
            lHtml += "</td><td>";
            lHtml += lProperties[ j ].warnings.join( "<br>" );
            lHtml += "</td><td>";
            lHtml += ( lProperties[ j ]._isRequired ? "true" : "" );
            lHtml += "</td><td>";
            lColumns = lProperties[ j ].getColumns();
            if ( lColumns.length > 0 ) {
                lHtml += "<table class='u-Report'><tr><th>Name</th><th>Type</th></tr>";
                for ( var i = 0; i < lColumns.length; i++ ) {
                    lHtml += "<tr><td>" + util.escapeHTML( lColumns[ i ].name ) + "</td><td>" + util.escapeHTML( lColumns[ i ].type ) + "</td></tr>";
                }
                lHtml += "</table>";
            }
            lHtml += "</td></tr>";
        }

        lHtml += "</table>";

        return lHtml;
    }


    function showDump( pEvent, pWidget, pComponents ) {
        var i;

        if ( !gDumpEnabled ) {
            return;
        }

        debug.trace( "%s: selectionChanged event triggered by %s", WIDGET_NAME, pWidget, pComponents );

        // Unregister change notification for all the previously displayed components
        model.unobserver(
            WIDGET_NAME, {
                events: [ model.EVENT.CHANGE ]
            });

        // Add change observers for currently selected components
        for ( i = 0; i < pComponents.length; i++ ) {
            model.observer(
                WIDGET_NAME, {
                    component: pComponents[ i ],
                    events:    [ model.EVENT.CHANGE, model.EVENT.META_DATA ]
                },
                function( pNotification ) {
                    debug.trace( "%s: CHANGE or META_DATA notification received", WIDGET_NAME, pNotification );

                    gDumpContent$
                        .find( "#dump" + pNotification.component.id )
                        .html( getComponentHtml( pNotification.component ));
                });
        }

        // Emit the new selection
        gDumpContent$.empty();
        for ( i = 0; i < pComponents.length; i++ ) {
            gDumpContent$.append(
                '<div id="dump' + pComponents[ i ].id + '">' +
                getComponentHtml( pComponents[ i ]) +
                '</div>'
            );
        }
    }

    $( document ).on( "modelReady", function() {
        // Clear dump if the model gets cleared
        $( document ).one( "modelCleared", function() {
            gDumpContent$.empty();
        });
    });

    $( document ).on( "selectionChanged." + WIDGET_NAME, showDump );

    model.observer(
        WIDGET_NAME, {},
        function( pNotification ) {
            debug.trace( "%s: %s notification(s)", WIDGET_NAME, pNotification.events.join( ", " ), pNotification );
        });

    // Leave dump tab in for debugging but don't show by default call pageDesigner.showDumpTab() from console to enable
    window.pageDesigner.hideDumpTab = function() {
        $( "#dump, [href=#dump]" ).closest( "li" ).hide();
        gDumpEnabled = false;
    };
    window.pageDesigner.showDumpTab = function() {
        $( "#dump, [href=#dump]" ).closest( "li" ).show();
        $( "#editor_tabs" ).tabs( "refresh" );
        gDumpEnabled = true;
    };
    $( document ).ready(function() {
        // comment the following to show the dump tab at startup
        window.pageDesigner.hideDumpTab();
    });

})( pe, apex.jQuery, apex.util, apex.debug );
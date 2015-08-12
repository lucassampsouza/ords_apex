/**
 * @fileOverview
 * The {@link apex.widget}.checkboxAndRadio is used for the Checkboxes and Radio Group widgets of Oracle Application Express.
 **/

(function( widget, $, util ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {String} pType
 * @param {Object} [pOptions]
 *
 * @function checkboxAndRadio
 * @memberOf apex.widget
 * */
widget.checkboxAndRadio = function(pSelector, pType, pOptions) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gOptions = $.extend({
                        action:    null,
                        nullValue: "",
                        inputName: null
                        }, pOptions),
        gFieldset$ = $( pSelector, apex.gPageContext$ );

    // Register apex.item callbacks
    $( pSelector, apex.gPageContext$ ).each(function(){
        var lFieldset = this;

        widget.initPageItem(this.id, {
            enable : function() {
                $( ":" + pType, lFieldset )
                    .prop( "disabled", false )             // enable checkbox/radio
                    .removeClass( "apex_disabled_multi" ); // remove the relevant disabled class
            },
            disable : function() {
                $( ":" + pType, lFieldset )
                    .prop( "disabled", true )
                    .addClass( "apex_disabled_multi" );
            },
        setValue : function(pValue) {
            var $lRadios    = $( ":" + pType, lFieldset ),
                lValueArray = [];
            // clear any checked values first
            $lRadios.prop( "checked", false );
            // if pType is 'checkbox', pValue could be multiple values
            if ( pType === "checkbox" ) {
                lValueArray = apex.util.toArray( pValue );
            } else {
                lValueArray[ 0 ] = pValue;
            }
            // loop through lValue array
            for ( var i = 0; i < lValueArray.length; i++ ) {
                // filter all radio inputs if value equals an array value,
                // then add checked to filtered results
                $lRadios.filter( "[value='" + util.escapeCSS( lValueArray[ i ] ) + "']" ).prop( "checked", true );
            }
        },
        getValue : function() {
            // get checked input value, in the context of the fieldset
            // note: can't use $lRadios here because this is a reference
            // to the initial state
            var lReturn, $lRadio;
            if ( pType === "checkbox" ) {
                // checkbox will return an array
                lReturn = [];
                $( ":checked", lFieldset).each( function() {
                    lReturn[ lReturn.length ] = this.value;
                });
            } else {
                // radio group should return a single value
                $lRadio = $( pSelector + " :checked", apex.gPageContext$ );
                if ($lRadio.length === 0) {
                // check if the length of the jQuery object is zero (nothing checked)
                // if so return an empty string.
                    lReturn = "";
                } else {
                    // otherwise return the value
                    lReturn = $lRadio.val();
                }
            }
            return lReturn;
        },
        afterModify: function() {
            if ( $.mobile ) {
                $( ":" + pType, lFieldset ).checkboxradio( "refresh" );
            }
        },
        nullValue : gOptions.nullValue,
        // set focus to first input or radio in the fieldset
        setFocusTo: $( ":" + pType, lFieldset ).first(),
        loadingIndicator : function( pLoadingIndicator$ ) {
            var lLoadingIndicator$;
            if ( $.mobile ) {
                lLoadingIndicator$ = pLoadingIndicator$.appendTo( $( "div.ui-controlgroup-controls", gFieldset$ ) );
            } else {
                lLoadingIndicator$ = pLoadingIndicator$.appendTo( gFieldset$ );
            }
            return lLoadingIndicator$;
        }
        });
    });

    // if it's a cascading checkbox/radio we have to register change events for our masters
    if ( gOptions.dependingOnSelector ) {
        $( gOptions.dependingOnSelector, apex.gPageContext$ ).change( _triggerRefresh );
    }
    // register the refresh event which is triggered by triggerRefresh or a manual refresh
    gFieldset$.bind( "apexrefresh", refresh );

    // register click events on the single radio input elements if an action has been defined
    if ( gOptions.action === "REDIRECT_SET_VALUE" ) {
        gFieldset$.find( "input").click( function() {
            location.href = "f?p=" + $v( "pFlowId" ) + ":" + $v( "pFlowStepId" ) + ":" + $v( "pInstance" ) + "::" + $v( "pdebug" ) + "::" + gFieldset$.attr( "id" ) + ":" + $v( gFieldset$.attr( "id" ));
        });
    } else if ( gOptions.action === "SUBMIT" ) {
        gFieldset$.find( "input" ).click( function(){ apex.submit( gFieldset$.attr("id"));} );
    }

    // Remove the LABEL tag for mobile, this is not required because JQM uses the FIELDSET's
    // LEGEND text as the LABEL (bug #14405198).
    if ( $.mobile ) {
        gFieldset$.siblings('label').hide();
    }

    // remove everything within the fieldset
    function _clear() {
        if ( $.mobile ) {
            gFieldset$.children( "div.ui-controlgroup-controls" ).empty();
        } else {
            gFieldset$.children( ":not(legend)" ).remove();
        }
    }

    // Triggers the "refresh" event of the checkbox/radiogroup fieldset which actually does the AJAX call
    function _triggerRefresh() {
        gFieldset$.trigger( "apexrefresh" );
    } // triggerRefresh

    // Called by the AJAX success callback and adds the html snipped and set the default value
    function _addResult(pData) {
        var lControlGroups$, lFieldsetContents$;
        if ( $.mobile ) {
            // 1.add the new checkboxes/radiogroup tags
            $( "div.ui-controlgroup-controls", gFieldset$ ).append( pData.html );
            // 2. tell jQM to initialize those widgets
            $( ":" + pType, gFieldset$ ).checkboxradio();
            // 3. jQM to set the correct rounding
            gFieldset$.controlgroup();
        } else {
            gFieldset$.append( pData.html );
        }

        // Set item default values if they have been passed to the Ajax call
        if ( pData.hasOwnProperty( "default" ) ) {
            $s(gFieldset$[ 0 ], pData[ "default" ]);
        }

    } // addResult

    // Clears the existing checkboxes/radiogroups and executes an AJAX call to get new values based
    // on the depending on fields
    function refresh() {

        var lOptions = { optimizeRefresh:          gOptions.optimizeRefresh,
                         dependingOn:              $( gOptions.dependingOnSelector, apex.gPageContext$ ),
                         success:                  _addResult,
                         clear:                    _clear
                       };

        widget.util.cascadingLov(
            gFieldset$,
            gOptions.ajaxIdentifier,
            {
                x01:       gOptions.inputName,
                pageItems: $( gOptions.pageItemsToSubmit, apex.gPageContext$ )
            },
            lOptions );
    } // refresh

}; // checkboxAndRadio

})( apex.widget, apex.jQuery, apex.util );

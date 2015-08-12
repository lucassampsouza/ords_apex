/*global apex,$s*/
/**
 @license

 Oracle Database Application Express, Release 4.2

 Copyright © 2012, 2014, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * This file holds namespaced objects and functions for dynamic actions in Oracle Application Express
 * */

( function ( da, server, item, $ ) {
    "use strict";

/**
 * show function
 * Shows all affected elements
 * */
da.show = function() {
    var lShowRow;
    if ( this.affectedElements ) {
        lShowRow = ( this.action.attribute01 === "Y" );
        this.affectedElements.each( function() {
            item( this ).show( lShowRow );
        });
    }
}; // show

/**
 * hide function
 * Hides all affected elements, also has option to clear contents of affected elements
 * */
da.hide = function() {
    var lHideRow;
    if ( this.affectedElements ) {
        lHideRow = ( this.action.attribute01 === "Y" );
        this.affectedElements.each( function() {
            item( this ).hide( lHideRow );
        });
    }
}; // hide

/**
 * enable function
 * Enables all affected elements
 * */
da.enable = function() {
    if ( this.affectedElements ) {
        this.affectedElements.each( function() {
            item( this ).enable();
        });
    }
}; // enable

/**
 * disable function
 * Disables all affected elements, also has option to clear contents of affected elements
 * */
da.disable = function() {
    if ( this.affectedElements ){
        this.affectedElements.each( function() {
            item( this ).disable();
        });
    }
}; //disable

/**
 * setValue function
 * Sets the value of all affected elements
 * */
da.setValue = function() {
    var lAction                 = this.action,
        lSetType                = lAction.attribute01,
        lStaticAssignment       = lAction.attribute02,
        lPageItemsToSubmit      = lAction.attribute04,
        lJavaScriptExpression   = lAction.attribute05,
        lSuppressChangeEvent    = ( lAction.attribute09 === "Y" ),
        lDialogReturnItem       = lAction.attribute10,
        lAsync                  = !lAction.waitForResult,              /* Issue synchronous call if action is set to
                                                                          'Wait for Result' (bug #14562383) */
        lAffectedElements$      = this.affectedElements,
        lResumeCallback         = this.resumeCallback;

    // Function used to set the values, also calls resume callback function, if it's defined
    function _setValue( pValue ) {
        lAffectedElements$.each( function( i ) {

            // Set all affected elements to the value passed
            $s( this, pValue, null, lSuppressChangeEvent );
        });

        /* Resume execution of actions here and pass false to the callback, to indicate no
         error has occurred. */
        da.resume( lResumeCallback, false );
    }

    // Called by the AJAX clear callback to clear the values in the affected elements
    function _clear() {

        // Only clear if call is async. Clearing has no effect for synchronous calls and is also known to cause
        // issues with components that use async set value mechanisms (bug #20770935).
        if ( lAsync ) {
            lAffectedElements$.each(function () {
                $s(this, "", null, true);
            });
        }
    }

    /* Called by the AJAX success callback for Ajax based set types, and either sets the values
       to the affected elements, or shows an error */
    //noinspection FunctionWithInconsistentReturnsJS
    function _success( pData ) {
        var lAffectedElementArray, lValue;

        /* We don't need to handle if a PL/SQL error has occurred here, as that is
         handled by the default _success callback in server.js. If a PL/SQL error
         occurs, execution is passed to the _error callback automatically.*/

        if( lSetType === 'SQL_STATEMENT' ) {
            /* Only page items are supported to be mapped to multiple columns of the SQL statement.
             For all other types we will just use the value of the first column, because we can't
             guarantee the order in which the affected elements are returned from the DOM.
             */
            if( lAction.affectedElementsType === "ITEM" ) {
                /* Use original lAction.affectedElements instead of this.affectedElements
                 jQuery object, because the developer-specified order will be preserved. */
                lAffectedElementArray = lAction.affectedElements.split( "," );
                for( var i = 0, len = lAffectedElementArray.length; i < len; i++ ) {
                    /* If the value corresponding to the current affected element exists,
                     use that, otherwise set to null. So in the case where the user has
                     defined more affected elements than values, the remaining affected
                     elements are set to null. */
                    if ( typeof( pData.values[i] ) !== "undefined" ) {
                        lValue = pData.values[i];
                    } else {
                        lValue = "";
                    }
                    // Set the affected elements
                    $s( lAffectedElementArray[i], lValue, null, lSuppressChangeEvent );
                }
                /* Resume execution of actions here and pass false to the callback, to indicate no
                 error has occurred with the Ajax call. */
                da.resume( lResumeCallback, false );
            } else {
                /* all other affected element types will just pick the value of the first column */
                _setValue( pData.values[0] );
            }
        } else {
            _setValue( pData.value );
        }
    }

    /* Error callback called when either the Ajax call fails, or when it returns
       successfully, but contains an error raised from PL/SQL */
    function _error( pjqXHR, pTextStatus, pErrorThrown ) {
        da.handleAjaxErrors( pjqXHR, pTextStatus, pErrorThrown, lResumeCallback );
    }

    if ( lSetType === "STATIC_ASSIGNMENT" ) {
        _setValue( lStaticAssignment );
    } else if ( lSetType === "SQL_STATEMENT" || lSetType === "PLSQL_EXPRESSION" || lSetType === "FUNCTION_BODY" ) {

        /* Define, make and respond to AJAX call, using the apex.server.plugin interface. */
        server.plugin ( lAction.ajaxIdentifier, {
                pageItems       : lPageItemsToSubmit    // Already in jQuery selector syntax
            }, {
                loadingIndicator: lAffectedElements$,   // Displayed for all affected elements
                clear           : _clear,               // Clears all affected elements before the call
                success         : _success,
                error           : _error,
                async           : lAsync
            }
        );
    } else if ( lSetType === "JAVASCRIPT_EXPRESSION" ) {
        _setValue( lJavaScriptExpression.call( this ));
    } else if ( lSetType === "DIALOG_RETURN_ITEM" ) {
        _setValue( this.data[ lDialogReturnItem ] );
    }
}; // setValue

/**
 * executePlSqlCode function
 * Executes PL/SQL code and will alert the user if an error has occurred
 * */
da.executePlSqlCode = function() {
    var lAction                 = this.action,
        lPageItemsToSubmit      = lAction.attribute01,
        lPageItemsToReturn      =  lAction.attribute02,
        lSuppressChangeEvent    = ( lAction.attribute04 === "Y" ),
        lAsync                  = !lAction.waitForResult,       /* Issue synchronous call if action is set to
                                                                   'Wait for Result' (bug #14562383) */
        lResumeCallback         = this.resumeCallback;

    // Called by the AJAX clear callback to clear the values in the "Page Items to Return"
    function _clear() {

        // Only clear if call is async. Clearing has no effect for synchronous calls and is also known to cause
        // issues with components that use async set value mechanisms (bug #20770935).
        if ( lAsync ) {
            $( lPageItemsToReturn, apex.gPageContext$ ).each( function() {
                $s( this, "", null, true );
            });
        }
    }

    //noinspection FunctionWithInconsistentReturnsJS
    function  _success( pData ) {
        var lItemCount, lItemArray;

        /* We don't need to handle if a PL/SQL error has occurred here, as that is
           handled by the default _success callback in server.js. If a PL/SQL error
           occurs, execution is passed to the _error callback automatically.
           Therefore here, if the result of the AJAX call is not null, we know
           that the response must be valid and contain the returning page item values
           ready to set.
           If the result is null, then the call was still successful, but there are
           just no returning page items to set, so we do nothing.. */
        if( pData && pData.item ) {
            lItemCount = pData.item.length;
            lItemArray = pData.item;
            for( var lItemIterator = 0; lItemIterator < lItemCount; lItemIterator++ ) {
                $s( lItemArray[ lItemIterator ].id, lItemArray[ lItemIterator ].value, null, lSuppressChangeEvent );
            }
        }

        /* Resume execution of actions here and pass false to the callback, to indicate no
         error has occurred with the Ajax call. */
        da.resume( lResumeCallback, false );
    }

    // Error callback called when the Ajax call fails
    function _error( pjqXHR, pTextStatus, pErrorThrown ) {
        da.handleAjaxErrors( pjqXHR, pTextStatus, pErrorThrown, lResumeCallback );
    }

    /* Define, make and respond to AJAX call, using the apex.server.plugin interface. */
    server.plugin ( lAction.ajaxIdentifier, {
            pageItems       : lPageItemsToSubmit    // Already in jQuery selector syntax
        }, {
            dataType        : ( lPageItemsToReturn ? "json" : "" ), // Only if "Page Items to Return" are set we expect a json result
            loadingIndicator: lPageItemsToReturn,   // Displayed for all "Page Items to Return"
            clear           : _clear,               // Clears all "Page Items to Return" before the call
            success         : _success,
            error           : _error,
            async           : lAsync
        }
    );
}; // executePlSqlCode

/**
 * clear function
 * Clears the value/html of all affected elements
 * */
da.clear = function() {
    if ( this.affectedElements ) {
        this.affectedElements.each( function() {
            $s( this, "", "" );
        });
    }
}; //clear

/**
 * addClass function
 * Adds 1 or more classes to all affected elements
 * */
da.addClass = function() {
    if ( this.affectedElements ) {
        this.affectedElements.addClass( this.action.attribute01 );
    }
}; // addClass

/**
 * removeClass function
 * Removes 1, more aor all class information from all affected elements
 * */
da.removeClass = function() {
    if ( this.affectedElements ){

        // If attribute01 is null, need to just call removeClass with nothing provided.
        if ( this.action.attribute01 ) {
            this.affectedElements.removeClass( this.action.attribute01 );
        } else {
            this.affectedElements.removeClass();
        }
    }
}; // removeClass

/**
 * setCSS function
 * Sets CSS style properties to all affected elements, uses setStyle item callout
 * */
da.setCSS = function() {
    var lAction = this.action;
    this.affectedElements.each ( function() {
        item( this ).setStyle( lAction.attribute01, lAction.attribute02 );
    });
}; // setCSS

/**
 * setFocus function
 * Sets the focus to the specified element, uses setFocus item callout
 * */
da.setFocus = function() {
    this.affectedElements.each ( function() {

        // Focus will be set to last element, if this.affectedElements contains > 1
        item( this ).setFocus();
    });
}; // setFocus

/**
 * submitPage function
 * Submits the current page with the specified request value
 * */
da.submitPage = function() {
    var lAction         = this.action,
        lRequest        = lAction.attribute01,
        lShowProcessing = ( lAction.attribute02 === "Y" );
    apex.submit( {
        request  : lRequest,
        showWait : lShowProcessing
    });
}; // submitPage

/**
 * refresh function
 * Sends the apexrefresh event to the specified DOM elements
 * */
da.refresh = function() {
    if ( this.affectedElements ) {
        this.affectedElements.trigger( "apexrefresh" );
    }
}; // refresh

/**
 * cancelEvent function
 * Cancels event processing...
 * */
da.cancelEvent = function() {

    /* Set cancel flag in the apex.event namespace to true. This value can be used to cancel subsequent
       processing, such as in page submission to stop the page from being submitted. */
    apex.event.gCancelFlag = true;

    /* Set cancel actions flag in apex.event namespace to true. This value is used in dynamic
       actions processing to stop further actions firing. */
    da.gCancelActions = true;

    /* Call the event method stopImmediatePropagation. This prevents any event handlers
       bound to the current event from executing. It also calls stopPropagation to stop the
       event from bubbling up the DOM (if it supports bubbling), so any event handlers bound
       to ancestral DOM elements will not fire either. */
    this.browserEvent.stopImmediatePropagation();

    /* Call the event method preventDefault. This prevents the default behaviour of the
       event (for example prevents going to the URL of a link, if a link is clicked). */
    this.browserEvent.preventDefault();
}; // cancelEvent

/**
 * showAlert function
 * Displays a JavaScript alert with the specified text
 * */
da.showAlert = function() {
    window.alert( this.action.attribute01 );
}; // showAlert

/**
 * askConfirm function
 * Displays a JavaScript confirm dialog with the specified text
 * */
da.askConfirm = function() {
    if ( !confirm( this.action.attribute01 ) ) {

        // Don't continue with dynamic actions

        /* Set cancel flag in the apex.event namespace to true. This value can be used to cancel subsequent
           processing, such as in page submission to stop the page from being submitted. */
        apex.event.gCancelFlag = true;

        /* Set cancel actions flag in dynamic action namespace to true. This value is used in dynamic
           actions processing to stop further actions firing. */
        da.gCancelActions = true; 
        
    }
}; // askConfirm

})( apex.da, apex.server, apex.item, apex.jQuery );
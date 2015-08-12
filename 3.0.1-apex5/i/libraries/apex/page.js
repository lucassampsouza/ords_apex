/**
 * @fileOverview
 * The {@link apex}.page namespace is used to store page submit functions of Oracle Application Express.
 **/
/*global apex, $s*/
/**
 * @namespace
 **/
apex.page = {};

(function( page, $, event, undefined ) {

page.itemCallbacks = {};

/**
 * @ignore
 **/
function _getSubmitOptions ( pOptions, pMode ) {
    var lRequestDefault, lDefaults,
        lOptions = {};

    // Default REQUEST value depends on whether this is a SUBMIT or CONFIRM
    if ( pMode === "SUBMIT" ) {
        lRequestDefault = null;
    } else if ( pMode === "CONFIRM" ) {
        lRequestDefault = "Delete";
    }
    lDefaults = {
        request     : lRequestDefault,
        set         : null,
        showWait    : false,
        waitMsg     : null,
        form        : "wwv_flow"
    };

    /* Check whether pOptions is a string (where a simple REQUEST string has been passed), or
     * an object (where an option map has been passed) and extend the defaults accordingly,
     * setting the result to lOptions.
     */
    switch ( typeof( pOptions ) ) {
        case "string" :
            lOptions = $.extend( lDefaults, { request : pOptions } );
            break;
        case "object" :
            lOptions = $.extend( lDefaults, pOptions );
            break;
        default :
            lOptions = lDefaults;
            break;
    }
    return lOptions;
} // _getSubmitOptions

/**
 * Function submits the current page.
 *
 * @param {String|Object} [pOptions] If this is a string, this will be used to set the REQUEST value.
 *                                   If this is null, the page will be submitted with no REQUEST value.
 *                                   If this is an object, you can define the following options:
 *                                     - "request"          The request value.
 *                                     - "set"              Object containing name/value pairs of items to set on the
 *                                                          page prior to submission.
 *                                     - "showWait"         Flag to control if a 'Wait Indicator' icon is displayed,
 *                                                          which can be useful when running long page operations.
 *                                     - "submitIfEnter"    If you only want to submit when the ENTER key has been pressed,
 *                                                          call {@link apex}.submit in the event callback and pass the event object
 *                                                         as this parameter.
 *
 * @example
 * // Submits the current page with a REQUEST value of 'SAVE'
 * apex.submit( "SAVE" );
 *
 * @example
 * // Submits the current page with a REQUEST value of 'DELETE'.
 * // Sets the P1_DEPTNO and P1_EMPNO page item values.
 * // Shows a 'Wait Indicator' during page submission.
 * // As submitIfEnter has been passed, the submit will only proceed if
 * // the event object shows the ENTER key has been pressed.
 *
 * apex.submit( {
 *    request       : "DELETE",
 *    set           : {
 *        "P1_DEPTNO"   : 10,
 *        "P1_EMPNO"    : 5433
 *    },
 *    showWait      : true,
 *    submitIfEnter : event
 * });
 *
 * @function submit
 * @memberOf apex.page
 **/
page.submit = function( pOptions ) {
    var lKeyCode,
        lOptions      = _getSubmitOptions( pOptions, "SUBMIT" ),
        lCancelSubmit = false,
        lWaitPopup,
        lNumTimeouts,         // for deferred submit, the number of times a submit was already tried
        lForm$,               // the form to submit
        lRunSubmitProcessing; // the callback function which implements deferred submit

    // If the lOptions.submitIfEnter option has been passed, use it to check if the ENTER key was pressed.
    if ( lOptions.submitIfEnter !== undefined ) {

        // Because this function may be used as an event callback, and the event handler may not have been
        // bound using jQuery, we can't rely on the normalised event "which" attribute to determine the keycode.
        if ( window.event ) {
            lKeyCode = window.event.keyCode;
        } else {
            lKeyCode = lOptions.submitIfEnter.which;
        }

        if ( lKeyCode !== 13 ) {

            /* If ENTER key was not pressed, exit the function by returning true
             * (to proceed with default event handling, eg allow other keystrokes through). */
            return true;
        }
    }

    // Trigger a 'Before Page Submit' event for the document, and pass the current request value for convenience.
    lCancelSubmit = event.trigger( apex.gPageContext$, "apexbeforepagesubmit", lOptions.request );

    // Cancel submission, if the apex.event.trigger function says so (with a true return value).
    if ( !lCancelSubmit ) {

        // Only show wait icon if gOptions.showWait is true
        if( lOptions.showWait ) {
            lWaitPopup = apex.widget.waitPopup();
        }

        // If a gOptions.set object has been passed, iterate over it and set the values
        if( lOptions.set ) {
            $.each( lOptions.set, function( pId, pValue ) {

                // Only set the values if ID is not null and Value is not undefined (but allow null or '')
                if( ( pId ) && ( pValue !== undefined ) ) {
                    $s( pId, pValue );
                }
            });
        }
        // Select list options, required by some item types (shuttles, etc.)
        flowSelectAll();

        // Set pRequest, within the current context
        $( "#pRequest", apex.gPageContext$ ).val( lOptions.request );

        // try / catch block to safeguard against IE versions that raise an error when calling AutoCompleteSaveForm
        // (for example as happens on Windows Phone 7.5 / 8), so native autocomplete will not work here.
        try {
            // Internet Explorer form auto-complete feature doesn't work when the form is submitted
            // via JavaScript. The solution is to call this IE specific function.
            // see: support.microsoft.com/kb/329156
            // The typeof test is needed because for some reason it is not a normal function which would be truthy
            if ( window.external && typeof window.external.AutoCompleteSaveForm == "unknown" ) {
                    window.external.AutoCompleteSaveForm( $( "form[name=" + lOptions.form + "]", apex.gPageContext$ ).get( 0 ) );
            }
        } catch ( e ) {}

        // Perform page submit, but defer it if pPageChecksum is not yet in the DOM (bug #14287960).
        lNumTimeouts         = 0;
        lForm$               = $( "form[name=" + lOptions.form + "]", apex.gPageContext$ );
        lRunSubmitProcessing = function() {
            if ( lForm$.attr( "action" ) === "wwv_flow.accept"
                 && $( "#pPageChecksum", apex.gPageContext$ ).length === 0 )
            {
                lNumTimeouts++;
                if ( lNumTimeouts > 5 ) {
                    if ( lWaitPopup ) {
                        lWaitPopup.remove();
                    }
                    window.alert( apex.lang.getMessage( "APEX.WAIT_UNTIL_PAGE_LOADED" ));
                } else {
                    if ( lWaitPopup === undefined && lNumTimeouts === 1 ) {
                        lWaitPopup = apex.widget.waitPopup();
                    }
                    window.setTimeout( lRunSubmitProcessing, 300 );
                }
            } else {
                event.trigger( apex.gPageContext$, "apexpagesubmit", lOptions.request );
                //Submit the current form, defaults to "wwv_flow" if not provided in option map
                lForm$.trigger( "submit" );
            }
        };
        lRunSubmitProcessing();

    } else {

        // Reset cancel flag, ready for next page behaviour
        event.gCancelFlag = false;
    }

    if ( lOptions.submitIfEnter !== undefined ) {
        // Return false so that when this function is called as an event callback, we prevent the default event handling
        return false;
    }

}; // apex.page.submit

/**
 * Displays a confirmation showing a message and depending on user's choice, submits or cancels page submit.
 *
 * @param {String} [pMessage="Would you like to perform this delete action?"]
 *                                   The confirmation message displayed.
 * @param {String|Object} [pOptions] If this is a string, this will be used to set the REQUEST value.
 *                                   If this is null, the page will be submitted with no REQUEST value.
 *                                   If this is an object, you can define the following options:
 *                                     - "request"          The request value.
 *                                     - "set"              Object containing name/value pairs of items to set on the
 *                                                          page prior to submission.
 *                                     - "showWait"         Flag to control if a 'Wait Indicator' icon is displayed,
 *                                                          which can be useful when running long page operations.
 *                                     - "submitIfEnter"    If you only want to submit when the ENTER key has been pressed,
 *                                                          call {@link apex}.submit in the event callback and pass the event object
 *                                                          as this parameter.
 *
 * @example
 * // Shows a confirmation dialog with the text 'Delete Department'.
 * // If the user chooses to proceed with the delete, the current page
 * // is submitted with a REQUEST value of 'DELETE'.
 *
 * apex.confirm( "Delete Department", 'DELETE' );
 * @example
 * // This example shows a confirmation message with the 'Save Department?' text.
 * // If the user chooses to proceed with the save, the page is submitted with a
 * // REQUEST value of 'SAVE' and 2 page item values are set, P1_DEPTNO to 10 and
 * // P1_EMPNO to 5433.
 *
 * apex.confirm( "Save Department?", {
 *     request: "SAVE",
 *     set: {
 *         "P1_DEPTNO": 10,
 *         "P1_EMPNO": 5433
 *     }
 * });
 *
 * @function confirm
 * @memberOf apex.page
 **/
page.confirm = function( pMessage, pOptions ) {
    var lMessage,
        lOptions = _getSubmitOptions( pOptions, "CONFIRM" );

    // Default message to a default delete confirmation, if it's not passed
    if ( pMessage ) {
        lMessage = pMessage;
    } else {
        lMessage = "Would you like to perform this delete action?";
    }

    // Fire the confirm and if OK is pressed, continue with the submit
    if ( confirm( lMessage ) ) {
        page.submit( lOptions );
    }

}; // apex.page.confirm


/**
 * An alias for {@link apex.page}.submit.
 *
 * @function
 * @memberOf apex
 **/
apex.submit = page.submit;

/**
 * An alias for {@link apex.page}.confirm.
 *
 * @function
 * @memberOf apex
 **/
apex.confirm = page.confirm;


})( apex.page, apex.jQuery, apex.event);

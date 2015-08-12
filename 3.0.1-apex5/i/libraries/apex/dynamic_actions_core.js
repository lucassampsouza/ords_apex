/*global apex*/
/**
 @license

 Oracle Database Application Express, Release 4.2

 Copyright (c) 2012, 2014, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * This file holds namespaced objects and functions for dynamic actions in Oracle Application Express
 * */

/**
 * @namespace apex.da
 */
apex.da = {};

( function ( da, $, event, util, undefined ) {
    "use strict";

/*  Stores meta data about all defined dynamic actions of the current page.
    Format: see database package wwv_flow_dynamic_action  */
da.gEventList = [];

/* Global flag to track if execution of dynamic actions should be stopped. For example
   if a PL/SQL error has occurred from an Ajax based action and the action is defined to
   "Stop Execution on Error", or if the "Cancel Event" action has fired. */
da.gCancelActions = false;

/**
 * init Function
 * Binds the dynamic actions and fires the initial action for page initialization
 * */
da.init = function() {

    // Loop over all dynamic actions
    $( da.gEventList ).each( function() {
        var lDefaults, lEvent, lSelector, lLiveSelector$;

        /* Make sure that all the required attributes are there, because we don't
         set them on the database side if they are null */
        lDefaults = {
            name            : null,
            bindDelegateTo  : null
        };

        // Use jQuery extend, properties present in object passed as 2nd parameter will override properties of 1st
        //lEvent = $.extend( lDefaults, da.gEventList[ lEventIterator ] );
        lEvent = $.extend( lDefaults, this );

        // Construct jQuery selector
        lSelector = da.constructSelector( {
            elementType : lEvent.triggeringElementType,
            element     : lEvent.triggeringElement,
            regionId    : lEvent.triggeringRegionId,
            buttonId    : lEvent.triggeringButtonId
        });

        // For page load events, just execute right away, no need to register a handler
        if ( $.inArray( lEvent.bindEventType, ["ready", "pageinit"] ) === -1 ) {

            // Event handling registration is handled differently, depending on 'Event Scope'
            if ( lEvent.bindType === "bind" ) {

                /* The most common 'Static' event scope, where we just register handler straight to the
                 triggering element. */
                $( lSelector, apex.gPageContext$ ).on( lEvent.bindEventType, function( pBrowserEvent, pData ) {
                    da.actions( this,
                        lEvent,
                        pBrowserEvent,
                        pData );
                });
            } else if ( lEvent.bindType === "live" ) {

                /* For 'Dynamic' event scope, if a 'Static Container' has been defined, this is used as
                   the first selector, in the context of the current page. If no 'Static Container' is
                   defined, just the current page context is used as the first selector. Then, the
                   triggering element is used as the secondary filter (so only those triggering elements
                   will handle the event). */
                if ( lEvent.bindDelegateTo ) {
                    lLiveSelector$ = $( lEvent.bindDelegateTo, apex.gPageContext$ );
                } else {
                    lLiveSelector$ = apex.gPageContext$;
                }
                lLiveSelector$.on( lEvent.bindEventType, lSelector, function( pBrowserEvent, pData ) {
                    da.actions( this,
                        lEvent,
                        pBrowserEvent,
                        pData );
                });
            } else if ( lEvent.bindType === "one" ) {

                /* For 'once' event scope, just register event handler straight to the triggering
                 element, using the 'one' method. */
                $( lSelector, apex.gPageContext$ ).one( lEvent.bindEventType, function( pBrowserEvent, pData ) {
                    da.actions( this,
                        lEvent,
                        pBrowserEvent,
                        pData );
                });
            }
        }

        /* Page initialization (used for immediate execution of 'Page Load' Dynamic Actions and
         actions that are set to 'Fire on Page Load'). */
        da.actions( lSelector,
            lEvent,
            "load" );
    }); // end loop to register event handlers
}; // init

/**
 * constructSelector function
 * Construct jQuery selector for elements, by type
 * */
da.constructSelector = function ( pOptions ) {
    var lLen, lDefaults, lOptions,
        lSelector = "";

    // Define default option values
    lDefaults = {
        elementType         : null,
        element             : null,
        regionId            : null,
        buttonId            : null,
        triggeringElement   : null,
        eventTarget         : null
    };

    // Extend default option values with anything passed via pOptions
    lOptions = $.extend( lDefaults, pOptions );

    // Construct selector based on element type ('ITEM', 'REGION', etc)
    switch ( lOptions.elementType ) {
        case "ITEM":
            lSelector = "#" + lOptions.element.replace(/,/g,",#");
            break;
        case "REGION":
            lSelector = "#" + util.escapeCSS( lOptions.regionId );
            break;
        case "BUTTON":
            lSelector = "#" + util.escapeCSS( lOptions.buttonId );
            break;
        case "JAVASCRIPT_EXPRESSION":
            lSelector = lOptions.element();
            break;
        case "DOM_OBJECT":
            // this selector type is deprecated because it uses eval and is overloaded with too many use cases
            apex.debug.deprecated("DOM Object selector");

            // first try as a list of ids
            lSelector = "#" + lOptions.element.replace(/,/g,",#");
            try {
                lLen = $( lSelector, apex.gPageContext$ ).length;
            } catch (ex) {
                lLen = 0;
            }
            if ( lLen === 0 ) {
                // if the list of ids selector doesn't find anything or throws an exception assume it is not a list of ids
                // next try as a JavaScript expression
                try {
                    lSelector = eval( lOptions.element );
                } catch ( err ) {
                    // if it is not a valid JavaScript expression assume it is a jQuery Selector
                    lSelector = lOptions.element;
                }
            }
            break;
        case "JQUERY_SELECTOR":
            lSelector = lOptions.element;
            break;
        case "TRIGGERING_ELEMENT":
            lSelector = lOptions.triggeringElement;
            break;
        case "EVENT_SOURCE":
            lSelector = lOptions.eventTarget;
            break;
        default:

            // Default to the page context. This is used when no 'Selection Type' has been specified for certain events.
            lSelector = apex.gPageContext$;
    }

    // For backward compatibility, return an undefined selector if no selector has actually been provided. # will raise
    // a jQuery syntax error
    if ( lSelector === "#" ) {
        lSelector = undefined;
    }
    return lSelector;
}; // constructSelector

/**
 * doAction function
 * Executes the action (pAction) on certain elements (pSelector)
 * */
da.doAction = function( pTriggeringElement, pSelector, pAction, pBrowserEvent, pData, pDynamicActionName, pResumeCallback ) {
    var lContext = {
        triggeringElement : pTriggeringElement,
        affectedElements  : $( pSelector, apex.gPageContext$ ),
        action            : pAction,
        browserEvent      : pBrowserEvent,
        data              : pData,
        resumeCallback    : pResumeCallback
    };

    // Call the javascript function if one is defined and pass the lContext object as this
    if ( pAction.javascriptFunction ) {

        // Log details of dynamic action fired out to the console (only outputs when running in debug mode)
        apex.debug.log( "Dynamic Action Fired: " + pDynamicActionName + " (" + pAction.action + ")", lContext );
        return pAction.javascriptFunction.call( lContext );
    }
}; // doAction

/**
 * doActions function
 * Iterates over the actions and determines if the action should be executed.
 * */
da.doActions = function( pEvent, pStartWithAction, pBrowserEvent, pData, pConditionResult, pTriggeringElement ) {
    var lActionCount = pEvent.actionList.length;

    // Loop over actions, lActionIterator initially set by pStartWithAction. This will be either 0 ( when doActions
    // is called initially in iterating over the triggering elements), or will be set to the action resume point (when
    // action execution has waited for the result of an action that issued an Ajax call).
    for (var lActionIterator = pStartWithAction; lActionIterator < lActionCount; lActionIterator++ ) {

        /* Make sure that all the required attributes are there, because we don't
         set them on the database side if they are null. */
        var lDefaults, lAction, lSelector, lWaitCallback;

        /* Check if no further actions should be executed, in the case where the event has been supressed
         if the event cancelActions flag is true, return out of this each iterator. */
        if ( da.gCancelActions ) {
            return false;
        }
        lDefaults = {
            eventResult             : null,
            executeOnPageInit       : false,
            stopExecutionOnError    : true,
            action                  : null,
            affectedElementsType    : null,
            affectedRegionId        : null,
            affectedElements        : null,
            javascriptFunction      : null,
            ajaxIdentifier          : null,
            attribute01             : null,
            attribute02             : null,
            attribute03             : null,
            attribute04             : null,
            attribute05             : null,
            attribute06             : null,
            attribute07             : null,
            attribute08             : null,
            attribute09             : null,
            attribute10             : null,
            attribute11             : null,
            attribute12             : null,
            attribute13             : null,
            attribute14             : null,
            attribute15             : null
        };

        // Use jQuery extend, properties present in object passed as 2nd parameter will override properties of 1st
        lAction = $.extend( lDefaults, pEvent.actionList[ lActionIterator ] );

        /* Check if action should be processed, process when either:
         - pBrowserEvent is not 'load' (for actions firing from bound event handlers, not on page load).
         - pBrowserEvent is 'load' and either 'Fire on Page Load' is checked, or binding event is either 'ready' or 'pageinit'
         */
        if ( pBrowserEvent !== "load" ||
           ( pBrowserEvent === "load" && ( lAction.executeOnPageInit || $.inArray( pEvent.bindEventType, ["ready","pageinit"] ) !== -1 ) ) ) {

            // Only proceed if the result of the triggering event evaluation is equal to the eventResult property of the action
            if ( lAction.eventResult === pConditionResult ) {

                // Construct jQuery selector for the affected elements, to be used in call to doAction
                lSelector = da.constructSelector( {
                    elementType         : lAction.affectedElementsType,
                    element             : lAction.affectedElements,
                    regionId            : lAction.affectedRegionId,
                    buttonId            : lAction.affectedButtonId,
                    triggeringElement   : pTriggeringElement,
                    eventTarget         : pBrowserEvent.target
                });

                /* lAction.waitForResult will only be emitted for actions that expose the
                   'Wait for Result' attribute. */
                if( lAction.waitForResult ) {

                    /* This callback will be fired by an action's post-response handling (_success, _error),
                       which restarts the action processing. */
                    lWaitCallback = function( pErrorOccurred ) {

                        da.gCancelActions = ( lAction.stopExecutionOnError && pErrorOccurred );
                        // -> da.doActions will stop execution if an gCancelActions is true
                        da.doActions( pEvent, lActionIterator + 1, pBrowserEvent, pData, pConditionResult, pTriggeringElement );
                    };
                }

                // Do the action. If it returns false (= error), stop executing other actions if the user has defined that
                if ( da.doAction( pTriggeringElement, lSelector, lAction, pBrowserEvent, pData, pEvent.name, lWaitCallback ) === false && lAction.stopExecutionOnError ) {
                    da.gCancelActions = true;
                }
                if( lAction.waitForResult ) {
                    return false;
                }
            }
        }
    } // end loop over actions
}; // doActions

/**
 * actions function
 * Fires the stored actions based on the triggering expression result
 * */
da.actions = function( pSelector, pEvent, pBrowserEvent, pData ) {

    // reset both cancel flags to false
    event.gCancelFlag = false;
    da.gCancelActions = false;

    /* Function that gets the result of the dynamic action's When Condition, which is then used to
     determine which actions fire, based on their 'Event Result' */
    function _getConditionResult( pElement ) {
        var lConditionResult, lExpressionArray, lContext,
            lApexItem           = apex.item( pElement.id ), // Setup an apex item object
            lValue              = lApexItem.getValue();     // Get it's value, could be either a single value or array of values, depending on the item type.

        switch ( pEvent.triggeringConditionType ) {
            case "EQUALS":
                if ( !$.isArray(lValue) ) {

                    // If the item's value is not an array, just check if the value is equal to the triggering expression.
                    lConditionResult = ( lValue === pEvent.triggeringExpression );
                } else {
                    lConditionResult = false;

                    /* If the item's value is an array, need to loop over it and check if any of the values in the
                     value array are equal to the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = ( value === pEvent.triggeringExpression );

                        // If event result is true, then exit iterator.
                        if (lConditionResult) {
                            return false;
                        }
                    });
                }
                break;
            case "NOT_EQUALS":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is not equal to the triggering expression.
                    lConditionResult = ( lValue !== pEvent.triggeringExpression );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     not equal to the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = ( value !== pEvent.triggeringExpression );
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "IN_LIST":
                lExpressionArray = pEvent.triggeringExpression.split( "," );
                if ( !$.isArray(lValue) ) {

                    // If the item's value is not an array, just check if it's in the expression array
                    lConditionResult = $.inArray(lValue, lExpressionArray) !== -1;
                } else {
                    lConditionResult = false;

                    /* If the item's value is an array, need to check if any of the values in the value array equals any of
                     the values in the expression array. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = ( $.inArray(value, lExpressionArray) !== -1 );

                        // If event result is true, then exit iterator.
                        if ( lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "NOT_IN_LIST":
                lExpressionArray = pEvent.triggeringExpression.split( "," );
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if it's not in the expression array
                    lConditionResult = ( $.inArray(lValue, lExpressionArray) === -1 );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if any of the values in the value array do not
                     equal any the values in the expression array. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = ( $.inArray(value, lExpressionArray) === -1 );
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "GREATER_THAN":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is greater than the triggering expression.
                    lConditionResult = lValue > parseFloat( pEvent.triggeringExpression, 10 );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     greater than the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = value > parseFloat( pEvent.triggeringExpression, 10 );

                        // If iterated value is not greater than triggering expression, then exit iterator
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "GREATER_THAN_OR_EQUAL":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is greater than or equal the triggering expression.
                    lConditionResult = lValue >= parseFloat( pEvent.triggeringExpression, 10 );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     greater than or equal the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = value >= parseFloat( pEvent.triggeringExpression, 10 );

                        // If iterated value is not greater than or equal triggering expression, then exit iterator
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "LESS_THAN":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is less than the triggering expression.
                    lConditionResult = lValue < parseFloat( pEvent.triggeringExpression, 10 );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     less than the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = value < parseFloat( pEvent.triggeringExpression, 10 );

                        // If iterated value is not less than triggering expression, then exit iterator
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "LESS_THAN_OR_EQUAL":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is less than or equal the triggering expression.
                    lConditionResult = lValue <= parseFloat( pEvent.triggeringExpression, 10 );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     less than or equal the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = value <= parseFloat( pEvent.triggeringExpression, 10 );

                        // If iterated value is not less than triggering expression, then exit iterator
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "NULL":
                lConditionResult = lApexItem.isEmpty();
                break;
            case "NOT_NULL":
                lConditionResult = !lApexItem.isEmpty();
                break;
            case "JAVASCRIPT_EXPRESSION":

                // Set context to be used by "JavaScript Expression" condition type
                lContext = {
                    triggeringElement   : pElement,
                    browserEvent        : pBrowserEvent,
                    data                : pData
                };
                // in this case triggeringExpression is a function that should return true or false
                lConditionResult = pEvent.triggeringExpression.call( lContext );
                break;
            default:

                // Catches when no condition has been selected
                lConditionResult = true;
        }

        // return the condition result
        return lConditionResult;
    } // _getConditionResult

    // Loop over the dynamic action's when elements. When this is called on page load, pSelector will be a jQuery selector,
    // hence why this is using 'each' to iterate. When this is called after an event handler is called, pSelector will
    // actually be a DOM element (which is also fine with 'each' although this will only iterate once).
    $( pSelector, apex.gPageContext$ ).each( function() {

        da.doActions( pEvent, 0, pBrowserEvent, pData, _getConditionResult( this ), this );

        // Reset cancelActions flag to false, ready for next dynamic action
        da.gCancelActions = false;
    }); // end loop over dynamic action's when elements
}; // actions


/**
 * Function that resumes execution of dynamic actions. Execution of a dynamic action can be paused,
 * if the action's 'Wait for Result' attribute is checked. 'Wait for Result' is a dynamic action
 * plug-in standard attribute designed for use with Ajax based dynamic actions. If a plug-in
 * exposes this attribute, it will also need to resume execution by calling this function in the
 * relevant place in the plug-in JavaScript code (otherwise your action will break execution of
 * dynamic actions).
 *
 * @param {function} pCallback          Reference to callback function available from the this.resumeCallback
 *                                      property.
 * @param {boolean}  pErrorOccurred     Indicate to the framework whether an error has occurred. If an error
 *                                      has occurred and the action's 'Stop Execution on Error' attribute
 *                                      is checked, execution of the dynamic action will be stopped.
 *
 * @example
 * // Resume execution of the actions, indicating that no error has occurred (for example from a "success"
 * // callback of an Ajax based action).
 * apex.da.resume( lResumeCallback, false );
 * @example
 * // Resume execution of the actions, indicating that an error has occurred (for example from an "error"
 * // callback of an Ajax based action). If the action's 'Stop Execution on Error' attribute is checked,
 * // execution of the dynamic action will be stopped.
 * apex.da.resume( lResumeCallback, true );
 *
 * @memberOf apex.da
 **/
da.resume = function( pCallback, pErrorOccurred ) {
    if ( $.isFunction( pCallback ) ) {
        pCallback( pErrorOccurred );
    }
}; // resume

/**
 * @TODO Complete doc
 *
 * Error callback called when the Ajax call fails
 *
 * @param {} pjqXHR             ...
 * @param {} pTextStatus        ...
 * @param {} pErrorThrown       ...
 * @param {} pResumeCallback    ...
 *
 * @TODO add example
 *
 * @memberOf apex.da
 **/
da.handleAjaxErrors = function ( pjqXHR, pTextStatus, pErrorThrown, pResumeCallback ) {
    var lMsg;

    if ( pjqXHR.status !== 0 ) {
        // When pjqXHR.status is zero it indicates that the page is unloading
        // (or a few other cases that can't be distinguished such as server not responding)
        // and it is very important to not call alert (or any other action that could
        // potentially block on user input or distract the user) when the page is unloading.
        if ( pTextStatus === "APEX" ) {

            // If this is an APEX error, then just show the error thrown
            lMsg = pErrorThrown;
        } else {

            // Otherwise, also show more information about the status
            lMsg = "Error: " + pTextStatus + " - " + pErrorThrown;
        }
        // Emit the error.
        // window.onerror allows a developer to override the alert with custom code.
        if ( $.isFunction(window.onerror) ) {
            window.onerror(lMsg, null, null);
        } else {
            window.alert( lMsg );
        }
    }

    /* Resume execution of actions here, but pass true to the callback, to indicate an error
     error has occurred with the Ajax call */
    da.resume( pResumeCallback, true );
}; // handleAjaxErrors


})( apex.da, apex.jQuery, apex.event, apex.util );

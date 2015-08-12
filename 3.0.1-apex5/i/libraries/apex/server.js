/*global apex,$,$v,$x*/

/**
@license

Oracle Database Application Express, Release 5.0

Copyright (c) 2012, 2015, Oracle and/or its affiliates. All rights reserved.
*/

/**
 * @fileOverview
 * The {@link apex}.server namespace is used to store all AJAX functions to communicate with the server part
 * of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.server = {};

/* required for AJAX calls to APEX engine */
apex.jQuery.ajaxSettings.traditional = true;

/* Always use browser cache if scripts are loaded via AJAX. (bug# 16177617)
   The default is false, but which causes that each JavaScript file which is embedded in a jQM page (for example our widget.jqmListview.js)
   gets loaded again if the page is requested by jQM via an AJAX call.
 */
apex.jQuery.ajaxPrefilter( "script", function( options ) {
    options.cache = true;
});

(function( server, $, util, undefined ) {
    "use strict";

/**
 * Function that calls the PL/SQL AJAX function which has been defined for a plug-in. This function is
 * a wrapper of the jQuery.ajax function and supports all the setting the jQuery function provides but
 * provides additional APEX features.
 *
 * @param {String} pAjaxIdentifier Use the value returned by the PL/SQL package apex_plugin.get_ajax_identifier to identify your plug-in.
 * @param {Object} [pData]         Object which can optionally be used to send additional values which are sent with the AJAX request.
 *                                 The special attribute "pageItems" which can be of type jQuery selector, jQuery-, DOM object or array of item names
 *                                 identifies the page items which should be included in the URL. But you can also set additional
 *                                 parameters that wwv_flow.show procedure provides. For example you can set the scalar parameters
 *                                 x01 - x10 and the arrays f01 - f20
 * @param {Object} [pOptions]      Object which can optionally be used to set additional options used by the AJAX.
 *                                 It supports the following optional APEX specific attributes:
 *                                   - "refreshObject"      jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                          for which the apexbeforerefresh and apexafterrefresh events are fired
 *                                   - "clear"              JavaScript function which can be used to clear the DOM after the
 *                                                          "apexbeforerefresh" event has fired and before the actual AJAX call is triggered.
 *                                   - "loadingIndicator"   jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                          where the loading indicator should be displayed next to it.
 *                                                          loadingIndicator can also be a function which gets the loading Indicator as
 *                                                          jQuery object and has to return the jQuery reference to the created loading indicator.
 *                                                          eg. function( pLoadingIndicator ) { return pLoadingIndicator.prependTo ( apex.jQuery( "td.shuttleControl", gShuttle )) }
 *                                  - "loadingIndicatorPosition"
 *                                                          6 options to define the position of the loading indicator displayed. Only considered if the value passed to
 *                                                          loadingIndicator is not a function.
 *                                                          - "before":   Displays before the DOM element(s) defined by loadingIndicator
 *                                                          - "after":    Displays after the DOM element(s) defined by loadingIndicator
 *                                                          - "prepend":  Displays inside at the beginning of the DOM element(s) defined by loadingIndicator
 *                                                          - "append":   Displays inside at the end of the DOM element(s) defined by loadingIndicator
 *                                                          - "centered": Displays in the center of the DOM element defined by loadingIndicator
 *                                                          - "page"    : Displays in the center of the page.
 *                                  - "queue"               Object specifying the name of a queue and queue action.
 *                                                          {
 *                                                            name: <string> name of the queue to add this request to
 *                                                            action: <string> one of "wait" (the default), "replace", "lazyWrite"
 *                                                          }
 *                                                          The default wait action is used to send requests one after the other. When the action is wait
 *                                                          the request is added to the named queue. If there are no other requests in that queue in progress or waiting
 *                                                          then this request is executed. Otherwise it waits on the named queue until the ones before it are complete.
 *                                                          Action replace is used when this current request makes any previous requests on the named queue in progress or waiting
 *                                                          obsolete or invalid. This current request aborts any in progress request and clears out any waiting
 *                                                          requests on the named queue and then is executed.
 *                                                          Action lazyWrite is used to throttle requests to the server to persist data.
 *                                                          This should only be used to persist non critical data such as user interface settings or state.
 *                                                          Use when the data may change frequently and only the last data values need to be saved.
 *                                                          For example this is useful for persisting splitter position, or tree expansion and focus state etc.
 *                                                          The queue name is unique for each data unit. For example if you were saving the position
 *                                                          of two different splitters use a unique name for each one so that latest update to one doesn't
 *                                                          overwrite a previous lazy write of the other.
 *                                                          When using lazyWriteQueue the refreshObject, clear, loadingIndicator, and loadingIndicatorPosition
 *                                                          are most likely not useful because nothing is being loaded or refreshed.
 *                                                          It is possible to mix requests with wait and replace actions on the same queue. The lazyWrite action
 *                                                          should not be used with a queue name that is also used with wait and replace actions.
 *                                 See jQuery documentation of jQuery.ajax for all other available attributes. The attribute dataType is defaulted to json.
 * @return {jqXHR | null}
 *
 * @example
 *
 * apex.server.plugin ( pAjaxIdentifier, {
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO"
 *     }, {
 *     refreshObject:     "#P1_MY_LIST",
 *     loadingIndicator:  "#P1_MY_LIST",
 *     success: function( pData ) { ... do something here ... }
 *     } );
 *
 * @function plugin
 * @memberOf apex.server
 **/
server.plugin = function( pAjaxIdentifier, pData, pOptions ) {

    return callOrQueue( "PLUGIN=" + pAjaxIdentifier, pData, pOptions );

}; // plugin


/**
 * Function that returns the URL to issue a GET request to the PL/SQL AJAX function which has been defined for a plug-in.
 *
 * @param {String} pAjaxIdentifier Use the value returned by the PL/SQL package apex_plugin.get_ajax_identifier to identify your plug-in.
 * @param {Object} [pData]         Object which can optionally be used to set additional values which are included into the URL.
 *                                 The special attribute "pageItems" which can be of type jQuery selector, jQuery-, DOM object or array of item names
 *                                 identifies the page items which should be included in the URL. But you can also set additional
 *                                 parameters that wwv_flow.show procedure provides. For example you can set the scalar parameters
 *                                 x01 - x10 and the arrays f01 - f20
 * @return {String}
 *
 * @example
 *
 * apex.server.pluginUrl ( pAjaxIdentifier, {
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO" } );
 *
 * @function pluginUrl
 * @memberOf apex.server
 **/
server.pluginUrl = function( pAjaxIdentifier, pData ) {

    return server.url( $.extend({}, pData, { p_request: "PLUGIN=" + pAjaxIdentifier }));

}; // pluginUrl


/**
 * Function that returns a URL to issue a GET request to the current page.
 *
 * @param {Object} [pData]  Object which can optionally be used to set additional values which are included into the URL.
 *                          The special attribute "pageItems" which can be of type jQuery selector, jQuery-, DOM object or array of item names
 *                          identifies the page items which should be included in the URL. But you can also set additional
 *                          parameters that wwv_flow.show procedure provides. For example you can set the scalar parameters
 *                          p_request, x01 - x10 and the arrays f01 - f20
 * @return {String}
 *
 * @example
 *
 * apex.server.url ({
 *     p_request: "DELETE",
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO" } );
 *
 * @function url
 * @memberOf apex.server
 **/
server.url = function( pData ) {

    var lUrl = "wwv_flow.show"    +
        "?p_flow_id="      + $v( "pFlowId" ) +
        "&p_flow_step_id=" + $v( "pFlowStepId" ) +
        "&p_instance="     + $v( "pInstance" ) +
        "&p_debug="        + $v( "pdebug" );

    // add all data parameters to the URL
    for ( var lKey in pData ) {
        if ( pData.hasOwnProperty( lKey )) {
            // the pageItems is a special parameter and will actually store all the specified page items in p_arg_names/values
            if ( lKey === "pageItems" ) {

                if ( $.isArray( pData.pageItems )) {
                    for ( var i = 0, lItem; i < pData.pageItems.length; i++ ) {
                        lItem = $x( pData.pageItems[i] );
                        if ( lItem ) {
                            lUrl = lUrl +
                                '&p_arg_names='  + encodeURIComponent( lItem.id ) +
                                '&p_arg_values=' + encodeURIComponent( $v( lItem ));
                        }
                    }
                } else {
                    $( pData.pageItems, apex.gPageContext$ ).each( function() {
                        lUrl = lUrl +
                            '&p_arg_names='  + encodeURIComponent( this.id ) +
                            '&p_arg_values=' + encodeURIComponent( $v( this ));
                    });
                }

            } else {
                lUrl = lUrl + '&' + lKey + '=' + encodeURIComponent( pData[lKey] );
            }
        }
    }

    return lUrl;
}; // url


/**
 * Function that calls a PL/SQL on-demand process defined on page or application level. This function is
 * a wrapper of the jQuery.ajax function and supports all the setting the jQuery function provides but
 * provides additional APEX features.
 *
 * @param {String} pName      The name of the PL/SQL on-demand page or application process you wish to call.
 * @param {Object} [pData]    Object which can optionally be used to send additional values which are sent with the AJAX request.
 *                            The special attribute "pageItems" which can be of type jQuery selector, jQuery-, DOM object or array of item names
 *                            identifies the page items which should be included in the URL. But you can also set additional
 *                            parameters that wwv_flow.show procedure provides. For example you can set the scalar parameters
 *                            x01 - x10 and the arrays f01 - f20
 * @param {Object} [pOptions] Object which can optionally be used to set additional options used by the AJAX.
 *                            It supports the following optional APEX specific attributes:
 *                              - "refreshObject"       jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                      for which the apexbeforerefresh and apexafterrefresh events are fired
 *                              - "clear"               JavaScript function which can be used to clear the DOM after the
 *                                                      "apexbeforerefresh" event has fired and before the actual AJAX call is triggered.
 *                              - "loadingIndicator"    jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                      where the loading indicator should be displayed next to it.
 *                                                      loadingIndicator can also be a function which gets the loading Indicator as
 *                                                      jQuery object and has to return the jQuery reference to the created loading indicator.
 *                                                      eg. function( pLoadingIndicator ) { return pLoadingIndicator.prependTo ( apex.jQuery( "td.shuttleControl", gShuttle )) }
 *                              - "loadingIndicatorPosition"
 *                                                      6 options to define the position of the loading indicator displayed. Only considered if the value passed to
 *                                                      loadingIndicator is not a function.
 *                                                      - "before":   Displays before the DOM element(s) defined by loadingIndicator
 *                                                      - "after":    Displays after the DOM element(s) defined by loadingIndicator
 *                                                      - "prepend":  Displays inside at the beginning of the DOM element(s) defined by loadingIndicator
 *                                                      - "append":   Displays inside at the end of the DOM element(s) defined by loadingIndicator
 *                                                      - "centered": Displays in the center of the DOM element defined by loadingIndicator
 *                                                      - "page"    : Displays in the center of the page.
 *                            See jQuery documentation of jQuery.ajax for all other available attributes. The attribute dataType is defaulted to json.
 * @return {jqXHR}
 *
 * @example
 *
 * apex.server.process ( "MY_PROCESS", {
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO"
 *     }, {
 *     success: function( pData ) { ... do something here ... }
 *     } );
 *
 * @function process
 * @memberOf apex.server
 **/
server.process = function( pName, pData, pOptions ) {

    // TODO consider using callOrQueue here as well
    return _call( "APPLICATION_PROCESS=" + pName, pData, pOptions );

}; // process


/**
 * FOR INTERNAL USE ONLY!!!
 *
 * Function that calls the server side part of a widget. This function is a wrapper of the jQuery.ajax function and
 * supports all the setting the jQuery function provides but provides additional APEX features.
 *
 * @param {String} pName      Name of the internal widget.
 * @param {Object} [pData]    Object which can optionally be used to send additional values which are sent with the AJAX request.
 *                            The special attribute "pageItems" which can be of type jQuery selector, jQuery-, DOM object or array of item names
 *                            identifies the page items which should be included in the URL. But you can also set additional
 *                            parameters that wwv_flow.show procedure provides. For example you can set the scalar parameters
 *                            x01 - x10 and the arrays f01 - f20
 * @param {Object} [pOptions] Object which can optionally be used to set additional options used by the AJAX.
 *                            It supports the following optional APEX specific attributes:
 *                              - "refreshObject"       jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                      for which the apexbeforerefresh and apexafterrefresh events are fired
 *                              - "clear"               JavaScript function which can be used to clear the DOM after the
 *                                                      "apexbeforerefresh" event has fired and before the actual AJAX call is triggered.
 *                              - "loadingIndicator"    jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                      where the loading indicator should be displayed next to it.
 *                                                      loadingIndicator can also be a function which gets the loading Indicator as
 *                                                      jQuery object and has to return the jQuery reference to the created loading indicator.
 *                                                      eg. function( pLoadingIndicator ) { return pLoadingIndicator.prependTo ( apex.jQuery( "td.shuttleControl", gShuttle )) }
 *                              - "loadingIndicatorPosition"
 *                                                      6 options to define the position of the loading indicator displayed. Only considered if the value passed to
 *                                                      loadingIndicator is not a function.
 *                                                      - "before":   Displays before the DOM element(s) defined by loadingIndicator
 *                                                      - "after":    Displays after the DOM element(s) defined by loadingIndicator
 *                                                      - "prepend":  Displays inside at the beginning of the DOM element(s) defined by loadingIndicator
 *                                                      - "append":   Displays inside at the end of the DOM element(s) defined by loadingIndicator
 *                                                      - "centered": Displays in the center of the DOM element defined by loadingIndicator
 *                                                      - "page"    : Displays in the center of the page.
 *                            See jQuery documentation of jQuery.ajax for all other available attributes. The attribute dataType is defaulted to json.
 * @return {jqXHR}
 *
 * @example
 *
 * apex.server.widget ( "calendar", {
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO"
 *     }, {
 *     success: function( pData ) { ... do something here ... }
 *     } );
 *
 * @private
 * @function widget
 * @memberOf apex.server
 **/
server.widget = function( pName, pData, pOptions ) {

    var lData = pData || {};

    lData.p_widget_name = pName;

    return _call( "APXWGT", lData, pOptions );

}; // widget

// variables for queue processing and lazy write back functionality
var MIN_LAZY_WRITE_FREQ = 5 * 1000; // 5 seconds

var lastWriteTimerId = null,
    lastWriteTime = null,
    lazyWriteQueue = [], // array of { name: <str>, request: <str>, data: {}, options: {} }
    queues = {}, // name -> [{ request: <str>, data: {}, options: {} },...]
    progressScopeNameIndex = 0;

function addToQueue( pQueueName, pAction, pRequest, pData, pOptions ) {
    var queue, delta, config, currentItem;

    function getQueue( name ) {
        var queue = queues[name];
        if ( !queue ) {
            queue = queues[name] = [];
        }
        return queue;
    }

    function sendNext( name ) {
        var item, jqXHR,
            queue = getQueue( name );

        if ( queue.length >= 1 ) {
            item = queue[0];
            jqXHR = item.jqXHR = _call( item.request, item.data, item.options );
            jqXHR.then(function(data, status) {
                // success
                queue.shift(); // take this completed request off the queue
                sendNext( name ); // start the next one if any
            }, function(jqXHR, status) {
                var i, item;
                // failure
                // clear out the queue
                // if there are any waiters that specified an error or complete callback they are expecting to be called
                // let them know that they were aborted
                // skip the first one because that is the one that was in progress and already notified
                for (i = 1; i < queue.length; i++) {
                    item = queue[i];
                    if ( item.error ) {
                        item.error( {status:0}, "abort", null );
                    }
                    if ( item.complete ) {
                        item.complete( {status:0}, "abort" );
                    }
                }
                queue.length = 0;
            });
        }
    }

    function findInQueue( pQueue, pName) {
        var i;
        for ( i = 0; i < pQueue.length; i++ ) {
            if ( pQueue[i].name === pName ) {
                return pQueue[i];
            }
        }
        return null;
    }

    if (pAction === "lazyWrite") {
        // if already on queue don't add it again just update the call data
        config = findInQueue( lazyWriteQueue, pQueueName );
        if ( config ) {
            config.request = pRequest;
            config.data = pData;
            config.options = pOptions;
            return;
        } // else
        lazyWriteQueue.push( { name: pQueueName, request: pRequest, data: pData, options: pOptions } );
        if ( lastWriteTimerId ) {
            return; // a write call will happen
        } // else
        // check if a write happened recently and if so wait a bit
        if ( lastWriteTime === null ) {
            delta = 10;
        } else {
            delta = ( lastWriteTime + MIN_LAZY_WRITE_FREQ ) - (new Date()).getTime();
            delta = delta < 0 ? 10 : delta;
        }
        lastWriteTimerId = setTimeout(function() {
            var item;

            lastWriteTimerId = null;
            lastWriteTime = (new Date()).getTime();

            while (lazyWriteQueue.length > 0) {
                item = lazyWriteQueue.shift();
                _call( item.request, item.data, item.options );
            }
        }, delta);
    } else {
        queue = getQueue( pQueueName );

        if ( pAction === "replace" && queue.length >= 1 ) {
            // replace any waiting requests and abort the current one if any
            currentItem = queue.shift();
            queue.length = 0; // truncate the queue
            if ( currentItem.jqXHR )  {
                currentItem.jqXHR.abort();
            }
        }
        queue.push( {request: pRequest, data: pData, options: pOptions} );
        if ( queue.length === 1 ) {
            sendNext( pQueueName );
        }
    }
}

function callOrQueue( pRequest, pData, pOptions ) {
    var lQName, lAction;

    // TODO consider if something should be done to consolidate the delayLinger spinner for each queue

    if ( pOptions.queue ) {
        lQName = pOptions.queue.name;
        lAction = pOptions.queue.action;
        delete pOptions.queue;
        addToQueue( lQName, lAction, pRequest, pData, pOptions );
        return null; // TODO consider if it is useful/possible to return our own deferred object here
    } // else
    return _call( pRequest, pData, pOptions );
}

/**
 * @TODO documentation missing
 * @private
 */
function _call( pRequest, pData, pOptions ) {
    var i, lItem, lIdx, lParameterName, lValue;
    var C_MAX_SAFE_LEN = 8000; // Only 8000 instead of 32767, because of unicode multibyte characters

    // Initialize the AJAX call parameters required by APEX
    var lProgressScopeName = null,
        lOptions = $.extend( {
                        dataType:                 "json",
                        type:                     "post",
                        async:                    true,
                        url:                      "wwv_flow.show",
                        traditional:              true,
                        loadingIndicatorPosition: "after" },
                        pOptions ),
        // Save the callbacks for later use because we overwrite them with standard handlers
        lSuccessCallback = lOptions.success,
        lErrorCallback   = lOptions.error,
        // Initialize all the default parameters which are expected by APEX
        lData = $.extend( {
                    p_request:      pRequest,
                    p_flow_id:      $v( 'pFlowId' ),
                    p_flow_step_id: $v( 'pFlowStepId' ),
                    p_instance:     $v( 'pInstance' ),
                    p_debug:        $v( 'pdebug' ),
                    p_arg_names:    [],
                    p_arg_values:   [] },
                    pData),
        lLoadingIndicatorTmpl$ = $( '<span class="u-Processing u-Processing--inline"><span class="u-Processing-spinner"></span></span>' ),
        lLoadingIndicator$,
        lLoadingIndicators$ = $(),
        lLoadingIndicatorPosition = lOptions.loadingIndicatorPosition;

    // Get the value of each page item and assign it to the p_arg_names/p_arg_values array
    if ( $.isArray( lData.pageItems )) {
        for ( i = 0; i < lData.pageItems.length; i++ ) {
            lItem = $x( lData.pageItems[i] );
            if ( lItem ) {
                lIdx  = lData.p_arg_names.length;
                lData.p_arg_names [ lIdx ] = lItem.id;
                lData.p_arg_values[ lIdx ] = $v( lItem );
            }
        }
    } else {
        $( lData.pageItems, apex.gPageContext$ ).each( function() {
            var lIdx = lData.p_arg_names.length;
            lData.p_arg_names [ lIdx ] = this.id;
            lData.p_arg_values[ lIdx ] = $v( this );
        });
    }
    // Remove pageItems so that it's not included in the transmitted data
    delete lData.pageItems;

    // Check the f01-20 parameters and automatically convert them to an array of strings
    // This will make handling of CLOB like strings a lot easier
    for ( i = 1; i <= 20; i++ ) {
        lParameterName = "f" + ( i < 10 ? "0" + i : i );
        if ( lData.hasOwnProperty( lParameterName ) && !$.isArray( lData[ lParameterName ])) {
            lValue = lData[ lParameterName ] + ""; // Make sure it's a string
            if ( lValue.length > C_MAX_SAFE_LEN ) {
                lData[ lParameterName ] = [];
                while ( lValue.length > C_MAX_SAFE_LEN ) {
                    lData[ lParameterName ].push( lValue.substr( 0, C_MAX_SAFE_LEN ) );
                    lValue = lValue.substr( C_MAX_SAFE_LEN );
                }
                lData[ lParameterName ].push( lValue );
            }
        }
    }


    // Trigger the before refresh event if the attribute has been specified
    if ( apex.event.trigger( lOptions.refreshObject, "apexbeforerefresh", lOptions.refreshObjectData ) ) {

        // If trigger function returns true, cancel the refresh by exiting the function, returning false
        return false;
    }

    // Call clear callback if the attribute has been specified and if it's a function
    if ( $.isFunction( lOptions.clear ) ) {
        lOptions.clear();
    }

    // Remove loadingIndicatorPosition, so that it's not in the transmitted data
    delete lOptions.loadingIndicatorPosition;

    /*
     * Loading indicator logic relevant if either a loading indicator element is defined, or in the case where the
     * loading indicator position is 'page' (where no loading indicator element is needed).
     */
    if ( lOptions.loadingIndicator || lLoadingIndicatorPosition === "page" ) {

        /*
         * Because of the way _call works overall it is not really possible for multiple calls to share the same
         * progress scope name so we make sure it is unique.
         */
        progressScopeNameIndex += 1;
        lProgressScopeName = "_call" + progressScopeNameIndex;
        util.delayLinger.start( lProgressScopeName, function() {

            // First lets deal with the simplest 'page' centered indicator
            if ( lLoadingIndicatorPosition === "page" ) {

                lLoadingIndicator$ = util.showSpinner();
                lLoadingIndicators$ = lLoadingIndicators$.add( lLoadingIndicator$ );

            } else {

                // Add a loading indicator if the attribute has been specified and store the reference to it to remove it later on
                if ( $.isFunction( lOptions.loadingIndicator ) ) {

                    // function has to return the created jQuery object or a function which removes the loading indicator
                    lLoadingIndicators$ = lOptions.loadingIndicator ( lLoadingIndicatorTmpl$ );
                } else {

                    // Iterate over elements in the loadingIndicator as this could be more than 1 element
                    $( lOptions.loadingIndicator ).each( function() {

                        lLoadingIndicator$ = lLoadingIndicatorTmpl$.clone();

                        // First check if element has a loadingIndicator callback, if so use it
                        if ( apex.item( this ).callbacks.loadingIndicator !== undefined ) {
                            lLoadingIndicator$ = apex.item( this ).loadingIndicator( lLoadingIndicator$ );
                        } else {

                            // Now we know loadingIndicator is not a function, we consider the position passed as well.
                            if ( lLoadingIndicatorPosition === "before" ) {
                                lLoadingIndicator$ = lLoadingIndicator$.insertBefore( $( this, apex.gPageContext$ ).filter( ":not(:hidden)" ));
                            } else if ( lLoadingIndicatorPosition === "after" ) {
                                lLoadingIndicator$ = lLoadingIndicator$.insertAfter( $( this, apex.gPageContext$ ).filter( ":not(:hidden)" ));
                            } else if ( lLoadingIndicatorPosition === "prepend" ) {
                                lLoadingIndicator$ = lLoadingIndicator$.prependTo( $( this, apex.gPageContext$ ));
                            } else if ( lLoadingIndicatorPosition === "append" ) {
                                lLoadingIndicator$ = lLoadingIndicator$.appendTo( $( this, apex.gPageContext$ ));
                            } else if ( lLoadingIndicatorPosition === "centered" ) {
                                lLoadingIndicator$ = util.showSpinner( $( this, apex.gPageContext$ ) );
                            }
                        }

                        lLoadingIndicators$ = lLoadingIndicators$.add( lLoadingIndicator$ );
                    });
                }
            }
        });
    }

    // Set the values which should get submitted and register our callbacks
    // which will perform some basic handling after an AJAX call completes.
    lOptions.data    = lData;
    lOptions.error =
        function( pjqXHR, pTextStatus, pErrorThrown ) {
            _error( pjqXHR, pTextStatus, pErrorThrown, {
                callback:         lErrorCallback,
                loadingIndicator: lLoadingIndicators$,
                progressScopeName: lProgressScopeName
            });
        };
    lOptions.success =
        function( pData, pTextStatus, pjqXHR ) {
            _success( pData, pTextStatus, pjqXHR, {
                callback:         lSuccessCallback,
                errorCallback:    lOptions.error,
                loadingIndicator: lLoadingIndicators$,
                progressScopeName: lProgressScopeName,
                refreshObject:    lOptions.refreshObject });
        };

    // perform the AJAX call and return the jQuery object
    return $.ajax( lOptions );
} // _call


/**
 * @TODO documentation missing
 * @private
 */
function _removeLoadingIndicator ( pLoadingIndicator, pProgressScopeName ) {

    function cleanup() {
        // Remove a loading indicator if the attribute has been specified
        if ( $.isFunction( pLoadingIndicator ) ) {
            pLoadingIndicator();
        } else {
            $( pLoadingIndicator, apex.gPageContext$ ).remove();
        }
    }

    if ( pProgressScopeName ) {
        util.delayLinger.finish( pProgressScopeName, function(){
            cleanup();
        });
    } else {
        cleanup();
    }

} // _removeLoadingIndicator

/**
 * @TODO documentation missing
 * @private
 */
// noinspection FunctionWithMultipleReturnPointsJS
function _success( pData, pTextStatus, pjqXHR, pOptions ) {

    var lResult      = true,
        lErrorHeader = pjqXHR.getResponseHeader( "X-APEX-ERROR" );

    // check for errors first, allowing for pData to be null or undefined where the call returns nothing
    if ( pData ) {
        if ( pData.error ) {
            // TODO not sure why we can't just use pjqXHR.error - have to investigate
            return pOptions.errorCallback( pjqXHR, "APEX", pData.error );
        } else if ( lErrorHeader ) {
            return pOptions.errorCallback( pjqXHR, "APEX", lErrorHeader );
        }
    }

    _removeLoadingIndicator( pOptions.loadingIndicator, pOptions.progressScopeName );

    // call success callback if one is specified
    if ( $.isFunction( pOptions.callback ) ) {
        lResult = pOptions.callback( pData, pTextStatus, pjqXHR );
    }

    // Trigger the after refresh event if the attribute has been specified
    // But only do it if the callback returned <> false.
    // Note: By intention we check with == to capture null as well
    //noinspection JSHint
    if ( lResult || lResult == undefined ) {
        if ( apex.event.trigger( pOptions.refreshObject, "apexafterrefresh", pOptions.refreshObjectData ) ) {

            // If trigger function returns true, cancel the refresh by exiting the function, returning false
            return false;
        }
    }

    return lResult;
} // _success


/**
 * @TODO documentation missing
 * @private
 */
function _error( pjqXHR, pTextStatus, pErrorThrown, pOptions ) {

    var lMsg,
        lResult = false;

    _removeLoadingIndicator( pOptions.loadingIndicator, pOptions.progressScopeName );

    // TODO Handle APEX standard errors here $$$ (eg. session expired, ...)

    // call error callback if one is specified
    if ( $.isFunction( pOptions.callback ) ) {
        lResult = pOptions.callback( pjqXHR, pTextStatus, pErrorThrown );
    } else if ( pjqXHR.status !== 0 ) {
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

    return lResult;
} // _error


})( apex.server, apex.jQuery, apex.util );

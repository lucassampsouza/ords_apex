/*global apex*/
/**
 * @fileOverview
 * The {@link apex.builder.plugin}.codeEditor is used for the code editor widget of Oracle Application Express.
 * Used by both the Code Editor and CLOB Code Editor plugins.
 * Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 **/

( function( plugin, server, widget, $, undefined ) {
    "use strict";

    /**
     * @param {String} pSelector  jQuery selector to identify APEX page item for this widget.
     * @param {Object} [pOptions]
     *
     * @function codeEditor
     * @memberOf apex.builder.plugin
     * */
    plugin.codeEditor = function( pSelector, pOptions ) {

        var editor$ = $( pSelector ),
            textArea$ = editor$.children("textarea" ),
            validationFunction, queryBuilderFunction;

        // Make the height of the editor the same as the textarea it replaces.
        editor$.height( textArea$.height() + 80 ); // include room for the toolbar and search bar

        if ( pOptions.validate && !pOptions.readOnly ) {
            validationFunction = function( code, callback ) {

                server.plugin ( pOptions.ajaxIdentifier, {
                    x01:       "validate",
                    x02:       pOptions.appId,
                    p_clob_01: code
                }, {
                    success: function( data ) {
                        if ( data.result === "OK" ) {
                            callback({
                                errors: []
                            });
                        } else {
                            callback({
                                errors: [ data.result ]
                            });
                        }
                    }
                });
            };
        }

        if ( pOptions.queryBuilder ) {

            queryBuilderFunction = function( editor, code ) {
                apex.navigation.popup({
                    url: apex.util.makeApplicationUrl({
                        appId:      4500,
                        pageId:     1002,
                        clearCache: 1002,
                        itemNames:  [ "P1002_RETURN_INTO", "P1002_POPUP", "P1002_SCHEMA" ],
                        itemValues: [ editor.baseId, "1", pOptions.parsingSchema ]
                    }),
                    width:  950,
                    height: 720
                });
            };
        }

        // Initialize the editor
        editor$.codeEditor( $.extend( {
            mode:         pOptions.mode,
            readOnly:     pOptions.readOnly,
            codeComplete: function( pSearchOptions, pCallback ) {

                server.plugin ( pOptions.ajaxIdentifier, {
                    p_widget_name: pSearchOptions.type,
                    x01: "hint",
                    x02: pOptions.appId,
                    x03: pSearchOptions.search,
                    x04: pSearchOptions.parent,
                    x05: pSearchOptions.grantParent
                }, {
                    success: pCallback
                });

            },
            validateCode:    validationFunction,
            queryBuilder:    queryBuilderFunction,
            settingsChanged: function() {
                var settings = $(this).codeEditor( "getSettingsString" );

                server.plugin ( pOptions.ajaxIdentifier, {
                    x01: "save",
                    x02: pOptions.appId,
                    x03: settings
                }, {
                    queue: {name:"codeEditor_save_settings", action: "lazyWrite"},
                    dataType: ""
                });
            }
        }, $.apex.codeEditor.optionsFromSettingsString( pOptions.settings || "" ) ) );

        if ( pOptions.adjustableHeight ) {
            editor$.wrap("<div class='a-CodeEditor--resizeWrapper'></div>").parent().resizable({
                handles: "s",
                helper: "a-CodeEditor--resizeHelper"
            } ).on( "resizestop", function( e, ui ) {
                var w$ = $( this ),
                    e$ = $( this ).children().eq( 0 );
                w$.width( w$.width() + 1 ); // may be a resizable bug but when using a helper the width shrinks by 1px
                e$.height( w$.height() - 2 );
                e$.width( w$.width() );
                e$.trigger( "resize" );
            });
            editor$.parent().find( ".ui-resizable-handle.ui-resizable-s" ).attr( "tabindex", 0 ).on( "keydown", function( e ) {
                if ( e.which === $.ui.keyCode.UP || e.which === $.ui.keyCode.DOWN ) {
                    var h, w,
                        w$ = $( this ).parent();

                    w = w$.width() - 1; // match what resizable does
                    if ( e.which === $.ui.keyCode.UP ) {
                        h = w$.height() - 10;
                        if ( h < 100 ) {
                            h = 100;
                        }
                    } else {
                        h = w$.height() + 10;
                        if ( h > 1000 ) {
                            h = 1000;
                        }
                    }
                    w$.width( w );
                    w$.height( h ).trigger( "resizestop" );
                    e.preventDefault();
                }
            } );
        }

        if ( textArea$[0].id ) {
            // strictly speaking this is only needed for the item plugin but it does no harm to add it always
            widget.initPageItem( textArea$[0].id, {
                show: function() {
                    editor$.show();
                },
                hide: function() {
                    editor$.hide();
                },
                setValue: function( pValue, pDisplayValue ) {
                    editor$.codeEditor( "setValue", pValue );
                },
                getValue: function() {
                    return editor$.codeEditor( "getValue" );
                },
                setFocusTo: function() {
                    // this should return the jQuery object to set focus to but the codeEditor widget doesn't work that way
                    // so do what must be done
                    editor$.codeEditor( "focus" );
                    // and return fake object with focus method to keep caller happy
                    return {focus:function(){}};
                }
            });
        }

    }; // codeEditor

    /**
     * Save the code editor data using an ajax process. Useful for clob code editor plugin because the data can
     * span more than one fnn parameter. The process is assumed to return 204 no data.
     *
     * @param pSelector identifies the code editor
     * @param pProcess name of the server process to call that will save the data
     * @param pName the data property/parameter name typically "f01"
     * @param pOtherData optional object with other data for server.process
     * @returns jaXHR object
     */
    plugin.codeEditor.saveProcess = function( pSelector, pProcess, pName, pOtherData ) {
        var code,
            data = pOtherData ? $.extend( true, {}, pOtherData ) : {};

        code = $( pSelector ).codeEditor( "getValue" );
        if ( code.length <= 4000 ) {
            data[pName] = code;
        } else {
            data[pName] = [];
            while ( code.length > 4000) {
                data[pName].push( code.substr(0,4000) );
                code = code.substr(4000);
            }
            data[pName].push( code.substr(0,4000) );
        }

        return server.process( pProcess, data, {
            dataType: "",
            loadingIndicator: pSelector,
            loadingIndicatorPosition: "page"
        });
    };

    /**
     * Save the code editor data and submit the page. Useful for clob code editor plugin because the data can
     * span more than one fnn parameter.
     *
     * @param pSelector identifies the code editor
     * @param pName the data property/parameter name typically "f01"
     * @param pOptions same options as for apex.page.submit
     * @returns jaXHR object
     */
    plugin.codeEditor.saveSubmit = function( pSelector, pName, pOptions ) {
        var code,
            formName = pOptions.form || "wwv_flow",
            form$ = $( "form[name=" + formName + "]", apex.gPageContext$ );

        function addInput(value) {
            form$.append("<input type='hidden' name='" + pName + "' value = '" + apex.util.escapeHTML( value ) + "'>");
        }

        code = $( pSelector ).codeEditor( "getValue" );
        if ( code.length <= 4000 ) {
            addInput(code);
        } else {
            while ( code.length > 4000) {
                addInput(code.substr(0,4000));
                code = code.substr(4000);
            }
            addInput(code.substr(0,4000));
        }
        apex.page.submit( pOptions );
    };

    $( document ).ready( function() {
        $( document.body ).on( "codeeditorsettingschanged", function( event ) {
            var changed$ = $( event.target ),
                settings = $.apex.codeEditor.optionsFromSettingsString( changed$.codeEditor( "getSettingsString" ) );

            // when one code editor changes its settings update all the others
            $( ".a-CodeEditor" ).each( function() {
                if ( this !== event.target ) {
                    $( this ).codeEditor( "option", settings );
                }
            } );
        } );

        $( window ).on( "apexwindowresized", function() {
            // resize code editors but not ones that are already intended to resize with the window.
            // this is just for the case where the container width adjusts automatically with a special
            // case for height adjustable option
            $( ".a-CodeEditor" ).not( ".resize" ).each( function() {
                var w,
                    r$ = $( this ).parent();

                if ( r$.hasClass( "a-CodeEditor--resizeWrapper" )) {
                    w = r$.parent().width();
                    r$.width( w );
                    $( this ).width( w );
                }
                $( this ).trigger( "resize" );
            } );
        });

    } );

})( apex.builder.plugin, apex.server, apex.widget, apex.jQuery );

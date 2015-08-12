/*global apex,pe,$v,$s,gTeamDevEnabled,gBuilderLang,gPreferences,gIsInternal,gIsReadOnly,gLanguage,gApexVersion,apex_img_dir*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright © 2013, 2015, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * This is the main controller for the page designer. It contains initialization logic for tabs and accordions,
 * resize, global undo/redo, dev toolbar integration etc. It also has some utility functions in namespace pageDesigner
 * that can be used by the other controllers.
 **/

window.pageDesigner = {};

(function( model, $, util, lang, nav, pd, server, undefined ) {
    "use strict";

    // BEGIN common page designer constants and functions
    var gStatic,
        gTeamDevCounters;

    var C_PROCESSING = "is-processing";

    function checkDisplayCurrentPage() {
        if ( model.getCurrentPageId() !== $.trim( $( "#go_to_page" ).val() ) ) {
            $( "#go_to_page" ).val( model.getCurrentPageId() );
        }
    }

    // common CSS classes
    pd.CSS = {
        IS_ERROR:           "is-error",
        IS_WARNING:         "is-warning",
        IS_CONDITIONAL:     "is-conditional",
        DIALOG_FLUSH_BODY:  "ui-dialog-flushBody"
    };

    // common constants for settings menu options
    pd.SETTINGS = {
        COMPONENT_TITLE: {
            LABEL: "l",
            NAME:  "n"
        }
    };

    // current state of the settings menu
    pd.settingsState = {
        componentTitle: pd.SETTINGS.COMPONENT_TITLE.NAME
    };


    pd.msg = function ( pKey ) {
        return lang.getMessage( "PD." + pKey );
    };

    pd.format = function ( pKey ) {
        var pattern = pd.msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    };

    pd.tooltipContentForComponent = function( pComponent ) {
        var typeId = pComponent.typeId,
            out    = apex.util.htmlBuilder();

        function addProperty( pPropertyId, pIgnoreValue ) {
            var property = pComponent.getProperty( pPropertyId ),
                value;

            if ( property && ( pIgnoreValue === undefined || property.getValue() !== pIgnoreValue )) {
                value = property.getDisplayValue();

                if ( value !== "" ) {
                    out.markup("<li><span class='tt-label'>")
                        .content( property.getMetaData().prompt )
                        .markup(": </span><span class='tt-value'>")
                        .content( value ) // todo we should limited that to a max length. What would be a good value?
                        .markup("</span></li>");
                }
            }
        }


        function addGenericProperties() {
            var lProperty = pComponent.getProperty( model.PROP.CONDITION_TYPE );

            addProperty( model.PROP.WHEN_BUTTON_PRESSED );

            if ( lProperty && lProperty.getValue() !== "" ) {
                addProperty( model.PROP.CONDITION_TYPE );
                addProperty( model.PROP.CONDITION_SQL_STATEMENT );
                addProperty( model.PROP.CONDITION_SQL_EXPRESSION );
                addProperty( model.PROP.CONDITION_PLSQL_EXPRESSION );
                addProperty( model.PROP.CONDITION_PLSQL_FUNCTION_BODY );
                addProperty( model.PROP.CONDITION_VALUE1 );
                addProperty( model.PROP.CONDITION_ITEM1 );
                addProperty( model.PROP.CONDITION_LIST );
                addProperty( model.PROP.CONDITION_PREFERENCE );
                addProperty( model.PROP.CONDITION_PAGE );
                addProperty( model.PROP.CONDITION_PAGES );
                addProperty( model.PROP.CONDITION_TEXT );
                addProperty( model.PROP.CONDITION_VALUE2 );
                addProperty( model.PROP.CONDITION_ITEM2 );
                addProperty( model.PROP.CONDITION_TEXT2 );
            }

            addProperty( model.PROP.AUTHORIZATION_SCHEME );
            addProperty( model.PROP.BUILD_OPTION );
        }


        function addGridProperties() {

            addProperty( model.PROP.GRID_NEW_GRID,    "N" );
            addProperty( model.PROP.GRID_NEW_ROW,     "N" );
            addProperty( model.PROP.GRID_COLUMN,      "" ); // Because null value will return Automatic
            addProperty( model.PROP.GRID_NEW_COLUMN,  "N" );
            addProperty( model.PROP.GRID_COLUMN_SPAN, "" ); // Because null value will return Automatic
        }


        function addDaEventProperties() {
            var lProperty = pComponent.getProperty( model.PROP.WHEN_TYPE );

            addProperty( model.PROP.EVENT );
            addProperty( model.PROP.CUSTOM_EVENT );

            if ( lProperty && lProperty.getValue() !== "" ) {
                addProperty( model.PROP.WHEN_REGION );
                addProperty( model.PROP.WHEN_BUTTON );
                addProperty( model.PROP.WHEN_ITEMS );
                addProperty( model.PROP.WHEN_DOM_OBJECT );
                addProperty( model.PROP.WHEN_JQUERY_SELECTOR );
                addProperty( model.PROP.WHEN_JAVASCRIPT_EXPRESSION );
            }
        }


        function addDaActionProperties() {
            var lProperty = pComponent.getProperty( model.PROP.AFFECTED_TYPE );

            if ( lProperty && lProperty.getValue() !== "" ) {
                addProperty( model.PROP.AFFECTED_REGION );
                addProperty( model.PROP.AFFECTED_BUTTON );
                addProperty( model.PROP.AFFECTED_ITEMS );
                addProperty( model.PROP.AFFECTED_DOM_OBJECT );
                addProperty( model.PROP.AFFECTED_JQUERY_SELECTOR );
                addProperty( model.PROP.AFFECTED_JAVASCRIPT_EXPRESSION );
                if ( lProperty.getValue() === "TRIGGERING_ELEMENT" || lProperty.getValue() === "EVENT_SOURCE"  ) {
                    addProperty( model.PROP.AFFECTED_TYPE );
                }
            }
        }


        function addComputationProperties() {

            addProperty( model.PROP.COMPUTATION_STATIC_VALUE );
            addProperty( model.PROP.COMPUTATION_SQL_STATEMENT );
            addProperty( model.PROP.COMPUTATION_SQL_COLON );
            addProperty( model.PROP.COMPUTATION_SQL_EXPRESSION );
            addProperty( model.PROP.COMPUTATION_PLSQL_EXPRESSION );
            addProperty( model.PROP.COMPUTATION_PLSQL_FUNCTION_BODY );
            addProperty( model.PROP.COMPUTATION_ITEM_VALUE );
            addProperty( model.PROP.COMPUTATION_PREFERENCE_VALUE );
        }


        function addValidationProperties() {

            var lRegionId = pComponent.getProperty( model.PROP.VALIDATION_REGION ).getValue();

            if ( lRegionId === "" ) {
                addProperty( model.PROP.VALIDATION_TYPE );
                addProperty( model.PROP.VAL_SQL_STATEMENT );
                addProperty( model.PROP.VAL_SQL_EXPRESSION );
                addProperty( model.PROP.VAL_PLSQL_EXPRESSION );
                addProperty( model.PROP.VAL_PLSQL_FUNCTION_BODY_BOOLEAN );
                addProperty( model.PROP.VAL_PLSQL_FUNCTION_BODY_VARCHAR2 );
                addProperty( model.PROP.VAL_PLSQL );
                addProperty( model.PROP.VAL_ITEM );
                addProperty( model.PROP.VAL_VALUE );
                addProperty( model.PROP.VAL_REGULAR_EXPRESSION );
            } else {
                addProperty( model.PROP.VALIDATION_REGION );
                addProperty( model.PROP.REGION_VALIDATION_TYPE );
                addProperty( model.PROP.REGION_VAL_SQL_STATEMENT );
                addProperty( model.PROP.REGION_VAL_SQL_EXPRESSION );
                addProperty( model.PROP.REGION_VAL_PLSQL_EXPRESSION );
                addProperty( model.PROP.REGION_VAL_PLSQL_FUNCTION_BODY_BOOLEAN );
                addProperty( model.PROP.REGION_VAL_PLSQL_FUNCTION_BODY_VARCHAR2 );
                addProperty( model.PROP.REGION_VAL_PLSQL );
                addProperty( model.PROP.REGION_VAL_COLUMN );
                addProperty( model.PROP.REGION_VAL_VALUE );
                addProperty( model.PROP.REGION_VAL_REGULAR_EXPRESSION );
            }
            addProperty( model.PROP.ALWAYS_EXECUTE );
        }

        if ( typeId ===  model.COMP_TYPE.PAGE ) {
            addProperty( model.PROP.TITLE );
        } else if ( typeId === model.COMP_TYPE.REGION ) {
            addProperty( model.PROP.REGION_TYPE );
            addGridProperties();
        } else if ( typeId === model.COMP_TYPE.PAGE_ITEM ) {
            addProperty( model.PROP.ITEM_LABEL );
            addProperty( model.PROP.ITEM_TYPE );
            addGridProperties();
        } else if ( typeId === model.COMP_TYPE.BUTTON ) {
            addProperty( model.PROP.BUTTON_LABEL );
            addProperty( model.PROP.BUTTON_ACTION );
            // todo also want the page number?
            addGridProperties();
        } else if ( typeId === model.COMP_TYPE.DA_EVENT ) {
            addDaEventProperties();
        } else if ( typeId === model.COMP_TYPE.DA_ACTION ) {
            addDaActionProperties();
        } else if ( typeId === model.COMP_TYPE.VALIDATION ) {
            addValidationProperties();
        } else if ( typeId === model.COMP_TYPE.PAGE_PROCESS ) {
            addProperty( model.PROP.PAGE_PROCESS_TYPE );
        } else if ( typeId === model.COMP_TYPE.PAGE_COMPUTATION ) {
            addComputationProperties();
        } else if ( typeId === model.COMP_TYPE.BRANCH ) {
            addProperty( model.PROP.BRANCH_TYPE );
            addProperty( model.PROP.TARGET );
            addProperty( model.PROP.BRANCH_PAGE_NUMBER );
            addProperty( model.PROP.BRANCH_ACCEPT_REQUEST );
            addProperty( model.PROP.BRANCH_ITEM );
        } else if ( typeId === model.COMP_TYPE.IR_COLUMN ) {
            addProperty( model.PROP.COLUMN_HEADING );
            addProperty( model.PROP.IR_COLUMN_DISPLAY_TYPE );
        } else if ( typeId === model.COMP_TYPE.CLASSIC_RPT_COLUMN ) {
            addProperty( model.PROP.COLUMN_HEADING );
            addProperty( model.PROP.CLASSIC_REPORT_COLUMN_TYPE );
        } else if ( typeId === model.COMP_TYPE.TAB_FORM_COLUMN ) {
            addProperty( model.PROP.COLUMN_HEADING );
            addProperty( model.PROP.TAB_FORM_COLUMN_TYPE );
        }

        addGenericProperties();

        if ( out.toString() ) {
            return "<ul class='tt-list'>" + out.toString() + "</ul>";
        } else {
            return null;
        }

    };

    /**
     * Get a component specific icon class.
     * @param {String} type One of: region, item, button
     * @param {String} componentType for regions and items this is the type/plugin name such as NATIVE_CHECKBOX for buttons it is normal or hot
     * @return {String}
     */
    pd.getComponentIconClass = function( type, componentType ) {
        if ( /^PLUGIN_/.test( componentType )) {
            return "icon-" + type + "-plugin";
        } else {
            return "icon-" + type + "-" + componentType.toLowerCase().replace( /_/g, "-" );
        }
    };

    pd.isConditional = function( pComponent ) {

        function hasValue( pPropertyId ) {
            var property = pComponent.getProperty( pPropertyId );
            return ( property && property.getValue() !== "" );
        }

        return ( hasValue( model.PROP.CONDITION_TYPE ) || hasValue( model.PROP.AUTHORIZATION_SCHEME ) || hasValue( model.PROP.BUILD_OPTION ) || hasValue( model.PROP.WHEN_BUTTON_PRESSED ));
    };


    pd.observerIsConditional = function( pWidget, pComponentsFilter, pFunction ) {

        model.observer(
            pWidget,
            {
                components: pComponentsFilter,
                events:     [ model.EVENT.CHANGE ],
                properties: [ model.PROP.CONDITION_TYPE, model.PROP.AUTHORIZATION_SCHEME, model.PROP.BUILD_OPTION, model.PROP.WHEN_BUTTON_PRESSED ]
            },
            pFunction );
    };


    pd.isDisplayed = function( pComponent ) {

        var lConditionType,
            lIsDisplayed = true;

        // Don't show global page components if they are not visible on the current page
        if ( pComponent.isOnGlobalPage()) {

            lConditionType = pComponent.getProperty( model.PROP.CONDITION_TYPE ).getValue();

            if ( lConditionType === "CURRENT_PAGE_EQUALS_CONDITION" ) {
                lIsDisplayed = ( pComponent.getProperty( model.PROP.CONDITION_PAGE ).getValue() === model.getCurrentPageId());
            } else if ( lConditionType === "CURRENT_PAGE_NOT_EQUAL_CONDITION" ) {
                lIsDisplayed = ( pComponent.getProperty( model.PROP.CONDITION_PAGE ).getValue() !== model.getCurrentPageId());
            } else if ( lConditionType === "CURRENT_PAGE_IN_CONDITION" ) {
                lIsDisplayed = ( $.inArray( model.getCurrentPageId(), pComponent.getProperty( model.PROP.CONDITION_PAGES ).getValue().split( "," )) !== -1 );
            } else if ( lConditionType === "CURRENT_PAGE_NOT_IN_CONDITION" ) {
                lIsDisplayed = ( $.inArray( model.getCurrentPageId(), pComponent.getProperty( model.PROP.CONDITION_PAGES ).getValue().split( "," )) === -1 );
            }
        }

        return lIsDisplayed;
    };

    // Allow other pages that the builder opens to change the page and/or selection
    // Used by dev toolbar
    // All fields but app-id are optional.
    pd.setPageSelection = function( pAppId, pPageId, pTypeId, pComponentId, pCallback ) {
        var result = "OK",
            deferred;

        if ( !pAppId || pAppId !==  model.getCurrentAppId() ) {
            result = "APP_NOT_CHANGED";
        } else {
            if ( pPageId && pPageId !== model.getCurrentPageId() ) {

                deferred = pd.goToPage( pPageId );
                $.when( deferred )
                    .done( function() {
                        if ( pTypeId && pComponentId ) {
                            if ( !pd.goToComponent( pTypeId, pComponentId ) ) {
                                result = "COMPONENT_NOT_SELECTED";
                            }
                        }
                        pCallback( result );
                    })
                    .fail( function(reason) {
                        if ( reason === "user-abort" ) {
                            pCallback( "PAGE_CHANGE_ABORTED" );
                        } else {
                            pCallback( "PAGE_NOT_CHANGED" );
                        }
                    });

                return;
            } else {
                if ( pTypeId && pComponentId ) {
                    if ( !pd.goToComponent( pTypeId, pComponentId ) ) {
                        result = "COMPONENT_NOT_SELECTED";
                    }
                }
            }
        }
        pCallback( result );
    };

    /*
     * Changes the current page to the specified one.
     */
    pd.goToPage = function( pPageId ) {

        var lSharedComponent,
            lSpinner$,
            lPage,
            lContainer$ = $( "#a_PageDesigner" ),
            lDeferred = $.Deferred();

        if ( model.hasChanged() ) {
            if ( !window.confirm( pd.msg( "BEFORE_AJAX_UNSAVED_CHANGES" ) ) ) {
                checkDisplayCurrentPage();
                lDeferred.reject("user-abort");
                return lDeferred.promise();
            }
        }

        // Clear data of the current page
        $( document ).trigger( "selectionChanged", [ "controller", []] );
        model.clear();
        $( document ).trigger( "modelCleared" );

        // Load new page
        $( "#go_to_page" ).val( pPageId );

        logTimeStart( "waitSpinner" ); // todo remove after optimization

        util.delayLinger.start( "main", function(){
            lSpinner$ = util.showSpinner( lContainer$ );
            lContainer$.addClass( C_PROCESSING );
        });

        logTimeStart( "loadServerData" ); // todo remove after optimization

        if ( !gStatic ) {
            gStatic = $.ajax({
                dataType: "json",
                type:     "GET",
                url:      apex_img_dir + "apex_ui/js/staticData/pd_static_data_" + gLanguage + ".json?v=" + gApexVersion
            });
        }
        lSharedComponent = server.process( "getSharedComponentData", {}, {
            type: "GET"
        });

        lPage = server.process( "getPageData", {
            x01: pPageId
        }, {
            type: "GET"
        });

        // todo add some error handling
        $.when( gStatic, lSharedComponent, lPage )
            .done( function( pStatic, pSharedComponent, pPage ) {

                logTimeEnd( "loadServerData" ); // todo remove after optimization

                if ( $.isEmptyObject(pPage[ 0 ])) {
                    pd.showError( pd.msg( "PAGE_DOES_NOT_EXIST" ) );
                } else {

                    logTimeStart( "set model" ); // todo remove after optimization

                    model.setStaticData( pStatic[ 0 ]);
                    model.setSharedComponentData( pSharedComponent[ 0 ]);
                    model.setComponentData( pPage[ 0 ]);

                    model.setCurrentAppId( $v( "P4500_CURRENT_APP" ) );
                    model.setCurrentPageId( pPageId );

                    logTimeEnd( "set model" ); // todo remove after optimization
                    logTimeStart( "modelReady" ); // todo remove after optimization

                    $( document ).trigger( "modelReady" );

                    logTimeEnd( "modelReady" ); // todo remove after optimization

                    // Get team development and page comment count
                    server.process( "getAdditionalData", {
                        x01: pPageId
                    }, {
                        type: "GET",
                        success: function( pData ) {
                            var lTotal, lTitle;

                            lTitle = pd.format( "COMMENTS_BADGE_TITLE", pData.comments );
                            $( "#button-comments" )
                                .prop( "disabled", false )
                                .attr( "aria-label", lTitle )
                                .attr( "title", lTitle )
                                .find( ".a-Button-badge" ).text( pData.comments === 0 ? "" : pData.comments );

                            if ( gTeamDevEnabled ) {
                                lTotal = pData.teamDev.features + pData.teamDev.bugs + pData.teamDev.todos + pData.teamDev.feedback;
                                lTitle = pd.format( "TEAM_DEV_BADGE_TITLE", lTotal );
                                if ( lTotal === 0 ) {
                                    lTotal = "";
                                }
                                $( "#menu-team-dev" )
                                    .prop( "disabled", false )
                                    .attr( "aria-label", lTitle )
                                    .attr( "title", lTitle )
                                    .find( ".a-Button-badge" ).text( lTotal );
                                gTeamDevCounters = pData.teamDev;
                            }
                        }
                    });

                    // Select the page node as starting node
                    logTimeStart( "selectionChanged" ); // todo remove after optimization

                    $( document ).trigger( "selectionChanged", [ "controller", model.getComponents( model.COMP_TYPE.PAGE, { id: model.getCurrentPageId()})]);

                    logTimeEnd( "selectionChanged" ); // todo remove after optimization

                    lDeferred.resolve();
                }
            })
            .fail( function() {
                lDeferred.reject();
            })
            .always( function() {
                util.delayLinger.finish( "main", function(){
                    lSpinner$.remove();
                    lContainer$.removeClass( C_PROCESSING );
                });

                logTimeEnd( "waitSpinner" ); // todo remove after optimization
            });

        return lDeferred.promise();

    };


    pd.goToComponent = function( typeId, componentId, propertyId ) {
        var components = model.getComponents( typeId, { id: componentId });

        if ( components.length !== 1 ) {
            return false;
        }
        $( document ).trigger( "selectionChanged", [ "controller", components, propertyId ]);
        // make sure the right tab panel is selected
        $( "#PDrenderingTree, #PDdynamicActionTree, #PDprocessingTree, #PDsharedCompTree" ).each( function(index) {
            var node, tree$ = $( this );

            node = tree$.treeView( "getSelectedNodes" )[0];
            if ( node && node.data.componentId === componentId ) {
                $("#trees" ).tabs( "option", "active", index );
                // select again to make sure it is scrolled into view and focus, but don't change the focus if we want
                // to set focus to a specific property
                tree$.treeView( "setSelectedNodes", [ node ], ( propertyId === undefined ) );
                return false; // no need to check any others
            }
        });
        return true;
    };

    /*
     * Show a success notification
     */
    pd.showSuccess = function ( pMsg ) {
        $( "#pdNotificationState" ).addClass( "is-success" );
        $( "#pdNotificationIcon" ).addClass( "icon-check" );
        pd.showNotification( pMsg );
    };

    /*
     * Show an error notification
     */
    pd.showError = function ( pMsg ) {
        $( "#pdNotificationState" ).addClass( "is-error" );
        $( "#pdNotificationIcon" ).addClass( "icon-error" );
        pd.showNotification( pMsg );
    };

    /*
     * Base show notification logic
     */
    pd.showNotification = function ( pMsg ) {
        var lMessageText,
            lMessage$ = $( "#pdNotificationMessage" );
        if ( pMsg ) {
            lMessageText = lMessage$
                .text()
                .replace( "#PD_MESSAGE#", pMsg );
            lMessage$.text( lMessageText );
        }
        $( "#pdNotification" )
            .addClass( "is-displayed" )
            .fadeIn( "slow" );

        // setup handlers to hide notification
        $( document )
            .on( "commandHistoryChange.forMsg", function( event ) {

                // for command history change, we need to also check if the model has changed,
                // otherwise the handler gets triggered on page load (this also means we can't use 'one').
                if ( model.hasChanged() ) {
                    pd.hideNotification();
                }

            })
            .on( "modelCleared.forMsg", function( event ) {

                pd.hideNotification();

            });

        /* todo problem with "selectionChanged.forMsg", because the default page selection on page load removes it
           in the case when the message is displayed on page load */
    };

    pd.hideNotification = function () {
        $( "#pdNotification" )
            .removeClass( "is-displayed" )
            .fadeOut( "slow", function() {
                $( "#pdNotificationMessage" ).text( "#PD_MESSAGE#" );
                $( "#pdNotificationState" ).removeClass( "is-error is-success" );
                $( "#pdNotificationIcon" ).removeClass( "icon-error icon-check" );
            });

        // remove handlers that hide notification
        $( document ).off( ".forMsg" );
    };

    pd.setHelpText = function( markup, feedbackParams ) {
        var help$ = $( "#help-container" );

        // Add a feedback link if we are able to identify the help text
        if ( feedbackParams ) {
            markup += '<div class="a-HelpFeedback"><a class="a-Button a-Button--small a-Button--noUI" href="https://apex.oracle.com/pls/apex/f?p=apex_help_feedback:1:::::' +
                feedbackParams + '&p_lang=' + gBuilderLang + '" target="_blank">' + pd.msg( "HELP.FEEDBACK" ) + '</a></div>';
        }
        help$.html( markup );
    };

    pd.clearHelpText = function() {
        var help$ = $( "#help-container" ),
            markup = pd.msg( "HELP.DEFAULT" );

        help$.html( markup );
    };


    pd.getPreference = function( pName ) {
        var lName = "PD_" + pName;

        // Note: gPreference is a global emitted directly from page 4500 during rendering
        return ( window.gPreferences.hasOwnProperty( lName ) ) ? window.gPreferences[ lName ] : null;
    };

    pd.savePreference = function( pName, pValue ) {
        var lName = "PD_" + pName,
            lOldValue = window.gPreferences[ lName ];

        // Note: gPreference is a global emitted directly from page 4500 during rendering
        window.gPreferences[ lName ] = pValue;

        // persist the preference setting if the value has changed
        if ( lOldValue !== pValue ) {
            server.process (
                "setPreference", {
                    x01: lName,
                    x02: pValue
                }, {
                    dataType: "" // don't expect any data back
                }
            );
        }
    };

    pd.saveBoolPref = function( pName, pValue ) {
        pd.savePreference( pName, pValue ? "Y" : "N" );
    };

    pd.getBoolPref = function( pName, pDefaultValue ) {
        var lValue = pd.getPreference( pName );
        if ( lValue === null ) {
            lValue = pDefaultValue;
        } else {
            lValue = ( lValue === "Y" );
        }
        return lValue;
    };

    // END common page designer constants and functions

    // todo remove when not needed anymore
    function logTimeStart( pLabel ) {
        if ( apex.debug.getLevel() === apex.debug.LOG_LEVEL.ENGINE_TRACE ) {
            console.time( pLabel );
        }
    }

    // todo remove when not needed anymore
    function logTimeEnd( pLabel ) {
        if ( apex.debug.getLevel() === apex.debug.LOG_LEVEL.ENGINE_TRACE ) {
            console.timeEnd( pLabel );
        }
    }

    function parseSelectionHash( hash ) {
        var parts,
            isValid = /^[0-9:]+$/,
            selection = null;

        if ( hash.charAt( 0)  === "#" ) {
            hash = hash.substring( 1 );
        }
        if ( isValid.test( hash ) ) {
            parts = hash.split( ":" );
            if ( parts.length === 2 ) {
                selection = {
                    typeId: parts[0],
                    componentId: parts[1]
                };
            }
        }
        return selection;
    }


    // $$$ TODO We might want to move all the toolbar related code into it's own f4000_p4500.toolbar.js file
    function initToolbar() {
        var lTeamMenu$, lSpinner$,
            lCreateMenu$    = $( "#createMenu_menu" ),
            lSettingsMenu$  = $( "<div id='pdSettingsMenu'></div>" ).appendTo( "body" ),
            lLockButton$ = $( "#button-lock" ),
            lLockDialog$ = $( "#lockDialog" ),
            lRunDialogOpenMsg$ = $( "#runDialogOpenMsg" ),
            lRunDialogFocusMsg$ = $( "#runDialogFocusMsg" );

        function doSave( pCallback ) {
            var lContainer$ = $( "#a_PageDesigner" );

            util.delayLinger.start( "main", function(){
                lSpinner$ = util.showSpinner( lContainer$ );
                lContainer$.addClass( C_PROCESSING );
            } );
            // disable all controls that can affect the model
            $.each( ["pd-undo", "pd-redo", "pd-save-page", "pd-save-run-page"], function( i, actionName ) {
                apex.actions.disable( actionName );
            } );
            $( ".a-TreeView" ).treeView( "disable" );
            $( "#glv" ).gridlayout( "disable" );
            $( "#pe" ).propertyEditor( "disable" );
            // tell model to save the changes
            model.saveChanges( function( pResponse ) {
                // done
                // enable all controls that were disabled around save
                $.each( ["pd-undo", "pd-redo", "pd-save-page", "pd-save-run-page"], function( i, actionName ) {
                    apex.actions.enable( actionName );
                } );
                $( ".a-TreeView" ).treeView( "enable" );
                $( "#glv" ).gridlayout( "enable" );
                $( "#pe" ).propertyEditor( "enable" );
                util.delayLinger.finish( "main", function(){
                    lSpinner$.remove();
                    lContainer$.removeClass( C_PROCESSING );
                } );
                pCallback( pResponse );
            } );
        }

        function setCreateMenuActions ( pMenuItems ) {
            var i;
            for ( i = 0; i < pMenuItems.length; i++ ) {
                if ( pMenuItems[ i ].hasOwnProperty( "menu" ) ) {
                    setCreateMenuActions( pMenuItems[ i ].menu.items );
                } else {
                    pMenuItems[ i ][ "action" ] = function() {
                        if ( model.hasChanged() ) {
                            if ( window.confirm( pd.msg( "BEFORE_AJAX_UNSAVED_CHANGES" ) ) ) {
                                nav.redirect( this.href );
                            }
                        } else {
                            nav.redirect( this.href );
                        }
                    }
                }
            }
        }

        // initialize global command error handler
        apex.commandHistory.setErrorHandler( function( pOperation, pCommand, pException ) {
            var lOperationLabel = {
                "execute": "CMD.EXECUTE_FAILED",
                "undo": "CMD.UNDO_FAILED",
                "redo": "CMD.REDO_FAILED"
            };
            pd.showError( pd.format( lOperationLabel[ pOperation ], pCommand.label() ) );
        });

        /*
         * Toolbar actions
         */
        apex.actions.add([
            {
                name: "pd-undo",
                label: null, // take label and title from button title
                title: null,
                icon: "icon-undo",
                shortcut: "Ctrl+Z",
                action: function( event, focusElement ) {
                    apex.commandHistory.undo();
                }
            },
            {
                name: "pd-redo",
                label: null, // take label and title from button title
                title: null,
                icon: "icon-redo",
                shortcut: "Ctrl+Y",
                action: function( event, focusElement ) {
                    apex.commandHistory.redo();
                }
            },
            {
                name: "pd-save-page",
                label: null, // take label from button
                disabled: true,
                shortcut: "Ctrl+Alt+S",
                action: function( event, focusElement ) {
                    if ( $( event.target ).closest( ".a-Property" ).length ) {
                        // when in property editor need to save field first
                        $( "#pe" ).propertyEditor( "saveProperty" );
                    }
                    doSave( function( pResponse ) {
                        // todo: As long as there is a bug with undo/redo after a save, we just clear the history
                        apex.commandHistory.clear();
                        $( document ).trigger( "commandHistoryChange" );

                        if ( pResponse.error ) {
                            if ( pResponse.error !== "NO_CHANGES") {
                                pd.showError( pResponse.error );
                            }
                        } else {
                            pd.showSuccess( pd.msg( "CHANGES_SAVED" ) );
                        }
                    });
                }
            },
            {
                name: "pd-save-run-page",
                label: null, // take label and title from button title
                title: null,
                icon: "icon-run-page",
                disabled: true,
                shortcut: "Ctrl+Alt+R",
                action: function( event, focusElement ) {
                    var runWindowGotFocus,
                        appId = model.getCurrentAppId(),
                        pageId = model.getCurrentPageId(),
                        runTimerId = null;

                    function getAppURL() {
                        return util.makeApplicationUrl( {
                            pageId: "RUN_PAGE",
                            request: "BRANCH_TO_PAGE_ACCEPT",
                            debug: "NO",
                            itemNames: [ "FB_FLOW_ID", "FB_FLOW_PAGE_ID", "F4000_P1_FLOW" ],
                            itemValues: [ appId, pageId, appId ]
                        } );
                    }

                    function runWarningDialog( dlg$, focusOnly ) {
                        dlg$.dialog({
                            modal: true,
                            title: focusOnly ? pd.msg( "FOCUS_PAGE" ) : pd.msg( "RUN_PAGE" ),
                            closeText: lang.getMessage( "APEX.DIALOG.CLOSE" ),
                            dialogClass: "ui-dialog--pageDesignerAlert",
                            width: 400,
                            height: 240,
                            minWidth: 400,
                            minHeight: 240,
                            position: { my: "right top", at: "right-20 bottom+20", of: focusElement },
                            buttons: [ {
                                text:  pd.msg( "TRY_AGAIN" ),
                                "class": "a-Button--hot",
                                click: function() {
                                    dlg$.dialog( "close" );
                                    if ( focusOnly ) {
                                        nav.openInNewWindow( "", apex.builder.getAppUnderTestWindowName( appId ) );
                                    } else {
                                        runPage();
                                    }
                                }
                            }]
                        });
                    }

                    function checkRunPageFocus() {
                        runWindowGotFocus = false;
                        $( window ).on( "blur.runcheck", function() {
                            $( window ).off( ".runcheck" );
                            runWindowGotFocus = true;
                        });
                        runTimerId = setTimeout( function() {
                            runTimerId = null;
                            if ( !runWindowGotFocus ) {
                                runWarningDialog( lRunDialogFocusMsg$, true );
                            }
                            $( window ).off( ".runcheck" );
                        }, 800); // .8 sec should be more than enough time for a window to get focus
                    }

                    function runPage() {
                        var pageComponent = model.getComponents( model.COMP_TYPE.PAGE )[0],
                            options = {},
                            runMode = $v( "P0_WINDOW_MGMT_MODE" ) || "FOCUS"; // values NONE, BROWSER, FOCUS

                        if ( model.isGlobalPage() ) {
                            pd.showSuccess( pd.msg( "CHANGES_SAVED_GLOBAL_PAGE" ) );
                        } else if ( pageComponent.getProperty( model.PROP.PAGE_MODE ).getValue() === "NORMAL" ) {
                            if ( runMode === "NONE" || /^4\d\d\d$/.test( appId ) ) {
                                nav.redirect( getAppURL() );
                            } else {
                                if ( runMode === "BROWSER" ) {
                                    options.favorTabbedBrowsing = true;
                                    // no need to check for focus because user doesn't care
                                } else {
                                    // assume FOCUS
                                    checkRunPageFocus();
                                }
                                if ( !nav.openInNewWindow( getAppURL(), apex.builder.getAppUnderTestWindowName( appId ), options ) ) {
                                    clearTimeout( runTimerId );
                                    $( window ).off( ".runcheck" );
                                    runWarningDialog( lRunDialogOpenMsg$ );
                                }
                            }
                        } else {
                            pd.showSuccess( pd.msg( "CHANGES_SAVED_DIALOG_PAGE" ) );
                        }
                    }

                    if ( $( event.target ).closest( ".a-Property" ).length ) {
                        // when in property editor need to save field first
                        $( "#pe" ).propertyEditor( "saveProperty" );
                    }

                    if ( model.hasChanged() ) {
                        doSave( function( pResponse ) {
                            // todo: As long as there is a bug with undo/redo after a save, we just clear the history
                            apex.commandHistory.clear();
                            $( document ).trigger( "commandHistoryChange" );

                            if ( pResponse.error ) {
                                if ( pResponse.error !== "NO_CHANGES") {
                                    pd.showError( pResponse.error );
                                }
                            } else {
                                runPage();
                            }
                        });
                    } else {
                        runPage();
                    }
                }
            }

        ]);

        $( document ).on( "commandHistoryChange", function( event ) {
            var lLabel, action;

            action = apex.actions.lookup( "pd-undo" );
            action.disabled = !apex.commandHistory.canUndo();
            if ( apex.commandHistory.canUndo()) {
                lLabel = lang.formatMessageNoEscape( "PD.UNDO", apex.commandHistory.undoLabel() );
                action.title = lLabel;
            } else {
                action.title = "";
            }
            apex.actions.update( "pd-undo" );

            action = apex.actions.lookup( "pd-redo" );
            action.disabled = !apex.commandHistory.canRedo();
            if ( apex.commandHistory.canRedo()) {
                lLabel = lang.formatMessageNoEscape( "PD.REDO", apex.commandHistory.redoLabel() );
                action.title = lLabel;
            } else {
                action.title = "";
            }
            apex.actions.update( "pd-redo" );
        }).trigger( "commandHistoryChange" );

        // Begin lock button handling

        function updateLockButton() {
            var lockState = model.getPageLockState();

            if ( !lockState ) {
                lLockButton$
                    .attr( "title", pd.msg( "PAGE_UNLOCKED" ) )
                    .attr( "aria-label", pd.msg( "PAGE_UNLOCKED" ) )
                    .removeClass( "is-active is-locked is-locked-by-self" )
                    .find(".a-Icon" )[ 0 ].className = "a-Icon icon-unlock";
            } else if ( lockState.isLockedByCurrentUser ) {
                lLockButton$
                    .attr( "title", pd.msg( "PAGE_LOCKED_BY_YOU" ) )
                    .attr( "aria-label", pd.msg( "PAGE_LOCKED_BY_YOU" ) )
                    .removeClass( "is-locked" )
                    .addClass( "is-active is-locked-by-self" )
                    .find(".a-Icon" )[ 0 ].className = "a-Icon icon-lock";
            } else {
                lLockButton$
                    .attr( "title", pd.format( "PAGE_LOCKED_BY", lockState.owner ) )
                    .attr( "aria-label", pd.format( "PAGE_LOCKED_BY", lockState.owner ) )
                    .removeClass( "is-locked-by-self" )
                    .addClass( " is-active is-locked" )
                    .find(".a-Icon" )[0].className = "a-Icon icon-lock-user";
            }
        }

        lLockButton$
            .attr( "disabled", true )
            .click( function() {

            var title, buttons,
                isReadOnlyComment = false,
                lockState = model.getPageLockState();

            buttons = [
                {
                    text: pd.msg( "CANCEL" ),
                    click:  function() {
                        lLockDialog$.dialog( "close" );
                    }
                }
            ];

            $( "#lockDialogIntroUnlocked, #lockDialogIntroLocked, #lockDialogIntroOwned" ).hide();
            apex.item( "P4500_DLG_LOCK_OWNER" ).hide();
            if ( !lockState || lockState.isLockedByCurrentUser ) {

                buttons.push({
                    click: function() {
                        lLockDialog$.dialog( "close" );
                        model.lockPage( $v( "P4500_DLG_LOCK_COMMENT" ))
                            .fail( function( pReason ) {
                                pd.showError( pReason ); // todo consider using a modal dialog
                            }).always( function() {
                                updateLockButton();
                            });
                    }
                });

                if ( !lockState ) {
                    title = pd.msg( "LOCK_PAGE" );
                    buttons[ 1 ].text  = pd.msg( "LOCK" );
                    buttons[ 1 ]["class"] = "a-Button--hot"; // older browsers are picky about using a reserved word as a property name
                    $( "#lockDialogIntroUnlocked" ).show();
                } else {
                    title = pd.msg( "UNLOCK_PAGE" );
                    buttons[ 1 ].text = pd.msg( "APPLY_CHANGES" );
                    $( "#lockDialogIntroOwned" ).show();

                    buttons.push( {
                        text: pd.msg( "UNLOCK" ),
                        "class": "a-Button--hot",
                        click: function() {
                            lLockDialog$.dialog( "close" );
                            model.unlockPage()
                                .fail( function( pReason ) {
                                    pd.showError( pReason ); // todo consider using a modal dialog
                                }).always( function() {
                                    updateLockButton();
                                });
                        }
                    });
                }

            } else {
                title = pd.msg( "PAGE_LOCKED" );
                $( "#lockDialogIntroLocked" ).show();
                apex.item( "P4500_DLG_LOCK_OWNER" ).show();
                $s( "P4500_DLG_LOCK_OWNER", lockState.owner );
                isReadOnlyComment = true;
                buttons[ 0 ].text = pd.msg( "OK" );
            }
            $( "#P4500_DLG_LOCK_COMMENT" )
                .val( lockState.comment )
                .attr( "readOnly", isReadOnlyComment );

            lLockDialog$.dialog({
                modal: true,
                title: title,
                closeText: lang.getMessage( "APEX.DIALOG.CLOSE" ),
                dialogClass: "ui-dialog--pageDesignerLock",
                width: 600,
                height: 340,
                minHeight: 340,
                minWidth: 600,
                buttons: buttons
            });

        });
        // End lock button handling

        // fix up menu - the team dev sub menu is conditional
        lCreateMenu$.on( "menucreate", function() {
            var teamDevMenu = lCreateMenu$.menu( "find", "teamDev" );

            if ( teamDevMenu ) {
                teamDevMenu.hide = !gTeamDevEnabled;
            }
            // Add custom menu item actions, because here we want to override the default navigation by 'href', so we can
            // check for unsaved changes.
            setCreateMenuActions( lCreateMenu$.menu( "option" ).items );
        });

        // Go to the new page if a page has been created
        lCreateMenu$.on( "apexafterclosedialog", function( pEvent, pData ) {
            if ( pData.hasOwnProperty( "FB_FLOW_PAGE_ID" )) {
                pd.goToPage( pData[ "FB_FLOW_PAGE_ID" ]);
            }
        });

        /* todo to be implement in 5.1
         * The settings menu was removed so a new place will need to be found for this
        {
            type: "radioGroup",
            set: function ( pValue ) {
                pd.settingsState.componentTitle = pValue;
                $( document ).trigger( "settingsStateChanged", [ "componentTitle" ]);
            },
            get: function () {
                return pd.settingsState.componentTitle;
            },
            choices: [
                { labelKey: "PD.SHOW_LABELS", value: pd.SETTINGS.COMPONENT_TITLE.LABEL },
                { labelKey: "PD.SHOW_NAMES",  value: pd.SETTINGS.COMPONENT_TITLE.NAME  }
            ]
        },
        */

        if ( gTeamDevEnabled ) {
            lTeamMenu$ = $( "<div id='teamDevMenu'></div>" ).appendTo( "body" );

            lTeamMenu$.menu({
                menubar: false,
                items: [ // Note: All labels are replaced by the beforeOpen callback
                    {
                        type: "action",
                        labelKey: "PD.FEATURES",
                        action: function() {
                            nav.redirect( util.makeApplicationUrl({ appId: "4800", pageId: "9000", request: "BUILDER", clearCache: "RIR",
                                itemNames: [ "IR_APPLICATION_ID", "IR_MODULE", "IRLT_PERCENT_COMPLETE" ],
                                itemValues: [ model.getCurrentAppId(), model.getCurrentPageId(), "100" ]}));
                        }
                    },
                    {
                        type: "action",
                        labelKey: "PD.TODOS",
                        action: function () {
                            nav.redirect( util.makeApplicationUrl({ appId: "4800", pageId: "3000", request: "BUILDER", clearCache: "RIR",
                                itemNames: [ "IR_APPLICATION_ID", "IR_PAGE_ID", "IRLT_PCT_COMPLETE" ],
                                itemValues: [ model.getCurrentAppId(), model.getCurrentPageId(), "100" ]}));
                        }
                    },
                    {
                        type: "action",
                        labelKey: "PD.BUGS",
                        action: function () {
                            nav.redirect( util.makeApplicationUrl({ appId: "4800", pageId: "3500", request: "BUILDER", clearCache: "RIR",
                                itemNames: [ "IR_APPLICATION_ID", "IR_PAGE_ID", "IRLT_BUG_PCT_COMPLETE" ],
                                itemValues: [ model.getCurrentAppId(), model.getCurrentPageId(), "100" ]}));
                        }
                    },
                    {
                        type: "action",
                        labelKey: "PD.FEEDBACK_ENTRIES",
                        action: function () {
                            nav.redirect( util.makeApplicationUrl( {appId: "4800", pageId: "8000", request: "BUILDER", clearCache: "RIR",
                                itemNames: [ "IR_APPLICATION_ID", "IR_PAGE_ID", "IRLT_FEEDBACK_STATUS_ID" ],
                                itemValues: [ model.getCurrentAppId(), model.getCurrentPageId(), "3" ]}));
                        }
                    }
                ],
                beforeOpen: function( pEvent, pMenu ) {
                    var i, lLabel,
                        lItems = pMenu.menu.items,
                        lLabels = [ [ "FEATURES_N", "features"], ["TODOS_N", "todos"], ["BUGS_N", "bugs"], ["FEEDBACK_ENTRIES_N", "feedback"] ];

                    for ( i = 0; i < lLabels.length; i++ ) {
                        lLabel = lLabels[i];
                        if ( gTeamDevCounters[lLabel[1]] !== undefined ) {
                            lItems[i].label = pd.format(lLabel[0], gTeamDevCounters[lLabel[1]]);
                            delete lItems[i].labelKey;
                        }
                    }
                }
            });

        }

        $( "#button-comments" ).prop( "disabled", true );

        // Bind events to go to page elements
        $( "#go_to_page" ).on( "keypress", function( pEvent ) {
            if ( pEvent.which === 13 ) {
                pd.goToPage( $( "#go_to_page" ).val() );
            }
        } ).on( "focus", function( ) {
            this.select();
        });

        /*
         * The goto page field lets you change the page but it is also the main place that tells you what page you are on.
         * When you changes the number but don't soon cause going to the new page it looks like you are on a page
         * that you are not actually on. We can't put any time limit on how long someone takes to press Go after the
         * field looses focus. But we can assume if they put focus back in the main page designer area that they have
         * "gone back to work" and it is time to make sure the field reflects the current page.
         */
        $( "#a_PageDesigner" ).on( "focusin", function( pEvent ) {
            checkDisplayCurrentPage();
        } );

        $( "#go_to_page_button" ).click( function() {
            pd.goToPage( $( "#go_to_page" ).val() );
        });

        $( "#go_to_page_lov" ).on( "click", function() {
            var out = util.htmlBuilder(),
                lPageFinderLovDialogOptions = {
                    columnDefinitions: [
                        {
                            name:  "id",
                            title: pd.msg( "PAGE_NUMBER" )
                        },
                        {
                            name:  "name",
                            title: pd.msg( "PAGE_NAME" )
                        },
                        {
                            name:  "userInterface",
                            title: pd.msg( "USER_INTERFACE" )
                        },
                        {
                            name:  "group",
                            title: pd.msg( "GROUP" )
                        }
                    ],
                    filters: [
                        {
                            name:         "show",
                            title:        pd.msg( "PAGE_PICKER.SHOW" ),
                            type:         "buttonset",
                            defaultValue: "all",
                            lov: [
                                {
                                    display: pd.msg( "ALL_PAGES" ),
                                    value:   "all"
                                },
                                {
                                    display: pd.msg( "PAGE_PICKER.RECENTLY_EDITED" ),
                                    value:   "recent"
                                }
                            ]
                        },
                        {
                            name:   "search",
                            title:  pd.msg( "SEARCH" ),
                            type:   "search"
                        }
                    ],
                    filterLov: function( pFilters, pRenderLovEntries ) {

                        var lFilters = {};

                        if ( pFilters.show === "current_ui" ) {
                            lFilters = {
                                show: "user_interface_id",
                                id:   model.getComponents( model.COMP_TYPE.PAGE, { id: model.getCurrentPageId() })[ 0 ].getProperty( model.PROP.USER_INTERFACE ).getValue()
                            };
                        } else if ( pFilters.show === "current_group" ) {
                            lFilters = {
                                show: "group_id",
                                id:   model.getComponents( model.COMP_TYPE.PAGE, { id: model.getCurrentPageId() })[ 0 ].getProperty( model.PROP.PAGE_GROUP ).getValue()
                            };
                        } else if ( pFilters.show === "recent" ) {
                            lFilters = {
                                show: "recent"
                            };
                        }

                        model.getPagesLov( lFilters, function( pLovValues ) {
                            pRenderLovEntries( pLovValues, pFilters.search );
                        }, 'Y' );
                    }
                };

            if ( model.getCurrentPageId() !== undefined ) {

                // Check if the current page has a page group, if so add filter for current group / all groups
                if ( model.getComponents( model.COMP_TYPE.PAGE, { id: model.getCurrentPageId() })[ 0 ].getProperty( model.PROP.PAGE_GROUP ).getValue() ) {
                    lPageFinderLovDialogOptions.filters[ 0 ].lov.unshift({
                        display: pd.msg( "CURRENT_GROUP" ),
                        value:   "current_group"
                    });
                }

                // Added current ui lov option for userInterfaceId filter, if we have the current page Id
                lPageFinderLovDialogOptions.filters[ 0 ].lov.unshift({
                    display: pd.msg( "CURRENT_UI" ),
                    value:   "current_ui"
                });
                lPageFinderLovDialogOptions.filters[ 0 ].defaultValue = "current_ui";
            }

            out.markup( "<div" )
                .attr( "id", "goToPageDlg" )
                .attr( "title", pd.msg( "PAGE_FINDER" ) )
                .markup( ">" )
                .markup( "</div>" );

            $( out.toString() ).lovDialog({
                modal:             true,
                minWidth:          750,
                height:            500,
                filters:           lPageFinderLovDialogOptions.filters,
                columnDefinitions: lPageFinderLovDialogOptions.columnDefinitions,
                filterLov:         lPageFinderLovDialogOptions.filterLov,
                dialogClass:       pd.CSS.DIALOG_FLUSH_BODY,
                resizable:         false,
                multiValue:        false,
                valueSelected: function( pEvent, pData ) {

                    pd.goToPage( pData.id );

                }
            });
        });


        $( document ).on( "modelConfigLoaded", function() {

            // The external edit links for breadcrumbs and list point to the main breadcrumb/list, but developers actually want to edit the entries that's why we overwrite the
            // edit links for Page Designer
            model.getComponentType( model.COMP_TYPE.BREADCRUMB ).editUrl = "f?p=4000:287:%session%:::RP,287:FB_FLOW_ID,FB_FLOW_PAGE_ID,P287_PAGE,F4000_P287_MENU_ID:%application_id%,%page_id%,%page_id%,%pk_value%";
            model.getComponentType( model.COMP_TYPE.LIST ).editUrl = "f?p=4000:4050:%session%:::RP,4050:FB_FLOW_ID,FB_FLOW_PAGE_ID,F4000_P4050_LIST_ID:%application_id%,%page_id%,%pk_value%";

        });

        $( document ).on( "modelReady", function(){

            // enable lock button
            if ( !model.isPageReadOnly() || model.getPageLockState()) {
                lLockButton$.attr( "disabled", false );
                updateLockButton();
            }

            // enable save and run buttons
            $.each( ["pd-save-page", "pd-save-run-page"], function( i, actionName ) {
                apex.actions.enable( actionName );
            } );

            $( document ).one( "modelCleared", function(){
                // clear command history
                apex.commandHistory.clear();
                $( document ).trigger( "commandHistoryChange" );

                // disable lock, save and run buttons
                lLockButton$.attr( "disabled", true );
                $.each( ["pd-save-page", "pd-save-run-page"], function( i, actionName ) {
                    apex.actions.disable( actionName );
                } );

                // disable page comment and team development
                $( "#button-comments" )
                    .prop( "disabled", true )
                    .find( ".a-Button-badge" ).text( "" );
                if ( gTeamDevEnabled ) {
                    $( "#menu-team-dev" )
                        .prop( "disabled", true )
                        .find( ".a-Button-badge" ).text( "" );
                    gTeamDevCounters = {};
                }

            });

        });
    }

    function initMessagesView() {

        var lBadge$ = $( '<span class="a-AlertBadge"></span>' ).appendTo( $( '#editor_tabs a[href="#messages"]' ));

        $( "#messages-container" ).peMessagesView({ badge: lBadge$ });
    }

    function initSearch() {

        var lSearch$ = $( "#search-container" ).peSearch();

        $( "#P4500_LOCAL_SEARCH,#P4500_MATCH_CASE,#P4500_IS_REGEXP" ).on( "change", function() {

            var lValue    = $v( "P4500_LOCAL_SEARCH" ),
                lModifier = (( $v( "P4500_MATCH_CASE" ) === "Y" ) ? "" : "i" ) + "g",
                lIsRegExp = ( $v( "P4500_IS_REGEXP" ) === "Y" );

            if ( lValue !== "" ) {
                if ( lIsRegExp ) {
                    lValue = new RegExp( lValue, lModifier );
                } else {
                    lValue = new RegExp( util.escapeRegExp( lValue ), lModifier );
                }

                lSearch$.peSearch( "search", lValue );
            } else {
                lSearch$.peSearch( "clear" );
            }
        });

        $( "#CLEAR_PAGE_SEARCH" ).on( "click", function() {
            $s( "P4500_LOCAL_SEARCH", "", "", true );
            $s( "P4500_MATCH_CASE",   "", "", true );
            $s( "P4500_IS_REGEXP",    "", "", true );
            lSearch$.peSearch( "clear" );
        });

        $( document ).on( "pageSearch", function( pEvent, pSearchText ) {

            // Make the Page Search tab the active tab
            $( "#editor_tabs" ).tabs({ active: 2 });
            // Set the search values provided by the caller
            $s( "P4500_MATCH_CASE", "", "", true );
            $s( "P4500_IS_REGEXP",  "", "", true );
            $s( "P4500_LOCAL_SEARCH", pSearchText ); // will trigger the change event and issue the query

        });
    }

    $( document ).ready( function() {

        logTimeStart( "readyEvent" ); // todo remove after optimization
        logTimeStart( "ReadyEventTotal" ); // todo remove after optimization

        $( "#sp_main" ).show(); // to avoid incomplete visual layout the main content of the page is hidden until now
        initToolbar();
        initMessagesView();
        initSearch();
        model.init({
            isInternal: gIsInternal,
            isReadOnly: gIsReadOnly
        });

        // run initModel after the ready event so that modelReady will always fire after ready
        setTimeout( function() {

            logTimeStart( "pd.goToPage-total" ); // todo remove after optimization

            var lDeferred = pd.goToPage( $( "#go_to_page" ).val() );

            $.when( lDeferred ).done( function() {

                // look for a initial component to select
                var lSelection = parseSelectionHash( window.location.hash );
                if ( lSelection ) {
                    pd.goToComponent( lSelection.typeId, lSelection.componentId );
                }
                logTimeEnd( "pd.goToPage-total" ); // todo remove after optimization
                logTimeEnd( "ReadyEventTotal" ); // todo remove after optimization
            });

        }, 0 );

        function expandSplitterIfNeeded( splitRegionId ) {
            var s$ = $( "#" + splitRegionId );
            if ( s$.length ) {
                if ( s$.splitter( "option", "collapsed") ) {
                    s$.splitter( "option", "collapsed", false );
                }
            }
        }

        /*
         * Navigation and other global actions
         */
        apex.actions.add([
            {
                name: "pd-expand-restore",
                onLabel: pd.msg( "RESTORE" ),
                offLabel: pd.msg( "EXPAND" ),
                shortcut: "Alt+F11",
                get: function() {
                    return this.isCenterExpanded;
                },
                set: function( value ) {
                    this.isCenterExpanded = value;
                    $("#sp_main_content, #sp_glv_content, #sp_right_content").splitter( "option", "collapsed", this.isCenterExpanded );
                },
                isCenterExpanded : false,
                updateState: function() {
                    var self = this;

                    this.isCenterExpanded = true;
                    $( "#sp_main_content, #sp_glv_content, #sp_right_content" ).each( function() {
                        if ( !$( this ).splitter( "option", "collapsed" ) ) {
                            self.isCenterExpanded = false;
                            return false;
                        }
                    } );
                    this.icon = this.isCenterExpanded ? "icon-restore" : "icon-maximize";
                    apex.actions.update( this.name );
                }
            },
            {
                name: "pd-goto-help",
                label: pd.msg( "ACTION.GOTO_HELP" ),
                shortcut: "Alt+F1",
                action: function( event, focusElement ) {
                    $( "#editor_tabs" ).tabs( "option", "active", 3 );
                    $( "#help-container" )[0].focus();
                    return true;
                }
            },
            {
                name: "pd-goto-rendering-tree",
                label: pd.msg( "ACTION.GOTO_RENDERING" ),
                shortcut: "Alt+1",
                action: function( event, focusElement ) {
                    expandSplitterIfNeeded( "sp_main_content" );
                    $( "#trees" ).tabs( "option", "active", 0 );
                    $( "#PDrenderingTree" ).treeView( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-dynamic-actions-tree",
                label: pd.msg( "ACTION.GOTO_DA" ),
                shortcut: "Alt+2",
                action: function( event, focusElement ) {
                    expandSplitterIfNeeded( "sp_main_content" );
                    $( "#trees" ).tabs( "option", "active", 1 );
                    $( "#PDdynamicActionTree" ).treeView( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-processing-tree",
                label: pd.msg( "ACTION.GOTO_PROCESSING" ),
                shortcut: "Alt+3",
                action: function( event, focusElement ) {
                    expandSplitterIfNeeded( "sp_main_content" );
                    $( "#trees" ).tabs( "option", "active", 2 );
                    $( "#PDprocessingTree" ).treeView( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-shared-components-tree",
                label: pd.msg( "ACTION.GOTO_SHARED" ),
                shortcut: "Alt+4",
                action: function( event, focusElement ) {
                    expandSplitterIfNeeded( "sp_main_content" );
                    $( "#trees" ).tabs( "option", "active", 3 );
                    $( "#PDsharedCompTree" ).treeView( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-grid-layout",
                label: pd.msg( "ACTION.GOTO_GLV" ),
                shortcut: "Alt+5",
                action: function( event, focusElement ) {
                    $( "#editor_tabs" ).tabs( "option", "active", 0 );
                    $( "#glv" ).gridlayout( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-property-editor-layout",
                label: pd.msg( "ACTION.GOTO_PE" ),
                shortcut: "Alt+6",
                action: function( event, focusElement ) {
                    expandSplitterIfNeeded( "sp_right_content" );
                    $( "#pe" ).propertyEditor( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-gallery-regions",
                label: pd.msg( "ACTION.GOTO_REGIONS" ),
                shortcut: "Alt+7",
                action: function( event, focusElement ) {
                    $( "#editor_tabs" ).tabs( "option", "active", 0 );
                    expandSplitterIfNeeded( "sp_glv_content" );
                    $( "#gallery-tabs" ).tabs( "option", "active", 0 );
                    $( "#cg-regions .a-Gallery.a-IconList" ).iconList( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-gallery-items",
                label: pd.msg( "ACTION.GOTO_ITEMS" ),
                shortcut: "Alt+8",
                action: function( event, focusElement ) {
                    $( "#editor_tabs" ).tabs( "option", "active", 0 );
                    expandSplitterIfNeeded( "sp_glv_content" );
                    $( "#gallery-tabs" ).tabs( "option", "active", 1 );
                    $( "#cg-items .a-Gallery.a-IconList" ).iconList( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-gallery-buttons",
                label: pd.msg( "ACTION.GOTO_BUTTONS" ),
                shortcut: "Alt+9",
                action: function( event, focusElement ) {
                    $( "#editor_tabs" ).tabs( "option", "active", 0 );
                    expandSplitterIfNeeded( "sp_glv_content" );
                    $( "#gallery-tabs" ).tabs( "option", "active", 2 );
                    $( "#cg-buttons .a-Gallery.a-IconList" ).iconList( "focus" );
                    return true;
                }
            },
            {
                name: "pd-goto-messages",
                label: pd.msg( "ACTION.GOTO_MSGS" ),
                shortcut: "Ctrl+F1",
                action: function( event, focusElement ) {
                    $( "#editor_tabs" ).tabs( "option", "active", 1 );
                    $( "#messages-container" ).find( ".a-AlertMessages-message" ).first().each( function() {
                        this.focus();
                    } );
                    return true;
                }
            },
            {
                name: "pd-page-search",
                label: pd.msg( "ACTION.PAGE_SEARCH" ),
                shortcut: "Ctrl+Alt+F",
                action: function( event, focusElement ) {
                    $( "#editor_tabs" ).tabs( "option", "active", 2 );
                    $( "#P4500_LOCAL_SEARCH" )[0].focus();
                    return true;
                }
            },
            {
                name: "pd-show-shortcuts",
                label: pd.msg( "KBD_SHORTCUTS" ),
                shortcut: "Alt+Shift+F1",
                action: function( event, focusElement ) {
                    var i, sc, action,
                        names = [],
                        actions = {},
                        out = util.htmlBuilder(),
                        shortcuts = apex.actions.listShortcuts();

                    // group shortcuts by action
                    for ( i = 0; i < shortcuts.length; i++ ) {
                        sc = shortcuts[i];
                        action = actions[sc.actionName];
                        if ( !action ) {
                            names.push( sc.actionName );
                            action = {
                                actionLabel: sc.actionLabel,
                                shortcuts: []
                            };
                            actions[sc.actionName] = action;
                        }
                        action.shortcuts.push( sc.shortcutDisplay );
                    }
                    // sort by actionLabel
                    names.sort( function(a, b) {
                        if ( actions[a].actionLabel > actions[b].actionLabel ) {
                            return 1;
                        } else if ( actions[a].actionLabel < actions[b].actionLabel ) {
                            return -1;
                        } // else
                        return 0;
                    } );

                    out.markup( "<div" )
                        .attr( "id", "shortcutDlg" )
                        .attr( "title", pd.msg( "KBD_SHORTCUTS" ) )
                        .markup( " tabindex='0'>" )
                        .markup( "<ul class='a-AVPList a-AVPList--shortcuts'>" );

                    for ( i = 0; i < names.length; i++ ) {
                        action = actions[names[i]];
                        out.markup( "<li class='a-AVPList-item'><span class='a-AVPList-label'>" ).content( action.actionLabel )
                            .markup("</span><span class='a-AVPList-value'>" ).content( action.shortcuts.join( ", " ) )
                            .markup("</span></li>");
                    }
                    // todo post 5.0 global or common shortcuts not covered by actions
                    out.markup( "</ul></div>" );

                    $( out.toString() ).dialog( {
                        modal: true,
                        closeText: lang.getMessage( "APEX.DIALOG.CLOSE" ),
                        minWidth: 300,
                        width: 460,
                        height: 380,
                        close: function( event, ui ) {
                            $(this).dialog( "destroy" ).remove();
                        },
                        open: function() {
                            this.focus();
                        },
                        buttons: [
                            { text: pd.msg("OK"), click: function() {
                                $( this ).dialog( "close" );
                            }}
                        ]
                    } );
                    return true; // dialog has focus
                }
            }
        ]);

        $( "#helpMenu_menu" ).on( "menucreate", function() {
            var keyboardShortcutsMenu = $( "#helpMenu_menu" ).menu( "find", "keyboardShortcuts" );
            if ( keyboardShortcutsMenu ) {
                keyboardShortcutsMenu.hide   = false;
                keyboardShortcutsMenu.action = "pd-show-shortcuts";
            }
        });

        pd.clearHelpText();

        var splitterChangeTimer = null;

        // the pd-expand-restore action state must be kept in sync with the collective splitter state
        $( "body" ).on( "splitterchange splittercreate", function( event, ui ) {
            var action = apex.actions.lookup( "pd-expand-restore" );
            // splitter changes often happen in bunches so wait a bit and just update once
            if ( !splitterChangeTimer ) {
                splitterChangeTimer = setTimeout(function() {
                    splitterChangeTimer = null;
                    action.updateState();
                }, 100);
            }
        } );

        /*
         * Developer Toolbar integration
         */
        apex.builder.nameBuilderWindow();

        $(".a-TabsContainer").tabs({
            heightStyle: "fill",
            activate: function( event, ui ) {
                if ( ui.newPanel.is( ".resize" ) ) {
                    ui.newPanel.resize();
                }
            }
        });
        $( "#editor_tabs .ui-tabs-nav" ).on("dblclick", function() {
            apex.actions.toggle( "pd-expand-restore" );
        });
        // Give help tab a specific class
        $( "#editor_tabs [aria-controls=help]" ).addClass( "ui-tabs-helpTab" );

        apex.theme.pageResizeInit();

        // warn on unsaved changes
        $( window ).on( "beforeunload", function( event ) {
            if ( model.hasChanged() ) {
                return pd.msg( "BEFORE_PAGE_UNLOAD_UNSAVED_CHANGES" );
            }
        });

        // handler to hide notification
        $( "#pdNotificationClose" ).on( "click", function() {
            pd.hideNotification();
        });
        logTimeEnd( "readyEvent" ); // todo remove after optimization

    });

})( pe, apex.jQuery, apex.util, apex.lang, apex.navigation, window.pageDesigner, apex.server );

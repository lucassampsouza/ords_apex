/*global pe,apex*/
/*!
 Property Editor - A jQuery UI based widget for the APEX Property Editor
 Copyright (c) 2013, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * Turns a standard DIV element into a Property Editor:
 *   apex.jQuery( "#myDiv" ).propertyeditor();
 *
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.button.js
 *    jquery.ui.tooltip.js
 *    apex/util.js
 *    apex/debug.js
 *    apex/locale.js
 *    apex/lang.js
 */

(function ( $, util, debug, locale, lang, undefined ) {
    "use strict";

    var PROPERTY_EDITOR =                       "a-PropertyEditor",
        PROPERTY_EDITOR_STACKED =               PROPERTY_EDITOR + "--stacked",
        PROPERTY_GROUP =                        PROPERTY_EDITOR + "-propertyGroup",
        PROPERTY_EDITOR_MESSAGE =               PROPERTY_EDITOR + "-message",
        PROPERTY_EDITOR_MESSAGE_TEXT =          PROPERTY_EDITOR + "-messageText",
        PROPERTY_EDITOR_EDIT_PARENT =           PROPERTY_EDITOR + "-editParent",
        PROPERTY_GROUP_HEADER =                 PROPERTY_GROUP + "-header",
        PROPERTY_GROUP_TITLE =                  PROPERTY_GROUP + "-title",
        PROPERTY_GROUP_BODY =                   PROPERTY_GROUP + "-body",
        PROPERTY =                              "a-Property",
        PROPERTY_STACKED =                      PROPERTY + "--stacked",
        PROPERTY_BUTTON_CONTAINER =             PROPERTY + "-buttonContainer",
        PROPERTY_BUTTON_CONTAINER_COMBOBOX =    PROPERTY_BUTTON_CONTAINER + "--comboBox",
        PROPERTY_BUTTON_CONTAINER_COLORPICKER = PROPERTY_BUTTON_CONTAINER + "--colorPicker",
        PROPERTY_LABEL_CONTAINER =              PROPERTY + "-labelContainer",
        PROPERTY_LABEL =                        PROPERTY + "-label",
        PROPERTY_LABEL_WITH_ICON =              PROPERTY_LABEL + "--withIcon",
        PROPERTY_RADIO_GROUP =                  PROPERTY + "-radioGroup",
        PROPERTY_RADIO =                        PROPERTY + "-radio",
        PROPERTY_RADIO_LABEL =                  PROPERTY_RADIO + "-label",
        PROPERTY_RADIO_INPUT =                  PROPERTY_RADIO + "-input",
        PROPERTY_CHECKBOX_GROUP =               PROPERTY + "-checkboxGroup",
        PROPERTY_CHECKBOX =                     PROPERTY + "-checkbox",
        PROPERTY_CHECKBOX_LABEL =               PROPERTY_CHECKBOX + "-label",
        PROPERTY_CHECKBOX_INPUT =               PROPERTY_CHECKBOX + "-input",
        PROPERTY_FIELD_CONTAINER =              PROPERTY + "-fieldContainer",
        PROPERTY_FIELD_CONTAINER_COMBOBOX =     PROPERTY_FIELD_CONTAINER + "--comboBox",
        PROPERTY_FIELD_CONTAINER_RADIOGROUP =   PROPERTY_FIELD_CONTAINER + "--radioGroup",
        PROPERTY_FIELD_CONTAINER_CHECKBOXGROUP =PROPERTY_FIELD_CONTAINER + "--checkboxGroup",
        PROPERTY_FIELD_CONTAINER_COLORPICKER =  PROPERTY_FIELD_CONTAINER + "--colorPicker",
        PROPERTY_FIELD =                        PROPERTY + "-field",
        PROPERTY_FIELD_READ_ONLY =              PROPERTY_FIELD + "--readOnly",
        PROPERTY_FIELD_TEXT =                   PROPERTY_FIELD + "--text",
        PROPERTY_FIELD_TEXTAREA =               PROPERTY_FIELD + "--textarea",
        PROPERTY_FIELD_SELECT =                 PROPERTY_FIELD + "--select",
        PROPERTY_UNIT_CONTAINER =               PROPERTY + "-unitContainer",
        PROPERTY_UNIT =                         PROPERTY + "-unit",
        PROPERTY_COLOR_PREVIEW =                PROPERTY + "-colorPreview",
        PROPERTY_SCROLLABLE =                   PROPERTY + "--scrollable",
        //
        SHOW_ALL =                              "js-showAll",
        //
        BUTTON =                                "a-Button",
        BUTTON_SMALL =                          BUTTON + "--small",
        BUTTON_NO_LABEL =                       BUTTON + "--noLabel",
        BUTTON_WITH_FONT_ICON =                 BUTTON + "--withIcon",
        BUTTON_FULL =                           BUTTON + "--full",
        BUTTON_PRIMARY =                        BUTTON + "--primary",
        ICON_BUTTON =                           BUTTON + " " + BUTTON_SMALL + " " + BUTTON_NO_LABEL + " " + BUTTON_WITH_FONT_ICON,
        //
        IS_ACTIVE =                             "is-active",
        IS_FOCUSED =                            "is-focused",
        IS_ERROR =                              "is-error",
        IS_WARNING =                            "is-warning",
        IS_EXPANDED =                           "is-expanded",
        IS_VARIABLE =                           "is-variable",
        IS_EMPTY =                              "is-empty",
        // icon classes
        ICON =                                  "a-Icon",
        ICON_EXPANDED =                         ICON + " icon-down-arrow",
        ICON_COLLAPSED =                        ICON + " icon-right-arrow",
        ICON_REQUIRED_FIELD =                   ICON + " icon-required",
        ICON_ERROR =                            ICON + " icon-error",
        ICON_WARNING =                          ICON + " icon-warning",
        ICON_LOV =                              ICON + " icon-popup-lov",
        ICON_VARIABLE =                         ICON + " icon-variable",
        ICON_QUICK_PICK =                       ICON + " icon-quick-pick",
        ICON_COLOR =                            ICON + " icon-color-picker",
        ICON_LARGE =                            ICON + "--large",
        ICON_LARGE_WARNING =                    ICON + " " + ICON_LARGE + " icon-warning",
        ICON_EDIT_DIALOG =                      ICON + " icon-open-in-dialog",
        // utility classes
        VISUALLY_HIDDEN =                       "u-VisuallyHidden",
        DIALOG_FLUSH_BODY =                     "ui-dialog-flushBody",
        TEXT_LOWER =                            "u-textLower",
        TEXT_UPPER =                            "u-textUpper";

    var DATA_PROPERTY_ID =  "data-property-id",
        DATA_GROUP_ID =     "data-group-id";

    /*
     * These are the the basic property types supported by the
     * propertyEditor. It is possible to extend these by adding
     * new property types. See addPropertyType.
     */
    var PROP_TYPE = {
        COMBOBOX:       "COMBOBOX",
        NUMBER:         "NUMBER",
        INTEGER:        "INTEGER",
        SELECT_LIST:    "SELECT LIST",
        TEXT:           "TEXT",
        TEXTAREA:       "TEXTAREA",
        YES_NO:         "YES NO",
        CHECKBOXES:     "CHECKBOXES",
        RADIOS:         "RADIOS",
        COLOR:          "COLOR",
        POPUP_LOV:      "POPUP LOV"
    };

    var VALUE_VARIES = {}; // marker object indicates a property value that varies across multiple components

    var gQuickPickMenuIds = []; // stores ID references to all quick pick menus, which are cleaned up on refresh

    // Global functions, used by both widget and property type plug-ins.
    function msg( pKey ) {
        return lang.getMessage( "PE." + pKey );
    }

    function format( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    }

    function formatNoEscape( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.formatNoEscape.apply( this, args );
    }

    function renderDivOpen( out, pOptions ) {
        var lOptions = $.extend({
            "class": "",
            style: ""
        }, pOptions );

        out.markup( "<div" );
        if ( lOptions[ "class" ] ) {
            out.attr( "class", $.isArray( lOptions[ "class" ] ) ? lOptions[ "class" ].join( " " ) : lOptions[ "class" ] );
        }
        if ( lOptions.style ) {
            out.attr( "style", lOptions.style );
        }
        out.markup( ">" );
    }
    function renderDivClose( out ) {
        out.markup( "</div>" );
    }
    function renderIcon( out, pIcon, pText ) {
        out.markup( "<span" )
            .attr( "class", pIcon )
            .attr( "aria-hidden", true )
            .markup( "></span>" );
        if ( pText ) {
            out.markup( "<span" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( pText )
                .markup( "</span>" );
        }
    }

    var gPropertyTypes = {};

    // a property type should have as little access to the property editor as possible
    // It does not render the label.
    // It gets a base id that it can use to make other ids by adding a suffix but it
    // must use the id as is for at least one element this will be the element that it gets back
    // as input to some of the other calls.


    var gPropertyTypeBasePrototype = {
        // the property type interface
        renderDivOpen:  renderDivOpen,
        renderDivClose: renderDivClose,
        renderIcon:     renderIcon,
        stacked:        false,
        noLabel:        false,
        labelVisible:   true,
        render: function( out, id, prop ) {         //todo pass both to pProperty and pElement
            // perhaps the default is a textarea?
        },
        init: function( pElement$, prop ) {
            this.addKeyboardHandlersForVariesState( pElement$, prop );
            this.addTooltipsForErrors( pElement$, prop );
        },
        destroy: function( pElement$ ) {
            // clean up event handlers
            pElement$.closest( "div." + PROPERTY ).off();
        },
        validate: function() {
            // Useful when a property type is required to validate itself, rather than when the validation is
            // handled externally
            // xxx default should return something?
        },
        setValue: function( pElement$, prop, pValue ) {
            pElement$.val( pValue );
            prop.value = pValue;
        },
        addValue: function( pElement$, prop, pValue ) {
            var i,
                lValueExists = false,
                lValue = pElement$.val(),
                lValues = ( lValue ) ? lValue.split( prop.metaData.multiValueDelimiter ) : [];

            for ( i = 0; i < lValues.length; i++ ) {
                if ( pValue === lValues[ i ] ) {
                    lValueExists = true;
                    break;
                }
            }

            if ( !lValueExists ) {
                lValues.push( pValue );
            }

            pElement$.val( lValues.join( prop.metaData.multiValueDelimiter ) );

        },
        getValue: function( pProperty$ ) {
            // get value of element in the property DIV with the data-property-id attribute
            var lValue = pProperty$.find( "[" + DATA_PROPERTY_ID + "]" ).val();

            // If property is in the value varies state, return the constant as the value
            //todo could this go in wrapper? depends on lValue="" check for non-standard types.
            if ( pProperty$.hasClass( IS_VARIABLE ) && lValue === "" ) {
                lValue = VALUE_VARIES;
            }
            return lValue;
        },
        getDisplayValue: function( prop ) {
            return prop.value;
        },
        setFocus: function( pElement$ ) {
            pElement$[ 0 ].focus();
        },
        // end property type interface

        // rendering helpers

        renderCommonAttributes: function( out, id, prop ) {
            out.attr( "id", id )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                //.attr( "aria-describedby", "help" ) too noisy, because help is not ignored when help tab is hidden
                .optionalAttr( "aria-required", ( prop.metaData.isRequired ) ? "true" : null )
                .optionalAttr( "aria-invalid", ( prop.errors.length > 0 ) ? "true" : null );
        },
        //todo switch other callers of renderCommonAttributes to use commonAttributes interface
        commonAttributes: function( pProperty ) {
            var lCommonAttributes = {};
            lCommonAttributes[ DATA_PROPERTY_ID ] = pProperty.propertyName;
            // Commented out, as this is too verbose, still announcing help even when the help tab is not displayed
            // lCommonAttributes[ "aria-describedby" ] = "help";
            lCommonAttributes[ "aria-required" ] = ( pProperty.metaData.isRequired );
            lCommonAttributes[ "aria-invalid" ] = ( pProperty.errors.length > 0 );
            return lCommonAttributes;
        },

        // base render input
        renderBaseInput: function ( out, pOptions ) {
            var lAttr, lData,
                lOptions = $.extend( {
                    id:         "",
                    type:       "text",
                    value:      "",
                    inputClass: [],
                    data:       {},
                    readonly:   false,
                    maxLength:  "",
                    attributes: {}
                }, pOptions );

            out.markup( "<input" )
                .attr( "id", lOptions.id )
                .attr( "type", lOptions.type )
                .attr( "value", lOptions.value )
                .optionalAttr( "readonly", lOptions.readonly );

            if ( lOptions.inputClass.length > 0 ) {
                out.attr( "class", $.isArray( lOptions.inputClass ) ? lOptions.inputClass.join( " " ) : lOptions.inputClass );
            }

            if ( lOptions.maxLength ) {
                out.attr( "maxlength", lOptions.maxLength );
            }

            if ( lOptions.ariaDescribedBy ) {
                out.attr( "aria-describedby", lOptions.ariaDescribedBy );
            }

            if ( !$.isEmptyObject( lOptions.data ) ) {
                for ( lData in lOptions.data ) {
                    if ( lOptions.data.hasOwnProperty( lData ) ) {
                        out.attr( "data-" + lData, lOptions.data[ lData ] );
                    }
                }
            }

            if ( !$.isEmptyObject( lOptions.attributes ) ) {
                for ( lAttr in lOptions.attributes ) {
                    if ( lOptions.attributes.hasOwnProperty( lAttr ) ) {
                        out.attr( lAttr, lOptions.attributes[ lAttr ] );
                    }
                }
            }

            out.markup( " />" );
        },

        renderText: function ( out, pId, pProperty, pOptions ) {
            var lOptions,
                lDisplayValue = pProperty.value,
                lReadonly = false,
                lClasses = [],
                lData = {},
                lIsVariable = ( lDisplayValue === VALUE_VARIES );

            pOptions = $.extend( {
                "class":        PROPERTY_FIELD_TEXT,
                type:           "text",
                textCase:       pProperty.metaData.textCase,
                manualEntry:    true,
                attributes:     {}
            }, pOptions );

            lClasses.push( PROPERTY_FIELD );
            lClasses.push( pOptions[ "class" ] );

            // add text case class
            if ( pOptions.textCase ) {
                lClasses.push( this.getTextCaseClass( pOptions.textCase ) );
            }

            // set readonly related values
            if ( pProperty.metaData.isReadOnly ) {
                lReadonly = true;
                lClasses.push( PROPERTY_FIELD_READ_ONLY );

                // Only get value if we are not in multi-edit / value varies state
                if ( !lIsVariable ) {
                    lDisplayValue = gPropertyTypes[ pProperty.metaData.type ].getDisplayValue( pProperty );
                }
            }

            // When manual entry is disabled (popup lov), text field renders read-only and also sets a display value
            // based on the current property LOV metadata, by value
            if ( !pOptions.manualEntry ) {
                lReadonly = true;
                lClasses.push( PROPERTY_FIELD_READ_ONLY );

                // Only get values if we are not in multi-edit / value varies state
                // Don't perform an unnecessary AJAX call to get a display value for a null value
                if ( !lIsVariable && pProperty.value !== "" ) {
                    lData[ "return-value" ] = pProperty.value;
                    pProperty.metaData.lovValues( function( pLovValues ) {
                        var lDisplayValue,
                            lProperty$ = $( "[" + DATA_PROPERTY_ID + "=" + pProperty.propertyName + "]" );

                        if ( pLovValues.length > 0 && pLovValues[ 0 ].r === pProperty.value ) {
                            lDisplayValue = pLovValues[ 0 ].d;
                        } else {
                            lDisplayValue = pProperty.value;
                        }

                        gPropertyTypes[ pProperty.metaData.type ].setValue( lProperty$, pProperty, pProperty.value, lDisplayValue );

                    }, {
                        id: pProperty.value
                    });
                }

            }

            // for multi-edit, deal with value varies state, overrides any other display value
            if ( lIsVariable ) {
                lDisplayValue = "";
                lClasses.push( IS_VARIABLE );
            }

            lOptions = {
                id:         pId,
                type:       pOptions.type,
                value:      lDisplayValue,
                inputClass: lClasses,
                data:       lData,
                attributes: $.extend( pOptions.attributes, this.commonAttributes( pProperty ) ),
                readonly:   lReadonly
            };

            // max length
            if ( pProperty.metaData.maxLen ) {
                lOptions[ "maxLength" ] = pProperty.metaData.maxLen;
            }

            // Unit postfix
            if ( pProperty.metaData.unit ) {
                lOptions[ "ariaDescribedBy"] = lOptions.id + "_unit";
            }

            this.renderBaseInput( out, lOptions );
        },

        renderOption: function ( out, pLovValue, pCompareValue ) {
            out.markup( "<option" )
                .attr( "value", pLovValue.r )
                .optionalAttr( "selected", ( pLovValue.r === pCompareValue ) ? "true" : null );
            if ( pLovValue.hasOwnProperty( "isSupported" )) {
                out.attr( "data-is-supported", ( pLovValue.isSupported ) ? "true" : "false" );
            }
            out.markup( ">" )
                .content( pLovValue.d )
                .markup( "</option>" );

            return ( pLovValue.r === pCompareValue );
        },

        renderLovValues: function( out, pLovValues, pValue ) {
            var i,
                lLovValues  = pLovValues,
                lValueFound = false;

            if ( $.isFunction( lLovValues )) {
                lLovValues = lLovValues();
            }

            for ( i = 0; i < lLovValues.length; i++ ) {

                if ( lLovValues[ i ].hasOwnProperty( "group" )) {
                    out.markup( "<optgroup" )
                        .attr( "label", lLovValues[ i ].group )
                        .markup( ">" );
                    if ( this.renderLovValues( out, lLovValues[ i ].values, pValue ) ) {
                        lValueFound = true;
                    }
                    out.markup( "</optgroup>" );
                } else {
                    if ( this.renderOption( out, lLovValues[ i ], pValue )) {
                        lValueFound = true;
                    }
                }
            }
            return lValueFound;
        },

        renderIconButton: function( out, pOptions ) {
            var lOptions = $.extend( {
                id:             "",
                icon:           "",
                text:           "",
                dataFor:        null,
                disabled:       false,
                isMenuButton:   false,
                addContainer:   false,
                containerClass: "",
                buttonClass:    ""
            }, pOptions );

            if ( lOptions.addContainer ) {
                this.renderDivOpen( out, {
                    "class": PROPERTY_BUTTON_CONTAINER + ( ( lOptions.containerClass ) ? " " + lOptions.containerClass: "" )
                });
            }
            out.markup( "<button type='button'")
                .attr( "id",    lOptions.id )
                .attr( "class", ICON_BUTTON + ( ( lOptions.buttonClass ) ? " " + lOptions.buttonClass : "" )
                                            + ( ( lOptions.isMenuButton ) ? " js-menuButton" : "" ) )
                .attr( "title", lOptions.text )
                .attr( "aria-label", lOptions.text )
                .optionalAttr( "disabled", lOptions.disabled );
            if ( lOptions.dataFor ) {
                out.attr( "data-for", lOptions.dataFor );
            }
            if ( lOptions.isMenuButton ) {
                out.attr( "aria-haspopup", "true" )
                    .attr( "aria-expanded", "false" )
                    .attr( "data-menu", lOptions.id + "_menu" );
            }
            out.markup( ">" );
            this.renderIcon( out, lOptions.icon );
            out.markup( "</button>" );

            if ( lOptions.addContainer ) {
                this.renderDivClose( out );
            }
        },

        addValueVariesStateStyle: function( pElement$, pProperty$, pElementId, pThis ) {
            var outBefore = util.htmlBuilder(),
                outAfter = util.htmlBuilder();

            pElement$.addClass( IS_VARIABLE );
            pProperty$.addClass( IS_VARIABLE );

            pThis.renderIcon( outBefore, ICON_VARIABLE );
            outAfter.markup( "<span" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "VALUE_VARIES_POSTFIX") )
                .markup( "</span>" );

            $( "#" + pElementId + "_label" )
                .prepend( outBefore.toString() )
                .append( outAfter.toString() );
        },

        removeValueVariesStateStyle: function( pElement$, pProperty$ ) {
            var lLabel$ = $( "#" + pElement$.attr( "id" ) + "_label" );

            pElement$.removeClass( IS_VARIABLE );
            pProperty$.removeClass( IS_VARIABLE );

            lLabel$
                .find( "span.icon-variable" )
                    .remove()
                    .end()
                .find( "span." + VISUALLY_HIDDEN )
                    .remove();
        },

        addKeyboardHandlersForVariesState: function( pElement$, prop ) {
            var that, lProperty$, lElementId;

            // only add keyboard handlers if the property is editable
            if ( !prop.metaData.isReadOnly ) {
                that = this;
                lProperty$ = pElement$.closest( "div." + PROPERTY );
                lElementId = pElement$.attr( "id" );
                lProperty$
                    .on( "keydown", "#" + lElementId, function( pEvent ) {
                        var input$ = $( this );
                        if ( pEvent.which === $.ui.keyCode.ESCAPE && prop.value === VALUE_VARIES ) {

                            that.addValueVariesStateStyle( input$, lProperty$, lElementId, that );

                            setTimeout( function() {
                                input$[0].value = "";
                            }, 1 );
                        }
                    }).on( "keypress", "#" + lElementId, function( pEvent ) {
                        var input$ = $( this );
                        if ( pEvent.which && input$.hasClass( IS_VARIABLE ) ) {
                            that.removeValueVariesStateStyle( input$, lProperty$ );
                        }
                    });
            }
        },

        addChangeHandlersForVariesState: function( pElement$, prop ) {
            var that, lProperty$, lElementId;

            // only add change handlers if the property is editable
            if ( !prop.metaData.isReadOnly ) {
                that = this;
                lProperty$ = pElement$.closest( "div." + PROPERTY );
                lElementId = pElement$.attr( "id" );
                lProperty$.on( "change", "#" + lElementId, function( pEvent ) {
                    var lElement$ = $( this ),
                        lValue = lElement$.val();


                    if ( lElement$.hasClass( IS_VARIABLE ) ) {
                        that.removeValueVariesStateStyle( lElement$, lProperty$ );
                    } else if ( lValue === "" && prop.value === VALUE_VARIES ) {
                        that.addValueVariesStateStyle( lElement$, lProperty$, lElementId, that );
                    }
                });
            }
        },

        // Register tooltip handlers for this property
        //
        // At time of initialisation, if errors / warnings exists, the property is given a tooltip.
        //
        addTooltipsForErrors: function ( pElement$, prop ) {
            var lId = pElement$.attr( "id" );

            // Remove jQuery UI's default mouse over / out handling, we only want tooltips to appear on focus
            pElement$.tooltip().off( "mouseover mouseout" );

            if ( prop.errors.length > 0 ) {
                pElement$.tooltip( {
                    items: "#" + lId,
                    content: function( callback ) {
                        var lTooltipText, i;
                        lTooltipText = "<ul>";
                        for ( i = 0; i < prop.errors.length; i++ ) {
                            lTooltipText += "<li>" + prop.errors[ i ] + "</li>";
                        }
                        lTooltipText += "</ul>";
                        callback( lTooltipText );
                    },
                    position: {
                        my: "left bottom",
                        at: "left top",
                        of: "#" + lId + "_label"
                    }
                });
            }
            if ( prop.warnings.length > 0 ) {
                pElement$.tooltip( {
                    items: "#" + lId,
                    content: function( callback ) {
                        var lTooltipText, i;
                        lTooltipText = "<ul>";
                        for ( i = 0; i < prop.warnings.length; i++ ) {
                            lTooltipText += "<li>" + prop.warnings[ i ] + "</li>";
                        }
                        lTooltipText += "</ul>";
                        callback( lTooltipText );
                    },
                    position: {
                        my: "left bottom",
                        at: "left top",
                        of: "#" + lId + "_label"
                    }
                });
            }
        },

        initQuickPicks: function( pElement$, prop ) {
            var i, lMenuId, lQuickPicks, lQuickPicksLength, lQuickPickMenu$,
                lItems = [];

            if ( prop.metaData.quickPicks ) {
                lQuickPicks = prop.metaData.quickPicks();
                lQuickPicksLength = lQuickPicks.length;
                if ( !prop.metaData.isReadOnly ) {
                    if ( lQuickPicksLength > 0 ) {

                        // If property is optional, add a quick pick option equal to the property's null value
                        if ( !prop.metaData.isRequired ) {
                            if ( prop.metaData.nullText === undefined ) {
                                lItems.push({
                                    type:   "action",
                                    label:  msg( "QUICK_PICK.CLEAR" ),
                                    hide: function() {
                                        // Hide null option when property is already null
                                        return ( pElement$.val() === "" );
                                    },
                                    action: function() {
                                        pElement$.val( "" ).trigger( "change" );
                                    }
                                });
                                lItems.push({
                                    type: "separator",
                                    hide: function() {
                                        // Hide separator when property is already null
                                        return ( pElement$.val() === "" );
                                    }
                                });
                            } else {
                                // A null text which looks like a normal option should be handled like a regular value
                                // and always be displayed
                                lItems.push({
                                    type:   "action",
                                    label:  prop.metaData.nullText,
                                    action: function() {
                                        pElement$.val( "" ).trigger( "change" );
                                    }
                                });
                            }
                        }

                        for ( i = 0; i < lQuickPicksLength; i++ ) {
                            lItems.push({
                                type:   "action",
                                label:  lQuickPicks[ i ].d,
                                value:  lQuickPicks[ i ].r,
                                action: function () {
                                    pElement$.val( this.value ).trigger( "change" );
                                }
                            });
                        }
                        lMenuId = pElement$.attr( "id" ) + "_quickPickBtn_menu";

                        gQuickPickMenuIds.push( lMenuId );

                        // menu ID matches up with data-menu attribute value rendered by renderIconButton when isMenuButton is true
                        lQuickPickMenu$ = $( "<div id='" + lMenuId + "'></div>" ).appendTo( "body" );

                        lQuickPickMenu$.menu( { items: lItems } );

                    }
                }
            }
        },

        addLabelClickHandler: function ( pElement$, prop ) {
            var that = this,
                lProperty$ = pElement$.closest( "div." + PROPERTY ),
                lElementId = pElement$.attr( "id" );

            lProperty$.on( "click", "#" + lElementId + "_label", function( pEvent ) {
                that.setFocus( pElement$, prop );
            });
        },

        renderQuickPickButton: function( out, id, prop, pAddContainer ) {
            var lQuickPicks,
                lAddContainer = ( pAddContainer ) ? true : false;

            if ( prop.metaData.quickPicks ) {
                lQuickPicks = prop.metaData.quickPicks();
                if ( !prop.metaData.isReadOnly ) {
                    if ( lQuickPicks.length >  0 ) {
                        this.renderIconButton( out, {
                            id:             id + "_quickPickBtn",
                            icon:           ICON_QUICK_PICK,
                            text:           formatNoEscape( "QUICK_PICK", prop.metaData.prompt ),
                            isMenuButton:   true,
                            addContainer:   lAddContainer,
                            buttonClass:    "a-Button--quickPick"
                        });
                    }
                }
            }
        },

        renderRadioCheckbox: function ( out, id, prop, type, pOptions ) {
            var lOptions, lId, lInputType, lInputDivClass, lInputClass, lLabelClass;

            if ( type === PROP_TYPE.CHECKBOXES ) {
                lInputType = "checkbox";
                lInputDivClass = PROPERTY_CHECKBOX;
                lInputClass = PROPERTY_CHECKBOX_INPUT;
                lLabelClass = PROPERTY_CHECKBOX_LABEL;
            } else {
                lInputType = "radio";
                lInputDivClass = PROPERTY_RADIO;
                lInputClass = PROPERTY_RADIO_INPUT;
                lLabelClass = PROPERTY_RADIO_LABEL;
            }

            lOptions = $.extend({
                type: lInputType,
                name: id + "_name",
                inputValue: null,
                inputLabel: null,
                currentValue: ( prop.value !== VALUE_VARIES ) ? prop.value.split( ":" ) : prop.value    //todo multiple support
            }, pOptions );
            lId = id + lOptions.inputValue;

            this.renderDivOpen( out, { "class": lInputDivClass } );
            out.markup( "<input" )
                .attr( "type", lOptions.type )
                .attr( "id", lId )
                .attr( "value", lOptions.inputValue )
                .attr( "name", lOptions.name )
                .attr( "class", lInputClass )
                .optionalAttr( "checked", ( $.inArray( lOptions.inputValue, lOptions.currentValue) !== -1 ) ? "true" : null )
                .markup( " />" );
            out.markup( "<label" )
                .attr( "for", lId )
                .attr( "class", lLabelClass )
                .markup( ">" )
                .content( lOptions.inputLabel )
                .markup( "</label>" );
            this.renderDivClose( out );
        },

        renderRadiosCheckboxes: function ( out, id, prop, type ) {
            var i, lLovValues,
                lFieldContainerClass = [],
                lFieldGroupClass = [],
                lLabelId = id + "_label";

            lFieldContainerClass.push( PROPERTY_FIELD_CONTAINER );

            if ( type === PROP_TYPE.CHECKBOXES ) {
                lFieldContainerClass.push( PROPERTY_FIELD_CONTAINER_CHECKBOXGROUP );
                lFieldGroupClass.push ( PROPERTY_CHECKBOX_GROUP );
            } else if ( type === PROP_TYPE.RADIOS ) {
                lFieldContainerClass.push( PROPERTY_FIELD_CONTAINER_RADIOGROUP );
                lFieldGroupClass.push( PROPERTY_RADIO_GROUP );
            }

            this.renderDivOpen( out, { "class": lFieldContainerClass } );

            if ( !prop.metaData.isReadOnly ) {

                if ( prop.value === VALUE_VARIES ) {
                    lFieldGroupClass.push( IS_VARIABLE );
                }

                out.markup( "<div" )
                    .attr( "role", "group" )
                    .attr( "class", lFieldGroupClass.join( " " ) )
                    .attr( "aria-labelledby", lLabelId )
                    .attr( "tabindex", "-1" );              // todo review if this is still required if we use setFocus callback
                this.renderCommonAttributes( out, id, prop );
                out.markup( ">" );

                // use default lovValues unless this is a yes/no control then use specific values for that
                if ( prop.metaData.type !== PROP_TYPE.YES_NO ) {
                    lLovValues = prop.metaData.lovValues;
                    if ( $.isFunction( lLovValues )) {
                        lLovValues = lLovValues();
                    }

                    for ( i = 0; i < lLovValues.length; i++ ) {
                        this.renderRadioCheckbox( out, id, prop, type, {
                            inputValue: lLovValues[ i ].r,
                            inputLabel: lLovValues[ i ].d
                        });
                    }
                } else {
                    this.renderRadioCheckbox( out, id, prop, type, {
                        inputValue: prop.metaData.yesValue,
                        inputLabel: msg( "YES" )
                    });
                    this.renderRadioCheckbox( out, id, prop, type, {
                        inputValue: prop.metaData.noValue,
                        inputLabel: msg( "NO" )
                    });
                }
                this.renderDivClose( out );     // close radioGroup

            } else {
                this.renderText( out, id, prop );
            }

            this.renderDivClose( out );     // close main prop DIV

        },

        getTextCaseClass: function ( pTextCase ) {
            var lClass = "";
            if ( pTextCase === "UPPER" ) {
                lClass = TEXT_UPPER;
            } else if ( pTextCase === "LOWER" ) {
                lClass = TEXT_LOWER;
            }
            return lClass;
        }

    };

    // Add new property type interface, creates new object that inherits from the base prototype
    function addPropertyType( pType, pOptions, pBaseType ) {
        var lBase, that;

        if ( pBaseType ) {
            lBase = gPropertyTypes [ pBaseType ];
        } else {
            lBase = gPropertyTypeBasePrototype;
        }

        if ( !pOptions && pBaseType ) {
            // just set up an alias to the base type
            gPropertyTypes[ pType ] = lBase;
            return;
        }

        that = $.extend( Object.create( lBase ), pOptions );
        // provide access to base type methods via super function
        // xxx I suspect that this can have trouble if the base type doesn't directly implement a method
        // C extends B extrends A A and C implement method foo but B doesn't calling C.foo where C.foo calls the super foo ends up calling C.foo twice
        // I think
        that[ "super" ] = ( function() {
            var slice = Array.prototype.slice,
                parentSuper = that[ "super" ];
            return function( methodName ) {
                var returnValue,
                    args = slice.call( arguments, 1 ),
                    temp = this[ "super" ];
                this[ "super" ] = parentSuper;
                returnValue = lBase[methodName].apply( this, args );
                this[ "super" ] = temp;
                return returnValue;
            };
        })();
        gPropertyTypes[ pType ] = that;
    }

    /*
     * Add widget's core property types
     */
    addPropertyType( PROP_TYPE.TEXT, {
        render: function( out, id, prop, options ) {
            this.renderDivOpen( out, {
                "class": PROPERTY_FIELD_CONTAINER
            });
            this.renderText( out, id, prop, options );
            this.renderDivClose( out );    // close PROPERTY_FIELD_CONTAINER
            this.renderQuickPickButton( out, id, prop, true );
        },
        init: function( pElement$, prop ) {
            this.initQuickPicks( pElement$, prop );
            this[ "super" ]( "init", pElement$, prop );
        }
    });

    addPropertyType( PROP_TYPE.NUMBER, {
        init: function( pElement$, prop ) {

            // Only add key handling if the property is editable
            if ( !prop.metaData.isReadOnly && !prop.metaData.supportsSubstitution ) {
                // Only allow certain keys through
                pElement$.on( "keydown", function( event ) {
                    //todo other keycodes needed?
                    /* Allowed keys are:
                     * 8: backspace
                     * 9: tab
                     * 13: ENTER
                     * 37,39: left cursor, right cursor
                     * 45: insert
                     * 46: delete
                     * 48 to 57: 0 to 9 number keys
                     * 96 to 105: 0 to 9 number keypad
                     * 107: plus keypad
                     * 109: minus keypad
                     * 110: period keypad
                     * 188: comma key
                     * 189: minus key
                     * 190: period key
                     */
                    var DECIMAL_SEPARATOR = locale.getDecimalSeparator();
                    var lAllowedKeys = [8,9,13,37,39,45,46,48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105,107,109,110,189];

                    if ( DECIMAL_SEPARATOR === "." ) {
                        lAllowedKeys.push( 190 );
                    } else if ( DECIMAL_SEPARATOR === "," ) {
                        lAllowedKeys.push( 188 );
                    }

                    if ( $.inArray( event.which, lAllowedKeys ) === -1 ) {
                        event.preventDefault();
                    }
                });
            }

            this[ "super" ]( "init", pElement$, prop );
        }
    }, PROP_TYPE.TEXT );

    addPropertyType( PROP_TYPE.INTEGER, {
        init: function( pElement$, prop ) {

            // Only add key handling if the property is editable
            if ( !prop.metaData.isReadOnly && !prop.metaData.supportsSubstitution ) {
                // Only allow certain keys through, same as NUMBER but without the separators
                pElement$.on( "keydown", function( event ) {
                    //todo other keycodes needed?
                    /* Allowed keys are:
                     * 8: backspace
                     * 9: tab
                     * 13: ENTER
                     * 37,39: left cursor, right cursor
                     * 45: insert
                     * 46: delete
                     * 48 to 57: 0 to 9 number keys
                     * 96 to 105: 0 to 9 number keypad
                     * 107: plus keypad
                     * 109: minus keypad
                     * 189: minus key
                     */
                    var lAllowedKeys = [8,9,13,37,39,45,46,48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105,107,109,189];
                    if ( $.inArray( event.which, lAllowedKeys ) === -1 ) {
                        event.preventDefault();
                    }
                });
            }

            this[ "super" ]( "init", pElement$, prop );
        }
    }, PROP_TYPE.TEXT );

    addPropertyType( PROP_TYPE.TEXTAREA, {
        stacked: true,
        render: function( out, id, prop, pHasExternalEdit ) {
            var lValue,
                lClasses = PROPERTY_FIELD + " " + PROPERTY_FIELD_TEXTAREA;

            this.renderDivOpen( out, { "class": PROPERTY_BUTTON_CONTAINER } );
            if ( pHasExternalEdit ) {
                this.renderIconButton( out, {
                    id:     id + "_modalBtn",
                    icon:   ICON_EDIT_DIALOG,
                    text:   formatNoEscape( "CODE_EDITOR", prop.metaData.prompt )
                });
            }
            this.renderQuickPickButton( out, id, prop );
            this.renderDivClose( out );

            this.renderDivOpen( out, { "class": PROPERTY_FIELD_CONTAINER } );
            lValue = prop.value;
            if ( lValue === VALUE_VARIES ) {
                lValue = "";
                lClasses += " " + IS_VARIABLE;
            }

            lClasses += " " + this.getTextCaseClass( prop.metaData.textCase );

            // no wrap attribute defined, defaulting to 'soft' for plain textareas so wrapping is preserved
            out.markup( "<textarea rows=3" )
                    .attr( "maxlength", prop.metaData.maxLen )
                    .attr( "class", lClasses )
                    .optionalAttr( "readonly", ( prop.metaData.isReadOnly ) ? "true" : null );
            this.renderCommonAttributes( out, id, prop );
            out.markup( ">" )
                    .content( lValue )
                    .markup( "</textarea>" );

            this.renderDivClose( out );    // close PROPERTY_FIELD_CONTAINER
        },
        init: function( pElement$, prop ) {
            var STANDARD_HEIGHT = 50,
                MAX_HEIGHT = 150,
                lScrollHeight = pElement$.prop( "scrollHeight" );

            // Does the textarea have content that produces scroll
            if ( lScrollHeight > STANDARD_HEIGHT ) {

                // If so, adjust the height, but within a maximum
                if ( lScrollHeight > MAX_HEIGHT ) {
                    lScrollHeight = MAX_HEIGHT;
                }
                pElement$.height( lScrollHeight );
            }
            this.initQuickPicks( pElement$, prop );
            this[ "super" ]( "init", pElement$, prop );
        }

    });
    addPropertyType( PROP_TYPE.COMBOBOX, {
        manualEntry: true,
        render: function( out, id, prop ) {

            this.renderDivOpen( out, {
                "class": [ PROPERTY_FIELD_CONTAINER, PROPERTY_FIELD_CONTAINER_COMBOBOX ]
            });

            this.renderText( out, id, prop, {
                manualEntry: this.manualEntry
            });

            this.renderDivClose( out );    // close PROPERTY_FIELD_CONTAINER

            this.renderIconButton( out, {
                id:             id + "_lovBtn",
                icon:           ICON_LOV,
                text:           formatNoEscape( "LIST_OF_VALUES", prop.metaData.prompt ),
                addContainer:   true,
                containerClass: PROPERTY_BUTTON_CONTAINER_COMBOBOX
            });

            this.renderQuickPickButton( out, id, prop, true );

        },
        init: function( pElement$, prop, pOptions ) {
            var that = this,
                lOptions = $.extend({
                columnDefinitions: [
                    {
                        name:      "d",
                        title:     prop.metaData.prompt
                    }
                ],
                filters: [
                    {
                        name:  "search",
                        title: msg( "SEARCH" ),
                        type:  "search"
                    }
                ],
                filterLov: function( pFilters, pRenderLovEntries ) {

                    if ( $.isFunction( prop.metaData.lovValues )) {
                        prop.metaData.lovValues( function( pLovEntries ) {

                            // If manual entry is disabled and property is optional, we need a null text option
                            if ( !that.manualEntry && !prop.metaData.isRequired ) {
                                pLovEntries.unshift( {
                                    r: "",
                                    d: ( prop.metaData.nullText !== undefined  ) ? prop.metaData.nullText : msg( "SELECT" )
                                });
                            }
                            pRenderLovEntries( pLovEntries, pFilters.search );
                        }, pFilters );

                    } else {

                        pRenderLovEntries( prop.metaData.lovValues, pFilters.search );

                    }

                },
                multiValue: false,
                dialogTitle: formatNoEscape( "PICK", prop.metaData.prompt ) // escaping done by jQueryUI dialog
            }, pOptions );

            function openLovDialog() {
                var lLovDialog$,
                    out = util.htmlBuilder();

                out.markup( "<div" )
                    .attr( "id", "lovDlg" )
                    .attr( "title", lOptions.dialogTitle )
                    .markup( ">" )
                    .markup( "</div>" );

                lLovDialog$ = $( out.toString() ).lovDialog({
                    modal:             true,
                    minWidth:          520,
                    height:            500,
                    filters:           lOptions.filters,
                    columnDefinitions: lOptions.columnDefinitions,
                    filterLov:         lOptions.filterLov,
                    dialogClass:       DIALOG_FLUSH_BODY,
                    resizable:         false,
                    multiValue:        lOptions.multiValue,
                    valueSelected: function( pEvent, pData ) {
                        var lValue, lDisplayValue;

                        // If return value is not undefined use it (allow "" though hence why the undefined check),
                        // otherwise fallback to first column as defined by columnDefinitions
                        lValue = ( pData.r !== undefined ) ? pData.r : pData[ lOptions.columnDefinitions[ 0 ].name ];

                        // If manual entry is not allowed (popup lov), we need the display value as well
                        if ( !that.manualEntry ) {
                            lDisplayValue = ( pData.d ) ? pData.d : lValue;
                        }

                        if ( !prop.metaData.multiValueDelimiter ) {
                            that.setValue( pElement$, prop, lValue, lDisplayValue );
                        } else {

                            // Separate display value not currently supported for multi-value
                            that[ "super" ]( "addValue", pElement$, prop, lValue );
                        }

                        pElement$.trigger( "change" );
                    }
                });
            }

            var lLovButton$ = $( "#" + pElement$.attr( "id" ) + "_lovBtn" );
            this[ "super" ]( "init", pElement$, prop );
            lLovButton$.on( "click", openLovDialog );

            // readonly state controls whether LOV button is disabled or not
            lLovButton$.prop( "disabled", prop.metaData.isReadOnly );

            this.initQuickPicks( pElement$, prop );
        },
        setValue: function( pElement$, prop, pValue, pDisplayValue ) {

            if ( this.manualEntry ) {
                pElement$.val( pValue );
            } else {
                pElement$.data( "return-value", pValue );
                if ( pDisplayValue ) {
                    pElement$.val( pDisplayValue );
                }
            }

            prop.value = pValue;

        },
        getValue: function( pProperty$ ) {
            var lValue;
            if ( this.manualEntry ) {
                lValue = this[ "super" ]( "getValue", pProperty$ );
            } else {
                lValue = pProperty$.find( "[" + DATA_PROPERTY_ID + "]" ).data( "return-value" );
            }
            return lValue;
        }
    });
    addPropertyType( PROP_TYPE.CHECKBOXES, {
        noLabel: true,
        render: function( out, id, prop ) {
            this.renderRadiosCheckboxes( out, id, prop, PROP_TYPE.CHECKBOXES );
        },
        init: function( pElement$, prop ) {
            this.addChangeHandlersForVariesState( pElement$, prop );
            this.addLabelClickHandler( pElement$, prop );
            this.addTooltipsForErrors( pElement$, prop );
        },
        getValue: function( pProperty$ ) {
            var lValueArray = [];
            pProperty$.find( "input" ).each( function() {
                if ( this.checked ) {
                    lValueArray.push( this.value );
                }
            });
            return lValueArray.join( ":" );
        },
        getDisplayValue: function( prop ) {
            var lLovValues, lReadOnlyDisplayValue, i,
                lReadOnlyDisplayValueArray = [],
                lPropertyValueArray = prop.value.split( ":" );

            lLovValues = prop.metaData.lovValues;
            if ( $.isFunction( lLovValues )) {
                lLovValues = lLovValues();
            }
            if ( lLovValues ) {
                for ( i = 0; i < lLovValues.length; i++ ) {
                    if ( $.inArray( lLovValues[ i ].r, lPropertyValueArray ) > -1 ) {
                        lReadOnlyDisplayValueArray.push( lLovValues[ i ].d );
                    }
                }
                lReadOnlyDisplayValue = lReadOnlyDisplayValueArray.join( ":" );
            }
            return lReadOnlyDisplayValue;
        },
        setValue: function( pElement$, prop, pValue ) {
            var lCheckboxes$ = pElement$.find( "input" ),
                lValues = pValue.split( ":" );

            lCheckboxes$.prop( "checked", false );

            lCheckboxes$.each( function () {
                var lCheckbox$ = $( this );
                if ( $.inArray( lCheckbox$.val(), lValues ) > -1 ) {
                    lCheckbox$.prop( "checked", true );
                }
            });

            prop.value = pValue;

        },
        setFocus: function( pElement$, pProperty ) {
            if ( !pProperty.metaData.isReadOnly ) {
                pElement$.find( ":input" )[ 0 ].focus();
            } else {
                pElement$[ 0 ].focus();
            }
        }
    });
    addPropertyType( PROP_TYPE.RADIOS, {
        noLabel: true,
        render: function( out, id, prop ) {
            this.renderRadiosCheckboxes( out, id, prop, PROP_TYPE.RADIOS );
        },
        init: function( pElement$, prop ) {
            this.addChangeHandlersForVariesState( pElement$, prop );
            this.addLabelClickHandler( pElement$, prop );
            this.addTooltipsForErrors( pElement$, prop );
        },
        getValue: function( pProperty$ ) {
            var lValue = "";
            pProperty$.find( "input" ).each( function() {
                if ( this.checked ) {
                    lValue = this.value;
                    return false;
                }
            });
            return lValue;
        },
        getDisplayValue: function( prop ) {
            var lLovValues, lReadOnlyDisplayValue, i;

            lLovValues = prop.metaData.lovValues;
            if ( $.isFunction( lLovValues )) {
                lLovValues = lLovValues();
            }
            if ( lLovValues ) {
                for ( i = 0; i < lLovValues.length; i++ ) {
                    if ( lLovValues[ i ].r === prop.value ) {
                        lReadOnlyDisplayValue = lLovValues[ i ].d;
                        break;
                    }
                }
            }
            return lReadOnlyDisplayValue;
        },
        setValue: function( pElement$, prop, pValue ) {
            var lRadios$ = pElement$.find( "input" );
            lRadios$.each( function () {
                var lRadio$ = $( this );

                if ( lRadio$.prop( "checked" ) ) {

                    // if current value is the same as the new value, exit and do nothing
                    if ( lRadio$.val() === pValue ) {
                        return false;
                    }

                    // if the radio is checked, uncheck it
                    lRadio$
                        .prop( "checked", false )
                        .button( "refresh" );
                } else {

                    // if the radio is unchecked, check against the new value and if matches, check it
                    if ( lRadio$.val() === pValue ) {
                        lRadio$
                            .prop( "checked", true )
                            .button( "refresh" );

                        // we have the new value, so exit each loop
                        return false;
                    }
                }
            });

            prop.value = pValue;

        },
        setFocus: function( pElement$, pProperty ) {
            if ( !pProperty.metaData.isReadOnly ) {
                pElement$.find( ":input" )[ 0 ].focus();
            } else {
                pElement$[ 0 ].focus();
            }
        }
    });

    addPropertyType( PROP_TYPE.YES_NO, {
        init: function( pElement$, prop ) {
            this[ "super" ]( "init", pElement$, prop );

            // only initialise buttonset if the property is editable, if readonly we just render a read-only text
            if ( !prop.metaData.isReadOnly ) {
                pElement$.buttonset({});
            }
        },
        getDisplayValue: function ( prop ) {
            return ( prop.metaData.yesValue === prop.value ) ? msg( "YES" ) : msg( "NO" );
        }
    }, PROP_TYPE.RADIOS );
    addPropertyType( PROP_TYPE.SELECT_LIST, {
        render: function( out, id, prop, pButton ) {
            var lClasses = PROPERTY_FIELD + " " + PROPERTY_FIELD_SELECT,
                lValue = prop.value,
                lValueFound = false;

            this.renderDivOpen( out, { "class": PROPERTY_FIELD_CONTAINER } );

            if ( !prop.metaData.isReadOnly ) {
                if ( lValue === VALUE_VARIES ) {
                    lClasses += " " + IS_VARIABLE;
                }

                out.markup( "<select size=1")
                    .attr( "class", lClasses );
                this.renderCommonAttributes( out, id, prop );
                out.markup( ">" );

                if ( lValue === VALUE_VARIES ) {
                    lValueFound = this.renderOption( out, {
                        r: "",
                        d: ""
                    }, "" );
                    if ( !prop.metaData.isRequired ) {
                        this.renderOption( out, {
                            r: "",
                            d: ( prop.metaData.nullText !== undefined  ) ? prop.metaData.nullText : msg( "SELECT" )
                        }, null );
                    }
                    lValue = "";
                } else {
                    // Add "- Select -" if it's an optional select list or a required select list has no value
                    if ( !prop.metaData.isRequired || lValue === "" ) {
                        lValueFound = this.renderOption( out, {
                            r: "",
                            d: ( prop.metaData.nullText !== undefined ) ? prop.metaData.nullText : msg( "SELECT" )
                        }, lValue );
                    }
                }
                // Add the current value as extra value if it wasn't contained in our LOV values
                if ( !this.renderLovValues( out, prop.metaData.lovValues, lValue ) && !lValueFound ) {
                    this.renderOption( out, {
                        r: lValue,
                        d: format( "INVALID", lValue )
                    }, lValue );
                }

                out.markup( "</select>" );
            } else {
                this.renderText( out, id, prop );
            }

            renderDivClose( out );    // close PROPERTY_FIELD_CONTAINER

            this.renderQuickPickButton( out, id, prop, true );

            if ( pButton ) {
                this.renderIconButton( out, {
                    id:           id + "_btn",
                    icon:         pButton.icon,
                    text:         pButton.text,
                    addContainer: true
                });
            }

        },
        init: function( pElement$, prop ) {
            this.addChangeHandlersForVariesState( pElement$, prop );
            this.addTooltipsForErrors( pElement$, prop );
            this.initQuickPicks( pElement$, prop );
        },
        getDisplayValue: function( prop ) {
            var lLovValues, lReadOnlyDisplayValue;

            if ( prop.value !== "" ) {
                lLovValues = prop.metaData.lovValues;
                if ( $.isFunction( lLovValues )) {
                    lLovValues = lLovValues();
                }
                if ( lLovValues ) {
                    for ( var i = 0; i < lLovValues.length; i++ ) {
                        if ( lLovValues[ i ].r === prop.value ) {
                            lReadOnlyDisplayValue = lLovValues[ i ].d;
                            break;
                        }
                    }
                }
            } else {
                if ( prop.metaData.nullText ) {
                    lReadOnlyDisplayValue = prop.metaData.nullText;
                } else {
                    lReadOnlyDisplayValue = prop.value;
                }
            }
            return lReadOnlyDisplayValue;
        }
    });

    addPropertyType( PROP_TYPE.COLOR, {
        render: function( out, id, prop ) {

            // Possible pre-defined color sets
            var COLORS = [
                "#FF3B30",
                "#FF9500",
                "#FFCC00",
                "#4CD964",
                "#34AADC",
                "#007AFF",
                "#5856D6",
                "#FF2D55",
                "#FFFFFF",
                "#C7C7CC",
                "#8E8E93",
                "#000000" ];
            // New standard colors from http://clrs.cc/
            //
            //    "#001f3f",
            //    "#0074d9",
            //    "#7fdbff",
            //    "#39cccc",
            //    "#3d9970",
            //    "#2ecc40",
            //    "#01ff70",
            //    "#ffdc00",
            //    "#ff851b",
            //    "#ff4136",
            //    "#85144b",
            //    "#f012be",
            //    "#b10dc9",
            //    "#ffffff",
            //    "#dddddd",
            //    "#aaaaaa",
            //    "#111111" ];
            //
            // HTML colors from http://en.wikipedia.org/wiki/Web_colors
            //
            //    "#ffffff",
            //    "#c0c0c0",
            //    "#808080",
            //    "#000000",
            //    "#ff0000",
            //    "#800000",
            //    "#ffff00",
            //    "#808000",
            //    "#00ff00",
            //    "#008000",
            //    "#00ffff",
            //    "#008080",
            //    "#0000ff",
            //    "#000080",
            //    "#ff00ff",
            //    "#800080" ];
            //

            /*
             * Commented out HTML 5 color type support, as this doesn't allow null values
             */
            //this[ "super" ]( "render", out, id, prop, {
            //    type:       "color",
            //    "class":    PROPERTY_FIELD_COLOR,
            //    textCase:   "LOWER",
            //    attributes: { list: id + "_colors" }
            //} );
            // Emit a predefined list of HTML colors to make it easier for the user to pick a color
            //out.markup( "<datalist" )
            //    .attr( "id", id + "_colors" )
            //    .markup( ">" );
            //for ( var i = 0; i < COLORS.length; i++ ) {
            //    out.markup( "<option>" )
            //        .content( COLORS[ i ] )
            //        .markup( "</option>" );
            //}
            //out.markup( "</datalist>" );


            this.renderDivOpen( out, {
                "class": [ PROPERTY_FIELD_CONTAINER, PROPERTY_FIELD_CONTAINER_COLORPICKER ]
            });

            out.markup( "<span" )
                .attr( "id", id + "_preview" )
                .attr( "class", PROPERTY_COLOR_PREVIEW )
                .markup( ">" )
                .markup( "</span>" );

            this.renderText( out, id, prop, {
                manualEntry: this.manualEntry
            });

            this.renderDivClose( out );    // close PROPERTY_FIELD_CONTAINER

            this.renderIconButton( out, {
                id:             id + "_picker",
                icon:           ICON_COLOR,
                text:           formatNoEscape( "COLOR_PICKER", prop.metaData.prompt ),
                addContainer:   true,
                containerClass: PROPERTY_BUTTON_CONTAINER_COLORPICKER
            });

            // Add quick pick values here in color picker type (not derived from model)
            prop.metaData.quickPicks = function() {
                var i, lColorQuickPicks = [];
                for ( i = 0; i < COLORS.length; i++ ) {
                    lColorQuickPicks.push( {
                        //d: "<span class='" + PROPERTY_COLOR_PREVIEW + "' style='background-color:" + COLORS[ i ] + ";'>" + COLORS[ i ] + "</span>",
                        d: COLORS[ i ],
                        r: COLORS[ i ]
                    });
                }
                return lColorQuickPicks;

            };
            this.renderQuickPickButton( out, id, prop, true );

        },
        init: function( pElement$, prop ) {
            var that = this,
                lId = pElement$.attr( "id"),
                lPicker$ = $( "#" + lId + "_picker"),
                lPreview$ = $( "#" + lId + "_preview" );

            this[ "super" ]( "init", pElement$, prop );

            pElement$.ColorPicker( {
                eventName:    "xxx", // don't fire on the default click event, we have our own icon
                onSubmit:     function( pHsb, pHex, pRgb, pElement ) {
                    pElement$
                        .trigger( "change" )
                        .ColorPickerHide();
                },
                onBeforeShow: function() {
                    $( this ).ColorPickerSetColor( this.value );
                },
                onShow:       function( pPicker ) {
                    $( pPicker )
                        .fadeIn( "fast" )

                        // Default positioning mis-calculates here, so we have to re-position it ourselves
                        .position( {
                            my: "right top",
                            at: "right bottom",
                            of: "#" + lId + "_picker"
                        })

                        // Increase z-index, because otherwise this appears under the splitters
                        .css( "z-index", 200 );

                    return false;
                },
                onHide:       function( pPicker ) {
                    $( pPicker ).fadeOut( "fast" );
                    pElement$.trigger( "change" );

                    return false;
                },

                // For change, we want to update the property, but not issue a change because that would issue a
                // change to the model, and we don't want to do that until the picker closes.
                onChange: function( pColor, pHex, pRGB ) {
                    var lId = pElement$.attr( "id"),
                        lPreview$ = $( "#" + lId + "_preview"),
                        lValue = "#" + pHex.toUpperCase();

                    lPreview$.css( "background-color", lValue );
                    pElement$.val( lValue );

                }
            }).ColorPickerHide();

            pElement$.on( "change", function( pEvent ) {
                var lTarget = pEvent.target;
                lTarget.value = lTarget.value.toUpperCase();
                that.setValue( pElement$, prop, lTarget.value );
            });

            // clicking on colour picker icon opens the dialog
            lPicker$.on( "click", function( pEvent ) {
                pElement$.ColorPickerShow();
                pEvent.preventDefault();
            });

            // show the current entered color in preview
            lPreview$.css( "background-color", pElement$.val() );

            this.initQuickPicks( pElement$, prop );

        },
        setValue: function( pElement$, prop, pValue ) {
            var lId = pElement$.attr( "id"),
                lPreview$ = $( "#" + lId + "_preview" );

            pElement$.val( pValue );
            lPreview$.css( "background-color", pValue );
            prop.value = pValue;

        }

    }, PROP_TYPE.TEXT );

    addPropertyType( PROP_TYPE.POPUP_LOV, {
        manualEntry: false,
        init: function( pElement$, prop ) {
            this[ "super" ]( "init", pElement$, prop );
        }
    }, PROP_TYPE.COMBOBOX );

    /* xxx documentation
    * propertySet:
    * array of group objects
    * {
    *   displayGroupId: "string",
    *   collapsed: boolean,
    *   displayGroupTitle: "string",
    *   properties: [
    *     {
    *       propertyName:       "96",
    *       value:              "P1_ITEM1",
    *       errors:             [],         // array of strings xxx so far we only care about the count > 0
    *       warnings:           []          // array of strings xxx so far we only care about the count > 0
    *       metaData: {
    *         displayGroupId:   1,
    *         type:             "TEXT",     // one of PROP_TYPE above also index into dispatch map
    *         prompt:           "Name",
    *         isCommon:         true,
    *         isRequired:       true,
    *         // others, depending on their values, type, etc.
    *     }
    *   ]
    * }
    *
    */

    $.widget( "apex.propertyEditor", {
        version: "5.0",
        /* Note about widgetEventPrefix:
         * jQuery UI documentation states that the widgetEventPrefix property is deprecated, as follows:
         * "This property is deprecated and will be removed in a later release. Event names will be changed to
         * widgetName:eventName (e.g. "draggable:create"."
         * See: http://api.jqueryui.com/jQuery.widget/
         *
         * I tested without widgetEventPrefix in 1.10.3, and event names still just default to widgetName + eventName,
         * (so "propertyeditoractivate", not "propertyeditor:activate"). I therefore believe it's safest to leave
         * that property definition in place for the moment, until the default behaviour is changed, when we can just
         * remove it here, and change the handlers in the controller to use colon separation between widget and event name.
         */
        widgetEventPrefix:      "propertyeditor",
        baseId:                 null,   // used to generate ids for DOM elements
        nextId:                 1,      // used to generate ids for DOM elements
        idMap:                  {},     // map of property names to ids
        propMap:                {},     // map of property names to property objects in propertySet
        currentPropertyName:    null,   // current active property name
        // Default options
        options: {
            data: {     // object with propertySet and components properties
                propertySet:    [],     // this is the metadata that drives the UI
                componentCount: []
            },
            idPrefix:           null,
            showAll:            false,
            labelsAlwaysAbove:  false,
            hideDisplayGroups:  false,
            stackLabelsWidth:   280,    // labels will be placed above the fields when the width is below this value
            focusPropertyName:  null,   // xxx perhaps a set selection method would be better
            externalEdit:       null,   // use if component is to be edited somewhere else (function to handle redirect)
            // callbacks/events
            expand:             null,   // called when a display group is expanded. expand(event, group)
            collapse:           null,   // called when a display group is collapsed. collapse(event, group)
            activate:           null,   // called when a property is active for editing
                        // activate( event, property )
                        // property is a property from the propertySet or null
                        // if there is no active property
            deactivate:         null,   // called when a property is no longer active. Same args as activate
            change:             null    // called when a property value changes
                        // change(event, {
                        //    propertyName: "string",
                        //    property: {}, // from the propertySet
                        //    value: any,
                        //    previousValue: any
                        // } )
        },


        /*
         * Lifecycle methods
         */
        _create: function() {
            var o = this.options;

            if ( !o.data || !o.data.propertySet ) {
                throw "Missing required data option.";
            }

            this.baseId = ( o.idPrefix || this.element[0].id || "pe" ) + "_";

            this.element.addClass( PROPERTY_EDITOR );

            if ( this.options.showAll ) {
                this.element.addClass( SHOW_ALL );
            }

            this._on( this._eventHandlers );

            // now do the main fresh of the widget
            this.refresh();

            // if labels are always above, just add the stacked class
            if ( this.options.labelsAlwaysAbove ) {
                this.element.addClass( PROPERTY_EDITOR_STACKED );
            } else {

                // if labels are not always above, is the widget resizable?
                if ( this.element.hasClass( "resize" ) ) {

                    // if it is resizable, register resize handler
                    this._on({
                        "resize": function( pEvent ) {

                            // in the handler, we need to check if labels are always above again, as this may have been
                            // set on the page
                            if ( !this.options.labelsAlwaysAbove ) {
                                this.element.toggleClass( PROPERTY_EDITOR_STACKED, ( $( pEvent.target ).width() < this.options.stackLabelsWidth ) );
                            }
                        }
                    });

                    // also set the class upon creation
                    this.element.toggleClass( PROPERTY_EDITOR_STACKED, ( this.element.width() < this.options.stackLabelsWidth ) );
                } else {

                    // if the element is not resizable, remove the class
                    this.element.removeClass( PROPERTY_EDITOR_STACKED );
                }
            }

        },  // end _create

        _eventHandlers: {
            "click": function ( pEvent ) {
                var lGroup$ = null,
                    lTarget$ = $( pEvent.target );

                if ( lTarget$.is( "." + PROPERTY_GROUP_HEADER ) ) {
                    lGroup$ = lTarget$.parent();
                } else if ( lTarget$.parent("." + PROPERTY_GROUP_HEADER ).length > 0 ) {
                    lGroup$ = lTarget$.parent().parent();
                }
                if ( lGroup$ ) {
                    this._toggle( lGroup$ );
                }

                if ( lTarget$.attr( "id" ) === this.baseId + "externalEdit" ) {
                    this.options.externalEdit();
                }
            },
            "keydown": function ( pEvent ) {
                var next$ = null,
                    lHandled = false,
                    lKeys = $.ui.keyCode,
                    kc = pEvent.keyCode,
                    target$ = $( pEvent.target );

                if ( !target$.is("." + PROPERTY_GROUP_HEADER) ) {
                    return;
                }
                if ( kc === lKeys.HOME ) {
                    next$ = target$.parent().parent().children(":visible").first();
                } else if ( kc === lKeys.END ) {
                    next$ = target$.parent().parent().children(":visible").last();
                } else if ( kc === lKeys.DOWN ) {
                    next$ = target$.parent().nextAll().filter(":visible").first();
                    if ( next$.length === 0 ) {
                        next$ = target$.parent().parent().children(":visible").first();
                    }
                } else if ( kc === lKeys.UP ) {
                    next$ = target$.parent().prevAll().filter(":visible").first();
                    if ( next$.length === 0 ) {
                        next$ = target$.parent().parent().children(":visible").last();
                    }
                } else if ( kc === lKeys.LEFT ) {
                    this._collapse( target$.parent() );
                    lHandled = true;
                } else if ( kc === lKeys.RIGHT ) {
                    this._expand( target$.parent() );
                    lHandled = true;
                } else if ( kc === lKeys.SPACE || kc === lKeys.ENTER ) {
                    this._toggle ( target$.parent() );
                    lHandled = true;
                }
                if ( lHandled ) {
                    pEvent.preventDefault();
                }
                if ( next$ ) {
                    next$.children( "." + PROPERTY_GROUP_HEADER )[ 0 ].focus();
                    pEvent.preventDefault();
                }
            },
            "focusin div.a-Property": function ( pEvent ) {
                var prop$ = $( pEvent.target ).closest( "div.a-Property" );
                prop$.addClass( IS_ACTIVE + " " + IS_FOCUSED );
                this._activate( prop$ );
            },
            "focusout div.a-Property": function ( pEvent ) {
                var prop$ = $( pEvent.target ).closest( "div.a-Property" );
                prop$.removeClass( IS_ACTIVE + " " + IS_FOCUSED );
            },
            "change div.a-Property": function ( pEvent ) {
                var prop$ = $( pEvent.target ).closest( "div.a-Property" );
                this._checkForChange( prop$ );
            },
            "focusin div.a-PropertyEditor-propertyGroup-header": function ( pEvent ) {
                this._deactivate();
                $( pEvent.target )
                    .closest( "div.a-PropertyEditor-propertyGroup-header" )
                    .addClass( IS_FOCUSED );
            },
            "focusout div.a-PropertyEditor-propertyGroup-header": function ( pEvent ) {
                $( pEvent.target )
                    .closest( "div.a-PropertyEditor-propertyGroup-header" )
                    .removeClass( IS_FOCUSED );
            }
        },

        _destroy: function() {
            this.element.removeClass( PROPERTY_EDITOR + " " + SHOW_ALL ).empty();
        },

        _setOption: function( key, value ) {
            this._super( key, value );
            if ( key === "data" ) {
                if ( !value.propertySet ) {
                    throw "Missing required properties.";
                }
                this.refresh();
            } else if ( key === "showAll" ) {
                this.element.toggleClass( SHOW_ALL, !!value );
            } else if ( key === "labelsAlwaysAbove" ) {

                // if labels are always above, add the class
                if ( !!value ) {
                    this.element.addClass( PROPERTY_EDITOR_STACKED );
                } else {

                    // if not always above, we need to check if the widget is resizable
                    if ( this.element.hasClass( "resize" ) ) {

                        // if it is, toggle class appropriately
                        this.element.toggleClass( PROPERTY_EDITOR_STACKED, ( this.element.width() < this.options.stackLabelsWidth ) );
                    } else {

                        // if it isn't, remove the class
                        this.element.removeClass( PROPERTY_EDITOR_STACKED );
                    }
                }
            }
        },

        /*
         * Private functions
         */
        _callPropertyInit: function ( pProperty ) {
            var lPropertyName = pProperty.propertyName,
                lProperty$ = this.element.find( "[" + DATA_PROPERTY_ID + "=" + util.escapeCSS( lPropertyName ) + "]" );
            gPropertyTypes[ pProperty.metaData.type ].init( lProperty$, pProperty );
        },

        _renderLabel: function( out, prop ) {
            var lLabelIcons = util.htmlBuilder(),
                lHasErrors   = ( prop.errors.length > 0 ),
                lHasWarnings = ( prop.warnings.length > 0 ),
                lValueVaries = ( prop.value === VALUE_VARIES ),
                lLabelClass  = PROPERTY_LABEL,
                lLabelContainerClass = [],
                lLabelId = this._getId( prop ) + "_label";

            lLabelContainerClass.push( PROPERTY_LABEL_CONTAINER );

            if ( !gPropertyTypes[ prop.metaData.type ].labelVisible ) {
                lLabelClass += " " + VISUALLY_HIDDEN;
                lLabelContainerClass.push( PROPERTY_LABEL_CONTAINER + "--hiddenLabel" );
            } else {
                if ( lHasErrors || lHasWarnings || lValueVaries ) {
                    lLabelClass += " " + PROPERTY_LABEL_WITH_ICON;
                }
            }

            renderDivOpen( out, { "class": lLabelContainerClass } );


            if ( !gPropertyTypes[ prop.metaData.type ].noLabel ) {
                out.markup( "<label" )
                    .attr( "id", lLabelId )
                    .attr( "for", this._getId( prop ) )
                    .attr( "class", lLabelClass )
                    .markup( ">" );
            } else {
                out.markup( "<span" )
                    .attr( "id", lLabelId )
                    .attr( "class", lLabelClass )
                    .markup( ">" );
            }

            if ( gPropertyTypes[ prop.metaData.type ].labelVisible ) {
                // Build label's extra icons, depending on certain state (error, warning, value varies)
                if ( lHasErrors ) {
                    renderIcon( lLabelIcons, ICON_ERROR );
                }
                if ( lHasWarnings ) {
                    renderIcon( lLabelIcons, ICON_WARNING );
                }
                if ( prop.value === VALUE_VARIES ) {
                    renderIcon( lLabelIcons, ICON_VARIABLE );
                }
            }

            out.markup( lLabelIcons.html );
            out.content( prop.metaData.prompt );

            if ( gPropertyTypes[ prop.metaData.type ].labelVisible ) {
                // Build label's extra icons, depending on certain state (error, warning, value varies)
                if ( lHasErrors ) {
                    out.markup( "<span" )
                        .attr( "class", VISUALLY_HIDDEN )
                        .markup( ">" )
                        .content( msg( "ERROR_POSTFIX" ) )
                        .markup( "</span>" );
                }
                if ( lHasWarnings ) {
                    out.markup( "<span" )
                        .attr( "class", VISUALLY_HIDDEN )
                        .markup( ">" )
                        .content( msg( "WARNING_POSTFIX" ) )
                        .markup( "</span>" );
                }
                if ( prop.value === VALUE_VARIES ) {
                    out.markup( "<span" )
                        .attr( "class", VISUALLY_HIDDEN )
                        .markup( ">" )
                        .content( msg( "VALUE_VARIES_POSTFIX" ) )
                        .markup( "</span>" );
                }
            }

            if ( !gPropertyTypes[ prop.metaData.type ].noLabel ) {
                out.markup( "</label>" );
            } else {
                out.markup( "</span>");
            }

            renderDivClose( out );
        },


        _countVisibleProperties: function( pProperties ) {
            var lVisiblePropertyCount, j, lProperty,
                lMultiEdit = this.options.componentCount > 0;

            // check if there would be any visible properties *if* showing common
            lVisiblePropertyCount = 0;
            for ( j = 0; j < pProperties.length; j++ ) {
                lProperty = pProperties[ j ];
                if ( lMultiEdit && lProperty.metaData.isUnique ) {
                    continue; // skip unique properties during multi edit
                }
                if ( this._isCommon( lProperty )) {
                    lVisiblePropertyCount += 1;
                }
            }
            return lVisiblePropertyCount;
        },
        _renderDisplayGroup: function( out, pDisplayGroup, pIterator ) {
            var j,
                lProperty,
                lHeaderIcon,
                lPropertyCount,
                lVisiblePropertyCount,
                lGroupId,
                lExpanded,
                lGroupClasses,
                lMultiEdit = this.options.componentCount > 0,
                lProperties = pDisplayGroup.properties;

            lPropertyCount = lProperties.length;
            lGroupClasses = PROPERTY_GROUP;


            if ( this.options.hideDisplayGroups ) {
                for ( j = 0; j < lPropertyCount; j++ ) {
                    lProperty = lProperties[ j ];
                    if ( lMultiEdit && lProperty.metaData.isUnique ) {
                        continue; // skip unique properties during multi edit
                    }
                    this._renderProperty( out, lProperty );
                }
            } else {

                // check if there would be any visible properties *if* showing common
                lVisiblePropertyCount = this._countVisibleProperties( lProperties );

                lExpanded = !pDisplayGroup.collapsed;
                if ( lExpanded ) {
                    lHeaderIcon = ICON_EXPANDED;
                    lGroupClasses += " " + IS_EXPANDED;
                } else {
                    lHeaderIcon = ICON_COLLAPSED;
                }

                // if there are no visible properties then hide the whole group when showing common
                if ( lVisiblePropertyCount === 0 ) {
                    lGroupClasses += " " + SHOW_ALL;
                }

                lGroupId = this.baseId + "g_" + pIterator;

                // Main Display Group DIV
                out.markup( "<div role='group'" )
                    .attr( "class", lGroupClasses )
                    .attr( DATA_GROUP_ID, pDisplayGroup.displayGroupId )
                    .attr( "aria-labelledby", lGroupId + "_LABEL" )
                    .markup( ">" );

                /*
                 * Display Group Header
                 */
                out.markup( "<div tabindex='0'")
                    .attr( "class", PROPERTY_GROUP_HEADER )
                    .attr( "aria-controls", lGroupId )
                    .attr( "aria-expanded", lExpanded ? "true" : "false" )
                    .attr( "aria-labelledby", lGroupId + "_LABEL" )
                    .markup( ">" );

                renderIcon( out, lHeaderIcon );
                out.markup( "<h2")
                    .attr( "class", PROPERTY_GROUP_TITLE )
                    .attr( "id", lGroupId + "_LABEL" )
                    .markup( ">")
                    .content( pDisplayGroup.displayGroupTitle )
                    .markup( "</h2>" );

                renderDivClose( out );    // close PROPERTY_GROUP_HEADER

                /*
                 * Display Group Body
                 */
                out.markup( "<div")
                    .attr( "id", lGroupId )
                    .attr( "class", PROPERTY_GROUP_BODY );
                if ( !lExpanded ) {
                    out.attr( "style", "display:none;" );
                }
                out.markup( ">" );

                for ( j = 0; j < lPropertyCount; j++ ) {
                    lProperty = lProperties[ j ];
                    if ( lMultiEdit && lProperty.metaData.isUnique ) {
                        continue; // skip unique properties during multi edit
                    }
                    this._renderProperty( out, lProperty );
                }

                renderDivClose( out );    // close PROPERTY_GROUP_BODY
                renderDivClose( out );    // close PROPERTY_GROUP
            }
        },

        _renderDisplayGroups: function( out ) {
            var i,
                lPropertySet = this.options.data.propertySet;
            for ( i = 0; i < lPropertySet.length; i++ ) {
                this._renderDisplayGroup( out, lPropertySet[ i ], i );
            }
        },

        _renderProperty: function( out, prop ) {
            var lPropertyDivStyle,
                lPropertyDivClass = [ PROPERTY ];

            if ( gPropertyTypes[ prop.metaData.type ].stacked ) {
                lPropertyDivClass.push( PROPERTY_STACKED );
            }
            if ( gPropertyTypes[ prop.metaData.type ].minHeight ) {
                lPropertyDivStyle = "min-height: " + gPropertyTypes[ prop.metaData.type ].minHeight + "px;";
            }
            if ( gPropertyTypes[ prop.metaData.type ].maxHeight ) {
                lPropertyDivStyle = "max-height: " + gPropertyTypes[ prop.metaData.type ].maxHeight + "px;";
                lPropertyDivClass.push( PROPERTY_SCROLLABLE );
            }
            if ( gPropertyTypes[ prop.metaData.type ].height ) {
                lPropertyDivStyle = "max-height: " + gPropertyTypes[ prop.metaData.type ].height + "px;";
                lPropertyDivClass.push( PROPERTY_SCROLLABLE );
            }
            if ( prop.errors.length > 0 ) {
                lPropertyDivClass.push( IS_ERROR );
            }
            if ( prop.warnings.length > 0 ) {
                lPropertyDivClass.push( IS_WARNING );
            }
            if ( prop.value === VALUE_VARIES ) {
                lPropertyDivClass.push( IS_VARIABLE );
            }
            if ( !this._isCommon( prop ) ) {
                lPropertyDivClass.push( SHOW_ALL );
            }

            // This DIV marks the beginning of the actual property, and is what is refreshed from updateProperty
            var lPropertyDivOptions = {
                "class": lPropertyDivClass,
                style: lPropertyDivStyle
            };
            renderDivOpen( out, lPropertyDivOptions );

            if ( prop.metaData.isRequired ) {
                renderIcon( out, ICON_REQUIRED_FIELD, msg( "REQUIRED" ) );
            }

            // todo Should we highlight the property somehow if it's a legacy property? (prop.metaData.isLegacy)

            this._renderLabel( out, prop );

            // Render the property type
            gPropertyTypes[ prop.metaData.type ].render( out, this._getId( prop ), prop );

            if ( prop.metaData.unit ) {
                out.markup("<div")
                    .attr( "class", PROPERTY_UNIT_CONTAINER )
                    .markup( ">" );

                out.markup( "<span" )
                    .attr( "class", PROPERTY_UNIT )
                    .attr( "id", this._getId( prop ) + "_unit" )
                    .markup( ">" )
                    .content( prop.metaData.unit )
                    .markup( "</span>" );

                out.markup( "</div>");
            }

            renderDivClose( out );    // close PROPERTY
        },

        _getProperty: function( propertyName ) {
            return this.propMap[ propertyName ];
        },

        _getId: function( prop, suffix ) {
            var lId;
            lId = this.idMap[ prop.propertyName ];
            if ( !lId ) {
                lId = this.baseId + this.nextId;
                this.nextId += 1;
                this.idMap[ prop.propertyName ] = lId;
            }
            if ( suffix ) {
                lId += suffix;
            }
            return lId;
        },

        _getElement: function( prop, suffix ) {
            return $( "#" + this._getId( prop, suffix ) );
        },

        _isCommon: function( prop ) {
            return ( prop.metaData.isCommon ||
                     prop.value !== prop.metaData.defaultValue ||
                     prop.errors.length > 0 ||
                     prop.warnings.length > 0 );
        },

        _activate: function( property$ ) {
            var self = this,
                lPropertyName = property$.find( "[" + DATA_PROPERTY_ID + "]" ).attr( DATA_PROPERTY_ID ),
                lProperty = this._getProperty( lPropertyName );

            // Only if we have moved to a new property, should we proceed with activate logic
            if ( this.currentPropertyName !== lPropertyName ) {
                this._deactivate();
                this.currentPropertyName = lPropertyName;
                setTimeout( function() {
                    self._trigger( "activate", {}, lProperty );
                }, 0 );
            }
        },

        _deactivate: function() {
            var self = this;

            // Clear current active property
            this.currentPropertyName = null;

            setTimeout( function() {
                self._trigger( "deactivate" );
//xxx                console.log("deactiveate");
            }, 0 );
        },

        _checkForChange: function( property$ ) {
            var lData, lNewValue, ctrl$, group$,
                lPropertyName = property$.find( "[" + DATA_PROPERTY_ID + "]" ).attr( DATA_PROPERTY_ID),
                lProperty = this._getProperty( lPropertyName ),
                lOldValue = lProperty.oldValue;

            debug.info( "propertyEditor _checkForChange", property$ );

            lNewValue = this.getValue( property$, lProperty );
            ctrl$ =  $( "#" + this.idMap[ lPropertyName ] );

            // xxx should defer to dispatch plugin
            if ( ctrl$.hasClass( IS_VARIABLE ) && lNewValue === "" ) {
                lNewValue = VALUE_VARIES;
            }

            if ( lNewValue !== lOldValue ) {

                // Update widget model with new value
                lProperty.value = lNewValue;
                lProperty.oldValue = lNewValue;

                // only toggle show all class if we're in show all mode so that they appear correctly if the user
                // switches to common. It's too disruptive to do this in common view because properties
                // may disappear, if they are changed back to their original value. Instead we will leave them there,
                // until the user changes component
                if ( this.options.showAll ) {
                    // update showall class on property and group as needed
                    property$.toggleClass( SHOW_ALL, !this._isCommon( lProperty ));
                    group$ = property$.closest( "div." + PROPERTY_GROUP );

                    // Count common, or visible properties in the group, if none, add SHOW_ALL, if some remove SHOW_ALL
                    var lCommonPropertyCount = group$.find( "div." + PROPERTY ).filter( ":not(." + SHOW_ALL + ")" ).length;
                    group$.toggleClass( SHOW_ALL, lCommonPropertyCount === 0 );
                }

                lData = {
                    propertyName: lPropertyName,
                    property: this._getProperty( lPropertyName ),
                    previousValue: lOldValue,
                    property$: property$
                };
                this._trigger( "change", {}, lData );
            }
        },

        _expand: function( group$ ) {
            if ( !group$.hasClass( IS_EXPANDED ) ) {
                group$.addClass( IS_EXPANDED ).children( "." + PROPERTY_GROUP_BODY ).show();
                group$.children( "." + PROPERTY_GROUP_HEADER ).attr( "aria-expanded", "true")
                    .children( "." + ICON )
                    .removeClass( ICON_COLLAPSED )
                    .addClass( ICON_EXPANDED);
                this._trigger( "expand", {}, { displayGroupId: group$.attr( "data-group-id" ) } );
            }
            // else already expanded
        },

        _collapse: function( group$ ) {
            if ( group$.hasClass( IS_EXPANDED ) ) {
                group$.removeClass( IS_EXPANDED ).children( "." + PROPERTY_GROUP_BODY ).hide();
                group$.children( "." + PROPERTY_GROUP_HEADER ).attr( "aria-expanded", "false")
                    .children( "." + ICON )
                    .removeClass( ICON_EXPANDED )
                    .addClass( ICON_COLLAPSED );
                this._trigger( "collapse", {}, { displayGroupId: group$.attr( "data-group-id" ) } );
            }
            // else already collapsed
        },

        _toggle: function( group$ ) {
            if ( group$.hasClass( IS_EXPANDED )) {
                this._collapse( group$ );
            } else {
                this._expand( group$ );
            }
        },

        /*
         * Public functions
         */

        refresh: function() {
            var i, j,
                lProperties,
                lProperty,
                lWarningMessage,
                out = util.htmlBuilder(),
                lComponentCount = this.options.componentCount,
                lPropertySet = this.options.data.propertySet,
                lExternalEdit = this.options.externalEdit;

            this.nextId = 1;
            this.idMap = {};
            this.propMap = {};

            debug.info( "propertyEditor refresh" );

            // Deactivate current active property
            this._deactivate();

            // Clean up any menu's created by quick pick buttons
            for ( i = 0; i < gQuickPickMenuIds.length; i++ ) {
                $( "#" + gQuickPickMenuIds[ i ] ).remove();
            }
            gQuickPickMenuIds = [];

            if ( lComponentCount === 0 || ( lComponentCount === 1 && lPropertySet.length === 0 ) ) {
                lWarningMessage = msg( "NO_COMMON_PROPERTIES" );

            } else if ( lPropertySet.length === 0 ) {
                lWarningMessage = msg( "NO_COMPONENTS_SELECTED" );
            }

            if ( lWarningMessage ) {
                out.markup( "<div" )
                    .attr( "class", PROPERTY_EDITOR_MESSAGE )
                    .markup( ">" );
                out.markup( "<span" )
                    .attr( "class", ICON_LARGE_WARNING )
                    .markup( ">" );
                out.markup( "<span" )
                    .attr( "class", VISUALLY_HIDDEN )
                    .markup( ">" )
                    .content( msg( "WARNING" ) )
                    .markup( "</span>" )
                    .markup( "</span>" );

                out.markup( "<p" )
                    .attr( "class", PROPERTY_EDITOR_MESSAGE_TEXT )
                    .markup( ">" )
                    .content( lWarningMessage )
                    .markup( "</p>" );
                out.markup( "</div>" );
                this.element.html( out.toString() );
                this.element.addClass( IS_EMPTY );
                return;
            }

            // if we're still here, we can remove the IS_EMPTY class
            this.element.removeClass( IS_EMPTY );

            // Build HTML
            if ( lExternalEdit ) {
                out.markup( "<div" )
                    .attr( "class", PROPERTY_EDITOR_EDIT_PARENT )
                    .markup( ">" )
                    .markup( "<button" )
                    .attr( "type", "button" )
                    .attr( "id", this.baseId + "externalEdit" )
                    .attr( "class", BUTTON + " " + BUTTON_FULL + " " + BUTTON_PRIMARY )
                    .markup( ">" )
                    .content( msg( "EDIT_COMPONENT" ) )
                    .markup( "</button>" )
                    .markup( "</div>" );
            }
            this._renderDisplayGroups( out );

            // Add HTML to page
            this.element.children().remove();
            this.element.html( out.toString() );

            /*
             * Initialize and index properties
             */
            // for each group
            for ( i = 0; i < lPropertySet.length; i++ ) {
                lProperties = lPropertySet[ i ].properties;
                // for each property
                for ( j = 0; j < lProperties.length; j++ ) {
                    lProperty = lProperties[ j ];
                    this.propMap[ lProperty.propertyName ] = lProperty;
                    this._callPropertyInit( lProperty );
                }
            }

            // Do we have to set focus to a specific property?
            if ( this.options.focusPropertyName ) {
                this.focus( this.options.focusPropertyName );
            }

        },

        getPropertyValue: function( pPropertyId ) {
            var lProperty = this._getProperty( pPropertyId ),
                lElement$ = this._getElement( lProperty ),
                lPropertyType = lProperty.metaData.type;

            return gPropertyTypes[ lPropertyType ].getValue( lElement$.closest( "div." + PROPERTY ) ); //todo change to use lElement$
        },

        updatePropertyValue: function( pPropertyId, pValue, pSuppressChange ) {

            var lOldValue, lProperty, lElement$, lPropertyType;

            debug.info( "propertyEditor updatePropertyValue: Property " + pPropertyId + " to " + pValue );

            lProperty = this._getProperty( pPropertyId );

            // Only proceed if the property currently exists ( may not, if the user has moved on to showing a different property)
            if ( lProperty ) {
                lElement$ = this._getElement( lProperty );
                lPropertyType = lProperty.metaData.type;

                lOldValue = lProperty.value;

                // Check if property value has changed, if not then we don't need to update anything
                if ( pValue !== lOldValue ) {

                    // update the widget model
                    lProperty.value = pValue;
                    lProperty.oldValue = pValue;

                    // update the dom
                    if ( pValue !== VALUE_VARIES ) {
                        gPropertyTypes[ lPropertyType ].setValue( lElement$, lProperty, pValue );
                    } else {

                        // update property, so we get all the necessary value varies state styles on the property
                        this.updateProperty( lProperty );
                    }

                    if ( !pSuppressChange ) {
                        lElement$.trigger( "change" );
                    }
                }
            }
        },

        // function that updates an entire property (for showing error display, required state, value_varies?, etc.)
        updateProperty: function( pProperty ) {
            var i, j,
                lPropertySet = this.options.data.propertySet,
                out = util.htmlBuilder();

            debug.info( "propertyEditor updateProperty: ", pProperty );

            // Update the widget model
            for ( i = 0; i < lPropertySet.length; i++ ) {
                for ( j = 0; j < lPropertySet[ i ].properties.length; j++ ) {
                    if ( lPropertySet[ i ].properties[ j ].propertyName === pProperty.propertyName ) {
                        lPropertySet[ i ].properties.splice( j, 1 );
                        lPropertySet[ i ].properties.splice( j, 0, pProperty );
                    }
                }
            }

            this._renderProperty( out, pProperty );

            // Replace entire property DIV with new property data, assumes that the main property DIV uses class PROPERTY,
            // and that only main property DIV use the class PROPERTY
            this._getElement( pProperty )
                .closest( "div." + PROPERTY )
                .replaceWith( out.toString() );

            // Call property type's destroy to ensure we clean up any handlers (although replaceWith should take care of this)
            gPropertyTypes[ pProperty.metaData.type ].destroy( this._getElement( pProperty ) );

            // Call property type's init function to re-initialise
            this._callPropertyInit( pProperty );

        },

        addProperty: function( pOptions ) {
            var i, j, k, m, lProperties, lVisibleProperties, lDisplayGroup$,
                out = util.htmlBuilder(),
                lDisplayGroupHtml = util.htmlBuilder(),
                lPropertySet = this.options.data.propertySet,
                lNewPropertyPos = 0,
                lNewDisplayGroupPos = 0,
                lDisplayGroupExists = false,
                lPropertyExists = false,
                lOptions = $.extend ( {
                    property:           {},
                    prevPropertyName:   null,   // can be null, if first property in group
                    displayGroup:       {},     // only actually need displayGroup.displayGroupId when display group exists
                    prevDisplayGroupId: null    // can be null, if first display group in pe
                }, pOptions );


            debug.info( "propertyEditor addProperty: ", lOptions );

            // establish if display group already exists:
            for ( i = 0; i < lPropertySet.length; i++ ) {
                if ( lPropertySet[ i ].displayGroupId === lOptions.property.metaData.displayGroupId ) {
                    lNewDisplayGroupPos = i;
                    lDisplayGroupExists = true;
                    break;
                }
            }

            // if display group doesn't already exist, look for previous display group and add it after (or first if no previous display group)
            if ( !lDisplayGroupExists ) {
                for ( j = 0; j < lPropertySet.length; j++ ) {
                    if ( lPropertySet[ j ].displayGroupId === lOptions.prevDisplayGroupId ) {
                        lNewDisplayGroupPos = j + 1;
                        break;
                    }
                }

                // Add display group to widget model here.
                // Note: if no previous display group, this defaults to adding at position 0
                lPropertySet.splice( lNewDisplayGroupPos, 0, lOptions.displayGroup );
            }

            // establish if property already exists
            lProperties = lPropertySet[ lNewDisplayGroupPos ].properties;
            for ( k = 0; k < lProperties.length; k++ ) {
                if ( lProperties[ k ].propertyName === lOptions.property.propertyName ) {
                    lNewPropertyPos = k;    // not really needed, because we don't do anything if property exists
                    lPropertyExists = true;
                    break;
                }
            }


            // if property does not already exist, look for previous property and add it after (or first if no previous property)
            if ( !lPropertyExists ) {
                for ( m = 0; m < lProperties.length; m++ ) {
                    if ( lProperties[ m ].propertyName === lOptions.prevPropertyName ) {
                        lNewPropertyPos = m + 1;
                        break;
                    }
                }
                // Note: If no previous property found, defaults to adding at position 0

                // first add property to the widget model
                lPropertySet[ lNewDisplayGroupPos ].properties.splice( lNewPropertyPos, 0, lOptions.property );
                // add to property map also
                this.propMap[ lOptions.property.propertyName ] = lOptions.property;

                /*
                  * Rendering
                  */

                // render display group if it doesn't yet exist
                if ( !lDisplayGroupExists ) {

                    // render display group, which already contains the new property because we updated the model
                    this._renderDisplayGroup( lDisplayGroupHtml, lOptions.displayGroup, lNewDisplayGroupPos );

                    if ( lNewDisplayGroupPos === 0 ) {
                        // if this is the first display group, prepend to the beginning of the main PE DIV
                        this.element
                            .prepend( lDisplayGroupHtml.toString() );
                    } else {
                        // if this is not the first display group, add after previous display group
                        this.element
                            .find( "div[" + DATA_GROUP_ID + "=" + util.escapeCSS( lOptions.prevDisplayGroupId ) + "]" )
                            .after( lDisplayGroupHtml.toString() );
                    }
                } else {
                    // if display group does exists, we're just dealing with the property

                    // generate new property html into out
                    this._renderProperty( out, lOptions.property );

                    // where to add the property depends on if this is the first property in a group, could be the first
                    // if either this is a new display group, or if this is the first property in an existing group
                    if ( lNewPropertyPos === 0 ) {
                        // if this is the first property in a group, add to the beginning of the property group body
                        this.element
                            .find( "div[" + DATA_GROUP_ID + "=" + util.escapeCSS( lOptions.displayGroup.displayGroupId ) + "]" )
                            .find( "div." + PROPERTY_GROUP_BODY )
                            .prepend( out.toString() );
                    } else {
                        // if this is not the first property in the group, add after previous property
                        $( "#" + this.idMap[ lOptions.prevPropertyName ] )
                            .closest( "div." + PROPERTY )
                            .after( out.toString() );
                    }

                    // When only showing common properties, the current display may actually be hidden (in the case where
                    // it doesn't contain any visible / common properties. So here we need to check if there are any visible
                    // properties and if so, make sure the display group is not set to only display on show all
                    lVisibleProperties = this._countVisibleProperties( lPropertySet[ lNewDisplayGroupPos ].properties );
                    lDisplayGroup$ = this.element.find( "div[" + DATA_GROUP_ID + "=" + util.escapeCSS( lOptions.displayGroup.displayGroupId ) + "]");
                    if ( lVisibleProperties > 0 && lDisplayGroup$.hasClass( SHOW_ALL ) ) {
                        lDisplayGroup$.removeClass( SHOW_ALL );
                    }

                }

                // initialise property
                this._callPropertyInit( lOptions.property );
            }
        },

        removeProperty: function( pPropertyName ) {
            var i, j, lProperty$, lProperty, lDisplayGroup$,
                lRemoveDisplayGroup = false,
                lPropertySet = this.options.data.propertySet,
                lPropertyRemoved = false;

            debug.info( "propertyEditor removeProperty: ", pPropertyName );

            // If we're removing the current active property, call trigger deactivate logic
            if ( this.currentPropertyName === pPropertyName ) {
                this._deactivate();
            }

            // loop through display groups
            for ( i = 0; i < lPropertySet.length; i++ ) {

                // only keep iterating if the property has not yet been removed from a display group
                if ( !lPropertyRemoved ) {

                    // determine if the display group needs to be removed also, if it only has 1 property
                    if ( lPropertySet[ i ].properties.length === 1 ) {
                        lRemoveDisplayGroup = true;
                    } else {
                        lRemoveDisplayGroup = false;
                    }

                    // loop through properties for the current display group
                    for ( j = 0; j < lPropertySet[ i ].properties.length; j++ ) {

                        // if we find the property, handle the remove
                        if ( lPropertySet[ i ].properties[ j ].propertyName === pPropertyName ) {

                            lProperty = lPropertySet[ i ].properties[ j ];
                            lProperty$ = this._getElement( lProperty );
                            lDisplayGroup$ = lProperty$.closest( "div." + PROPERTY_GROUP );

                            // nature of remove depends on whether we also want to remove the display group
                            if ( lRemoveDisplayGroup ) {

                                // if property is last in display group, remove property and display group
                                lPropertySet.splice( i, 1 );
                                lDisplayGroup$.remove();

                            } else {

                                // call property types destroy method
                                gPropertyTypes[ lProperty.metaData.type ].destroy( lProperty$ );

                                // remove property from widget model
                                lPropertySet[ i ].properties.splice( j, 1 );

                                // If there are still remaining properties in the display group, but they are not
                                // visible / common, make sure the display group is set to only display on show all
                                //lVisibleProperties = this._countVisibleProperties( lPropertySet[ i ].properties );
                                //if ( lVisibleProperties === 0 && !lDisplayGroup$.hasClass( SHOW_ALL ) ) {
                                //    lDisplayGroup$.addClass( SHOW_ALL );
                                //}

                                // now remove it
                                lProperty$
                                    .closest( "div." + PROPERTY )
                                    .remove();

                            }
                            lPropertyRemoved = true;
                            break;
                        }
                    }
                }
            }
        },

        expand: function( pGroupId ) {
            var lGroup$ = this.element.find( "div." + PROPERTY_GROUP ).filter( "[" + DATA_GROUP_ID + "=" + util.escapeCSS( pGroupId ) + "]" );
            this._expand( lGroup$ );
        },

        expandAll: function() {
            var self = this;

            this.element.find("div." + PROPERTY_GROUP ).each( function() {
                self._expand( $(this) );
            });
        },

        collapseAll: function() {
            var self = this;

            this.element.find("div." + PROPERTY_GROUP ).each( function() {
                self._collapse( $(this) );
            });
        },

        getValueVariesConstant: function() {
            return VALUE_VARIES;
        },

        setValue: function ( pElement$, pProperty, pValue ) {
            gPropertyTypes[ pProperty.metaData.type ].setValue( pElement$, pProperty, pValue );
        },
        getValue: function ( pProperty$, pProperty ) {
            return gPropertyTypes[ pProperty.metaData.type ].getValue( pProperty$ );
        },
        focus: function ( pPropertyName ) {
            var lFocusGroup$, lFocusProperty, lFocusElement$, lPropertyName;

            if ( pPropertyName ) {

                // Focus property passed
                lPropertyName = pPropertyName;
            } else {
                if ( this.currentPropertyName ) {

                    // Focus current active property
                    lPropertyName = this.currentPropertyName;
                } else {

                    // If neither property passed, or no current active property, focus on the first property
                    // in the widget model
                    lPropertyName = this.options.data.propertySet[ 0 ].properties[ 0 ].propertyName;
                }
            }
            lFocusProperty = this._getProperty( lPropertyName );
            lFocusElement$ = this._getElement( lFocusProperty );

            // check if property group is currently expanded, if not expand it
            lFocusGroup$ = lFocusElement$.closest( "div." + PROPERTY_GROUP );
            if ( !lFocusGroup$.hasClass( IS_EXPANDED ) ) {
                this._expand( lFocusGroup$ );
            }
            gPropertyTypes[ lFocusProperty.metaData.type ].setFocus( lFocusElement$, lFocusProperty );
        },

        saveProperty: function( pPropertyName ) {
            var lPropertyName,
                lProperty,
                lElement$;

            if ( pPropertyName ) {

                // If property name passed, save this property
                lPropertyName = pPropertyName;
            } else if ( this.currentPropertyName ) {

                // Otherwise check if current active property is set, and use that if so
                lPropertyName = this.currentPropertyName;
            }

            if ( lPropertyName ) {

                // If we have a property to save, trigger change event
                lProperty = this._getProperty( lPropertyName );
                lElement$ = this._getElement( lProperty );
                lElement$.trigger( "change" );
            }
        },

        goToGroup: function( pGroupId ) {
            var lPropertyId = this.element.find( "div." + PROPERTY_GROUP )
                .filter( "[" + DATA_GROUP_ID + "=" + util.escapeCSS( pGroupId ) + "]" )
                .find( "[" + DATA_PROPERTY_ID + "]" )
                .first()
                .attr( DATA_PROPERTY_ID );

            this.focus( lPropertyId );
        }

    });

    $.apex.propertyEditor.PROP_TYPE = PROP_TYPE;
    $.apex.propertyEditor.addPropertyType = addPropertyType;



})( apex.jQuery, apex.util, apex.debug, apex.locale, apex.lang );
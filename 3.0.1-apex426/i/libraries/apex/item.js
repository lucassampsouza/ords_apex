/**
 * @fileOverview
 * The {@link apex.item} namespace is used for all item related functions of Oracle Application Express.
 **/

/**
 * The APEX page item object. This will hold all single item functions. These functions assume that these are
 * APEX generated ITEMS and will make best guess at the proper functionality to apply.
 *
 * @param {DOM node | String} pNd
 * @param {Object}            pCallbacks
 *
 * @class
 **/
apex.item = function( pNd, pCallbacks ) {

    /* Check if the apex.item function was called within a constructor ( eg, using the
     * 'new' keyword), if not, we can construct it here. This allows object creation
     * without the 'new' keyword eg:
     *       var lItem = apex.item('P1_MYITEM');
     */
    if ( !( this instanceof arguments.callee ) ) {
        return new apex.item( pNd, pCallbacks );
    }

    var _self               = this;
    this.node               = false;
    this.item_type          = false;
    this.id                 = false;
    this.getValue           = getValue;
    this.init               = init;
    this.setValue           = setValue;
    this.isEmpty            = isEmpty;
    this.enable             = enable;
    this.disable            = disable;
    this.show               = show;
    this.hide               = hide;
    this.addValue           = addValue;
    this.removeValue        = removeValue;
    this.setFocus           = setFocus;
    this.setStyle           = setStyle;
    this.afterModify        = afterModify;
    this.loadingIndicator   = loadingIndicator;
    if( pCallbacks ) {
        this.callbacks = pCallbacks;
    } else {
        this.callbacks = {};
    }
    this.init( pNd, pCallbacks );
    return;

    /**
     * init function is all about ensuring the right _self.item_type is set for the node
     * _self.item_type is used in subsequent item methods to do things like set the value,
     * get the value, determine if it is empty and more.
     *
     * @instance
     * @memberOf apex.item
     * */
    function init( pNd, pCallbacks ) {
        // determine type of pNd and assign _self.node accordingly
        try{
            switch( typeof( pNd ) ){
                case 'string':
                    _self.node = apex.jQuery( "#" + apex.util.escapeCSS( pNd ), apex.gPageContext$ )[0];
                    break;
                case 'object':
                    _self.node = pNd;
                    break;
                default:
                    _self.node = false;
            }
            if( _self.node && _self.node.nodeType === 1) {
            } else {
                _self.node = false;
            }
        }catch( e ) {
            _self.node = false;
        }

        // only proceed if _self.node is not false
        if( _self.node ){
            _self.id = _self.node.id;

            // If callbacks have been provided, register them in our global store so that they can later on be used
            // if a page item is looked up.
            if ( pCallbacks ) {
                apex.page.itemCallbacks[ _self.id ] = _self.callbacks;
            } else if ( apex.page.itemCallbacks[ _self.id ] ) {
                _self.callbacks = apex.page.itemCallbacks[ _self.id ];
            }

            // continue with initilisation
            var lNodeType = _self.node.nodeName.toUpperCase();
            var lClass = _self.node.className.toUpperCase();

            // if the node is a fieldset, assign item_type as the class name
            if( lNodeType === 'FIELDSET' ) {
                _self.item_type = lClass;
                switch( lClass ) {
                    case 'CHECKBOX_GROUP':
                    case 'RADIO_GROUP':
                    case 'SHUTTLE':
                        break;
                    default:
                        _self.item_type = false;
                }

            // if node type is an input, assign item_type as the node type (CHECKBOX, RADIO, TEXT etc.)
            }else if( lNodeType === 'INPUT' ) {
                _self.item_type = _self.node.type.toUpperCase();

                // switch on item_type to ensure item_type and display_span attributes are initialised
                switch( _self.item_type ){
                    case 'CHECKBOX':
                    case 'RADIO':
                        break;
                    case 'TEXT':
                        var TEXT_TYPE = _self.node.parentNode.className.toUpperCase();
                        switch( TEXT_TYPE ){
                            case 'DATEPICKER':
                                _self.item_type = TEXT_TYPE;
                                break;
                            case 'LOV':
                                if ( apex.jQuery( '#' + _self.id + '_HIDDENVALUE', apex.gPageContext$ ).length > 0) {
                                    _self.item_type = 'POPUP_KEY_LOV';
                                } else {
                                    _self.item_type = 'POPUP_LOV';
                                }
                                break;
                        }
                        break;
                    case 'HIDDEN':
                        _self.display_span = $x( _self.id + '_DISPLAY' );
                        if( _self.display_span ){
                            _self.item_type = 'DISPLAY_SAVES_STATE';
                        }
                        break;
                    default:
                        _self.item_type = 'TEXT';
                }

            // if the node type is not a fieldset or an input, initialise item_type accordingly
            } else {
                _self.item_type = lNodeType;
                switch( _self.item_type ) {
                    case 'TEXTAREA':
                        if( _self.node.parentNode.className === 'html_editor' && _self.node.parentNode.tagName === 'FIELDSET' ) {
                            _self.item_type = 'FCKEDITOR';
                        } else {
                            try {
                                if (window.CKEDITOR && window.CKEDITOR.instances[ _self.id ] ) {
                                    _self.item_type = 'CKEDITOR3';
                                }
                            } catch( e ) {}
                        }
                        break;
                    case 'SELECT':
                        break;
                    case 'SPAN':
                        if( _self.node.className === 'display_only' ) {
                            _self.item_type = 'DISPLAY_ONLY';
                        }
                        break;
                    default:
                        _self.item_type = false;
                }
            } // end if on lNodeType
        } //end if (_self.node)
    } //end init

    /**
     * @todo documentation
     *
     * @instance
     * @memberOf apex.item
     * */
    function getValue() {
        if( !_self.node ) {
            return "";
        }
        if ( apex.jQuery.isFunction( _self.callbacks.getValue )) {
            return _self.callbacks.getValue.call( _self );
        } else {
            var oEditor, lRadio$,
                lArray = true,
                lReturn= [];
            switch( _self.item_type ) {
                case 'RADIO_GROUP':

                    // radio group should return a single value
                    lRadio$ = apex.jQuery( ':checked', _self.node );
                    if ( lRadio$.length === 0 ) {

                        // check if the length of the jQuery object is zero (nothing checked)
                        // if so return an empty string.
                        lReturn = "";
                    } else {

                        // otherwise return the value
                        lReturn = lRadio$.val();
                    }
                    break;
                case 'CHECKBOX_GROUP':
                    apex.jQuery( ':checked', _self.node ).each( function() {
                      lReturn[ lReturn.length ] = this.value;
                    });
                    break;
                case 'SELECT':
                    lReturn = apex.jQuery( _self.node ).val();
                    if ( lReturn === null || lReturn === undefined ) {
                        if ( apex.jQuery( _self.node ).attr( "multiple" ) ) {
                            lReturn = [];
                        } else {
                            lReturn = "";
                        }
                    }
                    break;
                default:
                    lArray = false;
                    break;
            }
            if( !lArray ) {
                switch( _self.item_type ) {
                    /* check single checkbox entry */
                    case 'CHECKBOX'             :lReturn = ( _self.node.checked ) ? _self.node.value : ""; break;
                    /* check single radio entry */
                    case 'RADIO'                :lReturn = ( _self.node.checked ) ? _self.node.value : ""; break;
                    case 'TEXT'                 :lReturn = _self.node.value; break;
                    case 'POPUP_LOV'            :lReturn = _self.node.value; break;
                    case 'POPUP_KEY_LOV'        :lReturn = apex.jQuery( '#' + _self.node.id + "_HIDDENVALUE", apex.gPageContext$ ).val(); break;
                    case 'DATEPICKER'           :lReturn = _self.node.value; break;
                    case 'HIDDEN'               :lReturn = _self.node.value; break;
                    case 'DISPLAY_SAVES_STATE'  :lReturn = _self.node.value; break;
                    case 'DISPLAY_ONLY'         :lReturn = _self.node.innerHTML; break;
                    case 'TEXTAREA'             :lReturn = _self.node.value; break;
                    case 'FCKEDITOR'            :
                            oEditor = FCKeditorAPI.GetInstance( _self.node.id ) ;
                            lReturn = oEditor.GetHTML();
                            break;
                    default                     :lReturn = ""; break;
                }
            }
            return lReturn;
        }
    } //end getValue

    /**
     * @todo documentation
     *
     * @instance
     * @memberOf apex.item
     * */
    function setValue( pValue, pDisplayValue, pSuppressChangeEvent ) {
        if ( apex.jQuery.isFunction( _self.callbacks.setValue )) {
            _self.callbacks.setValue.call( _self, pValue, pDisplayValue, pSuppressChangeEvent );
        } else {
            var lCheck,
                lOpts = false,
                lSelf$ = apex.jQuery( _self.node, apex.gPageContext$ );
            if( !_self.node ){
                return;
            }
            switch( _self.item_type ) {
                case 'RADIO_GROUP'      :
                    lOpts = $x_FormItems( _self.node, 'RADIO' );
                    break;
                case 'CHECKBOX_GROUP'   :
                    lOpts = $x_FormItems( _self.node, 'CHECKBOX' );
                    break;
                case 'POPUP_KEY_LOV'    :
                    // popup key lovs store there value in a hidden field
                    apex.jQuery( '#' + _self.node.id + '_HIDDENVALUE', apex.gPageContext$ ).val( pValue );
                    lSelf$.val( pDisplayValue );
                    break;
                case 'SELECT'           :
                    lOpts = _self.node.options;
                    break;
                default                 :
                    lOpts = false;
            }
            if( lOpts ) {
                for( var i = 0, len = lOpts.length; i < len; i++) {
                    lCheck = lOpts[i].value == pValue;
                    if( _self.item_type === 'RADIO_GROUP' || _self.item_type === 'CHECKBOX_GROUP' ) {
                        lOpts[ i ].checked = lCheck;
                    }else{
                        lOpts[ i ].selected = lCheck;
                    }
                }
            } else {
                switch( _self.item_type ) {
                    case 'CHECKBOX':
                    case 'RADIO':
                        if ( _self.node.value == pValue ) {
                            _self.node.checked = true;
                        }
                        break;
                    case 'TEXT':
                    case 'POPUP_LOV':
                    case 'DATEPICKER':
                    case 'PASSWORD':
                    case 'HIDDEN':
                    case 'TEXTAREA':
                        lSelf$.val( pValue );
                        break;
                    case 'DISPLAY_SAVES_STATE':
                        lSelf$.val( pValue );
                        apex.jQuery( _self.display_span, apex.gPageContext$ ).html( pValue );
                        break;
                    case 'DISPLAY_ONLY':
                        lSelf$.html( pValue );
                        break;
                    case 'FCKEDITOR':
                        var oEditor = FCKeditorAPI.GetInstance( _self.node.id );
                        oEditor.SetHTML( pValue );
                        break;
                    /**
                     * must be some other tag item set it's innerHTML
                     * */
                    default:
                        _self.node.innerHTML = pValue;
                }
            }
        }
        _self.afterModify();

        /* Only if pSuppressChangeEvent is set to true, do we not trigger the change event.
         * In the case where this is not passed, the change event is triggered (for backwards
         * compatability). Or if this is explicitly set to false, then the event will also trigger.
         */
        if ( !pSuppressChangeEvent ) {
            apex.jQuery( _self.node ).trigger( 'change' );
        }
    } //end setValue

    /**
     * Enables the form element. Checks if there is an enable callback registered for the
     * current element, if there is _self is called (setting 'this' context to current node,
     * otherwise do base enabling.
     *
     * @instance
     * @memberOf apex.item
     * */
    function enable() {
        if ( apex.jQuery.isFunction( _self.callbacks.enable )) {
            _self.callbacks.enable.call( _self );
        } else {
            apex.jQuery( _self.node )
              .removeClass( "apex_disabled" )
              .prop( "disabled", false );

            if ( $.mobile &&
                 ( _self.item_type === "TEXTAREA" ||
                 apex.jQuery.inArray( _self.node.type, [ "text", "email", "url", "tel", "search", "number", "password", "time", "date", "month", "week", "datetime", "datetime-local", "color" ]) != -1 )
                 )
            {
              apex.jQuery( _self.node ).textinput( "enable" );
            }
        }
        _self.afterModify();
    } // end enable

    /**
     * Disables the form element. Checks if there is an disable callback registered for the
     * current element, if there is _self is called (setting 'this' context to current node,
     * otherwise do base disabling.
     *
     * @instance
     * @memberOf apex.item
     * */
    function disable() {
        if ( apex.jQuery.isFunction( _self.callbacks.disable )) {
            _self.callbacks.disable.call( _self );
        } else {
            apex.jQuery( _self.node )
              .addClass( "apex_disabled" )
              .prop( "disabled", true );

            if ( $.mobile &&
                 ( _self.item_type === "TEXTAREA" ||
                 apex.jQuery.inArray( _self.node.type, [ "text", "email", "url", "tel", "search", "number", "password", "time", "date", "month", "week", "datetime", "datetime-local", "color" ]) != -1 )
                 )
            {
              apex.jQuery( _self.node ).textinput( "disable" );
            }
        }
        _self.afterModify();
    } // end disable

    /**
     * Shows the item form element. When using grid layout the #CURRENT_ITEM_CONTAINER_ID# 
     * is used in the template to identify the element to show. A grid based layout container node
     * is assumed to include both the label and the control. When using table layout the table 
     * row is shown if the pShowRow is true otherwise the form element and corresponding label
     * are shown.
     * 
     * A widget can provide a callback to override the logic for showing the form element.
     * 
     * @instance
     * @memberOf apex.item
     * @param {boolean} pShowRow Optional. If true, shows the nearest containing table row (TR). 
     * Only applicable when item is in a table layout.
     * */
    function show( pShowRow ) {
        // Note: the logic involving CONTAINER and DISPLAY suffix must be reflected in 
        // $x_Toggle so that it tests the correct node for visibility.
        var lNodeDisplay$ = apex.jQuery( '#' + _self.node.id + '_CONTAINER', apex.gPageContext$ );
        if ( lNodeDisplay$.length > 0 ) {
            lNodeDisplay$.show();
        } else {
            if ( pShowRow ) {
                $x_ItemRow( _self.node, 'SHOW' );
            } else {
                if ( apex.jQuery.isFunction( _self.callbacks.show )) {
                    _self.callbacks.show.call( _self );
                } else {
                    lNodeDisplay$ = apex.jQuery( '#' + _self.node.id + '_DISPLAY', apex.gPageContext$ );
                    if ( lNodeDisplay$.length > 0 ) {
                        lNodeDisplay$.show();
                    } else {
                        apex.jQuery( _self.node ).show().trigger("apexaftershow");
                    }
                }
                // try and show the label as well, regardless of whether callback is defined
                if ( _self.node.id ) {
                    apex.jQuery( 'label[for=' + _self.node.id + ']', apex.gPageContext$ ).show();
                }
            }
        }
    } // end show

    /**
     * Hides the item form element. When using grid layout the #CURRENT_ITEM_CONTAINER_ID# 
     * is used in the template to identify the element to hide. A grid based layout container node
     * is assumed to include both the label and the control. When using table layout the table 
     * row is hidden if the pHideRow is true otherwise the form element and corresponding label
     * are hidden.
     * 
     * A widget can provide a callback to override the logic for hiding the form element.
     * 
     * @instance
     * @memberOf apex.item
     * @param {boolean} pHideRow Optional. If true, hides the nearest containing table row (TR). 
     * Only applicable when item is in a table layout.
     * */
    function hide( pHideRow ) {
        // Note: the logic involving CONTAINER and DISPLAY suffix must be reflected in 
        // $x_Toggle so that it tests the correct node for visibility.
        var lNodeDisplay$ = apex.jQuery( '#' + _self.node.id + '_CONTAINER', apex.gPageContext$ );
        if ( lNodeDisplay$.length > 0 ) {
            lNodeDisplay$.hide();
        } else {
            if ( pHideRow ) {
                $x_ItemRow( _self.node, 'HIDE' );
            } else {
                if ( apex.jQuery.isFunction( _self.callbacks.hide )) {
                    _self.callbacks.hide.call( _self );
                } else {
                    lNodeDisplay$ = apex.jQuery( '#' + _self.node.id + '_DISPLAY', apex.gPageContext$ );
                    if ( lNodeDisplay$.length > 0 ) {
                        lNodeDisplay$.hide();
                    } else {
                        apex.jQuery( _self.node ).hide().trigger("apexafterhide");
                    }
                }
                // try and hide the label as well, regardless of whether callback is defined
                if ( _self.node.id ) {
                    apex.jQuery( 'label[for=' + _self.node.id + ']', apex.gPageContext$ ).hide();
                }
            }
        }
    } // end hide


    /**
     * Returns true or false if a form element is empty, this will consider any whitespace including a space, a tab, a form-feed,
     * as empty.
     *
     * @return {true | false}
     *
     * @instance
     * @memberOf apex.item
     * */
    function isEmpty() {
        var lItemValue, re, lThis, lOpts, lReturn, lNullValueList,
            lNullValue = "";

        lItemValue = _self.getValue(); //does the heavy lifting!

        // Make life easier and always use a string for all compare operations! $v doesn't work in this context
        if ( apex.jQuery.isArray( lItemValue ) ) {
            lItemValue = lItemValue.join( ':' );
        } else {
            lItemValue = "" + lItemValue;
        }

        re = /^\s{1,}$/g; //match any white space including space, tab, form-feed, etc.
        lThis = $x( _self.node );
        lOpts = false;

        /* Different item types will be tested for 'is empty' in different ways:
         *
         *  Case 1: text input, textareas will return true if they are null or they match any white space
         *  Case 2: multi select lists return true if they have no options selected or the current value equals the null value (not sure whether this should include null value)
         *  Case 3: all select list will ONLY return true if their current value equals the matching value in the apex.nullmap array
         *  Case 4: display only no state will return true if the span's innerHTML is empty
         *  Case 5: display only save state will return true if the relevant input's value is empty
         *  Case 6: popup lov returns true if null
         *  Case 7: popup key lov returns true if null
         *  Case 8: shuttles will return true by having no options in the right hand select element
         *  Case 9: checkboxes will return true if no checkboxes in the page item's group are checked
         * Case 10: radio groups will return true if no radio buttons in the page item's group are selected
         * Case 11: list managers will return true by having no options in the element
         * Case 12: popup color pickers will return true if no color is specified
         * Case 13: popup date pickers will return true if no date is specified
         * Case 14: FCKEditor will return null if the iFrame content is empty
         * Case 15: CKEditor will return null if the iFrame content is empty
         *
         */

        if ( 'nullValue' in _self.callbacks ) {
            if ( apex.jQuery.isFunction( _self.callbacks.nullValue )) {
                return _self.callbacks.nullValue.call( _self );
            } else {
                // basic comparison
                return ( ( lItemValue.length === 0 ) || ( lItemValue === null ) || ( lItemValue === _self.callbacks.nullValue ) || ( ( lItemValue.search( re ) ) > -1 ) )?true:false;
            }
        } else {
            if ( _self.item_type === 'SELECT' ){
                if ( apex.widget && apex.widget.report && apex.widget.report.tabular && apex.widget.report.tabular.gNullValueList ) {
                    apex.jQuery.each( apex.widget.report.tabular.gNullValueList, function( pId, pValue ) {
                        if ( this.name === lThis.name ) {
                            lNullValue = pValue.value;
                            return false;
                        }
                    });
                }
                if ( lThis.multiple ) {
                    lReturn = ( lItemValue.length===0 ) || ( lItemValue === lNullValue );   //case 2
                }else{
                    lReturn = ( lNullValue || lNullValue === "" ) ? ( lItemValue === lNullValue ):false;           //case 3
                }
            } else {
                lReturn = ( ( lItemValue.length === 0 ) || ( lItemValue === null ) || ( ( lItemValue.search( re ) ) > -1) )?true:false;    //case 1,4,5,6,7,9,10,11,12,13,14,15 (exp 2 or 3)
                                                                                                                                           //case 8 (exp 1)
            }
            return lReturn;
        }
    } // end isEmpty

    /**
     * @TODO Add documentation
     *
     * @instance
     * @memberOf apex.item
     * */
    function addValue( pValue ) {
        if ( apex.jQuery.isFunction( _self.callbacks.addValue )) {
            _self.callbacks.addValue.call( _self, pValue );
        } else {
            alert( "No default handling defined for addValue" );
        }
        _self.afterModify();
    } // end addValue

    /**
     * @TODO Add documentation
     *
     * @instance
     * @memberOf apex.item
     * */
    function removeValue() {
        if ( apex.jQuery.isFunction( _self.callbacks.removeValue )) {
            _self.callbacks.removeValue.call( _self );
        } else {
            alert( "No default handling defined for removeValue" );
        }
        _self.afterModify();
    } // end removeValue

   /**
     * @TODO Add documentation
     *
     * @instance
     * @memberOf apex.item
     * */
    function setFocus() {
        var lSetFocusTo$;
        if ( 'setFocusTo' in _self.callbacks ) {
            if ( apex.jQuery.isFunction( _self.callbacks.setFocusTo ) ) {

                // setFocusTo can be a function
                lSetFocusTo$ = _self.callbacks.setFocusTo.call ( _self );
            } else {

                // If not a function, setFocusTo can be either a DOM object, jQuery selector or jQuery object
                lSetFocusTo$ = apex.jQuery( _self.callbacks.setFocusTo );
            }
        } else {

            // Default handling is to use the element with the ID of the page item
            lSetFocusTo$ = apex.jQuery( "#" + _self.id, apex.gPageContext$ );
        }
        lSetFocusTo$.focus();
    } // end setFocus


    /**
     * @TODO Add documentation
     *
     * @instance
     * @memberOf apex.item
     * */
    function setStyle( pPropertyName, pPropertyValue ) {
        var lSetStyleTo$;
        if ( 'setStyleTo' in _self.callbacks ) {
            if ( apex.jQuery.isFunction( _self.callbacks.setStyleTo ) ) {

                // setStyleTo can be a function
                lSetStyleTo$ = _self.callbacks.setStyleTo.call ( _self );
            } else {

                // If not a function, setStyleTo can be either a DOM object, jQuery selector or jQuery object
                lSetStyleTo$ = apex.jQuery( _self.callbacks.setStyleTo );
            }
        } else {

            // Default handling is to use the element with the ID of the page item
            lSetStyleTo$ = apex.jQuery( "#" + _self.id, apex.gPageContext$ );
        }
        lSetStyleTo$.css( pPropertyName, pPropertyValue );
        _self.afterModify();
    } // end setStyle


   /**
     * @TODO Add documentation
     *
     * @instance
     * @memberOf apex.item
     * */
    function afterModify() {
        /* Some frameworks need to get notified if widgets are modified */
        if ( apex.jQuery.isFunction( _self.callbacks.afterModify )) {
            _self.callbacks.afterModify.call( _self );
        }
    } // end afterModify

    /**
     * @TODO Add documentation
     *
     * @instance
     * @memberOf apex.item
     * */
    function loadingIndicator( pLoadingIndicator$ ) {
        var lLoadingIndicator$;
        if ( 'loadingIndicator' in _self.callbacks ) {
            if ( apex.jQuery.isFunction( _self.callbacks.loadingIndicator )) {

                // loadingIndicator currently just supports a function currently.
                // The function receives the loading indicator span as 1st argument
                // and must return the created jQuery object.
                lLoadingIndicator$ = _self.callbacks.loadingIndicator.call( _self, pLoadingIndicator$ );
            }
        }
        return lLoadingIndicator$;
    } // loadingIndicator
};

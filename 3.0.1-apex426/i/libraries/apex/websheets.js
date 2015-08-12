/*
 * JavaScript code for Websheet applications in Oracle Application Express
 * Copyright (c) 2012, 2015, Oracle and/or its affiliates. All rights reserved.
 **/



function ws_Spreadsheet (pThis, pOptions) {

    function msg( pKey ) {
        return apex.lang.getMessage( pKey );
    }

    var gRegion$,
        that                    = this,
        gOptions                = pOptions,
        gCurrentPage            = $( "#pFlowStepId" ).val(),
        gHasManageMenu          = ( gCurrentPage === "2" || gCurrentPage === "3000" ),
        gIsDataGridPage         = ( gCurrentPage === "2" ),
        gIsDataGridDetailPage   = ( gCurrentPage === "20" );

    if ( gOptions && gOptions.regionId ) {
        gRegion$ = $( "#" + gOptions.regionId, apex.gPageContext$ );
    }

    this.spreadsheet_id = ( pThis ) ? pThis : false;
    this.currentRow     = false;
    this.classArray     = false;
    this.currentCell    = false;
    this.currentForm    = false;
    this.currentCol     = false;
    this.currentColType = false;

    var MSG = {
        BUTTON: {
             CANCEL: msg( "CANCEL" ),
             DELETE: msg( "DELETE" ),
             APPLY : msg( "APPLY" ),
             COPY  : msg( "COPY" )
        },
        DIALOG_TITLE: {
            PROPERTIES       : msg( "DATA_GRID_PROPERTIES" ),
            ADD_COLUMN       : msg( "ADD_COLUMN" ),
            COLUMN_PROPERTIES: msg( "COLUMN_PROPERTIES" ),
            LOV              : msg( "LIST_OF_VALUES" ),
            COLUMN_GROUPS    : msg( "COLUMN_GROUPS" ),
            VALIDATION       : msg( "VALIDATION" ),
            DELETE_COLUMNS   : msg( "DELETE_COLUMNS" ),
            SET_COLUMN_VALUES: msg( "SET_COLUMN_VALUES" ),
            REPLACE          : msg( "REPLACE" ),
            FILL             : msg( "FILL" ),
            DELETE_ROWS      : msg( "DELETE_ROWS" ),
            COPY_DATA_GRID   : msg( "COPY_DATA_GRID" ),
            DELETE_DATA_GRID : msg( "DELETE_DATA_GRID" ),
            ADD_FILE         : msg( "ADD_FILE" ),
            ADD_NOTE         : msg( "ADD_NOTE" ),
            ADD_LINK         : msg( "ADD_LINK" ),
            ADD_TAGS         : msg( "ADD_TAGS" )
        }
    };


    /*
     * Public methods
     */
    this.closeUpload = function() {
        $x('P20_X').name = 'p_t01';
        $x_Remove('actionsMenu');
        that.row($v('apexir_current_row'));
        $('#wwvFlowForm').removeAttr('target');
    };

    this.actions = function(pAction,pThis) {
        var lRequest;
        if( gIsDataGridDetailPage ){
            if(pAction == 'ATTACHMENT_SAVE'){
                $x('P20_X').name = 'p_ignore_10';
                $x('apexir_FILE').name = 'p_t01';
                $s('P20_DESC',$v('apexir_DESCRIPTION'));
                $x('apexir_DIALOG_MESSAGE').innerHTML = '<img src="/i/processing3.gif" /><iframe name="myNewWin" id="myNewWin" height="100" width="20" style="display:none;" src="/i/processing3.gif"></iframe>';
                $x('wwvFlowForm').target = 'myNewWin';
                var a = window.setTimeout(function(){apex.submit('ATTACHMENT');},500);
            }else{
                lRequest = new apex.ajax.ondemand('websheet_detail', function() {
                        /* start the return function */
                        var l_s = p.readyState;
                        if(l_s == 1){
                        }else if(l_s == 2){
                        }else if(l_s == 3){
                        }else if(l_s == 4){
                            _return(p,pAction);
                            _busyGraphic(l_s);
                        }else{return false;}
                        /* end the return function */
                    }
                );
                _busyGraphic(1);
                (!!pThis)?lRequest.ajax.addParam('p_widget_action_mod',pThis):null;
                _callAction( lRequest, pAction );
            }
        }else{
            lRequest = new apex.ajax.ondemand('websheet', function() {
                    /* start the return function */
                    var l_s = p.readyState;
                    if(l_s == 1){
                    }else if(l_s == 2){
                    }else if(l_s == 3){
                    }else if(l_s == 4){
                        _return(p,pAction);
                        _busyGraphic(l_s);
                    }else{return false;}
                    /* end the return function */
                }
            );
            _busyGraphic(1);
            _callAction( lRequest, pAction );
        }
    };

    /*
     * Calls all Dialogs
     *
     * */
    this.dialog = function(pDialog,p_X01,p_X02) {
        var lRequest = new apex.ajax.ondemand('DIALOG', function() {
            var l_s = p.readyState;
            if(l_s == 1){
            }else if(l_s == 2){
            }else if(l_s == 3){
            }else if(l_s == 4){
                var gReturn = p.responseText;
                if(pDialog == 'LOV_TEXT'){
                    $s('apexir_LOV_ENTRIES',gReturn);
                }else{

                    /* base init's for dialog returns calls */
                    // remove help dialog, if shown
                    if ($('#apex_popup_field_help').dialog('isOpen')) {
                        $('#apex_popup_field_help').dialog('close');
                    }
                    $( "#a-IRR-dialog-js", apex.gPageContext$ ).html( gReturn );
                    _openDialog( pDialog );

                    /* check for shuttle and init, change this to look for shuttle class in dialog */
                    if($x('apexir_SHUTTLE_LEFT')){
                        window.g_Shuttlep_v01 = new dhtml_ShuttleObject('apexir_SHUTTLE_LEFT','apexir_SHUTTLE_RIGHT');
                    }

                    /* custom init code for different dialogs*/
                    if(pDialog == 'NOTIFY'){
                        $('#apexir_NOTIFY_INTERVAL').change(function(){$f_Hide_On_Value_Item(this, 'apexir_DATEPICKERS', 'I')}).change();
                    }

                    // focus on first input field of drop panel, if any form fields exist within a drop panel
                    var $lDropFields = $(':input:visible', $( "#a-IRR-dialog-js", apex.gPageContext$ ) );
                    if ($lDropFields.length > 0) {
                        $lDropFields[0].focus();
                    }
                }
                _busyGraphic(l_s);
            }else{
                return false;
            }
            /* end the return function */
        });
        _busyGraphic(1);
        lRequest.ajax.AddNameValue('DIALOG', pDialog);
        lRequest.ajax.AddNameValue('VALUE',  p_X01);
        lRequest.ajax.AddNameValue('VALUE2', p_X02);
        if( gIsDataGridDetailPage ){
            lRequest.ajax.AddNameValue('MODE','DETAIL');
        }
        lRequest._get();
    };

    this.collectCheckedRows = function(pThis) {
        $f_CheckFirstColumn(pThis);
        that.actions('save_checked');
    };

    this.selectTest = function( pThis ) {
        switch( $v( pThis ) ) {
            case'NEW':
                $x_Show('apexir_LOV_ATTRIBUTES');
                break;
            case'':
                $x_Hide('apexir_LOV_ATTRIBUTES');
                break;
            case'NEW_CURRENT_VALUES':
                $x_Hide('apexir_LOV_ATTRIBUTES');
                break;
            default:
                that.dialog('LOV_TEXT',$v(pThis));
                $s('apexir_LOV_NAME',$f_SelectedOptions(pThis).text);
                $x_Show('apexir_LOV_ATTRIBUTES');
                break;
        }
    };

    this.row = function( pRowId, pAction ) {
        var $lContainer, $lSingleEls, $lCompoundEls, $lAllEls, get, i,
            lArray = [];
        _busyGraphic(1);
        get = new htmldb_Get(null, $v('pFlowId'), 'APPLICATION_PROCESS=ITEM_ROW', gCurrentPage );
        get.add('GOTO_WORKSHEET_ROW', pRowId, 50);
        if ( pAction !== undefined ) {
            get.addParam('x01', pAction);
        } else {
            get.addParam('x01', "");
        }
        $lContainer = $('#row')[0];
        $lSingleEls = $('input:text,input:hidden,textarea,select', $lContainer);
        $lCompoundEls = $(':radio:checked', $lContainer);
        $lAllEls = $($lSingleEls).add($lCompoundEls);

        for (i=0; i < $lAllEls.length; i++) {
            lArray[0] = $($lAllEls)[i];
            get.AddArrayItems(lArray, parseInt($(lArray[0]).attr('name').substr(1),10));
        }
        get.GetAsync( function(p) {
            var lReturn, lErrFlag, lErrMsg,
                l_s = p.readyState;
            if(l_s == 1){
            }else if(l_s == 2){
            }else if(l_s == 3){
            }else if(l_s == 4){
                lReturn = p.responseText;
                lErrFlag = (lReturn.substr(0, 5) === 'error');

                // Removed the message that could have been displayed by full page refresh validation failure
                $x_Remove('MESSAGE');
                if (lErrFlag) {
                    lErrMsg = lReturn.substr(6);
                    $('#ajaxMESSAGE').show();
                    $('#theMESSAGE').html(lErrMsg);
                } else {
                    $('#ajaxMESSAGE').hide();
                    $('#drop').html(lReturn);
                }
                _busyGraphic(l_s);
            }else{
                return false;
            }
        });
        _closeDialog();
        get = null;
    };



    /*
     * Private methods
     */
    function _busyGraphic( pState ) {
        if(pState == 1){
            $x_Show('apexir_LOADER');
        }else{
            $x_Hide('apexir_LOADER');
            // Reinitialized Websheet UI after page refresh
            reInitWS();
        }
    }

    function _initDataGrid() {
        $('div.edit:not(div.readonly)',$('#'+that.spreadsheet_id)[0])
            .unbind('click')
            .click(function( event ) {
                _cellInit( this, event );
            });
    }

    function _initMenus() {

        var manageMenu = {
            items: [
                { type: "action", label: msg( "PROPERTIES" ), hide: true, icon: "icon-irr-ws-properties", action: function () {
                    that.dialog("WEBSHEET");
                } },
                { type: "action", label: msg( "TOGGLE_CHECKBOXES" ), hide: true, icon: "icon-irr-ws-toggle-checkboxes", action: function () {
                    that.actions('toggle_checkboxes');
                } },
                { type: "separator" },
                { type: "subMenu", label: msg( "COLUMNS" ), hide: true, icon: "icon-irr-ws-col", menu: { items: [
                    { type: "action", label: msg( "ADD" ), icon: "icon-irr-ws-col-add",  action: function () {
                        that.dialog("ADD_COLUMN");
                    } },
                    { type: "action", label: msg( "COLUMN_PROPERTIES" ), icon: "icon-irr-ws-col-pros", action: function () {
                        that.dialog("COLUMN_PROPERTIES");
                    } },
                    { type: "action", label: msg( "LIST_OF_VALUES" ), icon: "icon-irr-ws-lov", action: function () {
                        that.dialog("LOV");
                    } },
                    { type: "action", label: msg( "COLUMN_GROUPS" ), icon: "icon-irr-ws-col-groups", action: function () {
                        that.dialog("GROUP");
                    } },
                    { type: "action", label: msg( "VALIDATION" ), icon: "icon-irr-ws-validation", action: function () {
                        that.dialog("VALIDATION");
                    } },
                    { type: "action", label: msg( "DELETE_COLUMNS" ), icon: "icon-irr-ws-col-delete", action: function () {
                        that.dialog("REMOVE_COLUMN");
                    } }
                ]}
                },
                { type: "subMenu", label: msg( "ROWS" ), hide: true, icon: "icon-irr-ws-row", menu: { items: [
                    { type: "action", label: msg( "ADD_ROW" ), icon: "icon-irr-ws-col-add", action: function () {
                        apex.navigation.redirect(apex.util.makeApplicationUrl({pageId:"20",debug: "NO", clearCache: "20",
                            itemNames:["WS_APP_ID", "P20_IR_ID", "P20_DATA_GRID_ID", "CURRENT_WORKSHEET_ROW"],
                            itemValues:[gOptions.wsAppId, that.spreadsheet_id, gOptions.dataGridId, ""]
                        }));
                    } },
                    { type: "action", label: msg( "SET_COLUMN_VALUES" ), icon: "icon-irr-ws-col-values", action: function () {
                        that.dialog("SET_COLUMN_VALUE");
                    } },
                    { type: "action", label: msg( "REPLACE" ), icon: "icon-irr-ws-row-replace", action: function () {
                        that.dialog("REPLACE");
                    } },
                    { type: "action", label: msg( "FILL" ), icon: "icon-irr-ws-row-fill", action: function () {
                        that.dialog("FILL");
                    } },
                    { type: "action", label: msg( "DELETE_ROWS" ), icon: "icon-irr-ws-row-delete", action: function () {
                        that.dialog("DELETE_ROWS");
                    } }
                ]}
                },
                { type: "action", label: msg( "DELETE_DATA_GRID" ), hide: true, icon: "icon-irr-ws-dg-delete", action: function () {
                    that.dialog("DELETE");
                } },
                { type: "separator" },
                { type: "action", label: msg( "COPY" ), hide: true, icon: "icon-irr-ws-copy", action: function () {
                    that.dialog("COPY");
                } },
                { type: "action", label: msg( "HISTORY" ), icon: "icon-irr-ws-history", action: function () {
                    apex.navigation.redirect(apex.util.makeApplicationUrl({pageId:"14",debug: "NO"}));
                } }
            ],
            beforeOpen: function(event, menu) {
                var i,
                    items = menu.menu.items;
                for (i = 0; i < 8; i++) {
                    items[i].hide = !gOptions.currentUserIsNotReader;
                }
            }
        };
        if (gOptions.websheetManageDatagridMenu) {
            $("#apexir_WEBSHEETMENU").menu( manageMenu );
        }

        var manageReportMenu = {
            items: [
                { type: "action", label: msg( "EDIT_ATTRIBUTES" ), action: function () {
                    apex.navigation.redirect(apex.util.makeApplicationUrl({pageId:"3010",debug: "NO", clearCache: "3010",
                        itemNames:["p3010_worksheet_id", "p3030_worksheet_id"],
                        itemValues:[that.spreadsheet_id, that.spreadsheet_id]
                    }));
                } },
                { type: "action", label: msg( "EDIT_QUERY" ), action: function () {
                    apex.navigation.redirect(apex.util.makeApplicationUrl({pageId:"3030",debug: "NO", clearCache: "3030",
                        itemNames:["p3010_worksheet_id", "p3030_worksheet_id"],
                        itemValues:[that.spreadsheet_id, that.spreadsheet_id]
                    }));
                } }
            ]
        };

        if (gOptions.websheetManageReportMenu && gOptions.currentUserIsNotReader) {
            $("#apexir_WEBSHEETMENU").menu( manageReportMenu );
        }
    }

    // collect all checkboxes in the data area. Skip anything that doesn't have an ID.
    function _collectChecks() {
        var lReturn = [];
        var lSelect = $x_FormItems( that.spreadsheet_id, 'CHECKBOX' );
        for(var i=0,l=lSelect.length;i<l;i++){
            if(lSelect[i].checked && lSelect[i].id){
                lReturn[lReturn.length]=lSelect[i].value;
            }
        }
        return lReturn;
    }

    /**
     * This function is the central control to display modal dialog
     * @function
     */
    function _openDialog( pDialog ) {
        var lWSDlg$, lTitle, lId,
            lButtons = [{
                text  : MSG.BUTTON.CANCEL,
                click : function() {
                    lWSDlg$.dialog( "close" );
                }
        }];

        function _displayButton(pAction, pLabel, pHot, pClose ) {
            var lLabel, lStyle;

            if ( pLabel ) {
                lLabel = pLabel;
            } else {
                lLabel = MSG.BUTTON.APPLY;
            }
            if ( pHot ) {
                lStyle = 'ui-button--hot';
            }
            lButtons.push({
                text  : lLabel,
                class : lStyle,
                click : function() {
                    that.actions( pAction  );
                    if ( pClose ) {
                        lWSDlg$.dialog( "close" );
                    }
                }
            });
        }

        if ( pDialog==='WEBSHEET' ) {
            lTitle = MSG.DIALOG_TITLE.PROPERTIES;
            _displayButton( 'websheet_properties_save', null, true, false );
        } else if ( pDialog==='ADD_COLUMN' ) {
            lTitle = MSG.DIALOG_TITLE.ADD_COLUMN;
            _displayButton( 'column_add', null, true, false );
        } else if ( pDialog==='COLUMN_PROPERTIES' ) {
            lTitle = MSG.DIALOG_TITLE.COLUMN_PROPERTIES;
            _displayButton( 'column_properties_save', null, true, false );
        } else if ( pDialog==='LOV' ) {
            lTitle = MSG.DIALOG_TITLE.LOV;
            lId = apex.item( "apexir_LOV_ID" ).getValue();
            if ( lId ) {
                _displayButton( 'lov_delete', MSG.BUTTON.DELETE, false, false );
            }
            _displayButton( 'lov_save', null, true, false );
        } else if ( pDialog==='GROUP' || pDialog==='GROUP2' ) {
            lTitle = MSG.DIALOG_TITLE.COLUMN_GROUPS;
            lId = apex.item( "apexir_GROUP_ID" ).getValue();
            if ( lId ) {
                _displayButton( 'column_groups_delete', MSG.BUTTON.DELETE, false, false );
            }
            _displayButton( 'column_groups_save', null, true, false );
        } else if ( pDialog==='VALIDATION' ) {
            lTitle = MSG.DIALOG_TITLE.VALIDATION;
            lId = apex.item( "apexir_VALIDATION_ID" ).getValue();
            if ( lId ) {
                _displayButton( 'VALIDATION_DELETE', MSG.BUTTON.DELETE, false, false );
            }
            _displayButton( 'VALIDATION_SAVE', null, true, false );
        } else if ( pDialog==='REMOVE_COLUMN' ) {
            lTitle = MSG.DIALOG_TITLE.DELETE_COLUMNS;
            _displayButton( 'column_remove', MSG.BUTTON.DELETE, true, false );
        } else if ( pDialog==='SET_COLUMN_VALUE' ) {
            lTitle = MSG.DIALOG_TITLE.SET_COLUMN_VALUES;
            _displayButton( 'set_column_value', null, true, false );
        } else if ( pDialog==='REPLACE' ) {
            lTitle = MSG.DIALOG_TITLE.REPLACE;
            _displayButton( 'replace_column_value', null, true, false );
        } else if ( pDialog==='FILL' ) {
            lTitle = MSG.DIALOG_TITLE.FILL;
            _displayButton( 'fill_column_value', null, true, false );
        } else if ( pDialog==='DELETE_ROWS' ) {
            lTitle = MSG.DIALOG_TITLE.DELETE_ROWS;
            _displayButton( 'delete_rows', MSG.BUTTON.DELETE, true, false );
        } else if ( pDialog==='COPY' ) {
            lTitle = MSG.DIALOG_TITLE.COPY_DATA_GRID;
            _displayButton( 'copy', MSG.BUTTON.COPY, true, false );
        } else if ( pDialog==='DELETE' ) {
            lTitle = MSG.DIALOG_TITLE.DELETE_DATA_GRID;
            _displayButton( 'delete_websheet', MSG.BUTTON.DELETE, true, false );
        } else if ( pDialog==='ATTACHMENT' ) {
            lTitle = MSG.DIALOG_TITLE.ADD_FILE;
            _displayButton( 'ATTACHMENT_SAVE', null, true, true );
        } else if ( pDialog==='NOTE' ) {
            lTitle = MSG.DIALOG_TITLE.ADD_NOTE;
            _displayButton( 'NOTE_SAVE', null, true, false );
        } else if ( pDialog==='LINK' ) {
            lTitle = MSG.DIALOG_TITLE.ADD_LINK;
            _displayButton( 'LINK_SAVE', null, true, false );
        } else if ( pDialog==='TAGS' ) {
            lTitle = MSG.DIALOG_TITLE.ADD_TAGS;
            _displayButton( 'TAG_SAVE', null, true, false );
        }

        lWSDlg$ = $( "#a-IRR-dialog-js", apex.gPageContext$ ).dialog({
            modal      : true,
            dialogClass: "a-IRR-dialog",
            width      : "auto",
            height     : "auto",
            minWidth   : "360",
            title      : lTitle,
            buttons    : lButtons,
            close      : function() {
                lWSDlg$.dialog( "destroy");
            }
        });
    }

    function _closeDialog() {
        if ( $( "#a-IRR-dialog-js", apex.gPageContext$ ).dialog( "isOpen" ) ) {
            $( "#a-IRR-dialog-js", apex.gPageContext$ ).dialog( "close" );
        }
    }

    function _cellSave( e, pThis ) {
        var lEl;
        if( that.currentValue != pThis.value || $( pThis ).hasClass( 'apex-tabular-form-error' ) ) {
            that.currentValue = $v( pThis );

            var get = new htmldb_Get(null, $v('pFlowId'),'APPLICATION_PROCESS=CELL', gCurrentPage );
            get.AddNameValue('ACTION', 'SAVE');
            get.AddNameValue('ROW', that.currentRow.id.substring(3));
            get.AddNameValue('COLUMN', that.currentCol);
            get.AddNameValue('VALUE', pThis.value);
            get.AddNameValue('CHANGE', $(that.currentRow).attr("apex:c"));
            var lReturn = get.get();

            if (lReturn != 'true'){
                lEl = $(pThis);
                lEl.addClass('apex-tabular-form-error');
                $("#ajaxMESSAGE").show();
                $("#theMESSAGE").html(lReturn);
                pThis.focus();
                if ( that.currentColType === 'date' ) {
                    lEl.datepicker('show');
                }
            } else {
                lEl = $(that.currentRow);
                lEl.attr("apex:c",(parseInt(lEl.attr("apex:c"))+1));
                var c = $(pThis);
                c.removeClass('apex-tabular-form-error');
                $("#ajaxMESSAGE").hide();
                _reset();
            }
            get = null;

        }else{
            _reset();
        }
    }

    /*
     This function takes care of all AJAX returns at the report level,
     use this to enforce specific actions based on return value and action being fired
     */
    function _return(p, pAction) {
        if ( gIsDataGridDetailPage ) {
            /* if on the detail page automatically call detail specific return*/
            if (p.responseText == 'true') {
                /* Pull current detail row */
                $x_Remove('actionsMenu');
                that.row($v('apexir_current_row'), pAction);
            } else {
                /*Show error message in dialogue box*/
                $s('apexir_DIALOG_MESSAGE',p.responseText);
                $x_Show('apexir_DIALOG_MESSAGE');
            }
        } else {
            if (p.responseText == 'true') {
                if (pAction == 'delete_websheet') {
                    document.location = 'f?p='+$v('pFlowId')+':902:'+$v('pInstance')+'::NO:::';
                } else if(pAction == 'save_checked') {
                } else {
                    /*Pull report*/
                    if ( pAction != 'toggle_checkboxes') {
                        _closeDialog();
                    }
                    gRegion$.trigger( "apexrefresh" );
                }
            } else {
                /*Show error message in dialogue box*/
                $s('apexir_DIALOG_MESSAGE',p.responseText);
                $x_Show('apexir_DIALOG_MESSAGE');
            }
        }
    }

    function _callAction( pAjax, pAction ) {
        (!!pAction)?pAjax.ajax.addParam('p_widget_action',pAction):null;
        switch( pAction ) {
            case 'set_geocode':
                pAjax.ajax.addParam('x01',$v('apexir_SHUTTLE_RIGHT'));
                break;
            case 'reset_geocode':
                break;
            default:
                if(pAction == 'delete_rows' || pAction == 'set_column_value' || pAction == 'replace_column_value'){
                    pAjax.ajax.addParam('x01',$u_ArrayToString(_collectChecks(),':'));
                }
                if(pAction == 'column_groups_save'){
                    $('#apexir_SHUTTLE_RIGHT option').prop('selected', true);
                }
                if( gIsDataGridDetailPage ) {
                    pAjax.ajax.addParam('x03','DETAIL');
                }
                pAjax.ajax.AddArrayItems2($x_FormItems('a-IRR-dialog-js'),1);
                break;
        }
        pAjax._get();
    }

    /*
     *  Intitiates all editable controls in the data grid
     *  pThis - The div container element for the cell
     *  pEvent - The click event object, passed from the handler
     */
    function _cellInit(pThis, pEvent) {
        var lCell$, lWidth, lValue, lTextEl$,$lTextAreaEl, lRequest;
        _reset();
        that.currentRow = pThis.parentNode.parentNode;
        that.currentCell = pThis;
        that.classArray = pThis.className.split(" ");
        that.currentCol = that.classArray[0];
        that.currentColTest = !isNaN(that.currentCol.substring(1));
        that.currentColType = that.classArray[1];
        that.currentColMaxLength = that.classArray[3];

        // Store div container element in local variable, and unbind the click handler
        lCell$ = $(pThis).unbind("click");
        if(that.currentColType == 'text' && that.currentColTest){

            // Get the current computer width (includes padding and border) for the table td
            lWidth = $(pThis.parentNode).outerWidth();

            // Get the current value
            lValue = lCell$.text();

            // Clear the value from the cell and set the style padding to zero
            lCell$
                .html('')
                .css('padding','0');

            // Create a dom input as a child of the main div, with a value of the current value
            lTextEl$ = $($dom_AddInput(pThis, 'TEXT', '', '', lValue));

            // Set css width, event handler to handle the save when focus is lost and set focus
            lTextEl$
                .css('width', lWidth)
                .attr('maxlength', that.currentColMaxLength)
                .blur(function(e) {
                    _cellSave( e, this );
                })
                .keypress(function(e) {
                    if (e.which==13) {
                        return false;
                    }
                })
                .focus();

            that.currentForm = lTextEl$[0];
            that.currentValue = lValue;
        } else if (that.currentColType == 'textarea' && that.currentColTest) {
            lValue = lCell$.html();

            // Clear the value from the cell and set the style padding to zero
            lCell$
                .html('')
                .css('padding','0');

            // Create a dom textarea as a child of the main div, with a value of the current value
            $lTextAreaEl = $($dom_AddTag(pThis,'TEXTAREA'));

            // Set the css properties, value, event handler to handle the save when focus is
            // lost and set focus
            $lTextAreaEl
                .css('width','100%')
                .val(lValue)
                .attr('maxlength', that.currentColMaxLength)
                .blur(function(e) {
                    _cellSave( e, this );
                })
                .focus();
            that.currentForm = $lTextAreaEl[0];
            that.currentValue = lValue;
        } else if (that.currentColType == 'date' && that.currentColTest) {

            // Get the current computer width (includes padding and border) for the table td
            lWidth = $(pThis.parentNode).outerWidth();

            // Get the current value
            lValue = lCell$.text();
            lCell$
                .html('')
                .css('padding','0');

            // Create a dom input as a child of the main div, with a value of the current value
            lTextEl$ = $($dom_AddInput(pThis, 'TEXT', 'theCal', '', lValue));
            lTextEl$.css('width', lWidth);
            that.currentForm = lTextEl$[0];
            that.currentValue = lValue;

            //get the date format
            lRequest = new apex.ajax.ondemand('get_dtFmt', function() {
                var l_s = p.readyState;
                if(l_s == 1){
                }else if(l_s == 2){
                }else if(l_s == 3){
                }else if(l_s == 4){
                    var myObject = apex.jQuery.parseJSON( p.responseText );
                    apex.widget.datepicker(
                        "#theCal",
                        {
                            buttonText      : 'Calendar',
                            showTime        : myObject.showTime,
                            time24h         : myObject.time24h,
                            timeFormat      : myObject.timeFormat,
                            defHour         : myObject.defHour,
                            defMinute       : myObject.defMinute,
                            defAmpm         : myObject.defAmpm,
                            defaultDate     : apex.util.getDateFromISO8601String( myObject.defaultDate ),
                            showOn          : 'focus',
                            showAnim        : 'drop',
                            showOtherMonths : false,
                            changeMonth     : false,
                            changeYear      : false,
                            onClose         : function(dateText, inst) {
                                _cellSave( null, this );
                            }
                        },
                        myObject.dtFmt,
                        myObject.lang
                    );
                    // Important to set the focus, as this activates the datepicker
                    lTextEl$.focus();
                    _busyGraphic(l_s);
                } else {
                    return false;
                }
            });
            _busyGraphic(1);
            lRequest.ajax.AddNameValue('COLUMN', that.currentCol);
            lRequest.ajax.AddNameValue('DATE', lValue);
            lRequest._get();
        } else if (that.currentColType == 'selectlist' && that.currentColTest) {
            lValue = lCell$.text();
            $s( that.currentCell, "" );
            apex.server.process( "GET_LOV_JSON", {
                x01: that.spreadsheet_id,
                x02: that.currentCol
            }, {
                dataType: "html",
                success: function( pData ) {
                    var lBuild = new $d_LOV_from_JSON();
                    lBuild.l_Type = "SELECT";
                    lBuild.create( lCell$.parent()[ 0 ], pData );
                    $s( lBuild.l_Dom, lValue );
                    lBuild.l_Dom.focus();
                    lBuild.l_Dom.id = "removeMe";
                    $( lBuild.l_Dom ).one(
                        "blur", function( pEvent ) {
                            _cellSave( pEvent, this );
                        }
                    )
                }
            });
            that.currentValue = lValue;
        } else {
            _reset();
        }
    }

    function _reset() {
        $( "#removeMe" ).remove();
        $( that.currentCell )
            .text(that.currentValue)
            .css('padding','')
            .unbind('click')
            .one('click',function() {
                _cellInit(this);
        });
        that.currentRow  = false;
        that.currentCell = false;
        that.currentForm = false;
        that.currentCol  = false;
    }

    /*
     * Data grid initialisation
     */
    if ( gIsDataGridPage ) {
        _initDataGrid();
        gRegion$
            .on( "apexafterrefresh.datagrid", function() {
                _initDataGrid();
            });
    }

    /*
     * Manage menu initialisation (required on page 2 for data grids and page 3000 for reports)
     */
    if ( gHasManageMenu ) {
        _initMenus();
    }

}

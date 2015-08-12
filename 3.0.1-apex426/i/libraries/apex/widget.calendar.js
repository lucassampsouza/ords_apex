/*jshint nomen: false, evil: false, browser: true, eqeqeq: false, white: false, undef: false, indent: false */
/*
Oracle Database Application Express, Release 4.0

B32468-02

Copyright (c) 2003, 2014, Oracle and/or its affiliates. All rights reserved.

 Primary Author:  Sathish JS

The Programs (which include both the software and documentation) contain proprietary information; they are provided under a license agreement containing restrictions on use and disclosure and are also protected by copyright, patent, and other intellectual and industrial property laws. Reverse engineering, disassembly, or decompilation of the Programs, except to the extent required to obtain interoperability with other independently created software or as specified by law, is prohibited.

The information contained in this document is subject to change without notice. If you find any problems in the documentation, please report them to us in writing. This document is not warranted to be error-free. Except as may be expressly permitted in your license agreement for these Programs, no part of these Programs may be reproduced or transmitted in any form or by any means, electronic or mechanical, for any purpose.

If the Programs are delivered to the United States Government or anyone licensing or using the Programs on behalf of the United States Government, the following notice is applicable:

U.S. GOVERNMENT RIGHTS Programs, software, databases, and related documentation and technical data delivered to U.S. Government customers are "commercial computer software" or "commercial technical data" pursuant to the applicable Federal Acquisition Regulation and agency-specific supplemental regulations. As such, use, duplication, disclosure, modification, and adaptation of the Programs, including documentation and technical data, shall be subject to the licensing restrictions set forth in the applicable Oracle license agreement, and, to the extent applicable, the additional rights set forth in FAR 52.227-19, Commercial Computer Software--Restricted Rights (June 1987). Oracle USA, Inc., 500 Oracle Parkway, Redwood City, CA 94065.

The Programs are not intended for use in any nuclear, aviation, mass transit, medical, or other inherently dangerous applications. It shall be the licensee's responsibility to take all appropriate fail-safe, backup, redundancy and other measures to ensure the safe use of such applications if the Programs are used for such purposes, and we disclaim liability for any damages caused by such use of the Programs.

Oracle, JD Edwards, PeopleSoft, and Siebel are registered trademarks of Oracle Corporation and/or its affiliates. Other names may be trademarks of their respective owners.

The Programs may provide links to Web sites and access to content, products, and services from third parties. Oracle is not responsible for the availability of, or any content provided on, third-party Web sites. You bear all risks associated with the use of such content. If you choose to purchase any products or services from a third party, the relationship is directly between you and the third party. Oracle is not responsible for: (a) the quality of third-party products or services; or (b) fulfilling any of the terms of the agreement with the third party, including delivery of products or services and warranty obligations related to purchased products or services. Oracle is not responsible for any loss or damage of any sort that you may incur from dealing with any third party.
*/

/**
 * @fileOverview
 * This file holds all namespaced objects and functions for Calendar Functionality
 *
 * */

if (apex.widget.calendar===null || typeof(apex.widget.calendar)!="object"){apex.widget.calendar={};}

/**
 * @namespace
 */
apex.widget.calendar = {

    /**
     * This function controls the AJAX based calendar functionality.
     *
     * @param {String} p_calendar_type
     * @param {String} p_calendar_action
     * @param {String} p_calendar_date
     * */
    ajax_calendar: function(p_calendar_type, p_calendar_action, p_calendar_date, p_calendar_end_date, pOptions) {
        var l_cal_type_field = $v('p_cal_type_field_id');
        var l_cal_date_field = $v('p_cal_date_field_id');
        var l_cal_end_date_field = $v('p_cal_end_date_field_id');
        var l_cal_id = $v('p_calendar_id');
        var l_calendar_region = apex.util.escapeCSS('calendar' + l_cal_id);
        var l_cal_enable_drag_add = $v('p_cal_enable_drag_add');
        //check whether drag & drop and Add data property is set to [Y]
        var l_cal_enable_drag_drop = l_cal_enable_drag_add.charAt(0);
        var l_cal_enable_data_add = l_cal_enable_drag_add.charAt(1);
        var l_cal_enable_data_modify = l_cal_enable_drag_add.charAt(2);
        var l_cal_highlight_data = $v('p_cal_highlight_data');

        if ( p_calendar_type != 'C' ){
         $s(l_cal_date_field,$v('p_calendar_date'));
        } else {
           if ( $v(l_cal_date_field) == '' ) {
              $s(l_cal_date_field,$v('p_calendar_date'));
           }
           if ( $v(l_cal_end_date_field) == '' ) {
              $s(l_cal_end_date_field,$v('p_calendar_end_date'));
           }
        }

        // code for next,previous and today
        if (p_calendar_type == 'S'){
            p_calendar_type = $v('p_calendar_type');
        }else{
            $s(l_cal_type_field,p_calendar_type);
        }

        var lDate = (!!p_calendar_date && p_calendar_date !== '')?p_calendar_date:$v(l_cal_date_field);
        if (p_calendar_type == 'C') {
           var lendDate = (!!p_calendar_end_date && p_calendar_end_date !== '')?p_calendar_end_date:$v(l_cal_end_date_field);
        }

    /*  a.ajax.add(l_cal_date_field,lDate);
        if (p_calendar_type == 'C') a.ajax.add(l_cal_end_date_field,lendDate);
        a.ajax.addParam('x02',lDate);
        if (p_calendar_type == 'C') a.ajax.addParam('x05',lendDate);
        a.ajax.add(l_cal_type_field,p_calendar_type);       */

        var lOptions = apex.jQuery.extend( {
                            dataType:    "html",
                            refreshObject: "#"+l_calendar_region,
                            success: function( pData ) {
                                        apex.jQuery("#"+l_calendar_region, apex.gPageContext$).html( pData );
                                        $s(l_cal_date_field,$v('p_calendar_date'));
                                        if (p_calendar_type == 'C') $s(l_cal_end_date_field,$v('p_calendar_end_date'));
                                        if (l_cal_enable_drag_drop == 'Y') apex.widget.calendar.initDragDrop(); //commented for bug #9948888, should be removed
                                        if (l_cal_enable_data_add == 'Y') apex.widget.calendar.initAjaxDataAdd();
                                        apex.widget.calendar.initAjaxDataModify();
                                        if (l_cal_highlight_data == 'Y')loadCalendarData();
                                        if ( $v('p_cal_is_mobile') == 'Y' )apex.jQuery("#"+l_calendar_region, apex.gPageContext$).find('[data-role="listview"]').listview();
                                        document.body.style.cursor = "";
                                        }
                            },pOptions );

        apex.server.widget( "calendar",
        {
            p_widget_action: p_calendar_action,
            p_widget_mod:    p_calendar_type,
            x01:             l_cal_id,
            x02:             lDate,
            x05:             lendDate
        }
        , lOptions );

    },

    initAjaxDataModify : function() {
        apex.jQuery('div.apex_cal_data_grid_src', apex.gPageContext$).bind("click", function(e){
            var lCalDateSource = apex.jQuery(this).find('input.apex_cal_date_source');
            gMouseX = e.clientX;
            gMouseY = e.clientY;
            //apex.widget.calendar.showData(lCalDateSource.val());
        });
        apex.jQuery('div.apex_cal_data_grid_src', apex.gPageContext$).bind("mouseenter", function(e){
               this.style.cursor = "pointer";
        });
    },
    ajaxAddData:function(e) {
        var lAddUrlnew;
        lAddUrlnew = apex.jQuery(e.target).find('input.apex_cal_add_url').val();
        if ( lAddUrlnew == undefined || lAddUrlnew == '' ) {
            lAddUrlnew = apex.jQuery(e.target).parent().find('input.apex_cal_add_url').val();
        }
        if ( lAddUrlnew != undefined && lAddUrlnew != '' ) {
            var lOpenPopup = apex.jQuery('#p_cal_url_new_window', apex.gPageContext$).val();
            if ( lAddUrlnew != '') {
                if ( lOpenPopup == 'P') {
                    apex.navigation.popup({
                        url: lAddUrlnew,
                        name: 'popupwindow',
                        width: 800,
                        height: 600
                    });
                } else {
                    window.location.href=lAddUrlnew;
                }
            }
        }
    },
    initAjaxDataAdd: function() {
        var lAddUrl = apex.jQuery('#p_cal_add_url', apex.gPageContext$).val();
        var lAddUrlnew;
        var lOpenPopup = apex.jQuery('#p_cal_url_new_window', apex.gPageContext$).val();
        if (lAddUrl.indexOf('#DATE_VALUE#') != -1 ) {
            apex.jQuery('.calDragDrop', apex.gPageContext$).parent().bind("click", function(e){
                if ( e.target.nodeName != 'A' && e.target.id != 'apex_cal_data_grid_src') {
                    var lDateVal = apex.jQuery(this).find('input.apex_cal_grid_target').val();
                    lAddUrl = lAddUrl.replace('#DATE_VALUE#',lDateVal);
                    lAddUrlnew = apex.jQuery(this).find('input.apex_cal_add_url').val();
                    if ( lOpenPopup == 'P') {
                        apex.navigation.popup({
                            url: lAddUrlnew,
                            name: 'popupwindow',
                            width: 800,
                            height: 600
                        });
                    } else {
                        window.location.href=lAddUrlnew;
                    }
                 }
                    //apex.widget.calendar.add(apex.jQuery(this).find('input.apex_cal_grid_target').val(),e.clientX,e.clientY);
            });
        }
        apex.jQuery('.calDragDrop', apex.gPageContext$).parent().bind("mouseenter", function(e){
               this.style.cursor = "pointer";
        });
    },
    initAjaxDataShow: function() {
    apex.jQuery('.calDragDrop', apex.gPageContext$).parent().bind("click", function(e){
     var lDateVal = apex.jQuery(this).find('input.apex_cal_grid_target').val();
    /*if ( e.target.nodeName != 'A' && e.target.id != 'apex_cal_data_grid_src') {
        var lDateVal = apex.jQuery(this).find('input.apex_cal_grid_target').val();

    }*/
    if (lDateVal != '')apex.widget.calendar.show(apex.jQuery(this),lDateVal);
      });
    },
    initDragDrop: function() {
       var lFlag = true;
       var lCalendarDataDrag = apex.jQuery('#calendar_data_drag', apex.gPageContext$);
       apex.jQuery('div.apex_cal_data_grid_src',lCalendarDataDrag).draggable({
            revert: 'invalid',
            //helper: 'clone',
            helper: function() {
                var lDraggable = apex.jQuery(this).clone().width(this.clientWidth);
                return lDraggable;
            },
            cursor: 'move',
            dragstart: function(event, ui) {
                   apex.jQuery(this).height(180);
                   apex.jQuery(this).width(181);
            }
            /*drag: function(event) {
                apex.jQuery( this ).css({
                    top: event.offsetY,
                    left: event.offsetX
                    });
            }*/

        });

        apex.jQuery('div.calDragDrop', lCalendarDataDrag).parent().droppable({
            accept: '#calendar_data_drag div.apex_cal_data_grid_src',
            activeClass: 'custom-state-active',
            drop: function(ev, ui) {
                     apex.widget.calendar.move(this, ev,ui.draggable);
            }
    });


    },

    /**
     * This function is used to move data using Drag & Drop.
     **/
    move: function(pThis, pEvent, pItem,pOptions){
      var lCalTypeField = $v('p_cal_type_field_id');
      var lCalDateField = $v('p_cal_date_field_id');
      var lCalEndDateField = $v('p_cal_end_date_field_id');
      // getting the primary key value & Target Date value
      //var lTarget = apex.jQuery(pEvent.target); #Changed behaviour post jQuery 1.7.x
      var lTarget = apex.jQuery(pThis);
      var lKeyValue = pItem.find('input.apex_cal_date_source').val();
      var lTargetDate = lTarget.find('input.apex_cal_grid_target').val();
      $s(lCalDateField,$v('p_calendar_date'));

       //var l_array = new Array() ;
       var lCalId = $v('p_calendar_id');
       var lCalendarRegion = 'calendar' + lCalId;
       var l_cal_enable_drag_add = $v('p_cal_enable_drag_add');
       //check whether drag & drop and Add data property is set to [Y]
       var l_cal_enable_drag_drop = l_cal_enable_drag_add.charAt(0);
       var l_cal_enable_data_add = l_cal_enable_drag_add.charAt(1);
       var l_cal_enable_data_modify = l_cal_enable_drag_add.charAt(2);
       var l_cal_highlight_data = $v('p_cal_highlight_data');

       // call page level On demand Process
       var l_page_process = $v('p_cal_drag_process');
       if ( l_page_process != '' ) {
           var ajax = new htmldb_Get(null,$v('pFlowId'),'APPLICATION_PROCESS=' + l_page_process,$v('pFlowStepId'));
           ajax.addParam('x01',lTargetDate);
           ajax.addParam('x02',lKeyValue);

           var gReturn = ajax.get(null,'<htmldb:BOX_BODY>','</htmldb:BOX_BODY>');
           ajax = null;
        }
        // end of the call
        // create and apex.ajax.widget object

        var lDate = $v(lCalDateField);
        if ($v('p_calendar_type') == 'C') {
             var lendDate = $v(lCalEndDateField);
        }


        var lOptions = apex.jQuery.extend( {
                            dataType:    "html",
                            refreshObject: "#"+lCalendarRegion,
                            success: function( pData ) {
                                        apex.jQuery("#"+lCalendarRegion, apex.gPageContext$).html( pData );

                                        $s(lCalDateField,$v('p_calendar_date'));
                                        if ($v('p_calendar_type') == 'C') $s(lCalEndDateField,$v('p_calendar_end_date'));
                                        if (l_cal_enable_drag_drop == 'Y') apex.widget.calendar.initDragDrop(); //commented for bug #9948888, should be removed
                                        if (l_cal_enable_data_add == 'Y') apex.widget.calendar.initAjaxDataAdd();
                                        apex.widget.calendar.initAjaxDataModify();
                                        if (l_cal_highlight_data == 'Y')loadCalendarData();
                                        document.body.style.cursor = "";
                                        }
                            },pOptions );

        apex.server.widget( "calendar",
        {
            p_widget_action: 'same',
            p_widget_mod:    $v('p_calendar_type'),
            x01:             lCalId,
            x02:             lDate,
            x03:             $v('apex_cal_table_name'),
            x05:             lendDate,
            x06:             $v('apex_cal_primary_key'),
            x07:             lKeyValue,
            x08:             $v('p_date_column_name'),
            x09:             lTargetDate
        }
        , lOptions );


    },

    getDayData: function(pRegionId, pDate, pOptions) {
        var lOptions = apex.jQuery.extend( {
                            dataType:    "html",
                            refreshObject: "#" + pRegionId },
                            pOptions );

        apex.server.widget( "calendar",
        {
            p_widget_action: "DAY_DATA",
            x01:             pRegionId,
            x02:             pDate
        }, lOptions );

    }

}

/**
 * code for backward compatibility
 * */
ajax_calendar = apex.widget.calendar.ajax_calendar;

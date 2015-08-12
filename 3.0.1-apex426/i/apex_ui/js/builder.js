/*jshint nomen: false, evil: false, browser: true, eqeqeq: false, white: false, undef: false, indent: false */
/*
Oracle Database Application Express, Release 5.0

B32468-02

Copyright (c) 2003 - 2015, Oracle. All rights reserved.

Primary Author: Carl Backstrom

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
 * This file contains objects and functions specific to Application Express Builder environment.
 * */

// initialize namespace
if (!window.apex)  window.apex  = {};
/**
 * @namespace apex.builder
 * */
if (!apex.builder) apex.builder = {
  /* Current application and page which gets edited */
  gApplicationId:null,
  gPageId:null };

/**
 * Initialize HTML5 elements for IE browsers
 */

'article aside canvas details figcaption figure footer header hgroup nav section summary video'.replace(/\w+/g,function(n){document.createElement(n)});


/**
 * Used by the search box plugin to add the necessary javascript events to the search field
 *
 * @param {String} pSearchField: Id of the search field
 * @param {String | Function} pTarget: URL or function which should be called when the user executes the search. The search value is append in case of an URL.
 * @param {String} pSearchHint: Text which is displayed in the search field and which is removed when the user clicks into the field
 */
apex.builder.searchBox = function(pSearchField, pTarget, pSearchHint)
{
  var $SearchField = apex.jQuery("#"+pSearchField);

  function searchValue(pValue) {
    if (pValue === "" || pValue == pSearchHint) { return; }

    if (typeof(pTarget) == "function") {
      pTarget(pValue); }
    else {
      apex.navigation.redirect(pTarget+encodeURIComponent(pValue));
    }
  } // searchValue

  $SearchField
    .keypress(function(pEvent)
     {
       // has ENTER been pressed and does the search field contain a value?
       if (pEvent.keyCode == 13) {
         searchValue($SearchField.val());
         pEvent.preventDefault();
       }
     })
    .focus(function()
     {
       // clear the search field
       if (this.value == pSearchHint) { this.value=""; }
     })
    .blur(function()
     {
       // restore the search field
       if (this.value === "") { this.value=pSearchHint; }
     })
    .next() /* the search icon */
    .click(function(pEvent)
     {
       searchValue($SearchField.val());
       pEvent.preventDefault();
     });
}; // apex.builder.searchBox


/**
 * Namespace for the anchor handling functions of attribute pages
 **/
apex.builder.anchor = {};

(function($){

  var cActiveClass = 'apex-rds-selected',
      cCookieName = 'ORA_WWV_ATTRIBUTE_PAGE';

  /**
   * Called when an anchor link is clicked to show the region which is assigned to the anchor
   **/
  $.activate = function() {
    // "this" is initialized with the clicked anchor entry

    // get all anchor links but ignore the hidden ones (eg. plugin settings)
    var $AnchorList = apex.jQuery('#anchorList a:visible');
    // the links store in href which region should be displayed, based on that get all region objects
    var $RegionList = apex.jQuery(apex.jQuery.map($AnchorList.not('#ALL,#DEFAULTALL'),
                                                  function(pValue){
                                                     return pValue.href.substr(pValue.href.indexOf('#'));
                                                  }).join(','));
    // for the current selection remove URL before #
    var lThisAnchor = this.href.substr(this.href.indexOf('#'));

    if (lThisAnchor === '#ALL') {
      $RegionList.show();
    }
    else {
      // hide all
      $RegionList.hide();
      // show the selected region
      $RegionList.filter(lThisAnchor).show();
    }
    // show the enclosing div if it's not displayed yet
    apex.jQuery('#BB,#ContentArea,#ContentBody').show();
    // remove current anchor link highlighting
    apex.jQuery('#anchorList .' + cActiveClass).removeClass( cActiveClass );
    // highlight pressed anchor link
    apex.jQuery(this).parent().addClass(cActiveClass);
    // remember pressed anchor
    apex.storage.setCookie(cCookieName, $v('pFlowStepId')+','+lThisAnchor);
    // don't activate the default event handling
    return false;
  }; // activate

  /**
   * Makes a hidden anchor and its LI visible again
   **/
  $.show = function(pRegion) {
    apex.jQuery('#'+pRegion+"_ANCHOR")
      .show() // a tag
      .parent()
      .show(); // li
  }; // show

  /**
   * Makes an anchor and its LI hidden again
   **/
  $.hide = function(pRegion) {
    apex.jQuery('#'+pRegion+"_ANCHOR")
      .hide() // a tag
      .parent()
      .hide(); // li
  }; // show

  /**
   * Called during page init to restore the saved state of the attribute page
   * It also binds the activate function to all anchors
   **/
  $.init = function(){
    var lCurrentURL = document.URL;
    var lPos = lCurrentURL.lastIndexOf('#');
    var lAnchorName = null;
    var lAnchor = null;

    if(lPos >= 0) {
      // extract anchor from URL
      lAnchorName = lCurrentURL.substr(lPos);
    } else {
      // get anchor from cookie
      var lCookie = apex.storage.getCookie(cCookieName);
      if (lCookie && $v('pFlowStepId') == lCookie.split(',')[0]) {
        lAnchorName = lCookie.split(',')[1];
      }
    }
    // default with ALL
    lAnchorName = (lAnchorName===null)?'#ALL':lAnchorName;
    // lets have a look if the stored anchor has really been rendered (conditions!)
    lAnchor = apex.jQuery(lAnchorName+'_ANCHOR:visible');
    if (lAnchor.length === 0) {
      // fallback to ALL
      lAnchor = apex.jQuery('#ALL_ANCHOR');
    }
    $.activate.call(lAnchor[0]);

    // bind our activate function to all links of the anchor widget
    apex.jQuery('#anchorList a').click($.activate);

    // because the enhanced anchor is used, we also have to replace the uF function
    // which is used in the region template. The replaced uF is taking care of hidden
    // regions. Bug# 9714082
    uF = function(){
           apex.jQuery('#ALL_ANCHOR').click();
           scroll(0,0);
         };
  }; // init

})(apex.builder.anchor); /* pass in the namespace variable for anchor */


try{

var gReturn = 'F4000_P4017_SOURCE_CHART';

/** @ignore  */
function ChartSqlReturn(pThis){
  $v_PopupReturn('P4000_CHART_SQL',gReturn);
  window.close();
}

var gTestArray;
var gTestId;
var gReSequence = false;
var gReSequenceBy = 10;
var gId = false;
var gReorder;

/** @ignore  */
function rAlign(pThis){
    var lText;
    var lThis = pThis.split("-");
    switch(lThis[0]){
      case 'CENTER' : lText='text-align:center;'; break;
      case 'RIGHT' : lText='text-align:right;'; break;
      case 'LEFT' : lText='text-align:left;'; break;
      default : lText = ' '; break;
    }
    if(lThis[1]){
    switch(lThis[1]){
      case 'BOTTOM' : lText+='vertical-align:bottom;'; break;
      case 'CENTER' : lText+='vertical-align:middle;'; break;
      case 'TOP' : lText+='vertical-align:top;'; break;
      default : lText += ' '; break;
    }
    }
    return lText;
}

/**
 * the following runs item layout preview
 * @ignore
 * */
function rpreview(gId){
  var lnode = $x('pview');
  var node = $x(gId);
  node = (node)?node:$x(g_rpreview_global);
  if(!lnode){return false;}
  var lH = getElementsByClass('orderby',node,'INPUT');
  lnode.innerHTML = '';
  var lTable = $x_AddTag(lnode,'TABLE');
  lTable.className='itemlayout';
  lLastRow = false;
  lLastCell = false;

  for (var i=1;i<node.rows.length;i++){
    var lSelect = $x_FormItems(node.rows[i],'SELECT');
    var lText = $x_FormItems(node.rows[i],'TEXT');
    var lValue = node.rows[i].cells[0].innerHTML;
    var lLabel = lText[0].value;
    var lType = lText[2].value;
    if(lType){}
    var lNewLine = lSelect[0].value;
    var lNewField = lSelect[1].value;
    var lAlign = lSelect[2].value;
  if(lType == 'STOP_AND_START_HTML_TABLE'){
      $x_AddTag(lnode,'BR');
      lTable = $x_AddTag(lnode,'TABLE');
      lTable.className='itemlayout';
  }else{
    if(lNewLine == 'Y' || i==1){lLastRow = $x_AddTag(lTable,'TR');}
    if(lType == 'BUTTON'){lLabel = '<br />';}
    lLastCell = $tr_AddTD(lLastRow,lLabel);
    lLastCell.setAttribute('style',rAlign(lAlign));
    if(lType == 'HIDDEN'){lLastCell.setAttribute('style','font-weight:normal;background-color:#FFF;');}
    if(lNewField == 'Y' && lAlign != 'ABOVE' && lAlign != 'BELOW'){
      lLastCell = $tr_AddTD(lLastRow,lValue);
      lLastCell.className='itemlayout';
      if(lType == 'TEXTAREA'){lLastCell.setAttribute('style','height:75px;');}
      if(lType == 'HIDDEN'){lLastCell.setAttribute('style','font-weight:normal;background-color:#FFF;');}
        lLastCell.colSpan = lText[1].value;
      }else{
          if(lAlign == 'ABOVE'){lLastCell.innerHTML += '<br />'+ lValue;}
        else if(lAlign == 'BELOW'){lLastCell.innerHTML = lValue + '<br />' + lLastCell.innerHTML;}
        else{lLastCell.innerHTML += lValue;}
        if(lType == 'TEXTAREA'){lLastCell.setAttribute('style','height:75px;');}
        lLastCell.colSpan = lText[1].value;
    }
  }
  }
  if(document.all){lnode.innerHTML = lnode.innerHTML;}
}

/** @ignore  */
function a4000pg749_init(){rpreview();}

/** @ignore  */
function callConditionsPopup(s1, sessionId) {
    var lURL = "f?p=4000:271:" + sessionId + ":::271:PASSBACK:" + s1.name;
    apex.navigation.popup({
        url: lURL
    });
}

/**
 * used for custom popup of page template preview
 * @ignore
 * */
function callPageTemplatePopup(s1, sessionId, flowId, pageId) {
    var lURL = "f?p=4000:74:" + sessionId + ":::74:F4000_P74_PASSBACK,F4000_P74_FLOW_ID,F4000_P74_PAGE_ID:" + s1.name + "," + flowId + "," + pageId;
    apex.navigation.popup({
        url: lURL
    });
}

var gThis = false;
var lEl = false;
var lH = false;
var gFARButtonListCurrent = 'htmldbButtonListCurrent';
var gFARButtonList = 'htmldbButtonList2';
var gFARCookieName = 'ORA_WWV_ATTRIBUTE_PAGE';

/**
 * @ignore
 **/
function uR(){
  if(gThis){
    gThis.className='htmldbButtonList';
    if(gThis==$x('ALL')){gThis=$x('ALL');}
  }
}


function filterAttributeRegions(pThis,pThat){
  var lHolder = ($x('BB'))?$x('BB'):$x('ContentArea');
  lHolder = (!lHolder)?$x('ContentBody'):lHolder;
  try{
    var lThis = pThat.substr(1);
    if(lThis == 'ALL' || lThis == 'DEFAULTALL'){
        pThis.className = gFARButtonListCurrent;
        if(lThis != 'DEFAULTALL'){apex.storage.setCookie(gFARCookieName,$x('pFlowStepId').value+','+pThat);}
        uF();
        $x_Show(['BB','ContentArea','ContentBody']);
    }else{
       if($x('ALL')){$x('ALL').className = gFARButtonList;}
       uR();
        pThis.className = gFARButtonListCurrent;
       gThis = pThis;
       lH = $x_ByClass('rc-title',lHolder,'DIV');
       for (var i=0;i<lH.length;i++){
            $x_Hide($x_UpTill(lH[i],'','rounded-corner-region'));
           if(lH[i].getElementsByTagName('A')){
               var lTr = lH[i].getElementsByTagName('A')[0];
              if(lTr && lTr.name && lTr.name == lThis){lEl = lTr;}
            }
        }
        if(lEl){$x_Show($x_UpTill(lEl,'','rounded-corner-region'));}
        apex.storage.setCookie (gFARCookieName, $x('pFlowStepId').value+','+pThat);
        $x_Show(['BB','ContentArea','ContentBody']);
    }
  }catch(e){
    uF();
    $x_Show(['BB','ContentArea','ContentBody']);
  }
};

/**
 * @ignore
 **/
function propTest(){
  var currentURL = document.URL;
  var lInd = currentURL.lastIndexOf('#');
  var lId;
  if(lInd != -1){
    lId = currentURL.substring(lInd);
  }else if(
      apex.storage.getCookie (gFARCookieName)){
    var lPage = apex.storage.getCookie (gFARCookieName).split(',')[0];
    if ($x('pFlowStepId').value == lPage && lInd == -1){lId = apex.storage.getCookie(gFARCookieName).split(',')[1];}
  }else{
    lId = false;
  }
  if(lId){
    var lLinks = $x('ql').getElementsByTagName('A');
    for (var i=0,len=lLinks.length;i<len;i++){
      if(lLinks[i].getAttribute('href').lastIndexOf(lId) != -1){qF(lLinks[i],lId);}
    }
  }else{qF($x('ALL'),'#DEFAULTALL');}
}

/**
 * @ignore
 **/
function unfilterAttributeRegions(){
  var lThis = ($x('BB'))?$x('BB'):$x('ContentArea');
  lThis = (!lThis)?$x('ContentBody'):lThis;
  try{
    var lH = $x_ByClass('rc-title',lThis,'DIV');
    for (var i=0,len=lH.length;i<len;i++){$x_Show($x_UpTill(lH[i],'','rounded-corner-region'));}
    uR();
    scroll(0,0);
  }catch(e){
    scroll(0,0);
  }
}

/**
 * @ignore
 **/
uF = unfilterAttributeRegions;

/**
 * @ignore
 **/
qF = filterAttributeRegions;

}catch(e){}

function show_download_format_page(){
    var lItem = ( $x( "P687_FORMAT_MASK" ) ) ? "P687_FORMAT_MASK" : "P422_COLUMN_FORMAT",
        lURL = "wwv_flow_file_mgr.show_download_format_page?p_format=" + $v( lItem );
    apex.navigation.popup({
        url: lURL
    });
}

function show_download_format_page_set(){
  var l_Array = [$v('a01'),$v('a02'),$v('a03'),$v('a04'),$v('a05'),$v('a06'),$v('a07'),$v('a08'),$v('a09'),$v('a10'),$v('a11')];
  var lItem = (opener.$x('P687_FORMAT_MASK'))?'P687_FORMAT_MASK':'P422_COLUMN_FORMAT';
  var l_Value = $u_ArrayToString(l_Array,':');
  opener.$s(lItem,l_Value);
  window.close();
  opener.$x(lItem).focus();
}

/**
 * Handles dynamic attributes and shows/hides them depending on the plugin meta data
 *
 * @namespace
 * */
apex.builder.dynamicAttributes = {

  // stores the selected plugin. This information is required by the help method
  gCurrentSelection: {
    pluginType: null,
    pluginName: null
  },
  // stores the AJAX callback identifier which is set by wwv_flow_f4000_plugins.render_plugin_attribute
  gAjaxIdentifier:null,

  // Returns the jQuery selector for an dynamic attribute
  getAttributeSelector: function(pItemPrefix, pAttributeNo, pPostfix) {
    return '#' + pItemPrefix + 'ATTRIBUTE_' + ( pAttributeNo < 10 ? '0' : '' ) + pAttributeNo + pPostfix;
  },

  // Returns the jQuery selector for all dynamic attributes
  getAttributesSelector: function(pItemPrefix, pPostfix) {
    var lSelector = '';
    for ( var i = 1; i <= 25; i++ ) {
      if ( i > 1 ) {
        lSelector += ',';
      }
      lSelector += apex.builder.dynamicAttributes.getAttributeSelector(pItemPrefix, i, pPostfix);
    }
    return lSelector;
  },

  // Used to hide all dynamic attribute page items (Pxxxx_ATTRIBUTE_xx)
  //   pItemPrefix: Prefix used for the items. eg P4311_
  hide: function(pItemPrefix){

    // hide all attribute fields
    apex.jQuery(apex.builder.dynamicAttributes.getAttributesSelector(pItemPrefix, "_CONTAINER")).hide();

    // hide format mask attribute fields
    apex.jQuery('#'+pItemPrefix+'FORMAT_MASK_DATE,#'+pItemPrefix+'FORMAT_MASK_NUMBER,#'+pItemPrefix+'IS_REQUIRED').each(function(){
      apex.item(this).hide();
      });
  }, // hide

  // Used to set the dynamic attribute page items (Pxxxx_ATTRIBUTE_xx) based on the display as type.
  //   pPluginType: Type of plugin (eg. ITEM TYPE)
  //   pPluginName: Selected plugin (eg. value stored in DISPLAY_AS item)
  //   pItemPrefix: Prefix used for the items. eg P4311_
  //   pPluginList: Array indexed by the component type with the following format
  //                { standardAttributes: "xx",
  //                  sqlMinColumnCount: x,
  //                  sqlMaxColumnCount: x,
  //                  attributeList:[{label: "xx", type: "CHECKBOX/...", fieldDef: "html code", defaultValue: "default", isRequired: true/false, dependingOnAttribute: "00", dependingOnCondType:"not_null", dependingOnExpr:"xx"}]
  //                }
  //   pKeepValues: false will initialize the items with the default value
  //   pRegionId:   Optional parameter to show/hide the region containing the dynamic attributes
  //                If specified it will also try to show/hide the anchor link with the id [pRegionId]_ANCHOR
  //   pPopupText:  String used to construct popup icon text
  //   pIsWizard:   Boolean which indicates if plug-in attributes are displayed as part of a create wizard
  //   pUiType:     Optional parameter containing UI type name of the current page
  show: function(pPluginType, pPluginName, pItemPrefix, pPluginList, pKeepValues, pRegionId, pPopupText, pHelpText, pIsWizard, pUiType){

    apex.builder.dynamicAttributes.hide(pItemPrefix);

    // get an jQuery array with all the dynamic attribute fields
    var lAttributes$          = apex.jQuery(apex.builder.dynamicAttributes.getAttributesSelector(pItemPrefix, "")),
        lAttributeContainers$ = apex.jQuery(apex.builder.dynamicAttributes.getAttributesSelector(pItemPrefix, "_CONTAINER")),
        lNextElement$         = lAttributeContainers$.filter(':last').next(),
        lRegionDiv$           = lAttributeContainers$.filter(':last').parent(),
        lInputNameList        = [],
        getComboFieldDef      = function(pAttributeDef, pSize, pURL) {
                                  return '<table class="lov" cellspacing="0" cellpadding="0" border="0" role="presentation">'+
                                         '<tr><td><input id="#ID#" name="#NAME#" type="text" maxlength="#MAX_LEN#" size=""'+pSize+
                                         '" /></td>'+
                                         '<td><a class="a-Button a-Button--popupLOV" href="'+pURL+'">'+
                                         '<span class="a-Icon icon-popup-lov"><span class="visuallyhidden">' + pPopupText + pAttributeDef.label + '</span></span>'+
                                         '</a></td></tr></table>';
                                }


    // does the selected plugin name have dynamic attributes?
    if (pPluginList[pPluginName] && pPluginList[pPluginName].attributeList.length>0) {
      // loop over all attribute definitions in our array and bring them into the display order
      apex.jQuery.each(pPluginList[pPluginName].attributeSortList, function(pIndex, pValue){
        var lContainer$ = apex.jQuery(apex.builder.dynamicAttributes.getAttributeSelector(pItemPrefix, pValue, "_CONTAINER"));
        if (lNextElement$.length===0) {
          lRegionDiv$.append(lContainer$);
        } else {
          lNextElement$.before(lContainer$);
        }
      });
      // After reordering the dynamic attributes we have to bring the "name" atttribute again into syn with the display order
      // We have to re-read the attributes, because of the re-arrange the DOM reference is not valid anymore
      lAttributes$ = apex.jQuery(apex.builder.dynamicAttributes.getAttributesSelector(pItemPrefix, ""));
      // get the internal name attributes used by the dynamic attributes
      lAttributes$.each(function(pIndex){
        lInputNameList[pIndex] = apex.jQuery(this).attr('name');
        });
      lInputNameList = lInputNameList.sort();
      // set the sorted "name" attributes in the order the dynamic attributes appear in the DOM tree
      lAttributes$.each(function(pIndex){
        apex.jQuery(this).attr("name", lInputNameList[pIndex]);
      });
    }

    // clear the existing values if necessary
    if (!pKeepValues) {
      // we have to set back the item to a hidden field, because if it's a selectlist
      // setting to null will have no effect
      lAttributes$.each(function(){
        apex.jQuery(this)
          .closest('a-Form-inputContainer')
          .empty()
          .html('<input type="hidden" id="'+this.id+'" name="'+this.name+'" value="">');
        });
    }

    // does the selected plugin name have dynamic attributes or displays the format mask or required field?
    if (pPluginList[pPluginName] &&
       ((pPluginList[pPluginName].attributeList.length>0) ||
        (/FORMAT_MASK/.test(pPluginList[pPluginName].standardAttributes)) ||
        (/SESSION_STATE/.test(pPluginList[pPluginName].standardAttributes))
       )) {
      // remember the current settings needed by the help method
      apex.builder.dynamicAttributes.gCurrentSelection = {
        pluginType: pPluginType,
        pluginName: pPluginName
      };

      // loop over all attribute definitions in our array
      apex.jQuery.each(pPluginList[pPluginName].attributeList, function(pIndex, pAttributeDef){

        // local function to return the values of the pAttributeDef.valueList array in the
        // format as defined by pTemplate. For example: <option value="#R#">#D#</option>
        function getValueList(pValueList, pTemplate, pCurrentValue) {
          var lResult = "",
              lFound  = false;

          apex.jQuery.each(pValueList, function(pIndex, pValue){
            lResult += pTemplate
                         .replace(/#SEQ#/g, pIndex)
                         .replace(/#R#/g,   pValue.r)
                         .replace(/#D#/g,   pValue.d);
            if (pValue.r === pCurrentValue) {
              lFound = true;
            }
          });

          // if the current value isn't in the list, we add it to the list and mark the display value with a *
          if (pCurrentValue && !lFound) {
              lResult += pTemplate
                           .replace(/#SEQ#/g, 9999)
                           .replace(/#R#/g,   lValue)
                           .replace(/#D#/g,   lValue+"*");
          }

          return lResult;
        }; // getValueList

        // exit if we have a gap in our attribute definition
        if (!pAttributeDef) { return; }

        // get the jQuery object, the name and value of the dynamic attribute
        var lField = apex.jQuery(apex.builder.dynamicAttributes.getAttributeSelector(pItemPrefix, pIndex + 1, "")), // array index starts with 0 but our attributes start with 1
            lId    = lField.attr('id'),
            lName  = lField.attr('name'),
            lValue = lField.val(),
            lFieldDef;

        // replace label
        var lLabelContainer$ = apex.jQuery( "#" + lId + "_CONTAINER .a-Form-labelContainer" ),
            lLabel$          = lLabelContainer$.find( "label" ),
            lRequiredSpan$   = lLabelContainer$.find( ".a-Form-required" ),
            lRequiredAudio$  = lLabelContainer$.find( ".u-VisuallyHidden" ),
            lInputcontainer$ = apex.jQuery( "#" + lId + "_CONTAINER .a-Form-inputContainer" ),
            lHelpButton$     = lInputcontainer$.find( ".a-Button--helpButton" );

        lLabel$
            .text( pAttributeDef.label )
            .append( lRequiredAudio$ );

        lHelpButton$
            .attr( "title", pHelpText + pAttributeDef.label )
            .attr( "aria-label", pHelpText + pAttributeDef.label );

        // hide or show the required / optional information, depending on if the attribute is required or not
        if ( pAttributeDef.isRequired && pAttributeDef.type !== "SELECT LIST" && pAttributeDef.type !== "CHECKBOX" ) {
            lLabel$
                .removeClass( "aOptional" )
                .addClass( "aRequired" );
            lRequiredSpan$.show();
            lRequiredAudio$.show();
        } else {
            lLabel$
                .removeClass( "aRequired" )
                .addClass( "aOptional" );
            lRequiredSpan$.hide();
            lRequiredAudio$.hide();
        }

        // restore original value if necessary
        if (pKeepValues) {
          // if no value is set and the attribute has a default value, use the default
          if (!lValue && pAttributeDef.defaultValue) {
            lValue = pAttributeDef.defaultValue;
          }
        }
        else {
          lValue = pAttributeDef.defaultValue;
        }

        // Get HTML code depending on attribute type
        if ( pAttributeDef.type === "TEXTAREA" ||
             pAttributeDef.type === "SQL" ||
             pAttributeDef.type === "PLSQL" ||
             pAttributeDef.type === "PLSQL EXPRESSION" ||
             pAttributeDef.type === "PLSQL EXPRESSION BOOLEAN" ||
             pAttributeDef.type === "PLSQL FUNCTION BODY" ||
             pAttributeDef.type === "PLSQL FUNCTION BODY BOOLEAN" ||
             pAttributeDef.type === "HTML" ||
             pAttributeDef.type === "XML" ||
             pAttributeDef.type === "JAVASCRIPT" )
        {
          lFieldDef = '<fieldset id="#ID#_fieldset">'+
                      '<textarea id="#ID#" name="#NAME#" class="textarea" wrap="virtual" cols="#DISPLAY_LEN#" maxlength="#MAX_LEN#" rows="'+
                      ((pAttributeDef.type === "TEXTAREA")?"4":"8")+
                      '" />'+
                      '</fieldset>';

        } else if (pAttributeDef.type === "PAGE NUMBER"||
                   pAttributeDef.type === "PAGE NUMBERS"||
                   pAttributeDef.type === "AUTHORIZATION GROUP") {
          lFieldDef = getComboFieldDef (
                        pAttributeDef,
                        (pAttributeDef.type === "PAGE NUMBER")?"30":"50",
                        "javascript:apex.navigation.popup({"+
                          "url:'wwv_flow.show?p_flow_id=#APP_ID#&p_flow_step_id=#APP_PAGE_ID#&p_instance=#APP_SESSION#&p_request=NATIVE%253D#AJAX_IDENTIFIER#&x01="+pAttributeDef.type+"&x02=#ID#',"+
                          "name:'winLovList',"+
                          "width:400,"+
                          "height:450}); void(0);" );

        } else if (
             pAttributeDef.type === "PAGE ITEM" ||
             pAttributeDef.type === "PAGE ITEMS" )
        {
          lFieldDef = getComboFieldDef (
                        pAttributeDef,
                        (pAttributeDef.type === "PAGE ITEM")?"30":"50",
                        "javascript:popUp('f?p=4000:246:#APP_SESSION#::NO:RP,246:F4000_P246_CALLING_FIELD,P246_APPEND,F4000_P246_PAGE:#ID#,"+
                          ((pAttributeDef.type === "PAGE ITEMS")?"Y":"N")+","+
                          "#EDIT_PAGE_ID#');" );

        } else if (
             pAttributeDef.type === "CHECKBOX" ||
             pAttributeDef.type === "SELECT LIST" )
        {
          // If the select list is required and we have no current value, default to the first entry. This is necessary, because not all browsers
          // behave the same and automatically select the first entry
          if ( pAttributeDef.isRequired && !lValue && pAttributeDef.valueList.length > 0 ) {
              lValue = pAttributeDef.valueList[ 0 ].r;
          }
          lFieldDef = '<select id="#ID#" name="#NAME#" class="selectlist" size="1">'+
                      getValueList(pAttributeDef.valueList, '<option value="#R#">#D#</option>', lValue)+
                      '</select>';

        } else if (pAttributeDef.type === "CHECKBOXES") {
          lFieldDef = '<fieldset id="#ID#_fieldset" class="checkbox_group" tabindex="-1">'+
                      '<input id="#ID#" name="#NAME#" type="hidden">'+
                      getValueList(pAttributeDef.valueList, '<input id="#ID#_#SEQ#" type="checkbox" value="#R#" /><label for="#ID#_#SEQ#">#D#</label><br>')+
                      '</fieldset>';

        } else if (pAttributeDef.type === "COLOR" ) {
          lFieldDef = '<input id="#ID#" name="#NAME#" type="text" maxlength="30" size="10" />';
        } else if (pAttributeDef.type === "ICON" ) {
          lFieldDef = '<input id="#ID#" name="#NAME#" type="text" maxlength="255" size="30" />';
        } else {
          lFieldDef = '<input id="#ID#" name="#NAME#" type="text" maxlength="#MAX_LEN#" size="#DISPLAY_LEN#" />';
        }

        // replace the dynamic attribute field with the new html definition
        lField
          .val(null)
          .closest('#'+lId+'_wrapper')
          .html(lFieldDef
                  .replace(/#ID#/g, lId)
                  .replace(/#NAME#/g, lName)
                  .replace(/#DISPLAY_LEN#/g,  pAttributeDef.displayLen)
                  .replace(/#MAX_LEN#/g,      pAttributeDef.maxLen)
                  .replace(/#APP_ID#/g,       $v('pFlowId'))
                  .replace(/#APP_PAGE_ID#/g,  $v('pFlowStepId'))
                  .replace(/#APP_SESSION#/g,  $v('pInstance'))
                  .replace(/#EDIT_PAGE_ID#/g, apex.builder.gPageId)
                  .replace(/#IMAGE_PREFIX#/g, apex_img_dir)
                  .replace(/#AJAX_IDENTIFIER#/g, apex.builder.dynamicAttributes.gAjaxIdentifier)
               );

        // post initialization depending on attribute type
        if ( pAttributeDef.type === "TEXTAREA" ||
             pAttributeDef.type === "SQL" ||
             pAttributeDef.type === "PLSQL" ||
             pAttributeDef.type === "PLSQL EXPRESSION" ||
             pAttributeDef.type === "PLSQL FUNCTION BODY" ||
             pAttributeDef.type === "JAVASCRIPT" )
        {
          // Initialize a resizable textarea
          apex.widget.textarea(lId, {isResizable:true});

        } else if (pAttributeDef.type === "CHECKBOXES") {
          // Register a click event handler for all our checkboxes to store the checked
          // checkbox values into our hidden attribute field
          // It's also very important that we fire the change event for that field to
          // fire the logic for depending attributes
          apex.jQuery('#'+lId).siblings('input[type=checkbox]').click(function(){
            var lField     = apex.jQuery(this).siblings('input[type=hidden]'),
                lValueList = (lField.val() === "")?[]:lField.val().split(':');
            if (this.checked) {
              lValueList.push(this.value);
            } else {
              lValueList.splice(apex.jQuery.inArray(this.value, lValueList), 1);
            }
            lField
              .val(lValueList.join(':'))
              .change();
          });
        }

        // set the current or default value
        apex.jQuery('#' + lId).val(lValue);
        if (pAttributeDef.type === "CHECKBOXES") {
          // check those checkboxes which match the current value
          apex.jQuery.each(lValue.split(':'), function(pIndex, pValue){
            apex.jQuery('#'+lId).siblings('input[type=checkbox][value="'+pValue+'"]').attr("checked", true);
          });
        };
      });

      // show/hide attributes depending on defined condition. We have to do this AFTER
      // all the dynamic attribute fields have been initialized, because the conditions
      // are checking these fields
      apex.jQuery.each(pPluginList[pPluginName].attributeList, function(pIndex, pAttributeDef){
        // exit if we have a gap in our attribute definition
        if (!pAttributeDef) { return; }

        apex.builder.dynamicAttributes.showHideAttribute(pItemPrefix, pIndex, pPluginList[pPluginName].attributeList, pIsWizard, pUiType);

        // if this field has a condition, create a change listener on depending on field
        // so that we also show/hide the field if the value gets changed
        if (pAttributeDef.dependingOnAttrSeq && pAttributeDef.dependingOnCondType) {
          apex.jQuery('#'+pItemPrefix+'ATTRIBUTE_'+pAttributeDef.dependingOnAttrSeq).change(function(){
            apex.builder.dynamicAttributes.showHideAttribute(pItemPrefix, pIndex, pPluginList[pPluginName].attributeList, pIsWizard, pUiType);
          });
        }
      });

      // show the format mask
      if (/FORMAT_MASK_DATE/.test(pPluginList[pPluginName].standardAttributes)) {
        apex.item(pItemPrefix+'FORMAT_MASK_DATE' ).show();
        apex.item(pItemPrefix+'FORMAT_MASK' ).hide();
      } else if (/FORMAT_MASK_NUMBER/.test(pPluginList[pPluginName].standardAttributes)) {
        apex.item(pItemPrefix+'FORMAT_MASK_NUMBER' ).show();
        apex.item(pItemPrefix+'FORMAT_MASK' ).hide();
      } else {
        apex.item(pItemPrefix+'FORMAT_MASK' ).show();
      }

      // stores session state
      if (/SESSION_STATE/.test(pPluginList[pPluginName].standardAttributes)) {
        apex.item(pItemPrefix+'IS_REQUIRED' ).show();
      }

      // show the dynamic attribute region only if we really have attributes
      if (pRegionId) {
        if ((pPluginList[pPluginName].attributeList.length > 0) ||
            (/FORMAT_MASK/.test(pPluginList[pPluginName].standardAttributes)) ||
            (/SESSION_STATE/.test(pPluginList[pPluginName].standardAttributes))
           ) {
          $x_Show(pRegionId);
          apex.builder.anchor.show(pRegionId);
        } else {
          $x_Hide(pRegionId);
          apex.builder.anchor.hide(pRegionId);
        }
      }
    }
    else {
      // remember the current settings needed by the help method
      apex.builder.dynamicAttributes.gCurrentSelection = {
        pluginType: null,
        pluginName: null
      };
      if (pPluginType==="ITEM TYPE") {
        // always show the format mask
        apex.item(pItemPrefix+'FORMAT_MASK' ).show();
      }
      if (pRegionId) {
        $x_Hide(pRegionId);
        apex.builder.anchor.hide(pRegionId);
      }
    }

    // show/hide the standard attributes
    var lStandardAttributeList=[],
        lSqlMinColumnCount=null,
        lSqlMaxColumnCount=null,
        lAttributeList=[],
        lRegionList=[];

    // only handle the standard attributes when it's not page 4446 (component defaults page)
    if ($v('pFlowStepId') != 4446) {
      switch(pPluginType) {
        case 'ITEM TYPE':
          // hide standard attribute fields
          apex.jQuery.each(['LIST_OF_VALUES', 'LABEL_ALIGNMENT', 'PLACEHOLDER', 'FIELD_TEMPLATE', 'CSIZE', 'CHEIGHT', 'TAG_ATTRIBUTES2', 'LOV_DISPLAY_NULL', 'LOV_NULL_TEXT', 'LOV_CASCADE_PARENT_ITEMS', 'AJAX_ITEMS_TO_SUBMIT', 'AJAX_OPTIMIZE_REFRESH', 'STATIC_LOV_POPUP', 'DYNAMIC_LOV_POPUP', 'ENCRYPT_SESSION_STATE_YN', 'ESCAPE_ON_HTTP_OUTPUT'], function(){
            apex.item(pItemPrefix+this ).hide();
          });
          // hide standard attribute regions
          apex.jQuery('#GRID,#LABEL,#ELEMENT,#VALIDATION,#DEFAULT,#SOURCE,#LOV,#QP,#READONLY,#READONLY,#HELP,#HELP')
            .hide()
            .each(function(){
              apex.builder.anchor.hide(this.id);
            });

          // provide default values if it's not a plugin
          if (!pPluginList[pPluginName]) {
            lStandardAttributeList=["VISIBLE","SOURCE","SESSION_STATE","ELEMENT","WIDTH","HEIGHT", "ELEMENT_OPTION", "QUICKPICK","READONLY","ENCRYPT","LOV","LOV_DISPLAY_NULL"];
            lSqlMinColumnCount=2;
            lSqlMaxColumnCount=2;
          } else {
            lStandardAttributeList=pPluginList[pPluginName].standardAttributes.split(':');
            lSqlMinColumnCount=pPluginList[pPluginName].sqlMinColumnCount;
            lSqlMaxColumnCount=pPluginList[pPluginName].sqlMaxColumnCount;
          }
          // widget is visible
          if (apex.jQuery.inArray("VISIBLE", lStandardAttributeList)!=-1) {
            lRegionList.push("#GRID");
            lAttributeList.push('FIELD_TEMPLATE');
            // has width
            if (apex.jQuery.inArray("WIDTH", lStandardAttributeList)!=-1) {
              lAttributeList.push('CSIZE');
            }
            // has height
            if (apex.jQuery.inArray("HEIGHT", lStandardAttributeList)!=-1) {
              lAttributeList.push('CHEIGHT');
            }
            lRegionList.push('#LABEL');
            lRegionList.push('#HELP');
            // always show this attributes, because they are hided by Stop and Start Table
            lAttributeList.push('LABEL_ALIGNMENT');
            // Placeholder
            if (apex.jQuery.inArray("PLACEHOLDER", lStandardAttributeList)!=-1) {
              lAttributeList.push('PLACEHOLDER');
            }
            // Form Element Options
            if (apex.jQuery.inArray("ELEMENT_OPTION", lStandardAttributeList)!=-1) {
              lAttributeList.push('TAG_ATTRIBUTES2');
            }
            // has LOV
            if (apex.jQuery.inArray("LOV", lStandardAttributeList)!=-1) {
              lAttributeList.push('LIST_OF_VALUES');
              lRegionList.push('#LOV');
              // show LOV static popup
              if (lSqlMinColumnCount<=2 && lSqlMaxColumnCount >= 2) {
                lAttributeList.push('STATIC_LOV_POPUP');
                lAttributeList.push('DYNAMIC_LOV_POPUP');
              }
              // show LOV examples
              apex.builder.dynamicAttributes.setSqlExamples(pPluginType, pPluginName);
              // lov columns
              if (apex.jQuery.inArray("LOV_DISPLAY_NULL", lStandardAttributeList)!=-1) {
                lAttributeList.push('LOV_DISPLAY_NULL');
                if ($v(pItemPrefix+'LOV_DISPLAY_NULL')==='YES') {
                  lAttributeList.push('LOV_NULL_TEXT');
                }
              }
              if (apex.jQuery.inArray("CASCADING_LOV", lStandardAttributeList)!=-1) {
                lAttributeList.push('LOV_CASCADE_PARENT_ITEMS');
                if (!apex.item(pItemPrefix+'LOV_CASCADE_PARENT_ITEMS').isEmpty()) {
                  lAttributeList.push('AJAX_ITEMS_TO_SUBMIT');
                  lAttributeList.push('AJAX_OPTIMIZE_REFRESH');
                }
              }
            }
            // has Quick Pick
            if (apex.jQuery.inArray("QUICKPICK", lStandardAttributeList)!=-1) {
              lRegionList.push('#QP');
            }
            // has Read Only
            if (apex.jQuery.inArray("READONLY", lStandardAttributeList)!=-1) {
              lRegionList.push('#READONLY');
            }
            // has Escape Output
            if (apex.jQuery.inArray("ESCAPE_OUTPUT", lStandardAttributeList)!=-1) {
              lAttributeList.push('ESCAPE_ON_HTTP_OUTPUT');
            }
          }
          // has element
          if (apex.jQuery.inArray("ELEMENT", lStandardAttributeList)!=-1) {
            lRegionList.push('#ELEMENT');
          }
          // has source section
          if (apex.jQuery.inArray("SOURCE", lStandardAttributeList)!=-1) {
            lRegionList.push('#SOURCE');
            lRegionList.push('#DEFAULT');
          }
          // has encrypt
          if (apex.jQuery.inArray("ENCRYPT", lStandardAttributeList)!=-1) {
            lAttributeList.push('ENCRYPT_SESSION_STATE_YN');
          }
          // special handling for Stop and Start HTML Table which is a non-visible item type but which should still show the label! Very strange widget!
          if (pPluginName==="NATIVE_STOP_AND_START_HTML_TABLE") {
            lRegionList.push('#LABEL');
            lRegionList.push('#HELP');
          }

          // show all standard attributes which should be visible
          apex.jQuery.each(lAttributeList, function(){
            apex.item(pItemPrefix+this ).show();
          });
          // show all standard regions which should be visible
          apex.jQuery(lRegionList.join())
            .show()
            .each(function(){
              if (this.id === "GRID") {
                apex.builder.grid.showItemEdit();
              } else {
                apex.builder.anchor.show(this.id);
              }
            });
          break;
        case 'REGION TYPE':

          // hide standard attribute fields
          apex.jQuery.each(['AJAX_ITEMS_TO_SUBMIT', 'ESCAPE_ON_HTTP_OUTPUT'], function(){
            apex.item(pItemPrefix+this ).hide();
          });
          // hide standard attribute regions
          apex.jQuery('#SOURCE,#SQL_EXAMPLES')
            .hide()
            .each(function(){
              apex.builder.anchor.hide(this.id);
            });
          // provide default values if it's not a plugin
          if (!pPluginList[pPluginName]) {
            lStandardAttributeList=["SOURCE_PLAIN"];
          } else {
            lStandardAttributeList=pPluginList[pPluginName].standardAttributes.split(':');
            lHasSqlExamples=pPluginList[pPluginName].hasSqlExamples;
          }
          // region has source
          if (apex.jQuery.inArray("SOURCE_PLAIN", lStandardAttributeList)!=-1 || apex.jQuery.inArray("SOURCE_SQL", lStandardAttributeList)!=-1) {
            lRegionList.push('#SOURCE');

            // show SQL examples
            if (apex.jQuery.inArray("SOURCE_SQL", lStandardAttributeList)!=-1) {
              apex.builder.dynamicAttributes.setSqlExamples(pPluginType, pPluginName);
              lRegionList.push('#SQL_EXAMPLES');
            }
          }
          // has Page Items to Submit
          if (apex.jQuery.inArray("AJAX_ITEMS_TO_SUBMIT", lStandardAttributeList) !=-1 ||
              apex.jQuery.inArray(pPluginName, [ "NATIVE_IR",
                                                 "NATIVE_SQL_REPORT",
                                                 "NATIVE_FNC_REPORT",
                                                 "NATIVE_TABFORM" ]) !=-1
             ) {
            lAttributeList.push('AJAX_ITEMS_TO_SUBMIT');
          }
          // has Escape Output
          if (apex.jQuery.inArray("ESCAPE_OUTPUT", lStandardAttributeList)!=-1) {
            lAttributeList.push('ESCAPE_ON_HTTP_OUTPUT');
          }
          // show all standard attributes which should be visible
          apex.jQuery.each(lAttributeList, function(){
            apex.item(pItemPrefix+this ).show();
          });
          // show all standard regions which should be visible
          if (lRegionList.length > 0) {
            apex.jQuery(lRegionList.join())
              .show()
              .each(function(){
                apex.builder.anchor.show(this.id);
              });
          }

          break;
        case 'DYNAMIC ACTION':

          // hide standard attributes
          apex.item(pItemPrefix+'STOP_EXECUTION_ON_ERROR').hide();
          apex.item(pItemPrefix+'WAIT_FOR_RESULT').hide();
          // if the region exists
          $x_Hide('AFFECTED_ELEMENTS');
          apex.builder.anchor.hide('AFFECTED_ELEMENTS');

          // exit if no plug-in has been selected yet
          if (!pPluginName) { return; }

          lStandardAttributeList=pPluginList[pPluginName].standardAttributes.split(':');

          // has stop execute on error
          if (apex.jQuery.inArray("STOP_EXECUTION_ON_ERROR", lStandardAttributeList)!=-1) {
            apex.item(pItemPrefix+'STOP_EXECUTION_ON_ERROR').show();
          }
          // has stop execute on error
          if (apex.jQuery.inArray("WAIT_FOR_RESULT", lStandardAttributeList)!=-1) {
            apex.item(pItemPrefix+'WAIT_FOR_RESULT').show();
          }

          // check page on load flag
          if (!pKeepValues) {
            if (apex.jQuery.inArray("ONLOAD", lStandardAttributeList)!=-1) {
              $s(pItemPrefix+'EXECUTE_ON_PAGE_INIT', 'Y');
            } else {
              $s(pItemPrefix+'EXECUTE_ON_PAGE_INIT', null);
            }
          }

          // handling of the affected element types
          var lCurrentElementsType = $v(pItemPrefix+'AFFECTED_ELEMENTS_TYPE');
          // remove all affected element type options except of null entry
          apex.jQuery('#'+pItemPrefix+'AFFECTED_ELEMENTS_TYPE option[value!=""]').remove();
          // enable all those which are available
          var lAffectedTypeList = [];
          if (apex.jQuery.inArray("ITEM",                  lStandardAttributeList)!=-1) { lAffectedTypeList.push("ITEM"); }
          if (apex.jQuery.inArray("BUTTON",                lStandardAttributeList)!=-1) { lAffectedTypeList.push("BUTTON"); }
          if (apex.jQuery.inArray("REGION",                lStandardAttributeList)!=-1) { lAffectedTypeList.push("REGION"); }
          if (apex.jQuery.inArray("JQUERY_SELECTOR",       lStandardAttributeList)!=-1) { lAffectedTypeList.push("JQUERY_SELECTOR"); }
          if (apex.jQuery.inArray("TRIGGERING_ELEMENT",    lStandardAttributeList)!=-1) { lAffectedTypeList.push("TRIGGERING_ELEMENT"); }
          if (apex.jQuery.inArray("EVENT_SOURCE",          lStandardAttributeList)!=-1) { lAffectedTypeList.push("EVENT_SOURCE"); }
          if (apex.jQuery.inArray("JAVASCRIPT_EXPRESSION", lStandardAttributeList)!=-1) {
              lAffectedTypeList.push("DOM_OBJECT");
              lAffectedTypeList.push("JAVASCRIPT_EXPRESSION");
          }

          // if type plugin doesn't have any type, hide region or field
          if (lAffectedTypeList.length == 0) {
            // if the region exists
            $x_Hide('AFFECTED_ELEMENTS');
            apex.builder.anchor.hide('AFFECTED_ELEMENTS');
            apex.item(pItemPrefix+'AFFECTED_ELEMENTS_TYPE').hide();
            $s(pItemPrefix+'AFFECTED_ELEMENTS_TYPE', ''); // will also trigger hiding of all fields
          } else {
            // affected elements are available for this plugin
            $x_Show('AFFECTED_ELEMENTS');
            apex.builder.anchor.show('AFFECTED_ELEMENTS');
            apex.item(pItemPrefix+'AFFECTED_ELEMENTS_TYPE').show();
            // clone all affected element types which have been defined for this plugin from our ELEMENTS_TYPE_CLONE select list
            // created in the region footer of "Affect Elements"
            apex.jQuery.each(lAffectedTypeList, function(){
              apex.jQuery('#ELEMENTS_TYPE_CLONE option[value="'+this+'"]').clone().appendTo('#'+pItemPrefix+'AFFECTED_ELEMENTS_TYPE');
            });
            // Restore original value, if it's not in the list it will not be set
            $s(pItemPrefix+'AFFECTED_ELEMENTS_TYPE', lCurrentElementsType);
          }
          break;
        case 'AUTHENTICATION TYPE':
          // Does the Authentication plug-in have an Invalid Session region?
          if (pPluginName && pPluginList[pPluginName].standardAttributes === "INVALID_SESSION") {
            apex.jQuery('#INVALID_SESSION_ATTRIBUTES').show();
          } else {
            apex.jQuery('#INVALID_SESSION_ATTRIBUTES').hide();
          }
          break;
        default:
      }
    } // not on page 4446
  }, // show

  // Used to show a specific dynamic attribute based on if the condition is true.
  // If it's false the field is hided.
  //   pItemPrefix:    Prefix for all dynamic attribute fields
  //   pIndex:         Index withing the pAttributeList
  //   pAttributeList: Array of attribute definitions for the selected plug-in
  showHideAttribute: function(pItemPrefix, pIndex, pAttributeList, pIsWizard, pUiType){
    var lPrefix = pItemPrefix + 'ATTRIBUTE_',
        lId     = lPrefix + ((pIndex < 9)?'0':'')+(pIndex+1); // array index starts with 0 but our items start with 1

    function isDisplayed(pIndex){
      var lDisplay = ( pIsWizard ? pAttributeList[pIndex].showInWizard : true ),
          lValue,
          lDependingOnExpr,
          lIsMultiValue;

      // check ui type if available
      if ( lDisplay && pUiType && pAttributeList[pIndex].supportedUiTypes ) {
          lDisplay = ( apex.jQuery.inArray( pUiType, pAttributeList[pIndex].supportedUiTypes.split( ":" )) !== -1 );
      }

      // check condition
      if ( lDisplay && pAttributeList[pIndex].dependingOnAttrSeq && pAttributeList[pIndex].dependingOnCondType) {

        // recursive call to check the whole dependency chain
        // Note: we have to use -1 because the array starts with 0
        lDisplay = isDisplayed(parseInt(pAttributeList[pIndex].dependingOnAttrSeq, 10)-1);
        // only if all parents are displayed, we check the current attribute as well
        if (lDisplay) {
          lValue           = $v(lPrefix+pAttributeList[pIndex].dependingOnAttrSeq);
          lDependingOnExpr = pAttributeList[pIndex].dependingOnExpr;
          // Note: we have to use -1 because the array starts with 0 and dependingOnAttrSeq uses the original attribute seq
          //       which starts with 1
          lIsMultiValue    = pAttributeList[parseInt(pAttributeList[pIndex].dependingOnAttrSeq, 10)-1].type === "CHECKBOXES"?true:false;

          if (lIsMultiValue) {
            lValue = (lValue === ""?[]:lValue.split(":"));
          }

          switch (pAttributeList[pIndex].dependingOnCondType) {
            case 'EQUALS':
              if (lIsMultiValue) {
                lDisplay = (apex.jQuery.inArray(lDependingOnExpr, lValue) != -1);
              } else {
                lDisplay = (lValue === lDependingOnExpr);
              }
              break;
            case 'NOT_EQUALS':
              if (lIsMultiValue) {
                lDisplay = (apex.jQuery.inArray(lDependingOnExpr, lValue) === -1);
              } else {
                lDisplay = (lValue !== lDependingOnExpr);
              }
              break;
            case 'IN_LIST':
              lDependingOnExpr = lDependingOnExpr.split(',');
              if (lIsMultiValue) {
                lDisplay = false;
                // Check if any of the values in the value array equals any of
                // the values in the depending on expression array
                apex.jQuery.each(lValue, function(pIndex, pValue) {
                    lDisplay = (apex.jQuery.inArray(pValue, lDependingOnExpr) !== -1);
                    // If result is true, then exit iterator.
                    if (lDisplay) { return false; };
                });
              } else {
                lDisplay = (apex.jQuery.inArray(lValue, lDependingOnExpr)!==-1);
              }
              break;
            case 'NOT_IN_LIST':
              lDependingOnExpr = lDependingOnExpr.split(',');
              if (lIsMultiValue) {
                lDisplay = true;
                // Check if any of the values in the value array do not
                // equal any the values in the depending on expression array.
                apex.jQuery.each(lValue, function(pIndex, pValue) {
                  lDisplay = (apex.jQuery.inArray(pValue, lDependingOnExpr) === -1);
                  if (!lDisplay) { return false; };
                });
              } else {
                lDisplay = (apex.jQuery.inArray(lValue, lDependingOnExpr)===-1);
              }
              break;
            case 'NULL':
              if (lIsMultiValue) {
                lDisplay = (lValue.length === 0);
              } else {
                lDisplay = !(lValue);
              }
              break;
            case 'NOT_NULL':
              if (lIsMultiValue) {
                lDisplay = (lValue.length > 0);
              } else {
                lDisplay = (lValue);
              }
              break;
          }
        }
      }
      return lDisplay;
    }; // isDisplayed

    // show/hide the dynamic attribute
    if (isDisplayed(pIndex)){
      apex.item(lId).show();
    } else {
      apex.item(lId).hide();
    }
    // simulate a change so that depending attributes are getting refreshed as well
    apex.jQuery('#'+lId).change();
  }, // showHideAttribute

  // Used to display the help text for a dynamic attribute
  help: function(pApplicationId, pItemName){
    var lUrl = 'wwv_flow_item_help.show_plugin_attribute_help' +
               '?p_application_id='+(pApplicationId ? pApplicationId : $v('pFlowId')) +
               '&p_builder_page_id='+$v('pFlowStepId') +
               '&p_session_id='+$v('pInstance') +
               '&p_plugin_type='+apex.builder.dynamicAttributes.gCurrentSelection.pluginType +
               '&p_plugin_name='+apex.builder.dynamicAttributes.gCurrentSelection.pluginName +
               '&p_attribute_scope='+($v('pFlowStepId') == 4446 ? "APPLICATION" : "COMPONENT") +
               '&p_attribute_sequence='+pItemName.substr(pItemName.length-2); // get the last two digits

    apex.theme.popupFieldHelp( "", "", lUrl );
  }, // help

  setSqlExamples: function(pPluginType, pPluginName) {
    // initialize the AJAX call parameters
    var lData = { p_request: "APPLICATION_PROCESS=get_plugin_sql_examples",
                  p_flow_id: $v('pFlowId'),
                  p_flow_step_id: $v('pFlowStepId'),
                  p_instance: $v('pInstance'),
                  x01: pPluginType,
                  x02: pPluginName
                };

    // perform the AJAX call
    apex.jQuery.ajax({
      // try to leverage ajaxQueue plugin to abort previous requests
      mode: "abort",
      // limit abortion to this input
      port: "setSqlExamples",
      type: "post",
      url: "wwv_flow.show",
      data: lData,
      success: function(pData){ apex.jQuery('#bodySQL_EXAMPLES').html(pData); }
      });
  }

}; // dynamicAttributes

// delegated help button handler for dynamic attributes
// this is similar to handlers in theme.js
$( document ).ready(function() {
    $( document.body ).on( "click", ".js-dynamicItemHelp", function( event ) {
        var itemName = $( this ).attr( "data-itemname" ),
            appId = $( this ).attr( "data-appid" );
        if ( itemName && appId ) {
            apex.builder.dynamicAttributes.help( appId, itemName );
        }
    } ).on( "keydown", function( event ) {
        // if Alt+F1 pressed show item help if on an item
        if ( event.which === 112 && event.altKey) {
            // look for associated item help
            // There is no direct association between anything related to an item that takes focus
            // and the help button which gives the item id but this does a good job of finding
            // the closest help button which is generally the right one
            $( event.target ).parents().each(function(i){
                var helpElement$, itemName, appId;

                if ( i > 4 ) {
                    return false; // don't look too hard
                }
                helpElement$ = $( this ).find( ".js-dynamicItemHelp" );
                if ( helpElement$.length ) {
                    itemName = helpElement$.attr( "data-itemname" );
                    appId = helpElement$.attr( "data-appid" );
                    if ( itemName && appId ) {
                        apex.builder.dynamicAttributes.help( appId, itemName );
                    }
                    return false;
                }
            });
        }
    });

});


apex.builder.grid = {

show: function(pPagePrefix, pItemPrefix) {

    var lResult = {
            hasGridSupport:     ( $v( pPagePrefix + "GRID_HAS_GRID_SUPPORT" ) === "Y" ),
            usesTable:          ( $v( pPagePrefix + "GRID_USES_TABLE" ) === "Y" ),
            hasLabelColumnSpan: ( $v( pPagePrefix + "GRID_HAS_LABEL_COLUMN_SPAN" ) === "Y" ),
            hasColumnCss:       ( $v( pPagePrefix + "GRID_HAS_COLUMN_CSS" ) === "Y" ),
            hasColumnAttrs:     ( $v( pPagePrefix + "GRID_HAS_COLUMN_ATTRS" ) === "Y" ),
            showNewGrid:        false,
            showNewRow:         false,
            showNewColumn:      false,
            isNewColumn:        false,
            pagePrefix:         pPagePrefix,
            itemPrefix:         pPagePrefix + pItemPrefix };

    if ( lResult.hasGridSupport ) {
        apex.builder.anchor.show("GRID");
        apex.jQuery("#GRID").show();
        apex.item( lResult.itemPrefix + "GRID_COLUMN" ).show( true );

        if ( $v( pPagePrefix + "GRID_HAS_NEW_GRID" ) === "Y" ) {
            lResult.showNewGrid = true;
        }

        if ( !lResult.showNewGrid || $v( lResult.itemPrefix + "NEW_GRID" ) === "N" ) {
            lResult.showNewRow = true;
        }

        if ( apex.item( lResult.itemPrefix + "GRID_COLUMN" ).isEmpty() &&
             ( lResult.showNewRow && $v( lResult.itemPrefix + "NEW_GRID_ROW" ) === "N" )
           )
        {
            lResult.showNewColumn = true;
        }

        // Are we dealing with a new grid column?
        // - "Start New Row" is not displayed
        // - "Start New Row" = Y
        // - "Start New Column" is not displayed (it's a new line or a column no is set
        // - "Start New Column" = Y
        if ( !lResult.showNewRow ||
             ( lResult.showNewRow && $v( lResult.itemPrefix + "NEW_GRID_ROW" ) === "Y" ) ||
             !lResult.showNewColumn ||
             ( lResult.showNewColumn && $v( lResult.itemPrefix + "NEW_GRID_COLUMN" ) === "Y" )
           )
        {
            lResult.isNewColumn = true;
        }

        if ( lResult.showNewGrid ) {
            apex.item( lResult.itemPrefix + "NEW_GRID" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "NEW_GRID" ).hide( true );
        }

        if ( lResult.showNewRow ) {
            apex.item( lResult.itemPrefix + "NEW_GRID_ROW" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "NEW_GRID_ROW" ).hide( true );
        }

        if ( lResult.showNewColumn ) {
            apex.item( lResult.itemPrefix + "NEW_GRID_COLUMN" ).show( false );
        } else {
            apex.item( lResult.itemPrefix + "NEW_GRID_COLUMN" ).hide( false );
        }

        if ( $v( pPagePrefix + "GRID_HAS_COLUMN_SPAN" ) === "Y" && lResult.isNewColumn ) {
            apex.item( lResult.itemPrefix + "GRID_COLUMN_SPAN" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "GRID_COLUMN_SPAN" ).hide( true );
        }

        if ( lResult.hasLabelColumnSpan && lResult.isNewColumn ) {
            apex.item( lResult.itemPrefix + "GRID_LABEL_COLUMN_SPAN" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "GRID_LABEL_COLUMN_SPAN" ).hide( true );
        }

        if ( lResult.hasColumnCss && lResult.isNewColumn ) {
            apex.item( lResult.itemPrefix + "GRID_COLUMN_CSS" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "GRID_COLUMN_CSS" ).hide( true );
        }

        if ( lResult.hasColumnAttrs && lResult.isNewColumn ) {
            apex.item( lResult.itemPrefix + "GRID_COLUMN_ATTR" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "GRID_COLUMN_ATTR" ).hide( true );
        }

    } else {
        apex.builder.anchor.hide("GRID");
        apex.jQuery("#GRID").hide();
    }

    return lResult;
},

refreshGridColumns: function(pItemPrefix) {
    var lPagePrefix = "P" + $v("pFlowStepId") + "_";

    if ( $v( lPagePrefix + "GRID_HAS_GRID_SUPPORT" ) === "Y" ) {
        apex.jQuery( "#" + lPagePrefix + pItemPrefix + "GRID_COLUMN" ).trigger( "apexrefresh" );
        apex.jQuery( "#" + lPagePrefix + pItemPrefix + "GRID_COLUMN_SPAN" ).trigger( "apexrefresh" );
    }
},

initRegionEdit: function() {
    var lPagePrefix = "#P" + $v("pFlowStepId") + "_";

    apex.jQuery( lPagePrefix + "PLUG_NEW_GRID," + lPagePrefix + "PLUG_NEW_GRID_ROW," + lPagePrefix + "PLUG_GRID_COLUMN," + lPagePrefix + "PLUG_NEW_GRID_COLUMN" ).change( apex.builder.grid.showRegionEdit );

    // Fire the show grid after the region selector code has kicked,
    // because that one would show our grid region again
    setTimeout(apex.builder.grid.showRegionEdit, 1);
},

showRegionEdit: function() {
    apex.builder.grid.show("P" + $v("pFlowStepId") + "_", "PLUG_");
},

initItemEdit: function() {
    var lPagePrefix = "#P" + $v("pFlowStepId") + "_";

    apex.jQuery( lPagePrefix + "NEW_GRID," + lPagePrefix + "NEW_GRID_ROW," + lPagePrefix + "GRID_COLUMN," + lPagePrefix + "NEW_GRID_COLUMN," + lPagePrefix + "LABEL_ALIGNMENT" ).change( apex.builder.grid.showItemEdit );
},

showItemEdit: function() {
    var lResult;

    lResult = apex.builder.grid.show("P" + $v("pFlowStepId") + "_", "");

    if ( lResult.hasGridSupport ) {

        if ( lResult.usesTable && lResult.isNewColumn ) {
            apex.item( lResult.itemPrefix + "GRID_ROW_SPAN" ).show( false );
            // label attribute
            apex.item( lResult.itemPrefix + "LABEL_ALIGNMENT" ).show( true );
            // field attribute
            apex.item( lResult.itemPrefix + "FIELD_ALIGNMENT" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "GRID_ROW_SPAN" ).hide( false );
            // label attribute
            apex.item( lResult.itemPrefix + "LABEL_ALIGNMENT" ).hide( true );
            // field attribute
            apex.item( lResult.itemPrefix + "FIELD_ALIGNMENT" ).hide( true );
        }

        // label attribute
        if ( lResult.usesTable && lResult.isNewColumn && $v( lResult.itemPrefix + "LABEL_ALIGNMENT" ) != "ABOVE"  ) {
            apex.item( lResult.itemPrefix + "CATTRIBUTES" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "CATTRIBUTES" ).hide( true );
        }

        // read only attribute
        if ( lResult.usesTable && lResult.isNewColumn && lResult.hasColumnAttrs ) {
            apex.item( lResult.itemPrefix + "READ_ONLY_DISP_ATTR" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "READ_ONLY_DISP_ATTR" ).hide( true );
        }

    } else {
        apex.item( lResult.itemPrefix + "LABEL_ALIGNMENT" ).hide( true );
        apex.item( lResult.itemPrefix + "FIELD_ALIGNMENT" ).hide( true );
        apex.item( lResult.itemPrefix + "CATTRIBUTES" ).hide( true );
        apex.item( lResult.itemPrefix + "READ_ONLY_DISP_ATTR" ).hide( true );
    }
},

initButtonEdit: function() {
    var lPagePrefix = "#P" + $v("pFlowStepId") + "_";

    apex.jQuery( lPagePrefix + "NEW_GRID," + lPagePrefix + "NEW_GRID_ROW," + lPagePrefix + "GRID_COLUMN," + lPagePrefix + "NEW_GRID_COLUMN" ).change( apex.builder.grid.showButtonEdit );

    // Fire the show grid after the region selector code has kicked,
    // because that one would show our grid region again
    setTimeout(apex.builder.grid.showButtonEdit, 1);
},


showButtonEdit: function() {
    var lResult;

    lResult = apex.builder.grid.show("P" + $v("pFlowStepId") + "_", "");

    if ( lResult.hasGridSupport ) {

        if ( lResult.usesTable && lResult.isNewColumn ) {
            apex.item( lResult.itemPrefix + "GRID_ROW_SPAN" ).show( false );
            // field attribute
            apex.item( lResult.itemPrefix + "FIELD_ALIGNMENT" ).show( true );
        } else {
            apex.item( lResult.itemPrefix + "GRID_ROW_SPAN" ).hide( false );
            // field attribute
            apex.item( lResult.itemPrefix + "FIELD_ALIGNMENT" ).hide( true );
        }

    } else {
        apex.item( lResult.itemPrefix + "FIELD_ALIGNMENT" ).hide( true );
    }
}

}; // apex.builder.grid


/**
 * Namespace for APEX Builder specific plugins
 *
 * @namespace
 * */
apex.builder.plugin = {

    /**
     * Shows/hides the EXPRESSION1/2 fields depending on the selected condition
     **/
    initConditionItems: function( pConditionType, pExpression1, pExpression2, pExpressionCheck, pReadOnlyAttribute, pLovNullValue, pExecuteForEachRow ) {

      function setConditionItems() {
          var lValue = $v(pConditionType),
              lNoExpressionsList = [ /* no additional input required */
                  'NEVER', 'ALWAYS', 'BROWSER_IS_NSCP', 'BROWSER_IS_MSIE', 'BROWSER_IS_MSIE_OR_NSCP', 'BROWSER_IS_OTHER', 'WHEN_ANY_ITEM_IN_CURRENT_PAGE_HAS_CHANGED',
                  'WHEN_THIS_PAGE_SUBMITTED', 'WHEN_THIS_PAGE_NOT_SUBMITTED', 'PAGE_IS_IN_PRINTER_FRIENDLY_MODE', 'PAGE_IS_NOT_IN_PRINTER_FRIENDLY_MODE',
                  'USER_IS_NOT_PUBLIC_USER', 'USER_IS_PUBLIC_USER', 'DISPLAYING_INLINE_VALIDATION_ERRORS', 'NOT_DISPLAYING_INLINE_VALIDATION_ERRORS',
                  'MAX_ROWS_LT_ROWS_FETCHED', 'MIN_ROW_GT_THAN_ONE', 'IS_READ_ONLY', 'IS_NOT_READ_ONLY' ],
              lOneExpressionList = [ /* Expression 1 field required */
                  'EXISTS', 'NOT_EXISTS', 'SQL_EXPRESSION', 'PLSQL_EXPRESSION', 'PLSQL_ERROR', 'FUNCTION_BODY',
                  'FUNC_BODY_RETURNING_BOOLEAN','FUNC_BODY_RETURNING_ERR_TEXT',
                  'ITEM_IS_NULL', 'ITEM_IS_NOT_NULL','ITEM_NOT_NULL','ITEM_IS_ZERO', 'ITEM_IS_NOT_ZERO', 'ITEM_IS_NULL_OR_ZERO',
                  'ITEM_NOT_NULL_OR_ZERO', 'ITEM_CONTAINS_NO_SPACES', 'ITEM_IS_NUMERIC', 'ITEM_IS_NOT_NUMERIC',
                  'ITEM_IS_ALPHANUMERIC', 'REQUEST_EQUALS_CONDITION', 'REQUEST_NOT_EQUAL_CONDITION', 'REQUEST_IN_CONDITION',
                  'REQUEST_NOT_IN_CONDITION', 'CURRENT_PAGE_EQUALS_CONDITION', 'CURRENT_PAGE_NOT_EQUAL_CONDITION',
                  'CURRENT_PAGE_IN_CONDITION', 'CURRENT_PAGE_NOT_IN_CONDITION', 'CURRENT_LANG_IN_COND1', 'CURRENT_LANG_NOT_IN_COND1', 'CURRENT_LANG_NOT_EQ_COND1',
                  'CURRENT_LANG_EQ_COND1', 'DAD_NAME_EQ_CONDITION', 'DAD_NAME_NOT_EQ_CONDITION', 'SERVER_NAME_EQ_CONDITION',
                  'SERVER_NAME_NOT_EQ_CONDITION', 'HTTP_HOST_EQ_CONDITION', 'HTTP_HOST_NOT_EQ_CONDITION' ],
              lCheckExpressionList = [ /* Show "Check" checkbox for Expression 1 */
                  'EXISTS', 'NOT_EXISTS', 'SQL_EXPRESSION', 'PLSQL_EXPRESSION', 'PLSQL_ERROR','FUNCTION_BODY','FUNC_BODY_RETURNING_BOOLEAN','FUNC_BODY_RETURNING_ERR_TEXT' ];

          // no additional input required or condition type is empty
          if (apex.jQuery.inArray(lValue, lNoExpressionsList) != -1 || lValue===pLovNullValue || lValue==="" || lValue==="%null%") {
              apex.item( pExpression1 ).hide();
              apex.item( pExpression2 ).hide();
              // expression 1 is required
          } else if (apex.jQuery.inArray(lValue, lOneExpressionList) != -1) {
              apex.item( pExpression1 ).show();
              apex.item( pExpression2 ).hide();
              // both expression fields are required
          } else {
              apex.item( pExpression1 ).show();
              apex.item( pExpression2 ).show();
          }

          // show/hide the "Check" expression checkbox if available
          if (pExpressionCheck!=="") {
              if (apex.jQuery.inArray(lValue, lCheckExpressionList) != -1) {
                  apex.item( pExpressionCheck ).show();
              } else {
                  apex.item( pExpressionCheck ).hide();
              }
          }

          // show/hide the read only attribute field if available
          if (pReadOnlyAttribute!=="") {
              if (lValue==="" || lValue===pLovNullValue || lValue==="%null%" || lValue==="NEVER") {
                  apex.item( pReadOnlyAttribute ).hide();
              } else {
                  apex.item( pReadOnlyAttribute ).show();
              }
          }

          // show/hide the "Execute Condition for each Row" field if available
          if (pExecuteForEachRow!=="") {
              // no additional input required or condition type is empty
              if (apex.jQuery.inArray(lValue, lNoExpressionsList) != -1 || lValue===pLovNullValue || lValue==="" || lValue==="%null%") {
                  apex.item( pExecuteForEachRow ).hide();
              } else {
                  apex.item( pExecuteForEachRow ).show();
              }
          }

      } // setConditionItems

      apex.jQuery( "#" + pConditionType ).change( function() {
          setConditionItems();
      } );
      // because a call to this init function is rendered first and affects items rendered after it
      // delay calling the initial setConditionItems until after the items are initialized.
      setTimeout(function() {
          setConditionItems();
      }, 1);
  },

  /**
   * Executes a SQL statement on the server and writes the result into the
   * specified DOM object
   * */
  getData: function() {
    var lPageItemsToSubmit = this.action.attribute01;
    var lAjaxRequest = new htmldb_Get(null, $v('pFlowId'), "PLUGIN="+this.action.ajaxIdentifier, $v('pFlowStepId'));
    var lAjaxResult  = null;
    // Set session state with the AJAX request for all page items which are defined
    // in our "Page Items to submit" attribute. Again we can use jQuery.each to
    // loop over the array of page items.
    apex.jQuery.each(
      lPageItemsToSubmit.split(','), // this will create an array
      function() {
        var lPageItem = apex.jQuery('#'+this)[0]; // get the DOM object
        // Only if the page item exists, we add it to the AJAX request
        if (lPageItem) {
          lAjaxRequest.add(this, $v(lPageItem)); }
      });
    // let's execute the AJAX request
    lAjaxResult = lAjaxRequest.get();
    // Assign the result to each affected element. Again we use jQuery.each to
    // loop over all affected elements. Remember, "this.affectedElements" is a jQuery object, that's
    // why we can use all the jQuery functions on it.
    if (lAjaxResult) {
      this.affectedElements.each(
        function() {
          $s(this, lAjaxResult);
        });
    }
  },

    /**
     * groupSelectList initialization
     **/
    groupSelectList: function( pSelector, pOptions ) {
        var lOptions = apex.jQuery.extend({
                           nullValue: ""
                           }, pOptions),
            lGroupSelect$ = apex.jQuery( pSelector );

        // Register apex.item callbacks
        lGroupSelect$.each( function() {
            apex.widget.initPageItem( this.id, {
                nullValue: lOptions.nullValue
            });
        });
    },

    /**
     * UI Components Select List initialization
     **/
    uiComponentsSelectList: function( pPageItemName, pOptions ) {
        var lOptions = apex.jQuery.extend({
                           nullValue: ""
                           }, pOptions),
            lSelectList$ = apex.jQuery( "#" + pPageItemName ),
            lOptionsHtml = lSelectList$.html();

        // Register apex.item callbacks
        apex.widget.initPageItem( pPageItemName, {
            nullValue: lOptions.nullValue
        });
        // Hide all unsupported components, but not if it's the current selection
        lSelectList$.find( "[data-supported=false]:not([value='" + $v( pPageItemName ) + "'])" ).remove();
        // Register a change event to show "unsupported" components if the user wants to see them
        lSelectList$.change(function() {
            if ( $v( pPageItemName ) === "$UNSUPPORTED$" ) {
                // Restore the original options
                lSelectList$
                    .empty()
                    .append( lOptionsHtml );
                // Remove the "Show unsupported components" entry
                lSelectList$.find( "option[value='$UNSUPPORTED$']" ).remove();
            }
        });
    },

    /**
     * Wizard Selection
     **/
    wizardSelection: function( pPageItemName, pOptions ) {

        var gWizardSelection$ = $( "#" + pPageItemName + "_SELECTION", apex.gPageContext$ ),
            gWizardSelectionHidden$ = $( "#" + pPageItemName, apex.gPageContext$ );

        // Initialize Icon List
        gWizardSelection$.iconList({
            navigation: true,
            label:      ".a-IconList-iconName",
            activate:   function( event, ui ) {
                gWizardSelectionHidden$
                    .val( ui.values[ 0 ] )
                    .trigger( "change" );
                if( pOptions.submitPage ){
                    apex.submit( "NEXT" );
                }
                event.preventDefault();
            },
            selectionChange: function( event ) {
                var values = $( this ).iconList( "getSelectionValues" );
                gWizardSelectionHidden$
                    .val( values [ 0 ] )
                    .trigger( "change" );
            }
        });

        // Register apex.item callbacks
        apex.widget.initPageItem( pPageItemName, {
            setValue:   _setValue,
            nullValue:  "",
            setFocusTo: function() {
                // this should return the jQuery object to set focus to but the iconList widget doesn't work that way
                // so do what must be done
                gWizardSelection$.iconList( "focus" );
                // and return fake object with focus method to keep caller happy
                return {focus:function(){}};
            }
        });

        // Sets an existing option
        function _setValue( pValue ) {
            gWizardSelectionHidden$.val( pValue );

            // todo setSelection also, need to determine index by value passed

        } // _setValue

        // Clears the existing options
        function _clearList() {
            gWizardSelection$.empty();
        } // _clearList

        // Called by the AJAX success callback and adds the entries stored in the
        // JSON structure
        function _addResult( pData ) {
            var lSelectionValues;
            gWizardSelection$.append( pData.entries );
            gWizardSelection$.iconList( "refresh" );
            gWizardSelection$.iconList( "setSelection", gWizardSelection$.children().first() );
            lSelectionValues = gWizardSelection$.iconList( "getSelectionValues" );
            gWizardSelectionHidden$
                .val( lSelectionValues[ 0 ] )
                .trigger( "change" );
        } // _addResult

        // Clears the existing options and executes an AJAX call to get new values based
        // on the depending on fields
        function refresh() {

            apex.widget.util.cascadingLov(
                gWizardSelection$,
                pOptions.ajaxIdentifier,
                {
                    pageItems: $( pOptions.pageItemsToSubmit, apex.gPageContext$ )
                },
                {
                    optimizeRefresh: pOptions.optimizeRefresh,
                    dependingOn:     $( pOptions.dependingOnSelector, apex.gPageContext$ ),
                    success:         _addResult,
                    clear:           _clearList
                });

        } // refresh

        // if it's a cascading select list we have to register apexbeforerefresh and change events for our masters
        if ( pOptions.dependingOnSelector ) {
            $( pOptions.dependingOnSelector, apex.gPageContext$ )
                .on( "apexbeforerefresh", _clearList )
                .change( refresh );
        }

        // Final initialisation for initial selection and event bindings
        gWizardSelection$
            .on( "apexrefresh", refresh );

    },


    /**
     * Template Options
     **/
    templateOptions: function (pPageItemName, pOptions) {

        var gTemplOpt        = apex.jQuery('#'+pPageItemName),
            gTemplOptHidden  = apex.jQuery('#'+pPageItemName+'_HIDDEN'),
            gTemplOptDefault = apex.jQuery('#'+pPageItemName+'_DEFAULT'),
            gTemplOptItems   = apex.jQuery('#'+pPageItemName+'_CONTAINER select, #'+pPageItemName+'_CONTAINER input[type=checkbox]'),
            gDefaultOptions  = new Array();
        

        function syncHiddenField() {

            var lCSSClasses = '';
            var ldefaultSelected = false;

             // check if default selector is enabled and enable / disable default options accordingly
            gTemplOptDefault = apex.jQuery('#'+pPageItemName+'_DEFAULT');
            gDefaultOptions = gTemplOptDefault.val().split(':');

            apex.jQuery('div#'+pPageItemName+'_CONTAINER input[type=checkbox]').each(function(i) {
               // determine whether default selector is enabled or not
               if (i == 0) {ldefaultSelected = ($v(this.id)=='#DEFAULT#');} 
               // update options that are part of the default
               if(apex.jQuery.inArray(apex.jQuery('#'+this.id).val(),gDefaultOptions) !== -1) {
                   apex.jQuery(this).prop( "disabled", ldefaultSelected );
                   if (ldefaultSelected) {
                       apex.jQuery(this).prop( "checked", true );
                       apex.jQuery(this).parent().addClass('is-disabled');
                   } else {
                       apex.jQuery(this).parent().removeClass('is-disabled');
                   }
               }    
            });
 
           // loop through all items in field set and assemble CSS classes string based on current values
            gTemplOptItems.each(function(i) {
                if (apex.jQuery(this).is(':enabled')) {
                  lCSSClasses = lCSSClasses + ($v(this.id).length>0 ? ':'+$v(this.id) : ''); 
                } 
            });
            gTemplOptHidden.val(lCSSClasses.substring(1));
           
        }

        // Register apex.item callbacks
        apex.widget.initPageItem( pPageItemName, {
            // set focus to first input or select in the group
            setFocusTo: $( "input,select", gTemplOpt ).first()
        });

        gTemplOpt.change(syncHiddenField);
        
        apex.jQuery(document).bind('apexbeforepagesubmit', syncHiddenField);

        // Setup collapsible advanced options
        apex.jQuery('#'+pPageItemName+'_ADVANCED').collapsible({collapsed:false});
        gTemplOpt.on( "apexafterrefresh", function() {
            gTemplOptItems = apex.jQuery('#'+pPageItemName+'_CONTAINER select, #'+pPageItemName+'_CONTAINER input[type=checkbox]');
            apex.jQuery('#'+pPageItemName+'_ADVANCED').collapsible({collapsed:false});
        })


    }

}; // plugin

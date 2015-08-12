/*jshint nomen: false, evil: false, browser: true, eqeqeq: false, white: false, undef: false, indent: false */
/*
Oracle Database Application Express, Release 4.0
B32468-02
Copyright © 2003, 2014, Oracle. All rights reserved.
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
 * This file holds for legacy purpose all the old non-namespaced JavaScript functions of APEX.
 *
 * */


/**
 * @deprecated Use apex.submit, or Dynamic Action "Submit Page"
 * @function
 * */
function doSubmit(pOptions){
  apex.submit(pOptions);
}
/**
 * @deprecated Use apex.confirm, or Dynamic Action "Confirm"
 * @function
 * */
function confirmDelete(pMessage,pOptions){
	apex.confirm(pMessage,pOptions);
}
/**
 * @deprecated Use apex.item( "<Item ID>" ).isEmpty
 * @function
 * */
function $v_IsEmpty(pThis) {
	return apex.item(pThis).isEmpty();
}
/**
 * @deprecated Use apex.item( "<Item ID>" ).isEmpty
 * @function
 * */
isEmpty = $v_IsEmpty;
/**
 * @deprecated Use apex.submit, passing the event object as the "submitIfEnter" option
 * @function
 * */
function html_submitFormFromKeyPress(key){
  if(event.keyCode == "13"){
    apex.submit();
  }
}
/**
 * @deprecated
 * @function
 * */
function html_InitTextFieldSubmits(){
  var lEls = document.getElementsByTagName('INPUT');
  for(var i=0,len=lEls.length;i<len;i++){if(lEls[i].type == "text"){lEls[i].onkeypress = html_submitFormFromKeyPress;}}
}
/**
 * @deprecated
 * @function
 * */
$f_InitTextFieldSubmits = html_InitTextFieldSubmits;
/**
 * @deprecated Use apex.submit, passing the event object as the "submitIfEnter" option
 * @function
 * */
function submitEnter( pNd, e ) {
    var lThis       = $x( pNd),
        lRequest    = ( lThis ) ? lThis.id : "";
    return apex.submit( {
        "request":          lRequest,
        "submitIfEnter":    e
    });
}
/**
 * @deprecated
 * @function
 * */
function html_processing(){
  var t = $x("htmldbWait");
   if (!t) {
    var l_newDiv = document.createElement('DIV');
    l_newDiv.className="htmldbProcessing";
    l_newDiv.style.zIndex=20000;
    l_newDiv.id = "htmldbDisablePage";
    l_newDiv.style.width = "100%";
    l_newDiv.style.height = "100%";
    l_newDiv.onclick = "return false;";
    l_newDiv.style.position="absolute";
    l_newDiv.style.top="0";
    l_newDiv.style.left="0";
    document.body.insertBefore(l_newDiv,document.body.firstChild);
  }
}
/**
 * @deprecated
 * @function
 * */
function html_enableBase(){
  var t = $x("htmldbDisablePage");
   if (t){t.parentNode.removeChild(t);}
}
/**
 * @deprecated
 * @function
 * */
function html_disableBase(z,c){
  var t = $x("htmldbDisablePage");
   if (!t) {
    var l_newDiv = document.createElement('DIV');
    l_newDiv.className = (!!c)?c:"htmldbDisablePage";
    l_newDiv.style.zIndex=z;
    l_newDiv.id = "htmldbDisablePage";
    l_newDiv.style.width = "100%";
    l_newDiv.style.height = "100%";
    l_newDiv.onclick = "return false;";
    l_newDiv.style.position="absolute";
    l_newDiv.style.top="0";
    l_newDiv.style.left="0";
    document.body.insertBefore(l_newDiv,document.body.firstChild);
  }
}
/**
 * @deprecated
 * @function
 * */
function dhtml_CloseDialog(pThis){
  html_enableBase();
  $x_Hide($x_UpTill(pThis,'TABLE'));
  toolTip_disable();
}
/**
 * @deprecated
 * @function
 * */
function html_Centerme(id){
	var t = $x(id);
	if(document.all){
		l_Width = document.body.clientWidth;
		l_Height = document.body.clientHeigth;
	}else{
		l_Width = window.innerWidth;
		l_Height = window.innerHeight;
	}
	var tW=t.offsetWidth;
	var tH=t.offsetHeight;
	t.style.top = '40%';
	t.style.left = '40%';
}
/**
 * Previously the first argument was a string to be evaluated and if the result was expected to be true or false.
 * In general using eval this way is not safe or efficient so now condition must be a boolean literal or a function.
 * @deprecated Use Dynamic Action "Disable" or "Enable"
 * @function
 * */
function disableItems(condition,item1,item2,item3,item4,item5,item6,item7,item8,item9,item10){
	var disItem, theTest,
	    i = 1;
    if ( typeof condition === "boolean") {
        theTest = condition;
    } else if ( apex.jQuery.isFunction( condition ) ) {
        theTest = condition();
    } else {
        throw "Condition must be function or Boolean literal";
    }
	if(theTest){
		for(i;i<12;i++){
			if (!!arguments[i]){
				disItem = $x(arguments[i]);
				disItem.style.background = '#cccccc';
				disItem.disabled = true;
			}
		}
	}else{
		for(i;i<12;i++){
			if (!!arguments[i]){
				disItem = $x(arguments[i]);
				disItem.disabled = false;
				disItem.style.background = '#ffffff';
			}
		}
	}
}
/**
 * @deprecated
 * @function
 * */
function htmldbCheckCookie(pThis){
  SetCookie ('ISCOOKIE','true');
  flow = GetCookie ('ISCOOKIE');
  return;
}
/**
 * @deprecated
 * @function
 * */
function shuttleItem(theSource, theDest, moveAll) {
    var srcList  = $x(theSource),destList = $x(theDest),arrsrcList = [],arrdestList = [],arrLookup = [],i;
    if (moveAll){
    for (i = 0;i <= srcList.length-1; i++ ){
			  srcList.options[i].selected = true;}
    }
    for (i = 0; i < destList.options.length; i++) {
        arrLookup[destList.options[i].text] = destList.options[i].value;
        arrdestList[i] = destList.options[i].text;}
    var fLength = 0;
    var tLength = arrdestList.length;
    for(i = 0; i < srcList.options.length; i++) {
        arrLookup[srcList.options[i].text] = srcList.options[i].value;
        if (!!srcList.options[i].selected && !!srcList.options[i].value) {
            arrdestList[tLength] = srcList.options[i].text;
            tLength++;}
        else {
            arrsrcList[fLength] = srcList.options[i].text;
            fLength++;}
    }
    arrsrcList.sort();
    arrdestList.sort();
    srcList.length = 0;
    destList.length = 0;
    var c,no;
    for(c = 0; c < arrsrcList.length; c++) {
        no = new Option();
        no.value = arrLookup[arrsrcList[c]];
        no.text = arrsrcList[c];
        srcList[c] = no;
    }
    for(c = 0; c < arrdestList.length; c++) {
        no = new Option();
        no.value = arrLookup[arrdestList[c]];
        no.text = arrdestList[c];
        destList[c] = no;
       }
}
/**
 * @deprecated
 * @function
 * */
function cDebug(pThis,pThat){}
/**
 * @deprecated
 * @function
 * */
function html_VisibleElement(pNd){var l_Node = $x(pNd);if(l_Node){l_Node.style.visibility = "visible";}return l_Node;}
/**
 * @deprecated
 * @function
 * */
function html_HiddenElement(pNd){var l_Node = $x(pNd);if(l_Node){l_Node.style.visibility = "hidden";}return l_Node;}
/**
 * @deprecated
 * @function
 * */
function html_TabMakeCurrent(pThis){var node = $x(pThis);if(node){var nodeSibs = node.parentNode.parentNode.childNodes;for(var i=0;i < nodeSibs.length;i++){if(nodeSibs[i] && nodeSibs[i].nodeType == 1 && nodeSibs[i].getElementsByTagName('A')[0]){nodeSibs[i].getElementsByTagName('A')[0].className = "";}}pThis.className = "tabcurrent";}return node;}
/**
 * @deprecated Use $x_HideSiblings
 * @function
 * */
html_HideSiblings = $x_HideSiblings;
/**
 * @deprecated Use $x_ShowSiblings
 * @function
 * */
html_ShowSiblings = $x_ShowSiblings;
/**
 * @deprecated Use $x_ShowAllByClass
 * @function
 * */
function html_ShowAllByClass(pThis,pClass,pTag) {$x_ShowAllByClass(pThis,pClass,pTag);}
/**
 * @deprecated Use $f_Hide_On_Value_Item
 * @function
 * */
function f_Hide_On_Value_Item(pThis,pThat,pValue){return $f_Hide_On_Value_Item(pThis,pThat,pValue);}
/**
 * @deprecated Use $f_Hide_On_Value_Item_Row
 * @function
 * */
function f_Hide_On_Value_Item_Row(pThis,pThat,pValue){return $f_Hide_On_Value_Item_Row(pThis,pThat,pValue);}
/**
 * @deprecated Use Dynamic Action "Disable" or "Enable"
 * @function
 * */
function html_disableItems(a,nd){if(nd){var lArray = [];for (var i=1,len=arguments.length;i<len;i++){if(arguments[i]){lArray[lArray.length]=arguments[i];}}html_disableItem(lArray,a);}return;}
/**
 * @deprecated
 * @function
 * */
function html_GetPageScroll(){return getScrollXY()[1];}
/**
 * @deprecated
 * @function
 * */
function popUpNamed(pURL,pName) {html_PopUp(pURL,pName,720,600);}
/**
 * @deprecated
 * @function
 * */
function popUp2(pURL,pWidth,pHeight) {day = new Date();pName = day.getTime();html_PopUp(pURL,pName,pWidth,pHeight);}
/**
 * @deprecated
 * @function
 * */
function popUp(pURL) {day = new Date();pName = day.getTime();html_PopUp(pURL,pName,null,null);}
/**
 * @deprecated Use apex.navigation.popup.url
 * @function
 * */
function popupURL(pURL){html_PopUp(pURL,"winLov",800,600);}
/**
 * @deprecated Use $x_Class
 * @function
 * */
function $x_SetClassArray(pNd,pClass){$x_Class(pNd,pClass);}
/**
 * @deprecated
 * @function
 * */
function html_TabClick(pThis,pId){
    var nodeSibs = $x(pThis).parentNode.parentNode.childNodes , lSibArray = [];
    for(var i=0;i < nodeSibs.length;i++){
        if($x(nodeSibs[i]) && nodeSibs[i].getElementsByTagName('A')[0]){
            lSibArray[lSibArray.length] = nodeSibs[i].getElementsByTagName('A')[0];
        }
    }
    $d_TabClick(pThis,pId,'tabcurrent',lSibArray);
    return;
}
/**
 * @deprecated
 * @function
 * */
function detailTab(id){html_TabClick(id);return;}
/**
 * @deprecated
 * @function
 * */
function retFalse(){return false;}
/**
 * @deprecated
 * @function
 * */
function getSelected(opt){
    var selected=[];
    for (var i=0;i<opt.length;i++){
        if (opt[i].selected){
            selected[selected.length]=opt[i];
        }
    }
    return selected;
}
/**
 * @deprecated Use $dom_AddTag
 * @function
 * */
$x_AddTag = $dom_AddTag;
/**
 * @deprecated
 * @function
 * */
function html_CreateFormElement(pType,pName,pValue){return $dom_AddInput(false,pType,'',pName,pValue);}
/**
 * @deprecated Use Dynamic Action "Disable" or "Enable"
 * @function
 * */
html_disableItem = $x_disableItem;
/**
 * @deprecated Use $x_UpTill
 * @function
 * */
html_CascadeUpTill = $x_UpTill;
/**
 * @deprecated Use $x_HideItemRow, or Dynamic Action "Hide" with "Hide all items on the same line" = "Yes"
 * @function
 * */
html_HideItemRow=$x_HideItemRow;
/**
 * @deprecated Use $x_ShowItemRow, or Dynamic Action "Show" with "Show all items on the same line" = "Yes"
 * @function
 * */
html_ShowItemRow=$x_ShowItemRow;
/**
 * @deprecated Use $x_ToggleItemRow
 * @function
 * */
html_ToggleItemRow=$x_ToggleItemRow;
/**
 * @deprecated Use $x_ShowChildren
 * @function
 * */
html_ShowAllChildren = $x_ShowChildren;
/**
 * @deprecated Use $x_Style
 * @function
 * */
setStyle = $x_Style;
/**
 * @deprecated Use html_StringReplace
 * @function
 * */
html_replace = html_StringReplace;
/**
 * @deprecated Use $v_Upper
 * @function
 * */
upperMe = $v_Upper;
/**
 * @deprecated Use Dynamic Action "Disable" or "Enable"
 * @function
 * */
html_DisableOnValue = $f_DisableOnValue;
/**
 * @deprecated Use $x_ToggleWithImage
 * @function
 * */
htmldb_ToggleTableBody = $x_ToggleWithImage;
/**
 * @deprecated Use $x_ToggleWithImage
 * @function
 * */
htmldb_ToggleWithImage = $x_ToggleWithImage;
/**
 * @deprecated Use $x_FormItems
 * @function
 * */
html_Return_Form_Items = $x_FormItems;
/**
 * @deprecated Use $d_Find
 * @function
 * */
html_Find = $d_Find;
/**
 * @deprecated Use $x_Value
 * @function
 * */
$f_SetValue = $x_Value;
/**
 * @deprecated Use $x_Value
 * @function
 * */
setValue = $x_Value;
/**
 * @deprecated Use $dom_MakeParent
 * @function
 * */
html_MakeParent = $dom_MakeParent;
/**
 * @deprecated Use $x, or consider $v if you want to get an item's value
 * @function
 * */
html_GetElement=$x;
/**
 * @deprecated Use $x, or consider $v if you want to get an item's value
 * @function
 * */
$x_El = $x;
/**
 * @deprecated Use $x_Toggle
 * @function
 * */
html_ToggleElement = $x_Toggle;
/**
 * @deprecated Use $x_Hide, or Dynamic Action "Hide"
 * @function
 * */
html_HideElement = $x_Hide;
/**
 * @deprecated Use $x_Show, or Dynamic Action "Show"
 * @function
 * */
html_ShowElement = $x_Show;
/**
 * @deprecated Use $u_SubString
 * @function
 * */
html_SubString = $u_SubString;
/**
 * @deprecated Use $x_ByClass
 * @function
 * */
getElementsByClass = $x_ByClass;
/**
 * @deprecated Use $x_SwitchImageSrc
 * @function
 * */
html_SwitchImageSrc = $x_SwitchImageSrc;
/**
 * @deprecated Use $v_CheckValueAgainst
 * @function
 * */
html_CheckValueAgainst = $v_CheckValueAgainst;
/**
 * @deprecated Use $f_CheckAll
 * @function
 * */
html_CheckAll = $f_CheckAll;
/**
 * @deprecated Use $f_First_field, or if you know the item you want to set focus to use apex.item( "<Item ID>" ).setFocus
 * @function
 * */
first_field = $f_First_field;
/**
 * @deprecated Use $x_CheckImageSrc
 * @function
 * */
html_CheckImageSrc = $x_CheckImageSrc;
/**
 * @deprecated
 *
 * Sets a style attribute of an array of nodes that are selected by class.
 * @ignore
 * @param {DOM node | String} pNd
 * @param {String} pClass
 * @param {String} pTag
 * @param {String} pClass2
 * */
function $x_StyleByClass(t,c,p,v){
    var l_Els = $x_ByClass(c,false,t);
    $x_Style(l_Els,p,v);
}
/**
 * @deprecated
 * @function
 * */
setStyleByClass = $x_StyleByClass;
/**
 * @deprecated
 * @function
 * */
function html_CleanRegionId(pRid){
	var l_PTest = pRid.indexOf('.');
	var l_CTest = pRid.indexOf(',');
	var l_Rid = pRid;
	if(l_PTest >= 0){l_Rid = l_Rid.substring(0,l_PTest);
	}else if (l_CTest >= 0){l_Rid = l_Rid.substring(0,l_CTest);}
	return l_Rid;
}
/**
 * @deprecated
 * @function
 * */
function init_htmlPPRReport2(pId){
  var l_Table = $x('report'+pId);
  if(l_Table){
    var l_THS = l_Table.getElementsByTagName('TH');
    for(var i = 0;i<l_THS.length;i++){
    if(l_THS[i].getElementsByTagName('A')[0]){
      var oldHREF = l_THS[i].getElementsByTagName('A')[0].href;
      l_THS[i].getElementsByTagName('A')[0].href = 'javascript:html_PPR_Report_Page(this,\''+pId+'\',\''+oldHREF+'\');';
      }
    }
  }
}
/**
 * @deprecated
 * @function
 * */
function init_htmlPPRReport(pId){
  if ( document.all ) {
      setTimeout( function() {
          init_htmlPPRReport2(pId);
      }, 100);
  } else {
      init_htmlPPRReport2(pId);
  }
}
/**
 * @deprecated
 * @function
 * */
function html_PPR_Report_Page (pThis,pRid,pURL,pHeader,pFooter){
	var l_pRid = html_CleanRegionId(pRid);
	document.body.style.cursor = 'wait';
    var l_URL = pURL;
    var start = l_URL.indexOf('?');
    l_URL = l_URL.substring(start + 1);
    l_URL = html_replace(l_URL,'pg_R_','FLOW_PPR_OUTPUT_'+l_pRid+'_pg_R_');
    l_URL = html_replace(l_URL,'fsp_sort_','FLOW_PPR_OUTPUT_'+l_pRid+'_fsp_sort_');
    var http = new htmldb_Get('report'+ l_pRid,null,null,null,null,'f',l_URL);
    http.get(null,'<htmldb:'+l_pRid+'>','</htmldb:'+l_pRid+'>');
    if(pHeader){$x('report'+ l_pRid).innerHTML =  pHeader + $x('report'+ l_pRid).innerHTML;}
    if(pFooter){$x('report'+ l_pRid).innerHTML += pFooter;}
    document.body.style.cursor = '';
    init_htmlPPRReport(l_pRid);
    http = null;
    return;
}
/**
 * @deprecated
 * @function
 * */
function PPR_Tabluar_Submit(pId,pFlowID,pPageId,pRequest,pInsertReturn,pReportId,pReplacementOveride){
	var pThis = $x(pId),get,i,q;
	if(pInsertReturn){get = new htmldb_Get(pId,pFlowID,pRequest,pPageId,null,'wwv_flow.accept');}
	else{get = new htmldb_Get(null,pFlowID,pRequest,pPageId,null,'wwv_flow.accept');}
	var lItems = $x_FormItems(pThis);
	for(i=0;i<lItems.length;i++){
        // Ignore "init_row" elements (bug #14829579)
        if(lItems[i].id && !/_0000$/.test(lItems[i].id)){
            if(lItems[i].type == 'checkbox'){
                if(!!lItems[i].checked){get.addParam(lItems[i].name,lItems[i].value);}
            }else{
                if(lItems[i].name && lItems[i].name != 'fcs'){get.addParam(lItems[i].name,lItems[i].value);}
            }
        }
	}
	var lSelects = $x_FormItems(pThis,'SELECT');
	for(i=0;i<lSelects.length;i++){get.addParam(lSelects[i].name,html_SelectValue(lSelects[i]));}
	var lTextarea= $x_FormItems(pThis,'TEXTAREA');
	for(i=0;i<lTextarea.length;i++){get.addParam(lTextarea[i].name,lTextarea[i].value);}
	if(pReplacementOveride){
		q = get.get(null,'<htmldb:'+pReplacementOveride+'>','</htmldb:'+pReplacementOveride+'>');
		}else{
		q = get.get(null,'<htmldb:PPR_'+pId+'>','</htmldb:PPR_'+pId+'>');
	}
		if(pReportId){init_htmlPPRReport(pReportId);}
		get = null;
	return q;
}
/**
 * @deprecated
 * @function
 * */
function removeMessageTimeout(){setTimeout(function(){$x('htmldbMessageHolder').innerHTML = '';},5000);}
/**
 * @deprecated Use $x_RowHighlight
 * */
html_RowHighlight = $x_RowHighlight;
/**
 * @deprecated Use $x_RowHighlightOff
 * @function
 * */
html_RowHighlightOff = $x_RowHighlightOff;
/**
 * @deprecated Use $f_SelectedOptions
 * @function
 * */
html_SelectedOptions = $f_SelectedOptions;
/**
 * @deprecated Use $f_SelectValue
 * @function
 * */
html_SelectValue = $f_SelectValue;
/**
 * @deprecated
 * @function
 * */
function $f_basic_sql(pColumn,pOp,pExp,gClassFail,gClass){
    var lArray = [pColumn,pOp,pExp];
    if(!!($f_is_in(pOp,['is null','is not null']))){lArray = [pColumn,pOp];}
    return $f_get_emptys(lArray,gClassFail,gClass);
}
/**
 * @deprecated
 * @function
 * */
function $f_is_in(pNd,pValue){
    var l_temp = [];
    var l_temp2 = [];
    if($x(pNd)){pNd = [pNd];}
    for(var i=0,len=pNd.length;i<len;i++){
        var node = $x(pNd[i]);
        for(var ii=0,len2=pValue.length;ii<len2;ii++){
            if (node) {
                if ($v(node) == pValue[ii]) {
                    l_temp[l_temp.length] = node;
                }
            }
        }
    }
    if(l_temp.length===0){l_temp=false;}else{l_temp[0].focus();}
    return l_temp;
}
/**
 * @deprecated
 * @namespace
 */
apex.validation = {
   v : function (){
        var that = this;
        this.get_emptys = function(pNd,pClassFail,pClass){
            var l_temp = [];
            var l_temp2 = [];
            if($x(pNd)){pNd = [pNd];}
            for(var i=0,len=pNd.length;i<len;i++){
                var node = $x(pNd[i]);
                if (node) {
                    if (isEmpty(node)) {l_temp[l_temp.length] = node}
                    else {l_temp2[l_temp2.length] = node}
                }
            }
            if(pClassFail){$x_Class(l_temp,pClassFail);}
            if(pClass){$x_Class(l_temp2,pClass);}
            if(l_temp.length==0){l_temp=false;}else{l_temp[0].focus();}
            return l_temp;
        };

        this.is_in = function(pNd,pValue){
            var l_temp = [];
            var l_temp2 = [];
            if($x(pNd)){pNd = [pNd];}
            for (var i=0,len=pNd.length; i<len; i++) {
                var node = $x(pNd[i]);
                for(var ii=0,len=pValue.length;ii<len;ii++){if(node){if(node.value == pValue[ii]){l_temp[l_temp.length] = node}}}
            }
            if(l_temp.length==0){l_temp=false;}else{l_temp[0].focus();}
            return l_temp;
        };

        this.basic_sql = function(pColumn,pOp,pExp,gClassFail,gClass){
            var lArray = [pColumn,pOp,pExp];
            if(!!($f_is_in(pOp,['is null','is not null']))){lArray = [pColumn,pOp];}
            return $f_get_emptys(lArray,gClassFail,gClass);
        };
    }
};
/**
 * @deprecated
 * @function
 * */
function whichElement ( pForm, pElement, pOffset ){
  n = parseInt(pElement.substring(3,pElement.length),10);
  m = n + parseInt(pOffset,10);
  return document[ pForm ][ "p_t" + LZ(m)];
}
/**
 * @deprecated
 * @function
 * */
function nullFields(event, pField1, pField2, pField3) {
    var code = 0;
    code = event.keyCode;
    if (code > 45 && code < 106 || code == 8) {
      if (pField1) {pField1.value = "";}
      if (pField1) {pField2.value = "";}
      if (pField3) {pField3.value = "";}
    }
}
/**
 * @deprecated
 * @function
 * */
function selectAll(fromList){
    var len=fromList.length;
    for(var i=0;i<len;i++){fromList.options[i].selected = true;}
    return true;
}
/**
 * @deprecated Use helper functions in apex.widget.report namespace
 * @function
 * */
function $a_report(pId, pMin, pMax, pFetched, pSort, pRefreshMode, pPageItemsToSubmit){
    // Trigger the before refresh event, and pass the current report Id convenience.
    // Event is triggered on table element with the ID equal to 'report_' + pID + '_catch'.
    // This element is not exposed in any templates and output by our engine, so is safe to
    // use.
    // Event handlers can be bound to this element in conjunction with the jQuery 'live'
    // bind type, or can be bound to higher element (such as the main region ID) and use
    // the regular bind type. The latter works because the event bubbles and is how this
    // is handled within the dynamic action framework.
    //
    // initialize the AJAX call parameters
    var lData = { p_flow_id: $v('pFlowId'),
            p_flow_step_id: $v('pFlowStepId'),
            p_instance: $v('pInstance')
        },
        lRequest = 'FLOW_PPR_OUTPUT_R'+pId+'_';

    // fire before refresh event
    apex.jQuery('#report_' + pId + '_catch').trigger('apexbeforerefresh', pId);

    // if refresh mode is passed, deal with that first
    if (pRefreshMode) {
        if (pRefreshMode === 'current'){
            lData.p_request = lRequest;
        } else if (pRefreshMode === 'reset') {
            lData.p_request = lRequest + 'reset_R_' + pId;
        }
    } else {
        if (!!pSort) {
            lData.p_request       = lRequest + pSort;
            lData.p_clear_cache   = 'RP';
            lData.p_fsp_region_id = pId;
        } else {
            lData.p_request         = lRequest + 'pg_R_' + pId;
            lData.p_pg_max_rows     = pMax;
            lData.p_pg_min_row      = pMin;
            lData.p_pg_rows_fetched = pFetched;
        }
    }

    // add all page items which have to be submit with the AJAX call
    apex.jQuery(pPageItemsToSubmit).each(function(){
        var lIdx;
        if (lData.p_arg_names===undefined) {
            lData.p_arg_names  = [];
            lData.p_arg_values = [];
            lIdx = 0;
        } else {
            lIdx = lData.p_arg_names.length;
        }
        lData.p_arg_names [lIdx] = this.id;
        lData.p_arg_values[lIdx] = $v(this);
    });

    // perform the AJAX call
    apex.jQuery.ajax({
        // try to leverage ajaxQueue plugin to abort previous requests
        mode: "abort",
        // limit abortion to this input
        port: pId,
        dataType: "html",
        type: "post",
        url: "wwv_flow.show",
        traditional: true,
        data: lData,
        success: function(pResponse){
            // This looks a little bit complicated and it is! To avoid screen flicker
            // when the HTML code is inserted into the DOM and JavaScript code modifies the
            // code afterwards (which takes some time), we are injecting the HTML code in
            // a temporary hidden area and do all our modifications and after that we
            // are replacing the existing report_xxx_catch with the new version.
            var lTemp = $u_js_temp_drop();
            apex.jQuery('#report_'+pId+'_catch').attr('id', 'report_'+pId+'_catch_old');
            apex.jQuery(lTemp).html(pResponse);
            apex.jQuery('#report_'+pId+'_catch_old').replaceWith(apex.jQuery('#report_'+pId+'_catch'));
            apex.jQuery(lTemp).empty();

            // Trigger the after refresh event, and pass the current report Id convenience.
            // Event is triggered on table element with the ID equal to 'report_' + pID + '_catch'.
            // This element is not exposed in any templates and output by our engine, so is safe to
            // use.
            // Event handlers can be bound to this element in conjunction with the jQuery 'live'
            // bind type, or can be bound to higher element (such as the main region ID) and use
            // the regular bind type. The latter works because the event bubbles and is how this
            // is handled within the dynamic action framework.
            //
            apex.jQuery('#report_' + pId + '_catch').trigger('apexafterrefresh', pId);
        }
    });
}
/**
 * @deprecated Use apex.widget.report.paginate
 * @function
 * */
function $a_report_Split(pThis, pArgs, pPageItemsToSubmit) {
    var lArgs = pArgs.split( "_" );
    apex.widget.report.paginate( pThis, {
        min         : lArgs[ 0 ],
        max         : lArgs[ 1 ],
        fetched     : lArgs[ 2 ]
        },{
            pageItems   : pPageItemsToSubmit
        }
    );
}
/**
 * @deprecated
 * @function
 * */
function paginate( pInternalRegionID, pRegionID, pLink, pMsg, pPPR, pPageItemsToSubmit ) {
    var vItems    = $x_FormItems( $x( 'report_' + pRegionID ) );
    var vModified = false;
    // mark all items modified since last initialization of gTabFormData
    for (var i = 0; i < vItems.length; i++) {
        if ( ( gTabFormData[ i ] != vItems[ i ].value ) && ( vItems[ i ].name != 'X01' ) ) {
            $x_Class( vItems[ i ], 'apex-tabular-highlight' );
            vModified = true;
        }
    }
    // mark all items previously modified
    for ( var i = 0; i < gChangedItems.length; i++ ) {
        $x_Class( gChangedItems[ i ], 'apex-tabular-highlight' );
        vModified = true;
    }
    if ( vModified ) {
        if ( confirm( pMsg ) ) {
            if (pPPR == 'Y') {
                $a_report_Split( pInternalRegionID, pLink, pPageItemsToSubmit );
            } else {
                redirect( pLink );
            }
        } else {
            return;
        }
    } else {
        if ( pPPR == 'Y' ) {
            $a_report_Split( pInternalRegionID, pLink, pPageItemsToSubmit );
        } else {
            redirect( pLink );
        }
    }
}
/**
 * @deprecated Use apex.widget.report.tabular.checkAll
 * @function
 * */
function checkAll(pAll) {
    apex.widget.report.tabular.checkAll( pAll );
}
/**
     * @deprecated Use apex.widget.report.tabular.addRow
 * @function
 * */
function addRow(pNewRowVals, pNewRowMap, pDispTypeMap) {
    apex.widget.report.tabular.addRow( pNewRowVals, pNewRowMap, pDispTypeMap );
}
/**
 * @deprecated
 * @function
 * */
function pad(number, length) {
    return apex.widget.report.tabular.pad( number, length );
}
/*
 * @deprecated Use $x_ClassByClass
 * */
function setClassByClass(pTag,pClass,pClass2){
    $x_ClassByClass(false,pClass,pTag,pClass2);
}
/*
 * @deprecated
 */
function html_RemoveRow(pId){
    var l_Table = $x('htmldbAddRowTable');
    var l_Row = $x_UpTill(pId,'TR');
    if(l_Table.childNodes.length >= 2 && l_Row){
        l_Table.removeChild(l_Row);
        l_Table.normalize();
    }
    return;
}
/*
 * @deprecated
 */
function html_InitAddRowTable(){
    var l_Table = $x('htmldbAddRowTable');
    var l_Cell = l_Table.rows[0].cells[l_Table.rows[0].cells.length-1];
    l_Cell.innerHTML ="<br />";
    l_Cell.className = l_Table.rows[0].cells[l_Table.rows[0].cells.length-2].className;
    return;
}
/**
 * @deprecated
 * @param {DOM node | string ID | DOM node Array} pNd
 * */
function html_CheckSome(pThis,pValues,pArray){
    var lCheck = false;
    var l_Inputs;
    if(pArray){l_Inputs = pArray;}
    else{l_Inputs = $x_FormItems(pThis,'CHECKBOX');}
    for (var j=0,l=l_Inputs.length;j<l;j++){
        for (var ii=0,ll=pValues.length;ii<ll;ii++){if(pValues[ii] == l_Inputs[j].value){lCheck=true;}}
        l_Inputs[j].checked = lCheck;
        lCheck=false;
    }
    return;
}
/**
 * @deprecated
 * Sets the select option of a given select item to the first option.
 * @function
 * @param {DOM node | String } pNd
 * */
function html_ResetSelect(pNd){
    var l_Node = $x(pNd);
    var tSelects = (l_Node.nodeName == 'SELECT')?l_Node:l_Node.getElementsByTagName('select')[0];
    tSelects.selectedIndex = 0;
    return;
}
/**
 * @deprecated
 * @param {} pTab
 * @param {} pTabPanel
 * @param {} pClass
 * @param {} pTabsArray
 * @param {} pTabsPanelArray
 * */
function $d_TabClick(pTab,pTabPanel,pClass,pTabsArray,pTabsPanelArray){
    var lTabPanel = $x(pTabPanel) , lclassName=(pClass)?pClass:'current';
    if(!pTabsPanelArray){$x_HideSiblings(lTabPanel);}else{$x_HideAllExcept(pTabPanel,pTabsArray);}
    if(!pTabsArray){$x_SetSiblingsClass(pTab,'',lclassName);}
    else{$x_Class(pTabsArray,'');$x(pTab).className=lclassName;}
}
/**
 * @deprecated
 * @function
 * @param {DOM node | string ID} pNd
 * */
function html_RadioValue(pNd){
    var lReturn = false;
    var lSelect = $x_FormItems(pNd,'RADIO');
    var l=lSelect.length;
    for(var i=0;i<l;i++){if(lSelect[i].checked){lReturn=lSelect[i].value;}}
    return lReturn;
}
/**
 * @deprecated Use {@link apex.storage}.getCookieVal
 * */
function getCookieVal( offset ) {
    return apex.storage.getCookieVal ( offset );
}
/**
 * @deprecated Use {@link apex.storage}.getCookie
 * */
function GetCookie( pName ) {
    return apex.storage.getCookie ( pName );
}
/**
 * @deprecated Use apex.storage.setCookie
 * */
function SetCookie( pName, pValue ) {
    apex.storage.setCookie ( pName, pValue );
}
/**
 * @deprecated
 * */
function html_GoToRelative(nURL){
    var urlP = location.pathname.substring(0,location.pathname.lastIndexOf('/'));
    document.location = urlP+"/"+nURL;
    return;
}
/**
 * @deprecated
 * */
function html_Allow_Copy(e){
    l_return = false;
    var keyCode = document.layers ? evt.which :document.all ? event.keyCode :document.getElementById ? e.keyCode : 0;
    if (e.ctrlKey && keyCode == "c"){l_return = true;}
    return l_return;
}
/**
 * @deprecated
 **/
function formHasValue(what) {
    var result = false;
    var output = '';
    for (var i=0,j=what.elements.length;i<j;i++) {
        myType = what.elements[i].type;
        if (myType == 'text' || myType == 'textarea') {if (what.elements[i].value != ''){result = true;}}
        if (myType == 'select-one' || myType == 'select-multiple'){
            if(what.elements[i].selectedIndex !== 0 && what.elements[i].options[what.elements[i].selectedIndex].value!==''){result = true;}
        }
    }
    return result;
}
/**
 * @deprecated
 **/
function html_ShowLov(s){
    if(lovUI){
        lovUI.innerHTML = s;
        $x_Show(lovUI);
        lovUI.scrollIntoView(false);
    }
    return;
}
/**
 * @deprecated
 **/
function html_PageTable(table,start,end){
    var tTable = $x(table);
    if(!start){start=1;}
    if(!end){end=25;}
    for(var i=0;i<tTable.rows.length;i++){
        if(i>=!start && i<=end){$x_Show(tTable.rows[i]);}
        else{$x_Hide(tTable.rows[i]);}
    }
}
/**
 * @deprecated
 **/
function timestamp(){
    var d, s = "T:";
    var c = ":";
    d = new Date();
    s += d.getHours() + c;
    s += d.getMinutes() + c;
    s += d.getSeconds() + c;
    s += d.getMilliseconds();
    return(s);
}
var dbaseTime1 = null;
var dbaseTime2 = null;
/**
 * @deprecated
 **/
function timeC(t){
    if(dbaseTime1){
        dbaseTime2 = new Date();
        dbaseTime1 = null;
        dbaseTime2 = null;
    }else{
        dbaseTime1 = new Date();
    }
}
/**
 * @deprecated Use apex.navigation.redirect
 * */
function redirect(where){
    return apex.navigation.redirect( where );
}
/**
 * @deprecated Use apex.navigation.popup
 * @function
 * @param pURL
 * @param pName
 * @param pWidth
 * @param pHeight
 * @param pScroll
 * @param pResizable
 * @return {Window Object}
 * */
function html_PopUp(pURL,pName,pWidth,pHeight,pScroll,pResizable){

    /* Old interface used to allow either null or undefined to be passed as any of the above parameters,
     * defaulting them accordingly. New interface only allows undefined to be passed to initiate the
     * defaults, because you don't need to pass null (if you don't want an option you just don't define
     * it in the option map).
     * Therefore, we check here if any of parameters are truly null, and if so set them to undefined (
     * such that the new interface will correctly use the defaults).
     */
    var lURL = ( pURL === null ) ? undefined : pURL,
        lName = ( pName === null ) ? undefined : pName,
        lWidth = ( pWidth === null ) ? undefined : pWidth,
        lHeight = ( pHeight === null ) ? undefined : pHeight,
        lScroll = ( pScroll === null ) ? undefined : pScroll,
        lResizable = (pResizable === null ) ? undefined : pResizable;

    return apex.navigation.popup( {
        url:        lURL,
        name:       lName,
        width:      lWidth,
        height:     lHeight,
        scroll:     lScroll,
        resizable:  lResizable
    });
}
/**
 * @ignore
 * @deprecated Use {@link apex.navigation.popup.close}
 * */
function $v_PopupReturn(pValue,pThat){

    // Changed order of parameters in new function, to be consistent with other setting functions (object then value).
    apex.navigation.popup.close( pThat, pValue );
}
/**
 * @deprecated Use apex.theme.popupFieldHelpClassic
 * */
function popupFieldHelpClassic(pItemId, pSessionId){
    return apex.theme.popupFieldHelpClassic( pItemId, pSessionId);
}
/**
 * @deprecated Use apex.theme.popupFieldHelp
 * */
function popupFieldHelp(pItemId, pSessionId){
    return apex.theme.popupFieldHelp( pItemId, pSessionId );
} // popupFieldHelp
/**
 * @deprecated
 * Sets DOM node in the global variables returnInput (p_R) and returnDisplay (p_D) for use in populating items from popups.
 * @function
 * @param {DOM Node | String} p_R
 * @param {DOM Node | String} p_D
 * */
var returnInput=null,returnDisplay=null;
function setReturn(p_R,p_D){
    if(p_R){returnInput = $x(p_R);}
    if(p_D){returnDisplay = $x(p_D);}
    return;
}
if (apex.tabular===null || typeof(apex.tabular)!="object"){apex.tabular={};}
/**
 * @deprecated
 * @namespace
 */
apex.tabular = {
   table : function (pThis,pChange){
        var that = this;
        this.l_Table = $x(pThis);
        this.l_Headers = that.l_Table.rows[0].cells;
        this.l_Row1 = that.l_Table.rows[1].cells;
        this.currentItem = null;
        this.col = {};
        this.col.length = that.l_Headers.length;
        this.col.by_id = function(pId){
            for(var i=0,len=that.col.length;i<len;i++){
                var lTest = (that.col[i].id == pId);
                if(lTest){return that.col[i]}
            }
        };
        this.col.by_name = function(pName){
            for(var i=0,len=that.col.length;i<len;i++){
                var lTest = (that.col[i].name == pName);
                if(lTest){return that.col[i]}
            }
        };
        this.error = function(){
            that.currentItem.focus();
            $x_Style(that.currentItem,'border','1px solid red');
        };
        this.success = function(){
            $x_Style(that.currentItem,'border','');
        };
        for(var i=0,len=this.l_Headers.length;i<len;i++){
            var l_column = {};
            l_column.id = this.l_Headers[i].id;
            var lTemp = $x_FormItems(this.l_Row1[i],'ALL')[0];
            l_column.name = (lTemp)?lTemp.name:false;
            l_column.dom = this.l_Headers[i];
            this.col[i] = l_column;
        }
        var lInputs = $x_FormItems(this.l_Table,'ALL');
        for(var i=0,len=lInputs.length;i<len;i++){
            lInputs[i].onchange=function(){that.row.init(this,that);}
        }
        this.row ={};
        this.row.dom;
        this.row.init = (pChange)?pChange:function(pThis,pThat){};
        this.row.cell={};
        this.row.cell.item= function(pThis){return $x_FormItems(that.row.dom.cells[that.col.by_id(pThis).dom.cellIndex])[0];};
        this.row.cell.value = function(pThis,pValue){that.row.cell.item(pThis)[0].value=pValue;};
        this.row.cell.disable = function(pThis,pValue){$v(that.row.cell.item(pThis),pValue);};
   },
    sort :function(pId){
          var that = this;
          /*image section*/
          that.class_name_up = 'a-Icon icon-up-chevron';
          that.class_name_down = 'a-Icon icon-down-chevron';

          that.resequence = true;
          that.resequence_class = 'orderby';

          that.table = false;
          that.row = {};
          that.row.before_move = function (){};
          that.row.after_move = function(){};
          that.row.up = function(pThis){return that.row.move(pThis,'UP');};
          that.row.down = function(pThis){return that.row.move(pThis,'DOWN');};

          that.row.top = function(){};
          that.row.bottom = function(){};

          that.row.move = function (pThis,pDir){
                that.row.before_move();
                var l_Row = $x_UpTill(pThis,'TR');
                ie_RowFixStart(l_Row);
                $tr_RowMoveFollow(l_Row,true);
                var l_Table = l_Row.parentNode;
                var l_RowNext = l_Row.nextSibling;
                var l_RowPrev = l_Row.previousSibling;
                if (pDir == 'DOWN') {
                    while (l_RowNext != null) {
                        if (l_RowNext.nodeType == 1) {break}
                        l_RowNext = l_RowNext.nextSibling;
                    }
                    if (l_RowNext != null && l_RowNext.nodeName == 'TR') {
                        oElement = l_Table.insertBefore(l_Row ,l_RowNext.nextSibling);
                    } else {
                        if (apex.jQuery('input[name="f02"]:first').val()=='CHECK$01') {
                        oElement = l_Table.insertBefore(l_Row ,l_Table.getElementsByTagName('TR')[2]);
                        } else {
                            oElement = l_Table.insertBefore(l_Row ,l_Table.getElementsByTagName('TR')[1]);
                        }
                    }
                } else if (pDir == 'UP') {
                    while (l_RowPrev != null) {
                        if (l_RowPrev.nodeType == 1) {break}
                        l_RowPrev = l_RowPrev.previousSibling;
                    }
                    if(apex.jQuery(l_RowPrev).find('input[name="f02"]:first').val() != 'CHECK$01' && l_RowPrev != null && l_RowPrev.firstChild != null && l_RowPrev.firstChild.nodeName != 'TH' && l_RowPrev.nodeName == 'TR'){
                        oElement = l_Table.insertBefore(l_Row ,l_RowPrev);
                    }else{
                        oElement = l_Table.appendChild(l_Row);
                    }
                }
                ie_RowFixFinish(oElement);
                for (var i=1,len=l_Table.rows.length;i<len;i++){
                    var lRow = l_Table.rows[i];
                    var lH2 = getElementsByClass(that.resequence_class,lRow,'INPUT');
                    for (var iI=0,Ilen=lH2.length; iI<Ilen; iI++) {lH2[iI].value = i;}
                }
            that.row.after_move();
            return oElement;
          };
          that.row.remove = function(){};
          that.row.add = function(){};

          that.init = init;
          if(!!pId){that.init(pId);}

          return;
          function init(pId){
                that.table = $x(pId);
                that.lH = getElementsByClass(that.resequence_class,that.table,'INPUT');
                this.create = create;
                var lRow = that.table.rows;
                for (var i=0,len=lRow.length; i<len; i++) {
                    if (i==0) {
                        $tr_AddTH(lRow[i],'<br />');
                    }
                    else {
                        if (i==1 && apex.jQuery('input[name="f02"]:first').val()=='CHECK$01') {
                            var lTd = $tr_AddTD(lRow[i],'&nbsp;');
                        } else {
                            var lTd = $tr_AddTD(lRow[i]);
                            var lImg_1 = this.create(lTd,that.class_name_up,function(){that.row.up(this)});
                            var lImg_2 = this.create(lTd,that.class_name_down,function(){that.row.down(this)});
                        }
                    }
                }
            return;
                function create(pThis,pClass,pFunction) {
                    var lImg_1 = $dom_AddTag(pThis,'SPAN');
                    lImg_1.className = pClass;
                    lImg_1.onclick = pFunction;
                    return lImg_1;
                }
          }
    }
};
/*
 * @deprecated
 */
function dhtml_ShuttleValue(pThis,pThat){
    var l_SelectArray = [];
    var l_From = $x(pThis);
    var l_To = $x(pThat);
    l_SelectArray = $f_SelectedOptions(l_From);
    if($x(l_SelectArray)){l_SelectArray = [l_SelectArray];}
    for (var i=0;i<l_SelectArray.length;i++){l_To.appendChild(l_SelectArray[i]);}
}
/*
 * @deprecated
 */
function $d_Overlap(pThis,pThat){
    var lReturn = true;
    var lReturn2 = true;
    var l   = findPos(pThis);
    var lX  = l[0];
    var lY  = l[1];
    var lT  = findPos(pThat);
    var lTX = lT[0];
    var lTY = lT[1];
    if (lTX > lX || lX > lTX + pThat.offsetWidth) {lReturn = false;}
    if (lTY > lY || lY > lTY + pThat.offsetHeight) {lReturn = false;}
    return lReturn;
}
/*
 * @deprecated
 */
function appendToList(theValue, toList)
{
    // First, get rid of any spaces
    trimmedValue = "";
    for (i=0; i < theValue.length; i++)
        if (theValue.charAt(i) != ' ')
            trimmedValue += theValue.charAt(i);
    if (trimmedValue == "") return;
    // Then, split the comma-separated string into an array
    valueArray = trimmedValue.split(",");
    for (i=0; i < valueArray.length; i++)
    {
        if (valueArray[i] != "")
        {
            found = false;
            for (j=0; j<toList.length; j++)
            {
                if (toList.options[j].value == valueArray[i])
                    found = true;
            }
            if (found == false)
                toList.options[toList.length] = new Option(valueArray[i],valueArray[i]);
        }
    }
    // trigger change event
    apex.jQuery(toList).change();
}
/*
 * @deprecated
 */
function deleteListElement(fromList){
  idx = fromList.selectedIndex;
  if (idx==-1){
      return;
  }
  for (i=fromList.length-1; i >= 0; i--){
      if (fromList.options[i].selected){
          fromList.options[i] = null;
      }
  }
  // trigger change event
  apex.jQuery(fromList).change();
}
/**
 * @deprecated
 * similar to lpad (str, 2, '0')
 * */
function LZ(x){return(x<0||x>9?x:"0"+x);}
/**
 * @deprecated
 **/
function charCount(tArea,maxNo,ctrField,maxField,ctrBlock,allowExtra){
    var textArea = $x(tArea);
    var ctrF     = $x(ctrField);
    var maxF     = $x(maxField);
    var ctrBlk   = $x(ctrBlock);
    var pctFull  = textArea.value.length / maxNo * 100;
    if (allowExtra != 'Y')
        {if (textArea.value.length >= maxNo)
            {textArea.value = textArea.value.substring(0, maxNo);
             textArea.style.color = 'red';
            }
         else
            {msg = null;
             textArea.style.color = 'black';}
        }
    ctrF.innerHTML = textArea.value.length;
    maxF.innerHTML = maxNo;
    if (textArea.value.length > 0){
    ctrBlk.style.visibility = 'visible';
  }else{
    ctrBlk.style.visibility = 'hidden';
  }

    if (pctFull >= 90){
    ctrBlk.style.color='red';
  }else if (pctFull >= "80"){
    ctrBlk.style.color='#EAA914';
  }else{
    ctrBlk.style.color='black';
  }
}
/**
 * @deprecated
 **/
setFocusFirstDescendant = function( pContext ) {
    var lFirstFocusable;
    if ( pContext ) {
        lFirstFocusable = $( pContext ).find( ':focusable:first' )[ 0 ];
        if ( lFirstFocusable ) {
            lFirstFocusable.focus();
        }
    }
};

/**
 * There is no indication that this function is used only for parsing JSON but at least one
 * blog post gave an example of using it with JSON. The best we can do is assume it is passed a JSON string
 * possibly wrapped in parens.
 * @deprecated
 */
function $u_eval(pThis){
    if (/^\(.*\)$/.test(pThis)) {
        pThis = pThis.substr(1, pThis.length - 2);
    }
    return apex.jQuery.parseJSON( pThis );
}


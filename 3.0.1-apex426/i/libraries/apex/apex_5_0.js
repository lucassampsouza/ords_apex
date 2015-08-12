/*jshint browser: true, eqeqeq: false, indent: false */
/*
Oracle Database Application Express, Release 5.0
B32468-02
Copyright (c) 2003, 2014, Oracle. All rights reserved.
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
 * This file holds all namespaced objects and functions for Oracle Application Express.
 *
 * */

/* Define standard namespaces in the apex namespace */
if (apex.spreadsheet===null || typeof(apex.spreadsheet)!="object"){apex.spreadsheet={};}
if (apex.items===null || typeof(apex.items)!="object"){apex.items={};}
if (apex.ajax===null || typeof(apex.ajax)!="object"){apex.ajax={};}
if (apex.dhtml===null || typeof(apex.dhtml)!="object"){apex.dhtml={};}
if (apex.worksheet===null || typeof(apex.worksheet)!="object"){apex.worksheet={};}



/**
 * Using a standard JSON feed creates several types of LOV constructs.
 *
 * @class $d_LOV_from_JSON
 */
function $d_LOV_from_JSON(){
    var that = this;
    /**
     * @type String
     * SELECT,MULTISELECT,SHUTTLE,CHECK,RADIO,FILTER.
     * */
    this.l_Type = false;
    /**
     * @type String
     * JSON Formated String
     * */
    this.l_Json = false;
    this.l_This = false;
    this.l_JSON = false;
    this.l_Id = 'json_temp';
    this.l_NewEls = [];
    this.create = create;
    this.l_Dom = false;
    return;

    /**
     * @param {?} pThis
     * @param {?} pJSON
     * @param {?} pType
     * @param {?} pId
     * @param {?} pCheckedValue
     * @param {?} pForceNewLine
     *
     * @instance
     * @memberOf $d_LOV_from_JSON
     * */
    function create(pThis,pJSON,pType,pId,pCheckedValue,pForceNewLine){
        var myObject = apex.jQuery.parseJSON( pJSON );
        if(that.l_Type == 'SHUTTLE'){/* SHUTTLE */
            var lvar = '<table cellspacing="0" cellpadding="0" border="0" class="ajax_shuttle" summary=""><tbody><tr><td class="shuttleSelect1" id="shuttle1"></td><td align="center" class="shuttleControl"><img title="Reset" alt="Reset" onclick="g_Shuttlep_v01.reset();" src="/i/htmldb/icons/shuttle_reload.png"/><img title="Move All" alt="Move All" onclick="g_Shuttlep_v01.move_all();" src="/i/htmldb/icons/shuttle_last.png"/><img title="Move" alt="Move" onclick="g_Shuttlep_v01.move();" src="/i/htmldb/icons/shuttle_right.png"/><img title="Remove" alt="Remove" onclick="g_Shuttlep_v01.remove();" src="/i/htmldb/icons/shuttle_left.png"/><img title="Remove All" alt="Remove All" onclick="g_Shuttlep_v01.remove_all();" src="/i/htmldb/icons/shuttle_first.png"/></td><td class="shuttleSelect2" id="shuttle2"></td><td class="shuttleSort2"><img title="Top" alt="Top" onclick="g_Shuttlep_v01.sort2(\'T\');" src="/i/htmldb/icons/shuttle_top.png"/><img title="Up" alt="Up" onclick="g_Shuttlep_v01.sort2(\'U\');" src="/i/htmldb/icons/shuttle_up.png"/><img title="Down" alt="Down" onclick="g_Shuttlep_v01.sort2(\'D\');" src="/i/htmldb/icons/shuttle_down.png"/><img title="Bottom" alt="Bottom" onclick="g_Shuttlep_v01.sort2(\'B\');" src="/i/htmldb/icons/shuttle_bottom.png"/></td></tr></tbody></table>';
            $x(pThis).innerHTML = lvar;
            var lSelect = $dom_AddTag('shuttle1','select');
            var lSelect2 = $dom_AddTag('shuttle2','select');
            lSelect.multiple = true;
            lSelect2.multiple = true;
            for (var i=0,len=myObject.row.length;i<len;i++){
                if (!!myObject.row[i]) {
                    var lTest = (!!myObject.row[i].C)?parseInt(myObject.row[i].C):false;
                    if(lTest){var lOption = $dom_AddTag(lSelect2,'option');}
                    else{var lOption = $dom_AddTag(lSelect,'option');}
                    lOption.text = myObject.row[i].D;
                    lOption.value = myObject.row[i].R;
                }
            }
            window.g_Shuttlep_v01 = null;
            if(!flowSelectArray){var flowSelectArray = [];}
            flowSelectArray[2] = lSelect;
            flowSelectArray[1] = lSelect2;
            window.g_Shuttlep_v01 = new dhtml_ShuttleObject(lSelect,lSelect2);
            return window.g_Shuttlep_v01;

        }else if(that.l_Type == 'SELECT' || that.l_Type == 'MULTISELECT'){
            var lSelect = $dom_AddTag(pThis,'select');
            for (var i=0,len=myObject.row.length;i<len;i++){
                if (!!myObject.row[i]) {
                    var lOption = $dom_AddTag(lSelect,'option');
                    lOption.text = myObject.row[i].D;
                    lOption.value = myObject.row[i].R;
                    var lTest = parseInt(myObject.row[i].C);
                    lOption.selected=lTest;
                }
            }
            that.l_Dom = lSelect;
            return that;
        }else if(that.l_Type == 'RADIO'){
            var ltable = $dom_AddTag(pThis,'table');
            for (var i=0,len=myObject.row.length;i<len;i++){
                if (!!myObject.row[i]) {
                    if (i % 10==0 || pForceNewLine) {
                        lrow = $dom_AddTag(ltable,'tr');
                    }
                    var lTd = $dom_AddTag(lrow,'td');
                    //var lTest = parseInt(myObject.row[i].C)
                    var lTest = false;
                    if (pCheckedValue) {
                        if (pCheckedValue == myObject.row[i].R) {
                            lTest = true;
                        }
                    }
                    var lCheck = $dom_AddInput(lTd,'radio',myObject.row[i].R);
                    lCheck.checked=lTest;
                    $dom_AddTag(lTd,'span',myObject.row[i].D);
                }
            }
            that.l_Dom = lSelect;
            return that;
        }else if(that.l_Type == 'CHECKBOX'){
            var ltable = $dom_AddTag(pThis,'table');
            for (var i=0,len=myObject.row.length;i<len;i++){
                if (!!myObject.row[i]) {
                    if (i % 10==0 || pForceNewLine) {lrow = $dom_AddTag(ltable,'tr');}
                    var lTd = $dom_AddTag(lrow,'td');
                    var lTest = parseInt(myObject.row[i].C);
                    var lCheck = $dom_AddInput(lTd,'checkbox',myObject.row[i].R);
                    lCheck.checked=lTest;
                    $dom_AddTag(lTd,'span',myObject.row[i].D)
                }
            }
            that.l_Dom = lSelect;
            return that;
        }else{
            var lHolder = $dom_AddTag(pThis,'div');
                for (var i=0,len=myObject.row.length;i<len;i++){
                if (!!myObject.row[i] && myObject.row[i].R ) {
                    var l_D = (!!myObject.row[i].D)?myObject.row[i].D:myObject.row[i].R;
                    var lThis = $dom_AddTag(lHolder,that.l_Type.toUpperCase(),l_D);
                    that.l_NewEls[that.l_NewEls.length] = lThis;
                    lThis.id = myObject.row[i].R;
                    var lTest = parseInt(myObject.row[i].C);
                    if (lTest) {lThis.className = 'checked';}
                }
            }
            that.l_Dom = lHolder;
            return that;
        }

    }
}

/**
 * @namespace apex.ajax
 */
apex.ajax = {
    /**
     * @param {?} pReturn
     * */
    clob : function (pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,$x('pFlowId').value,'APXWGT',0);
        this.ajax.addParam('p_widget_name','apex_utility');
        this.ajax.addParam('x04','CLOB_CONTENT');
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;
        return;
        function _get(pValue){
            that.ajax.addParam('x05','GET');
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){
            that.ajax.addParam('x05','SET');
            that.ajax.AddArrayClob(pValue,1);
            that.ajax.GetAsync(that._return);
        }
        function _return(){
        if(p.readyState == 1){
            }else if(p.readyState == 2){
            }else if(p.readyState == 3){
            }else if(p.readyState == 4){
              return p;
            }else{return false;}
        }
    },
    /**
     * @param {?} pReturn
     * */
    test : function (pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,$x('pFlowId').value,'APXWGT',0);
        this.ajax.addParam('p_widget_name','apex_utility');
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;
        return;
        function _get(pValue){
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){}
        function _return(pValue){}
    },
    /**
     * @param {?} pWidget
     * @param {?} pReturn
     * */
    widget : function (pWidget,pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,$x('pFlowId').value,'APXWGT',0);
        this.ajax.addParam('p_widget_name',pWidget);
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;
        return;
        function _get(pValue){
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){}
        function _return(pValue){}
    },
    /**
     * @param {?} pWidget
     * @param {?} pReturn
     * */
    ondemand : function (pWidget,pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,$x('pFlowId').value,'APPLICATION_PROCESS='+pWidget,0);
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;
        return;
        function _get(pValue){
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){}
        function _return(pValue){}
    },
    /**
     * @param {?} pUrl
     * @param {?} pReturn
     * */
    url : function (pUrl,pReturn){
        var that = this;
        this.ajax = new htmldb_Get(null,null,null,null,null,'f',pUrl);
        this._get = _get;
        this._set = _set;
        this._return = !!pReturn?pReturn:_return;
        return;
        function _get(pValue){
            that.ajax.GetAsync(that._return);
        }
        function _set(pValue){}
        function _return(pValue){}
    }

};



function item_menu(pThis,pColumn){
    $x_Style('item_menu','position','absolute');
    var lA = $x('item_menu').getElementsByTagName('a');
    for (var i=0,len=lA.length;i<len;i++){
        var lHref = lA[i].href;
        lHref=lHref.split(':');
        lHref[lHref.length-1] = pColumn;
        lA[i].href = $u_ArrayToString(lHref,':')
    }
    dhtml_ButtonDropDown(pThis,'item_menu');
    $x_Show('item_menu');
}


/**
* Given a DOM node, string ID or array of DOM nodes, will call the relevant item based function,
* as defined by the value for pMode
* @function
* @param {DOM node | string ID | DOM node Array} pNd
* @param String pMode (Possible values 'hide', 'show',..)
* @return {DOM node | Array}
*/
function doMultiple(pNd, pMode) {
    pNd = $u_Carray(pNd);
    for (var i=0; i<pNd.length; i++) {
        var node = $x(pNd[i]);
        apex.item(node)[pMode]();
    }
    return $u_Narray(pNd);
} // end doMultiple


/**
 * Used for base disable / enable handling
 *
 * @ignore
 * */
function base_disableItem(pNd, pTest){
    pTest = !!pTest;
    if($x(pNd)){pNd = [pNd];}
    for(var i=0,len=pNd.length;i<len;i++){
        var node = $x_object(pNd[i]);
        if(node){
            var l_Dom_Node = node.node;
            if(node.item_type=='RADIO_GROUP' || node.item_type=='CHECKBOX_GROUP'){
                l_Dom_Node = $x_FormItems(l_Dom_Node,(node.item_type=='RADIO_GROUP')?'RADIO':'CHECKBOX');
                base_disableItem(l_Dom_Node, pTest)
            }else if(l_Dom_Node.type=='radio'||l_Dom_Node.type=='checkbox'){
                apex.jQuery(l_Dom_Node).toggleClass('apex_disabled_multi', pTest);
                l_Dom_Node.disabled = pTest;
            }else{
                apex.jQuery(l_Dom_Node).toggleClass('apex_disabled', pTest);
                l_Dom_Node.disabled = pTest;
            }
        }
    }
    if(pNd.length==1){pNd=pNd[0];}
    return pNd;
}

/*
  str should be in the form of a valid f?p= syntax
*/

/**
 * @constructor
 * @param {Dom node | String} [obj] object to put in the partial page
 * @param {String} [flow] flow id
 * @param {String} [req] request value
 * @param {String} [page] page id
 * @param {String} [instance] instance
 * @param {String} [proc] process to call
 * @param {String} [queryString] hodler for quesry string
 *
 * */
function htmldb_Get(obj,flow,req,page,instance,proc,queryString) {
  /* setup variables */
  this.obj         = $x(obj);                              // object to put in the partial page
  this.proc        = (!!proc) ? proc : 'wwv_flow.show';    // proc to call
  this.flow        = (!!flow) ? flow : $v('pFlowId');      // flowid
  this.request     = (!!req)  ? req : '';                  // request
  this.page        = (!!page) ? page : '0';
  this.queryString = (!!queryString) ? queryString : null; // holder for passing in f? syntax

  this.params   = '';   // holder for params
  this.response = '';   // holder for the response
  this.base     = null; // holder fot the base url
  this.syncMode     = false;
  // declare methods
  this.addParam     = htmldb_Get_addParam;
  this.add          = htmldb_Get_addItem;
  this.getPartial   = htmldb_Get_trimPartialPage;
  /**
   * function return the full response
   * */
this.getFull      = function(obj){
    var result;
    var node;
    if (obj){this.obj = $x(obj);}
    if (this.obj){
        if(this.obj.nodeName == 'INPUT'){
            this.obj.value = this.response;
        }else{
            if(document.all){
                result = this.response;
                node = this.obj;
                setTimeout(function() {htmldb_get_WriteResult(node, result)},100);
            }else{
                $s(this.obj,this.response);
            }
        }
    }
    return this.response;
} ;

/**
 * @param {Dom Node | String | Array | Dom Array | String id}[]
 * @return {}
 * */
  this.get          = function(mode,startTag,endTag){
   var p;
   try {
      p = new XMLHttpRequest();
    } catch (e) {
      p = new ActiveXObject("Msxml2.XMLHTTP");
    }
    try {
        var startTime = new Date();
        p.open("POST", this.base, this.syncMode);
        p.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        p.send(this.queryString == null ? this.params : this.queryString );
        this.response = p.responseText;
        if (this.node){this.replaceNode(p.responseXML);}
        if ( mode == null || mode =='PPR' ) {
            return this.getPartial(startTag,endTag);
        } if ( mode == "XML" ) {
            return p.responseXML;
        } else {
            return this.getFull();
        }

    } catch (e) {
       return;
    }
 };

  this.url          = htmldb_Get_getUrl;
  this.escape       = htmldb_Get_escape;
  this.clear        = htmldb_Get_clear;
  this.sync         = htmldb_Get_sync;
  this.setNode      = setNode;
  this.replaceNode  = replaceNode;

  // setup the base url
   var u = (window.location.href.indexOf("?") > 0) ? window.location.href.substring(0,window.location.href.indexOf("?")) : window.location.href;
   this.base = u.substring(0,u.lastIndexOf("/"));

   if (!!!this.proc){this.proc = u.substring(u.lastIndexOf("/")+1);}

   this.base = this.base +"/" + this.proc;

  // grab the instance form the page form
  if(instance==null||instance==""){
    this.instance = $v('pInstance');
  }else{
    this.instance = instance;
  }

  // finish setiing up the base url and params
  if ( ! queryString ) {
      this.addParam('p_request',     this.request) ;
      this.addParam('p_instance',    this.instance);
      this.addParam('p_flow_id',     this.flow);
      this.addParam('p_flow_step_id',this.page);
  }

  function setNode(id) {
    this.node = $x(id);
  }
  function replaceNode(newNode){
      var i=0;
      for(i=this.node.childNodes.length-1;i>=0;i--){
        this.node.removeChild(this.node.childNodes[i]);
      }
      this.node.appendChild(newNode);
  }
}
function htmldb_Get_sync(s){
  this.syncMode=s;
}

function htmldb_Get_clear(val){
  this.addParam('p_clear_cache',val);
}

//
// return the queryString
//
function htmldb_Get_getUrl(){
    return this.queryString == null ? this.base +'?'+ this.params : this.queryString;
}

function htmldb_Get_escape(val){
    // force to be a string
     val = val + "";
     val = val.replace(/\%/g, "%25");
     val = val.replace(/\+/g, "%2B");
     val = val.replace(/\ /g, "%20");
     val = val.replace(/\./g, "%2E");
     val = val.replace(/\*/g, "%2A");
     val = val.replace(/\?/g, "%3F");
     val = val.replace(/\\/g, "%5C");
     val = val.replace(/\//g, "%2F");
     val = val.replace(/\>/g, "%3E");
     val = val.replace(/\</g, "%3C");
     val = val.replace(/\{/g, "%7B");
     val = val.replace(/\}/g, "%7D");
     val = val.replace(/\~/g, "%7E");
     val = val.replace(/\[/g, "%5B");
     val = val.replace(/\]/g, "%5D");
     val = val.replace(/\`/g, "%60");
     val = val.replace(/\;/g, "%3B");
     val = val.replace(/\?/g, "%3F");
     val = val.replace(/\@/g, "%40");
     val = val.replace(/\&/g, "%26");
     val = val.replace(/\#/g, "%23");
     val = val.replace(/\|/g, "%7C");
     val = val.replace(/\^/g, "%5E");
     val = val.replace(/\:/g, "%3A");
     val = val.replace(/\=/g, "%3D");
     val = val.replace(/\$/g, "%24");
     //val = val.replace(/\"/g, "%22");
    return val;
}
// Simple function to add name/value pairs to the url
function htmldb_Get_addParam(name,val){
    if ( this.params == '' )
     this.params =  name + '='+ ( val != null ? this.escape(val)  : '' );
  else
     //this.params = this.params + '&'+ name + '='+ ( val != null ? val  : '' );
     this.params = this.params + '&'+ name + '='+ ( val != null ? this.escape(val)  : '' );
     return;
}
/** Simple function to add name/value pairs to the url */
function htmldb_Get_addItem(name,value){
  this.addParam('p_arg_names',name);
  this.addParam('p_arg_values',value);
}
/** funtion strips out the PPR sections and returns that */
function htmldb_Get_trimPartialPage(startTag,endTag,obj) {
   if(obj) {this.obj = $x(obj);}
   if(!startTag){startTag = '<!--START-->'}
   if(!endTag){endTag  = '<!--END-->'}
   var start = this.response.indexOf(startTag);
   var part;
   var result;
   var node;
   if(start>0){
       this.response  = this.response.substring(start+startTag.length);
       var end   = this.response.indexOf(endTag);
       this.response  = this.response.substring(0,end);
   }
       if(this.obj){
            if(document.all){
              result = this.response;
              node = this.obj;
              setTimeout(function() {htmldb_get_WriteResult(node, result)},100);
            }else{
              $s(this.obj,this.response);
            }
          }
   return this.response;
}

var gResult = null;
var gNode = null;

function htmldb_get_WriteResult(node, result){
    $s(node,result);
    return;
}


/**
 * Adds asynchronous AJAX to the {@link htmldb_Get} object.
 *
 * @param {function} pCallback Function that you want to call when the xmlhttp state changes
 *                             in the function specified by pCallback. The xmlhttp object can be referenced by declaring
 *                             a parameter, for example pResponse in your function.
 * @extends htmldb_Get
*/
htmldb_Get.prototype.GetAsync = function(pCallback){
   var lRequest;
   try{
      lRequest = new XMLHttpRequest();
    }catch(e){
      lRequest = new ActiveXObject("Msxml2.XMLHTTP");
    }
    try {
        var startTime = new Date();
            lRequest.open("POST", this.base, true);
            if (lRequest) {
                lRequest.onreadystatechange = function(){
                                                    // for backward compatibility we will also assign the request to the global variable p
                                                    p = lRequest;
                                                    pCallback(lRequest);
                                                  };
                lRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                lRequest.send(this.queryString == null ? this.params : this.queryString );
                return lRequest;
            }
        }catch(e){
      return false;
    }
 };

/**
 * Gets PDF src XML
 * */
function htmldb_ExternalPost(pThis,pRegion,pPostUrl){
   var pURL = 'f?p='+$x('pFlowId').value+':'+$x('pFlowStepId').value+':'+$x('pInstance').value+':FLOW_FOP_OUTPUT_R'+pRegion;
   document.body.innerHTML = document.body.innerHTML + '<div style="display:none;" id="dbaseSecondForm"><form id="xmlFormPost" action="' + pPostUrl + '?ie=.pdf" method="post" target="pdf"><textarea name="vXML" id="vXML" style="width:500px;height:500px;"></textarea></form></div>';
   var l_El = $x('vXML');
   var get = new htmldb_Get(l_El,null,null,null,null,'f',pURL.substring(2));
   get.get();
   get = null;
   setTimeout( function() {
       $x("xmlFormPost").submit();
   },10 );
  return;
}

/**
 * Simple XML Control
 * */
function $xml_Control(pThis){
        this.xsl_string = '<?xml version="1.0"?><xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:output method="html"/><xsl:param name="xpath" /><xsl:template match="/"><xsl:copy-of select="//*[@id=$xpath]"/></xsl:template></xsl:stylesheet>';
        if(document.all){
            this.xsl_object = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.3.0");
            this.xsl_object.async=false;
            this.xsl_object.loadXML(this.xsl_string);
            tmp = new ActiveXObject("Msxml2.XSLTemplate.3.0");
            tmp.stylesheet = this.xsl_object;
            this.xsl_processor = tmp.createProcessor();
        }else{
          this.xsl_object = (new DOMParser()).parseFromString(this.xsl_string, "text/xml");
            this.xsl_processor = (new XSLTProcessor());
            this.xsl_processor.importStylesheet(this.xsl_object);
            this.ownerDocument = document.implementation.createDocument("", "test", null);
        }
        this.xml = pThis;
        this.CloneAndPlace = _CloneAndPlace;
        return;

        function _CloneAndPlace(pThis,pThat,pText){
           var lThat = $x(pThat);
             if(document.all){
                this.xsl_processor.addParameter("xpath", pThis);
                this.xsl_processor.input = this.xml;
                this.xsl_processor.transform;
                var newFragment = this.xsl_processor.output;
             }else{
                this.xsl_processor.setParameter(null, "xpath", pThis);
                var newFragment = this.xsl_processor.transformToFragment(this.xml,this.ownerDocument);
             }
             if(lThat){
                if(ie){
                 $s(lThat,newFragment);
                }else{
                 $s(lThat,'');
                lThat.appendChild(newFragment);
                }
             /*
             in IE newFragment will be a string
             in FF newFragment will be a dome Node (more useful)
             */
             return newFragment;
             }
        }
}

htmldb_Get.prototype.AddArray=function(pArray,pFnumber){
        var lFName = 'f';
        pFnumber = $nvl(pFnumber,1);
        if(pFnumber<10){lFName+='0'+pFnumber}else{lFName+=pFnumber}
        for(var i=0,len=pArray.length;i<len;i++){this.addParam(lFName,pArray[i]);}
        return this;
    };

htmldb_Get.prototype.AddArrayItems=function(pArray,pFnumber){
        var lFName = 'f';
        pFnumber = $nvl(pFnumber,1);
        if(pFnumber<10){lFName+='0'+pFnumber}else{lFName+=pFnumber}
        for(var i=0,len=pArray.length;i<len;i++){this.addParam(lFName,$nvl($v(pArray[i])),'');}
        return this;
    };

htmldb_Get.prototype.AddNameValue=function(pName,pValue,pFnumber){
    var lFName = 'f';
    var lFName2 = 'f';
    pFnumber = $nvl(pFnumber,1);
    pFnumber2 = pFnumber + 1;
    if(pFnumber<10){
        lFName+='0'+pFnumber}
    else{
        lFName+=pFnumber}
    if(pFnumber2<10){
        lFName2+='0'+pFnumber2;}
    else{
        lFName2+=pFnumber2;}
    this.addParam(lFName,pName);
    this.addParam(lFName2,$nvl(pValue),'');
    return this;
};

htmldb_Get.prototype.AddArrayItems2=function(pArray,pFnumber,pKey){
        var lFName = 'f';
        var lFName2 = 'f';
        pFnumber = $nvl(pFnumber,1);
        pFnumber2 = pFnumber + 1;
        if(pFnumber<10){
            lFName+='0'+pFnumber
        }else{
            lFName+=pFnumber
        }
        if(pFnumber2<10){
            lFName2+='0'+pFnumber2;
        }else{
            lFName2+=pFnumber2;
        }

        for(var i=0,len=pArray.length;i<len;i++){
            var lTest = $x(pArray[i]);
            if(lTest && lTest.id.length != 0){
                if (pKey) {
                    this.addParam(lFName, apex.jQuery(lTest).attr(pKey));
                } else {
                    this.addParam(lFName, lTest.id);
                }
            }
        }
        for(var i=0,len=pArray.length;i<len;i++){
            var lTest = $x(pArray[i]);
            if(lTest && lTest.id.length != 0){
                this.addParam(lFName2,$nvl($v(lTest)),'');
            }
        }

        return this;
    };

htmldb_Get.prototype.AddArrayClob=function(pText,pFnumber){
        var lArray = $s_Split(pText,4000);
        this.AddArray(lArray,pFnumber);
        return this;
    };

/**
 * @function
 * Post Large Strings
 * */
function $a_PostClob(pThis,pRequest,pPage,pReturnFunction){
    var get = new htmldb_Get(null,$v('pFlowId'),pRequest,pPage, null, 'wwv_flow.accept');
    get.AddArrayClob($x(pThis).value,1);
    get.GetAsync(pReturnFunction);
    get=null;
}

/**
 * @function
 * Get Large Strings
 * */
function $a_GetClob(pRequest,pPage,pReturnFunction){
   var get = new htmldb_Get(null,$v('pFlowId'),pRequest,pPage, null,'wwv_flow.accept');
   get.GetAsync(pReturnFunction);
   get = null;
   x = null;
}

htmldb_Get.prototype.AddPageItems = function(pArray){
        for(var i=0,len=pArray.length;i<len;i++){
            if($x(pArray[i])){this.add($x(pArray[i]).id,$v(pArray[i]));}
        }
    };

htmldb_Get.prototype.AddGlobals=function(p_widget_mod,p_widget_action,p_widget_action_mod,p_widget_num_return,x01,x02,x03,x04,x05,x06,x07,x08,x09,x10){
    this.addParam('p_widget_mod',p_widget_mod);
    this.addParam('p_widget_action',p_widget_action);
    this.addParam('p_widget_action_mod',p_widget_action_mod);
    this.addParam('p_widget_num_return',p_widget_num_return);
    this.addParam('x01',x01);
    this.addParam('x02',x02);
    this.addParam('x03',x03);
    this.addParam('x04',x04);
    this.addParam('x05',x05);
    this.addParam('x06',x06);
    this.addParam('x07',x07);
    this.addParam('x08',x08);
    this.addParam('x09',x09);
    this.addParam('x10',x10);
    return this;
};

/**
 * Split a string pString into an array of strings the size of pLength
 * @function
 * @param {String} pString
 * @param {Number} pLength
 * @return Array
 *
 * */
function $s_Split(pString,pLength){
    var lArray = [];
    if (pString.length<=pLength) {
        lArray[lArray.length]=pString;
    } else {
        while (pString.length>4000) {
            lArray[lArray.length]=pString.substr(0,4000);
            pString = pString.substr(4000,pString.length-4000);
        }
        lArray[lArray.length]=pString.substr(0,4000);
    }
    return lArray;
}

/* End Post and Retrieve Large Strings */

/*
Set items in conjunction with apex_util.json_from_items('ITEM1:ITEM2:ITEM3');
*/
function json_SetItems(gReturn){
    gReturn = apex.jQuery.parseJSON( gReturn );
    for (var j=0,len=gReturn.item.length;j<len;j++){
        apex.item(gReturn.item[j].id).setValue(gReturn.item[j].value);
    }
}

/*namespaced javascript*/

var gDebug = true;
var gkeyPressTime;
var gLastTab=false;
var gRegex=false;
var ie=(document.all)?true:false;
if(ie){document.expando=true;}
var gDebugWindow = false;

/**
 * Given a DOM node or string ID (pNd), this function returns a DOM node if the element is on the page, or returns false if it is not.
 * @function
 * @param {DOM node | string ID} pNd
 * @return {DOM node | false}
 */
function $x(pNd){return apex.item(pNd).node;}

/**
 * Given a DOM node or string ID (pNd), this function returns a apex.page.item object.
 * @function
 * @param {DOM node | string ID} pNd
 * @return {DOM node | false}
 */
function $x_object(pNd){return apex.item(pNd);}
$item = $x_object;

/**
 * Given a DOM node or string ID (pNd), this function returns the value of an Application Express item in the same format as it would be posted.
 * @function
 * @param {DOM node | string ID} pNd
 */
function $v(pNd){
  var lValue = apex.item(pNd).getValue();
  if (apex.jQuery.isArray(lValue)) {
    return lValue.join(':');
  } else {
    return lValue;
  }
}

/**
 * Given a DOM node or string ID (pNd), this function returns the value of an Application Express item as a string or an array if the item type
 * can contain multiple values like checkbox, multi select list, ...
 * @function
 * @param {DOM node | string ID} pNd
 */
function $v2(pNd){
  return apex.item(pNd).getValue();
}

/**
 * Given a DOM node or string ID (pNd), this function sets the Application Express item value taking into account what type of item it is.
 * @function
 * @param {DOM node | string ID} pNd
 * @param {String , Array} pValue
 * @param {String} pDisplayValue
 * @param {Boolean} pSuppressChangeEvent
 */
function $s(pNd,pValue,pDisplayValue,pSuppressChangeEvent){
    return apex.item(pNd).setValue(pValue, pDisplayValue, pSuppressChangeEvent);
}

/**
 * Given a DOM node or string ID or an Array (pNd), this function will try to return an Array. Used for creating DOM based functionality that can accept a single or multiple DOM nodes.
 * @function
 * @param {DOM node | string ID | Array} pNd
 * @return Array
 */
function $u_Carray(pNd){
    return ($x(pNd))?[pNd]:pNd;
}

/**
 * Given a DOM node or string ID or an Array (pNd), this function will try to return a single value, if an pNd is an array but only has one element the value of that element will be returned otherwise the array will be returned.   Used for creating DOM based functionality that can accept a single or multiple DOM nodes.
 * @function
 * @param {DOM node | string ID | Array} pNd
 * @return {Array} Array or first value
 */
function $u_Narray(pNd){
    return (pNd.length == 1)?pNd[0]:pNd;
}

/**
 * If pTest is empty or false return pDefault otherwise return pTest.
 * @function
 * @param {String | Array} pTest
 * @param {String | Array} pDefault
 * @return {String | Array}
 */
function $nvl(pTest,pDefault){
    return (pTest!=null)?pTest:((!!pDefault)?pDefault:'');
}


/**
 * Check to see if this a compond object and if so return it's fieldset instead this helps get and items whole html structure instead of just the form element itself
 * @function
 * @param {DOM node | string ID} pNd
 */

function $x_Check_For_Compound(pNd){
    var lNode = $x(pNd);
    if(lNode && $x(lNode.id + '_fieldset')){
     return $x(lNode.id + '_fieldset');
    }else{
     return lNode;
    }
}

/**
 * Sets a specific style property (pStyle) to given value (pString) of a DOM node or DOM node Array (pNd).
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @param {String} pStyle
 * @param {String} pString
 * @return {DOM node | DOM Array}
 */
function $x_Style(pNd,pStyle,pString){
    pNd = $u_Carray(pNd);
    for(var i=0;i<pNd.length;i++){
        var node = $x(pNd[i]);
        (!!node)?node.style[pStyle]=pString:null;
    }
    return $u_Narray(pNd);
}


/**
* Hides a DOM node or array of DOM nodes (pNd).
* @function
* @param {DOM node | string ID | DOM node Array} pNd
* @return {DOM node | Array}
*/
function $x_Hide(pNd){
    return doMultiple(pNd, 'hide');
}

/**
 * Shows a DOM node or array of DOM nodes (pNd).
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @return {DOM node | Array}
 */
function $x_Show(pNd){
    return doMultiple(pNd, 'show');
}

/**
 * Shows a DOM node or array of DOM nodes (pShow) and hides a DOM node or array of DOM nodes (pHide)
 * @function
 * @param {DOM node | string ID | DOM node Array} pShow
 * @param {DOM node | string ID | DOM node Array} pHide
 */
function $x_Show_Hide(pShow,pHide){
    $x_Hide(pHide);
    $x_Show(pShow);
    return;
}

/**
 * Toggles a DOM node or array of DOM nodes (pNd).
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @return {DOM node | Array}
 */
function $x_Toggle(pNd){
    var id, node, testNode;
    pNd = $u_Carray(pNd);
    for (var i=0; i<pNd.length; i++) {
        node = $x(pNd[i]);
        if (typeof pNd[i] === 'string') {
            id = pNd[i];
        } else if (pNd[i].id) {
            id = pNd[i].id;
        }
        if (id) {
            // This code must stay in sync with the code in item.show and item.hide
            // for it is imperitive that toggle checks the visibility on the node
            // that is actually hidden.
            testNode = apex.jQuery( '#' + id + '_CONTAINER').get(0);
            if (!testNode) {
                testNode = apex.jQuery( '#' + id + '_DISPLAY').get(0);
            }
        }
        if (!testNode) {
            testNode = node;
        }
        if (node) {
            if (apex.jQuery(testNode).filter(':visible').length === 0) {
                $x_Show(node);
            } else {
                $x_Hide(node);
            }
        }
    }
    return $u_Narray(pNd);
}

/**
 * Removes a DOM node or array of DOM nodes.
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @return {DOM node | Array}
 */
function $x_Remove(pNd){
    pNd = $u_Carray(pNd);
    for(var i=0,len=pNd.length;i<len;i++){
        var node = $x(pNd[i]);
        var lParent = node.parentNode;
        if (node && lParent){
            lParent.removeChild(node);
            lParent.normalize();
        }
    }
    return $u_Narray(pNd);
}

/**
 * Sets the value (pValue) of a DOM node or array of DOM nodes (pNd).
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @param { String } pValue
 */
function $x_Value(pNd,pValue){
    pNd = $u_Carray(pNd);
    for(var j=0,len=pNd.length;j<len;j++){
        var lTemp = $item(pNd[j]);
        lTemp.setValue(pValue);
    }
    return;
}

/**
 * Starting from a DOM node (pNd), this function searches up the DOM tree and returns the first node
 * that matches the node name (pToTag) and optionally containing the class pToClass. It returns false
 * if no matching node is found.
 * @function
 * @param {DOM node | string ID} pNd
 * @param {String} pToTag
 * @param {String} pToClass
 * @return {DOM Node | false}
 */
function $x_UpTill(pNd, pToTag, pToClass) {
  var node = $x(pNd);
  if (node) {
    var tPar = node.parentNode;
    if(pToClass) {
        while (tPar && !(tPar.nodeName == pToTag && apex.jQuery(tPar).hasClass(pToClass))) {
            tPar = tPar.parentNode;
        }
    } else {
        while (tPar && tPar.nodeName != pToTag) {
            tPar = tPar.parentNode;
        }
    }
    return tPar || false;
  }else{
    return false;
  }
}

/**
 * Given DOM node or array of DOM nodes, this function (shows / hides /toggles) the entire row that contains the DOM node or array of DOM nodes.
 * This is most useful when using Page Items. This only works when table layout is used.
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @param { String } pFunc ['TOGGLE','SHOW','HIDE']
 * */
function $x_ItemRow(pNd,pFunc) {
    var node, lTr;
    pNd = $u_Carray(pNd);
    for (var i=0;i<pNd.length;i++) {
        node = $x_Check_For_Compound(pNd[i]);
        lTr = $x_UpTill(node,'TR');
        if (lTr) {
            switch(pFunc) {
                case 'TOGGLE':$x_Toggle(lTr);break;
                case 'SHOW':$x_Show(lTr);break;
                case 'HIDE':$x_Hide(lTr);break;
                default:break;
            }
        }
    }
}

/**
 * Given a page item name, this function hides the entire <tr> row that holds the item. In most cases, this will be the item and its label.
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @param { String } pFunc ['TOGGLE','SHOW','HIDE']
 * */
function $x_HideItemRow(pNd){
    $x_ItemRow(pNd,'HIDE');
}

/**
 * Given a page item name, this function shows the entire <tr> row that holds the item. In most cases, this will be the item and its label.
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * */
function $x_ShowItemRow(pNd){
    $x_ItemRow(pNd,'SHOW');
}

/**
 * Given a page item name (pNd), this function toggles the entire <tr> row that holds the item. In most cases, this will be the item and its label.
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * */
function $x_ToggleItemRow(pNd){
    $x_ItemRow(pNd,'TOGGLE');
}

/**
 * Hides all DOM nodes referenced in pNdArray and then shows the DOM node referenced by pNd. This is most useful when pNd is also a node in pNdArray.
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @param {DOM node | String | Array} pNdArray
 * @return {DOM node | DOM Array}
 * */
function $x_HideAllExcept(pNd,pNdArray){
    var l_Node = $x(pNd);
    if(l_Node){
        $x_Hide(pNdArray);
        $x_Show(l_Node);
    }
    return l_Node;
}

/**
 * Hides all sibling nodes of given DOM node (pNd).
 * @function
 * @param {DOM node | string ID} pNd
 * @return {DOM node}
 * */
function $x_HideSiblings(pNd){
    var lNode = apex.jQuery($x(pNd));
    return lNode.show().siblings().hide().get();
    //return lNode
    //return $x_HideAllExcept(pNd,$x(pNd).parentNode.childNodes);
}

/**
 * Shows all sibling DOM nodes of given DOM nodes (pNd).
 * @function
 * @param {DOM node | string ID} pNd
 * @return {DOM node | false}
 * */
function $x_ShowSiblings(pNd){
    var lNode = apex.jQuery($x(pNd));
    return lNode.show().siblings().show().get();
}

/**
 * Sets a DOM node or array of DOM nodes to a single class name.
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @param {String} pClass
 * */
function $x_Class(pNd,pClass){
    if($x(pNd)){pNd = [pNd];}
    var l=pNd.length;
    for(var i=0;i<l;i++){if($x(pNd[i])){$x(pNd[i]).className=pClass;}}
    return $u_Narray(pNd);
}

/**
 * Sets the class (pClass) of all DOM node siblings of a node (pNd). If pNdClass is not null the class of pNd is set to pNdClass.
 * @function
 * @param {DOM node | string ID} pNd
 * @param {String} pClass
 * @param {String} pNdClass
 * @return {DOM node | false}
 * */
function $x_SetSiblingsClass(pNd,pClass,pNdClass){
    var l_Node = apex.jQuery($x(pNd));
    l_Node.siblings().removeClass('').addClass(pClass);
    if(pNdClass){l_Node.removeClass('').addClass(pNdClass);}
    return l_Node.get();
}

/**
 * Returns an array of DOM nodes by a given class name (pClass). If the pNd parameter is provided, then the returned elements will be all be children of that DOM node. Including the pTag parameter further narrows the list to just return nodes of that tag type.
 * @function
 * @param {String} pClass
 * @param {DOM node | string ID} pNd
 * @param {String} pTag
 * @return { Array }
 * */
function $x_ByClass(pClass,pNd,pTag){
    var lClass = (pTag)?pTag+'.'+pClass:'.'+pClass;
    return apex.jQuery(lClass,$x(pNd)).get();
    /*
    if (!pTag){pTag = '*';}
    var els = pNd.getElementsByTagName(pTag);
    var elsLen = els.length;
    var pattern = new RegExp("(^|\\s)"+pClass+"(\\s|$)");
    for (var i=0,j=0;i<elsLen;i++){
        if (pattern.test(els[i].className)){
            classElements[j] = els[i];
            j++;
        }
    }
    return classElements;
    */
}

/**
 * Show all the DOM node children of a DOM node (pNd) that have a specifc class (pClass) and tag (pTag).
 * @function
 * @param {DOM node | string ID} pNd
 * @param {String} pClass
 * @param {String} pTag
 * */
function $x_ShowAllByClass(pNd,pClass,pTag) {
        lClass = (pTag)?pTag+'.'+pClass:'.'+pClass;
        apex.jQuery(lClass,$x(pNd)).show();
/*
    console.log('show all by class')
    var node = $x(pNd);
    var lH = $x_ByClass(pClass,node,pTag);
    if (lH) {$x_Show(lH);}
*/
}


/**
 * Show all all DOM node children of a DOM node (pNd).
 * @function
 * @param {DOM node | string ID} pNd
 * */
function $x_ShowChildren(pNd) {
    apex.jQuery($x(pNd)).children().show();
    /*
    var node = $x(pNd);
    if (node && node.hasChildNodes) {$x_Show(node.childNodes);}
    */
}

/**
 * Hide all all DOM node children of a DOM node (pNd).
 * @function
 * @param {DOM node | string ID} pNd
 * */
function $x_HideChildren(pNd) {
    apex.jQuery($x(pNd)).children().hide();
    /*
    var node = $x(pNd);
    if (node && node.hasChildNodes) {$x_Hide(node.childNodes);}
    */
}

/**
 * Disables or enables an item or array of items based on (pTest)
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @param {true|false} pTest
 * */
function $x_disableItem(pNd,pTest){
    var lMode = (pTest) ? 'disable' : 'enable';
    return doMultiple(pNd, lMode);
}

/**
 * Checks an item or an array of items to see if any are empty, set the class of all items that are empty to pClassFail, set the the class of all items that are not empty to pClass.
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * @param {String} [pClassFail]
 * @param {String} [pClass]
 * @return {false | Array} Array of all items that are empty
 * */
function $f_get_emptys(pNd,pClassFail,pClass){
    var l_temp = [],l_temp2 = [];
    if($x(pNd)){pNd = [pNd];}
    for(var i=0,len=pNd.length;i<len;i++){
        var node = $x(pNd[i]);
        if(node){
            if( apex.item(node).isEmpty() ){l_temp[l_temp.length] = node;}
            else{l_temp2[l_temp2.length] = node;}
        }
    }
    if(pClassFail){$x_Class(l_temp,pClassFail);}
    if(pClass){$x_Class(l_temp2,pClass);}
    if(l_temp.length===0){l_temp=false;}else{l_temp[0].focus();}
    return l_temp;
}


/**
 * Returns an item value as an array. Useful for multiselects and checkboxs
 * @function
 * @param {DOM node | string ID} pNd
 * @return {Array}
 * */
function $v_Array(pNd){
    return apex.jQuery.makeArray(apex.item(pNd).getValue());
}

/**
 * Returns an array of values from the checked boxes in a checkbox item
 * @function
 * @param {DOM node | string ID} pNd
 * @return {Array}
 * */
function $f_ReturnChecked(pNd){
    return ($x(pNd))?$v_Array(pNd):false;
}

/**
 * Clears the content of an DOM node or array of DOM nodes and hides them
 * @function
 * @param {DOM node | string ID | DOM node Array} pNd
 * */
function $d_ClearAndHide(pNd){
     if($x(pNd)){pNd=[pNd];}
     for(var i=0,len=pNd.length;i<len;i++){
         var lNode = $x(pNd[i]);
         if(lNode){$x_Hide(lNode).innerHTML = '';}
     }
     return;
}

/**
 * Returns the DOM nodes of the selected options of a select item (pNd).
 * @function
 * @param {DOM node | string ID} pNd
 * @return {DOM Array}
 * */
function $f_SelectedOptions(pNd){
    var lSelect = $x(pNd);
    var lValue=[];
    if(lSelect.nodeName == 'SELECT'){
        var lOpts = lSelect.options;
        for(var i=0,len=lOpts.length;i<len;i++){if(lOpts[i].selected){lValue[lValue.length] = lOpts[i];}}
        return $u_Narray(lValue);
    }
    return false;
}

/**
 * Returns the values of the selected options of a select item (pNd).
 * @function
 * @param {DOM node | string ID} pNd
 * @return {Array | String}
 * */
function $f_SelectValue(pNd){
     var lValue=$v_Array(pNd);
     return $u_Narray(lValue);
}

/**
 * Given an array (pArray) return a string with with the values of the array delimited with a given delimiter character (pDelim).
 * @function
 * @param {Array} pArray
 * @param {String} pDelim
 * */
function $u_ArrayToString(pArray,pDelim){
    var lReturn ='';
    if(!!pDelim){pDelim=':';}
    pArray = $u_Carray(pArray);
    for(var i=0,len=pArray.length;i<len;i++){lReturn += (pArray[i])?pArray[i] + pDelim:'' + pDelim;}
    return lReturn.substr(0,(lReturn.length-1));
}



/**
 * Checks an page item’s (pThis) value against a set of values (pValue). This function returns true if any value matches.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {Number | String | Array} pValue
 * @return {true | false}
 * */
function $v_CheckValueAgainst(pThis,pValue){
    var lTest = false,lArray = [],lValue = false;
    if(pValue.constructor == Array){lArray = pValue;}
    else{lArray[0] = pValue;}
    lValue = $v(pThis);
    for(var i=0,len=lArray.length;i<len;i++){
        lTest = lValue == lArray[i];
        if(lTest){break;}
    }
    return lTest;
}

/**
 * Checks an page item’s (pThis) value agianst a value (pValue). If it matches, a DOM node (pThat) is set to hidden. If it does not match, then the DOM node (pThat) is set to visible.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {DOM node | string ID | DOM node Array} pThat
 * @param {Number | String | Array} pValue
 * @return {true | false}
 * */
function $f_Hide_On_Value_Item(pThis,pThat,pValue){
    var lTest = $v_CheckValueAgainst(pThis,pValue);
    if(lTest){$x_Hide(pThat);}else{$x_Show(pThat);}
    return lTest;
}

/**
 * Checks an page item’s (pThis) value agianst a value (pValue). If it matches, a DOM node (pThat) is set to visible. If it does not match, then the DOM node (pThat) is set to hidden.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {DOM node | string ID | DOM node Array} pThat
 * @param {Number | String | Array} pValue
 * @return {true | false}
 * */
function $f_Show_On_Value_Item(pThis,pThat,pValue){
    var lTest = $v_CheckValueAgainst(pThis,pValue);
    if(lTest){$x_Show(pThat);}else{$x_Hide(pThat);}
    return lTest;
}

/**
 * Checks the value (pValue) of an item (pThis). If it matches, this function hides the table row that holds (pThat). If it does not match, then the table row is shown.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {DOM node | string ID | DOM node Array} pThat
 * @param {Number | String | Array} pValue
 * @return {true | false}
 * */
function $f_Hide_On_Value_Item_Row(pThis,pThat,pValue){
    var lTest = $v_CheckValueAgainst(pThis,pValue);
    if(lTest){$x_HideItemRow(pThat);}else{$x_ShowItemRow(pThat);}
    return lTest;
}

/**
 * Checks the value (pValue) of an item (pThis). If it matches, the function shows the table row that holds pThat. If it does not match then the table row is hidden.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {DOM node | string ID | DOM node Array} pThat
 * @param {Number | String | Array} pValue
 * @return {true | false}
 * */
function $f_Show_On_Value_Item_Row(pThis,pThat,pValue){
    var lTest = $v_CheckValueAgainst(pThis,pValue);
    if(lTest){$x_ShowItemRow(pThat);}else{$x_HideItemRow(pThat);}
    return lTest;
}

/**
 * Checks the value (pValue) of an item (pThis). If it matches, this function disables the item or array of items (pThat). If it does not match, then the item is enabled.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {String} pValue
 * @param {DOM node | string ID | DOM node Array} pThat
 * @return {true | false}
 * */
function $f_DisableOnValue(pThis,pValue,pThat){
    var lTest = $v_CheckValueAgainst(pThis,pValue);
    var lNd = [];
    if(pThat){
        if(pThat instanceof Array){
            lNd = pThat;
        }else{
            for (var i=2;i<arguments.length;i++){if(arguments[i]){lNd[lNd.length]=arguments[i];}}
        }
        $x_disableItem(lNd,lTest);
    }
    return lTest;
}

/**
 * Sets a class attribute of an array of nodes that are selected by class.
 * @function
 * @param {DOM node | string ID} pNd
 * @param {String} pClass
 * @param {String} [pTag]
 * @param {String} [pClass2]
 * @return {DOM node | DOM node Array}
 * */
function $x_ClassByClass(pNd,pClass,pTag,pClass2){
    var l_Els = $x_ByClass(pClass,pNd,pTag);
    $x_Class(l_Els,pClass2);
    return l_Els;
}


/**
 * Collects the values of form items contained within DOM node (pThis) of class attribute (pClass) and nodeName (pTag) and returns an array.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {String} pClass
 * @param {String} pTag
 * */
function $f_ValuesToArray(pThis,pClass,pTag){
    var lTemp = $x_ByClass(pClass,pThis,pTag);
    var lArray = [];
    for(var i=0,len=lTemp.length;i<len;i++){lArray[i] = lTemp[i].value;}
    return lArray;
}

/**
 * @ignore
 * @function
 * @param {DOM node | String | Array} pNd
 * */
function $dom_JoinNodeLists(pThis,pThat){
    var lArray = [],i,len;
    for(i=0,len=pThis.length;i<len;i++){lArray[i] = pThis[i];}
    for(i=0,len=pThat.length;i<len;i++){lArray[lArray.length] = pThat[i];}
    return lArray;
}

/**
 * Returns all form input items contained in a DOM node (pThis) of a certain type (pType). This has been rewritten to deal with fieldsets as well
 * @function
 * @param {DOM node | string ID} pNd
 * @param {String} pType
 * @return {DOM node Array}
 * */
function $x_FormItems(pNd,pType){
    var lType = (pType)?pType.toUpperCase():'ALL';
    var l_Inputs = [],l_Inputs2 = [],l_Array = [];
    var l_This = $x(pNd);
    if(l_This){
        if(l_This.nodeName=='SELECT'||l_This.nodeName=='INPUT'||l_This.nodeName=='TEXTAREA'){
            return [l_This];
        }
        l_Selects = l_This.getElementsByTagName('SELECT');
        l_Inputs = l_This.getElementsByTagName('INPUT');
        l_Textarea = l_This.getElementsByTagName('TEXTAREA');
        l_Fieldset = l_This.getElementsByTagName('FIELDSET');
        if(lType == 'SELECT'){
            l_Inputs = l_Selects;
        }else if(lType == 'TEXTAREA'){
            l_Inputs = l_Textarea;
        }else if (lType == 'ALL'){
            l_Inputs = $dom_JoinNodeLists(l_Inputs,l_Fieldset);
            l_Inputs = $dom_JoinNodeLists(l_Inputs,l_Selects);
            l_Inputs = $dom_JoinNodeLists(l_Inputs,l_Textarea);
        }else{}
        if(lType == 'SELECT'||lType == 'TEXTAREA'||lType == 'ALL'){
            l_Array = l_Inputs;
        }else{
            for (var i=0;i<l_Inputs.length;i++){
                if(l_Inputs[i].type.toUpperCase()==pType.toUpperCase()){l_Array[l_Array.length] = l_Inputs[i];}
            }
        }
        return l_Array;
    }
}

/**
 * Check or uncheck (pCheck) all check boxs contained within a DOM node (pThis). If an array of checkboxs DOM nodes (pArray) is provided, use that array for affected check boxs.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {true | false} pCheck
 * @param {DOM node Array} pArray
 * */
function $f_CheckAll(pThis,pCheck,pArray){
    var l_Inputs;
    if(pArray){l_Inputs = pArray;}
    else{l_Inputs = $x_FormItems(pThis,'CHECKBOX');}
    for (var i=0,l=l_Inputs.length;i<l;i++){l_Inputs[i].checked = pCheck;}
    return;
}

/**
 * This function sets all checkboxes located in the first column of a table based on the checked state of the calling checkbox (pNd), useful for tabular forms.
 * @function
 * @param {DOM node | String} pNd
 * @return {DOM node Array}
 * */
function $f_CheckFirstColumn(pNd){
    var lTable = $x_UpTill(pNd,"TABLE");
    var lArray = [];
    for(var i=0,len=lTable.rows.length;i<len;i++){
      var l_Temp = $x_FormItems(lTable.rows[i],'CHECKBOX')[0];
      if(l_Temp){lArray[lArray.length]=l_Temp;}
    }
    $f_CheckAll(false,pNd.checked,lArray);
    return lArray;
}


/** @ignore */
var gToggleWithImageA = 'pseudoButtonActive';

/** @ignore */
var gToggleWithImageI = 'pseudoButtonInactive';

/**
 * Given an image element (pThis) and a DOM node (pNd), this function toggles the display of the DOM node (pNd). The src attribute of the image element (pThis) will be rewritten. The image src will have any plus substrings with minus substrings or minus substrings will be replaced with plus substrings.
 * @function
 * @param {DOM node | string ID} pThis
 * @param {DOM node | string ID | DOM node Array} pNd
 * @return {DOM node}
 * */
function $x_ToggleWithImage(pThis,pNd){
    pThis = $x(pThis);
    if($x_CheckImageSrc(pThis,'plus')){
        $x_Class(pThis,gToggleWithImageI);
        pThis.src = html_StringReplace(pThis.src,'plus','minus');
    }else{
        $x_Class(pThis,gToggleWithImageA);
        pThis.src = html_StringReplace(pThis.src,'minus','plus');
    }
    var node = $x_Toggle(pNd);
    return node;
}

/**
 * Checks an image (pId) src attribute for a substring (pSearch). If a substring is found, this function replaces the image entire src attribute with (pReplace).
 * @function
 * @param {DOM node | string ID} pNd
 * @param {String} pSearch
 * @param {String} pReplace
 * @return {DOM node | false}
 * */
function $x_SwitchImageSrc(pNd,pSearch,pReplace){
  var lEl = $x(pNd);
  if(lEl && lEl.nodeName=="IMG"){if(lEl.src.indexOf(pSearch)!=-1){lEl.src=pReplace;}}
  return lEl;
}

/**
 * Checks an image (pNd) source attribute for a substring (pSearch). The function returns true if a substring (pSearch) is found. It returns false if a substring (pSearch) is not found.
 * @function
 * @param {DOM node | string ID} pNd
 * @param {String} pSearch
 * @return {true | false}
 * */
function $x_CheckImageSrc(pNd,pSearch){
    var lEL=$x(pNd) , lReturn=false;
    if(lEL && lEL.nodeName=="IMG"){lReturn = $u_SubString(lEL.src,pSearch);}
    return lReturn;
}

/**
 * Returns a true or false if a string (pText) contains a substring (pMatch).
 * @function
 * @param {String} pText
 * @param {String} pMatch
 * @return {true | false}
 * */
function $u_SubString(pText,pMatch){return (pText.toString().indexOf(pMatch.toString()) != -1);}


/**
 * @function
 * @param {DOM node | string ID} pNd
 * */
function html_RemoveAllChildren(pNd) {
    var lEl = $x(pNd);
    if (lEl && lEl.hasChildNodes && lEl.removeChild){while(lEl.hasChildNodes()){lEl.removeChild(lEl.firstChild);}}
}

/**
 * Basic Aynscronous Ajax Loading graphic.
 * @function
 * */
function ajax_Loading(pState){
        if(pState == 1){$x_Show('loader','wait');}
        else{$x_Hide('loader');}
}


/**
 * Sets the value (pValue) of a select item (pId). If the value is not found, this functions selects the first option (usually the NULL selection).
 * @function
 * @param {DOM node | String} pId
 * @param {String} pValue
 * */
function html_SetSelectValue(pId,pValue){
    var lSelect = $x(pId);
    if(lSelect.nodeName == 'SELECT'){
        lSelect.selectedIndex = 0;
        for(var i=0,l=lSelect.options.length;i<l;i++){if(lSelect.options[i].value == pValue){lSelect.options[i].selected=true;}}
    }
}

/**
 * Adds an onload function (func) without overwriting any previously specified onload functions.
 * @function
 * @param {Function} pFunction
 * */
function addLoadEvent(pFunction) {
  apex.jQuery(document).ready(pFunction);
}

/**
 * Swaps the form values of two form elements (pThis,pThat).
 * @function
 * @param {DOM node | String} pThis
 * @param {DOM node | String} pThat
 * @return Not applicable.
 * */
function $f_Swap(pThis,pThat){
    var lThis = $x(pThis);lThat = $x(pThat);
    if(pThis && pThat){
        $x_Value(pThis,lThat.value);
        $x_Value(pThat,lThis.value);
    }
}

/**
 * @function
 * @param {DOM node | String | Array} pNd
 * */
function $f_Enter(e){
    var keycode;
    if(window.event){keycode = window.event.keyCode;}
    else if (e){keycode = e.which;}
    else {return false;}
    if(keycode == 13){return true;}
    else{return false;}
}

/**
 * Sets array of form item (pArray) to sequential number in multiples of (pMultiple).
 * @function
 * @param {DOM node | Array} pArray
 * @param {String | Number} pMultiple
 * */
function $f_SetValueSequence(pArray,pMultiple){
    var lLength = pArray.length;
    for (var i=0;i<lLength;i++){$x_Value(pArray[i],(i+1)*pMultiple);}
}

/**
 * Inserts the html element (pTag) as a child node of a DOM node (pThis) with the innerHTML set to (pText).
 * @param {DOM node | string ID} pThis
 * @param {String} [pTag] (default)
 * @param {String} [pText]
 * @return {DOM node}
 */
function $dom_AddTag(pThis,pTag,pText){
    var lThis = document.createElement(pTag);
    var lThat = $x(pThis);
    if(lThat){lThat.appendChild(lThis);}
    if(pText!=null){lThis.innerHTML = pText;}
    return lThis;
}

/**
 * Appends a table cell <td> to a table row (pThis). And sets the content to (pText).
 * @function
 * @param {DOM node | string ID} pThis
 * @param {String} pText
 * @return {DOM node}
 * */
function $tr_AddTD(pThis,pText){
    return $dom_AddTag($x(pThis),'TD',pText);
}

/**
 * Appends a table header cell <th> to a table row (pThis). And sets the content to (pText).
 * @function
 * @param {DOM node | string ID} pThis
 * @param {String} pText
 * @return {DOM node}
 * */
function $tr_AddTH(pThis,pText){return $dom_AddTag($x(pThis),'TH',pText);}

/**
 * @function
 * @param {DOM node | string ID} pThis
 * @param {string} pThat
 * */
function $dom_Replace(pThis,pThat){
    var lThis = $x(pThis),lParent = lThis.parentNode;
    lThat =  $dom_AddTag(lParent,pThat);
    return lParent.replaceChild(lThat,lThis);
}

/**
 * Inserts the html form input element (pType) as a child node of a DOM node (pThis) with an id (pId) and name (pName) value set to (pValue).
 * @param {DOM node | string ID} pThis
 * @param {String} [pType] default is text input
 * @param {String} [pId]
 * @param {String} [pName]
 * @param {String} [pValue]
 * @return {DOM node}
 */
function $dom_AddInput(pThis,pType,pId,pName,pValue){
    var lThis = $dom_AddTag(false,'INPUT');
    lThis.type = (pType)?pType:'text';
    lThis.id = (pId)?pId:'';
    lThis.name = (pName)?pName:'';
    lThis.value = (pValue)?pValue:'';
    if(pThis){$x(pThis).appendChild(lThis);}
    return lThis;
}

/**
 * Takes a DOM node (p_Node) and makes it a child of DOM node (p_Parent) and then returns the DOM node (pNode).
 * @param {DOM node | string ID} pThis
 * @param {DOM node | string ID} p_Parent
 * @return {DOM node}
 */
function $dom_MakeParent(pThis,p_Parent){
  var l_Node = $x(pThis);
  var l_Parent = $x(p_Parent);
  if(l_Node && l_Parent && l_Node.parentNode != l_Parent){l_Parent.appendChild(l_Node);}
  return l_Node;
}

/** @ignore */
var gCurrentRow = false;

/**
 * Give an table row DOM node (pThis), this function sets the background of all table cells to a color (pColor). A global variable gCurrentRow is set to the current table row (pThis).
 * @function
 * @param {DOM node | String} pThis
 * @param {String} pColor
 * */
function $x_RowHighlight(pThis,pColor){
    var lThis = $x(pThis);
    if(lThis){$x_Style(lThis.getElementsByTagName('TD'),'backgroundColor',pColor);}
    gCurrentRow = lThis;
    return;
}

/**
 * Give an table row DOM node (pThis), this function sets the background of all table cells to NULL.
 * @function
 * @param {DOM node | String} pThis
 * */
function $x_RowHighlightOff(pThis){
    var lThis = $x(pThis);
    if(lThis){$x_Style(lThis.getElementsByTagName('TD'),'backgroundColor','');}
    return;
}


/**
 * Sets the value of a form item (pNd) to uppercase.
 * @function
 * @param {DOM node | String} pNd
 * */
function $v_Upper(pId){
   var obj = $x(pId);
   if(obj){obj.value = obj.value.toUpperCase();}
}

/**
 * Hides child nodes of a DOM node (pThis) where the child node's content matches any instance of (pString). To narrow the child nodes searched by specifying a tag name (pTag) or a class name (pClass). Note that the child node will be set to a block level element when set to visible.
 * @param {DOM node | String} pThis
 * @param {String} pString
 * @param {String} pTags
 * @param {String} pClass
 * */
function $d_Find(pThis,pString,pTags,pClass){
        if(!pTags){pTags = 'DIV';}
        pThis = $x(pThis);
        if(pThis){
            var d=pThis.getElementsByTagName(pTags);
            pThis.style.display="none";
            if(!gRegex){gRegex =new RegExp("test");}
            gRegex.compile(pString,"i");
            for (var i=0,len=d.length; i<len; i++) {
                if (gRegex.test(d[i].innerHTML)) {
                    d[i].style.display="block";
                }
                else{d[i].style.display="none";}
            }
        pThis.style.display="block";
    }
    return;
}


/**
 * Places the user focus on the a form item (pNd). If pNd is not found then this function places focus on the first found user editable field.
 * @function
 * @return {true} if successful
 * */
function $f_First_field(pNd){
    var lThis = $x(pNd);
    try{
        if(lThis){
            if((lThis.type!="hidden")&&(!lThis.disabled)){lThis.focus();}
        }else{}
        return true;
    }catch(e){}
}



/**
 * @ignore
 * */
function html_StringReplace(string,text,by) {
    if(!by){by = '';}
    var strLength = string.length, txtLength = text.length;
    if ((strLength === 0) || (txtLength === 0)) {return string;}
    var i = string.indexOf(text);
    if ((!i) && (text != string.substring(0,txtLength))) {return string;}
    if (i == -1) {return string;}
    var newstr = string.substring(0,i) + by;
    if (i+txtLength < strLength){newstr += html_StringReplace(string.substring(i+txtLength,strLength),text,by);}
    return newstr;
}


/**
 * @ignore
 * */
function getScrollXY() {
  var scrOfX=0,scrOfY=0;
  if(typeof(window.pageYOffset)=='number'){
    //Netscape compliant
    scrOfY = window.pageYOffset;
    scrOfX = window.pageXOffset;
  }else if(document.body&&(document.body.scrollLeft||document.body.scrollTop)){
    //DOM compliant
    scrOfY = document.body.scrollTop;
    scrOfX = document.body.scrollLeft;
  }else if(document.documentElement&&(document.documentElement.scrollLeft||document.documentElement.scrollTop)){
    //IE6 standards compliant mode
    scrOfY = document.documentElement.scrollTop;
    scrOfX = document.documentElement.scrollLeft;
  }
  return [scrOfX,scrOfY];
}


/** @ignore */
function html_GetTarget(e){
    var targ,lEvt;
    if(!e){e = window.event;}
    if(e.target){targ = e.target;}
    else if(e.srcElement){targ = e.srcElement;}
    if(targ.nodeType == 3){targ = targ.parentNode;}// defeat Safari bug
    return targ;
}

/** @ignore */
function findPosX(obj){
   var lEl=$x(obj),leftOff=0,curleft=0;
   if(lEl.x){
     return lEl.x;
   }else if(lEl.offsetParent){
     while(lEl.offsetParent){
       if(lEl.style.left){
          curleft += parseInt(lEl.style.left.substring(0,lEl.style.left.length-2),10);
          return curleft;
       }else{curleft+=lEl.offsetLeft;}
       lEl=lEl.offsetParent;
     }
   }
   return curleft;
}

/**
 * @ignore
 * */
function findPosY(obj){
   var lEl = $x(obj),curtop = 0;
   if (lEl.y){
     return lEl.y;
   } else if (lEl.offsetParent) {
     while (lEl.offsetParent){
       if ( lEl.style.top )  {
          curtop += parseInt(lEl.style.top.substring(0,lEl.style.top.length-2),10);
          return curtop;
       }else {
          curtop += lEl.offsetTop;
       }
       lEl = lEl.offsetParent;
     }
   }
   return curtop;
}

/**
 * @ignore
 * */
function setSelectionRange(input, selectionStart, selectionEnd) {
    var lInputLength;
    if (input.setSelectionRange){
        lInputLength = input.value.length;
        // Check if selection start and end are greater than the entire length of the text.
        // If either are, set them to the text length (fixes issue in webkit based browsers).
        if (selectionStart > lInputLength) {
            selectionStart = lInputLength;
        }
        if (selectionEnd > lInputLength) {
            selectionEnd = lInputLength;
        }
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }else if(input.createTextRange){
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

/**
 * @ignore
 * */
function setCaretToPos(input,pos){
  setSelectionRange(input, pos, pos);
}

/**
 * @ignore
 * */
function html_ReturnToTextSelection(pText,pThis,pNoSpace){
    var cmd = $x(pThis);
    var lSpace = (apex.item(cmd).isEmpty()||!!pNoSpace)?'':' ';
    if (document.selection){//IE support for inserting HTML into textarea
        cmd.focus();
        var sel = document.selection;
        var rng = sel.createRange();
        rng.text = rng.text + lSpace + pText;
    }else{ // Mozilla/Netscape support for selecting textarea
        start = cmd.selectionStart;
        end = cmd.selectionEnd;
        cmd.value = cmd.value.slice(0,start) + lSpace + pText + cmd.value.slice(end,cmd.value.length);
        cmd.focus();
        setCaretToPos (cmd, end +(pText.length + 2));
    }
}

/**
 * @ignore
 * */
function setCaretToEnd(input){setSelectionRange(input, input.value.length, input.value.length);}

/**
 * @ignore
 * */
function setCaretToBegin(input){setSelectionRange(input,0,0);}

/**
 * @ignore
 * */
function selectString (input, string) {
  var match = new RegExp(string, "i").exec(input.value);
  if(match){setSelectionRange(input, match.index, match.index + match[0].length);}
}

/**
 * @ignore
 * */
function ob_PPR_TAB(l_URL){
    // This function is only for use in the SQL Workshop Object Browser!
    top.gLastTab = l_URL;
    var lBody = document.body;
    var http = new htmldb_Get(lBody,null,null,null,null,'f',l_URL.substring(2));
    http.get(null,'<body  style="padding:10px;">','</body>');
}

/**
 * @ignore
 * */
function flowSelectAll(){
 var theList, lListLength,i;
    if (typeof(flowSelectArray)=="undefined"){return true;}
    else{
        for (var a=0,len=flowSelectArray.length;a<len;a++){
            theList = $x(flowSelectArray[a]);
            lListLength = theList.length;
            for (i=0;i<= lListLength-1;i++){theList.options[i].selected = false;}
            for (i=0;i<= lListLength-1;i++){theList.options[i].selected = true;}
        }
    }
 return true;
}

/**
 * @ignore
 * */
var htmldb_ch=false;

/**
 * @ignore
 * */
function htmldb_item_change(e){htmldb_ch=true;}

/**
 * @ignore
 * */
function htmldb_doUpdate(r){
    if(htmldb_ch){lc_SetChange();apex.submit(r);}
    else{apex.submit(r);}
    return;
}

/**
 * @ignore
 * */
function htmldb_goSubmit(r){
    if(htmldb_ch){
        if (!htmldb_ch_message || htmldb_ch_message === null){htmldb_ch_message='Are you sure you want to leave this page without saving? /n Please use translatable string.';}
        if (window.confirm(htmldb_ch_message)){apex.submit(r);}
    }else{
        apex.submit(r);
    }
    return;
}


/**
 *@function
 */
function $p_DatePicker(p_element_index,p_form_index,p_date_format,p_bgcolor,p_dd,p_hh,p_mi,p_pm,p_yyyy,p_lang,p_application_format,p_application_id,p_security_group_id,p_mm,p_height){
    var w = open("wwv_flow_utilities.show_as_popup_calendar" +
            "?p_element_index=" + escape(p_element_index) +
            "&p_form_index=" + escape(p_form_index) +
            "&p_date_format=" + escape(p_date_format) +
            "&p_bgcolor=" + escape(p_bgcolor) +
            "&p_dd=" + escape(p_dd) +
            "&p_hh=" + escape(p_hh) +
            "&p_mi=" + escape(p_mi) +
            "&p_pm=" + escape(p_pm) +
            "&p_yyyy=" + escape(p_yyyy) +
            "&p_lang=" + escape(p_lang) +
            "&p_application_format=" + escape(p_application_format) +
            "&p_application_id=" + escape(p_application_id) +
            "&p_security_group_id=" + escape(p_security_group_id) +
            "&p_mm=" + escape(p_mm),
            "winLov","Scrollbars=no,resizable=yes,width=258,height="+p_height);
    if (w.opener == null){w.opener = self;}
    w.focus();
    return w
}

/**
Shows confrm box with message provided in p_Msg if confirm is true then submits the page with request value set to p_Req and then closes the window., mainly used in popup windows.
@function
@param  {String} p_Msg
@param  {String} p_Req
 * */
function confirmDelete2(p_Msg,p_Req){
    var l_req = (p_Req)?p_Req:'DELETE';
    var l_msg = (p_Msg)?p_Msg:'Would you like to perform this delete action?';
    if (confirm(l_msg)){
        apex.submit(l_req);
        window.close();
     }
}



/**
 * @ignore
 * */
var gChangeCheck = false;
/**
 * @ignore
 * */
function lc_SetChange(){
    if (!!gChangeCheck){
        gChangeCheck.value = 1;
        gChangeCheck.type = 'text';
    }
}

/**
 * @ignore
 * */
function setValue2(id,val,errorMsg){
    var obj = $x(id);
    if(obj){
        $x_Value(obj,val);
        if ($v(obj) != val){alert(errorMsg);}
    }
}

/*Begin DHTML Menus*/

/**
 * @ignore
 * */
var gCurrentAppMenu = false;

/** @ignore */
var gCurrentAppMenuImage = false;

/** @ignore */
var $gCurrentAnchorList = false;

/** @ignore */
var gSubMenuArray = [];

/** @ignore */
var g_Single_Menu = false;

/** @ignore */
var g_Single_Menu_Count = 0;



/** @ignore */
function dhtml_CloseAllSubMenus(pStart){
  var l_Start = null;
  if(!pStart){l_Start = 0;}
  else{l_Start = pStart;}

  for (var i=l_Start;i<=gSubMenuArray.length;i++){
    if(gSubMenuArray[i]){
      var l_Sm = $x_Hide(gSubMenuArray[i]);
      if(l_Sm){$x_Hide(l_Sm);}
    }
  }
  /*if you deleted starting from level do not null out array*/
  if(!pStart){gSubMenuArray.length = 0;}
  htmldb_IE_Select_Item_Fix(false);

  // reset global anchor list to main app menu
  $gCurrentAnchorList = apex.jQuery('#' + gCurrentAppMenu).children().children().filter('a[class!=eLink]');

  return;
}

/** @ignore */
function dhtml_CloseAllSubMenusL(pThis){
  var l_Start = parseInt($x_UpTill(pThis,'UL').getAttribute("htmldb:listlevel"),10)+1;
  dhtml_CloseAllSubMenus(l_Start);
  return;
}

/** @ignore */
var g_dhtmlMenu = "dhtmlMenu";

/** @ignore */
function app_AppMenuMultiClose(){
  if(gCurrentAppMenu){
    var lMenu = $x(gCurrentAppMenu);
    gCurrentAppMenuImage.className = g_dhtmlMenu;
    $x_Hide(lMenu);
    gCurrentAppMenu = false;
    gCurrentAppMenuImage = false;
    $gCurrentAnchorList = false;
  }
  return;
}

/** @ignore */
function dhtml_DocMenuCheck(e){
    var tPar = html_GetTarget(e);
    var l_Test = true;
    while(tPar.nodeName != 'BODY'){
        tPar = tPar.parentNode;
        if ($u_SubString(tPar.className,'dhtmlMenuLG')) { l_Test = !l_Test;}
    }
    if (l_Test) {
        app_AppMenuMultiClose();
        dhtml_CloseAllSubMenus();
        document.onclick = null;
    }
    else {
    }
    return;
}

/** @ignore */
function dhtml_ButtonDropDown(pThis,pThat,pDir,pX,pY){dhtml_SingeMenuOpen(pThis,pThat,'Bottom',pX,pY);return;}


function dhtml_KeyAction(pEvent, pEventNamespace) {
    var $lCurrentAnchor, lIndex;
    // set event target as the current anchor, could also be root
    $lCurrentAnchor = apex.jQuery(pEvent.target);
    // get the index of the current anchor, could be -1 if event target was not in the anchor list (like if
    // it was the root menu element (action button for actions menu in irr for example).
    lIndex = $gCurrentAnchorList.index($lCurrentAnchor);

    // switch on the key code
    switch (pEvent.which) {
        case 40:    // DOWN
            // set focus to next anchor in list
            $gCurrentAnchorList.eq(lIndex + 1).focus();
            break;
        case 38:    // UP
            // set focus to next anchor in list
            $gCurrentAnchorList.eq(lIndex - 1).focus();
            break;
        case 37:    // LEFT
            // get the parent menu item, only currently support 1 level of sub-menus
            var $lParent = apex.jQuery('#' + gCurrentAppMenu + ' a').filter( function() {return apex.jQuery(this).data('setParent') == true;});
            // only proceed if there is a parent
            if ($lParent.length > 0) {
                // close sub menu
                dhtml_CloseAllSubMenusL($lParent[0]);
                // set focus to parent and reset 'setParent' data value
                $lParent
                    .focus()
                    .data('setParent', false);
            }
            break;
        case 39:    // RIGHT
            // only proceed if the current anchor is the parent of a sub-menu, denoted by the presence of
            // the class 'dhtmlSubMenuN' or 'dhtmlSubMenuS'
            if ($lCurrentAnchor.parent().hasClass('dhtmlSubMenuN') || $lCurrentAnchor.parent().hasClass('dhtmlSubMenuS')) {
                // trigger mouseover event on anchor, contains call to dhtml_MenuOpen for relevant sub menu
                $lCurrentAnchor.trigger('mouseover');
                // set focus to first element in new anchor list
                $gCurrentAnchorList[0].focus();
                // set setParent flag so focus can be set back if the user clicks left from sub-menu
                $lCurrentAnchor.data('setParent', true);
            }
            break;
        case 13:    // ENTER
            // just return out of function, to avoid default prevention
            return;
            break;
        default:
            null;
    }
    // prevent default browser key handling for all, except when ENTER pressed, this returns early
    pEvent.preventDefault();
}

/** @ignore */
function dhtml_MenuOpen(pThis,pThat,pSub,pDir,pRoot){
    var lNamespace;
    if($x(pThat)) {
        // set event namespace name on 'menu_keys_' + [ID of the current menu]
        lNamespace = 'menu_keys_' + pThat;
        document.onclick = dhtml_DocMenuCheck;
        apex.jQuery(document).unbind('keydown.' + lNamespace + '_esc').bind('keydown.' + lNamespace + '_esc', function(event) {
            if (event.which === 27) {
                app_AppMenuMultiClose();
                dhtml_CloseAllSubMenus();
                document.onclick = null;
                if(pRoot){
                    apex.jQuery(pRoot).focus();
                }
            }
        });

        // if we're not opening a sub-menu, close all sub menus and set global for current menu to pThat (just an id)
        if(!pSub) {
            dhtml_CloseAllSubMenus();
            gCurrentAppMenu = pThat;
        }else{
            // get the level of the sub-menu to open
            var l_Level = parseInt($x(pThat).getAttribute("htmldb:listlevel"),10);
            // in case a sub-menu is already displayed, hide it
            var l_Temp = gSubMenuArray[l_Level];
            if(l_Temp) {
                $x_Hide(l_Temp);
            }
            // set global for sub menu to the sub-menu to open
            gSubMenuArray[l_Level] = $x(pThat);
        }
        $gCurrentAnchorList = apex.jQuery('#' + pThat).children().children().filter('a[class!=eLink]');

        // add event handlers for keystrokes
        apex.jQuery(document).unbind('keydown.' + lNamespace).bind('keydown.' + lNamespace, function(event){
            // setup key codes for specific keys supported (down, up, left, right, return)
            var lKeyCodes = [40,38,37,39,13];
            // check if the menu is visible and that the key pressed is one of the supported keys
            if (apex.jQuery('#' + pThat + ':visible').filter('ul')[0] && apex.jQuery.inArray(event.which, lKeyCodes) !== -1 ) {
                dhtml_KeyAction(event, lNamespace);
            }
        });

        // pThat stores ID of menu to open, store the DOM element of the main menu in local variable
        var lMenu = $x(pThat);
        // add the menu to the DOM
        document.body.appendChild(lMenu);
        if(!pDir || pDir == 'Right') {
            lMenu.style.position = "absolute";
            lMenu.style.top = (parseInt(findPosY(pThis),10)+"px");
            lMenu.style.left = (parseInt(findPosX(pThis),10)+"px");
        }else if(pDir == 'Bottom') {
          lMenu.style.position = "absolute";
          lMenu.style.top = (parseInt(findPosY(pThis),10) + parseInt(pThis.offsetHeight,10)+"px");
          lMenu.style.left = (parseInt(findPosX(pThis),10)+"px");
        }else if(pDir == 'BottomRight') {
          lMenu.style.position = "absolute";
          lMenu.style.top = (parseInt(findPosY(pThis),10) + parseInt(pThis.offsetHeight,10)+"px");
          lMenu.style.left = (parseInt(findPosX(pThis),10) - parseInt(pThis.offsetWidth,10)+"px");
        }else{
          lMenu.style.position = "absolute";
          lMenu.style.top = (parseInt(findPosY(pThis),10)+"px");
          lMenu.style.left = (parseInt(findPosX(pThis),10) + parseInt(pThis.offsetWidth,10)+"px");
        }
        // show the menu
        $x_Show(lMenu);
        dhtml_FixLeft(pThis, lMenu, pDir);
        htmldb_IE_Select_Item_Fix(lMenu);
    }
    return;
}

/** @ignore */
function dhtml_DocMenuSingleCheck(e,force){
    if(g_Single_Menu_Count > 0){
        var l_Test = true;
        if(e){
            var tPar = html_GetTarget(e);
            while(tPar.nodeName != 'BODY' && !force){
                tPar = tPar.parentNode;
                if(tPar == g_Single_Menu){l_Test = !l_Test;}
            }
        }
        if(l_Test || force){
            $x_Hide(g_Single_Menu);
            document.onclick = null;
        }else{}
    }else{
        g_Single_Menu_Count = 1;
    }
    return;
}

/** @ignore */
function dhtml_SingeMenuOpen(pThis,pThat,pDir,pX,pY){
        var lMenu = $x(pThat);
        var lThis = $x(pThis);
        lMenu.style.zIndex = 2001;
        document.body.appendChild(lMenu);
        if(!pDir || pDir == 'Right'){
          lMenu.style.position = "absolute";
          lMenu.style.top = (parseInt(findPosY(lThis),10)+"px");
          lMenu.style.left = (parseInt(findPosX(lThis),10)+"px");
        }else if(pDir == 'Bottom'){
          lMenu.style.position = "absolute";
          lMenu.style.top = (parseInt(findPosY(lThis),10) + parseInt(lThis.offsetHeight,10)+"px");
          lMenu.style.left = (parseInt(findPosX(lThis),10)+"px");
        }else if(pDir == 'BottomRight'){
          lMenu.style.position = "absolute";
          lMenu.style.top = (parseInt(findPosY(lThis),10) + parseInt(lThis.offsetHeight,10)+"px");
          lMenu.style.left = (parseInt(findPosX(lThis),10) - parseInt(lThis.offsetWidth,10)+"px");
        }else if(pDir == 'Set'){
          lMenu.style.position = "absolute";
          lMenu.style.top = (parseInt(pY,10)+"px");
          lMenu.style.left = (parseInt(pX,10)+"px");
        }else {
          lMenu.style.position = "absolute";
          lMenu.style.top = (parseInt(findPosY(lThis),10)+"px");
          lMenu.style.left = (parseInt(findPosX(lThis),10) + parseInt(lThis.offsetWidth,10)+"px");
        }

      $x_Show(lMenu);
      dhtml_FixLeft(lThis,lMenu,pDir);
      htmldb_IE_Select_Item_Fix(true);
      g_Single_Menu_Count = 0;
      g_Single_Menu = lMenu;
      document.onclick = dhtml_DocMenuSingleCheck;
      return;
}

/** @ignore */
function dhtml_FixLeft(pThis,pMenu,pDir){
     var l_Width;
     if (document.all) {
        l_Width = document.body.clientWidth;
     } else {
        l_Width = window.innerWidth;
     }
     if (pDir=='Bottom') {
       if(parseInt(l_Width,10) < parseInt(findPosX(pThis),10) + parseInt(pThis.offsetWidth,10) + parseInt(pMenu.offsetWidth,10)){
         pMenu.style.position = "absolute";
         pMenu.style.left = ((parseInt(findPosX(pThis),10) - parseInt(pMenu.offsetWidth,10))+parseInt(pThis.offsetWidth,10))+"px";
       }
     } else {
       if(parseInt(l_Width,10) < parseInt(findPosX(pThis),10) + parseInt(pMenu.offsetWidth,10)){
         pMenu.style.position = "absolute";
         pMenu.style.left = (parseInt(findPosX(pThis),10) - parseInt(pMenu.offsetWidth,10))+"px";
       }
     }
     return;
}

/** @ignore */
function htmldb_IE_Select_Item_Fix(pTest){
  /* only run in IE and only if there is a select in the page*/
  var lSel = document.getElementsByTagName('SELECT').length >= 1;
  if(document.all && pTest && lSel){
        if(pTest.firstChild && pTest.firstChild.nodeName != 'IFRAME'){
          pTest.innerHTML = '<iframe  src="'+htmldb_Img_Dir+'blank.html" width="'+pTest.offsetWidth+'" height="'+pTest.offsetHeight+'" style="z-index:-10;position: absolute;left: 0;top: 0;filter: progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0);" scrolling="no" frameborder="0"></iframe>' + pTest.innerHTML;
        }
  }
  return;
}

/** @ignore */
var g_dhtmlMenuOn = "dhtmlMenuOn";

/** @ignore */
function app_AppMenuMultiOpenBottom(pThis,pThat,pSub){
      var lMenu = $x(pThat);
      if(pThis != gCurrentAppMenuImage){
        app_AppMenuMultiClose();
        var l_That = pThis.previousSibling.firstChild ;
        pThis.className = g_dhtmlMenuOn;
        dhtml_MenuOpen(l_That,pThat,false,'Bottom',pThis);
        gCurrentAppMenuImage = pThis;
      }else{
        dhtml_CloseAllSubMenus();
        app_AppMenuMultiClose();
      }
  return;
}

/** @ignore */
function app_AppMenuMultiOpenBottom2(pThis,pThat,pSub){
      var lMenu = $x(pThat);
      if(pThis != gCurrentAppMenuImage){
        app_AppMenuMultiClose();
        var l_That = pThis.parentNode;
        pThis.className = g_dhtmlMenuOn;
        dhtml_MenuOpen(l_That,pThat,false,'Bottom',pThis);
        gCurrentAppMenuImage = pThis;
      }else{
        dhtml_CloseAllSubMenus();
        app_AppMenuMultiClose();
      }
  return;
}

/** @ignore */
function app_AppMenuMultiOpenBottom3(pThis,pThat,pMenu,pSub){
      var lMenu = $x(pThat);
      if(pThis != gCurrentAppMenuImage){
        app_AppMenuMultiClose();
        var l_That = $x(pMenu);
        pThis.className = g_dhtmlMenuOn;
        dhtml_MenuOpen(l_That,pThat,false,'Bottom',pThis);
        gCurrentAppMenuImage = pThis;
      }else{
        dhtml_CloseAllSubMenus();
        app_AppMenuMultiClose();
      }
  return;
}



/**
 * puts an invisible and temporary div in the page to capture html coming in from an ajax call
 * @function
 */

function $u_js_temp_drop(){
    var lTemp = apex.jQuery('#apex_js_temp_drop');
    if (lTemp.length > 0) {
        lTemp.empty();
    } else {
        lTemp = apex.jQuery('<div id="apex_js_temp_drop"></div>').prependTo(document.body).hide();
    }
    return lTemp[0]; // return DOM object
/*
    var lThis = $x('apex_js_temp_drop');
    if(!lThis){
        lThis = $dom_AddTag(document.body,'DIV');
        lThis.id = 'apex_js_temp_drop';
        $x_Hide(lThis);
    }
    lThis.innerHTML = '';
    return lThis;
*/
}

function $u_js_temp_clear(){
    var lThis = $x('apex_js_temp_drop');
    if(lThis){lThis.innerHTML = '';}
    return lThis;
}

/* Begin Smart Table Code */


/* inits the Add Row Table */

/** @ignore */
var g_CheckedArray_IE;

/** @ignore */
function ie_RowFixStart(pThis){
  if(document.all){
        var l_Items = $x_FormItems(pThis,'checkbox');
        g_CheckedArray_IE = [];
        for (var i=0,len=l_Items.length;i<len;i++){if(l_Items[i].type == 'checkbox'){g_CheckedArray_IE[i] = l_Items[i].checked;}}
    }
}

/** @ignore */
function ie_RowFixFinish(pThis){
  if(document.all){
        var l_Items = $x_FormItems(pThis,'checkbox');
        for (var i=0,len=l_Items.length;i<len;i++){if(l_Items[i].type == 'checkbox'){l_Items[i].checked = g_CheckedArray_IE[i];}}
 }
}

var gLastRowMoved = null;

/** @ignore */
var gLastRowMovedColor = '#CCCCCC';

/** @ignore */
var gLastRowHighlight = true;

/** @ignore */
function $tr_RowMoveFollow(pThis,pColorLastRow){
    if(gLastRowHighlight){
      if(pColorLastRow && gLastRowMoved){$x_RowHighlightOff(gLastRowMoved);}
        $x_RowHighlight(pThis,gLastRowMovedColor);
    }
    gLastRowMoved = pThis;
}

/** @ignore */
function html_RowUp(pThis,pColorLastRow){
    var l_Row = $x_UpTill(pThis,'TR');
    ie_RowFixStart(l_Row);
    $tr_RowMoveFollow(l_Row,pColorLastRow);
    var l_Table = l_Row.parentNode;
    var l_RowPrev = l_Row.previousSibling;
    while(!!l_RowPrev){
        if(l_RowPrev.nodeType == 1){break;}
        l_RowPrev = l_RowPrev.previousSibling;
    }
    if(!!l_RowPrev && !!l_RowPrev.firstChild && l_RowPrev.firstChild.nodeName != 'TH' && l_RowPrev.nodeName == 'TR'){
        oElement = l_Table.insertBefore(l_Row ,l_RowPrev);
    }else{
        oElement = l_Table.appendChild(l_Row);
    }
    ie_RowFixFinish(oElement);
    return oElement;
 }

/** @ignore */
function html_RowDown(pThis,pColorLastRow){
  var l_Row = $x_UpTill(pThis,'TR');
    ie_RowFixStart(l_Row);
  $tr_RowMoveFollow(l_Row,pColorLastRow);
  var l_Table = l_Row.parentNode;
  var l_RowNext = l_Row.nextSibling;
  while(!!l_RowNext){
     if(l_RowNext.nodeType == 1){break;}
     l_RowNext = l_RowNext.nextSibling;
  }
    if(!!l_RowNext && l_RowNext.nodeName == 'TR'){
    oElement = l_Table.insertBefore(l_Row ,l_RowNext.nextSibling);
  }else{
    oElement = l_Table.insertBefore(l_Row ,l_Table.getElementsByTagName('TR')[1]);
  }
    ie_RowFixFinish(oElement);
  return oElement;
}

/* tool tip section */

/** @ignore */
var tt_target;

/** @ignore */
var gToolTipGraphic = "arrow2.gif";

/** @ignore */
var gToolTip = false;

/** @ignore */
var gToopTipPointer = false;

/** @ignore */
var gToolTipContent = false;

/** @ignore */
function toolTip_init(){
  if (document && document.body) {
        gToolTipContent = $x('gToolTipContent');
        gToolTip = $x("dhtmltooltip");
        if (!gToolTip){
            gToolTip = $dom_AddTag(document.body,'DIV');
            gToolTip.id="dhtmltooltip";
            gToolTip.className="htmldbToolTip";
            gToolTip.style.position = "absolute";
            gToolTip.style.border="1px solid black";
            gToolTip.style.padding="2px";
            gToolTip.style.backgroundColor="";
            gToolTip.style.visibility="hidden";
            gToolTip.style.zIndex=10000;
        }
        gToopTipPointer=$x("dhtmlpointer");
        if (!gToopTipPointer) {
            gToopTipPointer = $dom_AddTag(document.body,'IMG');
            gToopTipPointer.id="dhtmlpointer";
            gToopTipPointer.src= htmldb_Img_Dir + gToolTipGraphic;
            gToopTipPointer.style.position = "absolute";
            gToopTipPointer.style.zIndex=10001;
        }
     return true;
    } else {
     return false;
    }
}

/** @ignore */
function toolTip_disable(){
    if(toolTip_init()){
        tt_target = null;
        gToolTip.style.visibility="hidden";
        gToolTip.style.backgroundColor='';
        gToolTip.style.width='';
        gToopTipPointer.style.visibility="hidden";
        if(gToolTipContent){gToolTipContent.innerHTML='';}
        else{gToolTip.innerHTML='';}
    }
}

/** @ignore */
function toolTip_enable(evt,obj,tip, width, color){
    evt=(evt)?evt:((window.event)?event:null);
    var target_x=evt.pageX?evt.pageX:evt.clientX+getScrollXY()[0];
    var target_y=evt.pageY?evt.pageY:evt.clientY+getScrollXY()[1];
    if(toolTip_init()){
    tt_target = obj;
    if(!tip){tip = obj.getAttribute("htmldb:tip");}
    if(gToolTipContent){gToolTipContent.innerHTML=tip;}else{gToolTip.innerHTML=tip;}
    if(!!width){gToolTip.style.width=width+"px";}
    if(!!color){gToolTip.style.backgroundColor=color;}else{gToolTip.style.backgroundColor="lightyellow";}
    gToopTipPointer.style.left = ( 10 + target_x ) +"px";
    gToopTipPointer.style.top  = (15 + target_y ) +"px";
    gToolTip.style.left = ( 7 + target_x ) +"px";
    gToolTip.style.top  = ( 28 + target_y ) +"px";
    gToolTip.style.visibility="visible";
    gToolTip.style.zIndex=10000;
    gToopTipPointer.style.zIndex=10001;
    gToopTipPointer.style.visibility="visible";
    try {obj.addEventListener("mouseout",toolTip_disable, false);}
    catch(e){obj.attachEvent('onmouseout',toolTip_disable);}
   }
    return false;
}

/** @ignore */
function toolTip_follow(evt,obj){
    evt=(evt)?evt:((window.event)?event:null);
    var target_x=evt.pageX?evt.pageX:evt.clientX+getScrollXY()[0];
    var target_y=evt.pageY?evt.pageY:evt.clientY+getScrollXY()[1];
    if (gToolTip) {
        gToolTip.style.left = ( 7 + target_x ) +"px";
        gToolTip.style.top  = ( 28 + target_y ) +"px";
        gToolTip.style.visibility="visible";
        gToolTip.style.zIndex=10000;
        gToopTipPointer.style.left = ( 10 + target_x ) +"px";
        gToopTipPointer.style.top  = (15 + target_y ) +"px";
        gToopTipPointer.style.zIndex=10001;
        gToopTipPointer.style.visibility="visible";
    }
    return false;
}

/**
 * create javascript object to run shuttle item
 * @constructor
 * @param {DOM node | String} pThis
 * @param {DOM node | String} pThat
 * */
function dhtml_ShuttleObject(pThis,pThat){
 this.Select1 = $x(pThis);
 this.Select2 = $x(pThat);
 this.Select1ArrayInit = this.Select1.cloneNode(true);
 this.Select2ArrayInit = this.Select2.cloneNode(true);
 this.Op1Init = [];
 this.Op2Init = [];
 this.Op1Init = this.Select1ArrayInit.options;
 this.Op2Init = this.Select2ArrayInit.options;
    /**
     * @extends dhtml_ShuttleObject
     */
    this.move = function (){
        var l_A = $f_SelectedOptions(this.Select1);
        if($x(l_A)){l_A = [l_A];}
        var l_AL = l_A.length;
        for (var i=0;i<l_AL;i++){this.Select2.appendChild(l_A[i]);}
    };
    /**
     * @extends dhtml_ShuttleObject
     */
    this.remove = function (){
        var l_A = $f_SelectedOptions(this.Select2);
        if($x(l_A)){l_A = [l_A];}
        var l_AL = l_A.length;
        for (var i=0;i<l_AL;i++){this.Select1.appendChild(l_A[i]);}
    };
    /**
     * @extends dhtml_ShuttleObject
     */

    this.reset =  function (){
        this.Select1.options.length = 0;
        this.Select2.options.length = 0;
        var L_Count1 = this.Op1Init.length;
        for(var i=0;i<L_Count1;i++){this.Select1.options[i]= new Option(this.Op1Init[i].text,this.Op1Init[i].value);}
        var L_Count2 = this.Op2Init.length;
        for(var i2=0;i2<L_Count2;i2++){this.Select2.options[i2]= new Option(this.Op2Init[i2].text,this.Op2Init[i2].value);}
    };
    /**
     * @extends dhtml_ShuttleObject
     */

    this.move_all = function (){
        for (var i=0,len=this.Select1.options.length;i<len;i++){this.Select1.options[i].selected=true;}
        this.move();
    };
    /**
     * @extends dhtml_ShuttleObject
     */

    this.remove_all =  function (){
        for (var i=0,len=this.Select2.options.length;i<len;i++){this.Select2.options[i].selected=true;}
        this.remove();
    };
    /**
     * @extends dhtml_ShuttleObject
     */

    this.sort = function (pShuttle,pDir){
        var nextOption,i;
        var lLength = pShuttle.options.length;
        if(pDir == 'U'){
            for (i=0;i<lLength;i++){
                if(!!pShuttle.options[i].selected){if(pDir == 'U'){if(!!i){pShuttle.insertBefore(pShuttle.options[i], pShuttle.options[i-1]);}}}
            }
        }else if(pDir == 'D'){
            for (i=lLength-1;i>=0;i--){
                if(!!pShuttle.options[i].selected){if(pDir == 'D'){if(i!=lLength-1){pShuttle.insertBefore(pShuttle.options[i], pShuttle.options[i+2]);}}}
            }
        }else{
            var l_Opt = [];
            for (i=0;i<lLength;i++){if(!!pShuttle.options[i].selected){l_Opt[l_Opt.length] = pShuttle.options[i];}}
            if(pDir == 'B'){
                for (i=0;i<l_Opt.length;i++){pShuttle.appendChild(l_Opt[i]);}
            }else if(pDir == 'T'){
                for (i=l_Opt.length-1;i>=0;i--){pShuttle.insertBefore(l_Opt[i],pShuttle.firstChild);}
            }
        }
    };
    /**
     * @extends dhtml_ShuttleObject
     */
    this.sort1 = function (pDir){this.sort(this.Select1,pDir);};
    /**
     * @extends dhtml_ShuttleObject
     */
    this.sort2 = function (pDir){this.sort(this.Select2,pDir);};
 return;
}

function hideShow(objectID,imgID,showImg,hideImg){
    var theImg = $x(imgID);
    var theDiv = $x(objectID);
    if(theDiv.style.display == 'none' || theDiv.style.display == '' || theDiv.style == null){
        theImg.src = hideImg;
        $x(objectID).style.display = 'block';}
    else{
        theImg.src = showImg;
        $x(objectID).style.display = 'none';}
    return;
}
















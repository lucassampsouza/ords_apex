/*jslint nomen: false, evil: false, browser: true, eqeqeq: false, white: false, undef: false */
/*
Oracle Database Application Express, Release 3.1

B32468-02

Copyright © 2003, 2008, Oracle. All rights reserved.

Primary Author:  Carl Backstrom

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
 * This file holds all non namespaced functions and objects for Oracle Application Express
 *
 **/
/*
  str should be in the form of a valid f?p= syntax
*/
var gCurrentObjectList=false;

function ObjectList(pType,pFilter,pHolder,pSchema,pTitle){
  if (gCurrentObjectList)
    return  gCurrentObjectList;
  else
    gCurrentObjectList = this;


  /*
   * expose functions
   */
  this.setCurrent  = setCurrent;
  this.highlight   = Highlight;
  this.unhighlight = unHighlight;
  this.navigate    = Navigate;
  this.setHeader   = setHeader;
  this.reload      = reload;
  this.xmlReload      = xmlReload;
  this.blank       = blank;
  this.onchange    = onChange;
  this.filter      = Filter;
  this.filterKeyPress = filterKeyPress;
  this.delayedFilter    = delayedFilter;
  this.getElementOrText = getElementOrText;
  this.setType = setType;
  this.setOwner    = setOwner;
  /*
   * set up the local vars.
   */
  this.lType    = this.getElementOrText(pType);
  this.lFilter  = this.getElementOrText(pFilter);
  this.lHolder  = this.getElementOrText(pHolder);
  this.lTitle   = this.getElementOrText(pTitle);
  this.lSchema  = this.getElementOrText(pSchema);
  this.lCurrent = null
  this.gLastFilteredKey=false;
  this.timer    = 0;
  return;

	function setOwner(s){
		if (typeof(this.lSchema) == 'object'){
			this.lSchema.value = s;
		}else{
			this.lSchema= s;
		}
	}

  function setType(s){
    if (typeof(this.lType) == 'object'){this.lType.value = s;}
	else{this.lType= s;}
  }

  function getElementOrText(id){
     var t = $x(id);
     return (t)?t:id;
  }

  function onChange(blank){
    //if (blank){
	  this.blank();
	  this.lCurrent=null;
	  this.setHeader(" ");
    //}
    this.reload();
    this.filter();
  }

  function blank(){
     this.unhighlight();
     vFrame.src = "about:blank";
  }

  function reload(pType,pId,pRefresh,pNavigate){
	this.xmlReload(pType,pId,pRefresh,pNavigate);
	return;
  }

  function xmlReload(pType,pId,pRefresh,pNavigate){
    if (pRefresh || pType != this.lType.value) {
		if (pType != this.lType.value ){
			gLastTab = false;
		}
		if (pType){
			this.setType(pType);
		}

		 htmldb_getObjectListXML(this.lHolder,
			typeof(this.lType) == 'object'   ? this.lType.value   : this.lType,
			typeof(this.lSchema) == 'object' ? this.lSchema.value : this.lSchema,
			'1',
			'10000',
			'DIVASXML',
			null,
			'o(this.id)','o');
   }

    if(pId){
		this.setCurrent(pId,pNavigate);
	}

    if (this.lCurrent) {
      this.lCurrent = $x(this.lCurrent.id);
      this.highlight(pNavigate);
    }
    top.$x_Show('obLeftColumn');
    top.$x('OB_FIND').value='';  }

  function Filter(){
    html_Find(this.lHolder,this.lFilter.value);
  }

	function setCurrent(pId,pNavigate){
		this.unhighlight();
		this.lCurrent = $x(pId);
		var x = new htmldb_Get(null,4500,'APPLICATION_PROCESS=171513520394208759',0);
		x.add('OB_OBJECT_ID',this.lCurrent.id);
		var resp = x.get();
		x=null;
		if (resp && resp.indexOf("ERROR:") > 0 ) {
			alert(resp.substr(6));
		}else{
			if (resp){this.setOwner(resp)};
		}

		if (pNavigate != false){
			this.highlight();
		}
		this.setHeader();
	}

  function unHighlight(){
    this.setHeader(" ");
    if(this.lCurrent){
      if(this.lCurrent.className.indexOf('_V')>0){this.lCurrent.className = 'o_V'}
      else{this.lCurrent.className = 'o_I'}
    }
  }

  function Highlight(pNavigate){
      if(this.lCurrent ) {
         if ( this.lCurrent.className.indexOf('_V')>0){
             this.lCurrent.className = 'o_C_V'
		 }else{
             this.lCurrent.className = 'o_C_I'
		 }
      }
      if (pNavigate != false){
		  this.navigate();
	  }
  }

  /*
   * needs full change header code here
   * */
  function setHeader(title){
	title = (title)?title:this.lCurrent.innerHTML;
    $s(this.lTitle,title);
  }

  function Navigate() {
    var page=null;
    if (!gLastTab){
       page = this.lType.value+'_DETAIL';
    } else {
      page = gLastTab.split(":")[1];
    }
     var url='f?p=4500:'+page+':'+$x('pInstance').value;
     var lBody = window.frames.dbaseContent.document.getElementById('htmldbPage');
      if (lBody && ( this.lType.value != 'PROCEDURE' &&
                     this.lType.value != 'FUNCTION' &&
                     this.lType.value != 'PACKAGE' &&
		     this.lType.value != 'TRIGGER') )  {
        var http = new htmldb_Get(null,null,null,null,null,'f',url.substring(2));
        var test = http.get(null,'<div id="htmldbPage">','<a name="END"></a>');
        get = null;
        lBody.innerHTML = test;
      } else {
       vFrame.src = url;
      }
    gLastTab=url;
}

  /**
   *fires on every key press on find field
   */
  function filterKeyPress(e){
    this.gLastFilteredKey=new Date();
    setTimeout(gCurrentObjectList.delayedFilter,1000);
  }

  function delayedFilter(){
    gCurrentObjectList.timer=0;
    if (((new Date() - gCurrentObjectList.gLastFilteredKey)) > 1000){
      gCurrentObjectList.filter();
    } else if (gCurrentObjectList.timer==0) {
      gCurrentObjectList.timer=1;
      setTimeout( gCurrentObjectList.delayedFilter,250);
    }
  }
}

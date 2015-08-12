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
function htmldb_getObjectList(obj,typ,owner,begin,end,display,include,onclick,clss){
	try{
		nw = new Date(); //Now !;
		var get = new htmldb_Get(obj,4500,'APPLICATION_PROCESS=11551302098165190',0);
		get.add('P2001_FEED_TYPE',typ);
		get.add('P2001_FEED_OWNER', owner);
		get.add('P2001_FEED_START', begin);
		get.add('P2001_FEED_STOP', end);
		get.add('P2001_FEED_DISPLAY',display );
		get.add('P2001_FEED_INCLUDE', include);
		get.add('P2001_FEED_ONCLICK', onclick);
		get.add('P2001_FEED_CLASS', clss);
		get.add('P0_PPRTIMESTAMP',nw.getTime());
		get.add('OB_SCHEMA',owner);
		get.add('OB_CURRENT_TYPE',typ);
		var ret = get.get();
		get = null;
	return ret;
	}catch(err){}
}
function htmldb_getObjectListXML(obj,typ,owner,begin,end,display,include,onclick,clss){
  try{
  nw = new Date(); //Now !;
  var get = new htmldb_Get(obj,4500,'APPLICATION_PROCESS=11551302098165190',0);
      get.add('P2001_FEED_TYPE',typ);
      get.add('P2001_FEED_OWNER', owner);
      get.add('P2001_FEED_START', begin);
      get.add('P2001_FEED_STOP', end);
      get.add('P2001_FEED_DISPLAY',display );
      get.add('P2001_FEED_INCLUDE', include);
      get.add('P2001_FEED_ONCLICK', onclick);
      get.add('P2001_FEED_CLASS', clss);
      get.add('P0_PPRTIMESTAMP',nw.getTime());
         get.add('OB_SCHEMA',owner);
         get.add('OB_CURRENT_TYPE',typ);
      var ret = get.get("XML");
      var i=0;
      var ii;
      for(i=obj.childNodes.length-1;i>=0;i--){
        obj.removeChild(obj.childNodes[i]);
      }
      var base = ret.childNodes[0];
      var newBase = document.createElement("DIV");
        for(ii=0;ii<base.attributes.length;ii++){
          newBase.setAttribute(base.attributes[ii].name,
                     base.getAttribute(base.attributes[ii].name));
        }
      obj.appendChild(newBase);
      var temp;
      var el;
      for(i=0;i<base.childNodes.length;i++){
        el = base.childNodes[i];
        temp = document.createElement(el.nodeName);
        // IE and Moz access text different
        if ( el.textContent ) {
          temp.innerHTML = el.textContent;
        } else {
          temp.innerHTML = el.text;
          temp.className = el.getAttribute("class");
          temp.attachEvent("onclick",ob_route);
        }

        for(ii=0;ii<el.attributes.length;ii++){
          temp.setAttribute(el.attributes[ii].name,
                     el.getAttribute(el.attributes[ii].name));
        }
        newBase.appendChild(temp);
      }
      get = null;
  return ret;
  }catch(err){}
}

function ob_route(evt) {
   evt = (evt) ? evt : ((window.event) ? event : null);
   var target = evt.target ? evt.target : evt.srcElement;
   o(target.id);
}

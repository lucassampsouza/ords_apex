var g_object = null;
var cX =  0;
var cY = 0;
var link1=false;
var link2=false;
var qb_state=false;
var qb_init=false;
var qb_startTime;
var qb_resultsOnClick=true;
var qb_colDrag = false;
var qb_begDrag = '';
var qb_zIndex = 100;
var gSetFocus = '';

//return array [table, column]
function qb_splitTableAndColumn(str) {
  var i, d, tname;
  var parts = str.split('.');
  if (parts.length == 2) {
    return parts;
  }
  // table or column must have dots in identifer
  d = $x('qbTableHolder').getElementsByTagName('DIV');
  for (i = 0; i < d.length; i++) {
    if (d[i].id && d[i].id.substring(d[i].id.length-5) == "thold" ) {
      tname = qb_getAlias(d[i]);
      if (str.substr(0,tname.length + 1) == tname + ".") {
          return [tname, str.substr(tname.length + 1)];
      }
    }
  }
  throw "Unknown table name in " + str;
}

function qb_cascadeUpUntil(n,tag){
 var l_find = true;
 var htmlEl = n;
      if(htmlEl){
       while(l_find){
         htmlEl = htmlEl.parentNode;
       if ( ! htmlEl )
           return;
         if ( htmlEl && htmlEl.nodeName == tag  ) {
           l_find = false;
         }
      }
    }
  return htmlEl;
}

function qb_cascadeUpMove(n,tag){
 var l_find = true;
 var htmlEl = n;
      if(htmlEl){
       while(l_find){
       if ( ! htmlEl ) { return; }
               if ( htmlEl.getAttributeNode && htmlEl.getAttributeNode("htmldb:close") && htmlEl.getAttributeNode("htmldb:close").nodeValue == '0' ) {
                 return null;
              } else if (( tag=='ANY' || htmlEl.nodeName == tag )  && htmlEl.movable == '1' ) {
                  l_find = false;
              } else {
                 htmlEl = htmlEl.parentNode;
              }
      }
    }
  return htmlEl;
}

function qb_cascadeUpClose(n,tag){
 var l_find = true;
 var htmlEl = n;
      if(htmlEl){
       while(l_find){
        htmlEl = htmlEl.parentNode;
       if ( ! htmlEl )
           return;
         if ( ( tag=='ANY' || htmlEl.nodeName == tag )
              && htmlEl.closable == '1' ) {
           l_find = false;
         }
      }
    }
  return htmlEl;
}

function qb_delArrElement(arr,ele){
 var i;
 var delId= typeof(ele) =='object' ? ele.id : ele;
 var ret;
   for(i=0;i<arr.length;i++){
    if ( ( typeof(arr[i]) == 'object' && arr[i].id == delId)
          || ( typeof(arr[i]) == 'string' &&  arr[i] == delId ) ) {
       ret = arr.splice(i,1);
     }
   }
   return arr;
}

function qb_initPage () {
    document.onmousedown = qb_pickIt;
    document.onmousemove = qb_dragIt;
    document.onmouseup   = qb_dropIt;
    document.onkeypress  = qb_keyHandler;
    document.onkeydown   = qb_keyHandler;
}

function qb_keyHandler(evt) {
  var e = evt ? evt : window.event;
  if (document.all) {
    if (event.keyCode == 27) {
      qb_clearLink();
      return true;
    }
    if (event.keyCode == 10 && event.ctrlKey == true){
      qb_genSql();
      html_TabClick($x('result_tab'),'queryResults_table');
      qb_getQueryResults();
      return true;
    }
    if (event.srcElement.id == 'QUERYTEXT') {
        if (e.keyCode == 9) {
            return;
        }
        if (event.ctrlKey == true && (event.keyCode == 65 || event.keyCode == 67)) {
          null;
        } else {
          return false;
        }
    }

    return event.keyCode;
  }else{
    if (e.keyCode == 27) {
      qb_clearLink();
      return true;
    }
    if (e.keyCode == 13 && e.ctrlKey == true){
      qb_genSql();
      html_TabClick($x('result_tab'),'queryResults_table');
      qb_getQueryResults();
      return true;
    }
    if (e.target.id == 'QUERYTEXT'){
        if (e.keyCode == 9) {
            return;
        }
        if (e.ctrlKey == true && (e.charCode == 97 || e.charCode == 99)) {
          return e.keyCode;
        } else {
          return false;
        }
    }

    return  e.keyCode;
  }
}

function qb_pickIt(evt) {
   var evt = (evt) ? evt :((window.event) ? event : null);
   var target = evt.target ? evt.target : evt.srcElement;

    if (gSetFocus != '') {
       qbSetFocus();
       return false;
    }

   if (apex.jQuery.inArray(target.id, ['QUERYTEXT','P1002_QUERY_DESC','P1002_SCHEMA','P1002_QUERY_NAME','P59_PARENT','P59_CHILDREN']) != -1) {
      return true;
   }

   if ( target.nodeName == 'scrollbar' ||
        target.nodeName == 'INPUT' ||
        target.nodeName == 'SELECT') {
       return;
    }

    var mousex = 0;
    var mousey = 0;
    if (evt.pageX || evt.pageY) {
      mousex = evt.pageX - 3;
      mousey = evt.pageY - 12;
    } else if (evt.clientX || evt.clientY) {
      mousex = evt.clientX + document.body.scrollLeft - 3;
      mousey = evt.clientY + document.body.scrollTop - 12;
    }

    if (qb_colDrag) {
        var myobject = $x("dragimg");
        myobject.style.display="block";
        myobject.style.left = mousex;
        myobject.style.top = mousey;
        cX = mousex - myobject.offsetLeft;
        cY = mousey - myobject.offsetTop;
        qb_zIndex = qb_zIndex +1;
        myobject.style.zIndex = qb_zIndex;
        g_object = myobject;
        return false;
    }

    var sUp = $x('qbTableHolder').scrollTop;
    var sLeft = $x('qbTableHolder').scrollLeft;
    mousex = mousex + sLeft;
    mousey = mousey + sUp;

    var myobject=qb_cascadeUpMove(target,"ANY");
    if (myobject) {
        g_object = myobject;
        qb_zIndex = qb_zIndex + 1;
        myobject.style.zIndex = qb_zIndex;
        cX = mousex - myobject.offsetLeft;
        cY = mousey - myobject.offsetTop;
        return false;
    }
    else {
        myobject = null;
        if (target.tagName == 'INPUT') {
          return true;
        }
        return false;
    }
}

function qb_dragIt(evt) {
    evt = (evt) ? evt : ((window.event) ? event : null);
    var target = evt.target ? evt.target : evt.srcElement;

    var mousex = 0;
    var mousey = 0;
    if (evt.pageX || evt.pageY) {
      mousex = evt.pageX - 3;
      mousey = evt.pageY - 12;
    } else if (evt.clientX || evt.clientY) {
      mousex = evt.clientX + document.body.scrollLeft - 3;
      mousey = evt.clientY + document.body.scrollTop - 12;
    }

    if (g_object) {
      if (qb_colDrag) {
        if ( mousex - cX > 0 )  {
           g_object.style.left = mousex - cX + 'px';
        } else {
            g_object.style.left = '0px';
        }

        if ( mousey - cY > 0 )  {
            g_object.style.top = mousey - cY + 'px';
        } else {
            g_object.style.top = '0px';
        }
        qb_redraw();
        return false;
      } else {
        var sUp = $x('qbTableHolder').scrollTop;
        var sLeft = $x('qbTableHolder').scrollLeft;
        mousex = mousex + sLeft;
        mousey = mousey + sUp;
        if ( mousex - cX > 0 )  {
           g_object.style.left = mousex - cX + 'px';
        } else {
            g_object.style.left = '0px';
        }

        if ( mousey - cY > 0 )  {
            g_object.style.top = mousey - cY + 'px';
        } else {
            g_object.style.top = '0px';
        }
        qb_redraw();
        return false;
      }
     }
    if (target.nodeName == 'INPUT' || target.nodeName == 'TEXTAREA' || target.id == 'QUERYTEXT') {
      qb_redraw();
      return;
    } else {
      qb_redraw();
      return false;
    }
}


function qb_dropIt(evt) {

    evt = (evt) ? evt : ((window.event) ? event : null);
    var target = evt.target ? evt.target : evt.srcElement;

    if (qb_colDrag) {
      var mousex = 0;
      var mousey = 0;
      var sUp = $x('qbTableHolder').scrollTop;
      var sLeft = $x('qbTableHolder').scrollLeft;
      if (evt.pageX || evt.pageY) {
        mousex = evt.pageX + sLeft;
        mousey = evt.pageY + sUp;
      } else if (evt.clientX || evt.clientY) {
        mousex = evt.clientX + document.body.scrollLeft + sLeft;
        mousey = evt.clientY + document.body.scrollTop + sUp;
      }
        var obj = qb_getItem(mousex,mousey);
        if (obj) {
          qb_dragStop(obj.getAttributeNode("htmldb:col").nodeValue);
        } else {
          var img = $x("dragimg");
          img.style.display="none";
          qb_colDrag = false;
          qb_begDrag = '';
        }
    }

    if (g_object) {
        g_object = null;
    }
    return false;
}

var gTableCount = [];
gTableCount[0] = [];

function qb_addTable(id) {
    if ( gTableCount[id] && gTableCount[id].length > 0 ) {
       var x = parseInt(gTableCount[id][0]) + 1;
       gTableCount[id][0] = x;
       getTable(id,x);
    } else {
       gTableCount[id] = new Array();
       gTableCount[id][0] = 0;
       getTable(id,0);
    }
}


function q(pId){
  qb_addTable(pId)
}

function qb_tblCount(id) {
    if ( gTableCount[id] && gTableCount[id].length > 0) {
        return parseInt(gTableCount[id][0])+1;
    } else {
        return 0;
    }
}

function qb_chkCount(id,pCount) {
    if ( gTableCount[id] && gTableCount[id].length > 0) {
       var x = parseInt(gTableCount[id][0]);
         if ( x < pCount )
           gTableCount[id][0] = pCount;
    } else {
       gTableCount[id] = new Array();
       gTableCount[id][0] = pCount;
    }
}

function getTable(id,pCount,top,left) {
    // remove any string like px at the end
    top = parseInt(top, 10);
    left = parseInt(left, 10);

    qb_initPage();
    id   = typeof (id) == 'object' ? id.id : id;
    var x = id;
    qb_chkCount(id,pCount);
    var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=1916013849479713',0);
    get.add('P1002_ID',id);
    get.add('P1002_COUNT', pCount);
    var x = get.get('FULL');
    get = null;
    var l_newDiv = document.createElement('DIV');
    l_newDiv.style.display='none';
    l_newDiv.style.position='absolute';
    l_newDiv.id = id+'_'+pCount;
    var main = $x('qbTableHolder');
    main.insertBefore(l_newDiv, main.firstChild);
    l_newDiv.innerHTML= x;
    l_newDiv.movable  = '1';
    l_newDiv.closable = '1';
    if ( top && left ) {
          l_newDiv.style.left=left+"px";
          l_newDiv.style.top=top+"px";
    } else {
        var children = main.getElementsByTagName('TABLE');
        var y = '';
        var lastEl = false;
        for(i=0;i<=children.length-1;i++){
          var x = 0;
          if (children[i].id != l_newDiv.id+'_data' && children[i].id != '' )
            x = findPosX(children[i]);
          if (x > y) {
            lastEl = children[i];
            y = x;
          }
        }
        if (lastEl) {
          var lastX = findPosX(lastEl);
          var lastY = findPosY(lastEl);
                    l_newDiv.style.display='block';
          l_newDiv.style.left = (lastX + (lastEl.offsetWidth + 25))+"px";
          l_newDiv.style.top = lastY+"px";
        } else {
          l_newDiv.style.display='block';
          l_newDiv.style.left = "28px";
          l_newDiv.style.top = "14px";
        }
    }
    $x_Show(l_newDiv);
    qb_genSql();
}

function qb_toggleTable(pId) {
  //var t = html_CascadeUpTill(pId,"TABLE").rows[1];
  var foo = html_CascadeUpTill(pId,"DIV");
  var tname = foo.getAttribute("htmldb:id");
  var tcnt = foo.getAttribute("htmldb:cnt");
  var foo2 = tname+'_'+tcnt+'_tog';
  var t = $x(foo2);
  var l_Set = 'none';
  if(html_CheckImageSrc(pId,'min')){
    html_SwitchImageSrc(pId,'min',htmldb_Img_Dir + 'qb/vertical_max.png');
    html_HideElement(t);
  }else{
    html_SwitchImageSrc(pId,'max',htmldb_Img_Dir + 'qb/vertical_min.png');
    html_ShowElement(t);
    l_Set = '';
  }
  qb_redraw();
  toolTip_disable();
}

function qb_redraw(){
    if ( qb_links && qb_links.length > 0 ) {
        for (j=0;j<qb_links.length;j++) {
           qb_links[j].redim();
        }
    }
}

function qb_clearLink(){
        if ( link1 != false && link1.id  )
           if($x(link1.id)) {
            $x(link1.id+'_jbox').style.backgroundColor="";
            $x(link1.id).style.backgroundColor="";
           }
        if (link2 != false && link2.id )
         if($x(link2.id)) {
           $x(link2.id+'_jbox').style.backgroundColor="";
           $x(link2.id).style.backgroundColor="";
         }
        link1=false;
        link2=false;
        qb_validateLinks();
}


function qb_postQUERY(sql) {
    qb_initPage();
    sql = escape(sql);
    var get = htmldb_getData(null,4500,'APPLICATION_PROCESS=1504518033640244',0);
      get.add('P1002_QUERY',cwsqlid);
    var x = get.get('FULL');
      get = null;
}

function qb_escapeSQL(sql){
  var ret="";
  var c;
  for(var i=0;i<sql.length;i++){
    c = sql.charAt(i);
    if (c == "," )
       ret = ret + "^c";
    else if ( c == "+" )
       ret = ret + "^p";
    else if ( c == ":" )
       ret = ret + "^x";
  else
       ret = ret + c;
  }
  return ret;
}

function qb_removeTable(id) {
  var lid, child, d, i;
  if (id.nodeName && id.nodeName == "IMG" ) {
     d= qb_cascadeUpClose(id,"DIV");
  } else {
     d= $x(id);
  }
   qb_clearLink();
   qb_rmTableConditions(d.id);
   // clean up table action dialog
   var tmenu = $x(d.id+"_tmenu");
   if (tmenu) {
      tmenu.parentNode.removeChild(tmenu);
   }
   d.parentNode.removeChild(d);
   qb_validateLinks();
   qb_validateLinks();
   // hide tool tip
   toolTip_disable();
   // call in qb_rmTableConditions doesn't get it done
   qb_genSql();
   // this is to clean up the array holding table counts
   var c = 0;
   // get the table object id
   var tabId = d.id.substring(0,d.id.indexOf('_'));
   // get the array of rendered tables
   var tableDiv = $x("qbTableHolder");
   // wlk the tables and see if any still exist
    for(i=0;i<tableDiv.childNodes.length;i++) {
      child = tableDiv.childNodes[i];
      if (child.nodeName !== 'DIV') {
        continue;
      }
      lid = child.id.substring(0,child.id.indexOf('_'));
      if (lid == tabId) {
        c++;
      }
     }
     // if none exist count is 0 so reset the array for that object id
     if (c==0) {
       gTableCount[tabId] = new Array;
     }
  }


function qb_linkTable(o){
     o = o.nodeName == "TD" ? o : qb_cascadeUpUntil(o,"TD");
     var orig = o;

     if (link1 == false ) {
         link1 = o;
         orig.style.backgroundColor='#DDDDDD';
         $x(link1.id+'_jbox').style.backgroundColor="#DDDDDD";
         return;
      } else if ( link2 == false ) {
         link2 = o;
         if (link1 == link2) {
             qb_clearLink();
             qb_validateLinks();
             return;
         }
         var sFrom = qb_splitTableAndColumn(link1.id);
         var sTo = qb_splitTableAndColumn(link2.id);
         if (sFrom[0] == sTo[0]) {
             link2=false;
             return;
         }
         orig.style.backgroundColor='#DDDDDD';
         $x(link2.id+'_jbox').style.backgroundColor="#DDDDDD";
         var l = new qb_link(link1,link2);
         qb_genSql();
         link1=false;
         link2=false;
         return;
      }
}


var qb_Open_Menu = '';

function qb_tablePopup(obj,evt,id){
    var x = $x(id+"_thold");
    var holder = $x(id+"_tmenu");
      var tname = x.getAttribute("htmldb:name");
      var schema = $x("P1002_SCHEMA").value;
      var get = new htmldb_Get(holder,4500,'TABLE',59);
      get.add('P59_TNAME',tname);
      get.add('P59_SCHEMA', schema);
      get.get('PPR','<htmldb:BOX_BODY>','</htmldb:BOX_BODY>');
      get = null;
      holder.closable=1;
      qb_zIndex = qb_zIndex + 1;
      holder.style.zIndex = qb_zIndex;
      holder.tableId=id;
      var evt = (evt) ? evt : ((window.event) ? event : null);
      var target_x = evt.pageX ? evt.pageX : evt.clientX ;
      var target_y = evt.pageY ? evt.pageY : evt.clientY ;
       dhtml_SingeMenuOpen(obj,holder,'Set',target_x,target_y);
    qb_redraw();
    return;
}


function qb_getQueryResults(){
    var holder = $x("queryResults");
    var query = $x("P1002_QUERY").value;
    if (query) {
      var get = new htmldb_Get(null,4500,'RP',23);
        get.add('P1002_QUERY', query);
         get.clear('RP');
         var results = get.get(null,'<htmldb:BOX_BODY>','</htmldb:BOX_BODY>');
        get = null;
      holder.innerHTML = results;
      init_htmlPPRReport();
    } else {
        // this item is set to a system message showing the correct message
        holder.innerHTML = $x('P1002_RESULTS_ERROR_MSG').value;
    }
    qb_resultsOnClick=false;
}

function qb_close(id){
    html_enableBase();
    var t = qb_cascadeUpClose($x(id),'ANY');
    html_HideElement(t);
    toolTip_disable();
    $x("htmldbMessageHolder").innerHTML = '';
    $x('qbTableHolder').className = 'd1'; /* ff BUG https://bugzilla.mozilla.org/show_bug.cgi?id=223239 */
    $x('qbBottomHolder').className = 'd2';
    $x('qbTableHolder').style.overflow = 'auto';
    $x('qbBottomHolder').style.overflow = 'auto';
}

function qb_makeJoin(obj) {
    var x = obj.value;
    if ( x == 0 ) return;
    var zz = x.split('|');
    var newCount = qb_tblCount(zz[0]);
    getTable(zz[0],newCount);

    var fdiv = html_CascadeUpTill(obj,'SPAN');
    //var fdiv = html_CascadeUpTill(fdiv1,'DIV');
    var tableId = fdiv.tableId;
    var fdiv = $x(tableId+"_thold");
    var ftab = qb_getAlias(fdiv);
    var fcol = zz[2];

    var tdiv = $x(zz[0]+'_'+newCount+'_thold');
    var ttab = qb_getAlias(tdiv);
    var tcol = zz[1];

    var l1 = $x(ftab+'.'+fcol);
    var l2 = $x(ttab+'.'+tcol);

    qb_linkTable(l1);
    qb_linkTable(l2);
    qb_genSql();
    var menu = $x(tableId +"_tmenu");
        html_HideElement(menu);
    var breaker = '';
}

function qb_CheckAllColumns(pThis){
    var start= new Date();
    qb_suspendGen= true;
    var fdiv1 = html_CascadeUpTill(pThis,'SPAN');
    var fdiv = $x(fdiv1.tableId +"_thold");
    var l_Inputs = html_Return_Form_Items(fdiv,'checkbox');
    var table = $x("conditions");
    for (var i=0;i<l_Inputs.length&&i!=-1;i++){
      if ( l_Inputs[i].id != "P59_CHECK_ALL_0" ) {
         // check for the 60 limit
         if ( qb_checkCols + 1 > 60 ) {
           l_Inputs[i].checked = false;
           alert(l_maxCols);
           i=-2; // set i to -2 to stop the loop
         } else if ( pThis.checked ) {
            if ( qb_checkCols + 1 < 21 ) {
               l_Inputs[i].checked = true;
               qb_checkColumn(l_Inputs[i])
            } else {
               i=-2; // set i to -2 to stop the loop
            }
          } else {
               l_Inputs[i].checked = false;
              qb_rmCondition( $x(l_Inputs[i].value+"_condition"));
          }
     } // end check for P59_
    }
    qb_suspendGen= false;
    qb_genSql();
    return;
}

function qb_returnSQL(){
   var ret = $v("P1002_RETURN_INTO");

   // First we assume it's a code editor, if that doesn't work we do a normal apex page item assignment
   try {
       opener.$( "#" + ret ).codeEditor( "setValue", $v( "P1002_QUERY" ));
   } catch ( e ) {
       opener.apex.item( ret ).setValue( $v( "P1002_QUERY" ));
   }

   window.close();
}

function qb_checkQuery(){
   if ( qb_resultsOnClick ) {
     qb_getQueryResults();
   }

}

function qb_dragStart(pCol) {
    qb_colDrag = true;
    qb_begDrag = pCol;
}

function qb_dragStop(pCol) {
  if (qb_begDrag != '' && pCol != '') {
    var sFrom = qb_splitTableAndColumn(qb_begDrag);
    var sTo = qb_splitTableAndColumn(pCol);
    if (sFrom[0] != sTo[0]) {
      var foo = new qb_link(qb_begDrag,pCol,"E");
      qb_validateLinks();
      qb_redraw();
      qb_genSql();
    }
  }

  var img = $x("dragimg");
  img.style.display="none";

  qb_colDrag = false;
  qb_begDrag = '';
}


function qb_getItem(x,y){
 var element = document.getElementsByTagName("TD");
 var iselement = false;
 var ele = '';
 for (i=0; i<element.length; i++) {
    var nId = element[i].innerHTML;
    var nEle = element[i];
    if (nEle.getAttributeNode && nEle.getAttributeNode("htmldb:dragable")) {
      var left = fPosX(element[i]);
      var top = fPosY(element[i]);
      var right = left + nEle.clientWidth;
      var bottom = top + nEle.clientHeight;
      if (left < x && right > x && top < y && bottom  > y) {
        return element[i];
      }
    }
  }
    return null;
}

function offsetX()
{
    var obj = $x("qbTableHolder");
    var curleft = 0;
    if (obj.offsetParent)
    {
        while (obj.offsetParent)
        {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    }
    else if (obj.x)
        curleft += obj.x;
    return curleft;
}

function offsetY()
{
    var obj = $x("qbTableHolder");
    var curtop = 0;
    if (obj.offsetParent)
    {
        while (obj.offsetParent)
        {
            curtop += obj.offsetTop;
            obj = obj.offsetParent;
        }
    }
    else if (obj.y)
        curtop += obj.y;
    return curtop;
}

function fPosX(obj)
{
    var curleft = 0;
    if (obj.offsetParent)
    {
        while (obj.offsetParent)
        {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    }
    else if (obj.x)
        curleft += obj.x;
    return curleft;
}

function fPosY(obj)
{
    var curtop = 0;
    if (obj.offsetParent)
    {
        while (obj.offsetParent)
        {
            curtop += obj.offsetTop;
            obj = obj.offsetParent;
            if (obj.className == 'qbData') {
                curtop -= obj.offsetParent.firstChild.scrollTop;
            }

        }
    }
    else if (obj.y)
        curtop += obj.y;
    return curtop;
}


function qb_getSavedSQL(pReset){
  var own = "0";
  var find = "";
  var rows = 15;
  var holder = $x("SavedSQLHolder");
  if ($x("P38_OWNER")){own = html_SelectValue("P38_OWNER")}
  if(pReset != true){
      if ($x("P38_FIND") && $x("P38_FIND").value != "undefined" ) {
          find = $x("P38_FIND").value;
      }
  }
  if(pReset){find = '';}
  if ($x("P38_ROWS")){rows = html_SelectValue("P38_ROWS")}

   if(pReset){
     lURL = 'f?p=4500:38:'+$x('pInstance').value+'::NO:RP:P38_OWNER,P38_FIND,P38_ROWS:'+own+','+find+','+rows;
     var get = new htmldb_Get(null,4500,null,38,null,'f',lURL.substring(2));
   }else{
     var get = new htmldb_Get(null,4500,null,38);
   }
    get.add('P38_OWNER',own);
    get.add('P38_FIND',find);
    get.add('P38_ROWS',rows);
  var results = get.get(null,'<htmldb:BOX_BODY>','</htmldb:BOX_BODY>');
  holder.innerHTML = results;
  init_htmlPPRReport('R159940232617099966');

  apex.jQuery('#init_row_R159940232617099966').remove();

  results = null;
  get = null;
}

function IsNumeric(sText) {
   var ValidChars = "0123456789";
   var IsNumber=true;
   var Char;
   for (i = 0; i < sText.length && IsNumber == true; i++)
      {
      Char = sText.charAt(i);
      if (ValidChars.indexOf(Char) == -1)
         {
         IsNumber = false;
         }
      }
   return IsNumber;
}

function qbValSo(obj) {
    var val = IsNumeric(obj.value);
    if (! val) {
     var pMessage = '<div class="htmldbNotification"><ul><li>';
     pMessage = pMessage+l_invSo;
     pMessage = pMessage+'</li></ul></div>';
     $x("htmldbMessageHolder").innerHTML = pMessage;
     gSetFocus = obj.id;
     return false;
    } else {
     gSetFocus = '';
     $x("htmldbMessageHolder").innerHTML = '';
     qb_genSql();
    }
}

function qbSetFocus() {
    if (gSetFocus != '') {
     $x(gSetFocus).focus();
    }
}


var rowStyle      = new Array(10);
var rowActive     = new Array(10);
var rowStyleHover = new Array(10);




            function checkAll(masterCheckbox) {
                if (masterCheckbox.checked) {
                    if (document.wwv_flow.f01.checked==false) {
                      document.wwv_flow.f01.checked=true;
                      highlight_row(document.wwv_flow.f01,1);
                    }
                } else {
                    rowsNotChecked=0;
                    if (document.wwv_flow.f01.checked!=true) {
                       rowsNotChecked=rowsNotChecked+1;
                    }
                    if (rowsNotChecked==0) {
                        if (document.wwv_flow.f01.checked==true) {
                          document.wwv_flow.f01.checked=false;
                          highlight_row(document.wwv_flow.f01,1);
                        }
                    }
                }
            }

            function highlight_row(checkBoxElemement,currentRowNum) {
                if(checkBoxElemement.checked==true) {
                    for( var i = 0; i < checkBoxElemement.parentNode.parentNode.childNodes.length; i++ ) {
                        if (checkBoxElemement.parentNode.parentNode.childNodes[i].tagName=='TD') {
                            if(rowActive=='Y') {
                                rowStyle[currentRowNum] = rowStyleHover[currentRowNum];
                            } else {
                                rowStyle[currentRowNum] = checkBoxElemement.parentNode.parentNode.childNodes[i].style.backgroundColor;
                            }
                            checkBoxElemement.parentNode.parentNode.childNodes[i].style.backgroundColor = '#CCCCCC';
                        }
                    }
                    rowStyleHover[currentRowNum] =  '#CCCCCC';
                } else {
                      for( var i = 0; i < checkBoxElemement.parentNode.parentNode.childNodes.length; i++ ) {
                          if (checkBoxElemement.parentNode.parentNode.childNodes[i].tagName=='TD') {
                              checkBoxElemement.parentNode.parentNode.childNodes[i].style.backgroundColor =  rowStyle[currentRowNum];
                              rowStyleHover[currentRowNum] =  rowStyle[currentRowNum];
                              document.wwv_flow.x02.checked=false;
                          }
                      }
                }
            }

/*
 *qb_object_list.js
 * */

var qb_state=false;
var qb_lastState;

function qb_getObjectList(obj, owner, onclick){
  nw = new Date(); //Now !;
  var get = new htmldb_Get(obj,4500,'APPLICATION_PROCESS=qb_object_feed',0);
  get.add('P1002_SCHEMA', owner);
  get.add('P1002_ONCLICK', onclick);
  get.add('P0_PPRTIMESTAMP',nw.getTime());
  var ret = get.get();
  get = null;
  return ret;
}


function qb_postState() {
    cDebug('start qb_postState');
    var schema = $x("P1002_SCHEMA");
    var finder = $x("P1002_FIND").value;
    cDebug("Last:"+qb_lastState);
    cDebug("Current:"+':'+schema+':'+finder+':');
    if ( qb_lastState == null || qb_lastState != ':'+schema+':'+finder+':' ) {
        // call is in /javascript/htmldb_data.js
        cDebug('Sending State');
        var x = new htmldb_Get(null,4500,'APPLICATION_PROCESS=qb_postState',0);
            x.add('P1002_SCHEMA',schema.value);
            x.add('P1002_FIND'  ,finder.value);
            x.get();
            x=null;
        qb_state = false;
        qb_lastState = ':'+schema+':'+finder+':';
    }

}

function qb_sendState(){
  if (!qb_state ) {
    setTimeout("qb_postState()", 3000);
    qb_state = true;
  }
}

// load the QB left column
function qb_getTableList() {
  qb_getObjectList('dbaseObjectsSlider', $v("P1002_SCHEMA"),'q(this.id)');
  qb_searchTables();
 }

function qb_searchTables(){
    var foo = $x("dbaseObjectsSlider");
  html_Find($x("dbaseObjectsSlider"),$x('P1002_FIND').value,'DIV','dbaseObject');
  qb_sendState();
}


/*
 * qb_gensql.js
 **/
var qb_checkCols=0;
var qb_suspendGen=false;

function qb_linkDblClick(){
    // put some code here
    var x=this;
}
function qb_tableDblClick(){
    // put some code here
     var x=this;
}
function qb_columnDblClick(){
    // put some code here
     var x=this;
}

function qb_getAlias(obj) {
      var tname = obj.getAttribute("htmldb:name");
      var tcnt = obj.getAttribute("htmldb:cnt");
      var cId = '';
      if (tcnt > 0) {
        cId = tname+'_'+tcnt;
      } else {
        cId = tname;
      }
      return cId;
}
function qb_rmTableConditions(id) {
//  var t = $x(id);
    var t = $x(id+"_thold");
//  var zx = id;
    if (t) {
//      var tname = t.innerHTML;
//        var tname = t.getAttribute("htmldb:name")
//        var tcnt = t.getAttribute("htmldb:cnt")
//        var cId = '';
//        if (tcnt > 0) {
//          cId = tname+'_'+tcnt;
//        } else {
//          cId = tname;
//        }
      var x=$x('conditions').getElementsByTagName('TR');
      for(var i=0;i<x.length;i++){
         // var foo = x[i].id;
        if(x[i].table && x[i].table == qb_getAlias(t)) {
            qb_checkCols--;
              var zz = x[i].table;
              x[i].parentNode.removeChild(x[i]);
              i--;
       }
      }
    }else{
      return false;
    }
   qb_genSql();
}

function qb_rmCondition(x) {
    x = $x(x);
    x.parentNode.removeChild(x);
         qb_checkCols--;
    qb_genSql();
}

function qb_rmConditionImg(x) {
    var chkBox = $x('selectColumns_'+x);
    chkBox.checked = false;
    x = $x(x+'_condition');
    x.parentNode.removeChild(x);
    qb_checkCols--;
    qb_genSql();
}

function qb_toggleOut(id){
    var x = $x(id);
    var y = $x(x.col+"_grp");
      if (x.checked) {
        x.checked=true;
        x.defaultChecked=true;
      } else {
        x.checked=false;
        y.checked=false;
        x.defaultChecked=false;
        y.defaultChecked=false;
      }
      qb_genSql();
}

function qb_toggleGrp(id){
    var x = $x(id);
    var y = $x(x.col+"_out");
      if (x.checked) {
        x.checked=true;
        y.checked=true;
        x.defaultChecked=true;
        y.defaultChecked=true;
      } else {
        x.defaultChecked=false;
        x.checked=false;
      }
      qb_genSql();
}

function qb_setFun(obj) {
    var s = obj.value;
    var count = 0;
    if (s!="") {
      var matches = s.match(/\(/g);
      if (matches)
       count = matches.length;
    }
    obj.paren = count;
    qb_genSql();
}

function qb_rendCharSelect(obj){
   obj.options.length = 0;
   obj.options[obj.options.length]=new Option('','');
   obj.options[obj.options.length]=new Option('COUNT','count(');
   obj.options[obj.options.length]=new Option('COUNT DISTINCT ','count( distinct ');
   obj.options[obj.options.length]=new Option('INITCAP','initcap(');
   obj.options[obj.options.length]=new Option('LENGTH','length(');
   obj.options[obj.options.length]=new Option('LOWER','lower(');
   obj.options[obj.options.length]=new Option('LTRIM','ltrim(');
   obj.options[obj.options.length]=new Option('RTRIM','rtrim(');
   obj.options[obj.options.length]=new Option('TRIM','rtrim(ltrim(');
   obj.options[obj.options.length]=new Option('UPPER','upper(');
   obj = null;
   return;
}

function qb_rendNumberSelect(obj){
   obj.options.length = 0;
   obj.options[obj.options.length]=new Option('','');
   obj.options[obj.options.length]=new Option('COUNT','count(');
   obj.options[obj.options.length]=new Option('COUNT DISTINCT ','count( distinct ');
   obj.options[obj.options.length]=new Option('AVG','avg(');
   obj.options[obj.options.length]=new Option('MAX','max(');
   obj.options[obj.options.length]=new Option('MIN','min(');
   obj.options[obj.options.length]=new Option('SUM','sum(');
   obj = null;
   return;
}

function qb_rendDateSelect(obj){
   obj.options.length = 0;
   obj.options[obj.options.length]=new Option('','');
   obj.options[obj.options.length]=new Option('COUNT','count(');
   obj.options[obj.options.length]=new Option('COUNT DISTINCT ','count( distinct ');
   obj.options[obj.options.length]=new Option('TO_CHAR YEAR','year');
   obj.options[obj.options.length]=new Option('TO_CHAR QUARTER','quarter');
   obj.options[obj.options.length]=new Option('TO_CHAR MONTH','month');
   obj.options[obj.options.length]=new Option('TO_CHAR DAY','weekday');
   obj.options[obj.options.length]=new Option('TO_CHAR DAY OF YEAR','doy');
   obj.options[obj.options.length]=new Option('TO_CHAR WEEK','week');
   obj = null;
   return;
}

// add a condition row

function qb_addCondition(box){
  qb_checkCols++;
  // get table and create new row
  var table = $x("conditions");
  var parts = qb_splitTableAndColumn(box.value);
  cTestClone(parts[0], parts[1], box);
  if (!qb_suspendGen) {
    qb_genSql();
  }
}

function cTestClone(p_Obj,p_Col,p_Box){
 var startTime = new Date();
 var l_Obj_Col = p_Obj + '.' + p_Col;
 var table = $x("conditions");
 var tbody;
 var l_cRow = $x('clone');
  var newTR = l_cRow.cloneNode(true);
  newTR.table = p_Obj;

  var l_Tds = newTR.getElementsByTagName('TD');
  newTR.id = p_Box.value+"_condition";
 l_Tds[8].getElementsByTagName('SELECT')[0].id = l_Obj_Col + '_fun'; // Function

 var l_ColIn = l_Tds[1];
 l_ColIn.id = l_Obj_Col + '_Column'; // Column
 l_ColIn.innerHTML = p_Col; // Column

 var l_ObjIn = l_Tds[3];
 l_Tds[3].id = l_Obj_Col + '_Object'; // Object
 l_ObjIn.innerHTML = p_Obj; // Object


 l_Tds[2].getElementsByTagName('INPUT')[0].id = l_Obj_Col + '_alias'; // Alias id

 var l_Inp = table.getElementsByTagName('INPUT');
 var c = 0;
 var r = 0;
 for (j=0;j<l_Inp.length;j++) {
     // This use of indexOf is probably wrong but this code assumes that
     // a column can be added twice and I don't see how that can happen.
     var aid = l_Inp[j].id.substring(l_Inp[j].id.indexOf('.')+1);
     var aid2 = l_Inp[j].value.substring(l_Inp[j].value.indexOf('_')+1);
     if (aid  == p_Col+'_alias') {
         c = c+1;
         if ( aid2 > r)
           r = aid2;
     }
 }

    var l_Alias = '';
    if ( c == 1 )
      l_Alias = '';

    if ( c == 2 )
      l_Alias = '_1';
    r = parseInt(r)+1;
    if ( c > 2 )
      l_Alias = '_'+r;

 l_Tds[2].getElementsByTagName('INPUT')[0].value = p_Col+l_Alias; // alias value

 var  l_outIN = l_Tds[7].getElementsByTagName('INPUT')[0];
 l_outIN.id = l_Obj_Col + '_out'; // Output?
 l_outIN.out = "1";
 l_outIN.col = p_Box.value;

 l_Tds[5].getElementsByTagName('SELECT')[0].id = l_Obj_Col + '_st'; // Sort Type

 var l_soIN =  l_Tds[6].getElementsByTagName('INPUT')[0];
 l_soIN.id  = l_Obj_Col + '_so'; // Sort Order
 l_soIN.sort = "1";
 l_soIN.st = p_Box.value+"_st";
 l_soIN.col = p_Box.value;

 var l_grpIN = l_Tds[9].getElementsByTagName('INPUT')[0];
 l_grpIN.id = l_Obj_Col + '_grp'; // Group By
 l_grpIN.grp = "1";
 l_grpIN.col = p_Box.value;

 var  l_Del = l_Tds[10].getElementsByTagName('IMG')[0];
 l_Del.id = l_Obj_Col + '_del'; // Output?
 l_Del.value = l_Obj_Col;

 var l_conIN = l_Tds[4].getElementsByTagName('INPUT')[0];
 l_conIN.id = l_Obj_Col + '_con'; // Condition
 l_conIN.where = "1";
 l_conIN.col = p_Box.value;

 tbody = table.getElementsByTagName("TBODY")[0];
 tbody.appendChild(newTR);

 // there are more data types that should be recognized here
 if (p_Box.alt=='DATE' || p_Box.alt=='TIMESTAMP')qb_rendDateSelect($x(l_Obj_Col + '_fun'));
 if (p_Box.alt=='VARCHAR2')qb_rendCharSelect($x(l_Obj_Col + '_fun'));
 if (p_Box.alt=='NUMBER')qb_rendNumberSelect($x(l_Obj_Col + '_fun'));

 newTR = null;
 l_Tds = null;
 return;
}

function qb_RowUp(pThis){
  oElement = html_RowUp(pThis);
  qb_genSql();
  return oElement;
 }


function qb_RowDown(pThis){
  oElement = html_RowDown(pThis);
  qb_genSql();
  return oElement;
}


function qb_checkColumn(box){
  var x = $x(box.value+"_condition");
  if (box.checked == true && x ) {
    return;
  } else if (box.checked == true && !x ) {
     if ( qb_checkCols + 1 > 60 ) {
      box.checked=false;
      alert(l_maxCols);
      return;
    } else {
      qb_addCondition(box);
    }
  } else if (box.checked == false && x ) {
    qb_rmCondition(x);
  } else if (box.checked == false && !x ) {
    return;
  }
}

// return quoted or non quoted identifier as needed
var qb_makeIdentifier = (function() {
    var reservedIdentifiers = {
      ACCESS: true, ADD: true, ALL: true, ALTER: true,
      AND: true, ANY: true, AS: true, ASC: true, AUDIT: true,
      BETWEEN: true, BY: true, CHAR: true, CHECK: true, CLUSTER: true,
      COLUMN: true, COMMENT: true, COMPRESS: true, CONNECT: true,
      CREATE: true, CURRENT: true, DATE: true, DECIMAL: true,
      DEFAULT: true, DELETE: true, DESC: true, DISTINCT: true, DROP: true,
      ELSE: true, EXCLUSIVE: true, EXISTS: true, FILE: true, FLOAT: true,
      FOR: true, FROM: true, GRANT: true, GROUP: true, HAVING: true,
      IDENTIFIED: true, IMMEDIATE: true, IN: true, INCREMENT: true,
      INDEX: true, INITIAL: true, INSERT: true, INTEGER: true,
      INTERSECT: true, INTO: true, IS: true, LEVEL: true, LIKE: true,
      LOCK: true, LONG: true, MAXEXTENTS: true, MINUS: true,
      MLSLABEL: true, MODE: true, MODIFY: true, NOAUDIT: true,
      NOCOMPRESS: true, NOT: true, NOWAIT: true, NULL: true, NUMBER: true,
      OF: true, OFFLINE: true, ON: true, ONLINE: true, OPTION: true, OR: true,
      ORDER: true, PCTFREE: true, PRIOR: true, PRIVILEGES: true, PUBLIC: true,
      RAW: true, RENAME: true, RESOURCE: true, REVOKE: true, ROW: true,
      ROWID: true, ROWNUM: true, ROWS: true, SELECT: true, SESSION: true,
      SET: true, SHARE: true, SIZE: true, SMALLINT: true, START: true,
      SUCCESSFUL: true, SYNONYM: true, SYSDATE: true, TABLE: true,
      THEN: true, TO: true, TRIGGER: true, UID: true, UNION: true,
      UNIQUE: true, UPDATE: true, USER: true, VALIDATE: true, VALUES: true,
      VARCHAR: true, VARCHAR2: true, VIEW: true, WHENEVER: true,
      WHERE: true, WITH: true
    };
    // in some cases identifiers with # or $ still need to be quoted
    var nonQuotedIdent = /^[A-Z][A-Z0-9_]*$/;

    return function(str) {
      if (nonQuotedIdent.test(str) && !reservedIdentifiers[str.toUpperCase()]) {
        return str;
      }
      // else
      return '"' + str + '"';
    };
})();


function qb_genSql(){
  var cols = qb_getColumns();
  var tabs = qb_getTables();
  var l    = qb_getLinks();
  var w    = qb_getWhere();
  var g    = qb_getGroup();
  var s    = qb_getSort();

  var ret;
  if ( cols != "" && tabs != "" ) {
     ret  = "select" + cols + " \n from" + tabs;
     if ( l!="" ) {
        if (w!="") {
           ret = ret + " \n where" + l +"\n    and"+ w;
        } else {
           ret = ret + " \n where" + l;
        }
     } else {
        if (w!="")
           ret = ret + " \n where" + w;
     }
    ret = ret + g + s;
  } else {
     ret = "";
  }
   var d = $x("QUERYTEXT");
   if (d){d.value = ret}

   //set the value on the page
   var q = $x("P1002_QUERY");
   if (q){q.value = ret}
   // set the value in session
   //qb_postQUERY(ret);
   qb_resultsOnClick=true;

}


function qb_getLinks(){
   var ret="";
   var tab;
   for(var i=0;i<qb_links.length;i++){
     ret = ret == "" ? " ": ret + "\n    and ";
     tab = qb_splitTableAndColumn(qb_links[i].field1.id);
     ret = ret + qb_makeIdentifier(tab[0]) + '.' + qb_makeIdentifier(tab[1]);
     if ( qb_links[i].condition == 'L')
       ret = ret + '(+) =';
     else
       ret = ret + '=';

     tab = qb_splitTableAndColumn(qb_links[i].field2.id);
     ret = ret + qb_makeIdentifier(tab[0]) + '.' + qb_makeIdentifier(tab[1]);
     if ( qb_links[i].condition == 'R')
       ret = ret + '(+)';
   }
   return ret;
}

function qb_getTables(){
  var d=$x('qbTableHolder').getElementsByTagName('DIV');
  var ret="";
  for(var i=0;i<d.length;i++){
        if ( d[i].id && d[i].id.substring(d[i].id.length-5) == "thold" ) {
          var tname = d[i].getAttribute("htmldb:name");
          ret = ret === "" ? " ": ret + ",\n    ";
          ret = ret + qb_makeIdentifier(tname) + ' ' + qb_makeIdentifier(qb_getAlias(d[i]));
        }
   }
   return ret;
}

function qb_getColumns(){
  var d=document.getElementById('conditions').getElementsByTagName('INPUT');
  var ret="";
  var colName, parts, alias;

  for(var i=0;i<d.length;i++){
        if ( d[i].checked && d[i].out) {
          var a = $x(d[i].col+"_alias");
          var f = $x(d[i].col+"_fun");
          parts = qb_splitTableAndColumn(d[i].col);
          colName = qb_makeIdentifier(parts[0]) + '.'+ qb_makeIdentifier(parts[1]);
          alias = qb_makeIdentifier(a.value);
          ret = ret == "" ? " ": ret + ",\n    " ;
          // is a function assigned
          if (f && f.value != "") {
            if (f.paren>0) {
              var par = "";
              for (var zz=0;zz<f.paren;zz++) { par = par + ")"; }
              ret += f.value + colName + par;
            } else {
              // do my to_char stuff here
              var l_col = " ";
              switch (f.value) {
                case "year":
                  l_col = "to_char("+colName+",'YYYY')";
                  break;
                case "quarter":
                  l_col = "to_char("+colName+",'Q')";
                  break;
                case "month":
                  l_col = "to_char("+colName+",'MONTH')";
                  break;
                case "doy":
                  l_col = "to_char("+colName+",'DDD')";
                  break;
                case "week":
                  l_col = "to_char("+colName+",'WW')";
                  break;
                case "weekday":
                  l_col = "to_char("+colName+",'DAY')";
                  break;
              }
              ret += l_col;
            }
          } else {
            ret += colName;
          }
          ret += ' as ' + alias
        }
   }
   return ret;
}

function qb_getWhere(){
  var d=$x('conditions').getElementsByTagName('INPUT');
  var ret="";

  for(var i=0;i<d.length;i++){
        if ( d[i].where && d[i].value != "" ) {
          ret = ret == "" ? " ": ret + "\n    and ";
          var tab = qb_splitTableAndColumn(d[i].col);
          ret = ret + qb_makeIdentifier(tab[0]) +'.' + qb_makeIdentifier(tab[1]) + ' ' + d[i].value;
        }
   }
   return ret;
}

function qb_getSort(){
  var d=$x('conditions').getElementsByTagName('INPUT');
  var m = new Array;
  var zz = 0;
  var pos=1;
  var maxpos=1;
  var ret="";
  // make a smaller array from the input arrays that are sort value
  // and get the maximum value
  for(var i=0;i<d.length;i++){
    if (d[i].sort && d[i].value != "" ) {
      m[zz] = d[i];
      if(m[zz].value > maxpos){maxpos = m[zz].value}
      zz++
    }
  }
  while (pos<=maxpos) {
    for(var i=0;i<m.length;i++){
      if ( m[i].sort && m[i].value != "" ) {
        if (m[i].value == pos) {
          var x = $x(m[i].st);
          var value = x.value;
          if (x.value == "None") {
              value = "Asc";
          }
          ret = ret == "" ? "\n order by ": ret + ", " ;
          var parts = qb_splitTableAndColumn(m[i].col);
          ret = ret + qb_makeIdentifier(parts[0]) +'.' + qb_makeIdentifier(parts[1]) + ' ' + value;
        }
      }
    }
    pos++;
  }
  return ret;
}


function qb_getGroup(){
  var d=$x('conditions').getElementsByTagName('INPUT');
  var ret="";

  for(var i=0;i<d.length;i++){
        if ( d[i].grp && d[i].checked ) {
          ret = ret == "" ? "\n group by ": ret + ", " ;
          var parts = qb_splitTableAndColumn(d[i].col);
          ret += qb_makeIdentifier(parts[0]) +'.' + qb_makeIdentifier(parts[1]);
        }
   }
   return ret;
}

/* sets up and executes savetab*/
function qb_SaveTab(pThis){
  html_ShowElement(html_MakeParent('R7170925778234838','Save_table'));
  html_ShowElement(html_MakeParent('R7099926313598093','Save_table'));
  html_TabClick(pThis,'Save_table');
  return;
}


function qb_newCondition(col,alias,func_value,func_paren,out,sort_type,sort_order,group_by,condition) {
    var c=$x("selectColumns_"+col);
    c.checked="true";
    qb_checkColumn(c);
    var f = $x(col+"_fun");
     f.value = func_value;
     f.paren = func_paren;
    var a = $x(col+"_alias");
     a.value = alias;
    var o = $x(col+"_out");
     o.checked = out == "false" ? "": "true";
    var st = $x(col+"_st");
     st.value = sort_type;
    var so = $x(col+"_so");
     so.value = sort_order;
    var g = $x(col+"_grp");
     g.checked = group_by == "false" ? "": "true";
    var con = $x(col+"_con");
     con.value = condition;
}

/*
 * qb_render.js
 * */

 var qb_tables = new Array();
 var qb_conditions = new Array();

function qb_saveQuery(pType){
  var s_title = $x("P1002_QUERY_NAME").value;
  if (isEmpty("P1002_QUERY_NAME")) {
      $x("P1002_QUERY_NAME").value = '';
      $x("P1002_QUERY_NAME").focus();
      return;
  }
  // test to be sure name is unique
  var sId = $x("P1002_QUERY_ID").value;
  if (sId == null || sId == '') {
    var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=266120031373725934',0);
    get.add('P1002_QUERY_NAME',s_title);
    var isUniq = get.get();
    if (isUniq != '0') {
      $x("htmldbMessageHolder").innerHTML = isUniq;
      return;
    }
  }
  qb_tables = new Array();
  qb_conditions = new Array();
  var lRet = qb_getQueryAttribs(pType);
  if (lRet) {
    apex.jQuery("#saveDialog").dialog("close");
    $x("htmldbMessageHolder").innerHTML = '';
    html_enableBase();
//    $x("P1002_DIS_NAME").innerHTML = $x("P1002_QUERY_NAME").value;
    html_TabClick($x("SavedSql_tab"),'SavedSQLHolder');
//    gQbFind = $x("P1002_QUERY_NAME").value;
    qb_getSavedSQL();
  }
}

function qb_saveTable(oid,cnt,top,left,tname) {
    qb_tables.push(this);
    this.object_id = oid;
    this.count = cnt;
    this.top = top;
    this.left = left;
    this.table = tname;
}

function qb_saveConditions(c,a,fv,fp,o,st,so,g,con) {
    qb_conditions.push(this);
    this.col = c;
    this.alias = a;
    this.func_value = fv;
    this.func_paren = fp;
    this.out = o;
    this.sort_type = st;
    this.sort_order = so;
    this.group_by = g;
    this.condition = con;
 }


function qb_getQueryAttribs(pType) {
  var tableDiv = document.getElementById("qbTableHolder");
  var t = tableDiv.getElementsByTagName('DIV');
  for(var i=0;i<t.length;i++){
        if ( t[i].id.substring(t[i].id.length-6) == '_thold') {
            var oid = t[i].getAttribute("htmldb:id");
            var cnt = t[i].getAttribute("htmldb:cnt");
            var tname = t[i].getAttribute("htmldb:name");
            var top = t[i].parentNode.style.top;
            var left = t[i].parentNode.style.left;
            var x = new qb_saveTable(oid,cnt,top,left,tname);
        }
  }
  if (qb_tables.length == 0) {
    var pMessage = '<div class="htmldbNotification"><ul><li>';
    pMessage = pMessage+l_noSave;
    pMessage = pMessage+'</li></ul></div>';
    $x("htmldbMessageHolder").innerHTML = pMessage;
    return false;
  }
  var d=document.getElementsByTagName('INPUT');
  for(var i=0;i<d.length;i++){
        if ( d[i].out) {
          var col = d[i].col;
          var idCol = col;
          var a = $x(idCol+"_alias");
          var alias = a.value;
          var f = $x(idCol+"_fun");
          var func_value = f.value == '' ? null : f.value;
          var func_paren = f.paren;
          var o = $x(idCol+"_out");
          var out = o.checked;
          var st = $x(idCol+"_st");
          var sort_type = st.value;
          var so = $x(idCol+"_so");
          var sort_order = so.value == '' ? null : so.value;
          var g = $x(idCol+"_grp");
          var group_by = g.checked;
          var con = $x(idCol+"_con");
          var condition = con.value == '' ? null : con.value;
          var y = new qb_saveConditions(col,alias,func_value,func_paren,out,sort_type,sort_order,group_by,condition);
        }
  }

    var sql     = $v("P1002_QUERY");
    var s_title = $v("P1002_QUERY_NAME");
    var s_desc  = $v("P1002_QUERY_DESC");
    var s_id    = $v("P1002_QUERY_ID");
    var s_tabs = qb_tables;
    var s_cons = qb_conditions;
    var s_lnks = qb_links;

  var get = new htmldb_Get(null,4500,'SAVE_QUERY',1002,null,'wwv_flow.accept');

  for(var i=0;i<s_tabs.length;i++){
        get.addParam('f01',s_tabs[i].object_id);
        get.addParam('f02',s_tabs[i].count);
        get.addParam('f03',s_tabs[i].top);
        get.addParam('f04',s_tabs[i].left);
        get.addParam('f05',s_tabs[i].table);
  }

  for(var i=0;i<s_cons.length;i++){
    get.addParam('f06',s_cons[i].col);
    get.addParam('f07',s_cons[i].alias);
    get.addParam('f08',s_cons[i].func_value);
    get.addParam('f09',s_cons[i].func_paren);
    get.addParam('f10',s_cons[i].out);
    get.addParam('f11',s_cons[i].sort_type);
    get.addParam('f12',s_cons[i].sort_order);
    get.addParam('f13',s_cons[i].group_by);
    get.addParam('f14',s_cons[i].condition);
  }

  for(var i=0;i<s_lnks.length;i++){
    get.addParam('f15',s_lnks[i].field1.id);
    get.addParam('f16',s_lnks[i].field2.id);
    get.addParam('f17',s_lnks[i].condition);
  }

    get.addParam('f18', $x('P1002_SCHEMA').value);
    get.addParam('f19', $x('P1002_QUERY_NAME').value);
    //get.addParam('f20', $x('P1002_QUERY_TYPE').value);
    get.addParam('f21', $x('P1002_QUERY_DESC').value);
    if (pType == 'SAVE'){
      get.addParam('f22', $x('P1002_QUERY_ID').value);
    }
    get.addParam('f23', $x('P1002_QUERY').value);

  var q = get.get('FULL');
   get = null;
  if ( q.indexOf('Foo') == -1) {
    $x("P1002_QUERY_ID").value = q;
    $x("P1002_OWNER").value = fUser;
  }
  return true;
}

/*
 * qb_linkObj.js
 * */

var qb_links = new Array();
var qb_zoomFactor = 1;
var qb_linkMenuNode;

function qb_link(id1,id2,condition){

for(i=qb_links.length-1;i>=0;i--){
  var col1s = qb_splitTableAndColumn(qb_links[i].field1.id);
  var col2s = qb_splitTableAndColumn(qb_links[i].field2.id);
  if (id1.id) {
    var id1s = qb_splitTableAndColumn(id1.id);
    var id2s = qb_splitTableAndColumn(id2.id);
  } else {
    var id1s = qb_splitTableAndColumn(id1);
    var id2s = qb_splitTableAndColumn(id2);
  }
  // don't allow a column to be joined to same table twice
  if (qb_links[i].field1.id == id1 && (id2s[0] == col2s[0])){
    var img = $x("dragimg");
    img.style.display="none";
    qb_colDrag = false;
    qb_begDrag = '';
    return;
  }
  if (qb_links[i].field1.id == id2 && (id1s[0] == col2s[0])){
    var img = $x("dragimg");
    img.style.display="none";
    qb_colDrag = false;
    qb_begDrag = '';
    return;
  }
  if (qb_links[i].field2.id == id1 && (id2s[0] == col1s[0])){
    var img = $x("dragimg");
    img.style.display="none";
    qb_colDrag = false;
    qb_begDrag = '';
    return;
  }
  if (qb_links[i].field2.id == id2 && (id1s[0] == col1s[0])){
    var img = $x("dragimg");
    img.style.display="none";
    qb_colDrag = false;
    qb_begDrag = '';
    return;
  }


 // don't allow multiple joins of same type
 //if (qb_links[i].field1.id == id1 && qb_links[i].field2.id == id2){
 //   return;
// }
// if (qb_links[i].field2.id == id1 && qb_links[i].field1.id == id2){
//    return;
// }
}
  //
  // push reference to the array
  //
    qb_links.push(this);
  //
  // var declarations
  //
  this.id  = "link"+(new Date()).getTime();
  this.id1 = $x(id1);
  this.id2 = $x(id2);
  this.field1 = this.id1;
  this.field2 = this.id2;
  this.linkObj1;
  this.linkObj2;
  this.linkObj3;

  this.col1;      // need to get based on id
  this.col2;      // need to get based on id
  this.condition = condition == null ? "E" : condition;

  //
  // Declare methods
  //
  this.create  = qb_link_create;
  this.redim   = qb_link_redim;
  this.setTip  = qb_link_setTip;
  this.getTip  = qb_link_tip;
  this.updateTip  = qb_link_updateTip;

  //
  // Create the link
  //
  this.create();
  this.setTip();
  this.updateTip();
  this.redim();
}
function qb_link_tip(){
 return this.field1.id + ( this.condition == 'L' ? '(+)':'') + "="
                    + this.field2.id+ ( this.condition == 'R' ? '(+)':'');
}


function qb_link_updateTip(){
  var tip = this.getTip();
  this.linkObj2.tip=tip;
  this.linkObj1.tip=tip;
  this.linkObj3.tip=tip;
}


function qb_link_create(){
    var tmp;
  var holder = $x('qbLinkHolder');
    this.linkObj2 = document.createElement("DIV");
    this.linkObj2.id = this.id;
    this.linkObj2.menuId=this.linkObj2.id;
    this.linkObj2.arrayElement=this;
    this.linkObj2.vert = 0;
    this.linkObj2.relLeft = 0;
    this.linkObj2.style.position = "absolute";
    this.linkObj2.style.overflow = "hidden";
    this.linkObj2.style.zIndex = 20000;

    this.linkObj2.innerHTML="&nbsp;";

    tmp = document.createElement("DIV");
    tmp.style.position = "absolute";
    tmp.style.overflow = "hidden";
    tmp.menuId=this.linkObj2.id;
    tmp.arrayElement=this;
    tmp.style.left = 2 + "px";
    tmp.style.top = 0 + "px";
    tmp.style.width = 2 + "px";
    tmp.style.height = "100%";
    tmp.style.zIndex = 20000;
    tmp.style.backgroundColor = "#cfdccf";
    this.linkObj2.appendChild(tmp);


    this.linkObj1 = document.createElement("DIV");
    this.linkObj1.id = this.linkObj2.id;//+"divh1";
    this.linkObj1.menuId=this.linkObj2.id;
    this.linkObj1.arrayElement=this;
    this.linkObj1.style.position = "absolute";
    this.linkObj1.style.overflow = "hidden";
    this.linkObj1.style.zIndex = 20000;
    this.linkObj1.innerHTML="<br />";

    tmp = document.createElement("DIV");
    tmp.style.position = "absolute";
    tmp.menuId=this.linkObj2.id;
    tmp.arrayElement=this;
    tmp.style.overflow = "hidden";
    tmp.style.left = 0 + "px";
    tmp.style.top = 2 + "px";
    tmp.style.width = "100%";
    tmp.style.height = 2 + "px";
    tmp.style.zIndex = 20000;
    this.linkObj1.appendChild(tmp);
    tmp.style.backgroundColor = "#cfdccf";

    this.linkObj1.vert = 1;
    this.linkObj1.onmousedown="lineMouseDown(event);";
    this.linkObj1.onmouseup="lineMouseUp(event);";

    this.linkObj3 = document.createElement("DIV");
    this.linkObj3.id = this.linkObj2.id;//+"divh2";
    this.linkObj3.menuId=this.linkObj3.id;
    this.linkObj3.arrayElement=this;
    this.linkObj3.style.position = "absolute";
    this.linkObj3.style.overflow = "hidden";
    this.linkObj3.style.zIndex = 20000;
    this.linkObj3.innerHTML="&nbsp;";

    tmp = document.createElement("DIV");
    tmp.style.position = "absolute";
    tmp.style.overflow = "hidden";
    tmp.menuId=this.linkObj2.id;
    tmp.arrayElement=this;
    tmp.style.left = 0 + "px";
    tmp.style.top = 2 + "px";
    tmp.style.width = "100%";
    tmp.style.height = 2 + "px";
    tmp.style.zIndex = 20000;
    tmp.style.backgroundColor = "#cfdccf";

    this.linkObj3.appendChild(tmp);



    holder.appendChild(this.linkObj1);
    holder.appendChild(this.linkObj2);
    holder.appendChild(this.linkObj3);


    this.linkObj1.vert = 1;
    this.linkObj2.vert = 0;
    this.linkObj3.vert = 1;

    if (document.all) {
      this.linkObj1.style.cursor = "hand";//"N-resize";
      this.linkObj2.style.cursor = "hand";//"E-resize";  // middle
      this.linkObj3.style.cursor = "hand";//"N-resize";
    } else {
      this.linkObj1.style.cursor = "pointer";//"N-resize";
      this.linkObj2.style.cursor = "pointer";//"E-resize";  // middle
      this.linkObj3.style.cursor = "pointer";//"N-resize";
    }

    this.linkObj1.className = "links1";
    this.linkObj2.className = "links";
    this.linkObj3.className = "links1";
    sqlQueryRebuild = true;
    qb_validateLinks();
}

function qb_link_onmouseover(evt){
 var evt = (evt) ? evt : ((window.event) ? event : null);
 var target = evt.target ? evt.target : evt.srcElement;
 //alert('hi');
 qb_linkMenuNode=target.menuId;
 if ( target.tip != null )
 toolTip_enable(evt,target,target.tip);
}

function qb_link_onclick(evt){
 var evt = (evt) ? evt : ((window.event) ? event : null);
 var target = evt.target ? evt.target : evt.srcElement;
 qb_linkMenuNode=target.menuId;
 qb_checkOuterLink();
 qb_OpenLinkMenu(evt,target,'defaultLinkMenu');
}

function qb_link_setTip(){
    try {
        this.linkObj1.attachEvent("onmouseover",qb_link_onmouseover);
        this.linkObj2.attachEvent("onmouseover",qb_link_onmouseover);
        this.linkObj3.attachEvent("onmouseover",qb_link_onmouseover);
        this.linkObj1.attachEvent("onclick",qb_link_onclick);
        this.linkObj2.attachEvent("onclick",qb_link_onclick);
        this.linkObj3.attachEvent("onclick",qb_link_onclick);
    } catch (ex) {
        // must not be in IE
    }

    try {
        this.linkObj1.setAttribute("onmouseover","qb_link_onmouseover(event)");
        this.linkObj2.setAttribute("onmouseover","qb_link_onmouseover(event)");
        this.linkObj3.setAttribute("onmouseover","qb_link_onmouseover(event)");
        this.linkObj1.setAttribute("onclick","qb_link_onclick(event)");
        this.linkObj2.setAttribute("onclick","qb_link_onclick(event)");
        this.linkObj3.setAttribute("onclick","qb_link_onclick(event)");
    } catch(ex){
       // must not be in Mozilla
    }

}

function qb_OpenLinkMenu(evt,pThis,pThat){
  evt  = (evt) ? evt : ((window.event) ? event : null);
  var evtX = evt.pageX ? evt.pageX : evt.clientX ;
  var evtY = evt.pageY ? evt.pageY : evt.clientY ;
  dhtml_SingeMenuOpen(pThis,pThat,'Set',evtX,evtY);
  $x('defaultLinkMenu').style.zIndex = 200001;
  return;
}

function qb_link_redim() {
    var o1 = qb_cascadeUpUntil(this.field1,"TR");
    var o2 = qb_cascadeUpUntil(this.field2,"TR");
    var o1_holder = qb_cascadeUpUntil(o1,"DIV");
    var o2_holder = qb_cascadeUpUntil(o2,"DIV");

    if (  o1_holder.style.display == 'none' ||
          ( o1_holder.scrollHeight && o1_holder.scrollHeight > 250)
        ) {
        o1 = qb_cascadeUpUntil(o1,"DIV");
        o1 = qb_cascadeUpUntil(o1,"DIV");
          }

    if (  o2_holder.style.display == 'none' ||
          ( o2_holder.scrollHeight &&  o2_holder.scrollHeight > 250)
        ) {
        o2 = qb_cascadeUpUntil(o2,"DIV");
        o2 = qb_cascadeUpUntil(o2,"DIV");
          }

    var l1=parseInt(findPosX(o1));
    var t1=parseInt(findPosY(o1));

    var w1=o1.offsetWidth;
    var h1=o1.offsetHeight;
    var r1=l1 + w1;

    var l2=parseInt(findPosX(o2));
    var t2=parseInt(findPosY(o2));
    var w2=o2.offsetWidth;
    var h2=o2.offsetHeight;
    var r2=l2 + w2;


    this.linkObj1.style.top = (t1 + 10) + "px";
    this.linkObj3.style.top = (t2 + 10) + "px";

      if(this.linkObj2.relLeft>0){
        y1 = this.linkObj2.relLeft;
      } else {
          if (r1<l2) {
            y1 = parseInt((l2+r1)/2);
          } else if (r2<l1) {
            y1 = parseInt((l1+r2)/2);
          } else if (r1<=r2) {
            y1 = r2+20;
          } else {
            y1 = l2-20;
          }
      }
    this.linkObj2.style.left = (y1-2) + "px";
      this.linkObj2.style.height=(qb_abs1((t1+23)-(t2+23))) + "px";

      if (y1<l1) {
        this.linkObj1.style.left=y1 + "px";
        this.linkObj1.style.width=(l1-y1) + "px";
      } else if (y1>r1) {
        this.linkObj1.style.left=r1 + "px";
        this.linkObj1.style.width=(y1-r1+1) + "px";
      } else {
        this.linkObj1.style.left=y1 + "px";
        this.linkObj1.style.width=1 + "px";
      }

      if (y1<l2) {
        this.linkObj3.style.left=y1 + "px";
        this.linkObj3.style.width=(l2-y1) + "px";
      } else if (y1>r2) {
        this.linkObj3.style.left=r2 + "px";
        this.linkObj3.style.width=(y1-r2+1) + "px";
      } else {
        this.linkObj3.style.left=y1 + "px";
        this.linkObj3.style.width=1 + "px";

      }
        var pt1 = parseInt(this.linkObj1.style.top);
        var pt2 = parseInt(this.linkObj3.style.top);
    this.linkObj2.style.top=(((pt1-pt2)<0)?pt1+2:pt2+2) + "px";
      return false;
    }

//
// End of Object
//

function qb_outer(w){
  var l_link =document.getElementById(qb_linkMenuNode);
  l_link.arrayElement.condition=w;
  l_link.arrayElement.updateTip();
  qb_validateLinks();
  html_HideElement('defaultLinkMenu');
  qb_genSql();
}

function qb_delLink(l){
    var tmp = l.arrayElement;
    var col1j = $x(tmp.field1.id+'_jbox');
    var col2j = $x(tmp.field2.id+'_jbox');
    if (col1j) {
     col1j.style.backgroundColor= "";
     col1j.innerHTML = '&nbsp;&nbsp;';
    }
    if (col2j){
     col2j.innerHTML = '&nbsp;&nbsp;';
     col2j.style.backgroundColor= "";
    }
    tmp.field1.style.backgroundColor= "";
    tmp.field2.style.backgroundColor= "";
    tmp.linkObj1.parentNode.removeChild(tmp.linkObj1);
    tmp.linkObj2.parentNode.removeChild(tmp.linkObj2);
    tmp.linkObj3.parentNode.removeChild(tmp.linkObj3);
    qb_links = qb_delArrElement(qb_links,l);
    qb_validateLinks();
    html_HideElement(g_Single_Menu);
    return
}

function qb_delLinkClick(){
    var l_link =document.getElementById(qb_linkMenuNode);
    qb_delLink(l_link);
    qb_validateLinks();
    qb_validateLinks();
    app_AppMenuMultiClose();
    qb_genSql();
}

function qb_validateLinks(){
 var i;
 for(i=qb_links.length-1;i>=0;i--){
     var col1j = $x(qb_links[i].field1.id+'_jbox');
     var col2j = $x(qb_links[i].field2.id+'_jbox');
     if (col1j)
        col1j.innerHTML = '&nbsp;';
     if (col2j)
         col2j.innerHTML = '&nbsp;';
 }

 for(i=qb_links.length-1;i>=0;i--){
   if (qb_links[i]) {
     var col1 = $x(qb_links[i].field1.id);
     var col1j = $x(qb_links[i].field1.id+'_jbox');
     var col2 = $x(qb_links[i].field2.id);
     var col2j = $x(qb_links[i].field2.id+'_jbox');

    if(qb_links[i] && ( ! col1 || ! col2 ) ) {
        qb_delLink(qb_links[i].linkObj2);
     } else {
       col1.style.backgroundColor= "#DDDDDD";
       col2.style.backgroundColor= "#DDDDDD";
       if (qb_links[i].condition == 'L') {
         col1j.innerHTML = col1j.innerHTML+'+';
         col2j.innerHTML = col2j.innerHTML+'';
       } else if (qb_links[i].condition == 'R') {
         col1j.innerHTML = col1j.innerHTML+'';
         col2j.innerHTML = col2j.innerHTML+'+';
       } else {
         col1j.innerHTML = col1j.innerHTML+'';
         col2j.innerHTML = col2j.innerHTML+'';
       }

       if (col1j.innerHTML.indexOf('+') > -1){
          col1j.style.backgroundColor= "";
       } else {
          col1j.style.backgroundColor= "#DDDDDD";
       }

       if (col2j.innerHTML.indexOf('+') > -1){
          col2j.style.backgroundColor= "";
       } else {
          col2j.style.backgroundColor= "#DDDDDD";
       }

     }
     if ( col1 && !col2 ){
        col1.style.backgroundColor= "";
        col1j.style.backgroundColor= "";
     }
     if ( !col1 && col2 ){
        col2.style.backgroundColor= "";
        col2j.style.backgroundColor= "";
     }
   }
  }
}


function qb_abs1(a){
        return (a<0)?-a:(a>0?a:1);
}

function qb_checkOuterLink() {
  var menu = $x("defaultLinkMenu");
  var removeOlink = menu.childNodes[0].childNodes[3];
  var i;
  var link;
  for(i=qb_links.length-1;i>=0;i--){
     link = qb_links[i];
     if (qb_links[i].id == qb_linkMenuNode && (qb_links[i].condition == 'R' || qb_links[i].condition == 'L' )) {
      // show remove outer join
      removeOlink.style.display="block";
     } else {
     // hide remove outer join
      removeOlink.style.display="none";
     }
  }
}

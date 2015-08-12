var oldObj = '';
var curSid = false;
var mCurObj = false;
var mCurDiv = false;
var mLastPage = false;

function mon_cascadeUpUntil(n,tag){
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

function mon_HighlightRow(e) {
   pThis = html_GetTarget(e);
   var monTr = pThis ? mon_cascadeUpUntil(pThis,'TR') : 
                       mon_cascadeUpUntil(html_GetElement('session_'+curSid),'TR');
   if (oldObj){html_RowHighlight(oldObj,'#EFEFEF')}
   oldObj = monTr;
   if(monTr != html_CascadeUpTill('r'+curSid,'TR')){
      null;
      //html_RowHighlight(monTr,'#CCCCCC');
   }else{
      oldObj = false;
   }
}

function mon_SetSid(sid,pThis) {
   //if(curSid){html_RowHighlight(html_CascadeUpTill('r'+sid,'TR'),'')}
   if(sid){
      if ( curSid) 
        html_RowHighlight(html_CascadeUpTill('r'+curSid,'TR'),'#EFEFEF');
      //html_RowHighlight(html_CascadeUpTill('r'+sid,'TR'),'#EFEFEF');
      curSid = sid
   }
   if(curSid){
    html_RowHighlight(html_CascadeUpTill('r'+sid,'TR'),'#CFDCCF');
    //if(pThis){html_RowHighlight(html_CascadeUpTill('r'+sid,'TR'),'#CFDCCF');}
    if(!mCurObj){mCurObj = html_GetElement('overview_tab')}
    if(!mCurDiv){mCurDiv = 'overviewHolder'}
    if(!mLastPage){mLastPage = '530'}
    mon_tab(mCurObj,mCurDiv,mLastPage);
   }
   oldObj = false;
}

function mon_tab(pThis,pDiv,pPage){
   mCurObj = pThis;
   mCurDiv = pDiv;
   mLastPage = pPage;
   var get = new htmldb_Get(pDiv,4500,null,pPage);
   get.add('P520_SID',curSid);
    var results = get.get();
    var holder = html_GetElement(pDiv);
        holder.innerHTML = results;
    html_GetElement(pDiv).innerHTML = results;
    results = null;
    get = null;
 // flip the tab once it's populated
    html_TabClick(pThis,pDiv);
}    

function mon_Page_Init(){
  mon_InitTable();
  mon_Refresh();
  mon_initSlide();
}

function mon_InitTable(){
  var lTable = html_GetElement('R135729317864264484');
  var l_Cells = lTable.getElementsByTagName('TD');
  for (var i=0; i<l_Cells.length; i++){
    l_Cells[i].onmouseover = mon_HighlightRow;
  }
  if(curSid){html_RowHighlight(html_CascadeUpTill('r'+curSid,'TR'),'#CFDCCF');
  }
}

function mon_Refresh(){
    var lRefresh = html_GetElement('P520_REFRESH').value;
    setTimeout("mon_Refresh()",lRefresh * 1000);
    if(html_SelectValue('P520_REFRESH_YN') == 'Y'){
      html_PPR_Report_Page (null,'R135729317864264484',html_GetElement('R135729317864264484').getAttribute('href'),'<div class="htmldbTiny">'+ timestamp() +'</div>')
      mon_SetSid();
      mon_InitTable();
    }
}

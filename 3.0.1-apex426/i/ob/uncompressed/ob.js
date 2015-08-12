/* Global Vars*/
var gCurrentNode = null;
var gObjectType = null;
var vFrame = false;
var vSearchObject = false;
var vCurrentTypeObject = false;
var vCurrentId = false;
var vObjectsSlider = false;
var vObjectsTitle = false;
var vObjectsDetail = false;
var vRollOver = false;
var vCurrentAppArea = false;
var vLastKeyTime=false;
var gSideBar=false;
var gSpinner$ = null;
var gProgressActive = false;

// capitalizes first letter or string
// replaces '_' with ' ' and caplitalizes char after '_'
function initCap(string) {
	var rString = string.replace('_',' ');
	rString = rString.charAt(0).toUpperCase() + rString.substring(1).toLowerCase();
	var pos = rString.indexOf(' ');
	if (pos > -1){
		rString = rString.substring(0,pos+1)+rString.charAt(pos+1).toUpperCase() + rString.substring(pos+2).toLowerCase();
	}
	return rString;
}

/* populates all global page items for use in other scripts */
function ob_initObject(){
  if (!vFrame){vFrame = $x('dbaseContent');}
  if (!vSearchObject){vSearchObject = $x('OB_FIND');}
  if (!vObjectsSlider){vObjectsSlider = $x('ob_ObjectsSlider');}
  if (!vObjectsDetail){vObjectsDetail = $x('ob_ObjectsDetail');}
  if (!vCurrentId){vCurrentId = $x('OB_CURRENT_ITEMID');}
  if (!vCurrentTypeObject){vCurrentTypeObject = $x('obObjectSelect');}
  if (!vRollOver){vRollOver = $x("dbaseFloater");}
  if (!gSideBar){gSideBar= new  ObjectList('obObjectSelect','OB_FIND','ob_ObjectsSlider','OB_SCHEMA','ob_ObjectsDetail') }
  return;
}


function ob_GroupObject(pType,pId,pFocus,pFromFrame){
  if (html_SelectValue('obObjectSelect') != pType){
    ob_initObject();
    gSideBar.reload(pType,pId);
  }
  return;
}

function ob_Object(pThis,pFocus,pFromFrame){
	ob_initObject();
	if(!pFromFrame){
		ob_Navigate(pThis);
	}
	return;
}

function o(pId){
	gSideBar.setCurrent(pId);
    if ( !gProgressActive ) {
        gProgressActive = true;
        apex.util.delayLinger.start( "iframeLoad", function() {
            gSpinner$ = apex.util.showSpinner();
        } );
    }
    ob_Object(pId, null, true);// don't navigate a second time
}

function ob_CreateObject(pType){
    var iType = null;
    if (pType == 'TABLE') {
      iType = 'DEMO_APPLICATION.TABLE';
    } else if (pType == 'VIEW') {
      iType = 'LAYOUT.T_VIEW_BUTTON';
    } else if (pType == 'INDEX') {
      iType = 'INDEX_NOUN';
    } else if (pType == 'SEQUENCE') {
      iType = 'DEMO_APPLICATION.SEQUENCE';
    } else if (pType == 'TYPE') {
      iType = 'PAGE_REGION.TREE_TYPE';
    } else if (pType == 'PACKAGE') {
      iType = 'DEMO_APPLICATION.PACKAGE';
    } else if (pType == 'PROCEDURE') {
      iType = 'SQL_INJECT_PROCEDURE';
    } else if (pType == 'FUNCTION') {
      iType = '4500_1002_QB_CLONE_FUNCTION';
    } else if (pType == 'TRIGGER') {
      iType = 'DEMO_APPLICATION.TRIGGER';
    } else if (pType == 'DATABASE_LINK') {
      iType = 'DATABASE_LINK';
    } else if (pType == 'MATERIALIZED_LINK') {
      iType = 'MATERIALIZED_VIEW';
    } else if (pType == 'SYNONYM') {
      iType = 'SYNONYM_NOUN';
    }

    var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=251509908846066406',0);
	get.add('SYSTEM_MESSAGE', iType );
    var TransType = get.get();
    if(!pType){
		pType = vCurrentTypeObject.value;
	}
    vObjectsDetail.innerHTML = initCap(TransType);
    ob_IframeUrl("f?p=4500:" + pType + "_CREATE:" + $x('pInstance').value+':::602,604,145,149,48,98,107,100,57,77,94,135,117,118,131,186,187,120,124,125,121,122,123,97,99,3,84,182,183,91,TBL_WIZ_COLUMNS,TBL_WIZ_FKS,TBL_WIZ_CONS:::');
    ob_MenuDrop();
    return;
}

function ob_Iframe_Init(e){
    var l_newDiv = document.createElement('DIV');
    l_newDiv.className = "htmldbInvisDiv";
    l_newDiv.id = "htmldbDisablePage";
    l_newDiv.style.width = "100%";
    l_newDiv.style.height = "100%";
    l_newDiv.onclick = ob_MenuDrop;
    l_newDiv.style.position="absolute";
    l_newDiv.style.top="0px";
    l_newDiv.style.left="0px";
	document.body.appendChild(l_newDiv)
}

function ob_MenuDrop(e){
	html_enableBase();
	dhtml_DocMenuSingleCheck(e,true);
}

function ob_IframeUrl(pSrc){
    vFrame.src =  pSrc;
    return;
}

function ob_Reset(pId){
  if(pId){
    top.ob_Object(top.$x(pId),null,false);
  }
  if (gLastTab) {
     top.ob_IframeUrl(gLastTab);
     top.gSideBar.setHeader();
     top.gSideBar.highlight();
  } else {
     top.ob_IframeUrl("f?p=4500:BLANK_IFRAME:"+ $x('pInstance').value);
     top.gSideBar.setHeader(" ");
  }
  top.$x_Show('obLeftColumn');
  return;

}

function ob_createClick(){
  ob_IframeUrl="f?p=4500:81:"+ $x('pInstance').value;
}

function ob_Navigate(pThis) {
	this.DomEl = $x(pThis);
    var page=null;
    if (!gLastTab){
       page = html_SelectValue('obObjectSelect')+'_DETAIL';
    }else{
      page = gLastTab.split(":")[1];
    }
    page = page.replace('PACKAGE','FUNCTION');
    var url='f?p=4500:'+page+':'+$x('pInstance').value+':GETOBJECT_TREE:NO::OB_OBJECT_NAME,OBJECT_ID:'+pThis+','+pThis+':';
    var lBody = window.frames.dbaseContent.document.getElementById('htmldbPage');
    if (lBody){
		var http = new htmldb_Get(lBody,null,null,null,null,'f',url.substring(2));
		http.get(null,'<div id="htmldbPage">','<a name="END"></a>');
		get = null;
    }else{
		vFrame.src = url;
		}
    gLastTab=url;
}

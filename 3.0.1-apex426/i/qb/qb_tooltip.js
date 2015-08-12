var offsetfromcursorX=12 //Customize x offset of tooltip
var offsetfromcursorY=10 //Customize y offset of tooltip

var offsetdivfrompointerX=10 //Customize x offset of tooltip DIV relative to pointer image
var offsetdivfrompointerY=14 //Customize y offset of tooltip DIV relative to pointer image. Tip: Set it to (height_of_pointer_image-1).

var ie=false;
var ns6=false;

var tt_enabletip=false
var tt_tipobj=false;
var tt_pointerobj=false;

function initToolTip(){
    
    if (!tt_tipobj) {
        tt_tipobj=document.getElementById("dhtmltooltip");
        var mytest = typeof(tt_tipobj);
        if (tt_tipobj == null || typeof(tt_tipobj) != 'object'){
              tt_tipobj = document.createElement('DIV');
              tt_tipobj.id="dhtmltooltip";
              tt_tipobj.className="qbTableData";
              document.body.appendChild(tt_tipobj);
        }
     }
     if (!tt_pointerobj) {
        tt_pointerobj=document.getElementById("dhtmlpointer");
        if (tt_pointerobj == null ||  typeof(tt_pointerobj) != 'object' ) {
               tt_pointerobj = document.createElement('IMG');
               tt_pointerobj.id="dhtmlpointer";
               tt_pointerobj.src="/i/arrow2.gif";
              document.body.appendChild(tt_pointerobj );   
        }
     }
    if(!ie)
        ie=document.all;
    if(!ns6)
        ns6=document.getElementById && !document.all;
    var xx = typeof(window['qb_init']);
    if ( typeof(window['qb_init']) == 'undefined' ) 
       document.onmousemove = positiontip;
}

function ietruebody(){
    return false;
    //(document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}



function ddrivetip(thetext, thewidth, thecolor){
    initToolTip();
    var f= tt_tipobj;
    if (ns6||ie){
        tt_tipobj.innerHTML=thetext;
        if (typeof thewidth!="undefined") 
            tt_tipobj.style.width=thewidth+"px"
        /*
        else
            tt_tipobj.style.width=tt_tipobj.offsetWidth+"px"
        */        
        if (typeof thecolor!="undefined" && thecolor!="") 
            tt_tipobj.style.backgroundColor=thecolor
        tt_enabletip=true
        return false
    }
}

function positiontip(evt){
    initToolTip();
    if (tt_enabletip){
        var nondefaultpos=false
        evt = (evt) ? evt : ((window.event) ? event : null);
	    //var target = evt.target ? evt.target : evt.srcElement;
	    var curX = evt.clientX;
	    var curY = evt.clientY;
        //var curX=findPosXa(target);// (ns6)?e.pageX : event.x+ietruebody().scrollLeft;
        //var curY=findPosYa(target);//ns6)?e.pageY : event.y+ietruebody().scrollTop;
        //cDebug("Tip:"+curX+","+curY);
        //Find out how close the mouse is to the corner of the window
        var winwidth=ie&&!window.opera? ietruebody().clientWidth : window.innerWidth-20
        var winheight=ie&&!window.opera? ietruebody().clientHeight : window.innerHeight-20
        
        var rightedge=ie&&!window.opera? winwidth-evt.clientX-offsetfromcursorX : winwidth-evt.clientX-offsetfromcursorX
        var bottomedge=ie&&!window.opera? winheight-evt.clientY-offsetfromcursorY : winheight-evt.clientY-offsetfromcursorY
        
        var leftedge=(offsetfromcursorX<0)? offsetfromcursorX*(-1) : -1000
        
        //if the horizontal distance isn't enough to accomodate the width of the context menu
        var offsetW = tt_tipobj.offsetWidth?tt_tipobj.offsetWidth:150;
        if (rightedge<offsetW){
            //move the horizontal position of the menu to the left by it's width
            tt_tipobj.style.left=curX-offsetW+"px"
            nondefaultpos=true
        }  else if (curX<leftedge)
                tt_tipobj.style.left="5px"
        else{
            //position the horizontal position of the menu where the mouse is positioned
            tt_tipobj.style.left=curX ? curX+offsetfromcursorX-offsetdivfrompointerX+"px" : "0px";
            tt_pointerobj.style.left=curX ? curX+offsetfromcursorX+"px": "0px";
        }
        
        //same concept with the vertical position
        var offsetH = tt_tipobj.offsetHeight?tt_tipobj.offsetHeight:1;
        if (bottomedge<offsetH){
            tt_tipobj.style.top=curY ? curY-offsetH-offsetfromcursorY+"px" : "0px";
            nondefaultpos=true
          } else{
            tt_tipobj.style.top=curY ? curY+offsetfromcursorY+offsetdivfrompointerY+"px": "0px";
            tt_pointerobj.style.top=curY ? curY+offsetfromcursorY+"px": "0px";
        }
        tt_tipobj.style.visibility="visible"
        tt_tipobj.style.zIndex=2001;
        tt_pointerobj.style.zIndex=2001;
        if (!nondefaultpos)
            tt_pointerobj.style.visibility="visible"
        else
            tt_pointerobj.style.visibility="hidden"
    }
}

function hideddrivetip(){
    initToolTip();
    if (ns6||ie){
        tt_enabletip=false
        tt_tipobj.style.visibility="hidden"
        tt_pointerobj.style.visibility="hidden"
       // tt_tipobj.style.left="-1000px"
        tt_tipobj.style.backgroundColor=''
        tt_tipobj.style.width=''
        tt_tipobj.innerHTML='';   
    }
}

//document.onmousemove=positiontip



function tt_help(itemId){
     var url = 'p=4200:0::APPLICATION_PROCESS=gethelp:::P25_ITEM_ID:'+itemId;
     var x = data_getData(url);
     ddrivetip('<span class="tiny" style="white-space:wrap">'+x+'</span>');
     window.status=x;
}

function tt_closeHelp(){
   hideddrivetip();
   window.status="";
}
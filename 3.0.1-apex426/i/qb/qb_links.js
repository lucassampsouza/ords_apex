var qb_links = new Array();
var qb_zoomFactor = 1;
var qb_linkMenuNode;

 function qb_newLink(div1, div2, x1, x2, card1, card2, field1, field2, restrict){
	var linkObj2 = document.createElement("DIV");
	linkObj2.id = "link"+(new Date()).getTime()+qb_links.length;
	linkObj2.vert = 0;
	linkObj2.relLeft = 0;
	linkObj2.style.position = "absolute";
	linkObj2.style.overflow = "hidden";
	linkObj2.style.zIndex = 0;
	
	tmp = document.createElement("DIV");
	tmp.style.position = "absolute";
	tmp.style.overflow = "hidden";
	tmp.style.left = 2;
	tmp.style.top = 0;
	tmp.style.width = 1;
	tmp.style.height = "100%";
	tmp.style.zIndex = 0;
	linkObj2.appendChild(tmp);
	if(restrict!=0){
		tmp.style.backgroundColor = "#CC0000";
	} else {
		tmp.style.backgroundColor = "#00CC00";
	}

	var linkObj1 = document.createElement("DIV");
	linkObj1.card = card1;
	linkObj2.card1 = card1;
	linkObj2.field1 = field1;
	linkObj1.o=div1.id;
	linkObj2.o1=div1.id;
	linkObj1.id = linkObj2.id+"divh1";
	linkObj1.style.position = "absolute";
	linkObj1.style.overflow = "hidden";
	linkObj1.style.zIndex = 0;
	tmp = document.createElement("DIV");
	tmp.style.position = "absolute";
	tmp.style.overflow = "hidden";
	tmp.style.left = 0;
	tmp.style.top = 2;
	tmp.style.width = "100%";
	tmp.style.height = 1;
	tmp.style.zIndex = 0;
	linkObj1.appendChild(tmp);
	if(restrict!=0){
		tmp.style.backgroundColor = "#CC0000";
	} else {
		tmp.style.backgroundColor = "#00CC00";
	}
	linkObj1.vert = 1;
	linkObj1.onmousedown="lineMouseDown(event);";
	linkObj1.onmouseup="lineMouseUp(event);";
   
	var linkObj3 = document.createElement("DIV");
	linkObj3.card = card2;
	linkObj2.card2 = card2;
	linkObj2.field2 = field2;
	linkObj3.o=div2.id;
	linkObj2.o2=div2.id;
	linkObj3.id = linkObj2.id+"divh2";
	linkObj3.style.position = "absolute";
	linkObj3.style.overflow = "hidden";
	linkObj3.style.zIndex = 0;
	tmp = document.createElement("DIV");
	tmp.style.position = "absolute";
	tmp.style.overflow = "hidden";
	tmp.style.left = 0;
	tmp.style.top = 2;
	tmp.style.width = "100%";
	tmp.style.height = 1;
	tmp.style.zIndex = 0;
	linkObj3.appendChild(tmp);
	if(restrict!=0){
		tmp.style.backgroundColor = "#CC0000";
	} else {
		tmp.style.backgroundColor = "#00CC00";
	}

	var linkObj4 = document.createElement("DIV");
	linkObj4.id = linkObj2.id+"el1";
	linkObj4.style.position = "absolute";
	linkObj4.style.overflow = "hidden";// link name
	linkObj4.className = "relname";
	linkObj4.style.zIndex = 0;
	
    // create link menus
    /*
    var defaultMenu = document.getElementById("defaultLinkMenu");
	var menu1 =    document.createElement("DIV"); 
	var menu2 =    document.createElement("DIV");
	menu1.innerHTML = defaultMenu.innerHTML;
    menu2.innerHTML = defaultMenu.innerHTML;
    menu1.id=linkObj2.id+"mnu1";
    menu2.id=linkObj2.id+"mnu2";
    */
    
    /*
        var infoIcon2 = qb_toolTipImg("/i/infoicon_status_gray.gif",
                                  field2.substring(0,field2.length-7),
                                   "linkMenuNode='"+linkObj4.id+"';app_AppMenuMultiOpenRight(this,'defaultLinkMenu')");
	    
    linkObj4.appendChild(infoIcon2); // append link menu
    */
    //linkObj4.appendChild(menu1); // append link menu
    
    
	//linkObj4.innerHTML="<img src=\"/i/infoicon_status_gray.gif\" onclick=\"app_AppMenuMultiOpenRight(this,"+menu1.id+"\");\" onmouseover=\"ddrivetip('"+field2.substring(0,field2.length-7)+"');\" onmouseout=\"hideddrivetip();\">";
    	//linkObj4.style.backgroundColor = "#AAFFFF";
	
	
	var linkObj5 = document.createElement("DIV");
	linkObj5.id = linkObj2.id+"el2";
	linkObj5.style.position = "absolute";
	linkObj5.style.overflow = "hidden"; // link name
	linkObj5.className = "relname";
	linkObj5.style.zIndex = 0;
    

//	linkObj5.innerHTML="<img src=\"/i/infoicon_status_gray.gif\"  onclick=\"app_AppMenuMultiOpenRight(this,"+menu2.id+"\");\" onmouseover=\"ddrivetip('"+field1.substring(0,field1.length-7)+"');\" onmouseout=\"hideddrivetip();\">";

    /*
    var infoIcon1 = qb_toolTipImg("/i/infoicon_status_gray.gif",
                                  field1.substring(0,field1.length-7),
                                  "linkMenuNode='"+linkObj5.id+"';app_AppMenuMultiOpenRight(this,'defaultLinkMenu')");

    linkObj5.appendChild(infoIcon1); // append icon
    */
    //linkObj5.appendChild(menu2); // append link menu

    var tip = field1+"="+field2;
    
    linkObj1.setAttribute("onmouseover","qb_linkMenuNode='"+linkObj5.id+"';ddrivetip('"+tip+"')");    
    linkObj1.setAttribute("onmouseout","hideddrivetip()");	
    linkObj1.setAttribute("onclick","qb_linkMenuNode='"+linkObj5.id+"';app_AppMenuMultiOpenRight(this,'defaultLinkMenu')");

    linkObj2.setAttribute("onmouseover","qb_linkMenuNode='"+linkObj5.id+"';ddrivetip('"+tip+"')");    
    linkObj2.setAttribute("onmouseout","hideddrivetip()");	
    linkObj2.setAttribute("onclick","qb_linkMenuNode='"+linkObj5.id+"';app_AppMenuMultiOpenRight(this,'defaultLinkMenu')");
    
    linkObj3.setAttribute("onmouseover","qb_linkMenuNode='"+linkObj5.id+"';ddrivetip('"+tip+"')");    
    linkObj3.setAttribute("onmouseout","hideddrivetip()");	
    linkObj3.setAttribute("onclick","qb_linkMenuNode='"+linkObj5.id+"';app_AppMenuMultiOpenRight(this,'defaultLinkMenu')");
  

	//linkObj5.style.backgroundColor = "#AAFFFF";
    var holder = document.getElementById('qbLinkHolder');
	holder.appendChild(linkObj1);
	holder.appendChild(linkObj2);
	holder.appendChild(linkObj3);
	holder.appendChild(linkObj4);
	holder.appendChild(linkObj5);
	
	linkObj2.restrict = restrict;
	qb_links.push(linkObj2);

	linkObj1.relTop = 23*qb_zoomFactor+13*qb_zoomFactor*x1;
   		
	linkObj3.relTop = 23*qb_zoomFactor+13*qb_zoomFactor*x2;

	qb_redim(linkObj2, 1);
	
	/*
	linkObj1.onmousedown = lineMouseDown;
	linkObj2.onmousedown = lineMouseDown;
	linkObj3.onmousedown = lineMouseDown;
	linkObj1.onmouseup = lineMouseUp;
	linkObj2.onmouseup = lineMouseUp;
	linkObj3.onmouseup = lineMouseUp;
	linkObj1.ondblclick=qb_linkDblClick;
	linkObj2.ondblclick=qb_linkDblClick;
	linkObj3.ondblclick=qb_linkDblClick;
	*/
	linkObj1.vert = 1;
	linkObj2.vert = 0;
	linkObj3.vert = 1;
	
	linkObj1.style.cursor = "hand";//"N-resize";
	linkObj2.style.cursor = "hand";//"E-resize";  // middle
	linkObj3.style.cursor = "hand";//"N-resize";
	
	//linkObj4.innerHTML = "<img src='/i/number.gi'>";//field1;
	//linkObj5.innerHTML = field2;
	
	linkObj1.className = "links1";
	linkObj2.className = "links";
	linkObj3.className = "links1";
 	sqlQueryRebuild = true;
 // GENSQL	parent.iframe1.location = "showQuery.html";
}
 
 
 
function qb_redim(divv1, b) {
	var divh1 = document.getElementById(divv1.id+"divh1");
	var divh2 = document.getElementById(divv1.id+"divh2");
	var iel1  = document.getElementById(divv1.id+"el1");
	var iel2  = document.getElementById(divv1.id+"el2");
//	var f1    = divv1.field1.substring(0,divv1.field1.length-7);
//	var f2    = divv1.field2.substring(0,divv1.field2.length-7);
	var f1    = divv1.field1;
	var f2    = divv1.field2;

	var o1 = document.getElementById(f1);
	var o2 = document.getElementById(f2);
	    o1 = qb_cascadeUpUntil(o1,"TR");
	    o2 = qb_cascadeUpUntil(o2,"TR");
	var o1_holder = qb_cascadeUpUntil(o1,"DIV");
	var o2_holder = qb_cascadeUpUntil(o2,"DIV");
	
	if (  o1_holder.style.display == 'none' ||
	      ( o1_holder.scrollHeight && o1_holder.scrollHeight > 250)
	    )
	    o1 = qb_cascadeUpMove(o1,"DIV");
	    
	if (  o2_holder.style.display == 'none' ||
	      ( o2_holder.scrollHeight &&  o2_holder.scrollHeight > 250)
	    )
	    o2 = qb_cascadeUpMove(o2,"DIV");
	
	
	card1 = 0;
	card2 = 0;
	
	if (o1.style.borderStyle=="dashed") {
		card1 = 1;
	}
	
	if (o2.style.borderStyle=="dashed") {
		card2 = 1;
	}
	
	//var l1=parseInt(o1.style.left) + card1;
	//var t1=parseInt(o1.style.top) + card1;
	var l1=parseInt(findPosX(o1)) + card1;
	var t1=parseInt(findPosY(o1)) + card1;

	var w1=o1.offsetWidth - card1*2;
	var h1=o1.offsetHeight - card1*2;
	var r1=l1 + w1;// + card1;
	
	//var l2=parseInt(o2.style.left) + card2;
	//var t2=parseInt(o2.style.top) + card2;
	var l2=parseInt(findPosXa(o2)) + card2;
	var t2=parseInt(findPosYa(o2)) + card2;
		var w2=o2.offsetWidth - card2*2;
	var h2=o2.offsetHeight - card2*2;
	var r2=l2 + w2;// + card2;
	
	card1 = divh1.card;
	card2 = divh2.card;
	
	var x1 = divh1.relTop;
	var x2 = divh2.relTop;
	
	if(x1<17*qb_zoomFactor){
		x1 = 17*qb_zoomFactor;
		divh1.relTop = x1;
	}
	if(x1 > h1-4){
		x1 = h1-4;
		divh1.relTop = x1;
	}

	if(x2<17*qb_zoomFactor){
		x2 = 17*qb_zoomFactor;
		divh2.relTop = x2;
	}
	if(x2 > h2-4){
		x2 = h2-4;
		divh2.relTop = x2;
	}

	divh1.style.top = t1 + x1;
	iel1.style.top = t1 + x1 - 15;
	divh2.style.top = t2 + x2;
	iel2.style.top = t2 + x2 - 15;

	if (b) {
		divh1.style.height=5;
		divh2.style.height=5;
		divv1.style.width=5;
		iel1.style.width=10;
		iel1.style.height=20;
		iel2.style.width=10;
		iel2.style.height=20;
	}
	  
	  if(divv1.relLeft>0){
	  	y1 = divv1.relLeft;
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
      divv1.style.left = y1-2;
	  divv1.style.height=qb_abs1((t1+x1)-(t2+x2));
	  
	  if (y1<l1) {
	    divh1.style.left=y1;
	    divh1.style.width=l1-y1;
	    iel1.style.left=l1-12;
	  } else if (y1>r1) {
	    divh1.style.left=r1;
	    divh1.style.width=y1-r1+1;
	    iel1.style.left=r1+5;
	  } else {
	    divh1.style.left=y1;
	    divh1.style.width=1;
	    if (t2+x2<t1){
	    	iel1.style.top=t1-14;
		    iel1.style.left=y1+5;
	    } else if (t2+x2>t1+h1) {
	    	iel1.style.top=t1+h1;
		    iel1.style.left=y1+5;
	    } else {
	    	iel1.style.top=t2+x2-14;
	    	if (l1<l2) {
		    	iel1.style.left=r1+5;
		    } else {
		    	iel1.style.left=l1-12;
		    }
	    }
	  }
	  
	  if (y1<l2) {
	    divh2.style.left=y1;
	    divh2.style.width=l2-y1;
	    iel2.style.left=l2-12;
	  } else if (y1>r2) {
	    divh2.style.left=r2;
	    divh2.style.width=y1-r2+1;
	    iel2.style.left=r2+5;
	  } else {
	    divh2.style.left=y1;
	    divh2.style.width=1;
	    if (t1+x1<t2){
	    	iel2.style.top=t2-14;
		    iel2.style.left=y1+5;
	    } else if (t1+x1>t2+h2) {
		    iel2.style.top=t2+h2;
		    iel2.style.left=y1+5;
	    } else {
	    	iel2.style.top=t1+x1-14;
	    	if (l2<l1) {
		    	iel2.style.left=r2+5;
		    } else {
		    	iel2.style.left=l2-12;
		    }
	    }
	  }
		var pt1 = parseInt(divh1.style.top);
		var pt2 = parseInt(divh2.style.top);
    divv1.style.top=((pt1-pt2)<0)?pt1+2:pt2+2;
	  return false;
	}

function qb_abs1(a){
		return (a<0)?-a:(a>0?a:1);
}


 function findPosXa(obj){
   obj = html_GetElement(obj);
   var leftOff = 0;
   var curleft = 0;
//     curleft = obj.offsetLeft+obj.clientLeft;
   if (obj.offsetParent) {
     while (obj.offsetParent){
       if ( obj.style.left )  {
          curleft += parseInt(obj.style.left.substring(0,obj.style.left.length-2));
          return curleft;
       }else {
          curleft += obj.offsetLeft
       }
       obj = obj.offsetParent;
     }
   } else if (obj.x) {
     curleft += obj.x;
   }
   return curleft;
 }
 
 function findPosYa(obj){
   obj = html_GetElement(obj);
   var curtop = 0;
   if (obj.offsetParent) {
     while (obj.offsetParent){
       if ( obj.style.top )  {
          curtop += parseInt(obj.style.top.substring(0,obj.style.top.length-2));
          return curtop;
       }else {
          curtop += obj.offsetTop
       }
       obj = obj.offsetParent;
     }
   }
   else if (obj.y){
     curtop += obj.y;
   }
   return curtop;
 }
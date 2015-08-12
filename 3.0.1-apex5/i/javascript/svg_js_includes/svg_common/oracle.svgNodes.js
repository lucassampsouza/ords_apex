/*-------------------
Created By: Carl Backstrom
Notes: standard init for all svg javascript functions
Desc: common functions for all dynamic svg
---------------------*/
var svgDoc = null; //SVG Document
var svgns  = "http://www.w3.org/2000/svg";
var xlinkns  = "http://www.w3.org/2000/xlink/namespace/";
var htmldb = "http://www.oracle.com/htmldb";
var testVer = null;
var now = new Date();
var svgSVGObj = null;
/*- Desc: common init for all dynamic svgs */
function oracleSvgInit(evt){
  testVer = navigator.appVersion;
  if (testVer >= 3)  {

  if(document){
	svgDoc = document;
	svgSVGObj = svgDoc.documentElement;
  }else{ // uses older getter and setter methods for adobe plugin
	svgDoc = evt.getCurrentNode().getOwnerDocument();
	svgSVGObj = svgDoc.getDocumentElement();
  }

 if(svgSVGObj){
  updateTracker(evt);
    infoBubble = svg_selectNode("infoBubble");
    if(!infoBubble){
			infoBubble = new oracleSvgG();
			infoBubble.id = "infoBubble";
			infoBubble = infoBubble.createNode();
			svgDoc.lastChild.appendChild(infoBubble);
			infoBubble.setAttribute("transform","translate(10,10)");
      }
	}
 }
	return;
}

function svgSync(){
	if(window.reload){
		window.reload();
	}else{
		window.location = window.location;
	}
}
      
/*- Desc: use to return svg node */
function svg_selectNode(id){
	switch(typeof (id)){
  	case 'string':node = svgDoc.getElementById(id);break;
		case 'object':node = id;break;
    default:node = null;break;
	}
	return node;
}

/*- Desc: */
function svg_CascadeUpTillTag(id,getTag,classname){
	var node = selectNode(id);
	if (node){
		var nodePar = node.parentNode;
		if (!nodePar){
			return null;
		} else if (classname){
			var nodeParClass = nodePar.getAttribute('class');
			while (nodePar.nodeName != getTag ||
				!nodeParClass || nodeParClass.indexOf(classname) == -1){
				if (nodePar.parentNode && nodePar.parentNode.tagName != "svg"){
					nodePar = nodePar.parentNode;
					nodeParClass = nodePar.getAttribute('class');
				} else {
					return null;
				}
			}
		} else {
			while(nodePar.nodeName != getTag){
				if (!nodePar.parentNode){
					return false;
				} else {
					nodePar = nodePar.parentNode;
				}
			} 
		}
		return nodePar; 
	} else {
		return false;
	}
}

/*- Desc: show node by id or node element */
function svg_showElement(id){
	var node = svg_selectNode(id);
	if (node == null) return;
  node.setAttribute('style','');
	return node;
}

/*- Desc: hide node by id or node element */
function svg_hideElement(id){
	node = svg_selectNode(id);
	if (node == null) return;
  node.setAttribute('style','display:none');
	return node;
}

/*- Desc: hides all children of node by id or node element */
function svg_HideChildren(id){
	node = selectNode(id);
	if (node == null) return;
	for (var i = 0; i < node.childNodes.length; i++ ) {
		if(node.childNodes.item(i).getNodeType() == 1){
			node.childNodes.item(i).setAttribute('style','display:none')}
		} 
	return node;
}

/*hides all siblings of a given node*/
function svg_HideAllSiblings(id){
	var node = selectNode(id);
	if(node){
	  svgHideChildren(node.parentNode);
		showElement(node);
	}
	return;
}

/*- Desc: hides all children of node by id or node element */
function svg_ShowChildren(id){
	node = svg_selectNode(id);
	if (node == null) return;
	for (var i = 0; i < node.childNodes.length; i++ ) {
		if(node.childNodes.item(i).getNodeType() == 1){
			node.childNodes.item(i).setAttribute('style','')}
		} 
	return node;
} 

/*- Desc: moves node to top*/
function svg_MoveToTop(id){
	svg_Log('svg_MoveToTop');
	node = svg_selectNode(id);
	if (node == null) return;
	if(node.parentNode){node.parentNode.appendChild(node);}
	return node;
}

/*- Desc: moves node to bottom */
function svg_MoveToBottom(id){
	n = svg_selectNode(id);
	if (n == null) return;
	n.parentNode.insertBefore(n,n.parent.getFirstChild());
	return n;
}

/*-Desc: delete given node from dom*/
function svg_deleteNode(id){
	var node = svg_selectNode(id);
	if (node == null) return;
    node.getParentNode().removeChild(node);
  return node;
}

/*-Desc: delete all children of given node from dom */
function svg_DeleteChildren(id,nT,className){
	var node = svg_selectNode(id);
  var ch = node.childNodes;
	if(ch.length > 0){
	for(var i=ch.length; i>= 0; i--){
	if(ch.item(i) && ch.item(i).getNodeType() == 1){
		if(nT && nT == ch.item(i).nodeName){svg_deleteNode(ch.item(i));}
		if(!nT){svg_deleteNode(ch.item(i));}
	}
	}
	}
	return node;
}

/*- Desc: updates a text node.*/
function svg_updateTextNode(id,d){
	var n = svg_selectNode(id);
	if (n == null) return;
	n = n.getFirstChild();
	n.setData(d);
  return;
}

/*-Desc:*/
function svg_getChildObjects(id,obType,className){
	var node = svg_selectNode(id);
	if (node == null) return;
	var nodes = node.getElementsByTagName(obType);
	return nodes;
}

/*-Desc:*/
function svg_GetDesc(id){
	var node = svg_selectNode(id);
	if (node == null) return;
  var desc = null;
	var descNodes = svg_getChildObjects(node,'desc');
  if(descNodes.length > 0 && descNodes.item(0).getFirstChild()){
  	desc = descNodes.item(0).getFirstChild();
   }
	return desc;
}



/*-Desc: toggles node visibility*/
function svg_ToggleVisibility(id){
		node = svg_selectNode(id);
		if (node == null) return;
    isVis = node.getAttribute('style');
    if(isVis == ''){svg_hideElement(id)}
    else{svg_showElement(id)}
  	return node;
}

/*-Desc: gets X from translate transform X*/
function getX(id) {
	node = svg_selectNode(id);
	if (node == null) return;
	if(node.getAttribute("transform")){
    var s = getTranslate(node);
		return Math.round(parseFloat(s.substring(10, s.indexOf(","))));
	}else{
	  return parseInt(0);
	}
}

/*- Desc: gets Y from translate transform Y */
function getY(id) {
	node = svg_selectNode(id);
	if (node == null) return;
	if(node.getAttribute("transform")){
	  var s = getTranslate(node);
		return Math.round(parseFloat(s.substring(s.indexOf(",")+1, s.length-1)));
	}else{
	  return parseInt(0);
	}
}

/*- Desc: Returns: string of translate*/
function getTranslate(id) {
	node = svg_selectNode(id);
	if (node == null) return;
	var s = node.getAttribute("transform");
	if (s.indexOf("translate(") == -1) return "translate(0,0)";
		s = s.substring(s.indexOf("translate("));
		s = s.substring(0, (s.indexOf(")")+1));
  	return s;
}

/*- Desc: */
function getScale(id) {
	node = selectNode(id);
	if (node == null) return;
	var s = node.getAttribute("transform");
	if (s.indexOf("scale(") == -1) return "scale(1)";
		s = s.substring(s.indexOf("scale("));
		s = s.substring(0, (s.indexOf(")")+1));
  	return s;
}

/*- Desc:	sets new transform for svg node */
function newTransform(id, nx, ny, nr, ns) {
	node = svg_selectNode(id);
	if (node == null) return;
	var s = "translate("+nx+","+ny+") rotate("+nr+") scale("+ns+")";
	node.setAttribute("transform", s);
	return node;
}

/*- Desc: creates and returns image node */
function createImage(id,x,y,width,height,src){
		node = svgDoc.createElement('image');
		node.setAttribute('id',id);
		node.setAttribute('x',x);
		node.setAttribute('y',y);
		node.setAttribute('width',width);
		node.setAttribute('height',height);
  	node.setAttributeNS(xlinkns,'xlink:href',src);
    return node;
}

/*- Desc: creates and returns ellipse node */
function oracleSvgEllipse(){
  this.cx = 0;
  this.cy = 0;
  this.fill = "#336699";
  this.stroke = "#000000";
  this.strokewidth = 1;
  this.opacity = 1;
  this.rx = 5;
  this.ry = 5;
  this.createNode = createNode;
	//function to return node
  function createNode(){
		node = svgDoc.createElementNS(svgns,'ellipse');
		node.setAttribute('cx',this.cx);
		node.setAttribute('cy',this.cy);
		node.setAttribute('rx',this.rx);
		node.setAttribute('ry',this.ry);
		node.setAttribute('fill',this.fill);
		node.setAttribute('stroke',this.stroke);
		node.setAttribute('stroke-width',this.strokewidth);
		node.setAttribute('opacity',this.opacity);
		node.setAttribute('transform','translate(0,0)');
		node.setAttribute('style','');
    return node;
  }
}

/*- Desc: creates and returns rect node */
function oracleSvgRect(){
	this.x=0;
  this.y=0;
  this.width = 10;
  this.height = 10;
  this.fill="#336699";
  this.stroke="#000000";
  this.strokewidth = 1;
	this.padding = 0;
	this.style = null;
	this.className = null;
	this.setByBox = setByBox;
  this.createNode = createNode;
  //function to return node
	function setByBox(id){
		var node = svg_selectNode(id);
	  if(node){
		  var backRec = node.getBBox();
		  this.x = backRec.x - this.padding / 2;
  		this.y = backRec.y - this.padding / 2;
  		this.width = backRec.width + this.padding / 2;
  		this.height = backRec.height + this.padding / 2;
	  }
	}

  function createNode(){
		node = svgDoc.createElementNS(svgns,'rect');
		node.setAttribute('x',this.x);

		node.setAttribute('y',this.y);

		node.setAttribute('width',this.width);

		node.setAttribute('height',this.height);

		

		if(this.fill)node.setAttribute('fill',this.fill);

		if(this.stroke)node.setAttribute('stroke',this.stroke);

		if(this.strokewidth)node.setAttribute('stroke-width',this.strokewidth);

		if(this.className)node.setAttribute('class',this.className);

		node.setAttribute('style',this.style); //always set style

		node.setAttribute('transform','translate(0,0)'); //always set transform

		

    return node;

  }

}

/*- Desc: creates and returns line node */
function oracleSvgLine(){
	this.x1=0;
  this.y1=0;
	this.x2=0;
  this.y2=0;
  this.stroke="#000000";
  this.strokewidth = 1;
  this.createNode = createNode;
  //function to return node
  function createNode(){
		node = svgDoc.createElementNS(svgns,'line');
		node.setAttribute('x1',this.x1);
		node.setAttribute('y1',this.y1);
		node.setAttribute('x2',this.x2);
		node.setAttribute('y2',this.y2);
		node.setAttribute('stroke',this.stroke);
		node.setAttribute('stroke-width',this.strokewidth);
		node.setAttribute('transform','translate(0,0)');
		node.setAttribute('style','');
    return node;
  }
}



/*- Desc: creates and returns desc node */
function oracleSvgDesc(){
	this.description = "";
  this.createNode = createNode;
  //function to return node
  function createNode(){
		node = svgDoc.createElementNS(svgns,'desc');
		thetext = svgDoc.createTextNode(this.description);
		node.appendChild(thetext);
    return node;
  }
}

/*- Desc: a = new oracleSvgG().createNode(); */
function oracleSvgG(){
	this.id = null;
  this.createNode = createNode;
  //function to return node
  function createNode(){
		node = svgDoc.createElementNS(svgns,'g');
		node.setAttribute('id',this.id);
		node.setAttribute('transform','translate(0,0)');
    return node;
  }
}

/*- Desc: */
function oracleSvgA(){
	this.id = null;
	this.src = null;
	this.target = null;
  this.createNode = createNode;
  //function to return node
  function createNode(){
 //xlink:href="http://www.w3.org"
		node = svgDoc.createElementNS(svgns,'a');
		node.setAttributeNS('http://www.w3.org/2000/xlink/namespace/','xlink:href',this.src);
		node.setAttribute('target','_blank');
    return node;
  }
}

/*- Desc: */
function oracleSvgSimpleText(){
	this.id = null;
  this.text="-";
	this.x = 0;
	this.y = 0;
	this.fill = "#000000";
  this.fontsize = 10;
  this.fitwidth = null;
	this.createNode = createNode;
  //function to return node
  function createNode(){
	if(this.fitwidth){
            var tArray = new Array();	
						var wArray = this.text.split(' ');
						var tempT = ""; 
						for(var wI=0;wI<wArray.length;wI++){
						if(wArray[wI] != ""){
						 tempT = tempT + " " + wArray[wI];
						 var a = new oracleSvgSimpleText();
						 a.fontsize = this.fontsize;
					   a.text = tempT;
						 a = a.createNode();	
						 if(a.getComputedTextLength<=this.fitwidth && wI < wArray.length-1){}
						 else{
						  tArray[tArray.length] = tempT;
							tempT = "";
						 }
						 }
						 else{}
						}
						var ahk = new oracleSvgSimpleText()
						ahk.text = ""
						ahk.x=this.x;
						ahk.y=this.y;
						ahk.fontsize = this.fontsize;
						ahk = ahk.createNode();
						for(var ti=0; tArray.length>ti; ti++){
									node = svgDoc.createElement('tspan');
 									node.setAttribute('x',this.x);
									node.setAttribute('dy',(this.fontsize+2));
									theText = svgDoc.createTextNode(tArray[ti]);
    							node.appendChild(theText); 
    							ahk.appendChild(node); 
						}
			return ahk;	
	}
	else{
		node = svgDoc.createElementNS(svgns,'text');
    theText = svgDoc.createTextNode(this.text);
    node.appendChild(theText); 
		node.setAttribute('x',this.x);
		node.setAttribute('y',this.y);
		node.setAttribute('font-size',this.fontsize);
   	node.setAttribute('font-family','Arial');
		node.setAttribute('fill',this.fill);
		node.setAttribute('transform','translate(0,0)');
    return node;
		}
  }
}

/*- Desc: */
function oracleSvgPath(){
	this.id = '';
	this.d = '';
  this.stroke = "#000000";
  this.strokewidth = 2;
  this.fill = "none";
  this.createNode = createNode;
  //function to return node
  function createNode(){
		node = svgDoc.createElementNS(svgns,'path');
		node.setAttribute('id',this.id);
		node.setAttribute('d',this.d);
		node.setAttribute('stroke',this.stroke);
		node.setAttribute('stroke-width',this.strokewidth);
		node.setAttribute('fill',this.fill);
		node.setAttribute('style','');
    return node;
  }
}

/*- Desc: */
function oracleSvgImage(){
	this.id = null;
  this.x = null;
  this.y = null;
  this.height = null;
  this.width = null;
  this.src = null;  
  this.createNode = createNode;
	return;
	function createNode(){
		node = svgDoc.createElementNS(svgns,'image');
		node.setAttribute('id',this.id);
		node.setAttribute('x',this.x);
		node.setAttribute('y',this.y);
		node.setAttribute('width',this.width);
		node.setAttribute('height',this.height);
		node.setAttribute('transform','translate(0,0)');
		node.setAttribute('style','');
  	node.setAttributeNS(xlinkns,'xlink:href',this.src);
    return node;
	}
}

/*-Desc: */
function oracleAppendDesc(id,text){
	var node = selectNode(id);
  if (node == null) return;
  desc = new oracleSvgDesc();
  desc.description = text;
  desc = desc.createNode();
  node = node.appendChild(desc);
	return node;
}

/*-Desc: */
var infoBubble;
var infoBubbleText;
var infoBack;
function infoBubbleOn(x,y,text){
	if(testVer == "3.0"){
	if(!infoBubble){infoBubble =  svg_selectNode('infobubble')};
	if(!infoBack){infoBack =  svg_selectNode('infobackground')};
	if(!infoBubbleText){infoBubbleText =  svg_selectNode('infotext')};
		infoBubble.setAttribute("transform","translate("+x+","+y+")");
		svg_showElement(infoBubble);
		svg_updateTextNode(infoBubbleText,text);
		infoBack.setAttribute("width",infoBubbleText.getBBox().width + 10);
		infoBack.setAttribute("height",infoBubbleText.getBBox().height + 10);
	}
	return infoBubble;
}

/*- Desc: */
function infoBubbleMove(evt){
	if(evt){
  var x = svg_Evt_X(evt);
  var y = svg_Evt_Y(evt);
 /* infoBubble.setAttribute('transform','translate('+(x +svg_Fix_X(20))+','+(y+svg_Fix_Y(10))+')');
  */
  bbw = infoBubble.getBBox().width;
  bbh = infoBubble.getBBox().height;
  if(placement == "left"){
    trans_string = (x-bbw-svg_Fix_X(20))+','+(y-(bbh/2));
  }
  else if(placement == "top"){
  trans_string = (x-(bbw/2))+','+(y-bbh-svg_Fix_Y(30));
  }
  else if(placement == "bottom"){
  trans_string = (x-(bbw /2))+','+(y+svg_Fix_Y(30));
  }
  else if(placement == "auto"){
  trans_string = (x +svg_Fix_X(20))+','+(y+svg_Fix_Y(10));
  }
  else{
   trans_string = (x+svg_Fix_X(20))+','+y;
  }
  infoBubble.setAttribute('transform','translate('+trans_string+')');
	}
	return infoBubble;
}

/*- Desc: */
var speed = 1000;
var infoTimeout = null;
function infoBubbleOff(){
	if(testVer == "3.0"){
		if(infoTimeout){clearTimeout(infoTimeout);}
		//infoTimeout = setTimeout("hideElement(infoBubble)", speed);
		svg_hideElement(infoBubble);
	}
	return;
}

/*- Desc: */
function descBubble(evt){
if(infoTimeout){clearTimeout(infoTimeout);}
if(testVer == "3.0"){
 	var thisNode = evt.getCurrentNode();
  var x = evt.getClientX();
  var y = evt.getClientY();
  xmlDesc = svg_GetDesc(thisNode);
  if(xmlDesc){
	 infoBubbleOn(x+10,y-10,xmlDesc);
	 thisNode.addEventListener("mouseout", infoBubbleOff, false); //use this for mouseout disappear
	 thisNode.addEventListener("mousemove", infoBubbleMove, false);
	}
}
  return;
}



/*- Desc: */

function descBubble_line(evt){
if(infoTimeout){clearTimeout(infoTimeout);}
if(testVer == "3.0"){   
 	var thisNode = evt.getCurrentNode();
  var x = evt.getClientX();
  var y = evt.getClientY();
  xmlDesc = svg_GetDesc(thisNode);
  if(xmlDesc){
				var IB = infoBubbleOn(x+10,2,xmlDesc);
				var IBB0x = IB.getBBox();
				if((IBB0x.width + getX(IB)) > gBB.width){
						infoBubble.setAttribute("transform","translate("+(gBB.width -IBB0x.width)+",2)");
				}
	}
	thisNode.addEventListener("mouseout", infoBubbleOff, false); //use this for mouseout disappear
}
  return;
}

/*-desc: generic background for objects...mainly for text*/
function svg_CreateObjectBackground(id,color,padding){
		var EL = selectNode(id);
		var BB = EL.getBBox();
	  var bBorder = new oracleSvgRect();
		svg_Log("padding:" + padding)
		twidth = (BB.width + padding); // comput
    theight = (BB.height + padding);
		with (bBorder){
		 x=0;
		 y=0;
     width = twidth;
     height = theight;
     stroke = "#000000";
     strokewidth = 1;
     fill = color;
		}
	 bBorder =  bBorder.createNode();
	 newTransform(bBorder,(0 - padding/2),0 - (padding/2), 0, 1);
   return bBorder;
}

/*- Desc: */

function test_INIT(evt){

		var EL = selectNode('tline');

    setTimeout ('tline_timeout()', .2);

}





/*- Desc: */

var t2 = 0;

var tdir = 'f';

function tline_timeout(){

		if(tdir == 'f'){

		 ar_SA('tline','x2',t2);

		 t2++;

		 if(t2 > 800){tdir = 'b';}

		}else{

		 ar_SA('tline','x2',t2);

		 t2--;

		 if(t2 < 0){tdir = 'f';}

		}

    setTimeout ('tline_timeout()', .2);

}



/*- Desc: */

function ar_GA(id,att){

		var EL = selectNode(id)

    if(EL){return EL.getAttribute(att);}

		else{return null;}

}



/*- Desc: */

function ar_SA(id,att,value){

		var EL = selectNode(id)

    if(EL){return EL.setAttribute(att,value);}

		else{return null;}

}





/*- Desc: a = new oracleSvgG().createNode(); */

function oracleSvgUse(){

	this.id = null;

	this.src = null;

	this.x = 0;

	this.y = 0

  this.createNode = createNode;

  //function to return node

  function createNode(){

	 if(this.src){

		node = svgDoc.createElementNS(svgns,'use');

		node.setAttribute('id',this.id);

		node.setAttribute('x',this.x);

		node.setAttribute('y',this.y);

  	node.setAttributeNS(xlinkns,'xlink:href',this.src);

    return node;

		}else{

		return false;

		}

  }

}





/*-

Name:

Init:

Returns:

Desc:

*/

function oracleSvgPolyline(){

  this.id = '';

  this.points = '';

  this.stroke = "#000000";

  this.strokewidth = 2;

  this.fill = "none";

  this.createNode = createNode;

  //function to return node

  function createNode(){

		node = svgDoc.createElementNS(svgns,'polyline');

		node.setAttribute('id',this.id);

		node.setAttribute('points',this.points);

		node.setAttribute('stroke',this.stroke);

		node.setAttribute('stroke-width',this.strokewidth);

		node.setAttribute('fill',this.fill);

    return node;

  }

}



/*runs an in page text log*/

var logActive = false;

function svgLog(t){svg_Log(t)}// old

function svg_Log(t){

 if(logActive){

 var sL = svg_selectNode('svg_log');

 if(!sL){

  sL = svgDoc.createElementNS(svgns,'text');

  with (sL){
	 setAttribute('x',"99%");
	 setAttribute('y',"2%"); 
	 setAttribute('text-anchor',"end"); 
	 setAttribute('font-size',9);
	 setAttribute('id',"svg_log");
	}
	svgDoc.appendChild(sL);
 }

 var sFC = sL.getFirstChild();

 node = svgDoc.createElementNS(svgns,'tspan');

 with(node){

  setAttribute('x',sL.getAttribute('x'));

	setAttribute('dy',15); 

	setAttribute('font-size',9); 

 }

 theText = svgDoc.createTextNode(now + ":" + t);

 node.appendChild(theText);

 sL.insertBefore(node,sFC);

 return;

 }

}



/*Desc: */

function rect2BBox(rect,bb){

  //rect.setAttribute('x',bb.x - 5)

	rect.setAttribute('y',bb.y - 5)

	rect.setAttribute('width',bb.width + 10)

	rect.setAttribute('height',bb.height + 10)

	return rect;

}



/*****

*

*   getTransformToElement

*

*   This function is a part of the SVG DOM, but currently it is not

*   implemented in the Adobe SVG Viewer.  This code recreates that

*   functionality

*

*****/

function getTransformToElement(node) {
  // Initialize our CTM the node's Current Transformation Matrix
	var CTM = node.getCTM();
	// Work our way through the ancestor nodes stopping at the
	// SVG Document
	while ( ( node = node.parentNode ) != svgDocument ) {
	  CTM = node.getCTM().multiply(CTM);
	}
  return CTM;
}




        var frame = {
            x_trans: 0,
            y_trans: 0,
            zoom   : 1,
            x_scale: 1,
            y_scale: 1
        };

        function updateTracker(e) {
            // Get the current zoom and pan settings
            var trans = svgSVGObj.currentTranslate;
            var scale = svgSVGObj.currentScale;
            // Determine the translation needed to move the upper-left
            // corner of our tracking rectangle to the upper-left of the
            // current view.
            // The zeros are used to reinforce that we are translating
            // the origin of the rectangle to the upper-left corner of the
            // current view.
            frame.x_trans = ( 0.0 - trans.x ) / scale;
            frame.y_trans = ( 0.0 - trans.y ) / scale;
            // Now that we have moved the rectangle's corner to the
            // upper-left position, let's scale the rectangle to fit
            // the current view.  X and Y scales are maintained seperately
            // to handle possible anamorphic scaling from the viewBox
            frame.zoom = scale;
            frame.x_scale = 1 / scale;
            frame.y_scale = 1 / scale;
            // Get the current viewBox
            var vbox = svgSVGObj.getAttributeNS(null, "viewBox");
            if ( vbox ) {
                // We have a viewBox so, update our translation and scale
                // to take the viewBox into account
                // Break the viewBox parameters into an array to make life easier
                var params  = vbox.split(/\s+/);
                // Determine the scaling from the viewBox
                // Note that these calculations assume that the outermost
                // SVG element has height and width attributes set to 100%.
                var h_scale = window.innerWidth  / params[2];
                var v_scale = window.innerHeight / params[3];
                // Update our previously calculated transform
                frame.x_trans = frame.x_trans / h_scale + parseFloat(params[0]);
                frame.y_trans = frame.y_trans / v_scale + parseFloat(params[0]);
                frame.x_scale = frame.x_scale / h_scale;
                frame.y_scale = frame.y_scale / v_scale;
            }
        }
   
        

function svg_Evt_X(evt){
  var nx = evt.getClientX() * frame.x_scale + frame.x_trans;
  return nx;
}

function svg_Evt_Y(evt){
  var ny = evt.getClientY() * frame.y_scale + frame.y_trans;
  return ny;
}

function svg_Fix_X(x){
  var x = x * frame.x_scale + frame.x_trans;
  return x
}

function svg_Fix_Y(y){
  var y = y * frame.y_scale + frame.y_trans;
  return y
}

function svg_Bubble(e){}

var gFormRows = false;
var gDragger = false;
var gPageScroll = 0;
var gThis = false;
var gTargOffsetW = false;
var gTargOffsetH = false;
var targ;
var gDragX = 0;
var gDragY = 0;
var drag;
var currentRow = false;
var currentSpacer = false;
//var RA;

var gPO = false; // page object to hold global variables

function LY_PageObject(){
 this.trash = $x('trash');
 this.holder = $x('itemholder');
 this.spacer = $x('tiki');
 this.page_id = $x('P5150_PAGE').value;
 this.MaxWidth;
 //methods
 this.init = init;
 this.SetWidth = SetWidth;
 return;
 function init(){
	this.gPageScroll = html_GetPageScroll();
	this.gFormRows = getElementsByClass('row',this.holder,'DIV');
	this.RA = [];
	this.SetWidth();
	for (var i=0;i<this.gFormRows.length;i++){
		this.RA[i] = findPos(this.gFormRows[i]);
		this.RA[i][2] = this.RA[i][0] + this.gFormRows[i].offsetWidth;
		this.RA[i][3] = this.RA[i][1] + this.gFormRows[i].offsetHeight;
		this.RA[i][4] = this.gFormRows[i];
	}
 }
 
 function SetWidth(){
 /*set width because nowrap doesn't effect floated divs*/
  var lLength = 0;
 	var lWidth = this.spacer.offsetWidth;
	var lMWidth = this.holder.offsetWidth;
	var lItemWidth = 0;
	for (var i=0;i<this.gFormRows.length;i++){
			 var lItems = this.gFormRows[i].getElementsByTagName('DIV');
			 if(lItems.length > lLength && this.gFormRows[i].id != 'trash'){
			 lLength = lItems.length;
			 lItemWidth = lLength * (lItems[0].offsetWidth + 10);
			 }
	}
	$x_Style(this.spacer,'width',lItemWidth+'px');
	}
}

function ly_page_init(){
	gPO = new LY_PageObject();
	gPO.init();
	var lItems = $dom_JoinNodeLists($x('itempallet').getElementsByTagName('DIV'),$x('itemholder').getElementsByTagName('DIV'));
	for(var i=0;i<lItems.length;i++){if(lItems[i].className.indexOf("dragger")!=-1){ly_init_MouseDown(lItems[i]);}}
	return;
}

function ly_init_MouseDown(pThis){
	if(window.addEventListener){pThis.addEventListener('mousedown',ly_drag_ob,false);}
	else{pThis.attachEvent('onmousedown',ly_drag_ob);}
	pThis.ondblclick = function(){return false;};
	pThis.onclick = function(){return false;};
	return;
}

function supressSelect(){if(!ie){window.getSelection().removeAllRanges()}else{document.selection.empty()}}

function ly_drag_ob(e){
	pThis = html_GetTarget(e);
	if(!html_SubString(pThis.className,'dragger')){pThis = $x_UpTill(pThis,'DIV');}
  gPO = false;
  gPO = new LY_PageObject();
	gPO.init();
	if(!html_SubString(pThis.className,"dragger")){return}
	if($x('last')){$x('last').id='';}
	gDragger = pThis;
	if(pThis.parentNode.id=='itempallet' && pThis.className!='dragger_row'){
			pThis.getElementsByTagName('SPAN')[0].innerHTML = '<br />';
	}else{
			gThis = new ly_TempObject(gDragger);
			gThis.init();
	}
	document.onmouseup = ly_drag_stop;
	document.onmousemove = ly_ReallyMove;
}

// stop dragging
function ly_drag_stop(){
	check_pos();
	document.onmouseup = null;
	document.onmousemove = null;
	drag=false;
	gFormRows = false;
	gDragger = false;
	targ = false;
	$x_Remove('spacer');
	currentSpacer = false;
}

function ly_ReallyMove(e){
	if(!e){var e=window.event};
	var lTargParent =$x('tempdrag');
	targ = gDragger.cloneNode(true);
	if(gDragger.parentNode.className == 'row' || gDragger.parentNode == gPO.holder){
		var lDag = $dom_AddTag(gDragger.parentNode,'span');
		lDag.id = 'oldholder';
		gDragger.parentNode.replaceChild(lDag,gDragger);
	}
	with (targ){
	 removeAttribute('onmouseover');
	 removeAttribute('onmouseout');
	 removeAttribute('onmousemove');
	 style.position = 'absolute';
	}
	$x_Style([gToolTip,gToopTipPointer],'visibility','hidden');
	lTargParent.appendChild(targ);
	// calculate event X,Y coordinates
	offsetX=e.clientX + getScrollXY()[0]
	offsetY=e.clientY + getScrollXY()[1]
	// assign default values for top and left properties
	if(!targ.style.left){targ.style.left=(offsetX-(targ.offsetWidth /2))+'px'};
	if(!targ.style.top){targ.style.top=(offsetY-(targ.offsetHeight /2))+'px'};
	// calculate integer values for top and left properties
	coordX=parseInt(targ.style.left);
	coordY=parseInt(targ.style.top);
	drag=true;
	document.onmousemove = dragDiv;

 }

// continue dragging
function dragDiv(e){
	if(!e){var e=window.event};
	if(!drag){return};
	// move div element
	lDragX = (coordX+getScrollXY()[0])+e.clientX-offsetX;
	lDragY = (coordY+getScrollXY()[1])+e.clientY-offsetY;
	targ.style.left = lDragX + 'px';
	targ.style.top = lDragY+'px';
	if(Math.abs(lDragX-gDragX)>=5||Math.abs(lDragY-gDragY)>=5){
		gDragX = lDragX;
		gDragY = lDragY;
		check_pos_drag(e);
	}
	supressSelect();
	toolTip_disable();
	return false;
}

function ly_MatchRow(pThis){
		var lReturn=false,lReturn2=false;
		var l =	 findPos(pThis)
		var lX = l[0];
		var lY = l[1];
		for (var i=0;i<gPO.RA.length;i++){
			var lTX = gPO.RA[i][0];
			var lTY = gPO.RA[i][1];
			if(gPO.RA[i][0] < lX && lX < gPO.RA[i][2]){lReturn = true}
			if(gPO.RA[i][1] < lY && lY < gPO.RA[i][3]){lReturn2 = true}
			if(lReturn && lReturn2){return gPO.RA[i][4];break;}
		}
		return false;
}

function check_pos_drag(e){
	if(!e){var e=window.event};
	if(drag){
		if(!currentSpacer){
				currentSpacer = $dom_AddTag($x('tempholder'),'DIV','<br />');
				currentSpacer.id = 'spacer';
		}
		currentSpacer.className = targ.className;
	  currentRow = ly_MatchRow(targ);
		if(currentRow){
			 $x_Show(currentSpacer)
		  if(currentRow == gPO.trash){currentRow.appendChild(currentSpacer)
			}else if(targ.className == 'dragger_start_stop_html'){
				currentRow.parentNode.insertBefore(currentSpacer,currentRow.nextSibling);
			}else if(targ.className == 'dragger_row'){
				currentRow.parentNode.insertBefore(currentSpacer,currentRow.nextSibling);
			}else{
			  var lItems = currentRow.getElementsByTagName('DIV');
				for(var ii=0;ii<lItems.length;ii++){if($d_Overlap(targ,lItems[ii])){var lT = lItems[ii];break}}
				if(lT && lT.id=='spacer'){}
				else if(lItems.length>0 && lT){currentRow.insertBefore(currentSpacer,lT)}
				else{currentRow.appendChild(currentSpacer)}
				gPO.SetWidth();
			}
		}else{
			$x_Hide(currentSpacer)
		}
	}
}

function findPos(obj){
	var curleft=0,curtop=0;
	if (obj.offsetParent){
		curleft = obj.offsetLeft;
		curtop = obj.offsetTop;
		while(obj = obj.offsetParent){
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		}
	}
	curtop += gPO.gPageScroll;
	return [curleft,curtop];
}

function ly_AddRow(){
	var lDag = $dom_AddTag(gPO.holder,'DIV');
	lDag.className = 'row';
	gPO.holder.insertBefore(lDag,gPO.trash);
}

function ly_f(pThis){pThis.className = 'focus';pThis.setAttribute('onblur','ly_b(this)')}
function ly_b(pThis){pThis.className = ''}

function check_pos(){
  this._Drop = _Drop;
	this._Clean = _Clean;
	var lDelete = true;
	if(drag){
	    var l = ly_MatchRow(targ);
			if(l){
				if(targ.className == 'dragger_row'){
					var lDag = $dom_AddTag(gPO.holder,'DIV',targ.innerHTML);
					lDag.className = 'row';
					lDag.innerHTML = '';
					if(currentSpacer){
						if(l==gPO.trash){l.replaceChild(lDag,currentSpacer);}
						else{gPO.holder.replaceChild(lDag,currentSpacer);}
						currentSpacer = false;
					}
			  this._Clean();
				}else if(targ.className == 'dragger_start_stop_html'){
					var lDag = this._Drop()
					if(currentSpacer){
						if(l==gPO.trash){currentSpacer.parentNode.replaceChild(lDag,currentSpacer);}
						else{gPO.holder.replaceChild(lDag,currentSpacer);}
						currentSpacer = false;
					}
				}else{
						var lDag = this._Drop();
				}
				if(lDag.className!='row'){
				 gThis = new ly_TempObject(lDag);
				 gThis.init();
				 var lDelete = false;
				}
		 }else{
				currentSpacer = false;
				var lDag = this._Drop();
		 }
		if(l == gPO.trash && (lDag.className=='row' || lDag.getAttribute('apex:id')=='new')){$x_Remove(lDag)}
		if(lDelete){this._Drop();}

	}
	gPO.SetWidth();
	return;
	  function _Drop(){
			 var lEl = targ.cloneNode(true);
			 var lOld = $x('oldholder');
			 lEl.id='last';
			 lEl.className = targ.className;
			 lEl.style.position='';
			 lEl.style.top='';
			 lEl.style.left='';
			 ly_init_MouseDown(lEl);
			 if(currentSpacer){
				 currentSpacer.parentNode.replaceChild(lEl,currentSpacer);
				 currentSpacer = false;
			 }else if(!currentSpacer && lOld){
			   lOld.parentNode.replaceChild(lEl,lOld);
			 }
       this._Clean();
			 return lEl;
	}
	function _Clean(){
		   $x_Remove('oldholder');
			 $x('tempdrag').innerHTML='';
	}
}

/* collect all values for submit */
function ly_Collect(){
	$x(gItems).value = '';
	var l_Real = [];
	var l = gPO.trash.getElementsByTagName('DIV');
	/* collect trash */
	for(var ii=0;ii<l.length;ii++){
	   var lTempItemObject = new ly_TempObject(l[ii]);
		 $x(gItemsDeleted).value += lTempItemObject.return_Item(0,'NO'); 
	}
	$x_Remove(gPO.trash);
	/* delete trash */
	l = gPO.holder.getElementsByTagName('DIV');
	for(var i=0;i<l.length;i++){if(l[i].className == 'dragger_start_stop_html' || l[i].className == 'row'){l_Real[l_Real.length] = l[i];}}
	l = l_Real;
	var lSeq = 10;
	var start_newlin = 'YES';
	for(var i=0;i<l.length;i++){
	  if(l[i].className == 'dragger_start_stop_html'){
		   var lTempItemObject = new ly_TempObject(l[i]);
		 	 $x(gItems).value += lTempItemObject.return_Item(lSeq,start_newlin,i+'_'+0);
		 	 lSeq++;
		}else{
		var nTD = l[i].getElementsByTagName('DIV');
			 for(var ii=0;ii<nTD.length;ii++,lSeq++){
			    var lTempItemObject = new ly_TempObject(nTD[ii]);
				 	$x(gItems).value += lTempItemObject.return_Item(lSeq,start_newlin,i+'_'+ii);
				 	var start_newlin = 'NO';
			 }
		}
	 	var start_newlin = 'YES';
	}
	/*	*/
	$x(gItems).value = $x(gItems).value.substring(0,$x(gItems).value.length-2);
	$x_Remove('item_options');
	$x_Remove('detail_pane');
	doSubmit('APPLY_CHANGES');
}

function ly_TempObject(pThis){
	this.item = $x(pThis);
	this.inputs = this.item.getElementsByTagName('INPUT');
	this.label = this.item.getElementsByTagName('TEXTAREA')[0];
	this.displayName = this.item.getElementsByTagName('SPAN')[0];
	this.set_Item = set_Item;
	this.return_Item = return_Item;
	this.init = init;
	return;

	function init(){
		if (this.item.parentNode.className == 'row' || this.item.parentNode == gPO.holder){
		 this.item.id='last';
		}
	var lTest = false;
	switch (this.item.className){
		case 'dragger_cal':lTest='NATIVE_DATE_PICKER_CLASSIC'; break;
		case 'dragger_html2':lTest='NATIVE_DISPLAY_ONLY'; break;
		case 'dragger_listmgr':lTest='NATIVE_LIST_MANAGER'; break;
		case 'dragger_pswd':lTest='NATIVE_PASSWORD'; break;
		case 'dragger_popup':lTest='POPUP_LOV'; break;
		case 'dragger_radio':lTest='NATIVE_RADIOGROUP'; break;
		case 'dragger_pulldwn':lTest='NATIVE_SELECT_LIST'; break;
		case 'dragger_textarea':lTest='NATIVE_TEXTAREA'; break;
		case 'dragger_text':lTest='NATIVE_TEXT_FIELD'; break;
		case 'dragger_start_stop_html':lTest='NATIVE_STOP_AND_START_HTML_TABLE'; break;
		case 'dragger_fileupload':lTest='NATIVE_FILE'; break;
		case 'dragger_display_image':lTest='NATIVE_DISPLAY_IMAGE'; break;
		case 'dragger_hidden':lTest='NATIVE_HIDDEN'; break;
		case 'dragger_check':lTest='NATIVE_CHECKBOX'; break;
		case 'dragger_button':lTest='BUTTON'; break;
		case 'dragger_shuttle':lTest='NATIVE_SHUTTLE';break;
		case 'dragger_plugin':lTest='PLUGIN';break;
		case 'dragger_autocompl':lTest='NATIVE_AUTO_COMPLETE';break;
		case 'dragger_number':lTest='NATIVE_NUMBER_FIELD';break;
		case 'dragger_rich_text':lTest='NATIVE_RICH_TEXT_EDITOR';break;
		case 'dragger_new_datepkr':lTest='NATIVE_DATE_PICKER';break;
		case 'dragger_date_html5':lTest='NATIVE_DATE_PICKER_HTML5';break;
		case 'dragger_yes_no':lTest='NATIVE_YES_NO';break;
		case 'dragger_slider':lTest='NATIVE_SLIDER';break;
	}

	if($x(lTest)){
		html_HideSiblings(lTest);
		$x_Show(['name_label']);
	}else{$x_Hide(['name_label']);}
	if(this.inputs.length == 1 && (this.item.className != 'dragger_row' && this.item.className != 'row')){
		if(isEmpty(this.inputs[0])){
			 $x_Value(this.inputs[0],'P'+gPO.page_id+'_');
			 this.displayName.innerHTML = 'P'+gPO.page_id+'_';
		}
		$x_Value('NAME',this.inputs[0].value);
		$x_Value('LABEL',this.label.value);
		if($x(lTest).nodeName == 'SELECT'){
			if(this.item.getAttribute('apex:type').length!=0){
				html_SetSelectValue(lTest,this.item.getAttribute('apex:type'));
			}else{
				$x(lTest).options.selectedIndex = 0;
				lTest = html_SelectValue(lTest);
				this.set_Item('type',lTest);
			}
		}else{
			this.set_Item('type',lTest);
		}
	}
	else if(this.item.className == 'dragger_row'){this.set_Item('type',lTest);}
	else if(this.item.className == 'row'){this.item.innerHTML='';}
	}
	
	function set_Item(pAttribute,pValue){
    switch (pAttribute){
		case 'name':
		upperMe('NAME');
		myRegExp = /\s/g;
		tvalue = pValue.value.replace(myRegExp,"_");
		this.inputs[0].value = tvalue;
		this.displayName.innerHTML = tvalue;
		pValue.value = tvalue;
		break;
		case 'label':this.label.value = pValue.value; break;
		case 'type':
				 if(pValue.nodeName){pValue = pValue.value}
				 this.item.setAttribute('apex:type',pValue);
		break;
		}
	}

	function return_Item(seq,start_newlin,nullText){
	 var lReturn = '';
	 var lPageNumber = '';
	 lReturn += seq+'^cjb#';
	 lReturn += start_newlin+'^cjb#';
	 lReturn += (isEmpty(this.inputs[0]) || this.inputs[0].value == 'P'+gPO.page_id+'_')?'P'+gPO.page_id+'_'+nullText+'^cjb#':this.inputs[0].value+'^cjb#';
	 lReturn += (isEmpty(this.label) && this.inputs[0].value == 'P'+gPO.page_id+'_')?'label_'+nullText+'^cjb#':this.label.value+'^cjb#';
	 lReturn += this.item.getAttribute('apex:type')+'^cjb#';
	 lReturn += this.item.getAttribute('apex:id');
	 lReturn += ']]';
   return lReturn;
	}
}


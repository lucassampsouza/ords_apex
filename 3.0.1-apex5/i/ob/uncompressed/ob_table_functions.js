var g_conCount = 1;
var g_fkCount = 1;
var g_ukCount = 1;

/*Shows hides values*/
function ob_TableToggleType(pThis){
  var l_HolderTR = html_CascadeUpTill(pThis,'TR');
  var l_Inputs = l_HolderTR.getElementsByTagName('input');
  var l_Selects = l_HolderTR.getElementsByTagName('select');
  var l_Size = l_Inputs[1];  // is actually precision
  var l_Scale = l_Inputs[2];
  var l_Comments = l_Inputs[3];
  var l_DataType = pThis.value;
  var l_Identity = l_Selects[1];

  if (l_DataType=="0") {
    html_HiddenElement(l_Comments); }
  else {
    html_VisibleElement(l_Comments); }

  // depending on the data type, some fields are disabled
  if ('VARCHAR2:NVARCHAR2:RAW:CHAR:NCHAR:TIMESTAMP:TIMESTAMP WITH TIME ZONE:TIMESTAMP WITH LOCAL TIME ZONE'.indexOf(l_DataType) >= 0) {
    // only scale is enabled
    html_VisibleElement(l_Scale);
    html_HiddenElement(l_Size);
    html_HiddenElement(l_Identity);
    l_Size.value = ''; }
  else if ('FLOAT:INTERVAL YEAR TO MONTH'.indexOf(l_DataType) >= 0) {
    // only size/precision is enabled
    html_VisibleElement(l_Size);
    html_HiddenElement(l_Scale);
    l_Scale.value = '';
    if (l_DataType == 'FLOAT') {html_VisibleElement(l_Identity);} }
  else if ('NUMBER:INTERVAL DAY TO SECOND'.indexOf(l_DataType) >= 0) {
    // scale and size are visible
    html_VisibleElement(l_Scale);
    html_VisibleElement(l_Size);
    if (l_DataType == 'NUMBER') {html_VisibleElement(l_Identity);} }
  else {
    // for all other data types nothing is enabled
    html_HiddenElement(l_Scale);
    html_HiddenElement(l_Size);
    html_HiddenElement(l_Identity);
    l_Scale.value = '';
    l_Size.value = ''; }
} // ob_TableToggleType

function addTableRow2(pThis,pThat,pNum){
        var tt = html_GetElement(pThat);
        var ttb = tt.getElementsByTagName("tbody")[0];
        var l_newRows = [];
        for(i=0;i<pNum;i++){
          var ogTR = tt.rows[tt.rows.length -1];
          var trClone = ogTR.cloneNode(true);
          if(document.all){
            myNewRow = tt.insertRow(tt.rows.length);
            oReplace = myNewRow.replaceNode(trClone);
          }else{
            ttb.appendChild(trClone);
          }
          l_newRows[l_newRows.length] = trClone;

          var tSelects = trClone.getElementsByTagName('select');
          for(var iSelects=0;iSelects<tSelects.length;iSelects++){
              tSelects[iSelects].selectedIndex = 0;
              tSelects[iSelects].disabled="";
           }
          var tInputs = trClone.getElementsByTagName('input');
          for(var iInputs=0;iInputs<tInputs.length;iInputs++){
            if(tInputs[iInputs].type=="text"){
            tInputs[iInputs].value="";
            tInputs[iInputs].disabled="";
            }
          }
        }
        // update new row references to new row num
        var lRowNumSpan$ = $( 'span[id^="r"]', l_newRows );
        var lOldRowNum = parseInt(lRowNumSpan$.text(), 10);
        var lNewRowNum = lOldRowNum + 1;
        lRowNumSpan$.attr( 'id', 'r' + lNewRowNum);
        lRowNumSpan$.text( lNewRowNum );
        $( ":input", l_newRows ).each( function() {
            if ( this.id ) {
                // replace all occurrences of old row num with new in IDs
                var lNewId = this.id.replace(lOldRowNum, lNewRowNum );
                this.id = lNewId;
            }
            if ($(this).filter( "[aria-labelledby]").length > 0 ) {
                // replace all in aria attributes also, if present
                var lNewAttr = $(this).attr( "aria-labelledby").replace("r" + lOldRowNum, "r" + lNewRowNum );
                $(this).attr( "aria-labelledby", lNewAttr );
            }
        });
        // set focus to first column in new row, for 'Column Name'
        $( ':input[id^="tblname"]', l_newRows ).focus();

    return l_newRows;
}

/*Add table row for add column*/
function ob_TableAddColumn(pThis,pThat,pNum){
//  html_GetElement("P602_COLUMNS").value =  html_GetElement("P602_COLUMNS").value +1;

  var newRows = addTableRow2(pThis,pThat,pNum);
  for (var i = 0;i<newRows.length;i++){
    var l_Inputs = newRows[i].getElementsByTagName('input');
    html_HiddenElement(l_Inputs[1]);
    html_HiddenElement(l_Inputs[2]);
  }
}


function ob_TablePrevInit(){
    var lTable = html_GetElement('htmldbNewTable');
    var lRows = html_GetElement('htmldbNewTable').rows;
    for(var i=1;i<lRows.length;i++){
      var lTemp = lRows[i].getElementsByTagName('SELECT')[0];
      ob_TableToggleType(lTemp)
    }



}

function ob_createTableSeq(val){
      var pkVal = '';
  if ( val == "NEW_SEQUENCE" ) {
      html_HideItemRow('P604_EXISTING_SEQUENCE');
      html_HideItemRow('P604_PK2');
      html_ShowItemRow('P604_PK1');
      html_ShowItemRow('P604_NEW_SEQUENCE');
      html_ShowItemRow('P604_PK1_NAME');
      pkVal = html_GetElement('P604_PK1').value;
  } else if ( val == "EXISTING_SEQUENCE" ) {
      html_ShowItemRow('P604_EXISTING_SEQUENCE');
       html_HideItemRow('P604_NEW_SEQUENCE');
       html_HideItemRow('P604_PK2');
       html_ShowItemRow('P604_PK1');
       html_ShowItemRow('P604_PK1_NAME');
       pkVal = html_GetElement('P604_PK1').value;
  } else if ( 'NOT_GENERATED:IDENTITY'.indexOf(val) >= 0 ) {
       html_HideItemRow('P604_EXISTING_SEQUENCE');
       html_HideItemRow('P604_NEW_SEQUENCE');
       html_ShowItemRow('P604_PK1');
       html_ShowItemRow('P604_PK2');
       html_ShowItemRow('P604_PK1_NAME');
       pkVal = html_GetElement('P604_PK1').value;
  } else if ( val == "NONE" ) {
//      html_GetElement('P604_EXISTING_SEQUENCE').value = '';
       html_HideItemRow('P604_EXISTING_SEQUENCE');
//      html_GetElement('P604_NEW_SEQUENCE').value = '';
       html_HideItemRow('P604_NEW_SEQUENCE');
//      html_GetElement('P604_PK1_NAME').value = '';
       html_HideItemRow('P604_PK1_NAME');
//       html_ResetSelect('P604_PK1')
       html_HideItemRow('P604_PK1');
//       html_ResetSelect('P604_PK2')
       html_HideItemRow('P604_PK2');
  }
      var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=1504518033640244',0);
       get.add('P604_EXISTING_SEQUENCE', html_GetElement('P604_EXISTING_SEQUENCE').value );
       get.add('P604_NEW_SEQUENCE', html_GetElement('P604_NEW_SEQUENCE').value );
       get.add('P604_PK2', html_GetElement('P604_PK2').value );
       var foo1 = html_GetElement('P604_PK1').value ;
       get.add('P604_PK1', pkVal );
       get.add('P604_PK1_NAME', html_GetElement('P604_PK1_NAME').value );
       var foo = html_RadioValue('P604_PK_TYPE') ;
       get.add('P604_PK_TYPE', html_RadioValue('P604_PK_TYPE') );
      var ret = get.get();
       get = null;
}

function ob_createTableGetFK() {
    var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=1504518033640244',0);
    get.add('P145_FK_TABLE', html_GetElement("P145_FK_TABLE").value );
    var ret = get.get();
    get = null;
}

function ob_createTableFKCols() {
    var refTable = html_GetElement("P145_FK_REF_TABLE").value;
    var obSchema = html_GetElement("P145_SCHEMA").value;
    var cols = html_GetElement("P145_FK_REF_COLUMN");
    if (refTable != '') {
      var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=29884608907915599',0);
        get.add('P145_FK_REF_TABLE', refTable );
        get.add('OB_SCHEMA', obSchema);
      var ret = get.get();
      if (ret == 'NONE') {
        html_HideItemRow(cols);
        return;
      }
      cols.options.length = 0;
      var nCols = ret.split(';');
      html_GetElement("P145_FK_REF_TABLE").value = nCols[0];
      var sOpt = '';
      for(i=1;i<nCols.length;i++){
        if (nCols[i] != '') {
          sOpt = new Option(nCols[i],nCols[i],false,false);
          cols.options[cols.options.length] = sOpt;
        }
      }
      html_ShowItemRow(cols);
      get = null;
      Shuttle2 = new dhtml_ShuttleObject('P145_FK_REF_COLUMN','P145_FK_REF_COLUMN_SEL');
    } else {
      html_HideItemRow(cols);
    }
}


function ob_getOpts(sList) {
    sList = html_GetElement(sList).options;
    var dOptions = '';
    for (var intLoop=0; intLoop < sList.length; intLoop++) {
        if (intLoop > 0) {
            dOptions = dOptions+',';
        }
        dOptions = dOptions+sList[intLoop].value;
     }
     return dOptions;
 }


function ob_addFk() {
    // to table
    var toTable = html_GetElement('P145_FK_REF_TABLE').value;
    // to columns
    var toCols = ob_getOpts('P145_FK_REF_COLUMN_SEL');
    // from columns
    var fromCols = ob_getOpts('P145_FK_THIS_COLUMN_SEL');
    // fk name
    var fkName = html_GetElement('P145_FK_NAME').value;
    // fk action
    var fkAction = html_RadioValue('P145_FK_ACTION');
    // holders
    var fkHolder = html_GetElement('htmldbNewTable');

    var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=172369000165936003',0);
        get.add('P145_FK_REF_TABLE', toTable );
        get.add('P145_TO_COLS', toCols );
        get.add('P145_FROM_COLS', fromCols );
        get.add('P145_FK_NAME', fkName );
        get.add('P145_FK_ACTION', fkAction );
    var ret = get.get();
    if (ret.indexOf('HTMLDB:ERROR') > 0) {
      html_GetElement('htmldbMessageHolder').innerHTML = ret;
    } else {

	  html_GetElement('htmldbNewTable').parentNode.innerHTML = ret;
      html_GetElement('P145_FK_REF_TABLE').value = '';
      html_GetElement('P145_FK_REF_COLUMN_SEL').options.length = 0;
      // html_GetElement('P145_FK_THIS_COLUMN_SEL').options.length = 0;
      g_fkCount += 1;
      html_GetElement('P145_FK_NAME').value = html_GetElement('P145_TABLE_NAME').value+'_fk'+g_fkCount;
      html_HideItemRow('P145_FK_REF_COLUMN');
      html_HideItemRow('P145_FK_REF_COLUMN_SEL');
      //html_GetElement('htmldbMessageHolder').innerHTML = '';
	  html_RemoveAllChildren('htmldbMessageHolder');
	  Shuttle.reset();
    }
      var foo = '';
}

function ob_rmFkRow(rowId) {
    var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=172867829404455433',0);
        get.add('P145_FK_SEQ', rowId );
    var ret = get.get();
    x = html_GetElement('fkTab_'+rowId);
	x.parentNode.removeChild(x);
}

function ob_addCons() {
    // const name
    var conName = html_GetElement('P149_NAME').value;
    // unique columns
    var uCols = ob_getOpts('P149_SEL_COLS');
    // check constraints
    var chkCons = html_GetElement('P149_CHECK').value;
    // cons type
    var consType = html_RadioValue('P149_CONST_TYPE');

    var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=176127519858657209',0);
        get.add('P149_NAME', conName );
        get.add('P149_SEL_COLS', uCols );
        get.add('P149_CHECK', chkCons );
        get.add('P149_CONST_TYPE', consType );
    var ret = get.get();
    if (ret.indexOf('HTMLDB:ERROR') > 0) {
      html_GetElement('htmldbMessageHolder').innerHTML = ret;
    } else {
	  html_GetElement('htmldbNewTable').parentNode.innerHTML = ret;
      html_GetElement('P149_CHECK').value = '';
      html_GetElement('P149_SEL_COLS').options.length = 0;
      if ( consType == 'C' ) {
        g_conCount += 1;
        html_GetElement('P149_NAME').value = html_GetElement('P149_TABLE_NAME').value+'_ck'+g_conCount;
      } else {
        g_ukCount += 1;
        html_GetElement('P149_NAME').value = html_GetElement('P149_TABLE_NAME').value+'_uk'+g_ukCount;
      }
      html_GetElement('htmldbMessageHolder').innerHTML = '';
      Shuttle.reset();
    }
}

function ob_rmConsRow(rowId) {
    var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=176138206577719675',0);
        get.add('P149_CONS_SEQ', rowId );
    var ret = get.get();
    x = html_GetElement('consTab_'+rowId);
	x.parentNode.removeChild(x);
}


     var gLastFilteredKey;
 function ob_DelayTableSearch(e){
     gLastFilteredKey=new Date();
     setTimeout(delayedFilter,250);
   }

   function delayedFilter(){
     if (((new Date() - gLastFilteredKey )) > 250 ) {
       ob_createTableFKCols();
     }else{
       setTimeout(delayedFilter,250);
     }
   }

function p149_RadioTog(){
var curVal = html_RadioValue('P149_CONST_TYPE') ;
  if (curVal == 'C') {
   html_ShowItemRow('P149_CHECK');
   html_HideItemRow('P149_AVAIL_COLS');
   html_HideItemRow('P149_SEL_COLS');
   html_GetElement('P149_NAME').value = html_GetElement('P149_TABLE_NAME').value+'_ck'+g_conCount;
  } else {
   html_HideItemRow('P149_CHECK');
   html_ShowItemRow('P149_AVAIL_COLS');
   html_ShowItemRow('P149_SEL_COLS');
   html_GetElement('P149_NAME').value = html_GetElement('P149_TABLE_NAME').value+'_uk'+g_ukCount;
  }
}

function ob_ToggleNN(obj) {
 var l_NextSib = obj.nextSibling;
 if(l_NextSib != null && l_NextSib.nodeType == 3){l_NextSib = l_NextSib.nextSibling}
    if (obj.checked==true) {
        obj.value = 'Y';
        l_NextSib.value = 'Y';
    } else {
        obj.value = 'N';
        l_NextSib.value = 'N';
    }
}
function ob_table_getColOrder(){
  // fixed exception but this function still does nothing useful because of bug in for loop server side doesn't care
  var l_item = html_GetElement("P602_COL_ORDER");
  var lTable = html_GetElement("htmldbNewTable");
  var l_Inputs = lTable.getElementsByTagName('input');
  var i=0;
  var ret="";
  for(i=0;i<l_Inputs.length;i++){
     if ( l_Inputs[i].id == "colname" )
       ret = ret+l_Inputs[i].value+";";
  }
  l_item.value = ret;
  return true;
}
function ob_delayOrder(){
 setTimeout(ob_table_getColOrder,500);
}
/*fix for ie unchecking checkbox on row move*/
function ob_IeRowFixStart(pThis){
  if(document.all){
		var l_row = html_CascadeUpTill(pThis,"TR");
		var l_Items = html_Return_Form_Items(l_row);
		var l_return = false;
		for (var i=0;i<l_Items.length;i++){if(l_Items[i].type == 'checkbox' && l_Items[i].checked){l_return = true}}
		return l_return
	}
}

/*fix for ie unchecking checkbox on row move*/
function ob_IeRowFixFinish(pThis,pChecked){
  if(document.all){
		var l_Items = html_Return_Form_Items(pThis);
		for (var i=0;i<l_Items.length;i++){
				if(l_Items[i].type == 'checkbox'){l_Items[i].checked = pChecked}
		}
 }
}

function ob_RowUp(pThis){
	var lCheck = ob_IeRowFixStart(pThis);
	var lRow = html_RowUp(pThis);
	ob_delayOrder();
	ob_IeRowFixFinish(lRow,lCheck);
	return false;
}

function ob_RowDown(pThis){
	var lCheck = ob_IeRowFixStart(pThis);
	var lRow = html_RowDown(pThis);
	ob_delayOrder();
	ob_IeRowFixFinish(lRow,lCheck);
	return false;
}

function ob_setDataType(){
	// get current page number and use it as prefix
  var lItemPrefix = 'P'+$v('pFlowStepId')+'_';
  // depending on the data type, some fields are disabled
  var lDataType = $v(lItemPrefix+'DATATYPE');
  if ('VARCHAR2:NVARCHAR2:RAW:CHAR:NCHAR'.indexOf(lDataType) >= 0) {
    // only length is enabled
    $x_disableItem(lItemPrefix+'LENGTH', false);
    $x_disableItem([lItemPrefix+'PRECISION', lItemPrefix+'SCALE'], true);
    $x_Value([lItemPrefix+'PRECISION',lItemPrefix+'SCALE'], ''); }
  else if ('FLOAT:INTERVAL YEAR TO MONTH'.indexOf(lDataType) >= 0) {
    // only precision is enabled
    $x_disableItem(lItemPrefix+'PRECISION', false);
    $x_disableItem([lItemPrefix+'LENGTH', lItemPrefix+'SCALE'], true);
    $x_Value([lItemPrefix+'LENGTH',lItemPrefix+'SCALE'], ''); }
  else if ('TIMESTAMP:TIMESTAMP WITH TIME ZONE:TIMESTAMP WITH LOCAL TIME ZONE'.indexOf(lDataType) >= 0) {
    // only scale is enabled
    $x_disableItem(lItemPrefix+'SCALE', false);
    $x_disableItem([lItemPrefix+'LENGTH', lItemPrefix+'PRECISION'], true);
    $x_Value([lItemPrefix+'LENGTH',lItemPrefix+'PRECISION'], ''); }
  else if ('NUMBER:INTERVAL DAY TO SECOND'.indexOf(lDataType) >= 0) {
    // precision and scale are enabled
    $x_disableItem([lItemPrefix+'PRECISION', lItemPrefix+'SCALE'], false);
    $x_disableItem(lItemPrefix+'LENGTH', true);
    $x_Value([lItemPrefix+'LENGTH'], ''); }
  else {
    // nothing is enabled
    $x_disableItem([lItemPrefix+'LENGTH', lItemPrefix+'PRECISION', lItemPrefix+'SCALE'], true);
    $x_Value([lItemPrefix+'LENGTH', lItemPrefix+'PRECISION', lItemPrefix+'SCALE'], ''); }
}; // ob_setDataType

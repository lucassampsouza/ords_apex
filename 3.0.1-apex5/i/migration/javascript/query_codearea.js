var isMax = false;
var isvalid = false;
var iscompiled = false;

function saveCode(){

   var get = new htmldb_Get(null,4400,'VALIDATE_CODE',46, null, 'wwv_flow.accept');
   var plsqlCode = lEditor.getValue();
   var i=0;

   get.addParam('f02',plsqlCode.length);

   if (plsqlCode.length<=4000) {
     get.addParam('f01',plsqlCode);
   } else {
     while (plsqlCode.length>4000) {
       get.addParam('f01',plsqlCode.substr(0,4000));
       plsqlCode = plsqlCode.substr(4000,plsqlCode.length-4000);
       i++;
     }
     get.addParam('f01',plsqlCode);
   }

   var x = get.get('FULL');

}


function setHiddenSql(){

   var get = new htmldb_Get(null,4400,'VALIDATE_CODE',42, null, 'wwv_flow.accept');
   var sqlCode = lEditor.getValue();

   var i=0;
   get.addParam('f02',sqlCode.length);

   if (sqlCode.length<=4000) {
     get.addParam('f01',sqlCode);
   } else {
     while (sqlCode.length>4000) {
       get.addParam('f01',sqlCode.substr(0,4000));
       plsqlCode = sqlCode.substr(4000,sqlCode.length-4000);
       i++;
     }
     get.addParam('f01',sqlCode);
   }

   html_GetElement('P42_HIDDEN_SQL').value = sqlCode;
   var x = get.get('FULL');

}


function saveStatus(){

   var get = new htmldb_Get(null,4400,'SAVE_STATUS',42, null, 'wwv_flow.accept');
   var status = '';

   if (isvalid) {
     status = 'VALID';
   } else {
     status = 'INVALID';
   }
   get.addParam('f03', status);

   var x = get.get('FULL');

}


function validate(){

   var get = new htmldb_Get(null,4400,'APPLICATION_PROCESS=validate_sql',0);
   var message = get.get('FULL');
   var status = message.substr(0,1);

   if (status=='0') {
     message = message.substr(1);
   } else {
     message = message.substr(0);
   }

   if (message.length>1) {
     html_GetElement('results').innerHTML = message;
   } else {
     isvalid = true;
     html_GetElement('results').innerHTML = '<p> Query validated </p>';
   }
   if (status=='0') {
      html_GetElement('results').className = 'compileFailure';
   } else {
      html_GetElement('results').className = 'compileSuccess';
   }


}


function isValid(){

   var get = new htmldb_Get(null,4400,'VALIDATE_CODE',46, null, 'wwv_flow.accept');
   var plsqlCode = lEditor.getValue();
   var i=0;

   get.addParam('f02',plsqlCode.length);

   if (plsqlCode.length<=4000) {
     get.addParam('f01',plsqlCode);
   }
   else {
     while (plsqlCode.length>4000) {
       get.addParam('f01',plsqlCode.substr(0,4000));
       plsqlCode = plsqlCode.substr(4000,plsqlCode.length-4000);
       i++;
     }
     get.addParam('f01',plsqlCode);
   }

   var message = get.get('FULL');

   var status = message.substr(0,1);
   var lMessage = html_GetElement('results')
   if (status=='0') {
       lMessage.className = 'compileFailure';
       lMessage.innerHTML = message.substr(1);
   }
   else if (status=='1'){
       lMessage.className = 'compileSuccess';
       lMessage.innerHTML = message.substr(1);
   }
  else {
       lMessage.className = 'compileFailure';
       lMessage.innerHTML = message;
    }

/*  if (status=='0') {
     html_GetElement('results').className = 'compileFailure';
  }
  else {
      html_GetElement('results').className = 'compileSuccess';
  } */

}


function doCompile(){
  setHiddenSql();
  saveCode();

   var get = new htmldb_Get(null,4400,'APPLICATION_PROCESS=compile_sql_query',0);
   var message = get.get('FULL');
   var status = message.substr(0,1);

   if (status=='0') {
     message = message.substr(1);
   } else {
     message = message.substr(0);
   }

   if (message.length>1) {
     html_GetElement('results').innerHTML = message;
   } else {
     iscompiled = true;
     html_GetElement('results').innerHTML = '<p> Query compiled successfully </p>';
   }
   if (status=='0') {
      html_GetElement('results').className = 'compileFailure';
   } else {
      html_GetElement('results').className = 'compileSuccess';
   }

/*   var get = new htmldb_Get(null,4400,'COMPILE_CODE',42, null, 'wwv_flow.accept');
   var plsqlCode = html_GetElement("e").value;
   var i=0;

   get.addParam('f02',plsqlCode.length);

   if (plsqlCode.length<=4000) {
     get.addParam('f01',plsqlCode);
   } else {
     while (plsqlCode.length>4000) {
       get.addParam('f01',plsqlCode.substr(0,4000));
       plsqlCode = plsqlCode.substr(4000,plsqlCode.length-4000);
       i++;
     }
     get.addParam('f01',plsqlCode);
   } */

}



function goToLine(lineID){
}


function downloadCode() {
   saveCode();
   doSubmit('DOWNLOAD_CODE');
}

function findInCodeArea(searchString, caseSensitive, notFoundMsg) {
  var searchHandler = lEditor.getSearchCursor(searchString, true, (!caseSensitive));
  if (searchHandler.findNext()) {
    searchHandler.select();
  } else {
    alert(searchString + ' ' + notFoundMsg);
  }
}

function replaceInCodeArea(searchString, replaceString, caseSensitive, notFoundMsg) {
  if (lEditor.options.readOnly===false) {
    // if something has already been selected, replace it. Otherwise execute a search
    if (lEditor.selection()) {
      lEditor.replaceSelection(replaceString);
    } else {
      findInCodeArea(searchString, caseSensitive, notFoundMsg);
    }
  }
}

function replaceAllInCodeArea(searchString, replaceString, caseSensitive) {
  if (lEditor.options.readOnly===false) {
    // always start from beginning to replace everything in the document
    var searchHandler = lEditor.getSearchCursor(searchString, false, (!caseSensitive));
    while(searchHandler.findNext()){
      searchHandler.replace(replaceString);
    }
  }
}
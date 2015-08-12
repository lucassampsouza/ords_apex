var isMax = false;

function saveCode(){

   var get = new htmldb_Get(null,4400,'SAVE_CODE',46, null, 'wwv_flow.accept');

   var plsqlCode = lEditor.getValue();
   var i=0;

   // Wrap SQL statement in CREATE VIEW syntax
   plsqlCode = 'CREATE OR REPLACE VIEW "' + html_GetElement('P30_VIEW_NAME').value + '" AS ' + plsqlCode + ' / ';
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

   // View name to be saved to the wwv_mig_rev_queries revision table
   var viewname = html_GetElement('P30_VIEW_NAME').value;
   //alert('view name is: ' + viewname);
   get.addParam('f03',viewname);

   var sqlStmt = lEditor.getValue();
   //alert('sql stmt is : ' + sqlStmt);
   get.addParam('f04',sqlStmt);
   get.addParam('f05','VIEW');

   var message = get.get('FULL');

var status = message.substr(0,1);
 var lMessage = html_GetElement('results')
    if (status=='0') {
       lMessage.className = 'compileFailure';

lMessage.innerHTML = message.substr(1);
    }else if (status=='1'){
       lMessage.className = 'compileSuccess';

lMessage.innerHTML = message.substr(1);
    }

  else {
       lMessage.className = 'compileFailure';
       lMessage.innerHTML = message;
    }

    //html_GetElement('results').innerHTML = lMessage;
   if (status=='0') {
      html_GetElement('results').className = 'compileFailure';
   } else {
      html_GetElement('results').className = 'compileSuccess';
}


}


function doCompile() {
   saveCode();

}


function doCompile2(){

   saveCode();

   // ON_DEMAND process to compile view
   //var get = new htmldb_Get(null,4400,'APPLICATION_PROCESS=compile_view',0);
   //var message = get.get('FULL');
   //var status = message.substr(0,1);
   //message = message.substr(1);
   //message = message.substr(0);
   //alert('status= :'+status);

    if (status=='0') {
     message = message.substr(1);
   }
   else if (status=='1') {
     message = message.substr(1);
   } else {
     message = message.substr(0);
   }

    //if (message.length>1) {
     html_GetElement('results').innerHTML = message;
    //} else {
    // iscompiled = true;
     //html_GetElement('results').innerHTML = message; //'<p> View compiled successfully </p>';
   //}
   /* if (status=='0') {
      html_GetElement('results').className = 'compileFailure';
   } else {
      html_GetElement('results').className = 'compileSuccess';
   }

*/

   /* html_GetElement('results').innerHTML = message;
   if (status=='0') {
      html_GetElement('results').className = 'compileFailure';
   } else {
      html_GetElement('results').className = 'compileSuccess';
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

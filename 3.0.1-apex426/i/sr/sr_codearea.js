var g_run;

function sr_postScript(req){
	 var maxLength = html_GetElement("P60_MAX_LENGTH").value;
	 var fileID = "";
	 var scriptName = "";
	 var plsqlCode = "";
	 var dupFlag = "";

	 if (html_GetElement("P60_FILE_ID")) {
     fileID = html_GetElement("P60_FILE_ID").value;
   }
   if (html_GetElement("P60_SCRIPT_NAME")) {
     scriptName = html_GetElement("P60_SCRIPT_NAME").value;
   }

   var plsqlCode = lEditor.getCode();

	 var scriptLength = plsqlCode.length;

	 if (scriptName == "") {
	 	  alert(htmldb_null_script_name);
	 	  g_error = true;
      return;
   }
   if (plsqlCode == "") {
   	  alert(htmldb_null_script);
   	  g_error = true;
      return;
   }
   if ( ! sr_validateName(scriptName )) {
     alert(htmldb_invalid_script_name);
     g_error = true;
     return;
   }
   if (req != 'GET') {
   	 dupFlag = sr_dupName();
     if ( ! g_popUpOpened && dupFlag == 'FAIL') {
     	 sr_openSavePopup();
     	 g_error = true;
     	 return;
     }
     else if ( ! g_popUpOpened && dupFlag == 'FAIL_RENAME') {
     	 alert(htmldb_rename_script_name);
     	 g_error = true;
     	 return;
     }
     else if ( dupFlag == 'SAVE_NEW' && req != 'CREATE') {
     	 g_saveNew = true;
     }
     if (scriptLength > maxLength) {
     	 alert(htmldb_max_script_size);
     	 g_error = true;
     	 return;
     }
   }

   var get = new htmldb_Get(null,4500,req,60, null,'wwv_flow.accept');
     get.addParam('f02',fileID);
     get.addParam('f03',scriptName);

     var i=0;
     if (plsqlCode.length<=4000) {
       get.addParam('f01',plsqlCode);
     }
     else {
       while (plsqlCode.length>4000) {
         get.addParam('f01',plsqlCode.substr(0,4000));
         plsqlCode = plsqlCode.substr(4000,plsqlCode.length-4000);
         i++;
     }
     get.addParam('f01',plsqlCode.substr(0,4000));
     }

   cDebug(get.url());
   var x = get.get();
   get = null;
   cDebug(x);
}

function sr_saveScript(){
	 g_error = false;
	 g_popUpOpened = false;
	 g_saveNew = false;
	 g_run = false;
   sr_postScript('SAVE');
   if (g_error) {
     return;
   }
   if (g_saveNew) {
     var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=sr_create_script',0);
   }
   else {
     var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=sr_save_script',0);
   }
	 var x = get.get();
	 get = null;
	 doSubmit('PARSE');
}

function sr_replaceScript(){
	 g_error = false;
	 g_popUpOpened = true;
   sr_postScript('SAVE');
   if (g_error) {
     return;
   }
   var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=sr_replace_script',0);
	 var x = get.get();
	 get = null;
	 if (g_run) {
	   doSubmit('REPLACE_RUN');
	 }
	 else {
	   doSubmit('PARSE');
	 }
}

function sr_createScript(){
	 g_error = false;
	 g_popUpOpened = false;
   sr_postScript('CREATE');
   if (g_error) {
     return;
   }
   var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=sr_create_script',0);
	 var x = get.get();
	 get = null;
	 doSubmit('PARSE');
	 return;
}

function sr_runScript(){
	 g_error = false;
	 g_popUpOpened = false;
	 g_saveNew = false;
	 g_run = true;
   sr_postScript('SAVE');
   if (g_error) {
     return;
   }
   if (g_saveNew) {
     var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=sr_create_script',0);
   }
   else {
     var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=sr_save_script',0);
   }
	 var x = get.get();
	 get = null;
	 doSubmit('RUN');
}

function sr_createRunScript(){
	 g_error = false;
	 g_popUpOpened = false;
	 g_run = true;
   sr_postScript('CREATE');
   if (g_error) {
     return;
   }
   var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=sr_create_script',0);
	 var x = get.get();
	 get = null;
	 doSubmit('RUN');
}

function sr_downloadScript() {
	 g_error = false;
	 sr_postScript('GET');
	 if (g_error) {
     return;
   }
   doSubmit('DOWNLOAD');
}


function sr_validateName(s) {
  var ret = true;
  var char2check;
  var invalidChars= ";=\/@&!#$%^*()+=-{}[]|\\:\"''<>,?/~`";

  for(var i=0;i<invalidChars.length;i++){
     char2check = invalidChars.charAt(i);
    if ( ret && s.indexOf(char2check) > -1  )
       ret = false;
  }
  return ret;
}

function sr_dupName() {
  var ret = "";
  var scriptName = html_GetElement("P60_SCRIPT_NAME").value;
  var oldScriptName = html_GetElement("P60_OLD_SCRIPT_NAME").value;
  var scriptId = html_GetElement("P60_FILE_ID").value;
  var get = new htmldb_Get(null,4500,'APPLICATION_PROCESS=sr_dup_name',0);
    get.add('P60_SCRIPT_NAME',scriptName);
    get.add('P60_OLD_SCRIPT_NAME',oldScriptName);
    get.add('P60_FILE_ID',scriptId);
  cDebug(get.url());
	var x = get.get();
	get = null;
	if ( !ret && x.substr(0,11) == 'FAIL_RENAME' ) {
	  ret = "FAIL_RENAME";
	}
	else if ( !ret && x.substr(0,4) == 'FAIL' ) {
	  ret = "FAIL";
	}
	else if ( !ret && x.substr(0,8) == 'SAVE_NEW' ) {
	  ret = "SAVE_NEW";
	}
	else {
	  ret = "SUCCESS";
	}
	return ret;
}

function sr_openSavePopup(){
  var t = sr_cascadeUpUntil(html_GetElement('saveDialog'),'TABLE');
      t.closable='1';
      t.style.zIndex = 2000;
      t.style.display = "block";
      sr_Centerme(t);
}

function sr_cascadeUpUntil(n,tag){
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

function sr_Centerme(id){
      var t = html_GetElement(id);
     if(document.all){
      l_Width = document.body.clientWidth;
      l_Height = document.body.clientHeigth;
     }
     else{
      l_Width = window.innerWidth;
      l_Height = window.innerHeight;
     }

      var tW=t.offsetWidth;
      var tH=t.offsetHeight;
      t.style.top = '20%' //parseInt(l_Height)/2 - parseInt(tH)/2;
      t.style.left = '40%' //parseInt(l_Width)/2 - parseInt(tW)/2;
}

function doSubmit(r){
	document.getElementById('pRequest').value=r;
	document.getElementById('wwvFlowForm').submit();
}

function redirect(where){
  location.href = where;
  return;
}

function confirmDelete(msg,req){
    if(req==null){req='Delete'}
    var confDel = msg;
    if(confDel ==null){
        confDel= confirm("Would you like to perform this delete action?");
    }else{
        confDel= confirm(msg);}
    if (confDel==true){doSubmit(req);}
}


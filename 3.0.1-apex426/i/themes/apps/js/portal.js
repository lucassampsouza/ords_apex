// ===============================
// = Cloud Management Javascript =
// ===============================

// Initialize HTML5 elements for IE
'article aside footer header hgroup nav section time'.replace(/\w+/g,function(n){document.createElement(n)})

initSubTabs = function(){
  $('div.porContentHeader ul.linkList li a').click(function(e){
    e.preventDefault();
    link = $(this);
    subregions = link.parents('.porContent').find('section.subContentBox');
    link.parents("ul.linkList").find('li a').removeClass('active')
    if (link.hasClass('showAllLink')) {
      subregions.show();
      link.addClass('active')
    } else {
      subregions.hide();
      $('#'+link.attr('id').substr(4)).show();
      link.addClass('active')
    }
  })
}


// ===================================
// = Fixed Scrolling for iOS Devices =
// ===================================
function isIpad() { return navigator.platform=="iPad"; }
initScroll = function() {
  if (isIpad()) {var myScroll = new iScroll('portalBody');} 
}

jQuery(document).ready(function(){
  initScroll();
  loadDropMenus();
  loadTopNav();

// var myScroll = new iScroll('portalBody');
})

// ==================
// = Dropdown Menus =
// ==================
loadDropMenus = function() {
  $('div.dropMenuContainer > a.standardButton').click(function(e){
    e.stopPropagation();
    menulink = $(this);
    menu = menulink.next();
    if (menulink.hasClass('active')) {
      menu.hide();
      menulink.removeClass('active')
    } else {
      menu.show();
      menulink.addClass('active')
      $('body').click(function(e){
        menu.hide();
        menulink.removeClass('active')
      })
    }
  })
}

// ============================
// = Top Bar Navigation Menus =
// ============================

loadTopNav = function() {
	$("body").click(function(){
		jQuery(".menuPullDown").hide();
		jQuery("li.pullDownLink","#xHeader nav").removeClass("active");
	});
	jQuery(".menuPullDown").click(function(e){
		e.stopPropagation();
	})

	// Set up tab dropdown menu
	jQuery("li.pullDownLink a","#xHeader nav").click(function(e){
		e.stopPropagation();
		currentLink = $(this);
		divToShow = currentLink.next();
		if(divToShow.css("display") == "none") {
			jQuery(".menuPullDown").hide()
			jQuery("li.pullDownLink").removeClass("active");
			currentLink.parent().addClass("active");
			divToShow.show();
		} else {
			currentLink.parent().removeClass("active");
			divToShow.hide();
		}

	})
}

// =================
// = Checklist Box =
// =================
initCheckBoxList = function() {
  $('ul.checkBoxList li input:checkbox').change(function(){
    var checkboxli = $(this).parents('li');
    checkboxli.toggleClass('checked');
  });
  // $('ul.checkBoxList li').each(function(){
  //   listitem = $(this);
  //   listitem.find('input[type=checkbox]').change(function(){
  //     listitem.addClass('checked')
  //   }, function(){
  //     listitem.removeClass('checked')
  //   })
  // })
}

// =================
// = Modal Dialogs =
// =================

openDialog = function(dialogid) {
  var dialog_obj = $('#'+dialogid);
  var dialog_title = dialog_obj.find('h2').first().text();
  dialog_obj.dialog({
    closeOnEscape  : true,
    draggable      : false,
    resizable     : false,
    modal          : true,
    title          : dialog_title,
    width          : '512',
    dialogClass    : 'portalAlert'
  })
  $('.ui-widget-overlay').live('click', function() {
       dialog_obj.dialog( "close" );
  });
  $('.ui-dialog').detach().appendTo('#wwvFlowForm');
  $('.portalAlert :input:visible:enabled:first').focus();
}


// =========================
// = Javascript New Window =
// =========================
function openWindow(url) {
	window.open(url);
}
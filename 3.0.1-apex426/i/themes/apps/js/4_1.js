'article aside footer header hgroup nav section time'.replace(/\w+/g,function(n){document.createElement(n);});

function autoFadeSuccess(){
  setTimeout(function(){
    apex.jQuery("#uSuccessMessage").animate({
      height: 0, opacity: 0
    }, 1250, function(){
      apex.jQuery(this).remove();
    });
  },4000);
}
function fadeMessages(){
  apex.jQuery(".uCloseMessage").removeAttr('onclick').click(function(){
    apex.jQuery(this).parents("section.uMessageRegion").fadeOut();
  });
}

function loadHideShowRegions(){
  apex.jQuery("a.uRegionControl").click(function(){
    var link = apex.jQuery(this);
    var content = link.parents("div.uRegionHeading").next();
    link.toggleClass("uRegionCollapsed");
    if (content.css("display") === "block") {
      content.slideUp("fast","swing");
    } else {
      content.slideDown("fast","swing");
    }
  });
}

function detailedStatusListToolTip() {
 this.xOffset = 0; // x distance from mouse
 this.yOffset = 10; // y distance from mouse

 apex.jQuery("ul.detailedStatusList > li[class!=detailedStatusListLegend]").hover(
   function(e) {
     var insideText = apex.jQuery("section.detailedListTooltip",this).html();
     this.top = (e.pageY + yOffset); this.left = (e.pageX + xOffset);
     apex.jQuery('body').append('<div id="detailedStatusListToolTip">' + insideText + '</div>' );

     apex.jQuery('div#detailedStatusListToolTip').css("top", this.top+"px").css("left", this.left+"px").delay(500).fadeIn("fast");

   },
   function() {
     apex.jQuery("div#detailedStatusListToolTip").fadeOut("false").remove();
   }
 ).mousemove(
   function(e) {
     this.top = (e.pageY + yOffset);
     this.left = (e.pageX + xOffset);
     apex.jQuery("div#detailedStatusListToolTip").css("top", this.top+"px").css("left", this.left+"px");
   }
 );
}


// ========================
// = apex.jQuery Modal Dialogs =
// ========================

function closeModal() {
  apex.jQuery(".ui-dialog-content").dialog("close");
}

function openModal(pDialogId, pDialogTriggerId, pSetFocusId, pClear ) {
    var lDlg$ = apex.jQuery( '#' + pDialogId ),
        lClear = ( !pClear ) ? false : true;

    lDlg$.dialog( {
        draggable   : false,
        resizable   : false,
        modal       : true,
        autoOpen    : true,
        width       : '600px',
        title       : apex.jQuery( "h1.modal_title", apex.jQuery( '#' + pDialogId )).text(),
        close       : function() {
            $( apex.gPageContext$ ).off( ".closedialog" );

            if ( pDialogTriggerId ) {
                apex.jQuery( "#" + pDialogTriggerId ).focus();
            }

            // Clear all fields on close, can't do it on open, because of the case where the dialog is re-opened
            // after a validation has failed.
            if ( lClear ) {
                apex.jQuery( "input[type=text]").each(function(){
                    apex.jQuery(this, "" );
                });
            }
            lDlg$.dialog("destroy");
        }
    });

    /*
     * For proper display and nesting of modal dialogs jQuery UI moves the dialog to the end of the
     * specified container. However APEX requires that the DOM order of page items (form fields)
     * not change. So before the page is submitted put the dialog regions back where they were.
     */
    $( apex.gPageContext$ ).on ( "apexpagesubmit.closedialog", function() {
        lDlg$.dialog( "close" ).css( "display", "none" );
        apex.jQuery( "#" + pDialogId + "_parent" ).append(lDlg$);
    } );

    // If custom focus has been passed to the function, use that to focus, otherwise fallback to default handling
    if ( pSetFocusId ) {
        apex.jQuery( "#" + pSetFocusId ).focus();
    }
}

// =========================
// = Content Frame SubTabs =
// =========================
function expandSection(sid) {
  var section = sid;
  apex.jQuery('#sub_'+sid).addClass('active');
  apex.jQuery(".showAllLink").removeClass('active');
  
  var all_sections = apex.jQuery('div.uFrameMain section.uHideShowRegion');

  all_sections.each(function(){
    var current = apex.jQuery(this);
    if (current.attr('id') === section) {
      // SHOW
      current.find('div.uRegionContent').show();
      current.find('a.uRegionControl').removeClass('uRegionCollapsed');
    } else {
      //HIDE
      current.find('div.uRegionContent').hide();
      current.find('a.uRegionControl').addClass('uRegionCollapsed');
    }
  });
}

function expandAllSections() {
  apex.jQuery('div.uFrameMain section.uHideShowRegion').each(function(){
    var current = apex.jQuery(this);
    current.find('div.uRegionContent').show();
    current.find('a.uRegionControl').removeClass('uRegionCollapsed');
  });
}
 function initContentFrameTabs(){
  apex.jQuery('div.uFrameRegionSelector > ul li a').click(function(e){
    e.preventDefault();
    var link = apex.jQuery(this);
    var subregions = link.parents('.uFrameMain').find('section.uHideShowRegion');
    link.parents("ul").find('li a').removeClass('active');
    if (link.hasClass('showAllLink')) {
    expandAllSections();
      // subregions.show();
      link.addClass('active');
    } else {
    expandSection(link.attr('id').substr(4));
      // subregions.hide();
      // apex.jQuery('#'+link.attr('id').substr(4)).show();
      // link.addClass('active');
    }
  });

  // read hashtag and see if it is a region that can be expanded, if so, expand the region
}

apex.jQuery(window).ready(function(){
  loadHideShowRegions();

  // initialize globals
  // initLightbox();
  initContentFrameTabs();
  fadeMessages();
  autoFadeSuccess();
  if (window.location.hash) {
    // var regiontoshow = window.location.hash;
    expandSection(window.location.hash.substr(1));

  }
});

// Dropdown Menu
function aShowMenu(pMenu) {
  var lMenuID = pMenu;
  var lMenu = apex.jQuery('#'+lMenuID);
  var lSubMenu = apex.jQuery('#'+lMenuID+'_sub');
  var lActiveMenu = apex.jQuery(".aMenuActive");
  var lMenuItems = lSubMenu.find('li');

  function closeMenu(pMenu) {
    var closeMenuObj = pMenu;
    var closeMenuSub = closeMenuObj.find('#'+closeMenuObj.attr('id')+'_sub');
    closeMenuObj.removeClass('aMenuActive');
    closeMenuSub.hide();
    closeMenuObj.find(".aDM-topLink").focus();
    apex.jQuery(document).unbind('keydown.scroll click.menuoff');
  }

  function openMenu() {
    lSubMenu.unbind('keydown.nav');
    apex.jQuery('body').unbind('click');
    lMenu.addClass('aMenuActive');
    lMenuItems.removeClass('focused');
    lSubMenu.show();
    lSubMenu.css('top',lMenu.height());
    lSubMenu.find('li').first().addClass('focused').find('a').focus();
    lSubMenu
      .bind('keydown.nav',function(e){
        var focused = lMenuItems.filter(".focused");
        var current;

        lMenuItems.removeClass('focused');
        var keyPress = e.keyCode;
        if (keyPress === 40) {
          if (!focused.length || focused.is(':last-child')) {
            current = lMenuItems.first();
          } else {
            current = focused.next();
          }
        } else if (keyPress === 38) {
          if (!focused.length || focused.is(':first-child')) {
            current = lMenuItems.last();
          } else {
            current = focused.prev();
          }
        } else if (keyPress === 27) {
          closeMenu(lMenu);
        } else if (keyPress === 9) {
          closeMenu(lMenu);
          lMenu.next().focus();
        }
        if (current) {
          current.addClass('focused').find('a').focus();
        }
      });
    apex.jQuery(document).bind('keydown.scroll',function(e){
      var keyPress = e.which;
      if (keyPress === 38 || keyPress === 40) {
        e.preventDefault();
        return false;
      }
      return true;
    }).bind('click.menuoff',function(e){
      if (apex.jQuery(e.target).parents('.aDropMenu').size()<1) {
        closeMenu(lMenu);
      }
    });
    lMenuItems.hover(function(){
      lMenuItems.removeClass('focused');
      apex.jQuery(this).addClass('focused').find('a').focus();
    }).click(function(){
      closeMenu(lMenu);
    });
  }

  if (lActiveMenu.size() > 0) {
    if (lActiveMenu.attr('id') === lMenuID) {
      closeMenu(lMenu);
    } else {
      closeMenu(lActiveMenu);
      openMenu();
    }
  } else {
    openMenu();
  }
}
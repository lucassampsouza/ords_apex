'article aside footer header hgroup nav section time'.replace(/\w+/g,function(n){document.createElement(n)})

apex.jQuery(window).ready(function(){
	loadHideShowRegions();
	
	// initialize globals
	initLightbox();
	initContentFrameTabs();
	fadeMessages();
	autoFadeSuccess();
	loadItemHelp();
});

autoFadeSuccess = function(){
	setTimeout(function(){
		apex.jQuery("#uSuccessMessage").animate({
			height: 0, opacity: 0
		}, 1250, function(){
			apex.jQuery(this).remove();
		})
	},4000)
}
fadeMessages = function(){
	apex.jQuery(".uCloseMessage").removeAttr('onclick').click(function(){
		apex.jQuery(this).parents("section.uMessageRegion").fadeOut();
	})
}

loadHideShowRegions = function(){
	apex.jQuery("a.uRegionControl").click(function(){
		link = apex.jQuery(this)
		content = link.parents("div.uRegionHeading").next();
		link.toggleClass("uRegionCollapsed");
		if (content.css("display") == "block") {
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
     var insideText = apex.jQuery("section.detailedListTooltip",this).html()
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
 )
}


// ========================
// = jQuery Modal Dialogs =
// ========================
var gBackground;
var gLightbox;

function initLightbox() {
	apex.jQuery('body').append('<div id="modalBackground"></div>')
	gBackground = apex.jQuery('#modalBackground')
	gBackground.click(function(){
	  gBackground.fadeOut(100);
	  closeModal()
	});
}

function closeModal()
{
	if (gLightbox) 
	{
	  gLightbox.removeClass("modalOn").hide();
	  gLightbox = '';
	}
	gBackground.fadeOut(100)
}

function openModal(p_div_id)
{
	gBackground.fadeIn(100);
	gLightbox = apex.jQuery('#' + p_div_id);
	gLightbox.addClass('modalOn').fadeIn(100);
}

// =========================
// = Content Frame SubTabs =
// =========================
initContentFrameTabs = function(){
  apex.jQuery('div.uFrameRegionSelector > ul li a').click(function(e){
    e.preventDefault();
    link = apex.jQuery(this);
    subregions = link.parents('.uFrameMain').find('section.uHideShowRegion');
    link.parents("ul").find('li a').removeClass('active')
    if (link.hasClass('showAllLink')) {
		expandAllSections();
      // subregions.show();
      link.addClass('active');
    } else {
		expandSection(link.attr('id').substr(4));
      // subregions.hide();
      // apex.jQuery('#'+link.attr('id').substr(4)).show();
      link.addClass('active')
    }
  })
}


function expandSection(sid) {
  section = sid;
  all_sections = apex.jQuery('div.uFrameMain section.uHideShowRegion');
  
  all_sections.each(function(){
    current = apex.jQuery(this);
    if (current.attr('id') == section) {
      // SHOW
      current.find('div.uRegionContent').show();
      current.find('a.uRegionControl').removeClass('uRegionCollapsed');
    } else {
      //HIDE
      current.find('div.uRegionContent').hide();
      current.find('a.uRegionControl').addClass('uRegionCollapsed');
    }
  })
}

function expandAllSections() {
  apex.jQuery('div.uFrameMain section.uHideShowRegion').each(function(){
    current = apex.jQuery(this);
    current.find('div.uRegionContent').show();
    current.find('a.uRegionControl').removeClass('uRegionCollapsed'); 
  })
}


// show / hide grid
function showGrid() {
  apex.jQuery('.apex_grid_container').addClass('showGrid');
}
function hideGrid() {
  apex.jQuery('.apex_grid_container').removeClass('showGrid');
}


// Help Text 
function loadItemHelp() {
	apex.jQuery('span.uItemHelp').each(function(){
		var help = apex.jQuery(this);
		var helpid = apex.jQuery(this).attr('data-item-id');
		if (apex.jQuery(help).text().length > 0) {
			apex.jQuery('#hb_'+helpid).show();
		} else {
			apex.jQuery('#hb_'+helpid).detach();
		}
	});
}
function uShowItemHelp(item_id) {
	var helptext = apex.jQuery('span[data-item-id="'+apex.util.escapeCSS(item_id)+'"]').html();
	var helptitle = apex.jQuery('label[for="'+apex.util.escapeCSS(item_id)+'"]').text();
	
	var helpDialog = apex.jQuery("#apex_popup_field_help");
	
	if (helpDialog.length === 0) {
	  helpDialog = apex.jQuery('<div id="apex_popup_field_help">'+helptext+'</div>');
	  helpDialog.dialog({
	    title: helptitle,
	    closeOnEscape: true
	  })
	} else {
	  helpDialog.html(helptext).dialog('option','title',helptitle).dialog('open');
	}
}

function loadWizardTrain() {
	var currentStep = apex.jQuery("li.current,li.first-current,li.last-current",'.uHorizontalProgressList');
	if (currentStep.prev().length > 0) {
		currentStep.prevAll().find('span').addClass("pastCurrent");
	}
}
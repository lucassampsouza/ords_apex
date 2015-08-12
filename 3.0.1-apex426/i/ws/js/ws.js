/*global apex,$s*/
/*!
 Web Sheet main controller
 Copyright (c) 20011, 2014, Oracle and/or its affiliates. All rights reserved.
 */
apex.jQuery( document ).ready(function(){
	loadSectionControls();
	loadBreadCrumbs();
	loadMenuBar();
	loadControlPanel();
	loadWizardTrain();
	// loadToolTips();
	// loadHelpTips();
	scrollTopLink();
	loadScrollingNavLinks();
	loadFormTable();
	loadCollapsableSidePane();
	initSearchField();
}); //End apex.jQuery Ready()

reInitWS = function(){
	loadSectionControls();
	loadBreadCrumbs();
	loadHelpTips();
	scrollTopLink();
	loadScrollingNavLinks();
	loadFormTable();
};

initSearchField = function(){
	apex.jQuery(".wsSearch span.right").click(function(){
		apex.jQuery("#P0_SEARCH").val("").focus();
	});

// Initialize Datagrid Search Fields
	apex.jQuery("div.searchField input").click(function(){
		placeholder = apex.jQuery(this).attr("placeholder");
		searchfield = apex.jQuery(this);
		if (searchfield.val() == placeholder) {
			searchfield.text("").val("").focus();
		} else {
			searchfield.select().focus();
		}
	}).blur(function(){
		placeholder = apex.jQuery(this).attr("placeholder");
		searchfield = apex.jQuery(this);
		if (searchfield.val() == "") {
			searchfield.text("").val(placeholder);
		}
	});

};

loadSectionControls = function(){
	apex.jQuery("a.wsSectionControl").click(function(){
		link = apex.jQuery(this);
		content = link.closest("div").find("div.wsSectionContent");
		link.toggleClass("wsSectionCollapsed");
		if (content.css("display") == "block") {
			content.slideUp("fast","swing");
		} else {
			content.slideDown("fast","swing");
		}
	});
};

loadBreadCrumbs = function(){
    apex.jQuery("#wsBreadcrumbMenu", apex.gPageContext$).menu({
        menubar: true
    });
};

loadMenuBar = function() {
    var e = apex.jQuery("#websheets_menubar", apex.gPageContext$);
    if ( e.length && apex.actions ) {
        apex.actions.addFromMarkup( e );
    }
    e.menu({
        menubarShowSubMenuIcon: true,
        menubar: true
    });
};

loadControlPanel = function(){
	apex.jQuery("a.wsControlPanel","#wsControlPanel").click(function(){
		controlPanelList = apex.jQuery("ul","#wsControlPanel");
		controlPanelHeading = apex.jQuery("h2","#wsControlPanel");
		controlPanelIcon = apex.jQuery("img#collapseAction","#wsControlPanel");
		if (controlPanelList.css("display") == "block") {
			controlPanelList.slideUp("fast","swing");
			controlPanelIcon.attr("class","expandIcon");
			controlPanelHeading.addClass("wsControlPanelCollapsed");
			
		} else {
			controlPanelList.slideDown("fast","swing");
			controlPanelIcon.attr("class","collapseIcon");
			controlPanelHeading.removeClass("wsControlPanelCollapsed")
		}
	});
};


loadWizardTrain = function() {
	currentStep = apex.jQuery("li.currentStep","ul.ebaProgressWizard");
	if (currentStep.prev().length > 0) {
		currentStep.prevAll().addClass("completedStep");
	}
};

loadToolTips = function() {
	apex.jQuery("a.annotationLink, a.annotationLinkOnly",".wsAttachments").qtip({
		style: {
			classes: 'ui-tooltip-ws-dark',
			tip: {
				width: 6,
				height: 10,
				border: 1
			}
		},
		position: {
			my: 'right center',
			at: 'left center',
			adjust: {x: 10}
		},
		content: {
			text: function() {
				msgtext =  "<em>" + html2text(apex.jQuery(this).attr('data-alias'));
				msgtext += " &mdash; " + html2text(apex.jQuery(this).attr('data-filesize')) + "</em>";
				msgtext += html2text(apex.jQuery(this).attr('title'));
				msgtext += "<span>";
				msgtext += html2text(apex.jQuery(this).attr('data-author'));
				msgtext += " &mdash; ";
				msgtext += html2text(apex.jQuery(this).attr('data-date')) + "</span>";
				return text2html(msgtext);
			},
			title: function() {
				return apex.jQuery(this).text();
			}
		},
		hide: {
			event: 'unfocus mouseleave blur',
			fixed: true,
			delay: 100
		},
		show: {
			solo: true,
			event: 'focus mouseenter',
			delay: 100
		}
	});
	apex.jQuery("a.annotationLink, a.annotationLinkOnly",".wsNotes").qtip({
		style: {
			classes: 'ui-tooltip-ws-notes',
			tip: {
				width: 6,
				height: 10,
				border: 1
			}
		},
		position: {
			my: 'right center',
			at: 'left center',
			adjust: {x: 10}
		},
		content: {
			text: function() {
				msgtext = html2text(apex.jQuery(this).attr('title'));
				msgtext += "<span>";
				msgtext += html2text(apex.jQuery(this).attr('data-author'));
				msgtext += " &mdash; ";
				msgtext += html2text(apex.jQuery(this).attr('data-date')) + "</span>";
				return text2html(msgtext);
			}
		},
		hide: {
			event: 'unfocus mouseleave blur',
			fixed: true,
			delay: 100
		},
		show: {
			solo: true,
			event: 'focus click mouseenter',
			delay: 100
		}
	});
	apex.jQuery("a.annotationLink, a.annotationLinkOnly",".wsTags").qtip({
		style: {
			classes: 'ui-tooltip-ws-dark ui-tooltip-ws-tags',
			tip: {
				width: 6,
				height: 10,
				border: 1
			}
		},
		position: {
			my: 'right center',
			at: 'left center',
			adjust: {x: 10}
		},
		content: {
			text: function() {
				msgtext = "<span>";
				msgtext += html2text(apex.jQuery(this).attr('data-author'));
				msgtext += " &mdash; ";
				msgtext += html2text(apex.jQuery(this).attr('data-date')) + "</span>";
				return text2html(msgtext);
			}
		},
		hide: {
			event: 'unfocus mouseleave blur',
			fixed: true,
			delay: 100
		},
		show: {
			solo: true,
			event: 'focus mouseenter',
			delay: 100
		}
	});
};

text2html = function(str){
	return str
		.replace(/\&lt;/g, '<')
		.replace(/\&gt;/g, '>')
		.replace(/\&amp;/g, '&')
		.replace(/\&apos;/g, '\'')
		.replace(/\&quot;/g, '"');
};

html2text = function(str) {
	return str
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/&/g, '&amp;')
		.replace(/'/g, '&apos;')
		.replace(/"/g, '&quot;');
};

scrollTopLink = function(){
	apex.jQuery("a[href=#top]").click(function(){
		apex.jQuery("html,body").animate({scrollTop: 0},'fast');
		return false;
	});
};

loadScrollingNavLinks = function(){
	apex.jQuery("a","#wsSectionNavigation").click(function(){
		apex.jQuery("html,body").animate({scrollTop: apex.jQuery(apex.jQuery(this).attr("href")).offset().top},'fast');
	});
};

loadFormTable = function(){
	apex.jQuery("input, select, textarea","table.formlayout > tbody > tr > td").focusin(function(){
		apex.jQuery(this).closest("tr").addClass("rowHighlight");
	}).focusout(function(){
		apex.jQuery(this).closest("tr").removeClass("rowHighlight");
	});
};

loadHelpTips = function(){
	if (!$x('pScreenReaderMode')) {
		apex.jQuery("label a.helpTip","table.formlayout, table.wsTable").each(function(){
		
		if (apex.jQuery(this).prev("span:not(:empty)").size() > 0) {
			  apex.jQuery(this).qtip({
					id: 'helptip',
					style: {
						classes: 'ui-tooltip-ws-notes',
						tip: {
							width: 10,
							height: 6,
							border: 1,
							mimic: 'top center'
						}
					},
					position: {
						my: 'top left',
						at: 'bottom left'
					},
					content: {
						text: function() {
							// changed from text() to html() to allow lists in help tooltips
							return apex.jQuery(this).prev("span").html();
						}
					},
					hide: {
						event: 'unfocus mouseleave blur',
						fixed: true,
						delay: 100
					},
					show: {
						solo: true,
						event: 'focus click mouseenter',
						delay: 100
					}
				});
			}
		});
	} else {
		apex.jQuery("label a.helpTip","table.formlayout").click(function(){
			var lItemId = apex.jQuery(this)[0].id,
			lSession = $v('pInstance');
			popupFieldHelpClassic(lItemId, lSession);
		});
	}
};

// ===========================
// = Edit Section Navigation =
// ===========================

applyAndGoToNextSection = function(current_page,next_section_page_id,next_section_item_name,next_section_id) {
	$s("P"+current_page+"_NEXT_SECTION_PAGE_ID",next_section_page_id);
	$s("P"+current_page+"_NEXT_SECTION_ITEM_NAME",next_section_item_name);
	$s("P"+current_page+"_NEXT_SECTION_ID",next_section_id);
	apex.submit('SAVEANDGOTONEXT');
};

applyAndGoToNextPage = function(next_page_id) {
	$s("P53_NEXT_PAGE_ID",next_page_id);
	apex.submit('GET_NEXT_PAGE');
};

loadCollapsableSidePane = function(){
	sideCol = apex.jQuery("#wsSideCol");
	apex.jQuery("#sideColControl").click(function(){
		apex.jQuery(this).find("img").toggleClass("hideIcon").toggleClass("showIcon");
		sideCol.toggleClass("wsSideColCollapsed","fast");
	});

	// apex.jQuery("span.controlMenus a.controlMenu").qtip({
	// 	id: 'panelMenu',
	// 	style: {
	// 		classes: 'ui-tooltip-ws-dark',
	// 		tip: {
	// 			width: 16,
	// 			height: 8,
	// 			mimic: 'top center',
	// 			border: 1
	// 		}
	// 	},
	// 	position: {
	// 		my: 'top right',
	// 		at: 'bottom center',
	// 		adjust: {y: -5, x: 9}
	// 	},
	// 	content: {
	// 		text: function() {
	// 			return apex.jQuery(this).next(".panelMenuContainer").html();
	// 		}
	// 	},
	// 	hide: {
	// 		effect: function() {
	// 			apex.jQuery(this).fadeOut(50);
	// 		},
	// 		fixed: true,
	// 		event: 'unfocus'
	// 	},
	// 	show: {
	// 		effect: function(api) {
	// 			apex.jQuery(this).fadeIn(50, function(){
	// 				apex.jQuery("a:first", api.elements.content).focus();
	// 		  });
	// 		},
	// 		event: 'click',
	// 		solo: true
	// 	}
	// });
	
};

initHighContrastMode = function(){
	// Replace Images with ALT Text 
	apex.jQuery('a img[src$="spacer.gif"][alt!=""]').each(function(){
		image = apex.jQuery(this);
		image.parent("a").text(image.attr("alt"));
	});
};

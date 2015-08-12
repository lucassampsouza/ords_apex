jQuery(window).ready(function(){
	$(window).keydown(function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			return false;
		}
	});
	loadPresentation();
})

	var currentSlidePointer = 0;
	var currentSlide;
	var slides;
	var totalSlides;

loadPresentation = function(){
	slides = jQuery("ul#wspSectionList > li");
	totalSlides = slides.size();
	jQuery("#totalSlides").text(totalSlides);
	currentSlide = slides.eq(currentSlidePointer);
	jQuery("#nextSectionButton").click(function(){
		nextSlide();
	})
	jQuery("#prevSectionButton").click(function(){
		prevSlide();
	})
	
		jQuery("input#slideJump").click(function(){
			jQuery(this).select();
		}).bind('change',function(){
			jQuery(this).blur();
			goToSlide(jQuery(this).val());
		}).keydown(function(e){
			if(e.keyCode == 13) {
				goToSlide(jQuery(this).val());
				jQuery(this).blur();
			}
			if(e.keyCode == 27) {
				jQuery(this).blur();
			}
		});
	
	// Set up Key Bindings
	jQuery(document).keydown(function(e){
		if(e.keyCode == 37){
			prevSlide();
			return false;
		} else if(e.keyCode == 39) {
			nextSlide();
			return false;
		} else if(e.keyCode == 27) {
			history.go(-1);
		}
	})
	
	goToSlide(1);
	
	jQuery("#togglePosition").click(function(){
		jQuery(this).toggleClass("bottomAligned");
		jQuery("#wspToolbar").toggleClass("bottomAligned");
	})
	
// Initialize Datagrid Search Fields
	apex.jQuery("div.searchField input").click(function(){
		placeholder = $(this).attr("placeholder");
		searchfield = apex.jQuery(this);
		if (searchfield.val() == placeholder) {
			searchfield.text("").val("").focus();
		} else {
			searchfield.select().focus();
		}
	}).blur(function(){
		placeholder = $(this).attr("placeholder");
		searchfield = apex.jQuery(this);
		if (searchfield.val() == "") {
			searchfield.text("").val(placeholder);
		}
	})
}

sanitizeParagraphs = function(obj){
	obj.find("p,div").each(function(){
		paragraph = jQuery(this);
		paragraphText = jQuery.trim(paragraph.html());
		if (paragraphText == "&nbsp;") {
			paragraph.remove();
		}
	});
	obj.find("p:empty").remove();
}

goToSlide = function(num) {
	if(num <= totalSlides && num > 0) {
		currentSlidePointer = num-1;
		newSlide = slides.eq(currentSlidePointer);
		currentSlide.hide();
		newSlide.show();
		currentSlide = newSlide;
		updateCounter();
		// setHash(currentSlidePointer);
		sanitizeParagraphs(currentSlide);
	} else {
		jQuery("input#slideJump").val(currentSlidePointer+1);
	}
}

nextSlide = function(){
	newSlide = currentSlidePointer + 1;
	if (newSlide >= totalSlides) {
		currentSlidePointer = 0;
		newSlide = slides.eq(0);
	} else {
		currentSlidePointer = newSlide;
		newSlide = slides.eq(newSlide);
	}
	currentSlide.fadeOut(100,function(){
		newSlide.fadeIn(100)
	});
	currentSlide = newSlide;
	sanitizeParagraphs(currentSlide);
	updateCounter();
	// setHash(currentSlidePointer);
}

prevSlide = function(){
	newSlide = currentSlidePointer - 1;
	if (newSlide < 0) {
		currentSlidePointer = (totalSlides-1);
		newSlide = slides.eq(currentSlidePointer);
	} else {
		currentSlidePointer = newSlide;
		newSlide = slides.eq(newSlide);
	}
	currentSlide.fadeOut(100,function(){
		newSlide.fadeIn(100)
	});
	currentSlide = newSlide;
	sanitizeParagraphs(currentSlide);
	updateCounter();
	// setHash(currentSlidePointer);
}

updateCounter = function(){
	jQuery("input#slideJump").val(currentSlidePointer+1)
}
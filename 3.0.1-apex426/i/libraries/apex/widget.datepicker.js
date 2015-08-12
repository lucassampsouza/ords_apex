/**
 * @fileOverview
 * The {@link apex.widget}.datepicker is used for the Date Picker widget of Oracle Application Express.
 **/

(function( widget, $ ) {

/**
 * Allows to pick date from the selector for any date-based items. Internally uses the jQuery datepicker plug-in.
 * See the plug-in docu for available options.
 *
 * @param {String} pSelector jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 * @param {String} pFormat
 * @param {String} pLocale
 *
 * @function datepicker
 * @memberOf apex.widget
 * */
widget.datepicker = function(pSelector, pOptions, pFormat, pLocale) {
  // initialize the Date Picker plug-in

  var lOnSelectCallBack = null;
  if (!pOptions.showTime || (pOptions.showTime && pOptions.showOn == 'inline')) { //sathikum added for inline with time
      lOnSelectCallBack = function(dateText, inst) {
    if (inst.inline) {
        var altField = inst.settings.altField;
        if (altField.indexOf('#') === 0 ) altField = altField.substr(1,altField.length) ; //remove an extra # used by jQuery
        if (altField) $s(altField, dateText);
    } else
        $s(inst.id, dateText);
     };
  }
  var lLang = pLocale ;
  var lOptions = $.extend({dateFormat: pFormat,duration: '', constrainInput: false,onSelect: lOnSelectCallBack, locale: lLang},pOptions);
  var lLocale = $.datepicker.regional[pLocale];
  delete lLocale.maxDate;
  delete lLocale.minDate;
  delete lLocale.defaultDate;
  delete lLocale.dateFormat;
  delete lLocale.yearRange;
  delete lLocale.numberOfMonths;
  delete lLocale.altField;
  lOptions = $.extend(lLocale,lOptions);

  var lDatePicker = $(pSelector, apex.gPageContext$).datepicker(lOptions);

  // Register apex.item callbacks
  $(pSelector, apex.gPageContext$).each(function(){
   widget.initPageItem(this.id, {
      enable      : function() {
        $('#' + this.id, apex.gPageContext$)
          .datepicker('enable')                     // call native jQuery UI enable
          .removeClass('apex_disabled');            // remove disabled class
      },
      disable   : function() {
        $('#' + this.id, apex.gPageContext$)
          .datepicker('disable')                  // call native jQuery UI disable
          .addClass('apex_disabled');             // add disabled class to ensure value is not POSTed
      },
      show      : function() {
        $('#' + this.id, apex.gPageContext$).parent().children().show();
      },
      hide      : function() {
        $('#' + this.id, apex.gPageContext$).parent().children().hide();
      }
    });
  });

}; // datepicker

})( apex.widget, apex.jQuery );

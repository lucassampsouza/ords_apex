/**
 * @fileOverview
 * The {@link apex.widget}.colorpicker allows to use a color picker dialog to pick a color.
 * Internally uses the jQuery colorpicker plug-in http://www.eyecon.ro/colorpicker/
 **/

(function( widget, $ ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function colorpicker
 * @memberOf apex.widget
 * */
widget.colorpicker = function(pSelector, pOptions) {
  $(pSelector, apex.gPageContext$).each(function() {
    var lColorPicker = $(this).ColorPicker({
                         eventName:    "xxx", // don't fire on the default click event, we have our own icon
                         onSubmit:     function(pHsb, pHex, pRgb, pElement) {
                                         $s(pElement, '#'+pHex.toUpperCase());
                                         $(pElement).ColorPickerHide();
                                       },
                         onBeforeShow: function() {
                                         $(this).ColorPickerSetColor(this.value);
                                       },
                         onShow:       function(pElement) {
                                         $(pElement).fadeIn("fast");
                                         return false;
                                       },
                         onHide:       function(pElement) {
                                         $(pElement).fadeOut("fast");
                                         return false;
                                       }
                         }),
        lColorPickerFieldset = $('#'+this.id+'_fieldset', apex.gPageContext$);

    lColorPicker
      .bind('keyup',  function(){lColorPicker.ColorPickerSetColor(this.value);})
      .bind('blur',   function(){lColorPicker.ColorPickerHide();})
      .bind('change', function(){
                        this.value = this.value.toUpperCase();
                        $("#"+this.id+'_PREVIEW', apex.gPageContext$).css("background", this.value);
                      });

    // clicking on our color picker icon should open the dialog
    $('#'+this.id+'_PICKER', apex.gPageContext$).click(function(pEvent){
      lColorPicker.ColorPickerShow();
      pEvent.preventDefault(); // otherwise the browser would jump to the top of the document because of the #
    });

    // show the current entered color in our preview icon
    $("#"+this.id+'_PREVIEW', apex.gPageContext$).css("background", this.value);

    // register item callbacks
    widget.initPageItem(this.id, {
      enable    : function() {
        if (lColorPicker.prop('disabled') === true) {
          lColorPicker
            .prop('disabled', false)
            .removeClass('apex_disabled');
          // enable color picker icons
          // bind click event handler to popup icon
          $('#'+this.id+'_PICKER', apex.gPageContext$).click(function(pEvent){
            lColorPicker.ColorPickerShow();
            pEvent.preventDefault(); // otherwise the browser would jump to the top of the document because of the #
          });
          // do other enabling on icons
          widget.util.enableIcon(lColorPickerFieldset, '#');
        }
      },
      disable   : function() {
        if (lColorPicker.prop('disabled') === false) {
          lColorPicker
            .prop('disabled', true)
            .addClass('apex_disabled');
          // disable color picker icons
          widget.util.disableIcon(lColorPickerFieldset);
        }
      },
      show      : function() {
        lColorPickerFieldset.show();
      },
      hide      : function() {
        lColorPickerFieldset.hide();
      }
    });
  });
}; // colorpicker

})( apex.widget, apex.jQuery );

/**
 * @fileOverview
 * The {@link apex.widget}.datepickerClassic allows to pick date from the selector for any date based items.
 * This is the classic, non jQuery-UI datepicker.
 **/

(function( widget, $ ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function datepickerClassic
 * @memberOf apex.widget
 * */
widget.datepickerClassic = function(pSelector, pOptions) {

  // Register apex.item callbacks
  $(pSelector, apex.gPageContext$).each(function(){
    // Store jQuery object containing the date picker icon link element
    var $lAnchor = $('#' + this.id + '_IMG', apex.gPageContext$).parent('a');
   widget.initPageItem(this.id, {
      enable      : function() {
        var lHref;
        $('#' + this.id, apex.gPageContext$)
          .prop('disabled', false)
          .removeClass('apex_disabled');
          // If old_href data is defined, set the current href to it. Otherwise just default
          // to the current href.
          // This is set if the date picker has previously been disabled
          lHref = $nvl($lAnchor.data('old_href'), $lAnchor.attr('href'));
          // enbable date picker icon
          widget.util.enableIcon($lAnchor, lHref);
      },
      disable   : function() {
        $('#' + this.id, apex.gPageContext$)
          .prop('disabled', true)
          .addClass('apex_disabled');
          // Set old_href data attribute to be the current href, used when enabling
          $lAnchor
            .data('old_href', $lAnchor.attr('href'));
            // disable date picker icon
            widget.util.disableIcon($lAnchor);
      },
      show      : function() {
        // traverse up to the table row container, and show that
        $('#' + this.id, apex.gPageContext$).closest('tr').show();
      },
      hide      : function() {
        // traverse up to the table row container, and hide that
        $('#' + this.id, apex.gPageContext$).closest('tr').hide();
      }
    });
  });
}; // datepickerClassic

})( apex.widget, apex.jQuery );

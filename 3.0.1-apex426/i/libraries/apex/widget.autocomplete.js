/**
 * @fileOverview
 * The {@link apex.widget}.autocomplete is used for a textfield widget which shows a list of values based on the entered text.
 * Internally the jQuery autocomplete plug-in http://plugins.jquery.com/project/autocompletex
 * is used. See the plug-in docu for available options.
 **/

(function( widget, $ ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {Array}  [pData]
 * @param {Object} [pOptions]
 *
 * @function autocomplete
 * @memberOf apex.widget
 * */
widget.autocomplete = function(pSelector, pData, pOptions) {

  var gAutoComplete = null;

  // Triggers the "refresh" event of the autocomplete which actually does the AJAX call
  function _triggerRefresh() {
    gAutoComplete.trigger( "apexrefresh" );
  } // _triggerRefresh

  // Clears the existing value
  function refresh() {
    // trigger the before refresh event
    gAutoComplete.trigger( "apexbeforerefresh" );

    // Clear the autocomplete field
    $s(gAutoComplete[0], "", "");

    // clear the auto complete select list
    gAutoComplete.flushCache();

    // trigger the after refresh event
    gAutoComplete.trigger( "apexafterrefresh" );
  } // refresh

  // Returns the value which should be displayed
  function formatOneColumn( pItem ) {
    var lValue = typeof pItem === "string" ? pItem : pItem[0];
    if ( lOptions.isEscaped ) {
      return apex.util.escapeHTML( lValue );
    } else {
      return lValue;
    }
  }

  function formatTwoColumn( pItem ) {
    if ( lOptions.isEscaped ) {
      return apex.util.escapeHTML( pItem.d );
    } else {
      return pItem.d;
    }
  }

  // Converts the JSON output into the format required by the autocomplete plug-in
  function parseOneColumn( pData ) {
     if ( !pData ) { return [];}
     return $.map(pData, function(pRow) {
                           return {data: pRow, value: pRow, result: pRow};
                         });
  }

  function parseTwoColumn( pData ) {
     return $.map(pData, function(pRow) {
                           return {data: pRow, value: pRow.r, result: pRow.d};
                         });
  }

  function formatResult( pValue ) { return pValue; }

  function formatMatch( pValue ) {
    return typeof pValue === "string" ? pValue : pValue[0];
  }

  // Writes the not visible value into our hidden field
  function resultTwoColumn( pEvent, pItem ) {
    $s( this.id + "_HIDDENVALUE", (pItem?pItem.r:""));
  }

  // Makes sure that our hidden field is set/cleared when necessary
  function changeTwoColumn( pEvent ) {
    if ( !this.value ) {
      $s( this.id + "_HIDDENVALUE", "");
    } else {
      // if any value is allowed, make sure to write the value into the hidden
      // field, because the "result" event doesn't fire if it's not a value
      // from the list. The "result" event will overwrite the value afterwards
      // if fired for a list entry
      if ( !pOptions.mustMatch ) { $s( this.id + "_HIDDENVALUE", this.value ); }
    }
  }

  // Reads additional data if lacy loading is active
  function retrieveData( pParameter, pSuccess ) {
    // map the parameters of the autocomplete plug-in to the APEX syntax
    // the native callback of the plugin can't be used, because it adds parameters
    // to the URL which APEX/mod_plsql isn't able to handle.

    apex.widget.util.cascadingLov(
        null,
        pOptions.ajaxIdentifier,
        {
            x01:       pParameter.q,
            x02:       pParameter.limit,
            x03:       pParameter.timestamp,
            pageItems: $( pOptions.pageItemsToSubmit, apex.gPageContext$ )
        },
        {
            optimizeRefresh: pOptions.optimizeRefresh,
            dependingOn:     $( pOptions.dependingOnSelector, apex.gPageContext$ ),
            success:         pSuccess
        });
  } // retrieveData

  // Based on our custom settings, add addition properties to the autocomplete options
  var lOptions = apex.jQuery.extend({
    formatItem:  pOptions.useHiddenField ? formatTwoColumn : formatOneColumn,
    formatResult:formatResult,
    formatMatch: formatMatch,
    parse:       pOptions.useHiddenField ? parseTwoColumn : parseOneColumn,
    multiple:    pOptions.multipleSeparator ? true : false,
    matchSubset: !pOptions.matchContains,
    isEscaped:   true
    }, pOptions);
  // clear our own attributes which are not used by the autocomplete plug-in
  delete lOptions.useHiddenField;
  delete lOptions.ajaxIdentifier;
  delete lOptions.dependingOnSelector;
  delete lOptions.optimizeRefresh;
  delete lOptions.pageItemsToSubmit;

  // initialize the autocomplete plug-in
  gAutoComplete = $( pSelector, apex.gPageContext$ ).autocomplete(( pData ) ? pData : retrieveData, lOptions );

  // the hidden field option needs special treatment when a value is selected
  if ( pOptions.useHiddenField ) {
    gAutoComplete
      .result( resultTwoColumn )
      .change( changeTwoColumn );
    }

  // if it's a cascading select list we have to register change events for our masters
  if ( pOptions.dependingOnSelector ) {
    $( pOptions.dependingOnSelector, apex.gPageContext$ ).change( _triggerRefresh );
  }
  // register the refresh event which is triggered by triggerRefresh or a manual refresh
  gAutoComplete.bind( "apexrefresh", refresh );

}; // autocomplete

})( apex.widget, apex.jQuery );

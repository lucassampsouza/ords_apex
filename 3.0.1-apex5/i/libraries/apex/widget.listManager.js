/**
 * @fileOverview
 * The {@link apex.widget}.listManager is used for the List Manager widget of Oracle Application Express.
 **/

(function( widget, $, undefined ) {

/**
 * @param {String} pSelector jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function listManager
 * @memberOf apex.widget
 * */
widget.listManager = function(pSelector, pOptions) {

  // Default our options and store them with the "global" prefix, because it's
  // used by the different functions as closure
  var gOptions = $.extend({
                   dependingOnSelector:null,
                   optimizeRefresh:true,
                   pageItemsToSubmit:null,
                   filterWithValue:false,
                   windowParameters:null
                   }, pOptions),
      gListManager = $(pSelector, apex.gPageContext$);

  $(pSelector, apex.gPageContext$).each(function(){
    // register callbacks
   widget.initPageItem(this.id, {
        enable      : function() {
            // store fieldset dom element that contains all the list manager's elements
            var lFieldset;
            lFieldset = $x(this.id + '_fieldset');

            // enable all the input elements
            $(':input', lFieldset)
              .prop('disabled', false)          // enable all input elements in the fieldset
              .filter('[type!=button]')         // filter out buttons
              .removeClass('apex_disabled');    // and remove class from non buttons

            // register the click event for the icon anchor to call the popup lov dialog
            registerIconEvent();

            // enable the icon, don't pass a value for pClickHandler as this has been
            // rebound via registerIconEvent
            widget.util.enableIcon($(lFieldset), '#');

        },
        disable     : function() {
            // store fieldset dom element that contains all the list manager's elements
            var lFieldset;
            lFieldset = $x(this.id + '_fieldset');

            // deselect all options first
            $('option:selected', $x(this.id)).attr('selected', false);

            // disable all the input elements
            $(':input', lFieldset)
              .prop('disabled', true)           // disble all input elements in the fieldset
              .filter('[type!=button]')         // filter out buttons
              .addClass('apex_disabled');       // and add class to non buttons

            // disable the icon
            widget.util.disableIcon($(lFieldset));

        },
        hide        : function() {
            $('#' + this.id + '_fieldset', apex.gPageContext$).hide();
        },
        show        : function() {
            $('#' + this.id + '_fieldset', apex.gPageContext$).show();
        },
        setValue    : function(pValue) {
            var lValueArray, lHtml;
            // only proceed with set if pValue is not undefined
            if (typeof(pValue) !== 'undefined'){
                lValueArray = [];
                // set new value, we don't check if value exists here as the existing list manager
                // allows any value to be added to the list
                // create array from pValue
                lValueArray = apex.util.toArray(pValue);
                // loop through lValue array and build new options html string
                $.each(lValueArray, function(key, value) {
                    value = apex.util.escapeHTML( value );
                    lHtml += '<option value="' + value + '">' + value + '</option>';
                });
                gListManager                // select list manager
                    .find('option')             // find options
                        .remove()                   // remove them
                        .end()                      // end option find
                    .append(lHtml);             // append new options
            }
        },
        getValue    : function() {
            var lReturn = [];
            // iterate over list manager options and populate array with values
            $('option', gListManager[0]).each(function(){
                lReturn[lReturn.length] = this.value;
            });
            return lReturn;
        },
        addValue    : function( pValue ) {
            var lItems = pValue.split(","), // List manage supports adding multiple, comma separated values
                lItem, i,
                lChanged = false,
                lHtml = "";

            for ( i = 0; i < lItems.length; i++ ) {
                lItem = $.trim( lItems[i] );
                if ( lItem !== "" ) {
                    // If the value to be added doesn't already exist in the list manager, add it
                    // only double quotes need to be CSS escaped in the selector
                    if ( gListManager.find( 'option[value="' + lItem.replace(/"/g, "\\\"") + '"]' ).length === 0 ) {
                        lItem = apex.util.escapeHTML( lItem );
                        lHtml = '<option value="' + lItem + '">' + lItem + '</option>';
                        gListManager.append( lHtml );
                        lChanged = true;
                    }
                }
            }

            // If a value has been added, trigger the change event
            if ( lChanged ) {
                gListManager.change();
            }
        },
        removeValue : function() {
            var lSelectedOptions$ = gListManager.find( ":selected" );
            
            // Only remove and trigger change event, if there is something selected
            if ( lSelectedOptions$.length > 0 ) {
                lSelectedOptions$.remove();
                gListManager.change();
            }
        }
    });
  });


  // Triggers the "refresh" event of the list manager which actually does the AJAX call
  function _triggerRefresh() {
    gListManager.trigger('apexrefresh');
  } // triggerRefresh

  // Clears the existing values from the list manager fields and fires the before
  // and after refresh events
  function refresh() {
    // trigger the before refresh event
    gListManager.trigger('apexbeforerefresh');

    // remove everything
    $(pSelector+"_ADD", apex.gPageContext$).val("");
    $('option', gListManager).remove();
    gListManager.change();

    // trigger the after refresh event
    gListManager.trigger('apexafterrefresh');
    return; // we are done
  } // refresh

  function _callPopup() {

    widget.util.callPopupLov(
        gOptions.ajaxIdentifier,
        {
            pageItems: $( gOptions.pageItemsToSubmit, apex.gPageContext$ ).add( gOptions.dependingOnSelector )
        }, {
            filterOutput:     gOptions.filterWithValue,
            filterValue:      $( pSelector + "_ADD", apex.gPageContext$ ).val(),
            windowParameters: gOptions.windowParameters
        } );

    return false;
  } // _callPopup

  function registerIconEvent() {
    // register the click event for the icon anchor to call the popup lov dialog
    $(pSelector+"_ADD_fieldset a", apex.gPageContext$).click(_callPopup);
  } //registerIconEvent

  // register the click event for the icon anchor to call the popup lov dialog
  registerIconEvent();

  // if it's a cascading list manager we have to register change events for our masters
  if (gOptions.dependingOnSelector) {
    $(gOptions.dependingOnSelector, apex.gPageContext$).change(_triggerRefresh);
  }
  // register the refresh event which is triggered by triggerRefresh or a manual refresh
  gListManager.bind("apexrefresh", refresh);

  // Need to identify when a change event has been triggered from adding or removing
  // a list item, and when the change event has been triggered from selecting or deselecting
  // an item that's already been added (default HTML behaviour for multi-selects).
  // Because, in the case where the change event has come from selecting / deselecting we don't
  // want the change event to propagate, because nothing has really changed in this case.
  //
  // Use the originalEvent property of the jQuery event object, as this is undefined when
  // the change event has been triggered by adding or removing a list item. So therefore
  // we stop the event when this is not equal to undefined.
  gListManager.change(function(e) {
    if (e.originalEvent !== undefined) {
      e.stopImmediatePropagation();
    }
  });

  // register our items so that it gets selected when the page is submitted
  // this is necessary, otherwise the browser wouldn't pick up the values
  if(!window.flowSelectArray){
    window.flowSelectArray = [];
  }
  window.flowSelectArray[window.flowSelectArray.length] = gListManager.attr("id");

}; // listManager

})( apex.widget, apex.jQuery );

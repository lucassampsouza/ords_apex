/*global apex,$x,$v,$s*/
/*!
 widget.shuttle.js
 Copyright (c) 2012, 2015 Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex.widget}.shuttle is used for the Shuttle widget of Oracle Application Express.
 **/

(function( widget, $ ) {

/**
 *
 * @param {String} pSelector jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function shuttle
 * @memberOf apex.widget
 * */
widget.shuttle = function(pSelector, pOptions) {

  // Default our options and store them with the "global" prefix, because it's
  // used by the different functions as closure
  var gOptions = $.extend({
                   optionAttributes:null
                   }, pOptions);

  // TODO consider enable and disable buttons so that they are only enabled when they will actually do something - reduces tab stops
  // TODO consider shortcut to move between the left and right lists for better keyboard accessibility

  // TODO cleanup inconsistency in expected cardinality of pSelector. The following globals clearly expect there to be just one shuttle but the .each below could process multiple
  // get shuttle controls
  var gShuttle           = $(pSelector, apex.gPageContext$),
      gShuttleListLeft   = $(pSelector+'_LEFT', apex.gPageContext$),
      gShuttleListRight  = $(pSelector+'_RIGHT', apex.gPageContext$),
      gSavedOptionsLeft  = $('option', gShuttleListLeft),
      gSavedOptionsRight = $('option', gShuttleListRight);

  // Register apex.item callbacks
  $(pSelector, apex.gPageContext$).each(function(){
      var self = this;
   widget.initPageItem(this.id, {
        enable: function() {
            var lFieldset;
            lFieldset = $x(self.id);
            // enable all the buttons
            $( 'button', lFieldset ).prop( 'disabled', false ).removeClass('is-disabled');
            // enable selects
            $('select', lFieldset)
              .prop('disabled', false)
              .removeClass('apex_disabled');
        },
        disable: function() {
            var lFieldset;
            lFieldset = $x(self.id);
            // deselect all options first
            $('option:selected', lFieldset).prop('selected', false);
            // disable all the buttons
            $( 'button', lFieldset ).prop( 'disabled', true ).addClass( 'is-disabled' );
            // disable selects
            $('select', lFieldset)
              .prop('disabled', true)
              .addClass('apex_disabled');
        },
        setValue: function(pValue) {
            var lValueArray;

            // remove all values from right
            _removeAll(null, true); // don't fire change event
            // create array from pValue
            lValueArray = apex.util.toArray(pValue);
            // iterate over values to set, compare with left hand values, and if matched
            // move to right, if no match don't add to right
            for (var i=0; i < lValueArray.length; i++) {
                $('option', gShuttleListLeft[0]).each(function(){
                    if (this.value === lValueArray[i]) {
                      // move the found options from the left list into the right list
                      $(this)
                        .appendTo(gShuttleListRight).prop('selected', true);
                      // stop execution of 'each', to get to next i iterator faster
                      return false;
                    }
                });
            }
        },
        getValue: function() {
            var lReturn = [];
            $('option', gShuttleListRight[0]).each(function(){
                lReturn.push( this.value );
            });
            return lReturn;
        },
        setFocusTo: gShuttleListLeft,
        // Add a loading indicator to the shuttle.
        // Note: the load indicator will not show up if the move controls are not there. Putting them
        //       somewhere else would result in a jumping layout
        loadingIndicator : function( pLoadingIndicator$ ) {
            return pLoadingIndicator$.prependTo( $( "td.shuttleControl", gShuttle ) );
        }
    });
  });

  // Triggers the "refresh" event of the select list which actually does the AJAX call
  function _triggerRefresh() {
    gShuttle.trigger('apexrefresh');
  } // _triggerRefresh

  // Remove everything from both lists and store the empty options for reset
  function _clear() {
    gSavedOptionsLeft  = gShuttleListLeft.empty().children();
    gSavedOptionsRight = gShuttleListRight.empty().children();
  }

  // Called by the AJAX success callback and adds the entries stored in the
  // JSON structure: {"values":[{"r":"10","d":"SALES"},...], "default":"10"}
  function _addResult( pData ) {
    var lHtml = "";

      // create an HTML string first and append it to the left select list, that's faster.
    $.each( pData.values, function() {
      // the server HTML escapes the data so no need to do it here.
      lHtml = lHtml + '<option value="' + this.r + '" ' + gOptions.optionAttributes + '>' + this.d + '</option>';
    });
    // add the options and store them for reset
    gShuttleListLeft.html( lHtml );

    // It is possible that the new value is the same as the previous value.
    // However a change event is still needed just in case it is the same value but for different reasons
    // that another item that depends on this item would notice. This all stems from the fact that an APEX
    // list based item can depend on any number of items to generate the list but can only specify a single
    // cascading LOV parent and there can be multiple levels of cascade.
    // $s will always fire a change event.
    $s( gShuttle[0], pData["default"] );

    // save new saved options based on the default value
    gSavedOptionsLeft  = $('option', gShuttleListLeft);
    gSavedOptionsRight = $('option', gShuttleListRight);

  } // _addResult

  // Clears the existing options and executes an AJAX call to get new values based
  // on the depending on fields
  function refresh() {

    widget.util.cascadingLov(
        gShuttle,
        gOptions.ajaxIdentifier,
        {
            pageItems: $( gOptions.pageItemsToSubmit, apex.gPageContext$ )
        },
        {
            optimizeRefresh:          gOptions.optimizeRefresh,
            dependingOn:              $( gOptions.dependingOnSelector, apex.gPageContext$ ),
            loadingIndicator:         gShuttle,
            success:                  _addResult,
            clear:                    _clear
        });

  } // refresh

  function _reset( pEvent ) {
    var prevValue = $v(gShuttle[0]);
    // restore the original left and right list
    gShuttleListLeft
      .empty()
      .append(gSavedOptionsLeft)
      .children() // options
      .prop('selected', false);
    gShuttleListRight
      .empty()
      .append(gSavedOptionsRight)
      .children() // options
      .prop('selected', false);
    if ( $v( gShuttle[0] ) !== prevValue ) {
      // trigger the change event for the shuttle
      gShuttle.change();
    }
    pEvent.preventDefault();
  } // _reset

  function _move( pEvent, pAll ) {
    var $OptionsToMove = $('option'+(pAll?'':':selected'), gShuttleListLeft);
    // deselect everything on the right side first
    $('option:selected', gShuttleListRight).prop('selected', false);
    // if there are options to move, move them and trigger change event
    if ($OptionsToMove.length) {
      // move the selected options from the left list into the right list
      $OptionsToMove
        .appendTo(gShuttleListRight).prop('selected', true);
      // trigger the change event for the shuttle
      gShuttle.change();
    }
    pEvent.preventDefault();
  } // _move

  function _moveAll( pEvent ) {
    _move(pEvent, true);
  } // _moveAll

  function _remove( pEvent, pAll, noNotify ) {
    var $OptionsToRemove = $('option'+(pAll?'':':selected'), gShuttleListRight);
    // deselect everything on the left side first
    $('option:selected', gShuttleListLeft).prop('selected', false);
    // if there are options to remove, remove them and trigger change event
    if ($OptionsToRemove.length) {
      // move the selected options from the right list into the left list
      $OptionsToRemove.appendTo(gShuttleListLeft).prop('selected', true); // TODO this should preserve the original order

      if ( !noNotify ) {
          // trigger the change event for the shuttle
          gShuttle.change();
      }
    }
    if ( pEvent ) {
        pEvent.preventDefault();
    }
  } // _remove

  function _removeAll( pEvent, noNotify ) {
    _remove(pEvent, true, noNotify);
  } // _removeAll

  function _moveTop( pEvent ) {
    var prevValue = $v(gShuttle[0]);

    // move the selected options in the right list to the top and select them
    $('option:selected', gShuttleListRight)
      .prependTo(gShuttleListRight).prop('selected', true);

    if ( $v( gShuttle[0] ) !== prevValue ) {
      // trigger our change order event for the shuttle
      gShuttle.trigger('shuttlechangeorder');
    }
    pEvent.preventDefault();
  } // _moveTop

  function _moveUp( pEvent ) {
    var moved = false;
    $('option:selected', gShuttleListRight).each(function(){
      var lPrevOption = $(this).prev();
      // don't do anything if the selected is already at the top or selected
      if (lPrevOption.length===0 || lPrevOption.prop('selected')) {
        return;
      }
      // move the option before the previous one and select it again
      $(this).insertBefore(lPrevOption).prop('selected', true);
      moved = true;
     });

    if ( moved ) {
      // trigger our change order event for the shuttle
      gShuttle.trigger('shuttlechangeorder');
    }
    pEvent.preventDefault();
  } // _moveUp

  function _moveDown( pEvent ) {
    var i, lNextOption$,
        moved = false,
        selectedOptions$ = $('option:selected', gShuttleListRight);

    // Because of the check for next being selected need to go in reverse direction
    for ( i = selectedOptions$.length - 1; i >= 0; i-- ) {
      lNextOption$ = selectedOptions$.eq(i).next();
      // don't do anything if the selected is already at the bottom or selected
      if ( lNextOption$.length === 0 || lNextOption$.prop('selected') ) {
        continue;
      }
      // move the option before the previous one and select it again
      selectedOptions$.eq(i).insertAfter(lNextOption$).prop('selected', true);
      moved = true;
     }

    if ( moved ) {
      // trigger our change order event for the shuttle
      gShuttle.trigger('shuttlechangeorder');
    }
    pEvent.preventDefault();
  } // _moveDown

  function _moveBottom( pEvent ) {
    var prevValue = $v(gShuttle[0]);

    // move the selected options in the right list to the bottom and select them
    $('option:selected', gShuttleListRight)
      .appendTo(gShuttleListRight).prop('selected', true);

    if ( $v( gShuttle[0] ) !== prevValue ) {
      // trigger our change order event for the shuttle
      gShuttle.trigger('shuttlechangeorder');
    }
    pEvent.preventDefault();
  } // _moveBottom

  function _stopEvent(pEvent) {
    pEvent.stopImmediatePropagation();
  } // _stopEvent

  function _bindIconClickHandlers() {
    // register control events
    $(pSelector+"_RESET", apex.gPageContext$).click(_reset);
    $(pSelector+"_MOVE", apex.gPageContext$).click(_move);
    $(pSelector+"_MOVE_ALL", apex.gPageContext$).click(_moveAll);
    $(pSelector+"_REMOVE", apex.gPageContext$).click(_remove);
    $(pSelector+"_REMOVE_ALL", apex.gPageContext$).click(_removeAll);

    $(pSelector+"_TOP", apex.gPageContext$).click(_moveTop);
    $(pSelector+"_UP", apex.gPageContext$).click(_moveUp);
    $(pSelector+"_DOWN", apex.gPageContext$).click(_moveDown);
    $(pSelector+"_BOTTOM", apex.gPageContext$).click(_moveBottom);
  }

  // register our items so that it gets selected when the page is submitted
  // this is necessary, otherwise the browser wouldn't pick up the values
  if(!window.flowSelectArray){
    window.flowSelectArray = [];
  }
  window.flowSelectArray.push( gShuttleListRight.attr( "id" ) );

  // if it's a cascading select list we have to register change events for our masters
  if (gOptions.dependingOnSelector) {
    $(gOptions.dependingOnSelector, apex.gPageContext$).change(_triggerRefresh);
  }

  // register the refresh event which is triggered by triggerRefresh or a manual refresh
  gShuttle.bind("apexrefresh", refresh);

  // don't fire change events for the left side and right side, otherwise the change event would fire
  // as soon as an entry is selected in the list, but that's not what we want. The change event should
  // only fire if something is moved or reordered
  gShuttleListLeft.change(_stopEvent);
  gShuttleListRight.change(_stopEvent);

  // register the double click and ENTER key event handlers to move options back and forth
  $( gShuttleListLeft )
    .dblclick( _move )
    .keydown( function ( e ) {
      if( e.which === 13 ) {
        _move( e, false );
        e.preventDefault();
      }
  });
  $( gShuttleListRight )
    .dblclick( _remove )
    .keydown( function ( e ) {
      if( e.which === 13 ) {
        _remove( e );
        e.preventDefault();
      }
  });

  _bindIconClickHandlers();

}; // shuttle

})( apex.widget, apex.jQuery );

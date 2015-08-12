function com_oracle_apex_css_bar_chart(pRegionId, pOptions) {

  // Default our options and store them with the "global" prefix, because they are
  // used by the different functions as closure
  var gOptions = apex.jQuery.extend({
                   ajaxIdentifier:null,
                   pageItemsToSubmit:null
                   }, pOptions),
      gRegion  = apex.jQuery('#'+pRegionId),
      gChart   = apex.jQuery('#'+pRegionId+'_chart');

  // Executed when the AJAX call is finished. pData will contains the new HTML code for the chart
  function _drawResult(pData) {
    gChart
      .removeClass('cbc_loading')
      .html(pData);
    gRegion.trigger('apexafterrefresh');
  }; // _drawResult

  // Executes an AJAX call to get new values for the CSS bar chart
  function refresh() {

    // trigger the before refresh event
    gRegion.trigger('apexbeforerefresh');

    // initialize the AJAX call parameters
    var lData = { p_request: "NATIVE="+gOptions.ajaxIdentifier,
                  p_flow_id: $v('pFlowId'),
                  p_flow_step_id: $v('pFlowStepId'),
                  p_instance: $v('pInstance')
                };

    // add all page items we have to submit to the AJAX call
    apex.jQuery(gOptions.pageItemsToSubmit).each(function(){
      var lIdx;
      if (lData.p_arg_names===undefined) {
        lData.p_arg_names  = [];
        lData.p_arg_values = [];
        lIdx = 0;
      } else {
        lIdx = lData.p_arg_names.length;
      }
      lData.p_arg_names [lIdx] = this.id;
      lData.p_arg_values[lIdx] = $v(this);
    });

    // add loding indicator
    gChart.addClass('cbc_loading');

    // perform the AJAX call
    apex.jQuery.ajax({
      // try to leverage ajaxQueue plugin to abort previous requests
      mode: "abort",
      // limit abortion to this input
      port: "css_bar_chart_"+pRegionId,
      dataType: "html",
      type: "post",
      url: "wwv_flow.show",
      traditional: true,
      data: lData,
      success: _drawResult
      });
  }; // refresh

  // register the refresh event which is triggered by a manual refresh
  gRegion.bind("apexrefresh", refresh);

}; // com_oracle_apex_css_bar_chart

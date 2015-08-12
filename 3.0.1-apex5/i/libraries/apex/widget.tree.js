/*global apex, $v*/
/**
 * @fileOverview
 * The {@link apex.widget}.tree is used for the tree widget of Oracle Application Express.
 **/

/**
 * Tree widget.
 *
 * @namespace
 **/
if ( apex.widget && apex.widget.tree ) {
    // this warning can be ignored if widget.treeView is not used via the tree region
    apex.debug.warn("Old and new tree implementations cannot be mixed.");
}
apex.widget.tree = {};

(function( tree, util, $ ) {

  tree.cTreeTypes = {
    "default":{
      clickable:true,
      renameable:false,
      deletable:false,
      creatable:true,
      draggable:false,
      copyable:false,
      editable:false,
      max_children:-1,
      max_depth:0,
      valid_children:"none",
      icon:{
        image:false,
        position:false}
      }
    };

  /**
   * @function init
   * @memberOf apex.widget.tree
   **/
  tree.init = function(pTreeId, pTypes, pStaticData, pTreeTemplate, pStartNodeId, pTreeAction, pSelectedNodeId) {

    if ($v('pScreenReaderMode') === 'YES') {

        // in screen reader mode we just generate a hierarchical unordered list
        var lUnorderedList = '';

        function addNodes(pNodeList) {

          if (pNodeList.length > 0) {
            lUnorderedList += '<ul>';

            // process all tree nodes in the array
            for (var i=0;i<pNodeList.length;i++) {
              lUnorderedList += '<li>';

              // do we have a link for this tree node?
              if (pNodeList[i].data.attributes.href) {
                lUnorderedList += '<a href="'+pNodeList[i].data.attributes.href+'"'+
                                  (pNodeList[i].data.attributes.tooltip?' title="'+pNodeList[i].data.attributes.tooltip+'"':"")+
                                  '>'+pNodeList[i].data.title+'</a>';
              } else {
                lUnorderedList += pNodeList[i].data.title;
              }

              // if the node has child nodes, create an unordered list for them as well
              if (pNodeList[i].children) {
                addNodes(pNodeList[i].children);
              }

              lUnorderedList += '</li>';
            } // for
            lUnorderedList += '</ul>';
          }
        } // addNodes

        // call it for the root nodes
        addNodes(pStaticData);

        // add our hierarchical unordered list to the tree div
        $("#"+ util.escapeCSS( pTreeId ), apex.gPageContext$).append(lUnorderedList);

    } else {
        // use jsTree to render the tree
        var lTree = $("#" + util.escapeCSS( pTreeId ), apex.gPageContext$).tree({
          data:{
            type:"json",
            async:true,
            opts:{
              "static":pStaticData,
              isTreeLoaded:false,
              method:"POST",
              url:"wwv_flow.show"
            }
          },
          ui:{theme_name:pTreeTemplate},
          types:pTypes,
          rules:{
            valid_children:"root",
            use_max_depth:true
          },
          callback:{
           // onselect:tree.onselect
          },
          root:{
            draggable:false,
            valid_children: "folder"
          },
          folder:{
            valid_children: "file"
          },
          file:{
            valid_children: "none",
            max_children: 0,
            max_depth:0
          }
          });

        if (pTreeAction == 'S'){
          $('#' + util.escapeCSS( pTreeId ), apex.gPageContext$).on('click', 'a[href]', tree.onclick);}
        else {
          $('#' + util.escapeCSS( pTreeId ), apex.gPageContext$).on('dblclick', 'a[href]', tree.onclick);
        }

        // Bind Tooltips for tree nodes
        $('a[tooltip]', $('#' + util.escapeCSS( pTreeId ), apex.gPageContext$)).bind("mouseover", tree.showTooltip);

        // Set Tree Focus on Parent Node
        if ($.tree.reference(lTree) !== null){
          $.tree.reference(lTree).open_branch($("#" + util.escapeCSS( pStartNodeId ), apex.gPageContext$));
        }
        //  Set Selected Node
        if (pSelectedNodeId){
          // Expand parent node and selected node
          if ($.tree.reference(lTree) !== null){
            $.tree.reference(lTree).select_branch($("#" + util.escapeCSS( pSelectedNodeId ), apex.gPageContext$));
          }
        }
    }
  }; // init

  /**
   * @function onselect
   * @memberOf apex.widget.tree
   **/
  tree.onselect = function(pNode, pTree) {
      var lAction, lNode = pTree.get_node(pNode);
      lAction = $('a', lNode).attr("href");
      document.location.href=lAction;
  }; // onselect

  /**
   * @function onclick
   * @memberOf apex.widget.tree
   **/
  tree.onclick = function(pEvent) {
      var lAction = $(this).attr("href");
      if (lAction && lAction !== "") {
        document.location.href=lAction;
      }
  }; // onclick


  /**
   * @function expand_all
   * @memberOf apex.widget.tree
   **/
  tree.expand_all = function(pTreeId) {
    if ($v('pScreenReaderMode') === 'YES') {
      // in screen reader mode everything is expanded by default
    } else {
      var lTree = $("#" + util.escapeCSS( pTreeId ), apex.gPageContext$);
      if ($.tree.reference(lTree) !== null){
        $.tree.reference(lTree).open_all();
      }
    }
  }; //expand_all

  /**
   * @function collapse_all
   * @memberOf apex.widget.tree
   **/
  tree.collapse_all = function(pTreeId) {
    if ($v('pScreenReaderMode') === 'YES') {
      // in screen reader mode everything is expanded by default
    } else {
      var lTree = $("#" + util.escapeCSS( pTreeId ), apex.gPageContext$);
      if ($.tree.reference(lTree) !== null){
        $.tree.reference(lTree).close_all();
      }
    }
  }; //collapse_all

  /**
   * @function reset
   * @memberOf apex.widget.tree
   **/
  tree.reset = function(pTreeId,pStartNodeId) {
    if ($v('pScreenReaderMode') === 'YES') {
      // in screen reader mode everything is expanded by default
    } else {
      var lTree = $("#" + util.escapeCSS( pTreeId ), apex.gPageContext$);
      if ($.tree.reference(lTree) !== null){
        $.tree.reference(lTree).close_all();
        $.tree.reference(lTree).open_branch($("#" + util.escapeCSS( pStartNodeId ), apex.gPageContext$));
      }
    }
  }; //reset to only expand parent node


  /**
   * @function showTooltip
   * @memberOf apex.widget.tree
   **/
  tree.showTooltip = function(pEvent) {
        var lAction = $(pEvent.target).attr("tooltip");
        if (lAction && lAction !== "") {
            toolTip_enable(pEvent,this,$(this).attr("tooltip"));
        }
  }; // showTooltip

  /**
   * @function hideTooltip
   * @memberOf apex.widget.tree
   **/
  tree.hideTooltip = function() {
    toolTip_disable();
  }; // hideTooltip

})( apex.widget.tree, apex.util, apex.jQuery );

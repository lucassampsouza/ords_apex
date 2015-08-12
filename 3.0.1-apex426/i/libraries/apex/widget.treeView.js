/*!
 UI tree view widget
 Copyright (c) 2010, 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * A jQuery UI widget that implements a tree view. Implements tree view functionality according to WAI-ARIA authoring
 * practices design patterns and the DHTML Style Guide and Oracle RCUX Guidelines.
 * Differences from WAI-ARIA keyboard support:
 * - * (Asterisk) on keypad does not expand all nodes
 * - Space will select the focused node (if not already selected)
 * - Type to select supports multiple letters
 * - If tree supports keyboard insert then Insert key will insert a node
 * - If tree supports keyboard rename then F2 will rename the focused/selected node in-place
 * - If tree supports keyboard delete then Delete key will delete the selected nodes
 * - If a context menu is supported then Shift+F10 and the Context Menu key will open the context menu
 * Some key combinations only apply if tree is in multiple selection mode.
 *
 * Differences from RCUX Guidelines:
 * - Providing a tooltip for truncated tree label text is not automatic
 * - Disclose icon does not have a tooltip
 * - Icons don't have a tooltip
 * - Multiple icons (including status icons) only supported with custom rendering
 * - The "Show as Top and Hierarchical selector" features are not built in but could be supported with model and controller customizations
 * - Splitters, scrolling, toolbar, standard context menu actions and menu bar are external to the treeView widget but could be implemented according to BLAF guidelines
 * - Persisting expand/collapse state (Disclosure changes) is not automatic
 * - Ctrl+Alt+M is not a keyboard shortcut for context menu.
 *
 * The treeView works with any data model via an adapter interface supplied when the treeView is created. The tree
 * data model must be singly rooted. If the data doesn't have a single root then the adapter must generate one
 * dynamically where the multiple roots are its children. The tree need not display the root. For a multi-rooted tree
 * set the treeView option showRoot to false. With showRoot false the adapter will never be asked for the label or
 * icon etc. of the root node.
 *
 * The adapter interface has these methods:
 * {
 *     // start at the root
 *     root: function(), // returns root node
 *     // about the node
 *     getLabel: function(n), // returns label/name of node. Used by node content rendering (if renderNodeContent not implemented) and for editing during rename.
 *     getIcon: function(n), // optional. return the icon of the node or null if none. Used by node content rendering. If the function doesn't exist then no nodes will have icons.
 *     getClasses: function(n), // optional. One or more css classes to add to the node content container or null if none
 *     getLink: function(n), // used for navigation trees. If defined it is called during activation if navigation option is true.
 *     isDisabled: function(n), // optional. return true if the node is disabled otherwise the node is enabled
 *         // A disabled node cannot be selected or activated but it can be focused.
 *     renderNodeContent: function(n, out, options, state), // optional. Used for advanced use cases where more control over the node markup is needed
 *         // the content must include an element with tabindex='-1' and that element must have a class that matches option labelClass
 *         // The options argument is an object with properties iconType, labelClass, useLinks that are the same as the treeView options
 *         // the state argument is an object with these properties selected, level, disabled, hasChildren, expanded
 *         // all are Boolean except for level which is an integer.
 *         // The custom rendering is responsible for setting the aria-level, aria-disabled, aria-selected, and aria-expanded attributes
 *     // node children
 *     hasChildren: function(n), // returns true if the node has children, false if it does not and null if not yet known
 *     childCount: function(n), // returns number of children that node n has, null if the answer is not yet known
 *     child: function(n, i), // return the ith child of node n
 *     fetchChildNodes: function(n, complete(status)),  // optional. This is for async/lazy tree construction.
 *         // the top level of nodes should not be lazy loaded.
 *         // It is called to let the adapter fetch child nodes. May be called after
 *         // child count returns null. The completion call back status is
 *         // > 0 (or true) if 1 or more children were fetched
 *         // 0 if the node has 0 children
 *         // false if there was an error fetching the children
 *     // tree modification (all optional)
 *     allowAdd: function(n, operation, [, children]) // return true if the node allows children to be added to it. If the children parameter is
 *         // passed in return true if each of those children (or ones just like them) can be added. Children is an array of nodes.
 *         // operation is "add" when adding a new node (addNode will be called),
 *         // "move" when the node comes from elsewhere in the tree and is being moved (moveNodes will be called),
 *         // and "copy" when the node is a copy of a node from elsewhere in the tree (copyNodes will be called).
 *         // additional operation values are possible if the adapter supports custom drag operations
 *     allowRename: function(n), // return true if the node can be renamed
 *     allowDelete: function(n),  // return true if the node can be deleted
 *     allowDrag: function(n), // return true if the node can be dragged
 *     dragOperations: function(nodes), // Determine which operations are allowed while dragging the given array of nodes.
 *         // When dragging from an external source nodes is null.
 *         // Return an object with allowed drag operations. The properties are: "normal", "ctrl", "alt", "shift", "meta".
 *         // The standard values are "move", "copy" or "add". Other values are allowed. The normal property is required.
 *         // The default is: { normal: "move", ctrl: "copy" } or if nodes is null { normal: "add" }
 *     addNode: function(parent, index, label, context, function(child, index)), // Add a node as a child of the parent node with the
 *         // given label (optional) and at the given index.
 *         // context is arbitrary additional information that can be used in creating the new node
 *         // In the callback function child is the node that was added. If child is false try again.
 *         // If child is null then add failed - node is removed.
 *         // Index is the position the node was actually inserted at.
 *     renameNode: function(n, newLabel, function(node, index)), // Rename a node. n is the node to rename with newLabel.
 *         // In the callback node is the renamed node (most likely the same)
 *         // If node is false try again.
 *         // If node is null then rename failed return to previous value.
 *         // Index is the new position the node is in after rename.
 *     deleteNode: function(n, function(status), more), //  Called in response to DEL key. Delete node n then call fn with true to delete
 *         // the tree node or false to cancel the delete.
 *         // If more is true another deleteNode call will be made right away. The more argument can be ignored or can
 *         // be used to batch up requests to the server. In either case each call back must be made.
 *     moveNodes: function(parent, index, children, function(places)), // moves one or more nodes from elsewhere in the
 *         // tree to be children of parent starting at index among the existing children of parent. The move includes
 *         // all the descendants of the moved nodes. Only the parents and/or positions of the moved nodes should change.
 *         // When the nodes have been moved the callback function is called with a places array of indexes where the
 *         // children nodes ended up. If the tree nodes are sorted then even though they were moved starting at the
 *         // given index they could end up at any position. If the tree nodes are not sorted then places will consist
 *         // of integers index ... index + n - 1 where n is the number of children. If the move fails return false
 *         // for places. If some of the nodes can't be moved return -1 for its index in places.
 *     copyNodes: function(parent, index, children, function(places)), // copies one or more nodes from elsewhere in the
 *         // tree to be children of parent starting at index among the existing children of parent. A copy of each node
 *         // and all its descendants is made. The copies are the same except for identity and parentage.
 *         // When the nodes have been copied the callback function is called with a places array of indexes where the
 *         // children nodes ended up. If the tree nodes are sorted then even though they were copied starting at the
 *         // given index they could end up at any position. If the tree nodes are not sorted then places will consist
 *         // of integers index ... index + n - 1 where n is the number of children. If the move fails return false
 *         // for places. If some of the nodes can't be moved return -1 for its index in places.
 *     // View state (all optional)
 *     // used to persist the expansion state
 *     isExpanded: function(treeId, n), // return true if the node should be expanded
 *     setExpanded: function(treeId, n, expanded), // called when the expansion state of the tree changes
 *     getExpandedNodeIds: function(treeId), // returns an array of each of the expanded node's id. Can be used to save
 *         // the expansion state.
 *     getExpandedState: function(treeId), // returns map of node id to expansion state. Useful if you also need to
 *         // know about collapsed nodes.
 *     // used by the treeView to map from nodes to DOM elements
 *     getViewId: function(treeId, n), // return the view id for the given treeId and node n
 *     setViewId: function(treeId, n, viewId), // called to store the view id for a treeId and node n
 *     clearViewId: function(treeId, n), // remove the mapping for node n.
 *         // If n is null then all previous viewIds mappings should be removed
 * }
 *
 * Context Menus:
 * The contextMenuAction option allows you to respond to mouse or keyboard interactions that typically result in a
 * context menu. Specifically Right Mouse click (via contextmenu event), Shift-F10 key (via keydown event) and the
 * Windows context menu key (via contextmenu event). The original event is passed to the contextMenuAction function.
 * The event object can be used to position the menu. If you implement your own menu it is best if you put focus
 * back on the treeView using the treeView focus method when the menu closes (unless the menu action directs focus
 * elsewhere). A simpler alternative that uses the APEX menu widget is to pass in a menu widget options object as the
 * contextMenu option. When the contextMenu option is used the beforeOpen menu callback ui argument has these
 * additional properties:
 *  - menuElement the menu jQuery object
 *  - tree this tree jQuery object
 *  - treeNodeAdapter this nodeAdapter for this tree
 *  - treeSelection a jQuery object with the selected tree nodes at the time the menu was opened
 *  - treeSelectedNodes an array of the selected model nodes at the time the menu was opened
 * Also the afterClose callback will automatically focus the tree if the menu action didn't take the focus and
 * the ui argument has this additional property:
 *  - menuElement the menu jQuery object
 *  - tree this tree jQuery object
 * Only one of contextMenuAction and contextMenu should be specified. The contextMenu option can only be set when the
 * treeView is initialized and it can't be changed. The contextMenuAction cannot be set if the contextMenu option was
 * given when the tree was created.
 * If using contextMenu option the contextMenuId option can be used to give the menu element an ID. This is useful
 * if other code must refer to the menu element or widget.
 * Note: If using contextMenu option make sure necessary menu and jQuery UI css and js resources are loaded on the page.
 *
 * Drag and Drop:
 * To enable drag and drop set the dragAndDrop option to true. The treeView can be a drag source for either a jQuery UI
 * droppable or the same treeView instance and it can be a drop target for either a jQuery UI draggable or the
 * same treeView instance.
 * todo support dragging between two treeViews
 * To work with a droppable make sure the scope options of the droppable and treeView match and that the droppable
 * accept option allows the treeView node (.a-TreeView-content). On droppable drop you would typically call the
 * getSelection or getSelectedNodes of the treeView instance.
 * To work with a draggable set the draggable connectToTreeView option to a selector for the treeView instance you
 * want to be a drop target. (Note a treeView plugin extends the draggable to add the connectToTreeView option)
 * The treeView supports dragging single or multiple nodes. In order to drag multiple nodes both the multiple
 * and dragMultiple options must be true. Note it is possible for a treeView instance to support multiple selection
 * but single drag. The reverse (single selection and multiple drag) is not possible.
 * Regardless of the drag source there are two modes of behavior for identifying drop targets. The mode is determined
 * by the dragReorder option. If false (the default) nodes which can have children of the type(s) being dragged are targets
 * and dropping on the target node results in the dragged node(s) being added as children. This mode is suitable when
 * the children have an implicit order such as files in a file system folder. If dragReorder is true then a placeholder
 * node, which dynamically moves between nodes whose parent can have children of the type(s) being dragged, is the target.
 * Dropping on the placeholder target adds the nodes where the placeholder is. This mode is suitable for when nodes
 * can be explicitly ordered by the user such as with sections in a document outline.
 * A drag and drop can perform various operations. There is builtin support for move, copy and add operations. Add
 * only works when the drag is from a draggable, move and copy work when the tree is the drag source and target.
 * The nodeAdapter decides what operations are supported with the dragOperations method based on the types of nodes
 * being dragged, or any other context available to the adapter. Different operations are selected with keyboard
 * modifiers: shift, ctrl, alt, and meta (only one modifier is allowed). Operations besides move, copy, and add are
 * handled with custom logic in the beforeStop event handler.
 * See moveNodes, and copyNodes for how nodeAdapter is used for drag and drop move and copy operations.
 *
 * Static tree from markup:
 * A tree data model can be created from HTML markup inside the treeView element. A tree from markup has much less
 * functionality. The markup is nested lists using ul, li, and a or span for the labels.
 * This is typically used for navigation such as with a site map. The markup is converted to data and a default adapter
 * with no editing capability is created to interface to it. The li element can include attributes: class (value
 * returned by getClasses), data-id (value used by get/setViewId), data-icon (value returned by getIcon),
 * data-type (used by default adapter, only useful if supplying adapterTypesMap), data-current (true value will select
 * that node), data-disabled (value returned by isDisabled). The span or anchor content is the label.
 * The anchor href attribute is the link (getLink) used for navigation. Unless the top level list has a single
 * item showRoot should be false. Typically multiple is false and navigation is true.
 *
 * todo:
 * D+D don't show the placeholder on start drag the draggables can't be dropped there
 * How to handle notification in setSelection and setSelectedNodes? Should they both have a parameter to control notification?
 * How to handle D+D modifiers in a way that works as expected for different platforms?
 *
 * todo ACC:
 * aria-haspopup when tree items have a context menu?
 * "aria-grabbed" for d&d?
 *
 * Accessibility Notes:
 * - It is a good idea to label the tree with a aria-labelledby or aria-label attribute on the treeView element.
 * - If the tree node icon or classes convey information consider using custom node rendering to include visually hidden text for that information
 * TODO there should be a way to convey information contained in the icon and custom classes
 *
 * Future possibilities
 * - Consider options for standard tree menu items such as Expand/Expand All Below/Collapse/Collapse All Below with standard rules
 * - Consider making drag and drop a separate "plugin"
 * - Consider support for dragging to/from sortable
 * - Consider support for dragging to/from gridlayout
 * - Consider support different cursors for different drag modifiers
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.mouse.js
 *    jquery.ui.widget.js
 *    apex/util.js
 *    apex/debug.js
 *    apex/navigation.js (for navigation support)
 *    (the following are for context menu integration)
 *    jquery.ui.position.js
 *    apex/widget.menu.js
 *    (optional drag and drop integration)
 *    jquery.ui.draggable.js
 *    jquery.ui.droppable.js
 *    (optional tooltip integration)
 *    jquery.ui.tooltip.js
 *    apex/tooltipManager.js
 */
/*global apex*/

(function ( util, debug, $, undefined ) {
    "use strict";

    var C_TREEVIEW = "a-TreeView",
        C_NODE = "a-TreeView-node",
        C_NO_COLLAPSE = "a-TreeView--noCollapse",
        SEL_NODE = "." + C_NODE,
        C_TOP_NODE = "a-TreeView-node--topLevel",
        C_ROW = "a-TreeView-row",
        SEL_ROW = "." + C_ROW,
        C_CONTENT = "a-TreeView-content",
        SEL_CONTENT = "." + C_CONTENT,
        SEL_ROW_CONTENT = SEL_CONTENT + ", " + SEL_ROW,
        C_LABEL = "a-TreeView-label",
        C_TOGGLE = "a-TreeView-toggle",
        SEL_TOGGLE = "." + C_TOGGLE,
        C_HELPER = "a-TreeView-dragHelper",
        C_PLACEHOLDER = "a-TreeView-placeholder",
        C_SELECTED = "is-selected",
        SEL_SELECTED = "." + C_SELECTED,
        C_DISABLED = "is-disabled",
        SEL_DISABLED = "." + C_DISABLED,
        C_FOCUSED = "is-focused",
        C_HOVER = "is-hover",
        C_EXPANDABLE = "is-expandable",
        C_COLLAPSIBLE = "is-collapsible",
        C_PROCESSING = "is-processing",
        C_LEAF = "a-TreeView-node--leaf",
        C_DEFAULT_ICON_TYPE= "a-Icon",
        C_RTL = "u-RTL",
        A_EXPANDED = "aria-expanded",
        A_SELECTED = "aria-selected",
        C_ACTIVE = "is-active", // when dragging
        A_DISABLED = "aria-disabled",
        A_LEVEL = "aria-level",
        M_BEGIN_CHILDREN = "<ul role='group'>",
        M_END_CHILDREN = "</ul>";

    var EVENT_SELECTION_CHANGE = "selectionChange",
        EVENT_EXPANSION_STATE_CHANGE = "expansionStateChange";

    var keys = $.ui.keyCode;

    function removeClassesExcept( el, keep ) {
        var i, c,
            newClasses = "",
            classList = el.className.split(" ");

        for ( i = 0; i < classList.length; i++ ) {
            c = classList[i];
            if ( $.inArray( c, keep ) >= 0 ) {
                newClasses += " " + c;
            }
        }
        el.className = newClasses.substr(1);
    }

    function domIndex( el$ ) {
        return el$.parent().children( ":visible" ).index( el$ );
    }

    function getIdFromNode( node$ ) {
        var id = node$.get( 0 ).id;
        return id.substring( id.lastIndexOf( "_" ) + 1 );
    }

    function getLevelFromNode( node$, labelSel ) {
        return parseInt( node$.children( SEL_CONTENT ).find( labelSel ).attr( A_LEVEL ), 10);
    }

    function getLevel( nodeContent$, labelSel ) {
        return parseInt( nodeContent$.find( labelSel ).attr( A_LEVEL ), 10);
    }

    /*
     * options
     *   iconType:
     *   labelClass:
     *   useLinks
     * state
     *   selected:
     *   level:
     *   disabled:
     *   hasChildren:
     *   expanded:
     */
    function renderTreeNodeContent( out, node, nodeAdapter, options, state ) {
        var icon, link, elementName;

        if ( nodeAdapter.renderNodeContent ) {
            nodeAdapter.renderNodeContent( node, out, options, state );
        } else {
            if ( nodeAdapter.getIcon ) {
                icon = nodeAdapter.getIcon( node );
                if ( icon !== null ) {
                    out.markup( "<span" ).attr( "class", options.iconType + " " + icon ).markup( "></span>" );
                }
            }
            link = options.useLinks && nodeAdapter.getLink && nodeAdapter.getLink( node );
            if ( link ) {
                elementName = "a";
            } else {
                elementName = "span";
            }
            out.markup( "<" + elementName + " tabIndex='-1' role='treeitem'" ).attr( "class",options.labelClass )
                .optionalAttr( "href", link )
                .attr( A_LEVEL, state.level )
                .attr( A_SELECTED, state.selected ? "true" : "false" )
                .optionalAttr( A_DISABLED, state.disabled ? "true" : null )
                .optionalAttr( A_EXPANDED, state.hasChildren === false ? null : state.expanded ? "true" : "false" )
                .markup( ">" )
                .content( nodeAdapter.getLabel( node ) )
                .markup( "</" + elementName + ">" );
        }
    }

    function setFocus( elem ) {
        elem.tabIndex = 0;
        elem.focus();
    }

    function nextNode( node$ ) {
        var next$;

        // First try the child li, then sibling li, finally parent's sibling if any.
        if ( node$.hasClass( C_COLLAPSIBLE ) ) {
            next$ = node$.children( "ul" ).children( "li" ).first();
        } else {
            // Look for next sibling, if not found, move up and find next sibling.
            next$ = node$.next();
            if ( next$.length === 0 ) {
                next$ = node$.parent().parents( "li" ).next( "li" ).first();
            }
        }
        return next$;
    }

    function prevNode( node$ ) {
        var prev$;

        // First try previous last child, then previous, finally parent if any
        prev$ = node$.prev();
        if ( prev$.length > 0 ) {
            if ( prev$.hasClass( C_COLLAPSIBLE ) ) {
                prev$ = prev$.find( "li" ).filter( ":visible" ).last();
            }
        } else {
            prev$ = node$.parent().parent( "li" );
        }
        return prev$;
    }

    function clearSelection() {
        var sel = {};
        if (window.getSelection) {
            sel = window.getSelection(); // Mozilla
        } else if (document.selection) {
            sel = document.selection.createRange(); // IE
        }
        if (sel.rangeCount) {
            sel.removeAllRanges(); // Mozilla
        } else if (sel.text > '') {
            document.selection.empty(); // IE
        }
    }

    function preventNextScroll( scrollParent$ ) {
        var top = scrollParent$.scrollTop(),
            el$ = scrollParent$,
            timer = null;

        if ( scrollParent$[0] === document ) {
            el$ = $(window);
        }
        el$.on("scroll.treeTemp", function() {
            scrollParent$.scrollTop( top );
            el$.off(".treeTemp");
            clearTimeout( timer );
        } );
        // for cases when the scroll doesn't happen
        timer = setTimeout(function() {
            el$.off(".treeTemp");
        }, 20);
    }

    function initNodeLabelInput(input$, label, width, complete, cancel) {
        var input = input$.val( label ).width( width )
            .keydown(function ( event ) {
                var kc = event.which;

                if ( event.shiftKey || event.ctrlKey || event.altKey ) {
                    return;
                }
                if ( kc === keys.ENTER ) {
                    complete( $( this ).val() );
                    event.preventDefault();
                } else if ( kc === keys.ESCAPE ) {
                    setTimeout( function () {
                        cancel();
                    }, 10 );
                    event.preventDefault();
                }
            } )
            .blur(function ( event ) {
                complete( $( this ).val() );
            } )[0];
        setFocus( input );
        input.select();
        return input;
    }

    $.widget( "apex.treeView",  $.ui.mouse, {
        version: "5.0",
        widgetEventPrefix: "treeview",
        options: {
            getNodeAdapter: null, // required (unless tree data supplied by markup) function returning an object that
                                  // implements the nodeAdapter interface described above
            adapterTypesMap: null, // optional and only used when getNodeAdapter is null (when initializing tree from markup)
                                   // the value is passed to makeDefaultNodeAdapter as types parameter
            showRoot: true, // if false the tree appears like a forest (multi-rooted)
            expandRoot: true, // if true the root node is initially expanded
            collapsibleRoot: true, // if false the root node cannot be collapsed (has no toggle area)
            autoCollapse: false, // if true only one sibling can be expanded at a time
            useLinks: true, // if true nodes with links are rendered as anchor elements
            multiple: false, // if true multiple nodes can be selected
            idPrefix: null, // Optional id prefix used to generate unique DOM ids
            contextMenuAction: null, // optional. function( event ) called when a context menu should be displayed
            contextMenu: null, // optional. A menu options object suitable for the APEX menu widget. Only specify one of contextMenu and contextMenuAction.
            contextMenuId: null, // optional. Element id to give the internal context menu. Only applies if contextMenu is given.
            iconType: C_DEFAULT_ICON_TYPE,
            labelClass: C_LABEL, // class name to use on the focusable node content element. Typically only change if the adapter implements renderNodeContent
            doubleClick: false, // false - does nothing, "activate" or "toggle"
            clickToRename: false, // if true allow node to be renamed in-place with click on a selected node subject to model approval via node adapter allowRename
            keyboardRename: false, // if true allow node to be renamed in-place with F2 key subject to model approval via node adapter allowRename
            keyboardAdd: false, // if true allow new child node to be added in-place with INSERT key subject to model approval via node adapter allowAdd
            keyboardDelete: false, // if true allow nodes to be deleted with DELETE key subject to model approval via node adapter allowDelete
            // todo keyboardReorder: false
            tooltip: null, // tooltip object suitable for jQuery UI tooltip widget except that items is not needed (it is supplied by the treeView)
                           // and the content callback function receives a second argument which is the node for the tooltip
            navigation: false, // if true then single click causes activation (unless doubleClick is activate) and if the node adapter supports getLink and getLink
                               // returns a value the default behavior is to navigate to that link

            // drag and drop options
            dragAndDrop: false, // if true drag and drop is supported
            dragMultiple: false, // only applies if multiple option is true, if true then multiple nodes can be dragged
            dragReorder: false, // if true the nodes can be reordered using drag and drop
            dragAppendTo: "parent",
            dragContainment: false,
            dragCursor: "auto",
            dragCursorAt: false,
            dragHelper: null, // function to return the helper otherwise the node(s) are cloned
            dragOpacity: false,
            dragAnimate: false, // if true use animation effect when dropping
            dragExpandDelay: 1200, // when dragging and hover over a collapsed node how long to wait until it expands -1 means don't expand
            dragScroll: true,
            dragScrollSensitivity: 20,
            dragScrollSpeed: 10,
            dragZIndex: 1000, // z-index for helper while dragging
            scope: "default", // Only used with jQuery UI droppable
            // distance, delay, and cancel inherited from mouse

            // drag and drop callbacks
            // These events/callbacks work as described for sortable: function(event, ui)
            // The first 4 only apply when a connected draggable is being dragged
            activate: null,
            deactivate: null,
            out: null,
            over: null,
            start: null,
            drag: null, // similar to sortable sort
            beforeStop: null,
            stop: null,

            // This callback/event is triggered when the selection changes. It has no additional data
            selectionChange: null, // selectionChange(event)

            // This callback/event is triggered when nodes are expanded or collapsed
            expansionStateChange: null, // expansionStateChange(event, { node: <node>, nodeContent$: <node-element>, expanded: <bool> } )

            // This callback/event is triggered when node(s) are activated with enter or double click if doubleClick option set to "activate"
            // or single click if navigation option is true and doubleClick is not activate. Handler can call preventDefault to stop navigation.
            activateNode: null, // function( event, { nodes: [] } )

            // This callback/event is triggered when in-place add or rename begins
            beginEdit: null, // beginEdit(event, { action: "add" | "rename", node: <node>, input: <input-element> })

            // This callback/event is triggered when in-place add or rename ends
            endEdit: null, // endEdit(event, { action: "add" | "rename", status: "cancel" | "complete" })

            /*
             * These notification events receive a change object in addition to the event: function(event, change)
             *
             * For added, and renamed events the change object contains these properties as appropriate:
             *   node:
             *   node$:
             *   index:
             *   prevLabel:  - rename only
             *   parentNode: - add only
             *   parent$:    - add only
             *
             * For deleted events the change object contains these properties:
             *   items: array of objects one for each node deleted containing:
             *       parent$
             *       index
             *       node
             *
             * For moved and copied events the change object contains these properties as appropriate:
             *   parentNode:
             *   parent$:
             *   items: array of objects one for each node moved or copied containing:
             *       toNode
             *       toNode$
             *       toIndex
             *       fromParent$   - move only
             *       fromIndex     - move only
             *       fromNode$
             */
            added: null,
            renamed: null,
            deleted: null,
            moved: null,
            copied: null
        },
        scrollTimerId: null, // timer used for scrolling
        delayExpandTimer: null, // timer used to expand nodes
        hasCurrent: false, // only used when tree data comes from markup. Used to select current node
        tooltipOptions: null,
        triggerTimerId: null,
        forwardKey: keys.RIGHT,
        backwardKey: keys.LEFT,
        scrollParent: null, // set to the tree widget scroll parent if there is one
        // baseId: "", //used in generating ids for elements along with nextNodeId
        // treeMap = {}, // mapping of li node id to node
        // nextNodeId = 0, // used to generate unique node ids
        // labelSelector, // selector based on option.labelClass
        // lastFocused, // the element that last had focus (tabIndex is 0)
        // selectAnchor, // anchor element in range selection,
        // searchString, // used by type to select feature
        // searchTimerId, // used by type to select feature
        // contextMenu$, // only used when a contextMenu option is given
        // used during dragging
        animating: false, // true during animation after drop
        dragging: false,
        dragItems: null, // jQuery element(s) being dragged
        currentItem: null, // the first item being dragged used for integration with jQuery UI droppable
        // helper
        // margins
        // offset
        // originalPosition
        // overflowOffset
        // placeholder
        // dropTargetNode
        // dragOperation, // what will happen on drop "move", "copy", or "add"
        // position: helper position during drag, value of event UI arg position property
        // positionAbs: helper absolute position during drag, value of event UI arg offset property
        // lastPositionAbs: (previous positionAbs) used to determine drag direction
        // lastLocation: used to determine changes in placeholder placement during drag

        _create: function () {
            var self = this,
                ctrl$ = this.element,
                o = this.options;

            if ( !o.getNodeAdapter ) {
                o.getNodeAdapter = this._parseTreeMarkup( ctrl$, o.adapterTypesMap || null );
            }
            if ( !o.getNodeAdapter ) {
                throw "Missing required option getNodeAdapter";
            }

            this.nodeAdapter = o.getNodeAdapter();

            this.containerCache = {};

            if ( o.collapsibleRoot === false ) {
                o.expandRoot = true;
            }

            ctrl$.addClass( C_TREEVIEW )
                .attr( "role", "tree" );
            this.baseId = ( o.idPrefix || ctrl$[0].id || "tree" ) + "_";
            this.labelSelector = "." + o.labelClass;

            if ( o.multiple ) {
                ctrl$.attr( "aria-multiselectable", "true" );
            }

            this.rtlFactor = 1;
            if ( ctrl$.css("direction") === "rtl" ) {
                ctrl$.addClass( C_RTL );
                this.forwardKey = keys.LEFT;
                this.backwardKey = keys.RIGHT;
                this.rtlFactor = -1;
            }

            if ( o.disabled ) {
                ctrl$.attr( A_DISABLED , "true" );
            }

            if ( o.tooltip ) {
                this._initTooltips( o.tooltip );
            }

            if ( o.contextMenu ) {
                if ( $.apex.menu ) {
                    if ( o.contextMenu.menubar ) {
                        throw "TreeView contextMenu must not be a menubar";
                    }
                    // augment the menu
                    o.contextMenu._originalBeforeOpen = o.contextMenu.beforeOpen;
                    o.contextMenu.beforeOpen = function( event, ui ) {
                        if ( o.contextMenu._originalBeforeOpen ) {
                            ui.menuElement = self.contextMenu$;
                            ui.tree = ctrl$;
                            ui.treeNodeAdapter = self.nodeAdapter;
                            ui.treeSelection = self.getSelection();
                            ui.treeSelectedNodes = self.getNodes( ui.treeSelection );
                            o.contextMenu._originalBeforeOpen( event, ui );
                        }
                    };
                    o.contextMenu.oldAfterClose = o.contextMenu.afterClose;
                    o.contextMenu.afterClose = function( event, ui ) {
                        if ( o.contextMenu.oldAfterClose ) {
                            ui.menuElement = self.contextMenu$;
                            ui.tree = ctrl$;
                            o.contextMenu.oldAfterClose( event, ui );
                        }
                        if ( !ui.actionTookFocus ) {
                            self.focus();
                        }
                    };
                    this.contextMenu$ = $( "<div style='display:none'></div>" ).appendTo( "body" );
                    if ( o.contextMenuId ) {
                        this.contextMenu$[0].id = o.contextMenuId;
                    }
                    this.contextMenu$.menu( o.contextMenu );
                    if ( o.contextMenuAction ) {
                        debug.warn("TreeView contextMenuAction option ignored when contextMenu option present");
                    }
                    o.contextMenuAction = function( event ) {
                        var target$, pos;

                        if ( event.type === "contextmenu" ) {
                            self.contextMenu$.menu( "toggle", event.pageX, event.pageY );
                        } else {
                            target$ = $( event.target );
                            pos = target$.offset();
                            self.contextMenu$.menu( "toggle", pos.left, pos.top + target$.closest( SEL_CONTENT ).height() );
                        }
                    };
                } else {
                    debug.warn("TreeView contextMenu option ignored because menu widget not preset");
                }
            }

            // keep track of the tree scroll parent
            this.scrollParent = ctrl$.scrollParent();

            // determine the parent's offset
            this.offset = this.element.offset();

            this._mouseInit();

            this._on( this._eventHandlers );

            this.renderNodeOptions = {
                iconType: o.iconType,
                labelClass: o.labelClass,
                useLinks: o.useLinks
            };

            this.refresh();
        },

        _eventHandlers: {
            click: function( event ) {
                var node$,
                    o = this.options,
                    target$ = $( event.target );

                // ignore shift and ctrl click on anchors to let the browser do its thing
                if ( !o.multiple && event.target.nodeName === "A" && (event.shiftKey || event.ctrlKey) ) {
                    this.keyboardActivate = false;
                    return;
                }

                if ( target$.hasClass( C_TOGGLE ) ) {
                    this._toggleNode( target$.parent() );
                    // restore focus but don't want to scroll at this point
                    if ( this.scrollParent ) {
                        // This is needed when focus is outside the widget. Without this
                        // giving focus to the last focused node may cause the tree to scroll
                        // does not work in IE except when scroll parent is the document
                        preventNextScroll(this.scrollParent);
                    }
                    this.lastFocused.focus();
                    event.preventDefault();
                } else {
                    node$ = target$.closest( SEL_NODE );
                    if ( node$.length > 0 ) {

                        // if already selected and click to rename
                        if ( o.clickToRename &&
                                node$.children( SEL_CONTENT ).find( this.labelSelector ).attr( A_SELECTED ) === "true" &&
                                !event.ctrlKey && !event.altKey &&
                                this.getSelection().length === 1 && target$.closest( this.labelSelector ).length ) {
                            this.renameNodeInPlace( node$.children( SEL_CONTENT ) );
                        } else {
                            this._select( node$.children( SEL_CONTENT ), event, true );
                            if ( o.navigation && (this.keyboardActivate || o.doubleClick !== "activate") ) {
                                this._activate( event );
                            }
                        }
                        event.preventDefault();
                    }
                }
                this.keyboardActivate = false;
                clearSelection();
            },

            dblclick: function( event ) {
                var node$,
                    doubleClick = this.options.doubleClick;

                if ( doubleClick ) {
                    node$ = $( event.target ).closest( SEL_NODE );
                    if ( node$.length > 0 ) {
                        if ( doubleClick === "toggle" ) {
                            this._toggleNode( node$ );
                            event.preventDefault();
                        } else if ( doubleClick === "activate" ) {
                            this._activate( event );
                        }
                    }
                }
            },

            keydown: function( event ) {
                var node$, nodeContent$, nh, scrollHeight, page,
                    self = this,
                    o = this.options,
                    ctrl$ = this.element,
                    kc = event.which;

                // ignore if target is the input for add/rename also ignore during drag
                if ( event.altKey || event.target.nodeName === "INPUT" || this.dragging ) {
                    return;
                }
                if ( kc === keys.PAGE_UP || kc === keys.PAGE_DOWN ) {
                    if ( this.scrollParent ) {
                        nh = ctrl$.find( SEL_ROW ).filter( ":visible" ).first().outerHeight() || 24;
                        node$ = ctrl$.find( "li" ).filter( ":visible" ).first();
                        nh += parseInt( node$.css( "margin-top" ), 10 ) + parseInt( node$.css( "margin-bottom" ), 10 );
                        if ( this.scrollParent[0] === document ) {
                            scrollHeight = $( window ).height();
                        } else {
                            scrollHeight = this.scrollParent[0].clientHeight;
                        }
                        page = Math.floor( scrollHeight / nh ) - 1;
                    } else {
                        page = 10;
                    }
                }
                if ( kc === keys.HOME ) {
                    ctrl$.find( SEL_CONTENT ).filter( ":visible" ).first().each( function () { // at most once
                        self._select( $( this ), event, true, true );
                    } );
                    event.preventDefault();
                } else if ( kc === keys.END ) {
                    ctrl$.find( SEL_CONTENT ).filter( ":visible" ).last().each( function () { // at most once
                        self._select( $( this ), event, true, true );
                    } );
                    event.preventDefault();
                } else if ( kc === keys.SPACE ) {
                    if ( this.lastFocused ) {
                        this._select( $( self.lastFocused ).closest( SEL_CONTENT ), event, true, true );
                    }
                    event.preventDefault();
                } else if ( kc === keys.DOWN ) {
                    this._traverseDown( event, 1 );
                    event.preventDefault();
                } else if ( kc === keys.UP ) {
                    this._traverseUp( event, 1 );
                    event.preventDefault();
                    event.stopPropagation(); // Don't let a containing tab or accordion act on Ctrl+Up
                } else if ( kc === keys.PAGE_DOWN ) {
                    this._traverseDown( event, page );
                    event.preventDefault();
                } else if ( kc === keys.PAGE_UP ) {
                    this._traverseUp( event, page );
                    event.preventDefault();
                } else if ( kc === this.backwardKey ) {
                    // If the focused node is collapsible, collapse it.
                    if ( this.lastFocused ) {
                        node$ = $( this.lastFocused ).closest( SEL_NODE );
                        if ( node$.hasClass( C_COLLAPSIBLE ) ) {
                            this._collapseNode( node$ );
                        } else {
                            // If it is not collapsible, focus parent.
                            node$.parent().prevAll( SEL_CONTENT ).each( function () { // at most once
                                self._select( $( this ), event, true, true );
                            } );
                        }
                    }
                    event.preventDefault();
                } else if ( kc === this.forwardKey ) {
                    // If the focused node is not a leaf, expand or move to descendant
                    if ( this.lastFocused ) {
                        node$ = $( this.lastFocused ).closest( SEL_NODE );
                        if ( node$.hasClass( C_EXPANDABLE ) ) {
                            this._expandNode( node$ );
                        } else if ( node$.hasClass( C_COLLAPSIBLE ) ) {
                            node$.children( "ul" ).children( "li" ).first().children( SEL_CONTENT ).each( function () { // at most once
                                self._select( $( this ), event, true, true );
                            } );
                        }
                    }
                    event.preventDefault();
                } else if ( kc === keys.ENTER ) {
                    if (  event.target.nodeName !== "A" && !event.shiftKey && !event.ctrlKey ) {
                        this._activate( event );
                        event.preventDefault();
                    } else {
                        this.keyboardActivate = true;
                    }
                } else if ( kc === 113 && o.keyboardRename ) { // F2
                    if ( this.lastFocused && $( this.lastFocused ).closest( SEL_CONTENT + SEL_SELECTED ).length > 0 ) {
                        nodeContent$ = $( this.lastFocused ).closest( SEL_CONTENT );
                    } else {
                        nodeContent$ = this.getSelection().first();
                    }
                    if ( nodeContent$.length > 0 ) {
                        this.renameNodeInPlace( nodeContent$ );
                    }
                } else if ( kc === 45 && o.keyboardAdd ) { // INS
                    if ( this.lastFocused && $( this.lastFocused ).closest( SEL_CONTENT + SEL_SELECTED ).length > 0 ) {
                        nodeContent$ = $( this.lastFocused ).closest( SEL_CONTENT );
                    } else {
                        nodeContent$ = this.getSelection().first();
                    }
                    if ( nodeContent$.length > 0 ) {
                        this.addNodeInPlace( nodeContent$ );
                    }
                } else if ( kc === keys.DELETE && o.keyboardDelete ) {
                    this.deleteNodes( this.getSelection() );
                } else if ( this.options.contextMenuAction && (event.shiftKey && kc === 121) ) { // shift F10
                    // if target component not selected then select it
                    if ( self.lastFocused && !$( self.lastFocused ).closest( SEL_CONTENT ).hasClass( C_SELECTED ) ) {
                        self._select( $( self.lastFocused ).closest( SEL_CONTENT ), {}, false, true ); // empty event so that selection will be set
                    }
                    this.options.contextMenuAction( event );
                    event.preventDefault();
                }
            },

            keypress: function( event ) {
                var ch, next$,
                    self = this;

                function findNode( search ) {
                    var startNode$, nextNode$, label$,
                        slen = search.length;

                    function next() {
                        nextNode$ = nextNode( nextNode$ );
                        if ( nextNode$.length === 0 ) {
                            nextNode$ = self.element.find( SEL_NODE ).filter( ":visible" ).first();
                        }
                    }

                    nextNode$ = startNode$ = $( self.lastFocused ).closest( SEL_NODE );
                    if ( slen === 1 ) {
                        next();
                    }

                    while ( true ) {
                        label$ = nextNode$.children( SEL_CONTENT ).find( self.labelSelector ).first();
                        if ( label$.text().substring(0, slen).toLowerCase() === search ) {
                            return label$.closest( SEL_CONTENT );
                        }
                        next();
                        if ( nextNode$[0] === startNode$[0] ) {
                            break;
                        }
                    }
                    return null;
                }

                if ( event.which === 0 || event.ctrlKey || event.altKey || event.target.nodeName === "INPUT" || this.dragging ) {
                    return;
                }

                ch = String.fromCharCode( event.which ).toLowerCase();
                if ( this.searchTimerId ) {
                    // a character was typed recently
                    // if it is the same character just look for the next item that starts with the letter
                    if ( ch !== this.searchString ) {
                        // otherwise add to the search string
                        this.searchString += ch;
                    }
                    clearTimeout( this.searchTimerId );
                    this.searchTimerId = null;
                } else {
                    // a character hasn't been typed in a while so search from the beginning
                    if ( ch === " " ) {
                        return;
                    }
                    this.searchString = ch;
                }
                this.searchTimerId = setTimeout( function () {
                    self.searchTimerId = null;
                }, 500 );

                next$ = findNode( this.searchString );
                if ( next$ ) {
                    this._select( next$, {}, true, true );
                }

            },

            focusin: function( event ) {
                var label$ = $( event.target ).closest( this.labelSelector );
                if ( label$.length ) {
                    label$.addClass( C_FOCUSED ).closest( SEL_NODE ).children( SEL_ROW ).addClass( C_FOCUSED );
                    this._setFocusable( label$ );
                }
            },

            focusout: function( event ) {
                var label$ = $( event.target ).closest( this.labelSelector );
                label$.removeClass( C_FOCUSED ).closest( SEL_NODE ).children( SEL_ROW ).removeClass( C_FOCUSED );
            },

            mousemove: function( event ) {
                var node$;
                if ( this.dragging ) {
                    return;
                }
                node$= $(event.target ).closest( SEL_NODE );
                if ( node$.length && this.lastHover !== node$[0] ) {
                    $( this.lastHover ).children( SEL_ROW_CONTENT  ).removeClass( C_HOVER );
                    node$.children( SEL_ROW_CONTENT  ).addClass( C_HOVER );
                    this.lastHover = node$[0];
                }
            },

            mouseleave: function( event ) {
                if ( this.dragging ) {
                    return;
                }
                if ( this.lastHover ) {
                    $( this.lastHover ).children( SEL_ROW_CONTENT  ).removeClass( C_HOVER );
                    this.lastHover = null;
                }
            },

            contextmenu: function( event ) {
                var nodeContent$;

                if ( this.options.contextMenuAction ) {
                    // if target component not selected then select it
                    nodeContent$ = $( event.target).closest( SEL_CONTENT ).not( SEL_SELECTED );
                    if ( nodeContent$.length ) {
                        this._select( nodeContent$, {}, false, false ); // force set selection
                    }
                    this.options.contextMenuAction( event );
                    event.preventDefault();
                }

            }
        },

        _setOption: function( key, value ) {
            var startLabel;

            if ( key === "disabled" ) {
                // Don't call widget base _setOption for disable as it adds ui-state-disabled class
                this.options[ key ] = value;

                this.widget().toggleClass( C_DISABLED, !!value );
                if ( value ) {
                    this.element.attr( A_DISABLED , "true" );
                    if ( this.lastFocused ) {
                        this.lastFocused.tabIndex = -1;
                    }
                    this.lastFocused = null;
                } else {
                    this.element.removeAttr( A_DISABLED );
                    startLabel = this.getSelection().first().find( this.labelSelector );
                    if ( !startLabel.length ) {
                        startLabel = this.element.find( this.labelSelector ).first();
                    }
                    this._setFocusable( startLabel );
                }
            } else if ( key === "contextMenu" || key === "contextMenuId" ) {
                throw "TreeView " + key + " cannot be set";
            } else if ( key === "contextMenuAction" && this.options.contextMenu ) {
                throw "TreeView contextMenuAction cannot be set when the contextMenu option is used";
            } else if ( key === "dragMultiple" && value && !this.options.multiple ) {
                throw "TreeView dragMultiple cannot be true when the multiple option is false";
            } else if ( key === "multiple" && !value && this.options.dragMultiple ) {
                throw "TreeView multiple cannot be false when the dragMultiple option is true";
            } else if ( key === "collapsibleRoot" ) {
                throw "TreeView collapsibleRoot option cannot be set";
            } else {
                $.Widget.prototype._setOption.apply( this, arguments );
            }

            this.renderNodeOptions = {
                iconType: this.options.iconType,
                labelClass: this.options.labelClass,
                useLinks: this.options.useLinks
            };

            if ( key === "showRoot" || key === "useLinks" ) {
                this.refresh();
            } else if ( key === "getNodeAdapter" ) {
                this.nodeAdapter = this.options.getNodeAdapter();
                this.refresh();
            } else if ( key === "multiple" ) {
                this.element.attr( "aria-multiselectable", value ? "true" : "false" );
                // if multiple is false make sure only one thing selected
                if ( value === false && this.getSelection().length > 0 ) {
                    this._select( $( this.lastFocused ).closest( SEL_CONTENT ), {}, false, false );
                }
            } else if ( key === "expandRoot" && value === false ) {
                if ( this.options.collapsibleRoot === false ) {
                    this.options.expandRoot = true;
                    debug.warn("ExpandRoot option cannot be false when collapsibleRoot is false");
                }
            } else if ( key === "tooltip" ) {
                this._initTooltips( value );
            }

        },

        _initTooltips: function( options ) {
            var ttOptions,
                self = this;

            if ( !$.ui.tooltip ) {
                debug.warn( "tooltip option ignored because missing tooltip widget dependency" );
                return;
            }
            if ( this.tooltipOptions ) {
                // tooltip widget already initialized so destroy it
                this.element.tooltip( "destroy" );
                this.tooltipOptions = null;
            }
            if ( options ) {
                ttOptions = this.tooltipOptions = $.extend( true, {}, options ); // deep copy
                ttOptions.items = this.labelSelector;
                if ( ttOptions.content && $.isFunction( ttOptions.content ) ) {
                    ttOptions._originalContent = ttOptions.content;
                    ttOptions.content = function( callback ) {
                        var node = self.getNodes( $(this ).closest( SEL_CONTENT ) )[0];
                        return ttOptions._originalContent.call( this, callback, node );
                    };
                }
                this.element.tooltip( ttOptions );
            }
        },

        _destroy: function() {
            this.element.empty()
                .removeClass( C_TREEVIEW + " " + C_RTL )
                .removeAttr( "role" )
                .removeAttr( "aria-multiselectable" );
            if ( this.contextMenu$ ) {
                this.contextMenu$.remove();
            }
            if ( this.options.tooltip && $.ui.tooltip ) {
                this.element.tooltip( "destroy" );
            }
            this._mouseDestroy();
        },

        //
        // Public methods
        //

        /**
         * refresh
         * Call to render the whole tree or sub trees whenever the data model changes.
         * @param nodeContent$ the tree node(s) to refresh from. If not given or null start from the root of the tree.
         */
        refresh: function( nodeContent$ ) {
            var rootNode, root$, sel$,
                self = this,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                selectedNodes = null,
                ctrl$ = this.element,
                out = util.htmlBuilder();

            // Try to preserve selection. The DOM elements will be different after refresh so can't use
            // getSelection. Have to rely on the model having the same nodes. If the model hasn't changed (much)
            // and the adapter supports getViewId then the selection can be preserved. Any nodes that are
            // gone from the model after refresh will be ignored in setSelectedNodes.
            if ( nodeAdapter.getViewId ) {
                selectedNodes = this.getSelectedNodes();
            }
            if ( nodeContent$ ) {
                nodeContent$.each( function() {
                    var node$ = $( this ).parent(),
                        node = self.treeMap[getIdFromNode( node$ )];

                    // clean out old mappings todo what about adapter view id???
                    node$.find( SEL_NODE ).addBack().each( function() {
                        delete self.treeMap[getIdFromNode( $( this ) )];
                    } );
                    // render and insert new tree nodes
                    out.clear();
                    self._renderNode( node, getLevelFromNode( node$, self.labelSelector ), out );
                    node$.replaceWith( out.toString() );
                } );
            } else {
                this.treeMap = {};
                this.nextNodeId = 0;
                if ( nodeAdapter.clearViewId ) {
                    nodeAdapter.clearViewId( this.baseId );
                }

                rootNode = nodeAdapter.root(); //get the single root node
                if ( rootNode ) {
                    out.markup( M_BEGIN_CHILDREN );
                    if ( o.showRoot ) {
                        this._renderNode( rootNode, 1, out ); // level 1
                    } else {
                        if ( nodeAdapter.hasChildren( rootNode ) ) {
                            // Note: doesn't work if top level lazy loaded, causes problems when showRoot false
                            this._renderChildren( rootNode, 1, out ); // level 1
                        }
                    }
                    out.markup( M_END_CHILDREN );
                    ctrl$.html( out.toString() );
                } else {
                    // There really should be a root node
                    // The cases where the tree root doesn't exist should be very rare.
                    // If the tree data model doesn't have a root the treeView should not be created and a message shown in its place,
                    // but that is something external to this widget.
                    // Just in case add an empty group where the root would go
                    // TODO drop target is broken when there is no root
                    out.markup( M_BEGIN_CHILDREN );
                    out.markup( M_END_CHILDREN );
                    ctrl$.html( out.toString() );
                }

                if ( o.expandRoot && o.showRoot ) {
                    root$ = this._getRoots();
                    if ( root$.length > 0 ) {
                        this._expandNode( root$ );
                    }
                }
            }
            if ( this.hasCurrent ) {
                sel$ = this.find( {
                    depth: -1,
                    match: function( n ) {
                        return n.current === true;
                    }
                } );
                this.hasCurrent = false;
                this.setSelection( sel$ );
            } else if ( selectedNodes && selectedNodes.length > 0 ) {
                this.setSelectedNodes( selectedNodes );
            } else {
                // Set initial focus to first node
                this.selectAnchor = this.lastFocused;
                this._setFocusable( ctrl$.find( this.labelSelector ).first() );
            }
        },

        /**
         * getNodeAdapter
         * Returns the node adapter that the treeView is using
         */
        getNodeAdapter: function() {
            return this.nodeAdapter;
        },

        /**
         * focus
         * Set focus to the tree node that last had focus.
         */
        focus: function() {
            if ( this.lastFocused ) {
                this.lastFocused.focus();
            }
        },

        /**
         * getTreeNode
         * Given a node return a jQuery object with the element corresponding to that node. The element returned
         * has the class a-TreeView-content.
         *
         * This is for mapping from a model node object to a DOM element.
         *
         * @param node the model node to get the corresponding tree node DOM element for
         * @return {*} jQuery object with the tree nodes for the given model node
         * throws an exception if the nodeAdapter doesn't implement getViewId.
         */
        getTreeNode: function( node ) {
            var id,
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.getViewId ) {
                throw "Unsupported by model";
            }
            id = nodeAdapter.getViewId( this.baseId, node );
            return $( "#" + this.baseId + id ).children( SEL_CONTENT );
        },

        /**
         * getSelection
         * Returns the set of tree nodes currently selected. If there is no selection the empty set is returned.
         * The elements returned have the class a-TreeView-content.
         * @return {*} jQuery object with the set of selected tree nodes
         */
        getSelection: function() {
            return this.element.find( SEL_CONTENT + SEL_SELECTED );
        },

        /**
         * getNodes
         * Given a jQuery object with a set of tree nodes return an array of nodes that corresponds to each
         * tree node in the set. The tree nodes passed in must be the ones this treeView instance rendered
         * with class a-TreeView-content.
         *
         * This is for mapping from DOM elements to model node objects.
         *
         * @param nodeContent$ jQuery Object holding a set of tree nodes
         * @return {Array} array of data model nodes
         */
        getNodes: function( nodeContent$ ) {
            var self = this,
                nodes = [];

            nodeContent$.each( function () {
                nodes.push( self.treeMap[getIdFromNode( $( this ).closest( "li" ) )] );
            } );
            return nodes;
        },

        /**
         * getSelectedNodes
         * Returns the data model nodes corresponding to the currently selected tree nodes.
         * @return {Array} array of data model nodes
         */
        getSelectedNodes: function() {
            return this.getNodes( this.getSelection() );
        },

        /**
         * setSelection
         * Sets the current tree selection. The tree nodes passed in must be the ones this treeView instance rendered
         * with class a-TreeView-content.
         * @param nodeContent$ a jQuery object with the tree nodes to select. An empty jQuery set will clear the selection.
         * @param focus if true the first tree node in nodeContent$ will be focused
         */
        setSelection: function( nodeContent$, focus ) {
            focus = !!focus;
            if ( !this.options.multiple ) {
                nodeContent$ = nodeContent$.first();
            }
            this._select( nodeContent$, null, focus, false );
        },

        /**
         * setSelectedNodes
         * Sets the current tree selection. Given an array of nodes from the node adapter model, find the corresponding
         * tree node elements and set the selection to those nodes.
         * @param nodes array of model nodes
         * @param focus if true the first tree node corresponding to nodes will be focused
         */
        setSelectedNodes: function( nodes, focus ) {
            var i, id, el,
                elements = [],
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.getViewId ) {
                throw "Unsupported by model";
            }

            focus = !!focus;
            if ( !this.options.multiple ) {
                nodes = [ nodes[0] ];
            }

            for ( i = 0; i < nodes.length; i++ ) {
                id = nodeAdapter.getViewId( this.baseId, nodes[i] );
                el = $( "#" + this.baseId + id ).children( SEL_CONTENT )[0];
                if ( el ) {
                    elements.push( el );
                } else {
                    debug.warn( "TreeView: Ignoring bad node in setSelectedNodes" );
                }
            }
            this._select( $( elements ), null, focus, false, true );
        },

        /**
         * getExpandedNodeIds
         * Get the ids of expanded nodes.
         * @return [*] array of data model node ids one for each expanded node
         * throws an exception if the nodeAdapter doesn't implement getExpandedNodeIds.
         */
        getExpandedNodeIds: function() {
            var nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.getExpandedNodeIds ) {
                throw "Unsupported by model";
            }
            return nodeAdapter.getExpandedNodeIds( this.baseId );
        },

        /**
         * getExpandedState
         * Get a map from node id to Boolean where true = expanded and false = collapsed
         * Note It is not guaranteed that the map contain all nodes! It may only contain nodes that have been
         * explicitly expanded or collapsed by the user. This is up to the adapter.
         * @return {} an object where the properties are node ids and the values are true if expanded and false otherwise
         * throws an exception if the nodeAdapter doesn't implement getExpandedState.
         */
        getExpandedState: function() {
            var nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.getExpandedState ) {
                throw "Unsupported by model";
            }
            return nodeAdapter.getExpandedState( this.baseId );
        },

        /**
         * find
         * Search through the tree starting at the root or the given parent tree node for one or more matching nodes
         * (the parent tree node is not included in the search). The set of matched tree nodes is returned as a jQuery object.
         * The match criteria is determined by the match function that is called for each node. The search can be limited
         * to a specified depth (from the starting node). Find can return either all the nodes matched or just the first
         * one.
         *
         * This is a synchronous API so it can only search tree nodes that have been loaded. If the data model is
         * loaded asynchronously only those tree nodes that have already been loaded into the model can be searched.
         * The tree nodes don't need to be expanded to be searched, but searching will cause them to be rendered to the DOM.
         *
         * @param options an object with these properties:
         *   - parentNodeContent$ The parent of the nodes to start search from. The default is to start at the root(s).
         *   - depth integer How deep to search from the starting tree node. A value of -1 means no depth limit. The default is 1
         *   - match (required) a function that takes a node returns true if the node is to be included in the find results
         *   - findALl boolean If true find all matches up to the given depth. If false return the first found. Default false
         * @return {*} jQuery object with the set of tree nodes found. It may be empty if no nodes were found.
         */
        find: function( options ) {
            return $(this._find( options.parentNodeContent$ || null, options.match, options.depth || 1, options.findAll || false ));
        },

        /**
         * expand
         * Expand the given tree node(s) or if no node is given expand the root node(s). Expanding a node makes all
         * of its children visible.
         * @param nodeContent$ one or more tree nodes to expand or null/undefined to expand the root(s).
         * @return {*} this jQuery object
         */
        expand: function( nodeContent$ ) {
            var self = this;

            if ( !nodeContent$ ) {
                nodeContent$ = this._getRoots().children( SEL_CONTENT );
            }
            nodeContent$.each( function() {
                var node$ = $( this ).closest( SEL_NODE );
                if ( node$.hasClass( C_EXPANDABLE ) ) {
                    self._expandNode( node$ );
                }
            } );
        },

        /**
         * expandAll
         * Expand the given tree node(s) or if no node is given the root node(s) and recursively
         * expand all its children.
         * @param nodeContent$ one or more tree nodes to expandALl from or null/undefined to expandAll from the root(s)
         * @return {*} this jQuery object
         */
        expandAll: function( nodeContent$ ) {
            var self = this;

            if ( !nodeContent$ ) {
                nodeContent$ = this._getRoots().children( SEL_CONTENT );
            }
            nodeContent$.each( function() {
                var node$ = $( this ).closest( SEL_NODE );
                if ( node$.hasClass( C_EXPANDABLE ) ) {
                    self._expandNode( node$, function() {
                        self.expandAll( node$.children( "ul" ).children( "li" ).children( SEL_CONTENT ) );
                    });
                } else {
                    self.expandAll( node$.children( "ul" ).children( "li" ).children( SEL_CONTENT ) );
                }
            } );
        },

        /**
         * collapse
         * Collapse the given tree node(s) or if no node is given collapse the root node(s). Collapsing a node makes all
         * of its children hidden.
         * @param nodeContent$ one or more tree nodes to collapse or null/undefined to collapse the root(s).
         * @return {*}
         */
        collapse: function( nodeContent$ ) {
            var self = this;

            if ( !nodeContent$ ) {
                nodeContent$ = this._getRoots().children( SEL_CONTENT );
            }
            nodeContent$.each( function() {
                var node$ = $( this ).closest( SEL_NODE );
                if ( node$.hasClass( C_COLLAPSIBLE ) ) {
                    self._collapseNode( node$ );
                }
            } );
        },

        /**
         * collapseAll
         * Collapse the given tree node(s) or if no node is given the root node(s) and recursively
         * collapse all its children.
         * @param nodeContent$ one or more tree nodes to collapseALl from or null/undefined to collapseAll from the root(s)
         * @return {*} this jQuery object
         */
        collapseAll: function( nodeContent$ ) {
            var self = this;

            if ( !nodeContent$ ) {
                nodeContent$ = this._getRoots().children( SEL_CONTENT );
            }
            nodeContent$.each( function() {
                var node$ = $( this ).closest( SEL_NODE );
                self.collapseAll( node$.children( "ul" ).children( "li" ).children( SEL_CONTENT ) );
                if ( node$.hasClass( C_COLLAPSIBLE ) ) {
                    self._collapseNode( node$ );
                }
            } );
        },

        /**
         * addNodeInPlace
         * Adds a new tree node in the tree view and also adds it to the model via the node adapter addNode method.
         * First checks if the model allows add for the parent node. The label of the new node is chosen by the user in-place.
         * The tree node label is replaced by a text input field. Escape will cancel the add, blur will complete the add with
         * the initial label, and Enter will complete the add. The order of the new node among its siblings is determined
         * by the model after the node is added.
         *
         * @param parentNodeContent$ the parent tree node to add the new node under. Must be a jQuery object representing exactly one tree node element.
         * @param initialLabel the initial label for the new node which is then edited
         * @param context optional arbitrary object to pass into the adapter allowAdd and addNode methods.
         * This is an object containing information needed by the addNode method to create the new node. In the typical
         * simple case it is exactly the model node.
         * throws an exception if the nodeAdapter doesn't implement addNode or allowAdd.
         */
        addNodeInPlace: function( parentNodeContent$, initialLabel, context ) {
            var ul$, newNode$, parent, level,
                self = this,
                ctrl$ = this.element,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                completed = false;

            function cancel() {
                newNode$.remove();
                self._makeLeafIfNeeded( parentNodeContent$ );
                self._select( parentNodeContent$, {}, true );
                self._endEdit( {
                    action: "add",
                    status: "cancel"
                } );
            }

            function complete( newName ) {
                var input;

                if ( completed ) {
                    return;
                }
                completed = true;
                nodeAdapter.addNode( parent, ul$.children().length - 1, newName, context, function ( child, index ) {
                    var node$, out;

                    if ( child === false ) {
                        // try again
                        completed = false;
                        input = newNode$.find( "input" ).val( initialLabel ).get( 0 );
                        setFocus( input );
                        input.select();
                        return;
                    }
                    if ( child ) {
                        newNode$.remove();
                        out = util.htmlBuilder();
                        self._renderNode( child, level, out );
                        if ( index >= ul$.children( "li" ).length ) {
                            ul$.append( out.toString() );
                        } else {
                            ul$.children( "li" ).eq( index ).before( out.toString() );
                        }
                        node$ = ul$.children( "li" ).eq( index );
                        self._select( node$.children( SEL_CONTENT ), {}, true );
                        self._endEdit( {
                            action: "add",
                            status: "complete"
                        } );

                        self._trigger( "added", {}, {
                            parentNode: parent,
                            parent$: parentNodeContent$,
                            index: index,
                            node: child,
                            node$: node$.children( SEL_CONTENT )
                        } );

                    } else {
                        cancel();
                    }
                } );
            }

            function addInput() {
                var inputWidth, nodeContent$, input$,
                    out = util.htmlBuilder(),
                    addId = self.baseId + "new";

                // keep in sync with a normal rendered node _renderNode, renderTreeNodeContent
                out.markup( "<li" )
                    .attr( "id", addId )
                    .attr( "class", C_NODE + " " + C_LEAF )
                    .markup( "><div" )
                    .attr( "class", C_ROW )
                    .markup( "></div><div" )
                    .attr( "class", C_CONTENT )
                    .markup( ">" );
                if ( nodeAdapter.getIcon ) {
                    // no specific icon but leave room for it
                    out.markup( "<span" ).attr( "class", o.iconType ).markup( "></span>" );
                }

                out.markup( "<span role='treeitem'" ).attr( "class", o.labelClass )
                    .attr( A_LEVEL, level )
                    .attr( A_SELECTED, "true")
                    .markup( "><input type='text'></span></div></li>" );

                ul$.append( out.toString() );
                newNode$ = ul$.find( "#" + addId );
                nodeContent$ = newNode$.children( SEL_CONTENT );
                if ( self.rtlFactor === 1 ) {
                    inputWidth = nodeContent$.width() - nodeContent$.find( self.labelSelector )[0].offsetLeft - 16;
                } else {
                    inputWidth = nodeContent$.find( self.labelSelector )[0].offsetLeft + nodeContent$.find( self.labelSelector ).width()  - 16;
                }
                input$ = nodeContent$.find( "input" );
                initNodeLabelInput( input$, initialLabel, inputWidth, complete, cancel );
                self._beginEdit( {
                    action: "add",
                    context: context,
                    input: input$[0]
                } );
            }

            if ( !nodeAdapter.addNode || !nodeAdapter.allowAdd ) {
                throw "Unsupported by model";
            }

            if ( parentNodeContent$ === null ) {
                parent = nodeAdapter.root();
                if ( o.showRoot ) {
                    parentNodeContent$ = ctrl$.find( "ul:first > li" );
                } else {
                    // This is the case where a new top level (multi-root) node is added.
                    if ( !nodeAdapter.allowAdd( parent, "add", context ?  [context] : undefined ) ) {
                        return;
                    }
                    level = 1;
                    ul$ = ctrl$.find( "ul:first" );
                    addInput();
                    return;
                }
            } else {
                parent = this.treeMap[getIdFromNode( parentNodeContent$.parent() )];
            }

            if ( !nodeAdapter.allowAdd( parent, "add", context ?  [context] : undefined ) ) {
                return;
            }
            level = getLevel( parentNodeContent$, self.labelSelector ) + 1;
            self._makeParentIfNeeded( parentNodeContent$ );
            this._expandNode( parentNodeContent$.parent(), function () {
                ul$ = parentNodeContent$.next( "ul" );
                addInput();
            } );
        },

        /**
         * renameNodeInPlace
         * Renames a tree node in the tree view and updates the model via the node adapter renameNode method.
         * First checks it the model allows the node to be renamed. The rename is done by the user in-place.
         * The tree node label is replaced by a text input field. Escape or blur will cancel, Enter will complete the rename.
         * The order of the renamed node among its siblings is determined by the model after the node is renamed.
         *
         * @param nodeContent$ the tree node to rename. Must be a jQuery object representing exactly one tree node element.
         * throws an exception if the nodeAdapter doesn't implement renameNode or allowRename.
         */
        renameNodeInPlace: function( nodeContent$ ) {
            var node, input$, oldLabel, inputWidth, label$, renderState,
                self = this,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                node$ = nodeContent$.parent(),
                nodeId = getIdFromNode( node$ ),
                completed = false,
                out = util.htmlBuilder();

            function cancel() {
                out.clear();
                renderTreeNodeContent( out, node, nodeAdapter, self.renderNodeOptions, renderState );
                nodeContent$.html( out.toString() );
                self._select( nodeContent$, {}, true );
                self._endEdit( {
                    action: "rename",
                    status: "cancel"
                } );
            }

            function complete( newLabel ) {
                var input;

                if ( completed ) {
                    return;
                }
                completed = true;
                if ( newLabel === oldLabel ) {
                    cancel();
                    return;
                }
                nodeAdapter.renameNode( node, newLabel, function ( renamedNode, index ) {
                    var oldIndex, ul$, children$;

                    if ( renamedNode === false ) {
                        // try again
                        completed = false;
                        input = nodeContent$.find( "input" ).val( oldLabel )[0];
                        setFocus( input );
                        input.select();
                        return;
                    }
                    if ( renamedNode ) {
                        out.clear();
                        renderTreeNodeContent( out, renamedNode, nodeAdapter, self.renderNodeOptions, renderState );
                        nodeContent$.html( out.toString() );
                        self.treeMap[nodeId] = renamedNode; // update map in case node changed
                        ul$ = node$.parent();
                        children$ = ul$.children( "li" );
                        oldIndex = children$.index( node$ );
                        if ( oldIndex !== index ) {
                            if ( index > oldIndex ) {
                                index += 1;
                            }
                            if ( index >= children$.length ) {
                                ul$.append( node$ );
                            } else {
                                children$.eq( index ).before( node$ );
                            }
                        }
                        self._select( nodeContent$, {}, true );
                        self._endEdit( {
                            action: "rename",
                            status: "complete"
                        } );

                        self._trigger( "renamed", {}, {
                            prevLabel: oldLabel,
                            index: index,
                            node: renamedNode,
                            node$: nodeContent$
                        } );

                        // the DOM node didn't change so _select won't fire the change event - force it
                        self._trigger( EVENT_SELECTION_CHANGE, 0 );

                    } else {
                        cancel();
                    }
                } );
            }

            if ( !nodeAdapter.renameNode || !nodeAdapter.allowRename ) {
                throw "Unsupported by model";
            }

            node = this.treeMap[nodeId];
            if ( !nodeAdapter.allowRename( node ) ) {
                return;
            }

            label$ = nodeContent$.find( this.labelSelector );
            renderState = {
                level: parseInt( label$.attr( A_LEVEL ), 10 ),
                selected: label$.attr( A_SELECTED ) === "true",
                disabled: label$.attr( A_DISABLED ) === "true",
                hasChildren: label$.attr( A_EXPANDED ) !== undefined,
                expanded: label$.attr( A_EXPANDED ) === "true"
            };
            oldLabel = nodeAdapter.getLabel( node );
            if ( self.rtlFactor === 1 ) {
                inputWidth = nodeContent$.width() - label$[0].offsetLeft - 16;
            } else {
                inputWidth = label$[0].offsetLeft + label$.width()  - 16;
            }
            label$.html( "<input type='text'>" );
            input$ = nodeContent$.find( "input" );
            initNodeLabelInput( input$, oldLabel, inputWidth, complete, cancel );
            self._beginEdit( {
                action: "rename",
                node: node,
                input: input$[0]
            } );
        },

        /**
         * deleteNodes
         * Deletes nodes from the model and tree view. First checks that the model allows delete then deletes
         * the node from the model (a potentially async operation). If the deletes are allowed and successful then
         * the tree nodes are removed from the tree view UI.
         * @param nodeContent$ one or more tree nodes to delete
         * throws an exception if the nodeAdapter doesn't implement deleteNode or allowDelete.
         */
        deleteNodes: function( nodeContent$ ) {
            var i, total, count,
                self = this,
                toDelete = [],
                deletedEl = [],
                deleted = [],
                nodeAdapter = this.nodeAdapter;

            function doDelete( index ) {
                var info = toDelete[index];

                function callback( success ) {
                    count += 1;
                    if ( success ) {
                        deletedEl.push( info.element );
                        deleted.push( {
                            node: info.node,
                            parent$: info.parent$,
                            index: info.index
                        } );
                        // need to delete mapping from adapter view state
                        if ( nodeAdapter.clearViewId ) {
                            nodeAdapter.clearViewId( self.baseId, info.node );
                        }
                    }

                    if ( count >= total ) {
                        // have received all callbacks
                        self.deleteTreeNodes( $( deletedEl ) );

                        self._trigger( "deleted", {}, {
                            items: deleted
                        } );
                    }
                }

                nodeAdapter.deleteNode( info.node, callback, index < total - 1 );
            }

            if ( !nodeAdapter.deleteNode || !nodeAdapter.allowDelete ) {
                throw "Unsupported by model";
            }

            nodeContent$.each( function() {
                var nc$ = $( this ),
                    node = self.treeMap[getIdFromNode( nc$.parent() )];

                if ( nodeAdapter.allowDelete( node ) ) {
                    toDelete.push({
                        node: node,
                        element: nc$[0],
                        parent$: nc$.parent().parent().parent().children( SEL_CONTENT ),
                        index: domIndex( nc$.parent() )
                    });
                }
            } );
            total = toDelete.length;
            count = 0;
            for ( i = 0; i < total; i++ ) {
                doDelete(i);
            }
        },

        /**
         * deleteTreeNodes
         * Deletes tree nodes that have already been deleted from the model
         * @param nodeContent$  one or more tree nodes to delete
         */
        deleteTreeNodes: function( nodeContent$ ) {
            var prevNode$,
                self = this,
                parentNodeContent$ = nodeContent$.closest( "ul" ).prev(),
                node$ = nodeContent$.parent(),
                thisLastFocused = nodeContent$.children( this.labelSelector ).filter( this.lastFocused ).length > 0,
                thisSelected = nodeContent$.hasClass( C_SELECTED );

            if ( thisSelected || thisLastFocused ) {
                // select previous closest node
                prevNode$ = prevNode( node$.eq(0) );
                if ( prevNode$.length === 0 ) {
                    prevNode$ = this._getRoots().first();
                }
                if ( prevNode$.length > 0 ) {
                    if ( thisSelected ) {
                        this._select( prevNode$.children( SEL_CONTENT ), {}, thisLastFocused );
                    } else {
                        // must have been focused
                        this._setFocusable( prevNode$.children( SEL_CONTENT ).find( this.labelSelector ) );
                    }
                } else if ( thisLastFocused ) {
                    this.lastFocused = null;
                }
            }

            node$.remove().each( function() {
                delete self.treeMap[getIdFromNode( node$ )];
            } );
            this._makeLeafIfNeeded( parentNodeContent$ );
        },

        /**
         * addNode
         * Adds the given node to the model and the tree view under the given parent tree node and at the given index.
         * If node is null then the model should create whatever its default new node is and add that.
         * The model must allow the node to be added.
         *
         * @param toParentNodeContent$ parent tree node to add a child to. If null or an empty jQuery object then
         * the node is added to the root (this can only happen when the root node is not shown in the tree view)
         * @param index
         * @param node (optional)
         * throws an exception if the nodeAdapter doesn't implement addNode, or allowAdd.
         */
        addNode: function( toParentNodeContent$, index, node ) {
            var focus, parentNode,
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.addNode || !nodeAdapter.allowAdd ) {
                throw "Unsupported by model";
            }

            if ( toParentNodeContent$ && toParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( toParentNodeContent$.parent() )];
            } else {
                if ( this.options.showRoot ) {
                    throw "Parent node required";
                }
                parentNode = nodeAdapter.root();
            }

            if ( nodeAdapter.allowAdd( parentNode, "add", node ? [ node ] : undefined ) ) {
                focus = this.element.find( "." + C_FOCUSED ).length > 0; // if have focus then focus selection after add
                this._add( {}, toParentNodeContent$, index, node, focus );
            }
        },

        /**
         * moveNodes
         * Moves the given tree nodes to be children of the given parent tree node starting at the given index.
         * The model must allow each of the nodes to be added to the new parent and must allow all the nodes to be deleted.
         *
         * @param toParentNodeContent$ parent tree node to move node to. If null or an empty jQuery object then
         * the node is moved to the root (this can only happen when the root node is not shown in the tree view)
         * @param index
         * @param nodeContent$
         * throws an exception if the nodeAdapter doesn't implement moveNodes, or allowDelete or allowAdd.
         */
        moveNodes: function( toParentNodeContent$, index, nodeContent$ ) {
            var i, focus, parentNode,
                nodes = this.getNodes( nodeContent$ ),
                allAllowDelete = true,
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.moveNodes || !nodeAdapter.allowDelete || !nodeAdapter.allowAdd ) {
                throw "Unsupported by model";
            }

            if ( toParentNodeContent$ && toParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( toParentNodeContent$.parent() )];
            } else {
                if ( this.options.showRoot ) {
                    throw "Parent node required";
                }
                parentNode = nodeAdapter.root();
            }

            for ( i = 0; i < nodes.length; i++ ) {
                if ( !nodeAdapter.allowDelete( nodes[i] ) ) {
                    allAllowDelete = false;
                    break;
                }
            }

            if ( allAllowDelete && nodeAdapter.allowAdd( parentNode, "move", nodes ) ) {
                focus = this.element.find( "." + C_FOCUSED ).length > 0; // if have focus then focus selection after move
                this._moveOrCopy( {}, toParentNodeContent$, index, nodeContent$, false, focus );
            }
        },

        /**
         * copyNodes
         * Copies the given tree nodes to be children of the given parent tree node starting at the given index.
         * The model must allow each of the nodes to be added to the new parent.
         *
         * @param toParentNodeContent$ parent tree node to move node to. If null or an empty jQuery object then
         * the node is moved to the root (this can only happen when the root node is not shown in the tree view)
         * @param index
         * @param nodeContent$
         * throws an exception if the nodeAdapter doesn't implement copyNodes, or allowAdd.
         */
        copyNodes: function( toParentNodeContent$, index, nodeContent$ ) {
            var focus, parentNode,
                nodes = this.getNodes( nodeContent$ ),
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.copyNodes || !nodeAdapter.allowAdd ) {
                throw "Unsupported by model";
            }

            if ( toParentNodeContent$ && toParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( toParentNodeContent$.parent() )];
            } else {
                if ( this.options.showRoot ) {
                    throw "Parent node required";
                }
                parentNode = nodeAdapter.root();
            }

            if ( nodeAdapter.allowAdd( parentNode, "copy", nodes ) ) {
                focus = this.element.find( "." + C_FOCUSED ).length > 0; // if have focus then focus selection after copy
                this._moveOrCopy( {}, toParentNodeContent$, index, nodeContent$, true, focus );
            }
        },

        /**
         * update
         * Call this method if the model node changes in a way that would affect its display in the tree.
         * For example if the label or icon changes. If a node's children have changed then call refresh instead.
         * If a nodes position has changed then call refresh on the nodes parent node.
         *
         * @param nodeContent$ the tree node for which the underlying model node has changed
         */
        update: function( nodeContent$ ) {
            var wasFocused, nc, row$, label$, renderState, disabled,
                node = this.treeMap[getIdFromNode( nodeContent$.parent() )],
                nodeAdapter = this.nodeAdapter,
                out = util.htmlBuilder();

            label$ = nodeContent$.find( this.labelSelector );
            wasFocused = label$[0] === this.lastFocused;
            // update node classes
            if ( nodeAdapter.getClasses || nodeAdapter.isDisabled ) {
                row$ = nodeContent$.prevAll( SEL_ROW );
                removeClassesExcept( nodeContent$[0], [C_CONTENT, C_DISABLED, C_FOCUSED, C_SELECTED, C_HOVER ]);
                removeClassesExcept( row$[0], [C_ROW, C_DISABLED, C_FOCUSED, C_SELECTED, C_HOVER ]);
                if ( nodeAdapter.getClasses ) {
                    nc = nodeAdapter.getClasses( node );
                    if ( nc ) {
                        nodeContent$.addClass( nc );
                        row$.addClass( nc );
                    }
                }
                if ( nodeAdapter.isDisabled && nodeAdapter.isDisabled( node ) ) {
                    nodeContent$.addClass( C_DISABLED );
                    row$.addClass( C_DISABLED );
                    disabled = true;
                }
            }

            renderState = {
                level: parseInt( label$.attr( A_LEVEL ), 10 ),
                selected: label$.attr( A_SELECTED ) === "true",
                disabled: disabled,
                hasChildren: label$.attr( A_EXPANDED ) !== undefined,
                expanded: label$.attr( A_EXPANDED ) === "true"
            };

            renderTreeNodeContent( out, node, nodeAdapter, this.renderNodeOptions, renderState );
            nodeContent$.html( out.toString() );
            if ( wasFocused ) {
                this._setFocusable( nodeContent$.find( this.labelSelector ) ); // need to find again - don't use label$
            }
        },

        //
        // Internal methods
        //

        /*
         * Turns simple nested lists into tree object structure used by treeView widget.
         */
        _parseTreeMarkup: function ( $el, types ) {
            var a, c, treeData,
                allHaveId = true, // assume true
                self = this;

            function parseNodeChildrenMarkup( el$ ) {
                var children = [];

                el$.children( "ul" ).children( "li" ).each(function() {
                    var node, icon, id, classes, type,
                        node$ = $( this ),
                        a$ = node$.children( "a" ).first(),
                        span$ = node$.children( "span" ).first();

                    node = { };
                    if ( a$.length > 0 ) {
                        node.label = a$.text();
                        node.link = a$.attr("href");
                    } else if ( span$.length > 0 ) {
                        node.label = span$.text();
                    }
                    id = node$.attr( "data-id" );
                    if ( id ) {
                        node.id = id;
                    } else {
                        allHaveId = false;
                    }
                    if ( node$.attr("data-current") === "true" ) {
                        node.current = true; // only used to find this node for selection after rendering
                        self.hasCurrent = true;
                    }
                    classes = node$.attr( "class" );
                    if ( classes ) {
                        node.classes = classes;
                    }
                    if ( node$.attr( "data-disabled" ) === "true" ) {
                        node.isDisabled = true;
                    }
                    icon = node$.attr( "data-icon" );
                    if ( icon ) {
                        node.icon = icon;
                    }
                    type = node$.attr( "data-type" );
                    if ( type ) {
                        node.type = type;
                    }
                    if ( node$.children( "ul" ).length > 0 ) {
                        node.children = parseNodeChildrenMarkup( node$ );
                    }
                    children.push( node );
                });
                return children;
            }

            c = parseNodeChildrenMarkup( $el );
            if ( c.length >= 1 ) {
                if ( c.length === 1 && this.options.showRoot ) {
                    treeData = c[0];
                } else {
                    treeData = { children: c };
                }
            } else {
                treeData = null;
            }
            if (!types) {
                types = {
                    "default": {
                        operations: {
                            canAdd: false,
                            canDelete: false,
                            canRename: false,
                            canDrag: false
                        }
                    }
                };
            }
            a = $.apex.treeView.makeDefaultNodeAdapter( treeData, types, allHaveId );
            return function() {
                return a;
            };
        },

        _renderNode: function( node, level, out ) {
            var hasChildren, nextId, nodeClass, contentClass, noCollapse, expanded, rowClass, nc,
                disabled = false,
                o = this.options,
                nodeAdapter = this.nodeAdapter;

            nextId = this.nextNodeId;
            this.treeMap[nextId] = node;
            if ( nodeAdapter.setViewId ) {
                nodeAdapter.setViewId( this.baseId, node, nextId);
            }
            this.nextNodeId += 1;

            nodeClass = C_NODE + " ";
            hasChildren = nodeAdapter.hasChildren( node );
            if ( hasChildren === null ) {
                hasChildren = true; // null means not sure but we have to assume there could be children
            }
            if ( hasChildren ) {
                expanded = false;
                if ( nodeAdapter.isExpanded ) {
                    expanded = nodeAdapter.isExpanded( this.baseId, node );
                }
                nodeClass += expanded ? C_COLLAPSIBLE : C_EXPANDABLE;

            } else {
                nodeClass += C_LEAF;
            }
            noCollapse = nextId === 0 && o.showRoot && !o.collapsibleRoot;
            if ( noCollapse ) {
                nodeClass += " " + C_NO_COLLAPSE;
            }
            if ( level === 1 ) {
                nodeClass += " " + C_TOP_NODE;
            }

            contentClass = C_CONTENT;
            if ( nodeAdapter.isDisabled && nodeAdapter.isDisabled( node ) ) {
                contentClass += " " + C_DISABLED;
                disabled = true;
            }

            rowClass = C_ROW;

            out.markup( "<li" ).attr( "id", this.baseId + nextId )
                .attr( "class", nodeClass )
                .markup( ">" );

            if ( nodeAdapter.getClasses ) {
                nc = nodeAdapter.getClasses( node );
                if ( nc ) {
                    contentClass += " " + nc;
                    rowClass += " " + nc;
                }
            }

            out.markup( "<div" ).attr( "class", rowClass ).markup( "></div>" );

            // for nodes with children show the disclose (expand/collapse) control
            if ( hasChildren &&
                !noCollapse ) { // suppress the toggle on the root if it is not collapsible
                out.markup( "<span class='" + C_TOGGLE + "'></span>" );
            }

            out.markup( "<div" ).attr( "class", contentClass ).markup( ">" );
            renderTreeNodeContent( out, node, nodeAdapter, this.renderNodeOptions, {
                level: level,
                selected: false,
                disabled: disabled,
                hasChildren: hasChildren,
                expanded: expanded
            } );
            out.markup( "</div>" );

            // do lazy rendering - don't add children until expanded
            if ( expanded ) {
                out.markup( M_BEGIN_CHILDREN );
                this._renderChildren( node, level + 1, out );
                out.markup( M_END_CHILDREN );
            }
            out.markup( "</li>" );
        },

        /*
         * callback function fn and node$ are only used when expanding a node with async loaded children
         */
        _renderChildren: function( node, level, out, fn, node$ ) {
            var len,
                self = this,
                nodeAdapter = this.nodeAdapter;

            function doit() {
                var i;
                for ( i = 0; i < len; i++ ) {
                    self._renderNode( nodeAdapter.child( node, i ), level, out );
                }
                if ( fn ) {
                    fn( true );
                }
            }

            len = nodeAdapter.childCount( node );
            if ( len === null ) {
                if ( fn ) {
                    //give feedback
                    util.delayLinger.start( node$[0].id, function() {
                        node$.addClass( C_PROCESSING );
                    } );
                    nodeAdapter.fetchChildNodes( node, function ( status ) {
                        // remove feedback
                        util.delayLinger.finish( node$[0].id, function() {
                            node$.removeClass( C_PROCESSING );
                            if ( status === 0 ) {
                                fn( status );
                            }
                        } );
                        if ( status ) {
                            len = nodeAdapter.childCount( node );
                            // double check that there really are children
                            if ( len > 0 ) {
                                doit();
                                return;
                            } // else
                            status = 0;
                        }
                        // else status is false or 0
                        // if status is 0 it will be a leaf, if false it will be expandable so user can try again
                        // if 0 wait until after processing is done being shown because the toggle is removed
                        if ( status === false ) {
                            fn( status );
                        }
                    } );
                }
            } else if ( len > 0 ) {
                doit();
            } else {
                if ( fn ) {
                    fn(0); // no children were rendered
                }
            }
        },

        _getRoots: function() {
            return this.element.children( "ul" ).children( "li" );
        },

        _find: function( parentNodeContent$, match, depth, findAll ) {
            var node, childrenNodes$, node$,
                self = this,
                result = [];

            if ( !parentNodeContent$ ) {
                childrenNodes$ = this._getRoots();
            } else {
                node$ = parentNodeContent$.parent();
                this._addChildrenIfNeeded( node$ );
                childrenNodes$ = node$.children( "ul" ).children( "li" );
            }
            childrenNodes$.each( function() {
                node = self.treeMap[getIdFromNode( $( this ) )];
                if ( match( node ) ) {
                    result.push( $( this ).children( SEL_CONTENT )[0] );
                    if ( !findAll ) {
                        return false;
                    }
                }
            } );
            if ( (findAll || result.length === 0) && ( depth > 1 || depth === -1 ) ) {
                childrenNodes$.each( function() {
                    result = result.concat( self._find( $( this ).children( SEL_CONTENT ), match, depth === -1 ? depth : depth - 1, findAll ) ) ;
                    if ( result.length > 0 && !findAll ) {
                        return false;
                    }
                } );
            }
            return result;
        },

        _makeParentIfNeeded: function ( nodeContent$ ) {
            if ( nodeContent$ && nodeContent$.prev( SEL_TOGGLE ).length === 0 ) {
                nodeContent$.parent().removeClass( C_LEAF ).addClass( C_EXPANDABLE );
                nodeContent$.before( "<span class='" + C_TOGGLE + "'></span>" );
                nodeContent$.after( M_BEGIN_CHILDREN + M_END_CHILDREN );
                nodeContent$.parent().children( "ul" ).hide();
            }
        },

        _makeLeafIfNeeded: function ( nodeContent$ ) {
            var self = this,
                nodeAdapter = this.nodeAdapter;

            nodeContent$.each( function() {
                var node, node$,
                    nc$ = $( this );

                if ( nc$.next( "ul" ).find( "li" ).length === 0 ) {
                    node$ = nc$.parent();
                    // if was expanded let view state know that it isn't any more
                    if ( node$.hasClass( C_COLLAPSIBLE ) && nodeAdapter.setExpanded ) {
                        node = self.treeMap[getIdFromNode( node$ )];
                        nodeAdapter.setExpanded( self.baseId, node, false );
                    }
                    nc$.parent().removeClass( C_EXPANDABLE + " " + C_COLLAPSIBLE ).addClass( C_LEAF );
                    nc$.find( self.labelSelector ).removeAttr( A_EXPANDED );
                    nc$.prev( SEL_TOGGLE ).remove();
                    nc$.next( "ul" ).remove();
                }
            } );
        },

        // Add children nodes to the tree without expanding
        // Will not work with async loaded nodes
        _addChildrenIfNeeded: function( node$ ) {
            var ul$, out,
                node = this.treeMap[getIdFromNode( node$ )];

            ul$ = node$.children( "ul" );
            if ( !( ul$.length > 0 || node$.hasClass( C_LEAF ) ) ) {
                out = util.htmlBuilder();
                out.markup( M_BEGIN_CHILDREN );
                this._renderChildren( node, getLevelFromNode( node$, this.labelSelector ) + 1, out );
                out.markup( M_END_CHILDREN );
                node$.append( out.toString() ).children( "ul" ).hide();
            }
            // otherwise it is a leaf or already added so nothing to do
        },

        _toggleNode: function( node$ ) {
            if ( node$.hasClass( C_EXPANDABLE ) ) {
                this._expandNode( node$ );
            } else {
                this._collapseNode( node$ );
            }
        },

        _persistExpansionState: function( node, node$, state ) {
            var nodeAdapter = this.nodeAdapter;

            if ( nodeAdapter.setExpanded ) {
                nodeAdapter.setExpanded( this.baseId, node, state );
            }
            this._trigger( EVENT_EXPANSION_STATE_CHANGE, {}, {
                node: node,
                nodeContent$: node$.children( SEL_CONTENT ),
                expanded: state
            } );
        },

        _expandNode: function( node$, fn ) {
            var ul$, out,
                self = this,
                nodeAdapter = this.nodeAdapter,
                node = this.treeMap[getIdFromNode( node$ )];

            if ( this.options.autoCollapse ) {
                node$.parent().children( "." + C_COLLAPSIBLE ).each( function() {
                    self._collapseNode( $(this) );
                } );
            }
            node$.removeClass( C_EXPANDABLE );
            ul$ = node$.children( "ul" );
            if ( ul$.length > 0 && nodeAdapter.childCount( node ) !== null ) {
                ul$.show(); // already rendered so show it
                node$.addClass( C_COLLAPSIBLE ).children( SEL_CONTENT ).find( this.labelSelector ).attr( A_EXPANDED, "true" );
                this._persistExpansionState( node, node$, true );
                if ( fn ) {
                    fn();
                }
            } else {
                ul$.remove(); // remove if any
                out = util.htmlBuilder();
                out.markup( M_BEGIN_CHILDREN );
                this._renderChildren( node, getLevelFromNode( node$, this.labelSelector ) + 1, out, function ( status ) {
                    if ( status ) {
                        node$.addClass( C_COLLAPSIBLE ).children( SEL_CONTENT ).find( self.labelSelector ).attr( A_EXPANDED, "true" );
                        out.markup( M_END_CHILDREN );
                        node$.append( out.toString() );
                        self._persistExpansionState( node, node$, true );
                    } else if ( status === 0 ) {
                        node$.children( SEL_TOGGLE ).remove();
                        node$.addClass( C_LEAF ).children( SEL_CONTENT ).find( self.labelSelector ).removeAttr( A_EXPANDED );
                    } else {
                        // lazy/async request failed but allow to try again
                        node$.addClass( C_EXPANDABLE ).children( SEL_CONTENT ).find( self.labelSelector ).attr( A_EXPANDED, "false" );
                        self._persistExpansionState( node, node$, false );
                    }
                    if ( fn ) {
                        fn();
                    }
                }, node$ );
            }
        },

        _collapseNode: function( node$ ) {
            var o = this.options;

            if ( o.showRoot && !o.collapsibleRoot && node$.parent().parent().hasClass( C_TREEVIEW ) ) {
                return; // can't collapse root
            }
            node$.removeClass( C_COLLAPSIBLE ).addClass( C_EXPANDABLE ).children( SEL_CONTENT ).find( this.labelSelector ).attr( A_EXPANDED, "false" );
            if ( node$.find( SEL_SELECTED ).length > 0 ) {
                this._select( node$.children( SEL_CONTENT ), {}, true );
            }
            node$.children( "ul" ).hide();
            this._persistExpansionState( this.treeMap[getIdFromNode( node$ )], node$, false );
        },

        _traverseDown: function( event, count ) {
            var node$, next$, i;

            if ( !this.lastFocused ) {
                return;
            }
            node$ = $( this.lastFocused ).closest( SEL_NODE );
            for ( i = 0; i < count; i++ ) {
                next$ = nextNode( node$ );
                if ( next$.length === 0 ) {
                    break;
                }
                node$ = next$;
            }
            if ( node$.length > 0 ) {
                this._select( node$.children( SEL_CONTENT ), event, true, true );
            }
        },

        _traverseUp: function( event, count ) {
            var node$, prev$, i;

            if ( !this.lastFocused ) {
                return;
            }
            node$ = $( this.lastFocused ).closest( SEL_NODE );
            for ( i = 0; i < count; i++ ) {
                prev$ = prevNode( node$ );
                if ( prev$.length === 0 ) {
                    break;
                }
                node$ = prev$;
            }
            if ( node$.length > 0 ) {
                this._select( node$.children( SEL_CONTENT ), event, true, true );
            }
        },

        _activate: function ( event ) {
            var href,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                nodes = this.getSelectedNodes();

            if ( nodes.length === 0 ) {
                return; // nothing to activate (for example node is disabled)
            }
            this._trigger( "activateNode", event, { nodes: nodes } );

            if ( o.navigation && nodeAdapter.getLink && !event.isDefaultPrevented() ) {
                href = nodeAdapter.getLink( nodes[0] );
                if ( href ) {
                    apex.navigation.redirect( href );
                }
            }
        },

        _select: function( nodeContent$, event, focus, delayTrigger, noNotify ) {
            var node$, focusLabel$, range$, prevSelected, sp, spOffset, treeOffset, offset,
                originalNodeContent$ = nodeContent$,
                action = "set",
                self = this,
                prevSel$ = this.element.find( SEL_CONTENT + SEL_SELECTED );

            // determine type of selection
            if ( event && this.options.multiple ) {
                if ( event.type === "click" ) {
                    // control+click for Windows and command+click for Mac
                    if ( event.ctrlKey || event.metaKey ) {
                        action = "toggle";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                } else if ( event.type === "keydown" ) {
                    // Mac has no concept of toggle with the keyboard
                    if ( event.keyCode === $.ui.keyCode.SPACE ) {
                        if ( event.ctrlKey ) {
                            action = "toggle";
                        } else if ( event.shiftKey ) {
                            action = "range";
                        } else {
                            action = "add";
                        }
                    } else if ( event.ctrlKey ) {
                        action = "none";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                }
            }

            if ( action === "range" && !this.selectAnchor ) {
                action = "set"; // when there is no anchor turn range selection into set
            }

            // clear out previous selection if needed
            if ( action === "set" || action === "range" ) {
                prevSel$.prevAll( SEL_ROW ).addBack().removeClass( C_SELECTED );
                prevSel$.find( this.labelSelector ).attr( A_SELECTED, "false" );
            }

            // disabled nodes can't be selected but they can be focused
            focusLabel$ = nodeContent$.eq(0).find( this.labelSelector );
            nodeContent$ = nodeContent$.not( SEL_DISABLED );

            // perform selection action
            prevSelected = nodeContent$.hasClass( C_SELECTED );
            if ( action === "set" || action === "add" || (action === "toggle" && !prevSelected) ) {
                nodeContent$.prevAll( SEL_ROW ).addBack().addClass( C_SELECTED );
                nodeContent$.find( this.labelSelector ).attr( A_SELECTED, "true" );
                // make sure parents expanded - This assumes that a treeView cannot be nested inside another treeView
                nodeContent$.parent().parents( SEL_NODE ).each( function() {
                    node$ = $(this);
                    if ( node$.hasClass( C_EXPANDABLE ) ) {
                        self._expandNode( node$ );
                    }
                } );
                this.selectAnchor = nodeContent$[0];
            } else if ( action === "range" ) {
                range$ = $( "#" + this.selectAnchor.parentNode.id + ", #" + originalNodeContent$[0].parentNode.id ); // range will be in DOM order
                node$ = range$.first();
                while ( true ) {
                    if ( !node$.children( SEL_CONTENT ).hasClass( C_DISABLED ) ) {
                        node$.children( SEL_CONTENT ).prevAll( SEL_ROW ).addBack().addClass( C_SELECTED );
                        node$.children( SEL_CONTENT ).find( this.labelSelector ).attr( A_SELECTED, "true" );
                    }
                    node$ = nextNode( node$ );
                    if ( node$.length === 0 || range$.length === 1 || node$[0] === range$[1] ) {
                        break;
                    }
                }
                if ( node$.length > 0 && range$.length === 2 && !node$.children( SEL_CONTENT ).hasClass( C_DISABLED ) ) {
                    node$.children( SEL_CONTENT).prevAll( SEL_ROW ).addBack().addClass( C_SELECTED );
                    node$.children( SEL_CONTENT ).find( this.labelSelector ).attr( A_SELECTED, "true" );
                }
            } else if ( action === "toggle" && prevSelected ) {
                nodeContent$.prevAll( SEL_ROW ).addBack().removeClass( C_SELECTED );
                nodeContent$.find( this.labelSelector ).attr( A_SELECTED, "false" );
                this.selectAnchor = nodeContent$[0];
            }

            // focus if needed
            if ( focusLabel$.length > 0 ) {
                if ( focus ) {
                    setFocus( focusLabel$[0] );
                } else {
                    this._setFocusable( focusLabel$ );
                }
                if ( this.scrollParent ) {
                    sp = this.scrollParent[0];
                    // scroll into view if needed
                    // Don't use scrollIntoView because it applies to all potentially scrollable ancestors, we only
                    // want to scroll within the immediate scroll parent.
                    // Chrome scrolls parents other than the immediate scroll parent even though it seems that it shouldn't
                    offset = focusLabel$.parent().offset();
                    treeOffset = this.element.offset();
                    if ( sp === document ) {
                        spOffset = { top: $( document ).scrollTop(), left: $( document ).scrollLeft() };
                        if ( ( offset.top < spOffset.top ) || ( offset.top > spOffset.top + $( window ).height() ) ) {
                            $( document ).scrollTop( offset.top - treeOffset.top );
                        }
                        if ( ( offset.left + focusLabel$.parent()[0].offsetWidth < spOffset.left ) || ( offset.left > spOffset.left + $( window ).width() ) )  {
                            $( document ).scrollLeft( offset.left - treeOffset.left );
                        }
                    } else {
                        spOffset = this.scrollParent.offset();
                        treeOffset = this.element.offset();
                        if ( ( offset.top < spOffset.top ) || ( offset.top > spOffset.top + sp.offsetHeight ) ) {
                            sp.scrollTop = offset.top - treeOffset.top;
                        }
                        if ( ( offset.left + focusLabel$.parent()[0].offsetWidth < spOffset.left ) || ( offset.left > spOffset.left + sp.offsetWidth ) )  {
                            sp.scrollLeft = offset.left - treeOffset.left;
                        }
                    }
                }
            }

            if ( noNotify ) {
                return;
            }
            // notify if needed
            if ( action === "toggle" ||
                (action === "range" && !prevSelected) ||
                (action === "add" && !prevSelected) ||
                (action === "set" && (prevSel$[0] !== nodeContent$[0] || prevSel$.length !== nodeContent$.length)) ) {
                // use a timer to make sure the focus happens first and also throttle
                // rapid changes from keyboard navigation.
                if ( self.triggerTimerId ) {
                    clearTimeout( self.triggerTimerId );
                    self.triggerTimerId = null;
                }
                self.triggerTimerId = setTimeout( function () {
                    self.triggerTimerId = null;
                    self._trigger( EVENT_SELECTION_CHANGE, event );
                }, delayTrigger ? 350 : 1 );
            }
        },

        _setFocusable: function( label$ ) {
            var label = label$[0];

            if ( label ) {
                if ( this.lastFocused && this.lastFocused !== label ) {
                    this.lastFocused.tabIndex = -1;
                }
                label.tabIndex = 0;
                this.lastFocused = label;
            }
        },

        _beginEdit: function( eventArg ) {
            if ( apex.tooltipManager ) {
                apex.tooltipManager.disableTooltips();
            }
            this._trigger( "beginEdit", {}, eventArg );
        },

        _endEdit: function( eventArg ) {
            if ( apex.tooltipManager ) {
                apex.tooltipManager.enableTooltips();
            }
            this._trigger( "endEdit", {}, eventArg );
        },

        //
        // Drag and Drop methods
        //

        _mouseCapture: function ( event, fromOutside ) { // fromOutside is true when called from draggable plugin
            var i, items$, nodes,
                allDraggable = true,
                o = this.options;

            event.preventDefault(); // do this even if not dragging to prevent the focus being set on mouse down

            if ( this.animating || o.disabled || !o.dragAndDrop || $( event.target ).hasClass( C_TOGGLE ) ) {
                return false;
            }

            items$ = $( event.target ).closest( SEL_NODE ).children( SEL_CONTENT );
            if ( items$.length === 0 ) {
                return false;
            }

            // todo check if drag starts on a valid handle - this is only useful if there is custom rendering

            if ( o.dragMultiple ) {
                if ( items$.hasClass( C_SELECTED ) ) {
                    items$ = this.getSelection();
                } else {
                    // items$ is good as is unless the ctrl key is pressed
                    if ( event.ctrlKey ) {
                        items$ = items$.add( this.getSelection() );
                    }
                }
            }

            if ( fromOutside !== true ) {
                // all the nodes must be draggable
                nodes = this.getNodes( items$ );
                for ( i = 0; i < nodes.length; i++ ) {
                    if ( !( this.nodeAdapter.allowDrag && this.nodeAdapter.allowDrag( nodes[i] )) ) {
                        allDraggable = false;
                        break;
                    }
                }
                if ( !allDraggable ) {
                    return false;
                } // else
            }

            this.dragItems = items$;
            return true;
        },

        _mouseStart: function ( downEvent, event, noActivation ) { // noActivation given from draggable
            var body, itemHeight,
                dragNodes = null,
                o = this.options,
                self = this;

            if ( !noActivation ) {
                // install handler for ESCAPE key to cancel drag
                $( "body" ).on( "keydown.treeview", function ( event ) {
                    if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
                        self._cancel( event );
                        return;
                    }
                    self._dragCopyOrMove( event, true );
                } );
                $( "body" ).on( "keyup.treeview", function ( event ) {
                    self._dragCopyOrMove( event, true );
                } );

                // select exactly what is being dragged
                // use empty event to force set so that only the dragged item(s) will be selected
                this._select( this.dragItems, {}, true, false );
            }

            // Create and append the visible helper
            // if a draggable is connected to this control then it will create the helper
            if ( !this.helper ) {
                this.helper = this._createHelper( event );
            }

            // Cache the margins of the original element
            this.margins = {
                left: (parseInt( this.dragItems.css( "marginLeft" ), 10 ) || 0),
                top: (parseInt( this.dragItems.css( "marginTop" ), 10 ) || 0)
            };

            // The element's absolute position on the page minus margins
            this.offset = this.dragItems.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };

            $.extend( this.offset, {
                click: { //Where the click happened, relative to the element
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset()
            } );

            // Only after we got the offset, we can change the helper's position to absolute
            this.helper.css( "position", "absolute" );

            // Cache the helper size
            this._cacheHelperProportions();

            // If ddmanager is used for droppables, set the global draggable
            if ( $.ui.ddmanager && !noActivation ) {
                this.currentItem = this.dragItems.first();
                $.ui.ddmanager.current = this;
                $.ui.ddmanager.prepareOffsets( this, downEvent );
            }

            // Keep the original position for events
            this.originalPosition = this._generatePosition( event );

            // Adjust the mouse offset relative to the helper if "dragCursorAt" is supplied
            if ( o.dragCursorAt ) {
                this._adjustOffsetFromHelper( o.dragCursorAt );
            }

            // what is being dragged could affect what operations are allowed
            if ( this.dragItems && this.dragItems.length > 0 && !this.isOver ) {
                dragNodes = this.getNodes( this.dragItems );
                if ( !dragNodes[0] ) {
                    dragNodes = null;
                }
            }

            if ( this.nodeAdapter.dragOperations ) {
                this.dragOperations = this.nodeAdapter.dragOperations( dragNodes );
            } else {
                this.dragOperations = dragNodes ? { normal: "move", ctrl: "copy" } : { normal: "add" };
            }
            this.dragOperation = this.dragOperations.normal; // start off with normal drag operation

            this.dragging = true;
            // remove hover effect
            if ( this.lastHover ) {
                $( this.lastHover ).children( SEL_ROW_CONTENT  ).removeClass( C_HOVER );
                this.lastHover = null;
            }

            if ( o.dragReorder ) {
                itemHeight = this.dragItems.first().outerHeight();
                if ( this.dragOperation === "move" ) {
                    this.dragItems.parent().hide();
                    // todo if any of the drag items are only children then need to make leaf of the parent except that the UL can't actually go away
                }
                this._createPlaceholder( itemHeight );
                this.initialPlaceholderPos = null;
            }

            this._initPositions(); // figure out all the places the drag items could be dropped
            this._refreshPositions();

            // Set a containment if given in the options
            if ( o.dragContainment ) {
                this._setContainment();
            }

            // if draggable it is responsible for the cursor
            if ( !noActivation ) {
                if ( o.dragCursor && o.dragCursor !== "auto" ) { // cursor option
                    body = this.document.find( "body" );

                    // support: IE
                    this.storedCursor = body.css( "cursor" );
                    body.css( "cursor", o.dragCursor );

                    this.storedStylesheet = $( "<style>*{ cursor: " + o.dragCursor + " !important; }</style>" ).appendTo( body );
                }
            }

            if ( o.dragOpacity ) { // dragOpacity option
                this.helper.css( "opacity", o.dragOpacity );
            }

            if ( o.dragZIndex ) { // dragZIndex option
                this.helper.css( "zIndex", o.dragZIndex );
            }
            this.helper.addClass( C_HELPER );

            // Prepare scrolling
            if ( this.scrollParent && this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML" ) {
                this.overflowOffset = this.scrollParent.offset();
                this.originalScroll = { top: this.scrollParent[0].scrollTop, left: this.scrollParent[0].scrollLeft };
            }

            // Call callbacks
            if ( apex.tooltipManager ) {
                apex.tooltipManager.disableTooltips();
            }
            this._trigger( "start", event, this._uiHashDnD() );

            this._mouseDrag( event ); // Execute the drag once - this causes the helper not to be visible before getting its correct position

            // If the ddmanager is used for droppables, inform the manager that dragging has started
            if ( $.ui.ddmanager && !noActivation ) {
                $.ui.ddmanager.dragStart( this, event );
            }

            return true;
        },

        _mouseDrag: function ( event ) {
            var mousePos = { pageX: event.pageX, pageY: event.pageY };

            this.position = this._generatePosition( event );
            this.positionAbs = this._adjustPositionForScroll();

            if ( !this.lastPositionAbs ) {
                this.lastPositionAbs = this.positionAbs;
            }
            this.dragEventTarget = event.target; // for dragHitCheck

            if ( this.options.dragScroll ) {
                // start or stop scrolling as needed. The actual scrolling happens from a timer
                if ( this._scrollCheck( mousePos )) {
                    if ( !this.scrollTimerId ) {
                        this._scrollStart( mousePos );
                    }
                } else {
                    if ( this.scrollTimerId ) {
                        this._scrollStop();
                    }
                }
            }

            // move the helper
            this.helper[0].style.left = this.position.left + "px";
            this.helper[0].style.top = this.position.top + "px";
            this._dragCopyOrMove( event );

            // check if over any targets
            this._dragHitCheck();

            if ( $.ui.ddmanager && !this.isOver ) {
                $.ui.ddmanager.drag( this, event );
            }

            this._trigger( "drag", event, this._uiHashDnD() );

            this.lastPositionAbs = this.positionAbs;
            return false;
        },

        _dragHitCheck: function() {
            var i, item, x, y, targetNode$, location, dir, deltaX,
                self = this,
                deltaY = 0,
                newDropTargetId = null,
                prevDropTargetId = this.dropTargetNode ? this.dropTargetNode[0].id : null,
                o = this.options;

            function getDragVerticalDirection() {
                var delta = self.positionAbs.top - self.lastPositionAbs.top;
                return delta !== 0 && (delta > 0 ? "down" : "up");
            }

            function clearExpandTimer() {
                if ( self.delayExpandTimer ) {
                    clearTimeout( self.delayExpandTimer );
                    self.delayExpandTimer = null;
                }
            }

            if ( this.scrollParent[0] !== document ) {
                deltaY = this.scrollParent[0].scrollTop - this.dropPositionsOrigin;
            }

            x = this.positionAbs.left + this.offset.click.left;
            if (  x > this.containerCache.left && x < this.containerCache.left + this.containerCache.width ) {
                if ( this.placeholder && $( this.dragEventTarget ).closest( "." + C_PLACEHOLDER ).length ) {
                    // when there is a placeholder and the mouse is over it
                    if ( this.initialPlaceholderPos === null ) {
                        this.initialPlaceholderPos = x;
                    }
                    deltaX = ( x - this.initialPlaceholderPos ) * this.rtlFactor;
                    if ( deltaX > ( this.options.dragScrollSensitivity || 10 ) ) {
                        this.initialPlaceholderPos = x;
                        this._movePlaceholder( { element: this.placeholder.children( SEL_CONTENT ) }, "below" );
                    } else if ( deltaX < ( -this.options.dragScrollSensitivity || -10 ) ) {
                        this.initialPlaceholderPos = x;
                        this._movePlaceholder( { element: this.placeholder.children( SEL_CONTENT ) }, "above" );
                    }
                } else {
                    this.initialPlaceholderPos = null;
                    y = this.positionAbs.top + this.offset.click.top + deltaY;
                    for ( i = 0; i < this.dropPositions.length; i++ ) {
                        item = this.dropPositions[i];
                        if ( y >= item.top && y <= item.bottom ) {
                            newDropTargetId = item.nodeId;
                            if ( y > item.top + (item.bottom - item.top) / 2 ) {
                                location = "bottom";
                            } else {
                                location = "top";
                            }
                            break;
                        }
                    }
                }
            }

            if ( prevDropTargetId !== newDropTargetId || location !== this.lastLocation ) {
                clearExpandTimer();
                this.element.find( "." + C_ACTIVE).removeClass( C_ACTIVE );
                if ( newDropTargetId ) {
                    targetNode$ = $( "#" + newDropTargetId );
                    if ( o.dragExpandDelay >= 0 && targetNode$.hasClass( C_EXPANDABLE ) ) {
                        this.delayExpandTimer = setTimeout(function() {
                            self.delayExpandTimer = null;
                            self._expandNode( targetNode$, function() {
                                self._initPositions( targetNode$ );
                                self._refreshPositions(); // todo should only do the new ones
                            } );
                        }, o.dragExpandDelay );
                    }
                    if ( item.canAdd ) {
                        this.dropTargetNode = targetNode$;
                        if ( this.placeholder ) {
                            dir = getDragVerticalDirection();
                            if ( location === "top" && dir === "up" ) {
                                this._movePlaceholder( item, "before" );
                            } else if ( location === "bottom" && dir === "down" ) {
                                this._movePlaceholder( item, "after" );
                            }
                        } else  {
                            this.dropTargetNode.children( SEL_CONTENT + "," + SEL_ROW ).addClass( C_ACTIVE );
                        }
                    } else if ( item.canAddChild && this.placeholder ) {
                        this.initialPlaceholderPos = x;
                        this._movePlaceholder( item, "after" );
                        this._movePlaceholder( { element: this.placeholder.children( SEL_CONTENT ) }, "below" );
                    }
                } else {
                    this.dropTargetNode = null;
                }
            }

            this.lastLocation = location;
        },

        _mouseStop: function ( event, fromOutside ) { // fromOutside true when called from draggable plugin
            var dropped, animation,
                self = this;

            if ( this.delayExpandTimer ) {
                clearTimeout( this.delayExpandTimer );
                this.delayExpandTimer = null;
            }
            this._scrollStop();

            //If the ddmanager is used for droppables, inform the manager that dragging has stopped
            if ( $.ui.ddmanager && !fromOutside ) {
                $.ui.ddmanager.dragStop( this, event );
            }

            // remove handler for ESCAPE key to cancel drag
            if ( !fromOutside ) {
                $( "body" ).off( ".treeview" );
            }
            this._deactivate();

            if ( this.storedCursor ) {
                this.document.find( "body" ).css( "cursor", this.storedCursor );
                this.storedStylesheet.remove();
            }

            if ( $.ui.ddmanager && !fromOutside ) {
                dropped = $.ui.ddmanager.drop( this, event );
                if ( dropped ) {
                    if ( this.placeholder ) {
                        this.dragItems.parent().show();
                        this._removePlaceholder();
                    }
                    this.dragging = false;
                    this.dragItems = null;
                    this.currentItem = null;
                    this.helper.remove();
                    this.helper = null;

                    this._stop( event );
                    return;
                }
            }

            if ( !event.target ) {
                this.fromOutside = false;
                this.dragging = false;
                return; // the drag was canceled
            }

            if ( this.options.dragAnimate ) {
                animation = this._getAnimation();
                this.animating = true;
                this.helper.animate( animation, parseInt( this.options.dragAnimate, 10 ) || 500, function () {
                    self._finishDrag( event );
                } );
            } else {
                this._finishDrag( event );
            }
        },

        // todo there is an issue with scrolling where if the mouse moves outside the tree div scrolling keeps going
        _scrollCheck: function( mousePos, update ) {
            var sTop, sLeft, scrolled,
                deltaY = 0,
                deltaX = 0,
                o = this.options,
                sp = this.scrollParent[0];

            if ( sp && sp !== document && sp.tagName !== "HTML" ) {

                if ( (this.overflowOffset.top + sp.offsetHeight) - mousePos.pageY < o.dragScrollSensitivity ) {
                    deltaY = o.dragScrollSpeed;
                } else if ( mousePos.pageY - this.overflowOffset.top < o.dragScrollSensitivity ) {
                    deltaY = -o.dragScrollSpeed;
                }
                if ( update && deltaY ) {
                    sTop = sp.scrollTop + deltaY;
                    if ( sTop < 0 ) {
                        sp.scrollTop = 0;
                        deltaY = 0;
                    } else if ( sTop > sp.scrollHeight - sp.clientHeight ) {
                        sp.scrollTop = sp.scrollHeight - sp.clientHeight;
                        deltaY = 0;
                    } else {
                        sp.scrollTop = sTop;
                    }
                }

                if ( (this.overflowOffset.left + sp.offsetWidth) - mousePos.pageX < o.dragScrollSensitivity ) {
                    deltaX = o.dragScrollSpeed;
                } else if ( mousePos.pageX - this.overflowOffset.left < o.dragScrollSensitivity ) {
                    deltaX = -o.dragScrollSpeed;
                }
                if ( update && deltaX ) {
                    sLeft = sp.scrollLeft + deltaX;
                    if ( sLeft < 0 ) {
                        sp.scrollLeft = 0;
                        deltaX = 0;
                    } else if ( sLeft > sp.scrollWidth - sp.clientWidth ) {
                        sp.scrollLeft = sp.scrollWidth - sp.clientWidth;
                        deltaX = 0;
                    } else {
                        sp.scrollLeft = sLeft;
                    }
                }
                scrolled = !!(deltaX || deltaY);
            } else {
                sTop = $( document ).scrollTop();
                sLeft = $( document ).scrollLeft();
                if ( mousePos.pageY - sTop < o.dragScrollSensitivity ) {
                    deltaY = -o.dragScrollSpeed;
                } else if ( $( window ).height() - (mousePos.pageY - sTop) < o.dragScrollSensitivity ) {
                    deltaY = o.dragScrollSpeed;
                }
                if ( update && deltaY ) {
                    sTop += deltaY;
                    if ( sTop < 0 ) {
                        $( document ).scrollTop( 0 );
                        deltaY = 0;
                    } else if ( sTop > $( document ).height() - $( window ).height() ) {
                        $( document ).scrollTop( $( document ).height() - $( window ).height() );
                        deltaY = 0;
                    } else {
                        mousePos.pageY += deltaY;
                        $( document ).scrollTop( sTop );
                    }
                }

                if ( mousePos.pageX - sLeft < o.dragScrollSensitivity ) {
                    deltaX = -o.dragScrollSpeed;
                } else if ( $( window ).width() - (mousePos.pageX - sLeft) < o.dragScrollSensitivity ) {
                    deltaX = o.dragScrollSpeed;
                }
                if ( update && deltaX ) {
                    sLeft += deltaX;
                    if ( sLeft < 0 ) {
                        $( document ).scrollLeft( 0 );
                        deltaX = 0;
                    } else if ( sLeft + this.helper.width() > $( document ).width() - $( window ).width() ) {
                        $( document ).scrollLeft( $( document ).width() - $( window ).width() - this.helper.width() );
                        deltaX = 0;
                    } else {
                        mousePos.pageX += deltaX;
                        $( document ).scrollLeft( sLeft );
                    }
                }

                scrolled = !!(deltaX || deltaY);
                if ( scrolled && update ) {
                    // because the whole document scrolled, need to move the helper
                    this.position = this._generatePosition( mousePos );
                    this.helper[0].style.left = this.position.left + "px";
                    this.helper[0].style.top = this.position.top + "px";

                    if ( $.ui.ddmanager ) {
                        $.ui.ddmanager.prepareOffsets( this, mousePos );
                    }
                }

            }
            return scrolled;
        },

        _scrollStart: function( mousePos ) {
            var self = this,
                timeIndex = 0,
                times = [ 150, 125, 100, 99, 96, 91, 84, 75, 64, 51, 36 ];

            function scroll() {
                self.scrollTimerId = setTimeout( function() {
                    if ( self._scrollCheck( mousePos, true ) ) {
                        self._dragHitCheck();
                        scroll();
                    } else {
                        self._scrollStop();
                    }
                }, times[timeIndex] );
                if ( timeIndex < times.length - 1 ) {
                    timeIndex += 1;
                }
            }

            if ( this.scrollTimerId ) {
                this._scrollStop();
            }
            scroll();
        },

        _scrollStop: function() {
            clearTimeout( this.scrollTimerId );
            this.scrollTimerId = null;
        },

        _getAnimation: function() {
            var cur, el$,
                animation = {};

            if ( this.placeholder || this.dropTargetNode) {
                if ( this.placeholder ) {
                    el$ = this.placeholder;
                    cur = el$.offset();
                } else {
                    el$ = this.dropTargetNode;
                    cur = el$.offset();
                }
                animation.left = cur.left - this.offset.parent.left - this.margins.left;
                animation.top = cur.top - this.offset.parent.top - this.margins.top;
            } else {
                el$ = this.dragItems.eq(0);
                cur = this.originalPosition;
                animation.left = cur.left - this.margins.left;
                animation.top = cur.top - this.margins.top;
                if ( this.scrollParent[0] !== document ) {
                    animation.left += this.originalScroll.left - this.scrollParent[0].scrollLeft;
                    animation.top += this.originalScroll.top - this.scrollParent[0].scrollTop;
                }
            }
            if ( this.rtlFactor === -1 ) {
                animation.left += el$.width() - this.helper.width();
            }
            return animation;
        },

        _initPositions: function ( startNode$ ) {
            var i, dropPositions, index, id, dragNodes,
                self = this,
                excludedNodes = [],
                reorder = this.options.dragReorder,
                nodeAdapter = this.nodeAdapter;

            if ( this.dragItems && this.dragItems.length > 0 ) {
                dragNodes = this.getNodes( this.dragItems );
                if ( !dragNodes[0] ) {
                    dragNodes = [ ];
                }
            } else {
                dragNodes = [ ];
            }
            if (!startNode$ || !this.dropPositions) {
                dropPositions = this.dropPositions = [];
                startNode$ = this.element;
            } else {
                dropPositions = [];
                id = startNode$[0].id;
                for ( index = 0; index < this.dropPositions.length; index ++) {
                    if ( id === this.dropPositions[index].nodeId ) {
                        break;
                    }
                }
            }
            startNode$.find( SEL_NODE ).each( function() {
                var node, parent$, canAdd,
                    canAddChild = false,
                    node$ = $( this );

                if ( !node$.is( ":visible" ) || node$.is( "." + C_PLACEHOLDER )) {
                    return;
                }
                if ( reorder ) {
                    // when reordering it is the parent that we need to check to see if it allows adding
                    parent$ = node$.parent().closest( SEL_NODE );
                    if ( parent$.length ) {
                        node = self.treeMap[getIdFromNode( parent$ )];
                    } else if ( !self.options.showRoot ) {
                        node = nodeAdapter.root();
                    } else {
                        node = null;
                    }
                } else {
                    node = self.treeMap[getIdFromNode( node$ )];
                }

                // if this is a move operation don't include any of the nodes being dragged or their descendents
                if ( !reorder && self.dragOperation === "move" &&
                    ( dragNodes.indexOf(node) >= 0 || excludedNodes.indexOf( node$.parent().closest( SEL_NODE )[0] ) >= 0 )) {
                    excludedNodes.push(this);
                    return;
                }

                // include nodes that can be added or are expandable
                canAdd = node && nodeAdapter.allowAdd( node, self.dragOperation, dragNodes);
                if ( reorder ) {
                    canAddChild = nodeAdapter.allowAdd( self.treeMap[getIdFromNode( node$ )], self.dragOperation, dragNodes);
                }
                if ( canAdd || canAddChild || node$.hasClass( C_EXPANDABLE ) ) {
                    dropPositions.push( {
                        canAdd: canAdd,
                        canAddChild: canAddChild,
                        element: $( this ).children( SEL_ROW ),
                        nodeId: this.id,
                        top: 0,
                        bottom: 0
                    } );
                }
            } );
            if ( index !== undefined && dropPositions.length ) {
                for ( i = 0; i < dropPositions.length; i++ ) {
                    this.dropPositions.splice(index + i, 0, dropPositions[i]);
                }
            }
        },

        _refreshPositions: function () {
            var i, item, p, h, vp$;

            for ( i = 0; i < this.dropPositions.length; i++ ) {
                item = this.dropPositions[i];

                h = item.element.outerHeight();
                p = item.element.offset();
                item.top = p.top;
                item.bottom = p.top + h;
            }
            this.dropPositionsOrigin = 0;
            // store the position and dimensions of this widget for integration with draggables
            vp$ = this.scrollParent;
            if ( !vp$ || vp$[0] === document ) {
                vp$ = this.element;
            } else {
                this.dropPositionsOrigin = vp$[0].scrollTop;
            }
            p = vp$.offset();
            this.containerCache.left = p.left;
            this.containerCache.top = p.top;
            this.containerCache.width = vp$.outerWidth();
            this.containerCache.height = vp$.outerHeight();
        },

        _makeTempDragItem: function () {
            var i, item$, parent$,
                out = util.htmlBuilder();

            out.markup( "<li" )
                .attr( "class", C_NODE )
                .markup( "><div" )
                .attr( "class", C_ROW )
                .markup( "></div><div" )
                .attr( "class", C_CONTENT )
                .markup(">unseen content</div></li>" );
            item$ = $( out.toString() );
            // add it to the first possible drop position
            for ( i = 0; i < this.dropPositions.length; i++ ) {
                if ( this.dropPositions[i].canAdd ) {
                    parent$ = $( this.dropPositions[i].nodeId ).parent();
                    break;
                }
            }
            if ( !parent$ ) {
                parent$ = this.element.children( "ul" );
            }

            parent$.append( item$ );
            this.dragItems = item$.children( SEL_CONTENT );
        },

        _createPlaceholder: function ( height ) {
            this.placeholder = $( "<li class='" + C_NODE + " " + C_PLACEHOLDER + "'><div class='" + C_ROW +"'></div><div class='" + C_CONTENT + "'>&nbsp;</div></li>" );
            this.dragItems.first().parent().before( this.placeholder );
            if ( height ) {
                this.placeholder.height( height );
            }
        },

        _movePlaceholder: function ( item, place ) {
            var prev$, parent$, canAdd, extraLevelDown, node,
                self = this,
                prevParentUl$ = this.placeholder.parent(),
                nodeAdapter = this.nodeAdapter,
                node$ = item.element.parent(),
                el = node$[0];

            if ( place === "after" && node$.hasClass( C_COLLAPSIBLE ) && nodeAdapter.allowAdd( self.treeMap[getIdFromNode( node$ )], self.dragOperation ) ) {
                el = node$.children( "ul" ).children()[0];
                place = "before";
            }
            if ( place === "above" ) {
                if ( node$.next( ":visible" ).length ) {
                    return; // don't go up any further
                }
                el = node$.parent().parent()[0];
                node$ = $( el );
                parent$ = node$.parent().closest( SEL_NODE );
                if ( parent$.length ) {
                    node = self.treeMap[getIdFromNode( parent$ )];
                } else if ( !self.options.showRoot ) {
                    node = nodeAdapter.root();
                } else {
                    node = null;
                }
                if ( node$.hasClass( C_TREEVIEW ) || node === null ) {
                    return; // don't go past root
                }

                canAdd = nodeAdapter.allowAdd( node, self.dragOperation );
                if ( !canAdd ) {
                    return; // don't go above to node that doesn't allow add
                }
                place = "after";
            }
            if ( place === "below" ) {
                prev$ = node$.prevAll( ":visible" ).first();
                extraLevelDown = false;
                // if expanded prev is last child todo test more
                if ( prev$.hasClass( C_COLLAPSIBLE ) ) {
                    prev$ = prev$.children( "ul" ).children().last();
                    extraLevelDown = true;
                }
                if ( prev$.length === 0 ) {
                    return; // can't go any deeper
                }
                canAdd = nodeAdapter.allowAdd( self.treeMap[getIdFromNode( prev$ )], self.dragOperation );
                if ( !extraLevelDown && prev$.hasClass( C_LEAF ) && canAdd ) {
                    this._makeParentIfNeeded( prev$.children( SEL_CONTENT ) );
                }
                if ( prev$.hasClass( C_EXPANDABLE ) ) {
                    this._expandNode( prev$, function() {
                        self._initPositions( prev$ );
                        self._refreshPositions(); // todo should only do the new ones
                        if ( canAdd ) {
                            prev$.children( "ul" )[0].appendChild( self.placeholder[0] );
                        }
                    });
                    return; // the expand callback will finish up
                }
                if ( canAdd ) {
                    prev$[0].parentNode.appendChild( this.placeholder[0] );
                }
            } else if ( place === "after" && !el.nextSibling ) {
                el.parentNode.appendChild( this.placeholder[0] );
            } else { // before or after (with next sibling)
                el.parentNode.insertBefore( this.placeholder[0], place === "before" ? el : el.nextSibling );
            }
            if ( prevParentUl$.children().length === 0 ) {
                this._makeLeafIfNeeded( prevParentUl$.parent().find( SEL_CONTENT ) );
            }
            this._refreshPositions();
        },

        _removePlaceholder: function() {
            var prevParentUl$ = this.placeholder.parent();

            this.placeholder.remove();
            this.placeholder = null;
            if ( prevParentUl$.children().length === 0 ) {
                this._makeLeafIfNeeded( prevParentUl$.parent().find( SEL_CONTENT ) );
            }
        },

        _createHelper: function( event ) {
            var helper$,
                o = this.options;

            if ( $.isFunction( o.dragHelper ) ) {
                helper$ =  $( o.dragHelper.apply( this.element[0], [event, this.dragItems] ) );
            } else {
                if ( this.dragItems.length === 1 ) {
                    helper$ = this.dragItems.clone().removeAttr( "id" ).removeClass( C_SELECTED );
                } else {
                    helper$ = $("<div></div>");
                    helper$.html(this.dragItems.clone().removeClass( C_SELECTED ));
                }
            }

            if ( !helper$.parents("body").length ) {
                helper$.appendTo( (o.dragAppendTo === "parent" ? this.element[0].parentNode : o.dragAppendTo) );
            }

            if ( !(/(fixed|absolute)/).test(helper$.css("position"))) {
                helper$.css("position", "absolute");
            }

            return helper$;
        },

        _adjustOffsetFromHelper: function( obj ) {
            if ("left" in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ("right" in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ("top" in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ("bottom" in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },

        _getParentOffset: function () {
            var po;

            // get the offsetParent and cache its position
            this.offsetParent = this.helper.offsetParent();
            po = this.offsetParent.offset();
            // This is a special case where we need to modify a offset calculated on start, since the following happened:
            // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
            // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
            //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
            if ( this.scrollParent && this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] ) ) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }

            // This needs to be actually done for all browsers, since pageX/pageY includes this information
            // with an ugly IE fix
            if ( this.offsetParent[0] === document.body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie) ) {
                po = { top: 0, left: 0 };
            }

            return {
                top: po.top + (parseInt( this.offsetParent.css( "borderTopWidth" ), 10 ) || 0),
                left: po.left + (parseInt( this.offsetParent.css( "borderLeftWidth" ), 10 ) || 0)
            };
        },

        _generatePosition: function ( event ) {
            var pageX = event.pageX,
                pageY = event.pageY,
                scroll = !(this.scrollParent && this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] )) ?
                    this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test( scroll[0].tagName );

            /*
             * Constrain the position to containment.
             */
            if ( !this.dragging ) { //If we are not dragging yet, we won't check for options
                if ( this.containment ) {
                    if ( event.pageX - this.offset.click.left < this.containment[0] ) {
                        pageX = this.containment[0] + this.offset.click.left;
                    }
                    if ( event.pageY - this.offset.click.top < this.containment[1] ) {
                        pageY = this.containment[1] + this.offset.click.top;
                    }
                    if ( event.pageX - this.offset.click.left > this.containment[2] ) {
                        pageX = this.containment[2] + this.offset.click.left;
                    }
                    if ( event.pageY - this.offset.click.top > this.containment[3] ) {
                        pageY = this.containment[3] + this.offset.click.top;
                    }
                }
            }

            return {
                top: (
                    pageY - // The absolute mouse position
                        this.offset.click.top - // Click offset (relative to the element)
                        this.offset.parent.top + // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollTop() )
                    ),
                left: (
                    pageX - // The absolute mouse position
                        this.offset.click.left - // Click offset (relative to the element)
                        this.offset.parent.left + // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollLeft() )
                    )
            };

        },

        _adjustPositionForScroll: function () {
            var pos = this.position,
                scroll = !(this.scrollParent && this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] )) ?
                    this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test( scroll[0].tagName );

            return {
                top: (
                    pos.top + // The absolute mouse position
                        this.offset.parent.top - // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollTop() )
                    ),
                left: (
                    pos.left + // The absolute mouse position
                        this.offset.parent.left - // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollLeft() )
                    )
            };

        },

        _cacheHelperProportions: function () {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },

        _setContainment: function () {
            var ce, co, over,
                o = this.options;
            if ( o.dragContainment === "parent" ) {
                o.dragContainment = this.helper[0].parentNode;
            }
            if ( o.dragContainment === "document" || o.dragContainment === "window" ) {
                this.containment = [
                    0 - this.offset.parent.left,
                    0 - this.offset.parent.top,
                    $( o.dragContainment === "document" ? document : window ).width() - this.helperProportions.width - this.margins.left,
                    ($( o.dragContainment === "document" ? document : window ).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
                ];
            }

            if ( !(/^(document|window|parent)$/).test( o.dragContainment ) ) {
                ce = $( o.dragContainment )[0];
                co = $( o.dragContainment ).offset();
                over = ($( ce ).css( "overflow" ) !== "hidden");

                this.containment = [
                    co.left + (parseInt( $( ce ).css( "borderLeftWidth" ), 10 ) || 0) + (parseInt( $( ce ).css( "paddingLeft" ), 10 ) || 0) - this.margins.left,
                    co.top + (parseInt( $( ce ).css( "borderTopWidth" ), 10 ) || 0) + (parseInt( $( ce ).css( "paddingTop" ), 10 ) || 0) - this.margins.top,
                    co.left + (over ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth) - (parseInt( $( ce ).css( "borderLeftWidth" ), 10 ) || 0) - (parseInt( $( ce ).css( "paddingRight" ), 10 ) || 0) - this.helperProportions.width - this.margins.left,
                    co.top + (over ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight) - (parseInt( $( ce ).css( "borderTopWidth" ), 10 ) || 0) - (parseInt( $( ce ).css( "paddingBottom" ), 10 ) || 0) - this.helperProportions.height - this.margins.top
                ];
            }
        },

        _intersectsWith: function ( item ) {
            var x1 = this.positionAbs.left,
                y1 = this.positionAbs.top,
                l = item.left,
                r = l + item.width,
                t = item.top,
                b = t + item.height,
                dyClick = this.offset.click.top,
                dxClick = this.offset.click.left,
                isOverElementHeight = ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
                isOverElementWidth = ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r );

            return isOverElementHeight && isOverElementWidth;
        },

        _dragCopyOrMove: function ( event, notify ) {
            var key, op;

            if ( event.ctrlKey ) {
                key = "ctrl";
            } else if ( event.altKey ) {
                key = "alt";
            } else if ( event.shiftKey ) {
                key = "shift";
            } else if ( event.metaKey ) {
                key = "meta";
            }
            op = this.dragOperations[key] || this.dragOperations.normal;
            if ( this.dragOperation !== op ) {
                // the drag operation has changed
                this.dragOperation = op;
                if ( this.placeholder ) {
                    // show or hide the items being dragged
                    this.dragItems.parent().toggle( op !== "move" );
                    // todo if any of the drag items are the only children of their parent then need to make leaf or parent
                }
                this._initPositions();
                this._refreshPositions();
                if ( notify ) {
                    this._trigger( "drag", event, this._uiHashDnD());
                }
            }
        },

        _cancel: function ( event, fromOutside ) {
            var animation,
                self = this;

            function cleanup() {
                self.animating = false;

                if ( self.helper && self.helper[0].parentNode ) {
                    self.helper.remove();
                }
                self.helper = null;
                self.dragging = false;
                self.dragItems = null;
                self.currentItem = null;
                self._stop( event );
            }

            // when cancel from draggable plugin dragging should be false by now
            if ( this.dragging ) {
                // When cancel over a droppable lie about the draggable position so that the drop fails but the
                // deactivate still happens
                this.positionAbs.top = -99999;
                this._mouseUp( { target: null } );
                if ( this.placeholder ) {
                    this.dragItems.parent().show();
                }
            }

            this.dropTargetNode = null;
            if ( this.placeholder ) {
                this._removePlaceholder();
            }

            if ( this.options.dragAnimate && !fromOutside ) {
                animation = this._getAnimation();

                this.animating = true;
                this.helper.animate( animation, parseInt( this.options.dragAnimate, 10 ) || 500, function () {
                    cleanup();
                } );
            } else {
                cleanup();
            }

        },

        _deactivate: function () {
            // remove active drop target indication
            this.element.find( "." + C_ACTIVE).removeClass( C_ACTIVE );
        },

        _finishDrag: function ( event ) {
            var i, dropParentNode$, dropIndex, parentNode, nodes,
                validOperation = true,
                nodeAdapter = this.nodeAdapter;

            this.animating = false;

            if ( this.placeholder ) {
                dropParentNode$ = this.placeholder.parent().closest( SEL_NODE );
                this.dragItems.parent().show(); // show so that on move get proper index if any moved nodes have same parent as placeholder
                dropIndex = domIndex( this.placeholder );
                if ( this.dragOperation === "move" ) {
                    this.dragItems.parent().hide(); // hide for move so they don't mess up the indexes when reorder in same parent node
                }
            } else {
                dropParentNode$ = this.dropTargetNode;
                dropIndex = 0; // todo think is this best???
            }

            if ( this.fromOutside ) {
                this.dragItems.parent().remove(); // get rid of the temporary drag item
                if ( this.dragOperation === "add" && nodeAdapter.addNode ) {
                    try {
                        if ( this.placeholder ) {
                            this._removePlaceholder();
                        }
                        this._add( event, dropParentNode$.children( SEL_CONTENT ), dropIndex, null, true );
                    } catch ( ex ) {
                        debug.error("Error in drop add action.", ex );
                    }
                }
            } else {
                // if this is a move or copy and model allows move or copy then do it otherwise take no action and
                // leave it up to the beforeStop event to make some sense of the drop
                if ( ( this.dragOperation === "copy" || this.dragOperation === "move" ) && nodeAdapter.allowAdd &&
                    nodeAdapter[ this.dragOperation === "copy" ? "copyNodes" : "moveNodes" ] &&
                    ( this.dragOperation === "copy" || nodeAdapter.allowDelete ) ) {

                    try {
                        if ( !dropParentNode$.length && !this.options.showRoot ) {
                            parentNode = nodeAdapter.root();
                        } else {
                            parentNode = this.treeMap[getIdFromNode( dropParentNode$ )];
                        }
                        // allowAdd probably already checked but do it again just in case.
                        if ( nodeAdapter.allowAdd( parentNode, this.dragOperation, this.dragItems ) ) {
                            if ( this.dragOperation === "move" ) {
                                // for move all drag item nodes must allow delete
                                nodes = this.getNodes( this.dragItems );
                                for ( i = 0; i < nodes.length; i++ ) {
                                    if ( !nodeAdapter.allowDelete( nodes[i] ) ) {
                                        validOperation = false;
                                        break;
                                    }
                                }
                            }
                        }
                        if ( validOperation && this.dragOperation === "move" ) {
                            // don't allow unnecessary moves such as moving to where it already is
                            if ( this.placeholder ) {
                                // if the group of items is adjacent to the placeholder then no point in moving
                                if ( this.dragItems.last().closest( SEL_NODE ).next()[0] === this.placeholder[0] ) {
                                    validOperation = false; // assume not valid but check that all the other dragItems are immediately before the placeholder
                                    for ( i = 0; i < this.dragItems.length - 1; i++ ) {
                                        if ( this.dragItems.eq( i ).closest( SEL_NODE ).next()[0] !== this.dragItems.eq( i + 1 ).closest( SEL_NODE )[0] ) {
                                            validOperation = true;
                                            break;
                                        }
                                    }
                                } else if ( this.dragItems.first().closest( SEL_NODE ).prev()[0] === this.placeholder[0] ) {
                                    validOperation = false; // assume not valid but check that all the other dragItems are immediately after the placeholder
                                    for ( i = 1; i < this.dragItems.length; i++ ) {
                                        if ( this.dragItems.eq( i ).closest( SEL_NODE ).prev()[0] !== this.dragItems.eq( i - 1 ).closest( SEL_NODE )[0] ) {
                                            validOperation = true;
                                            break;
                                        }
                                    }
                                }
                            } else {
                                // if all of the items have the target node as their parent then no point in moving
                                validOperation = false;
                                for ( i = 0; i < this.dragItems.length; i++ ) {
                                    if ( this.dragItems.eq( i ).closest( SEL_NODE ).parent().closest( SEL_NODE )[0] !== dropParentNode$[0] ) {
                                        validOperation = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if ( validOperation ) {
                            if ( this.placeholder ) {
                                this._removePlaceholder();
                            }
                            this._moveOrCopy( event, dropParentNode$.children( SEL_CONTENT ), dropIndex, this.dragItems, this.dragOperation === "copy", true );
                        } else {
                            this.dragItems.parent().show(); // make sure the drag items are shown
                        }
                    } catch ( ex ) {
                        this.dragItems.parent().show(); // make sure the drag items are shown
                        debug.error("Error in drop " + this.dragOperation + " action.", ex );
                    }
                }
            }

            this.dragging = false;

            this._trigger( "beforeStop", event, this._uiHashDnD() );

            this.dragItems = null;
            this.currentItem = null;
            if ( this.placeholder ) {
                this._removePlaceholder();
            }
            this.helper.remove();
            this.helper = null;

            if ( this.fromOutside ) {
                this._trigger( "deactivate", event, this._uiHashDnD( this ) );
            }
            this._stop( event );
            this.fromOutside = false;
        },

        _stop: function( event ) {
            if ( apex.tooltipManager ) {
                apex.tooltipManager.enableTooltips();
            }
            this._trigger( "stop", event, this._uiHashDnD() );
        },

        _add: function( event, toParentNodeContent$, index, node, focus ) {
            var parentNode, level,
                self = this,
                nodeAdapter = this.nodeAdapter;

            if ( toParentNodeContent$ && toParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( toParentNodeContent$.parent() )];
                level = getLevel( toParentNodeContent$, this.labelSelector ) + 1;
            } else {
                toParentNodeContent$ = null; // to simplify checks below
                parentNode = nodeAdapter.root();
                level = 1;
            }

            nodeAdapter.addNode( parentNode, index, null, node, function( newNode, newIndex ) {
                var node$, ul$, childNodes$,
                    out = util.htmlBuilder(),
                    change = {
                        parentNode: parentNode,
                        parent$: toParentNodeContent$,
                        node: newNode,
                        index: newIndex
                    };

                function finishAdd() {
                    self._select( change.node$, event, focus );
                    self._trigger( "added", event, change );
                }

                if ( newNode === false || newNode === null || newIndex < 0 ) {
                    return; // add failed
                }

                if ( toParentNodeContent$ ) {
                    self._makeParentIfNeeded( toParentNodeContent$ );
                    ul$ = toParentNodeContent$.parent().children( "ul" );
                    if ( ul$.length === 0 ) {
                        // in this case the node was already a parent but had never been expanded
                        // expand it now and all the children including the newly added one are rendered.
                        self._expandNode( toParentNodeContent$.parent() , function() {
                            ul$ = toParentNodeContent$.parent().children( "ul" );
                            change.node$ = ul$.children().eq( index ).children( SEL_CONTENT );
                            finishAdd();
                        });
                        return;
                    }
                } else {
                    ul$ = self.element.children( "ul" );
                }
                self._renderNode( newNode, level, out );
                node$ = $( out.toString() );
                change.node$ = node$.children( SEL_CONTENT );

                childNodes$ = ul$.children();
                if ( newIndex >= childNodes$.length ) {
                    ul$.append( node$ );
                } else {
                    childNodes$.eq( newIndex ).before( node$ );
                }
                finishAdd();
            } );
        },

        // move or copy nodes in model and tree. Assumes already checked to make sure move or copy is possible
        _moveOrCopy: function( event, toParentNodeContent$, index, nodeContent$, copy, focus ) {
            var parentNode, level,
                self = this,
                nodes = this.getNodes( nodeContent$ ),
                op = copy ? "copyNodes" : "moveNodes",
                nodeAdapter = this.nodeAdapter;

            if ( toParentNodeContent$ && toParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( toParentNodeContent$.parent() )];
                level = getLevel( toParentNodeContent$, this.labelSelector ) + 1;
            } else {
                toParentNodeContent$ = null; // to simplify checks below
                parentNode = nodeAdapter.root();
                level = 1;
            }

            nodeAdapter[op]( parentNode, index, nodes, function( places ) {
                var i, place, node, node$, prevParentNode$, resultItem, ul$, childNodes$,
                    out = util.htmlBuilder(),
                    resultItems = [],
                    selection = [],
                    change = {
                        parentNode: parentNode,
                        parent$: toParentNodeContent$,
                        items: resultItems
                    };

                function finish() {
                    for ( i = 0; i < resultItems.length; i++ ) {
                        resultItem = resultItems[i];
                        node = nodeAdapter.child( parentNode, resultItem.toIndex );
                        resultItem.toNode = node;
                        out.clear();
                        self._renderNode( node, level, out );
                        node$ = $( out.toString() );
                        resultItem.toNode$ = node$.children( SEL_CONTENT );
                        childNodes$ = ul$.children( ":visible" );

                        if ( resultItem.toIndex >= childNodes$.length ) {
                            ul$.append( node$ );
                        } else {
                            childNodes$.eq( resultItem.toIndex ).before( node$ );
                        }
                        selection.push( resultItem.toNode$[0] );

                        // if move then remove from old location
                        if ( !copy ) {
                            prevParentNode$ = resultItem.fromNode$.parent().parent().closest( SEL_NODE ).children( SEL_CONTENT );
                            resultItem.fromParent$ = prevParentNode$;
                            resultItem.fromIndex = resultItem.fromNode$.parent().parent().children().index( resultItem.fromNode$.parent() );
                            resultItem.fromNode$.parent().remove(); // todo consider treeMap
                            self._makeLeafIfNeeded( prevParentNode$ );
                        }
                    }
                    self._select( $( selection ), event, focus );
                    self._trigger( copy ? "copied" : "moved", event, change );
                }

                if ( !places ) {
                    return; // copy failed
                }

                // the inserting of new nodes must be done in order from lowest to highest
                for ( i = 0; i < places.length; i++ ) {
                    place = places[i];
                    if ( place >= 0 ) {
                        resultItems.push({
                            fromNode$: nodeContent$.eq( i ),
                            toIndex: place
                        });
                    }
                }

                resultItems.sort( function( a, b ) {
                    return a.toIndex - b.toIndex;
                } );

                if ( toParentNodeContent$ ) {
                    self._makeParentIfNeeded( toParentNodeContent$ );
                    ul$ = toParentNodeContent$.parent().children( "ul" );
                    self._expandNode( toParentNodeContent$.parent(), function() {
                        finish();
                    });
                    return;
                } else {
                    ul$ = self.element.children( "ul" );
                }
                finish();
            } );
        },

        _uiHashDnD: function ( _inst ) {
            var inst = _inst || this;

            return {
                helper: inst.helper,
                placeholder: inst.dropTargetNode || inst.placeholder || $( [] ),
                position: inst.position,
                originalPosition: inst.originalPosition,
                offset: inst.positionAbs,
                items: inst.dragItems,
                operation: inst.dragOperation,
                sender: _inst ? _inst.element : null
            };
        }

    } );

    //
    // This is an adapter for a default data model. Use it if you don't already have a prescribed data model.
    // This supports all the treeView features except for asynchronous loading of child nodes.
    //
    // A node has this structure (all but label are optional)
    // {
    //     label:      <string>,
    //     id:         <string>,
    //     type:       <string>,
    //     children:   [ <node>, ... ] // omit for leaf nodes
    //     // the following override type settings
    //     icon:       <icon name or null>,
    //     classes:    <class name(s)>, // these are added to any classes for the type
    //     link:       <url>,
    //     isDisabled: <true/false>,
    //     operations: { ... }
    // }
    //
    // A reference to the node's parent will be added to each node in the property "_parent".
    // All properties are optional except for label and if hasIdentity is true in the call to makeDefaultNodeAdapter
    // then id is also required.
    //
    // Types
    // {
    //     "<type name or 'default'>": {
    //         icon:        <icon name or null>,
    //         classes:     <class name(s)>,
    //         isDisabled:  <true/false/function>,
    //         defaultLabel: <text>,
    //         validChildren: [ "type", ... ] | true, // true allows any children, or an array of valid type names
    //         operations: {
    //             canAdd:    <true/false/function>, // Note: node must also have a children array to be able to add
    //             canDelete: <true/false/function>, // Note: can't delete root node
    //             canRename: <true/false/function>,
    //             canDrag:   <true/false/function>
    //                                               // The above functions are called in the context of the adapter with arguments:
    //                                               //   node, operation, children. The last two only apply for canAdd. The function
    //                                               // must return true or false.
    //             drag: {
    //                 normal: <op>,
    //                 ctrl: <op>,
    //                 alt: <op>,
    //                 shift: <op>
    //            }, // <op> is a built in action "move", "copy", or "add" or a custom operation that can be handled in the beforeStop event
    //            externalDrag: <same object as drag> // only applies to the default type
    //         }
    //     },
    //     ...
    // }
    //
    var defaultNodeAdapter = {
        // data: {},
        // types: {},

        root: function() {
            return this.data;
        },

        getLabel: function( n ) {
            return n.label;
        },

        getIcon: function( n ) {
            var t = this.getType( n ),
                icon = null;

            if ( n.icon || n.icon === null ) {
                icon = n.icon;
            } else if ( t.icon || t.icon === null ) {
                icon = t.icon;
            } else if ( this.types["default"].icon !== undefined ) {
                icon = this.types["default"].icon;
            }
            return icon;
        },

        getClasses: function( n ) {
            var t = this.getType( n ),
                classes = null;

            if ( t.classes ) {
                classes = t.classes;
            } else if ( this.types["default"].classes ) {
                classes = this.types["default"].classes;
            }
            if ( n.classes ) {
                if ( classes ) {
                    classes += " " + n.classes;
                } else {
                    classes = n.classes;
                }
            }
            return classes;
        },

        getLink: function( n ) {
            return n.link;
        },

        isDisabled: function( n ) {
            var t = this.getType( n ),
                disabled = false;

            if ( n.isDisabled !== undefined ) {
                disabled = n.isDisabled;
            } else if ( t.isDisabled !== undefined ) {
                disabled = t.isDisabled;
            } else if ( this.types["default"].isDisabled !== undefined ) {
                disabled = this.types["default"].isDisabled;
            }
            return disabled;
        },

        child: function( n, i ) {
            if ( n.children ) {
                return n.children[i];
            }
            // undefined
        },

        childCount: function( n ) {
            return n.children ? n.children.length : 0;
        },

        hasChildren: function( n ) {
            return n.children ? n.children.length > 0 : false;
        },

        allowAdd: function( n, operation, children ) {
            var i, validChildren,
                t = this.getType( n ),
                addOK = !!n.children && this.check( "canAdd", n, operation, children );

            if ( addOK && children ) {
                if ( t.validChildren !== undefined) {
                    validChildren = t.validChildren;
                } else if ( this.types["default"].validChildren !== undefined ) {
                    validChildren = this.types["default"].validChildren;
                }
                // addOK is already true look for a reason to not allow add
                if ( validChildren !== true ) {
                    for ( i = 0; i < children.length; i++ ) {
                        if ( validChildren.indexOf( children[i].type ) < 0 ) {
                            addOK = false;
                            break;
                        }
                    }
                }
            }
            return addOK;
        },

        allowRename: function( n ) {
            return this.check( "canRename", n );
        },

        allowDelete: function( n ) {
            if ( n === this.data ) {
                return false; // can't delete the root
            }
            return this.check( "canDelete", n );
        },

        allowDrag: function( n ) {
            return this.check( "canDrag", n );
        },

        dragOperations: function( nodes ) {
            var i, ops, type;

            if ( nodes ) {
                if ( nodes.length > 0 ) {
                    // if all the nodes being dragged are of the same type use that type
                    type = nodes[0].type || "default";
                    for ( i = 1; i < nodes.length; i++ ) {
                        if ( nodes[i].type !== type ) {
                            type = "default"; // else use default type
                            break;
                        }
                    }
                } else {
                    type = "default";
                }
                if ( this.types[type].operations && this.types[type].operations.drag !== undefined ) {
                    ops = this.types[type].operations.drag;
                } else {
                    ops = this.types["default"].operations.drag;
                }
            } else {
                ops = this.types["default"].operations.externalDrag;
            }
            return ops;
        },

        addNode: function( parent, index, label, context, callback ) {
            var newIndex,
                newNode = $.extend( true, { }, context || this.newNode( parent ) );

            if ( label ) {
                newNode.label = label;
            }
            if ( this.sortCompare ) {
                // ignore index and put at end because it will get sorted
                parent.children.push( newNode );
            } else {
                parent.children.splice( index, 0, newNode );
            }
            newNode._parent = parent;
            // make sure node gets an id if needed
            if ( this._nextId !== undefined ) {
                if ( newNode.id === undefined ) {
                    newNode.id = this.nextId();
                } else {
                    this._nextId += 1;
                }
            }

            if ( this.sortCompare ) {
                parent.children.sort( this.sortCompare );
            }
            newIndex = parent.children.indexOf( newNode );
            this.validateAdd( newNode, newIndex, function( status ) {
                if ( typeof status === "string" || status === false ) {
                    // undo the add
                    parent.children.splice( newIndex, 1 );
                    callback( status === false ? null : false );
                } else if ( status ) {
                    callback( newNode, newIndex );
                }
            } );
        },

        renameNode: function( n, newLabel, callback ) {
            var newIndex,
                oldLabel = n.label;

            n.label = newLabel;
            if ( n._parent ) {
                if ( this.sortCompare ) {
                    n._parent.children.sort( this.sortCompare );
                }
                newIndex = n._parent.children.indexOf( n );
            } else {
                newIndex = 0; // can't sort the root because it has no parent or siblings
            }
            this.validateRename( n, newIndex, function( status ) {
                if ( typeof status === "string" || status === false ) {
                    // undo the rename
                    n.label = oldLabel;
                    callback( status === false ? null : false );
                } else if ( status ) {
                    callback( n, newIndex );
                }
            } );
        },

        deleteNode: function( n, callback , more ) {
            var oldParent = n._parent,
                oldIndex = n._parent.children.indexOf( n );

            oldParent.children.splice( oldIndex, 1 );
            delete n._parent;
            this.validateDelete( n, more, function( status ) {
                if ( !status ) {
                    // undo delete
                    n._parent = oldParent;
                    oldParent.children.splice( oldIndex, 0, n );
                }
                callback( status );
            });
        },

        moveNodes: function( parent, index, nodes, callback ) {
            var i, node, prevParent, prevIndex,
                places = [];

            for ( i = 0; i < nodes.length; i++ ) {
                node = nodes[i];
                prevParent = node._parent;
                prevIndex = prevParent.children.indexOf(node);
                prevParent.children.splice( prevIndex, 1); // delete from previous parent node
                if ( parent === prevParent && prevIndex < index ) {
                    // when reordering in the same node take into consideration the node just deleted
                    index -= 1;
                }
                if ( this.sortCompare ) {
                    parent.children.push( node ); // add to new parent node
                } else {
                    parent.children.splice( index, 0, node ); // add to new parent node
                    index += 1;
                }
                node._parent = parent;
            }
            if ( this.sortCompare ) {
                parent.children.sort( this.sortCompare );
            }
            // the place a node ends up depends on sorting and also on when reordering in the same parent
            for ( i = 0; i < nodes.length; i++ ) {
                places[i] = parent.children.indexOf(nodes[i]);
            }
            this.validateMove( parent, nodes, places, function( status ) {
                // todo undo nodes not moved
                callback( status ? places : false );
            } );
        },

        copyNodes: function( parent, index, nodes, callback ) {
            var i, node, newNode,
                self = this,
                newNodes = [],
                places = [];

            function cloneNode( node, parent ) {
                var i, newNode = $.extend({}, node);
                newNode._parent = parent;
                if ( self._nextId !== undefined ) {
                    newNode.id = self.nextId();
                }
                if ( node.children ) {
                    newNode.children = [];
                    for ( i = 0; i < node.children.length; i++ ) {
                        newNode.children.push( cloneNode( node.children[i], newNode ) );
                    }
                }
                return newNode;
            }

            for ( i = 0; i < nodes.length; i++ ) {
                node = nodes[i];
                newNode = cloneNode( node, parent );
                if ( this.sortCompare ) {
                    parent.children.push( newNode ); // add to new parent node
                    newNodes[i] = newNode;
                } else {
                    parent.children.splice( index, 0, newNode ); // add to new parent node
                    places[i] = index;
                    index += 1;
                }
            }
            if ( this.sortCompare ) {
                parent.children.sort( this.sortCompare );
                for ( i = 0; i < newNodes.length; i++ ) {
                    places[i] = parent.children.indexOf( newNodes[i] );
                }
            }
            this.validateCopy( parent, nodes, places, function( status ) {
                // todo undo nodes not copied
                callback( status ? places : false );
            } );
        },

        //
        // Additional methods not part of the adapter interface
        // You can use or replace these methods
        //

        // delete this function for unsorted nodes or replace to provide a different ordering
        sortCompare: function( a, b ) {
            if ( a.label > b.label ) {
                return 1;
            } else if ( a.label < b.label ) {
                return -1;
            }
            return 0;
        },

        nextId: function() {
            var nextId = this._nextId;
            this._nextId += 1;
            return "tn" + nextId;
        },

        // this is used to create a new node when addNode receives no context object
        newNode: function( parent ) {
            var ct,
                newNode = { },
                childrenAllowed = true,
                t = this.getType( parent );

            if ( this._nextId !== undefined ) {
                newNode.id = this.nextId();
            }
            if ( $.isArray( t.validChildren ) ) {
                newNode.type = t.validChildren[0]; // default to first valid type for parent
                ct = this.types[newNode.type];
                if ( ct && ct.operations && ct.operations.canAdd !== undefined ) {
                    childrenAllowed = t.operations.canAdd;
                } else if ( this.types["default"].operations.canAdd !== undefined ) {
                    childrenAllowed = this.types["default"].operations.canAdd;
                }
                if ( ct && ct.defaultLabel !== undefined ) {
                    newNode.label = ct.defaultLabel;
                } else if ( this.types["default"].defaultLabel !== undefined ) {
                    newNode.label = this.types["default"].defaultLabel;
                }
            } else {
                if ( this.types["default"].defaultLabel !== undefined ) {
                    newNode.label = this.types["default"].defaultLabel;
                }
            }
            if ( childrenAllowed ) {
                newNode.children = [];
            }
            return newNode;
        },

        extraCheck: function( result, rule, n, operation, children ) {
            return result;
        },

        // called after the given node is added at given index
        // call callback with true for success, false for failure, and "again" if giving the node a different name
        // could succeed (only works when adding a node in-place)
        validateAdd: function( node, index, callback ) {
            callback( true );
        },

        // called after the given node is renamed and at given index
        // call callback with true for success, false for failure, and "again" if giving the node a different name
        // could succeed (only works when adding a node in-place)
        validateRename: function( node, index, callback ) {
            callback( true );
        },

        // called after the given node is deleted
        // call callback with true for success and false for failure.
        validateDelete: function( node, more, callback ) {
            callback( true );
        },

        // todo not sure about this
        validateMove: function( parent, nodes, places, callback ) {
            callback( true );
        },

        // todo not sure about this
        validateCopy: function( parent, nodes, places, callback ) {
            callback( true );
        },

        // todo method to sort or to call after sort

        getType: function( n ) {
            var t = "default";

            if ( n.type ) {
                t = n.type;
            }
            return this.types[t] || this.types["default"];
        },

        check: function( rule, n, operation, children ) {
            var result = false,
                t = this.getType( n );

            if ( n.operations && n.operations[rule] !== undefined ) {
                result = n.operations[rule];
            } else if ( t.operations && t.operations[rule] !== undefined ) {
                result = t.operations[rule];
            } else if ( this.types["default"].operations[rule] !== undefined ) {
                result = this.types["default"].operations[rule];
            }
            if ( $.isFunction( result ) ) {
                result = result.call( this, n, operation, children );
            }
            return this.extraCheck( result, rule, n, operation, children );
        }
    };

    /**
     * Call as
     * $.apex.treeView.makeDefaultNodeAdapter(data, [types], false);
     * or
     * $.apex.treeView.makeDefaultNodeAdapter(data, [types], [initialExpandedNodeIds]);
     *
     * @param data
     * @param types
     * @param hasIdentity
     * @param initialExpandedNodeIds
     * @return {*}
     */
    $.apex.treeView.makeDefaultNodeAdapter = function( data, types, hasIdentity, initialExpandedNodeIds ) {
        var that = Object.create( defaultNodeAdapter );

        if ( $.isArray(hasIdentity) ) {
            initialExpandedNodeIds = hasIdentity;
            hasIdentity = true;
        }
        if ( hasIdentity === null || hasIdentity === undefined ) {
            hasIdentity = true;
        }
        if ( hasIdentity ) {
            this.addViewStateMixin( that, "id", initialExpandedNodeIds );
            that._nextId = 1;
        }
        that.data = data;
        that.types = $.extend( true, {}, {
            "default" : {
                isDisabled: false,
                validChildren: true, // any children are allowed
                operations: {
                    canAdd: true,
                    canRename: true,
                    canDelete: true,
                    canDrag: true,
                    drag: { normal: "move", ctrl: "copy" },
                    externalDrag: { normal: "add" }
                }
            }
        }, types );

        function traverse( n, p ) {
            var i;
            n._parent = p;
            if ( hasIdentity ) {
                that._nextId += 1;
            }
            if ( n.children ) {
                for ( i = 0; i < n.children.length; i++ ) {
                    traverse( n.children[i], n );
                }
            }
        }
        if ( that.data ) {
            // add parent references to tree nodes to support modification
            traverse( that.data, null );
        }

        return that;
    };

    $.apex.treeView.addViewStateMixin = function( adapter, nodeIdentity, initialExpandedNodeIds ) {
        $.extend( adapter, {
            _getIdentity: $.isFunction( nodeIdentity ) ? nodeIdentity : function(node) { return node[nodeIdentity]; },
            _state: {},

            isExpanded: function(treeId, n) {
                var expandedNodes = this._getExpandedNodes( treeId );
                return ( expandedNodes[this._getIdentity( n )] ) || false;
            },

            setExpanded: function(treeId, n, expanded) {
                var expandedNodes = this._getExpandedNodes( treeId );
                expandedNodes[this._getIdentity( n )] = expanded;
            },

            getExpandedNodeIds: function(treeId) {
                var n,
                    nodes = [],
                    expandedNodes = this._getExpandedNodes( treeId );

                for ( n in expandedNodes ) {
                    if ( expandedNodes.hasOwnProperty(n) && expandedNodes[n] === true ) {
                        nodes.push(n);
                    }
                }
                return nodes;
            },

            getExpandedState: function(treeId) {
                var expandedNodes = this._getExpandedNodes( treeId );

                // return a copy
                return $.extend({}, expandedNodes );
            },

            getViewId: function(treeId, n) {
                var nodeMap = this._state[treeId] && this._state[treeId].nodeMap;
                return nodeMap && nodeMap[this._getIdentity( n )];
            },

            setViewId: function(treeId, n, viewId) {
                var nodeMap = this._state[treeId] && this._state[treeId].nodeMap;
                if ( !nodeMap ) {
                    nodeMap = {};
                    if ( ! this._state[treeId] ) {
                        this._state[treeId] = {};
                    }
                    this._state[treeId].nodeMap = nodeMap;
                }
                nodeMap[this._getIdentity( n )] = viewId;
            },

            clearViewId: function(treeId, n) {
                var nodeMap = this._state[treeId] && this._state[treeId].nodeMap,
                    expandedNodes = this._state[treeId] && this._state[treeId].expandedNodes;

                if ( nodeMap ) {
                    if ( n ) {
                        delete nodeMap[this._getIdentity( n )];
                        if ( expandedNodes ) {
                            delete expandedNodes[this._getIdentity( n )];
                        }
                    } else {
                        this._state[treeId].nodeMap = {};
                        delete this._state[treeId].expandedNodes;
                    }
                }
            },

            _getExpandedNodes: function( treeId ) {
                var i,
                    expandedNodes = this._state[treeId] && this._state[treeId].expandedNodes;

                if ( !expandedNodes ) {
                    if ( ! this._state[treeId] ) {
                        this._state[treeId] = {};
                    }
                    expandedNodes = {};
                    this._state[treeId].expandedNodes = expandedNodes;
                    if ( initialExpandedNodeIds ) {
                        for ( i = 0; i < initialExpandedNodeIds.length; i++ ) {
                            expandedNodes[initialExpandedNodeIds[i]] = true;
                        }
                    }
                }
                return expandedNodes;
            }
        });
    };

    /*
     * Draggable plugin so draggable can work with treeView
     */
if ( $.ui.draggable ) {
    $.ui.plugin.add( "draggable", "connectToTreeView", {
        start: function ( event, ui ) {
            var inst = $( this ).data( "ui-draggable" ),
                o = inst.options,
                uiObj = $.extend( {}, ui, { item: inst.element } );

            // todo will this conflict with gridlyout???
            // install handler for ESCAPE key to cancel drag
            $( "body" ).on( "keydown.treeviewplug", function ( event ) {
                if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
                    inst.dropped = false; // allow revert to happen
                    inst.cancel();
                }
            } );

            inst.trees = [];
            $( o.connectToTreeView ).each( function () {
                var treeView = $.data( this, "apex-treeView" );
                if ( treeView && !treeView.options.disabled && treeView.options.dragAndDrop ) {
                    inst.trees.push( {
                        instance: treeView
                    } );
                    treeView._initPositions();
                    treeView._refreshPositions(); // make sure treeView drop information is up to date
                    treeView._trigger( "activate", event, uiObj );
                } else {
                    debug.warn( "Draggable connectToTreeView matches an element that is not a treeView, is disabled, or doesn't support drag and drop.");
                }

            } );

        },
        // If we are still over the treeView, we fake the stop event of the treeView
        // also responsible for deactivate if cancel or not over treeView
        stop: function ( event, ui ) {
            var inst = $( this ).data( "ui-draggable" );

            // remove handler for ESCAPE key to cancel drag
            $( "body" ).off( ".treeviewplug" );

            $.each( inst.trees, function () {
                if ( this.instance.isOver && !this.invalid ) {

                    this.instance.isOver = false;

                    inst.cancelHelperRemoval = true; // Don't remove the helper in the draggable instance

                    // Trigger stop on the treeView
                    this.instance._mouseStop( event, true );
                    if ( !event.target ) {
                        // The drag has been canceled
                        this.instance._trigger( "deactivate", event, this.instance._uiHashDnD( this.instance ) );
                        // remove the temp drag component before cancel
                        this.instance.dragItems.parent().remove();
                        this.instance._cancel( event, true );
                    }
                } else {
                    this.instance._deactivate();
                    this.instance._trigger( "deactivate", event, this.instance._uiHashDnD( this.instance ) );
                    // if was was once over this treeView then must treat it as a cancel for proper cleanup and sending stop event
                    if ( this.instance.dragItems ) {
                        // remove the temp drag component before cancel
                        this.instance.dragItems.parent().remove();
                        this.instance._cancel( event, true );
                    }
                }

            } );

        },
        drag: function ( event, ui ) {
            var inst = $( this ).data( "ui-draggable" );

            $.each( inst.trees, function () {
                var intersecting = false;

                if ( this.invalid ) {
                    return;
                }

                // Copy over some variables to allow calling the treeView's native _intersectsWith
                this.instance.positionAbs = inst.positionAbs;
                this.instance.helperProportions = inst.helperProportions;
                this.instance.offset.click = inst.offset.click;

                if ( this.instance._intersectsWith( this.instance.containerCache ) ) {
                    intersecting = true;
                }

                if ( intersecting ) {
                    // If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
                    if ( !this.instance.isOver ) {

                        this.instance.isOver = true;
                        // Now we fake the start of dragging for the treeView instance, by making a temporary drag component
                        // Also set the helper so it doesn't create a new one
                        this.instance._makeTempDragItem();
                        this.instance.helper = ui.helper;
                        this.instance.helper.css( "position", "relative" ); // for proper scrollParent detection, it will get put back to absolute by _mouseStart

                        event.target = this.instance.dragItems.parent().children( SEL_ROW )[0];
                        if ( !this.instance._mouseCapture( event, true ) ) {
                            this.instance.isOver = false;
                            this.invalid = true;
                            return;
                        }

                        this.instance._trigger( "over", event, this.instance._uiHashDnD( this.instance ) );
                        this.instance._mouseStart( event, event, true );

                        // Because the browser event is way off the temp drag component, we modify a couple of variables to reflect the changes
                        this.instance.offset.click.top = inst.offset.click.top;
                        this.instance.offset.click.left = inst.offset.click.left;
                        this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
                        this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

                        inst.dropped = this.instance.element; //draggable revert needs that
                        //hack so receive/update callbacks work (mostly)
                        inst.currentItem = inst.element;
                        this.instance.fromOutside = inst;

                    }

                    // Provided we did all the previous steps, we can fire the drag event of the treeView on every draggable drag
                    if ( this.instance.dragItems ) {
                        this.instance._mouseDrag( event );
                    }

                } else {
                    // If it doesn't intersect with the treeView, and it intersected before,
                    // we fake the drag stop of the treeView, but make sure it doesn't remove the helper by making it look like a canceled drag
                    if ( this.instance.isOver ) {

                        this.instance.isOver = false;

                        // The out event needs to be triggered independently
                        this.instance._trigger( "out", event, this.instance._uiHashDnD( this.instance ) );

                        event.target = null; // from the perspective of the treeView the drag was canceled
                        this.instance._mouseStop( event, true );

                        // cleanup the temp drag component that was created when first dragged over the treeView
                        // and any placeholder that may have been created
                        this.instance.dragItems.parent().remove();
                        if ( this.instance.placeholder ) {
                            this.instance._removePlaceholder();
                        }

                        inst.dropped = false; // draggable revert needs that
                    }

                }

            } );

        }
    } );

    /*
     * Draggable plugin that is a better cursor plugin
     * Use cursor2 in place of cursor because it makes sure the cursor is what it is set to
     * regardless of other css rules or what the mouse is over.
     * todo: this should stand on its own in a separate module currently here because treeView is used every where we need this
     */
    $.ui.plugin.add("draggable", "cursor2", {
        start: function() {
            var b$ = $("body"),
                inst = $( this ).data( "ui-draggable" ),
                o = inst.options;

            if ( o.cursor2 && o.cursor2 !== "auto" ) {
                inst.storedCursor = b$.css( "cursor" );
                b$.css("cursor", o.cursor2);
                inst.storedStylesheet = $( "<style>*{ cursor: " + o.cursor2 + " !important; }</style>" ).appendTo( b$ );
            }
        },
        stop: function() {
            var inst = $( this ).data( "ui-draggable" );

            if ( inst.storedCursor ) {
                $( "body" ).css( "cursor", inst.storedCursor );
                inst.storedStylesheet.remove();
            }
        }
    });
}

if ( apex.widget ) {

    if ( apex.widget.tree ) {
        // this warning can be ignored if widget.treeView is not used via the tree region
        debug.warn("Old and new tree implementations cannot be mixed.");
    } else {
        /*
         * APEX native tree region integration
         * TODO consider moving this to its own file which would then be aggregated with this one again for use by tree region
         */
        var defaultTypeData = {
            "default": {
                icon: "icon-tree-folder",
                operations: {
                    canAdd: false,
                    canDelete: false,
                    canRename: false,
                    canDrag: false
                }
            }
        };

        apex.widget.tree = {
            init: function( pTreeId, pTypes, pStaticData, pTreeAction, pSelectedNodeId, pHasIdentity, pRootAdded, pHasTooltips, iconType ) {
                var sel$,
                    types = $.extend( true, {}, defaultTypeData, pTypes ),
                    tree$ = $("#" + util.escapeCSS( pTreeId ), apex.gPageContext$);

                tree$.treeView({
                    getNodeAdapter: function() {
                        return $.apex.treeView.makeDefaultNodeAdapter( pStaticData, types, pHasIdentity );
                    },
                    navigation: true,
                    doubleClick: pTreeAction === "D" ? "activate" : false,
                    tooltip: pHasTooltips ? {
                        show: apex.tooltipManager.defaultShowOption(),
                        content: function ( callback, node ) {
                            if (!node) {
                                return null;
                            }
                            return node.tooltip;
                        }
                    } : null,
                    multiple: false,
                    showRoot: !pRootAdded,
                    expandRoot: true,
                    iconType: iconType
                });
                if ( pSelectedNodeId ) {
                    sel$ = tree$.treeView( "find", { depth:-1, findAll: false, match: function( node ) {
                        return node.id === pSelectedNodeId;
                    } });
                    if ( sel$.length ) {
                        tree$.treeView( "setSelection", sel$ );
                    }
                }
            },
            expand_all: function( pTreeId ) {
                $( "#"+util.escapeCSS( pTreeId ), apex.gPageContext$ ).treeView( "expandAll" );
            },
            collapse_all: function( pTreeId ) {
                $( "#"+util.escapeCSS( pTreeId ), apex.gPageContext$ ).treeView( "collapseAll" );
            },
            reset: function( pTreeId ) {
                var tree$ = $( "#"+util.escapeCSS( pTreeId ), apex.gPageContext$ );
                tree$.treeView( "collapseAll" ).treeView("expand", tree$.children().children("li").first() );
            }
        };
    }
}

})( apex.util, apex.debug, apex.jQuery );

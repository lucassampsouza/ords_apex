/*!
 Collapsible - a jQuery UI based widget for setting up a page region as collapsible
 Copyright (c) 2014, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * Collapsible allows you to define 1 or more page sections as collapsible
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    apex/core.js
 *    apex/util.js
 *    apex/storage.js
 *    apex/widget.toggleCore.js
 *
 */
/*global apex,ToggleCore*/
(function( $, lang, util, undefined ) {
    "use strict";

    var C_COLLAPSIBLE = "a-Collapsible",
        C_COLLAPSIBLE_CONTENT = C_COLLAPSIBLE + "-content",
        C_COLLAPSIBLE_HEADING = C_COLLAPSIBLE + "-heading",
        C_IS_EXPANDED = "is-expanded",
        C_IS_COLLAPSED = "is-collapsed",
        C_ICON = "a-Icon",
        C_ICON_COLLAPSIBLE = C_ICON + " " + C_COLLAPSIBLE + "-icon",
    // selectors
        SEL_C = ".",
        SEL_COLLAPSIBLE = SEL_C + C_COLLAPSIBLE,
    // attributes
        A_CONTROLS = "aria-controls",
        A_EXPANDED = "aria-expanded",
        A_HIDDEN = "aria-hidden";

    $.widget( "apex.collapsible", {
        version:                    "5.0",
        widgetEventPrefix:          "collapsible",
        baseId:                     null,
        heading$:                   null,                           /* Element containing the region header, which should itself
                                                                       contain the title and element that controls the expand / collapse */
        controllingElement$:        null,                           /* The element that controls the expand / collapse, should be either a link or a button,
                                                                       if a link is used, this widget changes it to be an ARIA synthetic button, as that provides
                                                                       better JAWS support */
        content$:                   null,                           // The content that is expanded / collapsed
        isContentIdSetByWidget:     false,                          // Has the widget set the content ID (so it knows to clean up on destroy)
        isHeadingIdSetByWidget:     false,                          // Has the widget set the content ID (so it knows to clean up on destroy)
        isControllingElementALink:  false,
        core:                       null,
        expandedClass:              C_IS_EXPANDED,
        collapsedClass:             C_IS_COLLAPSED,
        options: {
            heading:                "h1,h2,h3,h4,h5,h6",            /* Main Heading containing heading text and controlling element,
                                                                     * defaults to Hx, but could be anything if passed */
            controllingElement:     "button,a",                     // Controlling element, defaults to either button or anchor
            content:                null,                           // Selector for the content being expanded / collapsed
            collapsed:              true,                           // Sets initial state
            doCollapse:             true,                           // Default widget JavaScript based expand / collapse can be disabled if CSS is preferred
            universalTheme:         false,
            expandedClass:          null,                           // Define an additional expanded class that will be applied to the content
            collapsedClass:         null                            // Define an additional collapsed class that will be applied to the content
        },

        _create: function() {
            var lContentId, lHeadingId,
                me = this,
                out = util.htmlBuilder(),
                o = this.options,
                lCollapsibleCount = $( SEL_COLLAPSIBLE ).length;

            // Base ID
            this.baseId = this.element.id || "a_Collapsible" + ( lCollapsibleCount + 1 );

            // Add widget class
            this.element.addClass( C_COLLAPSIBLE );

            // Expanded / collapsed class options
            if ( o.expandedClass ) {
                this.expandedClass += " " + o.expandedClass;
            }
            if (o.collapsedClass ) {
                this.collapsedClass += " " + o.collapsedClass;
            }

            /*
             * Heading, first found element in widget matching the 'heading' option selector
             */
            this.heading$ =  this.element.find( o.heading ).first();
            this.heading$.addClass( C_COLLAPSIBLE_HEADING );

            /*
             * Controlling element is the first element in the widget, matching the 'controllingElement' option selector
             */
            this.controllingElement$ = this.element.find( o.controllingElement ).first();

            // If the controlling element has no text, label it with the heading text for accessibility
            if ( !this.controllingElement$.text() ) {

                // In order to use heading as label, need to ensure an ID is present
                lHeadingId = this.heading$[ 0 ].id;
                if ( !lHeadingId ) {

                    // If heading does not have an ID, set it
                    lHeadingId = this.baseId + "_heading";
                    this.heading$[ 0 ].id = lHeadingId;
                    this.isHeadingIdSetByWidget = true;
                }

                // Finally let's label it with the heading
                this.controllingElement$.attr( "aria-labelledby", lHeadingId );
            }


            /*
             * The main content that is expanded / collapsed
             */
            if ( !o.universalTheme ) {
                if ( !o.content ) {

                    // If content option is not set, use the next element after heading
                    this.content$ = this.heading$.next();
                } else {

                    // If content option is set, get the first matching element
                    this.content$ = this.element.find( o.content ).first();
                }
            } else {
                this.content$ = o.content;
            }
            this.content$.addClass( C_COLLAPSIBLE_CONTENT );

            // Set content ID, if it's not already set (Note: needs explicit ID because of aria-controls association)
            lContentId = this.content$[ 0 ].id;
            if ( !lContentId ) {

                // If content element does not have an ID, default it
                lContentId = this.baseId + "_content";
                this.content$[ 0 ].id = lContentId;
                this.isContentIdSetByWidget = true;
            }


            // Now that we know the content ID, we can setup controlling element with ARIA controls, and do the other
            // additional controlling element elements / attributes at the same time.
            this.controllingElement$
                .attr( A_CONTROLS, lContentId )
                .attr( A_EXPANDED, ( !o.collapsed ) );

            // Determine if controlling element is a link
            if ( this.controllingElement$.is( "a" ) ) {
                this.isControllingElementALink = true;
            }

            out.markup( "<span" )
                .attr( "class", C_ICON_COLLAPSIBLE )
                .attr( "aria-hidden", true )
                .markup( ">" )
                .markup( "</span>" );
            this.controllingElement$.prepend( out.toString() );

            // If controlling element is a link we need to make it behave like a button to get around an issue where
            // JAWS incorrectly reports the aria-expanded state.
            if ( this.isControllingElementALink ) {
                // Make it a synthetic button
                this.controllingElement$.attr( "role", "button" );

                // And add SPACE key activation to emulate button behaviour
                this._on( this.controllingElement$, {
                    "keypress": function( pEvent ) {
                        if ( pEvent.which === $.ui.keyCode.SPACE ) {
                            me.core.toggle();
                            pEvent.preventDefault();
                        }
                    }
                });
            }

            this.core = ToggleCore({
                key: me.baseId,
                controllingElement: this.controllingElement$,
                content:  me.element,
                contentClassExpanded: this.expandedClass,
                contentClassCollapsed: this.collapsedClass,
                defaultExpandedPreference: !o.collapsed,
                useSessionStorage: false,
                onExpand:  function() {
                    me.content$.attr( A_HIDDEN, "false" );
                    if ( o.doCollapse ) {
                        me.content$.show();
                    }
                    me.controllingElement$.attr( A_EXPANDED, "true" );
                    me._trigger( "expand" );
                },
                onCollapse: function () {
                    me.content$
                        .attr( A_HIDDEN, "true" );
                    if ( o.doCollapse ) {
                        me.content$.hide();
                    }
                    me.controllingElement$.attr( A_EXPANDED, "false" );
                    me._trigger( "collapse" );
                }
            });
            this.core.initialize();

        },

        _destroy: function() {
            this.element.removeClass( C_COLLAPSIBLE + " " +  this.collapsedClass  + " " + this.expandedClass );
            this.controllingElement$.removeAttr( A_EXPANDED ).removeAttr( A_CONTROLS );
            this._off( this.controllingElement$ );
            if ( this.isContentIdSetByWidget ) {
                this.content$.removeAttr( "id" );
            }
            if ( this.isHeadingIdSetByWidget ) {
                this.heading$.removeAttr( "id" );
            }
            this.heading$.removeClass( C_COLLAPSIBLE_HEADING );
            this.content$
                .removeAttr( A_HIDDEN )
                .removeClass( C_COLLAPSIBLE_CONTENT );
            if ( this.options.doCollapse ) {
                this.content$.show();
            }
        },

        /* Public methods */
        expand: function() {
            this.core.expand();
        },
        collapse: function() {
            this.core.collapse();
        },
        toggle: function() {
            this.core.toggle();
        },
        getCore: function() {
            return this.core;
        }
    });

})( apex.jQuery, apex.lang, apex.util );
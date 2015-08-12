/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright © 2014, Oracle. All rights reserved.
 */

/**
 * Jquery UI Widget to stick certain "widgets" on the screen.
 *
 * Sample usage:
 *  $("aside").stickyWidget({toggleHeight: true}); // A toolbar on the right
 *  $(".a-IRR-toolbar").stickyWidget({toggleWidth: true}); // A toolbar on top
 *
 * NOTE: The "fixed" element in this documentation refers to the element that wants to be stuck and stuck.
 *       The "replacement" element refers to an empty div which is inserted after the element and has the exact same
 *       height and width as the fixed element. It is revealed and hidden when the fixed element is stuck and unstuck.
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 */

/*global apex*/
(function( $, lang, util, undefined ) {
    var zIndex = 300;
    var overrideScrollParent$;
    "use strict";
    $.widget("apex.stickyWidget", { //stickyWidget
        version: "5.0",
        widgetEventPrefix: "stickyWidget",
        stuck: false,  // Simple boolean an variable to keep track of this sticky widget's stuck/unstuck state.
        stuckToBottom: false,
        cssWidth: 0,   // Store the default CSS width for the element.
                        // This value is final (set in the constructor and not changed again)
        cssHeight: 0,  // Store the default CSS width for the element.
                        // This value is final (set in the constructor and not changed again)
        unstuckWidth : 0, // This is the width that the replacement will use to make sure that the page is not offset incorrectly.
        unstuckHeight: 0, // This is the height that the replacement will use to make sure that the page is not offset incorrectly.
        options: {
            "zIndexStart": -1,
            "toggleHeight": false, // Does the width or height of the shape need to be toggled? In some cases,
            // the width or height of the fixed container must be calculated with javascript
            // since the original bounds will no longer apply to its fixed position.
            "toggleWidth": false,
            "top": function() {
                return apex.theme.defaultStickyTop();
            }, //Where should the fixed widget  be stuck to? Typically it's the very top of the screen (thus the default is 0)
            //To use a dynamic value instead, just pass in a function that will return an integer of some kind.
            "bottom": function() {
                var parent$ = $(this.element).parent();
                var top = parent$.offset().top;
                if ( !this.isWindow ) {
                    top -= this.scrollParent$.offset().top - this.scrollParent$.scrollTop();
                }
                return top + parent$.outerHeight();
            },
            "stickToBottom": false,
            "onStick": function () {},
            "onUnstick": function () {},
            "useWindow": true
        },
        _stickToBottom: function() {
            if (this.stuckToBottom) {
                return;
            }
            //console.log("STICKING TO BOTTOM" + this.element.text());
            this.stuckToBottom = true;
            var element = this.element;
            var bottom = this.options.bottom.call(this);
            var top = element.parent().parent().offset().top;
            if ( !this.isWindow ) {
                top -= this.scrollParent$.offset().top - this.scrollParent$.scrollTop() - this.options.top();
            }
            var height = element.outerHeight();
//            console.log(bottom + " " + top + " " + height);
            var newTop = bottom - top - height;
            element.css("top",  newTop);
            element.css("position", "absolute");
        },
        _unstickFromBottom: function() {
            if (!this.stuckToBottom) return;
            //console.log("UNSTICKING FROM BOTTOM" + this.element.text());
            this.stuckToBottom = false;
            if (this.stuck) {
                this.stuck = false;
                this._stick();
            } else {
                this.stuck = true;
                this._unstick();
            }
        },
        /**
         * Stick the widget to the top of the screen, where top is defined by the number or function passed in
         * as an option.
         *
         * @private
         */
        _stick: function() {
            if (this.stuck) return;
            //console.log("STICKING " + this.element.text());
            var element = this.element;
            element.addClass("is-stuck");
            this.redoTop( true );
            this.stuck = true;
            if (this.options.toggleHeight) element.css("height", this.unstuckHeight);
            if (this.options.toggleWidth) element.css("width", this.unstuckWidth);
            this.options.onStick();
        },
        /**
         * "Un"-stick the widget from the top of the screen.
         * @private
         */
        _unstick: function() {
            if (!this.stuck) return;
            //console.log("UNSTICKING " + this.element.text());
            var element = this.element;
            element.removeClass("is-stuck");
            element.css("position", "absolute"); //TODO: Should we assume that the widget's position can be made relative?
            element.css("top", "auto");
//            if (!this.isWindow) {
//                this.replacement.before(element);
//            }
//            this.replacement.hide();
            this.stuck = false;
            // Reset the height and weight, if either were toggled, back to their CSS defaults.
            this._revertToCssWidthAndHeight();
            // Recalculate the width and height of the fixed element.
            this._recalculateFixedStuckDimensions();
            this.options.onUnstick();
        },
        _revertToCssWidthAndHeight: function() {
            if (this.options.toggleHeight) {
                this.element.css("height", this.cssHeight);
            }
            if (this.options.toggleWidth) {
                this.element.css("width", this.cssWidth);
            }
        },
        redoTop: function( force ) {
            // if the element is not stuck, the top should not be recalculated unless, it's being
            // forced by the  unstick.
            if ( (!this.stuck || this.stuckToBottom) && !force ) {
                return;
            }
            this.element.css( "position" , "fixed" )
                .css( "top", this.options.top() );
        },
        forceScrollParent: function( newScrollParent$ ) {
            this._destroy.call(this);
            if ( newScrollParent$ && newScrollParent$.length > 0) {
                overrideScrollParent$ = newScrollParent$;
            } else {
                overrideScrollParent$ = null;
            }
            this.stuck = false;
            this._create.call(this);
        },
        /**
         *  Should only be called when the element is not stuck, otherwise you'll get incorrect dimensions!
         * @private
         */
        _recalculateFixedStuckDimensions: function() {
            if (this.stuck) return;
            this.unstuckWidth = this.element.outerWidth();
            this.unstuckHeight = this.element.outerHeight();
        },
        _setupDimensions: function() {
            this._revertToCssWidthAndHeight();
            // The replacement element should always by the elements outerWidth and outerHeight, no exceptions/
            this.replacement
                .css("width", this.element.outerWidth())
                .css("height", this.element.outerHeight());
        },
        handler: null,
        replacement: null,
        _deferCreate: function() {
            var o = this.options;
            var replacement = this.replacement = $("<div></div>"); // The replacement element is an empty div with some styling on top.
            var element = this.element;
            if ( !overrideScrollParent$ ) {
                this.scrollParent$ = element.scrollParent();
                if ( o.useWindow ) this.scrollParent$ = $( window );
            } else {
                this.scrollParent$ = overrideScrollParent$;
            }
            var isWindow = this.isWindow = this.scrollParent$[0] === window;
            var scrollParent$ = this.scrollParent$;
            element.addClass("js-stickyWidget-toggle");
            if (o.zIndexStart == -1) {
                this.zIndex = zIndex++;
            } else {
                this.zIndex = o.zIndexStart;
            }
            element.css("z-index", this.zIndex);
            replacement.insertAfter(element); // The replacement will not offset correctly if you use append or prepend!
            var me = this;
            this._recalculateFixedStuckDimensions();
            // Store the cssHeight and cssWidth in case we need to toggle the width and height.
            this.cssHeight = element.css("height");
            this.cssWidth = element.css("width");
            this._setupDimensions();
            //On scroll, check if the elements to be stucked or unstuck!
            this.scrollHandler = function () {
                var offset = scrollParent$.scrollTop() + o.top();
                if ( o.stickToBottom ) {
                    var bottom = offset + element.outerHeight();
                    var stick = o.bottom.call( me );
                    if (bottom >= stick) {
                        me._stickToBottom.call( me );
                        return;
                    } else {
                        me._unstickFromBottom.call( me );
                    }
                }
                // This would be an expensive calculation if it wasn't for _stick and _unstick's "stuck" guard.
                var replacementTop = replacement.offset().top;
                if ( !isWindow ) replacementTop += scrollParent$.scrollTop();
                if ( offset >= replacementTop ) {
                    me._stick();
                } else if (offset < replacementTop) {
                    me._unstick();
                }
            };
            this.resizeHandler = function() {
                me._destroy.call(me);
                me.stuck = false;
                me._create.call(me);
            };
            scrollParent$.on( "scroll", this.scrollHandler);
            $( window ).on( "apexwindowresized" , this.resizeHandler );
            element.on( "forceresize" , this.resizeHandler );
            element.css( "position" ,  "absolute" );
            element.css( "top" , "auto" );
            this.scrollHandler();
        },
        _createDebouncer: null,
        _create: function () {
            var me = this;
            if (this._createDebouncer) clearTimeout(this._createDebouncer);
            this._createDebouncer = setTimeout( function() {
                me._deferCreate.call(me);
            }, 500);
        },
        _destroy: function () {
            this.scrollParent$.off("scroll", this.scrollHandler);
            $(window).off("apexwindowresized", this.resizeHandler);
            this.element.off("forceresize", this.resizeHandler);
            this.replacement.remove();
            this.element.removeAttr("style");
            //TODO: Determine if the sticky widget will ever want to be removed from a page during run time.
        }

    });
})( apex.jQuery, apex.lang, apex.util );
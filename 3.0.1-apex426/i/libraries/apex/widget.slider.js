/**
 * @fileOverview
 * The slider namespace is used for the Slider widget of Oracle Application Express.
 **/

/**
 * @namespace = apex.widget.slider
 **/
(function( widget, $ ) {

widget.slider = function( pPageItemId ) {

    if ( $.mobile ) {
        widget.initPageItem( pPageItemId, {
            enable:      function() {
                             $( this.node ).slider( "enable" );
                         },
            disable:     function() {
                             $( this.node ).slider( "disable" );
                         },
            afterModify: function() {
                             $( this.node ).slider( "refresh" );
                         }
            });
    }

}; // slider

})( apex.widget, apex.jQuery );
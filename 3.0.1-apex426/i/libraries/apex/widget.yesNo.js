/**
 * @fileOverview
 * The {@link apex.widget}.yesNo is used for the Yes/No widget of Oracle Application Express.
 **/

(function( widget, $ ) {

/**
 * @param {DOM node | String} pPageItemId APEX page item identified by its name/DOM ID or the entire DOM node.
 *
 * @function yesNo
 * @memberOf apex.widget
 * */
widget.yesNo = function( pPageItemId ) {

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

}; // yesNo

})( apex.widget, apex.jQuery );

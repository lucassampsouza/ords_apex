/*global apex*/

/**
 * @fileOverview
 * The {@link apex}.security namespace is used to store all security functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.security = {};

(function( security, $, undefined ) {
    "use strict";

/**
 * Method to prevent "Clickjacking" for browsers which don't support the X-FRAME-OPTIONS header yet.
 * See https://www.owasp.org/index.php/Clickjacking
 *
 * @param {String} [pMode] Can contain the values S (Same Domain) or D (Deny) and is used to check if the current
 *                         page can be embedded into an iFrame.
 *
 * @function framebreaker
 * @memberOf apex.security
 **/
security.framebreaker = function( pMode ) {
    if (    self != top
         && (   ( pMode == null || pMode === "D" )
             || ( pMode === "S" && top.location.host != self.location.host )
            )
       ) {
        // Hide and overwrite the current document and try to refresh the parent page of the iFrame with the
        // URL of the iFrame.
        document.documentElement.style.visibility = 'hidden';
        $( function() {
            document.write( "X" );
        } );
        top.location = self.location;
    } else {
        document.documentElement.style.visibility = 'visible';
    }
}; // framebreaker

})(apex.security, apex.jQuery);

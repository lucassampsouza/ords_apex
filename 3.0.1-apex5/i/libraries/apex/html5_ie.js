/**
 * Conditional script to be included on pages that use HTML5 markup, must be compatible with IE8 (or below) AND
 * Do not require modernizr.js
 *
 * If modernizr.js is needed, you should include that script and remove this script from your page.
 *
 * Please note that you should have this script included with a IE conditional, like so:
 * <!--[if lt IE 9]><script src="#IMAGE_PREFIX#libraries/apex/html5_ie.js"></script><![endif]-->
 */
(function() {
    //Use a closure to ensure this variable name does not get picked up anywhere!.
    var e = ("abbr,article,aside,audio,canvas,datalist,details,figure,footer,header,hgroup,main,mark,menu,meter,nav,output,progress,section,time,video,figcaption,summary").split(',');
    for (var i = 0; i < e.length; i++) {
        document.createElement(e[i]);
    }
})();
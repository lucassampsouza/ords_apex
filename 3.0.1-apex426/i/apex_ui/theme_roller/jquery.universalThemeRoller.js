/*var utr = {
    busy: false,
    opened: false,
    invoke: undefined,
    close: undefined,
    nested: false
};*/

(function($, server, utr){

    var utr = apex.utr;

    var BUILDER_WINDOW_NAME = "APEX_BUILDER"; // keep in sync with builder.js

    function isOpenerApexBuilder() {
        // if *this* is the builder window then don't care what the opener is
        // a builder opening the builder can result in a stale instance without this check
        if ( isBuilderWindow() ) {
            return false;
        }
        try {
            // builder urls are in the 4000s
            if ( window.opener && !window.opener.closed && window.opener.apex &&
                window.opener.apex.jQuery &&
                ( window.opener.location.href.match(/f?p=4\d\d\d:/) || window.opener.document.getElementById("pFlowId") ) ) {
                return true;
            }
        } catch ( ex ) {
            return false; // window must contain a page from another domain
        }
        return false;
    }

    function isBuilderWindow() {
        return window.name && window.name.match( "^" + BUILDER_WINDOW_NAME );
    }

    function getBuilderInstance() {
        if ( isOpenerApexBuilder() ) {
            return window.opener.document.getElementById("pInstance").value;
        }
        return null;
    }



    var requiredFilesImported = false;
    var apexDeveloperToolbarButtonInjected = false;
    var apexDeveloperToolbarButton = null;
    
    var defaultOptions = {
        filePaths: {
            utStylesheet: "less/ut.less",
            themeStylesheets: ["less/ut.less"],
            lessCompilerScript: "js/less.js",
            utrStylesheet: "css/utr.css",
            utrScript: "js/utr.js",
            //colorPickerStylesheet: "js/colorpicker/css/colorpicker.css",
            //colorPickerScript: "js/colorpicker/js/colorpicker.js",
            jQueryUiComponentsScript: "js/jquery-ui.utr.js",
            codeMirrorScript: "js/codemirror/lib/codemirror.js",
            codeMirrorCSSModeScript: "js/codemirror/mode/css/css.js",
            codeMirrorStylesheet: "js/codemirror/lib/codemirror.css",
            d3Script: "js/d3/d3.min.js",
            //BEGIN SHIPIT
            d3ColorPickerScript: "js/d3.oracle.colorpicker.js",
            d3ColorPickerStylesheet: "css/d3.oracle.colorpicker.css",
            d3PaletteScript: "js/d3.oracle.palette.js",
            d3PaletteStylesheet: "css/d3.oracle.palette.css"
            //END SHIPIT
        }, 
        config: {
            themeId: 42,
            builderSessionId: getBuilderInstance(),
            standalone: false,
            nested: false
        }
    };
    var options = defaultOptions;
    var stylesheetCache = {};

    $.universalThemeRoller = $.universalThemeRoller || function(){
        var utrArguments = arguments;
        var firstArgumentType = typeof utrArguments[0];

        function _init(userOptions){
            userOptions = typeof userOptions === "undefined" ? {} : userOptions;
            
            options = $.extend(true, {}, defaultOptions, userOptions);
            
        }
        function _open(){
            utr.invoke.apply(this, Array.prototype.slice.call(utrArguments, 1, 4));
        }
        function _close(){
            utr.close();
        }

        function _importStylesheet(url, importAsLessStylesheet){
            if(typeof importAsLessStylesheet === "undefined"){
                importAsLessStylesheet = false;
            }

            $(document.createElement("link")).attr({
                rel:"stylesheet" + (importAsLessStylesheet ? "/less" : ""),
                type:"text/css",
                href:url
            }).appendTo("head");
        }

        function _importStylesheetSet(urls, callback, callback2){
            var results = [];
            if (urls && urls.length > 0) {
                for (var i = urls.length - 1; i >= 0; i--) { 
                    results[i] = undefined;
                    if (stylesheetCache[urls[i]]) {
                        results[i] = stylesheetCache[urls[i]];

                        var done = true;
                        for (var j = results.length - 1; j >= 0; j--) {
                            if (results[j] === undefined) {
                                done = false;
                                break;
                            } 
                        }

                        if (!done) {
                            continue;
                        } else {
                            callback && callback(results.join('\n'));
                        }

                    } else {
                        $.get(urls[i], $.proxy(function(data){
                            results[this.i] = stylesheetCache[urls[this.i]] = data;
                            for (var j = results.length - 1; j >= 0; j--) {
                                if (results[j] === undefined) return; 
                            }
                            callback && callback(results.join('\n'));

                        }, {i:i}))
                        .fail(function(){
                            callback2 && callback2({ status: 404 });
                        });
                    }
                }
            } else {
                callback && callback(null);
            }
        }
        function _importRequiredFiles(callback){
            if ( !requiredFilesImported ) {
                less = {
                    env: "production",
                    logLevel: 0,
                    omitComments: true
                };
                $.getScript(options.filePaths.jQueryUiComponentsScript, function(){
                    $.getScript(options.filePaths.lessCompilerScript, function(){
                        $.getScript(options.filePaths.codeMirrorScript, function(){
                            _importStylesheet(options.filePaths.codeMirrorStylesheet);
                            _importStylesheet(options.filePaths.codeMirrorThemeStylesheet);
                            $.getScript(options.filePaths.codeMirrorCSSModeScript, function(){
                                $.getScript(options.filePaths.d3Script, function(){
                                    $.getScript(options.filePaths.d3PaletteScript, function(){
                                        _importStylesheet(options.filePaths.d3PaletteStylesheet);
                                        $.getScript(options.filePaths.d3ColorPickerScript, function(){
                                            _importStylesheet(options.filePaths.utrStylesheet);
                                            _importStylesheet(options.filePaths.d3ColorPickerStylesheet);
                                            $.getScript(options.filePaths.utrScript, function(){
                                                requiredFilesImported = true;
                                                callback();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                callback();
            }
        }


        function chunk(content) {
            var r = [];
            while (content.length > 4000) {
                r.push(content.substr(0, 4000));
                content = content.substr(4000);
            }
            r.push(content);
            return r;
        }

        function _getThemeStyles(callback, callback2){
            if (!options.config.standalone) {

                server.process("theme_roller", {
                    p_flow_id:      4000,
                    p_flow_step_id: 0,
                    p_instance:     options.config.builderSessionId,
                    p_debug:        "NO",
                    x01:            "get_styles",
                    x02:            $v("pFlowId"),
                    x03:            options.config.themeId
                }, {
                    success: function(pData) {
                        callback && callback(pData);
                    }, 
                    error: function(pData) {
                        callback2 && callback2(pData);
                    }
                });
            } else {
                callback([{
                    "id":"static",
                    "name":"Static",
                    "isCurrent":true,
                    "isReadOnly":false,
                    "cssFileUrls":[],
                    "inputFileUrls":options.config.lessFiles,
                    "outputFileUrls":[]
                },{
                    "id":"static2",
                    "name":"Static 2",
                    "isCurrent":false,
                    "isReadOnly":false,
                    "cssFileUrls":[],
                    "inputFileUrls":options.config.lessFiles2,
                    "outputFileUrls":[]
                }]);
            }
        }

        function _createThemeStyle(baseStyleId, styleName, config, styleCSS, callback, callback2) {
            if (!options.config.standalone) {
                server.process("theme_roller", {
                    p_flow_id:      4000,
                    p_flow_step_id: 0,
                    p_instance:     options.config.builderSessionId,
                    p_debug:        "NO",
                    x01:            "create_style",
                    x02:            $v("pFlowId"),
                    x03:            options.config.themeId,
                    x04:            baseStyleId,
                    x05:            styleName,
                    x06:            JSON.stringify(config),
                    f01:            chunk(styleCSS)
                }, {
                    success: function(pData) {
                        callback && callback(pData);
                    },
                    error: function(pData) {
                        callback2 && callback2(pData);
                    }
                });
            } else {
                callback && callback({});
            }
        }

        function _updateThemeStyle(styleId, styleName, config, styleCSS, callback, callback2) {
            if (!options.config.standalone) {
                server.process("theme_roller", {
                    p_flow_id:      4000,
                    p_flow_step_id: 0,
                    p_instance:     options.config.builderSessionId,
                    p_debug:        "NO",
                    x01:            "update_style",
                    x02:            $v("pFlowId"),
                    x03:            options.config.themeId,
                    x04:            styleId,
                    x05:            styleName,
                    x06:            JSON.stringify(config),
                    f01:            chunk(styleCSS)
                }, {
                    success: function(pData) {
                        callback && callback(pData);
                    },
                    error: function(pData) {
                        callback2 && callback2(pData);
                    } 
                });
            } else {
                callback && callback({});
            }
        }

        function _setAsCurrentTheme(styleId, callback, callback2) {
            if (!options.config.standalone) {
                server.process( "theme_roller", {
                    p_flow_id:      4000,
                    p_flow_step_id: 0,
                    p_instance:     options.config.builderSessionId,
                    x01:            "set_current_style",
                    x02:            $v( "pFlowId" ),
                    x03:            options.config.themeId,
                    x04:            styleId
                }, {
                    success: function (pData ) {
                        callback && callback( pData );
                    },
                    error: function( pData ) {
                        callback2 && callback2( pData );
                    }
                });
            } else {
                callback && callback({});
            }
        }

        if(firstArgumentType === "object" || firstArgumentType === "undefined") {
            _init(utrArguments[0]);
        } else if(firstArgumentType === "string") {
            switch(utrArguments[0]){
                case "open":
                    if (!utr.busy) {
                        if (!utr.opened) {
                            var lSpinner$ = apex.util.showSpinner();
                            var load = function() {
                                _open();
                                setTimeout(function() {
                                    lSpinner$.remove();
                                }, 1500);
                            };
                            _importRequiredFiles(load);

                        } else {
                            //TODO UTR is already opened. New settings were not applyed. Close the dialog and open it with the new settings
                        }
                    }
                    break;
                case "close":
                    if (!utr.busy) {
                        if (utr.opened) {
                            _close();
                        } else {
                            //TODO UTR is already closed.
                        }
                    } 
                    break;
                case "getStylesheets":
                    _importStylesheetSet(utrArguments[1], utrArguments[2], utrArguments[3]);
                    break;
                case "getThemeStyles": 
                    _getThemeStyles(utrArguments[1], utrArguments[2], utrArguments[3], utrArguments[4], utrArguments[5], utrArguments[6]);
                    break;
                case "createThemeStyle": 
                    _createThemeStyle(utrArguments[1], utrArguments[2], utrArguments[3], utrArguments[4], utrArguments[5], utrArguments[6]);
                    break;
                case "updateThemeStyle":
                    _updateThemeStyle(utrArguments[1], utrArguments[2], utrArguments[3], utrArguments[4], utrArguments[5], utrArguments[6]);
                    break;
                case "setThemeStyleAsCurrent":
                    _setAsCurrentTheme(utrArguments[1], utrArguments[2], utrArguments[3]);
                    break;
            }
        } else {
            //TODO invalid number or type of arguments passed
        }
    };
})(apex.jQuery, apex.server, apex.utr);
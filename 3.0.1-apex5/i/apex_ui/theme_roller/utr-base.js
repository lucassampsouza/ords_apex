(function(utr) {
    if (!utr) {
        utr = window.apex.utr = {
            busy: false,
            opened: false,
            invoke: undefined,
            close: undefined,
            nested: false
        };
    }
    function getCustomCSSOutput() {
        return $('style[id="utr_custom-css-output"]').html();
    }
    function getLessOutput() {
        return $('style[id="utr_less-output"]').html();
    }
    function setCustomCSSOutput(output) {
        var utrCustomCSSOutput = $('style[id="utr_custom-css-output"]');
        if(utrCustomCSSOutput.length > 0){
            utrCustomCSSOutput.empty();
        } else {
            utrCustomCSSOutput = $(document.createElement("style"))
                .attr("id", "utr_custom-css-output");
            $('link[media="utr-disabled"], style[id="utr_less-output"]').last()
                .after(utrCustomCSSOutput);
        }
        utrCustomCSSOutput.text(output);
        propagate('setCustomCSSOutput', output);
    }
    function destroyCustomCSSOutput() {
        $('style[id="utr_custom-css-output"]').first().remove();
        propagate('destroyCustomCSSOutput');
    }
    function setLessOutput(output) {
        var lessOutput = $('style[id="utr_less-output"]');
        var lastDisabledStylesheet = $('link[media="utr-disabled"]').last();
        if (lessOutput.length > 0) {
            lessOutput.empty();
        } else {
            lessOutput = $(document.createElement("style"))
                .attr("id", "utr_less-output");
            if (lastDisabledStylesheet.length > 0) {
                lastDisabledStylesheet.after(lessOutput);
            } else {
                $('head').append(lessOutput);
            }
        }
        lessOutput.html(output);
        propagate('setLessOutput', output);
    }
    function destroyLessOutput() {
        $('style[id="utr_less-output"]').first().remove();
        propagate('destroyLessOutput');
    }
    function enableCurrentStylesheets(urls) {
        if (urls === undefined) {
            urls = currentThemeStylesheets;
        }
        $('link')
            .filter(function(i, e) {
                return urls.indexOf($(e).attr('href')) >= 0;
            })
            .removeAttr("media");
        propagate('enableCurrentStylesheets', urls);
    }
    var LCSURLS;
    function disableCurrentStylesheets(urls) {
        if (urls === undefined) {
            urls = currentThemeStylesheets;
        }
        LCSURLS = urls;
        $('link')
            .filter(function(i, e) {
                return urls.indexOf($(e).attr('href')) >= 0;
            })
            .attr("media", "utr-disabled");
        propagate('disableCurrentStylesheets', urls);
    }
    var LISURLS;
    function importStyleSheets(urls) {
        LISURLS = urls;
        var l;
        var insertBefore = $('link[media="utr-disabled"], style[id="utr_less-output"]').first();
        for (var i = 0; i < urls.length; i++) {
            l = $(document.createElement('link'))
                .attr({
                    'rel': 'stylesheet',
                    'href': urls[i],
                    'class': 'utr-stylesheet'
                });
            if (insertBefore.length > 0) {
                insertBefore.before(l);
            } else {
                $('head').append(l);
            }
        }
        propagate('importStyleSheets', urls);
    }
    function removeStylesheets() {
        $('link.utr-stylesheet').remove();
        propagate('removeStylesheets');
    }
    utr.setCustomCSSOutput = setCustomCSSOutput;
    utr.setLessOutput = setLessOutput;
    utr.destroyCustomCSSOutput = destroyCustomCSSOutput;
    utr.destroyLessOutput = destroyLessOutput;
    utr.enableCurrentStylesheets = enableCurrentStylesheets;
    utr.disableCurrentStylesheets = disableCurrentStylesheets;
    utr.importStyleSheets = importStyleSheets;
    utr.removeStylesheets = removeStylesheets;
    utr.children = [];
    utr.nest = function(child) {
        if (utr.children.indexOf(child) < 0) {
            utr.children.push(child);
            child.opened = utr.opened;
            if (utr.opened) {
                propagate('disableCurrentStylesheets', LCSURLS);
                propagate('importStyleSheets', LISURLS);
                propagate('setLessOutput', getLessOutput());
                propagate('setCustomCSSOutput', getCustomCSSOutput());
            }
        }
    };
    function propagate(fn, args) {
        for (var i = utr.children.length - 1; i >= 0; i--) {
            utr.children[i][fn](args);
        }
    }
})( window.apex.utr );

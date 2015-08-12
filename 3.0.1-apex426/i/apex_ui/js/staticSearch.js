
/*!
 Copyright (c) 2014, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Universal full-text search plugin for json arrays of key-value object literals.
 * Supports Text, Tag and HTML parsing. See the options below for more details.
 * DO NOT USE IN PRODUCTION JUST YET. Various features like XSS protection, aria attributes are not yet implemented.
 *
 */
var staticSearch = function () {

    // Make sure that the browser supports two core string and array operations. (Internet explorer 8)
    if(typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        }
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(elt /*, from*/)
        {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++)
            {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    /**
     * Static Search template example.
     *
     * Where each json record is
     *  { "LINK": ...., "NAME": ......, "SOMETHING": ...... }
     *
     *
     * A search result template that uses the "LINK" attribute as the link for anchor tag, and
     * the "TITLE" attribute as that anchor's tags uses the following syntax.
     *
     * <div><a href="#%LINK#%">#%NAME#%</a></div>.
     *
     * Alternatively, to just show all the attributes on seperate lines:
     *
     * <div> #%LINK#% <br/> #%NAME#%  <br/> #%SOMETHING#% </div>.
     *
     * Notice that these attributes are prefixed and postfixed with a "#%". If staticSearch cannot find the attribute
     * listed in your template, it will remove the tag when showing it to the user.
     *
     */



    /*
     * @param searchId, the jQuery id or class name of the search field.
     * @param searchResultsId, the jQuery search container that the results should be placed in.
     * @param pDataset, the dataset that will be searched upon.
     * @param pOptions, an object literal configuring the way the search run and displays results to the user.
     */
    var initialize = function(searchId, searchResultsId, pDataset, pOptions) {
        /**
         * May be subject to change in the near future.
         */
        var options = jQuery.extend( {},
            {

                mapping:  {},   // Which fields should be searched and what priority should they each have?
                                // For example, with a json data set that has the keys "NAME", "DESCRIPTION", "TITLE"
                                // you would need to supply a mapping like:
                                // {
                                //  "NAME": {
                                //      "priority":3,
                                //  },
                                //  "DESCRIPTION": {
                                //      "priority":2,
                                //      "html": true
                                //  }
                                //  "TITLE": {
                                //      "priority": 4
                                //  }
                                // }
                                // in order to rank search terms that appear in the title first, followed by name,
                                // followed by description.
                                //
                                // Note that the only required key for each search field is priority. All others are optional
                                // and will default to 'false' if not included.

                                // html
                                // Defines what should be parsed as HTML
                                // (in other words, ignore "<" ">" tags).

                                // tags
                                // Defines what should be parsed as space-delimited tags.

                filterEmpty: true, // Should the staticSearch plugin NOT show results when the search field is empty?

                limit: 5,       // How many results should the staticSearch plugin display at once?

                onEmptySearch: function () {}, // Callback for when the search field is empty

                onActiveSearch: function() {}, // Callback for when the search field has a query in it.

                getSearchResultAsHtml: function (item) {            // Call back for presenting a result to the user.
                    return getHtmlWithTemplate(item, template);     // Pass in your own getSearchResultsAsHtml
                                                                    // to override this functionality.
                },
                template: 'PASS IN A TEMPLATE HERE'                 // Supply a well-formed staticSearchTemplate.

            },
            pOptions
        );
        limit = options.limit;
        filterEmpty = options.filterEmpty;
        htmlMapping = [];
        tagMapping = [];
        priorityMapping = {};
        for (key in options.mapping) {
            priorityMapping[key] = options.mapping[key].priority;
            if (options.mapping["html"]) {
                htmlMapping.push(key);
            }
            if (options.mapping["tag"]) {
                tagMapping.push(key);
            }
        }
        onActiveSearch = options.onActiveSearch;
        onEmptySearch = options.onEmptySearch;
        getSearchResultAsHtml = options.getSearchResultAsHtml;
        template = options.template;
        search$ = $( searchId );
        search$.on("keydown", function(e) {
            inputSearch();
            var code = e.keyCode || e.which;
            if( code === 13 ) { //Enter keycode
                e.preventDefault();
            }
        });
        $(window).on('hashchange', function() {
            onHashChange();
        });
        searchResults$ =  $(searchResultsId);
        search$.focus();
        dataset = pDataset;
        applyHtmlMapping();
        splitTagsInDataset( options.tagMapping );
        clearSearch$ = $( '<button type="button" class="ls-Search-clear" id="clear_static_search_field" value="Clear Search" title="Clear Search"></button>' );
        clearSearch$.click(function () {
            location.hash = "#";
            clearSearch$.removeClass("is-enabled");
            onHashChange();
        });
        search$.after(clearSearch$);
        if ( !filterEmpty && location.hash == "" ) {
            previousSearch = "asfddaffd";
            location.hash = "#"
        }
        onHashChange();

    };

    function highlightSearchResult(item) {
        for (key in item) {
            if (key in priorityMapping && key in item["_bits"]) {
                var itemBits = item["_bits"][key];
                itemBits.sort(function (a, b) {
                    if (a.replaceIndex < b.replaceIndex) return -1;
                    if (a.replaceIndex > b.replaceIndex) return 1;
                    return 0;
                });
                var itemOutput = "";
                var lastIndex = 0;
                for (var y = 0; y < itemBits.length; y++) {
                    var index = itemBits[y].replaceIndex;
                    itemOutput += item[key].slice(lastIndex, index) + itemBits[y].html;
                    lastIndex = index + itemBits[y].length;
                }
                itemOutput += item[key].slice(lastIndex);
                item[key] = itemOutput;
            }
        }
    }

    var timeout;
    var started = true;

    var searchItemAttribute = function (item, key, values, match) {
        if (!(key in item) || !(key in priorityMapping) || key.indexOf("_") == 0) {
            return 0;
        }
        //TODO: Determine which block is faster, the commented block is more intuitive but it seems faster to do a JS slice than a split.
//        var recursivelyExplode = function(exploded, values, index, highlight) {
//            if (index >= values.length) {
//                if (exploded instanceof Array) {
//                    match[index] = 0;
//                    return exploded.join(highlight);
//                } else {
//                    return exploded.replace(values[index - 1], highlight);
//                }
//            }
//            var value = values[index];
//            var html = "";
//            for (var i = 0, explodedSize = exploded.length; i < explodedSize; i++) {
//                var newExploded = exploded[i].split(value);
//                var nextHighlight = "";
//                if (newExploded.length == 1) {
//                    match[index] = 0;
//                } else {
//                    exploded[i] = newExploded;
//                    nextHighlight = "<span class='ls-Search-hotTerm'>" + value + "</span>";
//                }
//                html += (recursivelyExplode(exploded[i], values, index + 1, nextHighlight)); // Return a complete HTML array of all the component parts.
//                if (explodedSize - 1 != i) html += highlight;
//            }
//            return html;
//        };
//        var exploded = [item[key]];
//        var result = recursivelyExplode(exploded, values, 0, "");
//        item[key] = result;

        if (values.length == 1 && values[0] == "") return 1;
        if (values.length == 0) return 0;
//         console.log(key);
//         console.log(item[key]);
        var itemSearch = item[key].toLowerCase();
        if (htmlMapping.indexOf(key) != -1) {
            itemSearch = item["_" + key + "_HTML"];
//             console.log(item);
        }
        var itemBits = [];
        var valuesMatched = [];
        for (var n = 0; n < values.length; n++) {
            var searchValue = values[n];
            var replaceIndex = itemSearch.indexOf(searchValue);
            while (replaceIndex != -1) {
                var length = values[n].length;
                var value = item[key].slice(replaceIndex, replaceIndex + length);
                var sub = "";
                for (var i = 0; i < length; i++) {
                    sub += " ";
                }
                // Consume the input but keep the offset!
                itemSearch = itemSearch.slice(0, replaceIndex) + sub + itemSearch.slice(replaceIndex + length);
                itemBits.push({
                    "replaceIndex": replaceIndex,
                    "length": length,
                    "html": "<span class='u-textHighlight'>" + value + "</span>"
                });
                if (!(n in match)) match[n] = priorityMapping[key];
                replaceIndex = itemSearch.indexOf(searchValue);
            }
        }
        item["_bits"][key] = itemBits;
    };

    var previousSearch = '';

    function keywordInItem(filters, value) {
        for (var key in filters) {
            if (filters[key] == "") continue;
            if (value instanceof Array) {
                if (value.indexOf(filters[key]) == -1) {
                    return false;
                }
            } else {
                if (value.toLowerCase() != filters[key]) {
                    return false;
                }
            }
        }
        return true;
    }

    var getSpecialKeywords = function(values, searchValues, prefix) {
        var keywords = {};
        for (var y = 0; y < values.length; y++) {
            if (values[y].indexOf(prefix + ":") == 0) {
                keywords[y] = values[y].replace(prefix + ":", "").replace("+", " ").toLowerCase();
            }
        }
        //Remove the special keywords from the full text search
        for (var filterKey in keywords) {
            searchValues.splice(filterKey, 1);
            values.splice(filterKey, 1);
        }
        return keywords;
    };

    function removeDuplicatesInArray(array) {
        var arr = [];
        for(var i = 0; i < array.length; i++) {
            if(arr.indexOf(array[i]) === -1) {
                arr.push(array[i]);
            }
        }
        return arr;
    }

    function toLowerCaseArray(array) {
        var arr = [];
        for(var i = 0; i < array.length; i++) {
            arr.push(array[i].toLowerCase());
        }
        return arr;
    }


    function isEmpty( o ){
        for( var i in o ){
            if ( o.hasOwnProperty( i ) ) {
                return false;
            }
        }
        return true;
    }

    function sortAndGetResultsHtml( results, emptyisValid ) {
        var html = "";
        var resultLength = 0;
        if ( !emptyisValid ) {
            results.sort(function (a, b) {
                if (a.priority < b.priority) return 1;
                if (a.priority > b.priority) return -1;
                return 0;
            });
        }
        for (var i = 0, size = results.length; i < size; i++) {
            var item = results[i]["displayItem"];
            highlightSearchResult(item);
            html += getSearchResultAsHtml(item);
            resultLength++;
            if (resultLength > limit) {
                return html;
            }
        }
        return html;
    }

    function isSearchValid(searchValues) {
        var valid = false;
        for (var i = 0, size = searchValues.length; i < size; i++) {
            if (searchValues[i].length > 2) {
                valid = true;
            }
        }
        return valid;
    }


    var constructDisplayItemForSearch = function(item) {
        var displayItem = {};
        for (key in item) {
            displayItem[key] = item[key];
        }
        displayItem["_bits"] = {};
        return displayItem;
    };

    function doSearch(value) {
        fadeSearchResults();
        var values = removeDuplicatesInArray(value.split(/\s+/g));
        var searchValues = toLowerCaseArray(values);
        var emptyIsValid = !filterEmpty && values.length == 1 && values[0] == "";
        if (!isSearchValid(searchValues) && !emptyIsValid) {
            searchResults$.html("<em>" + apex.lang.getMessage("STATICSEARCH.MINIMUM_LENGTH") +  "</em>");
            return;
        }
        var i = dataset.length;
        var filterTags = getSpecialKeywords(values, searchValues, "tag");
        var filterCategories = getSpecialKeywords(values, searchValues, "category");
        var results = [];
        // This section needs to be made more performant.
        while (i >= 1) {
            i--;
            var item = dataset[i];
            var displayItem = constructDisplayItemForSearch(item);
            var match = 0;

            //// Keyword Block.
            if (!keywordInItem(filterTags, item["_split_Tags"])) {
                continue;
            } else if (!isEmpty(filterTags)) {
                match++;
            }
            if (!keywordInItem(filterCategories, item["Category"])) {
                continue;
            } // Try to match the category name?... or use a strict equal equal??
            else if (!isEmpty(filterCategories)) {
                match++;
            }

            var arr = {};
            if ( !emptyIsValid ) {
                for (var key in item) {
                    searchItemAttribute(displayItem, key, searchValues, arr);
                }
                for (var ref in arr) {
                    match += arr[ref];
                }
            } else {
                match = 1;
            }
            if (match > 0) {
//                 mergeDisplayItemWithItem(displayItem, item);
                results.push({
                    "priority": match,
                    "displayItem": displayItem
                });
            }
        }
        var output = sortAndGetResultsHtml(results, emptyIsValid);
        if (output == "") {
            output = "<em style='padding-top:10px;'>" + apex.lang.getMessage("STATICSEARCH.NO_RESULTS_FOUND") + "</em>";
        }
        unfadeSearchResults();
        searchResults$.html(output);
    }

    function setLocationHash(value) {
        var noJumpScroll = $(window).scrollTop();
        var oldLocationHash = location.hash;
        //Replace all extra whitespace characters with one space, then split these spaces, and join them with a +.
        //Split(something).join(replacement) is essentially a way to do replaceAll in JS.
        location.hash = "#" + value.replace(/\s+/g, ' ').trim().split(" ").join("+");
        if (oldLocationHash == location.hash) {
            unfadeSearchResults();
        }
        $(window).scrollTop(noJumpScroll);
    }

    function getLocationHashAsValue() {
        return location.hash.substr(1).replace(/\s+/g, ' ').split("+").join(" ").trim();
    }

    var faded = false;

    function inputSearch() {
        var value = search$.val().trim();
        if (value != previousSearch) {
            fadeSearchResults()
        }
        if (timeout != undefined) clearTimeout(timeout);
        timeout = setTimeout(function () {
            inputted = true;
            setLocationHash(search$.val())
        }, 400);
    }


    var fadeSearchResults = function() {
        if (faded) return;
        faded = true;
        searchResults$.css("opacity",.5);
    };

    var unfadeSearchResults = function() {
        if (!faded) return;
        faded = false;
        searchResults$.css("opacity", 1);
    };

    var onHashChange = function() {
        var start = new Date();
        //console.log("on hash change");
        if (!inputted) { // if the search has just been inputted, then we don't need to alter the search field.
            search$.val(getLocationHashAsValue());
        }
        inputted = false;
        if (started) {
            started = false;
        }
        var value = search$.val().trim();
        if (value == '') {
            onEmptySearch();
            clearSearch$.removeClass("is-enabled");
            if (filterEmpty) {
                previousSearch = '';
                return;
            }
        } else {
            clearSearch$.addClass("is-enabled");
            onActiveSearch();
        }
        if (value == previousSearch) return;
        previousSearch = value;
        doSearch(value);
//        console.log(new Date() - start);
    };

    var search$;
    var searchResults$;
    var inputted;
    var clearSearch$;
    var priorityMapping;
    var dataset;
    var onEmptySearch;
    var onActiveSearch;
    var getSearchResultAsHtml;
    var tagMapping;


    var splitTagsInDataset = function () {
        //This might be a premature optimization.
        var tagsToSplit = tagMapping.length;
        for (var k = 0; k < tagsToSplit; k++) {
            var tagKey = tagMapping[k];
            var splitTagKey = "_split_" + tagKey;
            var i = dataset.length - 1;
            while (i >= 0) {
                dataset[i][splitTagKey] = dataset[i][tagKey].split(",");
                var splitLength = dataset[i][splitTagKey].length;
                for (var n = 0; n < splitLength; n++) {
                    dataset[i][splitTagKey][n] = dataset[i][splitTagKey][n].trim().split(" ").join("_").toLowerCase();
                }
                i--;
            }
        }
    };

    var getHtmlWithTemplate = function (item, pTemplate) {
        if (pTemplate == undefined) pTemplate = template;
        for (var key in item) {
            var templateTag = "#%" + key + "#%";
            if (pTemplate.indexOf(templateTag) != -1) {
                pTemplate = pTemplate.split(templateTag).join(item[key]);
            }
        }
        pTemplate = pTemplate.replace(/#%[^\s]+#%/g, "");
        return pTemplate;
    };


    var template;
    var filterEmpty;
    var htmlMapping;


    var applyHtmlMapping = function () {
        for (var n = 0; n < htmlMapping.length; n++) {
            var htmlKey = "_" + htmlMapping[n] + "_HTML";
            for (var y = dataset.length - 1; y >= 0; y--) {
                var html = dataset[y][htmlMapping[n]];
                if (html == undefined) {
                    continue;
                }
                var htmlBits = html.split(".").join(" ").split(/[<.*>]/);
                var escape = false;
                if (html.charAt(0) == "<") {
                    escape = true;
                }
                var newHtml = "";
                for (var q = 0, size = htmlBits.length; q < size; q++) {
                    if (escape) {
                        newHtml += htmlBits[q];
                    } else {
                        newHtml += new Array(htmlBits[q].length + 3).join(" ");
                    }
                    escape = !escape;
                }
                newHtml = newHtml.toLowerCase();
//                 console.log(n + "========================");
//                 console.log(html);
//                 console.log("     ");
//                 console.log(newHtml);
                dataset[y][htmlKey] = newHtml;
//                 console.log(dataset[y]);
            }
        }
    };

    var limit = 5;



    return {
        "initialize": initialize,
        "template": getHtmlWithTemplate
    };


}();


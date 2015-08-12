/*global apex,CodeMirror*/
/*!
 codeEditor - a jQuery UI based widget that wraps CodeMirror
 Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * Turns a standard DIV element into a code editor for css, javascript, html and pl/sql
 *   apex.jQuery( "#myEditor" ).codeEditor({...});
 * This is a wrapper around CodeMirror but it also has a fallback mode to use a plain textarea
 * just in case there is an accessibility, performance or browser compatibility issue with CodeMirror.
 *
 * todo:
 *   disabled option/state, jQuery UI widgets have a disabled option and state. Does codeMirror support that?
 *   cache code completion results?
 *
 * Depends:
 *    codemirror-custom.min.js
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.position.js (for menu)
 *    apex/util.js
 *    apex/debug.js
 *    apex/widget.menu.js
 *    apex/lang.js
 * Depends on a number of strings prefixed with CODE_EDITOR. defined in the apex.lang message facility
 */

( function( $, util, lang, debug, undefined ) {
    "use strict";

    var C_CODE_EDITOR = "a-CodeEditor",
        C_PLAIN_TEXTAREA = "a-CodeEditor--textarea",
        C_ACTIVE = "is-active",
        C_SEARCH_BAR = "a-CodeEditor-searchBar",
        SEL_SEARCH_BAR = "." + C_SEARCH_BAR,
        C_SEARCH_REPLACE = "a-CodeEditor-replace",
        SEL_SEARCH_REPLACE = "." + C_SEARCH_REPLACE,
        C_NOTIFICATION = "a-CodeEditor-notification",
        SEL_NOTIFICATION = "." + C_NOTIFICATION,
        C_NOTIFICATION_MSG = "a-CodeEditor-message",
        SEL_NOTIFICATION_MSG = "." + C_NOTIFICATION_MSG,
        C_TOOLBAR = "a-CodeEditor-toolbar",
        SEL_TOOLBAR = "." + C_TOOLBAR,
        SEL_CODE_MIRROR = ".CodeMirror";

    var SETTINGS_OPTION_KEYS = [ "usePlainTextArea", "theme", "indentUnit", "tabSize", "indentWithTabs", "lineNumbers", "ruler" ], // don't change the order or remove an item
        KEYS   = $.ui.keyCode,
        SPACES = "                                        ", // 40 spaces used for inserting spaces for tab
        RULERS = [{ color: "#ccc", column: 80, lineStyle: "dashed" }];

    var CM_URL_BASE = "", // this "constant" gets filled in below
        CM_THEMES = [
            { name: "default", loaded: true },
            { name: "3024-day", loaded: false },
            { name: "3024-night", loaded: false },
            { name: "ambiance-mobile", loaded: false },
            { name: "ambiance", loaded: false },
            { name: "base16-dark", loaded: false },
            { name: "base16-light", loaded: false },
            { name: "blackboard", loaded: false },
            { name: "cobalt", loaded: false },
            { name: "eclipse", loaded: false },
            { name: "elegant", loaded: false },
            { name: "erlang-dark", loaded: false },
            { name: "lesser-dark", loaded: false },
            { name: "mbo", loaded: false },
            { name: "midnight", loaded: false },
            { name: "monokai", loaded: false },
            { name: "mdn-like", loaded: false },
            { name: "neat", loaded: false },
            { name: "neo", loaded: false },
            { name: "night", loaded: false },
            { name: "paraiso-dark", loaded: false },
            { name: "paraiso-light", loaded: false },
            { name: "pastel-on-dark", loaded: false },
            { name: "rubyblue", loaded: false },
            { name: "solarized dark", fileName: "solarized", loaded: false },
            { name: "solarized light", fileName: "solarized", loaded: false },
            { name: "the-matrix", loaded: false },
            { name: "tomorrow-night-eighties", loaded: false },
            { name: "twilight", loaded: false },
            { name: "vibrant-ink", loaded: false },
            { name: "xq-dark", loaded: false },
            { name: "xq-light", loaded: false }
        ];

    function msg( key ) {
        return lang.getMessage( key );
    }

    // functions for text area mode

    function insertTab( pTextarea, pIndentWithTabs, pTabSize ) {
        var before, after, startPos, insertText,
            scrollPos = pTextarea.scrollTop;

        // most browsers support this way of working with a textarea selection
        // but old IE browsers have a different way that it is not worth supporting
        if ( !( pTextarea.selectionStart || pTextarea.selectionStart === 0 )) {
            return false;
        }

        startPos = pTextarea.selectionStart;
        before   = pTextarea.value.substring( 0, startPos );
        after    = pTextarea.value.substring( pTextarea.selectionEnd );

        if ( pIndentWithTabs ) {
            insertText = "\t";
            startPos = startPos + 1;
        } else {
            insertText = SPACES.substring( 0, pTabSize );
            startPos = startPos + pTabSize;
        }
        pTextarea.value          = before + insertText + after;
        pTextarea.selectionStart = pTextarea.selectionEnd = startPos;
        pTextarea.scrollTop      = scrollPos;
        return true;
    }

    function setCursorPos( pTextarea, pLine, pCol ) {
        var maxCol,
            lines = [ 0 ],
            text = pTextarea.value;

        if ( !( pTextarea.selectionStart || pTextarea.selectionStart === 0 )) {
            return false;
        }
        // create an index of offsets into the lines of the text
        text.replace(/\n/mg, function( m, offset ) {
            lines.push( offset + 1 );
        });
        if ( pLine >= lines.length ) {
            pLine = lines.length - 1;
        }
        if ( pLine === lines.length - 1 ) {
            maxCol = text.length - lines[pLine];
        } else {
            maxCol = lines[pLine + 1] - lines[pLine] - 1;
        }
        if ( pCol > maxCol ) {
            pCol = maxCol;
        }
        pTextarea.selectionStart = pTextarea.selectionEnd = lines[pLine] + pCol;
    }

    // functions for codeMirror mode

    // APEX and CodeMirror have different conventions for displaying key binding names.
    // We want to use the APEX conventions.
    // CodeMirror modifiers: Shift-, Cmd-, Ctrl-, and Alt-
    // APEX actions modifiers: [Ctrl+][Alt+][Meta+][Shift+]<key>
    // Also apply Mac specific conversions. See actions.js.
    var MOD_ORDER = {
        "Ctrl": 1,
        "Alt": 2,
        "Cmd": 3, // Meta
        "Shift": 4
    };

    var isMac = navigator.appVersion.indexOf("Mac") >= 0;

    function getKeyForCommand( pEditor, command ) {
        var key, i, keyMap, keyMapNames;

        function keyDisplayName( keyName ) {
            var display,
                mods = keyName.split( "-" ),
                key = mods.pop();

            mods.sort(function(a,b) {
                return MOD_ORDER[a] - MOD_ORDER[b];
            });
            mods.push( key );
            display = mods.join("+").replace( "Cmd+", "Meta+" );
            if ( isMac ) {
                display = display.replace( "Meta+", "\u2318+" ).replace( "Alt+", "Option+" );
            }
            return display;
        }

        if ( !pEditor ) {
            return null;
        }
        keyMapNames = [ "extraKeys", pEditor.getOption("keyMap") ];
        for ( i = 0; i < keyMapNames.length; i++ ) {
            keyMap = keyMapNames[i] === "extraKeys" ? pEditor.getOption("extraKeys") : CodeMirror.keyMap[ keyMapNames[i] ];
            for ( key in keyMap ) {
                if ( keyMap.hasOwnProperty( key ) ) {
                    if ( key === "fallthrough") {
                        keyMapNames = keyMapNames.concat(keyMap[key]);
                    } else if ( keyMap[key] === command ) {
                        return keyDisplayName( key );
                    }
                }
            }
        }
        return null;
    }

    function lookupTheme( pThemeName ) {
        var i, theme;
        for ( i = 0; i < CM_THEMES.length; i++ ) {
            theme = CM_THEMES[i];
            if ( theme.name === pThemeName ) {
                return theme;
            }
        }
        return null;
    }

    function loadThemeIfNeeded( pThemeName ) {
        var theme = lookupTheme( pThemeName );

        if ( !theme.loaded ) {
            $( "head" ).append('<link type="text/css" href="' + CM_URL_BASE + '/theme/' + ( theme.fileName || theme.name ) + '.css" rel="stylesheet"/>');
            theme.loaded = true;
        }
    }

    function apexHint( pEditor, pCallback, pOptions ) {
        var cur    = pEditor.getCursor(),
            token  = pEditor.getTokenAt( cur ),
            search = token.string.trim(),
            prevToken,
            parentName,
            grandParentName,
            type;

        // pData has to be in the format:
        //   [
        //     type:      "string" (template, application_item, page_item, package, procedure, function, constant, variable, type, table, view),
        //     title:     "string",
        //     className: "string",
        //     completions: [
        //       { d: "string", r: "string" } or "string"
        //     ]
        //   ]
        function _success( pData ) {

            var type,
                completion,
                completions = [];
            for ( var i = 0; i < pData.length; i++ ) {
                type = pData[ i ];

                for ( var j = 0; j < type.completions.length; j++ ) {
                    completion = type.completions[ j ];
                    completions.push({
                        text:        completion.r || completion,
                        displayText: ( completion.d || completion ) + " (" + type.title + ")",
                        className:   type.className,
                        type:        type.type,
                        hint:        _replaceCompletion
                    });
                }
            }

            // sort our hint list by display value, but always use lower case, because PL/SQL is not case sensitive
            completions.sort( function( a, b ) {
                return a.displayText.toLowerCase().localeCompare( b.displayText.toLowerCase());
            });

            pCallback({
                list: completions,
                from: CodeMirror.Pos( cur.line, token.start ),
                to:   CodeMirror.Pos( cur.line, token.end )
            });

        } // _success


        function _replaceCompletion( pEditor, pSelf, pCompletion ) {

            var text = pCompletion.text,
                cursor,
                placeholders,
                placeholder,
                placeholderValues = {},
                cursorPlaceholderPos,
                newLinePos;

            // For package we automatically want to add "." at the end to immediately allow to enter a function/variable/...
            if ( pCompletion.type === "package" ) {

                text  += ".";

            } else if ( pCompletion.type === "procedure" || pCompletion.type === "function" ) {

                // For procedures and functions we automatically want to add () at the end and position the cursor
                // between the brackets

                text  += "()";
                cursor = {
                    line: pSelf.from.line,
                    ch:   pSelf.from.ch + text.length - 1
                };

            } else if ( pCompletion.type === "template" ) {

                // For templates, ask the user for a value for each placeholders in the format $xxx$ and replace
                // it in the text
                placeholders = text.match( /\$[a-z]{1,}\$/g );
                if ( placeholders ) {
                    for ( var i = 0; i < placeholders.length; i++ ) {
                        placeholder = placeholders[ i ].substr( 1, placeholders[ i ].length - 2 );
                        if ( !placeholderValues.hasOwnProperty( placeholder ) && placeholder !== "cursor" ) {
                            placeholderValues[ placeholder ] = window.prompt( placeholder );
                        }
                    }
                    for ( placeholder in placeholderValues ) {
                        if ( placeholderValues.hasOwnProperty( placeholder )) {
                            text = text.replace( new RegExp( "\\$" + placeholder + "\\$", "gi" ), placeholderValues[ placeholder ]);
                        }
                    }
                }
                // Indent each line of the template with spaces
                if ( pSelf.from.ch > 0 ) {
                    text = text.replace( /\n/g, "\n" + new Array( pSelf.from.ch + 1 ).join( " " ));
                }
                // If the $cursor$ placeholder has been used, put the cursor at this position
                cursorPlaceholderPos = text.indexOf( "$cursor$" );
                if ( cursorPlaceholderPos !== -1 ) {
                    newLinePos = text.lastIndexOf( "\n", cursorPlaceholderPos );
                    if ( newLinePos !== - 1 ) {
                        cursor = {
                            line: pSelf.from.line + ( text.substr( 0, cursorPlaceholderPos ).match( /\n/g ) || [] ).length,
                            ch:   cursorPlaceholderPos - newLinePos - 1
                        };
                    } else {
                        cursor = {
                            line: pSelf.from.line,
                            ch:   pSelf.from.ch + cursorPlaceholderPos
                        };
                    }
                    text = text.replace( /\$cursor\$/, "" );
                }
            }

            pEditor.replaceRange( text, pSelf.from, pSelf.to );

            if ( cursor ) {
                pEditor.doc.setCursor( cursor );
            }
        } // _replaceCompletion


        function _getPrevToken( pToken ) {

            var prevToken = pEditor.getTokenAt({ line: cur.line, ch: pToken.start });

            if ( pToken.string === "." ) {

                return prevToken;

            } else if ( prevToken.string === "." ) {

                return _getPrevToken( prevToken );

            } else {
                return null;
            }
        } // _getPrevToken


        // Check if we are dealing with a multi level object (ie. [schema.]package.procedure/function/... or schema.table/view/procedure/function)
        prevToken = _getPrevToken( token );
        if ( prevToken && prevToken.string !== "" ) {
            parentName      = prevToken.string;
            grandParentName = "";

            // In the case of a package, check if a schema has been specified
            prevToken = _getPrevToken( prevToken );
            if ( prevToken ) {
                grandParentName = prevToken.string;
            }

            // If a user has just entered a dot so far, don't use it to restrict the search
            if ( search === "." ) {
                search = "";
                token.start++;
            }

        } else if ( search.indexOf( ":" ) === 0 || search.indexOf( "&" ) === 0 ) {
            // If the token starts with ":" or "&" we expect it's a bind variable/substitution syntax and we want to code complete application and page items

            type = "item";

            // Remove the colon/and to not replace it later on
            search = search.substr( 1 );
            token.start++;

        } else {
            // Could be a database object or a template
            type = "";
        }

        // Only call the server if the user has entered at least one character
        if ( parentName || search ) {
            pOptions.dataCallback({
                type:        type,
                search:      search,
                parent:      parentName,
                grantParent: grandParentName
            }, _success );
        }

    }

    function renderButton( out, id, shortcut, label, extraClasses, disabled ) {
        out.markup( "<button" )
            .attr( "id", id )
            .optionalAttr( "title", shortcut ? lang.formatMessage("CODE_EDITOR.SHORTCUT_TITLE", label, shortcut) : null )
            .optionalBoolAttr( "disabled", disabled )
            .attr( "class", "a-Button" + ( extraClasses ? " " + extraClasses : "" ) )
            .markup(" type='button'>" )
            .content( label )
            .markup( "</button>");
    }

    function renderIconButton( out, id, shortcut, icon, label, extraClasses, disabled ) {
        var title = shortcut ? lang.formatMessage("CODE_EDITOR.SHORTCUT_TITLE", label, shortcut ) : label;
        out.markup( "<button" )
            .attr( "id", id )
            .attr( "title", title )
            .attr( "aria-label", title )
            .optionalBoolAttr( "disabled", disabled )
            .attr( "class", "a-Button a-Button--noLabel a-Button--withIcon" + ( extraClasses ? " " + extraClasses : "" ) )
            .markup(" type='button'>" )
            .markup( "<span class='a-Icon " )
            .attr( icon )
            .markup( "' aria-hidden='true'></span></button>" );
    }

    // get the URL prefix for code mirror css files, would normally restrict to looking in head but
    // APEX plugins add css to the body
    $( "link" ).each(function() {
        var href = $( this ).attr( "rel" ) === "stylesheet" ? $( this ).attr( "href" ) : "",
            index = href.indexOf( "/codemirror-custom" );

        if ( index >= 0 ) {
            CM_URL_BASE = href.substring(0, index);
        }
    });

    $.widget( "apex.codeEditor", {
        version: "5.0",
        widgetEventPrefix:   "codeEditor",
        options: {
            mode:             "javascript",
            readOnly:         false,
            autofocus:        false,
            lineWrapping:     null, // choose default based on mode
            wrapIndent:       null, // only applies if lineWrapping is true and only if using CodeMirror choose default based on mode
            errors:           [],
            warnings:         [],
            // value:         undefined, // leave this undefined by default. Only valid for initialization. Use get/setValue at other times
                                         // value may also come from nested textarea content
            // settings
            usePlainTextArea: false, // use a textarea rather than codemirror and loose all special functionality
                                     // Caution: changing this option will cause the widget to be destroyed and recreated
            theme:            "default",
            indentUnit:       4,
            tabSize:          4,
            indentWithTabs:   false,
            lineNumbers:      true,
            ruler:            true,
            // callback function
            codeComplete:     null, // optional. function( options, callback )
            validateCode:     null, // optional. function( code, callback ) callback: function( {errors:[],warnings:[]} )
            queryBuilder:     null, // optional. function( editor, code )
            // events/callbacks
            settingsChanged:  null // function( event )
        },
        _errorLineWidgets:   [],
        _warningLineWidgets: [],
        wrappedTextArea:     false,
        settingsMenu$:        null,
        // only one of _editor or _textarea will be defined

        /*
         * Lifecycle methods
         */
        _create: function() {
            var cmOptions, charWidth, off, basePadding,
                o = this.options;

            this.element.addClass( C_CODE_EDITOR );
            this.baseId = this.element[0].id || "aCE";

            if ( o.lineWrapping === null ) {
                // set according to the mode
                if ( o.mode === "text/css" || o.mode === "text/html" || o.mode === "text/xml" || o.mode === "text/text" ) {
                    o.lineWrapping = true;
                } else {
                    o.lineWrapping = false;
                }
            }
            if ( o.lineWrapping && o.wrapIndent === null ) {
                // set according to the mode
                if ( o.mode === "text/css" || o.mode === "text/html" || o.mode === "text/xml" ) {
                    o.wrapIndent = true;
                } else {
                    o.wrapIndent = false;
                }
            }
            if ( o.usePlainTextArea ) {
                // use a textarea
                if ( this.element.children( "textarea" ).length === 1 ) {
                    // assume the textarea already has the text value
                    this._textarea = this.element.children( "textarea" );
                    this._textarea.attr( "wrap", "soft" )
                        .attr( "autocorrect", "off" )
                        .attr( "autocapitalize", "off" )
                        .attr( "spellcheck", "false" );
                    this.textareaSavedStyle = this._textarea.attr( "style" ) || "";
                    this.wrappedTextArea = true;
                } else {
                    this._textarea = $( "<textarea wrap='soft' autocorrect='off' autocapitalize='off' spellcheck='false' ></textarea>" );
                    this.element.empty().append( this._textarea );
                }
                this.element.addClass( C_PLAIN_TEXTAREA );
                // if a value is given it overrides what may have been in the existing textarea if any
                if ( o.value !== undefined ) {
                    this._textarea.val( o.value );
                }
                this._textarea.css({
                    resize:     "none",
                    whiteSpace: o.lineWrapping ? "pre-wrap" : "pre",
                    wordWrap: o.lineWrapping ? "break-word" : "normal"
                });

                if ( o.readOnly ) {
                    this._textarea.attr( "readonly", true );
                }

                if ( o.autofocus ) {
                    this._textarea[ 0 ].focus();
                }

            } else {
                // use code mirror
                cmOptions = {
                    mode:              o.mode,
                    theme:             o.theme,
                    lineWrapping:      o.lineWrapping,
                    indentUnit:        o.indentUnit,
                    tabSize:           o.tabSize,
                    indentWithTabs:    o.indentWithTabs,
                    readOnly:          o.readOnly,
                    autofocus:         o.autofocus,
                    lineNumbers:       o.lineNumbers,
                    styleActiveLine:   true,
                    matchBrackets:     true,
                    autoCloseBrackets: true,
                    autoCloseTags:     true,
                    rulers:            ( o.ruler ? RULERS : [] ),
                    extraKeys: {
                        "Ctrl-Space": "autocomplete",
                        "Tab": function( cm ) {
                            if ( cm.somethingSelected() ) {
                                cm.indentSelection( "add" );
                            } else {
                                if ( o.indentWithTabs ) {
                                    cm.replaceSelection( "\t", "end", "+input" );
                                } else {
                                    cm.replaceSelection( SPACES.substring( 0, o.tabSize ), "end", "+input" );
                                }
                            }
                        },
                        "Shift-Tab": "indentLess"
                    }
                };

                loadThemeIfNeeded( o.theme );

                if ( this.element.children( "textarea" ).length === 1 ) {
                    this.wrappedTextArea = true;
                    this._editor = CodeMirror.fromTextArea( this.element.children( "textarea" )[ 0 ], cmOptions );
                    // if a value is given it overrides the existing textarea content
                    if ( o.value ) {
                        this.setValue( o.value );
                    }
                } else {
                    this.element.empty();
                    cmOptions.value = o.value;
                    this._editor    = CodeMirror( this.element[ 0 ], cmOptions ); // don't use new, code mirror does not use the constructor convention
                }

                if ( o.wrapIndent ) {
                    charWidth = this._editor.defaultCharWidth();
                    basePadding = 4;
                    this._editor.on( "renderLine", function( cm, line, elt ) {
                        off = CodeMirror.countColumn( line.text, null, cm.getOption("tabSize") ) * charWidth;
                        elt.style.textIndent = "-" + off + "px";
                        elt.style.paddingLeft = (basePadding + off) + "px";
                    });
                }

                this._editor.refresh();

                CodeMirror.commands.autocomplete = function( pEditor ) {

                    var modeOption = pEditor.doc.modeOption,
                        hint,
                        options = {};

                    switch ( modeOption ) {
                        case "text/javascript": hint = CodeMirror.hint.javascript; break;
                        case "text/css":        hint = CodeMirror.hint.css; break;
                        case "text/html":       hint = CodeMirror.hint.html; break;
                        case "text/xml":
                            hint = CodeMirror.hint.xml;
                            // todo xml hints are useless without option to define schema info
                            break;
                        case "text/x-plsql":
                            hint = apexHint;
                            options = {
                                async:        true,
                                dataCallback: o.codeComplete
                            };
                            break;
                    }

                    if ( hint ) {
                        CodeMirror.showHint( pEditor, hint, options );
                    }

                };

                this._errorLineWidgets   = [];
                this._warningLineWidgets = [];
                this._addMessages( this._errorLineWidgets,   o.errors,   "is-error" );
                this._addMessages( this._warningLineWidgets, o.warnings, "is-warning" );
            }
            delete o.value; // no longer needed because value is kept in underlying editor element

            if ( o.autofocus ) {
                this.element.addClass( C_ACTIVE );
            }

            this._initToolbar();
            this._initMessageBar();
            if ( this._editor ) {
                this._initSearchBar();
            } else {
                this._makeNotificationMessage();
            }
            this._resize();

            this._on( this._eventHandlers );
        },

        _eventHandlers: {
            resize: function( pEvent ) {
                this._resize();
                pEvent.stopPropagation();
            },
            keydown: function ( pEvent ) {
                var tabbable$, index,
                    target$ = $( pEvent.target ),
                    kc = pEvent.which;

                if ( pEvent.target.nodeName !== "TEXTAREA" && target$.closest( SEL_CODE_MIRROR ).length === 0 ) {
                    return;
                }
                if ( this._textarea && kc === KEYS.TAB && !pEvent.shiftKey && !pEvent.ctrlKey && !pEvent.altKey ) {
                    if ( !this.options.readOnly && insertTab( this._textarea[0], this.options.indentWithTabs, this.options.tabSize )) {
                        pEvent.preventDefault();
                    }
                } else if ( kc === 117 && !pEvent.ctrlKey && pEvent.altKey ) { // ALT+F6 or SHIFT+ALT+F6
                    if ( pEvent.shiftKey ) {
                        this.element.children( SEL_TOOLBAR ).find( "button" ).last()[0].focus();
                    } else {
                        tabbable$ = $(":tabbable");
                        index = tabbable$.index( this.element.find("textarea:tabbable") ); // it is always a textarea that is focusable
                        if ( index >= 0 && index < tabbable$.length ) {
                            index += 1;
                        } else if ( tabbable$.length > 0) {
                            index = 0;
                        }
                        if ( index >= 0 ) {
                            tabbable$[index].focus();
                        }
                    }
                }
            },

            focusin: function( event ) {
                this.element.addClass( C_ACTIVE );
            },

            focusout: function( event ) {
                this.element.removeClass( C_ACTIVE );
            }

        },

        _destroy: function() {
            this.element.find( SEL_TOOLBAR + "," + SEL_NOTIFICATION + "," + SEL_SEARCH_BAR ).remove();
            this.element.removeClass( C_CODE_EDITOR + " " + C_PLAIN_TEXTAREA + " " + C_ACTIVE );
            if ( this.wrappedTextArea ) {
                // cleanup the codemirror instance element added
                if ( this._editor ) {
                    $( this._editor.getWrapperElement() ).remove();
                    $( this.element.find( "textarea" ).show() );
                } else if ( this._textarea && this.textareaSavedStyle !== undefined ) {
                    this._textarea.attr( "style", this.textareaSavedStyle );
                }
            } else {
                this.element.empty(); // this will delete the codemirror editor instance
            }
            if ( this.settingsMenu$ ) {
                this.settingsMenu$.remove();
            }
        },

        _setOption: function( pKey, pValue ) {
            var self = this,
                oldUsePlainTextArea = this.options.usePlainTextArea;

            this._super( pKey, pValue );
            if ( pKey === "errors" || pKey === "warnings" ) {
                if ( this._textarea ) {
                    this._makeNotificationMessage();
                } else if ( pKey === "errors" ) {
                    this._addMessages( this._errorLineWidgets, pValue, "is-error" );
                } else if ( pKey === "warnings" ) {
                    this._addMessages( this._warningLineWidgets, pValue, "is-warning" );
                }
            } else if ( pKey === "readOnly" ) {
                if ( this._textarea) {
                    this._textarea.attr( "readonly", pValue );
                } else {
                    this._editor.setOption( pKey, pValue );
                }
                this._updateToolbarButtons();
            } else if ( pKey === "validateCode" || pKey === "queryBuilder" ) {
                // re-init toolbar
                this.element.find( SEL_TOOLBAR ).remove();
                this._initToolbar();
            } else if ( pKey === "usePlainTextArea" && pValue !== oldUsePlainTextArea ) {
                setTimeout( function() {
                    var element$ = self.element,
                        o = self.options,
                        value = self.getValue();

                    // xxx has issues, don't loose init from textarea, may mess up isclean
                    o.usePlainTextArea = pValue;
                    // recreate this widget
                    self.element.codeEditor("destroy");
                    o.value = value;
                    element$.codeEditor(o);
                }, 10 );
            } else if ( pKey === "ruler" && this._editor ) {
                this._editor.setOption( "rulers", ( pValue ? RULERS : [] ));
            } else {
                if ( this._editor ) {
                    if ( pKey === "theme" ) {
                        loadThemeIfNeeded( pValue );
                    }
                    this._editor.setOption( pKey, pValue );
                }
            }
        },

        setValue: function( pValue ) {
            if ( this._textarea ) {
                this._textarea.val( pValue );
            } else {
                this._editor.doc.setValue( pValue );
            }
        },

        getValue: function() {
            if ( this._textarea ) {
                return this._textarea.val();
            } else {
                return this._editor.doc.getValue();
            }
        },

        focus: function() {
            if ( this._textarea ) {
                this._textarea[ 0 ].focus();
            } else {
                this._editor.focus();
            }
        },

        setCursor: function( line, ch ) {
            if ( this._textarea ) {
                setCursorPos( this._textarea[0], line, ch );
                this._textarea[ 0 ].focus();
            } else {
                this._editor.doc.setCursor( line, ch );
            }
        },

        /**
         * The caller is responsible for making sure that pMessage is escaped as needed.
         * @param pMessage may contain markup
         */
        showNotification: function( pMessage ) {
            this.element.children( SEL_SEARCH_BAR ).hide();
            this.element.children( SEL_NOTIFICATION ).show().children( SEL_NOTIFICATION_MSG ).first().html( pMessage );
            this._resize();
        },

        showSearchBar: function( pReplace, defValue ) {
            var wasOpen;
            if ( !this._editor ) {
                return;
            }
            wasOpen = this.element.children( SEL_SEARCH_BAR ).filter( ":visible" ).length === 1;
            this.element.children( SEL_SEARCH_BAR ).show().find( SEL_SEARCH_REPLACE ).toggle( pReplace );
            this.element.children( SEL_NOTIFICATION ).hide();
            if ( !wasOpen || defValue ) {
                $("#" + this.baseId + "_findText" ).val( defValue ).focus();
            } else {
                $("#" + this.baseId + "_findText" ).focus()[0].select();
            }
            this.lastSearchText = null;
            this._resize();
        },

        changeGeneration: function() {
            if ( this._textarea ) {
                this._originalValue = this._textarea.val();
                return 1;
            } else {
                return this._editor.doc.changeGeneration();
            }
        },

        isClean: function( pGeneration ) {
            if ( this._textarea ) {
                return this._textarea.val() === this._originalValue;
            } else {
                return this._editor.doc.isClean( pGeneration );
            }
        },

        getSettingsString: function() {
            var o = this.options,
                str = "|";

            $.each( SETTINGS_OPTION_KEYS, function( i, item ) {
                var value = o[item];
                if ( typeof value === "boolean" ) {
                    value = value.toString().substr( 0, 1 );
                }
                str += value + "|";
            } );
            return str;
        },

        /*
         * Private functions
         */
        _resize: function() {
            var cm$,
                h = this.element.height(),
                w = this.element.width(),
                tbh = this.element.children( SEL_TOOLBAR ).outerHeight();

            this.element.children( SEL_SEARCH_BAR + "," + SEL_NOTIFICATION ).filter( ":visible" ).each( function() {
                tbh += $( this ).outerHeight();
            } );

            if ( this._editor ) {
                cm$ = this.element.find( SEL_CODE_MIRROR );
                cm$.height( h - tbh );
                cm$.width( w );
                // when the container size changes let codemirror know about it
                this._editor.refresh();
            } else {
                util.setOuterHeight( this._textarea, h - tbh );
                util.setOuterWidth( this._textarea, w );
            }
        },

        _validateCode: function() {
            var validateFn = this.options.validateCode,
                self = this;

            if ( validateFn ) {
                validateFn( this.getValue(), function( results ) {
                    results = $.extend( {}, { errors: [], warnings: [] }, results );
                    self._setOption( "errors",   results.errors );
                    self._setOption( "warnings", results.warnings );
                    if ( results.errors.length > 0 || results.warnings.length > 0 ) {
                        if ( self._editor ) {
                            self.element.children( SEL_NOTIFICATION ).hide().children( SEL_NOTIFICATION_MSG ).first().empty();
                            self._resize();
                        }
                        self.focus();
                    } else {
                        // indicate that all is well
                        self.showNotification( "<ul><li class='is-success'>" + util.escapeHTML( lang.getMessage( "CODE_EDITOR.VALIDATION_SUCCESS" ) ) + "</li></ul>" );
                    }
                } );
            }
        },

        _queryBuilder: function() {
            var queryBuilderFn = this.options.queryBuilder;

            if ( queryBuilderFn ) {
                queryBuilderFn( this, this.getValue() );
            }
        },

        _addMessages: function( pLineWidgets, pMessages, pCssClass ) {
            var MAX_LINE_NUMBER = Math.max( 0, this._editor.doc.lineCount() - 1 );

            var parsedError,
                lineNumber = 0,
                columnPos  = 0,
                message$,
                showAbove,
                i;

            // Remove any existing message of this type
            for ( i = 0; i < pLineWidgets.length; i++ ) {
                this._editor.removeLineWidget( pLineWidgets[ i ]);
            }
            pLineWidgets.length = 0;

            // Add new messages
            for ( i = 0; i < pMessages.length; i++ ) {
                if ( /^ORA-06550:/.test( pMessages[ i ])) {
                    // Error message is in the format: ORA-06550: line xx, column yy: Error Message
                    parsedError = pMessages[ i ].match( /\d{1,}/g );
                    lineNumber = parseInt( parsedError[ 1 ], 10 ) - 1;
                    columnPos  = parseInt( parsedError[ 2 ], 10 ) - 1;
                    if ( isNaN(lineNumber) ) {
                        lineNumber = 0;
                    }
                    if ( isNaN(columnPos) ) {
                        columnPos = 0;
                    }
                } else {
                    lineNumber = 0;
                    columnPos  = 0;
                }

                // todo we might want to improve this with an icon, ...
                message$ = $( "<div></div>" )
                    .addClass( pCssClass )
                    .text( pMessages[ i ]);

                if ( lineNumber > MAX_LINE_NUMBER ) {
                    // If the error line number is below our max line number, show the widget below the last line
                    showAbove  = false;
                    lineNumber = MAX_LINE_NUMBER;
                } else {
                    // Show the widget above the line with the error
                    showAbove = true;
                }
                pLineWidgets.push(
                    this._editor.addLineWidget( lineNumber, message$[ 0 ], {
                        coverGutter: false, noHScroll: true, above: showAbove, showIfHidden: true
                    }));

                // Set focus to first error
                if ( i === 0 ) {
                    this._editor.doc.setCursor({ line: lineNumber, ch: columnPos });
                }
            }
        }, // _addMessages

        _makeNotificationMessage: function() {
            var i,
                message = "",
                options = this.options;

            if ( options.errors.length > 0 || options.warnings.length > 0 ) {
                message = "<ul>";
                for ( i = 0; i < options.errors.length; i++ ) {
                    message += "<li class='is-error'>" + util.escapeHTML( options.errors[ i ]) + "</li>";
                }
                for ( i = 0; i < options.warnings.length; i++ ) {
                    message += "<li class='is-warning'>" + util.escapeHTML( options.warnings[ i ]) + "</li>";
                }
                message += "</ul>";

                this.element.children( SEL_SEARCH_BAR ).hide();
                this.element.children( SEL_NOTIFICATION ).show().children( SEL_NOTIFICATION_MSG ).first().html( message );
                this._resize();
            } else if ( this.element.children( SEL_NOTIFICATION ).is( ":visible" ) ) {
                this.element.children( SEL_NOTIFICATION ).hide().children( SEL_NOTIFICATION_MSG ).first().empty();
                this._resize();
            }
        },

        _initToolbar: function() {
            var self = this,
                o = this.options,
                out = util.htmlBuilder();

            function renderCMIconButton( out, command, icon, label, extraClasses, disabled ) {
                var shortcut = getKeyForCommand( self._editor, command );
                renderIconButton( out, self.baseId + "_" + command, shortcut, icon, label, extraClasses, disabled );
            }

            function action( command ) {
                $( "#" + self.baseId + "_" + command ).click( function() {
                    if ( self._editor ) {
                        self._editor.focus();
                        setTimeout(function() {
                            self._editor.execCommand( command );
                        }, 10);
                    }
                } );
            }

            function cmAddThemes() {
                var i, theme, choices = [];

                for ( i = 0; i < CM_THEMES.length; i++ ) {
                    theme = CM_THEMES[i];
                    choices.push( {
                        label: theme.name.replace( "-", " " ),
                        value: theme.name
                    });
                }
                return choices;
            }

            function cmAddTabSizes() {
                return [
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                    { label: "8", value: "8" }
                ];
            }

            function notify() {
                var element = self.element[0];
                self._trigger( "settingsChanged", $.Event("click", {target: element }) );
            }

            out.markup( "<div class='" + C_TOOLBAR + "'>" );
            renderCMIconButton( out, "undo", "icon-undo", msg( "CODE_EDITOR.UNDO" ), "a-Button--pillStart", !!o.usePlainTextArea );
            renderCMIconButton( out, "redo", "icon-redo", msg( "CODE_EDITOR.REDO" ), "a-Button--pillEnd a-Button--gapRight", !!o.usePlainTextArea );
            renderCMIconButton( out, "find", "icon-cm-find", msg( "CODE_EDITOR.FIND" ), "a-Button--pillStart", !!o.usePlainTextArea );
            renderCMIconButton( out, "replace", "icon-cm-replace", msg( "CODE_EDITOR.REPLACE" ), "a-Button--pillEnd a-Button--gapRight", !!o.usePlainTextArea );
            if ( o.queryBuilder ) {
                renderCMIconButton( out, "queryBuilder", "icon-cm-query-builder", msg( "CODE_EDITOR.QUERY_BUILDER" ), null, false );
            }
            renderCMIconButton( out, "autocomplete", "icon-cm-autocomplete", msg( "CODE_EDITOR.HINT" ), null, !!o.usePlainTextArea );
            if ( o.validateCode ) {
                renderCMIconButton( out, "validate", "icon-cm-validate", msg( "CODE_EDITOR.VALIDATE" ), null, false );
            }
            out.markup( "<button" )
                .attr( "id", this.baseId + "_settings" )
                .attr( "title", msg( "CODE_EDITOR.SETTINGS" ) )
                .attr( "aria-label", msg( "CODE_EDITOR.SETTINGS" ) )
                .attr( "data-menu", this.baseId + "_settingsMenu" )
                .markup( " class='a-Button a-Button--noLabel a-Button--iconTextButton js-menuButton u-pullRight' type='button' aria-haspopup='true' aria-expanded='false'>" )
                .markup( "<span class='a-Icon icon-gear' aria-hidden='true'></span><span class='a-Icon icon-menu-drop-down' aria-hidden='true'></span></button>")
                .markup("</div>");
            this.element.prepend( out.toString() );

            action( "undo" );
            action( "redo" );
            action( "find" );
            action( "replace" );
            action( "autocomplete" );
            if ( o.validateCode ) {
                $( "#" + self.baseId + "_validate" ).click( function() {
                    self._validateCode();
                } );
            }
            if ( o.queryBuilder ) {
                $( "#" + self.baseId + "_queryBuilder" ).click( function() {
                    self._queryBuilder();
                } );
            }

            this.settingsMenu$ = $( util.htmlBuilder()
                .markup( "<div style='display:none'" )
                .attr("id", this.baseId + "_settingsMenu" )
                .markup("></div>" ).toString() ).appendTo( "body" );
            this.settingsMenu$.menu( {
                items: [
                    { type: "toggle", labelKey: "CODE_EDITOR.USE_PLAIN_TEXT_EDITOR", get: function () {
                        return o.usePlainTextArea;
                    }, set: function ( v ) {
                        self._setOption( "usePlainTextArea", v );
                        notify();
                    } },
                    { type: "toggle", labelKey: "CODE_EDITOR.INDENT_WITH_TABS", get: function() {
                        return !o.indentWithTabs;
                    }, set: function( v ) {
                        self._setOption( "indentWithTabs", !v );
                        notify();
                    } },
                    { type: "subMenu", labelKey: "CODE_EDITOR.TAB_SIZE", disabled: function() { return o.usePlainTextArea && o.indentWithTabs; }, menu: {
                        items: [
                            { type: "radioGroup", get: function() {
                                return "" + o.tabSize;
                            }, set: function(v) {
                                self._setOption( "tabSize", parseInt(v, 10) );
                                notify();
                            }, choices: cmAddTabSizes()
                            }
                        ]
                    } },
                    { type: "subMenu", labelKey: "CODE_EDITOR.INDENT_SIZE", disabled: function() { return o.usePlainTextArea; }, menu: {
                        items: [
                            { type: "radioGroup", get: function() {
                                return "" + o.indentUnit;
                            }, set: function(v) {
                                self._setOption( "indentUnit", parseInt(v, 10) );
                                notify();
                            }, choices: cmAddTabSizes()
                            }
                        ]
                    } },
                    { type: "subMenu", labelKey: "CODE_EDITOR.THEMES", disabled: function() { return o.usePlainTextArea; }, menu: {
                        items: [
                            { type: "radioGroup", get: function() {
                                return o.theme;
                            }, set: function(v) {
                                self._setOption( "theme", v );
                                notify();
                            }, choices: cmAddThemes()
                            }
                        ]
                    } },
                    { type: "toggle", labelKey: "CODE_EDITOR.SHOW_LINE_NUMBERS", disabled: function() {
                        return o.usePlainTextArea;
                    }, get: function () {
                        return o.lineNumbers;
                    }, set: function ( v ) {
                        self._setOption( "lineNumbers", v );
                        notify();
                    } },
                    { type: "toggle", labelKey: "CODE_EDITOR.SHOW_RULER", disabled: function() {
                        return o.usePlainTextArea;
                    }, get: function () {
                        return o.ruler;
                    }, set: function ( v ) {
                        self._setOption( "ruler", v );
                        notify();
                    } }
                ]
            } );

            if ( this._editor ) {
                this._editor.on( "change", function() {
                    self._updateToolbarButtons();
                });
            }
            this._updateToolbarButtons();
        },

        _updateToolbarButtons: function() {
            var history = { undo: 0, redo: 0 },
                o = this.options,
                disabled = o.usePlainTextArea || o.readOnly;

            if ( this._editor ) {
                history = this._editor.historySize();
            }
            $( "#" + this.baseId + "_replace" )[0].disabled = disabled;
            $( "#" + this.baseId + "_autocomplete" )[0].disabled = disabled;
            if ( o.validateCode ) {
                $( "#" + this.baseId + "_validate" )[0].disabled = o.readOnly;
            }
            if ( o.queryBuilder ) {
                $( "#" + this.baseId + "_queryBuilder" )[0].disabled = o.readOnly;
            }
            $( "#" + this.baseId + "_undo" )[0].disabled = history.undo === 0;
            $( "#" + this.baseId + "_redo" )[0].disabled = history.redo === 0;
        },

        _initMessageBar: function() {
            var self = this,
                out = util.htmlBuilder(),
                closeId = this.baseId + "_mClose";

            out.markup( "<div class='" + C_NOTIFICATION + "' style='display:none;'><div class='" + C_NOTIFICATION_MSG + "'></div>");
            renderIconButton( out, closeId, null, "ui-icon-closethick", msg( "CODE_EDITOR.CLOSE" ), "a-Button--small a-CodeEditor-searchBar-closeButton", false );
            out.markup( "</div>");
            this.element.children( SEL_TOOLBAR ).after( out.toString() );
            $( "#" + closeId ).click( function() {
                $( this ).parent().hide();
                self._resize();
            } );
        },

        _initSearchBar: function() {
            var self = this,
                findInputId = this.baseId + "_findText",
                replaceInputId = this.baseId + "_replaceText",
                caseCbId = this.baseId + "_caseCb",
                reCbId = this.baseId + "_reCb",
                closeId = this.baseId + "_sClose",
                out = util.htmlBuilder();

            function action( command ) {
                $( "#" + self.baseId + "_" + command ).click( function() {
                    self._editor.focus();
                    setTimeout(function() {
                        self._editor.execCommand( command );
                    }, 10);
                } );
            }

            function close() {
                self.element.children( SEL_SEARCH_BAR ).hide();
                self._resize();
                self.focus();
                self._editor.execCommand( "clearSearch" );
            }

            function updateSearchState() {
                self._editor.setSearchState( $( "#" + findInputId ).val(), $( "#" + reCbId )[0].checked, !$( "#" + caseCbId )[0].checked );
            }

            out.markup( "<div class='" + C_SEARCH_BAR + "' style='display:none;'><label class='a-CodeEditor-searchBar-label'")
                .attr( "for", findInputId ).markup( ">" )
                .content( msg( "CODE_EDITOR.FIND_INPUT" ) ).markup( "</label><input class='a-CodeEditor-searchBar-textInput' type='text'")
                .attr( "id", findInputId ).markup( ">" );
            renderIconButton( out, self.baseId + "_findNext", getKeyForCommand( self._editor, "findNext" ), "icon-down-chevron", msg( "CODE_EDITOR.FIND_NEXT" ), "a-Button--small a-Button--pillStart" );
            renderIconButton( out, self.baseId + "_findPrev", getKeyForCommand( self._editor, "findPrev" ), "icon-up-chevron", msg( "CODE_EDITOR.FIND_PREV" ), "a-Button--small a-Button--pillEnd" );
            out.markup( "<div class='a-CodeEditor-searchBar-checkboxGroup'><input type='checkbox'" )
                .attr( "id", caseCbId ).markup( "><label class='a-CodeEditor-searchBar-label'")
                .attr( "for", caseCbId ).markup( ">")
                .content( msg( "CODE_EDITOR.MATCH_CASE" ) ).markup( "</label><input type='checkbox'")
                .attr( "id", reCbId ).markup( "><label class='a-CodeEditor-searchBar-label'")
                .attr( "for", reCbId ).markup( ">")
                .content( msg( "CODE_EDITOR.MATCH_RE" ) ).markup( "</label></div><div class='" + C_SEARCH_REPLACE + "'><label class='a-CodeEditor-searchBar-label'")
                .attr( "for", replaceInputId ).markup( ">" )
                .content( msg( "CODE_EDITOR.REPLACE_INPUT" ) ).markup( "</label><input class='a-CodeEditor-searchBar-textInput' type='text'")
                .attr( "id", replaceInputId ).markup( ">");
            renderButton( out, self.baseId + "_replaceNext", null, msg( "CODE_EDITOR.REPLACE" ), "a-Button--small a-Button--pillStart" );
            renderButton( out, self.baseId + "_replaceAll", null, msg( "CODE_EDITOR.REPLACE_ALL" ), "a-Button--small a-Button--pill" );
            renderButton( out, self.baseId + "_replaceSkip", null, msg( "CODE_EDITOR.REPLACE_SKIP" ), "a-Button--small a-Button--pillEnd" );
            out.markup( "</div>" );
            renderIconButton( out, closeId, null, "ui-icon-closethick", msg( "CODE_EDITOR.CLOSE" ), "a-Button--small a-CodeEditor-searchBar-closeButton", false );
            out.markup( "</div>" );

            this.element.children( SEL_TOOLBAR ).after( out.toString() );
            this.element.children( SEL_SEARCH_BAR ).keydown( function ( event ) {
                if ( event.which === $.ui.keyCode.ESCAPE ) {
                    event.preventDefault();
                    close();
                }
            });

            action( "findNext" );
            action( "findPrev" );
            $( "#" + self.baseId + "_replaceSkip" ).click( function() {
                self._editor.focus();
                setTimeout(function() {
                    self._editor.execCommand( "findNext" );
                }, 10);
            } );
            $( "#" + self.baseId + "_replaceNext" ).click( function() {
                self._editor.focus();
                setTimeout(function() {
                    self._editor.doReplace( $( "#" + replaceInputId ).val(), false );
                }, 10);
            } );
            $( "#" + self.baseId + "_replaceAll" ).click( function() {
                self._editor.focus();
                setTimeout(function() {
                    self._editor.doReplace( $( "#" + replaceInputId ).val(), true );
                }, 10);
            } );
            $( "#" + closeId ).click( close );

            self.lastSearchText = null;
            $( "#" + findInputId ).keydown( function( event ) {
                var searchText,
                    kc = event.which;

                if ( kc === $.ui.keyCode.ENTER || kc === $.ui.keyCode.DOWN  || kc === $.ui.keyCode.UP ) {
                    event.preventDefault();
                    searchText = $( this ).val();
                    if ( searchText !== self.lastSearchText ) {
                        updateSearchState();
                        self.lastSearchText = searchText;
                    }
                    setTimeout(function() {
                        self._editor.execCommand( kc === $.ui.keyCode.UP ? "findPrev" : "findNext" );
                    }, 10);
                }
            } ).blur( function( event ) {
                updateSearchState();
            } );
            $( "#" + reCbId + ",#" + caseCbId ).click( function() {
                updateSearchState();
            } );
        }

    });

    $.apex.codeEditor.optionsFromSettingsString = function( settings ) {
        var input = settings.split( "|" ),
            options = {};

        if ( input.length !== SETTINGS_OPTION_KEYS.length + 2 ) {
            if ( settings.length > 0 ) {
                debug.warn("CodeEditor: Bad input ignored:", settings );
            }
            return options;
        }
        input = input.splice(1, SETTINGS_OPTION_KEYS.length + 1 );

        $.each( SETTINGS_OPTION_KEYS, function( i, item ) {
            var value = input[i],
                key = item;

            if ( key === "theme" ) {
                if ( !lookupTheme( value ) ) {
                    debug.warn("CodeEditor: Bad theme ignored: " + value );
                    return;
                }
            } else if ( key === "indentUnit" || key === "tabSize" ) {
                value = parseInt( value, 10 );
                if ( isNaN( value ) ) {
                    debug.warn("CodeEditor: Bad number ignored: " + value );
                    return;
                }
            } else {
                if ( value === "t" ) {
                    value = true;
                } else if ( value === "f" ) {
                    value = false;
                } else {
                    debug.warn("CodeEditor: Bad Boolean ignored: " + value );
                    return;
                }
            }
            options[key] = value;
        } );

        return options;
    };

    //
    // Search replacement
    // The following is based on the CodeMirror search add on. Changes were needed for usability, accessibility, and
    // localization.
    //
    function searchOverlay( query, caseInsensitive ) {
        if ( typeof query === "string" ) {
            query = new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), caseInsensitive ? "gi" : "g");
        }
        else if ( !query.global ) {
            query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");
        }

        return { token: function(stream) {
            query.lastIndex = stream.pos;
            var match = query.exec( stream.string );
            if ( match && match.index === stream.pos ) {
                stream.pos += match[0].length;
                return "searching";
            } else if ( match ) {
                stream.pos = match.index;
            } else {
                stream.skipToEnd();
            }
        }};
    }

    function SearchState() {
        this.posFrom = this.posTo = this.query = null;
        this.overlay = null;
    }

    function getSearchState(cm) {
        return cm.state.search || (cm.state.search = new SearchState());
    }

    function doSearch(cm, rev) {
        var state = getSearchState(cm ),
            ce$ = $(cm.display.wrapper).parent();

        if ( state.query ) {
            findNext(cm, rev);
            return;
        } // else
        ce$.codeEditor( "showSearchBar", false, cm.getSelection() );
    }

    function findNext(cm, rev) {
        cm.operation( function() {
            var state = getSearchState( cm ),
                cursor = cm.getSearchCursor( state.query, rev ? state.posFrom : state.posTo, state.isCaseInsensitive );
            if ( !cursor.find( rev ) ) {
                cursor = cm.getSearchCursor( state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0), state.isCaseInsensitive );
                if ( !cursor.find( rev )) {
                    return;
                }
            }
            cm.setSelection( cursor.from(), cursor.to() );
            cm.scrollIntoView( {from: cursor.from(), to: cursor.to()} );
            state.posFrom = cursor.from();
            state.posTo = cursor.to();
        } );
    }

    function clearSearch(cm) {
        cm.operation( function() {
            var state = getSearchState( cm );
            if ( !state.query ) {
                return;
            }
            state.query = null;
            cm.removeOverlay( state.overlay );
        } );
    }

    CodeMirror.defineExtension("setSearchState", function ( query, isRE, isCaseInsensitive ) {
        var self = this,
            state = getSearchState( this );

        if ( !query && state.query ) {
            clearSearch( this );
            return;
        } // else
        this.operation( function() {
            if ( isRE ) {
                query = new RegExp( query, isCaseInsensitive ? "i" : "" );
                if (query.test( "" )) {
                    query = /x^/;
                }
            } else if ( query === "" ) {
                query = /x^/;
            }
            state.query = query;
            state.isCaseInsensitive = isCaseInsensitive;
            self.removeOverlay(state.overlay, isCaseInsensitive);
            state.overlay = searchOverlay(state.query, isCaseInsensitive);
            self.addOverlay( state.overlay );
            state.posFrom = state.posTo = self.getCursor();
        } );
    });

    function replace( cm ) {
        var ce$ = $(cm.display.wrapper).parent();

        if ( cm.getOption( "readOnly" ) ) {
            return;
        }

        ce$.codeEditor( "showSearchBar", true, cm.getSelection() );
    }

    CodeMirror.defineExtension("doReplace", function ( text, all ) {
        var cursor, match,
            self = this,
            state = getSearchState( this );

        function subst( _, i ) {
            return match[i];
        }

        if ( all ) {
            this.operation( function() {
                for ( cursor = self.getSearchCursor( state.query, CodeMirror.Pos( self.firstLine(), 0 ), state.isCaseInsensitive ); cursor.findNext(); ) {
                    if ( typeof state.query !== "string" ) {
                        match = self.getRange( cursor.from(), cursor.to() ).match( state.query );
                        cursor.replace( text.replace( /\$(\d)/g, subst ));
                    } else {
                        cursor.replace( text );
                    }
                }
            } );
        } else {
            this.operation( function() {
                cursor = self.getSearchCursor( state.query, state.posFrom, state.isCaseInsensitive );
                if ( ! cursor.atOccurrence ) {
                    cursor.findNext();
                }
                if ( typeof state.query !== "string" ) {
                    match = self.getRange(cursor.from(), cursor.to()).match( state.query );
                    cursor.replace( text.replace( /\$(\d)/g, subst ));
                } else {
                    cursor.replace( text );
                }
                findNext( self );
            } );
        }
    });

    CodeMirror.commands.find = function(cm) {clearSearch(cm); doSearch(cm);};
    CodeMirror.commands.findNext = doSearch;
    CodeMirror.commands.findPrev = function(cm) {doSearch(cm, true);};
    CodeMirror.commands.clearSearch = clearSearch;
    CodeMirror.commands.replace = replace;
    CodeMirror.commands.replaceAll = replace; // works same as replace

})( apex.jQuery, apex.util, apex.lang, apex.debug );
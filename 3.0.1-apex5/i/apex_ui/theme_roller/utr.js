(function($, lang, storage, debug){
    if (!window.apex.utr) {
        throw 'UTR Base Missing!';
    }

    function coalesce(){
        for(i in arguments){
            if(arguments[i] !== undefined && arguments[i] !== null){
                return arguments[i];
            }
        }
        return undefined;
    }

    var self = window.apex.utr,
        utrContainer = undefined,
        utrContainerBody = undefined,
        utrCustomCSS = undefined,
        utrCustomCSSWarning = undefined,
        utrCustomCSSCodeEditor = undefined,
        validControlTypes = [
            "color",
            "number",
            "select"
        ],
        colorTimer = 0,
        colorTimerInterval = null,
        searchTimer = 0,
        searchTimerInterval = null,
        controls,
        modifyVars,
        lessCode,
        selectedStyle,
        styleHasChanged = false,
        currentThemeStylesheets = [],
        modifiedCurrentThemeStyle = false,
        existingStyles,
        resetButton,
        toolbarResetButton,
        toolbarUndoButton,
        toolbarRedoButton,
        currentHoverControl = $(),
        commonOnly,
        history = undefined,
        historyEvent = {
            undoRedo : 0,
            size     : 0,
            pos      : -1
        },
        THEMEROLLER_KEY = "ORA_WWV_apex.builder.themeRoller",
        localStorage = storage.getScopedSessionStorage( { prefix: THEMEROLLER_KEY, useAppId: true } ),
        STR = {
            THEME_ROLLER : lang.getMessage("UTR.THEME_ROLLER"),
            COMMON_CONFIRM : lang.getMessage("UTR.COMMON.CONFIRM"),

            SET_CURRENT_WHEN_READ_ONLY_PROMPT: lang.getMessage("UTR.SET_AS_CURRENT_WHEN_READ_ONLY.PROMPT"),
            SET_AS_CURRENT_THEME_STYLE_SUCCESS: lang.getMessage("UTR.SET_AS_CURRENT_THEME_STYLE_SUCCESS"),
            SET_AS_CURRENT_THEME_STYLE: lang.getMessage("UTR.SET_AS_CURRENT_THEME_STYLE"),
            RESET_STYLE: lang.getMessage("UTR.RESET.STYLE"),
            CURRENT : lang.getMessage("UTR.CURRENT"), //NEW
            SET_AS_CURRENT : lang.getMessage("UTR.SET_AS_CURRENT"), // NEW
            CHANGE_THEME : lang.getMessage("UTR.CHANGE_THEME"), // NEW
            ERROR_SET_AS_CURRENT_FAILED : lang.getMessage("UTR.ERROR.SET_AS_CURRENT_FAILED"),
            COMMON_WARNING : lang.getMessage("UTR.COMMON.WARNING"),
            PALETTE_GENERATOR_DUAL : lang.getMessage("UTR.PALETTE_GENERATOR.DUAL"),

            COPY: lang.getMessage("UTR.COMMON.COPY"),
            COMMON_SUCCESS : lang.getMessage("UTR.COMMON.SUCCESS"),
            COMMON_YES : lang.getMessage("UTR.COMMON.YES"),
            COMMON_NO : lang.getMessage("UTR.COMMON.NO"),
            COMMON_OK : lang.getMessage("UTR.COMMON.OK"),
            COMMON_CANCEL : lang.getMessage("UTR.COMMON.CANCEL"),
            COMMON_STYLE_NAME : lang.getMessage("UTR.COMMON.STYLE_NAME"),
            COMMON_BASE_STYLE : lang.getMessage("UTR.COMMON.BASE_STYLE"),
            BUTTONS_CLOSE : lang.getMessage("UTR.BUTTONS.CLOSE"),
            BUTTONS_MINIMIZE : lang.getMessage("UTR.BUTTONS.MINIMIZE"),
            BUTTONS_CODE_EDITOR : lang.getMessage("UTR.BUTTONS.CODE_EDITOR"),
            SAVE_AS : lang.getMessage("UTR.SAVE_AS"),
            SAVE_AS_PROMPT : lang.getMessage("UTR.SAVE_AS.PROMPT"),
            SAVE_AS_SUCCESS : lang.getMessage("UTR.SAVE_AS.SUCCESS"),
            SAVE : lang.getMessage("UTR.SAVE"),
            SAVE_PROMPT : lang.getMessage("UTR.SAVE.PROMPT"),
            SAVE_SUCCESS : lang.getMessage("UTR.SAVE.SUCCESS"),
            RESET : lang.getMessage("UTR.RESET"),
            RESET_PROMPT : lang.getMessage("UTR.RESET.PROMPT"),
            CUSTOM_CSS : lang.getMessage("UTR.CUSTOM_CSS"),
            CUSTOM_CSS_DESCRIPTION : lang.getMessage("UTR.CUSTOM_CSS.DESCRIPTION"),
            CUSTOM_CSS_WARNING : lang.getMessage("UTR.CUSTOM_CSS.WARNING"),
            CHANGE_PROMPT : lang.getMessage("UTR.CHANGE.PROMPT"),
            ERROR : lang.getMessage("UTR.ERROR"),
            ERROR_UNSUPPORTED_STYLE : lang.getMessage("UTR.ERROR.UNSUPPORTED_STYLE"),
            ERROR_INPUT_NOT_FOUND : lang.getMessage("UTR.ERROR.INPUT_NOT_FOUND"),
            ERROR_INVALID_STYLE : lang.getMessage("UTR.ERROR.INVALID_STYLE"),
            ERROR_UNSUPPORTED_THEME : lang.getMessage("UTR.ERROR.UNSUPPORTED_THEME"),
            ERROR_CREATE_FAILED : lang.getMessage("UTR.ERROR.CREATE_FAILED"),
            ERROR_UPDATE_FAILED : lang.getMessage("UTR.ERROR.UPDATE_FAILED"),
            ERROR_LOAD_FAILED : lang.getMessage("UTR.ERROR.LOAD_FAILED"),
            CONTRAST_VALIDATION_TITLE : lang.getMessage("UTR.CONTRAST_VALIDATION.TITLE"),
            CONTRAST_VALIDATION_MESSAGE : lang.getMessage("UTR.CONTRAST_VALIDATION.MESSAGE"),
            CONTRAST_VALIDATION_FAILED : lang.getMessage("UTR.CONTRAST_VALIDATION.FAILED"),
            CONTRAST_VALIDATION_PASSED : lang.getMessage("UTR.CONTRAST_VALIDATION.PASSED"),
            CONTRAST_VALIDATION_LARGE_TEXT_NOTICE : lang.getMessage("UTR.CONTRAST_VALIDATION.LARGE_TEXT_NOTICE"),
            HELP : lang.getMessage("UTR.HELP"),
            HELP_P1 : lang.getMessage("UTR.HELP.P1"),
            HELP_P2 : lang.getMessage("UTR.HELP.P2"),
            TOOLBAR_BUTTONS_COMMON : lang.getMessage("UTR.TOOLBAR.BUTTONS.COMMON"),
            TOOLBAR_BUTTONS_ALL : lang.getMessage("UTR.TOOLBAR.BUTTONS.ALL"),
            //BEGIN SHIPIT
            TOOLBAR_BUTTONS_PALETTE_GENERATOR : lang.getMessage("UTR.TOOLBAR.BUTTONS.PALETTE_GENERATOR"),
            PALETTE_GENERATOR_BASE_RGB : lang.getMessage("UTR.PALETTE_GENERATOR.BASE_RGB"),
            PALETTE_GENERATOR_SEPARATION : lang.getMessage("UTR.PALETTE_GENERATOR.SEPARATION"),
            PALETTE_GENERATOR_MONOCHROMATIC : lang.getMessage("UTR.PALETTE_GENERATOR.MONOCHROMATIC"),

            PALETTE_GENERATOR_TRIAD : lang.getMessage("UTR.PALETTE_GENERATOR.TRIAD"),
            PALETTE_GENERATOR_TETRAD : lang.getMessage("UTR.PALETTE_GENERATOR.TETRAD"),
            PALETTE_GENERATOR_WITH_COMPLEMENT : lang.getMessage("UTR.PALETTE_GENERATOR.WITH_COMPLEMENT"),
            SEARCH : lang.getMessage("UTR.SEARCH"),
            UNDO : lang.getMessage("UTR.UNDO"),
            REDO : lang.getMessage("UTR.REDO"),
            CONFIG_OUTPUT : lang.getMessage("UTR.CONFIG_OUTPUT"),
            CONFIG_OUTPUT_ERROR : lang.getMessage("UTR.CONFIG_OUTPUT_ERROR")
            //END SHIPIT
        };

    var useTranslation = true;
    function translate( _x ) {
        return useTranslation ? lang.getMessage( _x ) : _x;
    }

    function setCustomCSSOutput(css){
        self.setCustomCSSOutput(css);

        var utrComputedStyle = window.getComputedStyle(utrContainer.parents(".utr.utr--main").get(0));
        var isCustomCSSHidingUtr = utrComputedStyle.getPropertyValue("visibility") !== "visible" || utrContainer.parents(".utr.utr--main").is(":hidden");
        delete(utrComputedStyle);

        if(isCustomCSSHidingUtr){
            utrCustomCSSWarning = true;
            if (utrCustomCSS) {
                $(utrCustomCSS.codeMirror.getWrapperElement())
                    .before(utrCustomCSS.warning);
            }
            if (utrCustomCSSCodeEditor) {
                $(utrCustomCSSCodeEditor.codeMirror.getWrapperElement())
                .before(utrCustomCSSCodeEditor.warning);
            }
            self.destroyCustomCSSOutput();
        } else {
            utrCustomCSSWarning = false;
            if (utrCustomCSS) {
                utrCustomCSS.warning.remove();
            }
            if (utrCustomCSSCodeEditor) {
                utrCustomCSSCodeEditor.warning.remove();
            }
        }

        return !isCustomCSSHidingUtr;
    }

    function getThemeStyles(callback, callback2) {
        $.universalThemeRoller("getThemeStyles", callback, callback2);
    }
    function createThemeStyle(baseStyleId, styleName, config, styleCSS, callback, callback2) {
        $.universalThemeRoller("createThemeStyle", baseStyleId, styleName, config, styleCSS, callback, callback2);
    }
    function updateThemeStyle(styleId, styleName, config, styleCSS, callback, callback2) {
        $.universalThemeRoller("updateThemeStyle", styleId, styleName, config, styleCSS, callback, callback2);
    }
    function setThemeStyleAsCurrent(styleId, styleName, config, styleCSS, callback, callback2) {
        $.universalThemeRoller("setThemeStyleAsCurrent", styleId, styleName, config, styleCSS, callback, callback2);
    }

    function themeState(value, state, stringify) {
        stringify = typeof stringify === 'undefined' ? true : !!stringify;
        if (typeof state === 'undefined') {
            // Getter
            state = localStorage.getItem( value );
            try {
                return JSON.parse(state);
            } catch(e) {
                return state;
            }
        } else {
            // Setter
            localStorage.setItem( value, stringify ? JSON.stringify(state) : state);
            // Added for saving the state and returning it set some variable
            return state;
        }
    }

    function lessColorVariableChangeHandler(variableName, variableValue, emitter){
        window.clearInterval(colorTimerInterval);

        modifyVars[variableName] = variableValue;
        recompile(modifyVars, true, null, null, null, emitter);
        styleHasChanged = true;
        resetButton.toggleClass('utr-container__button--disable', false);
        toolbarResetButton.toggleClass('utr-toolbar-button--disable', false);
        themeState('STYLE_HAS_CHANGED', true);
    }

    function createSelectControl(controlLessVariable, controlAttributes){
        controlAttributes.reset = typeof controlAttributes.reset === 'undefined' ? true : !!controlAttributes.reset;
        var controlContainer = $(document.createElement("div")).addClass("utr-container__field utr-container__field--var utr-container__field--select");
        var controlId = "utr-" + controlLessVariable.replace("@", "");
        var control = $(document.createElement("select"))
            .attr("id", controlId)
            .addClass('utr-reset');
        var controlLabel = $(document.createElement("label")).attr("for", controlId).text(translate(controlAttributes.name));

        for(var i in controlAttributes.options) {
            control.append(
                $(document.createElement('option'))
                    .attr('value', controlAttributes.options[i].r)
                    .text(controlAttributes.options[i].d)
            );
        }

        control
            .val(less.vars[controlLessVariable].value)
            .change(function(eventObject){
                modifyVars[controlLessVariable] = $(this).val();
                recompile(modifyVars);
                styleHasChanged = true;
                resetButton.toggleClass('utr-container__button--disable', false);
                toolbarResetButton.toggleClass('utr-toolbar-button--disable', false);
                themeState('STYLE_HAS_CHANGED', true);
                controlContainer.find('.utr-container__field--select__container__text').text($('option:selected', control).text()); // Oh boy... TODO: refactor everything.
            })
            .bind("utr-reset", function(){
                delete modifyVars[controlLessVariable];
            })
            .bind("utr-after-compile", function(){
                $(this).val(less.vars[controlLessVariable].value);
            });

        controlContainer.append(control).append(controlLabel);

        return controlContainer;
    }

    function rgbaToRgb(color) {
        var result = color;
        if(color !== undefined){
            result = color.replace(/\s*rgba\(((?:\s*[0-9]{1,3},){2}\s*[0-9]{1,3}),\s*[0-1](?:.[0-9]+)?\)\s*\s*/i, "rgb($1)");
        }
        return result;
    }

    function getPerceivedLuminance(color){
        var rgbColor = d3.rgb(rgbaToRgb(color));
        // The Luminance component (Y) of the YIQ
        return (rgbColor.r * 299 + rgbColor.g * 587 + rgbColor.b * 114) / 1000;
    }

    function createColorSetControl(controlLessVariables){
        var controlContainer = $(document.createElement("div"))
            .addClass("utr-container__field utr-container__field--var utr-container__field--color-picker utr-reset");
        var controlLabel = $(document.createElement("label")).text( translate(controlLessVariables[0].subgroup) );

        function getRelativeLuminance(color) {
            // http://www.w3.org/TR/WCAG/#relativeluminancedef

            var RGB = d3.rgb(rgbaToRgb(color));
            var sRGB = {
                r: RGB.r/255,
                g: RGB.g/255,
                b: RGB.b/255
            };
			RGB = {
                r:(sRGB.r <= 0.03928) ? sRGB.r/12.92 : Math.pow(((sRGB.r + 0.055)/1.055), 2.4),
                g:(sRGB.g <= 0.03928) ? sRGB.g/12.92 : Math.pow(((sRGB.g + 0.055)/1.055), 2.4),
                b:(sRGB.b <= 0.03928) ? sRGB.b/12.92 : Math.pow(((sRGB.b + 0.055)/1.055), 2.4)
            };
            delete(sRGB);

            return 0.2126 * RGB.r + 0.7152 * RGB.g + 0.0722 * RGB.b;
        }

        function getContrastRatio(colorA, colorB) {
            var colorALuminance = getRelativeLuminance(colorA);
            var colorBLuminance = getRelativeLuminance(colorB);

            // http://www.w3.org/TR/WCAG/#contrast-ratiodef
            return (Math.max(colorALuminance, colorBLuminance) + 0.05) / (Math.min(colorALuminance, colorBLuminance) + 0.05);
        }

        function createPicker(controlLessVariable) {
            controlLessVariable.reset = typeof controlLessVariable.reset === 'undefined' ? true : !!controlLessVariable.reset;
            return createColorPicker(controlLessVariable.var, controlLessVariable.reset);
        }

        function createInformationItem(iconName){
            var control = $(document.createElement("div"))
                .addClass("utr-information-item a-Icon icon-tr-" + iconName);
            return control;
        }

        function createContrastRatioInformationItemRow(contrastRatioInformation, inlineNotice){
            var row = $(document.createElement("div")).addClass("utr-information-item-row");
            var colorA = $(document.createElement("div")).addClass("utr-color");
            var colorB = colorA.clone().css("background-color", contrastRatioInformation.colorB);
            var showNotice = contrastRatioInformation.contrastRatio >= 3 && contrastRatioInformation.contrastRatio < 4.5;
            colorA.css("background-color", contrastRatioInformation.colorA);

            if(contrastRatioInformation.contrastRatio >= 3){
                row.append(
                    $(document.createElement("div"))
                        .addClass("utr-information-item-guidelinePassed")
                        .text(contrastRatioInformation.contrastRatio >= 7 ? "AAA" : "AA")
                );
            }

            row.append(
                colorA,
                colorB,
                $(document.createElement("div"))
                    .addClass("utr-information-item-contrastRatio")
                    .text(contrastRatioInformation.contrastRatio),
                $(document.createElement("div"))
                    .addClass("utr-information-item-status")
                    .text(contrastRatioInformation.contrastRatio >= 3 ? STR.CONTRAST_VALIDATION_PASSED + (!!!inlineNotice && showNotice ? "*" : "") : STR.CONTRAST_VALIDATION_FAILED)
            );

            if(!!inlineNotice && showNotice) {
                row.append(
                    $(document.createElement("div")).addClass("utr-information-item-notice").text(STR.CONTRAST_VALIDATION_LARGE_TEXT_NOTICE)
                );
            }

            return row;
        }

        for (var i = 0; i < controlLessVariables.length; i++) {
            controlContainer.append(createPicker(controlLessVariables[i]));
        }

        var controlLessContrastCheckVariables = controlLessVariables.filter(function(d){ return (d.checkContrast === undefined) ? true : d.checkContrast; });
        function testColorContrast(){
            if(controlLessContrastCheckVariables.length >= 2){
                var contrastRatioInformationElementsHTML = $(document.createElement("div"))
                .append(
                    $(document.createElement("div"))
                        .addClass("utr-information-item-header")
                        .append(
                            $(document.createElement("div"))
                                .addClass("utr-information-item-header-icon a-Icon icon-tr-contrast")
                        )
                        .append(
                            $(document.createElement("h3"))
                                .addClass("utr-information-item-header-title")
                                .text(STR.CONTRAST_VALIDATION_TITLE)
                        )
                )
                .html();

                var currentContrastRatioInformation;
                var utrInformationItemContent = $(document.createElement("div"))
                    .addClass("utr-information-item-content");
                var failedContrastRatioValidation = false;
                var warningContrastRatioValidation = false;

                for(var i = controlLessContrastCheckVariables.length - 1; i >= 0; i--){
                    for(var j = i - 1; j >= 0; j--){
                        currentContrastRatioInformation = {
                            colorA: less.vars[controlLessContrastCheckVariables[i].var].value,
                            colorB: less.vars[controlLessContrastCheckVariables[j].var].value
                        };
                        currentContrastRatioInformation.contrastRatio = Math.floor(getContrastRatio(currentContrastRatioInformation.colorA, currentContrastRatioInformation.colorB) * 100) / 100;
                        failedContrastRatioValidation = failedContrastRatioValidation || currentContrastRatioInformation.contrastRatio < 3;
                        warningContrastRatioValidation = warningContrastRatioValidation || currentContrastRatioInformation.contrastRatio < 4.5;
                        utrInformationItemContent.append(createContrastRatioInformationItemRow(currentContrastRatioInformation, controlLessContrastCheckVariables.length === 2));
                    }
                }

                contrastRatioInformationElementsHTML += $(document.createElement("div")).append(utrInformationItemContent).html() +
                    (
                        controlLessContrastCheckVariables.length > 2 && warningContrastRatioValidation ?
                        $(document.createElement("div"))
                            .append(
                                $(document.createElement("div"))
                                    .addClass("utr-information-item-footerNotice")
                                    .text("* " + STR.CONTRAST_VALIDATION_LARGE_TEXT_NOTICE)
                            )
                            .html() :
                        ""
                    ) +
                    $(document.createElement("div"))
                        .append(
                            $(document.createElement("div"))
                                .addClass("utr-information-item-footer")
                                .text(STR.CONTRAST_VALIDATION_MESSAGE)
                        )
                        .html();

                return {
                    failed : failedContrastRatioValidation,
                    warning : warningContrastRatioValidation,
                    output : contrastRatioInformationElementsHTML
                };
            }
            return {};
        }

        var informationItem;

        if(controlLessContrastCheckVariables.length >= 2){
            var contrastTest = testColorContrast();
            informationItem = createInformationItem( contrastTest.failed ? "fail" : (contrastTest.warning ? "warning" : "pass") );
            informationItem.data("color-contrast-information-markup", contrastTest.output );

            controlContainer.append(informationItem);
            controlContainer.tooltip({
                tooltipClass: "utr-information-item-tooltip",
                items: ".utr-information-item",
                content: function(){
                    var element = $(this);

                    if(element.is(".utr-information-item")){
                        return element.data("color-contrast-information-markup");
                    }
                }
            });
            controlContainer.bind('utr-after-compile', function(){
                contrastTest = testColorContrast();
                informationItem.removeClass("icon-tr-fail icon-tr-warning icon-tr-pass");
                informationItem.addClass("icon-tr-" + (contrastTest.failed ? "fail" : (contrastTest.warning ? "warning" : "pass")));
                informationItem.data("color-contrast-information-markup", contrastTest.output );
            })
        }

        controlContainer.append(controlLabel);

        return controlContainer;
    }

    var colorPickerGenerator = d3.oracle.colorpicker();
    var currentColorPickerVariable;
    function createColorPicker(controlLessVariable, isReset) {
        var controlId = "utr-" + controlLessVariable.replace("@", "");
        var control = $(document.createElement("div")).attr("id", controlId).addClass("utr-color-picker utr-reset");
        var colorTimer;
        var colorpickerContainer =  ".utr .d3colorpicker";
        control
            .attr("title", less.vars[controlLessVariable].subgroup ? translate(less.vars[controlLessVariable].name) : null)
            .css({
                "background-color": less.vars[controlLessVariable].value,
                color: getPerceivedLuminance(less.vars[controlLessVariable].value) >= 128 ? "black" : "white"
            })
            .hover(function(e) {
                control.toggleClass('utr-color-picker--reset a-Icon icon-tr-reset', isAltPressed);
                currentHoverControl = control;
            }, function(e) {
                control.removeClass('utr-color-picker--reset a-Icon icon-tr-reset');
                currentHoverControl = $();
            })
            .on("click", function(e){
                var clickableElement = this;
                if (isAltPressed) {
                    // Prevent default, maybe? We need to stop the colorpicker.
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    control.trigger('utr-reset');
                    modifyVars = $.extend({}, (selectedStyle.config || {}).vars, modifyVars);
                    recompile(modifyVars);
                    themeState('VARS', modifyVars);
                    return false;
                }

                currentColorPickerVariable = controlLessVariable;

                d3.select( colorpickerContainer )
                    .datum( less.vars[controlLessVariable].value )
                    .call( colorPickerGenerator
                        .on('colorchange', function(d){
                            clearTimeout(colorTimer);
                            colorTimer = setTimeout(function(){
                                control.css({
                                    "background-color": d.toString(),
                                    color: getPerceivedLuminance(d.toString()) >= 128 ? "black" : "white"
                                });
                                lessColorVariableChangeHandler(controlLessVariable, d.toString(), control);
                            }, 100);
                        })
                    );

                $( colorpickerContainer )
                    .show()
                    .focus()
                    .position({
                        of: $( clickableElement ),
                        my: "left top",
                        at: "right bottom"
                    });

            })
            /*.ColorPicker({
                eventName: "click",
                color: less.vars[controlLessVariable].value,
                onChange: function(hsb, hex, rgb, el) {
                    control.css({
                        "background-color": "#" + hex,
                        color: getPerceivedLuminance(hex) >= 128 ? "black" : "white"
                    });
                    lessColorVariableChangeHandler(controlLessVariable, "#" + hex);
                },
                onHide: function() {
                    control.ColorPickerSetColor(less.vars[controlLessVariable].value);
                }
            })
            .ColorPickerSetColor(less.vars[controlLessVariable].value)*/
            .bind("utr-reset", function(){
                delete modifyVars[controlLessVariable];
            })
            .bind("utr-after-compile", function (event, emitter) {
                $(this)
                    .css({
                        "background-color": less.vars[controlLessVariable].value,
                        color: getPerceivedLuminance(less.vars[controlLessVariable].value) >= 128 ? "black" : "white"
                    });
                    var picker = d3.select( colorpickerContainer );
                    if (currentColorPickerVariable === controlLessVariable && emitter !== control) {
                        picker
                            .datum( less.vars[controlLessVariable].value )
                            .call( colorPickerGenerator );
                    }
            });
        return control;
    }

    function createColorControl(controlLessVariable, controlAttributes){
        controlAttributes.reset = typeof controlAttributes.reset === 'undefined' ? true : !!controlAttributes.reset;
        var controlContainer = $(document.createElement("div")).addClass("utr-container__field utr-container__field--var utr-container__field--color-picker");
        var control = createColorPicker(controlLessVariable, controlAttributes.reset);
        var controlLabel = $(document.createElement("label")).attr("for", control.attr('id')).text( translate(controlAttributes.name) );

        controlContainer.append(control).append(controlLabel);

        return controlContainer;
    }

    function createSliderControl(controlLessVariable, controlAttributes){
        controlAttributes.reset = typeof controlAttributes.reset === 'undefined' ? true : !!controlAttributes.reset;
        var controlContainer = $(document.createElement("div")).addClass("utr-container__field utr-container__field--var utr-container__field--slider");
        var controlId = "utr-" + controlLessVariable.replace("@", "");
        var controlText = $(document.createElement("div")).addClass("utr-slider__text").text(less.vars[controlLessVariable].value);
        var control = $(document.createElement("div")).attr("id", controlId).addClass("utr-slider utr-reset");
        var controlLabel = $(document.createElement("label")).attr("for", controlId).text( translate(controlAttributes.name) );

        control.slider({
            value: parseFloat(less.vars[controlLessVariable].value),
            min: controlAttributes.range.min,
            max: controlAttributes.range.max,
            step: controlAttributes.range.increment,
            change: function ( event, ui ) {
                controlText.text(modifyVars[controlLessVariable]);
                // We have to check if event was programatic or user-generated.
                if (event.hasOwnProperty('originalEvent')) {
                    modifyVars[controlLessVariable] = ui.value + (controlAttributes.units || "");
                    recompile(modifyVars);
                    styleHasChanged = true;
                    resetButton.toggleClass('utr-container__button--disable', false);
                    toolbarResetButton.toggleClass('utr-toolbar-button--disable', false);
                    themeState('STYLE_HAS_CHANGED', true);
                }
            },
            slide: function( event, ui ) {
                controlText.text(ui.value + (controlAttributes.units || ""));
            }
        })
        .bind("utr-reset", function(){
            delete modifyVars[controlLessVariable];
        }).bind("utr-after-compile", function(){
            $(this).slider("value", parseFloat(less.vars[controlLessVariable].value));
            controlText.text(less.vars[controlLessVariable].value);
        });

        controlContainer.append(controlText).append(control).append(controlLabel);

        return controlContainer;
    }

    function createControlGroup(groupName, groupElements, groupHiddenVars) {
        var groupHeader = $(document.createElement("h3"))
            .addClass("utr-group__header")
            .append(
                $(document.createElement("div"))
                    .addClass("utr-group__header-text")
                    .text( translate( groupName ))
            )
            .append(
                $(document.createElement("div"))
                    .addClass("utr-group__header-buttons")
                    .append(
                        $(document.createElement("a"))
                            .attr({
                                href:"#",
                                alt:STR.GROUP_RESET,
                                title:STR.GROUP_RESET
                            })
                            .addClass("utr-group-header-button")
                            .append(
                                $(document.createElement("span"))
                                    .addClass("utr-group-header-button__icon a-Icon icon-tr-reset")
                            ).click(function(eventObject){
                                eventObject.preventDefault();
                                eventObject.stopPropagation();
                                $(".utr-reset", groupControlsContainer).trigger("utr-reset");
                                modifyVars = $.extend({}, (selectedStyle.config || {}).vars, modifyVars);
                                recompile(modifyVars);
                                themeState('VARS', modifyVars);
                                return false;
                            })
                    )
            );

        var groupControlsContainer = $(document.createElement("div"))
            .append(groupElements);

        if ( groupHiddenVars && groupHiddenVars.length > 1 ) {
            groupControlsContainer.append(
                $( document.createElement("input") )
                    .attr( 'type', 'hidden' )
                    .addClass( 'utr-reset' )
                    .bind( 'utr-reset', function() {
                        for ( var i = 0; i < groupHiddenVars.length; i++ ) {
                            delete modifyVars[ groupHiddenVars[ i ] ];
                        }
                    })
            );
        }

        return groupHeader.add(groupControlsContainer);
    }

    function getOutputCSS() {
        var output =
            '/* \n' +
            ' * ' + getThemeName() + '\n' +
            ' *    (Oracle Application Express Theme Style)\n' +
            ' * \n' +
            ' * This CSS file was generated using the Oracle Application Express 5.0 Theme Roller. \n' +
            ' * \n' +
            //' * Upload it to your APEX instance to use it as a theme style.\n' +
            //' * \n' +
            //' * To use this same theme configuration on the Theme Roller, run the \n' +
            //' * following command on the JavaScript console on any page of your APEX\n' +
            //' * application (with Developer Mode enabled):\n' +
            //' *    $.universalThemeRoller("open", ' + JSON.stringify(modifyVars, null, '').replace(/\*\//g, '') + ', "' + getThemeName() + '"' + (utrCustomCSS.codeMirror && utrCustomCSS.codeMirror.getDoc().getValue().length > 0 ? ', ' + JSON.stringify(utrCustomCSS.codeMirror.getDoc().getValue()) : "") + ');\n' +
            ' */\n\n' +
            getLessOutput();

        // utrCustomCSS.codeMirror could not exist yet
        if(utrCustomCSS.codeMirror && utrCustomCSS.codeMirror.getDoc().getValue().length > 0){
            output += '\n\n/* \n * Oracle Application Express 5.0 Theme Roller Custom CSS \n *\n */\n\n' + utrCustomCSS.codeMirror.getDoc().getValue();
        };

        output = output.replace(/(\n\n+)/g, '\n\n');

        return output;
    }

    function getCustomCSSOutput() {
        return $('style[id="utr_custom-css-output"]').html();
    }
    function getLessOutput() {
        return $('style[id="utr_less-output"]').html();
    }
    function toggleNested(node, opened) {
        for (var i = node.children.length - 1; i >= 0; i--) {
            node.children[i].opened = opened;
            toggleNested(node.children[i], opened);
        };
    }

    function getThemeName() {
        return selectedStyle.name;
    }

    function getCSSFileName() {
        return  'theme-' + ($('#utr_theme_name').val() || 'Custom Style').replace(/[^a-z0-9_]/gi, '_').toLowerCase() + '.css';
    }

    function getCSSFileURI() {
        return URL.createObjectURL(new Blob([getOutputCSS()], { type:"text/css" }));
    }


    function setHistoryDelta(vars){
        if(historyEvent["undoRedo"] === 1){
            if(historyEvent["pos"] > 0){
                historyEvent["pos"]--;
            }
            if(historyEvent["size"] === 1){
                return vars;
            }
            historyEvent["undoRedo"] = 0;
            return buildHistoryState();
        } else if(historyEvent["undoRedo"] === -1){
            if(historyEvent["pos"] < (historyEvent["size"]-1)){
                historyEvent["pos"]++;
            }
            if(historyEvent["size"] === 1){
                return vars;
            }
            historyEvent["undoRedo"] = 0;
            return buildHistoryState();
        }
        if((historyEvent["pos"]+1) !== historyEvent["size"]){
            history["add"].splice(historyEvent["pos"]+1,historyEvent["size"]-historyEvent["pos"]-1);
            history["rem"].splice(historyEvent["pos"]+1,historyEvent["size"]-historyEvent["pos"]-1);
            historyEvent["size"] = historyEvent["pos"]+1;
        }
        if(typeof history === "undefined"){
            history = {add:[],rem:[]};
            if(Object.getOwnPropertyNames(vars).length !== 0){
                historyEvent["pos"]++;
                historyEvent["size"]++;
                var varsCopy = {};
                for(key in vars){
                    varsCopy[key] = vars[key];
                }
                history["add"].push(varsCopy);
                history["rem"].push({});
            } else{
                historyEvent["pos"]++;
                historyEvent["size"]++;
                history["add"].push({});
                history["rem"].push({});
            }
        } else {
            var hlenght = history["add"].length;
            if(hlenght >= 5){
                mergeOldHistory();
            }
            var pState = buildPreviousState();
            var diff = removeExisting(vars,pState);
            if(Object.getOwnPropertyNames(diff[0]).length === 0){
                if(hlenght >= 1){
                    var remHistory = diff[1];
                    if(Object.getOwnPropertyNames(remHistory).length !== 0){
                        historyEvent["pos"]++;
                        historyEvent["size"]++;
                        history["add"].push(diff[0]);
                        history["rem"].push(diff[1]);
                    }
                }
            } else {
                historyEvent["pos"]++;
                historyEvent["size"]++;
                history["add"].push(diff[0]);
                history["rem"].push(diff[1]);
            }
        }
        return vars;
    }

    function mergeOldHistory(){
        var last = history["add"][0];
        var secondToLast = history["add"][1];
        for(var key in last){
            if(!secondToLast.hasOwnProperty(key)){
                secondToLast[key] = last[key];
            }
        }
        history["add"][1] = secondToLast;
        history["add"].splice(0,1);

        var dlast = history["rem"][0];
        var dsecondToLast = history["rem"][1];
        for(var key in dlast){
            if(!dsecondToLast.hasOwnProperty(key)){
                dsecondToLast[key] = last[key];
            }
        }
        historyEvent["pos"]--;
        historyEvent["size"]--;
        history["rem"][1] = dsecondToLast;
        history["rem"].splice(0,1);
    }

    function buildHistoryState(){
        if(historyEvent["pos"] === 0){
            return history["add"][0];
        }
        var pos = historyEvent["pos"];
        var result = {};
        for(var i = 0; i <= pos; i++){
            var cHistory = history["add"][i];
            var dHistory = history["rem"][i];
            for(var key in dHistory){
                delete result[key];
            }
            for(var key in cHistory){
                result[key] = cHistory[key];
            }
        }
        return result;
    }

    function buildPreviousState(){
        var hlenght = history["add"].length;
        var pState = {};
        for(var i = 0; i < hlenght; i++){
            var cHistory = history["add"][i];
            var dHistory = history["rem"][i];
            for(var key in dHistory){
                delete pState[key];
            }
            for(var key in cHistory){
                pState[key] = cHistory[key];
            }

        }
        return pState;
    }
    function removeExisting(vars,historyObj){
        var diff = [{},{}];
        for(var key in vars){
            if(typeof historyObj[key] === "undefined"){
                diff[0][key] = vars[key];
            } else {
                if(historyObj[key] !== vars[key]){
                    diff[0][key] = vars[key];
                }
            }
        }
        for(var key in historyObj){
            if(!vars.hasOwnProperty(key)){
                diff[1][key] = historyObj[key];
            }
        }
        return diff;
    }

    function recompile(vars, saveState, prepareDownload, callback, callback2, emitter) {
        vars = vars || modifyVars;

        vars = setHistoryDelta(vars);

        saveState = typeof saveState === 'undefined' ? true : !!saveState;
        saveState && themeState('VARS', vars);

        prepareDownload = typeof prepareDownload === "undefined" ? true : !!prepareDownload;

        less.compile(lessCode, vars, function(css) {
            // Inject CSS code
            isOpenAndValid = true;
            useTranslation = less.translate;
            self.setLessOutput(css);
            callback && callback(css);
            $(".utr-reset").trigger("utr-after-compile", (emitter ? [emitter] : undefined));
        }, callback2);
    }

    function prepareDownloadButtons() {
        $('.utr-container__button--download').attr({
            download: getCSSFileName(),
            href: getCSSFileURI()
        });
    }

    function closeUTR(event, ui) {
    self.opened = false;
        themeState('OPENED', false);
        if (modifiedCurrentThemeStyle) {
            location.reload(true);
        }
        $( '.utr-color-picker' ).each(function() {
            $('#' + $(this).data('colorpickerId')).remove();
        });
        $( '.utr-container' ).dialog('destroy').remove();
        $( window ).off('.utr-positioning');
        self.removeStylesheets();
        self.enableCurrentStylesheets(currentThemeStylesheets);
        self.destroyCustomCSSOutput();
        self.destroyLessOutput();
        unbindKeyHandlers();
        toggleNested(self, false);
        isOpenAndValid = false;
    }

    function getStyle(id) {
        for (var i = existingStyles.length - 1; i >= 0; i--) {
            if (existingStyles[i].id === id) return existingStyles[i];
        };
    }

    var isAltPressed = false;
    function keyupHandler(e) {
        if (e.which === 18) {
            isAltPressed = false;
            currentHoverControl.removeClass( 'utr-color-picker--reset a-Icon icon-tr-reset' );
            $(document).off('keyup', keyupHandler);
            $(document).on('keydown', keydownHandler);
        }
    }
    function keydownHandler(e) {
        if (e.which === 18) {
            isAltPressed = true;
            currentHoverControl.addClass( 'utr-color-picker--reset a-Icon icon-tr-reset' );
            $(document).on('keyup', keyupHandler);
            $(document).off('keydown', keydownHandler);
        }

        var evtobj = window.event ? window.event : e;
        if (evtobj.keyCode === 90 && evtobj.ctrlKey){
            historyEvent["undoRedo"] = 1;
            recompile();
        }
        if (evtobj.keyCode === 89 && evtobj.ctrlKey){
            historyEvent["undoRedo"] = -1;
            recompile();
        }
    }
    function bindKeyHandlers() {
        //$( document ).on( 'keyup', keyupHandler );
        $( document ).on( 'keydown', keydownHandler );
    }
    function unbindKeyHandlers() {
        $( document ).off( 'keyup', keyupHandler );
        $( document ).off( 'keydown', keydownHandler );
    }

    function getNameFromStyle(style) {
        var name = style.name + (isRollable(style) ? '' : ' *');
        if (style.isCurrent) {
            name += " (" + STR.CURRENT + ")";
        }
        return name;
    }

    function modalAlert(title, message, elements) {
        return function() {

            var utrConfirm = $(document.createElement("div")).addClass("utr-container").attr("title", title);
            var utrConfirmBody = $(document.createElement("div"))
                .addClass("utr-container__body")
                .text(message);

            if (elements) {
                utrConfirmBody.append(elements);
            }
            utrConfirm.append(utrConfirmBody);
            $('body').append(utrConfirm);
            utrConfirm.dialog({
                dialogClass: "utr",
                modal: true,
                resizable: false,
                position: {
                    my:"center center",
                    at:"center center",
                    of: $(window)
                },
                create: function(event) { $(event.target).dialog("widget").css({ "position": "fixed" }); },
                buttons:{
                    "OK": function() {
                        utrConfirm.dialog('close');
                    }
                },
                close: function(event, ui) {
                    $(this).dialog('destroy').remove();
                }
            });

        };
    }
    function displayHelp(e){
        var elements = $();
        elements = elements.add(
            $(document.createElement('p')).text(STR.HELP_P1)
        );
        elements = elements.add(
            $(document.createElement('p')).text(STR.HELP_P2)
        );
        modalAlert(STR.HELP, null, elements)();
        e.preventDefault();
        return false;
    }

    function resetUTR(e){
        utrCustomCSS.control.trigger('utr-reset');
        paletteContainer$.trigger('utr-reset');
        modifyVars = $.extend({}, (selectedStyle.config || {}).vars);
        recompile(modifyVars);
        themeState('VARS', modifyVars);
        themeState('META', {});
        styleHasChanged = false;
        resetButton.toggleClass('utr-container__button--disable', true);
        toolbarResetButton.toggleClass('utr-toolbar-button--disable', true);
        themeState('STYLE_HAS_CHANGED', false);

        if ( e && e.preventDefault ) {
            e.preventDefault();
        }
        return false;
    }



    function renderButtons(utrBaseStyleControl) {
        var save = function( onSuccess, onError ) {
            var customCSS = utrCustomCSS.codeMirror.getDoc().getValue();
            updateThemeStyle(selectedStyle.id, getThemeName(), { customCSS: customCSS, vars: modifyVars }, getOutputCSS(), function() {
                if (selectedStyle.isCurrent) {
                    modifiedCurrentThemeStyle = true;
                }
                !selectedStyle.config && (selectedStyle.config = {});
                selectedStyle.config.vars = $.extend({}, modifyVars);
                selectedStyle.config.customCSS = customCSS;
                selectedStyle.name = getThemeName();
                $('option', utrBaseStyleControl)
                    .filter(function(){
                        return $(this).attr('value') === selectedStyle.id;
                    }).text(getNameFromStyle(selectedStyle));
                utrBaseStyleControl.next(".utr-container__field--select__container__text").text(getNameFromStyle(selectedStyle));
                styleHasChanged = false;
                resetButton.toggleClass('utr-container__button--disable', true);
                toolbarResetButton.toggleClass('utr-toolbar-button--disable', true);
                onSuccess();
            }, function(data) {
                modalAlert(STR.ERROR, STR.ERROR_CREATE_FAILED + '. \n\n' + data.responseJSON.error)();
                if ( onError ) onError();
            });
        };
        var utrAnchorContainer = $(document.createElement("div"))
            .addClass('utr-container__buttons utr-container__buttons--fixed');
        var utrAnchorReset = resetButton = $(document.createElement("a"))
            .addClass('utr-container__button')
            .toggleClass('utr-container__button--disable', !styleHasChanged)
            .attr('href', '#')
            .text(STR.RESET)
            .click(resetUTR)
            .css("display", "none"); // Hide this button.
        var setAsCurrent$ = $(document.createElement("a"))
            .addClass('utr-container__button')
            .toggleClass('utr-container__button--disable', selectedStyle.isCurrent)
            .css("float", "left")
            .attr('href', '#')
            .text(STR.SET_AS_CURRENT)
            .click(function(e) {
                if (selectedStyle.isCurrent) return;
                var saveThemeAndSetAsCurrent = function () {
                    var spinner$ = apex.util.showSpinner();
                    var setCurrent = function() {
                        setThemeStyleAsCurrent(selectedStyle.id, function() {
                            modalAlert(STR.COMMON_SUCCESS, STR.SET_AS_CURRENT_THEME_STYLE_SUCCESS)();
                            setAsCurrent$.addClass('utr-container__button--disable');
                            for (var i = existingStyles.length - 1; i >= 0; i--) {
                                existingStyles[i].isCurrent = false;
                            };
                            selectedStyle.isCurrent = true;
                            modifiedCurrentThemeStyle = true;
                            $('option', utrBaseStyleControl).each(function() {
                                var id = $(this).attr('value');
                                $(this).text(getNameFromStyle(getStyle(id)));
                            });
                            utrBaseStyleControl.next(".utr-container__field--select__container__text").text(getNameFromStyle(selectedStyle));
                            spinner$.remove();
                        }, function(data) {
                            spinner$.remove();
                            modalAlert(STR.ERROR, STR.ERROR_SET_AS_CURRENT_FAILED + '. \n\n' + data.responseJSON.error)();
                        });
                    };
                    if ( selectedStyle.isReadOnly ) {
                        setCurrent();
                    } else {
                        save( setCurrent, function() {
                            spinner$.remove();
                        });
                    };
                };
                if ( selectedStyle.isReadOnly && styleHasChanged ) {
                    var utrConfirm = $(document.createElement("div")).addClass("utr-container").attr("title", STR.COMMON_WARNING);
                    var utrConfirmBody = $(document.createElement("div"))
                        .addClass("utr-container__body")
                        .text(STR.SET_CURRENT_WHEN_READ_ONLY_PROMPT);
                    utrConfirm.append(utrConfirmBody);
                    $('body').append(utrConfirm);
                    var buttons = {};
                    buttons[STR.SET_AS_CURRENT_THEME_STYLE] = function() {
                        utrConfirm.dialog('close');
                        setTimeout(function() {
                            resetUTR();
                        }, 10);
                        saveThemeAndSetAsCurrent();
                    };
                    buttons[STR.COMMON_CANCEL] = function() {
                        utrConfirm.dialog('close');
                    };
                    utrConfirm.dialog({
                        dialogClass: "utr",
                        modal: true,
                        resizable: false,
                        position: {
                            my:"center center",
                            at:"center center",
                            of: $(window)
                        },
                        create: function(event) { $(event.target).dialog("widget").css({ "position": "fixed" }); },
                        buttons: buttons,
                        close: function(event, ui) {
                            $(this).dialog('destroy').remove();
                        }
                    });
                } else {
                    saveThemeAndSetAsCurrent();
                }
                if ( e ) {
                    e.preventDefault();
                }
                return false;
            });

        var utrAnchorSaveAs = $(document.createElement("a"))
            .addClass('utr-container__button')
            .attr('href', '#')
            .text(STR.SAVE_AS)
            .click(function(e) {
                var utrThemeNameContainer = $(document.createElement("div"))
                    .addClass('utr-container__field utr-container__field--text-field');
                var utrThemeNameLabel = $(document.createElement("label"))
                    .attr('for', 'utr_theme_name')
                    .text(STR.COMMON_STYLE_NAME);
                var utrThemeNameControl = $(document.createElement("input"))
                    .attr({
                        id: 'utr_theme_name',
                        type: 'text',
                        maxlength: 30
                    })
                    .val(getThemeName() + " (" + STR.COPY + ")");

                var utrConfirm = $(document.createElement("div")).addClass("utr-container").attr("title", STR.SAVE_AS);
                var utrConfirmBody = $(document.createElement("div"))
                    .addClass("utr-container__body")
                    .text(STR.SAVE_AS_PROMPT)
                    .append(
                        utrThemeNameContainer
                            .append(utrThemeNameControl)
                            .append(utrThemeNameLabel)
                            .addClass('utr-container__field--ungrouped')
                    );
                utrConfirm.append(utrConfirmBody);
                $('body').append(utrConfirm);
                var customCSS = utrCustomCSS.codeMirror.getDoc().getValue();
                var btns = {};
                btns[STR.COMMON_CANCEL] = function(){
                    $(this).dialog('destroy').remove();
                };
                btns[STR.SAVE] = function() {
                    //console.log(modifyVars);
                    createThemeStyle(selectedStyle.id, utrThemeNameControl.val(), { customCSS: customCSS, vars: modifyVars }, getOutputCSS(), function(style) {
                        var newStyleId = style.id;
                        utrConfirm.dialog('close');
                        modalAlert(STR.COMMON_SUCCESS, STR.SAVE_AS_SUCCESS)();
                        getThemeStyles(function(pData) {
                            existingStyles = pData;
                            selectedStyle = getStyle(newStyleId);
                            var updatedUtrAnchorContainer = renderButtons(utrBaseStyleControl);
                            $( ".utr-container__buttons" ).replaceWith( updatedUtrAnchorContainer );

                            utrBaseStyleControl
                                .append(
                                    $(document.createElement('option'))
                                        .attr('value', selectedStyle.id)
                                        .text( getNameFromStyle(selectedStyle) )
                                )
                                .val(selectedStyle.id);
                            utrBaseStyleControl.next(".utr-container__field--select__container__text").text($('option:selected', utrBaseStyleControl).text());
                            themeState("BASE_STYLE_ID", selectedStyle.id);
                        });
                        styleHasChanged = false;
                        resetButton.toggleClass('utr-container__button--disable', true);
                        toolbarResetButton.toggleClass('utr-toolbar-button--disable', true);
                        themeState('STYLE_HAS_CHANGED', false);
                    }, function(data) {
                        utrConfirm.dialog('close');
                    });
                };

                utrConfirm.dialog({
                    dialogClass: "utr",
                    modal: true,
                    resizable: false,
                    position: {
                        my:"center center",
                        at:"center center",
                        of: $(window)
                    },
                    create: function(event) { $(event.target).dialog("widget").css({ "position": "fixed" }); },
                    buttons: btns,
                    close: function(event, ui) {
                        $(this).dialog('destroy').remove();
                    }
                });

                e.preventDefault();
            });


        if (  !selectedStyle.isReadOnly ) {
            var utrAnchorSave = $(document.createElement("a"))
                .addClass('utr-container__button')
                .attr('href', '#')
                .text(STR.SAVE)
                .click(function(e) {
                    var utrThemeNameContainer = $(document.createElement("div"))
                        .addClass('utr-container__field utr-container__field--text-field');
                    var utrThemeNameLabel = $(document.createElement("label"))
                        .attr('for', 'utr_theme_name')
                        .text(STR.COMMON_STYLE_NAME);
                    var utrThemeNameControl = $(document.createElement("input"))
                        .attr({
                            id: 'utr_theme_name',
                            type: 'text',
                            maxlength: 30
                        })
                        .val(getThemeName());

                    var utrConfirm = $(document.createElement("div")).addClass("utr-container").attr("title", STR.SAVE);
                    var utrConfirmBody = $(document.createElement("div"))
                        .addClass("utr-container__body")
                        .text(STR.SAVE_PROMPT)
                        .append(
                            utrThemeNameContainer
                                .append(utrThemeNameControl)
                                .append(utrThemeNameLabel)
                                .addClass('utr-container__field--ungrouped')
                        );
                    utrConfirm.append(utrConfirmBody);
                    $('body').append(utrConfirm);
                    var btns = {};
                    btns[STR.COMMON_CANCEL] = function(){
                        $(this).dialog('destroy').remove();
                    };
                    btns[STR.SAVE] = function () {
                        save(function() {
                                utrConfirm.dialog('close');
                                modalAlert(STR.COMMON_SUCCESS, STR.SAVE_SUCCESS)();
                            }, function( data ) {
                                utrConfirm.dialog('close');
                            });
                    };

                    utrConfirm.dialog({
                        dialogClass: "utr",
                        modal: true,
                        resizable: false,
                        position: {
                            my:"center center",
                            at:"center center",
                            of: $(window)
                        },
                        create: function(event) { $(event.target).dialog("widget").css({ "position": "fixed" }); },
                        buttons: btns,
                        close: function(event, ui) {
                            $(this).dialog('destroy').remove();
                        }
                    });

                    e.preventDefault();
                });
                utrAnchorContainer
                    .append(utrAnchorReset)
                    .append(setAsCurrent$)
                    .append(utrAnchorSave)
                    .append(utrAnchorSaveAs);
        } else {
            utrAnchorContainer
                .append(utrAnchorReset)
                .append(setAsCurrent$)
                .append(utrAnchorSaveAs);
        }
        return utrAnchorContainer;
    }

    // Raw search match function
    // For optimization purposes the searchText must be uppered if the search is
    // insensitive (preventing multiple upperCasing of the same text)
    function match(name, searchText, insensitive) {
        insensitive = typeof insensitive === 'undefined' ? true : !!insensitive;


        // If the text is not a color    and the name/value a color
        // No match
        if (searchText.indexOf("#") !== 0 && name.indexOf("#") === 0) {
            return false;
        }

        var p_name = name;

        if (insensitive === true) {
            p_name = name.toUpperCase();
        }


        if (p_name.indexOf(searchText) >= 0) {
            return true;
        }

        return false;
    }

    // Simple RGB matcher in the form #000000
    function parseRGB(text) {
        var color = d3.rgb(rgbaToRgb(text));
        if(color.r === 0 && color.g === 0 && color.b === 0 && text.toUpperCase() !== "BLACK" &&
           text.toUpperCase() !== "#FFF"  &&
           text.toUpperCase() !== "#FFFFFF" &&
           text.toUpperCase() !== "rgb(0,0,0)") {
            return false;
        } else {
            return color;
        }
    }

    // max eucl space pre-calculated
    var colorCt = 441.67295593;
    function getColorDistance(c1, c2) {
        var r = Math.pow(c1.r-c2.r, 2);
        var g = Math.pow(c1.g-c2.g, 2);
        var b = Math.pow(c1.b-c2.b, 2);

        var sqr = Math.sqrt((r+g+b));

        return sqr/colorCt; // Percentage
    }

    function readySelectList() {
        $(this).wrap($(document.createElement("div"))
                .addClass("utr-container__field--select__container")
        );
        $(this).after($(document.createElement("div"))
                .addClass("utr-container__field--select__container__text")
        );
        $(this).next(".utr-container__field--select__container__text")
            .after($(document.createElement("div"))
                .addClass("utr-container__field--select__container__arrow")
        );
        var val = $(this).children("option:selected").text();
        $(this).next(".utr-container__field--select__container__text").text(val);
    }

    function renderControls(appendTo, searchText) {
        var result = $();
        var controls = less.vars;
        var firstValidControl = true;
        var controlGroups = {};
        var controlSubgroups = {};
        var ungroupedControls = $();
        var currentControl = null;
        var currentControlGroup = null;
        var currentControlSubgroup = null;
        var doSearch = !!searchText;
        var processedSearchText = null;
        var parsedSearchColor = null;
        var isInsensitive = true;

        var hiddenVariables = {};

        if ( doSearch ) {
            // Forcing lower case in case the color string is in upper case
            // D3 does not recognize uppercase words
            parsedSearchColor = parseRGB(searchText.toLowerCase());

            if (searchText.length >= 2 && searchText.indexOf('"') === 0 && searchText.slice(-1) === '"') {
                //Is case sensitive
                isInsensitive = false;
                processedSearchText = searchText.slice(1, searchText.length-1);
            } else {
              processedSearchText = searchText.toUpperCase();
            }


        }

        for (var i = 0; i < less.groups.length; i++) {
            if ( less.groups[i].common || !commonOnly ) {
                controlGroups[ less.groups[i].name ] = $();
            }
        };

        for (var control in controls) {
            if (controls[control].name && validControlTypes.indexOf(controls[control].type) > -1) {
                controls[control].var = control;
                currentControlGroup = controls[control].group;
                currentControlSubgroup = controls[control].subgroup;

                if ( ( !controls[control].common && commonOnly ) || !controlGroups[currentControlGroup] ) {
                    hiddenVariables[ currentControlGroup ] = hiddenVariables[ currentControlGroup ] || [];
                    hiddenVariables[ currentControlGroup ].push( control );
                    continue;
                }

                if (doSearch) {
                    if (!match(translate(controls[control].name), processedSearchText, isInsensitive) &&
                        !match(translate(controls[control].value), processedSearchText, isInsensitive) &&
                        !match(translate(controls[control].group) || '', processedSearchText, isInsensitive) &&
                        !match(translate(controls[control].subgroup) || '', processedSearchText, isInsensitive)    ) {
                        var parsedColorValue = parseRGB(controls[control].value);

                        if (parsedSearchColor !== false && parsedColorValue !== false) {
                            var distance = getColorDistance(parsedSearchColor, parsedColorValue);

                            if (distance > 0.1) {
                                hiddenVariables[ currentControlGroup ] = hiddenVariables[ currentControlGroup ] || [];
                                hiddenVariables[ currentControlGroup ].push( control );
                                continue; // Color is not close
                            }
                        } else {
                            //Skip rendering
                            hiddenVariables[ currentControlGroup ] = hiddenVariables[ currentControlGroup ] || [];
                            hiddenVariables[ currentControlGroup ].push( control );
                            continue;
                        }

                    }
                }

                if (!currentControlSubgroup) {
                    switch (controls[control].type) {
                        case "color": currentControl = createColorControl(control, controls[control]);
                            break;
                        case "number":
                            if(controls[control].hasOwnProperty("range")){
                                currentControl = createSliderControl(control, controls[control]);
                            }
                            break;
                        case "select":
                            if(controls[control].hasOwnProperty("options")){
                                currentControl = createSelectControl(control, controls[control]);
                            }
                            break;
                    }
                    if (firstValidControl) {
                        currentControl.attr("autofocus", "autofocus");
                    }

                    if (currentControlGroup) {
                        controlGroups[currentControlGroup] = controlGroups[currentControlGroup].add(currentControl);
                    } else {
                        ungroupedControls = ungroupedControls.add(currentControl.addClass('utr-container__field--ungrouped'));
                    }
                } else {
                    currentControlGroup = currentControlGroup || '';
                    !controlSubgroups[currentControlGroup] && (controlSubgroups[currentControlGroup] = {});
                    !controlSubgroups[currentControlGroup][currentControlSubgroup] && (controlSubgroups[currentControlGroup][currentControlSubgroup] = []);
                    controlSubgroups[currentControlGroup][currentControlSubgroup].push(controls[control]);
                }
                firstValidControl = false;
            }
        }

        for (var g in controlSubgroups) {
            for (var s in controlSubgroups[g]) {
                // Only colors supported right now.
                var out = createColorSetControl(controlSubgroups[g][s]).addClass('utr-container__field--composite');
                if (g === '') {
                    ungroupedControls = ungroupedControls.add(out.addClass('utr-container__field--ungrouped'));
                } else {
                    controlGroups[g] = controlGroups[g] || $();
                    controlGroups[g] = controlGroups[g].add(out);
                }
            }
        }

        result = result.add(ungroupedControls);

        for (var controlGroup in controlGroups) {
            if (controlGroups[controlGroup].length > 0) {
                result = result.add(createControlGroup(controlGroup, controlGroups[controlGroup], hiddenVariables[ controlGroup ]));
            }
        }

        appendTo && appendTo.append(result);

        return result;
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    function isRollable(style) {
        if (style.inputFileUrls && style.inputFileUrls.length > 0) {
            for (var i = style.inputFileUrls.length - 1; i >= 0; i--) {
                if (endsWith(style.inputFileUrls[i], '.less')) {
                    return true;
                }
            };
        }
        return false;
    }
    function adjustUTRHeight(eventObject){
        var utrDialog = utrContainer.parents(".utr.utr--main");

        utrContainerBody
            .css({
                "max-height": $(window).outerHeight()
                    - utrDialog.find(".ui-dialog-titlebar").outerHeight()
                    - utrContainer.find(".utr-container__buttons").outerHeight()
                    - $("#apexDevToolbar").outerHeight(),
                overflow: "auto"
            });
    }

    var paletteContainer,
        paletteContainer$ = $();

    function invokeUTR(input, name, css, baseStyleId, onFinishedLoading) {
        self.busy = true;
        toggleNested(self, true);
        bindKeyHandlers();
        function paletteChangeHandler(d){
            generateOutputColors.call(this, d);
            window.clearTimeout(paletteTimeout);
            paletteTimer = 0;
            paletteTimeout = window.setTimeout(function(){
                paletteTimer++;
                if ( paletteTimer >= 1 ) {
                    window.clearTimeout(paletteTimeout);

                    var autoFill = less.palette.autoFillOutputs;
                    var mapping = less.palette.outputMapping;

                    var i, j;
                    for ( var key in mapping ) {
                        key = parseInt( key );
                        if ( key > 19 || key < 0 ) {
                            continue;
                        }
                        // 4 possible output arrays
                        i = Math.floor( key / 5 );
                        // 5 possible items in subarray
                        j = key % 5;
                        if ( d.output[ i ] && d.output[ i ][ j ] ) {
                            modifyVars[ mapping[ key ] ] = d.output[ i ][ j ];
                        } else if ( autoFill ) {
                            modifyVars[ mapping[ key ] ] = d.output[ i % d.output.length ][ j ];
                        }
                    }

                    recompile(modifyVars);
                    styleHasChanged = true;
                    resetButton.toggleClass('utr-container__button--disable', false);
                    toolbarResetButton.toggleClass('utr-toolbar-button--disable', false);
                    themeState('PALETTE_GENERATOR_HUE',   d.primary.hsl().h);
                    themeState('PALETTE_GENERATOR_ANGLE', d.separation);
                    themeState('PALETTE_GENERATOR_SHADING', d.shading);
                    themeState('STYLE_HAS_CHANGED', true);
                    themeState('PALETTE_GENERATOR_USED', true);
                }
            }, 250);
        };
        function generateOutputColors ( d ) {
            var generatedColors = $(".utr-paletteGenerator-generatedColors");
            generatedColors = generatedColors.length === 0 ? generatedColors = $(document.createElement("div"))
                .addClass("utr-paletteGenerator-generatedColors") : generatedColors;

            generatedColors.empty();

            var currentItem,
                currentSubItem;

            for(var item in d.output){
                currentItem = $(document.createElement("div"))
                    .addClass("utr-paletteGenerator-generatedColors-item")
                    .css({
                        width: (100 / d.output.length) + "%"
                    });

                for(var subItem in d.output[item]){
                    // Third shade (2nd array position) is the main one
                    // Not sure why subItem is not an int at this stage
                    if(subItem === "2"){
                        currentItem.css({
                            background: d.output[item][subItem],
                            "border-color": d.output[item][subItem]
                        }).css("display", "none");
                    } else {
                        currentSubItem = $(document.createElement("div"))
                            .addClass("utr-paletteGenerator-generatedColors-subItem")
                            .css({
                                background: d.output[item][subItem]
                            }).css("display", "none")
                            .appendTo(currentItem);
                    }
                }
                //TODO: Get rid of the display: none!
                currentItem.appendTo(generatedColors);
            }

            $(".utr-paletteGenerator").append(generatedColors);
        }

        var paletteTimeout,
            paletteTimer;

        var paletteGenerator = d3.oracle.palette()
            .radius(8.5)
            .width(200)
            .complimentary(false)
            .on("palettechange", paletteChangeHandler);

        getThemeStyles(function(pData) {
            existingStyles = pData;

            for (var i = existingStyles.length - 1; i >= 0; i--) {
                if (existingStyles[i].isCurrent) {
                    currentThemeStylesheets = currentThemeStylesheets
                        .concat(existingStyles[i].cssFileUrls || [])
                        .concat(existingStyles[i].outputFileUrls || []);
                    break;
                }
            };

            var localStorageSearch = themeState('SEARCH') || "";

            name = name || (themeState('META') || {}).name || 'Custom Style';
            commonOnly = themeState('COMMON_ONLY');
            commonOnly = !(commonOnly === false);
            baseStyleId = baseStyleId || themeState("BASE_STYLE_ID");
            selectedStyle = getStyle(baseStyleId);
            if (!selectedStyle) {
                var iStyle;
                for (var i = existingStyles.length - 1; i >= 0; i--) {
                    iStyle = existingStyles[i];
                    if (iStyle.isCurrent) {
                        baseStyleId = iStyle.id;
                        selectedStyle = iStyle;
                        break;
                    }
                };
            }

            if ( !selectedStyle ) {
                // This theme has no styles?
                // modalAlert(STR.ERROR, STR.ERROR_UNSUPPORTED_THEME)();
                themeState('OPENED', false);
            } else {
                // User changes might be stale if theme style was removed or something.
                if (baseStyleId !== themeState('BASE_STYLE_ID')) {
                    themeState('VARS', {});
                    themeState('CUSTOM_CSS', '');
                    themeState('STYLE_HAS_CHANGED', false);
                    themeState('BASE_STYLE_ID', baseStyleId);
                }

                modifyVars = input || themeState('VARS') || {};
                css = css || themeState("CUSTOM_CSS") || (selectedStyle.config || {}).customCSS || '';
                modifyVars = $.extend({}, (selectedStyle.config || {}).vars, modifyVars);
                styleHasChanged = themeState('STYLE_HAS_CHANGED') || false;

                var accordionInitialized = false;

                function lessErrorHandler(error) {
                    utrStaticMessage.text(STR.ERROR_INVALID_STYLE);
                    isOpenAndValid = false;
                    if (error) {
                        debug.log( 'LESS compilation error for ' + selectedStyle.name );
                        debug.log( '  Line:' + error.line, '  Message: ' + error.message, error );
                    }
                    utrToolbar.hide();
                    utrContainer.closest('.utr').toggleClass('utr--static', true);
                }

                // Toolbar
                function toggleSplitButton(eventObject){
                    currentButton = $(this);

                    currentButton
                        .addClass("utr-toolbar-splitButton--active")
                        .parent()
                            .find(".utr-toolbar-splitButton")
                            .not(currentButton)
                            .removeClass("utr-toolbar-splitButton--active");
                }

                function toggleShowAttrButton(_common) {
                    if (_common === undefined) {
                        utrToolbarCommonBtn.toggleClass('utr-toolbar-splitButton--active');
                        utrToolbarAllBtn.toggleClass('utr-toolbar-splitButton--active');
                    } else if (_common) {
                        utrToolbarCommonBtn.toggleClass('utr-toolbar-splitButton--active', true);
                        utrToolbarAllBtn.toggleClass('utr-toolbar-splitButton--active', false);
                    } else {
                        utrToolbarCommonBtn.toggleClass('utr-toolbar-splitButton--active', false);
                        utrToolbarAllBtn.toggleClass('utr-toolbar-splitButton--active', true);
                    }
                }

                var utrToolbarCommonBtn;
                var utrToolbarAllBtn;

                function refreshControls(searchText, paletteDatum) {
                    //console.log("DDD");
                    //console.log(paletteDatum);
                    utrContainer.closest('.utr').removeClass('utr--static');

                    controls = less.vars;

                    searchText = searchText || '';
                    var renderedControls = renderControls(null, searchText);

                    utrContainerBody.find('.utr-container__field--var')
                        .remove();
                    utrAccordionWrapper
                        .empty()
                        .append(renderedControls.not('.utr-container__field--ungrouped'));

                    utrBaseStyleContainer.after(renderedControls.filter('.utr-container__field--ungrouped'));

                    utrCustomCSS = {
                        container: $(document.createElement("div"))
                            .addClass("utr-container__field utr-container__field--codearea-field"),
                        description: $(document.createElement("small"))
                            .addClass("utr-container__field-description")
                            .text(STR.CUSTOM_CSS_DESCRIPTION),
                        warning: $(document.createElement("small"))
                            .addClass("utr-container__field-warning")
                            .append($(document.createElement("span")).addClass("a-Icon icon-warning"))
                            .append(STR.CUSTOM_CSS_WARNING),
                        label: $(document.createElement("label"))
                            .attr("for", "utr_custom_css")
                            .addClass("utr-container__field-label utr-container__field-label--screen-reader-only")
                            .text(STR.CUSTOM_CSS),
                        control: $(document.createElement("textarea"))
                            .attr({
                                id: "utr_custom_css"
                            })
                            .addClass("utr-textarea utr-textarea--full-width utr-reset")
                            .val(css)
                            .bind("utr-reset", function(){
                                utrCustomCSS.codeMirror.getDoc().setValue(selectedStyle.config ? selectedStyle.config.customCSS : '');
                                $(this).val(selectedStyle.config ? selectedStyle.config.customCSS : '');
                                css = themeState('CUSTOM_CSS', selectedStyle.config ? selectedStyle.config.customCSS : '');
                            }),
                        controlGroupId: renderedControls.filter('h3').length,
                        hasBeenShowned: false,
                        dialogButton: $(document.createElement("a"))
                            .attr({
                                href:"#",
                                alt:STR.CODE_EDITOR,
                                title:STR.CODE_EDITOR
                            })
                            .addClass("utr-custom-css-header-button")
                            .append(
                                $(document.createElement("span"))
                                    .addClass("utr-custom-css-header-button__icon a-Icon icon-open-in-dialog")
                            ).click(function(eventObject){
                                eventObject.preventDefault();
                                eventObject.stopPropagation();

                                utrCustomCSSCodeEditor = {
                                    container: $(document.createElement("div"))
                                        .addClass("utr-container")
                                        .attr("title", STR.CUSTOM_CSS),
                                    containerBody: $(document.createElement("div"))
                                        .addClass("utr-container__body utr-container__body--no-padding"),
                                    warning: $(document.createElement("small"))
                                        .addClass("utr-container__field-warning")
                                        .append($(document.createElement("span")).addClass("a-Icon icon-warning"))
                                        .append(STR.CUSTOM_CSS_WARNING),
                                    textarea: $(document.createElement("textarea"))
                                        .addClass("utr-container__code")
                                        .val(utrCustomCSS.codeMirror.getDoc().getValue())
                                        .css({
                                            width: 770,
                                            height: 300,
                                            'font-family': "'Lucida Console', monospace",
                                            'border-color': '#e0e0e0'
                                        })
                                        .keydown(function(e){
                                            if (e.keyCode == 8) {
                                                e.preventDefault();
                                            }
                                        })
                                };

                                utrCustomCSSCodeEditor.containerBody
                                    .append(
                                        utrCustomCSSCodeEditor.textarea
                                    );
                                utrCustomCSSCodeEditor.container
                                    .append(
                                        utrCustomCSSCodeEditor.containerBody
                                    );
                                $("body")
                                    .append(
                                        utrCustomCSSCodeEditor.container
                                    );

                                utrCustomCSSCodeEditor.container.dialog({
                                    dialogClass: "utr utr--codeeditor",
                                    width: 800,
                                    modal: true,
                                    resizable: true,
                                    position: {
                                        my:"center center",
                                        at:"center center",
                                        of: $(window)
                                    },
                                    create: function(event) { $(event.target).dialog("widget").css({ "position": "fixed" }); },
                                    close: function(event, ui) {
                                        $(this).dialog('destroy').remove();
                                        utrCustomCSSCodeEditor = undefined;
                                    },
                                    resize: function(event, ui){
                                        var $Element = $(this);

                                        if(ui.originalSize.height != $Element.height()){
                                            utrCustomCSSCodeEditor.codeMirror.setSize(null, $Element.height());
                                        }
                                    }
                                });

                                utrCustomCSSCodeEditor.codeMirror = CodeMirror.fromTextArea(
                                    utrCustomCSSCodeEditor.textarea.get(0),
                                    {
                                        mode: "css",
                                        theme: "mbo",
                                        lineNumbers: true,
                                        lineWrapping: true
                                    }
                                );
                                utrCustomCSSCodeEditor.codeMirror.on("change", function(instance, changeObj){
                                    utrCustomCSS.codeMirror.getDoc().setValue(instance.getDoc().getValue());
                                });
                                utrCustomCSSCodeEditor.codeMirror.focus();
                                utrCustomCSSCodeEditor.codeMirror.setCursor(utrCustomCSSCodeEditor.codeMirror.lineCount(), 0);
                                $(utrCustomCSSCodeEditor.codeMirror.getWrapperElement())
                                    .addClass("utr-codearea utr-codearea--standard");

                                if (utrCustomCSSWarning) {
                                    $(utrCustomCSSCodeEditor.codeMirror.getWrapperElement())
                                        .before(utrCustomCSSCodeEditor.warning);
                                } else {
                                    utrCustomCSSCodeEditor.warning.remove();
                                }

                                return false;
                            })
                    };
                    utrCustomCSS.container.append(
                        utrCustomCSS.label,
                        utrCustomCSS.control,
                        utrCustomCSS.description
                    );
                    // If it is a search, hide the custom CSS and palette
                    if ((typeof searchText === 'undefined' || searchText === '')) {
                        utrAccordionWrapper.append(
                            $(document.createElement("h3"))
                                .addClass("utr-custom-css__header")
                                .append(
                                    $(document.createElement("div"))
                                        .addClass("utr-custom-css__header-text")
                                        .text( STR.CUSTOM_CSS )
                                )
                                .append(
                                    $(document.createElement("div"))
                                        .addClass("utr-custom-css__header-buttons")
                                        .append(
                                            utrCustomCSS.dialogButton
                                        )
                                )
                                .add(utrCustomCSS.container)
                        );
                        if ( less.palette.enabled ) {
                            function togglePaletteGeneratorSplitButton(eventObject){
                                currentButton = $(this);

                                currentButton
                                    .addClass("utr-paletteGenerator-toolbar-button--active")
                                    .parent()
                                        .find(".utr-paletteGenerator-toolbar-button")
                                        .not(currentButton)
                                        .removeClass("utr-paletteGenerator-toolbar-button--active");
                            }
                            function setComplementStatus(complementConstraint, complementControlElement){
                                var complementControl = complementControlElement instanceof jQuery ? complementControlElement : jQuery("#utr-paletteGenerator-complement");
                                var complementIsConstrained = typeof complementConstraint === "boolean";

                                return complementControl
                                    .prop("checked", complementIsConstrained ? complementConstraint : complementIsConstrained)
                                    .prop("disabled", complementIsConstrained)

                            }
                            function createPaletteModeButton(currentPaletteMode, complementConstraint){
                                return jQuery(document.createElement("button"))
                                    .addClass("utr-paletteGenerator-toolbar-button utr-paletteGenerator-toolbar-button-" + currentPaletteMode + (themeState("PALETTE_GENERATOR_MODE") === currentPaletteMode ? " utr-paletteGenerator-toolbar-button--active" : ""))
                                    .attr("title", STR["PALETTE_GENERATOR_" + currentPaletteMode.toUpperCase()])
                                    .click(function(eventObject){
                                        togglePaletteGeneratorSplitButton.call(this, eventObject);
                                        setComplementStatus(complementConstraint)
                                            .change();
                                        paletteGenerator
                                            .mode(currentPaletteMode);
                                        paletteContainer.call(paletteGenerator);
                                        generateOutputColors(paletteContainer.datum());
                                        themeState('PALETTE_GENERATOR_MODE', currentPaletteMode);
                                        paletteChangeHandler.call(paletteContainer.node(), paletteContainer.datum());
                                    });
                            }

                            var availableModes = {};
                            var currentMode,
                                currentModeHasComplement;
                            for(i in less.palette.availableModes){
                                currentMode = less.palette.availableModes[i].replace("+c", "");
                                currentModeHasComplement = less.palette.availableModes[i].indexOf("+c") > -1;

                                if(availableModes.hasOwnProperty(currentMode)){
                                   availableModes[currentMode] = undefined;
                                } else {
                                   availableModes[currentMode] = currentModeHasComplement;
                                }
                            }
                            delete currentModeHasComplement;

                            var defaultMode = less.palette.defaults.mode.replace("+c", "");
                            currentMode = themeState("PALETTE_GENERATOR_MODE") || defaultMode;

                            var utrPaletteGeneratorModeSplitButton = jQuery(document.createElement("div"))
                                .addClass("utr-paletteGenerator-toolbar-item utr-paletteGenerator-toolbar-splitButton");
                            for(i in availableModes){
                                utrPaletteGeneratorModeSplitButton
                                    .append(createPaletteModeButton(i, availableModes[i]));
                            }

                            var complementControl = jQuery(document.createElement("input"))
                                .addClass("utr-paletteGenerator-toolbar-input")
                                .attr("type", "checkbox")
                                .attr("id", "utr-paletteGenerator-complement")
                                .change(function(eventObject){
                                    paletteGenerator
                                        .complimentary(jQuery(this).is(":checked"));
                                    paletteContainer.call(paletteGenerator);
                                    generateOutputColors(paletteContainer.datum());
                                    paletteChangeHandler.call(paletteContainer.node(), paletteContainer.datum());

                                    themeState("PALETTE_GENERATOR_COMP", jQuery(this).prop("checked"));
                                })
                                .css("display", "none");//TODO: REMOVE LATER

                            setComplementStatus(availableModes[currentMode], complementControl)
                                .prop("checked", themeState("PALETTE_GENERATOR_COMP"));

                            var utrPaletteGenerator = jQuery(document.createElement("div"))
                                .addClass("utr-paletteGenerator")
                                .addClass("utr-reset")
                                //.hide()
                                .append(
                                    jQuery(document.createElement("div"))
                                        .addClass("utr-paletteGenerator-toolbar")
                                        .append(
                                            utrPaletteGeneratorModeSplitButton
                                        )
                                        .append(
                                            jQuery(document.createElement("div"))
                                                .addClass("utr-paletteGenerator-toolbar-item utr-paletteGenerator-toolbar-item--right utr-paletteGenerator-toolbar-item--field")
                                                .css({
                                                    "padding-right": "6px"
                                                })
                                                .append(
                                                    jQuery(document.createElement("label"))
                                                        .addClass("utr-paletteGenerator-toolbar-label")
                                                        .attr("for", "utr-paletteGenerator-complement")
                                                        .text(STR.PALETTE_GENERATOR_WITH_COMPLEMENT + ":")
                                                        .css("display", "none") //TODO: REMOVE LATER
                                                )
                                                .append(
                                                    complementControl
                                                )
                                        )
                                )
                                .append(
                                    paletteContainer$ = jQuery(document.createElement("div"))
                                        .addClass("a-D3Palette-container utr-reset")
                                        .bind("utr-reset", function(eventObject){
                                            togglePaletteGeneratorSplitButton.call(jQuery(".utr-paletteGenerator-toolbar-button-" + less.palette.defaults.mode.replace("+c", "")).get(0), eventObject);

                                            // Should we also erase all the variables that were bound via outputMapping?
                                            themeState('PALETTE_GENERATOR_USED', false);

                                            paletteGenerator
                                                .complimentary(themeState("PALETTE_GENERATOR_COMP", less.palette.defaults.mode.indexOf("+c") > -1))
                                                .mode(themeState('PALETTE_GENERATOR_MODE', less.palette.defaults.mode.replace("+c", "")));

                                            paletteContainer
                                                .datum({
                                                    primary: d3.rgb("hsl(" + themeState('PALETTE_GENERATOR_HUE', less.palette.defaults.hue) + ",100%,50%)"),
                                                    separation: themeState('PALETTE_GENERATOR_ANGLE', less.palette.defaults.separation)
                                                })
                                                .call(paletteGenerator);

                                            complementControl
                                                .prop("checked", themeState("PALETTE_GENERATOR_COMP"))
                                                .prop("disabled", less.palette.availableModes.indexOf(themeState('PALETTE_GENERATOR_MODE')) === -1 || less.palette.availableModes.indexOf(themeState('PALETTE_GENERATOR_MODE') + "+c") === -1);

                                            generateOutputColors(paletteContainer.datum());
                                        })
                                )
                                .append(
                                    jQuery(document.createElement("div"))
                                        .addClass("utr-paletteGenerator-generatedColors")
                                );

                            utrAccordionWrapper.prepend(
                                $(document.createElement("h3"))
                                    .addClass("utr-group__header")
                                    .append(
                                        $(document.createElement("div"))
                                            .addClass("utr-group__header-text")
                                            .text( STR.TOOLBAR_BUTTONS_PALETTE_GENERATOR )
                                    )
                                    .add( $(document.createElement("div"))
                                        .append(utrPaletteGenerator)
                                    )
                            );

                            if (paletteDatum){
                                paletteContainer = d3.select( paletteContainer$.get(0) )
                                    .datum(paletteDatum)
                                    .call(paletteGenerator);

                                generateOutputColors(paletteContainer.datum());
                                if ( themeState('PALETTE_GENERATOR_USED') ) {
                                    paletteChangeHandler.call(paletteContainer.node(), paletteContainer.datum());
                                }
                            }
                        }
                    }

                    if (accordionInitialized) {
                        utrAccordionWrapper.accordion('destroy');
                    }
                    var groupNames = less.groups.filter(function(d){ return d.common || !commonOnly; }).map( function(d){ return d.name; } );
                    groupNames.push( STR.CUSTOM_CSS );
                    groupNames.unshift( STR.TOOLBAR_BUTTONS_PALETTE_GENERATOR );

                    utrAccordionWrapper.accordion({
                        collapsible: true,
                        heightStyle: "content",
                        active: Math.max( groupNames.indexOf( themeState("ACTIVE_GROUP") ), 0 ),
                        activate: function(event, ui){
                            var activeGroupId = $(this).accordion("option", "active");

                            themeState( "ACTIVE_GROUP", groupNames[ activeGroupId ] );

                            if (activeGroupId === utrCustomCSS.controlGroupId) {
                                if(!utrCustomCSS.hasBeenShowned){
                                    utrCustomCSS.codeMirror.refresh();
                                    utrCustomCSS.hasBeenShowned = true;
                                }
                                utrCustomCSS.codeMirror.focus();
                                utrCustomCSS.codeMirror.setCursor(utrCustomCSS.codeMirror.lineCount(), 0);
                            }
                        }
                    });

                    $(".utr-paletteGenerator").parent().css({
                        padding: 0
                    });

                    $("body .utr .ui-dialog-titlebar-close .ui-button-icon-primary").removeClass("ui-icon ui-icon-closethick").addClass("a-Icon icon-tr-close");
                    accordionInitialized = true;


                    // Configure CodeMirror for Custom CSS textarea
                    utrCustomCSS.codeMirror = CodeMirror.fromTextArea(
                        utrCustomCSS.control.get(0),
                        {
                            mode: "css",
                            theme: "mbo",
                            lineNumbers: true,
                            lineWrapping: true
                        }
                    );
                    $(utrCustomCSS.codeMirror.getWrapperElement())
                        .addClass("utr-codearea utr-codearea--full-width");
                    $(utrCustomCSS.codeMirror.getWrapperElement())
                        .addClass("utr-codearea utr-codearea--full-width");
                    utrCustomCSS.codeMirror.on("change", function(instance, changeObj){
                        css = instance.getDoc().getValue();
                        themeState("CUSTOM_CSS", css);

                        if(setCustomCSSOutput(css)){
                            styleHasChanged = true;
                            resetButton.toggleClass('utr-container__button--disable', false);
                            toolbarResetButton.toggleClass('utr-toolbar-button--disable', false);
                            themeState('STYLE_HAS_CHANGED', true);
                        }
                    });

                    if ($(utrCustomCSS.codeMirror.getWrapperElement()).is(":visible")) {
                        utrCustomCSS.hasBeenShowned = true;
                    }
                    utrContainerBody.find("select").each(function() {
                        if (this.id != "utr_base_style") {
                            readySelectList.call(this);
                        }
                    });
                }

                function search(e){
                    // Alt or Cmd/ctrl

                    if (e.altKey === true || e.ctrlKey === true || e.metaKey === true ||
                        (window.navigator.appVersion.indexOf("Mac") >=0 && (e.which === 18    || e.which === 91 || e.which === 17)) ) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    }

                    window.clearInterval(searchTimerInterval);
                    searchTimer = 0;
                    searchTimerInterval = window.setInterval(function(){
                        searchTimer++;
                        if(searchTimer >= 1){
                            window.clearInterval(searchTimerInterval);

                            var searchString = e.originalEvent.target.value;
                            refreshControls(searchString,  paletteContainer ? paletteContainer.datum() : undefined);
                            themeState('SEARCH', searchString);

                            e.preventDefault();
                            return false;
                        }
                    }, 300);
                }

                utrContainer = $(document.createElement("div")).addClass("utr-container").attr("title", STR.THEME_ROLLER);

                utrContainerBody = $(document.createElement("div")).addClass("utr-container__body").scroll(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                });

                var utrToolbar = $(document.createElement("div"))
                    .addClass("utr-toolbar")
                    .append(
                        $(document.createElement("div"))
                            .addClass("utr-toolbar-item utr-toolbar-splitButton-layout")
                            .append(
                                utrToolbarCommonBtn = $(document.createElement("button"))
                                    .addClass("utr-toolbar-splitButton " + (commonOnly ? "utr-toolbar-splitButton--active " : "") + "a-Icon icon-toolbar-common")
                                    .attr("title", STR.TOOLBAR_BUTTONS_COMMON)
                                    .click(function(eventObject){
                                        commonOnly = true;
                                        themeState("COMMON_ONLY", commonOnly);
                                        refreshControls(themeState("SEARCH"), paletteContainer ? paletteContainer.datum() : undefined);

                                        toggleSplitButton.call(this, eventObject);
                                    })
                            )
                            .append(
                                utrToolbarAllBtn = $(document.createElement("button"))
                                    .addClass("utr-toolbar-splitButton " + (!commonOnly ? "utr-toolbar-splitButton--active " : "") + "a-Icon icon-toolbar-all")
                                    .attr("title", STR.TOOLBAR_BUTTONS_ALL)
                                    .click(function(eventObject){
                                        commonOnly = false;
                                        themeState("COMMON_ONLY", commonOnly);
                                        refreshControls(themeState("SEARCH"), paletteContainer ? paletteContainer.datum() : undefined);

                                        toggleSplitButton.call(this, eventObject);
                                    })
                            )
                    )
                    .append(
                        $(document.createElement("div"))
                            .addClass("utr-toolbar-item utr-toolbar-splitButton-layout")
                            .append(
                                toolbarUndoButton = $(document.createElement("button"))
                                    .addClass("utr-toolbar-splitButton utr-toolbar-button--small a-Icon icon-tr-undo")
                                    .attr("title", STR.UNDO)
                                    .click(function(){
                                        historyEvent["undoRedo"] = 1;
                                        recompile();
                                    })
                            )
                            .append(
                                toolbarRedoButton = $(document.createElement("button"))
                                    .addClass("utr-toolbar-splitButton utr-toolbar-button--small a-Icon icon-tr-redo")
                                    .attr("title", STR.REDO)
                                    .click(function(){
                                        historyEvent["undoRedo"] = -1;
                                        recompile();
                                    })
                            )
                    )
                    .append(
                        $(document.createElement("button"))
                            .addClass("utr-toolbar-item utr-toolbar-item--right utr-toolbar-button a-Icon icon-help")
                            .attr("title", STR.HELP)
                            .click(displayHelp)
                    );

                toolbarResetButton = $(document.createElement("button"))
                    .addClass("utr-toolbar-item utr-toolbar-item--right utr-toolbar-button utr-toolbar-button--small a-Icon icon-tr-reset")
                    .toggleClass('utr-toolbar-button--disable', !styleHasChanged)
                    .attr("title", STR.RESET)
                    .click(resetUTR)
                    .appendTo(utrToolbar);

                utrToolbar
                    .append(
                        $(document.createElement("input"))
                            .addClass("utr-toolbar-item utr-toolbar-item--right utr-toolbar-search")
                            .attr("id", "tr_search")
                            .attr("title", STR.SEARCH)
                            .attr("placeholder", STR.SEARCH)
                            .attr("required", "")
                            .bind("keyup",search)
                    );

                var utrBaseStyleContainer = $(document.createElement("div"))
                    .addClass('utr-container__field utr-container__field--select');
                var utrBaseStyleLabel = $(document.createElement("label"))
                    .attr('for', 'utr_base_style')
                    .text(STR.COMMON_BASE_STYLE);
                var utrBaseStyleControl = $(document.createElement("select"))
                    .attr({
                        id: 'utr_base_style'
                    })
                   .change(function() {
                        // We'll need to re-create the controls, probably
                        var lastStyle = selectedStyle;
                        selectedStyle = getStyle($(this).val());
                        themeState("BASE_STYLE_ID", selectedStyle.id);
                        var utrConfirm;
                        function doStyleChange() {
                            $.universalThemeRoller('getStylesheets', selectedStyle.inputFileUrls, function(data) {
                                lessCode = data;

                                // Update the static CSS of the selected style
                                self.removeStylesheets();
                                self.importStyleSheets(selectedStyle.cssFileUrls || []);

                                var isThemeRollable = isRollable(selectedStyle);

                                history = undefined;
                                historyEvent = {
                                    undoRedo : 0,
                                    size     : 0,
                                    pos      : -1
                                };
                                utrCustomCSS && utrCustomCSS.control.trigger('utr-reset');
                                paletteContainer$ && paletteContainer$.trigger('utr-reset');

                                utrContainer.closest('.utr').toggleClass('utr--static', !isThemeRollable);
                                if (isThemeRollable) {
                                    // Style config is copied into modifyVars
                                    modifyVars = $.extend({}, (selectedStyle.config || {}).vars);
                                    less.vars = {};
                                    recompile(modifyVars, true, undefined, function() {
                                        commonOnly = true;
                                        themeState('COMMON_ONLY', commonOnly);
                                        themeState('SEARCH', '');
                                        themeState('PALETTE_GENERATOR_COMP', less.palette.defaults.mode.indexOf("+c") > -1);
                                        themeState('PALETTE_GENERATOR_MODE', less.palette.defaults.mode.replace("+c", ""));
                                        themeState('PALETTE_GENERATOR_ANGLE', less.palette.defaults.separation);
                                        themeState('PALETTE_GENERATOR_HUE', less.palette.defaults.hue);
                                        themeState('PALETTE_GENERATOR_USED', false);

                                        paletteGenerator
                                            .complimentary(less.palette.defaults.mode.indexOf("+c") > -1)
                                            .mode(themeState('PALETTE_GENERATOR_MODE'));
                                        refreshControls("", {
                                            primary: d3.rgb("hsl(" + less.palette.defaults.hue + ",100%,50%)"),
                                            separation: less.palette.defaults.separation
                                        });

                                        $('#tr_search').val('');
                                        toggleShowAttrButton(commonOnly);
                                    }, lessErrorHandler);

                                    utrToolbar.show();
                                } else {
                                    utrStaticMessage.text(STR.ERROR_UNSUPPORTED_STYLE);
                                    setCustomCSSOutput('');
                                    self.setLessOutput('');
                                    themeState('VARS', {});

                                    utrToolbar.hide();
                                }


                                themeState('META', {});
                                styleHasChanged = false;
                                resetButton.toggleClass('utr-container__button--disable', true);
                                toolbarResetButton.toggleClass('utr-toolbar-button--disable', true);
                                themeState('STYLE_HAS_CHANGED', false);

                                utrConfirm && utrConfirm.dialog("destroy").remove();

                                utrBaseStyleControl.next(".utr-container__field--select__container__text").text($('option:selected', utrBaseStyleControl).text());
                                var updatedUtrAnchorContainer = renderButtons(utrBaseStyleControl);
                                $( ".utr-container__buttons" ).replaceWith( updatedUtrAnchorContainer );
                            }, function(error) {

                                utrContainer.closest('.utr').toggleClass('utr--static', true);
                                utrStaticMessage.text(STR.ERROR_INPUT_NOT_FOUND);
                                setCustomCSSOutput('');
                                self.setLessOutput('');
                                themeState('VARS', {});

                                utrToolbar.hide();

                                themeState('META', {});
                                styleHasChanged = false;
                                themeState('STYLE_HAS_CHANGED', false);

                                utrConfirm && utrConfirm.dialog("destroy").remove();

                                utrBaseStyleControl.next(".utr-container__field--select__container__text").text($('option:selected', utrBaseStyleControl).text());

                            });
                        };

                        if (styleHasChanged) {
                            utrConfirm = $(document.createElement("div")).addClass("utr-container").attr("title", STR.COMMON_WARNING);
                            var utrConfirmBody = $(document.createElement("div"))
                                .addClass("utr-container__body")
                                .text(STR.CHANGE_PROMPT);
                            utrConfirm.append(utrConfirmBody);
                            $('body').append(utrConfirm);
                            var buttons = {

                            };
                            buttons[STR.COMMON_CANCEL] =  function() {
                                utrConfirm.dialog('close');
                            };
                            buttons[STR.CHANGE_THEME] = doStyleChange;
                            utrConfirm.dialog({
                                dialogClass: "utr",
                                modal: true,
                                resizable: false,
                                position: {
                                    my:"center center",
                                    at:"center center",
                                    of: $(window)
                                },
                                create: function(event) { $(event.target).dialog("widget").css({ "position": "fixed" }); },
                                buttons: buttons,
                                close: function(event, ui) {
                                    selectedStyle = lastStyle;
                                    utrBaseStyleControl.val(selectedStyle.id);
                                    utrBaseStyleControl.next(".utr-container__field--select__container__text").text($('option:selected', utrBaseStyleControl).text());
                                    themeState("BASE_STYLE_ID", selectedStyle.id);
                                    $(this).dialog('destroy').remove();
                                }
                            });
                        } else {
                            doStyleChange();
                        }
                    });

                for (var i = existingStyles.length - 1; i >= 0; i--) {
                    var name = getNameFromStyle(existingStyles[i]);
                    utrBaseStyleControl.prepend(
                        $(document.createElement('option'))
                            .attr('value', existingStyles[i].id)
                            .text(name)
                    );
                };
                utrBaseStyleControl.val(baseStyleId);

                var utrAccordionWrapper = $(document.createElement('div')).addClass('utr-container__accordion');

                var utrAnchorContainer = renderButtons(utrBaseStyleControl);

                utrContainerBody.prepend(
                    utrToolbar,
                    utrBaseStyleContainer
                        .append(utrBaseStyleControl)
                        .append(utrBaseStyleLabel)
                        .addClass('utr-container__field--ungrouped')
                );

                var utrStaticMessage;

                utrContainerBody.append(utrAccordionWrapper);

                utrContainerBody.append(
                    $(document.createElement('div'))
                        .addClass('utr-container__field utr-container__field--static-message')
                        .append(
                            utrStaticMessage = $(document.createElement('p'))
                                .text(STR.ERROR_UNSUPPORTED_STYLE)
                        )
                );
                utrContainerBody.append(utrAnchorContainer);

                $("body").append(utrContainer);

                var position = themeState("DIALOG_POSITION");

                utrContainer.append(utrContainerBody);
                utrContainer.find("select").each(readySelectList);

                var uiPosition;
                utrContainer.dialog({
                    dialogClass: "utr utr--main",
                    resizable: false,
                    width: 340,
                    position: uiPosition = (position === null ? {
                        my:"right top",
                        at:"right-12 top+92",
                        of: $(window)
                    } : {
                        my:"left top",
                        at:"left+" + position.left + " top+"  +position.top,
                        of: $(window)
                    }),
                    create: function(event) { $(event.target).dialog("widget").css({ "position": "fixed" }); },
                    open: function(event, ui){
                        self.opened = true;
                        themeState('OPENED', true);
                    },
                    dragStop: function(event, ui){
                        uiPosition = {
                            my: "left top",
                            at: "left+" + ui.position.left + " top+" + ui.position.top,
                            of: $( window )
                        };
                        themeState("DIALOG_POSITION", ui.position);
                    },
                    close: closeUTR
                });

                adjustUTRHeight();

                var colorPickerDialog = $(document.createElement("div"))
                    .addClass("d3colorpicker")
                    .on('click', function(event){
                        event.stopPropagation();
                    })
                    .attr('tabindex', 1);

                $(document).mouseup(function (e){
                    if (!colorPickerDialog.is(e.target) &&  colorPickerDialog.has(e.target).length === 0) {
                        colorPickerDialog.hide();
                    }
                });

                utrContainer.parent().append(colorPickerDialog);

                utrContainer.closest(".utr")
                    .find(".ui-dialog-title")
                        .prepend(
                            $(document.createElement("i"))
                                .addClass("a-Icon icon-theme-roller")
                                .css("margin-right", "8px")
                        )

                var utrMinimizeButton = $(document.createElement("div"))
                    .addClass("ui-dialog-titlebar__minimize")
                    .append(
                        $(document.createElement("div"))
                            .addClass("ui-dialog-titlebar__minimize__content a-Icon icon-tr-collapse")
                    );

                utrMinimizeButton.data("utr-minimized", false);
                utrMinimizeButton.on( "click", function() {
                    $( this ).parent().next().toggle();

                    if(!$( this ).data("utr-minimized")){
                        $( this )
                            .find(".ui-dialog-titlebar__minimize__content")
                                .removeClass("icon-tr-collapse")
                                .addClass("icon-tr-expand");
                    } else {
                        $( this )
                            .find(".ui-dialog-titlebar__minimize__content")
                                .removeClass("icon-tr-expand")
                                .addClass("icon-tr-collapse");
                    }

                    $( this ).data("utr-minimized", !$( this ).data("utr-minimized"));
                });

                utrContainer.closest(".utr")
                    .find(".ui-dialog-titlebar")
                        .append(
                            utrMinimizeButton
                        );

                var timer;
                $( window ).on('resize.utr-positioning', function(eventObject) {
                    timer && clearTimeout(timer);
                    timer = setTimeout(function() {
                        utrContainer.dialog({
                            position: uiPosition
                        });

                        adjustUTRHeight.call(this, eventObject);
                    }, 50);
                });


                $.universalThemeRoller('getStylesheets', selectedStyle.inputFileUrls, function(code) {
                    lessCode = code || '/* There is no code. There is nothing. */';

                    self.disableCurrentStylesheets(currentThemeStylesheets);
                    self.removeStylesheets();
                    self.importStyleSheets(selectedStyle.cssFileUrls || []);

                    // This will create the required style tags
                    self.setLessOutput('');

                    less.vars = {};
                    if (!isRollable(selectedStyle)) {
                        utrContainer.closest(".utr").addClass('utr--static');
                        utrToolbar.hide();
                        self.busy = false;
                    } else {
                        recompile(modifyVars, true, false, function() {
                            // Refresh using search
                            $("#tr_search").val(localStorageSearch);
                            paletteGenerator
                                .complimentary(themeState("PALETTE_GENERATOR_COMP", coalesce(themeState("PALETTE_GENERATOR_COMP"), less.palette.defaults.mode.indexOf("+c") > -1)))
                                .mode(themeState('PALETTE_GENERATOR_MODE', themeState('PALETTE_GENERATOR_MODE') || less.palette.defaults.mode.replace("+c", "")));
                            //console.log("RECOMPILE");
                            refreshControls(localStorageSearch, {
                                primary: d3.rgb("hsl(" + coalesce( themeState('PALETTE_GENERATOR_HUE'), less.palette.defaults.hue ) + ",100%,50%)"),
                                separation: themeState('PALETTE_GENERATOR_ANGLE', coalesce(themeState('PALETTE_GENERATOR_ANGLE'), less.palette.defaults.separation)),
                                shading: themeState('PALETTE_GENERATOR_SHADING', themeState('PALETTE_GENERATOR_SHADING'))
                            });

                            setCustomCSSOutput(css);
                            self.busy = false;
                        }, function() {
                            lessErrorHandler();
                            self.busy = false;
                        });
                    }
                }, function(error) {
                    isOpenAndValid = false;
                    utrStaticMessage.text(STR.ERROR_INPUT_NOT_FOUND);
                    utrToolbar.hide();
                    utrContainer.closest('.utr').toggleClass('utr--static', true);
                });
            }

        }, function(pData) {
            self.busy = false;
            modalAlert(STR.ERROR, STR.ERROR_LOAD_FAILED)();
            debug.log( pData.responseJSON.error );
            themeState('OPENED', false);
            toggleNested(self, false);
        });
    };

    var isOpenAndValid = false;
    function config ( cfg ) {
        if ( isOpenAndValid ) {
            if ( cfg ) {
                utrCustomCSS.codeMirror.getDoc().setValue( cfg.customCSS );
                setCustomCSSOutput( themeState('CUSTOM_CSS', cfg.customCSS ) );
                modifyVars = themeState('VARS', $.extend({}, (selectedStyle.config || {}).vars, cfg.vars));
                recompile(modifyVars);
                styleHasChanged = true;
                resetButton.toggleClass('utr-container__button--disable', false);
                toolbarResetButton.toggleClass('utr-toolbar-button--disable', false);
                themeState('STYLE_HAS_CHANGED', true);
            } else {
                console.log(STR.CONFIG_OUTPUT + '\n\nutr.config(' + JSON.stringify({ customCSS: utrCustomCSS.codeMirror.getDoc().getValue(), vars: $.extend({}, (selectedStyle.config || {}).vars, modifyVars) }) + ');');
            }
        } else {
            //console.log(STR.CONFIG_OUTPUT_ERROR);
        }
    }

    if (!self.nested) {
        self.invoke = invokeUTR;
        self.close = closeUTR;
        self.config = config;
    }
})(apex.jQuery || jQuery, apex.lang, apex.storage, apex.debug);
(function(d3){
    !d3.oracle && (d3.oracle = {});
    d3.oracle.piechart = function() {
        var // These four properties define the class that will be used for rendering the component
            namespace = "a",
            componentName = "D3PieChart",
            baseClassName = (namespace ? namespace + "-" : "") + componentName,
            baseClass = "." + baseClassName,
            
            // Custom Plug-in events
            dispatch = d3.dispatch('pieceenter', 'pieceover', 'pieceout', 'piececlick'),
            // The color scheme to be used
            colorScale = d3.scale.category10(),
            innerRadius = 0,
            responsiveInnerRadius = innerRadius,
            outerRadius = 300,
            responsiveOuterRadius = outerRadius,
            hoverScalingFactor = 1.05,
            responsive = true,
            padAngle = 0,
            showPercentages = true,
            linkOpenMode = "_blank",
            
            arc = d3.svg.arc(),
                
            pie = d3.layout.pie()
                .value(function(d){
                    return accessors.value.call(this, d);
                }),
            
            pieceenterHandler = function (d){
                if(hoverScalingFactor !== 1){
                    var piece = d3.select(this);
                    piece.attr("transform", "scale(1)");
                    
                    if(!!transitions.enable){
                        piece
                            .transition()
                            .duration(transitions.duration * transitions.auxiliaryDurationFactor)
                            .attr("transform", "scale(" + Math.max(hoverScalingFactor, 1) + ")");
                    } else {
                        piece.attr("transform", "scale(" + Math.max(hoverScalingFactor, 1) + ")");
                    }
                }
            },
            pieceoverHandler = null,
            pieceoutHandler = function(d){
                if(hoverScalingFactor !== 1){
                    var piece = d3.select(this);
                    
                    // Scale 0.9999999 is due to some bug in firefox that hides the slices whenever you put a scale(1) in the attribute
                    if(!!transitions.enable){
                        piece
                            .transition()
                            .duration(transitions.duration * transitions.auxiliaryDurationFactor)
                            .attr("transform", "scale(0.9999999)");
                    } else {
                        piece.attr("transform", "scale(0.9999999)");
                    }
                }
            },
            
            // Functions for mapping the needed attributes. These can be provided by the user.
            accessors = {
                label: function(d){
                    return d.label;
                },
                value: function(d){
                    return d.value;
                },
                active: function(d){
                    return d.active;
                },
                link: function(d){
                    return d.link;
                }
            },
            formatters = {
                value: d3.oracle.fnf()
                    .decimals(2),
                percentage: d3.format("0.1%")
            },
                    
            setters = {
                active: function(d, value) {
                    d.active = value;
                }
            },
                    
            transitions = {
                enable: true,
                ease: "ease-in-out",
                duration: 1000,
                auxiliaryDurationFactor: 0.25
            };
            
        accessors.id = function(d){
            return d3.oracle.coalesce(d.id, accessors.label(d));
        };
        accessors.color = function(d){
            return d.color || colorScale(accessors.id(d));
        };
        
        // Getter/Setter Factory functions
        function _getBasicGetterSetter(targetVariableName, allowVariableSetting){
            allowVariableSetting = allowVariableSetting === undefined ? true : !!allowVariableSetting;
            // Is this safe? This is a plugin private function so it is not meant to be used externally
            return eval(
                "(function(){ " + 
                    (allowVariableSetting ? "if(arguments[0] === undefined){ " : "" ) +
                        "return " + targetVariableName + "; " +
                    (allowVariableSetting ? "} else { \
                        " + targetVariableName + " = arguments[0]; \
                    } \
                    return exports; " : "") + 
                "});"
            );
        }
        function _getObjectGetterSetter(object) {
            return (
                function() {
                    // arguments[0] can be an object property name or an object with multiple values
                    // arguments[1] can be an object property value

                    // No arguments passed: Whole Object Getter
                    if (arguments[1] === undefined && arguments[0] === undefined) {
                        return object;
                    // arguments[0] string and no arguments[1] passed: Getter (Object property getter)
                    } else if (arguments[1] === undefined && (typeof arguments[0] == "string")) {
                        return object[arguments[0]];
                    // arguments[0] is passed an object and arguments[1] is ignored: Setter (Object property setter)
                    } else if (typeof arguments[0] == "object") {
                        for (var key in arguments[0]) {
                            object[key] = arguments[0][key];
                        }
                    // Both arguments passed (Types doesn't matter): Setter
                    } else {
                        object[arguments[0]] = arguments[1];
                    }

                    // Chained exports are posible with setters
                    return exports;
                }
            );
        };
        
        // Plug-in specific functions
        function cloneBoundingBox(object){
            var result = {};
            for(var property in object){
                result[property] = object[property];
            }
            return result;
                    
        }
        function getColorLuminance(color){
            var rgbColor = d3.rgb(color);
            // The Luminance component (Y) of the YIQ
            return (rgbColor.r * 299 + rgbColor.g * 587 + rgbColor.b * 114) / 1000;
        }
        /*
         * Returns the angle between 0, 0 and the point x, y. Angles returned start clockwise from the north (As with the d3 pie)
         */
        function getPointAngleFromChartCenter(x, y){
            var result = Math.atan2(y, x) // Get the angle in radians from 0, 0 to x, y. IMPORTANT: The angle returned goes as it is expected in a carthesian plane
                * 180 / Math.PI; // Convert to degrees
            result = -(result - (result > 0 ? 360 : 0)) // Convert the angles to negative starting clockwise from the first quadrant
                - 270; // Make them start clockwise from the second quadrant. Some nevative angles could arise
            result += result < 0 ? 360 : 0; // Sum 360 degrees to the negative angles so to only have positive angles starting clockwise from the second quadrant
            result *= Math.PI / 180; // Return to radians as that's what d3 uses
            return result;
        }
        function getPointFromAngle(angle, radius){
            return { 
                x: radius * Math.sin(angle), 
                y: radius * Math.cos(angle)
            };
        }
        function arcTween(transitionType){
            if(["enter", "update", "exit"].indexOf(transitionType) === -1){
                throw "Invalid transitionType: " + transitionType;
            }
            
            return function(d){
                d.startAngle = d.startAngle || 0;
                d.endAngle = d.endAngle || 0;
                
                var interpolator = d3.interpolate(
                    this.$$current,
                    transitionType === "exit" ? {
                        startAngle: 2 * Math.PI,
                        endAngle: 2 * Math.PI
                    } : d
                );
                
                this.$$current = interpolator(0);
        
                return function(t){
                    return arc(interpolator(t));
                };
            };
        }
        
        // Plug-in rendering stuff
        function exports(_selection) {
            _selection.each(function(d) {
                var self = d3.select(this);
                
                var totalSumOfValues = d3.sum(d, function(d){
                    return accessors.value(d);
                });
                
                function percentageTween(transitionType, transitionAttribute){
                    if(["enter", "update", "exit"].indexOf(transitionType) === -1){
                        throw "Invalid transitionType: " + transitionType;
                    }
                    if(["transform", "text"].indexOf(transitionAttribute) === -1){
                        throw "Invalid transitionAttribute: " + transitionAttribute;
                    }

                    return function(d){
                        d.startAngle = d.startAngle || 0;
                        d.endAngle = d.endAngle || 0;
                        
                        var interpolator = d3.interpolate(
                            this.$$current,
                            transitionType === "exit" ? {
                                startAngle: 2 * Math.PI,
                                endAngle: 2 * Math.PI,
                                value: 0
                            } : d
                        );
                
                        this.$$current = interpolator(0);

                        return function(t){
                            switch(transitionAttribute){
                                case "transform": return "translate(" + arc.centroid(interpolator(t)) + ")"; // scale(" + (interpolator(t).value / dGroup.data.value) + ")";
                                    break;
                                default: 
                                    this.textContent = formatters.percentage(totalSumOfValues > 0 ? interpolator(t).value / totalSumOfValues : 0);
                                    break;
                            }
                        };
                    };
                }
                
                // Set up the pie layout
                pie
                    .value(function(d){
                        return accessors.value.call(this, d);
                    })
                    .sort(null);
            
                if(pie.padAngle){
                    pie
                        .padAngle(padAngle * Math.PI/180)
                }
                
                var container = self.classed(baseClassName + "-container") ? self : self.select(baseClass + "-container");
                
                if(container.empty()){
                    container = self
                        .append("div")
                        .classed(baseClassName + "-container", true);
                }
                var containerNode = container.node();
                var containerNodeProperties = window.getComputedStyle(containerNode);
                containerNodeProperties = {
                    width: parseFloat(containerNodeProperties.getPropertyValue("width")),
                    height: parseFloat(containerNodeProperties.getPropertyValue("height"))
                };
                
                var auxiliaryInnerRadius = Math.min(innerRadius, outerRadius);
                outerRadius = Math.max(innerRadius, outerRadius);
                innerRadius = auxiliaryInnerRadius;
                delete(auxiliaryInnerRadius);
                
                responsiveInnerRadius = innerRadius;
                responsiveOuterRadius = outerRadius;
                
                if(!!responsive && containerNodeProperties.width < 2 * responsiveOuterRadius){
                    responsiveInnerRadius /= responsiveOuterRadius / (containerNodeProperties.width / 2);
                    responsiveOuterRadius = containerNodeProperties.width / 2;
                }
                
                // Setup the arc generator
                arc
                    .innerRadius(responsiveInnerRadius / Math.max(hoverScalingFactor, 1))
                    .outerRadius(responsiveOuterRadius / Math.max(hoverScalingFactor, 1));
                
                // Append the canvas SVG element to the document
                var svg = container
                    .select(baseClass);
                if(svg.empty()){
                    svg = container
                        .append("svg")
                        .classed(baseClassName, true);
                }
                svg
                    .attr("width", responsiveOuterRadius * 2)
                    .attr("height", responsiveOuterRadius * 2);

                var canvasGroup = svg.select(baseClass + "-layout");
                if(canvasGroup.empty()){
                    canvasGroup = svg
                        .append("g")
                        .classed(baseClassName + "-layout", true);
                }
                canvasGroup
                    .attr("transform", "translate(" + responsiveOuterRadius + ", " + responsiveOuterRadius + ")");
            
                /*var background = canvasGroup.select(baseClass + "-background");
                if(d.length === 0 && background.empty()){
                    background = canvasGroup
                        .insert("path", ":first-child")
                        .classed(baseClassName + "-background", true)
                        .attr({
                            d: arc({
                                startAngle: 0,
                                endAngle: 2 * Math.PI
                            })
                        })
                        .style("opacity", 0);
                }*/
                
                var arcGroups = canvasGroup.selectAll(baseClass + "-pieceGroup")
                    .data(pie(d), function(d){return accessors.id(d.data);});
                    
                var arcGroupsEnter = arcGroups
                    .enter()
                    .append("g")
                    .classed(baseClassName + "-pieceGroup", true)
                    .on("mouseover", function(){
                        setters.active(arguments[0].data, true);
                        !!pieceenterHandler && pieceenterHandler.apply(this, arguments);
                        dispatch.pieceenter.apply(this, arguments);
                    })
                    .on("mousemove", function(){
                        !!pieceoverHandler && pieceoverHandler.apply(this, arguments);
                        dispatch.pieceover.apply(this, arguments);
                    })
                    .on("mouseout", function(){
                        setters.active(arguments[0].data, false);
                        !!pieceoutHandler && pieceoutHandler.apply(this, arguments);
                        dispatch.pieceout.apply(this, arguments);
                    });
                
                var arcsUpdate = arcGroups.select(baseClass + "-piece");
                var arcsEnter = arcGroupsEnter
                    .append("path")
                    .classed(baseClassName + "-piece", true)
                    .each(function(){
                        this.$$current = {
                            startAngle: 2 * Math.PI,
                            endAngle: 2 * Math.PI,
                        };
                    });
                if(transitions.enable){
                    arcsUpdate
                        .transition()
                        .duration(transitions.duration)
                        .attrTween("d", arcTween("update"));
                    
                    /*if(d.length > 0 && !background.empty()){
                        background
                            .transition()
                            .duration(transitions.duration)
                            .style("opacity", 0);
                    }*/
                    
                    arcsEnter
                        .transition()
                        .duration(transitions.duration)
                        .attrTween("d", arcTween("enter"));
                        
                } else {
                    /*if(d.length > 0 && !background.empty()){
                        background.remove();
                    }*/
                    
                    arcsUpdate
                        .attr("d", function(d){
                            return arc(d);
                        });
                        
                    arcsEnter
                        .attr("d", function(d){
                            return arc(d);
                        });
                }
                delete(arcsEnter, arcsUpdate);
                
                arcGroups
                    .classed(baseClassName + "-pieceGroup--with-link", function(d){
                        return !!accessors.link && !!accessors.link.call(this, d.data);
                    })
                    .on("click", function(d){
                        var link;
                        if(!!accessors.link && !!(link = accessors.link.call(this, d.data))){
                            window.open(link, linkOpenMode);
                        }
                        delete link;
                    });
                
                arcGroups.select(baseClass + "-piece")
                    .style({
                        fill: function(d){
                            var result = undefined;
                            
                            if(!!accessors.color){
                                result = accessors.color.call(this, d.data);
                            }
                            
                            return result;
                        }
                    })
                    .each(function(d){
                        if(accessors.active(d.data)){
                            !!pieceenterHandler && pieceenterHandler.call(this.parentNode, d);
                        } else {
                            !!pieceoutHandler && pieceoutHandler.call(this.parentNode, d);
                        }
                    });
                
                if(!!showPercentages){
                    var percentagesUpdate = arcGroups.select(baseClass + "-percentage");
                    var percentagesEnter = arcGroupsEnter
                        .append("text")
                        .classed(baseClassName + "-percentage", true)
                        .style("opacity", 0)
                        .each(function(){
                            this.$$current = {
                                startAngle: 2 * Math.PI,
                                andAngle: 2* Math.PI
                            };
                        });
                    if(transitions.enable){
                        percentagesEnter
                            .style("opacity", 0)
                            .transition()
                            .duration(transitions.duration)
                            .attrTween("transform", percentageTween("enter", "transform"))
                            .tween("text", percentageTween("enter", "text"))
                            .style("opacity", 1);

                        percentagesUpdate
                            .transition()
                            .duration(transitions.duration)
                            .attrTween("transform", percentageTween("update", "transform"))
                            .tween("text", percentageTween("update", "text"))
                            .style("opacity", 1);
                    } else {
                        percentagesEnter
                            .style("opacity", 1);
                    }
                    delete(percentagesEnter, percentagesUpdate);
                    arcGroups.select(baseClass + "-percentage")
                        .text(function(d){
                            return d3.format("0.1%")(accessors.value.call(this, d.data) / totalSumOfValues);
                        })
                        .attr({
                            transform: function(d){
                                return "translate(" + arc.centroid(d) + ")";
                            }
                        })
                        .style({
                            fill: function(d){
                                return getColorLuminance(accessors.color.call(this, d.data)) > 128 ? "black" : "white";
                            }
                        })
                        .classed(baseClassName + "-percentage--hidden", function(d){
                            var result = false;
                            var textElement = d3.select(this);
                            var pieceCentroid = arc.centroid(d);

                            var boundingBox = cloneBoundingBox(textElement.node().getBBox());
                            
                            // Adjusting x to be based on the center of the chart
                            boundingBox.x = pieceCentroid[0] - (boundingBox.width / 2);
                            // Adjusting y to be based on the center of the chart
                            boundingBox.y = -(pieceCentroid[1] - (boundingBox.height / 2));

                            // Calculating the text box corners
                            var corners = {};
                            corners.topLeft = {
                                x: boundingBox.x,
                                y: boundingBox.y
                            };
                            corners.topLeft.angle = getPointAngleFromChartCenter(corners.topLeft.x, corners.topLeft.y);
                            corners.topLeft.innerPoint = getPointFromAngle(corners.topLeft.angle, responsiveInnerRadius);
                            corners.topLeft.outerPoint = getPointFromAngle(corners.topLeft.angle, responsiveOuterRadius);

                            corners.topRight = {
                                x: corners.topLeft.x + boundingBox.width,
                                y: corners.topLeft.y
                            };
                            corners.topRight.angle = getPointAngleFromChartCenter(corners.topRight.x, corners.topRight.y);
                            corners.topRight.innerPoint = getPointFromAngle(corners.topRight.angle, responsiveInnerRadius);
                            corners.topRight.outerPoint = getPointFromAngle(corners.topRight.angle, responsiveOuterRadius);
                            corners.bottomRight = {
                                x: corners.topRight.x,
                                y: corners.topRight.y - boundingBox.height
                            };
                            corners.bottomRight.angle = getPointAngleFromChartCenter(corners.bottomRight.x, corners.bottomRight.y);
                            corners.bottomRight.innerPoint = getPointFromAngle(corners.bottomRight.angle, responsiveInnerRadius);
                            corners.bottomRight.outerPoint = getPointFromAngle(corners.bottomRight.angle, responsiveOuterRadius);
                            corners.bottomLeft = {
                                x: corners.topLeft.x,
                                y: corners.bottomRight.y
                            };
                            corners.bottomLeft.angle = getPointAngleFromChartCenter(corners.bottomLeft.x, corners.bottomLeft.y);
                            corners.bottomLeft.innerPoint = getPointFromAngle(corners.bottomLeft.angle, responsiveInnerRadius);
                            corners.bottomLeft.outerPoint = getPointFromAngle(corners.bottomLeft.angle, responsiveOuterRadius);

                            for(var key in corners){
                                if(
                                    corners[key].angle < d.startAngle || 
                                    corners[key].angle > d.endAngle ||
                                    Math.abs(corners[key].x) < Math.abs(corners[key].innerPoint.x) ||
                                    Math.abs(corners[key].x) > Math.abs(corners[key].outerPoint.x) ||
                                    Math.abs(corners[key].y) < Math.abs(corners[key].innerPoint.y) ||
                                    Math.abs(corners[key].y) > Math.abs(corners[key].outerPoint.y)
                                ){
                                    result = true;
                                    break;
                                }
                            }
                            
                            return result;
                        });
                }
                    
                var arcGroupsExit = arcGroups
                    .exit();
                var arcsExit = arcGroupsExit.select(baseClass + "-piece");
                if(!!showPercentages){
                    var percentagesExit = arcGroupsExit.select(baseClass + "-percentage");
                }
                if(transitions.enable){
                    var removeFlags = [];
                    function removeGroupIfFlagged(d){
                        if(removeFlags.indexOf(accessors.id(d.data))){
                            d3.select(this.parentNode).remove();
                        } else {
                            removeFlags.push(accessors.id(d.data));
                        }
                    }
                    
                    /*if(d.length === 0 && !background.empty()){
                        background
                            .style("opacity", 1);
                    }*/
                    
                    arcsExit
                        .transition()
                        .duration(transitions.duration)
                        .attrTween("d", arcTween("exit"))
                        .each("end", function(d){
                            removeGroupIfFlagged.call(this, d);
                        });
                    
                    if(!!showPercentages){
                        percentagesExit
                            .style("opacity", 1)
                            .transition()
                            .duration(transitions.duration)
                            .attrTween("transform", percentageTween("exit", "transform"))
                            .tween("text", percentageTween("exit", "text"))
                            .style("opacity", 0)
                            .each("end", function(d){
                                removeGroupIfFlagged.call(this, d);
                            });
                    }
                } else {
                    arcGroupsExit.remove();
                }
            });
        }
        
        // Basic read/write attributes
        exports.colorScale = _getBasicGetterSetter("colorScale");
        exports.innerRadius = _getBasicGetterSetter("innerRadius");
        exports.outerRadius = _getBasicGetterSetter("outerRadius");
        if(pie.padAngle){
            exports.padAngle = _getBasicGetterSetter("padAngle");
        }
        exports.hoverScalingFactor = _getBasicGetterSetter("hoverScalingFactor");
        exports.pieceenterHandler = _getBasicGetterSetter("pieceenterHandler");
        exports.pieceoverHandler = _getBasicGetterSetter("pieceoverHandler");
        exports.pieceoutHandler = _getBasicGetterSetter("pieceoutHandler");
        exports.responsive = _getBasicGetterSetter("responsive");
        exports.showPercentages = _getBasicGetterSetter("showPercentages");
        exports.linkOpenMode = _getBasicGetterSetter("linkOpenMode");
        
        // Read only attributes
        exports.pie = _getBasicGetterSetter("pie", false);
        exports.arc = _getBasicGetterSetter("arc", false);
        exports.getPointAngleFromChartCenter = _getBasicGetterSetter("getPointAngleFromChartCenter", false);
        exports.getPointFromAngle = _getBasicGetterSetter("getPointFromAngle", false);
        exports.responsiveInnerRadius = _getBasicGetterSetter("responsiveInnerRadius", false);
        exports.responsiveOuterRadius = _getBasicGetterSetter("responsiveOuterRadius", false);
        
        // Object read/write attributes
        exports.transitions = _getObjectGetterSetter(transitions);
        exports.accessors = _getObjectGetterSetter(accessors);
        exports.formatters = _getObjectGetterSetter(formatters);
        exports.setters = _getObjectGetterSetter(setters);
        
        d3.rebind(exports, dispatch, "on");
        
        return exports;
    };
})(d3);
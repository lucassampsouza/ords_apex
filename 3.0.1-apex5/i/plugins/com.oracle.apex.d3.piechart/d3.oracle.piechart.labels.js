(function(d3){
    !d3.oracle && (d3.oracle = {});
    
    if(d3.oracle.piechart){
        d3.oracle.piechart.labels = function() {
            var // These four properties define the class that will be used for rendering the component
                namespace = "a",
                componentName = "D3PieChart-label",
                baseClassName = (namespace ? namespace + "-" : "") + componentName,
                baseClass = "." + baseClassName,

                piechart = d3.oracle.piechart(),
                symbol = "square",

                overHandler = null,
                outHandler = null;

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
            
            //Plug-in specific functions
            
            
            // Plug-in rendering stuff
            function exports(_selection) {
                _selection.each(function(d) {
                    var self = d3.select(this);
                    var piechartContainerElement = self.classed("a-D3PieChart-container") ? self : self.select(".a-D3PieChart-container");
                    var piechartContainerElementNode = piechartContainerElement.node();
                    var piechartContainerElementNodeProperties = window.getComputedStyle(piechartContainerElementNode);
                    piechartContainerElementNodeProperties = {
                        width: parseFloat(piechartContainerElementNodeProperties.getPropertyValue("width")),
                        height: parseFloat(piechartContainerElementNodeProperties.getPropertyValue("height"))
                    };
                    var piechartElement = piechartContainerElement.select(".a-D3PieChart");

                    if(!piechartElement.empty()){
                        var outerRadius = piechart.responsiveOuterRadius();
                        var hoverScalingFactor = piechart.hoverScalingFactor();
                        var transitions = piechart.transitions();
                        var colorScale = piechart.colorScale();
                        var getPointFromAngle = piechart.getPointFromAngle();
                        var accessors = piechart.accessors();
                        var formatters = piechart.formatters();

                        function getLabelHandler(over){
                            return function(d){
                                var label = piechartContainerElement.selectAll(".a-D3PieChart-label").filter(function(dLabel){
                                    return accessors.id(d) === accessors.id(dLabel.data);
                                });

                                if(!label.empty()){
                                    var transitionedLabel = label;
                                    if(transitions.enable){
                                        transitionedLabel = label
                                            .transition()
                                            .duration(transitions.duration * transitions.auxiliaryDurationFactor);
                                    }

                                    transitionedLabel
                                        .style({
                                            left: label.datum()["label" + (!!over ? "Over" : "") + "Coordinates"].topLeft.x + "px",
                                            top: label.datum()["label" + (!!over ? "Over" : "") + "Coordinates"].topLeft.y + "px"
                                        });
                                }
                            };
                        }
                        
                        if(piechart.pieceenterHandler()){
                            overHandler = overHandler || getLabelHandler(true);
                            piechart
                                .on("pieceenter.labels", function(d){
                                    overHandler.call(this, d.data);
                                })
                        }
                        if(piechart.pieceoutHandler()){
                            outHandler = outHandler || getLabelHandler();
                            piechart
                                .on("pieceout.labels", function(d){
                                    outHandler.call(this, d.data);
                                });
                        }

                        var piechartNode = piechartElement.node();
                        var piechartNodeBoundingRectangle = piechartNode.getBoundingClientRect();
                        var piechartParentNodeBoundingRectangle = piechartNode.parentNode.getBoundingClientRect();
                        
                        /*var piechartCenter = { 
                            x: piechartNode.offsetWidth / 2 
                                + piechartNode.offsetLeft, 
                            y: piechartNode.offsetHeight / 2
                                // Assuming the container (self) is positiones relatively
                                + piechartNode.offsetTop
                        };*/
                        
                        var piechartCenter = {
                            x: piechartNodeBoundingRectangle.width / 2 +
                                (
                                    piechartNodeBoundingRectangle.left -
                                    piechartParentNodeBoundingRectangle.left
                                ),
                            y: piechartNodeBoundingRectangle.height / 2 +
                                // Assuming the container (self) is positiones relatively
                                (
                                    piechartNodeBoundingRectangle.top -
                                    piechartParentNodeBoundingRectangle.top
                                )
                        };
                        
                        var labelCoordinates = {};
                        function appendLabelCoordinatesToData(d){
                            var self = d3.select(this);
                            var selfNode = self.node();
                            var selfNodeProperties = window.getComputedStyle(selfNode);
                            var selfNodeProperties = window.getComputedStyle(selfNode);
                            selfNodeProperties = {
                                width: parseFloat(selfNodeProperties.getPropertyValue("width")),
                                height: parseFloat(selfNodeProperties.getPropertyValue("height"))
                            };
                            
                            d.angle = d3.mean([d.startAngle, d.endAngle]) * 180 / Math.PI;
                            var initialPosition = getPointFromAngle(d.angle * Math.PI / 180, outerRadius / Math.max(hoverScalingFactor, 1));
                            initialPosition.y *= -1;
                            initialPosition.x += piechartCenter.x;
                            initialPosition.y += piechartCenter.y;

                            var hoverPosition = getPointFromAngle(d.angle * Math.PI / 180, outerRadius);
                            hoverPosition.y *= -1;
                            hoverPosition.x += piechartCenter.x;
                            hoverPosition.y += piechartCenter.y;

                            d.labelCoordinates = {
                                topLeft: {
                                    x: initialPosition.x,
                                    y: initialPosition.y
                                }
                            };
                            d.labelOverCoordinates = {
                                topLeft: {
                                    x: hoverPosition.x,
                                    y: hoverPosition.y
                                }
                            };
                            
                            return d;
                        };
                        function isLabelColliding(d){
                            var result = false;
                            
                            if(d.labelCoordinates){
                                checkForCollisions:
                                    for(var id in labelCoordinates){
                                        // This is custom data so we don't use accessors in here
                                        // Also ids could vary on type so we use double equal
                                        if(id == d.id){
                                            continue;
                                        }
                                        
                                        for(var point in d.labelCoordinates){
                                            if(
                                                d.labelCoordinates[point].x >= labelCoordinates[id].topLeft.x       &&
                                                d.labelCoordinates[point].x <= labelCoordinates[id].bottomRight.x   &&
                                                d.labelCoordinates[point].y >= labelCoordinates[id].topLeft.y       &&
                                                d.labelCoordinates[point].y <= labelCoordinates[id].bottomRight.y
                                            ){
                                                result = true;
                                                break checkForCollisions;
                                            }
                                        }
                                    }
                            }
                            
                            return result;
                        }
                        function labelTween(transitionType, transitionAttribute){
                            if(["enter", "update", "exit"].indexOf(transitionType) === -1){
                                throw "Invalid transitionType: " + transitionType;
                            }
                            if(["top", "left", "text"].indexOf(transitionAttribute) === -1){
                                throw "Invalid transitionAttribute: " + transitionAttribute;
                            }

                            return function(d){
                                var self = d3.select(this);
                                var selfNode = self.node();
                                var selfNodeProperties = window.getComputedStyle(self.node());
                                selfNodeProperties = {
                                    width: parseFloat(selfNodeProperties.getPropertyValue("width")) || 0,
                                    height: parseFloat(selfNodeProperties.getPropertyValue("height")) || 0
                                };
                                
                                d.startAngle = d.startAngle || 0;
                                d.endAngle = d.endAngle || 0;
                                d.value = d.value || 0;
                                
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
                                    var result,
                                        dInterpolator = appendLabelCoordinatesToData.call(selfNode, interpolator(t));
                                    
                                    switch(transitionAttribute){
                                        case "top": result = dInterpolator.labelCoordinates.topLeft.y + "px";
                                            break;
                                        case "left": result = dInterpolator.labelCoordinates.topLeft.x + "px";
                                            break;
                                        default: this.textContent = dInterpolator.value;
                                            break;
                                    }
                                    
                                    return result;
                                };
                            };
                        }

                        var label = d3.oracle.tooltip()
                            .symbol(symbol)
                            .accessors({
                                id: function(d){
                                    return accessors.id.call(this, d.data);
                                },
                                label: function(d){
                                    return accessors.label.call(this, d.data);
                                },
                                value: function(d){
                                    return accessors.value.call(this, d.data);
                                },
                                color: function(d){
                                    return accessors.color.call(this, d.data);
                                },
                                content: function(d){ return null; }
                            })
                            .formatters(formatters)
                            .transitions(transitions);

                        var labels = piechartContainerElement
                            .selectAll(baseClass)
                            .data(piechart.pie()(d), function(d){
                                return accessors.id(d.data);
                            })
                            .call(label);
                        var labelsEnter = labels
                            .enter()
                            .append("div")
                            .classed(baseClassName + " " + namespace + "-D3Tooltip", true)
                            .each(function(){
                                this.$$current = {
                                    startAngle: 2 * Math.PI,
                                    endAngle: 2 * Math.PI,
                                    value: 0
                                };
                            })
                            .call(label);
                        
                        if(transitions.enable){
                            labels
                                .transition()
                                .duration(transitions.duration)
                                .style({
                                    opacity: 1
                                })
                                .style("transform", function(d){
                                    var selfNodeProperties = window.getComputedStyle(this);
                                    selfNodeProperties = {
                                        width: parseFloat(selfNodeProperties.getPropertyValue("width")) || 0,
                                        height: parseFloat(selfNodeProperties.getPropertyValue("height")) || 0
                                    };
                                    
                                    var angle = d3.mean([d.startAngle, d.endAngle]) * 180/Math.PI;
                                    return "matrix(1,0,0,1," + (angle >= 180 ? -selfNodeProperties.width : 0) + ", " + (angle >= 90 && angle <= 270 ? -selfNodeProperties.height : 0) + ")";
                                })
                                .styleTween("left", labelTween("update", "left"))
                                .styleTween("top", labelTween("update", "top"))
                                ;
                            
                            labelsEnter
                                .style("opacity", 0)
                                .style("transform", "matrix(1,0,0,1,0, 0)")
                                .transition()
                                .duration(transitions.duration)
                                .style("transform", function(d){
                                    var selfNodeProperties = window.getComputedStyle(this);
                                    selfNodeProperties = {
                                        width: parseFloat(selfNodeProperties.getPropertyValue("width")) || 0,
                                        height: parseFloat(selfNodeProperties.getPropertyValue("height")) || 0
                                    };
                                    var angle = d3.mean([d.startAngle, d.endAngle]) * 180/Math.PI;
                                    return "translate(" + (angle >= 180 ? -selfNodeProperties.width : 0) + "px, " + (angle >= 90 && angle <= 270 ? -selfNodeProperties.height : 0) + "px)";
                                })
                                .styleTween("left", labelTween("enter", "left"))
                                .styleTween("top", labelTween("enter", "top"))
                                .style("opacity", 1)
                                ;
                        }
                        delete(labelsEnter);

                        d.shownLabels = [];
                        
                        labels.each(function(dLabel){
                            var self = d3.select(this);
                            var currentId = accessors.id(dLabel.data);
                            var selfNode = self.node();

                            var selfNodeProperties = window.getComputedStyle(selfNode);
                            selfNodeProperties = {
                                width: parseFloat(selfNodeProperties.getPropertyValue("width")),
                                height: parseFloat(selfNodeProperties.getPropertyValue("height"))
                            };
                            
                            appendLabelCoordinatesToData.call(this, dLabel);
                            
                            self
                                .style({
                                    top: dLabel.labelCoordinates.topLeft.y + "px",
                                    left: dLabel.labelCoordinates.topLeft.x + "px",
                                    "transform": function(d){
                                        var selfNodeProperties = window.getComputedStyle(this);
                                        selfNodeProperties = {
                                            width: parseFloat(selfNodeProperties.getPropertyValue("width")) || 0,
                                            height: parseFloat(selfNodeProperties.getPropertyValue("height")) || 0
                                        };

                                        var angle = d3.mean([d.startAngle, d.endAngle]) * 180/Math.PI;
                                        return "matrix(1,0,0,1," + (angle >= 180 ? -selfNodeProperties.width : 0) + ", " + (angle >= 90 && angle <= 270 ? -selfNodeProperties.height : 0) + ")";
                                    }
                                });
                            
                            // Next coordinates are for validation purposes only
                            var dCollisionTesting = {
                                id: accessors.id(dLabel.data),
                                labelCoordinates: {
                                    topLeft: {
                                        x: dLabel.labelCoordinates.topLeft.x - (dLabel.angle >= 180 ? selfNodeProperties.width : 0),
                                        y: dLabel.labelCoordinates.topLeft.y - (dLabel.angle >= 90 && dLabel.angle <= 270 ? selfNodeProperties.height : 0)
                                    }
                                },
                                labelOverCoordinates: {
                                    topLeft: {
                                        x: dLabel.labelOverCoordinates.topLeft.x - (dLabel.angle >= 180 ? selfNodeProperties.width : 0),
                                        y: dLabel.labelOverCoordinates.topLeft.y - (dLabel.angle >= 90 && dLabel.angle <= 270 ? selfNodeProperties.height : 0)
                                    }
                                }
                            };
                            dCollisionTesting.labelCoordinates.bottomRight = {
                                x: dCollisionTesting.labelCoordinates.topLeft.x + selfNodeProperties.width, 
                                y: dCollisionTesting.labelCoordinates.topLeft.y + selfNodeProperties.height
                            };
                            dCollisionTesting.labelCoordinates.topRight = {
                                x: dCollisionTesting.labelCoordinates.bottomRight.x,
                                y: dCollisionTesting.labelCoordinates.topLeft.y
                            };
                            dCollisionTesting.labelCoordinates.bottomLeft = {
                                x: dCollisionTesting.labelCoordinates.topLeft.x,
                                y: dCollisionTesting.labelCoordinates.bottomRight.y
                            };
                            labelCoordinates[currentId] = dCollisionTesting.labelCoordinates;
                            
                            var labelLeft = dCollisionTesting.labelOverCoordinates.topLeft.x;
                            var labelRight = labelLeft + selfNodeProperties.width;
                            
                            d.shownLabels[accessors.id(dLabel.data)] = !isLabelColliding.call(this, dCollisionTesting);

                            if(!d.shownLabels[accessors.id(dLabel.data)]){
                                if(transitions.enable){
                                    self
                                        .transition()
                                        .duration(transitions.duration)
                                        .styleTween("top", labelTween("update", "top"))
                                        .styleTween("left", labelTween("update", "left"))
                                        .style("opacity", 0);
                                } else {
                                    self.remove();
                                }
                            } else if(labelLeft < piechartContainerElementNode.offsetLeft || labelRight > piechartContainerElementNode.offsetLeft + piechartContainerElementNodeProperties.width){
                                d.shownLabels[accessors.id(dLabel.data)] = false;
                                if(transitions.enable){
                                    self
                                        .transition()
                                        .duration(transitions.duration)
                                        .styleTween("top", labelTween("update", "top"))
                                        .styleTween("left", labelTween("update", "left"))
                                        .style("opacity", 0);
                                } else {
                                    self.remove();
                                }
                            }
                        });
                        
                        var labelsExit = labels
                            .exit();
                        if(transitions.enable){
                            labelsExit
                                .transition()
                                .duration(transitions.duration)
                                .styleTween("top", labelTween("exit", "top"))
                                .styleTween("left", labelTween("exit", "left"))
                                .style("opacity", 0)
                                .each("end", function(d){
                                    d3.select(this).remove();
                                })
                                ;
                        } else {
                            labelsExit
                                .remove();
                        }
                    }
                });
            }

            exports.piechart = _getBasicGetterSetter("piechart");
            exports.symbol = _getBasicGetterSetter("symbol");
            exports.overHandler = _getBasicGetterSetter("overHandler");
            exports.outHandler = _getBasicGetterSetter("outHandler");

            return exports;
        };
    } else {
        throw "The D3PieChart plug-in needs to be available in order for the labels to work.";
    }
})(d3);
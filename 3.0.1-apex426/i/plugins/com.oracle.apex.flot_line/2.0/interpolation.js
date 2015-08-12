// FlotCharts Step Interpolation v0.1

(function ($) {
    function init(plot) {

        function checkPluginEnabled(plot, options) {
            if ((options.series.lines.interpolation || '').toLowerCase() == 'step') {
                plot.hooks.processDatapoints.push(interpolate);
            }
        }

        function interpolate(plot, series, datapoints) {

            var points = datapoints.points;
            var ps = datapoints.pointsize;
            var newPoint;
            for(var i = ps; i < points.length; i += (2 * ps)) {
                newPoint = [
                    points[i],
                    points[i - ps + 1]
                ];
                for(var j = 2; j < ps; j++) {
                    newPoint.push(null);
                }
                Array.prototype.splice.apply(points, [i, 0].concat(newPoint));
            }
        }

        plot.hooks.processOptions.push(checkPluginEnabled);
    }

    var options = {
        series : {
            lines : {
                interpolation : 'line'
            }
        }
    };

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "interpolation",
        version: "0.1"
    });
})(jQuery);
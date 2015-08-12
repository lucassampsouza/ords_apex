// FlotCharts Histogram v0.1
// Important: For best results, use with the core 'categories' plugin!

(function ($) {
    function init(plot) {
        var processedSeries = 0;
        var initialBarWidth;
        var innerBarWidth;
        var barWidth = false;
        var offsets = {};
        var horizontal = false;

        function checkPluginEnabled(plot, options) {
            // Plugin will be enabled by the mode attribute of "options.series.bars".
            // It must be enabled globally, not on individual series! For this same
            // reason, a global, uniform barWidth is required. The plugin will use the 
            // specified value or default to "0.8".
            if ((options.series.bars.mode || '').toLowerCase() == 'histogram') {
                initialBarWidth = options.series.bars.barWidth || 0.8;
                innerBarWidth = options.series.bars.innerBarWidth;
                horizontal = !!options.series.bars.horizontal;
                plot.hooks.processDatapoints.push(offsetSeries);
                plot.hooks.drawSeries.push(setSeriesWidth);
                plot.hooks.draw.push(reset);
            }
        }

        function offsetSeries(plot, series, datapoints) {
            
            // "barWidth" is the unit of measure needed to calculate the series offsets.
            if (processedSeries == 0) {
                barWidth = initialBarWidth / plot.getData().length;
            }

            // Calculate the offset for this data series. It is the same across all data points.
            // This calculation ensures:
            // - That the first series gets the highest offset (i.e. will be drawn to the left).
            // - No matter the number of series, they will not overlap.
            // - The series order will be the same across every point in the x axis. If a series
            //   has no data point on a given category, it will leave an empty space.
            // - All the bars on each data point on the x axis will be centered around the 
            //   original value of that data point.
            offsets[processedSeries] = - (barWidth * (plot.getData().length - processedSeries - 1)) + (initialBarWidth / 2) - (barWidth / 2);

            // Apply the transformation to each data point. Typically, only x values are modified.
            // If the bar chart is horizontal, Y values are modified instead.
            var points = datapoints.points;
            var ps = datapoints.pointsize;
            for(var i = horizontal ? 1 : 0; i < points.length; i += ps) {
                points[i] += offsets[processedSeries];
            }

            processedSeries++;
        }

        function setSeriesWidth(plot, canvascontext, series) {
            // Override the series' specific "barWidth". Mutliplying by "0.8" to leave a small 
            // gutter between bars.
            series.bars.barWidth = barWidth * innerBarWidth;
        }
        function reset(plot, canvascontext) {
            processedSeries = 0;
            offsets = {};
        }

        plot.hooks.processOptions.push(checkPluginEnabled);
    }

    var options = {};

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "histogram",
        version: "0.1"
    });
})(jQuery);
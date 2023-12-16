var plotBarX = () => {}
var plotBarY = () => {}

export default function(data, svg, barWidth, barHeight){
	// ------Bar Chart------
    // Title
    svg.append("text")
    .attr("x", barWidth/2)
    .attr("y", -20)
    .attr("font-size", "14px")
        .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("Hit Song by Released Month")

    // X label
    svg.append("text")
    .attr("x", barWidth/2)
    .attr("y", barHeight+30)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .text("Month")

    // Y label
    svg.append("text")
    .attr("x", -35)
    .attr("y", barHeight/2)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90, -35, ${barHeight/2})`)
    .text("Count")

    // X axis
    plotBarX = d3.scaleLinear()
        .domain([1, 13])
        .range([0, barWidth]);

    // Histogram
    var hist = d3.histogram()
    .value(function(d) {return d.released_month; })
    .domain(plotBarX.domain())
    .thresholds(plotBarX.ticks(12))

    var bins = hist(data);
    // Y axis
    plotBarY = d3.scaleLinear()
            .range([barHeight, 0]);
    plotBarY.domain([0, d3.max(bins, function(d) { return d.length; })]);   

    // Bars
    svg.selectAll("barOutline")
    .data(bins)
    .enter()
    .append("rect")
        .attr("x", 0)
        .attr("transform", function(d) {
            return "translate(" + plotBarX(d.x0) + "," + plotBarY(d.length) + ")";
        })
        .attr("width", function(d) {
            return plotBarX(d.x1) - plotBarX(d.x0) - 1 < 0 ? 0 : plotBarX(d.x1) - plotBarX(d.x0) - 1;
        })
        .attr("height", function(d){
            return barHeight - plotBarY(d.length)
        })
        .style("fill", "none")
        .style("outline", "1px solid gray")
        .classed("barOutline", true)

    svg.selectAll("barRect")
    .data(bins)
    .enter()
    .append("rect")
        .attr("x", 0)
        .attr("width", function(d) {
            return plotBarX(d.x1) - plotBarX(d.x0) - 1 < 0 ? 0 : plotBarX(d.x1) - plotBarX(d.x0) - 1;
        })
        .style("fill", "#00b7af")
        .classed("barRect", true)
        .transition()
        .duration(1000)
        .attrTween("height", function(d) {
            var i = d3.interpolate(0, barHeight - plotBarY(d.length));
            return function(t) {
                return i(t);
            };
        })
        .attrTween("transform", function(d) {
            var i = d3.interpolate(barHeight, plotBarY(d.length));
            return function(t){
                return "translate(" + plotBarX(d.x0) + "," + i(t) + ")";
            }
        })

        
    svg.append("g")
    .attr("transform", "translate(0, " + barHeight + ")")
    .call(d3.axisBottom(plotBarX)
            .tickValues([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
            .tickSizeOuter(0)
        );
    svg.selectAll(".tick").attr("transform", function() {
        var currentTransform = d3.select(this).attr("transform").split("(")[1].split(",");
        var xTrans = currentTransform[0]
        var yTrans = currentTransform[1].split(")")[0]
        return `translate(${parseFloat(xTrans) + 25}, ${yTrans})`
    });

    svg.append("g").call(d3.axisLeft(plotBarY));
}

function plotBarUpdate(data, svg, barWidth, barHeight){
    var hist = d3.histogram()
    .value(function(d) {return d.released_month; })
    .domain(plotBarX.domain())
    .thresholds(plotBarX.ticks(12))

    var bins = hist(data)

    svg.selectAll(".barRect")
    .data(bins)
    .transition()
    .duration(1000)
    .attr("height", function(d){
        return barHeight - plotBarY(d.length)
    })
    .attr("transform", function(d) { return "translate(" + plotBarX(d.x0) + "," + plotBarY(d.length) + ")"; })

}

export { plotBarUpdate, plotBarX, plotBarY }
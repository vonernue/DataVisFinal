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
    var x = d3.scaleLinear()
        .domain([1, 13])
        .range([0, barWidth]);

    // Histogram
    var hist = d3.histogram()
    .value(function(d) {return d.released_month; })
    .domain(x.domain())
    .thresholds(x.ticks(12))

    var bins = hist(data);
    console.log(bins)
    // Y axis
    var y = d3.scaleLinear()
            .range([barHeight, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   


    // Bars
    svg.selectAll("barOutline")
    .data(bins)
    .enter()
    .append("rect")
        .attr("x", 0)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
        .attr("height", function(d) { d['height']=barHeight - y(d.length); return d.height; })
        .style("fill", "#00b7af")
        .style("outline", "1px solid gray")
        .classed("barOutline", true)

    svg.selectAll("barRect")
    .data(bins)
    .enter()
    .append("rect")
        .attr("x", 0)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
        .style("fill", "#fff")
        .classed("barRect", true)
        .transition()
        .duration(1000)
        .attrTween("height", function(d) {
        var i = d3.interpolate(barHeight - y(d.length), 0);
        return function(t) {
            return i(t);
        };
        });

        
    svg.append("g")
    .attr("transform", "translate(0, " + barHeight + ")")
    .call(d3.axisBottom(x)
            .tickValues([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
            .tickSizeOuter(0)
        );
    svg.selectAll(".tick").attr("transform", function() {
        var currentTransform = d3.select(this).attr("transform").split("(")[1].split(",");
        var xTrans = currentTransform[0]
        var yTrans = currentTransform[1].split(")")[0]
        return `translate(${parseFloat(xTrans) + 25}, ${yTrans})`
    });

    svg.append("g").call(d3.axisLeft(y));
}
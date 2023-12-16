var plotScatterX = () => {}
var plotScatterY = () => {}

export default function(data, svg, scatterWidth, scatterHeight){
    // ------Scatter Plot------
    // Title
    svg.append("text")
    .attr("x", scatterWidth/2)
    .attr("y", -20)
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("Scatter Plot By Custom Attributes")

    // X label
    svg.append("text")
    .attr("x", scatterWidth/2)
    .attr("y", scatterHeight+30)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .text("BPM")

    // Y label
    svg.append("text")
    .attr("x", -30)
    .attr("y", scatterHeight/2)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90, -35, ${scatterHeight/2})`)
    .text("Danceability")

    // X axis
    plotScatterX = d3.scaleLinear()
        .domain([0, 250])
        .range([0, scatterWidth]);

    svg.append("g")
    .attr("transform", "translate(0, " + scatterHeight + ")")
    .call(d3.axisBottom(plotScatterX));
    
    // Y axis
    plotScatterY = d3.scaleLinear()
        .domain([0, 100])
        .range([scatterHeight, 0]);
    
    svg.append("g").call(d3.axisLeft(plotScatterY));
}
var plotScatterX = () => {}
var plotScatterY = () => {}
var nowXAxis = "bpm";
var nowYAxis = "danceability_%";

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
    .attr("id", "scatter-x-label")
    .attr("x", scatterWidth/2)
    .attr("y", scatterHeight+30)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .text("BPM")

    // Y label
    svg.append("text")
    .attr("id", "scatter-y-label")
    .attr("x", -30)
    .attr("y", scatterHeight/2)
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90, -35, ${scatterHeight/2})`)
    .text("Danceability")

    // X axis
    plotScatterX = d3.scaleLinear()
        .domain([0, 204])
        .range([0, scatterWidth]);

    svg.append("g")
    .attr("id", "scatter-x-axis")
    .attr("transform", "translate(0, " + scatterHeight + ")")
    .call(d3.axisBottom(plotScatterX));
    
    // Y axis
    plotScatterY = d3.scaleLinear()
        .domain([0, 95])
        .range([scatterHeight, 0]);
    
    svg.append("g")
    .attr("id", "scatter-y-axis")
    .call(d3.axisLeft(plotScatterY));

    // Tip
    const tip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(e, d){ 
        return `Song name: ${d['track_name']}, Artist: ${d['artist(s)_name']}`
    })

    svg.call(tip)

    // scatter points
    svg.selectAll("scatterDots")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function (d) { return plotScatterX(d[nowXAxis]); } )
        .attr("cy", function (d) { return plotScatterY(d[nowYAxis]); } )
        .style("opacity", 0.7)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .transition()
        .duration(1000)
        .attr("r", 4)
        .style("fill", "#6B5CA5")
}

function plotScatterUpdate(data, svg, scatterWidth, scatterHeight){
    // update axis
    const xMin = d3.min(data, d => parseInt(d[nowXAxis]));
    const xMax = d3.max(data, d => parseInt(d[nowXAxis]));
    plotScatterX.domain([0, xMax]);
    svg.select("#scatter-x-axis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(plotScatterX));

    const yMin = d3.min(data, d => parseInt(d[nowYAxis]));
    const yMax = d3.max(data, d => parseInt(d[nowYAxis]));
    plotScatterY.domain([0, yMax]);
    svg.select("#scatter-y-axis")
    .transition()
    .duration(1000)
    .call(d3.axisLeft(plotScatterY));
    
    // update points
    svg.selectAll("circle")
    .data(data)
    .exit()
    .transition()
    .duration(1000)
    .style("opacity", 0)

    svg.selectAll("circle")
    .data(data)
    .transition()
    .duration(1000)
    .attr("cx", function (d) { return plotScatterX(d[nowXAxis]); } )
    .attr("cy", function (d) { return plotScatterY(d[nowYAxis]); } )
    .style("opacity", (d) => { return d[nowXAxis] == "0" || d[nowYAxis] == "0" ? 0 : 0.7} ) 
}

function plotScatterUpdateAxis(data, svg, xAxis, yAxis){
    nowXAxis = xAxis;
    nowYAxis = yAxis;
    // update label
    const xAxisLabel = xAxis.replace("_%", "")
                            .replace(/_/g, " ")
                            .replace("bpm", "BPM")
                            .split(" ")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ");
    const yAxisLabel = yAxis.replace("_%", "")
                            .replace(/_/g, " ")               
                            .replace("bpm", "BPM")
                            .split(" ")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ");
                            
    svg.select("#scatter-x-label").text(xAxisLabel)
    svg.select("#scatter-y-label").text(yAxisLabel)

    // update axis
    const xMin = d3.min(data, d => parseInt(d[xAxis]));
    const xMax = d3.max(data, d => parseInt(d[xAxis]));
    plotScatterX.domain([0, xMax]);
    svg.select("#scatter-x-axis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(plotScatterX));
    
    const yMin = d3.min(data, d => parseInt(d[yAxis]));
    const yMax = d3.max(data, d => parseInt(d[yAxis]));
    plotScatterY.domain([0, yMax]);
    svg.select("#scatter-y-axis")
    .transition()
    .duration(1000)
    .call(d3.axisLeft(plotScatterY));

    // update points
    svg.selectAll("circle")
    .data(data)
    .transition()
    .duration(1000)
    .attr("cx", function (d) { return plotScatterX(d[xAxis]); } )
    .attr("cy", function (d) { return plotScatterY(d[yAxis]); } )
    .style("opacity", (d) => { return d[xAxis] == "0" || d[yAxis] == "0" ? 0 : 0.7 })
}

export { plotScatterUpdate, plotScatterUpdateAxis }
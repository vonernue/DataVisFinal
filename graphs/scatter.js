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
    .text(`Scatter Plot By Custom Attributes`)
    
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

    // Regression line
    const coords = data.map((d) => {
        const x = parseIntData(d[nowXAxis]);
        const y = parseIntData(d[nowYAxis]);
        if(isInvalidNumber(x) || isInvalidNumber(y)) return null;
        return [x, y];
    }).filter(d => d != null);
    const reg = regression.linear(coords)
    const regLine = reg.predict;
    
    svg.append("line")
    .attr("id", "pcc-line")
    .attr("x1", plotScatterX(regLine(0)[0]))
    .attr("y1", plotScatterY(regLine(0)[1]))
    .attr("x2", plotScatterX(regLine(0)[0]))
    .attr("y2", plotScatterY(regLine(0)[1]))
    .attr("stroke-width", 2)
    .attr("stroke", "#D62246")
    .transition()
    .duration(1000)
    .attr("x2", plotScatterX(regLine(204)[0]))
    .attr("y2", plotScatterY(regLine(204)[1]))

    // correlation coefficient
    const pcc = reg.equation[0]*getStandardDeviation(coords.map(d => d[0]))/getStandardDeviation(coords.map(d => d[1]));

    svg.append("text")
    .attr("x", scatterWidth)
    .attr("y", -20)
    .attr("id", "pcc-label")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .text(`(r = ${pcc.toFixed(2)})`)

    // scatter points
    svg.selectAll("scatterDots")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function (d) { return plotScatterX(parseIntData(d[nowXAxis])); } )
        .attr("cy", function (d) { return plotScatterY(parseIntData(d[nowYAxis])); } )
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
    const xMin = d3.min(data, d => parseIntData(d[nowXAxis]));
    const xMax = d3.max(data, d => parseIntData(d[nowXAxis]));
    plotScatterX.domain([0, xMax]);
    svg.select("#scatter-x-axis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(plotScatterX));

    const yMin = d3.min(data, d => parseIntData(d[nowYAxis]));
    const yMax = d3.max(data, d => parseIntData(d[nowYAxis]));
    plotScatterY.domain([0, yMax]);
    svg.select("#scatter-y-axis")
    .transition()
    .duration(1000)
    .call(d3.axisLeft(plotScatterY));

    // update pcc line
    const coords = data.map((d) => {
        const x = parseIntData(d[nowXAxis]);
        const y = parseIntData(d[nowYAxis]);
        if(isInvalidNumber(x) || isInvalidNumber(y)) return null;
        return [x, y];
    }).filter(d => d != null);
    const reg = regression.linear(coords)
    const regLine = reg.predict;
    
    svg.select("#pcc-line")
    .transition()
    .duration(1000)
    .attr("x1", plotScatterX(regLine(0)[0]))
    .attr("y1", plotScatterY(regLine(0)[1]))
    .attr("x2", plotScatterX(regLine(xMax)[0]))
    .attr("y2", plotScatterY(regLine(xMax)[1]))

    // update pcc label
    console.log(reg)
    const pcc = reg.equation[0]*getStandardDeviation(coords.map(d => d[0]))/getStandardDeviation(coords.map(d => d[1]));
    svg.select("#pcc-label")
    .transition()
    .duration(1000)
    .text(`(r = ${pcc.toFixed(2)})`)
    
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
    .attr("cx", function (d) { return plotScatterX(parseIntData(d[nowXAxis])); } )
    .attr("cy", function (d) { return plotScatterY(parseIntData(d[nowYAxis])); } )
    .style("opacity", (d) => { 
        return  isInvalidNumber(parseIntData(d[nowXAxis])) || 
                isInvalidNumber(parseIntData(d[nowYAxis]))
                ? 0 : 0.7
    } ) 
}

function plotScatterUpdateAxis(data, svg, scatterWidth, scatterHeight, xAxis, yAxis, ){
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

    plotScatterUpdate(data, svg, scatterWidth, scatterHeight);
}

function getStandardDeviation(values){
    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    return standardDeviation;
}    

function parseIntData(str){
    if(str == "") return NaN;
    return parseInt(str.replace(",", ""));
}

function isInvalidNumber(num){
    return isNaN(num) || num == 0;
}

export { plotScatterUpdate, plotScatterUpdateAxis }
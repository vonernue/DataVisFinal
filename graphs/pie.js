export default function(data, svg, pieWidth, pieHeight){
    // ------Radius Pie Chart------
    var bmpData = data.map((d) => d.bpm)
    var bins = d3.range(65, 200, 20)
    var histogram = d3.histogram()
        .domain([65, 200])
        .thresholds(bins)
    var binsData = histogram(bmpData)
    var totalData = binsData.reduce((a, b) => a + b.length, 0);
    var maxData = d3.max(binsData, function (d) {
        return d.length;
    });

    // Title
    svg.append("text")
        .attr("x", pieWidth / 2)
        .attr("y", -20)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("BPM Distribution")

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(function (d) {
            return d.data.length * 0.6 + 20;
        });

    var outerArc = d3.arc()
        .innerRadius(0)
        .outerRadius(function (d) {
            return (d.data.length * 0.6 + 20) * 1.1;
        });

    var pie = d3.pie()
        .value(function (d) {
            return d.length;
        });

    var colorScale = d3.scaleOrdinal()
        .domain([0, d3.max(binsData, function (d) {
            return d.length;
        })])
        .range(d3.schemeDark2);

    svg.selectAll("path")
        .data(pie(binsData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d) {
            return colorScale(d.data.length);
        })
        .attr("stroke", "white")
        .style("stroke-width", "0px")
        .attr("transform", `translate(${pieWidth / 2 - 20}, ${pieHeight / 2 + 30})`)
        .on("mouseover", function (d) {
            d3.select(this)
                .style("stroke-width", "3px")
                .style("cursor", "pointer");
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("stroke-width", "0px");
        })

    // Legend
    var legend = svg.append("g")
        .attr("transform", `translate(${pieWidth - 40}, ${pieHeight - 100})`)
        .attr("id", "pie-legend");

    legend.selectAll("rect")
        .data(binsData)
        .enter()
        .append("rect")
        .attr("range", function (d) {
            return d.x0 + "-" + d.x1;
        })
        .attr("x", 0)
        .attr("y", function (d, i) {
            return i * 20;
        })
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", function (d) {
            return colorScale(d.length);
        })
        .on("mouseover", function (d) {
            d3.select(this)
                .style("cursor", "pointer");
        })


    legend.selectAll("text")
        .data(binsData)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", function (d, i) {
            return i * 20 + 10;
        })
        .text(function (d) {
            return d.x0 + "-" + d.x1;
        })
        .attr("font-size", "10px")
        .attr("alignment-baseline", "middle");

    // pie group
    var pieLabelGroup = svg.append("g")
    .attr("transform", `translate(${pieWidth / 2 - 20}, ${pieHeight / 2 + 30})`)
    .attr("id", "pie-labels");
    
    // add the polylines between chart and labels:
    pieLabelGroup.selectAll('allPolylines')
        .data(pie(binsData))
        .enter()
        .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function (d) {
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = 1.1 * pieWidth / 3 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
        })
        .attr("opacity", function (d) {
            return d.data.length / totalData * 100 < 10 ? 0 : 1;
        });

    pieLabelGroup.selectAll('allLabels')
        .data(pie(binsData))
        .enter()
        .append('text')
        .text(function (d) {
            return d.data.length;
        })
        .attr("transform", function (d) {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = pieWidth / 2.5 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })
        .attr("font-size", "10px")
        .attr("alignment-baseline", "middle")
        .attr("opacity", function (d) {
            return d.data.length / totalData * 100 < 10 ? 0 : 1;
        })
        
}

function plotPieUpdate(data, svg, pieWidth){
    var bmpData = data.map((d) => d.bpm)
    var bins = d3.range(65, 200, 20)
    var histogram = d3.histogram()
        .domain([65, 200])
        .thresholds(bins)
    var binsData = histogram(bmpData)
    var totalData = binsData.reduce((a, b) => a + b.length, 0);


    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(function (d) {
            return d.data.length * 0.6 + 20;
        });
    
    var outerArc = d3.arc()
        .innerRadius(0)
        .outerRadius(function (d) {
            return (d.data.length * 0.6 + 20) * 1.1;
        }
    );

    var pie = d3.pie()
        .value(function (d) {
            return d.length;
        });

    svg.selectAll("path")
        .data(pie(binsData))
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            var i = d3.interpolate(this._current, d);
            this._current = i(0);
            return function(t) {
              return arc(i(t));
            };
        }
    )
    
    var labelGroup = svg.select("#pie-labels")
    labelGroup.selectAll("polyline")
        .data(pie(binsData))
        .transition()
        .duration(1000)
        .attr("points", function (d) {
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = 1.1 * pieWidth / 3 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
        })
        .attr("opacity", function (d) {
            return d.data.length / totalData * 100 < 10 ? 0 : 1;
        })

    labelGroup.selectAll("text")
        .data(pie(binsData))
        .transition()
        .duration(1000)
        .text(function (d) {
            return d.data.length;
        })
        .attr("transform", function (d) {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = pieWidth / 2.5 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .attr("opacity", function (d) {
            return d.data.length / totalData * 100 < 10 ? 0 : 1;
        })

}

export {plotPieUpdate}
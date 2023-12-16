import plotBar from './graphs/bar.js'

const scatterLeft = 0, scatterTop = 220;
const scatterTotalWidth = 600, scatterTotalHeight = 400;
const scatterLegendWidth = 100, scatterLegendHeight = 400;
const scatterMargin = {top: 40, right: 30, bottom: 40, left: 100},
      scatterWidth = scatterTotalWidth - scatterMargin.left - scatterMargin.right - scatterLegendWidth,
      scatterHeight = scatterTotalHeight - scatterMargin.top - scatterMargin.bottom;

const donutLeft = 100, donutTop = -195;
const donutTotalWidth = 360, donutTotalHeight = 200;
const donutMargin = {top: 30, right: 30, bottom: 40, left: 40},
      donutWidth = donutTotalWidth - donutMargin.left - donutMargin.right,
      donutHeight = donutTotalHeight - donutMargin.top - donutMargin.bottom;

const barLeft = 0, barTop = -400;
const barTotalWidth = 700, barTotalHeight = 200;
const barMargin = {top: 30, right: 30, bottom: 40, left: 100},
      barWidth = barTotalWidth - barMargin.left - barMargin.right,
      barHeight = barTotalHeight - barMargin.top - barMargin.bottom;

// scatter plot

const scatterSvg = d3.select("#chart-area").append("svg")
.attr("width", scatterTotalWidth)
.attr("height", scatterTotalHeight)
.attr("transform", `translate(${scatterLeft}, ${scatterTop})`)

const scatterChart = scatterSvg.append("g")
.attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

// donut chart

const donutSvg = d3.select("#chart-area").append("svg")
.attr("width", donutTotalWidth)
.attr("height", donutTotalHeight)
.attr("transform", `translate(${donutLeft}, ${donutTop})`)

const donutChart = donutSvg.append("g")
.attr("transform", `translate(${donutMargin.left}, ${donutMargin.top})`)

const donutColor = d3.scaleOrdinal()
.range(["#115f9a", "#008dbe", "#00b7af", "#00da72", "#d0ee11"])

const donutRadius = 70
var donutSelectedLegend = []

// bar chart

var selectedBarDown = 0
var selectedBarUp = 0
var selectedBar = false
const barSvg = d3.select("#chart-area").append("svg")
.attr("width", barTotalWidth)
.attr("height", barTotalHeight)
.attr("transform", `translate(${barLeft}, ${barTop})`)
.on("mousedown", function(e) {
  selectedBarDown = e.offsetX
})
.on("mouseup", function(e) {
  selectedBarUp = e.offsetX
  if (selectedBarDown > selectedBarUp){
    let tmp = selectedBarDown
    selectedBarDown = selectedBarUp
    selectedBarUp = tmp
  }
  console.log(selectedBarUp, selectedBarDown)
  barChart.append("rect")
  .attr("x", selectedBarDown-100)
  .attr("y", 0)
  .attr("width", selectedBarUp - selectedBarDown)
  .attr("height", barHeight)
  .style("fill", "#808080")
  .style("opacity", .3)
  .classed("selectedBarRect", true)

  barChart.selectAll(".barRect")
  .filter(function(d) {
    if (d == undefined) return false
    return !((d.x1 * 47.5 + 50 >= selectedBarDown && d.x1 * 47.5+ 50 <= selectedBarUp) || 
            (d.x0 * 47.5+ 50 <= selectedBarUp && d.x0 * 47.5+50 >= selectedBarDown))
  })
  .transition()
  .duration(1000)
  .attr("height", function(d) { return d.height; }) 
})
.on("click", function(e) {
  if (!selectedBar){
    selectedBar = true
  }else{
    barChart.selectAll(".selectedBarRect").remove()
    barChart.selectAll(".barRect")
    .transition()
    .duration(1000)
    .attr("height", 0)
    selectedBar = false
  }
})

.classed("barChart", true)

const barChart = barSvg.append("g")
.attr("transform", `translate(${barMargin.left}, ${barMargin.top})`)

d3.csv("./spotify-2023.csv").then(function(data) {
  data = data.filter((v, i, a) => v.released_year == 2023 || v.released_year == 2022)
  plotBar(data, barChart, barWidth, barHeight)
});
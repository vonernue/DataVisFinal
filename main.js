import plotBar, {plotBarUpdate, plotBarX} from './graphs/bar.js'
import plotPie, {plotPieUpdate} from './graphs/pie.js'

var originalData = []
var nowFilter = {sMonth: 1, eMonth: 12, sBpm: 0, eBpm: 1000}

const scatterLeft = 0, scatterTop = 220;
const scatterTotalWidth = 600, scatterTotalHeight = 400;
const scatterLegendWidth = 100, scatterLegendHeight = 400;
const scatterMargin = {top: 40, right: 30, bottom: 40, left: 100},
      scatterWidth = scatterTotalWidth - scatterMargin.left - scatterMargin.right - scatterLegendWidth,
      scatterHeight = scatterTotalHeight - scatterMargin.top - scatterMargin.bottom;

const pieLeft = 100, pieTop = 0;
const pieTotalWidth = 400, pieTotalHeight = 300;
const pieMargin = {top: 30, right: 30, bottom: 40, left: 30},
      pieWidth = pieTotalWidth - pieMargin.left - pieMargin.right,
      pieHeight = pieTotalHeight - pieMargin.top - pieMargin.bottom;

const barLeft = 100, barTop = 0;
const barTotalWidth = 700, barTotalHeight = 300;
const barMargin = {top: 30, right: 30, bottom: 40, left: 100},
      barWidth = barTotalWidth - barMargin.left - barMargin.right,
      barHeight = barTotalHeight - barMargin.top - barMargin.bottom;

// scatter plot

// const scatterSvg = d3.select("#chart-area").append("svg")
// .attr("width", scatterTotalWidth)
// .attr("height", scatterTotalHeight)
// .attr("transform", `translate(${scatterLeft}, ${scatterTop})`)

// const scatterChart = scatterSvg.append("g")
// .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

// donut chart

const donutSvg = d3.select("#chart-area").append("svg")
.attr("width", pieTotalWidth)
.attr("height", pieTotalHeight)
.attr("transform", `translate(${pieLeft}, ${pieTop})`)

const donutChart = donutSvg.append("g")
.attr("transform", `translate(${pieMargin.left}, ${pieMargin.top})`)

const pieColor = d3.scaleOrdinal()
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

const barChart = barSvg.append("g")
.attr("transform", `translate(${barMargin.left}, ${barMargin.top})`)

const barBrush = d3.brushX().extent([
  [0.5, 0.5],
  [barWidth - 0.5, barHeight - 0.5],
])
.on("start", brushStarted)
.on("brush", brushing)
.on("end", brushEnded);


d3.csv("./spotify-2023.csv").then(function(data) {
  originalData = data.filter((v, i, a) => v.released_year == 2023 || v.released_year == 2022)
  
  plotBar(originalData, barChart, barWidth, barHeight)
  plotPie(originalData, donutChart, pieWidth, pieHeight, pieColor)
  // This line should be drawn after the bars
  // or the brush will be covered by the bars
  barChart.append("g").call(barBrush);

});

function brushStarted(){
  nowFilter.sMonth = 1
  nowFilter.eMonth = 12
  let data = originalData.filter((v, i, a) => 
    v.released_month >= nowFilter.sMonth &&
    v.released_month <= nowFilter.eMonth &&
    v.bpm >= nowFilter.sBpm &&
    v.bpm <= nowFilter.eBpm
  )
  plotBarUpdate(data, barChart, barWidth, barHeight)
}

function brushing({selection}){
  if(!selection){
    nowFilter.sMonth = 1
    nowFilter.eMonth = 12
  }
  else{
    nowFilter.sMonth = Math.floor(plotBarX.invert(selection[0]))
    nowFilter.eMonth = Math.floor(plotBarX.invert(selection[1]))
  }
  updateView(nowFilter)
}

function brushEnded({selection}){
  brushing({selection})
}

// This function will also update nowFilter
function updateView(filter){
  filter = nowFilter
  let data = originalData.filter((v, i, a) => 
    v.released_month >= filter.sMonth &&
    v.released_month <= filter.eMonth &&
    v.bpm >= filter.sBpm &&
    v.bpm <= filter.eBpm
  )
  plotBarUpdate(data, barChart, barWidth, barHeight)
  plotPieUpdate(data, donutChart, pieWidth, pieHeight)
}
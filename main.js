import plotBar, {plotBarUpdate, plotBarX} from './graphs/bar.js'
import plotScatter from './graphs/scatter.js'

var originalData = []
var nowFilter = {sMonth: 1, eMonth: 12, sBpm: 0, eBpm: 1000}

const scatterLeft = 0, scatterTop = 220;
const scatterTotalWidth = 800, scatterTotalHeight = 500;
const scatterLegendWidth = 100, scatterLegendHeight = 500;
const scatterMargin = {top: 40, right: 30, bottom: 40, left: 100},
      scatterWidth = scatterTotalWidth - scatterMargin.left - scatterMargin.right - scatterLegendWidth,
      scatterHeight = scatterTotalHeight - scatterMargin.top - scatterMargin.bottom;

const donutLeft = 100, donutTop = -195;
const donutTotalWidth = 360, donutTotalHeight = 200;
const donutMargin = {top: 30, right: 30, bottom: 40, left: 40},
      donutWidth = donutTotalWidth - donutMargin.left - donutMargin.right,
      donutHeight = donutTotalHeight - donutMargin.top - donutMargin.bottom;

const barLeft = 0, barTop = -500;
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
  // This line should be drawn after the bars
  // or the brush will be covered by the bars
  barChart.append("g").call(barBrush);
  
  plotScatter(originalData, scatterChart, scatterWidth, scatterHeight)
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
}
import plotBar, {plotBarUpdate, plotBarX} from './graphs/bar.js'
import plotScatter, {plotScatterUpdate, plotScatterUpdateAxis} from './graphs/scatter.js'
import plotPie, {plotPieUpdate} from './graphs/pie.js'

var originalData = []
var nowFilter = {sMonth: 1, eMonth: 12, sBpm: 0, eBpm: 1000}

const scatterLeft = 0, scatterTop = 320;
const scatterTotalWidth = 1400, scatterTotalHeight = 500;
const scatterLegendWidth = 100, scatterLegendHeight = 500;
const scatterMargin = {top: 40, right: 30, bottom: 40, left: 100},
      scatterWidth = scatterTotalWidth - scatterMargin.left - scatterMargin.right - scatterLegendWidth,
      scatterHeight = scatterTotalHeight - scatterMargin.top - scatterMargin.bottom;

const pieLeft = 800, pieTop = -500;
const pieTotalWidth = 400, pieTotalHeight = 300;
const pieMargin = {top: 30, right: 30, bottom: 40, left: 30},
      pieWidth = pieTotalWidth - pieMargin.left - pieMargin.right,
      pieHeight = pieTotalHeight - pieMargin.top - pieMargin.bottom;

const barLeft = -400, barTop = -500;
const barTotalWidth = 700, barTotalHeight = 300;
const barMargin = {top: 30, right: 30, bottom: 40, left: 100},
      barWidth = barTotalWidth - barMargin.left - barMargin.right,
      barHeight = barTotalHeight - barMargin.top - barMargin.bottom;

const options = [
  { value: 'bpm', text: 'BPM' },
  { value: 'streams', text: '串流次數' },
  { value: 'danceability_%', text: '律動性' },
  { value: 'valence_%', text: '正向性' },
  { value: 'energy_%', text: '活力性' },
  { value: 'acousticness_%', text: '人聲感' },
  { value: 'instrumentalness_%', text: '樂器感' },
  { value: 'liveness_%', text: '現場演出感' },
  { value: 'speechiness_%', text: '演說感' },
  { value: 'in_spotify_playlists', text: 'Spotify播放清單收藏數' },
  { value: 'in_spotify_charts', text: 'Spotify排名' },
  { value: 'in_apple_playlists', text: 'Apple Music播放清單收藏數' },
  { value: 'in_apple_charts', text: 'Apple Music排名' },
  { value: 'in_deezer_playlists', text: 'Deezer播放清單收藏數' },
  { value: 'in_deezer_charts', text: 'Deezer排名' },
  { value: 'in_shazam_charts', text: 'Shazam排名' }
];

// scatter plot

const scatterSvg = d3.select("#chart-area").append("svg")
.attr("width", scatterTotalWidth)
.attr("height", scatterTotalHeight)
.attr("transform", `translate(${scatterLeft}, ${scatterTop})`)

const scatterChart = scatterSvg.append("g")
.attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)

const customXAxisSelect = document.getElementById('custom-x-axis');
const customYAxisSelect = document.getElementById('custom-y-axis');

options.forEach(option => {
    const xOption = document.createElement('option');
    xOption.value = option.value;
    xOption.textContent = option.text;
    
    const yOption = xOption.cloneNode(true);
    
    if(option.value === 'bpm')
        xOption.selected = true
    if(option.value === 'danceability_%')
        yOption.selected = true

    customXAxisSelect.appendChild(xOption);
    customYAxisSelect.appendChild(yOption);
});

customXAxisSelect.onchange = function() {
    const data = getFilteredData()  
    const selectedXValue = customXAxisSelect.value;
    const selectedYValue = customYAxisSelect.value;
    plotScatterUpdateAxis(data, scatterChart, scatterWidth, scatterHeight, selectedXValue, selectedYValue);
}
customYAxisSelect.onchange = customXAxisSelect.onchange;

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

function getFilteredData(filter = nowFilter){
  return originalData.filter((v, i, a) => 
    v.released_month >= filter.sMonth &&
    v.released_month <= filter.eMonth &&
    v.bpm >= filter.sBpm &&
    v.bpm <= filter.eBpm
  )
}

// This function will also update nowFilter
function updateView(filter){
  nowFilter = filter
  let data = getFilteredData()
  plotBarUpdate(data, barChart, barWidth, barHeight)
  plotScatterUpdate(data, scatterChart, scatterWidth, scatterHeight)
  plotPieUpdate(data, donutChart, pieWidth, pieHeight)
}

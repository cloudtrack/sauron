function convertToChartjsData(esResp) {
  var labels = []
  var datas = []

  esResp.hits.hits.forEach(function(val, idx) {
    // labels.push(val._source.date.toTimeString().split(' ')[0].slice(0, -3))
    var date = new Date(val._source.date).toTimeString();
    if (idx % 2)
      labels.push(date.slice(0,5))
    else
      labels.push('')
    datas.push(val._source.value)
  })

  var chartjsData = {}
  chartjsData.labels = labels.reverse()
  chartjsData.datasets = [{
    label: 'hell',
    //from chart.js example
    fillColor: "rgba(220,220,220,0.2)",
    strokeColor: "rgba(220,220,220,1)",
    pointColor: "rgba(220,220,220,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)",
    data: datas.reverse()
  }]

  // console.log(chartjsData)
  return chartjsData
}

module.exports = convertToChartjsData

import _ from 'lodash'

function convertToChartjsData(labels, datas) {
  var chartjsData = {}
  chartjsData.labels = _.map(labels, function(item) {
    return new Date(item).toTimeString().slice(0, 5)
  })
  chartjsData.datasets = [{
    label: 'hell',
    //from chart.js example
    fillColor: "rgba(220,220,220,0.2)",
    strokeColor: "rgba(220,220,220,1)",
    pointColor: "rgba(220,220,220,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)",
    data: datas
  }]

  return chartjsData
}

module.exports = convertToChartjsData

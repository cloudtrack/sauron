// function convertToChartjsData(awsData) {
//   var labels = [];
//   var datas = [];

//   _.forEach(awsData.Datapoints, function(val, idx) {
//     labels.push(val.Timestamp.toTimeString().split(' ')[0].slice(0, -3));
//     datas.push(val.Average);
//   });

//   var chartjsData = {};
//   chartjsData.labels = labels;
//   chartjsData.datasets = [{
//     label: awsData.Label,
//     //from chart.js example
//     fillColor: "rgba(220,220,220,0.2)",
//     strokeColor: "rgba(220,220,220,1)",
//     pointColor: "rgba(220,220,220,1)",
//     pointStrokeColor: "#fff",
//     pointHighlightFill: "#fff",
//     pointHighlightStroke: "rgba(220,220,220,1)",
//     data: datas
//   }]

//   return chartjsData;
// };
var jsonfile = require('jsonfile')

var esResp = require('./es.json')
convertToChartjsData(esResp)

function convertToChartjsData(esResp) {
  console.log('hello')

  var labels = []
  var datas = []

  esResp.hits.hits.forEach(function(val, idx) {
    // console.log(typeof(val._source.date))
    // labels.push(val._source.date.toTimeString().split(' ')[0].slice(0, -3))
    labels.push(val._source.date)
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
  jsonfile.writeFileSync('sample2.json', chartjsData)
  return chartjsData
}

module.exports = convertToChartjsData

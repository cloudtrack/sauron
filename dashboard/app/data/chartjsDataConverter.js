var _ = require('lodash');

function convertToChartjsData(awsData) {
  var labels = [];
  var datas = [];

  _.forEach(awsData.Datapoints, function(val, idx) {
    labels.push(val.Timestamp.toTimeString().split(' ')[0].slice(0, -3));
    datas.push(val.Average);
  });

  var chartjsData = {};
  chartjsData.labels = labels;
  chartjsData.datasets = [{
    label: awsData.Label,
    //from chart.js example
    fillColor: "rgba(220,220,220,0.2)",
    strokeColor: "rgba(220,220,220,1)",
    pointColor: "rgba(220,220,220,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)",
    data: datas
  }]

  return chartjsData;
};

module.exports = convertToChartjsData;

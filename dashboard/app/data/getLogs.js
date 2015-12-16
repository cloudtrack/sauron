import app from '../app'
import _ from 'lodash'

function bucket2LabelValue(histogramBuckets) {
  var result = { label: [], value: [] };
  _.forEach(histogramBuckets, function(item) {
    result.label.push(item.key_as_string)
    result.value.push(item.avg_metric.value)
  })
  return result;
}

module.exports = function(instanceType, metricName, duration, callback, errCallback, dateFrom, dateTo) {
  switch(duration) {
    case('30m'):
      var fromString = "now-30m"
      var toString = "now"
      var binString = "1m"
      break;

    case('6h'):
      var fromString = "now-6h"
      var toString = "now"
      var binString = "8m"
      break;

    case('1d'):
      var fromString = "now-1d"
      var toString = "now"
      var binString = "48m"
      break;

    case('custom'):
      var fromString = "now-" + Math.ceil((new Date().getTime() - dateFrom.getTime())/(60*1000)) + "m"
      var toString = "now-" + Math.ceil((new Date().getTime() - dateTo.getTime())/(60*1000)) + "m"
      var durationMinutes = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60)
      var binSize = Math.ceil(durationMinutes / 30)
      var binString = binSize.toString() + "m"
      break;

    default:
      console.log("wrong parameter")
  }

  app.es.search({
    index: 'metrics',
    type: instanceType,
    body:
    {
      "size": 0,
      "query": {
          "filtered": {
              "query": { "match": { "metric": metricName }},
              "filter": {
                  "range": {
                      "date" : {
                          "gt": fromString,
                          "lt": toString
                      }
                  }
              }
          }
      },
      "aggs": {
          "windowing": {
              "date_histogram": {
                  "field": "date",
                  "interval": binString
              },
              "aggs": {
                  "avg_metric": {
                      "avg": {
                          "field": "value"
                      }
                  }
              }
          }
      }
    }
  }).then(function(resp) {
    console.log(resp)
    var result = bucket2LabelValue(resp.aggregations.windowing.buckets)
    callback(result)
  }, function(err) {
    errCallback(err)
  });
}

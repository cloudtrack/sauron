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

var baseQuery = {
  size: 1,
  query: {
    match: {
      metric: ""
    }
  },
  sort: { "date": { "order": "desc" }},
  aggs: {
      "from_hrs_ago": {
          "date_range": {
              "field": "date",
              "format": "hh:mm:ss-MM/dd",
              "ranges": [
                  { "from": "now-30m" }
              ]
          },
          "aggs": {
              "make_histogram": {
                  "date_histogram": {
                      "field": "date",
                      "interval": "1m"
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
  }
}

module.exports = function(instanceType, metricName, duration, callback, errCallback, dateFrom, dateTo) {
  baseQuery.query.match.metric = metricName
  switch(duration) {
    case('30m'):
      baseQuery.aggs.from_hrs_ago.date_range.ranges[0].from = "now-30m"
      baseQuery.aggs.from_hrs_ago.aggs.make_histogram.date_histogram.interval = "1m"
      break;

    case('6h'):
      baseQuery.aggs.from_hrs_ago.date_range.ranges[0].from = "now-6h"
      baseQuery.aggs.from_hrs_ago.aggs.make_histogram.date_histogram.interval = "8m"
      break;

    case('1d'):
      baseQuery.aggs.from_hrs_ago.date_range.ranges[0].from = "now-1d"
      baseQuery.aggs.from_hrs_ago.aggs.make_histogram.date_histogram.interval = "48m"
      break;

    case('custom'):
      var fromString = "now-" + Math.ceil((new Date().getTime() - dateFrom.getTime())/(60*1000)) + "m"
      var toString = "now-" + Math.ceil((new Date().getTime() - dateTo.getTime())/(60*1000)) + "m"
      var durationMinutes = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60)
      var binSize = Math.ceil(durationMinutes / 30)
      var binString = binSize.toString() + "m"

      baseQuery = {
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
      break;

    default:
      console.log("wrong parameter")
  }
  app.es.search({
    index: 'metrics',
    type: instanceType,
    body: baseQuery
  }).then(function(resp) {
    console.log(baseQuery)
    console.log(resp)
    if (duration == 'custom') {
      var result = bucket2LabelValue(resp.aggregations.windowing.buckets)
      console.log(result)
    } else {
      var result = bucket2LabelValue(resp.aggregations.from_hrs_ago.buckets[0].make_histogram.buckets)
    }
    callback(result)
  }, function(err) {
    errCallback(err)
  });
}

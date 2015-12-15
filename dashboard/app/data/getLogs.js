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

module.exports = function(instanceType, metricName, duration, callback, errCallback) {
  switch(duration) {
    case('30m'):
      var query = {
        size: 1,
        query: {
          match: {
            metric: metricName
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
      break;
    case('6h'):
      var query = {
        size: 1,
        query: {
          match: {
            metric: metricName
          }
        },
        sort: { "date": { "order": "desc" }},
        aggs: {
            "from_hrs_ago": {
                "date_range": {
                    "field": "date",
                    "format": "hh:mm:ss-MM/dd",
                    "ranges": [
                        { "from": "now-6h" }
                    ]
                },
                "aggs": {
                    "make_histogram": {
                        "date_histogram": {
                            "field": "date",
                            "interval": "8m"
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
      break;
    case('1d'):
      var query = {
        size: 1,
        query: {
          match: {
            metric: metricName
          }
        },
        sort: { "date": { "order": "desc" }},
        aggs: {
            "from_hrs_ago": {
                "date_range": {
                    "field": "date",
                    "format": "hh:mm:ss-MM/dd",
                    "ranges": [
                        { "from": "now-1d" }
                    ]
                },
                "aggs": {
                    "make_histogram": {
                        "date_histogram": {
                            "field": "date",
                            "interval": "48m"
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
      break;
  }
  app.es.search({
    index: 'metrics',
    type: instanceType,
    body: query
  }).then(function(resp) {
    console.log(resp)
    var result = bucket2LabelValue(resp.aggregations.from_hrs_ago.buckets[0].make_histogram.buckets)
    callback(result)
  }, function(err) {
    errCallback(err)
  });
}

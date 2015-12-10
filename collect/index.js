console.log('Loading function');

var async = require('async');
var _ = require('lodash');

var aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-1'});
var CloudWatch = new aws.CloudWatch({apiVersion: '2010-08-01'});

var ES = require('elasticsearch');
var client = new ES.Client({
  host: 'https://search-sauron-j75hyivu5hfn4sayixpwx6gmru.ap-northeast-1.es.amazonaws.com'
});

exports.handler = function(event, context) {
  var params = {
    StartTime: new Date(new Date().setTime(new Date().getTime() - 5*60*1000)),
    EndTime: new Date(),
    Namespace: 'AWS/EC2',
    Period: 60,
    MetricName: 'CPUUtilization',
    Statistics: ['Average'],
    Unit: 'Percent'
  };

  CloudWatch.getMetricStatistics(params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else {
      var actions = _.reduceRight(data.Datapoints,
        function(flattend, other) {
          return flattend.concat([
          {
            index: {
              _index: 'metrics',
              // http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html
              // We can omit 'AWS/': all namespaces starts with it.
              _type: params.Namespace.split('/')[1],
            }
          },
          {
            date: other.Timestamp,
            metric: params.MetricName,
            value: other.Average
          }
          ]);
        }, []);
      client.bulk({ body: actions }, function(err, resp) {
        if (err)
          console.log(err);
        else
          context.succeed(resp);
      });
    }
  });

};

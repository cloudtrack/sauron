console.log('Loading function');

var aws = require('aws-sdk');
var CloudWatch = new aws.CloudWatch({apiVersion: '2010-08-01'});

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
  else
    console.log(data);
  });
}

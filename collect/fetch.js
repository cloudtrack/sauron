console.log('Loading function');

var aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-1'});
var CloudWatch = new aws.CloudWatch({apiVersion: '2010-08-01'});

var ES = require('elasticsearch');
var client = new ES.Client({
  host: 'https://search-sauron-j75hyivu5hfn4sayixpwx6gmru.ap-northeast-1.es.amazonaws.com',
  log: 'trace'
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
      console.log(data);
      client.create({
        index: 'services',
        //http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html
        //we can omit 'AWS/' parts
        type: params.Namespace.split('/')[1],
        body: {
          date: data.Datapoints[0].Timestamp,
          metric: params.MetricName,
          value: data.Datapoints[0].Average
        }
      }, function (error, response) {
        if (err) {
          console.log(error);
        } else {
          // console.log(response);
        }
      })
    }
  });
}

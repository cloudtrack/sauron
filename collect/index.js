console.log('Loading function');

var async = require('async');
var _ = require('lodash');

var aws = require('aws-sdk');
aws.config.update({region: 'ap-northeast-1'});
var EC2 = new aws.EC2();
var RDS = new aws.RDS();
var ELB = new aws.ELB();
var CloudWatch = new aws.CloudWatch({apiVersion: '2010-08-01'});

var ES = require('elasticsearch');
var client = new ES.Client({
  host: 'https://search-sauron-j75hyivu5hfn4sayixpwx6gmru.ap-northeast-1.es.amazonaws.com'
});

var metricList = require('./metricList.js');
var commonParams = {
  StartTime: new Date(new Date().setTime(new Date().getTime() - 5*60*1000 - 100)),
  EndTime: new Date(),
  Period: 60
};

exports.handler = function(event, context) {
  var paramsList = _.map(metricList, function(metricParams) {
    return _.merge(metricParams, commonParams);
  });

  async.series([
    function (callback) {
      async.each(paramsList,
        function(params, callback) {
          CloudWatch.getMetricStatistics(params, function(err, data) {
            if (err)
              console.log(err, err.stack);
            else {
              var actions = makeActions(params, data.Datapoints);
              client.bulk({ body: actions }, function(err, resp) {
                if (err)  console.log(err);
                else      callback(null);
              });
            }
        })},
        function (err) { //when done
          if (err)  console.log(err);
          else      callback(null)
      });
    },
    updateEC2Resources,
    updateRDSResources
  ],
  function(err, results) {
    context.succeed()
  })
};

function makeActions(params, datapoints) {
  return _.reduceRight(datapoints, function(flattend, other) {
    return flattend.concat([
      {
        index: {
          _index: 'metrics',
          _type: params.Namespace.split('/')[1],
        }
      },
      {
        date: other.Timestamp,
        metric: params.MetricName,
        value: other[params.Statistics[0]]
      }
    ]);
  }, []);
};

function constructRDSInstanceARN(instance) {
  return 'arn:aws:rds:ap-northeast-1:841318228822:db:' + instance.DBInstanceIdentifier
}

function upsertResourceQuery(instance, type) {
  var _id

  switch(type) {
    case 'ec2':
      _id = instance.InstanceId
      break
    case 'rds':
      _id = instance.DbiResourceId
      break
  }

  return [
    {
      update: {
        _index: 'resources',
        _type: type,
        _id: _id
      }
    }, {
      doc: instance,
      doc_as_upsert: true
    }
  ]
}

function updateEC2Resources(callback) {
  EC2.describeInstances({}, function(err, data) {
    if (err) {
      console.log('Failed to fetch EC2 Instances')
      return callback(err)
    }
    var instances = _.flatten(_.pluck(data.Reservations, 'Instances'))
    var updates = _.flatten(_.map(instances, function (i) { return upsertResourceQuery(i, 'ec2') }))
    client.bulk({ body: updates }, function(err, resp) {
      if (err) { return callback(err) }
      callback(null)
    })
  })
}

function updateRDSResources(callback) {
  RDS.describeDBInstances({}, function(err, data) {
    if (err) {
      console.log('Failed to fetch RDS Instances')
      return
    }

    async.map(data.DBInstances, function(instance, callback) {
      RDS.listTagsForResource({
        ResourceName: constructRDSInstanceARN(instance)
      }, function(err, data) {
        callback(err, data.TagList)
      })
    }, function(err, tagLists) {
      var instancesWithTags = _.zipWith(data.DBInstances, tagLists, function (instance, tagList) { return _.merge(instance, { Tags: tagList }) })
      var updates = _.flatten(_.map(instancesWithTags, function (i) { return upsertResourceQuery(i, 'rds') }))
      client.bulk({ body: updates }, function(err, resp) {
        if (err) { return callback(err) }
        callback(null)
      })
    })
  })
}

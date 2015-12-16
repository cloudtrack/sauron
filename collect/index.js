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
var paramsList = _.map(metricList, function(metricParams) {
  return _.merge(metricParams, commonParams);
});

exports.handler = function(event, context) {
  async.parallel({
    ec2: fetchEC2Resources,
    rds: fetchRDSResources,
    elb: fetchELBResources
  }, function (err, instances) {
    var instancesWithType = []

    _.each(instances, function(instances, type) {
      _.each(instances, function(instance) {
        instancesWithType.push([instance, type])
      })
    })

    async.each(instancesWithType, function(instanceWithType, callback) {
      indexInstanceMetrics(instanceWithType, callback)
    }, function (err) {
      if (err) console.log(err);
      else context.succeed();
    })
  })
}

function indexInstanceMetrics(instanceWithType, callback) {
  var instanceParamList = filteredParamList(instanceWithType[1])
  var dimensions = dimensionParams(instanceWithType[0], instanceWithType[1])
  async.each(instanceParamList,
    function(params, callback) {
      params = _.merge(params, { Dimensions: dimensions })
      CloudWatch.getMetricStatistics(params,
        function(err, data) {
          if (err) { return callback(err) }
          var actions = makeActions(instanceWithType[0], params, data.Datapoints)
          client.bulk({ body: actions }, function(err, resp) {
            if (err)  console.log(err);
            else      callback(null);
          })
        }
      )
    },
    function(err) {
      callback(err)
    }
  )
}

function dimensionParams(instance, type) {
  var dimensionParams = []
  switch(type) {
    case 'ec2':
      dimensionParams.push({ Name: 'InstanceId', Value: instance.InstanceId })
      break
    case 'rds':
      dimensionParams.push({ Name: 'DBInstanceIdentifier', Value: instance.DBInstanceIdentifier})
      break
    case 'elb':
      dimensionParams.push({ Name: 'LoadBalancerName', Value: instance.LoadBalancerName})
      break
  }

  return dimensionParams
}

function instanceId(instance) {
  return instance.InstanceId || instance.DBInstanceIdentifier || instance.LoadBalancerName
}

function filteredParamList(type) {
  var namespace
  switch(type) {
    case 'ec2':
      namespace = 'AWS/EC2'
      break
    case 'rds':
      namespace = 'AWS/RDS'
      break
    case 'elb':
      namespace = 'AWS/ELB'
      break
  }

  return _.filter(paramsList, { Namespace: namespace })
}

function makeActions(instance, params, datapoints) {
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
        value: other[params.Statistics[0]],
        instanceId: instanceId(instance)
      }
    ]);
  }, []);
};

function constructRDSInstanceARN(instance) {
  return ['arn:aws:rds', process.env.AWS_REGION, '841318228822:db', instance.DBInstanceIdentifier].join(':')
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
    case 'elb':
      _id = instance.LoadBalancerName
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

function fetchEC2Resources(callback) {
  EC2.describeInstances({
    Filters: [
      {
        Name: 'tag-key',
        Values: ['serviceId']
      }
    ]
  }, function(err, data) {
    if (err) {
      console.log('Failed to fetch EC2 Instances')
      return callback(err)
    }
    var instances = _.flatten(_.pluck(data.Reservations, 'Instances'))
    var updates = _.flatten(_.map(instances, function (i) { return upsertResourceQuery(i, 'ec2') }))
    client.bulk({ body: updates }, function(err, resp) {
      if (err) { return callback(err) }
      callback(null, instances)
    })
  })
}

function fetchRDSResources(callback) {
  RDS.describeDBInstances({}, function(err, data) {
    if (err) {
      console.log('Failed to fetch RDS Instances')
      return callback(err)
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
        callback(null, instancesWithTags)
      })
    })
  })
}

function fetchELBResources(callback) {
  ELB.describeLoadBalancers({}, function(err, data) {
    if (err) {
      console.log('Failed to fetch ELB Instances')
      return
    }

    var elbInstances = data.LoadBalancerDescriptions

    ELB.describeTags({
      LoadBalancerNames: _.pluck(elbInstances, 'LoadBalancerName')
    }, function(err, data) {
      var instancesWithTags = _.zipWith(elbInstances, data.TagDescriptions, function (instance, tagDescription) { return _.merge(instance, { Tags: tagDescription.Tags }) })
      var updates = _.flatten(_.map(instancesWithTags, function (i) { return upsertResourceQuery(i, 'elb') }))
      client.bulk({ body: updates }, function(err, resp) {
        if (err) { return callback(err) }
        callback(null, instancesWithTags)
      })
    })
  })
}

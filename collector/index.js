console.log('Loading function');

var async = require('async');
var _ = require('lodash');

// Load configuration produced by configuration process.
var yaml = require('js-yaml');
var fs = require('fs');
var config = loadConfigure();
if (config === null) {
  console.log("Fail to load config.yml file. Please verify that you have config.yml in same directory.");
  return ;
}

// Load aws-sdk module.
var aws = require('aws-sdk');
aws.config.update({region: config.region});
var EC2 = new aws.EC2();
var RDS = new aws.RDS();
var ELB = new aws.ELB();
var CloudWatch = new aws.CloudWatch({apiVersion: '2010-08-01'});
var AWS_ES = new aws.ES({apiVersion: '2015-01-01'});
var Lambda = new aws.Lambda();

// for Elasticsearch Kibana
var ES = require('elasticsearch');
var client;

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
  var services = {};
  for (var service in config.services) {
    switch(config.services[service]) {
      case 'EC2':
        services['ec2'] = fetchEC2Resources;
        break
      case 'RDS':
        services['rds'] = fetchRDSResources;
        break
      case 'ELB':
        services['elb'] = fetchELBResources;
        break
      case 'Lambda':
        services['lambda'] = fetchLambdaResources;
        break
      case 'ElasticSearch':
        services['es'] = fetchESResources;
        break
    }
  }

  if (config.elasticsearch_domain !== "") {
    AWS_ES.describeElasticsearchDomain({
      DomainName: config.elasticsearch_domain
    }, function(err, data) {
      if (err) {
        console.log("Cannot find specific Elasticsearch with DomainName : ", config.elasticsearch_domain);
      }else {
        var status = data.DomainStatus;
        var hostURL = status.Endpoint;
        client = new ES.Client({
          host: hostURL
        });

        async.parallel(services, function (err, instances) {
          var instancesWithType = []

          _.each(instances, function(instances, type) {
            _.each(instances, function(instance) {
              instancesWithType.push([instance, type])
            })
          })

          async.each(instancesWithType, function(instanceWithType, callback) {
            indexInstanceMetrics(instanceWithType, callback)
          }, function (err) {
            if (err) console.log("failed because of ", err);
            else context.succeed();
          })
        })
      }
    });
  }
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
          if (data.Datapoints.length != 0) {
            var actions = makeActions(instanceWithType[0], params, data.Datapoints)
            client.bulk({ body: actions }, function(err, resp) {
              if (err)  console.log(err);
              else      callback(null);
            })
          }
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
    case 'lambda':
      dimensionParams.push({ Name: 'FunctionName', Value: instance.FunctionName})
      break
    case 'es':
      dimensionParams.push({ Name: 'DomainName', Value: instance.DomainName })
      dimensionParams.push({ Name: 'ClientId', Value: config.client_id })
      break
  }

  return dimensionParams
}

function instanceId(instance) {
  return instance.InstanceId || instance.DBInstanceIdentifier || instance.LoadBalancerName || instance.FunctionName
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
    case 'lambda':
      namespace: 'AWS/Lambda'
      break
    case 'es':
      namespace = 'AWS/ES'
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
    case 'lambda':
      _id = instance.FunctionName
      break
    case 'es':
      _id = instance.DomainName
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
      console.log('Failed to fetch EC2 Instances', err)
      return callback(err)
    }

    if (data.Reservations.length !== 0) {
      var instances = _.flatten(_.pluck(data.Reservations, 'Instances'))
      var updates = _.flatten(_.map(instances, function (i) { return upsertResourceQuery(i, 'ec2') }))
      client.bulk({ body: updates }, function(err, resp) {
        if (err) { return callback(err) }
        callback(null, instances)
      })
    }else {
      return callback(err);
    }
  })
}

function fetchRDSResources(callback) {
  RDS.describeDBInstances({}, function(err, data) {
    if (err) {
      console.log('Failed to fetch RDS Instances', err)
      return callback(err)
    }

    if (data.DBInstances.length !== 0) {
      async.map(data.DBInstances, function(instance, callback) {
        RDS.listTagsForResource({
          ResourceName: constructRDSInstanceARN(instance)
        }, function(err, data) {
          if (data !== null)
            callback(err, data.TagList)
          else
            callback(err)
        })
      }, function(err, tagLists) {
        var instancesWithTags = _.zipWith(data.DBInstances, tagLists, function (instance, tagList) { return _.merge(instance, { Tags: tagList }) })
        var updates = _.flatten(_.map(instancesWithTags, function (i) { return upsertResourceQuery(i, 'rds') }))
        client.bulk({ body: updates }, function(err, resp) {
          if (err) { return callback(err) }
          callback(null, instancesWithTags)
        })
      })
    }else {
      return callback(err);
    }
  })
}

function fetchELBResources(callback) {
  ELB.describeLoadBalancers({}, function(err, data) {
    if (err) {
      console.log('Failed to fetch ELB Instances', err)
      return
    }

    var elbInstances = data.LoadBalancerDescriptions
    if (elbInstances.length !== 0) {
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
    }else {
      return callback(err);
    }
  })
}

function fetchLambdaResources(callback) {
  Lambda.listFunctions({}, function(err, data) {
    if (err) {
      console.log('Failed to fetch Lambda Instances', err);
      return;
    }

    if (data.Functions.length !== 0) {
      var functions = data.Functions
      var updates = _.flatten(_.map(functions, function (i) { return upsertResourceQuery(i, 'lambda') }))
      client.bulk({ body: updates }, function(err, resp) {
        if (err) { return callback(err) }
        callback(null, functions)
      })
    }else {
      return callback(err);
    }
  });
}

function fetchESResources(callback) {
  AWS_ES.listDomainNames({}, function(err, data) {
    var names = data.DomainNames;
    AWS_ES.describeElasticsearchDomains({
      DomainNames: _.pluck(names, 'DomainName')
    }, function(err, data) {
      var statusList = data.DomainStatusList;
      var updates = _.flatten(_.map(statusList, function (i) { return upsertResourceQuery(i, 'es')}));
      client.bulk({ body: updates }, function(err, resp) {
        if (err) { return callback(err) }
        callback(null, statusList)
      });
    });
  });
}

function loadConfigure() {
  try {
    var doc = yaml.safeLoad(fs.readFileSync('config.yml'), 'utf-8');
    return doc;
  } catch (e) {
    console.log(e);
    return null;
  }
}

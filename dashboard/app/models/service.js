import ESModel from './es'
import EC2ResourceCollection from './ec2ResourceCollection'
import RDSResourceCollection from './rdsResourceCollection'
import ELBResourceCollection from './elbResourceCollection'
import _ from 'lodash'

class ServiceModel extends ESModel {
  constructor(options) {
    super(options)

    this.bind('save', this.fetchAWSResources)

    this.ec2Instances = new EC2ResourceCollection()
    this.rdsInstances = new RDSResourceCollection()
    this.elbInstances = new ELBResourceCollection()

    this.ec2Instances.bind('reset', function (instances) {
      console.log(instances.map(function(i) { return i.id }))
    })

    this.rdsInstances.bind('reset', function (instances) {
      console.log(instances.map(function(i) { return i.id }))
    })

    this.elbInstances.bind('reset', function (instances) {
      console.log(instances.map(function(i) { return i.id }))
    })
  }

  fetchAWSResources () {
    this.fetchEC2Resources()
    this.fetchRDSResources()
    this.fetchELBResources()
  }

  fetchEC2Resources () {
    this.ec2Instances.fetch({ reset: true, data: { serviceId: this.get('name') } })
  }

  fetchRDSResources () {
    this.rdsInstances.fetch({ reset: true, data: { serviceId: this.get('name') } })
  }

  fetchELBResources () {
    this.elbInstances.fetch({ reset: true, data: { serviceId: this.get('name') } })
  }
}

ServiceModel.indexName = 'services'
ServiceModel.typeName = 'service'

export default ServiceModel

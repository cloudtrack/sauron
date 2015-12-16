import ESModel from './es'
import EC2ResourceCollection from './ec2ResourceCollection'
import RDSResourceCollection from './rdsResourceCollection'
import ELBResourceCollection from './elbResourceCollection'
import _ from 'lodash'

class ServiceModel extends ESModel {
  constructor(options) {
    super(options)

    this.ec2Instances = new EC2ResourceCollection()
    this.rdsInstances = new RDSResourceCollection()
    this.elbInstances = new ELBResourceCollection()
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

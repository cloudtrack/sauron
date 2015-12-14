import ESModel from './es'
import _ from 'lodash'

class ServiceModel extends ESModel {
  constructor(options) {
    super(options)

    this.bind('save', this.fetchAWSResources)
  fetchAWSResources () {
    var that = this
    var ec2 = new AWS.EC2()
    ec2.describeInstances({
      Filters: [
        {
          Name: 'tag:serviceId',
          Values: [this.get('name')]
        }
      ]
    }, function(err, data) {
      if (err) {
        console.log('Failed to fetch EC2 Instances')
        return
      }
    })
  }
}

ServiceModel.indexName = 'services'
ServiceModel.typeName = 'service'

export default ServiceModel

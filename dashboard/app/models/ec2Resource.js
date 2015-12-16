import AWSResourceModel from './awsResource'
import _ from 'lodash'

class EC2ResourceModel extends AWSResourceModel {
  constructor(options) {
    super(options)
  }

  get typeName () {
    return 'ec2'
  }
}

export default EC2ResourceModel

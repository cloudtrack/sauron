import AWSResourceModel from './awsResource'
import _ from 'lodash'

class ELBResourceModel extends AWSResourceModel {
  constructor(options) {
    super(options)
  }

  get typeName () {
    return 'elb'
  }
}

export default ELBResourceModel

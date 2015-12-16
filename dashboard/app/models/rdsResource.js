import AWSResourceModel from './awsResource'
import _ from 'lodash'

class RDSResourceModel extends AWSResourceModel {
  constructor(options) {
    super(options)
  }

  get typeName () {
    return 'rds'
  }
}

export default RDSResourceModel

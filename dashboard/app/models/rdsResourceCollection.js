import AWSResourceCollection from './awsResourceCollection'
import RDSResourceModel from './ec2Resource'

class RDSResourceCollection extends AWSResourceCollection {
  constructor(options) {
    super(options)
    this.model = RDSResourceModel
  }

  get typeName () {
    return 'rds'
  }
}

export default RDSResourceCollection

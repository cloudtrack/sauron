import AWSResourceCollection from './awsResourceCollection'
import EC2ResourceModel from './ec2Resource'

class EC2ResourceCollection extends AWSResourceCollection {
  constructor(options) {
    super(options)
    this.model = EC2ResourceModel
  }

  get typeName () {
    return 'ec2'
  }
}

export default EC2ResourceCollection

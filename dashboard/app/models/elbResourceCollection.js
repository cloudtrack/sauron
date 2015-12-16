import AWSResourceCollection from './awsResourceCollection'
import ELBResourceModel from './ec2Resource'

class ELBResourceCollection extends AWSResourceCollection {
  constructor(options) {
    super(options)
    this.model = ELBResourceModel
  }

  get typeName () {
    return 'elb'
  }
}

export default ELBResourceCollection

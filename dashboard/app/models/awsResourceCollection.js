import { ESCollection } from './es'
import AWSResourceModel from './awsResource'

class AWSResourceCollection extends ESCollection {
  constructor(options) {
    super(options)
    this.model = AWSResourceModel
  }
}

AWSResourceCollection.indexName = AWSResourceModel.indexName
AWSResourceCollection.typeName = AWSResourceModel.typeName

export default AWSResourceCollection

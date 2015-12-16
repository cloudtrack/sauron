import ESModel from './es'
import _ from 'lodash'

class AWSResourceModel extends ESModel {
  constructor(options) {
    super(options)
  }
}

AWSResourceModel.idAttribute = '_id'
AWSResourceModel.indexName = 'resources'

export default AWSResourceModel

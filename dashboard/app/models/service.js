import ESModel from './es'

class ServiceModel extends ESModel {
  constructor(options) {
    super(options)
  }
}

ServiceModel.indexName = 'services'
ServiceModel.typeName = 'service'

export default ServiceModel

import { ESCollection } from './es'
import ServiceModel from './service'

class ServiceCollection extends ESCollection {
  constructor(options) {
    super(options)
    this.model = ServiceModel
  }
}

ServiceCollection.indexName = 'services'
ServiceCollection.typeName = 'service'

export default ServiceCollection

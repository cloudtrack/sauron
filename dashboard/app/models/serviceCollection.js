import { ESCollection } from './es'
import ServiceModel from './service'

class ServiceCollection extends ESCollection {
  constructor(options) {
    super(options)
    this.model = ServiceModel
  }

  parse(resp) {
    return resp.hits.hits
  }
}

ServiceCollection.indexName = 'services'
ServiceCollection.typeName = 'service'

export default ServiceCollection

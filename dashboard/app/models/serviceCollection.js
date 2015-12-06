import { ESCollection } from './es'
import ServiceModel from './service'

export default class ServiceCollection extends ESCollection {
  constructor(options) {
    super(options)
    this.model = ServiceModel
    this.indexName = 'services'
  }

  parse(resp) {
    return resp.hits.hits
  }
}

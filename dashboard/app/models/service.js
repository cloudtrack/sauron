import ESModel from './es'

export default class ServiceModel extends ESModel {
  constructor(options) {
    super(options)
    this.indexName = 'services'
  }
}

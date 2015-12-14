import app from '../app'
import { Model, Collection } from 'backbone'
import ESSync from '../es_sync'
import _ from 'lodash'

class ESModel extends Model {
  constructor(options) {
    super(options)
  }

  get idAttribute () {
    return this.constructor.idAttribute
  }

  get indexName () {
    return this.constructor.indexName
  }

  get typeName () {
    return this.constructor.typeName
  }

  ensureIndex() {
    var that = this
    app.es.indices.exists({ index: this.indexName }).then(
      function(exists) {
        if (exists) {
          console.log(`Index '${that.indexName}' exists`)
        } else {
          console.log(`Index '${that.indexName}' does not exist`)
          that.createIndex()
        }
      }, function(err) {
        console.log(err)
      })
  }

  createIndex() {
    app.es.indices.create({ index: this.indexName }).then(
      function() {
        console.log('Index created successfully')
      }, function() {
        console.log('Failed to create index')
      }
    )
  }

  removeIndex() {
    app.es.indices.delete({ index: this.indexName }).then(
      function() {
        console.log('Index deleted successfully')
      }, function() {
        console.log('Failed to deleted index')
      }
    )
  }

  sync() {
    return ESSync.apply(this, arguments)
  }
}

ESModel.idAttribute = '_id'

class ESCollection extends Collection {
  constructor(options) {
    super(options)
  }

  get indexName () {
    return this.constructor.indexName
  }

  get typeName () {
    return this.constructor.typeName
  }

  sync() {
    return ESSync.apply(this, arguments)
  }

  parse(resp) {
    return _.map(resp.hits.hits, function (doc) {
      return _.merge(doc._source, { _id: doc._id })
    })
  }
}

export default ESModel
export { ESCollection }

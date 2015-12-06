import app from '../app'
import { Model, Collection } from 'backbone'
import ESSync from '../es_sync'

export default class ESModel extends Model {
  constructor(options) {
    super(options)
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

  sync() {
    return ESSync.apply(this, arguments)
  }
}

export class ESCollection extends Collection {
  constructor(options) {
    super(options)
  }

  sync() {
    return ESSync.apply(this, arguments)
  }
}
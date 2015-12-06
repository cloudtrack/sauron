import Backbone from 'backbone'
import app from './app'

module.exports = Backbone.ESSync = function sync(method, model, options) {
  var resp

  switch (method) {
    case 'read':
      var params = { index: model.indexName }
      if (model.id) {
        params._id = model.id
      }
      resp = app.es.search(params)
      break
    case 'create':
      var params = { index: model.indexName }
      params.body = options.attrs || model.toJSON(options)
      resp = app.es.create(params)
      break
    case 'update':
      break
    case 'delete':
      break
  }

  model.trigger('request', model, resp, options)
  return resp
}

import Backbone from 'backbone'
import app from './app'

module.exports = Backbone.ESSync = function sync(method, model, options) {
  var request

  switch (method) {
    case 'read':
      var params = { index: model.indexName, type: model.typeName }
      if (model.id) {
        params._id = model.id
      }
      request = app.es.search(params)
      break
    case 'create':
      var params = { index: model.indexName, type: model.typeName }
      params.body = options.attrs || model.toJSON(options)
      request = app.es.create(params)
      break
    case 'update':
      break
    case 'delete':
      break
  }

  request.done(function(resp) {
    options.success(resp)
  })

  request.fail(function(err) {
    options.error(err)
  })

  model.trigger('request', model, request, options)
  return request
}

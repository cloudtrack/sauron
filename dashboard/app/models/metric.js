import Backbone from 'backbone'
import conv2chartjs from '../data/chartjsDataConverter'
import logQuery from '../data/getLogs'

module.exports = Backbone.Model.extend({
  defaults: {
    data: null,
    metricName: null,
    instanceType: null,
    unit: "%"
  },

  initialize: function(options) {
    this.on('change:duration', this.fetch)
    this.on('change:instanceId', this.fetch)
  },

  fetch: function() {
    var that = this
    var duration = this.get('duration') || '6h'
    logQuery(this.get('instanceType'), this.get('metricName'), duration, this.get('instanceId'), function(result) {
      that.set('data', conv2chartjs(result.label, result.value, duration))
      that.trigger('loaded')
    }, function (err) {
      console.log(err.message)
    })
  }
});

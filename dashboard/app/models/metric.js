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
  },

  fetch: function() {
    var that = this
    var duration = this.get('duration') || '6h'
      that.set('data', conv2chartjs(result.label, result.value))
      that.trigger('loaded')
    }, function (err) {
      console.log(err.message)
    })
  }
});

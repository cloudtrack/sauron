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

  fetch: function() {
    var that = this
    logQuery(this.get('instanceType'), this.get('metricName'), '6h', function(result) {
      that.set('data', conv2chartjs(result.label, result.value))
      that.trigger('loaded')
    }, function (err) {
      console.log(err.message)
    })
  }
});

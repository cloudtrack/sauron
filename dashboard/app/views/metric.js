import { View } from 'backbone'

export default View.extend({
  tagName: 'div',

  initialize: function (options) {
    this.metricName = options.metricName
    this.instanceType = options.instanceType
  },

  template: require('../templates/metric_view.hbs'),

  render: function () {
    this.$el.html(this.template({
      metricName: this.metricName,
      instanceType: this.instanceType
    }))
    return this
  }
})

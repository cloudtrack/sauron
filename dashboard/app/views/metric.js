import { View } from 'backbone'
import MetricModel from '../models/metric'
import Chart from 'chart.js'

export default View.extend({
  tagName: 'div',

  initialize: function (options) {
    this.metricName = options.metricName
    this.instanceType = options.instanceType
    this.model = new MetricModel({ metricName: this.metricName, instanceType: this.instanceType })
    this.model.fetch()
    this.listenTo(this.model, 'loaded', this.drawChart)
  },

  template: require('../templates/metric_view.hbs'),

  render: function () {
    this.$el.html(this.template({
      metricName: this.metricName,
      instanceType: this.instanceType
    }))
    return this
  },

  drawChart: function() {
    var ctx = this.$('.chart-container').get(0).getContext('2d')
    var data = this.model.get('data')
    var myLineChart = new Chart(ctx).Line(data)
  }
})

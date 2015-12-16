import Backbone from 'backbone'
import Chart from 'chart.js'

module.exports = Backbone.View.extend({
  template: require('templates/chart_small_view.hbs'),

  className: 'chartBox',

  render: function() {
    this.$el.html(this.template({
      title: this.model.get('title'),
      id: this.model.get('id')
    }))
    return this
  },

  drawChart: function() {
    var ctx = this.$('.chart-container').get(0).getContext("2d")
    var data = this.model.get('data')
    var myLineChart = new Chart(ctx).Line(data, {
      showTooltips: false
    })
  }
})

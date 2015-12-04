import Backbone from 'backbone'
import Chart from 'chart.js'
import $ from 'jquery'
import "../../vendor/foundation-datepicker"

module.exports = Backbone.View.extend({
  template: require('templates/chart_big_view.hbs'),

  className: 'chartBox',

  render: function() {
    this.$el.html(this.template({ title: this.model.get('title') }))
    return this
  },

  drawChart: function() {
    $('.dpf').fdatepicker({
      format: 'mm-dd-yyyy',
    });
    var ctx = this.$('.chart-container').get(0).getContext("2d")
    var data = this.model.get('data')
    var myLineChart = new Chart(ctx).Line(data)
  }
})

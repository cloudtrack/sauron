import Backbone from 'backbone'
import Chart from 'chart.js'
import $ from 'jquery'

import getLog from '../data/getLogs'
import conv from '../data/chartjsDataConverter'

module.exports = Backbone.View.extend({
  template: require('templates/chart_big_view.hbs'),

  className: 'chartBox',

  events: {
    'click .preset' : 'showPreset'
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html(this.template({ title: this.model.get('title') }))
    return this
  },

  drawChart: function() {
    var ctx = this.$('.chart-container').get(0).getContext("2d")
    var data = this.model.get('data')
    var myLineChart = new Chart(ctx).Line(data)
  },

  resetCanvas: function() {
    this.$('.chart-container').remove()
    $('.chartBox').append("<canvas class='chart-container' width='600' height='600'></canvas>")
  },

  showPreset: function(evt) {
    evt.preventDefault()

    this.resetCanvas();
    var newData;
    var ctx = this.$('.chart-container').get(0).getContext("2d")

    getLog('EC2', 'CPUUtilization', String(evt.target.id), function(data) {
      var newData = conv(data.label, data.value)
      var myLineChart = new Chart(ctx).Line(newData)
    }, function(err) {
      console.log(err)
    });
  }
})

import Backbone from 'backbone'
import Chart from 'chart.js'
import $ from 'jquery'

import getLog from '../data/getLogs'
import conv from '../data/chartjsDataConverter'
require('imports?jQuery=jquery!../../vendor/foundation-datepicker')

module.exports = Backbone.View.extend({
  template: require('templates/chart_big_view.hbs'),

  className: 'chartBox',

  events: {
    'click .range' : 'changeRange',
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html(this.template({ title: this.model.get('title') }))
    return this
  },

  drawChart: function() {
    $('.dpf').fdatepicker({
      format: 'yyyy-mm-dd hh:ii',
      disableDblClickSelection: true,
      pickTime: true
    })
    var ctx = this.$('.chart-container').get(0).getContext("2d")
    var data = this.model.get('data')
    var myLineChart = new Chart(ctx).Line(data)
  },

  getNewCtx: function() {
    this.$('.chart-container').remove()
    $('.chartBox').append("<canvas class='chart-container' width='600' height='600'></canvas>")
    return this.$('.chart-container').get(0).getContext("2d")
  },

  changeRange: function(evt) {
    evt.preventDefault()

    var newData
    var ctx = this.getNewCtx()

    getLog('EC2', 'CPUUtilization', String(evt.target.id), function(data) {
      var newData = conv(data.label, data.value)
      var myLineChart = new Chart(ctx).Line(newData)
    }, function(err) {
      console.log(err)
    },
    new Date($('#dp-from').val()),
    new Date($('#dp-to').val())
    );
  }
})

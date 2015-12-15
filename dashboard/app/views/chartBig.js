import Backbone from 'backbone'
import Chart from 'chart.js'
import getLog from '../data/getLogs'
import conv from '../data/chartjsDataConverter'

module.exports = Backbone.View.extend({
  template: require('templates/chart_big_view.hbs'),

  className: 'chartBox',

  events: {
    'click .preset' : 'showPreset'
  },

  initialize: function() {
    _.bindAll(this, 'showPreset')
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

  showPreset: function(evt) {
    evt.preventDefault()
    var callback = function(data) {
      console.log(this)
    }
    _.bindAll(this, callback)

    getLog('EC2', 'CPUUtilization', String(evt.target.id), function(data) {
      callback(data);
      // console.log(this)
      // this.model.set({ data: conv(data.label, data.value) })
      // this.render().drawChart();
    }, function(err) {
      console.log(err)
    });
  }
})

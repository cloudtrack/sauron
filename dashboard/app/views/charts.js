import { View } from 'backbone'
import Chart from 'chart.js'
import Metric from '../models/metric'

export default class RootView extends View {
  constructor(options) {
    super(options)
    this.template = require('templates/charts_view.hbs')
  }

  render() {
    this.$el.html(this.template())
    return this
  }

  drawChart() {
  	var ctx = this.$('#chart-container').get(0).getContext("2d")
  	console.log("ctx found")
  	var data = (new Metric()).get('data')
  	console.log(data)
  	var myLineChart = new Chart(ctx).Line(data)
  }
}

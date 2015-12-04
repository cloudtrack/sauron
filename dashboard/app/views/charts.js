import { View } from 'backbone'
import Chart from 'chart.js'
import Metric from '../models/metric'
import Metrics from '../models/metricCollection'

import chartSmallView from './chartSmall'

export default class RootView extends View {
  constructor(options) {
    super(options)
    this.template = require('templates/charts_view.hbs')
    this.views = [];
    this.charts = new Metrics();
    for (var i = 0; i < 4; i++) {
    	this.charts.push(new Metric({ id: i }))
    }
  }

  render() {
    this.$el.html(this.template())
    this.charts.each(function(metric) {
    	var view = new chartSmallView({ model: metric });
    	this.views.push(view);
    	this.$('#chart-grid').append(view.render().el);
    }, this);

    return this;
  }

  drawChart() {
  	this.views.forEach(function(view) {
  		view.drawChart();
  	})
  }
}

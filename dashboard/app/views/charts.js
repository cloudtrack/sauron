import { View } from 'backbone'
import Chart from 'chart.js'

import app from '../app'
import chartSmallView from './chartSmall'

export default class RootView extends View {
  constructor(options) {
    super(options)
    this.template = require('templates/charts_view.hbs')
    this.views = [];
  }

  render() {
    this.$el.html(this.template())
    app.metrics.each(function(metric) {
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

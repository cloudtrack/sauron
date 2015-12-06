'use strict';

import { Router, history } from 'backbone'
import app from '../app'
import RootView from '../views/root'
import ConfigView from '../views/config'
import ChartsView from '../views/charts'
import SingleChartView from '../views/chartBig'

export default class AppRouter extends Router {
  constructor(options) {
    super(options)
    this.routes = {
      "charts": "charts",
      "chart/:id": "singleChart",
      "config": "setting",
      '': 'root'
    }
    this._bindRoutes()
  }

  setView(view) {
    app.currentView = view
    app.mainContainer.html(view.$el);
  }

  root() {
    this.setView(new RootView().render())
  }

  setting() {
    this.setView(new ConfigView().render())
  }

  charts() {
    var chartView = new ChartsView();
    this.setView(chartView.render());
    chartView.drawChart();
  }

  singleChart(id) {
    var chartView = new SingleChartView({ model: app.metrics.get(id) });
    this.setView(chartView.render());
    chartView.drawChart();
  }
}

'use strict';

import { Router, history } from 'backbone'
import app from '../app'
import RootView from '../views/root'
import ConfigView from '../views/config'
import ChartsView from '../views/charts'

export default class AppRouter extends Router {
  constructor(options) {
    super(options)
    this.routes = {
      "charts": "charts",
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
    this.setView(new ChartsView().render())
  }
}

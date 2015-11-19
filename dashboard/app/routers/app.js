'use strict';

import { Router, history } from 'backbone'
import app from '../app'
import RootView from '../views/root'
import ConfigView from '../views/config'

export default class AppRouter extends Router {
  constructor(options) {
    super(options)
    this.routes = {
      "config": "setting",
      '': 'root'
    }
    this._bindRoutes()
  }

  setView(view) {
    app.currentView = view
    app.mainContainer.append(view.$el)
  }

  root() {
    this.setView(new RootView().render())
  }

  setting() {
    console.log("setting fired")
    this.setView(new ConfigView().render())
  }
}

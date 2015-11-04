'use strict';

import { Router } from 'backbone'
import app from '../app'
import RootView from '../views/root'

export default class AppRouter extends Router {
  constructor(options) {
    super(options)
    this.routes = {
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
}

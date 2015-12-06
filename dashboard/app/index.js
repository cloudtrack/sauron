'use strict';

require('index.jade')
require('styles/index.scss')

import app from './app'
import $ from 'jquery'
import Backbone from 'backbone'
import _ from 'lodash'

import AppView from './views/app'
import AppRouter from './routers/app'

import Metric from './models/metric'
import Metrics from './models/metricCollection'
import ServiceModel from './models/service'

$(() => {
  // Global event bus.
  app.globalEvents = _.extend({}, Backbone.Events)
  // Application level view
  app.appView = new AppView({ el: $('body') })
  // Backbone router
  new AppRouter()

  // Initial data
  app.metrics = new Metrics();
  for (var i = 0; i < 4; i++) {
  	app.metrics.push(new Metric({ id: i, title: i + "th chart" }))
  }

  (new ServiceModel).ensureIndex()

  Backbone.history.start()
})

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

require('imports?jQuery=jquery!foundation-sites/js/foundation')
import conv2chartjs from './data/chartjsDataConverter'
import logQuery from './data/getLogs'

$(() => {
  // Ensure ES indices exist
  //(new ServiceModel).removeIndex()
  (new ServiceModel).ensureIndex()

  // Global event bus.
  app.globalEvents = _.extend({}, Backbone.Events)
  // Application level view
  app.appView = new AppView({ el: $('body') })
  // Backbone router
  new AppRouter()

  //querying initial data
  logQuery('EC2', 'CPUUtilization', '30m', function(result) {
    var chartData = conv2chartjs(result.label, result.value)
    app.metrics = new Metrics();
    for (var i = 0; i < 4; i++) {
      app.metrics.push(new Metric({ id: i, title: i + "th chart", data: chartData }))
    }
  }, function (err) {
    console.log(err.message)
  })

  Backbone.history.start()

  $(document).foundation()
})

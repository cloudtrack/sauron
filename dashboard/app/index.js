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
  var last15min;
  app.es.search({
    index: 'metrics',
    type: 'EC2',
    body: {
      size: 15,
      from: 0,
      sort: {
        "date": "desc"
      },
      query: {
        match: {
          metric: 'CPUUtilization'
        }
      }
    }
  }).then(function (resp, last15min) {
    console.log(resp)
    last15min = conv2chartjs(resp)
    app.metrics = new Metrics();
    for (var i = 0; i < 4; i++) {
      app.metrics.push(new Metric({ id: i, title: i + "th chart", data: last15min }))
    }
  }, function (err) {
    console.trace(err.message)
  })

  Backbone.history.start()

  $(document).foundation()
})

'use strict';

require('styles/index.scss')

var $ = require('jquery')
var Backbone = require('backbone')
var _ = require('lodash')

$(function() {
  Backbone.history.start({ pushState: true })
})

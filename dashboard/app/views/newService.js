import { View } from 'backbone'
import app from '../app'
import $ from 'jquery'
import _ from 'lodash'
import ServiceModel from '../models/service'

module.exports = View.extend({
  template: require('templates/new_service_view.hbs'),
  className: 'modal reveal-modal',
  events: {
    'click .submit': 'create',
    'click .close': 'close'
  },

  render: function () {
    this.$el.html(this.template())
    return this
  },

  open: function () {
    $('body').append(this.$el)
    this.$el.foundation('reveal', 'open')

    var that = this
    this.$background = $('.reveal-modal-bg')
    this.$background.one('click', function(){
      that.close()
    })
  },

  close: function (e) {
    if (e) {
      e.preventDefault()
    }
    this.$el.foundation('reveal', 'close')
    this.trigger('cancel')
    this.$background.hide()
    this.remove()
  },

  create: function (e) {
    e.preventDefault()
    var that = this
    var service = new ServiceModel()
    var data = {}
    $.each(this.$('form').serializeArray(), function(_, kv) {
      data[kv.name] = kv.value
    })
    service.save(data, {
      success: function () {
        that.trigger('created')
        that.close()
      },
      error: function () {
        that.close()
      }
    })
  }
})

import { View } from 'backbone'
import app from '../app'

export default View.extend({
  tagName: 'span',

  initialize: function (options) {
    this.type = options.type
    this.model = options.resource
  },

  template: require('../templates/resource_view.hbs'),

  events: {
    'click': 'showResource'
  },

  render: function () {
    this.$el.html(this.template({
      resource: this.model.toJSON()
    }))
    return this
  },

  showResource: function() {
    app.globalEvents.trigger(this.type + ':showResource', this.model)
  }
})

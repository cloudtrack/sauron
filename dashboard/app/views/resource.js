import { View } from 'backbone'

export default View.extend({
  initialize: function (options) {
    this.resource = options.resource
  },

  template: require('../templates/resource_view.hbs'),

  render: function () {
    this.$el.html(this.template({
      resource: this.resource.toJSON()
    }))
    return this
  }
})

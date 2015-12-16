import { View } from 'backbone'
import _ from 'lodash'
import ResourceView from './resource'

export default View.extend({
  initialize: function (options) {
    this.resources = options.resources
    this.listenTo(this.resources, 'reset', this.addAll)
  },

  addAll: function (resources) {
    var that = this
    this.resourceViews = resources.map(function(resource) {
      var resourceView = new ResourceView({ resource: resource })
      that.$el.append(resourceView.render().$el)
    })
  }
})

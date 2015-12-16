import { View } from 'backbone'
import app from '../app'

export default class RootView extends View {
  constructor(options) {
    super(options)
    this.template = require('templates/root_view.hbs')
    this.listenTo(app.globalEvents, 'setService', this.setService)
  }

  render() {
    this.$el.html(this.template({
      service: this.service && this.service.toJSON()
    }))
    return this
  }

  setService (service) {
    this.service = service
    this.render()
  }
}

import { View } from 'backbone'

export default class RootView extends View {
  constructor(options) {
    super(options)
    this.template = require('templates/config_view.hbs')
  }

  render() {
    this.$el.html(this.template())
    return this
  }
}

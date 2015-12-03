import { View } from 'backbone'

export default class RootView extends View {
  constructor(options) {
    super(options)
    this.template = require('templates/charts_view.hbs')
  }

  render() {
    this.$el.html(this.template())
    return this
  }
}

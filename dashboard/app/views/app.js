'use strict';

import { View } from 'backbone'
import app from '../app'
import ServiceModel from '../models/service'
import ServiceCollection from '../models/serviceCollection'

export default class AppView extends View {
  constructor(options) {
    super(options)
    app.mainContainer = this.$('#main-container')
    var services = new ServiceCollection
    services.fetch()
  }
}

'use strict';

import { View } from 'backbone'
import app from '../app'

export default class AppView extends View {
  constructor(options) {
    super(options)
    app.mainContainer = this.$('#main-container')
  }
}

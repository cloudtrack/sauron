'use strict';

import { Router } from 'backbone'

export default class AppRouter extends Router {
  constructor(options) {
    super(options)
    this.routes = {
      '': 'root'
    }
  }

  root() {
  }
}

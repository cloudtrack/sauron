import { View } from 'backbone'
import _ from 'lodash'
import MetricView from './metric'

export default View.extend({
  initialize: function (options) {
    var that = this
    this.type = options.type
    this.metricViews = _.map(this.metricNames(), function(metricName) {
      var metricView = new MetricView({ metricName: metricName, instanceType: that.type })
      that.$el.append(metricView.render().$el)
      return metricView
    })
  },

  metricNames: function () {
    switch (this.type) {
      case 'ELB':
        return ['HealthyHostCount', 'UnHealthyHostCount', 'RequestCount', 'Latency']
      case 'EC2':
        return ['CPUUtilization', 'DiskReadBytes', 'DiskReadOps', 'DiskWriteBytes', 'DiskWriteOps', 'NetworkIn', 'NetworkOut']
      case 'RDS':
        return ['CPUUtilization', 'FreeableMemory', 'ReadThroughput', 'WriteThroughput', 'SwapUsage']
    }
  }
})

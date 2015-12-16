import { View } from 'backbone'
import app from '../app'
import ResourcesView from './resources'
import MetricsView from './metrics'

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

    if (this.service) {
      this.elbResourcesView && this.elbResourcesView.remove()
      this.ec2ResourcesView && this.ec2ResourcesView.remove()
      this.rdsResourcesView && this.rdsResourcesView.remove()
      this.elbMetricsView && this.elbMetricssView.remove()
      this.ec2MetricsView && this.ec2MetricsView.remove()
      this.rdsMetricsView && this.rdsMetricsView.remove()

      this.elbResourcesView = new ResourcesView({ resources: this.service.elbInstances, el: this.$('.elb-instances') })
      this.ec2ResourcesView = new ResourcesView({ resources: this.service.ec2Instances, el: this.$('.ec2-instances') })
      this.rdsResourcesView = new ResourcesView({ resources: this.service.rdsInstances, el: this.$('.rds-instances') })
      this.elbMetricsView = new MetricsView({ type: 'ELB', el: this.$('.elb-metrics') })
      this.ec2MetricsView = new MetricsView({ type: 'EC2', el: this.$('.ec2-metrics') })
      this.rdsMetricsView = new MetricsView({ type: 'RDS', el: this.$('.rds-metrics') })
    }
    return this
  }

  setService (service) {
    this.service = service
    this.render()
  }
}

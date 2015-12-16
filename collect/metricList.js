module.exports = [
{
  Namespace: 'AWS/ELB',
  MetricName: 'HealthyHostCount',
  Statistics: ['Average'],
  Unit: 'Count'
},
{
  Namespace: 'AWS/ELB',
  MetricName: 'UnHealthyHostCount',
  Statistics: ['Average'],
  Unit: 'Count'
},
{
  Namespace: 'AWS/ELB',
  MetricName: 'RequestCount', // this metric has problem
  Statistics: ['Sum'],
  Unit: 'Count'
},
{
  Namespace: 'AWS/ELB',
  MetricName: 'Latency:', // this metric has problem
  Statistics: ['Average'],
  Unit: 'Seconds'
},
{
  Namespace: 'AWS/RDS',
  MetricName: 'CPUUtilization',
  Statistics: ['Average'],
  Unit: 'Percent'
},
{
  Namespace: 'AWS/RDS',
  MetricName: 'FreeableMemory',
  Statistics: ['Average'],
  Unit: 'Bytes'
},
{
  Namespace: 'AWS/RDS',
  MetricName: 'ReadThroughput',
  Statistics: ['Average'],
  Unit: 'Bytes/Second'
},
{
  Namespace: 'AWS/RDS',
  MetricName: 'WriteThroughput',
  Statistics: ['Average'],
  Unit: 'Bytes/Second'
},
{
  Namespace: 'AWS/RDS',
  MetricName: 'SwapUsage',
  Statistics: ['Average'],
  Unit: 'Bytes'
},
{
  Namespace: 'AWS/EC2',
  MetricName: 'CPUUtilization',
  Statistics: ['Average'],
  Unit: 'Percent'
},
{
  Namespace: 'AWS/EC2',
  MetricName: 'DiskReadBytes',
  Statistics: ['Average'],
  Unit: 'Bytes'
},
{
  Namespace: 'AWS/EC2',
  MetricName: 'DiskReadOps',
  Statistics: ['Average'],
  Unit: 'Count'
},
{
  Namespace: 'AWS/EC2',
  MetricName: 'DiskWriteBytes',
  Statistics: ['Average'],
  Unit: 'Bytes'
},
{
  Namespace: 'AWS/EC2',
  MetricName: 'DiskWriteOps',
  Statistics: ['Average'],
  Unit: 'Count'
},
{
  Namespace: 'AWS/EC2',
  MetricName: 'NetworkIn',
  Statistics: ['Average'],
  Unit: 'Bytes'
},
{
  Namespace: 'AWS/EC2',
  MetricName: 'NetworkOut',
  Statistics: ['Average'],
  Unit: 'Bytes'
}
];

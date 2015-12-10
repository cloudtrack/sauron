module.exports = [
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

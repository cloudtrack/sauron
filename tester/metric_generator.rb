require 'json'
require 'thor'
require 'factory_girl'
require 'elasticsearch'
require 'active_support/all'
require 'thread'

FactoryGirl.define do
  factory :service, class: Hash do
    sequence(:name) { |n| "service#{n}" }
    sequence(:description) { |n| "Description#{n}" }

    initialize_with { attributes }
  end

  factory :elb, class: Hash do
    sequence(:LoadBalancerName) { |n| "lb-#{n}" }
    Tags {}

    initialize_with { attributes }
  end

  factory :ec2, class: Hash do
    sequence(:InstanceId) { |n| "i-#{n}" }
    Tags {}

    initialize_with { attributes }
  end

  factory :rds, class: Hash do
    sequence(:DBInstanceIdentifier) { |n| "my-rds-#{n}" }
    sequence(:DbiResourceId) { |n| "db-#{n}" }
    Tags {}

    initialize_with { attributes }
  end

  factory :metric, class: Hash do
    date { DateTime.now.utc.to_json }
    metric 'Metric'
    value { rand }

    initialize_with { attributes }
  end
end

class MetricGenerator < Thor
  desc 'generate SERVICE_NAME --options', 'Generate example metrics for testing dashboard performance'
  option :duration, type: :numeric
  option :num_elb, type: :numeric
  option :num_ec2, type: :numeric
  option :num_rds, type: :numeric
  option :from, type: :numeric
  option :elasticsearch_url, type: :string
  def generate(serviceName)
    client = Elasticsearch::Client.new(url: options[:elasticsearch_url] || 'http://search-sauron-xjk7ro2fmqho5oiwdktffm4cca.ap-northeast-1.es.amazonaws.com')

    service = FactoryGirl.build(:service, name: serviceName)

    # Index service
    client.index(index: 'services', type: 'service', body: service)

    # Index ELB Resources
    elbs = FactoryGirl.build_list(:elb, (options.num_elb || 3), Tags: [{ Key: 'serviceId', Value: service[:name] }, { Key: 'function', Value: 'lb' }])
    elbBulkBody = elbs.map { |elb| [{ index: { _index: 'resources', _type: 'elb' } }, elb] }.flatten
    client.bulk(body: elbBulkBody)

    # Index EC2 Resources
    ec2s = FactoryGirl.build_list(:ec2, (options.num_ec2 || 5), Tags: [{ Key: 'serviceId', Value: service[:name] }, { Key: 'function', Value: 'was' }])
    ec2BulkBody = ec2s.map { |ec2| [{ index: { _index: 'resources', _type: 'ec2' } }, ec2] }.flatten
    client.bulk(body: ec2BulkBody)

    # Index RDS Resources
    rdss = FactoryGirl.build_list(:rds, (options.num_rds || 3), Tags: [{ Key: 'serviceId', Value: service[:name] }, { Key: 'function', Value: 'lb' }])
    rdsBulkBody = rdss.map { |rds| [{ index: { _index: 'resources', _type: 'rds' } }, rds] }.flatten
    client.bulk(body: rdsBulkBody)

    # Generate Metrics
    elb_metrics = ['HealthyHostCount', 'UnHealthyHostCount', 'RequestCount', 'Latency']
    ec2_metrics = ['CPUUtilization', 'DiskReadBytes', 'DiskReadOps', 'DiskWriteBytes', 'DiskWriteOps', 'NetworkIn', 'NetworkOut']
    rds_metrics = ['CPUUtilization', 'FreeableMemory', 'ReadThroughput', 'WriteThroughput', 'SwapUsage']

    from = options[:from] || (Time.now - 1.hour).to_i
    to = Time.now.to_i

    threads = []
    threads << Thread.new {
      puts 'Genererating ELB Metrics'
      elbs.each do |elb|
        elb_metrics.each do |metric|
          (from..to).step(1.day) do |timestamp|
            metrics = (timestamp..(timestamp + 1.day - 1)).step(1.minute).to_a.map do |timestamp|
              date = Time.at(timestamp).to_datetime.utc.to_s
              FactoryGirl.build(:metric, date: date, instanceId: elb[:LoadBalancerName], metric: metric)
            end

            bulkBody = metrics.map { |metric| [{ index: { _index: 'metrics', _type: 'ELB' } }, metric] }.flatten
            client.bulk(body: bulkBody)
          end
        end
      end
      Thread::exit()
    }

    threads << Thread.new {
      puts 'Genererating EC2 Metrics'
      ec2s.each do |ec2|
        ec2_metrics.each do |metric|
          (from..to).step(1.day) do |timestamp|
            metrics = (timestamp..(timestamp + 1.day - 1)).step(1.minute).to_a.map do |timestamp|
              date = Time.at(timestamp).to_datetime.utc.to_s
              FactoryGirl.build(:metric, date: date, instanceId: ec2[:InstanceId], metric: metric)
            end

            bulkBody = metrics.map { |metric| [{ index: { _index: 'metrics', _type: 'EC2' } }, metric] }.flatten
            client.bulk(body: bulkBody)
          end
        end
      end
      Thread::exit()
    }

    threads << Thread.new {
      puts 'Genererating RDS Metrics'
      rdss.each do |rds|
        rds_metrics.each do |metric|
          (from..to).step(1.day) do |timestamp|
            metrics = (timestamp..(timestamp + 1.day - 1)).step(1.minute).to_a.map do |timestamp|
              date = Time.at(timestamp).to_datetime.utc.to_s
              FactoryGirl.build(:metric, date: date, instanceId: rds[:DbiResourceId], metric: metric)
            end

            bulkBody = metrics.map { |metric| [{ index: { _index: 'metrics', _type: 'RDS' } }, metric] }.flatten
            client.bulk(body: bulkBody)
          end
        end
      end
      Thread::exit()
    }

    threads.each(&:join)
  end
end

MetricGenerator.start(ARGV)

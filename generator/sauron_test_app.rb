require 'json'
require 'thor'
require 'factory_girl'
require 'elasticsearch'
require 'active_support/all'
require 'thread'
require 'aws-sdk'
require 'net/ssh'
require 'net/http'
require 'pry'

AMI_ID = "ami-16a34d77"

class SauronTester < Thor
  desc 'generate --options', 'Generate example metrics for testing dashboard performance'
  option :elasticsearch_url, type: :string

  def generate
    apply_config

    puts "create instances"
    reservation = ec2.run_instances(ec2_options)

    puts "waiting instances to wake up"
    while true
      puts "waiting..."
      all_running = ec2_instances(reservation.reservation_id).inject(true) do |bool, instance|
        bool &&= instance_is_running?(instance)
      end

      break if all_running

      sleep(10)
    end
    puts "all instance is now running"

    puts "wait instance run ssh daemon"
    sleep(60)

    puts "deploy sauron test"
    `cd sauron_test; AWS_ACCESS_KEY_ID=#{ENV["AWS_ACCESS_KEY_ID"]} AWS_SECRET_ACCESS_KEY=#{ENV["AWS_SECRET_ACCESS_KEY"]} cap production deploy`

    puts "append elb"
    elb.register_instances_with_load_balancer({
      load_balancer_name: "sauron-test",
      instances: ec2_instances(reservation.reservation_id).map{|x| {instance_id: x.instance_id}}
    })

    puts "script end"
  end

  desc 'deploy --options', 'deploy'
  def deploy
    apply_config

    `cd sauron_test; AWS_ACCESS_KEY_ID=#{ENV["AWS_ACCESS_KEY_ID"]} AWS_SECRET_ACCESS_KEY=#{ENV["AWS_SECRET_ACCESS_KEY"]} cap production deploy`

    elb.register_instances_with_load_balancer({
      load_balancer_name: "sauron-test",
      instances: current_ec2_instances.map{|x| {instance_id: x.instance_id}}
    })

    puts "script end"
  end

  desc 'shut_down --options', 'Shut down instances'
  def shut_down
    apply_config
    puts "start shut down"
    instance_ids = current_ec2_instances.map(&:instance_id)
    ec2.terminate_instances({
      dry_run: false,
      instance_ids: instance_ids
    })
    puts "shut down end"
  end

  private

  def apply_config
    Aws.config.update({
      region: 'ap-northeast-1',
      credentials: Aws::Credentials.new(ENV["AWS_ACCESS_KEY_ID"], ENV["AWS_SECRET_ACCESS_KEY"])
    })
  end

  def ec2
    @ec2 ||= Aws::EC2::Client.new
  end

  def elb
    @elb ||= Aws::ElasticLoadBalancing::Client.new
  end

  def instance_is_running?(instance)
    instance.state.code == 16
  end

  def ec2_instances(reservation_id)
    ec2.describe_instances.reservations.select do |r|
      r.reservation_id == reservation_id
    end.first.instances
  end

  def current_ec2_instances
    instances = []
    ec2.describe_instances.reservations.each do |r|
      instances += r.instances.select{|x| instance_is_running? x}
    end
    instances
  end

  def ec2_options
    {
      dry_run: false,
      key_name: "sauron_tokyo",
      security_groups: ["default"],
      image_id: AMI_ID, # required
      min_count: 1, # required
      max_count: 1, # required
      instance_type: "t2.micro",
      monitoring: {
        enabled: true, # required
      },
    }
  end

  def bulk_request
    threads = []
    instances.each do |instance|
      threads << Thread.new do
        open("http://sauron-test-1904209314.ap-northeast-1.elb.amazonaws.com")
        Thread::exit()
      end
    end

    threads.each(&:join)
  end


end

SauronTester.start(ARGV)

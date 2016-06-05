require 'json'
require 'thor'
require 'factory_girl'
require 'elasticsearch'
require 'active_support/all'
require 'thread'
require 'aws-sdk'
require 'net/ssh'
require 'pry'

AMI_ID = "ami-a21529cc"
JOB_TYPE_CPU = "JOB_TYPE_CPU"
JOB_TYPE_DISK = "JOB_TYPE_DISK"
JOB_TYPE_NETWORK = "JOB_TYPE_NETWORK"

class SauronTester < Thor
  desc 'generate --options', 'Generate example metrics for testing dashboard performance'
  option :elasticsearch_url, type: :string
  option :aws_access_key_id, type: :string
  option :aws_secret_access_key, type: :string

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

    puts "generate cpu metrics"
    ssh_job(ec2_instances(reservation.reservation_id), JOB_TYPE_CPU)

    puts "generate disk metrics"
    ssh_job(ec2_instances(reservation.reservation_id), JOB_TYPE_DISK)

    puts "generate network metrics"
    ssh_job(ec2_instances(reservation.reservation_id), JOB_TYPE_NETWORK)

    # puts "generating end. shutting down"
    # shut_down
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
      region: 'ap-northeast-2',
      credentials: Aws::Credentials.new(ENV["AWS_ACCESS_KEY_ID"], ENV["AWS_SECRET_ACCESS_KEY"])
    })
  end

  def ec2
    @ec2 ||= Aws::EC2::Client.new
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
      key_name: "sauron",
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

  def ssh_job(instances, job_type)
    threads = []
    instances.each do |instance|
      threads << Thread.new do
        puts "run #{job_type} in #{instance.instance_id}"
        Net::SSH.start(instance.public_dns_name, "ubuntu", :keys => "/Users/yujun/.ssh/sauron.pem" ) do |ssh|
          if job_type == JOB_TYPE_CPU
            ssh.exec!("source ~/.bash_profile ; ruby cpu.rb")
          elsif job_type == JOB_TYPE_DISK
            ssh.exec!("source ~/.bash_profile ; ruby disk.rb")
          elsif job_type == JOB_TYPE_NETWORK
            ssh.exec!("source ~/.bash_profile ; ruby network.rb")
          end
        end
        Thread::exit()
      end
    end

    threads.each(&:join)
  end
end

SauronTester.start(ARGV)

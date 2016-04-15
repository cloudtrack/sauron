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
    puts "script end"
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
  end
end

SauronTester.start(ARGV)

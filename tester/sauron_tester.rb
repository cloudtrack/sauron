require 'thor'
require 'yaml'
require 'aws-sdk'
require 'active_support/all'

require 'thread'
require 'net/ssh'
require 'net/http'
require 'pry'

AMI_ID = "ami-16a34d77"
TEST_RDS_IDENTIFIER = "sauron-test"
TEST_ELB_NAME = "sauron-test"

class SauronTester < Thor
  desc 'run_test --options', 'run tester'
  def run_test
    apply_config

    create_ec2_instances

    create_rds_instances

    wait_ec2_rds_instances

    deploy_sauron_test_rails_app

    attach_ec2_instances_to_elb

    simulate_app_situation

  end

  desc 'pry --options', 'run tester'
  def pry
    apply_config
    binding.pry
  end

  desc 'deploy --options', 'deploy'
  def deploy
    apply_config

    @ec2_instances = current_ec2_instances

    deploy_sauron_test_rails_app

    attach_ec2_instances_to_elb
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
  def config
    @config ||= (
      c = YAML::load(File.open('../config.yml'))
      required_keys = [
        "client_id",
        "access_key_id",
        "secret_access_key",
        "region",
        "services",
        "elasticsearch_domain"
      ]

      required_keys.each do |key|
        raise Thor::Error.new("Error: #{key} should exist in config.yml") unless c.key?(key)
      end

      c
    )
  end

  def create_ec2_instances
    puts "start create_ec2_instances"
    reservation = ec2.run_instances(ec2_options)
    @ec2_instances = ec2_instances(reservation.reservation_id)
    puts "end create_ec2_instances"
  end

  def create_rds_instances
    puts "start create_rds_instances"

    begin
      rds.describe_db_instances({
        db_instance_identifier: TEST_RDS_IDENTIFIER
      })

      puts "RDB Identifier : #{TEST_RDS_IDENTIFIER} already exist."
      puts "Use #{TEST_RDS_IDENTIFIER}"
    rescue Aws::RDS::Errors::DBInstanceNotFound => _
      rds.create_db_instance({
        db_name: "sauron_test_app_prod",
        db_instance_identifier: TEST_RDS_IDENTIFIER,
        allocated_storage: 1,
        db_instance_class: "db.t2.micro",
        engine: "MySQL",
        master_username: "root",
        master_user_password: "saurontest",
        multi_az: false,
      })
    end

    puts "end create_rds_instances"
  end

  def wait_ec2_rds_instances
    puts "start wait_ec2_rds_instances"

    while true
      puts "waiting..."
      all_running = @ec2_instances.inject(true) do |bool, instance|
        bool &&= instance_is_running?(instance)
      end

      break if all_running

      sleep(10)
    end
    puts "all instance is now running"

    puts "wait instance run ssh daemon"
    sleep(30)

    puts "end wait_ec2_rds_instances"
  end

  def deploy_sauron_test_rails_app
    puts "start deploy_sauron_test_rails_app"

    puts "start make environment file"
    db = rds.describe_db_instances({
      db_instance_identifier: TEST_RDS_IDENTIFIER
    }).db_instances.first

    test_app_env = {
      "DATABASE_HOST" => db.endpoint.address,
      "SERVERS" => @ec2_instances.map{|x| x.public_dns_name}
    }

    f = File.new("sauron_test/env.yml", "w")
    f.write(test_app_env.to_yaml)
    f.close
    puts "end make environment file"

    `cd sauron_test; AWS_ACCESS_KEY_ID=#{ENV["AWS_ACCESS_KEY_ID"]} AWS_SECRET_ACCESS_KEY=#{ENV["AWS_SECRET_ACCESS_KEY"]} cap production deploy`

    puts "end deploy_sauron_test_rails_app"
  end

  def attach_ec2_instances_to_elb
    puts "start attach_ec2_instances_to_elb"

    elb.register_instances_with_load_balancer({
      load_balancer_name: "sauron-test",
      instances: @ec2_instances.map{|x| {instance_id: x.instance_id}}
    })

    puts "end attach_ec2_instances_to_elb"
  end

  def simulate_app_situation
    puts "start simulate_app_situation"
    puts "end simulate_app_situation"
  end


  def apply_config
    Aws.config.update({
      region: config["region"],
      credentials: Aws::Credentials.new(config["access_key_id"], config["secret_access_key"])
    })
  end

  def ec2
    @ec2 ||= Aws::EC2::Client.new
  end

  def rds
    @rds ||= Aws::RDS::Client.new
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

  default_task :run_test
end

SauronTester.start(ARGV)

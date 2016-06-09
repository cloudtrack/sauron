require 'thor'
require 'yaml'
require 'aws-sdk'
require 'active_support/all'

require 'thread'
require 'net/ssh'
require 'net/http'
require 'pry'

AMI_ID = "ami-b45ab3d5"
RDS_IDENTIFIER = "sauron-test"
ELB_NAME = "sauron-test"
SECURITY_GROUP_NAME = "sauron-test"

class SauronTester < Thor
  desc 'run_test --options', 'run tester'
  def run_test
    log 0, "start test script"

    apply_config

    create_security_group

    create_elb_instances

    create_ec2_instances

    create_rds_instances

    wait_ec2_rds_instances

    deploy_sauron_test_rails_app

    attach_ec2_instances_to_elb

    wait_elb_attaching

    simulate_app_situation

    log 0, "end test script"
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
    log 1, "start shut down"

    apply_config

    ec2.delete_security_group({
      dry_run: false,
      group_name: SECURITY_GROUP_NAME
    }) rescue nil

    instance_ids = current_ec2_instances.map(&:instance_id)
    ec2.terminate_instances({
      dry_run: false,
      instance_ids: instance_ids
    }) rescue nil


    # rds.delete_db_instance({
    #   db_instance_identifier: RDS_IDENTIFIER,
    #   skip_final_snapshot: true
    # }) rescue nil

    elb.delete_load_balancer({
      load_balancer_name:ELB_NAME
    }) rescue nil

    log 1, "shut down end"
  end

  private
  def log(log_level=0, msg)
    puts "\t" * log_level + msg
  end

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

  def create_security_group
    log 1, "[create_security_group] start"
    begin
      ec2.describe_security_groups({
        dry_run: false,
        group_names: [SECURITY_GROUP_NAME]
      })

      log 2, "Security group : #{SECURITY_GROUP_NAME} already exist."
      log 2, "Use #{SECURITY_GROUP_NAME}"
    rescue Aws::EC2::Errors::InvalidGroupNotFound => _
      ec2.create_security_group({
        dry_run: false,
        group_name: SECURITY_GROUP_NAME,
        description: "Sauron test security group"
      })

      ec2.authorize_security_group_ingress({
        dry_run: false,
        group_name: SECURITY_GROUP_NAME,
        ip_protocol: "-1",
        from_port: -1,
        to_port: -1,
        cidr_ip: "0.0.0.0/0",
      })
    end

    log 1, "[create_security_group] end"
  end

  def create_elb_instances
    log 1, "[create_elb_instances] start"
    begin
      elb.describe_load_balancers({
        load_balancer_names: [ELB_NAME]
      })

      log 2, "ELB Identifier : #{ELB_NAME} already exist."
      log 2, "Use #{ELB_NAME}"
    rescue Aws::ElasticLoadBalancing::Errors::LoadBalancerNotFound => _
      elb.create_load_balancer({
        load_balancer_name: ELB_NAME,
        listeners: [
          {
            protocol: "Http",
            load_balancer_port: 80,
            instance_protocol: "Http",
            instance_port: 80
          },
        ],
        availability_zones: ec2.describe_availability_zones.availability_zones.map(&:zone_name),
      })
    end
    log 1, "[create_elb_instances] end"
  end

  def create_ec2_instances
    log 1, "[create_ec2_instances] start"
    @reservation = ec2.run_instances(ec2_options)
    log 1, "[create_ec2_instances] end"
  end

  def create_rds_instances
    log 1, "[create_rds_instances] start "

    begin
      rds.describe_db_instances({
        db_instance_identifier: RDS_IDENTIFIER
      })

      log 2, "RDS Identifier : #{RDS_IDENTIFIER} already exist."
      log 2, "Use #{RDS_IDENTIFIER}"
    rescue Aws::RDS::Errors::DBInstanceNotFound => _
      rds.create_db_instance({
        db_name: "sauron_test_app_prod",
        db_instance_identifier: RDS_IDENTIFIER,
        allocated_storage: 10,
        db_instance_class: "db.t2.micro",
        engine: "MySQL",
        master_username: "root",
        master_user_password: "saurontest",
        multi_az: false,
      })
    end

    log 1, "[create_rds_instances] end"
  end

  def wait_ec2_rds_instances
    log 1, "[wait_ec2_rds_instances] start"

    log 2, "wait while all instances are ready"
    while true
      log 3, "waiting..."
      all_running = ec2_instances(@reservation.reservation_id).inject(true) do |bool, instance|
        bool &&= instance_is_running?(instance)
      end

      db = rds.describe_db_instances({
        db_instance_identifier: RDS_IDENTIFIER
      }).db_instances.first

      all_running &&= db.db_instance_status == "available"

      break if all_running

      sleep(10)
    end
    log 2, "all instances are now running"

    log 2, "wait instance run ssh daemon"
    sleep(30)
    @ec2_instances = ec2_instances(@reservation.reservation_id)

    log 1, "[wait_ec2_rds_instances] end"
  end

  def make_environment_file
    log 2, "[make_environment_file] start"
    db = rds.describe_db_instances({
      db_instance_identifier: RDS_IDENTIFIER
    }).db_instances.first

    test_app_env = {
      "URL_DATABASE" => db.endpoint.address,
      "SERVERS" => @ec2_instances.map{|x| x.public_dns_name}
    }

    f = File.new("sauron_test/env.yml", "w")
    f.write(test_app_env.to_yaml)
    f.close
    log 2, "[make_environment_file] end"
  end

  def deploy_sauron_test_rails_app
    log 1, "[deploy_sauron_test_rails_app] start"

    make_environment_file

    `cd sauron_test; cap production deploy`

    log 1, "[deploy_sauron_test_rails_app] end"
  end

  def attach_ec2_instances_to_elb
    log 1, "[attach_ec2_instances_to_elb] start"

    elb.register_instances_with_load_balancer({
      load_balancer_name: ELB_NAME,
      instances: @ec2_instances.map{|x| {instance_id: x.instance_id}}
    })

    log 1, "[attach_ec2_instances_to_elb] end"
  end

  def wait_elb_attaching
    log 1, "[wait_elb_attaching] start"

    log 2, "wait until ec2 instances are attached to elb"
    while true
      log 3, "waiting..."
      instance = elb.describe_instance_health({
        load_balancer_name: ELB_NAME
      }).instance_states.first
      break if instance.state == "InService"
      sleep(10)
    end

    log 1, "[wait_elb_attaching] start"
  end

  def simulate_app_situation
    log 1, "[simulate_app_situation] start"

    log 1, "[simulate_app_situation] end"
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
      security_groups: [SECURITY_GROUP_NAME],
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

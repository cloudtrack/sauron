# require 'json'
# require 'factory_girl'
# require 'elasticsearch'
# require 'thread'

require 'thor'
require 'yaml'
require 'aws-sdk'
require 'active_support/all'
# require 'net/ssh'
# require 'net/http'
# require 'pry'

class SauronInstaller < Thor
  desc 'install --options', 'install sauron'
  def install
    apply_config

    # elasticsearch create loading issue"
    generate_elasticsearch

    add_config_to_collector

    compress_collector

    upload_collector_to_lambda

    link_lambda_with_cloudwatch

    add_dashboard_to_kibana

    binding.pry
  end

  desc 'test --options', 'install sauron'
  def test
    apply_config

    binding.pry
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

  def generate_elasticsearch
    puts "start generate_elasticsearch"

    policy_document = '''
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "AWS": [
                "*"
              ]
            },
            "Action": [
              "es:*"
            ],
            "Resource": "arn:aws:es:ap-northeast-1:579117780400:domain/sauron-test/*"
          }
        ]
      }
    '''

    begin
      es.describe_elasticsearch_domain({
        domain_name: config["elasticsearch_domain"]
      })

      puts "Elasticsearch Domain : #{config["elasticsearch_domain"]} already exist."
      puts "Use #{config["elasticsearch_domain"]} Elasticsearch instance"
    rescue Aws::ElasticsearchService::Errors::ResourceNotFoundException => _
      es.create_elasticsearch_domain({
        domain_name: config["elasticsearch_domain"],
        elasticsearch_cluster_config: {
          instance_type: "t2.micro.elasticsearch",
          instance_count: 1,
        },
        ebs_options: {
          ebs_enabled: true,
          volume_type: "standard", # accepts standard, gp2, io1
          volume_size: 10,
        },
        snapshot_options: {
          automated_snapshot_start_hour: 1,
        },
        access_policies: policy_document
      })

    end

    puts "end generate_elasticsearch"
  end

  def add_config_to_collector
    puts "start add_config_to_collector"

    collector_config = config.slice("client_id", "region", "services", "elasticsearch_domain")
    f = File.new("../collector/config.yml", "w")
    f.write(collector_config.to_yaml)
    f.close

    puts "end add_config_to_collector"
  end

  def compress_collector
    puts "start compress_collector"
    `zip -r ../collector.zip ../collector/*`

    puts "end compress_collector"
  end

  def upload_collector_to_lambda
    puts "start upload_collector_to_lambda"
    aws_lambda.create_function({
      function_name: "sauron",
      runtime: "nodejs4.3",
      role: "lambda_basic_execution",
      handler: "index.handler",
      code: {
        zip_file: "../collector.zip"
      },
      description: "Sauron collector",
      timeout: 60,
      memory_size: 128
    })

    puts "end upload_collector_to_lambda"
  end

  def link_lambda_with_cloudwatch
    puts "start link_lambda_with_cloudwatch"

    puts "end link_lambda_with_cloudwatch"
  end

  def add_dashboard_to_kibana
    puts "start add_dashboard_to_kibana"

    puts "end add_dashboard_to_kibana"
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

  def es
    @es ||= Aws::ElasticsearchService::Client.new
  end

  def aws_lambda
    @aws_lambda ||= Aws::Lambda::Client.new
  end

  default_task :install
end

SauronInstaller.start(ARGV)

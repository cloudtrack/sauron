require 'aws-sdk'
require 'yaml'

# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.
# You can define all roles on a single server, or split them:

# server 'example.com', user: 'deploy', roles: %w{app db web}, my_property: :my_value
# server 'example.com', user: 'deploy', roles: %w{app web}, other_property: :other_value
# server 'db.example.com', user: 'deploy', roles: %w{db}

custom_env = YAML::load(File.open('env.yml'))
set :default_env, custom_env
set :passenger_environment_variables, custom_env
set :passenger_restart_command, 'passenger-config restart-app'
set :linked_files, fetch(:linked_files, []).push('config/database.yml')

custom_env["SERVERS"].each_with_index do |dns, idx|
  if idx == 0
    server dns, user: 'sauron', roles: %w{app web db}
  else
    server dns, user: 'sauron', roles: %w{app web}
  end
end

# server 'example.com', user: 'deploy', roles: %w{app db web}, my_property: :my_value

# role-based syntax
# ==================

# Defines a role with one or multiple servers. The primary server in each
# group is considered to be the first unless any  hosts have the primary
# property set. Specify the username and a domain or IP for the server.
# Don't use `:all`, it's a meta role.

# role :app, %w{deploy@example.com}, my_property: :my_value
# role :web, %w{user1@primary.com user2@additional.com}, other_property: :other_value
# role :db,  %w{deploy@example.com}



# Configuration
# =============
# You can set any configuration variable like in config/deploy.rb
# These variables are then only loaded and set in this stage.
# For available Capistrano configuration variables see the documentation page.
# http://capistranorb.com/documentation/getting-started/configuration/
# Feel free to add new variables to customise your setup.


# you have to change this ssh options
set :ssh_options, {
  keys: %w(/Users/yujun/.ssh/sauron_tokyo.pem),
  forward_agent: true,
  auth_methods: %w(publickey)
}

namespace :deploy do

  before :starting, :add_database do
    on roles(:all) do
      db_config = <<-EOF
        development:
          adapter: mysql2
          database: sauron_test_app_dev
          encoding: utf8
          username: root
          host: localhost
          encoding: utf8mb4
          collation: utf8mb4_bin

        production:
          adapter: mysql2
          database: sauron_test_app_prod
          encoding: utf8
          username: root
          password: saurontest
          host: #{custom_env["URL_DATABASE"]}
          encoding: utf8mb4
          collation: utf8mb4_bin
      EOF

      upload! StringIO.new(db_config), "#{shared_path}/config/database.yml"
    end
  end

end

# Custom SSH Options
# ==================
# You may pass any option but keep in mind that net/ssh understands a
# limited set of options, consult the Net::SSH documentation.
# http://net-ssh.github.io/net-ssh/classes/Net/SSH.html#method-c-start
#
# Global options
# --------------
#  set :ssh_options, {
#    keys: %w(/home/rlisowski/.ssh/id_rsa),
#    forward_agent: false,
#    auth_methods: %w(password)
#  }
#
# The server-based syntax can be used to override options:
# ------------------------------------
# server 'example.com',
#   user: 'user_name',
#   roles: %w{web app},
#   ssh_options: {
#     user: 'user_name', # overrides user setting above
#     keys: %w(/home/user_name/.ssh/id_rsa),
#     forward_agent: false,
#     auth_methods: %w(publickey password)
#     # password: 'please use keys'
#   }

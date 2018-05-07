require_relative 'boot'

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "action_cable/engine"
require "sprockets/railtie"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module BarnesSnap
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Don't generate system test files.
    config.generators.system_tests = nil
    #config.autoload_paths << Rails.root.join('lib')
    config.eager_load_paths << Rails.root.join('lib')
    #config.active_job.queue_adapter = :delayed_job

    Aws.config.update({
      region: Rails.application.secrets[:aws][:region],
      credentials: Aws::Credentials.new(
        Rails.application.secrets[:aws][:access_key_id], Rails.application.secrets[:aws][:secret_access_key]
      )
    })

    ActionMailer::Base.smtp_settings = {
      :user_name => "barnesfoundation",
      :password => "mQxeS1jlb93lVR4pg#",
      :domain => 'barnesfoundation.org',
      :address => 'smtp.sendgrid.net',
      :port => 587,
      :authentication => :plain,
      :enable_starttls_auto => true
    }
  end
end
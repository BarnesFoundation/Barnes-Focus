Rails.application.configure do
  config.webpacker.check_yarn_integrity = false  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Attempt to read encrypted secrets from `config/secrets.yml.enc`.
  # Requires an encryption key in `ENV["RAILS_MASTER_KEY"]` or
  # `config/secrets.yml.key`.
  config.read_encrypted_secrets = true

  # Disable serving static files from the `/public` folder by default since
  # Apache or NGINX already handles this.
  config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?

  # Compress JavaScripts and CSS.
  config.assets.js_compressor = :uglifier
  # config.assets.css_compressor = :sass

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false

  # `config.assets.precompile` and `config.assets.version` have moved to config/initializers/assets.rb

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.action_controller.asset_host = ENV['ASSET_HOST']

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = 'X-Sendfile' # for Apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for NGINX

  # Mount Action Cable outside main process or domain
  # config.action_cable.mount_path = nil
  # config.action_cable.url = 'wss://example.com/cable'
  # config.action_cable.allowed_request_origins = [ 'http://example.com', /http:\/\/example.*/ ]

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = 'web'.eql?(ENV.fetch('AWS_ENV', 'web'))

  # Use the lowest log level to ensure availability of diagnostic information
  # when problems arise.
  config.log_level = :debug

  # Prepend all log lines with the following tags.
  config.log_tags = [ :request_id ]

  # Use a different cache store in production.
  config.cache_store = :memory_store # other options would be `:mem_cache_store`

  # Use a real queuing backend for Active Job (and separate queues per environment)
  config.active_job.queue_adapter     = :active_elastic_job
  #config.active_elastic_job.periodic_tasks_route = '/background_jobs'.freeze
  # config.active_job.queue_name_prefix = "barnes-snap_#{Rails.env}"
  config.action_mailer.perform_caching = false
  config.action_mailer.asset_host = ENV['ASSET_HOST']
  config.action_mailer.default_url_options = { :host => ENV['ASSET_HOST'] }

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = [I18n.default_locale]

  # Send deprecation notices to registered listeners.
  config.active_support.deprecation = :notify

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Use a different logger for distributed setups.
  # require 'syslog/logger'
  # config.logger = ActiveSupport::TaggedLogging.new(Syslog::Logger.new 'app-name')

  if ENV["RAILS_LOG_TO_STDOUT"].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger    = ActiveSupport::TaggedLogging.new(logger)
  end

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  #Rails.application.config.middleware.use ExceptionNotification::Rack,
  #:email => {
  #  #:deliver_with => :deliver, # Rails >= 4.2.1 do not need this option since it defaults to :deliver_now
  #  :email_prefix => "#{ENV['EXCEPTION_NOTIFIER_PREFIX']} ",
  #  :sender_address => %{"notifier" <info@barnesfoundation.org>},
  #  :exception_recipients => %w{puneet@happyfuncorp.com rajnikant@happyfuncorp.com support@barnesfoundation.org cjativa@barnesfoundation.org}
  #},
  #:error_grouping => true,
  #:error_grouping_period => 10.minutes,    # the time before an error is regarded as fixed
  #:error_grouping_cache => Rails.cache
end

Apipie.configure do |config|
  config.app_name                = "BarnesSnap API"
  config.api_base_url            = "/api"
  config.doc_base_url            = "/apipie"
  config.translate               = false
  # where is your API defined?
  config.api_controllers_matcher = "#{Rails.root}/app/controllers/api/*.rb"

  config.authenticate = Proc.new do
    authenticate_or_request_with_http_basic do |username, password|
      username == "hfc" && password == "lovesyou"
    end
  end
end

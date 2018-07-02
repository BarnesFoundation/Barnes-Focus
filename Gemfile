source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails', '~> 5.1.4'
gem 'pg', '~> 0.18'
gem 'puma', '~> 3.7'
gem 'sass-rails', '~> 5.0'
gem 'uglifier', '>= 1.3.0'
gem 'webpacker'

gem 'coffee-rails', '~> 4.2'
gem 'turbolinks', '~> 5'
gem 'jbuilder', '~> 2.5'

gem 'rest-client', require: false
gem 'aasm'
gem 'aws-sdk',  '~> 2'
gem 'active_elastic_job'
gem 'elasticsearch'
gem 'delayed_job'
gem 'delayed_job_active_record'
gem "daemons"
gem 'activeadmin'
gem 'devise'
gem 'ffi', '1.9.18'
gem 'google-cloud-translate'
gem 'whenever', require: false
gem 'silverpop'
gem 'mandrill-api'
gem 'oauth2'
gem 'exception_notification'
gem 'health_check'
gem 'apipie-rails'
gem 'nokogiri'

group :development, :test do
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'rspec-rails'
  gem 'dotenv-rails'
end

group :development do
  gem 'web-console', '>= 3.3.0'
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

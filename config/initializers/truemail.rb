require 'truemail'

Truemail.configure do |config|

  # Required parameter. Must be an existing email on behalf of which verification will be performed
  config.verifier_email = 'admin@barnesfoc.us'

  config.default_validation_type = :mx

  # Optional parameter. This option will be parse bodies of SMTP errors. It will be helpful
  # if SMTP server does not return an exact answer that the email does not exist
  # By default this option is disabled, available for SMTP validation only.
  # config.smtp_safe_check = true
end
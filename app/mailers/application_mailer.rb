class ApplicationMailer < ActionMailer::Base
  default from: 'The Barnes Foundation <support@barnesfoundation.org>'
  layout 'mailer'
end

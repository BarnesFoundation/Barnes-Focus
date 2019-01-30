class UserMailer < ApplicationMailer
    def send_csv(s3_url)
        mail(
            to: 'sbrady@barnesfoundation.org; puneet@happyfuncorp.com',
            subject: 'Scanned history dump',
            body: "Please find the link to download CSV file: #{s3_url}"
        )
    end
end
class UserMailer < ApplicationMailer
    def send_csv(s3_url)
        mail(
            to: 'focus-notify@barnesfoundation.org',
            subject: 'Scanned history dump',
            body: "Please find the link to download CSV file: #{s3_url}"
        )
    end

    def send_error_trail(message, trail)
        body = "You recent request to download scanned history dump is failed with below message:"
        body += "\n"
        body += message
        body += "\n"
        body += trail
        mail(
            to: 'focus-notify@barnesfoundation.org',
            subject: 'REQUEST FAILED: Scanned history dump',
            body: body
        )
    end
end
class UserMailer < ApplicationMailer
    def send_csv(s3_url, dump_type)
        mail(
            to: 'focus-notify@barnesfoundation.org; puneet@happyfuncorp.com',
            subject: 'Scanned history dump',
            body: "Please find the link to download CSV file: #{s3_url} of #{dump_type}"
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
require 'uri'
require 'net/https'
require 'json'
require 'oauth2'

class SubscribeToNewsletterJob < ApplicationJob
  queue_as ENV['SQS_QUEUE'].to_sym

  def perform(subscription_id)
    subscription = Subscription.find_by id: subscription_id

    if subscription
      #Generate OAuth2 access token
      client = OAuth2::Client.new(
        Rails.application.secrets[:silverpop_config][:key],
        Rails.application.secrets[:silverpop_config][:secret],
        site: "https://api3.silverpop.com/oauth/token"
      )

      access_token = OAuth2::AccessToken.from_hash(client, refresh_token: Rails.application.secrets[:silverpop_config][:refresh]).refresh!

      #add_recipeint
      uri = URI.parse('https://api3.silverpop.com:443/rest/databases/'+Rails.application.secrets[:silverpop_config][:list_id].to_s+'/contacts')

      req = Net::HTTP::Post.new(uri.to_s)
      req.body = {
        "email" => subscription.email,
        "leadSource" => "snap-bookmark-consent"
      }.to_json
      req['Authorization'] = "Bearer #{access_token.token}"
      req['Content-Type'] = 'application/json'

      begin
        response = https(uri).request(req)
        subscription.update_column( :is_subscribed, true )
        p response.body
      rescue Exception => e
        p 'request failed to execute because of: ' + e.to_s
      end
    end
  end

  def https(uri)
    Net::HTTP.new(uri.host, uri.port).tap do |http|
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    end
  end
end
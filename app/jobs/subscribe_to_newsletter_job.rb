require 'silverpop'
require 'oauth2'

class SubscribeToNewsletterJob < ApplicationJob
  queue_as :image_processing_queue

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

      @client = SilverPop.new({access_token: access_token.token, url: Rails.application.secrets[:silverpop_config][:endpoint]})

      #add_recipeint
      begin
        resp = @client.add_recipient(
          {
            email: subscription.email,
            name: "CRM Lead Source"
          },
          Rails.application.secrets[:silverpop_config][:list_id],
          []
        )
        p resp.Envelope.Body.RESULT.SUCCESS
      rescue Exception => err
        p "unable to add recipient due to: #{err.to_s}"
      end
    end
  end
end
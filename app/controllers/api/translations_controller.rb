class Api::TranslationsController < Api::BaseController
  skip_before_action :verify_authenticity_token, only: %w(index)

  def index
    session = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )

    respond_to do | wants |
      if session
        language = session.lang_pref ? session.lang_pref.downcase : 'en'

        @translations = Rails.cache.fetch("translations/#{language}", expires_in: 8.hours) do
          Translation.search(language)
        end

        wants.json do
          render json: { data: { translations: @translations }, message: '' }, status: :ok
        end
      else
        wants.json do
          render json: { data: { errors: ['Session not found'] }, message: 'not_found' }, status: 404
        end
      end
    end
  end
end

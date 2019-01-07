class Api::BookmarksController < Api::BaseController
  def index
  end

  def create
    respond_to do | wants |
      if bookmark_params[:email]
        session = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
        if session
          Bookmark.where( session_id: session.id ).update_all( email: bookmark_params[:email] )
          check_for_newsletter
          wants.json do
            render json: { data: { errors: [] }, message: 'created' }, status: :created
          end
        else
          wants.json do
            render json: { data: { errors: [ 'Scanned history not found' ] }, message: 'not_found' }, status: 404
          end
        end
      else
        wants.json do
          render json: { data: { errors: ["Email can't be blank"] }, message: '' }, status: 422
        end
      end
    end
  end

  def check_for_newsletter
    if bookmark_params[:newsletter].present?
      subscription = Subscription.find_or_create_by(email: bookmark_params[:email])
      subscription.is_subscribed = true if bookmark_params[:newsletter] == 'true'
      subscription.is_subscribed = false if bookmark_params[:newsletter] == 'false'
      subscription.save
      SubscribeToNewsletterJob.perform_later(subscription.id)
    end
  end

private
  def bookmark_params
    params.require(:bookmark).permit(:email, :image_id, :newsletter, :language)
  end
end

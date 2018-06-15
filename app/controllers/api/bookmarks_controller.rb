class Api::BookmarksController < Api::BaseController
  def index
  end

  api :POST, '/v1/bookmarks', 'Create bookmark entry'
  param :email, String, desc: "Email of user", required: true
  param :image_id, String, desc: "Image Id", required: true
  param :newsletter, String, desc: "Would like to subscribe to newsletter yes/no. Boolean field"
  param :language, String, desc: "Which language user is currently accessing to"
  example "bookmark[:email]='somone@example.com', bookmark[:image_id]='2072'"
  def create
    @bookmark = Bookmark.new bookmark_params

    respond_to do | wants |
      if @bookmark.save
        check_for_newsletter params[:bookmark]
        wants.json do
          render json: { data: { bookmark: @bookmark }, message: 'created' }, status: :created
        end
      else
        wants.json do
          render json: { data: { errors: @bookmark.errors.full_messages }, message: '' }, status: 422
        end
      end
    end
  end

  def check_for_newsletter bookmark_params
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

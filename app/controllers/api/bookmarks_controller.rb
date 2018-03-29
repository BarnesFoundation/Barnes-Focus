class Api::BookmarksController < ApplicationController
  def index
  end

  def create
    @bookmark = Bookmark.new bookmark_params

    respond_to do | wants |
      if @bookmark.save
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

private
  def bookmark_params
    params.require(:bookmark).permit(:email, :image_id, :received_on)
  end
end

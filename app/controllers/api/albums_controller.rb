class Api::AlbumsController < Api::BaseController
  def create
    @album = Album.new

    respond_to do | wants |
      if @album.save
        wants.json do
          render json: { data: { album: @album }, message: 'Album created successfully.', errors: [] }, status: :ok
        end
      else
        wants.json do
          render json: { data: { album: nil }, message: 'Unable to create album', errors: @album.errors.full_messages }, status: 422
        end
      end
    end
  end
end

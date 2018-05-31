class Api::TranslationsController < Api::BaseController
  def index
    @translations = Translation.search(params[:language])

    respond_to do | wants |
      wants.json do
        render json: { data: { translations: @translations }, message: '' }, status: :ok
      end
    end
  end
end

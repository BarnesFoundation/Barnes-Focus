class Api::StoriesController < Api::BaseController
  skip_before_action :verify_authenticity_token

  def show
    puts params[:slug]
    @story = StoryFetcher.new.find_by_object_id(5204, 'en')

    respond_to do |wants|
      wants.json do
        render json: {
          data: {
            success: true,
            total: @story[:total],
            unique_identifier: @story[:unique_identifier],
            content: @story[:content]
          },
          message: 'ok'
        }
      end
    end
  end
end
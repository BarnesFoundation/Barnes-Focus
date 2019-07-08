class Api::StoriesController < Api::BaseController
  skip_before_action :verify_authenticity_token

  def show
    @story      = Story.find_by slug: params[:slug]

    respond_to do |wants|
      if @story
        @story_data = StoryFetcher.new.find_by_title(@story.title, 'en')

        wants.json do
          render json: {
            data: {
              success: true,
              total: @story_data[:total],
              unique_identifier: @story_data[:unique_identifier],
              content: @story_data[:content]
            },
            message: 'ok'
          },
          status: :ok
        end
      else
        wants.json do
          render json: {
            data: {
              success: false,
              total: 0,
              unique_identifier: nil,
              content: {}
            },
            message: 'Story not found!'
          },
          status: 404
        end
      end
    end
  end
end
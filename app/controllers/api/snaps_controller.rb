class Api::SnapsController < Api::BaseController

  def index
    render :json => "tarun"
  end

  def search
    # file = params[:image_file]
    #using test image for API testing
    pastec_obj = Pastec.new
    file = pastec_obj.loadFileData("public/test-image.png")

    #send image to s3 with background job if image is valid

    searched_result = process_searched_images_response(pastec_obj.search_image(file))
    render json: searched_result
  end

  private
    def process_searched_images_response searched_images
      response = { }
      response[:data] = {records: [], message: "No records found"}
      response[:success] = false
      case searched_images["type"]
        when Pastec::RESPONSE_CODES[:SEARCH_RESULTS]
          response[:success] = true
          get_similar_images(searched_images["image_ids"], response)
        when Pastec::RESPONSE_CODES[:IMAGE_NOT_DECODED]
          response[:data][:message] = "Invalid image data"
        when Pastec::RESPONSE_CODES[:IMAGE_SIZE_TOO_BIG]
          response[:data][:message] = "Image size is too big"
        when Pastec::RESPONSE_CODES[:IMAGE_SIZE_TOO_SMALL]
          response[:data][:message] = "Image size is too small"
      end
      response
    end

    def get_similar_images image_ids, response
      if image_ids.present?
        #send these image_ids to elastic search to get recommended result and send list to API
        response[:data][:records] = image_ids
      end
      response
    end
end

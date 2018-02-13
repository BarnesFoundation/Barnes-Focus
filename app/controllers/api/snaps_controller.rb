class Api::SnapsController < Api::BaseController

  def index
    render :json => "tarun"
  end

  def search
    data = params[:image_data]
    searched_result = { success: false }
    #using test image for API testing
    if true
      pastec_obj = Pastec.new
      image_data = Base64.decode64(data['data:image/png;base64,'.length .. -1])
      file_name = "#{Rails.root}/tmp/#{SecureRandom.hex}.png"
      File.open(file_name, 'wb') do |f|
        f.write image_data
      end

      file_name = "#{Rails.root}/public/test-image.png"
      file = pastec_obj.loadFileData(open(file_name))
      searched_result = process_searched_images_response(pastec_obj.search_image(file))

      # send image to s3 with background job if image is valid and log result to db
      ImageUploadJob.perform_later(file.path, searched_result)
    end

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
        image_ids.uniq!
        #send these image_ids to elastic search to get recommended result and send list to API
        image_ids.each do |img|
          response[:data][:records] << BarnesElasticSearch.instance.get_object(img)
        end
      end
      response
    end
end

require 'barnes_elastic_search'

class Api::SnapsController < Api::BaseController

  def search
    data = params[:image_data]
    searched_result = { success: false }
    #using test image for API testing

    #pastec_obj = Pastec.new
    pastec_obj = CudaSift.new
    image_data = Base64.decode64(data['data:image/png;base64,'.length .. -1])
    file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
    File.open(file_name, 'wb') do |f|
      f.write image_data
    end
    # for testing
    #file_name = "#{Rails.root}/public/test-image1.jpeg"

    file = pastec_obj.loadFileData(file_name)
    pastec_response = pastec_obj.search_image(file)

    pastec_response["image_ids"] = pastec_response["type"]== Pastec::RESPONSE_CODES[:SEARCH_RESULTS] ? [pastec_response["results"].collect{|k| File.basename(k.keys[0], ".jpg").split('_')[0]}.compact[0]].compact : []

    searched_result = process_searched_images_response(pastec_response)

    # send image to s3 with background job if image is valid and log result to db
    # We can make it asyc with perform_later, on heroku we can not store file in temp for later processing with job
    ImageUploadJob.perform_now(file.path, {pastec_response: pastec_response, es_response: searched_result["data"]})


    render json: searched_result
  end

  def languages
    translator = GoogleTranslate.new preferred_language
    render json: translator.supported_languages(preferred_language)
  end

  private
    def process_searched_images_response searched_images
      response = { }
      response["data"] = {"records" => [], "message" => "No records found"}
      response["success"] = false
      response["pastec_data"] = []
      case searched_images["type"]
        when Pastec::RESPONSE_CODES[:SEARCH_RESULTS]
          response["success"] = true
          get_similar_images(searched_images["image_ids"], response)
          #Add response from pastec to final result
          pastec_result = TrainingRecord.where(identifier: searched_images["image_ids"])
          pastec_result.each do |img|
            response["pastec_data"] << {"image_id" => img.identifier, "image_url" => img.image_url}
          end
        when Pastec::RESPONSE_CODES[:IMAGE_NOT_DECODED]
          response["data"]["message"] = "Invalid image data"
        when Pastec::RESPONSE_CODES[:IMAGE_SIZE_TOO_BIG]
          response["data"]["message"] = "Image size is too big"
        when Pastec::RESPONSE_CODES[:IMAGE_SIZE_TOO_SMALL]
          response["data"]["message"] = "Image size is too small"
      end
      response
    end

    def get_similar_images image_ids, response
      if image_ids.present?
        response["data"]["message"] = 'Result Found'
        image_ids.uniq!
        #send these image_ids to elastic search to get recommended result and send list to API
        image_ids.each do |img|
          searched_data = BarnesElasticSearch.instance.get_object(img)
          if preferred_language.present?
            translator = GoogleTranslate.new preferred_language
            #as of now I am sending translated version of title as shortdescription is coming null from elastic search
            searched_data["title"] = translator.translate(searched_data["title"])
            searched_data["shortDescription"] = translator.translate(searched_data["shortDescription"]) if searched_data["shortDescription"]
          end
          response["data"]["records"] << searched_data
        end
      end
      response
    end

    def preferred_language
      params["language"]
    end
end

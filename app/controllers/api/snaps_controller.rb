require 'barnes_elastic_search'

class Api::SnapsController < Api::BaseController
  include ActionView::Helpers::SanitizeHelper

  def search
    data = params[:image_data]
    searched_result = { success: false }
    #using test image for API testing

    api = CudaSift.new
    image_data = Base64.decode64(data['data:image/png;base64,'.length .. -1])
    file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
    File.open(file_name, 'wb') do |f|
      f.write image_data
    end
    # for development env testing
    #file_name = "#{Rails.root}/public/IMG_4971.jpg"

    file = api.loadFileData(file_name)
    response = api.search_image(file)

    response["image_ids"] = response["type"] == CudaSift::RESPONSE_CODES[:SEARCH_RESULTS] ? [response["results"].collect{|k| File.basename(k.keys[0], ".jpg").split('_')[0]}.compact[0]].compact : []

    searched_result = process_searched_images_response(response)

    #ImageUploadJob.perform_now(file.path, {response: response.except("total_time_consumed"), es_response: searched_result["data"], response_time: searched_result['total_time_consumed']})
    ImageUploadJob.perform_later(data, {response: response.except("total_time_consumed"), es_response: searched_result["data"], response_time: searched_result['total_time_consumed']})

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
      response["api_data"] = []
      response["total_time_consumed"] = searched_images["total_time_consumed"]
      case searched_images["type"]
        when CudaSift::RESPONSE_CODES[:SEARCH_RESULTS]
          response["success"] = true
          get_similar_images(searched_images["image_ids"], response)
        when CudaSift::RESPONSE_CODES[:IMAGE_NOT_DECODED]
          response["data"]["message"] = "Invalid image data"
        when CudaSift::RESPONSE_CODES[:IMAGE_SIZE_TOO_BIG]
          response["data"]["message"] = "Image size is too big"
        when CudaSift::RESPONSE_CODES[:IMAGE_SIZE_TOO_SMALL]
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
          start_time = Time.now
          searched_data = BarnesElasticSearch.instance.get_object(img)
          time_diff = Time.now - start_time
          response['total_time_consumed']['es_endpoint'] = Time.at(time_diff.to_i.abs).utc.strftime "%H:%M:%S"
          if preferred_language.present?
            translator = GoogleTranslate.new preferred_language
            #as of now I am sending translated version of title as shortdescription is coming null from elastic search
            #searched_data["title"] = translator.translate(searched_data["title"]) # as per SV-39 there is no need to translate title
            searched_data["shortDescription"] = translator.translate(strip_tags(searched_data["shortDescription"])) if searched_data["shortDescription"]
          end
          response["data"]["records"] << searched_data.slice(
            'id', 'imageSecret', 'title', 'shortDescription', 'artist', 'classification', 'locations', 'medium', 'url', 'invno', 'displayDate'
          )
        end
      end
      response
    end

    def preferred_language
      params["language"]
    end
end

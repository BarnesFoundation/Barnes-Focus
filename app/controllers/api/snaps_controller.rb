require 'barnes_elastic_search'

class Api::SnapsController < Api::BaseController
  include ActionView::Helpers::SanitizeHelper

  def search
    data = params[:image_data]
    start_time = Time.now
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

    File.delete(file.path)
    overall_processing = Time.at((Time.now - start_time).to_i.abs).utc.strftime "%H:%M:%S"
    searched_result['total_time_consumed']['overall_processing'] = overall_processing if searched_result['total_time_consumed'].present?
    r = SnapSearchResult.create(
      searched_image_data: data,
      api_response: response.except("total_time_consumed"),
      es_response: searched_result["data"],
      response_time: searched_result['total_time_consumed']
    )
    ImageUploadJob.perform_later(r.id)

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
      image_ids = ["6893"]
      if image_ids.present?
        response["data"]["message"] = 'Result Found'
        image_ids.uniq!
        #send these image_ids to elastic search to get recommended result and send list to API
        image_ids.each do |img|
          start_time = Time.now

          es_cached_record = EsCachedRecord.find_or_create_by image_id: img

          if es_cached_record.not_expired?
            searched_data = es_cached_record.es_data
          else            
            searched_data = BarnesElasticSearch.instance.get_object(img)
            searched_data = searched_data.slice(
              'id', 'imageSecret', 'title', 'shortDescription', 'people', 'classification', 'locations', 'medium', 'url', 'invno', 'displayDate'
            )
            es_cached_record.es_data = searched_data
            es_cached_record.last_es_fetched_at = DateTime.now
            es_cached_record.save
          end
          
          if preferred_language.present?
            translator = GoogleTranslate.new preferred_language
            searched_data['shortDescription'] = translator.translate(strip_tags(searched_data["shortDescription"])) if searched_data["shortDescription"]
          end
          searched_data['art_url'] = Image.imgix_url(searched_data['id'], searched_data['imageSecret']) # for s3 use ~> Image.s3_url(searched_data['id'], searched_data['imageSecret'])
          time_diff = Time.now - start_time
          response['total_time_consumed']['es_endpoint'] = Time.at(time_diff.to_i.abs).utc.strftime "%H:%M:%S"
          response["data"]["records"] << searched_data
        end
      end
      response
    end

    def preferred_language
      params["language"]
    end
end

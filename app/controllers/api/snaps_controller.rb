require 'nokogiri'

class Api::SnapsController < Api::BaseController
  include ActionView::Helpers::SanitizeHelper

  def search
    data = params[:image_data]
    start_time = Time.now
    searched_result = { success: false }
    #using test image for API testing

    api = CudaSift.new
    image_data = Base64.decode64(data['data:image/jpeg;base64,'.length .. -1])
    file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
    File.open(file_name, 'wb') do |f|
      f.write image_data
    end
    # for development env testing
    #file_name = "#{Rails.root}/public/IMG_4971.jpg"

    file = api.loadFileData(file_name)
    response = api.search_image(file)

    if response["type"] == CudaSift::RESPONSE_CODES[:SEARCH_RESULTS] && response["results"].any? && is_response_accepted?(response["results"].first)
      response["image_ids"] = [response["results"].collect{|k| File.basename(k.keys[0], ".jpg").split('_')[0]}.compact[0]].compact
    else
      response["image_ids"] = []
    end

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

  ## Endpoint for matching a image from a search
  def searcher

    # Get parameters from the request
    images = params[:images]
    submissionId = params[:submissionId]

    # Iterate through each image
    images.each do |image|

      # Get the image data and generate a file name for it
      imageData = Base64.decode64(image['data:image/jpeg;base64,'.length .. -1])
      fileName = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"

      # Write the image file
      File.open(fileName, 'wb') do |file|
        file.write imageData
      end

      puts "Wrote to file " + fileName

    end

    render json: { text: 'Images: ' + images.length.to_s + ' Submission Id: ' + submissionId.to_s }

  end

  ## Provides a unique 4-digit id 
  def submissionId 

    # Generate the unique id for the submission and return it 
    submissionId = rand(10 ** 4)
    render json: { submissionId: submissionId }
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
        image_ids.each do |img|
          start_time = Time.now

          searched_data = EsCachedRecord.search(img)
          if preferred_language.present?
            translator = GoogleTranslate.new preferred_language
            begin
              if searched_data["shortDescription"]
                doc = Nokogiri::HTML(translator.translate(searched_data["shortDescription"]))
                doc.remove_namespaces!
                searched_data['shortDescription'] = doc.xpath("//p")[0].content
                searched_data['shortDescription'] = translator.translate(strip_tags(searched_data["shortDescription"]).html_safe) if searched_data['shortDescription'].nil?
              end
            rescue Exception => err
              p err
              searched_data['shortDescription'] = strip_tags(searched_data["shortDescription"]).html_safe if searched_data["shortDescription"]
            end
          end
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


    def is_response_accepted? first_response
      resp_val = nil
      first_response.select { |k, v| resp_val = v }
      return resp_val >= ENV.fetch('RESPONSE_THRESHOLD').to_f
    end

end

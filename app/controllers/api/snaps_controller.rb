require 'nokogiri'
require 'rest-client'
require 'json'

class Api::SnapsController < Api::BaseController
  include ActionView::Helpers::SanitizeHelper

  def search    
    data = params[:images][0]
    start_time = Time.now
    searched_result = { success: false }
    #using test image for API testing

    api = CudaSift.new
    image_data = Base64.decode64(data['data:image/jpeg;base64,'.length .. -1])
    file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
    File.open(file_name, 'wb') do |f|
      f.write image_data
    end

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

  ## Endpoint for searching the CUDA server using an array of images
  def searchCudaScan

    # Get parameters from the request
    image = params[:image]
    searched_result = nil
    count = params[:imageCount]

    # Prepare for search
    start_time = Time.now
    searched_result = { success: false }
    api = CudaSift.new

    # Get the image data 
    image_data = Base64.decode64(image['data:image/jpeg;base64,'.length .. -1])

    # Generate temporary file for it
    file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
    File.open(file_name, 'wb') do |f|
      f.write image_data
    end

    # Load the file and begin the CUDA search
    file = api.loadFileData(file_name)
    response = api.search_image(file)

    if response["type"] == CudaSift::RESPONSE_CODES[:SEARCH_RESULTS] && response["results"].any? && is_response_accepted?(response["results"].first)
      # Get the image ids of the match
      response["image_ids"] = [response["results"].collect{|k| File.basename(k.keys[0], ".jpg").split('_')[0]}.compact[0]].compact
    else
      response["image_ids"] = []
    end

    # Process the result and delete the temporary image
    searched_result = process_searched_images_response(response)
    File.delete(file.path)

    overall_processing = Time.at((Time.now - start_time).to_i.abs).utc.strftime "%H:%M:%S"
    searched_result['total_time_consumed']['overall_processing'] = overall_processing if searched_result['total_time_consumed'].present?

    # If the searched result contains a match
    if searched_result['data']['records'].length > 0 

      searched_result['requestComplete'] = true
      render json: searched_result

    else
      searched_result['requestComplete'] = if (count == 9) then true else false end
      render json: searched_result
    end
  end

  ## Endpoint for matching a image from a search
  def searcher

    # Get parameters from the request
    image = params[:image]
    image_count = params[:imageCount]

    # Craftar credentials
    url = 'https://search.craftar.net/v1/search'
    token = '2999d63fc1694ce4'

    # Get the image data 
    image_data = Base64.decode64(image['data:image/jpeg;base64,'.length .. -1])

    # Generate temporary file for it
    file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
    File.open(file_name, 'wb') do |f|
      f.write image_data
    end

    # Send it to the Catchoom Image Recognition API
    image_response = RestClient.post url, {:token => token, :multipart => true, :image => File.new(file_name, 'rb') }
    results = JSON.parse(image_response)['results']
    File.delete(file_name)

    response = nil

    # If the searched result contains a match
    if results.length > 0
      image_id = results[0]['item']['name'].to_i 
      response = process_searched_image(image_id, image_count)
    else
      response = process_searched_image(nil, image_count)
    end

    render json: response
  end

  def languages
    translator = GoogleTranslate.new preferred_language
    render json: translator.supported_languages(preferred_language)
  end

  def getArtworkInformation
    # Get parameters from the request
    image_id = params[:imageId]
    response = process_searched_image(image_id)

    render json: response
  end

  ###### Mark all subsequent methods as private methods ######
  private

    ## Processes a recognized image using its id
    def process_searched_image image_id

      # Empty response object
      response = { }
      response[:api_data] = []

      if image_id
        response[:data] = { :records => [], :message => 'Result found' }
        response[:success] = true
        response[:requestComplete] = true
        response[:data][:records] << get_image_information(image_id)
      else
        response[:data] = { :records => [], :message => 'No result found' }
        response[:success] = false
      end
      return response
    end

    ## Gets the image information for the specific id
    def get_image_information(image_id)
      
      # Request the image information from Elastic Search
      image_info = EsCachedRecord.search(image_id)

      # Translate the short description if needed
      if image_info[:shortDescription] && preferred_language.present? 
        image_info[:shortDescription] = translate_text(image_info[:shortDescription]) 
      end
      return image_info
    end

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

    ## Translates the given text
    def translate_text(short_description)
      
      # Configure language translator
      translator = GoogleTranslate.new preferred_language

      # Strip unwanted content
      begin
          document = Nokogiri::HTML(translator.translate(short_description))
          document.remove_namespaces!
          short_description = doccument.xpath("//p")[0].content
          short_description = translator.translate(strip_tags(short_description).html_safe) if short_description.nil?
      rescue Exception => error
        p error
        short_description = strip_tags(short_description).html_safe if short_description
      end

      return short_description
    end

end

require 'nokogiri'
require 'rest-client'
require 'json'

class Api::SnapsController < Api::BaseController
  include ActionView::Helpers::SanitizeHelper

  def search    
    data = params[:image]
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

  ## Endpoint for searching the CUDA server and returning an image id
  def searchCuda

    # Get parameters from the request
    image = params[:image]

    # Prepare for search
    start_time = Time.now
    api = CudaSift.new

    # Get the image data 
    image_data = Base64.decode64(image['data:image/jpeg;base64,'.length .. -1])

    # Generate temporary file for it
    file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
    File.open(file_name, 'wb') do |f|
      f.write image_data
    end

    # Load the file to  begin the CUDA search and delete it once complete
    file = api.loadFileData(file_name)
    cuda_response = api.search_image(file)
    File.delete(file.path)

    image_ids = nil

    # Get the image ids of the match
    if cuda_response["type"] == CudaSift::RESPONSE_CODES[:SEARCH_RESULTS] && cuda_response["results"].any? && is_response_accepted?(cuda_response["results"].first)
      image_ids = [cuda_response["results"].collect{|k| File.basename(k.keys[0], ".jpg").split('_')[0]}.compact[0]].compact
    else
      image_ids = []
    end
    
    response = { :results => [] }

    if image_ids.length > 0
      response[:results] << { :item => { :name => image_ids[0] } }
    else 
      response[:results] = []
    end

    render json: response
  end

  def languages
    translator = GoogleTranslate.new preferred_language
    render json: translator.supported_languages(preferred_language)
  end

  ## Retrieves the artwork information response for a provided image id
  def getArtworkInformation
    # Get parameters from the request
    image_id = params[:imageId]
    response = process_searched_image(image_id)

    render json: response
  end

  ## Stores the provided image result in the Snap dashboard
  def storeSearchedResult

    query_image = params[:queryImage]
    reference_image = params[:referenceImageUrl]
    
    qi_file = query_image.tempfile
    qi_path = qi_file.path()

    puts 'Query Image Path: ' + qi_path + '\n' + 'Reference Image Url: ' + reference_image
    # result = SnapSearchResult.create(
      #searched_image_data: nil,
      #api_response: 'Catchoom API Search Result',
      #es_response: records,
      #response_time: 'Elapsed time'
    #)
    #ImageUploadJob.perform_later(result.id, path)

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

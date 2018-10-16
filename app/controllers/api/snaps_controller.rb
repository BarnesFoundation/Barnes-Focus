require 'nokogiri'
require 'rest-client'

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
    images = params[:images]
    searched_result = nil

    # Empty matched results 
    matched_results = Hash.new(0)

    # Iterate through each image
    images.each do |image|

      # Prepare for search
      start_time = Time.now
      searched_result = { success: false }
      api = CudaSift.new

      # Get the image data and generate file for it
      image_data = Base64.decode64(image['data:image/jpeg;base64,'.length .. -1])

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

      searched_result = process_searched_images_response(response)
      File.delete(file.path)

      overall_processing = Time.at((Time.now - start_time).to_i.abs).utc.strftime "%H:%M:%S"
      searched_result['total_time_consumed']['overall_processing'] = overall_processing if searched_result['total_time_consumed'].present?

      # If the searched result contains a match
      if searched_result['data']['records'].length > 0 

        # Grab the id 
        id = searched_result['data']['records'][0]['id']

        # Store it in persistent hash table
        result = Hash.new(0)
        result['count'] += 1
        result['object'] = searched_result

        matched_results[id] = result
      end
    end
    
    # Check which possible match was matched the most
    matched_id = matched_results.max_by{|key,value| value['count']}[0].to_i
    result = matched_results[matched_id]['object']

    render json: result
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

    # Create empty hash with default value
    matches = Hash.new(0)

    # Iterate through each image
    images.each do |image|

      # Get the image data and generate a file name for it
      imageData = Base64.decode64(image['data:image/jpeg;base64,'.length .. -1])
      fileName = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"

      # Write the image file
      File.open(fileName, 'wb') do |file|
        file.write imageData
      end

      url = 'https://search.craftar.net/v1/search'
      token = '2999d63fc1694ce4'

      # Send it to the Catchoom Image Recognition API
      # response = RestClient.post url, {:token => token, :multipart => true, :image => File.new(fileName, 'rb') }
      
      # results = response.body['results']

      # Mock results
      results = [ { :score => 100, :name => '7356'} ]

      # Iterate through each result
      results.each do |result|

        if result[:score] >= 40
          # Add it to the hash table and increment its count
          matches[result[:name]] += 1
        end
      end   
    end

    # Find the likely matching image from the hash table
    matchedImageId = matches.max_by{|key,value| value}[0].to_i

    render json: { text: 'Images: ' + images.length.to_s + ' Submission Id: ' + submissionId.to_s, matchedImageId: matchedImageId }

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

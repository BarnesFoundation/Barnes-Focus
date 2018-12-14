require 'nokogiri'
require 'rest-client'
require 'json'

class Api::SnapsController < Api::BaseController
  include ActionView::Helpers::SanitizeHelper

  def languages
    translator = GoogleTranslate.new preferred_language
    render json: translator.supported_languages(preferred_language)
  end

  ## Retrieves the artwork information response for a provided image id
  def getArtworkInformation
    # Get parameters from the request
    image_id = params[:imageId]
    viewed_image_ids = params[:viewedImageIds]
    response = process_searched_image(image_id, viewed_image_ids)

    render json: response
  end

  ## Stores the provided image result in the Snap dashboard
  def storeSearchedResult
    # Get parameters from the request
    query_image_path = params[:image].tempfile.path()
    reference_image_url = if params[:referenceImageUrl] === 'null' then nil else params[:referenceImageUrl] end

    # Get the data data uri
    query_image_uri = 'data:image/jpeg;base64,' + Base64.encode64(open(query_image_path) { |io| io.read })

    if params[:scanSeqId].present?
      @album = Album.find_or_create_by(unique_identifier: params[:scanSeqId])

      @photo = @album.photos.create(
        searched_image_blob: query_image_uri,
        es_response: params[:esResponse] == 'null' ? nil : params[:esResponse],
        response_time: params[:searchTime],
        result_image_url: reference_image_url,
        search_engine: 'Catchoom API'
      )

      if @photo
        ImageUploadJob.perform_later(@album.id, @photo.id)
      end
    end

    if File.exists?(query_image_path)
      File.delete(query_image_path)
    end

    render json: 'Image was stored'
  end

  ###### Mark all subsequent methods as private methods ######
  private

    ## Processes a recognized image using its id
    def process_searched_image image_id, viewed_image_ids

      # Empty response object
      response = { }
      response[:api_data] = []

      if image_id
        # Build the response object
        response[:data] = { :records => [], :roomRecords => nil, :message => 'Result found' }
        response[:success] = true
        response[:requestComplete] = true

        # Get the image information for the image id
        response[:data][:records] << get_image_information(image_id)

        # Get other records in the same room
        room_id = response[:data][:records][0][:room] 
        # get_room_artworks was written keeping in mind that we get similar work of arts. But this is no longer needed now
        response[:data][:roomRecords] = [] # get_room_artworks(room_id, viewed_image_ids)
      end
      return response
    end

    ## Gets the image information for the specific id
    def get_image_information(image_id)
      
      # Request the image information from Elastic Search
      image_info = EsCachedRecord.search(image_id)

      # If short description exists
      if image_info[:shortDescription]

        # Remove html tags
        image_info[:shortDescription] = strip_tags(image_info[:shortDescription]).html_safe

        # Translate if needed
        if preferred_language.present? 
          image_info[:shortDescription] = translate_text(image_info[:shortDescription]) 
        end
      end
      return image_info
    end

    ## Pulls the preferred language from the request
    def preferred_language
      params["language"]
    end

    ## Translates the given text to the preferred language
    def translate_text(short_description)
      
      # Configure language translator
      translator = GoogleTranslate.new preferred_language

      # Strip unwanted content
      begin
          document = Nokogiri::HTML(translator.translate(short_description))
          document.remove_namespaces!
          short_description = document.xpath("//p")[0].content
          short_description = translator.translate(short_description) if short_description.nil?
      rescue Exception => error
        p error
        short_description = short_description if short_description
      end
      return short_description
    end

    ## Get artworks from the same room
    def get_room_artworks(room, viewed_images)

      # Get the objects from the room
      room_objects = BarnesElasticSearch.instance.get_room_objects(room, viewed_images)
  
      # Extract the ids
      ids = []
      room_objects.each do |image_id|
        ids << image_id['_id']
      end
      return ids
    end
end

require 'nokogiri'
require 'rest-client'
require 'json'

class Api::SnapsController < Api::BaseController
  include ActionView::Helpers::SanitizeHelper
  before_action only: [ :getArtworkInformation ] do
    capture_scanned_history( params[:imageId] )
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

  def similar_arts
    respond_to do | wants |
      if params[:image_id]
        @es_cached_record = EsCachedRecord.find_by image_id: params[:image_id]

        if @es_cached_record
          wants.json do
            render json: { data: { success: true, similar_arts: EsCachedRecord.find_similar_arts( @es_cached_record ) }, message: 'ok' }, status: :ok
          end
        else
          wants.json do
            render json: { data: { success: false, errors: [ 'Record not found' ] }, message: 'not found' }, status: 404
          end
        end
      else
        wants.json do
          render json: { data: { success: false, errors: ['Image id is not present'] }, message: 'bad entry' }, status: 400
        end
      end
    end
  end

  ###### Mark all subsequent methods as private methods ######
  private

    ## Processes a recognized image using its id
    def process_searched_image image_id
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
        response[:data][:roomRecords] = get_similar_artworks(image_id)
      end
      return response
    end

    ## Gets the image information for the specific id
    def get_image_information(image_id)
      # Request the image information from Elastic Search
      image_info = EsCachedRecord.search(image_id)

      # If short description exists
      if image_info["shortDescription"]
        # Remove html tags
        image_info["shortDescription"] = strip_tags(image_info["shortDescription"]).html_safe

        # Translate if needed
        if preferred_language.present?
          image_info["shortDescription"] = translate_text(image_info["shortDescription"])
        end
      end
      return image_info
    end

    ## Pulls the preferred language from the request
    def preferred_language
      session             = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
      return session.lang_pref || 'en'
    end

    ## Translates the given text to the preferred language
    def translate_text(short_description)
      # Strip unwanted content
      begin
        document = Nokogiri::HTML(short_description)
        document.remove_namespaces!
        short_description = document.xpath("//p")[0].content

        return short_description if preferred_language && preferred_language.downcase == 'en'

        # Configure language translator
        translator = GoogleTranslate.new preferred_language
        short_description = translator.translate(short_description) if !short_description.nil?
      rescue Exception => error
        p error
        short_description = short_description if short_description
      end
      return short_description
    end

    ## Get artworks from the same room
    def get_similar_artworks(image_id)
      # Get the objects from the room
      viewed_images = session[ :user_scanned_history ] && !session[ :user_scanned_history ].blank? ? JSON.parse( session[ :user_scanned_history ] ) : []
      similar_arts = EsCachedRecord.find_similar_arts image_id, viewed_images
      return similar_arts
    end
end

require 'rest-client'
require 'json'

class Api::SnapsController < Api::BaseController
  include ActionView::Helpers::SanitizeHelper
  skip_before_action :verify_authenticity_token, only: %w(storeSearchedResult mark_story_as_read find_stories_by_object_id)
  before_action only: [ :getArtworkInformation ] do
    capture_scanned_history( params[:imageId] )
  end
  before_action :fetch_session, only: %w(storeSearchedResult)

  def languages
    translator = GoogleTranslate.new preferred_language
    render json: translator.supported_languages(preferred_language)
  end

  ## Returns true/false depending on if the email is reachable
  def validateEmail
	email = params[:email]
	emailValid = Truemail.valid?(email)

	render json: emailValid 
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
      @album = Album.find_or_create_by(unique_identifier: params[:scanSeqId], session_id: @session.id)

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

  def find_stories_by_object_id
    session   = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
    lang_pref = session && !session.lang_pref.nil? ? session.lang_pref : 'en'
    @story = Rails.cache.fetch("stories-#{params[:object_id]}-#{lang_pref}-data", expires_in: 4.hours) do
      StoryFetcher.new.find_by_object_id(params[:object_id].to_i, lang_pref)
    end

    respond_to do | wants |
      wants.json do
        render json: {
          data: {
            success: true,
            total: @story[:total],
            unique_identifier: @story[:unique_identifier],
            content: @story[:content]
          },
          message: 'ok'
        },
        status: :ok
      end
    end
  end

  def find_stories_by_room_id
    @story = StoryFetcher.new.find_by_room_id params[:room_id].to_i

    respond_to do | wants |
      wants.json do
        render json: {
          data: {
            success: true,
            total: @story[:total],
            unique_identifier: @story[:unique_identifier],
            content: @story[:content]
          },
          message: 'ok'
        },
        status: :ok
      end
    end
  end

  def mark_story_as_read
    session  = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )

    if session
      session_blob = session.blob
      bookmarks = Bookmark.where(image_id: params[:image_id], session_id: session.id)

      respond_to do | wants |
        if bookmarks.present? && session_blob != '{}' && session_blob.has_key?(params[:unique_identifier])
          session_blob[params[:unique_identifier]]["read"] = true
          bookmarks.update_all( story_read: true )
          session.update_column(:blob, session_blob)
          wants.json do
            render json: {
              data: {
                success: true
              },
              message: "Story has been mark read successfully!"
            },
            status: :ok
          end
        else
          wants.json do
            render json: {
              data: {
                success: false
              },
              message: "Entry not found!"
            },
            status: 404
          end
        end
      end
    else
      render json: {
        data: {
          success: false
        },
        message: "No active session found!"
      }, status: 404
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
      response[:data][:roomRecords] = [] # method: `get_similar_artworks(image_id)` is replaced with stories in V3. Uncomment it, if Barnes need also in this room feature back
      response[:data][:show_story] = find_and_save_story_by?(image_id)
    end
    return response
  end

  ## Gets the image information for the specific id
  def get_image_information(image_id)
    # Request the image information from Elastic Search
    image_info = EsCachedRecord.search(image_id)

    # If short description exists
    if !image_info.nil? && image_info["shortDescription"]
      image_info["shortDescription"] = image_info["shortDescription"]

      # Translate if needed
      if preferred_language.present?
        image_info["shortDescription"] = Rails.cache.fetch("artworks-#{image_id.to_s}-#{preferred_language}-data", expires_in: 4.hours) do
          translate_text(image_info["shortDescription"])
        end
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
    return SnapTranslator.translate_short_desc(short_description, preferred_language)
  end

  ## Get artworks from the same room
  def get_similar_artworks(image_id)
    # Get the objects from the room
    viewed_images = session[ :user_scanned_history ] && !session[ :user_scanned_history ].blank? ? JSON.parse( session[ :user_scanned_history ] ) : []
    similar_arts = EsCachedRecord.find_similar_arts image_id, viewed_images
    return similar_arts
  end

  ## Fetch story from GraphQL
  def find_and_save_story_by?(image_id)
    session       = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
    session_blob  = !session.blob.is_a?(Hash) && session.blob == '{}' ? JSON.parse(session.blob) : session.blob
    story         = StoryFetcher.new.has_story?(image_id.to_i)

    return false if !story[:has_story]

    # if story is new
    if session_blob.empty? || !session_blob.has_key?(story[:story_id])
      session_blob[ story[:story_id] ] = { read_count: 1 }
      session.update_column(:blob, session_blob)
      return true
    end

    # if story has been read by user -- return true to show story anyway
    return true if session_blob[ story[:story_id] ].has_key?("read") && session_blob[ story[:story_id] ]["read"]

    # increment times it has been read
    if session_blob.keys.include?(story[:story_id])
        session_blob[ story[:story_id] ]["read_count"] += 1
		session.update_column(:blob, session_blob)
	end

    return true
  end

  def fetch_session
    if session[ :user_scanned_history ].present?
      @session             = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
      return @session
    else
      session[ :user_scanned_history ] = JSON.generate []
      @session             = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
      return @session
    end
  end
end

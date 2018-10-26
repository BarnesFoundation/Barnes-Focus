require 's3_store'

class ImageUploadJob < ApplicationJob
  queue_as ENV['SQS_QUEUE'].to_sym

  def performCuda(snap_id)
    # Save to S3
    snap_search_result = SnapSearchResult.find_by id: snap_id
    if snap_search_result
      image_data = Base64.decode64(snap_search_result.searched_image_data['data:image/jpeg;base64,'.length .. -1])
      file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
      File.open(file_name, 'wb') do |f|
        f.write image_data
      end
      file = CudaSift.new.loadFileData(file_name)

      if File.exists?(file.path)
        url = ''
        File.open(file.path) do |f|
         obj = S3Store.new(f).store
         url = obj.url
        end

        File.delete(file.path)

        #save search result and image captured URL in db for logging
        snap_search_result.searched_image_data = nil
        snap_search_result.searched_image_url = url
        snap_search_result.save
      end
    end

    #SnapSearchResult.create(searched_image_data: args[0], api_response: args[1][:response], es_response: args[1][:es_response], response_time: args[1][:response_time])
    #SnapSearchResult.create(searched_image_url: url, api_response: args[1][:response], es_response: args[1][:es_response], response_time: args[1][:response_time])
  end

  def perform(snap_id, image_file_path)

    # Get the object from the database
    snap_search_result = SnapSearchResult.find_by(id: snap_id)

    # If the result exists
    if snap_search_result
      
      stored_image_url = ''

      # Open the image file and store it in S3
      if File.exists?(image_file_path)
        File.open(image_file_path) do |file|
          stored_image = S3Store.new(file).store
          stored_image_url = stored_image.url
        end

        File.delete(image_file_path)

        # Save the search result with the url the image is located at
        snap_search_result.searched_image_data = nil
        snap_search_result.searched_image_url = stored_image_url
        snap_search_result.save
      end     
    end
  end

end

require 's3_store'

class ImageUploadJob < ApplicationJob
  queue_as ENV['SQS_QUEUE'].to_sym

  def perform(snap_id, image_uri)

    # Get the object from the database
    snap_search_result = SnapSearchResult.find_by(id: snap_id)

    # If the result exists
    if snap_search_result
      
      stored_image_url = ''

      image_data = Base64.decode64(image_uri['data:image/jpeg;base64,'.length .. -1])
      file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"

      # Open the image file and write the image data to it
      File.open(file_name, 'wb') do |file|
        file.write image_data
      end

      # Store the image in S3
      if File.exists?(file_name)
        File.open(file_name) do |file|
          stored_image = S3Store.new(file).store
          stored_image_url = stored_image.url
        end

        File.delete(file_name)
      end

      # Save the search result with the url the image is located at
      snap_search_result.searched_image_url = stored_image_url
      snap_search_result.save 
    end
  end

end

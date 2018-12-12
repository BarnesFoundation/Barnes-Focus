require 's3_store'

class ImageUploadJob < ApplicationJob
  queue_as ENV['SQS_QUEUE'].to_sym
 
  def perform(album_id, photo_id)
    @album = Album.find_by id: album_id

    if @album
      @photo = @album.photos.find_by id: photo_id

      if @photo
        image_data = Base64.decode64(@photo.searched_image_blob['data:image/jpeg;base64,'.length .. -1])
        file_name = "#{Rails.root.join('tmp') }/#{SecureRandom.hex}.png"
        stored_image_url = ''

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
        @photo.searched_image_blob = nil unless stored_image_url.blank?
        @photo.searched_image_s3_url = stored_image_url
        @photo.save
      end
    end
  end
end

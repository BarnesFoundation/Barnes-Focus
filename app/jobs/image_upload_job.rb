require 's3_store'

class ImageUploadJob < ApplicationJob
  queue_as ENV['SQS_QUEUE'].to_sym

  def perform(snap_id)
    # Save to S3
    snap_search_result = SnapSearchResult.find_by id: snap_id
    if snap_search_result
      unless snap_search_result.searched_image_url.blank?
        image_data = Base64.decode64(snap_search_result.searched_image_data['data:image/jpeg;base64,'.length .. -1])
        unless image_data.blank?
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
          end
          snap_search_result.save
        end
      end
    end

    #SnapSearchResult.create(searched_image_data: args[0], api_response: args[1][:response], es_response: args[1][:es_response], response_time: args[1][:response_time])
    #SnapSearchResult.create(searched_image_url: url, api_response: args[1][:response], es_response: args[1][:es_response], response_time: args[1][:response_time])
  end
end

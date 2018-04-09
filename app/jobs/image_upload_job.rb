require 's3_store'

class ImageUploadJob < ApplicationJob
  queue_as :image_processing_queue

  def perform(*args)
    # Save to S3
    snap_search_result = SnapSearchResult.new
    image_data = Base64.decode64(args[0]['data:image/png;base64,'.length .. -1])
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
      snap_search_result.searched_image_url = url
    else
      snap_search_result.searched_image_data = args[0]
    end
    snap_search_result.api_response = args[1][:response]
    snap_search_result.es_response = args[1][:es_response]
    snap_search_result.response_time = args[1][:response_time]
    snap_search_result.save

    #SnapSearchResult.create(searched_image_data: args[0], api_response: args[1][:response], es_response: args[1][:es_response], response_time: args[1][:response_time])
    #SnapSearchResult.create(searched_image_url: url, api_response: args[1][:response], es_response: args[1][:es_response], response_time: args[1][:response_time])
  end
end

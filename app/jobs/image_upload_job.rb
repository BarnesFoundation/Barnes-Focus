require 's3_store'

class ImageUploadJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # Save to S3
    if args[0] && File.exists?(args[0])
      url = ''
      File.open(args[0]) do |f|
       obj = S3Store.new(f).store
       url = obj.url
      end

      File.delete(args[0])

      #save search result and image captured URL in db for logging
      SnapSearchResult.create(searched_image_url: url, pastec_response: args[1][:pastec_response], es_response: args[1][:es_response])
    end
  end
end

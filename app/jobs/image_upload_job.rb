require 's3_store'

class ImageUploadJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # Save to S3
    if args[0] && File.exists?(args[0])
      File.open(args[0]) do |f|
       S3Store.new(f).store
      end

      File.delete(args[0])

      #save search result and image captured URL in db for logging
    end
  end
end

class ImageUploadJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # Save to S3
    if args[0] && File.exists?(args[0])
      File.open(args[0]) do |f|
       S3Store.new(f).store
      end

      File.delete(args[0])
    end
  end
end

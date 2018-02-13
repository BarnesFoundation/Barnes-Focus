class ImageUploadJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # Save to S3
    file = open(args[0])
    S3Store.new(file).store if file.present?
  end
end

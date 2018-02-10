class ImageUploadJob < ApplicationJob
  queue_as :default

  def perform(*args)
    puts args
    # Save to S3
    # file = S3Store.new(file).store
  end
end

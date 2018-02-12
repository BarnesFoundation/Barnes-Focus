require 'aws-sdk-s3'

class S3Store
  def initialize file
    @file     = file
    @aws_data = Rails.application.secrets[:aws]
    @s3       = Aws::S3::Resource.new(region:@aws_data[:region])
    @bucket   = @s3.bucket(@aws_data[:s3_bucket_name])
  end

  def store
    @obj = @bucket.object(filename).upload_file(@file.path)
    self
  end

  def url
    @obj.public_url.to_s
  end

  private
  def filename
    @filename ||= @file.path.split('/').last
  end
end
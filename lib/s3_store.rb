require 'aws-sdk'

class S3Store
  def initialize file
    @file     = file
    @aws_data = Rails.application.secrets[:aws]
    @s3       = Aws::S3::Resource.new(
      region: @aws_data[:region],
      access_key_id: @aws_data[:access_key_id],
      secret_access_key: @aws_data[:secret_access_key]
    )
    @bucket   = @s3.bucket(@aws_data[:s3_bucket_name])
  end

  def store
    @obj = @bucket.object(filename).upload_file(@file.path, acl: 'public-read')
    self
  end

  def url
    @bucket.object(filename).public_url.to_s
  end

  private
  def filename
    @filename ||= @file.path.split('/').last
  end
end
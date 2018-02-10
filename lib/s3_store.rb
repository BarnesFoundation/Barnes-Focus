require 'aws-sdk'

class S3Store
  def initialize file
    @file     = file
    @aws_data = Rails.application.secrets[:aws]
    AWS.config(access_key_id: @aws_data[:access_key_id], secret_access_key: @aws_data[:secret_access_key])
    @s3       = AWS::S3.new
    @bucket   = @s3.buckets[@aws_data[:s3_bucket_name]]
  end

  def store
    @obj = @bucket.objects[filename].write(file: @file.path, acl: :public_read)
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


def process_searched_images_response searched_images
  response = { }
  response["data"] = {"records" => [], "message" => "No records found"}
  response["success"] = false
  response["pastec_data"] = []
  case searched_images["type"]
    when Pastec::RESPONSE_CODES[:SEARCH_RESULTS]
      response["success"] = true
      get_similar_images(searched_images["image_ids"], response)
      #Add response from pastec to final result
      pastec_result = TrainingRecord.where(identifier: searched_images["image_ids"])
      pastec_result.each do |img|
        response["pastec_data"] << {"image_id" => img.identifier, "image_url" => img.image_url}
      end
    when Pastec::RESPONSE_CODES[:IMAGE_NOT_DECODED]
      response["data"]["message"] = "Invalid image data"
    when Pastec::RESPONSE_CODES[:IMAGE_SIZE_TOO_BIG]
      response["data"]["message"] = "Image size is too big"
    when Pastec::RESPONSE_CODES[:IMAGE_SIZE_TOO_SMALL]
      response["data"]["message"] = "Image size is too small"
  end
  response
end

def get_similar_images image_ids, response
  if image_ids.present?
    response["data"]["message"] = 'Result Found'
    image_ids.uniq!
    #send these image_ids to elastic search to get recommended result and send list to API
    image_ids.each do |img|
      response["data"]["records"] << BarnesElasticSearch.instance.get_object(img)
    end
  end
  response
end

@aws_data = Rails.application.secrets[:aws]
@s3       = Aws::S3::Resource.new(region:@aws_data[:region])
@bucket   = @s3.bucket("images-iphone")
pastec_obj = Pastec.new

@bucket.objects.each do |obj|
  pastec_response = pastec_obj.search_image(obj.get.body.read)
  searched_result = process_searched_images_response(pastec_response)
  SnapSearchResult.create(searched_image_url: obj.public_url, pastec_response: pastec_response, es_response: searched_result["data"])
end
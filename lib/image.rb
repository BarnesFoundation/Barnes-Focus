module Image
  def s3_url(id, secret)
    "https://barnes-data-processing-production.s3.amazonaws.com/" + id.to_s + "_" + secret + "_n.jpg"
  end
  module_function :s3_url

  def imgix_url(id, secret)
    "https://barnes-images.imgix.net/" + id.to_s + "_" + secret + "_b.jpg"
  end
  module_function :imgix_url
end
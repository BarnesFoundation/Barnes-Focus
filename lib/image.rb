module Image
  def s3_url(id, secret)
    "https://barnes-image-repository.s3.amazonaws.com/images/" + id.to_s + "_" + secret + "_n.jpg"
  end
  module_function :s3_url

  def imgix_url(id, secret)
    "https://barnes-image-repository.imgix.net/images/" + id.to_s + "_" + secret + "_b.jpg?crop=entropy"
  end
  module_function :imgix_url
end
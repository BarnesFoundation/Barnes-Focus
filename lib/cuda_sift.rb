require 'rest-client'
require 'json'
require 'csv'
require 'open-uri'

class CudaSift
  attr_accessor :endpoints

  RESPONSE_CODES={
    IMAGE_ADDED: "IMAGE_ADDED",
    SEARCH_RESULTS: "SEARCH_RESULTS",
    IMAGE_REMOVED: "IMAGE_REMOVED",
    IMAGE_SIZE_TOO_BIG: "IMAGE_SIZE_TOO_BIG",
    IMAGE_SIZE_TOO_SMALL: "IMAGE_SIZE_TOO_SMALL",
    IMAGE_NOT_FOUND: "IMAGE_NOT_FOUND",
    IMAGE_NOT_DECODED: "IMAGE_NOT_DECODED"
  }


  def initialize
    self.endpoints = ENV['CUDASIFT_ENDPOINTS'].split(',').map(&:strip).uniq
  end


  #Data: the binary data of the request image compressed in JPEG
  #Answer: "SEARCH_RESULTS" as type field and a list of the the matched image ids from the most to the least relevant one in the "image_ids" field
  #Possible error types: "IMAGE_NOT_DECODED", "IMAGE_SIZE_TOO_BIG", "IMAGE_SIZE_TOO_SMALL"
  def search_image(image_data)
    all_results = []
    threads = endpoints.map{|end_point| Thread.new{ find_image(image_data, end_point, all_results) }}
    threads.each(&:join)
    images_found = {"results" => [], "type" => ""}
    all_results.each do |res|
      if res["type"] == RESPONSE_CODES[:SEARCH_RESULTS]
        images_found["results"] += res["results"]
        images_found["type"] = res["type"]
      elsif res["type"] != RESPONSE_CODES[:SEARCH_RESULTS]
        images_found["type"] = res["type"]
      end
    end
    #images_found["results"].sort_by! {|_key, value| value}
    #images_found["results"].sort_by! { |x| - x.values.first } # 1 of 2 - solution for sort
    images_found["results"] = images_found["results"].sort_by(&:values).reverse # 2 of 2 - solution for sort
    images_found
  end

  # read file data from given path
  # return file object if invalid operation then return false
  def loadFileData(image_path)
    begin
      image_file = open(image_path, 'rb')
    rescue Exception => ex
      return false
    end
  end


  def json_response(response)
    JSON.parse response.body
  end

  def url_search_image end_point_url
    full_url(end_point_url,"index/searcher")
  end

  def full_url(end_point_url, path)
    "#{end_point_url}/#{path}"
  end

  def find_image(image_data, server_end_point, result)
    #response = RestClient.post(url_search_image(server_end_point), image_data)
    # uri = URI.parse(url_search_image(server_end_point))
    # request = Net::HTTP::Post.new(uri)
    # request.body = ''
    # request.body << image_data.read.delete("\r\n")
    # request.content_type = 'multipart/form-data'
    #
    # response = Net::HTTP.start(uri.hostname, uri.port, {}) do |http|
    #   http.request(request)
    # end
    response = `curl -X POST --data-binary @#{image_data.path} #{url_search_image(server_end_point)}`
    result << JSON.parse(response)
  end
end
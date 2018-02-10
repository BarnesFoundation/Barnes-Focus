require 'rest-client'
require 'json'
require 'csv'
require 'open-uri'

class Pastec
  attr_accessor :endpoint

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
    self.endpoint = ENV['PASTEC_ENDPOINT']
  end

  def ids_in_index
    response = RestClient.get url_index_imageIds
    data = json_response(response)
    data['image_ids']
  end

  def load_csv
    csv_path = File.join(Rails.root, 'db', 'SNAP_Prototype_Training_Data.csv')
    `gunzip -c #{csv_path}.gz > #{csv_path}`
    CSV.foreach(csv_path, headers: true) do |row|
      tr = TrainingRecord.where(identifier: row['id']).first_or_initialize
      pp row['URL']
      tr.image_url = row['URL']
      tr.title = row['Title']
      tr.artist = row['Artist']
      tr.accession = row['Accession']
      tr.save
      begin
        tr.index! if !tr.indexed?
      rescue AASM::InvalidTransition => ex
        puts "AASM::InvalidTransition: #{ex.message}"
        puts ex.backtrace
      end
    end
    `rm -f #{csv_path}`
  end

  #Answer type: "IMAGE_ADDED"
  #Possible error types: "IMAGE_NOT_DECODED", "IMAGE_SIZE_TOO_BIG", "IMAGE_SIZE_TOO_SMALL"
  def index_image(image_url, identifier)
    begin
      file = open(image_url, 'rb')
    rescue Exception => ex
      return false
    end
    response = RestClient.put(url_index_image(identifier), file)
    json_response(response)
  end

  # Answer type: "IMAGE_REMOVED"
  # Possible error type: "IMAGE_NOT_FOUND"
  def remove_image(identifier)
    response = RestClient.delete url_index_image(identifier)
    json_response(response)
  end


  #Data: the binary data of the request image compressed in JPEG
  #Answer: "SEARCH_RESULTS" as type field and a list of the the matched image ids from the most to the least relevant one in the "image_ids" field
  #Possible error types: "IMAGE_NOT_DECODED", "IMAGE_SIZE_TOO_BIG", "IMAGE_SIZE_TOO_SMALL"
  def search_image(image_data)
    response = RestClient.post(url_search_image, image_data)
    json_response(response)
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

  protected

  def json_response(response)
    JSON.parse response.body
  end

  def url_index_image(identifier)
    full_url("index/images/#{identifier}")
  end

  def url_index_imageIds
    full_url("index/imageIds")
  end

  def url_search_image
    full_url("index/searcher")
  end

  def full_url(path)
    "#{self.endpoint}/#{path}"
  end

end
require 'rest-client'
require 'json'
require 'csv'
require 'open-uri'

class Pastec
  attr_accessor :endpoint

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

  def full_url(path)
    "#{self.endpoint}/#{path}"
  end

end
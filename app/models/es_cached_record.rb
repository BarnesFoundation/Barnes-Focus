require 'barnes_elastic_search'

class EsCachedRecord < ApplicationRecord
  store :es_data, coder: JSON, accessors: [
    'id', 'imageSecret', 'title', 'shortDescription', 'people', 'classification', 'locations', 'medium', 'url', 'invno', 'displayDate'
  ]
  validates :image_id, presence: true

  @es_fields = ['id', 'imageSecret', 'title', 'shortDescription', 'people', 'classification', 'locations', 'medium', 'url', 'invno', 'displayDate', 'dimensions', 'objRightsTypeID', 'creditLine', 'room']

  ## Determines whether a cached record has expired data or not
  def not_expired?

    expired = false

    # If last fetch time isn't blank
    unless last_es_fetched_at.blank?
      expired = true if last_es_fetched_at.between?(DateTime.now - 4.hours)
    end
    return expired
  end

  ## Returns the cached data for a provided image id 
  def self.search img_id

    searched_data = nil

    # Search for the record, create new one if none exists
    es_cached_record = find_by image_id: img_id #find_or_create_by image_id: img_id
    es_cached_record = new(image_id: img_id) if es_cached_record.nil?

    # If it's a new record or has no es data
    if es_cached_record.new_record? || es_cached_record.es_data.blank?

      # Query elastic search for the data and save it
      searched_data = connect_with_es_endpoint(img_id)
      es_cached_record.es_data = searched_data
      es_cached_record.last_es_fetched_at = DateTime.now
      es_cached_record.save
    else
      searched_data = es_cached_record.es_data
    end
    
    # Build the image url for the record
    searched_data['art_url'] = Image.imgix_url(searched_data['id'], searched_data['imageSecret']) unless searched_data.nil? # for s3 use ~> Image.s3_url(searched_data['id'], searched_data['imageSecret'])

    return searched_data
  end

  ## Retrieves the object data from elastic search for a provided image id
  def self.connect_with_es_endpoint image_id
    # Query elastic search and extract the desired fields
    searched_data = BarnesElasticSearch.instance.get_object(image_id).slice(*@es_fields)

    return searched_data
  end
end

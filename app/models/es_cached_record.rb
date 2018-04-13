require 'barnes_elastic_search'

class EsCachedRecord < ApplicationRecord
  store :es_data, coder: JSON, accessors: [
    'id', 'imageSecret', 'title', 'shortDescription', 'people', 'classification', 'locations', 'medium', 'url', 'invno', 'displayDate'
  ]

  validates :image_id, presence: true

  def not_expired?
    expired = false
    unless last_es_fetched_at.blank?
      expired = true if last_es_fetched_at.between?(DateTime.now - 4.hours)
    end
    expired
  end

  def self.search img_id
    searched_data = nil
    es_cached_record = find_by image_id: img_id #find_or_create_by image_id: img_id
    es_cached_record = new(image_id: img_id) if es_cached_record.nil?

    if es_cached_record.new_record? || es_cached_record.es_data.blank?
      searched_data = BarnesElasticSearch.instance.get_object(img_id)
      searched_data = searched_data.slice(
        'id', 'imageSecret', 'title', 'shortDescription', 'people', 'classification', 'locations', 'medium', 'url', 'invno', 'displayDate'
      )
      es_cached_record.es_data = searched_data
      es_cached_record.last_es_fetched_at = DateTime.now
      es_cached_record.save
    else
      searched_data = es_cached_record.es_data
    end
    searched_data['art_url'] = Image.imgix_url(searched_data['id'], searched_data['imageSecret']) unless searched_data.nil? # for s3 use ~> Image.s3_url(searched_data['id'], searched_data['imageSecret'])

    searched_data
  end
end

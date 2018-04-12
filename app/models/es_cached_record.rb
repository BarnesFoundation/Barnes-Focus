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
end

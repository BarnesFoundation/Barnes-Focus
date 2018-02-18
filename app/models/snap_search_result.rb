class SnapSearchResult < ApplicationRecord
  serialize :pastec_response
  serialize :es_response

  scope :recent, -> { order("id desc").limit(10) }
end

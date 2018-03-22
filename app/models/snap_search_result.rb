class SnapSearchResult < ApplicationRecord
  serialize :api_response
  serialize :es_response

  scope :recent, -> { order("id desc").limit(10) }
end

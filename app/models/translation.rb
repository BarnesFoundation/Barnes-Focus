class Translation < ApplicationRecord
  scope :all_parents, -> { where(parent_id: nil) }
  scope :all_childrens, ->(parent_id) { where(parent_id: parent_id) }
end